type CycleLoopProps = {
  // Where the loop sits around the steps: thread-loop or cards-loop (globals.css).
  className: string;
  // The corner radius of the loop, in px.
  radius: number;
};

// The dotted loop that closes the cycle around the steps: a quiet track and the dots that run along it.
export function CycleLoop({ className, radius }: CycleLoopProps) {
  return (
    <svg aria-hidden="true" className={`loop ${className}`}>
      <rect className="loop-track" x="0" y="0" width="100%" height="100%" rx={radius} />
      <rect className="loop-flow" x="0" y="0" width="100%" height="100%" rx={radius} />
    </svg>
  );
}
