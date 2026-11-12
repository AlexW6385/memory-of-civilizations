// Shang Yinxu c. 1200 BC — the moving life (docs/settlements/shang-yinxu.md §6): farmers and labourers in short coats and trousers with
// the hair in a topknot, women in the wrapped robe with a sash and the hair in a bun, nobles and diviners in long robes of red and black,
// guards, bronze-casters, porters with the carrying pole and baskets, boys; on the lanes, the court, the foundry yard and the bridges.
// No boats. Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js.

import { RADIUS, BRIDGES, COURT, FOUNDRY, ARCHIVE, streets, landings } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 66, night: 5, rain: 0.3, reach: 175, spawnMin: 22, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -0.9,
};

export function walkways() {
  const rects = [], links = [], r = (a, weight, market, kind = 'street') => rects.push({ r: a, weight, market, kind });
  for (const s of streets()) { const w = Math.min(s[2] - s[0], s[3] - s[1]); r(s, s[2] - s[0] > s[3] - s[1] ? 1.5 : 1.0, 0.5, w < 3.6 ? 'lane' : 'street'); }
  r([COURT[0] + 2, COURT[1] + 4, COURT[2] - 2, COURT[3] - 2], 2.2, 0.4);                              // the court
  r([FOUNDRY[0] + 4, FOUNDRY[1] + 16, FOUNDRY[2] - 4, FOUNDRY[3] - 18], 1.6, 0.2);                    // the foundry's yard, between the sheds and the pit houses
  r([ARCHIVE.rect[0], ARCHIVE.rect[3] + 2, ARCHIVE.rect[2], ARCHIVE.shed[1] - 1], 1.0, 0.2);
  r([COURT[0] + 14, COURT[3] - 2, COURT[0] + 34, COURT[3] + 14], 2.0, 0.4);                           // the way out through the gate
  for (const g of landings()) { const [nx, nz] = g.n, [tx, tz] = g.tang, p = (s, t) => [g.a[0] + nx * s + tx * t, g.a[1] + nz * s + tz * t], c = [p(-0.5, -1.2), p(5.2, 1.2)]; r([Math.min(c[0][0], c[1][0]), Math.min(c[0][1], c[1][1]), Math.max(c[0][0], c[1][0]), Math.max(c[0][1], c[1][1])], 0.5, 0.1, 'lane'); }
  for (const b of BRIDGES) links.push({ a: b.a, b: b.b, w: 1.2, kind: 'bridge', weight: 1.0 });
  return { rects, links, clip: RADIUS - 20 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', green: 'cloth_green', indigo: 'cloth_indigo' };
const MAN = { hat: 'none', arms: 'hang', hair: 'topknot', feet: 'shod', beard: 0.2 };
export const WALKERS = [
  { id: 'farmer', weight: 2.4, market: 1.0, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt' }, c1: [CL.brown, CL.ochre, CL.grey], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'hoe', weight: 1.2, market: 0.4, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', carry: 'hoe' }, c1: [CL.brown, CL.ochre, CL.grey], c2: [CL.brown], c3: [CL.black], speed: [0.9, 1.15], stride: 1.3 },
  { id: 'porter', weight: 1.6, market: 1.2, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', arms: 'pole', carry: 'pole' }, c1: [CL.brown, CL.ochre, CL.grey], c2: [CL.brown], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'bearer', weight: 1.0, market: 0.8, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', arms: 'sack', carry: 'sack' }, c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'caster', weight: 1.0, market: 0.2, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', carry: 'basket', arms: 'sack' }, c1: [CL.brown, CL.grey], c2: [CL.brown], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'noble', weight: 1.1, market: 0.9, el: { ...MAN, dress: 'robe', over: 'sash', beard: 0.6 }, c1: [CL.red, CL.black, CL.red, CL.ochre], c2: [CL.black, CL.ochre, CL.black], c3: [CL.black], speed: [0.75, 0.95], stride: 1.15 },
  { id: 'guard', weight: 0.9, market: 0.3, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', hat: 'cap', carry: 'staff', arms: 'staff' }, c1: [CL.brown, CL.red], c2: [CL.red, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.4 },
  { id: 'woman', weight: 1.8, market: 1.6, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'bun', feet: 'shod', beard: 0 }, swing: 0.7, c1: [CL.ochre, CL.brown, CL.red, CL.grey, CL.green], c2: [CL.black, CL.ochre], c3: [CL.black], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.0, market: 1.0, el: { dress: 'robe', hat: 'none', over: 'sash', carry: 'pot', arms: 'head', hair: 'bun', feet: 'shod', beard: 0 }, swing: 0.5, c1: [CL.ochre, CL.brown, CL.grey], c2: [CL.black], c3: [CL.black], speed: [0.75, 0.95], stride: 1.1, h: [0.9, 0.97] },
  { id: 'diviner', weight: 0.8, market: 0.5, el: { ...MAN, dress: 'robe', over: 'sash', beard: 0.7 }, c1: [CL.black, CL.black, CL.red], c2: [CL.red, CL.black], c3: [CL.black], speed: [0.7, 0.9], stride: 1.1 },
  { id: 'potter', weight: 0.8, market: 0.8, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', carry: 'pot', arms: 'head' }, c1: [CL.brown, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [0.8, 1.0], stride: 1.25 },
  { id: 'fisher', weight: 0.7, market: 0.1, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', carry: 'pole', arms: 'pole' }, c1: [CL.grey, CL.brown], c2: [CL.brown], c3: [CL.black], speed: [0.9, 1.15], stride: 1.3 },
  { id: 'girl', weight: 0.6, market: 0.9, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'bun', feet: 'shod', beard: 0 }, swing: 1.0, c1: [CL.ochre, CL.red, CL.brown], c2: [CL.black], c3: [CL.black], speed: [1.0, 1.35], stride: 1.0, h: [0.62, 0.74] },
  { id: 'boy', weight: 0.6, market: 0.8, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'none', beard: 0 }, c1: [CL.ochre, CL.brown, CL.white], c2: [CL.brown], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
