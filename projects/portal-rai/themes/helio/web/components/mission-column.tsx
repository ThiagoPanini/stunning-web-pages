import type { ReactNode } from "react";

type MissionColumnProps = {
  // The step, one word of the Mission title: "Pesquisar".
  title: string;
  // What the team does in that step.
  children: ReactNode;
  // Classes from the page, such as the motion the column rises with.
  className?: string;
};

// A column of the Mission section: the step's name over what the team does in it, under a strong rule.
export function MissionColumn({ title, children, className = "" }: MissionColumnProps) {
  return (
    <div className={`flex flex-col gap-2.5 border-rule-strong border-t pt-5 ${className}`}>
      <h3 className="font-normal text-20 tracking-tight-10">{title}</h3>
      <p className="text-pretty text-15 text-muted leading-160">{children}</p>
    </div>
  );
}
