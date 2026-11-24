// The Ondas logo: still with reduced motion, on the frame of the logo board's reference capture, and
// animated frame by frame with normal motion.

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { expectImageToMatch, ORIGIN_DIR, PIXEL_THRESHOLD, regionBox } from "./support/reference";
import { expect, load, test } from "./support/test";

// The logo board is captured alone at 560 px. In the Home the logo column grows from 420 px by half the
// free space of the hero row (gutters of 48 px, the pitch's 480 px basis and the 48 px gap): at 1324 px
// it is 560 px wide.
const LOGO_PAGE_WIDTH = 1324;
const LOGO_SIZE = 560;

// The same strict PIXEL_THRESHOLD as every other comparison, though this one sets two renderings side by
// side, the logo board alone and the logo cut from the Home at 1324 px. They draw the same: the logo is
// text on a flat background, and nothing around it in the Home sets its letter spacing, so 0 of 313,600
// pixels differ. Two renderings of SVG strokes would not be this close, their edges a few levels apart,
// and would need pixelmatch's default, 0.1.
const LOGO_PIXEL_THRESHOLD = PIXEL_THRESHOLD;

test("with reduced motion, the logo matches the reference capture of the logo board", async ({
  referencePage,
}) => {
  const page = await referencePage(LOGO_PAGE_WIDTH);
  const box = await regionBox(page, "logo");
  expect({ width: box.width, height: box.height }, `the logo at ${LOGO_PAGE_WIDTH} px`).toEqual({
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  });

  const expected = PNG.sync.read(
    await readFile(join(ORIGIN_DIR, "reference", `LogoLab1-${LOGO_SIZE}.png`)),
  );
  const actual = PNG.sync.read(await page.screenshot({ clip: box, animations: "disabled" }));
  await expectImageToMatch(`logo-${LOGO_SIZE}`, actual, expected, {
    threshold: LOGO_PIXEL_THRESHOLD,
  });
});

// Two pictures of the logo, the given time apart, under the motion preference the page has now.
async function twoInstants(page: Page, gapMs: number): Promise<[Buffer, Buffer]> {
  const logo = page.getByRole("img", { name: /versão Ondas/ });
  const first = await logo.screenshot();
  await page.waitForTimeout(gapMs);
  return [first, await logo.screenshot()];
}

test("with normal motion the logo changes from one instant to the next, and stops when motion is reduced", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, "/");

  // 400 ms is almost 5 frames of the drawing.
  const [before, after] = await twoInstants(page, 400);
  expect(after.equals(before), "the logo changed with normal motion").toBe(false);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const [stopped, later] = await twoInstants(page, 400);
  expect(later.equals(stopped), "the logo stayed still with reduced motion").toBe(true);
});

// A consumer takes the logo on its own: besides React, it needs only the tokens, which it reaches as
// Tailwind classes, not as imports.
test("the logo component imports nothing from the app", () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "components", "ondas-logo.tsx"),
    "utf8",
  );
  const imported = [...source.matchAll(/\b(?:import|from)\s*\(?\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  expect(imported, "modules the logo imports").toEqual(["react"]);
});
