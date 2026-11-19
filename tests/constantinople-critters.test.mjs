// Constantinople's critters (src/engine/fauna-critters.js; docs/settlements/constantinople.md §16.4): every model is known, each stands where it should (on the
// floor of the portico beside a shop's door lane, on the paving, in the lane before its house), and the dogs and cats answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/constantinople/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { ground } from '../src/settlements/constantinople/ground.js';
import { shopRooms } from '../src/settlements/constantinople/shops.js';

const inst = expandCritters(data.critters, { id: 'constantinople' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));

test('the instances: every model is known, the count is small', () => {
  assert.ok(inst.length >= 25 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  const n = (m) => inst.filter((i) => i.model === m).length;
  assert.ok(n('dog') >= 4 && n('cat_tabby') + n('cat_orange') >= 4 && n('rooster') >= 1 && n('pigeon_grey') >= 4 && n('cagebird') === 1);
});

test('every critter stands on the ground, the floor of a portico or a cage hung on a wall; none in a shop door\'s lane', () => {
  const rooms = shopRooms().filter((r) => r.k > 0 && r.k < r.ns - 1);       // (the corner shops, where two stoas meet, overlap: noted in the dossier)
  for (const c of data.critters) {
    const [x, y, z] = c.at, g = ground.height(x, z);
    if (c.model === 'cagebird') assert.ok(y - g > 2 && y - g < 4, 'the cage hangs on the wall');
    else assert.ok(Math.abs(y - g) < 0.45, `${c.model} at ${x},${z}: y ${y} on ground ${g}`);
    for (const r of rooms) {
      // the shop's door lane: 1.5 m wide across the middle of the door, running out to the street
      const A = (r.F.W(1, 0)[0] - r.F.W(0, 0)[0]) * (x - r.door[0]) + (r.F.W(1, 0)[1] - r.F.W(0, 0)[1]) * (z - r.door[1]);        // along the shop's front
      const B = Math.hypot(x - r.door[0], z - r.door[1]);
      if (c.model !== 'cagebird' && B < 6 && Math.abs(A) < 0.75) assert.fail(`${c.model} at ${x},${z} lies in the door lane of ${r.id}`);
    }
  }
});

test('the dog stands up for the visitor and a cat lifts its head; the hens stay in their lane', () => {
  const dog = inst.find((i) => i.model === 'dog'), far = [dog.groups[1][0] + 70, 1.6, dog.groups[1][2]], near = [dog.groups[1][0] + 2, 1.6, dog.groups[1][2]];
  const a = run(dog, 20, far), b = run(dog, 20, near);
  assert.notDeepEqual(a, b, 'the dog answers the visitor');
  const hen = inst.find((i) => i.model === 'hen_brown');
  const [hx, , hz] = [hen.groups[1][0], 0, hen.groups[1][2]];
  for (let t = 0; t < 300; t += 0.5) { const r = run(hen, t, [hx + 60, 1.6, hz]); assert.ok(Math.hypot(r.X - hx, r.Z - hz) < 3.2, `hen at ${r.X},${r.Z}`); }
});
