// Where Mycenae's sounds are (docs/settlements/mycenae.md §16.3): the places of its emitters and the geometry the audio engine needs to put each sound where it is made — the sentries'
// calls on the walls, the bard's lyre in the Great Court and the megaron, the smith's hammer and bellows, the potter's wheel, the weaver's loom weights and the querns of the open houses,
// the stores of jars, the spring's basin, the drovers at the halt, the threshing floors in the fields, the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-mycenae.js). Coordinates: metres, +x east, +z south.
// What the scheduler asks of a map but Mycenae has not (no canals, ponds, bridges or street walkers of Suzhou; no stream) is answered with nothing.
import '../../engine/voices-mycenae.js';
import { RADIUS, PALACE, PAL_Y, GCA, TREAS, lots, inRect, sdCircuit } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the approach road). */
export const HOME = [-136, 0];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const WORK = {
  house: [['kitchen', [14, 30], [5.5, 20]], ['myQuern', [60, 120], [5.5, 10]]],
  store: [['jarLid', [30, 70], [6.5, 17.5]], ['pour', [50, 110], [7, 17]]],
  potter: [['wheel', [24, 50], [6.5, 17]], ['clay', [12, 28], [6.5, 17]]],
  smith: [['hammer', [12, 30], [6.5, 17.5]], ['myBellows', [20, 50], [6.5, 17.5]]],
  weaver: [['myLoomWeights', [12, 28], [6.5, 18]]],
  oil: [['pour', [24, 50], [7, 17]], ['jarLid', [60, 120], [7, 17]]],
  ivory: [['chisel', [30, 80], [7, 17]]],
  perfume: [['myQuern', [40, 90], [7, 17]], ['pour', [50, 110], [7, 17]]],
  cult: [['clothRustle', [60, 140], [6, 19]]],
  guard: [['clothRustle', [40, 100], [0, 24]]],
};
const useOf = (l) => (l.kind === 'workshop' ? l.trade : l.kind);
let SITES = null;
/** The houses with sounds (the opened ones on the walk and the citadel's own): { use, rect, at: [x, z] (the middle), id: 'lot:<seed>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) { const use = useOf(l); if ((l.open || l.inside) && WORK[use]) SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[use], y: l.y }); }
  // the palace's wings: the magazines of oil and wine with the archive above, the suites with an ivory-carver's bench and the perfumer's cauldron
  for (const [id, use, r, work] of WINGS) SITES.push({ use, rect: r, at: mid(r), id, work, y: PAL_Y });
  return SITES;
}
const WINGS = [
  ['room:smagazine', 'magazine', [30, 16, 56, 30], [['jarLid', [30, 70], [7, 17]], ['pour', [40, 90], [7, 17]]]],
  ['room:nsuite', 'suite', [30, -28, 56, -10], [['chisel', [30, 80], [7, 17]], ['myQuern', [60, 120], [6, 12]]]],
  ['room:omagazine', 'magazine', [56, -28, 84, -2.9], [['jarLid', [30, 70], [7, 17]], ['pour', [40, 90], [7, 17]]]],
  ['room:psuite', 'suite', [56, 8.9, 84, 30], [['myQuern', [40, 90], [7, 17]], ['pour', [50, 110], [7, 17]]]],
];

/** The spring's basin at the cross of the lanes near the approach, and the spring in the lower town (town.js hillside()). */
export const WELLS = [[-126, 7]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const M = PALACE.megaron, xP = M.x0 + 6.4, xH = xP + 0.9 + 3.7 + 0.9;
const ROOM_RECTS = [
  ['room:hall', 'megaron', [xH, M.z0 + th0(), M.x1 - M.th, M.z1 - M.th]],
  ['room:porch', 'porch', [M.x0, M.z0 + th0(), xP, M.z1 - M.th]],
  ['room:gate', 'passage', [-91, -1.55, -82, 1.55]],
];
function th0() { return M.th; }
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.9, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (a flat clay roof), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [280, 0.2], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };
export const ROOMS = {
  house: { ...R0, tone: [320, 0.3], work: [['kitchen', 30]] },
  store: { ...R0, tone: [240, 0.2], work: [['jarLid', 50]] },
  potter: { ...R0, tone: [320, 0.3], hush: 0.9, work: [['clay', 14]] },
  smith: { ...R0, tone: [420, 0.4], hush: 1.0, work: [['hammer', 30], ['myBellows', 24]] },
  weaver: { ...R0, work: [['myLoomWeights', 14]] },
  oil: { ...R0, tone: [260, 0.25], work: [['pour', 30]] },
  ivory: { ...R0, work: [['chisel', 40]] },
  perfume: { ...R0, work: [['myQuern', 40]] },
  cult: { tone: [200, 0.2], roof: 0.9, hush: 0.6, work: [['clothRustle', 90]] },
  guard: { ...R0, tone: [300, 0.25], hush: 0.9, work: [['clothRustle', 60]] },
  magazine: { tone: [200, 0.2], roof: 0.9, hush: 0.7, work: [['jarLid', 50]] },
  suite: { tone: [240, 0.2], roof: 0.9, hush: 0.8, work: [['myQuern', 40]] },
  megaron: { tone: [180, 0.2], roof: 0.8, hush: 0.5, work: [['myLyre', 80]] },
  porch: { tone: [260, 0.2], roof: 0.8, hush: 0.9, work: [['clothRustle', 70]] },
  passage: { tone: [200, 0.2], roof: 0.5, hush: 0.9, work: [['clothRustle', 90]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the olives and figs about the lower town's lanes, the pines of the slopes; none inside the walls. */
export function greenNear(x, z) {
  if (sdCircuit(x, z) < 0) return 0.1;
  const rim = sm(RADIUS - 150, RADIUS - 50, Math.hypot(x, z));
  return Math.max(0.3, rim * 0.85);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the olives of the terraces and the pines of the slopes, never within the walls or the Treasury's mound. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && sdCircuit(px, pz) > 12 && Math.hypot(px - TREAS.x, pz - TREAS.z) > 20 && hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.3) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the halt on the approach road and the lanes, the Great Court less, little inside the walls' quiet corners and at the rim. */
export function townNear(x, z) {
  if (inRect([-140, -12, -104, 12], x, z)) return 1;
  if (inRect(PALACE.court, x, z, 4)) return 0.4;
  if (sdCircuit(x, z) < 0) return 0.3;
  return Math.max(0.12, 0.85 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
// what Mycenae has none of (the engine's scheduler asks, and is answered with nothing)
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
export const EMITTERS = [
  // the bard's lyre in the Great Court, at the altar, in the forenoon and at the evening meal
  E('myLyre', [43.5, 3], 26, [60, 140], [8, 17], { rainMax: 0.3, after: true }),
  // the sentries' calls from the bastion and the end of the wall over the approach, from the wall of the north gate, and at the propylon
  E('myGuardCall', [-99, 7], 40, [50, 120], [0, 24], { rainMax: 0.6 }), E('myGuardCall', [-98, -7], 40, [70, 150], [0, 24], { rainMax: 0.6 }), E('myGuardCall', [26.5, 3], 26, [90, 200], [0, 24], { rainMax: 0.5 }),
  // the drovers at the halt on the approach road, and the pack-asses' train going up
  E('myDrover', [-124, -6], 30, [40, 110], [6, 18], { rainMax: 0.5 }), E('myDrover', [-176, 0], 30, [70, 160], [6, 18], { rainMax: 0.5 }),
  // the women at the spring's basin
  E('wellBucket', [-126, 8], 10, [30, 80], [6, 18], { dry: true }), E('clothRustle', [-125, 9], 8, [20, 50], [7, 16], { dry: true }),
  // the stores of jars at the palace's magazines, heard from the Great Court
  E('jarLid', [43, 16.5], 12, [40, 100], [7, 17]),
  // winnowing on the threshing floors of the fields west and south-west, in the weeks of the harvest
  E('myWinnow', [-160, 60], 24, [40, 100], [6, 19], { dry: true }), E('myWinnow', [-170, -50], 24, [50, 120], [6, 19], { dry: true }),
  // the little owl on the hills at night
  E('owl', [-150, -70], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [100, 110], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void GCA;
