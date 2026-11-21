// Where Rapa Nui's sounds are (docs/settlements/rapa-nui.md §10.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the surf along the shore, the carvers' toki at the quarry's camps, bark cloth beaten at the yard by the way up, the statue hauled down
// the road, the umu's stones at the plaza, the chant (riu) and the shell trumpet at dusk, a hen in the yards, a rat in the thatch at night, and the houses one can be inside.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-rapa-nui.js). Coordinates: metres, +x east, +z south, the settlement's frame. No bell, no horse, no dog, no pig: the island had
// none (§4e; chickens and the Polynesian rat only). What the scheduler asks of a map but this island has not (canals, ponds, bridges, street walkers, wells) is answered with nothing.
import '../../engine/voices-rapa-nui.js';
import { RADIUS, COAST, PLAZA, BAYS, ROAD, CHIEF, village, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival below the plaza). */
export const HOME = [0, 46];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const coastZ = (x) => COAST + 18 * Math.sin(x / 47) + 9 * Math.sin(x / 19 + 1);

/** The work heard from each kind of house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the house's use, §4f]. */
const WORK = {
  sleep: [['clothRustle', [50, 110], [6, 21]], ['rapScurry', [60, 140], [21, 4.5]]],
  cook: [['rapStones', [50, 110], [6, 19]], ['rapScurry', [80, 160], [21, 4.5]]],
  net: [['clothRustle', [30, 70], [7, 17]]],
  tapa: [['rapTapa', [40, 90], [7, 16]]],
  carver: [['rapToki', [30, 70], [7, 16]]],
  long: [['clothRustle', [40, 90], [6, 21]], ['rapScurry', [60, 120], [21, 4.5]]],
};
let SITES = null;
const rectOf = (h) => { const dx = Math.abs(Math.cos(h.yaw)) * h.len / 2 + Math.abs(Math.sin(h.yaw)) * h.w / 2, dz = Math.abs(Math.sin(h.yaw)) * h.len / 2 + Math.abs(Math.cos(h.yaw)) * h.w / 2; return [h.c[0] - dx, h.c[1] - dz, h.c[0] + dx, h.c[1] + dz]; };
/** The houses with sounds (the long house and the houses to enter): { use, rect (bounding), c, yaw, len, w, at, id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const h of village().houses) {
    if (!h.chief && !h.inside) continue;
    const use = h.chief ? 'long' : h.kind;
    SITES.push({ use, rect: rectOf(h), c: h.c, yaw: h.yaw, len: h.len, w: h.w, at: h.c, id: h.chief ? 'house:long' : `house:${h.seed}`, work: WORK[use], y: 0 });
  }
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

/** Whether (x, z) is under the roof of a house: its hull, an ellipse a little inside the boat shape. */
const within = (s, x, z) => { const dx = x - s.c[0], dz = z - s.c[1], u = dx * Math.cos(s.yaw) - dz * Math.sin(s.yaw), v = dx * Math.sin(s.yaw) + dz * Math.cos(s.yaw); return (u / (s.len / 2 - 0.5)) ** 2 + (v / (s.w / 2 - 0.1)) ** 2 < 1; };
/** The house the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z) {
  for (const s of sites()) if (inRect(s.rect, x, z) && within(s, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
/** What each kind of house sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch: soft), `hush` how much of the outdoors comes through (thatch lets much), `work`. */
const R0 = { tone: [420, 0.25], roof: 0.5, hush: 0.45, work: [['clothRustle', 60]] };
export const ROOMS_SOUND = {
  sleep: { ...R0, work: [['clothRustle', 60]] },
  cook: { ...R0, tone: [480, 0.3], work: [['rapStones', 60]] },
  net: { ...R0, work: [['clothRustle', 40]] },
  tapa: { ...R0, work: [['rapTapa', 50]] },
  carver: { ...R0, work: [['rapToki', 40]] },
  long: { ...R0, tone: [380, 0.3], roof: 0.45, hush: 0.5, work: [['clothRustle', 50]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER = { tone: [300, 0.1], roof: 0.5, hush: 0.5, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): grass and the gardens' leaves, little on the bare tuff or at the shore (the island was nearly treeless, §6). */
export function greenNear(x, z) { return 0.22 * (1 - sm(coastZ(x) - 30, coastZ(x), z)) + 0.05; }
export const leafNear = (x, z) => Math.min(0.3, greenNear(x, z));
/** There is no tree to put a bird in (§6). */
export const treeSpot = () => null;
/** 0…1: how much of the people's talk reaches (x, z): the plaza most, the forecourts some, little beyond. */
export function townNear(x, z) {
  if (inRect(PLAZA, x, z, 6)) return 1;
  const near = Math.hypot(x, z - 60);
  return Math.max(0.05, 0.6 * (1 - sm(40, 200, near)));
}
// what this island has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;
/** A place on the shore for a wave to wash: the listener within 40 m of the water's edge, a point on it near them. */
export function shoreSpot(x, z, rnd, reach = 40) {
  const px = x + (rnd() - 0.5) * 30, cz = coastZ(px) + 6;
  return Math.abs(cz - z) < reach && Math.hypot(px, cz) < RADIUS - 20 ? [px, cz] : null;
}

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const camps = BAYS.map((b, k) => [b, k]).filter(([, k]) => k % 2 === 0 || k === 5).map(([b]) => b.at);
export const EMITTERS = [
  // the surf along the whole shore, day and night, in reaches
  ...[-160, -110, -60, -10, 40, 90, 140, 190].map((x) => E('rapSurf', [x, coastZ(x) + 8], 38, [5, 9], [0, 24], { rainMax: 1 })),
  // the carvers' toki at the quarry's camps (§4d)
  ...camps.map(([x, z]) => E('rapToki', [x, z], 16, [30, 70], [7, 16], { dry: true })),
  // bark cloth beaten in the yard by the way up, and at the chief's house
  E('rapTapa', [-12.5, 54], 12, [40, 90], [7, 16], { dry: true }),
  E('rapTapa', [CHIEF.c[0] + 4, CHIEF.c[1] + 6], 10, [60, 120], [8, 15], { dry: true }),
  // the umu: stones laid in the plaza's feast ovens in the afternoon, and at the yard's hearth
  ...[[-34, 71], [37, 69], [-16, 94]].map(([x, z]) => E('rapStones', [x, z], 12, [70, 150], [14, 19], { dry: true })),
  E('rapStones', [8, 60], 9, [60, 130], [6, 19], { dry: true }),
  // a statue hauled down the road on its ropes (§4b)
  E('rapHaul', [ROAD[1][0], ROAD[1][1]], 30, [25, 60], [7, 16], { dry: true }),
  // hens in the yards by the way up
  ...[[14, 57.5], [-5.5, 61], [-18, 50]].map(([x, z]) => E('rapHen', [x, z], 8, [14, 40], [6, 19], { rainMax: 0.6 })),
  // the evening: the chant on the plaza, the shell trumpet at dawn and dusk from the ahu's platform [inferred]
  E('rapRiu', [0, 74], 45, [140, 300], [17, 21.5], { rainMax: 0.3, after: true }),
  E('rapPu', [0, 96], 90, [200, 420], [5.5, 6.8], { rainMax: 0.4 }),
  E('rapPu', [0, 96], 90, [200, 420], [17, 18.6], { rainMax: 0.4 }),
];
