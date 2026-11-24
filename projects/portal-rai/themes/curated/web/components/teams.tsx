"use client";

import { SectionHeader } from "./section-header";
import { TeamCardsMiddle } from "./team-cards-middle";
import { TeamCardsSimple } from "./team-cards-simple";
import { TeamCardsSurprise } from "./team-cards-surprise";
import { useTweaks } from "./tweaks";

// Section 02, the teams: the title, and the two team cards in the version the versaoCards tweak picks.
// Only the cards change.
export function Teams() {
  const { versaoCards, efeitoNeon } = useTweaks();
  return (
    <section
      id="times"
      data-block="teams"
      aria-labelledby="times-t"
      className="flex scroll-mt-16 flex-col gap-12 border-rule border-t py-24"
    >
      <SectionHeader
        label="02 · Times"
        titleId="times-t"
        title="Dois times, um propósito"
        lead="O Red Team procura a falha e o Blue Team corrige: o que um descobre vira backlog do outro."
      />
      {versaoCards === "01-simple" && <TeamCardsSimple />}
      {versaoCards === "02-surprise" && <TeamCardsSurprise neon={efeitoNeon} />}
      {versaoCards === "03-middle" && <TeamCardsMiddle />}
    </section>
  );
}
