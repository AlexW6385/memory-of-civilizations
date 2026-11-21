// Where Ubirr's sounds are (docs/settlements/kakadu.md §15.3): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the fires' crackle at each hearth, the grinding at the grindstones, stone axes at the bark piles, plaiting at the shelters' doors, the billabong's
// edge, the magpie geese and the whistling ducks on the water (dawn and dusk most), a kite over the rock, a didgeridoo and clapsticks at the evening fire,
// a curlew and a dingo in the night, and the shelters one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-kakadu.js). Coordinates: metres, +x east, +z south.
// No bell, no cart, no street, no canal: what the scheduler asks of a map but Ubirr has not is answered with nothing.
import '../../engine/voices-kakadu.js';
import { RADIUS, MAIN, SMALL, POOL, HOLLOWS, CAMPS, HOUSES, HOUSE_SIZE, groves, inRect, poolD } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival before the Main Gallery). */
export const HOME = [-1, -13];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of shelter: [voice, gap in seconds [min, max], hours [from, to]] [inferred: the fire inside, the plaiting at the door]. */
const WORK = {
  bark: [['kakCrackle', [8, 20], [0, 24]], ['kakPlait', [40, 90], [7, 17]]],
  dome: [['kakCrackle', [8, 20], [0, 24]], ['kakPlait', [50, 110], [7, 17]]],
  shade: [['kakCrackle', [10, 24], [0, 24]], ['kakGrind', [60, 120], [6, 11]]],
  rock: [['kakCrackle', [10, 24], [0, 24]]],
};
let SITES = null;
/** The places one can be inside, with the work heard from each: { use, rect, at, id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  HOUSES.forEach((Hs, i) => {
    const B = HOUSE_SIZE[Hs.kind], m = Math.max(B.hw, B.hd), rect = [Hs.at[0] - m, Hs.at[1] - m, Hs.at[0] + m, Hs.at[1] + m];
    SITES.push({ use: Hs.kind, rect, at: [...Hs.at], id: 'shelter:' + i, work: WORK[Hs.kind], y: 0 });
  });
  for (const [id, S] of [['main', MAIN], ['small', SMALL]]) { const rect = [S.x0 - 1, S.zb, S.x1 + 1, S.zl]; SITES.push({ use: 'rock', rect, at: [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2], id: 'rock:' + id, work: WORK.rock, y: S.floor }); }
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

/** The place the listener is inside, from its position: { use, at, upper, same } or null in the open. The rock shelters have no door: only close under the roof. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) {
    if (!inRect(s.rect, x, z) || y < s.y - 0.6 || y > s.y + 3.4) continue;
    if (s.use === 'rock' && z > s.rect[3] - 0.5) continue;
    return { use: s.use, at: s.at, upper: false, same: s.id };
  }
  return null;
}
/** What each kind of place sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (bark: loud, the rock: none), `hush` how much of the outdoors comes through, `work`. */
const R0 = { tone: [1400, 0.12], roof: 0.7, hush: 0.35, work: [['kakCrackle', 10]] };
export const ROOMS_SOUND = {
  bark: { ...R0, tone: [1200, 0.15], roof: 0.8, hush: 0.3 },
  dome: { ...R0, tone: [1000, 0.15], roof: 0.65, hush: 0.4 },
  shade: { ...R0, tone: [2200, 0.08], roof: 0.5, hush: 0.15, work: [['kakCrackle', 12]] },
  rock: { ...R0, tone: [2600, 0.1], roof: 0.1, hush: 0.1, work: [['kakCrackle', 14]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER_SOUND = ROOMS_SOUND.bark;
export { UPPER_SOUND as UPPER };

// ── the planting, the town ──────────────────────────────────────────────────
const PAPER = groves().paper;
/** 0…1: how much green round (x, z): the paperbark and pandanus of the billabong and the hollows; the open woodland and the rock little. */
export function greenNear(x, z) {
  const pool = 1 - sm(0.9, 1.9, poolD(x, z)), hol = HOLLOWS.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 14) ? 0.6 : 0;
  return Math.max(pool * 0.85, hol, 0.2);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.8);
/** A tree to put a bird or cicada in, near (x, z), or null: the paperbarks of the billabong. */
export function treeSpot(x, z, rnd, reach = 40) {
  const near = PAPER.filter((p) => Math.hypot(p[0] - x, p[1] - z) < reach + 6);
  if (!near.length) return null;
  const p = near[Math.floor(rnd() * near.length) % near.length];
  return [p[0], p[1]];
}
/** 0…1: how much of the people's talk reaches (x, z): the camps and the apron most, the plain little. */
export function townNear(x, z) {
  let b = 0.06;
  for (const C of CAMPS) b = Math.max(b, 0.8 * (1 - sm(4, 30, Math.hypot(x - C.c[0], z - C.c[1]))));
  if (inRect([MAIN.x0, MAIN.zb, MAIN.x1, MAIN.zl + 6], x, z)) b = Math.max(b, 0.7);
  return Math.min(1, b);
}
// what Ubirr has none of
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** A point on the billabong's or a hollow's margin within `reach` of (x, z), or null (frogs, the fish). */
export function pondSpot(x, z, rnd, reach = 30) {
  for (let k = 0; k < 10; k++) { const a = rnd() * Math.PI * 2, p = [POOL.c[0] + Math.cos(a) * POOL.a * 0.97, POOL.c[1] + Math.sin(a) * POOL.b * 0.97]; if (Math.hypot(p[0] - x, p[1] - z) < reach) return p; }
  return null;
}
/** A point on the shore near (x, z) for the wavelets, or null. */
export const shoreSpot = (x, z, rnd) => pondSpot(x, z, rnd, 22);
/** Frogs by the water (few in the dry season, more at dusk: the engine's hour weighting). */
export const frogGround = (x, z) => (poolD(x, z) < 1.5 || HOLLOWS.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 16) ? 0.4 : 0) * (Math.hypot(x, z) < RADIUS ? 1 : 0);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const margin = (a, f = 1.02) => [POOL.c[0] + Math.cos(a) * POOL.a * f, POOL.c[1] + Math.sin(a) * POOL.b * f];
const GRIND = [[-11, -28.9], [5.7, -32.9], [-58.3, -34.2]];
export const EMITTERS = [
  // the hearths: crackle by day and night
  ...CAMPS.map((C) => E('kakCrackle', [C.fire[0], C.fire[1]], 7, [6, 14], [0, 24], { rainMax: 0.8 })),
  // seed grinding in the mornings: at the camps that have a grindstone and the three on the shelters' floors
  ...CAMPS.filter((C) => C.grind).map((C) => E('kakGrind', [C.fire[0] + 1, C.fire[1] - 1], 11, [40, 90], [6, 11], { dry: true })),
  ...GRIND.map(([x, z]) => E('kakGrind', [x, z], 10, [40, 90], [6, 11], { dry: true })),
  // stone axes at the stacks of bark and firewood by the camps
  ...CAMPS.filter((_, i) => i % 2 === 0).map((C) => E('kakAxe', [C.fire[0] - 3, C.fire[1] - 1.8], 16, [40, 100], [7, 16], { dry: true })),
  // the billabong's edge: wavelets in reaches round it
  ...[0.4, 1.5, 2.6, 3.7, 4.8, 5.8].map((a) => E('kakLap', margin(a), 14, [7, 14], [0, 24], { rainMax: 1 })),
  // magpie geese crowded on the water, loud at dawn and at dusk
  ...[0.9, 2.4, 3.9, 5.3].map((a) => E('kakGoose', margin(a, 0.7), 45, [14, 34], [4.5, 20], { rainMax: 0.7 })),
  E('kakGoose', margin(3.0, 0.5), 50, [10, 22], [5, 8], { rainMax: 0.7 }), E('kakGoose', margin(1.2, 0.5), 50, [10, 22], [17, 19.5], { rainMax: 0.7 }),
  // plumed whistling-ducks packed on the mud
  ...[0.5, 3.9, 5.5].map((a) => E('kakWhistle', margin(a, 1.2), 32, [16, 44], [5, 19], { rainMax: 0.7 })),
  // a whistling kite over the rock
  E('kakKite', [40, -45], 70, [30, 90], [8, 17], { rainMax: 0.3 }), E('kakKite', [-20, -15], 70, [50, 130], [8, 17], { rainMax: 0.3 }),
  // the evening: a man playing the didgeridoo at the fire of the camp at the gallery's west end, the clapsticks with it
  E('kakDrone', [CAMPS[0].fire[0], CAMPS[0].fire[1]], 34, [140, 300], [18, 22.5], { rainMax: 0.3, after: true }),
  E('kakClap', [CAMPS[0].fire[0] + 1, CAMPS[0].fire[1] + 1], 30, [160, 340], [18, 22.5], { rainMax: 0.3, after: true }),
  // the night: curlews on the plain, a dingo far off
  E('kakCurlew', [-50, 40], 70, [40, 110], [19.5, 4.5], { rainMax: 0.4 }), E('kakCurlew', [60, 55], 70, [60, 140], [20, 4], { rainMax: 0.4 }),
  E('kakHowl', [-80, 70], 100, [90, 260], [20, 5], { rainMax: 0.3 }), E('kakHowl', [85, 40], 100, [120, 300], [21, 4.5], { rainMax: 0.3 }),
];
