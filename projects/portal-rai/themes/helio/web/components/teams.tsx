import { SectionLabel } from "./section-label";
import { TeamCard } from "./team-card";
import {
  TerminalLeaderRow,
  TerminalNote,
  TerminalPanel,
  TerminalStageRow,
  type TerminalTone,
} from "./terminal-panel";

type Line = { label: string; detail: string; tone?: TerminalTone };

// The Red Team's attack agent, turn by turn, until one attack gets through.
export const attackTurns: Line[] = [
  { label: "turno 1 · pedido legítimo", detail: "respondeu" },
  { label: "turno 2 · injeção indireta", detail: "contido", tone: "blue" },
  { label: "turno 3 · troca de persona", detail: "contido", tone: "blue" },
  { label: "turno 4 · ofuscação com números", detail: "passou", tone: "red" },
];

// Where the Blue Team's guardrails sit in a conversation, and what each stage checks.
export const guardStages: Line[] = [
  { label: "entrada", detail: "prompt injection · jailbreak · PII · escopo", tone: "blue" },
  { label: "agente", detail: "gera a resposta", tone: "subtle" },
  { label: "saída", detail: "política · PII · fundamentação", tone: "blue" },
  { label: "medição", detail: "acionamentos · falsos positivos · latência", tone: "subtle" },
];

// The text of each team's card. The /design-system route shows the same two cards and panels.
export const redTeamCard = {
  team: "red",
  stance: "Ofensiva · antes da produção",
  title: "Ataca os agentes antes que alguém de fora ataque.",
  description:
    "Cria agentes de ataque que simulam adversários reais em conversas com os agentes da companhia, turno a turno, até descobrir onde eles cedem.",
} as const;

export const blueTeamCard = {
  team: "blue",
  stance: "Defensiva · em produção",
  title: "Protege cada conversa entre clientes e agentes.",
  description:
    "Implementa os guardrails que avaliam o que entra e o que sai de cada interação entre clientes e agentes, em produção e em tempo real.",
} as const;

// The panel that closes the Red Team's card: one run of the attack agent.
export function RedTeamPanel() {
  return (
    <TerminalPanel>
      <TerminalNote>$ agente-de-ataque --alvo atendimento</TerminalNote>
      {attackTurns.map((turn) => (
        <TerminalLeaderRow
          key={turn.label}
          step={turn.label}
          outcome={turn.detail}
          tone={turn.tone}
        />
      ))}
      <TerminalNote>1 achado novo enviado ao Blue Team</TerminalNote>
    </TerminalPanel>
  );
}

// The panel that closes the Blue Team's card: the guardrails around a conversation.
export function BlueTeamPanel() {
  return (
    <TerminalPanel>
      <TerminalNote>{"cliente -> guardrails -> agente -> guardrails -> cliente"}</TerminalNote>
      {guardStages.map((stage) => (
        <TerminalStageRow key={stage.label} stage={stage.label} tone={stage.tone}>
          {stage.detail}
        </TerminalStageRow>
      ))}
    </TerminalPanel>
  );
}

// The Teams section, "02 · Times": the title and its paragraph rise into place, and the Red Team
// and Blue Team cards slide in from their sides as they enter the view. Keep data-block="teams":
// the tests find the block by it.
export function Teams() {
  return (
    <section data-block="teams" className="flex flex-col gap-12 border-rule border-t py-24">
      <div className="reveal-1 flex flex-wrap items-end gap-x-12 gap-y-6">
        <div className="flex grow basis-65 flex-col gap-4">
          <SectionLabel>02 · Times</SectionLabel>
          <h2 className="font-light text-28-42 leading-110 tracking-tight-25">
            Dois times, um ciclo.
          </h2>
        </div>
        <p className="max-w-160 grow-3 basis-140 text-pretty text-17 text-muted leading-160">
          O Red Team procura a falha. O Blue Team fecha a falha. O que um descobre vira o backlog do
          outro, a cada nova versão de agente.
        </p>
      </div>
      <div className="grid grid-cols-teams gap-4">
        <TeamCard {...redTeamCard} className="slide-from-left">
          <RedTeamPanel />
        </TeamCard>
        <TeamCard {...blueTeamCard} className="slide-from-right">
          <BlueTeamPanel />
        </TeamCard>
      </div>
    </section>
  );
}
