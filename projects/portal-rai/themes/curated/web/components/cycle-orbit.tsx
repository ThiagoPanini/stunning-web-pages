import { CYCLE_LABEL, passColor, STEPS, StepIcon } from "./cycle-steps";
import { type Cycle, flag } from "./use-cycle";

// Where the four stations sit on the ring, clockwise from the top, as a share of the figure.
const STATIONS = [
  { left: "50%", top: "12.22%" },
  { left: "87.78%", top: "50%" },
  { left: "50%", top: "87.78%" },
  { left: "12.22%", top: "50%" },
];

// The quarters of the ring, each from one station to the next.
const ARCS = [
  "M180 44A136 136 0 0 1 316 180",
  "M316 180A136 136 0 0 1 180 316",
  "M180 316A136 136 0 0 1 44 180",
  "M44 180A136 136 0 0 1 180 44",
];

// Version 01 of the cycle, the orbit: a ring of dots that runs the way of the cycle, with a station per
// step and, in the middle, what the step in focus delivers; next to it, the steps as a list, with the one
// in focus open. At 920px and below the ring stands above the list, centered. The stations and the rows
// both hold their step under the pointer and pin it with a click; the step's button holds it on focus.
export function CycleOrbit({ cycle }: { cycle: Cycle }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: the board names the cycle as a group of steps; a fieldset would make it part of a form
    <div
      role="group"
      aria-label={CYCLE_LABEL}
      data-cycle
      data-held={flag(cycle.held)}
      className="reveal-2 flex flex-wrap items-center justify-between gap-x-orbit-gap gap-y-10"
    >
      <div
        aria-hidden="true"
        className="relative aspect-square w-orbit flex-none orbit-stacked:mx-auto"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 360 360"
          className="absolute inset-0 block size-full overflow-visible"
        >
          <circle cx="180" cy="180" r="136" className="fill-none stroke-1 stroke-rule-strong" />
          {ARCS.map((d, i) => (
            <g
              key={d}
              data-lit={flag(cycle.isLit(i))}
              data-fire={flag(cycle.isFiring(i))}
              style={passColor(i)}
            >
              <path d={d} className="orbit-flow" />
              <path d={d} className="orbit-comet" />
            </g>
          ))}
        </svg>
        {STEPS.map((step, i) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: the station mirrors the row's button, which is the step's control for the keyboard and screen readers
          // biome-ignore lint/a11y/useKeyWithClickEvents: the row's button takes the keyboard
          <span
            key={step.name}
            data-on={flag(cycle.isOn(i))}
            onMouseEnter={() => cycle.hold(i)}
            onMouseLeave={cycle.release}
            onClick={() => cycle.pin(i)}
            style={STATIONS[i]}
            data-station
            className="orbit-station absolute z-1 -mt-7 -ml-7 grid size-14 cursor-pointer place-items-center rounded-circle border border-rule-strong bg-surface text-subtle data-on:border-subtle data-on:bg-station-on data-on:text-bright"
          >
            <StepIcon step={i} size={22} />
          </span>
        ))}
        <div className="pointer-events-none absolute top-1/2 left-1/2 grid -translate-1/2 justify-items-center">
          {STEPS.map((step, i) => (
            <div
              key={step.name}
              data-on={flag(cycle.isOn(i))}
              style={passColor(i)}
              className="orbit-deliverable col-start-1 row-start-1 flex flex-col items-center gap-2"
            >
              <span className="font-mono font-normal text-11 text-subtle uppercase leading-100 tracking-wide-80">
                entrega
              </span>
              <span
                className={`font-mono font-normal text-(color:--pc) text-48 leading-100 ${
                  i === 2 ? "relative top-2.25" : ""
                }`}
              >
                {step.mark}
              </span>
              <span className="whitespace-nowrap font-mono font-normal text-12 text-muted leading-130">
                {step.deliverable}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ol className="@container flex min-w-0 max-w-190 shrink grow basis-105 flex-col border-rule border-b orbit-stacked:max-w-none">
        {STEPS.map((step, i) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: the row's button takes the keyboard
          <li
            key={step.name}
            data-on={flag(cycle.isOn(i))}
            onMouseEnter={() => cycle.hold(i)}
            onMouseLeave={cycle.release}
            onClick={() => cycle.pin(i)}
            className="group/row step-focus relative grid cursor-pointer grid-cols-orbit-row items-baseline gap-x-0 border-rule border-t py-4.25"
          >
            <span
              aria-hidden="true"
              className="orbit-bar absolute inset-x-0 -top-px h-px bg-bright"
            />
            <span
              aria-hidden="true"
              className="font-mono font-normal text-12 text-subtle leading-100 tracking-wide-80 transition-[color] duration-350 group-data-on/row:text-bright"
            >
              {`0${i + 1}`}
            </span>
            <div>
              <h3 className="font-light text-22 text-subtle leading-120 tracking-tight-20 transition-[color] duration-350 group-data-on/row:text-bright">
                <button
                  type="button"
                  aria-pressed={cycle.isPinned(i)}
                  onFocus={() => cycle.hold(i)}
                  onBlur={cycle.release}
                  className="step-button"
                >
                  {step.name}
                </button>
              </h3>
              <div className="orbit-more">
                <div className="min-h-0 overflow-hidden">
                  <p className="orbit-desc box-content max-w-130 text-pretty pt-2 text-15 text-muted leading-160 @max-orbit-list:min-h-desc-lines">
                    {step.copy}
                  </p>
                </div>
              </div>
            </div>
            <span
              style={passColor(i)}
              className="inline-flex items-baseline gap-2 whitespace-nowrap pl-6 font-mono font-normal text-12 text-subtle leading-120 transition-[color] duration-350 group-data-on/row:text-bright @max-orbit-list:hidden"
            >
              <span className="sr-only">entrega</span>
              <span aria-hidden="true" className="text-(color:--pc)">
                {step.mark}
              </span>
              <span>{step.deliverable}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
