import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";
import { NavLink } from "@/components/nav-link";
import { NavPill } from "@/components/nav-pill";
import { OndasLogo } from "@/components/ondas-logo";
import { Paragraph } from "@/components/paragraph";
import { Column } from "@/components/section";
import { DesignGroup, DesignSection } from "./parts";
import { ComponentSpecimens } from "./specimens";
import { groupTokens, readThemeTokens } from "./theme-tokens";
import {
  AspectTokens,
  ColorTokens,
  EffectTokens,
  FamilyTokens,
  FocusTokens,
  GridTokens,
  LeadingTokens,
  PlainTokens,
  RadiusTokens,
  SizeTokens,
  SpacingTokens,
  TrackingTokens,
  WeightTokens,
} from "./tokens";

export const metadata: Metadata = {
  title: "Responsible AI · Sistema de design",
};

// The Refined's design system, alive: every token of @theme with its name and value, read from
// app/globals.css when the route is built, and each component of the Home on its own, in its states.
//
// No part of the route is as tall as the window (min-h-dvh): the tests open it in a window as tall as the
// page, and a page a window plus the logo tall would grow with every step. The body's night fills the
// rest.
export default function DesignSystem() {
  const tokens = groupTokens(readThemeTokens());
  const count = (...groups: (keyof typeof tokens)[]) =>
    groups.reduce((sum, group) => sum + tokens[group].length, 0);
  return (
    <div className="bg-night font-sans text-16 text-bright leading-150 antialiased">
      {/* A fixed height, so the logo under it starts on a whole pixel. */}
      <header className="h-16 border-white-7 border-b">
        <div className="mx-auto flex h-full max-w-page items-center justify-between gap-x-6 px-gutter">
          <div className="flex items-center gap-2.5 whitespace-nowrap font-medium text-15 tracking-tight-10">
            <BrandMark />
            <span className="narrow:sr-only">Responsible AI</span>
          </div>
          <NavPill label="Principal">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/design-system" current>
              Sistema de design
            </NavLink>
          </NavPill>
        </div>
      </header>
      <main>
        <Column className="flex flex-col items-center pt-16 text-center">
          {/* The Ondas logo as its board draws it alone: 560 px wide, the board's preview, on the board's
              own background, and with no letter spacing of the page around it (the logo inherits it).
              It starts on a whole pixel, under the header and the column's top space: a logo between
              two rows of pixels draws differently. tests/logo.spec.ts compares it with the reference
              capture of the board. */}
          <figure className="flex w-full flex-col items-center gap-4.5">
            <div data-specimen="ondas-logo-board" className="w-140 max-w-full">
              <OndasLogo />
            </div>
            <figcaption className="text-13 text-muted">
              O logo Ondas como o Quadro o desenha sozinho, em 560 px.
            </figcaption>
          </figure>
          <h1 className="mt-16 font-normal text-46-96 leading-94 tracking-tight-45">
            Sistema de design.
          </h1>
          <Paragraph className="mt-7 max-w-140">
            Os tokens vêm do bloco <code className="text-14">@theme</code> de{" "}
            <code className="text-14">app/globals.css</code>, a única fonte: o valor ao lado de cada
            nome é o que está escrito lá, e cada amostra usa a própria variável. Os componentes são
            os mesmos arquivos de <code className="text-14">components/</code> que montam a Home,
            cada um nos seus estados.
          </Paragraph>
        </Column>

        <Column className="pb-section-top">
          <DesignSection
            id="colors-title"
            title="Cores"
            count={count("colors")}
            lead="Neutros quentes do escuro ao claro, o creme do destaque, o vermelho do ataque e do Red Team, o azul do guardrail e do Blue Team; as cores do logo Ondas, com os nomes que o componente traz; e as translúcidas, nomeadas pelo alfa em centésimos."
          >
            <ColorTokens tokens={tokens.colors} />
          </DesignSection>

          <DesignSection
            id="type-title"
            title="Tipografia"
            count={count("families", "sizes", "weights", "tracking", "leading")}
            lead="Instrument Sans para a página e Geist Mono só para o logo. Os tamanhos fixos são nomeados em px, os fluidos do mínimo ao máximo, e o do logo é uma fração da largura do quadro dele. Espaçamento entre letras em milésimos de em, alturas de linha em centésimos."
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
            id="layout-title"
            title="Espaço"
            count={count("spacing", "grids")}
            lead="A escala de espaçamento do Tailwind fica, com a base de 4 px; os espaços fluidos e as duas larguras da página, a da linha do cabeçalho e a da coluna de cada seção, têm nome próprio. As grades são de colunas iguais que podem encolher abaixo do conteúdo."
          >
            <DesignGroup title="Espaçamentos e larguras">
              <SpacingTokens tokens={tokens.spacing} />
            </DesignGroup>
            <DesignGroup title="Grades">
              <GridTokens tokens={tokens.grids} />
            </DesignGroup>
          </DesignSection>

          <DesignSection
            id="shapes-title"
            title="Formas"
            count={count("radii", "aspects", "effects", "focus")}
            lead="Raios nomeados em px, a pílula e o círculo; as proporções da mídia, nomeadas pela razão; os brilhos creme dos botões, os desfoques da pílula sobre mídia e do cabeçalho, e o anel creme do foco de teclado, mais perto nos campos do formulário."
          >
            <DesignGroup title="Raios">
              <RadiusTokens tokens={tokens.radii} />
            </DesignGroup>
            <DesignGroup title="Proporções">
              <AspectTokens tokens={tokens.aspects} />
            </DesignGroup>
            <DesignGroup title="Sombra e desfoque">
              <EffectTokens tokens={tokens.effects} />
            </DesignGroup>
            <DesignGroup title="Foco">
              <FocusTokens tokens={tokens.focus} />
            </DesignGroup>
          </DesignSection>

          <DesignSection
            id="motion-title"
            title="Movimento"
            count={count("motion")}
            lead="As transições de hover, a entrada da abertura no carregamento, a faixa de chips e as animações guiadas por scroll. Com movimento reduzido nada se move e o conteúdo aparece no estado final."
          >
            <PlainTokens tokens={tokens.motion} />
          </DesignSection>

          <DesignSection
            id="components-title"
            title="Componentes"
            lead="Cada componente de components/ fora dos blocos da página, isolado, nos seus estados. Os links, os botões e os campos aparecem em repouso, em hover e em foco, desenhados sem ponteiro nem teclado; ao vivo eles respondem igual. As perguntas abrem e fecham, a faixa de chips corre e o logo anima, como na Home."
          >
            <ComponentSpecimens />
          </DesignSection>

          {tokens.others.length > 0 && (
            <DesignSection
              id="others-title"
              title="Outros"
              count={count("others")}
              lead="Tokens de um namespace que esta rota ainda não desenha."
            >
              <PlainTokens tokens={tokens.others} />
            </DesignSection>
          )}
        </Column>
      </main>
    </div>
  );
}
