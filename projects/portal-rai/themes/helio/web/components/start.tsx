import { ApiCallCard } from "./api-call-card";
import { ButtonLink } from "./button-link";
import { SectionLabel } from "./section-label";
import { TextLink } from "./text-link";

// The Start section, "04 · Comece": the closing call, with the button and a link to "Integrações",
// next to the card that simulates an API call. The two columns stack when narrow, and each rises
// into place as it enters the view, the card a beat later. The button and the link lead to screens
// the design does not have yet, so they are inert. Keep data-block="start": the tests find the
// block by it.
export function Start() {
  return (
    <section
      data-block="start"
      className="flex flex-wrap items-center gap-x-16 gap-y-10 border-rule border-t pt-24 pb-26"
    >
      <div className="reveal-1 flex min-w-0 grow basis-105 flex-col gap-6">
        <SectionLabel>04 · Comece</SectionLabel>
        <h2 className="font-light text-32-56 leading-105 tracking-tight-30">
          Coloque seu agente à prova.
        </h2>
        <p className="max-w-130 text-pretty text-17 text-muted leading-160">
          Cole uma mensagem, escolha os guardrails e veja o veredito de cada um. Ou deixe o agente
          de ataque do Red Team tentar primeiro.
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <ButtonLink>Testar um guardrail</ButtonLink>
          <TextLink>Ver integrações →</TextLink>
        </div>
      </div>
      <ApiCallCard className="reveal-2 min-w-0 grow basis-105" />
    </section>
  );
}
