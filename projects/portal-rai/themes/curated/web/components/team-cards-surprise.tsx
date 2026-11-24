"use client";

import { SLIDE, TEAMS } from "./team-data";
import { TeamIcon } from "./team-icon";
import type { NeonEffect } from "./tweaks";
import { trackPointer } from "./use-cycle";

// The neon effect's names in the code: the tweak's options are the board's words.
const NEON: Record<NeonEffect, "fill" | "line" | "spot"> = {
  preenchimento: "fill",
  contorno: "line",
  holofote: "spot",
};

// Version 02 of the team cards, the surprise: two cards almost touching, quiet at rest. On hover the
// large copy takes the small one's place and the neon comes in the form the efeitoNeon tweak picks
// (globals.css, team-*). With a fine pointer and the cards side by side, the two react to each other:
// the Red Team shoots, the Blue Team raises its wall. The card follows the pointer through CSS
// variables, set on the card itself without drawing the page again.
export function TeamCardsSurprise({ neon }: { neon: NeonEffect }) {
  return (
    <div data-version="02-surprise" data-neon={NEON[neon]} className="grid grid-cols-teams gap-0.5">
      {TEAMS.map(({ team, name, line, short }) => (
        <article
          key={team}
          data-team={team}
          onMouseEnter={(event) => trackPointer(event, true)}
          onMouseMove={(event) => trackPointer(event, false)}
          onMouseLeave={(event) => trackPointer(event, true)}
          className={`${SLIDE[team]} team-card group/team relative z-0 min-w-0 hover:z-2`}
        >
          <span aria-hidden="true" className="team-glow pointer-events-none absolute" />
          <span aria-hidden="true" className="team-leak pointer-events-none absolute" />
          <div className="relative isolate z-1 box-border flex h-full min-h-team-card flex-col justify-between gap-14 overflow-hidden rounded-8 bg-surface p-8">
            <span aria-hidden="true" className="team-fill pointer-events-none absolute" />
            <span aria-hidden="true" className="team-spot pointer-events-none absolute" />
            <span aria-hidden="true" className="team-edge pointer-events-none absolute" />
            {team === "red" ? (
              [44, 52, 60].map((top, shot) => (
                <span
                  key={top}
                  aria-hidden="true"
                  className="team-shot pointer-events-none absolute z-1 font-medium font-mono text-13 text-red leading-100"
                  style={{ top: `${top}%`, animationDelay: ["0s", "0.14s", "0.28s"][shot] }}
                >
                  ×
                </span>
              ))
            ) : (
              <span
                aria-hidden="true"
                className="team-wall pointer-events-none absolute w-0.5 rounded-2 shadow-wall"
              />
            )}
            <div className="relative z-1 flex items-center gap-4">
              <span
                aria-hidden="true"
                className="team-icon team-react block size-9 flex-none text-bright"
              >
                <TeamIcon team={team} variant="card" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h3 className="team-name font-medium text-16 text-bright leading-px-24">{name}</h3>
                <p className="team-line font-normal text-14 text-subtle leading-px-19 tracking-tight-10">
                  {line}
                </p>
              </div>
            </div>
            <div className="relative z-1">
              <p className="team-small absolute inset-x-0 bottom-0 text-16 text-quiet leading-px-24">
                {short}
              </p>
              <p
                aria-hidden="true"
                className="team-large max-w-large-15 font-normal text-24-32-large leading-116 tracking-tight-40"
              >
                {short}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
