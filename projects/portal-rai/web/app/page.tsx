import { Hero } from "@/components/hero";
import { Model } from "@/components/model";
import { Partners } from "@/components/partners";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Teams } from "@/components/teams";
import { TweaksPanel } from "@/components/tweaks";

// The Home: header, opening, the partners and section 01 over a dotted ground, section 02 and
// the footer, in the board's order. The panel of tweaks is the catalog's, not the design's.
export default function Home() {
  return (
    <>
      <div
        id="topo"
        className="relative overflow-x-clip bg-night font-sans text-16 text-bright leading-150 antialiased"
      >
        <SiteHeader />
        <main className="mx-auto box-content max-w-page px-gutter">
          <Hero />
          <div className="relative">
            <div
              aria-hidden="true"
              className="dotted-ground pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2"
            />
            <Partners />
            <Model />
          </div>
          <Teams />
        </main>
        <SiteFooter />
      </div>
      <TweaksPanel />
    </>
  );
}
