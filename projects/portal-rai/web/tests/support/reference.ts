// Fidelity against the reference captures of the origin (ADR 0007).
//
// The app is captured under the same conditions as the pull (scripts/capture.mjs): the Chromium of the
// same Playwright, deviceScaleFactor 1, reduced motion, no touch and a viewport as tall as the document.
// Each block of the page carries data-block="<name>", the names of origin/captures.json; a band runs from
// the top of one block to the bottom of another, edge to edge, and is compared with the same band cut
// from the reference capture.
//
// The board has tweaks, and the pull captures it once per version (props) and per hover state (hover):
// each capture is a file origin/reference/<capture>-<width>.json next to its image. The app opens the
// same version with the tweaks in its query string, which uses the board's names, and hovers the same
// element, found by the app's own selector (HOVER_TARGETS). The panel of tweaks is hidden: it is the
// catalog's, not the design's.
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type BrowserContextOptions, expect, type Page, test } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export const ORIGIN_DIR = join(import.meta.dirname, "..", "..", "..", "origin");

// The widths of the pull's rule, and 1024 px, where the cycle's loop and cards take their middle
// layouts.
export const WIDTHS = [1440, 390] as const;
export const ALL_WIDTHS = [1440, 1024, 390] as const;
export type Width = (typeof ALL_WIDTHS)[number];

export const BLOCKS = ["header", "hero", "partners", "model", "teams", "footer"] as const;
export type BlockName = (typeof BLOCKS)[number];
export type RegionName = "logo" | "brand";

export type Box = { x: number; y: number; width: number; height: number };

export type ReferenceRecord = {
  width: number;
  height: number;
  // The tweaks the board was captured with, by their names, and the board's selector of the element the
  // pointer rested on.
  props?: Record<string, string>;
  hover?: string;
  blocks: Record<BlockName, Box>;
  regions: Record<RegionName, Box>;
};

// The element the pointer rests on, for each hover of the pull: the board's selector, and the app's.
export const HOVER_TARGETS: Record<string, string> = {
  ".wk6-s3": "[data-cycle] [data-station] >> nth=2",
  ".wk3-row > article:nth-of-type(2)": "[data-cycle] article >> nth=1",
  ".tm2-red": '[data-team="red"]',
  ".tm2-blue": '[data-team="blue"]',
};

// The captures of the Home's board, by name: Main, and one per other version of its tweaks or hover.
export const CAPTURES = readdirSync(join(ORIGIN_DIR, "reference"))
  .filter((file) => /^Main(-[a-z-]+)?-\d+\.json$/.test(file))
  .map((file) => {
    const [, capture, width] = /^(.*)-(\d+)\.json$/.exec(file) ?? [];
    return { capture, width: Number(width) as Width };
  })
  .sort((a, b) => a.capture.localeCompare(b.capture) || b.width - a.width);

// The path of the app that shows a capture's version of the tweaks.
export function pathOf(record: Pick<ReferenceRecord, "props">): string {
  const query = new URLSearchParams(record.props ?? {}).toString();
  return query ? `/?${query}` : "/";
}

// The same constants as scripts/capture.mjs.
const INITIAL_VIEWPORT_HEIGHT = 100;
const MAX_GROW_STEPS = 6;
const SETTLE_MS = 500;

// The limit of every comparison with a reference capture, calibrated on the whole Home (home.spec.ts)
// on 2026-11-22:
//
// - Measured: the whole Home matches its reference byte for byte at 1440 and at 390 px, in 20 runs out of
//   20 with 8 workers in parallel, and so does every band, cut from the same two images. The first
//   calibration, on the header and hero band, had seen one level of one channel in the blurred header.
// - So no pixel may differ. Any slack lets real changes through: the former 0.01% was 521 pixels of the
//   whole Home at 1440 px, and these changes, provoked one at a time, stayed under it: a section title
//   1 px lower (429 pixels), the four team badges in another color (234), the letter spacing of a heading
//   off by 0.001em (45), the radius of the team cards from 16 to 12 px (12).
// - The per-pixel threshold stays above that one-level noise and below a swap of close tokens, which
//   this dark palette is full of. At pixelmatch's default, 0.1, these swaps left 0 pixels different on
//   the whole Home: the cards painted night instead of surface, every rule drawn rule-strong, the nav
//   pill white-6 instead of white-4, the paragraphs 16 levels lighter. At 0.02 each one fails, from
//   12,892 to 499,391 pixels.
// - The match holds only for the Chromium of this Playwright on Linux, where the references were taken:
//   another browser or system renders text differently, and no limit near zero survives that.
//
// A comparison that cannot be exact loosens its own limit, with the reason next to it; logo.spec.ts
// says why it does not need to.

// The per-pixel color distance (0 to 1) below which two pixels are equal. Anti-aliased pixels are
// detected and ignored.
export const PIXEL_THRESHOLD = 0.02;

// Share of the compared pixels that may differ.
export const MAX_DIFF_PIXEL_RATIO = 0;

export async function readReference(
  width: Width,
  capture = "Main",
): Promise<ReferenceRecord & { image: PNG }> {
  const record = JSON.parse(
    await readFile(join(ORIGIN_DIR, "reference", `${capture}-${width}.json`), "utf8"),
  ) as ReferenceRecord;
  const image = PNG.sync.read(
    await readFile(join(ORIGIN_DIR, "reference", `${capture}-${width}.png`)),
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

// Loads a path of the app in a page opened with referenceContextOptions, then grows the viewport to the
// document height until it stops changing.
export async function loadAtReferenceConditions(page: Page, width: number, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "[data-tweaks-panel] { display: none !important; }" });
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
  // The capture to compare with; Main by default.
  capture?: string;
};

// Compares the band of the page from the top of `from` to the bottom of `to` with the same band of the
// reference capture: the band must start where the reference's starts, and its image must match the
// reference's (expectImageToMatch).
export async function expectBandToMatchReference(page: Page, options: BandOptions): Promise<void> {
  const { width, from, to = from, capture = "Main" } = options;
  const reference = await readReference(width, capture);
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
  const band = from === to ? from : `${from}-${to}`;
  const name = `${capture === "Main" ? "" : `${capture}-`}${band}-${width}`;
  await expectImageToMatch(name, actual, crop(reference.image, refTop, refHeight));
}
