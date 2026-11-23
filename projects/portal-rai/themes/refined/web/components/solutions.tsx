import type { ReactNode } from "react";
import { Bezel } from "./bezel";
import { IconDisc } from "./icon-disc";
import { Paragraph } from "./paragraph";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

type Solution = {
  name: string;
  // The team that owns it, and the side of the Blue Team's work, as the label above the name.
  label: string;
  // The color of the icon: the team's.
  team: "red" | "blue";
  // The icon's strokes, drawn on a 20px grid.
  icon: ReactNode;
  line: string;
};

const SOLUTIONS: Solution[] = [
  {
    name: "Agente de Ataque",
    label: "Red Team",
    team: "red",
    icon: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="M10 1.75v3.5M10 14.75v3.5M1.75 10h3.5M14.75 10h3.5" />
      </>
    ),
    line: "Um agente autônomo que conversa com o agente-alvo, adapta a estratégia a cada turno e registra tudo o que conseguiu.",
  },
  {
    name: "Semana Vermelha",
    label: "Red Team",
    team: "red",
    icon: (
      <>
        <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
        <path d="M3 8.5h14M7 2.75v3.5M13 2.75v3.5" />
      </>
    ),
    line: "Uma semana completa de simulação de ataques contra os agentes conversacionais, conduzida em uma plataforma própria do time.",
  },
  {
    name: "Guardrails de Entrada",
    label: "Blue Team · antiataque",
    team: "blue",
    icon: (
      <>
        <path d="M11.5 3.5h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3" />
        <path d="M3 10h9M8.5 6.5 12 10l-3.5 3.5" />
      </>
    ),
    line: "Avaliam a mensagem do cliente antes de ela chegar ao agente e barram prompt injection, jailbreak e outras tentativas de ataque.",
  },
  {
    name: "Guardrails de Saída",
    label: "Blue Team · ética",
    team: "blue",
    icon: (
      <>
        <path d="M8.5 3.5h-3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        <path d="M8 10h9M13.5 6.5 17 10l-3.5 3.5" />
      </>
    ),
    line: "Conferem a resposta do agente antes de ela chegar ao cliente, para que siga os princípios éticos e as políticas da companhia.",
  },
];

// Soluções (4): the section head and a 2 × 2 grid of bezel cards, one column at 760px and below. Each
// card, 344px tall at least, has its number ("01.") and an icon in its team's color at the top, and the
// team label, the name and one line at the bottom. Each card rises into place as it enters the view.
export function Solutions() {
  return (
    <Section block="solutions" id="solucoes" labelledBy="solutions-title">
      <SectionHeader id="solutions-title" title="Soluções" count={SOLUTIONS.length} />
      {/* biome-ignore lint/a11y/noRedundantRoles: without list-style, Safari drops the list's role */}
      <ul role="list" className="grid grid-cols-2 gap-4 narrow:grid-cols-1">
        {SOLUTIONS.map((solution, index) => (
          <Bezel key={solution.name} className="rise" coreClassName="min-h-86">
            <div className="flex items-start justify-between gap-4">
              <span className="font-normal text-28 text-bright tabular-nums leading-100 tracking-tight-40">
                {`${String(index + 1).padStart(2, "0")}.`}
              </span>
              <IconDisc tone={solution.team}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {solution.icon}
                </svg>
              </IconDisc>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium text-14 text-muted tracking-tight-10">{solution.label}</p>
              <h3 className="font-normal text-24 text-bright leading-120 tracking-tight-30">
                {solution.name}
              </h3>
              <Paragraph>{solution.line}</Paragraph>
            </div>
          </Bezel>
        ))}
      </ul>
    </Section>
  );
}
