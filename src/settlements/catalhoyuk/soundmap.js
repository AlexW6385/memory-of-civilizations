// Where Çatalhöyük's sounds are (docs/settlements/catalhoyuk.md §14.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the querns and ovens and the knappers, hide-workers and mat-makers of the courts, the plaster laid in the houses, the murmur and calls over the
// roofs (the roofs are the streets), the sheep and cattle in the pens, the reeds, cranes and frogs of the marsh, a drum and a bone flute in the evening, jackals and owls
// at night, the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js (the voices of src/engine/voices-catal.js). Coordinates: metres, +x east, +z south, the settlement's frame. No bell, no cart, no horse, no
// chicken (none yet at 6500 BC), no metal, no word spoken. [inferred throughout: nothing of the sound survives.] What the scheduler asks of a map but this place has not
// (canals, bridges, street walkers, wells, a ponds list) is answered with nothing.
import '../../engine/voices-catal.js';
import { RADIUS, KIND, TRADE, ENTER, PENS, POOLS, CLUSTER, LANDMARK, CW, CD, colX, rowZ, inRect, inPool } from './layout.js';
import { cellGeom } from '../../styles/catal/cell.js';

const [LX0, LZ0, LX1, LZ1] = LANDMARK.rect;
/** Where the audio puts the listener when the engine gives none (the arrival south of the landmark). */
export const HOME = [(LX0 + LX1) / 2, LZ1 + 6];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const CH = 2.1;                                           // the room's ceiling (the roof stands above it)

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the room's use, docs §4, §11]. */
const WORK = {
  home: [['catQuern', [50, 110], [5.5, 10]], ['kitchen', [30, 70], [5, 20]], ['catPlaster', [160, 300], [7, 16]]],
  knap: [['catKnap', [20, 50], [7, 17]], ['kitchen', [60, 120], [5, 20]]],
  bake: [['catCrackle', [12, 30], [5, 21]], ['kitchen', [30, 70], [5, 20]], ['catQuern', [60, 120], [5.5, 10]]],
  store: [['jarLid', [30, 70], [6.5, 17]], ['sack', [50, 110], [7, 17]]],
};
let SITES = null;
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The rooms with sounds: { use, rect, at: [x, z] (the middle), id, work, y (the floor) }: the landmark's main room and storeroom, and the fourteen opened houses. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const T = 0.45, ix0 = LX0 + T, iz0 = LZ0 + T, ix1 = LX1 - T, iz1 = LZ1 - T, mx1 = ix0 + 4.9, sx0 = mx1 + 0.4;
  for (const [id, use, rect] of [['room:landmark', 'home', [ix0 + 0.3, iz0 + 0.3, ix0 + 4.6, iz1 - 0.3]], ['room:store', 'store', [sx0 + 0.4, iz0 + 0.3, ix1 - 0.2, iz1 - 0.3]]]) SITES.push({ use, rect, at: mid(rect), id, work: WORK[use], y: 0.05 });
  for (const e of ENTER) {
    const rect = cellGeom([colX(e.j), rowZ(e.i), colX(e.j) + CW[e.j], rowZ(e.i) + CD[e.i]], e.mirror).room, use = e.variant === 3 ? 'knap' : e.variant === 4 ? 'bake' : 'home';
    SITES.push({ use, rect, at: mid(rect), id: `room:${e.i}_${e.j}`, work: WORK[use], y: 0.05 });
  }
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const lotAt = (x, z, y) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z) && y > s.y - 0.6 && y < CH);
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open (on the roof one is in the open). */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z, y);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a thick roof of mud on beams: soft), `hush` how much of the outdoors comes through (a hatch is the only opening), `work`. */
const R0 = { tone: [260, 0.22], roof: 0.4, hush: 0.8, work: [['clothRustle', 60]] };
export const ROOMS_SOUND = {
  home: { ...R0, tone: [300, 0.3], work: [['catQuern', 50]] },
  knap: { ...R0, tone: [320, 0.25], work: [['catKnap', 25]] },
  bake: { ...R0, tone: [280, 0.3], work: [['catCrackle', 14]] },
  store: { ...R0, tone: [220, 0.2], hush: 0.85, work: [['jarLid', 50]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER_SOUND = { tone: [230, 0.12], roof: 0.5, hush: 0.7, work: [['clothRustle', 40]] };
export { UPPER_SOUND as UPPER };

// ── the planting, the town ──────────────────────────────────────────────────
const poolDist = (x, z) => { let d = 1e9; for (const [cx, cz, a, b] of POOLS) d = Math.min(d, Math.max(0, Math.hypot((x - cx) / a, (z - cz) / b) - 1) * Math.min(a, b)); return d; };
/** 0…1: how much green round (x, z): the reed and willow of the pools, little on the trodden mound. */
export function greenNear(x, z) { return Math.max(0.12, 0.9 * (1 - sm(0, 40, poolDist(x, z)))); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.7);
/** A tree to put a bird in, near (x, z), or null: the willows and tamarisks behind the reed on the pools' banks. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && poolDist(px, pz) > 3 && poolDist(px, pz) < 16 && !inPool(px, pz, 2)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's talk reaches (x, z): the roofs of the town most, its ring some, little out on the plain. */
export function townNear(x, z) {
  if (inRect(CLUSTER, x, z)) return 1;
  return Math.max(0.05, 0.9 * (1 - sm(4, 70, Math.hypot(Math.max(CLUSTER[0] - x, 0, x - CLUSTER[2]), Math.max(CLUSTER[1] - z, 0, z - CLUSTER[3])))));
}
// what Çatalhöyük has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** Frogs round the pools in the warm months (the marsh frog, Pelophylax [inferred]). */
export const frogGround = (x, z) => (poolDist(x, z) < 9 && Math.hypot(x, z) < RADIUS - 8 ? 0.8 : 0);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
/** The courts' work by trade (0 baker, 1 potter, 2 knapper, 3 hide-worker, 4 mat-maker): [voice, r50, gap, hours]. */
const COURT = [
  [['catQuern', 10, [50, 110], [5.5, 10]], ['catCrackle', 9, [14, 34], [5.5, 9.5]], ['catCrackle', 9, [20, 50], [17, 20.5]]],
  [['clay', 8, [20, 50], [7, 17]], ['jarLid', 8, [40, 90], [7, 17]]],
  [['catKnap', 9, [25, 60], [7, 17]]],
  [['catScrape', 10, [20, 45], [7, 17]]],
  [['catPlait', 9, [20, 50], [7, 17]]],
];
const houses = [];
const courts = [];
for (let i = 0; i < KIND.length; i++) for (let j = 0; j < KIND[0].length; j++) {
  const x0 = colX(j), z0 = rowZ(i), at = [x0 + CW[j] / 2, z0 + CD[i] / 2];
  if (KIND[i][j] === 'h') houses.push(at);
  else if (KIND[i][j] === 'c') courts.push({ at, trade: TRADE[i][j] });
}
export const EMITTERS = [
  // the courts: each trade at its work (the rooms' roofs are the walkers' street, so these are heard from above)
  ...courts.flatMap((c) => COURT[c.trade].map(([v, r, gap, hours]) => E(v, [c.at[0] - 1.0, c.at[1] + 0.6], r, gap, hours, { dry: true }))),
  // the murmur and the calls over the roofs of the town: some twelve spots among the houses, in the hours of light
  ...houses.filter((_, k) => k % 5 === 2).map(([x, z]) => E('catMurmur', [x, z], 16, [24, 60], [6, 20.5], { rainMax: 0.5 })),
  ...houses.filter((_, k) => k % 11 === 4).map(([x, z]) => E('catCall', [x, z], 24, [60, 150], [6.5, 19.5], { rainMax: 0.4 })),
  // a dog far off at night, from the pens (the herd's dogs)
  ...PENS.map((p) => E('dogFar', mid(p.rect), 40, [60, 150], [20, 5.5], { rainMax: 0.5 })),
  // the pens: sheep and goats bleat, the cattle low
  ...PENS.map((p, k) => E(k ? 'catLow' : 'catBleat', mid(p.rect), 18, [14, 40], [5.5, 20], { rainMax: 0.7 })),
  ...PENS.map((p, k) => E(k ? 'catBleat' : 'catLow', [p.rect[0] + 3, p.rect[1] + 3], 16, [22, 60], [5.5, 20], { rainMax: 0.7 })),
  // the marsh: the wind in the reed beds, cranes in the morning and evening, in reaches round the pools
  ...POOLS.map(([cx, cz, a]) => E('catReeds', [cx, cz], a * 1.2 + 14, [8, 16], [0, 24], { rainMax: 1 })),
  ...[POOLS[0], POOLS[1], POOLS[4]].map(([cx, cz, a], k) => E('catCrane', [cx + a * 0.3, cz], 80, [90, 220], k ? [17, 20.5] : [5, 8], { rainMax: 0.5 })),
  // the evening: a hand drum on a roof of the town, a voice or two with it, a bone flute from another roof [dossier §9]
  E('catDrum', [LX0 - 14, LZ0 - 6], 40, [110, 260], [17, 22], { rainMax: 0.3, after: true }),
  E('catMurmur', [LX0 - 14, LZ0 - 6], 28, [90, 200], [17, 22], { rainMax: 0.3 }),
  E('catFlute', [LX1 + 12, LZ0 - 10], 42, [120, 300], [18, 22.5], { rainMax: 0.3, after: true }),
  // the night: owls from the willows, jackals on the plain
  E('owl', [POOLS[2][0], POOLS[2][1] + 10], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [POOLS[1][0] - 10, POOLS[1][1]], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
  E('catJackal', [-82, -30], 120, [90, 260], [21, 5], { rainMax: 0.3 }), E('catJackal', [80, 20], 120, [120, 300], [21.5, 4.5], { rainMax: 0.3 }),
];
