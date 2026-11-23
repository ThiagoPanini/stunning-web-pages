// Reference captures of the Claude Design boards (.dc.html), rendered outside the editor.
//
// Usage: node scripts/capture.mjs <origin-dir> --runtime <path/to/dc-runtime.js>
//
// Reads <origin-dir>/captures.json, serves <origin-dir>/boards/ over HTTP on 127.0.0.1 (ephemeral port),
// answering /support.js with the editor runtime given in --runtime, and writes for each board and width:
//   <origin-dir>/reference/<board>-<width>.png    the full page, the reference capture itself
//   <origin-dir>/reference/<board>-<width>.json   page size, capture conditions and the box of each block
//
// Capture conditions: headless Chromium from the pinned Playwright, deviceScaleFactor 1, reduced motion,
// no touch emulation, and a viewport grown to the document height. The reveals of the boards use CSS
// scroll-driven animations; in a short viewport everything below the fold would stay invisible.
// See scripts/README.md for the whole pull.

import { createReadStream } from 'node:fs';
import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { basename, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

// Start short: documentElement.scrollHeight never reports less than the viewport, so a board smaller
// than the first viewport (the logo, 560 px) would be captured with empty space below it.
const INITIAL_VIEWPORT_HEIGHT = 100;
const MAX_GROW_STEPS = 6;
const SETTLE_MS = 500;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function fail(message) {
  console.error(`capture: ${message}`);
  process.exit(1);
}

async function readRecipe(originDir) {
  const path = join(originDir, 'captures.json');
  let recipe;
  try {
    recipe = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`could not read ${path}: ${error.message}`);
  }
  if (!Array.isArray(recipe.captures) || recipe.captures.length === 0) {
    fail(`${path} needs a non-empty "captures" list`);
  }
  for (const entry of recipe.captures) {
    if (typeof entry.board !== 'string' || !entry.board.endsWith('.dc.html')) {
      fail(`each capture needs a "board" naming a .dc.html file (got ${JSON.stringify(entry.board)})`);
    }
    if (!Array.isArray(entry.widths) || entry.widths.length === 0 || !entry.widths.every(Number.isInteger)) {
      fail(`${entry.board}: "widths" must be a list of integers`);
    }
  }
  return recipe;
}

// Serves only the files directly inside boardsDir, plus the runtime as /support.js.
function serveBoards(boardsDir, runtimePath) {
  const misses = [];
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url, 'http://127.0.0.1');
    if (pathname === '/favicon.ico') {
      response.writeHead(204).end();
      return;
    }
    let file;
    if (pathname === '/support.js') {
      file = runtimePath;
    } else {
      const name = decodeURIComponent(pathname.slice(1));
      if (name && !name.includes('/') && !name.includes('\\') && !name.startsWith('.')) file = join(boardsDir, name);
    }
    const isFile = file ? await stat(file).then((s) => s.isFile(), () => false) : false;
    if (!isFile) {
      misses.push(pathname);
      response.writeHead(404).end();
      return;
    }
    const extension = file.slice(file.lastIndexOf('.'));
    response.writeHead(200, { 'content-type': CONTENT_TYPES[extension] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
  });
  return new Promise((resolveServer) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolveServer({ server, base: `http://127.0.0.1:${port}/`, misses });
    });
  });
}

// Edges rounded to the nearest pixel, so the boxes of adjacent blocks tile without overlap.
function pixelBox(rect) {
  const x = Math.round(rect.x);
  const y = Math.round(rect.y);
  return { x, y, width: Math.round(rect.x + rect.width) - x, height: Math.round(rect.y + rect.height) - y };
}

async function measureBoxes(page, selectors = {}) {
  const found = await page.evaluate((entries) => {
    const result = {};
    for (const [name, selector] of entries) {
      const matches = document.querySelectorAll(selector);
      if (matches.length !== 1) {
        result[name] = { error: `"${selector}" matched ${matches.length} elements` };
        continue;
      }
      const rect = matches[0].getBoundingClientRect();
      result[name] = { x: rect.x + window.scrollX, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
    }
    return result;
  }, Object.entries(selectors));
  const boxes = {};
  for (const [name, rect] of Object.entries(found)) {
    if (rect.error) throw new Error(`box "${name}": ${rect.error}`);
    if (rect.width === 0 || rect.height === 0) throw new Error(`box "${name}": element has no size`);
    boxes[name] = pixelBox(rect);
  }
  return boxes;
}

async function captureBoard(browser, base, entry, width) {
  const context = await browser.newContext({
    viewport: { width, height: INITIAL_VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console error: ${message.text()}`);
  });
  page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()} ${request.failure()?.errorText ?? ''}`));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });

  await page.goto(base + entry.board, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector('#dc-root *', { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(SETTLE_MS);

  // Grow the viewport to the document height until it stops changing, so every reveal sits inside the view.
  const documentHeight = () => page.evaluate(() => document.documentElement.scrollHeight);
  let height = await documentHeight();
  let converged = false;
  for (let step = 0; step < MAX_GROW_STEPS; step++) {
    await page.setViewportSize({ width, height });
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SETTLE_MS);
    const next = await documentHeight();
    if (next === height) {
      converged = true;
      break;
    }
    height = next;
  }
  if (!converged) throw new Error(`${entry.board} at ${width} px: the height did not settle (last ${height} px)`);

  const health = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('#dc-root *')].filter((element) => {
      const rect = element.getBoundingClientRect();
      return getComputedStyle(element).opacity === '0' && rect.width > 0 && rect.height > 0;
    });
    return {
      hiddenElements: hidden.length,
      hiddenSample: hidden.slice(0, 3).map((element) => element.outerHTML.slice(0, 120)),
      scrollWidth: document.documentElement.scrollWidth,
      scrollY: window.scrollY,
    };
  });

  // Every check runs before anything is written, so a failed capture leaves the reference captures as they
  // were.
  const checkProblems = () => {
    if (problems.length > 0) throw new Error(`${entry.board} at ${width} px:\n  ${problems.join('\n  ')}`);
  };
  checkProblems();
  if (health.scrollY !== 0) throw new Error(`${entry.board} at ${width} px: the page scrolled (${health.scrollY} px)`);
  const blocks = await measureBoxes(page, entry.blocks);
  const regions = await measureBoxes(page, entry.regions);
  const shot = await page.screenshot({ fullPage: true, animations: 'disabled' });
  checkProblems();
  await context.close();

  const image = `${basename(entry.board, '.dc.html')}-${width}`;
  const reference = join(entry.originDir, 'reference');
  await writeFile(join(reference, `${image}.png`), shot);

  const record = {
    board: entry.board,
    image: `${image}.png`,
    width,
    height,
    conditions: { browser: `chromium ${browser.version()}`, deviceScaleFactor: 1, reducedMotion: 'reduce', touch: false },
    blocks,
    ...(entry.regions ? { regions } : {}),
  };
  await writeFile(join(reference, `${image}.json`), `${JSON.stringify(record, null, 2)}\n`);
  return { image, height, ...health };
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { runtime: { type: 'string' } },
  });
  if (positionals.length !== 1 || !values.runtime) {
    fail('usage: node scripts/capture.mjs <theme origin dir> --runtime <downloaded dc-runtime.js>');
  }
  const originDir = resolve(positionals[0]);
  const runtimePath = resolve(values.runtime);
  await access(runtimePath).catch(() => fail(`runtime not found: ${runtimePath}`));
  const boardsDir = join(originDir, 'boards');
  const recipe = await readRecipe(originDir);
  for (const entry of recipe.captures) {
    await access(join(boardsDir, entry.board)).catch(() => fail(`board not found: ${join(boardsDir, entry.board)}`));
  }
  await mkdir(join(originDir, 'reference'), { recursive: true });

  const { server, base, misses } = await serveBoards(boardsDir, runtimePath);
  const browser = await chromium.launch({ headless: true });
  let failed = false;
  try {
    for (const entry of recipe.captures) {
      for (const width of entry.widths) {
        try {
          const result = await captureBoard(browser, base, { ...entry, originDir }, width);
          const overflow = result.scrollWidth > width ? `, horizontal overflow of ${result.scrollWidth - width} px` : '';
          console.log(`${result.image}: ${width} x ${result.height} px, ${result.hiddenElements} invisible elements${overflow}`);
          for (const sample of result.hiddenSample) console.log(`  invisible: ${sample}`);
        } catch (error) {
          failed = true;
          console.error(`capture: ${error.message}`);
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  if (misses.length > 0) {
    failed = true;
    console.error(`capture: the server did not find ${[...new Set(misses)].join(', ')} (board missing from boards/?)`);
  }
  if (failed) process.exit(1);
}

await main();
