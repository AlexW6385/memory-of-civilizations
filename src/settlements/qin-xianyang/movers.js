// Qin Xianyang c. 210 BC — the moving life (docs/settlements/qin-xianyang.md §6): officials in the black robe and the cap with the
// sash, soldiers in belted coats, labourers in short coats and trousers with the hair in a topknot, convict labourers in grey,
// women in the long wrapped robe, porters with the carrying pole and baskets of earth, boys; on the streets and lanes, the
// imperial road, the market's aisles, the forecourt of the palace, the figure-makers' street. No boats.
// Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js.

import { RADIUS, ROAD, MARKET, FORECOURT, WS_Z, WS_X, MWALL, streets } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 52, night: 4, rain: 0.3, reach: 170, spawnMin: 26, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -100,
};

export function walkways() {
  const rects = [], r = (a, weight, market, kind = 'street') => rects.push({ r: a, weight, market, kind });
  for (const s of streets()) { const w = Math.min(s[2] - s[0], s[3] - s[1]); r(s, s[2] - s[0] > s[3] - s[1] ? 1.5 : 1.0, 0.8, w < 3.6 ? 'lane' : 'street'); }
  r([-RADIUS + 20, ROAD.z0 + 3, RADIUS - 20, ROAD.z1 - 3], 2.6, 0.8);                                   // the imperial road, its two edges
  r([-RADIUS + 20, -ROAD.lane, RADIUS - 20, ROAD.lane], 1.4, 0.4);
  r([-100, WS_Z - 2.2, 156, WS_Z + 2.2], 2.4, 0.6);                                                     // the figure-makers' street
  r([FORECOURT[0] + 4, FORECOURT[1] + 4, FORECOURT[2] - 4, FORECOURT[3] - 3], 1.0, 0.2);               // the palace's forecourt
  // the market: its aisles between the stall rows and from gate to gate
  r([MARKET[0] + 2, 51.5, MARKET[2] - 2, 64.5], 3.0, 3.0); r([-33.5, MARKET[1] + 1, -26.5, MARKET[3] - 1], 3.0, 3.0);
  r([MARKET[0] + 2, 36.5, MARKET[2] - 2, 38.5], 2.4, 2.8); r([MARKET[0] + 2, 80.5, MARKET[2] - 2, 82.5], 2.4, 2.8);
  r([MARKET[0] - 2, 54.5, MARKET[0] + 3, 61.5], 2.0, 1.0); r([MARKET[2] - 3, 54.5, MARKET[2] + 2, 61.5], 2.0, 1.0);
  void MWALL;
  return { rects, links: [], clip: RADIUS - 20 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', green: 'cloth_green', indigo: 'cloth_indigo' };
const MAN = { hat: 'none', arms: 'hang', hair: 'topknot', feet: 'shod', beard: 0.3 };
export const WALKERS = [
  // the labourer: a short belted coat, trousers, the topknot; some with a carrying pole or a sack
  { id: 'worker', weight: 2.6, market: 1.4, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt' }, c1: [CL.brown, CL.ochre, CL.grey, CL.white], c2: [CL.brown, CL.grey], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'porter', weight: 1.6, market: 1.6, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', arms: 'pole', carry: 'pole' }, c1: [CL.brown, CL.ochre, CL.grey], c2: [CL.brown], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'bearer', weight: 1.0, market: 0.8, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', arms: 'sack', carry: 'sack' }, c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [0.8, 1.05], stride: 1.3 },
  // the convict labourer in grey, the head shaven, with a basket of earth for the pit
  { id: 'convict', weight: 0.9, market: 0.1, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', hair: 'shaven', arms: 'sack', carry: 'sack' }, c1: [CL.grey], c2: [CL.grey], c3: [CL.black], speed: [0.75, 1.0], stride: 1.2 },
  // the official: the long black robe, the red sash, the cap, a beard
  { id: 'official', weight: 1.0, market: 0.9, el: { ...MAN, dress: 'robe', over: 'sash', hat: 'cap', beard: 0.8 }, c1: [CL.black, CL.indigo, CL.black], c2: [CL.red, CL.ochre, CL.red], c3: [CL.black], speed: [0.75, 0.95], stride: 1.15 },
  // the soldier: a belted coat of red or brown, trousers
  { id: 'soldier', weight: 1.0, market: 0.4, el: { ...MAN, dress: 'tunic', legs: 'hose', over: 'belt', hat: 'cap' }, c1: [CL.red, CL.brown, CL.red], c2: [CL.brown], c3: [CL.black], speed: [1.0, 1.3], stride: 1.45 },
  // women in the long robe wrapped to the right, the wide sash, the hair in a bun
  { id: 'woman', weight: 1.8, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'bun', feet: 'shod', beard: 0 }, swing: 0.7, c1: [CL.red, CL.ochre, CL.green, CL.white, CL.indigo], c2: [CL.black, CL.ochre], c3: [CL.black], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.0, market: 1.0, el: { dress: 'robe', hat: 'none', over: 'sash', carry: 'pot', arms: 'head', hair: 'bun', feet: 'shod', beard: 0 }, swing: 0.5, c1: [CL.ochre, CL.brown, CL.green], c2: [CL.black], c3: [CL.black], speed: [0.75, 0.95], stride: 1.1, h: [0.9, 0.97] },
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
void WS_X;
