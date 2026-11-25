import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type TextLinkProps = {
  children: ReactNode;
  // Without a destination, which the design left open, the link stays inert.
  href?: string;
};

// The quiet text link next to a button ("Produtos e soluções"): muted, bright on hover.
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
