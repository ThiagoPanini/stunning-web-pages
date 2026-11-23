import { IconDisc } from "./icon-disc";

export type CycleStepProps = {
  title: string;
  team: "Red Team" | "Blue Team";
  // The step's icon: an arrow on to the next step, or the loop of the last one back to the first.
  icon: "next" | "again";
  // Its place in the cycle and how many steps the cycle has: "etapa 1 de 5".
  number: number;
  total: number;
};

const teamDot = { "Red Team": "bg-red", "Blue Team": "bg-blue" };

// The icons of the steps, 18px drawn on a 20px grid, stroked in the disc's color.
function StepIcon({ icon }: { icon: CycleStepProps["icon"] }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon === "next" ? (
        <>
          <path d="M6 4v6.5a2 2 0 0 0 2 2h7" />
          <path d="M12 9.5l3 3-3 3" />
        </>
      ) : (
        <>
          <path d="M4.75 10a5.25 5.25 0 1 0 1.6-3.78" />
          <path d="M4.5 3.75v3h3" />
        </>
      )}
    </svg>
  );
}

// A step of the cycle, between rules (rf-rows): its title, which lights up from unlit to bright as it
// enters the view, the team that runs it with a dot in its color and "etapa n de 5", and an icon on a
// disc. It is a list item: it goes in the cycle's ordered list, which draws the rule above the first.
export function CycleStep({ title, team, icon, number, total }: CycleStepProps) {
  return (
    <li className="flex items-center justify-between gap-6 border-bright-9 border-b py-5.5">
      <div className="min-w-0">
        <h3 className="light-up text-balance font-normal text-20 text-bright leading-130 tracking-tight-20 compact:text-18">
          {title}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-14 text-muted">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 grow-0 basis-1.5 rounded-circle ${teamDot[team]}`}
          />
          {team}
          <span aria-hidden="true">·</span>
          {`etapa ${number} de ${total}`}
        </p>
      </div>
      <IconDisc>
        <StepIcon icon={icon} />
      </IconDisc>
    </li>
  );
}
