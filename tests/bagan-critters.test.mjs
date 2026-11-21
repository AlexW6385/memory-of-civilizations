// Pagan's critters (src/settlements/bagan/fauna.js; docs/settlements/bagan.md §15.4), expanded in Node as the other settlements' are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/bagan/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { walkRoutes } from '../src/settlements/bagan/walkroutes.js';
import { lots, inTank, inRiver } from '../src/settlements/bagan/layout.js';

const inst = expandCritters(data.critters, { id: 'bagan' });
const of = (...m) => inst.filter((i) => m.includes(i.model));

test('the instances: known models, a modest number, the animals Pagan had (no turkeys, no cormorants)', () => {
  assert.ok(inst.length >= 30 && inst.length <= 90, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('dog').length >= 5 && of('cat_tabby', 'cat_orange').length >= 3 && of('rooster').length >= 3 && of('hen_brown', 'hen_white').length >= 6 && of('goat_black', 'goat_white').length >= 3);
  assert.ok(of('pigeon_grey', 'pigeon_white').length >= 8 && of('duck_white', 'duck_brown').length >= 2 && of('kingfisher').length >= 2 && of('swallow_nest').length >= 6);
  assert.equal(of('turkey', 'cormorant', 'cagebird').length, 0);
});

test('nothing stands in a shop door\'s lane or inside a shop\'s lot but the nests under the beams', () => {
  const doors = walkRoutes().flatMap((r) => r.route.map((p) => p));
  for (const i of inst) {
    if (i.model === 'swallow_nest') continue;
    const [x, , z] = i.groups[1];
    assert.ok(!doors.some(([a, b]) => Math.hypot(a - x, b - z) < 1.2), `${i.model} in a door's lane at ${x.toFixed(1)}, ${z.toFixed(1)}`);
    if (['dog', 'cat_tabby', 'cat_orange', 'rooster', 'hen_brown', 'hen_white'].includes(i.model)) assert.ok(!lots().some((l) => l.shop && x > l.rect[0] && x < l.rect[2] && (l.front === 's' ? z < l.rect[3] - 1.0 && z > l.rect[3] - 9.8 : z > l.rect[1] + 1.0 && z < l.rect[1] + 9.8)), `${i.model} inside a shop at ${x.toFixed(1)}, ${z.toFixed(1)}`);
  }
});

test('the kingfishers perch on land and look at water; the ducks have the tank', () => {
  for (const i of of('kingfisher')) { const [x, , z] = i.groups[1]; assert.ok(!inRiver(x, z, 0) && !inTank(x, z, 0), 'perch on land'); }
  assert.ok(data.critters.some((c) => c.type === 'floaters' && c.models.includes('duck_white')));
});
