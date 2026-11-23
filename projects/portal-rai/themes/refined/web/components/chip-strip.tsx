// What the guardrails evaluate, as the hero's chips.
const CHIPS = [
  "Prompt injection",
  "Jailbreak",
  "PII",
  "Escopo",
  "Política",
  "Fundamentação",
  "Troca de persona",
  "Injeção indireta",
  "Ofuscação",
];

type ChipSetProps = {
  // The second copy, there only to close the loop of the strip: hidden from assistive technology.
  copy?: boolean;
};

function ChipSet({ copy = false }: ChipSetProps) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: list-style none takes the list role away in Safari; the board gives it back
    <ul role={copy ? undefined : "list"} aria-hidden={copy || undefined} className="flex gap-2 pr-2">
      {CHIPS.map((chip) => (
        <li
          key={chip}
          className="inline-flex h-8 items-center whitespace-nowrap rounded-pill bg-bright-8 px-3.5 font-medium text-14 text-chip tracking-tight-10"
        >
          {chip}
        </li>
      ))}
    </ul>
  );
}

type ChipStripProps = {
  // Classes from the page, such as the motion the strip enters with.
  className?: string;
};

// The strip of chips at the top of the hero: 460px wide at most, faded at both sides, running sideways
// with normal motion and pausing under the pointer. With reduced motion it stands still on its first
// chips.
export function ChipStrip({ className = "" }: ChipStripProps) {
  return (
    <div
      role="group"
      aria-label="O que os guardrails avaliam"
      className={`group fade-sides mx-auto w-115 max-w-full overflow-hidden ${className}`}
    >
      <div className="marquee flex w-max">
        <ChipSet />
        <ChipSet copy />
      </div>
    </div>
  );
}
