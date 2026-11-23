// The test of every spec file: Playwright's, pointed at the static server of global-setup, plus two ways
// to open the app: `referencePage`, under the conditions of the reference captures, and `newWindow`, a
// browser window of a given size and motion preference.
//
// Each block of the page has its own spec file (header-hero.spec.ts, and one per later block), so tickets
// that fill different blocks add their tests without editing a shared file.

import { type BrowserContext, test as base, type Page, type Response } from "@playwright/test";
import { loadAtReferenceConditions, referenceContextOptions } from "./reference";

export type Motion = "reduce" | "no-preference";

// The window of each width under test, a desktop and a phone; any other width opens 900px tall.
const WINDOW_HEIGHT: Record<number, number> = { 1440: 900, 390: 844 };

type WindowOptions = {
  height?: number;
  motion?: Motion;
  hasTouch?: boolean;
};

// A new window, not navigated yet, so a test can listen to the page before its first request.
export type NewWindow = (width: number, options?: WindowOptions) => Promise<Page>;

type Fixtures = {
  referencePage: (width: number, path?: string) => Promise<Page>;
  newWindow: NewWindow;
};

export const test = base.extend<Fixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright reads a fixture's dependencies from this pattern
  baseURL: async ({}, use) => {
    const url = process.env.REFINED_BASE_URL;
    if (!url) throw new Error("REFINED_BASE_URL is not set: run the tests through `pnpm test`.");
    await use(url);
  },
  referencePage: async ({ browser, baseURL }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (width, path = "/") => {
      const context = await browser.newContext({
        ...referenceContextOptions(width),
        baseURL,
      });
      contexts.push(context);
      const page = await context.newPage();
      await loadAtReferenceConditions(page, width, path);
      return page;
    });
    for (const context of contexts) await context.close();
  },
  newWindow: async ({ browser, baseURL }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (width, { height = WINDOW_HEIGHT[width] ?? 900, motion, hasTouch } = {}) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height },
        reducedMotion: motion,
        hasTouch,
      });
      contexts.push(context);
      return context.newPage();
    });
    for (const context of contexts) await context.close();
  },
});

// Opens a path of the app and waits for the network to rest and the fonts to load.
export async function load(page: Page, path: string): Promise<Response | null> {
  const response = await page.goto(path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return response;
}

// Scrolls from the top to the bottom of the page, one half window at a time, waiting two frames at each
// stop so the scroll-driven animations catch up. The jumps are instant: with motion, the page scrolls
// smoothly (html { scroll-behavior: smooth }), and a smooth scroll would still be moving at each stop.
export async function scrollThrough(page: Page): Promise<void> {
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

export { expect } from "@playwright/test";
