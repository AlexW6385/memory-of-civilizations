// Dunhuang's critters (src/settlements/dunhuang/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/dunhuang.md §15.4): the models are known,
// nothing on the ground stands in a house, nests are on the walls of the walk's lots, the camels and pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/dunhuang/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';
import { lots } from '../src/settlements/dunhuang/town.js';
import { inRect } from '../src/settlements/dunhuang/layout.js';
import { walkRoutes } from '../src/settlements/dunhuang/walk.js';

const inst = expandCritters(data.critters, { id: 'dunhuang' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, nothing on the ground stands in a house or in a door lane', () => {
  assert.ok(inst.length >= 16 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest') assert.ok(!lots().some((l) => inRect(l.rect, i.groups[1][0], i.groups[1][2], 0.2)), `${i.model} in a house at ${i.groups[1]}`);
  const lanes = walkRoutes().map((r) => r.route);
  for (const i of inst) if (i.model !== 'swallow_nest') for (const R of lanes) { const [a, b] = [R[0], R[3]]; assert.ok(!(i.groups[1][0] > Math.min(a[0], b[0]) - 0.9 && i.groups[1][0] < Math.max(a[0], b[0]) + 0.9 && i.groups[1][2] > Math.min(a[1], b[1]) - 0.9 && i.groups[1][2] < Math.max(a[1], b[1]) + 0.9), `${i.model} in a door lane`); }
});

test('Bactrian camels: built, in the serai, and they answer the visitor', () => {
  assert.ok(MODELS.camel_dun().tris > 200);
  const cs = [...of('camel_dun'), ...of('camel_dark')];
  assert.ok(cs.length >= 4);
  for (const c of cs) { const f = run(c, 10, far(c)), n = run(c, 10, [c.groups[1][0] + 1.5, 1.6, c.groups[1][2]]); for (const v of [...Object.values(f), ...Object.values(n)]) assert.ok(Number.isFinite(v)); assert.notDeepEqual(f, n); }
});

test('swallows: nests under the eave on lots of the walk; the birds go out and come home', () => {
  const nests = of('swallow_nest'), open = walkRoutes().map((r) => r.l);
  assert.ok(nests.length >= 4, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(y > 2.2 && y < 2.9); assert.ok(open.some((l) => inRect(l.rect, x, z, 0.3)), `nest at ${x}, ${z} on a lot of the walk`); }
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
