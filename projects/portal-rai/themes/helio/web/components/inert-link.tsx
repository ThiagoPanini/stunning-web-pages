"use client";

import type { ComponentProps } from "react";

// A link whose destination the design left open (a Lacuna): it looks and focuses like a link, says it
// is unavailable, and goes nowhere when clicked. The Quadro writes these as href="#".
export function InertLink({ onClick, ...props }: Omit<ComponentProps<"a">, "href">) {
  return (
    // biome-ignore lint/a11y/useValidAnchor: the design draws these as links to Telas still to come; they keep the link's semantics and focus
    <a
      {...props}
      href="#"
      aria-disabled="true"
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  );
}
