import type { ReactNode } from "react";
import { Caption } from "./caption";
import { Eyebrow } from "./eyebrow";
import { MediaPlaceholder } from "./media-placeholder";
import { SectionTitle } from "./section-title";

type BentoCardProps = {
  lead: string;
  children: ReactNode;
  // The media slot under the caption, a design gap: "inserir gif · 16:10".
  media: ReactNode;
  // The tall card spans both rows of the bento; at 1100px and below it takes a whole row instead.
  tall?: boolean;
};

// A card of the bento (.uk-bcard): the caption on top and its media slot below.
function BentoCard({ lead, children, media, tall = false }: BentoCardProps) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-6 bg-page px-7 pt-7 pb-7.5 ${tall ? "row-span-2 upto-1100:col-span-full upto-1100:row-auto" : ""}`.trim()}
    >
      <Caption lead={lead} variant="bento">
        {children}
      </Caption>
      {media}
    </div>
  );
}

function WideMedia() {
  return <MediaPlaceholder label="inserir gif · 16:10" className="aspect-16-10" />;
}

// Integrations: the centered title and a bento of five cards in three columns, ruled by its 1px gaps,
// the second card spanning both rows. At 1100px and below the bento has two columns, the tall card a
// row of its own; at 640px and below, one column.
export function Integrations() {
  return (
    <section
      data-block="integrations"
      id="integracoes"
      aria-labelledby="integrations-title"
      className="pt-section"
    >
      <div className="flex flex-col items-center gap-7 px-inset pb-18 text-center">
        <Eyebrow align="center">Integrações</Eyebrow>
        <SectionTitle id="integrations-title" size="32-52" className="max-w-265">
          Protegemos cada conversa entre clientes e agentes, em produção e em tempo real.
        </SectionTitle>
      </div>
      <div className="grid grid-cols-3 gap-px border-rule border-y bg-rule upto-1100:grid-cols-2 upto-640:grid-cols-1">
        <BentoCard lead="Entrada." media={<WideMedia />}>
          Os guardrails de entrada avaliam a mensagem do cliente antes de ela chegar ao agente.
        </BentoCard>
        <BentoCard
          lead="API de avaliação."
          tall
          media={<MediaPlaceholder label="inserir gif · 3:5" className="min-h-80 flex-auto" />}
        >
          Envie a mensagem e receba o veredito de cada guardrail, com o score e a latência da
          avaliação.
        </BentoCard>
        <BentoCard lead="Saída." media={<WideMedia />}>
          Os guardrails de saída conferem a resposta do agente antes de ela chegar ao cliente, para
          que siga os princípios éticos e as políticas da companhia.
        </BentoCard>
        <BentoCard lead="Guardrails por etapa." media={<WideMedia />}>
          Entrada: prompt injection, jailbreak, PII e escopo. Saída: política, PII e fundamentação.
        </BentoCard>
        <BentoCard lead="Em tempo real." media={<WideMedia />}>
          Dentro da conversa entre clientes e agentes, a cada mensagem e a cada resposta.
        </BentoCard>
      </div>
    </section>
  );
}
