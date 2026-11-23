// A Home como um todo: os blocos na ordem do Quadro, a página inteira contra a Captura de referência, a
// saúde da página e o movimento reduzido. As Capturas da Home saem daqui: cada comparação que passa
// regrava a sua em screenshots/, e como a Home bate com a referência byte a byte, o arquivo só muda
// quando a página muda.

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import {
  BLOCKS,
  MAX_DIFF_PIXEL_RATIO,
  PIXEL_THRESHOLD,
  readReference,
  WIDTHS,
  type Width,
} from "./support/reference";
import { expect, test } from "./support/test";

const SCREENSHOTS_DIR = join(import.meta.dirname, "..", "..", "screenshots");

// The window of each width under test: a desktop and a phone.
const WINDOW_HEIGHT: Record<Width, number> = { 1440: 900, 390: 844 };

// The blocks of the Home and everything in them; not what Next adds to the body, such as its hidden
// route announcer.
const PAGE_ELEMENTS = "[data-block], [data-block] *";

type Motion = "reduce" | "no-preference";
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
    const actual = PNG.sync.read(screenshot);
    const name = `home-${width}`;
    await test.info().attach(`${name}-expected.png`, {
      body: PNG.sync.write(reference.image),
      contentType: "image/png",
    });
    await test.info().attach(`${name}-actual.png`, { body: screenshot, contentType: "image/png" });

    expect(
      { width: actual.width, height: actual.height },
      `tamanho da Home em ${width} px`,
    ).toEqual({ width: reference.width, height: reference.height });

    const diff = new PNG({ width: actual.width, height: actual.height });
    const differing = pixelmatch(
      actual.data,
      reference.image.data,
      diff.data,
      actual.width,
      actual.height,
      { threshold: PIXEL_THRESHOLD },
    );
    await test.info().attach(`${name}-diff.png`, {
      body: PNG.sync.write(diff),
      contentType: "image/png",
    });
    const total = actual.width * actual.height;
    test.info().annotations.push({
      type: "diff",
      description: `${name}: ${differing} de ${total} pixels diferem`,
    });
    expect(
      differing / total,
      `${differing} de ${total} pixels diferem na Home em ${width} px`,
    ).toBeLessThanOrEqual(MAX_DIFF_PIXEL_RATIO);

    // Only a Captura that matched the reference is kept.
    await mkdir(SCREENSHOTS_DIR, { recursive: true });
    await writeFile(join(SCREENSHOTS_DIR, `${name}.png`), screenshot);
  });

  for (const [motion, label] of MOTIONS) {
    test(`a Home é saudável em ${width} px ${label}`, async ({ browser, baseURL }) => {
      const origin = new URL(baseURL ?? "").origin;
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: WINDOW_HEIGHT[width] },
        reducedMotion: motion,
      });
      const page = await context.newPage();
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

      await page.goto("/", { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await scrollThrough(page);
      await page.waitForLoadState("networkidle");

      // Soft: a sick page reports every problem at once.
      expect.soft(consoleErrors, "erros de console").toEqual([]);
      expect.soft(failed, "requisições que falharam").toEqual([]);
      expect.soft(outside, "requisições para fora do servidor local").toEqual([]);
      expect.soft(fonts, "as duas fontes vêm do servidor local").toHaveLength(2);
      // The page clips its sides (overflow-x: clip), which would hide a spill; so each element is
      // checked, after the scroll left every reveal in its final place. A spill is what the user would
      // see past the page's edges: what a frame inside the page hides is not one.
      expect
        .soft(await spilledElements(page, width), "elementos fora da largura da página")
        .toEqual([]);
      expect
        .soft(await page.evaluate(() => document.documentElement.scrollWidth), "largura rolável")
        .toBe(width);
      await context.close();
    });
  }

  test(`com movimento reduzido, o logo fica parado e a Home aparece no estado final sem rolar (${width} px)`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: WINDOW_HEIGHT[width] },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

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
    await context.close();
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

// Elements of the page whose visible part leaves [0, width], the page's own edges. The visible part is
// the box cut sideways by each ancestor inside the blocks that clips its overflow, such as the logo's
// frame, which hides the marks of the animated drawing that grow past it; the page's own clip, above the
// blocks, is the one this check sees past. A positioned element escapes the clips between it and its
// containing block, so those are skipped; an ancestor not known to contain it is skipped too, which can
// only report more.
function spilledElements(page: Page, width: number) {
  return page.locator(PAGE_ELEMENTS).evaluateAll(
    (elements, pageWidth) =>
      elements
        .filter((element) => {
          let { left, right } = element.getBoundingClientRect();
          let position = getComputedStyle(element).position;
          let ancestor = element;
          while (!ancestor.hasAttribute("data-block") && ancestor.parentElement) {
            ancestor = ancestor.parentElement;
            const style = getComputedStyle(ancestor);
            const contains =
              position === "fixed"
                ? style.transform !== "none"
                : position === "absolute"
                  ? style.position !== "static" || style.transform !== "none"
                  : true;
            if (!contains) continue;
            position = style.position;
            if (style.overflowX === "visible") continue;
            const clip = ancestor.getBoundingClientRect();
            left = Math.max(left, clip.left);
            right = Math.min(right, clip.right);
          }
          return right > left && (left < -0.5 || right > pageWidth + 0.5);
        })
        .map((element) => element.outerHTML.slice(0, 120)),
    width,
  );
}
