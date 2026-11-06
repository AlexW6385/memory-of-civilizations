// The city round the palace (docs/settlements/qing-beijing.md §6): the moat with its stone walls,
// the street round it and the avenue south from the Meridian Gate, the east–west lanes (hutong)
// and the north–south streets, and the grey-brick courtyard houses between the lanes, in plans of
// a few dozen each so that they build in turn.

import { RADIUS, LEVEL, MOAT, RING, AVENUE, lanes, houses } from './layout.js';

const R = RADIUS - 26;
const base = (id, elements) => ({ id, style: 'qing', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 215], facing: 'n' } });
function clip([x0, z0, x1, z1]) {
  const horiz = x1 - x0 > z1 - z0;
  if (horiz) { const z = Math.min(Math.abs(z0), Math.abs(z1)); if (z >= R) return null; const h = Math.sqrt(R * R - z * z); return [Math.max(x0, -h), z0, Math.min(x1, h), z1]; }
  const x = Math.min(Math.abs(x0), Math.abs(x1)); if (x >= R) return null; const h = Math.sqrt(R * R - x * x); return [x0, Math.max(z0, -h), x1, Math.min(z1, h)];
}

function streets() {
  const E = [];
  // the moat: water, its walls, the street round it
  const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
  for (const r of [[a0, b0, a1, d0], [a0, d1, a1, b1], [a0, d0, c0, d1], [c1, d0, a1, d1]]) E.push({ t: 'water_rect', rect: r, y: LEVEL.moat });
  for (const [p, q] of [[[a0, b0], [a1, b0]], [[a0, b1], [a1, b1]], [[a0, b0], [a0, b1]], [[a1, b0], [a1, b1]], [[c0, d0], [c1, d0]], [[c0, d1], [c1, d1]], [[c0, d0], [c0, d1]], [[c1, d0], [c1, d1]]]) {
    E.push({ t: 'canal_wall', a: p, b: q, y: 0.05, bed: LEVEL.moatBed, th: 0.8 });
    // a low wall of grey brick under a stone coping along each bank, open at the bridges' landings
    const open = p[1] === q[1] ? (p[1] > 0 ? [[-6 - p[0], 6 - p[0]]] : []) : [[65 - 4.6 - p[1], 65 + 4.6 - p[1]]];
    E.push({ t: 'low_wall', a: p, b: q, y: 0.05, h: 1.05, th: 0.5, open });
  }
  // the bridge over the moat on the axis, before the Meridian Gate, and at the side gates
  E.push({ t: 'ming_arch_bridge', at: [0, (b1 + d1) / 2], across: 'z', span: b1 - d1 + 0.6, width: 10, rise: 1.4, landing: 4, y: 0.04, water: LEVEL.moat, bed: LEVEL.moatBed, pal: { base: 'marble' } });
  E.push({ t: 'ming_arch_bridge', at: [(a0 + c0) / 2, 65], across: 'x', span: c0 - a0 + 0.6, width: 7, rise: 1.2, landing: 4, y: 0.04, water: LEVEL.moat, bed: LEVEL.moatBed, pal: { base: 'marble' } });
  E.push({ t: 'ming_arch_bridge', at: [(a1 + c1) / 2, 65], across: 'x', span: a1 - c1 + 0.6, width: 7, rise: 1.2, landing: 4, y: 0.04, water: LEVEL.moat, bed: LEVEL.moatBed, pal: { base: 'marble' } });
  // the band between the moat and the palace wall, paved
  for (const r of [[c0, d0, c1, -194], [c0, 179, c1, d1], [c0, -194, -116, 179], [116, -194, c1, 179]]) E.push({ t: 'lane', rect: r, y: 0.03 });
  // the ring street, the avenue, the lanes
  for (const r of [[RING[0], RING[1], RING[2], b0], [RING[0], b1, RING[2], RING[3]], [RING[0], b0, a0, b1], [a1, b0, RING[2], b1]]) E.push({ t: 'lane', rect: r, y: 0.03, mat: 'bluestone' });
  E.push({ t: 'lane', rect: clip(AVENUE), y: 0.04, mat: 'bluestone' });
  for (const l of lanes()) { const r = clip(l); if (r) E.push({ t: 'lane', rect: r, y: 0.02, mat: l[2] - l[0] < 20 ? 'bluestone' : 'brick_paving' }); }
  return base('qing-beijing-streets', E);
}

function courtyards() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 40) plans.push(base(`qing-beijing-houses-${i / 40}`, all.slice(i, i + 40).map((h) => ({ t: 'siheyuan', rect: h.rect, seed: h.seed }))));
  return plans;
}

export async function town() { return [streets(), ...courtyards()]; }
