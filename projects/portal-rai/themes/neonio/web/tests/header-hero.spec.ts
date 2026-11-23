// Header and hero: the band at the top of the Home against the reference capture, how the header
// behaves when the page scrolls, how the hero stacks when narrow, and where its links go.

import type { Locator, Page } from "@playwright/test";
import {
  expectBandToMatchReference,
  readReferenceRecord,
  regionBox,
  WIDTHS,
} from "./support/reference";
import { expect, type NewWindow, test } from "./support/test";

for (const width of WIDTHS) {
  test(`header and hero match the reference at ${width} px, the logo aside`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    // The logo is drawn by its own ticket, and logo.spec.ts compares it; everything around it,
    // its legend included, is compared here.
    await expectBandToMatchReference(page, { width, from: "header", to: "hero", mask: ["logo"] });
  });

  test(`the logo's square sits where the reference has it at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    const reference = await readReferenceRecord(width);
    expect(await regionBox(page, "logo")).toEqual(reference.regions.logo);
  });
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("element has no box");
  return box;
}

// Where the header sits after the page scrolled down 300px, in a 400px tall window.
async function headerAfterScroll(newWindow: NewWindow, width: number) {
  const page = await newWindow(width, { height: 400, motion: "reduce" });
  await page.goto("/");
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
  return boxOf(page.locator('[data-block="header"]'));
}

for (const width of [761, 1440]) {
  test(`above 760 px the header sticks to the top (${width} px)`, async ({ newWindow }) => {
    expect((await headerAfterScroll(newWindow, width)).y).toBe(0);
  });
}

for (const width of [760, 390]) {
  test(`at 760 px or less the header scrolls with the page (${width} px)`, async ({
    newWindow,
  }) => {
    expect((await headerAfterScroll(newWindow, width)).y).toBe(-300);
  });
}

test("only the header's blocks take the pointer: around them, clicks reach the page", async ({
  newWindow,
}) => {
  const page = await newWindow(1440);
  await page.goto("/");
  const header = page.locator('[data-block="header"]');
  expect(await header.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  for (const name of ["Responsible AI", "Contato", "Testar um guardrail", "Dados"]) {
    const link = header.getByRole("link", { name, exact: true });
    expect(
      await link.evaluate((element) => getComputedStyle(element).pointerEvents),
      `pointer events of "${name}"`,
    ).toBe("auto");
  }
});

// The title, the logo's square and the legend of the hero, in a window of the given width.
async function heroParts(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  const hero = page.locator('[data-block="hero"]');
  return {
    title: await boxOf(hero.getByRole("heading", { level: 1 })),
    logo: await boxOf(hero.locator('[data-region="logo"]')),
  };
}

test("above 900 px the hero has two columns, the logo on the right", async ({ page }) => {
  const { title, logo } = await heroParts(page, 901);
  expect(logo.x).toBeGreaterThanOrEqual(title.x + title.width);
  expect(logo.y).toBeLessThan(title.y + title.height);
});

for (const width of [900, 760, 390]) {
  test(`at ${width} px the hero stacks, the logo first, centered and at most 520 px wide`, async ({
    page,
  }) => {
    const { title, logo } = await heroParts(page, width);
    expect(logo.y + logo.height).toBeLessThanOrEqual(title.y);
    expect(logo.width).toBeLessThanOrEqual(520);
    expect(logo.x + logo.width / 2).toBeCloseTo(width / 2, 0);
  });
}

test('the brand goes back to the top of the page, and "Contato" to the footer', async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { height: 400, motion: "reduce" });
  await page.goto("/");
  const header = page.locator('[data-block="header"]');
  await expect(header.getByRole("link", { name: "Contato", exact: true })).toHaveAttribute(
    "href",
    "#contato",
  );
  await expect(page.locator("#contato")).toHaveAttribute("data-block", "footer");

  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
  await header.getByRole("link", { name: "Responsible AI", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

// Links to screens the design does not have yet, and buttons whose action does not exist.
const INERT_LINKS: [string, string][] = [
  ["header", "Dados"],
  ["header", "Playground"],
  ["header", "Integrações"],
  ["header", "Testar um guardrail"],
  ["hero", "Testar um guardrail"],
  ["hero", "Ver os dados"],
];

test("the header's and the hero's links to what does not exist go nowhere", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "reduce" });
  await page.goto("/");
  const url = page.url();
  for (const [block, name] of INERT_LINKS) {
    const link = page.locator(`[data-block="${block}"]`).getByRole("link", { name, exact: true });
    await expect(link, `${name} (${block})`).toHaveAttribute("aria-disabled", "true");
    // Playwright waits for an aria-disabled element to be enabled before clicking it; a person can click
    // it all the same, so the click skips that wait and lands on the link with the mouse.
    await link.click({ force: true });
    expect(page.url(), `${name} (${block}) stays on the page`).toBe(url);
    expect(await page.evaluate(() => window.scrollY), `${name} (${block}) does not scroll`).toBe(0);
  }
});
