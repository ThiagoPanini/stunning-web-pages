import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readTheme } from '../theme.mjs';
import { makeTheme, tempDir } from './fixtures.mjs';

test('a theme is named by its README heading and its project folder', () => {
  const theme = readTheme(makeTheme(tempDir(), { 'README.md': '# Aurora Índigo\n\nText.\n' }));
  assert.equal(theme.project, 'demo-portal');
  assert.equal(theme.name, 'Aurora Índigo');
  assert.equal(theme.title, 'demo-portal · Aurora Índigo');
  assert.equal(theme.namespace, 'AuroraIndigo');
});

test('the @theme tokens come in order, with comments and namespace resets left out', () => {
  const theme = readTheme(makeTheme(tempDir()));
  assert.deepEqual([...theme.tokens.entries()].slice(0, 5), [
    ['--spacing', '0.25rem'],
    ['--font-sans', '"Aurora Sans", system-ui, sans-serif'],
    ['--default-font-family', 'var(--font-sans)'],
    ['--color-ink', '#101010'],
    ['--color-paper', 'rgba(255, 255, 255, 0.5)'],
  ]);
  assert.equal(theme.tokens.size, 12);
});

test('every @theme block counts, whatever its options', () => {
  const css = '@theme {\n  --color-a: #000;\n}\n\n.x { --color-b: #fff; }\n\n@theme inline {\n  --color-c: #111;\n}\n';
  const theme = readTheme(makeTheme(tempDir(), { 'web/app/globals.css': css }));
  assert.deepEqual([...theme.tokens.keys()], ['--color-a', '--color-c']);
});

test('a folder outside projects/<project>/themes/<theme> is refused', () => {
  const root = tempDir();
  assert.throws(() => readTheme(root), /projects\/<project>\/themes\/<theme>/);
});
