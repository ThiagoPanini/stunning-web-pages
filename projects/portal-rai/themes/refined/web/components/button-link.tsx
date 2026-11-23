import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

// primary: the cream button, with a glow that grows as it lifts 1px on hover (rf-btn-a).
// secondary: the dark button, lighter on hover (rf-btn-b).
// header: the header's cream button, smaller, with no glow until hovered (rf-hbtn).
export type ButtonVariant = "primary" | "secondary" | "header";

const base =
  "inline-flex items-center justify-center gap-2 min-h-12 px-5.5 rounded-12 border-0 font-medium text-16 tracking-tight-10 whitespace-nowrap cursor-pointer transition-[translate,box-shadow,background-color]";

const variants: Record<ButtonVariant, string> = {
  primary: `${base} bg-cream text-night shadow-glow-16 hover:-translate-y-px hover:shadow-glow-28`,
  secondary: `${base} bg-raised text-bright hover:bg-raised-hover`,
  header:
    "inline-flex h-11 items-center rounded-10 bg-cream px-4.5 font-medium text-14 text-night whitespace-nowrap transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-glow-22",
};

// The classes of a button of the given variant, for an element that is not a link, such as the
// contact form's <button>; `extra` adds the classes of its place, such as w-full.
export function buttonClassName(variant: ButtonVariant, extra = ""): string {
  return extra ? `${variants[variant]} ${extra}` : variants[variant];
}

type ButtonLinkProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  // Classes of its place, such as w-full.
  className?: string;
};

// A link drawn as a button ("Testar um guardrail", "Ver os dados"). The design left every button of the
// Home open, so it is an inert link.
export function ButtonLink({ children, variant = "primary", className }: ButtonLinkProps) {
  return <InertLink className={buttonClassName(variant, className)}>{children}</InertLink>;
}
