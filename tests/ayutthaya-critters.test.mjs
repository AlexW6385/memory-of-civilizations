// Ayutthaya's critters (src/settlements/ayutthaya/fauna.js, src/engine/fauna-critters.js, critter-poses.js; docs/settlements/ayutthaya.md §13.4): the models are known,
// no animal on the ground stands in a house, the fowl are behind houses of the walk, the ducks are on the canal, the pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/ayutthaya/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect, CANALS } from '../src/settlements/ayutthaya/layout.js';

const inst = expandCritters(data.critters, { id: 'ayutthaya' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const inHouse = (x, z, m = 0.1) => lots().some((l) => inRect(l.rect, x, z, m));

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 18 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (!['cagebird', 'cat_tabby', 'kingfisher'].includes(i.model) && !/duck/.test(i.model)) assert.ok(!inHouse(i.groups[1][0], i.groups[1][2]), `${i.model} in a house at ${i.groups[1]}`);
  for (const m of ['dog', 'cat_orange', 'cat_tabby', 'rooster', 'hen_brown', 'hen_white', 'kingfisher', 'cagebird', 'pigeon_grey', 'pigeon_white', 'duck_white', 'duck_brown']) assert.ok(of(m).length > 0, m);
  assert.ok(!inst.some((i) => /goat|cormorant|swallow_nest|turkey/.test(i.model)), 'none of the animals Ayutthaya did not keep in town');
});

test('the fowl scratch behind the houses of the walk; the doves keep to their patch', () => {
  const walk = lots().filter((l) => l.walk && l.kind !== 'shop');
  for (const f of [...of('rooster'), ...of('hen_brown'), ...of('hen_white')]) { const [x, , z] = f.groups[1]; assert.ok(walk.some((l) => inRect([l.rect[0] - 2, l.rect[1] - 4, l.rect[2] + 2, l.rect[3] + 4], x, z)), `fowl at ${x}, ${z} near a house of the walk`); }
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'dove wandered'); } }
});

test('the ducks are on the canal by the gate bridge, the kingfisher on its bank', () => {
  const c = CANALS.find((q) => q.id === 'z1').rect, f = data.critters.find((q) => q.type === 'floaters');
  assert.ok(f && f.models.includes('duck_white') && f.models.includes('duck_brown'));
  assert.ok(f.area[0] > 20 && f.area[2] < 80 && f.area[1] >= c[1] && f.area[3] <= c[3], 'the loop lies in the canal');
  assert.ok(f.dist((f.area[0] + f.area[2]) / 2, (c[1] + c[3]) / 2) < 0 && f.dist(50, c[3] + 2) > 0, 'water inside, bank outside');
  assert.ok(f.y < 0, 'afloat');
  assert.equal(of('duck_white').length + of('duck_brown').length, f.models.length);
  const k = of('kingfisher')[0]; assert.ok(k.groups[1][2] < c[1] && k.groups[1][2] > c[1] - 1, 'on the bank');
});

test('cats and dogs answer the visitor', () => {
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog')];
  assert.ok(pets.length >= 5);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
