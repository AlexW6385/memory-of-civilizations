// Stonehenge about 2500 BC (docs/settlements/stonehenge.md §1–§4): the stones as data, each set in
// the ground where it stands. The sarsen circle of 30 uprights carries a continuous ring of curved
// lintels whose tops are level; within it the bluestone circle, the five trilithons in a horseshoe
// open to the north-east, the bluestone horseshoe and the Altar Stone; out on the axis the
// Slaughter Stone and its partner at the entrance and the Heel Stone; the four Station Stones.
// +x east, +z south; the axis runs to the north-east (AXIS).

import { height, AXIS, HEEL, STATIONS } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rand = rng(2500);
const ax = Math.cos(AXIS), az = Math.sin(AXIS);
/** From the monument's frame (u along the axis toward the north-east, v across it) to plan x, z. */
const P = (u, v) => [u * ax - v * az, u * az + v * ax];
const E = [];
const Y0 = height(0, 0);
const stone = (at, yaw, o) => E.push({ t: 'standing_stone', at, y: height(at[0], at[1]), yaw, seed: Math.floor(rand() * 1e9), ...o });

// ── the sarsen circle: 30 uprights 4.1 m high, 2.1 m wide, 1.1 m thick on a ring 31 m across, the
// entrance gap on the axis; the lintels' tops level at 4.9 m above the middle of the circle ──
const R = 15.55, TOP = Y0 + 4.1;
for (let i = 0; i < 30; i++) {
  const a = AXIS + (i + 0.5) / 30 * Math.PI * 2, at = [Math.cos(a) * R, Math.sin(a) * R];
  const narrow = i === 19;                                    // Stone 11, in the south-west: half as wide
  const y = height(at[0], at[1]);
  // pick-dressed all over on the north-east, toward the Avenue; elsewhere only the inner faces, the backs left in
  // their crust and its lichens (§1c)
  const rel = Math.abs(Math.atan2(Math.sin(a - AXIS), Math.cos(a - AXIS))), ne = rel < 1.25;
  const tool = { faces: ne ? 'all' : 'inner', lichen: ne ? 0 : 14 };
  E.push({ t: 'standing_stone', at, y, top: TOP, yaw: a, w0: narrow ? 1.05 : 1.95 + rand() * 0.2, w1: narrow ? 1.1 : 2.15 + rand() * 0.15, d0: 1.05 + rand() * 0.1, d1: 1.0, dress: 1, rough: 0.035, bury: 1.3, mat: 'granite_rough', tool, seed: Math.floor(rand() * 1e9) });
}
E.push({ t: 'lintel_ring', c: [0, 0], r: R, n: 30, a0: AXIS + 0.5 / 30 * Math.PI * 2, y: TOP, w: 1.0, h: 0.8, mat: 'sandstone_white', seed: 7 });      // the lintels worked all over (§1c)

// ── the five trilithons in a horseshoe 13.7 m across, rising to the Great Trilithon in the south-west ──
const TRI = [[-104, 6.0], [-52, 6.5], [0, 7.3], [52, 6.5], [104, 6.0]];
const UC = -0.8, RU = 6.2, RV = 6.2;
for (const [deg, h] of TRI) {
  const th = deg * Math.PI / 180, u = UC - RU * Math.cos(th), v = RV * Math.sin(th);
  // the tangent of the horseshoe at this point: the trilithon faces the centre of the horseshoe
  const tu = RU * Math.sin(th), tv = RV * Math.cos(th), L = Math.hypot(tu, tv), du = tu / L, dv = tv / L;
  const half = 1.32;
  const pa = P(u + du * half, v + dv * half), pb = P(u - du * half, v - dv * half), c = P(u, v);
  const yaw = Math.atan2(c[1] - P(UC, 0)[1], c[0] - P(UC, 0)[0]);    // the face toward the horseshoe's centre
  const yc = Math.max(height(pa[0], pa[1]), height(pb[0], pb[1]));
  const top = Y0 + h - 1.0;
  for (const p of [pa, pb]) E.push({ t: 'standing_stone', at: p, y: height(p[0], p[1]), top, yaw, w0: 2.25, w1: 2.0, d0: 1.25, d1: 1.15, dress: 1, rough: 0.04, bury: h > 7 ? 2.4 : 1.8, mat: 'granite_rough', tenon: true, tool: { faces: deg === 0 ? 'all' : 'inner', lichen: deg === 0 ? 0 : 8 }, seed: Math.floor(rand() * 1e9) });
  E.push({ t: 'lintel', a: P(u + du * (half + 1.2), v + dv * (half + 1.2)), b: P(u - du * (half + 1.2), v - dv * (half + 1.2)), y: top, w: 1.1, h: 1.0, mat: 'sandstone_white', seed: Math.floor(rand() * 1e9), ground: yc });
}

// ── the bluestones: a circle of about 60 pillars between the sarsen circle and the horseshoe ──
for (let i = 0; i < 60; i++) {
  if (rand() < 0.08) continue;
  const a = AXIS + (i + 0.5) / 60 * Math.PI * 2 + (rand() - 0.5) * 0.02, r = 11.6 + (rand() - 0.5) * 0.4, at = [Math.cos(a) * r, Math.sin(a) * r];
  const w = 0.55 + rand() * 0.45, h = 1.6 + rand() * 0.6;
  stone(at, a + (rand() - 0.5) * 0.3, { h, w0: w, w1: w * (0.7 + rand() * 0.2), d0: 0.45 + rand() * 0.2, d1: 0.38, rough: 0.05, bury: 0.8, cap: rand() < 0.5 ? 'round' : 'peak', mat: 'dolerite_spotted' });
}
// the bluestone horseshoe: 19 dressed pillars rising toward the south-west, within the trilithons
for (let k = 0; k < 19; k++) {
  const th = (-1 + k / 9) * 108 * Math.PI / 180, u = -0.6 - 4.4 * Math.cos(th), v = 4.2 * Math.sin(th), at = P(u, v);
  const h = 1.9 + 0.5 * Math.cos(th * 0.9);
  stone(at, Math.atan2(at[1] - P(-0.6, 0)[1], at[0] - P(-0.6, 0)[0]), { h, w0: 0.55, w1: 0.5, d0: 0.45, d1: 0.42, dress: 1, rough: 0.015, bury: 0.9, cap: 'round', mat: 'dolerite_spotted' });
}
// the Altar Stone, 4.9 m of greenish sandstone, lying before the Great Trilithon across the axis
{ const at = P(-3.8, 0); E.push({ t: 'standing_stone', at, y: height(at[0], at[1]), yaw: AXIS, lying: true, h: 4.9, w0: 1.0, w1: 1.0, d0: 0.53, d1: 0.5, rough: 0.03, dress: 1, bury: 0.12, mat: 'sandstone_green', seed: 41 }); }

// ── at the entrance: the Slaughter Stone and its partner, standing; the Heel Stone, unshaped and leaning in ──
for (const v of [-3.2, 2.4]) { const at = P(47 + (v > 0 ? 0.4 : 0), v); stone(at, AXIS, { h: v > 0 ? 4.0 : 3.6, w0: 2.1, w1: 1.9, d0: 0.95, d1: 0.85, rough: 0.06, bury: 1.2, mat: 'granite_rough' }); }
{ const at = P(HEEL.d, 0.6); stone(at, AXIS + 0.25, { h: 4.9, w0: 2.6, w1: 1.4, d0: 2.3, d1: 1.4, rough: 0.16, bury: 1.6, cap: 'peak', lean: [-0.38, 0.05], natural: true, mat: 'rock_boulder', tool: { faces: 'none', lichen: 70 } }); }
// the Station Stones: small undressed sarsens, two on their mounds
for (const s of STATIONS) stone(s.at, AXIS + rand() * 0.5, { h: s.n === 91 ? 2.7 : s.n === 93 ? 1.3 : 1.6, w0: s.n === 91 ? 1.6 : 1.1, w1: 0.8, d0: 0.8, d1: 0.6, rough: 0.1, bury: 0.8, cap: 'round', natural: true, mat: 'rock_boulder', tool: { faces: 'none', lichen: 30 } });

export const henge = {
  id: 'stonehenge-henge',
  name: { en: 'Stonehenge', zh: '巨石阵' },
  era: { en: 'Neolithic Britain, about 2500 BC', zh: '新石器时代不列颠，约公元前2500年' },
  style: 'neolithic',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [40, -40], facing: 'w' },
  bounds: [-62, -62, 62, 62],
  view: [-19, -19, 19, 19],
  bakeTop: 10,
  elements: E,
  rooms: [{ id: 'circle', rect: [-14, -14, 14, 14], y: Y0, kind: 'open' }],
  walks: [Object.assign([[40, -40], [18, -18], [0, 0]], { y0: height(40, -40) })],
};
export default henge;
