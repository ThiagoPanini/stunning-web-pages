// The integrated cycle: the block against the reference capture, its five anchor tabs and the scroll-spy
// that marks the step in view.

import type { Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import {
  type BlockName,
  expectBandToMatchReference,
  readReferenceRecord,
  WIDTHS,
  type Width,
} from "./support/reference";
import { expect, load, type Motion, type NewWindow, test } from "./support/test";

// The board's own heights of the blocks above the cycle, measured under the capture conditions, to the
// 1/64 px of the layout. The reference rounds its boxes to the pixel, so a block that stands in with the
// rounded height (standInForEmptyBlocks) leaves the cycle a fraction of a pixel off, and its text lands
// on other pixels (13,240 differ at 1440 px). With these heights the band starts at the same fraction as
// the reference's.
const BOARD_HEIGHTS: Record<Width, Partial<Record<BlockName, number>>> = {
  1440: { brands: 101, solutions: 932 + 19 / 64 },
  390: { brands: 101, solutions: 2157 + 30 / 64 },
};

// The Home under the conditions of the reference captures, each block above the cycle that is still
// empty (no ticket has filled it yet) standing in with the board's height. A filled block is left alone:
// once the Home is whole, this is the plain reference page.
async function homeAtReferenceConditions(
  referencePage: (width: number) => Promise<Page>,
  width: Width,
): Promise<Page> {
  const page = await referencePage(width);
  const stoodIn = await page.evaluate((heights) => {
    let count = 0;
    for (const [name, height] of Object.entries(heights)) {
      const block = document.querySelector(`[data-block="${name}"]`);
      if (block instanceof HTMLElement && block.childElementCount === 0) {
        block.style.display = "block";
        block.style.height = `${height}px`;
        count++;
      }
    }
    return count;
  }, BOARD_HEIGHTS[width]);
  if (stoodIn > 0) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width, height });
  }
  return page;
}

// The board's own height of the cycle, to the 1/64 px: the reference rounds it, and the blocks below
// start a fraction off when it is not exact.
const BOARD_CYCLE_HEIGHT: Record<Width, number> = { 1440: 3498 + 32 / 64, 390: 3836 + 26 / 64 };

for (const width of WIDTHS) {
  test(`the cycle matches the reference at ${width} px, "Atacar" current`, async ({
    referencePage,
  }) => {
    const page = await homeAtReferenceConditions(referencePage, width);
    await expectBandToMatchReference(page, { width, from: "cycle" });
  });

  test(`the cycle is as tall as the board's at ${width} px, to the fraction`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    const height = await page
      .locator('[data-block="cycle"]')
      .evaluate((block) => block.getBoundingClientRect().height);
    expect(height).toBe(BOARD_CYCLE_HEIGHT[width]);
  });

  test(`nothing in the cycle spills sideways at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    expect(await spilledElements(page, width, ["cycle"])).toEqual([]);
  });
}

const TAB_NAMES = ["Atacar", "Descobrir", "Desenvolver", "Proteger", "Medir"];

// The five tabs of the cycle's bar, in order.
function cycleTabs(page: Page) {
  return page.getByRole("navigation", { name: "Etapas do ciclo" }).getByRole("link");
}

function cycleTab(page: Page, name: string) {
  return cycleTabs(page).filter({ hasText: name });
}

// The names of the tabs that say they are current (aria-current="step"). Every other tab must say it is
// not (aria-current="false"), or the list says so.
function currentTabs(page: Page): Promise<string[]> {
  return cycleTabs(page).evaluateAll((tabs) =>
    tabs
      .filter((tab) => tab.getAttribute("aria-current") !== "false")
      .map((tab) => `${tab.textContent} (${tab.getAttribute("aria-current")})`),
  );
}

// The step a tab leads to, through its anchor.
async function stepOf(page: Page, name: string) {
  const href = await cycleTab(page, name).getAttribute("href");
  if (!href?.startsWith("#")) throw new Error(`the ${name} tab is no anchor: ${href}`);
  return page.locator(href);
}

async function boxOf(locator: ReturnType<Page["locator"]>) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("element has no box");
  return box;
}

// The bottom edge of the tab bar and the top edge of a step, in the window.
async function barBottom(page: Page): Promise<number> {
  const box = await boxOf(page.getByRole("navigation", { name: "Etapas do ciclo" }));
  return box.y + box.height;
}

async function stepTop(page: Page, name: string): Promise<number> {
  return (await boxOf(await stepOf(page, name))).y;
}

// Where the top of a step sits below the bottom of the tab bar, to the pixel.
async function stepBelowBar(page: Page, name: string): Promise<number> {
  // (+ 0 turns -0 into 0.)
  return Math.round((await stepTop(page, name)) - (await barBottom(page))) + 0;
}

// Scrolls the page so that the top of a step sits `offset` px below the bottom of the tab bar. The bar
// moves with the page until it sticks, so the step first goes to the top of the window, where the bar is
// stuck over it; then the scroll is measured again until it lands.
async function scrollStepBelowBar(page: Page, name: string, offset: number) {
  const top = await stepTop(page, name);
  await page.evaluate((by) => window.scrollBy(0, by), top);
  await expect
    .poll(async () => {
      const delta = (await stepBelowBar(page, name)) - offset;
      if (delta !== 0) await page.evaluate((by) => window.scrollBy(0, by), delta);
      return stepBelowBar(page, name);
    })
    .toBe(offset);
}

// A step reached through its tab stops right under the bar: the board's scroll margin (118px, or 64px
// at 760px and less) is 1px short of the bar's bottom, so the step's top hides under the bar's lower
// rule, and the scroll lands on a whole pixel.
async function expectStepUnderBar(page: Page, name: string) {
  await expect
    .poll(
      async () => {
        const gap = (await stepTop(page, name)) - (await barBottom(page));
        return gap >= -2 && gap <= 0 ? "under the bar" : `${gap}px below the bar`;
      },
      { message: `where the ${name} step's top stops` },
    )
    .toBe("under the bar");
}

// Opens the Home in a window. Each block still empty (no ticket has filled it yet) stands in with the
// reference's height, so the page runs on past the cycle as the whole Home does and the last step can
// reach the bar. A filled block is left alone: once the Home is whole, this is the plain Home.
async function openHome(
  newWindow: NewWindow,
  width: number,
  options: { motion: Motion; height?: number },
): Promise<Page> {
  const page = await newWindow(width, options);
  await load(page, "/");
  const { blocks } = await readReferenceRecord(width === 390 ? 390 : 1440);
  await page.evaluate((boxes) => {
    for (const [name, { height }] of Object.entries(boxes)) {
      const block = document.querySelector(`[data-block="${name}"]`);
      if (block instanceof HTMLElement && block.childElementCount === 0) {
        block.style.display = "block";
        block.style.height = `${height}px`;
      }
    }
  }, blocks);
  return page;
}

test('with the page at the top, "Atacar" is the current tab', async ({ newWindow }) => {
  const page = await openHome(newWindow, 1440, { motion: "reduce" });
  await expect(cycleTabs(page)).toHaveText(TAB_NAMES);
  await expect.poll(() => currentTabs(page)).toEqual(["Atacar (step)"]);
});

for (const width of WIDTHS) {
  test(`a click on a tab takes the page to its step and marks the tab current at ${width} px`, async ({
    newWindow,
  }) => {
    const page = await openHome(newWindow, width, { motion: "reduce" });
    for (const name of ["Proteger", "Descobrir", "Medir", "Atacar"]) {
      await cycleTab(page, name).click();
      await expect
        .poll(() => currentTabs(page), `current after a click on ${name}`)
        .toEqual([`${name} (step)`]);
      await expectStepUnderBar(page, name);
    }
  });
}

// In a 1440 × 900 window the bar sticks under the 54px header and ends 119px down; the room below it is
// 781px, and a third of it is some 258 to 260px, as the board counts it. A step becomes current once its
// top passes that line.
test("scrolling marks the last step whose top passed a third of the room below the bar", async ({
  newWindow,
}) => {
  const page = await openHome(newWindow, 1440, { height: 900, motion: "reduce" });

  await scrollStepBelowBar(page, "Descobrir", 270);
  await expect.poll(() => currentTabs(page)).toEqual(["Atacar (step)"]);
  await scrollStepBelowBar(page, "Descobrir", 250);
  await expect.poll(() => currentTabs(page)).toEqual(["Descobrir (step)"]);

  await scrollStepBelowBar(page, "Proteger", 100);
  await expect.poll(() => currentTabs(page)).toEqual(["Proteger (step)"]);

  // Past the cycle, the last step stays current; back at the top, the first one is.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => currentTabs(page)).toEqual(["Medir (step)"]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => currentTabs(page)).toEqual(["Atacar (step)"]);
});

test("the tabs are reached with Tab and followed with Enter, the focus ring inside them", async ({
  newWindow,
}) => {
  const page = await openHome(newWindow, 1440, { motion: "reduce" });
  const focused = () =>
    page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const style = getComputedStyle(element);
      return {
        name: element.textContent,
        ring: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor} ${style.outlineOffset}`,
      };
    });

  // From the top of the page, Tab goes through what comes before the cycle and then reaches its tabs.
  for (let presses = 0; (await focused()).name !== "Atacar"; presses++) {
    expect(presses, "Tab presses before the first tab").toBeLessThan(40);
    await page.keyboard.press("Tab");
  }
  const found = [await focused()];
  for (const _ of TAB_NAMES.slice(1)) {
    await page.keyboard.press("Tab");
    found.push(await focused());
  }
  const ring = "solid 2px rgb(255, 255, 255) -4px";
  expect(found).toEqual(TAB_NAMES.map((name) => ({ name, ring })));

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Enter");
  await expect.poll(() => currentTabs(page)).toEqual(["Desenvolver (step)"]);
  await expectStepUnderBar(page, "Desenvolver");
});

for (const width of [1440, 761]) {
  test(`above 760 px the bar sticks 54 px from the top, under the header (${width} px)`, async ({
    newWindow,
  }) => {
    const page = await openHome(newWindow, width, { motion: "reduce" });
    await scrollStepBelowBar(page, "Desenvolver", 0);
    // 54px is the header's height when its blocks fit in one row; when they wrap (761px), the taller
    // header covers the top of the bar, as in the board.
    expect((await boxOf(page.getByRole("navigation", { name: "Etapas do ciclo" }))).y).toBe(54);
  });
}

for (const width of [760, 390]) {
  test(`at 760 px or less the bar sticks to the top of the window (${width} px)`, async ({
    newWindow,
  }) => {
    const page = await openHome(newWindow, width, { motion: "reduce" });
    await scrollStepBelowBar(page, "Desenvolver", 0);
    expect((await boxOf(page.getByRole("navigation", { name: "Etapas do ciclo" }))).y).toBe(0);
  });
}

// The tabs ease their color and fill in .15s, and a click glides to the step; with reduced motion the
// tabs change at once and the page jumps.
const MOTION = {
  "no-preference": { transition: "color, background-color 0.15s", glides: true },
  reduce: { transition: "none 0s", glides: false },
};

for (const motion of ["no-preference", "reduce"] as Motion[]) {
  const { transition, glides } = MOTION[motion];
  test(`with ${motion === "reduce" ? "reduced motion" : "motion"}, the tabs take ${transition} and a click ${glides ? "glides" : "jumps"} to its step`, async ({
    newWindow,
  }) => {
    const page = await openHome(newWindow, 1440, { motion });
    const transitions = await cycleTabs(page).evaluateAll((tabs) =>
      tabs.map((tab) => {
        const style = getComputedStyle(tab);
        return `${style.transitionProperty} ${style.transitionDuration}`;
      }),
    );
    expect(transitions).toEqual(Array(5).fill(transition));

    // Every scroll position the page goes through on the way to the step, once the tab is in sight (the
    // click would scroll it into view first).
    const tab = cycleTab(page, "Medir");
    await tab.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const positions: number[] = [];
      Object.assign(window, { scrollPositions: positions });
      return new Promise((settled) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            window.addEventListener("scroll", () => positions.push(window.scrollY), {
              passive: true,
            });
            settled(undefined);
          }),
        ),
      );
    });
    await tab.click();
    await expectStepUnderBar(page, "Medir");
    const positions = await page.evaluate(
      () => (window as unknown as { scrollPositions: number[] }).scrollPositions,
    );
    if (glides) expect(new Set(positions).size).toBeGreaterThan(3);
    else expect(new Set(positions).size).toBe(1);

    // Gliding, the page passes the steps between and the spy marks each; once it stops, the tab clicked
    // is the current one.
    await expect.poll(() => currentTabs(page)).toEqual(["Medir (step)"]);
  });
}
