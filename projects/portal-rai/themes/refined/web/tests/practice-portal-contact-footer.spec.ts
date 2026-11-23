// The end of the Home: Na prática, No portal, Contato and the footer, each against its own cut of the
// reference capture, plus the links and the form the design left without a destination, and the width of
// the four blocks.

import type { Locator, Page } from "@playwright/test";
import { spilledElements } from "./support/overflow";
import { type BlockName, expectBandToMatchReference, WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

const OWN_BLOCKS: BlockName[] = ["practice", "portal", "contact", "footer"];

// Each band must also sit where the reference's sits, so it depends on every block above it.
const BANDS: [BlockName, string][] = [
  ["practice", "Na prática"],
  ["portal", "No portal"],
  ["contact", "Contato"],
  ["footer", "The footer"],
];

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);
const block = (page: Page, name: BlockName) => page.locator(`[data-block="${name}"]`);

for (const width of WIDTHS) {
  for (const [name, title] of BANDS) {
    test(`${title} matches the reference at ${width} px`, async ({ referencePage }) => {
      const page = await referencePage(width);
      await expectBandToMatchReference(page, { width, from: name });
    });
  }

  test(`the end of the Home does not spill sideways at ${width} px`, async ({ referencePage }) => {
    const page = await referencePage(width);
    expect(await spilledElements(page, width, OWN_BLOCKS)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });

  test(`"Voltar ao topo" goes back to the top of the page at ${width} px`, async ({
    newWindow,
  }) => {
    const page = await newWindow(width);
    await page.goto("/");
    const backToTop = block(page, "footer").getByRole("link", { name: "Voltar ao topo ↑" });
    await backToTop.scrollIntoViewIfNeeded();
    expect(await scrollY(page)).toBeGreaterThan(0);
    await backToTop.click();
    await expect.poll(() => scrollY(page)).toBe(0);
  });
}

// A link card of the portal, found by the name of its screen.
const portalCard = (page: Page, name: string) =>
  block(page, "portal")
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });

// Links to screens the design does not have yet: the portal's cards, the practice buttons and the
// footer's links to Dados, Playground and Integrações.
const INERT_LINKS: [string, (page: Page) => Locator][] = [
  ["the Playground card", (page) => portalCard(page, "Playground")],
  ["the Dados card", (page) => portalCard(page, "Dados")],
  ["the Integrações card", (page) => portalCard(page, "Integrações")],
  [
    "Deixar o agente de ataque tentar",
    (page) =>
      block(page, "practice").getByRole("link", { name: "Deixar o agente de ataque tentar" }),
  ],
  [
    "Testar um guardrail, in Na prática",
    (page) => block(page, "practice").getByRole("link", { name: "Testar um guardrail" }),
  ],
  ...["Dados", "Playground", "Integrações"].map((name): [string, (page: Page) => Locator] => [
    `${name}, in the footer`,
    (page) => block(page, "footer").getByRole("link", { name, exact: true }),
  ]),
];

test("the portal's cards and the links to screens that do not exist go nowhere", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { height: 800 });
  await page.goto("/");
  for (const [label, find] of INERT_LINKS) {
    const link = find(page);
    await link.scrollIntoViewIfNeeded();
    const before = { url: page.url(), scrollY: await scrollY(page) };
    // Playwright waits for an aria-disabled element to be enabled before clicking it; a person can click
    // it all the same, so the click skips that wait and lands on the link with the mouse.
    await link.click({ force: true });
    expect({ url: page.url(), scrollY: await scrollY(page) }, label).toEqual(before);
    await expect(link, label).toHaveAttribute("aria-disabled", "true");
  }
});

test("the footer's links to sections of the Home point to sections that exist", async ({
  page,
}) => {
  await page.goto("/");
  const targets = await block(page, "footer")
    .getByRole("link")
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href") ?? "")
        .filter((href) => href.length > 1 && href.startsWith("#"))
        .map((href) => ({ href, found: document.getElementById(href.slice(1)) !== null })),
    );
  expect(targets.map(({ href }) => href)).toEqual([
    "#topo",
    "#times",
    "#times",
    "#ciclo",
    "#solucoes",
    "#solucoes",
    "#solucoes",
    "#solucoes",
    "#topo",
  ]);
  expect(targets.filter(({ found }) => !found)).toEqual([]);
});

test("the contact fields take typing, and 'Enviar mensagem' sends nothing and goes nowhere", async ({
  newWindow,
}) => {
  // Reduced motion: the page scrolls to each field at once, not smoothly, so the scroll is measured at rest.
  const page = await newWindow(1440, { height: 800, motion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const contact = block(page, "contact");
  const fields: [string, string][] = [
    ["Nome", "Ana"],
    ["E-mail", "ana@example.com"],
    ["Como podemos ajudar?", "Quero proteger o agente de atendimento."],
  ];
  for (const [label, text] of fields) {
    const field = contact.getByLabel(label);
    await field.pressSequentially(text);
    await expect(field, label).toHaveValue(text);
  }

  const send = contact.getByRole("button", { name: "Enviar mensagem" });
  expect(await send.evaluate((button) => button.closest("form")), "a form around the button").toBe(
    null,
  );
  await send.scrollIntoViewIfNeeded();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const before = { url: page.url(), scrollY: await scrollY(page) };
  await send.click();
  await page.waitForTimeout(300);
  expect({ url: page.url(), scrollY: await scrollY(page) }).toEqual(before);
  expect(requests, "requests after the click").toEqual([]);
  // What was typed stays where it was.
  for (const [label, text] of fields)
    await expect(contact.getByLabel(label), label).toHaveValue(text);
});

test("on hover, a portal card lightens its media and turns its action tag cream", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { height: 800 });
  await page.goto("/");
  const card = portalCard(page, "Dados");
  await card.scrollIntoViewIfNeeded();
  const colors = () =>
    card.evaluate((link) => {
      const media = link.firstElementChild as Element;
      const tag = link.querySelector("span.rounded-pill") as Element;
      return {
        media: getComputedStyle(media).backgroundColor,
        tag: getComputedStyle(tag).backgroundColor,
        tagText: getComputedStyle(tag).color,
      };
    });
  expect(await colors()).toEqual({
    media: "rgb(21, 21, 20)",
    tag: "rgb(27, 27, 26)",
    tagText: "rgb(243, 241, 236)",
  });
  await card.hover();
  await expect
    .poll(colors)
    .toEqual({ media: "rgb(27, 27, 26)", tag: "rgb(232, 220, 200)", tagText: "rgb(13, 13, 12)" });
});
