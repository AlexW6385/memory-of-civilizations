// Ottoman Istanbul about 1560 — the moving life (docs/settlements/ottoman-istanbul.md §12): men in the kaftan and turban,
// women in the dark ferace and veil, porters (hamal) bent under loads, water carriers (saka), janissaries in their white
// felt caps, craftsmen and buyers — on the avenues before the külliye's shops, in the outer court, in the covered lanes
// of the market and in the lanes of the timber quarter. Data for the engine's movers (src/engine/movers.js), read in its
// worker; no boats (the Golden Horn lies beyond the settlement). Format as Suzhou's / Khajuraho's.

import { RADIUS, TERRACE, PRECINCT, ARASTA, CARSI, lots, lanes } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 60, night: 6, rain: 0.6, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/**
 * The ways, from layout.js: the two avenues between the outer court's wall and the shops (arasta), the street before the
 * court's north gate and the court's northern forecourt, the street south of the court, the lanes of the covered market,
 * the ring road round the terrace's foot, and the lanes between the rows of timber houses (the free bands lots() leaves:
 * 11–13 m across each column, 10–12 m down each row).
 */
export function walkways() {
  const rects = [];
  const R = (r, weight, kind = 'lane', market = 0) => rects.push({ r, weight, market, kind });
  const [p0, q0, p1, q1] = PRECINCT, a = ARASTA.d, xa = Math.abs(ARASTA.w) - a;
  for (const sg of [-1, 1]) {
    const x0 = sg * 76.5, x1 = sg * (xa - 0.8);
    R([Math.min(x0, x1), q0 - 4, Math.max(x0, x1), q1 + 10], 1.8, 'street', 0.8);                // the avenue
  }
  R([p0 + 8, q0 - 14, p1 - 8, q0 - 2], 1.4, 'street', 0.2);                                         // the street before the north gate
  R([-60, q0 + 3, 60, q0 + 32], 1.2, 'street', 0.1);                                                // the forecourt inside the gate
  R([-146, q1 + 2, 72, q1 + 20], 1.2, 'street', 0.5);                                               // the street south of the court
  const bz = CARSI.lanes;
  for (const l of bz) {
    const horiz = l.horiz, r = horiz ? [l.a, l.c - 2.0, l.b, l.c + 2.0] : [l.c - 2.0, l.a, l.c + 2.0, l.b];
    R(r, 2.2, 'street', 1);                                                                           // the market's lanes: the crowd
  }
  const bd = CARSI.bedesten; R([bd[0] + 3, bd[1] + 3, bd[2] - 3, bd[3] - 3], 1.6, 'street', 1);      // inside the bedesten
  R([-170, -118, 170, -112], 0.9, 'street', 0); R([-170, 158, 170, 164], 0.9, 'street', 0);          // the ring road round the terrace's foot
  R([-169, -118, -163, 164], 0.9, 'street', 0); R([163, -118, 169, 164], 0.9, 'street', 0);
  R([-170, 129, -150, 133], 1.0, 'street', 0.6);                                                      // from the market's west gate to the ring road
  // the lanes of the timber quarter: the grid of cobbled lanes (layout.js lanes), the ones nearer the terrace busier
  for (const { r, vert } of lanes()) {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, pieces = vert ? [[r[1], Math.max(r[1], u0 - 3)], [Math.min(r[3], u1 + 3), r[3]]] : [[r[0], Math.max(r[0], t0 - 3)], [Math.min(r[2], t1 + 3), r[2]]];
    const inT = vert ? cx > t0 - 4 && cx < t1 + 4 : cz > u0 - 4 && cz < u1 + 4;
    for (const [p, q] of inT ? pieces : [vert ? [r[1], r[3]] : [r[0], r[2]]]) if (q - p > 4) {
      const near = Math.max(0, 1 - Math.hypot(Math.max(0, Math.abs(cx) - 150), Math.max(0, Math.abs(cz) - 130)) / 250);
      R(vert ? [r[0], p, r[2], q] : [p, r[1], q, r[3]], 0.35 + near * 0.6, 'lane', near * 0.3);
    }
  }
  void lots;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Dress (docs/settlements/ottoman-istanbul.md §12): the men's long entari or kaftan over the şalvar with the sash (kuşak) and
// a turban wound round a cap (the cloth's colour by community and trade: white, or dyed), the poor in the short cepken and a
// külah; women outdoors in the dark ferace buttoned to the throat and a veil; the janissaries in a long blue or red coat
// and the white felt börk [inferred: our cap, a plain white felt]; porters with their back-loads.
const CL = { white: 'cloth_white', ochre: 'cloth_ochre', red: 'cloth_red', green: 'cloth_green', indigo: 'cloth_indigo', brown: 'cloth_brown', grey: 'cloth_grey', black: 'cloth_black', maroon: 'cloth_maroon', blue: 'cloth_blue' };
export const WALKERS = [
  { id: 'effendi', weight: 1.5, market: 1.5, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'sash', beard: true, arms: 'hang' },
    c1: [CL.indigo, CL.green, CL.maroon, CL.brown, CL.red], c2: [CL.white, CL.ochre], c3: [CL.white, CL.white, CL.white, CL.green], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'craftsman', weight: 1.4, market: 1.6, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'sash', beard: true, arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.indigo, CL.ochre, CL.white], c2: [CL.white, CL.brown], c3: [CL.white, CL.red, CL.indigo], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'woman', weight: 1.1, market: 1.1, el: { dress: 'robe', hair: 'long', hat: 'veil', arms: 'hang' }, swing: 0.7,
    c1: [CL.black, CL.indigo, CL.brown, CL.black], c2: [CL.white, CL.black], c3: [CL.black, CL.indigo], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'janissary', weight: 0.5, market: 0.9, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', beard: true, arms: 'hang' },
    c1: [CL.blue, CL.blue, CL.red], c2: [CL.red, CL.blue], c3: [CL.white], speed: [1.1, 1.35], stride: 1.5 },
  { id: 'hamal', weight: 1.0, market: 1.8, el: { dress: 'robe', hair: 'short', hat: 'cap', carry: 'bundle', over: 'sash', beard: true, arms: 'straps' }, swing: 0.75,
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.white, CL.brown], c3: [CL.red, CL.white, CL.brown], speed: [0.85, 1.1], stride: 1.1 },
  { id: 'saka', weight: 0.5, market: 0.5, el: { dress: 'robe', hair: 'short', hat: 'cap', carry: 'bundle', over: 'sash', beard: true, arms: 'straps' }, swing: 0.75,
    c1: [CL.brown, CL.indigo, CL.grey], c2: [CL.white, CL.brown], c3: [CL.red, CL.brown], speed: [0.9, 1.15], stride: 1.15 },
  { id: 'boy', weight: 0.5, market: 0.8, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang' }, h: [0.62, 0.8],
    c1: [CL.white, CL.red, CL.green, CL.ochre], c2: [CL.white, CL.brown], c3: [CL.red, CL.white], speed: [1.2, 1.6], stride: 1.25 },
];
export const CREW = {
  boatman: { el: { dress: 'robe', hair: 'short', hat: 'cap', arms: 'hang' }, c1: [CL.brown], c2: [CL.white], c3: [CL.red] },
  passenger: { el: { dress: 'robe', hair: 'short', hat: 'turban', pose: 'cross' }, c1: [CL.indigo], c2: [CL.white], c3: [CL.white] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none: the Golden Horn lies beyond the settlement's edge */ }
