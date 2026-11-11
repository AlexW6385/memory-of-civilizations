// Great Zimbabwe about 1350 — the moving life (docs/settlements/great-zimbabwe.md §15): women with water pots and
// baskets on the head going between the homesteads and the Valley courts, men in hide cloaks and loincloths, herd boys,
// traders with their loads on the way to the Great Enclosure. Data for the engine's movers (src/engine/movers.js, read in
// its worker); the ways come from layout.js: paths from each homestead's gate to the nearest hub. No boats.

import { ENCLOSURE, VALLEY, ASCENT, RADIUS, compounds } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 26, night: 3, rain: 0.5, reach: 170, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: from each homestead's gate to the nearest hub (the Great Enclosure's north entrance, the Valley courts, the foot of the Ancient Ascent), the hubs joined. */
export function walkways() {
  const links = [], L = (a, b, w = 0.9, weight = 1) => links.push({ a, b, w, kind: 'street', weight });
  const [ex, ez] = ENCLOSURE.c, gate = [ex + 6, ez - ENCLOSURE.r[1] - 2];
  const hubs = [gate, ...VALLEY.map((V) => [V.c[0] + V.r[0] + 3, V.c[1]]), [ASCENT.x, ASCENT.z0 + 6]];
  L(gate, [ex + 6, ez - 4], 1.6, 2.2);
  for (let i = 1; i < hubs.length; i++) L(hubs[0], hubs[i], 1.0, 1.4);
  for (const k of compounds()) {
    const g = [k.c[0] + Math.cos(k.gap) * (k.r + 2.2), k.c[1] + Math.sin(k.gap) * (k.r + 2.2)];
    let best = hubs[0], bd = 1e9;
    for (const h of hubs) { const d = Math.hypot(h[0] - g[0], h[1] - g[1]); if (d < bd) { bd = d; best = h; } }
    if (bd > 20) L(g, best, 0.8, 0.5 + Math.min(1, 60 / bd));
    L([k.c[0] + Math.cos(k.gap) * (k.r - 3), k.c[1] + Math.sin(k.gap) * (k.r - 3)], g, 1.0, 0.6);
  }
  return { rects: [], links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { brown: 'cloth_brown', ochre: 'cloth_ochre', brown: 'cloth_brown', white: 'cloth_white', hideTan: 'hide_tan', hideBrown: 'hide_brown' };
const SKIN = { skin: 'skin_dark', hairMat: 'hair_dark' };
export const WALKERS = [
  { id: 'man', weight: 1.6, market: 1.2, el: { dress: 'loincloth', top: 'bare', over: 'cape', hat: 'none', arms: 'hang', hair: 'short', feet: 'bare', legs: 'bare', ...SKIN },
    c1: [CL.hideTan, CL.hideBrown], c2: [CL.hideBrown, CL.hideTan], c3: [CL.hideBrown], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'woman', weight: 1.6, market: 1.3, el: { dress: 'wrap', over: 'none', hat: 'none', arms: 'hang', hair: 'bun', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.7,
    c1: [CL.ochre, CL.hideTan, CL.brown], c2: [CL.ochre], c3: [CL.ochre], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.5, market: 1.5, el: { dress: 'wrap', over: 'none', carry: 'pot', arms: 'head', hair: 'short', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.5,
    c1: [CL.ochre, CL.white, CL.hideTan], c2: [CL.ochre], c3: [CL.ochre], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'basket', weight: 1.0, market: 1.4, el: { dress: 'wrap', over: 'none', carry: 'basket', arms: 'head', hair: 'bun', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN }, swing: 0.5,
    c1: [CL.ochre, CL.hideTan], c2: [CL.ochre], c3: [CL.ochre], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'trader', weight: 0.9, market: 1.8, el: { dress: 'wrap', top: 'bare', over: 'cape', carry: 'sack', arms: 'sack', hair: 'short', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN },
    c1: [CL.white, CL.ochre], c2: [CL.white, CL.hideTan], c3: [CL.hideTan], speed: [0.85, 1.15], stride: 1.3 },
  { id: 'boy', weight: 0.7, market: 0.7, el: { dress: 'loincloth', top: 'bare', over: 'none', carry: 'staff', arms: 'staff', hair: 'short', hat: 'none', feet: 'bare', legs: 'bare', ...SKIN },
    c1: [CL.hideTan, CL.hideBrown], c2: [CL.hideBrown], c3: [CL.hideBrown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
