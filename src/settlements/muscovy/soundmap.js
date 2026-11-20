// Where Muscovy's sounds are (docs/settlements/muscovy.md §14): bells at their towers, the chant in the cathedrals, the trading rows' shops at their
// trades, the wells, the streets and the lane before the rows for the sledges and carts, the Moskva for the barges, the rooms one can be inside.
// Pure data and functions of layout.js and openwalk.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`), played by
// src/engine/voices.js and voices-muscovy.js. Coordinates: metres, +x east, +z south. [inferred throughout, see the dossier.]
import '../../engine/voices-muscovy.js';
import { openIzba, waysides, CATHEDRALS, CHURCHES, BASIL, RIVER, RADIUS, ROWS, lots, inRect, riverZ, streetSegments } from './layout.js';
import { openShops } from './openwalk.js';

export const HOME = [40, 20];
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];

export const IVAN = CATHEDRALS.ivan, DORM = mid(CATHEDRALS.dormition), SQ = [40, 20];
// ── the shops' work, by trade ──
const WORK = {
  cloth: [['scissors', [26, 60], [7.5, 17]]], hats: [['clothRustle', [30, 70], [7.5, 17]]], boots: [['knock', [14, 34], [7.5, 17]]], candles: [['paper', [40, 90], [7.5, 17]]],
  icons: [['brush', [30, 70], [8, 16.5]]], pots: [['clay', [20, 50], [7.5, 17]]], iron: [['hammer', [10, 26], [7.5, 17]]], furs: [['clothRustle', [30, 70], [7.5, 17]]],
  fish: [['sack', [20, 50], [6.5, 15]]], flour: [['sack', [20, 50], [7, 17]]], bread: [['bowlClack', [24, 60], [5.5, 16]]], saddles: [['knock', [20, 50], [7.5, 17]]],
};
let SITES = null;
/** The opened shops of the rows that make sound: { use (the trade), rect, at, id, work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const s of openShops().values()) { const rect = [Math.min(s.x0, s.x1), s.z0 + 0.2, Math.max(s.x0, s.x1), s.z1 - 0.2]; SITES.push({ use: s.trade, rect, at: mid(rect), id: 'lavka:' + s.key, work: WORK[s.trade] || [] }); }
  return SITES;
}
export const WELLS = waysides().filter((w) => w.kind === 'well').map((w) => w.c);

// ── the emitters ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const EVERY = [[0, 0], 1000];
const ringAt = (a, b, mk) => [E(mk[0], IVAN, 150, [20, 25], [a, a + 0.25], { after: true }), E(mk[1], IVAN, 150, [20, 25], [b, b + 0.3], { after: true })];
export const EMITTERS = [
  // the Kremlin's bells: the blagovest at the Dormition belfry before the liturgy (6.0) and before vespers (16.5), the trezvon at its end (6.5, 17.0); a perebor now and then for the dead
  E('mosBlagovest', IVAN, 150, [20, 25], [6.0, 6.25], { after: true }), E('mosTrezvon', IVAN, 150, [20, 25], [6.5, 6.8], { after: true }),
  E('mosBlagovest', IVAN, 150, [20, 25], [16.5, 16.75], { after: true }), E('mosTrezvon', IVAN, 150, [20, 25], [17.0, 17.3], { after: true }),
  E('mosPerebor', BASIL, 100, [60, 100], [10, 10.3], { after: true }),
  // the parish churches' small bells answer
  ...CHURCHES.flatMap(([x, z]) => [E('mosSmallBell', [x, z], 60, [15, 20], [6.6, 6.9], { after: true }), E('mosSmallBell', [x, z], 60, [15, 20], [17.1, 17.4], { after: true })]),
  // the chant in the Dormition at the liturgy and at vespers (heard whole inside), in St Basil's
  E('mosChant', DORM, 40, [14, 20], [7, 9], { inside: 'room:dormition', after: true }), E('mosChant', DORM, 40, [14, 20], [17.3, 18.3], { inside: 'room:dormition', after: true }),
  E('mosChant', [BASIL[0], BASIL[1]], 30, [20, 30], [8, 10], { inside: 'room:basil', after: true }),
  // the skomorokhi at the square's market, in the day
  E('mosGusli', [12, 40], 40, [60, 120], [10, 17], { rainMax: 0.2, after: true }),
  E('mosJackdaw', IVAN, 60, [8, 22], [5, 20], { rainMax: 0.5 }), E('mosJackdaw', BASIL, 50, [10, 26], [5, 20], { rainMax: 0.5 }),
  E('mosAxe', [-250, 280], 40, [18, 50], [7, 17], { dry: true }), E('mosAxe', [150, 150], 40, [18, 50], [7, 17], { dry: true }),
  E('owl', [250, -250], 80, [50, 120], [21, 4.5], { rainMax: 0.4 }),
];
void ringAt;

// ── passing sounds, geometry ──
export const canalTrack = () => null; export const bridgeTrack = () => null; export const pondSpot = () => null;
/** The river's near bank, for the lap of the water. */
export function canalSpot(x, z) { const zr = riverZ(x) - RIVER.w / 2 + 3; return { p: [x, zr], d: Math.abs(z - zr), i: 0 }; }
export function shoreSpot(x, z, rnd) { const px = x + (rnd() - 0.5) * 30, zr = riverZ(px) - RIVER.w / 2 + 3; return Math.abs(z - zr) < 40 ? [px, zr] : null; }
let SEGS = null;
const segs = () => (SEGS ||= streetSegments(8));
/** The way of a walker or a cart: the lane before the rows first, else the street nearest within `reach`, a stretch of it passing the nearest point. */
function wayTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  const lane = { a: [68, -130], b: [68, 80] };
  for (const s of [lane, ...segs()]) {
    const ax = s.a[0], az = s.a[1], bx = s.b[0], bz = s.b[1], L2 = (bx - ax) ** 2 + (bz - az) ** 2, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / L2)), d = Math.hypot(ax + (bx - ax) * t - x, az + (bz - az) * t - z);
    if (d < reach && (!best || d < best.d)) best = { s, t, d, L: Math.sqrt(L2) };
  }
  if (!best) return null;
  const { s, t, L } = best, dir = rnd() < 0.5 ? 1 : -1, t0 = Math.max(0, Math.min(1, t - dir * lead * (0.5 + 0.7 * rnd()) / L)), t1 = Math.max(0, Math.min(1, t + dir * lead * (0.8 + 0.8 * rnd()) / L));
  if (Math.abs(t1 - t0) * L < 10) return null;
  const P = (u) => [s.a[0] + (s.b[0] - s.a[0]) * u + (rnd() - 0.5) * 0.8, s.a[1] + (s.b[1] - s.a[1]) * u];
  return { pts: [P(t0), P(t1)] };
}
/** The engine's built-in Chinese street walkers (sedan chair, pedlar with a rattle, clapper watchman) are not Muscovy's: TRACKS has its own. */
export function streetTrack() { return null; }
/** The river's own track for barges: the middle of the Moskva, a stretch of it. */
function riverTrack(x, z, rnd) {
  if (Math.abs(z - riverZ(x)) > 130) return null;
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(-RADIUS + 70, Math.min(RADIUS - 70, x - dir * 70 * (0.6 + 0.6 * rnd()))), b = Math.max(-RADIUS + 70, Math.min(RADIUS - 70, x + dir * 90 * (0.8 + 0.8 * rnd())));
  return Math.abs(b - a) < 20 ? null : { pts: [[a, riverZ(a) + (rnd() - 0.5) * 20], [b, riverZ(b) + (rnd() - 0.5) * 20]] };
}
export const TRACKS = [
  { key: 'm:sledge', voice: 'mosSledge', speed: 2.6, r50: 14, gap: [30, 70], ok: (h, rain) => h >= 6 && h < 19 && rain < 0.8, get: (x, z, r) => wayTrack(x, z, r, 80, 40) },
  { key: 'm:cart', voice: 'mosCart', speed: 2.2, r50: 14, gap: [40, 90], ok: (h, rain) => h >= 6.5 && h < 18.5 && rain < 0.7, get: (x, z, r) => wayTrack(x, z, r, 80, 40) },
  { key: 'm:cry', voice: 'mosCry', speed: 0.95, r50: 12, gap: [30, 70], ok: (h, rain) => h >= 6 && h < 19 && rain < 0.4, get: (x, z, r) => wayTrack(x, z, r, 80, 30) },
  { key: 'm:watch', voice: 'mosWatch', speed: 1.0, r50: 12, gap: [50, 110], ok: (h, rain) => (h >= 20 || h < 4.5) && rain < 0.6, get: (x, z, r) => wayTrack(x, z, r, 90, 34) },
  { key: 'm:boat', voice: 'mosBoat', speed: 1.0, r50: 18, gap: [50, 110], ok: (h, rain) => h >= 5.5 && h < 20 && rain < 0.7, get: (x, z, r) => riverTrack(x, z, r) },
];

// ── planting ──
const treeness = (x, z) => Math.max(0.15, Math.hypot(x, z) > 290 ? 0.8 : 0.3 + 0.3 * Math.sin(x * 0.043) * Math.cos(z * 0.051));
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 10; k++) { const a = rnd() * 6.283, d = 6 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (Math.hypot(px, pz) < RADIUS - 8 && treeness(px, pz) > 0.3 + 0.4 * rnd() && !inRect(ROWS, px, pz) ) return [px, pz]; }
  return null;
}
export const bambooNear = () => 0;
export const leafNear = (x, z) => Math.min(1, 0.25 + 0.5 * treeness(x, z));
export const lotusNear = () => 0;
export const greenNear = (x, z) => Math.max(0.12, treeness(x, z) * 0.7);
export const frogGround = (x, z) => 0.9 * (1 - sm(0, 60, Math.abs(z - riverZ(x)) - RIVER.w / 2));
/** 0…1: how much of the town's hubbub reaches (x, z): the square and the rows most, the Kremlin's courts less, the cathedrals least. */
export function townNear(x, z) {
  if (inRect(CATHEDRALS.dormition, x, z, 4)) return 0.12;
  if (inRect([-12, -150, 92, 150], x, z, 20)) return 1;
  return Math.max(0.15, 0.8 * (1 - 0.6 * sm(150, RADIUS - 40, Math.hypot(x, z))));
}

// ── the rooms ──
const LG = new Map();
const lotAt = (x, z) => { if (!LG.size) for (const l of lots()) for (let i = Math.floor(l.rect[0] / 20); i <= Math.floor(l.rect[2] / 20); i++) for (let j = Math.floor(l.rect[1] / 20); j <= Math.floor(l.rect[3] / 20); j++) { const k = i + ',' + j; (LG.get(k) || LG.set(k, []).get(k)).push(l); } return (LG.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((l) => inRect(l.rect, x, z)); };
export function roomAt(x, z, y = 0) {
  if (inRect(CATHEDRALS.dormition, x, z) && y < 12) return { use: 'temple', at: DORM, upper: false, same: 'room:dormition' };
  if (Math.hypot(x - BASIL[0], z - BASIL[1]) < 4.4 && y > 3) return { use: 'temple', at: BASIL, upper: false, same: 'room:basil' };
  if (inRect(CATHEDRALS.facets, x, z) && y > 3) return { use: 'hall', at: mid(CATHEDRALS.facets), upper: false, same: 'room:facets' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  const l = lotAt(x, z);
  if (l && openIzba(l)) return { use: 'izba', at: mid(l.rect), upper: false, same: 'lot:' + l.seed };
  return null;
}
const SHOP = (tone, work) => ({ tone: [tone, 0.3], roof: 1.0, hush: 0.8, work });
export const ROOMS = {
  cloth: SHOP(260, [['clothRustle', 26]]), hats: SHOP(260, [['clothRustle', 40]]), boots: SHOP(300, [['knock', 40]]), candles: SHOP(260, [['paper', 50]]), icons: SHOP(240, [['brush', 40]]),
  pots: SHOP(320, [['clay', 30]]), iron: SHOP(420, [['drawer', 80]]), furs: SHOP(240, [['clothRustle', 40]]), fish: SHOP(400, [['sack', 30]]), flour: SHOP(300, [['sack', 30]]),
  bread: SHOP(340, [['bowlClack', 30]]), saddles: SHOP(280, [['knock', 50]]),
  izba: { tone: [260, 0.25], roof: 1.0, hush: 0.85, work: [['mosStove', 18], ['broom', 70]] },       // the stove ticking, a broom
  temple: { tone: [130, 0.3], roof: 0.3, hush: 0.4, work: [['paper', 90]] },
  hall: { tone: [160, 0.22], roof: 0.6, hush: 0.5, work: [['paper', 70]] },
};
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40]] };
void nearIn; void sm;
