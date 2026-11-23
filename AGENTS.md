# AGENTS.md

This repo is the Catálogo, a public catalog of exploratory web interfaces. Each Projeto holds one or more Temas. A Tema is a design born in a design tool, mostly Claude Design, and reimplemented here as a self-sufficient Next.js app, next to the documents a Consumidor needs to rebuild it in their own project: the Tema folder is a reference to read, not a template to copy. It is frontend only: no backend code, no CI, no deploy.

The decisions behind this standard, each with the alternative it beat, are in `docs/adr/`. Read the matching ADR before changing a rule below.

## Layout of the Catálogo

```
stunning-web-pages/
├── README.md · AGENTS.md · CLAUDE.md · GLOSSARY.md · LICENSE · .gitignore · mise.toml
├── docs/adr/ · docs/agents/
├── scripts/                  captures the original for the Capturas de referência; Puxada step by step
└── projects/<project>/
    ├── README.md             context, Telas, table of Temas with a Captura each
    └── themes/<theme>/
        ├── README.md         Captura, Telas covered, date, versions, how to run, folder map
        ├── DESIGN.md         the Sistema de design, in the sections of the Google Labs format
        ├── HANDOFF.md        the briefing the Consumidor hands to their agent
        ├── web/              the app: its Telas plus the /design-system route
        ├── screenshots/      Capturas of the app
        ├── presentation.html the Deck
        └── origin/           the Origem: raw Quadros, Capturas de referência, Ponteiro
```

- Each Tema is self-sufficient: nothing in it imports from another Tema or from the root, and code repeated across Temas is accepted. The framework is an attribute the Tema declares in its README, with no folder level of its own.
- There is no workspace at the root. `scripts/` holds the only code outside the Temas and loads its own dependencies.
- Each app pins exact versions in its own manifest and lockfile, frozen at its implementation date. An old Tema changes only in a new Ciclo on it, which makes a new Versão. The root `mise.toml` fixes the Node and pnpm majors every Tema is born with.
- The root `README.md` indexes every Projeto and Tema; a Projeto's `README.md` holds the table of its Temas.

## The loop with Claude Design

One vehicle per direction: Telas come down, the Sistema de design goes up.

- **Puxada**, down: copies the Tema's Quadros from the Artefato into `origin/` exactly as they are, records the Artefato's version in the Ponteiro and generates the Capturas de referência. The step by step is in `scripts/README.md`. After a Puxada, `git diff` on `origin/` shows what the Autor changed in the design: that diff is the work for the app.
- **Subida**, up: publishes the Tema's Sistema de design, generated from the app's `@theme`, as a private Design System Artefato in the Autor's Claude account, and Claude Design draws the Tema's next Telas on top of it. It carries tokens, fonts, brand copy and static component previews.
- The Quadros are the Autor's canvas: the agent reads them and leaves them as they are. An adjustment born in code is a Desvio: list it in the Tema's `HANDOFF.md`; it reaches the Quadro only when the Autor asks.
- The Ponteiro is the one file in `origin/` that holds Artefato addresses, the Subida's included. It declares itself the Autor's. No other file cites an address, and no document depends on the Ponteiro.
- The editor runtime the Quadros load as `support.js` belongs to the publisher of the Artefato type. The Puxada downloads it to a temporary folder every time, and `.gitignore` keeps it out of git.

## Reproducing the design

The app reproduces the design as it is. Fixing the design belongs to the Autor, in Claude Design, or to the Consumidor, in their own project.

- **Name without normalizing.** Every value in the design gets its own token, named as found; close values stay separate. Whatever looks inconsistent becomes an Observação in `DESIGN.md`.
- **Keep the Lacunas.** A media placeholder stays a placeholder, and a link to a Tela that does not exist stays inert. `HANDOFF.md` lists them.
- **Interface text as written**, placeholders such as `[NOME DA COMPANHIA]` included.
- **One logo per Tema.** `origin/` holds only the Quadros that form the Tema; other logo variants and comparison Quadros stay in the Artefato.
- **Telas only.** Material that is not a Tela, such as a logo briefing or a lab, stays in the Artefato.
- **Fidelity is measured** against the Capturas de referência. The app's captures are taken under the same conditions as the Puxada's: the same browser, 1440 and 390 px wide, reduced motion, and a viewport as tall as the document.

## Tema pronto

A Tema is pronto, and the agent merges its Ciclo on its own, when all of this holds:

- The Origem and its Capturas de referência are in git.
- The app builds and its test passes.
- `README.md`, `DESIGN.md` and `HANDOFF.md` are written.
- The app's Capturas are saved in `screenshots/`.
- The Deck exists.
- The Sistema de design is published.
- The Projeto and root indexes list the Tema.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues at `ThiagoPanini/stunning-web-pages` (via `gh`), and tickets are sliced for `/implement-spec`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Conventions

- Code in English, prose in Brazilian Portuguese. Identifiers, components, tokens, folders and code files are named in English. Documents, tickets, commits and interface copy are written in Portuguese. Agent instructions (this file and `docs/agents/`) stay in English.
- Name domain concepts with the words of `GLOSSARY.md`, in Portuguese even inside English text, as this file does. Code uses each term's `Em código` form.
- Commits and PR titles follow Conventional Commits, in Portuguese: `tipo(escopo): assunto`.

## Delivering a Ciclo

Every change reaches `main` as the squash of a pull request. The agent that opens the PR merges it: nobody else reviews it, and no PR is left open for the Autor.

1. Work on `feature/<project_slug>`, one Projeto per branch, or on `feature/catalog` for work on the root alone. `/implement-spec` uses that branch as its integration branch.
2. Commit and push on your own as the work advances.
3. At the end of the Ciclo, open the PR with `gh pr create` and merge it with `gh pr merge --squash --delete-branch`. The next Ciclo of the same Projeto starts a new branch from `main`.

There is no CI. The gate is local: the check each ticket names, run green, and, for a Ciclo that touches a Tema, the Tema pronto list above.
