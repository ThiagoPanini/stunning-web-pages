import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type ButtonLinkProps = {
  children: ReactNode;
  // white: filled white, a lighter grey on hover. outline: a white border, a faint white fill on hover.
  variant: "white" | "outline";
};

const variants = {
  white: "bg-white text-page hover:bg-white-hover",
  outline: "border border-white text-white hover:bg-white-10",
};

// The square button of the Home (.uk-btn), in the hero, the Data section and the closing call. The design
// left every button of the Home open, so it is an inert link.
export function ButtonLink({ children, variant }: ButtonLinkProps) {
  const className = [
    "inline-flex min-h-11 items-center justify-center gap-2.5 whitespace-nowrap px-5",
    "font-medium text-16 tracking-tight-10 transition-[background-color,color]",
    variants[variant],
  ].join(" ");
  return <InertLink className={className}>{children}</InertLink>;
}
