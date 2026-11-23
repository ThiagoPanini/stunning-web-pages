// The legend under the Ondas logo in the hero (.uk-legend): the character of each layer of the drawing,
// in its color, and what it stands for. Centered, in one row while it fits.
const entries = [
  { mark: "×", color: "text-logo-red", label: "ataque" },
  { mark: ":", color: "text-logo-blue", label: "guardrails" },
  { mark: "*", color: "text-logo-agent", label: "agente" },
];

export function OndasCaption() {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 whitespace-nowrap font-mono-short font-normal text-12 text-muted leading-1000">
      {entries.map(({ mark, color, label }) => (
        <span key={label} className="inline-flex items-center gap-2">
          {/* The board's rule reaches every span of the legend, the mark's too. */}
          <span aria-hidden="true" className={`inline-flex items-center gap-2 ${color}`}>
            {mark}
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}
