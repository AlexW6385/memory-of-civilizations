// Where Madurai's sounds are (docs/settlements/madurai.md §18): the places of the emitters and the geometry the audio engine needs
// (soundscape.js's `LIFE.map`, the interface of Suzhou's and Agra's maps): the nadaswaram and tavil at the two shrines' gopurams
// by the hours of the temple's worship, the bell and the chant, the conch, the bathers on the tank's steps, the elephants by the
// south gate, the jasmine sellers' calls on the Chitrai street, the market in the Pudhu Mandapam, the brass-smiths and the grinders,
// the bullock carts on the ring streets, the rooms. Pure data and functions of layout.js (no three.js). Coordinates: metres, +x east,
// +z south, the settlement's own frame. [inferred throughout; the hours follow the temple's six daily services and the market's day.]

import { RADIUS, WALL, GATES, TANK, HALL, PUDHU, STREETS, lots, inRect } from './layout.js';
import '../../engine/voices-madurai.js';

export const HOME = [-20, 170];                              // the arrival, on the south axial street
export const FAR = {};
export const WELLS = [];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
export const ASHTA = [104, 34, 128, 46];                      // the Ashta Shakti Mandapam inside the east wall (plan.js)

// ── the streets (rects of the ring streets and the axial ones) ─────────────────────────────
const ring = ({ off, w }) => [
  [WALL[0] - off - w, WALL[3] + off, WALL[2] + off + w, WALL[3] + off + w], [WALL[0] - off - w, WALL[1] - off - w, WALL[2] + off + w, WALL[1] - off],
  [WALL[2] + off, WALL[1] - off - w, WALL[2] + off + w, WALL[3] + off + w], [WALL[0] - off - w, WALL[1] - off - w, WALL[0] - off, WALL[3] + off + w]];
export const STREET_RECTS = [...STREETS.flatMap(ring),
  [GATES.s[0] - 6, WALL[3], GATES.s[0] + 6, RADIUS - 30], [GATES.n[0] - 6, -RADIUS + 30, GATES.n[0] + 6, WALL[1]],
  [WALL[2], GATES.e[1] - 6, RADIUS - 30, GATES.e[1] + 6], [-RADIUS + 30, GATES.w[1] - 6, WALL[0], GATES.w[1] + 6]];

function streetPath(x, z, rnd, reach, lead) {
  let best = null;
  STREET_RECTS.forEach((r, i) => { const px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = STREET_RECTS[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = Math.min((horiz ? r[2] : r[3]) - 2, RADIUS - 30), near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 3;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
/** The engine's Suzhou walkers (sedan chair, vendor, watchman) are not Madurai's: none; the place's own are TRACKS. */
export const streetTrack = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const shoreSpot = () => null;
export const pondSpot = () => null;
export const treeSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;                              // no lotus or life in the tank [stated: tamilnadu-favtourism]
/** The Vaigai lies north of the city, beyond the map: a far point. */
export const canalSpot = (x, z) => ({ p: [x, -RADIUS], d: Math.abs(z + RADIUS), i: 0 });

const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
export const TRACKS = [
  { key: 'mduCart', voice: 'mduCart', speed: 1.1, r50: 16, gap: [90, 200], ok: day(5.5, 19), get: (x, z, rnd) => streetPath(x, z, rnd, 90, 45) },
  { key: 'mduFlowerWalk', voice: 'mduFlowers', speed: 1.0, r50: 10, gap: [40, 90], ok: day(6, 20), get: (x, z, rnd) => streetPath(x, z, rnd, 70, 28) },
];

// ── the planting and the town ────────────────────────────────────────────────────────────
export const leafNear = (x, z) => Math.min(1, 0.25 + 0.5 * sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z)));
export const greenNear = (x, z) => Math.max(0.1, leafNear(x, z) * 0.8);
/** 0…1: how much of the town's hubbub reaches (x, z): the temple streets and the market, little in the inner courts, less toward the rim. */
export function townNear(x, z) {
  if (inRect(HALL, x, z)) return 0.15;
  if (inRect(WALL, x, z, -2)) return 0.3;
  return Math.max(0.1, 1 - 0.6 * sm(180, RADIUS - 40, Math.hypot(x, z)));
}
export const frogGround = (x, z) => 0.5 * sm(RADIUS - 120, RADIUS - 40, Math.hypot(x, z));

// ── the rooms ──────────────────────────────────────────────────────────────────────────────
let LOTS = null;
/** The room the listener is in: { use, at, upper, same } or null (the courts and streets are the open). */
export function roomAt(x, z, y = 0) {
  if (inRect(HALL, x, z)) return { use: 'hall', at: mid(HALL), upper: false, same: 'thousand' };
  if (inRect(ASHTA, x, z)) return { use: 'hall', at: mid(ASHTA), upper: false, same: 'ashta' };
  if (inRect(PUDHU, x, z) && y > 0.6) return { use: 'mandapa', at: mid(PUDHU), upper: false, same: 'pudhu' };
  for (const l of (LOTS ||= lots().filter((q) => q.kind !== 'yard'))) if (inRect(l.rect, x, z)) return { use: l.kind === 'shop' ? 'shop' : l.kind === 'court' ? 'court' : 'house', at: mid(l.rect), upper: false, same: 'lot:' + l.rect[0] + ':' + l.rect[1] };
  return null;
}
export const ROOMS = {
  hall: { tone: [160, 0.22], roof: 0.2, hush: 0.55, work: [['mduChant', 90]] },          // stone ceiling: no rain on it
  mandapa: { tone: [380, 0.25], roof: 0.4, hush: 0.8, work: [['mduBangles', 50]] },
  shop: { tone: [420, 0.35], roof: 1.0, hush: 0.9, work: [['coin', 40], ['clothRustle', 30]] },
  court: { tone: [260, 0.25], roof: 1.0, hush: 0.7, work: [['mduGrind', 60], ['broom', 80]] },
  house: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
export const UPPER = { tone: [230, 0.15], roof: 1.3, hush: 0.6, work: [['broom', 60]] };
/** No houses with their own work: the grinders and the smiths are EMITTERS. */
export const sites = () => [];

// ── the emitters in the open ────────────────────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const SZ = [66, -28], MZ = [-47, -31];                                    // before the sanctums' gopurams (rite plans' placing)
const zs = WALL[3] + 14.2;
export const EMITTERS = [
  // the temple's worship at its six hours: the nadaswaram and tavil from the gopurams' mandapas at dawn, noon, dusk and the closing [inferred hours]
  E('mduNadaswaram', [SZ[0] + 14, SZ[1]], 60, [70, 130], [4.6, 6.6], { dry: true }), E('mduTavil', [SZ[0] + 14, SZ[1] + 1], 55, [70, 130], [4.6, 6.6], { dry: true }),
  E('mduNadaswaram', [MZ[0] + 9, MZ[1]], 55, [80, 150], [11.5, 12.8], { dry: true }), E('mduTavil', [MZ[0] + 9, MZ[1] + 1], 50, [80, 150], [11.5, 12.8], { dry: true }),
  E('mduNadaswaram', [SZ[0] + 14, SZ[1]], 60, [70, 130], [17.5, 19.2], { dry: true }), E('mduTavil', [SZ[0] + 14, SZ[1] + 1], 55, [70, 130], [17.5, 19.2], { dry: true }),
  E('mduNadaswaram', [MZ[0] + 9, MZ[1]], 55, [90, 160], [20.3, 21.6], { dry: true }), E('mduTavil', [MZ[0] + 9, MZ[1] + 1], 50, [90, 160], [20.3, 21.6], { dry: true }),
  // the hand bell and the chant before each sanctum, through the day's services
  E('mduPujaBell', SZ, 30, [60, 120], [5.5, 6.5]), E('mduPujaBell', SZ, 30, [60, 120], [11.5, 12.5]), E('mduPujaBell', SZ, 30, [60, 120], [17.8, 19]),
  E('mduPujaBell', MZ, 30, [70, 130], [5.5, 6.5]), E('mduPujaBell', MZ, 30, [70, 130], [11.5, 12.5]), E('mduPujaBell', MZ, 30, [70, 130], [17.8, 19]),
  E('mduChant', [SZ[0] - 4, SZ[1] + 2], 22, [60, 130], [5, 21]), E('mduChant', [MZ[0] - 3, MZ[1] + 2], 22, [70, 140], [5, 21]),
  // the conch at the opening at dawn and the closing at night
  E('mduConch', [SZ[0] + 4, SZ[1]], 80, [150, 260], [4.4, 5.4], { dry: false }), E('mduConch', [MZ[0] + 4, MZ[1]], 80, [150, 260], [20.8, 21.6]),
  // the tank: bathers on the steps, the lap of the pool in the cloister
  ...[[-86, 35], [-71, 35], [-58, 35]].map((p, i) => E('mduBathe', p, 11, [14 + i * 4, 36], [5, 18], { dry: true })),
  ...[[-96, 50], [-71, 50], [-46, 50], [-71, 65]].map((p) => E('mduTankLap', p, 9, [6, 16], [0, 24])),
  // the elephants inside the south gate, tied by the wall: the bell at the neck, the chain, a rumble
  E('mduElephant', [6, 109], 24, [20, 50], [5.5, 20]), E('mduElephant', [14, 109.5], 24, [26, 60], [5.5, 20]),
  // the jasmine sellers on their mats before the south gopuram
  ...[-54, -50.5, -29.5, -26, -22.5].map((x, i) => E('mduFlowers', [x, zs], 12, [24 + i * 4, 60], [6, 20], { dry: true })),
  // the Pudhu Mandapam's market: tailors, cloth and bangle sellers [stated: maduraitourism]
  ...[178, 200, 222, 244].map((x, i) => E('mduMarket', [x, -8 + (i % 2 ? 3 : -3)], 16, [10, 22], [8, 19], { dry: false })),
  ...[190, 235].map((x) => E('mduBangles', [x, -12], 12, [22, 50], [8, 19])),
  // the brass-smiths' hammers on the Masi streets (the metalworkers on the processional routes [stated: aimsr.edu.in])
  E('hammer', [-90, WALL[3] + 160], 12, [14, 34], [7, 18], { dry: true }), E('hammer', [95, WALL[3] + 158], 12, [16, 36], [7, 18], { dry: true }),
  // the grinders of the morning kitchens
  ...[[-60, 150], [40, 160], [140, 70], [-140, -50], [-150, 80]].map((p, i) => E('mduGrind', p, 9, [30 + i * 5, 70], [5, 9], { dry: true })),
  // cows with their bells lying in the lanes at night
  ...[[60, WALL[3] + 19], [-90, WALL[3] + 17], [WALL[2] + 18, 60]].map((p, i) => E('mduCowBell', p, 14, [30 + i * 8, 70], [19.5, 4.5])),
  // the ashta shakti hall: pilgrims fed at noon
  E('mduMarket', mid(ASHTA), 12, [20, 45], [11, 14], { dry: false }),
  // dogs of the lanes at night
  ...[[-100, 160], [130, 150], [-140, -100]].map((p, i) => E('dogFar', p, 40, [50 + i * 12, 130], [20, 5])),
];
