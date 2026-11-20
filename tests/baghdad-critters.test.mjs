// Baghdad's critters (src/engine/fauna-critters.js; docs/settlements/abbasid-baghdad.md §17): stepped in Node; none leaves its place into a house or onto the gate road's walk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/abbasid-baghdad/fauna.js';
import { inLot, C } from '../src/settlements/abbasid-baghdad/layout.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'abbasid-baghdad' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));

test('Baghdad critters: cats, dogs, pigeons, ducks, kingfishers and goats, all known models', () => {
  assert.ok(inst.length >= 40 && inst.length <= 120, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  const n = (f) => inst.filter((i) => f(i.model)).length;
  assert.ok(n((m) => m.startsWith('cat')) >= 4 && n((m) => m === 'dog') >= 4 && n((m) => m.startsWith('pigeon')) >= 20 && n((m) => m.startsWith('duck')) >= 10 && n((m) => m === 'kingfisher') === 3 && n((m) => m.startsWith('goat')) >= 5);
});

test('Baghdad critters: never in a house, clear of the gate road\'s walk, at an animal\'s pace', () => {
  for (const i of inst) {
    if (i.model.startsWith('duck')) continue;
    let prev = null;
    for (let t = 0; t < 300; t += 0.5) {
      const r = run(i, t);
      assert.ok(!inLot(r.X, r.Z, 0.3), `${i.model} inside a house at ${r.X}, ${r.Z}`);
      assert.ok(!(Math.abs(r.X - C[0]) < 1.5 && r.Z > C[1] + 36 && r.Z < C[1] + 150), `${i.model} on the walk at ${r.X}, ${r.Z}`);
      if (prev && i.model !== 'kingfisher') assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
});
