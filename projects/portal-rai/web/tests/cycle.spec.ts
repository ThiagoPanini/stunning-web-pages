// The cycle of section 01, in the three versions that move: it runs by itself while on screen, a step
// under the pointer or focused holds it and lights the two links of that step, a click pins a step,
// and reduced motion keeps it still.

import type { Page } from "@playwright/test";
import { expect, load, test } from "./support/test";

const VERSIONS = ["01-orbita", "02-fio", "03-cartoes"] as const;

// The steps of a version: the rows of the orbit's list, the thread's pills, the cards.
const STEPS: Record<(typeof VERSIONS)[number], string> = {
  "01-orbita": "[data-cycle] ol > li",
  "02-fio": "[data-cycle] article",
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

for (const version of VERSIONS) {
  test(`${version}: with normal motion the cycle moves on by itself`, async ({ newWindow }) => {
    const page = await newWindow(1440, { motion: "no-preference" });
    await open(page, version);
    await expect(stepOn(page, version)).toHaveText("Pesquisar");
    // 3 s lit, .95 s for the pulse to travel.
    await expect(stepOn(page, version)).toHaveText("Desenvolver", { timeout: 6000 });
  });

  test(`${version}: a step under the pointer holds the cycle and lights its two links`, async ({
    newWindow,
  }) => {
    const page = await newWindow(1440, { motion: "no-preference" });
    await open(page, version);
    await page.locator(STEPS[version]).nth(2).hover();
    await expect(page.locator("[data-cycle]")).toHaveAttribute("data-held", "");
    await expect(stepOn(page, version)).toHaveText("Implementar");
    // The link that reaches Implementar and the one that leaves it.
    const lit = await page
      .locator("[data-cycle] [data-lit]")
      .evaluateAll((elements) => elements.length);
    expect(lit, "lit links").toBeGreaterThanOrEqual(2);
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
      // The ring is on the step itself, or on the body of a card.
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
}
