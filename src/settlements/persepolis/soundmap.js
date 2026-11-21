// Where Persepolis' sounds are (docs/settlements/persepolis.md §23.3): the places of its emitters and the geometry the audio engine needs to put each sound where
// it is made — the harp and the double pipe in the court before the Apadana, the frame drum at the Gate of All Nations, the masons' chisels at the works yard and
// the hammers, planes and wheels of the royal workshops, the trades of the walked-into houses, the wells, the street channels, the camel train and its drivers on the
// road, the rooms one can be inside (the palaces' halls, the Gate, the Treasury). Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-persepolis.js). Coordinates: metres, +x east, +z south.
import '../../engine/voices-persepolis.js';
import { RADIUS, TERRACE, MARKET, WORKSHOPS, ROAD, lots, gardens, wells, inRect } from './layout.js';
import { terraceLots } from './terrace-houses.js';

/** Where the audio puts the listener when the engine gives none (the arrival at the royal way's head). */
export const HOME = [-122, -60];
const T = TERRACE.h;

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of walked-into house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade (§15, §16); the engine's own voices where they fit]. */
const WORK = {
  home: [['kitchen', [14, 30], [5.5, 20]], ['perQuern', [60, 120], [5.5, 10]]],
  court: [['kitchen', [16, 34], [5.5, 20]], ['perQuern', [50, 110], [5.5, 10]]],
  baker: [['kitchen', [10, 24], [4, 11]], ['perQuern', [40, 90], [4, 8]]],
  potter: [['wheel', [24, 50], [6.5, 17]], ['clay', [12, 28], [6.5, 17]]],
  cloth: [['clothRustle', [24, 60], [7, 17.5]], ['loom', [30, 70], [7, 17]]],
  grain: [['jarLid', [30, 70], [6.5, 17.5]], ['pour', [40, 90], [7, 17]]],
  fruit: [['clothRustle', [30, 70], [7, 17.5]]],
  butcher: [['chisel', [30, 70], [6, 16]]],
  carpenter: [['plane', [12, 30], [6.5, 17.5]], ['chisel', [20, 50], [6.5, 17.5]]],
  wine: [['pourWine', [24, 60], [8, 18]], ['jarLid', [50, 110], [7, 17]]],
  smith: [['hammer', [12, 30], [6.5, 17.5]]],
  dyer: [['pour', [30, 60], [7, 17]]],
  shop: [['jarLid', [30, 70], [7, 17.5]]],
};
let SITES = null;
const useOf = (l) => (l.kind === 'shop' && l.trade) || l.kind;
/** The walked-into houses with sounds: { use, rect, at: [x, z] (the middle), id, work, y }; the terrace's lodgings stand at the terrace's height. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of terraceLots()) { const u = useOf(l); if (WORK[u]) SITES.push({ use: u, rect: l.rect, at: mid(l.rect), id: 'terrace:' + l.seed, work: WORK[u], y: T }); }
  for (const l of lots()) if (l.enter) { const u = useOf(l); if (WORK[u]) SITES.push({ use: u, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[u], y: 0 }); }
  return SITES;
}

/** The wells (qanat shafts with a windlass, layout.js `wells`). */
export const WELLS = wells().map((w) => w.at);
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['room:gate', 'gate', [-124.5, -152.5, -99.5, -127.5], T],
  ['room:apadana', 'hall', [-60, -90, 0, -30], T],
  ['room:hundred', 'hall', [40, -130, 110, -60], T],
  ['room:tachara', 'royal', [-62, 12, -46, 28], T],
  ['room:hadish', 'royal', [-30, 75, 10, 115], T],
  ['room:treasury', 'treasury', [53, 63, 127, 110], T],
  ['room:workshops', 'workshop', [WORKSHOPS[0] + 2.2, WORKSHOPS[3] - 23.1, WORKSHOPS[2] - 2.2, WORKSHOPS[3] - 1.1], 0],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. `y` tells the terrace from the plain below it. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s && (y > s.y - 1 || s.y === 0)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  for (const [id, use, r, ry] of ROOM_RECTS) if (inRect(r, x, z) && Math.abs(y - ry) < 6) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a flat earth roof), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  court: { ...R0, tone: [340, 0.3], hush: 0.7, work: [['kitchen', 30]] },
  baker: { ...R0, tone: [360, 0.35], work: [['kitchen', 20]] },
  potter: { ...R0, tone: [340, 0.3], hush: 0.9, work: [['clay', 14]] },
  cloth: { ...R0, work: [['loom', 30]] },
  grain: { ...R0, tone: [260, 0.2], work: [['jarLid', 50]] },
  fruit: { ...R0, work: [['clothRustle', 60]] },
  butcher: { ...R0, work: [['chisel', 50]] },
  carpenter: { ...R0, tone: [380, 0.35], hush: 0.95, work: [['plane', 18]] },
  wine: { ...R0, tone: [250, 0.2], work: [['pourWine', 40]] },
  smith: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 30]] },
  dyer: { ...R0, work: [['pour', 40]] },
  shop: { ...R0, work: [['jarLid', 50]] },
  gate: { tone: [200, 0.2], roof: 0.7, hush: 0.6, work: [['clothRustle', 90]] },
  hall: { tone: [170, 0.25], roof: 0.7, hush: 0.45, work: [['perHarp', 120]] },
  royal: { tone: [190, 0.25], roof: 0.8, hush: 0.5, work: [['perHarp', 100]] },
  treasury: { tone: [180, 0.2], roof: 0.8, hush: 0.55, work: [['jarLid', 70]] },
  workshop: { tone: [420, 0.4], roof: 0.9, hush: 0.9, work: [['hammer', 24], ['plane', 40]] },
};
export const UPPER = { tone: [220, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the gardens and orchards of Parsa, the poplars and wheat of the rim; the mountain bare. */
export function greenNear(x, z) {
  let g = 0.18;
  for (const q of gardens()) { const d = Math.hypot(x - (q.rect[0] + q.rect[2]) / 2, z - (q.rect[1] + q.rect[3]) / 2); g = Math.max(g, 0.7 * (1 - sm(0, 50, d))); }
  const rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z)) * (x < 100 ? 0.8 : 0);
  return Math.max(g, rim) * (1 - sm(120, 260, x));
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the poplars and fruit trees of the gardens and the rim, never on the terrace. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (px < TERRACE.rect[0] - 10 && Math.hypot(px, pz) < RADIUS - 8 && (hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.16 || Math.hypot(px, pz) > RADIUS - 110)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the market and the road, less in the lanes, little on the terrace and at the rim. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 14)) return 1;
  if (x > TERRACE.rect[0] - 5) return 0.25;
  const d = Math.hypot(x - mid(MARKET)[0], z - mid(MARKET)[1]);
  return Math.max(0.12, 0.9 * (1 - 0.8 * sm(30, 260, d)));
}
// what Persepolis has none of (the engine's scheduler asks, and is answered with nothing)
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
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const rz = (ROAD[1] + ROAD[3]) / 2, wk = mid(WORKSHOPS);
export const EMITTERS = [
  // the court before the Apadana: the harp and the double pipe of the court's day, the drum at the Gate of All Nations
  E('perHarp', [-100, -46], 28, [60, 140], [9, 17], { rainMax: 0.3, after: true }),
  E('perPipe', [-108, -96], 26, [80, 180], [9, 17], { rainMax: 0.3, after: true }),
  E('perDrum', [-112, -128], 30, [70, 170], [8, 16], { rainMax: 0.4, after: true }),
  // the masons at the works yard on the terrace
  E('chisel', [-114, 33], 20, [10, 26], [6.5, 17.5], { dry: true }), E('hammer', [-110, 36], 18, [24, 60], [6.5, 17.5], { dry: true }),
  // the royal workshops by the road: smiths, carpenters, the potter's wheel in the forecourt
  E('hammer', [wk[0] + 8, WORKSHOPS[3] - 8], 22, [10, 26], [6.5, 17.5], { dry: true }), E('plane', [wk[0] - 8, WORKSHOPS[3] - 8], 18, [16, 40], [6.5, 17.5], { dry: true }),
  E('chisel', [wk[0], wk[1] - 14], 20, [12, 30], [6.5, 17.5], { dry: true }),
  // the camel train and its drivers on the road to the stair, the donkeys' men the other way
  E('perCamelBell', [-300, rz], 34, [30, 80], [6, 18], { rainMax: 0.5 }), E('perDriver', [-270, rz + 2], 30, [60, 150], [6, 18], { rainMax: 0.5 }),
  // the market's own noise is the engine's (profile `market`); here the water at its well and the crowd's carts
  E('wellBucket', mid(MARKET), 14, [20, 50], [5.5, 18], { dry: true }),
  // the water of the street channels: reaches along the road and the cross streets
  ...[-380, -330, -280, -230, -190].map((x) => E('perRill', [x, rz - 5.6], 9, [6, 11], [0, 24], { rainMax: 1 })),
  ...[-352, -306, -250, -190].map((x) => E('perRill', [x, 100], 9, [6, 11], [0, 24], { rainMax: 1 })),
  // a village dog far off at night, by the poor edge of the town
  E('dogFar', [-330, 220], 70, [40, 120], [20.5, 4.5], { rainMax: 0.4 }), E('dogFar', [-250, -250], 70, [60, 150], [21, 4], { rainMax: 0.4 }),
];
