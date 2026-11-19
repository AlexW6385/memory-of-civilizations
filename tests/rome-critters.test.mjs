// Rome's critters (src/settlements/rome/fauna.js; docs/settlements/rome.md §4.20), stepped through in Node as Suzhou's are
// (tests/suzhou-critters.test.mjs): cats at the piers of the shops and on a garden wall, the dog at the atrium house's door,
// the hens in the inn's court, a cage at the inn's bar door, farm ducks on the Tiber, a kingfisher on a mooring stone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/rome/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { INN, TIBER, riverX, riverEdge, rows, gardens } from '../src/settlements/rome/layout.js';
import { DOMUS } from '../src/settlements/rome/life.js';

const inst = expandCritters(data.critters, { id: 'rome' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...models) => inst.filter((i) => models.includes(i.model));
const trace = (i, cam = far(i), dt = 0.1, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));
const inRows = (x, z, m = 0) => rows().some((r) => x > r.rect[0] - m && x < r.rect[2] + m && z > r.rect[1] - m && z < r.rect[3] + m);

test('the instances: every model is known, a few of each, small in all', () => {
  assert.ok(inst.length >= 14 && inst.length <= 30, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('cat_tabby', 'cat_orange').length >= 3 && of('dog').length === 1 && of('hen_brown', 'hen_white').length >= 4 && of('rooster').length === 1);
  assert.ok(of('duck_white', 'duck_brown').length >= 5 && of('kingfisher').length === 1 && of('cagebird').length === 1);
  // nothing from Suzhou's own: no crane, no cormorant, no punt, no mandarin ducks
  assert.equal(of('crane', 'cormorant', 'fishing_craft', 'mandarin_drake', 'mandarin_hen', 'swallow_nest').length, 0);
});

test('shop cats sit at the foot of a pier, outside the row, and not in a doorway', () => {
  const cats = of('cat_tabby', 'cat_orange').filter((c) => c.groups[1][1] < 2);
  assert.ok(cats.length >= 3 && cats.length <= 6, `${cats.length} cats at the shops`);
  for (const c of cats) {
    const [x, y, z] = c.groups[1];
    // on the pavement, not inside a row, at a pier: 4.4 m pitch from the row's start along its front
    assert.ok(!inRows(x, z, -0.05), `cat inside a row at ${x}, ${z}`);
    const r = rows().find((q) => x > q.rect[0] - 0.6 && x < q.rect[2] + 0.6 && z > q.rect[1] - 0.6 && z < q.rect[3] + 0.6);
    assert.ok(r, `cat near a row at ${x}, ${z}`);
    const along = r.front === 's' ? x - r.rect[0] : z - r.rect[1], k = along / 4.4;
    assert.ok(Math.abs(k - Math.round(k)) < 0.01 && Math.round(k) >= 1 && Math.round(k) <= 4, `pier pitch ${k}`);
    assert.ok(y < 0.1 && y > -0.05);
  }
});

test('cat: asleep with its head down far off; lifts its head and opens its eyes as the visitor nears', () => {
  const [c] = of('cat_tabby', 'cat_orange'), [x, y, z] = c.groups[1];
  const farR = run(c, 3, [x + 20, y, z]), midR = run(c, 3, [x + 4.5, y, z]), nearR = run(c, 3, [x + 1.5, y, z]);
  assert.ok(farR.eye < 0.2 && nearR.eye > 0.9, 'eyes shut then open');
  assert.ok(farR.n1p > midR.n1p && midR.n1p > nearR.n1p, 'it wakes by degrees');
});

test('the garden cat is on the coping of a garden wall', () => {
  const g = gardens().filter((q) => q.rect[0] > -80 && q.rect[0] < 0 && q.rect[1] < -200)[0], c = of('cat_tabby', 'cat_orange').find((i) => i.groups[1][1] > 2);
  assert.ok(g && c);
  const [x, y, z] = c.groups[1];
  assert.ok(Math.abs(y - 2.95) < 0.01 && x > g.rect[0] + 1 && x < g.rect[2] - 1 && z > g.rect[3] - 0.6 && z <= g.rect[3], 'on the south wall');
});

test('dog: at the atrium house\'s street door, off the door\'s own 1.6 m, lies far off and stands near', () => {
  const [d] = of('dog'), [x, y, z] = d.groups[1], mx = (DOMUS[0] + DOMUS[2]) / 2;
  assert.ok(Math.abs(z - DOMUS[3]) < 0.8 && z > DOMUS[3], 'before the wall on the street side');
  assert.ok(x < mx - 0.8 - 0.55 && x > mx - 2.4, `clear of the fauces' door (x ${x}, door ${mx - 0.8}…${mx + 0.8})`);
  const lying = run(d, 5, [x, y, z + 25]), up = run(d, 5, [x, y + 1.5, z + 2.5]);
  assert.ok(lying.lc > 0.7 && up.lc < 0.1 && up.Y > lying.Y + 0.15, 'lies, then stands');
});

test('hens and the rooster stay in the inn\'s court, off the passage and the well, and pace like fowl', () => {
  // the court of the inn (frame: front south, u east from the lot's west edge, d north from its south edge): d 8.5 to 13.9, the passage door at u 10…11.4
  const u = (x) => x - INN[0], d = (z) => INN[3] - z;
  for (const h of of('hen_brown', 'hen_white', 'rooster')) {
    const tr = trace(h), sp = speeds(tr);
    for (const { r } of tr) {
      assert.ok(d(r.Z) > 8.7 && d(r.Z) < 13.7, `${h.model} d ${d(r.Z)}`);
      assert.ok(u(r.X) > 1.5 && u(r.X) < 20.5, `${h.model} u ${u(r.X)}`);
      assert.ok(!(u(r.X) > 9.4 && u(r.X) < 12.6), `${h.model} in the passage's line (u ${u(r.X)})`);
    }
    assert.ok(Math.max(...sp) < 0.9, `${h.model} speed`);
  }
});

test('the cage hangs on the inn\'s front wall, off the door', () => {
  const [c] = of('cagebird'), [x, y, z] = c.groups[1];
  assert.ok(Math.abs(z - INN[3]) < 0.6 && z > INN[3], 'outside the front');
  assert.ok(x - INN[0] < 1.3 && y > 2.2 && y < 3.2, 'by the pier left of the bar door (the door begins at u 1.6)');
});

test('the farm ducks: a raft on the Tiber by a landing, off the quay, none on dry land', () => {
  const ducks = of('duck_white', 'duck_brown');
  for (const d of ducks) for (const s of trace(d, far(d), 0.5)) {
    assert.ok(Math.abs(s.r.X - riverX(s.r.Z)) < TIBER.w / 2 - 1.4 - 0.3, `duck off the water at ${s.r.X}, ${s.r.Z}`);
    assert.ok(Math.abs(s.r.Y - TIBER.level) < 0.3, `duck at height ${s.r.Y}`);
  }
  const [d0, d1] = ducks.map((d) => trace(d, far(d), 0.5));
  assert.ok(d0.every((s, k) => Math.hypot(s.r.X - d1[k].r.X, s.r.Z - d1[k].r.Z) < 6), 'they keep together');
});

test('kingfisher: on a mooring stone of the quay, a dive to the water and back', () => {
  const [k] = of('kingfisher'), [px, py, pz] = k.groups[1], [wx, wz] = k.groups[2], tr = trace(k, far(k), 0.02, 120);
  const E = riverEdge(1);
  assert.ok(E.some((e) => Math.abs(e[0] + 1.5 - px) < 0.01 && Math.abs(e[1] - pz) < 0.01), 'at a quay point');
  assert.ok(Math.abs(py - 0.61) < 0.01);
  let reached = 0, still = 0;
  for (const { r } of tr) {
    if (Math.hypot(r.X - wx, r.Z - wz) < 0.4 && r.Y < TIBER.level + 0.15) reached++;
    if (Math.hypot(r.X - px, r.Z - pz) < 0.01 && Math.abs(r.Y - py) < 0.01) still++;
    assert.ok(r.Y > TIBER.level - 0.1);
  }
  assert.ok(reached > 5 && still > tr.length * 0.7, 'touches the water, mostly waits');
});

test('every critter yields finite numbers', () => {
  for (const i of inst) { const r = run(i, 1, far(i)); for (const k of ['X', 'Y', 'Z', 'psi']) assert.ok(Number.isFinite(r[k]), `${i.model} ${k}`); }
});
