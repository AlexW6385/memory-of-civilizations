// The visitor's walk in Athens (docs/settlements/athens.md §18): from the arrival on the summit (the Parthenon's east front) west past the
// Promachos to the Propylaia, down the ramp, along the Panathenaic Way to the Agora, and through the Agora's stoas, shops and market to
// the Hephaisteion. Pure data and helpers (no three.js): the polylines the walk-check, the placing of street furniture and the sound map read.

import { frame } from '../../styles/greek/agora.js';
import { RAMP, WAY, SHOPROW, FOUNTAIN, height, pathAt } from './layout.js';

/** The walk, summit to Agora, as one polyline in world x, z (the Way read from the ramp's foot toward the Agora and on to the Dipylon). */
export const WALK = [
  [86.8, 36], [30, 30], [-60, 14], [-118, 0], [-148, 2], ...RAMP.slice(0, 3).reverse().map(([x, z]) => [x, z]).slice(1),
  ...WAY.slice().reverse().slice(1),
];
/** Distance (m) of a point from the walk. */
export function walkDist(x, z) {
  let best = Infinity;
  for (let i = 0; i + 1 < WALK.length; i++) {
    const a = WALK[i], b = WALK[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t));
  }
  return best;
}

const withY = (r) => { r.y0 = height(r[0][0], r[0][1]); return r; };
/** A route into a stoa's room k (the rooms' doors stand off the middle, 0.6 m from the room's start): from the street, through the colonnade, to the room's middle. */
function intoRoom(rect, front, n, rd, k, deep = true, wt = 0.7) {
  const F = frame(rect, front), rw = (F.L - 2 * wt) / n, vb = F.D - rd, u = wt + k * rw + 1.2;
  return [F.P(u, -3), F.P(u, 1.2), F.P(u, vb - 0.6), F.P(u, vb + 1.0), ...(deep ? [F.P(u + 0.9, vb + 1.8)] : [])];
}

/** The routes walk-check follows (world x, z; start on the ground of the first point): into the places the walk passes. */
export function walkRoutes() {
  const out = [];
  // the South Stoa's dining rooms, the shops under the south side, the fountain house
  out.push(withY(intoRoom([-262, -124.89, -219, -110], 'n', 8, 5.9, 1)));
  out.push(withY(intoRoom([-262, -124.89, -219, -110], 'n', 8, 5.9, 5)));
  for (const k of [0, 2, 3]) out.push(withY(intoRoom(SHOPROW, 'n', 5, 5.9, k, false)));
  { const F = frame(FOUNTAIN, 'n'); out.push(withY([F.P(F.L / 2, -3), F.P(F.L / 2, 1.0), F.P(F.L / 2, 3.2)])); }
  // the Tholos (door on the east, 18.3 m across), the Painted Stoa (through the colonnade to the panels), the Stoa of Zeus (from the east)
  out.push(withY([[-264, -133], [-271.5, -133], [-277, -133]]));
  { const F = frame([-252, -237.6, -204, -225], 's'); out.push(withY([F.P(12, -4), F.P(12, 3.0), F.P(12, 8.5), F.P(20, 8.5)])); }
  out.push(withY([[-276, -178], [-283.5, -172], [-288, -172]]));
  // the market: along an aisle between two rows of booths
  out.push(withY([[-234, -173.3], [-210, -173.3], [-186, -173.3]]));
  void pathAt;
  return out;
}
