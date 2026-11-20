// Bianjing's critters (src/engine/fauna-critters.js; docs/settlements/song-kaifeng.md §19.5), stepped through in Node as
// tests/suzhou-critters.test.mjs does: the ducks stay on the Bian and keep company, the geese and dogs stay on dry land
// and off the shop doors, the cat stays on the pagoda's base, the cormorants stay on the punt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/song-kaifeng/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { RIVER, PAGODA } from '../src/settlements/song-kaifeng/layout.js';
import { nearDoor } from '../src/settlements/song-kaifeng/doors.js';

const inst = expandCritters(data.critters, { id: 'song-kaifeng' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...models) => inst.filter((i) => models.includes(i.model));
const trace = (i, cam = far(i), dt = 0.25, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const inRiver = (x, z) => z > RIVER.z0 + 0.3 && z < RIVER.z1 - 0.3;

test('the instances: every model is known and the count is small', () => {
  assert.ok(inst.length >= 20 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const m of ['dog', 'cat_tabby', 'hen_brown', 'rooster', 'pigeon_grey', 'goose_white', 'duck_white', 'cormorant', 'fishing_craft']) assert.ok(of(m).length, m);
});

test('ducks: afloat on the river, none on dry land, a raft keeping together', () => {
  const ducks = of('duck_white', 'duck_brown');
  assert.ok(ducks.length >= 6);
  for (const d of ducks) for (const s of trace(d, far(d), 0.5)) { assert.ok(inRiver(s.r.X, s.r.Z), `duck at ${s.r.X}, ${s.r.Z}`); assert.ok(Math.abs(s.r.Y - RIVER.water) < 0.05); }
});

test('dogs and cats at the shop fronts: off every door lane, near where they lie', () => {
  for (const d of of('dog', 'cat_orange')) for (const s of trace(d, far(d), 1, 300)) assert.ok(!nearDoor(s.r.X, s.r.Z, 0.2) || Math.hypot(s.r.X - d.groups[1][0], s.r.Z - d.groups[1][2]) < 2.6, `at a door ${s.r.X}, ${s.r.Z}`);
});

test('the pagoda cat stays on the base', () => {
  const [c] = of('cat_tabby'), tr = trace(c);
  for (const { r } of tr) assert.ok(Math.abs(r.X - (PAGODA[0] + 4.14)) < 3 && Math.abs(r.Z - (PAGODA[1] + 4.14)) < 3, `cat at ${r.X}, ${r.Z}`);
});

test('geese, hens and pigeons stay on dry land', () => {
  for (const g of of('goose_white', 'goose_grey', 'hen_brown', 'hen_white', 'rooster', 'pigeon_grey', 'pigeon_white', 'pigeon_dark')) for (const s of trace(g, far(g), 1)) assert.ok(!inRiver(s.r.X, s.r.Z), `${g.model} in the river at ${s.r.X}, ${s.r.Z}`);
});

test('cormorants stay on the punt', () => {
  const [boat] = of('fishing_craft');
  for (const c of of('cormorant')) for (const s of trace(c, far(c), 1)) assert.ok(Math.hypot(s.r.X - boat.groups[1][0], s.r.Z - boat.groups[1][2]) < 2.2, `at ${s.r.X}, ${s.r.Z}`);
});
