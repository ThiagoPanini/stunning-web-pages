import { CycleStep, type CycleStepProps } from "./cycle-step";
import { Paragraph } from "./paragraph";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

const STEPS: Omit<CycleStepProps, "number" | "total">[] = [
  { title: "Atacar os agentes antes que alguém de fora ataque", team: "Red Team", icon: "next" },
  { title: "Encontrar onde o agente cede e registrar tudo", team: "Red Team", icon: "next" },
  {
    title: "Transformar a falha em guardrail testável, versionado e medido",
    team: "Blue Team",
    icon: "next",
  },
  { title: "Proteger cada conversa em produção e em tempo real", team: "Blue Team", icon: "next" },
  { title: "Acompanhar o resultado todos os dias", team: "Blue Team", icon: "again" },
];

// Ciclo (5): the section head, the phrase with its unlit half, and the ordered list of the five steps
// between rules (rf-rows), each lighting up as it enters the view. A note closes the cycle.
export function Cycle() {
  return (
    <Section block="cycle" id="ciclo" labelledBy="cycle-title">
      <SectionHeader id="cycle-title" title="Ciclo" count={STEPS.length} />
      <p className="mb-10 text-balance font-normal text-24-30 text-bright leading-120 tracking-tight-30">
        <span className="text-unlit">O Red Team procura a falha.</span> O Blue Team fecha a falha.
      </p>
      {/* biome-ignore lint/a11y/noRedundantRoles: without list-style, Safari drops the list's role */}
      <ol role="list" className="border-bright-9 border-t">
        {STEPS.map((step, index) => (
          <CycleStep key={step.title} {...step} number={index + 1} total={STEPS.length} />
        ))}
      </ol>
      <Paragraph small className="mt-5 flex items-center gap-2.5">
        A cada nova versão de agente, o ciclo recomeça com o Red Team.
      </Paragraph>
    </Section>
  );
}
