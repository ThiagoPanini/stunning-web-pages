// The caption under the Ondas logo: the character that stands for each part of the drawing and what it
// stands for, in the color of its word, in one line that does not wrap.
const entries = [
  { mark: "×", color: "text-red", label: "ataque" },
  { mark: ":", color: "text-blue", label: "guardrails" },
  { mark: "*", color: "text-muted", label: "agente" },
];

export function OndasCaption() {
  return (
    <div className="flex flex-nowrap justify-center gap-6 whitespace-nowrap font-mono text-12">
      {entries.map(({ mark, color, label }) => (
        <div key={label} className={`flex gap-2 ${color}`}>
          <span aria-hidden="true">{mark}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
