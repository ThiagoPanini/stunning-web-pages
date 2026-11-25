import { SectionLabel } from "./section-label";

type SectionHeaderProps = {
  // The label as the design writes it: "01 · Modelo de trabalho".
  label: string;
  // The id of the title, which names the section (aria-labelledby).
  titleId: string;
  title: string;
  lead: string;
};

// The opening of a numbered section: the mono label, the title and the lead paragraph, rising into place
// as they enter the view.
export function SectionHeader({ label, titleId, title, lead }: SectionHeaderProps) {
  return (
    <div className="reveal-1 flex flex-col gap-4">
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-col gap-3">
        <h2 id={titleId} className="font-light text-28-42 leading-110 tracking-tight-25">
          {title}
        </h2>
        <p className="max-w-160 text-pretty text-17 text-muted leading-160">{lead}</p>
      </div>
    </div>
  );
}
