---
status: accepted
date: 2026-11-22
---

# Dependências congeladas por Tema

Cada app de Tema fixa as versões exatas das dependências na data em que foi implementado e fica nelas. Um Tema é a referência de um design numa data, não um produto no ar: sem servidor e sem publicação, ele não tem a urgência de correção que justifica manutenção contínua. O README do Tema diz a data e as versões, para o Consumidor saber a idade do que lê. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **Manutenção contínua**, atualizando todos os apps a cada versão nova, à mão ou por bot: os Temas ficariam sempre no estado da arte. O custo é um trabalho recorrente que cresce com o número de Temas, e cada atualização arrisca quebrar a fidelidade de um Tema em que ninguém está mexendo.
- **Congelar por Tema** (escolhida).

## Consequences

- Cada app fixa versões exatas no manifesto e tem lockfile próprio.
- Um Tema antigo só é atualizado num Ciclo novo nele, que gera uma nova Versão do Tema.
- A raiz fixa só as versões maiores de Node (24) e pnpm (11), no `mise.toml`, para todo Tema nascer no mesmo ambiente. O resto fica no app, que é o que congela.
- Temas de datas diferentes convivem com versões diferentes da mesma dependência. Isso só é possível porque cada Tema é um app autossuficiente (ADR 0001).
