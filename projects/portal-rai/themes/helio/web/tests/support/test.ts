// The test of every spec file: Playwright's, pointed at the static server of global-setup, plus
// `referencePage`, which opens the app under the conditions of the Capturas de referência.
//
// Each block of the page has its own spec file (header-hero.spec.ts, and one per later block), so tickets
// that fill different blocks add their tests without editing a shared file.

import { test as base, type Page } from "@playwright/test";
import { loadAtReferenceConditions, referenceContextOptions } from "./reference";

type Fixtures = {
  referencePage: (width: number, path?: string) => Promise<Page>;
};

export const test = base.extend<Fixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright reads a fixture's dependencies from this pattern
  baseURL: async ({}, use) => {
    const url = process.env.HELIO_BASE_URL;
    if (!url) throw new Error("HELIO_BASE_URL não definida: rode os testes por `pnpm test`.");
    await use(url);
  },
  referencePage: async ({ browser, baseURL }, use) => {
    const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
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
});

export { expect } from "@playwright/test";
