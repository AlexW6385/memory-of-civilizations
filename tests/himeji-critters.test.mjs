// Himeji's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/edo-himeji.md §10.3): the duck pairs stay on the
// moats' water and keep company, the fowl keep to their patch in a free yard, the swallows go out over the street from nests under the
// eaves and come home, the kingfisher dives at the moat and returns, the cats answer the visitor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/edo-himeji/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { LEVEL, MIDDLE, STREET, inMoat, inMiddle, inLot, inRect, lots } from '../src/settlements/edo-himeji/layout.js';
import { yardFree } from '../src/styles/edo/yard.js';

const inst = expandCritters(data.critters, { id: 'edo-himeji' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const trace = (i, cam = far(i), dt = 0.1, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));
const wet = (x, z) => inMoat(x, z) || inMiddle(x, z);

test('the instances: every model is known, the count is small, no animal stands in a house', () => {
  assert.ok(inst.length >= 20 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (['cat_tabby', 'cat_orange'].includes(i.model)) assert.ok(!inLot(i.groups[1][0], i.groups[1][2], 0.2), `${i.model} in a house`);
  // the fowl stand in the free yard of a compound (clear of every part of it)
  for (const i of inst) if (/rooster|hen_/.test(i.model)) { const [x, , z] = i.groups[1], l = lots().find((q) => q.t === 'yashiki' && inRect(q.rect, x, z)); assert.ok(l && yardFree(l, x, z), `${i.model} in free yard`); }
});

test('ducks: pairs afloat on the moats, clear of the bank, close together, slow, level', () => {
  const ducks = inst.filter((i) => i.kind === 'duck');
  assert.ok(ducks.length >= 10);
  for (let k = 0; k < ducks.length; k += 2) {
    const a = trace(ducks[k], far(ducks[k]), 0.5, 300), b = trace(ducks[k + 1], far(ducks[k]), 0.5, 300);
    let dmax = 0;
    a.forEach((s, j) => { dmax = Math.max(dmax, Math.hypot(s.r.X - b[j].r.X, s.r.Z - b[j].r.Z)); assert.ok(wet(s.r.X, s.r.Z) && wet(b[j].r.X, b[j].r.Z), `afloat at ${s.t}: ${s.r.X}, ${s.r.Z}`); assert.ok(Math.abs(s.r.Y - LEVEL.water) < 0.12); });
    assert.ok(dmax < 1.6, `the pair's furthest apart ${dmax}`);
    assert.ok(Math.max(...speeds(a)) < 1.0, 'paddling speed');
  }
});

test('hens and the rooster keep to a small patch of free yard and pace like fowl', () => {
  for (const m of ['hen_brown', 'hen_white', 'rooster']) for (const h of of(m)) {
    const [x, , z] = h.groups[1], tr = trace(h, far(h), 0.2, 300);
    for (const { r } of tr) { assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.2, `${m} wandered to ${r.X}, ${r.Z}`); const l = lots().find((q) => q.t === 'yashiki' && inRect(q.rect, x, z)); assert.ok(yardFree(l, r.X, r.Z) || Math.hypot(r.X - x, r.Z - z) < 1.8, `${m} walked into a building at ${r.X}, ${r.Z}`); }
    assert.ok(Math.max(...speeds(tr)) < 0.9, `${m} speed`);
  }
  assert.equal(of('rooster').length, 3); assert.equal(of('hen_brown').length, 3);
});

test('cats: asleep far off, they wake as the visitor nears', () => {
  const cats = [...of('cat_tabby'), ...of('cat_orange')]; assert.equal(cats.length, 2);
  for (const c of cats) { const [x, y, z] = c.groups[1], f = run(c, 3, [x + 20, y, z]), n = run(c, 3, [x + 1.5, y, z]); assert.ok(f.eye < 0.2 && n.eye > 0.9, 'cat wakes by degrees'); }
});

test('swallows: out from the eave over the street, never low, back home, the nestlings showing', () => {
  const nests = of('swallow_nest'); assert.ok(nests.length >= 4);
  for (const n of nests) {
    const [nx, , nz, rot] = n.groups[1], toward = rot > 0 ? 1 : -1, tr = trace(n, far(n), 0.05, 40);
    let away = 0, pop = 0;
    for (const { r } of tr) {
      away = Math.max(away, Math.hypot(r.X - nx, r.Z - nz)); if (r.pop > 0.5) pop++;
      assert.ok(r.Y > 1.9, `too low ${r.Y}`);
      assert.ok((r.Z - nz) * toward >= -0.01, 'out from the wall toward the street, never behind it');
    }
    assert.ok(away > 5, `it goes ${away} m out`); assert.ok(pop > 0);
    assert.ok(Math.hypot(tr[0].r.X - nx, tr[0].r.Z - nz) < 12);
    // the nest is on a front: just off a machiya's street face
    assert.ok(lots().some((l) => l.t === 'machiya' && (Math.abs(nx - l.rect[2]) < 0.6 || Math.abs(nx - l.rect[0]) < 0.6) && Math.abs(nz - (toward > 0 ? l.rect[3] : l.rect[1])) < 0.3), 'on a front');
  }
});

test('kingfisher: waits on the bank, dives to the moat and returns to its perch', () => {
  const [k] = of('kingfisher'), [px, py, pz] = k.groups[1], [wx, wz] = k.groups[2], tr = trace(k, far(k), 0.02, 120);
  let reached = 0, still = 0;
  for (const { r } of tr) {
    if (Math.hypot(r.X - wx, r.Z - wz) < 0.4 && r.Y < LEVEL.water + 0.15) reached++;
    if (Math.hypot(r.X - px, r.Z - pz) < 0.01 && Math.abs(r.Y - py) < 0.01) still++;
    assert.ok(r.Y > LEVEL.water - 0.1);
  }
  assert.ok(wet(wx, wz), 'the dive is into the water');
  assert.ok(reached > 5 && still > tr.length * 0.7);
  const end = tr[tr.length - 1].r; assert.ok(Math.hypot(end.X - px, end.Z - pz) < 0.6);
  assert.ok(pz > MIDDLE.z1 && pz < STREET.z0);
});

test('the caged birds hang at the eaves of the teahouses', () => {
  const cages = of('cagebird'); assert.equal(cages.length, 3);
  for (const b of cages) assert.ok(b.groups[1][1] > 2.3 && b.groups[1][1] < 3.2);
});
