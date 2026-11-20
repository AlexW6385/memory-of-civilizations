// Samarkand's animals (src/settlements/timurid-samarkand/fauna.js, docs/settlements/timurid-samarkand.md §20.4): the engine's critters stepped through in Node:
// every model is known, the ground doves and hens stay near where they were set down, the hens stay in their own court, the cats sit on the shops' sills.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/timurid-samarkand/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { houseAt, houseGeom } from '../src/settlements/timurid-samarkand/layout.js';

const inst = expandCritters(data.critters, { id: 'timurid-samarkand' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);

test('the instances: every model is known and the count is small', () => {
  assert.ok(inst.length >= 30 && inst.length <= 70, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
});
test('doves wheel over the madrasa and rest on its parapets; sparrows stay', () => {
  assert.ok(data.flights.filter((f) => f.kind === 'pigeon').length >= 2 && data.flights.some((f) => f.kind === 'swallow') && data.flights.some((f) => f.kind === 'crow'));
  assert.ok(data.perches.some((p) => p.kind === 'pigeon') && data.perches.some((p) => p.kind === 'sparrow'));
  for (const f of data.flights) assert.ok(f.n > 0 && f.y[0] < f.y[1] && f.speed > 0);
});
test('ground doves, hens and cocks stay within a few metres of where they were set down', () => {
  const m = ['pigeon_grey', 'pigeon_white', 'pigeon_dark'];
  assert.ok(m.flatMap(of).length >= 16);
  for (const k of [...m, 'hen_brown', 'hen_white', 'rooster']) for (const i of of(k)) { const a = run(i, 0, far(i)), b = run(i, 300, far(i)); assert.ok(Math.hypot(b.X - a.X, b.Z - a.Z) < 6, k); }
});
test('the hens stay in the court of their own house', () => {
  const hens = [...of('hen_brown'), ...of('hen_white'), ...of('rooster')];
  assert.ok(hens.length >= 12);
  for (const h of hens) for (let t = 0; t < 300; t += 3) {
    const r = run(h, t, far(h)), house = houseAt(r.X, r.Z);
    assert.ok(house && house.full, `a hen at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is in no furnished house`);
    const G = houseGeom(house), c = G.toWorld(0, 0);
    assert.ok(Math.abs(r.X - c[0]) < G.W / 2 - 4.3 && Math.abs(r.Z - c[1]) < G.D / 2 - 4.3, 'in the court');
    const tr = G.trees[0]; assert.ok(Math.hypot(r.X - tr.at[0], r.Z - tr.at[1]) > 1.0, 'not under the tree trunk');
  }
});
test('the cats sit on the shops\' sills, the dogs on the ground', () => {
  const cats = [...of('cat_tabby'), ...of('cat_orange')];
  assert.ok(cats.length >= 4 && of('dog').length >= 3);
  for (const c of cats) { const r = run(c, 0, far(c)); assert.ok(Math.abs(r.Y - 0.5) < 0.05, `a cat at height ${r.Y}`); }
});
