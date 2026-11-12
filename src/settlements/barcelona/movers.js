// Barcelona about 1910 — the moving life (docs/settlements/barcelona.md §7): people on the Eixample's pavements and at its crossings,
// in the dress of the city of 1910 — gentlemen in dark suits and felt hats, women in long skirts and wide-brimmed hats, workmen in
// jackets and caps with the red sash (faixa), priests in black, errand boys, porters with sacks. Data for the engine's movers
// (src/engine/movers.js, read in its worker). The ways: the pavements along the streets' kerbs (planes stand 7–8.3 m from a street's
// middle, the houses' faces 11 m), which cross the roadways at every junction, so walkers cross the tram tracks only there.
// No boats (no water is shown).

import { RADIUS, PITCH, GRACIA_X, SAGRADA, onDiagonal } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 60, night: 8, rain: 0.6, reach: 160, spawnMin: 14, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

const LIM = RADIUS - 60;
/** The ways: a pavement strip along each side of every street of the grid (2.3 m wide, clear of the planes), joined where they cross. */
export function walkways() {
  const rects = [], P0 = 8.6, P1 = 10.7;
  const cuts = (c, lo, hi, vertical) => {
    // the strip in pieces that keep off the Diagonal's cut and the temple's works (the Marina's pavement stays: the façade is looked at from it)
    const out = []; let s = lo;
    for (let t = lo; t <= hi; t += 4) {
      const [x, z] = vertical ? [c, t] : [t, c];
      const bad = onDiagonal(x, z, 16);
      if (bad) { if (t > s + 8) out.push([s, t - 4]); s = t + 4; }
    }
    if (hi > s + 8) out.push([s, hi]);
    return out;
  };
  for (let i = -5; i <= 4; i++) {
    const c = i * PITCH + PITCH / 2;
    if (Math.abs(c) > LIM) continue;
    const passeig = Math.abs(c - GRACIA_X) < 1, marina = Math.abs(c - 230) < 1;
    for (const [a, b] of cuts(c, -LIM, LIM, true)) for (const sg of [-1, 1]) {
      const x0 = c + sg * P0, x1 = c + sg * P1;
      rects.push({ r: [Math.min(x0, x1), a, Math.max(x0, x1), b], weight: passeig ? 3.2 : marina ? 2.4 : 1, market: passeig ? 2 : 1, kind: 'street' });
    }
  }
  for (let k = -5; k <= 4; k++) {
    const c = k * PITCH + PITCH / 2;
    if (Math.abs(c) > LIM) continue;
    for (const [a, b] of cuts(c, -LIM, LIM, false)) for (const sg of [-1, 1]) {
      const z0 = c + sg * P0, z1 = c + sg * P1;
      rects.push({ r: [a, Math.min(z0, z1), b, Math.max(z0, z1)], weight: Math.abs(c - PITCH / 2) < 1 ? 1.6 : 1, market: 1.2, kind: 'street' });
    }
  }
  void SAGRADA;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon', blue: 'cloth_blue' };
export const WALKERS = [
  // the gentleman: a dark suit, a felt hat (a bowler or a soft one), a beard or a moustache
  { id: 'gentleman', weight: 1.7, market: 1.6, el: { dress: 'trousers', hat: 'brim', arms: 'hang', hair: 'short', beard: 0.7 },
    c1: [CL.black, CL.grey, CL.brown, CL.indigo], c2: [CL.black, CL.grey], c3: [CL.black, CL.black, CL.grey, CL.brown], speed: [1.0, 1.3], stride: 1.45 },
  // the lady: the long skirt, the blouse, a large hat over the piled hair, a shawl in the cool hours
  { id: 'lady', weight: 1.4, market: 1.7, el: { dress: 'robe', hat: 'brim', arms: 'hang', hair: 'bun', over: 'shawl' }, swing: 0.7,
    c1: [CL.white, CL.maroon, CL.indigo, CL.grey, CL.green, CL.ochre], c2: [CL.white, CL.grey], c3: [CL.white, CL.black, CL.maroon, CL.ochre], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  // the workman: jacket and trousers, the flat cap, the red sash (faixa) round the waist
  { id: 'workman', weight: 1.7, market: 1.0, el: { dress: 'trousers', hat: 'cap', over: 'sash', arms: 'hang', hair: 'short', beard: 0.3 },
    c1: [CL.indigo, CL.brown, CL.grey, CL.blue, CL.black], c2: [CL.red, CL.red, CL.black, CL.maroon], c3: [CL.black, CL.grey, CL.brown, CL.red], speed: [1.15, 1.45], stride: 1.4 },
  // the woman of the quarter: a dark skirt, an apron, a shawl over the head
  { id: 'housewife', weight: 1.2, market: 1.5, el: { dress: 'robe', hat: 'veil', over: 'apron', arms: 'hang', hair: 'bun' }, swing: 0.6,
    c1: [CL.black, CL.grey, CL.brown, CL.indigo, CL.maroon], c2: [CL.white, CL.grey], c3: [CL.black, CL.grey, CL.brown], speed: [0.9, 1.15], stride: 1.2, h: [0.9, 0.96] },
  // the porter with a sack on the shoulder
  { id: 'porter', weight: 0.8, market: 0.8, el: { dress: 'trousers', hat: 'cap', over: 'sash', carry: 'sack', arms: 'sack', hair: 'short', beard: 0.4 },
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.red, CL.black], c3: [CL.black, CL.brown], speed: [0.95, 1.2], stride: 1.1 },
  // the priest: the black cassock, the broad flat hat
  { id: 'priest', weight: 0.35, market: 0.7, el: { dress: 'robe', hat: 'brim', arms: 'hang', hair: 'short', over: 'none' },
    c1: [CL.black], c2: [CL.black], c3: [CL.black], speed: [0.9, 1.1], stride: 1.3 },
  // the errand boy / newspaper seller: short trousers, a cap
  { id: 'boy', weight: 0.6, market: 1.0, el: { dress: 'trousers', hat: 'cap', arms: 'hang', hair: 'short', beard: 0 },
    c1: [CL.grey, CL.brown, CL.indigo], c2: [CL.grey, CL.brown], c3: [CL.grey, CL.brown, CL.black], speed: [1.3, 1.7], stride: 1.0, h: [0.62, 0.74], swing: 1.1 },
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
