// Nasrid Granada about 1390 — the moving life (docs/settlements/granada.md §13): men in turbans and tunics with cloaks,
// veiled women in long robes, merchants of the Alcaicería, water-carriers, porters, walking the Carrera del Darro, the
// bridges, the narrow lanes of the Albaicín and the medina, the lanes of the silk market. Data for the engine's movers
// (src/engine/movers.js), read in its worker. The Darro is not sailed on: the boats' parts are empty.
// Format as Suzhou's (src/settlements/ming-suzhou/movers.js). The coordinator registers it in src/engine/movers-sites.js.

import { RADIUS, DARRO, DARRO_BRIDGES, SOUK, MEDINA_LANES, MEDINA_X } from './layout.js';
import { soukPlan } from '../../styles/nasrid/medina.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';
import { COURT_WAYS } from './court.js';

export const PARAMS = {
  walkers: { day: 36, night: 4, rain: 0.8, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/** The ways: the Carrera del Darro on both banks and the bridges, the lanes of the medina, the Albaicín's and the south town's, the Alcaicería's. */
export function walkways() {
  const rects = [], links = [], dz = DARRO.z, off = DARRO.w + 0.7;
  const lane = (r, weight = 0.7, market = 0, kind = 'lane') => rects.push({ r, weight, market, kind });
  // the Carrera del Darro: the street between the quay's parapet and the slope, both banks
  lane([-318, dz - off - 3.4, 318, dz - off - 0.6], 1.6, 0.2, 'street');
  lane([-318, dz + off + 0.6, 318, dz + off + 3.4], 1.0, 0.1, 'street');
  for (const b of DARRO_BRIDGES) links.push({ a: [b.x, dz - off - 2], b: [b.x, dz + off + 2], w: b.width / 2, kind: 'bridge', weight: 1.4 });
  // the Albaicín and the south town: the lanes between the rows of lots (z at 10.5 past the row, x at 11.5 past the column)
  const gz = (j) => -380 + 20 + 11 * j - 20 + 10.5, gx = (i) => -380 + 20 + 12 * i - 20 + 11.5;
  for (let j = 0; j < 70; j++) { const z = gz(j); if ((z > -330 && z < -128) || (z > 160 && z < 330)) if (j % 2 === 0) lane([-318, z - 0.6, 318, z + 0.6], 0.6, 0); }
  for (let i = 0; i < 52; i += 3) { const x = gx(i); lane([x - 0.6, -330, x + 0.6, -128], 0.5, 0); if (x < -100 || x > 40) lane([x - 0.6, 160, x + 0.6, 330], 0.5, 0); }
  // the ways from the Darro up into the Albaicín, and the market's approaches in the south
  for (const b of DARRO_BRIDGES) lane([b.x - 0.8, -150, b.x + 0.8, dz - off - 2], 0.9, 0.2);
  // the medina inside the walls: the three lanes between the rows, the cross lanes between the houses' columns
  for (const z of MEDINA_LANES) for (const [a, b] of z === 26.25 ? [[-104, -8], [78, 200]] : z === 1.25 ? [[-104, -8], [93, 200]] : [[-104, -8], [125, 200]]) lane([a, z - 1.2, b, z + 1.2], 0.8, 0);
  lane([-164, -3.4, -104, 3.4], 1.0, 0, 'street');
  for (let k = 0; k < 8; k++) { const x = MEDINA_X(k); if (x < -8) lane([x - 1.4, -34, x + 1.4, 47], 0.6, 0); }
  // the Alcaicería: its lanes busy by day, the approaches outside its four gates
  const P = soukPlan(SOUK);
  for (const r of P.lanes) lane(r, 2.6, 1, 'street');
  const [sx0, sz0, sx1, sz1] = SOUK;
  for (const g of P.gates) {
    const o = 16;
    lane(g.side === 'w' ? [sx0 - o, g.at - 1.1, sx0 + 0.6, g.at + 1.1] : g.side === 'e' ? [sx1 - 0.6, g.at - 1.1, sx1 + o, g.at + 1.1] : g.side === 'n' ? [g.at - 1.1, sz0 - o, g.at + 1.1, sz0 + 0.6] : [g.at - 1.1, sz1 - 0.6, g.at + 1.1, sz1 + o], 1.4, 0.8);
  }
  rects.push(...COURT_WAYS);
  return { rects: rects.filter((r) => r.r), links, clip: RADIUS - 12 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Men: the turban (imama) of white cloth over a cap, a tunic (aljuba) with a cloak (the burnous) over it, sashes; the
// poor in a plain tunic and a skullcap; merchants in good cloth; women veiled in long robes (the haik), their colours
// white, ochre, red and indigo; porters and water-carriers in tunics with bare legs, a jar or a basket; boys in short tunics.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'merchant', weight: 1.3, market: 2.2, el: { dress: 'robe', hair: 'short', beard: true, hat: 'turban', over: 'sash', arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.blue, CL.green, CL.maroon], c2: [CL.white, CL.white, CL.red], c3: [CL.white], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'cloaked', weight: 1.3, market: 1.0, el: { dress: 'robe', hair: 'short', beard: true, hat: 'turban', over: 'cloak', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.white, CL.indigo], c2: [CL.white, CL.brown], c3: [CL.white, CL.ochre], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'townsman', weight: 1.0, market: 1.0, el: { dress: 'tunic', hair: 'short', beard: true, hat: 'cap', over: 'belt', arms: 'hang' },
    c1: [CL.brown, CL.ochre, CL.white, CL.grey], c2: [CL.white, CL.brown], c3: [CL.white], speed: [1.05, 1.3], stride: 1.45 },
  { id: 'woman', weight: 1.4, market: 1.2, el: { dress: 'robe', hair: 'long', hat: 'veil', over: 'collar', arms: 'hang' }, swing: 0.7,
    c1: [CL.white, CL.white, CL.ochre, CL.red, CL.indigo], c2: [CL.white, CL.white], c3: [CL.white], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'water_carrier', weight: 0.6, market: 0.3, el: { dress: 'tunic', hair: 'short', beard: true, hat: 'cap', over: 'belt', carry: 'pot', legs: 'bare', arms: 'hang' },
    c1: [CL.brown, CL.ochre], c2: [CL.white], c3: [CL.white], speed: [0.95, 1.2], stride: 1.3 },
  { id: 'porter', weight: 0.7, market: 0.9, el: { dress: 'tunic', hair: 'short', beard: true, hat: 'cap', carry: 'basket', legs: 'bare', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.white], c3: [CL.white], speed: [1.0, 1.25], stride: 1.3 },
];
export const CREW = {
  boatman: { el: { dress: 'tunic', hair: 'short', hat: 'cap', arms: 'pull' }, c1: [CL.brown], c2: [CL.white], c3: [CL.white] },
  passenger: { el: { dress: 'robe', hair: 'short', hat: 'turban', pose: 'cross' }, c1: [CL.white], c2: [CL.white], c3: [CL.white] },
};
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
export function boatShapes() { /* none */ }
