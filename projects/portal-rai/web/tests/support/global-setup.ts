// Starts the static server over the export before any test, and stops it after the last one.
// The address reaches the tests through CURATED_BASE_URL, which the workers inherit.

import { access } from "node:fs/promises";
import { join } from "node:path";
import { startStaticServer } from "./static-server";

export const OUT_DIR = join(import.meta.dirname, "..", "..", "out");

export default async function globalSetup() {
  await access(join(OUT_DIR, "index.html")).catch(() => {
    throw new Error(
      "out/index.html does not exist: run `pnpm test`, which builds first, or `pnpm build`.",
    );
  });
  const server = await startStaticServer(OUT_DIR);
  process.env.CURATED_BASE_URL = server.url;
  return server.close;
}
