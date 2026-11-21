// Where Qufu's sounds are (docs/settlements/lu-qufu.md §16): the places of its emitters and the geometry the audio engine needs to put each sound where it is made — the
// ritual music rehearsed in the Jinsi Hall (the bronze bells and stone chimes, the zither), the Drum Tower's drum at dusk and at each watch of the night, the yamen's drum
// and gong at the Duke's court, the shops' trades (incense, paper, books, rubbings, cakes, tea, cloth, pottery, brush), the households' work (the kitchen's stove, the loom,
// the grain pounded), the wells, the single-wheel barrows squealing along the streets, the threshing yards' stone rollers outside the wall, the cypresses and the pool's frogs,
// the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js (the voices of src/engine/voices-qufu.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout, from the dossier's
// §6–§8 and the trades of a pilgrim town of the Qing]
import '../../engine/voices-qufu.js';
import { RADIUS, TEMPLE, MANSION, MX, MANSION_HALLS, ANCILLARY, DRUM, POOL, KONG_FOREST, CITY_WALL, KUIWEN, HALL, lots, shopRuns, streetItems, streets, inRect, buildRects } from './layout.js';

export const HOME = [-26, -59];

export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ── the trades of the shops ──────────────────────────────────────────────────
/** The trades of a shop row, in the order the style gives them (styles/lu/shops.js: each shop draws its trade, then its awning, its name board, its signboard and its trestle from one stream). */
export const TRADES = ['incense', 'paper', 'books', 'rubbings', 'cakes', 'tea', 'cloth', 'pottery', 'brush'];
export function shopTrades(seed, n) {
  const r = rngOf(seed ?? 1), out = [];
  for (let i = 0; i < n; i++) { out.push(TRADES[Math.floor(r() * TRADES.length)]); r(); r(); if (r() < 0.6) r(); r(); }
  return out;
}
const H = [6.5, 18.5];                                          // the shops keep the day and a little of the evening
/** What each trade makes heard: [voice, gap [min, max] s, hours]. */
const TRADE = {
  incense: [['abacus', [30, 70], H]], paper: [['paper', [26, 60], H]], books: [['paper', [30, 70], H], ['abacus', [40, 90], H]], rubbings: [['brush', [24, 55], H]],
  cakes: [['kitchen', [10, 26], [6, 18.5]]], tea: [['teaClink', [18, 40], H], ['pourWine', [30, 70], H]], cloth: [['scissors', [22, 50], H]], pottery: [['clay', [26, 60], H]], brush: [['brush', [22, 50], H]],
};

// ── the households ───────────────────────────────────────────────────────────
const tierOf = (l) => { const luck = rngOf((l.seed || 1) * 7919 + 13)(), score = (l.wealth ?? 0) + (luck - 0.5) * 0.26; return score > 0.55 ? 2 : score > 0.3 ? 1 : 0; };
/** The room of the household that the lot's seed makes its east house (styles/lu/house.js): the store, the stable or the weaving room. */
const EAST = ['store', 'stable', 'loom'];
const HOUSE = {
  store: [['kitchen', [16, 36], [5.5, 20]], ['mortar', [60, 120], [6, 17]]],
  stable: [['kitchen', [16, 36], [5.5, 20]]],
  loom: [['kitchen', [16, 36], [5.5, 20]], ['loom', [12, 28], [6, 18]]],
};

let SITES = null;
/** The places with sounds: { use, rect, at, id, work, y }. Households (the furnished lots), the shops of Queli Street and the square, the halls one can stand in. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if ((l.lod ?? 0) >= 2) continue;
    const use = EAST[(l.seed >> 2) % (tierOf(l) ? 3 : 2)];
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: HOUSE[use], y: 0 });
  }
  for (const row of shopRuns()) {
    const alongZ = row.rect[3] - row.rect[1] > row.rect[2] - row.rect[0], n = row.n, trades = shopTrades(row.seed, n);
    for (let i = 0; i < n; i++) {
      const r = alongZ
        ? [row.rect[0], row.front === 'w' ? row.rect[3] - (i + 1) * (row.rect[3] - row.rect[1]) / n : row.rect[1] + i * (row.rect[3] - row.rect[1]) / n, row.rect[2], 0]
        : [0, 0, 0, 0];
      if (alongZ) r[3] = r[1] + (row.rect[3] - row.rect[1]) / n;
      else { const w = (row.rect[2] - row.rect[0]) / n; r[0] = row.rect[0] + i * w; r[1] = row.rect[1]; r[2] = r[0] + w; r[3] = row.rect[3]; }
      SITES.push({ use: 'shop-' + trades[i], rect: r, at: mid(r), id: `shop:${row.seed}:${i}`, work: TRADE[trades[i]], y: 0 });
    }
  }
  return SITES;
}

export const WELLS = streetItems().wells.map((w) => w.at);
export const FAR = {};
export const TEMPLE_SOUNDS = {};
export { TEMPLE_SOUNDS as TEMPLE };

// ── the rooms ────────────────────────────────────────────────────────────────
const JINSI = ANCILLARY.find((a) => a.id === 'jinsi').rect, DATANG = MANSION_HALLS.find((h) => h.id === 'datang').rect;
/** [id, use, rect, from y, to y]: the halls whose inside has its own acoustic (the floor of each is its own height). */
const ROOM_RECTS = [
  ['room:dacheng', 'hall', HALL.rect, 1.5, 6],
  ['room:jinsi', 'music', JINSI, 0, 3],
  ['room:datang', 'yamen', DATANG, 0, 3],
  ['room:kuiwen', 'hall', KUIWEN.rect, 0.4, 3],
  ['room:drum', 'drum', [DRUM.x - DRUM.w / 2 + 2, DRUM.z - DRUM.d / 2 + 2, DRUM.x + DRUM.w / 2 - 2, DRUM.z + DRUM.d / 2 - 2], 5, 9],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const [id, use, r, y0, y1] of ROOM_RECTS) if (inRect(r, x, z) && y >= y0 && y < y1) return { use, at: mid(r), upper: false, same: id };
  const s = lotAt(x, z);
  if (s && y < 3) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.7, work: [['kitchen', 50]] };
const SHOPR = { ...R0, tone: [420, 0.3], hush: 0.55 };
export const ROOMS = {
  house: R0, store: { ...R0, tone: [260, 0.2], work: [['mortar', 60]] }, stable: { ...R0, tone: [240, 0.2], work: [['kitchen', 70]] }, loom: { ...R0, work: [['loom', 14]] },
  hall: { tone: [170, 0.25], roof: 0.6, hush: 0.45, work: [['qfBell', 90], ['qfChime', 60]] },
  music: { tone: [210, 0.25], roof: 0.8, hush: 0.6, work: [['qfYayue', 50]] },
  yamen: { tone: [190, 0.25], roof: 0.8, hush: 0.5, work: [['qfYamen', 120]] },
  drum: { tone: [150, 0.3], roof: 0.9, hush: 0.7, work: [['qfDrum', 150]] },
  ...Object.fromEntries(TRADES.map((t) => ['shop-' + t, { ...SHOPR, work: TRADE[t].map(([v]) => [v, 40]) }])),
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['paper', 60]] };

// ── the planting, the town ──────────────────────────────────────────────────
let RECTS = null;
const solid = (x, z) => (RECTS || (RECTS = buildRects())).some((q) => inRect(q, x, z, 0.5));
/** 0…1: how much green round (x, z): the temple's old cypresses and pines, the Forest's grove, the courtyards' jujube and persimmon, the wheat of the rim. */
export function greenNear(x, z) {
  const temple = inRect(TEMPLE, x, z, 6) ? 0.85 : 0, forest = inRect(KONG_FOREST, x, z, 10) ? 0.95 : 0, rim = sm(RADIUS - 120, RADIUS - 50, Math.hypot(x, z)) * 0.7;
  return Math.max(temple, forest, rim, inRect(MANSION, x, z) ? 0.45 : 0.3);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the cypresses of the temple's courts, the Forest's grove. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && ((inRect(TEMPLE, px, pz, -2) && !solid(px, pz) && Math.abs(px) > 4.5) || inRect(KONG_FOREST, px, pz, -2) || (inRect(MANSION, px, pz) && pz < -134))) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): Queli Street and the square most, the lanes' houses, little in the temple's inner courts and at the rim. */
export function townNear(x, z) {
  if (inRect([-22, 118, 22, 262], x, z, 8)) return 1;
  if (inRect(TEMPLE, x, z)) return z > 20 ? 0.45 : z > -52 ? 0.25 : 0.12;
  if (inRect(MANSION, x, z)) return 0.3;
  return Math.max(0.12, 0.6 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** A point on the Bishui pool's water within `reach` of (x, z), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (!inRect(POOL, x, z, 40)) return null;
  for (let k = 0; k < 8; k++) { const px = POOL[0] + 1.5 + rnd() * (POOL[2] - POOL[0] - 3), pz = POOL[1] + 1.5 + rnd() * (POOL[3] - POOL[1] - 3); if (Math.hypot(px - x, pz - z) < reach + 12) return [px, pz]; }
  return null;
}
export const shoreSpot = () => null;
export const frogGround = (x, z) => (inRect(POOL, x, z, 8) ? 0.6 : 0);

// ── the streets, for the passing sounds ─────────────────────────────────────────
let STREETS = null;
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
/** A walker's track along the street (or lane) nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  if (!STREETS) STREETS = streets().filter((r) => Math.max(r[2] - r[0], r[3] - r[1]) > 24 && Math.min(r[2] - r[0], r[3] - r[1]) >= 5);
  let best = null;
  STREETS.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], md = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, md + off], [b, md + off]] } : { pts: [[md + off, a], [md + off, b]] };
}
/** The place's own passing sounds (engine TRACKS): the single-wheel barrows of the carriers squealing along the streets by day. */
export const TRACKS = [
  { key: 'barrow', voice: 'qfBarrow', speed: 1.1, r50: 10, gap: [24, 60], ok: (hour, rain) => hour >= 6 && hour < 18 && rain < 0.5, get: (x, z, r) => streetTrack(x, z, r, 90, 30) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const jin = mid(JINSI), dt = mid(DATANG);
const yards = [-132, -84, -34, 24, 74, 124].map((x) => [x, 271]);
export const EMITTERS = [
  // the ritual music rehearsed in the Jinsi Hall in the forenoon and the afternoon, and the bell and the stone at the Dacheng Hall at the sacrifice's hour [inferred]
  E('qfYayue', jin, 36, [90, 200], [8.5, 11.5], { rainMax: 0.7, after: true }), E('qfYayue', jin, 36, [90, 200], [14.5, 16.5], { rainMax: 0.7, after: true }),
  E('qfBell', [0, HALL.rect[1] + 10], 34, [150, 300], [6.2, 6.8], { rainMax: 1, after: true }), E('qfChime', [0, HALL.rect[1] + 10], 30, [150, 300], [6.2, 6.8], { rainMax: 1, after: true }),
  // the Drum Tower: the evening drum before the first watch, then a roll at each watch of the night, and at dawn
  ...[[18.6, 19.2], [21, 21.4], [23, 23.4], [1, 1.4], [3, 3.4], [4.7, 5.2]].map(([a, b]) => E('qfDrum', [DRUM.x, DRUM.z], 90, [300, 420], [a, b], { rainMax: 1 })),
  // the yamen of the Duke's household opens court in the morning and again after noon
  E('qfYamen', dt, 50, [300, 420], [8, 8.5], { rainMax: 1 }), E('qfYamen', dt, 50, [300, 420], [14, 14.5], { rainMax: 1 }),
  // Queli Street and the square: calling and bargaining
  E('marketCry', [0, 205], 40, [14, 36], [7, 18], { rainMax: 0.5 }), E('marketCry', [0, 140], 34, [18, 40], [7.5, 17.5], { rainMax: 0.5 }),
  // the threshing yards outside the wall, the stone rollers behind the donkeys (the harvests of wheat and millet [inferred]: by day, dry weather)
  ...yards.map(([x, z]) => E('qfRoller', [x, z], 26, [40, 90], [6, 18], { dry: true })),
  // the washing-day pounder and the grain: the mortars of the lanes' houses are in the sites; the night's far dogs and the cypresses' owls are the engine's
];
void CITY_WALL; void MX;
