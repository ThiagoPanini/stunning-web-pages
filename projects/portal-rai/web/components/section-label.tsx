import type { ReactNode } from "react";

type SectionLabelProps = {
  // The label as the design writes it: "01 · Missão", with the two-digit number and a middle dot.
  children: ReactNode;
  // Classes from the page, such as the motion the label enters with.
  className?: string;
};

// The mono label in capitals, subtle and spaced out, that opens the hero and each numbered section.
export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <div className={`font-mono text-12 text-subtle uppercase tracking-wide-80 ${className}`}>
      {children}
    </div>
  );
}
