import { MissionColumn } from "./mission-column";
import { SectionLabel } from "./section-label";

// What the team does, in three steps: each one is a word of the title and a column below it. The
// /design-system route shows a column with this text too.
export const missionSteps = [
  {
    title: "Pesquisar",
    body: "Estudamos como agentes conversacionais falham: jailbreaks, prompt injection, vazamento de dados e respostas fora da política.",
    reveal: "reveal-1",
  },
  {
    title: "Desenvolver",
    body: "Transformamos cada falha conhecida em um guardrail testável, versionado e medido antes de chegar a qualquer cliente.",
    reveal: "reveal-2",
  },
  {
    title: "Implementar",
    body: "Colocamos os guardrails em produção, dentro da conversa entre clientes e agentes, e acompanhamos o resultado todos os dias.",
    reveal: "reveal-3",
  },
];

// 01 · Missão: the large title whose words light up one after the other while it crosses the view, and
// three columns that rise into place, staggered, as they enter it. Keep data-block="mission": the tests
// find the block by it.
export function Mission() {
  return (
    <section data-block="mission" className="flex flex-col gap-16 border-rule border-t py-24">
      <div className="flex flex-col gap-6">
        <SectionLabel>01 · Missão</SectionLabel>
        <h2 className="max-w-275 font-light text-36-92 leading-103 tracking-tight-40">
          <span className="light-up-1">Pesquisar, </span>
          <span className="light-up-2">desenvolver, </span>
          <span className="light-up-3">implementar.</span>
        </h2>
      </div>
      <div className="grid grid-cols-mission gap-x-10 gap-y-8">
        {missionSteps.map((step) => (
          <MissionColumn key={step.title} title={step.title} className={step.reveal}>
            {step.body}
          </MissionColumn>
        ))}
      </div>
    </section>
  );
}
