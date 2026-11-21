// Where Conques' sounds are (docs/settlements/conques.md §20.3): the places of its emitters and the geometry the audio engine needs to put each sound where
// it is made — the Office sung in the choir of the abbey church, the fountains (the Plò before the church's doors, the Fumouze, the Barry), the Dourdou in its
// gorge, the mill and the tanner's yard of the lower suburb, the washerwomen at the bridge, the smith's hammer and the baker's peel and the weaver's loom in the
// open shops, the inn's murmur, the hostel's donkeys, cocks, dogs, swallows and crows, the flock's bells on the slope, the pilgrims and the mules on the lanes, the
// rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js (the voices of src/engine/voices-conques.js). Coordinates: metres, +x east, +z south, the settlement's frame.
// What the scheduler asks of a map but Conques has not (no canals, ponds or bridges of Suzhou, no sedan chairs, no watchman: the abbey's Great Silence lay on
// the night after Compline) is answered with nothing.
import '../../engine/voices-conques.js';
import { RADIUS, ABBEY, RIVER, MILL, TANNERY, HOSTEL, FOUNTAINS, BRIDGE, streets, lots, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the abbey's terrace). */
export const HOME = [-47, 12];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const riverZ = (x) => RIVER.z + 14 * Math.sin(x / 90);

/** The church's floor (nave, transept, choir) in the settlement's frame: the abbey church's footprint without the cloister. */
export const CHURCH = [ABBEY.origin[0] + 3, -17.4, ABBEY.origin[0] + 52, 17.4];

/** The work heard from each trade of the open shops: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const TRADE = {
  shells: [['bowlClack', [30, 70], [7, 18]]],
  staffs: [['plane', [26, 60], [7, 17.5]]],
  bread: [['cqBread', [16, 36], [3.5, 11]], ['kitchen', [30, 60], [4, 12]]],
  cloth: [['clothRustle', [22, 50], [7, 17.5]]],
  pots: [['jarLid', [26, 60], [7, 17.5]]],
  tavern: [['cqTavern', [12, 26], [11, 23]], ['jarLid', [40, 90], [11, 23]]],
  smith: [['hammer', [9, 22], [6.5, 17.5]]],
  weaver: [['cqLoom', [12, 28], [6.5, 18]]],
};
const HOME_WORK = [
  [['kitchen', [14, 30], [5, 20]], ['cqHearth', [24, 50], [5, 22]]],
  [['kitchen', [18, 40], [5, 20]], ['cqLoom', [40, 80], [7, 17]]],                     // the spinner's: a little loom beside the wheel
  [['kitchen', [16, 36], [5, 20]], ['sack', [40, 90], [6, 17]]],
  [['kitchen', [18, 40], [5, 20]], ['jarLid', [40, 90], [8, 18]]],                       // the vintner's
  [['sack', [30, 70], [6, 18]], ['cqHearth', [30, 60], [5, 22]]],                        // the barn-house
  [['cqSheepBell', [60, 120], [7, 18]], ['cqHearth', [30, 60], [5, 22]]],               // the herder's
  [['kitchen', [18, 40], [5, 20]], ['pour', [50, 110], [5, 19]]],                        // the fisher's
];
let SITES = null;
/** The open houses with sounds: { use, rect, at: [x, z] (the middle), id: 'lot:<seed>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!l.open) continue;
    const use = l.open === 'hostel' ? 'hostel' : l.open === 'shop' ? (l.trade === 'smith' || l.trade === 'tavern' || l.trade === 'weaver' ? l.trade : l.trade === 'bread' ? 'baker' : 'shop') : 'home';
    const work = l.open === 'hostel' ? [['kitchen', [14, 30], [5, 21]], ['cqTavern', [30, 70], [17, 22]], ['cqHearth', [20, 40], [5, 22]]] : l.open === 'shop' ? TRADE[l.trade] || TRADE.pots : HOME_WORK[(l.homeKind ?? 0) % HOME_WORK.length];
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work, y: l.y });
  }
  return SITES;
}

/** The wells: the three fountains, where the women drew water with their jars (the Plò before the church's doors, the Fumouze, the Barry). */
export const WELLS = FOUNTAINS.map((f) => mid(f.rect));
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.8, same: s.id };
  if (inRect(CHURCH, x, z)) return { use: 'church', at: mid(CHURCH), upper: false, same: 'church' };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a roof of schist slabs on boards), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['cqHearth', 14]] };
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['cqHearth', 10], ['kitchen', 30]] },
  shop: { ...R0, work: [['jarLid', 40]] },
  hostel: { ...R0, tone: [260, 0.3], hush: 0.7, work: [['cqHearth', 9], ['cqTavern', 40]] },
  smith: { ...R0, tone: [440, 0.4], hush: 1.0, work: [['hammer', 24]] },
  baker: { ...R0, tone: [340, 0.35], work: [['cqBread', 24], ['cqHearth', 14]] },
  tavern: { ...R0, tone: [300, 0.3], hush: 0.7, work: [['cqTavern', 14]] },
  weaver: { ...R0, work: [['cqLoom', 16]] },
  church: { tone: [200, 0.25], roof: 0.5, hush: 0.45, work: [['cqHearth', 400]] },
};
export const UPPER = { tone: [230, 0.12], roof: 1.3, hush: 0.6, work: [['cqHearth', 16]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the willows and reeds of the Dourdou, the chestnut and oak of the slopes beyond the village, the gardens and orchards among the houses a little. */
export function greenNear(x, z) {
  const river = 1 - sm(0, 40, Math.abs(z - riverZ(x))), rim = sm(110, 190, Math.hypot(x, z));
  return Math.max(river * 0.9, rim * 0.85, 0.22);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
export const treeSpot = () => null;                           // the engine's seasonal birds are not Conques': the swallows, crows and sparrows are emitters
/** 0…1: how much of the town's hubbub reaches (x, z): the pilgrims' square before the church and the way up from the bridge, less on the lanes, little at the rim. */
export function townNear(x, z) {
  if (inRect([-60, -30, -20, 40], x, z, 4)) return 1;
  if (Math.abs(x - BRIDGE.x) < 12 && z > -30 && z < 200) return 0.8;
  return Math.max(0.1, 0.7 * (1 - 0.8 * sm(60, RADIUS - 100, Math.hypot(x, z))));
}
// what Conques has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;                         // Suzhou's sedan chair, vendor and watchman are not Conques': see TRACKS
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the lanes: a walker's track along the nearest lane or stair within reach ──
function lanePath(x, z, rnd, reach, lead) {
  const list = streets();
  let best = null;
  list.forEach((r, i) => { const qx = Math.max(r[0], Math.min(r[2], x)), qz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(qx - x, qz - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = list[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = (horiz ? r[2] : r[3]) - 2, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.4;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.6;
export const TRACKS = [
  { key: 'cqPilgrims', voice: 'cqPilgrims', speed: 1.1, r50: 12, gap: [26, 62], ok: day(6.5, 19), get: (x, z, rnd) => lanePath(x, z, rnd, 80, 34) },
  { key: 'cqMule', voice: 'cqMule', speed: 1.1, r50: 13, gap: [60, 140], ok: day(6.5, 18), get: (x, z, rnd) => lanePath(x, z, rnd, 90, 40) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const CHOIR = [ABBEY.origin[0] + 38, 0];
const [hx0, hz0, hx1, hz1] = HOSTEL.rect;
const [mx0, mz0, mx1, mz1] = MILL.rect;
export const OFFICES = [[2, 3.4], [5, 5.7], [6, 6.5], [9, 9.5], [12, 12.5], [15, 15.5], [17.5, 18.2], [19.5, 20.1]];       // matins, lauds, prime, terce, sext, none, vespers, compline: the hours of the dossier's `office` bell
export const EMITTERS = [
  // the Office sung in the choir (the bell's hours: matins in the small hours, lauds at first light, the little hours by day, vespers, compline)
  ...OFFICES.map(([a, b]) => E('cqChant', CHOIR, 17, [28, 60], [a + 0.12, b + 0.4], { rainMax: 1, after: true })),
  // the fountains' spouts
  ...FOUNTAINS.map((f) => E('cqSpout', mid(f.rect), 7, [3, 7], [0, 24], { rainMax: 1 })),
  // the Dourdou in its gorge, in reaches along the river
  ...[-150, -80, -20, 50, 120].map((x) => E('cqRiver', [x, riverZ(x) - 5], 30, [7, 12], [0, 24], { rainMax: 1 })),
  // the mill upstream of the washing-place, and the tanner's yard west of the road
  E('cqMillwheel', [(mx0 + mx1) / 2, mz1 + 1.5], 20, [10, 20], [5.5, 18], { rainMax: 1 }),
  E('cqHide', mid(TANNERY.rect), 12, [14, 34], [6.5, 17], { dry: true }),
  // the washerwomen at the bridge
  E('cqBeetle', [BRIDGE.x + 7, riverZ(BRIDGE.x) - 9], 11, [14, 34], [7, 16], { dry: true }),
  // the hostel's donkeys, the dogs of the lanes
  E('cqDonkey', [hx0 + 11.5, hz1 + 1.1], 26, [90, 200], [5.5, 19], { rainMax: 0.7 }),
  E('cqDog', [-30, 62], 24, [80, 190], [6, 21], { rainMax: 0.7 }), E('cqDog', [60, -40], 24, [100, 220], [6, 21], { rainMax: 0.7 }), E('cqDog', [-110, 120], 24, [90, 200], [6, 21], { rainMax: 0.7 }),
  // cocks at first light, over the roofs of three quarters of the village
  E('cqCock', [-70, 30], 30, [50, 120], [4.2, 9], { rainMax: 0.9 }), E('cqCock', [30, -10], 30, [60, 140], [4.2, 9], { rainMax: 0.9 }), E('cqCock', [90, 70], 30, [60, 140], [4.2, 9], { rainMax: 0.9 }),
  // the flock's bells on the slope above
  E('cqSheepBell', [-60, -150], 40, [24, 60], [7, 18], { rainMax: 0.5 }), E('cqSheepBell', [110, -120], 40, [30, 70], [7, 18], { rainMax: 0.5 }),
  // swallows over the roofs by day, crows about the church's ridge toward dusk, sparrows on the cobbles
  E('cqSwallow', [-20, 8], 30, [14, 34], [5.5, 19.5], { rainMax: 0.3 }), E('cqSwallow', [-70, 50], 28, [18, 40], [5.5, 19.5], { rainMax: 0.3 }),
  E('cqCrow', [ABBEY.origin[0] + 22, 0], 34, [30, 80], [16, 20.5], { rainMax: 0.5 }),
  E('cqSparrow', [-34, 14], 16, [12, 30], [5.5, 19], { rainMax: 0.4 }), E('cqSparrow', [-65, 12], 16, [14, 34], [5.5, 19], { rainMax: 0.4 }), E('cqSparrow', [20, 24], 16, [16, 36], [5.5, 19], { rainMax: 0.4 }),
  // the owls of the gorge at night
  E('owl', [-140, 150], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [120, 60], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void hz0; void mz0;
