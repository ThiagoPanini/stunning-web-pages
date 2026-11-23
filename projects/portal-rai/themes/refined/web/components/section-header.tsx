type SectionHeaderProps = {
  // The id of the title, which the section names itself by.
  id: string;
  title: string;
  // How many items the section shows, set next to the title as "(2)"; some sections have none.
  count?: number;
  // A link at the end of the rule, as "Ver o ciclo".
  link?: { label: string; href: string };
};

// The head of a section (rf-sh): the title with its count, a rule that takes the rest of the row, and an
// optional cream link that underlines on hover. At 760px and below the gaps close in; at 480px and below
// the title and the link shrink.
export function SectionHeader({ id, title, count, link }: SectionHeaderProps) {
  return (
    <div className="mb-10 flex items-center gap-5 narrow:gap-3.5">
      <h2
        id={id}
        className="flex items-start gap-1.5 whitespace-nowrap font-normal text-32 text-bright leading-110 tracking-tight-30 compact:text-26"
      >
        {title}
        {count === undefined ? null : (
          <span className="font-normal text-14 text-muted leading-100 tracking-0">({count})</span>
        )}
      </h2>
      <span aria-hidden="true" className="h-px shrink grow basis-10 bg-bright-9" />
      {link ? (
        <a
          href={link.href}
          className="inline-flex min-h-11 items-center whitespace-nowrap font-medium text-16 text-cream tracking-tight-10 hover:underline hover:underline-offset-5 compact:text-15"
        >
          {link.label}
        </a>
      ) : null}
    </div>
  );
}
