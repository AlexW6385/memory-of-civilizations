// Ubirr's critters (src/settlements/kakadu/fauna.js; docs/settlements/kakadu.md §15.4), expanded in Node: known models, none that Arnhem Land had not.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/kakadu/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { MODELS } from '../src/engine/critter-models.js';
import { HOUSES, POOL, poolD } from '../src/settlements/kakadu/layout.js';

const inst = expandCritters(data.critters, { id: 'kakadu' });
const of = (...m) => inst.filter((i) => m.includes(i.model));

test('the instances: known models, a modest number, no hens, cats, pigeons or goats (not in Australia then)', () => {
  assert.ok(inst.length >= 20 && inst.length <= 70, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('dog').length >= 10 && of('goose_magpie').length >= 6 && of('duck_brown').length >= 4 && of('kingfisher').length >= 1);
  assert.equal(of('hen_brown', 'hen_white', 'rooster', 'pigeon_grey', 'cat_tabby', 'cat_orange', 'goat_black', 'goat_white', 'turkey', 'cagebird', 'cormorant', 'mandarin_drake').length, 0);
});

test('the magpie goose model builds (black and white, orange legs)', () => {
  const m = MODELS.goose_magpie();
  assert.ok(m.n > 200 && m.tris > 150, `${m.n} vertices`);
  const cols = new Set(); for (let i = 0; i < m.col.length; i += 3) cols.add([m.col[i], m.col[i + 1], m.col[i + 2]].map((v) => v.toFixed(2)).join(','));
  assert.ok(cols.has('0.06,0.06,0.07') && cols.has('0.95,0.94,0.90') && cols.has('0.92,0.55,0.14'));
});

test('geese stand on the margin, not in the water; dingoes lie outside the shelters', () => {
  for (const i of of('goose_magpie')) { const [x, , z] = i.groups[1]; assert.ok(poolD(x, z) > 1.0, `a goose in the water at ${x}, ${z}`); }
  for (const i of of('dog')) {
    const [x, , z] = i.groups[1];
    for (const H of HOUSES) assert.ok(Math.hypot(x - H.at[0], z - H.at[1]) > 2.3, `a dingo inside a shelter at ${x}, ${z}`);
  }
  void POOL;
});
