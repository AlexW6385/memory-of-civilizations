// Where Babylon's sounds are (docs/settlements/babylon.md §20): the places of its emitters and the geometry the audio engine needs to put each sound where it is made —
// the temple's morning and evening rites in Esagila (the lamenters' chant, the great kettledrum), the sellers by the Way's walls and in the market at the bridge, the
// trades of the shops (the potter's wheel, the baker's quern, the loom, the smith, the brewer, the carpenter), the school's recitation, the houses' kitchens, the quay
// (porters, round boats poled on the Euphrates, the water at the quay wall), the shadufs of the west bank, the yards' sheep and geese, the doves of the roofs, the donkeys
// and camels of the caravans, a caravan passing along the Way, the altar's sheep, the jackals beyond the walls and the owl in the town at night, the rooms one can be inside.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-babylon.js). Coordinates: metres, +x east, +z south, the settlement's own frame. [inferred throughout: see the dossier §20.]
//
// What the scheduler of voices.js asks of a map but Babylon has not is answered with nothing: no bridges' walkers, no street tracks, no pond, no bamboo, no lotus beds.
// No bell and no call to prayer: Babylon had neither (the profile's `bells` is null, `adhan` 0).

import { RADIUS, WAY, WALL_Z, PALACE, PRECINCT, ESAGILA, MARKET, QUAY, RIVER, BRIDGE, riverX, lots, yards, esagilaChambers, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival, the Way's mouth). */
export const HOME = [WAY.x, -370];

/** A deterministic 0…1 from numbers (the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

const ZC = (ESAGILA[1] + ESAGILA[3]) / 2;
const COURT = [ESAGILA[0] + 32, ZC - 18.8, ESAGILA[0] + 63.3, ZC + 18.8];
const CELLA = [ESAGILA[0] + 6, ZC - 12, ESAGILA[0] + 20.5, ZC + 12];
const [pa0, pb0] = PALACE;
const THRONE = [pa0 + 30, pb0 + 74.4, pa0 + 72, pb0 + 89];
const CHAMBERS = esagilaChambers(ESAGILA);

/** The work heard from each trade's shop: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the trade] */
const TRADE_WORK = {
  smith: [['hammer', [14, 34], [6.5, 17]]],
  potter: [['wheel', [30, 60], [6.5, 17]]],
  carpenter: [['babAdze', [14, 34], [6.5, 17.5]]],
  baker: [['babQuern', [26, 60], [4, 10]], ['kitchen', [20, 45], [4, 18]]],
  weaver: [['babLoom', [24, 50], [6.5, 17.5]]],
  brewer: [['pourWine', [30, 70], [8, 19]], ['jarLid', [40, 90], [8, 19]]],
  grocer: [['sack', [30, 70], [6.5, 17.5]]],
};
/** The household's own sounds: the grain ground at home in the morning, the kitchen; the school's recitation; the evening's lyre in some houses. */
const HOUSE_WORK = [['kitchen', [14, 30], [5, 20]], ['babQuern', [40, 90], [4.5, 9]]];
const SCHOOL_WORK = [['babRecite', [30, 70], [7, 15]], ['kitchen', [60, 120], [5, 20]]];
const LYRE_WORK = ['babLyre', [120, 260], [18, 22]];

let SITES = null;
/** The houses and shops with sounds: { use, rect, at: [x, z] (the middle), id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots().filter((q) => q.open || q.shop)) {
    const use = l.shop ? 'shop:' + l.shop : l.school ? 'school' : 'house';
    const work = l.shop ? [...TRADE_WORK[l.shop]] : l.school ? SCHOOL_WORK : hash(l.seed, 3) < 0.25 ? [...HOUSE_WORK, LYRE_WORK] : HOUSE_WORK;
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'house:' + l.seed, work, y: 0 });
  }
  return SITES;
}

/** The shadufs of the west bank (town.js bankProps): the water is raised by the pole's bucket, the creak carries. */
export const SHADUFS = [-110, -30, 120, 190].map((z) => [riverX(z) - 46, z]);
/** (Babylon's wells are not drawn here: the shadufs have emitters of their own in EMITTERS.) */
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['cella', 'cella', CELLA],
  ['throne room', 'throne room', THRONE],
  ...CHAMBERS.map((c) => [`esagila ${c.kind}`, `esagila ${c.kind}`, c.r]),
];
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.9, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id + ':' + Math.round(r[0]) };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is (flat mud roofs: little), `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [320, 0.25], roof: 0.5, hush: 0.75, work: [['kitchen', 40]] };
export const ROOMS = {
  house: { ...R0, work: [['kitchen', 36], ['clothRustle', 80]] },
  school: { ...R0, hush: 0.7, work: [['babRecite', 40], ['clothRustle', 90]] },
  'shop:smith': { tone: [420, 0.35], roof: 0.5, hush: 0.95, work: [['hammer', 30]] },
  'shop:potter': { tone: [340, 0.3], roof: 0.5, hush: 0.9, work: [['wheel', 40]] },
  'shop:carpenter': { tone: [340, 0.3], roof: 0.5, hush: 0.9, work: [['babAdze', 30]] },
  'shop:baker': { tone: [320, 0.3], roof: 0.5, hush: 0.9, work: [['babQuern', 50], ['kitchen', 40]] },
  'shop:weaver': { tone: [300, 0.25], roof: 0.5, hush: 0.85, work: [['babLoom', 40]] },
  'shop:brewer': { tone: [320, 0.3], roof: 0.5, hush: 0.95, work: [['pourWine', 50], ['jarLid', 70]] },
  'shop:grocer': { tone: [320, 0.25], roof: 0.5, hush: 0.95, work: [['sack', 60]] },
  cella: { tone: [120, 0.3], roof: 0.3, hush: 0.3, work: [['clothRustle', 90]] },
  'throne room': { tone: [140, 0.3], roof: 0.3, hush: 0.4, work: [['clothRustle', 90]] },
  'esagila storehouse': { tone: [300, 0.25], roof: 0.4, hush: 0.7, work: [['sack', 60], ['jarLid', 80]] },
  'esagila scriptorium': { tone: [280, 0.2], roof: 0.4, hush: 0.7, work: [['clothRustle', 50]] },
  'esagila kitchen': { tone: [340, 0.3], roof: 0.4, hush: 0.8, work: [['kitchen', 30]] },
  'esagila treasury': { tone: [240, 0.2], roof: 0.4, hush: 0.6, work: [['clothRustle', 90]] },
  'esagila bakehouse': { tone: [320, 0.3], roof: 0.4, hush: 0.8, work: [['babQuern', 50], ['kitchen', 40]] },
  'esagila purification': { tone: [260, 0.25], roof: 0.4, hush: 0.6, work: [['pour', 50]] },
};
export const UPPER = { tone: [260, 0.14], roof: 0.6, hush: 0.7, work: [['clothRustle', 50]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** Is there a tree at (x, z): the poplars and tamarisks of the banks, the date orchards behind them west of the river and the palms of the Way's approach. */
function treeAt(x, z) {
  const d = x - riverX(z);
  if (Math.abs(Math.abs(d) - (RIVER.w / 2 + 2)) < 4) return true;
  if (d < -RIVER.w / 2 - 8 && d > -RIVER.w / 2 - 110) return true;
  return false;
}
/** 0…1: how much green round (x, z) for the insects: the banks, the orchards west of the river; the town a little. */
export function greenNear(x, z) {
  const d = x - riverX(z), bank = 1 - sm(0, 30, Math.abs(Math.abs(d) - RIVER.w / 2)), orchard = d < -RIVER.w / 2 - 6 && d > -RIVER.w / 2 - 110 ? 0.85 : 0;
  return Math.max(bank * 0.8, orchard, 0.12);
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
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the market and on the quay, the Way's approach busy, less in the courts of the temples and little beyond the houses. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 14) || inRect([riverX(z) + QUAY.d0 - 4, QUAY.z0, riverX(z) + QUAY.d1 + 2, QUAY.z1], x, z, 10)) return 1;
  if (inRect(COURT, x, z, 4) || inRect(CELLA, x, z)) return 0.12;
  if (inRect(PRECINCT, x, z)) return 0.3;
  if (Math.abs(x - WAY.x) < 30 && z > WALL_Z - 90 && z < WALL_Z) return 0.9;
  return Math.max(0.2, 0.9 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 20, Math.hypot(x, z))));
}

// ── the water ────────────────────────────────────────────────────────────────
const HALF = RIVER.w / 2 - 2;
/** The nearest of the river's two banks within 24 m: { p: [x, z], d } or null; the lap of the water at the quay wall's foot. */
export function canalSpot(x, z) {
  const c = riverX(z), d = Math.abs(Math.abs(x - c) - HALF);
  if (d > 24 || Math.hypot(x, z) > RADIUS) return null;
  return { p: [c + (x > c ? HALF : -HALF) * 0.96, z], d };
}
/** (The quay is a wall; the river has no stepped shore.) */
export const shoreSpot = () => null;
/** A point on the river's water within `reach` m of the listener (a fish rises by day, a frog sings by night in the reeds), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  const c = riverX(z);
  if (Math.abs(x - c) < HALF + reach && Math.hypot(x, z) < RADIUS) return [c + (rnd() - 0.5) * (RIVER.w - 12), z + (rnd() - 0.5) * 20];
  return null;
}
/** 0…1: how marshy the ground is (the frogs of the reeds at night): the banks of the river. */
export function frogGround(x, z) { return (1 - sm(0, 30, Math.abs(x - riverX(z)) - RIVER.w / 2)) * (Math.hypot(x, z) < RADIUS ? 1 : 0); }
// what Babylon has none of (the engine's scheduler asks, and is answered with nothing)
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;

// ── what passes: round boats on the river, caravans on the Way ──────────────
/** A reach of the river within 70 m of the listener for a boat to pass along: { pts }, in either direction. */
function riverTrack(x, z, rnd) {
  if (Math.abs(x - riverX(z)) > 70 + RIVER.w / 2 || Math.hypot(x, z) > RADIUS) return null;
  const off = (rnd() - 0.5) * 24, a = z - 50 - rnd() * 20, b = z + 50 + rnd() * 20;
  return { pts: rnd() < 0.5 ? [[riverX(a) + off, a], [riverX(b) + off, b]] : [[riverX(b) + off, b], [riverX(a) + off, a]] };
}
/** A stretch of the Processional Way within 90 m of the listener for a caravan to pass along it (from the north, to the gate, or the other way). */
function wayTrack(x, z, rnd) {
  if (Math.abs(x - WAY.x) > 90 || z < WAY.z0 - 20 || z > WALL_Z + 120) return null;
  const a = Math.max(WAY.z0, z - 60 - rnd() * 20), b = Math.min(WAY.z1, z + 60 + rnd() * 20), lane = WAY.x + (rnd() - 0.5) * 8;
  return { pts: rnd() < 0.55 ? [[lane, a], [lane, b]] : [[lane, b], [lane, a]] };
}
export const TRACKS = [
  { key: 'quffa', voice: 'babQuffa', speed: 1.1, r50: 16, gap: [28, 70], ok: (hour, rain) => hour >= 5.5 && hour < 19.5 && rain < 0.6, get: (x, z, r) => riverTrack(x, z, r) },
  { key: 'caravan', voice: 'babCaravan', speed: 1.3, r50: 18, gap: [70, 160], ok: (hour, rain) => hour >= 6 && hour < 17.5 && rain < 0.5, get: (x, z, r) => wayTrack(x, z, r) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const courtMid = mid(COURT), cellaMid = mid(CELLA);
const quayX = (z, o = 2.2) => riverX(z) + QUAY.d0 + o;
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry` (not in rain), `rainMax`, `lv`,
 * `after` (spaced from the end of a long one). The houses' own work comes from sites().
 */
const FIXED = [
  // the temple's rites: the lamenters' and singers' chant in the cella and the court after the first light and before dark, the kettledrum under it [inferred: the god was
  // served meals several times a day (ancient-history-sites.com); the two main ones at the day's two ends are our reading]
  { voice: 'babChant', at: cellaMid, r50: 26, gap: [30, 70], hours: [5.4, 7.2], after: true },
  { voice: 'babChant', at: courtMid, r50: 28, gap: [50, 110], hours: [5.6, 7.0], after: true },
  { voice: 'babChant', at: cellaMid, r50: 26, gap: [40, 90], hours: [17.4, 19], after: true },
  { voice: 'babLilissu', at: courtMid, r50: 34, gap: [40, 100], hours: [5.6, 7.0], after: true },
  { voice: 'babLilissu', at: courtMid, r50: 34, gap: [60, 130], hours: [17.5, 18.8], after: true },
  // the altar of Etemenanki's court: the sheep led to the sacrifice
  { voice: 'babSheep', at: [-34, 116], r50: 16, gap: [24, 70], hours: [5.8, 10] },
  { voice: 'babChant', at: [-30, 128], r50: 24, gap: [60, 140], hours: [6, 7.4], after: true },
  // the sellers by the Way's walls before the gate (§14) and south of it, in the market at the bridge, by day
  ...[[-48, -352], [-32, -340], [-48, -330], [-32, -362]].map((at, i) => ({ voice: 'babHawk', at, r50: 14, gap: [22 + i * 5, 60 + i * 7], hours: [6, 17], rainMax: 0.5 })),
  ...[[-31, -255], [-49, -218], [-31, -182]].map((at, i) => ({ voice: 'babHawk', at, r50: 14, gap: [30 + i * 5, 80 + i * 7], hours: [6, 17], rainMax: 0.5 })),
  ...[[-226, 20], [-212, 24], [-200, 52], [-186, 56], [-222, 46]].map((at, i) => ({ voice: 'babHawk', at, r50: 14, gap: [22 + i * 5, 62 + i * 7], hours: [6, 15], rainMax: 0.5 })),
  // the quay: porters at the moored boats (plan.js QUFFAS), by day
  ...[-60, -40, 95, 112].map((z, i) => ({ voice: 'babHaul', at: [quayX(z), z], r50: 18, gap: [26 + i * 4, 70 + i * 6], hours: [5.5, 18] })),
  // the shadufs of the west bank, by day
  ...SHADUFS.map((at, i) => ({ voice: 'babShaduf', at, r50: 9, gap: [45 + (i % 3) * 10, 110 + (i % 4) * 12], hours: [6, 17], dry: true })),
  // geese in the yards and on the river's edge; doves on the roofs near the arrival and the Way
  { voice: 'babGeese', at: [riverX(-120) + 30, -120], r50: 22, gap: [30, 80], hours: [5.5, 19] },
  { voice: 'babGeese', at: [riverX(150) + 30, 150], r50: 22, gap: [30, 80], hours: [5.5, 19] },
  ...[[-60, -372], [-20, -366], [-70, -330], [-14, -300], [-26, -130], [-60, -100]].map((at, i) => ({ voice: 'babDove', at, r50: 14, gap: [20 + i * 3, 60 + i * 5], hours: [5.5, 18.5] })),
  // the caravan's camels and donkeys at the Way's mouth, donkeys in the market and on the bridge
  { voice: 'babCamel', at: [WAY.x + 7.5, -338], r50: 24, gap: [40, 110], hours: [6, 17] },
  { voice: 'babDonkey', at: [WAY.x + 6.8, -350], r50: 36, gap: [70, 190], hours: [5.5, 19] },
  { voice: 'babDonkey', at: [MARKET[2] - 6, MARKET[1] + 18], r50: 36, gap: [90, 230], hours: [5.5, 19] },
  { voice: 'babDonkey', at: [riverX(BRIDGE.z) + 12, BRIDGE.z], r50: 36, gap: [90, 240], hours: [5.5, 19] },
  // night: jackals beyond the walls, the owl in the town (an owl on the temple's tower)
  { voice: 'babJackal', at: [260, -330], r50: 85, gap: [60, 160], hours: [19.8, 4.5], rainMax: 0.5, after: true },
  { voice: 'babJackal', at: [-380, 120], r50: 85, gap: [90, 220], hours: [20.5, 4], rainMax: 0.5, after: true },
  { voice: 'babOwl', at: [0, 10], r50: 40, gap: [40, 110], hours: [20, 4.5] },
  { voice: 'babOwl', at: [-70, -120], r50: 30, gap: [60, 150], hours: [20.5, 4] },
];
// the yards' sheep (the pens of the core), the doves' and geese's share
for (const y of yards().filter((q) => q.kind === 'pen' && Math.hypot((q.rect[0] + q.rect[2]) / 2 + 40, (q.rect[1] + q.rect[3]) / 2 + 100) < 230).slice(0, 6)) FIXED.push({ voice: 'babSheep', at: mid(y.rect), r50: 14, gap: [30, 90], hours: [5.5, 19] });
export const EMITTERS = FIXED;
