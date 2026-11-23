# Sistema de design do Refined

O Refined é um Tema do Projeto `portal-rai`: a Home do portal de um time de Responsible AI, quase preta e quente, com um creme de destaque e o vermelho e o azul dos dois times. Este documento descreve o Sistema de design dele nas seções do formato DESIGN.md do Google Labs.

Os valores não estão aqui. A única fonte deles é o bloco `@theme` de [`web/app/globals.css`](web/app/globals.css), e este documento cita cada token pelo nome da variável. Para ver os valores desenhados, abra a rota `/design-system` do app (como rodar está no [README](README.md#como-rodar)) ou as Capturas dela: [`screenshots/design-system-1440.png`](screenshots/design-system-1440.png) e [`screenshots/design-system-390.png`](screenshots/design-system-390.png).

**Como ler os nomes.** A classe do Tailwind é o nome do token sem o prefixo do namespace: `--color-night` dá `bg-night`, `text-night` e `border-night`; `--text-16` dá `text-16`; `--radius-16` dá `rounded-16`; `--spacing-section-top` dá `pt-section-top`; `--container-column` dá `max-w-column`; `--grid-template-columns-2` dá `grid-cols-2`; `--aspect-21-9` dá `aspect-21-9`; `--transition-duration-slow` dá `duration-slow`. Uma cor ou um comprimento de um papel só leva o nome do papel (`--color-cream`, `--spacing-gutter`). Um valor de escala leva o nome do valor: `--text-15` é o tamanho de 15 px, `--text-46-96` cresce de 46 a 96 px, `--leading-150` é a altura de linha 1,5, `--tracking-tight-45` é o espaçamento de 45 milésimos de em negativos, `--radius-12` é o raio de 12 px, `--shadow-glow-16` é o brilho de alfa 0,16, `--aspect-21-9` é a proporção 21 por 9. Os tokens do logo Ondas guardam os nomes do componente dele, com `logo` no nome (`--color-logo-blue`, `--font-logo`, `--text-logo`), e por isso ficam separados dos tokens da página de mesmo valor.

**Nomear sem normalizar.** Cada valor do design tem o seu token, com o nome do valor como ele foi achado, e valores parecidos não foram fundidos. O que parece inconsistente está em [Observações](#observações), para você decidir o que corrigir no seu projeto.

**Só existe o que o Tema tem.** O tema padrão do Tailwind está zerado: a paleta, a escala de tipo, os raios, as sombras e as quebras dele não geram classe. Só a escala de espaçamento volta, pela base `--spacing`.

## Visão geral

![Captura da Home do Refined](screenshots/home-1440.png)

Uma página só, quase preta e quente, que conta a história de dois times em oposição numa coluna estreita e calma. Os neutros vão do preto ao osso, todos puxados para o amarelo, e o destaque não é uma cor de time: é um creme, nos botões, nos links e no anel de foco. O vermelho e o azul têm um sentido só: o vermelho é o ataque e o Red Team; o azul é o guardrail e o Blue Team. Eles aparecem pequenos, nos pontos das pílulas, nos ícones e nos resultados.

Os títulos são de peso normal, com as letras apertadas, e vários têm a primeira linha apagada: "Atacamos primeiro." sobre "Protegemos sempre.", "Dois times," sobre "um ciclo.". Há uma família só para a página, e o mono fica só no logo. A página se separa por superfície, quase sem filete: mídia e painéis um tom acima do fundo, cartões em moldura. Ela se move com calma: entra no carregamento, corre os chips da abertura, sobe os cartões e acende os títulos do ciclo conforme o scroll, e o logo Ondas anima, em caracteres, as ondas que chegam ao anel de guardrails em volta do agente e as que saem dele.

A Home, de cima para baixo:

- **Cabeçalho** fixo com desfoque: marca, navegação em pílula, o botão "Testar um guardrail" e a barra de progresso do scroll.
- **Abertura** centrada: a faixa de chips do que os guardrails avaliam, o título em duas linhas, o parágrafo, dois botões e o logo Ondas com a legenda de caracteres dele.
- **Times (2)**: os cartões do Red Team e do Blue Team, um sob o outro, cada um com um espaço reservado de vídeo e a pílula da postura do time.
- **Ciclo (5)**: a frase "O Red Team procura a falha. O Blue Team fecha a falha." e as cinco etapas, cujos títulos acendem no scroll, com uma nota no fim.
- **Soluções (4)**: quatro cartões em moldura, numerados de "01." a "04.", com o ícone na cor do time.
- **Na prática**: dois cartões em moldura com o que cada time fez, o resultado, um botão e o checklist da rodada.
- **No portal (3)**: cartões-link de Playground, Dados e Integrações, com espaço reservado de GIF e uma etiqueta de ação.
- **Perguntas frequentes (6)**: o acordeão, com a primeira pergunta aberta.
- **Contato**: um cartão de mídia com a pílula "Fale com o time" e o título, ao lado do formulário; embaixo, os canais do time.
- **Rodapé**: a assinatura "Dois times, um ciclo.", os canais do time, três colunas de links e a barra com a marca, `[NOME DA COMPANHIA]` e "Voltar ao topo ↑".

## Cores

Neutros quentes, do escuro ao claro:

| Token | Papel |
|---|---|
| `--color-night` | fundo da página, dos miolos das molduras e do ícone das perguntas; texto do botão creme e da etiqueta de ação em hover; na abertura, fundo do logo |
| `--color-surface` | espaços reservados de mídia, perguntas, cartão de mídia e painel do formulário do Contato |
| `--color-raised` | molduras, botão escuro, etiquetas de ação, discos dos ícones; mídia do cartão do portal em hover |
| `--color-field` | campos do formulário |
| `--color-raised-hover` | botão escuro em hover |
| `--color-field-border` | borda do campo em hover |
| `--color-unlit` | primeira linha do título da abertura e da assinatura do rodapé, primeira frase do Ciclo, títulos das etapas antes de acender |
| `--color-mark` | rótulos dos espaços reservados de mídia, texto de exemplo dos campos |
| `--color-muted` | parágrafos, contagens, rótulos, linha das etapas, marca e resultado comuns do checklist, respostas, legenda do logo, links e barra do rodapé, rótulos dos campos |
| `--color-subtle` | links da navegação, marca do rodapé |
| `--color-pale` | texto sobre mídia, nome da marca na barra do rodapé |
| `--color-icon` | ícones nos discos do Ciclo |
| `--color-chip` | texto dos chips da abertura |
| `--color-cream` | o destaque: botões creme, "Ver o ciclo", links das respostas, etiqueta de ação em hover, anel de foco, barra de progresso |
| `--color-bright` | texto principal, títulos, marca, link da página atual |

Acentos, cada um com um sentido:

| Token | Papel |
|---|---|
| `--color-red` | ataque e Red Team: ponto da pílula e das etapas do Red Team, ícones das soluções do Red Team, "×" e "passou" no checklist |
| `--color-blue` | guardrail e Blue Team: ponto da pílula e das etapas do Blue Team, ícones das soluções do Blue Team, escudo e "bloqueada" no checklist |

Do logo Ondas, com os nomes do componente dele. Cada camada do desenho tem a sua cor, e a legenda pinta a marca de cada camada na cor dela:

| Token | Papel |
|---|---|
| `--color-logo-agent` | o agente, a esfera de caracteres do centro; o "*" da legenda |
| `--color-logo-blue` | o anel de guardrails; o ":" da legenda |
| `--color-logo-red` | o que precisa ser barrado: os ataques que chegam e as respostas inválidas; o "×" da legenda |
| `--color-logo-gray` | o que pode passar: as respostas válidas |
| `--color-logo-bright` | a cor de base do logo, que as camadas cobrem |
| `--color-logo-night` | o fundo padrão do logo; na abertura, o design e o app passam `--color-night` no lugar dele |

Translúcidas, com o nome do alfa em centésimos:

| Token | Papel |
|---|---|
| `--color-header` | fundo do cabeçalho, sob o desfoque |
| `--color-night-55` | fundo da pílula sobre mídia, sob o desfoque |
| `--color-white-4` | fundo da pílula de navegação |
| `--color-white-6` | link da navegação em hover |
| `--color-white-7` | filete de baixo do cabeçalho |
| `--color-white-9` | borda da pílula de navegação |
| `--color-white-10` | link da navegação da página atual |
| `--color-bright-8` | fundo dos chips e das pílulas |
| `--color-bright-9` | filetes: régua do cabeçalho de seção, linhas do Ciclo, barra do rodapé |

## Tipografia

Duas fontes: `--font-sans` (Instrument Sans, com os fallbacks do design) para a página inteira, e `--font-logo` (Geist Mono), só para os caracteres do logo. As duas são fontes variáveis guardadas em [`web/fonts/`](web/fonts/), com a licença ao lado, e carregadas por [`web/app/fonts.ts`](web/app/fonts.ts) só no subconjunto latin. A Instrument Sans tem um eixo de largura e um de peso; a página usa só a largura normal. `--default-font-family` e `--default-mono-font-family` são apelidos delas.

Dois pesos: `--font-weight-normal` nos títulos e no texto; `--font-weight-medium` na marca, nos botões, nos chips, nas pílulas, nos rótulos, nas perguntas e nos títulos dos cartões de Na prática e do portal.

Os tamanhos fixos são nomeados em px. Os fluidos, de `--text-17-20` a `--text-46-96`, crescem com a largura da janela, do mínimo ao máximo que o nome diz. `--text-logo` acompanha a largura do logo, e não a da janela: as 64 colunas de caracteres ocupam o quadrado inteiro. Dois tamanhos só valem na quebra `compact`: `--text-26`, dos títulos de seção, e `--text-18`, dos títulos das etapas. Uma célula vazia herda o valor da base da página.

| Papel | Tamanho | Peso | Altura de linha | Espaçamento entre letras |
|---|---|---|---|---|
| Base da página | `--text-16` | normal | `--leading-150` | |
| Título da abertura | `--text-46-96` | normal | `--leading-94` | `--tracking-tight-45` |
| Assinatura do rodapé | `--text-34-48` | normal | `--leading-102` | `--tracking-tight-40` |
| Títulos de seção | `--text-32`; `--text-26` em `compact` | normal | `--leading-110` | `--tracking-tight-30` |
| Título do Contato | `--text-32` | normal | `--leading-115` | `--tracking-tight-30` |
| Resultados de Na prática | `--text-32` | normal | `--leading-115` | `--tracking-tight-35` |
| Nomes dos times | `--text-28` | normal | `--leading-115` | `--tracking-tight-30` |
| Números das soluções, com algarismos tabulares | `--text-28` | normal | `--leading-100` | `--tracking-tight-40` |
| Frase do Ciclo | `--text-24-30` | normal | `--leading-120` | `--tracking-tight-30` |
| Nomes das soluções | `--text-24` | normal | `--leading-120` | `--tracking-tight-30` |
| Títulos das etapas do Ciclo | `--text-20`; `--text-18` em `compact` | normal | `--leading-130` | `--tracking-tight-20` |
| Títulos dos cartões de Na prática e do portal | `--text-20` | medium | `--leading-125` | `--tracking-tight-20` |
| Parágrafo da abertura | `--text-17-20` | normal | `--leading-150` | `--tracking-tight-20` |
| Parágrafos das seções | `--text-16` | normal | `--leading-150` | `--tracking-tight-10` |
| Respostas das perguntas | `--text-16` | normal | `--leading-155` | `--tracking-tight-10` |
| Perguntas | `--text-16` | medium | | `--tracking-tight-10` |
| Botões e "Ver o ciclo" | `--text-16`; "Ver o ciclo" em `--text-15` em `compact` | medium | | `--tracking-tight-10` |
| Campos do formulário | `--text-16` | normal | | `--tracking-tight-10` |
| Checklist | `--text-15` | normal | `--leading-145` | `--tracking-tight-10` |
| Marca | `--text-15` | medium | | `--tracking-tight-10` |
| Links das colunas do rodapé | `--text-15` | normal | | |
| Notas: sob o Ciclo, sob os resultados, "Ou fale direto" | `--text-14` | normal | `--leading-150` | `--tracking-tight-10` |
| Chips, pílulas, rótulos ("Red Team", "Resultado") e títulos das colunas do rodapé | `--text-14` | medium | | `--tracking-tight-10` |
| Botão do cabeçalho e etiquetas de ação do portal | `--text-14` | medium | | |
| Contagem das seções | `--text-14` | normal | `--leading-100` | `--tracking-0` |
| Navegação, linha das etapas e barra do rodapé | `--text-14` | normal | | |
| Rótulos dos campos | `--text-13` | medium | | `--tracking-tight-10` |
| Legenda do logo | `--text-13` | normal | | |
| Rótulos dos espaços reservados de mídia, em caixa alta | `--text-12` | medium | | `--tracking-wide-140` |
| Caracteres do logo, em `--font-logo` | `--text-logo` | normal | `--leading-1200` | |

Os títulos e as frases curtas equilibram as linhas (`text-balance`), e os parágrafos evitam uma palavra sozinha na última linha (`text-pretty`). A contagem fica colada ao título, no alto, entre parênteses: "Times (2)".

## Layout

- **Largura.** A linha do cabeçalho mede no máximo `--container-page`, com `--spacing-gutter` de respiro de cada lado. Cada seção e o rodapé assentam numa coluna mais estreita, de no máximo `--container-column`, centrada e a `px-5` das bordas da janela (o componente `Column`). A abertura é mais larga, `max-w-280`, e o logo dela mede `w-150`, os dois na escala de espaçamento.
- **Espaçamento.** É a escala do Tailwind, sobre a base `--spacing`: todo comprimento fixo do design é um passo dela (`gap-2.5`, `min-h-86`, `pr-20`). Os espaçamentos fluidos têm nome: `--spacing-gutter`, o respiro lateral do cabeçalho; `--spacing-hero-top`, acima da abertura; `--spacing-logo-top`, acima do logo; `--spacing-section-top`, acima de cada seção e do rodapé; e `--spacing-footer-links-top`, acima das colunas de links do rodapé.
- **Ritmo das seções.** Cada seção depois da abertura tem `--spacing-section-top` acima dela e abre com o cabeçalho de seção, `SectionHeader`: o título com a contagem, uma régua em `--color-bright-9` que ocupa o resto da linha e, em Times, o link creme "Ver o ciclo". O conteúdo vem `mb-10` abaixo. Uma âncora leva a seção a 72px do topo da janela (`scroll-mt-18`), livre do cabeçalho.
- **Grades de colunas iguais.** `--grid-template-columns-2` dá as duas colunas de Soluções, Na prática, No portal e Contato; `--grid-template-columns-3`, as três colunas do rodapé. As colunas podem encolher abaixo do conteúdo. No portal, o primeiro cartão ocupa a linha inteira.
- **Duas quebras: `narrow` e `compact`**, a 760px ou menos e a 480px ou menos, declaradas como `@custom-variant` em `globals.css`, fora do `@theme`. Em `narrow`, o cabeçalho deixa de ser fixo e a navegação ganha uma linha própria, que rola de lado; toda grade passa a `--grid-template-columns-1`; as colunas do rodapé começam todas à esquerda; a resposta das perguntas perde a margem larga da direita; e o cabeçalho de seção aperta os espaços. Em `compact`, os títulos de seção, os títulos das etapas e "Ver o ciclo" diminuem.
- **Ponteiro grosso.** Com `pointer-coarse:`, os links da navegação crescem para 44px de altura. Os outros alvos de toque já têm 44 px de altura mínima (marca, "Ver o ciclo", links do rodapé), os botões têm `min-h-12` e as perguntas, `min-h-18`.
- **Camadas.** O cabeçalho fica por cima da página, com `--color-header` sob o desfoque `--blur-16`. A barra de progresso, em `--color-cream`, corre na borda de baixo dele. Sobre a mídia dos times, a pílula da postura fica no canto, com `--color-night-55` sob o desfoque `--blur-10`.

## Formas

| Token | Onde |
|---|---|
| `--radius-9` | miolo das molduras |
| `--radius-10` | botão do cabeçalho, campos do formulário |
| `--radius-12` | botões |
| `--radius-16` | mídia, molduras, perguntas, cartão de mídia e painel do Contato, cartão do portal |
| `--radius-pill` | pílula de navegação e links dela, chips, pílulas, etiquetas de ação |
| `--radius-circle` | marca, pontos dos times, discos dos ícones, ícone das perguntas |

| Token | Onde |
|---|---|
| `--aspect-16-10` | mídia dos times |
| `--aspect-21-9` | mídia do cartão do Playground, o primeiro do portal, que ocupa a linha inteira |
| `--aspect-4-3` | mídia dos cartões de Dados e de Integrações |

- **Superfície em vez de filete.** A página separa as partes pelo tom: `--color-surface` e `--color-raised` sobre `--color-night`. Filete só há na régua do cabeçalho de seção, entre as etapas do Ciclo e no topo da barra do rodapé, em `--color-bright-9`, e embaixo do cabeçalho, em `--color-white-7`.
- **Moldura.** O cartão das soluções e de Na prática é uma moldura em `--color-raised`, `p-2` em volta de um miolo em `--color-night` com o raio menor, `--radius-9`.
- **Profundidade.** Os únicos brilhos são creme, nos botões: `--shadow-glow-16` no botão creme em repouso, `--shadow-glow-28` nele em hover e `--shadow-glow-22` no botão do cabeçalho em hover. Os desfoques são dois: `--blur-16` no cabeçalho e `--blur-10` na pílula sobre mídia. A faixa de chips esmaece nas bordas por uma máscara, a utilidade `fade-sides`.
- **Marca.** Um anel com um ponto no centro, em duas versões: a do cabeçalho, em `--color-bright`, e a do rodapé, menor, em `--color-subtle`.
- **Foco.** O foco de teclado (`:focus-visible`) desenha em links, botões e campos um anel de espessura `--outline-width-focus` em `--color-cream`, afastado `--outline-offset-focus` do elemento; nos campos do formulário o anel fica mais perto, a `--outline-offset-field`. É a regra global do app, em `@layer base` de `globals.css`, ao lado da rolagem suave até as âncoras.

## Movimento

Toda animação espera `prefers-reduced-motion: no-preference`. As guiadas por scroll esperam também o suporte a `animation-timeline`. Fora disso, o conteúdo aparece no estado final, a faixa de chips fica parada nos primeiros chips e a barra de progresso fica com largura zero. As transições de hover, inclusive o giro do ícone das perguntas, continuam com movimento reduzido, como no design. A rolagem suave até as âncoras só vale sem movimento reduzido.

| O quê | Utilidade | Tokens e keyframes | Onde |
|---|---|---|---|
| Transição de hover | `transition-[…]` | `--default-transition-duration`, `--default-transition-timing-function` | navegação, links, botões, etiqueta de ação |
| Transição lenta | `duration-slow` | `--transition-duration-slow` | mídia do cartão do portal em hover, giro do ícone das perguntas |
| Entrada no carregamento | `enter-1` a `enter-5` | `--animate-enter`, que usa `rf-up`, `--duration-enter` e `--ease-enter`; atrasos `--delay-enter-2`, `--delay-enter-3`, `--delay-enter-4` e `--delay-enter-5` | chips, título, parágrafo, botões e logo da abertura, nessa ordem |
| Faixa de chips | `marquee` | `--animate-marquee`, que usa `rf-marquee` e `--duration-marquee` | chips da abertura, em duas cópias que correm para a esquerda; pausa sob o ponteiro |
| Subida ao entrar na janela | `rise` | `rf-up` | cartões dos times, das soluções, de Na prática e do portal |
| Títulos que acendem | `light-up` | `rf-lit`, de `--color-unlit` a `--color-bright` | títulos das cinco etapas do Ciclo, um depois do outro |
| Barra de progresso | `scroll-progress` | `rf-grow`, na linha do tempo do scroll da página | borda de baixo do cabeçalho |

As animações guiadas por scroll usam `--duration-timeline`, que só existe porque a duração não pode ser zero; quem manda nelas é a posição na janela.

O logo Ondas anima por `requestAnimationFrame`, a 85 ms por quadro contados do relógio. O desenho é função pura do quadro: o mesmo quadro desenha sempre a mesma imagem. Com movimento reduzido, ou com `animated={false}`, ele fica no quadro de partida.

## Componentes

Os componentes ficam em [`web/components/`](web/components/), um por arquivo. Os dez blocos da página, marcados com `data-block`, compõem a Home em [`web/app/page.tsx`](web/app/page.tsx); os sete blocos entre a abertura e o rodapé passam o nome do bloco a `Section`, que escreve o `data-block`. As peças que eles usam aparecem isoladas, nos seus estados, na rota `/design-system`. Cada peça importa só `react` e as peças irmãs, menos o acordeão, que importa também a Base UI; o estilo de cada uma são classes de token.

| Bloco | Arquivo | Peças que usa |
|---|---|---|
| `SiteHeader` | `site-header.tsx` | `BrandMark`, `NavPill`, `NavLink`, `ButtonLink`, `ScrollProgress` |
| `Hero` | `hero.tsx` | `ChipStrip`, `ButtonLink`, `OndasLogo`, `OndasCaption` |
| `Teams` | `teams.tsx` | `Section`, `SectionHeader`, `MediaPlaceholder`, `Pill`, `Paragraph` |
| `Cycle` | `cycle.tsx` | `Section`, `SectionHeader`, `CycleStep`, `Paragraph` |
| `Solutions` | `solutions.tsx` | `Section`, `SectionHeader`, `Bezel`, `IconDisc`, `Paragraph` |
| `Practice` | `practice.tsx` | `Section`, `SectionHeader`, `Bezel`, `ButtonLink`, `CheckRow`, `Paragraph` |
| `Portal` | `portal.tsx` | `Section`, `SectionHeader`, `PortalCardLink` |
| `Faq` | `faq.tsx` | `Section`, `SectionHeader`, `FaqAccordion`, `FaqItem`, `AnswerLink` |
| `Contact` | `contact.tsx` | `Section`, `Pill`, `MediaMark`, `Paragraph`, `FormField` e as classes do botão creme |
| `SiteFooter` | `site-footer.tsx` | `Column`, `Pill`, `FooterLink`, `BrandMark` |

O texto da Home fica nos blocos.

| Peça | Arquivo | Propriedades | Estados |
|---|---|---|---|
| `BrandMark` | `brand-mark.tsx` | `variant`: `header` (padrão) ou `footer` | cabeçalho, rodapé |
| `NavPill` | `nav-pill.tsx` | `label`, o nome acessível; `children`, os links | |
| `NavLink` | `nav-link.tsx` | `href?`, `current?` | repouso, hover, foco, atual; sem `href`, inerte |
| `ButtonLink` | `button-link.tsx` | `variant`: `primary` (padrão, o creme), `secondary` (o escuro) ou `header`; `className?`, para o lugar | repouso, hover, foco, em cada variante; sempre inerte. `buttonClassName(variant, extra)` dá as mesmas classes a um `<button>` |
| `ScrollProgress` | `scroll-progress.tsx` | nenhuma; a moldura dela é posicionada | cresce com o scroll; parada em zero com movimento reduzido |
| `ChipStrip` | `chip-strip.tsx` | `className?`, para o movimento de entrada | correndo, pausada sob o ponteiro |
| `SectionHeader` | `section-header.tsx` | `id`, do título; `title`; `count?`; `link?`, com `label` e `href` | com contagem e link (repouso, hover, foco do link), sem contagem |
| `Section` | `section.tsx` | `block`, o nome do bloco; `id`, a âncora; `labelledBy?`; `children` | |
| `Column` | `section.tsx` | `children?`; `className?`, para o lugar | |
| `Paragraph` | `paragraph.tsx` | `small?`; `tone`: `muted` (padrão) ou `pale`, sobre mídia; `className?`, para o lugar | padrão, pequeno, sobre mídia |
| `Pill` | `pill.tsx` | `dot?`: `red` ou `blue`; `onMedia?`, no canto da mídia | sem ponto, red, blue, sobre mídia |
| `MediaPlaceholder` | `media-placeholder.tsx` | `mark`, o rótulo; `className?`, a proporção e o fundo em hover; `children?`, o que fica sobre a mídia | 16:10, 4:3 |
| `MediaMark` | `media-placeholder.tsx` | `children`, o rótulo; `className?`, para o lugar | |
| `IconDisc` | `icon-disc.tsx` | `children`, o desenho; `tone`: `icon` (padrão), `red` ou `blue` | cada tom |
| `Bezel` | `bezel.tsx` | `as`: `li` (padrão) ou `article`; `layout`: `spread` (padrão, as soluções) ou `stack` (Na prática); `className?`; `coreClassName?` | spread, stack |
| `CycleStep` | `cycle-step.tsx` | `title`; `team`: `Red Team` ou `Blue Team`; `icon`: `next` ou `again`; `number` e `total`, para "etapa 1 de 5" | apagado, aceso |
| `CheckRow` | `check-row.tsx` | `mark`: `check`, `cross` ou `shield`; `text`; `result`; `tone?`: `red` ou `blue` | cada marca e tom |
| `PortalCardLink` | `portal-card-link.tsx` | `name`, `description`, `action`; `mark` e `aspect`, da mídia; `wide?`, a linha inteira | repouso, hover (a mídia clareia e a etiqueta vira creme), foco; sempre inerte |
| `FaqAccordion` | `faq-accordion.tsx` | `children`, as perguntas; `defaultOpen?`, os índices abertos na chegada | repouso, foco |
| `FaqItem` | `faq-accordion.tsx` | `index`; `question`; `children`, a resposta | aberta, fechada |
| `AnswerLink` | `faq-accordion.tsx` | `children` | repouso, foco; sempre inerte |
| `FormField` | `form-field.tsx` | `id`, `label`, `name`, `placeholder`; `type`: `text` (padrão), `email` ou `message`, a área de texto; `autoComplete?` | repouso, hover, foco, mensagem |
| `FooterLink` | `footer-link.tsx` | `href?`, `current?` | repouso, hover, foco, atual; sem `href`, inerte |
| `InertLink` | `inert-link.tsx` | os de um `<a>`, menos `href` | repouso, foco; é o link de uma Lacuna, que não navega |
| `OndasLogo` | `ondas-logo.tsx` | `background?`, qualquer cor CSS, no lugar de `--color-logo-night`; `animated?`, padrão `true`; `frame?`, o quadro de partida (0 escolhe o de repouso) | animado, parado, no fundo da página |
| `OndasCaption` | `ondas-caption.tsx` | nenhuma | |

**O acordeão** das perguntas é o da Base UI. `FaqAccordion` é a lista, em que várias perguntas podem ficar abertas ao mesmo tempo, e `FaqItem` é uma pergunta: um título com um botão que diz se ela está aberta, e a resposta num parágrafo. A resposta aparece sem animação de altura e sai da página quando a pergunta fecha. O ícone, um "+" num disco `--color-night`, gira 45° em `--transition-duration-slow` e vira um "×". A pergunta não tem estilo de hover, só o cursor. Em telas estreitas, uma pergunta longa quebra em duas linhas e o item cresce além da altura mínima.

**O logo Ondas** é texto, sem SVG: uma grade de 64 por 32 caracteres em `--font-logo`, em quatro camadas sobrepostas, cada uma na sua cor. No centro, o agente conversacional é uma esfera de caracteres que gira, em `--color-logo-agent`. Em volta, o anel de guardrails, em `--color-logo-blue`, é feito de ":" que uma varredura de "=" percorre. Os ataques chegam de fora como frentes de onda de "×", em `--color-logo-red`, e quebram no anel, que se fecha em "#" no ponto do impacto. As respostas do agente saem como ondas: as válidas, de "o" e "·" em `--color-logo-gray`, atravessam o anel; as inválidas, de "ø" em `--color-logo-red`, são barradas por dentro. A legenda (`OndasCaption`) nomeia três camadas pelo caractere delas: "×" ataque, ":" guardrails e "*" agente, cada caractere na cor da camada, centrada abaixo do logo.

O componente do logo é o mesmo arquivo nos Temas do Projeto que o desenham; só o fundo passado muda. Na abertura do Refined, o fundo é `--color-night`, a cor da página.

## O que fazer e o que não fazer

Fazer:

- Usar só os tokens do `@theme`. Um valor novo entra lá primeiro, com nome.
- Dar destaque com o creme: botões, links e foco.
- Dar matiz só com sentido: vermelho para ataque e Red Team, azul para guardrail e Blue Team, em peças pequenas como pontos, ícones e resultados.
- Escrever títulos em `--font-weight-normal`, com a altura de linha e o espaçamento entre letras do papel deles. Num título de duas linhas, a primeira pode ficar em `--color-unlit`.
- Abrir cada seção com o `SectionHeader`: título, contagem, régua e, se houver, o link creme.
- Separar as partes por superfície, e os cartões por moldura.
- Mostrar o estado final quando o movimento é reduzido ou quando o navegador não tem linha do tempo de scroll.
- Manter os alvos de toque de 44 px e o anel de foco creme.
- Deixar inerte, com `InertLink`, todo link para uma Tela que ainda não existe.

Não fazer:

- Usar o vermelho e o azul como destaque ou enfeite, ou acrescentar uma terceira cor.
- Pôr filete onde a página separa por superfície.
- Pôr sombra em cartão. Os únicos brilhos são os dos botões creme.
- Animar sem a guarda de movimento reduzido.
- Escrever cor em hex num componente, inclusive no logo: as cores chegam por classe de token.
- Fundir tokens parecidos dentro deste app. Cada título tem o seu valor; no seu projeto, a decisão é sua, com as Observações abaixo.

## Observações

Inconsistências aparentes que o design carrega e o app reproduz como estão. Corrigi-las cabe ao Autor, no design, ou a você, no seu projeto.

**No design**

1. **Uma classe sem uso.** O design traz uma classe de link sublinhado em creme, `rf-inl`, que nenhum elemento usa. Ela divide a regra com os links das respostas, então não sobrou token sem uso.
2. **O eixo de largura pedido e não usado.** O design pede a Instrument Sans com o eixo de largura, de 75 a 100, e o de peso, de 400 a 700, mas a página usa só a largura normal e dois pesos, `--font-weight-normal` e `--font-weight-medium`. O app guarda o arquivo que o design recebe, com os dois eixos inteiros.
3. **O logo de reserva não é o padrão.** O Quadro da Home tem uma propriedade, `logo`, que troca o logo da abertura entre quatro desenhos, cada um com a sua legenda. O padrão declarado é "ondas", e o app reproduz só ele. Com um valor fora da lista, o código do Quadro cai em "selo", outro logo, e não no padrão declarado.
4. **Dois pretos.** O fundo próprio do logo, `--color-logo-night`, é um preto frio, o do Hélio; o da página, `--color-night`, é quente. A Home passa o da página ao logo. A diferença é pequena a ponto de passar na comparação por pixel, e por isso o teste confere a cor dos cantos do logo à parte.
5. **Um cinza frio na paleta quente.** O "*" da legenda e o agente do logo são `--color-logo-agent`, um cinza frio, como o `--color-logo-gray` das respostas válidas, no meio dos neutros quentes da página.
6. **A legenda nomeia três das quatro camadas.** As respostas do agente ficam sem item: as válidas, em `--color-logo-gray`, e as inválidas, "ø" em `--color-logo-red`.
7. **A cor de base do logo não aparece.** O logo declara `--color-logo-bright` como cor do texto, mas cada camada pinta com a própria cor, e nenhum caractere sai nela.
8. **Ícones do Ciclo sem a cor do time.** Os ícones das soluções tomam a cor do time; os do Ciclo ficam em `--color-icon`, embora cada etapa tenha o ponto do time na linha de baixo.
9. **Um espaço sem efeito.** A nota que fecha o Ciclo ("A cada nova versão de agente…") é uma linha flexível com `gap-2.5` e um filho só: o espaço não aparece. Parece sobra de um ícone que saiu.
10. **Os títulos do Ciclo acendem juntos.** A faixa de rolagem em que cada título acende, de `entry 40%` a `cover 45%` da passagem dele pela janela, é longa: numa janela larga, o primeiro título ainda acende quando o último começa. Eles acendem em ordem, não um de cada vez.
11. **Duas seções fora do padrão.** Na prática tem o cabeçalho de seção sem contagem, embora mostre dois cartões. O Contato não tem cabeçalho de seção: o título dele é um `h2` de estilo próprio, dentro do cartão de mídia.
12. **Títulos do rodapé depois do último título de seção.** Os títulos das colunas do rodapé são `h3`, e o último `h2` da página é o do Contato: na ordem dos títulos, Portal, Times e Soluções ficam como partes de "Coloque seu agente à prova.".
13. **Espaçamento entre letras que falta.** A contagem das seções é `--tracking-0`, ao lado do título em `--tracking-tight-30`. A etiqueta de ação do portal não tem espaçamento, e a pílula, com a mesma forma e o mesmo tamanho, tem `--tracking-tight-10`. O botão do cabeçalho também não tem, e os outros botões têm `--tracking-tight-10`.
14. **A pergunta sem hover.** Todo link e todo botão da página mudam em hover; a pergunta do acordeão só troca o cursor.
15. **Valores de título quase iguais.** Postos lado a lado, aparecem sete espaçamentos entre letras, de `--tracking-0` a `--tracking-tight-45`; `--tracking-tight-35` só existe nos resultados de Na prática, entre o `--tracking-tight-30` dos títulos e o `--tracking-tight-40` dos números. As alturas de linha dos títulos de seção, dos cartões e das etapas, de `--leading-110` a `--leading-130`, andam de cinco em cinco centésimos. Cada título tem o seu.

**No Sistema de design do app**

16. **As quebras fora do `@theme`.** As quebras `narrow` e `compact` são `@custom-variant` de `globals.css`, por isso a rota `/design-system`, que lê o `@theme`, não as mostra. Elas estão descritas em [Layout](#layout).
17. **Tokens técnicos.** Quatro tokens não vêm do design: `--spacing`, a base da escala de espaçamento do Tailwind; `--duration-timeline`, a duração que a animação guiada por scroll exige, sem efeito visual; e os apelidos `--default-font-family` e `--default-mono-font-family`.
18. **Tokens do logo com o valor de tokens da página.** `--color-logo-red` e `--color-logo-blue` têm o valor de `--color-red` e `--color-blue`, e `--leading-1200` o de `--leading-120`. Ficam separados porque guardam os nomes do componente do logo, que todo Tema copia como está; pela mesma razão, `--leading-1200` conta em milésimos, fora da regra dos centésimos das outras alturas de linha. `--color-logo-agent`, `--color-logo-gray`, `--color-logo-bright` e `--color-logo-night` só aparecem no logo e na legenda.
