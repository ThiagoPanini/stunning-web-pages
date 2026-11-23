# Executar uma spec com o `/implement-spec`

O `/implement-spec` constrói os tickets de uma spec numa branch de integração, com um subagente implementador por ticket e um subagente merger por merge. Este arquivo é o briefing deste repositório para os três papéis: o condutor (a sessão que roda a skill), o implementador e o merger. Ao disparar um subagente, o condutor aponta para a seção do papel dele, em vez de reescrevê-la.

## Condutor

1. **Integração ativa.** Crie `feature/<project_slug>` (ou `feature/catalog`) a partir da `main`, faça push e deixe essa branch ativa no checkout principal: o worktree nativo de cada subagente parte do HEAD dele.
2. **Notas.** Crie no scratchpad uma pasta `ciclo/notas/`. Cada implementador grava ali `ticket-<n>.md`, com uma linha `Estado:` no topo. Grave o grafo e o andamento num `ciclo/estado.md` seu, para sobreviver à compactação.
3. **Monitor.** Acompanhe as notas com um Monitor que só emite os estados finais (`pronto`, `parado`, `negad`), e não cada passo: cada evento acorda a sessão.
4. **Um merger por vez.** Os mergers trabalham no checkout principal. Dispare o próximo só quando o anterior devolver.
5. **Autorização para fora.** Publicar num Artefato é ação para fora, e o modo automático pode negá-la a um subagente mesmo quando já passou antes. Peça ao Autor, no começo da sessão, a autorização das publicações que a spec prevê. Uma publicação negada volta para o Autor com o motivo literal; com a autorização dele, o condutor publica da sessão principal.
6. **Leitura de Artefato em subagente.** A leitura de um Artefato despeja no contexto as instruções do tipo, uns 6 mil tokens por chamada. Leituras de volta e conferências de Artefato vão para um subagente, que devolve só o resultado.
7. **Fechamento.** Antes do PR, rode a conferência de cada Tema tocado em série: `node scripts/check.mjs <tema>`, um de cada vez.

Pronto quando todo ticket está mesclado na integração, a revisão de código foi corrigida e a lista de Tema pronto do `AGENTS.md` vale para cada Tema tocado.

## Implementador

1. **Leia** o ticket (`gh issue view <n>`) e as seções da spec que ele aponta, `AGENTS.md`, `GLOSSARY.md`, `scripts/README.md`, `docs/adr/` e as notas dos tickets que bloqueiam o seu.
2. **Base na ponta.** Confirme que o worktree está na ponta da integração. Se não estiver, avance com `git merge --ff-only feature/<project_slug>`.
3. **Construa.** Quando a costura do ticket é a página no navegador, construa com a skill `mattpocock-skills:tdd`. Quando é leitura de documentos, o resultado de um script ou a leitura de volta de um Artefato, a conferência é a que o ticket nomeia.
4. **Commite no seu branch** conforme avança. Push, PR e fechar issue ficam com o condutor.
5. **Grave cedo.** Mantenha a nota `ticket-<n>.md` com a linha `Estado:` atualizada a cada etapa.
6. **Pare no que é do Autor.** Uma decisão do Autor ou uma ação negada pelo modo de permissão encerra o trabalho naquele ponto: deixe o resto pronto e registre o motivo literal.
7. **Feche.** Faça merge da ponta atual da integração no seu branch, rode a conferência do ticket (num Tema, `node scripts/check.mjs <tema>`) e feche a nota com:
   - o branch;
   - a conferência e o resultado;
   - cada critério de aceite, feito ou não;
   - o que passa adiante: o que o próximo ticket precisa saber, os Desvios para o `HANDOFF.md` e as Observações para o `DESIGN.md`.

   Devolva em até 10 linhas, com o caminho da nota.

Pronto quando a conferência do ticket está verde depois do merge da ponta, e a nota está fechada.

## Merger

1. **Checkout limpo.** Confira que o checkout principal está na integração e limpo (`git status`; arquivos ignorados não contam).
2. **Merge.** Rode `git merge --no-ff <branch>` com a mensagem `merge(<escopo>): <assunto> (#<n>)`. Num conflito, preserve a intenção dos dois lados: o ticket, as notas e o histórico dizem o que cada um quis.
3. **Conferência.**
   - Rode `node scripts/check.mjs <tema>` para cada Tema que o merge tocou.
   - Se o merge tocou `scripts/`, rode também `pnpm --dir scripts test`.
   - Se o branch já continha a ponta da integração (`git merge-base --is-ancestor feature/<project_slug> <branch>`) e o implementador relatou a mesma conferência verde, basta rodá-la uma vez.
4. **Push.** Faça `git push origin feature/<project_slug>`.
5. **Devolva** em até 6 linhas:
   - o commit de merge;
   - o conflito e como foi resolvido;
   - a conferência;
   - o push.

Pronto quando o push passou com a conferência verde no checkout principal.
