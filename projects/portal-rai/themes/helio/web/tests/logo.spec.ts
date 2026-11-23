// O logo Eclusa: parado com movimento reduzido, no quadro da Captura de referência do Quadro do logo.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
