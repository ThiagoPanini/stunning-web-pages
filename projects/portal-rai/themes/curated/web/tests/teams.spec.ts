// The surprise cards' reaction between the two teams: with normal motion, a fine pointer and the cards
// side by side, hovering the Red Team fires its shots at the Blue Team, which raises its wall; side by
// side only above 980 px.

import { expect, load, test } from "./support/test";

const PATH = "/?versaoCards=02-surprise";

async function runningShots(page: import("@playwright/test").Page) {
  return page
    .locator(".team-shot")
    .evaluateAll(
      (shots) =>
        shots.flatMap((shot) => shot.getAnimations()).filter((a) => a.playState === "running")
          .length,
    );
}

test("hovering the Red Team fires its shots and the Blue Team raises its wall", async ({
  newWindow,
}) => {
  const page = await newWindow(1440, { motion: "no-preference" });
  await load(page, PATH);
  await page.locator('[data-team="red"]').scrollIntoViewIfNeeded();
  expect(await runningShots(page), "shots at rest").toBe(0);
  await page.locator('[data-team="red"]').hover();
  await expect.poll(() => runningShots(page), { message: "shots" }).toBe(3);
  const wall = await page
    .locator(".team-wall")
    .evaluate((element) => element.getAnimations().length);
  expect(wall, "the wall's animation").toBe(1);
});

test("at 980 px or less the cards do not react to each other", async ({ newWindow }) => {
  const page = await newWindow(980, { motion: "no-preference" });
  await load(page, PATH);
  await page.locator('[data-team="red"]').scrollIntoViewIfNeeded();
  await page.locator('[data-team="red"]').hover();
  await page.waitForTimeout(300);
  expect(await runningShots(page)).toBe(0);
});
