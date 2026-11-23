// Builds small throwaway trees on disk for the tests: a theme laid out as the catalog lays one out, and a
// directory with project/ as a Design System artifact serves it.

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export function writeTree(root, files) {
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

export function tempDir(prefix = 'scripts-test-') {
  return mkdtempSync(join(tmpdir(), prefix));
}

export const GLOBALS_CSS = `@import "tailwindcss";

@theme static {
  --*: initial;
  --spacing: 0.25rem;

  /* Families. */
  --font-sans: "Aurora Sans", system-ui, sans-serif;
  --default-font-family: var(--font-sans);

  --color-ink: #101010; /* page */
  --color-paper: rgba(255, 255, 255, 0.5);
  --text-14: 14px;
  --text-20-40: clamp(20px, 3vw, 40px);
  --font-weight-light: 300;
  --leading-150: 1.5;
  --tracking-tight-20: -0.02em;
  --radius-8: 8px;
  --ease-enter: cubic-bezier(0.2, 0.7, 0.2, 1);
}
`;

// A theme of project "demo-portal" named "Aurora", with the files the tools read.
export function makeTheme(root, files = {}) {
  const dir = join(root, 'projects', 'demo-portal', 'themes', 'aurora');
  writeTree(dir, {
    'README.md': '# Aurora\n\nA theme.\n',
    'web/app/globals.css': GLOBALS_CSS,
    ...files,
  });
  return dir;
}
