import { ButtonLink } from "./button-link";
import { Caption } from "./caption";
import { DataChartIllustration } from "./data-chart-illustration";
import { Eyebrow } from "./eyebrow";
import { SectionTitle } from "./section-title";

// Data: the title, an illustrative chart with its legend, then the "Ver os dados" button beside four
// captions in two columns, pushed to the right. When narrow the button wraps above the captions, and at
// 760px and below the captions take one column.
export function DataSection() {
  return (
    <section data-block="data" id="dados" aria-labelledby="data-title" className="pt-section">
      <div className="flex flex-col gap-7 px-inset pb-14">
        <Eyebrow>Dados</Eyebrow>
        <SectionTitle id="data-title" size="32-44" className="max-w-250">
          Acompanhamos o resultado todos os dias.{" "}
          <span className="block text-muted">Acionamentos, falsos positivos e latência.</span>
        </SectionTitle>
      </div>
      <figure>
        <DataChartIllustration />
        <figcaption className="flex flex-wrap gap-x-6 gap-y-2 px-inset pt-4 font-mono text-12 text-muted">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 border border-rule-strong bg-bar-top" />
            Acionamentos
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 bg-lime-pale" />
            Falsos positivos
          </span>
          <span>Gráfico ilustrativo</span>
        </figcaption>
      </figure>
      <div className="flex flex-wrap gap-x-14 gap-y-10 px-inset pt-18 pb-24">
        <div className="flex-none">
          <ButtonLink variant="white">Ver os dados</ButtonLink>
        </div>
        <div className="ml-auto grid min-w-0 max-w-225 shrink grow basis-160 grid-cols-2 gap-x-14 gap-y-10 upto-760:grid-cols-1">
          <Caption lead="Acionamentos." variant="feature">
            Quantas vezes cada guardrail entrou em ação, por agente e por dia.
          </Caption>
          <Caption lead="Falsos positivos." variant="feature">
            Mensagens e respostas legítimas barradas por engano, para calibrar cada guardrail.
          </Caption>
          <Caption lead="Latência." variant="feature">
            Quanto cada avaliação acrescenta à conversa, como os 14 ms do exemplo.
          </Caption>
          <Caption lead="Veredito por guardrail." variant="feature">
            A decisão e o score de cada avaliação, como prompt_injection · score 0,93.
          </Caption>
        </div>
      </div>
    </section>
  );
}
