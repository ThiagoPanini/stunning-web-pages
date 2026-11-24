"use client";

import { CycleLoop } from "./cycle-loop";
import { CYCLE_LABEL, linkLabel, passColor, STEPS, StepIcon } from "./cycle-steps";
import { type Cycle, flag, trackPointer } from "./use-cycle";

// Class names written whole, so Tailwind finds them: the place of each link's tag and rail.
const TAG_PLACES = ["cards-tag-1", "cards-tag-2", "cards-tag-3", "cards-tag-4"];
const RAIL_PLACES = ["cards-rail-1", "cards-rail-2", "cards-rail-3", "cards-rail-4 rail-turn"];

// Version 03 of the cycle, the cards: the team cards' Version 02 without their gradient, side by side;
// a frame of dots runs through the four seams, tagged with what passes, and closes the loop below. The
// card under the pointer lights around it; the card in focus lights its edge, and while a step is held
// its copy grows. At 1099px and below the cards go two by two, without the frame, and each one says what
// it delivers; at 600px and below they stack, and the large copy is gone, as a phone has no hover.
export function CycleCards({ cycle }: { cycle: Cycle }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: the board names the cycle as a group of steps; a fieldset would make it part of a form
    <div
      role="group"
      aria-label={CYCLE_LABEL}
      data-cycle
      data-version="03-cartoes"
      data-held={flag(cycle.held)}
      className="reveal-2 relative py-6.5 cards-two:p-0"
    >
      <CycleLoop className="cards-loop cards-two:hidden" radius={20} />
      <div className="relative z-1 grid grid-cols-4 gap-0.5 cards-two:grid-cols-2 cards-one:grid-cols-1">
        {STEPS.map((step, i) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: the card's button takes the keyboard
          <article
            key={step.name}
            data-on={flag(cycle.isOn(i))}
            onMouseEnter={(event) => {
              trackPointer(event, true);
              cycle.hold(i);
            }}
            onMouseMove={(event) => trackPointer(event, false)}
            onMouseLeave={(event) => {
              trackPointer(event, true);
              cycle.release();
            }}
            onClick={() => cycle.pin(i)}
            className="group/card cycle-card relative min-w-0 cursor-pointer"
          >
            <div className="step-focus relative isolate box-border flex h-full min-h-59 flex-col justify-between gap-10 overflow-hidden rounded-8 bg-surface p-7 cards-two:min-h-0 cards-two:gap-7">
              <span aria-hidden="true" className="cycle-card-spot" />
              <span aria-hidden="true" className="cycle-card-edge" />
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="block flex-none basis-8 text-muted transition-[color] duration-500 ease-settle group-data-on/card:text-bright"
                >
                  <StepIcon step={i} size={32} />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="font-medium text-16 text-bright leading-px-24">
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
                  <p className="font-mono font-normal text-12 text-subtle leading-px-19 tracking-wide-40">
                    {`Etapa 0${i + 1}`}
                  </p>
                </div>
              </div>
              <div className="relative">
                <p className="cycle-card-small text-15 text-quiet leading-px-22">{step.copy}</p>
                <p
                  aria-hidden="true"
                  className="cycle-card-large max-w-large-13 font-normal text-19-23 text-bright leading-120 tracking-tight-30"
                >
                  {step.copy}
                </p>
              </div>
              <p
                style={passColor(i)}
                className="hidden items-baseline gap-2 font-mono font-normal text-12 text-subtle leading-130 cards-two:flex"
              >
                <span>entrega</span>
                <span aria-hidden="true" className="text-(color:--pc)">
                  {step.mark}
                </span>
                <span>{step.deliverable}</span>
              </p>
            </div>
          </article>
        ))}
      </div>
      {STEPS.map((step, i) => (
        <div
          key={step.name}
          role="img"
          aria-label={linkLabel(i)}
          data-lit={flag(cycle.isLit(i))}
          style={passColor(i)}
          className={`step-tag cards-tag ${TAG_PLACES[i]} cards-two:hidden`}
        >
          <span aria-hidden="true" className="text-(color:--pc)">
            {step.mark}
          </span>
          <span aria-hidden="true">{step.deliverable}</span>
        </div>
      ))}
      {STEPS.map((step, i) => (
        <span
          key={step.name}
          aria-hidden="true"
          data-fire={flag(cycle.isFiring(i))}
          style={passColor(i)}
          className={`rail cards-rail ${RAIL_PLACES[i]} cards-two:hidden`}
        >
          <span className="pulse" />
        </span>
      ))}
    </div>
  );
}
