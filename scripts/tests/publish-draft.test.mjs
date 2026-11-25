import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildIndex, readDraft } from '../publish.mjs';
import { tempDir, writeTree } from './fixtures.mjs';

const PROJECT = { name: 'demo-portal', namespace: 'DemoPortal' };
const LAST_CHANGE = { by: 'Ana', at: '2026-11-23T10:00:00Z', via: 'GitHub · owner/repo@abc1234', note: 'New colors.' };

test('the draft lists its components in the order tokens.json records, then the new ones by name', () => {
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
  const draft = readDraft(dir);
  assert.deepEqual(
    draft.components.map(({ name, group }) => ({ name, group })),
    [
      { name: 'Card', group: undefined },
      { name: 'Badge', group: 'Marca' },
      { name: 'Alert', group: undefined },
    ],
  );
  assert.equal(draft.components[1].readme, '# Badge\n\nA badge.\n');
  assert.equal(draft.cover, '<!-- @dsCard height=288 -->\n<p>cover</p>\n');
  assert.equal(draft.readme, 'Brand book.\n');
  assert.deepEqual(draft.assets, ['assets/Licenses/README.md']);
  assert.equal(draft.index, undefined);
});

test('what the build does not make is kept from the draft, except fonts the app no longer has', () => {
  const dir = writeTree(tempDir(), {
    'project/README.md': 'Brand book.\n',
    'project/tokens.json': '{}',
    'project/voice.md': '# Voz\n',
    'project/fonts/old.woff2': 'old',
    'project/components/Card/README.md': '# Card\n',
    'project/components/Card/Card.d.ts': 'export interface CardProps {}\n',
    'project/archived/README.md': 'old\n',
  });
  const built = new Set(['README.md', 'tokens.json', 'components/Card/README.md', 'components/Card/preview.html']);
  assert.deepEqual(readDraft(dir).keep(built), ['archived/README.md', 'components/Card/Card.d.ts', 'voice.md']);
});

test('a draft without the brand book or tokens.json is refused', () => {
  assert.throws(() => readDraft(writeTree(tempDir(), { 'project/tokens.json': '{}' })), /project\/README\.md/);
  assert.throws(() => readDraft(writeTree(tempDir(), { 'project/README.md': 'x' })), /project\/tokens\.json/);
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
  const built = buildIndex({ index, project: PROJECT, groups: ['Licenses'], lastChange: LAST_CHANGE, now: 'unused' });
  assert.deepEqual(JSON.stringify(built), JSON.stringify({ ...index, title: 'demo-portal', namespace: 'DemoPortal', lastChange: LAST_CHANGE }));
});

test('a first publication gets a new index, created now, with one entry per asset group', () => {
  const built = buildIndex({ project: PROJECT, groups: ['Licenses'], lastChange: LAST_CHANGE, now: '2026-11-23T10:00:00Z' });
  assert.deepEqual(JSON.stringify(built), JSON.stringify({
    v: 3,
    layout: 'files',
    createdOnFiles: { v: 1, at: '2026-11-23T10:00:00Z' },
    title: 'demo-portal',
    namespace: 'DemoPortal',
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
  const built = buildIndex({ index, project: PROJECT, groups: ['Logos'], lastChange: LAST_CHANGE, now: 'unused' });
  assert.deepEqual(built.groups, ['Logos']);
  assert.deepEqual(built.assetGroups, { Logos: { name: 'Logos', tile: 's', order: [], files: {} } });
});

test('an index without the marker of a system kept in files is refused', () => {
  assert.throws(
    () => buildIndex({ index: { title: 'x' }, project: PROJECT, groups: [], lastChange: LAST_CHANGE, now: 'x' }),
    /marker/,
  );
});
