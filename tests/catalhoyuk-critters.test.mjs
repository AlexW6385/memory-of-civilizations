// Çatalhöyük's critters (src/settlements/catalhoyuk/fauna.js, src/engine/fauna-critters.js; docs/settlements/catalhoyuk.md §14.4): the models are known,
// the animals are those of the plain c. 6500 BC, none stands in a house's mass, the pens hold their flocks, the ducks are on the pools.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/catalhoyuk/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { PENS, POOLS, KIND, TOP, colX, rowZ, CW, CD, inRect } from '../src/settlements/catalhoyuk/layout.js';

const inst = expandCritters(data.critters, { id: 'catalhoyuk' });
const of = (m) => inst.filter((i) => i.model === m);

test('every model is known, the count is small, the animals are those of c. 6500 BC', () => {
  assert.ok(inst.length >= 25 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  for (const m of ['dog', 'goat_white', 'goat_black', 'duck_brown', 'goose_grey', 'swallow_nest']) assert.ok(of(m).length > 0, m);
  assert.ok(!inst.some((i) => /cat_|hen|rooster|cormorant|turkey|cagebird|pigeon/.test(i.model)), 'nothing not yet kept or not of the plain');
});

test('on the ground nothing stands inside a house (the roofs are for the dogs on them)', () => {
  for (const i of inst) {
    if (['swallow_nest'].includes(i.model) || /duck/.test(i.model)) continue;
    const [x, y, z] = i.groups[1];
    for (let a = 0; a < KIND.length; a++) for (let b = 0; b < KIND[0].length; b++) {
      if (KIND[a][b] !== 'h' && KIND[a][b] !== 'L') continue;
      if (inRect([colX(b), rowZ(a), colX(b) + CW[b], rowZ(a) + CD[a]], x, z, 0.1)) assert.ok(KIND[a][b] === 'L' || Math.abs(y - (TOP[a][b] + 0.09)) < 0.05, `${i.model} inside a house at ${x}, ${z}`);
    }
  }
});

test('the flocks are in the pens, the ducks on the pools', () => {
  for (const g of [...of('goat_white'), ...of('goat_black')]) { const [x, , z] = g.groups[1]; assert.ok(PENS.some((p) => inRect(p.rect, x, z, -0.5)), `a goat at ${x}, ${z}`); }
  assert.ok(of('duck_brown').length >= 4);
  for (const d of of('duck_brown')) { const [x, , z] = [d.groups[2][0], 0, d.groups[2][1]]; assert.ok(POOLS.slice(0, 4).some(([cx, cz, a, b]) => ((x - cx) / a) ** 2 + ((z - cz) / b) ** 2 < 1), `a duck loop centred off the pools at ${x}, ${z}`); }
});
