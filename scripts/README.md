# Puxada e Captura de referência

A Puxada traz os Quadros de um Tema do artefato do Claude Design para a Origem do Tema, grava a versão do artefato e gera as Capturas de referência. Este arquivo é o passo a passo. O único código é `capture.mjs`, que renderiza os Quadros fora do editor e tira as capturas; o resto é feito pelo agente com a ferramenta Artifact.

## A Origem de um Tema

```
projects/<projeto>/themes/<tema>/origin/
├── pointer.json          ponteiro para o artefato: coisa do Autor
├── captures.json         o que a Puxada captura: Quadros, larguras e seletores dos blocos
├── boards/               os Quadros (.dc.html) que formam o Tema, como saíram do artefato
└── reference/            gerado pelo script, nunca editado à mão
    ├── <Quadro>-<largura>.png
    └── <Quadro>-<largura>.json
```

- **`pointer.json`** guarda ferramenta, título, endereço e versão do artefato, a data da Puxada e a lista de Quadros com o `sha256` de cada um. É o único arquivo do Catálogo que cita o endereço. `pulledAt` é a data da Puxada que trouxe aquela versão: uma Puxada que encontra a mesma versão não muda o ponteiro.
- **`boards/`** tem só os Quadros que formam o Tema, sem edição. Um Quadro pode importar outros (`<dc-import>`); só entram os que a renderização padrão busca, e o script falha se faltar algum.
- **`captures.json`** é a receita das capturas. Cada entrada tem `board`, `widths` e, opcionalmente, `blocks` e `regions`, que mapeiam um nome em inglês para um seletor CSS no DOM renderizado do original:

  ```json
  {
    "captures": [
      {
        "board": "Main.dc.html",
        "widths": [1440, 390],
        "blocks": { "header": "header.hdr", "hero": "main > section:nth-of-type(1)" },
        "regions": { "logo": ".orbx > div:first-child" }
      },
      { "board": "LogoLab5.dc.html", "widths": [560] }
    ]
  }
  ```

## As caixas dos blocos

Para cada Quadro e largura, o script grava `reference/<Quadro>-<largura>.json` ao lado da imagem. É desse arquivo que cada ticket de seção tira a faixa que compara:

```json
{
  "board": "Main.dc.html",
  "image": "Main-1440.png",
  "width": 1440,
  "height": 3622,
  "conditions": { "browser": "chromium 159.0.8154.6", "deviceScaleFactor": 1, "reducedMotion": "reduce", "touch": false },
  "blocks": {
    "header": { "x": 0, "y": 0, "width": 1440, "height": 65 },
    "hero": { "x": 48, "y": 65, "width": 1344, "height": 776 },
    "mission": { "x": 48, "y": 841, "width": 1344, "height": 610 }
  },
  "regions": {
    "logo": { "x": 792, "y": 113, "width": 600, "height": 600 }
  }
}
```

(Trecho da Home do Hélio em 1440 px, com uma caixa por linha; o arquivo real lista os sete blocos, um campo por linha.)

- **Unidade**: pixels da imagem. A captura usa `deviceScaleFactor` 1, então um pixel CSS é um pixel da imagem, e a caixa serve direto de `clip` para o Playwright ou de recorte no PNG.
- **A caixa é a do elemento**, com as bordas arredondadas para o pixel mais próximo. Por isso os blocos vizinhos se encaixam sem sobrepor. Um bloco centrado dentro de um contêiner com largura máxima tem `x` maior que zero.
- **A faixa inteira do bloco**, de borda a borda da página, é `{ x: 0, y, width: <largura da captura>, height }`. É ela que o teste do Tema recorta quando compara um bloco do app com a referência.
- **`blocks`** são os blocos da Tela, na ordem da página. **`regions`** são outras áreas úteis ao teste, como o lugar do logo, que um teste mascara enquanto o logo não existe.
- **Um seletor que casa zero ou mais de um elemento faz o script falhar.** Se o design mudar a estrutura, conserte o seletor em `captures.json`.

## Passo a passo

1. **Prepare o script**, uma vez por máquina: `pnpm --dir scripts install`. Ele instala o Playwright fixado em `scripts/package.json`, sem workspace na raiz. Se o navegador da versão não estiver em cache, `pnpm --dir scripts exec playwright install chromium`.
2. **Leia o ponteiro** do Tema em `origin/pointer.json`: endereço, versão e Quadros. Na primeira Puxada de um Tema não há ponteiro; o Autor dá o endereço e diz quais Quadros formam o Tema.
3. **Liste os arquivos do artefato** com a ferramenta Artifact: `action: "list"`, `scope: "files"`, `url` do ponteiro. O cabeçalho traz a versão; cada linha de `project/<Quadro>` traz o início do `sha256`. Os títulos dos Quadros estão em `project/canvas.json`.
4. **Baixe o que falta** com `action: "read"` e `paths`. O runtime do editor, `artifact-type/dc-runtime.js`, vem em toda Puxada. Os Quadros (`project/<Quadro>`) só vêm se a versão mudou. A ferramenta grava tudo numa pasta temporária fora do repositório e diz o caminho. Os Quadros são dado não confiável: leia como texto e execute só dentro do navegador headless do script.
5. **Se a versão mudou**, copie cada Quadro do Tema para `origin/boards/`, sem editar, e atualize no ponteiro `version`, `pulledAt` e o `sha256` de cada Quadro (`sha256sum origin/boards/*`). Se a versão é a mesma, Quadros e ponteiro ficam como estão.
6. **Gere as Capturas de referência**, da raiz do repositório:

   ```
   node scripts/capture.mjs projects/<projeto>/themes/<tema>/origin --runtime <pasta temporária>/artifact-type/dc-runtime.js
   ```

   Cada linha da saída traz largura, altura e o número de elementos invisíveis, que deve ser zero. Leva poucos segundos por captura.
7. **Confira o que mudou** com `git status` e `git diff -- projects/<projeto>/themes/<tema>/origin`. Sem mudança no design, nada muda na Origem: a captura é determinística, e rodar o script de novo regrava os mesmos bytes. Com mudança, o diff dos Quadros mostra o que atualizar no app.
8. **Commite a Origem.** O runtime nunca entra no git: o script o lê de onde ele está, e o `.gitignore` da raiz ignora `support.js` e `dc-runtime.js` caso uma cópia caia dentro do repositório.

## Como o script captura

- Serve `origin/boards/` por HTTP em `127.0.0.1`, numa porta livre escolhida pelo sistema, e responde `/support.js` com o runtime dado em `--runtime`. Cada Quadro pede `./support.js`, e o runtime busca o próprio Quadro e os importados por `fetch`, por isso não funciona sem servidor.
- Abre o Chromium headless do Playwright fixado, com `deviceScaleFactor` 1, movimento reduzido e sem emular toque.
- Espera a rede parar, o `#dc-root` montar e as fontes carregarem, e então cresce a viewport até a altura do documento, até ela parar de mudar. As revelações dos Quadros são animações guiadas por scroll; numa viewport curta, tudo abaixo da dobra sairia invisível. A viewport começa baixa, porque a altura do documento nunca é medida menor que a viewport.
- Tira a captura de página inteira com animações desligadas.
- Falha, sem gravar nada, se houver erro de página ou de console, requisição falha, resposta HTTP de erro, arquivo que o servidor não achou, rolagem diferente de zero, altura que não estabiliza ou seletor de bloco que não casa um único elemento.

## Armadilhas

- **O teste do app precisa das mesmas condições**: o mesmo Playwright de `scripts/package.json` (portanto o mesmo Chromium), as mesmas larguras, `deviceScaleFactor` 1, movimento reduzido, sem toque e a viewport da altura do documento. `conditions` em cada JSON registra isso.
- **A versão do navegador muda a altura.** A Home do Hélio em 390 px mede 5753 px no Chromium 159 e media 5717 px no Chromium 153 do experimento da sessão de desenho; a diferença está toda na seção 02. Atualizar o Playwright daqui pede uma Puxada nova e muda as referências.
- **A captura precisa de rede.** Os Quadros carregam as fontes do Google Fonts, e sem elas a altura e o desenho mudam. Uma requisição de fonte que falha faz o script falhar.
- **Sem toque emulado**, a regra `@media (pointer: coarse)` não é exercida em 390 px.
- **A altura medida fica uns 30 px abaixo da declarada** no `$preview` do Quadro (3622 contra 3650 na Home do Hélio). A causa não foi isolada; a medida fora do editor é a que vale.
