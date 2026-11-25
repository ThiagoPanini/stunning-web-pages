// Every version of the board's tweaks and every hover state the pull captured, against the app: the
// whole Home, opened with the same tweaks in its query string and, for a hover capture, with the pointer
// on the same element (support/reference.ts, CAPTURES and HOVER_TARGETS).

import { PNG } from "pngjs";
import {
  CAPTURES,
  expectImageToMatch,
  HOVER_TARGETS,
  pathOf,
  readReference,
} from "./support/reference";
import { expect, test } from "./support/test";

// After the pointer moves onto the element, as the pull waits: the longest hover transition is .9s.
const HOVER_SETTLE_MS = 1500;

for (const { capture, width } of CAPTURES) {
  test(`${capture} matches the reference capture at ${width} px`, async ({ referencePage }) => {
    const reference = await readReference(width, capture);
    const page = await referencePage(width, pathOf(reference));
    if (reference.hover) {
      const target = HOVER_TARGETS[reference.hover];
      expect(target, `the app's element for the hover ${reference.hover}`).toBeDefined();
      await page.locator(target).hover();
      await page.waitForTimeout(HOVER_SETTLE_MS);
      expect(await page.evaluate(() => window.scrollY), "the page did not scroll").toBe(0);
    }
    const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
    await expectImageToMatch(`${capture}-${width}`, PNG.sync.read(screenshot), reference.image);
  });
}
