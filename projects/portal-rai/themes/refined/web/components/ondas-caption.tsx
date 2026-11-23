// The caption under the Ondas logo: the character that stands for each part of the drawing, in the color
// the logo draws it with, and what it stands for.
const ENTRIES = [
  { mark: "×", color: "text-logo-red", label: "ataque" },
  { mark: ":", color: "text-logo-blue", label: "guardrails" },
  { mark: "*", color: "text-logo-agent", label: "agente" },
];

export function OndasCaption() {
  return (
    <div className="flex flex-wrap justify-center gap-x-7 gap-y-1.5 whitespace-nowrap text-13 text-muted">
      {ENTRIES.map(({ mark, color, label }) => (
        <span key={label} className="inline-flex items-center gap-2">
          <span aria-hidden="true" className={color}>
            {mark}
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}
