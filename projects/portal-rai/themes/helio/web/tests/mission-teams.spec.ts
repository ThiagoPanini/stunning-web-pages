// 01 · Missão e 02 · Times: a faixa das duas seções contra a Captura de referência, o movimento guiado
// pelo scroll (as palavras do título que acendem, os cartões que entram dos lados), o estado final com
// movimento reduzido e nenhum transbordo horizontal.

import type { BrowserContext, Locator, Page } from "@playwright/test";
import { expectBandToMatchReference, WIDTHS, type Width } from "./support/reference";
import { test as base, expect } from "./support/test";

// The colors of the Missão title's words before and after they light up (unlit and bright).
const UNLIT = "rgb(90, 104, 112)";
const BRIGHT = "rgb(238, 241, 242)";

// The window of each width under test: a desktop and a phone.
const WINDOW_HEIGHT: Record<Width, number> = { 1440: 900, 390: 844 };

type Motion = "reduce" | "no-preference";

const test = base.extend<{ openHome: (width: Width, motion: Motion) => Promise<Page> }>({
  openHome: async ({ browser, baseURL }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (width, motion) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: WINDOW_HEIGHT[width] },
        reducedMotion: motion,
      });
      contexts.push(context);
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      return page;
    });
    for (const context of contexts) await context.close();
  },
});

// Scrolls the window to `top` and waits two frames, so the scroll-driven animations catch up.
async function scrollTo(page: Page, top: number) {
  await page.evaluate(async (y) => {
    window.scrollTo(0, y);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, top);
}

function titleWords(page: Page): Locator {
  return page.locator('[data-block="mission"] h2 > span');
}

function wordColors(page: Page): Promise<string[]> {
  return titleWords(page).evaluateAll((words) => words.map((word) => getComputedStyle(word).color));
}

// Where each team card is on screen, transforms included, and how opaque it is.
function cardPlacements(page: Page) {
  return page.locator('[data-block="teams"] article').evaluateAll((cards) =>
    cards.map((card) => {
      const { left, right, top } = card.getBoundingClientRect();
      return {
        left: Math.round(left),
        right: Math.round(right),
        top: top + window.scrollY,
        opacity: getComputedStyle(card).opacity,
      };
    }),
  );
}

// The left and right edges of the Times block, where the cards end up.
function teamsEdges(page: Page) {
  return page.locator('[data-block="teams"]').evaluate((block) => {
    const { left, right } = block.getBoundingClientRect();
    return { left: Math.round(left), right: Math.round(right) };
  });
}

for (const width of WIDTHS) {
  test(`a Missão e os Times batem com a referência em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "mission", to: "teams" });
  });

  test(`com movimento, as palavras do título da Missão acendem uma depois da outra ao rolar (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "no-preference");
    await expect(titleWords(page)).toHaveText(["Pesquisar, ", "desenvolver, ", "implementar."]);
    const titleTop = await page
      .locator('[data-block="mission"] h2')
      .evaluate((title) => title.getBoundingClientRect().top + window.scrollY);

    // From the top of the page until the title reaches the top of the window, 20px at a time.
    const seen: string[][] = [];
    for (let top = 0; top <= titleTop; top += 20) {
      await scrollTo(page, top);
      seen.push(await wordColors(page));
    }

    expect(seen[0], "antes de o título entrar na janela").toEqual([UNLIT, UNLIT, UNLIT]);
    expect(seen.at(-1), "com o título no alto da janela").toEqual([BRIGHT, BRIGHT, BRIGHT]);
    expect(seen, "há um momento com a primeira palavra acesa e a última apagada").toContainEqual([
      BRIGHT,
      expect.any(String),
      UNLIT,
    ]);
    const litAt = [0, 1, 2].map((word) => seen.findIndex((colors) => colors[word] === BRIGHT));
    expect(litAt[0], "a primeira acende antes da segunda").toBeLessThan(litAt[1]);
    expect(litAt[1], "a segunda acende antes da terceira").toBeLessThan(litAt[2]);
  });

  test(`com movimento, os cartões dos Times entram dos lados e chegam à posição final (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "no-preference");
    const edges = await teamsEdges(page);

    // Before they enter the window, the cards are hidden and pushed out to their sides.
    const [red, blue] = await cardPlacements(page);
    expect(red, "Red Team antes de entrar").toMatchObject({ left: edges.left - 80, opacity: "0" });
    expect(blue, "Blue Team antes de entrar").toMatchObject({
      right: edges.right + 80,
      opacity: "0",
    });

    // With each card whole in the window, it sits at its side of the block, fully opaque.
    await scrollTo(page, red.top - 20);
    expect((await cardPlacements(page))[0], "Red Team na janela").toMatchObject({
      left: edges.left,
      opacity: "1",
    });
    await scrollTo(page, blue.top - 20);
    expect((await cardPlacements(page))[1], "Blue Team na janela").toMatchObject({
      right: edges.right,
      opacity: "1",
    });
  });

  test(`com movimento reduzido, a Missão e os Times aparecem no estado final sem rolar (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "reduce");
    const blocks = page.locator('[data-block="mission"], [data-block="teams"]');
    const animated = await blocks.evaluateAll(
      (elements) => elements.flatMap((block) => block.getAnimations({ subtree: true })).length,
    );
    expect(animated, "animações nas duas seções").toBe(0);
    const translucent = await blocks.evaluateAll((elements) =>
      elements
        .flatMap((block) => [block, ...block.querySelectorAll("*")])
        .filter((element) => getComputedStyle(element).opacity !== "1")
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect(translucent, "elementos não opacos").toEqual([]);
    expect(await wordColors(page)).toEqual([BRIGHT, BRIGHT, BRIGHT]);
    const edges = await teamsEdges(page);
    const [red, blue] = await cardPlacements(page);
    expect(red.left, "Red Team no lugar").toBe(edges.left);
    expect(blue.right, "Blue Team no lugar").toBe(edges.right);
  });

  test(`a Missão e os Times não transbordam na horizontal em ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    // Every element stays between the edges of its block, and no content spills out of its box.
    const outside = await page
      .locator('[data-block="mission"], [data-block="teams"]')
      .evaluateAll((blocks) =>
        blocks.flatMap((block) => {
          const edge = block.getBoundingClientRect();
          return [...block.querySelectorAll("*")]
            .filter((element) => {
              const box = element.getBoundingClientRect();
              const spills = element.clientWidth > 0 && element.scrollWidth > element.clientWidth;
              return box.left < edge.left - 0.5 || box.right > edge.right + 0.5 || spills;
            })
            .map((element) => element.outerHTML.slice(0, 80));
        }),
      );
    expect(outside).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
