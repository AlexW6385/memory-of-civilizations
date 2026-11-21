// Where a Balinese temple village's sounds are (docs/settlements/bali-village.md §13.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the gamelan of the banjar's wantilan and of the temple's gong pavilion, the kulkul's calls from its tower, the priest's bell and chant at the temple's
// offices, the cockpit's crowd, the rice trough, looms, forge and chisel of the furnished houses and stalls, the water of the pancuran and the subak's channel, the clappers,
// the buffalo's bell and the ducks of the paddies, the geckos in the thatch at night, a festival's processional gamelan passing along the street, the rooms one can be inside.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-bali.js). Coordinates: metres, +x east, +z south, the settlement's frame. All of it [inferred]: ethnographic Bali; the hours are those of a village that
// keeps the offices of dawn and dusk (the kulkul sounds the banjar's calls [stated: Wikipedia "Balinese architecture"]; the gamelan is the banjar's, kept in the community's
// hall [stated: Wikipedia "Gamelan"]).
import '../../engine/voices-bali.js';
import { RADIUS, CORE, PURA, WANTILAN, KULKUL, BANYAN, CHANNEL_X, DALEM_C, STREET, LANE, inRect, lots, lotFrame, outward, height, flooded, pancuranAt } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival before the pura). */
export const HOME = [0, -26];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const NIGHT = [19.5, 4.5];

// ── the compounds' parts (the frame of src/styles/balinese/compound.js, read without three.js) ───────────────────────────────────────────────────────────────────────
/** A lot's sleeping house { rect, door } and kitchen { rect }, as the compound builds them (the test compares them with compoundParts). */
export function partsOf(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, alongX = f === 'n' || f === 's', W = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const dirV = (sg) => (f === 'n' ? (sg > 0 ? 's' : 'n') : f === 's' ? (sg > 0 ? 'n' : 's') : f === 'w' ? (sg > 0 ? 'e' : 'w') : (sg > 0 ? 'w' : 'e'));
  const cL = P(0, D), cR = P(W, D), left = cL[0] - cL[1] >= cR[0] - cR[1], M = (u) => (left ? u : W - u), RM = (u0, v0, u1, v1) => R(M(u0), v0, M(u1), v1);
  const hu0 = 8.8, hu1 = Math.min(W - 2.2, hu0 + 6.4), hv1 = D - 1.9, hv0 = hv1 - 3.2;
  return { house: hu1 - hu0 >= 3.2 ? { rect: RM(hu0, hv0, hu1, hv1), door: dirV(-1) } : null, kitchen: { rect: RM(0.9, 3.4, 4.7, 6.6) } };
}

/** The household work heard from the sleeping houses by variant (the room's own: 0 the sleepers, 1 the weavers, 2 the store, 3 the elder's bed), and from the stalls by trade. */
const USE = ['sleep', 'weave', 'store', 'elder'];
const WORK = {
  sleep: [['clothRustle', [70, 130], [4.5, 21]], ['balTokek', [40, 90], NIGHT]],
  weave: [['loom', [10, 26], [7, 17]], ['balTokek', [40, 90], NIGHT]],
  store: [['balLesung', [80, 170], [5, 8.5]], ['sack', [50, 110], [6, 17]], ['balTokek', [40, 90], NIGHT]],
  elder: [['balGenta', [100, 200], [5.5, 7]], ['balGenta', [100, 200], [17, 18.5]], ['balTokek', [40, 90], NIGHT]],
  kitchen: [['kitchen', [14, 30], [5, 9]], ['kitchen', [14, 30], [16.5, 20.5]], ['pour', [60, 130], [6, 17]]],
  warung: [['kitchen', [14, 30], [5.5, 21]], ['bowlClack', [30, 70], [6, 20]]],
  pande: [['hammer', [8, 22], [7, 17]]],
  carver: [['chisel', [9, 24], [7, 17]]],
  weaver: [['loom', [10, 26], [7, 17]]],
  offerings: [['clothRustle', [40, 90], [4.5, 18]], ['broom', [60, 120], [5, 7]]],
  potter: [['wheel', [18, 40], [7, 17]], ['clay', [30, 70], [7, 17]]],
  cloth: [['clothRustle', [40, 90], [6, 18]]],
  basket: [['splitBamboo', [14, 36], [7, 17]]],
};
let SITES = null;
/** The furnished places with sounds: { use, rect, at, id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const p = partsOf(l);
    if (p.house) {
      const [x0, z0, x1, z1] = p.house.rect, d = p.house.door, U = (d === 'n' || d === 's' ? x1 - x0 : z1 - z0) - 0.6, v = U >= 5.4 ? ((l.seed >> 2) % 4) : 0, use = USE[v], r = [x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4];
      SITES.push({ use, rect: r, at: mid(r), id: 'house:' + l.seed, work: WORK[use], y: 0.45 });
    }
    if (hash(l.seed, 3) < 0.75) { const r = p.kitchen.rect; SITES.push({ use: 'kitchen', rect: r, at: mid(r), id: 'paon:' + l.seed, work: WORK.kitchen, y: 0.35 }); }
    if (l.shop) {
      const F = lotFrame(l), { kind, u0, u1, d } = l.shop, a = F(u0, 0), b = F(u1, d), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
      SITES.push({ use: 'pavilion', rect: r, at: mid(r), id: 'shop:' + l.seed, work: WORK[kind], y: 0.3 });
    }
  }
  return SITES;
}

/** No wells: the water is the channel's and the pancuran's. */
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────
/** The open halls one can stand in: the banjar's wantilan, the temple's gong pavilion and bale agung. */
const HALLS = [{ rect: WANTILAN, y: 0.5, id: 'room:wantilan' }, { rect: [15, -103, 27, -94.5], y: PURA.y1 + 0.5, id: 'room:gong' }, { rect: [-29.5, -101.5, -16.5, -93.5], y: PURA.y1 + 0.6, id: 'room:agung' }];
let GRID = null;
const siteAt = (x, z) => {
  if (!GRID) { GRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; (GRID.get(k) || GRID.set(k, []).get(k)).push(s); } }
  return (GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open (a raised floor: the feet on it, not under it). */
export function roomAt(x, z, y = 0) {
  const s = siteAt(x, z);
  if (s && y > s.y - 0.25) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const h of HALLS) if (inRect(h.rect, x, z) && y > h.y - 0.25) return { use: 'pavilion', at: mid(h.rect), upper: false, same: h.id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch, loud), `hush` how much of the outdoors comes through, `work` its small sounds. */
const R0 = { tone: [440, 0.35], roof: 0.85, hush: 0.7, work: [['clothRustle', 50]] };
export const ROOMS = {
  house: R0,
  sleep: { ...R0, work: [['clothRustle', 60], ['balTokek', 80]] },
  weave: { ...R0, work: [['loom', 14]] },
  store: { ...R0, work: [['sack', 40], ['balLesung', 120]] },
  elder: { ...R0, tone: [380, 0.3], work: [['balGenta', 150]] },
  kitchen: { ...R0, tone: [500, 0.4], hush: 0.8, work: [['kitchen', 30], ['pour', 60]] },
  pavilion: { tone: [900, 0.3], roof: 0.8, hush: 0.95, work: [['clothRustle', 60]] },       // an open hall or stall: the outdoors comes through
};
export const UPPER = { tone: [300, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 60]] };

// ── the planting, the town ──────────────────────────────────────────────────
const onStreet = (x, z) => inRect(STREET, x, z) || inRect(LANE, x, z);
/** 0…1: how much green round (x, z): the groves and gardens between the compounds, the rice, the temple's courts little. */
export function greenNear(x, z) {
  if (inRect([PURA.x0, PURA.zN, PURA.x1, PURA.zS], x, z)) return 0.18;
  if (inRect(CORE, x, z)) return onStreet(x, z) ? 0.4 : 0.6;
  return 0.45;
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** 0…1: how much bamboo and coconut round (x, z): the groves behind the compounds, thin on the terraces. */
export const bambooNear = (x, z) => (inRect(CORE, x, z) && !inRect([PURA.x0, PURA.zN, PURA.x1, PURA.zS], x, z) ? 0.5 : 0.12);
/** A tree to put a cicada or a bird in, near (x, z), or null: the groves behind the compounds, the terraces' bunds. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !onStreet(px, pz) && !inRect([PURA.x0, PURA.zN, PURA.x1, PURA.zS], px, pz)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the crowd's murmur reaches (x, z): the forecourt's market, the crossing and the wantilan, the street, little in the fields. */
export function townNear(x, z) {
  if (inRect([-14, -72, 14, -44], x, z)) return 1;
  if (inRect([-26, -14, 32, 14], x, z)) return 0.8;
  if (inRect(STREET, x, z, 4) || inRect(LANE, x, z, 4)) return 0.5;
  if (inRect(CORE, x, z)) return 0.3;
  return 0.1;
}
/** The subak's channel along the street's west edge: the nearest point of it, for the engine's lapping water ({ p, d } or null beyond 30 m). */
export function canalSpot(x, z) {
  if (z < -62 || z > 132 || Math.abs(x - CHANNEL_X) > 30) return null;
  return { p: [CHANNEL_X, Math.max(-62, Math.min(132, z))], d: Math.abs(x - CHANNEL_X) };
}
// what this ground has none of (the engine's scheduler asks, and is answered with nothing)
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const lotusNear = () => 0;
/** The paddies are the frogs' ground: all the terraces beyond the village, loud after rain. */
export const frogGround = (x, z) => (inRect(CORE, x, z) ? 0.35 : 0.95);

/** The passing: a festival's processional gamelan along the street toward the temple, a bullock cart along it. */
export const TRACKS = [{
  key: 'baleganjur', voice: 'balBaleganjur', speed: 1.5, r50: 40, gap: [200, 420], ok: (hour, rain) => hour >= 9 && hour < 16.5 && rain < 0.3,
  get: (lx, lz, r) => (inRect([-60, -80, 60, 140], lx, lz) ? (r() < 0.7 ? { pts: [[0.5, 90], [0.5, -66]] } : { pts: [[0.5, -66], [0.5, 90]] }) : null),
}, {
  key: 'cart', voice: 'balCart', speed: 1.0, r50: 16, gap: [60, 150], ok: (hour, rain) => hour >= 6 && hour < 17.5 && rain < 0.5,
  get: (lx, lz, r) => (inRect([-40, -60, 40, 140], lx, lz) ? (r() < 0.5 ? { pts: [[-1.2, 130], [-1.2, 10]] } : { pts: [[1.4, 10], [1.4, 130]] }) : null),
}];

// ── the terraces' spots ──────────────────────────────────────────────────
let FIELDS = null;
/** Spots on the flat treads of the terraces: dry ones for the scarecrows' clapper lines (huts) and the plough, flooded ones for the ducks. */
export function fieldSpots() {
  if (FIELDS) return FIELDS;
  FIELDS = { huts: [], plough: [], ducks: [] };
  for (let k = 0; k < 900 && (FIELDS.huts.length < 6 || FIELDS.plough.length < 4 || FIELDS.ducks.length < 5); k++) {
    const a = hash(k, 1) * Math.PI * 2, d = 112 + hash(k, 2) * 60, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.95;
    if (Math.hypot(x, z) > RADIUS - 14 || inRect(CORE, x, z, 3)) continue;
    const y = height(x, z);
    if (![[2, 0], [-2, 0], [0, 2], [0, -2]].every(([dx, dz]) => Math.abs(height(x + dx, z + dz) - y) < 0.02)) continue;
    const spot = { at: [x, z] };
    if (flooded(x, z, y)) { if (FIELDS.ducks.length < 5 && FIELDS.ducks.every((q) => Math.hypot(q.at[0] - x, q.at[1] - z) > 30)) FIELDS.ducks.push(spot); }
    else if (FIELDS.huts.length < 6 && FIELDS.huts.every((q) => Math.hypot(q.at[0] - x, q.at[1] - z) > 30)) FIELDS.huts.push(spot);
    else if (FIELDS.plough.length < 4 && FIELDS.plough.every((q) => Math.hypot(q.at[0] - x, q.at[1] - z) > 40)) FIELDS.plough.push(spot);
  }
  return FIELDS;
}

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const GONG = [21, -99], INNER = [0, -132], WC = mid(WANTILAN), F = fieldSpots();
const DAWN = [4.8, 6.6], DUSK = [17, 19];
export const EMITTERS = [
  // the temple's offices at dawn and dusk: the priest's bell and chant before the merus, the gong; at the festival the gamelan of the gong pavilion by day
  E('balGenta', INNER, 36, [60, 140], [5.5, 7.2], { rainMax: 0.8, after: true }), E('balGenta', INNER, 36, [60, 140], [17, 18.8], { rainMax: 0.8, after: true }),
  E('balGong', [0, -140], 70, [90, 200], [5.5, 7]), E('balGong', [0, -140], 70, [90, 200], [17.2, 18.8]),
  E('balGamelan', GONG, 40, [70, 160], [9, 17], { rainMax: 0.7, after: true }),
  // the kulkul: from its tower at the crossing the banjar's calls at dawn, noon and dusk; the temple's kulkul answers at dusk; the alarm, rarely
  E('balKulkul', KULKUL, 95, [60, 130], [5.4, 6.4]), E('balKulkul', KULKUL, 95, [70, 150], [11.6, 12.6]), E('balKulkul', KULKUL, 95, [60, 130], [17.4, 18.6]),
  E('balKulkul', [24, -80.5], 70, [80, 160], [17.6, 18.4]),
  E('balKulkulAlarm', KULKUL, 110, [1500, 3000], [1, 24]),
  // the banjar's wantilan: the gamelan's practice in the evening with the suling, the cockpit's crowd in the afternoon of the festival
  E('balGamelan', WC, 42, [90, 190], [16.5, 21.5], { rainMax: 0.7, after: true }), E('balSuling', [WC[0] + 4, WC[1] - 4], 30, [110, 240], [17, 21], { rainMax: 0.5, after: true }),
  E('balCrowd', [WC[0], WC[1] - 0.2], 24, [55, 130], [13, 17.5], { rainMax: 0.5, after: true }),
  // the dalem: a gong in the dusk now and then
  E('balGong', DALEM_C, 55, [220, 420], [18, 20]),
  // the water: the three pancuran by day and into the evening, the channel running all day beside the street
  ...pancuranAt().map((z) => E('balSpout', [-3.3, z], 14, [10, 24], [5, 20], { rainMax: 1 })),
  ...[18, 56, 94, 128].map((z) => E('balTrickle', [CHANNEL_X, z], 14, [9, 20], [0, 24], { rainMax: 1 })),
  // the market of the festival before the temple: the sellers' cries by day
  ...[[-8.5, -66], [8.6, -62], [-8.6, -56], [8.5, -50]].map(([x, z], k) => E('balSeller', [x, z], 16, [18, 46], [6, 17.5], { rainMax: 0.4 })),
  // the lanes' mornings: a few gates swept at dawn
  ...lots().filter((l, i) => i % 5 === 1).map((l) => { const [ox, oz] = outward(l); return E('broom', [l.gate[0] + ox * 2, l.gate[1] + oz * 2], 9, [30, 70], [5, 7.5], { rainMax: 0.3 }); }),
  // the paddies: a clapper line at each hut, a trickle over the bunds, a buffalo's bell at each plough, the ducks in the flooded ones
  ...F.huts.flatMap((h) => [E('balClatter', h.at, 26, [14, 44], [6, 17.5], { dry: true }), E('balTrickle', [h.at[0] + 6, h.at[1] + 5], 12, [8, 18], [0, 24], { rainMax: 1 })]),
  ...F.plough.map((p) => E('balBuffaloBell', p.at, 20, [8, 22], [6, 11])), ...F.plough.map((p) => E('balBuffaloBell', p.at, 20, [8, 22], [15, 17.5])),
  ...F.ducks.map((p) => E('balDuck', p.at, 22, [20, 55], [5.5, 18], { rainMax: 0.8 })),
];
void BANYAN;
