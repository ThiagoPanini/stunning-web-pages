import type { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  id?: string;
  // The fluid size of the one instance: 32-48 is the board's .uk-h2 (Cycle); Solutions and Data
  // override it with 32-44, Integrations with 32-52.
  size?: "32-44" | "32-48" | "32-52";
  // Layout of the one instance, such as its max width.
  className?: string;
};

const sizes = { "32-44": "text-32-44", "32-48": "text-32-48", "32-52": "text-32-52" };

// The light title of a section (.uk-h2), balanced over its lines.
export function SectionTitle({ children, id, size = "32-48", className = "" }: SectionTitleProps) {
  return (
    <h2
      id={id}
      className={`text-balance font-display font-light text-white leading-1120 tracking-tight-20 ${sizes[size]} ${className}`.trim()}
    >
      {children}
    </h2>
  );
}
