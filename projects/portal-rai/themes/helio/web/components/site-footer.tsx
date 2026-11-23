import { BrandMark } from "./brand-mark";
import { FooterLink } from "./footer-link";

// Screens the design does not have yet: their links stay inert.
const otherScreens = ["Dados", "Playground", "Integrações"];

// The footer, in one ruled row that wraps when narrow: the brand with the company placeholder, the
// links to the screens, and the team's channel and e-mail placeholders next to "Voltar ao topo",
// which goes back to the start of the page (the page's outer element is #topo). Keep
// data-block="footer": the tests find the block by it.
export function SiteFooter() {
  return (
    <footer data-block="footer" className="mx-auto box-content max-w-page px-gutter">
      <div className="flex flex-wrap items-center justify-between gap-x-8 border-rule border-t pt-4 pb-5 text-13 text-subtle">
        <div className="flex min-h-11 flex-wrap items-center gap-x-2.5">
          <BrandMark variant="footer" />
          <span className="text-muted">Responsible AI</span>
          <span>· [NOME DA COMPANHIA]</span>
        </div>
        <nav aria-label="Rodapé" className="flex flex-wrap items-center gap-x-6">
          <FooterLink href="/" current>
            Home
          </FooterLink>
          {otherScreens.map((screen) => (
            <FooterLink key={screen}>{screen}</FooterLink>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-x-6">
          <span>[CANAL DO TIME]</span>
          <span>[E-MAIL DO TIME]</span>
          <FooterLink href="#topo">Voltar ao topo ↑</FooterLink>
        </div>
      </div>
    </footer>
  );
}
