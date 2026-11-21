// Where Ayutthaya's sounds are (docs/settlements/ayutthaya.md §13.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the wat's gong and drum, the monks' chant in the royal wihan and the ordination hall, the piphat in the court of the wat and before the
// palace, the floating market's cries and paddles, the shopkeepers' small noises along the bank road, the kitchens and rice mortars of the stilt houses, the
// canals' water and their boats, the king's elephants, the tokay geckos in the thatch and the frogs of the flooded plain. Pure data and functions of layout.js
// (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-ayutthaya.js).
// Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout: no source for the sounds of 17th-century Ayutthaya was read.]
import '../../engine/voices-ayutthaya.js';
import { RADIUS, CANALS, BRIDGES, MARKET, WAT, WIHAN, UBOSOT, PALACE, PLATFORM, ISLAND, lots, paths, inRect, inLot, wet } from './layout.js';
import { ARRIVAL } from './walk.js';

/** Where the audio puts the listener when the engine gives none (the arrival inside the wat's wall). */
export const HOME = ARRIVAL;

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The work heard from each kind of open shop on the bank road: [voice, gap [min, max] s, hours [from, to]]. */
const SHOP_WORK = {
  offerings: [['coin', [30, 70], [6, 17.5]], ['jarLid', [60, 120], [6, 17.5]]],
  flowers: [['pour', [30, 70], [5.5, 17]], ['clothRustle', [40, 90], [6, 17.5]]],
  rice: [['sack', [24, 60], [6, 17]], ['pour', [50, 110], [6, 17]]],
  pots: [['jarLid', [20, 50], [6.5, 17.5]], ['clay', [40, 90], [6.5, 17.5]]],
  betel: [['mortar', [18, 40], [6, 18]], ['coin', [60, 120], [6.5, 17.5]]],
  cloth: [['clothRustle', [24, 60], [7, 17.5]], ['scissors', [60, 130], [7, 17]]],
  fish: [['pour', [20, 50], [5.5, 14]], ['sack', [50, 110], [5.5, 14]]],
  chinese: [['abacus', [18, 44], [7, 18]], ['drawer', [30, 70], [7, 18]], ['coin', [50, 110], [7, 18]]],
};
/** The kitchen, the rice mortar and (by their hash) the loom of a stilt house, and the gecko in its thatch at night. */
const HOUSE_WORK = [['kitchen', [16, 34], [4.5, 20]], ['mortar', [50, 120], [5, 8.5]], ['ayTokay', [50, 130], [19.5, 4.5]]];
const LOOM_WORK = ['loom', [20, 44], [7, 17]];
const NEAR_SITES = 170;                                     // (m from the arrival: the houses and shops beyond have no sounds of their own)

let SITES = null;
/** The shops and houses near the arrival with sounds: { use, rect, at, id, work, y (the floor), open }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const at = mid(l.rect);
    if (Math.hypot(at[0] - HOME[0], at[1] - HOME[1]) > NEAR_SITES) continue;
    if (l.kind === 'shop') SITES.push({ use: 'shop', rect: l.rect, at, id: 'lot:' + l.seed, work: SHOP_WORK[l.trade] || [['coin', [30, 70], [7, 17.5]]], y: 0.3, open: true });
    else SITES.push({ use: 'house', rect: l.rect, at, id: 'lot:' + l.seed, work: hash(at[0], at[1], 1) < 0.25 ? [...HOUSE_WORK, LOOM_WORK] : HOUSE_WORK, y: 2.0 });
  }
  return SITES;
}
/** The wells: none (the water is drawn from the canal at the landings). */
export const WELLS = [];
export const FAR = {};
/** The wat: the gong tower is the bell tower; the halls' places. */
export const TEMPLE = { gong: mid([108, -143, 116, -135]), wihan: mid(WIHAN), ubosot: mid(UBOSOT), platform: mid(PLATFORM.cloister) };

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['room:wihan', 'hall', [WIHAN[0] + 4.2, WIHAN[1] + 3.8, WIHAN[2] - 5.6, WIHAN[3] - 3.8], 1.2],
  ['room:ubosot', 'hall', [UBOSOT[0] + 3.4, UBOSOT[1] + 3.2, UBOSOT[2] - 4.2, UBOSOT[3] - 3.2], 1.2],
  ['room:throne', 'hall', [PALACE.halls[1][0] + 4.2, PALACE.halls[1][1] + 3.8, PALACE.halls[1][2] - 5, PALACE.halls[1][3] - 3.8], 1.2],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open (under a stilt house, on the lane, in a court). */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s && y > s.y - 0.4) return { use: s.use, at: s.at, upper: s.use === 'shop' && y > 3.4, same: s.id };
  for (const [id, use, r, fy] of ROOM_RECTS) if (inRect(r, x, z) && y > fy - 0.4) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch and tile are soft), `hush` how much of the outdoors comes through (a house of woven walls on posts lets most through), `work` [voice, gap s]. */
export const ROOMS = {
  house: { tone: [380, 0.3], roof: 0.7, hush: 0.55, work: [['kitchen', 36], ['clothRustle', 80]] },
  shop: { tone: [340, 0.25], roof: 0.9, hush: 0.7, work: [['coin', 40], ['jarLid', 60]] },
  hall: { tone: [170, 0.3], roof: 0.45, hush: 0.35, work: [['ayChant', 55]] },
};
export const UPPER = { tone: [300, 0.18], roof: 0.9, hush: 0.6, work: [['clothRustle', 60]] };

// ── the planting, the town ──────────────────────────────────────────────────
const WATERS = [...CANALS.map((c) => c.rect), [-330, -330, -235, 330], [-330, 225, 330, 330]];
const waterDist = (x, z) => Math.min(...WATERS.map((r) => rectDist(r, x, z)));
/** 0…1: how much green round (x, z) for the insects: palms and bamboo among the houses, the reeds of the banks, the banyans of the wat's walls; the rice beyond the island. */
export function greenNear(x, z) {
  if (inRect(PLATFORM.cloister, x, z, -2)) return 0.15;
  return Math.max(0.4, 0.9 * (1 - sm(0, 30, waterDist(x, z))), inRect(ISLAND, x, z, 10) ? 0 : 0.8);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird or an insect in, near (x, z): the palms and fruit trees among the houses and by the banks, the banyans at the wat's walls; null on the water or the courts. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 16; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > RADIUS - 8 || wet(px, pz) < 3 || inLot(px, pz, 0.5)) continue;
    if (inRect(PLATFORM.cloister, px, pz, 4) || inRect(WIHAN, px, pz, 2) || inRect(UBOSOT, px, pz, 2)) continue;
    return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it at the floating market, much on the bank road before the shops, little in the wat and the palace. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 14)) return 1;
  if (inRect(WAT.wall, x, z)) return 0.18;
  if (inRect(PALACE.wall, x, z)) return 0.2;
  if (Math.abs(z + 70.5) < 14 && x > -80 && x < 130) return 0.75;
  return Math.max(0.2, 0.55 * (1 - 0.6 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}

// ── the water ────────────────────────────────────────────────────────────────
const LANES = [...CANALS.map((c) => c.rect), [-280, -250, -262, 225]];
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
/** The nearest point of the canals' (and the river's) water to (x, z): { p, d }, the lap at the brick wall's foot. */
export function canalSpot(x, z) {
  let best = null;
  for (const r of WATERS) { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (!best || d < best.d) best = { p, d }; }
  return best;
}
/** A paddled boat's track along a canal or the river: the centre line of the reach nearest to (x, z), from a to b (starting `lead` metres before the nearest point), or null. */
export function canalTrack(x, z, rnd, reach = 70, lead = 38) {
  let best = null;
  LANES.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = LANES[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 6, hi = (horiz ? r[2] : r[3]) - 6, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 14) return null;
  return horiz ? { pts: [[a, m], [b, m]] } : { pts: [[m, a], [m, b]] };
}
/** A walker's track along the bank road or a canal's bank nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  paths().forEach((q, i) => { const p = nearIn(q.r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = paths()[best.i].r, horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.6;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
/** The bridge nearest to (x, z) within `reach`: a walker's track over its span. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  let best = null;
  for (const b of BRIDGES) { const d = Math.hypot(b.c[0] - x, b.c[1] - z); if (d < reach && (!best || d < best.d)) best = { b, d }; }
  if (!best) return null;
  const { c, dir } = best.b, h = 11, s = rnd() < 0.5 ? 1 : -1;
  return dir === 'z' ? { pts: [[c[0] + (rnd() - 0.5), c[1] - s * h], [c[0] + (rnd() - 0.5), c[1] + s * h]], d: best.d } : { pts: [[c[0] - s * h, c[1] + (rnd() - 0.5)], [c[0] + s * h, c[1] + (rnd() - 0.5)]], d: best.d };
}
/** A point on a canal's or the river's water within `reach` (a fish rises by day, a frog sings by night), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  const c = canalSpot(x, z);
  return c && c.d < reach ? [c.p[0] + (rnd() - 0.5) * 4, c.p[1] + (rnd() - 0.5) * 4] : null;
}
export function shoreSpot(x, z, rnd, reach = 22) {
  const c = canalSpot(x, z);
  return c && c.d < reach ? [c.p[0] + (rnd() - 0.5) * 6, c.p[1] + (rnd() - 0.5) * 6] : null;
}
/** 0…1: how much of the bamboo clumps stand round (x, z): among the houses on the island. */
export function bambooNear(x, z) { return inRect(ISLAND, x, z) && !inRect(WAT.wall, x, z) ? 0.4 : 0; }
export const lotusNear = () => 0;
/** 0…1: how marshy the ground is (the frogs at night): by the canals and the river, and over the flooded rice beyond the island. */
export function frogGround(x, z) {
  const d = waterDist(x, z);
  return Math.max(1 - sm(0, 30, d), inRect(ISLAND, x, z, 10) ? 0 : 0.8) * (Math.hypot(x, z) < RADIUS ? 1 : 0);
}

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const mk = mid(MARKET), gongAt = TEMPLE.gong, [gx] = WAT.gate;
export const EMITTERS = [
  // the wat's gong and drum from the bell tower: before dawn (the monks rise), at the hour before noon (the last meal of the monks), at dusk; the drum quickens before each
  E('ayGong', gongAt, 120, [150, 280], [4.2, 5.4], { rainMax: 0.8 }), E('ayDrum', gongAt, 100, [160, 300], [4.2, 5.4], { rainMax: 0.8 }),
  E('ayGong', gongAt, 120, [200, 360], [10.5, 11.8], { rainMax: 0.8 }), E('ayGong', gongAt, 120, [150, 280], [17.4, 18.6], { rainMax: 0.8 }), E('ayDrum', gongAt, 100, [180, 320], [17.4, 18.6], { rainMax: 0.8 }),
  // the monks' chant in the royal wihan at dawn and at dusk, and in the ordination hall by day; heard through the wihan's open porches
  E('ayChant', TEMPLE.wihan, 28, [40, 90], [4.6, 6.4], { rainMax: 0.9, after: true }), E('ayChant', TEMPLE.wihan, 28, [50, 110], [17.6, 19.2], { rainMax: 0.9, after: true }),
  E('ayChant', TEMPLE.ubosot, 24, [80, 170], [8, 10.5], { rainMax: 0.9, after: true }),
  // the piphat: before the royal wihan on the days of merit and in the court of the palace by the throne hall
  E('ayPiphat', [WIHAN[0] - 6, mid(WIHAN)[1] + 6], 34, [100, 220], [8.5, 17], { rainMax: 0.3, after: true }),
  E('ayPiphat', [PALACE.wall[2] - 14, -140], 36, [120, 260], [9, 16.5], { rainMax: 0.3, after: true }),
  // the floating market: the women's cries over the water and the paddles among the boats, by day, the busiest before the heat
  ...[0.12, 0.3, 0.5, 0.7, 0.88].map((t, i) => E('ayCry', [mk[0] + (hash(i, 1) - 0.5) * 24, MARKET[1] + (MARKET[3] - MARKET[1]) * t], 18, [16 + i * 3, 46 + i * 6], [5.5, 11.5], { rainMax: 0.5 })),
  ...[0.2, 0.45, 0.65, 0.85].map((t, i) => E('ayPaddle', [mk[0] + (hash(i, 2) - 0.5) * 20, MARKET[1] + (MARKET[3] - MARKET[1]) * t], 14, [24 + i * 4, 60 + i * 6], [5.5, 17], { rainMax: 0.6 })),
  // the king's elephants at the palace gate's south side
  E('ayElephant', [-84, -116], 60, [140, 320], [7, 17], { rainMax: 0.5 }),
  // the geckos in the thatch of the stilt houses near the arrival, at night
  ...lots().filter((l) => l.kind !== 'shop' && Math.hypot(mid(l.rect)[0] - HOME[0], mid(l.rect)[1] - HOME[1]) < 110).slice(0, 8).map((l, i) => E('ayTokay', mid(l.rect), 10, [50 + i * 6, 130 + i * 9], [19.5, 4.5], { rainMax: 0.5 })),
];
void gx;
