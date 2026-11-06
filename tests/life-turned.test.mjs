// The life of the streets reads house fronts inside `turned` elements (New York's grid, 29° off the
// axes), keeps its things off the turned lots, and its plans' ids do not clash with a settlement's own.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES } from '../src/settlements/grounds.js';
import { lots, GRID } from '../src/settlements/new-york/layout.js';

test('New York: street dressing by the turned lots, off them, ids distinct', async () => {
  const town = await (await MODULES['new-york']()).town();
  const ids = town.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'plan ids are distinct');
  const gen = town.filter((p) => p.id.startsWith('new-york-street-life-')).flatMap((p) => p.elements);
  const n = (t) => gen.filter((e) => e.t === t).length;
  assert.ok(n('bench') > 100 && n('crates') > 30, `benches ${n('bench')}, crates ${n('crates')}`);
  const all = lots(), c = Math.cos(-GRID), s = Math.sin(-GRID);
  for (const e of gen) {
    const x = c * e.at[0] + s * e.at[1], z = -s * e.at[0] + c * e.at[1];
    assert.ok(!all.some((l) => x > l.rect[0] && x < l.rect[2] && z > l.rect[1] && z < l.rect[3]), `${e.t} at ${e.at} stands in a lot`);
  }
});
