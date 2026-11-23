// The check of a theme, in one command: install its app from the frozen lockfile, then lint, typecheck and
// test it (the app's own scripts), then check its documents. One step at a time, with its output in view;
// the first step that fails stops the check, which exits with that step's code. The last line says what
// passed.
//
// Usage: node scripts/check.mjs <theme dir>

import { spawnSync } from 'node:child_process';
import { isAbsolute, join, relative } from 'node:path';
import { REPO_ROOT, readTheme } from './theme.mjs';

// The steps of a theme's check, in order; refuses a folder that is not a theme.
export function checkSteps(themeDir) {
  const theme = readTheme(themeDir);
  const app = (name, ...args) => ({ name, command: 'pnpm', args, cwd: theme.web });
  return [
    app('install', 'install', '--frozen-lockfile'),
    app('lint', 'lint'),
    app('typecheck', 'typecheck'),
    app('test', 'test'),
    {
      name: 'docs',
      command: process.execPath,
      args: [join(import.meta.dirname, 'check-docs.mjs'), theme.dir],
      cwd: REPO_ROOT,
    },
  ];
}

// A step as a command line to read, with paths from the current folder.
function commandLine({ command, args, cwd }) {
  const shown = (path) => relative(process.cwd(), path) || '.';
  const words = [command === process.execPath ? 'node' : command, ...args.map((arg) => (isAbsolute(arg) ? shown(arg) : arg))];
  return `${words.join(' ')}  (in ${shown(cwd)})`;
}

// Runs the steps one at a time and returns the exit code of the first that fails, or 0.
export function runSteps(steps, { stdio = 'inherit', log = console.log } = {}) {
  const passed = [];
  for (const step of steps) {
    log(`\n== ${step.name}: ${commandLine(step)}`);
    const result = spawnSync(step.command, step.args, { cwd: step.cwd, stdio });
    if (result.status !== 0) {
      const reason = result.error
        ? `could not start: ${result.error.message}`
        : result.signal
          ? `was stopped by ${result.signal}`
          : `exited with ${result.status}`;
      log(`FAILED: ${step.name} ${reason}; passed: ${passed.join(', ') || 'none'}`);
      return result.status || 1;
    }
    passed.push(step.name);
  }
  log(`OK: ${passed.join(', ')}`);
  return 0;
}

if (import.meta.main) {
  const [themeDir] = process.argv.slice(2);
  if (!themeDir) {
    console.error('usage: node scripts/check.mjs <theme dir>');
    process.exit(2);
  }
  let steps;
  try {
    steps = checkSteps(themeDir);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  process.exitCode = runSteps(steps);
}
