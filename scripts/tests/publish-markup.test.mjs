// The markup of the previews comes from the static export, read in the Chromium of scripts/: this test
// opens it, on a small export written to disk.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { extractMarkup } from '../publish.mjs';
import { tempDir, writeTree } from './fixtures.mjs';

const DESIGN_SYSTEM = `<!doctype html><html lang="pt-BR"><body><div class="page-root dark">
<article data-component="Badge"><h3>Badge</h3><div class="cells"><span data-state="rest">Badge</span></div></article>
<article><h3>Drawings</h3><div class="cells">
<figure data-state="One" data-component="DrawingOne"><figcaption>One</figcaption><i>1</i></figure>
<figure data-state="Two" data-component="DrawingTwo"><figcaption>Two</figcaption><i>2</i></figure>
</div></article>
</div></body></html>`;

const HOME = `<!doctype html><html lang="pt-BR"><body><main class="frame"><section data-block="hero">Hero</section></main></body></html>`;

let browser;
let web;
before(async () => {
  browser = await chromium.launch();
  web = join(tempDir(), 'web');
  writeTree(web, {
    'out/design-system.html': DESIGN_SYSTEM,
    'out/index.html': HOME,
    'components/hero.tsx': 'export function Hero() {\n  return <section data-block="hero">Hero</section>;\n}\n',
  });
});
after(() => browser?.close());

const files = new Map([
  ['Badge', 'badge.tsx'],
  ['DrawingOne', 'drawings.tsx'],
  ['DrawingTwo', 'drawings.tsx'],
  ['Hero', 'hero.tsx'],
]);

test('a piece is the specimen of its article, in a frame with the classes of the page root', async () => {
  const { markup, lang } = await extractMarkup(browser, { web }, [{ name: 'Badge' }], files);
  assert.equal(lang, 'pt-BR');
  assert.deepEqual(markup.get('Badge'), {
    kind: 'piece',
    body: '<div class="ds-preview page-root dark">\n<div class="cells"><span data-state="rest">Badge</span></div>\n</div>',
  });
});

test('a piece shown as a cell of a specimen that shows several is that cell', async () => {
  const { markup } = await extractMarkup(browser, { web }, [{ name: 'DrawingTwo' }, { name: 'DrawingOne' }], files);
  assert.deepEqual(markup.get('DrawingOne'), {
    kind: 'piece',
    body: '<div class="ds-preview page-root dark">\n<figure data-state="One" data-component="DrawingOne"><figcaption>One</figcaption><i>1</i></figure>\n</div>',
  });
  assert.match(markup.get('DrawingTwo').body, /data-component="DrawingTwo"><figcaption>Two</);
});

test('a block is its element of the screen, inside the elements that hold it', async () => {
  const { markup } = await extractMarkup(browser, { web }, [{ name: 'Hero' }], files);
  assert.deepEqual(markup.get('Hero'), {
    kind: 'block',
    body: '<main class="frame">\n<section data-block="hero">Hero</section>\n</main>',
  });
});
