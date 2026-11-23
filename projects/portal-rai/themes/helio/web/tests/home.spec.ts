// A Home como um todo: os blocos na ordem do Quadro e nenhuma requisição para fora do próprio servidor.

import { BLOCKS, WIDTHS } from "./support/reference";
import { expect, test } from "./support/test";

test("a Home compõe os blocos na ordem do Quadro", async ({ page }) => {
  await page.goto("/");
  const blocks = await page
    .locator("[data-block]")
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-block")));
  expect(blocks).toEqual([...BLOCKS]);
});

for (const width of WIDTHS) {
  test(`o app não faz requisição para fora do próprio servidor em ${width} px`, async ({
    page,
    baseURL,
  }) => {
    const own: string[] = [];
    const outside: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.protocol === "data:") return;
      (url.origin === new URL(baseURL ?? "").origin ? own : outside).push(request.url());
    });
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.wheel(0, 10_000);
    await page.waitForLoadState("networkidle");
    // The fonts come from the app's own server.
    expect(own.filter((url) => url.endsWith(".woff2"))).toHaveLength(2);
    expect(outside).toEqual([]);
  });
}
