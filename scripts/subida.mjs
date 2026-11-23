// The Subida: the files of a theme's Design System artifact, built from the theme's app, and the checks
// around their publication. See scripts/README.md for the whole step by step.

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

// Line 1 of a preview.html: <!-- @dsCard group="…" height=N … -->.
function markerGroup(previewHtml) {
  const marker = previewHtml.split('\n', 1)[0];
  return /^<!-- @dsCard\b/.test(marker) ? marker.match(/\bgroup="([^"]*)"/)?.[1] : undefined;
}

// The text of a Design System artifact, from a directory holding its project/: the brand book, tokens.json
// (its usage notes, family notes, color themes and text styles), the index, the cover, the README and the
// group of each component, and the files under assets/. On a new publication it is the read-back of the
// published artifact; on a first one, what the agent wrote from DESIGN.md and the code.
export function readSource(fromDir) {
  const project = join(fromDir, 'project');
  const read = (path) => readFileSync(join(project, path), 'utf8');
  const has = (path) => existsSync(join(project, path));
  for (const required of ['README.md', 'tokens.json']) {
    if (!has(required)) throw new Error(`${fromDir}: the source needs project/${required}`);
  }
  const tokens = JSON.parse(read('tokens.json'));
  const folders = has('components')
    ? readdirSync(join(project, 'components')).filter(
        (name) => name !== 'Cover' && statSync(join(project, 'components', name)).isDirectory() && has(`components/${name}/README.md`),
      )
    : [];
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
      group: has(`components/${name}/preview.html`) ? markerGroup(read(`components/${name}/preview.html`)) : undefined,
    })),
    assets: listFiles(join(project, 'assets')).map((path) => `assets/${path}`),
  };
}

const assetGroup = (name) => ({ name, tile: 's', order: [], files: {} });

// project/design-system.json, the index. On a new publication, the index read back with every key kept
// (the page's islands among them) and only title, namespace and lastChange set; on a first one, a new
// index created now. Either way each asset group of the build has an entry.
export function buildIndex({ index, theme, groups, lastChange, now }) {
  let built;
  if (index) {
    if (index.v !== 3 || index.layout !== 'files' || !(index.createdOnFiles || index.convertedFrom)) {
      throw new Error('the source design-system.json has no marker of a system kept in files: write nothing over it');
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

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// How a text style shows a token's value: a fluid size at its clamp's maximum.
const STYLE_FIELDS = [
  ['fontSize', 'text-', (value, token) => value === token || value === token.match(/^clamp\(.+,\s*([^,]+)\)$/)?.[1]],
  ['fontWeight', 'font-weight-', (value, token) => String(value) === token],
  ['lineHeight', 'leading-', (value, token) => String(value) === token],
  ['letterSpacing', 'tracking-', (value, token) => value === token],
];

const hasMarker = (index) => index.v === 3 && index.layout === 'files' && Boolean(index.createdOnFiles || index.convertedFrom);

const componentFolders = (project) =>
  existsSync(join(project, 'components'))
    ? readdirSync(join(project, 'components'))
        .filter((name) => name !== 'Cover' && statSync(join(project, 'components', name)).isDirectory())
        .sort()
    : [];

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
    if (PLACEMENT.find(([, pattern]) => pattern.test(name))?.[0] === 'out') leftOut.push(name);
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
    else if (!/^<!-- @dsCard\b.*-->$/.test(readFileSync(preview, 'utf8').split('\n', 1)[0])) {
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

// Where each @theme token goes in tokens.json, by Tailwind namespace: a family of the type, the font
// stacks of `type.families`, or left out (motion and Tailwind's default aliases, which the type has no
// place for). The first pattern that matches wins. A token no pattern matches stops the build: add its
// namespace here.
const PLACEMENT = [
  ['color', /^--color-/],
  ['fontWeight', /^--font-weight-/],
  ['family', /^--font-[\w-]+$/],
  ['fontSize', /^--text-/],
  ['letterSpacing', /^--tracking-/],
  ['lineHeight', /^--leading-/],
  ['spacing', /^--spacing$/],
  ['layout', /^--(spacing-|container-|grid-template-columns-|grow-)/],
  ['radius', /^--radius-/],
  ['shadow', /^--shadow-/],
  ['blur', /^--blur-/],
  ['focus', /^--outline-(width|offset)-/],
  ['out', /^--(default-|ease-|duration-|delay-|animate-)/],
];

// The order of the families in tokens.json: the type's own, then the further ones.
const FAMILY_ORDER = ['spacing', 'radius', 'shadow', 'layout', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'blur', 'focus'];

const isFamily = (value) => value && typeof value === 'object' && Array.isArray(value.tokens);

// tokens.json from the theme's @theme and the source's text. Values come from @theme, in its order; each
// token's usage note, each family's note, the color themes and the text styles come from the source
// tokens.json (a read-back of the artifact, or what the agent wrote for a first publication).
// Returns the object, the @theme tokens left out, and the tokens the source had that @theme no longer has.
export function buildTokens({ theme, faces, source, meta }) {
  const usage = new Map();
  for (const family of Object.values(source)) {
    if (!isFamily(family)) continue;
    for (const token of family.tokens) if (token.usage) usage.set(`--${token.name}`, token.usage);
  }

  const families = {};
  const fontFamilies = {};
  const leftOut = [];
  const unplaced = [];
  const missing = [];
  for (const [name, value] of theme.tokens) {
    const family = PLACEMENT.find(([, pattern]) => pattern.test(name))?.[0];
    if (!family) unplaced.push(name);
    else if (family === 'out') leftOut.push(name);
    else if (family === 'family') fontFamilies[name.slice('--font-'.length)] = value;
    else if (!usage.has(name)) missing.push(`${name} (${family})`);
    else (families[family] ??= []).push({ name: name.slice(2), value, usage: usage.get(name) });
  }
  if (unplaced.length) {
    throw new Error(`no tokens.json family for ${unplaced.join(', ')}: add the namespace to PLACEMENT in scripts/subida.mjs`);
  }
  if (missing.length) {
    throw new Error(`the source tokens.json has no usage note for:\n  ${missing.join('\n  ')}`);
  }
  if (!Array.isArray(source.color?.themes) || source.color.themes.length === 0) {
    throw new Error('the source tokens.json needs color.themes, e.g. [{"id": "dark", "name": "Escuro"}]');
  }
  if (!Array.isArray(source.type?.groups) || source.type.groups.length === 0) {
    throw new Error('the source tokens.json needs type.groups, the text styles');
  }

  const tokens = {
    name: theme.title,
    version: source.version ?? 1,
    meta,
    color: { themes: source.color.themes, tokens: families.color ?? [] },
    type: { fonts: faces, families: fontFamilies, groups: source.type.groups },
  };
  for (const key of FAMILY_ORDER) {
    if (!families[key]) continue;
    const note = source[key]?.note;
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
