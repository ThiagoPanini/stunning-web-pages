import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible AI · Sistema de design",
};

// The Neônio's design system, alive: every token of @theme and each component of the Home in its
// states. Its own ticket builds it, with readThemeTokens and groupTokens (./theme-tokens.ts); until then
// the route only exists, so the export has both routes.
export default function DesignSystem() {
  return (
    <div className="bg-page font-sans text-16 text-text leading-1375 tracking-tight-10 antialiased">
      <main className="mx-auto max-w-page px-gutter pt-6 pb-14">
        <h1 className="font-display font-light text-38-64 text-white leading-1125 tracking-tight-20">
          Sistema de design.
        </h1>
      </main>
    </div>
  );
}
