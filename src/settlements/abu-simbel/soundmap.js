// Where Abu Simbel's sounds are (docs/settlements/abu-simbel.md §20): the masons' chisels and mallets in the yard, the carpenter's adze, the weaver's loom, the
// querns of the houses and the bakers' pots in the camp, the hawkers of the market street (wordless), the shadufs on the bank, the haulers and stevedores and
// the women washing at the quay, the geese and the boats of the river, the priests' chant in the Great Temple's hall at first light and at dusk with the sistrum
// and the clapping at its door, kites over the cliff, doves on the roofs, donkeys, the slide of sand down the talus, the jackals of the desert by night.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices
// of Thebes' and Giza's files reused, and voices-abu-simbel.js). Coordinates: metres, +x east (the Nile), +z south, the settlement's frame. [inferred throughout.]
// Not at Abu Simbel: bells, a call to prayer, a watchman's rounds, wells (the water was carried from the river).
import { FX, FXS, ZS, TERRACE, MARKET, QUAY, BANK_X, CHAPEL, FIELDS, inRect, lots } from './layout.js';
import { greatRooms, smallRooms } from '../../styles/ramesside/dims.js';

/** Where the audio puts the listener when the engine gives none (the arrival). */
export const HOME = [-4, 17];
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
export const YARD = [-36, 141, 10, 170];
const NILE = [BANK_X + 30, -190, 190, 190];                     // the river and its bed, east of the bank's foot

/** The household's and the workshops' own sounds: [voice, gap [min, max] s, hours [from, to]]. */
const WORK = {
  house: [['kitchen', [16, 34], [5, 20]], ['thbQuern', [40, 90], [4.5, 9]]],
  bakery: [['gizPots', [12, 28], [3.5, 11]], ['gizBrew', [30, 70], [4, 12]], ['thbQuern', [40, 90], [3.5, 8]]],
  'shop:carpenter': [['thbAdze', [14, 34], [6.5, 17]]],
  'shop:weaver': [['thbWeave', [8, 20], [6.5, 17]]],
  'shop:potter': [['thbScrape', [24, 60], [6.5, 16.5]], ['gizPots', [40, 90], [7, 15]]],
  'shop:brewer': [['gizBrew', [20, 50], [5, 14]]],
  'shop:sandals': [['thbScrape', [30, 70], [7, 16]]],
  'shop:butcher': [['clothRustle', [40, 90], [6, 12]], ['thbHawk', [60, 140], [6.5, 12]]],
  'shop:jeweller': [['clothRustle', [50, 110], [7, 15]]],
  'shop:scribe': [['clothRustle', [50, 110], [7, 15]]],
};
let SITES = null;
/** The houses, shops, bakeries and the chapel with sounds: { use, rect, at, id, work, y }. Every house is furnished and enterable. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const use = l.kind === 'shop' ? 'shop' : l.kind;
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: use + ':' + l.rect[0].toFixed(0) + ',' + l.rect[1].toFixed(0), work: WORK[l.kind === 'shop' ? 'shop:' + l.trade : l.kind] || [], y: 0 });
  }
  SITES.push({ use: 'chapel', rect: CHAPEL, at: mid(CHAPEL), id: 'chapel', work: [['clothRustle', [60, 130], [6, 18]]], y: 0 });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE_ZONE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const GREAT = greatRooms(), SMALL = smallRooms();
const ROOM_RECTS = [
  ['great-hall', 'hall', [FX - GREAT[GREAT.length - 1].d1, -GREAT[1].zh, FX, GREAT[1].zh]],
  ['small-hall', 'hall', [FXS - SMALL[SMALL.length - 1].d1, -SMALL[1].zh + ZS, FXS, SMALL[1].zh + ZS]],
];
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
const R0 = { tone: [320, 0.25], roof: 0.5, hush: 0.75, work: [['kitchen', 40]] };
export const ROOMS = {
  house: R0,
  shop: { tone: [300, 0.22], roof: 0.5, hush: 0.6, work: [['clothRustle', 60]] },
  bakery: { tone: [360, 0.3], roof: 0.5, hush: 0.9, work: [['gizPots', 20], ['gizBrew', 60]] },
  chapel: { tone: [240, 0.2], roof: 0.5, hush: 0.8, work: [['clothRustle', 70]] },
  hall: { tone: [140, 0.3], roof: 0.3, hush: 0.4, work: [['clothRustle', 90]] },
};
export const UPPER = { tone: [260, 0.14], roof: 0.6, hush: 0.7, work: [['clothRustle', 50]] };

// ── the green, the town, the water ───────────────────────────────────────────
/** 0…1: how much green round (x, z): the palms, tamarisk and fields of the bank and the reeds at the water; the desert and the camp little. */
export function greenNear(x, z) { return Math.max(0.05, sm(BANK_X - 6, BANK_X + 30, x) * (x < 66 ? 1 : 0.5), 0.12 * (1 - sm(0, 40, rectDist([-36, 31, 10, 140], x, z)))); }
export const leafNear = (x) => (x > BANK_X && x < 66 ? 0.75 : 0.06);
/** A palm of the bank near (x, z) to put a bird or an insect in, or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  if (x < BANK_X - 30) return null;
  for (let k = 0; k < 16; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (px > BANK_X + 4 && px < 44 && Math.abs(pz) < 150 && !inRect(QUAY, px, pz, 2)) return [px, pz]; }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the market and camp, the quay, the yard, the terrace's pilgrims, the priests' lanes. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 8) || inRect([-36, 31, 10, 140], x, z)) return 1;
  if (inRect(YARD, x, z, 10) || inRect(QUAY, x, z, 14)) return 0.9;
  if (inRect(TERRACE, x, z, 4)) return 0.6;
  if (inRect([-16, -84, 11, -36], x, z, 6)) return 0.6;
  return 0.12;
}
/** The quay's stone face (x = QUAY[2]) within 24 m: the lap of the river at the stone. */
export function canalSpot(x, z) {
  const d = Math.abs(x - QUAY[2]);
  if (x < QUAY[2] - 24 || d > 24 || z < QUAY[1] - 20 || z > QUAY[3] + 20) return null;
  return { p: [QUAY[2] + 0.6, Math.max(QUAY[1], Math.min(QUAY[3], z))], d };
}
/** The reed beds of the bank north and south of the quay: the water's edge within 30 m (papyrus and reeds rustle, the river laps at them). */
export function shoreSpot(x, z) {
  if (x < 40 || x > 90 || Math.abs(z) < 14 || Math.abs(z) > 120) return null;
  const sgn = z < 0 ? -1 : 1, p = [56, Math.max(-110, Math.min(110, z))];
  return Math.hypot(x - p[0], z - p[1]) < 30 ? { p, d: Math.hypot(x - p[0], z - p[1]) } : (void sgn, null);
}
/** A point on the river within `reach` of the listener (a fish rises by day), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (rectDist(NILE, x, z) > reach) return null;
  return [66 + rnd() * 40, Math.max(-150, Math.min(150, z + (rnd() - 0.5) * reach * 1.6))];
}
/** 0…1: how marshy the ground is (the frogs of the reeds at night): the papyrus beds beside the quay. */
export const frogGround = (x, z) => (x > 44 && x < 66 && Math.abs(z) > 14 && Math.abs(z) < 90 ? 0.8 : 0);
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;

/** A reach of the river for a boat to pass along (poled and paddled), within 70 m of the listener. */
function riverTrack(x, z, rnd) {
  if (rectDist(NILE, x, z) > 70) return null;
  const lane = 76 + rnd() * 30, a = Math.max(-100, z - 60), b = Math.min(100, z + 60);
  return { pts: rnd() < 0.5 ? [[lane, a], [lane, b]] : [[lane, b], [lane, a]] };
}
export const TRACKS = [
  { key: 'riverboat', voice: 'thbBoat', speed: 1.3, r50: 16, gap: [40, 90], ok: (hour, rain) => hour >= 5.5 && hour < 19 && rain < 0.6, get: (x, z, r) => riverTrack(x, z, r) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const greatMid = mid(ROOM_RECTS[0][2]), smallMid = mid(ROOM_RECTS[1][2]), yardMid = mid(YARD);
/** Fixed emitters: { voice, at, r50, gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
export const EMITTERS = [
  // the masons' yard: chisels and mallets on the blocks, the haulers with a sledge
  { voice: 'abuChisel', at: [yardMid[0] - 8, yardMid[1] - 6], r50: 22, gap: [12, 26], hours: [6, 17] },
  { voice: 'abuChisel', at: [yardMid[0] + 6, yardMid[1] + 4], r50: 22, gap: [14, 30], hours: [6, 17] },
  { voice: 'gizMallet', at: [yardMid[0], yardMid[1] + 9], r50: 20, gap: [18, 40], hours: [6.5, 16.5] },
  { voice: 'gizHaul', at: [YARD[0] + 14, YARD[3] - 6], r50: 24, gap: [40, 90], hours: [6.5, 16.5] },
  // the quay: the barge's stone hauled off on the rope, stevedores, women washing, geese on the bank, a donkey on the ramp
  { voice: 'gizHaul', at: [QUAY[0] + 6, -9], r50: 24, gap: [30, 64], hours: [6, 17] },
  ...[[QUAY[2] - 4, -4], [QUAY[2] - 4, 4]].map((at, i) => ({ voice: 'thbStevedores', at, r50: 18, gap: [28 + i * 5, 70 + i * 6], hours: [5.5, 17.5] })),
  ...[[QUAY[2] - 0.6, 7], [QUAY[2] - 0.6, 9]].map((at, i) => ({ voice: 'gizWash', at, r50: 14, gap: [24 + i * 6, 60 + i * 8], hours: [6, 16.5], rainMax: 0.5 })),
  { voice: 'thbGeese', at: [38, 18], r50: 26, gap: [30, 80], hours: [5.5, 19] },
  { voice: 'thbDonkey', at: [26, 3], r50: 40, gap: [80, 200], hours: [5.5, 19] },
  // the shadufs at the fields' lower edge
  ...FIELDS.flatMap(([fx0, fz0, fx1, fz1], i) => [fz0 + 3, fz1 - 3].map((z, j) => ({ voice: 'thbShaduf', at: [fx1 + 3, z], r50: 16, gap: [20 + i * 4 + j * 3, 50 + i * 5], hours: [6, 17], rainMax: 0.5 }))),
  // the market's hawkers (wordless), the camp's donkeys, doves on the roofs
  ...[-26, -14, -2, 8].map((x, i) => ({ voice: 'thbHawk', at: [x, (MARKET[1] + MARKET[3]) / 2], r50: 12, gap: [22 + i * 4, 60 + i * 6], hours: [6, 13], rainMax: 0.5 })),
  { voice: 'thbDonkey', at: [-14, 92], r50: 40, gap: [90, 240], hours: [5.5, 19] },
  { voice: 'thbDonkey', at: [-20, -60], r50: 40, gap: [110, 260], hours: [5.5, 19] },
  ...[[-20, 60], [-12, 110], [-14, -50]].map((at, i) => ({ voice: 'thbDove', at, r50: 14, gap: [20 + i * 3, 60 + i * 5], hours: [5.5, 18.5] })),
  // the temples' rites: the chant in the hall at first light (the sun comes in over the river) and at dusk, the sistrum and the clapping at the door
  { voice: 'thbChant', at: greatMid, r50: 30, gap: [30, 70], hours: [5.6, 7.2], after: true },
  { voice: 'thbChant', at: greatMid, r50: 30, gap: [40, 90], hours: [17.4, 18.6], after: true },
  { voice: 'thbChant', at: smallMid, r50: 24, gap: [60, 140], hours: [5.8, 7], after: true },
  { voice: 'thbSistrum', at: [FX + 8, -6], r50: 24, gap: [40, 100], hours: [5.6, 7.2] },
  { voice: 'thbClap', at: [FX + 9, 6], r50: 24, gap: [70, 160], hours: [5.8, 7], after: true },
  { voice: 'thbSistrum', at: [FXS + 8, ZS - 3], r50: 20, gap: [60, 140], hours: [5.8, 7] },
  // kites over the cliff, the slide of sand down the talus, the jackals of the desert's edge by night
  { voice: 'thbKite', at: [-60, -40], r50: 80, gap: [25, 70], hours: [7, 17.5] },
  { voice: 'thbKite', at: [-60, 70], r50: 70, gap: [35, 90], hours: [7, 17.5] },
  { voice: 'abuSand', at: [FX - 6, -60], r50: 40, gap: [120, 300], hours: [0, 24], dry: true },
  { voice: 'abuSand', at: [FX - 6, 70], r50: 40, gap: [140, 320], hours: [0, 24], dry: true },
  { voice: 'thbJackal', at: [-150, -100], r50: 85, gap: [60, 160], hours: [19.8, 4.5], rainMax: 0.5, after: true },
  { voice: 'thbJackal', at: [-150, 110], r50: 85, gap: [90, 220], hours: [20.5, 4], rainMax: 0.5, after: true },
];
