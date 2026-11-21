// Ajanta's critters (src/settlements/ajanta/fauna.js, src/engine/fauna-critters.js; docs/settlements/ajanta.md §19): the models are known, no animal on the ground stands in a hut
// or in the door lane of an open one, the pets answer the visitor, the pigeons keep to their patch, the floaters stay in the river.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/ajanta/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES, context } from '../src/engine/critter-poses.js';
import { lots, inRect, riverX, RIVER, XF } from '../src/settlements/ajanta/layout.js';
import { openHouses, doorway } from '../src/settlements/ajanta/walk.js';

const inst = expandCritters(data.critters, { id: 'ajanta' });
const val = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.v]));
const run = (i, t, cam) => val(POSES[i.groups[0][0]](context(t, cam, i.groups)));
const far = (i) => [i.groups[1][0] + 70, 1.6, i.groups[1][2]];
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, nothing on the ground stands in a hut or in an open door\'s lane', () => {
  assert.ok(inst.length >= 20 && inst.length <= 45, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  const lanes = openHouses().map((h) => { const d = doorway(h), a = d.P(d.uc - 1.0, -4), b = d.P(d.uc + 1.0, 1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; });
  for (const i of inst) {
    if (i.groups[0][0] === undefined || i.model.startsWith('goose') || i.model.startsWith('duck')) continue;
    const [x, , z] = i.groups[1];
    assert.ok(!lots().some((l) => inRect(l.rect, x, z, 0.2)), `${i.model} in a hut at ${x}, ${z}`);
    assert.ok(!lanes.some((r) => inRect(r, x, z, 0)), `${i.model} in a door lane at ${x}, ${z}`);
  }
});

test('pigeons keep to their patch; cats, dogs, goats and hens answer the visitor', () => {
  for (const d of of('pigeon_grey').concat(of('pigeon_white'))) { const [x, , z] = d.groups[1]; for (let t = 0; t < 200; t += 0.5) { const r = run(d, t, far(d)); assert.ok(Math.hypot(r.X - x, r.Z - z) < 3.0, 'pigeon wandered'); if (x < XF + 8) assert.ok(r.X < XF + 5.6, 'pigeon over the ledge\'s kerb'); } }
  const pets = [...of('cat_tabby'), ...of('cat_orange'), ...of('dog'), ...of('goat_black'), ...of('goat_white')];
  assert.ok(pets.length >= 8);
  for (const p of pets) {
    const f = run(p, 10, far(p)), c = run(p, 10, [p.groups[1][0] + 1.5, 1.6, p.groups[1][2]]);
    for (const v of [...Object.values(f), ...Object.values(c)]) assert.ok(Number.isFinite(v), p.model);
    assert.notDeepEqual(f, c, `${p.model} answers the visitor`);
  }
  assert.ok(of('hen_brown').length >= 3 && of('rooster').length >= 2);
});

test('geese and ducks stay on the water; the kingfisher looks at the river', () => {
  const fl = inst.filter((i) => /goose|duck/.test(i.model));
  assert.ok(fl.length >= 3);
  for (const f of fl) {
    const loop = f.groups[2];
    assert.ok(loop && loop.every(Number.isFinite), 'a loop');
    for (let t = 0; t < 120; t += 1) { const r = run(f, t, far(f)); assert.ok(Math.abs(r.X - riverX(r.Z)) < RIVER.w / 2 - 0.2, `floater on the bank at ${r.X}, ${r.Z}`); }
  }
  const k = of('kingfisher')[0];
  assert.ok(k && Math.abs(k.groups[2][0] - riverX(k.groups[2][1])) < RIVER.w / 2);
});
