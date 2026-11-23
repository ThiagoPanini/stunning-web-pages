import type { ReactNode } from "react";
import { Paragraph } from "@/components/paragraph";
import { SectionHeader } from "@/components/section-header";
import type { Token } from "./theme-tokens";

// The pieces the route repeats, in the Home's language: each section opens with the Home's section head,
// its count being how many tokens it shows, and a paragraph.

type DesignSectionProps = {
  // The id of the section's title, in English, as the Home's (colors-title).
  id: string;
  title: string;
  // How many tokens the section shows; the components' section has none.
  count?: number;
  lead: string;
  children: ReactNode;
};

export function DesignSection({ id, title, count, lead, children }: DesignSectionProps) {
  return (
    <section aria-labelledby={id} className="pt-24">
      <SectionHeader id={id} title={title} count={count} />
      <Paragraph className="-mt-4 mb-12 max-w-160">{lead}</Paragraph>
      <div className="flex flex-col gap-14">{children}</div>
    </section>
  );
}

// A group of tokens or specimens inside a section, under a small heading.
export function DesignGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-medium text-20 text-bright leading-125 tracking-tight-20">{title}</h3>
      {children}
    </div>
  );
}

// A token's name and its value as @theme writes it, in the mono of the page's code.
export function TokenName({ token }: { token: Token }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 text-12">
      <code className="wrap-anywhere text-bright">{token.name}</code>
      <code className="wrap-anywhere text-muted">{token.value}</code>
    </div>
  );
}
