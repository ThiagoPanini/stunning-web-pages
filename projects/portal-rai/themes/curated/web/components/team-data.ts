// The two teams, in the board's words.
export const TEAMS = [
  {
    team: "red",
    name: "Red Team",
    line: "Ofensiva · antes da produção",
    short: "Ataca os agentes antes que alguém de fora ataque.",
    long: "Ataca os agentes antes que alguém de fora ataque. Cria agentes de ataque que simulam adversários reais em conversas com os agentes da companhia, turno a turno, até descobrir onde eles cedem.",
  },
  {
    team: "blue",
    name: "Blue Team",
    line: "Defensiva · em produção",
    short: "Protege cada conversa entre clientes e agentes.",
    long: "Protege cada conversa entre clientes e agentes. Implementa os guardrails que avaliam o que entra e o que sai de cada interação entre clientes e agentes, em produção e em tempo real.",
  },
] as const;

// The cards slide in from their side as they enter the view: the Red Team from the left, the Blue Team
// from the right.
export const SLIDE = { red: "slide-from-left", blue: "slide-from-right" } as const;
