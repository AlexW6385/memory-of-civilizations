// Where Knossos' sounds are (docs/settlements/knossos.md §20.3): the places of its emitters and the geometry the audio engine needs to put each sound where
// it is made — the lyre and the double pipe in the Central Court, the rite at the Tripartite Shrine, the lapidary's bow drill and the weaver's loom in the East
// Wing, the kitchen's quern, the oil store, the potter, the open houses' trades, the wells, the Kairatos, the porters on the Royal Road, the rooms one can be
// inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-knossos.js). Coordinates: metres, +x east, +z south, the settlement's frame.
//
// What the scheduler asks of a map but Knossos has not (no canals, ponds, bridges or street walkers of Suzhou) is answered with nothing.
import '../../engine/voices-knossos.js';
import { RADIUS, COURT, PALACE, STREAM, ROAD, WESTCOURT, openHouses, inRect, onStream } from './layout.js';
import { YARD } from './life.js';

/** Where the audio puts the listener when the engine gives none (the arrival in the Central Court). */
export const HOME = [0, 22];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of open house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const WORK = {
  home: [['kitchen', [14, 30], [5.5, 20]], ['knQuern', [60, 120], [5.5, 10]]],
  weaver: [['knLoomWeights', [12, 28], [6.5, 18]]],
  shop: [['jarLid', [24, 60], [7, 17.5]], ['clothRustle', [30, 70], [7, 17.5]]],
  store: [['jarLid', [30, 70], [6.5, 17.5]], ['pour', [50, 110], [7, 17]]],
  potter: [['wheel', [24, 50], [6.5, 17]], ['clay', [12, 28], [6.5, 17]]],
  dyer: [['pour', [30, 60], [7, 17]]],
  smith: [['hammer', [12, 30], [6.5, 17.5]]],
  press: [['pour', [24, 50], [7, 17]], ['jarLid', [60, 120], [7, 17]]],
  sealcutter: [['knBowDrill', [14, 32], [7, 17]]],
};
let SITES = null;
/** The open houses with sounds: { use, rect, at: [x, z] (the middle), id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const [l, kind] of openHouses()) if (WORK[kind]) SITES.push({ use: kind, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[kind], y: 0 });
  // the rooms of the palace that make sounds: the lapidary's workshop, the weaver in the residential hall, the kitchen, the oil store, the archive (quiet)
  for (const [id, use, r, work] of PALACE_SITES) SITES.push({ use, rect: r, at: mid(r), id, work, y: 0 });
  return SITES;
}
const PALACE_SITES = [
  ['room:lapidary', 'lapidary', [23, 27, 41, 37], [['knBowDrill', [10, 24], [7, 17]], ['chisel', [40, 90], [7, 17]]]],
  ['room:hall', 'palacehall', [23, 14, 41, 24], [['knLoomWeights', [14, 30], [6.5, 18]]]],
  ['room:kitchen', 'palacekitchen', [6, 30, 16.4, 39], [['knQuern', [20, 50], [5, 18]], ['kitchen', [10, 24], [4.5, 20]]]],
  ['room:oilstore', 'palacestore', [-17, -52, -6.4, -41], [['pour', [40, 90], [7, 17]], ['jarLid', [30, 70], [7, 17]]]],
];

/** The wells: the one at the first lane's west end and the one in the West Court (life.js). */
export const WELLS = [[-70.5, 64.2], [-114, 33.6]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['room:throne', 'throne', [-25.8, -19.6, -19.8, -12.6]],
  ['room:corridor', 'corridor', [-41, -48, -37.5, 22]],
  ['room:queen', 'megaron', [23, 6, 31, 13]],
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
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a flat clay roof), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [280, 0.2], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  weaver: { ...R0, work: [['knLoomWeights', 14]] },
  shop: { ...R0, work: [['jarLid', 40]] },
  store: { ...R0, tone: [240, 0.2], work: [['jarLid', 50]] },
  potter: { ...R0, tone: [320, 0.3], hush: 0.9, work: [['clay', 14]] },
  dyer: { ...R0, work: [['pour', 40]] },
  smith: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 30]] },
  press: { ...R0, tone: [260, 0.25], work: [['pour', 30]] },
  sealcutter: { ...R0, work: [['knBowDrill', 20]] },
  lapidary: { tone: [340, 0.3], roof: 0.9, hush: 0.9, work: [['knBowDrill', 14]] },
  palacehall: { tone: [220, 0.2], roof: 0.8, hush: 0.7, work: [['knLoomWeights', 22]] },
  palacekitchen: { tone: [420, 0.4], roof: 0.9, hush: 0.9, work: [['knQuern', 30]] },
  palacestore: { tone: [200, 0.2], roof: 0.9, hush: 0.7, work: [['jarLid', 50]] },
  throne: { tone: [160, 0.25], roof: 0.7, hush: 0.5, work: [['clothRustle', 90]] },
  corridor: { tone: [180, 0.2], roof: 0.7, hush: 0.6, work: [['jarLid', 80]] },
  megaron: { tone: [200, 0.2], roof: 0.8, hush: 0.6, work: [['clothRustle', 70]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** 0…1: how much green round (x, z): the plane trees and oleander of the Kairatos, the olives of the rim; the town's lanes a little. */
export function greenNear(x, z) {
  const brook = 1 - sm(0, 40, Math.abs(x - STREAM.x)), rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z));
  return Math.max(brook * 0.9, rim * 0.85, 0.2);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the olives and planes by the stream, the olives of the rim. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (onStream(px, pz, 22) || Math.hypot(px, pz) > RADIUS - 130 || hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.12) && !inRect(PALACE, px, pz, 2)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the West Court's exchange and the lanes, less in the palace's courts, little at the rim. */
export function townNear(x, z) {
  if (inRect(WESTCOURT, x, z, 8)) return 1;
  if (inRect(COURT, x, z, 4)) return 0.35;
  if (inRect(PALACE, x, z)) return 0.3;
  return Math.max(0.12, 0.85 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
// what Knossos has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = (x, z) => (onStream(x, z, 10) ? 0.6 : 0);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const brook = (z) => [STREAM.x + 3 * Math.sin(z / 55), z];
export const EMITTERS = [
  // the rehearsal of the leaping in the Central Court: the lyre and the double pipe (life.js: the flute at [6.6, -6.4], the lyre at [7.3, -0.2])
  E('knLyre', [7.3, -0.2], 26, [50, 120], [8, 17], { rainMax: 0.3, after: true }),
  E('knAulos', [6.6, -6.4], 26, [70, 160], [8, 17], { rainMax: 0.3, after: true }),
  // the rite at the Tripartite Shrine: the pipe and the rattle, the priestess' offering, in the morning
  E('knAulos', [-16, 5], 22, [90, 200], [6.5, 11], { rainMax: 0.4, after: true }),
  E('knSistrum', [-16, 5], 22, [60, 140], [6.5, 11], { rainMax: 0.4, after: true }),
  // the procession assembling in the West Court: the lyre and the flute at its head, the rattle
  E('knLyre', [-81.8, -22], 24, [80, 180], [8, 15], { rainMax: 0.3, after: true }),
  E('knAulos', [-74.4, -21.4], 24, [90, 200], [8, 15], { rainMax: 0.3, after: true }),
  E('knSistrum', [-78, -24], 24, [90, 200], [8, 15], { rainMax: 0.3, after: true }),
  // the potter's yard by the Royal Road
  E('wheel', mid(YARD), 14, [24, 50], [6.5, 17], { dry: true }), E('clay', mid(YARD), 12, [12, 28], [6.5, 17], { dry: true }),
  // the porters and drovers on the Royal Road
  E('knDrover', [-150, ROAD.z], 30, [60, 150], [6, 17.5], { rainMax: 0.5 }),
  // the Kairatos, in reaches along the stream
  ...[-120, -40, 40, 120].map((z) => E('knBrook', brook(z), 20, [6, 11], [0, 24], { rainMax: 1 })),
  // the women washing at the bank
  E('clothRustle', brook(-56), 10, [10, 26], [7, 16], { dry: true }), E('wellBucket', brook(22), 10, [40, 90], [6, 17], { dry: true }),
  // the stores of jars in the West Magazines, heard from the Long Corridor
  E('jarLid', [-48, -10], 12, [40, 100], [7, 17]),
  // the little owl on the hill at night
  E('owl', [-30, 90], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [150, -60], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void rectDist; void COURT;
