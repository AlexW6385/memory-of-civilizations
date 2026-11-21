// Where Mount Wutai's sounds are (docs/settlements/tang-wutai.md §21): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the monastery bell and drum (the engine's `temple-am` / `temple-pm`, read from TEMPLE), the chant in the Great East Hall and the Hall of
// Manjusri, the board that calls the monks, the bronze eave bells, the monks' kitchen and refectory, the village's trades and looms at the open houses, the
// roller mill on the green, the wells, the forge, the hermit's bowl, the owls on the pine hill. Pure data and functions of layout.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-wutai.js). Coordinates: metres,
// +x east, +z south, the settlement's frame. What the scheduler asks of a map but Wutai has not (no canals, ponds, bridges or bamboo) is answered with nothing.
// [inferred throughout: no source describes 857 Wutai's sounds; the monastery's day is the Tang monastery's (bell and drum at dawn and dusk, the offices,
// the board), the village's the north Shanxi farm's.]
import '../../engine/voices-wutai.js';
import { HALL, GATE_X, GREEN, RADIUS, LANES, lots, inRect } from './layout.js';
import { village } from './village.js';
import { BELL, WENSHU } from './monastery.js';
import { rooms as cellRooms } from './cells.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the upper terrace). */
export const HOME = [35, 6];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// the Great East Hall (hall plan local x −9…8.5, z ±15 about the hall's origin) and the Manjusri hall
const HALLR = [HALL.origin[0] - 9, -15, HALL.origin[0] + 8.5, 15];
const WENSHUR = [WENSHU.x0, WENSHU.zb, WENSHU.x1, WENSHU.zf];

/** The work heard from each open place: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade]. */
const WORK = {
  inn: [['teaClink', [30, 70], [6, 21]], ['pourWine', [40, 90], [11, 21]], ['bowlClack', [20, 50], [6, 21]]],
  smithy: [['hammer', [8, 22], [6.5, 18]], ['wtBellows', [14, 36], [6.5, 18]]],
  store: [['mortar', [20, 44], [7, 18]], ['drawer', [40, 90], [7, 18]]],
  hostel: [['clothRustle', [40, 90], [5, 8]], ['sack', [50, 110], [5, 7]]],
  house: [['kitchen', [16, 34], [5.5, 20]], ['grinder', [70, 140], [6, 18]]],
  dwelling: [['loom', [30, 70], [7, 17]], ['wheel', [40, 90], [8, 17]], ['kitchen', [20, 44], [5.5, 20]]],
  teashed: [['teaClink', [30, 70], [6, 19]], ['bowlClack', [40, 90], [6, 19]]],
};
let SITES = null;
/** The open places that make sounds: { use, rect, at: [x, z], id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const v = village();
  for (const e of v.chinese) {
    if (!((e.t === 'wutai_house' && e.open) || e.t === 'wutai_dwelling')) continue;
    SITES.push({ use: e.t === 'wutai_dwelling' ? 'dwelling' : 'house', rect: e.rect, at: mid(e.rect), id: 'lot:' + e.seed, work: WORK[e.t === 'wutai_dwelling' ? 'dwelling' : 'house'], y: 0.4 });
  }
  // the four trades on the lane (village.js: the nearest flat plots on the lane, inn, smithy, store, hostel, by distance from the green)
  const flat = (l) => l.y - l.foot <= 0.7 && (l.rect[2] - l.rect[0]) >= 14, dg = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 76, (l.rect[1] + l.rect[3]) / 2);
  [...lots()].filter((l) => l.lane === 0 && flat(l)).sort((a, b) => dg(a) - dg(b)).slice(0, 4).forEach((l, i) => { const k = ['inn', 'smithy', 'store', 'hostel'][i]; SITES.push({ use: 'shop_' + k, rect: l.rect, at: mid(l.rect), id: 'trade:' + k, work: WORK[k], y: l.y + 0.3 }); });
  { const tx = GATE_X - 6.5, tz = 10.5; SITES.push({ use: 'shop_teashed', rect: [tx - 2.8, tz - 2.0, tx + 2.8, tz + 2.0], at: [tx, tz], id: 'trade:teashed', work: WORK.teashed, y: 0.2 }); }
  for (const rm of cellRooms((x, z) => [HALL.origin[0] + x, z])) {
    const w = rm.kind === 'refectory' ? [['bowlClack', [10, 24], [10.8, 12]], ['bowlClack', [14, 30], [17, 18.4]], ['kitchen', [10, 22], [4.5, 12]]] : rm.kind === 'sutra' ? [['paper', [40, 90], [8, 17]]] : [];
    SITES.push({ use: 'cell_' + rm.kind, rect: rm.rect, at: mid(rm.rect), id: 'room:' + rm.id, work: w, y: 0.45 });
  }
  return SITES;
}

/** The wells: the monks' in the courtyard (dress.js) and the green's. */
export const WELLS = [[-47, -27], [(GREEN[0] + GREEN[2]) / 2 - 9, 4.8]];
export const FAR = {};
/** The bell and the drum, and the Great East Hall (the engine's `temple-am` / `temple-pm` read these). The bell hangs in the bell pavilion on the middle terrace;
 *  a great drum is kept beside it [inferred: a Tang monastery's dawn bell and dusk drum, the pavilion standing for both towers]; the chant is in the hall. */
export const TEMPLE = { bell: [BELL[0], BELL[1]], drum: [BELL[0] + 1.6, BELL[1] - 0.8], hall: mid(HALLR), court: [-34, 0], rects: { hall: HALLR } };

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  if (inRect(HALLR, x, z) && y > 10) return { use: 'temple', at: mid(HALLR), upper: false, same: 'temple:hall' };
  if (inRect(WENSHUR, x, z) && y > 5.5) return { use: 'temple', at: mid(WENSHUR), upper: false, same: 'temple:wenshu' };
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  temple: { tone: [200, 0.2], roof: 0.9, hush: 0.6, work: [['wtEaveBell', 40]] },
  house: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  dwelling: { ...R0, tone: [260, 0.3], roof: 0.3, hush: 0.9, work: [['loom', 40]] },          // under an earth roof and a vault: the rain hardly heard
  shop_inn: { ...R0, work: [['teaClink', 40]] }, shop_smithy: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 14]] }, shop_store: { ...R0, work: [['mortar', 30]] },
  shop_hostel: { ...R0, work: [['clothRustle', 60]] }, shop_teashed: { ...R0, tone: [900, 0.6], roof: 0.7, hush: 1.0, work: [['teaClink', 40]] },
  cell_dorm: { ...R0, tone: [240, 0.2], hush: 0.7, work: [['clothRustle', 80]] }, cell_guest: { ...R0, work: [['teaClink', 50]] }, cell_sutra: { ...R0, tone: [220, 0.2], hush: 0.7, work: [['paper', 40]] },
  cell_refectory: { ...R0, tone: [260, 0.25], work: [['bowlClack', 30]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the pines of the hill and the old trees of the courts, the poplars and jujubes of the village; the terraced fields little. */
export function greenNear(x, z) {
  const hill = sm(100, 170, x) * 0.8, court = inRect([-58, -48, 94, 48], x, z) ? 0.5 : 0, village = x < -62 ? 0.35 : 0;
  return Math.max(0.2, hill, court, village);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the pines of the hill and the village's trees. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (px > 100 || (px < -62 && hash(Math.floor(px / 10), Math.floor(pz / 10)) < 0.3))) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the market's hubbub reaches (x, z): the green and the lane's trades; the monastery quiet. */
export function townNear(x, z) {
  if (x < GATE_X - 4 && x > -140 && Math.abs(z) < 24) return 1;
  if (x < GATE_X) return 0.3;
  return 0.05;
}
// what Wutai has none of
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

/** The main lane and the first cross lanes (porters, pedlars walk them): a walker's track along the one nearest (x, z) within `reach`; null if none. */
const norm = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];     // (the main lane's rect runs west: its x0 is the larger)
const STREETS = [LANES[0], ...LANES.slice(1, 5)].map(norm);
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  STREETS.forEach((r, i) => { const qx = Math.max(r[0], Math.min(x, r[2])), qz = Math.max(r[1], Math.min(z, r[3])), d = Math.hypot(qx - x, qz - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid2 = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.6;
  return horiz ? { pts: [[a, mid2 + off], [b, mid2 + off]] } : { pts: [[mid2 + off, a], [mid2 + off, b]] };
}

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`, `inside`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const gx = (GREEN[0] + GREEN[2]) / 2;
export const EMITTERS = [
  // the offices in the Great East Hall at noon and in the afternoon (dawn and dusk come with the bell and drum: `temple-am`, `temple-pm`); the Manjusri hall's
  E('wtChant', mid(HALLR), 22, [60, 140], [10.6, 11.8], { rainMax: 1, after: true, inside: 'temple:hall' }),
  E('wtChant', mid(HALLR), 22, [90, 200], [14, 15.6], { rainMax: 1, after: true, inside: 'temple:hall' }),
  E('wtChant', mid(WENSHUR), 16, [100, 220], [8.6, 9.6], { rainMax: 1, after: true, inside: 'temple:wenshu' }),
  // the board that wakes the quarters before the bell, and calls to the noon meal and the evening one
  E('wtBoard', [-30, -40], 28, [150, 260], [3.5, 4.2], { rainMax: 1, after: true }), E('wtBoard', [-30, -40], 24, [150, 260], [10.5, 11.2], { rainMax: 1, after: true }),
  // the monks' kitchen (the south range's east end) and the stove of the refectory
  E('kitchen', [-20, 39], 12, [14, 28], [4.5, 19]),
  // the bronze bells at the eave corners: they ring whenever the wind stirs, day and night
  E('wtEaveBell', mid(HALLR), 16, [9, 24], [0, 24], { rainMax: 1 }), E('wtEaveBell', mid(WENSHUR), 14, [10, 26], [0, 24], { rainMax: 1 }), E('wtEaveBell', [-52, 0], 14, [10, 28], [0, 24], { rainMax: 1 }),
  E('wtEaveBell', [66, 32], 12, [12, 30], [0, 24], { rainMax: 1 }), E('wtEaveBell', [BELL[0], BELL[1]], 12, [14, 30], [0, 24], { rainMax: 1 }),
  // the wells: the monks' bucket at the courtyard well, the villagers' at the green's
  E('wellBucket', [-47, -27], 10, [40, 100], [5, 18]), E('wellBucket', [gx - 9, 4.8], 10, [30, 80], [5.5, 19]),
  // the roller mill on the green, drawn round by a donkey in the days of threshing and grinding
  E('wtMill', [gx + 10, 4.8], 14, [40, 90], [6.5, 17.5], { rainMax: 0.2, after: true }),
  // the hermit's bowl on the hill at dawn and dusk, the owls of the pine hill at night
  E('wtBowl', [177, 54], 60, [150, 300], [4.8, 5.6], { rainMax: 0.3 }), E('wtBowl', [177, 54], 60, [150, 300], [18, 18.8], { rainMax: 0.3 }),
  E('wtOwl', [130, 40], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('wtOwl', [-130, 140], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
