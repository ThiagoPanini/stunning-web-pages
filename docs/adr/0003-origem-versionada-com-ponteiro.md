---
status: accepted
date: 2026-11-22
---

# Origem versionada no git, com o Ponteiro para o Artefato

A Origem de cada Projeto fica no git: os Quadros crus, as Capturas de referência e um único Ponteiro, o arquivo que guarda ferramenta, título, endereço e versão do Artefato, data da Puxada e lista de Quadros. O Ponteiro é uma exceção consciente à regra de que nada na pasta do Projeto dependa de um link que o Consumidor não abre: o Artefato é privado, e o endereço só serve ao Autor e ao agente dele. Por isso o Ponteiro se declara coisa do Autor, e nenhum documento do Projeto depende dele. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **Ponteiro fora do git**, numa nota local do Autor: o repositório público não teria link nenhum que o leitor não abre. Mas o laço só funcionaria na máquina e na sessão que guardam a nota. Um clone novo, ou uma sessão nova, não saberia de que Artefato e de que versão a Origem partiu, e a próxima Puxada começaria por uma pergunta ao Autor.
- **Origem versionada com Ponteiro** (escolhida).

## Consequences

- O endereço de um Artefato aparece só no Ponteiro. README, `DESIGN.md`, `HANDOFF.md` e deck não o citam.
- Os Quadros entram como estão, sem edição. A Puxada seguinte sobrescreve a Origem, e o `git diff` mostra o que mudou no design.
- O runtime do editor, que cada Quadro carrega como `support.js`, é do publicador do tipo de Artefato. A Puxada o baixa para uma pasta temporária, e ele nunca entra no git: o `.gitignore` da raiz ignora `support.js` e `dc-runtime.js`.
