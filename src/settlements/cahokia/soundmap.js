// Where Cahokia's sounds are (docs/settlements/cahokia.md §10.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — chunkey's stone and poles on the plaza's yards, the pounding of maize at the house doors, the traders' mats (chert flaked, shell drilled,
// hides scraped, pots, baskets), the households at work inside the opened houses, the creek and the dugouts at its landings, a water drum, a rattle, voices and
// a cane flute in the evening, the sentries' calls from the palisade and the owls and far dogs of the night, the halls one can be inside.
// Pure data and functions of layout.js and town.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js
// (the voices of src/engine/voices-cahokia.js). Coordinates: metres, +x east, +z south, the settlement's frame. No bell, no horse, no cart, no metal, no
// rooster or hen: nothing that came after the Mississippians (the dog is the one domestic animal, §5.2). What the scheduler asks of a map but Cahokia has not
// (canals, bridges, street walkers, wells) is answered with nothing.
import '../../engine/voices-cahokia.js';
import { RADIUS, PLAZA, YARDS, HALLS, LODGES, MOUNDS, PALISADE, PONDS, creekZ, inRect, inLot, onMound, height, lots } from './layout.js';
import { openSet, PLAZA_STALLS, LANDINGS } from './town.js';

/** Where the audio puts the listener when the engine gives none (the arrival between the yards). */
export const HOME = [-25, -18];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the household's work, docs §5.7, §5.14: the engine's own voices where they fit]. */
const WORK = {
  cook: [['cahPound', [40, 90], [5.5, 10]], ['kitchen', [30, 70], [5, 20]]],
  weaver: [['clothRustle', [20, 50], [7, 18]]],
  knapper: [['cahKnap', [14, 36], [7, 17]]],
  shell: [['cahDrill', [14, 30], [7, 17]]],
  storage: [['jarLid', [30, 70], [6.5, 17]], ['sack', [50, 110], [7, 17]]],
  drum: [['cahRattle', [40, 90], [8, 20]], ['cahDrum', [90, 200], [9, 20]]],
  potter: [['clay', [20, 50], [7, 17]], ['cahScrape', [30, 70], [7, 17]]],
  basket: [['clothRustle', [16, 36], [7, 17]], ['sack', [50, 110], [7, 17]]],
  hide: [['cahScrape', [14, 30], [7, 17]]],
  fisher: [['sack', [30, 70], [6, 16]], ['clothRustle', [30, 60], [6, 16]]],
  hall: [['cahChant', [90, 220], [8, 22]]],
};
let SITES = null;
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The rooms with sounds: { use, rect, at: [x, z] (the middle), id, work, y (the floor) }: the opened houses, the halls and the lodges. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const L = lots();
  for (const [k, kind] of openSet()) { const l = L[k], rect = l.rect; SITES.push({ use: kind, rect, at: mid(rect), id: 'house:' + k, work: WORK[kind], y: l.y }); }
  const hall = (rect, id, y) => SITES.push({ use: 'hall', rect, at: mid(rect), id, work: WORK.hall, y });
  HALLS.forEach((r, i) => hall(r, 'hall:' + i, height(...mid(r))));
  LODGES.forEach((r, i) => hall(r, 'lodge:' + i, height(...mid(r))));
  MOUNDS.forEach((m, i) => hall([m[0] - 0.45 * m[2], m[1] - 0.33 * m[2], m[0] + 0.45 * m[2], m[1] + 0.33 * m[2]], 'mound:' + i, height(m[0], m[1])));
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

let LGRID = null;
const lotAt = (x, z, y) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z) && y > s.y - 0.6 && y < s.y + (s.use === 'hall' ? 6 : 2.8));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z, y);
  return s ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch: soft), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [260, 0.2], roof: 0.5, hush: 0.7, work: [['clothRustle', 50]] };
export const ROOMS_SOUND = {
  cook: { ...R0, tone: [320, 0.3], work: [['cahPound', 40]] },
  weaver: { ...R0, work: [['clothRustle', 20]] },
  knapper: { ...R0, work: [['cahKnap', 16]] },
  shell: { ...R0, work: [['cahDrill', 16]] },
  storage: { ...R0, tone: [220, 0.2], hush: 0.6, work: [['jarLid', 50]] },
  drum: { ...R0, work: [['cahRattle', 40]] },
  potter: { ...R0, work: [['clay', 20]] },
  basket: { ...R0, work: [['clothRustle', 20]] },
  hide: { ...R0, work: [['cahScrape', 16]] },
  fisher: { ...R0, work: [['sack', 40]] },
  hall: { tone: [380, 0.35], roof: 0.35, hush: 0.45, work: [['cahChant', 90]] },
};
export { ROOMS_SOUND as ROOMS };
export const UPPER_SOUND = { tone: [230, 0.12], roof: 0.5, hush: 0.7, work: [['clothRustle', 40]] };
export { UPPER_SOUND as UPPER };

// ── the planting, the town ──────────────────────────────────────────────────
const creekDist = (x, z) => Math.abs(z - creekZ(x));
const pondDist = (x, z) => Math.min(...PONDS.map(([cx, cz, rx, rz]) => Math.hypot((x - cx) / rx, (z - cz) / rz) * Math.min(rx, rz)));
/** 0…1: how much green round (x, z): the bottomland woods of the creek, the maize fields beyond the houses in summer; little on the plaza. */
export function greenNear(x, z) {
  const creek = 1 - sm(0, 50, creekDist(x, z)), fields = sm(300, 340, Math.hypot(x, z)) * 0.8;
  return Math.max(creek * 0.9, fields, inRect(PLAZA, x, z) ? 0.05 : 0.2);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z), or null: the elms, oaks and cottonwoods of the creek and the pits. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (creekDist(px, pz) < 40 || pondDist(px, pz) < 30) && creekDist(px, pz) > 8 && !inLot(px, pz, 1) && !onMound(px, pz)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the people's talk reaches (x, z): the plaza most, the lanes some, little beyond the houses. */
export function townNear(x, z) {
  if (inRect(PLAZA, x, z)) return 1;
  if (inRect(PALISADE, x, z)) return 0.75;
  return Math.max(0.06, 0.6 * (1 - sm(180, 330, Math.hypot(x, z))));
}
// what Cahokia has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** Frogs by the creek and the borrow pits in the warm months (the chorus of the bottomland [inferred]). */
export const frogGround = (x, z) => (Math.hypot(x, z) < RADIUS - 30 && (creekDist(x, z) < 12 || pondDist(x, z) < 14) ? 0.7 : 0);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const bank = (x) => [x, creekZ(x)];
const GOODS = { chert: 'cahKnap', shell: 'cahDrill', hides: 'cahScrape', pots: 'clay', maize: 'sack', salt: 'sack', copper: 'jarLid' };
const mats = PLAZA_STALLS.map(([x, z, kind]) => E(GOODS[kind] || 'sack', [x, z], 9, [18, 50], [8, 17], { dry: true }));
const fixed = [
  // chunkey on the yards: the stone rolled and the poles thrown, the crowd's shout
  ...YARDS.map((r) => E('cahChunkey', mid(r), 24, [12, 30], [9, 17], { dry: true })),
  // the traders' mats along the plaza's edges
  ...mats,
  // Cahokia Creek, in reaches along the bank, and the dugouts at the three landings
  ...[-300, -240, -180, -120, -60, 0, 60, 120, 180, 240, 300].map((x) => E('cahCreek', bank(x), 22, [6, 11], [0, 24], { rainMax: 1 })),
  ...LANDINGS.map((x) => E('cahPaddle', [x + 8, creekZ(x + 8) - 1], 18, [18, 40], [6, 18], { dry: true })),
  // the evening: a water drum and voices on the plaza about the great post, a rattle with them; the flute from the shade of the south arbors
  E('cahDrum', [0, 62], 46, [90, 220], [17.5, 22.5], { rainMax: 0.3, after: true }),
  E('cahChant', [0, 62], 40, [110, 250], [18, 22.5], { rainMax: 0.3, after: true }),
  E('cahRattle', [3, 62], 34, [140, 300], [18, 22.5], { rainMax: 0.3, after: true }),
  E('cahFlute', [-62, 106], 44, [100, 260], [18, 23], { rainMax: 0.3, after: true }),
  // the summit: a chant from the great house in the evening
  E('cahChant', [1, -205], 50, [140, 300], [17, 22], { rainMax: 0.3, after: true }),
  // the night: the sentries' calls from the palisade's corners, owls from the bottomland woods, dogs far off
  ...[[PALISADE[0], PALISADE[1]], [PALISADE[2], PALISADE[1]], [PALISADE[2], PALISADE[3]], [PALISADE[0], PALISADE[3]]].map(([x, z]) => E('cahWatch', [x, z], 60, [150, 340], [21, 5], { rainMax: 0.4 })),
  E('owl', [-120, -330], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [200, 320], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
  E('dogFar', [-200, 150], 90, [60, 160], [20, 5], { rainMax: 0.4 }), E('dogFar', [180, -120], 90, [80, 200], [21, 4.5], { rainMax: 0.4 }),
];

function emitters() {
  const L = lots(), out = [];
  // the pounding of maize in the log mortar by the door of the opened cook houses, in the morning
  for (const [k, kind] of openSet()) if (kind === 'cook') { const [x0, , x1, z1] = L[k].rect; out.push(E('cahPound', [(x0 + x1) / 2 + 1.4, z1 + 0.5], 12, [40, 90], [5.5, 10], { dry: true })); }
  // chert, shell and hides worked at the doors of the houses of those crafts
  for (const [k, kind] of openSet()) { const [x0, , x1, z1] = L[k].rect, g = { knapper: 'cahKnap', shell: 'cahDrill', hide: 'cahScrape' }[kind]; if (g) out.push(E(g, [(x0 + x1) / 2 - 1.8, z1 + 1.2], 10, [24, 60], [8, 17], { dry: true })); }
  return out;
}
export const EMITTERS = [...fixed, ...emitters()];
