// Amsterdam's critters (src/settlements/amsterdam/fauna.js, docs/settlements/amsterdam.md §10.4): the models exist, the pigeons stay on the Dam's paving, the
// ducks stay afloat clear of the quay walls, no animal stands inside a house, the cats sit before the open shops and the dogs at the VOC's doors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/amsterdam/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { MODELS } from '../src/engine/critter-models.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { DAM, GROUND, WATER, wet, inLot } from '../src/settlements/amsterdam/layout.js';

const inst = expandCritters(data.critters, { id: 'amsterdam' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (re) => inst.filter((i) => re.test(i.model));
const trace = (i, dt = 0.5, T = 300) => { const o = []; for (let t = 0; t < T; t += dt) o.push(run(i, t, far(i))); return o; };

test('every model is known and the count is modest', () => {
  assert.ok(inst.length >= 14 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) { assert.ok(MODELS[i.model], i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
});

test('pigeons keep to the Dam\'s paving, clear of the houses', () => {
  const pig = of(/^pigeon/);
  assert.ok(pig.length >= 6);
  for (const p of pig) for (const r of trace(p, 1, 200)) assert.ok(r.X > DAM[0] && r.X < DAM[2] && r.Z > DAM[1] && r.Z < DAM[3] - 3 && !inLot(r.X, r.Z, 0), `pigeon at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
});

test('the ducks stay on the water, away from the quay walls', () => {
  const ducks = of(/^duck/);
  assert.ok(ducks.length >= 6);
  for (const d of ducks) for (const r of trace(d, 1, 200)) { assert.ok(wet(r.X, r.Z) < -1, `a duck on dry ground at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`); assert.ok(Math.abs(r.Y - WATER) < 0.1); }
});

test('nothing stands inside a building; cats and dogs are there; the land animals stand at the level they were placed at', () => {
  for (const i of inst.filter((q) => /^(cat|dog|pigeon)/.test(q.model))) for (const r of trace(i, 5, 100)) {
    assert.ok(!inLot(r.X, r.Z, 0), `${i.model} inside a lot at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`);
    assert.ok(Math.abs(r.Y - i.groups[1][1]) < 0.4 && r.Y < GROUND + 0.6, `${i.model} at height ${r.Y.toFixed(2)}`);
  }
  assert.ok(of(/^cat/).length >= 2 && of(/^dog/).length >= 2);
});
