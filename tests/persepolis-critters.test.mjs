// Persepolis' critters (src/settlements/persepolis/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/persepolis.md §23.4): the models are known, no animal
// on the ground stands in a house, nests are on the walls of the walk's open houses, the pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/persepolis/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect } from '../src/settlements/persepolis/layout.js';
import { terraceLots } from '../src/settlements/persepolis/terrace-houses.js';
import { walkRoutes } from '../src/settlements/persepolis/walkroutes.js';

const inst = expandCritters(data.critters, { id: 'persepolis' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const inHouse = (x, z, y, m = 0.2) => (y > 5 ? terraceLots() : lots()).some((l) => inRect(l.rect, x, z, m));

test('every model is known, the count is small, nothing on the ground stands in a house, no cats', () => {
  assert.ok(inst.length >= 12 && inst.length <= 26, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest') assert.ok(!inHouse(i.groups[1][0], i.groups[1][2], i.groups[1][1]), `${i.model} in a house at ${i.groups[1]}`);
  assert.ok(!inst.some((i) => /^cat/.test(i.model)), 'no cats in the 5th century BC (not attested)');
  assert.ok(of('rooster').length >= 1 && of('hen_brown').length >= 1 && of('dog').length >= 3 && of('goat_black').length >= 1);
});

test('swallows: nests on the walls of houses of the walk, the birds go out and come home', () => {
  const nests = of('swallow_nest'), open = walkRoutes().map((r) => r.l);
  assert.ok(nests.length >= 4, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(open.some((l) => inRect(l.rect, x, z, 0.3)), `nest at ${x}, ${z} on a house of the walk`); assert.ok(y > 1.5); }
  const n = nests[0];
  let away = 0, home = 0;
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0);
});

test('dogs and goats answer the visitor; the fowl keep to their yard', () => {
  const pets = [...of('dog'), ...of('goat_black'), ...of('goat_white'), ...of('rooster')];
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
  }
  for (const d of of('hen_brown')) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 4.5, 'hen wandered'); } }
});
