// O logo Eclusa: parado com movimento reduzido, no quadro da Captura de referência do Quadro do logo, e
// animado quadro a quadro com movimento normal.

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { MAX_DIFF_PIXEL_RATIO, ORIGIN_DIR, PIXEL_THRESHOLD, regionBox } from "./support/reference";
import { expect, test } from "./support/test";

// The logo Quadro is captured alone at 560 px. In the Home the logo column grows from 420 px by half the
// free space of the hero row (gutters of 48 px, the pitch's 480 px basis and the 48 px gap): at 1324 px
// it is 560 px wide.
const LOGO_PAGE_WIDTH = 1324;
const LOGO_SIZE = 560;

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
  const diff = new PNG({ width: LOGO_SIZE, height: LOGO_SIZE });
  const differing = pixelmatch(actual.data, expected.data, diff.data, LOGO_SIZE, LOGO_SIZE, {
    threshold: PIXEL_THRESHOLD,
  });
  for (const [name, image] of [
    ["expected", expected],
    ["actual", actual],
    ["diff", diff],
  ] as const) {
    await test.info().attach(`logo-${LOGO_SIZE}-${name}.png`, {
      body: PNG.sync.write(image),
      contentType: "image/png",
    });
  }
  test.info().annotations.push({
    type: "diff",
    description: `logo-${LOGO_SIZE}: ${differing} de ${LOGO_SIZE * LOGO_SIZE} pixels diferem`,
  });
  expect(
    differing / (LOGO_SIZE * LOGO_SIZE),
    `${differing} pixels do logo diferem da referência`,
  ).toBeLessThanOrEqual(MAX_DIFF_PIXEL_RATIO);
});

// Two pictures of the logo, the given time apart, under the motion preference the page has now.
async function twoInstants(page: Page, gapMs: number): Promise<[Buffer, Buffer]> {
  const logo = page.getByRole("img", { name: /versão Eclusa/ });
  const first = await logo.screenshot();
  await page.waitForTimeout(gapMs);
  return [first, await logo.screenshot()];
}

test("com movimento normal o logo muda de um instante para o outro, e para quando o movimento é reduzido", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });

  // 400 ms is almost 5 frames of the drawing.
  const [before, after] = await twoInstants(page, 400);
  expect(after.equals(before), "o logo mudou com movimento normal").toBe(false);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const [stopped, later] = await twoInstants(page, 400);
  expect(later.equals(stopped), "o logo ficou parado com movimento reduzido").toBe(true);
  await context.close();
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
