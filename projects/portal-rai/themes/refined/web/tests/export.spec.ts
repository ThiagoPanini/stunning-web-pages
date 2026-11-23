// The static export (ADR 0006): the build writes both routes as plain HTML files, which any static host
// serves as they are.

import { access } from "node:fs/promises";
import { join } from "node:path";
import { OUT_DIR } from "./support/global-setup";
import { expect, test } from "./support/test";

test("the build writes the Home and the design system route as static files", async () => {
  const written = async (file: string) =>
    access(join(OUT_DIR, file)).then(
      () => true,
      () => false,
    );
  expect(await written("index.html"), "out/index.html").toBe(true);
  expect(await written("design-system.html"), "out/design-system.html").toBe(true);
});
