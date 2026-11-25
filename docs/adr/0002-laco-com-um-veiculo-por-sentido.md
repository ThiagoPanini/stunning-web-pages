---
status: accepted
date: 2026-11-22
---

# Laço com o Claude Design: as Telas descem, o Sistema de design sobe

O laço entre o Claude Design e o Catálogo tem um veículo em cada sentido. As Telas descem pela Puxada, que copia os Quadros do Projeto para a Origem como estão, grava a versão do Artefato e gera as Capturas de referência. O Sistema de design sobe pela Subida, que publica, a partir do app e com os tokens do `@theme`, um Artefato do tipo Design System privado na conta do Autor, e o Claude Design desenha as próximas Telas do Projeto em cima dele. Os Quadros são do Autor: o agente os lê e não os escreve. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **O agente reescrever os Quadros para espelhar o código**: design e app ficariam iguais sem esperar o Autor. Mas o Autor perderia o controle do canvas, decisões nascidas no código entrariam no Quadro sem que ele as visse, e a próxima Puxada traria de volta o que o próprio agente escreveu, sem distinguir o que veio do Autor.
- **Um veículo por sentido** (escolhida).

## Consequences

- Um ajuste nascido no código vira Desvio, listado no `HANDOFF.md` do Projeto, e só vai ao Quadro quando o Autor pedir.
- Depois de uma Puxada, o `git diff` da Origem mostra só o que o Autor mudou no design, e essa é a lista do que atualizar no app.
- O Design System publicado leva tokens, fontes, texto de marca e os componentes em prévia estática. O pacote de componentes React fica fora do primeiro Ciclo.
- O endereço do Design System publicado vai para o Ponteiro da Origem, junto do endereço do Artefato de onde as Telas descem (ADR 0003).
