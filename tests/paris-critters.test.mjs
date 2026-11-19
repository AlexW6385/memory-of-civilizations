// Paris's critters (src/settlements/paris/fauna.js): the models exist, the ducks stay on the arms of the Seine,
// the geese stay on the Left Bank strand, the pigeons stay on the parvis and in the palace court, the hens stay in the
// court row's passages, and nothing leaves the ground.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/paris/fauna.js';
import { riverDistance } from '../src/settlements/paris/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { MODELS } from '../src/engine/critter-models.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'paris' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (re) => inst.filter((i) => re.test(i.model));
const trace = (i, dt = 0.5, T = 300) => { const o = []; for (let t = 0; t < T; t += dt) o.push(run(i, t, far(i))); return o; };

test('every model is known and the count is modest', () => {
  assert.ok(inst.length >= 20 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) { assert.ok(MODELS[i.model], i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
});

test('ducks stay on the water of the arms, clear of the banks', () => {
  const ducks = of(/^duck/);
  assert.ok(ducks.length >= 5);
  for (const d of ducks) for (const r of trace(d)) assert.ok(riverDistance(r.X, r.Z) < -1.0, `duck at ${r.X.toFixed(1)},${r.Z.toFixed(1)} is on dry land`);
});

test('pigeons keep to the parvis and the palace court, geese to the Left Bank strand', () => {
  const pig = of(/^pigeon/), geese = of(/^goose/);
  assert.ok(pig.length >= 10 && geese.length >= 3);
  const parvis = (x, z) => x > 96 && x < 154 && Math.abs(z) < 44, court = (x, z) => x > -330 && x < -108 && Math.abs(z) < 62;
  for (const p of pig) for (const r of trace(p, 1, 200)) assert.ok(parvis(r.X, r.Z) || court(r.X, r.Z), `pigeon at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
  for (const g of geese) for (const r of trace(g, 1, 200)) assert.ok(r.X > -40 && r.X < 0 && r.Z > 148 && r.Z < 160, `goose at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
});

test('on the ground: the land animals stand near the ground level (rig root dips when they lie or crouch)', () => {
  for (const i of inst.filter((q) => /^(hen|rooster|cat|dog|pigeon|goose)/.test(q.model))) for (const r of trace(i, 5, 100)) assert.ok(r.Y > 0.7 && r.Y < 1.6, `${i.model} at height ${r.Y.toFixed(2)}`);
});
