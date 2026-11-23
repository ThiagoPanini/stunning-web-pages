import type { ReactNode } from "react";

type IllustrationFrameProps = {
  // What the drawing shows, read out in its place: the drawing is one image.
  label: string;
  children: ReactNode;
  // The layout or background of the one drawing, such as bg-ruled or flex flex-col.
  className?: string;
};

// The frame of a solution card's drawing (.uk-mini): as wide as the card, 324:255, in small mono text.
// The drawings place their marks in % of it, so they scale with the card.
export function IllustrationFrame({ label, children, className = "" }: IllustrationFrameProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative mt-1 aspect-324/255 w-full font-mono-short text-subtle ${className}`.trim()}
    >
      {children}
    </div>
  );
}
