// Where Kilwa's sounds are (docs/settlements/kilwa.md §22.3): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the surf on the reef and the beach, the shipwrights' adze and the boatmen's chant at the landing places, the drum and the reed at the evening before the
// mosque, the Qur'an recited in the school and the hall, the mortars and the trades of the open houses, the wells, the lute in the sultan's court, the rooms one can
// be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-kilwa.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout]
import '../../engine/voices-kilwa.js';
import { RADIUS, MOSQUE, COURTS, MOSQUE_STREET, lots, isOpen, inRect, height } from './layout.js';
import { houseFacts } from '../../styles/swahili/house.js';

/** Where the audio puts the listener when the engine gives none (the arrival in the hall). */
export const HOME = [-9.95, 32.5];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const shoreAt = (x) => -120 - 15 * Math.sin(x / 60);

/** The work heard from each trade of the open houses: [voice, gap in seconds [min, max], hours [from, to]]. */
const WORK = {
  plain: [['kwMortar', [50, 110], [5.5, 10]], ['kitchen', [20, 50], [5.5, 20]]],
  cook: [['kwMortar', [30, 70], [5.5, 18]], ['kitchen', [14, 30], [5.5, 20]]],
  water: [['pour', [30, 70], [6, 17]]],
  fisher: [['clothRustle', [30, 70], [5.5, 17]]],
  cloth: [['clothRustle', [24, 60], [7, 17.5]], ['coin', [60, 140], [7, 17.5]]],
  jars: [['jarLid', [24, 60], [7, 17.5]], ['coin', [70, 150], [7, 17.5]]],
  ivory: [['chisel', [30, 70], [7, 17]], ['coin', [80, 160], [7, 17]]],
  rope: [['clothRustle', [40, 90], [6, 17]]],
  copra: [['jarLid', [40, 90], [6, 17]]],
  potter: [['clay', [14, 34], [6.5, 17]]],
  carpenter: [['kwAdze', [20, 50], [6.5, 17.5]]],
  spice: [['jarLid', [30, 70], [7, 17.5]], ['pour', [60, 120], [7, 17]]],
  beads: [['coin', [40, 100], [7, 17.5]]],
};
let SITES = null;
/** The open houses with sounds: { use (the trade), rect, at: [x, z] (the middle), id: 'lot:<seed>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!isOpen(l) || l.dh > 190) continue;
    const t = houseFacts({ t: 'swahili_house', ...l, open: true, duka: false }).trade, use = WORK[t] ? t : 'plain';
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[use], y: l.y });
  }
  // the school before the mosque and the hall's reciters
  SITES.push({ use: 'hall', rect: MOSQUE, at: [-14.6, 22.5], id: 'room:hall', work: [['kwRecite', [30, 80], [5, 21]]], y: height(-10, 15) });
  return SITES;
}

/** The wells: before the mosque's north door, the palace's domestic court. */
export const WELLS = [[5.2, MOSQUE_STREET[3] + 4.8], [181, -114]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (lime concrete on poles; the hall's domes), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.8, hush: 0.75, work: [['clothRustle', 50]] };
export const ROOMS = {
  plain: { ...R0, work: [['kwMortar', 60]] }, cook: { ...R0, tone: [340, 0.3], work: [['kitchen', 24]] }, water: { ...R0, work: [['pour', 40]] }, fisher: R0, cloth: R0,
  jars: { ...R0, work: [['jarLid', 40]] }, ivory: { ...R0, work: [['chisel', 40]] }, rope: R0, copra: { ...R0, work: [['jarLid', 50]] }, potter: { ...R0, work: [['clay', 20]] },
  carpenter: { ...R0, tone: [380, 0.35], hush: 0.9, work: [['kwAdze', 24]] }, spice: { ...R0, work: [['jarLid', 40]] }, beads: { ...R0, work: [['coin', 60]] },
  hall: { tone: [200, 0.2], roof: 0.5, hush: 0.55, work: [['kwRecite', 40]] },
};
export const UPPER = { tone: [230, 0.15], roof: 1.1, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the palms along the beach and among the houses, the baobabs and fields behind the town. */
export function greenNear(x, z) { return Math.max(0.35, 0.8 * sm(RADIUS - 220, RADIUS - 100, Math.hypot(x, z)), 0.7 * (1 - sm(0, 40, Math.abs(z - (shoreAt(x) + 25))))); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the palms behind the beach. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 10; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && pz > shoreAt(px) + 14 && hash(Math.floor(px / 10), Math.floor(pz / 10)) < 0.2 && !inRect(MOSQUE, px, pz, 2)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the market street and the mosque street most, little at the rim and on the beach's far ends. */
export function townNear(x, z) {
  const core = Math.hypot(x + 45, z + 40);
  return Math.max(0.1, 0.95 * (1 - sm(60, 230, core)));
}
// what Kilwa has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;
/** A point on the reef's edge or the tide line near the listener, for the surf's wash (the engine's lap), or null away from the sea. */
export function shoreSpot(x, z, r) {
  if (x > 100 || Math.abs(z - shoreAt(x)) > 70) return null;
  const px = x + (r() - 0.5) * 30;
  return [px, shoreAt(px) - 2];
}

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const shore = (x) => [x, shoreAt(x) - 3];
const FORE = [-26, MOSQUE_STREET[3] + 6.5];
const AUD = mid(COURTS.audience.rect);
export const EMITTERS = [
  // the surf on the reef, in reaches along the beach and at the headland's foot
  ...[-200, -120, -40, 40].map((x) => E('kwSurf', shore(x), 40, [7, 12], [0, 24], { rainMax: 1 })), E('kwSurf', [150, -178], 40, [7, 12], [0, 24], { rainMax: 1 }),
  // the drum and the reed in the evening before the mosque (yard.js: the drummer and the flute player), the lute in the sultan's court after dark
  E('kwNgoma', FORE, 26, [60, 140], [17, 21.5], { rainMax: 0.3, after: true }), E('kwZumari', [FORE[0] + 1.4, FORE[1] + 0.6], 26, [80, 180], [17, 21.5], { rainMax: 0.3, after: true }),
  E('kwLute', AUD, 22, [70, 160], [18.5, 23], { rainMax: 0.3, after: true }),
  // the Qur'an school in the shade of the palms at the mosque's south-east corner, in the morning
  E('kwRecite', [23.6, 31.5], 18, [40, 90], [6.5, 11.5], { rainMax: 0.6, after: true }),
  // the shipwrights' adze at the hulls drawn up on the beach, the boatmen's chant at the landing places
  E('kwAdze', [-150, shoreAt(-150) + 12], 24, [26, 60], [6.5, 17], { dry: true }), E('kwAdze', [-30, shoreAt(-30) + 12], 24, [30, 70], [6.5, 17], { dry: true }),
  E('kwShanty', [-140, shoreAt(-140) + 6], 36, [50, 120], [5.5, 18], { rainMax: 0.5 }), E('kwShanty', [-75, shoreAt(-75) + 6], 36, [60, 140], [5.5, 18], { rainMax: 0.5 }),
  E('kwShanty', [-60, shoreAt(-60) - 50], 50, [60, 150], [5.5, 18], { rainMax: 0.5 }),
  // the market street's coins and jars, the cloth rustled at the stalls
  E('coin', [-30, -84], 18, [20, 50], [7, 17.5], { dry: true }), E('jarLid', [-90, -84], 18, [20, 50], [7, 17.5], { dry: true }), E('clothRustle', [-60, -84], 16, [16, 40], [7, 17.5], { dry: true }),
  // the owl on the baobab ground at night
  E('owl', [-20, 120], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }),
];
