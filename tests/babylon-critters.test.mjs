// Babylon's critters (src/settlements/babylon/fauna.js; docs/settlements/babylon.md §21), stepped through in Node as Suzhou's and Thebes' are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/babylon/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { lots, QUAY, RIVER, riverX } from '../src/settlements/babylon/layout.js';
import { opened, doorPoint, doorClear } from '../src/settlements/babylon/openwalk.js';

const inst = expandCritters(data.critters, { id: 'babylon' });
const of = (...m) => inst.filter((i) => m.includes(i.model));
const at = (i) => i.groups[1];
const inLot = (x, z, m = 0) => lots().find((l) => x > l.rect[0] - m && x < l.rect[2] + m && z > l.rect[1] - m && z < l.rect[3] + m);

test('the instances: every model is known, a modest number, none that Babylon had not', () => {
  assert.ok(inst.length >= 15 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('dog').length >= 3 && of('goose_grey', 'goose_white').length >= 4 && of('pigeon_grey').length >= 4 && of('rooster').length === 1);
  assert.equal(of('cat_tabby', 'cat_orange', 'cormorant', 'fishing_craft', 'mandarin_drake', 'mandarin_hen', 'swallow_nest', 'cagebird', 'turkey').length, 0);
});

test('dogs and hens stand in the lane outside the wall, beside an opened door and never in its lane', () => {
  for (const i of of('dog', 'hen_brown', 'hen_white', 'rooster')) {
    const [x, , z] = at(i);
    assert.ok(!inLot(x, z, -0.05), `inside a lot at ${x}, ${z}`);
    const l = opened().find((q) => { const d = doorPoint(q); return Math.hypot(d.p[0] - x, d.p[1] - z) < 5; });
    assert.ok(l, `no opened door near ${x}, ${z}`);
    const r = doorClear(l);
    assert.ok(!(x > r[0] && x < r[2] && z > r[1] && z < r[3]), `in the door's lane at ${x}, ${z}`);
  }
});

test('geese on the quay walk, ducks on the river, the kingfisher over the water', () => {
  for (const g of of('goose_grey', 'goose_white')) { const [x, y, z] = at(g); assert.ok(x - riverX(z) > QUAY.d0 && x - riverX(z) < QUAY.d1 && Math.abs(y - QUAY.y) < 0.1, `a goose at ${x}, ${z}`); }
  const f = data.critters.find((c) => c.type === 'floaters');
  assert.ok(f.dist(riverX(-80), -80) < -f.margin - 1 && f.y === RIVER.level);
  const k = of('kingfisher')[0];
  assert.ok(k && Math.abs(at(k)[0] - riverX(at(k)[2])) < RIVER.w / 2 + 2);
});
