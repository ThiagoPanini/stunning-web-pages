"use client";

import { useRef } from "react";
import { CycleCards } from "@/components/cycle-cards";
import { CycleLoop } from "@/components/cycle-loop";
import { STEPS, StepButton, StepTag } from "@/components/cycle-steps";
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

// A cycle that stands still with no step in focus, its deliverables all lit or none.
function stillCycle(lit: boolean): Cycle {
  const nothing = () => {};
  return {
    on: 0,
    held: false,
    running: false,
    isOn: () => false,
    isPinned: () => false,
    isLit: () => lit,
    isFiring: () => false,
    hold: nothing,
    release: nothing,
    pin: nothing,
  };
}

// The names of the four steps, each as its button.
export function StepButtonsSpecimen() {
  const cycle = stillCycle(false);
  return STEPS.map((step, i) => (
    <span key={step.name} className="text-16 text-bright">
      <StepButton cycle={cycle} step={i} />
    </span>
  ));
}

// The tags of the four deliverables, at rest or lit.
export function StepTagsSpecimen({ lit = false }: { lit?: boolean }) {
  const cycle = stillCycle(lit);
  return STEPS.map((step, i) => <StepTag key={step.name} cycle={cycle} step={i} className="" />);
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
