// SG̱ang Gwaay c. 1850 — the moving life (docs/settlements/sgang-gwaay.md §9): people along the street between the houses and the
// water, down to the canoes and the racks, round the ends of the row and up the trails behind: women in the cedar-bark cape and
// the conical spruce-root hat, bearing baskets and bundles; men in the bark cape or a trade blanket, with paddles and fish
// on a pole; elders, children. No moving boats: the canoes lie drawn up on the beach or moored (their paddling is not built).
import { RADIUS, SEA, houses, arc, shoreX } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 36, night: 4, rain: 0.8, reach: 150, spawnMin: 34, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: SEA,
};

/** The ways: the street along the row (the fronts' distance 9–13 m off the arc, in 10 m lengths), the beach path, a way from each house's front to the street, the ends. */
export function walkways() {
  const rects = [], links = [], H = houses();
  for (let z = -150; z <= 150; z += 10) {
    const x = arc(z + 5);
    rects.push({ r: [x - 11, z - 0.5, x - 8.2, z + 10.5], weight: 1.5, market: 1.2, kind: 'street' });
    rects.push({ r: [x - 4.8, z - 0.5, x - 2.2, z + 10.5], weight: 0.9, market: 0.8, kind: 'lane' });
  }
  for (const h of H) {
    const [fx, fz] = h.front, d0 = h.d / 2 + 1.5, a = [h.c[0] + fx * d0 + (h.w * 0.0), h.c[1] + fz * d0], b = [arc(h.c[1]) - 9.6 * fx, h.c[1]];
    links.push({ a, b, w: 1.6, kind: 'street', weight: 1.0 });
  }
  // the lane across the front of the row also joins to the street (every 30 m)
  for (let z = -140; z <= 140; z += 30) links.push({ a: [arc(z) - 11, z], b: [arc(z) - 3.5, z], w: 1.5, kind: 'lane', weight: 0.6 });
  void shoreX;
  return { rects, links, clip: RADIUS - 28 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { bark: 'roof_bark', brown: 'cloth_brown', ochre: 'cloth_ochre', tan: 'hide_tan', black: 'cloth_black', white: 'cloth_white', red: 'cloth_red', grey: 'cloth_grey' };
export const WALKERS = [
  { id: 'woman', weight: 2.0, market: 1.5, el: { dress: 'wrap', hat: 'straw', over: 'cape', arms: 'hang', hair: 'long', feet: 'bare' }, swing: 0.7,
    c1: [CL.bark, CL.brown, CL.tan, CL.ochre], c2: [CL.brown, CL.black], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'basket', weight: 1.4, market: 1.1, el: { dress: 'wrap', hat: 'straw', over: 'cape', carry: 'basket', arms: 'head', hair: 'long', feet: 'bare' }, swing: 0.5,
    c1: [CL.bark, CL.brown, CL.tan], c2: [CL.brown], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'man', weight: 1.8, market: 1.2, el: { dress: 'tunic', legs: 'bare', hat: 'straw', over: 'cape', arms: 'hang', hair: 'bun', beard: false, feet: 'bare' },
    c1: [CL.bark, CL.brown, CL.tan], c2: [CL.brown, CL.red], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'fisher', weight: 1.0, market: 0.8, el: { dress: 'tunic', legs: 'bare', hat: 'none', over: 'belt', carry: 'pole', arms: 'pole', hair: 'bun', beard: false, feet: 'bare' }, swing: 0.75,
    c1: [CL.brown, CL.tan], c2: [CL.bark], c3: [CL.black], speed: [1.0, 1.25], stride: 1.3, pole: true },
  { id: 'elder', weight: 0.8, market: 0.6, el: { dress: 'wrap', hat: 'straw', over: 'cloak', arms: 'staff', carry: 'staff', hair: 'long', feet: 'bare' },
    c1: [CL.grey, CL.brown, CL.white], c2: [CL.red, CL.white], c3: [CL.black], speed: [0.65, 0.85], stride: 1.0 },
  { id: 'child', weight: 0.8, market: 0.8, el: { dress: 'wrap', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: false, feet: 'bare' },
    c1: [CL.bark, CL.brown, CL.tan], c2: [CL.brown], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
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
