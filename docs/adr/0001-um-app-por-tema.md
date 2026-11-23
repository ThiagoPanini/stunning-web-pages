---
status: accepted
date: 2026-11-22
---

# Um app autossuficiente por Tema

Cada Tema do Catálogo é um app próprio, em `projects/<projeto>/themes/<tema>/web/`, com manifesto e lockfile próprios. Os Temas do `portal-rai` diferem na estrutura da página, não só nos tokens: o Hélio tem 5 seções, o Neônio 7 e o Refined 8, cada um com componentes que os outros não têm (painéis de terminal no Hélio, abas com scroll-spy no Neônio, FAQ e formulário no Refined). O Consumidor lê um Tema para reimplementá-lo no projeto dele, e um app por Tema lhe entrega uma pasta em que tudo é daquele Tema. Decidido na [spec #1](https://github.com/ThiagoPanini/stunning-web-pages/issues/1).

## Considered Options

- **Um app por Projeto, com troca de tema** (tokens trocados por uma classe ou um atributo na raiz da página): um build só e componentes compartilhados. Só funciona quando os Temas mudam a aparência e mantêm a estrutura, o que não é o caso aqui. O app teria de carregar as três árvores de componentes atrás de uma chave, o Consumidor teria de separar o que é do Tema dele do que é dos vizinhos, e mexer num Tema arriscaria quebrar outro.
- **Um app por Tema** (escolhida).

## Consequences

- Nada num Tema importa de outro Tema nem da raiz. Código repetido entre Temas é aceito.
- Não há workspace na raiz. O único código fora dos Temas são as ferramentas de `scripts/` (a Puxada, a Subida e o conferidor de documentos), que carregam as próprias dependências.
- O framework é um atributo que o Tema declara no README dele, sem nível de pasta próprio.
- Cada Tema congela as próprias dependências sem afetar os vizinhos (ADR 0008).
