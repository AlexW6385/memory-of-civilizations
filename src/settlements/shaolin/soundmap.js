// Where Shaolin's sounds are (docs/settlements/shaolin.md §11.3): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the bell and drum in their towers and the recitation in the Mahavira Hall (the engine's `temple-am` / `temple-pm`, from TEMPLE), the staff drill in the court
// and the stamping in the training hall, the wooden board, the kitchen's range, the bronze bells at the eaves and the pagodas' tiers, the village's trades at the open
// houses, the wells, the porters and hawkers on the street, the owls on the hill. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-shaolin.js). Coordinates: metres, +x east, +z south, the settlement's frame.
// What the scheduler asks of a map but Shaolin has not (no canals, ponds, bridges or bamboo) is answered with nothing.
import '../../engine/voices-shaolin.js';
import { AXIS, BELL, DRUM, RANGES, STUPAS, FOREST, RADIUS, HOUSES, YARDS, inRect } from './layout.js';
import { openedHouses } from './walk.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the approach road). */
export const HOME = [0, 160];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each open village house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices]. */
const SHOP_WORK = {
  tea: [['teaClink', [30, 70], [6, 19.5]]],
  food: [['kitchen', [14, 30], [5.5, 20]], ['bowlClack', [20, 50], [6, 20]]],
  rice: [['sack', [30, 70], [6.5, 18]]],
  cloth: [['clothRustle', [30, 70], [7, 18]], ['scissors', [60, 120], [7, 18]]],
  medicine: [['mortar', [16, 36], [7, 18]], ['drawer', [40, 90], [7, 18]]],
  wine: [['pourWine', [30, 70], [8, 20]]],
  pottery: [['jarLid', [30, 70], [7, 17.5]]],
  iron: [['hammer', [8, 22], [6.5, 18]]],
  books: [['paper', [30, 70], [8, 18]]],
};
const HOME_WORK = [['kitchen', [16, 34], [5.5, 20]], ['grinder', [70, 140], [6, 18]]];
const useOf = (h) => (h.kind === 'shop' ? 'shop_' + h.trade : 'home');
let SITES = null;
/** The open village houses and the monastery's rooms that make sounds: { use, rect, at: [x, z], id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const { h } of openedHouses()) SITES.push({ use: useOf(h), rect: h.rect, at: mid(h.rect), id: 'lot:' + h.seed, work: h.kind === 'shop' ? SHOP_WORK[h.trade] || [] : HOME_WORK, y: 0.25 });
  for (const q of RANGES) {
    if (q.kind === 'kitchen') SITES.push({ use: 'kitchen', rect: q.rect, at: mid(q.rect), id: 'room:kitchen', work: [['kitchen', [8, 18], [4.5, 20]], ['bowlClack', [30, 70], [5, 19]]], y: 0.37 });
    if (q.kind === 'refectory') SITES.push({ use: 'refectory', rect: q.rect, at: mid(q.rect), id: 'room:refectory', work: [['bowlClack', [10, 24], [10.5, 12]], ['bowlClack', [14, 30], [17, 18.5]]], y: 0.37 });
  }
  SITES.push({ use: 'training', rect: AXIS.qianfo, at: mid(AXIS.qianfo), id: 'room:training', work: [['slStomp', [30, 70], [6, 11.5]], ['slStomp', [40, 90], [14, 17]]], y: 1.4 });
  SITES.push({ use: 'library', rect: AXIS.fatang, at: mid(AXIS.fatang), id: 'room:library', work: [['paper', [40, 90], [8, 17]]], y: 0.7 });
  return SITES;
}

/** The wells of the yards (town.js: the yard of every third house has a windlass well at its middle + (1.2, 0.3)). */
export const WELLS = YARDS.filter((_, i) => i % 3 === 0).map((y) => [(y.rect[0] + y.rect[2]) / 2 + 1.2, (y.rect[1] + y.rect[3]) / 2 + 0.3]);
export const FAR = {};
/** The bell and drum towers, and the Mahavira Hall (the engine's `temple-am` / `temple-pm` read these: the bell east of the court, the drum west, the chant in the hall).
 *  [inferred: the bell tower stood at the court's east in the standard plan; ours puts the bell at x −21 and the drum at x +21, §8.] */
export const TEMPLE = { bell: mid(BELL), drum: mid(DRUM), hall: mid(AXIS.mahavira), court: [0, 62], rects: { hall: AXIS.mahavira } };

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  if (inRect(AXIS.mahavira, x, z)) return { use: 'temple', at: mid(AXIS.mahavira), upper: false, same: 'temple:hall' };
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a tile roof over boards), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  temple: { tone: [200, 0.2], roof: 0.9, hush: 0.6, work: [['slEaveBell', 40]] },
  training: { tone: [260, 0.25], roof: 0.9, hush: 0.7, work: [['slStomp', 30]] },
  library: { tone: [220, 0.2], roof: 0.9, hush: 0.7, work: [['paper', 50]] },
  kitchen: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['kitchen', 14]] },
  refectory: { tone: [260, 0.25], roof: 1.0, hush: 0.8, work: [['bowlClack', 30]] },
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  shop_tea: { ...R0, work: [['teaClink', 40]] }, shop_food: { ...R0, tone: [360, 0.3], work: [['kitchen', 24]] }, shop_rice: { ...R0, work: [['sack', 50]] },
  shop_cloth: { ...R0, work: [['clothRustle', 40]] }, shop_medicine: { ...R0, work: [['mortar', 24]] }, shop_wine: { ...R0, work: [['pourWine', 40]] },
  shop_pottery: { ...R0, work: [['jarLid', 40]] }, shop_iron: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 14]] }, shop_books: { ...R0, work: [['paper', 40]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const inForest = (x, z) => inRect(FOREST, x, z, 0);
/** 0…1: how much green round (x, z): the old cypresses of the courts and the approach, the pines of the slope, the forest's cypresses; the dry plain little. */
export function greenNear(x, z) {
  const court = inRect([-62, -112, 62, 128], x, z) ? 0.55 : 0, slope = sm(-112, -170, z) * 0.7, forest = inForest(x, z) ? 0.5 : 0;
  return Math.max(0.2, court, slope, forest);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the cypresses of the courts, the forest's, the slope's pines. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (inForest(px, pz) || pz < -125 || (inRect([-62, -112, 62, 128], px, pz) && hash(Math.floor(px / 10), Math.floor(pz / 10)) < 0.25))) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the pilgrims' hubbub reaches (x, z): the forecourt and the village street, less in the courts, little in the forest and on the mountain. */
export function townNear(x, z) {
  if (z > 128 && z < 195) return 1;
  if (inRect([-62, -112, 62, 128], x, z)) return 0.3;
  return 0.1;
}
// what Shaolin has none of
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

/** The village street and the approach (porters, hawkers, the night watch walk them): a walker's track along the one nearest (x, z) within `reach`; null if none. */
const STREETS = [[-86, 153, 86, 157], [-3, 132, 3, 188]];
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  STREETS.forEach((r, i) => { const qx = Math.max(r[0], Math.min(x, r[2])), qz = Math.max(r[1], Math.min(z, r[3])), d = Math.hypot(qx - x, qz - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid2 = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, mid2 + off], [b, mid2 + off]] } : { pts: [[mid2 + off, a], [mid2 + off, b]] };
}

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const BIG = STUPAS.filter((s) => s.tiers >= 5).slice(0, 7).map((s) => s.c);
export const EMITTERS = [
  // the recitation in the Mahavira Hall at the noon offering and in the afternoon (the dawn and dusk services come with the bell and drum: `temple-am`, `temple-pm`)
  E('slChant', mid(AXIS.mahavira), 20, [60, 140], [10.6, 11.8], { rainMax: 1, after: true, inside: 'temple:hall' }),
  E('slChant', mid(AXIS.mahavira), 20, [90, 200], [14, 15.6], { rainMax: 1, after: true, inside: 'temple:hall' }),
  // the staff drill in the court before the Thousand Buddha Hall, the stamping in the hall
  E('slStaff', [0, -70], 26, [30, 80], [6, 11.5], { rainMax: 0.3, after: true }), E('slStaff', [0, -70], 26, [40, 100], [14, 17], { rainMax: 0.3, after: true }),
  E('slStomp', mid(AXIS.qianfo), 16, [30, 70], [6, 11.5], { rainMax: 0.9, inside: 'room:training' }), E('slStomp', mid(AXIS.qianfo), 16, [40, 90], [14, 17], { rainMax: 0.9, inside: 'room:training' }),
  // the board that wakes the house before the bell, and calls to the noon meal (the dormitories' range, the refectory's)
  E('slBoard', [-47, -43], 28, [150, 260], [3.5, 4.3], { rainMax: 1, after: true }), E('slBoard', [47, 55], 24, [150, 260], [10.2, 11.0], { rainMax: 1, after: true }),
  // the kitchen's range at its work, the guest hall's tea
  E('kitchen', [47, -17], 12, [14, 28], [4.5, 19]), E('teaClink', [-47, 106], 10, [40, 90], [7, 19]),
  // the bronze bells at the eaves of the halls and the towers and the tiers of the great pagodas: they ring whenever the wind stirs, day and night
  ...['shanmen', 'tianwang', 'mahavira', 'fatang', 'qianfo'].map((k) => E('slEaveBell', mid(AXIS[k]), 14, [9, 24], [0, 24], { rainMax: 1 })),
  E('slEaveBell', mid(BELL), 12, [14, 30], [0, 24], { rainMax: 1 }), E('slEaveBell', mid(DRUM), 12, [14, 30], [0, 24], { rainMax: 1 }),
  ...BIG.map((c) => E('slEaveBell', c, 12, [10, 26], [0, 24], { rainMax: 1 })),
  // the owls of the slope and the forest at night
  E('slOwl', [-140, 70], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('slOwl', [10, -150], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
