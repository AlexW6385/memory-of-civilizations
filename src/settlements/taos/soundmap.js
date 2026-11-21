// Where Taos Pueblo's sounds are (docs/settlements/taos.md §10.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the grinding under the racks, the looms, hide work, the potter's stone and the knapper's chips in the rooms, the cook yards and the mud
// yards, the turkey pens, the splitting of wood, Red Willow Creek, a drum and a flute in the evening, coyotes and owls at night, the rooms one can be inside.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-taos.js). Coordinates: metres, +x east, +z south, the settlement's frame. No horse, no bell, no cart: nothing of the
// Spanish yet (c. 1500). What the scheduler asks of a map but Taos has not (canals, ponds, bridges, street walkers, wells) is answered with nothing.
import '../../engine/voices-taos.js';
import { RADIUS, CELL, NORTH, SOUTH, ROOMS, UPPER, YARDS, PENS, PLAZA, ARRIVE, creekZ, inRect, inHouses } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the plaza). */
export const HOME = [ARRIVE.at[0], ARRIVE.at[1]];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ST = 2.7;

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the room's use, docs §4.5: the engine's own voices where they fit]. */
const WORK = {
  home: [['taoMetate', [40, 90], [5.5, 11]], ['kitchen', [30, 70], [5, 20]]],
  weave: [['taoBatten', [12, 28], [7, 17]]],
  sleep: [['clothRustle', [50, 110], [6, 21]]],
  work: [['taoScrape', [18, 40], [7, 17]], ['taoKnap', [30, 70], [7, 17]]],
  pottery: [['taoPolish', [16, 36], [7, 17]], ['clay', [20, 50], [7, 17]]],
  store: [['jarLid', [30, 70], [6.5, 17]], ['sack', [50, 110], [7, 17]]],
};
let SITES = null;
const cellRect = (B, r) => { const x0 = B.x0 + r.j * CELL, z0 = B.z0 + r.i * CELL; return [x0, z0, x0 + CELL, z0 + CELL]; };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The rooms with sounds: { use, rect, at: [x, z] (the middle), id: 'room:N<j>' (ground) or 'up:N<i>_<j>', work, y (the floor) }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const r of ROOMS) { const B = r.b === 'N' ? NORTH : SOUTH, rect = cellRect(B, r), use = r.kind ?? 'home'; if (WORK[use]) SITES.push({ use, rect, at: mid(rect), id: `room:${r.b}${r.j}`, work: WORK[use], y: 0 }); }
  for (const r of UPPER) { const B = r.b === 'N' ? NORTH : SOUTH, rect = cellRect(B, r); if (WORK[r.kind]) SITES.push({ use: r.kind, rect, at: mid(rect), id: `up:${r.b}${r.i}_${r.j}`, work: WORK[r.kind], y: (r.storey - 1) * ST }); }
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const lotAt = (x, z, y) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z) && y > s.y - 0.6 && y < s.y + ST - 0.1);
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z, y);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a thick earth roof: soft), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [240, 0.2], roof: 0.45, hush: 0.7, work: [['clothRustle', 50]] };
export const ROOMS_SOUND = {
  home: { ...R0, tone: [300, 0.3], work: [['taoMetate', 40]] },
  weave: { ...R0, work: [['taoBatten', 14]] },
  sleep: { ...R0, tone: [220, 0.2], hush: 0.6 },
  work: { ...R0, tone: [280, 0.25], work: [['taoScrape', 20]] },
  pottery: { ...R0, tone: [280, 0.25], work: [['taoPolish', 18]] },
  store: { ...R0, tone: [200, 0.2], hush: 0.6, work: [['jarLid', 50]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER_SOUND = { tone: [230, 0.12], roof: 0.5, hush: 0.7, work: [['clothRustle', 40]] };
export { UPPER_SOUND as UPPER };

// ── the planting, the town ──────────────────────────────────────────────────
const creekDist = (x, z) => Math.abs(z - creekZ(x));
/** 0…1: how much green round (x, z): the cottonwoods and willows of Red Willow Creek, the maize fields beyond the wall in summer; little on the plaza. */
export function greenNear(x, z) {
  const creek = 1 - sm(0, 45, creekDist(x, z)), fields = sm(130, 175, Math.hypot(x, z)) * (1 - sm(250, 300, Math.hypot(x, z))) * 0.7;
  return Math.max(creek * 0.85, fields, 0.15);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z), or null: the cottonwoods and willows along the creek. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && creekDist(px, pz) > 5 && creekDist(px, pz) < 22 && !inHouses(px, pz, 1)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's talk reaches (x, z): the plaza most, the alleys and the creek's banks some, little beyond the wall. */
export function townNear(x, z) {
  if (inRect(PLAZA, x, z)) return 1;
  if (inHouses(x, z, 6)) return 0.7;
  return Math.max(0.06, 0.7 * (1 - sm(150, 260, Math.hypot(x, z))));
}
// what Taos has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** Frogs by the creek in the warm months (the chorus frog of the high valleys [inferred]). */
export const frogGround = (x, z) => (creekDist(x, z) < 8 && Math.hypot(x, z) < RADIUS - 30 ? 0.5 : 0);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const bank = (x) => [x, creekZ(x)];
export const EMITTERS = [
  // the grinding under the racks: a mano on the metate, a woman humming between strokes, in the morning
  ...[-52, -17, 18, 30].map((x) => E('taoMetate', [x, -42.8], 12, [40, 90], [5.5, 11], { dry: true })),
  // the cook yards (the griddle's bread, the steaming pit): pots and the kitchen's clatter
  ...YARDS.cook.map(([x, z]) => E('kitchen', [x + 1.3, z], 10, [30, 70], [6, 19], { dry: true })),
  // the mud yards: mud laid on the wall by hand
  ...YARDS.mud.map(([x, z]) => E('taoMudSlap', [x, z], 14, [20, 50], [7, 16], { dry: true })),
  // the wood split at the houses' feet (the stacked vigas and piñon)
  ...YARDS.vigas.map(([x, z]) => E('taoChop', [x, z], 18, [30, 80], [7, 16], { dry: true })),
  // the turkeys in their pens
  ...PENS.map(([x, z]) => E('taoGobble', [x, z], 16, [16, 44], [6, 19], { rainMax: 0.6 })),
  // Red Willow Creek, in reaches along the plaza and beyond
  ...[-120, -80, -40, 0, 40, 80, 120].map((x) => E('taoCreek', bank(x), 20, [6, 11], [0, 24], { rainMax: 1 })),
  // the evening: a man drumming at his door below the North House, with a few voices (not a ceremony); a rattle with it; a flute from a roof of the South House
  E('taoDrum', [-10, -38], 40, [100, 240], [17, 22], { rainMax: 0.3, after: true }),
  E('taoSong', [-10, -38], 36, [120, 260], [17.5, 22], { rainMax: 0.3, after: true }),
  E('taoRattle', [-8, -38], 32, [160, 320], [17.5, 22], { rainMax: 0.3, after: true }),
  E('taoFlute', [20, 52], 40, [120, 280], [18.5, 22.5], { rainMax: 0.3, after: true }),
  // the night: owls from the cottonwoods, coyotes on the mesa
  E('owl', [-60, 20], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [90, -10], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
  E('taoCoyote', [-250, -120], 120, [90, 260], [21, 5], { rainMax: 0.3 }), E('taoCoyote', [240, 90], 120, [120, 300], [21.5, 4.5], { rainMax: 0.3 }),
];
