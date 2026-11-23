import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildIndex, readSource } from '../publish.mjs';
import { tempDir, writeTree } from './fixtures.mjs';

const THEME = { title: 'demo-portal · Aurora', namespace: 'Aurora' };
const LAST_CHANGE = { by: 'Ana', at: '2026-11-23T10:00:00Z', via: 'GitHub · owner/repo@abc1234', note: 'New colors.' };

test('the source lists its components in the order tokens.json records, then the new ones by name', () => {
  const dir = writeTree(tempDir(), {
    'project/README.md': 'Brand book.\n',
    'project/tokens.json': JSON.stringify({ meta: { components: { Card: 'components/card.tsx', Badge: 'x' } } }),
    'project/components/Badge/README.md': '# Badge\n\nA badge.\n',
    'project/components/Badge/preview.html': '<!-- @dsCard group="Marca" height=180 subtitle="old" -->\n<!doctype html>\n',
    'project/components/Card/README.md': '# Card\n\nA card.\n',
    'project/components/Card/preview.html': '<!-- @dsCard height=120 -->\n',
    'project/components/Alert/README.md': '# Alert\n\nNew.\n',
    'project/components/Cover/preview.html': '<!-- @dsCard height=288 -->\n<p>cover</p>\n',
    'project/assets/Licenses/README.md': '# Licenças\n',
  });
  const source = readSource(dir);
  assert.deepEqual(
    source.components.map(({ name, group }) => ({ name, group })),
    [
      { name: 'Card', group: undefined },
      { name: 'Badge', group: 'Marca' },
      { name: 'Alert', group: undefined },
    ],
  );
  assert.equal(source.components[1].readme, '# Badge\n\nA badge.\n');
  assert.equal(source.cover, '<!-- @dsCard height=288 -->\n<p>cover</p>\n');
  assert.equal(source.readme, 'Brand book.\n');
  assert.deepEqual(source.assets, ['assets/Licenses/README.md']);
  assert.equal(source.index, undefined);
});

test('a source without the brand book or tokens.json is refused', () => {
  assert.throws(() => readSource(writeTree(tempDir(), { 'project/tokens.json': '{}' })), /project\/README\.md/);
  assert.throws(() => readSource(writeTree(tempDir(), { 'project/README.md': 'x' })), /project\/tokens\.json/);
});

test('a new publication keeps every key of the index read back and changes title, namespace and lastChange', () => {
  const index = {
    v: 3,
    layout: 'files',
    createdOnFiles: { v: 1, at: '2026-11-01T00:00:00Z' },
    title: 'old title',
    namespace: 'Old',
    libraries: [],
    sections: { Card: 'Cartão' },
    groups: ['Licenses'],
    assetGroups: { Licenses: { name: 'Licenses', tile: 'm', order: [], files: {} } },
    blobs: {},
    docs: { readme: 'project/README.md', sections: [] },
    lastChange: { by: 'Bia', at: '2026-11-01T00:00:00Z', note: 'First.' },
  };
  const built = buildIndex({ index, theme: THEME, groups: ['Licenses'], lastChange: LAST_CHANGE, now: 'unused' });
  assert.deepEqual(JSON.stringify(built), JSON.stringify({ ...index, title: THEME.title, namespace: 'Aurora', lastChange: LAST_CHANGE }));
});

test('a first publication gets a new index, created now, with one entry per asset group', () => {
  const built = buildIndex({ theme: THEME, groups: ['Licenses'], lastChange: LAST_CHANGE, now: '2026-11-23T10:00:00Z' });
  assert.deepEqual(JSON.stringify(built), JSON.stringify({
    v: 3,
    layout: 'files',
    createdOnFiles: { v: 1, at: '2026-11-23T10:00:00Z' },
    title: 'demo-portal · Aurora',
    namespace: 'Aurora',
    libraries: [],
    sections: {},
    groups: ['Licenses'],
    assetGroups: { Licenses: { name: 'Licenses', tile: 's', order: [], files: {} } },
    blobs: {},
    docs: { readme: 'project/README.md', sections: [] },
    lastChange: LAST_CHANGE,
  }));
});

test('an asset group new in the build joins the index read back', () => {
  const index = { v: 3, layout: 'files', createdOnFiles: { v: 1, at: 'x' }, groups: [], assetGroups: {} };
  const built = buildIndex({ index, theme: THEME, groups: ['Logos'], lastChange: LAST_CHANGE, now: 'unused' });
  assert.deepEqual(built.groups, ['Logos']);
  assert.deepEqual(built.assetGroups, { Logos: { name: 'Logos', tile: 's', order: [], files: {} } });
});

test('an index without the marker of a system kept in files is refused', () => {
  assert.throws(
    () => buildIndex({ index: { title: 'x' }, theme: THEME, groups: [], lastChange: LAST_CHANGE, now: 'x' }),
    /marker/,
  );
});
