type TeamIconProps = {
  team: "red" | "blue";
  // simple: the Version 01 disc's icon, 22px with a heavier stroke; card: the 36px icon of the other
  // versions.
  variant: "simple" | "card";
};

// The icon of a team, a line drawing in the current color: a sword for the Red Team, a shield with two
// dots for the Blue Team.
export function TeamIcon({ team, variant }: TeamIconProps) {
  const simple = variant === "simple";
  const size = simple ? 22 : 36;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={simple ? 2.7 : 2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={simple ? undefined : "block overflow-visible"}
    >
      {team === "red" ? (
        <>
          <path d="M30.5 5.5v3.6L15.7 23.9M30.5 5.5h-3.6L12.1 20.3" />
          <path d="M9.2 18.8l8 8" />
          <path d="M12.6 23.4 8 28" />
          <circle cx="6.4" cy="29.6" r="1.9" />
        </>
      ) : (
        <>
          <path d="M18 4.5 29.5 8.8v8.4c0 6.9-4.6 11.6-11.5 14.3C11.1 28.8 6.5 24.1 6.5 17.2V8.8z" />
          <circle cx="18" cy="14.4" r={simple ? 1.7 : 1.6} fill="currentColor" stroke="none" />
          <circle cx="18" cy="20.6" r={simple ? 1.7 : 1.6} fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
