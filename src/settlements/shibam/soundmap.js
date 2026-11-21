// Where Shibam's sounds are (docs/settlements/shibam.md §18): the places of the emitters and the geometry the audio engine needs (soundscape.js's
// `LIFE.map`, the interface of Suzhou's map): the well and the stalls of the square, the shops by trade along its south edge and the main street, the
// coffee house, the brickyard by the gate, the donkeys at their posts, the hawkers' and drivers' cries, the oud in a majlis and the hand drum in the
// square in the evening, the recitation in the mosque's hall, the wells of the palm gardens, the rooms one can be inside. Pure data and functions of
// layout.js (no three.js). Coordinates: metres, +x east, +z south, the settlement's frame. The call to prayer is the engine's (`adhan: 1` in the profile).
// [inferred throughout; what is [stated] is in the dossier.]
import '../../engine/voices-shibam.js';
import { RADIUS, WALL, SQUARE, MOSQUE, LM, HALL, shops, ups, lots, inRect, outside, gardens, smooth } from './layout.js';
import { chanZ } from './ground.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the square). */
export const HOME = [-6, -8];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** The work heard from each trade's room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
export const WORK = {
  spice: [['mortar', [30, 70], [7, 17.5]], ['jarLid', [40, 90], [7, 17.5]]],
  cloth: [['clothRustle', [24, 60], [7, 17.5]], ['scissors', [60, 120], [8, 17]]],
  grain: [['sack', [30, 70], [6.5, 17.5]], ['pour', [50, 110], [7, 17]]],
  qahwa: [['teaClink', [14, 34], [5, 22]], ['mortar', [40, 90], [5, 10]], ['teaTalk', [30, 70], [6, 22]]],
  honey: [['pour', [40, 90], [7, 17]], ['jarLid', [50, 110], [7, 17]]],
  indigo: [['pour', [30, 70], [7, 17]], ['clothRustle', [50, 110], [7, 17]]],
  silver: [['chisel', [14, 34], [7.5, 17]], ['hammer', [40, 90], [7.5, 17]]],
  weaver: [['loom', [10, 24], [6.5, 17.5]]],
  smith: [['hammer', [10, 26], [6.5, 17.5]]],
  carpenter: [['plane', [14, 34], [6.5, 17.5]], ['chisel', [40, 90], [7, 17]]],
  jars: [['jarLid', [24, 60], [7, 17]], ['pour', [60, 120], [7, 17]]],
  tailor: [['scissors', [20, 50], [7.5, 17]], ['clothRustle', [30, 70], [7.5, 17]]],
  barber: [['scissors', [24, 60], [7.5, 17]], ['pour', [70, 140], [7.5, 17]]],
  stable: [['donkeyBray', [90, 200], [5, 19]], ['sack', [60, 120], [5.5, 18]]],
  store: [['jarLid', [30, 70], [6.5, 17.5]], ['grinder', [60, 130], [5.5, 10]]],
  mason: [['chisel', [20, 50], [6.5, 17]]],
  bakery: [['kitchen', [14, 30], [3.5, 20]]],
  mats: [['clothRustle', [24, 60], [6.5, 17]], ['broom', [60, 120], [6.5, 17]]],
};

let SITES = null;
/** The rooms with sounds: { use, rect, at: [x, z], id, work, y }: the shops' rooms by trade, the palace's hall, the mosque's hall. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of shops()) SITES.push({ use: 'shop:' + l.shop.trade, rect: l.shop.rect, at: mid(l.shop.rect), id: 'shop:' + l.seed, work: WORK[l.shop.trade] ?? [['jarLid', [40, 90], [7, 17]]], y: 0 });
  SITES.push({ use: 'palace', rect: HALL.rect, at: mid(HALL.rect), id: 'palace:hall', work: [['clothRustle', [40, 90], [7, 20]]], y: 0 });
  SITES.push({ use: 'mosque', rect: MOSQUE_HALL, at: mid(MOSQUE_HALL), id: 'mosque:hall', work: [['clothRustle', [60, 120], [4.5, 21]]], y: 0 });
  return SITES;
}
/** The prayer hall of the Friday mosque (the plan's `mosque_hall`: from the west wall 11 m). */
export const MOSQUE_HALL = [MOSQUE[0] + 0.9, MOSQUE[1] + 0.9, MOSQUE[0] + 11, MOSQUE[3] - 0.9];
/** The wells: the one in the square (windlass). */
export const WELLS = [[-4, -12]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const towers = () => [{ rect: LM.rect, id: 'tower:lm' }, ...ups().map((l) => ({ rect: l.rect, id: 'tower:' + l.seed }))];
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > 2.4, same: s.id };
  for (const t of towers()) if (inRect(t.rect, x, z)) return { use: 'tower', at: mid(t.rect), upper: y > 2.8, same: t.id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a flat mud roof on palm beams: dull), `hush` how much of the outdoors comes through (thick mud walls), `work`. */
const R0 = { tone: [240, 0.2], roof: 0.5, hush: 0.8 };
export const ROOMS = { tower: { ...R0, tone: [220, 0.18], hush: 0.7, work: [['clothRustle', 60], ['kitchen', 60]] }, palace: { tone: [200, 0.2], roof: 0.4, hush: 0.6, work: [['clothRustle', 90]] }, mosque: { tone: [180, 0.25], roof: 0.4, hush: 0.55, work: [['clothRustle', 90]] } };
for (const [t, w] of Object.entries(WORK)) ROOMS['shop:' + t] = { ...R0, tone: t === 'smith' || t === 'silver' ? [420, 0.4] : [280, 0.25], hush: t === 'smith' ? 1.0 : 0.85, work: w.slice(0, 1).map(([v, g]) => [v, g[0]]) };
export const UPPER = { tone: [210, 0.12], roof: 0.9, hush: 0.6, work: [['clothRustle', 50]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): none inside the wall ("no gardens"), the palm groves of the wadi floor outside it. */
export function greenNear(x, z) {
  const o = outside(x, z);
  return Math.max(0.03, 0.9 * smooth(6, 40, o) * (1 - smooth(RADIUS - 30, RADIUS + 10, Math.hypot(x, z))) + 0.05);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.95);
/** A date palm to put a bird in, near (x, z), or null: the palms stand in the walled plots outside the town. */
export function treeSpot(x, z, rnd, reach = 40) {
  const G = gardens(chanZ).filter((g) => Math.hypot(Math.max(g.rect[0] - x, 0, x - g.rect[2]), Math.max(g.rect[1] - z, 0, z - g.rect[3])) < reach);
  if (!G.length) return null;
  const g = G[Math.floor(rnd() * G.length)];
  return [g.rect[0] + 2 + rnd() * (g.rect[2] - g.rect[0] - 4), g.rect[1] + 2 + rnd() * (g.rect[3] - g.rect[1] - 4)];
}
/** 0…1: how much of the town's hubbub reaches (x, z): all in the square, the main street from the gate and the streets by the square, less in the alleys, little outside. */
export function townNear(x, z) {
  if (inRect(SQUARE, x, z, 6)) return 1;
  if (Math.abs(x + 9.5) < 5 && z > 2 && z < 98) return 0.8;
  const o = outside(x, z);
  if (o <= 0) return 0.5;
  return Math.max(0.08, 0.5 * (1 - smooth(0, 60, o)));
}
// what Shibam has none of (the engine's scheduler asks, and is answered with nothing): no canal, pond, bridge or street walker of Suzhou's
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
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`, `inside`, `id`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const GW = () => gardens(chanZ).filter((g, i) => i % 3 === 0).slice(0, 5).map((g) => mid(g.rect));
export const EMITTERS = [
  // the well in the square: the windlass and the bucket, from first light to dusk
  E('wellBucket', [-4, -12], 12, [28, 70], [5, 18], { dry: true, id: 'square:well' }),
  // the donkeys tethered at the square's west side and at the foot of the merchant's house, a brayer by the gate
  E('donkeyBray', [-27.8, -3.6], 24, [90, 200], [5.5, 18], { dry: true, id: 'square:donkey' }),
  E('donkeyBray', [40.6, -25.6], 18, [110, 240], [5.5, 18], { dry: true, id: 'lm:donkey' }),
  E('donkeyBray', [-12, 106], 26, [100, 220], [5.5, 18], { dry: true, id: 'gate:donkey' }),
  // the cries in the square and the main street: drivers, sellers, a woman calling from a high window
  ...[[-20, -20], [10, -22], [20, -6], [-12, -4]].map((p, i) => E('shbCall', p, 14, [22 + i * 4, 56], [6, 18.5], { dry: true, id: 'call:sq' + i })),
  ...[[-9.5, 20], [-9.5, 45], [-9.5, 70], [-9.5, 92]].map((p, i) => E('shbCall', p, 14, [30 + i * 5, 70], [6, 18.5], { dry: true, id: 'call:st' + i })),
  // the brickyard outside the gate: bricks pressed in their moulds and struck off
  E('shbBrick', [26, 108], 18, [4, 12], [6.5, 17.5], { dry: true, id: 'brickyard' }),
  E('shbCall', [30, 107], 16, [40, 90], [6.5, 17.5], { dry: true, id: 'brickyard:call' }),
  // the mosque's hall: the Qur'an recited low at the hours of prayer and between
  E('recite', mid(MOSQUE_HALL), 12, [90, 170], [4.5, 21], { inside: 'mosque:hall', after: true, id: 'mosque:recite' }),
  // the evening: the hand drum and clapping in the square (a gathering of men), a lone oud from the merchant's majlis
  E('shbDan', [18, -9], 22, [150, 320], [18, 22.5], { dry: true, after: true, id: 'square:dan' }),
  E('shbOud', mid(LM.rect), 16, [140, 300], [19, 23], { dry: true, after: true, id: 'lm:oud' }),
  // the wells of the palm gardens: a bucket on a pulley, a donkey walking out the rope
  ...GW().map((p, i) => E('wellBucket', p, 12, [35 + i * 6, 80], [5, 17.5], { dry: true, id: 'garden:well' + i })),
  ...GW().map((p, i) => E('donkeyBray', [p[0] + 3, p[1] + 1.5], 20, [120 + i * 20, 260], [5.5, 18], { dry: true, id: 'garden:donkey' + i })),
  // the night: cats on the roofs, dogs far off, the owl in the palms
  ...[[-60, -10], [40, 30], [-20, 60], [70, -50]].map((p, i) => E('catCry', p, 26, [80 + i * 20, 200], [22, 4.5], { dry: true, id: 'cat' + i })),
  ...[[-150, 20], [120, 90], [0, 125]].map((p, i) => E('dogFar', p, 40, [60 + i * 15, 150], [23, 4.5], { dry: true, id: 'dog' + i })),
  E('owl', [-100, 140], 60, [60, 140], [21, 4.5], { rainMax: 0.4, id: 'owl' }),
];
void lots; void WALL;
