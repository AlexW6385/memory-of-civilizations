// The under-a-roof decision that switches rain, snow and dust off (src/engine/shelter.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { underRoof, openToSky } from '../src/engine/shelter.js';

// a 20 x 20 m field of 0.5 m cells: a roof at 4 m over x, z in [0, 10), open sky elsewhere
const field = (roofTop = 4) => {
  const w = 40, h = 40, data = new Float32Array(w * h).fill(-Infinity);
  for (let j = 0; j < 20; j++) for (let i = 0; i < 20; i++) data[j * w + i] = roofTop;
  return [{ x0: 0, z0: 0, res: 0.5, w, h, data }];
};

test('under a roof, with the roof all round, is sheltered', () => {
  assert.equal(underRoof(field(), 5, 1.7, 5), true);
});
test('in the open, or beside the roof, is not', () => {
  assert.equal(underRoof(field(), 15, 1.7, 15), false);
  assert.equal(underRoof(field(), 9.5, 1.7, 5), false);     // the roof's edge is within the ring of the eye
});
test('a top lower than the head is not a roof (a wall, a table)', () => {
  assert.equal(underRoof(field(1.9), 5, 1.7, 5), false);
  assert.equal(underRoof(field(2.3), 5, 1.7, 5), true);
});
test('no tops (the open country) is open', () => {
  assert.equal(underRoof([], 1, 1, 1), false);
  assert.equal(underRoof(undefined, 1, 1, 1), false);
});
test('rain falls on the visitor only in the open air: not in a closed room, not under a roof', () => {
  const tops = field();
  assert.equal(openToSky({ room: null }, tops, 15, 1.7, 15), true);
  assert.equal(openToSky({ room: { kind: 'open' } }, tops, 15, 1.7, 15), true);
  assert.equal(openToSky({ room: { kind: 'hall' } }, tops, 15, 1.7, 15), false);
  assert.equal(openToSky({ room: null }, tops, 5, 1.7, 5), false);
  assert.equal(openToSky({ room: { kind: 'open' } }, tops, 5, 1.7, 5), false);
});
