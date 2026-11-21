// Rapa Nui's critters (src/engine/fauna-critters.js; docs/settlements/rapa-nui.md §10.4): stepped in Node; only the island's own animals; none leaves its place
// into a house or onto a walk route; the two models added for it build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/rapa-nui/fauna.js';
import tongariki from '../src/settlements/rapa-nui/plan.js';
import { village } from '../src/settlements/rapa-nui/layout.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';

const inst = expandCritters(data.critters, { id: 'rapa-nui' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const inHull = (h, x, z) => { const dx = x - h.c[0], dz = z - h.c[1], u = dx * Math.cos(h.yaw) - dz * Math.sin(h.yaw), v = dx * Math.sin(h.yaw) + dz * Math.cos(h.yaw); return Math.abs(u) < h.len / 2 + 0.3 && Math.abs(v) < h.w / 2 + 0.3; };
const pts = [];
for (const route of tongariki.walks) for (let k = 0; k + 1 < route.length; k++) for (let u = 0; u <= 1; u += 0.1) pts.push([route[k][0] + (route[k + 1][0] - route[k][0]) * u, route[k][1] + (route[k + 1][1] - route[k][1]) * u]);

test('Rapa Nui critters: fowl, rats and noddies only, all known models; none of the animals the island lacked', () => {
  assert.ok(inst.length >= 25 && inst.length <= 45, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const m of ['rooster', 'hen_brown', 'kiore', 'noddy']) assert.ok(inst.some((i) => i.model === m), m);
  for (const i of inst) assert.ok(!/dog|cat_|goat|pig|cow|horse|donkey|llama/.test(i.model), i.model);
});

test('Rapa Nui critters: the added models build', () => {
  for (const k of ['noddy', 'kiore']) { const m = MODELS[k](); assert.ok(m.pos.length > 100, k); }
});

test('Rapa Nui critters: never in a house, clear of the walk routes, at an animal\'s pace', () => {
  const houses = village().houses;
  for (const i of inst) {
    let prev = null;
    for (let t = 0; t < 300; t += 0.5) {
      const r = run(i, t);
      assert.ok(!houses.some((h) => inHull(h, r.X, r.Z)), `${i.model} inside a house at ${r.X}, ${r.Z}`);
      assert.ok(!pts.some((p) => Math.hypot(p[0] - r.X, p[1] - r.Z) < 0.9), `${i.model} on the route at ${r.X}, ${r.Z}`);
      if (prev) assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
});
