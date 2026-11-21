// Where Nan Madol's sounds are (docs/settlements/nan-madol.md §14.3): the places of its emitters and the geometry the audio engine needs to put each
// sound where it is made — the sakau pounded at the stones of Nandauwas, the chant and the conch from its inner court, adzes at the shipyard, grating
// and the press at the oil works, the earth ovens, breadfruit pounded on boards, surf on the reef beyond the sea wall, water against the canals' walls,
// canoes passing on the canals, the nahs one can sit inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-nan-madol.js). Metres, +x east, +z south.
// [inferred throughout: no recording or eyewitness of the place c. 1300; the sakau and its call are from Dana Lee Ling, as the dossier §7.]
// No bell, no horse, no street walker, no well, no bridge: none was there (people crossed by canoe or waded the fords).
import '../../engine/voices-nan-madol.js';
import { RADIUS, ISLETS, CANALS, SAKAU, FORECOURT, village, cooks, inland, inRect } from './layout.js';
import { ARRIVALS } from '../../planet/arrivals.js';

const A = ARRIVALS['nan-madol'];
/** Where the audio puts the listener when the engine gives none (the arrival). */
export const HOME = [A[0], A[2]];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
const dist = (p, x, z) => Math.hypot(p[0] - x, p[1] - z);

// ── the rooms: the nahs (open on one side, under a deep thatch), the chief's hall, the landing's store ──
const WORK = {
  nah: [['clothRustle', [60, 130], [6, 21]], ['bowlClack', [50, 120], [6, 20]]],
  hall: [['bowlClack', [60, 140], [6, 21]]],
  store: [['sack', [30, 70], [6, 17]]],
};
let SITES = null;
/** The rooms with sounds: { use, rect, at: [x, z], id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const v = village();
  v.houses.forEach((h, k) => {
    const swap = Math.abs(Math.sin(h.yaw)) > 0.5, hw = (swap ? h.l : h.w) / 2, hl = (swap ? h.w : h.l) / 2, rect = [h.c[0] - hw, h.c[1] - hl, h.c[0] + hw, h.c[1] + hl];
    SITES.push({ use: 'nah', rect, at: [h.c[0], h.c[1]], id: 'nah:' + k, work: WORK.nah, y: 0 });
  });
  for (const k of v.works) {
    if (k.kind !== 'hall' && k.kind !== 'landing') continue;
    const swap = Math.abs(Math.sin(k.yaw)) > 0.5, hw = (swap ? k.w : k.l) / 2, hl = (swap ? k.l : k.w) / 2, rect = [k.c[0] - hw, k.c[1] - hl, k.c[0] + hw, k.c[1] + hl], use = k.kind === 'hall' ? 'hall' : 'store';
    SITES.push({ use, rect, at: [k.c[0], k.c[1]], id: use + ':' + k.islet, work: WORK[use], y: 0 });
  }
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  const s = (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((q) => inRect(q.rect, x, z) && y < 3);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What each room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain on the thatch (loud), `hush` how much of the outdoors comes through (the nahs are open on one side), `work`. */
export const ROOMS_SOUND = {
  nah: { tone: [700, 0.1], roof: 1.0, hush: 0.95, work: [['clothRustle', 60]] },
  hall: { tone: [450, 0.2], roof: 1.2, hush: 0.85, work: [['bowlClack', 70]] },
  store: { tone: [550, 0.15], roof: 1.0, hush: 0.9, work: [['sack', 40]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER = ROOMS_SOUND.nah;

// ── the waters ──
/** The nearest point of the canals' water to (x, z), the distance and the canal's index. */
export function canalSpot(x, z) {
  let best = null;
  CANALS.forEach((r, i) => { const p = nearIn(r, x, z), d = dist(p, x, z); if (!best || d < best.d) best = { p, d, i }; });
  return best;
}
/** A canoe's track on a canal: the centre line of the reach nearest to (x, z), passing the nearest point; null if none within `reach`. */
export function canalTrack(x, z, rnd, reach = 80, lead = 36) {
  const c = canalSpot(x, z);
  if (!c || c.d > reach) return null;
  const r = CANALS[c.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 6, hi = (horiz ? r[2] : r[3]) - 6, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 14) return null;
  return horiz ? { pts: [[a, mid], [b, mid]] } : { pts: [[mid, a], [mid, b]] };
}
// what Nan Madol has none of (the engine's scheduler asks, and is answered with nothing)
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** Water lapping at the sea wall's foot, on the nearest of the sea wall's islets within reach. */
export function shoreSpot(x, z, rnd, reach = 24) {
  let best = null;
  for (const s of ISLETS) if (s.kind === 'seawall') { const p = nearIn(s.rect, x, z), d = dist(p, x, z); if (d < reach && (!best || d < best.d)) best = { p, d }; }
  return best ? [best.p[0] + (rnd() - 0.5) * 6, best.p[1] + (rnd() - 0.5) * 6] : null;
}

// ── the planting, the town ──
/** 0…1: how much green round (x, z): the islets under their palms, the mangroves of the shore. */
export function greenNear(x, z) {
  const onIslet = ISLETS.some((s) => s.kind !== 'landmark' && inRect(s.rect, x, z, 4)) ? 0.6 : 0.25;
  return Math.max(onIslet, inland(x, z) > -22 ? 0.9 : 0);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A palm to put a bird in, near (x, z): a point on an islet that has houses. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && ISLETS.some((s) => (s.kind === 'commoner' || s.kind === 'priest' || s.kind === 'palace' || s.kind === 'landing') && inRect(s.rect, px, pz, -2))) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's talk reaches (x, z): the islets with their households most, the open water little. */
export function townNear(x, z) {
  if (ISLETS.some((s) => s.kind !== 'seawall' && inRect(s.rect, x, z, 6))) return 0.75;
  return Math.max(0.06, 0.5 * (1 - sm(150, 260, Math.hypot(x, z))));
}
/** Frogs on the mud flat of the shore (the wet ground under the mangroves). */
export const frogGround = (x, z) => (inland(x, z) > -22 && inland(x, z) < 8 && Math.hypot(x, z) < RADIUS - 30 ? 0.6 : 0);

// ── the emitters in the open ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const sakau = SAKAU.flatMap(([x, z]) => [E('nanSakau', [x, z], 16, [70, 150], [6, 11], { dry: true, after: true }), E('nanSakau', [x, z], 16, [90, 180], [16.5, 19.5], { dry: true, after: true })]);
const works = village().works, byKind = (k) => works.filter((w) => w.kind === k);
const pounds = FORECOURT.things.filter((t) => t.k === 'pound').map((t) => E('nanBoard', t.at, 10, [30, 70], [6, 17], { dry: true, after: true }));
export const EMITTERS = [
  ...sakau,
  // the inner court: the conch at the dawn and dusk offices, the chant in the evening
  E('nanConch', [-10, -38], 70, [250, 500], [5.5, 6.5], { rainMax: 0.5, after: true }), E('nanConch', [-10, -38], 70, [250, 500], [17.5, 18.5], { rainMax: 0.5, after: true }),
  E('nanChant', [-10, -38], 36, [100, 230], [18.5, 21.5], { rainMax: 0.4, after: true }),
  // the shipyard: adzes; the oil works: grating and the press; the cook-shed and every cook-house: the earth ovens
  ...byKind('shipyard').map((w) => E('nanAdze', w.c, 16, [8, 24], [6.5, 17], { dry: true })),
  ...byKind('oilworks').flatMap((w) => [E('nanGrate', w.c, 12, [14, 36], [6.5, 16.5], { dry: true }), E('nanPress', w.c, 14, [40, 90], [7, 16.5], { dry: true })]),
  ...byKind('cookshed').flatMap((w) => [E('nanUmu', w.c, 14, [25, 60], [5, 19], { dry: true }), E('kitchen', w.c, 12, [30, 70], [5.5, 18], { dry: true })]),
  ...cooks().map((k) => E('nanUmu', k.c, 9, [40, 90], [5, 19], { dry: true })),
  ...pounds,
  // surf on the reef beyond the sea wall, east and south, all the hours
  ...[[112, -70], [112, 0], [112, 70], [60, 128], [-20, 128]].map(([x, z]) => E('nanSurf', [x + 8, z + 8], 45, [6, 11], [0, 24], { rainMax: 1 })),
  // the night: a heron over the reef flat
  E('nanHeron', [-150, -75], 60, [60, 150], [20, 4.5], { rainMax: 0.3 }), E('nanHeron', [130, 60], 60, [80, 190], [20.5, 4], { rainMax: 0.3 }),
];
