// London's critters (src/settlements/london/fauna.js): the models exist, the pigeons stay on the bridge's south footway and on the paving of
// Parliament Square's walks, no animal stands inside a house or a shop, the cats and dogs lie at the doors and barrows of the open shops.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/london/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { MODELS } from '../src/engine/critter-models.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { BRIDGE, inLot, SQUARE } from '../src/settlements/london/layout.js';

const inst = expandCritters(data.critters, { id: 'london' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (re) => inst.filter((i) => re.test(i.model));
const trace = (i, dt = 0.5, T = 300) => { const o = []; for (let t = 0; t < T; t += dt) o.push(run(i, t, far(i))); return o; };

test('every model is known and the count is modest', () => {
  assert.ok(inst.length >= 18 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) { assert.ok(MODELS[i.model], i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
});

test('pigeons keep to the bridge footway and the square\'s walks', () => {
  const pig = of(/^pigeon/);
  assert.ok(pig.length >= 12);
  const footway = (x, z) => x > 180 && x < 224 && z > BRIDGE.z + 4.4 && z < BRIDGE.z + 8, walks = (x, z) => x > SQUARE[0] && x < SQUARE[2] && z > SQUARE[1] && z < SQUARE[3];
  for (const p of pig) for (const r of trace(p, 1, 200)) assert.ok(footway(r.X, r.Z) || walks(r.X, r.Z), `pigeon at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
});

test('nothing stands inside a building, and the cats, dogs and cages are there', () => {
  for (const i of inst.filter((q) => /^(pigeon|cat|dog)/.test(q.model))) for (const r of trace(i, 5, 100)) assert.ok(!inLot(r.X, r.Z, 0), `${i.model} inside a lot at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
  assert.ok(of(/^cat/).length >= 3 && of(/^dog/).length >= 3 && of(/^cagebird/).length >= 1);
});

test('on the ground: the land animals stand at the level they were placed at (nothing sinks or floats)', () => {
  for (const i of inst.filter((q) => /^(cat|dog|pigeon)/.test(q.model))) for (const r of trace(i, 5, 100)) assert.ok(Math.abs(r.Y - i.groups[1][1]) < 0.4, `${i.model} at height ${r.Y.toFixed(2)} (placed at ${i.groups[1][1].toFixed(2)})`);
});
