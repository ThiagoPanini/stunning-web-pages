---
status: accepted
date: 2026-11-22
---

# Fidelidade medida contra o original renderizado

A fidelidade de um Projeto se mede comparando a captura do app com a Captura de referência: o Quadro original renderizado fora do editor, num navegador headless, nas mesmas condições. O original renderiza fora do editor quando o runtime publicado com o Artefato é servido por HTTP, como `support.js`, ao lado dos Quadros. Assim o agente tem um alvo visual objetivo para saber quando a página está fiel, e o Autor não exporta nada à mão. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **Conferência manual**: depende de opinião e do tempo do Autor, e não dá ao agente um critério de parada.
- **Exportação de imagem pelo Autor** a cada mudança no design: põe uma etapa manual no laço, e a imagem que sai do editor não vem necessariamente nas larguras e no estado de movimento em que o app é testado.
- **Comparação com o original renderizado** (escolhida).

## Consequences

- A Puxada gera as Capturas de referência em 1440 e 390 px de largura e as guarda na Origem. A Puxada e o teste do app capturam nas mesmas condições: mesmo navegador, mesmas larguras e movimento reduzido, que congela as animações num quadro determinístico.
- A viewport cresce até a altura do documento antes da captura. As revelações dependem da posição de scroll, e sem isso tudo abaixo da dobra sai invisível.
- O limite de diferença é calibrado no primeiro Ciclo e fica registrado junto do teste, com a razão.
- A conferência fina do Autor continua, depois do merge, e vira ajuste do Ciclo seguinte.
- **Hipótese**: as fontes locais do app são a mesma versão que o original carrega do Google Fonts. Uma versão diferente pode mudar a altura da página.
- **Gatilho para rever**: se a comparação não fechar num limite útil, o teste cai para estrutura (seções e títulos na ordem) e saúde da página, e a comparação visual vira um relatório lado a lado no PR.
