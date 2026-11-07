// A sealed room (src/engine/world.js seal): from inside it, what lies wholly away from the
// building's sealed rooms and the other settlements are drawn by no camera; leaving it puts back
// each mesh's own layers.

import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three/webgpu';
import { World } from '../src/engine/world.js';
import { MID } from '../src/engine/layers.js';

test('a sealed room hides the town away from it, and leaving it puts the layers back', () => {
  const plan = { origin: [0, 0], yaw: 0, base: 0, rooms: [{ rect: [0, 0, 10, 10], y: 0, kind: 'hall', sealed: true }, { rect: [0, 20, 10, 30], y: 0, kind: 'open' }] };
  const box = (x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1).translate(x, 0, 5)); m.geometry.computeBoundingSphere(); return m; };
  const near = box(5), edge = box(45), far = box(300);
  far.layers.set(MID);
  const s = { state: 'ready', group: new THREE.Group().add(near, edge, far) };
  const other = { state: 'ready', group: new THREE.Group().add(box(0)) };
  const w = { settlements: [s, other] };
  World.prototype.seal.call(w, { plan, settlement: s });
  assert.equal(near.layers.mask, 1);
  assert.equal(edge.layers.mask, 1, 'within the margin: kept (what the doors show)');
  assert.ok(!(far.layers.mask & ((1 << MID) | 1)), 'far off: hidden');
  assert.ok(!(other.group.children[0].layers.mask & 1), 'another settlement: hidden');
  World.prototype.seal.call(w, null);
  assert.equal(far.layers.mask, 1 << MID);
  assert.equal(other.group.children[0].layers.mask, 1);
});
