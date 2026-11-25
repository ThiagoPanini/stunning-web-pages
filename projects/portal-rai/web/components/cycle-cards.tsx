"use client";

import { CycleRail } from "./cycle-rail";
import { CYCLE_LABEL, linkLabel, passColor, STEPS, StepIcon } from "./cycle-steps";
import { type Cycle, flag, trackPointer } from "./use-cycle";

// Class names written whole, so Tailwind finds them: the place of each deliverable's tag, and of the two
// arrows on the rail below the cards.
const TAG_PLACES = ["cards-tag-1", "cards-tag-2", "cards-tag-3", "cards-tag-4"];
const ARROW_PLACES = ["cards-arrow-1", "cards-arrow-2"];

// The last deliverable, the one that goes from Monitorar back to Pesquisar along the rail.
const BACK = STEPS.length - 1;

// A small dot in the color of a deliverable, as in the loop.
function Dot() {
  return (
    <span aria-hidden="true" className="inline-block size-1.5 flex-none rounded-circle bg-(--pc)" />
  );
}

// Version 03 of the cycle, the cards: four cards in a row, and a dotted rail below them that closes the
// cycle, with two arrows that say which way it goes. Each deliverable is a tag, with a dot in its color,
// over the seam between the two cards it joins; the last one sits on the rail below. The card in focus
// turns lighter, lights its edge and shows its copy large. While the cycle runs by itself, a light runs
// along the top edge of the card of the turn, fades into the deliverable's tag and comes back on the
// next card; after the last card a pulse runs the rail back to the first one. The card under the pointer
// lights around it. At 1099px and below the cards go two by two, without the rail, and each one says
// what it delivers; at 600px and below they stack, and the large copy is gone, as a phone has no hover.
export function CycleCards({ cycle }: { cycle: Cycle }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: the board names the cycle as a group of steps; a fieldset would make it part of a form
    <div
      role="group"
      aria-label={CYCLE_LABEL}
      data-cycle
      data-version="03-cartoes"
      data-held={flag(cycle.held)}
      data-run={flag(cycle.running)}
      className="reveal-2 relative pt-4 pb-16 cycle-two:p-0"
    >
      <CycleRail className="cards-rail-frame cycle-two:hidden" radius={20} />
      <div className="relative z-1 grid grid-cols-4 gap-0.5 cycle-two:grid-cols-2 cycle-one:grid-cols-1">
        {STEPS.map((step, i) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: the card's button takes the keyboard
          <article
            key={step.name}
            data-on={flag(cycle.isOn(i))}
            style={passColor(i)}
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
            <div className="step-focus relative isolate box-border flex h-full min-h-80 flex-col justify-between gap-10 overflow-hidden rounded-8 bg-surface p-7 transition-[background-color] duration-600 group-data-on/card:bg-card-on cycle-two:min-h-0 cycle-two:gap-7">
              <span aria-hidden="true" className="cycle-card-spot" />
              <span aria-hidden="true" className="cycle-card-glow" />
              <span aria-hidden="true" className="cycle-card-edge" />
              <span aria-hidden="true" className="cycle-card-run" />
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
              <p className="hidden items-center gap-2 font-mono font-normal text-12 text-subtle leading-130 cycle-two:flex">
                <span>entrega</span>
                <Dot />
                <span>{step.deliverable}</span>
              </p>
            </div>
            <span aria-hidden="true" className="cycle-card-head" />
          </article>
        ))}
      </div>
      {STEPS.map((step, i) => (
        <div
          key={step.name}
          role="img"
          aria-label={linkLabel(i)}
          data-lit={flag(cycle.isLit(i))}
          data-fire={flag(cycle.isFiring(i))}
          style={passColor(i)}
          className={`step-tag cards-tag ${TAG_PLACES[i]} cycle-two:hidden`}
        >
          <Dot />
          <span aria-hidden="true">{step.deliverable}</span>
        </div>
      ))}
      {ARROW_PLACES.map((place) => (
        <svg
          key={place}
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={`step-arrow cards-arrow ${place} cycle-two:hidden`}
        >
          <path d="M6.5 1.5 3 5l3.5 3.5" />
        </svg>
      ))}
      <span
        aria-hidden="true"
        data-fire={flag(cycle.isFiring(BACK))}
        style={passColor(BACK)}
        className="runner runner-turn cards-runner cycle-two:hidden"
      >
        <span className="pulse" />
      </span>
    </div>
  );
}
