import type { ReactNode } from "react";
import { Eyebrow } from "@/components/eyebrow";
import { Lead } from "@/components/lead";
import { SectionTitle } from "@/components/section-title";
import type { Token } from "./theme-tokens";

// The pieces the route repeats, in the Home's language: sections ruled above, opened by an eyebrow, a
// light title and a lead; mono labels.

type DesignSectionProps = {
  number: string;
  label: string;
  title: string;
  lead: string;
  children: ReactNode;
};

export function DesignSection({ number, label, title, lead, children }: DesignSectionProps) {
  return (
    <section className="flex flex-col gap-12 border-rule border-t py-20">
      <div className="flex flex-wrap items-end justify-between gap-x-14 gap-y-6">
        <div className="flex min-w-0 grow basis-140 flex-col gap-7">
          <Eyebrow>
            {number} · {label}
          </Eyebrow>
          <SectionTitle size="32-44" className="max-w-215">
            {title}
          </SectionTitle>
        </div>
        <div className="basis-95 grow">
          <Lead className="max-w-130">{lead}</Lead>
        </div>
      </div>
      {children}
    </section>
  );
}

// A group of tokens or specimens inside a section, under a small heading.
export function DesignGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-medium text-15 text-white tracking-tight-20">{title}</h3>
      {children}
    </div>
  );
}

// A token's name and its value as @theme writes it.
export function TokenName({ token }: { token: Token }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 font-mono-short text-12 leading-1400">
      <code className="wrap-anywhere text-white">{token.name}</code>
      <code className="wrap-anywhere text-subtle">{token.value}</code>
    </div>
  );
}
