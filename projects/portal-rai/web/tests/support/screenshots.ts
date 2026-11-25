// The app's screenshots, in the project's screenshots/. A plain run writes nothing: it checks that
// each saved screenshot is, byte for byte, what the app renders now. Playwright's own flag rewrites
// them, as it does with its snapshots: `pnpm test --update-snapshots`.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const SCREENSHOTS_DIR = join(import.meta.dirname, "..", "..", "..", "screenshots");

export async function expectSavedScreenshot(name: string, image: Buffer): Promise<void> {
  const file = `screenshots/${name}.png`;
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  const saved = await readFile(path).catch(() => undefined);
  const matches = saved?.equals(image) ?? false;
  // The modes of --update-snapshots: "changed" is the flag alone; "missing" and "default" only create a
  // file that is not there, and "default", the plain run, still fails when it does.
  const mode = test.info().config.updateSnapshots;
  const rewrite = mode === "all" || mode === "changed";
  if ((rewrite && !matches) || (!saved && mode !== "none")) {
    await writeFile(path, image);
  }
  if (rewrite || matches) return;
  expect(
    saved !== undefined || mode === "missing",
    `${file} did not exist; written now, check it and run again`,
  ).toBe(true);
  expect(
    !saved || matches,
    `${file} is not what the app draws now: rewrite it with \`pnpm test --update-snapshots\``,
  ).toBe(true);
}
