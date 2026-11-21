// Where Karakorum's sounds are (docs/settlements/mongol-karakorum.md §14.3): the places of its emitters and the geometry the audio engine needs to put each sound where
// it is made — the court's fiddle and the silver tree's trumpet in the palace hall, the churns at the gers, the felt beaten at the yards, the bellows and kilns of the Cathayan
// quarter, the drum of the Great Hall and the idol temples, the board of the Nestorian church, camel bells at the west gate, the herdsmen at the markets of the gates,
// the work of each bay of the bazaar (by its trade), the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-karakorum.js). Coordinates: metres, +x east, +z south.
import '../../engine/voices-karakorum.js';
import { RADIUS, PALACE, HALL_RECT, TREE, WALL, TEMPLES, TEMPLES_NW, WORKSHOPS, MOSQUES, CHURCH, FORGES, KILNS, GREAT_RECT, HOUSEHOLD, CAMPS, PENS, COURT_GER, STORES, inRect } from './layout.js';
import { bays } from './walkroutes.js';

/** Where the audio puts the listener when the engine gives none (the arrival in the palace gate). */
export const HOME = [70, -12];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each trade of the bazaar's bays and from the halls: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; Rubruck's craftsmen, UW's kilns and metalwork]. */
const WORK = {
  cloth: [['clothRustle', [24, 60], [7, 18]]],
  carpet: [['kkFeltBeat', [90, 200], [7, 17]], ['clothRustle', [40, 90], [7, 18]]],
  saddler: [['jarLid', [40, 90], [7, 18]]],
  spice: [['jarLid', [30, 70], [7, 18]]],
  pots: [['jarLid', [24, 60], [7, 18]], ['clay', [40, 90], [7, 17]]],
  metal: [['hammer', [14, 36], [6.5, 18]]],
  food: [['kitchen', [18, 40], [6, 20]]],
  wine: [['pour', [30, 70], [8, 21]], ['jarLid', [50, 110], [8, 21]]],
  potter: [['wheel', [24, 50], [6.5, 17]], ['clay', [12, 28], [6.5, 17]]],
  smith: [['hammer', [10, 26], [6.5, 18]], ['kkBellows', [30, 70], [6.5, 18]]],
  temple: [['kkTempleDrum', [120, 260], [5, 21]]],
  greathall: [['kkTempleDrum', [90, 200], [5, 21]]],
  mosque: [],
  church: [['kkBoard', [180, 400], [5, 20]]],
  ger: [['kkChurn', [60, 140], [6, 20]]],
  palacehall: [['kkMorin', [80, 160], [10, 23]], ['kkTrumpet', [60, 140], [10, 23]]],
};
let SITES = null;
/** The places that make sounds: { use, rect, at: [x, z] (the middle), id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const b of bays()) {
    const r = b.row, w = 3.6, ns = r.face === 'n' || r.face === 's', rr = ns ? [r.a[0] + b.i * w + 0.3, r.a[1], r.a[0] + (b.i + 1) * w - 0.3, r.a[1] + r.d] : [r.a[0], r.a[1] + b.i * w + 0.3, r.a[0] + r.d, r.a[1] + (b.i + 1) * w - 0.3];
    SITES.push({ use: b.trade, rect: rr, at: mid(rr), id: `bay:${r.seed}:${b.i}`, work: WORK[b.trade], y: 0 });
  }
  WORKSHOPS.forEach((q, i) => SITES.push({ use: i % 3 === 2 ? 'smith' : 'potter', rect: q, at: mid(q), id: 'room:workshop' + i, work: WORK[i % 3 === 2 ? 'smith' : 'potter'], y: 0.5 }));
  [...TEMPLES, ...TEMPLES_NW].forEach((q, i) => SITES.push({ use: 'temple', rect: q, at: mid(q), id: 'room:temple' + i, work: WORK.temple, y: 0.7 }));
  SITES.push({ use: 'greathall', rect: GREAT_RECT, at: mid(GREAT_RECT), id: 'room:greathall', work: WORK.greathall, y: 1.5 });
  SITES.push({ use: 'palacehall', rect: HALL_RECT, at: mid(HALL_RECT), id: 'room:palacehall', work: WORK.palacehall, y: 1.6 });
  SITES.push({ use: 'church', rect: CHURCH, at: mid(CHURCH), id: 'room:church', work: WORK.church, y: 0 });
  MOSQUES.forEach((q, i) => SITES.push({ use: 'mosque', rect: q, at: mid(q), id: 'room:mosque' + i, work: WORK.mosque, y: 0 }));
  return SITES;
}

/** The wells of the quarters (layout WELLS). */
export const WELLS = [[-70, 12], [-20, -40], [30, 40], [-100, -45]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
const GERS = [COURT_GER.c, ...HOUSEHOLD.map((g) => g.c)];
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.2 && s.use !== 'greathall' && s.use !== 'palacehall', same: s.id };
  for (const [i, c] of GERS.entries()) if (Math.hypot(x - c[0], z - c[1]) < (i ? 3.0 : 4.2)) return { use: 'ger', at: c, upper: false, same: 'ger' + i };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a flat earth roof: dull; felt: duller), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.7, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  cloth: { ...R0 }, carpet: { ...R0, tone: [240, 0.2], hush: 0.9, work: [['kkFeltBeat', 90]] }, saddler: { ...R0, work: [['jarLid', 70]] }, spice: { ...R0, work: [['jarLid', 50]] },
  pots: { ...R0, work: [['clay', 40]] }, metal: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 30]] }, food: { ...R0, tone: [340, 0.3], work: [['kitchen', 30]] }, wine: { ...R0, work: [['pour', 50]] },
  potter: { ...R0, tone: [320, 0.3], hush: 0.9, work: [['clay', 14]] }, smith: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 20]] },
  temple: { tone: [200, 0.2], roof: 0.9, hush: 0.6, work: [['kkTempleDrum', 160]] },
  greathall: { tone: [170, 0.2], roof: 0.8, hush: 0.5, work: [['kkTempleDrum', 120]] },
  palacehall: { tone: [190, 0.2], roof: 0.8, hush: 0.5, work: [['kkMorin', 100], ['kkTrumpet', 90]] },
  church: { tone: [210, 0.2], roof: 0.9, hush: 0.6, work: [['kkBoard', 220]] },
  mosque: { tone: [220, 0.2], roof: 0.8, hush: 0.6, work: [['clothRustle', 120]] },
  ger: { tone: [260, 0.3], roof: 0.3, hush: 0.7, work: [['kkChurn', 80], ['kkLongSong', 140]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): a few poplars and willows by the wells and the court's walls; the steppe is bare. */
export function greenNear(x, z) { return Math.max(0.12, 0.35 * (1 - sm(0, 40, Math.min(...WELLS.map((w) => Math.hypot(w[0] - x, w[1] - z)))))); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.8);
/** A tree to put a bird in, near (x, z), or null: the poplars along the palace court's walls and the wells' willows. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const w = WELLS[Math.floor(rnd() * WELLS.length)], a = rnd() * Math.PI * 2, px = w[0] + Math.cos(a) * 3, pz = w[1] + Math.sin(a) * 3;
    if (Math.hypot(px - x, pz - z) < reach) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the bazaar on the main street and the cross-street, less in the palace court, little on the steppe outside the wall. */
export function townNear(x, z) {
  const inside = inRect(WALL, x, z, 4);
  if (!inside) return Math.max(0.08, 0.35 * (1 - sm(0, 50, Math.hypot(Math.max(WALL[0] - x, 0, x - WALL[2]), Math.max(WALL[1] - z, 0, z - WALL[3])))));
  if (inRect(PALACE, x, z)) return 0.4;
  return Math.abs(z) < 12 || Math.abs(x) < 10 ? 1 : 0.6;
}
// what Karakorum has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ─────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const tw = (q) => mid(q);
export const EMITTERS = [
  // the court's feast: the fiddle and the trumpet of the silver tree in the hall (heard through its three doors), the pouring of the drinks at the tree [stated: Rubruck: the tree's pipes and the trumpet]
  E('kkMorin', [HALL_RECT[0] + 8.4, HALL_RECT[1] + 8], 24, [70, 150], [10, 23], { rainMax: 0.5, after: true }),
  E('kkTrumpet', [TREE[0], TREE[1] - 4], 30, [80, 180], [10, 23], { rainMax: 0.7, after: true }),
  E('pour', [TREE[0] - 1, TREE[1]], 9, [14, 30], [10, 23], { rainMax: 0.7, after: true }),
  // the standards in the wind before the hall
  E('kkBanner', [58, -22], 16, [20, 50], [0, 24], { rainMax: 1 }), E('kkBanner', [82, -22], 16, [20, 50], [0, 24], { rainMax: 1 }),
  // the khan's household: churns at the gers by the hall's back, the women's long songs at the evening
  ...HOUSEHOLD.slice(0, 4).map((g, i) => E(i % 2 ? 'kkLongSong' : 'kkChurn', g.c, 12, i % 2 ? [150, 320] : [70, 160], i % 2 ? [17, 22] : [6, 11], { rainMax: 0.3, dry: true })),
  E('kkChurn', COURT_GER.c, 12, [90, 200], [6, 20], { rainMax: 0.3, dry: true }),
  E('kkFeltBeat', [28.4, -28.4], 12, [80, 170], [7, 17], { dry: true }),
  // the ger camps outside the south wall: long songs and the fiddle at dusk, churns by day
  ...[CAMPS.sw, CAMPS.se].flatMap((c, i) => [E('kkChurn', [c[0] + 4, c[1]], 22, [60, 130], [6, 19], { dry: true }), E('kkMorin', [c[0] + 8 + i * 6, c[1] + 3], 26, [140, 300], [17.5, 23], { rainMax: 0.2, after: true }), E('kkLongSong', [c[0] - 6, c[1]], 24, [180, 380], [17, 22], { rainMax: 0.2 })]),
  // the Cathayan quarter's forges (bellows and hammers), kilns
  ...FORGES.flatMap((q) => [E('hammer', tw(q), 16, [10, 26], [6.5, 18], { dry: true }), E('kkBellows', tw(q), 16, [28, 60], [6.5, 18], { dry: true })]),
  ...KILNS.map(([x, z]) => E('kkKilnRoar', [x, z], 14, [10, 18], [0, 24], { rainMax: 1 })),
  // the temples' drums: the Great Hall's, morning and evening [stated: DAI: a Buddhist temple]
  E('kkTempleDrum', tw(GREAT_RECT), 40, [100, 200], [5, 7.5], { rainMax: 0.9 }), E('kkTempleDrum', tw(GREAT_RECT), 40, [100, 200], [17, 20], { rainMax: 0.9 }),
  ...TEMPLES.slice(0, 3).map((q) => E('kkTempleDrum', tw(q), 24, [150, 300], [5, 20], { rainMax: 0.9 })),
  // the Nestorian church's board at the far south-west end
  E('kkBoard', tw(CHURCH), 30, [200, 420], [5.5, 20], { rainMax: 0.8 }),
  // camel bells: the Saracens' caravan resting outside the west gate and the camels at the main street's west end
  E('kkCamelBell', [-154, 37], 26, [20, 50], [0, 24], { rainMax: 0.9 }), E('kkCamelBell', [-117, -4.6], 18, [30, 70], [6, 20], { rainMax: 0.8 }),
  // the markets at the gates: herdsmen's calls at the horse pens (north) and the sheep pens (west), the oxen carts (south)
  E('kkHerd', mid(PENS.n[0]), 40, [50, 120], [6, 19], { rainMax: 0.6 }), E('kkHerd', mid(PENS.w[0]), 40, [60, 140], [6, 19], { rainMax: 0.6 }), E('kkHerd', [0, 118], 36, [90, 200], [6, 19], { rainMax: 0.6 }),
  // the wells
  ...WELLS.map(([x, z]) => E('wellBucket', [x, z], 10, [40, 90], [6, 19], { dry: true })),
  // the storehouses of the palace: sacks and jars
  ...STORES.slice(0, 2).map((q) => E('jarLid', tw(q), 12, [50, 120], [7, 18])),
  // night: an owl, the far dogs come from the profile
  E('owl', [-60, 130], 60, [50, 120], [21, 4.5], { rainMax: 0.4 }), E('owl', [100, -130], 60, [70, 150], [21, 4], { rainMax: 0.4 }),
];
void RADIUS;
