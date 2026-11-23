type NeonSquareProps = {
  // red is the Red Team, blue the Blue Team; violet, the default, marks a section with no team.
  team?: "violet" | "red" | "blue";
  // regular is 10px (eyebrows); small is 8px, with a tighter glow (team headers and step labels).
  size?: "regular" | "small";
};

const colors = {
  violet: { glow: "bg-violet-glow", light: "bg-violet-neon" },
  red: { glow: "bg-red-glow", light: "bg-red-neon" },
  blue: { glow: "bg-blue-glow", light: "bg-blue-neon" },
};

// The glowing square of the board (.uk-neon): three squares stacked, a blurred glow, a softly blurred
// light and a sharp one on top.
export function NeonSquare({ team = "violet", size = "regular" }: NeonSquareProps) {
  const { glow, light } = colors[team];
  const box = size === "regular" ? "size-2.5 basis-2.5" : "size-2 basis-2";
  const glowBlur = size === "regular" ? "blur-5" : "blur-4";
  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 grow-0 ${box}`}>
      <i className={`absolute inset-0 rounded-2 ${glowBlur} ${glow}`} />
      <i className={`absolute inset-0 rounded-2 blur-2 ${light}`} />
      <i className={`absolute inset-0 rounded-2 ${light}`} />
    </span>
  );
}
