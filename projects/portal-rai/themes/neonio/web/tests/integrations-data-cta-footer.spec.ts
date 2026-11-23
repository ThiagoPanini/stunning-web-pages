// Integrations, Data, the closing call and the footer: the last band of the Home against the reference
// capture, how the bento and the features reflow when narrow, where the footer's links go, and the
// links and buttons the design left open.

import type { Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { type BlockName, expectBandToMatchReference, WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

for (const width of WIDTHS) {
  test(`integrations match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "integrations" });
  });

  test(`data match the reference at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "data" });
  });

  // From the top of Data to the bottom of the page: the space above the closing call is its own, and no
  // block holds it.
  test(`the closing call and the footer match the reference at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    await expectBandToMatchReference(page, { width, from: "data", to: "footer" });
  });

  test(`nothing in the last four blocks spills sideways at ${width} px`, async ({
    referencePage,
  }) => {
    const page = await referencePage(width);
    expect(await spilledElements(page, width, ["integrations", "data", "cta", "footer"])).toEqual(
      [],
    );
  });

  test(`"Contato", in the header, brings the footer into view at ${width} px`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width, { motion: "reduce" });
    await page.goto("/");
    await page
      .locator('[data-block="header"]')
      .getByRole("link", { name: "Contato", exact: true })
      .click();
    await expect(page).toHaveURL(/#contato$/);
    const footer = page.locator('[data-block="footer"]');
    await expect(footer.getByRole("heading", { name: "Contato", exact: true })).toBeInViewport();
    await expect(footer.getByText("[NOME DA COMPANHIA]")).toBeInViewport();
  });
}

// The columns a block's captions sit in, at the given window width: how many distinct left edges their
// bold lead-ins have.
async function captionColumns(page: Page, block: BlockName, width: number): Promise<number> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  const lefts = await page
    .locator(`[data-block="${block}"] p strong`)
    .evaluateAll((leads) => leads.map((lead) => Math.round(lead.getBoundingClientRect().x)));
  return new Set(lefts).size;
}

// The bento's columns where the board changes them: three above 1100px, two down to 641px, then one.
for (const [width, columns] of [
  [1101, 3],
  [1100, 2],
  [641, 2],
  [640, 1],
] as const) {
  test(`at ${width} px the bento has ${columns} column(s)`, async ({ page }) => {
    expect(await captionColumns(page, "integrations", width)).toBe(columns);
  });
}

// The media slot of the bento's tall card (3:5) and of its first wide card (16:10), at the given width.
async function bentoMedia(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  const integrations = page.locator('[data-block="integrations"]');
  const boxOf = async (label: string) => {
    const box = await integrations.getByText(label).first().locator("..").boundingBox();
    if (!box) throw new Error(`the ${label} placeholder has no box`);
    return box;
  };
  return { tall: await boxOf("inserir gif · 3:5"), wide: await boxOf("inserir gif · 16:10") };
}

test("the bento's tall card spans both rows above 1100 px, and a whole row at 1100 px", async ({
  page,
}) => {
  const above = await bentoMedia(page, 1101);
  expect(above.tall.width).toBe(above.wide.width);
  expect(above.tall.height).toBeGreaterThan(2 * above.wide.height);
  const at = await bentoMedia(page, 1100);
  expect(at.tall.width).toBeGreaterThan(2 * at.wide.width);
});

// The Data captions: two columns above 760px, one at 760px and below.
for (const [width, columns] of [
  [761, 2],
  [760, 1],
] as const) {
  test(`at ${width} px the Data captions have ${columns} column(s)`, async ({ page }) => {
    expect(await captionColumns(page, "data", width)).toBe(columns);
  });
}

// Links to screens the design does not have yet, and buttons whose action does not exist.
const INERT_LINKS: [BlockName, string][] = [
  ["data", "Ver os dados"],
  ["cta", "Testar um guardrail"],
  ["cta", "Ver integrações"],
  ["footer", "Dados"],
  ["footer", "Playground"],
  ["footer", "Integrações"],
];

test("the links and buttons of the last four blocks that lead to what does not exist go nowhere", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "reduce" });
  await page.goto("/");
  const url = page.url();
  for (const [block, name] of INERT_LINKS) {
    const link = page.locator(`[data-block="${block}"]`).getByRole("link", { name, exact: true });
    await expect(link, `${name} (${block})`).toHaveAttribute("aria-disabled", "true");
    await link.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    // Playwright waits for an aria-disabled element to be enabled before clicking it; a person can click
    // it all the same, so the click skips that wait and lands on the link with the mouse.
    await link.click({ force: true });
    expect(page.url(), `${name} (${block}) stays on the page`).toBe(url);
    expect(await page.evaluate(() => window.scrollY), `${name} (${block}) does not scroll`).toBe(
      scrollY,
    );
  }
});

// The footer's other links lead to sections of the Home.
const FOOTER_ANCHORS: [string, string][] = [
  ["Responsible AI", "#topo"],
  ["Home", "#topo"],
  ["Red Team", "#ciclo"],
  ["Blue Team", "#ciclo"],
  ["Agente de Ataque", "#solucoes"],
  ["Semana Vermelha", "#solucoes"],
  ["Guardrail Antiataque", "#solucoes"],
  ["Guardrail Ética Saída", "#solucoes"],
  ["Voltar ao topo ↑", "#topo"],
];

test("the footer's other links lead to sections of the Home", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator('[data-block="footer"]');
  for (const [name, anchor] of FOOTER_ANCHORS) {
    const link = footer.getByRole("link", { name, exact: true });
    await expect(link, name).toHaveAttribute("href", anchor);
    await expect(link, name).not.toHaveAttribute("aria-disabled");
    await expect(page.locator(anchor), `${name} leads to ${anchor}`).toHaveCount(1);
  }
  const inert = INERT_LINKS.filter(([block]) => block === "footer").length;
  expect(
    await footer.getByRole("link").count(),
    "each link of the footer is inert or leads to the Home",
  ).toBe(FOOTER_ANCHORS.length + inert);
});

test("a footer link turns white under the pointer", async ({ newWindow }) => {
  const page = await newWindow(1440, { motion: "reduce" });
  await page.goto("/");
  const link = page
    .locator('[data-block="footer"]')
    .getByRole("link", { name: "Red Team", exact: true });
  const color = () => link.evaluate((element) => getComputedStyle(element).color);
  expect(await color()).toBe("rgb(145, 148, 161)");
  await link.hover();
  expect(await color()).toBe("rgb(255, 255, 255)");
});
