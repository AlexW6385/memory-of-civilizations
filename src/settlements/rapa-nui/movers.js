// Rapa Nui about 1500 — the moving life (docs/settlements/rapa-nui.md §4e): people going between the houses, the
// plaza before the ahu, the statue road, the quarry's camps, the garden plots and the shore: men in loincloths (hami)
// some with a cloak of bark cloth, women in wraps, carriers with baskets of sweet potato on the head, boys, fishermen
// with nets. Data for the engine's movers (src/engine/movers.js, read in its worker); ways from layout.js. No boats.
import { RADIUS, ROAD, PLAZA, BAYS, CHIEF, village, fields } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 22, night: 2, rain: 0.4, reach: 190, spawnMin: 26, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};
const fwd = (h, d) => [h.c[0] + Math.sin(h.yaw) * d, h.c[1] + Math.cos(h.yaw) * d];
/** The ways: the plaza, the road, the quarry camps, the shore, each house's forecourt joined to the nearest hub, the garden plots. */
export function walkways() {
  const links = [], L = (a, b, w = 1.0, weight = 1) => links.push({ a, b, w, kind: 'street', weight });
  const plaza = [(PLAZA[0] + PLAZA[2]) / 2, PLAZA[1] + 6], shore = [74, 140], hubs = [plaza, ROAD[4], ROAD[2], ROAD[0], shore, [CHIEF.c[0], CHIEF.c[1] + 4.5]];
  L(plaza, ROAD[4], 2.4, 2); for (let i = 4; i > 0; i--) L(ROAD[i], ROAD[i - 1], 2.6, 1.6);
  L(plaza, shore, 1.6, 1.4); L(plaza, hubs[5], 1.4, 1.5); L(hubs[5], ROAD[3], 1.2, 0.8);
  for (const b of BAYS) { const hw = 0.19 * b.h, sf = Math.sin(b.facing), cf = Math.cos(b.facing); L(ROAD[0], [b.at[0] + (hw + 6) * cf, b.at[1] - (hw + 6) * sf], 1.0, 0.45); }
  for (const h of village().houses) {
    if (h.chief) continue;
    const d = h.w / 2 + 2.6, p = [h.c[0] - Math.sin(h.yaw) * d, h.c[1] - Math.cos(h.yaw) * d]; void fwd;
    let best = hubs[0], bd = 1e9; for (const q of hubs) { const e = Math.hypot(q[0] - p[0], q[1] - p[1]); if (e < bd) { bd = e; best = q; } }
    L(p, best, 0.9, 0.35 + Math.min(1, 50 / bd) * 0.6);
  }
  for (const r of fields()) { const p = [(r[0] + r[2]) / 2, r[3] + 1.2]; let best = hubs[0], bd = 1e9; for (const q of hubs) { const e = Math.hypot(q[0] - p[0], q[1] - p[1]); if (e < bd) { bd = e; best = q; } } L(p, best, 0.9, 0.5); }
  return { rects: [], links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { brown: 'cloth_brown', ochre: 'cloth_ochre', white: 'hide_white', tan: 'hide_tan' };
const SKIN = { skin: 'skin_medium', hairMat: 'hair_dark' };
export const WALKERS = [
  { id: 'man', weight: 1.7, market: 1.0, el: { dress: 'loincloth', top: 'bare', over: 'none', hat: 'none', arms: 'hang', hair: 'short', feet: 'bare', legs: 'bare', ...SKIN }, c1: [CL.tan, CL.white], c2: [CL.brown], c3: [CL.tan], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'cloak', weight: 0.9, market: 1.0, el: { dress: 'loincloth', top: 'bare', over: 'cape', hat: 'none', arms: 'hang', hair: 'short', feet: 'bare', legs: 'bare', ...SKIN }, c1: [CL.tan], c2: [CL.white, CL.ochre], c3: [CL.ochre], speed: [0.9, 1.15], stride: 1.35 },
  { id: 'woman', weight: 1.4, market: 1.0, el: { dress: 'wrap', over: 'none', hat: 'none', arms: 'hang', hair: 'bun', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.7, c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.ochre], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'basket', weight: 1.3, market: 1.0, el: { dress: 'wrap', over: 'none', carry: 'basket', arms: 'head', hair: 'bun', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.5, c1: [CL.white, CL.ochre], c2: [CL.ochre], c3: [CL.ochre], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'boy', weight: 0.7, market: 0.6, el: { dress: 'loincloth', top: 'bare', over: 'none', carry: 'staff', arms: 'staff', hair: 'short', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN }, c1: [CL.tan], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
