// The Home as a whole: the blocks in the board's order, the export of both routes, the whole page
// against the reference capture, the page's health and reduced motion. The Home's screenshots come
// from here: each comparison checks that its own, in screenshots/, is the Home as it is now;
// `pnpm test --update-snapshots` rewrites it.

import { access } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { OUT_DIR } from "./support/global-setup";
import { spilledElements } from "./support/overflow";
import { BLOCKS, expectImageToMatch, readReference, WIDTHS } from "./support/reference";
import { expectSavedScreenshot } from "./support/screenshots";
import { expect, load, type Motion, test } from "./support/test";

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

test("the export has the Home and the design system route as static files", async ({ page }) => {
  for (const file of ["index.html", "design-system.html"]) {
    await expect(access(join(OUT_DIR, file)), `out/${file}`).resolves.toBeUndefined();
  }
  for (const path of ["/", "/design-system"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
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
      });

      await load(page, "/");
      await scrollThrough(page);
      await page.waitForLoadState("networkidle");

      // Soft: a sick page reports every problem at once.
      expect.soft(consoleErrors, "console errors").toEqual([]);
      expect.soft(failed, "failed requests").toEqual([]);
      expect.soft(outside, "requests outside the local server").toEqual([]);
      expect
        .soft(await spilledElements(page, width), "elements outside the page width")
        .toEqual([]);
      expect
        .soft(await page.evaluate(() => document.documentElement.scrollWidth), "scrollable width")
        .toBe(width);
    });
  }

  test(`with reduced motion, the logo and the brands stay still, nothing eases and the Home shows its final state (${width} px)`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { motion: "reduce" });
    await load(page, "/");

    const logo = page.getByRole("img", { name: /versão Ondas/ });
    const brands = page.getByRole("region", { name: "Marcas" });
    const before = [await logo.screenshot(), await brands.screenshot()];
    // 400 ms is almost 5 frames of the logo's drawing, and a fair stretch of the brands' run with motion.
    await page.waitForTimeout(400);
    expect.soft((await logo.screenshot()).equals(before[0]), "the logo stayed still").toBe(true);
    expect
      .soft((await brands.screenshot()).equals(before[1]), "the brands stayed still")
      .toBe(true);

    // Nothing moves or eases: no animation or transition runs anywhere in the page, and no element
    // would take time to change.
    expect.soft(await page.evaluate(() => document.getAnimations().length), "animations").toBe(0);
    const easing = await page.locator(PAGE_ELEMENTS).evaluateAll((elements) =>
      elements
        .filter((element) =>
          getComputedStyle(element)
            .transitionDuration.split(", ")
            .some((duration) => duration !== "0s"),
        )
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect.soft(easing, "elements that ease their changes").toEqual([]);

    // Nothing waits for the scroll: nothing below the fold is hidden or faded. The icons of the cycle's
    // tabs are drawn at .85, the board's own opacity for them, and the one value of the design below 1.
    const faded = await page.locator(PAGE_ELEMENTS).evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          const tabIcon =
            element instanceof SVGSVGElement &&
            element.closest('nav[aria-label="Etapas do ciclo"]') !== null &&
            style.opacity === "0.85";
          return (style.opacity !== "1" && !tabIcon) || style.visibility !== "visible";
        })
        .map((element) => `${getComputedStyle(element).opacity} ${element.outerHTML.slice(0, 80)}`),
    );
    expect(faded, "faded or hidden elements").toEqual([]);
  });
}

test("the text uses the design's families, from the app's own font files", async ({
  newWindow,
}) => {
  const page = await newWindow(1440);
  const files: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.endsWith(".woff2")) files.push(pathname.replace(/^.*\/([a-z_]+)\..*$/, "$1"));
  });
  await load(page, "/");
  const loaded = await page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === "loaded")
      .map((face) => face.family.replace(/["']/g, ""))
      .sort(),
  );
  // The header and the hero draw in three families; the logo brings Geist Mono. Next preloads the
  // four files of the layout's fonts.
  expect(loaded).toEqual(["Geist Mono", "Inter", "Inter Tight", "JetBrains Mono"]);
  expect([...new Set(files)].sort()).toEqual([
    "geist_mono_latin",
    "inter_latin",
    "inter_tight_latin",
    "jetbrains_mono_latin",
  ]);
});

// Scrolls from the top to the bottom of the page, one half window at a time, waiting two frames at
// each stop so anything that follows the scroll catches up.
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
