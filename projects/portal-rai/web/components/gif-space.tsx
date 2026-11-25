type GifSpaceProps = {
  // What a screen reader says the space is for: "Espaço reservado para o GIF do Red Team, proporção 16:9".
  label: string;
  // The two lines written in the middle of the space: what goes there, and its size.
  lines: [string, string];
  // Classes from the parent, such as its share of a row.
  className?: string;
};

// A space left for a GIF made elsewhere (tm-gif), as the design leaves it: 16:9, dashed and striped,
// with what goes there written in the middle. It stays a space: the GIFs are a gap of the design. As in
// the board, its width and proportion are those of its inside, and the dashed border adds 2px to each
// (DESIGN.md, Observações).
export function GifSpace({ label, lines, className = "" }: GifSpaceProps) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={`gif-stripes relative m-0 box-content grid aspect-gif w-full place-items-center overflow-hidden rounded-6 border border-rule-strong border-dashed bg-night ${className}`}
    >
      <span
        aria-hidden="true"
        className="flex flex-col items-center gap-1.5 px-3 text-center font-medium font-mono text-11 text-subtle uppercase leading-140 tracking-wide-140"
      >
        <span>{lines[0]}</span>
        <span>{lines[1]}</span>
      </span>
    </figure>
  );
}
