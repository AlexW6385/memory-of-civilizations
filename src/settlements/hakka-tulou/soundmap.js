// Where the Hakka tulou's sounds are (docs/settlements/hakka-tulou.md §11): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the mountain song on the tea terraces, the pestle in the barn, the noria in the stream, the washing beaten on the steps, the buffalo's
// clapper in the paddy, the kitchens of the great ring at the meals, the shops' work at the open houses, the gate shut at dusk, the frogs of the paddy, the
// water of the stream, the bamboo on the hill. Pure data and functions of layout.js and walk.js (no three.js), read by src/engine/soundscape.js (the profile's
// `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-hakka.js). Metres, +x east, +z south, the settlement's frame.
// [inferred throughout: no recording and no source for the sounds of a Hakka valley c. 1710; the hours follow a farming day.]
import '../../engine/voices-hakka.js';
import { T, NEIGHBOURS, FARMS, NORIA, WASH_STEPS, SHRINES, RADIUS, streamZ, BRIDGE_X, STREAM, YARD, inRect, HOUSES } from './layout.js';
import { openedHouses, isShop, tradeOf } from './walk.js';

export const HOME = [0, 72];
export const TEMPLE = { bell: [0, 0], drum: [0, 0], hall: [0, 0], court: [0, 0], rects: {} };   // (no bell or drum: the clan hall has none to place)
/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const polar = (r, deg) => [T.c[0] + r * Math.cos(deg * Math.PI / 180), T.c[1] + r * Math.sin(deg * Math.PI / 180)];
const rectOf = (h) => { const q = Math.abs(Math.sin(h.yaw)) > 0.5, a = (q ? h.d : h.w) / 2, b = (q ? h.w : h.d) / 2; return [h.c[0] - a, h.c[1] - b, h.c[0] + a, h.c[1] + b]; };
const frame = (h) => { const c = Math.cos(h.yaw), s = Math.sin(h.yaw); return (x, z) => [h.c[0] + x * c + z * s, h.c[1] - x * s + z * c]; };

/** The work heard from each open house: [voice, gap [min, max] s, hours [from, to]]. */
const SHOP_WORK = {
  tea: [['teaClink', [30, 70], [6, 19]], ['clothRustle', [60, 120], [7, 18]]],
  wine: [['pourWine', [30, 70], [7, 19]], ['jarLid', [50, 110], [7, 18]]],
  pickles: [['jarLid', [40, 90], [6.5, 18]], ['sack', [60, 120], [7, 17]]],
  tobacco: [['htChop', [30, 80], [7, 18]], ['paper', [40, 90], [8, 17]]],
};
const HOME_WORK = [['kitchen', [16, 34], [5.5, 7.5]], ['kitchen', [18, 36], [11, 13]], ['kitchen', [18, 36], [16.5, 19.5]]];
const ROOM_KINDS = ['bedroom', 'tools', 'loom', 'tea'];
let SITES = null;
/** The open houses (the whole hamlet is within the walk's reach) that make sounds: { use, rect, at, id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const { h } of openedHouses()) {
    const shop = isShop(h), loom = !shop && ROOM_KINDS[h.seed % 4] === 'loom', W = frame(h);
    SITES.push({ use: shop ? 'shop_' + tradeOf(h) : 'home', rect: rectOf(h), at: W(0, 1.5), id: 'lot:' + h.seed, work: shop ? SHOP_WORK[tradeOf(h)] : [...HOME_WORK, ...(loom ? [['loom', [20, 50], [8, 17]]] : [])], y: 0 });
  }
  return SITES;
}
const SITE_GRID = () => sites();
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const r = Math.hypot(x - T.c[0], z - T.c[1]);
  if (inRect([-7.5, -6, 7.5, 6.9], x, z) && r < 10) return { use: 'hall', at: [0, 0], upper: false, same: 'ring:hall' };
  if (r > T.front && r < T.wallIn) { const fl = y > 9 ? 3 : y > 6 ? 2 : y > 3 ? 1 : 0; return { use: 'ringroom', at: [x, z], upper: fl > 1, same: 'ring:' + fl + ':' + Math.round(Math.atan2(z, x) * 72 / (2 * Math.PI)) }; }
  if (r > T.ring2.r0 && r < T.ring2.r1) return { use: 'ringroom', at: [x, z], upper: y > 2, same: 'ring2' };
  for (const s of SITE_GRID()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 1.0, hush: 0.75, work: [['clothRustle', 50]] };
/** What each kind of room sounds like inside: its hush (a lowpass in Hz and a level), the rain on its tile roof, how much of the outdoors comes through. */
export const ROOMS = {
  house: R0, home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  shop_tea: { ...R0, work: [['teaClink', 40]] }, shop_wine: { ...R0, work: [['pourWine', 40]] }, shop_pickles: { ...R0, work: [['jarLid', 50]] }, shop_tobacco: { ...R0, work: [['htChop', 40]] },
  ringroom: { tone: [220, 0.15], roof: 0.9, hush: 0.45, work: [['kitchen', 40]] },        // a room of the great ring: walls of rammed earth a metre thick shut the world out
  hall: { tone: [260, 0.2], roof: 0.8, hush: 0.55, work: [['clothRustle', 60]] },
};
export const UPPER = { tone: [200, 0.12], roof: 1.1, hush: 0.4, work: [['loom', 60]] };

/** The wells: the court's two (the windlass wells of the great ring) and one in each neighbouring tulou's court. */
export const WELLS = [...T.wells, ...NEIGHBOURS.map((n) => { const S = n.kind === 'square' ? n.half - 8 : n.R - 6; return [n.c[0] + S * 0.5, n.c[1] - S * 0.2]; })];
export const FAR = {};

// ── green, frogs, water, bamboo ──
/** 0…1: how much green round (x, z): the terraces' tea and fir on the hills, the paddy, the camphors by the tulou; the yard and court little. */
export function greenNear(x, z) {
  const hillside = sm(-95, -125, z) * 0.9 + sm(112, 150, Math.abs(x)) * 0.8, paddy = z > 58 && z < 150 ? 0.55 : 0, yard = inRect(YARD, x, z, 2) ? 0.2 : 0;
  return Math.max(0.3, hillside, paddy, yard);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** Bamboo: the groves on the hill beyond the fields, a clump at the noria and at the washing steps. */
export function bambooNear(x, z) {
  const grove = Math.max(sm(-100, -135, z), sm(115, 150, Math.abs(x))) * 0.9, noria = Math.hypot(x - NORIA.x, z - streamZ(NORIA.x)) < 25 ? 0.4 : 0;
  return Math.max(grove, noria, 0.08);
}
export const lotusNear = () => 0;
/** Frogs: the flooded paddy on the terraces and the fields south of the stream, the stream's edge; the yard and the court none. */
export const frogGround = (x, z) => (z > 86 && z < 152 ? 1 : (z > 58 && z < 86 ? 0.7 : Math.max(sm(-95, -135, z), sm(112, 150, Math.abs(x))) * 0.8));
/** A place to put a frog or a fish rise: in the paddy near the listener, or on the stream; null if none within `reach`. */
export function pondSpot(x, z, rnd, reach = 28) {
  for (let k = 0; k < 8; k++) {
    const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 10 && ((pz > 90 && pz < 150) || (pz > 58 && pz < streamZ(px) - 4 && Math.abs(px) > 6))) return [px, pz];
  }
  return null;
}
/** A point on the stream's bank near the listener (the water laps and talks over the cobbles); null beyond 34 m. */
export function shoreSpot(x, z, rnd) {
  const px = Math.max(-RADIUS + 14, Math.min(RADIUS - 14, x + (rnd() - 0.5) * 16)), pz = streamZ(px);
  return Math.abs(pz - z) < 34 ? [px, pz + (rnd() - 0.5) * STREAM.w * 0.6] : null;
}
export const canalSpot = () => null;
export const canalTrack = () => null;
/** The two slab bridges: a walker's track across one near the listener. */
export function bridgeTrack(x, z, rnd) {
  const bx = [BRIDGE_X, -66].reduce((b, v) => (Math.abs(v - x) < Math.abs(b - x) ? v : b)), zc = streamZ(bx);
  if (Math.hypot(bx - x, zc - z) > 60) return null;
  const s = rnd() < 0.5 ? 1 : -1;
  return { pts: [[bx + (rnd() - 0.5) * 0.8, zc - 5 * s], [bx + (rnd() - 0.5) * 0.8, zc + 5 * s]] };
}
/** A tree to put a cicada or a bird in: the camphors and the banyan at the tulou's front, the firs of the hill. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (pz < -100 || Math.abs(px) > 118 || hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.2)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the clan's hubbub reaches (x, z): the drying ground and the lane under the great wall, the court inside. */
export function townNear(x, z) {
  if (inRect(YARD, x, z, 6)) return 1;
  if (Math.hypot(x - T.c[0], z - T.c[1]) < T.wallIn) return 0.6;
  if (z > 36 && z < 140 && Math.abs(x) < 20) return 0.5;
  return 0.12;
}
/** The road and the drying ground (porters and pedlars walk them): a walker's track along the one nearest (x, z) within `reach`; null if none. */
const STREETS = [[-2, 36, 2, 138], [-14, 44, 14, 47]];
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  STREETS.forEach((r, i) => { const qx = Math.max(r[0], Math.min(x, r[2])), qz = Math.max(r[1], Math.min(z, r[3])), d = Math.hypot(qx - x, qz - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], m2 = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.6;
  return horiz ? { pts: [[a, m2 + off], [b, m2 + off]] } : { pts: [[m2 + off, a], [m2 + off, b]] };
}

// ── the emitters in the open ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const ring = (deg, r = (T.front + T.wallIn) / 2) => polar(r, deg);
const [bx, bz] = FARMS[3], [px, pz] = [NORIA.x, streamZ(NORIA.x)];
export const EMITTERS = [
  // the mountain songs: a woman at the tea on the upper terraces, a farmer's answer from the paddy (the song's call and answer across the valley)
  E('htSong', [-40, -128], 70, [80, 170], [8, 17], { rainMax: 0.25, after: true }), E('htSong', [60, -120], 70, [110, 220], [9, 16.5], { rainMax: 0.25, after: true }),
  E('htSong', [75, 118], 60, [120, 240], [7, 11], { rainMax: 0.25, after: true }),
  // the barn's foot-lever pestle in the mornings and the late afternoon
  E('htPestle', [bx, bz], 16, [25, 60], [6, 10.5], { rainMax: 0.9, after: true }), E('htPestle', [bx, bz], 16, [30, 70], [15, 18], { rainMax: 0.9, after: true }),
  // the noria in the stream, all day and night (it turns while the stream runs)
  E('htNoria', [px, pz], 20, [4, 9], [0, 24], { rainMax: 1 }),
  // the washing beaten on the steps, morning and after the fields
  ...WASH_STEPS.map(([x]) => E('htBeat', [x, streamZ(x) - 3.4], 14, [30, 80], [6, 9.5], { rainMax: 0.4 })), E('htBeat', [WASH_STEPS[0][0], streamZ(WASH_STEPS[0][0]) - 3.4], 14, [40, 90], [16, 18], { rainMax: 0.4 }),
  // the buffalo in the paddy, the clapper at its neck
  E('htClapper', [-30, 112], 22, [20, 50], [6, 18], { rainMax: 0.8, after: true }), E('htClapper', [40, 118], 22, [25, 60], [6, 18], { rainMax: 0.8, after: true }),
  // the great gate opened at first light and shut and barred at dusk
  E('htGate', [0, T.R], 40, [900, 1200], [5.4, 6.1], { rainMax: 1, after: true }), E('htGate', [0, T.R], 40, [900, 1200], [18.6, 19.5], { rainMax: 1, after: true }),
  // the kitchens of the ring at the three meals, heard in the lane and the court (a hearth in every ground room)
  ...[20, 70, 110, 160, 200, 250, 290, 340].flatMap((a, i) => [E('kitchen', ring(a, 26), 12, [14, 30], [5.5, 7.5], { dry: false, rainMax: 1 }), E('kitchen', ring(a + 8, 26), 12, [16, 34], [11, 13], { rainMax: 1 }), E('kitchen', ring(a + 4, 26), 12, [16, 34], [16.5, 19.5], { rainMax: 1 })].slice(0, i % 2 ? 2 : 3)),
  // the looms and the tea of the galleries above, the clan's low murmur in the court is the engine's hubbub (townNear)
  ...[35, 95, 150, 215, 275, 330].map((a) => E('loom', ring(a, 25), 9, [30, 80], [8, 17], { rainMax: 1 })),
  // the earth-god's shrines at the bridge head: a pause of incense, nothing sounded; the owls of the hill at night
  E('htOwl', [0, -130], 60, [60, 140], [21, 4], { rainMax: 0.4 }), E('htOwl', [110, 20], 60, [80, 160], [22, 4], { rainMax: 0.4 }),
];
void SHRINES; void HOUSES;
