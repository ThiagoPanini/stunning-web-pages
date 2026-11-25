// The tweaks of the board, every version drawn by the app: the query string picks a version, an unknown
// value falls back to the board's default, and the panel changes the version in place and writes it to
// the address, leaving the defaults out of it.

import { TWEAKS } from "../components/tweaks";
import { expect, load, test } from "./support/test";

const cycle = '[data-block="model"] [data-version]';
const cards = '[data-block="teams"] [data-version]';

test("the Home opens with the board's defaults", async ({ page }) => {
  await load(page, "/");
  await expect(page.locator(cycle)).toHaveAttribute("data-version", TWEAKS.versaoCiclo.default);
  await expect(page.locator(cards)).toHaveAttribute("data-version", TWEAKS.versaoCards.default);
});

test("the query string picks each version of the cycle and of the cards", async ({ page }) => {
  for (const version of TWEAKS.versaoCiclo.options) {
    await load(page, `/?versaoCiclo=${version}`);
    await expect(page.locator(cycle)).toHaveAttribute("data-version", version);
  }
  for (const version of TWEAKS.versaoCards.options) {
    await load(page, `/?versaoCards=${version}`);
    await expect(page.locator(cards)).toHaveAttribute("data-version", version);
  }
});

test("the query string picks the neon of the surprise cards", async ({ page }) => {
  const names = { preenchimento: "fill", contorno: "line", holofote: "spot" };
  for (const effect of TWEAKS.efeitoNeon.options) {
    await load(page, `/?versaoCards=02-surprise&efeitoNeon=${effect}`);
    await expect(page.locator("[data-neon]")).toHaveAttribute("data-neon", names[effect]);
  }
});

test("an unknown value falls back to the board's default", async ({ page }) => {
  await load(page, "/?versaoCiclo=05-outra&versaoCards=simple");
  await expect(page.locator(cycle)).toHaveAttribute("data-version", TWEAKS.versaoCiclo.default);
  await expect(page.locator(cards)).toHaveAttribute("data-version", TWEAKS.versaoCards.default);
});

test("the panel changes the version in place and writes it to the address", async ({ page }) => {
  await load(page, "/");
  const toggle = page.getByRole("button", { name: "Tweaks" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  const panel = page.getByRole("region", { name: "Tweaks do Quadro" });
  await expect(panel).toBeVisible();

  await panel.getByText("02-fio", { exact: true }).click();
  await expect(page.locator(cycle)).toHaveAttribute("data-version", "02-fio");
  await panel.getByText("02-surprise", { exact: true }).click();
  await panel.getByText("holofote", { exact: true }).click();
  await expect(page.locator("[data-neon]")).toHaveAttribute("data-neon", "spot");
  expect(new URL(page.url()).search).toBe(
    "?versaoCiclo=02-fio&versaoCards=02-surprise&efeitoNeon=holofote",
  );
  await expect(panel.getByRole("radio", { name: "02-fio" })).toBeChecked();

  // Back to a default: it leaves the address.
  await panel.getByText("01-orbita", { exact: true }).click();
  await expect(page.locator(cycle)).toHaveAttribute("data-version", "01-orbita");
  expect(new URL(page.url()).search).toBe("?versaoCards=02-surprise&efeitoNeon=holofote");

  // A reload opens the version the address names.
  await load(page, page.url());
  await expect(page.locator(cards)).toHaveAttribute("data-version", "02-surprise");
  await expect(page.locator("[data-neon]")).toHaveAttribute("data-neon", "spot");
});

test("the panel says the neon only shows on the surprise cards", async ({ page }) => {
  await load(page, "/");
  await page.getByRole("button", { name: "Tweaks" }).click();
  const note = page.getByText("Aparece no hover dos cards 02-surprise.");
  await expect(note).toBeVisible();
  await page.getByText("02-surprise", { exact: true }).click();
  await expect(note).toHaveCount(0);
});
