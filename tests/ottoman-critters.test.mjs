// Istanbul's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/ottoman-istanbul.md §21): stepped through in Node and checked
// as a visitor would see them: the hens and the rooster keep to their yard and clear of its coop, well and other furnishings, the cats wake as the
// visitor nears, the dogs stand and turn, none stands on a grave or inside a house.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/styles/vernacular/houses-med.js';
import '../src/styles/ottoman/index.js';
import data from '../src/settlements/ottoman-istanbul/fauna.js';
import { yardItems, lots, nearGrave } from '../src/settlements/ottoman-istanbul/layout.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'ottoman-istanbul' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...models) => inst.filter((i) => models.includes(i.model));
const trace = (i, dt = 0.25, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, far(i)) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));

test('the instances: every model is known; a few cats, dogs and hens', () => {
  assert.ok(inst.length >= 12 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('cat_tabby', 'cat_orange').length >= 4 && of('dog').length >= 1 && of('hen_brown', 'hen_white', 'rooster').length >= 4);
});

test('hens and the rooster: stay in their own yard, clear of its furnishings and of every house, at a fowl\'s pace', () => {
  const yards = yardItems(), houses = lots();
  for (const h of of('hen_brown', 'hen_white', 'rooster')) {
    const [sx, , sz] = h.groups[1], yard = yards.find((y) => sx > y.rect[0] && sx < y.rect[2] && sz > y.rect[1] && sz < y.rect[3]);
    assert.ok(yard, `a yard round ${sx}, ${sz}`);
    const tr = trace(h);
    for (const { r } of tr) {
      assert.ok(r.X > yard.rect[0] && r.X < yard.rect[2] && r.Z > yard.rect[1] && r.Z < yard.rect[3], `${h.model} left its yard at ${r.X}, ${r.Z}`);
      for (const it of yard.items) assert.ok(Math.hypot(r.X - it.at[0], r.Z - it.at[1]) > (it.k === 'coop' ? 1.0 : 0.9), `${h.model} in a ${it.k} at ${r.X}, ${r.Z}`);
      assert.ok(!houses.some((l) => r.X > l.rect[0] && r.X < l.rect[2] && r.Z > l.rect[1] && r.Z < l.rect[3]), `${h.model} inside a house at ${r.X}, ${r.Z}`);
    }
    assert.ok(Math.max(...speeds(tr)) < 0.9, `${h.model} speed`);
  }
});

test('cats: asleep with the head down far off; lift the head and open the eyes as the visitor nears, and stay put', () => {
  for (const c of of('cat_tabby', 'cat_orange')) {
    const [x, y, z] = c.groups[1];
    const farR = run(c, 3, [x + 20, y, z]), midR = run(c, 3, [x + 4.5, y, z]), nearR = run(c, 3, [x + 1.5, y, z]);
    assert.ok(farR.eye < 0.2 && nearR.eye > 0.9, 'eyes shut then open');
    assert.ok(farR.n1p > midR.n1p && midR.n1p > nearR.n1p, 'it wakes by degrees');
    assert.equal(run(c, 3, [x + 20, y, z]).X, x);
  }
});

test('dogs: lie far off, stand and face the visitor within a few metres', () => {
  for (const d of of('dog')) {
    const [x, y, z] = d.groups[1];
    const lying = run(d, 5, [x, y, z + 25]), up = run(d, 5, [x, y + 1.5, z + 2.5]);
    assert.ok(lying.lc > 0.7 && up.lc < 0.1 && up.Y > lying.Y + 0.15);
  }
});

test('animals of the ground stand on open ground: none in a house or on a grave', () => {
  const houses = lots();
  for (const i of of('cat_tabby', 'cat_orange', 'dog')) {
    const [x, , z] = i.groups[1];
    assert.ok(!houses.some((l) => x > l.rect[0] - 0.3 && x < l.rect[2] + 0.3 && z > l.rect[1] - 0.3 && z < l.rect[3] + 0.3), `${i.model} in a house at ${x}, ${z}`);
    assert.ok(!nearGrave(x, z, 0.5), `${i.model} on a grave at ${x}, ${z}`);
  }
});
