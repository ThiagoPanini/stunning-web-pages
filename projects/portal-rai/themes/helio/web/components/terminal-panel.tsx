import type { ReactNode } from "react";

export type TerminalTone = "red" | "blue" | "subtle";

const toneClass: Record<TerminalTone, string> = {
  red: "text-red",
  blue: "text-blue",
  subtle: "text-subtle",
};

// A panel in the style of a terminal: mono lines on the page color, set inside a team card.
export function TerminalPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.25 rounded-10 border border-rule bg-night px-4.5 py-4 font-mono text-13 text-muted leading-140">
      {children}
    </div>
  );
}

// A line on its own, in the subtle color: a command, a flow, a closing note.
export function TerminalNote({ children }: { children: ReactNode }) {
  return <div className="text-subtle">{children}</div>;
}

type TerminalLeaderRowProps = {
  step: string;
  outcome: string;
  // The outcome's color; without one it keeps the panel's.
  tone?: TerminalTone;
};

// A step and its outcome joined by a dotted leader: "turno 2 · injeção indireta ······ contido".
export function TerminalLeaderRow({ step, outcome, tone }: TerminalLeaderRowProps) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span>{step}</span>
      <span aria-hidden="true" className="grow basis-3 border-rule-strong border-b border-dotted" />
      <span className={tone && toneClass[tone]}>{outcome}</span>
    </div>
  );
}

type TerminalStageRowProps = {
  stage: string;
  // The stage's color; without one it keeps the panel's.
  tone?: TerminalTone;
  children: ReactNode;
};

// A stage in a fixed column, in its color, and what happens in it: "entrada   prompt injection · PII".
export function TerminalStageRow({ stage, tone, children }: TerminalStageRowProps) {
  return (
    <div className="flex items-baseline gap-3.5">
      <span className={`shrink-0 basis-16 ${tone ? toneClass[tone] : ""}`}>{stage}</span>
      <span>{children}</span>
    </div>
  );
}
