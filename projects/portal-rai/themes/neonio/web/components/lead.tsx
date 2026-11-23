import type { ReactNode } from "react";

type LeadProps = {
  children: ReactNode;
  // muted is the board's .uk-lead; secondary is its lighter override, in the cycle steps and the closing
  // call.
  tone?: "muted" | "secondary";
  // Layout of the one instance, such as its max width; never a color, which is the tone.
  className?: string;
};

const tones = { muted: "text-muted", secondary: "text-secondary" };

// The lead paragraph under a title (.uk-lead), in the hero and in every section.
export function Lead({ children, tone = "muted", className = "" }: LeadProps) {
  return (
    <p className={`text-pretty text-16 leading-1400 ${tones[tone]} ${className}`.trim()}>
      {children}
    </p>
  );
}
