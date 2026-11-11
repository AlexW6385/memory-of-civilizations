// Sanchi in the 1st century — the moving life (docs/settlements/sanchi.md §12): monks in ochre robes circling the Great Stupa
// with the dome on their right (pradakshina), lay pilgrims in white with turbans and women in red carrying offerings up the north
// path, donors, bearers, boys and herders in the village below. Data for the engine's movers (src/engine/movers.js, read in its
// worker); the ways come from layout.js. No boats.
import { RADIUS, PATH, SUMMIT, STUPA2, TEMPLE40, lots } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 32, night: 3, rain: 0.5, reach: 170, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the north path, the ground walk round the Great Stupa, the approach from the south gateway to Temple 40 and the monastery, the way to Stupa 2, the village lanes. */
export function walkways() {
  const rects = [], links = [], L = (a, b, w, weight, kind = 'street') => links.push({ a, b, w, kind, weight });
  const zn = -SUMMIT.half[1];
  L([PATH.x, zn - 95], [PATH.x, zn], PATH.w / 2 - 0.8, 1.6); L([PATH.x, zn], [PATH.x, -24], 2.4, 2.4);     // up the north slope and across the summit
  // the ground walk round the dome (r about 20.5 m)
  const R = 20.5, n = 16;
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n, b = 2 * Math.PI * (i + 1) / n;
    L([Math.sin(a) * R, -Math.cos(a) * R], [Math.sin(b) * R, -Math.cos(b) * R], 0.9, 2.6);
  }
  L([0, 21], [0, 44], 2.6, 2.4); L([0, 44], [-14, 44], 2.4, 1.0);                        // the south gateway's approach, Ashoka's pillar
  L([0, 44], [TEMPLE40.c[0], 44], 2.4, 1.2);                                             // along the south front to Temple 40
  L([20.5, 0], [30, 0], 2.0, 1.2); L([30, 0], [30, 17], 2.0, 1.2); L([30, 17], [34, 17], 1.6, 1.2); L([34, 17], [49, 17], 1.8, 1.2);   // to the monastery's court
  const [t0, z0] = STUPA2.terrace;
  L([STUPA2.c[0], -62], [STUPA2.c[0], z0 - 2], 2.0, 0.8);                               // the way to Stupa 2 and its terrace
  rects.push({ r: [STUPA2.terrace[0] + 2, STUPA2.terrace[1] + 2, STUPA2.terrace[2] - 2, STUPA2.terrace[3] - 2], weight: 0.8, market: 0, kind: 'street' });
  void t0;
  // the village: the lanes between the rows of houses (layout.js lots(): rows every 13 m, houses at most 8 m deep) and the lane on the west
  const rows = new Set(lots().map((l) => Math.round((l.rect[1] - 120) / 13)));
  for (const j of rows) L([-104, 130.5 + j * 13], [210, 130.5 + j * 13], 1.2, 1.0);
  L([-104, 126], [-104, 222], 1.4, 1.0);
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', maroon: 'cloth_maroon' };
export const WALKERS = [
  // the monk: the ochre robe over one shoulder, shaven, barefoot
  { id: 'monk', weight: 3.0, market: 0.6, el: { dress: 'robe', cloth: CL.ochre, hat: 'none', over: 'sash', arms: 'hang', hair: 'shaven', feet: 'bare', beard: 0 },
    c1: [CL.ochre, CL.maroon], c2: [CL.ochre], c3: [CL.ochre], speed: [0.7, 0.9], stride: 1.1 },
  // the lay pilgrim: the white wrap and the turban
  { id: 'man', weight: 2.0, market: 1.4, el: { dress: 'wrap', hat: 'turban', over: 'shawl', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.white, CL.ochre], c2: [CL.white, CL.red], c3: [CL.white], speed: [0.85, 1.1], stride: 1.35 },
  // the woman bringing an offering in a basket on the arm
  { id: 'woman', weight: 2.0, market: 1.6, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'basket', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.red, CL.indigo, CL.ochre, CL.blue], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.92, 0.98] },
  // the water bearer: a pot on the head
  { id: 'jar', weight: 1.4, market: 1.4, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.red, CL.indigo, CL.brown], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the carrier: a pole across the shoulder with its two loads
  { id: 'porter', weight: 1.2, market: 1.4, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', carry: 'pole', arms: 'sack', feet: 'bare' },
    c1: [CL.white, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
