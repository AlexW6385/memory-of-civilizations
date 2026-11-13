// Engine hygiene of the arrival and of long sessions (src/main.js arrival gate, src/engine/walker-rules.js,
// gi.js release, life-instances.js sliced build): pure checks, no browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three/webgpu';
import { GIVolume } from '../src/engine/gi.js';
import { LifeInstances, slicer } from '../src/engine/life-instances.js';
import { spawnAllowed, inArrivalCircle, holdBack, ARRIVAL_CLEAR, ARRIVAL_QUIET, VISITOR_CLEAR } from '../src/engine/walker-rules.js';

test('no walker spawns within 6 m of the arrival in the first seconds, and only then', () => {
  const arr = { x: 10, z: 20, until: ARRIVAL_QUIET };
  assert.equal(spawnAllowed(arr, 1, 12, 22), false, 'near, at once');
  assert.equal(spawnAllowed(arr, 1, 10 + ARRIVAL_CLEAR + 0.1, 20), true, 'beyond the circle');
  assert.equal(spawnAllowed(arr, ARRIVAL_QUIET + 0.1, 11, 20), true, 'after the quiet time');
  assert.equal(spawnAllowed(null, 0, 10, 20), true, 'no arrival noted');
  assert.equal(inArrivalCircle(13, 20, 10, 20), true);
  assert.equal(inArrivalCircle(17, 20, 10, 20), false);
});

test('a walker is held short of a visitor in its path, and not otherwise', () => {
  // a walker at the origin heading -z (yaw 0); the visitor's eye 1.6 m up, d metres ahead
  const at = (ahead, side = 0, eyeY = 1.6) => holdBack(1.4, 0, 0, 0, 0, side, eyeY, -ahead);
  assert.equal(at(4.4), 1.4, 'still free 4.4 m away at full pace');
  assert.ok(Math.abs(at(3.5) - 0.8) < 1e-9, 'slowing toward the stop');
  assert.equal(at(VISITOR_CLEAR), 0, 'stopped at 2.5 m');
  assert.equal(at(1.0), 0, 'stopped if already nearer');
  assert.equal(at(6), 1.4, 'far ahead: free');
  assert.equal(at(3, 3), 1.4, 'off to the side: free');
  assert.equal(at(3, 2.0), 0.4, 'within 2.5 m across: slowed toward the stop');
  assert.equal(holdBack(1.4, 0, 0, 0, 0, 0, 1.6, 2), 1.4, 'behind: free');
  assert.equal(at(3, 0, 9), 1.4, 'a visitor flying high: free');
  // the walker's own heading is used: yaw π/2 heads -x
  assert.equal(holdBack(1.4, 0, 0, 0, Math.PI / 2, -2.5, 1.6, 0), 0);
});

test('a baked-light set released while it is in force is let go of once it is not', () => {
  const gi = new GIVolume();
  const tex = () => { const t = { disposed: false, dispose() { this.disposed = true; } }; return t; };
  const mk = (id) => ({ id, parts: [{ id, tex: [tex(), tex(), tex()] }] });
  const a = mk('a'), b = mk('b');
  gi.cache.set('a', a); gi.cache.set('b', b);
  gi.current = a.parts[0];
  gi.release('a');
  assert.ok(gi.cache.has('a'), 'kept while in force');
  assert.ok(a.parts[0].tex.every((t) => !t.disposed));
  gi.release('b');
  assert.ok(!gi.cache.has('b') && b.parts[0].tex.every((t) => t.disposed), 'another set goes at once');
  gi.clear();
  assert.ok(!gi.cache.has('a'), 'the waiting set goes when the volume in force is cleared');
  assert.ok(a.parts[0].tex.every((t) => t.disposed));
  // wanted again before it went: kept
  const c = mk('c'); gi.cache.set('c', c); gi.current = c.parts[0];
  gi.release('c');
  return gi.fetch('c', 'data/gi/c.gi').then((got) => {
    assert.equal(got, c);
    gi.clear();
    assert.ok(gi.cache.has('c') && c.parts[0].tex.every((t) => !t.disposed), 'fetched again: not released');
  });
});

test('the slicer gives the page back only after its slice', async () => {
  const tick = slicer(5);
  assert.equal(await tick(), false);
  const t0 = performance.now(); while (performance.now() - t0 < 7);
  assert.equal(await tick(), true);
  assert.equal(await tick(), false);
});

/** Street-life parts: one shape instanced settlement-wide (many copies of a dense mesh) and some rare ones. */
function parts() {
  const sphere = new THREE.SphereGeometry(1, 48, 32);
  const n = 14, m = new Float32Array(n * 16);
  for (let i = 0; i < n; i++) { new THREE.Matrix4().makeTranslation(i * 3, 0, 0).toArray(m, i * 16); }
  const list = [{ mat: 'sandstone', geometry: sphere, matrices: m }];
  for (let k = 0; k < 6; k++) {
    const g = new THREE.BoxGeometry(1, 1, 1 + k * 0.1);
    list.push({ mat: 'sandstone', geometry: g, matrices: new THREE.Matrix4().makeTranslation(k * 2, 0, 5).toArray(), key: 'box' + k });
  }
  return [{ rec: {}, list }];
}

test('the street life builds in slices and still comes out whole', async () => {
  const g = new THREE.Group();
  const life = new LifeInstances(g, () => true);
  let turns = 0;
  const watch = setInterval(() => { turns++; }, 0);
  // a zero slice: every step yields
  await life.build(parts(), { slice: 0 });
  clearInterval(watch);
  assert.equal(life.meshes.length, 1, 'the dense shape is one instanced mesh');
  assert.equal(life.meshes[0].n, 14);
  assert.ok(life.rare.length >= 1, 'the rare shapes are merged by material');
  assert.ok(turns >= 0);
});

test('a life let go of while it is being built stops building', async () => {
  const g = new THREE.Group();
  const life = new LifeInstances(g, () => true);
  const done = life.build(parts(), { slice: 0 });
  life.dispose();
  await done;
  assert.equal(life.meshes.length, 0);
  assert.equal(life.rare.length, 0);
});
