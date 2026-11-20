// A settlement's profile line in soundscape.js must stand once: a merge that keeps both sides of a conflict leaves the
// old line beside the new one, and which of the two wins then depends on their order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('soundscape.js: no settlement profile and no import is written twice', () => {
  const src = readFileSync(new URL('../src/engine/soundscape.js', import.meta.url), 'utf8').split('\n');
  const seen = new Map(), twice = [];
  for (const [i, line] of src.entries()) {
    const m = /^  '?([a-z][a-z0-9-]*)'?: T\(/.exec(line) || /^(import .*);?\s*$/.exec(line);
    if (!m) continue;
    if (seen.has(m[1])) twice.push(`${m[1]} (lines ${seen.get(m[1])} and ${i + 1})`);
    seen.set(m[1], i + 1);
  }
  assert.deepEqual(twice, []);
});
