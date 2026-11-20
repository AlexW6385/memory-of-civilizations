// Where Nara's sounds are (docs/settlements/nara.md §19.3): the places of its emitters and the geometry the audio engine needs to put
// each sound where it is made (src/engine/voices.js `placed()`, voices-nara.js): the bell tower, the Great Buddha Hall and the dance
// stage, the service quarter's houses at their uses, the craftsmen's houses, the wells, the streets, the planting, the rooms one can be
// inside. Pure data and functions of layout.js and walk.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`).
// Coordinates: metres, +x east, +z south, the settlement's frame.
//
// The engine's scheduler was written for Suzhou and calls three things this city does not have, each by its own arguments:
// `streetTrack(…, 90, 40)` (a sedan chair), `streetTrack(…, 90, 34)` (the night watchman), `streetTrack(…, 80, 30)` (the
// Chinese pedlars' cries) and `treeSpot(…, 40)` (the Chinese seasonal birds). Here those return null; the city's own pedlars and
// birds are made by voices-nara.js / voices-kyoto.js through `pedlarTrack` and `treeSpot(…, 41)`, which do answer.

import '../../engine/voices-nara.js';
import { HALL, TEMPLE, KOFUKU, RADIUS, lots, streets, yards, inRect, inBlock, height } from './layout.js';
import { openedLots } from './walk.js';
import { craftOf } from '../../styles/nara/crafts.js';

/** Where the audio puts the listener when the engine gives none (the arrival, in the Great Buddha Hall's court). */
export const HOME = [0, 20];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

export const BELL = [108, -92];                        // the bell tower (plan.js nara_belltower)
export const STAGE = [0, -24.5];                       // the dance stage (index.js)
export const SOUTH_GATE = [0, 146];
const HALL_ROOM = [HALL[0] + 3, HALL[1] + 3, HALL[2] - 3, HALL[3] - 3];

// ── the houses at their uses and trades ─────────────────────────────────────────
/** What each use or trade makes heard: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the use; the engine's own voices where they fit]. */
const WORK = {
  scriptorium: [['naraScribe', [16, 36], [6.5, 17.5]]],
  kitchen: [['kitchen', [10, 22], [4.5, 20]]],
  carpenter: [['naraAdze', [16, 36], [7, 17.5]]],
  inn: [['bowlClack', [30, 70], [6, 21]]],
  oil: [['jarLid', [40, 90], [8, 17]]],
  incense: [['paper', [40, 90], [8, 17]]],
  lodge: [['knock', [60, 120], [6, 22]]],
  smith: [['hammer', [12, 30], [7, 17.5]]],
  weaver: [['loom', [10, 24], [6.5, 18]]],
  potter: [['wheel', [30, 60], [8, 17]]],
  straw: [['strawBeat', [18, 40], [7, 17.5]]],
};
const useOf = (l) => l.use || craftOf({ ...l, shop: false });
let SITES = null;
/** The open houses whose use or trade makes a sound: { use, rect, at, id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of openedLots().keys()) { const u = useOf(l); if (WORK[u]) SITES.push({ use: u, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[u] }); }
  return SITES;
}
/** The wells (town.js: one in each yard of the blocks, two at the service lane's crossing). */
export function wells() { return [...yards().map(([x, z]) => [x, z]), [-9, 105.3], [9, 105.3]]; }
export const WELLS = wells();

// ── geometry of the water (none: the capital's canals are not built) and the streets ──
/** No water in the disc: a spot at a distance no one hears. */
export function canalSpot() { return { p: [9999, 9999], d: 9999, i: 0 }; }
export function canalTrack() { return null; }
export function bridgeTrack() { return null; }
export function pondSpot() { return null; }
export function shoreSpot() { return null; }

/** A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function pedlarTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  const S = streets();
  S.forEach((r, i) => { if (Math.min(r[2] - r[0], r[3] - r[1]) < 5) return; const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = S[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
/** The engine's street walkers (sedan chair, watchman, Chinese pedlar) do not exist here. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  if (lead === 40 || lead === 34 || (reach === 80 && lead === 30)) return null;
  return pedlarTrack(x, z, rnd, reach, lead);
}

// ── where the planting makes its sound ──────────────────────────────────────────
const HILL = [165, -380, 340, 200];                         // Wakakusa and the hills north-east: grass, cedars, pines
const WOODS = [-340, -340, 340, -240];                      // the wooded hills to the north
/** 0…1: how wooded is (x, z): the temple's groves, Kōfuku-ji's precinct, the hills, the gardens of the lots. */
export function treeness(x, z) {
  let m = 0.1;
  if (inRect(TEMPLE, x, z)) m = Math.max(m, 0.45);
  if (inRect(KOFUKU.block, x, z)) m = Math.max(m, 0.5);
  m = Math.max(m, 0.9 * (1 - sm(0, 40, rectDist(WOODS, x, z))), 0.7 * (1 - sm(0, 40, rectDist(HILL, x, z))));
  for (const y of yards()) if (Math.abs(y[0] - x) < 14 && Math.abs(y[1] - z) < 14) { m = Math.max(m, 0.3); break; }
  return m;
}
/** A tree to put a cicada or a bird in, near (x, z): null at once for the engine's own seasonal-bird call (reach 40). */
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach === 40) return null;
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && treeness(px, pz) > 0.25 + 0.6 * rnd()) return [px, pz];
  }
  return null;
}
export function bambooNear(x, z) { return Math.max(0.1, 0.25 * (1 - sm(0, 30, rectDist(HILL, x, z)))); }
export function leafNear(x, z) { return Math.min(1, Math.max(0.3 + 0.4 * treeness(x, z), 1 - sm(0, 40, rectDist(HILL, x, z)))); }
export function lotusNear() { return 0; }
export function greenNear(x, z) { return Math.max(treeness(x, z) * 0.9, sm(230, 290, Math.hypot(x, z)) * 0.85, 0.14); }
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the streets and blocks, some in the temple, less toward the rim. */
export function townNear(x, z) {
  if (inRect(TEMPLE, x, z)) return 0.25;
  if (inBlock(x, z, 4) || streets().some((r) => inRect(r, x, z))) return Math.max(0.4, 1 - 0.6 * sm(180, 260, Math.hypot(x, z)));
  return 0.1;
}
/** 0…1: wet ground (the frogs): the paddies at the rim, the hollows. */
export function frogGround(x, z) { return sm(230, 290, Math.hypot(x, z)) * 0.9; }

// ── the rooms ───────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const l of openedLots().keys()) for (let i = Math.floor(l.rect[0] / 20); i <= Math.floor(l.rect[2] / 20); i++) for (let j = Math.floor(l.rect[1] / 20); j <= Math.floor(l.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(l); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((l) => inRect(l.rect, x, z));
};
/** The room the listener is in: { use, at, upper, same } or null in the open. Uses: a use's or trade's, house (an open house of no sound-making use), hall (the Great Buddha Hall). */
export function roomAt(x, z, y = 0) {
  if (inRect(HALL, x, z) && y > 1) return { use: 'hall', at: mid(HALL_ROOM), upper: y > 14, same: 'room:hall' };
  const l = lotAt(x, z);
  if (l) return { use: ROOMS[useOf(l)] && WORK[useOf(l)] ? useOf(l) : 'house', at: mid(l.rect), upper: false, same: 'lot:' + l.seed };
  return null;
}
/** The room's own colour and small sounds (as Suzhou's ROOMS): `tone` [lowpass Hz, level], `roof` the rain's loudness from inside, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  scriptorium: { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 30]] },
  kitchen: { tone: [500, 0.5], roof: 1.0, hush: 0.9, work: [['bowlClack', 14]] },
  carpenter: { tone: [360, 0.3], roof: 1.0, hush: 0.9, work: [['knock', 40]] },
  inn: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 60]] },
  oil: { tone: [260, 0.25], roof: 1.0, hush: 0.7, work: [['jarLid', 40]] },
  incense: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 50]] },
  lodge: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['knock', 80]] },
  smith: { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['drawer', 120]] },
  weaver: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 30]] },
  potter: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  straw: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 34]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  hall: { tone: [130, 0.22], roof: 0.6, hush: 0.45, work: [['paper', 90]] },      // the Great Buddha Hall: vast, dark, bronze and timber
};
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40]] };

// ── the emitters (the engine's fixed ones; `at: [0, 0], r50: 1000` is a listener-relative one: the voice finds its own street or tree) ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const EVERY = [[0, 0], 1000];
const lodge = (u) => { const l = openedLots().keys(); for (const x of l) if (x.use === u) return mid(x.rect); return [30, 98]; };
export const EMITTERS = [
  // the great bell at dawn and dusk (the engine's own bell schedule is off here), the drum at the gate at dusk
  E('naraBonshoSeries', BELL, 120, [10, 12], [5.3, 5.55], { after: true }), E('naraBonshoSeries', BELL, 120, [10, 12], [17.95, 18.2], { after: true }),
  E('naraGateDrum', SOUTH_GATE, 60, [10, 12], [18.3, 18.5], { after: true }),
  // the sutra in the Great Buddha Hall at the morning and evening service
  E('keisuChant', mid(HALL_ROOM), 40, [10, 14], [5.65, 6.4], { inside: 'room:hall', after: true }), E('keisuChant', mid(HALL_ROOM), 40, [10, 14], [18.25, 19], { inside: 'room:hall', after: true }),
  // the rehearsal of the court music at the dance stage, in the mornings
  E('naraGagaku', STAGE, 40, [60, 120], [8, 15], { rainMax: 0.3, after: true }),
  // the unhurried places: the scriptorium, the kitchen, the carpenters' shed of the service quarter (their sounds are those of sites())
  E('naraAdze', [40, 112], 24, [20, 50], [7, 17.5], { dry: true }),
  // the East Market's hubbub is the engine's `market` (the profile), at the market's block
  E('naraPedlar', ...EVERY, [34, 80], [6, 17.5], { rainMax: 0.4 }),
  E('higurashi', ...EVERY, [5, 14], [4.6, 6.2], { rainMax: 0.3 }), E('higurashi', ...EVERY, [5, 14], [17.4, 19.4], { rainMax: 0.3 }),
  E('uguisu', ...EVERY, [14, 40], [5.5, 17], { rainMax: 0.3 }),
  E('hototogisu', ...EVERY, [20, 60], [19, 23.5], { rainMax: 0.3 }), E('hototogisu', ...EVERY, [20, 60], [3.5, 5.5], { rainMax: 0.3 }),
  E('suzumushi', ...EVERY, [3, 8], [18.5, 24], { rainMax: 0.2 }), E('suzumushi', ...EVERY, [3, 8], [0, 4.5], { rainMax: 0.2 }),
  E('owl', [300, -120], 80, [40, 110], [21, 4.5], { rainMax: 0.4 }),
  // the stags of the hills in the autumn rut
  E('naraStag', [250, -60], 90, [40, 100], [17, 23], { rainMax: 0.3 }), E('naraStag', [250, -60], 90, [40, 100], [3.5, 6.5], { rainMax: 0.3 }),
];
void lodge; void height;
