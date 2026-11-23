// Cabeçalho e abertura: a faixa do topo da Home contra a Captura de referência, e o comportamento do
// cabeçalho em tela estreita e em ponteiro grosso.

import type { Browser, Locator } from "@playwright/test";
import { expectBandToMatchReference, readReference, regionBox, WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

for (const width of WIDTHS) {
  test(`cabeçalho e abertura batem com a referência em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    // The logo included: with reduced motion it rests on the frame the reference shows.
    await expectBandToMatchReference(page, { width, from: "header", to: "hero" });
  });

  test(`o lugar do logo é o da referência em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    const reference = await readReference(width);
    expect(await regionBox(page, "logo")).toEqual(reference.regions.logo);
  });
}

// Where the header and its parts sit after the page scrolled down 300px, in a 400px tall window.
async function headerAfterScroll(browser: Browser, baseURL: string | undefined, width: number) {
  const context = await browser.newContext({ baseURL, viewport: { width, height: 400 } });
  const page = await context.newPage();
  await page.goto("/");
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
  const header = page.locator('[data-block="header"]');
  const box = async (locator: Locator) => {
    const found = await locator.boundingBox();
    if (!found) throw new Error("elemento sem caixa");
    return found;
  };
  const result = {
    header: await box(header),
    brand: await box(header.getByRole("link", { name: "Responsible AI" })),
    nav: await box(header.getByRole("navigation", { name: "Principal" })),
    button: await box(header.getByRole("link", { name: "Testar um guardrail" })),
  };
  await context.close();
  return result;
}

for (const width of [761, 1440]) {
  test(`acima de 760 px o cabeçalho fica no topo e a navegação divide a linha (${width} px)`, async ({
    browser,
    baseURL,
  }) => {
    const { header, brand, nav, button } = await headerAfterScroll(browser, baseURL, width);
    expect(header.y).toBe(0);
    expect(nav.y).toBeLessThan(brand.y + brand.height);
    expect(nav.y).toBeLessThan(button.y + button.height);
  });
}

for (const width of [760, 390]) {
  test(`em 760 px ou menos o cabeçalho rola com a página e a navegação ganha uma linha (${width} px)`, async ({
    browser,
    baseURL,
  }) => {
    const { header, brand, nav, button } = await headerAfterScroll(browser, baseURL, width);
    expect(header.y).toBe(-300);
    expect(nav.y).toBeGreaterThanOrEqual(brand.y + brand.height);
    expect(nav.y).toBeGreaterThanOrEqual(button.y + button.height);
  });
}

test("em ponteiro grosso os links da navegação crescem para 44 px", async ({
  browser,
  baseURL,
}) => {
  const heights = async (hasTouch: boolean) => {
    const context = await browser.newContext({
      baseURL,
      hasTouch,
      viewport: { width: 390, height: 800 },
    });
    const page = await context.newPage();
    await page.goto("/");
    const links = page.getByRole("navigation", { name: "Principal" }).getByRole("link");
    const result = await links.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    );
    await context.close();
    return result;
  };
  expect(await heights(false)).toEqual([36, 36, 36, 36]);
  expect(await heights(true)).toEqual([44, 44, 44, 44]);
});
