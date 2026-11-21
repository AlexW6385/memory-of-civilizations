// Where Ur's sounds are (docs/settlements/ur.md §26): the places of its emitters and the geometry the audio engine needs to put each sound where it is made — the rites of Nanna
// (the gala-priests' lament and the singers' chant in the Court, the great drum, the lyre at the way's edge), the sellers of the market square, the trades of the houses that can
// be entered (the quern, the loom, the potter's wheel, the smith's hammer, the brewer's vats, the granary), the edubba's recitation, the households' kitchens, the harbour's quay
// (porters, reed boats poled across the basin, the water at the quay wall), the brickyard (the clay trodden in its beds, the moulder's slap, the shaduf at its pool), the yards'
// geese and sheep, the doves of the roofs, the donkeys and their trains on the north street, the jackals beyond the rampart and the owl at night, and the rooms one can be inside.
// Pure data and functions of layout.js and openwalk.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-ur.js). Coordinates: metres, +x east, +z south, the settlement's own frame. [inferred throughout: see the dossier §26.]
//
// What the scheduler of voices.js asks of a map but Ur has not is answered with nothing: no bridges' walkers, no street tracks, no bamboo, no lotus. No bell and no call to prayer: Ur
// had neither (the profile has none).

import { RADIUS, TEMENOS, TERRACE, COURT, GIPARU, PALACE, MARKET, HARBOUR, BRICKYARD, MAUS, RAMP, ZIG, houses, usedLots, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival, in the Court of Nanna). */
export const HOME = [0, -118];

/** A deterministic 0…1 from numbers (the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const [hx0, hz0, hx1, hz1] = HARBOUR.rect;
const QUAY_X = hx1;

const COURT_MID = mid(COURT), PALACE_HALL = [110.8, -139, 121, -83], SHRINE = [-5.7, 4.8, 5.7, 13.2];

/** The work heard from each trade house: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the trade] */
const TRADE_WORK = {
  smith: [['hammer', [14, 34], [6.5, 17]]],
  potter: [['wheel', [30, 60], [6.5, 17]]],
  baker: [['urQuern', [26, 60], [4, 10]], ['kitchen', [20, 45], [4, 18]]],
  weaver: [['urLoom', [24, 50], [6.5, 17.5]]],
  brewer: [['pourWine', [30, 70], [8, 19]], ['jarLid', [40, 90], [8, 19]]],
  granary: [['sack', [30, 70], [6.5, 17.5]], ['jarLid', [60, 120], [7, 17]]],
  fisher: [['sack', [40, 90], [4.5, 12]], ['pour', [30, 70], [5, 14]]],
  reeder: [['clothRustle', [30, 70], [6, 17]], ['sack', [60, 120], [6, 16]]],
};
/** The household's own sounds: the grain ground at home in the morning, the kitchen; the edubba's recitation; the evening's lyre in some houses. */
const HOUSE_WORK = [['kitchen', [14, 30], [5, 20]], ['urQuern', [40, 90], [4.5, 9]]];
const SCHOOL_WORK = [['urRecite', [30, 70], [7, 15]], ['kitchen', [60, 120], [5, 20]]];
const LYRE_WORK = ['urLyre', [120, 260], [18, 22]];

let SITES = null;
/** The houses with sounds: { use, rect, at: [x, z] (the middle), id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of houses().filter((q) => q.open)) {
    const use = l.school ? 'school' : l.trade ? 'trade:' + l.trade : 'house';
    const work = l.school ? SCHOOL_WORK : l.trade ? [...(TRADE_WORK[l.trade] || HOUSE_WORK)] : hash(l.seed, 3) < 0.25 ? [...HOUSE_WORK, LYRE_WORK] : HOUSE_WORK;
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'house:' + l.seed, work, y: 0 });
  }
  return SITES;
}

/** The shaduf at the brickyard's pool (src/styles/sumerian-ur/brickyard.js: at (9.5, 22.5) of its rect). The town's wells and the far/temple hooks of the engine are none. */
export const SHADUFS = [[BRICKYARD[0] + 9.5, BRICKYARD[1] + 22.5]];
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [['shrine', 'shrine', SHRINE], ['palace hall', 'palace hall', PALACE_HALL]];
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.1, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z) && (id !== 'shrine' || y > TERRACE.y + 20)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is (flat mud roofs: little), `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [320, 0.25], roof: 0.5, hush: 0.75, work: [['kitchen', 40]] };
export const ROOMS = {
  house: { ...R0, work: [['kitchen', 36], ['clothRustle', 80]] },
  school: { ...R0, hush: 0.7, work: [['urRecite', 40], ['clothRustle', 90]] },
  'trade:smith': { tone: [420, 0.35], roof: 0.5, hush: 0.95, work: [['hammer', 30]] },
  'trade:potter': { tone: [340, 0.3], roof: 0.5, hush: 0.9, work: [['wheel', 40]] },
  'trade:baker': { tone: [320, 0.3], roof: 0.5, hush: 0.9, work: [['urQuern', 50], ['kitchen', 40]] },
  'trade:weaver': { tone: [300, 0.25], roof: 0.5, hush: 0.85, work: [['urLoom', 40]] },
  'trade:brewer': { tone: [320, 0.3], roof: 0.5, hush: 0.95, work: [['pourWine', 50], ['jarLid', 70]] },
  'trade:granary': { tone: [300, 0.25], roof: 0.5, hush: 0.95, work: [['sack', 60], ['jarLid', 80]] },
  'trade:fisher': { tone: [320, 0.25], roof: 0.5, hush: 0.95, work: [['sack', 70], ['pour', 50]] },
  'trade:reeder': { tone: [300, 0.25], roof: 0.5, hush: 0.9, work: [['clothRustle', 50]] },
  shrine: { tone: [120, 0.3], roof: 0.3, hush: 0.3, work: [['clothRustle', 90]] },
  'palace hall': { tone: [160, 0.3], roof: 0.4, hush: 0.45, work: [['clothRustle', 90]] },
};
export const UPPER = { tone: [260, 0.14], roof: 0.6, hush: 0.7, work: [['clothRustle', 50]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** Is there a tree at (x, z): the date groves behind the quay, the palms along the avenue to the Edublalmah. */
function treeAt(x, z) {
  if (inRect([hx1 + 1, hz0, hx1 + 40, hz1], x, z) && Math.hypot(x, z) < RADIUS - 10) return true;
  if (inRect([-17, -166, 17, -145], x, z)) return true;
  return false;
}
/** 0…1: how much green round (x, z) for the insects: the harbour's reeds and the groves behind the quay; the town a little. */
export function greenNear(x, z) {
  const d = Math.max(hx0 - x, x - (hx1 + 40), hz0 - z, z - hz1, 0);
  return Math.max((1 - sm(0, 40, d)) * 0.8, 0.1);
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
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the market square and on the quay, the north street busy, little in the Court and the temenos, less beyond the houses. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 14) || inRect([QUAY_X - 14, hz0 + 10, QUAY_X + 14, hz1 - 10], x, z)) return 1;
  if (inRect(COURT, x, z, 4)) return 0.12;
  if (inRect(TEMENOS, x, z)) return 0.3;
  if (Math.abs(x) < 25 && z < MARKET[1] && z > -340) return 0.8;
  return Math.max(0.2, 0.9 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 20, Math.hypot(x, z))));
}

// ── the water ────────────────────────────────────────────────────────────────
/** The nearest point of the quay's water edge within 24 m: { p: [x, z], d } or null; the lap of the water at the quay wall's foot. */
export function canalSpot(x, z) {
  const d = Math.hypot(Math.max(hx1 - 1.5 - x, 0, x - (hx1 - 1.5)), Math.max(hz0 + 8 - z, 0, z - (hz1 - 8)));
  if (d > 24) return null;
  return { p: [hx1 - 2.2, Math.max(hz0 + 8, Math.min(hz1 - 8, z))], d };
}
/** The flights of brick steps down to the water (plan.js: z −80, −30, 12): the water at their foot. */
export function shoreSpot(x, z) {
  let best = null, bd = 1e9;
  for (const sz of [-79, -29, 13]) { const d = Math.hypot(hx1 - 4.6 - x, sz - z); if (d < bd) { bd = d; best = [hx1 - 4.6, sz]; } }
  return bd < 30 ? { p: best, d: bd } : null;
}
/** A point on the basin's water within `reach` m of the listener (a fish rises by day, a frog sings by night in the reeds), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (x > hx1 + reach || x < hx0 - reach || z > hz1 + reach || z < hz0 - reach) return null;
  return [hx0 + 12 + rnd() * (hx1 - hx0 - 24), hz0 + 12 + rnd() * (hz1 - hz0 - 24)];
}
/** 0…1: how marshy the ground is (the frogs of the reeds at night): the basin's rim. */
export function frogGround(x, z) { return (1 - sm(0, 30, Math.max(hx0 - x, x - hx1, hz0 - z, z - hz1, 0))) * (Math.hypot(x, z) < RADIUS ? 1 : 0); }
// what Ur has none of (the engine's scheduler asks, and is answered with nothing)
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;

// ── what passes: reed boats across the harbour, donkey trains on the north street ───────────────
/** A reach of the basin within 70 m of the listener for a boat to pass along: { pts }, in either direction. */
function boatTrack(x, z, rnd) {
  if (x > hx1 + 70 || x < hx0 - 70 || z < hz0 - 70 || z > hz1 + 70) return null;
  const px = hx0 + 20 + rnd() * (hx1 - hx0 - 55), a = Math.max(hz0 + 14, z - 50 - rnd() * 20), b = Math.min(hz1 - 14, z + 50 + rnd() * 20);
  return { pts: rnd() < 0.5 ? [[px, a], [px, b]] : [[px, b], [px, a]] };
}
/** A stretch of the north street within 90 m of the listener for a train of donkeys to pass along it (to the market, or back). */
function streetTrainTrack(x, z, rnd) {
  if (Math.abs(x) > 90 || z > MARKET[1] + 20 || z < -360) return null;
  const a = Math.max(-360, z - 60 - rnd() * 20), b = Math.min(MARKET[1], z + 60 + rnd() * 20), lane = (rnd() - 0.5) * 4;
  return { pts: rnd() < 0.6 ? [[lane, a], [lane, b]] : [[lane, b], [lane, a]] };
}
export const TRACKS = [
  { key: 'reedboat', voice: 'urBoat', speed: 1.0, r50: 16, gap: [30, 75], ok: (hour, rain) => hour >= 5.5 && hour < 19 && rain < 0.6, get: (x, z, r) => boatTrack(x, z, r) },
  { key: 'asstrain', voice: 'urAssTrain', speed: 1.2, r50: 16, gap: [70, 170], ok: (hour, rain) => hour >= 5.5 && hour < 17.5 && rain < 0.5, get: (x, z, r) => streetTrainTrack(x, z, r) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry` (not in rain), `rainMax`, `lv`,
 * `after` (spaced from the end of a long one). The houses' own work comes from sites().
 */
const quayAt = (z, o = 2.2) => [QUAY_X + o, z];
const FIXED = [
  // the rites of Nanna in the Court at the day's two ends: the gala-priests' lament and the singers' chant, the great drum under it [inferred: the god was served meals daily; the
  // day's two ends are our reading]
  { voice: 'urChant', at: COURT_MID, r50: 28, gap: [40, 90], hours: [5.4, 7.2], after: true },
  { voice: 'urChant', at: COURT_MID, r50: 28, gap: [50, 110], hours: [17.4, 19], after: true },
  { voice: 'urLilis', at: [-12, -100], r50: 34, gap: [50, 110], hours: [5.6, 7.0], after: true },
  { voice: 'urLilis', at: [-12, -100], r50: 34, gap: [60, 130], hours: [17.5, 18.8], after: true },
  // the lyre, pipe and drum on the reed mat at the way's east edge (life.js zigguratLife), by day
  { voice: 'urLyre', at: [4.85, -102.5], r50: 14, gap: [90, 220], hours: [8, 17] },
  // the sellers of the market square, two rows either side of the way to the gate (life.js), by day
  ...[[-35, -189], [-22, -204], [-30, -204], [16, -189], [28, -204], [36, -189]].map((at, i) => ({ voice: 'urHawk', at, r50: 14, gap: [22 + i * 5, 60 + i * 7], hours: [6, 16], rainMax: 0.5 })),
  // the quay: porters at the moored boats, by day
  ...[-94, -58, -10, 24].map((z, i) => ({ voice: 'urHaul', at: quayAt(z), r50: 18, gap: [26 + i * 4, 70 + i * 6], hours: [5.5, 18] })),
  // the brickyard: the clay trodden in the beds, the moulder on the drying field, the shaduf at its pool, by day
  { voice: 'urTread', at: [BRICKYARD[0] + 10, BRICKYARD[1] + 9], r50: 14, gap: [16, 40], hours: [5.5, 17.5] },
  { voice: 'urTread', at: [BRICKYARD[0] + 26.5, BRICKYARD[1] + 9], r50: 14, gap: [20, 46], hours: [5.5, 17.5] },
  { voice: 'urMould', at: [BRICKYARD[0] + 28, BRICKYARD[1] + 36], r50: 14, gap: [18, 46], hours: [6, 17] },
  ...SHADUFS.map((at) => ({ voice: 'urShaduf', at, r50: 10, gap: [40, 100], hours: [6, 17], dry: true })),
  // geese on the harbour's edge and in the yards behind the quay; doves on the roofs of the north street, the square and the Court
  { voice: 'urGeese', at: [hx1 + 6, -60], r50: 22, gap: [30, 80], hours: [5.5, 19] },
  { voice: 'urGeese', at: [hx1 + 8, 20], r50: 22, gap: [30, 80], hours: [5.5, 19] },
  ...[[-20, -230], [24, -250], [-30, -170], [30, -176], [-60, -120], [60, -118]].map((at, i) => ({ voice: 'urDove', at, r50: 14, gap: [20 + i * 3, 60 + i * 5], hours: [5.5, 18.5] })),
  // the donkeys at the north street's foot and the square; the shepherd's sheep and goats at the square's west end and in the temple's pens
  { voice: 'urDonkey', at: [-4, -262], r50: 36, gap: [70, 190], hours: [5.5, 18] },
  { voice: 'urDonkey', at: [MARKET[2] - 6, MARKET[1] + 14], r50: 36, gap: [90, 230], hours: [5.5, 19] },
  { voice: 'urSheep', at: [MARKET[0] + 4, MARKET[3] - 6], r50: 16, gap: [24, 70], hours: [5.8, 12] },
  { voice: 'urSheep', at: [-100, 80], r50: 16, gap: [30, 80], hours: [5.5, 19] },
  // night: jackals beyond the rampart, the owl in the town and on the ziggurat's stages
  { voice: 'urJackal', at: [RAMP.r + 40, -150], r50: 85, gap: [60, 160], hours: [19.8, 4.5], rainMax: 0.5, after: true },
  { voice: 'urJackal', at: [-60, RAMP.r + 40], r50: 85, gap: [90, 220], hours: [20.5, 4], rainMax: 0.5, after: true },
  { voice: 'urOwl', at: [ZIG.c[0], ZIG.c[1] + 30], r50: 40, gap: [40, 110], hours: [20, 4.5] },
  { voice: 'urOwl', at: [-70, -230], r50: 30, gap: [60, 150], hours: [20.5, 4] },
];
// the pens of the core's empty lots: sheep and goats
for (const u of usedLots().filter((q) => q.kind === 'pen' && Math.hypot((q.rect[0] + q.rect[2]) / 2, (q.rect[1] + q.rect[3]) / 2 + 120) < 200).slice(0, 6)) FIXED.push({ voice: 'urSheep', at: mid(u.rect), r50: 14, gap: [30, 90], hours: [5.5, 19] });
void GIPARU; void MAUS;
export const EMITTERS = FIXED;
