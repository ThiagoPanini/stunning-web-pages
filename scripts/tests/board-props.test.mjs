import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readBoardProps, withPropDefaults } from '../board-props.mjs';

const props = {
  version: { editor: 'enum', options: ['01-a', '02-b'], default: '01-a', section: "Card's look" },
  color: { editor: 'color', default: '#101010' },
  $preview: { width: 1440, height: 900 },
};

const escapedDouble = JSON.stringify(props).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escapedSingle = JSON.stringify(props).replace(/'/g, '&#39;');
const board = (attribute) =>
  `<x-dc><div data-props="not this">{{x}}</div></x-dc>\n<script type="text/x-dc" data-dc-script data-props=${attribute}>\nclass Component extends DCLogic {}\n</script>`;

test('the tweaks are read from both quotings of data-props', () => {
  assert.deepEqual(readBoardProps(board(`"${escapedDouble}"`)), props);
  assert.deepEqual(readBoardProps(board(`'${escapedSingle}'`)), props);
});

test('a tweak value becomes its default, and nothing else in the board changes', () => {
  for (const attribute of [`"${escapedDouble}"`, `'${escapedSingle}'`]) {
    const html = board(attribute);
    const changed = withPropDefaults(html, { version: '02-b', color: '#FFFFFF' });
    const read = readBoardProps(changed);
    assert.equal(read.version.default, '02-b');
    assert.equal(read.color.default, '#FFFFFF');
    assert.equal(read.version.section, "Card's look");
    assert.deepEqual(read.$preview, props.$preview);
    assert.equal(changed.slice(0, html.indexOf('<script')), html.slice(0, html.indexOf('<script')));
    assert.ok(changed.endsWith('>\nclass Component extends DCLogic {}\n</script>'));
  }
});

test('an unknown tweak or an option the enum does not have is refused', () => {
  const html = board(`"${escapedDouble}"`);
  assert.throws(() => withPropDefaults(html, { size: 2 }), /no tweak "size"/);
  assert.throws(() => withPropDefaults(html, { $preview: {} }), /no tweak "\$preview"/);
  assert.throws(() => withPropDefaults(html, { version: '03-c' }), /no option "03-c"/);
});

test('a board without data-props is refused', () => {
  assert.throws(() => withPropDefaults('<script data-dc-script></script>', {}), /no data-props/);
});
