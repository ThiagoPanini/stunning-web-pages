import { PortalCardLink, type PortalCardLinkProps } from "./portal-card-link";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

const CARDS: PortalCardLinkProps[] = [
  {
    name: "Playground",
    description: "Cole uma mensagem, escolha os guardrails e veja o veredito de cada um.",
    action: "Testar",
    mark: "inserir gif · 21:9",
    aspect: "aspect-21-9",
    wide: true,
  },
  {
    name: "Dados",
    description: "Acionamentos, falsos positivos e latência de cada guardrail.",
    action: "Ver",
    mark: "inserir gif · 4:3",
    aspect: "aspect-4-3",
  },
  {
    name: "Integrações",
    description: "Envie a mensagem e receba o veredito de cada guardrail, com score e latência.",
    action: "Integrar",
    mark: "inserir gif · 4:3",
    aspect: "aspect-4-3",
  },
];

// No portal (3): link cards to Playground, Dados and Integrações, the first across the row.
export function Portal() {
  return (
    <Section block="portal" id="portal" labelledBy="portal-title">
      <SectionHeader id="portal-title" title="No portal" count={CARDS.length} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 narrow:grid-cols-1">
        {CARDS.map((card) => (
          <PortalCardLink key={card.name} {...card} />
        ))}
      </div>
    </Section>
  );
}
