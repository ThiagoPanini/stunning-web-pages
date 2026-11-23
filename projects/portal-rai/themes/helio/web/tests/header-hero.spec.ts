// Cabeçalho e abertura: a faixa do topo da Home contra a Captura de referência, e o comportamento do
// cabeçalho em tela estreita e em ponteiro grosso.

import { expectBandToMatchReference, readReference, regionBox, WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

for (const width of WIDTHS) {
  test(`cabeçalho e abertura batem com a referência em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    // The logo has its own ticket; until it lands, its place is masked in both images.
    await expectBandToMatchReference(page, {
      width,
      from: "header",
      to: "hero",
      mask: ["logo"],
    });
  });

  test(`o lugar do logo é o da referência em ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    const reference = await readReference(width);
    expect(await regionBox(page, "logo")).toEqual(reference.regions.logo);
  });
}
