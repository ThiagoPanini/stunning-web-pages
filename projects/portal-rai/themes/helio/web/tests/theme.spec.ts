// O Sistema de design no código: o @theme nomeia todo valor que a Origem usa, sem fundir valores
// parecidos, e o tema padrão do Tailwind não existe como classe.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN_DIR } from "./support/reference";
import { expect, test } from "./support/test";

const BOARDS = ["Main.dc.html", "LogoLab5.dc.html"];

// What the theme leaves out on purpose, as globals.css explains: two hover rules no element uses, and
// the Selo logo's caption rule, which the Eclusa does not show.
const LEFT_OUT = [
  /\.chip:hover\{[^}]*\}/g,
  /\.atk:hover\{[^}]*\}/g,
  /@media \(max-width:380px\)\{[^}]*\}\}/g,
];

// Comparable form of a value: no quotes, no spaces after commas or inside parentheses, lower case, and
// every number in its shortest form (".10" and "0.1" are the same).
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/\s*([,()])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/-?(?:\d+\.?\d*|\.\d+)/g, (number) => String(Number(number)));
}

function readBoard(name: string): string {
  let text = readFileSync(join(ORIGIN_DIR, "boards", name), "utf8");
  for (const rule of LEFT_OUT) text = text.replace(rule, "");
  return text;
}

// Every declaration of the board's <style> blocks and style attributes, as [property, value].
function declarations(board: string): [string, string][] {
  const styles = [
    ...[...board.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((match) => match[1]),
    ...[...board.matchAll(/style="([^"]*)"/g)].map((match) => match[1]),
  ].join(";");
  return [...styles.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)/g)].map((match) => [
    match[1],
    match[2].replace(/\s*!important$/, "").trim(),
  ]);
}

// The tokens of the @theme block in app/globals.css, as [name, normalized value].
function themeTokens(): [string, string][] {
  const css = readFileSync(join(import.meta.dirname, "..", "app", "globals.css"), "utf8");
  const block = css.match(/@theme static \{([\s\S]*?)\n\}/)?.[1] ?? "";
  return [...block.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
    (match) => [match[1], normalize(match[2])],
  );
}

type Use = { kind: string; value: string; names: RegExp };

// Each value the Origem uses, with the token namespaces where its name must be.
function originValues(): Use[] {
  const uses: Use[] = [];
  const add = (kind: string, value: string, names: RegExp) =>
    uses.push({ kind, value: normalize(value), names });
  for (const name of BOARDS) {
    const board = readBoard(name);
    // Colors anywhere: styles, SVG attributes and the logo's script.
    for (const [color] of board.matchAll(/#[0-9A-Fa-f]{6}\b|rgba?\([^)]*\)/g)) {
      add("cor", color, /^--(color|shadow)-/);
    }
    for (const [property, value] of declarations(board)) {
      if (value.includes("{{")) continue;
      if (property === "font-family") add("família", value, /^--font-(sans|mono)$/);
      if (property === "font-size") add("tamanho", value, /^--text-/);
      if (property === "font-weight") add("peso", value, /^--font-weight-/);
      if (property === "letter-spacing") add("espaçamento entre letras", value, /^--tracking-/);
      if (property === "line-height") add("altura de linha", value, /^--leading-/);
      if (property === "border-radius") add("raio", value, /^--radius-/);
      if (property === "box-shadow") add("sombra", value, /^--shadow-/);
      if (property.endsWith("backdrop-filter")) {
        add("desfoque", value.replace(/^blur\((.*)\)$/, "$1"), /^--blur-/);
      }
      if (["padding", "gap", "margin"].includes(property)) {
        for (const [fluid] of value.matchAll(/clamp\([^)]*\([^)]*\)[^)]*\)|clamp\([^)]*\)/g)) {
          add("espaçamento fluido", fluid, /^--spacing-/);
        }
      }
      if (["transition", "animation", "animation-duration", "animation-delay"].includes(property)) {
        for (const [time] of value.matchAll(/(?:\d*\.)?\d+m?s\b/g)) {
          add("duração", time, /^--(default-transition-duration|duration-|delay-)/);
        }
        for (const [easing] of value.matchAll(/cubic-bezier\([^)]*\)/g)) {
          add("curva", easing, /^--ease-/);
        }
      }
    }
  }
  return uses;
}

test("todo valor que a Origem usa tem nome no @theme", () => {
  const tokens = themeTokens();
  const uses = originValues();
  expect(uses.length).toBeGreaterThan(100);
  const unnamed = new Set<string>();
  for (const use of uses) {
    const named = tokens.some(
      ([name, value]) =>
        use.names.test(name) &&
        (value === use.value || (use.kind === "cor" && value.includes(use.value))),
    );
    if (!named) unnamed.add(`${use.kind}: ${use.value}`);
  }
  expect([...unnamed], "valores da Origem sem nome no @theme").toEqual([]);
});

// Classes of Tailwind's default theme, written here so Tailwind scans them: if the theme still had them,
// the build would generate them.
const DEFAULT_CLASSES = [
  "text-red-500",
  "bg-white",
  "text-white",
  "bg-slate-900",
  "border-gray-200",
  "text-lg",
  "text-xs",
  "text-4xl",
  "font-bold",
  "tracking-tight",
  "leading-tight",
  "rounded-lg",
  "shadow-md",
  "max-w-md",
  "backdrop-blur-sm",
  "ease-in",
  "animate-spin",
];

// Classes of the Hélio's own theme, the control: each one must change the element.
const THEME_CLASSES = [
  "text-red",
  "bg-night",
  "text-15",
  "font-medium",
  "tracking-tight-10",
  "rounded-10",
];

test("uma classe de cor ou de tamanho padrão do Tailwind não gera estilo", async ({ page }) => {
  await page.goto("/");
  const changed = await page.evaluate(
    ([defaults, own]) => {
      const properties = [
        "color",
        "background-color",
        "border-top-color",
        "font-size",
        "font-weight",
        "letter-spacing",
        "line-height",
        "border-top-left-radius",
        "box-shadow",
        "max-width",
        "backdrop-filter",
        "transition-timing-function",
        "animation-name",
      ];
      const styleOf = (className: string) => {
        const element = document.createElement("div");
        element.className = className;
        element.style.borderStyle = "solid";
        element.style.borderWidth = "1px";
        document.body.append(element);
        const style = getComputedStyle(element);
        const values = properties.map((property) => style.getPropertyValue(property)).join("|");
        element.remove();
        return values;
      };
      const bare = styleOf("");
      const differs = (className: string) => styleOf(className) !== bare;
      return { defaults: defaults.filter(differs), own: own.filter(differs) };
    },
    [DEFAULT_CLASSES, THEME_CLASSES],
  );
  expect(changed.own, "classes do tema do Hélio que mudam o elemento").toEqual(THEME_CLASSES);
  expect(changed.defaults, "classes do tema padrão do Tailwind que mudam o elemento").toEqual([]);
});
