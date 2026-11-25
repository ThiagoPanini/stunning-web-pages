import type { CSSProperties, ReactNode } from "react";
import { type Cycle, flag } from "./use-cycle";

// The two halves of the work, by the names the loop gives them.
export const HALVES = { before: "antes da produção", production: "em produção" } as const;
export type Half = keyof typeof HALVES;

// The four steps of the cycle, in its order. Each one has its half of the work, the first two before
// production and the last two in production; its icon, the drawing and the gesture it makes when its
// step comes into focus (globals.css, step-icon-1 to step-icon-4, class names written whole so Tailwind
// finds them); and what it hands to the next one: the deliverable, with its color (red, blue, muted,
// bright), the color of the dot that stands for it and of what travels with it.
type Step = {
  name: string;
  copy: string;
  deliverable: string;
  color: string;
  half: Half;
  gesture: string;
  drawing: ReactNode;
};

export const STEPS = [
  {
    name: "Pesquisar",
    copy: "Estudamos como agentes conversacionais falham.",
    deliverable: "falhas conhecidas",
    color: "var(--color-red)",
    half: "before",
    gesture: "step-icon-1",
    // A lens.
    drawing: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.3 15.3 20.5 20.5" />
      </>
    ),
  },
  {
    name: "Desenvolver",
    copy: "Transformamos cada falha em um guardrail testável e medido.",
    deliverable: "guardrails testados",
    color: "var(--color-blue)",
    half: "before",
    gesture: "step-icon-2",
    // Code brackets.
    drawing: (
      <>
        <path d="M8.5 7 3.5 12l5 5" />
        <path d="M15.5 7l5 5-5 5" />
        <path d="M13.5 5.5 10.5 18.5" />
      </>
    ),
  },
  {
    name: "Implementar",
    copy: "Colocamos os guardrails em produção, dentro de cada conversa.",
    deliverable: "conversas em produção",
    color: "var(--color-muted)",
    half: "production",
    gesture: "step-icon-3",
    // A speech bubble with a check.
    drawing: (
      <>
        <path d="M6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.5V16A2.5 2.5 0 0 1 4 13.5v-7A2.5 2.5 0 0 1 6.5 4z" />
        <path d="M9 10.2l2.1 2.1 3.9-4" />
      </>
    ),
  },
  {
    name: "Monitorar",
    copy: "Analytics by design: métricas essenciais para decidir com dados.",
    deliverable: "métricas essenciais",
    color: "var(--color-bright)",
    half: "production",
    gesture: "step-icon-4",
    // A pulse line.
    drawing: <path d="M2.5 12.5h4L9 6l4.5 12.5L16 12.5h5.5" />,
  },
] as const satisfies readonly Step[];

// The last deliverable, the one that goes from Monitorar back to Pesquisar.
export const BACK = STEPS.length - 1;

export const CYCLE_LABEL =
  "Ciclo de quatro etapas: pesquisar, desenvolver, implementar e monitorar, de volta a pesquisar";

// The root of a version of the cycle, as attributes: a group of steps, named for screen readers (the
// board names the cycle as a group; a fieldset would make it part of a form), with its version, and
// the cycle's state for the CSS, held (data-held) or running by itself (data-run).
export function cycleGroup(cycle: Cycle, version: string) {
  return {
    role: "group",
    "aria-label": CYCLE_LABEL,
    "data-cycle": true,
    "data-version": version,
    "data-held": flag(cycle.held),
    "data-run": flag(cycle.running),
  } as const;
}

// What the deliverable that leaves step i says to a screen reader: "De Pesquisar para Desenvolver:
// falhas conhecidas", and for the last one "De Monitorar de volta para Pesquisar: métricas essenciais".
export function linkLabel(i: number): string {
  const from = STEPS[i];
  const to = STEPS[(i + 1) % STEPS.length];
  const back = i === BACK ? " de volta" : "";
  return `De ${from.name}${back} para ${to.name}: ${from.deliverable}`;
}

// The color of the deliverable that leaves step i, as the --pc its parts read.
export function passColor(i: number): CSSProperties {
  return { "--pc": STEPS[i].color } as CSSProperties;
}

// What a screen reader hears before a step's copy: which half of the work it belongs to, as a sentence
// ("Antes da produção. ").
export function halfSentence(i: number): string {
  const half = HALVES[STEPS[i].half];
  return `${half[0].toUpperCase()}${half.slice(1)}. `;
}

type StepIconProps = {
  // Which step's icon: 0 to 3.
  step: number;
  // Drawn at 22 or 32px.
  size: number;
};

// The icon of a step, a line drawing in the current color: a lens for Pesquisar, code brackets for
// Desenvolver, a speech bubble with a check for Implementar and a pulse line for Monitorar. When its step
// comes into focus it makes its gesture.
export function StepIcon({ step, size }: StepIconProps) {
  return (
    <svg
      className={`step-icon ${STEPS[step].gesture}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {STEPS[step].drawing}
    </svg>
  );
}

type StepPartProps = {
  cycle: Cycle;
  // Which step: 0 to 3.
  step: number;
};

// The name of a step, as the button that is its control for the keyboard and screen readers: focused,
// it holds the step, and pressed, the step is pinned. Its focus ring is drawn around the whole step, by
// the step's step-focus.
export function StepButton({ cycle, step }: StepPartProps) {
  return (
    <button
      type="button"
      aria-pressed={cycle.isPinned(step)}
      onFocus={() => cycle.hold(step)}
      onBlur={cycle.release}
      className="step-button"
    >
      {STEPS[step].name}
    </button>
  );
}

// A small dot in the color of a deliverable.
function Dot() {
  return (
    <span aria-hidden="true" className="inline-block size-1.5 flex-none rounded-circle bg-(--pc)" />
  );
}

type StepTagProps = StepPartProps & {
  // Where the tag sits, and what changes in it at each width.
  className: string;
  // The arrow that says which way the deliverable goes, if the version draws one: after the name, and
  // before it for the deliverable that goes back.
  arrow?: ReactNode;
};

// The tag of the deliverable that leaves a step: a dot in its color and its name, lit while it travels
// or when its step is held, and ringing as it leaves. A screen reader reads where it goes.
export function StepTag({ cycle, step, className, arrow }: StepTagProps) {
  return (
    <div
      role="img"
      aria-label={linkLabel(step)}
      data-lit={flag(cycle.isLit(step))}
      data-fire={flag(cycle.isFiring(step))}
      style={passColor(step)}
      className={`step-tag ${className}`}
    >
      {step === BACK && arrow}
      <Dot />
      <span aria-hidden="true">{STEPS[step].deliverable}</span>
      {step !== BACK && arrow}
    </div>
  );
}

type StepDeliverableProps = {
  // Which step: 0 to 3.
  step: number;
  // Its display, and its room above: the versions show it only at 1099px and below, where the tags are
  // gone.
  className: string;
};

// What a step delivers, in words: "entrega", the dot and the deliverable's name.
export function StepDeliverable({ step, className }: StepDeliverableProps) {
  return (
    <p
      style={passColor(step)}
      className={`items-center gap-2 font-mono font-normal text-12 text-subtle leading-130 ${className}`}
    >
      <span>entrega</span>
      <Dot />
      <span>{STEPS[step].deliverable}</span>
    </p>
  );
}
