// The cycle of section 01, in its two versions: it runs by itself while on screen, a step under the
// pointer or focused holds it and lights the two deliverables of that step, a click pins a step, and
// reduced motion keeps it still.

import type { Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { ALL_WIDTHS } from "./support/reference";
import { expect, load, type Motion, test } from "./support/test";

const VERSIONS = ["06-laco", "03-cartoes"] as const;

// The steps of a version: the items of the loop's list, the cards.
const STEPS: Record<(typeof VERSIONS)[number], string> = {
  "06-laco": "[data-cycle] ol > li",
  "03-cartoes": "[data-cycle] article",
};

async function open(page: Page, version: string) {
  await load(page, `/?versaoCiclo=${version}`);
  await page.locator("#modelo").scrollIntoViewIfNeeded();
}

// The name of the step in focus.
function stepOn(page: Page, version: (typeof VERSIONS)[number]) {
  return page.locator(`${STEPS[version]}[data-on]`).getByRole("button");
}

// The board's keyframes of the light on the cards' top edge: the line that fills, and its head and glow.
const LIGHT = ["wk-fill", "wk3-head", "wk3-head"];

test("03-cartoes: while the cycle runs by itself, a light runs along the top edge of the card of the turn", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await open(page, "03-cartoes");
  const lightIn = (card: string) =>
    page.locator(card).evaluateAll((elements) =>
      elements
        .flatMap((element) => element.getAnimations({ subtree: true }))
        .map((animation) => (animation as CSSAnimation).animationName)
        .filter((name) => name === "wk-fill" || name === "wk3-head")
        .sort(),
    );
  await expect(stepOn(page, "03-cartoes")).toHaveText("Pesquisar");
  await expect.poll(() => lightIn("[data-cycle] article[data-on]")).toEqual(LIGHT);
  expect(await lightIn("[data-cycle] article:not([data-on])"), "the other cards").toEqual([]);
  // On the next card once the deliverable has travelled.
  await expect(stepOn(page, "03-cartoes")).toHaveText("Desenvolver", { timeout: 6000 });
  await expect.poll(() => lightIn("[data-cycle] article[data-on]")).toEqual(LIGHT);
  // A held step stops the cycle, and the light with it.
  await page.locator(STEPS["03-cartoes"]).nth(2).hover();
  await expect.poll(() => lightIn("[data-cycle] article")).toEqual([]);
});

for (const version of VERSIONS) {
  test(`${version}: with normal motion the cycle moves on by itself`, async ({ newWindow }) => {
    const page = await newWindow(1440, { motion: "no-preference" });
    await open(page, version);
    await expect(stepOn(page, version)).toHaveText("Pesquisar");
    // 3 s lit, 1.1 s for the deliverable to travel.
    await expect(stepOn(page, version)).toHaveText("Desenvolver", { timeout: 6000 });
  });

  test(`${version}: a step under the pointer holds the cycle and lights its two deliverables`, async ({
    newWindow,
  }) => {
    const page = await newWindow(1440, { motion: "no-preference" });
    await open(page, version);
    await page.locator(STEPS[version]).nth(2).hover();
    await expect(page.locator("[data-cycle]")).toHaveAttribute("data-held", "");
    await expect(stepOn(page, version)).toHaveText("Implementar");
    // The deliverable that reaches Implementar and the one that leaves it.
    const lit = await page
      .locator("[data-cycle] [data-lit]")
      .evaluateAll((elements) => elements.length);
    expect(lit, "lit deliverables").toBeGreaterThanOrEqual(2);
    await page.waitForTimeout(4500);
    await expect(stepOn(page, version)).toHaveText("Implementar");
    // On leaving, the cycle goes on from the step in focus.
    await page.mouse.move(0, 0);
    await expect(page.locator("[data-cycle]")).not.toHaveAttribute("data-held", "");
    await expect(stepOn(page, version)).toHaveText("Implementar");
  });

  test(`${version}: a click pins a step, and a second click releases it`, async ({ newWindow }) => {
    const page = await newWindow(1440, { motion: "no-preference" });
    await open(page, version);
    const second = page.locator(STEPS[version]).nth(1);
    await second.click();
    await expect(second.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(4500);
    await expect(stepOn(page, version)).toHaveText("Desenvolver");
    await second.click();
    await expect(second.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  test(`${version}: the keyboard holds a step, and its step shows the focus ring`, async ({
    newWindow,
  }) => {
    const page = await newWindow(1440, { motion: "no-preference" });
    await open(page, version);
    const button = page.getByRole("button", { name: "Monitorar" });
    await button.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(stepOn(page, version)).toHaveText("Monitorar");
    const ring = await page.locator(`${STEPS[version]}[data-on]`).evaluate((step) => {
      // The ring is on the step itself (an item of the loop's list), or on the body of a card.
      const target = step.matches(".step-focus") ? step : step.querySelector(".step-focus");
      return target ? getComputedStyle(target).outlineStyle : "no step-focus";
    });
    expect(ring, "the step's focus ring").toBe("solid");
  });

  test(`${version}: with reduced motion the cycle stands still`, async ({ newWindow }) => {
    const page = await newWindow(1440, { motion: "reduce" });
    await open(page, version);
    await page.waitForTimeout(4500);
    await expect(stepOn(page, version)).toHaveText("Pesquisar");
  });

  // Each layout of the version, wide, in two columns and in one, keeps inside the page.
  for (const width of ALL_WIDTHS) {
    for (const motion of ["no-preference", "reduce"] satisfies Motion[]) {
      test(`${version}: nothing spills sideways at ${width} px (${motion})`, async ({ newWindow }) => {
        const page = await newWindow(width, { motion });
        await open(page, version);
        await page.waitForLoadState("networkidle");
        expect
          .soft(await spilledElements(page, width, ["model"]), "elements outside the page width")
          .toEqual([]);
        expect
          .soft(await page.evaluate(() => document.documentElement.scrollWidth), "scrollable width")
          .toBe(width);
      });
    }
  }
}
