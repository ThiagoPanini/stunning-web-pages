import { Contact } from "@/components/contact";
import { Cycle } from "@/components/cycle";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { Portal } from "@/components/portal";
import { Practice } from "@/components/practice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Solutions } from "@/components/solutions";
import { Teams } from "@/components/teams";

// The Refined's Home: header, opening, the seven sections and the footer, in the board's order.
export default function Home() {
  return (
    <div
      id="topo"
      className="relative overflow-x-clip bg-night font-sans text-16 text-bright leading-150 antialiased"
    >
      <SiteHeader />
      <main>
        <Hero />
        <Teams />
        <Cycle />
        <Solutions />
        <Practice />
        <Portal />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
