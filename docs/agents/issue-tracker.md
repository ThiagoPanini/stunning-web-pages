# Issue tracker: GitHub

As issues e as specs deste repositório vivem como issues do GitHub. Use o CLI `gh` em todas as operações.

## Comandos

- **Criar uma issue**: `gh issue create --title "..." --body "..."`. Para corpo de várias linhas, use um heredoc.
- **Ler uma issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **Ler uma seção de uma issue**: `gh issue view <number> --json body --jq .body | awk -v h='<heading line>' '$0==h{p=1;print;next} p&&/^#{1,3} /{exit} p'`, em que `<heading line>` é o título da seção como está escrito (`### Imagem e nginx`). Use quando um ticket aponta para uma seção da spec dele.
- **Listar issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`, com os filtros `--label` e `--state` que couberem.
- **Fazer de uma issue sub-issue de outra**: `gh issue create --parent <parent> ...`, ou depois `gh issue edit <parent> --add-sub-issue <child>` (`gh` 2.94+). Com `gh` mais antigo: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (o database id, como em **Bloqueio** abaixo). Sem sub-issues, ponha `Part of #<parent>` no topo do corpo da filha.
- **Bloqueio**: as **dependências nativas de issue** do GitHub, a representação canônica e visível na interface. Acrescente uma aresta com `gh issue create --blocked-by <n>,<n> ...` ou `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Com `gh` mais antigo: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, em que `<blocker-db-id>` é o **database id** numérico do bloqueador (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _não_ o `#number` nem o `node_id`). Onde não houver dependências, use uma linha `Blocked by: #<n>, #<n>` no topo do corpo da filha. Um ticket está desbloqueado quando todos os bloqueadores estão fechados.
- **Contar bloqueadores abertos**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (só os abertos; 0 quer dizer que dá para começar). `gh issue view <n> --json blockedBy` (`gh` 2.94+) também lista os fechados, então filtre: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`. Com `gh` mais antigo: `gh api repos/<owner>/<repo>/issues/<n>/dependencies/blocked_by --jq '.[] | {number, state}'`.
- **Comentar numa issue**: `gh issue comment <number> --body "..."`
- **Editar um comentário**: `gh api -X PATCH repos/<owner>/<repo>/issues/comments/<id> -F body=@<file>`, em que `<id>` é o número depois de `issuecomment-` no endereço do comentário.
- **Pôr e tirar etiquetas**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Fechar**: publique a explicação com `gh issue comment <number> --body "..."` e depois rode `gh issue close <number>`. Numa issue já fechada, `gh issue close --comment` descarta o comentário e ainda sai com 0.

O repositório vem do `git remote -v`; o `gh` faz isso sozinho dentro de um clone.

Abra issues só no repositório do próprio usuário. `mattpocock/skills`, o repositório de onde vêm as skills, só recebe issue se o usuário for o dono. Num fork, o `gh` pode apontar para o repositório pai: antes do primeiro `gh issue create` da sessão, confira o alvo com `gh repo view --json nameWithOwner` e confirme com o usuário se não for o repositório dele.

## Pull requests como entrada de triagem

**PRs como entrada de pedidos: não.** _(Troque para `sim` se este repositório tratar PRs externos como pedidos de funcionalidade; o `/triage` lê esta marca.)_

Com `sim`, os PRs passam pelas mesmas etiquetas e pelos mesmos estados das issues, com os equivalentes de `gh pr`:

- **Ler um PR**: `gh pr view <number>`, depois `gh pr view <number> --comments` (fora de um TTY, `--comments` imprime só os comentários, sem o corpo), e `gh pr diff <number>` para o diff.
- **Listar PRs externos para triagem**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comentar, etiquetar, fechar**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

O GitHub usa a mesma numeração para issues e PRs, então um `#42` solto pode ser qualquer um dos dois: resolva com `gh pr view 42` e, se falhar, `gh issue view 42`.

## Quando uma skill diz "publish to the issue tracker"

Crie uma issue no GitHub.

## Quando uma skill diz "fetch the relevant ticket"

Leia como em **Ler uma issue**, acima.

## Fatiar tickets para o `/implement-spec`

Aqui as specs são construídas pelo `/implement-spec`: cada ticket chega a uma branch de integração (`feature/<project_slug>`, ou `feature/catalog` para trabalho só na raiz) a partir do próprio worktree, pelo `tdd`, e só chega à `main` quando o PR dessa branch é mesclado. Fatie para essa execução:

- **Tickets de operação**: trabalho que precisa da `main`, de um serviço fora do repositório ou do Autor vai em tickets com título `Operação: ...`, cujo corpo começa com "Fora do `/implement-spec`", bloqueados pelo código que operam.
- **Arquivos compartilhados**: tickets que editam o mesmo arquivo ganham uma aresta de bloqueio; toda outra aresta é dependência real. Os Projetos são autossuficientes, então tickets de Projetos diferentes só compartilham o índice da raiz.
- **Costuras**: cada ticket nomeia a sua costura de teste. Num Projeto, a costura é a página renderizada no navegador, comparada com as Capturas de referência da Origem dele.
- **Folhas**: um ticket que pode parar à espera de decisão do Autor não bloqueia nada.
- **Ferramentas**: um ticket que traz um CLI ou uma extensão que o agente ainda não rodou neste repositório a nomeia, e a sessão de fatiamento a roda uma vez no modo de permissão do agente, lendo o que ela escreve. Uma ferramenta que continua barrada vira passo da preparação única do Autor, e o ticket dela não bloqueia nada.
- **Publicação**: um ticket que publica num Artefato diz isso no corpo, e as notas de handoff da spec pedem ao Autor a autorização dessas publicações na chamada do `/implement-spec`. O modo automático pode negar a publicação a um subagente mesmo depois de ela ter passado num Ciclo anterior.

Para executar os tickets, o briefing do condutor, do implementador e do merger está em `docs/agents/implement-spec.md`.
