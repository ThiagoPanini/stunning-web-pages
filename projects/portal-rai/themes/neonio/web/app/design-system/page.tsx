import type { Metadata } from "next";
import { Eyebrow } from "@/components/eyebrow";
import { HeaderBlockLink } from "@/components/header-block-link";
import { Lead } from "@/components/lead";
import { OndasCaption } from "@/components/ondas-caption";
import { OndasLogo } from "@/components/ondas-logo";
import { DesignGroup, DesignSection } from "./parts";
import { ComponentSpecimens } from "./specimens";
import { groupTokens, readThemeTokens } from "./theme-tokens";
import {
  AspectTokens,
  BlurTokens,
  ColorTokens,
  FamilyTokens,
  FocusTokens,
  GridTokens,
  ImageTokens,
  LeadingTokens,
  PlainTokens,
  RadiusTokens,
  SizeTokens,
  SpacingTokens,
  TrackingTokens,
  WeightTokens,
} from "./tokens";

// The Ondas logo as its board draws it alone: 560 px wide, the board's preview, on the board's own
// background, animated, and with no letter spacing, since the board's body sets none and the logo
// inherits it (the page's -0.01em moves its characters). Narrower than that, it takes the column.
// tests/logo.spec.ts compares it with the reference capture of the board.
function BoardLogo() {
  return (
    <div data-specimen="ondas-logo-board" className="tracking-[normal]">
      <OndasLogo />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Responsible AI · Sistema de design",
};

// The Neônio's design system, alive: every token of @theme with its name and value, read from
// app/globals.css when the route is built, and each component of the Home on its own, in its states.
// The page is the Home's: its type, its white header blocks and its ruled frame.
export default function DesignSystem() {
  const tokens = groupTokens(readThemeTokens());
  return (
    <div className="transitions-off-when-reduced bg-page font-sans text-16 text-text leading-1375 tracking-tight-10 antialiased">
      <header className="px-gutter pt-2.5">
        <div className="mx-auto flex max-w-header flex-wrap gap-1">
          <div className="flex min-h-11 min-w-0 grow basis-130 flex-wrap items-center justify-between gap-x-6 bg-white px-4 text-page">
            <a
              href="/"
              className="inline-flex min-h-11 items-center whitespace-nowrap pr-2 font-display font-medium text-19 tracking-tight-30 focus-visible:outline-page focus-visible:outline-offset-inset"
            >
              Responsible AI
            </a>
            <span className="font-medium text-14">Sistema de design</span>
          </div>
          <HeaderBlockLink href="/">← Home</HeaderBlockLink>
        </div>
      </header>
      <main className="mx-auto max-w-page px-gutter">
        <div className="border-rule border-x px-inset">
          {/* The opening, as the Home's: the title and the lead beside the logo, aligned at the bottom.
              The logo is the tallest column, so it sits at the top of the row, on whole pixels. */}
          <section className="flex flex-wrap items-end justify-between gap-x-12 gap-y-10 pt-6 pb-20">
            <div className="flex min-w-0 grow basis-140 flex-col gap-5 pb-11.5">
              <Eyebrow>Tema Neônio · Sistema de design</Eyebrow>
              <h1 className="max-w-180 text-balance font-display font-light text-38-64 text-white leading-1125 tracking-tight-20">
                Sistema de design.
              </h1>
              <Lead className="max-w-135">
                Os tokens vêm do bloco <code className="font-mono-short text-15">@theme</code> de{" "}
                <code className="font-mono-short text-15">app/globals.css</code>, a única fonte: o
                valor ao lado de cada nome é o que está escrito lá, e cada amostra usa a própria
                variável. Os componentes são os mesmos arquivos de{" "}
                <code className="font-mono-short text-15">components/</code> que montam a Home, cada
                um nos seus estados.
              </Lead>
            </div>
            <div className="flex w-full max-w-140 flex-col gap-3.5">
              <BoardLogo />
              <OndasCaption />
            </div>
          </section>

          <DesignSection
            number="01"
            label="Cores"
            title="Cores."
            lead="A página quase preta e o branco dos blocos e dos botões; os cinzas do texto, do claro ao escuro; filetes e superfícies; os acentos das ilustrações e dos quadrados neon, vermelho do Red Team, azul do Blue Team, violeta das seções sem time e o lima dos falsos positivos; e as cores do logo. Cada valor tem o próprio nome, mesmo os muito próximos."
          >
            <ColorTokens tokens={tokens.colors} />
          </DesignSection>

          <DesignSection
            number="02"
            label="Tipografia"
            title="Tipografia."
            lead="Inter no texto, Inter Tight nos títulos, JetBrains Mono nos rótulos, com duas pilhas de fallback, e Geist Mono no logo. Os tamanhos fixos são nomeados em px; os fluidos, do mínimo ao máximo. Espaçamento entre letras e alturas de linha em milésimos."
          >
            <DesignGroup title="Famílias">
              <FamilyTokens tokens={tokens.families} />
            </DesignGroup>
            <DesignGroup title="Tamanhos">
              <SizeTokens tokens={tokens.sizes} />
            </DesignGroup>
            <DesignGroup title="Pesos">
              <WeightTokens tokens={tokens.weights} />
            </DesignGroup>
            <DesignGroup title="Espaçamento entre letras">
              <TrackingTokens tokens={tokens.tracking} />
            </DesignGroup>
            <DesignGroup title="Alturas de linha">
              <LeadingTokens tokens={tokens.leading} />
            </DesignGroup>
          </DesignSection>

          <DesignSection
            number="03"
            label="Layout"
            title="Espaçamentos e grades."
            lead="A escala de espaçamento do Tailwind fica, com a base de 4 px; os espaçamentos fluidos e as larguras da página têm nome próprio. As grades que não são N colunas iguais também: a abertura, o veredito, o rodapé e as abas do ciclo."
          >
            <DesignGroup title="Espaçamentos e larguras">
              <SpacingTokens tokens={tokens.spacing} />
            </DesignGroup>
            <DesignGroup title="Grades">
              <GridTokens tokens={tokens.grids} />
            </DesignGroup>
          </DesignSection>

          <DesignSection
            number="04"
            label="Formas"
            title="Raios, proporções, desfoque, fundos e foco."
            lead="Raios de 2 e 6 px e o círculo; as proporções dos desenhos das soluções e da mídia do bento, nomeadas pela razão; o desfoque dos quadrados neon; os fundos desenhados por gradiente, das pautas, das barras e da hachura; e o anel do foco de teclado, branco por fora e, sobre o branco, escuro por dentro."
          >
            <DesignGroup title="Raios">
              <RadiusTokens tokens={tokens.radii} />
            </DesignGroup>
            <DesignGroup title="Proporções">
              <AspectTokens tokens={tokens.aspects} />
            </DesignGroup>
            <DesignGroup title="Desfoque">
              <BlurTokens tokens={tokens.effects} />
            </DesignGroup>
            <DesignGroup title="Fundos desenhados">
              <ImageTokens tokens={tokens.images} />
            </DesignGroup>
            <DesignGroup title="Foco">
              <FocusTokens tokens={tokens.focus} />
            </DesignGroup>
          </DesignSection>

          <DesignSection
            number="05"
            label="Movimento"
            title="Movimento."
            lead="As transições de hover duram .15s; a faixa de marcas leva 44s por volta. Com movimento reduzido nenhuma transição roda, a faixa para e o logo congela no quadro de partida."
          >
            <PlainTokens tokens={tokens.motion} />
          </DesignSection>

          <DesignSection
            number="06"
            label="Componentes"
            title="Componentes."
            lead="Cada componente de components/ fora dos blocos da página, isolado, e a faixa de marcas. Os links, os botões e as abas aparecem em repouso, em hover e em foco, desenhados sem ponteiro nem teclado; ao vivo eles respondem igual."
          >
            <ComponentSpecimens />
          </DesignSection>

          {tokens.others.length > 0 && (
            <DesignSection
              number="07"
              label="Outros"
              title="Outros tokens."
              lead="Tokens de um namespace que esta rota ainda não desenha."
            >
              <PlainTokens tokens={tokens.others} />
            </DesignSection>
          )}
        </div>
      </main>
    </div>
  );
}
