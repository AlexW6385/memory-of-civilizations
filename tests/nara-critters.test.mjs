// Nara's critters (src/settlements/nara/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/nara.md §19.4): the models are
// known, the fowl keep to their patch beside a well, nothing stands in a house, the swallows' nests are on the walls of open houses and the
// swallows go out and come home, the cats and dogs answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/nara/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, serviceLots, inRect, yards } from '../src/settlements/nara/layout.js';
import { openedLots } from '../src/settlements/nara/walk.js';

const inst = expandCritters(data.critters, { id: 'nara' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const inHouse = (x, z, m = 0.2) => [...lots(), ...serviceLots()].some((l) => inRect(l.rect, x, z, m));

test('the instances: every model is known, the count is small, no animal on the ground stands in a house', () => {
  assert.ok(inst.length >= 15 && inst.length <= 30, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest') assert.ok(!inHouse(i.groups[1][0], i.groups[1][2]), `${i.model} in a house at ${i.groups[1]}`);
  assert.ok(data.flights.some((f) => f.kind === 'kite'), 'a kite over the temple');
});

test('fowl keep to a small patch beside a well and pace like fowl', () => {
  assert.equal(of('rooster').length, 3); assert.equal(of('hen_brown').length, 3); assert.equal(of('hen_white').length, 3);
  const wells = yards();
  for (const m of ['hen_brown', 'hen_white', 'rooster']) for (const h of of(m)) {
    const [x, , z] = h.groups[1];
    assert.ok(wells.some(([wx, wz]) => Math.hypot(wx - x, wz - z) < 4.5), `${m} beside a well`);
    let prev = null, vmax = 0;
    for (let t = 0; t < 300; t += 0.2) { const r = run(h, t, far(h)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, `${m} wandered`); assert.ok(!inHouse(r.X, r.Z, 0), `${m} walked into a house`); if (prev) vmax = Math.max(vmax, Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.2); prev = r; }
    assert.ok(vmax < 0.9, `${m} speed ${vmax}`);
  }
});

test('swallows: nests on the walls of open houses, under the eave, away from each other; the birds go out and come home', () => {
  const nests = of('swallow_nest'), open = [...openedLots().keys()];
  assert.ok(nests.length >= 6, `${nests.length} nests`);
  for (const n of nests) {
    const [x, y, z] = n.groups[1];
    assert.ok(y > 2.2 && y < 2.9, 'under the eave');
    assert.ok(open.some((l) => inRect(l.rect, x, z, 0.3)), `nest at ${x}, ${z} on an open house`);
  }
  const n = nests[0];
  let away = 0, home = 0;
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0, `out ${away} samples, home ${home}`);
});

test('cats and dogs: lying far off, they answer the visitor near', () => {
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog')];
  assert.equal(pets.length, 4);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
