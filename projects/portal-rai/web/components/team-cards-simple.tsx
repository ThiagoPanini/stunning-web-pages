import { SLIDE, TEAMS } from "./team-data";
import { TeamIcon } from "./team-icon";

// Version 01 of the team cards, the simple one: a thin frame that darkens on hover around a night card,
// with the team's number and its icon in a disc at the top and its text at the bottom.
export function TeamCardsSimple() {
  return (
    <div data-version="01-simple" className="grid grid-cols-teams gap-4">
      {TEAMS.map(({ team, name, line, long }, i) => (
        <article
          key={team}
          className={`${SLIDE[team]} flex min-w-0 rounded-16 bg-rule p-1 transition-[background-color] duration-300 hover:bg-rule-strong`}
        >
          <div className="box-content flex min-h-86 min-w-0 flex-auto flex-col justify-between gap-12 rounded-12 bg-night p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="font-light text-28 tabular-nums leading-100 tracking-tight-30">
                {`0${i + 1}.`}
              </span>
              <span
                aria-hidden="true"
                className={`grid size-11 flex-none place-items-center rounded-circle bg-rule ${
                  team === "red" ? "text-red" : "text-blue"
                }`}
              >
                <TeamIcon team={team} variant="simple" />
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-12 text-subtle uppercase tracking-wide-80">{line}</p>
              <h3 className="font-light text-24-32 leading-115 tracking-tight-20">{name}</h3>
              <p className="max-w-140 text-pretty text-15 text-muted leading-160">{long}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
