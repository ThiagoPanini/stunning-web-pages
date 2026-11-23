import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type FooterLinkProps = {
  children: ReactNode;
  // An anchor of the Home; without one the link leads to a screen the design does not have yet, and
  // stays inert.
  href?: `#${string}`;
};

const className =
  "inline-flex min-h-11 items-center text-muted transition-[color] hover:text-white";

// A link of the footer (.uk-foot a, .uk-flink): grey, white on hover, 44px tall. It takes the size of
// the column it sits in.
export function FooterLink({ children, href }: FooterLinkProps) {
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return <InertLink className={className}>{children}</InertLink>;
}
