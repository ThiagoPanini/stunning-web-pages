// The design system route: the @theme tokens with name and value, read from the only source, and each
// component of the Home on its own, in its states.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseThemeTokens } from "../app/design-system/theme-tokens";
import { WIDTHS } from "./support/reference";
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
