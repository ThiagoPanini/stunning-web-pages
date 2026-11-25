---
status: accepted
date: 2026-11-25
---

# Um app autossuficiente por Projeto, com a variação por Tweak

Cada Projeto do Catálogo é um design e um app próprio, em `projects/<project>/web/`, com manifesto e lockfile próprios. A variação dentro do design é Tweak: uma escolha que o Quadro deixa em aberto numa seção enquanto o Autor a explora, e que sai do Quadro e do app quando ele decide. O Consumidor lê um Projeto para reimplementar a interface no projeto dele, e um app por Projeto lhe entrega uma pasta em que tudo é daquele design. Decidido na [spec #52](https://github.com/ThiagoPanini/stunning-web-pages/issues/52), que reescreveu no lugar a decisão da [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **Vários designs paralelos por Projeto**, cada um com app, documentos, Origem e Sistema de design próprios: o modelo da spec #1. Deixava comparar designs inteiros lado a lado, mesmo com estruturas de página diferentes. Perdeu porque multiplica app, documentos, Origem e Sistema de design publicado a cada design, enquanto a exploração do Autor acontece seção por seção, com Tweaks num Quadro só. Quem consultava o Catálogo encontrava alternativas sem saber qual valia, e só uma era a interface que o Autor levava adiante.
- **Um app por Projeto com troca de design inteiro** (tokens ou árvores de componentes trocados por uma chave na raiz da página): um build só, com todos os designs atrás de um interruptor. O Tweak não é isso: ele troca uma seção, não a página, e existe só enquanto a seção está em aberto. Uma chave de design inteiro carregaria páginas completas lado a lado no mesmo app, e o Consumidor teria de separar o design que quer dos que vêm junto.
- **Um app por Projeto, com a variação por Tweak** (escolhida).

## Consequences

- Nada num Projeto importa de outro Projeto nem da raiz. Código repetido entre Projetos é aceito.
- Não há workspace na raiz. O único código fora dos Projetos são as ferramentas de `scripts/` (a Puxada, a Subida, o conferidor de documentos e a conferência de um Projeto), que carregam as próprias dependências.
- O framework é um atributo que o Projeto declara no README dele, sem nível de pasta próprio.
- Cada Projeto congela as próprias dependências sem afetar os vizinhos (ADR 0008).
- O app desenha as opções de um Tweak enquanto a seção está em exploração, com um painel do Catálogo para trocá-las. Decidida a seção, as outras opções saem do Quadro e do app num Ciclo, e um Projeto sem Tweak não tem painel.
- Um design descartado sai do Catálogo e fica só no histórico do git.
