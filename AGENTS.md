# AGENTS.md

Este repositório é o Catálogo, um catálogo público de interfaces web exploratórias. Cada Projeto reúne um ou mais Temas. Um Tema é um design nascido numa ferramenta de design, quase sempre o Claude Design, e reimplementado aqui como um app Next.js autossuficiente. Ao lado do app ficam os documentos de que um Consumidor precisa para reconstruí-lo no próprio projeto: a pasta do Tema é referência para ler, não template para copiar. É só front end: sem código de backend, sem CI, sem deploy.

As decisões por trás deste padrão, cada uma com a alternativa que venceu, estão em `docs/adr/`. Leia o ADR correspondente antes de mudar uma regra abaixo.

## A árvore do Catálogo

```
stunning-web-pages/
├── README.md · AGENTS.md · CLAUDE.md · GLOSSARY.md · LICENSE · .gitignore · mise.toml
├── docs/adr/ · docs/agents/
├── scripts/                  a Puxada, a Subida, o conferidor de documentos e a conferência de um Tema, com o passo a passo de cada um
└── projects/<project>/
    ├── README.md             contexto, Telas, tabela de Temas com uma Captura de cada
    └── themes/<theme>/
        ├── README.md         Captura, Telas cobertas, data, versões, como rodar, mapa da pasta
        ├── DESIGN.md         o Sistema de design, nas seções do formato do Google Labs
        ├── HANDOFF.md        o briefing que o Consumidor entrega ao agente dele
        ├── web/              o app: as Telas e a rota /design-system
        ├── screenshots/      Capturas do app
        ├── presentation.html o Deck, só quando o Autor pede
        └── origin/           a Origem: Quadros crus, Capturas de referência, Ponteiro
```

- Cada Tema é autossuficiente: nada nele importa de outro Tema nem da raiz, e código repetido entre Temas é aceito. O framework é um atributo que o Tema declara no README, sem nível de pasta próprio.
- Não há workspace na raiz. `scripts/` guarda o único código fora dos Temas e carrega as próprias dependências.
- Cada app fixa versões exatas no próprio manifesto e no próprio lockfile, congeladas na data da implementação. Um Tema só muda num Ciclo sobre ele, e a mudança o sobrescreve: o estado anterior fica só no histórico do git, e a data do README do Tema passa a ser a desse Ciclo. O `mise.toml` da raiz fixa as versões maiores de Node e pnpm com que todo Tema nasce.
- O `README.md` da raiz indexa todo Projeto e todo Tema; o `README.md` de um Projeto traz a tabela dos Temas dele.

## O laço com o Claude Design

Um veículo por sentido: as Telas descem, o Sistema de design sobe. O passo a passo, com o Ponteiro e o runtime do editor, está em `scripts/README.md`.

- **Puxada**, para baixo: copia os Quadros do Tema do Artefato para `origin/` exatamente como estão e gera as Capturas de referência. Depois de uma Puxada, o `git diff` de `origin/` mostra o que o Autor mudou no design: esse diff é o trabalho do app.
- **Subida**, para cima: publica o Sistema de design do Tema, montado a partir do app, como Artefato Design System privado na conta do Claude do Autor, e o Claude Design desenha as próximas Telas do Tema em cima dele. Leva os tokens do `@theme`, as fontes do app, o texto de marca e prévias estáticas dos componentes.
- **Os Quadros são o canvas do Autor.** O agente muda um Quadro quando o Autor pede: troca só o que foi pedido e publica só aquele arquivo no Artefato, como diz `scripts/README.md`. Um ajuste nascido no código é um Desvio: anote-o no `HANDOFF.md` do Tema.
- **Endereço de Artefato só no Ponteiro**, o arquivo de `origin/` que se declara coisa do Autor. Nenhum documento depende dele.

## Reproduzir o design

O app reproduz o design como ele está. Corrigir o design cabe ao Autor, no Claude Design, ou ao Consumidor, no projeto dele.

- **Nomear sem normalizar.** Cada valor do design ganha um token próprio, com o nome como foi achado; valores parecidos ficam separados. O que parecer inconsistência vira uma Observação no `DESIGN.md`.
- **Manter as Lacunas.** Um espaço reservado de mídia continua espaço reservado, e um link para uma Tela que não existe continua inerte. O `HANDOFF.md` as lista.
- **Texto de interface como foi escrito**, com os espaços reservados como `[NOME DA COMPANHIA]`.
- **Os Tweaks no padrão.** O app reproduz o padrão de cada Tweak. Quando o Autor pede todas as versões, o app desenha cada uma, o endereço da página escolhe a versão com os nomes do Quadro, e um painel do Catálogo troca a versão; a Puxada captura o Quadro uma vez por versão (`props` em `captures.json`), e o teste compara cada uma.
- **Só os Quadros que formam o Tema.** `origin/` guarda os Quadros das Telas do Tema e dos componentes que elas desenham, mesmo os que o Artefato arquiva entre os laboratórios. Todo o resto fica no Artefato, sem virar Tela do app.
- **A fidelidade é medida** contra as Capturas de referência. As capturas do app são tiradas nas mesmas condições da Puxada: o mesmo navegador, 1440 e 390 px de largura, movimento reduzido e viewport da altura do documento.

## Tema pronto

Um Tema está pronto, e o agente mescla o Ciclo sozinho, quando tudo isto vale:

- A Origem e as Capturas de referência estão no git.
- O app compila e o teste passa.
- `README.md`, `DESIGN.md` e `HANDOFF.md` estão escritos.
- As Capturas do app estão guardadas em `screenshots/`.
- O Sistema de design foi publicado.
- Os índices do Projeto e da raiz listam o Tema.

## Skills de agente

### Issue tracker

Issues e specs vivem no GitHub Issues em `ThiagoPanini/stunning-web-pages` (pelo `gh`), e os tickets são fatiados para o `/implement-spec`. Veja `docs/agents/issue-tracker.md` e, para executá-los, `docs/agents/implement-spec.md`.

### Etiquetas de triagem

Vocabulário padrão: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Veja `docs/agents/triage-labels.md`.

### Documentos de domínio

Contexto único: um `GLOSSARY.md` e um `docs/adr/` na raiz. Veja `docs/agents/domain.md`.

## Convenções

- **Código em inglês**: identificadores, componentes, tokens, pastas, arquivos de código, comentários, títulos de teste e mensagens de erro. No código, um conceito do domínio aparece pela forma `Em código` do `GLOSSARY.md`.
- **Português no resto**: documentos, tickets, commits, PRs, texto de interface e as instruções de agente (este arquivo, `CLAUDE.md` e `docs/agents/`). Na prosa, um conceito do domínio aparece pelo termo do `GLOSSARY.md`.
- Commits e títulos de PR seguem Conventional Commits em português: `tipo(escopo): assunto`.

## Entregar um Ciclo

Toda mudança chega à `main` como o squash de um pull request. O agente que abre o PR o mescla: ninguém mais o revisa, e nenhum PR fica aberto para o Autor.

1. Trabalhe em `feature/<project_slug>`, um Projeto por branch, ou em `feature/catalog` para trabalho só na raiz. O `/implement-spec` usa essa branch como branch de integração.
2. Commite e faça push por conta própria conforme o trabalho avança.
3. No fim do Ciclo, abra o PR com `gh pr create` e mescle com `gh pr merge --squash --delete-branch`. Depois do merge, atualize a `main` do checkout principal com `git pull --ff-only`, para a próxima sessão não ler o repositório atrasado. O Ciclo seguinte do mesmo Projeto começa uma branch nova a partir da `main`.

Não há CI. O portão é local: a conferência que cada ticket nomeia, rodada e verde, e, num Ciclo que toca um Tema, a lista de Tema pronto acima.
