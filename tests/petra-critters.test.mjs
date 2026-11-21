// Petra's critters (src/engine/fauna-critters.js; docs/settlements/petra.md §26): stepped in Node; none leaves its place into a house or onto a walk route.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/petra/fauna.js';
import { lots, outerLots, inRect } from '../src/settlements/petra/layout.js';
import { allRoutes } from '../src/settlements/petra/walkroutes.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'petra' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const rects = [...lots().map((l) => l.rect), ...outerLots().map((l) => l.rect)];
const pts = [];
for (const { route } of allRoutes()) for (let k = 0; k + 1 < route.length; k++) for (let u = 0; u <= 1; u += 0.1) pts.push([route[k][0] + (route[k + 1][0] - route[k][0]) * u, route[k][1] + (route[k + 1][1] - route[k][1]) * u]);

test('Petra critters: dogs, goats, fowl, cats, doves and nests, all known models', () => {
  assert.ok(inst.length >= 20 && inst.length <= 40, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const m of ['dog', 'goat_black', 'rooster', 'cat_orange', 'pigeon_grey', 'swallow_nest']) assert.ok(inst.some((i) => i.model === m), m);
});

test('Petra critters: never in a house, clear of the walk routes, at an animal\'s pace', () => {
  for (const i of inst) {
    let prev = null;
    for (let t = 0; t < 400; t += 0.5) {
      const r = run(i, t);
      if (i.model !== 'swallow_nest') {
        assert.ok(!rects.some((h) => inRect(h, r.X, r.Z)), `${i.model} inside a house at ${r.X}, ${r.Z}`);
        assert.ok(!pts.some((p) => Math.hypot(p[0] - r.X, p[1] - r.Z) < 0.9), `${i.model} on the route at ${r.X}, ${r.Z}`);
      }
      if (prev && i.model !== 'swallow_nest') assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
});
