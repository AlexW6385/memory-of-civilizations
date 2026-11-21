// Ur's critters (src/settlements/ur/fauna.js; docs/settlements/ur.md §27), stepped through in Node as Babylon's are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/ur/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { HARBOUR, inHouse } from '../src/settlements/ur/layout.js';
import { opened, doorPoint, doorClear } from '../src/settlements/ur/openwalk.js';

const inst = expandCritters(data.critters, { id: 'ur' });
const of = (...m) => inst.filter((i) => m.includes(i.model));
const at = (i) => i.groups[1];

test('the instances: every model is known, a modest number, none that Ur had not', () => {
  assert.ok(inst.length >= 12 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('dog').length >= 3 && of('goose_grey', 'goose_white').length >= 4 && of('pigeon_grey').length >= 4);
  assert.equal(of('cat_tabby', 'cat_orange', 'hen_brown', 'hen_white', 'rooster', 'turkey', 'cagebird', 'mandarin_drake', 'mandarin_hen').length, 0);
});

test('dogs stand in the lane outside the wall, beside an opened door and never in its lane', () => {
  for (const i of of('dog')) {
    const [x, , z] = at(i);
    assert.ok(!inHouse(x, z, 0.05), `inside a house at ${x}, ${z}`);
    const l = opened().find((q) => { const d = doorPoint(q); return Math.hypot(d.p[0] - x, d.p[1] - z) < 5; });
    assert.ok(l, `no opened door near ${x}, ${z}`);
    const r = doorClear(l);
    assert.ok(!(x > r[0] && x < r[2] && z > r[1] && z < r[3]), `in the door's lane at ${x}, ${z}`);
  }
});

test('geese behind the quay, ducks on the basin, the kingfisher over the water', () => {
  const [hx0, hz0, hx1, hz1] = HARBOUR.rect;
  for (const g of of('goose_grey', 'goose_white')) { const [x, y] = at(g); assert.ok(x > hx1 + 3 && Math.abs(y) < 0.1, `a goose at ${x}`); }
  const f = data.critters.find((c) => c.type === 'floaters');
  assert.ok(f.dist(hx0 + 30, -50) > f.margin + 1 && f.y === HARBOUR.water);
  const k = of('kingfisher')[0], w = data.critters.find((c) => c.model === 'kingfisher').water;
  assert.ok(k && w[0] < hx1 - 3 && w[0] > hx0 && w[1] > hz0 && w[1] < hz1);
});
