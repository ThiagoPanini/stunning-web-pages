import type { ReactNode } from "react";

type CaptionProps = {
  // The bold lead-in, in white: "Adapta a cada turno."
  lead: string;
  children: ReactNode;
  // card: pushed to the bottom of a solution card, 28px under the illustration. bento: no margin, at
  // least 66px tall (Integrations). feature: no margin, in the muted grey (Data).
  variant: "card" | "bento" | "feature";
};

const variants = {
  card: "mt-auto pt-7 text-secondary",
  bento: "min-h-16.5 text-secondary",
  feature: "text-muted",
};

// A caption with a bold lead-in (.uk-cap): solution cards, Integrations cards and Data features.
export function Caption({ lead, children, variant }: CaptionProps) {
  return (
    <p className={`text-pretty text-16 leading-5.5 ${variants[variant]}`}>
      <strong className="font-medium text-white">{lead}</strong> {children}
    </p>
  );
}
