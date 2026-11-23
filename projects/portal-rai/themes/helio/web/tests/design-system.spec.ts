// A rota do Sistema de design: os tokens do @theme com nome e valor, lidos da única fonte, e cada
// componente da Home isolado, nos seus estados.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

const ROUTE = "/design-system";

// The tokens as app/globals.css declares them in its @theme block, comments and the reset left out:
// [name, value with its spaces collapsed].
function themeTokens(): [string, string][] {
  const css = readFileSync(join(import.meta.dirname, "..", "app", "globals.css"), "utf8");
  const block = css.match(/@theme static \{([\s\S]*?)\n\}/)?.[1] ?? "";
  return [...block.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map((match): [string, string] => [match[1], match[2].trim().replace(/\s+/g, " ")])
    .filter(([name]) => name !== "--");
}

for (const width of WIDTHS) {
  test(`a rota renderiza sem erro de console e sem transbordo em ${width} px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(ROUTE, { waitUntil: "networkidle" });
    expect(response?.status(), "status da rota").toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sistema de design.");
    await page.mouse.wheel(0, 100_000);
    await page.waitForLoadState("networkidle");
    expect(errors, "erros e avisos de console").toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      "largura rolável da página",
    ).toBe(width);
    await context.close();
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
// token, different from any the @theme holds.
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
