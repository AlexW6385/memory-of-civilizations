// Where Delphi's sounds are (docs/settlements/delphi.md §15.3): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the Castalian spring in its fountain house, the paean and the aulos of the processions on the Sacred Way and the terrace, the sacrifice at the altar of
// the Chians (the goat in its pen, the fire), the mason's mallet in his yard, the herald calling the consultants, the murmur of those who wait before the temple,
// the fire of pine on the hearth of Apollo, the wreath-sellers of the forecourt, the open houses' trades, the goats and their bells on the slope, the choughs on
// the Phaedriades, the runners in the stadium, the little owl at night, and the rooms one can be inside. Pure data and functions of layout.js (no three.js),
// read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-delphi.js and, as they are,
// the engine's own and those of Athens). Coordinates: metres, +x east, +z south, the settlement's frame.
//
// What the scheduler asks of a map but Delphi has not (no canals, ponds, bridges, street vendors of Suzhou) is answered with nothing.
import '../../engine/voices-delphi.js';
import { RADIUS, TT, TEMPLE, ALTAR, SPRING, STADIUM, TREASURIES, STOA, FC, WAY, lots, inRect } from './layout.js';
import { YARD, PEN } from './votives.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the temple's terrace). */
export const HOME = [62, 16];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each trade of the open houses: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const WORK = {
  bronze: [['hammer', [10, 26], [6.5, 17.5]]],
  perfume: [['pour', [30, 70], [7, 17]], ['mortar', [40, 90], [7, 17]]],
  cloth: [['clothRustle', [24, 60], [7, 17.5]]],
  wine: [['pourWine', [30, 70], [7, 18]], ['jarLid', [40, 100], [7, 18]]],
  carpenter: [['plane', [14, 34], [6.5, 17.5]]],
  pottery: [['wheel', [24, 50], [6.5, 17]], ['clay', [12, 28], [6.5, 17]]],
  weaver: [['dlLoom', [10, 24], [6.5, 18]]],
  cook: [['kitchen', [12, 28], [6, 20]]],
  baker: [['athQuern', [30, 70], [4.5, 9]], ['kitchen', [24, 50], [4.5, 12]]],
  mason: [['athMallet', [14, 36], [6.5, 17]]],
};
let SITES = null;
/** The open houses with sounds: { use, rect, at: [x, z] (the middle), id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) if (l.open && WORK[l.trade]) SITES.push({ use: l.trade, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[l.trade], y: l.y });
  // the temple's cella: the murmur of the consultants waiting and the pine fire
  const cz = TEMPLE.cz;
  SITES.push({ use: 'cella', rect: [-15.4, cz - 6.0, 18.4, cz + 4.0], at: [-2.5, cz], id: 'room:cella', work: [['dlFire', [4, 9], [0, 24]], ['dlMurmur', [20, 50], [8, 15]]], y: 20 });
  return SITES;
}

/** The wells: none shared; each house's well-head is its own (the spring serves the sanctuary). */
export const WELLS = [];
export const FAR = {};
export const TEMPLE_SOUNDS = {};
export { TEMPLE_SOUNDS as TEMPLE };

// ── the rooms ────────────────────────────────────────────────────────────────
const cz0 = TEMPLE.cz;
const ROOM_RECTS = [
  ['room:adyton', 'adyton', [-23.5, cz0 - 4.9, -17.4, cz0 + 4.7]],
  ...TREASURIES.map((t) => ['room:' + t.id, 'treasury', [t.rect[0] + 1.15, t.rect[1] + 1.15, t.rect[2] - 1.15, t.rect[3] - 4.15]]),
  ['room:stoa', 'stoa', [STOA[0] + 0.4, STOA[1] + 0.3, STOA[2] - 0.4, STOA[3] - 1.9]],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (clay tiles on timber), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  bronze: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 28]] },
  perfume: { ...R0, work: [['pour', 40]] },
  cloth: { ...R0, work: [['clothRustle', 36]] },
  wine: { ...R0, tone: [260, 0.2], work: [['pourWine', 40]] },
  carpenter: { ...R0, tone: [340, 0.3], work: [['plane', 20]] },
  pottery: { ...R0, tone: [320, 0.3], hush: 0.9, work: [['clay', 16]] },
  weaver: { ...R0, work: [['dlLoom', 14]] },
  cook: { ...R0, tone: [380, 0.35], work: [['kitchen', 20]] },
  baker: { ...R0, tone: [360, 0.3], work: [['athQuern', 40]] },
  mason: { ...R0, tone: [440, 0.4], hush: 1.0, work: [['athMallet', 18]] },
  cella: { tone: [200, 0.2], roof: 0.8, hush: 0.6, work: [['dlFire', 6]] },
  adyton: { tone: [150, 0.2], roof: 0.6, hush: 0.4, work: [['dlFire', 8]] },
  treasury: { tone: [180, 0.15], roof: 0.7, hush: 0.5, work: [['jarLid', 90]] },
  stoa: { tone: [420, 0.1], roof: 0.9, hush: 0.9, work: [['dlMurmur', 40]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** The trees: the planes at the spring and in the forecourt, the cypresses at the stadium (plan.js), the bays at the spring. */
const TREES = [[104.5, 118], [123, 119.5], [146, 118.5], [124, 5], [122, -4], [118, 1], [-60, -94], [-46, -94], [-32, -94], [-18, -94], [-74, -94], [-88, -94], [-100, -94]];
/** 0…1: how much green round (x, z): the planes of the spring and the forecourt, the olives and cypresses of the slope and the rim; bare rock under the cliffs. */
export function greenNear(x, z) {
  let g = 0.25 + 0.4 * sm(RADIUS - 150, RADIUS - 50, Math.hypot(x, z));
  for (const [tx, tz] of TREES) g = Math.max(g, 0.9 * (1 - sm(0, 34, Math.hypot(x - tx, z - tz))));
  return g * (1 - 0.6 * sm(-110, -150, z));
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the nearest of the planted trees within `reach`. */
export function treeSpot(x, z, rnd, reach = 40) {
  let best = null, bd = reach + 8;
  for (const [tx, tz] of TREES) { const d = Math.hypot(tx - x, tz - z); if (d < bd) { bd = d; best = [tx + (rnd() - 0.5) * 4, tz + (rnd() - 0.5) * 4]; } }
  return best;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the forecourt's market and the crowd before the temple most; the village's lanes; little at the rim and the cliffs. */
export function townNear(x, z) {
  if (inRect(FC, x, z, 6)) return 1;
  if (inRect(TT, x, z)) return 0.55;
  if (inRect(SPRING, x, z, 14)) return 0.35;
  if (inRect(STADIUM, x, z, 6)) return 0.3;
  return Math.max(0.12, 0.7 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
// what Delphi has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the passing: the Sacred Way's own tracks (voices.js M.TRACKS) ───────────────
/** A track along the Sacred Way's nearest leg to (x, z): { pts } of a stretch about `lead` m ahead and behind, or null when the Way is farther than `reach`. */
export function wayTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  for (let i = 0; i + 1 < WAY.length; i++) {
    const a = WAY[i], b = WAY[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)), d = Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z);
    if (d < reach && (!best || d < best.d)) best = { d, i, t, L: Math.sqrt(l2) };
  }
  if (!best) return null;
  const a = WAY[best.i], b = WAY[best.i + 1], ux = (b[0] - a[0]) / best.L, uz = (b[1] - a[1]) / best.L, s = best.t * best.L, dir = rnd() < 0.5 ? 1 : -1;
  const s0 = Math.max(0, Math.min(best.L, s - dir * lead * (0.5 + 0.7 * rnd()))), s1 = Math.max(0, Math.min(best.L, s + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(s1 - s0) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return { pts: [[a[0] + ux * s0 - uz * off, a[1] + uz * s0 + ux * off], [a[0] + ux * s1 - uz * off, a[1] + uz * s1 + ux * off]] };
}
/** The consultants' processions go up to the temple in the morning, singing the paean; the donkeys with the gifts go up and down all day, their bells out of step. */
export const TRACKS = [
  { key: 'dlProc', voice: 'dlPaean', speed: 1.1, r50: 16, gap: [80, 190], ok: (hour, rain) => hour >= 7 && hour < 15 && rain < 0.4, get: (x, z, r) => wayTrack(x, z, r, 70, 28) },
  { key: 'dlDonkeys', voice: 'dlBell', speed: 1.0, r50: 11, gap: [50, 120], ok: (hour, rain) => hour >= 6.5 && hour < 17.5 && rain < 0.6, get: (x, z, r) => wayTrack(x, z, r, 60, 26) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const sp = mid(SPRING), al = ALTAR.c, pen = mid(PEN), st = mid(STADIUM);
export const EMITTERS = [
  // the Castalian spring: the three lion-head spouts into the basin, day and night, the girls with their hydriai, the washing
  E('dlSpring', [SPRING[0] - 0.6, sp[1] - 3], 15, [5, 9], [0, 24], { rainMax: 1 }), E('dlSpring', [SPRING[0] - 0.6, sp[1] + 3], 15, [6, 10], [0, 24], { rainMax: 1 }),
  E('athHydria', [SPRING[0] - 2.5, sp[1] - 1], 11, [30, 70], [6, 18], { dry: true }), E('clothRustle', [SPRING[0] - 6, sp[1] + 5], 9, [16, 40], [7, 16], { dry: true }),
  // the processions before the temple: the aulos and the kithara at the head, the herald calling the consultants in their order, the murmur of those who wait
  E('athAulos', [TEMPLE.X + 8, 3], 24, [100, 220], [7.5, 14], { rainMax: 0.3, after: true }), E('athKithara', [TEMPLE.X + 9, 7], 22, [140, 300], [8, 14], { rainMax: 0.3, after: true }),
  E('athHerald', [TEMPLE.X + 7.6, 4], 26, [90, 200], [8, 14], { rainMax: 0.4, after: true }),
  E('dlMurmur', [38, 5], 18, [18, 40], [7.5, 15], { rainMax: 0.6, after: true }),
  // the sacrifice at the altar of the Chians: the goat in its pen, the fire of the altar, the priests' paean
  E('dlGoat', pen, 14, [20, 50], [6, 15], { rainMax: 0.7 }), E('dlFire', al, 10, [4, 9], [6, 16], { rainMax: 0.7 }), E('dlPaean', [al[0] - 5, al[1]], 22, [150, 320], [7, 12], { rainMax: 0.3, after: true }),
  // the mason's yard on the terrace, cutting the dedications
  E('athMallet', YARD.at, 14, [14, 38], [6.5, 17], { dry: true }), E('chisel', [YARD.at[0] + 1.6, YARD.at[1] + 0.8], 10, [30, 70], [6.5, 17], { dry: true }),
  // the fire of Apollo's hearth, heard from the temple's steps
  E('dlFire', [-2.5, cz0], 7, [4, 9], [0, 24], { rainMax: 1 }),
  // the wreath-sellers and the olive-sellers of the forecourt, the cook-shop's pot
  E('athHawkWreaths', [100, 117], 20, [30, 70], [6.5, 17.5], { rainMax: 0.4 }), E('athHawkOlives', [116, 118], 20, [40, 90], [6.5, 17.5], { rainMax: 0.4 }), E('athHawkGreens', [138, 118], 20, [50, 110], [6.5, 17], { rainMax: 0.4 }),
  E('jarLid', [110, 109.8], 12, [30, 80], [6.5, 17.5]), E('sack', [122, 126.8], 12, [40, 90], [6.5, 17.5]),
  // the goats on the slope above the village, with their bells, and a goatherd's call
  E('dlGoat', [-125, 70], 24, [24, 60], [6, 19], { rainMax: 0.7 }), E('dlBell', [-120, 65], 26, [18, 44], [6, 19], { rainMax: 0.9 }), E('dlGoat', [-150, 30], 22, [30, 70], [6, 19], { rainMax: 0.7 }),
  E('dlBell', [-140, 40], 24, [20, 50], [6, 19], { rainMax: 0.9 }),
  // the choughs of the Phaedriades, circling the cliffs
  E('dlChough', [10, -150], 70, [10, 26], [6, 19], { rainMax: 0.6 }), E('dlChough', [150, -20], 55, [14, 32], [6, 19], { rainMax: 0.6 }), E('dlChough', [-60, -140], 60, [16, 36], [6, 19], { rainMax: 0.6 }),
  // the runners at their training in the stadium
  E('dlRunners', st, 26, [60, 140], [7, 17], { dry: true, after: true }),
  // the little owl at night, on the cliffs and over the village
  E('athOwl', [-30, -90], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('athOwl', [120, -40], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
