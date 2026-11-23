// A media slot the design left open, a design gap: the app keeps it as the board draws it, a dark box
// with its label ("inserir gif · 6:5"), and never fills it.

type PlaceholderMarkProps = {
  // The board's label, with the format the media should have: "inserir gif · 16:10".
  label: string;
  className?: string;
};

// The label of a placeholder (.uk-ph-mark): small mono capitals, out of reach of the pointer and of
// assistive technology. The closing call places one on its own (absolutely, in its middle).
export function PlaceholderMark({ label, className = "" }: PlaceholderMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none select-none whitespace-nowrap font-medium font-mono-short text-11 text-faint uppercase leading-1000 tracking-wide-140 ${className}`.trim()}
    >
      {label}
    </span>
  );
}

type MediaPlaceholderProps = {
  label: string;
  // card: rounded and bordered (.uk-ph, Integrations). step: square, with a rule on the side of the text
  // only, which moves to its top when the cycle step stacks at 900px and below (.uk-step .uk-ph).
  variant?: "card" | "step";
  // Its size in the one instance, such as aspect-16/10.
  className?: string;
};

const variants = {
  card: "rounded-6 border border-rule-subtle",
  step: "border-rule border-l upto-900:min-h-75 upto-900:border-t upto-900:border-l-0",
};

// The placeholder box (.uk-ph), its label in the middle.
export function MediaPlaceholder({
  label,
  variant = "card",
  className = "",
}: MediaPlaceholderProps) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-placeholder ${variants[variant]} ${className}`.trim()}
    >
      <PlaceholderMark label={label} />
    </div>
  );
}
