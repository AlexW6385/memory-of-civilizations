// Cahokia's critters (src/settlements/cahokia/fauna.js, src/engine/fauna-critters.js; docs/settlements/cahokia.md §10.4): the models are known, only what the
// American Bottom had about 1175, nothing on the ground stands in a house or a doorway, the wild turkeys keep to their patch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/cahokia/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect } from '../src/settlements/cahokia/layout.js';
import { openSet } from '../src/settlements/cahokia/town.js';

const inst = expandCritters(data.critters, { id: 'cahokia' });
const of = (model) => inst.filter((i) => i.model === model);

test('the instances: every model is known, a small count, none that the Mississippians did not have', () => {
  assert.ok(inst.length >= 18 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const m of ['cat', 'hen_brown', 'hen_white', 'rooster', 'goat', 'cattle', 'horse', 'pigeon']) assert.equal(of(m).length, 0, m);
  assert.ok(of('dog').length >= 8 && of('turkey').length >= 6 && of('goose_grey').length >= 3 && of('crane').length === 1);
});

test('nothing on the ground stands in a house or in the 1.6 m doorway of an opened one', () => {
  const L = lots(), open = [...openSet().keys()];
  for (const i of inst) {
    const [x, , z] = i.groups[1];
    if (i.model === 'duck_brown' || i.model === 'swallow_nest') continue;
    assert.ok(!L.some((l) => inRect(l.rect, x, z, 0.2)), `${i.model} in a house at ${x}, ${z}`);
    for (const k of open) { const [x0, , x1, z1] = L[k].rect, cx = (x0 + x1) / 2; assert.ok(!(Math.abs(x - cx) < 1.2 && z > z1 - 0.5 && z < z1 + 3), `${i.model} in a doorway`); }
  }
});

test('turkeys feed in a small patch and do not walk into a house; dogs stay put until the visitor comes', () => {
  const L = lots();
  for (const t of of('turkey')) {
    const [x, , z] = t.groups[1];
    for (let s = 0; s < 200; s += 0.5) { const r = POSES[t.groups[0][0]](context(s, [x + 80, 1.6, z], t.groups)); assert.ok(Math.hypot(r.X.v - x, r.Z.v - z) < 4, 'wandered'); assert.ok(!L.some((l) => inRect(l.rect, r.X.v, r.Z.v, 0)), 'in a house'); }
  }
});
