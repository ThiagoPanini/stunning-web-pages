# Handoff do `portal-rai`

Este é o briefing para o agente que vai reimplementar o `portal-rai` no projeto de quem o consulta: a Home do portal de um time de Responsible AI. Esta pasta é uma referência para ler, não um template para copiar. O app em `web/` mostra como o design foi resolvido em Next.js com Tailwind 4, e você leva ao seu projeto o que servir, no arranjo dele.

Tudo o que você precisa está nesta pasta. Nenhum documento depende de link externo.

## Antes de começar: escolha as versões

O design tem três tweaks, e o app desenha todas as versões deles (a tabela está em [Os tweaks](README.md#os-tweaks), no README). Antes de reimplementar, quem consulta escolhe uma versão de cada: `versaoCiclo` para o ciclo da seção 01, `versaoCards` para os cartões da seção 02 e, se os cartões forem `02-surprise`, `efeitoNeon` para o hover deles. Sem escolha, valem os padrões do design: `06-laco`, `03-middle` e `preenchimento`.

Leve ao seu projeto só as versões escolhidas. O painel de tweaks (`components/tweaks.tsx`) e a leitura do endereço são do Catálogo, para comparar as versões: ficam de fora. No seu projeto, a seção monta direto a versão escolhida, sem `useTweaks`.

## O objetivo

A Home do `portal-rai` no seu projeto, igual às Capturas [`screenshots/home-1440.png`](screenshots/home-1440.png) e [`screenshots/home-390.png`](screenshots/home-390.png), que mostram os padrões dos tweaks. As outras versões estão desenhadas na rota `/design-system` e nas Capturas dela, e o app mostra qualquer uma pelo endereço (`/?versaoCiclo=03-cartoes`). Cada versão é idêntica, pixel a pixel, ao design original renderizado num navegador.

As Capturas saíram do Chromium do Playwright 1.65.1 (Chromium 159), em Linux, com `deviceScaleFactor` 1, movimento reduzido e sem toque, depois de as fontes carregarem, com a janela da altura do documento e a página inteira na imagem. Nessas condições a sua Home pode bater pixel a pixel com elas. Outro navegador ou outro sistema desenha o texto de outro jeito: aí a comparação é de olho, e uma diferença no texto não quer dizer que a página esteja errada.

A Home está pronta quando:

- Em 1440 e em 390 px de largura, com movimento reduzido, ela mostra o que as Capturas mostram, na versão escolhida: as mesmas seções na mesma ordem, o mesmo texto e as mesmas cores, tamanhos e espaçamentos.
- Com movimento normal, ela se move como descreve a seção [Movimento](DESIGN.md#movimento) do `DESIGN.md`: a abertura entra, as seções se revelam no scroll, os parceiros correm, o ciclo anda sozinho e responde ao ponteiro, ao clique e ao teclado, os cartões deslizam dos lados e os dois Ondas animam.
- Com movimento reduzido, tudo aparece no estado final, sem rolar, o ciclo fica na primeira etapa e os Ondas ficam parados.
- As quebras de [Layout](DESIGN.md#layout) valem, inclusive as do meio do caminho, como as etiquetas menores do laço entre 1100 e 1279 px.
- As [Lacunas](#lacunas) continuam Lacunas.
- Em 390 px nada transborda para o lado, e a página não busca nada fora do próprio servidor: as fontes vão junto.

Reimplementar fiel é o ponto de partida. O que corrigir no design é decisão de quem consulta, a partir das Observações do `DESIGN.md`.

## O que ler, em ordem

1. Este arquivo, até o fim.
2. [`DESIGN.md`](DESIGN.md): o Sistema de design papel por papel, as versões dos tweaks e as Observações.
3. As Capturas da Home, nas duas larguras, e as da rota do Sistema de design: [`screenshots/design-system-1440.png`](screenshots/design-system-1440.png) mostra cada token com o valor, cada peça isolada e cada versão dos tweaks, com o neon em hover. As Capturas são altas: a do Sistema de design em 1440 px tem mais de 22 mil px. Aberta inteira, uma imagem dessas chega a um agente reduzida a ponto de não se ler: recorte uma faixa para olhar. Os valores vêm de `globals.css`, não da imagem.
4. [`web/app/globals.css`](web/app/globals.css): o `@theme` com todos os valores, as variantes próprias (`hover` e as quatro quebras), os keyframes, as utilidades de movimento e as dos desenhos do ciclo e do neon.
5. [`web/app/fonts.ts`](web/app/fonts.ts) e a pasta [`web/fonts/`](web/fonts/): as duas fontes, o subconjunto e a licença.
6. [`web/app/layout.tsx`](web/app/layout.tsx) e [`web/app/page.tsx`](web/app/page.tsx): a Home montada a partir dos blocos.
7. [`web/components/`](web/components/), na ordem da página: `site-header.tsx`, `hero.tsx`, `partners.tsx`, `model.tsx`, `teams.tsx` e `site-footer.tsx`. Em `model.tsx`, a versão escolhida do ciclo (`cycle-loop.tsx`, o laço, ou `cycle-cards.tsx`, os cartões, com o trilho em `cycle-rail.tsx`), com o estado em `use-cycle.ts` e as etapas em `cycle-steps.tsx`; em `teams.tsx`, a versão dos cartões (`team-cards-simple.tsx`, `team-cards-surprise.tsx` ou `team-cards-middle.tsx`). Os dois Ondas, `ondas-logo.tsx` e `ondas-mini.tsx`, são portes linha a linha dos scripts do design e podem ser levados inteiros.

Para ver o app rodando, siga [Como rodar](README.md#como-rodar) no README. A rota `/design-system` mostra as versões lado a lado.

A pasta `origin/` e os testes em `web/tests/` são do Autor: guardam o design cru e comparam o app com ele. Você não precisa deles; o que eles dizem está nas Capturas e nestes documentos.

O código, comentários incluídos, está em inglês; só o texto da interface fica em português, como o design escreveu. Os comentários usam o vocabulário do catálogo. **board** é um arquivo do design original no Claude Design: a Home inteira, o logo ou o mini. **origin** é a pasta `origin/`. **tweak** é uma escolha que o design deixa em aberto, com opções e um padrão. Os ADRs citados nos comentários são decisões do repositório do catálogo, fora desta pasta. O que importa aqui é o **ADR 0004**, citado em `globals.css`: reproduzir o design como está, o que o `DESIGN.md` diz em "Nomear sem normalizar" e nas Observações.

## O que vale manter

- O texto da interface como está, em português, com os espaços reservados.
- Os tokens com nome e valor, e os valores parecidos separados.
- As fontes no próprio projeto, sem serviço externo, com as pilhas de fallback de `globals.css`.
- Os dois Ondas como componentes cujo desenho é função do quadro, parados com movimento reduzido no quadro de repouso.
- O ciclo com um estado só para as duas versões, e o botão de cada etapa como o controle dela para o teclado e o leitor de tela; o clique vale na etapa inteira. No laço, as estações repetem o item da lista para o ponteiro e ficam escondidas do leitor de tela, que ouve a metade da etapa ("Antes da produção.") antes do texto dela.
- Nos cartões que seguem o ponteiro, as variáveis de CSS escritas no próprio cartão, sem redesenhar a página a cada movimento.

## Lacunas

O que o design deixou em aberto e o app reproduz como está. Não são defeitos.

**Links para Telas que ainda não existem.** São cinco, e no app todos passam por `InertLink`: parecem e recebem foco como link, dizem que estão indisponíveis e não navegam.

| Onde | Links |
|---|---|
| Cabeçalho, navegação | Dados, Integrações |
| Rodapé | Dados, Playground, Integrações |

**Âncoras para seções que a Home não tem.** "Soluções", na navegação, e "Produtos e soluções", na abertura, levam a `#solucoes`; o botão "Simular um ataque", a `#comece`. O app mantém as âncoras como estão: o clique muda o endereço e a página não rola.

**Espaços reservados de mídia.** Os GIFs foram deixados para depois: um em cada cartão da versão `03-middle`. Cada espaço diz o que vai nele e o tamanho, 16:9 e 1280 × 720.

**Espaços reservados de texto**, no rodapé: `[NOME DA COMPANHIA]`, `[CANAL DO TIME]` e `[E-MAIL DO TIME]`.

**Os parceiros** são marcas inventadas, com marcas desenhadas para o design.

Estes funcionam: a marca e o "Home" do cabeçalho e do rodapé levam a `/`, "Conhecer os times" leva à seção 02, e "Voltar ao topo ↑" leva ao início da página.

## Desvios

Onde o app difere do design original, e por quê. Cada um nasceu no código. No seu projeto, escolha entre o app e o design.

**Tweaks**

1. **As versões pelo endereço e pelo painel.** No design, o valor de um tweak vive no próprio arquivo, e o editor troca a versão. No app, todas as versões estão no código: o endereço escolhe uma (`/?versaoCiclo=03-cartoes&versaoCards=02-surprise&efeitoNeon=contorno`), com os nomes e as opções do design, e o painel de tweaks troca a versão na hora e grava a escolha no endereço, sem os padrões. Um valor fora da lista cai no padrão declarado; o código do design cai em outra versão (Observações 5 e 6 do `DESIGN.md`).
2. **O padrão no HTML.** O export é estático: o HTML traz os padrões, e outra versão aparece quando a página roda. Num link para outra versão, os padrões piscam antes.

**Links e navegação**

3. **Links inertes.** O design escreve esses links com `href="#"`, que pula para o topo da página. O app mantém o `href="#"`, mas o clique não navega (`preventDefault`) e o link leva `aria-disabled="true"`.
4. **Destino da Home.** A marca e o "Home" do cabeçalho e do rodapé apontam para `/`. No design, apontavam para o arquivo do próprio design.

**CSS**

5. **Estados por atributo.** O design marca os estados do ciclo e dos cartões com classes (`is-on`, `is-lit`, `is-fire`, `is-held`, `is-run`, `at-1` a `at-4`, `tm-fx-fill` e as outras). O app usa atributos: `data-on`, `data-lit`, `data-fire`, `data-held`, `data-run`, `data-neon` e `data-team`, lidos pelas classes dos componentes e pelas utilidades de `globals.css`. A metade acesa do laço, que o design tira de `at-1` a `at-4` na raiz, é `data-on` no próprio lóbulo e no nome da metade.
6. **O neon a partir da cor.** O design guarda o núcleo e a luz de cada time como três números de canal e pinta com `rgba()` sobre eles. O app guarda as cores como tokens e pinta com a sintaxe de cor relativa do CSS, `rgb(from …)`, com o mesmo alfa. A cor é a mesma.
7. **Hover em qualquer ponteiro.** A variante `hover:` foi redefinida para valer em qualquer ponteiro, como o `:hover` do design. A do Tailwind espera `(hover: hover)`.
8. **Caixas `content-box`.** O preflight do Tailwind põe `border-box` em tudo; o design não troca o modelo de caixa. O contêiner do cabeçalho, o `main`, o rodapé, o miolo dos cartões `01-simple` e o espaço de GIF levam `box-content`, para manter as medidas do design. Sem isso, o espaço de GIF perde 2 px de altura.
9. **Tamanho do texto no link.** `NavLink` leva `--text-14` e `FooterLink` leva `--text-13`, para cada um funcionar isolado. No design, os tamanhos estão no contêiner. O pixel não muda.
10. **Transformações do Tailwind.** Algumas transformações usam as propriedades `translate` e `scale` do Tailwind 4, e não `transform`: o botão em hover e as camadas do logo. O desenho é o mesmo.
11. **Estados desenhados para a rota.** A rota `/design-system` desenha hover e foco sem ponteiro nem teclado, dentro de `data-show-state="hover"` ou `"focus"`. Para isso, a variante `hover:` e os seletores de hover das utilidades incluem `[data-show-state="hover"] *`, e a regra de foco inclui `[data-show-state="focus"] :is(a, button, textarea)`. Na Home nada muda.
12. **A reação entre os times.** O design limita a reação ao grupo dos cartões (`.tm2:has(…)`); o app a liga a qualquer ancestral que contenha o cartão sob o ponteiro. Na Home, só os dois cartões estão lá, e o efeito é o mesmo.

**Ciclo**

13. **Estado em React.** O design guarda o estado do ciclo num componente com temporizadores encadeados. O app guarda o mesmo estado em `useCycle`, com os mesmos tempos e as mesmas regras de parada (movimento reduzido, seção fora da tela, aba oculta, etapa segurada ou fixada), e um temporizador por efeito. O design liga `is-run` num passo próprio, antes de contar os 3 s; no app, `running` vale enquanto nada para o ciclo, e os 3 s começam a contar no mesmo desenho.

**Os dois Ondas**

14. **Preferência de movimento mudada com a página aberta.** Ao reduzir o movimento, o app volta ao quadro de partida; quando o movimento volta, ele recomeça desse quadro. O design congela onde estava e, ao voltar, pula o tempo parado.
15. **Propriedades em inglês.** `fundo` virou `background`, `animado` virou `animated` e `quadro` virou `frame`.
16. **O mini redesenha pelo React.** O design escreve cada quadro direto nos traços do SVG, sem redesenhar o componente. O app redesenha o SVG a cada quadro, um a cada 85 ms. O desenho é o mesmo.
17. **Cores por classe de token**, em vez dos valores escritos no `style` e nos atributos do design.

**Rota do Sistema de design**

18. **Sem design de origem.** A rota `/design-system` nasceu no código, com os tokens e o vocabulário da Home. O cabeçalho dela é próprio, com o mini e "← Home", e a Home não tem link para ela. Nos espécimes do neon, os dois cartões aparecem em hover juntos; na Home, um de cada vez.

## Num projeto sem Tailwind

O estilo do app são classes do Tailwind 4 sobre o `@theme`, mais as utilidades de `globals.css`. Para outro arranjo:

- **Tokens.** Copie as declarações do `@theme` para `:root`, como variáveis CSS com os mesmos nomes. A linha `--*: initial` é do Tailwind (zera o tema padrão) e fica de fora. `--default-font-family` vira o `font-family` da página, e `--default-transition-duration` e `--default-transition-timing-function` viram a duração e a curva de cada `transition` sem as suas. Leve também o `@property` do ângulo da borda que gira no contorno.
- **Classes.** A classe é o nome do token sem o namespace, aplicado à propriedade da classe:

  | Classe | CSS |
  |---|---|
  | `bg-night`, `text-muted`, `border-rule`, `stroke-logo-blue` | `background-color`, `color`, `border-color` ou `stroke` com `var(--color-…)` |
  | `text-15`, `text-36-80`, `text-logo` | `font-size: var(--text-…)`, só o tamanho; a altura de linha vem de `leading-*` ou é herdada |
  | `font-light`, `leading-160`, `leading-px-24`, `tracking-tight-35` | `font-weight`, `line-height` e `letter-spacing` com o token do mesmo nome |
  | `rounded-16`, `shadow-glow`, `backdrop-blur-16` | `border-radius`, `box-shadow` e `backdrop-filter: blur(…)` com o token |
  | `px-gutter`, `max-w-page`, `max-w-large-13`, `min-h-team-card` | a propriedade com `var(--spacing-…)` ou `var(--container-…)` |
  | `gap-2.5`, `py-24`, `mt-1.5` | um passo da escala: `calc(var(--spacing) * 2.5)` e assim por diante |
  | `grid-cols-teams`, `aspect-gif` | `grid-template-columns` e `aspect-ratio` com o token; `--aspect-loop` é lido pela utilidade `loop-map` |
  | `text-(color:…)`, `bg-(…)` | a propriedade com a variável entre parênteses; no ciclo, a variável com a cor da entrega |
  | `flex-[1_1_0]` | o valor entre colchetes, com `_` no lugar de espaço |
  | `duration-350`, `ease-settle` | `transition-duration: 350ms` e `transition-timing-function: var(--ease-settle)` |

  As outras classes são utilidades padrão do Tailwind 4, com o CSS da documentação dele.

- **Variantes.** `hover:` é `:hover` em qualquer ponteiro; `narrow:`, `loop-tight:`, `cycle-two:` e `cycle-one:` são as `@media` de `globals.css`; `data-on:` é `[data-on]`; `group-data-on/item:` é "dentro de um `.group/item` com `data-on`"; `motion-reduce:` é `@media (prefers-reduced-motion: reduce)`; `pointer-coarse:` é `@media (pointer: coarse)`.
- **Utilidades de `globals.css`.** O movimento (`enter-*`, `reveal-*`, `slide-from-*`, `scroll-progress`, `fade-on-exit`, `marquee`) e os desenhos do ciclo e do neon (`loop*`, `rail-*`, `runner*`, `cards-*`, `cycle-card-*`, `step-*`, `pulse`, `team-*`, `dotted-ground`, `fade-sides`, `gif-stripes`) estão como `@utility nome { … }`, com as guardas `@media` e `@supports` e os seletores de estado aninhados dentro. Troque `@utility nome` por `.nome`, porque o aninhamento já é CSS nativo, e copie os `@keyframes` junto.
- **Reset.** O app conta com o preflight do Tailwind: margens zeradas; títulos que herdam tamanho e peso; links que herdam a cor, sem sublinhado; `svg` em bloco; e `border-box` em tudo, menos nos elementos `content-box` do Desvio 8. Reproduza essa combinação no seu reset.
- **Fontes.** Dois `@font-face`, com as famílias "Geist" e "Geist Mono", os arquivos de `web/fonts/`, o eixo de peso de 100 a 900, `font-display: swap` e o `unicode-range` latin que está em `fonts.ts`.
- **Logos.** `ondas-logo.tsx` e `ondas-mini.tsx` vão inteiros, trocando as classes pelas propriedades. No logo, o contêiner precisa de `container-type: inline-size`, porque `--text-logo` é medido em `cqw`.
- **O laço.** A raiz (`loop`) é um contêiner de consulta e declara numa variável própria a largura do desenho, em `cqw`: as etiquetas e os itens a leem para se posicionar a partir do centro. Leve a raiz com `container-type: inline-size`, ou troque `100cqw` pela largura da seção.

## Num projeto que já usa Tailwind 4

- A linha `--*: initial` zera o tema padrão do Tailwind no projeto inteiro. Num projeto com `@theme` próprio, deixe-a de fora e acrescente os tokens do `portal-rai` ao lado dos seus.
- Alguns nomes coincidem com os do tema padrão do Tailwind, com outro valor, e mudam o projeto todo: `--font-sans`, `--font-mono`, `--default-transition-duration` e `--default-transition-timing-function`.
- A variante `hover` redefinida em `globals.css` vale para o projeto inteiro. Leve-a só se quiser o hover em qualquer ponteiro em todo lugar.
- Um nome de classe montado em tempo de execução não é achado pelo Tailwind: por isso os lugares das etiquetas, dos itens e dos pulsos do ciclo e os gestos dos ícones estão escritos inteiros, em listas.

## Fora do Next.js

- `"use client"` marca os componentes que rodam no navegador: os dois Ondas, `InertLink`, o painel e a leitura dos tweaks, as seções `Model` e `Teams` e as versões do ciclo e dos cartões que respondem ao ponteiro. Fora do Next, a diretiva não tem efeito.
- `LayoutProps<"/">`, em `layout.tsx`, é um tipo das rotas tipadas do Next.
- `fonts.ts` usa o carregador de fonte local do Next. Fora dele, os dois `@font-face` da nota acima fazem o mesmo.
