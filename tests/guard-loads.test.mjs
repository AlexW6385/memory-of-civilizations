// Guards and soldiers hold their spears or staffs, never a porter's load (Constantinople's Chalke guards once
// carried a carrying pole with two baskets): every figure written on a line that names a guard, a soldier, a
// sentry or a warrior, under a comment that names them, or within the helper that makes one, carries no load.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LOADS = ['pole', 'pails', 'yoke', 'sack', 'bundle', 'jige', 'headload', 'wood_head', 'basket', 'pot', 'hoe', 'broom', 'besom'];
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.js') ? [p] : []; });

test('no guard or soldier carries a porter\'s load', () => {
  const bad = [];
  for (const f of files('src/settlements')) {
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => {
      // the line that names them, and the helper's body that follows a `const guard = ` (up to 4 lines)
      const named = /\b(guard|guards|soldier|soldiers|sentry|warrior)\b/i.test(l) && !/^\s*(\/\/|\*)/.test(l);
      const inHelper = lines.slice(Math.max(0, i - 4), i).some((p) => /const (guard|soldier|warrior|sentry)\w* = /.test(p));
      // the two lines under a comment that names them (`// guards at the Chalke's door`)
      const under = lines.slice(Math.max(0, i - 2), i).some((p) => /^\s*\/\/.*\b(guard|guards|soldier|soldiers|sentry|sentries|warrior|warriors)\b/i.test(p));
      if (!named && !inHelper && !under) return;
      for (const m of l.matchAll(/carry: *'(\w+)'/g)) if (LOADS.includes(m[1])) bad.push(`${f}:${i + 1} carry '${m[1]}'`);
    });
  }
  assert.deepEqual(bad, []);
});
