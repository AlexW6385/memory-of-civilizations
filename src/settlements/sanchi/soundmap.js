// Where Sanchi's sounds are (docs/settlements/sanchi.md §22): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the wooden gong at each monastery's court, the recitation at the Great Stupa, at Stupa 2 and in Temple 40's hall, the bowl's clack at the Great Bowl
// at the meal, the ivory carvers', the smith's, the potter's, the oil press's, the grinders and kitchens of the open houses, the pour at the tank's ghat and
// the wells' buckets, the zebu bells on the way and the pilgrims' road, the stalls' murmur, the peafowl on the hill, the rooms one can be inside. Pure data and
// functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-sanchi.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout: what sounded is from the dossier §9,
// §10, §13; the hours follow the monastic day (the gong at dawn, the meal before noon, the evening recitation) and the day of a pilgrim town.]
import '../../engine/voices-sanchi.js';
import { RADIUS, TOP, TANK, STREETS, HALL, PLAZA, TEMPLE40, VIHARA2, lots, yards, tankD, inTank, onStreet, inLot, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the summit's south approach). */
export const HOME = [0, 55];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade]. */
const WORK = {
  home: [['kitchen', [14, 30], [5, 20]], ['grinder', [50, 100], [5, 9]]],
  store: [['sack', [30, 70], [7, 17]], ['jarLid', [40, 90], [7, 17]]],
  grain: [['sack', [30, 70], [7, 17]], ['jarLid', [40, 90], [7, 17]]],
  oil: [['mortar', [8, 20], [6, 17]], ['pour', [40, 90], [6, 17]]],
  smith: [['hammer', [30, 70], [6.5, 17]]],
  potter: [['wheel', [24, 50], [6.5, 17]], ['clay', [12, 28], [6.5, 17]]],
  ivory: [['sanIvory', [16, 40], [7, 17]]],
  cloth: [['clothRustle', [24, 50], [6.5, 18]]],
  sweets: [['kitchen', [8, 20], [5, 20]], ['bowlClack', [30, 70], [6, 19]]],
  flowers: [['clothRustle', [40, 90], [5, 19]]],
  quiet: [['clothRustle', [40, 90], [5, 19]]],
  shed: [['sanZebuBell', [40, 90], [5, 19]]],
};
const USE_OF = { robes: 'cloth', bowls: 'potter', lamps: 'oil', incense: 'flowers' };

let SITES = null;
/** The rooms with sounds: { use, rect, at, id, work, y }: the village's open houses (shops by trade, merchants' stores, homes, sheds). */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!l.open || l.farm) continue;
    const use = l.kind === 'shop' ? (USE_OF[l.trade] || l.trade) : l.kind === 'merchant' ? 'store' : l.kind === 'shed' ? 'shed' : 'home';
    SITES.push({ use: WORK[use] ? use : 'quiet', rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[WORK[use] ? use : 'quiet'], y: 0 });
  }
  return SITES;
}

/** The wells of the village lanes (their crossings with the bazaar street, village.js) and the yards'. */
const BAZ = STREETS.find((s) => s.id === 'bazaar');
export const WELLS = [...STREETS.filter((s) => s.axis === 'z' && s.kind === 'lane').map((s) => [s.c + s.w / 2 + 0.6, BAZ.c + BAZ.w / 2 + 0.6]), ...yards().filter((_, i) => i % 3 === 0).map((y) => mid(y.rect))];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [['room:hall', 'hall', [TEMPLE40.rect[0] + 2, TEMPLE40.rect[1] + 2, TEMPLE40.rect[2] - 2, TEMPLE40.rect[3] - 2]]];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.4, same: s.id };
  if (y > TOP - 1) for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z) && y > TOP + 3) return { use, at: mid(r), upper: false, same: id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };
/** What each kind of room sounds like inside: `tone` its hush, `roof` the rain's loudness from inside (thatch and tile), `hush` how much of the outdoors comes through. */
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  store: { ...R0, tone: [260, 0.2], work: [['sack', 40]] },
  grain: { ...R0, tone: [260, 0.2], work: [['sack', 40]] },
  oil: { ...R0, tone: [280, 0.25], work: [['mortar', 14]] },
  smith: { ...R0, tone: [360, 0.3], work: [['hammer', 40]] },
  potter: { ...R0, work: [['wheel', 30]] },
  ivory: { ...R0, tone: [240, 0.2], work: [['sanIvory', 24]] },
  cloth: { ...R0, work: [['clothRustle', 40]] },
  sweets: { ...R0, tone: [380, 0.35], work: [['kitchen', 12]] },
  flowers: { ...R0, work: [['clothRustle', 60]] },
  quiet: { ...R0 },
  shed: { ...R0, tone: [240, 0.2], roof: 1.0, hush: 0.9, work: [['sanZebuBell', 50]] },
  hall: { tone: [190, 0.2], roof: 0.7, hush: 0.6, work: [['sanChant', 60]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 50]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the village's neem and pipal, the tank's margin, a little on the hill. */
export function greenNear(x, z) {
  const rim = sm(RADIUS - 150, RADIUS - 50, Math.hypot(x, z)), tank = 1 - sm(0, 24, tankD(x, z));
  return Math.max(0.15, rim * 0.8, tank * 0.6, z > 110 ? 0.4 : 0);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: neem and pipal of the village and the way, clear of streets and lots. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !onStreet(px, pz, 2) && !inLot(px, pz, 2) && !inTank(px, pz) && hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.3) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the stalls' way and the plaza, the pilgrims' road and the bazaar by day, little on the hill's far side. */
export function townNear(x, z) {
  if (inRect([-13, 44, 13, 94], x, z, 3) || inRect(PLAZA, x, z, 6) || inRect([-4, 126, 4, 266], x, z, 4) || inRect([-125, 146, 135, 154], x, z, 4)) return 1;
  if (inRect(HALL, x, z, 6)) return 0.5;
  if (inRect([-60, -30, 60, 40], x, z)) return 0.15;
  return Math.max(0.1, 0.5 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
// what Sanchi has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = (x, z) => (tankD(x, z) < 3 ? 1 : 0);
export const frogGround = (x, z) => (tankD(x, z) < 8 ? 0.8 : 0.1);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const C1 = [49, 17], C2 = [(VIHARA2[0] + VIHARA2[2]) / 2, (VIHARA2[1] + VIHARA2[3]) / 2];
export const EMITTERS = [
  // the wooden gong at each monastery's court: dawn, the meal before noon, the evening recitation
  ...[C1, C2].flatMap((p, i) => [E('sanGong', p, 60, [140, 260], [4.4, 5.6], { rainMax: 0.7 }), E('sanGong', p, 55, [160, 300], [10.4, 11.6], { rainMax: 0.7 }), E('sanGong', p, 55, [160, 300], [17.4, 18.6], { rainMax: 0.7 })].filter((_, k) => (i + k) % 2 === 0 || k === 0)),
  // the recitation round the Great Stupa (on the ground walk, south and north), at Stupa 2, in Temple 40's hall; morning and evening
  E('sanChant', [0, -19], 40, [70, 140], [5, 7.5], { rainMax: 0.8 }), E('sanChant', [0, -19], 40, [80, 150], [17, 19.5], { rainMax: 0.8 }),
  E('sanChant', [-140, 0], 30, [90, 170], [5.5, 7], { rainMax: 0.8 }), E('sanChant', [-140, 0], 30, [90, 170], [17.5, 19], { rainMax: 0.8 }),
  E('sanChant', [TEMPLE40.c[0] - 14, TEMPLE40.c[1]], 28, [60, 120], [5, 7], { rainMax: 0.6 }), E('sanChant', [TEMPLE40.c[0] - 14, TEMPLE40.c[1]], 28, [60, 120], [17, 19.5], { rainMax: 0.6 }),
  // the Great Bowl at the meal: the monks' bowls
  E('bowlClack', [27, 25], 14, [6, 16], [10.5, 12], { rainMax: 0.3 }),
  // the stalls' way: the sellers' cloth and jars, a coin; the zebu bells on the way and on the pilgrims' road
  ...[52, 62, 74, 86].map((z, i) => E('clothRustle', [0, z], 12, [16 + i * 3, 40], [6, 18], { dry: true })), ...[58, 80].map((z, i) => E('jarLid', [-8, z], 11, [24 + i * 5, 60], [6, 18], { dry: true })),
  ...[[3, 150], [-3, 190], [4, 232], [60, 150], [-70, 150]].map(([x, z], i) => E('sanZebuBell', [x, z], 18, [28 + i * 6, 70], [5.5, 19], { rainMax: 0.4 })),
  // the water at the tank's ghat: women filling pots at dawn and at dusk; the wells' buckets
  ...[-20, 0, 20].map((dx, i) => E('pour', [TANK.c[0] + dx, TANK.c[1] - TANK.r[1] - 1.5], 10, [8 + i * 3, 24], [5, 9.5], { dry: true })),
  ...[-20, 0, 20].map((dx, i) => E('pour', [TANK.c[0] + dx, TANK.c[1] - TANK.r[1] - 1.5], 10, [18 + i * 4, 50], [15.5, 18.5], { dry: true })),
  ...WELLS.slice(0, 8).map((w, i) => E('wellBucket', w, 10, [20 + i * 6, 60], [5, 18], { dry: true })),
  // the peafowl on the hill and the plain, morning and evening; the owl at night, a jackal far off
  E('sanPeacock', [-80, -40], 90, [60, 140], [5, 8.5], { rainMax: 0.5 }), E('sanPeacock', [70, 20], 90, [70, 150], [16.5, 19.5], { rainMax: 0.5 }), E('sanPeacock', [-100, 200], 90, [60, 140], [5.5, 8], { rainMax: 0.5 }),
  E('owl', [-60, 120], 60, [50, 120], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [150, -120], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
  E('dogFar', [150, 200], 45, [60, 150], [20, 5]), E('dogFar', [-120, 190], 45, [80, 170], [21, 4.5]),
];
