"use client";

import {
  cycleGroup,
  HALVES,
  type Half,
  halfSentence,
  passColor,
  STEPS,
  StepButton,
  StepDeliverable,
  StepIcon,
  StepTag,
} from "./cycle-steps";
import { type Cycle, flag } from "./use-cycle";

// The loop's drawing, in the board's viewBox (760 by 360): one lobe for each half of the work, the left
// one before production and the right one in production.
const LOBES: Record<Half, string> = {
  before:
    "M380 180C340.7 214 301.5 247.9 265.2 271.9C228.9 296 195.6 310 167.9 310C140.1 310 117.9 296 102.8 271.9C87.8 247.9 80 214 80 180C80 146 87.8 112.1 102.8 88.1C117.9 64 140.1 50 167.9 50C195.6 50 228.9 64 265.2 88.1C301.5 112.1 340.7 146 380 180Z",
  production:
    "M380 180C419.3 214 458.5 247.9 494.8 271.9C531.1 296 564.4 310 592.1 310C619.9 310 642.1 296 657.2 271.9C672.2 247.9 680 214 680 180C680 146 672.2 112.1 657.2 88.1C642.1 64 619.9 50 592.1 50C564.4 50 531.1 64 494.8 88.1C458.5 112.1 419.3 146 380 180Z",
};

// The names of the two halves, each in the middle of its lobe. Class names written whole, so Tailwind
// finds them.
const CAPTIONS: { half: Half; place: string }[] = [
  { half: "before", place: "loop-caption-left" },
  { half: "production", place: "loop-caption-right" },
];

// Where each step's parts sit around the drawing, in the steps' order. Its station, on the stroke, as a
// share of the drawing: Pesquisar and Desenvolver on the left lobe, Implementar and Monitorar on the
// right one. The arc of the stroke from its station to the next one, which its deliverable travels, with
// its comet: the two short arcs, on the ends of the lobes, have a longer one. Its deliverable's tag, and
// the way the tag's arrow points. Its item of the list. Class names written whole, so Tailwind finds
// them.
const PLACES = [
  {
    station: { left: "14.46%", top: "21.71%" },
    arc: "M109.9 78.2C96.8 94.3 87.9 116.7 83.4 141.6C78.9 166.4 78.9 193.6 83.4 218.4C87.9 243.3 96.8 265.7 109.9 281.8",
    comet: "loop-comet-short",
    tag: "loop-tag-left",
    arrow: "M6 2v8M2.5 6.5 6 10l3.5-3.5",
    item: "loop-item-left loop-item-top",
  },
  {
    station: { left: "14.46%", top: "78.29%" },
    arc: "M109.9 281.8C126.1 302 148.7 312.1 176.1 309.6C203.5 307.1 235.7 292.1 270.5 268.3C305.3 244.6 342.6 212.4 380 180C417.4 147.6 454.7 115.4 489.5 91.7C524.3 67.9 556.5 52.9 583.9 50.4C611.3 47.9 633.9 58 650.1 78.2",
    comet: "loop-comet",
    tag: "loop-tag-top",
    arrow: "M2 6h8M6.5 2.5 10 6l-3.5 3.5",
    item: "loop-item-left loop-item-bottom",
  },
  {
    station: { left: "85.54%", top: "21.71%" },
    arc: "M650.1 78.2C663.2 94.3 672.1 116.7 676.6 141.6C681.1 166.4 681.1 193.6 676.6 218.4C672.1 243.3 663.2 265.7 650.1 281.8",
    comet: "loop-comet-short",
    tag: "loop-tag-right",
    arrow: "M6 2v8M2.5 6.5 6 10l3.5-3.5",
    item: "loop-item-right loop-item-top",
  },
  {
    station: { left: "85.54%", top: "78.29%" },
    arc: "M650.1 281.8C633.9 302 611.3 312.1 583.9 309.6C556.5 307.1 524.3 292.1 489.5 268.3C454.7 244.6 417.4 212.4 380 180C342.6 147.6 305.3 115.4 270.5 91.7C235.7 67.9 203.5 52.9 176.1 50.4C148.7 47.9 126.1 58 109.9 78.2",
    comet: "loop-comet",
    tag: "loop-tag-bottom",
    arrow: "M10 6H2M5.5 2.5 2 6l3.5 3.5",
    item: "loop-item-right loop-item-bottom",
  },
];

// The arcs are drawn in the board's order, so the crossing keeps its depth: the fourth arc first, the
// two short ones, the gap that opens the crossing, and the second arc over all of them.
const GAP = "M369.2 189.4 390.8 170.6";
const UNDER = [3, 0, 2];
const OVER = [1];

function Arc({ cycle, i }: { cycle: Cycle; i: number }) {
  const { arc, comet } = PLACES[i];
  return (
    <g data-lit={flag(cycle.isLit(i))} data-fire={flag(cycle.isFiring(i))} style={passColor(i)}>
      <path d={arc} className="loop-track" />
      <path d={arc} className="loop-flow" />
      <path d={arc} pathLength={100} className={comet} />
    </g>
  );
}

// Version 06 of the cycle, the loop: one stroke in the shape of infinity. The left lobe is the work
// before production, the right one what happens in production. A station sits on the stroke for each
// step, the deliverables are tags around the crossing, each with a dot in its color and an arrow that
// says which way it goes, and the four steps are a list on both sides. A comet runs along the arc between
// two stations while a deliverable travels; the lobe of the step in focus lights. Stations and items
// hold their step under the pointer and pin it with a click; the step's button holds it on focus. At
// 1099px and below the drawing goes up, without the tags, and the list goes two by two below it, each
// step saying what it delivers; at 600px and below the list is one column.
export function CycleLoop({ cycle }: { cycle: Cycle }) {
  const half = STEPS[cycle.on].half;
  return (
    <div {...cycleGroup(cycle, "06-laco")} className="reveal-2 loop">
      <div className="loop-map">
        <svg
          aria-hidden="true"
          viewBox="0 0 760 360"
          className="absolute inset-0 block size-full overflow-visible"
        >
          <path d={LOBES.before} data-on={flag(half === "before")} className="loop-lobe" />
          <path d={LOBES.production} data-on={flag(half === "production")} className="loop-lobe" />
          {UNDER.map((i) => (
            <Arc key={i} cycle={cycle} i={i} />
          ))}
          <path d={GAP} className="loop-gap" />
          {OVER.map((i) => (
            <Arc key={i} cycle={cycle} i={i} />
          ))}
        </svg>
        {CAPTIONS.map((caption) => (
          <span
            key={caption.half}
            aria-hidden="true"
            data-on={flag(caption.half === half)}
            className={`loop-caption ${caption.place} pointer-events-none whitespace-nowrap font-mono font-normal text-11 text-subtle uppercase leading-130 tracking-wide-80`}
          >
            {HALVES[caption.half]}
          </span>
        ))}
        {STEPS.map((step, i) => (
          // The station mirrors the item's button, which is the step's control for the keyboard and
          // screen readers: to them the station is not there.
          <span
            key={step.name}
            aria-hidden="true"
            data-station
            data-on={flag(cycle.isOn(i))}
            onMouseEnter={() => cycle.hold(i)}
            onMouseLeave={cycle.release}
            onClick={() => cycle.pin(i)}
            style={PLACES[i].station}
            className="loop-station"
          >
            <StepIcon step={i} size={22} />
          </span>
        ))}
      </div>
      {STEPS.map((step, i) => (
        <StepTag
          key={step.name}
          cycle={cycle}
          step={i}
          arrow={<Arrow d={PLACES[i].arrow} />}
          className={`loop-tag ${PLACES[i].tag} loop-tight:px-2.5 loop-tight:py-1.25 loop-tight:text-11 cycle-two:hidden`}
        />
      ))}
      <ol className="cycle-two:grid cycle-two:grid-cols-2 cycle-two:gap-x-8 cycle-two:gap-y-7 cycle-one:grid-cols-1">
        {STEPS.map((step, i) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: the item's button takes the keyboard
          <li
            key={step.name}
            data-on={flag(cycle.isOn(i))}
            onMouseEnter={() => cycle.hold(i)}
            onMouseLeave={cycle.release}
            onClick={() => cycle.pin(i)}
            style={passColor(i)}
            className={`group/item step-focus loop-item ${PLACES[i].item}`}
          >
            <h3 className="font-normal text-20 text-muted leading-120 tracking-tight-20 transition-[color] duration-350 group-data-on/item:text-bright">
              <StepButton cycle={cycle} step={i} />
            </h3>
            <p className="mt-1.5 text-pretty text-15 text-subtle leading-145 transition-[color] duration-350 group-data-on/item:text-muted">
              <span className="sr-only">{halfSentence(i)}</span>
              {step.copy}
            </p>
            <StepDeliverable step={i} className="mt-2.5 hidden cycle-two:flex" />
          </li>
        ))}
      </ol>
    </div>
  );
}

// The arrow of a tag, which way its deliverable goes.
function Arrow({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" className="step-arrow">
      <path d={d} />
    </svg>
  );
}
