"use client";

import { useRef } from "react";
import { CycleCards } from "./cycle-cards";
import { CycleLoop } from "./cycle-loop";
import { SectionHeader } from "./section-header";
import { useTweaks } from "./tweaks";
import { useCycle } from "./use-cycle";

// Section 01, the working model: the title, and the cycle of four steps in the version the versaoCiclo
// tweak picks. Only the cycle changes; the title and the lead stay. The cycle keeps its state across the
// versions, and runs by itself while the section is on screen.
export function Model() {
  const { versaoCiclo } = useTweaks();
  const section = useRef<HTMLElement>(null);
  const cycle = useCycle(section);
  return (
    <section
      ref={section}
      id="modelo"
      data-block="model"
      aria-labelledby="modelo-t"
      className="relative z-1 flex scroll-mt-16 flex-col gap-12 border-rule border-t py-24"
    >
      <SectionHeader
        label="01 · Modelo de trabalho"
        titleId="modelo-t"
        title="Um ciclo integrado"
        lead="Da novidade à implementação prática: o trabalho contínuo de Responsible AI"
      />
      {versaoCiclo === "06-laco" && <CycleLoop cycle={cycle} />}
      {versaoCiclo === "03-cartoes" && <CycleCards cycle={cycle} />}
    </section>
  );
}
