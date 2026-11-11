// Umayyad Jerusalem about 700 — the moving life (docs/settlements/jerusalem.md §10b): people walking the Cardo
// between its porticoes, the street from the west gate to the Haram, the Haram's esplanade and the street under
// its south wall, in the dress of the place: Muslim men in robes and turbans, women veiled, Christian clergy in
// black, pilgrims in cloaks with staffs, porters, boys. Data for the engine's movers (src/engine/movers.js),
// read in its worker; the ways come from layout.js. No boats.

import { RADIUS, CARDO, HARAM, SEPULCHRE, PALACES } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 4, rain: 0.6, reach: 170, spawnMin: 26, far: 48 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the Cardo's roadway and porticoes, the street to the Haram, the Haram's esplanade, the street under its south wall. */
export function walkways() {
  const X = CARDO.x, w = CARDO.road / 2 + CARDO.portico - 0.5, rects = [];
  rects.push({ r: [X - w, CARDO.z0 + 14, X + w, CARDO.z1 - 14], weight: 5, market: 3, kind: 'street' });
  rects.push({ r: [-366, -4.5, HARAM.rect[0] - 4, 4.5], weight: 2.4, market: 2, kind: 'street' });
  rects.push({ r: [HARAM.rect[0] + 6, HARAM.rect[1] + 20, HARAM.rect[2] - 6, HARAM.rect[3] - 12], weight: 2.2, market: 0.4, kind: 'street' });
  rects.push({ r: [-140, HARAM.rect[3] + 5, 140, HARAM.rect[3] + 12], weight: 1.4, market: 1, kind: 'street' });
  rects.push({ r: [SEPULCHRE[2] - 17, (SEPULCHRE[1] + SEPULCHRE[3]) / 2 - 14, X - 7, (SEPULCHRE[1] + SEPULCHRE[3]) / 2 + 14], weight: 1.2, market: 0.5, kind: 'street' });
  void PALACES;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon', linen: 'linen' };
export const WALKERS = [
  { id: 'muslim', weight: 2.2, market: 1.6, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang', beard: true },
    c1: [CL.white, CL.brown, CL.ochre, CL.grey, CL.indigo], c2: [CL.white, CL.brown, CL.grey], c3: [CL.white, CL.white, CL.ochre], speed: [0.9, 1.2], stride: 1.35 },
  { id: 'christian', weight: 1.4, market: 1.5, el: { dress: 'tunic', legs: 'hose', hat: 'cap', over: 'belt', arms: 'hang' },
    c1: [CL.brown, CL.ochre, CL.grey, CL.green], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'jew', weight: 0.5, market: 0.8, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', beard: true },
    c1: [CL.white, CL.indigo, CL.brown], c2: [CL.white, CL.grey], c3: [CL.white], speed: [0.9, 1.1], stride: 1.3 },
  { id: 'cleric', weight: 0.6, market: 0.3, el: { dress: 'robe', hat: 'none', over: 'none', arms: 'hang' },
    c1: [CL.black], c2: [CL.black], c3: [CL.black], speed: [0.8, 1.0], stride: 1.25 },
  { id: 'pilgrim', weight: 0.9, market: 0.8, el: { dress: 'robe', hat: 'cap', over: 'cloak', pose: 'staff', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.linen], c2: [CL.brown, CL.linen], c3: [CL.brown], speed: [0.75, 1.0], stride: 1.2 },
  { id: 'woman', weight: 1.6, market: 1.8, el: { dress: 'robe', hat: 'veil', over: 'none', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.black, CL.white, CL.maroon, CL.ochre], c2: [CL.white, CL.indigo], c3: [CL.white, CL.black, CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.9, market: 1.6, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'hang', carry: 'basket' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
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
