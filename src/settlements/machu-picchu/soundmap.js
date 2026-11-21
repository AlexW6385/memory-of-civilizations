// Where Machu Picchu's sounds are (docs/settlements/machu-picchu.md §15): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the feast's flute, panpipes and drum on the Main Plaza, the runner's conch at the chaski's post and the priest's at the Intihuatana at dawn, the masons' hammers at
// the quarry, the ploughing teams on the terraces, the llamas, the guinea pigs and the looms of the patios, the stairway of sixteen fountains, the Urubamba far below, the houses
// one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-machu-picchu.js). Coordinates: metres, +x east, +z south, the settlement's frame.
// What the scheduler asks of a map but Machu Picchu has not (no canals of boats, ponds, bridges, street walkers) is answered with nothing.
import '../../engine/voices-machu-picchu.js';
import { RADIUS, SITE, TERRACE, PLOUGH, HUT, KALLANKA, HILL, inRect, outside, fountains, kanchas, houses, houseKind } from './layout.js';
import { SPECIAL, openHouse, openKanchas } from './walkroutes.js';
import { FIRES } from './walk.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the Guardhouse's knoll). */
export const HOME = [-21, 129.8];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of opened house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the use: docs §12.3; the engine's own voices where they fit]. */
const WORK = {
  home: [['kitchen', [14, 30], [5, 21]], ['mpGrind', [60, 120], [5.5, 10]]],
  spinner: [['mpSpindle', [10, 24], [6, 18]], ['mpLoomBatten', [24, 50], [6, 18]]],
  store: [['jarLid', [30, 70], [6, 17]], ['sack', [40, 90], [6.5, 17]]],
  brewer: [['pour', [30, 60], [6, 17]], ['kitchen', [14, 30], [5, 20]]],
  mason: [['mpStoneHammer', [8, 20], [6.5, 17]]],
  noble: [['clothRustle', [40, 90], [7, 17]]],
  priest: [['clothRustle', [50, 100], [5, 18]]],
  chaski: [['kitchen', [16, 40], [4, 22]]],
  qollqa: [['jarLid', [30, 70], [6.5, 17]], ['sack', [40, 90], [6.5, 17]]],
  kallanka: [['kitchen', [30, 70], [16, 23]], ['clothRustle', [60, 120], [6, 22]]],
};
let SITES = null;
/** The opened houses with sounds: { use, rect, at: [x, z] (the middle), id: 'lot:<n>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  houses().forEach((h, i) => { if (openHouse(i)) { const use = houseKind(h).use; if (WORK[use]) SITES.push({ use, rect: h.rect, at: mid(h.rect), id: 'lot:' + i, work: WORK[use], y: 0 }); } });
  for (const [r, , kind] of SPECIAL) if (WORK[kind]) SITES.push({ use: kind, rect: r, at: mid(r), id: 'lot:' + kind + Math.round(r[0]) + '_' + Math.round(r[1]), work: WORK[kind], y: 0 });
  SITES.push({ use: 'kallanka', rect: KALLANKA, at: mid(KALLANKA), id: 'lot:kallanka', work: WORK.kallanka, y: 0 });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  return s ? { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.2, same: s.id } : null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch: soft), `hush` how much of the outdoors comes through. */
const R0 = { tone: [260, 0.2], roof: 0.6, hush: 0.7, work: [['clothRustle', 50]] };
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  spinner: { ...R0, work: [['mpSpindle', 14]] },
  store: { ...R0, tone: [230, 0.2], work: [['jarLid', 50]] },
  brewer: { ...R0, tone: [280, 0.25], work: [['pour', 40]] },
  mason: { ...R0, tone: [340, 0.3], hush: 0.8, work: [['mpStoneHammer', 12]] },
  noble: { ...R0, tone: [220, 0.2], hush: 0.6 },
  priest: { ...R0, tone: [220, 0.2], hush: 0.6 },
  chaski: { ...R0, tone: [300, 0.3], work: [['kitchen', 30]] },
  qollqa: { ...R0, tone: [200, 0.2], hush: 0.6, work: [['jarLid', 50]] },
  kallanka: { tone: [190, 0.2], roof: 0.7, hush: 0.5, work: [['kitchen', 50]] },
};
export const UPPER = { tone: [210, 0.12], roof: 0.8, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the cloud forest on the slopes and round the peaks, the terraces' grass, the town's lanes a little. */
export function greenNear(x, z) { return Math.max(0.3, sm(-5, 50, outside(x, z)) * 0.95); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z), or null: the cloud forest below the terraces. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && outside(px, pz) > TERRACE.w * TERRACE.n + 4) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the plaza and its feast most, the lanes and kanchas a little, little at the terraces. */
export function townNear(x, z) {
  const d = Math.hypot(x - 2, z + 24);
  return Math.max(0.1, 0.55 * (1 - sm(20, 140, d)) * (1 - sm(-5, 25, outside(x, z))));
}
// what Machu Picchu has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const ring = (t, d) => [Math.cos(t) * (SITE.a + d), Math.sin(t) * (SITE.b + d)];
/** The ploughing teams' places on their terrace strips (people.js: PLOUGH, the men's line at 2.05 m before the wall's foot). */
export const PLOUGH_AT = PLOUGH.map(([t0, j, n]) => ring(t0 + (n * 0.5 * 1.35) / (SITE.b + TERRACE.w * j - 2.05) * Math.sign(Math.cos(t0) || 1), TERRACE.w * j - 2.05));
const FEAST = [5.3, -22.8];
const QUARRY = [-32, -14];
const PATIOS = [...openKanchas()].map((i) => kanchas()[i]).map((K) => K.at(K.A / 2, K.D / 2));
export const EMITTERS = [
  // the feast on the Main Plaza: the quena, the panpipes and the drum, in the afternoon and into the evening
  E('mpQuena', FEAST, 30, [60, 140], [14, 22], { rainMax: 0.3, after: true }),
  E('mpAntara', [FEAST[0] - 2, FEAST[1] + 1.5], 30, [80, 180], [14, 22], { rainMax: 0.3, after: true }),
  E('mpWankar', [FEAST[0] + 1, FEAST[1] + 2], 34, [90, 200], [15, 22], { rainMax: 0.3, after: true }),
  // the runners' conch at the chaski's post, by day; the priests' at the Intihuatana at sunrise
  E('mpPututu', mid(HUT), 70, [90, 240], [5.5, 18], { rainMax: 0.6 }),
  E('mpPututu', HILL.c, 80, [150, 300], [5, 6.8], { rainMax: 0.6 }),
  // the masons dressing stone at the quarry
  E('mpStoneHammer', QUARRY, 22, [6, 16], [6.5, 17], { dry: true }),
  // the ploughing teams on the terraces and the calls between them
  ...PLOUGH_AT.map((p) => E('mpPlough', p, 24, [5, 12], [6, 16], { dry: true })),
  ...PLOUGH_AT.map((p) => E('mpCall', p, 40, [40, 110], [6, 16], { rainMax: 0.4 })),
  // the llamas: the herd on the plaza, the string on the way in, the grazers on the terraces
  E('mpLlama', [8, -30], 16, [14, 36], [6, 18], { rainMax: 0.7 }), E('mpLlama', [4, 98], 14, [16, 40], [6, 18], { rainMax: 0.7 }), E('mpLlama', [12, 60], 16, [18, 44], [6, 18], { rainMax: 0.7 }),
  // the guinea pigs in the patios (and the looms beside them)
  ...PATIOS.flatMap((p, i) => [E('mpCuy', p, 8, [10, 30], [5, 19], { rainMax: 0.6 }), E('mpLoomBatten', [p[0], p[1] + (i % 2 ? 3 : -3)], 9, [20, 50], [6.5, 17], { dry: true })]),
  // the stairway of fountains: every second spout, and the canal's end at the first
  ...fountains().filter((_, i) => i % 2 === 0).map((f) => E('mpSpout', f.c, 7, [4, 8], [0, 24], { rainMax: 1 })),
  // the Urubamba in its gorge, heard from all round the rim
  ...[0, 1, 2, 3, 4, 5].map((i) => E('mpRiver', [Math.cos(i * 1.05 + 0.3) * (RADIUS - 20), Math.sin(i * 1.05 + 0.3) * (RADIUS - 20)], 130, [8, 14], [0, 24], { rainMax: 1 })),
  // the kallanka's hall at the evening fire: the drum, far
  E('mpWankar', mid(KALLANKA), 20, [160, 320], [18, 23], { rainMax: 0.3 }),
  // the little owl on the slopes at night
  E('owl', [-60, -190], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [70, 150], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void FIRES;
