// Wutai's critters (src/settlements/tang-wutai/fauna.js, src/engine/fauna-critters.js): the models are known, nothing on the ground stands in a building or a yard
// wall's gate, the doves keep to their patch, the pets answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/tang-wutai/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { village } from '../src/settlements/tang-wutai/village.js';
import { inRect } from '../src/settlements/tang-wutai/layout.js';

const inst = expandCritters(data.critters, { id: 'tang-wutai' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const houses = village().chinese.filter((e) => e.t === 'wutai_house' || e.t === 'wutai_dwelling');

test('every model is known, the count is small, nothing on the ground stands in a house', () => {
  assert.ok(inst.length >= 14 && inst.length <= 30, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) assert.ok(!houses.some((h) => inRect(h.rect, i.groups[1][0], i.groups[1][2], 0.1)), `${i.model} in a house at ${i.groups[1]}`);
});

test('doves keep to their patch; cats, dogs, goats and fowl answer the visitor', () => {
  for (const d of [...of('pigeon_grey'), ...of('pigeon_white')]) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, 'dove wandered'); } }
  const pets = [...of('cat_orange'), ...of('dog'), ...of('goat_black'), ...of('goat_white'), ...of('rooster')];
  assert.ok(pets.length >= 6);
  for (const p of pets) {
    let differs = false;     // (an animal asleep or busy at one moment still answers at another)
    for (const t of [10, 20, 30, 40, 50, 60]) {
      const f = run(p, t, far(p)), c = run(p, t, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
      for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
      if (JSON.stringify(f) !== JSON.stringify(c)) differs = true;
    }
    assert.ok(differs, `${p.model} answers the visitor`);
  }
});
