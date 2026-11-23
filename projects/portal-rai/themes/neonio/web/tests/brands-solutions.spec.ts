// Brands and solutions: the two blocks after the hero against the reference capture, the marquee's
// motion, the sample brands as the design writes them, and no horizontal spill.

import type { Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { expectBandToMatchReference, WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

for (const width of WIDTHS) {
  test(`brands match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "brands" });
  });

  test(`solutions match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "solutions" });
  });
}

// The marquee's sliding part, the parent of the two lists, and how far it has slid, in px.
function track(page: Page) {
  return page.locator('[data-block="brands"] ul').first().locator("..");
}

function offset(page: Page): Promise<number> {
  return track(page).evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
}

// Two readings of the offset, 400ms apart.
async function offsetsOverTime(page: Page): Promise<[number, number]> {
  const first = await offset(page);
  await page.waitForTimeout(400);
  return [first, await offset(page)];
}

test("with motion, the brands slide left and pause while the pointer is over them", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await page.goto("/");
  await page.mouse.move(0, 0);
  const [before, after] = await offsetsOverTime(page);
  expect(after, "the track slides left").toBeLessThan(before);

  await page.locator('[data-block="brands"]').hover();
  await page.waitForTimeout(100);
  const [hovered, stillHovered] = await offsetsOverTime(page);
  expect(stillHovered, "the track stays put under the pointer").toBe(hovered);

  await page.mouse.move(0, 0);
  const [left, later] = await offsetsOverTime(page);
  expect(later, "the track slides again once the pointer leaves").toBeLessThan(left);
});

test("with reduced motion, the brands stay still", async ({ newWindow }) => {
  const page = await newWindow(1440, { motion: "reduce" });
  await page.goto("/");
  await page.mouse.move(0, 0);
  const [before, after] = await offsetsOverTime(page);
  expect([before, after]).toEqual([0, 0]);
});

test("the sample brands read as the design writes them, once", async ({ newWindow }) => {
  const page = await newWindow(1440);
  await page.goto("/");
  // The track's second copy of the list is hidden from assistive technology, so the band reads once.
  const brands = page.getByRole("region", { name: "Marcas" }).getByRole("listitem");
  await expect(brands).toHaveText([
    "[MARCA 1]",
    "[MARCA 2]",
    "[MARCA 3]",
    "[MARCA 4]",
    "[MARCA 5]",
    "[MARCA 6]",
    "[MARCA 7]",
    "[MARCA 8]",
  ]);
});

// The two widths under test and the breakpoints where the solutions' grids change.
for (const width of [...WIDTHS, 1100, 640]) {
  test(`brands and solutions do not spill sideways at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    expect(await spilledElements(page, width, ["brands", "solutions"])).toEqual([]);
  });
}
