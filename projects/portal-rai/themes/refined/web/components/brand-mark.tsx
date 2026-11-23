type BrandMarkProps = {
  // header: 18px, bright, the stroke 1.5px. footer: 14px, subtle, the stroke 1.25px.
  variant?: "header" | "footer";
};

// The brand mark next to "Responsible AI": a ring with a dot in the middle.
export function BrandMark({ variant = "header" }: BrandMarkProps) {
  const ring =
    variant === "header"
      ? "size-4.5 border-[1.5px] border-bright"
      : "size-3.5 border-[1.25px] border-subtle";
  const dot = variant === "header" ? "size-1.5 bg-bright" : "size-1 bg-subtle";
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-circle ${ring}`}
    >
      <span className={`rounded-circle ${dot}`} />
    </span>
  );
}
