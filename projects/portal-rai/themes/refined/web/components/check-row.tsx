// The mark before an item of a checklist: passed (a check), let through (a cross) or blocked (a shield).
type CheckMark = "check" | "cross" | "shield";

export type CheckRowProps = {
  mark: CheckMark;
  text: string;
  result: string;
  // The color of the mark and the result, when the item is not a plain pass: red for what got through
  // the attack, blue for what a guardrail blocked.
  tone?: "red" | "blue";
};

const toneColor = { red: "text-red", blue: "text-blue" };

// The drawing of each mark, on a 20-unit grid, with its stroke width.
const MARKS: Record<CheckMark, { path: string; stroke: number }> = {
  check: { path: "M4.5 10.5l3.5 3.5 7.5-8", stroke: 1.8 },
  cross: { path: "M5.5 5.5l9 9M14.5 5.5l-9 9", stroke: 1.8 },
  shield: {
    path: "M10 2.75 4.25 5v4.5c0 3.6 2.4 6.3 5.75 7.75 3.35-1.45 5.75-4.15 5.75-7.75V5z",
    stroke: 1.6,
  },
};

// An item of a checklist (rf-ck): the 16px mark, the text, and the result at the end of the row. It is a
// list item: it goes in a list.
export function CheckRow({ mark, text, result, tone }: CheckRowProps) {
  const color = tone ? toneColor[tone] : "text-muted";
  return (
    <li className="flex items-start gap-3 text-15 text-bright leading-145 tracking-tight-10">
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={MARKS[mark].stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`mt-0.75 block shrink-0 grow-0 basis-4 ${color}`}
      >
        <path d={MARKS[mark].path} />
      </svg>
      <span className="min-w-0 flex-auto">{text}</span>
      <span className={`flex-none ${color}`}>{result}</span>
    </li>
  );
}
