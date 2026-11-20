// Vienna's critters (src/engine/fauna-critters.js; docs/settlements/vienna.md §15.3): pigeons in knots where people sit, the Hausmeister's dog in a Durchhaus, a cat on a
// Hof's bench, a canary on an opened flat's balcony. The behaviours are written once for numbers and for the shader (critter-poses.js); this steps them in Node.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/vienna/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, yards, inRect, passageRect, RADIUS } from '../src/settlements/vienna/layout.js';

const inst = expandCritters(data.critters, { id: 'vienna' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...models) => inst.filter((i) => models.includes(i.model));

test('the instances: every model is known, the count is small, all inside the disc', () => {
  assert.ok(inst.length >= 25 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) { assert.ok(POSES[i.groups[0][0]], i.model); assert.ok(Math.hypot(i.groups[1][0], i.groups[1][2]) < RADIUS - 20, i.model); }
  assert.ok(of('pigeon_grey', 'pigeon_white', 'pigeon_dark').length >= 20 && of('dog').length >= 1 && of('cat_tabby', 'cat_orange').length >= 1 && of('cagebird').length >= 1);
});

test('pigeons walk and peck within a few metres of their knot, slowly', () => {
  for (const p of of('pigeon_grey', 'pigeon_white', 'pigeon_dark')) {
    const [, , x0, z0] = [0, 0, p.groups[1][0], p.groups[1][2]]; let prev = null, vmax = 0;
    for (let t = 0; t < 600; t += 0.2) {
      const r = run(p, t, far(p));
      assert.ok(Math.hypot(r.X - x0, r.Z - z0) < 3.4, `${p.model} strays to ${r.X}, ${r.Z}`);
      if (prev) vmax = Math.max(vmax, Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.2);
      prev = r;
    }
    assert.ok(vmax < 1.2, `pigeon speed ${vmax}`);
  }
});

test('the dog lies in a passage and the cat on a Hof bench; each answers the visitor by degrees', () => {
  const passages = lots().filter((l) => l.passage !== undefined && l.passage !== null);
  for (const d of of('dog')) assert.ok(passages.some((l) => inRect(passageRect(l), d.groups[1][0], d.groups[1][2], -0.2)), 'the dog is in a passage');
  for (const c of of('cat_tabby', 'cat_orange')) { assert.ok(yards().some((y) => inRect(y.rect, c.groups[1][0], c.groups[1][2])), 'the cat is in a Hof'); assert.ok(Math.abs(c.groups[1][1] - 0.5) < 0.02, 'on the seat'); }
  for (const a of of('dog', 'cat_tabby', 'cat_orange')) {
    const x = a.groups[1][0], z = a.groups[1][2], awayR = run(a, 5, [x + 40, 1.6, z]), nearR = run(a, 5, [x + 2, 1.6, z]);
    assert.notDeepEqual(awayR, nearR, `${a.model} notices a visitor at 2 m`);
  }
});

test('the canary hangs at the rail of a balcony, 5 m up, before an opened house', () => {
  const ups = lots().filter((l) => l.up && l.lod === 0);
  for (const c of of('cagebird')) {
    const [x, y, z] = c.groups[1];
    assert.ok(y > 5 && y < 6, 'at the rail');
    assert.ok(ups.some((l) => inRect(l.rect, x, z, 1.0)), 'at an opened house');
  }
});
