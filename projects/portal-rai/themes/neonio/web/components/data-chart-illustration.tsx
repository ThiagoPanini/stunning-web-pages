// The chart of the Data section (.uk-chart): illustrative, with no values. Fourteen bars of daily
// triggers grow from the bottom of a ruled frame; some carry, at their top, a 22px slice of false
// positives (lime), a slice in the rule grey, or both, and the eighth, the day in focus, a 50px slice in
// the brighter lime. The heights are the board's, in % of the frame.

type Slice = "false-positives" | "false-positives-hot" | "grey";

const slices: Record<Slice, string> = {
  "false-positives": "basis-5.5 bg-lime-pale",
  "false-positives-hot": "basis-12.5 bg-lime",
  grey: "basis-5.5 bg-rule",
};

// Each day's bar: its height and the slices at its top, from the top down. The heights are written out
// whole so Tailwind finds each class.
const bars: { day: number; height: string; slices: Slice[] }[] = [
  { day: 1, height: "h-[46%]", slices: ["false-positives"] },
  { day: 2, height: "h-[46%]", slices: ["false-positives"] },
  { day: 3, height: "h-[62%]", slices: [] },
  { day: 4, height: "h-[52%]", slices: ["grey"] },
  { day: 5, height: "h-[46%]", slices: ["false-positives"] },
  { day: 6, height: "h-[30%]", slices: [] },
  { day: 7, height: "h-[70%]", slices: ["grey", "false-positives"] },
  { day: 8, height: "h-[84%]", slices: ["false-positives-hot"] },
  { day: 9, height: "h-[70%]", slices: ["grey", "false-positives"] },
  { day: 10, height: "h-[52%]", slices: ["false-positives"] },
  { day: 11, height: "h-[30%]", slices: [] },
  { day: 12, height: "h-[36%]", slices: ["false-positives"] },
  { day: 13, height: "h-[30%]", slices: [] },
  { day: 14, height: "h-[40%]", slices: [] },
];

export function DataChartIllustration() {
  return (
    <div
      role="img"
      aria-label="Gráfico ilustrativo, sem valores: barras de acionamentos por dia, com o trecho de falsos positivos destacado."
      className="relative flex h-80 items-end gap-bars border-rule border-b bg-chart px-inset"
    >
      {bars.map((bar) => (
        <div
          key={bar.day}
          className={`relative flex flex-1 flex-col justify-start border-rule-strong border-t bg-chart-bar ${bar.height}`}
        >
          {bar.slices.map((slice) => (
            <span key={slice} className={`shrink-0 grow-0 ${slices[slice]}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
