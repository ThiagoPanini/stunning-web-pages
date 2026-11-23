// Header and hero: the band at the top of the Home against the reference capture, and how the header
// behaves in a narrow window and on a coarse pointer.

import type { Locator } from "@playwright/test";
import { expectBandToMatchReference, readReference, regionBox, WIDTHS } from "./support/reference";
import { expect, type NewWindow, test } from "./support/test";

for (const width of WIDTHS) {
  test(`header and hero match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    // The logo included: with reduced motion it rests on the frame the reference shows.
    await expectBandToMatchReference(page, { width, from: "header", to: "hero" });
  });

  test(`the logo sits where the reference has it at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    const reference = await readReference(width);
    expect(await regionBox(page, "logo")).toEqual(reference.regions.logo);
  });
}

// Where the header and its parts sit after the page scrolled down 300px, in a 400px tall window.
async function headerAfterScroll(newWindow: NewWindow, width: number) {
  const page = await newWindow(width, { height: 400 });
  await page.goto("/");
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
  const header = page.locator('[data-block="header"]');
  const box = async (locator: Locator) => {
    const found = await locator.boundingBox();
    if (!found) throw new Error("element has no box");
    return found;
  };
  return {
    header: await box(header),
    brand: await box(header.getByRole("link", { name: "Responsible AI" })),
    nav: await box(header.getByRole("navigation", { name: "Principal" })),
    button: await box(header.getByRole("link", { name: "Testar um guardrail" })),
  };
}

for (const width of [761, 1440]) {
  test(`above 760 px the header sticks to the top and the nav shares its row (${width} px)`, async ({
    newWindow,
  }) => {
    const { header, brand, nav, button } = await headerAfterScroll(newWindow, width);
    expect(header.y).toBe(0);
    expect(nav.y).toBeLessThan(brand.y + brand.height);
    expect(nav.y).toBeLessThan(button.y + button.height);
  });
}

for (const width of [760, 390]) {
  test(`at 760 px or less the header scrolls with the page and the nav gets a row of its own (${width} px)`, async ({
    newWindow,
  }) => {
    const { header, brand, nav, button } = await headerAfterScroll(newWindow, width);
    expect(header.y).toBe(-300);
    expect(nav.y).toBeGreaterThanOrEqual(brand.y + brand.height);
    expect(nav.y).toBeGreaterThanOrEqual(button.y + button.height);
  });
}

test("on a coarse pointer the nav links grow to 44 px", async ({ newWindow }) => {
  const heights = async (hasTouch: boolean) => {
    const page = await newWindow(390, { height: 800, hasTouch });
    await page.goto("/");
    const links = page.getByRole("navigation", { name: "Principal" }).getByRole("link");
    return links.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    );
  };
  expect(await heights(false)).toEqual([36, 36, 36, 36]);
  expect(await heights(true)).toEqual([44, 44, 44, 44]);
});
