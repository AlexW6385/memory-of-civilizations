// The automatic street life keeps clear of each settlement's arrival point (src/planet/arrivals.js): a visitor
// set down there must not stand inside a figure, a stall or a cart.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../src/objects/index.js';
import { lifePlans } from '../src/objects/life.js';
import { ARRIVALS } from '../src/planet/arrivals.js';

test('nothing of the street life stands within 2 m of the arrival point', () => {
  const G = { height: () => 0, waterLevel: () => NaN };
  for (const id of ['tang-wutai', 'djenne', 'angkor', 'venice']) {
    const [ax, , az] = ARRIVALS[id];
    // a dense town of small houses round the arrival point, and an open court over it
    const els = [];
    for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) if (Math.abs(i) > 0 || Math.abs(j) > 0) els.push({ t: 'house', rect: [ax + i * 9 - 3, az + j * 9 - 3, ax + i * 9 + 3, az + j * 9 + 3], front: 's' });
    const town = { id: 'h', style: 'life', origin: [0, 0], base: 0, yaw: 0, elements: els, rooms: [{ id: 'court', kind: 'open', rect: [ax - 20, az - 20, ax + 20, az + 20] }], bounds: [-300, -300, 300, 300] };
    const life = lifePlans(id, 300, [town], [], G).flatMap((p) => p.elements);
    assert.ok(life.length > 20, `${id}: ${life.length} things`);
    for (const e of life) {
      if (e.t === 'wash_line' || e.t === 'laundry_pole') continue;
      const d = Math.hypot(e.at[0] - ax, e.at[1] - az);
      assert.ok(d >= 2, `${id}: ${e.t} ${d.toFixed(2)} m from the arrival`);
    }
  }
});
