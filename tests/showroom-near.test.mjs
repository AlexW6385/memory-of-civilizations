// tools/showroom.mjs --site builds only what is near the camera (tools/lib/near.mjs): the town's
// plans, which cover the whole disc, cut down to their elements within reach; landmarks whole.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extent, distance, nearPlans } from '../tools/lib/near.mjs';
import { MODULES } from '../src/settlements/grounds.js';

test('an element\'s extent comes from the points it is placed by', () => {
  assert.deepEqual(extent({ t: 'block', rect: [1, 2, 3, 4] }), [1, 2, 3, 4]);
  assert.deepEqual(extent({ t: 'x', at: [5, -1] }), [5, -1, 5, -1]);
  assert.deepEqual(extent({ t: 'x', a: [0, 0], b: [10, 2] }), [0, 0, 10, 2]);
  assert.deepEqual(extent({ t: 'x', pts: [[1, 1], [-2, 3]] }), [-2, 1, 1, 3]);
  assert.equal(extent({ t: 'x', dir: [1, 0] }), null);
  // a plan turned and moved: distances in the settlement's frame
  const plan = { origin: [100, 0], yaw: 90, base: 0 };
  assert.ok(distance(plan, [0, 0, 0, 0], 100, 0) < 1e-9);
});

test('the town is cut down to what is near; landmarks are kept whole', () => {
  const town = { plan: { id: 't', origin: [0, 0], yaw: 0, base: 0, bounds: [-400, -400, 400, 400], elements: [{ t: 'a', at: [10, 10] }, { t: 'b', rect: [300, 300, 310, 310] }, { t: 'c' }] } };
  const lm = { landmark: true, plan: { id: 'l', origin: [0, 0], yaw: 0, base: 0, bounds: [40, 40, 60, 60], elements: [{ t: 'd', at: [200, 200] }] } };
  const far = { landmark: true, plan: { id: 'f', origin: [0, 0], yaw: 0, base: 0, bounds: [300, 300, 320, 320], elements: [{ t: 'e', at: [310, 310] }] } };
  const r = nearPlans([town, lm, far], 0, 0, 80);
  assert.deepEqual(r.entries.map((e) => e.plan.id), ['t', 'l']);
  assert.deepEqual(r.entries[0].plan.elements.map((e) => e.t), ['a', 'c']);
  assert.equal(town.plan.elements.length, 3, 'the original plan is untouched');
  assert.equal(r.entries[1].plan.elements.length, 1);
  assert.deepEqual(nearPlans([town, lm, far], 0, 0, 80, 'all').entries.map((e) => e.plan.id), ['t']);
  assert.equal(nearPlans([town], 0, 0, 80, 'none').entries[0].plan.elements.length, 3);
});

test('a real settlement: a small reach builds a small share of it', async () => {
  const mod = await MODULES.athens();
  const all = [...mod.landmarks.map((p) => ({ plan: p.plan, landmark: true })), ...(await mod.town()).map((plan) => ({ plan }))];
  const r = nearPlans(all, 150, -150, 60);
  assert.ok(r.kept > 0 && r.kept < r.total / 5, `${r.kept} of ${r.total}`);
});
