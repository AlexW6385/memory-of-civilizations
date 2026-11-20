// Where Joseon Hanyang's sounds are (docs/settlements/joseon-seoul.md §19.3): the places of its emitters and the geometry the audio engine
// needs to put each sound where it is made (src/engine/voices.js `placed()`, voices-seoul.js): the stream and the two ponds, Jongno and
// the avenue and the lanes, the shops of Jongno at their goods, the hanok yards, the palace, the rooms one can be inside. Pure data and
// functions of layout.js and openwalk.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`). Coordinates:
// metres, +x east, +z south, the settlement's frame. The bell of Jongno (Bosingak: 33 strokes at 4 and 22 h) is the engine's own schedule.
//
// The engine's scheduler was written for Suzhou and calls three walkers this town does not have, each by its own arguments:
// `streetTrack(…, 90, 40)` (a Chinese sedan chair), `streetTrack(…, 90, 34)` (the night watchman with his gong) and
// `streetTrack(…, 80, 30)` (the Chinese pedlars' cries). Here those return null, and the town's own pedlar, taffy seller, ox and night
// watch are made by voices-seoul.js through `pedlarTrack`. The seasonal birds (cuckoo, oriole, magpie, tit) are Korea's too: `treeSpot`
// answers every call.

import '../../engine/voices-seoul.js';
import { RADIUS, PALACE, POND, HYANG, STREAM, JONGNO, AVENUE, YANGBAN, BELL, inRect, inPond, inHyang, inStream, lots, lanes, smooth } from './layout.js';
import { blocksOf, shopsOf, enterable } from './openwalk.js';

/** Where the audio puts the listener when the engine gives none (the arrival in the throne court). */
export const HOME = [0, 83.5];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];

// ── the goods of Jongno's shops ─────────────────────────────────────────────────
/** What the six licensed goods make heard in the shop (dossier §12: silk, raw silk, cotton, paper, ramie, fish): [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade]. */
const GOODS = [
  ['silk', [['clothRustle', [30, 70], [8, 18]]]],
  ['rawsilk', [['clothRustle', [34, 74], [8, 18]]]],
  ['cotton', [['clothRustle', [28, 64], [8, 18]], ['abacus', [40, 90], [8, 18]]]],
  ['paper', [['paper', [26, 60], [8, 18]]]],
  ['ramie', [['clothRustle', [32, 70], [8, 18]]]],
  ['fish', [['bowlClack', [20, 46], [6, 15]]]],
];
const ROW = { silk: 1, rawsilk: 1, cotton: 1, paper: 1, ramie: 1, fish: 1 };
let SITES = null;
/** The shops of Jongno with sounds: a third of the shops, by place: { use, rect, at, id: 'shop:<x>', work }. The shop's rect is its block's depth and its own bays. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const b of blocksOf()) for (const s of shopsOf(b)) {
    const g = GOODS[Math.floor(hash(s.x, s.z, 3) * GOODS.length)];
    if (hash(s.x, s.z, 7) > 0.34 || !ROW[g[0]]) continue;
    SITES.push({ use: g[0], rect: [s.x0, s.z, s.x1, b.rect[3]], at: [(s.x0 + s.x1) / 2, s.z + 2.5], id: 'shop:' + Math.round(s.x0), work: g[1] });
  }
  return SITES;
}

// ── the yards: pestle and beating-stone ──────────────────────────────────────────
let YARDS = null;
/** The hanok yards that make sound: a fifth of the lots, by seed: [{ at, id: 'lot:<seed>' }]. The women beat the cloth in the evening, the pestle sounds by day. */
function yards() {
  if (YARDS) return YARDS;
  YARDS = [];
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect;
    if (l.seed % 5) continue;
    YARDS.push({ at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'lot:' + l.seed, wide: l.seed % 2 === 0 });
  }
  return YARDS;
}

// ── the wells ───────────────────────────────────────────────────────────────────
/** The public wells of Jongno (town.js shopfronts: the granite wells at x = -84 and 74) and some of the lanes' [inferred: Hanyang's wells]. */
export const WELLS = [[-84, JONGNO[1] + 1.4], [74, JONGNO[1] + 1.4], [-60, 190], [66, 190], [-200, 330], [190, 320]];

// ── geometry of the water and the streets ───────────────────────────────────────
const SW = [-150, STREAM.z0, 150, STREAM.z1];
/** The rectangles of the water: Gyeonghoeru's pond, Hyangwonji, the Geumcheon. */
export const WATER = [POND, HYANG, SW];
const inWater = (x, z) => inPond(x, z) || inHyang(x, z) || inStream(x, z);
/** The nearest point of the water to (x, z), its distance (0 inside) and the index of the rectangle. */
export function canalSpot(x, z) {
  let best = null;
  WATER.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (!best || d < best.d) best = { p, d, i }; });
  return best;
}
/** No boats' sound: nothing is sculled on the stream or the ponds. */
export function canalTrack() { return null; }

let LANES = null;
/** The ways walkers keep to: Jongno, the avenue of the ministries and the lanes of the hanok quarters. */
function streets() { return LANES ||= [JONGNO, AVENUE, ...lanes()]; }
/** A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function pedlarTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  const S = streets();
  S.forEach((r, i) => { if (Math.min(r[2] - r[0], r[3] - r[1]) < 2) return; const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = S[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * Math.min(2, Math.min(r[2] - r[0], r[3] - r[1]) * 0.6);
  return horiz ? { pts: [[a, mid + off], [b, mid + off]] } : { pts: [[mid + off, a], [mid + off, b]] };
}
/** The engine's street walkers (Chinese sedan chair, gong watchman, Chinese pedlar) do not exist here; the town's own come through `pedlarTrack`. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  if (lead === 40 || lead === 34 || (reach === 80 && lead === 30)) return null;
  return pedlarTrack(x, z, rnd, reach, lead);
}
/** Yeongjegyo, the bridge over the Geumcheon in the palace (on the axis): a walker's track across it, within `reach`. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  const bz = (STREAM.z0 + STREAM.z1) / 2, d = Math.hypot(x, z - bz);
  if (d > reach) return null;
  const h = (STREAM.z1 - STREAM.z0) / 2 + 4, s = rnd() < 0.5 ? 1 : -1, ox = (rnd() - 0.5) * 2;
  return { pts: [[ox, bz - s * h], [ox, bz + s * h]], d };
}
/** A point on the water within `reach` of (x, z) (a ring of tries), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (canalSpot(x, z).d > reach + 8) return null;
  for (let k = 0; k < 16; k++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (inWater(px, pz)) return [px, pz]; }
  return null;
}
/** The water's edge near (x, z): where a ray from it first crosses the edge, or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  if (canalSpot(x, z).d > reach) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = inWater(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const w = inWater(x + c * d, z + s * d); if (w !== prev) return [x + c * d, z + s * d]; prev = w; }
  }
  return null;
}

// ── where the planting makes its sound ──────────────────────────────────────────
/** 0…1: how wooded is (x, z): the palace's gardens and the pines of Amisan and Bugaksan to the north, the ponds' willows, the town bare. */
export function treeness(x, z) {
  let m = 0.1;
  if (inRect(PALACE, x, z)) m = Math.max(m, 0.25);
  m = Math.max(m, 0.7 * smooth(-150, -260, z) * (inRect(PALACE, x, z, 60) ? 1 : 0.5));
  m = Math.max(m, 0.45 * (1 - smooth(1, 16, canalSpot(x, z).d)));
  return m;
}
/** A tree to put a cicada or a bird in, near (x, z), by the woodedness. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && treeness(px, pz) > 0.25 + 0.6 * rnd()) return [px, pz];
  }
  return null;
}
/** 0…1: bamboo (a little by the queen's quarters and the lots' back walls). */
export function bambooNear(x, z) { return inRect([-178, -290, -62, -196], x, z) ? 0.35 : 0.12; }
/** 0…1: pines and broad leaves in wind (Amisan and the north, the ponds' willows). */
export function leafNear(x, z) { return Math.min(1, Math.max(0.3 + 0.5 * treeness(x, z), 0.5 * (1 - smooth(1, 14, canalSpot(x, z).d)))); }
/** 0…1: the lotus of Hyangwonji (its name is the lotus's fragrance; dossier §6) under rain. */
export function lotusNear(x, z) { return inHyang(x, z) || inRect(HYANG, x, z, 10) ? 0.8 : 0; }
/** 0…1: how much green round (x, z) for the insects: the palace's gardens, the ponds' banks, the fields at the rim. */
export function greenNear(x, z) {
  const edge = smooth(300, 360, Math.hypot(x, z)), bank = 0.55 * (1 - smooth(1, 18, canalSpot(x, z).d));
  return Math.max(treeness(x, z) * 0.9, edge * 0.85, bank, 0.14);
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in Jongno, some on the avenue and in the lanes, little in the palace. */
export function townNear(x, z) {
  if (inRect(PALACE, x, z)) return 0.12 + 0.1 * smooth(150, 236, z);
  const jongno = 1 - smooth(10, 70, Math.abs(z - (JONGNO[1] + JONGNO[3]) / 2));
  return Math.max(0.2, jongno * 0.95) * (1 - 0.4 * smooth(340, 400, Math.hypot(x, z)));
}
/** 0…1: wet ground (the frogs): the ponds and the stream, the fields at the rim. */
export function frogGround(x, z) { return Math.max(1 - smooth(0, 30, canalSpot(x, z).d), smooth(300, 360, Math.hypot(x, z)) * 0.9); }

// ── the rooms ───────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt2 = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const l of lots()) for (let i = Math.floor(l.rect[0] / 20); i <= Math.floor(l.rect[2] / 20); i++) for (let j = Math.floor(l.rect[1] / 20); j <= Math.floor(l.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(l); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((l) => inRect(l.rect, x, z));
};
const THRONE = [-15, 13, 15, 34];                               // the throne hall's room (plan.js rooms 'hall', raised 3.2 m)
/**
 * The room the listener is in: { use, at, upper, same } or null in the open. Uses: a shop's goods (silk, rawsilk, cotton, paper, ramie, fish),
 * house (a hanok house or the yangban house), hall (the throne hall: a great timber room, high and dark), shop (a shop of no sound-making goods).
 */
export function roomAt(x, z, y = 0) {
  if (inRect(THRONE, x, z) && y > 2.5 && y < 8) return { use: 'hall', at: [0, 23.5], upper: false, same: 'room:throne' };
  if (inRect(YANGBAN, x, z) && y < 4) return { use: 'house', at: [(YANGBAN[0] + YANGBAN[2]) / 2, (YANGBAN[1] + YANGBAN[3]) / 2], upper: false, same: 'room:yangban' };
  if (inRect([-140, JONGNO[3], 140, BELL[3]], x, z)) {
    for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
    return { use: 'shop', at: [x, z], upper: false, same: 'shop:row' };
  }
  const l = lotAt2(x, z);
  if (l && enterable(l)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper: false, same: 'lot:' + l.seed };
  return null;
}
/** The room's own colour and small sounds: `tone` [lowpass Hz, level], `roof` the rain's loudness from inside, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  silk: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 34]] },
  rawsilk: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 40]] },
  cotton: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 30], ['abacus', 60]] },
  paper: { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 26]] },
  ramie: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 36]] },
  fish: { tone: [450, 0.4], roof: 1.0, hush: 0.9, work: [['bowlClack', 22]] },
  shop: { tone: [300, 0.2], roof: 1.0, hush: 0.9, work: [['paper', 60]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },       // paper doors and ondol floors: the yard heard through them
  hall: { tone: [160, 0.22], roof: 0.8, hush: 0.5, work: [['paper', 80]] },       // the throne hall: timber on stone, the court outside nearly gone
};
/** The upper rooms (none to speak of: Joseon houses were of one storey; the bell pavilion's upper floor is not walked). */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40]] };

// ── the emitters (the engine's fixed ones; `at: [0, 0], r50: 1000` is a listener-relative one: the voice finds its own street) ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const EVERY = [[0, 0], 1000];
export const EMITTERS = [
  // the beating of cloth in the hanok yards: in the evening and late, the pestle by day
  ...yards().filter((y) => y.wide).map((y) => E('seoDadeumi', y.at, 14, [20, 55], [19, 25.5], { dry: true, inside: y.id })),
  ...yards().filter((y) => !y.wide).map((y) => E('seoPestle', y.at, 12, [40, 100], [7, 17], { dry: true })),
  // the listener-relative ones: they make their own source in a street near the listener
  E('seoPedlar', ...EVERY, [34, 80], [5.5, 18], { rainMax: 0.4 }),
  E('seoGawi', ...EVERY, [60, 140], [10, 17], { dry: true }),
  E('seoOxBell', ...EVERY, [90, 200], [7, 17], { dry: true }),
  E('seoGyeongjeom', ...EVERY, [40, 90], [22.5, 4], { rainMax: 0.5 }),
];
