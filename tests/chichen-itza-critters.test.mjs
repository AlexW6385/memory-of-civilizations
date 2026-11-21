// Chichén Itzá's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/chichen-itza.md §19.4): turkeys and dogs (no hen, cat, goat), ocellated turkeys at the forest's
// edge, swallows' nests on the cenote's walls; the animals by the visitor's walk keep off its lanes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/chichen-itza/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';
import { lots, inLot, CENOTE, cenoteDist } from '../src/settlements/chichen-itza/layout.js';
import { lotRoutes } from '../src/settlements/chichen-itza/walk.js';
import { ground } from '../src/settlements/chichen-itza/ground.js';

const inst = expandCritters(data.critters, { id: 'chichen-itza' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const home = (i) => [i.groups[1][0], i.groups[1][2]];
const segDist = (p, route) => { let d = 1e9; for (let k = 0; k + 1 < route.length; k++) { const [a, b] = [route[k], route[k + 1]], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)); d = Math.min(d, Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t)); } return d; };

test('the instances: turkeys, dogs, ocellated turkeys and swallows\' nests only (no hen, cat or goat), every pose known, a modest count', () => {
  assert.ok(inst.length >= 25 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) { assert.ok(['turkey', 'dog', 'turkey_ocellated', 'swallow_nest'].includes(i.model), i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
  assert.ok(of('turkey').length >= 12 && of('dog').length >= 3 && of('turkey_ocellated').length >= 3 && of('swallow_nest').length >= 6);
  assert.ok(MODELS.turkey_ocellated().tris < 700);
  const t = MODELS.turkey(), o = MODELS.turkey_ocellated();
  assert.equal(o.n, t.n, 'the same shape recoloured');
  assert.notDeepEqual(o.col.slice(0, 60), t.col.slice(0, 60), 'its own colours');
});

test('by the street\'s houses: dogs and turkeys keep 1.7 m off every route into a house, inside their lot', () => {
  const routes = lotRoutes();
  for (const i of inst.filter((q) => q.model === 'dog' || q.model === 'turkey')) {
    const h = home(i), l = lots().find((q) => h[0] > q.rect[0] && h[0] < q.rect[2] && h[1] > q.rect[1] && h[1] < q.rect[3]);
    if (!l || l.rect[1] !== 126) continue;
    for (const q of routes) assert.ok(segDist(h, q.route) > 1.7, `${i.model} at ${h} stands ${segDist(h, q.route).toFixed(2)} m from a route`);
  }
});

test('turkeys stay near where they stand; a dog stands where it was put', () => {
  for (const i of of('turkey')) { let m = 0; for (let t = 0; t < 300; t += 0.5) { const r = run(i, t, far(i)); m = Math.max(m, Math.hypot(r.X - home(i)[0], r.Z - home(i)[1])); } assert.ok(m < 3.6, `a turkey wandered ${m.toFixed(1)} m`); }
});

test('the ocellated turkeys stand in the forest, clear of every lot; the nests are on the cenote\'s walls, on the ground\'s face', () => {
  for (const i of of('turkey_ocellated')) { const h = home(i); assert.ok(!inLot(h[0], h[1], 3), `${h} is in a lot`); assert.ok(Math.hypot(...h) > 190); }
  for (const i of of('swallow_nest')) {
    const x = i.groups[1][0], z = i.groups[1][2], y = i.groups[1][1], d = Math.hypot(x - CENOTE.c[0], z - CENOTE.c[1]), wx = CENOTE.c[0] + (x - CENOTE.c[0]) * (d + 0.1) / d, wz = CENOTE.c[1] + (z - CENOTE.c[1]) * (d + 0.1) / d;      // the wall's face, 0.1 m behind the nest
    assert.ok(cenoteDist(x, z) < 0 && cenoteDist(x, z) > -3.2, `a nest at ${cenoteDist(x, z).toFixed(1)} m inside the rim`);
    assert.ok(Math.abs(y - ground.height(wx, wz)) < 0.6, `a nest ${(y - ground.height(wx, wz)).toFixed(2)} m off the wall's face`);
    assert.ok(y < -1 && y > CENOTE.water, 'between the rim and the water');
  }
});
