// Ye's critters (src/settlements/wei-ye/fauna.js, src/engine/fauna-critters.js): the models are known, nothing on the ground stands in a house, the swallows' nests are under
// the eaves of the lodgings and walk houses, the dogs and goats answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/wei-ye/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect, LODGES } from '../src/settlements/wei-ye/layout.js';

const inst = expandCritters(data.critters, { id: 'wei-ye' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const homes = () => [...lots().map((l) => l.rect), ...LODGES.map((l) => l.rect)];
const inHouse = (x, z, m = 0.2) => homes().some((r) => inRect(r, x, z, m));

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 12 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest' && i.groups[1]) assert.ok(!inHouse(i.groups[1][0], i.groups[1][2]), `${i.model} in a house at ${i.groups[1]}`);
  assert.ok(!inst.some((i) => /^cat|^pigeon/.test(i.model)));
});

test('swallows: nests under the eaves of the lodgings and houses; the birds go out and come home', () => {
  const nests = of('swallow_nest');
  assert.ok(nests.length >= 2, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(y > 2.2 && y < 3.2); assert.ok(inHouse(x, z, 0.6), `nest at ${x}, ${z} on a house`); }
  let away = 0, home = 0; const n = nests[0];
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0);
});

test('dogs and goats answer the visitor', () => {
  const pets = [...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 4);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
