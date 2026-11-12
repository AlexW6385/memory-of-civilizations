// Stonehenge about 2500 BC — the moving life (docs/settlements/stonehenge.md §10b): people who have come for the feast
// walking up the Avenue to the stones and round the sarsen circle, between the gathering's fires and the cattle pen, and
// the Durrington people between their houses, the Southern Circle and its avenue; herders with staffs, women with pots and
// baskets on the head, children. Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come
// from layout.js. No boats (no water in the settlement).

import { RADIUS, AXIS, DURR, HEEL, houses } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 42, night: 4, rain: 0.6, reach: 190, spawnMin: 30, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

const ax = Math.cos(AXIS), az = Math.sin(AXIS);
/** From the Avenue's frame (s along it from the centre toward the north-east, t across it) to plan x, z. */
const A = (s, t) => [s * ax - t * az, s * az + t * ax];
const D = (s, t) => [DURR.c[0] + DURR.dir[0] * s - DURR.dir[1] * t, DURR.c[1] + DURR.dir[1] * s + DURR.dir[0] * t];

/**
 * The ways: the Avenue from its far end to the entrance causeway (passing the Heel Stone on its south-east side and through the
 * gap between the two stones at the entrance), a path round outside the sarsen circle; side paths to the gathering's fires
 * (camp sites in town.js) and the cattle pen; the Durrington avenue and the path round its circle; from every house's door to
 * the nearest of them.
 */
export function walkways() {
  const links = [], L = (a, b, w = 1, weight = 1, kind = 'street') => links.push({ a, b, w, kind, weight });
  // the Stonehenge Avenue
  L(A(330, 0), A(100, 0), 3.5, 2.4);
  L(A(100, 0), A(100, HEEL.ditch + 2.2), 3, 2.4);
  L(A(100, HEEL.ditch + 2.2), A(62, HEEL.ditch + 2.2), 2.4, 2.4);
  L(A(62, HEEL.ditch + 2.2), A(55, -0.4), 1.4, 2.2);
  L(A(55, -0.4), A(36, -0.4), 1.0, 2.2);
  L(A(36, -0.4), A(19.5, -0.4), 1.0, 2.2);
  // the circuit outside the sarsen circle, 19.5 m from the centre
  const ring = Array.from({ length: 20 }, (_, k) => { const a = AXIS + k / 20 * Math.PI * 2; return [Math.cos(a) * 19.5, Math.sin(a) * 19.5]; });
  for (let k = 0; k < 20; k++) L(ring[k], ring[(k + 1) % 20], 1.2, 1.1);
  L(A(19.5, -0.4), ring[0], 0.8, 1.0);
  // the gathering: side paths to the camp sites and the cattle pen (town.js camp)
  for (const [u, v] of [[68, 26], [86, -27], [112, 31], [138, -30], [166, 29], [196, -27], [60, -22]]) L(A(u, 0), A(u, v * 0.8), 1.2, 0.8);
  L(A(119, -6), A(110, -62), 1.6, 1.0);
  // the way from the Stonehenge Avenue to Durrington, round the Southern Circle to its entrance, and the Durrington avenue
  const cr = 24, cp = (deg) => [DURR.c[0] + Math.cos(deg * Math.PI / 180) * cr, DURR.c[1] + Math.sin(deg * Math.PI / 180) * cr];
  L(A(240, 0), cp(180), 2.0, 1.2);
  L(cp(180), cp(135), 1.6, 1.2); L(cp(135), cp(90), 1.6, 1.2); L(cp(90), cp(45), 1.6, 1.2);
  L(cp(45), D(DURR.r + 3, 0), 2.0, 1.8);
  L(D(DURR.r + 3, 0), D(DURR.r + DURR.len, 0), 7, 2.4);
  // each house: from its door to the nearest point on the avenue or the circle's entrance
  for (const h of houses()) {
    const dv = h.s / 2 + 1.8, door = [h.c[0] - Math.sin(h.yaw) * dv, h.c[1] + Math.cos(h.yaw) * dv];
    const dx = door[0] - DURR.c[0], dz = door[1] - DURR.c[1], s = Math.max(DURR.r + 6, Math.min(DURR.r + DURR.len - 4, dx * DURR.dir[0] + dz * DURR.dir[1]));
    const hub = D(s, 0), hubD = Math.hypot(hub[0] - door[0], hub[1] - door[1]);
    if (hubD < 90) L(door, [hub[0] + (door[0] - hub[0]) * 0.1, hub[1] + (door[1] - hub[1]) * 0.1], 0.7, 0.4);
  }
  return { rects: [], links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
// The dress is not preserved; what we have is flax and, a little later, wool, leather and fur, and bone and antler pins and
// toggles to fasten them (docs §10b). Shown: tunics and wraps of undyed linen and wool in the earth colours, hide cloaks and
// capes, bare or hide-wrapped feet, long loose hair tied at the nape, the men's cut short or bound.
const CL = { hideTan: 'hide_tan', hideBrown: 'hide_brown', hideGrey: 'hide_grey', brown: 'cloth_brown', ochre: 'cloth_ochre', grey: 'cloth_grey', white: 'cloth_white' };
const SK = { skin: 'skin_medium', hairMat: 'hair_dark', feet: 'bare' };
export const WALKERS = [
  { id: 'man', weight: 1.6, market: 1.3, el: { dress: 'tunic', over: 'cape', hat: 'none', arms: 'hang', hair: 'long', ...SK }, wet: 'cape',
    c1: [CL.brown, CL.ochre, CL.white, CL.hideTan], c2: [CL.hideBrown, CL.hideTan, CL.hideGrey], c3: [CL.hideBrown], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'woman', weight: 1.5, market: 1.3, el: { dress: 'wrap', over: 'shawl', hat: 'none', arms: 'hang', hair: 'long', ...SK }, wet: 'cape', swing: 0.7,
    c1: [CL.white, CL.ochre, CL.brown, CL.grey], c2: [CL.hideTan, CL.hideBrown], c3: [CL.hideBrown], speed: [0.9, 1.15], stride: 1.2, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.1, market: 1.5, el: { dress: 'wrap', over: 'none', carry: 'pot', arms: 'head', hair: 'bun', hat: 'none', ...SK }, wet: 'cape', swing: 0.5,
    c1: [CL.ochre, CL.white, CL.hideTan], c2: [CL.ochre], c3: [CL.ochre], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'basket', weight: 0.9, market: 1.4, el: { dress: 'wrap', over: 'shawl', carry: 'basket', arms: 'head', hair: 'long', hat: 'none', ...SK }, wet: 'cape', swing: 0.5,
    c1: [CL.brown, CL.hideTan, CL.white], c2: [CL.hideBrown], c3: [CL.hideBrown], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'herder', weight: 1.0, market: 0.8, el: { dress: 'tunic', over: 'cloak', carry: 'staff', arms: 'staff', hat: 'none', hair: 'short', ...SK }, wet: 'cape',
    c1: [CL.hideTan, CL.brown, CL.hideBrown], c2: [CL.hideBrown, CL.hideGrey], c3: [CL.hideBrown], speed: [0.95, 1.25], stride: 1.35 },
  { id: 'porter', weight: 0.7, market: 1.4, el: { dress: 'tunic', over: 'belt', carry: 'sack', arms: 'sack', hat: 'none', hair: 'short', ...SK }, wet: 'cape',
    c1: [CL.brown, CL.hideTan, CL.ochre], c2: [CL.hideBrown], c3: [CL.hideBrown], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'child', weight: 0.7, market: 0.7, el: { dress: 'tunic', over: 'belt', hat: 'none', arms: 'hang', hair: 'short', ...SK }, wet: 'cape',
    c1: [CL.hideTan, CL.white, CL.ochre], c2: [CL.hideBrown], c3: [CL.hideBrown], speed: [1.1, 1.5], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of [false, true]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    if (wet && k.el.over !== 'cloak') el.over = 'cloak';
    addFigure(sb, v, figure, el, { far, cape: wet ? 'hide_brown' : null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
