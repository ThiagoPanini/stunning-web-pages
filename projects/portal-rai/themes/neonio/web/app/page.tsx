import { Brands } from "@/components/brands";
import { DataSection } from "@/components/data-section";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { IntegratedCycle } from "@/components/integrated-cycle";
import { Integrations } from "@/components/integrations";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Solutions } from "@/components/solutions";

// The Neônio's Home, in the board's order: the header, the hero and the brands band edge to edge; the
// four sections inside the ruled frame (the side rules of the page column), the closing call below it,
// and the footer, which is the destination of "Contato". Each block carries data-block, the name the
// tests know it by.
export default function Home() {
  return (
    <div
      id="topo"
      className="transitions-off-when-reduced relative overflow-x-clip bg-page font-sans text-16 text-text leading-1375 tracking-tight-10 antialiased"
    >
      <SiteHeader />
      <Hero />
      <Brands />
      <main className="mx-auto max-w-page px-gutter">
        <div className="border-rule border-x">
          <Solutions />
          <IntegratedCycle />
          <Integrations />
          <DataSection />
        </div>
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
