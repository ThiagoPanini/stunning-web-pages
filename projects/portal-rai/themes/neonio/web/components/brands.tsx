import type { ReactNode } from "react";

// The eight sample brands, as the design writes them, each with its 20px mark in the text's color.
const BRANDS: { name: string; mark: ReactNode }[] = [
  { name: "[MARCA 1]", mark: <circle cx="10" cy="10" r="7.5" fill="currentColor" /> },
  {
    name: "[MARCA 2]",
    mark: (
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    ),
  },
  { name: "[MARCA 3]", mark: <path d="M10 2.5 18 17H2z" fill="currentColor" /> },
  {
    name: "[MARCA 4]",
    mark: (
      <>
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="10" cy="10" r="2.5" fill="currentColor" />
      </>
    ),
  },
  { name: "[MARCA 5]", mark: <path d="M10 2 18 10 10 18 2 10z" fill="currentColor" /> },
  {
    name: "[MARCA 6]",
    mark: <path d="M10 3v14M3 10h14" fill="none" stroke="currentColor" strokeWidth="2.2" />,
  },
  {
    name: "[MARCA 7]",
    mark: (
      <path
        d="M10 2.2 16.8 6.1v7.8L10 17.8 3.2 13.9V6.1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    ),
  },
  { name: "[MARCA 8]", mark: <path d="M3 17V3h7a7 7 0 0 1 0 14z" fill="currentColor" /> },
];

// One copy of the list. The track holds two, the second hidden from assistive technology, and slides
// by one copy, so the band loops with no seam.
function BrandList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex items-center gap-22 pr-22">
      {BRANDS.map(({ name, mark }) => (
        <li
          key={name}
          className="inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap font-display font-medium text-19 text-muted tracking-tight-20"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" className="shrink-0">
            {mark}
          </svg>
          {name}
        </li>
      ))}
    </ul>
  );
}

// The brands band, edge to edge under the hero: a marquee of the eight sample brands, its ends faded.
// It pauses while the pointer is over it and stays still with reduced motion.
export function Brands() {
  return (
    <section data-block="brands" aria-label="Marcas" className="border-rule border-b">
      <div className="marquee-viewport mx-auto max-w-page pt-6.5 pb-7.5">
        <div className="marquee-track flex w-max">
          <BrandList />
          <BrandList hidden />
        </div>
      </div>
    </section>
  );
}
