// Mamluk Cairo's critters (src/engine/fauna-critters.js; docs/settlements/mamluk-cairo.md §18.4): stepped in Node; none leaves its place into a house or a walk route.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/mamluk-cairo/fauna.js';
import { lots, inRect, yards } from '../src/settlements/mamluk-cairo/layout.js';
import { hasan } from '../src/settlements/mamluk-cairo/plan.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'mamluk-cairo' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const L = lots().filter((l) => !l.yard);

test('Cairo critters: cats, dogs, pigeons and fowl, all known models', () => {
  assert.ok(inst.length >= 30 && inst.length <= 80, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(inst.filter((i) => i.model === 'dog').length >= 4 && inst.some((i) => i.model === 'rooster') && inst.filter((i) => i.model.startsWith('pigeon')).length >= 10 && inst.filter((i) => i.model.startsWith('cat')).length >= 3);
});

test('Cairo critters: never in a house, clear of the walk routes, at an animal\'s pace', () => {
  const route = (hasan.walks || []).flatMap((w) => w.map((p) => p.slice(0, 2)));
  for (const i of inst) {
    let prev = null;
    for (let t = 0; t < 300; t += 0.5) {
      const r = run(i, t);
      assert.ok(!L.some((l) => inRect(l.rect, r.X, r.Z)) || yards().some((y) => inRect(y, r.X, r.Z)), `${i.model} inside a house at ${r.X}, ${r.Z}`);
      assert.ok(!route.some((p) => Math.hypot(p[0] - r.X, p[1] - r.Z) < 1.2), `${i.model} on the route at ${r.X}, ${r.Z}`);
      if (prev) assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
});
