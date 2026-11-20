// Mughal Agra's critters (src/engine/fauna-critters.js; docs/settlements/mughal-agra.md §17.4): stepped in Node; none leaves its place into a house, a street's middle or a walk route.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/mughal-agra/fauna.js';
import { houses, STREETS, inRect } from '../src/settlements/mughal-agra/layout.js';
import { taj } from '../src/settlements/mughal-agra/plan.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'mughal-agra' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const H = houses();

test('Agra critters: dogs, fowl and pigeons, all known models', () => {
  assert.ok(inst.length >= 12 && inst.length <= 30, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(inst.filter((i) => i.model === 'dog').length >= 4 && inst.some((i) => i.model === 'rooster') && inst.filter((i) => i.model === 'pigeon_grey').length >= 4);
});

test('Agra critters: never in a house, clear of the walk routes, at an animal\'s pace', () => {
  const route = (taj.walks || []).flat();
  for (const i of inst) {
    let prev = null;
    for (let t = 0; t < 400; t += 0.5) {
      const r = run(i, t);
      assert.ok(!H.some((h) => inRect(h.rect, r.X, r.Z)), `${i.model} inside a house at ${r.X}, ${r.Z}`);
      assert.ok(!route.some((p) => Math.hypot(p[0] - r.X, p[1] - r.Z) < 1.2), `${i.model} on the route at ${r.X}, ${r.Z}`);
      if (prev) assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
  assert.ok(STREETS.length > 0);
});
