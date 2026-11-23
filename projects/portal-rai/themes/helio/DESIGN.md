# Sistema de design do Hélio

O Hélio é um Tema do Projeto `portal-rai`: a Home do portal de um time de Responsible AI, escura, técnica e com só dois acentos. Este documento descreve o Sistema de design dele nas seções do formato DESIGN.md do Google Labs.

Os valores não estão aqui. A única fonte deles é o bloco `@theme` de [`web/app/globals.css`](web/app/globals.css), e este documento cita cada token pelo nome da variável. Para ver os valores desenhados, abra a rota `/design-system` do app (como rodar está no [README](README.md#como-rodar)) ou as Capturas dela: [`screenshots/design-system-1440.png`](screenshots/design-system-1440.png) e [`screenshots/design-system-390.png`](screenshots/design-system-390.png).

**Como ler os nomes.** A classe do Tailwind é o nome do token sem o prefixo do namespace: `--color-night` dá `bg-night`, `text-night` e `border-night`; `--text-15` dá `text-15`; `--radius-16` dá `rounded-16`; `--spacing-gutter` dá `px-gutter`; `--grid-template-columns-mission` dá `grid-cols-mission`. O crescimento flexível não tem namespace no Tailwind: `--grow-120` entra pela classe `grow-(--grow-120)`. Uma cor ou um comprimento de um papel só leva o nome do papel (`--color-night`, `--spacing-gutter`). Um valor de escala leva o nome do valor: `--text-15` é o tamanho de 15 px, `--text-36-80` cresce de 36 a 80 px, `--leading-160` é a altura de linha 1,6, `--tracking-tight-35` é o espaçamento de 35 milésimos de em negativos, `--grow-120` é o crescimento 1,2. Os tokens do logo Ondas guardam os nomes do componente dele, com `logo` no nome (`--color-logo-blue`, `--font-logo`, `--text-logo`), e por isso ficam separados dos tokens da página de mesmo valor.

**Nomear sem normalizar.** Cada valor do design tem o seu token, com o nome do valor como ele foi achado, e valores parecidos não foram fundidos. O que parece inconsistente está em [Observações](#observações), para você decidir o que corrigir no seu projeto.

**Só existe o que o Tema tem.** O tema padrão do Tailwind está zerado: a paleta, a escala de tipo, os raios, as sombras e as quebras dele não geram classe. Só a escala de espaçamento volta, pela base `--spacing`.

## Visão geral

![Captura da Home do Hélio](screenshots/home-1440.png)

Uma página só, escura e sóbria, que conta a história de dois times em oposição. Sobre uma escala de neutros quase pretos, só duas cores têm matiz, e cada uma tem um sentido: o vermelho é o ataque e o Red Team; o azul é o guardrail e o Blue Team. O título da abertura já diz isso, com o ponto de "Atacamos primeiro." em vermelho e o de "Protegemos sempre." em azul.

Os títulos são grandes, de peso leve e com as letras apertadas. O mono aparece onde o texto é técnico ou é rótulo: sobretítulos, painéis de terminal, selos e a chamada de API. A página se move pouco e de propósito. Ela entra no carregamento, revela as seções conforme o scroll e acende as palavras do título da Missão, e o logo Ondas anima, em caracteres, as ondas que chegam ao anel de guardrails em volta do agente e as que saem dele.

A Home, de cima para baixo:

- **Cabeçalho** fixo com desfoque: marca, navegação em pílula, o botão "Testar um guardrail" e a barra de progresso do scroll.
- **Abertura** em duas colunas: sobretítulo, título, parágrafo, botão e link; ao lado, o logo Ondas e a legenda de caracteres dele.
- **01 · Missão**: um título cujas palavras acendem no scroll e três colunas.
- **02 · Times**: os cartões do Red Team e do Blue Team, cada um com um painel de terminal.
- **03 · Principais soluções**: quatro linhas com o selo do time, o nome e a descrição.
- **04 · Comece**: a chamada final e um cartão que simula uma chamada de API.
- **Rodapé**: marca, links, os espaços reservados de canal e e-mail e "Voltar ao topo ↑".

## Cores

Neutros, do escuro ao claro:

| Token | Papel |
|---|---|
| `--color-night` | fundo da página, dos painéis de terminal e, na abertura, do logo; texto do botão claro |
| `--color-surface` | fundo dos cartões |
| `--color-rule` | filetes das seções, dos cartões e dos painéis |
| `--color-rule-strong` | filetes das colunas da Missão e pontilhado do painel do Red Team |
| `--color-unlit` | palavras do título da Missão antes de acender |
| `--color-subtle` | rótulos mono, rodapé, linhas de comando dos painéis |
| `--color-muted` | parágrafos, navegação, links de texto, texto dos painéis, "*" e "agente" na legenda do logo |
| `--color-bright` | texto principal, botão claro, marca, barra de progresso, link em hover |

Acentos, cada um com um sentido:

| Token | Papel |
|---|---|
| `--color-red` | ataque e Red Team: ponto do título, marca e nome do Red Team, selo RED, "passou" no painel, "×" e "ataque" na legenda do logo |
| `--color-blue` | guardrail e Blue Team: ponto do título, marca e nome do Blue Team, selo BLUE, "contido", etapas do painel, veredito "bloqueada", ":" e "guardrails" na legenda do logo; também o anel de foco |

Do logo Ondas, com os nomes do componente dele. Cada camada do desenho tem a sua cor:

| Token | Papel |
|---|---|
| `--color-logo-agent` | o agente, a esfera de caracteres do centro |
| `--color-logo-blue` | o anel de guardrails |
| `--color-logo-red` | o que precisa ser barrado: os ataques que chegam e as respostas inválidas |
| `--color-logo-gray` | o que pode passar: as respostas válidas |
| `--color-logo-bright` | a cor de base do logo, que as camadas cobrem |
| `--color-logo-night` | o fundo padrão do logo; na abertura, o app passa `--color-night` no lugar dele |

Translúcidas, com o nome do alfa em centésimos:

| Token | Papel |
|---|---|
| `--color-header` | fundo do cabeçalho, sob o desfoque |
| `--color-white-4` | fundo da pílula de navegação |
| `--color-white-6` | link da navegação em hover |
| `--color-white-7` | filete de baixo do cabeçalho |
| `--color-white-9` | borda da pílula de navegação |
| `--color-white-10` | link da navegação da página atual |
| `--color-red-12` | fundo do selo RED |
| `--color-blue-12` | fundo do selo BLUE |

## Tipografia

Duas fontes: `--font-sans` (Geist, com os fallbacks do design) para o texto, e `--font-mono` (Geist Mono) para rótulos, selos, painéis e a chamada de API. As duas são fontes variáveis guardadas em [`web/fonts/`](web/fonts/), com a licença ao lado, e carregadas por [`web/app/fonts.ts`](web/app/fonts.ts) só no subconjunto latin. `--default-font-family` e `--default-mono-font-family` são apelidos delas. `--font-logo` é a mesma pilha do Geist Mono, com o nome do componente do logo, que desenha os caracteres dele.

Três pesos: `--font-weight-light` nos títulos, `--font-weight-normal` no texto e nos títulos das colunas da Missão, `--font-weight-medium` na marca e nos botões.

Os tamanhos fixos são nomeados em px. Os fluidos, de `--text-22-30` a `--text-36-92`, crescem com a largura da janela, do mínimo ao máximo que o nome diz. `--text-logo` acompanha a largura do logo, e não a da janela: as 64 colunas de caracteres ocupam o quadrado inteiro. Uma célula vazia herda o valor da base da página.

| Papel | Família | Tamanho | Peso | Altura de linha | Espaçamento entre letras |
|---|---|---|---|---|---|
| Base da página | sans | `--text-16` | normal | `--leading-150` | |
| Título da abertura | sans | `--text-36-80` | light | `--leading-104` | `--tracking-tight-35` |
| Título da Missão | sans | `--text-36-92` | light | `--leading-103` | `--tracking-tight-40` |
| Título do Comece | sans | `--text-32-56` | light | `--leading-105` | `--tracking-tight-30` |
| Títulos de Times e Principais soluções | sans | `--text-28-42` | light | `--leading-110` | `--tracking-tight-25` |
| Títulos dos cartões dos times | sans | `--text-24-32` | light | `--leading-115` | `--tracking-tight-20` |
| Nomes das soluções | sans | `--text-22-30` | light | `--leading-115` | `--tracking-tight-20` |
| Títulos das colunas da Missão | sans | `--text-20` | normal | | `--tracking-tight-10` |
| Parágrafos que abrem a abertura e as seções | sans | `--text-17` | normal | `--leading-160` | |
| Texto das colunas e dos cartões | sans | `--text-15` | normal | `--leading-160` | |
| Descrições das soluções | sans | `--text-15` | normal | `--leading-155` | |
| Marca | sans | `--text-15` | medium | | `--tracking-tight-10` |
| Navegação e links de texto | sans | `--text-14` | normal | | |
| Botões | sans | `--text-14` | medium | | |
| Rodapé | sans | `--text-13` | normal | | |
| Painéis de terminal | mono | `--text-13` | normal | `--leading-140` | |
| Cartão da chamada de API | mono | `--text-13` | normal | `--leading-150` | |
| Sobretítulos e rótulos, em caixa alta | mono | `--text-12` | normal | | `--tracking-wide-80` |
| Legenda do logo e palavra ao lado das soluções | mono | `--text-12` | normal | | |
| Selos RED e BLUE | mono | `--text-11` | normal | | `--tracking-wide-80` |
| Caracteres do logo | logo | `--text-logo` | normal | `--leading-1200` | |

Os rótulos de seção seguem o formato "01 · Missão", com o número de dois dígitos e um ponto médio. O sobretítulo da abertura e os rótulos de seção são o mesmo componente, `SectionLabel`.

## Layout

- **Largura.** O conteúdo mede no máximo `--container-page`, centrado, com `--spacing-gutter` de respiro de cada lado. O contêiner do cabeçalho, o `main` e o rodapé usam `content-box`: a largura máxima é a do conteúdo, e o respiro fica por fora dela.
- **Espaçamento.** É a escala do Tailwind, sobre a base `--spacing`: todo comprimento fixo do design é um passo dela (`gap-2.5`, `p-0.75`, `py-24`). Dois espaçamentos fluidos têm nome: `--spacing-gutter`, o respiro lateral da página, e `--spacing-card`, o padding dos cartões dos times.
- **Ritmo das seções.** Cada seção numerada abre com um filete `--color-rule` no topo e tem o mesmo padding vertical (`py-24`; o Comece fecha com `pb-26`). Dentro dela vêm o rótulo mono, o título e o parágrafo que abre a seção.
- **Colunas que quebram sozinhas.** A página responde pela largura intrínseca dos blocos, com `flex-wrap` e grades `auto-fit`, sem quebra por largura de janela. A abertura tem duas colunas que empilham quando não cabem. As grades da Missão e dos Times, `--grid-template-columns-mission` e `--grid-template-columns-teams`, põem quantas colunas couberem, cada uma com no mínimo 260 px na Missão e 440 px nos Times, e uma coluna só quando nem isso cabe. As linhas das soluções e as colunas do Comece quebram pela base de cada parte. Nas linhas das soluções, o nome cresce `--grow-120` e a descrição `--grow-160`, os dois únicos fatores de crescimento da página que não são números inteiros; os inteiros são as classes do próprio Tailwind (`grow`, `grow-2`, `grow-3`).
- **Uma quebra só: `narrow`**, a 760 px ou menos, declarada como `@custom-variant` em `globals.css`, fora do `@theme`. Nela o cabeçalho deixa de ser fixo e a navegação ganha uma linha própria, que rola de lado.
- **Ponteiro grosso.** Com `pointer-coarse:`, os links da navegação crescem para 44 px de altura. Os outros alvos de toque já têm 44 px de altura mínima: marca, botões, links de texto e links do rodapé.
- **Camadas.** O cabeçalho fica por cima da página, com `--color-header` sob o desfoque `--blur-16`. A barra de progresso, em `--color-bright`, corre na borda de baixo dele.

## Formas

| Token | Onde |
|---|---|
| `--radius-6` | selos RED e BLUE |
| `--radius-10` | botões e painéis de terminal |
| `--radius-16` | cartões dos times e cartão da chamada de API |
| `--radius-pill` | pílula de navegação e os links dela |
| `--radius-circle` | anel e ponto da marca |

- **Filetes** de 1 px separam tudo: `--color-rule` em seções, cartões e painéis; `--color-rule-strong` no topo das colunas da Missão e, pontilhado, entre o passo e o resultado no painel do Red Team.
- **Profundidade.** A página é plana. Há uma sombra só, `--shadow-glow`, no botão claro em hover, e um desfoque só, `--blur-16`, no cabeçalho. Os cartões se separam do fundo pela cor (`--color-surface` sobre `--color-night`) e pelo filete.
- **Marca.** Um anel com um ponto no centro, em duas versões: a do cabeçalho, em `--color-bright`, e a do rodapé, menor, em `--color-muted`.
- **Foco.** O foco de teclado (`:focus-visible`) desenha em links, botões e campos um anel de espessura `--outline-width-focus` em `--color-blue`, afastado `--outline-offset-focus` do elemento. É a única regra global do app, em `@layer base` de `globals.css`.

## Movimento

Toda animação espera `prefers-reduced-motion: no-preference`. As guiadas por scroll esperam também o suporte a `animation-timeline`. Fora disso, o conteúdo aparece no estado final e a barra de progresso fica com largura zero. As transições de hover continuam com movimento reduzido, como no design.

| O quê | Utilidade | Tokens e keyframes | Onde |
|---|---|---|---|
| Transição de hover | `transition-[…]` | `--default-transition-duration`, `--default-transition-timing-function` | navegação, links, botão |
| Entrada no carregamento | `enter-1` a `enter-4` | `--animate-enter`, que usa `rai-up`, `--duration-enter` e `--ease-enter`; atrasos `--delay-enter-2`, `--delay-enter-3` e `--delay-enter-4` | sobretítulo, título, parágrafo e ações da abertura, nessa ordem |
| Subida ao entrar na janela | `reveal-1` a `reveal-3` | `rai-up` | colunas da Missão, escalonadas; cabeçalhos de Times e Principais soluções; linhas das soluções; as duas colunas do Comece |
| Deslize dos lados | `slide-from-left`, `slide-from-right` | `rai-left`, `rai-right` | cartão do Red Team, da esquerda; do Blue Team, da direita |
| Palavras que acendem | `light-up-1` a `light-up-3` | `rai-lit`, de `--color-unlit` a `--color-bright` | as três palavras do título da Missão, uma depois da outra |
| Barra de progresso | `scroll-progress` | `rai-grow`, na linha do tempo do scroll da página | borda de baixo do cabeçalho |
| Saída do logo | `fade-on-exit` | `rai-orb` | coluna do logo, enquanto sai da janela |

As animações guiadas por scroll usam `--duration-timeline`, que só existe porque a duração não pode ser zero; quem manda nelas é a posição na janela.

O logo Ondas anima por `requestAnimationFrame`, a 85 ms por quadro contados do relógio. O desenho é função pura do quadro: o mesmo quadro desenha sempre a mesma imagem. Com movimento reduzido, ou com `animated={false}`, ele fica no quadro de partida.

## Componentes

Os componentes ficam em [`web/components/`](web/components/), um por arquivo. Os sete blocos da página, marcados com `data-block`, compõem a Home em [`web/app/page.tsx`](web/app/page.tsx). As peças que eles usam aparecem isoladas, nos seus estados, na rota `/design-system`. Cada peça importa só `react` e as peças irmãs, e o estilo dela são classes de token.

| Bloco | Arquivo | Peças que usa |
|---|---|---|
| `SiteHeader` | `site-header.tsx` | `BrandMark`, `NavPill`, `NavLink`, `ButtonLink` |
| `Hero` | `hero.tsx` | `SectionLabel`, `ButtonLink`, `TextLink`, `OndasLogo`, `OndasCaption` |
| `Mission` | `mission.tsx` | `SectionLabel`, `MissionColumn` |
| `Teams` | `teams.tsx` | `SectionLabel`, `TeamCard`, `TerminalPanel` e as linhas dele |
| `Solutions` | `solutions.tsx` | `SectionLabel`, `TeamBadge` |
| `Start` | `start.tsx` | `SectionLabel`, `ButtonLink`, `TextLink`, `ApiCallCard` |
| `SiteFooter` | `site-footer.tsx` | `BrandMark`, `FooterLink` |

O texto da Home fica nos blocos. `mission.tsx` e `teams.tsx` também exportam o texto das colunas, dos cartões e dos painéis, e os dois painéis prontos (`RedTeamPanel` e `BlueTeamPanel`), para a rota `/design-system` mostrar as peças com o mesmo texto da Home.

| Peça | Arquivo | Propriedades | Estados |
|---|---|---|---|
| `BrandMark` | `brand-mark.tsx` | `variant`: `header` (padrão) ou `footer` | cabeçalho, rodapé |
| `NavPill` | `nav-pill.tsx` | `label`, o nome acessível; `children`, os links | |
| `NavLink` | `nav-link.tsx` | `href?`, `current?` | repouso, hover, foco, atual; sem `href`, inerte |
| `ButtonLink` | `button-link.tsx` | `href?`; `variant`: `page` (padrão) ou `header`, mais estreito e sem quebra | repouso, hover (sobe 1 px e ganha `--shadow-glow`), foco; sem `href`, inerte |
| `TextLink` | `text-link.tsx` | `href?` | repouso, hover, foco; sem `href`, inerte |
| `FooterLink` | `footer-link.tsx` | `href?`, `current?` | repouso, hover, foco, atual; sem `href`, inerte |
| `InertLink` | `inert-link.tsx` | os de um `<a>`, menos `href` | repouso, foco; é o link de uma Lacuna, que não navega |
| `OndasLogo` | `ondas-logo.tsx` | `background?`, qualquer cor CSS, no lugar de `--color-logo-night`; `animated?`, padrão `true`; `frame?`, o quadro de partida (0 escolhe o de repouso) | animado, parado |
| `OndasCaption` | `ondas-caption.tsx` | nenhuma | |
| `SectionLabel` | `section-label.tsx` | `children`, o rótulo; `className?`, para o movimento de entrada | seção, abertura |
| `MissionColumn` | `mission-column.tsx` | `title`, o passo; `children`, o texto; `className?`, para a subida escalonada | |
| `TeamCard` | `team-card.tsx` | `team`: `red` ou `blue`; `stance`, `title`, `description`; `children`, o que fecha o cartão; `className?`, para o movimento de entrada | red, blue |
| `TerminalPanel` | `terminal-panel.tsx` | `children`, as linhas | |
| `TerminalNote` | `terminal-panel.tsx` | `children` | |
| `TerminalLeaderRow` | `terminal-panel.tsx` | `step`, `outcome`, `tone?`: `red`, `blue` ou `subtle` | sem tom e com cada tom |
| `TerminalStageRow` | `terminal-panel.tsx` | `stage`, `tone?`, `children` | sem tom e com cada tom |
| `TeamBadge` | `team-badge.tsx` | `team`: `red` ou `blue`, o tipo `Team`, que as soluções também usam | red, blue |
| `ApiCallCard` | `api-call-card.tsx` | `className?` | |

**O logo Ondas** é texto, sem SVG: uma grade de 64 por 32 caracteres em `--font-logo`, em quatro camadas sobrepostas, cada uma na sua cor. No centro, o agente conversacional é uma esfera de caracteres que gira, em `--color-logo-agent`. Em volta, o anel de guardrails, em `--color-logo-blue`, é feito de ":" que uma varredura de "=" percorre. Os ataques chegam de fora como frentes de onda de "×", em `--color-logo-red`, e quebram no anel, que se fecha em "#" no ponto do impacto. As respostas do agente saem como ondas: as válidas, de "o" e "·" em `--color-logo-gray`, atravessam o anel; as inválidas, de "ø" em `--color-logo-red`, são barradas por dentro. A legenda (`OndasCaption`) nomeia três camadas pelo caractere delas: "×" ataque, ":" guardrails e "*" agente, numa linha só que não quebra.

O componente do logo é o mesmo arquivo nos Temas do Projeto que o desenham; só o fundo passado muda. Na abertura do Hélio, o fundo é `--color-night`, a cor da página.

## O que fazer e o que não fazer

Fazer:

- Usar só os tokens do `@theme`. Um valor novo entra lá primeiro, com nome.
- Dar matiz só com sentido: vermelho para ataque e Red Team, azul para guardrail, Blue Team e foco.
- Escrever títulos em `--font-weight-light`, com a altura de linha e o espaçamento entre letras do papel deles.
- Abrir cada seção com o `SectionLabel`, o rótulo mono em caixa alta, `--tracking-wide-80` e `--color-subtle`, no formato "01 · Missão".
- Separar seções e cartões por filete e por superfície.
- Mostrar o estado final quando o movimento é reduzido ou quando o navegador não tem linha do tempo de scroll.
- Manter os alvos de toque de 44 px e o anel de foco azul.
- Deixar inerte, com `InertLink`, todo link para uma Tela que ainda não existe.

Não fazer:

- Usar uma terceira cor de acento, ou o vermelho e o azul como enfeite.
- Pôr sombra em cartão. A única sombra é a do botão claro em hover.
- Animar sem a guarda de movimento reduzido.
- Escrever cor em hex num componente, inclusive no logo: as cores chegam por classe de token.
- Fundir tokens parecidos dentro deste app. Cada título tem o seu valor; no seu projeto, a decisão é sua, com as Observações abaixo.

## Observações

Inconsistências aparentes que o design carrega e o app reproduz como estão. Corrigi-las cabe ao Autor, no design, ou a você, no seu projeto.

**No design**

1. **Duas regras de CSS sem uso.** O design traz um hover para as classes `chip` e `atk`, que nenhum elemento usa. Elas não foram portadas. A segunda tingiria um fundo de vermelho translúcido um pouco mais forte que `--color-red-12`, e essa tinta ficou sem token.
2. **Um ajuste para telas estreitas que não vale aqui.** O design tem uma regra abaixo de 380 px, mas ela só atinge a legenda de outro logo, o Selo, que o Hélio não mostra. O Hélio não tem ajuste abaixo de 380 px.
3. **Glifo fora da fonte.** A seta "→" não está no subconjunto latin da Geist nem da Geist Mono. As de "Ver os dados →" e "Ver integrações →" saem na fonte do sistema, no design e no app. A seta "↑" de "Voltar ao topo ↑" está no subconjunto e sai em Geist.
4. **A cor de "agente" na legenda.** A legenda pinta o "*" e a palavra "agente" em `--color-muted`, enquanto o logo desenha o agente em `--color-logo-agent`: a cor da legenda não é a da camada que ela nomeia. O vermelho e o azul da legenda têm o valor das camadas deles.
5. **A legenda nomeia três das quatro camadas.** As respostas do agente ficam sem item: as válidas, em `--color-logo-gray`, e as inválidas, "ø" em `--color-logo-red`.
6. **A cor de base do logo não aparece.** O logo declara `--color-logo-bright` como cor do texto, mas cada camada pinta com a própria cor, e nenhum caractere sai nela.
7. **Os outros logos continuam no design.** O Quadro da Home tem uma propriedade, `logo`, que troca o logo da abertura entre quatro desenhos, cada um com a sua legenda. O padrão é "ondas", e o app reproduz só ele. Com um valor fora da lista, o código do Quadro cai em "atual", outro logo, e não no padrão declarado.
8. **Duas setas.** O painel do Blue Team escreve o fluxo com setas ASCII (`->`); o resto da página usa "→".
9. **Um título de outro peso.** O título das colunas da Missão é o único título em `--font-weight-normal`; todos os outros são `--font-weight-light`.
10. **Palavra só de um time.** Só as soluções do Blue Team têm uma palavra em mono ao lado do nome ("antiataque", "ética"). As do Red Team não têm.
11. **Valores de título quase iguais.** Postos lado a lado, aparecem três alturas de linha de título a um centésimo uma da outra (`--leading-103`, `--leading-104`, `--leading-105`) e seis espaçamentos entre letras de título, de `--tracking-tight-10` a `--tracking-tight-40`. De `--tracking-tight-20` em diante, cada um fica a meio centésimo de em do seguinte. Cada título tem o seu.

**No Sistema de design do app**

12. **Tons de terminal sem uso.** `TerminalLeaderRow` e `TerminalStageRow` aceitam os tons `red`, `blue` e `subtle`. A Home usa, nas linhas com pontilhado, só a linha sem tom, `blue` e `red`; nas etapas, só `blue` e `subtle`. A rota `/design-system` mostra só os tons usados.
13. **A quebra fora do `@theme`.** A quebra `narrow` é um `@custom-variant` de `globals.css`, por isso a rota `/design-system`, que lê o `@theme`, não a mostra. Ela está descrita em [Layout](#layout).
14. **Tokens técnicos.** Quatro tokens não vêm do design: `--spacing`, a base da escala de espaçamento do Tailwind; `--duration-timeline`, a duração que a animação guiada por scroll exige, sem efeito visual; e os apelidos `--default-font-family` e `--default-mono-font-family`.
15. **Tokens do logo com o valor de tokens da página.** `--color-logo-red`, `--color-logo-blue`, `--color-logo-gray`, `--color-logo-bright` e `--color-logo-night` têm o valor de `--color-red`, `--color-blue`, `--color-subtle`, `--color-bright` e `--color-night`, e `--font-logo` é a pilha de `--font-mono`. Ficam separados porque guardam os nomes do componente do logo; `--color-logo-agent` só aparece nele. Pela mesma razão, `--leading-1200` conta em milésimos, fora da regra dos centésimos das outras alturas de linha.
