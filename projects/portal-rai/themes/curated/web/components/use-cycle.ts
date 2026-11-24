"use client";

import { type MouseEvent, type RefObject, useEffect, useState } from "react";

// The cycle's state, the same in its four versions. step is the step of the turn while the cycle runs by
// itself; fire is the link with a pulse travelling along it (the one that leaves the step of the same
// index); hold is the step under the pointer or focused; pin is the step pinned with a click. -1 is none.
type CycleState = { step: number; fire: number; hold: number; pin: number };

// How long a step stays lit before its pulse leaves, and how long the pulse takes to the next step.
const LIT_MS = 3000;
const TRAVEL_MS = 950;

export type Cycle = {
  // The step in focus: the held one, or else the pinned one, or else the step of the turn.
  on: number;
  // Whether a step is held or pinned: the cycle stands still and shows that step's links.
  held: boolean;
  isOn: (i: number) => boolean;
  isPinned: (i: number) => boolean;
  // Link i leaves step i and reaches the next one. It is lit while its pulse travels, or, with a step
  // held, when it reaches that step (what it receives) or leaves it (what it hands on).
  isLit: (i: number) => boolean;
  isFiring: (i: number) => boolean;
  hold: (i: number) => void;
  release: () => void;
  pin: (i: number) => void;
};

// The cycle runs by itself while its section is on screen: each step stays lit for 3s, its pulse takes
// .95s to the next one, and so on, from Monitorar back to Pesquisar. It stops with reduced motion, off
// screen, with the tab hidden and while a step is held or pinned.
export function useCycle(section: RefObject<HTMLElement | null>): Cycle {
  const [state, setState] = useState<CycleState>({ step: 0, fire: -1, hold: -1, pin: -1 });
  const [still, setStill] = useState(true);
  const [seen, setSeen] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(reducedMotion.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    visibility();
    reducedMotion.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reducedMotion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    const element = section.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    setSeen(false);
    const observer = new IntersectionObserver(
      (entries) => setSeen(entries[entries.length - 1].isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [section]);

  const stopped = still || !seen || hidden || state.hold >= 0 || state.pin >= 0;

  useEffect(() => {
    if (stopped) {
      if (state.fire >= 0) setState((s) => ({ ...s, fire: -1 }));
      return;
    }
    const timer =
      state.fire >= 0
        ? setTimeout(() => setState((s) => ({ ...s, step: (s.step + 1) % 4, fire: -1 })), TRAVEL_MS)
        : setTimeout(() => setState((s) => ({ ...s, fire: s.step })), LIT_MS);
    return () => clearTimeout(timer);
  }, [stopped, state.fire]);

  const held = state.hold >= 0 || state.pin >= 0;
  const on = state.hold >= 0 ? state.hold : state.pin >= 0 ? state.pin : state.step;
  return {
    on,
    held,
    isOn: (i) => i === on,
    isPinned: (i) => state.pin === i,
    isLit: (i) => state.fire === i || (held && (i === on || (i + 1) % 4 === on)),
    isFiring: (i) => state.fire === i,
    hold: (i) => setState((s) => (s.hold !== i || s.fire >= 0 ? { ...s, hold: i, fire: -1 } : s)),
    // On leaving, the cycle goes on from the step that was in focus.
    release: () =>
      setState((s) => (s.hold < 0 ? s : { ...s, hold: -1, step: s.pin >= 0 ? s.pin : s.hold })),
    pin: (i) => setState((s) => ({ ...s, pin: s.pin === i ? -1 : i, step: i, fire: -1 })),
  };
}

// A data attribute that is there or not: data-on={flag(on)}.
export function flag(value: boolean): "" | undefined {
  return value ? "" : undefined;
}

// The pointer's place inside a card, as CSS variables on the card itself, without drawing the page
// again: --mx and --my in px, --px and --py from 0 to 1, and, on entering or leaving (edge), --ex and
// --ey, where the neon fill opens from and closes to.
export function trackPointer(event: MouseEvent<HTMLElement>, edge: boolean) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const style = element.style;
  style.setProperty("--mx", `${x.toFixed(1)}px`);
  style.setProperty("--my", `${y.toFixed(1)}px`);
  style.setProperty("--px", Math.max(0, Math.min(1, x / rect.width)).toFixed(3));
  style.setProperty("--py", Math.max(0, Math.min(1, y / rect.height)).toFixed(3));
  if (edge) {
    style.setProperty("--ex", `${x.toFixed(1)}px`);
    style.setProperty("--ey", `${y.toFixed(1)}px`);
  }
}
