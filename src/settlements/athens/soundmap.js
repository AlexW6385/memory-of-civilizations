// Where Athens' sounds are (docs/settlements/athens.md §20): the places of its emitters and the geometry the audio engine
// needs to put each sound where it is made — the Agora's hawkers, herald and fish bell, the fountain house, the smith at the
// Hephaisteion, the potters, the shops under the south side, the houses' work, the aulos at the altar, the masons on the
// Erechtheion, the kithara at the Academy, the rooms one can be inside. Pure data and functions of layout.js and quarters.js
// (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-athens.js). Coordinates: metres, +x east, +z south, the settlement's own frame.
//
// What the scheduler of voices.js asks of a map but Athens has not is answered with nothing (no canals, no pond, no bridge, no
// street track: the walkers' and the vendors' voices of Suzhou are not Athens'; the hawkers are placed at their stalls).

import { RADIUS, ACRO, AGORA, KOLONOS, FOUNTAIN, SHOPROW, KERAMEIKOS, ACADEMY, ODEION, SIMON, lots, inRect } from './layout.js';
import { WORKSHOPS, PALAESTRA } from './quarters.js';

/** Where the audio puts the listener when the engine gives none (the Agora's north-west corner, where the Way comes in). */
export const HOME = [-262, -220];

/** A deterministic 0…1 from numbers (the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const OPEN_TRADES = ['bronze', 'shoe', 'cloth', 'wine', 'perfume', 'carpenter'];       // town.js: the trade of a walk-in house's shop, by its order among the open lots
/** The work heard from each trade's shop: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the trade] */
const TRADE_WORK = {
  bronze: [['hammer', [12, 30], [6.5, 17.5]]],
  shoe: [['athCobbler', [8, 20], [6.5, 18]]],
  cloth: [['clothRustle', [18, 40], [7, 18]]],
  wine: [['pourWine', [30, 70], [9, 21]]],
  perfume: [['mortar', [18, 40], [7, 17.5]]],
  carpenter: [['plane', [16, 38], [7, 17.5]]],
  potter: [['wheel', [30, 60], [6.5, 17]]],
  painter: [['brush', [20, 45], [7, 17]]],
  tile: [['clay', [14, 30], [6.5, 17]]],
  coroplast: [['clay', [14, 30], [7, 17]]],
};
/** The household's own sounds (the women's loom and quern, the kitchen, the court's hens), by the kind of house. */
const HOUSE_WORK = {
  small: [['kitchen', [14, 30], [5.5, 20]], ['athQuern', [40, 90], [5.5, 10]], ['athHens', [30, 80], [6, 18.5]]],
  pastas: [['kitchen', [12, 26], [5.5, 21]], ['loom', [24, 50], [6.5, 18.5]], ['athSymposium', [60, 140], [19.5, 24.5]]],
  workshop: [['chisel', [14, 30], [7, 17.5]], ['kitchen', [20, 40], [6, 20]], ['athHens', [40, 90], [6, 18.5]]],
  simon: [['kitchen', [14, 30], [5.5, 20]], ['loom', [26, 60], [6.5, 18.5]]],
};

let SITES = null;
/** The houses and shops with sounds: { use, rect, at: [x, z] (the middle), id, work, y? }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const opened = lots().filter((l) => l.open);
  opened.forEach((l, k) => {
    const trade = OPEN_TRADES[k % OPEN_TRADES.length], kind = l.kind;
    const work = !kind || kind === 'simon' ? [...(TRADE_WORK[trade] || []), ...HOUSE_WORK.simon] : HOUSE_WORK[kind] || [];
    SITES.push({ use: kind && kind !== 'simon' ? kind : 'shop:' + trade, rect: l.rect, at: mid(l.rect), id: 'house:' + l.seed, work, y: l.y });
  });
  // Simon the shoemaker's house by the Agora's south-west corner (§5b)
  SITES.push({ use: 'shop:shoe', rect: SIMON, at: mid(SIMON), id: 'simon', work: [...TRADE_WORK.shoe, ...HOUSE_WORK.simon], y: 0 });
  // the five shops under the south side (town.js: a stoa's rooms in a row)
  { const [x0, , x1, z1] = SHOPROW, rw = (x1 - x0 - 1.4) / 5;
    ['bronze', 'perfume', 'cloth', 'wine', 'carpenter'].forEach((trade, k) => {
      const r = [x0 + 0.7 + k * rw + 0.3, z1 - 5.9 + 0.55, x0 + 0.7 + (k + 1) * rw - 0.1, z1 - 0.8];
      SITES.push({ use: 'shop:' + trade, rect: r, at: mid(r), id: 'row:' + trade, work: TRADE_WORK[trade], y: 0.35 });
    }); }
  // the potters' workshops of the Kerameikos: the workroom on the lane
  WORKSHOPS.forEach((w, i) => {
    const [x0, z0, , z1] = w.rect, n = w.front === 'n', r = n ? [x0 + 0.5, z0 + 0.5, x0 + 9.6, z0 + 5.3] : [x0 + 0.5, z1 - 5.3, x0 + 9.6, z1 - 0.5];
    SITES.push({ use: 'workshop:' + w.trade, rect: r, at: mid(r), id: 'works:' + i, work: TRADE_WORK[w.trade] || [], y: 0 });
  });
  return SITES;
}

/** The wells of the lanes (fronts.js crossings(): the ones built; tests/athens-sound.test.mjs checks them against it). */
export const WELLS = [[128.6, -173.0], [-136.3, 168.0], [27.9, 199.0]];

/** The stalls' hawkers, at the stalls of wayside.js stallSites() (the test checks each against it): [voice, [x, z]]. */
const HAWKERS = [['athHawkCheese', [-205, -129.7]], ['athHawkWreaths', [-249, -182]], ['athHawkOlives', [-253.3, -190.5]], ['athHawkCheese', [-291.7, -237.4]], ['athHawkWreaths', [-282.4, -248.4]]];

const THOLOS = [-280, -133];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['temple:parthenon', 'temple', [-35, -16, 35, 16], 70.2],
  ['temple:erechtheion', 'temple', [23, -52, 40, -39], 70.9],
  ['temple:hephaisteion', 'temple', [KOLONOS.c[0] - 13, KOLONOS.c[1] - 4, KOLONOS.c[0] + 7, KOLONOS.c[1] + 4], 0],
  ['tholos', 'hall', [THOLOS[0] - 9, THOLOS[1] - 9, THOLOS[0] + 9, THOLOS[1] + 9], 0],
  ['fountain', 'fountain', FOUNTAIN, 0],
];
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: a shop's trade ('shop:bronze' …), a
 * workshop's ('workshop:potter' …), a house's kind ('small', 'pastas', 'workshop'), temple, hall (the Tholos), fountain.
 */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}

/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the tiles is, `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  house: { ...R0, work: [['kitchen', 40]] },
  small: { ...R0, work: [['kitchen', 36], ['athHens', 70]] },
  pastas: { tone: [330, 0.3], roof: 1.0, hush: 0.8, work: [['kitchen', 30], ['clothRustle', 60]] },
  workshop: { tone: [380, 0.35], roof: 1.0, hush: 0.9, work: [['chisel', 40]] },
  'shop:bronze': { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['drawer', 120]] },
  'shop:shoe': { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['athCobbler', 22]] },
  'shop:cloth': { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 26]] },
  'shop:wine': { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['jarLid', 40]] },
  'shop:perfume': { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['jarLid', 60]] },
  'shop:carpenter': { tone: [320, 0.3], roof: 1.0, hush: 0.9, work: [['plane', 24]] },
  'workshop:potter': { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  'workshop:painter': { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['brush', 30]] },
  'workshop:tile': { tone: [340, 0.3], roof: 1.0, hush: 0.9, work: [['clay', 14]] },
  'workshop:coroplast': { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clay', 16]] },
  temple: { tone: [130, 0.3], roof: 0.6, hush: 0.45, work: [['clothRustle', 90]] },
  hall: { tone: [160, 0.25], roof: 0.7, hush: 0.55, work: [['kitchen', 50]] },
  fountain: { tone: [520, 0.3], roof: 0.6, hush: 0.95, work: [['athHydria', 18]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.3, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** Is there a tree at (x, z): the Academy's grove (olives and planes), the plane trees along the Agora's edges, the olive land of the rim. */
function treeAt(x, z) {
  if (inRect(ACADEMY, x, z, -5)) return true;
  if (inRect(AGORA, x, z) && !inRect(AGORA, x, z, -9)) return true;
  return Math.hypot(x, z) > RADIUS - 90 && Math.hypot(x, z) < RADIUS - 8;
}
/** 0…1: how much green round (x, z) for the cicadas and insects: the grove, the Agora's planes, the rim's olives; the town's lanes a little. */
export function greenNear(x, z) {
  const grove = 1 - sm(0, 30, rectDist(ACADEMY, x, z)), plane = 0.6 * (1 - sm(0, 24, rectDist(AGORA, x, z))), rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z));
  return Math.max(grove, plane, rim * 0.85, 0.18);
}
/** 0…1: how much broad leaf round (the olives, the planes), for the rustle in a wind. */
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (treeAt(px, pz)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the Agora and the lanes round it, some on the summit, little in the grove and beyond the houses. */
export function townNear(x, z) {
  if (inRect(AGORA, x, z, 12)) return 1;
  if (inRect(ACADEMY, x, z, 4)) return 0.15;
  if (Math.hypot((x - ACRO.c[0]) / ACRO.r[0], (z - ACRO.c[1]) / ACRO.r[1]) < 0.55) return 0.3;
  return Math.max(0.12, 0.8 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 20, Math.hypot(x, z))));
}

// what Athens has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ─────────────────────────────────────────────────
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry` (not in
 * rain), `rainMax`, `lv`, `after` (spaced from the end of a long one). The houses' own work comes from sites().
 */
export const EMITTERS = [
  // the Agora by day: the herald at the Council's house (by the Tholos), the fish-market's bell, the hawkers at their stalls
  { voice: 'athHerald', at: [-283, -151], r50: 30, gap: [70, 170], hours: [7.5, 12.5], rainMax: 0.7 },
  { voice: 'athFishBell', at: [-200, -150], r50: 30, gap: [120, 260], hours: [7.5, 11], rainMax: 0.7 },
  ...HAWKERS.map(([voice, at], i) => ({ voice, at, r50: 16, gap: [26 + i * 4, 70 + i * 6], hours: [7, 14], rainMax: 0.5 })),
  // the South-East Fountain House: women filling their jars (§11b)
  { voice: 'athHydria', at: mid(FOUNTAIN), r50: 14, gap: [18, 46], hours: [5.5, 18.5], dry: true },
  // the smith at the Hephaisteion on the Kolonos hill, the bronze-workers' quarter about it
  { voice: 'hammer', at: [KOLONOS.c[0] + 14, KOLONOS.c[1] + 12], r50: 15, gap: [14, 34], hours: [6.5, 17.5], dry: true },
  // the masons at the Erechtheion, not yet finished (the accounts of 409/8, dossier §20)
  { voice: 'athMallet', at: [31, -56], r50: 15, gap: [12, 30], hours: [6.5, 17], dry: true },
  // the flute at the altar of Athena, the sacrifice's music (§14)
  { voice: 'athAulos', at: [73, 24], r50: 20, gap: [80, 200], hours: [7, 11.5], rainMax: 0.3, after: true },
  // the Odeion, built for music: a kithara and an aulos in practice
  { voice: 'athKithara', at: mid(ODEION.rect), r50: 22, gap: [70, 160], hours: [8, 17.5], rainMax: 0.5, after: true },
  { voice: 'athAulos', at: [mid(ODEION.rect)[0] + 6, mid(ODEION.rect)[1] - 4], r50: 20, gap: [120, 280], hours: [9, 17], rainMax: 0.4, after: true },
  // the Academy's palaestra: a kithara with the lessons
  { voice: 'athKithara', at: mid(PALAESTRA), r50: 16, gap: [80, 180], hours: [8, 16.5], rainMax: 0.5, after: true },
  // the little owl on the rock at night
  { voice: 'athOwl', at: [30, -30], r50: 45, gap: [25, 70], hours: [20, 4.5], rainMax: 0.5 },
  { voice: 'athOwl', at: [-100, 20], r50: 45, gap: [40, 100], hours: [20.5, 4], rainMax: 0.5 },
  // hens by the lanes at the Kerameikos' edge
  { voice: 'athHens', at: [KERAMEIKOS[0] + 12, KERAMEIKOS[3] + 4], r50: 9, gap: [40, 100], hours: [6, 18.5], dry: true },
];
