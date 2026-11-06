// The walker on stairs, terraces and low built surfaces (src/core/walk.js, src/core/collide.js):
// it climbs a flight laid over a stepped mass, steps up on to a low terrace with no floor of its own,
// and is still stopped by walls, by a wall standing across a stair, and by tall blocks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionWorld, topField } from '../src/core/collide.js';
import { move } from '../src/core/walk.js';
import { box } from '../src/core/geom.js';

/** Walk the feet toward (tx, tz) for up to `secs` seconds at walking pace; returns the feet. */
function walk(C, P, tx, tz, secs = 30) {
  for (let i = 0; i < secs * 60; i++) {
    const dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz);
    if (d < 0.05) break;
    const s = Math.min(d, 2 / 60);
    move(P, (dx / d) * s, (dz / d) * s, 1 / 60, C);
  }
  return P;
}
const world = async (parts, colliders) => {
  const C = new CollisionWorld();
  C.terrain = () => 0;
  C.add({ ...colliders, tops: await topField(parts.map((geometry) => ({ mat: 'stone', geometry }))) });
  return C;
};

/** A stepped mass 8 m high in 4 tiers, its obstacles solid, and a flight of treads up its south face over it
 *  (like a Maya pyramid: the tiers' ledges rise through the treads). */
async function pyramid({ wallOnStair = false } = {}) {
  const parts = [], floors = [], obstacles = [];
  for (let k = 0; k < 4; k++) {
    const a = 10 - k * 2, y0 = k * 2, y1 = y0 + 2;
    parts.push(box(-a, y0, -a, a, y1, a));
    obstacles.push({ poly: [[-a, -a], [a, -a], [a, a], [-a, a]], y0: y0 - 0.3, y1: y1 - 0.1 });
    floors.push({ rect: [-a + 2, -a + 2, a - 2, a - 2], y: y1 });
  }
  // the flight: 8 m up over 8.5 m, from z 10.5 (the foot) to z 2 (the top), treads as boxes
  for (let i = 0; i < 40; i++) {
    const z0 = 10.5 - (i + 1) * 8.5 / 40, y = (i + 1) * 0.2;
    parts.push(box(-1.5, y - 0.2, z0, 1.5, y, z0 + 8.5 / 40));
  }
  floors.push({ rect: [-1.5, 2, 1.5, 10.5], y: 0, y1: 8, dir: 'n' });
  if (wallOnStair) obstacles.push({ poly: [[-3, 6], [3, 6], [3, 6.3], [-3, 6.3]], y0: 0, y1: 12 });
  return world(parts, { floors, obstacles });
}

test('one climbs a stair laid over the tiers of a stepped mass, to the top', async () => {
  const C = await pyramid();
  const P = walk(C, { x: 0, y: 0, z: 14, vy: 0 }, 0, 0);
  assert.ok(Math.abs(P.z) < 0.2 && Math.abs(P.y - 8) < 0.05, `stopped at z ${P.z.toFixed(2)}, y ${P.y.toFixed(2)}`);
});

test('a wall standing across a stair still stops one', async () => {
  const C = await pyramid({ wallOnStair: true });
  const P = walk(C, { x: 0, y: 0, z: 14, vy: 0 }, 0, 0);
  assert.ok(P.z > 6.2, `walked through the wall to z ${P.z.toFixed(2)}`);
});

test('beside the stair the tiers still stand: one cannot walk up their faces', async () => {
  const C = await pyramid();
  const P = walk(C, { x: 6, y: 0, z: 14, vy: 0 }, 6, 0);
  assert.ok(P.z > 9.9 && P.y < 0.6, `climbed the tier to z ${P.z.toFixed(2)}, y ${P.y.toFixed(2)}`);
});

test('one steps up on to a low terrace with no floor of its own, but not on to a tall block', async () => {
  // a 0.4 m terrace (a causeway's top, a plinth) built as geometry with an obstacle and no floor; a 1.2 m block
  const parts = [box(-2, 0, -10, 2, 0.4, -2), box(4, 0, -10, 8, 1.2, -2)];
  const obstacles = [{ poly: [[-2, -10], [2, -10], [2, -2], [-2, -2]], y0: 0, y1: 0.4 }, { poly: [[4, -10], [8, -10], [8, -2], [4, -2]], y0: 0, y1: 1.2 }];
  const C = await world(parts, { floors: [], obstacles });
  const P = walk(C, { x: 0, y: 0, z: 2, vy: 0 }, 0, -6);
  assert.ok(Math.abs(P.z + 6) < 0.1 && Math.abs(P.y - 0.4) < 0.05, `on the terrace? z ${P.z.toFixed(2)}, y ${P.y.toFixed(2)}`);
  const Q = walk(C, { x: 6, y: 0, z: 2, vy: 0 }, 6, -6);
  assert.ok(Q.z > -1.75 && Q.y < 0.05, `climbed the block: z ${Q.z.toFixed(2)}, y ${Q.y.toFixed(2)}`);
});

test('a steep mound rising from the ground is not walked up', async () => {
  // rising 0.35 m every 0.25 m (54°) in thin slabs of built geometry, no floor, no obstacle: each
  // rise is within a step, the slope is not
  const parts = [];
  for (let s = 4; s > 0.2; s -= 0.25) { const h = 1.4 * (4.25 - s); parts.push(box(-s, h - 0.05, -s - 10, s, h, s - 10)); }
  const C = await world(parts, { floors: [], obstacles: [] });
  const P = walk(C, { x: 0, y: 0, z: 0, vy: 0 }, 0, -10);
  assert.ok(P.y < 1.5, `walked up the dome to y ${P.y.toFixed(2)}`);
});
