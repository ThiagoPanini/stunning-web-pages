import { BrandMark } from "./brand-mark";
import { ButtonLink } from "./button-link";
import { NavLink } from "./nav-link";
import { NavPill } from "./nav-pill";

// Screens the design does not have yet: their links stay inert.
const otherScreens = ["Dados", "Playground", "Integrações"];

// The header: sticky and blurred over the page, with the brand, the nav pill, the button and a bar that
// grows with the page scroll. At 760px and below it scrolls away with the page, and the nav takes a row
// of its own that scrolls sideways. On a coarse pointer the nav links grow to 44px.
export function SiteHeader() {
  return (
    <header
      data-block="header"
      className="sticky top-0 z-20 border-white-7 border-b bg-header backdrop-blur-16 narrow:relative"
    >
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-2 px-gutter py-2.5">
        <a
          href="#topo"
          className="flex min-h-11 flex-[1_1_0] items-center gap-2.5 whitespace-nowrap font-medium text-15 tracking-tight-10"
        >
          <BrandMark />
          <span>Responsible AI</span>
        </a>
        <div className="narrow:order-3 narrow:flex-[1_1_100%] narrow:overflow-x-auto">
          <NavPill label="Principal">
            <NavLink href="#topo" current>
              Home
            </NavLink>
            {otherScreens.map((screen) => (
              <NavLink key={screen}>{screen}</NavLink>
            ))}
          </NavPill>
        </div>
        <div className="flex flex-[1_1_0] justify-end">
          <ButtonLink variant="header">Testar um guardrail</ButtonLink>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="scroll-progress absolute inset-x-0 -bottom-px h-0.5 bg-cream"
      />
    </header>
  );
}
