import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { readProject } from '../project.mjs';
import { makeProject, tempDir, writeTree } from './fixtures.mjs';

test('a project is named by its README heading, and its namespace comes from that name alone', () => {
  const project = readProject(makeProject(tempDir(), { 'README.md': '# Portal Índigo\n\nText.\n' }));
  assert.equal(project.name, 'Portal Índigo');
  assert.equal(project.namespace, 'PortalIndigo');
});

test('a slug heading gives a namespace of its capitalized words', () => {
  const project = readProject(makeProject(tempDir(), { 'README.md': '# demo-portal\n\nText.\n' }));
  assert.equal(project.name, 'demo-portal');
  assert.equal(project.namespace, 'DemoPortal');
});

test("the project's app is web/ in its folder", () => {
  const dir = makeProject(tempDir());
  const project = readProject(dir);
  assert.equal(project.dir, dir);
  assert.equal(project.web, join(dir, 'web'));
});

test('the @theme tokens come in order, with comments and namespace resets left out', () => {
  const project = readProject(makeProject(tempDir()));
  assert.deepEqual([...project.tokens.entries()].slice(0, 5), [
    ['--spacing', '0.25rem'],
    ['--font-sans', '"Aurora Sans", system-ui, sans-serif'],
    ['--default-font-family', 'var(--font-sans)'],
    ['--color-ink', '#101010'],
    ['--color-paper', 'rgba(255, 255, 255, 0.5)'],
  ]);
  assert.equal(project.tokens.size, 12);
});

test('every @theme block counts, whatever its options', () => {
  const css = '@theme {\n  --color-a: #000;\n}\n\n.x { --color-b: #fff; }\n\n@theme inline {\n  --color-c: #111;\n}\n';
  const project = readProject(makeProject(tempDir(), { 'web/app/globals.css': css }));
  assert.deepEqual([...project.tokens.keys()], ['--color-a', '--color-c']);
});

test('a folder outside projects/<project> is refused, with the accepted form in the message', () => {
  assert.throws(() => readProject(tempDir()), /: a project folder is projects\/<project>$/);
});

test('a folder nested inside a project folder is refused, even with a README and an app of its own', () => {
  const root = tempDir();
  makeProject(root);
  const nested = join(root, 'projects', 'demo-portal', 'designs', 'aurora');
  writeTree(nested, { 'README.md': '# Aurora\n', 'web/app/globals.css': '@theme {\n  --color-a: #000;\n}\n' });
  assert.throws(() => readProject(nested), /: a project folder is projects\/<project>$/);
});

test('a README without a "# " heading is refused', () => {
  const dir = makeProject(tempDir(), { 'README.md': 'No heading here.\n' });
  assert.throws(() => readProject(dir), /README\.md: no "# <name>" heading to name the project/);
});
