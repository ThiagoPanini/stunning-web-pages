// The design system in code: @theme names every value the origin uses, without merging close values,
// no component writes a design value of its own, and Tailwind's default theme does not exist as classes.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseThemeTokens } from "../app/design-system/theme-tokens";
import { ORIGIN_DIR } from "./support/reference";
import { expect, test } from "./support/test";

const BOARDS = ["HomeUnkey.dc.html", "LogoLab1.dc.html"];

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
  return readFileSync(join(ORIGIN_DIR, "boards", name), "utf8");
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

// The parts of the font shorthand, as the board writes it: weight, size, an optional line height after
// a slash, and the family.
function fontShorthand(value: string) {
  const parts = value.match(/^(\d{3})\s+([\d.]+px)(?:\/([\d.]+(?:px)?))?\s+(.+)$/);
  if (!parts) throw new Error(`font shorthand the test does not read: ${value}`);
  const [, weight, size, lineHeight, family] = parts;
  return { weight, size, lineHeight, family };
}

// A grid of N equal columns, minmax(0, 1fr) each, written either way: Tailwind's own grid-cols-N.
function equalColumns(value: string): boolean {
  const normalized = normalize(value);
  return (
    /^repeat\(\d+,minmax\(0,1fr\)\)$/.test(normalized) ||
    /^minmax\(0,1fr\)(?: ?minmax\(0,1fr\))*$/.test(normalized)
  );
}

const GLOBALS_CSS = readFileSync(join(import.meta.dirname, "..", "app", "globals.css"), "utf8");

// The tokens of the @theme block in app/globals.css, as [name, normalized value], with every var() of
// another token replaced by that token's value, so a drawn background reads as the board writes it.
function themeTokens(): [string, string][] {
  const tokens = parseThemeTokens(GLOBALS_CSS);
  const tokenValues = new Map(tokens.map(({ name, value }) => [name, value]));
  const resolve = (value: string): string =>
    value.replace(/var\((--[\w-]+)\)/g, (reference, name: string) => {
      const target = tokenValues.get(name);
      return target === undefined ? reference : resolve(target);
    });
  return tokens.map(({ name, value }) => [name, normalize(resolve(value))]);
}

type Use = { kind: string; value: string; names: RegExp };

// Each value the origin uses, with the token namespaces where its name must be.
function originValues(): Use[] {
  const uses: Use[] = [];
  const add = (kind: string, value: string, names: RegExp) =>
    uses.push({ kind, value: normalize(value), names });
  const addFamily = (value: string) => add("family", value, /^--font-(sans|display|mono|logo)/);
  // A line height in px is a fixed length, a step of the spacing scale (leading-5.5 is 22px).
  const addLineHeight = (value: string) => {
    if (!value.endsWith("px")) add("line height", value, /^--leading-/);
  };
  for (const name of BOARDS) {
    const board = readBoard(name);
    // Colors anywhere: styles, SVG attributes and the logo's script. #000 only paints the marquee's
    // fade mask, which is no color of the page.
    for (const [color] of board.matchAll(/#[0-9A-Fa-f]{6}\b|rgba?\([^)]*\)/g)) {
      add("color", color, /^--color-/);
    }
    for (const [property, value] of declarations(board)) {
      if (value.includes("{{")) continue;
      if (property === "font") {
        const font = fontShorthand(value);
        add("weight", font.weight, /^--font-weight-/);
        add("size", font.size, /^--text-/);
        if (font.lineHeight) addLineHeight(font.lineHeight);
        addFamily(font.family);
      }
      if (property === "font-family") addFamily(value);
      if (property === "font-size") add("size", value, /^--text-/);
      if (property === "font-weight") add("weight", value, /^--font-weight-/);
      if (property === "letter-spacing") add("letter spacing", value, /^--tracking-/);
      if (property === "line-height") addLineHeight(value);
      // A radius of 0 is none, Tailwind's own.
      if (/^border(-[a-z]+)*-radius$/.test(property) && normalize(value) !== "0") {
        add("radius", value, /^--radius-/);
      }
      if (property === "filter") {
        add("blur", value.replace(/^blur\((.*)\)$/, "$1"), /^--blur-/);
      }
      if (/^background(-image)?$/.test(property) && value.includes("gradient(")) {
        add("background image", value, /^--background-image-/);
      }
      if (["padding", "gap", "margin", "min-height"].some((p) => property.startsWith(p))) {
        for (const [fluid] of value.matchAll(/clamp\([^)]*\)/g)) {
          add("fluid spacing", fluid, /^--spacing-/);
        }
      }
      if (property === "grid-template-columns" && !equalColumns(value)) {
        add("grid", value, /^--grid-template-columns-/);
      }
      if (property === "grid-auto-columns") add("grid", value, /^--grid-auto-columns-/);
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
  expect(uses.length).toBeGreaterThan(200);
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

// The numbers of a CSS value that are a design's choice: a length, a time, an angle, a decimal. A whole
// number with no unit is a step of Tailwind's own (flex-[1_1_0] grows by 1), and 0 and 100% are none
// and all; none of them is a choice of the board.
function literalValues(value: string): string[] {
  return [...value.matchAll(/(\d*\.?\d+)([a-z%]*)/g)]
    .filter(([, number, unit]) => {
      if (unit === "" || unit === "fr") return !Number.isInteger(Number(number));
      return !(Number(number) === 0 || (unit === "%" && number === "100"));
    })
    .map(([literal]) => literal);
}

// Drawings keep their geometry in their own file, as globals.css explains: an illustration's positions
// in % and an icon's strokes. A component file named *-illustration.tsx is one: its arbitrary values may
// carry lengths, but its colors are tokens like everyone's.
const DRAWING = /-illustration\.tsx$/;

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
    const source = readFileSync(join(dir, file), "utf8");
    // Arbitrary values of classes (grow-[1.2], grid-cols-[…]), and colors written out anywhere: in a
    // class, a style or an SVG attribute.
    for (const [className, value] of source.matchAll(/[\w:-]+-\[([^\]\s"'`]+)\]/g)) {
      const literals = literalValues(value);
      if (literals.length > 0 && !DRAWING.test(file)) {
        found.push(`${file}: ${className} (${literals.join(", ")})`);
      }
    }
    for (const [color] of source.matchAll(/#[0-9A-Fa-f]{3,8}\b|rgba?\([^)]*\)/g)) {
      found.push(`${file}: ${color}`);
    }
  }
  // Outside the @theme, globals.css has the motion, with its own geometry, and the base rules, which
  // read the tokens.
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
  "bg-black",
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
  "blur-sm",
  "ease-in",
  "animate-spin",
];

// Classes of the Neônio's own theme, the control: each one must change the element.
const THEME_CLASSES = [
  "text-red",
  "bg-page",
  "text-15",
  "font-medium",
  "tracking-tight-10",
  "rounded-6",
  "blur-5",
  "bg-hatch",
];

test("a color or size class of Tailwind's default theme generates no style", async ({ page }) => {
  await page.goto("/");
  const changed = await page.evaluate(
    ([defaults, own]) => {
      const properties = [
        "color",
        "background-color",
        "background-image",
        "border-top-color",
        "font-size",
        "font-weight",
        "letter-spacing",
        "line-height",
        "border-top-left-radius",
        "box-shadow",
        "max-width",
        "filter",
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
  expect(changed.own, "classes of the Neônio's theme that change the element").toEqual(
    THEME_CLASSES,
  );
  expect(changed.defaults, "classes of Tailwind's default theme that change the element").toEqual(
    [],
  );
});
