import type { ReactNode } from "react";

type PillProps = {
  children: ReactNode;
  // A 6px dot before the text, in the color of a team: red for the Red Team, blue for the Blue Team.
  dot?: "red" | "blue";
  // On a media placeholder: in its top right corner, on a translucent dark fill that blurs the media.
  onMedia?: boolean;
};

const dotColor = { red: "bg-red", blue: "bg-blue" };

// The pill (rf-pill): bright text on a faint fill, 32px tall, fully rounded.
export function Pill({ children, dot, onMedia = false }: PillProps) {
  const fill = onMedia ? "absolute top-4 right-4 bg-night-55 backdrop-blur-10" : "bg-bright-8";
  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 whitespace-nowrap rounded-pill px-3.5 font-medium text-14 text-bright tracking-tight-10 ${fill}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={`size-1.5 shrink-0 grow-0 basis-1.5 rounded-circle ${dotColor[dot]}`}
        />
      ) : null}
      {children}
    </span>
  );
}
