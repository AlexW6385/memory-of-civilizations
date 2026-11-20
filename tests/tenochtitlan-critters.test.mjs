// Tenochtitlan's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/tenochtitlan.md §23): the turkeys and dogs in the
// patios of the compounds the visitor can enter (each inside its own patio and out of the lane to the hearth room's door), the ducks on the
// west canal (in the water, together), the new turkey model.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/tenochtitlan/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';
import { openSet } from '../src/settlements/tenochtitlan/opened.js';
import { recordOf, routeInto } from '../src/settlements/tenochtitlan/walk.js';

const inst = expandCritters(data.critters, { id: 'tenochtitlan' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const trace = (i, cam = far(i), dt = 0.5, T = 300) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const homeOf = (i) => { const [x, , z] = i.groups[1]; return [x, z]; };
const patioOf = (p) => [...openSet()].map((h) => ({ h, r: recordOf(h) })).find(({ h }) => p[0] > h.rect[0] && p[0] < h.rect[2] && p[1] > h.rect[1] && p[1] < h.rect[3]);

test('the instances: every model is known, the turkey model is a small one, the count is small', () => {
  assert.ok(inst.length >= 14 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  const m = MODELS.turkey();
  assert.ok(m.tris > 80 && m.tris < 700, `turkey ${m.tris} triangles`);
  assert.ok(of('turkey').length >= 8 && of('dog').length >= 3);
});

test('turkeys and dogs: each in the patio of a compound the visitor can enter, clear of the lane to the hearth room, walking at a bird\'s pace', () => {
  for (const i of [...of('turkey'), ...of('dog')]) {
    const home = homeOf(i), P = patioOf(home);
    assert.ok(P, `${i.model} at ${home} is in no opened compound`);
    const route = routeInto(P.h), pr = P.r.patio;
    let dmin = 1e9;
    for (let k = 0; k + 1 < route.length; k++) {
      const [a, b] = [route[k], route[k + 1]], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((home[0] - a[0]) * vx + (home[1] - a[1]) * vz) / l2));
      dmin = Math.min(dmin, Math.hypot(home[0] - a[0] - vx * t, home[1] - a[1] - vz * t));
    }
    assert.ok(dmin > 1.5, `${i.model} at ${home} stands ${dmin.toFixed(2)} m from the lane`);
    assert.ok(home[0] > pr[0] && home[0] < pr[2] && home[1] > pr[1] && home[1] < pr[3], `${i.model} at ${home} is not in the patio`);
    if (i.model === 'turkey') {
      const tr = trace(i);
      let far0 = 0; for (const { r } of tr) far0 = Math.max(far0, Math.hypot(r.X - home[0], r.Z - home[1]));
      assert.ok(far0 < 3.2, `a turkey wanders ${far0.toFixed(1)} m`);
    }
  }
});

test('the ducks: a raft on the west canal, none on dry land, together', () => {
  const ducks = inst.filter((i) => i.model === 'duck_white' || i.model === 'duck_brown');
  assert.ok(ducks.length >= 8);
  for (const d of ducks) for (const s of trace(d, far(d), 1)) assert.ok(s.r.X > -224 && s.r.X < -216, `duck at ${s.r.X},${s.r.Z}`);
});
