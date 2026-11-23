// Mission and Teams: the band of both sections against the reference capture, the scroll-driven motion
// (the title words that light up, the cards that slide in from the sides), the final state with reduced
// motion, and no horizontal spill.

import type { Locator, Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { expectBandToMatchReference, WIDTHS, type Width } from "./support/reference";
import { test as base, expect, load, type Motion } from "./support/test";

// The colors of the Mission title's words before and after they light up (unlit and bright).
const UNLIT = "rgb(90, 104, 112)";
const BRIGHT = "rgb(238, 241, 242)";

const test = base.extend<{ openHome: (width: Width, motion: Motion) => Promise<Page> }>({
  openHome: async ({ newWindow }, use) => {
    await use(async (width, motion) => {
      const page = await newWindow(width, { motion });
      await load(page, "/");
      return page;
    });
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

// The left and right edges of the Teams block, where the cards end up.
function teamsEdges(page: Page) {
  return page.locator('[data-block="teams"]').evaluate((block) => {
    const { left, right } = block.getBoundingClientRect();
    return { left: Math.round(left), right: Math.round(right) };
  });
}

for (const width of WIDTHS) {
  test(`Mission and Teams match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "mission", to: "teams" });
  });

  test(`with motion, the Mission title words light up one after the other on scroll (${width} px)`, async ({
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

    expect(seen[0], "before the title enters the window").toEqual([UNLIT, UNLIT, UNLIT]);
    expect(seen.at(-1), "with the title at the top of the window").toEqual([
      BRIGHT,
      BRIGHT,
      BRIGHT,
    ]);
    expect(seen, "there is a moment with the first word lit and the last one unlit").toContainEqual(
      [BRIGHT, expect.any(String), UNLIT],
    );
    const litAt = [0, 1, 2].map((word) => seen.findIndex((colors) => colors[word] === BRIGHT));
    expect(litAt[0], "the first lights up before the second").toBeLessThan(litAt[1]);
    expect(litAt[1], "the second lights up before the third").toBeLessThan(litAt[2]);
  });

  test(`with motion, the Teams cards slide in from the sides and reach their final place (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "no-preference");
    const edges = await teamsEdges(page);

    // Before they enter the window, the cards are hidden and pushed out to their sides.
    const [red, blue] = await cardPlacements(page);
    expect(red, "Red Team before it enters").toMatchObject({ left: edges.left - 80, opacity: "0" });
    expect(blue, "Blue Team before it enters").toMatchObject({
      right: edges.right + 80,
      opacity: "0",
    });

    // With each card whole in the window, it sits at its side of the block, fully opaque.
    await scrollTo(page, red.top - 20);
    expect((await cardPlacements(page))[0], "Red Team in the window").toMatchObject({
      left: edges.left,
      opacity: "1",
    });
    await scrollTo(page, blue.top - 20);
    expect((await cardPlacements(page))[1], "Blue Team in the window").toMatchObject({
      right: edges.right,
      opacity: "1",
    });
  });

  test(`with reduced motion, Mission and Teams show their final state without scrolling (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "reduce");
    const blocks = page.locator('[data-block="mission"], [data-block="teams"]');
    const animated = await blocks.evaluateAll(
      (elements) => elements.flatMap((block) => block.getAnimations({ subtree: true })).length,
    );
    expect(animated, "animations in both sections").toBe(0);
    const translucent = await blocks.evaluateAll((elements) =>
      elements
        .flatMap((block) => [block, ...block.querySelectorAll("*")])
        .filter((element) => getComputedStyle(element).opacity !== "1")
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect(translucent, "elements not fully opaque").toEqual([]);
    expect(await wordColors(page)).toEqual([BRIGHT, BRIGHT, BRIGHT]);
    const edges = await teamsEdges(page);
    const [red, blue] = await cardPlacements(page);
    expect(red.left, "Red Team in place").toBe(edges.left);
    expect(blue.right, "Blue Team in place").toBe(edges.right);
  });

  test(`Mission and Teams do not spill sideways at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    expect(await spilledElements(page, width, ["mission", "teams"])).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
