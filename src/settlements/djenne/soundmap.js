// Where Djenne's sounds are (docs/settlements/djenne.md 20.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made: the griot's kora and the balafon in the market, the schools' recitation, the smith's forge, the pestles in the courts, the
// pole of the pirogues on the channel, the wells, the shops' small work, the rooms one can be inside (the shops, the court house, the houses, the
// prayer hall). Pure data and functions of layout.js, read by src/engine/soundscape.js and played by src/engine/voices.js (the voices of
// src/engine/voices-djenne.js). The call to prayer is the engine's own (the profile's `adhan`). Coordinates: metres, +x east, +z south.
import '../../engine/voices-djenne.js';
import { ISLAND, MARKET, SHOPS, COURT, houses, enterable, inRect, shore } from './layout.js';
import { WELLS as WALK_WELLS, shopAt, courtAt } from './walk.js';

export const HOME = [95, 30];
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ringR = (a) => ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);

/** The shop row's trades, as interiors.js assigns them (TRADES[(i + 3) % 8]). */
const SHOP_TRADES = ['cloth', 'pots', 'salt', 'grain', 'kola', 'mats', 'leather', 'smith'];
const WORK = {
  cloth: [['clothRustle', [30, 70], [7, 17.5]]], pots: [['jarLid', [24, 60], [7, 17.5]]], salt: [['coin', [40, 90], [7, 17.5]]],
  grain: [['sack', [30, 70], [7, 17.5]], ['pour', [50, 110], [7, 17]]], kola: [['coin', [40, 90], [7, 17.5]]], mats: [['broom', [50, 110], [7, 17]]],
  leather: [['clothRustle', [40, 90], [7, 17]]], smith: [['hammer', [8, 22], [6.5, 17.5]], ['djBellows', [14, 30], [6.5, 17.5]]],
};
let SITES = null;
/** The places with sounds: the eight shops, the court house's school and workshop, and the enterable houses within 100 m of the market. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (let i = 0; i < 8; i++) { const S = shopAt(i), trade = SHOP_TRADES[(i + 3) % 8], r = [S.a, SHOPS[1], S.a + S.W, SHOPS[3]]; SITES.push({ use: 'shop_' + trade, rect: r, at: mid(r), id: 'shop:' + i, work: WORK[trade], y: 0 }); }
  const C = courtAt();
  SITES.push({ use: 'school', rect: [C.xm - 3, C.zp, C.xm + 3, C.zf], at: [C.xm, (C.zp + C.zf) / 2], id: 'court:vestibule', work: [['djRecite', [18, 40], [7, 17]]], y: 0 });
  SITES.push({ use: 'weaver', rect: [C.x0 + 0.5, C.zp, C.xm - 3.25, C.zf], at: [(C.x0 + 0.5 + C.xm - 3.25) / 2, (C.zp + C.zf) / 2], id: 'court:workshop', work: [['loom', [12, 28], [6.5, 18]]], y: 0 });
  const en = enterable(houses());
  for (const h of houses()) {
    if (!en.has(h)) continue;
    const m = mid(h.rect), d = Math.hypot(m[0] - 75, m[1]);
    if (d > 100) continue;
    const q = hash(m[0], m[1], 5), use = q < 0.2 ? 'smithy' : q < 0.45 ? 'pounding' : 'house';
    SITES.push({ use, rect: h.rect, at: m, id: 'lot:' + h.seed, work: use === 'smithy' ? [['hammer', [14, 34], [6.5, 17.5]], ['djBellows', [18, 40], [6.5, 17.5]]] : use === 'pounding' ? [['djPound', [40, 90], [5.5, 9.5]], ['djPound', [60, 120], [16, 19.5]]] : [['kitchen', [30, 70], [5.5, 20]]], y: 0 });
  }
  return SITES;
}
export const WELLS = WALK_WELLS;
export const FAR = {};
export const TEMPLE = {};

// the prayer hall's floor and the rooms
const HALL = [2, -29.5, 33.5, 29.5];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  if (inRect(HALL, x, z) && y > 2.5 && y < 8) return { use: 'hall', at: mid(HALL), upper: false, same: 'room:hall' };
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };   // banco walls and a flat roof of beams and mud: dull, heavy, the rain muffled
export const ROOMS = {
  house: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] }, pounding: { ...R0, tone: [320, 0.3], work: [['djPound', 60]] }, smithy: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 30]] },
  school: { ...R0, work: [['djRecite', 30]] }, weaver: { ...R0, work: [['loom', 14]] },
  shop_cloth: { ...R0 }, shop_pots: { ...R0, work: [['jarLid', 40]] }, shop_salt: { ...R0, work: [['coin', 60]] }, shop_grain: { ...R0, work: [['sack', 40]] }, shop_kola: { ...R0, work: [['coin', 60]] },
  shop_mats: { ...R0, work: [['broom', 70]] }, shop_leather: { ...R0 }, shop_smith: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 20]] },
  hall: { tone: [200, 0.2], roof: 0.7, hush: 0.5, work: [['clothRustle', 90]] },
};
export const UPPER = { tone: [230, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// the planting and the town
export function greenNear(x, z) { return Math.max(0.15, 0.7 * sm(ISLAND - 20, ISLAND + 40, Math.hypot(x, z))); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.8);
/** A tree for a bird: neem in the courts and acacias on the plain, near (x, z). */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < 355 && (shore(px, pz) > -10 || hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.1)) return [px, pz];
  }
  return null;
}
/** How much of the market's hubbub reaches (x, z): all of it in the market, a good deal about the shops and the mosque's square, little at the rim. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 4)) return 1;
  if (inRect(COURT, x, z, 6)) return 0.8;
  return Math.max(0.12, 0.8 * (1 - 0.8 * sm(120, ISLAND, Math.hypot(x - 60, z))));
}
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** A point on the water's edge of the channel near the listener (within 45 m), for the lap of the water. */
export function shoreSpot(x, z, r) {
  const a = Math.atan2(z, x) + (r() - 0.5) * 0.3, R = ringR(a) + 9;
  return Math.hypot(Math.cos(a) * R - x, Math.sin(a) * R - z) < 45 ? [Math.cos(a) * R, Math.sin(a) * R] : null;
}
/** Frogs: the channel and the flooded plain, in the rains; fewer on the island. */
export const frogGround = (x, z) => (shore(x, z) > -25 ? 0.9 : 0.15);

// a pirogue poled along the channel near the listener
const poleTrack = (x, z, r) => {
  const a0 = Math.atan2(z, x);
  if (Math.hypot(x, z) < ISLAND - 90 || Math.hypot(x, z) > ISLAND + 90) return null;
  const dir = r() < 0.5 ? 1 : -1, pts = [];
  for (let k = -3; k <= 3; k++) { const a = a0 + dir * k * 0.045, R = ringR(a) + 22; pts.push([Math.cos(a) * R, Math.sin(a) * R]); }
  return { pts };
};
export const TRACKS = [{ key: 'pirogue', voice: 'djPole', speed: 1.2, r50: 14, gap: [50, 120], ok: (h, rain) => h >= 5.5 && h < 19 && rain < 0.6, get: poleTrack }];

const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
export const EMITTERS = [
  // the griot's kora before the shops and the balafon in the market's south, by day, between the sellers' calls
  E('djKora', [100, -40], 24, [70, 150], [8, 18], { rainMax: 0.3, after: true }),
  E('djBalafon', [75, 38], 26, [80, 170], [8, 17.5], { rainMax: 0.3, after: true }),
  // the sellers' calls over the market (Monday market, section 11)
  E('djCall', [60, -10], 30, [8, 20], [7, 16], { rainMax: 0.5 }), E('djCall', [85, 15], 30, [8, 20], [7, 16], { rainMax: 0.5 }), E('djCall', [70, 30], 30, [10, 24], [7, 16], { rainMax: 0.5 }),
  // the masons' yards round the platform
  E('clay', [-30, 48.5], 14, [14, 30], [6.5, 17], { dry: true }),
  // the teacher and pupils in the mosque's west gallery
  E('djRecite', [-30, 6], 22, [40, 90], [7, 11], { rainMax: 0.4, after: true }), E('djRecite', [-30, 6], 22, [60, 140], [15, 17.5], { rainMax: 0.4, after: true }),
  // donkeys' loads and the grain sacks at the landing, the washing, a pirogue's pole
  E('sack', [0, 218], 16, [30, 80], [6, 17]), E('clothRustle', [0, 214], 12, [14, 36], [7, 16], { dry: true }),
  E('djPole', [0, 232], 18, [40, 100], [6, 18.5], { rainMax: 0.6 }),
  // the little owl on the plain at night
  E('owl', [-120, 150], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [150, -120], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void sm;
