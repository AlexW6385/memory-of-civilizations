// Where Muromachi Kyoto's sounds are (docs/settlements/muromachi-kyoto.md §12): the places of its emitters and the geometry the
// audio engine needs to put each sound where it is made (src/engine/voices.js `placed()`, voices-kyoto.js): the stream, the
// streets, the bridge, the ponds, the houses at their trades, the temples' bells and halls, the shrine's Noh stage, the planting,
// the rooms one can be inside. Pure data and functions of layout.js and streetwork.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`). Coordinates: metres, +x east, +z south, the settlement's frame.
//
// The engine's scheduler was written for Suzhou and calls three things this city does not have, each by its own arguments:
// `streetTrack(…, 90, 40)` (a sedan chair), `streetTrack(…, 90, 34)` (the night watchman), `streetTrack(…, 80, 30)` (the
// Chinese pedlars' cries) and `treeSpot(…, 40)` (the Chinese seasonal birds). Here those four return null, and the city's own
// pedlars, birds and cicadas are made by voices-kyoto.js through `pedlarTrack` and `treeSpot(…, 41)`, which do answer.

import '../../engine/voices-kyoto.js';
import { STREAM, BRIDGES, GINKAKU, RYOAN, SHRINE, TEA, RADIUS, lots, streets, yards, inRect, inPond, isOpen } from './layout.js';
import { furniture, STEP_Z } from './streetwork.js';

/** Where the audio puts the listener when the engine gives none (the arrival, on the south bank of Ginkaku-ji's pond). */
export const HOME = [200, 17];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];

// ── the houses at their trades ──────────────────────────────────────────────────
/** What each trade's house makes heard: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade and the dossier §10 list of trades]. */
const WORK = {
  smith: [['hammer', [12, 30], [7, 18]]],
  cloth: [['loom', [10, 24], [6.5, 18.5]]],
  dye: [['washCloth', [16, 36], [7, 17]]],
  sake: [['vatStir', [30, 70], [4, 17]]],
  pottery: [['wheel', [30, 60], [8, 17]]],
  rice: [['kine', [20, 50], [6, 17]]],
  paper: [['sukiya', [30, 70], [7, 17]]],
  sandals: [['strawBeat', [18, 40], [7, 18]]],
  wood: [['ogaSaw', [18, 40], [7, 17.5]], ['plane', [26, 60], [7, 17.5]]],
  food: [['kitchen', [10, 22], [6, 21]]],
  tea: [['kettleSimmer', [14, 30], [6, 21]], ['teaClink', [12, 30], [7, 20]]],
  doso: [['coin', [20, 50], [8, 17]]],
};
let SITES = null;
/** The houses with sounds: a third of the open houses of the trades above, by seed: { use, rect, at, id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!isOpen(l) || !WORK[l.trade] || l.seed % 3) continue;
    const [x0, z0, x1, z1] = l.rect;
    SITES.push({ use: l.trade, rect: l.rect, at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'lot:' + l.seed, work: WORK[l.trade] });
  }
  return SITES;
}

// ── the temples, the shrine, the hut ────────────────────────────────────────────
const BELL = { ginkaku: [140, -52], ryoan: [-208, -122] };          // the bell towers (streetwork.js templeWork)
const ROOMRECT = {
  hojo: [RYOAN.hojo[0] - 13, RYOAN.hojo[1] - 6, RYOAN.hojo[0] + 13, RYOAN.hojo[1] + 6],
  togudo: [GINKAKU.togudo[0] - 3.5, GINKAKU.togudo[1] - 3.5, GINKAKU.togudo[0] + 3.5, GINKAKU.togudo[1] + 3.5],
  kannon: [GINKAKU.kannon[0] - 4.9, GINKAKU.kannon[1] - 3.9, GINKAKU.kannon[0] + 4.9, GINKAKU.kannon[1] + 3.7],
  shrine: [SHRINE.hall[0] - 4.5, SHRINE.hall[1] - 3, SHRINE.hall[0] + 4.5, SHRINE.hall[1] + 3],
  tea: [TEA.hut[0] - 3, TEA.hut[1] - 2.5, TEA.hut[0] + 3, TEA.hut[1] + 2.5],
};

/** The wells of the town: the public wells at the crossings (streetwork.js furniture) and the one in each block's yard (town.js civic(), the same random walk). */
export function wells() {
  const out = furniture().filter((e) => e.t === 'ido').map((e) => e.at);
  let s = 77; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const y of yards()) {
    const cx = (y[0] + y[2]) / 2, cz = (y[1] + y[3]) / 2;
    if (inRect([TEA.hut[0] - 10, TEA.hut[1] - 7, TEA.hut[0] + 10, TEA.hut[1] + 16], cx, cz)) continue;
    out.push([cx + (r() - 0.5) * 8, cz + (r() - 0.5) * 8]);
  }
  return out;
}
export const WELLS = wells();

// ── geometry of the water and the streets ───────────────────────────────────────
const STREAM_RECT = [STREAM.x0, -275, STREAM.x1, 275];
/** The nearest point of the stream's water (its stone-lined wall's foot) to (x, z), the distance and the index (one reach). */
export function canalSpot(x, z) { const p = nearIn(STREAM_RECT, x, z); return { p, d: Math.hypot(p[0] - x, p[1] - z), i: 0 }; }
/** No boats on the stream (the punter of the dossier is a figure at rest). */
export function canalTrack() { return null; }

/** A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function pedlarTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  const S = streets();
  S.forEach((r, i) => { if (Math.min(r[2] - r[0], r[3] - r[1]) < 5) return; const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = S[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, mid + off], [b, mid + off]] } : { pts: [[mid + off, a], [mid + off, b]] };
}
/** The engine's street walkers (sedan chair, watchman, Chinese pedlar) do not exist here; `ring('watch')` is never scheduled. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  if (lead === 40 || lead === 34 || (reach === 80 && lead === 30)) return null;
  return pedlarTrack(x, z, rnd, reach, lead);
}
/** The bridge over the stream nearest to (x, z) within `reach`, a walker's track over it. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  let best = null;
  for (const [bx, bz] of BRIDGES) { const d = Math.hypot(bx - x, bz - z); if (d < reach && (!best || d < best.d)) best = { bx, bz, d }; }
  if (!best) return null;
  const h = 6.25 + 3, s = rnd() < 0.5 ? 1 : -1;
  return { pts: [[best.bx - s * h, best.bz + (rnd() - 0.5)], [best.bx + s * h, best.bz + (rnd() - 0.5)]], d: best.d };
}
/** A point on a pond's water within `reach` of (x, z) (a ring of tries), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (!(inRect(GINKAKU.rect, x, z, 30) || inRect(RYOAN.rect, x, z, 30))) return null;
  for (let k = 0; k < 14; k++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (inPond(px, pz, -2)) return [px, pz]; }
  return null;
}
/** The pond's shore near (x, z): where a ray from it first crosses the water's edge, or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  if (!(inRect(GINKAKU.rect, x, z, 30) || inRect(RYOAN.rect, x, z, 30))) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = inPond(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const w = inPond(x + c * d, z + s * d); if (w !== prev) return [x + c * d, z + s * d]; prev = w; }
  }
  return null;
}

// ── where the planting makes its sound ──────────────────────────────────────────
const HILL = [275, -120, 340, 120];                           // the Higashiyama behind Ginkaku-ji: cedars, pines
/** 0…1: how wooded is (x, z): the temples' gardens, the shrine's grove, the hill, the yards' persimmons and maples. */
export function treeness(x, z) {
  let m = 0.1;
  if (inRect(GINKAKU.rect, x, z) && !inPond(x, z, 0.1)) m = Math.max(m, 0.8);
  if (inRect(RYOAN.rect, x, z) && !inPond(x, z, 0.1)) m = Math.max(m, 0.7);
  if (inRect(SHRINE.rect, x, z)) m = Math.max(m, 0.85);
  m = Math.max(m, 1 - sm(0, 40, rectDist(HILL, x, z)));
  for (const y of yards()) if (inRect(y, x, z, 4)) { m = Math.max(m, 0.35); break; }
  return m;
}
/**
 * A tree to put a cicada or a bird in, near (x, z), by the woodedness: null at once for the engine's own seasonal-bird call
 * (reach 40: the Chinese cuckoo, oriole, magpie and tit), which the city's own voices replace (they ask with 41).
 */
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach === 40) return null;
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && treeness(px, pz) > 0.25 + 0.6 * rnd()) return [px, pz];
  }
  return null;
}
/** 0…1: bamboo (the fences, the hut's yard; Ryōan-ji's grove corner). Low: Kyoto's bamboo groves lay outside the disc. */
export function bambooNear(x, z) { return Math.max(0.12, 0.45 * (1 - sm(0, 25, rectDist(RYOAN.rect, x, z))), 0.3 * (1 - sm(0, 14, Math.hypot(x - TEA.hut[0], z - TEA.hut[1])))); }
/** 0…1: pine and broad leaves in wind (the gardens' pines and maples, the hill, the shrine's grove; the yards' persimmons and willows by the stream). */
export function leafNear(x, z) {
  const t = treeness(x, z), gard = Math.max(1 - sm(0, 24, rectDist(GINKAKU.rect, x, z)), 1 - sm(0, 24, rectDist(RYOAN.rect, x, z)), 1 - sm(0, 24, rectDist(SHRINE.rect, x, z)));
  const willow = 0.45 * (1 - sm(1, 14, canalSpot(x, z).d));
  return Math.min(1, Math.max(0.3 + 0.65 * t * 0.6, 0.8 * gard, willow, 1 - sm(0, 45, rectDist(HILL, x, z))));
}
/** No lotus (the dossier gives none). */
export function lotusNear() { return 0; }
/** 0…1: how much green round (x, z) for the insects: the gardens, the hill, the yards, the stream's banks, the paddies at the rim. */
export function greenNear(x, z) {
  const edge = sm(230, 290, Math.hypot(x, z)), bank = 0.55 * (1 - sm(1, 18, canalSpot(x, z).d));
  return Math.max(treeness(x, z) * 0.9, edge * 0.85, bank, 0.14);
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the streets, little in the temples and the shrine, less toward the rim. */
export function townNear(x, z) {
  if (inRect(GINKAKU.rect, x, z) || inRect(RYOAN.rect, x, z)) return 0.12;
  if (inRect(SHRINE.rect, x, z)) return 0.2;
  return Math.max(0.1, 1 - 0.6 * sm(180, 260, Math.hypot(x, z)));
}
const pondRect = (P) => [P.c[0] - P.r[0], P.c[1] - P.r[1], P.c[0] + P.r[0], P.c[1] + P.r[1]];
/** 0…1: wet ground (the frogs): the ponds, the stream, the paddies at the rim. */
export function frogGround(x, z) {
  const pond = Math.max(1 - sm(0, 30, rectDist(pondRect(GINKAKU.pond), x, z)), 1 - sm(0, 30, rectDist(pondRect(RYOAN.pond), x, z)));
  return Math.max(pond, 0.5 * (1 - sm(2, 20, canalSpot(x, z).d)), sm(230, 290, Math.hypot(x, z)) * 0.9);
}

// ── the rooms ───────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const l of lots()) for (let i = Math.floor(l.rect[0] / 20); i <= Math.floor(l.rect[2] / 20); i++) for (let j = Math.floor(l.rect[1] / 20); j <= Math.floor(l.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(l); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((l) => inRect(l.rect, x, z));
};
/**
 * The room the listener is in: { use, at, upper, same } or null in the open. Uses: a trade's (smith, cloth, dye, sake, pottery, rice, paper,
 * sandals, wood, food, tea, doso, lacquer), house (a dwelling or a shop of no sound-making trade), hall (the Kannon-den), togudo, hojo, shrine, hut.
 */
export function roomAt(x, z, y = 0) {
  for (const [k, r] of Object.entries(ROOMRECT)) if (inRect(r, x, z)) return { use: k === 'kannon' ? 'hall' : k === 'tea' ? 'hut' : k, at: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], upper: k === 'kannon' && y > 2.4, same: 'room:' + k };
  const l = lotAt(x, z);
  if (l) return { use: ROOMS[l.trade] && WORK[l.trade] ? l.trade : 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper: y > 2.4, same: 'lot:' + l.seed };
  return null;
}
/** The room's own colour and small sounds (as Suzhou's ROOMS): `tone` [lowpass Hz, level], `roof` the rain's loudness from inside (boards and stones: a dull patter), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  smith: { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['drawer', 120]] },
  cloth: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 30]] },
  dye: { tone: [380, 0.35], roof: 1.0, hush: 0.9, work: [['clothRustle', 40]] },
  sake: { tone: [260, 0.25], roof: 1.0, hush: 0.7, work: [['jarLid', 40]] },
  pottery: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  rice: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['sack', 30]] },
  paper: { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 26]] },
  sandals: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 34]] },
  wood: { tone: [360, 0.3], roof: 1.0, hush: 0.9, work: [['knock', 60]] },
  food: { tone: [500, 0.5], roof: 1.0, hush: 0.9, work: [['bowlClack', 14]] },
  tea: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['teaClink', 12]] },
  doso: { tone: [240, 0.2], roof: 0.9, hush: 0.6, work: [['coin', 34]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  hall: { tone: [160, 0.22], roof: 0.7, hush: 0.55, work: [['paper', 70]] },        // the Kannon-den's dark timber hall: high, empty
  togudo: { tone: [200, 0.2], roof: 0.8, hush: 0.6, work: [['brush', 50]] },        // the 4½-mat room under its bark roof
  hojo: { tone: [150, 0.25], roof: 0.7, hush: 0.5, work: [['brush', 80]] },
  shrine: { tone: [180, 0.2], roof: 0.7, hush: 0.6, work: [] },
  hut: { tone: [220, 0.25], roof: 1.0, hush: 0.45, work: [['kettleSimmer', 9]] },    // the tea hut: the kettle's pine wind
};
/** The upper rooms of the town houses: close under the boards, the rain loud. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40]] };

// ── the emitters (the engine's fixed ones; `at: [0, 0], r50: 1000` is a listener-relative one: the voice finds its own street or tree) ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const EVERY = { at: [0, 0], r50: 1000 };
export const EMITTERS = [
  // the bells at dawn and dusk (the engine's own bell schedule is off here), the board struck before the dawn bell
  E('bonshoGinkaku', BELL.ginkaku, 90, [10, 12], [5.3, 5.55], { after: true }), E('bonshoGinkaku', BELL.ginkaku, 90, [10, 12], [17.95, 18.2], { after: true }),
  E('bonshoRyoan', BELL.ryoan, 90, [10, 12], [5.3, 5.55], { after: true }), E('bonshoRyoan', BELL.ryoan, 90, [10, 12], [17.95, 18.2], { after: true }),
  E('hanBoard', [BELL.ginkaku[0] + 6, BELL.ginkaku[1] + 8], 28, [10, 12], [4.95, 5.2], { after: true }), E('hanBoard', [-199, -111], 28, [10, 12], [4.95, 5.2], { after: true }),
  // the sutra in the Tōgu-dō and the hōjō, at the morning and evening service
  E('keisuChant', ROOMS_AT('togudo'), 16, [10, 14], [5.65, 6.2], { inside: 'room:togudo', after: true }), E('keisuChant', ROOMS_AT('togudo'), 16, [10, 14], [18.25, 18.8], { inside: 'room:togudo', after: true }),
  E('keisuChant', ROOMS_AT('hojo'), 22, [10, 14], [5.65, 6.2], { inside: 'room:hojo', after: true }), E('keisuChant', ROOMS_AT('hojo'), 22, [10, 14], [18.25, 18.8], { inside: 'room:hojo', after: true }),
  // the gravel raked and swept in the morning: the court of Ginkaku-ji, the rock garden of Ryōan-ji
  E('gravel', [GINKAKU.kannon[0] - 4, GINKAKU.kannon[1] + 9.5], 12, [8, 20], [5.8, 8.2], { dry: true }), E('gravel', [(RYOAN.garden[0] + RYOAN.garden[2]) / 2, (RYOAN.garden[1] + RYOAN.garden[3]) / 2], 10, [10, 24], [6, 8.5], { dry: true }),
  // the Noh stage of the shrine: a passage now and then through the daylight hours, in fine weather (a subscription performance)
  E('noh', SHRINE.noh, 24, [50, 100], [10.3, 15.5], { rainMax: 0.05, after: true }),
  // the tea hut: the kettle
  E('kettleSimmer', TEA.hut, 6, [12, 26], [6, 21], { inside: 'room:tea' }),
  // a komusō's flute from the stream's east bank at dusk
  E('shakuhachi', [104, -88], 30, [70, 160], [17, 20], { rainMax: 0.3, after: true }),
  // the listener-relative ones: they make their own source in a street or a tree near the listener
  E('pedlar', ...[EVERY.at, EVERY.r50], [34, 80], [6, 17.5], { rainMax: 0.4 }),
  E('packhorse', ...[EVERY.at, EVERY.r50], [120, 260], [8, 17], { dry: true }),
  E('higurashi', ...[EVERY.at, EVERY.r50], [5, 14], [4.6, 6.2], { rainMax: 0.3 }), E('higurashi', ...[EVERY.at, EVERY.r50], [5, 14], [17.4, 19.4], { rainMax: 0.3 }),
  E('uguisu', ...[EVERY.at, EVERY.r50], [14, 40], [5.5, 17], { rainMax: 0.3 }),
  E('hototogisu', ...[EVERY.at, EVERY.r50], [20, 60], [19, 23.5], { rainMax: 0.3 }), E('hototogisu', ...[EVERY.at, EVERY.r50], [20, 60], [3.5, 5.5], { rainMax: 0.3 }),
  E('suzumushi', ...[EVERY.at, EVERY.r50], [3, 8], [18.5, 24], { rainMax: 0.2 }), E('suzumushi', ...[EVERY.at, EVERY.r50], [3, 8], [0, 4.5], { rainMax: 0.2 }),
  E('owl', [300, -40], 80, [40, 110], [21, 4.5], { rainMax: 0.4 }),
  // the women washing at the steps of the stream's west bank
  ...STEP_Z.filter((z) => Math.hypot(STREAM.x0, z) < RADIUS - 40).map((z) => E('washCloth', [STREAM.x0 + 1.2, z + 0.5], 9, [14, 32], [6.5, 16.5], { dry: true })),
];
function ROOMS_AT(k) { const r = ROOMRECT[k]; return [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]; }

export { BELL };
