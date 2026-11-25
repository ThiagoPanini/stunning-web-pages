// The rule of scripts/README.md, made a test: every tool takes the path of a project and cites none. The
// names come from the catalog itself (each folder projects/<project> and the "# " heading of its
// README.md), so a new project is covered with no change here. No tool may cite a literal artifact address
// either: only a project's pointer holds one.
//
// How a name is matched, and why. Code and comments are in English, and a project may be named by a common
// English word (a project "Paper" in folder paper/). Matching every form anywhere, ignoring case, would
// flag `--color-paper` or "a paper trail". So:
//   - accents are folded on both sides: "Índigo" and "Indigo" are the same name;
//   - a project's name is matched case-sensitively, in the form its heading writes it, as a whole word on
//     its left and not followed by a lowercase letter or a digit on its right. An example ("Aurora Índigo
//     Claro"), or a title built from the name, is caught; the English word, which code writes in
//     lowercase or inside a longer identifier, is not. A name of several words is matched also with its
//     words joined, as written and capitalized: the namespace form ("AuroraIndigo", "PortalDemo" for a
//     heading "portal-demo");
//   - a folder name is matched only as a path segment or a quoted string: right next to "/", a quote or a
//     backtick, and not inside a longer name. That is how code uses a folder; the same word in prose or in
//     a token name (`--color-paper`) is left alone.
// What it gives up: a folder name in plain prose ("the paper project") passes, and a sentence that opens
// with the capitalized word ("Paper trails...") is flagged: reword it.

import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { REPO_ROOT } from '../project.mjs';

const fold = (text) => text.normalize('NFD').replace(/\p{M}/gu, '');
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function projectName(name) {
  const folded = fold(name);
  const words = folded.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const forms = new Set([folded, words.join(''), words.map((word) => word[0].toUpperCase() + word.slice(1)).join('')]);
  const patterns = [...forms].map((form) => new RegExp(`(?<![\\p{L}\\p{N}_])${escape(form)}(?![\\p{Ll}\\p{N}_])`, 'u'));
  return { label: `project name "${name}"`, patterns };
}

function folder(name) {
  const word = escape(fold(name));
  const pattern = new RegExp(
    `(?<=[/'"\`])${word}(?![\\p{L}\\p{N}_-])|(?<![\\p{L}\\p{N}_-])${word}(?=[/'"\`])`,
    'u',
  );
  return { label: `project folder "${name}"`, patterns: [pattern] };
}

// Each line of the sources that cites a name, as "<path>:<line>: <name>".
function citations(sources, names) {
  const found = [];
  for (const { path, text } of sources) {
    fold(text)
      .split('\n')
      .forEach((line, index) => {
        for (const { label, patterns } of names) {
          if (patterns.some((pattern) => pattern.test(line))) found.push(`${path}:${index + 1}: ${label}`);
        }
      });
  }
  return found;
}

const subdirs = (dir) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

// The names of each project of the catalog: its folder and the heading of its README.
function catalogNames() {
  const projects = join(REPO_ROOT, 'projects');
  const names = [];
  for (const project of subdirs(projects)) {
    names.push(folder(project));
    const readme = join(projects, project, 'README.md');
    const heading = readFileSync(readme, 'utf8').match(/^# (.+)$/m);
    if (!heading) throw new Error(`${readme}: no "# <name>" heading to name the project`);
    names.push(projectName(heading[1].trim()));
  }
  return names;
}

// The tools' code: the .mjs files at the root of scripts/ and in scripts/tests/, but this test.
function toolSources() {
  const scripts = join(REPO_ROOT, 'scripts');
  return ['.', 'tests']
    .flatMap((dir) =>
      readdirSync(join(scripts, dir))
        .filter((file) => file.endsWith('.mjs'))
        .map((file) => join(scripts, dir, file)),
    )
    .filter((path) => path !== import.meta.filename)
    .map((path) => ({ path: path.slice(REPO_ROOT.length + 1), text: readFileSync(path, 'utf8') }));
}

test('a name is caught in its own form, a folder as a path, and the common word is left alone', () => {
  const names = [folder('paper'), projectName('Paper'), projectName('Aurora Índigo'), folder('portal-demo'), projectName('portal-demo')];
  const text = [
    '// e.g. a project named Aurora Índigo Claro',
    "const namespace = 'AuroraIndigoClaro';",
    "const dir = 'projects/paper';",
    '// a paper trail, in --color-paper, paperwork and papers',
    'const isPaper = true; // Papers, `paper-white`',
    '// Paper is the project',
    "const title = 'portal-demo';",
    "const namespace = 'PortalDemo';",
    '// the portal-demos and the PortalDemos',
  ].join('\n');
  assert.deepEqual(citations([{ path: 'tool.mjs', text }], names), [
    'tool.mjs:1: project name "Aurora Índigo"',
    'tool.mjs:2: project name "Aurora Índigo"',
    'tool.mjs:3: project folder "paper"',
    'tool.mjs:6: project name "Paper"',
    'tool.mjs:7: project folder "portal-demo"',
    'tool.mjs:7: project name "portal-demo"',
    'tool.mjs:8: project name "portal-demo"',
  ]);
});

test('no tool cites a project of the catalog, by its folder or by the heading of its README', () => {
  const names = catalogNames();
  assert.ok(names.some(({ label }) => label.startsWith('project folder')), 'the catalog has no project folder');
  assert.ok(names.some(({ label }) => label.startsWith('project name')), 'the catalog has no project to read names from');
  assert.deepEqual(citations(toolSources(), names), []);
});

// A literal address: claude.ai, any path, then artifact/ or artifacts/ and an id. A placeholder such as
// <id> is not an id, and an address put together at run time, as check-docs.test.mjs does, is no literal.
const ARTIFACT_ADDRESS = { label: 'artifact address', patterns: [/claude\.ai\/(?:[^\s/'"`]+\/)*artifacts?\/[\w-]+/i] };

test('no tool cites an artifact address', () => {
  assert.deepEqual(citations(toolSources(), [ARTIFACT_ADDRESS]), []);
});
