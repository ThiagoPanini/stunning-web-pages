// The Ondas logo: alone, against the reference capture of its board at 560 px; in the Home, its region and
// its caption against the Home's reference; still with reduced motion and animated frame by frame with
// normal motion.

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { spilledElements } from "./support/overflow";
import {
  blockBox,
  expectImageToMatch,
  ORIGIN_DIR,
  PIXEL_THRESHOLD,
  readReference,
  regionBox,
  WIDTHS,
} from "./support/reference";
import { expect, load, test } from "./support/test";

// The logo board is captured alone at 560 px, on its own background. In the Home the logo is 600 px wide
// up to the column and narrower below it, so it never measures 560 there: the design system route has a
// specimen of the logo as its board draws it alone.
const LOGO_SIZE = 560;
const BOARD_SPECIMEN = '[data-specimen="ondas-logo-board"] [role="img"]';

// The Hélio's logo test loosens the per-pixel threshold to 0.1, pixelmatch's default, because it sets two
// renderings side by side: the board alone and the logo cut from the Home, whose stroke edges differ by
// a few levels. The specimen here is drawn alone, as the board is, so that reason does not hold, and the
// strict PIXEL_THRESHOLD of every other comparison does.
const LOGO_PIXEL_THRESHOLD = PIXEL_THRESHOLD;

test("with reduced motion, the logo alone matches the reference capture of its board", async ({
  referencePage,
}) => {
  const page = await referencePage(1440, "/design-system");
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
  test(`in the Home, the logo and its caption match the reference at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    const reference = await readReference(width);
    // From the top of the logo's square to the bottom of the hero, edge to edge: the logo on the page's
    // color and the caption's row under it. header-hero.spec.ts compares the whole band around it.
    const logo = await regionBox(page, "logo");
    const hero = await blockBox(page, "hero");
    const top = reference.regions.logo.y;
    const height = reference.blocks.hero.y + reference.blocks.hero.height - top;
    expect
      .soft({ top: logo.y, height: hero.y + hero.height - logo.y }, "the logo's column")
      .toEqual({ top, height });

    const actual = PNG.sync.read(
      await page.screenshot({ clip: { x: 0, y: logo.y, width, height }, animations: "disabled" }),
    );
    const expected = new PNG({ width, height });
    PNG.bitblt(reference.image, expected, 0, top, width, height, 0, 0);
    await expectImageToMatch(`logo-caption-${width}`, actual, expected);

    // The background behind the characters, exactly: the strict threshold takes the board's own
    // background (#0A0D0F) for the page's night (#0D0D0C), so the square's corners, where the drawing
    // leaves no character, must be the reference's very color.
    const square = reference.regions.logo;
    const corners = [
      [square.x, 0],
      [square.x + square.width - 1, 0],
      [square.x, square.height - 1],
      [square.x + square.width - 1, square.height - 1],
    ];
    const colors = (image: PNG) =>
      corners.map(([x, y]) => [
        ...image.data.subarray((y * width + x) * 4, (y * width + x) * 4 + 3),
      ]);
    expect(colors(actual), "the logo's background at the corners of its square").toEqual(
      colors(expected),
    );
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
