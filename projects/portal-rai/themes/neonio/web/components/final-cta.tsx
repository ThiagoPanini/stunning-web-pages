import { ButtonLink } from "./button-link";
import { Lead } from "./lead";
import { PlaceholderMark } from "./media-placeholder";

// The closing call, below the ruled frame and the section space above it: a wide media placeholder, a
// design gap, whose label sits in its middle, with the title and a line at its top and two buttons at
// its bottom. The board draws it as a placeholder box (.uk-ph) of its own size, square-cornered.
export function FinalCta() {
  return (
    <section
      data-block="cta"
      aria-labelledby="cta-title"
      className="relative mt-section flex min-h-cta-height flex-col justify-between gap-12 overflow-hidden border border-rule-subtle bg-placeholder pt-cta-top pb-cta-bottom px-cta-x"
    >
      <PlaceholderMark
        label="inserir gif · 2:1"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <div className="relative z-1 flex max-w-150 flex-col gap-5">
        <h2
          id="cta-title"
          className="text-pretty font-display font-light text-26-32 text-white leading-1130 tracking-tight-15"
        >
          Coloque seu agente à prova.{" "}
          <span className="block text-muted">
            Cole uma mensagem, escolha os guardrails e veja o veredito de cada um.
          </span>
        </h2>
        <Lead tone="secondary" className="max-w-105">
          Ou deixe o agente de ataque do Red Team tentar primeiro.
        </Lead>
      </div>
      <div className="relative z-1 flex flex-wrap gap-2">
        <ButtonLink variant="white">Testar um guardrail</ButtonLink>
        <ButtonLink variant="outline">Ver integrações</ButtonLink>
      </div>
    </section>
  );
}
