import type { ReactNode } from "react";
import { NeonSquare } from "./neon-square";

type EyebrowProps = {
  children: ReactNode;
  // Where it sits in its column: at the start, or centered (Integrations).
  align?: "start" | "center";
};

// The label above a section title (.uk-eyebrow): a bordered mono tag in capitals with a violet neon
// square. At 760px and below its text shrinks to 13px.
export function Eyebrow({ children, align = "start" }: EyebrowProps) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2.5 whitespace-nowrap rounded-6 border border-rule px-3 py-1.75 font-mono font-normal text-14 text-white uppercase leading-5 tracking-wide-30 upto-760:text-13 ${align === "center" ? "self-center" : "self-start"}`}
    >
      <NeonSquare />
      {children}
    </span>
  );
}
