import { IllustrationFrame } from "./illustration-frame";

// The week's days with the height of each bar, Thursday the day under way.
const DAYS = [
  { name: "seg", bar: "h-[46%]" },
  { name: "ter", bar: "h-[58%]" },
  { name: "qua", bar: "h-[40%]" },
  { name: "qui", bar: "h-[92%]", current: true },
  { name: "sex", bar: "h-[62%]" },
  { name: "sáb", bar: "h-[50%]" },
  { name: "dom", bar: "h-[34%]" },
];

// Semana Vermelha: a week of attack simulation, Monday to Sunday, as ruled bars under a line, the day
// under way in red.
export function RedWeekIllustration() {
  return (
    <IllustrationFrame
      label="Ilustração: uma semana de simulação de ataques, de segunda a domingo, com o dia em andamento destacado."
      className="flex flex-col"
    >
      <div className="flex items-baseline gap-2">
        <span className="font-display font-light text-30 text-muted leading-1000">7</span>
        <span className="text-11 text-subtle">dias</span>
      </div>
      <div className="relative mt-2.5 flex flex-auto items-end gap-2.25">
        {DAYS.map(({ name, bar, current }) => (
          <span
            key={name}
            className={`relative flex-1 border-t ${bar} ${current ? "border-red-pale bg-week-bar-current" : "border-rule-strong bg-week-bar"}`}
          />
        ))}
        <svg
          aria-hidden="true"
          viewBox="0 0 700 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <polyline
            points="50,62 150,50 250,70 350,34 450,48 550,56 650,72"
            fill="none"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            className="stroke-muted"
          />
        </svg>
      </div>
      <div className="mt-2 flex gap-2.25 text-10 text-center">
        {DAYS.map(({ name, current }) => (
          <span key={name} className={`flex-1 ${current ? "text-secondary" : ""}`.trim()}>
            {name}
          </span>
        ))}
      </div>
    </IllustrationFrame>
  );
}
