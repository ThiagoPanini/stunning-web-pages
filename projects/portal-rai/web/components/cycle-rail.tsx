type CycleRailProps = {
  // Where the rail sits around the cards: cards-rail-frame (globals.css).
  className: string;
  // The corner radius of the rail, in px.
  radius: number;
};

// The dotted rail around the cards, which closes the cycle below them (the board's wk-loop): a quiet
// track and the dots that run along it.
export function CycleRail({ className, radius }: CycleRailProps) {
  return (
    <svg aria-hidden="true" className={`rail-frame ${className}`}>
      <rect className="rail-track" x="0" y="0" width="100%" height="100%" rx={radius} />
      <rect className="rail-flow" x="0" y="0" width="100%" height="100%" rx={radius} />
    </svg>
  );
}
