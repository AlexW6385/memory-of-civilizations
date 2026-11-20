// Where Thebes' sounds are (docs/settlements/thebes.md §15c): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the temple's morning, noon and evening rites (the chant in the hall, the sistrum and the clapping at the gate), the workshop street's trades, the
// houses' work and the music of a villa's evening, the quay (stevedores, boats, the water at the stone), the shadufs of the streets and gardens, the geese on
// the sacred lake, the kites and doves of the roofs, the donkeys, the jackals of the desert's edge at night, the rooms one can be inside. Pure data and
// functions of layout.js and props.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices
// of src/engine/voices-thebes.js). Coordinates: metres, +x east, +z south, the settlement's own frame. [inferred throughout: see the dossier §15c.]
//
// What the scheduler of voices.js asks of a map but Thebes has not is answered with nothing: no bridges, no street tracks (the walkers' and the vendors' voices of
// Suzhou are not Thebes'), no pond, no bamboo, no lotus beds; the boats come by `TRACKS`.

import { RADIUS, RIVER, QUAY, LAKE, HALL, SANCT, FESTIVAL, ENCL, MARKET, PYLON2, lots, inRect } from './layout.js';
import { propPlans } from './props.js';

/** Where the audio puts the listener when the engine gives none (the arrival, the avenue's quay end). */
export const HOME = [-236, 0];

/** A deterministic 0…1 from numbers (the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The work heard from each trade's workshop or shop: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the trade] */
const TRADE_WORK = {
  smith: [['hammer', [14, 34], [6.5, 17]]],
  potter: [['wheel', [30, 60], [6.5, 17]]],
  carpenter: [['thbAdze', [14, 34], [6.5, 17.5]]],
  mason: [['chisel', [14, 30], [6.5, 17]]],
  baker: [['thbQuern', [26, 60], [4.5, 10]], ['kitchen', [20, 45], [4.5, 18]]],
  weaver: [['thbWeave', [24, 50], [6.5, 17.5]]],
  leather: [['thbScrape', [20, 50], [6.5, 17.5]]],
  // the shops of the first streets (layout.js SHOPS)
  'shop:bread': [['kitchen', [24, 50], [4.5, 12]]],
  'shop:pots': [['jarLid', [30, 70], [6.5, 17.5]]],
  'shop:beer': [['pourWine', [30, 70], [9, 20]]],
  'shop:fruit': [['sack', [30, 70], [6.5, 17]]],
  'shop:cloth': [['clothRustle', [24, 60], [7, 17.5]]],
  'shop:leather': [['thbScrape', [24, 60], [7, 17]]],
};
/** The household's own sounds, by the kind of house: the grain ground at home in the morning, the kitchen; a villa's evening music. */
const HOUSE_WORK = {
  row: [['kitchen', [14, 30], [5, 20]], ['thbQuern', [40, 90], [4.5, 9]]],
  court: [['kitchen', [14, 30], [5, 20]], ['thbQuern', [40, 90], [4.5, 9]], ['thbWeave', [40, 90], [6.5, 17]]],
  villa: [['kitchen', [16, 34], [5, 21]], ['thbHarp', [90, 200], [18, 22.5]], ['thbPipes', [120, 260], [17.5, 21.5]]],
};

let SITES = null;
/** The houses and shops with sounds: { use, rect, at: [x, z] (the middle), id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots().filter((q) => q.open)) {
    const use = l.trade ? 'workshop:' + l.trade : l.shop ? 'shop:' + l.shop : l.kind, work = l.trade ? TRADE_WORK[l.trade] || [] : l.shop ? [...TRADE_WORK['shop:' + l.shop], ...HOUSE_WORK.row.slice(0, 1)] : HOUSE_WORK[l.kind] || [];
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'house:' + l.seed, work, y: 0 });
  }
  return SITES;
}

/** The shadufs of the town (props.js: the 'well' items), nearest the arrival first: the water is raised by the pole's bucket, the creak carries. */
let WELLS_ = null;
export function shadufs() {
  if (WELLS_) return WELLS_;
  const out = [];
  for (const p of propPlans()) for (const it of p.items) if (it.k === 'well') out.push(it.at);
  return (WELLS_ = out.sort((a, b) => Math.hypot(a[0] - HOME[0], a[1] - HOME[1]) - Math.hypot(b[0] - HOME[0], b[1] - HOME[1])).slice(0, 12));
}
/** (Suzhou's wells have a windlass and a bucket: Thebes' wells are shadufs, and have an emitter each in EMITTERS.) */
export const WELLS = [];

export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const SANCTUM = SANCT, FEST = FESTIVAL;
const ROOM_RECTS = [
  ['hall', 'hall', [HALL.x0, HALL.z0, HALL.x1, HALL.z1], 0],
  ['sanctuary', 'sanctuary', SANCTUM, 0],
  ['festival', 'hall', FEST, 0],
];
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.9, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is (almost none at Thebes), `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [320, 0.25], roof: 0.5, hush: 0.75, work: [['kitchen', 40]] };
export const ROOMS = {
  row: { ...R0, work: [['kitchen', 36], ['clothRustle', 80]] },
  court: { ...R0, hush: 0.8, work: [['kitchen', 34], ['clothRustle', 70]] },
  villa: { tone: [380, 0.3], roof: 0.5, hush: 0.7, work: [['kitchen', 30], ['jarLid', 90]] },
  'workshop:smith': { tone: [420, 0.35], roof: 0.5, hush: 0.95, work: [['hammer', 30]] },
  'workshop:potter': { tone: [340, 0.3], roof: 0.5, hush: 0.9, work: [['wheel', 40]] },
  'workshop:carpenter': { tone: [340, 0.3], roof: 0.5, hush: 0.9, work: [['thbAdze', 30]] },
  'workshop:mason': { tone: [380, 0.3], roof: 0.5, hush: 0.9, work: [['chisel', 28]] },
  'workshop:baker': { tone: [320, 0.3], roof: 0.5, hush: 0.9, work: [['thbQuern', 50]] },
  'workshop:weaver': { tone: [300, 0.25], roof: 0.5, hush: 0.85, work: [['thbWeave', 40]] },
  'workshop:leather': { tone: [320, 0.25], roof: 0.5, hush: 0.85, work: [['thbScrape', 36]] },
  'shop:bread': { tone: [340, 0.3], roof: 0.5, hush: 0.95, work: [['kitchen', 40]] },
  'shop:pots': { tone: [340, 0.3], roof: 0.5, hush: 0.95, work: [['jarLid', 50]] },
  'shop:beer': { tone: [320, 0.3], roof: 0.5, hush: 0.95, work: [['pourWine', 50]] },
  'shop:fruit': { tone: [320, 0.25], roof: 0.5, hush: 0.95, work: [['sack', 60]] },
  'shop:cloth': { tone: [300, 0.2], roof: 0.5, hush: 0.9, work: [['clothRustle', 40]] },
  'shop:leather': { tone: [300, 0.25], roof: 0.5, hush: 0.9, work: [['thbScrape', 45]] },
  hall: { tone: [140, 0.3], roof: 0.3, hush: 0.4, work: [['clothRustle', 90]] },
  sanctuary: { tone: [120, 0.3], roof: 0.3, hush: 0.3, work: [['clothRustle', 90]] },
};
export const UPPER = { tone: [260, 0.14], roof: 0.6, hush: 0.7, work: [['clothRustle', 50]] };

// ── the planting, the town ──────────────────────────────────────────────────
const inLake = (x, z, m = 0) => inRect(LAKE, x, z, m);
/** Is there a tree at (x, z): the date-palm grove round the sacred lake, the palms of the quay's promenade and of the enclosure's skirt, the reeds of the banks. */
function treeAt(x, z) {
  if (inLake(x, z, 11) && !inLake(x, z, 6.5)) return true;
  if (Math.abs(x - (QUAY.x + QUAY.top)) < 2.5 && z > QUAY.z0 && z < QUAY.z1) return true;
  if (inRect(ENCL, x, z, 11) && !inRect(ENCL, x, z, 4.5)) return true;
  return false;
}
/** 0…1: how much green round (x, z) for the insects: the lake's grove, the banks' reeds, the enclosure's skirt; the town a little. */
export function greenNear(x, z) {
  const lake = 1 - sm(0, 30, rectDist(LAKE, x, z)), bank = 1 - sm(0, 24, Math.abs(Math.abs(x - RIVER.x) - RIVER.w / 2)), skirt = 0.6 * (1 - sm(0, 22, rectDist(ENCL, x, z)));
  return Math.max(lake, bank * 0.8, skirt, 0.12);
}
/** 0…1: how much broad leaf round (the palms), for the rustle in a wind. */
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird or an insect in, near (x, z), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 24; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (treeAt(px, pz)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the market, on the quay and in the streets about, less in the temple's courts and little beyond the houses. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 14) || inRect([QUAY.x - 4, QUAY.z0, QUAY.x + QUAY.top + 2, QUAY.z1], x, z, 10)) return 1;
  if (inRect(HALL_ZONE, x, z)) return 0.12;
  if (inRect(ENCL, x, z)) return 0.3;
  return Math.max(0.2, 0.9 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 20, Math.hypot(x, z))));
}
const HALL_ZONE = [HALL.x0, HALL.z0, HALL.x1, HALL.z1];

// ── the water ────────────────────────────────────────────────────────────────
/** The nearest of the river's stone face (the quay, x = QUAY.x, the bank beyond it) within 24 m: { p: [x, z], d } or null; the lap of the water at the stone. */
export function canalSpot(x, z) {
  const d = Math.abs(x - QUAY.x);
  if (x < QUAY.x - 30 || d > 24 || Math.hypot(x, z) > RADIUS) return null;
  return { p: [QUAY.x - 0.6, z], d };
}
/** A point where the water meets the sacred lake's stone steps, from the listener's, within 24 m (the lap there is softer). */
export function shoreSpot(x, z, rnd) {
  if (rectDist(LAKE, x, z) > 24) return null;
  const px = Math.max(LAKE[0], Math.min(LAKE[2], x + (rnd() - 0.5) * 8)), pz = Math.max(LAKE[1], Math.min(LAKE[3], z + (rnd() - 0.5) * 8));
  const e = [px, pz], dl = [px - LAKE[0], LAKE[2] - px, pz - LAKE[1], LAKE[3] - pz], k = dl.indexOf(Math.min(...dl));
  if (k === 0) e[0] = LAKE[0]; else if (k === 1) e[0] = LAKE[2]; else if (k === 2) e[1] = LAKE[1]; else e[1] = LAKE[3];
  return e;
}
/** A point on the river's water or the lake's within `reach` m of the listener (a fish rises by day, a frog sings by night in the reeds), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (Math.abs(x - RIVER.x) < RIVER.w / 2 + reach && Math.hypot(x, z) < RADIUS) return [RIVER.x + (rnd() - 0.5) * (RIVER.w - 10), z + (rnd() - 0.5) * 20];
  if (rectDist(LAKE, x, z) < reach) return [LAKE[0] + 2 + rnd() * (LAKE[2] - LAKE[0] - 4), LAKE[1] + 2 + rnd() * (LAKE[3] - LAKE[1] - 4)];
  return null;
}
/** 0…1: how marshy the ground is (the frogs of the reeds at night): the river banks and the lake's edge. */
export function frogGround(x, z) {
  const bank = 1 - sm(0, 30, Math.abs(x - RIVER.x) - RIVER.w / 2), lake = 0.7 * (1 - sm(0, 20, rectDist(LAKE, x, z)));
  return Math.max(bank, lake) * (Math.hypot(x, z) < RADIUS ? 1 : 0);
}
// what Thebes has none of (the engine's scheduler asks, and is answered with nothing)
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;

// ── what passes: the boats of the river ──────────────────────────────────────
/** A reach of the river within 70 m of the listener for a boat to pass along: { pts }, a few metres off the quay, in either direction. */
function riverTrack(x, z, rnd) {
  if (Math.abs(x - RIVER.x) > 70 + RIVER.w / 2 || Math.hypot(x, z) > RADIUS) return null;
  const lane = RIVER.x + 6 + rnd() * 14, a = z - 50 - rnd() * 20, b = z + 50 + rnd() * 20;
  return { pts: rnd() < 0.5 ? [[lane, a], [lane, b]] : [[lane, b], [lane, a]] };
}
export const TRACKS = [
  { key: 'riverboat', voice: 'thbBoat', speed: 1.3, r50: 16, gap: [28, 70], ok: (hour, rain) => hour >= 5.5 && hour < 19.5 && rain < 0.6, get: (x, z, r) => riverTrack(x, z, r) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const lakeMid = mid(LAKE), hallMid = mid(HALL_ZONE), sanctMid = mid(SANCT);
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry` (not in rain), `rainMax`, `lv`,
 * `after` (spaced from the end of a long one). The houses' own work comes from sites(); the shadufs' from shadufEmitters().
 */
const FIXED = [
  // the temple's rites [stated: the morning rite after the first light, shorter ones in the afternoon and evening — digitalkarnak.ucsc.edu/daily-ritual]
  { voice: 'thbChant', at: hallMid, r50: 30, gap: [30, 70], hours: [5.6, 7.4], after: true },
  { voice: 'thbChant', at: hallMid, r50: 30, gap: [50, 110], hours: [12, 12.9], after: true },
  { voice: 'thbChant', at: hallMid, r50: 30, gap: [40, 90], hours: [17.4, 18.7], after: true },
  { voice: 'thbChant', at: sanctMid, r50: 22, gap: [50, 110], hours: [5.6, 7.4], after: true },
  { voice: 'thbSistrum', at: [PYLON2.x0 - 6, 0], r50: 26, gap: [30, 80], hours: [5.6, 7.4] },
  { voice: 'thbSistrum', at: [PYLON2.x0 - 6, 0], r50: 26, gap: [90, 200], hours: [17.4, 18.6] },
  { voice: 'thbClap', at: [PYLON2.x0 - 12, 2], r50: 26, gap: [60, 150], hours: [5.6, 7.2], after: true },
  { voice: 'thbClap', at: [lakeMid[0] - 70, lakeMid[1] - 20], r50: 22, gap: [90, 220], hours: [6, 7.5], after: true },
  // the quay: stevedores at the stairs and along the stone, by day
  ...[-80, -20, 40, 100].map((z, i) => ({ voice: 'thbStevedores', at: [QUAY.x + 2.5, z], r50: 18, gap: [26 + i * 4, 70 + i * 6], hours: [5.5, 18] })),
  // the market's cries (wordless; the engine's hubbub is under them), at the stalls of the market on the quay (town.js: rows at z 26.5, 33.5, 39.5, 46)
  ...[[-226, 28], [-214, 32], [-222, 41], [-206, 44]].map((at, i) => ({ voice: 'thbHawk', at, r50: 14, gap: [24 + i * 5, 66 + i * 7], hours: [6, 14], rainMax: 0.5 })),
  // the geese of Amun on the sacred lake [stated: digitalkarnak.ucsc.edu/sacred-lake], and geese on the river's reeds
  { voice: 'thbGeese', at: lakeMid, r50: 28, gap: [16, 48], hours: [5.5, 19] },
  { voice: 'thbGeese', at: [RIVER.x + 30, -120], r50: 24, gap: [30, 80], hours: [5.5, 19] },
  // kites over the town and the temple; doves on the roofs near the arrival
  { voice: 'thbKite', at: [-60, 0], r50: 70, gap: [25, 70], hours: [7, 17.5] },
  { voice: 'thbKite', at: [-190, -70], r50: 70, gap: [35, 90], hours: [7, 17.5] },
  { voice: 'thbKite', at: [-110, 100], r50: 70, gap: [35, 90], hours: [7, 17.5] },
  ...[[-218, -22], [-198, -86], [-216, 34], [-190, 60]].map((at, i) => ({ voice: 'thbDove', at, r50: 14, gap: [20 + i * 3, 60 + i * 5], hours: [5.5, 18.5] })),
  // donkeys at the quay and in the lanes
  { voice: 'thbDonkey', at: [QUAY.x + 4, -40], r50: 40, gap: [70, 200], hours: [5.5, 19] },
  { voice: 'thbDonkey', at: [-200, 70], r50: 40, gap: [90, 240], hours: [5.5, 19] },
  { voice: 'thbDonkey', at: [-120, -210], r50: 40, gap: [90, 240], hours: [5.5, 19] },
  // jackals at the desert's edge, east of the town, at night
  { voice: 'thbJackal', at: [255, 30], r50: 85, gap: [60, 160], hours: [19.8, 4.5], rainMax: 0.5, after: true },
  { voice: 'thbJackal', at: [215, -160], r50: 85, gap: [90, 220], hours: [20.5, 4], rainMax: 0.5, after: true },
];
/** The shadufs' emitters (from the props' wells): the pole's creak, the bucket's water, by day. */
function shadufEmitters() { return shadufs().map((at, i) => ({ voice: 'thbShaduf', at, r50: 9, gap: [45 + (i % 3) * 10, 110 + (i % 4) * 12], hours: [6, 17], dry: true })); }
// (the shadufs' emitters are added the first time the list is read, so that loading this module does not build the props)
let shadufsAdded = false;
export const EMITTERS = new Proxy(FIXED, { get(t, k) { if (!shadufsAdded) { shadufsAdded = true; t.push(...shadufEmitters()); } return t[k]; } });
