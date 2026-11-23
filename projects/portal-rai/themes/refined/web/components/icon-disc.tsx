import type { ReactNode } from "react";

type IconDiscProps = {
  // The icon's drawing: an <svg> that strokes with currentColor.
  children: ReactNode;
  // The color of the icon: the default light gray (the cycle), or the color of a team (the solutions).
  tone?: "icon" | "red" | "blue";
};

const toneColor = { icon: "text-icon", red: "text-red", blue: "text-blue" };

// An icon on a 44px raised disc (rf-ic), decorative: hidden from assistive technology.
export function IconDisc({ children, tone = "icon" }: IconDiscProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-11 shrink-0 grow-0 basis-11 place-items-center rounded-circle bg-raised ${toneColor[tone]}`}
    >
      {children}
    </span>
  );
}
