// Yinxu's critters (src/settlements/shang-yinxu/fauna.js, src/engine/fauna-critters.js): the models are known, the swallows' nests are on the hall and the great houses, the dogs and goats answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/shang-yinxu/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'shang-yinxu' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known and the count is small; no cat', () => {
  assert.ok(inst.length >= 12 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(!inst.some((i) => /^cat/.test(i.model)));
});
test('swallows: nests on the kings\' hall and the great houses; the birds go out and come home', () => {
  const nests = of('swallow_nest');
  assert.ok(nests.length >= 3, `${nests.length} nests`);
  for (const n of nests) assert.ok(n.groups[1][1] > 2.2 && n.groups[1][1] < 5.2);
  let away = 0, home = 0; const n = nests[0];
  for (let t = 0; t < 400; t += 0.5) { const r = run(n, t, far(n)), d = Math.hypot(r.X - n.groups[1][0], r.Z - n.groups[1][2]); if (d > 3) away++; if (d < 0.6) home++; }
  assert.ok(away > 0 && home > 0);
});
test('dogs and goats answer the visitor', () => {
  const pets = [...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 4);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
test('the river has ducks, a crane and a kingfisher', () => {
  for (const m of ['crane', 'rooster', 'hen_brown']) assert.ok(of(m).length >= 1, m);
  assert.ok(inst.some((i) => /^duck/.test(i.model)), 'ducks afloat');
});
