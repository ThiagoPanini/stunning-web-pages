import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type TextLinkProps = {
  children: ReactNode;
  // Without a destination the link is a Lacuna and stays inert.
  href?: string;
};

// The quiet text link next to a button ("Ver os dados →"): muted, bright on hover.
export function TextLink({ children, href }: TextLinkProps) {
  const className =
    "inline-flex min-h-11 items-center text-14 text-muted transition-[color] hover:text-bright";
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return <InertLink className={className}>{children}</InertLink>;
}
