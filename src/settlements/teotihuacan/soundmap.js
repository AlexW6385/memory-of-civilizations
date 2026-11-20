// Where Teotihuacan's sounds are (docs/settlements/teotihuacan.md §20): the places of its emitters and the geometry the audio engine needs to put each
// sound where it is made — the shell trumpets and the drum of the temples at the hours of the rites, the flute and the drum of the market, the market's murmur
// (the engine's hubbub, laid by townNear) and its sellers' cries, the masons laying the plazas' floors, the sweepers at dawn, the households' metates and
// tortillas, the knappers', the potters' and the weavers' work in the craft houses, the turkeys of the yards, the owls of the night, and the rooms one can be inside.
// Pure data and functions of layout.js, walk.js and dress.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js (the voices of src/engine/voices-teotihuacan.js). Coordinates: metres, +x east, +z south, the settlement's own frame.
// [inferred throughout: no recording of the fifth century exists; what each sound is and when rests on the dossier §20.]
//
// What the scheduler of voices.js asks of a map but Teotihuacan has not is answered with nothing (no water, no bridges, no bamboo, no lotus beds, no street track).
import { RADIUS, MARKET, MOON, SUN, PLAZA, QPP, JAGUARS, LEVELS, compounds, lodges, platformTemples, inRect } from './layout.js';
import { lodgeGeom } from './walk.js';
import { avenueItems } from './dress.js';
import { roomDoors } from '../../styles/teotihuacano/doors.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the avenue's plaza: planet/arrivals.js). */
export const HOME = [0, 70];

/** A deterministic 0…1 from numbers (the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The work heard from each craft room: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the craft] */
const CRAFT_WORK = {
  workshop: [['tthKnap', [14, 32], [7, 17]]],
  potter: [['clay', [14, 30], [6.5, 17]]],
  weaver: [['tthWeave', [14, 32], [7, 17.5]]],
};
/** What every hearth room hears: the maize ground at the metate before the day's first meal, the tortillas patted for each of the three meals, the pots. */
const HEARTH_WORK = [['tthMetate', [26, 60], [4.2, 9.5]], ['tthTortilla', [24, 50], [5.5, 9]], ['tthTortilla', [40, 90], [13, 15]], ['tthTortilla', [30, 70], [17.5, 19.5]], ['kitchen', [26, 60], [5.5, 20]]];

let SITES = null;
const PH = { lodge: 1.1 };
/**
 * The rooms with sounds: each room of the houses of the avenue's servants (the kitchen's hearth, the priest's shrine, the craft rooms), the kitchens of the
 * opened compounds, the chambers of the big temples, the palace's and the Jaguars' halls — { use, rect, at: [x, z] (the middle), id, work, y (the floor) }.
 */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  // the rooms behind each house's portico, one site per room (the front room and the one behind it as one): roles as styles/teotihuacano/houses.js
  lodges().forEach((l, i) => {
    const g = lodgeGeom(l), [x0, z0, x1, z1] = l.rect, pd = l.kind === 'lodge' ? 2.8 : 2.4, craft = ['workshop', 'potter', 'weaver'].includes(l.kind);
    const roles = l.kind === 'lodge' ? (g.nr === 3 ? ['sleep', 'shrine', 'sleep'] : ['shrine', 'sleep']) : craft ? [l.kind, 'sleep'] : (g.nr === 3 ? ['sleep', 'kitchen', 'store'] : ['sleep', 'kitchen']);
    const back = g.fx ? (g.fx > 0 ? [x0, z0, x1 - pd, z1] : [x0 + pd, z0, x1, z1]) : (g.fz > 0 ? [x0, z0, x1, z1 - pd] : [x0, z0 + pd, x1, z1]), n = roles.length;
    const U0 = g.fx ? back[1] : back[0], U1 = g.fx ? back[3] : back[2], cell = (U1 - U0) / n;
    roles.forEach((role, j) => {
      const u0 = U0 + j * cell, u1 = u0 + cell, r = g.fx ? [back[0], u0, back[2], u1] : [u0, back[1], u1, back[3]];
      const use = role === 'kitchen' ? 'hearth' : role === 'shrine' ? 'shrine' : CRAFT_WORK[role] ? 'workshop' : 'house';
      const work = use === 'hearth' ? HEARTH_WORK : CRAFT_WORK[role] ? [...CRAFT_WORK[role], ['kitchen', [60, 140], [6, 19]]] : use === 'shrine' ? [['tthRattle', [60, 140], [5.5, 18.5]]] : [];
      SITES.push({ use, rect: r, at: mid(r), id: `lodge:${i}:${j}`, work, y: l.y + g.ph });
    });
  });
  // the kitchens of the opened compounds: the west block's first room (compounds' main patio, rooms.js; rooms 3.2–3.6 m across, 2.6 m portico)
  for (const c of compounds().filter((q) => q.open)) {
    const [x0, z0, x1, z1] = c.rect, cw = (x1 - x0 - 2) / 3, cd = (z1 - z0 - 2) / 3, r = [x0 + 1.6, z0 + 1 + cd + 0.6, x0 + 1 + cw - 0.6, z0 + 1 + 2 * cd - 0.6];
    const back = [r[0], r[1], r[2] - 2.6, r[3]], nr = r[3] - r[1] > 11 ? 3 : 2, cell = (back[3] - back[1]) / nr, room = [back[0], back[1], back[2], back[1] + cell];
    SITES.push({ use: 'hearth', rect: room, at: mid(room), id: 'compound:' + c.seed, work: HEARTH_WORK, y: 0.5 });
    void roomDoors;
  }
  // the chambers of the big temples on the west platform (11 × 10 m, walls 2.1: the chamber 6.8 × 5.8 m, the summit 8 m over the platform), the Sun's and the Feathered Serpent's
  for (const t of platformTemples()) if (t.big && t.sd < 0) { const r = [-36 - 5.5 + 2.1, t.z - 5 + 2.1, -36 + 5.5 - 2.1, t.z + 5 - 2.1]; SITES.push({ use: 'shrine', rect: r, at: mid(r), id: 'temple:' + t.z, work: [['tthRattle', [60, 140], [5.5, 18.5]]], y: t.lv + 2.4 + 8 }); }
  { const r = [SUN.c[0] - 8 + 3, SUN.c[1] - 8 + 3, SUN.c[0] + 8 - 3, SUN.c[1] + 8 - 3]; SITES.push({ use: 'shrine', rect: r, at: mid(r), id: 'sun', work: [['tthRattle', [50, 120], [5.5, 18.5]]], y: SUN.h }); }
  { const r = [146, 256, 154, 264]; SITES.push({ use: 'shrine', rect: r, at: mid(r), id: 'serpent', work: [['tthRattle', [50, 120], [5.5, 18.5]]], y: 20 }); }
  SITES.push({ use: 'hall', rect: QPP.rect, at: mid(QPP.rect), id: 'palace', work: [], y: QPP.y }, { use: 'hall', rect: JAGUARS.rect, at: mid(JAGUARS.rect), id: 'jaguars', work: [], y: JAGUARS.y });
  return SITES;
}

export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: hearth (a kitchen), house (a sleeping or store room), workshop,
 * shrine (the temples' chambers and the priest's), hall (the palace's and the Jaguars' courts).
 */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z) && y > s.y - 0.6 && y < s.y + 3.4) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}

/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the flat roof is, `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
export const ROOMS = {
  hearth: { tone: [280, 0.3], roof: 0.9, hush: 0.7, work: [['kitchen', 40], ['tthTortilla', 70]] },
  house: { tone: [270, 0.28], roof: 0.9, hush: 0.7, work: [['clothRustle', 60]] },
  workshop: { tone: [300, 0.3], roof: 0.9, hush: 0.65, work: [['clothRustle', 80]] },
  shrine: { tone: [150, 0.3], roof: 0.6, hush: 0.45, work: [['clothRustle', 90]] },
  hall: { tone: [190, 0.28], roof: 0.8, hush: 0.55, work: [['clothRustle', 80]] },
};
export const UPPER = { tone: [230, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): little in the dry valley, a little more at the milpa and the huizache of the city's edge. */
export function greenNear(x, z) { return Math.max(0.12, sm(RADIUS - 130, RADIUS - 20, Math.hypot(x, z)) * 0.55); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z): the huizache and the oak of the outer lots (r > 370), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, r = Math.hypot(px, pz);
    if (r > RADIUS - 70 && r < RADIUS - 12) return [px, pz];
  }
  return null;
}
/**
 * 0…1: how much of the market's murmur reaches (x, z): full inside the Great Compound's wall, strong along the avenue before it (the market's gate opens toward the avenue's
 * west platform), a quarter across the city, little at its edge. [inferred: the Great Compound as the marketplace, dossier §13]
 */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 8)) return 1;
  const d = rectDist(MARKET, x, z), base = 0.8 * (1 - sm(20, 280, d)) + 0.12;
  return Math.min(1, Math.max(0.15, base)) * (Math.hypot(x, z) > RADIUS - 30 ? 0.6 : 1);
}

// what Teotihuacan has none of (the engine's scheduler asks, and is answered with nothing): no water, no bridges, no bamboo, no lotus
export const canalSpot = () => null;
export const shoreSpot = () => null;
export const pondSpot = () => null;
export const frogGround = () => 0;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const TRACKS = [];

// ── the emitters in the open ─────────────────────────────────────────────────
const SUMMIT_SUN = [SUN.c[0] - 10, SUN.c[1]], SUMMIT_MOON = [0, MOON.c[1] + MOON.td / 2 - 1.8], SERPENT = [143, 260], CROSS_AT = [0, -209];
const MARKET_MID = mid(MARKET);
const items = (k) => avenueItems().filter((o) => o.k === k);
// the sellers' places in the market: along its two lanes and in the rows (x, z)
const [mx0, mz0, mx1, mz1] = MARKET, mcx = (mx0 + mx1) / 2, mcz = (mz0 + mz1) / 2;
const HAWKERS = [[mx1 - 20, mcz], [mx0 + 25, mcz], [mcx, mz0 + 25], [mcx, mz1 - 25], [mx1 - 40, mcz - 30], [mx0 + 40, mcz + 30], [mx1 - 35, mcz + 40], [mx0 + 35, mcz - 40]];
// the yards of the opened compounds and the barrio's forecourts, where the turkeys are
const YARDS = [...compounds().filter((c) => c.open).map((c) => [c.rect[2] - (c.rect[2] - c.rect[0] - 2) / 6 - 1, (c.rect[1] + c.rect[3]) / 2]), ...lodges().slice(4).map((l) => [(l.rect[0] + l.rect[2]) / 2 + (l.face === 'e' ? 8 : -8), (l.rect[1] + l.rect[3]) / 2])];
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry` (not in rain),
 * `rainMax`, `lv`, `after` (spaced from the end of a long one). The rooms' own work comes from sites().
 */
export const EMITTERS = [
  // the rites at the temples: the shell trumpets from the summits of the Sun and the Moon and the Feathered Serpent's court, the drum beside them, at dawn, noon and dusk [inferred: the hours]
  ...[[5.4, 6.8], [11.6, 12.6], [17.4, 18.6]].flatMap(([a, b], i) => [
    { voice: 'tthConch', at: SUMMIT_SUN, r50: 120, gap: [80, 190], hours: [a, b], after: true, rainMax: 0.9 },
    { voice: 'tthConch', at: SUMMIT_MOON, r50: 110, gap: [100, 220], hours: [a, b], after: true, rainMax: 0.9 },
    { voice: 'tthConch', at: SERPENT, r50: 90, gap: [110, 240], hours: [a, b], after: true, rainMax: 0.9, lv: 0.9 },
    { voice: 'tthDrum', at: SERPENT, r50: 80, gap: [70, 160], hours: [a, b], after: true, rainMax: 0.8, lv: i === 1 ? 0.8 : 1 },
  ]),
  // the priests' rattles and conches about the Cross in the Moon Plaza in the morning
  { voice: 'tthRattle', at: CROSS_AT, r50: 40, gap: [50, 120], hours: [5.6, 9], after: true, rainMax: 0.5 },
  // the market: the drum and the flute at its central platform, by day [dossier §15: the market with a drum and the flute]
  { voice: 'tthDrum', at: MARKET_MID, r50: 55, gap: [90, 200], hours: [8, 15.5], after: true, rainMax: 0.5, lv: 0.7 },
  { voice: 'tthFlute', at: [MARKET_MID[0] + 4, MARKET_MID[1] + 4], r50: 30, gap: [60, 150], hours: [8.4, 16], after: true, rainMax: 0.3 },
  { voice: 'tthWhistle', at: [mcx + 30, mcz + 14], r50: 18, gap: [50, 130], hours: [7.5, 17], rainMax: 0.3 },
  // the sellers' cries (wordless; the engine's hubbub is under them), at their places
  ...HAWKERS.map((at, i) => ({ voice: 'tthCry', at, r50: 15, gap: [20 + i * 3, 60 + i * 6], hours: [6.2, 16.5], rainMax: 0.5 })),
  // the masons laying the floors of the avenue's plazas and the Moon Plaza (dress.js 'crew'), by day
  ...items('crew').map((o, i) => ({ voice: 'tthPlaster', at: [o.x, o.z], r50: 16, gap: [16 + i * 3, 40 + i * 4], hours: [7, 16.5], rainMax: 0.1 })),
  // the sweepers at dawn on the avenue's plazas
  ...items('sweeper').filter((o) => o.z > -140 && o.z < 240).slice(0, 8).map((o, i) => ({ voice: 'broom', at: [o.x, o.z], r50: 16, gap: [30 + i * 5, 80 + i * 6], hours: [4.8, 6.8], dry: true })),
  // the turkeys of the yards: the opened compounds' entry courts, the barrio's forecourts, the market's lanes
  ...[...YARDS, [mx1 - 30, mcz + 22], [mx0 + 40, mcz - 18]].map((at, i) => ({ voice: 'tthTurkey', at, r50: 12, gap: [28 + i * 5, 80 + i * 7], hours: [5.5, 18.5], rainMax: 0.6 })),
  // owls of the night (the owl of the palace's pillars), at the city's edge and by the palace
  { voice: 'tthOwl', at: [-250, -120], r50: 55, gap: [40, 110], hours: [20, 4.5], rainMax: 0.5 },
  { voice: 'tthOwl', at: [180, 150], r50: 55, gap: [50, 130], hours: [20.5, 4], rainMax: 0.5 },
  { voice: 'tthOwl', at: [(QPP.rect[0] + QPP.rect[2]) / 2, (QPP.rect[1] + QPP.rect[3]) / 2], r50: 40, gap: [60, 150], hours: [21, 3.5], rainMax: 0.4 },
];
void PLAZA; void LEVELS;
