// Sailendra Java, c. 825 — the moving life (docs/settlements/borobudur.md §15): pilgrims on the way from the east and
// round the monument's foot, monks between the monastery and the monument, villagers and farmers on the paths between
// the hamlets and the paddies. Data for the engine's movers (src/engine/movers.js), read in its worker: the ways (from
// layout.js), who walks. No boats. Format as Suzhou's (src/settlements/ming-suzhou/movers.js).

import { RADIUS, MONUMENT, MONASTERY, HAMLETS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 46, night: 3, rain: 0.5, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/**
 * The ways: the paved way from the east to the monument's foot, the path round the foot of the base (clear of the
 * stairs' lions), the monastery's gate road to the monument's west side, and a lane from each hamlet to the way.
 */
export function walkways() {
  const rects = [], R = (r, weight, kind = 'lane', market = 0) => rects.push({ r, weight, market, kind });
  const B = MONUMENT.base, o = B.a + B.p + B.foot + 3.2, w = 1.4;
  R([o + 6, -2, 300, 2], 2.4, 'street', 0.4);                                    // the paved way from the east
  R([-o, -o, o, -o + 2 * w], 1.2); R([-o, o - 2 * w, o, o], 1.2);               // the path round the monument's foot
  R([-o, -o, -o + 2 * w, o], 1.2); R([o - 2 * w, -o, o, o], 1.2);
  const [mx0, mz0, mx1, mz1] = MONASTERY, gz = (mz0 + mz1) / 2;
  R([mx1, gz - 1.5, -o, gz + 1.5], 1.0);                                          // from the monastery's gate (east wall) to the monument
  R([-o, gz - 1.5, -o + 2 * w, gz + 1.5], 1.0);
  R([mx0 + 11, gz - 1.5, mx1, gz + 1.5], 0.8);                                     // the monastery's yard
  for (const [hx, hz] of HAMLETS) {
    const horiz = Math.abs(hx) > Math.abs(hz);                                    // a lane from the hamlet's yard toward the way
    if (hx > 0 && Math.abs(hz) < 120) R([o + 6, Math.min(hz, 0) - 1, hx, Math.max(hz, 0) + 1], 0.6);
    else if (horiz) R([Math.min(hx, 0), hz - 1, Math.max(hx, 0), hz + 1], 0.35);
    else R([hx - 1, Math.min(hz, 0), hx + 1, Math.max(hz, 0)], 0.35);
  }
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Dress after the reliefs: the wrapped kain to the ankle, bare to the waist for the men at work, the topknot, the
// conical or plain hat of the field, monks in ochre with shaven heads; the cotton's plain colours.
const CL = { white: 'cloth_white', ochre: 'cloth_ochre', red: 'cloth_red', brown: 'cloth_brown', indigo: 'cloth_indigo', grey: 'cloth_grey', black: 'cloth_black', green: 'cloth_green' };
const SK = ['skin_medium', 'skin_dark'];
export const WALKERS = [
  { id: 'monk', weight: 1.2, market: 1.4, el: { dress: 'robe', hair: 'shaven', hat: 'none', arms: 'hang', feet: 'bare' },
    c1: [CL.ochre, CL.ochre, CL.red], c2: [CL.ochre], c3: [CL.black], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'pilgrim', weight: 1.6, market: 1.8, el: { dress: 'wrap', hair: 'bun', hat: 'none', arms: 'hang', feet: 'bare', carry: 'basket' },
    c1: [CL.white, CL.brown, CL.red, CL.indigo], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.9, 1.15], stride: 1.35 },
  { id: 'woman', weight: 1.2, market: 0.8, el: { dress: 'wrap', hair: 'bun', arms: 'hang', feet: 'bare' }, swing: 0.7,
    c1: [CL.red, CL.indigo, CL.brown, CL.white, CL.ochre], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'villager', weight: 1.0, market: 0.4, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'none', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.brown, CL.indigo], c2: [CL.white, CL.brown], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'farmer', weight: 1.2, market: 0.1, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'straw', arms: 'hang', feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'child', weight: 0.6, market: 0.5, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'none', arms: 'hang', feet: 'bare', child: true },
    c1: [CL.white, CL.red, CL.brown], c2: [CL.white], c3: [CL.black], speed: [1.0, 1.4], stride: 1.1, h: [0.95, 1.05] },
  { id: 'seller', weight: 1.1, market: 1.6, el: { dress: 'wrap', hair: 'bun', hat: 'none', carry: 'basket', arms: 'hang', feet: 'bare' }, swing: 0.6,
    c1: [CL.red, CL.indigo, CL.white, CL.ochre], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.85, 1.05], stride: 1.2, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.9, market: 0.8, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'none', carry: 'pole', arms: 'pole', feet: 'bare' }, swing: 0.75, pole: true,
    c1: [CL.brown, CL.white], c2: [CL.brown, CL.white], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
];
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'pull', feet: 'bare' }, c1: [CL.brown], c2: [CL.brown], c3: [CL.black] },
  passenger: { el: { dress: 'wrap', hair: 'short', pose: 'cross', feet: 'bare' }, c1: [CL.white], c2: [CL.white], c3: [CL.black] },
};
void SK; void CL.green;
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none */ }
