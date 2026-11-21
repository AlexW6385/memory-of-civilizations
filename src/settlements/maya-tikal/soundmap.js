// Where Tikal's sounds are (docs/settlements/maya-tikal.md §18): the places of its emitters and the geometry the audio engine needs to put each sound where it is made —
// the conch and the drum of the temples at the hours of the rites, the flute and the rattle at the stelae and the procession, the plasterers renewing the plaza's floor, the
// market on the East Plaza and its sellers' cries, the craftsmen's houses (knapper, potter, weaver, cook, painter) and the palace rooms one can be inside, the turkeys of the
// patio groups, the macaws overhead and the howler monkeys of the forest at dawn and dusk, the owls and frogs of the night. Pure data and functions of layout.js and walk.js
// (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-tikal.js).
// Coordinates: metres, +x east, +z south, the settlement's own frame. [inferred throughout: no recording of the eighth century exists; what each sound is and when rests on the dossier §18.]
import '../../engine/voices-tikal.js';
import { RADIUS, T1, T2, T4, NA, NA_TEMPLE, RESERVOIRS, resDist, groups, inCore, inRect, CORE } from './layout.js';
import { houseFrame, rangeRooms, PLATFORM, ARRIVAL } from './walk.js';
import plaza from './plan.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the Great Plaza). */
export const HOME = ARRIVAL;
/** A deterministic 0…1 from numbers (the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const MARKET = [84, 22, 140, 64];

/** The work heard from each craftsman's house: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the craft] */
const CRAFT_WORK = {
  obsidian: [['tikKnap', [14, 32], [7, 17]]],
  potter: [['clay', [14, 30], [6.5, 17]]],
  cloth: [['tikLoom', [14, 32], [7, 17.5]]],
  cook: [['tikMetate', [24, 55], [4.2, 9.5]], ['kitchen', [20, 45], [5, 19.5]]],
  painter: [['clothRustle', [30, 80], [7, 16.5]]],
};
/** What each trade of the market hall's rooms is heard doing. */
const HALL_WORK = [['jarLid', [30, 80], [7, 16.5]], ['clothRustle', [30, 70], [7, 16.5]]];

let SITES = null;
/**
 * The rooms with sounds: the craftsmen's houses, the market hall's rooms, the vaulted rooms of the palace ranges, the chambers of the temples' shrines —
 * { use, rect, at: [x, z] (the middle), id, work, y (the floor) }.
 */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const g of groups().filter((q) => q.ward)) g.houses.forEach((h, k) => {
    const hx = h.dir === 'x' ? h.w : h.d, hz = h.dir === 'x' ? h.d : h.w;
    const r = [h.c[0] - hx / 2 + 0.2, h.c[1] - hz / 2 + 0.2, h.c[0] + hx / 2 - 0.2, h.c[1] + hz / 2 - 0.2];
    SITES.push({ use: h.craft === 'cook' ? 'hearth' : 'workshop', rect: r, at: mid(r), id: `craft:${g.rect[1]}:${k}`, work: CRAFT_WORK[h.craft], y: PLATFORM });
    void houseFrame;
  });
  for (const e of plaza.elements) {
    if (e.t !== 'k_range' || !e.furn) continue;
    const hall = e.c[0] === 141 && e.c[1] === 43, cabin = (i) => rangeRooms(e)[i];
    rangeRooms(e).forEach((r, i) => {
      const x = r.F.R(1.2, 3.9, r.vc - 1.9, r.vc + 1.9);
      SITES.push({ use: hall ? 'stall' : 'hall', rect: x, at: mid(x), id: `room:${e.c[0]}:${e.c[1]}:${i}`, work: hall ? HALL_WORK : [], y: e.y ?? 0 });
      void cabin;
    });
  }
  // the shrines' chambers on the temples' summits: the first chamber of Temple I and II (len 7 and 8, 8.5 and 14.5 m half-widths of the summit)
  SITES.push({ use: 'shrine', rect: [T1.c[0] - T1.top[0] + 1.8, -3, T1.c[0] - T1.top[0] + 6, 3], at: [T1.c[0] - T1.top[0] + 3.9, 0], id: 'temple1', work: [['tikRattle', [60, 140], [5.5, 18.5]]], y: T1.H });
  SITES.push({ use: 'shrine', rect: [T2.c[0] + T2.top[0] - 6, -3, T2.c[0] + T2.top[0] - 1.8, 3], at: [T2.c[0] + T2.top[0] - 3.9, 0], id: 'temple2', work: [['tikRattle', [60, 140], [5.5, 18.5]]], y: T2.H });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let GRID = null;
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: hearth, workshop, stall (the market hall), hall (a palace room), shrine. */
export function roomAt(x, z, y = 0) {
  if (!GRID) { GRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 24); i <= Math.floor(s.rect[2] / 24); i++) for (let j = Math.floor(s.rect[1] / 24); j <= Math.floor(s.rect[3] / 24); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(s); } }
  for (const s of GRID.get(Math.floor(x / 24) + ',' + Math.floor(z / 24)) || []) if (inRect(s.rect, x, z) && y > s.y - 0.6 && y < s.y + 3.4) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness (thatch or the vault's slab), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  hearth: { tone: [300, 0.3], roof: 0.8, hush: 0.7, work: [['kitchen', 30], ['tikMetate', 70]] },
  workshop: { tone: [320, 0.3], roof: 0.8, hush: 0.7, work: [['clothRustle', 60]] },
  stall: { tone: [260, 0.2], roof: 0.9, hush: 0.6, work: [['jarLid', 40]] },
  hall: { tone: [200, 0.2], roof: 0.9, hush: 0.5, work: [['clothRustle', 80]] },
  shrine: { tone: [150, 0.3], roof: 0.7, hush: 0.4, work: [['clothRustle', 120]] },
};
export const UPPER = { tone: [230, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the plastered plazas have little, the forest about the core a great deal (kapok, cedar, ramón). */
export function greenNear(x, z) { return inRect([-60, -125, 60, 128], x, z) ? 0.25 : Math.max(0.35, 0.95 * sm(0, 90, Math.hypot(Math.max(Math.abs(x) - 140, 0), Math.max(Math.abs(z) - 150, 0)))); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.95);
/** A tree to put a cicada or a bird in, near (x, z): the forest outside the core, or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !inCore(px, pz, 4) && hash(Math.floor(px / 9), Math.floor(pz / 9)) < 0.5) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the market's murmur reaches (x, z): full on the East Plaza, a good deal on the Great Plaza, little in the forest. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 6)) return 1;
  const d = Math.hypot(Math.max(MARKET[0] - x, 0, x - MARKET[2]), Math.max(MARKET[1] - z, 0, z - MARKET[3]));
  const plazaK = inRect([-36, -42, 36, 42], x, z) ? 0.55 : 0;
  return Math.min(1, Math.max(0.12, plazaK, 0.8 * (1 - sm(10, 260, d))));
}
// what Tikal has none of (the engine's scheduler asks, and is answered with nothing): no canals, no bridges, no bamboo, no lotus; the reservoirs' frogs are answered by frogGround
export const canalSpot = () => null;
export const shoreSpot = () => null;
export const pondSpot = () => null;
export const frogGround = (x, z) => (RESERVOIRS.some((R) => resDist(R, x, z) < 14 && resDist(R, x, z) > -2) ? 0.9 : 0);
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const TRACKS = [];

// ── the emitters in the open ─────────────────────────────────────────────────
const SUMMIT_1 = [T1.c[0] - T1.top[0] + 3, 0], SUMMIT_2 = [T2.c[0] + T2.top[0] - 3, 0], SUMMIT_NA = [NA_TEMPLE.c[0], NA_TEMPLE.c[1]], SUMMIT_4 = [T4.c[0] + 10, 0];
const mm = mid(MARKET), HAWKERS = [[92, 30], [105, 40], [118, 30], [128, 48], [96, 52], [112, 58], [132, 38], [100, 28]];
const rimOf = (R, k) => [R.c[0] + Math.cos(k) * (R.a + 1.5), R.c[1] + Math.sin(k) * (R.b + 1.5)];
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours: [from, to] }, with `dry`, `rainMax`, `lv`, `after`.
 * The rooms' own work comes from sites().
 */
export const EMITTERS = [
  // the rites: the conch from the summits of Temple I, Temple II and the great temple of the North Acropolis at dawn, noon and dusk, the drum at the stair's foot
  ...[[5.3, 6.6], [11.6, 12.6], [17.3, 18.5]].flatMap(([a, b], i) => [
    { voice: 'tikConch', at: SUMMIT_1, r50: 130, gap: [80, 180], hours: [a, b], after: true, rainMax: 0.9 },
    { voice: 'tikConch', at: SUMMIT_2, r50: 120, gap: [100, 220], hours: [a, b], after: true, rainMax: 0.9 },
    { voice: 'tikConch', at: SUMMIT_NA, r50: 100, gap: [110, 240], hours: [a, b], after: true, rainMax: 0.9, lv: 0.9 },
    { voice: 'tikDrum', at: [30, 0], r50: 80, gap: [70, 160], hours: [a, b], after: true, rainMax: 0.8, lv: i === 1 ? 0.8 : 1 },
  ]),
  { voice: 'tikConch', at: SUMMIT_4, r50: 110, gap: [140, 300], hours: [5.5, 6.5], after: true, rainMax: 0.9, lv: 0.8 },
  // the procession along the plaza: the flute and the rattle with the drum, in the morning
  { voice: 'tikFlute', at: [10, 0], r50: 40, gap: [60, 140], hours: [7, 11], after: true, rainMax: 0.3 },
  { voice: 'tikRattle', at: [31, 0], r50: 34, gap: [40, 110], hours: [6.2, 11.5], after: true, rainMax: 0.4 },
  // the plasterers renewing the plaza's floor (plan: the two patches at (14, -26) and (-16, -22))
  { voice: 'tikPlaster', at: [14, -26], r50: 16, gap: [16, 40], hours: [7, 16.5], rainMax: 0.1 },
  { voice: 'tikPlaster', at: [-16, -22], r50: 16, gap: [22, 50], hours: [7, 16.5], rainMax: 0.1 },
  // the market: the flute and the drum at its middle, the sellers' cries at their places
  { voice: 'tikFlute', at: [mm[0] + 4, mm[1] + 2], r50: 30, gap: [70, 160], hours: [8.5, 16], after: true, rainMax: 0.3 },
  { voice: 'tikDrum', at: mm, r50: 50, gap: [100, 220], hours: [8, 15.5], after: true, rainMax: 0.5, lv: 0.6 },
  ...HAWKERS.map((at, i) => ({ voice: 'tikCry', at, r50: 15, gap: [20 + i * 3, 60 + i * 6], hours: [6.2, 16.5], rainMax: 0.5 })),
  // the turkeys of the patio groups nearest the core, and of the market's lanes
  ...groups().filter((g) => Math.hypot((g.rect[0] + g.rect[2]) / 2, (g.rect[1] + g.rect[3]) / 2) < 200).slice(0, 14).map((g, i) => ({ voice: 'tikTurkey', at: [g.rect[0] + 6, (g.rect[1] + g.rect[3]) / 2 + 3], r50: 12, gap: [30 + i * 4, 90 + i * 6], hours: [5.5, 18.5], rainMax: 0.6 })),
  { voice: 'tikTurkey', at: [mm[0] + 20, mm[1] + 10], r50: 12, gap: [40, 100], hours: [6, 18], rainMax: 0.6 },
  // women washing and filling jars at the reservoirs' rims, by day
  ...RESERVOIRS.flatMap((R, i) => [{ voice: 'clothRustle', at: rimOf(R, i ? 3.1 : -1.5), r50: 10, gap: [12, 30], hours: [6.5, 16], dry: true }, { voice: 'pour', at: rimOf(R, i ? 3.6 : -1.1), r50: 10, gap: [30, 70], hours: [6, 17], dry: true }]),
  // the forest: macaws passing over at dawn and dusk, howler monkeys far off (the forest all round, the troop's roar carries for kilometres)
  ...[[-120, -190], [160, -200], [-180, 150], [220, 160]].map(([x, z], i) => ({ voice: 'tikMacaw', at: [x, z], r50: 60, gap: [30 + i * 5, 80 + i * 8], hours: [5.2, 8.5], rainMax: 0.5 })),
  ...[[-120, -190], [160, -200], [-180, 150], [220, 160]].map(([x, z], i) => ({ voice: 'tikMacaw', at: [x, z], r50: 60, gap: [40 + i * 5, 100 + i * 8], hours: [16.5, 18.5], rainMax: 0.5 })),
  { voice: 'tikHowler', at: [-230, -210], r50: 230, gap: [90, 220], hours: [4.2, 6.6], rainMax: 0.7 },
  { voice: 'tikHowler', at: [240, 170], r50: 230, gap: [110, 260], hours: [4.4, 6.8], rainMax: 0.7 },
  { voice: 'tikHowler', at: [-200, 230], r50: 230, gap: [130, 300], hours: [17, 18.8], rainMax: 0.7 },
  // the owls of the night
  { voice: 'tikOwl', at: [-150, -100], r50: 60, gap: [40, 110], hours: [20, 4.5], rainMax: 0.5 },
  { voice: 'tikOwl', at: [190, 120], r50: 60, gap: [50, 130], hours: [20.5, 4], rainMax: 0.5 },
];
void NA; void CORE;
