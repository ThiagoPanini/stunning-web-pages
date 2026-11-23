// The end of the Home: Na prática, No portal, Contato and the footer, each against its own cut of the
// reference capture, plus the links and the form the design left without a destination, and the width of
// the four blocks.

import { type BlockName, expectBandToMatchReference, WIDTHS } from "./support/reference";
import { test } from "./support/test";

// Each band must also sit where the reference's sits, so it depends on every block above it.
const BANDS: [BlockName, string][] = [
  ["practice", "Na prática"],
  ["portal", "No portal"],
  ["contact", "Contato"],
  ["footer", "The footer"],
];

for (const width of WIDTHS) {
  for (const [block, title] of BANDS) {
    test(`${title} matches the reference at ${width} px`, async ({ referencePage }) => {
      const page = await referencePage(width);
      await expectBandToMatchReference(page, { width, from: block });
    });
  }
}
