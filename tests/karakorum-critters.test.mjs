// Karakorum's critters (src/settlements/mongol-karakorum/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/mongol-karakorum.md §14.4): the models are
// known, no animal on the ground stands inside a building, nests hang on the bazaar's rows, the pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/mongol-karakorum/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { inBuilt, SHOPS, shopRect, inRect } from '../src/settlements/mongol-karakorum/layout.js';

const inst = expandCritters(data.critters, { id: 'mongol-karakorum' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing on the ground stands in a building', () => {
  assert.ok(inst.length >= 14 && inst.length <= 100, `${inst.length} critters`);   // ceiling 50 -> 100: the settlement's herds and yard groups are critters too (src/settlements/herds-data.js, at most 56 per settlement)
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (!['swallow_nest', 'cagebird'].includes(i.model)) assert.ok(!inBuilt(i.groups[1][0], i.groups[1][2]), `${i.model} in a building at ${i.groups[1]}`);
});

test('swallows: nests on the front beams of the bazaar rows; the birds go out and come home', () => {
  const nests = of('swallow_nest');
  assert.ok(nests.length >= 4, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(y > 2.2 && y < 2.9); assert.ok(SHOPS.some((s) => inRect(shopRect(s), x, z, 0.5)), `nest at ${x}, ${z} on a row`); }
  const n = nests[0];
  let away = 0, home = 0;
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0);
});

test('hens and doves keep to their patch; dogs, camels, goats and the cat answer the visitor', () => {
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white'), ...of('hen_brown'), ...of('hen_white'), ...of('rooster')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.4, d.model + ' wandered'); } }
  const pets = [...of('mastiff'), ...of('dog'), ...of('camel_dun'), ...of('camel_dark'), ...of('goat_black'), ...of('goat_white'), ...of('cat_tabby')];
  assert.ok(pets.length >= 10);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
