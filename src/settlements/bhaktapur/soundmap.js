// Where Bhaktapur's sounds are (docs/settlements/bhaktapur.md §17): the places of the emitters and the geometry the audio engine needs
// (soundscape.js's `LIFE.map`, the interface of Suzhou's and Agra's maps): the spouts, the Nyatapola's wind bells, the puja of the Bhairabnath,
// the potters' wheels and kilns, the stalls, the pati's bhajan, the trades in the open houses, the lanes' dogs and the jackals of the fields, the rooms.
// Pure data and functions of layout.js and plan.js (no three.js). Coordinates: metres, +x east, +z south. [inferred throughout.]

import { RADIUS, STREETS, NYA, BHA, SHI, PATI, DHARA, CHAITYA, HOUSE, TREES, STALLS, lots, inRect } from './layout.js';
import { POT_WHEELS, POT_KILNS } from './plan.js';
import './voices.js';

/** Where the audio puts the listener when the engine gives none: the arrival. */
export const HOME = [19, 21];
export const FAR = {};
export const WELLS = [];                                       // no bucket wells: the town draws water at its spouts
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The Bhairabnath's sanctum (the ground tier hollowed, plan.js's room 'bhairabnath'). */
const BHAIRAB_ROOM = [BHA.c[0] - 2.6, BHA.c[1] - 2.6, BHA.c[0] + 2.6, BHA.c[1] + 2.6];

// ── the trades of the open houses ─────────────────────────────────────────────
/** The work heard from a house of each trade: [voice, gap in seconds [min, max], hours [from, to]]. */
export const WORK = {
  curd: [['bhkCurd', [9, 20], [6, 19]]],
  cloth: [['scissors', [20, 50], [8, 18]]],
  brass: [['hammer', [12, 28], [8, 17.5]]],
  carver: [['chisel', [10, 24], [8, 17.5]]],
  grain: [['bhkGrain', [14, 32], [7, 18]]],
  pots: [['wheel', [14, 30], [7.5, 17]]],
  weaver: [['loom', [10, 24], [6.5, 18]]],
  mill: [['bhkDhiki', [14, 30], [5.5, 10]], ['bhkQuern', [20, 44], [6, 18]]],
  store: [['broom', [30, 70], [6, 18]]],
  home: [['kitchen', [12, 28], [5.5, 20.5]]],
};
let SITES = null;
/** The open houses with sounds, the nearest 70 within 125 m: { use, rect, at, id, work }. */
export function sites() {
  if (SITES) return SITES;
  const out = [];
  for (const l of lots()) {
    if (!l.open || l.use) continue;
    const at = mid(l.rect);
    if (Math.hypot(at[0], at[1]) > 125) continue;
    out.push({ use: l.trade || 'home', rect: l.rect, at, id: 'h:' + Math.round(l.rect[0]) + ':' + Math.round(l.rect[1]), work: WORK[l.trade] || WORK.home, d: Math.hypot(at[0] - HOME[0], at[1] - HOME[1]) });
  }
  out.sort((a, b) => a.d - b.d);
  return (SITES = out.slice(0, 70));
}

// ── no water, no boats, no bridges ────────────────────────────────────────────
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const shoreSpot = () => null;
export const pondSpot = () => null;
/** The engine asks for Suzhou's sedan chair, vendor and watchman here: Bhaktapur has none of them (its own are TRACKS). */
export const streetTrack = () => null;

// ── the lanes ─────────────────────────────────────────────────────────────────
/** A walker's track along the nearest lane within `reach`, passing the nearest point. */
export function streetPath(x, z, rnd, reach, lead) {
  let best = null;
  STREETS.forEach((r, i) => {
    const px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z);
    if (d < reach && (!best || d < best.d)) best = { d, i };
  });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = Math.min((horiz ? r[2] : r[3]) - 2, RADIUS - 30), near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
export const TRACKS = [
  // a guthi's dhimay band in the lanes, on a morning and an evening [inferred: the festivals' drums, here as a procession now and then]
  { key: 'bhkBand', voice: 'bhkDhimay', speed: 1.3, r50: 24, gap: [70, 160], ok: (h, r) => ((h >= 6 && h < 9) || (h >= 16.5 && h < 19)) && r < 0.4, get: (x, z, rnd) => streetPath(x, z, rnd, 110, 55) },
  { key: 'bhkHawk', voice: 'bhkCry', speed: 1.0, r50: 11, gap: [26, 60], ok: day(6, 18.5), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 30) },
  { key: 'bhkPorter', voice: 'bhkPorter', speed: 1.1, r50: 10, gap: [40, 90], ok: day(5.5, 18), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 30) },
  { key: 'bhkWalk', voice: 'bhkWalker', speed: 0.9, r50: 12, gap: [45, 90], ok: (h, r) => (h >= 19.5 || h < 4.5) && r < 0.5, get: (x, z, rnd) => streetPath(x, z, rnd, 90, 34) },
];

// ── the planting ──────────────────────────────────────────────────────────────
let TREEPTS = null;
/** The pipals of the square and of the courts: a spot within `reach` of (x, z), or null (the cicadas and the day birds sit in them). */
export function treeSpot(x, z, rnd, reach = 36) {
  TREEPTS ||= [...TREES, ...lots().filter((l) => l.use === 'tree').map((l) => mid(l.rect))];
  const near = TREEPTS.filter((p) => Math.hypot(p[0] - x, p[1] - z) < reach);
  return near.length ? near[Math.floor(rnd() * near.length)] : null;
}
export const bambooNear = (x, z) => (Math.hypot(x, z) < 150 ? 0.08 : 0);
export const lotusNear = () => 0;
export const leafNear = (x, z) => Math.min(1, 0.2 + 0.8 * sm(100, 175, Math.hypot(x, z)));
export const greenNear = (x, z) => Math.min(1, 0.1 + 0.8 * sm(90, 170, Math.hypot(x, z)));
/** 0..1: how much of the town's hubbub reaches (x, z): the squares and the lanes, little at the rim. */
export function townNear(x, z) {
  const r = Math.hypot(x, z);
  return Math.max(0.1, 1 - 0.85 * sm(110, RADIUS, r));
}
/** The frogs' ground: the rice fields beyond the town (the ground of the terraces, from the houses' edge out). */
export const frogGround = (x, z) => 0.6 * sm(150, 175, Math.hypot(x, z));

// ── the rooms ─────────────────────────────────────────────────────────────────
/** The room the listener is in: { use, at, upper, same } or null. */
export function roomAt(x, z, y = 0) {
  const upper = y > 2.4;
  if (inRect(BHAIRAB_ROOM, x, z) && y > 2.0 && y < 5.2) return { use: 'sanctum', at: mid(BHAIRAB_ROOM), upper: false, same: 'sanctum' };
  if (inRect(HOUSE.rect, x, z)) return { use: 'home', at: mid(HOUSE.rect), upper, same: 'h:house' };
  for (const l of lots()) if (l.open && inRect(l.rect, x, z)) return { use: l.trade || 'home', at: mid(l.rect), upper, same: 'h:' + Math.round(l.rect[0]) + ':' + Math.round(l.rect[1]) };
  return null;
}
const ROOM = (tone, hush, work = []) => ({ tone, roof: 1.0, hush, work });
export const ROOMS = {
  sanctum: { tone: [220, 0.3], roof: 0.5, hush: 0.6, work: [['bhkBell', 60]] },
  home: ROOM([300, 0.25], 0.8, [['kitchen', 40]]),
  curd: ROOM([360, 0.3], 0.85, [['bhkCurd', 14]]),
  cloth: ROOM([300, 0.25], 0.8, [['scissors', 40]]),
  brass: ROOM([480, 0.4], 0.9, [['hammer', 24]]),
  carver: ROOM([420, 0.35], 0.85, [['chisel', 20]]),
  grain: ROOM([320, 0.3], 0.8, [['bhkGrain', 26]]),
  pots: ROOM([420, 0.35], 0.85, [['bhkPots', 22]]),
  weaver: ROOM([340, 0.3], 0.8, [['loom', 18]]),
  mill: ROOM([360, 0.3], 0.85, [['bhkDhiki', 24], ['bhkQuern', 32]]),
  store: ROOM([280, 0.2], 0.75, [['broom', 60]]),
};
export const UPPER = { tone: [230, 0.15], roof: 1.3, hush: 0.6, work: [['broom', 60]] };

// ── the emitters in the open ──────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const courts = (use) => lots().filter((l) => l.use === use).map((l) => mid(l.rect));
export const EMITTERS = [
  // the spouts: the square's and the courts'
  ...[DHARA.c, ...courts('dhara')].map((p) => E('bhkSpout', p, 5, [9, 13], [4.5, 21.5])),
  // the wind bells of the Nyatapola (529) and of the Bhairabnath, all day and night; the more the wind blows
  E('bhkWindBells', [NYA.c[0], NYA.c[1]], 24, [6, 11], [0, 24]),
  E('bhkWindBells', [BHA.c[0], BHA.c[1]], 16, [9, 14], [0, 24], { lv: 0.7 }),
  // the Bhairabnath's puja at dawn, noon and dusk
  E('bhkPuja', [BHA.c[0] - 5, BHA.c[1]], 30, [60, 110], [5, 6.4], { dry: true }),
  E('bhkPuja', [BHA.c[0] - 5, BHA.c[1]], 30, [60, 110], [11.7, 12.7], { dry: true }),
  E('bhkPuja', [BHA.c[0] - 5, BHA.c[1]], 30, [60, 110], [17.8, 19.2], { dry: true }),
  // the devotees' bells: at the Siddhi Lakshmi shrine, the chaitya, the foot of the Nyatapola's stair
  E('bhkBell', [SHI.c[0] + 2, SHI.c[1]], 14, [30, 70], [5.5, 19], { dry: true }),
  E('bhkBell', [CHAITYA.c[0], CHAITYA.c[1] + 1.2], 12, [40, 90], [5.5, 19], { dry: true }),
  E('bhkBell', [NYA.c[0] + 16, NYA.c[1]], 16, [30, 70], [5.5, 19], { dry: true }),
  // Pottery Square: the wheels, the kilns' fires, pots at the drying ground
  ...POT_WHEELS.map((p) => E('wheel', p, 9, [10, 22], [7.5, 17], { dry: true })),
  ...POT_KILNS.map((p) => E('bhkKiln', p, 12, [10, 16], [8, 21.5])),
  E('bhkPots', [-86.5, 88.2], 10, [14, 30], [7.5, 17.5], { dry: true }), E('bhkPots', [-72.5, 88.2], 10, [14, 30], [7.5, 17.5], { dry: true }),
  // the market's stalls: the bargaining
  ...STALLS.filter((_, i) => i % 2 === 0).map(([x, z]) => E('bhkMurmur', [x, z], 7, [10, 22], [6.5, 18], { dry: true })),
  // the evening bhajan in the pati
  E('bhkBhajan', mid(PATI), 20, [50, 100], [17.5, 21], { dry: true, after: true }),
  // children in the square and the lanes
  ...[[20, 2], [-20, 0], [60, 10]].map((p) => E('bhkChildren', p, 14, [30, 70], [8.5, 17.5], { dry: true })),
  // a buffalo in each of its two lanes, a goat tethered by a door
  ...[[-24, 5], [70, -40]].map((p) => E('bhkBuffalo', p, 18, [60, 130], [5, 20], { dry: true })),
  ...[[8, 60], [-70, -30]].map((p) => E('bhkGoat', p, 14, [50, 110], [6, 19], { dry: true })),
  // the dogs, a little by day and from lane to lane by night; jackals in the fields
  E('bhkDogs', [30, 60], 40, [120, 240], [6, 19], { dry: true, lv: 0.5 }),
  ...[[-60, 40], [70, 50], [-40, -80], [90, -60]].map((p, i) => E('bhkDogs', p, 55, [50 + i * 10, 110], [19.5, 5], { dry: true })),
  ...[[-165, -60], [150, 100], [20, 178], [-40, -175]].map((p, i) => E('bhkJackal', p, 70, [70 + i * 12, 150], [19.5, 4.5], { dry: true })),
];
