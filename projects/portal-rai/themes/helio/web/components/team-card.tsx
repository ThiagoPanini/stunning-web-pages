import type { ReactNode } from "react";

// Each team's name, mark and color: red is the attack, blue is the guardrail.
const teams = {
  red: { name: "Red Team", mark: "×", color: "text-red" },
  blue: { name: "Blue Team", mark: ":", color: "text-blue" },
} as const;

type TeamCardProps = {
  team: keyof typeof teams;
  // Where the team works, on the right of its name: "Ofensiva · antes da produção".
  stance: string;
  title: string;
  description: string;
  // What closes the card; on the Home, a terminal panel.
  children: ReactNode;
  // Classes from the page, such as the motion the card enters with.
  className?: string;
};

// The card of a team: its mark and name, where it works, a title, a paragraph and what closes it.
export function TeamCard({
  team,
  stance,
  title,
  description,
  children,
  className = "",
}: TeamCardProps) {
  const { name, mark, color } = teams[team];
  return (
    <article
      className={`flex flex-col gap-6 rounded-16 border border-rule bg-surface p-card ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-12 uppercase tracking-wide-80">
        <div className={`flex gap-2.5 ${color}`}>
          <span aria-hidden="true">{mark}</span>
          <span>{name}</span>
        </div>
        <div className="text-subtle">{stance}</div>
      </div>
      <h3 className="text-balance font-light text-24-32 leading-115 tracking-tight-20">{title}</h3>
      <p className="text-pretty text-15 text-muted leading-160">{description}</p>
      {children}
    </article>
  );
}
