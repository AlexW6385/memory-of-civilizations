// Where the sounds of Nasrid Granada are (docs/settlements/granada.md §22): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the fountain of the Lions and the basins of the Myrtles, the channel of the Acequia court and the Escalera del Agua, the Darro and its
// waterwheel, the cisterns of the mosques, the bath, the trades of the medina's shops (the coppersmiths', the bakers', the potters', the cloth and the grocers'),
// the looms and the kitchens of its houses, the doves of the towers and the swifts of summer, the drums and the trumpet of the Alcazaba, the mule strings on the
// lanes, the rooms one can be inside. Pure data and functions of layout.js and the house builder's own rules (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js with the voices of src/engine/voices-granada.js. Coordinates: metres, +x east, +z south, the
// settlement's own frame. What the engine's scheduler asks of a map and Granada has not (boats, a pond, bamboo, frogs, a street for a vendor's or a watchman's
// walk) is answered with nothing.

import { HILL, MYRTLES, COMARES, LIONS, ALCAZABA, PARTAL, RAUDA, ACEQUIA, GEN, DARRO, SITES, SOUK, GREAT_MOSQUE, MEDINA_LANES, lots, gardens, inRect, siteY } from './layout.js';
import { isShop, tradeOf, useOf } from '../../styles/nasrid/houses.js';

const T = HILL.top;
/** Where the audio puts the listener when the engine gives none (the arrival in the Court of the Myrtles). */
export const HOME = [19.5, 3];
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the rooms of the palaces, the bath and the mosques ───────────────────────
const [lx0, lz0, lx1, lz1] = LIONS;
/** The halls one can be inside (the rects of plan.js's `rooms`): { id, use, rect }. */
export const HALLS = [
  { id: 'hall:ambassadors', use: 'hall', rect: [COMARES[0] + 2.35, COMARES[1] + 2.35, COMARES[2] - 2.35, COMARES[3] - 2.35] },
  { id: 'hall:barca', use: 'hall', rect: [MYRTLES[0], MYRTLES[1] - 9.6, MYRTLES[2], MYRTLES[1] - 5.3] },
  { id: 'hall:sisters', use: 'hall', rect: [lx0 + 10, lz0 - 9.4, lx1 - 10, lz0 - 1.4] },
  { id: 'hall:abencerrajes', use: 'hall', rect: [lx0 + 10.6, lz1 + 1.4, lx1 - 10.6, lz1 + 8.2] },
  { id: 'hall:kings', use: 'hall', rect: [lx1 + 0.8, lz0 - 2.2, lx1 + 5.6, lz1 + 2.2] },
  { id: 'hall:tower', use: 'hall', rect: [PARTAL.tower[0] + 1.4, PARTAL.tower[1] + 1.4, PARTAL.tower[2] - 1.4, PARTAL.tower[3] - 1.4] },
  { id: 'hall:rauda', use: 'hall', rect: [RAUDA.rect[0] + 0.8, RAUDA.rect[1] + 0.8, RAUDA.rect[2] - 0.8, RAUDA.rect[3] - 0.8] },
];
const AL_MOSQUE = SITES.albaicinMosque.rect, HAMMAM = SITES.hammam.rect;
/** The prayer halls (the south part of each mosque: medina.js `hall` is their depth) and the sahns before them. */
export const PRAYER = [
  { id: 'mosque:great', rect: [GREAT_MOSQUE[0], GREAT_MOSQUE[3] - 20, GREAT_MOSQUE[2], GREAT_MOSQUE[3]], sahn: [GREAT_MOSQUE[0], GREAT_MOSQUE[1], GREAT_MOSQUE[2], GREAT_MOSQUE[3] - 20] },
  { id: 'mosque:albaicin', rect: [AL_MOSQUE[0], AL_MOSQUE[3] - 15, AL_MOSQUE[2], AL_MOSQUE[3]], sahn: [AL_MOSQUE[0], AL_MOSQUE[1], AL_MOSQUE[2], AL_MOSQUE[3] - 15] },
];

/** The work heard from each trade's shop: [voice, gap [min, max] s, hours [from, to]]. [inferred from the trade: the coppersmiths', bakers', potters' and cloth shops of the medina, §12 and §22] */
const TRADE_WORK = {
  potter: [['clay', [16, 36], [7.5, 17]]],
  cloth: [['clothRustle', [20, 46], [7.5, 18]]],
  grocer: [['mortar', [18, 40], [7.5, 18]], ['coin', [40, 90], [7.5, 18]]],
  smith: [['granCopper', [12, 30], [7.5, 17.5]], ['granBellows', [70, 140], [7.5, 17]]],
  baker: [['granOven', [30, 70], [4.5, 11]]],
};
/** The household's own sounds by its use. */
const USE_WORK = { home: [['broom', [50, 120], [6, 19]]], kitchen: [['kitchen', [14, 32], [5.5, 20.5]], ['pour', [50, 110], [6, 20]]], weaver: [['granLoom', [20, 50], [7, 18]]], store: [['sack', [50, 120], [6, 18]]] };

let SITES_ = null;
/** The rooms with sounds: { use, rect, at, id, work, y } — the medina's houses (those in lots() on the palaces' hill), a shop by its trade, a house by its use. */
export function sites() {
  if (SITES_) return SITES_;
  SITES_ = [];
  for (const l of lots()) {
    if (l.y !== T) continue;
    const shop = isShop(l.seed), use = shop ? 'shop:' + tradeOf(l.seed) : 'house:' + useOf(l.seed);
    SITES_.push({ use, rect: l.rect, at: mid(l.rect), id: `h:${l.seed}`, work: shop ? TRADE_WORK[tradeOf(l.seed)] : USE_WORK[useOf(l.seed)], y: T });
  }
  SITES_.push({ use: 'bath', rect: HAMMAM, at: mid(HAMMAM), id: 'bath', work: [['granBath', [18, 40], [6, 20]]], y: siteY('hammam') });
  return SITES_;
}
export const WELLS = [];

/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: hall (the palaces' halls), mosque, bath, shop:<trade>,
 * house:<use> (a medina house's ground room; `upper` above 3.4 m).
 */
export function roomAt(x, z, y = 0) {
  for (const h of HALLS) if (inRect(h.rect, x, z) && Math.abs(y - T) < 14) return { use: 'hall', at: mid(h.rect), upper: false, same: h.id };
  for (const p of PRAYER) if (inRect(p.rect, x, z)) return { use: 'mosque', at: mid(p.rect), upper: false, same: p.id };
  if (inRect(HAMMAM, x, z)) return { use: 'bath', at: mid(HAMMAM), upper: false, same: 'bath' };
  if (y > T - 2 && y < T + 8) for (const s of sites()) if (s.y === T && inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > T + 3.4, same: s.id };
  return null;
}
/** What each room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the tiles is, `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.8, hush: 0.8, work: [['clothRustle', 60]] };
export const ROOMS = {
  'house:home': { ...R0, work: [['broom', 90]] },
  'house:kitchen': { tone: [420, 0.45], roof: 0.9, hush: 0.8, work: [['kitchen', 14], ['pour', 40]] },
  'house:weaver': { ...R0, work: [['granLoom', 22]] },
  'house:store': { ...R0, work: [['sack', 40], ['jarLid', 70]] },
  'shop:potter': { tone: [300, 0.25], roof: 0.8, hush: 0.85, work: [['clay', 22]] },
  'shop:cloth': { tone: [280, 0.22], roof: 0.8, hush: 0.85, work: [['clothRustle', 30]] },
  'shop:grocer': { tone: [290, 0.25], roof: 0.8, hush: 0.85, work: [['mortar', 22], ['drawer', 70]] },
  'shop:smith': { tone: [440, 0.4], roof: 0.8, hush: 1.0, work: [['granCopper', 16]] },
  'shop:baker': { tone: [400, 0.4], roof: 0.8, hush: 0.9, work: [['granOven', 36]] },
  hall: { tone: [230, 0.3], roof: 0.5, hush: 0.45, work: [['clothRustle', 90]] },         // plaster and tile: a hard, bright room under its timber ceiling; the court's water close
  mosque: { tone: [140, 0.3], roof: 0.5, hush: 0.4, work: [['clothRustle', 70]] },
  bath: { tone: [180, 0.3], roof: 0.3, hush: 0.5, work: [['granBath', 26]] },
};
export const UPPER = { tone: [220, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 50], ['broom', 90]] };

// ── the waters, the planting, the town ───────────────────────────────────────
const [ax0, az0, ax1, az1] = ACEQUIA, acx = (ax0 + ax1) / 2;
/** The segments of running water: the Darro in its bed, the long channel of the Acequia court. */
const WATER = [[[DARRO.x0, DARRO.z], [DARRO.x1, DARRO.z]], [[acx, az0], [acx, az1]]];
const clamp01 = (t) => Math.max(0, Math.min(1, t));
function nearOnSeg(a, b, x, z) {
  const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp01(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz));
  return [a[0] + dx * t, a[1] + dz * t];
}
/** The nearest running water to (x, z) within 60 m: { p: [x, z], d }, or null. */
export function canalSpot(x, z) {
  let best = null;
  for (const [a, b] of WATER) { const p = nearOnSeg(a, b, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < 60 && (!best || d < best.d)) best = { p, d }; }
  return best;
}
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

/** The planted places: the Generalife's estate, the Myrtles' hedges, the Rauda's garden, the medina's walled huertas. */
const ESTATE = [262, -56, 345, 56];
const GREEN = () => [ESTATE, [MYRTLES[0] + 2, MYRTLES[1] + 2, MYRTLES[2] - 2, MYRTLES[3] - 2], RAUDA.garden, ...gardens().map((g) => g.rect)];
function treeAt(x, z) {
  if (inRect(ESTATE, x, z)) return hash(Math.floor(x / 3), Math.floor(z / 3), 5) < 0.55;
  if (Math.abs(z - DARRO.z) < 9 && Math.abs(x) < DARRO.x1) return hash(Math.floor(x / 4), 9, 3) < 0.4;       // the poplars of the Darro's banks
  return GREEN().some((r) => inRect(r, x, z, -1) && hash(Math.floor(x / 3), Math.floor(z / 3), 7) < 0.5);
}
/** 0…1: how much green round (x, z), for the insects and birds: the estate, the courts' hedges, the huertas, the river banks. */
export function greenNear(x, z) {
  let g = 0.12;
  for (const r of GREEN()) g = Math.max(g, (r === ESTATE ? 0.95 : 0.7) * (1 - sm(0, 26, rectDist(r, x, z))));
  g = Math.max(g, 0.5 * (1 - sm(4, 20, Math.abs(z - DARRO.z))));
  return g;
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 14; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (treeAt(px, pz)) return [px, pz]; }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all in the medina's lanes and at the souk, some in the palaces, little in the Generalife and the open hill. */
export function townNear(x, z) {
  if (inRect(SOUK, x, z, 8) || inRect([-110, -40, 210, 50], x, z)) return inRect([MYRTLES[0] - 4, MYRTLES[1] - 60, LIONS[2] + 8, MYRTLES[3] + 4], x, z) ? 0.35 : 1;
  if (inRect(ESTATE, x, z, 10)) return 0.1;
  return Math.max(0.12, 0.7 * (1 - 0.7 * sm(120, 380, Math.hypot(x - 20, z - 10))));
}

// ── the passing: the mule strings on the lanes ───────────────────────────────
const lane = MEDINA_LANES[1];
const near = (pts, x, z, d) => pts.some((p) => Math.hypot(p[0] - x, p[1] - z) < d);
const MULE_WEST = [[-88, lane], [-8, lane]], MULE_EAST = [[98, MEDINA_LANES[2]], [196, MEDINA_LANES[2]]];
/** The engine's own passing sounds: [{ key, voice, speed, r50, gap, ok(hour, rain), get(x, z, r) }]. */
export const TRACKS = [
  { key: 'mules', voice: 'granMules', speed: 0.95, r50: 14, gap: [50, 130], ok: (h, rain) => h >= 6.5 && h < 17.5 && rain < 0.5, get: (x, z, r) => { const w = near(MULE_WEST, x, z, 80) ? MULE_WEST : near(MULE_EAST, x, z, 80) ? MULE_EAST : null; return w ? { pts: r() < 0.5 ? w : [...w].reverse() } : null; } },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const [lcx, lcz] = mid(LIONS), [mcx] = mid(MYRTLES);
const gm = mid(GREAT_MOSQUE), alm = mid(PRAYER[1].sahn);
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] (local; wrapping midnight when from > to), dry,
 * rainMax, lv, after, inside }. The shops' and kitchens' work comes from sites(). [inferred; the sources for the places and hours are in the dossier §22]
 */
export const EMITTERS = [
  // water: the Lions' fountain, the jets in the basins at the Myrtles' ends, the Acequia court's channel, the Escalera del Agua, the mosques' cisterns
  { voice: 'granFountain', at: [lcx, lcz], r50: 14, gap: [8, 16], hours: [0, 24], id: 'lions' },
  { voice: 'granFountain', at: [mcx, MYRTLES[1] + 1.5], r50: 9, gap: [10, 20], hours: [0, 24], lv: 0.6, id: 'myrtles:n' },
  { voice: 'granFountain', at: [mcx, MYRTLES[3] - 1.5], r50: 9, gap: [10, 20], hours: [0, 24], lv: 0.6, id: 'myrtles:s' },
  ...[-30, -12, 6].map((z, i) => ({ voice: 'granChannel', at: [acx, z], r50: 12, gap: [12, 24], hours: [0, 24], id: 'acequia' + i })),
  ...[0.2, 0.5, 0.8].map((k, i) => ({ voice: 'granChannel', at: [GEN.stair.x0 + (GEN.stair.x1 - GEN.stair.x0) * k, GEN.stair.z], r50: 9, gap: [12, 24], hours: [0, 24], lv: 0.9, id: 'stair' + i })),
  { voice: 'granFountain', at: gm, r50: 11, gap: [10, 22], hours: [0, 24], lv: 0.8, id: 'cistern:great' },
  { voice: 'granFountain', at: alm, r50: 10, gap: [10, 22], hours: [0, 24], lv: 0.7, id: 'cistern:albaicin' },
  // the Darro in its ravine and the waterwheel turning on it
  ...[-250, -150, -50, 50, 150, 250].map((x, i) => ({ voice: 'granDarro', at: [x, DARRO.z], r50: 26, gap: [10, 22], hours: [0, 24], id: 'darro' + i })),
  { voice: 'granWheel', at: [-205, DARRO.z + 4], r50: 28, gap: [14, 30], hours: [5, 20], rainMax: 0.9, after: true, id: 'wheel' },
  // the mosques: a murmur of recitation in each prayer hall (the call to prayer is the engine's: profile `adhan`)
  { voice: 'recite', at: mid(PRAYER[0].rect), r50: 12, gap: [50, 120], hours: [5, 20], inside: 'mosque:great', lv: 0.8, id: 'recite:great' },
  { voice: 'recite', at: mid(PRAYER[1].rect), r50: 12, gap: [60, 140], hours: [5, 20], inside: 'mosque:albaicin', lv: 0.8, id: 'recite:albaicin' },
  // the souk: the silk and brocade of the Alcaicería, the cries of the lanes (the water carrier, the baker's boy)
  { voice: 'clothRustle', at: mid(SOUK), r50: 12, gap: [16, 36], hours: [7.5, 18], rainMax: 0.7, id: 'souk:silk' },
  { voice: 'coin', at: [SOUK[0] + 8, mid(SOUK)[1]], r50: 10, gap: [30, 70], hours: [7.5, 18], rainMax: 0.7, id: 'souk:coin' },
  { voice: 'granCry_water', at: [-70, lane + 0.5], r50: 16, gap: [50, 120], hours: [7, 18], dry: true, id: 'cry:water:w' },
  { voice: 'granCry_water', at: [120, MEDINA_LANES[2]], r50: 16, gap: [60, 140], hours: [7, 18], dry: true, id: 'cry:water:e' },
  { voice: 'granCry_bread', at: [-48, lane - 1], r50: 16, gap: [60, 140], hours: [5.5, 10], dry: true, id: 'cry:bread:w' },
  { voice: 'granCry_bread', at: [150, MEDINA_LANES[0]], r50: 16, gap: [70, 150], hours: [5.5, 10], dry: true, id: 'cry:bread:e' },
  { voice: 'granCry_mule', at: [-30, lane], r50: 16, gap: [80, 170], hours: [7, 17], dry: true, id: 'cry:mule' },
  // the Alcazaba: the guard's drums and trumpet at dawn and dusk
  { voice: 'granAnafil', at: mid(ALCAZABA), r50: 110, gap: [60, 90], hours: [5.3, 6.3], rainMax: 0.85, after: true, id: 'anafil:dawn' },
  { voice: 'granAnafil', at: mid(ALCAZABA), r50: 110, gap: [60, 90], hours: [18, 18.9], rainMax: 0.85, after: true, id: 'anafil:dusk' },
  // the doves of the towers and roofs, the swifts about them in summer
  ...[mid(COMARES), [lx1 + 3, lz0 - 6], mid(PARTAL.tower), [ALCAZABA[2] - 6, ALCAZABA[1] + 8]].map((at, i) => ({ voice: 'granDoves', at, r50: 24, gap: [10, 26], hours: [6, 19], rainMax: 0.5, id: 'dove' + i })),
  ...[[ALCAZABA[0] + 12, ALCAZABA[1] + 6], mid(COMARES), [lx1 + 6, lz1 + 4]].map((at, i) => ({ voice: 'granSwifts', at, r50: 40, gap: [14, 34], hours: [6, 20.5], rainMax: 0.4, id: 'swift' + i })),
];
