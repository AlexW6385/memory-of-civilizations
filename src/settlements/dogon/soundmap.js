// Where the Dogon village's sounds are (docs/settlements/dogon.md §16.3): the places of its emitters and the geometry the audio engine needs to put each
// sound where it is made — the pestles and the pounding songs on the threshing floors, the smith's hammer and bellows, the loom under the toguna's roof, the
// greetings called across the place and the lanes, the wells, the hoes in the millet, the gourds of the bird-scarers, a drum and a calabash rattle in the evening
// (not a rite: none is made), the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js and played by
// src/engine/voices.js (the voices of src/engine/voices-dogon.js). Coordinates: metres, +x east, +z south. No bell, no call to prayer (the village is not Muslim in
// the dossier's sources; Islam reached the Dogon only in the 19th century and only some), no motor.
import '../../engine/voices-dogon.js';
import { RADIUS, PLACE, TOGUNA, FORGE, DYE, THRESH, PENS, BAOBABS, SHADE, COMPOUNDS, inRect } from './layout.js';
import { houseOf } from '../../styles/dogon/compound.js';
import { WELLS as WALK_WELLS } from './walk.js';

export const HOME = [4.5, 27.5];
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

let SITES = null;
/** The rooms with sounds: the 18 opened ginnas (the hearth's small work) and the smithy's shelter. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const c of COMPOUNDS) { const r = houseOf(c).rect; SITES.push({ use: 'house', rect: r, at: mid(r), id: 'ginna:' + c.seed, work: [['kitchen', [30, 70], [5.5, 20]], ['clothRustle', [60, 130], [6, 21]]], y: c.y }); }
  const [fx, fz] = FORGE.at, r = [fx - 2.4, fz - 3.2, fx + 2.4, fz - 0.4];
  SITES.push({ use: 'smithy', rect: r, at: mid(r), id: 'forge', work: [['hammer', [8, 22], [6.5, 17.5]], ['dgBellows', [14, 30], [6.5, 17.5]]], y: 1.2 });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const lotAt = (x, z, y) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z) && y > s.y - 0.6 && y < s.y + 2.6);
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z, y);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
const R0 = { tone: [260, 0.25], roof: 0.5, hush: 0.7, work: [['clothRustle', 60]] };   // thick mud walls and a roof of beams, reed and mud: dull and heavy, rain soft
export const ROOMS = {
  house: { ...R0, tone: [300, 0.3], work: [['kitchen', 40]] },
  smithy: { ...R0, tone: [380, 0.35], hush: 0.9, roof: 0.3, work: [['hammer', 25]] },
};
export const UPPER = { tone: [230, 0.12], roof: 0.5, hush: 0.8, work: [['clothRustle', 40]] };

// ── the planting and the village ──
/** Little green in the lanes, more at the shade trees and baobabs, the standing millet on the plain beyond z = 40. */
export function greenNear(x, z) {
  const trees = Math.max(...[...SHADE.map((t) => t.at), ...BAOBABS.map((b) => b.at)].map((p) => 1 - sm(0, 40, Math.hypot(x - p[0], z - p[1]))));
  return Math.max(0.15, 0.6 * trees, 0.55 * sm(36, 56, z));
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.7);
/** A tree for a bird or a cicada: the shade trees of the place and the baobabs, near (x, z). */
export function treeSpot(x, z, rnd, reach = 40) {
  const T = [...SHADE.map((t) => t.at), ...BAOBABS.map((b) => b.at)].filter((p) => Math.hypot(p[0] - x, p[1] - z) < reach + 10);
  return T.length ? T[Math.floor(rnd() * T.length)] : null;
}
/** How much of the village's talk reaches (x, z): the place and the lanes most, the fields little. */
export function townNear(x, z) {
  if (inRect(PLACE, x, z, 4)) return 1;
  if (z < 14 && z > -34 && Math.abs(x) < 66) return 0.7;
  return Math.max(0.1, 0.7 * (1 - sm(40, RADIUS, Math.hypot(x, z - 10))));
}
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const shoreSpot = () => null;
/** No stream, no pond (dossier §9): no frogs (the rains have ended). */
export const frogGround = () => 0;
export const TRACKS = [];

const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const [wx0, wz0] = WALK_WELLS[0], [wx1, wz1] = WALK_WELLS[1];
export const EMITTERS = [
  // the pestles and the songs on the threshing floors: the women pound at dawn and again toward evening
  ...THRESH.flatMap((t) => [E('dgPound', [t.at[0] + 1.5, t.at[1]], 12, [40, 90], [5.5, 9.5], { dry: true }), E('dgPound', [t.at[0] + 1.5, t.at[1]], 12, [60, 120], [15.5, 19], { dry: true }), E('dgSong', [t.at[0] + 1.5, t.at[1]], 18, [70, 150], [5.5, 9.5], { dry: true, after: true }), E('dgSong', [t.at[0] + 1.5, t.at[1]], 18, [90, 180], [15.5, 19], { dry: true, after: true })]),
  // the loom under the toguna's roof, and the men's talk there (greetings) in the heat of the day
  E('loom', [TOGUNA.c[0] + 1.75, TOGUNA.c[1] - 1.35], 9, [12, 28], [7, 17.5], { dry: true }),
  E('dgGreet', [TOGUNA.c[0], TOGUNA.c[1] + 4], 22, [20, 50], [7, 18.5], { rainMax: 0.5 }), E('dgGreet', [8, 22], 22, [20, 50], [7, 18.5], { rainMax: 0.5 }), E('dgGreet', [0, 5], 22, [24, 60], [6.5, 18.5], { rainMax: 0.5 }), E('dgGreet', [0, -12], 22, [30, 70], [6.5, 18.5], { rainMax: 0.5 }),
  // the market's voices on the place: the sellers' cries (the engine's own market layer does the murmur; one wordless call)
  E('dgGreet', [-14, 25], 20, [26, 60], [7.5, 17], { rainMax: 0.4 }),
  // the dyers' yard: the pits' work is quiet, a cloth beaten against a stone
  E('clothRustle', [DYE.at[0], DYE.at[1] + 1.5], 10, [14, 36], [7, 16.5], { dry: true }),
  // the wells: cord, splash and bucket
  E('dgWell', [wx0, wz0], 9, [40, 100], [6, 18.5], { dry: true }), E('dgWell', [wx1, wz1], 9, [50, 120], [6, 18.5], { dry: true }),
  // the farmers' hoes in the stubble and the gourds of the scarers in the millet
  E('dgHoe', [-30, 48], 22, [30, 70], [6, 11], { dry: true }), E('dgHoe', [34, 47], 22, [40, 90], [15.5, 18.5], { dry: true }),
  E('dgGourd', [-55, 36], 14, [20, 60], [6, 18.5], { rainMax: 0.8 }), E('dgGourd', [36, 35.5], 14, [24, 70], [6, 18.5], { rainMax: 0.8 }),
  // the evening: a drum and the calabashes' rattle on the place (a gathering, not a rite), then the night
  E('dgDrum', [4, 28], 38, [140, 300], [17.5, 21.5], { rainMax: 0.3, after: true }), E('dgRattle', [6, 28], 28, [160, 320], [17.5, 21.5], { rainMax: 0.3, after: true }),
  // the night: the little owl from the baobab and the cliff
  E('owl', [-34, 41], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [0, -50], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void hash;
