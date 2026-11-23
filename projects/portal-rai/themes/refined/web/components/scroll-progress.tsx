// The cream bar along the bottom edge of its frame that grows with the page scroll (rf-prog), decorative:
// from zero width at the top of the page to the whole width at the bottom. With reduced motion, or where
// the browser has no scroll-driven animations, it stays at zero width. Its frame is positioned.
export function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="scroll-progress absolute inset-x-0 -bottom-px h-0.5 bg-cream"
    />
  );
}
