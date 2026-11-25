---
status: accepted
date: 2026-11-22
---

# Tailwind em vez de CSS Modules

Os apps dos Projetos estilizam com Tailwind 4, por PostCSS, e o bloco `@theme` de cada app é a única fonte dos tokens do Projeto. O critério foi o custo do Consumidor, que reimplementa a interface no projeto dele: o destino provável já usa Tailwind, e traduzir utilitário para CSS puro é mais barato que o inverso. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **CSS Modules com variáveis CSS**: nativo no Next, sem dependência, e o arranjo que menos exige do projeto de destino. Perde porque, num destino com Tailwind, o agente do Consumidor teria de converter cada regra de CSS em utilitário, que é o caminho mais caro.
- **Panda, StyleX ou vanilla-extract**: trazem geração de código, plugin ou Babel, mais dependências e pior portabilidade que os dois acima.
- **Tailwind 4 com `@theme`** (escolhida).

## Consequences

- A paleta, a tipografia e os raios padrão do Tailwind são zerados, para que só os tokens do Projeto existam como classe. A escala de espaçamento padrão fica.
- CSS próprio entra só para o que não tem utilitário: keyframes, animação guiada por scroll, máscaras e ilustrações.
- O Tailwind entra por `@tailwindcss/postcss`, o caminho que as documentações do Next e do Tailwind mostram. O carregador de Turbopack que o `create-next-app` 16.4.6 configura quebra CSS Modules.
- O `HANDOFF.md` de cada Projeto traz uma nota para projeto sem Tailwind. As variáveis que o `@theme` emite são CSS puro e servem a qualquer arranjo.
- **Gatilho para rever**: o destino típico do Consumidor deixar de usar Tailwind.
