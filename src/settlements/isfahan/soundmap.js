// Where the sounds of Safavid Isfahan are (docs/settlements/isfahan.md §26.3): the places of its emitters and the geometry the audio engine needs to put
// each sound where it is made — the naqqareh-khaneh over the Qeysarieh portal, the bazaar's trades and its bagpipe and frame drum, the market's hawkers
// and water sellers on the square, the polo, the canals and basins, the coffeehouse, the music hall of Ali Qapu, the pigeon towers, the caravan, the rooms one
// can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js with the voices of src/engine/voices-isfahan.js. Coordinates: metres, +x east, +z south, the settlement's own frame.
// What the engine's scheduler asks of a map and Isfahan has not (boats, a pond, bamboo, frogs, streets for a vendor's walk) is answered with nothing.

import { SQUARE, CANAL, GARDEN, BAZAAR, TEAHOUSE, CHAHAR, CHAHAR_X, DOVECOTES, LOTF, ALIQAPU, COURT, ARCADE, C, M, ARRIVAL, arcadeBays, openHouses, houseSpots, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the square). */
export const HOME = ARRIVAL;
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

const [sx0, sz0, sx1, sz1] = SQUARE;
const K0 = sx0 + CANAL, K1 = sx1 - CANAL, Q0 = sz0 + CANAL, Q1 = sz1 - CANAL;      // the square's canal: x = ±67, z = -287 and 247
export const MUSIC_ROOM = [-102, -47, -94, -38];                                  // Ali Qapu's music hall (plan.js), at 32.5 m
export const SANCTUARY = (() => { const p = M(0, COURT.half + COURT.ring + 12.1); return [p[0] - 11, p[1] - 11, p[0] + 11, p[1] + 11]; })();
export const LOTF_ROOM = [LOTF.c[0] - 8, LOTF.c[1] - 8, LOTF.c[0] + 8, LOTF.c[1] + 8];
export const BAZAAR_RECT = [BAZAAR.x - BAZAAR.w / 2, BAZAAR.z1, BAZAAR.x + BAZAAR.w / 2, BAZAAR.z0];
const BLEN = BAZAAR.z0 - BAZAAR.z1, BN = Math.max(1, Math.round(BLEN / 5)), BW = BLEN / BN;
const BTRADES = ['cloth', 'carpet', 'copper', 'spice', 'pottery'];
/** The trade of the bazaar's shop i on side s (+1 east, -1 west): as the style lays them (safavid/index.js bazaar). */
export const bazaarTrade = (i, s) => BTRADES[(i + (s > 0 ? 0 : 2)) % BTRADES.length];
/** The bazaar's shops: { trade, at: [x, z] }. */
export function bazaarShops() {
  const out = [];
  for (const s of [-1, 1]) for (let i = 0; i < BN; i++) out.push({ trade: bazaarTrade(i, s), at: [BAZAAR.x + s * (BAZAAR.w / 2 + 1.6), BAZAAR.z0 - (i + 0.5) * BW] });
  return out;
}

/** The work heard from each trade's shop: [voice, gap [min, max] s, hours [from, to]]. [inferred from the trade; Tavernier names the copper-workers' bazaar] */
const TRADE_WORK = {
  cloth: [['clothRustle', [20, 46], [7.5, 18]]],
  carpet: [['clothRustle', [30, 70], [7.5, 18]]],
  copper: [['isfCopper', [9, 24], [7.5, 17.5]]],
  spice: [['mortar', [16, 36], [7.5, 17.5]]],
  pottery: [['clay', [16, 36], [7.5, 17]]],
};
/** The household's own sounds by the wing: the cook's pots and fire; the craftsman's loom upstairs is far above the court (no site). */
const WING_WORK = { kitchen: [['kitchen', [14, 32], [5.5, 20.5]]], store: [['sack', [50, 120], [6, 18]]] };

let SITES = null;
/** The rooms with sounds: { use, rect, at, id, work, y? } — the arcade shops that are entered, each by its trade; the kitchens and stores of the walk-in houses. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const b of arcadeBays().filter((q) => q.open)) {
    const p = [b.c[0] + b.n[0] * 3.8 - b.u[0] * b.w / 2, b.c[1] + b.n[1] * 3.8 - b.u[1] * b.w / 2], q = [b.c[0] + b.n[0] * ARCADE + b.u[0] * b.w / 2, b.c[1] + b.n[1] * ARCADE + b.u[1] * b.w / 2];
    const r = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])];
    SITES.push({ use: 'shop:' + b.trade, rect: r, at: mid(r), id: `arc:${Math.round(b.c[0])},${Math.round(b.c[1])}`, work: TRADE_WORK[b.trade] || [], y: 0 });
  }
  for (const h of openHouses()) {
    const sp = houseSpots(h);
    for (const side of ['n', 's', 'w', 'e']) {
      const kind = h.v.wings[side];
      if (kind !== 'kitchen' && kind !== 'store') continue;
      SITES.push({ use: kind, rect: sp.rooms[side], at: mid(sp.rooms[side]), id: `house:${h.seed}:${side}`, work: WING_WORK[kind], y: 0.45 });
    }
  }
  return SITES;
}

export const WELLS = [];

// ── the rooms ────────────────────────────────────────────────────────────────
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: shop:<trade> (an arcade shop), bazaar (the street) and
 * its shop:<trade>, qahveh (the coffeehouse), music (Ali Qapu's hall), mosque (the two sanctuaries), kitchen, store (a house's wings), house (its other rooms).
 */
export function roomAt(x, z, y = 0) {
  if (inRect(MUSIC_ROOM, x, z) && y > 28) return { use: 'music', at: mid(MUSIC_ROOM), upper: false, same: 'music' };
  if (inRect(SANCTUARY, x, z)) return { use: 'mosque', at: mid(SANCTUARY), upper: false, same: 'shah' };
  if (inRect(LOTF_ROOM, x, z)) return { use: 'mosque', at: mid(LOTF_ROOM), upper: false, same: 'lotfollah' };
  if (inRect(TEAHOUSE, x, z)) return { use: 'qahveh', at: mid(TEAHOUSE), upper: false, same: 'qahveh' };
  if (inRect(BAZAAR_RECT, x, z)) return { use: 'bazaar', at: [BAZAAR.x, z], upper: false, same: 'bazaar' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.4, same: s.id };
  for (const h of openHouses()) {
    if (!inRect(h.rect, x, z)) continue;
    const sp = houseSpots(h);
    if (inRect(sp.court, x, z)) return y > 3.4 ? { use: 'house', at: mid(sp.court), upper: true, same: 'house:' + h.seed } : null;
    return { use: 'house', at: mid(h.rect), upper: y > 3.4, same: 'house:' + h.seed };
  }
  return null;
}
/** What each room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the flat roof is (mud and straw over beams: dull), `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [280, 0.25], roof: 0.7, hush: 0.8, work: [['clothRustle', 60]] };
export const ROOMS = {
  house: { ...R0, work: [['broom', 90]] },
  kitchen: { tone: [420, 0.45], roof: 0.8, hush: 0.8, work: [['kitchen', 14], ['pour', 40]] },
  store: { ...R0, work: [['sack', 40], ['jarLid', 70]] },
  'shop:cloth': { tone: [300, 0.25], roof: 0.7, hush: 0.85, work: [['clothRustle', 30]] },
  'shop:carpet': { tone: [260, 0.2], roof: 0.7, hush: 0.8, work: [['clothRustle', 36]] },
  'shop:copper': { tone: [420, 0.4], roof: 0.7, hush: 1.0, work: [['isfCopper', 16]] },
  'shop:spice': { tone: [280, 0.25], roof: 0.7, hush: 0.8, work: [['mortar', 20], ['drawer', 70]] },
  'shop:pottery': { tone: [300, 0.25], roof: 0.7, hush: 0.8, work: [['clay', 22]] },
  bazaar: { tone: [330, 0.45], roof: 0.4, hush: 0.9, work: [['teaTalk', 16], ['coin', 40]] },     // the vaulted street: a murmur, no rain heard through the brick
  qahveh: { tone: [500, 0.5], roof: 0.6, hush: 0.9, work: [['teaTalk', 9], ['teaClink', 12], ['isfGhalyan', 24]] },
  music: { tone: [240, 0.2], roof: 0.9, hush: 0.6, work: [['isfSantur', 70]] },
  mosque: { tone: [130, 0.3], roof: 0.45, hush: 0.4, work: [['clothRustle', 70]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 50], ['broom', 90]] };

// ── the waters, the planting, the town ───────────────────────────────────────
/** The segments of running water: the square's canal in its ring, the Chahar Bagh's channel down its middle. */
const WATER = [[[K0, Q0], [K0, Q1]], [[K1, Q0], [K1, Q1]], [[K0, Q0], [K1, Q0]], [[K0, Q1], [K1, Q1]], [[CHAHAR_X, CHAHAR[1]], [CHAHAR_X, CHAHAR[3]]]];
function nearOnSeg(a, b, x, z) {
  const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp01(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz));
  return [a[0] + dx * t, a[1] + dz * t];
}
const clamp01 = (t) => Math.max(0, Math.min(1, t));
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

/** Is there a tree at (x, z): the plane trees along the canal's rings, the royal garden's, the Chahar Bagh's rows. */
function treeAt(x, z) {
  if (inRect(GARDEN, x, z, -6)) return true;
  if (inRect(CHAHAR, x, z)) return true;
  const dx = Math.min(Math.abs(x - (K0 - 2.5)), Math.abs(x - (K1 + 2.5))), dz = Math.min(Math.abs(z - (Q0 - 2.5)), Math.abs(z - (Q1 + 2.5)));
  return (dx < 1.5 && z > Q0 - 4 && z < Q1 + 4) || (dz < 1.5 && x > K0 - 4 && x < K1 + 4);
}
/** 0…1: how much green round (x, z), for the insects: the royal garden and the avenue, the canal's planes, the town's courts a little. */
export function greenNear(x, z) {
  const garden = 1 - sm(0, 26, rectDist(GARDEN, x, z)), avenue = 1 - sm(0, 26, rectDist(CHAHAR, x, z));
  const canal = inRect([K0 - 6, Q0 - 6, K1 + 6, Q1 + 6], x, z) ? 0.5 : 0;
  return Math.max(0.9 * garden, 0.9 * avenue, canal, 0.14);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 14; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (treeAt(px, pz)) return [px, pz]; }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all on the square, the arcades and in the bazaar, some in the courts, little at the rim and in the garden. */
export function townNear(x, z) {
  if (inRect(BAZAAR_RECT, x, z, 6)) return 1;
  if (inRect(SQUARE, x, z, ARCADE + 2)) return 1;
  if (inRect(GARDEN, x, z)) return 0.25;
  return Math.max(0.12, 0.8 * (1 - 0.6 * sm(200, 400, Math.hypot(x, z))));
}

// ── the emitters in the open ─────────────────────────────────────────────────
const caravan = [0, BAZAAR.z1 - 9];
const CANAL_PT = [[K0 + 2.2, -120], [K1 - 2.2, 40], [K0 + 2.2, 150]];
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] (local; wrapping midnight when from > to), dry,
 * rainMax, lv, after, inside }. The shops' and kitchens' work comes from sites(). [inferred; the sources for the places and hours are in the dossier §26.3]
 */
export const EMITTERS = [
  // the naqqareh-khaneh over the Qeysarieh portal: drums and trumpets at sunset, at midnight and at sunrise (Tavernier; iranroute)
  { voice: 'isfNaqqareh', at: [0, sz0 - 3], r50: 110, gap: [30, 40], hours: [17.9, 18.6], rainMax: 0.85, after: true, id: 'naq:sunset' },
  { voice: 'isfNaqqareh', at: [0, sz0 - 3], r50: 110, gap: [30, 40], hours: [23.7, 0.4], rainMax: 0.85, after: true, id: 'naq:midnight' },
  { voice: 'isfNaqqareh', at: [0, sz0 - 3], r50: 110, gap: [30, 40], hours: [5.8, 6.5], rainMax: 0.85, after: true, id: 'naq:sunrise' },
  // the bazaar: a bagpipe and a frame drum, the broker's cry among the carpets (García de Silva y Figueroa, 1618)
  { voice: 'isfNeyAnban', at: [0, BAZAAR.z0 - 30], r50: 22, gap: [80, 170], hours: [9, 17], rainMax: 0.9, after: true, id: 'bz:pipe' },
  { voice: 'isfDaf', at: [1, BAZAAR.z0 - 31], r50: 20, gap: [60, 140], hours: [9, 17], rainMax: 0.9, after: true, id: 'bz:daf' },
  { voice: 'isfHawkBroker', at: [0, BAZAAR.z0 - 22], r50: 14, gap: [40, 100], hours: [8, 16.5], rainMax: 0.9, id: 'bz:broker' },
  // the market on the square: the melon seller, the baker's boy, the storyteller's circle near the arrival (docs §20)
  { voice: 'isfHawkMelon', at: [-24, 203], r50: 18, gap: [34, 84], hours: [7, 16], rainMax: 0.5, id: 'mk:melon' },
  { voice: 'isfHawkBread', at: [26, 188], r50: 18, gap: [40, 90], hours: [5.5, 10], rainMax: 0.5, id: 'mk:bread' },
  { voice: 'isfNaqqal', at: [11, 181], r50: 16, gap: [34, 80], hours: [9, 18], rainMax: 0.3, after: true, id: 'mk:naqqal' },
  ...CANAL_PT.map((at, i) => ({ voice: 'isfSaqqa', at, r50: 16, gap: [44, 110], hours: [7, 18], dry: true, id: 'saqqa' + i })),
  // polo on the field at evening (Tavernier's "pall-mall on horseback"; the dossier's §5)
  { voice: 'isfPolo', at: [0, -100], r50: 50, gap: [20, 50], hours: [16.2, 18.2], dry: true, id: 'polo:n' },
  { voice: 'isfPolo', at: [0, 80], r50: 50, gap: [26, 60], hours: [16.4, 18.2], dry: true, id: 'polo:s' },
  // water: the Shah Mosque's court pool, the royal garden's pool, the basins on the Chahar Bagh
  { voice: 'isfFountain', at: C, r50: 13, gap: [10, 22], hours: [4, 23], id: 'pool:court' },
  { voice: 'isfFountain', at: [-221, -45], r50: 12, gap: [10, 22], hours: [4, 23], id: 'pool:garden' },
  ...[-88, -44, 0, 44, 88].map((z, i) => ({ voice: 'isfChannel', at: [CHAHAR_X, z], r50: 14, gap: [12, 26], hours: [4, 23], id: 'chahar' + i })),
  ...CANAL_PT.map((at, i) => ({ voice: 'isfChannel', at: [at[0] > 0 ? K1 : K0, at[1]], r50: 12, gap: [16, 34], hours: [4, 23], lv: 0.8, id: 'canal' + i })),
  // the coffeehouse by the Qeysarieh: talk, cups, the reciter, the water pipe (Iranica)
  { voice: 'teaTalk', at: mid(TEAHOUSE), r50: 9, gap: [8, 16], hours: [7, 23], inside: 'qahveh', lv: 0.9, id: 'qh:talk' },
  { voice: 'teaClink', at: mid(TEAHOUSE), r50: 7, gap: [8, 18], hours: [7, 23], inside: 'qahveh', id: 'qh:cups' },
  { voice: 'isfNaqqal', at: mid(TEAHOUSE), r50: 12, gap: [50, 120], hours: [15, 22.5], rainMax: 1, after: true, inside: 'qahveh', id: 'qh:naqqal' },
  { voice: 'isfGhalyan', at: mid(TEAHOUSE), r50: 8, gap: [14, 34], hours: [8, 23], inside: 'qahveh', id: 'qh:pipe' },
  // the music hall of Ali Qapu, high in the palace: a santur in the afternoon and evening
  { voice: 'isfSantur', at: mid(MUSIC_ROOM), r50: 20, gap: [90, 200], hours: [15, 21.5], rainMax: 0.6, after: true, inside: 'music', id: 'aq:santur' },
  // the Shah Mosque's sanctuary: a murmur of recitation (the call to prayer is the engine's: profile `adhan`)
  { voice: 'recite', at: mid(SANCTUARY), r50: 12, gap: [50, 120], hours: [5, 20], inside: 'shah', lv: 0.8, id: 'shah:recite' },
  // the pigeon towers of the fields
  ...DOVECOTES.map((d, i) => ({ voice: 'isfPigeons', at: d.c, r50: 22, gap: [10, 26], hours: [6, 19], rainMax: 0.5, id: 'dove' + i })),
  // the caravan come in at the bazaar's north end: camels groaning with their bells, a laden donkey
  { voice: 'isfCamel', at: caravan, r50: 18, gap: [26, 70], hours: [5, 19], rainMax: 0.8, id: 'car:camel' },
  { voice: 'donkeyBray', at: [caravan[0] + 10, caravan[1] + 2], r50: 22, gap: [70, 160], hours: [6, 17], rainMax: 0.6, id: 'car:donkey' },
  { voice: 'isfDonkeyBell', at: [caravan[0] + 9, caravan[1] + 3], r50: 14, gap: [50, 110], hours: [6, 17], rainMax: 0.6, id: 'car:bell' },
];
