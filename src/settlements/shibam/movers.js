// Shibam c. 1700 — the moving life (docs/settlements/shibam.md §8): merchants and townsmen in the long white robe and turban, the women veiled in
// black, boys, porters with sacks, water-bearers, shepherds with goats; by day in the streets and the square, at the gate and out in the gardens.
// Data for the engine's movers (read in its worker); the ways come from layout.js. No boats.

import { RADIUS, WALL, GATE, SQUARE, streets } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 66, night: 4, rain: 0.2, reach: 150, spawnMin: 28, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -50,
};
const way = (a, b, w, weight, market = 0.6, kind = 'street') => ({ r: [Math.min(a[0], b[0]) - (a[0] === b[0] ? w / 2 : 0), Math.min(a[1], b[1]) - (a[1] === b[1] ? w / 2 : 0), Math.max(a[0], b[0]) + (a[0] === b[0] ? w / 2 : 0), Math.max(a[1], b[1]) + (a[1] === b[1] ? w / 2 : 0)], weight, market, kind });

/** The ways: the streets of the layout, the square, and the road from the gate out across the wadi floor to the gardens. */
export function walkways() {
  const rects = [];
  for (const s of streets()) rects.push(way(s.a, s.b, s.w, s.a[0] === s.b[0] ? 1.6 : 1.0, 0.8));
  rects.push({ r: [SQUARE[0] + 1, SQUARE[1] + 1, SQUARE[2] - 1, SQUARE[3] - 0.5], weight: 1.8, market: 1.6, kind: 'street' });
  rects.push(way([GATE.x, WALL[3]], [GATE.x, WALL[3] + 70], 6, 1.0, 0.5, 'lane'));
  rects.push(way([-124, WALL[3] + 11], [124, WALL[3] + 11], 3, 0.5, 0.3, 'lane'));
  rects.push(way([-124, 131], [124, 131], 3, 0.5, 0.2, 'lane'));
  for (const sx of [-1, 1]) rects.push(way([sx * 147.5, -80], [sx * 147.5, 80], 3, 0.4, 0.2, 'lane'));
  // the lane before the shops on the square's south side and the lanes round the square's edge
  rects.push({ r: [SQUARE[0], SQUARE[3] - 1.4, SQUARE[2], SQUARE[3] + 0.4], weight: 1.2, market: 1.8, kind: 'street' });
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', linen: 'linen', ochre: 'cloth_ochre', black: 'cloth_black', indigo: 'cloth_indigo', brown: 'cloth_brown', grey: 'cloth_grey' };
export const WALKERS = [
  // the merchant: the long white robe, the sash, the turban, the beard
  { id: 'merchant', weight: 2.4, market: 2.0, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang', hair: 'short', beard: true, feet: 'shod' }, c1: [CL.white, CL.linen, CL.white, CL.ochre], c2: [CL.white, CL.indigo], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'townsman', weight: 2.0, market: 1.4, el: { dress: 'robe', hat: 'turban', over: 'belt', arms: 'hang', hair: 'short', beard: true, feet: 'bare' }, c1: [CL.white, CL.ochre, CL.grey, CL.brown], c2: [CL.white], c3: [CL.brown], speed: [0.85, 1.15], stride: 1.3 },
  // the porter: a sack on the shoulder
  { id: 'porter', weight: 1.4, market: 1.6, el: { dress: 'robe', hat: 'cap', over: 'belt', arms: 'sack', carry: 'sack', hair: 'short', beard: false, feet: 'bare' }, c1: [CL.ochre, CL.brown, CL.grey], c2: [CL.white], c3: [CL.brown], speed: [0.75, 1.0], stride: 1.25 },
  // the woman: the black overgarment and veil, a jar of water on her head
  { id: 'jar', weight: 1.5, market: 1.0, el: { dress: 'robe', hat: 'veil', over: 'none', arms: 'head', carry: 'pot', hair: 'long', feet: 'bare' }, swing: 0.5, c1: [CL.black, CL.indigo], c2: [CL.indigo], c3: [CL.black], speed: [0.7, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'woman', weight: 1.6, market: 1.2, el: { dress: 'robe', hat: 'veil', over: 'none', arms: 'hang', hair: 'long', feet: 'bare' }, swing: 0.7, c1: [CL.black, CL.black, CL.indigo], c2: [CL.indigo, CL.ochre], c3: [CL.black], speed: [0.75, 1.0], stride: 1.2, h: [0.9, 0.97] },
  // the gardener of the palm plots: the wide straw hat, the hoe
  { id: 'farmer', weight: 0.9, market: 0.2, el: { dress: 'robe', hat: 'straw', over: 'belt', arms: 'hoe', carry: 'hoe', hair: 'short', beard: true, feet: 'bare' }, c1: [CL.indigo, CL.brown, CL.grey, CL.white], c2: [CL.white], c3: [CL.brown], speed: [0.7, 0.95], stride: 1.2 },
  // the old man with his staff and his beads, slow
  { id: 'elder', weight: 0.5, market: 0.9, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'staff', carry: 'staff', hair: 'short', beard: true, feet: 'shod' }, c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.brown], speed: [0.5, 0.7], stride: 1.0 },
  { id: 'boy', weight: 0.7, market: 0.8, el: { dress: 'robe', hat: 'cap', over: 'none', arms: 'hang', hair: 'short', beard: false, feet: 'bare' }, c1: [CL.white, CL.ochre], c2: [CL.white], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
