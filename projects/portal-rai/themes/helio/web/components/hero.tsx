import { ButtonLink } from "./button-link";
import { EclusaLogo } from "./eclusa-logo";
import { TextLink } from "./text-link";

// The caption under the Eclusa logo: what each mark of the drawing stands for.
function EclusaCaption() {
  return (
    <div className="flex flex-nowrap justify-center gap-6 whitespace-nowrap font-mono text-12">
      <div className="flex items-center gap-2 text-red">
        <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" className="block flex-none">
          <path
            d="M1.25 1.25 6.75 6.75 M6.75 1.25 1.25 6.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span>ataque</span>
      </div>
      <div className="flex items-center gap-2 text-blue">
        <svg
          aria-hidden="true"
          width="13"
          height="8"
          viewBox="0 0 13 8"
          className="block flex-none"
        >
          <path
            d="M0.5 5.4 A25 25 0 0 1 12.5 5.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        <span>guardrails</span>
      </div>
      <div className="flex items-center gap-2 text-muted">
        <svg aria-hidden="true" width="9" height="9" viewBox="0 0 9 9" className="block flex-none">
          <circle cx="4.5" cy="4.5" r="3.5" fill="currentColor" />
        </svg>
        <span>agente</span>
      </div>
    </div>
  );
}

// The opening of the Home, in two columns that stack when narrow: the pitch on one side, the logo and
// its caption on the other. The pitch enters on load; the logo fades as it leaves the view.
export function Hero() {
  return (
    <section data-block="hero" className="flex flex-wrap items-end gap-x-12 gap-y-10 pt-12 pb-24">
      <div className="flex min-w-0 grow basis-120 flex-col gap-7 pb-9">
        <div className="enter-1 font-mono text-12 text-subtle uppercase tracking-wide-80">
          Guardrails para agentes conversacionais de IA
        </div>
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
          <EclusaLogo />
        </div>
        <EclusaCaption />
      </div>
    </section>
  );
}
