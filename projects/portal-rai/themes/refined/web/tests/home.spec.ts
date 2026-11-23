// The Home as a whole: the blocks in the board's order, the page's health, and the motion of the parts
// every block shares: the chip strip and the scroll progress bar, still with reduced motion.

import type { Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { BLOCKS, WIDTHS } from "./support/reference";
import { expect, load, type Motion, scrollThrough, test } from "./support/test";

// The blocks of the Home and everything in them; not what Next adds to the body, such as its hidden
// route announcer.
const PAGE_ELEMENTS = "[data-block], [data-block] *";

const MOTIONS: [Motion, string][] = [
  ["no-preference", "with motion"],
  ["reduce", "with reduced motion"],
];

test("the Home lays out its blocks in the board's order", async ({ page }) => {
  await page.goto("/");
  const blocks = await page
    .locator("[data-block]")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-block")));
  expect(blocks).toEqual([...BLOCKS]);
});

for (const width of WIDTHS) {
  for (const [motion, label] of MOTIONS) {
    test(`the Home is healthy at ${width} px ${label}`, async ({ newWindow, baseURL }) => {
      const origin = new URL(baseURL ?? "").origin;
      const page = await newWindow(width, { motion });
      const consoleErrors: string[] = [];
      const failed: string[] = [];
      const outside: string[] = [];
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
        if (url.protocol !== "data:" && url.origin !== origin) outside.push(request.url());
      });

      await load(page, "/");
      await scrollThrough(page);
      await page.waitForLoadState("networkidle");

      // Soft: a sick page reports every problem at once.
      expect.soft(consoleErrors, "console errors").toEqual([]);
      expect.soft(failed, "failed requests").toEqual([]);
      expect.soft(outside, "requests outside the local server").toEqual([]);
      expect
        .soft(
          await page.evaluate(() =>
            [...document.fonts].some(
              (face) =>
                face.family.replace(/"/g, "") === "Instrument Sans" && face.status === "loaded",
            ),
          ),
          "Instrument Sans loaded from the local server",
        )
        .toBe(true);
      // After the scroll left every reveal in its final place.
      expect
        .soft(await spilledElements(page, width), "elements outside the page width")
        .toEqual([]);
      expect
        .soft(await page.evaluate(() => document.documentElement.scrollWidth), "scrollable width")
        .toBe(width);
    });
  }

  test(`with reduced motion, the chip strip stands still, the progress bar stays hidden and the Home shows its final state (${width} px)`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { motion: "reduce" });
    await load(page, "/");

    // 400 ms is a fair stretch of the strip's run with motion (see the test below).
    const [before, after] = await twoInstants(page, 400);
    expect.soft(after.equals(before), "the chip strip stayed still").toBe(true);

    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: "instant" }),
    );
    expect.soft(await progressWidth(page), "width of the progress bar halfway down").toBe(0);

    // Nothing waits for the scroll: no animation runs anywhere in the page, and nothing below the fold
    // is hidden or faded.
    expect.soft(await page.evaluate(() => document.getAnimations().length), "animations").toBe(0);
    const faded = await page.locator(PAGE_ELEMENTS).evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.opacity !== "1" || style.visibility !== "visible";
        })
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect(faded, "faded or hidden elements").toEqual([]);
  });

  test(`with normal motion, the chip strip runs and the progress bar grows with the scroll (${width} px)`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { motion: "no-preference" });
    await load(page, "/");

    const [before, after] = await twoInstants(page, 400);
    expect.soft(after.equals(before), "the chip strip stayed still").toBe(false);
    // Under the pointer the strip pauses.
    await page.getByRole("group", { name: "O que os guardrails avaliam" }).hover();
    const [hovered, stillHovered] = await twoInstants(page, 400);
    expect.soft(stillHovered.equals(hovered), "the hovered chip strip stayed still").toBe(true);
    await page.mouse.move(0, 0);

    expect.soft(await progressWidth(page), "width of the progress bar at the top").toBe(0);
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await expect.poll(() => progressWidth(page), "width at the bottom").toBe(width);
  });
}

// Two pictures of the chip strip, the given time apart.
async function twoInstants(page: Page, gapMs: number): Promise<[Buffer, Buffer]> {
  const strip = page.getByRole("group", { name: "O que os guardrails avaliam" });
  const first = await strip.screenshot();
  await page.waitForTimeout(gapMs);
  return [first, await strip.screenshot()];
}

// The drawn width of the header's progress bar, in whole pixels.
function progressWidth(page: Page): Promise<number> {
  return page
    .locator('[data-block="header"] > [aria-hidden="true"]')
    .evaluate((bar) => Math.round(bar.getBoundingClientRect().width));
}
