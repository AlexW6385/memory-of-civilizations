// Bali village's critters (src/engine/fauna-critters.js; docs/settlements/bali-village.md §13.4): stepped in Node; none goes into a house or onto a walk route.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/bali-village/fauna.js';
import { lots } from '../src/settlements/bali-village/layout.js';
import plan from '../src/settlements/bali-village/plan.js';
import { compoundParts } from '../src/styles/balinese/compound.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'bali-village' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const rects = lots().flatMap((l) => { const p = compoundParts({ rect: l.rect, front: l.front, seed: l.seed, rich: l.rich, gateF: l.gateF, shop: l.shop }); return [p.house?.rect, p.pav?.rect].filter(Boolean); });
const segd = (a, b, x, z) => { const dx = b[0] - a[0], dz = b[1] - a[1], q = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - a[0] - q * dx, z - a[1] - q * dz); };
const walks = (plan.walks || []).map((w) => (w.pts || w.route || w).map((p) => (Array.isArray(p) ? p : [p.x, p.z])));

test('Bali critters: the kinds, all with a rig', () => {
  assert.ok(inst.length >= 30 && inst.length <= 120, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const m of ['rooster', 'dog', 'pigeon_white', 'pig_black', 'cow_bali', 'cat_tabby', 'duck_white', 'swallow_nest', 'cagebird']) assert.ok(inst.some((i) => i.model === m), m + ' missing');
});

test('Bali critters: never in a house, clear of the walk routes, at an animal\'s pace', () => {
  for (const i of inst.filter((j) => j.model !== 'swallow_nest')) {
    let prev = null;
    for (let t = 0; t < 300; t += 0.5) {
      const r = run(i, t);
      assert.ok(!rects.some((h) => r.X > h[0] && r.X < h[2] && r.Z > h[1] && r.Z < h[3]), `${i.model} inside a building at ${r.X}, ${r.Z}`);
      for (const w of walks) for (let k = 1; k < w.length; k++) assert.ok(segd(w[k - 1], w[k], r.X, r.Z) > 0.4, `${i.model} on a route at ${r.X}, ${r.Z}`);
      if (prev) assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 3, i.model + ' speed');
      prev = r;
    }
  }
});
