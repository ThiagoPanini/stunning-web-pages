import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Token = { name: string; value: string };

// The tokens of the @theme block of app/globals.css, the only source of the Sistema de design, in the
// order they are declared. The route reads them when it is built, so the value it prints next to a name
// is the one written there, and each sample uses the variable itself, never a copy of the value.
// The reset of Tailwind's theme (--*: initial) is not a token.
export function readThemeTokens(): Token[] {
  const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
  const block = css.match(/@theme static \{([\s\S]*?)\n\}/)?.[1];
  if (!block) throw new Error("app/globals.css não tem o bloco @theme static");
  return [...block.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map((match) => ({ name: match[1], value: match[2].trim().replace(/\s+/g, " ") }))
    .filter((token) => token.name !== "--");
}

export type TokenGroup =
  | "colors"
  | "families"
  | "sizes"
  | "weights"
  | "tracking"
  | "leading"
  | "spacing"
  | "radii"
  | "effects"
  | "motion"
  | "others";

// Tailwind's namespaces, as the @theme uses them. A token outside all of them still shows, in "others".
const NAMESPACES: [TokenGroup, RegExp][] = [
  ["colors", /^--color-/],
  ["weights", /^--font-weight-/],
  ["families", /^--(font-|default-(mono-)?font-family$)/],
  ["sizes", /^--text-/],
  ["tracking", /^--tracking-/],
  ["leading", /^--leading-/],
  ["spacing", /^--(spacing|container-)/],
  ["radii", /^--radius-/],
  ["effects", /^--(shadow|blur)-/],
  ["motion", /^--(default-transition-|ease-|duration-|delay-|animate-)/],
];

export function groupTokens(tokens: Token[]): Record<TokenGroup, Token[]> {
  const groups: Record<TokenGroup, Token[]> = {
    colors: [],
    families: [],
    sizes: [],
    weights: [],
    tracking: [],
    leading: [],
    spacing: [],
    radii: [],
    effects: [],
    motion: [],
    others: [],
  };
  for (const token of tokens) {
    const group = NAMESPACES.find(([, pattern]) => pattern.test(token.name))?.[0] ?? "others";
    groups[group].push(token);
  }
  return groups;
}
