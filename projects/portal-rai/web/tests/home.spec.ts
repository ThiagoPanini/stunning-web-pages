// The Home as a whole, with the board's defaults: the blocks in the board's order, the whole page against
// the reference capture, the page's health and reduced motion. The Home's screenshots come from here:
// each comparison checks that its own, in screenshots/, is the Home as it is now;
// `pnpm test --update-snapshots` rewrites it. The other versions of the tweaks are in fidelity.spec.ts.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { spilledElements } from "./support/overflow";
import { BLOCKS, expectImageToMatch, ORIGIN_DIR, readReference, WIDTHS } from "./support/reference";
import { expectSavedScreenshot } from "./support/screenshots";
import { expect, load, type Motion, test } from "./support/test";

// What moves into place on load or on scroll: with reduced motion it all stands in its final state.
// Other parts of the page wait at opacity 0 for a hover or a step in focus, as the board draws them.
const REVEALS =
  ".enter-1, .enter-2, .enter-3, .enter-4, .reveal-1, .reveal-2, .slide-from-left, .slide-from-right, .fade-on-exit, .dotted-ground";

const MOTIONS: [Motion, string][] = [
  ["no-preference", "with motion"],
  ["reduce", "with reduced motion"],
];

test("the Home's tab says what the board's title says", async ({ page }) => {
  const board = readFileSync(join(ORIGIN_DIR, "boards", "Main.dc.html"), "utf8");
  const title = /<title>([^<]*)<\/title>/.exec(board)?.[1];
  expect(title, "the board's <title>").toBe("Responsible AI · Home");
  await page.goto("/");
  await expect(page).toHaveTitle(title ?? "");
});

test("the Home lays out its blocks in the board's order", async ({ page }) => {
  await page.goto("/");
  const blocks = await page
    .locator("[data-block]")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-block")));
  expect(blocks).toEqual([...BLOCKS]);
});

for (const width of WIDTHS) {
  // The limit and its reason are next to MAX_DIFF_PIXEL_RATIO, in support/reference.ts.
  test(`the whole Home matches the reference capture at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    const reference = await readReference(width);
    const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
    await expectImageToMatch(`home-${width}`, PNG.sync.read(screenshot), reference.image);
    // Only a screenshot that matched the reference is kept.
    await expectSavedScreenshot(`home-${width}`, screenshot);
  });

  for (const [motion, label] of MOTIONS) {
    test(`the Home is healthy at ${width} px ${label}`, async ({ newWindow, baseURL }) => {
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
      expect.soft(consoleErrors, "console errors").toEqual([]);
      expect.soft(failed, "failed requests").toEqual([]);
      expect.soft(outside, "requests outside the local server").toEqual([]);
      expect.soft(fonts, "both fonts come from the local server").toHaveLength(2);
      // After the scroll left every reveal in its final place.
      expect
        .soft(await spilledElements(page, width), "elements outside the page width")
        .toEqual([]);
      expect
        .soft(await page.evaluate(() => document.documentElement.scrollWidth), "scrollable width")
        .toBe(width);
    });
  }

  test(`with reduced motion, the logo stays still and the Home shows its final state without scrolling (${width} px)`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { motion: "reduce" });
    await load(page, "/");

    const logo = page.getByRole("img", { name: /versão Ondas/ });
    const first = await logo.screenshot();
    // 400 ms is almost 5 frames of the logo's drawing.
    await page.waitForTimeout(400);
    expect.soft((await logo.screenshot()).equals(first), "the logo stayed still").toBe(true);

    // Nothing waits for the scroll: no animation runs anywhere in the page, and nothing below the fold
    // is hidden or faded.
    expect.soft(await page.evaluate(() => document.getAnimations().length), "animations").toBe(0);
    const faded = await page.locator(REVEALS).evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.opacity !== "1" || style.visibility !== "visible";
        })
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect(faded, "faded or hidden elements").toEqual([]);
  });
}

// Scrolls from the top to the bottom of the page, one window at a time, waiting two frames at each stop
// so the scroll-driven animations catch up. Instantly: with normal motion the page scrolls smoothly, as
// the board does, and a smooth scroll would still be on its way.
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const frames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const bottom = document.documentElement.scrollHeight - window.innerHeight;
    for (let top = 0; top < bottom; top += window.innerHeight / 2) {
      window.scrollTo({ top, behavior: "instant" });
      await frames();
    }
    window.scrollTo({ top: bottom, behavior: "instant" });
    await frames();
  });
}
