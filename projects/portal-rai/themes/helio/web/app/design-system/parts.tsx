import type { ReactNode } from "react";
import type { Token } from "./theme-tokens";

// The pieces the route repeats, in the Home's language: numbered sections ruled above, mono labels.

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
      <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
        <div className="flex grow basis-65 flex-col gap-4">
          <div className="font-mono text-12 text-subtle uppercase tracking-wide-80">
            {number} · {label}
          </div>
          <h2 className="font-light text-28-42 leading-110 tracking-tight-25">{title}</h2>
        </div>
        <p className="max-w-160 grow-3 basis-140 text-pretty text-17 text-muted leading-160">
          {lead}
        </p>
      </div>
      {children}
    </section>
  );
}

// A group of tokens or specimens inside a section, under a small heading.
export function DesignGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-normal text-20 tracking-tight-10">{title}</h3>
      {children}
    </div>
  );
}

// A token's name and its value as @theme writes it.
export function TokenName({ token }: { token: Token }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 font-mono text-12">
      <code className="wrap-anywhere text-bright">{token.name}</code>
      <code className="wrap-anywhere text-subtle">{token.value}</code>
    </div>
  );
}
