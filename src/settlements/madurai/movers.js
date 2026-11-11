// Madurai about 1650 — the moving life of the temple streets (docs/settlements/madurai.md §13): men in
// white veshtis bare-chested with a sash or a shoulder cloth, men in turbans, women in saris with
// the end over the shoulder, devotees with brass pots and baskets of flowers and coconuts, porters,
// priests in a white cloth with the tuft of hair, walking the ring streets, the axial streets from
// the gates, the back lane and the temple's courts. Data for the engine's movers (src/engine/movers.js);
// format as Suzhou's (src/settlements/ming-suzhou/movers.js). No boats: the Vaigai lies off the map.
// The coordinator registers it in src/engine/movers-sites.js.

import { STREETS, WALL, GATES, RADIUS, AXIAL_HALF } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 5, rain: 0.8, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/** The ways: the four sides of each ring street, the four axial streets, the temple's courts. */
export function walkways() {
  const [wx0, wz0, wx1, wz1] = WALL, rects = [], R = RADIUS - 28, lane = (r, weight, market, kind = 'street') => rects.push({ r, weight, market, kind });
  const rings = { chithirai: [2.4, 1], 'avani moola': [1.7, 0.8], 'back lane': [0.7, 0.2], masi: [1.3, 0.6] };
  for (const s of STREETS) {
    const o0 = s.off, o1 = s.off + s.w, [w, m] = rings[s.name] ?? [1, 0.5], kind = s.w > 5 ? 'street' : 'lane';
    const lim = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    lane([lim(wx0 - o1, -R, R), lim(wz0 - o1, -R, R), lim(wx1 + o1, -R, R), lim(wz0 - o0, -R, R)], w, m, kind);
    lane([lim(wx0 - o1, -R, R), lim(wz1 + o0, -R, R), lim(wx1 + o1, -R, R), lim(wz1 + o1, -R, R)], w, m, kind);
    lane([lim(wx0 - o1, -R, R), lim(wz0 - o1, -R, R), lim(wx0 - o0, -R, R), lim(wz1 + o1, -R, R)], w, m, kind);
    lane([lim(wx1 + o0, -R, R), lim(wz0 - o1, -R, R), lim(wx1 + o1, -R, R), lim(wz1 + o1, -R, R)], w, m, kind);
  }
  const h = AXIAL_HALF - 1.5;
  lane([wx1, GATES.e[1] - h, wx1 + 190, GATES.e[1] + h], 1.6, 0.9); lane([wx0 - 190, GATES.w[1] - h, wx0, GATES.w[1] + h], 1.6, 0.9);
  lane([GATES.s[0] - h, wz1, GATES.s[0] + h, wz1 + 190], 2.0, 0.9); lane([GATES.n[0] - h, wz0 - 190, GATES.n[0] + h, wz0], 1.6, 0.9);
  // through the south gopuram into the court, along the court's south side
  lane([GATES.s[0] - 3.5, 76, GATES.s[0] + 3.5, wz1 + 2], 1.8, 0.3);
  lane([wx0 + 12, 99, wx1 - 12, 113], 0.9, 0.1, 'street');
  return { rects, links: [], clip: RADIUS - 12 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// The dress (docs/settlements/madurai.md §13): the veshti of white cotton, bare-chested or with an angavastram over the shoulder;
// turbans (a cloth wound round the head) for merchants and travellers; women in saris of cotton, red, green, indigo, ochre, maroon,
// white with a coloured border, the end (pallu) over the shoulder, the hair in a bun or a long plait.
const CL = { white: 'cloth_white', red: 'cloth_red', green: 'cloth_green', indigo: 'cloth_indigo', ochre: 'cloth_ochre', maroon: 'cloth_maroon', blue: 'cloth_blue', brown: 'cloth_brown' };
export const WALKERS = [
  { id: 'veshti', weight: 1.6, market: 1.2, el: { dress: 'wrap', top: 'bare', hair: 'short', over: 'sash', arms: 'hang' },
    c1: [CL.white, CL.white, CL.ochre], c2: [CL.white, CL.white, CL.red], c3: [CL.white], speed: [1.0, 1.3], stride: 1.45 },
  { id: 'merchant', weight: 1.0, market: 1.8, el: { dress: 'wrap', hair: 'short', hat: 'turban', over: 'shawl', arms: 'hang' },
    c1: [CL.white, CL.white, CL.ochre, CL.blue], c2: [CL.white, CL.ochre], c3: [CL.white, CL.red, CL.ochre], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'priest', weight: 0.5, market: 0.3, el: { dress: 'wrap', top: 'bare', hair: 'topknot', over: 'sash', arms: 'hang' },
    c1: [CL.white], c2: [CL.white], c3: [CL.white], speed: [0.9, 1.1], stride: 1.35 },
  { id: 'woman', weight: 2.0, market: 1.5, el: { dress: 'wrap', hair: 'bun', over: 'shawl', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.indigo, CL.ochre, CL.maroon, CL.blue, CL.white], c2: [CL.ochre, CL.red, CL.white], c3: [CL.ochre, CL.red], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'devotee', weight: 1.3, market: 0.8, el: { dress: 'wrap', hair: 'long', over: 'shawl', carry: 'basket', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.maroon, CL.indigo], c2: [CL.ochre, CL.white], c3: [CL.white], speed: [0.85, 1.1], stride: 1.25, h: [0.9, 0.97] },
  { id: 'water', weight: 0.7, market: 0.4, el: { dress: 'wrap', hair: 'bun', over: 'shawl', carry: 'pot', arms: 'hang' }, swing: 0.7,
    c1: [CL.green, CL.ochre, CL.red], c2: [CL.white], c3: [CL.white], speed: [0.85, 1.05], stride: 1.25, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.8, market: 1.0, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', carry: 'basket', arms: 'hang' },
    c1: [CL.white, CL.brown], c2: [CL.white], c3: [CL.red, CL.white], speed: [1.0, 1.25], stride: 1.3 },
];
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'pull' }, c1: [CL.white], c2: [CL.white], c3: [CL.white] },
  passenger: { el: { dress: 'wrap', hair: 'short', pose: 'cross' }, c1: [CL.white], c2: [CL.white], c3: [CL.white] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none */ }
