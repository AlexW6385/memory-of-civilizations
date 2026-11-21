// Khajuraho's critters (src/settlements/khajuraho/fauna.js, src/engine/fauna-critters.js; docs/settlements/khajuraho.md §21): the models are known, no animal on the ground
// stands in a house, the pets answer the visitor, the pigeons keep to their patch, the kingfisher fishes and comes back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/khajuraho/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect } from '../src/settlements/khajuraho/layout.js';

const inst = expandCritters(data.critters, { id: 'khajuraho' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 14 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) {
    const [x, y, z] = i.groups[1];
    if (y > 0.3 || i.model.startsWith('duck')) continue;                                     // on a verandah's platform (outside the lot's rect) or afloat
    assert.ok(!lots().some((l) => inRect(l.rect, x, z, 0.2)), `${i.model} in a house at ${x}, ${z}`);
  }
});

test('pigeons keep to their patch; cats, dogs, goats and hens answer the visitor', () => {
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'pigeon wandered'); } }
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 6);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
  assert.ok(of('hen_brown').length >= 3 && of('rooster').length >= 2);
});

test('the kingfisher fishes and comes back to its perch', () => {
  const k = of('kingfisher')[0];
  assert.ok(k, 'a kingfisher');
  let away = 0, home = 0;
  for (let t = 0; t < 120; t += 0.25) { const r = run(k, t, far(k)), d = Math.hypot(r.X - k.groups[1][0], r.Z - k.groups[1][2]); for (const v of Object.values(r)) assert.ok(Number.isFinite(v)); if (d > 1) away++; if (d < 0.3) home++; }
  assert.ok(away > 0 && home > 0);
});
