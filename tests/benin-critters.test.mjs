// Benin City's critters (src/settlements/benin-city/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/benin-city.md §15.4): the models are known, no animal
// on the ground stands in a compound or in a door's lane, fowl and goats are many, doves keep to their patch, the pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/benin-city/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect } from '../src/settlements/benin-city/layout.js';
import { walkRoutes } from '../src/settlements/benin-city/walkroutes.js';

const inst = expandCritters(data.critters, { id: 'benin-city' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const inHouse = (x, z, m = 0.2) => lots().some((l) => inRect(l.rect, x, z, m));

test('every model is known, the count is moderate, nothing on the ground stands in a compound or a door lane', () => {
  assert.ok(inst.length >= 40 && inst.length <= 80, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) assert.ok(!inHouse(i.groups[1][0], i.groups[1][2]), `${i.model} in a compound at ${i.groups[1]}`);
  for (const r of walkRoutes()) for (const i of inst) assert.ok(Math.hypot(i.groups[1][0] - r.route[0][0], i.groups[1][2] - r.route[0][1]) > 1.5, `${i.model} in the door lane at ${r.route[0]}`);
  assert.ok(of('hen_brown').length + of('hen_white').length >= 12 && of('rooster').length >= 3 && of('goat_black').length + of('goat_white').length >= 8);
});

test('doves keep to their patch; cats, dogs and goats answer the visitor', () => {
  const doves = [...of('pigeon_grey'), ...of('pigeon_white')];
  assert.ok(doves.length >= 6);
  for (const d of doves) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'dove wanders'); } }
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 10);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
