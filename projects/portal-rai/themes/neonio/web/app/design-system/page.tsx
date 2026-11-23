import type { Metadata } from "next";
import { OndasLogo } from "@/components/ondas-logo";

export const metadata: Metadata = {
  title: "Responsible AI · Sistema de design",
};

// The Neônio's design system, alive: every token of @theme and each component of the Home in its
// states. Its own ticket builds it, with readThemeTokens and groupTokens (./theme-tokens.ts); until then
// the route only exists, so the export has both routes.
export default function DesignSystem() {
  return (
    <>
      <div className="bg-page font-sans text-16 text-text leading-1375 tracking-tight-10 antialiased">
        <main className="mx-auto max-w-page px-gutter pt-6 pb-14">
          <h1 className="font-display font-light text-38-64 text-white leading-1125 tracking-tight-20">
            Sistema de design.
          </h1>
        </main>
      </div>
      {/* The Ondas logo as its board draws it alone: 560 px wide, the board's preview, on the board's
          own background, and outside the page's type, since the board's body sets no letter spacing and
          the logo inherits it (the Home's -0.01em moves its characters). tests/logo.spec.ts compares it
          with the reference capture of the board. */}
      <div data-specimen="ondas-logo-board" className="w-140">
        <OndasLogo />
      </div>
    </>
  );
}
