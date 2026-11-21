// Great Zimbabwe's critters (src/settlements/great-zimbabwe/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/great-zimbabwe.md §19.4): the models are known,
// nothing on the ground stands inside a house or in the lane of a walk route, fowls stay near their yard, the dog and the goats answer the visitor. No writing, no pigeons, no cats.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/great-zimbabwe/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { huts } from '../src/settlements/great-zimbabwe/layout.js';
import { walkRoutes } from '../src/settlements/great-zimbabwe/walkroutes.js';
import { segDist } from '../src/settlements/great-zimbabwe/walk.js';

const inst = expandCritters(data.critters, { id: 'great-zimbabwe' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing stands in a house or in a walk route\'s lane', () => {
  assert.ok(inst.length >= 20 && inst.length <= 80, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  const H = huts();
  for (const i of inst) { const [x, , z] = i.groups[1]; assert.ok(!H.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.r + 0.4), `${i.model} in a house at ${x}, ${z}`); }
  for (const r of walkRoutes()) for (const i of inst) {
    const p = [i.groups[1][0], i.groups[1][2]];
    for (let k = 0; k + 1 < r.route.length; k++) assert.ok(segDist(p, r.route[k], r.route[k + 1]) > 0.45, `${i.model} at ${p} stands in a route`);
  }
  assert.ok(!inst.some((i) => /^(cat|pigeon|goose|duck)/.test(i.model)));
});

test('fowls keep to their yard; a rooster stands with the hens', () => {
  assert.ok(of('rooster').length >= 3 && of('hen_brown').length >= 3 && of('hen_white').length >= 3);
  for (const h of [...of('hen_brown'), ...of('hen_white'), ...of('rooster')]) { const [x, , z] = h.groups[1]; for (let t = 0; t < 120; t += 0.5) { const r = run(h, t, far(h)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'a fowl wandered'); } }
});

test('the dog and the goats answer the visitor', () => {
  const pets = [...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(of('dog').length >= 1 && of('goat_black').length >= 3 && of('goat_white').length >= 3);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
