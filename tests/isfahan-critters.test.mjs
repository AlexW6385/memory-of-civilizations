// Isfahan's animals (src/settlements/isfahan/fauna.js, docs/settlements/isfahan.md §26.4): the engine's critters stepped through in Node: every model is known,
// the ground pigeons and hens stay near where they were set down, the hens stay in their own court clear of its pool, the cats sit on the shops' platforms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/isfahan/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { openHouses, houseSpots, DOVECOTES } from '../src/settlements/isfahan/layout.js';

const inst = expandCritters(data.critters, { id: 'isfahan' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);

test('the instances: every model is known and the count is small', () => {
  assert.ok(inst.length >= 25 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
});
test('the towers have their flocks and the town its doves, sparrows and crows', () => {
  assert.equal(data.flights.filter((f) => f.kind === 'pigeon' && f.loop).length, DOVECOTES.length);
  assert.ok(data.flights.some((f) => f.kind === 'pigeon' && f.lane) && data.flights.some((f) => f.kind === 'crow'));
  assert.ok(data.perches.some((p) => p.kind === 'sparrow') && data.perches.some((p) => p.kind === 'pigeon'));
  for (const f of data.flights) assert.ok(f.n > 0 && f.y[0] < f.y[1] && f.speed > 0);
});
test('pigeons on the ground, hens and cock: within a few metres of where they were set down', () => {
  const m = ['pigeon_grey', 'pigeon_white', 'pigeon_dark'];
  assert.ok(m.flatMap(of).length >= 12);
  for (const k of [...m, 'hen_brown', 'hen_white', 'rooster']) for (const i of of(k)) { const a = run(i, 0, far(i)), b = run(i, 300, far(i)); assert.ok(Math.hypot(b.X - a.X, b.Z - a.Z) < 6, k); }
});
test('the hens stay in the court of their own house, clear of its pool', () => {
  const hens = [...of('hen_brown'), ...of('hen_white'), ...of('rooster')];
  assert.ok(hens.length >= 6);
  for (const h of hens) for (let t = 0; t < 300; t += 3) {
    const r = run(h, t, far(h)), house = openHouses().find((q) => r.X > q.rect[0] && r.X < q.rect[2] && r.Z > q.rect[1] && r.Z < q.rect[3]);
    assert.ok(house, `a hen at ${r.X.toFixed(1)}, ${r.Z.toFixed(1)} is in no walk-in house`);
    const c = houseSpots(house).court, [pcx, pcz, pw, pd] = house.v.pool;
    assert.ok(r.X > c[0] && r.X < c[2] && r.Z > c[1] && r.Z < c[3], 'in the court');
    assert.ok(!(Math.abs(r.X - pcx) < pw + 0.2 && Math.abs(r.Z - pcz) < pd + 0.2), 'not in the pool');
  }
});
test('the cats sit on the platforms of the shut shops, the dogs on the ground', () => {
  const cats = [...of('cat_tabby'), ...of('cat_orange')];
  assert.ok(cats.length >= 3 && of('dog').length >= 2);
  for (const c of cats) { const r = run(c, 0, far(c)); assert.ok(Math.abs(r.Y - 0.47) < 0.05, `a cat at height ${r.Y}`); }
});
