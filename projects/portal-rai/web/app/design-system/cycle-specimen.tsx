"use client";

import { useRef } from "react";
import { CycleCards } from "@/components/cycle-cards";
import { CycleLoop } from "@/components/cycle-loop";
import { type Cycle, useCycle } from "@/components/use-cycle";

const VERSIONS = { CycleLoop, CycleCards };

// A cycle drawn held on one step, with no pointer on it: the state the version shows while a step is
// under the pointer, focused or pinned.
function heldCycle(on: number): Cycle {
  const nothing = () => {};
  return {
    on,
    held: true,
    running: false,
    isOn: (i) => i === on,
    isPinned: () => false,
    isLit: (i) => i === on || (i + 1) % 4 === on,
    isFiring: () => false,
    hold: nothing,
    release: nothing,
    pin: nothing,
  };
}

type CycleSpecimenProps = {
  version: keyof typeof VERSIONS;
  // Off, the version runs live: by itself while on screen, held and pinned by the pointer. On, it is
  // drawn held on this step.
  held?: number;
};

// A version of the cycle on the route, as the Home draws it.
export function CycleSpecimen({ version, held }: CycleSpecimenProps) {
  const box = useRef<HTMLDivElement>(null);
  const live = useCycle(box);
  const Version = VERSIONS[version];
  return (
    <div ref={box} className="w-full">
      <Version cycle={held === undefined ? live : heldCycle(held)} />
    </div>
  );
}
