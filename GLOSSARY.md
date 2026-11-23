# Stunning Web Pages

Catálogo público de interfaces web exploratórias do Autor. Este glossário fixa as palavras usadas em tickets, documentos e código. Os termos são em português, para a prosa; cada um traz a forma em inglês usada em código e em nomes de pasta.

## Language

### Catálogo

**Catálogo**:
O repositório inteiro: Projetos, cada um com seus Temas, guardados para consulta e para servir de base a implementações em projetos reais.
_Em código_: `catalog`
_Avoid_: produto, biblioteca, template

**Autor**:
Quem idealiza os designs e mantém o Catálogo.
_Em código_: `author`
_Avoid_: dono, usuário

**Consumidor**:
Quem consulta um Tema para reimplementá-lo no próprio projeto, quase sempre com um agente de código. Ele lê a pasta do Tema como referência; não a copia como ponto de partida.
_Em código_: `consumer`
_Avoid_: usuário, cliente, terceiro

**Projeto**:
Uma interface com propósito próprio, como o portal de um time. Tem um slug e uma pasta em `projects/`.
_Em código_: `project`
_Avoid_: app, site, produto

**Tema**:
Um design de um Projeto, com Sistema de design próprio e app próprio. Dois Temas do mesmo Projeto podem diferir na estrutura da página, não só na aparência. Cada Tema é autossuficiente: nada nele depende do Tema vizinho.
_Em código_: `theme`
_Avoid_: versão, skin, variação, variante

**Tela**:
Uma página de um Tema, como a Home. Um Tema cobre as Telas que tiver, sem obrigação de cobrir todas as do Projeto.
_Em código_: `screen`
_Avoid_: página (para o conceito), view

**Sistema de design**:
Os tokens, a tipografia, os componentes e os padrões de um Tema. Vive no `@theme` do app, é descrito no `DESIGN.md` e aparece vivo na rota `/design-system`.
_Em código_: `design system`
_Avoid_: guia de estilo, UI kit

**Handoff**:
O documento `HANDOFF.md` de um Tema: o briefing que o Consumidor entrega ao agente dele.
_Em código_: `handoff`
_Avoid_: guia de implementação, passo a passo

**Deck**:
A apresentação de um Tema em HTML de arquivo único, que só existe quando o Autor a pede: mostra o Tema por Capturas e amostras e defende o layout.
_Em código_: `presentation`
_Avoid_: slides, PowerPoint

### Laço com a ferramenta de design

**Artefato**:
Uma publicação privada na conta do Autor no Claude, com endereço e versão. Um Artefato do tipo Design guarda os Quadros de onde os Temas saem; um do tipo Design System recebe a Subida de um Tema.
_Em código_: `artifact`
_Avoid_: projeto (é do Catálogo), link

**Origem**:
Os arquivos do design como saíram da ferramenta, guardados na pasta `origin/` do Tema, junto do Ponteiro e das Capturas de referência. É coisa do Autor: o Consumidor não precisa dela.
_Em código_: `origin`
_Avoid_: fonte, source, export

**Ponteiro**:
O único arquivo da Origem que diz de onde ela veio: ferramenta, título, endereço e versão do Artefato, data da Puxada e lista de Quadros. É coisa do Autor, e nenhum documento do Tema depende dele.
_Em código_: `pointer`
_Avoid_: link, manifesto

**Quadro**:
Um arquivo de design do Claude Design (`.dc.html`): uma Tela ou um componente no canvas.
_Em código_: `board`
_Avoid_: artboard, frame, tela (um Quadro pode ser só um componente)

**Puxada**:
Trazer os Quadros de um Tema do Artefato para a Origem, gravando a versão do Artefato e gerando as Capturas de referência.
_Em código_: `pull`
_Avoid_: sincronização, importação, download

**Subida**:
Publicar o Sistema de design de um Tema, a partir do código, como Artefato do tipo Design System, para a ferramenta desenhar as próximas Telas em cima dele.
_Em código_: `publish`
_Avoid_: sincronização, push (é do git)

**Captura de referência**:
Imagem de um Quadro original, renderizado fora do editor, guardada na Origem. É o alvo visual do teste do Tema.
_Em código_: `reference capture`
_Avoid_: baseline, screenshot (sozinho)

**Captura**:
Imagem do app implementado, guardada em `screenshots/`.
_Em código_: `screenshot`
_Avoid_: print

**Desvio**:
Uma diferença entre o app e a Origem que nasceu no código e ficou anotada no Handoff do Tema.
_Em código_: `deviation`
_Avoid_: bug, ajuste, correção

**Lacuna**:
O que o design deixou em aberto e o app reproduz como está: um espaço reservado de mídia, um link para uma Tela que não existe.
_Em código_: `design gap`
_Avoid_: pendência, TODO

**Observação**:
Uma inconsistência aparente que o design carrega e o app reproduz como está, anotada no `DESIGN.md` do Tema para o Consumidor decidir o que corrigir.
_Em código_: `observation`
_Avoid_: bug, correção, normalização

### Entrega

**Ciclo**:
Uma entrega coerente de um Projeto, ou só da raiz do Catálogo: uma spec com tickets, implementada numa branch, que termina num PR mesclado na `main`.
_Em código_: `cycle`
_Avoid_: sprint, release, iteração

**Tema pronto**:
Um Tema que cumpre a lista de pronto do `AGENTS.md` e, por isso, o agente mescla sozinho.
_Em código_: `ready theme`
_Avoid_: finalizado, concluído
