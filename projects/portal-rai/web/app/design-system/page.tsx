import type { Metadata } from "next";
import { OndasMini } from "@/components/ondas-mini";
import { SectionLabel } from "@/components/section-label";
import { TextLink } from "@/components/text-link";
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
  GrowTokens,
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

// The design system, alive: every token of @theme with its name and value, read from
// app/globals.css when the route is built, and each component of the Home on its own, in its states. The
// page clips its sides, as the Home does: the team cards slide in from beyond them.
export default function DesignSystem() {
  const tokens = groupTokens(readThemeTokens());
  return (
    <div className="overflow-x-clip bg-night font-sans text-16 text-bright leading-150 antialiased">
      <header className="border-white-7 border-b">
        <div className="mx-auto box-content flex max-w-page flex-wrap items-center justify-between gap-x-6 px-gutter py-2.5">
          <a
            href="/"
            className="flex min-h-11 items-center gap-1.75 whitespace-nowrap font-medium text-15 tracking-tight-10"
          >
            <span aria-hidden="true" className="-ml-1.25 block size-9.5 flex-none">
              <OndasMini background="transparent" />
            </span>
            <span>Responsible AI</span>
          </a>
          <TextLink href="/">← Home</TextLink>
        </div>
      </header>
      <main className="mx-auto box-content max-w-page px-gutter">
        <section className="flex flex-col gap-7 pt-16 pb-20">
          <SectionLabel>Responsible AI · Sistema de design</SectionLabel>
          <h1 className="font-light text-36-80 leading-104 tracking-tight-35">
            Sistema de design.
          </h1>
          <p className="max-w-160 text-pretty text-17 text-muted leading-160">
            Os tokens vêm do bloco <code className="font-mono text-15">@theme</code> de{" "}
            <code className="font-mono text-15">app/globals.css</code>, a única fonte: o valor ao
            lado de cada nome é o que está escrito lá, e cada amostra usa a própria variável. Os
            componentes são os mesmos arquivos de{" "}
            <code className="font-mono text-15">components/</code> que montam a Home, cada um nos
            seus estados, com todas as versões dos tweaks do Quadro.
          </p>
        </section>

        <DesignSection
          number="01"
          label="Cores"
          title="Cores."
          lead="Cinzas neutros, do escuro ao claro; o vermelho do ataque e do Red Team, o azul do guardrail e do Blue Team; o neon dos cards da Versão 02, quatro paradas e o núcleo de cada time; as cores do logo Ondas e as cores translúcidas, nomeadas pelo alfa em centésimos."
        >
          <ColorTokens tokens={tokens.colors} />
        </DesignSection>

        <DesignSection
          number="02"
          label="Tipografia"
          title="Tipografia."
          lead="Geist para o texto e Geist Mono para rótulos, etiquetas do ciclo e o logo. Os tamanhos fixos são nomeados em px; os fluidos, do mínimo ao máximo; o do logo acompanha a largura dele. Espaçamento entre letras em milésimos de em, alturas de linha em centésimos ou em px; os tokens do logo têm os nomes do componente dele."
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
          lead="A escala de espaçamento do Tailwind fica, com a base de 4 px; os espaçamentos fluidos, a largura da página e os tamanhos em que o ciclo e os cards são desenhados têm nome próprio. A grade dos Times põe quantas colunas couberem; a da lista da órbita tem número, nome e etiqueta; o GIF do ciclo e a pílula aberta do fio crescem em proporções que não são números inteiros, e os espaços dos GIFs têm 16:9."
        >
          <DesignGroup title="Espaçamentos e larguras">
            <SpacingTokens tokens={tokens.spacing} />
          </DesignGroup>
          <DesignGroup title="Grades">
            <GridTokens tokens={tokens.grids} />
          </DesignGroup>
          <DesignGroup title="Crescimento">
            <GrowTokens tokens={tokens.grow} />
          </DesignGroup>
          <DesignGroup title="Proporções">
            <AspectTokens tokens={tokens.aspects} />
          </DesignGroup>
        </DesignSection>

        <DesignSection
          number="04"
          label="Formas"
          title="Raios, sombra, desfoque e foco."
          lead="Raios nomeados em px, a pílula e o círculo; o brilho do botão em hover, a luz da parede do Blue Team, o desfoque do cabeçalho e o anel do foco de teclado."
        >
          <DesignGroup title="Raios">
            <RadiusTokens tokens={tokens.radii} />
          </DesignGroup>
          <DesignGroup title="Sombra e desfoque">
            <EffectTokens tokens={tokens.effects} />
          </DesignGroup>
          <DesignGroup title="Foco">
            <FocusTokens tokens={tokens.focus} />
          </DesignGroup>
        </DesignSection>

        <DesignSection
          number="05"
          label="Movimento"
          title="Movimento."
          lead="As transições de hover, a entrada no carregamento, as revelações guiadas por scroll, os parceiros que correm, o ciclo que anda sozinho e o neon dos cards. Com movimento reduzido nada se move, o ciclo fica parado e o conteúdo aparece no estado final."
        >
          <PlainTokens tokens={tokens.motion} />
        </DesignSection>

        <DesignSection
          number="06"
          label="Componentes"
          title="Componentes."
          lead="Cada componente de components/ fora dos blocos da página, isolado, com as quatro versões do ciclo e as três dos cards dos times. Os links e o botão aparecem em repouso, em hover e em foco, desenhados sem ponteiro nem teclado; ao vivo eles respondem igual."
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
      </main>
    </div>
  );
}
