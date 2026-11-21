// Where Great Zimbabwe's sounds are (docs/settlements/great-zimbabwe.md §19.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the pounding of grain in the yards' mortars, the grinding stones, the smith's bellows and hammer and the carver's chisel in the Valley courts,
// the potters' burnishing, the mbira, the hosho, the drum and the song at the meeting houses (dara), on the forecourt and in the Western Enclosure at dusk, the herd
// boys calling their cattle, the ground hornbill at dawn, the nightjars and the hyenas of the night, the open houses one can be inside. Pure data and functions of
// layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-great-zimbabwe.js).
// Coordinates: metres, +x east, +z south, the settlement's frame.
//
// What the scheduler asks of a map but Great Zimbabwe has not (no canals, ponds, bridges or street walkers) is answered with nothing; no wells either: the
// valley's water came from the seasonal streams and springs, which are not on our disc [inferred].
import '../../engine/voices-great-zimbabwe.js';
import { RADIUS, HILL, WEST, ENCLOSURE, compounds, huts, daras, firings, KRAAL_AT, inRect, inEnclosure, height } from './layout.js';
import { ARRIVAL } from './walk.js';
import { courtAt } from './life.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the grass before the Great Enclosure). */
export const HOME = ARRIVAL;

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** What the inside of an open house is, by its seed (zimbabwe/index.js hutInside: Math.floor(seed / 5) % 4): the kitchen, the store, the spinner's, the sleeping house. */
export const KIND = ['kitchen', 'store', 'spinner', 'sleeping'];
export const kindOf = (h) => KIND[Math.floor(h.seed / 5) % 4];
/** The work heard from each kind of open house: [voice, gap in seconds [min, max], hours [from, to]] [inferred from what is in the house; the engine's own voices where they fit]. */
const WORK = {
  kitchen: [['kitchen', [14, 30], [5.5, 20]], ['gzGrind', [70, 140], [5.5, 10]]],
  store: [['jarLid', [30, 70], [6.5, 17.5]]],
  spinner: [['clothRustle', [26, 60], [7, 17.5]]],
  sleeping: [['clothRustle', [80, 180], [5, 23]]],
};
let SITES = null;
/** The open houses with sounds: { use, rect (inside the wall), at: [x, z] (the middle), id: 'hut:<x>,<z>', work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const h of huts()) if (h.open) {
    const [x, z] = h.c, w = Math.min(1.6, h.r * 0.62), use = kindOf(h);
    SITES.push({ use, rect: [x - w, z - w, x + w, z + w], at: [x, z], id: `hut:${Math.round(x * 10)},${Math.round(z * 10)}`, work: WORK[use], y: h.y ?? 0 });
  }
  return SITES;
}

/** The wells: none (see above). */
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
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thick thatch: soft), `hush` how much of the outdoors comes through (a daga wall 0.22 m thick, a wide open door), `work` [voice, gap s]. */
const R0 = { tone: [300, 0.3], roof: 0.7, hush: 0.75, work: [['clothRustle', 60]] };
export const ROOMS = {
  kitchen: { ...R0, tone: [340, 0.35], work: [['kitchen', 30]] },
  store: { ...R0, tone: [260, 0.25], work: [['jarLid', 50]] },
  spinner: { ...R0, work: [['clothRustle', 40]] },
  sleeping: { ...R0, tone: [240, 0.2], hush: 0.8, work: [['clothRustle', 90]] },
  house: R0,
};
export const UPPER = R0;

// ── the planting, the country ───────────────────────────────────────────────
/** 0…1: how much green round (x, z): the miombo woodland of the rim and the hill's slopes; the valley's grass and its few trees a little. */
export function greenNear(x, z) {
  const rim = sm(RADIUS - 190, RADIUS - 60, Math.hypot(x, z)), hill = Math.hypot((x - HILL.c[0]) / HILL.r[0], (z - HILL.c[1]) / HILL.r[1]) < 1.1 ? 0.6 : 0;
  return Math.max(rim * 0.85, hill, 0.25);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the miombo of the rim and the hill, a few trees by the compounds. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !inEnclosure(px, pz, 3) && (Math.hypot(px, pz) > RADIUS - 150 || hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.1)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the forecourt and the homesteads about the Great Enclosure, less on the hill, little at the rim. */
export function townNear(x, z) {
  if (inEnclosure(x, z, 24)) return 0.8;
  return Math.max(0.1, 0.65 * (1 - 0.75 * sm(110, RADIUS - 40, Math.hypot(x - ENCLOSURE.c[0], z - ENCLOSURE.c[1]))));
}
// what Great Zimbabwe has none of (the engine's scheduler asks, and is answered with nothing)
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
const rot = (k, u, v) => [k.c[0] + Math.cos(k.a) * u - Math.sin(k.a) * v, k.c[1] + Math.sin(k.a) * u + Math.cos(k.a) * v];
const arr = (k) => Math.hypot(k.c[0] - ARRIVAL[0], k.c[1] - ARRIVAL[1]);
/** The emitters (built from the layout: the yards' mortars, the courts' work, the meeting houses, the potters, the herds). */
function build() {
  const L = [];
  // the mortars of the eight homesteads nearest the arrival (the yard's mortar at (0.9, -0.5) of its frame), pounded in the morning and again in the late afternoon
  [...compounds()].sort((p, q) => arr(p) - arr(q)).slice(0, 8).forEach((k) => {
    const p = rot(k, 0.9, -0.5);
    L.push(E('gzPound', p, 15, [30, 80], [5.5, 9], { dry: true }), E('gzPound', p, 15, [40, 100], [15.5, 18.5], { dry: true }));
  });
  // the Valley courts (life.js courtAt): the trader's court (0) with the women at the grinding stone, the smithy (1), the stone carver (2), the women between (3)
  const c0 = courtAt(0), c1 = courtAt(1), c2 = courtAt(2);
  L.push(E('gzGrind', c0.at, 12, [50, 110], [6, 10.5], { dry: true }), E('clothRustle', c0.at, 9, [30, 70], [7, 17], { dry: true }));
  L.push(E('hammer', c1.at, 18, [12, 30], [6.5, 17.5], { dry: true }), E('gzBellows', c1.at, 14, [14, 34], [6.5, 17.5], { dry: true }));
  L.push(E('chisel', c2.at, 12, [40, 90], [7, 17], { dry: true }));
  // the potters' firing places: burnishing in the morning
  for (const f of firings()) L.push(E('gzBurnish', f.c, 9, [40, 90], [6.5, 12], { dry: true }));
  // the meeting houses (dara): the men's mbira with the hosho in the evening, the song with its clapping
  daras().forEach((d, i) => {
    L.push(E('gzMbira', d.c, 20, [70, 170], [16.5 + (i % 3) * 0.5, 22.5], { rainMax: 0.25, after: true }), E('gzHosho', d.c, 16, [90, 200], [17 + (i % 2) * 0.5, 22], { rainMax: 0.25, after: true }));
    if (i % 2 === 0) L.push(E('gzSong', d.c, 18, [110, 240], [18, 22], { rainMax: 0.25, after: true }));
  });
  // on the forecourt of the Great Enclosure's entrance, at dusk: the drum with the clapping, a song (the circle of the evening)
  L.push(E('gzNgoma', [46, 90], 26, [120, 260], [17.5, 21.5], { rainMax: 0.2, after: true }), E('gzSong', [43, 92], 24, [150, 300], [18, 21.5], { rainMax: 0.2, after: true }));
  // in the Western Enclosure on the hill, the royal court: the mbira, evenings
  L.push(E('gzMbira', [WEST.c[0] + 1, WEST.c[1] + 4], 20, [90, 200], [17, 22], { rainMax: 0.25, after: true }), E('gzHosho', [WEST.c[0] + 2, WEST.c[1] + 4], 16, [110, 220], [17.5, 21.5], { rainMax: 0.25, after: true }));
  // the herd boys: their calls to the cattle, by the herds in the grass (life.js people()) and the kraals
  for (const [x, z] of [[55, 75], [28, 75], [200, -90], [-210, 30], [60, 260], [230, 120]]) L.push(E('gzHerdCall', [x, z], 26, [60, 150], [6, 17.5], { rainMax: 0.5 }));
  for (const [x, z] of KRAAL_AT) L.push(E('gzHerdCall', [x, z], 20, [90, 200], [16, 18.5], { rainMax: 0.5 }));
  // dawn: the ground hornbills of the hill and the far valley
  L.push(E('gzHornbill', [HILL.c[0] + 20, HILL.c[1] + 30], 90, [90, 240], [4.3, 7], { rainMax: 0.6 }), E('gzHornbill', [170, -130], 90, [120, 300], [4.5, 6.8], { rainMax: 0.6 }));
  // the night: the nightjars in the trees about the valley, the hyenas out on the bush
  for (const [x, z] of [[80, 20], [-70, 90], [10, -110], [150, 150]]) L.push(E('gzNightjar', [x, z], 40, [30, 80], [19.5, 4], { rainMax: 0.5 }));
  for (const [x, z] of [[-260, -150], [260, 210], [-240, 220]]) L.push(E('gzHyena', [x, z], 80, [90, 220], [21, 4.2], { rainMax: 0.5 }));
  return L;
}
/** The fixed emitters. */
export const EMITTERS = build();
void height; void WORK;
