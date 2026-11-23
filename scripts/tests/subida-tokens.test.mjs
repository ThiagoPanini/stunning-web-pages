import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildTokens, parseFontFaces } from '../subida.mjs';
import { readTheme } from '../theme.mjs';
import { makeTheme, tempDir } from './fixtures.mjs';

const FACES = [{ family: 'Aurora Sans', file: 'fonts/aurora.woff2', weight: '100 900', style: 'normal' }];
const META = { source: 'github', ref: 'main@abc1234' };
const GROUPS = [
  {
    name: 'Texto',
    family: 'sans',
    styles: [{ name: 'body', family: 'sans', fontSize: '14px', fontWeight: 300, lineHeight: 1.5, usage: 'Base. Tamanho text-14.' }],
  },
];

// The source as a published artifact reads back: old values, which the build ignores, and the text it keeps.
const SOURCE = {
  name: 'stale name',
  version: 1,
  color: {
    themes: [{ id: 'dark', name: 'Escuro' }],
    tokens: [
      { name: 'color-ink', value: '#000000', usage: 'Page.' },
      { name: 'color-paper', value: '#ffffff', usage: 'Veil.' },
      { name: 'color-gone', value: '#123456', usage: 'No longer in @theme.' },
    ],
  },
  type: { fonts: [], families: {}, groups: GROUPS },
  spacing: { tokens: [{ name: 'spacing', value: '4px', usage: 'Base.' }] },
  radius: { tokens: [{ name: 'radius-8', value: '8px', usage: 'Cards.' }] },
  fontSize: {
    note: 'Sizes.',
    tokens: [
      { name: 'text-14', value: '14px', usage: 'Body.' },
      { name: 'text-20-40', value: '40px', usage: 'Titles.' },
    ],
  },
  fontWeight: { tokens: [{ name: 'font-weight-light', value: '300', usage: 'Titles.' }] },
  letterSpacing: { tokens: [{ name: 'tracking-tight-20', value: '0', usage: 'Titles.' }] },
  lineHeight: { tokens: [{ name: 'leading-150', value: '1', usage: 'Body.' }] },
};

test('the tokens take their values from @theme and their text from the source', () => {
  const theme = readTheme(makeTheme(tempDir()));
  const { tokens, leftOut, dropped } = buildTokens({ theme, faces: FACES, source: SOURCE, meta: META });
  assert.deepEqual(tokens, {
    name: 'demo-portal · Aurora',
    version: 1,
    meta: META,
    color: {
      themes: [{ id: 'dark', name: 'Escuro' }],
      tokens: [
        { name: 'color-ink', value: '#101010', usage: 'Page.' },
        { name: 'color-paper', value: 'rgba(255, 255, 255, 0.5)', usage: 'Veil.' },
      ],
    },
    type: { fonts: FACES, families: { sans: '"Aurora Sans", system-ui, sans-serif' }, groups: GROUPS },
    spacing: { tokens: [{ name: 'spacing', value: '0.25rem', usage: 'Base.' }] },
    radius: { tokens: [{ name: 'radius-8', value: '8px', usage: 'Cards.' }] },
    fontSize: {
      note: 'Sizes.',
      tokens: [
        { name: 'text-14', value: '14px', usage: 'Body.' },
        { name: 'text-20-40', value: 'clamp(20px, 3vw, 40px)', usage: 'Titles.' },
      ],
    },
    fontWeight: { tokens: [{ name: 'font-weight-light', value: '300', usage: 'Titles.' }] },
    letterSpacing: { tokens: [{ name: 'tracking-tight-20', value: '-0.02em', usage: 'Titles.' }] },
    lineHeight: { tokens: [{ name: 'leading-150', value: '1.5', usage: 'Body.' }] },
  });
  assert.deepEqual(leftOut, ['--default-font-family', '--ease-enter']);
  assert.deepEqual(dropped, ['--color-gone']);
});

test('every @theme token without a usage note in the source is named, with its family', () => {
  const theme = readTheme(makeTheme(tempDir()));
  const source = { ...SOURCE, radius: { tokens: [] }, spacing: undefined };
  assert.throws(
    () => buildTokens({ theme, faces: FACES, source, meta: META }),
    (error) => {
      assert.match(error.message, /--spacing \(spacing\)/);
      assert.match(error.message, /--radius-8 \(radius\)/);
      return true;
    },
  );
});

test('a source without color themes or text styles is refused', () => {
  const theme = readTheme(makeTheme(tempDir()));
  assert.throws(
    () => buildTokens({ theme, faces: FACES, source: { ...SOURCE, color: { tokens: SOURCE.color.tokens } }, meta: META }),
    /color\.themes/,
  );
  assert.throws(
    () => buildTokens({ theme, faces: FACES, source: { ...SOURCE, type: {} }, meta: META }),
    /type\.groups/,
  );
});

test('a token in no known family stops the build', () => {
  const theme = readTheme(
    makeTheme(tempDir(), { 'web/app/globals.css': '@theme {\n  --color-a: #000;\n  --aspect-video: 16 / 9;\n}\n' }),
  );
  assert.throws(() => buildTokens({ theme, faces: FACES, source: SOURCE, meta: META }), /--aspect-video/);
});

test('the font faces are the localFont calls of fonts.ts, with the family the app declares', () => {
  const fontsTs = `import localFont from "next/font/local";

export const sans = localFont({
  src: "../fonts/aurora-sans.woff2",
  weight: "100 900",
  display: "swap",
  declarations: [
    { prop: "font-family", value: "Aurora Sans" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131",
    },
  ],
});

export const serif = localFont({
  src: "../fonts/aurora-serif-italic.woff2",
  weight: "400",
  style: "italic",
  declarations: [{ prop: "font-family", value: "Aurora Serif" }],
});
`;
  assert.deepEqual(parseFontFaces(fontsTs), [
    { family: 'Aurora Sans', file: 'fonts/aurora-sans.woff2', weight: '100 900', style: 'normal', unicodeRange: 'U+0000-00FF, U+0131' },
    { family: 'Aurora Serif', file: 'fonts/aurora-serif-italic.woff2', weight: '400', style: 'italic' },
  ]);
});

test('a localFont call that does not declare its family is refused', () => {
  const fontsTs = 'export const sans = localFont({\n  src: "../fonts/a.woff2",\n  weight: "400",\n});\n';
  assert.throws(() => parseFontFaces(fontsTs), /font-family/);
});
