import type { ReactNode } from "react";

type NavPillProps = {
  // The name of the navigation for assistive technology, such as "Principal".
  label: string;
  // The links, as NavLink.
  children: ReactNode;
};

// The pill that holds the nav links: a faint fill and border, 3px around the links, as wide as they are.
export function NavPill({ label, children }: NavPillProps) {
  return (
    <nav
      aria-label={label}
      className="flex w-max items-center gap-0.5 rounded-pill border border-white-9 bg-white-4 p-0.75 text-14"
    >
      {children}
    </nav>
  );
}
