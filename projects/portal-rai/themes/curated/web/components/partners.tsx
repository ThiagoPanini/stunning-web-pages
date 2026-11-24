import type { ReactNode } from "react";

// The partners, clients and integrations: invented names, each with a mark drawn in the current color.
const BRANDS: { name: string; mark: ReactNode }[] = [
  {
    name: "Quoril",
    mark: (
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <circle cx="10" cy="10" r="6.9" />
        <path d="M14.9 14.9 19.6 19.6" />
      </svg>
    ),
  },
  {
    name: "Nimbrava",
    mark: (
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M7 5.5h9M3.5 11h15M7 16.5h6" />
      </svg>
    ),
  },
  {
    name: "Talvique",
    mark: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22">
        <path d="M11 2.5 20 18.5H2z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Hexaluz",
    mark: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22">
        <path
          d="M11 2.2 18.6 6.6v8.8L11 19.8 3.4 15.4V6.6z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="11" cy="11" r="2.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Dorsova",
    mark: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22">
        <path d="M4 3h6.5a8 8 0 0 1 0 16H4z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Cendrava",
    mark: (
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="8.3" cy="11" r="5.8" />
        <circle cx="13.7" cy="11" r="5.8" />
      </svg>
    ),
  },
  {
    name: "Pravessa",
    mark: (
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="3.5" y="3.5" width="15" height="15" rx="2.5" />
        <path d="M7.6 14.4 14.4 7.6" />
      </svg>
    ),
  },
  {
    name: "Brisquel",
    mark: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22">
        <path
          d="M11 1.8 13.5 8.5 20.2 11 13.5 13.5 11 20.2 8.5 13.5 1.8 11 8.5 8.5z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

type BrandSetProps = {
  // The second set, there only to close the loop of the strip: hidden from assistive technology, and
  // gone with reduced motion.
  copy?: boolean;
};

function BrandSet({ copy = false }: BrandSetProps) {
  return (
    <ul
      aria-hidden={copy || undefined}
      className={`flex items-center gap-21 pr-21 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-14 motion-reduce:gap-y-1 motion-reduce:p-0 ${
        copy ? "motion-reduce:hidden" : ""
      }`}
    >
      {BRANDS.map(({ name, mark }) => (
        <li
          key={name}
          className="inline-flex min-h-11 items-center gap-2.75 whitespace-nowrap font-medium text-19 text-subtle tracking-tight-20 [&_svg]:block [&_svg]:flex-none"
        >
          {mark}
          {name}
        </li>
      ))}
    </ul>
  );
}

// Partners, clients and integrations: a strip of marks that runs sideways without end, faded at both
// sides. With reduced motion it stands still, centered, wrapping into rows.
export function Partners() {
  return (
    <section
      data-block="partners"
      aria-labelledby="parceiros-t"
      className="relative z-1 flex flex-col gap-5 border-rule border-t pt-9 pb-11"
    >
      <h2 id="parceiros-t" className="text-center font-normal text-14 text-subtle leading-140">
        Parceiros, clientes e integrações
      </h2>
      <div className="fade-sides overflow-hidden">
        <div className="marquee flex w-max motion-reduce:w-auto motion-reduce:justify-center">
          <BrandSet />
          <BrandSet copy />
        </div>
      </div>
    </section>
  );
}
