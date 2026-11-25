// What the tools of scripts/ take from a project folder (projects/<project>): its names and the tokens of
// its app. Everything else a tool needs from the project, it reads from the same folder.

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

// A project as the tools see it. Its name is the "# " heading of its README.md, and that name alone is the
// title of its published design system; the namespace is the name as an identifier. Any folder but
// projects/<project> is refused, a folder nested inside a project among them.
export function readProject(projectDir) {
  const dir = resolve(projectDir);
  if (basename(dirname(dir)) !== 'projects') {
    throw new Error(`${projectDir}: a project folder is projects/<project>`);
  }
  const readme = join(dir, 'README.md');
  const heading = readFileSync(readme, 'utf8').match(/^# (.+)$/m);
  if (!heading) throw new Error(`${readme}: no "# <name>" heading to name the project`);
  const name = heading[1].trim();
  const web = join(dir, 'web');
  const css = readFileSync(join(web, 'app', 'globals.css'), 'utf8');
  return {
    dir,
    web,
    name,
    namespace: identifier(name),
    // The app's path from the catalog's root, for the provenance a tool records.
    appPath: relative(REPO_ROOT, web).split('\\').join('/'),
    css,
    tokens: parseThemeTokens(css),
  };
}
