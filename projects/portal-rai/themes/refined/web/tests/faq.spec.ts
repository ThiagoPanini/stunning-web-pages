// Perguntas frequentes: the accordion against the reference capture, and how it opens, closes and is
// driven from the keyboard.

import type { Locator } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { expectBandToMatchReference, WIDTHS } from "./support/reference";
import { expect, load, type Motion, type NewWindow, test } from "./support/test";

for (const width of WIDTHS) {
  test(`the FAQ matches the reference at ${width} px, with the first question open`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "faq" });
  });
}

const QUESTIONS = [
  "O que o time de Responsible AI faz?",
  "Qual a diferença entre Red Team e Blue Team?",
  "O que os guardrails de entrada avaliam?",
  "E os guardrails de saída?",
  "Como testo um guardrail?",
  "Como acompanho os resultados?",
];

// The FAQ of a Home opened in a desktop window with the given motion preference.
async function openFaq(newWindow: NewWindow, motion: Motion = "reduce", width = 1440) {
  const page = await newWindow(width, { motion });
  await load(page, "/");
  return page.locator('[data-block="faq"]');
}

// Whether each question says it is open, in order, read from its button as assistive technology does.
async function announced(faq: Locator): Promise<boolean[]> {
  return Promise.all(
    QUESTIONS.map(async (name) =>
      faq
        .getByRole("heading", { level: 3, name })
        .getByRole("button", { name, exact: true })
        .getAttribute("aria-expanded")
        .then((value) => value === "true"),
    ),
  );
}

test("each question is a heading with a button that says whether it is open", async ({
  newWindow,
}) => {
  const faq = await openFaq(newWindow);
  await expect(faq.getByRole("heading", { level: 3 })).toHaveText(QUESTIONS);
  expect(await announced(faq)).toEqual([true, false, false, false, false, false]);
  await expect(faq.getByText(/^Pesquisa, desenvolve e implementa/)).toBeVisible();
  await expect(faq.getByText(/^O Red Team ataca/)).toHaveCount(0);
});

test("a click opens or closes one question and leaves the others as they were", async ({
  newWindow,
}) => {
  const faq = await openFaq(newWindow);
  const button = (index: number) => faq.getByRole("button", { name: QUESTIONS[index] });

  await button(1).click();
  expect(await announced(faq)).toEqual([true, true, false, false, false, false]);
  await expect(faq.getByText(/^O Red Team ataca/)).toBeVisible();

  await button(4).click();
  expect(await announced(faq)).toEqual([true, true, false, false, true, false]);

  await button(0).click();
  expect(await announced(faq)).toEqual([false, true, false, false, true, false]);
  await expect(faq.getByText(/^Pesquisa, desenvolve e implementa/)).toHaveCount(0);

  await button(1).click();
  expect(await announced(faq)).toEqual([false, false, false, false, true, false]);
});

for (const [motion, label] of [
  ["reduce", "with reduced motion"],
  ["no-preference", "with motion"],
] as const) {
  test(`the answer shows at its full height at once, and the icon turns in .25s, ${label}`, async ({
    newWindow,
  }) => {
    const faq = await openFaq(newWindow, motion);
    const button = faq.getByRole("button", { name: QUESTIONS[1] });
    // Click, then read on the next frame: the answer's height, and the transitions the icon runs.
    const { height, transitions } = await button.evaluate(async (element: HTMLElement) => {
      element.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const answer = element.closest("li")?.querySelector("p");
      const icon = element.querySelector('span[aria-hidden="true"]');
      if (!answer || !icon) throw new Error("the open question has no answer or no icon");
      return {
        height: answer.getBoundingClientRect().height,
        transitions: icon.getAnimations().map((animation) => ({
          property: (animation as CSSTransition).transitionProperty,
          duration: animation.effect?.getTiming().duration,
        })),
      };
    });
    expect(transitions).toEqual([{ property: "rotate", duration: 250 }]);
    await expect
      .poll(() =>
        button
          .locator('span[aria-hidden="true"]')
          .evaluate((icon) => getComputedStyle(icon).rotate),
      )
      .toBe("45deg");
    // Once the icon has turned, the answer is as tall as it was on the first frame.
    const answer = faq.getByText(/^O Red Team ataca/);
    expect(height).toBeGreaterThan(24);
    expect(await answer.evaluate((element) => element.getBoundingClientRect().height)).toBe(height);
  });
}

test("the accordion works from the keyboard: Tab moves between questions, Enter and Space toggle", async ({
  newWindow,
}) => {
  const faq = await openFaq(newWindow);
  const page = faq.page();
  const button = (index: number) => faq.getByRole("button", { name: QUESTIONS[index] });

  // Reach the first question with Tab, from the element before it in the page's tab order.
  await button(0).evaluate((element: HTMLElement) => {
    const all = [...document.querySelectorAll<HTMLElement>("a[href], button, input, textarea")];
    all[all.indexOf(element) - 1]?.focus();
  });
  await page.keyboard.press("Tab");
  await expect(button(0)).toBeFocused();
  // The focus ring of the page, cream, 2px, 3px away.
  expect(
    await button(0).evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
    }),
  ).toEqual(["solid", "2px", "rgb(232, 220, 200)", "3px"]);

  await page.keyboard.press("Enter");
  expect(await announced(faq)).toEqual([false, false, false, false, false, false]);

  // The open answer has no link, so the next stop is the next question.
  await page.keyboard.press("Tab");
  await expect(button(1)).toBeFocused();
  await page.keyboard.press(" ");
  expect(await announced(faq)).toEqual([false, true, false, false, false, false]);
  await page.keyboard.press(" ");
  expect(await announced(faq)).toEqual([false, false, false, false, false, false]);

  // An open answer's links come in the tab order after its question, inert as the design left them.
  await button(4).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const playground = faq.getByRole("link", { name: "Playground" });
  await expect(playground).toBeFocused();
  await expect(playground).toHaveAttribute("aria-disabled", "true");
  const url = page.url();
  await page.keyboard.press("Enter");
  expect(page.url()).toBe(url);
  await page.keyboard.press("Tab");
  await expect(button(5)).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(button(4)).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await announced(faq)).toEqual([false, false, false, false, false, false]);
});

for (const width of WIDTHS) {
  test(`the FAQ does not spill sideways at ${width} px, with every question open`, async ({
    newWindow,
  }) => {
    const faq = await openFaq(newWindow, "reduce", width);
    expect(await spilledElements(faq.page(), width, ["faq"])).toEqual([]);
    for (const [index, name] of QUESTIONS.entries()) {
      if (index > 0) await faq.getByRole("button", { name }).click();
    }
    expect(await announced(faq)).toEqual([true, true, true, true, true, true]);
    expect(await spilledElements(faq.page(), width, ["faq"])).toEqual([]);
  });
}
