// The Google Fonts stylesheets of the boards, held to one set of font files.
//
// fonts.googleapis.com answers the same css2 request with one of two sets of font files: most of the time
// the static files, under fonts.gstatic.com/s/<family>/<version>/, and now and then a kit under
// fonts.gstatic.com/l/font?kit=…. Both are the same family and version, but they are different files, and
// text drawn with the kit sits a fraction of a pixel apart. Measured on 2026-11-25: in a full run, 4 of 48
// answers came with the kit, and every capture whose page got it first differed from its reference
// capture, while the same captures with the static files forced gave the same bytes. So the capture asks
// again until the answer has the static files, and refuses any other font file from Google.

const STATIC_FONT_FILES = 'https://fonts.gstatic.com/s/';

// With one answer in twelve coming with the kit, ten in a row would happen about once in 10^11 stylesheets.
const TRIES = 10;

export function isStaticFontFile(url) {
  return url.startsWith(STATIC_FONT_FILES);
}

function fontFiles(css) {
  return [...css.matchAll(/url\(\s*(['"]?)([^'")\s]+)\1\s*\)/g)].map((match) => match[2]);
}

// True when the stylesheet points to font files and every one of them is static.
export function usesStaticFontFiles(css) {
  const files = fontFiles(css);
  return files.length > 0 && files.every(isStaticFontFile);
}

// Asks for a stylesheet until the answer has the static files, at most `tries` times. `fetchOnce` makes one
// request and resolves to an answer with `status` and `body`; that answer is returned as it came, with
// whatever else it carries. An error status is returned at once, for the caller to report it.
export async function askForStaticFonts(fetchOnce, tries = TRIES) {
  let answer;
  for (let attempt = 0; attempt < tries; attempt++) {
    answer = await fetchOnce();
    if (answer.status !== 200 || usesStaticFontFiles(answer.body)) return answer;
  }
  const files = [...new Set(fontFiles(answer.body))].slice(0, 2);
  throw new Error(`Google Fonts answered ${tries} times without the static font files (${STATIC_FONT_FILES}); last answer: ${files.join(', ') || 'no font file'}`);
}
