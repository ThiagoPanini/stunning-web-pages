// The Home as a whole: the blocks in the board's order, the export of both routes and the page's
// health. The comparison of the whole Home with its reference capture, and the Home's screenshots,
// come once every block is filled (support/reference.ts and support/screenshots.ts have what they use).

import { access } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { OUT_DIR } from "./support/global-setup";
import { spilledElements } from "./support/overflow";
import { BLOCKS, WIDTHS } from "./support/reference";
import { expect, load, type Motion, test } from "./support/test";

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
  expect(loaded).toEqual(["Inter", "Inter Tight", "JetBrains Mono"]);
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
