// The Ondas logo: alone, against the reference capture of its board at 560 px; in the Home, its region and
// its legend against the Home's reference; still with reduced motion and animated frame by frame with
// normal motion.

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { spilledElements } from "./support/overflow";
import {
  expectBandToMatchReference,
  expectImageToMatch,
  ORIGIN_DIR,
  PIXEL_THRESHOLD,
  WIDTHS,
} from "./support/reference";
import { expect, load, test } from "./support/test";

// The logo board is captured alone at 560 px, on its own background. In the Home the logo is 600 px wide
// above 900 px and at most 520 px below, so it never measures 560 there: the design system route has a
// specimen of the logo as its board draws it alone.
const LOGO_SIZE = 560;
const BOARD_SPECIMEN = '[data-specimen="ondas-logo-board"] [role="img"]';

// The Hélio's logo test loosens the per-pixel threshold to 0.1, pixelmatch's default, because it sets two
// renderings side by side: the board alone and the logo cut from the Home, whose stroke edges differ by
// a few levels. The specimen here is drawn alone, as the board is, so that reason does not hold, and the
// strict PIXEL_THRESHOLD of every other comparison does: 0 of 313,600 pixels differ, which the looser
// threshold passes too. A copy compared inside its Home may need the Hélio's 0.1 again, with its reason.
const LOGO_PIXEL_THRESHOLD = PIXEL_THRESHOLD;

test("with reduced motion, the logo alone matches the reference capture of its board", async ({
  referencePage,
}) => {
  const page = await referencePage(1440, { path: "/design-system" });
  const logo = page.locator(BOARD_SPECIMEN);
  await expect(logo).toHaveCount(1);
  const box = await logo.boundingBox();
  expect(box && { width: box.width, height: box.height }, "the logo's specimen").toEqual({
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  });

  const expected = PNG.sync.read(
    await readFile(join(ORIGIN_DIR, "reference", `LogoLab1-${LOGO_SIZE}.png`)),
  );
  const actual = PNG.sync.read(await logo.screenshot({ animations: "disabled" }));
  await expectImageToMatch(`logo-${LOGO_SIZE}`, actual, expected, {
    threshold: LOGO_PIXEL_THRESHOLD,
  });
});

for (const width of WIDTHS) {
  test(`in the Home, the logo and its legend match the reference at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    // The header and hero band of header-hero.spec.ts, the logo's region unmasked: the logo on the
    // page's color, with the page's letter spacing, and the legend under it.
    await expectBandToMatchReference(page, { width, from: "header", to: "hero" });
  });
}

// Two pictures of the Home's logo, the given time apart, under the motion preference the page has now.
async function twoInstants(page: Page, gapMs: number): Promise<[Buffer, Buffer]> {
  const logo = page.getByRole("img", { name: /versão Ondas/ });
  const first = await logo.screenshot();
  await page.waitForTimeout(gapMs);
  return [first, await logo.screenshot()];
}

// 400 ms is almost 5 frames of the drawing.
const GAP_MS = 400;

test("with reduced motion the logo stays still from the start", async ({ newWindow }) => {
  const page = await newWindow(1440, { motion: "reduce" });
  await load(page, "/");
  const [first, later] = await twoInstants(page, GAP_MS);
  expect(later.equals(first), "the logo stayed still with reduced motion").toBe(true);
});

test("with normal motion the logo changes from one instant to the next, and stops when motion is reduced", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, "/");
  const [before, after] = await twoInstants(page, GAP_MS);
  expect(after.equals(before), "the logo changed with normal motion").toBe(false);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const [stopped, later] = await twoInstants(page, GAP_MS);
  expect(later.equals(stopped), "the logo stayed still with reduced motion").toBe(true);
});

for (const width of WIDTHS) {
  test(`with the logo drawn, nothing of the hero spills sideways at ${width} px`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { motion: "no-preference" });
    await load(page, "/");
    expect(await spilledElements(page, width, ["hero"])).toEqual([]);
  });
}

// A consumer, or another theme, takes the logo on its own: besides React, it needs only the tokens,
// which it reaches as Tailwind classes, not as imports.
test("the logo component imports nothing but React", () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "components", "ondas-logo.tsx"),
    "utf8",
  );
  const imported = [...source.matchAll(/\b(?:import|from)\s*\(?\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  expect(imported, "modules the logo imports").toEqual(["react"]);
});
