// Babylon about 570 BC — the moving life (docs/settlements/babylon.md §12): Babylonians in the dress Herodotus gives
// (1.195: a linen tunic to the feet, a woollen one over it, a white mantle; long hair, a carved staff), priests of
// Marduk in white linen with the head shaved, scribes, porters with sacks and baskets, workmen in the short tunic,
// women veiled, women with water jars on the head, boys; on the Processional Way, in the precinct, at the market by
// the bridge, along the quay, over the bridge and on the road south of Esagila. Data for the engine's movers
// (src/engine/movers.js, read in its worker); the ways come from layout.js. No moving boats (the round boats of
// plan.js lie at the quay or on the stream).

import { RADIUS, WAY, WALL_Z, PALACE, PRECINCT, ESAGILA, BRIDGE, MARKET, QUAY, riverX } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 52, night: 4, rain: 0.5, reach: 170, spawnMin: 26, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the Processional Way (and through the gate), the precinct's lanes, the street to Esagila, the market, the bridge, the quay walk, the south road, the palace's east court. */
export function walkways() {
  const rects = [], links = [], w = 8;
  // the Way north and south of the gate, the passage under it
  rects.push({ r: [WAY.x - w, WAY.z0 + 14, WAY.x + w, WALL_Z - 20], weight: 2.2, market: 0.6, kind: 'street' });
  rects.push({ r: [WAY.x - w, WALL_Z + 40, WAY.x + w, WAY.z1 - 2], weight: 3.4, market: 1.2, kind: 'street' });
  links.push({ a: [WAY.x, WALL_Z - 20], b: [WAY.x, WALL_Z + 40], w: 2.2, kind: 'street', weight: 2.2 });
  // the precinct of Etemenanki: the lanes round the tower, the gate on the north (the Way's end) and on the south (to Esagila)
  const [p0, q0, p1, q1] = PRECINCT, zig = 50;
  rects.push({ r: [p0 + 8, q0 + 6, p1 - 8, q0 + 40], weight: 1.8, market: 0.3, kind: 'street' });
  rects.push({ r: [p0 + 8, q0 + 40, -zig - 6, q1 - 8], weight: 1.1, market: 0.2, kind: 'street' });
  rects.push({ r: [zig + 6, q0 + 40, p1 - 8, q1 - 8], weight: 1.1, market: 0.2, kind: 'street' });
  rects.push({ r: [-zig - 6, q1 - 50, zig + 6, q1 - 8], weight: 1.6, market: 0.3, kind: 'street' });
  links.push({ a: [WAY.x, WAY.z1 - 2], b: [WAY.x, q0 + 10], w: 3, kind: 'street', weight: 2 });
  // from the precinct's south gate to Esagila's north gate and into its court (priests, the faithful)
  const ez = (ESAGILA[1] + ESAGILA[3]) / 2, ex = ESAGILA[0] + 32;
  links.push({ a: [0, q1 - 8], b: [0, ESAGILA[1] + 10], w: 3, kind: 'street', weight: 1.4 });
  rects.push({ r: [ex + 2, ez - 14, ex + 28, ez + 14], weight: 1.3, market: 0.1, kind: 'street' });
  links.push({ a: [0, ESAGILA[1] + 10], b: [ex + 6, ez - 8], w: 2.4, kind: 'street', weight: 1.0 });
  // the market at the bridge's east end, the road onto the bridge, the bridge
  rects.push({ r: [MARKET[0] + 4, MARKET[1] + 6, MARKET[2] - 4, MARKET[3] - 6], weight: 2.8, market: 3, kind: 'street' });
  const xr = riverX(BRIDGE.z);
  links.push({ a: [xr - 44, BRIDGE.z], b: [xr + 44, BRIDGE.z], w: 3, kind: 'bridge', weight: 1.4 });
  links.push({ a: [xr + 44, BRIDGE.z], b: [MARKET[0] + 6, BRIDGE.z - 2], w: 2.4, kind: 'street', weight: 1.4 });
  // the walk on the quay wall's foot, along the bank (a polyline of the river's bend)
  const d = QUAY.d0 + 6.5;
  for (let z = QUAY.z0 + 10; z < QUAY.z1 - 30; z += 20) {
    if (Math.abs(z - BRIDGE.z) < 16 || Math.abs(z + 20 - BRIDGE.z) < 16) continue;
    links.push({ a: [riverX(z) + d, z], b: [riverX(z + 20) + d, z + 20], w: 1.8, kind: 'street', weight: 0.8, market: 0.4 });
  }
  // the road along the south side of the city (the lots leave a lane at z ≈ 300), from the river eastwards
  rects.push({ r: [riverX(300) + 56, 294, 150, 306], weight: 1.0, market: 0.4, kind: 'street' });
  // the Southern Palace: the way in at its east gate and the east court
  links.push({ a: [WAY.x - 8, PALACE[1] + 49], b: [PALACE[2] - 14, PALACE[1] + 49], w: 2.2, kind: 'street', weight: 0.9 });
  rects.push({ r: [PALACE[2] - 42, PALACE[1] + 28, PALACE[2] - 16, PALACE[1] + 72], weight: 0.9, market: 0.1, kind: 'street' });
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', grey: 'cloth_grey', linen: 'linen', maroon: 'cloth_maroon' };
export const WALKERS = [
  // the citizen: the long linen tunic, the woollen one over it, the white mantle; long hair, a beard, a carved staff in some hands
  { id: 'citizen', weight: 2.2, market: 1.6, el: { dress: 'robe', hat: 'none', over: 'cape', arms: 'hang', hair: 'long', beard: 1 },
    c1: [CL.linen, CL.white, CL.ochre, CL.brown], c2: [CL.white, CL.white, CL.indigo, CL.red], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.4 },
  { id: 'elder', weight: 0.9, market: 0.9, el: { dress: 'robe', hat: 'none', over: 'cape', arms: 'staff', hair: 'long', beard: 1, carry: 'staff' },
    c1: [CL.white, CL.linen, CL.grey], c2: [CL.white, CL.maroon], c3: [CL.brown], speed: [0.6, 0.8], stride: 1.25 },
  // the priest of Marduk: a robe of white linen, the head shaved, the sash
  { id: 'priest', weight: 1.0, market: 0.3, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'shaven', beard: 0 },
    c1: [CL.white, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.7, 0.9], stride: 1.3 },
  // the scribe, with a stylus-case at the belt (a robe, the second garment a sash), going between temple and market
  { id: 'scribe', weight: 0.6, market: 0.9, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'long', beard: 1 },
    c1: [CL.linen, CL.ochre, CL.white], c2: [CL.brown, CL.indigo], c3: [CL.brown], speed: [0.85, 1.05], stride: 1.35 },
  // the woman: the long robe, a veil over the hair
  { id: 'woman', weight: 1.2, market: 1.7, el: { dress: 'robe', hat: 'veil', over: 'shawl', arms: 'hang', hair: 'bun' }, swing: 0.7,
    c1: [CL.white, CL.red, CL.ochre, CL.indigo, CL.linen], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.0, market: 1.2, el: { dress: 'robe', hat: 'none', over: 'shawl', hair: 'bun', carry: 'pot', arms: 'head' }, swing: 0.5,
    c1: [CL.white, CL.red, CL.ochre, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the workman and the boatman ashore: the short tunic belted, bare legs and feet; a basket or a sack of dates or grain on the back
  { id: 'workman', weight: 1.4, market: 1.3, el: { dress: 'tunic', legs: 'bare', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: 0.6, feet: 'bare' },
    c1: [CL.brown, CL.linen, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.95, 1.25], stride: 1.3 },
  { id: 'porter', weight: 1.1, market: 1.7, el: { dress: 'tunic', legs: 'bare', hat: 'none', over: 'belt', arms: 'hang', carry: 'basket', hair: 'long', beard: 0.5, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'sacker', weight: 0.9, market: 1.4, el: { dress: 'tunic', legs: 'bare', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'long', beard: 0.6, feet: 'bare' },
    c1: [CL.brown, CL.linen, CL.grey], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.8, el: { dress: 'tunic', legs: 'bare', hat: 'none', arms: 'hang', hair: 'short', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
