import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildTokens, parseFontFaces } from '../publish.mjs';
import { readProject } from '../project.mjs';
import { makeProject, tempDir } from './fixtures.mjs';

const FACES = [{ family: 'Aurora Sans', file: 'fonts/aurora.woff2', weight: '100 900', style: 'normal' }];
const META = { source: 'github', ref: 'main@abc1234' };
const GROUPS = [
  {
    name: 'Texto',
    family: 'sans',
    styles: [{ name: 'body', family: 'sans', fontSize: '14px', fontWeight: 300, lineHeight: 1.5, usage: 'Base. Tamanho text-14.' }],
  },
];

// The draft as a published artifact reads back: old values, which the build ignores, and the text it keeps.
const DRAFT = {
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

test('the tokens take their values from @theme and their text from the draft', () => {
  const project = readProject(makeProject(tempDir()));
  const { tokens, leftOut, dropped } = buildTokens({ project, faces: FACES, draft: DRAFT, meta: META });
  assert.deepEqual(tokens, {
    name: 'demo-portal',
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

test('a transition duration is motion, left out with the other motion tokens', () => {
  const project = readProject(
    makeProject(tempDir(), {
      'web/app/globals.css': `@theme {
  --color-ink: #101010;
  --default-transition-duration: 0.2s;
  --transition-duration-slow: 0.25s;
}
`,
    }),
  );
  const { tokens, leftOut } = buildTokens({ project, faces: FACES, draft: DRAFT, meta: META });
  assert.deepEqual(leftOut, ['--default-transition-duration', '--transition-duration-slow']);
  assert.equal(JSON.stringify(tokens).includes('transition'), false);
});

test('every @theme token without a usage note in the draft is named, with its family', () => {
  const project = readProject(makeProject(tempDir()));
  const draft = { ...DRAFT, radius: { tokens: [] }, spacing: undefined };
  assert.throws(
    () => buildTokens({ project, faces: FACES, draft, meta: META }),
    (error) => {
      assert.match(error.message, /--spacing \(spacing\)/);
      assert.match(error.message, /--radius-8 \(radius\)/);
      return true;
    },
  );
});

test('a draft without color themes or text styles is refused', () => {
  const project = readProject(makeProject(tempDir()));
  assert.throws(
    () => buildTokens({ project, faces: FACES, draft: { ...DRAFT, color: { tokens: DRAFT.color.tokens } }, meta: META }),
    /color\.themes/,
  );
  assert.throws(
    () => buildTokens({ project, faces: FACES, draft: { ...DRAFT, type: {} }, meta: META }),
    /type\.groups/,
  );
});

test('a token in no known family stops the build', () => {
  const project = readProject(
    makeProject(tempDir(), { 'web/app/globals.css': '@theme {\n  --color-a: #000;\n  --perspective-near: 300px;\n}\n' }),
  );
  assert.throws(() => buildTokens({ project, faces: FACES, draft: DRAFT, meta: META }), /--perspective-near/);
});

test('an aspect ratio goes to the layout family', () => {
  const project = readProject(
    makeProject(tempDir(), { 'web/app/globals.css': '@theme {\n  --color-ink: #101010;\n  --aspect-4-3: 4 / 3;\n}\n' }),
  );
  const draft = { ...DRAFT, layout: { tokens: [{ name: 'aspect-4-3', usage: 'Media.' }] } };
  const { tokens } = buildTokens({ project, faces: FACES, draft, meta: META });
  assert.deepEqual(tokens.layout, { tokens: [{ name: 'aspect-4-3', value: '4 / 3', usage: 'Media.' }] });
});

test('a grid of auto columns goes to the layout family, with the named grids', () => {
  const project = readProject(
    makeProject(tempDir(), {
      'web/app/globals.css': `@theme {
  --color-ink: #101010;
  --grid-template-columns-hero: minmax(0, 1fr) minmax(0, 600px);
  --grid-auto-columns-tabs: minmax(136px, 1fr);
}
`,
    }),
  );
  const draft = {
    ...DRAFT,
    layout: {
      tokens: [
        { name: 'grid-template-columns-hero', usage: 'Hero.' },
        { name: 'grid-auto-columns-tabs', usage: 'Tabs.' },
      ],
    },
  };
  const { tokens } = buildTokens({ project, faces: FACES, draft, meta: META });
  assert.deepEqual(tokens.layout, {
    tokens: [
      { name: 'grid-template-columns-hero', value: 'minmax(0, 1fr) minmax(0, 600px)', usage: 'Hero.' },
      { name: 'grid-auto-columns-tabs', value: 'minmax(136px, 1fr)', usage: 'Tabs.' },
    ],
  });
});

test('a drawn background is left out, as the type takes no var() or url() in a value', () => {
  const project = readProject(
    makeProject(tempDir(), {
      'web/app/globals.css': `@theme {
  --color-ink: #101010;
  --background-image-hatch: repeating-linear-gradient(
    135deg,
    var(--color-ink) 0 1px,
    transparent 1px 9px
  );
}
`,
    }),
  );
  const { tokens, leftOut } = buildTokens({ project, faces: FACES, draft: DRAFT, meta: META });
  assert.deepEqual(leftOut, ['--background-image-hatch']);
  assert.deepEqual(tokens.color.tokens, [{ name: 'color-ink', value: '#101010', usage: 'Page.' }]);
  assert.equal(JSON.stringify(tokens).includes('background-image'), false);
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
