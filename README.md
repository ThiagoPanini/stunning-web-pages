# stunning-web-pages

Catálogo pessoal e exploratório de interfaces e páginas web.

Cada Projeto é um design criado numa ferramenta de design, como o Claude Design, e reimplementado aqui como um app de front end navegável. Junto do app ficam os documentos para outra pessoa reconstruir a interface no próprio projeto: a pasta do Projeto é uma referência para ler, não um template para copiar.

## Índice

| Projeto | Captura | Telas cobertas | Stack | Implementado em |
|---|---|---|---|---|
| [`portal-rai`](projects/portal-rai/README.md): o portal de um time de Responsible AI | <img src="projects/portal-rai/screenshots/home-1440.png" alt="Captura da Home do portal-rai" width="240"> | Home, com todas as versões dos Tweaks | Next.js 16, Tailwind CSS 4, export estático | 23/11/2026 |

## Como usar um Projeto

Comece pelo README do Projeto: ele mostra a Captura, as Telas e os Tweaks em aberto, e diz como subir o app na sua máquina. O `DESIGN.md` destrincha o Sistema de design, e o `HANDOFF.md` é o briefing para entregar ao seu agente de código quando for reimplementar a interface no seu projeto.

O vocabulário do Catálogo está em [`GLOSSARY.md`](GLOSSARY.md). O padrão que todo Projeto segue está em [`AGENTS.md`](AGENTS.md), e as decisões por trás dele, cada uma com a alternativa descartada, em [`docs/adr/`](docs/adr/).

## Licença

O código é MIT, pela [`LICENSE`](LICENSE). As fontes que um Projeto traz dentro do app têm licença própria, num arquivo ao lado delas em `web/fonts/`. As de hoje são as Geist e Geist Mono do `portal-rai`, da SIL Open Font License 1.1, em [`OFL.txt`](projects/portal-rai/web/fonts/OFL.txt).
