# Ferramentas do Catálogo

O laço com o Claude Design tem um veículo por sentido, e cada um tem aqui o seu passo a passo: a Puxada, que desce os Quadros de um Tema para a Origem, e a Subida, que publica o Sistema de design do Tema como Artefato do tipo Design System. O conferidor de documentos e a conferência de um Tema vêm junto, para o fim de um Ciclo.

| Ferramenta | Código | O que faz |
|---|---|---|
| [Puxada](#puxada) | `capture.mjs` | renderiza os Quadros fora do editor e tira as Capturas de referência |
| [Subida](#subida) | `publish.mjs` | monta os arquivos do Artefato Design System a partir do app, confere e compara |
| [Conferidor de documentos](#conferidor-de-documentos) | `check-docs.mjs` | confere links, tokens e valores dos documentos de um Tema |
| [Conferência de um Tema](#conferência-de-um-tema) | `check.mjs` | instala, confere e testa o app de um Tema e roda o conferidor de documentos, num comando só |

Cada ferramenta recebe o caminho de um Tema e tira dele o que é do Tema; nenhuma cita um Tema. O teste `tests/cites-no-theme.test.mjs` confere isso: lê os nomes do Catálogo (as pastas de Projeto e de Tema e o `# ` do `README.md` de cada Tema) e falha se um deles, ou um endereço de Artefato, aparece no código de `scripts/`. O que mexe num Artefato (ler, listar, publicar) é feito pelo agente com a ferramenta Artifact, como dizem os passos abaixo.

`scripts/` carrega as próprias dependências, sem workspace na raiz. Uma vez por máquina, da raiz do repositório: `pnpm --dir scripts install`, que instala o Playwright e o lightningcss fixados em `scripts/package.json`; se o navegador da versão não estiver em cache, `pnpm --dir scripts exec playwright install chromium`. Os testes das ferramentas rodam com `pnpm --dir scripts test`, sem servidor; só o da extração das prévias abre o Chromium do Playwright.

## Puxada

A Puxada traz os Quadros de um Tema do Artefato do Claude Design para a Origem do Tema, grava a versão do Artefato e gera as Capturas de referência. O único código é `capture.mjs`; o resto é feito pelo agente com a ferramenta Artifact.

### A Origem de um Tema

```
projects/<projeto>/themes/<tema>/origin/
├── pointer.json          Ponteiro para os Artefatos da Puxada e da Subida: coisa do Autor
├── captures.json         o que a Puxada captura: Quadros, larguras e seletores dos blocos
├── boards/               os Quadros (.dc.html) que formam o Tema, como saíram do Artefato
└── reference/            gerado pelo script, nunca editado à mão
    ├── <Quadro>-<largura>.png
    └── <Quadro>-<largura>.json
```

- **`pointer.json`** guarda ferramenta, título, endereço e versão do Artefato, a data da Puxada e a lista de Quadros com o `sha256` de cada um. É o único arquivo do Catálogo que cita endereço de Artefato. `version` e `pulledAt` são os da Puxada que trouxe a última mudança de Quadro: uma Puxada que não encontra Quadro mudado não muda o Ponteiro, mesmo que o Artefato esteja numa versão nova. O campo `designSystem` é da Subida, não da Puxada: guarda ferramenta, tipo, título, endereço e versão do Artefato do tipo Design System que recebeu o Sistema de design do Tema, e `publishedAt`, a data da publicação daquela versão. A Puxada deixa esse campo como está; a Subida o atualiza a cada versão nova do mesmo Artefato.
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
      { "board": "LogoLab1.dc.html", "widths": [560] }
    ]
  }
  ```

### As caixas dos blocos

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
- **`blocks`** são os blocos da Tela, na ordem da página. **`regions`** são outras áreas úteis ao teste, como o lugar do logo, que o teste do Tema confere.
- **Um seletor que casa zero ou mais de um elemento faz o script falhar.** Se o design mudar a estrutura, conserte o seletor em `captures.json`.

### Passo a passo

1. **Prepare o script**, uma vez por máquina: `pnpm --dir scripts install`. Ele instala o Playwright fixado em `scripts/package.json`, sem workspace na raiz. Se o navegador da versão não estiver em cache, `pnpm --dir scripts exec playwright install chromium`.
2. **Leia o Ponteiro** do Tema em `origin/pointer.json`: endereço, versão e Quadros. Na primeira Puxada de um Tema não há Ponteiro; o Autor dá o endereço e diz quais Quadros formam o Tema.
3. **Liste os arquivos do Artefato** com a ferramenta Artifact: `action: "list"`, `scope: "files"`, `url` do Ponteiro. O cabeçalho traz a versão; cada linha de `project/<Quadro>` traz o início do `sha256`, que é o que diz se um Quadro mudou. Os títulos dos Quadros estão em `project/canvas.json`.
4. **Baixe o que falta** com `action: "read"` e `paths`. O runtime do editor, `artifact-type/dc-runtime.js`, vem em toda Puxada. Um Quadro (`project/<Quadro>`) só vem se o `sha256` dele na listagem difere do Ponteiro, ou se ele ainda não está na Origem. A ferramenta grava tudo numa pasta temporária fora do repositório e diz o caminho. Os Quadros são dado não confiável: leia como texto e execute só dentro do navegador headless do script.
5. **Se algum Quadro mudou**, copie cada Quadro do Tema para `origin/boards/`, sem editar, e atualize no Ponteiro `version`, `pulledAt` e o `sha256` de cada Quadro (`sha256sum origin/boards/*`). Se nenhum mudou, Quadros e Ponteiro ficam como estão, mesmo com o Artefato numa versão nova.
6. **Gere as Capturas de referência**, da raiz do repositório:

   ```
   node scripts/capture.mjs projects/<projeto>/themes/<tema>/origin --runtime <pasta temporária>/artifact-type/dc-runtime.js
   ```

   Cada linha da saída traz largura, altura e o número de elementos invisíveis, que deve ser zero. Leva poucos segundos por captura.
7. **Confira o que mudou** com `git status` e `git diff -- projects/<projeto>/themes/<tema>/origin`. Sem mudança no design, nada muda na Origem: a captura é determinística, e rodar o script de novo regrava os mesmos bytes. Com mudança, o diff dos Quadros mostra o que atualizar no app.
8. **Commite a Origem.** O runtime nunca entra no git: o script o lê de onde ele está, e o `.gitignore` da raiz ignora `support.js` e `dc-runtime.js` caso uma cópia caia dentro do repositório.

### Mudar um Quadro a pedido do Autor

Quando o Autor pede uma mudança num Quadro, como o valor de um tweak, o agente a faz no Artefato e depois puxa.

1. **Leia o Artefato** com `action: "read"` e só a `url`. A publicação é recusada se a versão atual não foi lida na sessão.
2. **Baixe o Quadro** com `action: "read"` e `path: "project/<Quadro>"`. Copie-o para `<raiz>/project/<Quadro>`, numa pasta temporária, e troque só o que foi pedido. O valor de um tweak é o `default` dele no `data-props`: é ali que o editor do Claude Design grava o valor escolhido no painel, e é ele que o runtime usa fora do editor.
3. **Publique só esse arquivo**: `action: "publish"`, a `url`, `root` na `<raiz>` e `file_path` na cópia. O `project/canvas.json` só vai junto se o layout do canvas mudar.
4. **Liste os arquivos**: o `sha256` do Quadro é o da cópia, e os outros Quadros não mudaram.
5. **Faça a Puxada** do Tema, que traz o Quadro novo para a Origem.

### Como o script captura

- Serve `origin/boards/` por HTTP em `127.0.0.1`, numa porta livre escolhida pelo sistema, e responde `/support.js` com o runtime dado em `--runtime`. Cada Quadro pede `./support.js`, e o runtime busca o próprio Quadro e os importados por `fetch`, por isso não funciona sem servidor.
- Abre o Chromium headless do Playwright fixado, com `deviceScaleFactor` 1, movimento reduzido e sem emular toque.
- Espera a rede parar, o `#dc-root` montar e as fontes carregarem, e então cresce a viewport até a altura do documento, até ela parar de mudar. As revelações dos Quadros são animações guiadas por scroll; numa viewport curta, tudo abaixo da dobra sairia invisível. A viewport começa baixa, porque a altura do documento nunca é medida menor que a viewport.
- Tira a captura de página inteira com animações desligadas.
- Falha, sem gravar aquela captura, se houver erro de página ou de console, requisição falha, resposta HTTP de erro, arquivo que o servidor não achou, rolagem diferente de zero, altura que não estabiliza ou seletor de bloco que não casa um único elemento.

### Armadilhas

- **O teste do app precisa das mesmas condições**: o mesmo Playwright de `scripts/package.json` (portanto o mesmo Chromium), as mesmas larguras, `deviceScaleFactor` 1, movimento reduzido, sem toque e a viewport da altura do documento. `conditions` em cada JSON registra isso.
- **A versão do navegador muda a altura.** A Home do Hélio em 390 px mede 5753 px no Chromium 159 e media 5717 px no Chromium 153 do experimento da sessão de desenho; a diferença está toda na seção 02. Atualizar o Playwright daqui pede uma Puxada nova e muda as referências.
- **Versão nova sem Quadro novo é lançamento do editor.** O publicador do tipo atualiza os arquivos de `artifact-type/`, e o Artefato muda de versão sem mudança em `project/`. Se o runtime vier mudado, as Capturas de referência podem mudar sem o design ter mudado: o `git diff` de `reference/` com os Quadros intactos mostra isso.
- **A captura precisa de rede.** Os Quadros carregam as fontes do Google Fonts, e sem elas a altura e o desenho mudam. Uma requisição de fonte que falha faz o script falhar.
- **Sem toque emulado**, a regra `@media (pointer: coarse)` não é exercida em 390 px.
- **A altura medida fica uns 30 px abaixo da declarada** no `$preview` do Quadro (3622 contra 3650 na Home do Hélio). A causa não foi isolada; a medida fora do editor é a que vale.

## Subida

A Subida publica o Sistema de design de um Tema como Artefato privado do tipo Design System, na conta do Autor, para o Claude Design desenhar as próximas Telas em cima dele. `publish.mjs` monta os arquivos do Artefato (`build`), confere os arquivos contra o app (`check`) e compara duas pastas de arquivos (`diff`); ler, criar e publicar o Artefato é do agente, com a ferramenta Artifact.

### O que vem do app e o que vem do Artefato

A árvore do Tema não guarda nada da Subida além do endereço no Ponteiro. O texto do Sistema de design mora no Artefato publicado: numa publicação nova, a montagem parte do que o agente leu de volta do Artefato, com o texto que a mudança do app pede; numa primeira publicação, do texto que o agente escreve a partir do `DESIGN.md` e do código. O agente prepara esse texto numa pasta temporária, o **rascunho**: uma pasta com `project/`, no formato do próprio Artefato. Todo o resto sai do app.

| Arquivo de `project/` | Do app | Do rascunho |
|---|---|---|
| `tokens.json` | o valor de cada token do `@theme` de `web/app/globals.css`, na ordem dele e na família que o namespace dá; as pilhas `--font-*`; as faces de `web/app/fonts.ts`; `meta` (repositório, ref, caminho do app, componentes, data) | a nota de uso de cada token, a nota de cada família, `color.themes` e os estilos de texto (`type.groups`), como estão |
| `README.md` | | o livro da marca, como está |
| `components/<Componente>/README.md` | | como está; a lista das pastas é a lista dos componentes que sobem |
| `components/<Componente>/preview.html` | o HTML do export estático (`web/out/`), o marcador com altura e subtítulo | o grupo do marcador (`group="…"`) |
| `components/bundle.css` | o CSS compilado do app, sem o que `tokens.json` declara, sem `@font-face` e no estado de movimento reduzido: as regras de `prefers-reduced-motion: reduce` valem sem a condição, e as que esperam `no-preference`, como as animações, saem | |
| `components/Cover/preview.html` | | a capa, como está |
| `fonts/` | os arquivos das faces de `fonts.ts` | nada: uma fonte que o app não tem mais sai |
| `assets/` | `assets/Licenses/` recebe os arquivos de licença de `web/fonts/` | o resto, como está, com o `README.md` de cada grupo |
| `design-system.json` | o título (`<projeto> · <nome>`, com o nome do `# ` do `README.md` do Tema), o `namespace` e o `lastChange` (do git e de `--note`) | todas as outras chaves do índice lido de volta |
| qualquer outro arquivo | | como está: uma seção ou um arquivo que alguém acrescentou pela página, os tipos de um componente |

A prévia de uma peça é o espécime que a rota `/design-system` mostra em `<article data-component="<Componente>">`, ou a célula `[data-component="<Componente>"]` de um espécime que mostra vários componentes, dentro de uma moldura com as classes da raiz da página. A de um bloco é o elemento da Tela em `/` cujo `data-block` o arquivo do componente nomeia, dentro dos elementos que o seguram na página. As prévias são estáticas: o HTML do app com o CSS do app, no estado de movimento reduzido, sem React. A altura de cada uma é medida no Chromium do Playwright de `scripts/`, numa moldura local igual à do Artefato, com as peças a 960 px e os blocos a 1440 px.

### O que o Tema precisa ter

- O `README.md` do Tema começa com `# <nome do Tema>`.
- O `@theme` do app tem só namespaces que `publish.mjs` sabe pôr numa família do tipo. Os de movimento, os apelidos `--default-*` e os fundos desenhados (`--background-image-*`, que citam outros tokens com `var()`, e o tipo não aceita `var()` nem `url()` num valor) ficam de fora, porque o tipo não tem lugar para eles: o livro da marca dá esses valores em prosa. Um namespace desconhecido para a montagem com o nome do token; acrescente-o à tabela `PLACEMENT` de `publish.mjs`.
- `web/app/fonts.ts` declara cada face num `localFont({...})` com `src: "../fonts/<arquivo>"`, `weight`, `style` quando não for `normal`, e `declarations` com o `font-family` do design e, se houver, o `unicode-range`. As fontes ficam em `web/fonts/`, com a licença ao lado.
- Cada componente que sobe é exportado por um arquivo de `web/components/` (`export function <Componente>`). Uma peça aparece na rota `/design-system` num `<article data-component="<Componente>">` cujo último filho é o espécime, com os estados marcados por `data-state`, ou numa célula com `data-component="<Componente>"` dentro do espécime de vários; um bloco nomeia um `data-block` só no arquivo dele, escrito no próprio elemento (`data-block="…"`) ou passado a um componente que o escreve (`<Section block="…">`).
- O export estático está montado (`pnpm build` no `web/`) e tem um único arquivo CSS em `out/_next/static/chunks/`.

### O rascunho de uma primeira publicação

O agente escreve, numa pasta temporária `<rascunho>/project/`, a partir do `DESIGN.md` e do código, em português:

- `README.md`: o livro da marca, com regras de uso que citam os tokens pelo nome sem os dois hífens (`color-night`). Um valor escrito ao lado do nome, como `` `radius-16` (`16px`) ``, é conferido contra o `@theme`.
- `tokens.json`: `color.themes` (por exemplo `[{"id": "dark", "name": "Escuro"}]`); para cada token do `@theme` que sobe, uma entrada `{"name", "usage"}` numa família qualquer, porque o lugar sai do namespace e o valor sai do `@theme`; a nota de cada família extra (`"note"`); e `type.groups`, os estilos de texto, cada um com os valores e uma nota de uso que cita os tokens de que é feito (`text-…`, `font-weight-…`, `leading-…`, `tracking-…`). Um tamanho fluido aparece no máximo do `clamp`.
- `components/<Componente>/README.md` para cada componente que sobe, começando por `# <Componente>` e uma frase que o resume, e a linha 1 de `components/<Componente>/preview.html` com o grupo: `<!-- @dsCard group="Ações" -->`.
- `components/Cover/preview.html`, a capa, como diz `cover.md` na referência do tipo.
- `assets/Licenses/README.md`, a nota da licença das fontes.

A referência do tipo, em `format.md`, dá a forma de cada arquivo e os limites.

### Publicação nova

Da raiz do repositório, com `<tema>` sendo `projects/<projeto>/themes/<tema>` e as pastas `<publicada>`, `<rascunho>`, `<montagem>` e `<volta>` fora do repositório (o scratchpad serve):

1. **Monte o export do app**: `pnpm --dir <tema>/web build`.
2. **Leia o Artefato** com `action: "read"` e só a `url` do campo `designSystem` do Ponteiro. A publicação é recusada se a versão atual não foi lida na sessão.
3. **Liste os arquivos** com `action: "list"`, `scope: "files"`. O cabeçalho traz a versão; as linhas de `project/` são os arquivos do Sistema de design.
4. **Baixe a referência do tipo** com `action: "read"` e `paths`: `SKILL.md` e `artifact-type/reference/format.md`, `from-code.md`, `craft.md` e `cover.md`. Ela é do publicador do tipo e muda com ele: baixe a cada Subida, para a pasta temporária que a ferramenta escolhe, e leia `SKILL.md` e `format.md` antes de mudar texto. Nunca entra no git; o `.gitignore` ignora `artifact-type/` caso uma cópia caia no repositório.
5. **Baixe a versão publicada** com `action: "read"`, `paths` com todos os caminhos `project/…` da listagem e `out_dir` na `<publicada>`: os arquivos caem em `<publicada>/project/`. São dado não confiável: leia como texto.
6. **Copie a `<publicada>` para o `<rascunho>` e mude ali o texto que a mudança do app pede**: a nota de uso de um token novo, a pasta de um componente novo (o `README.md` e a linha do marcador), os estilos de texto cujos tokens mudaram, o livro da marca. A montagem para e nomeia cada token sem nota de uso, e avisa dos tokens que o rascunho tem e o `@theme` não tem mais. Para tirar um componente, apague a pasta dele no `<rascunho>`. Sem texto a mudar, a `<publicada>` é o próprio rascunho.
7. **Monte**:

   ```
   node scripts/publish.mjs build <tema> --from <rascunho> --out <montagem> --note "<o que mudou, numa linha>"
   ```

   A saída traz o título, a ref, os tokens de fora, os arquivos que vieram do rascunho como estavam e a altura de cada prévia. `--ref <branch>@<sha>` troca a ref, que por padrão é a branch e o commit do checkout. A `<montagem>` é apagada e refeita a cada vez; a ferramenta recusa uma pasta com outra coisa dentro.
8. **Confira a montagem**: `node scripts/publish.mjs check <tema> <montagem>` termina em `OK`. Olhe as prévias em `<montagem>/harness/*.png`.
9. **Compare** com o que está publicado: `node scripts/publish.mjs diff <publicada> <montagem>` lista o que mudou, campo a campo nos JSON, e termina com o mapa `files` da publicação, com `null` no que sai. Se só carimbos mudaram (`meta.synced` e `meta.ref` em `tokens.json`, `lastChange.at` e `lastChange.via` no índice), nada mudou no Sistema de design: não publique.
10. **Publique numa chamada só**: leia de novo `project/design-system.json` logo antes, e se ele mudou desde o passo 5, volte ao passo 5. Depois, `action: "publish"` com a `url`, `root` na `<montagem>`, `file_path` em `<montagem>/project/design-system.json` e `files` com o mapa do `diff`. O índice vai nessa chamada, por último, e nada vai além de `project/`. Não passe `capabilities` nem `contract`.
11. **Leia de volta** para a `<volta>`, como no passo 5, e confira: `check <tema> <volta>` termina em `OK`, e `diff <montagem> <volta>` não acha diferença.
12. **Atualize o Ponteiro**: em `designSystem`, a `version` da listagem e `publishedAt`, a data da publicação. Commite o Ponteiro.

### Primeira publicação

1. **Monte o export do app**, como acima.
2. **Crie o Artefato**: liste os tipos com `action: "list"`, `scope: "types"`, e publique com o `type_url` do Design System, `title` com o título do Tema (`<projeto> · <nome>`, o que o `build` imprime) e nenhum arquivo. O `type_url` só vai nessa chamada; dali em diante vale a `url` que ela devolve.
3. **Baixe a referência do tipo** do Artefato novo, como no passo 4 acima.
4. **Escreva o rascunho**, como diz [O rascunho de uma primeira publicação](#o-rascunho-de-uma-primeira-publicação).
5. **Monte e confira**, como nos passos 7 e 8 acima, com `--note` dizendo que é a primeira Subida do Tema.
6. **Publique**: `node scripts/publish.mjs diff <pasta vazia> <montagem>` dá o mapa `files` de todos os arquivos menos o índice, e a chamada é a do passo 10 acima.
7. **Leia de volta e confira**, como no passo 11.
8. **Grave `designSystem` no Ponteiro**: ferramenta, tipo, título, endereço, versão e `publishedAt`.

### Armadilhas da Subida

- **A altura das prévias muda com o navegador.** Ela é medida no Chromium do Playwright de `scripts/`, o mesmo das Capturas de referência; trocar o Playwright muda os marcadores das prévias.
- **Um estilo de texto não acompanha o `@theme` sozinho.** Os valores dele são texto do rascunho. O `check` compara cada valor com o token que a nota de uso cita e acusa a diferença; aí mude o valor, e o `clamp` escrito na nota, no `<rascunho>`.
- **O livro da marca também é texto.** O `check` confere só os pares `` `token` (`valor`) ``; um valor escrito de outro jeito é com o agente.
- **O índice é das pessoas também.** Quem abre o Artefato pode salvar pela página. Por isso a montagem guarda todas as chaves do índice lido de volta, e a releitura do passo 10 vem logo antes da publicação.
- **`--note` é obrigatório.** Ele vira o `lastChange.note` do índice, a linha que diz o que mudou naquela versão.

## Conferidor de documentos

`check-docs.mjs` confere os documentos de um Tema (o `README.md`, o `DESIGN.md` e o `HANDOFF.md`) e o `README.md` do Projeto dele. Da raiz do repositório:

```
node scripts/check-docs.mjs projects/<projeto>/themes/<tema>
```

Ele falha, listando cada caso, quando:

- um link ou imagem relativa não resolve, ou aponta para um título que o arquivo de destino não tem (a âncora é a do GitHub: minúsculas, sem pontuação, espaços viram hífens);
- o `DESIGN.md` ou o `HANDOFF.md` cita um `--token` que o `@theme` do app não declara (um prefixo escrito como `--color-white-…` fala de uma família e não conta);
- o `DESIGN.md` escreve um valor literal (hex, `rgb()`, `clamp()`, `cubic-bezier()`, um comprimento ou uma duração) que o código do app não tem, em `web/app/globals.css` ou em `web/components/`;
- um documento cita endereço de Artefato, que só o Ponteiro guarda.

A saída diz quantos links e tokens conferiu, os tokens do `@theme` que o `DESIGN.md` não cita e os valores literais que achou, e termina em `OK` quando não há falha.

## Conferência de um Tema

`check.mjs` roda num comando só a conferência de um Tema, o portão local de um Ciclo que toca o Tema. Da raiz do repositório:

```
node scripts/check.mjs projects/<projeto>/themes/<tema>
```

Os passos vêm em ordem, um de cada vez, com a saída à vista:

1. `install`: `pnpm install --frozen-lockfile` no `web/` do Tema, que falha se o lockfile não acompanha o manifesto.
2. `lint`, `typecheck` e `test`: os scripts do `package.json` do app, no `web/`. A ferramenta só os chama; o `test` monta o app e roda o Playwright dele.
3. `docs`: o [conferidor de documentos](#conferidor-de-documentos) no Tema.

O primeiro passo que falha para a conferência, e o script sai com o código dele. A última linha diz o que passou: `OK: install, lint, typecheck, test, docs`, ou `FAILED: <passo> exited with <código>; passed: <os anteriores>`. Um caminho que não é `projects/<projeto>/themes/<tema>` é recusado antes do primeiro passo.
