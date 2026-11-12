// Classic Maya Tikal c. 750 — the moving life (docs/settlements/maya-tikal.md §10): men in loincloth and cape, women in the long white
// cotton dress, nobles and priests in long cloaks and caps, bearers with jars and baskets on the head, porters on the causeways,
// boys. Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js: the Great Plaza,
// the causeways, the East Plaza's market and the lanes between the patio groups (the 38 m grid's gaps). No boats.

import { RADIUS, PLAZA, CAUSEWAYS, RESERVOIRS, CORE, inRect } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 70, night: 5, rain: 0.5, reach: 190, spawnMin: 22, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: RESERVOIRS[0].water,
};

/** The ways: the plaza (busiest), the market, the causeways, and the lanes in the gaps between the groups outside the core. */
export function walkways() {
  const rects = [], links = [], clip = RADIUS - 14;
  rects.push({ r: [PLAZA[0] + 2, PLAZA[1] + 3, PLAZA[2] - 2, PLAZA[3] - 3], weight: 2.4, market: 2.0, kind: 'street' });
  rects.push({ r: [86, 24, 138, 62], weight: 1.8, market: 2.6, kind: 'street' });
  rects.push({ r: [98, -34, 102, 26], weight: 0.8, market: 0.8, kind: 'street' });
  // the causeways: straight legs as rects, diagonals in overlapping squares
  for (const c of CAUSEWAYS) for (let i = 0; i + 1 < c.pts.length; i++) {
    const [a, b] = [c.pts[i], c.pts[i + 1]], hw = c.w / 2 - 0.8;
    if (a[0] === b[0] || a[1] === b[1]) rects.push({ r: [Math.min(a[0], b[0]) - hw, Math.min(a[1], b[1]) - hw, Math.max(a[0], b[0]) + hw, Math.max(a[1], b[1]) + hw], weight: 1.2, market: 0.5, kind: 'street' });
    else { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(L / 5); for (let k = 0; k <= n; k++) { const x = a[0] + (b[0] - a[0]) * k / n, z = a[1] + (b[1] - a[1]) * k / n; rects.push({ r: [x - hw, z - hw, x + hw, z + hw], weight: 0.9, market: 0.3, kind: 'street' }); } }
  }
  // the lanes: the gaps between the groups' rows, at −262 + 38 i, on both axes, outside the core
  for (let i = 0; i < 15; i++) {
    const c = -262 + 38 * i;
    if (Math.abs(c) > clip - 20) continue;
    const reach = Math.sqrt(Math.max(0, clip * clip - c * c));
    for (const [a, b] of [[-reach, CORE[1] - 6], [CORE[3] + 6, reach]]) if (c > CORE[0] - 20 && c < CORE[2] + 20) rects.push({ r: [c - 1.5, a, c + 1.5, b], weight: 0.4, market: 0.1, kind: 'lane' });
    for (const [a, b] of [[-reach, CORE[0] - 6], [CORE[2] + 6, reach]]) if (c > CORE[1] - 20 && c < CORE[3] + 20) rects.push({ r: [a, c - 1.5, b, c + 1.5], weight: 0.4, market: 0.1, kind: 'lane' });
    if (!(c > CORE[0] - 20 && c < CORE[2] + 20)) rects.push({ r: [c - 1.5, -reach, c + 1.5, reach], weight: 0.35, market: 0.1, kind: 'lane' });
    if (!(c > CORE[1] - 20 && c < CORE[3] + 20)) rects.push({ r: [-reach, c - 1.5, reach, c + 1.5], weight: 0.35, market: 0.1, kind: 'lane' });
  }
  return { rects: rects.filter((q) => !inRect(RESERVOIRS[0].c.concat(RESERVOIRS[0].c).map((v, i) => v + (i < 2 ? -30 : 30)), (q.r[0] + q.r[2]) / 2, (q.r[1] + q.r[3]) / 2)), links, clip };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', blue: 'cloth_blue', brown: 'cloth_brown', indigo: 'cloth_indigo' };
export const WALKERS = [
  { id: 'man', weight: 2.0, market: 1.6, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'cape', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.white, CL.ochre, CL.red], c2: [CL.white, CL.ochre, CL.blue, CL.red], c3: [CL.brown], speed: [0.9, 1.2], stride: 1.4 },
  { id: 'workman', weight: 1.1, market: 1.0, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.red, CL.brown], c3: [CL.brown], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.white, CL.white, CL.white, CL.ochre], c2: [CL.red, CL.blue, CL.ochre, CL.white], c3: [CL.white], speed: [0.8, 1.05], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.5, market: 1.6, el: { dress: 'robe', hat: 'none', over: 'sash', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.white, CL.white, CL.ochre], c2: [CL.red, CL.white], c3: [CL.white], speed: [0.75, 0.98], stride: 1.15, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.2, market: 1.2, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.brown, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  // the noble: a long cloak over the robe, a feathered cap
  { id: 'noble', weight: 0.6, market: 0.5, el: { dress: 'robe', hat: 'cap', hatMat: 'stucco_leaf', over: 'cloak', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.white], c2: [CL.red, CL.blue, CL.red], c3: [CL.red, CL.blue], speed: [0.7, 0.9], stride: 1.2 },
  { id: 'priest', weight: 0.6, market: 0.3, el: { dress: 'robe', hat: 'cap', hatMat: 'stucco_leaf', over: 'cloak', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.white], c2: [CL.red, CL.blue, CL.red], c3: [CL.red, CL.blue], speed: [0.75, 0.95], stride: 1.25 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' },
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
