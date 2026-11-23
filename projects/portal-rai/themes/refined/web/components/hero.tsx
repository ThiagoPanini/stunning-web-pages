import { ButtonLink } from "./button-link";
import { ChipStrip } from "./chip-strip";
import { OndasCaption } from "./ondas-caption";
import { OndasLogo } from "./ondas-logo";

// The opening of the Home, centered: the strip of chips, the title with its first line unlit, the
// paragraph, the two buttons, and the logo with its caption. Each part enters on load, one after another.
export function Hero() {
  return (
    <section data-block="hero" aria-labelledby="hero-title" className="pt-hero-top text-center">
      <div className="mx-auto flex max-w-280 flex-col items-center px-5">
        <ChipStrip className="enter-1" />
        <h1
          id="hero-title"
          className="enter-2 mt-9 font-normal text-46-96 text-bright leading-94 tracking-tight-45"
        >
          <span className="block text-unlit">Atacamos primeiro.</span>
          <span className="block">Protegemos sempre.</span>
        </h1>
        <p className="enter-3 mt-7 max-w-140 text-balance text-17-20 text-muted leading-150 tracking-tight-20">
          O time que pesquisa, desenvolve e implementa os guardrails dos agentes conversacionais de
          IA da companhia.
        </p>
        <div className="enter-4 mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink>Testar um guardrail</ButtonLink>
          <ButtonLink variant="secondary">Ver os dados</ButtonLink>
        </div>
        <div className="enter-5 mt-logo-top flex w-150 max-w-full flex-col gap-4.5">
          <div data-region="logo" className="aspect-square w-full overflow-hidden">
            <OndasLogo />
          </div>
          <OndasCaption />
        </div>
      </div>
    </section>
  );
}
