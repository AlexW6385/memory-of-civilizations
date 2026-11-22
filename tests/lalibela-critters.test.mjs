// Lalibela's critters (src/engine/fauna-critters.js; docs/settlements/lalibela.md §21): stepped in Node; none leaves its place into a house's wall or onto a walk route.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/lalibela/fauna.js';
import { houses } from '../src/settlements/lalibela/layout.js';
import { churches } from '../src/settlements/lalibela/plan.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'lalibela' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const H = houses();

test('Lalibela critters: dogs, cats, fowl, goats and doves, all known models', () => {
  assert.ok(inst.length >= 12 && inst.length <= 80, inst.length + ' critters');   // ceiling 40 -> 80: the settlement's herds and yard groups are critters too (src/settlements/herds-data.js, at most 56 per settlement)
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const m of ['dog', 'cat_tabby', 'rooster', 'pigeon_grey']) assert.ok(inst.some((i) => i.model === m), m);
});

test('Lalibela critters: never in a wall, clear of the walk routes, at an animal\'s pace', () => {
  const route = (churches.walks || []).flat();
  for (const i of inst) {
    let prev = null;
    for (let t = 0; t < 400; t += 0.5) {
      const r = run(i, t);
      assert.ok(!H.some((h) => Math.hypot(h.c[0] - r.X, h.c[1] - r.Z) < h.r + 0.1), `${i.model} inside a house at ${r.X}, ${r.Z}`);
      assert.ok(!route.some((p) => Math.hypot(p[0] - r.X, p[1] - r.Z) < 1.0), `${i.model} on a route at ${r.X}, ${r.Z}`);
      if (prev) assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
});
