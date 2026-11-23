// Integrations, Data, the closing call and the footer: the last band of the Home against the reference
// capture, how the bento and the features reflow when narrow, where the footer's links go, and the
// links and buttons the design left open.

import type { Page } from "@playwright/test";
import {
  type BlockName,
  expectBandToMatchReference,
  WIDTHS,
  type Width,
} from "./support/reference";
import { test } from "./support/test";

// The board's own heights of the blocks above Integrations, measured under the capture conditions, to
// the 1/64 px of the layout. The reference rounds its boxes to the pixel, so a block that stands in with
// the rounded height (standInForEmptyBlocks) leaves Integrations a fraction of a pixel off, and the
// half-pixel edges of the bento's placeholders draw differently. With these heights the band starts at
// the same fraction as the reference's.
const BOARD_HEIGHTS: Record<Width, Partial<Record<BlockName, number>>> = {
  1440: { brands: 101, solutions: 932 + 19 / 64, cycle: 3498 + 32 / 64 },
  390: { brands: 101, solutions: 2157 + 30 / 64, cycle: 3836 + 26 / 64 },
};

// The Home under the conditions of the reference captures, each block above Integrations that is still
// empty (no ticket has filled it yet) standing in with the board's height. A filled block is left alone:
// once the Home is whole, this is the plain reference page.
async function homeAtReferenceConditions(
  referencePage: (width: number) => Promise<Page>,
  width: Width,
): Promise<Page> {
  const page = await referencePage(width);
  const stoodIn = await page.evaluate((heights) => {
    let count = 0;
    for (const [name, height] of Object.entries(heights)) {
      const block = document.querySelector(`[data-block="${name}"]`);
      if (block instanceof HTMLElement && block.childElementCount === 0) {
        block.style.display = "block";
        block.style.height = `${height}px`;
        count++;
      }
    }
    return count;
  }, BOARD_HEIGHTS[width]);
  if (stoodIn > 0) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width, height });
  }
  return page;
}

for (const width of WIDTHS) {
  test(`integrations match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await homeAtReferenceConditions(referencePage, width);
    await expectBandToMatchReference(page, { width, from: "integrations" });
  });

  test(`data match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await homeAtReferenceConditions(referencePage, width);
    await expectBandToMatchReference(page, { width, from: "data" });
  });

  // From the top of Data to the bottom of the page: the space above the closing call is its own, and no
  // block holds it.
  test(`the closing call and the footer match the reference at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await homeAtReferenceConditions(referencePage, width);
    await expectBandToMatchReference(page, { width, from: "data", to: "footer" });
  });
}
