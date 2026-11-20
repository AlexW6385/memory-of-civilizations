// Where Abbasid Baghdad's sounds are (docs/settlements/abbasid-baghdad.md §16): the places of the emitters and the geometry the audio engine needs
// (soundscape.js's `LIFE.map`, the interface of Suzhou's and Cairo's maps): the readers of the House of Wisdom, the recitation in the Great Mosque,
// the horse-guard's barracks and the diwans of the esplanade, the water-sellers at the roads, the paper-sellers' pens, the coppersmiths and the
// spice-pounders of the suq rows, the khan's camels and its evening oud, the hammam, the bridges of boats, the shaduf and the porters of the Tigris,
// the boat-yard of the canal, the rooms one can be inside, the night patrol. Pure data and functions of layout.js (no three.js).
// Coordinates: metres, +x east, +z south, the settlement's own frame. [inferred throughout; what is [stated] is in the dossier.]

import { RADIUS, C, RC, RIVER, CANAL, BRIDGES, CANAL_BRIDGES, PALACE, MOSQUE, LIBRARY, SERVICE, SHOP, KHAN_RECT, HAMMAM_RECT, WORKSHOPS, MASJIDS, ESPLANADE, ALL_SUQS, JETTIES, AVENUES, ROADS_IN, ROADS_OUT, riverX, canalEnd, jettyAt, lots, inRect, rad } from './layout.js';
import { khanRooms, hammamRooms, worldRect } from '../../styles/abbasid/khan.js';
import '../../engine/voices-baghdad.js';

/** Where the audio puts the listener when the engine gives none (the arrival, on the esplanade south of the Golden Gate). */
export const HOME = [C[0], C[1] + 76];
export const FAR = {};
export const WELLS = [[C[0] + 30, C[1] + 80]];                  // the open well on the esplanade's east side (life.js: well 'open')
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const dist = (p, x, z) => Math.hypot(p[0] - x, p[1] - z);
/** A deterministic 0..1 from numbers (no Math.random in the map's data). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the places ───────────────────────────────────────────────────────────────
const [px, pz] = C;
export const CHAMBER = [px - 5, pz - 14, px + 5, pz - 4];
export const IWAN = [px - 4.5, pz - 2, px + 4.5, pz + 16];
export const MOSQUE_HALL = [(MOSQUE[0] + MOSQUE[2]) / 2 - 25, (MOSQUE[1] + MOSQUE[3]) / 2 + 2, (MOSQUE[0] + MOSQUE[2]) / 2 + 25, (MOSQUE[1] + MOSQUE[3]) / 2 + 24.7];
export const MOSQUE_COURT = [MOSQUE_HALL[0], MOSQUE_HALL[1] - 26, MOSQUE_HALL[2], MOSQUE_HALL[1]];
export const LIB_HALL = [(LIBRARY[0] + LIBRARY[2]) / 2 - 19, (LIBRARY[1] + LIBRARY[3]) / 2 - 16.5, (LIBRARY[0] + LIBRARY[2]) / 2 + 19, (LIBRARY[1] + LIBRARY[3]) / 2 - 5.8];
const KC = mid(KHAN_RECT), HC = mid(HAMMAM_RECT);
export const KHAN_COURT = worldRect('n', KC, [-12, -14, 12, 14]);
const KHAN_CELLS = khanRooms().map((r) => worldRect('n', KC, r.rect));
const HAMMAM_ROOMS = hammamRooms().map((r) => worldRect('n', HC, r.rect));
const MASJID_HALLS = () => MASJIDS.map((m) => { const d = m.rect[3] - m.rect[1], h = Math.min(11.5, d * 0.55); return [m.rect[0] + 0.6, m.rect[3] - h, m.rect[2] - 0.6, m.rect[3] - 0.6]; });
const BARRACKS = SERVICE[0].rect, DIWANS = [SERVICE[1].rect, SERVICE[2].rect], KITCHEN = SERVICE[3].rect;

/** The trades' work heard from a suq row: [voice, gap s]. */
const TRADE_WORK = {
  paper: [['bagPen', 26], ['bagPen', 44]], spice: [['mortar', 22], ['drawer', 70]], cloth: [['clothRustle', 32], ['scissors', 60]], copper: [['copperBeat', 14]],
  money: [['coin', 22], ['drawer', 80]], pottery: [['clay', 40], ['jarLid', 55]], fruit: [['ladle', 40], ['bagHawk', 36]], grain: [['sack', 30], ['coin', 70]],
};
const wk = (list, hours = [7, 18.5]) => list.map(([v, g]) => [v, [g * 0.6, g * 1.4], hours]);
let SITES = null;
/** A site's work as the engine takes it: [voice, [min, max] gap s, [from, to] hours]. */
export function sites() {
  if (SITES) return SITES;
  const S = [];
  const add = (use, rect, id, work) => S.push({ use, rect, at: mid(rect), id, work });
  add('library', LIB_HALL, 'library', wk([['bagScribes', 26], ['bagPen', 40]], [6.5, 21]));
  add('mosque', MOSQUE_HALL, 'mosque', wk([['recite', 45]], [5, 21.5]));
  add('chamber', CHAMBER, 'chamber', wk([['recite', 120]], [8, 17]));
  add('khan', [KC[0] - 14, KC[1] - 16, KC[0] + 14, KC[1] + 16], 'khan', wk([['bagCamel', 70], ['cups', 40]], [5.5, 21]));
  HAMMAM_ROOMS.forEach((r, i) => add('hammam', r, 'hammam:' + i, wk([['hamamDrip', 7], ['pour', 24]], [5, 21])));
  for (const w of WORKSHOPS) add('work:' + w.kind, [w.rect[0] + 0.6, w.rect[1] + 0.6, w.rect[2] - 0.6, w.rect[3] - 0.6], 'work:' + w.kind, wk(w.kind === 'bakery' ? [['ovenPeel', 22], ['kitchen', 14]] : w.kind === 'coppersmith' ? [['copperBeat', 10]] : w.kind === 'perfumer' ? [['mortar', 26], ['drawer', 60]] : [['wheel', 36]]));
  add('shop:paper', [SHOP[0] + 0.6, SHOP[1] + 0.6, SHOP[2] - 0.6, SHOP[3] - 0.6], 'shop:paper', wk(TRADE_WORK.paper));
  for (const b of ESPLANADE) add('room:' + b.kind, [b.rect[0] + 0.6, b.rect[1] + 0.6, b.rect[2] - 0.6, b.rect[3] - 0.6], 'room:' + b.kind + ':' + b.rect[1], wk(ROOM_WORK[b.kind] || []));
  SITES = S;
  return S;
}
const ROOM_WORK = {
  bakery: [['ovenPeel', 24], ['kitchen', 14]], diwan: [['bagPen', 24]], perfumer: [['mortar', 28]], kitchen: [['kitchen', 12], ['chop', 30]], coppersmith: [['copperBeat', 12]],
  potter: [['wheel', 36]], stable: [['bagHorses', 50]], treasury: [['coin', 24]], reception: [], guard: [], store: [['sack', 50]], bedroom: [],
};

// ── the waters: the Tigris, the Isa canal and the moat ──
/** The nearest point of the waters (the Tigris's banks, the canal's walls, the moat's rim) to (x, z): { p, d, i }. */
export function canalSpot(x, z) {
  const cands = [];
  { const xr = riverX(z), dx = x - xr, e = Math.abs(dx) - RIVER.w / 2; cands.push(e <= 0 ? { p: [x, z], d: 0, i: 0 } : { p: [xr + Math.sign(dx) * RIVER.w / 2, z], d: e, i: 0 }); }
  if (x > CANAL.x0 && x < canalEnd()) { const dz = z - CANAL.z, e = Math.abs(dz) - CANAL.w / 2; cands.push(e <= 0 ? { p: [x, z], d: 0, i: 1 } : { p: [x, CANAL.z + Math.sign(dz) * CANAL.w / 2], d: e, i: 1 }); }
  { const r = rad(x, z), t = Math.max(RC.moat0, Math.min(RC.moat1, r)), k = r > 0.01 ? t / r : 1; cands.push({ p: [C[0] + (x - C[0]) * k, C[1] + (z - C[1]) * k], d: Math.abs(r - t), i: 2 }); }
  return cands.sort((a, b) => a.d - b.d)[0];
}
/** A boat's track on the Tigris: the river's middle line, a pass by the listener's z (the quffas and zawraqs): from s0 to s1 along it. */
export function canalTrack(x, z, rnd, reach = 150, lead = 55) {
  if (Math.abs(x - riverX(z)) > reach) return null;
  const dir = rnd() < 0.5 ? 1 : -1, a = z - dir * lead * (0.6 + 0.6 * rnd()), b = z + dir * lead * (0.8 + 0.8 * rnd()), off = (rnd() - 0.5) * 30;
  if (Math.abs(a) > RADIUS - 20 || Math.abs(b) > RADIUS - 20) return null;
  return { pts: [[riverX(a) + off, a], [riverX(b) + off, b]] };
}
/** A walker's track over the nearest bridge within `reach`: the boat bridges (along x) and the canal's bridges (along z). */
export function bridgeTrack(x, z, rnd, reach = 60) {
  let best = null;
  for (const b of BRIDGES) { const at = [riverX(b.z), b.z], d = Math.hypot(at[0] - x, at[1] - z); if (d < reach && (!best || d < best.d)) best = { at, h: RIVER.w / 2 + 3, ax: 'x', d }; }
  for (const bx of CANAL_BRIDGES) { const at = [bx, CANAL.z], d = Math.hypot(at[0] - x, at[1] - z); if (d < reach && (!best || d < best.d)) best = { at, h: CANAL.w / 2 + 3, ax: 'z', d }; }
  if (!best) return null;
  const s = rnd() < 0.5 ? 1 : -1, o = (rnd() - 0.5) * 0.8;
  return best.ax === 'x' ? { pts: [[best.at[0] - s * best.h, best.at[1] + o], [best.at[0] + s * best.h, best.at[1] + o]], d: best.d } : { pts: [[best.at[0] + o, best.at[1] - s * best.h], [best.at[0] + o, best.at[1] + s * best.h]], d: best.d };
}
export const shoreSpot = () => null;                           // the engine's lapping at the canal's and the river's edge is canalSpot's
/** A spot at the water's edge near the listener within `reach` (a fish rising, a frog in the reeds), or null. */
export function pondSpot(x, z, rnd, reach = 40) {
  const c = canalSpot(x, z);
  if (!c || c.d > reach) return null;
  return [c.p[0] + (rnd() - 0.5) * 10, c.p[1] + (rnd() - 0.5) * 10];
}
/** 0..1: how froggy the ground is: the reeds of the Tigris's bank, the canal and the moat. */
export const frogGround = (x, z) => { const c = canalSpot(x, z); return c ? 0.9 * (1 - sm(10, 45, c.d)) : 0; };
export const bambooNear = () => 0;
export const lotusNear = () => 0;

// ── the streets: a walker's track along the nearest street within reach ──
const ESPL = [[C[0] - 150, C[1] + 42, C[0] + 150, C[1] + 56], [C[0] + 42, C[1] - 150, C[0] + 56, C[1] + 150]];
const STREETS = [...AVENUES, ...ROADS_IN, ...ROADS_OUT, ...ALL_SUQS.map((s) => s.rect), ...ESPL];
function streetPath(x, z, rnd, reach, lead, list = STREETS) {
  let best = null;
  list.forEach((r, i) => { const qx = Math.max(r[0], Math.min(r[2], x)), qz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(qx - x, qz - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = list[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = (horiz ? r[2] : r[3]) - 2, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2.2;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
export const streetTrack = () => null;                         // Suzhou's sedan chair, vendor and watchman are not Baghdad's: see TRACKS
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
export const TRACKS = [
  { key: 'bagVend', voice: 'bagVend', speed: 1.0, r50: 11, gap: [24, 58], ok: day(6, 19.5), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 32) },
  { key: 'bagRider', voice: 'bagHooves', speed: 2.0, r50: 16, gap: [50, 120], ok: day(6, 19), get: (x, z, rnd) => streetPath(x, z, rnd, 90, 45, ESPL) },
  { key: 'bagBoat', voice: 'bagBoatman', speed: 1.2, r50: 22, gap: [30, 75], ok: day(5.5, 19), get: (x, z, rnd) => canalTrack(x, z, rnd) },
  // the night rounds of the shurta (the city's police), [inferred]
  { key: 'bagWatch', voice: 'patrolSteps', speed: 1.0, r50: 13, gap: [40, 85], ok: (h, r) => (h >= 20.5 || h < 4.2) && r < 0.5, get: (x, z, rnd) => streetPath(x, z, rnd, 90, 34) },
];

// ── the planting: date palms along the esplanade's roads, gardens in the courts, reeds and tamarisk by the water ──
export const treeSpot = () => null;                            // the engine's seasonal birds are not Baghdad's: the pigeons and sparrows are emitters
export function leafNear(x, z) { const c = canalSpot(x, z); return Math.min(1, 0.12 + 0.35 * (c ? 1 - sm(0, 50, c.d) : 0) + 0.3 * (rad(x, z) < RC.inner ? 1 : 0)); }
export function greenNear(x, z) { return Math.max(0.06, 0.8 * leafNear(x, z)); }
/** 0..1: how much of the town's hubbub reaches (x, z): all in the suq rows, much on the esplanade, the khan and the Karkh quays, little outside. */
export function townNear(x, z) {
  if (ALL_SUQS.some((s) => inRect(s.rect, x, z, 5))) return 1;
  if (inRect(KHAN_RECT, x, z, 10) || inRect(HAMMAM_RECT, x, z, 8)) return 0.9;
  const r = rad(x, z);
  if (r < RC.inner) return 0.7 * (1 - 0.5 * sm(40, 200, r));
  if (z > CANAL.z - 20 && x > -340 && x < 220) return 0.6;
  return Math.max(0.1, 0.5 * (1 - sm(RC.main, RADIUS, Math.hypot(x, z))));
}

// ── the rooms (asked only when the listener is indoors) ──
/** The room the listener is in: { use, at, upper, same } or null. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > 3.4, same: s.id };
  if (inRect(IWAN, x, z)) return { use: 'iwan', at: mid(IWAN), upper: false, same: 'iwan' };
  for (const r of KHAN_CELLS) if (inRect(r, x, z)) return { use: 'cell', at: mid(r), upper: y > 3.4, same: 'cell:' + Math.round(r[0]) + ':' + Math.round(r[1]) };
  for (const r of MASJID_HALLS()) if (inRect(r, x, z)) return { use: 'masjid', at: mid(r), upper: false, same: 'masjid:' + Math.round(r[0]) };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: mid(l.rect), upper: y > 3.4, same: 'h:' + Math.round(l.rect[0]) + ':' + Math.round(l.rect[1]) };
  for (const s of ESPLANADE) if (inRect(s.rect, x, z)) return { use: 'room:' + s.kind, at: mid(s.rect), upper: y > 3.4, same: 'e:' + s.rect[1] };
  return null;
}
const R0 = { tone: [260, 0.22], roof: 0.6, hush: 0.8 };
export const ROOMS = {
  library: { tone: [190, 0.3], roof: 0.4, hush: 0.7, work: [['bagPen', 36]] },
  mosque: { tone: [170, 0.3], roof: 0.4, hush: 0.6, work: [['clothRustle', 70]] },
  chamber: { tone: [150, 0.3], roof: 0.3, hush: 0.4, work: [['clothRustle', 80]] },
  iwan: { tone: [160, 0.3], roof: 0.3, hush: 0.4, work: [['clothRustle', 90]] },
  khan: { ...R0, tone: [240, 0.3], hush: 0.6, work: [['sack', 60]] },
  cell: { ...R0, hush: 0.9, work: [['sack', 80]] },
  hammam: { tone: [380, 0.4], roof: 0.5, hush: 0.9, work: [['hamamDrip', 6]] },
  masjid: { ...R0, tone: [210, 0.3], hush: 0.6, work: [['clothRustle', 90]] },
  house: { ...R0, work: [['broom', 90]] },
  'shop:paper': { ...R0, tone: [280, 0.25], hush: 0.85, work: TRADE_WORK.paper },
  'work:bakery': { ...R0, tone: [320, 0.3], work: [['ovenPeel', 22]] },
  'work:coppersmith': { ...R0, tone: [420, 0.4], hush: 1.0, work: [['copperBeat', 10]] },
  'work:perfumer': { ...R0, tone: [280, 0.25], work: [['mortar', 26]] },
  'work:potter': { ...R0, work: [['wheel', 36]] },
  'room:bakery': { ...R0, tone: [320, 0.3], work: [['ovenPeel', 22]] },
  'room:diwan': { ...R0, tone: [240, 0.25], hush: 0.85, work: [['bagPen', 26]] },
  'room:perfumer': { ...R0, work: [['mortar', 28]] },
  'room:kitchen': { ...R0, work: [['kitchen', 12]] },
  'room:coppersmith': { ...R0, tone: [420, 0.4], hush: 1.0, work: [['copperBeat', 12]] },
  'room:potter': { ...R0, work: [['wheel', 36]] },
  'room:stable': { ...R0, work: [['bagHorses', 50]] },
  'room:treasury': { ...R0, tone: [330, 0.3], work: [['coin', 24]] },
  'room:reception': { ...R0 }, 'room:guard': { ...R0 }, 'room:store': { ...R0, work: [['sack', 50]] }, 'room:bedroom': { ...R0 },
};
export const UPPER = { tone: [230, 0.15], roof: 1.0, hush: 0.6, work: [['clothRustle', 50], ['broom', 90]] };

// ── the emitters in the open: { voice, at, r50, gap [min, max] s, hours [from, to], dry, rainMax, lv, after, inside, id } ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const DAY = [5.5, 19];
// the water-sellers' stalls at the esplanade's roads (fronts.js esplanadeElements: 10 stalls; the six nearest the arrival and the gate roads)
export const STALLS = [[-12, 70], [12, 70], [-12, -75], [12, -75], [95, 12], [-95, 12]].map(([dx, dz]) => [C[0] + dx, C[1] + dz]);
export const JETTY_AT = JETTIES.map((j) => { const J = jettyAt(j); return [J.a[0] + J.dir * 8, j.z]; });
const SUQ_AT = [];
for (const s of ALL_SUQS) {
  const horiz = s.rect[2] - s.rect[0] > s.rect[3] - s.rect[1], L = horiz ? s.rect[2] - s.rect[0] : s.rect[3] - s.rect[1], m = mid(s.rect);
  for (const u of [0.25, 0.7]) SUQ_AT.push({ s, at: horiz ? [s.rect[0] + L * u, m[1]] : [m[0], s.rect[1] + L * u], k: u });
}
export const EMITTERS = [
  // the horse-guard's barracks (north-west, toward the Sham gate), the diwans' clerks, the palace kitchens
  E('bagHorses', mid(BARRACKS), 24, [38, 90], [5, 20], { dry: true, id: 'barracks' }),
  ...DIWANS.map((r, i) => E('bagPen', mid(r), 14, [28, 64], [7.5, 17], { dry: true, id: 'diwan' + i })),
  E('kitchen', mid(KITCHEN), 14, [10, 24], [4.5, 21], { dry: true, id: 'palace:kitchen' }),
  E('mortar', [mid(KITCHEN)[0] + 4, mid(KITCHEN)[1] + 3], 12, [24, 55], [6, 19], { dry: true, id: 'palace:mortar' }),
  // the pool and the channel to the iwan (dossier §12)
  E('ottFountain', [px, pz + 26], 10, [8, 18], [4, 22], { id: 'palace:channel' }),
  // the pigeons of the roofs and the mosque's court
  ...[[px - 71, pz + 4], [px + 20, pz - 52], [px - 130, pz + 20], [px + 120, pz + 18], [px - 60, pz + 150]].map((p, i) => E('pigeons', p, 22, [20 + i * 4, 48], [6, 18.5], { dry: true, id: 'pigeons' + i })),
  // the water-sellers' calls at the stalls
  ...STALLS.map((p, i) => E('bagSaqqa', p, 15, [38 + i * 6, 90], DAY, { dry: true, id: 'saqqa' + i })),
  // the caravan on the esplanade's west side (the life plan's halted camels) and the water donkeys on the east
  E('bagCamel', [px - 25, pz + 52], 22, [55, 120], [5.5, 18.5], { dry: true, id: 'camel:caravan' }),
  E('donkeyBray', [px + 22, pz + 50], 24, [80, 170], [6, 18], { dry: true, id: 'donkey:esplanade' }),
  // the khan: camels in the court, the donkeys at the back, an oud and a frame drum in the court at evening
  E('bagCamel', KC, 24, [50, 110], [5.5, 18.5], { dry: true, id: 'camel:khan' }),
  E('donkeyBray', [KC[0], KC[1] + 17], 24, [90, 190], [6, 18], { dry: true, id: 'donkey:khan' }),
  E('bagOud', [KC[0] + 4, KC[1] - 3], 22, [140, 260], [19, 22.5], { dry: true, after: true, id: 'oud:khan' }),
  // the suq rows by their trades: the pens of the paper-sellers, the mortars, the copper, the scales, the cries
  ...SUQ_AT.flatMap(({ s, at, k }, i) => s.trades.slice(0, 2).flatMap((tr, j) => (TRADE_WORK[tr] || []).slice(0, 1).map(([v, g]) => E(v, [at[0] + j * 3, at[1] + k * 2], 14, [g * 0.7, g * 1.6], [7, 18.5], { dry: true, id: `suq${i}:${tr}` })))),
  ...ALL_SUQS.map((s, i) => E('bagHawk', mid(s.rect), 16, [22, 55], [6.5, 19], { dry: true, id: 'hawk' + i })),
  // the bridges of boats: planks and cables creaking with the current, day and night
  ...BRIDGES.map((b, i) => E('bagBridge', [riverX(b.z), b.z], 20, [14, 34], [0, 24], { id: 'bridge' + i })),
  // the shaduf on the east bank (life.js), the porters at the jetties, the boat-yard at the canal's west end
  ...[[riverX(20) + RIVER.w / 2 + 12, 20], [riverX(-180) + RIVER.w / 2 + 12, -180]].map((p, i) => E('bagShaduf', p, 20, [30, 70], [5.5, 18.5], { dry: true, id: 'shaduf' + i })),
  ...JETTY_AT.map((p, i) => E('bagPorters', p, 20, [26 + (i % 3) * 8, 70], [5.5, 18.5], { dry: true, id: 'jetty' + i })),
  E('hammer', [-338, CANAL.z - 11], 18, [12, 30], [6.5, 18], { dry: true, id: 'boatyard' }),
  // the evening: the cats on the roofs, the dogs of the quarters in the small hours (further off than the engine's own)
  ...[[px - 50, pz + 120], [px + 80, pz - 60], [-90, 340]].map((p, i) => E('catCry', p, 26, [80 + i * 20, 200], [22, 4], { dry: true, id: 'cat' + i })),
  ...[[px + 150, pz + 70], [px - 130, pz - 90], [-40, 420]].map((p, i) => E('dogFar', p, 40, [60 + i * 15, 150], [23, 4.5], { dry: true, id: 'dog' + i })),
];
void PALACE; void inRect; void dist; void mid;
