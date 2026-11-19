// Where Venice's sounds are (docs/settlements/venice.md §5f.3): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the canals and the lagoon front, the streets, the bridges, the shops of the Procuratie, San Marco's choir, the squero, the Arsenal far to the east,
// the rooms one can be inside. Functions of layout.js and shops.js; read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by the voices of
// src/engine/voices.js and ./voices.js. Coordinates: metres, +x east, +z south, the settlement's own frame.
import { GRAND, CANALS, BASIN_Z, BASILICA, MERCERIA, MARKET, RADIUS, PIAZZA, lots, bands, bridges, wells, squero, inRect } from './layout.js';
import { shopRooms } from './shops.js';
import './voices.js';

export const HOME = [-60, -5];
const WELLS_AT = () => wells().map((w) => w.at);
/** The wells of the streets and the piazza (the cisterns' wellheads: layout.js wells(), which the town builds). */
export const WELLS = WELLS_AT();

/** A deterministic 0…1 from numbers. */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ── the shops, the church, the yards ────────────────────────────────────────────
/** What each trade's shop makes in it [inferred from the trade]: [voice, gap [min, max] s, hours [from, to]]. */
const WORK = {
  cloth: [['scissors', [20, 50], [8, 18]], ['coin', [50, 120], [8, 18]]],
  silk: [['clothRustle', [26, 60], [8, 18]], ['coin', [50, 120], [8, 18]]],
  spice: [['mortar', [18, 40], [7, 18]], ['coin', [60, 140], [8, 18]]],
  books: [['paper', [20, 50], [8, 18]]],
  gold: [['venGold', [14, 34], [8, 17.5]]],
  glass: [['venGlass', [30, 70], [8, 18]], ['coin', [60, 140], [8, 18]]],
  wine: [['pourWine', [30, 70], [9, 22]]],
  bread: [['venBake', [20, 50], [5, 13]]],
  shoes: [['venCobbler', [14, 34], [7, 18]]],
  barber: [['scissors', [26, 60], [8, 18]]],
  hats: [['clothRustle', [30, 70], [8, 18]], ['coin', [60, 140], [8, 18]]],
};
let SITES = null;
/** The places with sounds of their own: the shops' rooms (their trade's work) and San Marco: { use, rect, at, id, work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = shopRooms().map((s) => ({ ...s, work: WORK[s.use] || [] }));
  const { c, s, w } = BASILICA;
  SITES.push({ use: 'basilica', rect: [c[0] - s, c[1] - w / 2, c[0] + s, c[1] + w / 2], arms: [[c[0] - w / 2, c[1] - s, c[0] + w / 2, c[1] + s]], at: c, id: 'basilica', work: [] });
  return SITES;
}
const SQ = squero();
/**
 * Fixed emitters: [voice, at, r50, gap, hours] (as the engine reads them). Hours are local; the places are [inferred] from layout.js and the dossier.
 */
export const EMITTERS = [
  // the pigeons of the piazza, before San Marco and about the middle of the square [stated: they were fed; the flocks' places inferred]
  { voice: 'venPigeons', at: [20, -5], r50: 16, gap: [14, 40], hours: [6.5, 19], dry: true },
  { voice: 'venPigeons', at: [-70, 0], r50: 16, gap: [20, 55], hours: [6.5, 19], dry: true },
  // the choir of San Marco: the morning Mass and Vespers, heard in the church and through its walls from the square
  { voice: 'venChoir', at: BASILICA.c, r50: 26, gap: [80, 160], hours: [8, 11], inside: 'basilica', after: true, lv: 1.1 },
  { voice: 'venChoir', at: BASILICA.c, r50: 26, gap: [90, 180], hours: [16, 18.5], inside: 'basilica', after: true, lv: 1.1 },
  // the Merceria: the cry of a hawker in the shopping street
  { voice: 'venCry', at: [(MERCERIA[0] + MERCERIA[2]) / 2, -84], r50: 14, gap: [14, 36], hours: [8, 18], rainMax: 0.4 },
  // the fish and vegetable market at the Rialto, from the dawn on [stated: the market was there; the cries inferred]
  { voice: 'venCry', at: [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], r50: 24, gap: [8, 22], hours: [5.5, 13], rainMax: 0.5, lv: 1.2 },
  { voice: 'venCry', at: [(MARKET[0] + MARKET[2]) / 2 + 10, (MARKET[1] + MARKET[3]) / 2 + 8], r50: 24, gap: [10, 26], hours: [5.5, 13], rainMax: 0.5 },
  // the squero: the caulkers' mallets [stated for the squero's work; the hours inferred]
  { voice: 'venCaulk', at: SQ.c, r50: 18, gap: [14, 36], hours: [6.5, 17.5], dry: true },
  // the Arsenal, a long way east (its shifts were set by the Marangona): heard as a scatter of mallets from the east side of the city [inferred position]
  { voice: 'venShipyard', at: [RADIUS - 20, 40], r50: 70, gap: [14, 34], hours: [6.5, 17.5], dry: true, lv: 0.8 },
];

// ── geometry of the waters ────────────────────────────────────────────────────
const HALF = (i) => (i === 'g' ? 20 : 5);
const PATHS = [['g', GRAND], ...CANALS.map((p) => [String(CANALS.indexOf(p)), p])];
function nearOnPath(p, x, z) {
  let best = null;
  for (let i = 0; i + 1 < p.length; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), qx = ax + dx * t, qz = az + dz * t, d = Math.hypot(x - qx, z - qz);
    if (!best || d < best.d) best = { d, q: [qx, qz], i, t, L: Math.sqrt(L2), dir: [dx / Math.sqrt(L2), dz / Math.sqrt(L2)] };
  }
  return best;
}
/** The nearest point of the water's edge to (x, z) (the canals' walls, the lagoon's front), the distance (0 in the water) and which. */
export function canalSpot(x, z) {
  let best = null;
  PATHS.forEach(([k, p], idx) => {
    const n = nearOnPath(p, x, z), hw = k === 'g' ? 20 : 5, d = Math.max(0, n.d - hw);
    if (!best || d < best.d) { const u = n.d > 0.01 ? [(x - n.q[0]) / n.d, (z - n.q[1]) / n.d] : [0, 1], e = Math.min(n.d, hw); best = { p: [n.q[0] + u[0] * e, n.q[1] + u[1] * e], d, i: idx }; }
  });
  const dz = Math.max(0, BASIN_Z - z);
  if (z > BASIN_Z - 200 && (!best || dz < best.d)) best = { p: [x, BASIN_Z], d: dz, i: -1 };
  return best;
}
/**
 * A gondola's track on the water: the centre line of the canal reach nearest to (x, z), from some way before its nearest point to some way past, or along the
 * basin off the Molo; null beyond `reach` metres from the water.
 */
function gondolaTrack(x, z, rnd, reach = 70, lead = 38) {
  const c = canalSpot(x, z);
  if (!c || c.d > reach) return null;
  const dir = rnd() < 0.5 ? 1 : -1, la = lead * (0.6 + 0.6 * rnd()), lb = lead * (0.8 + 0.8 * rnd());
  if (c.i < 0) { const zz = BASIN_Z + 22 + rnd() * 10; return { pts: [[x - dir * la, zz], [x + dir * lb, zz]] }; }
  const [, p] = PATHS[c.i], n = nearOnPath(p, x, z), [ax, az] = p[n.i], [bx, bz] = p[n.i + 1], s = n.t * n.L;
  const a = Math.max(0, Math.min(n.L, s - dir * la)), b = Math.max(0, Math.min(n.L, s + dir * lb));
  if (Math.abs(b - a) < 14) return null;
  const at = (u) => [ax + n.dir[0] * u, az + n.dir[1] * u];
  return { pts: [at(a), at(b)] };
}
/** The shared boat track is a Chinese sampan's yuloh: Venice's gondolas are `TRACKS`' (gondolaTrack). */
export const canalTrack = () => null;
export { gondolaTrack };
/** The shared Chinese tracks are not Venice's: a sedan chair, a pedlar with a rattle, a watchman with a clapper (the streets are walked by `TRACKS` below). */
export const streetTrack = () => null;
/** The bridge's track, for Venice's own crossing voice (TRACKS); the shared one is vetoed. */
export function bridgeTrack() { return null; }
const bridgeSteps = (x, z, rnd, reach = 60) => {
  let best = null;
  for (const b of bridges()) { const d = Math.hypot(b.c[0] - x, b.c[1] - z); if (d < reach && (!best || d < best.d)) best = { b, d }; }
  if (!best) return null;
  const { c, ax, f } = best.b, h = (ax === 'z' ? (f[0] + f[1]) / 2 : (f[0] + f[1]) / 2) + 3.6, s = rnd() < 0.5 ? 1 : -1;
  return ax === 'z' ? { pts: [[c[0] + (rnd() - 0.5), c[1] - s * h], [c[0] + (rnd() - 0.5), c[1] + s * h]], d: best.d } : { pts: [[c[0] - s * h, c[1] + (rnd() - 0.5)], [c[0] + s * h, c[1] + (rnd() - 0.5)]], d: best.d };
};
/** A walker's track along the street nearest to (x, z): the calli of the bands (north–south), the Merceria, the arcades of the piazza. */
const walkTrack = (x, z, rnd, reach = 70, lead = 30) => {
  const cand = [];
  for (const b of bands()) for (const [z0, z1] of b.runs) { const xm = (b.x0 + b.x1) / 2, qz = Math.max(z0, Math.min(z1, z)), d = Math.hypot(xm - x, qz - z); if (d < reach) cand.push({ d, pts: (a, c) => [[xm, a], [xm, c]], lo: z0 + 1, hi: z1 - 1, at: qz }); }
  const xm = (MERCERIA[0] + MERCERIA[2]) / 2, qz = Math.max(MERCERIA[1], Math.min(MERCERIA[3] - 2.5, z)), dm = Math.hypot(xm - x, qz - z);
  if (dm < reach) cand.push({ d: dm, pts: (a, c) => [[xm, a], [xm, c]], lo: MERCERIA[1] + 1, hi: MERCERIA[3] - 3, at: qz });
  for (const zz of [PIAZZA[1] + 3, PIAZZA[3] - 3]) { const qx = Math.max(PIAZZA[0] + 3, Math.min(PIAZZA[2] - 3, x)), d = Math.hypot(qx - x, zz - z); if (d < reach) cand.push({ d, pts: (a, c) => [[a, zz], [c, zz]], lo: PIAZZA[0] + 3, hi: PIAZZA[2] - 3, at: qx }); }
  if (!cand.length) return null;
  const best = cand.reduce((p, q) => (q.d < p.d ? q : p)), dir = rnd() < 0.5 ? 1 : -1;
  const a = Math.max(best.lo, Math.min(best.hi, best.at - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(best.lo, Math.min(best.hi, best.at + dir * lead * (0.8 + 0.8 * rnd())));
  return Math.abs(b - a) < 10 ? null : { pts: best.pts(a, b) };
};
/**
 * Venice's own passing sounds, which the scheduler adds to the shared ones (voices.js placed(): `M.TRACKS`): [key, voice, speed m/s, r50, gap [min, max], ok(hour, rain), track(x, z, rnd)].
 */
export const TRACKS = [
  { key: 'v:gond', voice: 'venGondola', speed: 1.2, r50: 16, gap: [24, 60], ok: (h, rain) => h >= 5.5 && h < 21 && rain < 0.6, get: (x, z, r) => gondolaTrack(x, z, r, 90, 40) },
  { key: 'v:cross', voice: 'venCross', speed: 1.25, r50: 9, gap: [16, 40], ok: (h, rain) => h >= 6 && h < 22 && rain < 0.6, get: (x, z, r) => bridgeSteps(x, z, r) },
  { key: 'v:cry', voice: 'venCry', speed: 0.95, r50: 12, gap: [34, 80], ok: (h, rain) => h >= 6 && h < 19 && rain < 0.4, get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
  { key: 'v:patrol', voice: 'venPatrol', speed: 1.0, r50: 12, gap: [70, 140], ok: (h, rain) => (h >= 20 || h < 4.5) && rain < 0.5, get: (x, z, r) => walkTrack(x, z, r, 90, 34) },
];

/** A pond is none here. */
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const treeSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** A few street trees and the gardens' green: little. */
export const leafNear = () => 0.1;
export const greenNear = () => 0.08;
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the squares and calli, less toward the lagoon's rim. */
export function townNear(x, z) { return Math.max(0.15, 1 - 0.7 * sm(240, 330, Math.hypot(x, z))); }
export const frogGround = () => 0;

// ── the rooms ─────────────────────────────────────────────────────────────────
/** The room the listener is in: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const upper = y > 4;
  for (const s of sites()) if (inRect(s.rect, x, z) || (s.arms && s.arms.some((a) => inRect(a, x, z)))) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper, same: 'lot:' + l.seed };
  return null;
}
/** What each kind of room sounds like inside: `tone` the room's hush (a lowpass in Hz and a level), `roof` the rain on the tiles from inside, `hush` how much of the outdoors comes through, `work` small voices [voice, gap s]. */
const shop = (tone, work, hush = 0.7) => ({ tone, roof: 0.9, hush, work });
export const ROOMS = {
  cloth: shop([320, 0.25], [['clothRustle', 26]], 0.8), silk: shop([240, 0.15], [['clothRustle', 24]]), spice: shop([280, 0.25], [['drawer', 40]], 0.8),
  books: shop([260, 0.2], [['paper', 36]]), gold: shop([240, 0.2], [['coin', 40]], 0.6), glass: shop([300, 0.2], [['venGlass', 50]], 0.8),
  wine: shop([300, 0.3], [['jarLid', 40]], 0.8), bread: shop([420, 0.4], [['venBake', 30]], 0.9), shoes: shop([300, 0.25], [['venCobbler', 30]], 0.8),
  barber: shop([300, 0.25], [['scissors', 40]], 0.8), hats: shop([260, 0.2], [['clothRustle', 30]]),
  basilica: { tone: [130, 0.32], roof: 0.5, hush: 0.45, work: [['venChoir', 90]] },        // the great gold-lined vaults: low, vast, the air in them
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The upper floors of the houses: close under the tiles. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 30]] };
