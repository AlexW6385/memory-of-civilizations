// Where Mohenjo-daro's sounds are (docs/settlements/mohenjo-daro.md §16.3): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the drip of the Great Bath's drain, the pipe and the drum in the market, the bead-drill, the shell-saw, the bellows and the potter's wheel of the open workshops,
// the quern of the open houses, the sacks at the granary's ramp, the carts on First Street, the Indus at its landing, the children with their rattles, the rooms one can be inside.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-mohenjo-daro.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout: nothing of the city's sound survives]
import '../../engine/voices-mohenjo-daro.js';
import { RADIUS, RIVER, QUAY, PLAZA, WELL_BIG, BATH, GRANARY, PILLARED, COLLEGE, riverX, lots, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the Citadel). */
export const HOME = [-155, -72.5];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of open lot: [voice, gap in seconds [min, max], hours [from, to]]. */
const WORK = {
  house: [['kitchen', [16, 34], [5.5, 20]], ['mdQuern', [60, 130], [5.5, 10]], ['mdRattle', [70, 160], [8, 17]]],
  small: [['kitchen', [18, 40], [5.5, 20]], ['mdQuern', [70, 140], [5.5, 10]]],
  bead: [['mdDrill', [12, 28], [6.5, 17.5]], ['jarLid', [50, 110], [7, 17]]],
  seal: [['chisel', [14, 34], [7, 17]], ['clay', [40, 90], [7, 17]]],
  potter: [['wheel', [20, 44], [6.5, 17]], ['clay', [12, 28], [6.5, 17]]],
  bronze: [['hammer', [10, 26], [6.5, 17.5]], ['mdBellows', [30, 70], [6.5, 17.5]]],
  shell: [['mdShellSaw', [14, 32], [6.5, 17.5]]],
};
let SITES = null;
/** The open lots with sounds: { use, rect, at: [x, z] (the middle), id: 'lot:<seed>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) if (l.open && WORK[l.kind]) SITES.push({ use: l.kind, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[l.kind], y: l.y });
  SITES.push({ use: 'granary', rect: [GRANARY[0] + 1, GRANARY[1] + 1, GRANARY[2] - 1, GRANARY[3] - 1], at: mid(GRANARY), id: 'room:granary', work: [['sack', [20, 50], [6, 17]], ['jarLid', [40, 90], [6, 17]]], y: 7 });
  return SITES;
}

/** The wells: the market's great well and the platform's four (plan.js). */
export const WELLS = [WELL_BIG, [-124, -71], [-192, -80.5], [-72, -92], [-150, -18]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const [bx0, bz0, bx1, bz1] = BATH.outer;
const ROOM_RECTS = [
  ['room:bath-gallery', 'bathhall', [bx0 + 1.2, BATH.court[3], bx1 - 8, bz1 - 1.2]],
  ['room:pillared', 'hall', [PILLARED[0] + 1, PILLARED[1] + 1, PILLARED[2] - 1, PILLARED[3] - 1]],
  ['room:college', 'college', [COLLEGE[0] + 8, COLLEGE[1] + 8, COLLEGE[2] - 8, COLLEGE[3] - 8]],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s && Math.abs(y - (s.y ?? 0)) < 6) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.6, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z) && y > 5) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a flat mud roof: dull), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [260, 0.2], roof: 0.7, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  house: { ...R0, tone: [300, 0.3], work: [['kitchen', 30]] },
  small: { ...R0, tone: [300, 0.3], work: [['kitchen', 34]] },
  bead: { ...R0, work: [['mdDrill', 16]] },
  seal: { ...R0, work: [['chisel', 22]] },
  potter: { ...R0, tone: [320, 0.3], hush: 0.9, work: [['clay', 14]] },
  bronze: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 20], ['mdBellows', 40]] },
  shell: { ...R0, work: [['mdShellSaw', 18]] },
  granary: { tone: [200, 0.2], roof: 0.7, hush: 0.7, work: [['sack', 30]] },
  bathhall: { tone: [230, 0.25], roof: 0.6, hush: 0.6, work: [['mdDrip', 8]] },
  hall: { tone: [210, 0.2], roof: 0.6, hush: 0.6, work: [['clothRustle', 60]] },
  college: { tone: [240, 0.2], roof: 0.6, hush: 0.7, work: [['clothRustle', 70]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const dRiver = (x, z) => Math.abs(x - riverX(z)) - RIVER.hw;
/** 0…1: how much green round (x, z): the tamarisk and reeds at the Indus, the pipals of the Citadel, the fields at the rim; the town little. */
export function greenNear(x, z) {
  const bank = 1 - sm(0, 50, Math.max(0, dRiver(x, z))), rim = sm(RADIUS - 120, RADIUS - 40, Math.hypot(x, z));
  return Math.max(bank * 0.9, rim * 0.6, 0.15);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the pipals on the platform, the tamarisk at the bank, the date palms of the rim. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (const [px, pz] of [[-121, -97], [-178, -80]]) if (Math.hypot(px - x, pz - z) < reach) return [px, pz];
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (dRiver(px, pz) < 14 && dRiver(px, pz) > 3 || Math.hypot(px, pz) > RADIUS - 70)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the market place and First Street, less on the Citadel and the lanes, little at the rim. */
export function townNear(x, z) {
  if (inRect(PLAZA, x, z, 10)) return 1;
  if (x < -64 && z < 40 && z > -120) return 0.3;
  return Math.max(0.12, 0.8 * (1 - 0.7 * sm(RADIUS - 170, RADIUS - 20, Math.hypot(x, z))) * (1 - 0.3 * sm(150, 260, x)));
}
// what the city has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = (x, z) => (dRiver(x, z) < 22 ? 0.6 : 0);
/** The bank where the river laps, near (x, z) within 30 m, or null. */
export function shoreSpot(x, z, rnd) {
  const zz = Math.max(-RADIUS + 30, Math.min(RADIUS - 30, z + (rnd() - 0.5) * 30)), bx = riverX(zz) - RIVER.hw + 3;
  return Math.abs(x - bx) < 30 ? [bx, zz] : null;
}

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const mk = mid(PLAZA);
export const EMITTERS = [
  // the Great Bath's drain at the south-west corner of the tank, dripping day and night
  E('mdDrip', [BATH.pool[0] - 0.6, BATH.pool[3] + 0.4], 9, [3, 8], [0, 24], { rainMax: 1 }),
  // the pipe and the hand drum in the market place; the sellers' small noises
  E('mdPipe', [mk[0] - 8, mk[1] + 6], 24, [80, 170], [8, 17], { rainMax: 0.3, after: true }),
  E('mdDrum', [mk[0] + 6, mk[1] - 4], 24, [40, 100], [8, 17], { rainMax: 0.3, after: true }),
  E('jarLid', [mk[0], mk[1] + 8], 12, [14, 36], [7, 17.5], { dry: true }), E('sack', [mk[0] - 10, mk[1] - 6], 12, [20, 50], [7, 17.5], { dry: true }), E('pour', [mk[0] + 10, mk[1] + 4], 12, [30, 70], [7, 17.5], { dry: true }),
  E('clothRustle', [mk[0] + 4, mk[1] - 10], 10, [18, 40], [7, 17.5], { dry: true }),
  // the Indus along the quay and the bank, in reaches
  ...[-200, -90, 0, 90, 200].map((z) => E('mdRiver', [riverX(z) - RIVER.hw + 2, z], 24, [6, 11], [0, 24], { rainMax: 1 })),
  // the landing: sacks carried, the boatmen's calls over the water, washing at the fisheries
  E('sack', [QUAY.x1 - 3, -50], 12, [14, 36], [6, 17.5], { dry: true }), E('sack', [QUAY.x1 - 3, 10], 12, [16, 40], [6, 17.5], { dry: true }),
  E('mdCall', [riverX(-20) - 6, -20], 36, [60, 150], [5.5, 18.5], { rainMax: 0.5 }), E('mdCall', [riverX(70) - 6, 70], 36, [70, 160], [5.5, 18.5], { rainMax: 0.5 }),
  E('clothRustle', [261, 2], 10, [12, 30], [7, 16], { dry: true }),
  // the ox bells where carts and beasts stand: First Street, the street to the market, the granary's ramp
  E('mdOxBell', [62, -4], 22, [30, 80], [6, 18], { rainMax: 0.6 }), E('mdOxBell', [100, -40], 22, [40, 90], [6, 18], { rainMax: 0.6 }), E('mdOxBell', [GRANARY[0] + 25, GRANARY[3] + 14], 20, [40, 90], [6, 17], { rainMax: 0.6 }),
  // the sacks at the granary's loading ramp; the pipe in the Pillared Hall's assembly
  E('sack', [GRANARY[0] + 25, GRANARY[3] + 4], 14, [18, 46], [6, 17], { dry: true }),
  E('mdPipe', mid(PILLARED), 20, [90, 200], [8, 16], { rainMax: 0.3, after: true }),
  // the children in the lanes: the clay rattle and the bird whistle
  E('mdRattle', [-91, -40], 12, [60, 140], [8, 17], { dry: true }), E('mdWhistle', [-91, -55], 12, [70, 160], [8, 17], { dry: true }),
  E('mdRattle', [-4.9, 12], 12, [60, 140], [8, 17], { dry: true }), E('mdWhistle', [-4.9, -10], 12, [70, 160], [8, 17], { dry: true }),
  // the spotted owlet and the night's cattle at the river
  E('owl', [140, -150], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [-60, 200], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];

/** Passing sounds the scheduler plays along a track (voices.js `TRACKS`): the ox-carts on First Street and the cargo boats on the river. */
export const TRACKS = [
  { key: 'mdcart', voice: 'mdCart', speed: 1.3, r50: 16, gap: [35, 90], ok: (h, rain) => h >= 6 && h < 18.5 && rain < 0.6, get: (x, z, r) => (Math.abs(x - 62) < 90 ? { pts: r() < 0.5 ? [[62, Math.max(-200, z - 90)], [62, Math.min(200, z + 90)]] : [[62, Math.min(200, z + 90)], [62, Math.max(-200, z - 90)]] } : null) },
  { key: 'mdboat', voice: 'boat', speed: 1.0, r50: 18, gap: [60, 140], ok: (h, rain) => h >= 5.5 && h < 19 && rain < 0.7, get: (x, z, r) => { const z0 = Math.max(-150, Math.min(100, z)); return x > 160 ? { pts: [[riverX(z0 - 60) - 6, z0 - 60], [riverX(z0 + 60) - 6, z0 + 60]] } : null; } },
];
