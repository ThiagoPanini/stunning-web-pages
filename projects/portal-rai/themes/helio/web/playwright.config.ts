import { defineConfig } from "@playwright/test";

// The test drives the static export (out/), served by global-setup on a free port of 127.0.0.1.
// `pnpm test` builds first. The Chromium is the one of this exact Playwright version, the same one
// scripts/package.json pins for the Capturas de referência: another Chromium changes the page height.
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/support/global-setup.ts",
  forbidOnly: true,
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    browserName: "chromium",
    deviceScaleFactor: 1,
    trace: "retain-on-failure",
  },
});
