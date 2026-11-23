import { ButtonLink } from "./button-link";
import { OndasCaption } from "./ondas-caption";
import { OndasLogo } from "./ondas-logo";
import { SectionLabel } from "./section-label";
import { TextLink } from "./text-link";

// The opening of the Home, in two columns that stack when narrow: the pitch on one side, the Ondas logo,
// on the page color, and its caption on the other. The pitch enters on load; the logo fades as it leaves
// the view.
export function Hero() {
  return (
    <section data-block="hero" className="flex flex-wrap items-end gap-x-12 gap-y-10 pt-12 pb-24">
      <div className="flex min-w-0 grow basis-120 flex-col gap-7 pb-9">
        <SectionLabel className="enter-1">
          Guardrails para agentes conversacionais de IA
        </SectionLabel>
        <h1 className="enter-2 font-light text-36-80 leading-104 tracking-tight-35">
          Atacamos primeiro<span className="text-red">.</span>
          <br />
          Protegemos sempre<span className="text-blue">.</span>
        </h1>
        <p className="enter-3 max-w-135 text-pretty text-17 text-muted leading-160">
          O time de Responsible AI pesquisa, desenvolve e implementa os guardrails dos agentes
          conversacionais de IA da companhia: do ataque simulado à proteção de cada conversa em
          produção.
        </p>
        <div className="enter-4 flex flex-wrap items-center gap-x-7 gap-y-3">
          <ButtonLink>Testar um guardrail</ButtonLink>
          <TextLink>Ver os dados →</TextLink>
        </div>
      </div>
      <div className="fade-on-exit mx-auto flex min-w-0 max-w-150 grow basis-105 flex-col gap-3.5">
        <div data-region="logo" className="aspect-square w-full overflow-hidden">
          <OndasLogo background="var(--color-night)" />
        </div>
        <OndasCaption />
      </div>
    </section>
  );
}
