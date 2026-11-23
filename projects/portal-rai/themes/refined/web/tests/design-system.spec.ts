// The design system route: the @theme tokens with name and value, read from the only source, and each
// component of the Home on its own, in its states.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locator } from "@playwright/test";
import { PNG } from "pngjs";
import { parseThemeTokens } from "../app/design-system/theme-tokens";
import { WIDTHS } from "./support/reference";
import { expectSavedScreenshot } from "./support/screenshots";
import { expect, load, type NewWindow, test } from "./support/test";

const ROUTE = "/design-system";

// The tokens as app/globals.css declares them in its @theme block: [name, value].
function themeTokens(): [string, string][] {
  const css = readFileSync(join(import.meta.dirname, "..", "app", "globals.css"), "utf8");
  return parseThemeTokens(css).map(({ name, value }) => [name, value]);
}

// The route with its logos still: the checks below read the page many times, and the animated logos
// would draw it again at every frame meanwhile.
async function openStill(newWindow: NewWindow) {
  const page = await newWindow(1440, { motion: "reduce" });
  await load(page, ROUTE);
  return page;
}

for (const width of WIDTHS) {
  test(`the route renders with no console error, no outside request and no spill at ${width} px`, async ({
    newWindow,
    baseURL,
  }) => {
    const origin = new URL(baseURL ?? "").origin;
    const page = await newWindow(width);
    const errors: string[] = [];
    const failed: string[] = [];
    const outside: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) =>
      failed.push(`${request.url()} (${request.failure()?.errorText})`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400) failed.push(`${response.url()} (${response.status()})`);
    });
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.protocol !== "data:" && url.origin !== origin) outside.push(request.url());
    });
    const response = await load(page, ROUTE);
    expect(response?.status(), "route status").toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sistema de design.");
    await page.mouse.wheel(0, 100_000);
    await page.waitForLoadState("networkidle");
    // Soft: a sick route reports every problem at once. The route does not clip its sides, as the Home
    // does, so a spill shows in the page's scrollable width.
    expect.soft(errors, "console errors and warnings").toEqual([]);
    expect.soft(failed, "failed requests").toEqual([]);
    expect.soft(outside, "requests outside the local server").toEqual([]);
    expect
      .soft(await page.evaluate(() => document.documentElement.scrollWidth), "scrollable width")
      .toBe(width);
  });
}

test("every @theme token shows on the route with its name and value", async ({ newWindow }) => {
  const tokens = themeTokens();
  expect(tokens.length, "tokens read from @theme").toBeGreaterThan(100);
  const page = await openStill(newWindow);
  const missing = await page.evaluate(
    (expected) =>
      expected
        .filter(
          ([name, value]) =>
            ![...document.querySelectorAll(`[data-token="${name}"]`)].some((element) => {
              const text = (element.textContent ?? "").replace(/\s+/g, " ");
              return text.includes(name) && text.includes(value);
            }),
        )
        .map(([name, value]) => `${name}: ${value}`),
    tokens,
  );
  expect(missing, "tokens without name and value on the route").toEqual([]);
});

// For each kind of token the route draws: the property its sample shows and another value for the
// token, different from any the @theme holds. The kinds are Tailwind's namespaces, as in the route's
// grouping (theme-tokens.ts); this list is written apart on purpose, as what the test expects to see.
const DRAWN: [RegExp, string, string][] = [
  [/^--color-/, "background-color", "rgb(1, 2, 3)"],
  [/^--font-weight-/, "font-weight", "900"],
  [/^--(font-|default-(mono-)?font-family$)/, "font-family", "serif"],
  [/^--text-/, "font-size", "3px"],
  [/^--tracking-/, "letter-spacing", "0.5em"],
  [/^--leading-/, "line-height", "3"],
  [/^--(spacing|container-)/, "width", "3px"],
  [/^--grid-template-columns-/, "grid-template-columns", "1px 2px 3px"],
  [/^--aspect-/, "aspect-ratio", "3 / 1"],
  [/^--radius-/, "border-top-left-radius", "3px"],
  [/^--shadow-/, "box-shadow", "0 0 0 3px rgb(1, 2, 3)"],
  [/^--blur-/, "backdrop-filter", "3px"],
  [/^--outline-width-/, "outline-width", "7px"],
  [/^--outline-offset-/, "outline-offset", "7px"],
];

// The samples follow the variable: another value for a token, set on the page while it is open, changes
// what its samples show. With the value test above, which reads @theme on every run, this is the check
// that changing a token changes the route without editing it.
test("changing a token's value changes the route's samples", async ({ newWindow }) => {
  // [token, the property its samples show, another value for it]
  const checks = themeTokens().flatMap(([name]): [string, string, string][] => {
    const kind = DRAWN.find(([pattern]) => pattern.test(name));
    return kind ? [[name, kind[1], kind[2]]] : [];
  });
  expect(checks.length, "tokens of a kind the route draws").toBeGreaterThan(90);
  const page = await openStill(newWindow);
  const unchanged = await page.evaluate(
    (tokens) =>
      tokens
        .filter(([token, property, value]) => {
          const samples = [...document.querySelectorAll(`[data-token="${token}"] [data-sample]`)];
          const read = () =>
            samples.map((sample) => getComputedStyle(sample).getPropertyValue(property));
          const before = read();
          document.documentElement.style.setProperty(token, value);
          const after = read();
          document.documentElement.style.removeProperty(token);
          return before.length === 0 || before.some((shown, index) => shown === after[index]);
        })
        .map(([token, property]) => `${token} (${property})`),
    checks,
  );
  expect(unchanged, "tokens whose samples do not follow the variable").toEqual([]);
});

// Values distinctive enough that finding one written in the route's files means a copy: colors, font
// stacks, clamp() and curves.
test("the route keeps no copy of the @theme values", () => {
  const routeDir = join(import.meta.dirname, "..", "app", "design-system");
  const source = readdirSync(routeDir)
    .map((file) => readFileSync(join(routeDir, file), "utf8"))
    .join("\n")
    .toLowerCase()
    .replace(/\s+/g, " ");
  const copied = themeTokens()
    .filter(([, value]) => /[#("]/.test(value) && !value.startsWith("var("))
    .filter(([, value]) => source.includes(value.toLowerCase()));
  expect(copied, "@theme values written in the route").toEqual([]);
});

// The components of the Home: every component a file of components/ exports (a function named with a
// capital, as React names them; buttonClassName is a helper), except the blocks of the page, which the
// Home itself shows. A block file marks its block (data-block="hero") or draws it in the shell of the
// sections (<Section block="faq">).
function homeComponents(): string[] {
  const dir = join(import.meta.dirname, "..", "components");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".tsx"))
    .flatMap((file) => {
      const source = readFileSync(join(dir, file), "utf8");
      if (/data-block="|<Section\b/.test(source)) return [];
      return [...source.matchAll(/^export function ([A-Z]\w*)/gm)].map((match) => match[1]);
    });
}

test("each component of the Home shows on its own on the route", async ({ newWindow }) => {
  const components = homeComponents();
  expect(components, "components of the Home").toEqual(
    expect.arrayContaining([
      "ButtonLink",
      "ChipStrip",
      "CycleStep",
      "FaqAccordion",
      "FaqItem",
      "FormField",
      "OndasLogo",
      "PortalCardLink",
      "ScrollProgress",
    ]),
  );
  const page = await openStill(newWindow);
  const shown = await page
    .locator("[data-component]")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-component")));
  expect(
    components.filter((name) => !shown.includes(name)),
    "components with no specimen on the route",
  ).toEqual([]);
});

// What a hover or a focus can change on a link, a button or a field, or on what is inside it: the card
// link of the portal changes its media and its tag, not itself.
const STATE_PROPERTIES = [
  "color",
  "background-color",
  "border-top-color",
  "box-shadow",
  "translate",
  "text-decoration-line",
  "text-underline-offset",
  "outline-style",
  "outline-color",
  "outline-width",
  "outline-offset",
];

// The style of an element and of everything inside it.
function styleOf(locator: Locator): Promise<string[]> {
  return locator.evaluate(
    (element, properties) =>
      [element, ...element.querySelectorAll("*")].flatMap((part, index) =>
        properties.map(
          (name) => `${index} ${name}: ${getComputedStyle(part).getPropertyValue(name)}`,
        ),
      ),
    STATE_PROPERTIES,
  );
}

const INTERACTIVE = "a, button, input, textarea";

// Each component is shown at rest; a component that changes under the pointer or the keyboard is also
// shown in that state, without anyone hovering or focusing it, and what it shows is what the pointer and
// the keyboard really do to the component at rest. A state is found by its caption, the interface text
// the route shows (specimens.tsx): "repouso" is the state at rest, "hover" and "foco" the states drawn;
// a component with several variants of its own (the three buttons) has the three cells for each, which
// share the variant in data-variant.
test("each component's hover and focus show on the route as they really are", async ({
  newWindow,
}) => {
  const page = await openStill(newWindow);
  const problems: string[] = [];
  const cells = await page
    .locator('[data-component] [data-state="repouso"]')
    .evaluateAll((elements) =>
      elements.map((element) => ({
        name: element.closest("[data-component]")?.getAttribute("data-component") ?? "",
        variant: element.getAttribute("data-variant"),
      })),
    );
  const checked: string[] = [];
  for (const { name, variant } of cells) {
    const label = variant ? `${name} (${variant})` : name;
    const cell = (state: string) =>
      page.locator(
        `[data-component="${name}"] [data-state="${state}"]${variant ? `[data-variant="${variant}"]` : ":not([data-variant])"}`,
      );
    const rest = cell("repouso").locator(INTERACTIVE).first();
    if ((await rest.count()) === 0) continue;
    checked.push(label);
    await rest.scrollIntoViewIfNeeded();
    const atRest = await styleOf(rest);

    await rest.hover();
    await page.waitForTimeout(400);
    const hovered = await styleOf(rest);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    const shownHover = cell("hover").locator(INTERACTIVE).first();
    if (hovered.join() !== atRest.join()) {
      if ((await shownHover.count()) === 0)
        problems.push(`${label}: changes on hover and does not show it`);
      else if ((await styleOf(shownHover)).join() !== hovered.join()) {
        problems.push(`${label}: the hover shown is not the real one`);
      }
    } else if ((await shownHover.count()) > 0) {
      problems.push(`${label}: shows a hover that does not exist`);
    }

    await rest.focus();
    expect(await rest.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    const focused = await styleOf(rest);
    await rest.blur();
    const shownFocus = cell("foco").locator(INTERACTIVE).first();
    if (focused.join() !== atRest.join()) {
      if ((await shownFocus.count()) === 0)
        problems.push(`${label}: changes on focus and does not show it`);
      else if ((await styleOf(shownFocus)).join() !== focused.join()) {
        problems.push(`${label}: the focus shown is not the real one`);
      }
    }
  }
  expect(checked, "cells at rest with a link, a button or a field").toEqual(
    expect.arrayContaining([
      "ButtonLink (primary)",
      "ButtonLink (secondary)",
      "ButtonLink (header)",
      "NavLink",
      "SectionHeader",
      "PortalCardLink",
      "FaqAccordion",
      "AnswerLink",
      "FormField",
      "FooterLink",
      "InertLink",
    ]),
  );
  expect(problems).toEqual([]);
});

// A question of the accordion as it is drawn: whether its button says it is open, and the look of the
// item, the button, the icon (turned while open) and the answer, which is there only while open. Not
// the sizes, which follow the width of where it sits.
function questionAsDrawn(item: Locator) {
  return item.evaluate((element) => {
    const look = (part: Element | null | undefined) =>
      part
        ? [
            "color",
            "background-color",
            "rotate",
            "border-top-left-radius",
            "padding-left",
            "padding-right",
            "font-size",
            "font-weight",
          ].map((name) => `${name}: ${getComputedStyle(part).getPropertyValue(name)}`)
        : null;
    const button = element.querySelector("button");
    return {
      open: button?.getAttribute("aria-expanded"),
      item: look(element),
      button: look(button),
      icon: look(button?.querySelector("span[aria-hidden]")),
      answer: look(element.querySelector('[role="region"]')),
    };
  });
}

// The open and the closed question on the route are what the Home draws for its first question, open
// on arrival, and its second, closed; and the route's accordion works, as the Home's does.
test("the open and the closed question show as the Home draws them, and open and close", async ({
  newWindow,
}) => {
  const home = await newWindow(1440, { motion: "reduce" });
  await load(home, "/");
  const homeItems = home.locator('[data-block="faq"] li');
  const page = await openStill(newWindow);
  const question = (state: string) =>
    page.locator(`[data-component="FaqItem"] [data-state="${state}"] li`);

  const open = await questionAsDrawn(question("aberta"));
  const closed = await questionAsDrawn(question("fechada"));
  expect(open.open, "the open question says it is open").toBe("true");
  expect(closed.open, "the closed question says it is closed").toBe("false");
  expect(open, "the open question").toEqual(await questionAsDrawn(homeItems.nth(0)));
  expect(closed, "the closed question").toEqual(await questionAsDrawn(homeItems.nth(1)));

  const button = question("fechada").getByRole("button");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(question("fechada").getByText(/^Pesquisa, desenvolve e implementa/)).toBeVisible();
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(question("fechada").getByText(/^Pesquisa, desenvolve e implementa/)).toHaveCount(0);
});

// The chip strip runs with normal motion and pauses under the pointer; the route draws it paused in its
// "hover" cell, with no pointer over it, and the pause it draws is the one the pointer makes.
test("with normal motion the chip strip runs, and the strip shown hovered is paused as a hovered one is", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, ROUTE);
  const strip = (state: string) =>
    page.locator(`[data-component="ChipStrip"] [data-state="${state}"]`).getByRole("group");
  const track = (state: string) => strip(state).locator(".marquee");
  const offset = (state: string) =>
    track(state).evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  const playState = (state: string) =>
    track(state).evaluate((element) => getComputedStyle(element).animationPlayState);
  await strip("rolando").scrollIntoViewIfNeeded();

  expect(await playState("rolando"), "the strip at rest").toBe("running");
  expect(await playState("hover"), "the strip shown hovered").toBe("paused");
  const [running, shown] = [await offset("rolando"), await offset("hover")];
  await page.waitForTimeout(400);
  expect(await offset("rolando"), "the strip at rest moved").toBeLessThan(running);
  expect(await offset("hover"), "the strip shown hovered stayed").toBe(shown);

  await strip("rolando").hover();
  expect(await playState("rolando"), "the strip under the pointer").toBe("paused");
});

// The logo with animated off is the only place it is used that way: with normal motion, the animated
// one changes from one instant to the next and the stopped one does not. The two states are found by
// their captions, "animado" and "parado".
test("with normal motion the animated logo changes and the stopped one does not", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, ROUTE);
  const logo = (state: string) =>
    page.locator(`[data-component="OndasLogo"] [data-state="${state}"] [role="img"]`);
  await logo("animado").scrollIntoViewIfNeeded();
  const pictures = async () => [
    await logo("animado").screenshot(),
    await logo("parado").screenshot(),
  ];

  // 400 ms is almost 5 frames of the drawing.
  const [animated, stopped] = await pictures();
  await page.waitForTimeout(400);
  const [animatedLater, stoppedLater] = await pictures();
  expect(animatedLater.equals(animated), "the animated logo changed").toBe(false);
  expect(stoppedLater.equals(stopped), "the stopped logo stayed the same").toBe(true);
});

// A cycle step's title before and after it lights up, as the route shows them ("apagado", "aceso"), is
// what the Home's first step title shows with normal motion before it enters the window, and with
// reduced motion, where it is lit from the start. On the route, with normal motion, the lit step lights
// up as it rises in the window, as in the Home, and the unlit one stays unlit: the colors are read with
// each title near the top of the window, past the range where it lights up.
test("the unlit and the lit cycle step show as the Home's step before and after it lights up", async ({
  newWindow,
}) => {
  const titleColor = (title: Locator) =>
    title.evaluate(async (element) => {
      element.scrollIntoView({ block: "start", behavior: "instant" });
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return getComputedStyle(element).color;
    });
  const homeTitle = async (motion: "reduce" | "no-preference") => {
    const home = await newWindow(1440, { motion });
    await load(home, "/");
    // Where the page opens: with normal motion the cycle is still below the window, unlit.
    return home
      .locator('[data-block="cycle"] ol h3')
      .first()
      .evaluate((element) => getComputedStyle(element).color);
  };
  const [unlit, lit] = [await homeTitle("no-preference"), await homeTitle("reduce")];
  expect(unlit, "the Home's title before and after it lights up").not.toBe(lit);

  for (const motion of ["reduce", "no-preference"] as const) {
    const page = await newWindow(1440, { motion });
    await load(page, ROUTE);
    const step = (state: string) =>
      page.locator(`[data-component="CycleStep"] [data-state="${state}"] h3`);
    expect(await titleColor(step("apagado")), `the unlit step, motion ${motion}`).toBe(unlit);
    expect(await titleColor(step("aceso")), `the lit step, motion ${motion}`).toBe(lit);
  }
});

// The progress bar on the route follows the route's own scroll: zero width at the top, the whole width of
// its frame at the bottom; with reduced motion it stays at zero.
test("the progress bar grows with the route's scroll, and stays at zero with reduced motion", async ({
  newWindow,
}) => {
  for (const motion of ["no-preference", "reduce"] as const) {
    const page = await newWindow(1440, { motion });
    await load(page, ROUTE);
    const bar = page.locator('[data-component="ScrollProgress"] [aria-hidden="true"]');
    const width = () => bar.evaluate((element) => element.getBoundingClientRect().width);
    const frame = await bar.evaluate(
      (element) => element.parentElement?.getBoundingClientRect().width ?? 0,
    );
    expect(await width(), `at the top, motion ${motion}`).toBe(0);
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    const bottom = motion === "reduce" ? 0 : frame;
    await expect.poll(width, `at the bottom, motion ${motion}`).toBe(bottom);
  }
});

// The logo as its board draws it alone, which tests/logo.spec.ts compares with the board's reference
// capture, starts on a whole pixel at both widths: a logo between two rows or columns of pixels draws
// differently. So nothing above it may have a height in fractions of a pixel.
for (const width of WIDTHS) {
  test(`the logo board's specimen starts on a whole pixel at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width, ROUTE);
    const box = await page.locator('[data-specimen="ondas-logo-board"]').boundingBox();
    expect(box && [box.x % 1, box.y % 1], "fractions of the specimen's corner").toEqual([0, 0]);
  });
}

// The route's screenshots, in the theme's screenshots/, taken under the conditions of the reference
// captures: reduced motion, so the logos rest on their starting frame and the chip strips stand still,
// and a viewport as tall as the document. Each one must be the route as it is now
// (support/screenshots.ts).
for (const width of WIDTHS) {
  test(`the route's screenshot at ${width} px is the route as it is now`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width, ROUTE);
    const screenshot = await page.screenshot({ animations: "disabled" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const capture = PNG.sync.read(screenshot);
    expect(
      { width: capture.width, height: capture.height },
      "the screenshot is the whole route",
    ).toEqual({ width, height });
    await expectSavedScreenshot(`design-system-${width}`, screenshot);
  });
}
