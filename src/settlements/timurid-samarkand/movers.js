// Timurid Samarkand — the moving life (docs/settlements/timurid-samarkand.md §5, §10): scholars and students in long robes and
// white turbans crossing the Registan to the madrasa's pishtaq, merchants of the Silk Road in robes and sashes, women in long
// robes with a headcloth, porters with loads on their backs, water carriers with a jar, boys. No boats. Data for the engine's
// movers (src/engine/movers.js, read in its worker); the ways come from layout.js.

import { RADIUS, SQUARE, MADRASA, BAZAAR, CHORSU, GUR, built } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 36, night: 4, rain: 0.6, reach: 150, spawnMin: 28, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -1000,
};

/** The ways: the Registan, the madrasa's passage and court, the bazaar's streets and the chorsu, Gur-e Amir's court, and the lanes between the lots (cut where a house or monument stands). */
export function walkways() {
  const rects = [], links = [];
  const [x0, z0, x1, z1] = SQUARE, zm = (MADRASA[1] + MADRASA[3]) / 2;
  rects.push({ r: [x0 + 1, z0 + 1, x1 - 1, z1 - 1], weight: 2.6, market: 2.0, kind: 'street' });
  rects.push({ r: [-60, zm - 3, x0 + 1, zm + 3], weight: 1.6, market: 1.0, kind: 'street' });          // through the pishtaq
  rects.push({ r: [-106, -17, -60, 17], weight: 1.4, market: 0.6, kind: 'street' });                    // the madrasa's court
  rects.push({ r: [GUR.rect[0] + 15, GUR.rect[1] + 6, GUR.rect[2] - 15, GUR.rect[3] - 30], weight: 0.6, market: 0.2, kind: 'street' });
  rects.push({ r: [(GUR.rect[0] + GUR.rect[2]) / 2 - 3, GUR.rect[1] - 20, (GUR.rect[0] + GUR.rect[2]) / 2 + 3, GUR.rect[1] + 6], weight: 0.5, market: 0.2, kind: 'lane' });
  for (const { a, b } of BAZAAR) {
    const horiz = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]);
    rects.push({ r: horiz ? [Math.min(a[0], b[0]), a[1] - 2.2, Math.max(a[0], b[0]), a[1] + 2.2] : [a[0] - 2.2, Math.min(a[1], b[1]), a[0] + 2.2, Math.max(a[1], b[1])], weight: 2.0, market: 2.5, kind: 'street' });
  }
  rects.push({ r: [CHORSU.c[0] - 9, CHORSU.c[1] - 9, CHORSU.c[0] + 9, CHORSU.c[1] + 9], weight: 1.6, market: 2.4, kind: 'street' });
  // the lanes: centres at x, z ≡ −328 (mod 24), in 12 m pieces where nothing stands
  for (let k = 0; k < 28; k++) {
    const c = -328 + 24 * k;
    for (let t = -RADIUS + 36; t < RADIUS - 48; t += 12) {
      if (![t, t + 6, t + 12].every((q) => !built(c, q, 1.6)) || Math.hypot(c, t + 6) > RADIUS - 36) continue;
      rects.push({ r: [c - 1.8, t, c + 1.8, t + 12], weight: 0.45, market: 0.2, kind: 'lane' });
    }
    for (let t = -RADIUS + 36; t < RADIUS - 48; t += 12) {
      if (![t, t + 6, t + 12].every((q) => !built(q, c, 1.6)) || Math.hypot(t + 6, c) > RADIUS - 36) continue;
      rects.push({ r: [t, c - 1.8, t + 12, c + 1.8], weight: 0.45, market: 0.2, kind: 'lane' });
    }
  }
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', indigo: 'cloth_indigo', green: 'cloth_green', maroon: 'cloth_maroon' };
export const WALKERS = [
  // the scholar: a long robe, a sash, the white turban
  { id: 'scholar', weight: 1.4, market: 0.9, el: { dress: 'robe', hat: 'turban', hatMat: 'cloth_white', over: 'sash', arms: 'hang', hair: 'short', beard: true },
    c1: [CL.green, CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.95, 1.2], stride: 1.4 },
  // the merchant: a bright robe, a sash, a turban of ochre or white
  { id: 'merchant', weight: 1.5, market: 1.8, el: { dress: 'robe', hat: 'turban', hatMat: 'cloth_ochre', over: 'sash', arms: 'hang', hair: 'short', beard: true },
    c1: [CL.maroon, CL.green, CL.ochre, CL.indigo, CL.red], c2: [CL.white, CL.ochre, CL.red], c3: [CL.black], speed: [1.0, 1.3], stride: 1.45 },
  { id: 'woman', weight: 0.9, market: 1.1, el: { dress: 'robe', hat: 'veil', hair: 'long', over: 'none', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.white, CL.maroon, CL.black], c2: [CL.white], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.0, market: 1.4, el: { dress: 'robe', hat: 'cap', over: 'sash', carry: 'sack', arms: 'sack', hair: 'short', beard: true }, swing: 0.75,
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.brown, CL.ochre], c3: [CL.black], speed: [0.95, 1.2], stride: 1.15 },
  { id: 'carrier', weight: 0.6, market: 0.8, el: { dress: 'robe', hat: 'cap', over: 'sash', carry: 'pot', arms: 'head', hair: 'short', beard: true }, swing: 0.5,
    c1: [CL.brown, CL.indigo], c2: [CL.white], c3: [CL.black], speed: [0.8, 1.05], stride: 1.1 },
  { id: 'student', weight: 1.0, market: 0.5, el: { dress: 'robe', hat: 'turban', hatMat: 'cloth_white', over: 'sash', arms: 'hang', hair: 'short', beard: false },
    c1: [CL.white, CL.grey, CL.ochre], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.4], stride: 1.35 },
  { id: 'boy', weight: 0.5, market: 0.7, el: { dress: 'robe', hat: 'cap', over: 'none', arms: 'hang', hair: 'short', beard: false },
    c1: [CL.ochre, CL.indigo, CL.red], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
