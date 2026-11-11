// Machu Picchu c. 1450 — the moving life (docs/settlements/machu-picchu.md §10): the estate's people walking its plaza, its
// lanes between the kanchas and the way in from the fields: men in the knee-length tunic (unku) with the mantle (yacolla),
// women in the ankle-length wrap (anaku) under the shawl (lliklla), porters with their loads on the back, nobles in red mantles
// and the cap (chuku), priests in white, chosen women (aclla) in white with a red shawl, boys. Data for the engine's movers
// (src/engine/movers.js, read in its worker): the ways come from layout.js. No boats.

import { RADIUS, KALLANKA, kanchas } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 26, night: 3, rain: 0.6, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/**
 * The ways: the Main Plaza and the corridor to the Sacred Rock, the Sacred Plaza's lane, the road in through the main gate,
 * and — from the kanchas' own rectangles — the lanes before their gates (between the columns) and the lanes along their rows.
 * Kept to the town's core: the terraces' stairs are left to the ploughmen.
 */
export function walkways() {
  const rects = [
    { r: [-14, -50, 21, 8], weight: 3.0, market: 1.5, kind: 'street' },                   // the Main Plaza
    { r: [-3, -135, 5, -50], weight: 1.4, market: 0.2, kind: 'lane' },                   // north to the Sacred Rock's court
    { r: [-36, -40, -14, -35], weight: 1.6, market: 0.2, kind: 'lane' },                 // the Sacred Plaza, east of the Main Temple's steps
    { r: [0.9, 8, 3.1, 150], weight: 1.6, market: 0.4, kind: 'street' },                  // in from the fields by the gate
    { r: [-14, 8, 3.1, 11], weight: 0.9, market: 0.1, kind: 'lane' },
  ];
  for (const K of kanchas()) {
    const r = K.rect, gateE = K.inward[0] < 0;
    // the gate's lane (the gap between the kancha columns), and the lane south of the kancha along its row
    rects.push(gateE ? { r: [r[2] + 0.4, r[1] + 0.4, r[2] + 2.1, r[3] - 0.4], weight: 0.6, market: 0.1, kind: 'lane' } : { r: [r[0] - 2.1, r[1] + 0.4, r[0] - 0.4, r[3] - 0.4], weight: 0.6, market: 0.1, kind: 'lane' });
    rects.push({ r: [r[0] - 2.1, r[3] + 0.7, r[2] + 2.1, r[3] + 2.3], weight: 0.5, market: 0.1, kind: 'lane' });
  }
  void KALLANKA;
  return { rects: rects.filter((q) => Math.hypot((q.r[0] + q.r[2]) / 2, (q.r[1] + q.r[3]) / 2) < RADIUS - 30), links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', black: 'cloth_black', green: 'cloth_green' };
// the common men and women in plain wool and cotton in the natural browns, ochres and whites; the lords in red and black
export const WALKERS = [
  { id: 'man', weight: 2.0, market: 1.6, el: { dress: 'tunic', legs: 'bare', feet: 'shod', over: 'cape', hat: 'none', arms: 'hang', hair: 'short' },
    c1: [CL.brown, CL.ochre, CL.white, CL.brown], c2: [CL.brown, CL.red, CL.ochre, CL.black], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'robe', over: 'shawl', hat: 'none', arms: 'hang', hair: 'long', feet: 'shod' }, swing: 0.7,
    c1: [CL.red, CL.ochre, CL.brown, CL.black, CL.green], c2: [CL.ochre, CL.red, CL.white], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'bearer', weight: 1.4, market: 1.2, el: { dress: 'tunic', legs: 'bare', feet: 'shod', over: 'belt', carry: 'bundle', hat: 'none', hair: 'short' }, swing: 0.5,
    c1: [CL.brown, CL.ochre, CL.white], c2: [CL.brown, CL.red], c3: [CL.ochre, CL.red, CL.brown], speed: [0.8, 1.05], stride: 1.25 },
  { id: 'mother', weight: 0.7, market: 0.9, el: { dress: 'robe', over: 'shawl', hat: 'none', carry: 'child', hair: 'long', feet: 'shod' }, swing: 0.5,
    c1: [CL.red, CL.ochre, CL.brown], c2: [CL.ochre, CL.white], c3: [CL.brown], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'noble', weight: 0.6, market: 0.5, el: { dress: 'tunic', legs: 'bare', feet: 'shod', over: 'cape', hat: 'cap', arms: 'hang', hair: 'short' },
    c1: [CL.white, CL.ochre], c2: [CL.red, CL.red, CL.black], c3: [CL.red, CL.black], speed: [0.75, 0.95], stride: 1.3 },
  { id: 'priest', weight: 0.5, market: 0.3, el: { dress: 'tunic', legs: 'bare', feet: 'shod', over: 'cape', hat: 'none', arms: 'hang', hair: 'long' },
    c1: [CL.white], c2: [CL.white, CL.white, CL.red], c3: [CL.brown], speed: [0.7, 0.9], stride: 1.3 },
  { id: 'aclla', weight: 0.7, market: 0.4, el: { dress: 'robe', over: 'shawl', hat: 'none', arms: 'hang', hair: 'long', feet: 'shod' }, swing: 0.6,
    c1: [CL.white], c2: [CL.red, CL.red, CL.ochre], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'boy', weight: 0.5, market: 0.7, el: { dress: 'tunic', legs: 'bare', feet: 'bare', over: 'belt', arms: 'hang', hair: 'short', hat: 'none' },
    c1: [CL.brown, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
