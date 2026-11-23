import { SectionLabel } from "./section-label";
import { type Team, TeamBadge } from "./team-badge";

type Solution = {
  team: Team;
  name: string;
  // A word in mono next to the name, which only the Blue Team's solutions carry.
  tag?: string;
  description: string;
};

// Two solutions of each team, in the board's order.
const solutions: Solution[] = [
  {
    team: "red",
    name: "Agente de Ataque",
    description:
      "Um agente autônomo que conversa com o agente-alvo, adapta a estratégia a cada turno e registra tudo o que conseguiu.",
  },
  {
    team: "red",
    name: "Semana Vermelha",
    description:
      "Uma semana completa de simulação de ataques contra os agentes conversacionais, conduzida do início ao fim em uma plataforma própria do time.",
  },
  {
    team: "blue",
    name: "Guardrails de Entrada",
    tag: "antiataque",
    description:
      "Avaliam a mensagem do cliente antes de ela chegar ao agente e barram prompt injection, jailbreak e outras tentativas de ataque.",
  },
  {
    team: "blue",
    name: "Guardrails de Saída",
    tag: "ética",
    description:
      "Conferem a resposta do agente antes de ela chegar ao cliente, para que siga os princípios éticos e as políticas da companhia.",
  },
];

// The Solutions section, "03 · Principais soluções": a heading with its lead paragraph, then four
// rows, each with the team badge, the name and the description. The rows are ruled above, the last
// one also below; when narrow, each row stacks badge, name and description. Heading and rows rise
// into place as they enter the view. Keep data-block="solutions": the tests find the block by it.
export function Solutions() {
  return (
    <section data-block="solutions" className="flex flex-col gap-10 border-rule border-t py-24">
      <div className="reveal-1 flex flex-wrap items-end gap-x-12 gap-y-6">
        <div className="flex grow basis-80 flex-col gap-4">
          <SectionLabel>03 · Principais soluções</SectionLabel>
          <h2 className="font-light text-28-42 leading-110 tracking-tight-25">O que entregamos.</h2>
        </div>
        <p className="max-w-140 grow-2 basis-105 text-pretty text-17 text-muted leading-160">
          Quatro frentes, duas de cada time, que os times de produto podem acionar para os seus
          agentes conversacionais.
        </p>
      </div>
      <div className="flex flex-col">
        {solutions.map((solution) => (
          <div
            key={solution.name}
            className="reveal-1 flex flex-wrap items-baseline gap-x-8 gap-y-2.5 border-rule border-t py-7 last:border-b"
          >
            <div className="shrink-0 basis-18">
              <TeamBadge team={solution.team} />
            </div>
            <div className="flex min-w-0 grow-(--grow-120) basis-75 flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
              <h3 className="font-light text-22-30 leading-115 tracking-tight-20">
                {solution.name}
              </h3>
              {solution.tag && (
                <span className="font-mono text-12 text-subtle">{solution.tag}</span>
              )}
            </div>
            <p className="grow-(--grow-160) basis-85 text-pretty text-15 text-muted leading-155">
              {solution.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
