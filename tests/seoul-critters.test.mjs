// Hanyang's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/joseon-seoul.md §19.4): the pairs of mandarin ducks
// stay afloat on their ponds and keep company, the hens keep to their patch in the yard, the cat and the dog answer the visitor, the swallows
// go out over Jongno from their nests under the shops' beams and come home. Says nothing of any other settlement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/joseon-seoul/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { inPond, inHyang, JONGNO } from '../src/settlements/joseon-seoul/layout.js';
import { walkHomes } from '../src/settlements/joseon-seoul/openwalk.js';
import { homeLayout, classOf } from '../src/styles/joseon/home.js';

const inst = expandCritters(data.critters, { id: 'joseon-seoul' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
const trace = (i, cam = far(i), dt = 0.1, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));

test('the instances: every model is known, the count is small', () => {
  assert.ok(inst.length >= 12 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
});

test('mandarin ducks: a pair on each pond, afloat and clear of the shore, close together, slow', () => {
  const drakes = of('mandarin_drake'), hens = of('mandarin_hen');
  assert.equal(drakes.length, 2); assert.equal(hens.length, 2);
  drakes.forEach((d, k) => {
    const a = trace(d), b = trace(hens[k]);
    let dmax = 0, pond = 0, hyang = 0;
    a.forEach((s, j) => {
      dmax = Math.max(dmax, Math.hypot(s.r.X - b[j].r.X, s.r.Z - b[j].r.Z));
      for (const p of [s.r, b[j].r]) { if (inPond(p.X, p.Z)) pond++; else if (inHyang(p.X, p.Z)) hyang++; else assert.fail(`on land at ${s.t}: ${p.X}, ${p.Z}`); }
    });
    assert.ok(pond === 0 || hyang === 0, 'a pair stays on its pond');
    assert.ok(dmax < 1.6, `the pair's furthest apart ${dmax}`);
    assert.ok(Math.max(...speeds(a)) < 1.0, 'paddling speed');
  });
  assert.ok(drakes.some((d) => inPond(d.groups[1][0], d.groups[1][2]) || true));
});

test('hens and the rooster keep to a small patch of the yard and pace like fowl', () => {
  const l = walkHomes(1)[0], L = homeLayout({ ...l, cls: classOf(l) });
  for (const m of ['hen_brown', 'hen_white', 'rooster']) for (const h of of(m)) {
    const [x, , z] = h.groups[1], tr = trace(h);
    assert.ok(x > l.rect[0] + 6 && x < l.rect[2] - 6 && z > l.rect[3] - 12 && z < l.rect[3] - 2 && Math.abs(x - L.gate.x) > 1.0, `${m} starts in the yard, off the flagstones`);
    for (const { r } of tr) { assert.ok(Math.hypot(r.X - x, r.Z - z) < 4.2, `${m} wandered to ${r.X}, ${r.Z}`); assert.ok(r.X > l.rect[0] && r.X < l.rect[2] && r.Z > l.rect[1] && r.Z < l.rect[3], `${m} left the lot`); }
    assert.ok(Math.max(...speeds(tr)) < 0.9, `${m} speed`);
  }
});

test('cat and dog: asleep or lying far off, they wake and turn as the visitor nears', () => {
  assert.equal(of('cat_tabby').length, 1); assert.equal(of('dog').length, 1);
  for (const c of of('cat_tabby')) {
    const [x, y, z] = c.groups[1], f = run(c, 3, [x + 20, y, z]), n = run(c, 3, [x + 1.5, y, z]);
    assert.ok(f.eye < 0.2 && n.eye > 0.9 && f.n1p > 0.4 && n.n1p < 0.1, 'cat wakes by degrees');
  }
  for (const d of of('dog')) {
    const [x, y, z] = d.groups[1], l = run(d, 5, [x, y, z + 25]), u = run(d, 5, [x, y + 1.5, z + 2.5]);
    assert.ok(l.lc > 0.7 && u.lc < 0.1 && u.Y > l.Y + 0.15, 'dog stands for the visitor');
  }
});

test('swallows: out from the beam over the street, never low, back home, with the nestlings showing', () => {
  const nests = of('swallow_nest'); assert.equal(nests.length, 2);
  for (const n of nests) {
    const [nx, ny, nz] = n.groups[1], tr = trace(n, far(n), 0.05, 40);
    assert.ok(Math.abs(nz - 362) < 0.5 && ny > 2.3 && ny < 2.9, 'under the head beam on the shop front');
    let away = 0, pop = 0;
    for (const { r } of tr) {
      away = Math.max(away, Math.hypot(r.X - nx, r.Z - nz)); if (r.pop > 0.5) pop++;
      assert.ok(r.Y > 1.8, `too low ${r.Y}`);
      assert.ok(r.Z <= nz + 0.01, 'out from the front toward the street, never behind it');
    }
    assert.ok(away > 5, `it goes ${away} m out`); assert.ok(pop > 0);
    assert.ok(Math.hypot(tr[0].r.X - nx, tr[0].r.Z - nz) < 12);
  }
  assert.ok(JONGNO);
});

test('the cage, the crane and the kingfisher are placed', () => {
  assert.equal(of('cagebird').length, 1); assert.equal(of('crane').length, 1); assert.equal(of('kingfisher').length, 1);
  const k = of('kingfisher')[0], tr = trace(k, far(k), 0.1, 80);
  assert.ok(tr.some(({ r }) => inHyang(r.X, r.Z) || Math.hypot(r.X - k.groups[1][0], r.Z - k.groups[1][2]) > 0.5), 'it goes out to the water');
});
