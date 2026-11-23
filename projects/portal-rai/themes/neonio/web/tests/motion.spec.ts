// The page-wide motion rules of the board: anchors scroll smoothly and links ease their hover, both only
// without reduced motion. The marquee and the logo have their own tests, in their blocks' spec files.

import { expect, type Motion, test } from "./support/test";

const scrollBehavior = { "no-preference": "smooth", reduce: "auto" };
const hoverTransition = { "no-preference": "0.15s", reduce: "0s" };

for (const motion of ["no-preference", "reduce"] as Motion[]) {
  test(`with ${motion === "reduce" ? "reduced motion" : "motion"}, anchors scroll ${scrollBehavior[motion]} and hovers take ${hoverTransition[motion]}`, async ({
    newWindow,
  }) => {
    const page = await newWindow(1440, { motion });
    await page.goto("/");
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
    ).toBe(scrollBehavior[motion]);

    const durations = await page
      .locator('[data-block="header"] a, [data-block="hero"] a')
      .evaluateAll((links) => links.map((link) => getComputedStyle(link).transitionDuration));
    // The brand has no transition of its own; every other link of the header and the hero has one.
    const withTransition = durations.filter((duration) => duration !== "0s");
    expect(durations.length).toBe(8);
    expect(withTransition).toEqual(
      motion === "reduce" ? [] : Array(7).fill(hoverTransition[motion]),
    );
  });
}
