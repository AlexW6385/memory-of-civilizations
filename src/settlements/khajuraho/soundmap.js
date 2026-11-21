// Where Khajuraho's sounds are (docs/settlements/khajuraho.md §20): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the bell hung in each porch, the drum and the chant of the dawn and evening worship at the temples, the flower-sellers' calls and the sweet-makers' pans on
// the pilgrims' lane, the work of the open shops and houses (the oil press, the potter's wheel, the grinder, the hearth, the smith), the pour of water at the
// tank's ghat and the wells of the lanes, the zebu carts on the road, the peafowl and the owlet of the plain, the rooms one can be inside. Pure data and functions of
// layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-khajuraho.js).
// Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout: what sounded is from the dossier §9, §11, §18; the hours follow the day of a
// temple town (the dawn worship, the markets by day, the lamp-waving at dusk).]
//
// What the scheduler asks of a map but Khajuraho has not (no canals, ponds with boats, bridges, street walkers of Suzhou) is answered with nothing.
import '../../engine/voices-khajuraho.js';
import { RADIUS, TEMPLES, STREETS, TANK, lots, yards, tankD, inTank, nearTemple, onStreet, inRect } from './layout.js';
import { porchOf } from './life.js';

/** Where the audio puts the listener when the engine gives none (the arrival in the pilgrims' approach). */
export const HOME = [-14, -60];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const WORK = {
  home: [['kitchen', [14, 30], [5, 21]], ['grinder', [50, 100], [4.5, 8.5]]],
  weaver: [['loom', [10, 24], [6.5, 18]]],
  grain: [['sack', [30, 70], [7, 18]], ['jarLid', [40, 90], [7, 18]]],
  oil: [['mortar', [8, 20], [6, 18]], ['pour', [40, 90], [6, 18]]],
  potter: [['wheel', [24, 50], [6.5, 17.5]], ['clay', [12, 28], [6.5, 17.5]]],
  flowers: [['clothRustle', [30, 60], [5, 19]]],
  sweets: [['khaPan', [10, 24], [5.5, 21]], ['kitchen', [14, 30], [5.5, 21]]],
  cloth: [['clothRustle', [24, 50], [7, 19]]],
  smith: [['hammer', [10, 26], [7, 17]]],
  cattle: [['clothRustle', [40, 90], [0, 24]]],
  rest: [['clothRustle', [40, 90], [0, 24]]],
};
const HOME_USES = ['home', 'home', 'weaver', 'home', 'grain', 'home'];

let SITES = null;
/** The rooms with sounds: { use, rect, at: [x, z] (the middle), id, work, y }: the open shops (by trade), the open homes, merchants' houses, mud houses and huts, the cattle sheds. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!l.open || l.farm) continue;
    const use = l.kind === 'shop' ? l.trade : l.kind === 'shed' ? 'cattle' : HOME_USES[l.seed % HOME_USES.length];
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[use], y: 0, storeys: l.kind === 'haveli' ? 2 : 1 });
  }
  return SITES;
}

/** The wells of the lane crossings on the road (town.js: a well by the road's north verandah at each lane). */
export const WELLS = STREETS.filter((s) => s.axis === 'z' && s.kind === 'lane').map((s) => [s.c + s.w / 2 + 0.6, 10 - 4 - 0.6]);
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
const K = TEMPLES[0], KP = porchOf(K);
/** The hall and sanctum of Kandariya: the rooms of the temple one can stand in (layout: plan.js rooms 'kandariya halls', 'kandariya garbhagriha'). */
const ROOM_RECTS = [
  ['room:garbhagriha', 'sanctum', [K.c[0] - 2.4, K.c[1] - 2.4, K.c[0] + 6.5, K.c[1] + 2.4]],
  ['room:halls', 'hall', [K.c[0] + K.w / 2, K.c[1] - K.w * 0.48, KP.r[0], K.c[1] + K.w * 0.48]],
];
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: s.storeys > 1 && y > (s.y ?? 0) + 3.6, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z) && y > 0.5) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (clay tiles or a flat mud roof), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  weaver: { ...R0, work: [['loom', 14]] },
  grain: { ...R0, tone: [260, 0.2], work: [['sack', 40]] },
  oil: { ...R0, tone: [280, 0.25], work: [['mortar', 14]] },
  potter: { ...R0, tone: [280, 0.25], work: [['wheel', 30]] },
  flowers: { ...R0, roof: 1.0, work: [['clothRustle', 40]] },
  sweets: { ...R0, tone: [420, 0.35], work: [['khaPan', 14]] },
  cloth: { ...R0, work: [['clothRustle', 30]] },
  smith: { ...R0, tone: [360, 0.3], work: [['hammer', 12]] },
  cattle: { ...R0, tone: [240, 0.2], work: [['clothRustle', 60]] },
  rest: { ...R0, work: [['clothRustle', 60]] },
  hall: { tone: [230, 0.25], roof: 0.5, hush: 0.45, work: [['khaPorchBell', 40]] },
  sanctum: { tone: [170, 0.25], roof: 0.4, hush: 0.3, work: [['khaChant', 40]] },
};
export const UPPER = { tone: [260, 0.15], roof: 1.0, hush: 0.7, work: [['clothRustle', 50]] };

// ── the planting, the town ──────────────────────────────────────────────────
const CORE = [160, 10];
/** 0…1: how much green round (x, z): the mango and neem groves thickening round the village, the tank's margin, little on the swept terraces. */
export function greenNear(x, z) {
  const rim = sm(RADIUS - 150, RADIUS - 50, Math.hypot(x, z)), tank = 1 - sm(0, 26, tankD(x, z));
  return Math.max(0.2, rim * 0.9, tank * 0.6);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the neem, pipal and mango of the village's edge and the tank's margin. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !nearTemple(px, pz, 3) && !inTank(px, pz) && !onStreet(px, pz, 2) && (Math.hypot(px, pz) > RADIUS - 90 || tankD(px, pz) < 30 || hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.12)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the road and the pilgrims' lane by day, the village lanes, little on the terraces, less toward the rim. */
export function townNear(x, z) {
  if (inRect([-30, 4, 200, 16], x, z, 3) || inRect([-30, -66, 24, -54], x, z, 3)) return 1;
  if (STREETS.some((s) => s.kind === 'lane' && onStreet(x, z, 2))) return 0.6;
  if (TEMPLES.some((t) => nearTemple(x, z, 0) && Math.abs(z - t.c[1]) < t.w + 6)) return 0.15;
  return Math.max(0.12, 0.6 * (1 - 0.7 * sm(60, RADIUS - 20, Math.hypot(x - CORE[0], z - CORE[1]))));
}
// what Khajuraho has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = (x, z) => (tankD(x, z) < 6 ? 1 : 0);
export const frogGround = (x, z) => (tankD(x, z) < 10 ? 0.8 : 0.1);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const porch = (t) => { const p = porchOf(t); return [(p.r[0] + p.r[2]) / 2, p.cz]; };
const approachSweets = lots().filter((l) => l.street === 'approach' && l.kind === 'shop' && l.open && l.trade === 'sweets').slice(0, 3);
const frontOf = (l) => { const m = mid(l.rect); return { s: [m[0], l.rect[3] + 1.5], n: [m[0], l.rect[1] - 1.5], e: [l.rect[2] + 1.5, m[1]], w: [l.rect[0] - 1.5, m[1]] }[l.front]; };
const GHAT = [TANK.c[0], TANK.c[1] - TANK.r[1] - 6];
export const EMITTERS = [
  // each temple's porch: the bell rung by the pilgrims by day, the drum and the chant at dawn and at the lamp-waving at dusk; Kandariya's sanctum chanting
  ...TEMPLES.flatMap((t, i) => [
    E('khaPorchBell', porch(t), 36, [24 + i * 5, 70], [6, 19], { rainMax: 0.7 }),
    E('khaDrum', porch(t), 55, [150 + i * 20, 280], [5, 6.4], { rainMax: 0.7 }),
    E('khaDrum', porch(t), 55, [120 + i * 20, 240], [17.8, 19.2], { rainMax: 0.7 }),
    E('khaChant', porch(t), 28, [70 + i * 10, 150], [5.3, 7.2], { rainMax: 0.8, after: true }),
    E('khaChant', porch(t), 28, [60 + i * 10, 130], [17.6, 19.6], { rainMax: 0.8, after: true }),
  ]),
  E('khaChant', [K.c[0] + 2, K.c[1]], 22, [50, 100], [9, 12], { rainMax: 0.5 }),
  // the flower-sellers of the forecourt and the foot of each stair: their calls (the stalls of town.js dressing and life.js)
  ...[[-27.8, -65.4], [-27.8, -54.6]].map((p, i) => E('khaCall', p, 20, [16 + i * 6, 44], [6, 18.5], { dry: true })),
  ...TEMPLES.map((t, i) => E('khaCall', [t.c[0] + t.len + 4 + t.jagati * 2.2 + 3, t.c[1] + (i % 2 ? 4 : -4)], 16, [30 + i * 6, 80], [6, 18], { dry: true })),
  // the sweet-makers' pans on the pilgrims' lane (at the fronts of its open sweet shops)
  ...approachSweets.map((l, i) => E('khaPan', frontOf(l), 12, [12 + i * 3, 30], [5.5, 21], { dry: true })),
  // the zebu carts on the road and the lanes
  ...[[30, 8], [90, 12], [150, 8], [230, 12], [-12, -62]].map(([x, z], i) => E('khaCartBell', [x, z], 18, [34 + i * 8, 80], [5.5, 19], { rainMax: 0.4 })),
  // the water at the tank's ghat: women filling pots, bathers at dawn; the wells of the lanes
  ...[-20, 0, 20].map((dx, i) => E('pour', [GHAT[0] + dx, GHAT[1]], 12, [8 + i * 3, 24], [5, 9.5], { dry: true })),
  ...[-20, 0, 20].map((dx, i) => E('pour', [GHAT[0] + dx, GHAT[1]], 12, [18 + i * 4, 50], [15.5, 18.5], { dry: true })),
  ...WELLS.map((w, i) => E('wellBucket', w, 10, [20 + i * 6, 60], [5, 18], { dry: true })),
  // the potters' yards and the oil-pressers' of the road, the smith's hammer
  ...yards().filter((y, i) => i % 4 === 0).flatMap((y) => [E('wheel', mid(y.rect), 12, [24, 50], [6.5, 17.5], { dry: true }), E('clay', mid(y.rect), 11, [12, 28], [6.5, 17.5], { dry: true })]),
  // the road's hubbub: the sellers' murmur, a scale, pots
  ...[40, 90, 140, 190].map((x, i) => E('jarLid', [x, 10], 12, [16 + i * 4, 40], [6.5, 18], { dry: true })),
  ...[60, 120, 170].map((x, i) => E('clothRustle', [x, 8], 12, [14 + i * 3, 36], [6.5, 18], { dry: true })),
  // the peafowl of the groves at dawn and dusk, the owlet at night, a jackal far off
  ...[[-150, 120], [190, -140], [250, 90]].map(([x, z], i) => E('khaPeafowl', [x, z], 70, [40 + i * 10, 110], i % 2 ? [5, 7.5] : [17, 19.5], { rainMax: 0.6 })),
  E('khaOwl', [-120, 20], 45, [40, 100], [19.5, 4.5], { rainMax: 0.4 }), E('khaOwl', [110, -130], 45, [50, 110], [20, 4.5], { rainMax: 0.4 }), E('khaOwl', [260, 40], 45, [60, 120], [20, 4.5], { rainMax: 0.4 }),
  E('dogFar', [300, 100], 45, [60, 150], [20, 5]), E('dogFar', [-130, -130], 45, [80, 170], [21, 4.5]),
];
