// Florence's critters (src/settlements/florence/fauna.js, docs/settlements/florence.md §19): the same engine as Suzhou's
// (src/engine/fauna-critters.js, critter-poses.js) stepped through in Node: every model is known, the mallards stay on the
// river, the hens and the cats stay where they were put, and every animal stands on the walk's streets, not inside a house.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/florence/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, ARNO, arnoZ } from '../src/settlements/florence/layout.js';

const inst = expandCritters(data.critters, { id: 'florence' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);

test('the instances: every model is known and the count is small', () => {
  assert.ok(inst.length >= 12 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
});

test('mallards: on the river, clear of the banks, slow', () => {
  const ducks = [...of('duck_brown'), ...of('duck_white')];
  assert.ok(ducks.length >= 4);
  for (const d of ducks) {
    for (let t = 0; t < 600; t += 0.5) {
      const r = run(d, t, far(d));
      assert.ok(Math.abs(r.Z - arnoZ(r.X)) < ARNO.w / 2 - 3 - 1.5, `a duck at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is off the water`);
    }
  }
});

test('hens and cock: within a few metres of where they were set down', () => {
  for (const m of ['hen_brown', 'hen_white', 'rooster']) for (const i of of(m)) {
    const x0 = run(i, 0, far(i)), x1 = run(i, 300, far(i));
    assert.ok(Math.hypot(x1.X - x0.X, x1.Z - x0.Z) < 6, m);
  }
});

test('cats, dogs and cages stand in the street, none inside a lot', () => {
  const L = lots();
  for (const m of ['cat_tabby', 'cat_orange', 'dog', 'cagebird']) for (const i of of(m)) {
    const r = run(i, 0, far(i));
    const inLot = L.find((l) => r.X > l.rect[0] + 0.1 && r.X < l.rect[2] - 0.1 && r.Z > l.rect[1] + 0.1 && r.Z < l.rect[3] - 0.1);
    assert.ok(!inLot, `${m} at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is inside a lot`);
  }
});
