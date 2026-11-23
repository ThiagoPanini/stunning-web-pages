import { HeaderBlockLink } from "./header-block-link";
import { NavLink } from "./nav-link";

// Screens the design does not have yet: their links stay inert. The nav has no Home.
const otherScreens = ["Dados", "Playground", "Integrações"];

// The header: three white blocks in a row that sticks to the top of the page. The first holds the
// brand, which goes back to the top, and the nav; the others are "Contato", which goes to the footer,
// and "Testar um guardrail". Only the blocks take the pointer: the header's own box lets clicks through
// to the page around them. When narrow the blocks wrap, and at 760px and below the header scrolls away
// with the page.
export function SiteHeader() {
  return (
    <header
      data-block="header"
      className="pointer-events-none sticky top-0 z-30 px-gutter pt-2.5 upto-760:relative"
    >
      <div className="mx-auto flex max-w-header flex-wrap gap-1">
        <div className="pointer-events-auto flex min-h-11 min-w-0 grow basis-130 flex-wrap items-center justify-between gap-x-6 bg-white pl-4 text-page">
          <a
            href="#topo"
            className="inline-flex min-h-11 items-center whitespace-nowrap pr-2 font-display font-medium text-19 tracking-tight-30 focus-visible:outline-page focus-visible:outline-offset-inset"
          >
            Responsible AI
          </a>
          <nav aria-label="Principal" className="flex flex-wrap items-center font-medium text-14">
            {otherScreens.map((screen) => (
              <NavLink key={screen}>{screen}</NavLink>
            ))}
          </nav>
        </div>
        <HeaderBlockLink href="#contato">Contato</HeaderBlockLink>
        <HeaderBlockLink>Testar um guardrail</HeaderBlockLink>
      </div>
    </header>
  );
}
