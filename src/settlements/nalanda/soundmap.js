// Where Nalanda's sounds are (docs/settlements/nalanda.md §20): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the wooden gong at each monastery's court, the recited chant at the court shrines and on the great temple, the debaters' claps and the lecture in
// Monastery 1's court, the stylus in the library's halls, the grinders, pots and loom of the open houses, the kitchens and the refectory of the annexes, the pour
// of water at the tanks' ghats, the zebu carts on the way, the bazaar on the road to the village, the rooms one can be inside. Pure data and functions of
// layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-nalanda.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout: what sounded is from the dossier §9, §10,
// §13; the hours follow the monastic day (the gong at dawn, the meal before noon, the evening recitation).]
//
// What the scheduler asks of a map but Nalanda has not (no canals, ponds with boats, bridges or street walkers of Suzhou) is answered with nothing.
import '../../engine/voices-nalanda.js';
import { RADIUS, WAY, MONASTERIES, M1, T3, TANKS, ANNEXES, LIBRARY, GATE, lots, yards, tankD, inTank, nearCore, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the sacred way). */
export const HOME = [-2, 70];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const WORK = {
  home: [['kitchen', [14, 30], [5, 20]], ['grinder', [50, 100], [5, 9]]],
  weaver: [['loom', [10, 24], [6.5, 18]]],
  grain: [['sack', [30, 70], [7, 17]], ['jarLid', [40, 90], [7, 17]]],
  oil: [['mortar', [8, 20], [6, 17]], ['pour', [40, 90], [6, 17]]],
  garland: [['clothRustle', [30, 60], [5, 19]]],
  scribe: [['nalStylus', [20, 50], [7, 17]]],
  rest: [['clothRustle', [40, 90], [0, 24]]],
  refectory: [['bowlClack', [8, 20], [10.5, 12.5]], ['clothRustle', [30, 70], [10, 12.5]]],
  nalkitchen: [['kitchen', [6, 16], [4, 19]], ['grinder', [30, 60], [4, 10]], ['pour', [30, 70], [4, 12]]],
  granary: [['sack', [14, 34], [6, 17]], ['jarLid', [30, 80], [6, 17]]],
  infirmary: [['mortar', [20, 50], [6, 17]], ['pour', [40, 90], [6, 17]]],
  library: [['nalStylus', [10, 26], [7, 17]], ['clothRustle', [30, 70], [7, 17]]],
};
const USES = ['home', 'weaver', 'grain', 'home', 'oil', 'garland', 'scribe', 'rest', 'home', 'garland'];
const ANNEX_USE = { refectory: 'refectory', kitchen: 'nalkitchen', granary: 'granary', infirmary: 'infirmary' };
const HALL_C = [LIBRARY.c[0] + 21, LIBRARY.c[1]];                                 // Ratnarañjaka (plan.js TOWERS[2])
const TOWER_HALLS = [[LIBRARY.c[0], LIBRARY.c[1] - 4, 7, 7], [LIBRARY.c[0] - 23, LIBRARY.c[1] - 3, 6, 8], [HALL_C[0], HALL_C[1], 9, 7]];

let SITES = null;
/** The rooms with sounds: { use, rect, at: [x, z] (the middle), id, work, y }: the open houses (town.js: within 175 m of the arrival, the use of each in order), the annexes, the library's three halls. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const rr = rng(5);
  let ui = 0;
  for (const l of lots()) {
    if (l.gone) continue;
    const d = Math.hypot((l.rect[0] + l.rect[2]) / 2 - HOME[0], (l.rect[1] + l.rect[3]) / 2 - HOME[1]);
    if (!(d < 175 && l.rect[2] - l.rect[0] >= 6.5 && l.rect[3] - l.rect[1] >= 6)) continue;
    const use = USES[(ui++ + Math.floor(rr() * 3)) % USES.length];
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[use], y: 0 });
  }
  for (const a of ANNEXES) SITES.push({ use: ANNEX_USE[a.kind], rect: a.rect, at: mid(a.rect), id: 'annex:' + a.seed, work: WORK[ANNEX_USE[a.kind]], y: 0 });
  for (const [cx, cz, hx, hz] of TOWER_HALLS) { const r = [cx - hx, cz - hz, cx + hx, cz + hz]; SITES.push({ use: 'library', rect: r, at: [cx, cz], id: 'hall:' + cx, work: WORK.library, y: 0 }); }
  return SITES;
}

/** The wells of the village lanes (town.js). */
export const WELLS = [[127, 40], [127, -50], [100, 102]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const [m0x, m0z, m1x, m1z] = M1.rect, mzc = (m0z + m1z) / 2;
const ROOM_RECTS = [['room:shrine', 'shrine', [m1x - 18.6, mzc - 2.5, m1x - 12.8, mzc + 2.5]]];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.6, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch, tile or flat lime concrete), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  weaver: { ...R0, work: [['loom', 14]] },
  grain: { ...R0, tone: [260, 0.2], work: [['sack', 40]] },
  oil: { ...R0, tone: [280, 0.25], work: [['mortar', 14]] },
  garland: { ...R0, roof: 1.0, work: [['clothRustle', 40]] },
  scribe: { ...R0, tone: [240, 0.2], work: [['nalStylus', 24]] },
  rest: { ...R0, work: [['clothRustle', 60]] },
  refectory: { tone: [260, 0.25], roof: 0.7, hush: 0.7, work: [['bowlClack', 14]] },
  nalkitchen: { tone: [420, 0.4], roof: 0.7, hush: 0.9, work: [['kitchen', 10]] },
  granary: { tone: [220, 0.2], roof: 0.7, hush: 0.7, work: [['sack', 24]] },
  infirmary: { tone: [240, 0.2], roof: 0.7, hush: 0.6, work: [['mortar', 30]] },
  library: { tone: [200, 0.2], roof: 0.6, hush: 0.6, work: [['nalStylus', 14]] },
  shrine: { tone: [170, 0.25], roof: 0.6, hush: 0.5, work: [['nalChant', 40]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['nalStylus', 24]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the mango groves thickening round the compound and the village, the tanks' margins. */
export function greenNear(x, z) {
  const rim = sm(RADIUS - 130, RADIUS - 50, Math.hypot(x, z)), tank = 1 - sm(0, 24, tankD(x, z));
  return Math.max(0.2, rim * 0.9, tank * 0.6);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the mango groves of the rim and the pipals and neems by the tanks. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !nearCore(px, pz, 3) && !inTank(px, pz, 2) && (Math.hypot(px, pz) > RADIUS - 70 || hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.12)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the bazaar on the road and the village street, the way by day, little in the courts and the library, less toward the rim. */
export function townNear(x, z) {
  if (inRect([40, 124, 126, 131], x, z, 4) || inRect([127, -95, 135, 90], x, z, 4)) return 1;
  if (inRect([WAY.x0, -140, WAY.x1, 126], x, z, 3)) return 0.5;
  if (inRect(LIBRARY.yard, x, z)) return 0.1;
  if (MONASTERIES.some((m) => inRect(m.rect, x, z))) return 0.2;
  return Math.max(0.12, 0.6 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
// what Nalanda has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = (x, z) => (tankD(x, z) < 3 ? 1 : 0);
export const frogGround = (x, z) => (tankD(x, z) < 8 ? 0.8 : 0.1);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const CT = (m) => [(m.rect[0] + 7.6 + m.rect[2] - 7.6) / 2, (m.rect[1] + m.rect[3]) / 2];     // a monastery's court
const SHRINE = (m) => [m.rect[2] - 7.6 - 8, (m.rect[1] + m.rect[3]) / 2];                      // its court shrine
const cx1 = CT(M1)[0];
export const EMITTERS = [
  // the wooden gong at each monastery's court: it calls the day at dawn, the meal before noon, the evening recitation [inferred: the gong hangs at a corner, §13]
  ...MONASTERIES.flatMap((m, i) => { const p = [m.rect[0] + 9, m.rect[1] + 9]; return [E('nalWoodGong', p, 60, [140, 260], [4.4, 5.6], { rainMax: 0.7 }), E('nalWoodGong', p, 55, [160, 300], [10.4, 11.6], { rainMax: 0.7 }), E('nalWoodGong', p, 55, [160, 300], [17.4, 18.6], { rainMax: 0.7 })].filter((_, k) => (i + k) % 2 === 0 || k === 0); }),
  // the recitation at the court shrines and stupas, morning and evening; the great temple's summit shrine
  ...MONASTERIES.map((m, i) => E('nalChant', SHRINE(m), 26, [60 + i * 8, 130], i % 2 ? [5, 7.5] : [17, 19.5], { rainMax: 0.8, after: true })),
  E('nalChant', [T3.c[0], T3.c[1]], 45, [80, 160], [5, 7], { rainMax: 0.8 }), E('nalChant', [T3.c[0], T3.c[1]], 45, [90, 170], [17.5, 19.5], { rainMax: 0.8 }),
  // the lecture and the debate in Monastery 1's court (the podium at the court's south side, the debaters by the well, as the people stand)
  E('nalDebateClap', [cx1 - 11, mzc - 4.6], 26, [26, 60], [9, 17], { rainMax: 0.2 }), E('nalChant', [cx1 - 1.8, mzc + 9.8], 24, [60, 120], [9, 12], { rainMax: 0.2 }),
  E('nalDebateClap', [CT(MONASTERIES[1])[0] - 9, CT(MONASTERIES[1])[1] + 5], 22, [50, 110], [9, 17], { rainMax: 0.2 }),
  // the zebu carts at the way's margins, and on the road to the village
  ...[[-4.7, 48], [4, 30], [-4.4, 14], [3.6, 92], [80, 127]].map(([x, z], i) => E('nalCartBell', [x, z], 18, [28 + i * 6, 70], [5.5, 19], { rainMax: 0.4 })),
  // the water at the east tank's ghats: women filling pots, monks bathing at dawn; the wells of the village lanes
  ...TANKS[0].ghats.map((g, i) => E('pour', [TANKS[0].rect[0] - 1, g.at], 10, [8 + i * 3, 24], [5, 9.5], { dry: true })),
  ...TANKS[0].ghats.map((g, i) => E('pour', [TANKS[0].rect[0] - 1, g.at], 10, [18 + i * 4, 50], [15.5, 18.5], { dry: true })),
  ...WELLS.map((w, i) => E('wellBucket', w, 10, [20 + i * 6, 60], [5, 18], { dry: true })),
  // the potter's yards (yards with a kiln, every fourth) and the grinders of the village
  ...yards().filter((y, i) => i % 4 === 0 && !y.gone).flatMap((y) => [E('wheel', mid(y.rect), 12, [24, 50], [6.5, 17], { dry: true }), E('clay', mid(y.rect), 11, [12, 28], [6.5, 17], { dry: true })]),
  // the bazaar on the road to the village and along its street: the sellers' murmur, a scale, pots
  ...[60, 80, 100].map((x, i) => E('jarLid', [x, 128], 12, [16 + i * 4, 40], [6.5, 18], { dry: true })),
  E('clothRustle', [130, 0], 12, [14, 36], [6.5, 18], { dry: true }), E('jarLid', [130, 40], 12, [20, 50], [6.5, 18], { dry: true }),
  // the gate: the gatekeepers and the pilgrims coming in
  E('clothRustle', [0, GATE.c[1] + 6], 10, [24, 60], [5, 19], { dry: true }),
  // the little owl on the plain at night, a jackal far off
  E('owl', [-150, 100], 60, [50, 120], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [150, -120], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
  E('dogFar', [150, 60], 45, [60, 150], [20, 5]), E('dogFar', [-120, -130], 45, [80, 170], [21, 4.5]),
];
