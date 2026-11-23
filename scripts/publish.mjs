// The publish of a theme's design system: the files of its Design System artifact, built from the theme's
// app and the text the artifact already holds, and the checks around their publication.
// See scripts/README.md for the whole step by step.
//
// Usage:
//   node scripts/publish.mjs build <theme dir> --from <draft dir> --out <build dir> --note "<one line>" [--ref <branch@sha>]
//   node scripts/publish.mjs check <theme dir> <dir with project/>
//   node scripts/publish.mjs diff <dir with project/> <dir with project/>

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { readTheme } from './theme.mjs';

// ---------------------------------------------------------------- tokens

// Where each @theme token goes in tokens.json, by Tailwind namespace: a family of the type, the font
// stacks of `type.families`, or left out (motion and Tailwind's default aliases, which the type has no
// place for, and drawn backgrounds, image values that cite other tokens or files, where the type takes
// no var() or url()). The first pattern that matches wins. A token no pattern matches stops the build:
// add its namespace here.
const PLACEMENT = [
  ['color', /^--color-/],
  ['fontWeight', /^--font-weight-/],
  ['family', /^--font-[\w-]+$/],
  ['fontSize', /^--text-/],
  ['letterSpacing', /^--tracking-/],
  ['lineHeight', /^--leading-/],
  ['spacing', /^--spacing$/],
  ['layout', /^--(spacing-|container-|grid-template-columns-|grid-auto-columns-|grow-)/],
  ['radius', /^--radius-/],
  ['shadow', /^--shadow-/],
  ['blur', /^--blur-/],
  ['focus', /^--outline-(width|offset)-/],
  ['out', /^--(default-|ease-|duration-|delay-|animate-|transition-|background-image-)/],
];

// The place of an @theme token in tokens.json: its family, 'family' for a font stack, 'out' for what the
// type has no place for, or undefined when no namespace of PLACEMENT matches it.
const placementOf = (name) => PLACEMENT.find(([, pattern]) => pattern.test(name))?.[0];

// The order of the families in tokens.json: the type's own, then the further ones.
const FAMILY_ORDER = ['spacing', 'radius', 'shadow', 'layout', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'blur', 'focus'];

const isFamily = (value) => value && typeof value === 'object' && Array.isArray(value.tokens);

// tokens.json from the theme's @theme and the draft's text. Values come from @theme, in its order; each
// token's usage note, each family's note, the color themes and the text styles come from the draft
// tokens.json (the read-back of the artifact with the agent's changes, or what the agent wrote for a first
// publication).
// Returns the object, the @theme tokens left out, and the tokens the draft had that @theme no longer has.
export function buildTokens({ theme, faces, draft, meta }) {
  const usage = new Map();
  for (const family of Object.values(draft)) {
    if (!isFamily(family)) continue;
    for (const token of family.tokens) if (token.usage) usage.set(`--${token.name}`, token.usage);
  }

  const families = {};
  const fontFamilies = {};
  const leftOut = [];
  const unplaced = [];
  const missing = [];
  for (const [name, value] of theme.tokens) {
    const family = placementOf(name);
    if (!family) unplaced.push(name);
    else if (family === 'out') leftOut.push(name);
    else if (family === 'family') fontFamilies[name.slice('--font-'.length)] = value;
    else if (!usage.has(name)) missing.push(`${name} (${family})`);
    else (families[family] ??= []).push({ name: name.slice(2), value, usage: usage.get(name) });
  }
  if (unplaced.length) {
    throw new Error(`no tokens.json family for ${unplaced.join(', ')}: add the namespace to PLACEMENT in scripts/publish.mjs`);
  }
  if (missing.length) {
    throw new Error(`the draft tokens.json has no usage note for:\n  ${missing.join('\n  ')}`);
  }
  if (!Array.isArray(draft.color?.themes) || draft.color.themes.length === 0) {
    throw new Error('the draft tokens.json needs color.themes, e.g. [{"id": "dark", "name": "Escuro"}]');
  }
  if (!Array.isArray(draft.type?.groups) || draft.type.groups.length === 0) {
    throw new Error('the draft tokens.json needs type.groups, the text styles');
  }

  const tokens = {
    name: theme.title,
    version: draft.version ?? 1,
    meta,
    color: { themes: draft.color.themes, tokens: families.color ?? [] },
    type: { fonts: faces, families: fontFamilies, groups: draft.type.groups },
  };
  for (const key of FAMILY_ORDER) {
    if (!families[key]) continue;
    const note = draft[key]?.note;
    tokens[key] = note ? { note, tokens: families[key] } : { tokens: families[key] };
  }
  const dropped = [...usage.keys()].filter((name) => !theme.tokens.has(name));
  return { tokens, leftOut, dropped };
}

// The font faces of app/fonts.ts: one per localFont() call, its file in fonts/, the weight and style it
// gives, and the font-family and unicode-range of its declarations.
export function parseFontFaces(fontsTs) {
  return [...fontsTs.matchAll(/localFont\(\{([\s\S]*?)\n\}\);/g)].map(([, body]) => {
    const field = (key) => body.match(new RegExp(`\\n\\s*${key}: "([^"]+)"`))?.[1];
    const declared = (prop) =>
      body.match(new RegExp(`prop: "${prop}",\\s*value:\\s*"([^"]+)"`))?.[1]?.replace(/\s+/g, ' ');
    const src = field('src')?.match(/^\.\.\/fonts\/(.+)$/)?.[1];
    if (!src) throw new Error('fonts.ts: each localFont() needs src: "../fonts/<file>"');
    const family = declared('font-family');
    if (!family) throw new Error(`fonts.ts: the localFont() of ${src} declares no font-family`);
    const face = { family, file: `fonts/${src}`, weight: field('weight') ?? '400', style: field('style') ?? 'normal' };
    const unicodeRange = declared('unicode-range');
    if (unicodeRange) face.unicodeRange = unicodeRange;
    return face;
  });
}

// ---------------------------------------------------------------- draft and index

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// The marker of a system kept in files, which the index must carry.
const hasMarker = (index) => index.v === 3 && index.layout === 'files' && Boolean(index.createdOnFiles || index.convertedFrom);

// The component folders of a project/ (the cover is not a component), by name.
const componentFolders = (project) =>
  existsSync(join(project, 'components'))
    ? readdirSync(join(project, 'components'))
        .filter((name) => name !== 'Cover' && statSync(join(project, 'components', name)).isDirectory())
        .sort()
    : [];

// Every file under dir, as paths relative to it with forward slashes, sorted.
function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const walk = (sub) =>
    readdirSync(join(dir, sub), { withFileTypes: true }).flatMap((entry) => {
      const path = sub ? `${sub}/${entry.name}` : entry.name;
      return entry.isDirectory() ? walk(path) : [path];
    });
  return walk('').sort();
}

// The card marker on line 1 of a preview.html, <!-- @dsCard group="…" height=N … -->: its group and
// height, each undefined when the marker does not give it, or undefined when line 1 is not the marker.
function dsCardMarker(previewHtml) {
  const line = previewHtml.split('\n', 1)[0];
  if (!/^<!-- @dsCard\b.*-->$/.test(line)) return undefined;
  const height = line.match(/\bheight=(\d+)/)?.[1];
  return { group: line.match(/\bgroup="([^"]*)"/)?.[1], height: height === undefined ? undefined : Number(height) };
}

// The draft of a Design System artifact: a directory holding its project/, where the agent prepares the
// text the build starts from. What the build takes from it: the brand book, tokens.json (its usage notes,
// family notes, color themes and text styles), the index, the cover, the README and the group of each
// component, and the files under assets/. On a new publication the draft is a copy of the read-back of the
// published artifact, with the text the app's change asks for; on a first one, what the agent wrote from
// DESIGN.md and the code.
export function readDraft(draftDir) {
  const project = join(draftDir, 'project');
  const read = (path) => readFileSync(join(project, path), 'utf8');
  const has = (path) => existsSync(join(project, path));
  for (const required of ['README.md', 'tokens.json']) {
    if (!has(required)) throw new Error(`${draftDir}: the draft needs project/${required}`);
  }
  const tokens = JSON.parse(read('tokens.json'));
  const folders = componentFolders(project).filter((name) => has(`components/${name}/README.md`));
  const recorded = Object.keys(tokens.meta?.components ?? {}).filter((name) => folders.includes(name));
  const names = [...recorded, ...folders.filter((name) => !recorded.includes(name)).sort()];
  return {
    readme: read('README.md'),
    tokens,
    index: has('design-system.json') ? JSON.parse(read('design-system.json')) : undefined,
    cover: has('components/Cover/preview.html') ? read('components/Cover/preview.html') : undefined,
    components: names.map((name) => ({
      name,
      readme: read(`components/${name}/README.md`),
      group: has(`components/${name}/preview.html`) ? dsCardMarker(read(`components/${name}/preview.html`))?.group : undefined,
    })),
    assets: listFiles(join(project, 'assets')).map((path) => `assets/${path}`),
    // The files of the draft the build did not make (a section or a file someone added on the page, a
    // component's types), which go up as they are. Fonts are the app's: one it no longer has is dropped.
    keep: (built) => listFiles(project).filter((path) => !built.has(path) && !path.startsWith('fonts/')),
  };
}

const assetGroup = (name) => ({ name, tile: 's', order: [], files: {} });

// project/design-system.json, the index. On a new publication, the index read back with every key kept
// (the page's islands among them) and only title, namespace and lastChange set; on a first one, a new
// index created now. Either way each asset group of the build has an entry.
export function buildIndex({ index, theme, groups, lastChange, now }) {
  let built;
  if (index) {
    if (!hasMarker(index)) {
      throw new Error('the draft design-system.json has no marker of a system kept in files: write nothing over it');
    }
    built = { ...index, title: theme.title, namespace: theme.namespace, lastChange };
  } else {
    built = {
      v: 3,
      layout: 'files',
      createdOnFiles: { v: 1, at: now },
      title: theme.title,
      namespace: theme.namespace,
      libraries: [],
      sections: {},
      groups: [],
      assetGroups: {},
      blobs: {},
      docs: { readme: 'project/README.md', sections: [] },
      lastChange,
    };
  }
  built.groups = [...(built.groups ?? [])];
  built.assetGroups = { ...(built.assetGroups ?? {}) };
  for (const group of groups) {
    if (!built.groups.includes(group)) built.groups.push(group);
    built.assetGroups[group] ??= assetGroup(group);
  }
  return built;
}

// ---------------------------------------------------------------- checks

// How a text style shows a token's value: a fluid size at its clamp's maximum.
const STYLE_FIELDS = [
  ['fontSize', 'text-', (value, token) => value === token || value === token.match(/^clamp\(.+,\s*([^,]+)\)$/)?.[1]],
  ['fontWeight', 'font-weight-', (value, token) => String(value) === token],
  ['lineHeight', 'leading-', (value, token) => String(value) === token],
  ['letterSpacing', 'tracking-', (value, token) => value === token],
];

// The files of a Design System artifact (a build, or a read-back of the published one) against the app:
// - every token of tokens.json has the @theme value of its variable, and every @theme variable is in
//   tokens.json or among what the type has no place for;
// - each text style has the values of the tokens its usage cites;
// - the brand book's `name` (`value`) pairs carry @theme's values;
// - the fonts are the app's own files, byte for byte;
// - each component has its README.md and a preview.html whose line 1 is the @dsCard marker;
// - the index carries the marker of a system kept in files and the theme's title.
export function checkProject(theme, dir) {
  const project = join(dir, 'project');
  const read = (path) => readFileSync(join(project, path), 'utf8');
  const tokens = JSON.parse(read('tokens.json'));
  const failures = [];
  const seen = new Set();

  for (const [family, value] of Object.entries(tokens)) {
    if (!isFamily(value)) continue;
    for (const token of value.tokens) {
      const name = `--${token.name}`;
      seen.add(name);
      if (!theme.tokens.has(name)) failures.push(`${family}/${token.name}: not in @theme`);
      else if (token.value !== theme.tokens.get(name)) {
        failures.push(`${family}/${token.name}: ${JSON.stringify(token.value)}, @theme has ${JSON.stringify(theme.tokens.get(name))}`);
      }
      if (!token.usage) failures.push(`${family}/${token.name}: no usage note`);
    }
  }
  for (const [key, stack] of Object.entries(tokens.type?.families ?? {})) {
    const name = `--font-${key}`;
    seen.add(name);
    if (stack !== theme.tokens.get(name)) {
      failures.push(`type.families.${key}: ${JSON.stringify(stack)}, @theme has ${JSON.stringify(theme.tokens.get(name))}`);
    }
  }
  const leftOut = [];
  for (const name of theme.tokens.keys()) {
    if (seen.has(name)) continue;
    if (placementOf(name) === 'out') leftOut.push(name);
    else failures.push(`${name}: in @theme, missing from tokens.json`);
  }

  let styles = 0;
  for (const group of tokens.type?.groups ?? []) {
    for (const style of group.styles) {
      styles++;
      const cited = [...(style.usage ?? '').matchAll(/(?<![\w-])((?:text|font-weight|leading|tracking)-[\w-]*[a-z0-9])/g)]
        .map((m) => m[1])
        .filter((name) => theme.tokens.has(`--${name}`));
      for (const [field, prefix, matches] of STYLE_FIELDS) {
        if (style[field] === undefined) continue;
        const candidates = cited.filter((name) => name.startsWith(prefix));
        if (candidates.length === 0) {
          failures.push(`style ${style.name}: ${field} ${style[field]}, but its usage cites no ${prefix}… token`);
        } else if (!candidates.some((name) => matches(style[field], theme.tokens.get(`--${name}`)))) {
          failures.push(`style ${style.name}: ${field} ${style[field]} is not the value of ${candidates.join(' or ')}`);
        }
      }
    }
  }

  for (const [, name, value] of read('README.md').matchAll(/`([a-z][\w-]*)` \(`([^`]+)`\)/g)) {
    const token = theme.tokens.get(`--${name}`);
    if (token !== undefined && token !== value) failures.push(`README.md: \`${name}\` (\`${value}\`), @theme has ${token}`);
  }

  const fonts = [];
  for (const face of tokens.type?.fonts ?? []) {
    const app = sha256(join(theme.web, face.file));
    const published = existsSync(join(project, face.file)) ? sha256(join(project, face.file)) : 'missing';
    if (app !== published) failures.push(`${face.file}: sha256 ${published.slice(0, 16)}… differs from the app's ${app.slice(0, 16)}…`);
    fonts.push(`${face.family}, ${face.file}: ${published.slice(0, 16)}… ${app === published ? '= app' : '!= app'}`);
  }

  const folders = componentFolders(project);
  for (const name of folders) {
    if (!existsSync(join(project, 'components', name, 'README.md'))) failures.push(`components/${name}: no README.md`);
    const preview = join(project, 'components', name, 'preview.html');
    if (!existsSync(preview)) failures.push(`components/${name}: no preview.html`);
    else if (!dsCardMarker(readFileSync(preview, 'utf8'))) {
      failures.push(`components/${name}/preview.html: line 1 is not the @dsCard marker`);
    }
  }
  for (const name of Object.keys(tokens.meta?.components ?? {})) {
    if (!folders.includes(name)) failures.push(`meta.components lists ${name}, which has no folder`);
  }

  const index = JSON.parse(read('design-system.json'));
  if (!hasMarker(index)) failures.push('design-system.json: no marker of a system kept in files');
  if (index.title !== theme.title) failures.push(`design-system.json: title "${index.title}", the theme is "${theme.title}"`);

  return {
    failures,
    stats: { tokens: seen.size, themeTokens: theme.tokens.size, leftOut, styles, fonts, components: folders.length, title: index.title },
  };
}

// ---------------------------------------------------------------- comparison

// The fields that change with every build and say nothing of the design: when, and from which commit.
const STAMPS = {
  'project/tokens.json': ['meta.synced', 'meta.ref'],
  'project/design-system.json': ['lastChange.at', 'lastChange.via'],
};

function jsonFields(a, b, prefix = '') {
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    return keys.flatMap((key) => jsonFields(a[key], b[key], prefix ? `${prefix}.${key}` : key));
  }
  return JSON.stringify(a) === JSON.stringify(b) ? [] : [{ key: prefix, a, b }];
}

// The files of two directories holding project/ (a read-back and a build, or two builds), compared: what
// changed, field by field for JSON, and whether only stamps differ. `files` is the publish map of what
// the second has new or changed (null for what it no longer has), without the index, which goes on its
// own as the publish's file_path.
export function compareProjects(dirA, dirB) {
  const a = listFiles(join(dirA, 'project'));
  const b = listFiles(join(dirB, 'project'));
  const differences = [];
  let same = 0;
  for (const path of [...new Set([...a, ...b])].sort()) {
    const full = `project/${path}`;
    if (!b.includes(path)) {
      differences.push({ path: full, change: 'removed' });
      continue;
    }
    if (!a.includes(path)) {
      differences.push({ path: full, change: 'added' });
      continue;
    }
    const bytesA = readFileSync(join(dirA, full));
    const bytesB = readFileSync(join(dirB, full));
    if (bytesA.equals(bytesB)) {
      same++;
    } else if (path.endsWith('.json')) {
      const stamps = STAMPS[full] ?? [];
      const fields = jsonFields(JSON.parse(bytesA), JSON.parse(bytesB)).map((field) => ({ ...field, stamp: stamps.includes(field.key) }));
      differences.push({ path: full, change: 'changed', fields });
    } else {
      const linesA = bytesA.toString('utf8').split('\n');
      const firstLine = bytesB.toString('utf8').split('\n').findIndex((line, i) => line !== linesA[i]) + 1;
      differences.push({ path: full, change: 'changed', firstLine: firstLine || linesA.length });
    }
  }
  const onlyStamps = differences.every((d) => d.fields?.every((field) => field.stamp));
  const files = {};
  for (const d of differences) {
    if (d.path !== 'project/design-system.json') files[d.path] = d.change === 'removed' ? null : d.path;
  }
  return { same, differences, onlyStamps, files };
}

// ---------------------------------------------------------------- build

// The widths the previews are laid out at: the artifact's card for a piece, the reference capture's
// width for a block of the screen.
const PIECE_WIDTH = 960;
const BLOCK_WIDTH = 1440;
const MAX_CARD_HEIGHT = 4000;
const FONT_FILE = /\.(woff2?|ttf|otf|ttc)$/i;

// The file of components/ that exports each component, by name.
function componentFiles(componentsDir) {
  const files = new Map();
  for (const file of readdirSync(componentsDir).filter((f) => f.endsWith('.tsx')).sort()) {
    for (const [, name] of readFileSync(join(componentsDir, file), 'utf8').matchAll(/^export (?:function|const) ([A-Z]\w*)\b/gm)) {
      if (files.has(name)) throw new Error(`components/: ${name} is exported by ${files.get(name)} and ${file}`);
      files.set(name, file);
    }
  }
  return files;
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function gitInfo(cwd) {
  const remote = git(cwd, 'remote', 'get-url', 'origin');
  const repo = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
  if (!repo) throw new Error(`the origin remote is not a GitHub repository: ${remote}`);
  return { repo, branch: git(cwd, 'rev-parse', '--abbrev-ref', 'HEAD'), sha: git(cwd, 'rev-parse', '--short', 'HEAD'), user: git(cwd, 'config', 'user.name') };
}

// tokens.css as the type compiles it from tokens.json, for the local frame that measures the previews.
function tokensCss(tokens) {
  const declare = (list) => list.map((t) => `  --${t.name}: ${t.value};`).join('\n');
  const rest = Object.entries(tokens)
    .filter(([key, value]) => isFamily(value) && !['color', 'shadow'].includes(key))
    .flatMap(([, value]) => value.tokens);
  const families = Object.entries(tokens.type.families).map(([key, stack]) => `  --font-${key}: ${stack};`).join('\n');
  const styles = tokens.type.groups
    .flatMap((group) => group.styles.map((style) => ({ family: group.family, ...style })))
    .map(
      (s) =>
        `.${s.name} { font-family: var(--font-${s.family}); font-size: ${s.fontSize}; font-weight: ${s.fontWeight}; line-height: ${s.lineHeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''} }`,
    )
    .join('\n');
  const format = (file) => ({ woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' })[file.split('.').pop().toLowerCase()];
  const faces = tokens.type.fonts
    .map(
      (f) =>
        `@font-face { font-family: "${f.family}"; src: url(../project/${f.file}) format("${format(f.file)}"); font-weight: ${f.weight}; font-style: ${f.style};${f.unicodeRange ? ` unicode-range: ${f.unicodeRange};` : ''} }`,
    )
    .join('\n');
  return `:root, [data-theme="${tokens.color.themes[0].id}"] {\n${declare(tokens.color.tokens)}\n${declare(tokens.shadow?.tokens ?? [])}\n}\n:root {\n${declare(rest)}\n${families}\n}\n${styles}\n${faces}\n`;
}

// How a media rule stands to the motion preference: 'reduce' when it holds for reduced motion alone, the
// state the previews show, so its rules apply as they are; 'motion' when it names the preference any other
// way (no-preference, or reduce along with another condition), so it goes.
function motionGuard(rule) {
  const queries = rule.value.query.mediaQueries;
  if (!JSON.stringify(queries).includes('prefers-reduced-motion')) return undefined;
  const [query] = queries;
  const feature = query.condition?.type === 'feature' ? query.condition.value : undefined;
  const reduceAlone =
    queries.length === 1 &&
    query.qualifier === null &&
    query.mediaType === 'all' &&
    feature?.name === 'prefers-reduced-motion' &&
    feature.value?.value === 'reduce';
  return reduceAlone ? 'reduce' : 'motion';
}

// The app's compiled CSS as the previews take it: without what tokens.css declares (the token variables
// and the @font-face rules) and in the state of reduced motion, as the app shows it then: what holds for
// reduced motion applies, and what waits for no preference (the animations) goes.
export async function previewCss(css, declared) {
  const lightning = await import('lightningcss');
  const transform = lightning.transform ?? lightning.default.transform;
  const { code } = transform({
    filename: 'app.css',
    code: Buffer.from(css),
    minify: false,
    errorRecovery: false,
    visitor: {
      Rule: {
        'font-face': () => [],
        media: (rule) => ({ reduce: rule.value.rules, motion: [] })[motionGuard(rule)],
        // next/font's own classes, which name the families after the constants of fonts.ts.
        style: (rule) => (/_className|_variable/.test(JSON.stringify(rule.value.selectors)) ? [] : undefined),
      },
      Declaration: { custom: (property) => (declared.has(property.name) ? [] : undefined) },
    },
  });
  const out = Buffer.from(code).toString('utf8');
  for (const name of declared) {
    if (new RegExp(`(^|[;{\\s])${name}\\s*:`).test(out)) throw new Error(`bundle.css still declares ${name}`);
  }
  if (/@font-face/.test(out)) throw new Error('bundle.css still has @font-face');
  if (/prefers-reduced-motion/.test(out)) throw new Error('bundle.css still has motion rules');
  return out;
}

// components/bundle.css: the previews' CSS (previewCss) of the app's one CSS chunk, with the frame of the
// previews.
async function bundleCss(theme, declared) {
  const chunks = join(theme.web, 'out', '_next', 'static', 'chunks');
  const cssFiles = readdirSync(chunks).filter((f) => f.endsWith('.css'));
  if (cssFiles.length !== 1) throw new Error(`${chunks}: expected one CSS chunk, found ${cssFiles.length}`);
  const css = await previewCss(readFileSync(join(chunks, cssFiles[0]), 'utf8'), declared);
  return `/* ${theme.name}: the app's CSS (Tailwind 4, compiled in the static export), without what tokens.json declares.
   The token values come from tokens.css; the @font-face rules, which tokens.css declares too, left this
   file, and so did the animations, guarded by prefers-reduced-motion: the previews show the final state,
   as the app does with reduced motion. */
${css}
/* The previews' frame. */
body {
  margin: 0;
}

.ds-preview {
  padding: 24px;
}

.ds-preview [data-state] {
  flex-basis: auto;
}
`;
}

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

// The block a component file names: the data-block its own element writes, or the one it passes to a
// component that writes it (`<Section block="faq">`). The file must name a single one, however many times;
// otherwise it names none.
export function blockOf(componentFile) {
  const names = new Set([...componentFile.matchAll(/(?<![\w-])(?:data-)?block="([\w-]+)"/g)].map((m) => m[1]));
  return names.size === 1 ? [...names][0] : undefined;
}

// The markup of each component, from the static export: a piece is the specimen the /design-system route
// shows in its <article data-component="<Name>">, or the cell [data-component="<Name>"] of a specimen that
// shows several, inside a frame with the classes of that page's root; a block is the element of the screen at / whose data-block its component file names, inside the elements
// that hold it on the page, with their classes.
export async function extractMarkup(browser, theme, components, files) {
  const page = await browser.newPage();
  const out = join(theme.web, 'out');
  await page.setContent(readFileSync(join(out, 'design-system.html'), 'utf8'), { waitUntil: 'domcontentloaded' });
  const result = new Map();
  const blocks = [];
  for (const { name } of components) {
    const piece = await page.evaluate((component) => {
      const shown = document.querySelector(`[data-component="${component}"]`);
      if (!shown) return null;
      // An article is the specimen of a component, the last child its states; any other element is one
      // cell of a specimen that shows several components.
      const specimen = shown.localName === 'article' ? shown.lastElementChild : shown;
      return { markup: specimen.outerHTML, root: shown.closest('body > *').className };
    }, name);
    if (piece) result.set(name, { kind: 'piece', body: `<div class="ds-preview ${piece.root}">\n${stripComments(piece.markup)}\n</div>` });
    else blocks.push(name);
  }
  await page.setContent(readFileSync(join(out, 'index.html'), 'utf8'), { waitUntil: 'domcontentloaded' });
  const lang = await page.evaluate(() => document.documentElement.lang);
  for (const name of blocks) {
    const id = blockOf(readFileSync(join(theme.web, 'components', files.get(name)), 'utf8'));
    if (!id) {
      throw new Error(`${name}: neither a specimen of /design-system (article[data-component]) nor a component file that names one block`);
    }
    const block = await page.evaluate((id) => {
      const element = document.querySelector(`[data-block="${id}"]`);
      if (!element) return null;
      const holders = [];
      for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
        holders.unshift({ tag: node.localName, className: node.getAttribute('class') });
      }
      return { markup: element.outerHTML, holders };
    }, id);
    if (!block) throw new Error(`${name}: the screen at / has no [data-block="${id}"]`);
    const opens = block.holders.map((h) => (h.className ? `<${h.tag} class="${h.className}">` : `<${h.tag}>`));
    const closes = block.holders.map((h) => `</${h.tag}>`).reverse();
    result.set(name, { kind: 'block', body: [...opens, stripComments(block.markup), ...closes].join('\n') });
  }
  await page.close();
  return { markup: result, lang };
}

// Builds <outDir>/project/ (the artifact's files) and <outDir>/harness/ (each preview rendered in a local
// frame like the artifact's, to look at), from the theme's app and the text of the draft.
export async function build({ themeDir, draftDir, outDir, note, ref }) {
  const theme = readTheme(themeDir);
  for (const page of ['index.html', 'design-system.html']) {
    if (!existsSync(join(theme.web, 'out', page))) throw new Error(`${join(theme.web, 'out', page)} is missing: run pnpm build in ${theme.web}`);
  }
  if (existsSync(outDir) && readdirSync(outDir).length && !existsSync(join(outDir, 'summary.json'))) {
    throw new Error(`${outDir} exists and is not a previous build: give an empty or new folder`);
  }
  const draft = readDraft(draftDir);
  if (draft.components.length === 0) throw new Error(`${draftDir}: the draft has no components/<Name>/README.md`);
  const faces = parseFontFaces(readFileSync(join(theme.web, 'app', 'fonts.ts'), 'utf8'));
  const files = componentFiles(join(theme.web, 'components'));
  for (const { name } of draft.components) {
    if (!files.has(name)) throw new Error(`${name}: no file of ${join(theme.web, 'components')} exports it`);
  }
  const info = gitInfo(theme.dir);
  const label = ref ?? `${info.branch}@${info.sha}`;
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const meta = {
    source: 'github',
    repo: info.repo,
    ref: label,
    package: theme.package,
    paths: { tokens: ['app/globals.css'], fonts: [...faces.map((f) => f.file), 'app/fonts.ts'], docs: ['../DESIGN.md'] },
    components: Object.fromEntries(draft.components.map(({ name }) => [name, `components/${files.get(name)}`])),
    synced: new Date().toLocaleDateString('sv-SE'),
  };
  const { tokens, leftOut, dropped } = buildTokens({ theme, faces, draft: draft.tokens, meta });
  const declared = new Set([
    ...Object.values(tokens).filter(isFamily).flatMap((family) => family.tokens.map((t) => `--${t.name}`)),
    ...Object.keys(tokens.type.families).map((key) => `--font-${key}`),
  ]);

  rmSync(outDir, { recursive: true, force: true });
  const project = join(outDir, 'project');
  const written = new Set();
  const write = (path, content) => {
    mkdirSync(dirname(join(project, path)), { recursive: true });
    writeFileSync(join(project, path), content);
    written.add(path);
  };
  const warnings = dropped.map((name) => `${name}: has a usage note in the draft but is no longer in @theme; dropped`);

  write('README.md', draft.readme);
  for (const path of draft.assets) write(path, readFileSync(join(draftDir, 'project', path)));
  for (const file of readdirSync(join(theme.web, 'fonts')).filter((f) => !FONT_FILE.test(f))) {
    write(`assets/Licenses/${file}`, readFileSync(join(theme.web, 'fonts', file)));
  }
  const groups = existsSync(join(project, 'assets'))
    ? readdirSync(join(project, 'assets')).filter((name) => statSync(join(project, 'assets', name)).isDirectory()).sort()
    : [];
  for (const group of groups) {
    if (!existsSync(join(project, 'assets', group, 'README.md'))) warnings.push(`assets/${group}: no README.md in the draft`);
  }
  for (const face of faces) write(face.file, readFileSync(join(theme.web, face.file)));
  write('tokens.json', `${JSON.stringify(tokens, null, 2)}\n`);
  write('components/bundle.css', await bundleCss(theme, declared));

  const harnessDir = join(outDir, 'harness');
  mkdirSync(harnessDir, { recursive: true });
  writeFileSync(join(harnessDir, 'tokens.css'), tokensCss(tokens));
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const heights = {};
  try {
    const { markup, lang } = await extractMarkup(browser, theme, draft.components, files);
    const frame = (body) =>
      `<!doctype html><html lang="${lang}" data-theme="${tokens.color.themes[0].id}"><head><meta charset="utf-8"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="../project/components/bundle.css"></head><body>${body}</body></html>`;
    const measure = async (name, body, width) => {
      const file = join(harnessDir, `${name}.html`);
      writeFileSync(file, frame(body));
      const page = await browser.newPage({ viewport: { width, height: 40 }, reducedMotion: 'reduce' });
      await page.goto(pathToFileURL(file).href);
      await page.evaluate(() => document.fonts.ready);
      const height = await page.evaluate(() => Math.max(40, Math.ceil(document.querySelector('body > :first-child').getBoundingClientRect().height)));
      await page.setViewportSize({ width, height });
      await page.screenshot({ path: join(harnessDir, `${name}.png`) });
      await page.close();
      return height;
    };
    for (const { name, readme, group } of draft.components) {
      const { kind, body } = markup.get(name);
      const file = files.get(name);
      const height = await measure(name, body, kind === 'piece' ? PIECE_WIDTH : BLOCK_WIDTH);
      heights[name] = height;
      const groupAttr = group === undefined ? '' : ` group="${group}"`;
      const marker =
        kind === 'piece'
          ? `<!-- @dsCard${groupAttr} height=${height} subtitle="components/${file} · prévia estática" -->`
          : `<!-- @dsCard${groupAttr} height=${Math.min(height, MAX_CARD_HEIGHT)} width=${BLOCK_WIDTH} subtitle="components/${file} · prévia estática, a ${BLOCK_WIDTH} px" -->`;
      write(
        `components/${name}/preview.html`,
        `${marker}\n<!doctype html>\n<html lang="${lang}">\n<head><meta charset="utf-8"><title>${name}</title></head>\n<body>\n${body}\n</body>\n</html>\n`,
      );
      write(`components/${name}/README.md`, readme);
    }
    if (draft.cover) {
      write('components/Cover/preview.html', draft.cover);
      const coverHeight = dsCardMarker(draft.cover)?.height ?? 288;
      const file = join(harnessDir, 'Cover.html');
      writeFileSync(file, draft.cover.replace('<head>', '<head><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="../project/components/bundle.css">'));
      const page = await browser.newPage({ viewport: { width: PIECE_WIDTH, height: coverHeight }, reducedMotion: 'reduce' });
      await page.goto(pathToFileURL(file).href);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(harnessDir, 'Cover.png') });
      await page.close();
    } else {
      warnings.push('the draft has no components/Cover/preview.html: the system has no cover');
    }
  } finally {
    await browser.close();
  }

  const kept = draft.keep(new Set([...written, 'design-system.json']));
  for (const path of kept) write(path, readFileSync(join(draftDir, 'project', path)));

  const lastChange = { by: info.user, at: now, via: `GitHub · ${info.repo}@${label.split('@').pop()}`, note };
  write('design-system.json', `${JSON.stringify(buildIndex({ index: draft.index, theme, groups, lastChange, now }), null, 2)}\n`);

  const summary = { title: theme.title, ref: label, components: draft.components.length, leftOut, kept, heights, warnings };
  writeFileSync(join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

// ---------------------------------------------------------------- command line

const USAGE = `usage:
  node scripts/publish.mjs build <theme dir> --from <draft dir> --out <build dir> --note "<one line>" [--ref <branch@sha>]
  node scripts/publish.mjs check <theme dir> <dir with project/>
  node scripts/publish.mjs diff <dir with project/> <dir with project/>`;

async function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { from: { type: 'string' }, out: { type: 'string' }, note: { type: 'string' }, ref: { type: 'string' } },
  });
  const [command, ...rest] = positionals;
  if (command === 'build' && rest.length === 1 && values.from && values.out && values.note) {
    const summary = await build({ themeDir: rest[0], draftDir: values.from, outDir: values.out, note: values.note, ref: values.ref });
    console.log(`built ${summary.title} at ${summary.ref}: ${summary.components} components, in ${join(values.out, 'project')}`);
    console.log(`left out of tokens.json (no place in the type): ${summary.leftOut.join(', ') || 'none'}`);
    console.log(`kept from the draft as they are: ${summary.kept.join(', ') || 'none'}`);
    for (const [name, height] of Object.entries(summary.heights)) console.log(`  ${name}: ${height} px`);
    for (const warning of summary.warnings) console.log(`warning: ${warning}`);
    return 0;
  }
  if (command === 'check' && rest.length === 2) {
    const { failures, stats } = checkProject(readTheme(rest[0]), rest[1]);
    console.log(`tokens checked against @theme: ${stats.tokens} of ${stats.themeTokens} variables`);
    console.log(`left out of tokens.json (no place in the type): ${stats.leftOut.join(', ') || 'none'}`);
    console.log(`text styles: ${stats.styles}; components: ${stats.components}`);
    for (const row of stats.fonts) console.log(`font: ${row}`);
    console.log(`index: "${stats.title}"`);
    if (failures.length) {
      console.log(`FAILURES (${failures.length}):\n${failures.join('\n')}`);
      return 1;
    }
    console.log('OK: the files agree with the app');
    return 0;
  }
  if (command === 'diff' && rest.length === 2) {
    const { same, differences, onlyStamps, files } = compareProjects(rest[0], rest[1]);
    console.log(`same: ${same} files`);
    for (const d of differences) {
      console.log(`${d.change}: ${d.path}${d.firstLine ? ` (from line ${d.firstLine})` : ''}`);
      for (const f of d.fields ?? []) console.log(`  ${f.key}${f.stamp ? ' (stamp)' : ''}: ${JSON.stringify(f.a)} -> ${JSON.stringify(f.b)}`);
    }
    console.log(differences.length === 0 ? 'no differences' : onlyStamps ? 'only stamps differ' : 'differences beyond stamps');
    console.log(`files: ${JSON.stringify(files)}`);
    return 0;
  }
  console.error(USAGE);
  return 2;
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
