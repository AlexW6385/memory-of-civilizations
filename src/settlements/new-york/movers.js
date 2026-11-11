// Midtown Manhattan 1931 — the moving life (docs/settlements/new-york.md §10): New Yorkers on the pavements of the
// avenues and cross streets, crossing at the corners. Data for the engine's movers (src/engine/movers.js, read in its
// worker), in the format of Suzhou's; the ways come from layout.js (the grid's frame turned into the settlement's by
// toCity). No boats. The cars and cabs stand as placed things (town.js); the movers are people on foot.

import { RADIUS, AVENUES, STREETS, toCity } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 46, night: 9, rain: 0.7, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

// ── the ways ─────────────────────────────────────────────────────────────────
// A lattice of pavements: each avenue's two sides and each cross street's two sides (the pavements are the 3 m between the
// kerb and the house fronts), joined by crossings at every corner; Sixth Avenue's sides stand a little farther out, clear of the El's stairs.
const SIDE = 1.5;
/** The pavement line's offset from an avenue's middle (Sixth Avenue's farther out, clear of the El stairs' landings). */
const aOff = (a) => a[1] / 2 + (a[2] === '6th' ? 2.0 : SIDE);
const sOff = 6 + SIDE;
export function walkways() {
  const links = [], P = (x, z) => toCity(x, z);
  const L = (a, b, w, weight, kind = 'street', market = 0) => links.push({ a: P(...a), b: P(...b), w, kind, weight, market });
  const zs = STREETS.map(([z]) => z).sort((a, b) => a - b), X0 = -RADIUS, X1 = RADIUS;
  // along each avenue's sides, block by block; the crossings of the cross streets at each corner
  for (const av of AVENUES) {
    const [ax, , name] = av, busy = name === '5th' ? 2.6 : name === '6th' ? 1.7 : 1.3;
    for (const sg of [-1, 1]) {
      const x = ax + sg * aOff(av);
      for (let j = 0; j + 1 < zs.length; j++) L([x, zs[j] + sOff], [x, zs[j + 1] - sOff], 1.0, busy, 'street', 1);
      for (const z of zs) L([x, z - sOff], [x, z + sOff], 1.0, busy * 0.6, 'street', 0.5);
    }
  }
  // along each cross street's sides, between the avenues; the crossings of the avenues
  const edge = [{ x: X0 }, ...AVENUES.map((a) => ({ a })), { x: X1 }];
  for (const z of zs) for (const sg of [-1, 1]) {
    const zz = z + sg * sOff;
    for (let i = 0; i + 1 < edge.length; i++) {
      const xa = edge[i].a ? edge[i].a[0] + aOff(edge[i].a) : edge[i].x, xb = edge[i + 1].a ? edge[i + 1].a[0] - aOff(edge[i + 1].a) : edge[i + 1].x;
      L([xa, zz], [xb, zz], 1.0, 0.9, 'street', 0.6);
    }
  }
  for (const av of AVENUES) for (const z of zs) for (const sg of [-1, 1]) L([av[0] - aOff(av), z + sg * sOff], [av[0] + aOff(av), z + sg * sOff], 1.0, 0.7, 'street', 0.3);
  return { rects: [], links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
// After the dress of 1931 (dossier §10): men in dark suits, overcoats and felt hats; women in coats with the cloche or a brimless
// hat, the skirt below the knee; messenger boys and newsboys in caps; labourers in jackets and caps with a sack; the policeman
// in blue; the Depression's men in worn coats. In the rain they put up the cape (umbrellas are not drawn).
const CL = { grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', indigo: 'cloth_indigo', maroon: 'cloth_maroon', ochre: 'cloth_ochre' };
export const WALKERS = [
  { id: 'businessman', weight: 2.0, market: 1.2, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'collar', arms: 'hang' }, wet: 'cloak',
    c1: [CL.grey, CL.black, CL.indigo, CL.brown, CL.grey], c2: [CL.grey, CL.black, CL.indigo], c3: [CL.black, CL.brown, CL.grey], speed: [1.3, 1.65], stride: 1.55 },
  { id: 'overcoat', weight: 1.5, market: 1.0, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'cloak', arms: 'hang' }, wet: 'cloak',
    c1: [CL.black, CL.grey, CL.brown, CL.indigo], c2: [CL.black, CL.grey], c3: [CL.black, CL.brown, CL.grey], speed: [1.2, 1.55], stride: 1.5 },
  { id: 'woman', weight: 1.7, market: 1.7, el: { dress: 'robe', hair: 'bun', hat: 'cap', over: 'cape', arms: 'hang' }, wet: 'cloak', swing: 0.6,
    c1: [CL.maroon, CL.green, CL.indigo, CL.grey, CL.black, CL.brown, CL.blue], c2: [CL.black, CL.grey, CL.brown], c3: [CL.black, CL.maroon, CL.brown, CL.white], speed: [1.1, 1.4], stride: 1.3, h: [0.9, 0.96] },
  { id: 'shopgirl', weight: 1.0, market: 1.8, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, wet: 'cloak', swing: 0.7,
    c1: [CL.red, CL.blue, CL.green, CL.ochre, CL.grey], c2: [CL.black, CL.brown], c3: [CL.black, CL.white], speed: [1.25, 1.6], stride: 1.25, h: [0.88, 0.95] },
  { id: 'worker', weight: 1.4, market: 0.8, el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.ochre, CL.indigo], c2: [CL.brown, CL.grey, CL.black], c3: [CL.brown, CL.grey, CL.black], speed: [1.2, 1.5], stride: 1.5 },
  { id: 'porter', weight: 0.8, market: 0.9, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'sack', arms: 'sack' },
    c1: [CL.brown, CL.grey, CL.ochre, CL.white], c2: [CL.brown, CL.black], c3: [CL.brown, CL.grey], speed: [1.0, 1.3], stride: 1.2 },
  { id: 'newsboy', weight: 0.7, market: 1.2, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'bundle', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.grey, CL.brown, CL.red], speed: [1.4, 1.9], stride: 1.0, h: [0.62, 0.72], swing: 1.1 },
  { id: 'messenger', weight: 0.5, market: 1.0, el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' },
    c1: ['prussian_blue'], c2: ['prussian_blue'], c3: [CL.black], speed: [1.7, 2.1], stride: 1.2, h: [0.7, 0.8], swing: 1.2 },
  { id: 'policeman', weight: 0.4, market: 0.8, el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, wet: 'cloak',
    c1: ['prussian_blue'], c2: ['prussian_blue'], c3: ['prussian_blue'], speed: [0.95, 1.2], stride: 1.55 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    if (wet) el.over = 'cloak';
    addFigure(sb, v, figure, el, { far });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
