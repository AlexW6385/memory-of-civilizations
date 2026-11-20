// Angkor's critters (src/settlements/angkor/fauna.js; docs/settlements/angkor.md §34), expanded in Node as Suzhou's are (tests/suzhou-critters.test.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/settlements/angkor/fauna.js';
import { expandCritters } from '../src/engine/fauna-critters.js';
import { POSES } from '../src/engine/critter-poses.js';
import { MOAT, houses } from '../src/settlements/angkor/layout.js';
import { walkHouses } from '../src/settlements/angkor/walk.js';
import { frame } from '../src/styles/khmer/village.js';

const inst = expandCritters(data.critters, { id: 'angkor' });
const of = (...m) => inst.filter((i) => m.includes(i.model));
const at = (i) => i.groups[1];

test('the instances: every model is known, a modest number, and the fowl, dogs, cats and ducks of a village', () => {
  assert.ok(inst.length >= 10 && inst.length <= 40, `${inst.length} critters`);
  for (const i of inst) assert.ok(POSES[i.groups[0][0]], i.model);
  assert.ok(of('dog').length >= 1 && of('cat_orange').length >= 1 && of('rooster').length >= 1 && of('hen_brown', 'hen_white').length >= 2 && of('duck_brown').length >= 3);
});

test('ducks float on the moat water, between its banks', () => {
  for (const d of of('duck_brown', 'duck_white')) {
    const loop = d.groups[2], [cx, cz, ax] = loop;
    assert.ok(cx - ax > MOAT.outer[0] - 1 && cx + ax < MOAT.inner[0] + 1 && cz > MOAT.outer[1] && cz < MOAT.outer[3], `a loop at ${cx}, ${cz}`);
  }
});

test('yard animals stand outside every house and off the stair lane of the houses the visitor can enter', () => {
  const entered = walkHouses(8);
  for (const i of of('dog', 'cat_orange', 'rooster', 'hen_brown', 'hen_white')) {
    const [x, , z] = at(i);
    assert.ok(!houses().some((h) => x > h.rect[0] && x < h.rect[2] && z > h.rect[1] && z < h.rect[3]), `inside a house at ${x}, ${z}`);
    const h = entered.find((q) => Math.hypot(Math.max(q.rect[0] - x, 0, x - q.rect[2]), Math.max(q.rect[1] - z, 0, z - q.rect[3])) < 7);
    assert.ok(h, `no entered house near ${x}, ${z}`);
    const { W, hF } = frame(h.rect, h.front), o = W(0, hF), u = [W(1, hF)[0] - o[0], W(1, hF)[1] - o[1]];
    assert.ok(Math.abs((x - o[0]) * u[0] + (z - o[1]) * u[1]) > 1.4, `in the stair lane at ${x}, ${z}`);
  }
});
