// Shaolin's critters (src/settlements/shaolin/fauna.js, src/engine/fauna-critters.js): the models are known, nothing on the ground stands in a house, nests sit on
// the fronts of the walk's open houses under the eave, the pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/shaolin/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { HOUSES, inRect } from '../src/settlements/shaolin/layout.js';
import { openedHouses } from '../src/settlements/shaolin/walk.js';

const inst = expandCritters(data.critters, { id: 'shaolin' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const inHouse = (x, z, m = 0.1) => HOUSES.some((h) => inRect(h.rect, x, z, m));

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 14 && inst.length <= 30, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest') assert.ok(!inHouse(i.groups[1][0], i.groups[1][2]), `${i.model} in a house at ${i.groups[1]}`);
});

test('swallows: nests under the eaves of open houses of the walk', () => {
  const nests = of('swallow_nest'), open = openedHouses().map((o) => o.h);
  assert.ok(nests.length >= 3, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(y > 2.2 && y < 4.6, `y ${y}`); assert.ok(open.some((h) => inRect(h.rect, x, z, 0.3)), `nest at ${x}, ${z} on an open house`); }
});

test('doves keep to their patch; cats, dogs, goats and fowl answer the visitor', () => {
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'dove wandered'); } }
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog'), ...of('goat_black'), ...of('goat_white'), ...of('rooster')];
  assert.ok(pets.length >= 6);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
