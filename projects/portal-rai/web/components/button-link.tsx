import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type ButtonLinkProps = {
  children: ReactNode;
  // Without a destination the button stays inert.
  href?: string;
  // The header's button is narrower and never wraps.
  variant?: "page" | "header";
};

// The light button of the Home ("Conhecer os times", "Simular um ataque"): lifts 1px and glows on hover.
export function ButtonLink({ children, href, variant = "page" }: ButtonLinkProps) {
  const className = [
    "inline-flex h-11 items-center rounded-10 bg-bright font-medium text-14 text-night",
    "transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-glow",
    variant === "header" ? "whitespace-nowrap px-4.5" : "px-5",
  ].join(" ");
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return <InertLink className={className}>{children}</InertLink>;
}
