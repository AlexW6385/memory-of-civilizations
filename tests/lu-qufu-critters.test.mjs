// Qufu's critters (src/settlements/lu-qufu/fauna.js, src/engine/fauna-critters.js): the models are known, nothing on the ground stands in a house, the nests are under shop eaves,
// the pets and goats answer the visitor. Nothing about any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/lu-qufu/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect, shopRuns } from '../src/settlements/lu-qufu/layout.js';

const inst = expandCritters(data.critters, { id: 'lu-qufu' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 20 && inst.length <= 70, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (!/^(swallow_nest|cagebird|cat_)/.test(i.model) && i.groups[1]) assert.ok(!lots().some((l) => inRect(l.rect, i.groups[1][0], i.groups[1][2], 0.2)), `${i.model} in a house at ${i.groups[1]}`);
});

test('swallows: nests under the eaves of the shops of Queli Street; the birds go out and come home', () => {
  const nests = of('swallow_nest');
  assert.ok(nests.length >= 4, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(y > 3 && y < 3.6); assert.ok(shopRuns().some((s) => inRect(s.rect, x, z, 1.2)), `nest at ${x}, ${z} at a shop`); }
  let away = 0, home = 0; const n = nests[0];
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0);
});

test('dogs and goats answer the visitor', () => {
  const pets = [...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 8);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
