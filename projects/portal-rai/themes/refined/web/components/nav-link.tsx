import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type NavLinkProps = {
  children: ReactNode;
  // Without a destination, which the design left open, the link stays inert.
  href?: string;
  // The link to the page being shown: bright on a light fill, marked as the current page, and still on
  // hover.
  current?: boolean;
};

const shape =
  "flex h-9 items-center whitespace-nowrap rounded-pill px-3.5 transition-[color,background-color] pointer-coarse:h-11";

// A link of the nav pill: subtle, bright on a faint fill on hover. On a coarse pointer it grows to 44px.
export function NavLink({ children, href, current = false }: NavLinkProps) {
  const className = current
    ? `${shape} bg-white-10 text-bright`
    : `${shape} text-subtle hover:bg-white-6 hover:text-bright`;
  if (href) {
    return (
      <a href={href} aria-current={current ? "page" : undefined} className={className}>
        {children}
      </a>
    );
  }
  return <InertLink className={className}>{children}</InertLink>;
}
