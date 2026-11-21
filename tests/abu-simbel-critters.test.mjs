// Abu Simbel's critters (src/settlements/abu-simbel/fauna.js; docs/settlements/abu-simbel.md §21), expanded in Node as Giza's are.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/abu-simbel/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { lots } from '../src/settlements/abu-simbel/layout.js';

const inst = expandCritters(data.critters, { id: 'abu-simbel' });
const of = (...m) => inst.filter((i) => m.includes(i.model));

test('the instances: known models, a modest number, none that Abu Simbel had not (no hens, no pigeons)', () => {
  assert.ok(inst.length >= 18 && inst.length <= 60, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('dog').length >= 4 && of('goat_black', 'goat_white').length >= 3 && of('goose_grey', 'goose_white').length >= 3 && of('duck_brown', 'duck_white').length >= 2);
  assert.equal(of('hen_brown', 'hen_white', 'rooster', 'pigeon_grey', 'pigeon_white', 'pigeon_dark', 'turkey', 'cagebird', 'cormorant').length, 0);
});

test('dogs and cats of the lanes lie outside every wall', () => {
  const L = lots();
  for (const i of of('dog', 'cat_tabby', 'cat_orange')) {
    const [x, , z] = i.groups[1];
    assert.ok(!L.some((l) => x > l.rect[0] - 0.05 && x < l.rect[2] + 0.05 && z > l.rect[1] - 0.05 && z < l.rect[3] + 0.05), `inside a lot at ${x}, ${z}`);
  }
});
