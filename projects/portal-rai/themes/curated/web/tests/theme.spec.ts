// The design system in code: @theme names every value the origin uses, without merging close values,
// and Tailwind's default theme does not exist as classes.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseThemeTokens } from "../app/design-system/theme-tokens";
import { ORIGIN_DIR } from "./support/reference";
import { expect, test } from "./support/test";

const BOARDS = ["Main.dc.html", "LogoMini.dc.html", "LogoLab1.dc.html"];

// What the design system leaves out on purpose, as globals.css explains: two hover rules and a reveal
// no element uses.
const LEFT_OUT = [/\.chip:hover\{[^}]*\}/g, /\.atk:hover\{[^}]*\}/g, /\.rvf\{[^}]*\}/g];

// The board's @keyframes blocks, each with its steps.
const KEYFRAMES = /@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g;

// Values that are not a choice of the design: CSS keywords, and the even columns of Tailwind's own
// grid-cols-N.
const NOT_A_VALUE = /^(inherit|none|auto|0|repeat\(\d+,minmax\(0,1fr\)\)|minmax\(0,1fr\))$/;

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

const GLOBALS_CSS = readFileSync(join(import.meta.dirname, "..", "app", "globals.css"), "utf8");

// The tokens of the @theme block in app/globals.css, as [name, normalized value].
function themeTokens(): [string, string][] {
  return parseThemeTokens(GLOBALS_CSS).map(({ name, value }) => [name, normalize(value)]);
}

type Use = { kind: string; value: string; names: RegExp };

// Each value the origin uses, with the token namespaces where its name must be.
function originValues(): Use[] {
  const uses: Use[] = [];
  const add = (kind: string, value: string, names: RegExp) =>
    uses.push({ kind, value: normalize(value), names });
  for (const name of BOARDS) {
    const board = readBoard(name);
    // Colors anywhere: styles, SVG attributes and the logos' scripts. A color made from a variable, as
    // the neon's rgba(var(--gc),.62), is the light's geometry: its own color is a token.
    for (const [color] of board.matchAll(/#[0-9A-Fa-f]{6}\b|rgba?\((?!var)[^)]*\)/g)) {
      add("color", color, /^--(color|shadow)-/);
    }
    // The keyframes are motion: their distances, scales and shadows stay in globals.css's keyframes, and
    // their colors are tokens, checked with every color above.
    for (const [property, value] of declarations(board.replace(KEYFRAMES, ""))) {
      if (value.includes("{{") || NOT_A_VALUE.test(normalize(value))) continue;
      if (property === "font-family") add("family", value, /^--font-(sans|mono)$/);
      if (property === "font-size") add("size", value, /^--text-/);
      if (property === "font-weight") add("weight", value, /^--font-weight-/);
      if (property === "letter-spacing") add("letter spacing", value, /^--tracking-/);
      if (property === "line-height") add("line height", value, /^--leading-/);
      if (property === "border-radius") add("radius", value, /^--radius-/);
      // A shadow made from a variable is the light's geometry, as the neon's glow and the pulse's halo.
      if (property === "box-shadow" && !value.includes("var(")) add("shadow", value, /^--shadow-/);
      if (property.endsWith("backdrop-filter")) {
        add("blur", value.replace(/^blur\((.*)\)$/, "$1"), /^--blur-/);
      }
      if (["padding", "gap", "margin"].includes(property)) {
        for (const [fluid] of value.matchAll(/clamp\([^)]*\([^)]*\)[^)]*\)|clamp\([^)]*\)/g)) {
          add("fluid spacing", fluid, /^--spacing-/);
        }
      }
      if (property === "grid-template-columns") add("grid", value, /^--grid-template-columns-/);
      // The grow factor of the flex shorthand; a whole one is a step of Tailwind's own (grow-3).
      if (property === "flex") {
        const grow = value.split(/\s+/)[0];
        if (!Number.isInteger(Number(grow))) add("grow", grow, /^--grow-/);
      }
      if (property === "outline") {
        for (const [length] of value.matchAll(/\b\d*\.?\d+px\b/g)) {
          add("outline width", length, /^--outline-width-/);
        }
      }
      if (property === "outline-offset") add("outline offset", value, /^--outline-offset-/);
      if (["transition", "animation", "animation-duration", "animation-delay"].includes(property)) {
        for (const [time] of value.matchAll(/(?:\d*\.)?\d+m?s\b/g)) {
          add("duration", time, /^--(default-transition-duration|duration-|delay-)/);
        }
        for (const [easing] of value.matchAll(/cubic-bezier\([^)]*\)/g)) {
          add("easing", easing, /^--ease-/);
        }
      }
    }
  }
  return uses;
}

test("every value the origin uses has a name in @theme", () => {
  const tokens = themeTokens();
  const uses = originValues();
  expect(uses.length).toBeGreaterThan(100);
  const unnamed = new Set<string>();
  for (const use of uses) {
    const named = tokens.some(
      ([name, value]) =>
        use.names.test(name) &&
        (value === use.value || (use.kind === "color" && value.includes(use.value))),
    );
    if (!named) unnamed.add(`${use.kind}: ${use.value}`);
  }
  expect([...unnamed], "origin values with no name in @theme").toEqual([]);
});

// The numbers of a CSS value that are a design's choice: a length, a time, an angle, a decimal, a ratio
// (21/9). A whole number with no unit is a step of Tailwind's own (flex-[1_1_0] grows by 1), and 0 and
// 100% are none and all; none of them is a choice of the board.
function literalValues(value: string): string[] {
  const ratios = [...value.matchAll(/\d+\/\d+/g)].map(([ratio]) => ratio);
  const numbers = [...value.matchAll(/(\d*\.?\d+)([a-z%]*)/g)]
    .filter(([, number, unit]) => {
      if (unit === "" || unit === "fr") return !Number.isInteger(Number(number));
      return !(Number(number) === 0 || (unit === "%" && number === "100"));
    })
    .map(([literal]) => literal);
  return [...ratios, ...numbers];
}

// Where a component would write a value of its own: the arbitrary values of its classes (grow-[1.2],
// grid-cols-[…]) and a proportion in Tailwind's fraction syntax (aspect-16/10). The other fractions of the
// components (left-1/2, -translate-x-1/2) are Tailwind's own halves, which center. The brand mark's ring
// keeps its stroke widths, part of its drawing (globals.css).
const DRAWINGS = ["brand-mark.tsx"];
const ASPECT_FRACTION = /[\w:-]*\baspect-(\d+\/\d+)/g;

// The body of an at-rule block of a stylesheet, braces balanced: `@layer base` gives its rules.
function blockBody(css: string, header: string): string {
  const start = css.indexOf(`${header} {`);
  if (start === -1) return "";
  let depth = 0;
  for (let index = css.indexOf("{", start); index < css.length; index++) {
    if (css[index] === "{") depth++;
    if (css[index] === "}" && --depth === 0) return css.slice(css.indexOf("{", start) + 1, index);
  }
  return "";
}

test("no component or base rule writes a design value outside @theme", () => {
  const dir = join(import.meta.dirname, "..", "components");
  const found: string[] = [];
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".tsx"))) {
    if (DRAWINGS.includes(file)) continue;
    const source = readFileSync(join(dir, file), "utf8");
    for (const [className, value] of source.matchAll(/[\w:-]+-\[([^\]\s"'`]+)\]/g)) {
      const literals = literalValues(value);
      if (literals.length > 0) found.push(`${file}: ${className} (${literals.join(", ")})`);
    }
    for (const [className, ratio] of source.matchAll(ASPECT_FRACTION)) {
      found.push(`${file}: ${className} (${ratio})`);
    }
  }
  // Outside the @theme, globals.css has the motion, with its own geometry (its header says why), and
  // the base rules, which read the tokens.
  const base = blockBody(GLOBALS_CSS.replace(/\/\*[\s\S]*?\*\//g, ""), "@layer base");
  expect(base, "the base rule of globals.css").toContain("outline");
  for (const [, property, value] of base.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
    const literals = literalValues(value);
    if (literals.length > 0) found.push(`globals.css, @layer base: ${property} (${literals})`);
  }
  expect(found, "values written outside @theme").toEqual([]);
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

// Classes of the Curated's own theme, the control: each one must change the element.
const THEME_CLASSES = [
  "text-red",
  "bg-night",
  "text-15",
  "font-medium",
  "tracking-tight-10",
  "rounded-10",
];

test("a color or size class of Tailwind's default theme generates no style", async ({ page }) => {
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
  expect(changed.own, "classes of the Curated's theme that change the element").toEqual(
    THEME_CLASSES,
  );
  expect(changed.defaults, "classes of Tailwind's default theme that change the element").toEqual(
    [],
  );
});
