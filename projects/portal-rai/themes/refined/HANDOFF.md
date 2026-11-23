# Handoff do Refined

Este é o briefing para o agente que vai reimplementar o Refined no projeto de quem o consulta. O Refined é um Tema do Projeto `portal-rai`: a Home do portal de um time de Responsible AI. Esta pasta é uma referência para ler, não um template para copiar. O app em `web/` mostra como o design foi resolvido em Next.js com Tailwind 4 e, no acordeão, Base UI, e você leva ao seu projeto o que servir, no arranjo dele.

Tudo o que você precisa está nesta pasta. Nenhum documento depende de link externo.

## O objetivo

A Home do Refined no seu projeto, igual às Capturas [`screenshots/home-1440.png`](screenshots/home-1440.png) e [`screenshots/home-390.png`](screenshots/home-390.png). As duas são idênticas, byte a byte, ao design original renderizado num navegador: elas são o alvo.

As Capturas saíram do Chromium do Playwright 1.65.1 (Chromium 159), em Linux, com `deviceScaleFactor` 1, movimento reduzido e sem toque, depois de as fontes carregarem, com a janela da altura do documento e a página inteira na imagem. Nessas condições a sua Home pode bater pixel a pixel com elas. Outro navegador ou outro sistema desenha o texto de outro jeito: aí a comparação é de olho, e uma diferença no texto não quer dizer que a página esteja errada.

A Home está pronta quando:

- Em 1440 e em 390 px de largura, com movimento reduzido, ela mostra o que as Capturas mostram: as mesmas seções na mesma ordem, o mesmo texto e as mesmas cores, tamanhos e espaçamentos, com a primeira pergunta frequente aberta.
- Com movimento normal, ela se move como descreve a seção [Movimento](DESIGN.md#movimento) do `DESIGN.md`: a abertura entra no carregamento, a faixa de chips corre e para sob o ponteiro, os cartões sobem ao entrar na janela, os títulos do Ciclo acendem, a barra de progresso cresce e o logo anima.
- Com movimento reduzido, tudo aparece no estado final, sem rolar, e a faixa de chips e o logo ficam parados.
- Cada pergunta frequente abre e fecha sozinha, pelo clique e pelo teclado, e diz se está aberta.
- A 760 px ou menos, o cabeçalho rola com a página, a navegação ocupa uma linha própria e as grades ficam com uma coluna.
- As [Lacunas](#lacunas) continuam Lacunas: o formulário aceita digitação e não envia nada.
- Em 390 px nada transborda para o lado, e a página não busca nada fora do próprio servidor: as fontes vão junto.

Reimplementar fiel é o ponto de partida. O que corrigir no design é decisão de quem consulta, a partir das Observações do `DESIGN.md`.

## O que ler, em ordem

1. Este arquivo, até o fim.
2. [`DESIGN.md`](DESIGN.md): o Sistema de design papel por papel (cores, tipografia, layout, formas, movimento, componentes) e as Observações.
3. As Capturas da Home, nas duas larguras, e as da rota do Sistema de design: [`screenshots/design-system-1440.png`](screenshots/design-system-1440.png) mostra cada token com o valor e cada peça isolada, nos seus estados. As Capturas são altas: a da Home em 390 px tem 10.089 px, e a do Sistema de design em 1440 px, 24.351 px. Aberta inteira, uma imagem dessas chega a um agente reduzida a ponto de não se ler: recorte uma faixa para olhar, ou compare pixel a pixel. Os valores vêm de `globals.css`, não da imagem.
4. [`web/app/globals.css`](web/app/globals.css): o `@theme` com todos os valores, as quatro variantes próprias (`hover`, `focus-visible`, `narrow` e `compact`), os keyframes e as utilidades de movimento.
5. [`web/app/fonts.ts`](web/app/fonts.ts) e a pasta [`web/fonts/`](web/fonts/): as duas fontes, o subconjunto e a licença.
6. [`web/app/layout.tsx`](web/app/layout.tsx) e [`web/app/page.tsx`](web/app/page.tsx): a Home montada a partir dos blocos.
7. [`web/components/`](web/components/), na ordem da página: `site-header.tsx`, `hero.tsx`, `teams.tsx`, `cycle.tsx`, `solutions.tsx`, `practice.tsx`, `portal.tsx`, `faq.tsx`, `contact.tsx` e `site-footer.tsx`, abrindo as peças que cada um importa. Cada peça importa só `react` e as peças irmãs, então dá para levar uma de cada vez; a exceção é `faq-accordion.tsx`, que importa o acordeão da Base UI (sem ela, veja [Num projeto sem Base UI](#num-projeto-sem-base-ui)). O logo, em `ondas-logo.tsx`, é o arquivo mais longo: ele é o porte linha a linha do script do design do logo e pode ser levado inteiro, com a legenda em `ondas-caption.tsx`.

Para ver o app rodando, siga [Como rodar](README.md#como-rodar) no README. A rota `/design-system` mostra os estados de hover e foco desenhados lado a lado.

A pasta `origin/` e os testes em `web/tests/` são do Autor: guardam o design cru e comparam o app com ele. Você não precisa deles; o que eles dizem está nas Capturas e nestes documentos.

O código, comentários incluídos, está em inglês; só o texto da interface fica em português, como o design escreveu. Os comentários usam o vocabulário do catálogo. **board** é um arquivo do design original no Claude Design: a Home inteira ou o logo. **origin** é a pasta `origin/`. **screen** é uma página do design, como a Home. **design gap** é uma Lacuna, o que o design deixou em aberto. Os comentários citam também as classes do design (`rf-sec`, `rf-bz`), para você achar a regra de onde cada peça saiu. Os ADRs citados nos comentários são decisões do repositório do catálogo, fora desta pasta. O que importa aqui é o **ADR 0004**, citado em `globals.css`: reproduzir o design como está, o que o `DESIGN.md` diz em "Nomear sem normalizar" e nas Observações.

## O que vale manter

- O texto da interface como está, em português, com os espaços reservados.
- Os tokens com nome e valor, e os valores parecidos separados.
- As fontes no próprio projeto, sem serviço externo, com as pilhas de fallback de `globals.css`.
- A marcação do acordeão: cada pergunta é um título com um botão que diz se ela está aberta, e as perguntas abrem e fecham cada uma por si.
- O logo como componente de texto cujo desenho é função do quadro, parado com movimento reduzido no quadro de repouso.
- O logo da abertura, as Ondas, que é o padrão do design. O design tem uma propriedade para trocar de logo; o app reproduz só o padrão.

## Lacunas

O que o design deixou em aberto e o app reproduz como está. Não são defeitos.

**Links para Telas que ainda não existem.** São dezessete, e no app todos passam por `InertLink`: parecem e recebem foco como link, dizem que estão indisponíveis e não navegam.

| Onde | Links |
|---|---|
| Cabeçalho, navegação | Dados, Playground, Integrações |
| Cabeçalho | botão "Testar um guardrail" |
| Abertura | botões "Testar um guardrail" e "Ver os dados" |
| Na prática | botões "Deixar o agente de ataque tentar" e "Testar um guardrail" |
| No portal | os três cartões: Playground, Dados e Integrações |
| Perguntas frequentes | Playground, na quinta resposta; Dados e Integrações, na sexta |
| Rodapé, coluna Portal | Dados, Playground, Integrações |

**O formulário sem destino.** Nome, E-mail e "Como podemos ajudar?" aceitam digitação, mas não há `<form>` em volta, e "Enviar mensagem" é um `<button type="button">`: não envia nada e não navega.

**Espaços reservados de mídia.** São seis, cada um com o rótulo e a proporção que o design escreveu:

| Onde | Rótulo |
|---|---|
| Times, cartão do Red Team e do Blue Team | "inserir vídeo · 16:10", nos dois |
| No portal, cartão do Playground | "inserir gif · 21:9" |
| No portal, cartões de Dados e de Integrações | "inserir gif · 4:3", nos dois |
| Contato, cartão de mídia | "inserir imagem · 4:5" |

**Espaços reservados de texto**: `[NOME DA COMPANHIA]`, na barra do rodapé, e `[CANAL DO TIME]` e `[E-MAIL DO TIME]`, na linha "Ou fale direto" do Contato e nas duas pílulas do rodapé.

**Dados de exemplo.** O que Na prática mostra são exemplos: o "1 achado novo" do agente de ataque e os quatro turnos do checklist dele, a mensagem citada no cartão dos guardrails, o "bloqueada" "em 14 ms" e o score 0,93 de `prompt_injection`.

Estes funcionam: a marca do cabeçalho, o "Home" da navegação e o do rodapé levam ao topo da página; "Ver o ciclo" leva ao Ciclo; os links das colunas Times e Soluções do rodapé levam às seções deles; e "Voltar ao topo ↑" leva ao início da página.

## Desvios

Onde o app difere do design original, e por quê. Cada um nasceu no código. No seu projeto, escolha entre o app e o design.

**Links e navegação**

1. **Links inertes.** O design escreve esses links com `href="#"`, que pula para o topo da página. O app mantém o `href="#"`, mas o clique não navega (`preventDefault`) e o link leva `aria-disabled="true"`. Os cartões do portal também.

**CSS**

2. **Hover do botão.** Os botões creme sobem 1 px pela propriedade `translate`, e não por `transform`. O efeito é o mesmo.
3. **Giro do ícone das perguntas.** O ícone gira pela propriedade `rotate` (a classe `rotate-45`, com `transition-transform`, que inclui `rotate`), e não por `transform: rotate(45deg)`. O efeito é o mesmo.
4. **Hover em qualquer ponteiro.** A variante `hover:` foi redefinida para valer em qualquer ponteiro, como o `:hover` do design. A do Tailwind espera `(hover: hover)`.
5. **Estados desenhados para a rota.** A rota `/design-system` desenha hover, foco, a faixa de chips pausada e a etapa do Ciclo apagada sem ponteiro, sem teclado e sem rolar, dentro de `data-show-state="hover"`, `"focus"` ou `"unlit"`. Para isso, a variante `hover:` é `&:is(:hover, [data-show-state="hover"] *)`, a variante `focus-visible:` é `&:is(:focus-visible, [data-show-state="focus"] *)`, a regra de foco inclui `[data-show-state="focus"] :is(a, button, input, textarea)`, a pausa de `marquee` também vale dentro de `[data-show-state="hover"]` e `light-up` desenha o título apagado dentro de `[data-show-state="unlit"]`. Na Home nada muda. Ao levar um componente, você pode voltar para `&:hover`, `&:focus-visible` e as regras simples.

**Marcação**

6. **O acordeão da Base UI.** O design escreve um `h3` com um botão de `aria-expanded`, e o app também. A Base UI acrescenta ao botão o `aria-controls`, que aponta para a resposta aberta, e faz da resposta uma `region` nomeada pela pergunta (`role="region"` e `aria-labelledby`), com ids que ela gera. Os atributos `data-*` de estado e o `tabindex="0"` do botão também vêm dela. Nada disso muda um pixel.
7. **`aria-hidden` nos ícones.** Os ícones do Ciclo, das soluções e das perguntas levam `aria-hidden="true"` também no `svg`, além do que os envolve. O desenho não muda.
8. **Ids em inglês.** Os títulos das seções têm ids como `hero-title`, `teams-title` e `faq-title`; o design usa `rf-h1`, `rf-times` e `rf-faq`. Os campos do formulário são `contact-name`, `contact-email` e `contact-message`, com os `name` `name`, `email` e `message`; no design, `rf-nome`/`nome`, `rf-email`/`email` e `rf-msg`/`mensagem`. As âncoras das seções (`times`, `ciclo`, `solucoes`, `na-pratica`, `portal`, `perguntas`, `contato`) e a do topo (`topo`) ficam como no design, porque os links da página apontam para elas.

**Código**

9. **Números gerados.** O número de cada solução ("01." a "04.") e o "etapa 1 de 5" de cada etapa do Ciclo saem da posição na lista, e não estão escritos à mão. O texto é o mesmo.
10. **Peças em arquivos soltos.** O design escreve tudo dentro das seções. O app separa em arquivos as peças que se repetem ou que têm estado próprio, para a rota `/design-system` mostrá-las isoladas: `CycleStep`, `CheckRow`, `PortalCardLink`, `FaqAccordion` com `FaqItem` e `AnswerLink`, `FormField`, `ScrollProgress`, `IconDisc` e as outras da tabela de peças do `DESIGN.md`. `FormField` junta o rótulo e o campo, que o design escreve à mão, três vezes.

**Fontes**

11. **Uma `@font-face` para o Geist Mono.** O Google Fonts declara uma `@font-face` para cada peso que o design do logo pede, 400 e 500, as duas no mesmo arquivo. O app declara uma só, com o eixo de peso inteiro do arquivo, de 100 a 900. O desenho é o mesmo. Para a Instrument Sans, o Google Fonts e o app declaram uma só, com os dois eixos.

**Logo Ondas**

12. **Preferência de movimento mudada com a página aberta.** Ao reduzir o movimento, o app volta ao quadro de partida; quando o movimento volta, ele recomeça desse quadro. O design congela onde estava e, ao voltar, pula o tempo parado. No carregamento os dois se comportam igual.
13. **Propriedades em inglês.** `fundo` virou `background`, `animado` virou `animated` e `quadro` virou `frame`. `frame` recebe só número; o design também aceitava texto.
14. **Cores e tipo por classe de token**, em vez dos valores escritos no `style` do design. Os valores são os mesmos. O fundo que a abertura passa, `fundo="#0D0D0C"` no design, é `var(--color-night)` no app.
15. **Centramento das camadas.** Cada camada de caracteres é centrada pela propriedade `translate`, do Tailwind 4, e não por `transform: translateX(-50%)`. O desenho é o mesmo.
16. **Relógio.** O app começa a contar o tempo no efeito, depois de montar o componente; o design conta do primeiro desenho. A diferença é de um instante e não muda o quadro de partida.

**Rota do Sistema de design**

17. **Sem design de origem.** A rota `/design-system` nasceu no código, com os tokens e o vocabulário da Home. O cabeçalho dela é próprio, com a marca e a pílula de navegação com "Home" e "Sistema de design", e a Home não tem link para ela, porque o design não tem. No topo da rota fica o logo como o design do logo o desenha sozinho: 560 px, no fundo próprio dele, `--color-logo-night`.

## Num projeto sem Tailwind

O estilo do app são classes do Tailwind 4 sobre o `@theme`. Para outro arranjo:

- **Tokens.** Copie as declarações do `@theme` para `:root`, como variáveis CSS com os mesmos nomes. A linha `--*: initial` é do Tailwind (zera o tema padrão) e fica de fora. `--default-font-family` vira o `font-family` da página, e `--default-transition-duration` e `--default-transition-timing-function` viram a duração e a curva de cada `transition`.
- **Classes.** A classe é o nome do token sem o namespace, aplicado à propriedade da classe:

  | Classe | CSS |
  |---|---|
  | `bg-night`, `text-muted`, `border-bright-9`, `text-logo-red` | `background-color`, `color` ou `border-color` com `var(--color-…)` |
  | `text-16`, `text-46-96`, `text-logo` | `font-size: var(--text-…)`, só o tamanho; a altura de linha vem de `leading-*` ou é herdada |
  | `font-medium`, `leading-150`, `tracking-tight-45` | `font-weight`, `line-height` e `letter-spacing` com o token do mesmo nome |
  | `font-sans`, `font-logo` | `font-family: var(--font-…)` |
  | `rounded-16`, `shadow-glow-16`, `backdrop-blur-16` | `border-radius`, `box-shadow` e `backdrop-filter: blur(…)` com o token |
  | `aspect-16-10`, `aspect-21-9`, `aspect-4-3` | `aspect-ratio: var(--aspect-…)` |
  | `px-gutter`, `pt-section-top`, `max-w-column` | `padding-inline: var(--spacing-gutter)`, `padding-top: var(--spacing-section-top)`, `max-width: var(--container-column)` |
  | `gap-2.5`, `min-h-86`, `max-w-140` | um passo da escala: `calc(var(--spacing) * 2.5)` e assim por diante |
  | `grid-cols-2`, `narrow:grid-cols-1` | `grid-template-columns: var(--grid-template-columns-…)` |
  | `duration-slow` | `transition-duration: var(--transition-duration-slow)` |
  | `focus-visible:outline-offset-field` | `outline-offset: var(--outline-offset-field)` no `:focus-visible` |
  | `border-[1.5px]`, `flex-[1_1_0]` | o valor entre colchetes, com `_` no lugar de espaço |
  | `border-t`, `border-b`, `border` | um filete de `1px solid`, na cor da classe `border-*` ao lado |

  As outras classes são utilidades padrão do Tailwind 4, com o CSS da documentação dele. As que o nome não entrega: `antialiased` é `-webkit-font-smoothing: antialiased` com `-moz-osx-font-smoothing: grayscale`, e no Linux não muda o pixel, então as Capturas não conferem a falta dela; `text-balance` e `text-pretty` são `text-wrap: balance` e `pretty`; `tabular-nums` é `font-variant-numeric: tabular-nums`; `size-4.5` é largura e altura no passo da escala; `-bottom-px` é `bottom: -1px`; `hover:-translate-y-px` é `translate: 0 -1px` no `:hover`; `-translate-x-1/2` é `translate: -50% 0`; `rotate-45` é `rotate: 45deg`; `scroll-mt-18` é `scroll-margin-top` no passo 18 da escala; `placeholder:text-mark` é a cor do `::placeholder`; `@container` é `container-type: inline-size`.

- **Variantes.** `hover:` é `:hover` em qualquer ponteiro; `focus-visible:` é `:focus-visible`; `narrow:` é `@media (max-width: 760px)`; `compact:` é `@media (max-width: 480px)`; `pointer-coarse:` é `@media (pointer: coarse)`. `group-hover:` vale no elemento quando o ancestral marcado com `group` está em hover: é o cartão do portal, que muda a mídia e a etiqueta. `group-data-panel-open:` vale quando esse ancestral tem o atributo `data-panel-open`, que a Base UI põe no botão da pergunta aberta.
- **Movimento.** As utilidades de movimento (`enter-*`, `marquee`, `rise`, `light-up` e `scroll-progress`) e a máscara da faixa de chips (`fade-sides`) estão em `globals.css` como `@utility nome { … }`, com as guardas `@media` e `@supports` aninhadas dentro. Troque `@utility nome` por `.nome`, porque o aninhamento já é CSS nativo, e copie os `@keyframes` junto. Em `scroll-progress`, o `transform: scaleX(0)` fora das guardas é a barra em repouso e vai junto. Em `marquee`, a pausa é a faixa dentro do ancestral `group` em hover: `.group:hover .marquee { animation-play-state: paused }`.
- **Reset.** O app conta com o preflight do Tailwind: margens zeradas; títulos que herdam tamanho e peso; links que herdam a cor, sem sublinhado; listas sem marcador e sem recuo; botões e campos que herdam a fonte; `svg` em bloco; e `border-box` em tudo, como o design. Reproduza essa combinação no seu reset.
- **Fontes.** Dois `@font-face`, com os arquivos de `web/fonts/`, `font-display: swap` e o `unicode-range` latin que está em `fonts.ts`: a família "Instrument Sans", com o eixo de peso de 400 a 700 e a largura (`font-stretch`) de 75% a 100%, e a família "Geist Mono", com o eixo de peso de 100 a 900.
- **Logo.** `ondas-logo.tsx` vai inteiro, mas traz classes do Tailwind. O contêiner (`@container relative aspect-square w-full overflow-hidden bg-logo-night font-logo text-logo-bright`) vira `container-type: inline-size; position: relative; aspect-ratio: 1; width: 100%; overflow: hidden`, com o fundo, a família e a cor dos três tokens; o fundo passado pela propriedade `background` vai no `style` e ganha deles. Cada camada (`absolute top-0 left-1/2 -translate-x-1/2 whitespace-pre text-logo leading-1200`) vira `position: absolute; top: 0; left: 50%; translate: -50% 0; white-space: pre; font-size: var(--text-logo); line-height: var(--leading-1200)`, mais a cor dela (`text-logo-agent`, `text-logo-blue`, `text-logo-red` ou `text-logo-gray`). `--text-logo` é medido em `cqw`, a largura do contêiner: sem o `container-type`, os caracteres saem do tamanho errado. A legenda, `ondas-caption.tsx`, são classes de layout e de token, sem nada à parte.

## Num projeto sem Base UI

O acordeão é o único lugar do app com Base UI, em `faq-accordion.tsx`. Para fazê-lo à mão, com o mesmo comportamento:

- **Marcação.** Uma lista (`<ul role="list">`) de itens (`<li>`). Cada item tem um `<h3>` com um `<button type="button" aria-expanded="true">` (ou `"false"`), com a pergunta num `<span>` e o ícone num `<span aria-hidden="true">`, e logo depois a resposta num `<p>`. É a marcação do design. O `aria-controls` no botão e o `role="region"` com `aria-labelledby` na resposta são o acréscimo da Base UI (Desvio 6): leve-os ou não.
- **Estado.** Um conjunto de perguntas abertas, que começa com a primeira. O clique num botão abre ou fecha só aquela pergunta, e várias podem ficar abertas ao mesmo tempo.
- **Resposta.** Ela só existe na página enquanto a pergunta está aberta, sem animação de altura, como no design. Uma resposta fechada não é achada pela busca do navegador; se quiser que seja, mantenha-a com `hidden="until-found"`, o que o design não faz.
- **Ícone.** O disco gira 45° enquanto a pergunta está aberta, com `transition: rotate var(--transition-duration-slow)`, inclusive com movimento reduzido. O app escolhe o estado pelo `data-panel-open` que a Base UI põe no botão; sem ela, use o `[aria-expanded="true"]` do próprio botão, como o design faz com a classe `is-open`.
- **Teclado.** O de um botão nativo: Tab e Shift+Tab passam pelas perguntas e pelos links de uma resposta aberta, e Enter e Espaço abrem e fecham. A Base UI 1.9 não acrescenta setas entre as perguntas, então o botão nativo basta.
- **Foco.** O anel é a regra global de `:focus-visible`, a mesma dos links.

## Num projeto que já usa Tailwind 4

- A linha `--*: initial` zera o tema padrão do projeto inteiro. Num projeto com tema próprio, deixe-a de fora e acrescente os tokens do Refined ao lado dos seus.
- Alguns nomes coincidem com os do tema padrão, com outro valor, e mudam o projeto todo: `--font-sans`, `--default-transition-duration`, `--default-transition-timing-function` e `--default-mono-font-family`, que aqui aponta para `--font-logo`, e não para a família mono do tema padrão, e põe o Geist Mono em todo `code` e `pre` do projeto. Os pesos `--font-weight-normal` e `--font-weight-medium`, a base `--spacing` e `--default-font-family` coincidem com o mesmo valor. `grid-cols-1`, `grid-cols-2` e `grid-cols-3` passam a ler os tokens de grade, com o mesmo resultado das classes padrão.
- As variantes `hover` e `focus-visible` redefinidas em `globals.css` valem para o projeto inteiro. Leve-as só se quiser o hover em qualquer ponteiro em todo lugar; a parte de `data-show-state` só serve à rota `/design-system`.

## Fora do Next.js

- `"use client"` marca os dois componentes do app que rodam no navegador, `InertLink` e `OndasLogo`. As partes do acordeão da Base UI já são componentes de cliente, por isso `faq-accordion.tsx` não leva a diretiva. Fora do Next, ela não tem efeito.
- `LayoutProps<"/">`, em `layout.tsx`, é um tipo das rotas tipadas do Next.
- `@/`, nos imports de `app/`, é o apelido da pasta `web/`, em `tsconfig.json`.
- `fonts.ts` usa o carregador de fonte local do Next. Fora dele, os dois `@font-face` da nota acima fazem o mesmo.
