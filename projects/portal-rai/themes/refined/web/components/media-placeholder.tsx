import type { ReactNode } from "react";

type MediaMarkProps = {
  // The placeholder's label as the design writes it: "inserir vídeo · 16:10".
  children: ReactNode;
  // Classes of its place, such as the centering of a placeholder laid out on its own.
  className?: string;
};

// The label of a media placeholder (rf-mark): small capitals, spaced out, hidden from assistive
// technology and out of the pointer's way.
export function MediaMark({ children, className = "" }: MediaMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none select-none whitespace-nowrap font-medium text-12 text-mark uppercase tracking-wide-140 ${className}`}
    >
      {children}
    </span>
  );
}

type MediaPlaceholderProps = {
  // The label, centered in the box.
  mark: string;
  // Classes of its place: the aspect ratio, a fill on the hover of its card.
  className?: string;
  // What sits on the media, positioned by itself, such as a pill in a corner.
  children?: ReactNode;
};

// A media placeholder (rf-media): a rounded box on the surface color with its label in the middle. The
// design left the media open (a design gap): the box stays a placeholder.
export function MediaPlaceholder({ mark, className = "", children }: MediaPlaceholderProps) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-16 bg-surface ${className}`}
    >
      {children}
      <MediaMark>{mark}</MediaMark>
    </div>
  );
}
