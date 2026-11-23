import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible AI · Sistema de design",
};

// The Refined's design system, alive. The route exists from the start, so the export has both pages;
// the tokens of @theme and the components of the Home come in the route's own ticket.
export default function DesignSystem() {
  return (
    <div className="min-h-dvh bg-night font-sans text-16 text-bright leading-150 antialiased">
      <main className="mx-auto w-full max-w-column px-5 pt-section-top">
        <h1 className="font-normal text-32 leading-110 tracking-tight-30">Sistema de design</h1>
      </main>
    </div>
  );
}
