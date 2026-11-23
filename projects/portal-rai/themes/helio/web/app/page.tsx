import { Hero } from "@/components/hero";
import { Mission } from "@/components/mission";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Solutions } from "@/components/solutions";
import { Start } from "@/components/start";
import { Teams } from "@/components/teams";

// The Home of the Hélio: header, opening, the four numbered sections and the footer, in the Quadro's order.
export default function Home() {
  return (
    <div
      id="topo"
      className="relative overflow-x-clip bg-night font-sans text-16 text-bright leading-150 antialiased"
    >
      <SiteHeader />
      <main className="mx-auto box-content max-w-page px-gutter">
        <Hero />
        <Mission />
        <Teams />
        <Solutions />
        <Start />
      </main>
      <SiteFooter />
    </div>
  );
}
