// Where Dunhuang's sounds are (docs/settlements/dunhuang.md §15.3): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the eave bells of the Nine-Storey building and the cave porches, the murmur of the sutra in the caves and cells, the sculptor's mallet at the scaffold, the
// smith, the oven, the potter and the cloth of the main street, the camels' bells and the pipa at the caravanserai, the shaduf at the channels, the Daquan's bed, the
// rooms one can be inside. Pure data and functions of layout.js and town.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js (the voices of src/engine/voices-dunhuang.js). Coordinates: metres, +x east, +z south, the settlement's frame.
import '../../engine/voices-dunhuang.js';
import { RADIUS, XF, ZEND, CROSS, LANE_W, TOWN, SERAI, GATE, SPRING, BEACON, THRESH, riverX, inRect } from './layout.js';
import { lots } from './town.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the main street). */
export const HOME = [14, 0];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of lot: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trades of dossier §12; the engine's own voices where they fit]. */
const WORK = {
  home: [['kitchen', [16, 34], [5.5, 20]]],
  cloth: [['clothRustle', [24, 60], [7.5, 18]]],
  grain: [['jarLid', [30, 70], [7, 18]], ['pour', [50, 110], [7, 17]]],
  pottery: [['wheel', [24, 50], [7, 17.5]], ['clay', [12, 28], [7, 17.5]]],
  smith: [['hammer', [10, 26], [7, 18]], ['dhBellows', [30, 60], [7, 18]]],
  bake: [['dhOvenSlap', [20, 45], [4.5, 12]], ['kitchen', [30, 60], [4.5, 12]]],
  wine: [['pourWine', [30, 70], [10, 22]], ['jarLid', [50, 100], [10, 22]]],
  scribe: [['clothRustle', [40, 90], [8, 18]], ['dhMurmur', [70, 150], [8, 18]]],
  saddler: [['dhMallet', [24, 50], [7.5, 17.5]]],
  drugs: [['jarLid', [30, 70], [7.5, 18]]],
};
// the caves and cells: the sutra read aloud, the sculptor's mallet
const CAVE_SITES = [
  ['room:great', 'greathall', [XF - 26, -11.5, XF, 11.5], [['dhMurmur', [40, 90], [5, 21]]]],
  ['room:hall', 'cave', [XF - 7.8, -55, XF, -49], [['dhMurmur', [60, 130], [6, 20]]]],
  ['room:pillar', 'cave', [XF - 10, -33.5, XF, -26.5], [['dhMurmur', [60, 130], [6, 20]]]],
  ['room:cell', 'cell', [XF - 5, 43.4, XF, 46.6], [['dhMurmur', [50, 110], [5, 21]], ['clothRustle', [90, 200], [5, 21]]]],
];
let SITES = null;
/** The lots and caves with sounds: { use, rect, at, id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const use = l.trade ?? 'home';
    if (l.rect[1] < -30 || l.rect[3] > 30) continue;                     // the lanes' rows are the street's neighbours: only the main street's lots sound
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[use], y: 0 });
  }
  for (const [id, use, r, work] of CAVE_SITES) SITES.push({ use, rect: r, at: mid(r), id, work, y: 0.45 });
  return SITES;
}

/** The wells at the lane mouths (town.js). */
export const WELLS = [[CROSS[0] + LANE_W / 2 + 2.6, -5], [CROSS[0] + LANE_W / 2 + 2.6, 5], [CROSS[2] + LANE_W / 2 + 2.6, -5], [CROSS[2] + LANE_W / 2 + 2.6, 5], [SERAI.x0 + 22, (SERAI.z0 + SERAI.z1) / 2]];
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
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.8, work: [['clothRustle', 50]] };   // a flat roof of earth over poles: the rain is dull
export const ROOMS = {
  home: { ...R0, tone: [320, 0.3], work: [['kitchen', 34]] },
  cloth: { ...R0, work: [['clothRustle', 40]] },
  grain: { ...R0, tone: [260, 0.2], work: [['jarLid', 50]] },
  pottery: { ...R0, tone: [340, 0.3], hush: 0.9, work: [['clay', 16]] },
  smith: { ...R0, tone: [440, 0.4], hush: 1.0, work: [['hammer', 24]] },
  bake: { ...R0, tone: [360, 0.35], work: [['dhOvenSlap', 30]] },
  wine: { ...R0, tone: [260, 0.2], work: [['pourWine', 40]] },
  scribe: { ...R0, tone: [240, 0.15], hush: 0.7, work: [['clothRustle', 60]] },
  saddler: { ...R0, work: [['dhMallet', 30]] },
  drugs: { ...R0, tone: [250, 0.2], work: [['jarLid', 50]] },
  greathall: { tone: [180, 0.25], roof: 0.5, hush: 0.5, work: [['dhMurmur', 50]] },
  cave: { tone: [200, 0.25], roof: 0.2, hush: 0.3, work: [['dhMurmur', 70]] },     // cut in the rock: no rain heard, little of the world
  cell: { tone: [220, 0.2], roof: 0.2, hush: 0.3, work: [['dhMurmur', 60]] },
};
export const UPPER = { tone: [230, 0.15], roof: 1.1, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the poplars and willows of the Daquan's banks, the fields east of the town, the Crescent Spring's reeds; the dry cliff and the dunes none. */
export function greenNear(x, z) {
  const brook = 1 - sm(0, 30, Math.abs(x - riverX(z))), fields = sm(150, 166, x) * (Math.hypot(x, z) < RADIUS - 8 ? 1 : 0), spring = 1 - sm(8, 30, Math.hypot(x - SPRING.c[0], z - SPRING.c[1]));
  return Math.max(brook * 0.8, fields * 0.7, spring * 0.7, x > XF + 8 ? 0.15 : 0.05);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z), or null: the poplars of the banks and the fields. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (Math.abs(px - riverX(pz)) < 12 || px > 152 || Math.hypot(px - SPRING.c[0], pz - SPRING.c[1]) < 16) && px > XF + 8) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the market stretch of the main street most, the lanes less, the cliff's apron little, the fields none. */
export function townNear(x, z) {
  if (x > TOWN[0] - 4 && x < TOWN[2] + 4 && Math.abs(z) < 24) return x > 18 && x < 132 ? 1 : 0.75;
  if (inRect(TOWN, x, z, 6)) return 0.5;
  if (x < XF + 9) return 0.18;
  return 0.12;
}
// what Dunhuang has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** The frogs of the Crescent Spring's reeds. */
export const frogGround = (x, z) => 0.5 * (1 - sm(6, 20, Math.hypot(x - SPRING.c[0], z - SPRING.c[1])));

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const SX = (SERAI.x0 + SERAI.x1) / 2, SZ = (SERAI.z0 + SERAI.z1) / 2;
export const EMITTERS = [
  // the eave bells of the Nine-Storey building (the wind), of the porches along the cliff and of the gate's tower
  E('dhFengling', [XF + 4, 0], 26, [9, 22], [0, 24], { rainMax: 1 }), E('dhFengling', [XF + 2.4, -52], 14, [14, 34], [0, 24], { rainMax: 1 }), E('dhFengling', [XF + 2.4, 26], 14, [14, 34], [0, 24], { rainMax: 1 }),
  E('dhFengling', [GATE.x, 0], 18, [20, 50], [0, 24], { rainMax: 1 }),
  // the sculptor's mallet and the painters at the scaffold
  E('dhMallet', [XF + 1.4, -70], 16, [20, 50], [7, 17.5], { dry: true }),
  // the camels' bells and the donkeys at the caravanserai and its gate
  E('camelString', [SX - 4, SERAI.z0 - 1], 24, [40, 100], [5, 21], { rainMax: 0.5 }), E('camelString', [SX + 14, SZ], 18, [50, 120], [5, 21], { rainMax: 0.5 }),
  E('donkeyBray', [SX + 6, SZ + 8], 28, [140, 320], [5, 20], { rainMax: 0.6 }),
  // the pipa in the merchants' room of the serai in the evening, the flute (qiang di) at the market
  E('dhPipa', [SERAI.x0 + 4, SERAI.z0 + 12], 12, [70, 150], [17.5, 23], { rainMax: 0.4, after: true }),
  E('dhQiangdi', [60, 3], 22, [90, 200], [9, 19.5], { rainMax: 0.3, after: true }),
  // the sweep wells of the fields
  ...[[163, -18], [172, 12], [156, 30]].map(([x, z]) => E('dhShaduf', [x, z], 16, [40, 100], [6, 19], { dry: true })),
  // the Daquan's bed, in reaches along the stream
  ...[-90, -30, 30, 90].map((z) => E('dhStream', [riverX(z), z], 16, [6, 11], [0, 24], { rainMax: 1 })),
  // the women washing at the stream
  E('clothRustle', [riverX(22) + 2.5, 22], 10, [12, 30], [7, 17], { dry: true }), E('clothRustle', [riverX(-30) + 2.5, -30], 10, [14, 32], [7, 17], { dry: true }),
  // the threshing floor, a farmer at the grain
  E('clothRustle', [THRESH.x, THRESH.z], 12, [14, 36], [8, 18], { dry: true }),
  // the little owl on the cliff and at the beacon by night
  E('owl', [XF + 6, 40], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [BEACON.x, BEACON.z], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void ZEND;
