// Fez about 1350 — the moving life (docs/settlements/fez.md §8): Fassi men in djellabas and turbans, veiled women, merchants of the
// Attarine souk and the Kissaria, water-carriers, porters and students walking the Talaa Kebira, the derbs and the bridges of the
// Oued Fes. Data for the engine's movers (src/engine/movers.js), read in its worker. The river is not sailed on: no boats.
// Format as Granada's. The coordinator registers it in src/engine/movers-sites.js.

import { RADIUS, RIVER, BRIDGES, SOUKS, soukRects, lanes, riverZ, K } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 5, rain: 0.8, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 0, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: -100,
};

/** The ways: the lanes and derbs, the Talaa Kebira, the covered souks' strips, the quays and the bridges. */
export function walkways() {
  const rects = [], links = [];
  const lane = (r, weight = 0.5, market = 0, kind = 'lane') => rects.push({ r, weight, market, kind });
  for (const l of lanes()) {
    const named = l.kind === 'street';
    const c = l.r;
    if (c[2] - c[0] < 1 || c[3] - c[1] < 1) continue;
    lane(c, named ? 1.4 : 0.45, 0, named ? 'street' : 'lane');
  }
  lane([-300, K.z - K.w / 2, 46, K.z + K.w / 2], 1.6, 0.3, 'street');
  for (const s of SOUKS) {
    const horiz = Math.abs(s.a[1] - s.b[1]) < 0.1, hw = s.w / 2;
    lane(horiz ? [Math.min(s.a[0], s.b[0]), s.a[1] - hw, Math.max(s.a[0], s.b[0]), s.a[1] + hw] : [s.a[0] - hw, Math.min(s.a[1], s.b[1]), s.a[0] + hw, Math.max(s.a[1], s.b[1])], 2.6, 1, 'street');
  }
  void soukRects;
  // the quays along the river, both banks, and the bridges between them
  const q = RIVER.strip - 2.2;
  for (let x = -300; x < 300; x += 20) {
    const z = riverZ(x + 10), w = RIVER.w / 2;
    lane([x, z - w - q, x + 20, z - w - 1.0], 0.5, 0.1, 'street');
    lane([x, z + w + 1.0, x + 20, z + w + q], 0.5, 0.1, 'street');
  }
  for (const b of BRIDGES) links.push({ a: [b.x, riverZ(b.x) - RIVER.w / 2 - 2], b: [b.x, riverZ(b.x) + RIVER.w / 2 + 2], w: b.w / 2, kind: 'bridge', weight: 1.2 });
  return { rects, links, clip: RADIUS - 12 };
}
export function waterways() { return { rects: [], bridges: [], clip: 0 }; }
export async function staticBoats() { return []; }

// Men: the turban (imama) over a skullcap, the djellaba (hooded, long-sleeved robe) in wool, white or brown; students in white with a
// cap; the poor in a plain tunic; merchants in good cloth; women veiled in long robes (haik), white, ochre, indigo; water-carriers and
// porters in tunics with bare legs, a jar or a basket; boys in short tunics.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'merchant', weight: 1.3, market: 2.2, el: { dress: 'robe', hair: 'short', beard: true, hat: 'turban', over: 'sash', arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.blue, CL.green, CL.maroon], c2: [CL.white, CL.white, CL.red], c3: [CL.white], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'djellaba', weight: 1.5, market: 1.0, el: { dress: 'robe', hair: 'short', beard: true, hat: 'cap', over: 'cloak', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.white, CL.indigo], c2: [CL.white, CL.brown], c3: [CL.white, CL.ochre], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'scholar', weight: 0.8, market: 0.3, el: { dress: 'robe', hair: 'short', beard: true, hat: 'turban', over: 'collar', arms: 'hang' },
    c1: [CL.white, CL.white, CL.grey], c2: [CL.white], c3: [CL.white], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'woman', weight: 1.3, market: 1.2, el: { dress: 'robe', hair: 'long', hat: 'veil', over: 'collar', arms: 'hang' }, swing: 0.7,
    c1: [CL.white, CL.white, CL.ochre, CL.indigo, CL.red], c2: [CL.white, CL.white], c3: [CL.white], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'water_carrier', weight: 0.6, market: 0.3, el: { dress: 'tunic', hair: 'short', beard: true, hat: 'cap', over: 'belt', carry: 'pot', legs: 'bare', arms: 'hang' },
    c1: [CL.brown, CL.ochre], c2: [CL.white], c3: [CL.white], speed: [0.95, 1.2], stride: 1.3 },
  { id: 'porter', weight: 0.8, market: 0.9, el: { dress: 'tunic', hair: 'short', beard: true, hat: 'cap', carry: 'basket', legs: 'bare', arms: 'hang' },
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
