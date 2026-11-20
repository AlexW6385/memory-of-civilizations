// Marinid Fez's critters (src/engine/fauna-critters.js; docs/settlements/fez.md §16.2): stepped in Node; the walkers stay where they are put (a lane, a court,
// a dukkan's cell), at an animal's pace, and none stands on a walk route.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/fez/fauna.js';
import { lots, inRect, SITES } from '../src/settlements/fez/layout.js';
import { houseList } from '../src/settlements/fez/houses.js';
import { planOf } from '../src/styles/marinid/house.js';
import { frame } from '../src/styles/mamluk/kit.js';
import bou from '../src/settlements/fez/plan.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';

const inst = expandCritters(data.critters, { id: 'fez' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t) => val(POSES[i.groups[0][0]](context(t, [i.groups[1][0] + 70, 1.6, i.groups[1][2]], i.groups)));
const bays = houseList().filter((h) => h.shops).flatMap((h) => { const fr = frame(h.rect, h.door); return planOf(h).bays.map((b) => { const r = fr.rect(b.u0 - 0.2, b.u1 + 0.2, -1.65, 0.2); return [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])]; }); });

test('Fez critters: martins, cats, fowl, pigeons, cages, all known models', () => {
  assert.ok(inst.length >= 30 && inst.length <= 80, inst.length + ' critters');
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  const n = (f) => inst.filter(f).length;
  assert.equal(n((i) => i.model === 'swallow_nest'), 2);
  assert.ok(n((i) => i.model.startsWith('cat')) >= 8 && n((i) => i.model.startsWith('pigeon')) >= 10 && n((i) => i.model === 'rooster') === 1 && n((i) => i.model === 'cagebird') >= 2);
  assert.ok(!inst.some((i) => i.model === 'dog' || i.model === 'crane'), 'no dogs among the dukkans, no garden crane');
});

test('Fez critters: never in a house but a dukkan\'s cell, clear of the walk routes, at an animal\'s pace', () => {
  const route = [...(bou.walks || [])].flatMap((w) => w.map((p) => p.slice(0, 2)));
  const L = lots();
  for (const i of inst) {
    if (i.model === 'cagebird' || i.model === 'swallow_nest') continue;
    let prev = null;
    for (let t = 0; t < 300; t += 0.5) {
      const r = run(i, t);
      const inHouse = L.some((l) => inRect(l.rect, r.X, r.Z)), inCell = bays.some((b) => inRect(b, r.X, r.Z));
      assert.ok(!inHouse || inCell, `${i.model} inside a house at ${r.X}, ${r.Z}`);
      assert.ok(!route.some((p) => Math.hypot(p[0] - r.X, p[1] - r.Z) < 1.2), `${i.model} on the route at ${r.X}, ${r.Z}`);
      if (prev) assert.ok(Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.5 < 2.5, i.model + ' speed');
      prev = r;
    }
  }
});

test('Fez critters: the nests hang under the hall canopy over the court; the cats answer the visitor by degrees', () => {
  const b = SITES.bou, nests = inst.filter((i) => i.model === 'swallow_nest');
  for (const i of nests) { const [x, y, z] = i.groups[1]; assert.ok(x > b[0] + 6 && x < b[2] - 6 && Math.abs(z - (b[3] - 9.6)) < 0.8, `nest at ${x}, ${z}`); }
  const c = inst.find((i) => i.model.startsWith('cat')), [x, y, z] = c.groups[1];
  const at = (px) => val(POSES[c.groups[0][0]](context(3, [px, y, z], c.groups)));
  const farR = at(x + 20), midR = at(x + 4.5), nearR = at(x + 1.5);
  assert.ok(farR.eye < 0.2 && nearR.eye > 0.9, 'eyes shut then open');
  assert.ok(farR.n1p > midR.n1p && midR.n1p > nearR.n1p, 'it wakes by degrees');
});
