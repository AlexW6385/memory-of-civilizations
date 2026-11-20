// Versailles's critters (src/settlements/versailles/fauna.js): the models exist, the ducks stay on the Grand Canal's reach, the pigeons keep to the
// Place d'Armes and the terrace, the hens to the service yard, and nothing leaves the ground.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data, { canalDistance } from '../src/settlements/versailles/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { MODELS } from '../src/engine/critter-models.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { PLACE, YARDS } from '../src/settlements/versailles/layout.js';

const inst = expandCritters(data.critters, { id: 'versailles' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (re) => inst.filter((i) => re.test(i.model));
const trace = (i, dt = 0.5, T = 300) => { const o = []; for (let t = 0; t < T; t += dt) o.push(run(i, t, far(i))); return o; };

test('every model is known and the count is modest', () => {
  assert.ok(inst.length >= 20 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) { assert.ok(MODELS[i.model], i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
});

test('ducks stay on the canal\'s water, clear of the quay', () => {
  const ducks = of(/^duck/);
  assert.ok(ducks.length >= 3);
  for (const d of ducks) for (const r of trace(d)) assert.ok(canalDistance(r.X, r.Z) < -0.8, `duck at ${r.X.toFixed(1)},${r.Z.toFixed(1)} is not on the water`);
});

test('pigeons keep to the Place and the terrace, hens to the south yard', () => {
  const pig = of(/^pigeon/), hens = of(/^(hen|rooster)/);
  assert.ok(pig.length >= 8 && hens.length >= 4);
  const place = (x, z) => x > PLACE[0] && x < PLACE[2] && Math.abs(z) < 70, terrace = (x, z) => x > -14 && x < 0 && Math.abs(z) < 50;
  for (const p of pig) for (const r of trace(p, 1, 200)) assert.ok(place(r.X, r.Z) || terrace(r.X, r.Z), `pigeon at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
  const Y = YARDS[0];
  for (const h of hens) for (const r of trace(h, 1, 200)) assert.ok(r.X > Y[0] && r.X < Y[2] && r.Z > 62 && r.Z < Y[3], `hen at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
});

test('on the ground: the land animals stand near the ground level', () => {
  for (const i of inst.filter((q) => /^(hen|rooster|cat|dog|pigeon)/.test(q.model))) { const tr = trace(i, 5, 100), y0 = Math.min(...tr.map((r) => r.Y)); for (const r of tr) assert.ok(r.Y - y0 < 0.9 && r.Y > 3 && r.Y < 7, `${i.model} at height ${r.Y.toFixed(2)}`); }
});
