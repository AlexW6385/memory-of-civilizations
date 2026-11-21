// Where Borgund's sounds are (docs/settlements/norse-borgund.md, Round 6 §R6.3): the places of its emitters and the geometry the audio engine needs to put each
// sound where it is made — the priest's chant in the nave, the Lærdalselvi in its bed, the hearths, querns, looms and byres of the open houses, the forge and
// bellows at the priest's farm, the axe at the woodpiles, the linen washed at the river's bank, the landing's moored boats, the kulning and the lur and the
// cattle bells at the summer farms and the pastures, the swallows, crows and sparrows, the walkers on the tracks to the church and the packhorses from the river.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-norse-borgund.js). Coordinates: metres, +x east, +z south, the settlement's frame. What the scheduler asks of a map and Borgund has not (canals,
// ponds, bridges, sedan chairs, a night watchman, a market) is answered with nothing: it is a scatter of farms with no village.
import '../../engine/voices-norse-borgund.js';
import { RADIUS, FARMS, SETERS, LANDING, YARD, CHURCH as CH, RIVER, buildings, riverZ, height, inRect, smooth } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival at the churchyard's wall). */
export const HOME = [-30, -28];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** The church's floor with its gallery, in the settlement's frame (the nave, the aisles under the lean-to, the chancel and the apse). */
export const CHURCH = [CH[0] - 8.6, CH[1] - 8, CH[0] + 10.6, CH[1] + 8];

/** The work heard from each kind of open building: [voice, gap in seconds [min, max], hours [from, to]]. A hearth in a smoke-room house was kept in all night [inferred]. */
const HOME_WORK = [
  [['nbHearth', [12, 28], [0, 24]], ['nbQuern', [40, 90], [5.5, 19]]],
  [['nbHearth', [14, 30], [0, 24]], ['nbLoom', [30, 70], [7, 19]]],
  [['nbHearth', [12, 26], [0, 24]], ['kitchen', [40, 90], [5, 20]]],
];
const WORK = {
  cook: [['nbHearth', [10, 24], [0, 24]], ['kitchen', [16, 36], [5, 20]], ['jarLid', [40, 90], [6, 19]]],
  weave: [['nbHearth', [16, 34], [0, 24]], ['nbLoom', [12, 28], [6.5, 20]]],
  barn: [['nbStall', [20, 50], [0, 24]], ['nbFlail', [50, 120], [7, 17]], ['sack', [50, 110], [6.5, 18]]],
  smithy: [['hammer', [8, 20], [6.5, 18]], ['nbBellows', [18, 40], [6.5, 18]], ['nbHearth', [14, 30], [6, 19]]],
};
let SITES = null;
/** The open buildings with sounds: { use, rect, at: [x, z] (the middle), id: 'house:<seed>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const b of buildings()) {
    if (b.farm < 0 || !(b.kind === 'stue' || b.kind === 'barn' || b.kind === 'smithy')) continue;
    const use = b.kind === 'barn' ? 'barn' : b.kind === 'smithy' ? 'smithy' : b.use ?? 'home';
    const work = use === 'home' ? HOME_WORK[b.seed % HOME_WORK.length] : WORK[use];
    SITES.push({ use, rect: b.rect, at: mid(b.rect), id: 'house:' + b.seed, work, y: b.y });
  }
  return SITES;
}

/** The wells: none (the farms carried water from the river on the shoulder yoke; no well is built here but at a third of the yards, and those are left silent). */
export const WELLS = [];
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
  if (s) return { use: s.use, at: s.at, upper: false, same: s.id };
  if (inRect(CHURCH, x, z) && y < height(...CH) + 4) return { use: 'church', at: mid(CHURCH), upper: false, same: 'church' };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (sod and boards deaden it), `hush` how much of the outdoors comes through (thick log walls), `work` [voice, gap s]. */
const R0 = { tone: [320, 0.28], roof: 0.6, hush: 0.85, work: [['nbHearth', 12]] };
export const ROOMS = {
  home: { ...R0, work: [['nbHearth', 10], ['kitchen', 40]] },
  cook: { ...R0, tone: [340, 0.32], work: [['nbHearth', 9], ['kitchen', 20]] },
  weave: { ...R0, work: [['nbHearth', 14], ['nbLoom', 14]] },
  barn: { ...R0, tone: [300, 0.22], roof: 0.9, hush: 0.7, work: [['nbStall', 16], ['sack', 60]] },
  smithy: { ...R0, tone: [440, 0.4], hush: 0.95, work: [['hammer', 14], ['nbBellows', 26]] },
  church: { tone: [190, 0.25], roof: 0.45, hush: 0.45, work: [['nbHearth', 400]] },
};
export const UPPER = { tone: [230, 0.12], roof: 1.2, hush: 0.6, work: [['nbHearth', 16]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the hay meadows of the floor, the willows and alders of the river, the pine and spruce of the sides. */
export function greenNear(x, z) {
  const river = 1 - smooth(0, 40, Math.abs(z - riverZ(x))), side = smooth(5, 25, height(x, z));
  return Math.max(river * 0.9, side * 0.9, 0.5);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree for a bird to sing from near the listener (the birches of the yards, the willows of the bank, the forest's edge on the slopes) or null. */
export function treeSpot(x, z, r, rad = 36) {
  for (let k = 0; k < 6; k++) {
    const a = r() * Math.PI * 2, d = 8 + r() * (rad - 8), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > RADIUS - 60) continue;
    const bank = Math.abs(pz - riverZ(px)) < RIVER.w / 2 + 6, slope = height(px, pz) > 6, yard = FARMS.some(([fx, fz]) => Math.hypot(px - fx, pz - fz) < 24);
    if (bank || slope || yard) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's hubbub reaches (x, z): the churchyard after the service, nothing elsewhere (no market, no street). */
export function townNear(x, z) { return inRect(YARD, x, z, 6) ? 0.4 : 0; }
// what Borgund has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** Frogs (the common frog and the toad of spring) in the wet meadows along the river. */
export const frogGround = (x, z) => 0.5 * (1 - smooth(0, 60, Math.abs(z - riverZ(x))));

// ── the tracks: walkers from a farm to the church's gate, packhorses from the river's landing ──
const GATE = [0, YARD[3] + 1];
function farmTrack(x, z, rnd) {
  let best = null;
  for (const [fx, fz] of FARMS) { const d = Math.hypot(fx - x, fz - z); if (!best || d < best.d) best = { d, fx, fz }; }
  if (!best || best.d > 110) return null;
  const a = [best.fx, best.fz + 4], b = GATE;
  return rnd() < 0.5 ? { pts: [a, b] } : { pts: [b, a] };
}
function riverTrack(x, z, rnd) {
  const a = [LANDING.x, LANDING.top - 2], b = [GATE[0] - 3, GATE[1] + 8];
  if (Math.hypot(x - (a[0] + b[0]) / 2, z - (a[1] + b[1]) / 2) > 150) return null;
  return rnd() < 0.5 ? { pts: [a, b] } : { pts: [b, a] };
}
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.6;
export const TRACKS = [
  { key: 'nbWalkers', voice: 'nbWalkers', speed: 1.2, r50: 11, gap: [30, 75], ok: day(6, 20.5), get: farmTrack },
  { key: 'nbPack', voice: 'nbPack', speed: 1.0, r50: 13, gap: [90, 200], ok: day(6.5, 19), get: riverTrack },
];

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const CHANT = [CH[0] + 1, CH[1]];
// the priest sings the Mass in the morning and says his office at evening (the engine has no weekday: every day is read alike [inferred])
const HERDS = [[-60, -95], [120, -115], [-185, 10], [190, 75], [-120, 120], [60, 115], [-20, 60], [150, -10]];
const WASH = [-250, -190, -120, -60, 0, 60, 120, 190, 250].filter((x) => Math.abs(x) % 120 < 70).map((x) => [x, riverZ(x) - RIVER.w / 2 - 0.6]);
export const EMITTERS = [
  E('nbChant', CHANT, 15, [26, 55], [8.6, 10.8], { rainMax: 1, after: true }),
  E('nbChant', CHANT, 15, [40, 80], [17.4, 18.2], { rainMax: 1, after: true }),
  // the Lærdalselvi in its bed, in reaches along the river
  ...[-280, -210, -140, -70, 0, 70, 140, 210, 280].map((x) => E('nbRiver', [x, riverZ(x) - 8], 34, [7, 12], [0, 24], { rainMax: 1 })),
  // the linen washed at the bank, the landing's boats and rope
  ...WASH.map(([x, z]) => E('nbWash', [x, z], 10, [30, 70], [7, 17], { dry: true })),
  E('nbMoor', [LANDING.x, LANDING.top + 8], 12, [16, 40], [0, 24], { rainMax: 1 }),
  // the axe at the woodpiles of every second farm
  ...FARMS.filter((_, i) => i % 2 === 1).map(([fx, fz]) => E('nbChop', [fx - 12, fz + 4], 14, [40, 100], [6.5, 18], { dry: true })),
  // the summer farms: the kulning at milking, morning and evening, the lur at dusk and dawn
  ...SETERS.flatMap(([sx, sz], i) => [E('nbKulning', [sx, sz + 6], 60, [60, 140], [5.5, 8.2], { rainMax: 0.6, after: true }), E('nbKulning', [sx + 3, sz + 5], 60, [60, 140], [18, 21.5], { rainMax: 0.6, after: true }), ...(i === 0 ? [E('nbLur', [sx - 4, sz + 8], 80, [180, 420], [19, 21.5], { rainMax: 0.5, after: true })] : [])]),
  // the bells of the cattle at pasture, the dogs of the farms, the swallows in the yards, crows about the church and the slope, sparrows in the yards
  ...HERDS.map(([x, z], i) => E('nbCowBell', [x, z], 40, [22, 55], [6, 21], { rainMax: 0.5 + (i % 2) * 0.1 })),
  E('nbSwallow', [-6, -20], 28, [14, 34], [5, 21.5], { rainMax: 0.3 }),
  ...FARMS.filter((_, i) => i % 3 === 0).map(([fx, fz]) => E('nbSwallow', [fx, fz], 24, [18, 44], [5, 21.5], { rainMax: 0.3 })),
  E('nbCrow', [CH[0], CH[1]], 34, [30, 80], [4, 21], { rainMax: 0.5 }), E('nbCrow', [-120, -100], 40, [60, 140], [4, 21], { rainMax: 0.5 }),
  ...FARMS.filter((_, i) => i % 2 === 0).map(([fx, fz]) => E('nbSparrow', [fx + 4, fz + 12], 14, [14, 36], [4.5, 21.5], { rainMax: 0.4 })),
  E('nbSparrow', [-24, -30], 14, [14, 34], [4.5, 21.5], { rainMax: 0.4 }),
  // the owl of the wooded sides at night (short in summer at 61° N: the engine's own voice)
  E('owl', [-140, -150], 60, [50, 120], [22, 3.5], { rainMax: 0.4 }), E('owl', [160, -140], 60, [70, 160], [22.5, 3], { rainMax: 0.4 }),
];
