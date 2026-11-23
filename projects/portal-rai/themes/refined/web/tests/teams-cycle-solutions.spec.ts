// Times, Ciclo and Soluções: the band of the three sections against the reference capture, the cycle
// step titles that light up on scroll, their final state with reduced motion, the media placeholders of
// the team cards, and no horizontal spill.

import type { Locator, Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { expectBandToMatchReference, WIDTHS, type Width } from "./support/reference";
import { test as base, expect, load, type Motion } from "./support/test";

// The colors of a cycle step title before and after it lights up (unlit and bright).
const UNLIT = "rgb(134, 132, 126)";
const BRIGHT = "rgb(243, 241, 236)";

const test = base.extend<{ openHome: (width: Width, motion: Motion) => Promise<Page> }>({
  openHome: async ({ newWindow }, use) => {
    await use(async (width, motion) => {
      const page = await newWindow(width, { motion });
      await load(page, "/");
      return page;
    });
  },
});

// Scrolls the window to `top` and waits two frames, so the scroll-driven animations catch up. The jump
// is instant: with motion, the page scrolls smoothly.
async function scrollTo(page: Page, top: number) {
  await page.evaluate(async (y) => {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, top);
}

function stepTitles(page: Page): Locator {
  return page.locator('[data-block="cycle"] ol h3');
}

// The red channel of an rgb() color: between UNLIT and BRIGHT it grows with the light.
function redOf(color: string): number {
  return Number(color.match(/\d+/)?.[0]);
}

function titleColors(page: Page): Promise<string[]> {
  return stepTitles(page).evaluateAll((titles) =>
    titles.map((title) => getComputedStyle(title).color),
  );
}

// The colors of the cycle step titles at each stop of a scroll down the page, `step` px at a time, from
// the first title entering the window until the last one reaches its top. Each jump is instant and waits
// two frames, as scrollTo does. The whole walk runs in the page, in one call: a call per stop, a hundred
// round trips, outlasted the test's time on a loaded machine.
function titleColorsOnTheWayDown(page: Page, step: number): Promise<string[][]> {
  return stepTitles(page).evaluateAll(async (titles, gap) => {
    const frames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const topOf = (title: Element) => title.getBoundingClientRect().top + window.scrollY;
    const first = topOf(titles[0]);
    const last = topOf(titles[titles.length - 1]);
    const seen: string[][] = [];
    for (let top = first - window.innerHeight; top <= last; top += gap) {
      window.scrollTo({ top, behavior: "instant" });
      await frames();
      seen.push(titles.map((title) => getComputedStyle(title).color));
    }
    return seen;
  }, step);
}

const BLOCKS = '[data-block="teams"], [data-block="cycle"], [data-block="solutions"]';

// The cards that rise into place: the two team cards and the four solution frames.
function risingCards(page: Page): Locator {
  return page.locator('[data-block="teams"] article, [data-block="solutions"] li');
}

const FINAL_STATE = { opacity: "1", drop: 0 };

// How opaque each card is, and how far below its place its transform draws it, in px.
function cardStates(cards: Locator) {
  return cards.evaluateAll((elements) =>
    elements.map((element) => {
      const { opacity, transform } = getComputedStyle(element);
      return { opacity, drop: new DOMMatrix(transform).m42 };
    }),
  );
}

for (const width of WIDTHS) {
  test(`Times matches the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "teams" });
  });

  test(`Ciclo matches the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "cycle" });
  });

  test(`Soluções matches the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "solutions" });
  });

  test(`with motion, the cycle step titles light up one after the other on scroll (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "no-preference");
    await expect(stepTitles(page)).toHaveText([
      "Atacar os agentes antes que alguém de fora ataque",
      "Encontrar onde o agente cede e registrar tudo",
      "Transformar a falha em guardrail testável, versionado e medido",
      "Proteger cada conversa em produção e em tempo real",
      "Acompanhar o resultado todos os dias",
    ]);
    expect(await titleColors(page), "at the top of the page").toEqual(Array(5).fill(UNLIT));

    // From the first title entering the window until the last one reaches the top, 20px at a time.
    const seen = await titleColorsOnTheWayDown(page, 20);

    expect(seen[0], "as the first title enters the window").toEqual(Array(5).fill(UNLIT));
    expect(seen.at(-1), "with the last title at the top of the window").toEqual(
      Array(5).fill(BRIGHT),
    );
    // Each title fades from unlit to bright over a stretch of the scroll, which may overlap the next
    // one's: at every stop, a title is at most as bright as the one above it (the red channel grows
    // from 134 to 243), and each one is fully lit at a later stop than the one above it.
    const darker = seen.filter((colors) =>
      colors.some((color, step) => step > 0 && redOf(color) > redOf(colors[step - 1])),
    );
    expect(darker, "stops where a title is brighter than the one above it").toEqual([]);
    const litAt = [0, 1, 2, 3, 4].map((step) =>
      seen.findIndex((colors) => colors[step] === BRIGHT),
    );
    for (let step = 1; step < litAt.length; step++) {
      expect(litAt[step], `title ${step + 1} lights up after title ${step}`).toBeGreaterThan(
        litAt[step - 1],
      );
    }
  });

  test(`with motion, the team and solution cards rise into place as they enter the window (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "no-preference");
    const cards = risingCards(page);
    await expect(cards).toHaveCount(6);

    // Below the window, each card waits hidden, 24px under its place.
    expect(await cardStates(cards), "before they enter").toEqual(
      Array(6).fill({ opacity: "0", drop: 24 }),
    );

    // With a card whole in the window, it is in its place and fully opaque.
    const tops = await cards.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().top + window.scrollY),
    );
    for (const [index, top] of tops.entries()) {
      await scrollTo(page, top - 40);
      expect((await cardStates(cards))[index], `card ${index + 1} in the window`).toEqual(
        FINAL_STATE,
      );
    }
  });

  test(`with reduced motion, Times, Ciclo and Soluções show their final state without scrolling (${width} px)`, async ({
    openHome,
  }) => {
    const page = await openHome(width, "reduce");
    const blocks = page.locator(BLOCKS);
    const animated = await blocks.evaluateAll(
      (elements) => elements.flatMap((block) => block.getAnimations({ subtree: true })).length,
    );
    expect(animated, "animations in the three sections").toBe(0);
    const translucent = await blocks.evaluateAll((elements) =>
      elements
        .flatMap((block) => [block, ...block.querySelectorAll("*")])
        .filter((element) => getComputedStyle(element).opacity !== "1")
        .map((element) => element.outerHTML.slice(0, 80)),
    );
    expect(translucent, "elements not fully opaque").toEqual([]);
    expect(await titleColors(page), "cycle step titles").toEqual(Array(5).fill(BRIGHT));
    expect(await cardStates(risingCards(page)), "team and solution cards").toEqual(
      Array(6).fill(FINAL_STATE),
    );
  });

  test(`the team cards keep their media placeholders (${width} px)`, async ({ referencePage }) => {
    const page = await referencePage(width);
    const teams = page.locator('[data-block="teams"]');
    await expect(teams.locator("img, picture, video, iframe, canvas, object, embed")).toHaveCount(
      0,
    );
    for (const article of await teams.locator("article").all()) {
      await expect(article.getByText("inserir vídeo · 16:10")).toBeVisible();
    }
    await expect(teams.getByRole("heading", { level: 3 })).toHaveText(["Red Team", "Blue Team"]);
  });

  test(`Times, Ciclo and Soluções do not spill sideways at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    expect(await spilledElements(page, width, ["teams", "cycle", "solutions"])).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test('"Ver o ciclo" takes the page to the cycle, clear of the header', async ({ openHome }) => {
  const page = await openHome(1440, "reduce");
  await page.getByRole("link", { name: "Ver o ciclo" }).click();
  await expect(page).toHaveURL(/#ciclo$/);
  await expect
    .poll(() =>
      page
        .locator('[data-block="cycle"]')
        .evaluate((block) => Math.round(block.getBoundingClientRect().top)),
    )
    .toBe(72);
});
