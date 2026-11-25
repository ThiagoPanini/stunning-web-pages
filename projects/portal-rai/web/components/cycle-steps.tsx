import type { CSSProperties } from "react";

// The four steps of the cycle, in its order, each with the icon of its step and what it hands to the
// next one: the deliverable, with its mark and its color (red, blue, muted, bright), the color of the
// dot that stands for it and of what travels with it. The fourth deliverable goes from Monitorar back
// to Pesquisar. The first two steps happen before production, the last two in production.
export const STEPS = [
  {
    name: "Pesquisar",
    copy: "Estudamos como agentes conversacionais falham.",
    mark: "×",
    deliverable: "falhas conhecidas",
    color: "var(--color-red)",
  },
  {
    name: "Desenvolver",
    copy: "Transformamos cada falha em um guardrail testável e medido.",
    mark: ":",
    deliverable: "guardrails testados",
    color: "var(--color-blue)",
  },
  {
    name: "Implementar",
    copy: "Colocamos os guardrails em produção, dentro de cada conversa.",
    mark: "*",
    deliverable: "conversas em produção",
    color: "var(--color-muted)",
  },
  {
    name: "Monitorar",
    copy: "Analytics by design: métricas essenciais para decidir com dados.",
    mark: "=",
    deliverable: "métricas essenciais",
    color: "var(--color-bright)",
  },
] as const;

export const CYCLE_LABEL =
  "Ciclo de quatro etapas: pesquisar, desenvolver, implementar e monitorar, de volta a pesquisar";

// What the deliverable that leaves step i says to a screen reader: "De Pesquisar para Desenvolver:
// falhas conhecidas", and for the last one "De Monitorar de volta para Pesquisar: métricas essenciais".
export function linkLabel(i: number): string {
  const from = STEPS[i];
  const to = STEPS[(i + 1) % STEPS.length];
  const back = i === STEPS.length - 1 ? " de volta" : "";
  return `De ${from.name}${back} para ${to.name}: ${from.deliverable}`;
}

// The color of the deliverable that leaves step i, as the --pc its parts read.
export function passColor(i: number): CSSProperties {
  return { "--pc": STEPS[i].color } as CSSProperties;
}

// Class names written whole, so Tailwind finds them: each icon's gesture.
const GESTURES = ["step-icon-1", "step-icon-2", "step-icon-3", "step-icon-4"];

type StepIconProps = {
  // Which step's icon: 0 to 3.
  step: number;
  // Drawn at 22 or 32px.
  size: number;
};

// The icon of a step, a line drawing in the current color: a lens for Pesquisar, code brackets for
// Desenvolver, a speech bubble with a check for Implementar and a pulse line for Monitorar. When its step
// comes into focus it makes its gesture (globals.css, step-icon-1 to step-icon-4).
export function StepIcon({ step, size }: StepIconProps) {
  return (
    <svg
      className={`step-icon ${GESTURES[step]}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {step === 0 && (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.3 15.3 20.5 20.5" />
        </>
      )}
      {step === 1 && (
        <>
          <path d="M8.5 7 3.5 12l5 5" />
          <path d="M15.5 7l5 5-5 5" />
          <path d="M13.5 5.5 10.5 18.5" />
        </>
      )}
      {step === 2 && (
        <>
          <path d="M6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.5V16A2.5 2.5 0 0 1 4 13.5v-7A2.5 2.5 0 0 1 6.5 4z" />
          <path d="M9 10.2l2.1 2.1 3.9-4" />
        </>
      )}
      {step === 3 && <path d="M2.5 12.5h4L9 6l4.5 12.5L16 12.5h5.5" />}
    </svg>
  );
}
