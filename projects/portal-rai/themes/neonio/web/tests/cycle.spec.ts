// The integrated cycle: the block against the reference capture, its five anchor tabs and the scroll-spy
// that marks the step in view.

import type { Page } from "@playwright/test";
import {
  type BlockName,
  expectBandToMatchReference,
  WIDTHS,
  type Width,
} from "./support/reference";
import { test } from "./support/test";

// The board's own heights of the blocks above the cycle, measured under the capture conditions, to the
// 1/64 px of the layout. The reference rounds its boxes to the pixel, so a block that stands in with the
// rounded height (standInForEmptyBlocks) leaves the cycle a fraction of a pixel off, and its text lands
// on other pixels (13,240 differ at 1440 px). With these heights the band starts at the same fraction as
// the reference's.
const BOARD_HEIGHTS: Record<Width, Partial<Record<BlockName, number>>> = {
  1440: { brands: 101, solutions: 932 + 19 / 64 },
  390: { brands: 101, solutions: 2157 + 30 / 64 },
};

// The Home under the conditions of the reference captures, each block above the cycle that is still
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
  test(`the cycle matches the reference at ${width} px, "Atacar" current`, async ({
    referencePage,
  }) => {
    const page = await homeAtReferenceConditions(referencePage, width);
    await expectBandToMatchReference(page, { width, from: "cycle" });
  });
}
