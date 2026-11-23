import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

type HeaderBlockLinkProps = {
  children: ReactNode;
  // Without a destination, which the design left open, the block stays inert.
  href?: string;
};

const className =
  "pointer-events-auto inline-flex min-h-11 items-center justify-center whitespace-nowrap bg-white px-5 font-medium text-14 text-page transition-[background-color] hover:bg-white-hover";

// One of the white blocks at the end of the header (.uk-wblock): "Contato" and "Testar um guardrail".
export function HeaderBlockLink({ children, href }: HeaderBlockLinkProps) {
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return <InertLink className={className}>{children}</InertLink>;
}
