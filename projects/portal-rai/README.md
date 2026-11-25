# Curated

Um Tema do Projeto [`portal-rai`](../../README.md): a evolução da Home do Hélio, em cinzas neutros, com o logo Ondas também na marca do cabeçalho, uma faixa de parceiros, o ciclo de trabalho do time e os cartões dos dois times. O design tem tweaks, e o app desenha todas as versões deles: quatro do ciclo, três dos cartões dos times e três formas de neon no hover dos cartões.

![Captura da Home do Curated](screenshots/home-1440.png)

| | |
|---|---|
| Telas cobertas | Home, em todas as versões dos tweaks. O app tem também a rota do Sistema de design, `/design-system`. |
| Implementado em | 23/11/2026 |
| Design de origem | Claude Design, puxado em 23/11/2026 |
| Framework | Next.js 16.4.6, com export estático |
| Capturas | Home em [1440 px](screenshots/home-1440.png) e [390 px](screenshots/home-390.png), com os valores padrão dos tweaks; Sistema de design em [1440 px](screenshots/design-system-1440.png) e [390 px](screenshots/design-system-390.png) |

Para entender o Sistema de design, leia o [`DESIGN.md`](DESIGN.md). Para reimplementar o Tema no seu projeto com um agente, entregue a ele o [`HANDOFF.md`](HANDOFF.md).

## Os tweaks

O design deixa três escolhas em aberto, com os nomes e as opções que ele dá. A Home abre nos valores padrão; o endereço da página escolhe outra versão, e o painel **Tweaks**, no canto de baixo à direita, troca a versão na hora e grava a escolha no endereço. Um link com o endereço abre a mesma versão.

| Tweak | Opções | Padrão | O que muda |
|---|---|---|---|
| `versaoCiclo` | `01-orbita`, `02-fio`, `03-cartoes`, `04-gif` | `01-orbita` | o ciclo da seção 01, Modelo de trabalho |
| `versaoCards` | `01-simple`, `02-surprise`, `03-middle` | `03-middle` | os cartões da seção 02, Times |
| `efeitoNeon` | `preenchimento`, `contorno`, `holofote` | `preenchimento` | o hover dos cartões `02-surprise` |

Por exemplo, `/?versaoCiclo=02-fio&versaoCards=02-surprise&efeitoNeon=contorno`. O painel é do Catálogo, não do design: ele serve para comparar as versões e escolher uma.

## Versões

As dependências ficam congeladas nestas versões. A fonte é o manifesto, [`web/package.json`](web/package.json), com o lockfile ao lado.

| Ferramenta | Versão |
|---|---|
| Node.js | 24 |
| pnpm | 11.17.0 |
| Next.js | 16.4.6 |
| React e React DOM | 19.3.1 |
| Tailwind CSS e `@tailwindcss/postcss` | 4.3.5 |
| TypeScript | 7.0.2 |
| Biome | 2.6.8 |
| Playwright | 1.65.1, com o Chromium 159 |
| React Compiler (`babel-plugin-react-compiler`) | 1.0.0 |
| `pixelmatch` e `pngjs`, só no teste | 8.0.0 e 7.0.0 |
| Geist e Geist Mono, em `.woff2` | 1.800 e 1.701 |

## Como rodar

Precisa do Node 24 e do pnpm 11. Quem usa o mise tem os dois fixados no `mise.toml` da raiz do repositório.

```sh
git clone https://github.com/ThiagoPanini/stunning-web-pages.git
cd stunning-web-pages/projects/portal-rai/themes/curated/web
pnpm install --frozen-lockfile
pnpm dev
```

A Home abre em `http://localhost:3000` e o Sistema de design em `http://localhost:3000/design-system`. Se a porta 3000 estiver ocupada, `pnpm dev --port 3001`.

Depois da instalação, o app não precisa de rede: as fontes estão dentro dele.

| Comando, em `web/` | O que faz |
|---|---|
| `pnpm build` | gera o export estático em `web/out/`; recurso de servidor faz o build falhar |
| `pnpm lint` | confere lint e formatação com o Biome |
| `pnpm typecheck` | gera os tipos das rotas e confere os tipos |
| `pnpm test` | faz o build e roda o teste do Playwright |
| `pnpm test --update-snapshots` | faz o mesmo e regrava as Capturas de `screenshots/` que mudaram |

## Teste e fidelidade

Antes do primeiro `pnpm test`, instale o navegador da versão fixada: `pnpm exec playwright install chromium`. O teste serve o export numa porta livre e confere a Home contra as Capturas de referência do design original, em todas as versões dos tweaks, além da saúde da página, do ciclo, do painel, da rota do Sistema de design e do movimento reduzido. As Capturas de referência ficam em `origin/`, então o teste precisa da pasta do Tema inteira.

- **Cada versão do design bate pixel a pixel com o app.** A Puxada capturou o design original uma vez por versão dos tweaks, em 1440, 1024 e 390 px, e uma vez por estado de hover: a estação e a pílula do ciclo seguradas, o cartão do ciclo sob o ponteiro e os três neons em cada time. São 21 Capturas de referência da Home, e [`web/tests/fidelity.spec.ts`](web/tests/fidelity.spec.ts) abre o app com os mesmos tweaks no endereço, pousa o ponteiro no mesmo elemento e compara a página inteira.
- **O limite é nenhum pixel diferente**, com limiar por pixel de 0,02 do `pixelmatch`. A razão está junto de `MAX_DIFF_PIXEL_RATIO`, em [`web/tests/support/reference.ts`](web/tests/support/reference.ts).
- **Os dois Ondas também são conferidos sozinhos.** [`web/tests/logo.spec.ts`](web/tests/logo.spec.ts) recorta o logo da Home a 1324 px de largura, onde ele mede 560 px, e o compara com a Captura de referência do design do logo no fundo da página; e compara o Ondas mini, desenhado a 160 px na rota do Sistema de design, com a do design dele. Com movimento normal, confere que o logo muda de um instante para o outro e para quando o movimento é reduzido.
- **A comparação só vale no Chromium do Playwright fixado, em Linux**, onde as referências foram tiradas. Outro navegador ou outro sistema desenha o texto de outro jeito, e a comparação falha sem que a página esteja errada.
- **O teste não grava nada no repositório.** Ele confere que cada Captura de `screenshots/`, a da Home e a do Sistema de design, é byte a byte o que o app desenha agora, e falha se não for. Depois de mudar a página de propósito, regrave as Capturas com `pnpm test --update-snapshots`, que só reescreve as que mudaram; a da Home só é gravada depois de bater com a Captura de referência.

## Mapa da pasta

```
curated/
├── README.md           esta página
├── DESIGN.md           o Sistema de design, em seções
├── HANDOFF.md          o briefing para o agente que vai reimplementar o Tema
├── screenshots/        Capturas do app: Home e Sistema de design, em 1440 e 390 px
├── web/                o app
│   ├── app/            a Home (page.tsx), a rota design-system/, o layout,
│   │                   as fontes (fonts.ts) e o @theme (globals.css)
│   ├── components/     um componente por arquivo: os blocos da Home, as versões dos
│   │                   tweaks, as peças deles e o painel de tweaks (tweaks.tsx)
│   ├── fonts/          Geist e Geist Mono em .woff2, com a licença OFL
│   └── tests/          o teste do Playwright e o apoio dele
└── origin/             a Origem, coisa do Autor: os arquivos do design como saíram da
                        ferramenta, as Capturas de referência e o Ponteiro
```

## Licença

O código é MIT, pela [licença do repositório](../../../../LICENSE). As fontes Geist e Geist Mono são da SIL Open Font License 1.1, em [`web/fonts/OFL.txt`](web/fonts/OFL.txt).
