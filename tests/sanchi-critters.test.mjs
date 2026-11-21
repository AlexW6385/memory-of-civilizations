// Sanchi's critters (src/settlements/sanchi/fauna.js, src/engine/fauna-critters.js; docs/settlements/sanchi.md §23): the models are known, no animal on the ground stands
// in a house, the pets answer the visitor, the pigeons keep to their patch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/sanchi/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect } from '../src/settlements/sanchi/layout.js';

const inst = expandCritters(data.critters, { id: 'sanchi' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, i.groups[1][1] + 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 14 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) { const [x, , z] = i.groups[1]; assert.ok(!lots().some((l) => inRect(l.rect, x, z, 0.1)), `${i.model} in a house at ${x}, ${z}`); }
});

test('pigeons keep to their patch; cats, dogs, goats and hens answer the visitor', () => {
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'pigeon wanders'); } }
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 6);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, p.groups[1][1] + 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
  assert.ok(of('hen_brown').length >= 2 && of('rooster').length >= 1);
});
