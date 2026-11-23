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

// The route with its logos still: the checks below read the page many times, and the animated logos
// would draw it again at every frame meanwhile.
async function openStill(newWindow: NewWindow) {
  const page = await newWindow(1440, { motion: "reduce" });
  await load(page, ROUTE);
  return page;
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
  [/^--grid-auto-columns-/, "grid-auto-columns", "7px"],
  [/^--radius-/, "border-top-left-radius", "3px"],
  [/^--blur-/, "filter", "3px"],
  [/^--background-image-/, "background-image", "linear-gradient(rgb(1, 2, 3), rgb(4, 5, 6))"],
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
  expect(checks.length, "tokens of a kind the route draws").toBeGreaterThan(100);
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
// stacks, clamp() and gradients.
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

// The blocks the route shows anyway, by the name of the function: the brands band is a block of the
// Home, and also the marquee, a component with states of its own (rolling, paused under the pointer).
const BLOCKS_WITH_STATES = ["Brands"];

// The components of the Home: every function a file of components/ exports, except the blocks of the
// page (the files that mark data-block), which the Home itself shows; and the blocks with states.
function homeComponents(): string[] {
  const dir = join(import.meta.dirname, "..", "components");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".tsx"))
    .flatMap((file) => {
      const source = readFileSync(join(dir, file), "utf8");
      const exported = [...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
      if (!source.includes("data-block=")) return exported;
      return exported.filter((name) => BLOCKS_WITH_STATES.includes(name));
    });
}

test("each component of the Home shows on its own on the route", async ({ newWindow }) => {
  const components = homeComponents();
  expect(components, "components of the Home").toEqual(
    expect.arrayContaining(["Brands", "ButtonLink", "CycleTab", "CycleTabs", "OndasLogo"]),
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

// What a hover or a focus can change on a link, a button or a tab.
const STATE_PROPERTIES = [
  "color",
  "background-color",
  "border-top-color",
  "outline-style",
  "outline-color",
  "outline-width",
  "outline-offset",
];

function styleOf(locator: Locator): Promise<string[]> {
  return locator.evaluate(
    (element, properties) =>
      properties.map((name) => `${name}: ${getComputedStyle(element).getPropertyValue(name)}`),
    STATE_PROPERTIES,
  );
}

// Each component is shown at rest; a component that changes under the pointer or the keyboard is also
// shown in that state, without anyone hovering or focusing it, and what it shows is what the pointer and
// the keyboard really do to the component at rest. A state is found by its caption, the interface text
// the route shows (specimens.tsx): "repouso" is the state at rest, "hover" and "foco" the states drawn;
// a component with several variants of its own (the white and the outline button) has the three cells
// for each, which share the variant in data-variant.
test("each component's hover and focus show on the route as they really are", async ({
  newWindow,
}) => {
  const page = await openStill(newWindow);
  const problems: string[] = [];
  const restCells = page.locator('[data-component] [data-state="repouso"]');
  const cells = await restCells.evaluateAll((elements) =>
    elements.map((element) => ({
      name: element.closest("[data-component]")?.getAttribute("data-component") ?? "",
      variant: element.getAttribute("data-variant"),
    })),
  );
  let checked = 0;
  for (const { name, variant } of cells) {
    const label = variant ? `${name} (${variant})` : name;
    const cell = (state: string) =>
      page.locator(
        `[data-component="${name}"] [data-state="${state}"]${variant ? `[data-variant="${variant}"]` : ":not([data-variant])"}`,
      );
    const rest = cell("repouso").locator("a, button").first();
    if ((await rest.count()) === 0) continue;
    checked++;
    await rest.scrollIntoViewIfNeeded();
    const atRest = await styleOf(rest);

    await rest.hover();
    await page.waitForTimeout(400);
    const hovered = await styleOf(rest);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    const shownHover = cell("hover").locator("a, button").first();
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
    const shownFocus = cell("foco").locator("a, button").first();
    if (focused.join() !== atRest.join()) {
      if ((await shownFocus.count()) === 0)
        problems.push(`${label}: changes on focus and does not show it`);
      else if ((await styleOf(shownFocus)).join() !== focused.join()) {
        problems.push(`${label}: the focus shown is not the real one`);
      }
    }
  }
  // HeaderBlockLink, NavLink, InertLink, ButtonLink twice and CycleTab.
  expect(checked, "cells at rest with a link or a button").toBeGreaterThanOrEqual(6);
  expect(problems).toEqual([]);
});

// The current tab and a tab that is not current, as the route shows them, are what the cycle's bar
// draws for its current tab (the first, with no step on the route) and for the others.
test("the current tab and a tab not current show as the bar draws them", async ({ newWindow }) => {
  const page = await openStill(newWindow);
  const tab = (selector: string) => page.locator(selector).locator("a").first();
  const current = tab('[data-component="CycleTab"] [data-state="atual"]');
  const notCurrent = tab('[data-component="CycleTab"] [data-state="repouso"]');
  const barTabs = page.locator('[data-component="CycleTabs"] a');
  await expect(barTabs).toHaveCount(5);
  await expect(current).toHaveAttribute("aria-current", "step");
  await expect(notCurrent).toHaveAttribute("aria-current", "false");
  await expect(barTabs.first()).toHaveAttribute("aria-current", "step");
  await expect(barTabs.nth(1)).toHaveAttribute("aria-current", "false");
  expect(await styleOf(current), "the current tab").toEqual(await styleOf(barTabs.first()));
  expect(await styleOf(notCurrent), "a tab not current").toEqual(await styleOf(barTabs.nth(1)));
  expect(await styleOf(current), "the two states differ").not.toEqual(await styleOf(notCurrent));
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

// The brands band rolls with normal motion and pauses under the pointer; the route draws it paused in
// its "hover" cell, with no pointer over it, and the pause it draws is the one the pointer makes.
test("with normal motion the band rolls, and the band shown hovered is paused as a hovered one is", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, ROUTE);
  const band = (state: string) => page.locator(`[data-component="Brands"] [data-state="${state}"]`);
  const track = (state: string) => band(state).locator(".marquee-track");
  const offset = (state: string) =>
    track(state).evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  const playState = (state: string) =>
    track(state).evaluate((element) => getComputedStyle(element).animationPlayState);
  await band("rolando").scrollIntoViewIfNeeded();

  expect(await playState("rolando"), "the band at rest").toBe("running");
  expect(await playState("hover"), "the band shown hovered").toBe("paused");
  const [rolling, shown] = [await offset("rolando"), await offset("hover")];
  await page.waitForTimeout(400);
  expect(await offset("rolando"), "the band at rest moved").toBeLessThan(rolling);
  expect(await offset("hover"), "the band shown hovered stayed").toBe(shown);

  await band("rolando").locator(".marquee-viewport").hover();
  expect(await playState("rolando"), "the band under the pointer").toBe("paused");
});

// The route's screenshots, in the theme's screenshots/, taken under the conditions of the reference
// captures: reduced motion, so the logos rest on their starting frame and the band stands still, and a
// viewport as tall as the document. Each one must be the route as it is now (support/screenshots.ts).
for (const width of WIDTHS) {
  test(`the route's screenshot at ${width} px is the route as it is now`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width, { path: ROUTE });
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
