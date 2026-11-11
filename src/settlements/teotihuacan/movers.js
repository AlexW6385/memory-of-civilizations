// Teotihuacan c. 450 — the moving life (docs/settlements/teotihuacan.md §14): men in the loincloth with the cloak (tilma)
// knotted at the shoulder, women in the wrapped skirt and the quechquemitl-like shawl, bearers with baskets and jars on the
// head or the back, traders, and priests in red capes and feathered caps on the Avenue of the Dead; boys. Data for the
// engine's movers (src/engine/movers.js, read in its worker): the ways come from layout.js (the avenue, the grid streets
// between the compounds, the market's lanes and gates). No boats.

import { RADIUS, AVENUE, KEEP_CLEAR, PALACE_CLEAR, MARKET, MARKET_PLATFORM, inRect } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 60, night: 4, rain: 0.5, reach: 170, spawnMin: 24, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

const S = 64, X0 = -RADIUS;
/** The streets of the grid (the 6 m gaps between the compounds' lots, on the lines x or z = −440 + 64 k), cut where a monument, the avenue's banks or the market stands. */
function streets() {
  const out = [], free = (x, z) => Math.hypot(x, z) < RADIUS - 16 && Math.abs(x) > 54 && !KEEP_CLEAR.some((k) => inRect(k, x, z, 5)) && !inRect(PALACE_CLEAR, x, z, 4) && !inRect(MARKET, x, z, 4);
  for (let k = 0; k * S + X0 <= RADIUS; k++) {
    const c = X0 + k * S;
    for (const horiz of [false, true]) {
      let a = null;
      for (let t = -RADIUS; t <= RADIUS + 2; t += 2) {
        const ok = t <= RADIUS && (horiz ? free(t, c) : free(c, t));
        if (ok && a === null) a = t;
        if ((!ok || t >= RADIUS) && a !== null) { if (t - a > 12) out.push({ r: horiz ? [a, c - 2.4, t - 2, c + 2.4] : [c - 2.4, a, c + 2.4, t - 2], weight: 0.9, market: 0.2, kind: 'street' }); a = null; }
      }
    }
  }
  return out;
}

/** The ways: the avenue and its plazas, the grid streets, the market's two lanes joined to the streets through its gates. */
export function walkways() {
  const cx = (MARKET[0] + MARKET[2]) / 2, cz = (MARKET[1] + MARKET[3]) / 2, rects = streets(), links = [];
  rects.push({ r: [AVENUE[0] + 10, -184, AVENUE[2] - 10, 392], weight: 2.2, market: 0.8, kind: 'street' });          // the Avenue of the Dead
  rects.push({ r: [MARKET[0] + 3, cz - 3.5, MARKET[2] - 3, cz + 3.5], weight: 3.2, market: 3, kind: 'street' });       // the market's lanes
  rects.push({ r: [cx - 3.5, MARKET[1] + 3, cx + 3.5, MARKET[3] - 3], weight: 3.2, market: 3, kind: 'street' });
  // out through the gates: to the street beyond each (the grid's lines z = 264 west and east, z = 136 north, z = 392 south)
  const L = (a, b, w = 2.2, weight = 1.4) => links.push({ a, b, w, kind: 'street', weight });
  L([MARKET[0] + 3, cz], [MARKET[0] - 58, cz]); L([MARKET[2] - 3, cz], [MARKET[2] + 14, cz]);
  L([cx, MARKET[1] + 3], [cx, 136]); L([cx, MARKET[3] - 3], [cx, 392]);
  void MARKET_PLATFORM;
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', green: 'cloth_green' };
// the commoners in the maxtlatl and the cloak of agave fibre (ixtle), barefoot; the elite in white cotton
export const WALKERS = [
  { id: 'man', weight: 2.2, market: 1.6, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'cape', hat: 'none', arms: 'hang', hair: 'long' },
    c1: [CL.white, CL.ochre, CL.brown, CL.white], c2: [CL.white, CL.ochre, CL.red], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'woman', weight: 2.2, market: 1.9, el: { dress: 'wrap', over: 'shawl', hat: 'none', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.red, CL.ochre, CL.white, CL.indigo], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'bearer', weight: 1.6, market: 2.0, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'none', carry: 'basket', arms: 'head', hair: 'long', hat: 'none' }, swing: 0.5,
    c1: [CL.ochre, CL.brown, CL.white], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.25 },
  { id: 'jar', weight: 1.2, market: 1.8, el: { dress: 'wrap', over: 'none', carry: 'pot', arms: 'head', hair: 'bun', hat: 'none', feet: 'bare' }, swing: 0.5,
    c1: [CL.ochre, CL.red, CL.white], c2: [CL.white], c3: [CL.white], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'trader', weight: 1.0, market: 1.8, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'none', carry: 'sack', arms: 'sack', hair: 'long', hat: 'none' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.15], stride: 1.3 },
  { id: 'priest', weight: 0.9, market: 0.3, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'cape', hat: 'cap', arms: 'hang', hair: 'long' },
    c1: [CL.white], c2: [CL.red, CL.red, CL.indigo], c3: [CL.green], speed: [0.8, 1.0], stride: 1.3 },
  { id: 'waterwife', weight: 0.7, market: 0.9, el: { dress: 'wrap', over: 'shawl', carry: 'pails', arms: 'pole', hair: 'bun', hat: 'none', feet: 'bare' }, swing: 0.5,
    c1: [CL.white, CL.ochre, CL.red], c2: [CL.white], c3: [CL.white], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'elder', weight: 0.6, market: 0.5, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'cape', carry: 'staff', arms: 'staff', hair: 'long', hat: 'none' },
    c1: [CL.white, CL.ochre], c2: [CL.white], c3: [CL.brown], speed: [0.6, 0.8], stride: 1.0 },
  { id: 'mother', weight: 0.6, market: 1.2, el: { dress: 'wrap', over: 'shawl', carry: 'child', hair: 'bun', hat: 'none', feet: 'bare' }, swing: 0.5,
    c1: [CL.red, CL.indigo, CL.white], c2: [CL.white], c3: [CL.ochre], speed: [0.75, 0.95], stride: 1.1, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.8, market: 1.4, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'none', carry: 'headload', arms: 'head', hair: 'long', hat: 'none' }, swing: 0.45,
    c1: [CL.ochre, CL.brown, CL.white], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.0], stride: 1.2 },
  { id: 'boy', weight: 0.6, market: 0.8, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'none', arms: 'hang', hair: 'long', hat: 'none' },
    c1: [CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
