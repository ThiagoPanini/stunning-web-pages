import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type NavLinkProps = {
  children: ReactNode;
};

// A link of the header's nav (.uk-navlink), on the white block: dark text, a light grey fill on hover,
// and a dark focus ring inside it. Its screens do not exist yet, so it stays inert.
export function NavLink({ children }: NavLinkProps) {
  return (
    <InertLink className="inline-flex min-h-11 items-center px-3.5 text-page transition-[background-color] hover:bg-nav-hover focus-visible:outline-page focus-visible:outline-offset-inset">
      {children}
    </InertLink>
  );
}
