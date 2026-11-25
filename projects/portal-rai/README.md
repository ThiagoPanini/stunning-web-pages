# portal-rai

O portal de um time de Responsible AI: o time que pesquisa, desenvolve e implementa os guardrails dos agentes conversacionais de IA de uma companhia. Ele trabalha em dois times. O Red Team ataca os agentes antes que alguém de fora ataque; o Blue Team protege cada conversa entre clientes e agentes, em produção.

O portal é para os times de produto que põem agentes conversacionais no ar. Nele, eles conhecem o trabalho dos dois times, veem as soluções que podem acionar e testam um guardrail no próprio agente. O texto é neutro: o nome da companhia, o canal e o e-mail do time ficam como espaços reservados, como `[NOME DA COMPANHIA]`.

O design é uma Home em cinzas neutros, com o logo Ondas também na marca do cabeçalho, uma faixa de parceiros, o ciclo de trabalho do time e os cartões dos dois times. Ele tem Tweaks em aberto, e o app desenha todas as versões deles: duas do ciclo, três dos cartões dos times e três formas de neon no hover dos cartões.

![Captura da Home do portal-rai](screenshots/home-1440.png)

| | |
|---|---|
| Telas cobertas | Home, em todas as versões dos Tweaks. O app tem também a rota do Sistema de design, `/design-system`. |
| Implementado em | 23/11/2026 |
| Design de origem | Claude Design, puxado em 25/11/2026 |
| Framework | Next.js 16.4.6, com export estático |
| Capturas | Home em [1440 px](screenshots/home-1440.png) e [390 px](screenshots/home-390.png), com os valores padrão dos Tweaks; Sistema de design em [1440 px](screenshots/design-system-1440.png) e [390 px](screenshots/design-system-390.png) |

Para entender o Sistema de design, leia o [`DESIGN.md`](DESIGN.md). Para reimplementar o portal no seu projeto com um agente, entregue a ele o [`HANDOFF.md`](HANDOFF.md).

## Telas

| Tela | O que mostra | Situação |
|---|---|---|
| Home | o time, os dois times, as principais soluções e o convite para testar um guardrail | desenhada |
| Dados | | nomeada na navegação, ainda sem design |
| Playground | | nomeada na navegação, ainda sem design |
| Integrações | | nomeada na navegação, ainda sem design |

No app, os links para as Telas ainda sem design ficam inertes.

## Os Tweaks

O design deixa três escolhas em aberto, com os nomes e as opções que o Quadro dá. A Home abre nos valores padrão; o endereço da página escolhe outra versão, e o painel **Tweaks**, no canto de baixo à direita, troca a versão na hora e grava a escolha no endereço. Um link com o endereço abre a mesma versão, e um valor que o Quadro não declara abre o padrão.

| Tweak | Opções | Padrão | O que muda |
|---|---|---|---|
| `versaoCiclo` | `03-cartoes`, `06-laco` | `06-laco` | o ciclo da seção 01, Modelo de trabalho |
| `versaoCards` | `01-simple`, `02-surprise`, `03-middle` | `03-middle` | os cartões da seção 02, Times |
| `efeitoNeon` | `preenchimento`, `contorno`, `holofote` | `preenchimento` | o hover dos cartões `02-surprise` |

Por exemplo, `/?versaoCiclo=03-cartoes&versaoCards=02-surprise&efeitoNeon=contorno`. O painel é do Catálogo, não do design: ele serve para comparar as versões e escolher uma.

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
cd stunning-web-pages/projects/portal-rai/web
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

Antes do primeiro `pnpm test`, instale o navegador da versão fixada: `pnpm exec playwright install chromium`. O teste serve o export numa porta livre e confere a Home contra as Capturas de referência do design original, em todas as versões dos Tweaks, além da saúde da página, do ciclo, do painel, da rota do Sistema de design, do movimento reduzido e do export estático. As Capturas de referência ficam em `origin/`, então o teste precisa da pasta do Projeto inteira.

- **Cada Captura de referência bate pixel a pixel com o app.** A Puxada capturou o design original nos valores padrão dos Tweaks, com o laço, em 1440, 1024 e 390 px, e uma vez por estado de hover, em 1440 px: a estação do laço sob o ponteiro e os três neons em cada time. São 10 Capturas de referência da Home, e [`web/tests/fidelity.spec.ts`](web/tests/fidelity.spec.ts) abre o app com os mesmos Tweaks no endereço, pousa o ponteiro no mesmo elemento e compara a página inteira.
- **O limite é nenhum pixel diferente**, com limiar por pixel de 0,02 do `pixelmatch`. A razão está junto de `MAX_DIFF_PIXEL_RATIO`, em [`web/tests/support/reference.ts`](web/tests/support/reference.ts).
- **Os dois Ondas também são conferidos sozinhos.** [`web/tests/logo.spec.ts`](web/tests/logo.spec.ts) recorta o logo da Home a 1324 px de largura, onde ele mede 560 px, e o compara com a Captura de referência do design do logo no fundo da página; e compara o Ondas mini, desenhado a 160 px na rota do Sistema de design, com a do design dele. Com movimento normal, confere que o logo muda de um instante para o outro e para quando o movimento é reduzido.
- **O export é estático.** [`web/tests/export.spec.ts`](web/tests/export.spec.ts) confere que o build escreve a Home e a rota do Sistema de design como arquivos HTML, que qualquer servidor estático entrega como estão ([ADR 0006](../../docs/adr/0006-export-estatico.md)).
- **A comparação só vale no Chromium do Playwright fixado, em Linux**, onde as referências foram tiradas. Outro navegador ou outro sistema desenha o texto de outro jeito, e a comparação falha sem que a página esteja errada.
- **O teste não grava nada no repositório.** Ele confere que cada Captura de `screenshots/`, a da Home e a do Sistema de design, é byte a byte o que o app desenha agora, e falha se não for. Depois de mudar a página de propósito, regrave as Capturas com `pnpm test --update-snapshots`, que só reescreve as que mudaram; a da Home só é gravada depois de bater com a Captura de referência.

## Mapa da pasta

```
portal-rai/
├── README.md           esta página
├── DESIGN.md           o Sistema de design, em seções
├── HANDOFF.md          o briefing para o agente que vai reimplementar o portal
├── screenshots/        Capturas do app: Home e Sistema de design, em 1440 e 390 px
├── web/                o app
│   ├── app/            a Home (page.tsx), a rota design-system/, o layout,
│   │                   as fontes (fonts.ts) e o @theme (globals.css)
│   ├── components/     um componente por arquivo: os blocos da Home, as versões dos
│   │                   Tweaks, as peças deles e o painel de Tweaks (tweaks.tsx)
│   ├── fonts/          Geist e Geist Mono em .woff2, com a licença OFL
│   └── tests/          o teste do Playwright e o apoio dele
└── origin/             a Origem, coisa do Autor: os Quadros como saíram da ferramenta,
                        as Capturas de referência e o Ponteiro
```

## Licença

O código é MIT, pela [licença do repositório](../../LICENSE). As fontes Geist e Geist Mono são da SIL Open Font License 1.1, em [`web/fonts/OFL.txt`](web/fonts/OFL.txt).
