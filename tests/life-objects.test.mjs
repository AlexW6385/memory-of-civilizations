// The shared objects of life (src/objects/): the new and rebuilt pieces build, the life pass reads
// rotated plans as they are built, the ceremonial plazas get no stalls, boats float.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/objects/index.js';
import { boatFloat, LIFE_KINDS } from '../src/objects/index.js';
import { isMarketRoom, lifePlans } from '../src/objects/life.js';
import { buildPlan, toWorld } from '../src/core/build.js';

const plan = (elements) => ({ id: 't', style: 'life', origin: [0, 0], base: 0, yaw: 0, elements, rooms: [], bounds: [-50, -50, 50, 50], entrance: { at: [0, 0], facing: 'n' } });

test('wells, sledges, fowls, haystacks and washing lines build', () => {
  const els = [
    ...['windlass', 'pulley', 'shaduf', 'open'].flatMap((kind) => [{ t: 'well', kind, at: [0, 0], seed: 3 }, { t: 'well', kind, at: [5, 0], roof: true, square: true, seed: 4 }, { t: 'well', kind, at: [9, 0], mould: true, seed: 5 }]),
    ...['casks', 'bales', 'empty'].flatMap((load) => [{ t: 'sledge', load, at: [0, 9], seed: 1 }, { t: 'sledge', load, beast: 'horse', at: [4, 9], seed: 2 }]),
    { t: 'chickens', at: [0, 15], n: 6, seed: 7 }, { t: 'haystack', at: [5, 15], seed: 1 }, { t: 'haystack', at: [9, 15], seed: 2 },
    { t: 'laundry', at: [0, 20], seed: 1 }, { t: 'laundry', at: [0, 24], seed: 2, len: 4 },
  ];
  assert.ok(LIFE_KINDS.includes('sledge'));
  for (const el of els) { const b = buildPlan(plan([el])); assert.ok(b.parts.length > 0, `${el.t} ${el.kind ?? el.load ?? ''} builds nothing`); }
});

test('a boat floats with its sheer above the water', () => {
  for (const kind of ['rowboat', 'canoe', 'sampan', 'gondola', 'dhow', 'barge', 'reed', 'ferry']) {
    const f = boatFloat(kind) + 0.3;            // the sheer amidships stands 0.3 above the boat's y
    assert.ok(f >= 0.18 && f <= 0.75, `${kind}: freeboard ${f}`);
  }
});

test('the ceremonial plazas hold no market; the market squares do', () => {
  assert.equal(isMarketRoom('teotihuacan', { id: 'plaza' }), false);
  assert.equal(isMarketRoom('chichen-itza', { id: 'plaza' }), false);
  assert.equal(isMarketRoom('tenochtitlan', { id: 'precinct' }), false);
  assert.equal(isMarketRoom('machu-picchu', { id: 'sacred-plaza' }), false);
  assert.equal(isMarketRoom('athens', { id: 'agora' }), true);
  assert.equal(isMarketRoom('florence', { id: 'piazza' }), true);
  assert.equal(isMarketRoom('amsterdam', { id: 'dam' }), true);
  assert.equal(isMarketRoom('florence', { id: 'courtyard-square' }), false);
  assert.equal(isMarketRoom('teotihuacan', { id: 'plaza', market: true }), true);
  assert.equal(isMarketRoom('athens', { id: 'agora', market: false }), false);
  assert.equal(isMarketRoom('x', { id: 'adamant' }), false);
});

test('the life pass reads a turned plan as it is built', () => {
  // houses on a plan turned a quarter, all on one side of its axis: the things by their doors and in the
  // streets must stand round the houses where they are built, not round their mirror image
  const G = { height: () => 0, waterLevel: () => NaN };
  const house = { id: 'h', style: 'life', origin: [20, 0], base: 0, yaw: 90, elements: Array.from({ length: 24 }, (_, i) => ({ t: 'house', rect: [10 + (i % 3) * 18, -40 + Math.floor(i / 3) * 10, 22 + (i % 3) * 18, -34 + Math.floor(i / 3) * 10] })), rooms: [], bounds: [-100, -100, 100, 100] };
  const rects = house.elements.map((e) => { const a = toWorld(house, e.rect[0], e.rect[1]), b = toWorld(house, e.rect[2], e.rect[3]); return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; });
  const out = lifePlans('athens', 120, [], [house], G).flatMap((p) => p.elements);
  assert.ok(out.length > 8, `${out.length} objects`);
  const dist = ([x, z]) => Math.min(...rects.map(([x0, z0, x1, z1]) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1))));
  const inside = out.filter((e) => rects.some(([x0, z0, x1, z1]) => e.at[0] > x0 + 0.2 && e.at[0] < x1 - 0.2 && e.at[1] > z0 + 0.2 && e.at[1] < z1 - 0.2));
  assert.deepEqual(inside.map((e) => e.t), [], 'objects inside the houses');
  const far = out.filter((e) => dist(e.at) > 10);
  assert.deepEqual(far.map((e) => `${e.t} ${e.at.map((v) => v.toFixed(1))}`), [], 'objects far from every house');
});
