// Every material of the palette can be made (a missing field in a spec stops a settlement from loading).
import test from 'node:test';
import assert from 'node:assert';
import { MATERIALS } from '../src/core/palette.js';
import { material } from '../src/engine/materials.js';

test('every palette material builds', () => {
  for (const key of Object.keys(MATERIALS)) {
    let m = null;
    try { m = material(key); } catch (e) { assert.fail(`${key}: ${e.message}`); }
    assert.ok(m && m.colorNode !== undefined || m.color, `${key}: made`);
  }
});
