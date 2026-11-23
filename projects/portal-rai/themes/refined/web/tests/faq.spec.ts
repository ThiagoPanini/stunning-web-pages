// Perguntas frequentes: the accordion against the reference capture, and how it opens, closes and is
// driven from the keyboard.

import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { spilledElements } from "./support/overflow";
import {
  expectImageToMatch,
  readReference,
  WIDTHS,
  type Width,
} from "./support/reference";
import { expect, test } from "./support/test";

// The top of the FAQ block in the Home board, unrounded, under the conditions of the pull (measured on
// 2026-11-23 from origin/boards/HomeRefined.dc.html; the reference record keeps it rounded).
const BOARD_TOP: Record<Width, number> = { 1440: 6506.6875, 390: 7031.78125 };

// The band of an image from y, as tall as height, edge to edge.
function crop(image: PNG, y: number, height: number): PNG {
  const band = new PNG({ width: image.width, height });
  image.data.copy(band.data, 0, y * image.width * 4, (y + height) * image.width * 4);
  return band;
}

// The unrounded top and height of the FAQ block on the page.
function faqBox(page: Page) {
  return page.locator('[data-block="faq"]').evaluate((element) => {
    const { y, height } = element.getBoundingClientRect();
    return { top: y + window.scrollY, height };
  });
}

for (const width of WIDTHS) {
  test(`the FAQ matches the reference at ${width} px, with the first question open`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    const reference = await readReference(width);
    const expected = reference.blocks.faq;

    // The block is compared with its own crop of the reference. Until every block above it is drawn,
    // it sits higher on the page than in the board, at another fraction of a pixel, and the edges of
    // its boxes and lines round to other pixels. It is moved down by less than a pixel, to the
    // fraction it has in the board; once the blocks above match theirs, it moves by nothing.
    const before = await faqBox(page);
    const shift = (((BOARD_TOP[width] - before.top) % 1) + 1) % 1;
    await page
      .locator('[data-block="faq"]')
      .evaluate((element, margin) => element.style.setProperty("margin-top", `${margin}px`), shift);
    const { top, height } = await faqBox(page);
    expect(top % 1, "fraction of the block's top").toBeCloseTo(BOARD_TOP[width] % 1, 5);

    const appBox = { y: Math.round(top), height: Math.round(top + height) - Math.round(top) };
    expect.soft(appBox.height, `height of the FAQ at ${width} px`).toBe(expected.height);
    const actual = PNG.sync.read(
      await page.screenshot({
        clip: { x: 0, y: appBox.y, width, height: appBox.height },
        animations: "disabled",
      }),
    );
    await expectImageToMatch(
      `faq-${width}`,
      actual,
      crop(reference.image, expected.y, expected.height),
    );
  });
}
