// Renaissance Florence — the moving life of the streets and squares (docs/settlements/florence.md §10):
// people walking the streets, the squares and the market by day. Data for the engine's movers
// (src/engine/movers.js), read in its worker (src/engine/movers-worker.js): the ways (from layout.js:
// the street pieces and the squares less the buildings standing in them), who walks (figures of
// src/objects/figures.js). No boats: the Arno at Florence was too shallow and too full of weirs for
// anything but the odd barge, left out.

import { walkRects, RADIUS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 5, rain: 0.6, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The streets and squares walked: { rects, links, clip }. */
export function walkways() { return { rects: walkRects(), links: [], clip: RADIUS - 14 }; }
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
// Quattrocento dress (dossier §10): merchants and officials in the lucco, the long gown, dark red,
// black or blue, with the soft cap (berretto); townsmen and craftsmen in the short tunic (giubbone)
// and coloured hose, the apron for the trades; women in the long gamurra with a shawl, the hair bound;
// porters with the carrying pole; boys; friars of the four orders (the Dominicans of Santa Maria
// Novella in white and black, the Franciscans of Santa Croce in brown). In the rain the cloak (cappa).
const CL = { black: 'cloth_black', red: 'cloth_red', blue: 'cloth_blue', indigo: 'cloth_indigo', brown: 'cloth_brown', white: 'cloth_white', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'merchant', weight: 1.2, market: 1.2, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang' }, wet: 'cloak',
    c1: [CL.red, CL.black, CL.blue, CL.maroon, CL.indigo], c2: [CL.black, CL.white], c3: [CL.red, CL.black, CL.blue], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'townsman', weight: 1.6, market: 1.6, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, wet: 'cloak',
    c1: [CL.ochre, CL.green, CL.brown, CL.blue, CL.grey, CL.red], c2: [CL.red, CL.blue, CL.white, CL.green, CL.black], c3: [CL.black, CL.brown, CL.red], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'woman', weight: 1.1, market: 1.4, el: { dress: 'robe', hair: 'bun', over: 'shawl', arms: 'hang' }, wet: 'cloak', swing: 0.7,
    c1: [CL.maroon, CL.green, CL.blue, CL.ochre, CL.red, CL.grey], c2: [CL.white, CL.white, CL.black], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'artisan', weight: 1.0, market: 0.8, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'apron', arms: 'hang' }, wet: 'cloak',
    c1: [CL.grey, CL.brown, CL.indigo, CL.ochre], c2: [CL.white, CL.brown, CL.grey], c3: [CL.brown, CL.black, CL.grey], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'porter', weight: 0.8, market: 1.3, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', carry: 'pole', arms: 'pole' }, wet: 'cloak', swing: 0.75,
    c1: [CL.grey, CL.brown, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.brown, CL.grey], speed: [1.0, 1.25], stride: 1.1, pole: true },
  { id: 'friar', weight: 0.5, market: 0.4, el: { dress: 'robe', hair: 'short', hat: 'none', over: 'sash', arms: 'hang' }, wet: 'cloak',
    c1: [CL.white, CL.brown, CL.grey], c2: [CL.black, CL.brown, CL.white], c3: [CL.black], speed: [0.95, 1.15], stride: 1.5 },
  { id: 'boy', weight: 0.45, market: 0.5, el: { dress: 'tunic', legs: 'hose', hair: 'short', arms: 'hang' },
    c1: [CL.ochre, CL.green, CL.red, CL.blue], c2: [CL.white, CL.red, CL.blue], c3: [CL.brown], speed: [1.2, 1.7], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};

/** The walkers' set (variants `${id}|${dry|wet}|${near|far}`) into the set builder sb. */
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet && k.wet === 'cloak') { el.over = 'cloak'; cape = 'cloth_brown'; }
    addFigure(sb, v, figure, el, { far, cape });
  }
}

/** No boats (kept for the engine's contract). */
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
