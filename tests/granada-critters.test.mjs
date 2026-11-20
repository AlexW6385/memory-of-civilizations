// Granada's critters (src/engine/fauna-critters.js, critter-poses.js; docs/settlements/granada.md §23): the behaviours are written once for numbers and for the
// shader; this steps them through in Node and checks what a visitor would see: the cats asleep on the floors of the shops and waking as one comes near, the dog
// in the lane, the hens and the cock in their huerta, the pigeons walking the paving of a court.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/granada/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { gardens, HILL, inRect } from '../src/settlements/granada/layout.js';
import { openedHouses } from '../src/settlements/granada/walk.js';

const inst = expandCritters(data.critters, { id: 'granada' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...models) => inst.filter((i) => models.includes(i.model));
const trace = (i, cam = far(i), dt = 0.2, T = 600) => { const o = []; for (let t = 0; t < T; t += dt) o.push({ t, r: run(i, t, cam) }); return o; };
const speeds = (tr) => tr.slice(1).map((s, k) => Math.hypot(s.r.X - tr[k].r.X, s.r.Z - tr[k].r.Z) / (s.t - tr[k].t));

test('the instances: every model is known, the count is small, no animal is placed twice', () => {
  assert.ok(inst.length >= 10 && inst.length <= 24, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.equal(new Set(inst.map((i) => i.groups[1].slice(0, 3).join())).size, inst.length);
});

test('the cats lie on the floors of the shops they are in; the dog in the lane before a kitchen', () => {
  const houses = openedHouses(2), cats = of('cat_tabby', 'cat_orange');
  assert.ok(cats.length >= 3);
  for (const c of cats) {
    const [x, y, z] = c.groups[1], h = houses.find((q) => inRect(q.lot.rect, x, z));
    assert.ok(h && h.kind.startsWith('shop:'), `a cat at ${x}, ${z} is in a shop`);
    assert.ok(Math.abs(y - (HILL.top + 0.15)) < 0.01, 'on the floor');
  }
  assert.ok(houses.filter((h) => h.kind === 'shop:baker').length <= cats.filter((c) => houses.some((q) => q.kind === 'shop:baker' && inRect(q.lot.rect, c.groups[1][0], c.groups[1][2]))).length, 'a cat in every bakery');
  const [d] = of('dog'), [x, , z] = d.groups[1], k = houses.find((q) => q.kind === 'house:kitchen');
  assert.ok(!inRect(k.lot.rect, x, z) && inRect(k.lot.rect, x, z, 1.2), 'the dog lies just outside the door');
});

test('cat: asleep with its head down far off; lifts its head and opens its eyes as the visitor nears', () => {
  const [c] = of('cat_orange', 'cat_tabby'), [x, y, z] = c.groups[1];
  const farR = run(c, 3, [x + 20, y, z]), midR = run(c, 3, [x + 4.5, y, z]), nearR = run(c, 3, [x + 1.5, y, z]);
  assert.ok(farR.eye < 0.2 && nearR.eye > 0.9, 'eyes shut then open');
  assert.ok(farR.n1p > 0.4 && nearR.n1p < 0.1, 'head down then up');
  assert.ok(farR.n1p > midR.n1p && midR.n1p > nearR.n1p, 'it wakes by degrees');
});

test('dog: lies far off, stands and faces the visitor within a few metres', () => {
  const [d] = of('dog'), [x, y, z] = d.groups[1];
  const lying = run(d, 5, [x, y, z + 25]), up = run(d, 5, [x, y + 1.5, z + 2.5]);
  assert.ok(lying.lc > 0.7 && up.lc < 0.1, 'legs folded then straight');
  assert.ok(up.Y > lying.Y + 0.15, 'the body rises');
});

test('hens and the cock stay in their huerta, walls and all, and pace like fowl', () => {
  const g = gardens().slice(0, 2), fowl = of('hen_brown', 'hen_white', 'rooster');
  assert.equal(fowl.length, 6);
  for (const h of fowl) {
    const [x0, , z0] = h.groups[1], garden = g.find((q) => inRect(q.rect, x0, z0));
    assert.ok(garden, `${h.model} starts in a huerta`);
    const tr = trace(h), sp = speeds(tr);
    for (const { r } of tr) assert.ok(inRect(garden.rect, r.X, r.Z, -0.3), `${h.model} at ${r.X}, ${r.Z}`);
    assert.ok(Math.max(...sp) < 0.9, `${h.model} speed`);
  }
});

test('pigeons walk and peck about their spot on the paving, and never far', () => {
  const p = of('pigeon_grey', 'pigeon_white', 'pigeon_dark');
  assert.ok(p.length >= 4);
  for (const b of p) {
    const [x, , z] = b.groups[1], tr = trace(b, far(b), 0.5);
    assert.ok(Math.max(...tr.map(({ r }) => Math.hypot(r.X - x, r.Z - z))) < 5, `${b.model} strays`);
    assert.ok(Math.max(...speeds(tr)) < 1.2);
  }
});
