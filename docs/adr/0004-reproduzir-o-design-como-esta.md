---
status: accepted
date: 2026-11-22
---

# Reproduzir o design como está

O app de um Projeto reproduz o design como ele está, inclusive no que parece inconsistente ou incompleto. São duas regras. Nomear sem normalizar: cada valor do design ganha um token com nome próprio, e valores parecidos não são fundidos. Manter as Lacunas: espaço reservado de mídia continua espaço reservado, e link para Tela que não existe fica inerte. O Projeto é a referência do design para o Consumidor; corrigir o design cabe ao Autor, no Claude Design, ou ao Consumidor, no projeto dele. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **Normalizar ao implementar**, fundindo cores e tamanhos próximos numa escala limpa, preenchendo as Lacunas e levando todas as variantes de logo: o app sairia mais arrumado. Mas deixaria de bater com as Capturas de referência, esconderia do Consumidor o que o design de fato tem e poria no código decisões de design que o Autor não tomou.
- **Reproduzir como está** (escolhida).

## Consequences

- O que parecer inconsistência vira Observação, numa lista do `DESIGN.md`, para o Consumidor decidir o que corrigir no projeto dele.
- O `HANDOFF.md` lista as Lacunas, para o agente do Consumidor não tratá-las como defeito.
- A Origem guarda só os Quadros que formam o design do Projeto: os das Telas e os dos componentes que elas desenham, mesmo os que o Artefato arquiva entre os laboratórios. O resto fica no Artefato e não vira Tela do app ([spec #21](https://github.com/ThiagoPanini/stunning-web-pages/issues/21)).
- O texto da interface é o do design, com os espaços reservados como estão (`[NOME DA COMPANHIA]` e afins).
