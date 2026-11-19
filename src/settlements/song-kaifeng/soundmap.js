// Where Northern Song Bianjing's sounds are (docs/settlements/song-kaifeng.md §19): the places of its emitters and the geometry the audio engine
// needs to put each sound where it is made (src/engine/voices.js `placed()`, voices-kaifeng.js): the Bian River with its boats, trackers and landing,
// the Rainbow Bridge, the shop streets, the trade houses, the Kaibao monastery's bell, drum and halls, the Iron Pagoda's wind bells, the gate road's
// camels, the tea houses and wine shops, the rooms one can be inside. Pure data and functions of layout.js and trades.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`). Coordinates: metres, +x east, +z south, the settlement's own frame.
//
// The engine's own bell schedule is off for this place (`bells: null`): the monastery's bell, drum and service, and the dawn caller, are emitters
// and tracks below, each in its hours.

import '../../engine/voices-kaifeng.js';
import { RADIUS, RIVER, BRIDGE, MONASTERY, PAGODA, WALL_X, GATE, STREETS, LANES, STONE_BANK, lots, inRect, inLot, lotAt, hotDist } from './layout.js';
import { tradeOf, teaHouses, wineShops } from './trades.js';

/** Where the audio puts the listener when the engine gives none (the arrival, before the Iron Pagoda). */
export const HOME = [160, -140];

/** A deterministic 0…1 from numbers (no Math.random in the choice of places). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];

// ── the monastery ───────────────────────────────────────────────────────────────
const [MX0, MZ0, MX1] = MONASTERY;
/** The bell tower (east, before the main hall), the drum tower (west), the main hall and the pagoda (plan.js: the towers at PAGODA x ± 34, z −219.5). */
export const TEMPLE = {
  bell: [PAGODA[0] + 34, -219.5], drum: [PAGODA[0] - 34, -219.5], hall: [PAGODA[0], MZ0 + 21], pagoda: [PAGODA[0], PAGODA[1]],
  rects: { main: [PAGODA[0] - 18, MZ0 + 10, PAGODA[0] + 18, MZ0 + 32], sutra: [MX0 + 8, -200, MX0 + 20, -170], guanyin: [MX1 - 20, -200, MX1 - 8, -170], gate: [PAGODA[0] - 7.4, MONASTERY[3] - 4.4, PAGODA[0] + 7.4, MONASTERY[3] + 4.4] },
};

// ── the trade houses (the houses' own work sounds) ─────────────────────────────────
/** [voice, gap in seconds [min, max], hours [from, to]] by trade: what is heard from a working shop. [inferred from the trade] */
const WORK = {
  iron: [['hammer', [12, 30], [7, 18]]],
  medicine: [['mortar', [18, 40], [7, 18]]],
  books: [['chisel', [14, 30], [8, 17.5]]],            // the block-cutters of the capital's printing shops
  food: [['kitchen', [10, 22], [5, 22]]],
  wine: [['pourWine', [30, 70], [9, 23]]],
  tea: [['teaClink', [12, 30], [5, 23]]],
  inn: [['teaTalk', [8, 18], [6, 22.5]]],
  cloth: [['scissors', [20, 50], [8, 18]]],
  pottery: [['wheel', [30, 60], [8, 17]]],
  butcher: [['kfChop', [16, 40], [6, 15]]],
  rice: [['sack', [26, 60], [6, 18]]],
  saddlery: [['drawer', [30, 70], [8, 17]]],
  lacquer: [['brushLacquer', [30, 70], [8, 17]]],
};
let SITES = null;
/** The houses with sounds: every second working shop within 230 m of the arrival, the bridge or the gate: { use, rect, at, id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const t = tradeOf(l);
    if (!t || !WORK[t] || l.seed % 2 || l.kind === 'tea' || hotDist((l.foot[0] + l.foot[2]) / 2, (l.foot[1] + l.foot[3]) / 2) > 230) continue;
    const [x0, z0, x1, z1] = l.foot;
    SITES.push({ use: t, rect: l.foot, at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'lot:' + l.seed, work: WORK[t] });
  }
  return SITES;
}

/** The wells in the yards of the houses (layout.js lots with a `well`, the ones town.js builds), within 200 m of the arrival, the bridge or the gate. */
export const WELLS = lots().filter((l) => l.well && hotDist(l.well[0], l.well[1]) < 200).map((l) => l.well);

/** The places far off that are heard from here: the palace's drums beyond the disc [inferred: the Imperial city lay west of the Bian, off the plan]. */
export const FAR = { tower: [-760, 40], hanshan: [-760, 40] };

// ── the river and the streets ────────────────────────────────────────────────────
const RIVER_RECT = [-(RADIUS - 26), RIVER.z0, RADIUS - 26, RIVER.z1];
const mid = (RIVER.z0 + RIVER.z1) / 2;
/** The nearest point of the Bian's water (the bank's foot) to (x, z), the distance and the index (one reach). */
export function canalSpot(x, z) { const p = nearIn(RIVER_RECT, x, z); return { p, d: Math.hypot(p[0] - x, p[1] - z), i: 0 }; }
/** A boat's track on the river: along the middle of the stream, in the lane chosen by rnd, a pass by the nearest point, starting `lead` m before it; null if the river is beyond `reach`. */
export function canalTrack(x, z, rnd, reach = 70, lead = 38) {
  const c = canalSpot(x, z);
  if (c.d > reach) return null;
  const lo = RIVER_RECT[0] + 6, hi = RIVER_RECT[2] - 6, near = Math.max(lo, Math.min(hi, x));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 14) return null;
  const zz = mid + dir * 5 * (0.4 + 0.5 * rnd());                 // keeping to the right: the lanes of the stream
  return { pts: [[a, zz], [b, zz]] };
}
/** A walker's track along the street (or lane) nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  const S = STREETS.concat(LANES);
  S.forEach((r, i) => { if (Math.min(r[2] - r[0], r[3] - r[1]) < 5) return; const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d) && Math.hypot(p[0], p[1]) < RADIUS - 20) best = { p, d, i }; });
  if (!best) return null;
  const r = S[best.i], horiz = r[2] - r[0] > r[3] - r[1], midl = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, midl + off], [b, midl + off]] } : { pts: [[midl + off, a], [midl + off, b]] };
}
/** The Rainbow Bridge, if within `reach` of (x, z): a walker's track over the span along the main street. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  const d = Math.hypot(BRIDGE.at[0] - x, BRIDGE.at[1] - z);
  if (d > reach) return null;
  const h = BRIDGE.span / 2 + 3, s = rnd() < 0.5 ? 1 : -1;
  return { pts: [[BRIDGE.at[0] + (rnd() - 0.5) * 3, BRIDGE.at[1] - s * h], [BRIDGE.at[0] + (rnd() - 0.5) * 3, BRIDGE.at[1] + s * h]], d };
}
const wet = (px, pz, m = 0) => pz > RIVER.z0 + m && pz < RIVER.z1 - m && Math.abs(px) < RADIUS - 30 && !(Math.abs(px) < BRIDGE.width / 2 + 1 && Math.abs(pz - mid) < BRIDGE.span / 2);
/** A point on the river's water within `reach` of (x, z) (a ring of tries; for the fish), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (Math.abs(z - mid) > reach + 30) return null;
  for (let k = 0; k < 14; k++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (wet(px, pz, 2)) return [px, pz]; }
  return null;
}
/** The river's bank near (x, z) (the stone's foot, for the lap): the edge nearest on a ray in a random direction, or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  if (Math.abs(z - mid) > reach + 30) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = wet(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const px = x + c * d, pz = z + s * d, w = wet(px, pz); if (w !== prev) return [px, pz]; prev = w; }
  }
  return null;
}

// ── where the planting makes its sound ───────────────────────────────────────────
const WILLOWS = (x, z) => { const dn = RIVER.z0 - z, ds = z - RIVER.z1; return Math.max(Math.abs(x) > STONE_BANK - 20 ? 1 - sm(1, 12, Math.min(Math.abs(dn), Math.abs(ds))) : 0, 0); };
/** 0…1: how wooded is (x, z): the monastery's groves of pagoda trees, the willows of the earth banks, the suburb's and the farmsteads' jujubes and mulberries. */
export function treeness(x, z) {
  let m = 0.1;
  if (inRect(MONASTERY, x, z)) m = Math.max(m, 0.6);
  m = Math.max(m, 0.7 * WILLOWS(x, z), 0.35 * sm(150, 300, Math.hypot(x - 262, z)) * (x > 262 ? 1 : 0));
  return m;
}
/** A tree to put a bird or a cicada in, near (x, z), by the woodedness, on land: null if none. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !wet(px, pz) && !inLot(px, pz, 0.5) && treeness(px, pz) > 0.25 + 0.5 * rnd()) return [px, pz];
  }
  return null;
}
/** No bamboo to speak of (the Yellow River plain: a clump now and then in a yard). */
export function bambooNear() { return 0.03; }
/** 0…1: broad leaves in wind: the monastery's trees, the river's willows, the rim's mulberries. */
export function leafNear(x, z) {
  const mon = inRect(MONASTERY, x, z) ? 0.8 : 1 - sm(0, 24, rectDist(MONASTERY, x, z));
  return Math.min(1, Math.max(0.1, 0.8 * mon, 0.9 * WILLOWS(x, z) * (1 - sm(0, 1, 0)), 0.35 * sm(200, 300, Math.hypot(x, z))));
}
/** No lotus (the dossier gives none). */
export function lotusNear() { return 0; }
/** 0…1: green round (x, z) for the insects: the monastery, the river's banks beyond the stone, the wheat fields at the rim. */
export function greenNear(x, z) {
  const edge = sm(230, 300, Math.hypot(x, z)) * 0.85, bank = 0.5 * (1 - sm(1, 18, canalSpot(x, z).d)) * (Math.abs(x) > STONE_BANK ? 1 : 0.4);
  return Math.max(treeness(x, z) * 0.85, edge, bank, 0.12);
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the streets, a third in the monastery's court (the temple fair), little in the halls, less toward the rim and in the fields. */
export function townNear(x, z) {
  if (inRect(MONASTERY, x, z)) return inRect([MX0 + 8, MZ0 + 6, MX1 - 8, -110], x, z) ? 0.4 : 0.25;
  return Math.max(0.08, (1 - 0.7 * sm(200, 330, Math.hypot(x, z - 76))) * (x > FIELDS ? 0.4 : 1));
}
const FIELDS = 262;
/** 0…1: wet ground (the frogs): the river's earth banks, the wheat fields' ditches at the rim. */
export function frogGround(x, z) {
  const bank = Math.abs(x) > STONE_BANK ? 0.7 * (1 - sm(0, 40, rectDist(RIVER_RECT, x, z))) : 0.2 * (1 - sm(0, 20, rectDist(RIVER_RECT, x, z)));
  return Math.max(bank, sm(240, 300, Math.hypot(x, z)) * 0.9);
}

// ── the rooms ────────────────────────────────────────────────────────────────────
/**
 * The room the listener is in: { use, at, upper, same } or null in the open. Uses: the monastery's halls (temple), a trade's (iron, medicine, books, food,
 * wine, tea, inn, cloth, pottery, butcher, rice, saddlery, lacquer, incense), house (a dwelling or a shop of no sound-making trade).
 */
export function roomAt(x, z, y = 0) {
  for (const [k, r] of Object.entries(TEMPLE.rects)) if (inRect(r, x, z)) return { use: 'temple', at: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], upper: false, same: 'temple:' + k };
  const l = lotAt(x, z);
  if (l && inRect(l.foot, x, z)) {
    const t = l.kind === 'tea' ? 'tea' : l.kind === 'wine' ? 'wine' : tradeOf(l);
    return { use: t && ROOMS[t] ? t : 'house', at: [(l.foot[0] + l.foot[2]) / 2, (l.foot[1] + l.foot[3]) / 2], upper: y > 2.4, same: 'lot:' + l.seed };
  }
  return null;
}
/** The room's own colour and small sounds (as Suzhou's ROOMS): `tone` [lowpass Hz, level], `roof` the rain's loudness from inside, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  iron: { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['drawer', 120]] },
  medicine: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 40]] },
  books: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 36]] },
  food: { tone: [500, 0.5], roof: 1.0, hush: 0.9, work: [['bowlClack', 14]] },
  wine: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['jarLid', 40]] },
  tea: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['teaClink', 12]] },
  inn: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 8]] },
  cloth: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 26]] },
  pottery: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  butcher: { tone: [380, 0.35], roof: 1.0, hush: 0.9, work: [['kfChop', 30]] },
  rice: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['sack', 30]] },
  saddlery: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 70]] },
  lacquer: { tone: [220, 0.15], roof: 1.0, hush: 0.6, work: [['brushLacquer', 30]] },
  incense: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 50]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  temple: { tone: [130, 0.3], roof: 0.6, hush: 0.45, work: [['kfBowl', 70]] },
};
/** The upper rooms (the inns', the wine houses', the shops' dwellings): close under the tiles, the rain loud. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40], ['teaClink', 50]] };

// ── the emitters in the open (the engine's placed sounds) ─────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const mid2 = (l) => [(l.foot[0] + l.foot[2]) / 2, (l.foot[1] + l.foot[3]) / 2];
const HALL = TEMPLE.rects.main;
/** The bell, the drum, the service; the wind bells; the camel bells at the gate; the donkeys; the trackers, the landing, the mast; the tea houses and the wine houses. */
export const EMITTERS = [
  // 晨钟暮鼓 [inferred]: the bell at the dawn, the drum and then the bell at dusk; windows shorter than the voice, so each sounds once ("after")
  E('kfTempleBell', TEMPLE.bell, 95, [10, 12], [4.7, 4.95], { after: true }),
  E('kfTempleDrum', TEMPLE.drum, 80, [10, 12], [17.9, 18.15], { after: true }), E('kfTempleBell', TEMPLE.bell, 95, [10, 12], [18.2, 18.45], { after: true }),
  // the service in the main hall after each
  E('kfService', TEMPLE.hall, 22, [10, 14], [5.2, 5.9], { inside: 'temple:main', after: true }), E('kfService', TEMPLE.hall, 22, [10, 14], [18.5, 19.2], { inside: 'temple:main', after: true }),
  // the Iron Pagoda's 104 wind bells
  E('kfWindBell', [PAGODA[0], PAGODA[1]], 38, [3, 8], [0, 24]),
  // the camels' bells on the gate road (the train that comes out of the gate), by day
  E('kfCamelBell', [WALL_X + 18, GATE.z], 24, [50, 110], [8, 17.5], { dry: true, after: true }),
  // the donkeys: the pack train in the fields, the two at the bridge-heads' stalls
  E('kfDonkey', [305, -80], 42, [40, 110], [6, 19]), E('kfDonkey', [-12, 99.5], 26, [50, 120], [6.5, 18]), E('kfDonkey', [12.5, 52.5], 26, [55, 125], [6.5, 18]),
  // the trackers on the towpath east of the bridge (scroll: the boat hauled to the bridge), the grain landing on the south bank, the boat lowering its mast before the bridge
  E('kfHaul', [117, 57], 30, [50, 120], [7, 17], { dry: true, after: true }),
  E('kfLanding', [58, 96], 24, [26, 60], [6, 18], { dry: true, after: true }),
  E('kfMast', [-17.5, 75], 30, [70, 150], [8, 17.5], { after: true }),
  // the tax office at the gate: the abacus and the register
  E('abacus', [-282, -84], 9, [24, 50], [7, 18], { dry: true }),
  // the tea houses' story-tellers (by day and into the evening; the houses opened at the fifth watch and traded till late: Dongjing meng hua lu)
  ...teaHouses().map((l) => E('kfStory', mid2(l), 14, [45, 100], [8, 23], { inside: 'lot:' + l.seed, after: true })),
  // the wine houses: the singing girls with their clapper boards, from the afternoon into the night
  ...wineShops().map((l) => E('kfClapSong', mid2(l), 15, [30, 75], [11, 24.2], { inside: 'lot:' + l.seed, after: true })),
  // a street singer's pipa on the bridge's approach at dusk (a plucked string stands in: the qin of the engine's voices is too slow; the xiao of the flutes)
  E('xiao', [4, 38], 30, [70, 160], [17, 21], { rainMax: 0.4, after: true }),
];

/** The passing sounds of this place (voices.js `placed`: `TRACKS`): the dawn caller, the pack trains and carts by day, the night market's calls. */
export const TRACKS = [
  { key: 'plate', voice: 'kfIronPlate', speed: 1.0, r50: 14, gap: [22, 46], ok: (hour, rain) => hour >= 4.3 && hour < 5.9 && rain < 0.7, get: (x, z, r) => streetTrack(x, z, r, 90, 34) },
  { key: 'pack', voice: 'kfPackTrain', speed: 1.1, r50: 12, gap: [60, 140], ok: (hour, rain) => hour >= 5.5 && hour < 18 && rain < 0.4, get: (x, z, r) => streetTrack(x, z, r, 100, 40) },
  { key: 'cart', voice: 'kfCart', speed: 0.9, r50: 14, gap: [90, 200], ok: (hour, rain) => hour >= 6 && hour < 18 && rain < 0.4, get: (x, z, r) => streetTrack(x, z, r, 100, 40) },
  { key: 'night', voice: 'kfNightCall', speed: 1.0, r50: 12, gap: [30, 70], ok: (hour, rain) => (hour >= 18.5 || hour < 3.3) && rain < 0.5, get: (x, z, r) => streetTrack(x, z, r, 80, 30) },
];
