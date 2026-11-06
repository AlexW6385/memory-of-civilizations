// plan-check's flood fill (tools/lib/reach.mjs) walks as the walker does (src/core/walk.js): it steps
// up on to low blocks and terraces with no floor of their own, not on to a block higher than a step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionWorld, topField } from '../src/core/collide.js';
import { box } from '../src/core/geom.js';
import { flood } from '../tools/lib/reach.mjs';
import { move } from '../src/core/walk.js';

const C = 0.25, X0 = -12, Z0 = -12, n = 96;
const sq = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

async function world() {
  const parts = [], obstacles = [];
  const block = (x0, z0, x1, z1, h) => { parts.push(box(x0, 0, z0, x1, h, z1)); obstacles.push({ poly: sq(x0, z0, x1, z1), y0: 0, y1: h }); };
  block(2, -2, 6, 2, 0.4);      // a low block: stepped on to
  block(2, 4, 6, 8, 0.4);       // a terrace in two steps of 0.4 m
  block(3, 5, 5, 7, 0.8);
  block(-6, -2, -2, 2, 0.9);    // too high for a step
  const cw = new CollisionWorld();
  cw.terrain = () => 0;
  cw.water = () => false;
  cw.add({ floors: [], obstacles, tops: await topField(parts.map((geometry) => ({ mat: 'stone', geometry }))) });
  return cw;
}
const at = (R, x, z) => { const k = Math.floor((z - Z0) / C) * n + Math.floor((x - X0) / C); return [R.first[k], ...(R.extra.get(k) || [])].filter((h) => h === h); };

test('plan-check steps on to low blocks and terraces, not on to high blocks', async () => {
  const R = flood(await world(), { X0, Z0, n, C, start: [0, undefined, 0] });
  assert.ok(R.started);
  assert.ok(at(R, 4, 0).some((h) => Math.abs(h - 0.4) < 1e-3), `low block reached: ${at(R, 4, 0)}`);
  assert.ok(at(R, 4, 6).some((h) => Math.abs(h - 0.8) < 1e-3), `terrace's upper step reached: ${at(R, 4, 6)}`);
  assert.deepEqual(at(R, -4, 0), [], 'the 0.9 m block is not climbed');
  assert.ok(at(R, 0, 10).length, 'open ground reached');
});

/** The walker's own feet after walking from (x, z) toward (tx, tz). */
function walk(cw, x, z, tx, tz) {
  const P = { x, y: 0, z, vy: 0 };
  for (let i = 0; i < 20 * 60; i++) {
    const dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz);
    if (d < 0.05) break;
    const s = Math.min(d, 2 / 60);
    move(P, (dx / d) * s, (dz / d) * s, 1 / 60, cw);
  }
  return P;
}

test('the walker agrees: low block and terrace climbed, high block not', async () => {
  const cw = await world();
  assert.ok(Math.abs(walk(cw, 0, 0, 4, 0).y - 0.4) < 1e-3);
  assert.ok(Math.abs(walk(cw, 4, 3, 4, 6).y - 0.8) < 1e-3);
  assert.ok(walk(cw, 0, 0, -4, 0).y < 0.01);
});
