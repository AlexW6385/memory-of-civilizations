// Where Benin City's sounds are (docs/settlements/benin-city.md §15.3): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the log drum on the king's square and in the court of audience, the bells at the gate, the ivory horn at dawn and dusk, the thumb piano of the court, the
// casters' bellows and hammers, the carvers' mallets and the weavers' looms in the guild yards, the women's calls at the Oba market, the mortars and the trades of
// the open compounds, the water jars of the lanes, the hornbills of the rampart's trees, the rooms one can be inside. Pure data and functions of layout.js (no three.js),
// read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-benin.js). Coordinates: metres,
// +x east, +z south, the settlement's frame. [inferred throughout: the places follow the dossier's layout, the hours our reading of a working day on the equinox]
import '../../engine/voices-benin.js';
import { RADIUS, PALACE, SQUARE, MARKET, YARDS, GATE_X, WAYPOTS, lots, crest, depth, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival before the palace gate). */
export const HOME = [-65, 24];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each use of the open compounds: [voice, gap in seconds [min, max], hours [from, to]]. A trading front is heard by its goods. */
const WORK = {
  plain: [['bnPound', [50, 110], [5.5, 10]], ['kitchen', [20, 50], [5.5, 20]]],
  chief: [['kitchen', [30, 70], [5.5, 20]], ['bnThumbPiano', [120, 260], [16.5, 22]]],
  trade: [['clothRustle', [30, 70], [7, 17.5]], ['jarLid', [40, 90], [7, 17.5]]],
  pots: [['clay', [20, 50], [7, 17.5]], ['jarLid', [30, 70], [7, 17.5]]],
  oil: [['pour', [30, 70], [7, 17]], ['jarLid', [40, 90], [7, 17.5]]],
  cloth: [['clothRustle', [24, 60], [7, 17.5]]],
  pepper: [['jarLid', [30, 70], [7, 17.5]], ['bnPound', [70, 140], [7, 12]]],
  kola: [['jarLid', [40, 90], [7, 17.5]], ['coin', [80, 160], [7, 17.5]]],
  yam: [['bnPound', [30, 70], [6.5, 12]]],
  brass: [['coin', [24, 60], [7, 17.5]], ['bnBrassHammer', [60, 130], [7, 17]]],
};
let SITES = null;
/** The open compounds with sounds (all within 200 m of the arrival, where they are built in full): { use, rect, at: [x, z] (the middle), id: 'lot:<seed>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const c = mid(l.rect);
    if (Math.hypot(c[0] - HOME[0], c[1] - HOME[1]) > 200) continue;
    const use = l.chief ? 'chief' : l.kind === 'trade' ? (WORK[l.goods] ? l.goods : 'trade') : 'plain';
    SITES.push({ use, rect: l.rect, at: c, id: 'lot:' + l.seed, work: WORK[use], y: 0 });
  }
  return SITES;
}

/** The wells and water jars: those of the lanes' mouths along the great street. */
export const WELLS = WAYPOTS;
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['room:gallery', 'hall', [-111, -75, -19, -65]],
  ['room:gate', 'gate', [GATE_X - 8, -7, GATE_X + 8, 3]],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.4, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch and shingle: soft and wide), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.7, hush: 0.7, work: [['clothRustle', 50]] };
export const ROOMS = {
  plain: { ...R0, tone: [320, 0.3], work: [['bnPound', 60]] }, chief: { ...R0, tone: [260, 0.25], hush: 0.8, work: [['kitchen', 40]] }, trade: R0,
  pots: { ...R0, work: [['clay', 30]] }, oil: { ...R0, work: [['pour', 40]] }, cloth: R0, pepper: { ...R0, work: [['jarLid', 40]] }, kola: { ...R0, work: [['jarLid', 50]] },
  yam: { ...R0, work: [['bnPound', 40]] }, brass: { ...R0, tone: [340, 0.3], work: [['coin', 40]] },
  hall: { tone: [190, 0.2], roof: 0.5, hush: 0.45, work: [['bnBells', 80]] },
  gate: { tone: [240, 0.2], roof: 0.6, hush: 0.6, work: [['bnBells', 90]] },
};
export const UPPER = { tone: [230, 0.15], roof: 1.0, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the oil palms and silk-cotton trees along the verges and in the market, the forest of the rim. */
export function greenNear(x, z) {
  const rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z)), market = 1 - sm(0, 70, Math.hypot(x - 164, z + 32));
  return Math.max(0.4, rim * 0.9, market * 0.8);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the silk-cotton trees of the market and the verges, the forest of the rim. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (Math.hypot(px, pz) > RADIUS - 110 || hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.14) && !inRect(PALACE, px, pz, 2)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the Oba market and the king's square most, the great street, less in the palace's courts, little at the rim. */
export function townNear(x, z) {
  const m = 1 - sm(0, 120, Math.hypot(x - 164, z + 32)), sq = 1 - sm(0, 100, Math.hypot(x + 65, z - 20)), st = (z > 30 && z < 85) ? 0.55 : 0;
  const inner = inRect(PALACE, x, z) ? 0.5 : 1;
  return Math.max(0.1, inner * Math.max(m, sq * 0.9, st) * (1 - 0.7 * sm(RADIUS - 100, RADIUS - 10, Math.hypot(x, z))));
}
// what Benin has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** Frogs sing in the Iya's ditch and the wet ground of its outer side after dark. */
export function frogGround(x, z) { const d = Math.hypot(x, z) - crest(Math.atan2(z, x)); return d > 6 && d < 26 ? 0.8 : depth(x, z) < 30 && depth(x, z) > -30 ? 0.3 : 0; }

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
/** A point of a yard in its own frame (u along the lane, v from the lane inward), the yards' lanes being the east side of the west column and the west side of the east. */
const yardAt = (y, u, v) => { const [x0, z0, x1, z1] = y.rect; return y.front === 'e' ? [x1 - v, z0 + u] : [x0 + v, z0 + u]; };
const ring = (deg) => { const th = deg * Math.PI / 180, r = crest(th) - 6; return [Math.cos(th) * r, Math.sin(th) * r]; };
const DRUM = [SQUARE[0] + (SQUARE[2] - SQUARE[0]) / 2 + 12, SQUARE[1] + 12];
const GALLERY = [-65, -70];
export const EMITTERS = [
  // the log drum before the palace on the king's square, by day, and the drum of the court of audience
  E('bnLogDrum', DRUM, 30, [60, 150], [6.5, 18], { rainMax: 0.4, after: true }), E('bnLogDrum', [GATE_X - 9, -36], 26, [90, 200], [8, 16], { rainMax: 0.3, after: true }),
  // the bells at the gate at the opening and the closing of the court
  E('bnBells', [GATE_X, 3], 22, [30, 70], [6, 7.5], { rainMax: 0.5, after: true }), E('bnBells', [GATE_X, 3], 22, [30, 70], [17, 18.5], { rainMax: 0.5, after: true }),
  // the ivory horn of the court at dawn and at dusk, far heard
  E('bnHorn', GALLERY, 70, [90, 180], [5.5, 6.7], { rainMax: 0.4, after: true }), E('bnHorn', GALLERY, 70, [90, 180], [17.2, 18.6], { rainMax: 0.4, after: true }),
  // the thumb piano of the court, in the great gallery in the afternoon and in the court of the queen mother after dark
  E('bnThumbPiano', GALLERY, 22, [80, 170], [14, 18], { rainMax: 0.3, after: true }), E('bnThumbPiano', [-110, -100], 22, [70, 150], [18, 22], { rainMax: 0.3, after: true }),
  // the servants' kitchens in the palace's ranges: the mortar and the pots at the morning meal
  E('bnPound', [3.5, -60], 16, [40, 90], [5.5, 10], { dry: true }), E('kitchen', [3.5, -45], 14, [16, 36], [5, 20]), E('kitchen', [-136, -75], 14, [16, 36], [5, 20]),
  // the Oba market's women, calling their goods
  ...[[140, -80], [165, -50], [190, -20], [150, 5], [185, 24]].map(([x, z], i) => E('bnCall', [x, z], 26, [10 + i, 28 + i], [7, 17.5], { dry: true })),
  // the guild yards: bellows and hammer at each casting yard, the carvers' mallets, the weavers' looms
  ...YARDS.flatMap((y) => y.kind === 'cast' ? [E('bnBellows', yardAt(y, 4.2, 17), 16, [10, 22], [6.5, 17.5], { dry: true }), E('bnBrassHammer', yardAt(y, 7.6, 20), 16, [16, 40], [6.5, 17.5], { dry: true })]
    : y.kind === 'carve' ? [E('bnCarve', yardAt(y, 10, 24), 14, [10, 26], [6.5, 17.5], { dry: true })] : [E('loom', yardAt(y, 4.5, 23), 14, [10, 24], [6.5, 17.5], { dry: true })]),
  // the hornbills of the rampart's trees, at dawn and at dusk
  ...[20, 100, 190, 280].map((d, i) => E('bnHornbill', ring(d), 46, [30 + 8 * i, 80 + 8 * i], [6, 9.5], { rainMax: 0.3 })), E('bnHornbill', ring(150), 46, [40, 100], [16.5, 18.5], { rainMax: 0.3 }), E('bnHornbill', ring(330), 46, [40, 100], [16.5, 18.5], { rainMax: 0.3 }),
  // the owl at night in the trees outside the Iya
  E('owl', ring(60), 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', ring(240), 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void MARKET;
