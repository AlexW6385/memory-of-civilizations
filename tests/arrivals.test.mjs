// Every settlement has its chosen arrival (DESIGN §4.4, "Arrival"): five numbers, y may be null.
import test from 'node:test';
import assert from 'node:assert';
import { SITES } from '../src/planet/sites.js';
import { ARRIVALS } from '../src/planet/arrivals.js';

test('every settlement has an arrival view, and only settlements do', () => {
  const ids = new Set(SITES.map((s) => s.id));
  for (const id of ids) {
    const a = ARRIVALS[id];
    assert.ok(a, `${id}: no arrival`);
    assert.strictEqual(a.length, 5, `${id}: [x, y, z, yaw, pitch]`);
    a.forEach((v, i) => assert.ok(i === 1 && v === null ? true : Number.isFinite(v), `${id}: value ${i}`));
    assert.ok(Math.abs(a[4]) < 1, `${id}: pitch`);
  }
  for (const id of Object.keys(ARRIVALS)) assert.ok(ids.has(id), `${id}: not a settlement`);
});
