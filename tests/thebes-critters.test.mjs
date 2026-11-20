// Thebes's critters (src/settlements/thebes/fauna.js; docs/settlements/thebes.md §15d), stepped through in Node as Suzhou's are (tests/suzhou-critters.test.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/thebes/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { lots, LAKE, QUAY } from '../src/settlements/thebes/layout.js';
import { doorPoint } from '../src/styles/newkingdom/doorsite.js';

const inst = expandCritters(data.critters, { id: 'thebes' });
const of = (...m) => inst.filter((i) => m.includes(i.model));
const at = (i) => i.groups[1];
const inLot = (x, z, m = 0) => lots().find((l) => x > l.rect[0] - m && x < l.rect[2] + m && z > l.rect[1] - m && z < l.rect[3] + m);

test('the instances: every model is known, a modest number, and none that Thebes has not', () => {
  assert.ok(inst.length >= 20 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('dog').length >= 2 && of('cat_tabby', 'cat_orange').length >= 2 && of('goose_grey').length >= 4 && of('pigeon_grey').length >= 4);
  assert.equal(of('crane', 'cormorant', 'fishing_craft', 'mandarin_drake', 'mandarin_hen', 'swallow_nest', 'duck_white', 'goose_white', 'cagebird').length, 0);
});

test('dogs and cats lie in the street at an entered door, outside the wall and clear of the doorway', () => {
  for (const i of of('dog', 'cat_tabby', 'cat_orange')) {
    const [x, , z] = at(i);
    assert.ok(!inLot(x, z, -0.05), `inside a lot at ${x}, ${z}`);
    const l = lots().find((q) => q.open && doorPoint(q) && Math.abs(doorPoint(q).x - x) < 4 && Math.abs(doorPoint(q).z - z) < 1);
    assert.ok(l, `no entered door near ${x}, ${z}`);
    const d = doorPoint(l);
    assert.ok(Math.abs(x - d.x) > d.w / 2 + 0.6, 'not in the doorway');
  }
});

test('hens scratch in the yard of a court house, and the cock with them in the first', () => {
  const hens = of('hen_brown', 'hen_white', 'rooster');
  assert.ok(hens.length >= 3 && of('rooster').length === 1);
  for (const h of hens) {
    const [x, , z] = at(h), l = inLot(x, z);
    assert.ok(l && l.kind === 'court' && l.open, `a hen outside a court at ${x}, ${z}`);
    const d = doorPoint(l), v = (z - d.z) * d.sg, W = l.rect[2] - l.rect[0];
    assert.ok(v > 1.2 && v < 4.6, `hen ${v} m into the lot`);
    assert.ok(x - l.rect[0] > 2.5 && x - l.rect[0] < W - 1.0);
  }
});

test('geese on the lake rim or the quay, never in the water', () => {
  for (const g of of('goose_grey')) {
    const [x, , z] = at(g), rim = x < LAKE[0] - 1.6 && x > LAKE[0] - 5.6 && z > LAKE[1] && z < LAKE[3], quay = x > QUAY.x + 1 && x < QUAY.x + QUAY.top;
    assert.ok(rim || quay, `a goose at ${x}, ${z}`);
  }
});
