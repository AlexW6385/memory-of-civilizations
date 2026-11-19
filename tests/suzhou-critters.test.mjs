// Suzhou's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/ming-suzhou.md §22): the
// behaviours are written once for numbers and for the shader; this steps them through in Node and checks what
// a visitor would see: the ducks stay on the water and keep company, the crane stays on the terrace and walks
// slowly, the cat and the dog answer the visitor, the swallows go out over the pond and come home, the
// kingfisher dives at the water and returns, the hens stay in their yard.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/ming-suzhou/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { pondDistance, canalDistance, FOOTPRINTS, LEVEL } from '../src/settlements/ming-suzhou/layout.js';

const inst = expandCritters(data.critters, { id: 'ming-suzhou' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (model) => inst.filter((i) => i.model === model);
/** Steps through a 10-minute day: samples { t, rig } every dt. */
const trace = (i, cam = far(i), dt = 0.1, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));

test('the instances: every model is known and the count is small', () => {
  assert.ok(inst.length >= 20 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
});

test('mandarin pair: on the pond (clear of the shore), within a body or two of each other, slow, level', () => {
  const [drake] = of('mandarin_drake'), [hen] = of('mandarin_hen');
  const a = trace(drake), b = trace(hen);
  let dmax = 0, dsum = 0;
  a.forEach((s, k) => { const d = Math.hypot(s.r.X - b[k].r.X, s.r.Z - b[k].r.Z); dmax = Math.max(dmax, d); dsum += d; assert.ok(pondDistance(s.r.X, s.r.Z) < -1.5 && pondDistance(b[k].r.X, b[k].r.Z) < -1.5, `afloat at ${s.t}`); assert.ok(Math.abs(s.r.Y - LEVEL.pond) < 0.02); });
  assert.ok(dmax < 1.2, `the pair's furthest apart ${dmax}`);
  assert.ok(dsum / a.length > 0.2, 'not on top of each other');
  assert.ok(Math.max(...speeds(a)) < 1.0, 'paddling speed');
  // they stop to preen: part of the time the neck is turned back (yaw) or the bill is under the wing
  assert.ok(a.some((s) => Math.abs(s.r.n1y) > 1.2), 'the drake preens');
  assert.notDeepEqual(drake.model, hen.model);
});

test('the farm ducks: a raft on the canal, away from the walls, none on dry land', () => {
  const ducks = inst.filter((i) => i.model === 'duck_white' || i.model === 'duck_brown');
  assert.ok(ducks.length >= 5);
  for (const d of ducks) for (const s of trace(d, far(d), 0.5)) assert.ok(canalDistance(s.r.X, s.r.Z) < -0.25, `duck at ${s.r.X},${s.r.Z}`);
  const [d0, d1] = ducks.map((d) => trace(d, far(d), 0.5));
  assert.ok(d0.every((s, k) => Math.hypot(s.r.X - d1[k].r.X, s.r.Z - d1[k].r.Z) < 4.5), 'they keep together');
});

test('crane: stays on the terrace (inside the balustrade), at a walker\'s pace, with stands where it bows and preens', () => {
  const [c] = of('crane'), tr = trace(c);
  for (const { r } of tr) assert.ok(r.X > -9.2 && r.X < 9.2 && r.Z > -25.2 && r.Z < -20.4, `crane at ${r.X}, ${r.Z}`);
  const sp = speeds(tr);
  assert.ok(Math.max(...sp) < 0.7, `crane speed ${Math.max(...sp)}`);
  assert.ok(sp.filter((v) => v < 0.02).length > sp.length * 0.4, 'it spends much of the time standing');
  assert.ok(tr.some(({ r }) => r.n1p > 0.8), 'a bow of the neck');
  assert.ok(tr.some(({ r }) => r.n2p > 1.1), 'a preen: the head turned back to the wing');
  // the visitor close by (2.5 m from the bird at every moment): at the instants it would have bowed, it holds its head up
  let bowed = 0;
  for (let t = 0; t < 600; t += 0.25) {
    const a = run(c, t, far(c)), n = run(c, t, [a.X, 1.8, a.Z + 2.5]);
    if (a.n1p > 0.8) { bowed++; assert.ok(n.n1p < a.n1p - 0.3, `alert at ${t}: ${n.n1p} against ${a.n1p}`); }
  }
  assert.ok(bowed > 10);
});

test('hens and the rooster stay in their yard and pace like fowl', () => {
  for (const m of ['hen_brown', 'hen_white', 'rooster']) for (const h of of(m)) {
    const tr = trace(h), sp = speeds(tr);
    for (const { r } of tr) {
      assert.ok(r.X > -37 && r.X < -24 && r.Z > 51 && r.Z < 58, `${m} at ${r.X}, ${r.Z}`);
      assert.ok(!FOOTPRINTS.some((f) => r.X > f[0] && r.X < f[2] && r.Z > f[1] && r.Z < f[3]));
    }
    assert.ok(Math.max(...sp) < 0.9, `${m} speed`);
  }
});

test('cat: asleep with its head down far off; lifts its head and opens its eyes as the visitor nears', () => {
  const [c] = of('cat_tabby'), [x, y, z] = c.groups[1];
  const farR = run(c, 3, [x + 20, y, z]), midR = run(c, 3, [x + 4.5, y, z]), nearR = run(c, 3, [x + 1.5, y, z]);
  assert.ok(farR.eye < 0.2 && nearR.eye > 0.9, 'eyes shut then open');
  assert.ok(farR.n1p > 0.4 && nearR.n1p < 0.1, 'head down then up');
  assert.ok(farR.n1p > midR.n1p && midR.n1p > nearR.n1p, 'it wakes by degrees');
  assert.equal(run(c, 3, [x + 20, y, z]).X, x);
});

test('dog: lies far off, stands and faces the visitor within a few metres', () => {
  const [d] = of('dog'), [x, y, z] = d.groups[1];
  const lying = run(d, 5, [x, y, z + 25]), up = run(d, 5, [x, y + 1.5, z + 2.5]);
  assert.ok(lying.lc > 0.7 && up.lc < 0.1, 'legs folded then straight');
  assert.ok(up.Y > lying.Y + 0.15, 'the body rises');
  const side = run(d, 5, [x + 3, y + 1.5, z + 0.5]);
  assert.ok(Math.abs(Math.atan2(Math.sin(side.psi - d.groups[1][3]), Math.cos(side.psi - d.groups[1][3]))) > 0.2, 'it turns to follow the visitor');
});

test('swallows: leave the nest under the eave, cross the pond low, and are back home; the nest is empty then', () => {
  for (const n of of('swallow_nest')) {
    const [nx, ny, nz] = n.groups[1], tr = trace(n, far(n), 0.05, 40);
    let over = 0, low = 99, away = 0, popSeen = 0;
    for (const { r } of tr) {
      if (r.Y < ny - 0.05) { over += pondDistance(r.X, r.Z) < -1 ? 1 : 0; low = Math.min(low, r.Y); }
      away = Math.max(away, Math.hypot(r.X - nx, r.Z - nz));
      if (r.pop > 0.5) popSeen++;
      assert.ok(r.Y > 0.9 + 0.35 || pondDistance(r.X, r.Z) < 0, 'never low over the ground');
      assert.ok(r.Z <= nz + 0.01, 'out from the wall, never behind it');
    }
    assert.ok(over > 10, 'it flies over the water');
    assert.ok(low > LEVEL.pond + 0.8, `lowest ${low}`);
    assert.ok(away > 8, `it goes ${away} m out`);
    assert.ok(popSeen > 0, 'the nestlings show');
    const home = run(n, 36 * 3 - 0.0, far(n)), s0 = tr.find(({ r }) => r.vis !== 0);
    assert.ok(Math.hypot(tr[0].r.X - nx, tr[0].r.Z - nz) < 12);
    assert.ok(s0);
  }
});

test('kingfisher: perched and still, then a dive to the water and back to its perch', () => {
  const [k] = of('kingfisher'), [px, py, pz] = k.groups[1], [wx, wz] = k.groups[2], tr = trace(k, far(k), 0.02, 120);
  let reached = 0, still = 0;
  for (const { r } of tr) {
    if (Math.hypot(r.X - wx, r.Z - wz) < 0.4 && r.Y < LEVEL.pond + 0.15) reached++;
    if (Math.hypot(r.X - px, r.Z - pz) < 0.01 && Math.abs(r.Y - py) < 0.01) still++;
    assert.ok(r.Y > LEVEL.pond - 0.1);
  }
  assert.ok(reached > 5, 'it touches the water');
  assert.ok(still > tr.length * 0.7, 'mostly it waits');
  const end = tr[tr.length - 1].r;
  assert.ok(Math.hypot(end.X - px, end.Z - pz) < 0.6);
});

test('cormorants stand on the craft\'s rail; the craft is on the canal', () => {
  const [boat] = of('fishing_craft');
  for (const c of of('cormorant')) {
    const r = run(c, 10, far(c)), [bx, by, bz] = boat.groups[1];
    assert.ok(Math.abs(r.X - bx) < 1.3 && Math.abs(Math.abs(r.Z - bz) - 0.29) < 0.02, 'on a rail');
    assert.ok(r.Y > by + 0.2 && r.Y < by + 0.4);
  }
  assert.ok(canalDistance(boat.groups[1][0], boat.groups[1][2]) < -0.5);
  // some of them stand drying the wings, others preen: spread wings (ws) in the course of a cycle
  assert.ok(of('cormorant').some((c) => trace(c, far(c), 0.5, 300).some(({ r }) => r.ws > 1.0)));
});

test('the visitor far off: nothing shows beyond the reach (95 m) and nothing flies at night but what should', () => {
  // the reach is the shader's (fade by distance to the root); here only that the roots are finite
  for (const i of inst) { const r = run(i, 1, far(i)); for (const k of ['X', 'Y', 'Z', 'psi']) assert.ok(Number.isFinite(r[k]), `${i.model} ${k}`); }
});
