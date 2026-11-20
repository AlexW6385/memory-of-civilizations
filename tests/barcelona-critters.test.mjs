// Barcelona's critters (src/settlements/barcelona/fauna.js): the models exist, the pigeons keep to the pavements, the fowl stay inside the works' hoarding, the cats,
// dogs and cages stand at shop doors and nothing stands in a wall (docs/settlements/barcelona.md §14.4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data, { PAVE } from '../src/settlements/barcelona/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { MODELS } from '../src/engine/critter-models.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { SAGRADA, MERCAT, PITCH, BLOCK } from '../src/settlements/barcelona/layout.js';
import { blockElements } from '../src/settlements/barcelona/town.js';
import { shopDoors } from '../src/settlements/barcelona/shoproutes.js';

const inst = expandCritters(data.critters, { id: 'barcelona' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (re) => inst.filter((i) => re.test(i.model));
const trace = (i, dt = 0.5, T = 300) => { const o = []; for (let t = 0; t < T; t += dt) o.push(run(i, t, far(i))); return o; };

test('every model is known and the count is modest', () => {
  assert.ok(inst.length >= 20 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) { assert.ok(MODELS[i.model], i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
});

test('pigeons keep to the pavements (4.4 m wide, on the kerb side of the house faces)', () => {
  const pig = of(/^pigeon/);
  assert.ok(pig.length >= 8);
  const XM = PITCH * 2.5, [mx, mz] = MERCAT, h = BLOCK / 2;
  const onPave = (x, z) => (Math.abs(x - mx) < 34 && Math.abs(Math.abs(z - mz) - PAVE) < 2.0) || (Math.abs(x - (XM + 8.8)) < 2.0 && z < -50 && z > -90);
  for (const p of pig) for (const r of trace(p, 1, 200)) assert.ok(onPave(r.X, r.Z) && Math.abs(r.Z - mz) !== h, `pigeon at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
});

test('the fowl keep inside the works (north of the hoarding on the cross street, west of the Schools)', () => {
  const fowl = of(/^(hen|rooster)/);
  assert.ok(fowl.length >= 3);
  const zH = SAGRADA[1] + BLOCK / 2 - 0.3;                                                              // the hoarding's inner face
  for (const f of fowl) for (const r of trace(f, 1, 240)) assert.ok(r.Z < zH - 0.5 && r.X < SAGRADA[0] - 12 - 10 - 0.5 && r.X > SAGRADA[0] - BLOCK / 2 + 1, `fowl at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
});

test('the cats, dogs and cages stand at shop doors, on the pavement side of the wall', () => {
  const doors = shopDoors(blockElements());
  const shops = of(/^(cat|dog|cagebird)/);
  assert.ok(of(/^cat/).length >= 3 && of(/^dog/).length >= 1 && of(/^cagebird/).length >= 2);
  for (const c of shops) {
    const [x, y, z] = c.groups[1], d = doors.reduce((m, s) => { const e = Math.hypot(s.door[0] - x, s.door[1] - z); return e < m.e ? { e, s } : m; }, { e: 1e9 });
    assert.ok(d.e > 0.8 && d.e < 3.2, `${c.model} ${d.e.toFixed(2)} m from the nearest door`);
    const out = (x - d.s.door[0]) * d.s.n[0] + (z - d.s.door[1]) * d.s.n[1];
    assert.ok(out > 0.05, `${c.model} is in the wall (${out.toFixed(2)} m out)`);          // the street side of the facade line
    assert.ok(Math.abs(y - d.s.y - (c.model === 'cagebird' ? 2.4 : 0.02)) < 0.5, `${c.model} at height ${y.toFixed(2)} on a street of ${d.s.y.toFixed(2)}`);
  }
});

test('on the ground: the land animals stand at the level they were placed at', () => {
  for (const i of inst.filter((q) => /^(cat|dog|pigeon|hen|rooster)/.test(q.model))) for (const r of trace(i, 5, 100)) assert.ok(Math.abs(r.Y - i.groups[1][1]) < 0.4, `${i.model} at height ${r.Y.toFixed(2)}`);
});
