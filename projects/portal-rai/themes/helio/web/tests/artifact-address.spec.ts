// A text guard: the address of a Claude Artefato appears only in the Ponteiro, inside the Origem. No
// other file of the Tema may cite one, because the Consumidor does not open the Artefato and the Tema
// has to be complete on its own.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { expect, test } from "./support/test";

const THEME_DIR = join(import.meta.dirname, "..", "..");

// An Artefato's address, in both forms the Claude app gives (the plain one and the one under code/), in
// any case. Written as a pattern only, so this file does not cite an address itself.
const ARTIFACT_ADDRESS = /claude\.ai\/(?:code\/)?artifacts?\//i;

// Folders that never reach git: dependencies, build and test output.
const UNVERSIONED = new Set(["node_modules", ".next", "out", "test-results", "playwright-report"]);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (UNVERSIONED.has(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [relative(THEME_DIR, path)];
  });
}

// The Tema's files git versions or would version: tracked plus untracked and not ignored. Outside a git
// checkout, every file but the build and dependency folders.
function themeFiles(): string[] {
  try {
    const listed = execFileSync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", "."],
      { cwd: THEME_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return listed.split("\0").filter((file) => file && existsSync(join(THEME_DIR, file)));
  } catch {
    return walk(THEME_DIR);
  }
}

test("nenhum arquivo do Tema fora da Origem cita o endereço de um Artefato", () => {
  const files = themeFiles().filter((file) => !file.startsWith("origin/"));
  expect(files).toContain("web/package.json");
  const citing = files.filter((file) =>
    ARTIFACT_ADDRESS.test(readFileSync(join(THEME_DIR, file), "latin1")),
  );
  expect(citing, "arquivos que citam o endereço de um Artefato").toEqual([]);
});
