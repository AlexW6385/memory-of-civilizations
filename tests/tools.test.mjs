// The checking tools themselves: tools/surface-check.mjs finds what it should, on a plan made for it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/styles/oldkingdom/index.js';
import { check } from '../tools/surface-check.mjs';

test('surface check: coplanar faces of one depth rank, and elements that do not build', () => {
  // sandstone, marble and silver share a depth rank, as do sandstone_floor and marble_floor
  const plan = {
    id: 'surface-test', style: 'oldkingdom', origin: [3, -2], base: 0, yaw: 90, rooms: [], bounds: [-50, -50, 50, 50], entrance: { at: [0, 0], facing: 'n' },
    elements: [
      { t: 'block', rect: [0, 0, 4, 4], y0: 0, y1: 2, mat: 'sandstone' },
      { t: 'block', rect: [2, 1, 6, 3], y0: 0, y1: 2, mat: 'marble' },
      { t: 'block', rect: [1, 0, 3, 5], y0: 0.5, y1: 2.005, mat: 'silver' },             // 5 mm: still within EPS
      { t: 'block', rect: [10, 10, 12, 12], y0: 0, y1: 1, mat: 'sandstone' },
      { t: 'block', rect: [10, 10, 12, 13], y0: 0, y1: 1.5, mat: 'sandstone' },          // one material: no fight
      { t: 'block', rect: [20, 20, 22, 22], y0: 0, y1: 1, mat: 'sandstone' },
      { t: 'block', rect: [20, 20, 22, 22], y0: 1.05, y1: 2, mat: 'marble' },         // 5 cm apart: none
      { t: 'floor', rect: [-10, -10, -2, -2], y: 0.3, mat: 'sandstone_floor' },
      { t: 'floor', rect: [-6, -6, 0, 0], y: 0.3, mat: 'marble_floor' },
      { t: 'no-such-element', rect: [0, 0, 1, 1] },
    ],
  };
  const { coplanar, errors } = check(plan);
  const got = Object.fromEntries([...coplanar].map(([k, r]) => [k, +r.area.toFixed(2)]));
  assert.deepEqual(got, {
    'floor:marble_floor × floor:sandstone_floor': 15,
    'block:sandstone × block:silver': 10.5,
    'block:marble × block:sandstone': 3.75,
    'block:marble × block:silver': 2,
  });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /element 9 \(no-such-element\) does not build/);
});
