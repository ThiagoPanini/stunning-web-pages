// A Home como um todo: os blocos na ordem do Quadro, a página inteira contra a Captura de referência, a
// saúde da página e o movimento reduzido. As Capturas da Home saem daqui: cada comparação confere que a
// sua, em screenshots/, é a Home de agora, e `pnpm test --update-snapshots` a regrava.

import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { spilledElements } from "./support/overflow";
import { BLOCKS, expectImageToMatch, readReference, WIDTHS } from "./support/reference";
import { expectSavedScreenshot } from "./support/screenshots";
import { expect, load, type Motion, test } from "./support/test";

// The blocks of the Home and everything in them; not what Next adds to the body, such as its hidden
// route announcer.
const PAGE_ELEMENTS = "[data-block], [data-block] *";

const MOTIONS: [Motion, string][] = [
  ["no-preference", "com movimento"],
  ["reduce", "com movimento reduzido"],
];

test("a Home compõe os blocos na ordem do Quadro", async ({ page }) => {
  await page.goto("/");
  const blocks = await page
    .locator("[data-block]")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-block")));
  expect(blocks).toEqual([...BLOCKS]);
});

for (const width of WIDTHS) {
  // The limit and its reason are next to MAX_DIFF_PIXEL_RATIO, in support/reference.ts.
  test(`a Home inteira bate com a Captura de referência em ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    const reference = await readReference(width);
    const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
    await expectImageToMatch(`home-${width}`, PNG.sync.read(screenshot), reference.image);
    // Only a Captura that matched the reference is kept.
    await expectSavedScreenshot(`home-${width}`, screenshot);
  });

  for (const [motion, label] of MOTIONS) {
    test(`a Home é saudável em ${width} px ${label}`, async ({ newWindow, baseURL }) => {
      const origin = new URL(baseURL ?? "").origin;
      const page = await newWindow(width, { motion });
      const consoleErrors: string[] = [];
      const failed: string[] = [];
      const outside: string[] = [];
      const fonts: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      page.on("requestfailed", (request) =>
        failed.push(`${request.url()} (${request.failure()?.errorText})`),
      );
      page.on("response", (response) => {
        if (response.status() >= 400) failed.push(`${response.url()} (${response.status()})`);
      });
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.protocol === "data:") return;
        if (url.origin !== origin) outside.push(request.url());
        else if (url.pathname.endsWith(".woff2")) fonts.push(url.pathname);
      });

      await load(page, "/");
      await scrollThrough(page);
      await page.waitForLoadState("networkidle");

      // Soft: a sick page reports every problem at once.
      expect.soft(consoleErrors, "erros de console").toEqual([]);
      expect.soft(failed, "requisições que falharam").toEqual([]);
      expect.soft(outside, "requisições para fora do servidor local").toEqual([]);
      expect.soft(fonts, "as duas fontes vêm do servidor local").toHaveLength(2);
      // After the scroll left every reveal in its final place.
      expect
        .soft(await spilledElements(page, width), "elementos fora da largura da página")
        .toEqual([]);
      expect
        .soft(await page.evaluate(() => document.documentElement.scrollWidth), "largura rolável")
        .toBe(width);
    });
  }

  test(`com movimento reduzido, o logo fica parado e a Home aparece no estado final sem rolar (${width} px)`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { motion: "reduce" });
    await load(page, "/");

    const logo = page.getByRole("img", { name: /versão Eclusa/ });
    const first = await logo.screenshot();
    // 400 ms is almost 5 frames of the logo's drawing.
    await page.waitForTimeout(400);
    expect.soft((await logo.screenshot()).equals(first), "o logo ficou parado").toBe(true);

    // Nothing waits for the scroll: no animation runs anywhere in the page, and nothing below the fold
    // is hidden or faded. The parts of an SVG drawing carry their own opacity, as the logo's do.
    expect.soft(await page.evaluate(() => document.getAnimations().length), "animações").toBe(0);
    const faded = await page.locator(PAGE_ELEMENTS).evaluateAll((elements) =>
      elements
        .filter((element) => !(element instanceof SVGElement && element.ownerSVGElement))
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.opacity !== "1" || style.visibility !== "visible";
        })
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect(faded, "elementos apagados ou escondidos").toEqual([]);
  });
}

// Scrolls from the top to the bottom of the page, one window at a time, waiting two frames at each stop
// so the scroll-driven animations catch up.
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const frames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const bottom = document.documentElement.scrollHeight - window.innerHeight;
    for (let top = 0; top < bottom; top += window.innerHeight / 2) {
      window.scrollTo(0, top);
      await frames();
    }
    window.scrollTo(0, bottom);
    await frames();
  });
}
