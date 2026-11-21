// Where Lalibela's sounds are (docs/settlements/lalibela.md §20): the chant, the kebero and the sistrum in the courts of the churches, the dawal's call, the begena
// in the church, the work of the opened houses, the Jordan's pool, the wind, the herders. Pure data and functions of layout.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-lalibela.js). +x east, +z south.
// What the scheduler asks of a map and Lalibela has not (canals, bridges, street walkers) is answered with nothing.
import '../../engine/voices-lalibela.js';
import { RADIUS, PITS, PRECINCT, POOL, enterable, HUT, WATCH, inRect, slope } from './layout.js';

export const HOME = [WATCH[0], WATCH[1]];
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each trade's house: [voice, gap s [min, max], hours [from, to]] [inferred from the trade]. */
const WORK = {
  household: [['laMortar', [50, 110], [6, 10]], ['laGriddle', [90, 200], [6, 9]], ['laGriddle', [90, 200], [16, 19]]],
  weaver: [['laLoom', [14, 30], [7, 17.5]]],
  brewer: [['pour', [60, 130], [8, 17]]],
  scribe: [['laChant', [90, 200], [6, 18]]],
  store: [['jarLid', [40, 90], [7, 17]]],
  smith: [['hammer', [12, 30], [7, 17]]],
  mason: [['laChisel', [30, 70], [7, 17]]],
  potter: [['clay', [14, 30], [7, 17]]],
  school: [['laChant', [40, 90], [7, 12]]],
};
const ROOM_KIND = { hut: 'household' };
let SITES = null;
/** The opened houses with sounds: { use, rect, at, id: 'house:<seed>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const add = (h, kind, id) => { if (WORK[kind]) SITES.push({ use: kind, rect: [h.c[0] - h.r, h.c[1] - h.r, h.c[0] + h.r, h.c[1] + h.r], at: [h.c[0], h.c[1]], id, work: WORK[kind], y: slope(h.c[0], h.c[1]) }); };
  for (const h of enterable()) add(h, h.enter, 'house:' + h.seed);
  add({ c: HUT.c, r: HUT.r }, 'household', 'house:hut');
  return SITES;
}
void ROOM_KIND;

export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ───────────────────────────────────────────────────────────────
// the churches' interiors lie under the precinct's level: they count only when the listener is below the ground (y < -2)
const ctr = (id) => mid(PITS[id].rect);
const CHURCHES = [
  ['room:giyorgis', 'church', [ctr('giyorgis')[0] - 10.4, ctr('giyorgis')[1] - 10.4, ctr('giyorgis')[0] + 10.4, ctr('giyorgis')[1] + 10.4]],
  ['room:medhane', 'church', [ctr('medhane')[0] - 13.15, ctr('medhane')[1] - 8.15, ctr('medhane')[0] + 13.15, ctr('medhane')[1] + 8.15]],
  ['room:maryam', 'church', [62.8, -93.6, 77.2, -86.4]],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => Math.hypot(s.at[0] - x, s.at[1] - z) < 3.2);
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  if (y < -2) for (const [id, use, r] of CHURCHES) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  const s = lotAt(x, z);
  if (s && y > s.y - 1 && y < s.y + 3) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['jarLid', 60]] };
export const ROOMS = {
  household: { ...R0, tone: [330, 0.3], work: [['laGriddle', 70]] },
  weaver: { ...R0, work: [['laLoom', 14]] },
  brewer: { ...R0, work: [['pour', 60]] },
  scribe: { ...R0, tone: [260, 0.2], hush: 0.9, work: [['laChant', 120]] },
  store: { ...R0, tone: [240, 0.2], work: [['jarLid', 50]] },
  smith: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 30]] },
  mason: { ...R0, tone: [380, 0.3], work: [['laChisel', 30]] },
  potter: { ...R0, work: [['clay', 20]] },
  school: { ...R0, tone: [300, 0.3], work: [['laChant', 60]] },
  church: { tone: [180, 0.2], roof: 0.2, hush: 0.45, work: [['laBegena', 70], ['laChant', 90]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['jarLid', 60]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: green round (x, z): the juniper and wild olive of the slopes, the fields; the precinct bare rock. */
export function greenNear(x, z) { return 0.25 + 0.55 * sm(PRECINCT - 60, RADIUS - 40, Math.hypot(x, z)); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z), or null: on the slopes beyond the village. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (Math.hypot(px, pz) > PRECINCT - 20 && Math.hypot(px, pz) < RADIUS - 8 && hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.25) return [px, pz]; }
  return null;
}
/** 0…1: how much of the village's hubbub reaches (x, z): the courts of the churches carry the pilgrims' murmur. */
export function townNear(x, z) {
  for (const p of Object.values(PITS)) if (inRect(p.rect, x, z, 6)) return 0.5;
  return Math.max(0.1, 0.45 * (1 - sm(PRECINCT - 40, RADIUS, Math.hypot(x, z))));
}
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const door = (id, dx, dz) => { const c = mid(PITS[id].rect); return [c[0] + dx, c[1] + dz]; };
export const EMITTERS = [
  // the dawn office and the evening office at the churches: the dawal's call, then the chant with the kebero and the sistra
  ...['giyorgis', 'medhane', 'maryam', 'golgotha', 'amanuel', 'gabriel'].flatMap((id) => [
    E('laStoneGong', door(id, -6, 0), 60, [200, 420], [4.5, 6.5], { rainMax: 0.6 }),
    E('laChant', door(id, -4, 6), 38, [70, 160], [4.5, 9], { rainMax: 0.5 }), E('laChant', door(id, -4, 6), 38, [110, 240], [16, 20], { rainMax: 0.5 }),
    E('laKebero', door(id, -3, 7), 34, [80, 180], [5, 8.5], { rainMax: 0.4 }), E('laSistrum', door(id, -3, 5), 30, [70, 160], [5, 8.5], { rainMax: 0.4 }),
  ]),
  // the begena in the cell of a church's priest, evenings
  E('laBegena', door('medhane', 8, 9), 18, [120, 260], [17, 22], { rainMax: 0.5 }),
  // the pool in the Jordan: the washerwomen's cloth, a priest's blessing, water poured
  E('clothRustle', [(POOL[0] + POOL[2]) / 2, POOL[3] + 1], 12, [10, 26], [7, 16], { dry: true }), E('pour', [POOL[2] - 2, (POOL[1] + POOL[3]) / 2], 12, [20, 50], [7, 17], { dry: true }),
  // the wind in the thatch and juniper on the slopes
  ...[[-200, 200], [200, 180], [-250, -150], [180, -200]].map(([x, z]) => E('laWind', [x, z], 60, [20, 50], [0, 24], { rainMax: 0.8 })),
  // the herd boys on the slopes
  E('laHerder', [-190, 205], 50, [90, 200], [7, 17.5], { rainMax: 0.4 }), E('laHerder', [210, 120], 50, [100, 220], [7, 17.5], { rainMax: 0.4 }),
  // the little owl on the rock rim and hyenas far off in the night
  E('owl', [-260, 60], 60, [40, 100], [20, 4.5], { rainMax: 0.4 }), E('owl', [120, -150], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
