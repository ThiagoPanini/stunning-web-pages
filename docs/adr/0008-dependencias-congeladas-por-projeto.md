---
status: accepted
date: 2026-11-22
---

# Dependências congeladas por Projeto

O app de cada Projeto fixa as versões exatas das dependências na data em que foi implementado e fica nelas. Um Projeto é a referência de um design numa data, não um produto no ar: sem servidor e sem publicação, ele não tem a urgência de correção que justifica manutenção contínua. O README do Projeto diz a data e as versões, para o Consumidor saber a idade do que lê. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **Manutenção contínua**, atualizando todos os apps a cada versão nova, à mão ou por bot: os Projetos ficariam sempre no estado da arte. O custo é um trabalho recorrente que cresce com o número de Projetos, e cada atualização arrisca quebrar a fidelidade de um Projeto em que ninguém está mexendo.
- **Congelar por Projeto** (escolhida).

## Consequences

- Cada app fixa versões exatas no manifesto e tem lockfile próprio.
- Um Projeto só muda num Ciclo sobre ele, e a mudança o sobrescreve: o estado anterior fica só no histórico do git, e a data do README do Projeto passa a ser a do último Ciclo que o mudou ([spec #21](https://github.com/ThiagoPanini/stunning-web-pages/issues/21)).
- A raiz fixa só as versões maiores de Node (24) e pnpm (11), no `mise.toml`, para todo Projeto nascer no mesmo ambiente. O resto fica no app, que é o que congela.
- Projetos de datas diferentes convivem com versões diferentes da mesma dependência. Isso só é possível porque cada Projeto é um app autossuficiente (ADR 0001).
