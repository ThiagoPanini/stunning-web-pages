import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type FooterLinkProps = {
  children: ReactNode;
  // Without a destination the link is a Lacuna and stays inert.
  href?: string;
  // The link to the page being shown: bright, and marked as the current page.
  current?: boolean;
};

// A link of the footer: subtle, bright on hover, with a 44px tall target.
export function FooterLink({ children, href, current = false }: FooterLinkProps) {
  const className = [
    "inline-flex min-h-11 items-center transition-[color] hover:text-bright",
    current ? "text-bright" : "text-subtle",
  ].join(" ");
  if (href) {
    return (
      <a href={href} aria-current={current ? "page" : undefined} className={className}>
        {children}
      </a>
    );
  }
  return <InertLink className={className}>{children}</InertLink>;
}
