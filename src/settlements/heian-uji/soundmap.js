// Where Uji's sounds are (docs/settlements/heian-uji.md §19.3): the places of its emitters and the geometry the audio engine needs to put each
// sound where it is made (src/engine/voices.js `placed()`, src/engine/voices-uji.js): the Uji River and the pond, the streets, the bridge, the
// houses at their trades, the hall, the fires, the trees. Pure data and functions of layout.js and fires.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`). Coordinates: metres, +x east, +z south, the settlement's frame.
// The engine's scheduler was written for Suzhou and calls walkers this town does not have by their own arguments: `streetTrack(…, 90, 40)`
// (a sedan chair), `(…, 90, 34)` (the night watchman) and `(…, 80, 30)` (Chinese pedlars) and `treeSpot(…, 40)` (Chinese seasonal birds): here
// those return null; the town's own walkers (voices-uji.js) come through `pedlarTrack`, its birds through `treeSpot(…, 41)`.

import '../../engine/voices-kyoto.js';
import '../../engine/voices-uji.js';
import { RADIUS, RIVER, BRIDGE, POND, HALL, MARKET, STREETS, GARDEN, lots, inRect, inPond, inRiver, streetRect } from './layout.js';
import { openSet } from './openset.js';
import { fireSpots, riverX, bridgeEnds, sanNoMa } from './fires.js';

/** Where the audio puts the listener when the engine gives none (the arrival, the viewing pier). */
export const HOME = [6.5, 0];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];

// ── the houses at their trades ──────────────────────────────────────────────────
/** What each trade's house makes heard: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade (dossier §13) and the work it needs]. */
const WORK = {
  weaver: [['loom', [14, 34], [7, 17]]],
  potter: [['wheel', [30, 60], [8, 17]]],
  carpenter: [['chisel', [16, 40], [7, 17]], ['ujAdze', [24, 60], [7, 17]]],
  farmer: [['kine', [20, 50], [6, 17]]],
  woodman: [['ujAxe', [14, 36], [7, 16]]],
  brewer: [['jarLid', [30, 70], [6, 17]]],
  fisher: [['clothRustle', [20, 50], [4, 11]]],
};
const OPEN = () => openSet(lots());
let SITES = null;
/** The opened houses of the trades above, a third of them by seed: { use, rect, at, id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const open = OPEN();
  for (const l of lots()) {
    if (!open.has(l) || !WORK[l.trade] || l.seed % 3) continue;
    const [x0, z0, x1, z1] = l.rect;
    SITES.push({ use: l.trade, rect: l.rect, at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'lot:' + l.seed, work: WORK[l.trade] });
  }
  return SITES;
}
/** The draw-wells of the crossings (street.js): the engine's `wellBucket` is made there. */
export const WELLS = (() => {
  const out = [], H = STREETS.filter((s) => s.a[1] === s.b[1]), V = STREETS.filter((s) => s.a[0] === s.b[0]);
  for (const h of H) for (const v of V) {
    const x = v.a[0], z = h.a[1];
    if (x < Math.min(h.a[0], h.b[0]) || x > Math.max(h.a[0], h.b[0]) || z < Math.min(v.a[1], v.b[1]) || z > Math.max(v.a[1], v.b[1]) || Math.hypot(x, z) > RADIUS - 60) continue;
    out.push([x + 4.6, z + 4.6]);
  }
  return out;
})();

// ── the hall ────────────────────────────────────────────────────────────────────
/** The central hall's core, world frame (plan-local ±3.9 × ±5.4 on the plan's origin), and where the offering table stands. */
export const HALL_CORE = [HALL.origin[0] - 4.2, -5.7, HALL.origin[0] + 4.2, 5.7];
export const OFFERING = [HALL.origin[0] + 1.5, 0];

// ── geometry of the water and the streets ───────────────────────────────────────
/** The river's mid-line points every 40 m, where the rush is made. */
export const RIVER_POINTS = Array.from({ length: 13 }, (_, i) => { const z = -240 + i * 40; return [riverX(z), z]; });
const inWater = (x, z) => inRiver(x, z) || inPond(x, z);
/** The nearest point of the water (the river's band, the pond's circles) to (x, z), its distance (0 inside). */
export function canalSpot(x, z) {
  let best = null;
  const rx = riverX(z), hw = RIVER.w / 2 - 3, px = Math.max(rx - hw, Math.min(rx + hw, x)), dr = Math.abs(x - px);
  best = { p: [px, z], d: dr };
  for (const c of POND) { const dx = x - c.c[0], dz = z - c.c[1], q = Math.hypot(dx / c.r[0], dz / c.r[1]), pp = q <= 1 ? [x, z] : [c.c[0] + dx / q, c.c[1] + dz / q], dd = Math.hypot(x - pp[0], z - pp[1]); if (dd < best.d) best = { p: pp, d: dd }; }
  return best;
}
/** No sculled boats: the fishers' craft are poled or moored (dossier §19.2). */
export function canalTrack() { return null; }
/** A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function pedlarTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  STREETS.forEach((s, i) => { const r = [Math.min(s.a[0], s.b[0]) - 0, Math.min(s.a[1], s.b[1]) - 0, Math.max(s.a[0], s.b[0]), Math.max(s.a[1], s.b[1])], p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const s = STREETS[best.i], horiz = s.a[1] === s.b[1], mid = horiz ? s.a[1] : s.a[0];
  const lo = (horiz ? Math.min(s.a[0], s.b[0]) : Math.min(s.a[1], s.b[1])) + 1, hi = (horiz ? Math.max(s.a[0], s.b[0]) : Math.max(s.a[1], s.b[1])) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, mid + off], [b, mid + off]] } : { pts: [[mid + off, a], [mid + off, b]] };
}
/** The engine's street walkers (Chinese sedan chair, gong watchman, Chinese pedlar) do not exist here. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  if (lead === 40 || lead === 34 || (reach === 80 && lead === 30)) return null;
  return pedlarTrack(x, z, rnd, reach, lead);
}
/** The Uji Bridge: a walker's track across it along the deck, within `reach` of its middle. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  const [x0, x1] = bridgeEnds(), mx = (x0 + x1) / 2, d = Math.hypot(x - mx, z - BRIDGE.z);
  if (d > reach + 30) return null;
  const s = rnd() < 0.5 ? 1 : -1, oz = (rnd() - 0.5) * 2.4;
  return { pts: [[mx - s * (x1 - x0) / 2, BRIDGE.z + oz], [mx + s * (x1 - x0) / 2, BRIDGE.z + oz]], d };
}
/** A point on the water within `reach` of (x, z) (a ring of tries), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (canalSpot(x, z).d > reach + 8) return null;
  for (let k = 0; k < 16; k++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (inWater(px, pz)) return [px, pz]; }
  return null;
}
/** The water's edge near (x, z): where a ray from it first crosses the edge, or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  if (canalSpot(x, z).d > reach) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = inWater(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const w = inWater(x + c * d, z + s * d); if (w !== prev) return [x + c * d, z + s * d]; prev = w; }
  }
  return null;
}
/** A place on the river's bank or in its shallows within `reach` of (x, z): where the kajika frogs sing; null away from the river. */
export function riverSpot(x, z, rnd, reach = 40) {
  if (Math.abs(x - riverX(z)) > RIVER.w / 2 + reach) return null;
  for (let k = 0; k < 8; k++) { const zz = z + (rnd() - 0.5) * 2 * reach, side = rnd() < 0.5 ? -1 : 1, px = riverX(zz) + side * (RIVER.w / 2 - 4 + rnd() * 3); if (Math.hypot(px - x, zz - z) < reach && Math.hypot(px, zz) < RADIUS - 8) return [px, zz]; }
  return null;
}
/** The fires' places (the crackle) and the bridge's middle (the planks). */
export const FIRES = fireSpots().map((f) => f.at);

// ── where the planting makes its sound ──────────────────────────────────────────
/** 0…1: how wooded is (x, z): the garden's pines and maples, the hills beyond the river, the shrine's grove; the village's lanes bare. */
export function treeness(x, z) {
  let m = 0.1;
  if (inRect(GARDEN, x, z, 10)) m = 0.7;
  m = Math.max(m, 0.9 * sm(riverX(z) + RIVER.w / 2 + 6, riverX(z) + RIVER.w / 2 + 50, x));
  m = Math.max(m, 0.35 * (1 - sm(1, 16, canalSpot(x, z).d)));
  return m;
}
/** A tree to put a cicada or a bird in, near (x, z), by the woodedness; null at once for the engine's own seasonal-bird call (reach 40). */
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach === 40) return null;
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && treeness(px, pz) > 0.25 + 0.6 * rnd()) return [px, pz];
  }
  return null;
}
/** 0…1: bamboo (a clump by the lanes' backs) — little. */
export function bambooNear() { return 0.12; }
/** 0…1: pines and broad leaves in wind. */
export function leafNear(x, z) { return Math.min(1, Math.max(0.3 + 0.5 * treeness(x, z), 0.5 * (1 - sm(1, 14, canalSpot(x, z).d)))); }
/** The Aji pond's lotus (dossier §10): some, in the coves. */
export function lotusNear(x, z) { return 0.6 * (1 - sm(4, 40, canalSpot(x, z).d)) * (inRect([-120, -80, 40, 80], x, z) ? 1 : 0.2); }
/** 0…1: green round (x, z) for the insects. */
export function greenNear(x, z) { return Math.max(treeness(x, z) * 0.9, sm(300, 360, Math.hypot(x, z)) * 0.85, 0.55 * (1 - sm(1, 18, canalSpot(x, z).d)), 0.14); }
/** 0…1: how much of the village's hubbub reaches (x, z): the market and the roads; the garden quiet. */
export function townNear(x, z) {
  if (inRect(GARDEN, x, z)) return 0.1;
  const m = Math.hypot(Math.max(MARKET[0] - x, 0, x - MARKET[2]), Math.max(MARKET[1] - z, 0, z - MARKET[3]));
  const road = Math.min(...STREETS.map((s) => { const r = streetRect(s), p = nearIn(r, x, z); return Math.hypot(p[0] - x, p[1] - z); }));
  return Math.max(0.1, (1 - sm(0, 90, m)) * 0.9, (1 - sm(2, 40, road)) * 0.35) * (1 - 0.4 * sm(300, 360, Math.hypot(x, z)));
}
/** 0…1: wet ground (the frogs): the water, its banks, the rim's fields. */
export function frogGround(x, z) { return Math.max(1 - sm(0, 30, canalSpot(x, z).d), sm(300, 360, Math.hypot(x, z)) * 0.9); }

// ── the rooms ───────────────────────────────────────────────────────────────────
/** The room the listener is in: { use, at, upper, same } or null in the open. Uses: a trade's, house, hall (the central hall's core, y above its podium). */
export function roomAt(x, z, y = 0) {
  if (inRect(HALL_CORE, x, z) && y > 0.6) return { use: 'hall', at: OFFERING, upper: false, same: 'room:hall' };
  const open = OPEN();
  for (const l of lots()) if (open.has(l) && inRect(l.rect, x, z)) return { use: WORK[l.trade] ? l.trade : 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper: y > 3, same: 'lot:' + l.seed };
  return null;
}
/** The room's own colour and small sounds: `tone` [lowpass Hz, level], `roof` the rain's loudness from inside, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  weaver: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 30]] },
  potter: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  carpenter: { tone: [340, 0.3], roof: 1.0, hush: 0.8, work: [['chisel', 40]] },
  farmer: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['sack', 40]] },
  woodman: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['broom', 60]] },
  brewer: { tone: [260, 0.25], roof: 1.0, hush: 0.7, work: [['jarLid', 40]] },
  fisher: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 40]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  hall: { tone: [150, 0.3], roof: 0.8, hush: 0.5, work: [['ujKei', 60]] },        // the hall: timber and gilt, high and still; a bowl-bell now and then
};
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['broom', 60]] };

// ── the emitters (the engine's fixed ones; `at: [0, 0], r50: 1000` is a listener-relative one: the voice finds its own street, tree or bank) ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const EVERY = [[0, 0], 1000];
const [bx0, bx1] = bridgeEnds(), BRIDGE_MID = [(bx0 + bx1) / 2, BRIDGE.z];
export const EMITTERS = [
  // the river's rush along its length, louder at the piles of the bridge, the water through the stakes of the weirs
  ...RIVER_POINTS.map((p) => E('ujRush', p, 30, [5, 8], [0, 24], { dry: false, rainMax: 1 })),
  E('ujRush', BRIDGE_MID, 34, [4, 6], [0, 24], { rainMax: 1, lv: 1.3 }),
  E('ujWeir', [riverX(-128) - 12, -128], 14, [5, 9], [0, 24], { rainMax: 1 }), E('ujWeir', [riverX(-112) + 10, -112], 14, [5, 9], [0, 24], { rainMax: 1 }),
  // the hall: the nenbutsu after the bonshō at dawn and dusk, with the bowl-bell
  E('ujNenbutsu', OFFERING, 24, [80, 150], [5.7, 6.8], { rainMax: 1, after: true }), E('ujNenbutsu', OFFERING, 24, [80, 150], [18.3, 19.4], { rainMax: 1, after: true }),
  // the fires (kagaribi) of the bridge heads and the shrine, by night
  ...FIRES.map((p) => E('ujFire', p, 9, [3, 8], [18, 5], { rainMax: 1 })),
  // the bridge's planks: the cart on it, by day
  E('ujPlanks', BRIDGE_MID, 26, [30, 70], [7, 17], { dry: true }),
  // the listener-relative ones
  E('ujPedlar', EVERY[0], EVERY[1], [34, 80], [6, 17.5], { rainMax: 0.4 }),
  E('ujSakioi', EVERY[0], EVERY[1], [110, 240], [8, 17], { dry: true }),
  E('ujKajika', EVERY[0], EVERY[1], [4, 10], [18.5, 24], { rainMax: 0.9 }), E('ujKajika', EVERY[0], EVERY[1], [4, 10], [0, 4], { rainMax: 0.9 }),
  E('ujGeese', EVERY[0], EVERY[1], [60, 140], [16.5, 18.5], { rainMax: 0.3 }), E('ujGeese', EVERY[0], EVERY[1], [60, 140], [5, 7], { rainMax: 0.3 }),
  E('ujStag', [riverX(0) + 90, 0], 110, [50, 120], [17.5, 24], { rainMax: 0.5 }), E('ujStag', [riverX(0) + 90, 0], 110, [50, 120], [0, 5.5], { rainMax: 0.5 }),
  E('higurashi', EVERY[0], EVERY[1], [5, 14], [4.6, 6.2], { rainMax: 0.3 }), E('higurashi', EVERY[0], EVERY[1], [5, 14], [17.4, 19.4], { rainMax: 0.3 }),
  E('uguisu', EVERY[0], EVERY[1], [14, 40], [5.5, 17], { rainMax: 0.3 }),
  E('hototogisu', EVERY[0], EVERY[1], [20, 60], [19, 23.5], { rainMax: 0.3 }), E('hototogisu', EVERY[0], EVERY[1], [20, 60], [3.5, 5.5], { rainMax: 0.3 }),
  E('suzumushi', EVERY[0], EVERY[1], [3, 8], [18.5, 24], { rainMax: 0.2 }), E('suzumushi', EVERY[0], EVERY[1], [3, 8], [0, 4.5], { rainMax: 0.2 }),
  E('owl', [-120, -130], 80, [40, 110], [21, 4.5], { rainMax: 0.4 }),
];
void sanNoMa;
