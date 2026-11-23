import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkProject, compareProjects } from '../publish.mjs';
import { readTheme } from '../theme.mjs';
import { makeTheme, tempDir, writeTree } from './fixtures.mjs';

const FONT = 'not really a woff2, but bytes all the same';

function tokensJson(overrides = {}) {
  return {
    name: 'demo-portal · Aurora',
    version: 1,
    meta: { components: { Card: 'components/card.tsx' } },
    color: {
      themes: [{ id: 'dark', name: 'Escuro' }],
      tokens: [
        { name: 'color-ink', value: '#101010', usage: 'Page.' },
        { name: 'color-paper', value: 'rgba(255, 255, 255, 0.5)', usage: 'Veil.' },
      ],
    },
    type: {
      fonts: [{ family: 'Aurora Sans', file: 'fonts/aurora.woff2', weight: '100 900', style: 'normal' }],
      families: { sans: '"Aurora Sans", system-ui, sans-serif' },
      groups: [
        {
          name: 'Títulos',
          family: 'sans',
          styles: [
            {
              name: 'title',
              family: 'sans',
              fontSize: '40px',
              fontWeight: 300,
              lineHeight: 1.5,
              letterSpacing: '-0.02em',
              usage: 'Títulos. Tamanho text-20-40 (fluido), peso font-weight-light, altura de linha leading-150, espaçamento tracking-tight-20.',
            },
          ],
        },
      ],
    },
    spacing: { tokens: [{ name: 'spacing', value: '0.25rem', usage: 'Base.' }] },
    radius: { tokens: [{ name: 'radius-8', value: '8px', usage: 'Cards.' }] },
    fontSize: {
      tokens: [
        { name: 'text-14', value: '14px', usage: 'Body.' },
        { name: 'text-20-40', value: 'clamp(20px, 3vw, 40px)', usage: 'Titles.' },
      ],
    },
    fontWeight: { tokens: [{ name: 'font-weight-light', value: '300', usage: 'Titles.' }] },
    letterSpacing: { tokens: [{ name: 'tracking-tight-20', value: '-0.02em', usage: 'Titles.' }] },
    lineHeight: { tokens: [{ name: 'leading-150', value: '1.5', usage: 'Body.' }] },
    ...overrides,
  };
}

const INDEX = { v: 3, layout: 'files', createdOnFiles: { v: 1, at: 'x' }, title: 'demo-portal · Aurora' };

// The theme Aurora and a project/ that agrees with it, with any file replaced.
function setup(files = {}) {
  const root = tempDir();
  const theme = readTheme(makeTheme(root, { 'web/fonts/aurora.woff2': FONT }));
  const dir = writeTree(tempDir(), {
    'project/README.md': 'Corners are `radius-8` (`8px`); the base is `spacing` (`0.25rem`).\n',
    'project/tokens.json': JSON.stringify(tokensJson()),
    'project/design-system.json': JSON.stringify(INDEX),
    'project/fonts/aurora.woff2': FONT,
    'project/components/Card/README.md': '# Card\n\nA card.\n',
    'project/components/Card/preview.html': '<!-- @dsCard group="Cartões" height=120 -->\n<!doctype html>\n',
    ...files,
  });
  return { theme, dir };
}

test('a project that agrees with the app passes', () => {
  const { theme, dir } = setup();
  const { failures, stats } = checkProject(theme, dir);
  assert.deepEqual(failures, []);
  assert.equal(stats.tokens, 10);
  assert.deepEqual(stats.leftOut, ['--default-font-family', '--ease-enter']);
});

test('a token value that is not the one of @theme fails, and so does an @theme token left behind', () => {
  const tokens = tokensJson({ radius: { tokens: [{ name: 'radius-8', value: '6px', usage: 'Cards.' }] }, spacing: undefined });
  const { theme, dir } = setup({ 'project/tokens.json': JSON.stringify(tokens) });
  assert.deepEqual(checkProject(theme, dir).failures, [
    'radius/radius-8: "6px", @theme has "8px"',
    '--spacing: in @theme, missing from tokens.json',
  ]);
});

test('a text style must have the values of the tokens its usage cites', () => {
  const tokens = tokensJson();
  const [style] = tokens.type.groups[0].styles;
  style.fontSize = '20px';
  style.usage = 'Títulos. Tamanho text-20-40, peso font-weight-light, altura de linha leading-150.';
  const { theme, dir } = setup({ 'project/tokens.json': JSON.stringify(tokens) });
  assert.deepEqual(checkProject(theme, dir).failures, [
    'style title: fontSize 20px is not the value of text-20-40',
    'style title: letterSpacing -0.02em, but its usage cites no tracking-… token',
  ]);
});

test('a font that is not the app file, byte for byte, fails', () => {
  const { theme, dir } = setup({ 'project/fonts/aurora.woff2': 'other bytes' });
  const [failure] = checkProject(theme, dir).failures;
  assert.match(failure, /^fonts\/aurora\.woff2: sha256 [0-9a-f]{16}… differs from the app's/);
});

test('a value the brand book writes next to a token name must be the one of @theme', () => {
  const { theme, dir } = setup({ 'project/README.md': 'Cards round at `radius-8` (`6px`).\n' });
  assert.deepEqual(checkProject(theme, dir).failures, ['README.md: `radius-8` (`6px`), @theme has 8px']);
});

test('a component without its preview marker or README fails', () => {
  const { theme, dir } = setup({
    'project/components/Card/preview.html': '<!doctype html>\n',
    'project/components/Badge/preview.html': '<!-- @dsCard height=40 -->\n',
  });
  assert.deepEqual(checkProject(theme, dir).failures, [
    'components/Badge: no README.md',
    'components/Card/preview.html: line 1 is not the @dsCard marker',
  ]);
});

test('the index must carry the marker and the theme title', () => {
  const { theme, dir } = setup({ 'project/design-system.json': JSON.stringify({ ...INDEX, title: 'Aurora' }) });
  assert.deepEqual(checkProject(theme, dir).failures, ['design-system.json: title "Aurora", the theme is "demo-portal · Aurora"']);
});

test('two identical builds have no differences', () => {
  const { dir } = setup();
  const result = compareProjects(dir, dir);
  assert.deepEqual(result.differences, []);
  assert.equal(result.onlyStamps, true);
  assert.deepEqual(result.files, {});
});

test('dates, refs and the commit of the build are stamps', () => {
  const { dir: before } = setup();
  const { dir: after } = setup({
    'project/tokens.json': JSON.stringify(tokensJson({ meta: { ref: 'main@2', synced: '2026-11-23', components: {} } })),
    'project/design-system.json': JSON.stringify({ ...INDEX, lastChange: { by: 'Ana', at: '2026-11-23T10:00:00Z' } }),
  });
  writeTree(before, {
    'project/tokens.json': JSON.stringify(tokensJson({ meta: { ref: 'main@1', synced: '2026-11-22', components: {} } })),
    'project/design-system.json': JSON.stringify({ ...INDEX, lastChange: { by: 'Ana', at: '2026-11-22T10:00:00Z' } }),
  });
  const result = compareProjects(before, after);
  assert.deepEqual(result.differences, [
    {
      path: 'project/design-system.json',
      change: 'changed',
      fields: [{ key: 'lastChange.at', a: '2026-11-22T10:00:00Z', b: '2026-11-23T10:00:00Z', stamp: true }],
    },
    {
      path: 'project/tokens.json',
      change: 'changed',
      fields: [
        { key: 'meta.ref', a: 'main@1', b: 'main@2', stamp: true },
        { key: 'meta.synced', a: '2026-11-22', b: '2026-11-23', stamp: true },
      ],
    },
  ]);
  assert.equal(result.onlyStamps, true);
  assert.deepEqual(result.files, { 'project/tokens.json': 'project/tokens.json' });
});

test('a changed text and a new file are differences to publish', () => {
  const { dir: before } = setup();
  const { dir: after } = setup({
    'project/README.md': 'New brand book.\n',
    'project/components/Badge/README.md': '# Badge\n',
  });
  const result = compareProjects(before, after);
  assert.deepEqual(
    result.differences.map(({ path, change }) => ({ path, change })),
    [
      { path: 'project/README.md', change: 'changed' },
      { path: 'project/components/Badge/README.md', change: 'added' },
    ],
  );
  assert.equal(result.onlyStamps, false);
  assert.deepEqual(result.files, {
    'project/README.md': 'project/README.md',
    'project/components/Badge/README.md': 'project/components/Badge/README.md',
  });
});
