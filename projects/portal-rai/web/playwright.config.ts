import { defineConfig } from "@playwright/test";

// The test drives the static export (out/), served by global-setup on a free port of 127.0.0.1.
// `pnpm test` builds first. The Chromium is the one of this exact Playwright version, the same one
// scripts/package.json pins for the reference captures: another Chromium changes the page height.
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/support/global-setup.ts",
  forbidOnly: true,
  fullyParallel: true,
  // Two browsers at a time: the default, half the CPU cores, opens more Chromiums than a machine with
  // 8 GB of RAM holds, and the OOM killer ends some of them when several suites run together.
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    browserName: "chromium",
    deviceScaleFactor: 1,
    trace: "retain-on-failure",
    // The same raster as the reference captures (scripts/capture.mjs): with partial raster, the frames
    // a hover transition draws leave traces in the final pixels, and which frames are drawn depends on timing.
    launchOptions: { args: ["--disable-partial-raster"] },
  },
});
