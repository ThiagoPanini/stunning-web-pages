// A rota do Sistema de design: os tokens do @theme com nome e valor, lidos da única fonte, e cada
// componente da Home isolado, nos seus estados.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locator } from "@playwright/test";
import { PNG } from "pngjs";
import { parseThemeTokens } from "../app/design-system/theme-tokens";
import { WIDTHS } from "./support/reference";
import { expectSavedScreenshot } from "./support/screenshots";
import { expect, load, test } from "./support/test";

const ROUTE = "/design-system";

// The tokens as app/globals.css declares them in its @theme block: [name, value].
function themeTokens(): [string, string][] {
  const css = readFileSync(join(import.meta.dirname, "..", "app", "globals.css"), "utf8");
  return parseThemeTokens(css).map(({ name, value }) => [name, value]);
}

for (const width of WIDTHS) {
  test(`a rota renderiza sem erro de console e sem transbordo em ${width} px`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { height: 900 });
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await load(page, ROUTE);
    expect(response?.status(), "status da rota").toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sistema de design.");
    await page.mouse.wheel(0, 100_000);
    await page.waitForLoadState("networkidle");
    expect(errors, "erros e avisos de console").toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      "largura rolável da página",
    ).toBe(width);
  });
}

test("todo token do @theme aparece na rota com nome e valor", async ({ page }) => {
  const tokens = themeTokens();
  expect(tokens.length, "tokens lidos do @theme").toBeGreaterThan(50);
  await page.goto(ROUTE);
  const missing: string[] = [];
  for (const [name, value] of tokens) {
    const texts = await page
      .locator(`[data-token="${name}"]`)
      .evaluateAll((elements) =>
        elements.map((element) => (element.textContent ?? "").replace(/\s+/g, " ")),
      );
    if (!texts.some((text) => text.includes(name) && text.includes(value))) {
      missing.push(`${name}: ${value}`);
    }
  }
  expect(missing, "tokens sem nome e valor na rota").toEqual([]);
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
  [/^--radius-/, "border-top-left-radius", "3px"],
  [/^--shadow-/, "box-shadow", "0 0 0 3px rgb(1, 2, 3)"],
  [/^--blur-/, "backdrop-filter", "3px"],
  [/^--outline-width-/, "outline-width", "7px"],
  [/^--outline-offset-/, "outline-offset", "7px"],
  [/^--grid-template-columns-/, "grid-template-columns", "1px 2px 3px"],
  [/^--grow-/, "flex-grow", "7"],
];

// The samples follow the variable: another value for a token, set on the page while it is open, changes
// what its samples show. With the value test above, which reads @theme on every run, this is the check
// that changing a token changes the route without editing it.
test("mudar o valor de um token muda as amostras da rota", async ({ page }) => {
  await page.goto(ROUTE);
  const unchanged: string[] = [];
  for (const [name] of themeTokens()) {
    const drawn = DRAWN.find(([pattern]) => pattern.test(name));
    if (!drawn) continue;
    const [, property, other] = drawn;
    const samples = page.locator(`[data-token="${name}"] [data-sample]`);
    const changed = await samples.evaluateAll(
      (elements, [token, prop, value]) => {
        const read = () =>
          elements.map((element) => getComputedStyle(element).getPropertyValue(prop));
        const before = read();
        document.documentElement.style.setProperty(token, value);
        const after = read();
        document.documentElement.style.removeProperty(token);
        return before.length > 0 && before.every((shown, index) => shown !== after[index]);
      },
      [name, property, other],
    );
    if (!changed) unchanged.push(`${name} (${property})`);
  }
  expect(unchanged, "tokens cujas amostras não seguem a variável").toEqual([]);
});

// Values distinctive enough that finding one written in the route's files means a copy: colors, font
// stacks, clamp() and curves.
test("a rota não guarda cópia dos valores do @theme", () => {
  const routeDir = join(import.meta.dirname, "..", "app", "design-system");
  const source = readdirSync(routeDir)
    .map((file) => readFileSync(join(routeDir, file), "utf8"))
    .join("\n")
    .toLowerCase()
    .replace(/\s+/g, " ");
  const copied = themeTokens()
    .filter(([, value]) => /[#("]/.test(value) && !value.startsWith("var("))
    .filter(([, value]) => source.includes(value.toLowerCase()));
  expect(copied, "valores do @theme escritos na rota").toEqual([]);
});

// The components of the Home: every function a file of components/ exports, except the blocks of the
// page (the files that mark data-block), which the Home itself shows.
function homeComponents(): string[] {
  const dir = join(import.meta.dirname, "..", "components");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".tsx"))
    .flatMap((file) => {
      const source = readFileSync(join(dir, file), "utf8");
      if (source.includes("data-block=")) return [];
      return [...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
    });
}

test("cada componente da Home aparece isolado na rota", async ({ page }) => {
  const components = homeComponents();
  expect(components, "componentes da Home").toEqual(
    expect.arrayContaining(["ButtonLink", "EclusaLogo", "TeamCard", "TerminalPanel"]),
  );
  await page.goto(ROUTE);
  const shown = await page
    .locator("[data-component]")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-component")));
  expect(
    components.filter((name) => !shown.includes(name)),
    "componentes sem amostra na rota",
  ).toEqual([]);
});

// What a hover or a focus can change on a link or a button.
const STATE_PROPERTIES = [
  "color",
  "background-color",
  "box-shadow",
  "translate",
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
// the keyboard really do to the component at rest.
test("hover e foco de cada componente aparecem na rota como são de verdade", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROUTE);
  const problems: string[] = [];
  const specimens = page.locator("[data-component]");
  let checked = 0;
  for (const name of await specimens.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-component") ?? ""),
  )) {
    const specimen = page.locator(`[data-component="${name}"]`);
    const rest = specimen.locator('[data-state="repouso"]').locator("a, button").first();
    if ((await rest.count()) === 0) continue;
    checked++;
    await rest.scrollIntoViewIfNeeded();
    const atRest = await styleOf(rest);

    await rest.hover();
    await page.waitForTimeout(400);
    const hovered = await styleOf(rest);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    const shownHover = specimen.locator('[data-show-state="hover"]').locator("a, button").first();
    if (hovered.join() !== atRest.join()) {
      if ((await shownHover.count()) === 0) problems.push(`${name}: muda em hover e não o mostra`);
      else if ((await styleOf(shownHover)).join() !== hovered.join()) {
        problems.push(`${name}: o hover mostrado não é o de verdade`);
      }
    } else if ((await shownHover.count()) > 0) {
      problems.push(`${name}: mostra um hover que não existe`);
    }

    await rest.focus();
    expect(await rest.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    const focused = await styleOf(rest);
    await rest.blur();
    const shownFocus = specimen.locator('[data-show-state="focus"]').locator("a, button").first();
    if (focused.join() !== atRest.join()) {
      if ((await shownFocus.count()) === 0) problems.push(`${name}: muda no foco e não o mostra`);
      else if ((await styleOf(shownFocus)).join() !== focused.join()) {
        problems.push(`${name}: o foco mostrado não é o de verdade`);
      }
    }
  }
  expect(checked, "componentes com link ou botão").toBeGreaterThan(3);
  expect(problems).toEqual([]);
});

// The logo with animated off is the only place it is used that way: with normal motion, the animated
// one changes from one instant to the next and the stopped one does not.
test("com movimento normal o logo animado muda e o parado não", async ({ newWindow }) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, ROUTE);
  const logo = (state: string) =>
    page.locator(`[data-component="EclusaLogo"] [data-state="${state}"] [role="img"]`);
  await logo("animado").scrollIntoViewIfNeeded();
  const pictures = async () => [
    await logo("animado").screenshot(),
    await logo("parado").screenshot(),
  ];

  // 400 ms is almost 5 frames of the drawing.
  const [animated, stopped] = await pictures();
  await page.waitForTimeout(400);
  const [animatedLater, stoppedLater] = await pictures();
  expect(animatedLater.equals(animated), "o logo animado mudou").toBe(false);
  expect(stoppedLater.equals(stopped), "o logo parado ficou igual").toBe(true);
});

// The Capturas of the route, in the Tema's screenshots/, taken under the conditions of the Capturas de
// referência: reduced motion, so both logos rest on the same frame, and a viewport as tall as the
// document. Each one must be the route as it is now (support/screenshots.ts).
for (const width of WIDTHS) {
  test(`a Captura da rota em ${width} px é a rota de agora`, async ({ referencePage }) => {
    const page = await referencePage(width, ROUTE);
    const screenshot = await page.screenshot({ animations: "disabled" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const capture = PNG.sync.read(screenshot);
    expect({ width: capture.width, height: capture.height }, "a Captura é a rota inteira").toEqual({
      width,
      height,
    });
    await expectSavedScreenshot(`design-system-${width}`, screenshot);
  });
}
