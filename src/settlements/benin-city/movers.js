// Benin City about 1600 — the moving life (docs/settlements/benin-city.md §7–§8): people on the great street, the cross street, the
// king's square, in the Oba market and its aisles, in the guild lane and the lanes between the compounds. Edo men in the wrapper with the
// chest bare, chiefs in a long wrapper with coral beads, women in wrappers with a second cloth, porters with loads on the head, casters
// in the loincloth, palace pages with a staff, children. No boats. Data for the engine's movers (src/engine/movers.js, read in its
// worker); the format is Suzhou's and Taos's.

import { RADIUS, GREAT, CROSS, SQUARE, LANE, MARKET, STREETS_Z, ALLEYS_X, depth, inLot, inRect, lots } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, SLOT, LIMB, bounds } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 58, night: 5, rain: 0.5, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -1e3,
};

// ── the ways on foot ─────────────────────────────────────────────────────────
const free = (x, z) => depth(x, z) > 18 && !inLot(x, z, 0.5);
function runs(fixed, alongX, from, to) {
  const out = []; let a = null;
  for (let t = from; t <= to; t += 3) {
    const ok = alongX ? free(t, fixed) : free(fixed, t);
    if (ok && a === null) a = t;
    if ((!ok || t + 3 > to) && a !== null) { if (t - a >= 12) out.push([a, t - 3]); a = null; }
  }
  return out;
}
export function walkways() {
  const rects = [
    { r: [-RADIUS + 70, GREAT[1] + 5, RADIUS - 70, GREAT[3] - 5], weight: 3.4, market: 1.2, kind: 'street' },
    { r: [CROSS[0] + 4, -RADIUS + 70, CROSS[2] - 4, RADIUS - 70], weight: 2.6, market: 1.0, kind: 'street' },
    { r: [SQUARE[0] + 6, SQUARE[1] + 4, SQUARE[2] - 4, SQUARE[3] - 3], weight: 2.2, market: 1.0, kind: 'street' },
    { r: [LANE[0] + 1, LANE[1] + 2, LANE[2] - 1, LANE[3] + 36], weight: 1.6, market: 0.5, kind: 'lane' },
    { r: [MARKET[0] + 3, MARKET[1] + 3, MARKET[2] - 3, MARKET[3] - 3], weight: 1.8, market: 3.2, kind: 'street' },
  ];
  for (const zc of [-82, -52, -22, 8]) rects.push({ r: [MARKET[0] + 3, zc - 1.2, MARKET[2] - 3, zc + 1.2], weight: 3, market: 3.5, kind: 'street' });
  for (const z of STREETS_Z) for (const [a, b] of runs(z, true, -250, 250)) rects.push({ r: [a, z - 2.2, b, z + 2.2], weight: 1.0, market: 0.7, kind: 'lane' });
  for (const x of ALLEYS_X) for (const [a, b] of runs(x, false, -250, 250)) rects.push({ r: [x - 2, a, x + 2, b], weight: 0.9, market: 0.5, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 70 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
const CL = { white: 'cloth_white', indigo: 'cloth_indigo', red: 'cloth_red', ochre: 'cloth_ochre', blue: 'cloth_blue', green: 'cloth_green', maroon: 'cloth_maroon', brown: 'cloth_brown', black: 'cloth_black' };
export const WALKERS = [
  { id: 'man', weight: 1.8, market: 1.4, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'bare' }, c1: [CL.white, CL.indigo, CL.ochre, CL.blue, CL.white], c2: [CL.red, CL.white, CL.green], c3: [CL.black], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'woman', weight: 1.9, market: 1.7, el: { dress: 'wrap', hat: 'none', over: 'shawl', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7, c1: [CL.indigo, CL.red, CL.ochre, CL.green, CL.white, CL.maroon], c2: [CL.white, CL.ochre, CL.indigo], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'bearer', weight: 1.4, market: 1.6, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'basket', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5, c1: [CL.indigo, CL.ochre, CL.red, CL.white], c2: [CL.white, CL.red], c3: [CL.black], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.0, market: 1.3, el: { dress: 'loincloth', hat: 'none', carry: 'headload', arms: 'head', hair: 'short', feet: 'bare' }, c1: [CL.brown, CL.white, CL.ochre], c2: [CL.brown, CL.indigo], c3: [CL.black], speed: [0.95, 1.2], stride: 1.1 },
  { id: 'chief', weight: 0.5, market: 0.9, el: { dress: 'wrap', top: 'bare', hat: 'cap', hatMat: 'cloth_red', over: 'collar', arms: 'hang', hair: 'short', beard: false, feet: 'bare' }, c1: [CL.white, CL.white, CL.indigo], c2: [CL.red, CL.red, CL.maroon], c3: [CL.red], speed: [0.75, 0.95], stride: 1.15 },
  { id: 'page', weight: 0.7, market: 0.6, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'collar', carry: 'staff', len: 1.5, arms: 'staff', hair: 'short', feet: 'bare' }, c1: [CL.red, CL.white, CL.ochre], c2: [CL.white, CL.red], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'caster', weight: 0.6, market: 0.2, el: { dress: 'loincloth', hat: 'none', arms: 'hang', hair: 'short', feet: 'bare' }, c1: [CL.brown, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4, quarter: 'guild' },
  { id: 'child', weight: 0.7, market: 0.9, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'hang', hair: 'short', feet: 'bare' }, c1: [CL.ochre, CL.white], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};
const DARK = factor('skin', 'skin_dark');
/** Every figure's skin dark; bare legs given the stride of legs. */
function viaSkin(sb) {
  return {
    addPiece(v, group, g, o = {}) {
      if (group === 'skin' && o.slot === SLOT.skin) {
        const b = bounds(g), legs = b[4] < 1.02 && Math.max(Math.abs(b[0]), Math.abs(b[3])) < 0.2;
        o = { ...o, slot: SLOT.none, col: DARK };
        if (legs) o = { ...o, limb: LIMB.legs };
      } else if (group === 'skin') o = { ...o, col: DARK };
      return sb.addPiece(v, group, g, o);
    },
  };
}
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    addFigure(viaSkin(sb), v, figure, { ...k.el }, { far, cape: null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
void inRect; void lots;
