// The document check of a project: its README, DESIGN.md and HANDOFF.md, and the README of the catalog,
// which indexes every project. It fails when
//   - a relative link or image does not resolve, or points to a heading the target does not have;
//   - DESIGN.md or HANDOFF.md cites a --token that the app's @theme does not declare, outside a section
//     "Tokens que saíram", where a document names on purpose the tokens that left the @theme, and where
//     each one must be gone;
//   - DESIGN.md writes a literal value (hex, rgb(), clamp(), cubic-bezier(), a length or a duration)
//     that the app's code (globals.css and components/) does not have;
//   - a document cites an artifact address, which only the origin's pointer may hold.
//
// Usage: node scripts/check-docs.mjs projects/<project>

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { readProject } from './project.mjs';

const ARTIFACT_ADDRESS = /claude\.ai\/(?:code\/)?artifacts?\//i;

// GitHub's anchor for a heading: lowercase, punctuation dropped except hyphens, spaces to hyphens.
function githubAnchor(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .replaceAll(' ', '-');
}

function anchors(markdown) {
  const found = new Set();
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) inFence = !inFence;
    if (!inFence && /^#{1,6} /.test(line)) found.add(githubAnchor(line.replace(/^#+ /, '').replaceAll('`', '')));
  }
  return found;
}

function checkLinks(project, docPath, text, failures) {
  const name = relative(project.dir, docPath);
  const body = text.replace(/```[\s\S]*?```/g, '');
  const targets = [...body.matchAll(/\]\(([^)\s]+)\)/g), ...body.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  let count = 0;
  for (const target of targets) {
    if (/^[a-z]+:\/\//.test(target) || target.startsWith('mailto:')) continue;
    count++;
    const hash = target.indexOf('#');
    const path = hash === -1 ? target : target.slice(0, hash);
    const anchor = hash === -1 ? '' : target.slice(hash + 1);
    const dest = path ? resolve(dirname(docPath), decodeURI(path)) : docPath;
    if (!existsSync(dest)) {
      failures.push(`${name}: broken link ${target}`);
      continue;
    }
    if (anchor && (!dest.endsWith('.md') || !anchors(readFileSync(dest, 'utf8')).has(decodeURI(anchor)))) {
      failures.push(`${name}: missing anchor ${target}`);
    }
  }
  return count;
}

// --name cited in a document; a prefix written as --color-white-… stands for a family and is skipped.
function citedTokens(text) {
  return new Set(
    [...text.matchAll(/(?<![\w-])(--[a-z][a-z0-9-]*?)(-…)?(?![a-z0-9-])/g)].filter((m) => !m[2]).map((m) => m[1]),
  );
}

// A document split in two: the sections headed "Tokens que saíram", each up to the next heading of its
// level or a higher one, and the rest.
const GONE_HEADING = 'Tokens que saíram';

function splitGone(markdown) {
  const gone = [];
  const rest = [];
  let level = 0;
  for (const line of markdown.split('\n')) {
    const heading = /^(#{1,6}) (.*)$/.exec(line);
    if (heading && level && heading[1].length <= level) level = 0;
    if (heading && heading[2].trim() === GONE_HEADING) level = heading[1].length;
    (level ? gone : rest).push(line);
  }
  return { gone: gone.join('\n'), rest: rest.join('\n') };
}

const normalize = (value) => value.toLowerCase().replace(/\s+/g, '');
const LITERAL_VALUE =
  /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|clamp\([^)]*\)|cubic-bezier\([^)]*\)|\b\d+(?:[.,]\d+)?\s?(?:px|em|rem|ms|s|vw|%)(?!\w)/g;

export function checkDocs(projectDir) {
  const project = readProject(projectDir);
  const failures = [];
  const read = (path) => readFileSync(path, 'utf8');
  // The project's three documents, then the README of the catalog, two folders up.
  const docs = ['README.md', 'DESIGN.md', 'HANDOFF.md', join('..', '..', 'README.md')].map((p) => join(project.dir, p));

  let links = 0;
  for (const doc of docs) {
    const text = read(doc);
    links += checkLinks(project, doc, text, failures);
    if (ARTIFACT_ADDRESS.test(text)) failures.push(`${relative(project.dir, doc)}: cites an artifact address`);
  }

  const themeTokens = new Set(project.tokens.keys());
  let tokensCited = 0;
  for (const name of ['DESIGN.md', 'HANDOFF.md']) {
    const { gone, rest } = splitGone(read(join(project.dir, name)));
    const cited = citedTokens(rest);
    tokensCited += cited.size;
    const missing = [...cited].filter((token) => !themeTokens.has(token)).sort();
    if (missing.length) failures.push(`${name}: tokens missing from @theme: ${missing.join(', ')}`);
    const kept = [...citedTokens(gone)].filter((token) => themeTokens.has(token)).sort();
    if (kept.length) failures.push(`${name}: tokens listed as gone but still in @theme: ${kept.join(', ')}`);
  }
  const design = read(join(project.dir, 'DESIGN.md'));
  const designCited = new Set(design.match(/(?<![\w-])--[a-z][a-z0-9-]*[a-z0-9]/g) ?? []);
  const uncited = [...themeTokens].filter((token) => !designCited.has(token));

  const componentsDir = join(project.web, 'components');
  const sources = [
    project.css,
    ...(existsSync(componentsDir) ? readdirSync(componentsDir).filter((f) => f.endsWith('.tsx')).sort() : []).map(
      (file) => read(join(componentsDir, file)),
    ),
  ];
  const code = normalize(sources.join('\n'));
  const values = [...new Set(design.match(LITERAL_VALUE) ?? [])].sort();
  const missingValues = values.filter((value) => !code.includes(normalize(value).replace(',', '.')));
  if (missingValues.length) failures.push(`DESIGN.md: values missing from the code: ${missingValues.join(', ')}`);

  return { failures, stats: { links, tokensCited, themeTokens: themeTokens.size, uncited, values } };
}

if (import.meta.main) {
  const [projectDir] = process.argv.slice(2);
  if (!projectDir) {
    console.error('usage: node scripts/check-docs.mjs projects/<project>');
    process.exit(2);
  }
  const { failures, stats } = checkDocs(projectDir);
  console.log(`relative links checked: ${stats.links}`);
  console.log(`tokens cited (DESIGN.md + HANDOFF.md, distinct per document): ${stats.tokensCited}; in @theme: ${stats.themeTokens}`);
  console.log(`@theme tokens DESIGN.md does not cite: ${stats.uncited.join(', ') || 'none'}`);
  console.log(`literal values in DESIGN.md: ${stats.values.join(', ') || 'none'}`);
  if (failures.length) {
    console.log(`FAILURES (${failures.length}):\n${failures.join('\n')}`);
    process.exit(1);
  }
  console.log('OK');
}
