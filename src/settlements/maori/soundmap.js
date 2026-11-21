// Where the pā's sounds are (docs/settlements/maori.md §4j): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the karanga and waiata of the welcome on the marae ātea, the adzes at the canoe, the beater on fern root and the strippers of flax at the work places,
// the hearths of the houses, the hot pools and the steam vents of the ground by the lake, the lake on its shingle, the paddles of the fishing canoes, flute and
// trumpet, tūī and korimako by day, ruru and kiwi by night, the houses one can be inside. Pure data and functions of layout.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-maori.js). Coordinates: metres, +x east,
// +z south, the settlement's frame. No bell, no rooster, no horse, no cat, no sparrow: nothing before the Europeans brought them. What the scheduler asks of a map
// that the pā has not (canals, ponds, bridges, street walkers, wells) is answered with nothing.
import '../../engine/voices-maori.js';
import { RADIUS, HILL, LAKE, VENTS, shoreZ, village, inLake, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the summit). */
export const HOME = [0, 33];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const [HX, HZ] = HILL.c;
const TRADES = ['weaver', 'fisher', 'carver', 'cook', 'plain'];       // as town.js gives them to the houses (the same formula)

/** The work heard in each trade's house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade's tools, docs §4c]. */
const WORK = {
  weaver: [['maoRaranga', [14, 34], [7, 17]], ['maoHearth', [30, 70], [5, 23]]],
  fisher: [['maoHearth', [24, 60], [5, 23]], ['clothRustle', [50, 110], [6, 21]]],
  carver: [['maoToki', [18, 40], [7, 17]], ['maoHearth', [40, 90], [5, 23]]],
  cook: [['maoPatu', [30, 70], [5.5, 11]], ['kitchen', [30, 70], [5, 19]], ['maoHearth', [30, 70], [5, 23]]],
  plain: [['maoHearth', [24, 60], [5, 23]], ['clothRustle', [50, 110], [6, 21]]],
  hall: [['maoHearth', [20, 50], [5, 24]], ['maoKoauau', [140, 300], [17, 22]]],
};
let SITES = null;
/** The houses with sounds: { use, c, yaw, w, l, at: [x, z] (the hearth), id: 'room:N', work, y (the floor) } — the ordinary houses of the town's furnished ring (within 250 m) and the chief's. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const v = village();
  v.houses.forEach((h, i) => {
    const hall = i === 0;
    if (!hall && ((h.rank || 0) > 1 || h.w < 3 || Math.hypot(h.c[0], h.c[1]) > 250)) return;
    const use = hall ? 'hall' : TRADES[(i * 7 + (h.rank || 0) * 3) % 5], ca = Math.cos(h.yaw), sa = Math.sin(h.yaw);
    const zf = -h.l / 2 + 1.6, zm = hall ? zf + 0.7 : (zf + 0.3 + h.l / 2 - 0.35) / 2;
    SITES.push({ use, c: h.c, yaw: h.yaw, w: h.w, l: h.l, zf, at: [h.c[0] + zm * sa, h.c[1] + zm * ca], id: `room:${i}`, work: WORK[use], y: h.y ?? 0 });
  });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const inside = (s, x, z) => {
  const dx = x - s.c[0], dz = z - s.c[1], ca = Math.cos(s.yaw), sa = Math.sin(s.yaw), u = dx * ca - dz * sa, q = dx * sa + dz * ca;
  return Math.abs(u) < s.w / 2 - 0.1 && q > s.zf && q < s.l / 2 - 0.1;
};
const lotAt = (x, z, y) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) { const r = Math.hypot(s.w, s.l) / 2; for (let i = Math.floor((s.c[0] - r) / 20); i <= Math.floor((s.c[0] + r) / 20); i++) for (let j = Math.floor((s.c[1] - r) / 20); j <= Math.floor((s.c[1] + r) / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inside(s, x, z) && y > s.y - 0.6 && y < s.y + 2.8);
};
/** The house the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z, y);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What each kind of house sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a thick thatch: soft), `hush` how much of the outdoors comes through (walls of reed: much), `work` [voice, gap s]. */
const R0 = { tone: [420, 0.3], roof: 0.5, hush: 0.55, work: [['maoHearth', 30]] };
export const ROOMS_SOUND = {
  weaver: { ...R0, work: [['maoRaranga', 16]] },
  fisher: { ...R0 },
  carver: { ...R0, work: [['maoToki', 22]] },
  cook: { ...R0, work: [['maoPatu', 30]] },
  plain: { ...R0 },
  hall: { ...R0, tone: [360, 0.35], roof: 0.45, hush: 0.7, work: [['maoHearth', 24]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER_SOUND = { ...R0 };
export { UPPER_SOUND as UPPER };

// ── the planting, the town ──────────────────────────────────────────────────
const shoreDist = (x, z) => Math.abs(z - shoreZ(x));
/** 0…1: how much green round (x, z): the shore's flax and cabbage trees, the gardens, the bush behind the hill; the bare summit little. */
export function greenNear(x, z) {
  const shore = 1 - sm(0, 50, shoreDist(x, z)), garden = Math.abs(x) < 120 && z > 140 ? 0.7 : 0, bush = sm(HILL.ditch, HILL.ditch + 30, Math.hypot(x - HX, z - HZ)) * 0.5;
  return Math.max(shore * 0.85, garden, bush, 0.2);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z), or null: the cabbage trees along the shore and the gardens' way, the tree ferns behind the hill. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !inLake(px, pz) && (shoreDist(px, pz) < 30 || Math.abs(px) < 14 && pz > 150)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's talk reaches (x, z): the summit and its terraces most, the compounds some, little beyond. */
export function townNear(x, z) {
  const r = Math.hypot(x - HX, z - HZ);
  if (r < HILL.tihi) return 1;
  if (r < HILL.foot) return 0.8;
  return Math.max(0.08, 0.5 * (1 - sm(HILL.foot, 260, r)));
}
/** A place on the lake's shingle near (x, z) where small waves slap: the beach's edge. */
export function shoreSpot(x, z, rnd) {
  for (let k = 0; k < 10; k++) {
    const px = x + (rnd() - 0.5) * 60, pz = shoreZ(px) - 0.5;
    if (Math.hypot(px - x, pz - z) < 40 && Math.hypot(px, pz) < RADIUS - 40) return [px, pz];
  }
  return null;
}
// what the pā has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const V = village(), top = HILL.top;
const hxm = V.houses[0].c[0];
/** The canoe being hollowed: the first clear place along the shore, as town.js finds it (its builders swing their adzes there). */
function canoeYard() {
  const taken = [...V.houses, ...V.pataka, ...V.pits].map((o) => o.c), xs = [];
  for (let x = -230; x <= 230; x += 6) xs.push(x);
  xs.sort((p, q) => Math.abs(p + 160) - Math.abs(q + 160));
  for (const x of xs) {
    const z = shoreZ(x) + 13;
    if (Math.hypot(x, z) > RADIUS - 50 || !taken.every(([a, b]) => Math.hypot(a - x, b - z) > 9) || !V.waka.every((w) => Math.hypot(w.c[0] - x, w.c[1] - z) > w.l / 2 + 3)) continue;
    return [x, z];
  }
  return [-160, shoreZ(-160) + 13];
}
export const CANOE_YARD = canoeYard();
const FISHERS = [[-70, 26], [95, 40], [-190, 34]].map(([x, dz]) => [x, shoreZ(x) - dz]);
const treeAt = (a, r) => [HX + Math.cos(a) * r, HZ + Math.sin(a) * r];
export const EMITTERS = [
  // the welcome on the marae ātea before the chief's house: the caller of the hosts and the answering call, the waiata after the speeches, the trumpet that announces visitors from the gate
  E('maoKaranga', [hxm + 1, 14], 22, [70, 160], [7, 18], { dry: true, after: true }),
  E('maoWaiata', [hxm + 4, 14], 24, [120, 260], [8, 17.5], { dry: true, after: true }),
  E('maoPukaea', [0, HZ + HILL.tihi - 1], 70, [220, 460], [6.5, 17.5], { rainMax: 0.5, after: true }),
  // the summit's work: the weavers stripping and plaiting flax on the west, the carver's adze at his post on the east, the cooking place's beater and pots, the children at their game
  ...[[HX - 16, HZ + 9], [HX - 19, HZ + 3], [HX - 13, HZ + 14]].map((p) => E('maoRaranga', p, 11, [25, 60], [7, 17], { dry: true })),
  E('maoToki', [HX + 17, HZ - 2], 16, [20, 46], [7, 17], { dry: true }),
  E('maoPatu', [HX + 13, HZ + 10], 12, [40, 90], [5.5, 11], { dry: true }),
  E('kitchen', [HX + 13, HZ + 10], 10, [30, 70], [6, 19], { dry: true }),
  E('maoChildren', [HX + 5.5, HZ + 14], 14, [25, 60], [8, 17], { dry: true }),
  // the whānau yards: the cooking place at each yard's middle (the beater in the morning, the pots through the day)
  ...V.compounds.filter((c) => Math.hypot(c.c[0], c.c[1]) < RADIUS - 56).flatMap((c, k) => [E('kitchen', c.c, 10, [30, 70], [6, 19], { dry: true }), ...(k % 2 ? [] : [E('maoPatu', c.c, 12, [50, 110], [5.5, 11], { dry: true })])]),
  // the canoe being hollowed, on the shore: stone adzes, two or three men
  E('maoToki', CANOE_YARD, 22, [16, 36], [7, 17], { dry: true }),
  // the hot ground: steam always, the pools simmering and bursting their bubbles
  ...VENTS.filter(([x, z]) => !inLake(x, z)).flatMap(([x, z]) => [E('maoSteam', [x, z], 18, [6, 12], [0, 24], { rainMax: 1 }), E('maoPool', [x + 1, z], 14, [5, 11], [0, 24], { rainMax: 1 })]),
  // the lake on its shingle, along the shore
  ...[-200, -140, -80, -20, 40, 100, 160, 220].map((x) => E('maoLake', [x, shoreZ(x) - 1], 26, [7, 13], [0, 24], { rainMax: 1 })),
  // the fishing canoes out on the water: paddles, through the evening to the torch-fishing of the night
  ...FISHERS.map((p) => E('maoPaddle', p, 30, [40, 100], [6, 23.5], { rainMax: 0.6 })),
  // the evening on the terraces: a flute at a door, the low flute, a song on the summit after the day's work
  E('maoKoauau', treeAt(2.0, 40), 34, [120, 280], [17.5, 22], { rainMax: 0.3, after: true }),
  E('maoPutorino', treeAt(0.6, 66), 40, [160, 320], [17, 22], { rainMax: 0.3, after: true }),
  E('maoWaiata', [hxm + 2, 18], 34, [150, 300], [17.5, 21.5], { rainMax: 0.3, after: true }),
  // the birds by day in the cabbage trees, tree ferns and bush: tūī and korimako in the morning and again at dusk
  ...[treeAt(-0.9, 20.5), treeAt(0.9, 20.5), treeAt(3.0, 20.5), [-9.6, 190], [9.9, 215], [-9.8, 252]].map((p, k) => E(k % 2 ? 'maoKorimako' : 'maoTui', p, 22, [14, 40], [5, 10], { rainMax: 0.5 })),
  ...[treeAt(2.2, 20.5), treeAt(4.1, 20.5), [9.8, 190], [-9.7, 215]].map((p) => E('maoTui', p, 22, [20, 55], [16, 19.5], { rainMax: 0.5 })),
  // the night: the ruru in the bush behind the hill, the kiwi far off
  E('maoRuru', [-60, -60], 60, [40, 100], [20.5, 4.5], { rainMax: 0.5 }), E('maoRuru', [70, 170], 60, [60, 140], [21, 4], { rainMax: 0.5 }),
  E('maoKiwi', [250, -40], 90, [90, 240], [21, 4.5], { rainMax: 0.8 }), E('maoKiwi', [-240, 120], 90, [120, 300], [21.5, 4], { rainMax: 0.8 }),
];
void LAKE; void inRect; void top;
