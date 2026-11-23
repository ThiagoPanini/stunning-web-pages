// Fidelity against the reference captures of the origin (ADR 0007).
//
// The app is captured under the same conditions as the pull (scripts/capture.mjs): the Chromium of the
// same Playwright, deviceScaleFactor 1, reduced motion, no touch and a viewport as tall as the document.
// Each block of the page carries data-block="<name>", the names of origin/captures.json; a band runs from
// the top of one block to the bottom of another, edge to edge, and is compared with the same band cut
// from the reference capture.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type BrowserContextOptions, expect, type Page, test } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export const ORIGIN_DIR = join(import.meta.dirname, "..", "..", "..", "origin");

// The Home's board, as the origin names it; its captures are reference/HomeUnkey-<width>.png and .json.
// The logo board, captured alone at 560px, is reference/LogoLab1-560.png.
const HOME_BOARD = "HomeUnkey";

export const WIDTHS = [1440, 390] as const;
export type Width = (typeof WIDTHS)[number];

export const BLOCKS = [
  "header",
  "hero",
  "brands",
  "solutions",
  "cycle",
  "integrations",
  "data",
  "cta",
  "footer",
] as const;
export type BlockName = (typeof BLOCKS)[number];
export type RegionName = "logo";

export type Box = { x: number; y: number; width: number; height: number };

type ReferenceRecord = {
  width: number;
  height: number;
  blocks: Record<BlockName, Box>;
  regions: Record<RegionName, Box>;
};

// The same constants as scripts/capture.mjs.
const INITIAL_VIEWPORT_HEIGHT = 100;
const MAX_GROW_STEPS = 6;
const SETTLE_MS = 500;

// The limit of every comparison with a reference capture, the Hélio's (calibrated on its whole Home on
// 2026-11-22), which the Neônio's whole Home holds too (home.spec.ts):
//
// - No pixel may differ. Any slack lets real changes through: on the Hélio, 0.01% was 521 pixels of the
//   whole Home at 1440 px, and a section title 1 px lower, badges in another color, letter spacing off
//   by 0.001em or a radius from 16 to 12 px each stayed under it.
// - The per-pixel threshold stays below a swap of close tokens, which a dark palette is full of. At
//   pixelmatch's default, 0.1, swapping near greys left 0 pixels different; at 0.02 each swap fails.
// - The match holds only for the Chromium of this Playwright on Linux, where the references were taken:
//   another browser or system renders text differently, and no limit near zero survives that.
//
// A comparison that cannot be exact loosens its own limit, with the reason next to it.

// The per-pixel color distance (0 to 1) below which two pixels are equal. Anti-aliased pixels are
// detected and ignored.
export const PIXEL_THRESHOLD = 0.02;

// Share of the compared pixels that may differ.
export const MAX_DIFF_PIXEL_RATIO = 0;

export async function readReferenceRecord(width: Width): Promise<ReferenceRecord> {
  return JSON.parse(
    await readFile(join(ORIGIN_DIR, "reference", `${HOME_BOARD}-${width}.json`), "utf8"),
  ) as ReferenceRecord;
}

export async function readReference(width: Width): Promise<ReferenceRecord & { image: PNG }> {
  const record = await readReferenceRecord(width);
  const image = PNG.sync.read(
    await readFile(join(ORIGIN_DIR, "reference", `${HOME_BOARD}-${width}.png`)),
  );
  return { ...record, image };
}

// The browser context of a reference capture, at the given width.
export function referenceContextOptions(width: number): BrowserContextOptions {
  return {
    viewport: { width, height: INITIAL_VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    hasTouch: false,
    isMobile: false,
  };
}

export type ReferenceLoadOptions = {
  // The path of the app to open; the Home by default.
  path?: string;
};

// Loads a path of the app in a page opened with referenceContextOptions, then grows the viewport to the
// document height until it stops changing.
export async function loadAtReferenceConditions(
  page: Page,
  width: number,
  { path = "/" }: ReferenceLoadOptions = {},
) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(SETTLE_MS);

  const documentHeight = () => page.evaluate(() => document.documentElement.scrollHeight);
  let height = await documentHeight();
  for (let step = 0; step < MAX_GROW_STEPS; step++) {
    await page.setViewportSize({ width, height });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SETTLE_MS);
    const next = await documentHeight();
    if (next === height) return;
    height = next;
  }
  throw new Error(`the page height did not settle at ${width} px (last ${height} px)`);
}

// Edges rounded to the nearest pixel, as the pull records the reference boxes.
function pixelBox(rect: Box): Box {
  const x = Math.round(rect.x);
  const y = Math.round(rect.y);
  return {
    x,
    y,
    width: Math.round(rect.x + rect.width) - x,
    height: Math.round(rect.y + rect.height) - y,
  };
}

async function boxOf(page: Page, selector: string): Promise<Box> {
  const locator = page.locator(selector);
  await expect(locator, `${selector} must match exactly one element`).toHaveCount(1);
  const rect = await locator.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x: x + window.scrollX, y: y + window.scrollY, width, height };
  });
  return pixelBox(rect);
}

export function blockBox(page: Page, block: BlockName): Promise<Box> {
  return boxOf(page, `[data-block="${block}"]`);
}

export function regionBox(page: Page, region: RegionName): Promise<Box> {
  return boxOf(page, `[data-region="${region}"]`);
}

function crop(image: PNG, y: number, height: number): PNG {
  const band = new PNG({ width: image.width, height });
  image.data.copy(band.data, 0, y * image.width * 4, (y + height) * image.width * 4);
  return band;
}

// Paints a box of an image in one flat color, so the comparison skips what is under it. Both images of a
// comparison are painted the same way, each at its own box.
function paintOver(image: PNG, box: Box): void {
  const top = Math.max(0, box.y);
  const bottom = Math.min(image.height, box.y + box.height);
  const left = Math.max(0, box.x);
  const right = Math.min(image.width, box.x + box.width);
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const offset = (y * image.width + x) * 4;
      image.data[offset] = 255;
      image.data[offset + 1] = 0;
      image.data[offset + 2] = 255;
      image.data[offset + 3] = 255;
    }
  }
}

type ImageOptions = {
  // The per-pixel threshold, when a comparison needs another one than PIXEL_THRESHOLD; the reason goes
  // next to the value.
  threshold?: number;
};

// Compares an image of the app with the image it must match, pixel by pixel: both must have the same
// size, and at most MAX_DIFF_PIXEL_RATIO of the pixels may differ. Actual, expected and diff images are
// attached to the test result as <name>-actual.png and so on, and the count of differing pixels goes to
// its annotations.
export async function expectImageToMatch(
  name: string,
  actual: PNG,
  expected: PNG,
  { threshold = PIXEL_THRESHOLD }: ImageOptions = {},
): Promise<void> {
  await test.info().attach(`${name}-expected.png`, {
    body: PNG.sync.write(expected),
    contentType: "image/png",
  });
  await test.info().attach(`${name}-actual.png`, {
    body: PNG.sync.write(actual),
    contentType: "image/png",
  });
  const { width, height } = expected;
  expect({ width: actual.width, height: actual.height }, `size of ${name}`).toEqual({
    width,
    height,
  });

  const diff = new PNG({ width, height });
  const differing = pixelmatch(actual.data, expected.data, diff.data, width, height, { threshold });
  await test.info().attach(`${name}-diff.png`, {
    body: PNG.sync.write(diff),
    contentType: "image/png",
  });
  const total = width * height;
  test.info().annotations.push({
    type: "diff",
    description: `${name}: ${differing} of ${total} pixels differ`,
  });
  expect(
    differing / total,
    `${differing} of ${total} pixels differ in ${name}`,
  ).toBeLessThanOrEqual(MAX_DIFF_PIXEL_RATIO);
}

type BandOptions = {
  width: Width;
  from: BlockName;
  to?: BlockName;
  // Regions left out of the comparison, painted over in both images: what another ticket draws, such
  // as the logo before it exists. The region must still sit where the reference has it.
  mask?: RegionName[];
};

// Compares the band of the page from the top of `from` to the bottom of `to` with the same band of the
// reference capture: the band must start where the reference's starts, and its image must match the
// reference's (expectImageToMatch).
export async function expectBandToMatchReference(page: Page, options: BandOptions): Promise<void> {
  const { width, from, to = from, mask = [] } = options;
  const reference = await readReference(width);
  const refTop = reference.blocks[from].y;
  const refHeight = reference.blocks[to].y + reference.blocks[to].height - refTop;
  const appFrom = await blockBox(page, from);
  const appTo = to === from ? appFrom : await blockBox(page, to);
  const appTop = appFrom.y;
  const appHeight = appTo.y + appTo.height - appTop;

  // Soft, so a band in the wrong place still shows its images and its diff.
  expect
    .soft(
      { top: appTop, height: appHeight },
      `position and height of the ${from}..${to} band at ${width} px`,
    )
    .toEqual({ top: refTop, height: refHeight });
  const actual = PNG.sync.read(
    await page.screenshot({
      clip: { x: 0, y: appTop, width, height: appHeight },
      animations: "disabled",
    }),
  );
  const expected = crop(reference.image, refTop, refHeight);
  for (const region of mask) {
    const appRegion = await regionBox(page, region);
    expect
      .soft(appRegion, `the ${region} region at ${width} px`)
      .toEqual(reference.regions[region]);
    paintOver(actual, { ...appRegion, y: appRegion.y - appTop });
    const refRegion = reference.regions[region];
    paintOver(expected, { ...refRegion, y: refRegion.y - refTop });
  }
  const name = `${from === to ? from : `${from}-${to}`}-${width}`;
  await expectImageToMatch(name, actual, expected);
}
