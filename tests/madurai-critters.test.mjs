// Madurai's critters (src/engine/fauna-critters.js; docs/settlements/madurai.md §19): stepped in Node; none leaves its place into a house or the tank, at an animal's pace.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/madurai/fauna.js';
import { lots, TANK, inRect } from '../src/settlements/madurai/layout.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'madurai' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const H = lots().filter((l) => l.kind !== 'yard');

test('Madurai critters: pigeons, dogs, goats, fowl and cats, all known models', () => {
  assert.ok(inst.length >= 12 && inst.length <= 30, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(inst.filter((i) => i.model.startsWith('pigeon')).length >= 4 && inst.filter((i) => i.model === 'dog').length >= 3 && inst.some((i) => i.model === 'rooster') && inst.some((i) => i.model.startsWith('cat')) && inst.some((i) => i.model.startsWith('goat')));
});

test('Madurai critters: never in a house or the tank, at an animal\'s pace', () => {
  for (const i of inst) {
    let prev = null;
    for (let t = 0; t < 400; t += 0.5) {
      const r = run(i, t);
      if (!i.model.startsWith('cat')) assert.ok(!H.some((h) => inRect(h.rect, r.X, r.Z)), `${i.model} inside a house at ${r.X}, ${r.Z}`);
      assert.ok(!inRect(TANK, r.X, r.Z), `${i.model} in the tank`);
      if (prev) assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
});
