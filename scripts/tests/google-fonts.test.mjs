import assert from 'node:assert/strict';
import { test } from 'node:test';
import { askForStaticFonts, isFontStylesheet, isRefusedFontFile, isStaticFontFile, usesStaticFontFiles } from '../google-fonts.mjs';

// Two answers of fonts.googleapis.com to the same css2 request, cut to two faces each.
const face = (src) => `@font-face {\n  font-family: 'Geist';\n  font-style: normal;\n  font-weight: 400;\n  font-display: swap;\n  src: ${src} format('woff2');\n}\n`;
const staticCss =
  face('url(https://fonts.gstatic.com/s/geist/v5/gyByhwUxId8gMEwRGFWfOw.woff2)') +
  face('url(https://fonts.gstatic.com/s/geist/v5/gyByhwUxId8gMEwcGFU.woff2)');
const kitCss =
  face('url(https://fonts.gstatic.com/l/font?kit=gyBUhwUxId8gMGYQMKR3pzfaWI_RwuNalrErE8iusq2KknuONBW4zoHO&skey=70a816dcd17c8a3c&v=v5)') +
  face('url(https://fonts.gstatic.com/l/font?kit=gyBUhwUxId8gMGYQMKR3pzfaWI_RwuNalrErE8iusq2KknuONBi4zg&skey=70a816dcd17c8a3c&v=v5)');

test('a font file is static only under fonts.gstatic.com/s/', () => {
  assert.ok(isStaticFontFile('https://fonts.gstatic.com/s/geist/v5/gyByhwUxId8gMEwcGFU.woff2'));
  assert.ok(!isStaticFontFile('https://fonts.gstatic.com/l/font?kit=gyBUhwUxId8gMGYQ&skey=70a816dcd17c8a3c&v=v5'));
  assert.ok(!isStaticFontFile('https://example.com/s/geist/v5/gyByhwUxId8gMEwcGFU.woff2'));
});

test('a stylesheet of Google Fonts is told by its host, as a string or as a URL', () => {
  assert.ok(isFontStylesheet('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap'));
  assert.ok(isFontStylesheet(new URL('https://fonts.googleapis.com/css2?family=Geist+Mono')));
  assert.ok(!isFontStylesheet('https://fonts.gstatic.com/s/geist/v5/gyByhwUxId8gMEwcGFU.woff2'));
  assert.ok(!isFontStylesheet('http://127.0.0.1:4173/Main.dc.html'));
});

test('a font file of Google Fonts outside the static set is refused, and no other request is', () => {
  assert.ok(isRefusedFontFile('https://fonts.gstatic.com/l/font?kit=gyBUhwUxId8gMGYQ&skey=70a816dcd17c8a3c&v=v5'));
  assert.ok(!isRefusedFontFile('https://fonts.gstatic.com/s/geist/v5/gyByhwUxId8gMEwcGFU.woff2'));
  assert.ok(!isRefusedFontFile('https://fonts.googleapis.com/css2?family=Geist'));
  assert.ok(!isRefusedFontFile('http://127.0.0.1:4173/support.js'));
});

test('a stylesheet uses the static files when every font file it points to is static', () => {
  assert.ok(usesStaticFontFiles(staticCss));
  assert.ok(usesStaticFontFiles(staticCss.replace(/url\((\S+)\)/g, "url('$1')")));
  assert.ok(!usesStaticFontFiles(kitCss));
  assert.ok(!usesStaticFontFiles(staticCss + kitCss));
  assert.ok(!usesStaticFontFiles('/* no font */'));
});

// A fetch that answers with the given bodies in turn and counts the calls.
function answers(...bodies) {
  const fetchOnce = async () => ({ status: 200, body: bodies[Math.min(fetchOnce.calls++, bodies.length - 1)] });
  fetchOnce.calls = 0;
  return fetchOnce;
}

test('the stylesheet is asked for again until it comes with the static files', async () => {
  const fetchOnce = answers(kitCss, kitCss, staticCss);
  const answer = await askForStaticFonts(fetchOnce);
  assert.equal(answer.body, staticCss);
  assert.equal(fetchOnce.calls, 3);
});

test('the first answer is kept when it already has the static files', async () => {
  const fetchOnce = answers(staticCss, kitCss);
  assert.equal((await askForStaticFonts(fetchOnce)).body, staticCss);
  assert.equal(fetchOnce.calls, 1);
});

test('no static answer within the tries is an error naming the files it got', async () => {
  const fetchOnce = answers(kitCss);
  await assert.rejects(askForStaticFonts(fetchOnce, 4), /4 times[\s\S]*fonts\.gstatic\.com\/l\/font\?kit=/);
  assert.equal(fetchOnce.calls, 4);
});

test('an error status is passed on as is, for the capture to report it', async () => {
  const fetchOnce = async () => ({ status: 400, body: 'Bad Request' });
  assert.deepEqual(await askForStaticFonts(fetchOnce), { status: 400, body: 'Bad Request' });
});
