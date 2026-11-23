// O logo Eclusa: parado com movimento reduzido, no quadro da Captura de referência do Quadro do logo, e
// animado quadro a quadro com movimento normal.

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { PNG } from "pngjs";
import { expectImageToMatch, ORIGIN_DIR, regionBox } from "./support/reference";
import { expect, load, test } from "./support/test";

// The logo Quadro is captured alone at 560 px. In the Home the logo column grows from 420 px by half the
// free space of the hero row (gutters of 48 px, the pitch's 480 px basis and the 48 px gap): at 1324 px
// it is 560 px wide.
const LOGO_PAGE_WIDTH = 1324;
const LOGO_SIZE = 560;

// Looser than the PIXEL_THRESHOLD of the other comparisons, and only here: this one sets two renderings
// side by side, the logo Quadro alone and the logo cut from the Home at 1324 px. Their stroke edges
// differ by a few levels (1,147 pixels byte for byte, the same in every run), and 2 of them cross the
// strict threshold. This test holds the frame and the drawing; the colors are held by the whole Home
// (home.spec.ts), where the logo matches its reference byte for byte. pixelmatch's default, 0.1, leaves
// none.
const LOGO_PIXEL_THRESHOLD = 0.1;

test("com movimento reduzido, o logo bate com a Captura de referência do Quadro do logo", async ({
  referencePage,
}) => {
  const page = await referencePage(LOGO_PAGE_WIDTH);
  const box = await regionBox(page, "logo");
  expect({ width: box.width, height: box.height }, `o logo em ${LOGO_PAGE_WIDTH} px`).toEqual({
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  });

  const expected = PNG.sync.read(
    await readFile(join(ORIGIN_DIR, "reference", `LogoLab5-${LOGO_SIZE}.png`)),
  );
  const actual = PNG.sync.read(await page.screenshot({ clip: box, animations: "disabled" }));
  await expectImageToMatch(`logo-${LOGO_SIZE}`, actual, expected, {
    threshold: LOGO_PIXEL_THRESHOLD,
  });
});

// Two pictures of the logo, the given time apart, under the motion preference the page has now.
async function twoInstants(page: Page, gapMs: number): Promise<[Buffer, Buffer]> {
  const logo = page.getByRole("img", { name: /versão Eclusa/ });
  const first = await logo.screenshot();
  await page.waitForTimeout(gapMs);
  return [first, await logo.screenshot()];
}

test("com movimento normal o logo muda de um instante para o outro, e para quando o movimento é reduzido", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, "/");

  // 400 ms is almost 5 frames of the drawing.
  const [before, after] = await twoInstants(page, 400);
  expect(after.equals(before), "o logo mudou com movimento normal").toBe(false);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const [stopped, later] = await twoInstants(page, 400);
  expect(later.equals(stopped), "o logo ficou parado com movimento reduzido").toBe(true);
});

// A Consumidor takes the logo on its own: besides React, it needs only the tokens, which it reaches as
// Tailwind classes, not as imports.
test("o componente do logo não importa nada do app", () => {
  const source = readFileSync(
    join(import.meta.dirname, "..", "components", "eclusa-logo.tsx"),
    "utf8",
  );
  const imported = [...source.matchAll(/\b(?:import|from)\s*\(?\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  expect(imported, "módulos que o logo importa").toEqual(["react"]);
});
