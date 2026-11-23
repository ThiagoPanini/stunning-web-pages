---
status: accepted
date: 2026-11-22
---

# Apps em export estático, com Cache Components desligado

Cada app de Tema é um Next.js com App Router e `output: "export"`: o build gera arquivos estáticos e recusa recurso de servidor. O Catálogo é só front end, e o export transforma essa regra numa trava do build, em vez de um item de revisão. O preço é desligar o Cache Components, que o Next 16.4 recomenda para todo app novo e que o `create-next-app` liga por padrão: no Next 16.4.6, com export, o build falha no fim com `Invariant: PPR cannot be enabled in export mode` ([PR aberto no Next](https://github.com/vercel/next.js/pull/101250) que o chama de "not yet supported"). Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **O padrão novo do Next, com Cache Components e o servidor do Next**: segue o que o gerador entrega e o que o Next 17 vai tornar padrão. Deixa o app aceitar route handler, server action e dado por requisição, que um Tema não deve ter, e obriga o Consumidor a subir um servidor para ver uma página que não muda.
- **Export estático** (escolhida).

## Consequences

- `cacheComponents` e `partialPrefetching` ficam desligados. `images.unoptimized` fica ligado; sem ele o build passa, mas o HTML aponta para uma rota de imagem que não existe no export.
- Nenhum route handler, nenhuma server action, nenhuma chamada de rede.
- O teste do Tema dirige o app exportado, servido como arquivos estáticos.
- **Gatilho para rever**: o Next passar a aceitar Cache Components com export, ou um Tema que precise de servidor, o que hoje está fora do Catálogo.
