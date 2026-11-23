// Times, Ciclo and Soluções: the band of the three sections against the reference capture, the cycle
// step titles that light up on scroll, their final state with reduced motion, the media placeholders of
// the team cards, and no horizontal spill.

import { expectBandToMatchReference, WIDTHS } from "./support/reference";
import { test } from "./support/test";

for (const width of WIDTHS) {
  test(`Times matches the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "teams" });
  });
}
