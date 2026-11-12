// Ubirr — the moving life (docs/settlements/kakadu.md §5): people of the family walking the beaten ways along the rock's foot, to the
// steps and the camps and out on the floodplain: men with a goose spear or a bag, women with a dilly bag and a digging stick, children,
// all bare but for fibre belts, ochre and white clay [inferred]. No boats. Data for src/engine/movers.js; ways from layout.js.
import { RADIUS, TRACKS, MAIN, SMALL, CAMPS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 26, night: 2, rain: 0.4, reach: 150, spawnMin: 20, far: 40 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -0.4,
};
/** The ways: the beaten tracks (each leg a thin rectangle), the apron before the shelters, the paths to the camps. */
export function walkways() {
  const rects = [], w = 1.1;
  for (const t of TRACKS) for (let i = 0; i < t.length - 1; i++) {
    const [ax, az] = t[i], [bx, bz] = t[i + 1], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 8);
    for (let k = 0; k < n; k++) { const p = [ax + (bx - ax) * k / n, az + (bz - az) * k / n], q = [ax + (bx - ax) * (k + 1) / n, az + (bz - az) * (k + 1) / n]; rects.push({ r: [Math.min(p[0], q[0]) - w, Math.min(p[1], q[1]) - w, Math.max(p[0], q[0]) + w, Math.max(p[1], q[1]) + w], weight: 1, market: 0.3, kind: 'lane' }); }
  }
  rects.push({ r: [MAIN.x0, MAIN.zl - 5, MAIN.x1, -17], weight: 1.4, market: 0.5, kind: 'street' });
  rects.push({ r: [SMALL.x0, SMALL.zl - 4, SMALL.x1, -20], weight: 0.6, market: 0.2, kind: 'lane' });
  for (const C of CAMPS) rects.push({ r: [C.c[0] - 5, C.c[1] - 4, C.c[0] + 5, C.c[1] + 4], weight: 0.8, market: 0.3, kind: 'lane' });
  rects.push({ r: [-36, -19, -30, -4], weight: 0.8, market: 0.2, kind: 'lane' });
  rects.push({ r: [-56, -27, -52, -19], weight: 0.6, market: 0.2, kind: 'lane' });     // the small shelter's camp to the way
  rects.push({ r: [5, -19, 11, -8], weight: 0.9, market: 0.3, kind: 'lane' });         // the apron camp
  rects.push({ r: [-32, -19, -26, 26], weight: 0.5, market: 0.2, kind: 'lane' });      // down to the west bank
  rects.push({ r: [28, -17, 34, 12], weight: 0.9, market: 0.3, kind: 'lane' });
  rects.push({ r: [30, 8, 58, 14], weight: 0.5, market: 0.2, kind: 'lane' });          // across to the east hollow
  rects.push({ r: [-14, -19, -8, 14], weight: 0.7, market: 0.2, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { brown: 'cloth_brown', ochre: 'cloth_ochre', white: 'cloth_white', black: 'cloth_black' };
export const WALKERS = [
  { id: 'hunter', weight: 1.6, market: 1.0, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: true, feet: 'bare' },
    c1: [CL.brown, CL.ochre], c2: [CL.ochre, CL.white], c3: [CL.black], speed: [1.0, 1.35], stride: 1.45 },
  { id: 'woman', weight: 1.8, market: 1.2, el: { dress: 'strands', hat: 'none', over: 'none', arms: 'hang', hair: 'short', feet: 'bare' }, swing: 0.7,
    c1: [CL.brown, CL.ochre], c2: [CL.ochre, CL.white], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'bag', weight: 1.0, market: 0.8, el: { dress: 'strands', hat: 'none', over: 'none', carry: 'basket', arms: 'head', hair: 'short', feet: 'bare' }, swing: 0.5,
    c1: [CL.brown], c2: [CL.ochre], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'digger', weight: 1.0, market: 0.8, el: { dress: 'strands', hat: 'none', over: 'none', carry: 'staff', arms: 'hang', hair: 'short', feet: 'bare' }, swing: 0.6,
    c1: [CL.brown, CL.ochre], c2: [CL.ochre], c3: [CL.black], speed: [0.8, 1.05], stride: 1.2, h: [0.9, 0.97] },
  { id: 'spear', weight: 0.9, market: 0.9, el: { dress: 'loincloth', hat: 'none', over: 'none', carry: 'staff', arms: 'hang', hair: 'long', beard: true, feet: 'bare' },
    c1: [CL.brown, CL.white], c2: [CL.ochre], c3: [CL.black], speed: [0.95, 1.3], stride: 1.4 },
  { id: 'boy', weight: 0.8, market: 0.8, el: { dress: 'loincloth', hat: 'none', over: 'none', arms: 'hang', hair: 'short', feet: 'bare' },
    c1: [CL.brown], c2: [CL.ochre], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
