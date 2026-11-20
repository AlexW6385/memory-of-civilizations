// Baroque Rome's critters (src/settlements/baroque-rome/fauna.js, docs/settlements/baroque-rome.md §6d): the engine's rigs stepped through in Node: every model
// is known, the mallards stay on the Tiber, the hens and pigeons stay where they were put, and the cats and dogs stand in the street, not inside a house.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/baroque-rome/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { ROW_DEFS, lots, TIBER, tiberX, inRect } from '../src/settlements/baroque-rome/layout.js';

const inst = expandCritters(data.critters, { id: 'baroque-rome' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...m) => inst.filter((i) => m.includes(i.model));

test('the instances: every model is known, the count is small, the kinds are there', () => {
  assert.ok(inst.length >= 24 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('pigeon_grey').length >= 8 && of('dog').length >= 2 && of('cat_tabby', 'cat_orange').length >= 2 && of('rooster').length === 1);
});

test('mallards: on the Tiber, clear of the banks', () => {
  const ducks = of('duck_brown', 'duck_white');
  assert.ok(ducks.length >= 4);
  for (const d of ducks) for (let t = 0; t < 600; t += 0.5) {
    const r = run(d, t, far(d));
    assert.ok(Math.abs(r.X - tiberX(r.Z)) < TIBER.w / 2 - 4, `a duck at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is off the water`);
  }
});

test('pigeons, hens and the cock: within a few metres of where they were set down', () => {
  for (const i of of('pigeon_grey', 'pigeon_white', 'pigeon_dark', 'hen_brown', 'hen_white', 'rooster')) {
    const x0 = run(i, 0, far(i)), x1 = run(i, 300, far(i));
    assert.ok(Math.hypot(x1.X - x0.X, x1.Z - x0.Z) < 6, i.model);
  }
});

test('cats and dogs stand in the street, none inside a row or a lot', () => {
  const L = lots();
  for (const i of of('cat_tabby', 'cat_orange', 'dog')) {
    const r = run(i, 0, far(i));
    assert.ok(!ROW_DEFS.some((d) => inRect(d.rect, r.X, r.Z, -0.1)), `${i.model} at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is inside a row`);
    assert.ok(!L.some((l) => r.X > l.rect[0] + 0.1 && r.X < l.rect[2] - 0.1 && r.Z > l.rect[1] + 0.1 && r.Z < l.rect[3] - 0.1), `${i.model} at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is inside a lot`);
  }
});
