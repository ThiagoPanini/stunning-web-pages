import { ButtonLink } from "./button-link";
import { Lead } from "./lead";
import { OndasCaption } from "./ondas-caption";
import { OndasLogo } from "./ondas-logo";

// The opening of the Home, in two columns aligned at the bottom: the title, the lead and two buttons;
// beside them the Ondas logo, on the page color, with its legend. At 900px and below the columns stack,
// the logo first, centered and at most 520px wide.
export function Hero() {
  return (
    <section
      data-block="hero"
      aria-labelledby="hero-title"
      className="mx-auto max-w-page px-gutter pt-6 pb-14"
    >
      <div className="grid grid-cols-hero items-end gap-x-12 gap-y-10 upto-900:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-5 pb-11.5">
          <h1
            id="hero-title"
            className="max-w-180 text-balance font-display font-light text-38-64 text-white leading-1125 tracking-tight-20"
          >
            Guardrails para agentes conversacionais de IA
          </h1>
          <Lead className="max-w-135">
            O time de Responsible AI pesquisa, desenvolve e implementa os guardrails dos agentes
            conversacionais da companhia: do ataque simulado à proteção de cada conversa em
            produção.
          </Lead>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink variant="white">Testar um guardrail</ButtonLink>
            <ButtonLink variant="outline">Ver os dados</ButtonLink>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3.5 upto-900:-order-1 upto-900:w-full upto-900:max-w-130 upto-900:justify-self-center">
          <div data-region="logo" className="aspect-square w-full">
            <OndasLogo background="var(--color-page)" />
          </div>
          <OndasCaption />
        </div>
      </div>
    </section>
  );
}
