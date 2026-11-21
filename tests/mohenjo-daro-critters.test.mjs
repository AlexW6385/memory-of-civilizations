// Mohenjo-daro's critters (src/settlements/mohenjo-daro/fauna.js, src/engine/fauna-critters.js; docs/settlements/mohenjo-daro.md §16.4): the models are known, the count is
// small, nothing on the ground stands in a house, the dogs and goats answer the visitor, the doves keep to their patch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/mohenjo-daro/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect } from '../src/settlements/mohenjo-daro/layout.js';

const inst = expandCritters(data.critters, { id: 'mohenjo-daro' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing stands in a house', () => {
  assert.ok(inst.length >= 14 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst.filter((q) => !/^duck/.test(q.model))) assert.ok(!lots().some((l) => inRect(l.rect, i.groups[1][0], i.groups[1][2], 0.2)), `${i.model} in a house at ${i.groups[1]}`);
});

test('dogs, cats and goats answer the visitor; doves and fowl keep to their patch', () => {
  const pets = [...of('dog'), ...of('cat_tabby'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 6, `${pets.length} pets`);
  for (const p of pets) { const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]); assert.ok(JSON.stringify(f) !== JSON.stringify(c), p.model + ' ignores the visitor'); }
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white'), ...of('hen_brown'), ...of('rooster')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.4, d.model + ' wandered'); } }
});
