// Rome under Hadrian — the moving life (docs/settlements/rome.md §11): citizens in the white toga, workmen and slaves in the
// short belted tunic, matrons in the stola with the palla over the head, porters with baskets and sacks, soldiers of the
// urban cohorts in red tunics with a cloak, boys; on the Via Lata, the street before the Pantheon, the street at the south,
// the forum and the Pantheon's forecourt. Data for the engine's movers (src/engine/movers.js); the ways come from layout.js.
// No boats (the Tiber is shown but not sailed).

import { RADIUS, VIA_LATA, FORUM, PANTHEON } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 52, night: 5, rain: 0.6, reach: 170, spawnMin: 24, far: 48 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -5,
};

/** The ways: the Via Lata, the two cross streets, the forum square and the Pantheon's forecourt. */
export function walkways() {
  const rects = [], hw = VIA_LATA.w / 2 - 0.6;
  rects.push({ r: [VIA_LATA.x - hw, -330, VIA_LATA.x + hw, 330], weight: 4, market: 3, kind: 'street' });
  rects.push({ r: [-182, -177.5, 172, -172.5], weight: 2.5, market: 1.5, kind: 'street' });
  rects.push({ r: [-182, 162.5, 172, 167.5], weight: 2, market: 2, kind: 'street' });
  rects.push({ r: [FORUM[0] + 2, FORUM[1] + 12, FORUM[2] - 2, FORUM[3] - 12], weight: 2, market: 1.2, kind: 'street' });
  rects.push({ r: [PANTHEON[0] + 8, -148, PANTHEON[2] - 8, -52], weight: 1.5, market: 0.5, kind: 'street' });
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'citizen', weight: 1.2, market: 0.9, el: { dress: 'robe', over: 'cloak', hair: 'short', hat: 'none', arms: 'hang' },
    c1: [CL.white], c2: [CL.white], c3: [CL.white], speed: [0.8, 1.0], stride: 1.3 },
  { id: 'worker', weight: 1.8, market: 1.6, el: { dress: 'tunic', legs: 'bare', over: 'belt', hair: 'short', hat: 'none', arms: 'hang' },
    c1: [CL.brown, CL.ochre, 'linen', CL.grey, CL.red], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [1.0, 1.35], stride: 1.4 },
  { id: 'slave', weight: 1.0, market: 1.4, el: { dress: 'tunic', legs: 'bare', over: 'belt', hair: 'short', hat: 'none', carry: 'basket', arms: 'hang' },
    c1: [CL.grey, CL.brown, 'linen'], c2: [CL.brown], c3: [CL.brown], speed: [0.9, 1.2], stride: 1.3 },
  { id: 'porter', weight: 0.8, market: 1.5, el: { dress: 'tunic', legs: 'bare', over: 'belt', hair: 'short', hat: 'none', carry: 'sack', arms: 'sack' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.9, 1.15], stride: 1.3 },
  { id: 'matron', weight: 1.1, market: 1.5, el: { dress: 'robe', over: 'shawl', hair: 'bun', hat: 'veil', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.indigo, CL.ochre, CL.green, CL.maroon], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'soldier', weight: 0.6, market: 0.4, el: { dress: 'tunic', legs: 'bare', over: 'cloak', hair: 'short', hat: 'none', carry: 'staff', arms: 'staff' },
    c1: [CL.red], c2: [CL.brown], c3: [CL.red], speed: [1.0, 1.25], stride: 1.5 },
  { id: 'boy', weight: 0.5, market: 0.8, el: { dress: 'tunic', legs: 'bare', over: 'belt', hair: 'short', hat: 'none', arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) addFigure(sb, sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far, cape: null });
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
