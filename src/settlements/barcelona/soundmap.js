// Where Barcelona's sounds are (docs/settlements/barcelona.md §14.3): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the electric trams of the Passeig and the Marina, the cabs and mule carts on the setts, the goatherd, the knife-grinder, the criers, the sereno of the night, the
// masons and the hoist of the works, Gaudí's workshop, the Schools, the market, the café and the shops that work, the rooms one can be inside. Pure data and functions of
// layout.js and the shops' plot plan (town.js, the style's blockShops: sites() builds it on first use) and the places of plan.js; read by src/engine/soundscape.js (the profile's `LIFE.map`) and
// played by src/engine/voices.js and src/engine/voices-barcelona.js.
// Coordinates: metres, +x east, +z south, the settlement's own frame (as the camera has in it).
// [inferred throughout: no recording of 1910 exists. What the sources give is marked [stated] beside it; the rest is the dossier's reasoning.]

import { RADIUS, PITCH, BLOCK, SAGRADA, GRACIA_X, MERCAT, CASA, height } from './layout.js';
import { blockElements } from './town.js';
import { blockShops } from '../../styles/modernisme/index.js';

/** Where the audio puts the listener when the engine gives none: the arrival, on the Marina's east kerb at the cross street. */
export const HOME = [240, -52];

/** A deterministic 0…1 from numbers (for the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

// ── the places ──────────────────────────────────────────────────────────────────
const XM = PITCH * 2.5, ZS = PITCH / 2;
/** The Schools (plan.js: rooms 'schools', 10 × 20 m at the works), Gaudí's workshop (rooms 'workshop'), the café house (layout.js CASA), the market's hall (60 × 44 m). */
export const SCHOOLS = [SAGRADA[0] - 12 - 10, SAGRADA[1] + 25 - 4.3, SAGRADA[0] - 12 + 10, SAGRADA[1] + 25 + 4.3];
export const WORKSHOP = [SAGRADA[0] - 32.7, SAGRADA[1] - 7.7, SAGRADA[0] - 27.3, SAGRADA[1] + 13.7];
export const CAFE = [CASA.fx - 17.6, CASA.z0, CASA.fx - 0.5, CASA.z0 + 9.3];
export const CASA_RECT = [CASA.fx - 17.6, CASA.z0, CASA.fx - 0.5, CASA.z0 + 16];
export const HALL = [MERCAT[0] - 30, MERCAT[1] - 22, MERCAT[0] + 30, MERCAT[1] + 22];
/** The stone yards at the façade's foot (arrival.js: 3 × 21 and 3 × 20 m inside the hoarding), the façade's foot, the works' gate, the kiosk of the Marina, the tram standing at the gate. */
export const YARDS = [[SAGRADA[0] + 22 + 8.8 + 1.5, SAGRADA[1] - 26 + 10.5], [SAGRADA[0] + 22 + 8.8 + 1.5, SAGRADA[1] + 6 + 10]];
export const FACADE = [SAGRADA[0] + 21, SAGRADA[1]];
export const KIOSK = [XM - 8.6, SAGRADA[1] + 29];
export const STOP = [XM + 1.55, SAGRADA[1] - 17];
/** The upright piano of the flat over the café (casaRooms 'casa-flat', 7.4 m up) and a street guitarist's bench on the Passeig. */
export const FLAT = [CASA.fx - 6, CASA.z0 + 5];
export const GUITAR = [GRACIA_X + 7.65, 30];

// ── the shops that work (the blocks' own plot plan, built on first use) ───────────
const HOURS = { colmado: [8, 20.5], forn: [5.5, 20], bodega: [9, 22], ferreteria: [8, 19.5], draperia: [9, 19.5], farmacia: [8, 23], sabater: [8, 19], perruqueria: [9, 21] };
/** What each trade sounds like at work: [voice, gap in seconds [min, max]] (base voices of voices.js where one fits). */
const WORK = {
  colmado: [['bcnSlice', [18, 45]], ['coin', [40, 90]], ['jarLid', [50, 110]]],
  forn: [['bcnOven', [20, 50]], ['sack', [40, 90]]],
  bodega: [['bcnBarrel', [16, 40]], ['pourWine', [30, 70]]],
  ferreteria: [['bcnMetal', [12, 30]], ['drawer', [40, 90]]],
  draperia: [['bcnShears', [20, 50]], ['clothRustle', [30, 60]]],
  farmacia: [['mortar', [24, 60]], ['drawer', [30, 70]]],
  sabater: [['bcnTack', [10, 26]]],
  perruqueria: [['scissors', [8, 20]], ['bowlClack', [40, 90]]],
};
let SITES = null;
/** The places with sounds of their own: { use, rect, at, id, work: [[voice, gap, hours]] } — the shops with their doors (150), the café, the Schools, the workshop, the market. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const els = blockElementsLazy();
  for (const el of els) for (const sh of el.shops) {
    const [a0, a1] = sh.ends, n = sh.n, d = 8.8, xs = [a0[0], a1[0], a0[0] - n[0] * d, a1[0] - n[0] * d], zs = [a0[1], a1[1], a0[1] - n[1] * d, a1[1] - n[1] * d];
    const rect = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], hrs = HOURS[sh.trade] || [8, 20];
    SITES.push({ use: sh.trade, rect, at: [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2], id: 'shop:' + sh.seed, work: (WORK[sh.trade] || []).map(([v, g]) => [v, g, hrs]) });
  }
  const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
  SITES.push({ use: 'cafe', rect: CAFE, at: mid(CAFE), id: 'cafe', work: [['bcnCafe', [6, 14], [7, 23.5]]] });
  SITES.push({ use: 'school', rect: SCHOOLS, at: mid(SCHOOLS), id: 'schools', work: [['bcnChildren', [8, 18], [9, 12.5]], ['bcnChildren', [8, 18], [15, 17.5]]] });
  SITES.push({ use: 'workshop', rect: WORKSHOP, at: mid(WORKSHOP), id: 'workshop', work: [['bcnPlaster', [12, 30], [8, 18]]] });
  SITES.push({ use: 'market', rect: HALL, at: mid(HALL), id: 'mercat', work: [['bcnMarketCry', [5, 14], [6.5, 14]], ['bcnCleaver', [10, 26], [6.5, 14]]] });
  return SITES;
}
/** The blocks' shops by block, read from the plot plan (the same call town.js and nightlight.js make). */
function blockElementsLazy() {
  const out = [];
  for (const el of blockElements()) if (el.shops) out.push({ c: el.c, shops: blockShops(el) });
  return out;
}

// ── fixed emitters ──────────────────────────────────────────────────────────────
export const WELLS = [];
const EMIT = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, dry: true, ...o });
export const EMITTERS = [
  // the works: masons at the two stone yards, the hammer on the façade's scaffolds, the derrick's winch [inferred: a building site's day, seven to six; Sundays unmodelled]
  EMIT('bcnChisel', YARDS[0], 26, [6, 15], [7, 17.5]), EMIT('bcnChisel', YARDS[1], 26, [7, 17], [7, 17.5]),
  EMIT('bcnScaffold', [FACADE[0] - 3, FACADE[1] - 10], 30, [9, 22], [7, 17.5]), EMIT('bcnScaffold', [FACADE[0] - 3, FACADE[1] + 12], 30, [11, 26], [7, 17.5]),
  EMIT('bcnHoist', [FACADE[0] - 8, FACADE[1] + 4], 36, [40, 90], [8, 17]),
  // the Schools' bell, rung at the door at nine and at three [inferred]
  EMIT('bcnSchoolBell', [SCHOOLS[0] - 1.5, (SCHOOLS[1] + SCHOOLS[3]) / 2], 40, [120, 240], [8.9, 9.2]), EMIT('bcnSchoolBell', [SCHOOLS[0] - 1.5, (SCHOOLS[1] + SCHOOLS[3]) / 2], 40, [120, 240], [14.9, 15.2]),
  // the tram standing at its stop by the gate: the foot-gong
  EMIT('bcnTramBell', STOP, 40, [30, 80], [6, 23], { rainMax: 0.95 }),
  // the Marina's kiosk: the newsboy
  EMIT('bcnCry', KIOSK, 24, [18, 40], [7, 21], { lv: 0.8 }),
  // the café's piano upstairs and the street guitarist [inferred: the flat's salon (§6); a busker on the Passeig]
  EMIT('bcnPiano', FLAT, 14, [50, 110], [11, 22.5], { inside: 'casa-flat' }),
  EMIT('bcnGuitar', GUITAR, 20, [60, 130], [11, 13.5], { rainMax: 0.2 }), EMIT('bcnGuitar', GUITAR, 20, [60, 130], [17, 21], { rainMax: 0.2 }),
  // the sereno's call for hands: clapped from the doors at night, around the arrival's streets and the Passeig
  EMIT('bcnClap', [XM - 14, -10], 40, [70, 150], [22.5, 3]), EMIT('bcnClap', [GRACIA_X + 14, -70], 40, [90, 180], [22.5, 3]), EMIT('bcnClap', [XM + 14, -120], 40, [90, 180], [22.5, 3]),
  // the gas lamps' hiss, softly, where the crossings' lamps stand (a few: the engine keeps only those near the listener)
  EMIT('bcnGasHiss', [XM - 12, -35], 7, [3, 6], [19, 6.5], { dry: false }), EMIT('bcnGasHiss', [XM + 12, -57], 7, [3, 6], [19, 6.5], { dry: false }),
];

// ── the passing: trams, cabs, carts, the goatherd, the grinder, the criers, the sereno, the lamplighter ──
/** A track along the street nearest to (x, z) within `reach` (x = 46 + 92 i for the streets running north–south, z = 46 + 92 k east–west), `lead` m either side of the listener, clipped to the disc. */
export function streetWay(x, z, rnd, reach = 70, lead = 30, lane = 2.4) {
  const nx = Math.round((x - ZS) / PITCH) * PITCH + ZS, nz = Math.round((z - ZS) / PITCH) * PITCH + ZS, dx = Math.abs(x - nx), dz = Math.abs(z - nz);
  const alongZ = dx <= dz;
  if (Math.min(dx, dz) > reach) return null;
  const lim = RADIUS - 62, dir = rnd() < 0.5 ? 1 : -1, near = clamp(alongZ ? z : x, -lim, lim);
  const a = clamp(near - dir * lead * (0.5 + 0.7 * rnd()), -lim, lim), b = clamp(near + dir * lead * (0.8 + 0.8 * rnd()), -lim, lim);
  if (Math.abs(b - a) < 14) return null;
  const off = -Math.sign(b - a) * lane + (rnd() - 0.5) * 0.6, c = alongZ ? nx : nz;
  return { pts: alongZ ? [[c + off, a], [c + off, b]] : [[a, c + off], [b, c + off]] };
}
/** A walker's track along the pavement (the vehicles' with the pavement's offset: 8.5 m from the street's middle, on a side). */
export function walkTrack(x, z, rnd, reach = 70, lead = 30) {
  const w = streetWay(x, z, rnd, reach, lead, 8.5);
  return w;
}
/** The tram lines (town.js tramLines): the Passeig, the cross street, the Marina; the line nearest to (x, z) within `reach`, a track along it with the car on its right-hand rail. */
const LINES = [{ ax: 'z', c: GRACIA_X, a: -330, b: 330 }, { ax: 'x', c: ZS, a: GRACIA_X + 14, b: XM - 14 }, { ax: 'z', c: XM, a: -220, b: ZS - 14 }];
export function tramWay(x, z, rnd, reach = 110, lead = 70) {
  let best = null;
  for (const L of LINES) {
    const along = L.ax === 'z' ? z : x, across = L.ax === 'z' ? x : z, d = Math.abs(across - L.c) + (along < L.a ? L.a - along : along > L.b ? along - L.b : 0);
    if (d < reach && (!best || d < best.d)) best = { d, L, along };
  }
  if (!best) return null;
  const { L } = best, lim = RADIUS - 70, dir = rnd() < 0.5 ? 1 : -1, near = clamp(best.along, Math.max(L.a, -lim), Math.min(L.b, lim));
  const a = clamp(near - dir * lead * (0.6 + 0.6 * rnd()), Math.max(L.a, -lim), Math.min(L.b, lim)), b = clamp(near + dir * lead * (0.9 + 0.8 * rnd()), Math.max(L.a, -lim), Math.min(L.b, lim));
  if (Math.abs(b - a) < 20) return null;
  const off = (b > a ? 1 : -1) * 1.55 * (L.ax === 'z' ? -1 : 1);
  return { pts: L.ax === 'z' ? [[L.c + off, a], [L.c + off, b]] : [[a, L.c + off], [b, L.c + off]] };
}
const dryEnough = (rain, m) => rain < m;
export const TRACKS = [
  { key: 'tram', voice: 'bcnTram', speed: 5.5, r50: 40, gap: [20, 55], ok: (h, rain) => h >= 5.5 && h < 24 && dryEnough(rain, 0.98), get: (x, z, r) => tramWay(x, z, r, 120, 70) },
  { key: 'cab', voice: 'bcnCab', speed: 3.6, r50: 15, gap: [7, 20], ok: (h, rain) => h >= 6 && h < 24.5 && dryEnough(rain, 0.95), get: (x, z, r) => streetWay(x, z, r, 80, 36, 3.2) },
  { key: 'cart', voice: 'bcnCart', speed: 1.5, r50: 15, gap: [40, 100], ok: (h, rain) => h >= 5.5 && h < 19 && dryEnough(rain, 0.8), get: (x, z, r) => streetWay(x, z, r, 90, 40, 4.5) },
  { key: 'goats', voice: 'bcnGoats', speed: 0.9, r50: 16, gap: [120, 260], ok: (h, rain) => (inHrs(h, [7, 10]) || inHrs(h, [16, 18])) && dryEnough(rain, 0.4), get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
  { key: 'grinder', voice: 'bcnGrinder', speed: 1.0, r50: 18, gap: [90, 200], ok: (h, rain) => h >= 9 && h < 18 && dryEnough(rain, 0.3), get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
  { key: 'cry', voice: 'bcnCry', speed: 1.0, r50: 12, gap: [18, 45], ok: (h, rain) => h >= 6 && h < 22 && dryEnough(rain, 0.5), get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
  { key: 'sereno', voice: 'bcnSereno', speed: 1.1, r50: 14, gap: [30, 70], ok: (h, rain) => (h >= 22 || h < 6) && dryEnough(rain, 0.8), get: (x, z, r) => walkTrack(x, z, r, 90, 36) },
  { key: 'lamplighter', voice: 'bcnLamplighter', speed: 1.3, r50: 14, gap: [40, 90], ok: (h, rain) => (inHrs(h, [17.5, 19.5]) || inHrs(h, [5, 6.5])) && dryEnough(rain, 0.9), get: (x, z, r) => walkTrack(x, z, r, 90, 40) },
];
function inHrs(h, [a, b]) { return a <= b ? h >= a && h < b : h >= a || h < b; }
// the built-in boat, crossing, sedan, vendor and watchman of voices.js are Suzhou's: none here; no canal, pond, lotus, bamboo or frogs
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the planes, the courts, the town's hubbub ───────────────────────────────────
/** Distance to the middle of the nearest street (a street's middle at 46 + 92 k on either axis). */
const dStreet = (x, z) => { const f = (v) => { const m = (((v - ZS) % PITCH) + PITCH) % PITCH; return Math.min(m, PITCH - m); }; return Math.min(f(x), f(z)); };
/** A plane tree of the row along the nearest street's kerb (7.65 m from its middle), within `reach` of (x, z): [x, z] or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  const nx = Math.round((x - ZS) / PITCH) * PITCH + ZS, nz = Math.round((z - ZS) / PITCH) * PITCH + ZS, alongZ = Math.abs(x - nx) <= Math.abs(z - nz), sg = rnd() < 0.5 ? 1 : -1;
  const p = alongZ ? [nx + sg * 7.65, z + (rnd() - 0.5) * reach * 1.6] : [x + (rnd() - 0.5) * reach * 1.6, nz + sg * 7.65];
  return Math.hypot(p[0], p[1]) < RADIUS - 30 ? p : null;
}
/** 0…1: how much broad-leaved tree is round: the planes' rows along every street, less in the works. */
export function leafNear(x, z) { return clamp(0.18 + 0.7 * (1 - sm(0, 22, dStreet(x, z))), 0, 0.9) * (inRect([SAGRADA[0] - 35, SAGRADA[1] - 35, SAGRADA[0] + 35, SAGRADA[1] + 35], x, z) ? 0.3 : 1); }
/** 0…1: how much green round (crickets, cicadas): the courts' gardens, inside the blocks. */
export function greenNear(x, z) { return 0.7 * sm(26, 34, dStreet(x, z)); }
/** 0…1: how much of the town's hubbub reaches (x, z): the Passeig and the Marina by the trams (1), the streets (0.75), the courts and the works (0.4), inside the market and the shops (the room's own hush). */
export function townNear(x, z) {
  if (inRect(HALL, x, z, 6)) return 0.9;
  if (Math.abs(x - GRACIA_X) < 14 || Math.abs(x - XM) < 14) return 1;
  const s = 1 - sm(8, 24, dStreet(x, z));
  return clamp(0.4 + 0.4 * s, 0.4, 0.8) * (1 - 0.25 * sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z)));
}

// ── the rooms ───────────────────────────────────────────────────────────────────
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: a trade's shop (the eight trades), cafe, school, workshop, market, house.
 * `upper`: more than 5.5 m over the street (the flats above the shops).
 */
export function roomAt(x, z, y = 0) {
  const g = height(x, z), upper = y > g + 5.5;
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: upper && s.use !== 'market', same: s.id };
  if (inRect(CASA_RECT, x, z)) return { use: upper ? 'house' : 'cafe', at: [(CASA_RECT[0] + CASA_RECT[2]) / 2, (CASA_RECT[1] + CASA_RECT[3]) / 2], upper, same: upper ? 'casa-flat' : 'casa' };
  // any other building the listener is inside: a house of the Eixample (the portals, the upstairs)
  const bx = Math.round(x / PITCH) * PITCH, bz = Math.round(z / PITCH) * PITCH;
  if (Math.abs(x - bx) < BLOCK / 2 && Math.abs(z - bz) < BLOCK / 2) return { use: 'house', at: [x, z], upper, same: 'house:' + bx + ',' + bz };
  return null;
}
/**
 * What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is from inside (flat terraces over
 * the flats; the market's iron and tiles loud), `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through.
 */
export const ROOMS = {
  colmado: { tone: [320, 0.3], roof: 0.5, hush: 0.8, work: [['bcnSlice', 40], ['jarLid', 50]] },
  forn: { tone: [380, 0.4], roof: 0.5, hush: 0.8, work: [['bcnOven', 30], ['sack', 40]] },
  bodega: { tone: [420, 0.4], roof: 0.5, hush: 0.9, work: [['bcnBarrel', 26], ['bowlClack', 30]] },
  ferreteria: { tone: [300, 0.25], roof: 0.5, hush: 0.8, work: [['bcnMetal', 22], ['drawer', 60]] },
  draperia: { tone: [250, 0.2], roof: 0.5, hush: 0.7, work: [['bcnShears', 40], ['clothRustle', 26]] },
  farmacia: { tone: [260, 0.2], roof: 0.5, hush: 0.7, work: [['mortar', 45], ['jarLid', 40]] },
  sabater: { tone: [300, 0.25], roof: 0.5, hush: 0.8, work: [['bcnTack', 22], ['broom', 60]] },
  perruqueria: { tone: [280, 0.2], roof: 0.5, hush: 0.7, work: [['scissors', 16], ['clothRustle', 40]] },
  cafe: { tone: [420, 0.5], roof: 0.5, hush: 0.9, work: [['bcnCafe', 8], ['bowlClack', 18]] },
  school: { tone: [300, 0.3], roof: 0.9, hush: 0.7, work: [['bcnChildren', 10], ['paper', 40]] },
  workshop: { tone: [260, 0.25], roof: 0.9, hush: 0.9, work: [['bcnPlaster', 16], ['paper', 50]] },
  market: { tone: [900, 0.5], roof: 1.2, hush: 1.0, work: [['bcnMarketCry', 7], ['bcnCleaver', 14], ['sack', 30]] },
  house: { tone: [260, 0.2], roof: 0.4, hush: 0.8, work: [['broom', 70], ['teaClink', 80]] },
};
/** The upper floors: the flats under their flat roofs, quiet. */
export const UPPER = { tone: [200, 0.12], roof: 0.5, hush: 0.6, work: [['paper', 40], ['broom', 80]] };
