// Borgund's critters (src/settlements/norse-borgund/fauna.js, src/engine/fauna-critters.js; docs/settlements/norse-borgund.md R6.4): the models are known, no
// animal on the ground stands inside a building, the fowl keep to their yard, the swallows' nests are on barn walls under the eave and the birds go out and come home.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/norse-borgund/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { buildings, inRect } from '../src/settlements/norse-borgund/layout.js';

const inst = expandCritters(data.critters, { id: 'norse-borgund' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const inHouse = (x, z, m = 0.2) => buildings().some((b) => inRect(b.rect, x, z, m));

test('the instances: every model is known, the count is small, no animal on the ground stands in a building', () => {
  assert.ok(inst.length >= 25 && inst.length <= 120, `${inst.length} critters`);   // ceiling 60 -> 120: the settlement's herds and yard groups are critters too (src/settlements/herds-data.js, at most 56 per settlement)
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest') assert.ok(!inHouse(i.groups[1][0], i.groups[1][2]), `${i.model} in a building at ${i.groups[1]}`);
  assert.ok(of('dog').length >= 6 && of('goat_white').length >= 3 && of('goose_grey').length >= 2 && of('cat_tabby').length + of('cat_orange').length >= 4);
});

test('fowl keep to a small patch in their yard and pace like fowl', () => {
  for (const m of ['hen_brown', 'hen_white', 'rooster']) for (const h of of(m)) {
    const [x, , z] = h.groups[1];
    let prev = null, vmax = 0;
    for (let t = 0; t < 300; t += 0.2) { const r = run(h, t, far(h)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, `${m} wandered`); assert.ok(!inHouse(r.X, r.Z, 0), `${m} walked into a building`); if (prev) vmax = Math.max(vmax, Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.2); prev = r; }
    assert.ok(vmax < 0.9, `${m} speed ${vmax}`);
  }
});

test('swallows: nests on the walls of barns, under the eave; the birds go out and come home', () => {
  const nests = of('swallow_nest'), barns = buildings().filter((b) => b.kind === 'barn');
  assert.ok(nests.length >= 2, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(barns.some((b) => inRect(b.rect, x, z, 0.4) && y > b.y + 3 && y < b.y + 4.2), `nest at ${x}, ${z} under a barn's eave`); }
  const n = nests[0];
  let away = 0, home = 0;
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0, `out ${away} samples, home ${home}`);
});
