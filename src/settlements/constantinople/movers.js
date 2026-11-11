// Constantinople about 562 — the moving life (docs/settlements/constantinople.md §10, §13): people walking the
// Mese between its porticoes, crossing the Augustaion and the Forum of Constantine, in the dress of the time:
// men in the belted tunic with hose, officials in the long robe and cloak, clergy in black, women in the robe
// with the head-cloth, porters and market women with baskets, boys. Data for the engine's movers
// (src/engine/movers.js), read in its worker; the ways come from layout.js. No boats (the sea is not shown).

import { RADIUS, MESE, AUGUSTAION, FORUM, lots, xl, zl, PX, PZ, LANE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 56, night: 5, rain: 0.6, reach: 170, spawnMin: 24, far: 48 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the Mese's four legs (its middle, between the porticoes), the Augustaion, the Forum's floor. */
export function walkways() {
  const rects = [], P = MESE.path, w = 4.4;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1];
    rects.push(ax === bx ? { r: [ax - w, Math.min(az, bz) - w, ax + w, Math.max(az, bz) + w], weight: 4, market: 3, kind: 'street' }
      : { r: [Math.min(ax, bx) - w, az - w, Math.max(ax, bx) + w, az + w], weight: 4, market: 3, kind: 'street' });
  }
  const [x0, z0, x1, z1] = AUGUSTAION;
  rects.push({ r: [x0 + 30, z0 + 8, x1 - 6, z1 - 16], weight: 2.5, market: 1.5, kind: 'street' });
  rects.push({ r: [-100, 104, -60, 118], weight: 2, market: 2, kind: 'street' });
  rects.push({ r: [FORUM.c[0] - 26, FORUM.c[1] - 26, FORUM.c[0] + 26, FORUM.c[1] + 26], weight: 1.5, market: 1.5, kind: 'street' });
  rects.push({ r: [-60, 40, -50, 108], weight: 0.8, market: 0.5, kind: 'street' });
  // the lanes between the rows of houses (only where houses stand on them), the quieter ways
  const seen = new Set();
  for (const l of lots()) {
    if (Math.hypot(l.rect[0], l.rect[1]) > 300) continue;
    for (const r of [[xl(l.k) - 2, zl(l.j) + 2.5, xl(l.k) + 2, zl(l.j) + 32.5], [xl(l.k + 1) - 2, zl(l.j) + 2.5, xl(l.k + 1) + 2, zl(l.j) + 32.5], [xl(l.k) + 2.5, zl(l.j) - 1.8, xl(l.k + 1) - 2.5, zl(l.j) + 1.8], [xl(l.k) + 2.5, zl(l.j + 1) - 1.8, xl(l.k + 1) - 2.5, zl(l.j + 1) + 1.8]]) {
      const key = r.map(Math.round).join(',');
      if (!seen.has(key)) { seen.add(key); rects.push({ r, weight: 0.45, market: 0.2, kind: 'street' }); }
    }
  }
  void PX; void PZ; void LANE;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'citizen', weight: 2.4, market: 1.5, el: { dress: 'tunic', legs: 'hose', hat: 'none', over: 'belt', arms: 'hang' },
    c1: [CL.brown, CL.ochre, CL.grey, CL.green, CL.white], c2: [CL.brown, CL.grey, CL.ochre], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'official', weight: 0.8, market: 0.5, el: { dress: 'robe', hat: 'none', over: 'collar', arms: 'hang' },
    c1: [CL.white, CL.indigo, CL.green], c2: [CL.white, CL.red], c3: [CL.white], speed: [0.8, 1.0], stride: 1.3 },
  { id: 'clergy', weight: 0.7, market: 0.3, el: { dress: 'robe', hat: 'none', over: 'none', arms: 'hang' },
    c1: [CL.black], c2: [CL.black], c3: [CL.black], speed: [0.8, 1.0], stride: 1.25 },
  { id: 'woman', weight: 1.7, market: 1.8, el: { dress: 'robe', hat: 'veil', over: 'none', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.ochre, CL.indigo, CL.maroon, CL.brown], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.9, market: 1.6, el: { dress: 'tunic', legs: 'hose', hat: 'cap', over: 'belt', arms: 'hang', carry: 'basket' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'merchant', weight: 0.8, market: 2.2, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang' },
    c1: [CL.indigo, CL.green, CL.maroon, CL.ochre], c2: [CL.red, CL.white], c3: [CL.red], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.5, market: 0.7, el: { dress: 'tunic', legs: 'bare', hat: 'none', arms: 'hang' },
    c1: [CL.brown, CL.ochre, CL.white], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    addFigure(sb, v, figure, { ...k.el }, { far, cape: null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
