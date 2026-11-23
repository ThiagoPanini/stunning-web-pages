import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkDocs } from '../check-docs.mjs';
import { makeTheme, tempDir, writeTree } from './fixtures.mjs';

// A theme whose documents agree with each other and with the app.
function consistentTheme(overrides = {}) {
  const root = tempDir();
  writeTree(root, {
    'projects/demo-portal/README.md': '# demo-portal\n\n| Tema |\n|---|\n| [Aurora](themes/aurora/README.md) |\n',
  });
  return makeTheme(root, {
    'README.md': '# Aurora\n\n![Captura](screenshots/home-1440.png)\n\nSee [the design](DESIGN.md#cores-e-superfícies) and [the handoff](HANDOFF.md).\n',
    'DESIGN.md':
      '# Design\n\n## Cores e superfícies\n\n`--color-ink` is the page, 14 px text in `--text-14`. The translucent `--color-white-…` family.\n',
    'HANDOFF.md': '# Handoff\n\nRead [`globals.css`](web/app/globals.css) and keep `--radius-8`.\n',
    'screenshots/home-1440.png': 'png',
    'web/components/card.tsx': 'export function Card() { return <div className="rounded-8" />; }\n',
    ...overrides,
  });
}

test('documents that agree with each other and with the app pass', () => {
  const { failures, stats } = checkDocs(consistentTheme());
  assert.deepEqual(failures, []);
  assert.equal(stats.links, 5);
});

test('a relative link to a missing file fails', () => {
  const theme = consistentTheme({ 'HANDOFF.md': '# Handoff\n\nSee [the tests](web/tests/home.spec.ts).\n' });
  assert.deepEqual(checkDocs(theme).failures, ['HANDOFF.md: broken link web/tests/home.spec.ts']);
});

test('a link to a heading that does not exist fails', () => {
  const theme = consistentTheme({ 'HANDOFF.md': '# Handoff\n\nSee [motion](DESIGN.md#movimento).\n' });
  assert.deepEqual(checkDocs(theme).failures, ['HANDOFF.md: missing anchor DESIGN.md#movimento']);
});

test('the project README is checked with the theme documents', () => {
  const theme = consistentTheme();
  writeTree(join(theme, '..', '..'), { 'README.md': '# demo-portal\n\n[Gone](themes/gone/README.md)\n' });
  assert.deepEqual(checkDocs(theme).failures, ['../../README.md: broken link themes/gone/README.md']);
});

test('a token the documents cite that @theme does not declare fails', () => {
  const theme = consistentTheme({
    'HANDOFF.md': '# Handoff\n\nKeep `--radius-8`, `--radius-12` and `--color-ink`.\n',
  });
  assert.deepEqual(checkDocs(theme).failures, ['HANDOFF.md: tokens missing from @theme: --radius-12']);
});

test('a literal value of DESIGN.md that the code does not have fails', () => {
  const theme = consistentTheme({
    'DESIGN.md': '# Design\n\n## Cores e superfícies\n\n`--color-ink` at 0,5 alpha, 18 px and #101010.\n',
  });
  assert.deepEqual(checkDocs(theme).failures, ['DESIGN.md: values missing from the code: 18 px']);
});

test('an artifact address in a document fails', () => {
  // Joined at run time, so this file does not cite an address itself.
  const address = ['https://claude.ai', 'artifact', 'abc123'].join('/');
  const theme = consistentTheme({ 'HANDOFF.md': `# Handoff\n\nThe design is at ${address}.\n` });
  assert.deepEqual(checkDocs(theme).failures, ['HANDOFF.md: cites an artifact address']);
});
