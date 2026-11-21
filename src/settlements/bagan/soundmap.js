// Where Pagan's sounds are (docs/settlements/bagan.md §15.3): the places of its emitters and the geometry the audio engine needs to put each sound where it is made — the great
// bells struck from outside with a log, the bells of the hti in the wind over the spires, the monks' chant in the kyaungs and the temple's halls, the pilgrims murmuring at the
// porches, the arched harp in the palace court, the festival ensemble before the Ananda, the shops' work along the road by the trade of each (the lacquerer's brush, the potter's
// clay, the loom, the betel mortar), the households' work, the rice pounders of the villages, the oxcarts and the hawkers on the roads, the river's wash and the paddled boats, the
// tokay in the thatch and the jackal on the plain at night, the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the
// profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-bagan.js). Coordinates: metres, +x east, +z south, the settlement's frame.
// What the scheduler asks of a map but Pagan has not (canals, bridges, Suzhou's sedan chairs) is answered with nothing; the passing sounds are its own `TRACKS`.
import '../../engine/voices-bagan.js';
import { RADIUS, CITY, PRECINCT, SHWE_PREC, SULA_PREC, THAT_ENC, PALACE, PAL_HALL, ANANDA, OKKYAUNG, KYAUNGS, KILNS, TANK, SHWE, SULA, THAT, MAIN_ROAD, bankX, inRect, lots, streets } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the way in, inside the Ananda precinct's west gate). */
export const HOME = [30, 0];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The work heard from each trade's shop on the road [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const SHOP = {
  lacquer: [['brushLacquer', [20, 45], [7, 18]]],
  pottery: [['clay', [14, 32], [6.5, 17]], ['jarLid', [50, 110], [7, 17]]],
  cloth: [['loom', [14, 30], [6.5, 18]], ['clothRustle', [40, 90], [7, 18]]],
  offerings: [['pour', [40, 90], [6, 18]], ['clothRustle', [40, 90], [6, 18]]],
  betel: [['mortar', [18, 40], [6.5, 19]]],
  rice: [['sack', [26, 60], [6, 17]], ['pour', [50, 110], [6, 17]]],
  tea: [['teaClink', [14, 34], [6, 21]], ['kitchen', [20, 45], [5.5, 21]]],
  parasols: [['splitBamboo', [20, 50], [7, 17]], ['clothRustle', [50, 100], [7, 17]]],
};
const TRADES = ['lacquer', 'pottery', 'cloth', 'offerings', 'betel', 'rice', 'tea', 'parasols'];
/** The households' work by the house's own seed (the trade whose yard stands behind it: §12). */
const HOUSE_WORK = [
  [['kitchen', [14, 30], [5.5, 20]], ['bgnPounder', [60, 130], [5, 8.5]]],
  [['loom', [14, 30], [6.5, 18]]],
  [['clay', [14, 32], [6.5, 17]], ['kitchen', [30, 60], [5.5, 20]]],
  [['kitchen', [14, 30], [5.5, 20]], ['splitBamboo', [30, 70], [7, 17]]],
];
const S = 9.8;                           // the shop's depth; the owner's house stands behind it (town.js houseEls)
let SITES = null;
/** The opened shops and houses with sounds: { use, rect, at, id: 'lot:<seed>[:h]', work }, from the lots. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect;
    if (l.shop) {
      const trade = TRADES[l.seed % 8], r = l.front === 's' ? [x0, z1 - S, x1, z1] : [x0, z0, x1, z0 + S];
      SITES.push({ use: 'shop_' + trade, rect: r, at: mid(r), id: 'lot:' + l.seed, work: SHOP[trade], y: 0.55 });
      const h = l.front === 's' ? [x0, z0, x1, z1 - S] : [x0, z0 + S, x1, z1];
      SITES.push({ use: 'house', rect: h, at: mid(h), id: 'lot:' + (l.seed + 1) + ':h', work: HOUSE_WORK[(l.seed >> 3) % 4], y: 1.35 });
    } else {      // (every strip lot is wide and deep enough for a house: no granary-only lots)
      SITES.push({ use: 'house', rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: HOUSE_WORK[(l.seed >> 3) % 4], y: 1.35 });
    }
  }
  return SITES;
}

/** The wells: at the cross street's two corners (town.js walkProps). */
export const WELLS = [[-135.2, -12], [-135.2, 12]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const [ax, az] = ANANDA.c, HO = 26.5;
const ROOM_RECTS = [
  ['room:ananda', 'temple', [ax - HO, az - HO, ax + HO, az + HO]],
  ['room:ananda-w', 'temple', [ax - 48.6, az - 5, ax - HO, az + 5]], ['room:ananda-e', 'temple', [ax + HO, az - 5, ax + 48.6, az + 5]],
  ['room:ananda-n', 'temple', [ax - 5, az - 48.6, ax + 5, az - HO]], ['room:ananda-s', 'temple', [ax - 5, az + HO, ax + 5, az + 48.6]],
  ['room:okkyaung', 'kyaung', OKKYAUNG],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch: soft), `hush` how much of the outdoors comes through (the open fronts of bamboo and thatch let much of it in), `work` [voice, gap s]. */
const R0 = { tone: [420, 0.3], roof: 0.7, hush: 0.55, work: [['clothRustle', 50]] };
export const ROOMS = {
  house: { ...R0, tone: [380, 0.3], work: [['kitchen', 30]] },
  shop_lacquer: { ...R0, work: [['brushLacquer', 24]] },
  shop_pottery: { ...R0, work: [['clay', 16]] },
  shop_cloth: { ...R0, work: [['loom', 16]] },
  shop_offerings: { ...R0, work: [['pour', 40]] },
  shop_betel: { ...R0, work: [['mortar', 20]] },
  shop_rice: { ...R0, tone: [340, 0.3], work: [['sack', 30]] },
  shop_tea: { ...R0, tone: [480, 0.35], work: [['teaClink', 16]] },
  shop_parasols: { ...R0, work: [['splitBamboo', 24]] },
  temple: { tone: [200, 0.35], roof: 0.3, hush: 0.3, work: [['bgnPray', 60]] },
  kyaung: { tone: [260, 0.25], roof: 0.5, hush: 0.45, work: [['bgnPaliChant', 120]] },
};
export const UPPER = { tone: [300, 0.2], roof: 1.0, hush: 0.5, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const VILLAGE = () => lots().filter((l) => l.village);
/** 0…1: how much green round (x, z): the Dry Zone is thin (thorn scrub, the odd neem and palmyra), thicker at the villages, the tank and the river's bank, in the Ananda's precinct (bodhi, neem). */
export function greenNear(x, z) {
  const bank = 1 - sm(0, 40, Math.abs(x - bankX(z))), tank = 1 - sm(0, 40, rectDist(TANK, x, z)), vil = VILLAGE().some((l) => rectDist(l.rect, x, z) < 14) ? 0.55 : 0;
  return Math.max(0.16, bank * 0.5, tank * 0.7, vil, inRect(PRECINCT, x, z) ? 0.4 : 0);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.8);
/** A tree to put a cicada in, near (x, z), or null: the neem and palmyras of the villages and the precinct, by the tank and the bank. The engine's seasonal songbirds (a cuckoo, an oriole, a magpie, a tit: asked with a reach of 40) are not
 *  Pagan's, so those are answered with nothing; the cicadas (asked with 36) are. */
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach >= 40) return null;
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && px > bankX(pz) + 4 && (greenNear(px, pz) > 0.3 || hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.1)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all along the two shop rows, much at the Ananda's west gate and the ghat, some in the city and the precincts, little on the plain. */
export function townNear(x, z) {
  if (inRect([-262, -30, 12, 30], x, z, 6)) return 1;
  if (inRect([PRECINCT[0], -30, PRECINCT[0] + 60, 30], x, z)) return 0.8;
  if (rectDist([bankX(0) - 6, -10, bankX(0) + 14, 10], x, z) < 6) return 0.8;
  if (inRect(CITY, x, z)) return 0.5;
  if ([PRECINCT, SHWE_PREC, SULA_PREC, THAT_ENC].some((r) => inRect(r, x, z))) return 0.4;
  return Math.max(0.1, 0.45 * (1 - sm(RADIUS - 200, RADIUS - 20, Math.hypot(x, z))));
}
// the river: the engine's "canal" is the Irrawaddy's bank (its wash, laps at the foot of the bank)
/** The nearest point of the river's edge and the distance to it, or null far from it. */
export function canalSpot(x, z) {
  const ex = bankX(Math.max(-RADIUS, Math.min(RADIUS, z))) - 3, d = Math.abs(x - ex);
  return d < 90 ? { p: [ex, z], d } : null;
}
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
/** A point on the village tank when the listener is within `reach` of it (the carp rise there, the frogs call). */
export function pondSpot(x, z, rnd, reach = 40) {
  if (rectDist(TANK, x, z) > reach) return null;
  return [TANK[0] + 3 + rnd() * (TANK[2] - TANK[0] - 6), TANK[1] + 3 + rnd() * (TANK[3] - TANK[1] - 6)];
}
export const shoreSpot = () => null;
/** 0…1: the bamboo clumps of the village yards (they knock in a gust). */
export const bambooNear = (x, z) => (VILLAGE().some((l) => rectDist(l.rect, x, z) < 10) ? 0.5 : 0);
export const lotusNear = () => 0;
/** 0…1: how froggy the ground is: the village tank's edge (the rains, June to October). */
export const frogGround = (x, z) => 0.9 * (1 - sm(6, 26, rectDist(TANK, x, z)));

// ── the passing: the oxcarts, the hawkers and the paddled boats, along their ways ──
const ROADS = [MAIN_ROAD, [-131.5, -138, -124.5, 138], [105 - 3, -95, 105 + 3, 95], [101, -125, 109, -95], [101, 95, 109, 125]];
function roadPath(x, z, rnd, reach, lead) {
  let best = null;
  streets().forEach((r, i) => { const d = rectDist(r, x, z); if (d < reach && Math.min(r[2] - r[0], r[3] - r[1]) < 12 && Math.max(r[2] - r[0], r[3] - r[1]) > 30 && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = streets()[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = (horiz ? r[2] : r[3]) - 2, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 3;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
function riverPath(x, z, rnd) {
  const ex = bankX(z) - 3;
  if (x - ex > 60) return null;
  const a = Math.max(-RADIUS + 30, z - 40 - rnd() * 40), b = Math.min(RADIUS - 30, z + 40 + rnd() * 40);
  if (rnd() < 0.5) return { pts: [[bankX(a) - 9 - rnd() * 5, a], [bankX(b) - 9 - rnd() * 5, b]] };
  return { pts: [[bankX(b) - 9 - rnd() * 5, b], [bankX(a) - 9 - rnd() * 5, a]] };
}
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
/** The place's own passing sounds (the engine's `TRACKS`): [{ key, voice, speed, r50, gap, ok(hour, rain), get(x, z, rnd) }]. */
export const TRACKS = [
  { key: 'bgnCart', voice: 'bgnCart', speed: 1.1, r50: 16, gap: [40, 100], ok: day(5, 19), get: (x, z, rnd) => roadPath(x, z, rnd, 90, 50) },
  { key: 'bgnHawker', voice: 'bgnHawker', speed: 1.0, r50: 11, gap: [30, 70], ok: day(6, 19), get: (x, z, rnd) => roadPath(x, z, rnd, 70, 30) },
  { key: 'bgnPaddle', voice: 'bgnPaddle', speed: 1.3, r50: 18, gap: [40, 100], ok: day(5, 19.5), get: (x, z, rnd) => riverPath(x, z, rnd) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const bell = (at, r50) => [E('bgnBell', at, r50, [90, 200], [4.5, 6.3], { rainMax: 0.8 }), E('bgnBell', at, r50, [100, 220], [17.5, 19.2], { rainMax: 0.8 }), E('bgnBell', at, r50, [220, 520], [6.3, 17.5], { rainMax: 0.8 })];
const hti = (c, r50) => E('bgnHtiBells', c, r50, [7, 16], [0, 24], { rainMax: 1 });
const chant = (at, r50, o = {}) => [E('bgnPaliChant', at, r50, [60, 130], [4.5, 6.3], { after: true, rainMax: 0.9, ...o }), E('bgnPaliChant', at, r50, [90, 200], [10.5, 11.9], { after: true, rainMax: 0.9, ...o }), E('bgnPaliChant', at, r50, [60, 130], [17.8, 19.4], { after: true, rainMax: 0.9, ...o })];
const GECKOS = [[-60, -12], [-60, 12], [-180, -12], [-180, 12], [-20, 12], [60, 130], [-160, 172], [-150, -205], [40, -155]];
export const EMITTERS = [
  // the great bells: the Ananda's (its bell hung in the precinct's north-east corner), the Shwezigon's, the Thatbyinnyu's, the Sulamani's: struck at dawn and dusk, and by pilgrims between
  ...bell([ax + 55, az - 62], 80), ...bell([SHWE.c[0] - 30, SHWE.c[1] + 25], 70), ...bell([THAT.c[0] + 36, THAT.c[1] - 34], 60), ...bell([SULA.c[0] - 26, SULA.c[1] + 24], 55),
  // the bells and vanes of the hti, over the four great spires
  hti([ax, az], 55), hti([SHWE.c[0], SHWE.c[1]], 50), hti([THAT.c[0], THAT.c[1]], 45), hti([SULA.c[0], SULA.c[1]], 40),
  // the monks' chant: the Ananda's halls, the okkyaung, the three kyaungs of the plain
  ...chant([ax, az], 34), ...chant(mid(OKKYAUNG), 20), ...KYAUNGS.flatMap((k) => chant(k, 18)),
  // the pilgrims murmuring at the four porches, a bell tapped when they rise
  ...[[-52, 0], [52, 0], [0, -52], [0, 52]].map(([dx, dz]) => E('bgnPray', [ax + dx, az + dz], 14, [30, 80], [6, 17.5], { rainMax: 0.5 })),
  E('bgnPray', [SHWE.c[0] + 24, SHWE.c[1]], 14, [40, 100], [6, 17.5], { rainMax: 0.5 }),
  // the arched harp in the palace's court and in the rest house by the Ananda's west gate; the festival ensemble before the Ananda and in the palace, in the afternoon
  E('bgnSaung', mid(PALACE), 22, [80, 180], [8, 18], { rainMax: 0.3, after: true }), E('bgnSaung', [42, -62], 16, [90, 200], [14, 18.5], { rainMax: 0.3, after: true }),
  E('bgnHsaing', [ax - 62, az - 14], 42, [220, 460], [15.5, 19], { rainMax: 0.2, after: true }), E('bgnHsaing', [PAL_HALL.c[0], PAL_HALL.c[1] + 12], 36, [260, 520], [10, 17], { rainMax: 0.2, after: true }),
  // the sweepers in the precinct
  E('broom', [62, 11], 12, [20, 50], [5, 8.5], { dry: true }), E('broom', [140, 16], 12, [20, 50], [5, 8.5], { dry: true }),
  // the potters' and brickmakers' kilns, and the rice pounders of the villages, in the morning and the late afternoon
  ...KILNS.flatMap((k) => [E('clay', k, 12, [14, 30], [6.5, 17], { dry: true }), E('wheel', k, 12, [24, 50], [6.5, 17], { dry: true })]),
  ...[[45, 128], [40, 158], [-160, 172], [-150, -205]].flatMap((p) => [E('bgnPounder', p, 16, [40, 90], [5, 8.5], { dry: true }), E('bgnPounder', p, 16, [60, 120], [16, 18.5], { dry: true })]),
  // the Irrawaddy's wash along the bank, in reaches
  ...[-220, -110, 0, 110, 220].map((z) => E('bgnRiver', [bankX(z) - 2, z], 45, [6, 12], [0, 24], { rainMax: 1 })),
  // the women at the wells and the ghat
  E('clothRustle', [bankX(0) + 3, 6], 10, [10, 26], [6, 17], { dry: true }), E('wellBucket', [bankX(0) + 5, -4], 10, [40, 90], [6, 17], { dry: true }),
  // the tokay in the thatch at night, the jackal and the owlet on the plain
  ...GECKOS.map((p) => E('bgnGecko', p, 22, [50, 120], [19, 4.5], { rainMax: 0.6 })),
  E('bgnJackal', [250, -60], 90, [90, 240], [20.5, 4], { rainMax: 0.4 }), E('bgnJackal', [-100, 262], 90, [120, 280], [21, 3.5], { rainMax: 0.4 }), E('bgnJackal', [262, 150], 90, [120, 280], [21, 3.5], { rainMax: 0.4 }),
  E('owl', [-30, 90], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [150, -60], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
  // the gong of the palace that marks the watches of the night
  E('bgnWatchGong', [PAL_HALL.c[0], PAL_HALL.c[1]], 70, [500, 900], [19, 5], { rainMax: 0.9 }),
];
void inRect;
