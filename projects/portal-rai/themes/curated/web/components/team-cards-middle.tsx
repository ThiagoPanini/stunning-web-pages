import { GifSpace } from "./gif-space";
import { SLIDE, TEAMS } from "./team-data";
import { TeamIcon } from "./team-icon";

// Version 03 of the team cards, the middle: Version 02 at rest, without hover, with the space of a GIF
// in the middle of each card.
export function TeamCardsMiddle() {
  return (
    <div className="grid grid-cols-teams gap-0.5">
      {TEAMS.map(({ team, name, line, short }) => (
        <article
          key={team}
          className={`${SLIDE[team]} flex min-w-0 flex-col gap-7 rounded-8 bg-surface p-8`}
        >
          <div className="relative z-1 flex items-center gap-4">
            <span aria-hidden="true" className="block size-9 flex-none text-bright">
              <TeamIcon team={team} variant="card" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h3 className="font-medium text-16 text-bright leading-px-24">{name}</h3>
              <p className="font-normal text-14 text-subtle leading-px-19 tracking-tight-10">
                {line}
              </p>
            </div>
          </div>
          <GifSpace
            label={`Espaço reservado para o GIF do ${name}, proporção 16:9`}
            lines={[`Inserir GIF · ${name}`, "16:9 · 1280 × 720"]}
          />
          <p className="text-16 text-quiet leading-px-24">{short}</p>
        </article>
      ))}
    </div>
  );
}
