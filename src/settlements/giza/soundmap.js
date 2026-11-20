// Where Giza's sounds are (docs/settlements/giza.md §20): the stone-workers' mallets and pounders at the quarry and the works, the haulers on the
// ropes (at the arrival, the ramp, the quarry road, the landing), the bakeries' pots and the querns of the houses, the women washing at the quay, the
// stevedores, the boats of the harbour, the priests' chant at the temples at dawn and dusk, kites, donkeys, geese and the jackals of the plateau's edge by night.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-giza.js and Thebes' thb ones, reused). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout.]
// Not at Giza: bells, a call to prayer, a watchman's rounds; the engine's asks about bridges, streets and bamboo are answered with nothing.
import { RADIUS, TEMPLE, VALLEY_TEMPLE, HARBOUR, QUARRY, CROW_WALL, town, furnished, inRect } from './layout.js';
import { HAUL } from './camps.js';
import { RAMP } from './works.js';
import { STALLS } from './rations.js';

/** Where the audio puts the listener when the engine gives none (the arrival). */
export const HOME = [242, -50];
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The household's and the workshops' own sounds: [voice, gap [min, max] s, hours [from, to]]. */
const WORK = {
  house: [['kitchen', [16, 34], [5, 20]], ['thbQuern', [40, 90], [4.5, 9]]],
  bakery: [['gizPots', [12, 28], [3.5, 11]], ['gizBrew', [30, 70], [4, 12]], ['thbQuern', [40, 90], [3.5, 8]]],
  gallery: [['clothRustle', [40, 90], [4, 8]]],
};
let SITES = null;
/** The houses, bakeries and galleries with sounds: { use, rect, at, id, work, y }. Furnished houses only. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of town()) {
    if (l.kind === 'yard' || (l.kind === 'house' && !furnished(l))) continue;
    const use = l.kind;
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: use + ':' + l.rect[0].toFixed(0) + ',' + l.rect[1].toFixed(0), work: WORK[use] || [], y: 0 });
  }
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE_ZONE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [['hall', 'hall', TEMPLE], ['valley-hall', 'hall', VALLEY_TEMPLE]];
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
const R0 = { tone: [320, 0.25], roof: 0.5, hush: 0.75, work: [['kitchen', 40]] };
export const ROOMS = {
  house: R0,
  bakery: { tone: [360, 0.3], roof: 0.5, hush: 0.9, work: [['gizPots', 20], ['gizBrew', 60]] },
  gallery: { tone: [260, 0.2], roof: 0.5, hush: 0.8, work: [['clothRustle', 70]] },
  hall: { tone: [140, 0.3], roof: 0.3, hush: 0.4, work: [['clothRustle', 90]] },
};
export const UPPER = { tone: [260, 0.14], roof: 0.6, hush: 0.7, work: [['clothRustle', 50]] };

// ── the green, the town, the water ───────────────────────────────────────────
/** 0…1: how much green round (x, z): the date palms and reeds of the valley by the harbour; the town's few shade trees; the plateau none. */
export function greenNear(x, z) { return Math.max(0.05, 1 - sm(0, 60, Math.max(0, 322 - x)) * 0.95, 0.1 * (1 - sm(0, 60, rectDist([-160, 165, 230, 360], x, z)))); }
export const leafNear = (x) => (x > 320 ? 0.8 : 0.05);
/** A palm of the valley near (x, z) to put a bird or an insect in, or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  if (x < 250) return null;
  for (let k = 0; k < 16; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (px > 332 && px < 420 && !inRect(HARBOUR, px, pz)) return [px, pz]; }
  return null;
}
/** 0…1: how much of the works' and town's hubbub reaches (x, z). */
export function townNear(x, z) {
  if (inRect(QUARRY, x, z, 30) || rectDist([170, -112, 272, 4], x, z) < 20 || inRect([HARBOUR[0] - 12, 14, HARBOUR[0] + 10, 100], x, z)) return 1;
  if (z > 160 && Math.hypot(x, z) < RADIUS - 20) return 0.9;
  return 0.25;
}
/** The harbour's stone face (the quay, x = HARBOUR[0]) within 24 m: the lap of the water at the stone. */
export function canalSpot(x, z) {
  const d = Math.abs(x - HARBOUR[0]);
  if (x < HARBOUR[0] - 24 || d > 24 || z < HARBOUR[1] - 20 || z > HARBOUR[3] + 20) return null;
  return { p: [HARBOUR[0] + 0.6, Math.max(HARBOUR[1], Math.min(HARBOUR[3], z))], d };
}
export const shoreSpot = () => null;
/** A point on the harbour's water within `reach` of the listener (a fish rises by day), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (rectDist(HARBOUR, x, z) > reach) return null;
  return [HARBOUR[0] + 4 + rnd() * (HARBOUR[2] - HARBOUR[0] - 6), HARBOUR[1] + 2 + rnd() * (HARBOUR[3] - HARBOUR[1] - 4)];
}
/** 0…1: how marshy the ground is (the frogs of the reeds at night): the harbour's open edges. */
export const frogGround = (x, z) => (rectDist(HARBOUR, x, z) < 30 && x > HARBOUR[0] + 6 ? 0.8 : 0);
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;

/** A reach of the harbour for a boat to pass along (paddled and poled), within 70 m of the listener. */
function harbourTrack(x, z, rnd) {
  if (rectDist(HARBOUR, x, z) > 70) return null;
  const lane = HARBOUR[0] + 14 + rnd() * 24, a = HARBOUR[1] + 4, b = HARBOUR[3] - 4;
  return { pts: rnd() < 0.5 ? [[lane, a], [lane, b]] : [[lane, b], [lane, a]] };
}
export const TRACKS = [
  { key: 'harbourboat', voice: 'thbBoat', speed: 1.3, r50: 16, gap: [30, 75], ok: (hour, rain) => hour >= 5.5 && hour < 19 && rain < 0.6, get: (x, z, r) => harbourTrack(x, z, r) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const quarryMid = mid(QUARRY), templeMid = mid(TEMPLE), vtMid = mid(VALLEY_TEMPLE);
/** Fixed emitters: { voice, at, r50, gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
export const EMITTERS = [
  // the stone-workers: the quarry's pounders and mallets, the masons at the stacks by the arrival, the lodges' workshops
  { voice: 'gizPounder', at: [quarryMid[0] - 12, quarryMid[1]], r50: 26, gap: [14, 30], hours: [6, 17.5] },
  { voice: 'gizMallet', at: [quarryMid[0] + 6, quarryMid[1] + 4], r50: 22, gap: [16, 36], hours: [6, 17.5] },
  { voice: 'gizMallet', at: [214, -75], r50: 18, gap: [14, 30], hours: [6, 17.5] },
  { voice: 'gizMallet', at: [206, -55], r50: 18, gap: [18, 38], hours: [6, 17.5] },
  { voice: 'gizMallet', at: [190, -90], r50: 14, gap: [20, 40], hours: [6.5, 17] },
  // the haulers on their ropes: at the arrival, on the ramp, on the quarry's road, on the landing
  { voice: 'gizHaul', at: HAUL.at, r50: 24, gap: [22, 48], hours: [6, 17.5] },
  { voice: 'gizHaul', at: [RAMP.sledge - 6, RAMP.z], r50: 24, gap: [26, 54], hours: [6, 17.5] },
  { voice: 'gizHaul', at: [118, 122], r50: 24, gap: [28, 60], hours: [6, 17.5] },
  { voice: 'gizHaul', at: [343, 52], r50: 24, gap: [30, 64], hours: [6, 17.5] },
  // the quay: women washing linen, the stevedores, geese, a donkey
  ...[[HARBOUR[0] + 4, 22], [HARBOUR[0] + 4, 36]].map((at, i) => ({ voice: 'gizWash', at, r50: 14, gap: [24 + i * 6, 60 + i * 8], hours: [6, 16.5], rainMax: 0.5 })),
  ...[[HARBOUR[0] + 2.5, 30], [HARBOUR[0] + 2.5, 70], [HARBOUR[0] + 2.5, 90]].map((at, i) => ({ voice: 'thbStevedores', at, r50: 18, gap: [28 + i * 5, 70 + i * 6], hours: [5.5, 18] })),
  { voice: 'thbGeese', at: [HARBOUR[0] + 8, 60], r50: 26, gap: [20, 56], hours: [5.5, 19] },
  { voice: 'thbDonkey', at: [HARBOUR[0] - 6, 100], r50: 40, gap: [70, 200], hours: [5.5, 19] },
  // the ration stalls' calls (wordless) by day
  ...STALLS.map((S, i) => ({ voice: 'thbHawk', at: S.at, r50: 12, gap: [26 + i * 4, 70 + i * 6], hours: [6, 13], rainMax: 0.5 })),
  // the temples' rites: the chant in the hall at the first light and at dusk, the sistrum and the clapping at the door
  { voice: 'thbChant', at: templeMid, r50: 30, gap: [30, 70], hours: [5.6, 7.2], after: true },
  { voice: 'thbChant', at: templeMid, r50: 30, gap: [40, 90], hours: [17.4, 18.6], after: true },
  { voice: 'thbChant', at: vtMid, r50: 24, gap: [60, 140], hours: [5.8, 7], after: true },
  { voice: 'thbSistrum', at: [TEMPLE[2] + 3, -40], r50: 24, gap: [40, 100], hours: [5.6, 7.2] },
  { voice: 'thbClap', at: [TEMPLE[2] + 6, -42], r50: 24, gap: [70, 160], hours: [5.8, 7], after: true },
  // kites over the plateau and the town, doves on the roofs of the town
  { voice: 'thbKite', at: [0, -40], r50: 80, gap: [25, 70], hours: [7, 17.5] },
  { voice: 'thbKite', at: [-240, -60], r50: 70, gap: [35, 90], hours: [7, 17.5] },
  { voice: 'thbKite', at: [60, 260], r50: 70, gap: [35, 90], hours: [7, 17.5] },
  ...[[-20, 240], [40, 290], [120, 250]].map((at, i) => ({ voice: 'thbDove', at, r50: 14, gap: [20 + i * 3, 60 + i * 5], hours: [5.5, 18.5] })),
  // donkeys in the town and the camps; the jackals of the plateau's edge by night
  { voice: 'thbDonkey', at: [60, 280], r50: 40, gap: [90, 240], hours: [5.5, 19] },
  { voice: 'thbDonkey', at: [238, -22], r50: 40, gap: [90, 240], hours: [5.5, 19] },
  { voice: 'thbJackal', at: [-300, -100], r50: 85, gap: [60, 160], hours: [19.8, 4.5], rainMax: 0.5, after: true },
  { voice: 'thbJackal', at: [300, -140], r50: 85, gap: [90, 220], hours: [20.5, 4], rainMax: 0.5, after: true },
];
void CROW_WALL;
