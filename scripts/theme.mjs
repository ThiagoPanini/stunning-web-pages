// What the tools of scripts/ take from a theme folder (projects/<project>/themes/<theme>): its names and
// the tokens of its app. Everything else a tool needs from the theme, it reads from the same folder.

import { readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

// The catalog's root: scripts/ lives right under it.
export const REPO_ROOT = resolve(import.meta.dirname, '..');

// The name/value pairs declared directly inside every @theme block of a stylesheet, in order. Comments
// and nested blocks are skipped, and so are namespace resets such as `--*: initial`.
export function parseThemeTokens(css) {
  const tokens = new Map();
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const opening of text.matchAll(/@theme\b[^{;]*\{/g)) {
    let depth = 1;
    let body = '';
    for (let i = opening.index + opening[0].length; i < text.length && depth > 0; i++) {
      const char = text[i];
      if (char === '{') depth++;
      else if (char === '}') depth--;
      if (depth === 1 && char !== '}') body += char;
    }
    for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens.set(match[1], match[2].trim().replace(/\s+/g, ' '));
    }
  }
  return tokens;
}

// ASCII identifier from a display name: "Aurora Índigo" -> "AuroraIndigo".
function identifier(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}

export function readTheme(themeDir) {
  const dir = resolve(themeDir);
  if (basename(dirname(dir)) !== 'themes' || basename(dirname(dirname(dirname(dir)))) !== 'projects') {
    throw new Error(`${themeDir}: a theme folder is projects/<project>/themes/<theme>`);
  }
  const project = basename(dirname(dirname(dir)));
  const heading = readFileSync(join(dir, 'README.md'), 'utf8').match(/^# (.+)$/m);
  if (!heading) throw new Error(`${join(dir, 'README.md')}: no "# <name>" heading to name the theme`);
  const name = heading[1].trim();
  const web = join(dir, 'web');
  const css = readFileSync(join(web, 'app', 'globals.css'), 'utf8');
  return {
    dir,
    web,
    project,
    slug: basename(dir),
    name,
    title: `${project} · ${name}`,
    namespace: identifier(name),
    // The app's path from the catalog's root, for the provenance a tool records.
    appPath: relative(REPO_ROOT, web).split('\\').join('/'),
    css,
    tokens: parseThemeTokens(css),
  };
}
