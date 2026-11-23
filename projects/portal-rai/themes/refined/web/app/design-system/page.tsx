import type { Metadata } from "next";
import { OndasLogo } from "@/components/ondas-logo";

export const metadata: Metadata = {
  title: "Responsible AI · Sistema de design",
};

// The Refined's design system, alive. The route exists from the start, so the export has both pages;
// the tokens of @theme and the components of the Home come in the route's own ticket. No part of it is
// as tall as the window (min-h-dvh): the tests open it in a window as tall as the page, and a page a
// window plus the specimen tall would grow with every step. The body's night fills the rest.
export default function DesignSystem() {
  return (
    <>
      {/* The Ondas logo as its board draws it alone: 560 px wide, the board's preview, on the board's
          own background, and outside the page's type, as in the Neônio, so nothing of the page reaches
          it (the logo inherits letter spacing). It starts on a whole pixel, the top of the page: under
          the title (35.2 px tall) it would start between two rows of pixels and draw differently.
          tests/logo.spec.ts compares it with the reference capture of the board. */}
      <div data-specimen="ondas-logo-board" className="w-140">
        <OndasLogo />
      </div>
      <div className="bg-night font-sans text-16 text-bright leading-150 antialiased">
        <main className="mx-auto w-full max-w-column px-5 pt-section-top">
          <h1 className="font-normal text-32 leading-110 tracking-tight-30">Sistema de design</h1>
        </main>
      </div>
    </>
  );
}
