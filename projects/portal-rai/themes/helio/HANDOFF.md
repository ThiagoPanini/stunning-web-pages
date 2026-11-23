# Handoff do Hélio

Este é o briefing para o agente que vai reimplementar o Hélio no projeto de quem o consulta. O Hélio é um Tema do Projeto `portal-rai`: a Home do portal de um time de Responsible AI. Esta pasta é uma referência para ler, não um template para copiar. O app em `web/` mostra como o design foi resolvido em Next.js com Tailwind 4, e você leva ao seu projeto o que servir, no arranjo dele.

Tudo o que você precisa está nesta pasta. Nenhum documento depende de link externo.

## O objetivo

A Home do Hélio no seu projeto, igual às Capturas [`screenshots/home-1440.png`](screenshots/home-1440.png) e [`screenshots/home-390.png`](screenshots/home-390.png). As duas são idênticas, byte a byte, ao design original renderizado num navegador: elas são o alvo.

As Capturas saíram do Chromium do Playwright 1.65.1 (Chromium 159), em Linux, com `deviceScaleFactor` 1, movimento reduzido e sem toque, depois de as fontes carregarem, com a janela da altura do documento e a página inteira na imagem. Nessas condições a sua Home pode bater pixel a pixel com elas. Outro navegador ou outro sistema desenha o texto de outro jeito: aí a comparação é de olho, e uma diferença no texto não quer dizer que a página esteja errada.

A Home está pronta quando:

- Em 1440 e em 390 px de largura, com movimento reduzido, ela mostra o que as Capturas mostram: as mesmas seções na mesma ordem, o mesmo texto e as mesmas cores, tamanhos e espaçamentos.
- Com movimento normal, ela se move como descreve a seção [Movimento](DESIGN.md#movimento) do `DESIGN.md`: a abertura entra no carregamento, as seções se revelam no scroll, as palavras do título da Missão acendem, os cartões dos times deslizam dos lados, a barra de progresso cresce e o logo anima.
- Com movimento reduzido, tudo aparece no estado final, sem rolar, e o logo fica parado.
- A 760 px ou menos, o cabeçalho rola com a página e a navegação ocupa uma linha própria.
- As [Lacunas](#lacunas) continuam Lacunas.
- Em 390 px nada transborda para o lado, e a página não busca nada fora do próprio servidor: as fontes vão junto.

Reimplementar fiel é o ponto de partida. O que corrigir no design é decisão de quem consulta, a partir das Observações do `DESIGN.md`.

## O que ler, em ordem

1. Este arquivo, até o fim.
2. [`DESIGN.md`](DESIGN.md): o Sistema de design papel por papel (cores, tipografia, layout, formas, movimento, componentes) e as Observações.
3. As Capturas da Home, nas duas larguras, e as da rota do Sistema de design: [`screenshots/design-system-1440.png`](screenshots/design-system-1440.png) mostra cada token com o valor e cada peça isolada, nos seus estados. As Capturas são altas: a da Home em 390 px tem 5.753 px, e a do Sistema de design em 1440 px, 15.027 px. Aberta inteira, uma imagem dessas chega a um agente reduzida a ponto de não se ler: recorte uma faixa para olhar, ou compare pixel a pixel. Os valores vêm de `globals.css`, não da imagem.
4. [`web/app/globals.css`](web/app/globals.css): o `@theme` com todos os valores, as duas variantes próprias (`hover` e `narrow`), os keyframes e as utilidades de movimento.
5. [`web/app/fonts.ts`](web/app/fonts.ts) e a pasta [`web/fonts/`](web/fonts/): as duas fontes, o subconjunto e a licença.
6. [`web/app/layout.tsx`](web/app/layout.tsx) e [`web/app/page.tsx`](web/app/page.tsx): a Home montada a partir dos blocos.
7. [`web/components/`](web/components/), na ordem da página: `site-header.tsx`, `hero.tsx`, `mission.tsx`, `teams.tsx`, `solutions.tsx`, `start.tsx` e `site-footer.tsx`, abrindo as peças que cada um importa. Cada peça importa só `react` e as peças irmãs, então dá para levar uma de cada vez. O logo, em `eclusa-logo.tsx`, é o arquivo mais longo: ele é o porte linha a linha do desenho original e pode ser levado inteiro.

Para ver o app rodando, siga [Como rodar](README.md#como-rodar) no README. A rota `/design-system` mostra os estados de hover e foco desenhados lado a lado.

A pasta `origin/` e os testes em `web/tests/` são do Autor: guardam o design cru e comparam o app com ele. Você não precisa deles; o que eles dizem está nas Capturas e nestes documentos.

O código, comentários incluídos, está em inglês; só o texto da interface fica em português, como o design escreveu. Os comentários usam o vocabulário do catálogo. **board** é um arquivo do design original no Claude Design: a Home inteira ou o logo. **origin** é a pasta `origin/`. **screen** é uma página do design, como a Home. Os ADRs citados nos comentários são decisões do repositório do catálogo, fora desta pasta. O que importa aqui é o **ADR 0004**, citado em `globals.css`: reproduzir o design como está, o que o `DESIGN.md` diz em "Nomear sem normalizar" e nas Observações.

## O que vale manter

- O texto da interface como está, em português, com os espaços reservados.
- Os tokens com nome e valor, e os valores parecidos separados.
- As fontes no próprio projeto, sem serviço externo, com as pilhas de fallback de `globals.css`.
- O logo como componente SVG cujo desenho é função do quadro, parado com movimento reduzido.
- Um logo só: a Eclusa. O design original tinha uma propriedade para trocar de logo; o Hélio fixou a Eclusa, e as outras variantes ficaram de fora.

## Lacunas

O que o design deixou em aberto e o app reproduz como está. Não são defeitos.

**Links para Telas que ainda não existem.** São onze, e no app todos passam por `InertLink`: parecem e recebem foco como link, dizem que estão indisponíveis e não navegam.

| Onde | Links |
|---|---|
| Cabeçalho, navegação | Dados, Playground, Integrações |
| Cabeçalho | botão "Testar um guardrail" |
| Abertura | botão "Testar um guardrail", link "Ver os dados →" |
| 04 · Comece | botão "Testar um guardrail", link "Ver integrações →" |
| Rodapé | Dados, Playground, Integrações |

**Espaços reservados de texto**, no rodapé: `[NOME DA COMPANHIA]`, `[CANAL DO TIME]` e `[E-MAIL DO TIME]`.

**Mídia**: a Home do Hélio não tem espaço reservado de imagem nem de vídeo.

Estes funcionam: a marca e o "Home" do cabeçalho e do rodapé levam a `/`, e "Voltar ao topo ↑" leva ao início da página.

## Desvios

Onde o app difere do design original, e por quê. Cada um nasceu no código. No seu projeto, escolha entre o app e o design.

**Links e navegação**

1. **Links inertes.** O design escreve esses links com `href="#"`, que pula para o topo da página. O app mantém o `href="#"`, mas o clique não navega (`preventDefault`) e o link leva `aria-disabled="true"`.
2. **Destino da Home.** A marca e o "Home" do cabeçalho e do rodapé apontam para `/`. No design, apontavam para o arquivo do próprio design.

**CSS**

3. **Hover do botão.** O botão sobe 1 px pela propriedade `translate`, e não por `transform`. O efeito é o mesmo.
4. **Hover em qualquer ponteiro.** A variante `hover:` foi redefinida para valer em qualquer ponteiro, como o `:hover` do design. A do Tailwind espera `(hover: hover)`.
5. **Caixas `content-box`.** O preflight do Tailwind põe `border-box` em tudo. O contêiner do cabeçalho, o `main`, o rodapé e o cartão da chamada de API levam `box-content`, para manter as larguras `content-box` do design. Sem isso, o cartão media 640 px em vez de 665 px em 1440 px de largura.
6. **Tamanho do texto no link.** `NavLink` leva o tamanho `--text-14` e `FooterLink` leva `--text-13`, para cada um funcionar isolado. No design, os 14 px estão na pílula da navegação e os 13 px no contêiner do rodapé. O pixel não muda.
7. **Estados desenhados para a rota.** A rota `/design-system` desenha hover e foco sem ponteiro nem teclado, dentro de `data-show-state="hover"` ou `"focus"`. Para isso, a variante `hover:` é `&:is(:hover, [data-show-state="hover"] *)`, e a regra de foco inclui `[data-show-state="focus"] :is(a, button, textarea)`. Na Home nada muda. Ao levar um componente, você pode voltar para `&:hover` e para a regra de foco simples.

**Logo Eclusa**

8. **Preferência de movimento mudada com a página aberta.** Ao reduzir o movimento, o app volta ao quadro de partida; quando o movimento volta, ele recomeça desse quadro. O design congela onde estava e, ao voltar, pula o tempo parado. No carregamento os dois se comportam igual.
9. **Propriedades em inglês.** `fundo` virou `background`, `animado` virou `animated` e `quadro` virou `frame`. `frame` recebe só número; o design também aceitava texto.
10. **Cores por classe de token**, em vez de hex dentro do SVG. Os valores são os mesmos.

**Rota do Sistema de design**

11. **Sem design de origem.** A rota `/design-system` nasceu no código, com os tokens e o vocabulário da Home. O cabeçalho dela é próprio, com a marca e "← Home", e a Home não tem link para ela, porque o design não tem.

## Num projeto sem Tailwind

O estilo do app são classes do Tailwind 4 sobre o `@theme`. Para outro arranjo:

- **Tokens.** Copie as declarações do `@theme` para `:root`, como variáveis CSS com os mesmos nomes. A linha `--*: initial` é do Tailwind (zera o tema padrão) e fica de fora. `--default-font-family` vira o `font-family` da página, e `--default-transition-duration` e `--default-transition-timing-function` viram a duração e a curva de cada `transition`.
- **Classes.** A classe é o nome do token sem o namespace, aplicado à propriedade da classe:

  | Classe | CSS |
  |---|---|
  | `bg-night`, `text-muted`, `border-rule`, `fill-disc`, `stroke-red` | `background-color`, `color`, `border-color`, `fill` ou `stroke` com `var(--color-…)` |
  | `text-15`, `text-36-80` | `font-size: var(--text-…)`, só o tamanho; a altura de linha vem de `leading-*` ou é herdada |
  | `font-light`, `leading-160`, `tracking-tight-35` | `font-weight`, `line-height` e `letter-spacing` com o token do mesmo nome |
  | `rounded-16`, `shadow-glow`, `backdrop-blur-16` | `border-radius`, `box-shadow` e `backdrop-filter: blur(…)` com o token |
  | `px-gutter`, `p-card`, `max-w-page` | `padding-inline: var(--spacing-gutter)`, `padding: var(--spacing-card)`, `max-width: var(--container-page)` |
  | `gap-2.5`, `py-24`, `basis-120` | um passo da escala: `calc(var(--spacing) * 2.5)` e assim por diante |
  | `grid-cols-mission`, `grid-cols-teams` | `grid-template-columns: var(--grid-template-columns-…)` |
  | `grow-(--grow-120)`, `grow-3` | `flex-grow` com a variável entre parênteses, ou com o número |
  | `flex-[1_1_0]`, `border-[1.5px]` | o valor entre colchetes, com `_` no lugar de espaço |
  | `border-t`, `border` | um filete de `1px solid`, na cor da classe `border-*` ao lado |

  As outras classes são utilidades padrão do Tailwind 4, com o CSS da documentação dele. As que o nome não entrega: `antialiased` é `-webkit-font-smoothing: antialiased` com `-moz-osx-font-smoothing: grayscale`, e no Linux não muda o pixel, então as Capturas não conferem a falta dela; `size-4.5` é largura e altura no passo da escala; `-bottom-px` é `bottom: -1px`; `hover:-translate-y-px` é `translate: 0 -1px` no `:hover`.

- **Variantes.** `hover:` é `:hover` em qualquer ponteiro; `narrow:` é `@media (max-width: 760px)`; `pointer-coarse:` é `@media (pointer: coarse)`; `last:` é `:last-child`.
- **Movimento.** As utilidades de movimento (`enter-*`, `reveal-*`, `slide-from-*`, `light-up-*`, `scroll-progress` e `fade-on-exit`) estão em `globals.css` como `@utility nome { … }`, com as guardas `@media` e `@supports` aninhadas dentro. Troque `@utility nome` por `.nome`, porque o aninhamento já é CSS nativo, e copie os `@keyframes` junto. Em `scroll-progress`, o `transform: scaleX(0)` fora das guardas é a barra em repouso e vai junto.
- **Reset.** O app conta com o preflight do Tailwind: margens zeradas; títulos que herdam tamanho e peso; links que herdam a cor, sem sublinhado; `svg` em bloco; e `border-box` em tudo, menos nos quatro elementos `content-box` do Desvio 5. Reproduza essa combinação no seu reset.
- **Fontes.** Dois `@font-face`, com as famílias "Geist" e "Geist Mono", os arquivos de `web/fonts/`, o eixo de peso de 100 a 900, `font-display: swap` e o `unicode-range` latin que está em `fonts.ts`.
- **Logo.** `eclusa-logo.tsx` vai inteiro, mas traz classes do Tailwind. As seis de cor (`fill-disc`, `stroke-blue`, `stroke-blue-soft`, `stroke-blue-pale`, `stroke-red` e `stroke-subtle`) viram regras com a variável da cor. A do contêiner vira `position: relative; aspect-ratio: 1; width: 100%; overflow: hidden; background-color: var(--color-night)`, e a do `svg`, `position: absolute; top: 0; left: 0; display: block`.

## Num projeto que já usa Tailwind 4

- A linha `--*: initial` zera o tema padrão do projeto inteiro. Num projeto com tema próprio, deixe-a de fora e acrescente os tokens do Hélio ao lado dos seus.
- Alguns nomes coincidem com os do tema padrão, com outro valor, e mudam o projeto todo: `--font-sans`, `--font-mono`, `--default-transition-duration` e `--default-transition-timing-function`. Os pesos `--font-weight-light`, `--font-weight-normal` e `--font-weight-medium` e a base `--spacing` coincidem com o mesmo valor.
- A variante `hover` redefinida em `globals.css` vale para o projeto inteiro. Leve-a só se quiser o hover em qualquer ponteiro em todo lugar.

## Fora do Next.js

- `"use client"` marca os dois componentes que rodam no navegador, `InertLink` e `EclusaLogo`. Fora do Next, a diretiva não tem efeito.
- `LayoutProps<"/">`, em `layout.tsx`, é um tipo das rotas tipadas do Next.
- `fonts.ts` usa o carregador de fonte local do Next. Fora dele, os dois `@font-face` da nota acima fazem o mesmo.
