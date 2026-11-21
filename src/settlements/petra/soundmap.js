// Where Petra's sounds are (docs/settlements/petra.md §25): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the water in the channel cut in the Siq's wall, the wind between its walls, the caravans coming down the Outer Siq with their wooden bells, the sellers of
// incense and spice under the colonnade, the Nymphaeum's spouts and the basins, the chant and the frame drum at the great altar before Qasr al-Bint at dawn and dusk,
// the lyre and the pipe at a banquet in the triclinium, the potters' yards, the querns of the tents, the rooms one can be inside. Pure data and functions of
// layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-petra.js).
// Coordinates: metres, +x east, +z south, the settlement's frame. What the scheduler asks of a map but Petra has not (canals, ponds, bridges, bamboo, frogs, street
// vendors with carried goods) is answered with nothing.
import '../../engine/voices-petra.js';
import { RADIUS, STREET, PLAZA, OUTER, SIQ_LINE, GREAT_TEMPLE, QASR, TRICLINIUM, GARDEN, shopUnits, outerLots, lots, yards, inRect, open } from './layout.js';
import { tradeOf } from './shops.js';

/** Where the audio puts the listener when the engine gives none (the arrival at the Siq's mouth). */
export const HOME = [146, -160];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const WORK = {
  shop_incense: [['coin', [40, 90], [7, 18]], ['jarLid', [30, 70], [7, 18]]],
  shop_spice: [['mortar', [24, 60], [7, 18]], ['jarLid', [40, 90], [7, 18]]],
  shop_potter: [['clay', [16, 36], [7, 18]], ['jarLid', [40, 90], [7, 18]]],
  shop_cloth: [['clothRustle', [20, 45], [7, 18]]],
  shop_oil: [['pour', [24, 55], [7, 18]], ['jarLid', [40, 90], [7, 18]]],
  shop_grain: [['sack', [18, 40], [7, 18]]],
  house: [['kitchen', [16, 34], [5.5, 20]], ['ptQuern', [60, 120], [5.5, 9.5]]],
  court: [['kitchen', [16, 34], [5.5, 20]], ['ptQuern', [60, 120], [5.5, 9.5]], ['wellBucket', [60, 130], [6, 18]]],
  yard_potter: [['wheel', [24, 50], [6.5, 17.5]], ['clay', [12, 28], [6.5, 17.5]]],
  yard_cistern: [['wellBucket', [40, 90], [6, 18]], ['pour', [50, 110], [6, 18]]],
  yard_tents: [['ptQuern', [50, 100], [5.5, 9.5]], ['kitchen', [20, 45], [5, 20]]],
};
let SITES = null;
/** The rooms and yards with sounds: { use, rect, at: [x, z] (the middle), id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  // the shops of the colonnaded street, by trade
  for (const s of shopUnits()) { const use = 'shop_' + tradeOf(s), rect = [s.x0 + 0.4, s.z0, s.x1 - 0.4, s.z1 - 0.2]; SITES.push({ use, rect, at: mid(rect), id: 'shop:' + s.i, work: WORK[use], y: s.yf }); }
  // the eight houses of the Outer Siq
  for (const l of outerLots()) SITES.push({ use: 'house', rect: l.rect, at: mid(l.rect), id: 'outer:' + l.i, work: [WORK.house[0]], y: 0 });
  // the houses of the valley nearest the street (those farther are heard only as the town's murmur)
  for (const l of lots()) if (Math.abs(mid(l.rect)[1] - STREET.a[1]) < 55 && l.rect[2] > -150 && l.rect[0] < 50) SITES.push({ use: l.rect[2] - l.rect[0] >= 9 ? 'court' : 'house', rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: l.rect[2] - l.rect[0] >= 9 ? WORK.court : WORK.house, y: l.y });
  // the yards: the potters' (wheel and clay), the cistern courts (the bucket), the tents (the quern, the fire)
  for (const y of yards()) { const w = WORK['yard_' + y.kind]; if (w) SITES.push({ use: 'yard_' + y.kind, rect: y.rect, at: mid(y.rect), id: 'yard:' + y.seed, work: w, y: y.y }); }
  return SITES;
}

/** The wells: none (the water is the cisterns', the basins' and the channel's: the emitters below). */
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['room:treasury', 'treasury', [PLAZA.c[0] - PLAZA.r + 2 - 21.2, PLAZA.c[1] - 5.2, PLAZA.c[0] - PLAZA.r + 2 - 5.9, PLAZA.c[1] + 5.2]],
  ['room:triclinium', 'triclinium', [TRICLINIUM.at[0] - TRICLINIUM.w / 2 + 0.6, TRICLINIUM.at[1] - 1.6 - TRICLINIUM.d + 0.6, TRICLINIUM.at[0] + TRICLINIUM.w / 2 - 0.6, TRICLINIUM.at[1] - 1.7]],
  ['room:great-temple', 'temple', [GREAT_TEMPLE[0] + 7, GREAT_TEMPLE[1] + 52, GREAT_TEMPLE[2] - 7, GREAT_TEMPLE[1] + 64]],
  ['room:qasr', 'temple', [QASR.rect[0] + 3, QASR.rect[1] + 9, QASR.rect[2] - 3, QASR.rect[1] + 18]],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a flat plastered roof on beams), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  house: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  court: { ...R0, tone: [360, 0.3], hush: 0.7, work: [['kitchen', 30]] },
  shop_incense: { ...R0, work: [['jarLid', 40]] },
  shop_spice: { ...R0, work: [['mortar', 36]] },
  shop_potter: { ...R0, work: [['clay', 24]] },
  shop_cloth: { ...R0, work: [['clothRustle', 30]] },
  shop_oil: { ...R0, work: [['pour', 36]] },
  shop_grain: { ...R0, work: [['sack', 30]] },
  yard_potter: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['clay', 16]] },
  yard_cistern: { ...R0, tone: [500, 0.4], hush: 1.0, work: [['pour', 40]] },
  yard_tents: { ...R0, tone: [380, 0.3], hush: 0.9, work: [['ptQuern', 60]] },
  treasury: { tone: [200, 0.2], roof: 0.3, hush: 0.4, work: [['jarLid', 90]] },
  triclinium: { tone: [260, 0.2], roof: 0.9, hush: 0.7, work: [['clothRustle', 60]] },
  temple: { tone: [230, 0.2], roof: 0.8, hush: 0.5, work: [['clothRustle', 80]] },
};
export const UPPER = { tone: [260, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the oleander and tamarisk of the gorge floors, the garden's palms, figs and olives, little on the rock. */
export function greenNear(x, z) {
  if (inRect(GARDEN.rect, x, z, 10)) return 0.9;
  return Math.max(0.12, 0.35 * open(x, z));
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the garden's palms and figs, the orchards and the oleander of the gorge floors. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (inRect(GARDEN.rect, px, pz, -3) || (open(px, pz) > 0.5 && hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.1))) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the colonnaded street's whole, the houses' a little, the Siq's none. */
export function townNear(x, z) {
  const s = STREET, along = x >= Math.min(s.a[0], s.b[0]) - 4 && x <= Math.max(s.a[0], s.b[0]) + 4;
  if (along && Math.abs(z - s.a[1]) < 14) return 1;
  if (Math.hypot(x - PLAZA.c[0], z - PLAZA.c[1]) < PLAZA.r + 4) return 0.2;
  if (x > 140) return 0.05;
  return Math.max(0.08, 0.5 * (1 - sm(10, 70, Math.abs(z - s.a[1]))));
}
// what Petra has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the passing: caravans along the way from the Siq to the street ────────────
/** The caravan road: down the Siq, across the forecourt, along the Outer Siq, west along the colonnaded street. */
export const ROAD = [...SIQ_LINE.filter((p) => p[0] > 150), [PLAZA.c[0], PLAZA.c[1]], ...OUTER.path.slice(1), [STREET.a[0], STREET.a[1]], [STREET.b[0], STREET.b[1]]];
const ROAD_LEN = [0]; for (let i = 1; i < ROAD.length; i++) ROAD_LEN.push(ROAD_LEN[i - 1] + Math.hypot(ROAD[i][0] - ROAD[i - 1][0], ROAD[i][1] - ROAD[i - 1][1]));
function roadAt(s) { s = Math.max(0, Math.min(ROAD_LEN[ROAD_LEN.length - 1], s)); let i = 1; while (i < ROAD.length - 1 && ROAD_LEN[i] < s) i++; const k = (s - ROAD_LEN[i - 1]) / ((ROAD_LEN[i] - ROAD_LEN[i - 1]) || 1); return [ROAD[i - 1][0] + (ROAD[i][0] - ROAD[i - 1][0]) * k, ROAD[i - 1][1] + (ROAD[i][1] - ROAD[i - 1][1]) * k]; }
/** A stretch of the caravan road about 140 m long near the listener, walked west (into the city) or east (out), with the camels' bells: { pts } or null if far from the road. */
export function caravanTrack(x, z, rnd) {
  let best = 0, bd = Infinity;
  for (let s = 0; s <= ROAD_LEN[ROAD_LEN.length - 1]; s += 5) { const p = roadAt(s), d = Math.hypot(p[0] - x, p[1] - z); if (d < bd) { bd = d; best = s; } }
  if (bd > 90) return null;
  const west = rnd() < 0.7, s0 = Math.max(0, best - (west ? 45 + rnd() * 50 : 95 - rnd() * 50)), pts = [];
  for (let k = 0; k <= 14; k++) pts.push(roadAt(west ? s0 + k * 10 : s0 + 140 - k * 10));
  return { pts };
}
export const TRACKS = [{ key: 'caravan', voice: 'ptCaravan', speed: 1.15, r50: 22, gap: [70, 170], ok: (hour, rain) => hour >= 5.5 && hour < 20.5 && rain < 0.8, get: caravanTrack }];

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const ZS = STREET.a[1];
const siqPts = [];
{ const L = SIQ_LINE; let acc = 0; for (let i = 0; i + 1 < L.length; i++) { acc += Math.hypot(L[i + 1][0] - L[i][0], L[i + 1][1] - L[i][1]); if (acc > 38) { acc = 0; siqPts.push(L[i]); } } }
export const EMITTERS = [
  // the channel cut in the Siq's wall and the clay pipe along it: running water the whole way
  ...siqPts.map((p) => E('ptChannel', p, 14, [5, 9], [0, 24], { rainMax: 1 })),
  // the wind between the walls
  ...siqPts.filter((_, i) => i % 2 === 0).map((p) => E('ptSiqWind', p, 28, [14, 40], [0, 24], { rainMax: 1 })),
  // the Nymphaeum's spouts, the street's three basins
  E('ptFountain', [66, ZS], 22, [8, 12], [0, 24], { rainMax: 1 }),
  ...[-92, -48, 36].map((x) => E('ptFountain', [x, ZS + 2.4], 12, [9, 14], [0, 24], { rainMax: 1 })),
  // the basin's women: jars filled
  ...[-92, -48, 36].map((x) => E('pour', [x, ZS + 2.4], 9, [30, 70], [6, 18], { dry: true })),
  // the caravan's halt in the forecourt: camels groan, a frame drum and a pipe by the fire in the evening
  E('ptCamel', [PLAZA.c[0] + 10.3, PLAZA.c[1] + 9], 22, [40, 90], [0, 24], { rainMax: 0.6 }),
  E('ptFrameDrum', [PLAZA.c[0] + 10.3, PLAZA.c[1] + 6.4], 20, [60, 150], [17.5, 23], { rainMax: 0.3, after: true }),
  E('ptPipe', [PLAZA.c[0] + 9.6, PLAZA.c[1] + 6.8], 20, [70, 170], [17.5, 23], { rainMax: 0.3, after: true }),
  // the camels drinking at the Nymphaeum
  E('ptCamel', [60.6, ZS], 22, [50, 120], [6, 19], { rainMax: 0.6 }),
  E('donkeyBray', [62, ZS + 3], 24, [80, 200], [6, 18], { rainMax: 0.5 }),
  // the sellers' cries under the colonnade
  ...[-85, -50, -15, 20, 50].map((x) => E('ptHawk', [x, ZS + 3.5], 18, [34, 80], [6.5, 17.5], { rainMax: 0.4 })),
  // the dawn and the dusk rites: the chant and the frame drum at the great altar before Qasr al-Bint, and at the Great Temple
  E('ptChant', [QASR.altar[0], QASR.altar[1]], 40, [90, 200], [5.5, 7.5], { rainMax: 0.5, after: true }), E('ptChant', [QASR.altar[0], QASR.altar[1]], 40, [90, 200], [17, 19], { rainMax: 0.5, after: true }),
  E('ptFrameDrum', [QASR.altar[0] + 4, QASR.altar[1]], 36, [60, 140], [5.5, 7.5], { rainMax: 0.5, after: true }), E('ptFrameDrum', [QASR.altar[0] + 4, QASR.altar[1]], 36, [60, 140], [17, 19], { rainMax: 0.5, after: true }),
  E('ptChant', [(GREAT_TEMPLE[0] + GREAT_TEMPLE[2]) / 2, GREAT_TEMPLE[1] + 58], 32, [150, 300], [6, 7.5], { rainMax: 0.5, after: true }), E('ptChant', [(GREAT_TEMPLE[0] + GREAT_TEMPLE[2]) / 2, GREAT_TEMPLE[1] + 58], 32, [150, 300], [17.5, 19], { rainMax: 0.5, after: true }),
  // the banquet in the triclinium: the lyre and the pipe, in the evening (the room's own musicians)
  E('ptLyre', [TRICLINIUM.at[0] - 1.6, TRICLINIUM.at[1] - 3.2], 12, [40, 100], [17.5, 24], { rainMax: 1, after: true, inside: 'room:triclinium' }),
  E('ptPipe', [TRICLINIUM.at[0] + 1.6, TRICLINIUM.at[1] - 3.2], 12, [60, 140], [18, 24], { rainMax: 1, after: true, inside: 'room:triclinium' }),
  // the birds and beasts of the place: Tristram's starling on the cliffs, ravens over the massif, swifts over the valley
  E('ptStarling', [200, -155], 42, [18, 50], [6, 18], { rainMax: 0.3 }), E('ptStarling', [112, -120], 42, [20, 55], [6, 18], { rainMax: 0.3 }), E('ptStarling', [-30, 10], 40, [24, 60], [6, 18], { rainMax: 0.3 }),
  E('crowCaw', [100, -100], 60, [30, 80], [5.5, 19], { rainMax: 0.4 }), E('crowCaw', [-60, 60], 60, [40, 100], [5.5, 19], { rainMax: 0.4 }),
  E('swifts', [-20, 30], 60, [24, 60], [6, 18.5], { rainMax: 0.3 }),
  // the night: the jackal on the massif, the eagle-owl in the cliffs
  E('ptJackal', [190, -40], 80, [60, 160], [20.5, 4.5], { rainMax: 0.4 }), E('ptJackal', [-150, 90], 80, [80, 180], [21, 4], { rainMax: 0.4 }),
  E('ptOwl', [100, -190], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('ptOwl', [40, 60], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
