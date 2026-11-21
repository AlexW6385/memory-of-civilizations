// The pā's critters (src/settlements/maori/fauna.js, src/engine/fauna-critters.js, docs/settlements/maori.md §4k): only animals Aotearoa had before the Europeans
// (the kurī on the dog's rig, the grey duck); the ducks stay on the lake's water, the dogs lie off the doors' lanes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/maori/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { shoreZ, village } from '../src/settlements/maori/layout.js';

const inst = expandCritters(data.critters, { id: 'maori' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const of = (model) => inst.filter((i) => i.model === model);

test('the instances: only the kurī and the grey duck, every model known', () => {
  assert.ok(inst.length >= 10 && inst.length <= 30, `${inst.length} critters`);
  for (const i of inst) { assert.ok(POSES[i.groups[0][0]], i.model); assert.ok(['dog', 'duck_brown'].includes(i.model), i.model); }
  assert.ok(of('dog').length >= 8 && of('duck_brown').length >= 4);
});

test('the grey ducks stay on the lake, off the beach', () => {
  for (const d of of('duck_brown')) for (let t = 0; t < 400; t += 4) {
    const r = run(d, t, [d.groups[1][0] + 80, 1.6, d.groups[1][2]]);
    assert.ok(r.Z < shoreZ(r.X) - 2, `duck at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)}`);
  }
});

test('the dogs are placed, off every house', () => {
  const V = village();
  for (const c of data.critters.filter((q) => q.model === 'dog')) {
    for (const h of V.houses) {
      const ca = Math.cos(h.yaw), sa = Math.sin(h.yaw), dx = c.at[0] - h.c[0], dz = c.at[2] - h.c[1], u = dx * ca - dz * sa, v = dx * sa + dz * ca;
      const zf = -h.l / 2 + 1.6;
      // inside the walls (behind the front wall) is no place for a dog; the porch is
      assert.ok(!(Math.abs(u) < h.w / 2 && v > zf && v < h.l / 2), `dog at ${c.at[0].toFixed(1)}, ${c.at[2].toFixed(1)} is inside a house`);
    }
  }
});
