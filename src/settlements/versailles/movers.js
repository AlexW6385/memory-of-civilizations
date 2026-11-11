// Versailles about 1700 — the moving life (docs/settlements/versailles.md §10): the court promenading on the terrace and
// down the walks of the parterre, the Swiss guards at the gates, liveried servants and gardeners, townspeople and
// porters on the Place d'Armes and the avenues. Data for the engine's movers (src/engine/movers.js), read in its worker.
// No boats: the Grand Canal's reach inside the settlement is a landing only (its boats are placed in town.js).

import { RADIUS, PLACE, AVE0, STABLES, PITCH, STREET } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 58, night: 6, rain: 0.5, reach: 150, spawnMin: 24, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -1,
};

/** The terrace, the walks of the water parterre and the axis, the courts, the Place d'Armes and the three avenues. */
export function walkways() {
  const rects = [
    { r: [-14, -40, -2, 44], weight: 3, market: 0.5, kind: 'street' },                    // the terrace before the garden front
    { r: [-66, -7, -6, 7], weight: 3, market: 0.5, kind: 'street' },                      // the walk between the two basins
    { r: [-140, -9, -66, 9], weight: 1.6, market: 0.2, kind: 'street' },                  // down to Latona
    { r: [-72, -70, -6, -60], weight: 1.0, market: 0.2, kind: 'lane' }, { r: [-72, 60, -6, 70], weight: 1.0, market: 0.2, kind: 'lane' },
    { r: [96, -38, 148, 38], weight: 2, market: 0.4, kind: 'street' },                    // the Royal Court
    { r: [PLACE[0] + 8, PLACE[1] + 4, PLACE[2] - 4, PLACE[3] - 4], weight: 3.2, market: 1.2, kind: 'street' },
  ];
  rects.push({ r: [PLACE[2], -9, RADIUS - 30, 9], weight: 2.2, market: 1.6, kind: 'street' });
  for (const s of [-1, 1]) for (let x = PLACE[2]; x < RADIUS - 60; x += 22) {
    const zc = s * (AVE0 + (x + 11 - PLACE[2]) * 0.35);
    rects.push({ r: [x, zc - 8, x + 22, zc + 8], weight: 1.0, market: 1.0, kind: 'street' });
  }
  // the cross streets between the blocks of houses: a lane of walkers on each (the shops' customers, errand-boys, maids)
  for (let b = -Math.ceil(RADIUS / PITCH); b <= Math.ceil(RADIUS / PITCH); b++) {
    const zb = b * PITCH + 4;
    if (Math.abs(zb) < RADIUS - 70) rects.push({ r: [PLACE[2] + 12, zb - STREET + 1, RADIUS - 70, zb - 1], weight: 0.7, market: 0.8, kind: 'lane' });
  }
  void STABLES;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// Dress of the 1690s: courtiers in the justaucorps with the full wig and the plumed hat, in red, blue, brown and black
// with white linen; ladies in gowns of silk with the mantua; Swiss guards of the Cent-Suisses and the Gardes in the king's
// blue and red; servants in livery; gardeners in grey with the straw hat; townspeople in drab; abbés in black; porters.
const CL = { black: 'cloth_black', red: 'cloth_red', blue: 'cloth_blue', indigo: 'cloth_indigo', brown: 'cloth_brown', white: 'cloth_white', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'courtier', weight: 1.5, market: 0.4, el: { dress: 'tunic', legs: 'hose', hair: 'long', hat: 'brim', over: 'cape', arms: 'hang' }, wet: 'cloak',
    c1: [CL.red, CL.blue, CL.brown, CL.black, CL.green, CL.maroon], c2: [CL.white, CL.white, CL.ochre], c3: [CL.black], speed: [0.85, 1.1], stride: 1.35 },
  { id: 'lady', weight: 1.3, market: 0.5, el: { dress: 'robe', hair: 'bun', over: 'shawl', arms: 'hang' }, wet: 'cloak', swing: 0.6,
    c1: [CL.red, CL.indigo, CL.ochre, CL.green, CL.white, CL.maroon], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'guard', weight: 0.6, market: 0.2, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'brim', over: 'belt', arms: 'hang' }, wet: 'cloak',
    c1: [CL.blue, CL.blue, CL.red], c2: [CL.white, CL.red], c3: [CL.black], speed: [0.9, 1.1], stride: 1.45 },
  { id: 'footman', weight: 0.9, market: 0.6, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, wet: 'cloak',
    c1: [CL.blue, CL.red, CL.green, CL.maroon], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'gardener', weight: 0.6, market: 0.2, el: { dress: 'trousers', hair: 'short', hat: 'straw', over: 'apron', arms: 'hang' }, wet: 'cloak',
    c1: [CL.grey, CL.brown, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.0, 1.25], stride: 1.4 },
  { id: 'townsman', weight: 1.4, market: 1.8, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'apron', arms: 'hang' }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.ochre, CL.indigo, CL.green], c2: [CL.white, CL.brown], c3: [CL.brown, CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'townswoman', weight: 1.0, market: 1.6, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'apron', arms: 'hang' }, wet: 'cloak', swing: 0.7,
    c1: [CL.brown, CL.indigo, CL.grey, CL.maroon], c2: [CL.white], c3: [CL.white], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'abbe', weight: 0.4, market: 0.5, el: { dress: 'robe', hair: 'short', hat: 'brim', over: 'cape', arms: 'hang' }, wet: 'cloak',
    c1: [CL.black], c2: [CL.white], c3: [CL.black], speed: [0.9, 1.15], stride: 1.45 },
  { id: 'maid', weight: 0.8, market: 1.5, el: { dress: 'robe', hair: 'bun', hat: 'veil', carry: 'basket' }, wet: 'cloak', swing: 0.5,
    c1: [CL.indigo, CL.brown, CL.green, CL.grey], c2: [CL.white], c3: [CL.white], speed: [1.0, 1.25], stride: 1.2, h: [0.88, 0.95] },
  { id: 'water-carrier', weight: 0.4, market: 1.2, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'pails', arms: 'pole' }, wet: 'cloak', swing: 0.7,
    c1: [CL.brown, CL.grey, CL.blue], c2: [CL.white, CL.brown], c3: [CL.brown], speed: [0.9, 1.1], stride: 1.1, pole: true },
  { id: 'porter', weight: 0.7, market: 1.4, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'pole', arms: 'pole' }, wet: 'cloak', swing: 0.75,
    c1: [CL.grey, CL.brown, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [1.0, 1.25], stride: 1.1, pole: true },
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
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
