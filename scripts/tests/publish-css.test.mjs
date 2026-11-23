import assert from 'node:assert/strict';
import { test } from 'node:test';
import { previewCss } from '../publish.mjs';

// What a Tailwind 4 export can hold: an animation that runs unless reduced motion stops it, one that waits
// for no-preference, the token variables and a font face.
const APP_CSS = `:root{--color-ink:#101010;--animate-band:band 40s linear infinite}
@font-face{font-family:Aurora Sans;src:url(/aurora.woff2)format("woff2")}
.band{animation:var(--animate-band)}
@media (prefers-reduced-motion:reduce){.band{animation:none}}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}.rise{animation:rise .8s}}
@keyframes band{to{transform:translateX(-50%)}}
`;

const flat = (css) => css.replace(/\s+/g, '');

test('the previews take the reduced-motion state: what reduce sets applies, what waits for no-preference goes', async () => {
  const css = flat(await previewCss(APP_CSS, new Set(['--color-ink'])));
  // The band's animation is still declared, and the reduce rule's "none" comes after it and wins.
  const running = css.indexOf('animation:var(--animate-band)');
  assert.ok(running >= 0 && css.lastIndexOf('animation:none') > running, css);
  assert.doesNotMatch(css, /scroll-behavior|\.rise|prefers-reduced-motion/);
});

test('the previews leave out what tokens.css declares: the token variables and the font faces', async () => {
  const css = flat(await previewCss(APP_CSS, new Set(['--color-ink'])));
  assert.doesNotMatch(css, /--color-ink:|@font-face/);
  assert.match(css, /--animate-band:band40slinearinfinite/);
});
