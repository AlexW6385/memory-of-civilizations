// The Hakka tulou's critters (src/settlements/hakka-tulou/fauna.js, src/engine/fauna-critters.js): the models are known, nothing on the ground stands inside a
// house or the great wall, nests sit on the fronts of the walk's houses, the pets answer the visitor, the ducks stay on the stream.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/hakka-tulou/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { HOUSES, T, streamZ, STREAM } from '../src/settlements/hakka-tulou/layout.js';

const inst = expandCritters(data.critters, { id: 'hakka-tulou' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);
const rectOf = (h) => { const q = Math.abs(Math.sin(h.yaw)) > 0.5, a = (q ? h.d : h.w) / 2, b = (q ? h.w : h.d) / 2; return [h.c[0] - a, h.c[1] - b, h.c[0] + a, h.c[1] + b]; };
const inHouse = (x, z, m = 0.05) => HOUSES.some((h) => { const r = rectOf(h); return x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m; });

test('every model is known, the count is small, nothing on the ground stands in a house or the wall', () => {
  assert.ok(inst.length >= 20 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (i.model !== 'swallow_nest' && !i.model.startsWith('duck')) { const [x, , z] = i.groups[1]; assert.ok(!inHouse(x, z), `${i.model} in a house at ${x}, ${z}`); assert.ok(Math.hypot(x, z) > T.R - 0.5, `${i.model} in the great wall`); }
});

test('swallows: nests on the front walls of houses, under the eave', () => {
  const nests = of('swallow_nest');
  assert.ok(nests.length >= 3, `${nests.length} nests`);
  for (const n of nests) { const [x, y, z] = n.groups[1]; assert.ok(y > 3 && y < 4.6, `y ${y}`); assert.ok(inHouse(x, z, 0.4), `nest at ${x}, ${z} on a house`); }
});

test('ducks stay on the stream; pets and fowl answer the visitor', () => {
  const ducks = inst.filter((i) => i.model.startsWith('duck'));
  assert.ok(ducks.length >= 10);
  for (const d of ducks) for (let t = 0; t < 60; t += 3) { const r = run(d, t, far(d)); assert.ok(Math.abs(r.Z - streamZ(r.X)) < STREAM.w / 2 + 0.5, `duck off the stream at ${r.X}, ${r.Z}`); }
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog')];
  assert.ok(pets.length >= 5);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
});
