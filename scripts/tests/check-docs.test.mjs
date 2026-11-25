import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkDocs } from '../check-docs.mjs';
import { makeProject, tempDir, writeTree } from './fixtures.mjs';

// A project whose documents agree with each other and with the app, in a catalog whose README lists it.
function consistentProject(overrides = {}) {
  const root = tempDir();
  writeTree(root, {
    'README.md': '# Catalog\n\n| Projeto |\n|---|\n| [demo-portal](projects/demo-portal/README.md) |\n',
  });
  return makeProject(root, {
    'README.md': '# demo-portal\n\n![Captura](screenshots/home-1440.png)\n\nSee [the design](DESIGN.md#cores-e-superfícies) and [the handoff](HANDOFF.md).\n',
    'DESIGN.md':
      '# Design\n\n## Cores e superfícies\n\n`--color-ink` is the page, 14 px text in `--text-14`. The translucent `--color-white-…` family.\n',
    'HANDOFF.md': '# Handoff\n\nRead [`globals.css`](web/app/globals.css) and keep `--radius-8`.\n',
    'screenshots/home-1440.png': 'png',
    'web/components/card.tsx': 'export function Card() { return <div className="rounded-8" />; }\n',
    ...overrides,
  });
}

test('documents that agree with each other and with the app pass', () => {
  const { failures, stats } = checkDocs(consistentProject());
  assert.deepEqual(failures, []);
  assert.equal(stats.links, 5);
});

test('a broken link fails in each document checked: the three of the project and the README of the catalog', () => {
  const broken = '[Gone](gone/README.md)\n';
  const cases = [
    ['README.md', 'README.md', `# demo-portal\n\n${broken}`],
    ['DESIGN.md', 'DESIGN.md', `# Design\n\n## Cores e superfícies\n\n${broken}`],
    ['HANDOFF.md', 'HANDOFF.md', `# Handoff\n\n${broken}`],
    [join('..', '..', 'README.md'), '../../README.md', `# Catalog\n\n${broken}`],
  ];
  for (const [file, label, text] of cases) {
    const project = consistentProject();
    writeTree(project, { [file]: text });
    assert.deepEqual(checkDocs(project).failures, [`${label}: broken link gone/README.md`], file);
  }
});

test('a relative link to a missing file fails', () => {
  const project = consistentProject({ 'HANDOFF.md': '# Handoff\n\nSee [the tests](web/tests/home.spec.ts).\n' });
  assert.deepEqual(checkDocs(project).failures, ['HANDOFF.md: broken link web/tests/home.spec.ts']);
});

test('a link to a heading that does not exist fails', () => {
  const project = consistentProject({ 'HANDOFF.md': '# Handoff\n\nSee [motion](DESIGN.md#movimento).\n' });
  assert.deepEqual(checkDocs(project).failures, ['HANDOFF.md: missing anchor DESIGN.md#movimento']);
});

test('a project folder outside projects/<project> is refused', () => {
  assert.throws(() => checkDocs(tempDir()), /a project folder is projects\/<project>$/);
});

test('a token the documents cite that @theme does not declare fails', () => {
  const project = consistentProject({
    'HANDOFF.md': '# Handoff\n\nKeep `--radius-8`, `--radius-12` and `--color-ink`.\n',
  });
  assert.deepEqual(checkDocs(project).failures, ['HANDOFF.md: tokens missing from @theme: --radius-12']);
});

// The section where DESIGN.md names the tokens that left the @theme: up to the next heading of its level.
const GONE = '### Tokens que saíram\n\nThe cycle lost `--color-fog` and `--radius-32`.\n';

test('the tokens DESIGN.md lists under "Tokens que saíram" are the ones gone from @theme', () => {
  const project = consistentProject({
    'DESIGN.md': `# Design\n\n## Cores e superfícies\n\n\`--color-ink\` is the page.\n\n${GONE}\n## Formas\n\nCards in \`--radius-8\`.\n`,
  });
  assert.deepEqual(checkDocs(project).failures, []);
});

test('a token listed as gone that @theme still declares fails, and the section ends at the next heading', () => {
  const project = consistentProject({
    'DESIGN.md': `# Design\n\n## Cores e superfícies\n\n${GONE}Also \`--radius-8\`.\n\n## Formas\n\nCards in \`--radius-32\`.\n`,
  });
  assert.deepEqual(checkDocs(project).failures, [
    'DESIGN.md: tokens missing from @theme: --radius-32',
    'DESIGN.md: tokens listed as gone but still in @theme: --radius-8',
  ]);
});

test('a literal value of DESIGN.md that the code does not have fails', () => {
  const project = consistentProject({
    'DESIGN.md': '# Design\n\n## Cores e superfícies\n\n`--color-ink` at 0,5 alpha, 18 px and #101010.\n',
  });
  assert.deepEqual(checkDocs(project).failures, ['DESIGN.md: values missing from the code: 18 px']);
});

test('an artifact address in a document fails', () => {
  // Joined at run time, so this file does not cite an address itself.
  const address = ['https://claude.ai', 'artifact', 'abc123'].join('/');
  const project = consistentProject({ 'HANDOFF.md': `# Handoff\n\nThe design is at ${address}.\n` });
  assert.deepEqual(checkDocs(project).failures, ['HANDOFF.md: cites an artifact address']);
});
