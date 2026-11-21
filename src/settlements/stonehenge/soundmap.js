// Where Stonehenge's sounds are (docs/settlements/stonehenge.md §13): the work of the builders and the feast placed where it is made — the mauls on the
// sarsen at the arrival and the men hauling another up the Avenue, the flint knappers, potters, hide-workers and quern-grinders among the houses, the open
// fires of the feast and the camps, the pigs and cattle and sheep, a drum and voices in the evening round the Southern Circle, the larks of the down by day and
// the stone-curlews at dusk, the hearths in the houses one can enter. Pure data and functions of layout.js and town.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-stonehenge.js).
// Coordinates: metres, +x east, +z south. No bell, no horse, no metal: copper and bronze are barely in Britain at 2500 BC [inferred: first Beaker metal about 2400].
// What the scheduler asks of a map but this place has not (canals, ponds, bridges, street walkers, wells) is answered with nothing.
import '../../engine/voices-stonehenge.js';
import { RADIUS, AXIS, DURR, HEEL, houses, durr, OPEN } from './layout.js';
import { soundSpots } from './town.js';

const ax = Math.cos(AXIS), az = Math.sin(AXIS), A = (s, t) => [s * ax - t * az, s * az + t * ax];
export const ARRIVE = [34, -16];
/** Where the audio puts the listener when the engine gives none (the arrival by the stones). */
export const HOME = [ARRIVE[0], ARRIVE[1]];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];

/** The work heard in a house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the household's work: the hearth, the quern, the pots]. */
const WORK = {
  house: [['sthFire', [14, 32], [0, 24]], ['sthQuern', [60, 120], [6, 11]], ['clay', [50, 110], [8, 17]]],
};
let SITES = null;
/** The houses with sounds, the open ones first: { use, rect, at, id: 'house:N', work, y (the floor), open }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  houses().forEach((h, i) => {
    const k = h.s / 2 / (Math.abs(Math.cos(h.yaw)) + Math.abs(Math.sin(h.yaw))) - 0.15, rect = [h.c[0] - k, h.c[1] - k, h.c[0] + k, h.c[1] + k];
    SITES.push({ use: 'house', rect, at: [h.c[0], h.c[1]], id: 'house:' + i, work: WORK.house, y: h.y, open: OPEN.includes(i) });
  });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const lotAt = (x, z, y) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z) && y > s.y - 0.6 && y < s.y + 2.5);
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z, y);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What the inside of a house sounds like: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a thick thatch: soft), `hush` how much of the outdoors comes through (a doorway 1.6 m wide, no door), `work`. */
export const ROOMS_SOUND = { house: { tone: [420, 0.3], roof: 0.4, hush: 0.55, work: [['sthFire', 16]] } };
export { ROOMS_SOUND as ROOMS };
export const UPPER_SOUND = { tone: [300, 0.1], roof: 0.4, hush: 0.6, work: [] };
export { UPPER_SOUND as UPPER };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the open down is grass, with scrub of gorse and hawthorn; little by the stones. */
export function greenNear(x, z) { return 0.12 + 0.25 * sm(30, 160, Math.hypot(x, z)); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.6);
/** A place for a bird to be heard from, near (x, z), or null: the scrub on the down (no tree stands there). */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > 60 && Math.hypot(px, pz) < RADIUS - 8) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's talk reaches (x, z): most at the stones and the houses and the Southern Circle, little on the empty down. */
export function townNear(x, z) {
  const hs = Math.hypot(x, z), hd = Math.hypot(x - DURR.c[0], z - DURR.c[1]), hv = Math.hypot(x - 245, z + 135);
  const [ds, dt] = durr(x, z), onAve = ds > 0 && ds < DURR.len && Math.abs(dt) < DURR.w;
  return Math.max(0.05, 0.9 * (1 - sm(30, 90, hs)), 0.9 * (1 - sm(25, 75, hd)), onAve ? 0.7 : 0, 0.7 * (1 - sm(60, 130, hv)));
}
// what this place has none of (the engine's scheduler asks, and is answered with nothing)
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
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const CRAFT = { knap: ['sthKnap', [20, 50]], pots: ['sthPaddle', [25, 60]], grind: ['sthQuern', [50, 110]], hides: ['sthScrape', [30, 70]], basket: ['sthChop', [90, 200]] };
let EM = null;
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
export function emitters() {
  if (EM) return EM;
  const S = soundSpots();
  EM = [];
  // the sarsen being dressed where the visitor arrives: mauls on the stone, flakes ticking
  const blk = A(34, 24);
  EM.push(E('sthMaul', blk, 30, [18, 40], [7, 17.5], { dry: true }), E('sthKnap', A(26, 18), 14, [24, 50], [7, 17], { dry: true }));
  // the sarsen on its sledge on the Avenue: the haulers' call and the rollers' knock
  EM.push(E('sthHaul', A(106, 0), 40, [26, 60], [7, 17], { dry: true }));
  // the places of work among the houses (one emitter of each kind, however many, at most 24)
  S.crafts.filter((c) => CRAFT[c.kind]).slice(0, 24).forEach((c) => { const [v, gap] = CRAFT[c.kind]; EM.push(E(v, c.at, 12, gap, [7, 17], { dry: true })); });
  // the open fires: a bed of crackle at every one, loud at the feast's (where a pig is on the spit)
  S.fires.slice(0, 26).forEach((f) => EM.push(E('sthFire', f.at, f.pig ? 14 : 10, [6, 14], [0, 24], { rainMax: 0.5 })));
  // the animals: pigs among the houses, oxen about the pen and the down, sheep on the flocks' grounds
  const pigs = S.animals.filter((a) => a.kind === 'pig'), oxen = S.animals.filter((a) => a.kind === 'ox'), sheep = S.animals.filter((a) => a.kind === 'sheep' || a.kind === 'goat');
  pigs.filter((_, i) => i % 3 === 0).slice(0, 10).forEach((a) => EM.push(E('sthPig', a.at, 16, [30, 80], [5, 21], { rainMax: 0.7 })));
  oxen.filter((_, i) => i % 4 === 0).slice(0, 6).forEach((a) => EM.push(E('sthLow', a.at, 30, [50, 130], [5, 21], { rainMax: 0.7 })));
  sheep.filter((_, i) => i % 6 === 0).slice(0, 6).forEach((a) => EM.push(E('sthBleat', a.at, 24, [30, 80], [6, 20], { rainMax: 0.6 })));
  // the evening at the Southern Circle (a drum, voices over it, a bone pipe) and, quieter, at the stones: the feast's gathering, not a rite we know
  EM.push(E('sthDrum', DURR.c, 70, [90, 200], [17, 23.5], { rainMax: 0.3, after: true }), E('sthSong', DURR.c, 60, [110, 240], [17.5, 23.5], { rainMax: 0.3, after: true }),
    E('sthPipe', [DURR.c[0] + 6, DURR.c[1] + 4], 50, [130, 280], [18, 23], { rainMax: 0.3, after: true }),
    E('sthDrum', [0, 0], 50, [180, 400], [18, 22], { rainMax: 0.3, after: true }));
  // the down: skylarks high over it by day in spring and summer, lapwings, and at dusk and in the night the stone-curlews
  [[-120, -90], [-60, 150], [90, 130], [160, -20], [-200, 40], [30, -180], [250, 40]].forEach((p, i) => EM.push(E('sthLark', p, 70, [14, 40], [5.5, 19], { rainMax: 0.2 })));
  EM.push(E('sthLapwing', [-90, 60], 50, [40, 100], [5, 20], { rainMax: 0.4 }), E('sthLapwing', [130, 150], 50, [50, 120], [5, 20], { rainMax: 0.4 }));
  EM.push(E('sthCurlew', [-140, -40], 90, [40, 110], [20, 4.5], { rainMax: 0.3 }), E('sthCurlew', [200, 90], 90, [60, 150], [20.5, 4], { rainMax: 0.3 }));
  return EM;
}
export const EMITTERS = emitters();
void HEEL;
