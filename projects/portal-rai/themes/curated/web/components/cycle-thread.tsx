import { Fragment } from "react";
import { CycleLoop } from "./cycle-loop";
import { CYCLE_LABEL, linkLabel, passColor, STEPS, StepIcon } from "./cycle-steps";
import { type Cycle, flag } from "./use-cycle";

// Version 02 of the cycle, the thread: four beads on one thread. The step in focus opens with its copy;
// between two steps, a chip with the mark of what passes, which grows and names it when its link is lit;
// the thread comes back from Monitorar to Pesquisar along a loop underneath, tagged with the metrics.
// Between 761 and 1279px the closed steps show only their icon; at 760px and below the thread stands
// up, without the loop, and a dotted line joins the steps.
export function CycleThread({ cycle }: { cycle: Cycle }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: the board names the cycle as a group of steps; a fieldset would make it part of a form
    <div
      role="group"
      aria-label={CYCLE_LABEL}
      data-cycle
      data-held={flag(cycle.held)}
      className="reveal-2 relative pb-13 narrow:pb-0"
    >
      <CycleLoop className="thread-loop narrow:hidden" radius={16} />
      <div className="relative z-1 flex items-stretch narrow:flex-col">
        {STEPS.map((step, i) => (
          <Fragment key={step.name}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: the pill's button takes the keyboard */}
            <article
              data-on={flag(cycle.isOn(i))}
              onMouseEnter={() => cycle.hold(i)}
              onMouseLeave={cycle.release}
              onClick={() => cycle.pin(i)}
              className="group/pill step-focus thread-pill relative box-border flex h-16 min-w-0 flex-[1_1_0] cursor-pointer items-center gap-3 overflow-hidden whitespace-nowrap rounded-pill border border-rule-strong bg-surface pr-5.5 pl-2.75 data-on:grow-(--grow-240) data-on:border-rule-lit data-on:bg-pill-on thread-icons:flex-none thread-icons:basis-16 thread-icons:px-2.75 thread-icons:data-on:flex-[1_1_0] thread-icons:data-on:pr-5.5 narrow:h-auto narrow:min-h-16 narrow:flex-none narrow:basis-auto narrow:whitespace-normal narrow:rounded-32 narrow:py-2.75 narrow:pr-5.5 narrow:pl-2.75 narrow:data-on:flex-none narrow:data-on:basis-auto"
            >
              <span
                aria-hidden="true"
                className="grid size-10 flex-none place-items-center rounded-circle bg-rule text-muted transition-[color,background-color] duration-350 group-data-on/pill:bg-rule-strong group-data-on/pill:text-bright"
              >
                <StepIcon step={i} size={20} />
              </span>
              <div className="flex min-w-0 flex-[1_1_0] items-center gap-3.5 overflow-hidden narrow:flex-col narrow:items-start narrow:gap-0.5">
                <h3 className="flex-none font-normal text-17 text-muted leading-120 tracking-tight-10 transition-[color] duration-350 group-data-on/pill:text-bright">
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
                <p className="thread-desc min-w-0 flex-[1_1_0] whitespace-normal text-balance text-14 text-muted leading-135 narrow:flex-none">
                  {step.copy}
                </p>
              </div>
            </article>
            {i < STEPS.length - 1 && (
              <div
                role="img"
                aria-label={linkLabel(i)}
                data-lit={flag(cycle.isLit(i))}
                data-fire={flag(cycle.isFiring(i))}
                style={passColor(i)}
                className="thread-link relative flex-none basis-16 thread-icons:basis-11 narrow:w-16 narrow:basis-10 narrow:self-start"
              >
                <span aria-hidden="true" className="pulse thread-pulse" />
                <span
                  aria-hidden="true"
                  className="thread-chip absolute top-1/2 left-1/2 z-1 -mt-3 -ml-3 box-border grid size-6 place-items-center rounded-circle border bg-grid font-medium font-mono text-(color:--pc) text-12 leading-100"
                >
                  {step.mark}
                </span>
                <span
                  aria-hidden="true"
                  className="thread-caption whitespace-nowrap font-mono font-normal text-12 leading-100"
                >
                  {step.deliverable}
                </span>
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div
        role="img"
        aria-label={linkLabel(3)}
        data-lit={flag(cycle.isLit(3))}
        style={passColor(3)}
        className="step-tag thread-back"
      >
        <span aria-hidden="true" className="text-(color:--pc)">
          {STEPS[3].mark}
        </span>
        <span aria-hidden="true">{STEPS[3].deliverable}</span>
      </div>
      <span
        aria-hidden="true"
        data-fire={flag(cycle.isFiring(3))}
        style={passColor(3)}
        className="rail rail-turn thread-rail narrow:hidden"
      >
        <span className="pulse" />
      </span>
    </div>
  );
}
