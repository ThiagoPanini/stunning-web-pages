import { InertLink } from "./inert-link";
import { MediaPlaceholder } from "./media-placeholder";
import { Paragraph } from "./paragraph";

export type PortalCardLinkProps = {
  name: string;
  description: string;
  // The label of the action tag at the end of the row.
  action: string;
  // The media placeholder's label and aspect ratio.
  mark: string;
  aspect: string;
  // The card takes the whole row of its grid above 760px.
  wide?: boolean;
};

// A link card of the portal (rf-good): the media placeholder, the name with its line, and the action tag.
// On hover the media lightens and the tag turns cream. The screens it leads to do not exist yet (a design
// gap): the card stays inert.
export function PortalCardLink({
  name,
  description,
  action,
  mark,
  aspect,
  wide = false,
}: PortalCardLinkProps) {
  return (
    <InertLink
      className={`group rise flex min-w-0 flex-col gap-5 rounded-16 ${wide ? "col-span-full narrow:col-auto" : ""}`}
    >
      <MediaPlaceholder
        mark={mark}
        className={`${aspect} transition-[background-color] duration-slow group-hover:bg-raised`}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="mb-1 font-medium text-20 text-bright leading-125 tracking-tight-20">
            {name}
          </h3>
          <Paragraph>{description}</Paragraph>
        </div>
        <span className="inline-flex min-h-8 flex-none items-center rounded-pill bg-raised px-3.5 font-medium text-14 text-bright transition-[color,background-color] group-hover:bg-cream group-hover:text-night">
          {action}
        </span>
      </div>
    </InertLink>
  );
}
