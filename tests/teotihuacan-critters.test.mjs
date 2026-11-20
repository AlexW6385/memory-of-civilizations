// Teotihuacan's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/teotihuacan.md §21): turkeys and dogs, no hens, in the opened
// compounds' patios, the barrio's forecourts, the market's lanes and the avenue's plazas, each off the visitor's lanes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/teotihuacan/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';
import { compounds, MARKET } from '../src/settlements/teotihuacan/layout.js';
import { intoCompound } from '../src/settlements/teotihuacan/walk.js';

const inst = expandCritters(data.critters, { id: 'teotihuacan' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const home = (i) => [i.groups[1][0], i.groups[1][2]];
const segDist = (p, route) => { let d = 1e9; for (let k = 0; k + 1 < route.length; k++) { const [a, b] = [route[k], route[k + 1]], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)); d = Math.min(d, Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t)); } return d; };

test('the instances: only turkeys and dogs (no hens), every pose known, a modest count', () => {
  assert.ok(inst.length >= 25 && inst.length <= 70, `${inst.length} critters`);
  for (const i of inst) { assert.ok(['turkey', 'dog'].includes(i.model), i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
  assert.ok(of('turkey').length >= 15 && of('dog').length >= 6);
  assert.ok(MODELS.turkey().tris < 700);
});

test('in the opened compounds\' patios: off the lane from the gate to the kitchen\'s door, inside the patio, at a bird\'s pace', () => {
  for (const c of compounds().filter((q) => q.open)) {
    const route = intoCompound(c), [x0, z0, x1, z1] = c.rect, cw = (x1 - x0 - 2) / 3, cd = (z1 - z0 - 2) / 3, patio = [x0 + 1 + cw, z0 + 1 + cd, x0 + 1 + 2 * cw, z0 + 1 + 2 * cd];
    const here = inst.filter((i) => { const h = home(i); return h[0] > patio[0] && h[0] < patio[2] && h[1] > patio[1] && h[1] < patio[3]; });
    assert.ok(here.length >= 2, `${here.length} critters in the patio of ${c.seed}`);
    for (const i of here) {
      const d = segDist(home(i), route);
      assert.ok(d > 1.7, `${i.model} at ${home(i)} stands ${d.toFixed(2)} m from the lane`);
      if (i.model === 'turkey') { let m = 0; for (let t = 0; t < 300; t += 0.5) { const r = run(i, t, far(i)); m = Math.max(m, Math.hypot(r.X - home(i)[0], r.Z - home(i)[1])); } assert.ok(m < 3.2, `a turkey wanders ${m.toFixed(1)} m`); }
    }
  }
});

test('in the market the critters keep off the lanes\' middle line', () => {
  const [x0, z0, x1, z1] = MARKET, cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
  const inM = inst.filter((i) => { const h = home(i); return h[0] > x0 && h[0] < x1 && h[1] > z0 && h[1] < z1; });
  assert.ok(inM.length >= 5);
  for (const i of inM) { const h = home(i); assert.ok(Math.abs(h[1] - cz) > 3 || Math.abs(h[0] - cx) > 3, `${h}`); }
});
