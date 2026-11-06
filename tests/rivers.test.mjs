// The great rivers of the open country (src/planet/rivers.js): water along their courses, and none
// through a settlement's disc.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLand, coastAt } from '../src/planet/land.js';
import { initRelief, natural, BUILT } from '../src/planet/relief.js';
import { RIVERS, riverAt } from '../src/planet/rivers.js';

const buf = readFileSync(new URL('../data/planet/land.bin', import.meta.url));
const W = buf.readUInt32LE(8), H = buf.readUInt32LE(12), W2 = buf.readUInt32LE(16), H2 = buf.readUInt32LE(20), sc = buf.readFloatLE(24);
const b = gunzipSync(buf.subarray(32));
setLand({ W, H, W2, H2, scale: sc, sdf: b.subarray(0, W * H), climate: b.subarray(W * H) });
initRelief();

test('the ten great rivers and the Euphrates are laid, with water along them on land', () => {
  const names = new Set(RIVERS.map((r) => r.name));
  for (const n of ['Nile', 'Tigris', 'Euphrates', 'Indus', 'Ganges', 'Yangtze', 'Yellow River', 'Danube', 'Rhine', 'Amazon', 'Mississippi']) assert.ok(names.has(n), n);
  let land = 0, wet = 0;
  for (const s of RIVERS) { const u = s.a; if (coastAt(u) > 0) { land++; if (natural(u).h < 0) wet++; } }
  assert.ok(wet >= land * 0.95, `water at ${wet} of ${land} river points on land`);
});

test('no river runs through a settlement disc', () => {
  for (const S of BUILT) {
    const e = S.enu;
    for (let a = 0; a < 48; a++) for (const r of [0, 0.5, 0.9]) {
      const x = Math.cos(a / 48 * 6.283) * S.radius * r, z = Math.sin(a / 48 * 6.283) * S.radius * r;
      const p = [0, 1, 2].map((i) => e.o[i] + e.x[i] * x + e.z[i] * z), l = Math.hypot(...p);
      const rv = riverAt(p.map((v) => v / l));
      assert.ok(!rv || rv.d > rv.half, `${rv?.name} through ${S.id}`);
    }
  }
});
