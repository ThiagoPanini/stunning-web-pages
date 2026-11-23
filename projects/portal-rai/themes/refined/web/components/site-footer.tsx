import { BrandMark } from "./brand-mark";
import { FooterLink } from "./footer-link";
import { Pill } from "./pill";
import { Column } from "./section";

type FooterColumn = {
  title: string;
  // Where the column sits in its third of the row above 760px; at 760px and below every column starts
  // at the left.
  place: string;
  // A link without href goes to a screen the design does not have yet: it stays inert.
  links: { label: string; href?: string; current?: boolean }[];
};

const COLUMNS: FooterColumn[] = [
  {
    title: "Portal",
    place: "justify-self-start",
    links: [
      { label: "Home", href: "#topo", current: true },
      { label: "Dados" },
      { label: "Playground" },
      { label: "Integrações" },
    ],
  },
  {
    title: "Times",
    place: "justify-self-center narrow:justify-self-start",
    links: [
      { label: "Red Team", href: "#times" },
      { label: "Blue Team", href: "#times" },
      { label: "Ciclo", href: "#ciclo" },
    ],
  },
  {
    title: "Soluções",
    place: "justify-self-end narrow:justify-self-start",
    links: [
      { label: "Agente de Ataque", href: "#solucoes" },
      { label: "Semana Vermelha", href: "#solucoes" },
      { label: "Guardrails de Entrada", href: "#solucoes" },
      { label: "Guardrails de Saída", href: "#solucoes" },
    ],
  },
];

// The footer: the signature "Dois times, um ciclo." with its first line unlit and the team's channels as
// two placeholder pills; then three columns of links, and the closing bar with the brand,
// [NOME DA COMPANHIA] and the link back to the top.
export function SiteFooter() {
  return (
    <footer data-block="footer" className="pt-section-top">
      <Column className="flex flex-col items-center gap-7 text-center">
        <p className="font-normal text-34-48 text-bright leading-102 tracking-tight-40">
          <span className="block text-unlit">Dois times,</span>
          <span className="block">um ciclo.</span>
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Pill>[CANAL DO TIME]</Pill>
          <Pill>[E-MAIL DO TIME]</Pill>
        </div>
      </Column>
      <Column className="mt-footer-links-top">
        <div className="grid grid-cols-3 gap-8 narrow:grid-cols-1">
          {COLUMNS.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className={`flex flex-col text-15 ${column.place}`}
            >
              <h3 className="mb-1 font-medium text-14 text-bright tracking-tight-10">
                {column.title}
              </h3>
              {column.links.map((link) => (
                <FooterLink key={link.label} href={link.href} current={link.current}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-6 border-bright-9 border-t pt-3 pb-6 text-14 text-muted">
          <div className="flex min-h-11 flex-wrap items-center gap-x-2.5">
            <BrandMark variant="footer" />
            <span className="text-pale">Responsible AI</span>
            <span>· [NOME DA COMPANHIA]</span>
          </div>
          <FooterLink href="#topo">Voltar ao topo ↑</FooterLink>
        </div>
      </Column>
    </footer>
  );
}
