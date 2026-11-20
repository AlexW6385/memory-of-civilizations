// Lisbon's critters (src/settlements/manueline-lisbon/fauna.js; docs/settlements/manueline-lisbon.md §13.3), stepped through in Node as
// Suzhou's are (tests/suzhou-critters.test.mjs): cats at the quoins of the shop fronts, dogs at doors and the yard's gate, hens and a
// rooster at the lane's edge, pigeons on the Terreiro, geese on the sand at Belém, ducks in the shallows, goats on the Alfama's slope.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/manueline-lisbon/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, wet, inRect, TERREIRO, SEA } from '../src/settlements/manueline-lisbon/layout.js';

const inst = expandCritters(data.critters, { id: 'manueline-lisbon' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...models) => inst.filter((i) => models.includes(i.model));
const trace = (i, cam = far(i), dt = 0.1, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));
const insideLot = (x, z, m = 0) => lots().some((l) => x > l.rect[0] - m && x < l.rect[2] + m && z > l.rect[1] - m && z < l.rect[3] + m);

test('the instances: every model is known, a few of each, small in all', () => {
  assert.ok(inst.length >= 20 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('cat_tabby', 'cat_orange').length >= 5 && of('dog').length === 3 && of('hen_brown', 'hen_white').length >= 4 && of('rooster').length === 1);
  assert.ok(of('pigeon_grey', 'pigeon_dark', 'pigeon_white').length >= 4 && of('goose_white', 'goose_grey').length === 3 && of('duck_white', 'duck_brown').length >= 4 && of('goat_white', 'goat_black').length === 2);
  assert.equal(of('crane', 'cormorant', 'fishing_craft', 'mandarin_drake', 'mandarin_hen', 'swallow_nest').length, 0, 'no East Asian bird here');
});

test('shop cats sit on the pavement outside a house front, clear of the doorway', () => {
  const cats = of('cat_tabby', 'cat_orange');
  assert.equal(cats.length, 6);
  for (const c of cats) {
    const [x, y, z] = c.groups[1];
    assert.ok(!insideLot(x, z, -0.05), `cat inside a house at ${x}, ${z}`);
    const l = lots().find((q) => x > q.rect[0] && x < q.rect[2] && z > q.rect[1] - 1 && z < q.rect[3] + 1);
    assert.ok(l && l.open, `a cat before an open front at ${x}, ${z}`);
    const u = x - l.rect[0], L = l.rect[2] - l.rect[0];
    assert.ok(u < L / 2 - 1.6 || u > L / 2 + 1.6, `out of the door's 3.2 m (u ${u} of ${L})`);
    assert.ok(y > 1.3 && y < 1.6, 'on the paving');
  }
});

test('cat: asleep with its head down far off; lifts its head and opens its eyes as the visitor nears', () => {
  const [c] = of('cat_tabby', 'cat_orange'), [x, y, z] = c.groups[1];
  const farR = run(c, 3, [x + 20, y, z]), midR = run(c, 3, [x + 4.5, y, z]), nearR = run(c, 3, [x + 1.5, y, z]);
  assert.ok(farR.eye < 0.2 && nearR.eye > 0.9 && farR.n1p > midR.n1p && midR.n1p > nearR.n1p, 'it wakes by degrees');
});

test('dogs lie far off and stand near; the plaza dog is off its house door; the yard dog is at the gate', () => {
  for (const d of of('dog')) { const [x, y, z] = d.groups[1], lying = run(d, 5, [x, y, z + 25]), up = run(d, 5, [x, y + 1.5, z + 2.5]); assert.ok(lying.lc > 0.7 && up.lc < 0.1 && up.Y > lying.Y + 0.15, 'lies, then stands'); assert.ok(!insideLot(x, z, -0.05)); }
  const yard = of('dog').find((d) => d.groups[1][0] > 150);
  assert.ok(Math.abs(yard.groups[1][0] - 153.5) < 0.01 && yard.groups[1][2] === 36, 'at the yard gate');
});

test('hens and the rooster keep to the lane, off the walls, and pace like fowl', () => {
  for (const h of of('hen_brown', 'hen_white', 'rooster')) {
    const tr = trace(h), sp = speeds(tr);
    for (const { r } of tr) { assert.ok(r.Z > 62.3 && r.Z < 66.9, `${h.model} z ${r.Z}`); assert.ok(r.X > -156 && r.X < -140, `${h.model} x ${r.X}`); }
    assert.ok(Math.max(...sp) < 0.9, `${h.model} speed`);
  }
});

test('pigeons stay on the Terreiro\'s flags; geese stay on the sand between the boats', () => {
  for (const p of of('pigeon_grey', 'pigeon_dark', 'pigeon_white')) for (const { r } of trace(p, far(p), 0.5)) assert.ok(inRect(TERREIRO, r.X, r.Z) && Math.hypot(r.X - 102, r.Z - 72) < 12, `pigeon at ${r.X}, ${r.Z}`);
  for (const g of of('goose_white', 'goose_grey')) for (const { r } of trace(g, far(g), 0.5)) { assert.ok(wet(r.X, r.Z) > 2, `goose in the water at ${r.X}, ${r.Z}`); assert.ok(r.X > -190 && r.X < -179.5, `goose off the gap at x ${r.X}`); }
});

test('the farm ducks: a raft in the shallows of Belém, none on dry land, together', () => {
  const ducks = of('duck_white', 'duck_brown'), tr = ducks.map((d) => trace(d, far(d), 0.5));
  for (const t of tr) for (const s of t) { assert.ok(wet(s.r.X, s.r.Z) < -0.5, `duck on land at ${s.r.X}, ${s.r.Z}`); assert.ok(Math.abs(s.r.Y - SEA) < 0.3); }
  assert.ok(tr[0].every((s, k) => Math.hypot(s.r.X - tr[1][k].r.X, s.r.Z - tr[1][k].r.Z) < 6), 'they keep together');
});

test('every critter yields finite numbers', () => {
  for (const i of inst) { const r = run(i, 1, far(i)); for (const k of ['X', 'Y', 'Z', 'psi']) assert.ok(Number.isFinite(r[k]), `${i.model} ${k}`); }
});
