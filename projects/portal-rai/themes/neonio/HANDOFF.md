# Handoff do Neônio

Este é o briefing para o agente que vai reimplementar o Neônio no projeto de quem o consulta. O Neônio é um Tema do Projeto `portal-rai`: a Home do portal de um time de Responsible AI. Esta pasta é uma referência para ler, não um template para copiar. O app em `web/` mostra como o design foi resolvido em Next.js com Tailwind 4, e você leva ao seu projeto o que servir, no arranjo dele.

Tudo o que você precisa está nesta pasta. Nenhum documento depende de link externo.

## O objetivo

A Home do Neônio no seu projeto, igual às Capturas [`screenshots/home-1440.png`](screenshots/home-1440.png) e [`screenshots/home-390.png`](screenshots/home-390.png). As duas são idênticas, byte a byte, ao design original renderizado num navegador: elas são o alvo.

As Capturas saíram do Chromium do Playwright 1.65.1 (Chromium 159), em Linux, com `deviceScaleFactor` 1, movimento reduzido e sem toque, depois de as fontes carregarem, com a janela da altura do documento e a página inteira na imagem. Nessas condições a sua Home pode bater pixel a pixel com elas. Outro navegador ou outro sistema desenha o texto de outro jeito: aí a comparação é de olho, e uma diferença no texto não quer dizer que a página esteja errada.

A Home está pronta quando:

- Em 1440 e em 390 px de largura, com movimento reduzido, ela mostra o que as Capturas mostram: as mesmas seções na mesma ordem, o mesmo texto e as mesmas cores, tamanhos e espaçamentos, com "Atacar" como aba atual do ciclo.
- Com movimento normal, ela se move como descreve a seção [Movimento](DESIGN.md#movimento) do `DESIGN.md`: a faixa de marcas rola e pausa com o ponteiro sobre ela, os hovers fazem transição, as âncoras rolam suave e o logo anima.
- Com movimento reduzido, a faixa de marcas fica parada, nenhuma transição corre, as âncoras saltam e o logo fica parado.
- Um clique numa aba do ciclo leva à etapa dela e a marca como atual; ao rolar, a aba atual acompanha a etapa visível, pela regra da seção Movimento do `DESIGN.md`. As abas são alcançadas com Tab e seguidas com Enter.
- Acima de 760 px, o cabeçalho fica fixo no topo e a barra de abas gruda logo abaixo dele. A 760 px ou menos, o cabeçalho rola com a página e a barra gruda no topo da janela.
- A página muda de layout nas quatro quebras da seção [Layout](DESIGN.md#layout) do `DESIGN.md`: 1100, 900, 760 e 640 px.
- "Contato", no cabeçalho, leva ao rodapé.
- As [Lacunas](#lacunas) continuam Lacunas.
- Em 390 px nada transborda para o lado, e a página não busca nada fora do próprio servidor: as fontes vão junto.

Reimplementar fiel é o ponto de partida. O que corrigir no design é decisão de quem consulta, a partir das Observações do `DESIGN.md`.

## O que ler, em ordem

1. Este arquivo, até o fim.
2. [`DESIGN.md`](DESIGN.md): o Sistema de design papel por papel (cores, tipografia, layout, formas, movimento, componentes) e as Observações.
3. As Capturas da Home, nas duas larguras, e as da rota do Sistema de design: [`screenshots/design-system-1440.png`](screenshots/design-system-1440.png) mostra cada token com o valor e cada peça isolada, nos seus estados. As Capturas são altas: a da Home em 390 px tem 12.113 px, e a do Sistema de design em 1440 px, 20.210 px. Aberta inteira, uma imagem dessas chega a um agente reduzida a ponto de não se ler: recorte uma faixa para olhar, ou compare pixel a pixel. Os valores vêm de `globals.css`, não da imagem.
4. [`web/app/globals.css`](web/app/globals.css): o `@theme` com todos os valores, as variantes próprias (`hover`, `focus-visible` e as quatro quebras `upto-*`), o keyframe da faixa de marcas, a regra de foco e as utilidades de movimento.
5. [`web/app/fonts.ts`](web/app/fonts.ts) e a pasta [`web/fonts/`](web/fonts/): as quatro fontes, o subconjunto e as licenças.
6. [`web/app/layout.tsx`](web/app/layout.tsx) e [`web/app/page.tsx`](web/app/page.tsx): a Home montada a partir dos blocos, com a moldura de filetes em volta de quatro deles.
7. [`web/components/`](web/components/), na ordem da página: `site-header.tsx`, `hero.tsx`, `brands.tsx`, `solutions.tsx`, `integrated-cycle.tsx`, `integrations.tsx`, `data-section.tsx`, `final-cta.tsx` e `site-footer.tsx`, abrindo as peças que cada um importa. Cada peça importa só `react` e as peças irmãs, então dá para levar uma de cada vez. O ciclo tem o único estado da página, em `cycle-tabs.tsx`: a aba atual e o scroll-spy. Os desenhos das soluções e o gráfico de Dados estão nos arquivos `*-illustration.tsx`. O logo, em `ondas-logo.tsx`, é o arquivo mais longo: ele é o porte linha a linha do script do design do logo e pode ser levado inteiro, com a legenda em `ondas-caption.tsx`.

Para ver o app rodando, siga [Como rodar](README.md#como-rodar) no README. A rota `/design-system` mostra os estados de hover e foco desenhados lado a lado.

A pasta `origin/` e os testes em `web/tests/` são do Autor: guardam o design cru e comparam o app com ele. Você não precisa deles; o que eles dizem está nas Capturas e nestes documentos.

O código, comentários incluídos, está em inglês; só o texto da interface fica em português, como o design escreveu. Os comentários usam o vocabulário do catálogo. **board** é um arquivo do design original no Claude Design: a Home inteira ou o logo. **origin** é a pasta `origin/`. **screen** é uma página do design, como a Home. **design gap** é uma Lacuna. Os comentários também citam as classes do design, com o prefixo `uk-` dele (`.uk-btn`, `.uk-cap`), para dizer de onde cada peça veio. Os ADRs citados nos comentários são decisões do repositório do catálogo, fora desta pasta. O que importa aqui é o **ADR 0004**, citado em `globals.css`: reproduzir o design como está, o que o `DESIGN.md` diz em "Nomear sem normalizar" e nas Observações.

## O que vale manter

- O texto da interface como está, em português, com os espaços reservados e as marcas de exemplo.
- Os tokens com nome e valor, e os valores parecidos separados.
- As fontes no próprio projeto, sem serviço externo, com as pilhas de fallback de `globals.css`, inclusive as duas do JetBrains Mono.
- As grades de filetes: células em `--color-page` sobre um fundo `--color-rule`, com vão de 1 px.
- As abas do ciclo como âncoras com scroll-spy, e não como abas de ARIA: a atual com `aria-current="step"`, as outras com `"false"`, como o design escreve.
- O movimento reduzido como o design o trata: sem a faixa rolando, sem nenhuma transição e sem rolagem suave.
- O logo como componente de texto cujo desenho é função do quadro, parado com movimento reduzido no quadro de repouso.

## Lacunas

O que o design deixou em aberto e o app reproduz como está. Não são defeitos.

**Links para Telas e destinos que o design não definiu.** São doze, e no app todos passam por `InertLink`: parecem e recebem foco como link, dizem que estão indisponíveis e não navegam.

| Onde | Links |
|---|---|
| Cabeçalho, navegação | Dados, Playground, Integrações |
| Cabeçalho | bloco "Testar um guardrail" |
| Abertura | botões "Testar um guardrail" e "Ver os dados" |
| Dados | botão "Ver os dados" |
| Chamada final | botões "Testar um guardrail" e "Ver integrações" |
| Rodapé, coluna Portal | Dados, Playground, Integrações |

"Ver integrações" e os links de Dados e de Integrações ficam inertes mesmo com as seções de Integrações e de Dados na própria Home, porque o design os escreve sem destino (Observação 15 do `DESIGN.md`).

**Espaços reservados de mídia.** São onze, todos de GIF, cada um uma caixa em `--color-placeholder` com o rótulo e a proporção que a mídia terá. Nenhum arquivo de mídia existe.

| Onde | Rótulo | Quantos |
|---|---|---|
| Ciclo integrado, uma por etapa | `inserir gif · 6:5` | 5 |
| Integrações, nos cartões do bento | `inserir gif · 16:10` | 4 |
| Integrações, no cartão alto | `inserir gif · 3:5` | 1 |
| Chamada final, a própria seção | `inserir gif · 2:1` | 1 |

**Marcas de exemplo.** A faixa de marcas mostra `[MARCA 1]` a `[MARCA 8]`, cada uma com um desenho geométrico simples no lugar do logo da marca.

**Espaços reservados de texto**, no rodapé: `[NOME DA COMPANHIA]`, `[CANAL DO TIME]` e `[E-MAIL DO TIME]`.

**Dados de exemplo.** O gráfico de Dados é ilustrativo, sem valores: 14 barras de altura fixa, com o rótulo do design no lugar. O score 0,93 e os 14 ms das legendas e das ilustrações são exemplos.

Estes funcionam: a marca do cabeçalho, a do rodapé, "Home" e "Voltar ao topo ↑" levam ao início da página; "Contato" leva ao rodapé; os links de Times levam ao Ciclo integrado, e os de Soluções, às Soluções; cada aba leva à etapa dela.

## Desvios

Onde o app difere do design original, e por quê. Cada um nasceu no código. No seu projeto, escolha entre o app e o design.

**Links e navegação**

1. **Links inertes.** O design escreve esses links com `href="#"`, que pula para o topo da página. O app mantém o `href="#"`, mas o clique não navega (`preventDefault`) e o link leva `aria-disabled="true"`.
2. **Ids sem o prefixo do design.** Os ids de título e de etapa perderam o prefixo `uk-`: `hero-title` (era `uk-h1`), `solutions-title` (`uk-sol`), `red-team-name` (`uk-rt`), `blue-team-name` (`uk-bt`), `cycle-title` (`uk-ciclo`), `cycle-step-1` a `cycle-step-5` (`uk-step-1` a `uk-step-5`), `integrations-title` (`uk-int`), `data-title` (`uk-dados`) e `cta-title` (`uk-cta`). A barra de abas não tem id (era `uk-tabsbar`): o scroll-spy a acha por referência. O keyframe da faixa é `brands-marquee` (era `uk-marquee`). As âncoras das seções ficam como estão: `topo`, `solucoes`, `ciclo`, `integracoes`, `dados` e `contato`.

**CSS**

3. **Hover em qualquer ponteiro.** A variante `hover:` foi redefinida para valer em qualquer ponteiro, como o `:hover` do design. A do Tailwind espera `(hover: hover)`.
4. **Centramento por `translate`.** As etiquetas da ilustração do Agente de Ataque, o quadrado azul do Guardrail Ética Saída, o rótulo da chamada final e as camadas do logo são centrados pela propriedade `translate`, do Tailwind 4, e não por `transform: translate(…)`. O desenho é o mesmo.
5. **Estados desenhados para a rota.** A rota `/design-system` desenha hover e foco sem ponteiro nem teclado, dentro de `data-show-state="hover"` ou `"focus"`. Para isso, a variante `hover:` é `&:is(:hover, [data-show-state="hover"] *)`, a `focus-visible:` é `&:is(:focus-visible, [data-show-state="focus"] *)`, a regra de foco inclui `[data-show-state="focus"] :is(a, button)`, e a faixa de marcas pausa também dentro de `data-show-state="hover"`. Na Home nada muda. Ao levar um componente, você pode voltar para `&:hover`, para o `:focus-visible` do Tailwind e para a regra de foco simples.

**Fontes**

6. **Uma `@font-face` por arquivo.** O Google Fonts declara uma `@font-face` por peso pedido, todas no mesmo arquivo. O app declara uma por arquivo, com o eixo de peso inteiro dele: de 100 a 900 na Inter Tight, na Inter e na Geist Mono, e de 400 a 800 no JetBrains Mono. O desenho é o mesmo.

**Logo Ondas**

7. **Preferência de movimento mudada com a página aberta.** Ao reduzir o movimento, o app volta ao quadro de partida; quando o movimento volta, ele recomeça desse quadro. O design congela onde estava e, ao voltar, pula o tempo parado. No carregamento os dois se comportam igual.
8. **Propriedades em inglês.** `fundo` virou `background`, `animado` virou `animated` e `quadro` virou `frame`. `frame` recebe só número; o design também aceitava texto.
9. **Cores e tipo por classe de token**, em vez dos valores escritos no `style` do design. Os valores são os mesmos.
10. **Relógio.** O app começa a contar o tempo no efeito, depois de montar o componente; o design conta do primeiro desenho. A diferença é de um instante e não muda o quadro de partida.

**Rota do Sistema de design**

11. **Sem design de origem.** A rota `/design-system` nasceu no código, com os tokens e o vocabulário da Home. O cabeçalho dela é próprio, com a marca, "Sistema de design" e "← Home", e a Home não tem link para ela, porque o design não tem. Na abertura da rota fica o logo como o design do logo o desenha sozinho: 560 px, no fundo próprio dele, `--color-logo-night`, e sem o espaçamento entre letras da página (`tracking-[normal]`).

## Num projeto sem Tailwind

O estilo do app são classes do Tailwind 4 sobre o `@theme`. Para outro arranjo:

- **Tokens.** Copie as declarações do `@theme` para `:root`, como variáveis CSS com os mesmos nomes. A linha `--*: initial` é do Tailwind (zera o tema padrão) e fica de fora. `--default-font-family` vira o `font-family` da página, e `--default-transition-duration` e `--default-transition-timing-function` viram a duração e a curva de cada `transition`. `--animate-marquee` é o valor de `animation` da faixa de marcas.
- **Classes.** A classe é o nome do token sem o namespace, aplicado à propriedade da classe:

  | Classe | CSS |
  |---|---|
  | `bg-page`, `text-muted`, `border-rule`, `stroke-muted`, `text-logo-red` | `background-color`, `color`, `border-color` ou `stroke` com `var(--color-…)` |
  | `text-16`, `text-38-64`, `text-logo` | `font-size: var(--text-…)`, só o tamanho; a altura de linha vem de `leading-*` ou é herdada |
  | `font-light`, `leading-1375`, `tracking-tight-10` | `font-weight`, `line-height` e `letter-spacing` com o token do mesmo nome |
  | `font-display`, `font-mono-short`, `font-logo` | `font-family: var(--font-…)` |
  | `rounded-6`, `blur-5` | `border-radius` e `filter: blur(…)` com o token |
  | `px-gutter`, `pt-section`, `min-h-cta-height`, `gap-bars`, `max-w-page` | `padding-inline: var(--spacing-gutter)`, `padding-top: var(--spacing-section)`, `min-height: var(--spacing-cta-height)`, `gap: var(--spacing-bars)`, `max-width: var(--container-page)` |
  | `gap-2.5`, `py-1.75`, `top-13.5`, `scroll-mt-29.5`, `max-w-205`, `leading-5.5` | um passo da escala: `calc(var(--spacing) * 2.5)` e assim por diante, na propriedade da classe |
  | `grid-cols-hero`, `auto-cols-tabs` | `grid-template-columns: var(--grid-template-columns-…)` e `grid-auto-columns: var(--grid-auto-columns-tabs)` |
  | `bg-ruled`, `bg-hatch`, `bg-chart-bar` | `background-image: var(--background-image-…)` |
  | `outline-offset-inset`, `outline-page` | `outline-offset: var(--outline-offset-inset)` e `outline-color: var(--color-page)` |
  | `aspect-324-255`, `aspect-16-10` | `aspect-ratio: var(--aspect-…)` |
  | `top-[58%]`, `h-[46%]`, `tracking-[normal]` | o valor entre colchetes |
  | `border`, `border-t`, `border-x` | um filete de `1px solid`, na cor da classe `border-*` ao lado |
  | `gap-px` | `gap: 1px`, o vão que vira filete nas grades |

  As outras classes são utilidades padrão do Tailwind 4, com o CSS da documentação dele. As que o nome não entrega: `antialiased` é `-webkit-font-smoothing: antialiased` com `-moz-osx-font-smoothing: grayscale`, e no Linux não muda o pixel; `size-2.5` é largura e altura no passo da escala; `-translate-x-1/2` é `translate: -50% 0`, e `-translate-1/2`, `translate: -50% -50%`; `scrollbar-none` é `scrollbar-width: none`; `text-balance` e `text-pretty` são `text-wrap: balance` e `text-wrap: pretty`; `w-max` é `width: max-content`; `opacity-85` é `opacity: 0.85`; `z-25` é `z-index: 25`; `*:overflow-hidden` vale para cada filho direto; `@container` é `container-type: inline-size`.

- **Variantes.** `hover:` é `:hover` em qualquer ponteiro; `focus-visible:` é `:focus-visible`; `upto-1100:`, `upto-900:`, `upto-760:` e `upto-640:` são `@media (max-width: 1100px)` e assim por diante, cada uma valendo na largura do nome e abaixo dela.
- **Movimento e faixa.** As utilidades `transitions-off-when-reduced`, `marquee-viewport` e `marquee-track` estão em `globals.css` como `@utility nome { … }`, com as guardas `@media` aninhadas dentro. Troque `@utility nome` por `.nome`, porque o aninhamento já é CSS nativo, e copie o `@keyframes brands-marquee` junto. Em `transitions-off-when-reduced`, o `!important` fica: é ele que ganha de cada transição com movimento reduzido. A rolagem suave é `html { scroll-behavior: smooth }` dentro de `@media (prefers-reduced-motion: no-preference)`, na `@layer base`.
- **Reset.** O app conta com o preflight do Tailwind: margens zeradas; títulos que herdam tamanho e peso; links que herdam a cor, sem sublinhado; listas sem marcador e sem recuo; `svg` em bloco; e `border-box` em tudo. Reproduza essa combinação no seu reset.
- **Fontes.** Quatro `@font-face`, com as famílias "Inter Tight", "Inter", "JetBrains Mono" e "Geist Mono", os arquivos de `web/fonts/`, o eixo de peso do Desvio 6, `font-display: swap` e o `unicode-range` latin que está em `fonts.ts`.
- **Logo.** `ondas-logo.tsx` vai inteiro, mas traz classes do Tailwind. O contêiner (`@container relative aspect-square w-full overflow-hidden bg-logo-night font-logo text-logo-bright`) vira `container-type: inline-size; position: relative; aspect-ratio: 1; width: 100%; overflow: hidden`, com o fundo, a família e a cor dos três tokens; o fundo passado pela propriedade `background` vai no `style` e ganha deles. Cada camada (`absolute top-0 left-1/2 -translate-x-1/2 whitespace-pre text-logo leading-1200`) vira `position: absolute; top: 0; left: 50%; translate: -50% 0; white-space: pre; font-size: var(--text-logo); line-height: var(--leading-1200)`, mais a cor dela (`text-logo-agent`, `text-logo-blue`, `text-logo-red` ou `text-logo-gray`). `--text-logo` é medido em `cqw`, a largura do contêiner: sem o `container-type`, os caracteres saem do tamanho errado. O logo não define espaçamento entre letras e herda o de onde está: na Home, o `--tracking-tight-10` da página. A legenda, `ondas-caption.tsx`, são classes de layout e de token, sem nada à parte.

## Num projeto que já usa Tailwind 4

- A linha `--*: initial` zera o tema padrão do projeto inteiro. Num projeto com tema próprio, deixe-a de fora e acrescente os tokens do Neônio ao lado dos seus.
- Alguns nomes coincidem com os do tema padrão, com outro valor, e mudam o projeto todo: `--font-sans`, `--font-mono` e `--default-transition-timing-function`. `--color-white`, `--default-transition-duration`, os pesos `--font-weight-light`, `--font-weight-normal` e `--font-weight-medium` e a base `--spacing` coincidem com o mesmo valor.
- As variantes `hover` e `focus-visible` redefinidas em `globals.css` valem para o projeto inteiro. Leve a de `hover` só se quiser o hover em qualquer ponteiro em todo lugar; a de `focus-visible` só serve à rota que desenha os estados (Desvio 5).

## Fora do Next.js

- `"use client"` marca os três componentes que rodam no navegador: `InertLink`, `CycleTabs` e `OndasLogo`. Fora do Next, a diretiva não tem efeito.
- `LayoutProps<"/">`, em `layout.tsx`, é um tipo das rotas tipadas do Next.
- `fonts.ts` usa o carregador de fonte local do Next. Fora dele, as quatro `@font-face` da nota acima fazem o mesmo.
