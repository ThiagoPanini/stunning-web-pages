// O fim da Home: 03 · Principais soluções, 04 · Comece e o rodapé, cada um contra o seu recorte da
// Captura de referência, mais os links do fim da página e a largura dos três blocos.

import type { Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { type BlockName, expectBandToMatchReference, WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

const OWN_BLOCKS: BlockName[] = ["solutions", "start", "footer"];

// Each band must also sit where the reference's sits, so it depends on every block above it: the same
// block one subpixel higher or lower draws some of its lines one pixel off.
const BANDS: [BlockName, string][] = [
  ["solutions", "Principais soluções"],
  ["start", "Comece"],
  ["footer", "Rodapé"],
];

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

for (const width of WIDTHS) {
  for (const [block, title] of BANDS) {
    test(`${title} bate com a referência em ${width} px`, async ({ referencePage }) => {
      const page = await referencePage(width);
      await expectBandToMatchReference(page, { width, from: block });
    });
  }

  test(`"Voltar ao topo" leva ao início da página em ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const backToTop = page
      .locator('[data-block="footer"]')
      .getByRole("link", { name: "Voltar ao topo ↑", exact: true });
    await backToTop.scrollIntoViewIfNeeded();
    expect(await scrollY(page)).toBeGreaterThan(0);
    await backToTop.click();
    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test(`o fim da Home não transborda na horizontal em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    expect(await spilledElements(page, width, OWN_BLOCKS)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

// Links to Telas the design does not have yet (Lacunas), and the button whose action does not exist.
const INERT_LINKS: [BlockName, string][] = [
  ["start", "Testar um guardrail"],
  ["start", "Ver integrações →"],
  ["footer", "Dados"],
  ["footer", "Playground"],
  ["footer", "Integrações"],
];

test("os links do fim da Home para Telas que não existem não navegam", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/");
  for (const [block, name] of INERT_LINKS) {
    const link = page.locator(`[data-block="${block}"]`).getByRole("link", { name, exact: true });
    await link.scrollIntoViewIfNeeded();
    const before = { url: page.url(), scrollY: await scrollY(page) };
    // Playwright waits for an aria-disabled element to be enabled before clicking it; a person can click
    // it all the same, so the click skips that wait and lands on the link with the mouse.
    await link.click({ force: true });
    expect({ url: page.url(), scrollY: await scrollY(page) }, name).toEqual(before);
    await expect(link, name).toHaveAttribute("aria-disabled", "true");
  }
});
