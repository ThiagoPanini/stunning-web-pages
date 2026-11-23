import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

const linkClassName =
  "inline-flex min-h-11 items-center text-muted transition-[color] hover:text-white";

type FooterLinkProps = {
  children: ReactNode;
  // An anchor of the Home; without one the link leads to a screen the design does not have yet, and
  // stays inert.
  href?: `#${string}`;
};

// A link of the footer (.uk-foot a, .uk-flink): grey, white on hover.
function FooterLink({ children, href }: FooterLinkProps) {
  if (href) {
    return (
      <a href={href} className={linkClassName}>
        {children}
      </a>
    );
  }
  return <InertLink className={linkClassName}>{children}</InertLink>;
}

type FooterColumnProps = {
  heading: string;
  children: ReactNode;
  // Columns of links are navs; Contato is a plain column, with two placeholders and one link.
  as?: "nav" | "div";
};

function FooterColumn({ heading, children, as: Column = "nav" }: FooterColumnProps) {
  return (
    <Column
      aria-label={Column === "nav" ? heading : undefined}
      className="flex flex-col text-14 text-muted"
    >
      <h3 className="mb-2 font-medium text-15 text-white tracking-tight-20">{heading}</h3>
      {children}
    </Column>
  );
}

// A line of the Contato column that the design left as a placeholder, such as [CANAL DO TIME].
function ContactPlaceholder({ children }: { children: ReactNode }) {
  return <span className="inline-flex min-h-11 items-center">{children}</span>;
}

// The footer, the destination of "Contato" in the header: the brand, which goes back to the top, the
// slogan and the company's name, a placeholder; beside them four columns of links, which wrap as the
// page narrows. Portal's links to other screens stay inert; the others lead to sections of the Home.
export function SiteFooter() {
  return (
    <footer data-block="footer" id="contato" className="mx-auto max-w-page px-gutter pt-14 pb-18">
      <div className="flex flex-wrap gap-x-8 gap-y-10">
        <div className="flex min-w-0 shrink grow basis-80 flex-col gap-3.5">
          <a
            href="#topo"
            className="inline-flex min-h-11 items-center self-start font-display font-medium text-22 text-white tracking-tight-30"
          >
            Responsible AI
          </a>
          <p className="font-medium text-14 text-white">Atacamos primeiro. Protegemos sempre.</p>
          <p className="text-13 text-muted">[NOME DA COMPANHIA]</p>
        </div>
        <div className="grid min-w-0 shrink grow-3 basis-180 grid-cols-footer gap-x-8 gap-y-10">
          <FooterColumn heading="Portal">
            <FooterLink href="#topo">Home</FooterLink>
            <FooterLink>Dados</FooterLink>
            <FooterLink>Playground</FooterLink>
            <FooterLink>Integrações</FooterLink>
          </FooterColumn>
          <FooterColumn heading="Times">
            <FooterLink href="#ciclo">Red Team</FooterLink>
            <FooterLink href="#ciclo">Blue Team</FooterLink>
          </FooterColumn>
          <FooterColumn heading="Soluções">
            <FooterLink href="#solucoes">Agente de Ataque</FooterLink>
            <FooterLink href="#solucoes">Semana Vermelha</FooterLink>
            <FooterLink href="#solucoes">Guardrail Antiataque</FooterLink>
            <FooterLink href="#solucoes">Guardrail Ética Saída</FooterLink>
          </FooterColumn>
          <FooterColumn heading="Contato" as="div">
            <ContactPlaceholder>[CANAL DO TIME]</ContactPlaceholder>
            <ContactPlaceholder>[E-MAIL DO TIME]</ContactPlaceholder>
            <FooterLink href="#topo">Voltar ao topo ↑</FooterLink>
          </FooterColumn>
        </div>
      </div>
    </footer>
  );
}
