// The canal quarter round the garden (docs/settlements/ming-suzhou.md §6): streets of bluestone
// slabs beside the canals, houses of one and two storeys in rows — shops on the streets, homes
// with their backs on the water — granite canal walls with steps down to the water, humpbacked
// stone bridges, boats. Several plans (houses in their strips, the canals and streets), so that
// each builds in turn while the visitor already walks.

import { RADIUS, LEVEL, CANALS, STREETS, BRIDGES, lots, onBridge } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const R = RADIUS - 26;                                  // the town stops where the ground fades out
/** Clip a rectangle to the disc of radius r (keeps the part whose middle line lies inside). */
function clip([x0, z0, x1, z1], r = R) {
  const horiz = x1 - x0 > z1 - z0;
  if (horiz) { const z = Math.max(Math.abs(z0), Math.abs(z1)); if (z >= r) return null; const h = Math.sqrt(r * r - z * z); return [Math.max(x0, -h), z0, Math.min(x1, h), z1]; }
  const x = Math.max(Math.abs(x0), Math.abs(x1)); if (x >= r) return null; const h = Math.sqrt(r * r - x * x); return [x0, Math.max(z0, -h), x1, Math.min(z1, h)];
}
const base = (id, elements) => ({ id, style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 65], facing: 'n' } });

/** The streets, the canals with their walls and water, the bridges, steps and boats. */
function waterways() {
  const E = [], rand = rng(1606);
  for (const s of STREETS) { const r = clip(s); if (r) E.push({ t: 'paving', rect: r, y: LEVEL.street + 0.04, th: 0.3 }); }
  for (const c of CANALS) {
    const r = clip(c, R - 2);
    if (!r) continue;
    E.push({ t: 'water_rect', rect: r, y: LEVEL.canal });
    const horiz = r[2] - r[0] > r[3] - r[1];
    // the walls along both banks, broken where another canal joins
    const sides = horiz ? [[[r[0], r[1]], [r[2], r[1]]], [[r[0], r[3]], [r[2], r[3]]]] : [[[r[0], r[1]], [r[0], r[3]]], [[r[2], r[1]], [r[2], r[3]]]];
    for (const [a, b] of sides) {
      // pieces of the wall between the openings of the canals that cross this bank
      let pieces = [[horiz ? a[0] : a[1], horiz ? b[0] : b[1]]];
      for (const o of CANALS) {
        if (o === c) continue;
        const [o0, o1] = horiz ? [o[0], o[2]] : [o[1], o[3]];
        const touches = horiz ? (o[1] <= a[1] + 0.5 && o[3] >= a[1] - 0.5) : (o[0] <= a[0] + 0.5 && o[2] >= a[0] - 0.5);
        if (!touches) continue;
        pieces = pieces.flatMap(([p0, p1]) => (o1 <= p0 || o0 >= p1 ? [[p0, p1]] : [[p0, o0], [o1, p1]].filter(([q0, q1]) => q1 - q0 > 0.5)));
      }
      for (const [p0, p1] of pieces) E.push({ t: 'canal_wall', a: horiz ? [p0, a[1]] : [a[0], p0], b: horiz ? [p1, a[1]] : [a[0], p1], y: LEVEL.street + 0.05, bed: LEVEL.canalBed, th: 0.7 });
    }
    // steps down to the water every 25–40 m on the street side, and boats
    const len = horiz ? r[2] - r[0] : r[3] - r[1];
    for (let s = 12 + rand() * 10; s < len - 8; s += 25 + rand() * 15) {
      const at = (horiz ? r[0] : r[1]) + s;
      const p = horiz ? [at, r[1]] : [r[0] < 0 ? r[2] : r[0], at];
      if (onBridge(p[0], p[1], 3)) continue;
      if (horiz) E.push({ t: 'water_steps', a: [at - 1.1, r[1] + 0.35], b: [at + 1.1, r[1] + 0.35], dir: [0, 1], y: LEVEL.street, water: LEVEL.canal });
      else { const sx = r[0] < 0 ? r[2] - 0.35 : r[0] + 0.35; E.push({ t: 'water_steps', a: [sx, at - 1.1], b: [sx, at + 1.1], dir: [r[0] < 0 ? -1 : 1, 0], y: LEVEL.street, water: LEVEL.canal }); }
    }
    for (let s = 20 + rand() * 20; s < len - 10; s += 30 + rand() * 40) {
      const at = (horiz ? r[0] : r[1]) + s, cx = horiz ? at : (r[0] + r[2]) / 2, cz = horiz ? (r[1] + r[3]) / 2 + (rand() - 0.5) * 2.5 : at;
      if (onBridge(cx, cz, 4)) continue;
      const d = rand() < 0.5 ? 1 : -1;
      E.push({ t: 'boat', at: [cx + (horiz ? 0 : (rand() - 0.5) * 2), cz], dir: horiz ? [d, 0] : [0, d], len: 6 + rand() * 3, y: LEVEL.canal });
    }
  }
  for (const b of BRIDGES) {
    if (Math.hypot(...b.at) > R - 6) continue;
    E.push({ t: 'ming_arch_bridge', at: b.at, across: b.across, span: b.span + 0.4, width: b.width, rise: 2.4, landing: 4.6, y: LEVEL.street + 0.04, water: LEVEL.canal, bed: LEVEL.canalBed });
  }
  return base('ming-suzhou-waterways', E);
}

/** The houses, in plans of a few hundred each (by quadrant). */
function houses() {
  const all = lots(), plans = [];
  const quads = [[], [], [], []];
  for (const l of all) {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    quads[(cx > 0 ? 1 : 0) + (cz > 0 ? 2 : 0)].push(l);
  }
  quads.forEach((q, i) => {
    const E = q.map((l) => ({ t: 'house_jiangnan', rect: l.rect, y: LEVEL.street, front: l.front, storeys: l.storeys, shop: l.shop, water: l.water, seed: l.seed }));
    if (E.length) plans.push(base(`ming-suzhou-houses-${i}`, E));
  });
  return plans;
}

export async function town() {
  return [waterways(), ...houses()];
}
