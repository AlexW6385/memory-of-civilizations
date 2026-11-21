// SG̱ang Gwaay's critters (src/settlements/sgang-gwaay/fauna.js, src/engine/fauna-critters.js): the models are known, none stands in a house or in the sea,
// the walkers keep to their patch, no animal the island did not have in 1850 (hen, cat, horse, goat).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/sgang-gwaay/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { inHouse, height, SEA } from '../src/settlements/sgang-gwaay/layout.js';

const inst = expandCritters(data.critters, { id: 'sgang-gwaay' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];

test('the instances: every model is known, a modest count, none in a house', () => {
  assert.ok(inst.length >= 15 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst.filter((q) => q.model === 'dog' || q.model === 'rook' || q.model === 'gull_silver')) assert.ok(!inHouse(i.groups[1][0], i.groups[1][2], -0.3), `${i.model} in a house`);
  assert.ok(!inst.some((i) => /^(hen|rooster|cat|goat)/.test(i.model)), 'nothing the island did not have');
  for (const m of ['dog', 'rook', 'gull_silver', 'cormorant', 'kingfisher', 'crane']) assert.ok(inst.some((i) => i.model === m), m);
});

test('the walkers on the beach keep to a small patch and stay on land', () => {
  for (const i of inst.filter((q) => q.model === 'rook' || q.model === 'gull_silver')) {
    const [x, , z] = i.groups[1];
    for (let t = 0; t < 200; t += 0.5) { const r = run(i, t, far(i)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.5, `${i.model} wandered`); assert.ok(height(r.X, r.Z) > SEA, `${i.model} in the sea`); }
  }
});
