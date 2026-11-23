# Refined

Um Tema do Projeto [`portal-rai`](../../README.md): a Home do portal de um time de Responsible AI, quase preta e quente, com um creme de destaque, seções numa coluna estreita que abrem com o título e a contagem, cartões em moldura, perguntas frequentes em acordeão, um formulário de contato e o logo Ondas, desenhado e animado em caracteres.

![Captura da Home do Refined](screenshots/home-1440.png)

| | |
|---|---|
| Telas cobertas | Home. O app tem também a rota do Sistema de design, `/design-system`. |
| Implementado em | 23/11/2026 |
| Design de origem | Claude Design, puxado em 23/11/2026 |
| Framework | Next.js 16.4.6, com export estático |
| Capturas | Home em [1440 px](screenshots/home-1440.png) e [390 px](screenshots/home-390.png); Sistema de design em [1440 px](screenshots/design-system-1440.png) e [390 px](screenshots/design-system-390.png) |

Para entender o Sistema de design, leia o [`DESIGN.md`](DESIGN.md). Para reimplementar o Tema no seu projeto com um agente, entregue a ele o [`HANDOFF.md`](HANDOFF.md).

## Versões

As dependências ficam congeladas nestas versões. A fonte é o manifesto, [`web/package.json`](web/package.json), com o lockfile ao lado.

| Ferramenta | Versão |
|---|---|
| Node.js | 24 |
| pnpm | 11.17.0 |
| Next.js | 16.4.6 |
| React e React DOM | 19.3.1 |
| Base UI (`@base-ui/react`), só no acordeão | 1.9.0 |
| Tailwind CSS e `@tailwindcss/postcss` | 4.3.5 |
| TypeScript | 7.0.2 |
| Biome | 2.6.8 |
| Playwright | 1.65.1, com o Chromium 159 |
| React Compiler (`babel-plugin-react-compiler`) | 1.0.0 |
| `pixelmatch` e `pngjs`, só no teste | 8.0.0 e 7.0.0 |
| Instrument Sans e Geist Mono, em `.woff2` | 1.000 e 1.701 |

## Como rodar

Precisa do Node 24 e do pnpm 11. Quem usa o mise tem os dois fixados no `mise.toml` da raiz do repositório.

```sh
git clone https://github.com/ThiagoPanini/stunning-web-pages.git
cd stunning-web-pages/projects/portal-rai/themes/refined/web
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

Antes do primeiro `pnpm test`, instale o navegador da versão fixada: `pnpm exec playwright install chromium`. O teste serve o export numa porta livre e confere a Home contra as Capturas de referência do design original, bloco a bloco e inteira, a saúde da página, o acordeão, o formulário, o movimento reduzido, as Lacunas e a rota do Sistema de design. As Capturas de referência ficam em `origin/`, então o teste precisa da pasta do Tema inteira.

- **A Home bate byte a byte com o design original**, em 1440 e em 390 px. `screenshots/home-1440.png` e `screenshots/home-390.png` têm o mesmo `sha256` das Capturas de referência.
- **O limite é nenhum pixel diferente**, com limiar por pixel de 0,02 do `pixelmatch`. A razão está junto de `MAX_DIFF_PIXEL_RATIO`, em [`web/tests/support/reference.ts`](web/tests/support/reference.ts).
- **O logo também é conferido sozinho.** [`web/tests/logo.spec.ts`](web/tests/logo.spec.ts) fotografa o espécime de 560 px da rota `/design-system`, desenhado como o design do logo sozinho, no fundo próprio do logo e sem o espaçamento entre letras da página, e o compara com a Captura de referência desse design, com o mesmo limiar de 0,02 e a razão ao lado, em `LOGO_PIXEL_THRESHOLD`. Na Home, ele compara a coluna do logo e da legenda com a referência e confere, cor por cor, os cantos do quadrado do logo, porque o limiar não separa o fundo próprio do logo do fundo da página. Com movimento normal, ele confere que o logo muda de um instante para o outro e para quando o movimento é reduzido.
- **As interações também são conferidas**: a primeira pergunta aberta na chegada, o clique e o teclado que abrem e fecham cada pergunta com o estado anunciado, a faixa de chips que corre e pausa sob o ponteiro, os títulos do ciclo que acendem com a rolagem, o formulário que aceita digitação e não envia nada, e os links das Lacunas, que não navegam.
- **A comparação só vale no Chromium do Playwright fixado, em Linux**, onde as referências foram tiradas. Outro navegador ou outro sistema desenha o texto de outro jeito, e a comparação falha sem que a página esteja errada.
- **O teste não grava nada no repositório.** Ele confere que cada Captura de `screenshots/`, a da Home e a do Sistema de design, é byte a byte o que o app desenha agora, e falha se não for. Depois de mudar a página de propósito, regrave as Capturas com `pnpm test --update-snapshots`, que só reescreve as que mudaram; a da Home só é gravada depois de bater com a Captura de referência.

## Mapa da pasta

```
refined/
├── README.md           esta página
├── DESIGN.md           o Sistema de design, em seções
├── HANDOFF.md          o briefing para o agente que vai reimplementar o Tema
├── screenshots/        Capturas do app: Home e Sistema de design, em 1440 e 390 px
├── web/                o app
│   ├── app/            a Home (page.tsx), a rota design-system/, o layout,
│   │                   as fontes (fonts.ts) e o @theme (globals.css)
│   ├── components/     um componente por arquivo: os blocos da Home e as peças deles
│   ├── fonts/          Instrument Sans e Geist Mono em .woff2, com a licença OFL
│   └── tests/          o teste do Playwright e o apoio dele
└── origin/             a Origem, coisa do Autor: os arquivos do design como saíram da
                        ferramenta, as Capturas de referência e o Ponteiro
```

## Licença

O código é MIT, pela [licença do repositório](../../../../LICENSE). As fontes Instrument Sans e Geist Mono são da SIL Open Font License 1.1, em [`web/fonts/OFL.txt`](web/fonts/OFL.txt).
