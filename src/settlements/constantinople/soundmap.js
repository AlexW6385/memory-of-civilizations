// Where Constantinople's sounds are (docs/settlements/constantinople.md §16.3): the places of its emitters and the geometry the audio engine needs to
// put each sound where it is made: the pilgrims' market on the forecourt with its cistern head, the beggars' litany at the south door, the psalmody
// from the church, the Hippodrome's acclamation, water organ and chariots, a mule train on the Mese, the fountains and wells, the shops' trades, the
// houses' work (the baker's oven, the smith's bellows), the rooms one can be inside. Pure data and functions of layout.js, stoas.js, shops.js and
// outerlife.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-constantinople.js). Coordinates: metres, +x east, +z south, the settlement's own frame.
//
// What the scheduler of voices.js asks of a map but Constantinople has not is answered with nothing: no canals (the sea is not shown), no pond, no
// bridge, no street track of the Chinese towns (the sedan chairs, vendors and watchman of Suzhou are not here; the passing sounds are `TRACKS`).

import { RADIUS, FORECOURT, GARDEN_COURT, HIPPODROME, MESE, CHALKE, EIRENE, PALACE, special, gardens, inRect } from './layout.js';
import { shopRooms } from './shops.js';
import { outerLife, laneFountains } from './outerlife.js';

/** Where the audio puts the listener when the engine gives none (the arrival). */
export const HOME = [-10, 86];
/** The south door of Hagia Sophia, and the well (cistern head) on the forecourt. */
export const DOOR = [-10, 36];
export const WELL = [-20, 66];

/** A deterministic 0…1 from numbers (no Math.random in the choice of places). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** The work heard from each trade's shop: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the trade] */
const TRADE_WORK = {
  grocer: [['sack', [30, 70], [6, 18]], ['jarLid', [40, 90], [6, 18]]],
  cloth: [['clothRustle', [18, 40], [7, 18]]],
  potter: [['clay', [14, 30], [6.5, 17]], ['wheel', [40, 80], [6.5, 17]]],
  silver: [['cnChasing', [16, 40], [7, 17.5]]],
  cook: [['kitchen', [12, 28], [5.5, 21]], ['pourWine', [40, 90], [9, 21]]],
  painter: [['brush', [20, 45], [7, 17]]],
};
/** The work of each kind of house (layout.js SPECIAL kinds). */
const HOUSE_WORK = {
  home: [['kitchen', [14, 30], [5.5, 20]], ['loom', [30, 70], [6.5, 18.5]], ['cnSupper', [60, 140], [18, 21.5]]],
  tavern: [['kitchen', [10, 24], [5.5, 22]], ['cnSupper', [30, 70], [17, 23]], ['pourWine', [30, 70], [9, 22]]],
  bakery: [['cnBakeWork', [14, 34], [3.5, 12]], ['kitchen', [30, 70], [5, 18]]],
  weaver: [['loom', [10, 24], [6.5, 18.5]], ['clothRustle', [30, 70], [7, 18]]],
  potter: [['wheel', [14, 30], [6.5, 17]], ['clay', [10, 24], [6.5, 17]]],
  smith: [['hammer', [8, 20], [6.5, 17.5]], ['cnBellows', [18, 40], [6.5, 17.5]]],
  chapel: [['cnPsalm', [90, 200], [5, 7]], ['cnPsalm', [120, 260], [17, 19]]],
  bath: [['pour', [20, 50], [8, 18]], ['cnFountain', [14, 30], [7, 19]]],
};

let SITES = null;
/** The houses and shops with sounds: { use, rect, at: [x, z] (the middle), id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const [key, s] of Object.entries(special())) {
    const use = s.kind === 'chapel' || s.kind === 'bath' ? s.kind : s.kind;
    SITES.push({ use, rect: s.rect, at: mid(s.rect), id: 'house:' + key, work: HOUSE_WORK[s.kind] || HOUSE_WORK.home, y: s.y });
  }
  for (const r of shopRooms()) SITES.push({ use: 'shop:' + r.trade, rect: r.rect, at: r.at, id: r.id, work: TRADE_WORK[r.trade] || [], y: r.y });
  return SITES;
}

/** The wells of the lanes (outerlife.js: the ones built beyond the first 120 m); the cistern head on the forecourt has its own emitter. */
export const WELLS = outerLife().filter((e) => e.t === 'well').map((e) => [e.at[0], e.at[1]]);
/** Fountains: the two canopied basins of the squares, the atrium's phiale, the niche fountains of the outer lanes. */
export const FOUNTAINS = [[-14, 140], [24, 72], [-74, 0], ...laneFountains().map((f) => [f.at[0], f.at[1]])];

/** The stalls of the pilgrims' market before the church's south front (forecourt.js `stalls`), their cries by what they sell: [voice, [x, z]]. */
const STALLS = [[-36, 53.5], [-32.6, 54.3], [-29.2, 53.4], [9, 54], [12.4, 53.2], [15.8, 54.2], [19.2, 53.4], [22.6, 54], [26, 53.3]];
const CRY_OF = ['cnHawkBread', 'cnHawkFruit', 'cnHawkCandles', 'cnHawkCloth', 'cnHawkWater'];
const HAWKERS = STALLS.map((p, i) => [CRY_OF[i % CRY_OF.length], p]);

// ── the rooms ────────────────────────────────────────────────────────────────
const CHURCH = [-48, -33, 41, 33];
const EIRENE_IN = [EIRENE[0] + 24.5, EIRENE[1] + 11.5, EIRENE[2] - 7.5, EIRENE[1] + 43.5];
const ROOM_RECTS = [['church', 'church', CHURCH, 0], ['eirene', 'church', EIRENE_IN, 0.1]];
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: a shop's trade ('shop:silver' …), a house's kind
 * ('home', 'tavern', 'bakery', 'weaver', 'potter', 'smith'), 'chapel', 'bath', 'church' (Hagia Sophia and Hagia Eirene).
 */
export function roomAt(x, z, y = 0) {
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  return null;
}

/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is, `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  home: { ...R0, work: [['kitchen', 40]] },
  tavern: { tone: [330, 0.3], roof: 1.0, hush: 0.8, work: [['cnSupper', 40], ['kitchen', 36]] },
  bakery: { tone: [380, 0.35], roof: 1.0, hush: 0.9, work: [['cnBakeWork', 20]] },
  weaver: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['loom', 20]] },
  potter: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  smith: { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['hammer', 16], ['cnBellows', 28]] },
  chapel: { tone: [140, 0.3], roof: 0.6, hush: 0.45, work: [['cnPsalm', 120]] },
  bath: { tone: [520, 0.3], roof: 0.6, hush: 0.95, work: [['cnFountain', 20], ['pour', 40]] },
  church: { tone: [110, 0.3], roof: 0.5, hush: 0.35, work: [['cnPsalm', 90], ['clothRustle', 80]] },
  'shop:grocer': { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['jarLid', 40], ['sack', 60]] },
  'shop:cloth': { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 26]] },
  'shop:potter': { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 18]] },
  'shop:silver': { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['cnChasing', 22]] },
  'shop:cook': { tone: [340, 0.3], roof: 1.0, hush: 0.9, work: [['kitchen', 20]] },
  'shop:painter': { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['brush', 30]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.3, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const gardenDist = (x, z) => gardens().reduce((m, g) => Math.min(m, rectDist(g.rect, x, z)), Infinity);
/** Is there a tree at (x, z): the plane trees and cypresses of the garden court, the palace's gardens, the walled gardens, the rim. */
function treeAt(x, z) {
  if (inRect(GARDEN_COURT, x, z)) return true;
  if (inRect(PALACE, x, z) && hash(x, z) < 0.3) return true;
  if (gardenDist(x, z) < 0.5) return hash(x, z, 3) < 0.6;
  return Math.hypot(x, z) > RADIUS - 70 && Math.hypot(x, z) < RADIUS - 8;
}
/** 0…1: how much green round (x, z), for the cicadas and insects: the garden court, the palace's gardens, the walled gardens, the rim. */
export function greenNear(x, z) {
  const court = 1 - sm(0, 24, rectDist(GARDEN_COURT, x, z)), palace = 0.55 * (1 - sm(0, 30, rectDist(PALACE, x, z))), garden = 0.7 * (1 - sm(0, 18, gardenDist(x, z))), rim = sm(RADIUS - 130, RADIUS - 50, Math.hypot(x, z));
  return Math.max(court, palace, garden, rim * 0.8, 0.15);
}
/** 0…1: how much broad leaf round (plane trees, figs), for the rustle in a wind. */
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (treeAt(px, pz)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it on the forecourt, the Augustaion and the Mese, less in the palace and the gardens, little at the rim. */
export function townNear(x, z) {
  if (inRect(FORECOURT, x, z, 14)) return 1;
  const dMese = MESE.path.slice(1).reduce((m, b, i) => { const a = MESE.path[i], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.min(m, Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t)); }, Infinity);
  if (dMese < 18) return 1;
  if (inRect(PALACE, x, z)) return 0.4;
  return Math.max(0.15, 0.8 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 20, Math.hypot(x, z))));
}

// what Constantinople has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the passing: a chariot team on the Hippodrome's track, a mule train on the Mese ────────────────
const [HX0, , HX1, HZ1] = HIPPODROME, CX = (HX0 + 26 + HX1 - 26) / 2;
/** One lap of the Hippodrome's track, a team going down the east side, round the turning posts at the south and back up the west: the points. */
export const LAP = (() => {
  const pts = [[CX + 10, 100], [CX + 10, 292]];
  for (let k = 1; k < 8; k++) { const a = k / 8 * Math.PI; pts.push([CX + 10 * Math.cos(a), 292 + 10 * Math.sin(a) * 1.0]); }
  pts.push([CX - 10, 292], [CX - 10, 100]);
  return pts;
})();
const near = (pts, x, z, d) => pts.some(([px, pz]) => Math.hypot(px - x, pz - z) < d);
const muleRoute = (x, z, r) => { if (!near(MESE.path, x, z, 90) && !near([[-60, 110], [-120, 110], [-180, 75], [-240, 40], [-340, 40]], x, z, 90)) return null; const p = MESE.path.map(([a, b], i) => [a + (hash(a, b, i) - 0.5) * 3, b + (hash(b, a, i) - 0.5) * 3]); return { pts: r() < 0.5 ? p : p.slice().reverse() }; };
/** The engine's own passing sounds beside its canals, bridges and streets: [{ key, voice, speed, r50, gap, ok(hour, rain), get(x, z, r) }]. */
export const TRACKS = [
  { key: 'chariots', voice: 'cnChariots', speed: 13, r50: 40, gap: [60, 140], ok: (h, rain) => h >= 10 && h < 16.5 && rain < 0.4, get: (x, z) => (near(LAP, x, z, 190) ? { pts: LAP } : null) },
  { key: 'mules', voice: 'cnMules', speed: 1.3, r50: 14, gap: [50, 120], ok: (h, rain) => h >= 5.5 && h < 18.5 && rain < 0.6, get: muleRoute },
];

// ── the emitters in the open ─────────────────────────────────────────────────
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry` (not in
 * rain), `rainMax`, `lv`, `after` (spaced from the end of a long one). The houses' and shops' own work comes from sites().
 */
export const EMITTERS = [
  // the pilgrims' market on the forecourt: the cries at the stalls
  ...HAWKERS.map(([voice, at], i) => ({ voice, at, r50: 15, gap: [28 + i * 3, 72 + i * 5], hours: [6.5, 17.5], rainMax: 0.5 })),
  // the litany of the poor along the church's south wall; the psalmody of the offices through its open door (dawn, the liturgy, vespers)
  { voice: 'cnKyrie', at: [DOOR[0], DOOR[1] + 1.5], r50: 14, gap: [40, 110], hours: [6, 19], rainMax: 0.6, after: true },
  { voice: 'cnPsalm', at: [DOOR[0], DOOR[1] - 2], r50: 24, gap: [70, 160], hours: [4.5, 6.5], after: true },
  { voice: 'cnPsalm', at: [DOOR[0], DOOR[1] - 2], r50: 24, gap: [90, 200], hours: [8, 11], after: true },
  { voice: 'cnPsalm', at: [DOOR[0], DOOR[1] - 2], r50: 24, gap: [80, 180], hours: [17, 19], after: true },
  // the night office of Hagia Eirene
  { voice: 'cnPsalm', at: mid(EIRENE_IN), r50: 22, gap: [120, 240], hours: [2.5, 4.2], after: true },
  // the cistern head on the forecourt: jars filled by the windlass
  { voice: 'cnWindlass', at: WELL, r50: 13, gap: [30, 80], hours: [5.5, 19], dry: true },
  // doves on the cornices of the church and the Augustaion
  { voice: 'cnDove', at: [-20, 40], r50: 14, gap: [20, 52], hours: [5.5, 18.5], dry: true },
  { voice: 'cnDove', at: [-20, 150], r50: 14, gap: [24, 60], hours: [6, 18], dry: true },
  // the fountains: a steady fall of water, heard close
  ...FOUNTAINS.map((at, i) => ({ voice: 'cnFountain', at, r50: 9, gap: [12 + (i % 3) * 3, 26], hours: [5, 20], dry: true })),
  // the Hippodrome on a day of races: the acclamation of the factions from the stands, the water organ at the kathisma
  { voice: 'cnAcclaim', at: [CX, 200], r50: 70, gap: [80, 190], hours: [10, 16], rainMax: 0.5 },
  { voice: 'cnOrgan', at: [HX1 - 28, 186], r50: 32, gap: [100, 220], hours: [10, 16], rainMax: 0.4, after: true },
  // the emperor's procession from the Chalke: the crowd's acclamation on the Augustaion at the hour of the liturgy
  { voice: 'cnAcclaim', at: [CHALKE.c[0] - 10, CHALKE.c[1] - 12], r50: 38, gap: [150, 320], hours: [9, 10.5], rainMax: 0.5 },
];
