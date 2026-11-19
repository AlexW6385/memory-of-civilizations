// Kyoto's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/muromachi-kyoto.md §12): the pairs of mandarin
// ducks stay on their ponds and keep company, the cats and dogs lie on open ground and answer the visitor, the hens stay in their
// patch, the swallows go out over the street from nests under the eaves and come home, the kingfisher dives at the stream and returns.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/muromachi-kyoto/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { GINKAKU, RYOAN, STREAM, inLot } from '../src/settlements/muromachi-kyoto/layout.js';

const inst = expandCritters(data.critters, { id: 'muromachi-kyoto' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const trace = (i, cam = far(i), dt = 0.1, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));
const pondD = (P) => (x, z) => (Math.hypot((x - P.c[0]) / P.r[0], (z - P.c[1]) / P.r[1]) - 1) * Math.min(P.r[0], P.r[1]);

test('the instances: every model is known, the count is small, none stands in a house', () => {
  assert.ok(inst.length >= 14 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const i of inst) if (['cat_tabby', 'cat_orange', 'dog', 'rooster', 'hen_brown', 'hen_white'].includes(i.model)) assert.ok(!inLot(i.groups[1][0], i.groups[1][2], 0.2), `${i.model} in a house`);
});

test('mandarin ducks: a pair on each pond clear of the shore, close together, slow, level', () => {
  const drakes = of('mandarin_drake'), hens = of('mandarin_hen');
  assert.equal(drakes.length, 2); assert.equal(hens.length, 2);
  [GINKAKU.pond, RYOAN.pond].forEach((P, k) => {
    const a = trace(drakes[k]), b = trace(hens[k]), d = pondD(P);
    let dmax = 0;
    a.forEach((s, j) => { dmax = Math.max(dmax, Math.hypot(s.r.X - b[j].r.X, s.r.Z - b[j].r.Z)); assert.ok(d(s.r.X, s.r.Z) < -1 && d(b[j].r.X, b[j].r.Z) < -1, `afloat at ${s.t}`); assert.ok(Math.abs(s.r.Y - P.level) < 0.02); });
    assert.ok(dmax < 1.6, `the pair's furthest apart ${dmax}`);
    assert.ok(Math.max(...speeds(a)) < 1.0, 'paddling speed');
  });
});

test('hens and the rooster keep to a small patch and pace like fowl', () => {
  for (const m of ['hen_brown', 'hen_white', 'rooster']) for (const h of of(m)) {
    const [x, , z] = h.groups[1], tr = trace(h);
    for (const { r } of tr) assert.ok(Math.hypot(r.X - x, r.Z - z) < 4.2, `${m} wandered to ${r.X}, ${r.Z}`);
    assert.ok(Math.max(...speeds(tr)) < 0.9, `${m} speed`);
  }
});

test('cat and dog: asleep or lying far off, they wake and turn as the visitor nears', () => {
  for (const c of of('cat_tabby').concat(of('cat_orange'))) {
    const [x, y, z] = c.groups[1], f = run(c, 3, [x + 20, y, z]), n = run(c, 3, [x + 1.5, y, z]);
    assert.ok(f.eye < 0.2 && n.eye > 0.9 && f.n1p > 0.4 && n.n1p < 0.1, 'cat wakes by degrees');
  }
  for (const d of of('dog')) {
    const [x, y, z] = d.groups[1], l = run(d, 5, [x, y, z + 25]), u = run(d, 5, [x, y + 1.5, z + 2.5]);
    assert.ok(l.lc > 0.7 && u.lc < 0.1 && u.Y > l.Y + 0.15, 'dog stands for the visitor');
  }
});

test('swallows: out from the eave over the street, never low, back home, with the nestlings showing', () => {
  const nests = of('swallow_nest'); assert.ok(nests.length >= 3);
  for (const n of nests) {
    const [nx, ny, nz] = n.groups[1], tr = trace(n, far(n), 0.05, 40);
    let away = 0, pop = 0;
    for (const { r } of tr) {
      away = Math.max(away, Math.hypot(r.X - nx, r.Z - nz)); if (r.pop > 0.5) pop++;
      assert.ok(r.Y > 1.9, `too low ${r.Y}`);
      assert.ok(r.Z <= nz + 0.01, 'out from the wall toward the street, never behind it');
    }
    assert.ok(away > 5, `it goes ${away} m out`); assert.ok(pop > 0);
    assert.ok(Math.hypot(tr[0].r.X - nx, tr[0].r.Z - nz) < 12);
  }
});

test('kingfisher: waits on the bank, dives to the stream and returns to its perch', () => {
  const [k] = of('kingfisher'), [px, py, pz] = k.groups[1], [wx, wz] = k.groups[2], tr = trace(k, far(k), 0.02, 120);
  let reached = 0, still = 0;
  for (const { r } of tr) {
    if (Math.hypot(r.X - wx, r.Z - wz) < 0.4 && r.Y < STREAM.level + 0.15) reached++;
    if (Math.hypot(r.X - px, r.Z - pz) < 0.01 && Math.abs(r.Y - py) < 0.01) still++;
    assert.ok(r.Y > STREAM.level - 0.1);
  }
  assert.ok(wx > STREAM.x0 && wx < STREAM.x1, 'the dive is into the water');
  assert.ok(reached > 5 && still > tr.length * 0.7);
  const end = tr[tr.length - 1].r; assert.ok(Math.hypot(end.X - px, end.Z - pz) < 0.6);
});

test('the caged bird hangs at an eave of the approach street', () => {
  const [b] = of('cagebird'); assert.ok(b.groups[1][1] > 2.5 && b.groups[1][1] < 3.6);
});
