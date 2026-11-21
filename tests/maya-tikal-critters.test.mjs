// Tikal's critters (src/engine/fauna-critters.js; docs/settlements/maya-tikal.md §19): turkeys and dogs only among the land animals (no hens, pigs, goats or cats before 1492),
// ground-doves, swallows' nests at the craft houses, ducks and a kingfisher at the reservoirs; each off the visitor's routes into the opened houses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/maya-tikal/fauna.js';
import plaza from '../src/settlements/maya-tikal/plan.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';

const inst = expandCritters(data.critters, { id: 'maya-tikal' });
const segDist = (p, route) => { let d = 1e9; for (let k = 0; k + 1 < route.length; k++) { const [a, b] = [route[k], route[k + 1]], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)); d = Math.min(d, Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t)); } return d; };

test('the instances: the Maya\'s animals only, every pose known', () => {
  assert.ok(inst.length >= 25 && inst.length <= 90, `${inst.length} critters`);
  const ok = new Set(['turkey', 'dog', 'pigeon_grey', 'pigeon_dark', 'swallow_nest', 'duck_brown', 'duck_white', 'kingfisher']);
  for (const i of inst) { assert.ok(ok.has(i.model), i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
  for (const bad of ['hen_brown', 'hen_white', 'rooster', 'cat_tabby', 'cat_orange', 'goat_black', 'goat_white']) assert.ok(!inst.some((i) => i.model === bad), 'no ' + bad);
  assert.ok(inst.filter((i) => i.model === 'turkey').length >= 8 && inst.filter((i) => i.model === 'dog').length >= 4);
  assert.ok(inst.some((i) => i.model === 'swallow_nest') && inst.some((i) => i.model === 'kingfisher'));
  for (const m of ['turkey', 'dog']) assert.ok(MODELS[m]().tris < 900, m);
});

test('the land animals keep off the routes into the craft houses and the market hall', () => {
  const routes = plaza.walks.filter((w) => w.name && /craft|market/.test(w.name));
  assert.ok(routes.length >= 7);
  for (const i of inst.filter((q) => q.model === 'turkey' || q.model === 'dog')) {
    const h = [i.groups[1][0], i.groups[1][2]];
    for (const w of routes) assert.ok(segDist(h, w) > 1.2, `${i.model} at ${h.map((v) => v.toFixed(1))} stands ${segDist(h, w).toFixed(2)} m from ${w.name}`);
  }
});
