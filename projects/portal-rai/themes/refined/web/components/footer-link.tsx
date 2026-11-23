import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type FooterLinkProps = {
  children: ReactNode;
  // Without a destination, which the design left open, the link stays inert.
  href?: string;
  // The link to the page being shown: bright, marked as the current page.
  current?: boolean;
};

const shape = "inline-flex min-h-11 items-center transition-[color]";

// A link of the footer (rf-fl): muted, bright on hover, 44px tall. It takes the size of where it sits:
// 15px in the columns, 14px in the closing bar.
export function FooterLink({ children, href, current = false }: FooterLinkProps) {
  const className = current ? `${shape} text-bright` : `${shape} text-muted hover:text-bright`;
  if (href) {
    return (
      <a href={href} aria-current={current ? "page" : undefined} className={className}>
        {children}
      </a>
    );
  }
  return <InertLink className={className}>{children}</InertLink>;
}
