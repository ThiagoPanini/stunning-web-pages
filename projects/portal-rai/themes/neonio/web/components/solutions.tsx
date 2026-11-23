import type { ReactNode } from "react";
import { AntiAttackGuardrailIllustration } from "./anti-attack-guardrail-illustration";
import { AttackAgentIllustration } from "./attack-agent-illustration";
import { Caption } from "./caption";
import { Lead } from "./lead";
import { NeonSquare } from "./neon-square";
import { OutputEthicsGuardrailIllustration } from "./output-ethics-guardrail-illustration";
import { RedWeekIllustration } from "./red-week-illustration";
import { SectionTitle } from "./section-title";

type Solution = {
  title: string;
  illustration: ReactNode;
  lead: string;
  caption: string;
};

type Team = {
  id: string;
  name: string;
  scope: string;
  neon: "red" | "blue";
  solutions: [Solution, Solution];
};

const TEAMS: Team[] = [
  {
    id: "red-team-name",
    name: "Red Team",
    scope: "Ofensiva · antes da produção",
    neon: "red",
    solutions: [
      {
        title: "Agente de Ataque",
        illustration: <AttackAgentIllustration />,
        lead: "Adapta a cada turno.",
        caption:
          "Um agente autônomo que conversa com o agente-alvo, muda de estratégia a cada turno e registra tudo o que conseguiu.",
      },
      {
        title: "Semana Vermelha",
        illustration: <RedWeekIllustration />,
        lead: "Do início ao fim.",
        caption:
          "Uma semana completa de simulação de ataques contra os agentes conversacionais, numa plataforma própria do time.",
      },
    ],
  },
  {
    id: "blue-team-name",
    name: "Blue Team",
    scope: "Defensiva · em produção",
    neon: "blue",
    solutions: [
      {
        title: "Guardrail Antiataque",
        illustration: <AntiAttackGuardrailIllustration />,
        lead: "Antes do agente.",
        caption:
          "Avalia a mensagem do cliente e barra prompt injection, jailbreak e outras tentativas de ataque.",
      },
      {
        title: "Guardrail Ética Saída",
        illustration: <OutputEthicsGuardrailIllustration />,
        lead: "Antes do cliente.",
        caption:
          "Confere a resposta do agente para que siga os princípios éticos e as políticas da companhia.",
      },
    ],
  },
];

// A solution (.uk-card): its mono title, its drawing and its caption, pushed to the bottom of the card.
function SolutionCard({ title, illustration, lead, caption }: Solution) {
  return (
    <li className="flex min-h-95 min-w-0 flex-col bg-page px-8 pt-6.5 pb-6 upto-640:px-5 upto-640:pt-6">
      <h3 className="font-mono-short font-normal text-15 text-subtle leading-1250">{title}</h3>
      {illustration}
      <Caption lead={lead} variant="card">
        {caption}
      </Caption>
    </li>
  );
}

// A team's column (.uk-team-g): a header with its neon square, name and scope, over its two solutions,
// side by side down to 640px and stacked below.
function TeamColumn({ id, name, scope, neon, solutions }: Team) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: the board names each column as a group of its team's solutions; a fieldset would make it part of a form
    <div role="group" aria-labelledby={id} className="flex min-w-0 flex-col bg-page">
      <div className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1.5 border-rule border-b px-8 py-3 font-mono-short font-normal text-12 text-subtle leading-1300 upto-640:px-5">
        <NeonSquare team={neon} size="small" />
        <span id={id} className="text-secondary uppercase tracking-wide-60">
          {name}
        </span>
        <span>{scope}</span>
      </div>
      {/* biome-ignore lint/a11y/noRedundantRoles: the board's role="list"; list-style none takes the list role away in Safari */}
      <ul role="list" className="grid flex-auto grid-cols-2 gap-px bg-rule upto-640:grid-cols-1">
        {solutions.map((solution) => (
          <SolutionCard key={solution.title} {...solution} />
        ))}
      </ul>
    </div>
  );
}

// Solutions: the title, the lead and the two team columns in a ruled grid, two illustrated cards each.
// The columns stack at 1100px and below. The id is the anchor of the footer's solution links.
export function Solutions() {
  return (
    <section
      data-block="solutions"
      id="solucoes"
      aria-labelledby="solutions-title"
      className="pt-section"
    >
      <div className="flex max-w-205 flex-col gap-6 px-inset">
        <SectionTitle id="solutions-title" size="32-44">
          Do ataque simulado à proteção de cada conversa em produção.
        </SectionTitle>
        <Lead className="max-w-130">
          Quatro frentes, duas de cada time, que os times de produto podem acionar para os seus
          agentes conversacionais.
        </Lead>
      </div>
      <div className="mt-teams grid grid-cols-2 gap-px border-rule border-y bg-rule upto-1100:grid-cols-1">
        {TEAMS.map((team) => (
          <TeamColumn key={team.id} {...team} />
        ))}
      </div>
    </section>
  );
}
