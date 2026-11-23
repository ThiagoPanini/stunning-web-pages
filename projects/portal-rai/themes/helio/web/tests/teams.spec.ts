// 02 · Times: a faixa contra a Captura de referência, e os cartões que entram deslizando dos lados.

import { expectBandToMatchReference, WIDTHS } from "./support/reference";
import { test } from "./support/test";

for (const width of WIDTHS) {
  test(`os Times batem com a referência em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "teams" });
  });
}
