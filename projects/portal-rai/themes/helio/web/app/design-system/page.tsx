import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";
import { TextLink } from "@/components/text-link";
import { DesignGroup, DesignSection } from "./parts";
import { groupTokens, readThemeTokens } from "./theme-tokens";
import {
  ColorTokens,
  EffectTokens,
  FamilyTokens,
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

// The Sistema de design of the Hélio, alive: every token of @theme with its name and value, read from
// app/globals.css when the route is built, and each component of the Home on its own, in its states.
export default function DesignSystem() {
  const tokens = groupTokens(readThemeTokens());
  return (
    <div className="bg-night font-sans text-16 text-bright leading-150 antialiased">
      <header className="border-white-7 border-b">
        <div className="mx-auto box-content flex max-w-page flex-wrap items-center justify-between gap-x-6 px-gutter py-2.5">
          <a
            href="/"
            className="flex min-h-11 items-center gap-2.5 whitespace-nowrap font-medium text-15 tracking-tight-10"
          >
            <BrandMark />
            <span>Responsible AI</span>
          </a>
          <TextLink href="/">← Home</TextLink>
        </div>
      </header>
      <main className="mx-auto box-content max-w-page px-gutter">
        <section className="flex flex-col gap-7 pt-16 pb-20">
          <div className="font-mono text-12 text-subtle uppercase tracking-wide-80">
            Tema Hélio · Sistema de design
          </div>
          <h1 className="font-light text-36-80 leading-104 tracking-tight-35">
            Sistema de design.
          </h1>
          <p className="max-w-160 text-pretty text-17 text-muted leading-160">
            Os tokens vêm do bloco <code className="font-mono text-15">@theme</code> de{" "}
            <code className="font-mono text-15">app/globals.css</code>, a única fonte: o valor ao
            lado de cada nome é o que está escrito lá, e cada amostra usa a própria variável. Os
            componentes são os mesmos arquivos de{" "}
            <code className="font-mono text-15">components/</code> que montam a Home, cada um nos
            seus estados.
          </p>
        </section>

        <DesignSection
          number="01"
          label="Cores"
          title="Cores."
          lead="Neutros do escuro ao claro, o vermelho do ataque e do Red Team, o azul do guardrail e do Blue Team, e as cores translúcidas, nomeadas pelo alfa em centésimos."
        >
          <ColorTokens tokens={tokens.colors} />
        </DesignSection>

        <DesignSection
          number="02"
          label="Tipografia"
          title="Tipografia."
          lead="Geist para o texto e Geist Mono para rótulos e painéis. Os tamanhos fixos são nomeados em px; os fluidos, do mínimo ao máximo. Espaçamento entre letras em milésimos de em, alturas de linha em centésimos."
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
          label="Espaçamentos"
          title="Espaçamentos."
          lead="A escala de espaçamento do Tailwind fica, com a base de 4 px; os espaçamentos fluidos e a largura da página têm nome próprio."
        >
          <SpacingTokens tokens={tokens.spacing} />
        </DesignSection>

        <DesignSection
          number="04"
          label="Formas"
          title="Raios, sombra e desfoque."
          lead="Raios nomeados em px, a pílula e o círculo; o brilho do botão em hover e o desfoque do cabeçalho."
        >
          <DesignGroup title="Raios">
            <RadiusTokens tokens={tokens.radii} />
          </DesignGroup>
          <DesignGroup title="Sombra e desfoque">
            <EffectTokens tokens={tokens.effects} />
          </DesignGroup>
        </DesignSection>

        <DesignSection
          number="05"
          label="Movimento"
          title="Movimento."
          lead="As transições de hover, a entrada no carregamento e as revelações guiadas por scroll. Com movimento reduzido nada se move e o conteúdo aparece no estado final."
        >
          <PlainTokens tokens={tokens.motion} />
        </DesignSection>

        {tokens.others.length > 0 && (
          <DesignSection
            number="06"
            label="Outros"
            title="Outros tokens."
            lead="Tokens de um namespace que esta rota ainda não desenha."
          >
            <PlainTokens tokens={tokens.others} />
          </DesignSection>
        )}
      </main>
    </div>
  );
}
