// Knossos' critters (src/settlements/knossos/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/knossos.md §20.4): the models are known, no animal
// on the ground stands in a house, there are no fowl, nests are on the walls of the walk's open houses, the pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/knossos/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect } from '../src/settlements/knossos/layout.js';
import { walkRoutes } from '../src/settlements/knossos/walkroutes.js';

const inst = expandCritters(data.critters, { id: 'knossos' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const inHouse = (x, z, m = 0.2) => lots().some((l) => inRect(l.rect, x, z, m));

test('every model is known, the count is small, nothing on the ground stands in a house, no fowl', () => {
  assert.ok(inst.length >= 12 && inst.length <= 24, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest') assert.ok(!inHouse(i.groups[1][0], i.groups[1][2]), `${i.model} in a house at ${i.groups[1]}`);
  assert.ok(!inst.some((i) => /^(hen|rooster)/.test(i.model)), 'no domestic fowl in the 17th century');
});

test('swallows: nests on the walls of open houses of the walk, under the eave; the birds go out and come home', () => {
  const nests = of('swallow_nest'), open = walkRoutes().map((r) => r.l);
  assert.ok(nests.length >= 4, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(y > 2.2 && y < 2.9); assert.ok(open.some((l) => inRect(l.rect, x, z, 0.3)), `nest at ${x}, ${z} on an open house of the walk`); }
  const n = nests[0];
  let away = 0, home = 0;
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0);
});

test('doves keep to their patch; cats, dogs and goats answer the visitor', () => {
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'dove wandered'); } }
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 7);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
