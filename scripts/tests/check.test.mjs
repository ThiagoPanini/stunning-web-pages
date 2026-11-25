import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkSteps, runSteps } from '../check.mjs';
import { REPO_ROOT } from '../project.mjs';
import { makeProject, tempDir } from './fixtures.mjs';

test("a project's check installs, lints, typechecks and tests its app, then checks its documents", () => {
  const project = makeProject(tempDir());
  const web = join(project, 'web');
  assert.deepEqual(checkSteps(project), [
    { name: 'install', command: 'pnpm', args: ['install', '--frozen-lockfile'], cwd: web },
    { name: 'lint', command: 'pnpm', args: ['lint'], cwd: web },
    { name: 'typecheck', command: 'pnpm', args: ['typecheck'], cwd: web },
    { name: 'test', command: 'pnpm', args: ['test'], cwd: web },
    {
      name: 'docs',
      command: process.execPath,
      args: [join(REPO_ROOT, 'scripts', 'check-docs.mjs'), project],
      cwd: REPO_ROOT,
    },
  ]);
});

test('a folder that is not projects/<project> is refused before any step', () => {
  assert.throws(() => checkSteps(tempDir()), /a project folder is projects\/<project>$/);
  const nested = join(makeProject(tempDir()), 'designs', 'aurora');
  assert.throws(() => checkSteps(nested), /a project folder is projects\/<project>$/);
});

// A step that leaves a file named after itself in dir, then exits with code.
function step(dir, name, code) {
  const script = `require('node:fs').writeFileSync(${JSON.stringify(join(dir, name))}, ''); process.exit(${code});`;
  return { name, command: process.execPath, args: ['-e', script], cwd: dir };
}

function run(steps) {
  const lines = [];
  const code = runSteps(steps, { stdio: 'ignore', log: (line) => lines.push(line) });
  return { code, last: lines.at(-1) };
}

test('the first step that fails stops the check, with its exit code', () => {
  const dir = tempDir();
  const { code, last } = run([step(dir, 'install', 0), step(dir, 'lint', 3), step(dir, 'typecheck', 0)]);
  assert.equal(code, 3);
  assert.deepEqual(readdirSync(dir).sort(), ['install', 'lint']);
  assert.equal(last, 'FAILED: lint exited with 3; passed: install');
});

test('when every step passes, the last line names them all', () => {
  const dir = tempDir();
  const { code, last } = run([step(dir, 'install', 0), step(dir, 'lint', 0)]);
  assert.equal(code, 0);
  assert.equal(last, 'OK: install, lint');
});

test('a step that cannot start fails the check', () => {
  const dir = tempDir();
  const missing = { name: 'lint', command: join(dir, 'no-such-program'), args: [], cwd: dir };
  const { code, last } = run([missing, step(dir, 'typecheck', 0)]);
  assert.equal(code, 1);
  assert.match(last, /^FAILED: lint could not start: .*ENOENT.*; passed: none$/);
  assert.deepEqual(readdirSync(dir), []);
});
