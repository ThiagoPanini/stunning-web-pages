import type { ReactNode } from "react";

type BezelProps = {
  children: ReactNode;
  // The element of the frame: an item of a list (the solutions) or an article (the practice cards).
  as?: "li" | "article";
  // spread: the content pushed to the top and the bottom of the core, 24px apart at least (solutions).
  // stack: the content stacked from the top, 28px apart (practice).
  layout?: "spread" | "stack";
  // Classes of the frame's place, such as the motion it enters with.
  className?: string;
  // Classes of the core, such as a minimum height.
  coreClassName?: string;
};

const layouts = { spread: "justify-between gap-6", stack: "justify-start gap-7" };

// The bezel card (rf-bz and rf-bz-in): a raised frame, 8px around a dark core with a smaller radius.
export function Bezel({
  children,
  as: Frame = "li",
  layout = "spread",
  className = "",
  coreClassName = "",
}: BezelProps) {
  return (
    <Frame className={`flex min-w-0 rounded-16 bg-raised p-2 ${className}`}>
      <div
        className={`flex min-w-0 flex-auto flex-col rounded-9 bg-night p-6 ${layouts[layout]} ${coreClassName}`}
      >
        {children}
      </div>
    </Frame>
  );
}
