// Çatalhöyük c. 6500 BC — the moving life (docs/settlements/catalhoyuk.md §7): people on the trodden ground round the town and out to
// the pens and the marsh: women with a basket or a jar on the head, men with a bundle of reeds or a pole, children, an elder in a
// leopard-skin cloak. Dress [inferred, §7]: wraps and skirts of hide and woven fibre, bare feet, loose hair. No boats. Data for the
// engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js. (The roofs, where much of the town's life
// is, are peopled by town.js, still.)

import { RADIUS, CLUSTER, PENS, MARSH } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 3, rain: 0.5, reach: 120, spawnMin: 14, far: 40 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: MARSH.water,
};

/** The ways: a path round the town 3 m wide, paths out to the two pens, east and west across the plain, and south to the marsh. */
export function walkways() {
  const [x0, z0, x1, z1] = CLUSTER, rects = [], w = 1.6;
  rects.push({ r: [x0 - 4.5, z0 - 4.5, x1 + 4.5, z0 - 1.5], weight: 1.0, market: 0.8, kind: 'street' });
  rects.push({ r: [x0 - 4.5, z1 + 1.5, x1 + 4.5, z1 + 4.5], weight: 1.6, market: 1.2, kind: 'street' });
  rects.push({ r: [x0 - 4.5, z0 - 4.5, x0 - 1.5, z1 + 4.5], weight: 1.0, market: 0.8, kind: 'street' });
  rects.push({ r: [x1 + 1.5, z0 - 4.5, x1 + 4.5, z1 + 4.5], weight: 1.0, market: 0.8, kind: 'street' });
  for (const p of PENS) {
    const [a, b, c, d] = p.rect, my = (b + d) / 2;
    if (p.gate === 'w') rects.push({ r: [x1 + 1.5, my - w, a - 0.5, my + w], weight: 0.7, market: 0.2, kind: 'lane' });
    else rects.push({ r: [c + 0.5, my - w, x0 - 1.5, my + w], weight: 0.7, market: 0.2, kind: 'lane' });
  }
  rects.push({ r: [x1 + 4.5, z1 - 3, RADIUS - 24, z1], weight: 0.5, market: 0.1, kind: 'lane' });
  rects.push({ r: [-RADIUS + 24, z1 + 1.5, x0 - 4.5, z1 + 4.5], weight: 0.5, market: 0.1, kind: 'lane' });
  rects.push({ r: [-w, z1 + 4.5, w, RADIUS - 24], weight: 0.8, market: 0.1, kind: 'lane' });
  rects.push({ r: [-w, -RADIUS + 24, w, z0 - 4.5], weight: 0.5, market: 0.1, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 20 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', ochre: 'cloth_ochre', brown: 'hide_brown', tan: 'hide_tan', grey: 'hide_grey', black: 'cloth_black', fur: '#b8884a' };
export const WALKERS = [
  { id: 'woman', weight: 2.0, market: 1.6, el: { dress: 'wrap', hat: 'none', over: 'none', arms: 'hang', hair: 'long', feet: 'bare' }, swing: 0.7,
    c1: [CL.tan, CL.brown, CL.white, CL.grey, CL.ochre], c2: [CL.ochre, CL.tan], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.4, market: 1.0, el: { dress: 'wrap', hat: 'none', over: 'none', carry: 'pot', arms: 'head', hair: 'long', feet: 'bare' }, swing: 0.5,
    c1: [CL.tan, CL.brown, CL.white], c2: [CL.ochre], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'man', weight: 1.8, market: 1.4, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: false, feet: 'bare' },
    c1: [CL.brown, CL.tan, CL.grey], c2: [CL.tan, CL.brown], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'elder', weight: 0.7, market: 0.6, el: { dress: 'loincloth', hat: 'none', over: 'cloak', arms: 'hang', hair: 'long', beard: true, feet: 'bare' },
    c1: [CL.brown, CL.tan], c2: [CL.fur, CL.fur, CL.tan], c3: [CL.black], speed: [0.7, 0.9], stride: 1.1 },
  { id: 'reeds', weight: 1.0, market: 0.4, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'sack', carry: 'sack', hair: 'long', beard: false, feet: 'bare' },
    c1: [CL.brown, CL.tan], c2: [CL.tan], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'basket', weight: 1.2, market: 1.0, el: { dress: 'wrap', hat: 'none', over: 'none', carry: 'basket', arms: 'head', hair: 'long', feet: 'bare' }, swing: 0.5,
    c1: [CL.tan, CL.brown, CL.grey], c2: [CL.ochre], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'pole', weight: 0.9, market: 0.4, el: { dress: 'loincloth', hat: 'none', over: 'none', carry: 'pole', arms: 'pole', hair: 'long', beard: false, feet: 'bare' },
    c1: [CL.brown, CL.tan], c2: [CL.tan], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'herder', weight: 0.8, market: 0.3, el: { dress: 'loincloth', hat: 'none', over: 'cloak', carry: 'staff', arms: 'staff', hair: 'long', beard: true, feet: 'bare' },
    c1: [CL.brown, CL.grey], c2: [CL.fur, CL.tan], c3: [CL.black], speed: [0.8, 1.05], stride: 1.25 },
  { id: 'child', weight: 0.8, market: 0.8, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: false, feet: 'bare' },
    c1: [CL.tan, CL.brown], c2: [CL.tan], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.55, 0.68], swing: 1.1 },
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
