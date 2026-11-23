// Serves the static export (out/) the way any static host would, on 127.0.0.1 and a free port the system
// picks. Several worktrees run their tests at the same time on this machine: a fixed port, or reusing a
// server already up, could measure another worktree's build.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join, normalize, sep } from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

async function isFile(path: string): Promise<boolean> {
  return stat(path).then(
    (entry) => entry.isFile(),
    () => false,
  );
}

// "/" -> index.html; "/design-system" -> design-system.html or design-system/index.html.
async function resolveFile(root: string, pathname: string): Promise<string | undefined> {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  if (relative.split(sep).includes("..")) return undefined;
  const base = join(root, relative);
  const candidates = pathname.endsWith("/")
    ? [join(base, "index.html")]
    : [base, `${base}.html`, join(base, "index.html")];
  for (const candidate of candidates) {
    if (await isFile(candidate)) return candidate;
  }
  return undefined;
}

export type StaticServer = { url: string; close: () => Promise<void> };

export async function startStaticServer(root: string): Promise<StaticServer> {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url ?? "/", "http://127.0.0.1");
    const file = await resolveFile(root, pathname);
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("not found");
      return;
    }
    response.writeHead(200, {
      "content-type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
