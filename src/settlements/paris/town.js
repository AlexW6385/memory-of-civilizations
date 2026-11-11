import { openLots, lodTiles } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The houses of the Cité and the banks (docs/settlements/paris.md §5, §5a): timber-framed, jettied, gabled.
// The core (RICH) is built as `paris_house` of the gothic style in two levels (full near, the mass far); the outer
// rows and the two houses that can be entered stay the vernacular timber house.
import { RADIUS, RIVER, lots, streets } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -60], facing: 'w' } });
export const RICH = { c: [60, 0], r: 250 };
export const OPEN_MAX = 70;
const dist = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - 70, (l.rect[1] + l.rect[3]) / 2);
export function openSet() { const all = lots(), near = openLots(all, [ARRIVALS.paris[0], ARRIVALS.paris[2]], 2), s = new Set(near.keys()); all.filter((l) => rich(l) && l.rect[2] - l.rect[0] >= 5.0 && l.seed % 4 === 0 && !s.has(l)).sort((a, b) => dist(a) - dist(b)).slice(0, OPEN_MAX).forEach((l) => s.add(l)); return s; }
const rich = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - RICH.c[0], (l.rect[1] + l.rect[3]) / 2 - RICH.c[1]) < RICH.r;
export async function houses() {
  const all = lots(), plans = [], near = openLots(all, [ARRIVALS.paris[0], ARRIVALS.paris[2]], 2);
  // the shops and homes that can be entered: every fourth lot of the core by its seed, the nearest to the Grand Pont and the parvis first
  const open = new Map([...near]);
  all.filter((l) => rich(l) && l.rect[2] - l.rect[0] >= 5.0 && l.seed % 4 === 0 && !open.has(l))
    .sort((a, b) => dist(a) - dist(b)).slice(0, OPEN_MAX).forEach((l) => open.set(l, 'shop'));
  const core = all.filter((l) => rich(l)), rest = all.filter((l) => !core.includes(l));
  plans.push(...lodTiles('paris-houses', 'gothic', core.map((l) => ({ t: 'paris_house', y: RIVER.ground, foot: RIVER.ground, ...l, ...(open.has(l) ? { open: true } : {}) })), { near: 200, R: RADIUS, entrance: { at: [0, -60], facing: 'w' } }));
  for (let i = 0; i < rest.length; i += 160) plans.push(base(`paris-outer-${i / 160}`, rest.slice(i, i + 160).map((l) => ({ t: 'house_timber', y: RIVER.ground, foot: RIVER.ground, ...l, ...(open.has(l) ? { open: true, use: 'workshop' } : {}) }))));
  // the surfaces of the rues of the core, cut into pieces of 24 m (tiles of 100 m, full near, the crown and kerbs only far)
  const pieces = [], rand = lrng(1252);
  for (const r of streets()) {
    if (r[3] - r[1] > 8 || r[2] - r[0] < 10) continue;
    const zc = (r[1] + r[3]) / 2;
    for (let x = Math.max(r[0], -RICH.r + RICH.c[0]); x < Math.min(r[2], RICH.c[0] + RICH.r); x += 24) {
      const xe = Math.min(x + 24, r[2]);
      if (Math.hypot((x + xe) / 2 - RICH.c[0], zc - RICH.c[1]) < RICH.r - 20 && xe - x > 3) pieces.push({ t: 'rue', rect: [x, r[1], xe, r[3]], y: RIVER.ground, seed: Math.floor(rand() * 1e6) });
    }
  }
  plans.push(...lodTiles('paris-rues', 'gothic', pieces, { near: 90, R: RADIUS, entrance: { at: [0, -60], facing: 'w' } }));
  return plans;
}
function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
