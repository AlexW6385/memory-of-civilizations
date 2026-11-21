// Brasília's critters (src/settlements/brasilia/fauna.js): the models exist, the ducks' loops lie on water, the fowl stay in the camp's yard,
// the cats and dogs stand clear of the shops' door lanes and the walked doors (docs/settlements/brasilia.md §15).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/brasilia/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { MODELS } from '../src/engine/critter-models.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { CAMP, POOLS, ITAMARATY, CATH, doorLane } from '../src/settlements/brasilia/layout.js';

const inst = expandCritters(data.critters, { id: 'brasilia' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (re) => inst.filter((i) => re.test(i.model));

test('every model is known and the count is modest', () => {
  assert.ok(inst.length >= 18 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) { assert.ok(MODELS[i.model], i.model); assert.ok(POSES[i.groups[0][0]], i.model); }
});

test('the ducks swim on water: a loop in each of the pools', () => {
  const ducks = of(/^duck/);
  assert.ok(ducks.length >= 8, `${ducks.length} ducks`);
  const [cx, cz] = CATH.c;
  const onWater = (x, z) => POOLS.some((p) => x > p[0] && x < p[2] && z > p[1] && z < p[3]) || (x > ITAMARATY[0] + 7 && x < ITAMARATY[2] - 7 && z > ITAMARATY[1] + 7 && z < ITAMARATY[3] - 7) || (Math.hypot(x - cx, z - cz) > CATH.R && Math.hypot(x - cx, z - cz) < CATH.pool);
  for (const d of ducks) { const [x, z] = d.groups[2]; assert.ok(onWater(x, z), `a loop centred at ${x.toFixed(1)},${z.toFixed(1)} is not on water`); }
});

test('the fowl keep in the camp yard', () => {
  const fowl = of(/^(hen|rooster)/);
  assert.ok(fowl.length >= 3);
  for (const f of fowl) for (let t = 0; t < 240; t += 1) { const r = run(f, t, far(f)); assert.ok(r.X > CAMP[0] && r.X < CAMP[2] && r.Z > CAMP[1] && r.Z < CAMP[3], `fowl at ${r.X.toFixed(1)},${r.Z.toFixed(1)}`); }
});

test('cats and dogs stand clear of every door lane', () => {
  const pets = of(/^(cat|dog)/);
  assert.ok(of(/^cat/).length >= 6 && of(/^dog/).length >= 3);
  for (const c of pets) { const [x, , z] = c.groups[1]; assert.equal(doorLane(x, z), null, `${c.model} at ${x.toFixed(1)},${z.toFixed(1)} is in a door lane`); }
});
