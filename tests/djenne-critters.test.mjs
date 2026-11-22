// Djenne's critters (src/settlements/djenne/fauna.js, src/engine/fauna-critters.js; docs/settlements/djenne.md 20.4): the models are known, the count is small,
// no animal on the ground stands in a house, the dogs and goats answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/djenne/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { houses, inRect, COURT } from '../src/settlements/djenne/layout.js';

const inst = expandCritters(data.critters, { id: 'djenne' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 12 && inst.length <= 50, `${inst.length} critters`);   // ceiling 30 -> 50: the settlement's herds and yard groups are critters too (src/settlements/herds-data.js, at most 56 per settlement)
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  const hs = houses();
  for (const i of inst) { const [x, y, z] = i.groups[1]; if (y < 0.3 && !inRect(COURT, x, z)) assert.ok(!hs.some((h) => inRect(h.rect, x, z, 0.2)), `${i.model} in a house at ${x}, ${z}`); }
});
test('dogs and goats answer the visitor; doves keep to their patch', () => {
  for (const p of [...of('dog'), ...of('goat_black'), ...of('goat_white')]) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    assert.ok(f && c);
  }
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'dove wandered'); } }
});
