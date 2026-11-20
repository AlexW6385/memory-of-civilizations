// Tang Chang'an's critters (src/engine/fauna-critters.js; docs/settlements/tang-changan.md §20): the dogs lie and rise for the visitor, the
// cats sleep, the pigeons and the hens keep to their place, nothing stands inside a building or the ditch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/tang-changan/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lotAt, inDitch, inWard, WARDS, CRIT, marketYards, DACI_QUARTERS, DACI_MAIN, DACI_AX, PAGODA } from '../src/settlements/tang-changan/layout.js';

const inst = expandCritters(data.critters, { id: 'tang-changan' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (...m) => inst.filter((i) => m.includes(i.model));

test('the critters: known models, a small count, all in a ward and on dry ground', () => {
  assert.ok(inst.length >= 15 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) {
    assert.ok(POSES[i.groups[0][0]], i.model);
    const [x, , z] = i.groups[1];
    assert.ok(!inDitch(x, z), `${i.model} in the ditch`);
    assert.ok(inWard(x, z), `${i.model} outside the wards at ${x},${z}`);
    assert.ok(!lotAt(x, z, 0.2), `${i.model} inside a house lot at ${x},${z}`);
  }
  for (const q of DACI_QUARTERS) for (const i of inst) { const [x, , z] = i.groups[1]; assert.ok(!(Math.abs(x - q.c[0]) < 1 && Math.abs(z - q.c[1]) < 1), 'not at the centre of ' + q.id); }
});

test('the dogs: one at each ward crossing within reach, at the kitchen door and in the yards; they lie far off and stand near', () => {
  const dogs = of('dog');
  const wards = WARDS.filter((w) => !['daci\'en', 'daoist', 'market'].includes(w.kind) && Math.hypot(...w.c) <= CRIT);
  assert.ok(dogs.length >= wards.length + 1 + marketYards().filter((m) => m.kind === 'caravanserai').length);
  for (const d of dogs) {
    const lying = run(d, 10, far(d)), [x, y, z] = d.groups[1], up = run(d, 10, [x + 1.8, 1.6, z]);
    assert.ok(lying.lc > 0.7 && up.lc < 0.15, `dog at ${x},${z}: legs folded then straight (${lying.lc}, ${up.lc})`);
  }
});

test('the cats sleep and wake for the visitor; the cat on the platform is at the platform\'s height', () => {
  for (const c of of('cat_orange', 'cat_tabby')) {
    const [x, y, z] = c.groups[1], a = run(c, 20, far(c)), n = run(c, 20, [x + 1.2, 1.7, z]);
    assert.ok(a.eye < 0.2 && n.eye > 0.8, 'eyes shut then open');
    assert.ok(y >= 0 && y <= 0.8, 'height ' + y);
  }
});

test('pigeons and hens keep to their place and walk slowly', () => {
  for (const h of of('pigeon_grey', 'pigeon_white', 'pigeon_dark', 'rooster', 'hen_brown', 'hen_white')) {
    const [x, , z] = h.groups[1];
    let prev = null, vmax = 0;
    for (let t = 0; t < 600; t += 0.2) {
      const r = run(h, t, far(h));
      assert.ok(Math.hypot(r.X - x, r.Z - z) < 6, `${h.model} strays at ${t}: ${r.X - x}, ${r.Z - z}`);
      if (prev) vmax = Math.max(vmax, Math.hypot(r.X - prev.X, r.Z - prev.Z) / 0.2);
      prev = r;
    }
    assert.ok(vmax < 1.5, `${h.model} speed ${vmax}`);
  }
});

test('the pigeons scatter ahead of the visitor', () => {
  const [p] = of('pigeon_grey'), [x, , z] = p.groups[1], a = run(p, 30, far(p)), n = run(p, 30, [a.X + 1.0, 1.7, a.Z]);
  assert.ok(Math.hypot(n.X - a.X, n.Z - a.Z) > 0.3, 'it moves off');
  void x; void z; void DACI_MAIN; void DACI_AX; void PAGODA;
});
