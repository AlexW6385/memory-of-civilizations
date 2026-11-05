// The builders run in a worker (src/engine/build-worker.js), which has no import map: modules the
// worker loads must not import 'three' (or 'three/…') by name, only through src/core/three.js.
import test from 'node:test';
import assert from 'node:assert';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/', import.meta.url));
async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

test('builders import three.js only through src/core/three.js', async () => {
  const bad = [];
  for (const d of ['core', 'objects', 'styles', 'settlements', 'world']) {
    for (const f of await walk(join(ROOT, d))) {
      if (f.endsWith(join('core', 'three.js'))) continue;
      const s = await readFile(f, 'utf8');
      if (/from\s+['"]three(\/[^'"]*)?['"]|import\(\s*['"]three/.test(s)) bad.push(f.slice(ROOT.length));
    }
  }
  assert.deepStrictEqual(bad, [], `import from '../core/three.js' (relative) instead of 'three' in:\n${bad.join('\n')}`);
});
