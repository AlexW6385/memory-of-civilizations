// Nalanda — the moving life (docs/settlements/nalanda.md §9): monks in ochre and maroon robes crossing the sacred way
// between the monasteries, the temples and the library; novices and lay students in white; teachers; porters
// with poles, women with water pots to the tanks, villagers. Data for the engine's movers (src/engine/movers.js, read in its
// worker); the ways come from layout.js. No boats.
import { RADIUS, WAY, MONASTERIES, TEMPLES, TANKS, T3, LIBRARY, lots, mgate, ANNEXES } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 46, night: 3, rain: 0.5, reach: 160, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the sacred way, each monastery's approach through its gate to the shrine, the lanes between the monasteries to the tanks' ghats, the temples' foot, the library's, the village lanes. */
export function walkways() {
  const rects = [], R = (r, weight, kind = 'lane', market = 0) => rects.push({ r, weight, market, kind });
  R([WAY.x0 + 1, -138, WAY.x1 - 1, 126], 2.6, 'street', 0.2);
  for (const m of MONASTERIES) {
    const [gx, gz] = mgate(m);
    R([WAY.x1 - 1, gz - 1.3, gx + 30, gz + 1.3], 1.6, 'lane');            // through the gate and the court to the shrine
  }
  for (const t of TANKS[0].ghats) R([WAY.x1 - 1, t.at - 1.4, TANKS[0].rect[0] - 3, t.at + 1.4], 1.0);            // the lanes between the monasteries down to the ghats
  const ts = T3.c[0] + T3.half + 6;
  R([ts - 1, -40, ts + 1.5, 40], 1.0);                                       // along the foot of the great temple's stair
  for (const t of TEMPLES.slice(1)) R([t.c[0] + t.half + t.tierH * 1.04 + 1, t.c[1] - 3, WAY.x0 + 1, t.c[1] + 3], 0.8);
  R([LIBRARY.yard[2] - 1, -93.5, WAY.x0 + 1, -90.5], 1.0);                  // to the library's gate
  R([TANKS[2].rect[2] - 3, -43.5, WAY.x0 + 1, -40.5], 0.6);                  // to the north-west tank
  R([WAY.x0 + 1, 124.5, 175, 127.5], 1.2, 'street', 0.3);                    // the road to the village and the south tank
  R([-3, 126, 3, 131], 0.6);
  R([124, -105, 128, 150], 0.8, 'street', 0.3);
  for (let z = 92; z < 152; z += 13) R([72, z + 8.6, 176, z + 11.6], 0.7, 'lane', 0.3);
  for (let x = 134; x < 180; x += 13) R([x + 10.2, -105, x + 12.8, 90], 0.5);
  R([-6, -147, 6, -135], 0.8);                                                // round the great stupa at the way's north end
  R([-5, 114, 5, 124], 1.8, 'street', 0.3);                                  // through the gate
  R([40, 126, 125, 130.5], 1.4, 'street', 1.6);                              // the bazaar on the road to the village
  R([128, -92, 134, 88], 1.2, 'street', 1.6);                                // and along the village's main street
  R([LIBRARY.yard[0] + 2, -93.5, LIBRARY.yard[2] - 1, -90.5], 0.8);          // between the library's halls
  for (const a of ANNEXES) R([a.rect[0] - 2, a.rect[3] + 0.5, a.rect[2] + 2, a.rect[3] + 3], 0.7);
  void lots;
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', maroon: 'cloth_maroon' };
export const WALKERS = [
  // the monk: the robe over one shoulder, shaven, barefoot
  { id: 'monk', weight: 4.0, market: 0.6, el: { dress: 'robe', cloth: CL.ochre, hat: 'none', over: 'sash', arms: 'hang', hair: 'shaven', feet: 'bare', beard: 0 },
    c1: [CL.ochre, CL.maroon, CL.maroon], c2: [CL.ochre], c3: [CL.ochre], speed: [0.7, 0.95], stride: 1.1 },
  // the novice with books or water: a pot in the arm
  { id: 'novice', weight: 1.6, market: 0.6, el: { dress: 'robe', cloth: CL.ochre, hat: 'none', over: 'sash', carry: 'pot', arms: 'hang', hair: 'shaven', feet: 'bare', beard: 0 }, swing: 0.6,
    c1: [CL.ochre, CL.maroon], c2: [CL.ochre], c3: [CL.ochre], speed: [0.8, 1.0], stride: 1.15, h: [0.82, 0.92] },
  // the lay student or teacher in white, a turban on some
  { id: 'lay', weight: 1.6, market: 1.2, el: { dress: 'wrap', hat: 'turban', over: 'shawl', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.white, CL.ochre], c2: [CL.white, CL.red], c3: [CL.white], speed: [0.85, 1.1], stride: 1.35 },
  { id: 'woman', weight: 1.4, market: 1.6, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'basket', arms: 'hang', hair: 'bun', feet: 'bare' }, swing: 0.7,
    c1: [CL.red, CL.indigo, CL.ochre, CL.blue], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.92, 0.98] },
  { id: 'jar', weight: 1.2, market: 1.4, el: { dress: 'wrap', hat: 'none', over: 'shawl', carry: 'pot', arms: 'head', hair: 'bun', feet: 'bare' }, swing: 0.5,
    c1: [CL.red, CL.indigo, CL.brown], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.0, market: 1.4, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', carry: 'pole', arms: 'sack', feet: 'bare' },
    c1: [CL.white, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.5, market: 0.7, el: { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', arms: 'hang', feet: 'bare' },
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
