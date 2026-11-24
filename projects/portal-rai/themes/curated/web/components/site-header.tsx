import { ButtonLink } from "./button-link";
import { NavLink } from "./nav-link";
import { NavPill } from "./nav-pill";
import { OndasMini } from "./ondas-mini";

// The header: sticky and blurred over the page, with the brand (the Ondas mini and the name), the nav
// pill, the button and a bar that grows with the page scroll. At 760px and below it scrolls away with
// the page, and the nav takes a row of its own that scrolls sideways. On a coarse pointer the nav links
// grow to 44px.
//
// The design's anchors stay as written: "Soluções" points to #solucoes and the button to #comece,
// sections this Home does not have (HANDOFF.md, Lacunas). Dados and Integrações are screens still to
// come: their links stay inert.
export function SiteHeader() {
  return (
    <header
      data-block="header"
      className="sticky top-0 z-20 border-white-7 border-b bg-header backdrop-blur-16 narrow:relative"
    >
      <div className="mx-auto box-content flex max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-2 px-gutter py-2.5">
        <a
          href="/"
          className="flex min-h-11 flex-[1_1_0] items-center gap-1.75 whitespace-nowrap font-medium text-15 tracking-tight-10"
        >
          <span
            data-region="brand"
            aria-hidden="true"
            className="-ml-1.25 block size-9.5 flex-none"
          >
            <OndasMini background="transparent" />
          </span>
          <span>Responsible AI</span>
        </a>
        <div className="narrow:order-3 narrow:flex-[1_1_100%] narrow:overflow-x-auto">
          <NavPill label="Principal">
            <NavLink href="/" current>
              Home
            </NavLink>
            <NavLink href="#solucoes">Soluções</NavLink>
            <NavLink>Dados</NavLink>
            <NavLink>Integrações</NavLink>
          </NavPill>
        </div>
        <div className="flex flex-[1_1_0] justify-end">
          <ButtonLink href="#comece" variant="header">
            Simular um ataque
          </ButtonLink>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="scroll-progress absolute inset-x-0 -bottom-px h-0.5 bg-bright"
      />
    </header>
  );
}
