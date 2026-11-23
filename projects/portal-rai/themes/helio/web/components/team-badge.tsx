// red: the Red Team, which attacks. blue: the Blue Team, which guards.
export type Team = "red" | "blue";

type TeamBadgeProps = {
  team: Team;
};

// The small tag that says which team a solution belongs to: RED or BLUE, in mono, on a tint of its color.
export function TeamBadge({ team }: TeamBadgeProps) {
  const color = team === "red" ? "bg-red-12 text-red" : "bg-blue-12 text-blue";
  return (
    <span
      className={`inline-block rounded-6 px-2.25 py-0.75 font-mono text-11 tracking-wide-80 ${color}`}
    >
      {team === "red" ? "RED" : "BLUE"}
    </span>
  );
}
