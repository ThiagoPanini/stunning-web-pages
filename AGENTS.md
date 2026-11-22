# AGENTS.md

This repo is a public catalog of exploratory web interfaces. Each **project** holds one or more **themes**. A theme is a design born in a design tool, mostly Claude Design, and reimplemented here as a self-sufficient Next.js app, next to the documents another person needs to rebuild it in their own project. It is frontend only: no backend code, no CI, no deploy.

The catalog standard (folder layout, the loop with Claude Design, what makes a theme done) lands with the first spec. Until it does, that spec and its tickets are the source of truth.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues at `ThiagoPanini/stunning-web-pages` (via `gh`), and tickets are sliced for `/implement-spec`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Conventions

- Code in English, prose in Brazilian Portuguese. Identifiers, components, tokens, folders and code files are named in English. Documents, tickets, commits and interface copy are written in Portuguese. Agent instructions (this file and `docs/agents/`) stay in English.
- Name domain concepts with the words of `GLOSSARY.md`.
- Commits and PR titles follow Conventional Commits, in Portuguese: `tipo(escopo): assunto`.

## Agent cycle

Every change reaches `main` as the squash of a pull request. The agent that opens the PR merges it: nobody else reviews it, and no PR is left open for the Author.

1. Work on `feature/<project_slug>`, one project per branch, or on `feature/catalog` for work on the root alone. `/implement-spec` uses that branch as its integration branch.
2. Commit and push on your own as the work advances.
3. At the end of the cycle, open the PR with `gh pr create` and merge it with `gh pr merge --squash --delete-branch`. The next cycle of the same project starts a new branch from `main`.

There is no CI. What gates the merge is the check each ticket names, run locally and green.
