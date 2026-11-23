# Documentos de domínio

Como as skills de engenharia consomem a documentação de domínio deste repositório ao explorar o código.

## Antes de explorar, leia

- **`GLOSSARY.md`** na raiz, ou
- **`GLOSSARY-MAP.md`** na raiz, se existir: ele aponta um `GLOSSARY.md` por contexto. Leia cada um que toque o assunto.
- **`docs/adr/`**: leia os ADRs que tocam a área em que você vai trabalhar. Em repositório de vários contextos, confira também `src/<context>/docs/adr/`, com as decisões de cada contexto.

Se algum desses arquivos não existir, **siga em silêncio**: sem apontar a ausência e sem propor criá-los de antemão. A skill `/domain-modeling` (pelo `/grill-with-docs` e pelo `/improve-codebase-architecture`) os cria quando um termo ou uma decisão se resolve de fato.

## Estrutura

Repositório de contexto único (a maioria):

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Repositório de vários contextos (com `GLOSSARY-MAP.md` na raiz):

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← decisões do sistema inteiro
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← decisões do contexto
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use o vocabulário do glossário

Quando o que você escreve nomeia um conceito do domínio (num título de issue, numa proposta de refatoração, numa hipótese, num nome de teste), use o termo como o `GLOSSARY.md` o define: o termo em português na prosa, a forma `Em código` no código. Fique nos termos do glossário, longe dos sinônimos que ele manda evitar.

Se o conceito de que você precisa ainda não está no glossário, isso é um sinal: ou você está inventando uma língua que o projeto não usa (reconsidere), ou há uma lacuna real (anote-a para o `/domain-modeling`).

## Aponte conflito com ADR

Se o que você escreve contradiz um ADR existente, diga isso às claras em vez de passar por cima em silêncio:

> _Contradiz o ADR-0007 (pedidos com event sourcing), mas vale reabrir porque…_
