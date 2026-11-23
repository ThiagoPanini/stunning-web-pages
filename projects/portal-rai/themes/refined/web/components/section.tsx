import type { ReactNode } from "react";

type ColumnProps = {
  children?: ReactNode;
  // Classes of its place, such as the footer's layout of its column.
  className?: string;
};

// The column every section and the footer set their content in: 880px wide at most, centered, 20px
// from the window's edges (rf-col).
export function Column({ children, className = "" }: ColumnProps) {
  return <div className={`mx-auto w-full max-w-column px-5 ${className}`}>{children}</div>;
}

type SectionProps = {
  // The block's name, the one of origin/captures.json, by which the tests find it.
  block: string;
  // The anchor the page links to, as the board writes it ("times", "ciclo").
  id: string;
  // The id of the section's title.
  labelledBy?: string;
  children?: ReactNode;
};

// A section of the Home after the hero (rf-sec): a fluid space above it and its content in the column.
// An anchor scrolls it into view 72px below the top, clear of the header.
export function Section({ block, id, labelledBy, children }: SectionProps) {
  return (
    <section
      data-block={block}
      id={id}
      aria-labelledby={labelledBy}
      className="scroll-mt-18 pt-section-top"
    >
      <Column>{children}</Column>
    </section>
  );
}
