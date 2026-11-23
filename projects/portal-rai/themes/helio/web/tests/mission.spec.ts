// 01 · Missão: a faixa contra a Captura de referência, e as palavras do título que acendem no scroll.

import { expectBandToMatchReference, WIDTHS } from "./support/reference";
import { test } from "./support/test";

for (const width of WIDTHS) {
  test(`a Missão bate com a referência em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "mission" });
  });
}
