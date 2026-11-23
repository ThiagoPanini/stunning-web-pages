# stunning-web-pages

Catálogo pessoal e exploratório de interfaces e páginas web.

Cada Projeto reúne um ou mais Temas. Um Tema é um design criado numa ferramenta de design, como o Claude Design, e reimplementado aqui como um app de front end navegável. Junto do app ficam os documentos para outra pessoa reconstruir a interface no próprio projeto: a pasta do Tema é uma referência para ler, não um template para copiar.

## Índice

| Projeto | Tema | Captura | Telas cobertas | Stack |
|---|---|---|---|---|
| [`portal-rai`](projects/portal-rai/README.md): o portal de um time de Responsible AI | [Hélio](projects/portal-rai/themes/helio/README.md) | <img src="projects/portal-rai/themes/helio/screenshots/home-1440.png" alt="Captura da Home do Hélio" width="240"> | Home | Next.js 16, Tailwind CSS 4, export estático |
| | [Neônio](projects/portal-rai/themes/neonio/README.md) | <img src="projects/portal-rai/themes/neonio/screenshots/home-1440.png" alt="Captura da Home do Neônio" width="240"> | Home | Next.js 16, Tailwind CSS 4, export estático |
| | [Refined](projects/portal-rai/themes/refined/README.md) | <img src="projects/portal-rai/themes/refined/screenshots/home-1440.png" alt="Captura da Home do Refined" width="240"> | Home | Next.js 16, Tailwind CSS 4, Base UI, export estático |

## Como usar um Tema

Comece pelo README do Tema: ele mostra as Capturas e diz como subir o app na sua máquina. O `DESIGN.md` destrincha o Sistema de design, e o `HANDOFF.md` é o briefing para entregar ao seu agente de código quando for reimplementar o Tema no seu projeto.

O vocabulário do Catálogo está em [`GLOSSARY.md`](GLOSSARY.md). O padrão que todo Tema segue está em [`AGENTS.md`](AGENTS.md), e as decisões por trás dele, cada uma com a alternativa descartada, em [`docs/adr/`](docs/adr/).

## Licença

O código é MIT, pela [`LICENSE`](LICENSE). As fontes que um Tema traz dentro do app têm licença própria, num arquivo ao lado delas em `web/fonts/`, e todas as de hoje são da SIL Open Font License 1.1:

- as Geist e Geist Mono do Hélio, em [`OFL.txt`](projects/portal-rai/themes/helio/web/fonts/OFL.txt);
- as Inter Tight, Inter, JetBrains Mono e Geist Mono do Neônio, cada uma no seu arquivo: [`OFL-inter-tight.txt`](projects/portal-rai/themes/neonio/web/fonts/OFL-inter-tight.txt), [`OFL-inter.txt`](projects/portal-rai/themes/neonio/web/fonts/OFL-inter.txt), [`OFL-jetbrains-mono.txt`](projects/portal-rai/themes/neonio/web/fonts/OFL-jetbrains-mono.txt) e [`OFL-geist-mono.txt`](projects/portal-rai/themes/neonio/web/fonts/OFL-geist-mono.txt);
- as Instrument Sans e Geist Mono do Refined, em [`OFL.txt`](projects/portal-rai/themes/refined/web/fonts/OFL.txt).
