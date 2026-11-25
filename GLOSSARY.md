# Stunning Web Pages

Catálogo público de interfaces web exploratórias do Autor. Este glossário fixa as palavras usadas em tickets, documentos e código. Os termos são em português, para a prosa; cada um traz a forma em inglês usada em código e em nomes de pasta.

## Language

### Catálogo

**Catálogo**:
O repositório inteiro: os Projetos, guardados para consulta e para servir de base a implementações em projetos reais.
_Em código_: `catalog`
_Avoid_: produto, biblioteca, template

**Autor**:
Quem idealiza os designs e mantém o Catálogo.
_Em código_: `author`
_Avoid_: dono, usuário

**Consumidor**:
Quem consulta um Projeto para reimplementar a interface no próprio projeto, quase sempre com um agente de código. Ele lê a pasta do Projeto como referência; não a copia como ponto de partida.
_Em código_: `consumer`
_Avoid_: usuário, cliente, terceiro

**Projeto**:
Uma interface com propósito próprio, como o portal de um time, com um design, um Sistema de design e um app. Tem um slug e uma pasta em `projects/`. Cada Projeto é autossuficiente: nada nele depende de outro Projeto.
_Em código_: `project`
_Avoid_: app, site, produto

**Tela**:
Uma página de um Projeto, como a Home. O app cobre as Telas que o design tem, sem obrigação de cobrir todas as do Projeto.
_Em código_: `screen`
_Avoid_: página (para o conceito), view

**Sistema de design**:
Os tokens, a tipografia, os componentes e os padrões do design de um Projeto. Vive no `@theme` do app, é descrito no `DESIGN.md` e aparece vivo na rota `/design-system`.
_Em código_: `design system`
_Avoid_: guia de estilo, UI kit

**Handoff**:
O documento `HANDOFF.md` de um Projeto: o briefing que o Consumidor entrega ao agente dele.
_Em código_: `handoff`
_Avoid_: guia de implementação, passo a passo

**Deck**:
A apresentação de um Projeto em HTML de arquivo único, que só existe quando o Autor a pede: mostra o design por Capturas e amostras e defende o layout.
_Em código_: `presentation`
_Avoid_: slides, PowerPoint

### Laço com a ferramenta de design

**Artefato**:
Uma publicação privada na conta do Autor no Claude, com endereço e versão. Um Artefato do tipo Design guarda os Quadros de onde o design de um Projeto sai; um do tipo Design System recebe a Subida de um Projeto.
_Em código_: `artifact`
_Avoid_: projeto (é do Catálogo), link

**Origem**:
Os arquivos do design como saíram da ferramenta, guardados na pasta `origin/` do Projeto, junto do Ponteiro e das Capturas de referência. É coisa do Autor: o Consumidor não precisa dela.
_Em código_: `origin`
_Avoid_: fonte, source, export

**Ponteiro**:
O único arquivo da Origem que diz de onde ela veio: ferramenta, título, endereço e versão do Artefato, data da Puxada e lista de Quadros. É coisa do Autor, e nenhum documento do Projeto depende dele.
_Em código_: `pointer`
_Avoid_: link, manifesto

**Quadro**:
Um arquivo de design do Claude Design (`.dc.html`): uma Tela ou um componente no canvas.
_Em código_: `board`
_Avoid_: artboard, frame, tela (um Quadro pode ser só um componente)

**Tweak**:
Uma escolha que o Quadro deixa em aberto enquanto o Autor explora uma seção, com nome, opções e um padrão. Fora do editor vale o padrão. Durante a exploração, o app desenha cada opção declarada e o endereço da página escolhe uma; quando o Autor decide, as outras opções saem do Quadro e do app.
_Em código_: `tweak`
_Avoid_: variante, prop, opção (é cada valor do Tweak)

**Puxada**:
Trazer os Quadros de um Projeto do Artefato para a Origem, gravando a versão do Artefato e gerando as Capturas de referência.
_Em código_: `pull`
_Avoid_: sincronização, importação, download

**Subida**:
Publicar o Sistema de design de um Projeto, a partir do código, como Artefato do tipo Design System, para a ferramenta desenhar as próximas Telas em cima dele.
_Em código_: `publish`
_Avoid_: sincronização, push (é do git)

**Captura de referência**:
Imagem de um Quadro original, renderizado fora do editor, guardada na Origem do Projeto. É o alvo visual do teste do app.
_Em código_: `reference capture`
_Avoid_: baseline, screenshot (sozinho)

**Captura**:
Imagem do app implementado, guardada em `screenshots/`.
_Em código_: `screenshot`
_Avoid_: print

**Desvio**:
Uma diferença entre o app e a Origem que nasceu no código e ficou anotada no Handoff do Projeto.
_Em código_: `deviation`
_Avoid_: bug, ajuste, correção

**Lacuna**:
O que o design deixou em aberto e o app reproduz como está: um espaço reservado de mídia, um link para uma Tela que não existe.
_Em código_: `design gap`
_Avoid_: pendência, TODO

**Observação**:
Uma inconsistência aparente que o design carrega e o app reproduz como está, anotada no `DESIGN.md` do Projeto para o Consumidor decidir o que corrigir.
_Em código_: `observation`
_Avoid_: bug, correção, normalização

### Entrega

**Ciclo**:
Uma entrega coerente de um Projeto, ou só da raiz do Catálogo: uma spec com tickets, implementada numa branch, que termina num PR mesclado na `main`.
_Em código_: `cycle`
_Avoid_: sprint, release, iteração

**Projeto pronto**:
Um Projeto que cumpre a lista de pronto do `AGENTS.md`, e cujo Ciclo, por isso, o agente mescla sozinho.
_Em código_: `ready project`
_Avoid_: finalizado, concluído
