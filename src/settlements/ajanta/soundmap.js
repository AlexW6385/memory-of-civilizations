// Where Ajanta's sounds are (docs/settlements/ajanta.md §18): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the Waghora's fall into its pool and the river over the ford's stones, the monastery's bronze gong on the ledge, the hand bell and the chant at the shrine
// of Cave 1 and the stupa of Cave 19, the mason's chisel and the colour-grinders in the yards, the washing at the stones, the smith's hammer and bellows, the
// potter's wheel, the oil-press's ox and the loom of the village, the water-shed's pour, the well, the rooms one can be inside (the caves are hush and ring).
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the
// voices of src/engine/voices-ajanta.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout: what sounded is from the dossier
// §9 and §7; the hours follow the monastic day (the gong at dawn, the meal before noon, the evening worship) and the working day.]
import '../../engine/voices-ajanta.js';
import '../../engine/voices-kyoto.js';                  // the little owl
import { RADIUS, XF, ZW, C1, C19, C12, FALL, GHATS, WELL, VILLAGE, SHELTER, FORD, riverX, lots, inRect, inRiver, inPool } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the east bank's path). */
export const HOME = [-21.5, -4];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade; the engine's own voices where they fit]. */
const WORK = {
  home: [['kitchen', [18, 40], [5, 19]], ['grinder', [60, 120], [5, 9]], ['mortar', [70, 150], [6, 9]]],
  smithy: [['hammer', [6, 14], [6.5, 17.5]], ['ajBellows', [12, 26], [6, 17.5]]],
  potter: [['wheel', [14, 30], [6.5, 17]], ['clay', [10, 24], [6.5, 17]]],
  oilpress: [['mortar', [8, 18], [6, 17]], ['ajOxBell', [18, 40], [6, 17]]],
  weaver: [['loom', [8, 20], [6.5, 18]]],
};
const USE_OF = { smithy: 'smithy', potter: 'potter', oilpress: 'oilpress', weaver: 'weaver' };

let SITES = null;
/** The rooms with sounds: { use, rect, at: [x, z] (the middle), id, work, y }: every hut and shed of the village (y 8, the east plateau). */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    const use = USE_OF[l.craft] || 'home';
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[use], y: 8 });
  }
  return SITES;
}

/** The wells of the village (town.js: the shaduf at WELL). */
export const WELLS = [WELL];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
// the caves' rooms, from styles/ajanta/caves.js (V: porch 3.8, wall 1, hall 19.5 by 19.5; CH: nave 16.05 by 7.1, wall 1.2; the cell hall 5.8 by 5.8) on the ledge (y 9)
const V1 = { xp0: XF - 3.8, xw1: XF - 4.8, xh0: XF - 24.3 }, C = { xn1: XF - 1.2, xn0: XF - 17.25 };
const ROOM_RECTS = [
  ['room:sanctum', 'sanctum', [V1.xh0 - 7.0, C1.z - 2.5, V1.xh0 - 1.2, C1.z + 2.5]],
  ['room:vihara', 'vihara', [V1.xh0, C1.z - 9.75, V1.xw1, C1.z + 9.75]],
  ['room:chaitya', 'chaitya', [C.xn0, C19.z - 3.55, C.xn1, C19.z + 3.55]],
  ['room:cell', 'cellhall', [XF - 7.0, C12.z - 2.9, XF - 1.2, C12.z + 2.9]],
];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s) return { use: s.use, at: s.at, upper: false, same: s.id };
  if (y > 6) for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch, or the rock: none), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = { tone: [320, 0.3], roof: 0.9, hush: 0.8, work: [['kitchen', 30]] };
export const ROOMS = {
  home: { ...R0 },
  smithy: { ...R0, tone: [420, 0.4], hush: 0.9, work: [['hammer', 10]] },
  potter: { ...R0, work: [['wheel', 22]] },
  oilpress: { ...R0, tone: [280, 0.25], work: [['mortar', 14]] },
  weaver: { ...R0, work: [['loom', 14]] },
  vihara: { tone: [190, 0.2], roof: 0.05, hush: 0.35, work: [['brush', 40]] },
  sanctum: { tone: [160, 0.25], roof: 0.05, hush: 0.3, work: [['ajHandBell', 60]] },
  chaitya: { tone: [200, 0.2], roof: 0.05, hush: 0.4, work: [['ajChant', 50]] },
  cellhall: { tone: [210, 0.18], roof: 0.05, hush: 0.4, work: [['clothRustle', 60]] },
};
export const UPPER = { ...R0 };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the dry teak forest of the plateau behind the cliff and the hills, the river's margins, thin on the open east bank. */
export function greenNear(x, z) {
  const behind = sm(XF - 30, XF - 60, x), river = 1 - sm(0, 22, Math.abs(x - riverX(z)));
  return Math.max(0.25, behind * 0.9, river * 0.5, inRect(VILLAGE, x, z, 10) ? 0.45 : 0);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.8);
/** A tree to put a cicada or a bird in, near (x, z), or null: the teak of the plateau and the neem and fig of the banks and the village. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > RADIUS - 8 || inRiver(px, pz, 3) || inPool(px, pz, 2)) continue;
    if (px < XF - 46 || (px > 10 && hash(Math.floor(px / 12), Math.floor(pz / 12)) < 0.3) || (px < 10 && px > XF + 8 && hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.1)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the place's hubbub reaches (x, z): the booths on the path to the stair, the village's yard, the ledge with its pilgrims, little in the caves, less toward the rim. */
export function townNear(x, z) {
  if (inRect([-36, -50, -18, -42], x, z, 6) || inRect([VILLAGE[0] + 4, 18, VILLAGE[2] - 4, 40], x, z, 4)) return 1;
  if (inRect([XF, -57, XF + 6, 57], x, z, 3)) return 0.45;
  if (x < XF - 3) return 0.05;
  return Math.max(0.12, 0.5 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
// what Ajanta has none of (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = (x, z) => (Math.abs(x - riverX(z)) < 16 && Math.abs(z) > 48 && x > XF ? 0.6 : 0);
export const lotusNear = () => 0;
export const frogGround = (x, z) => (Math.abs(x - riverX(z)) < 12 || inPool(x, z, 4) ? 0.7 : 0.1);

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const LEDGE_MID = [XF + 3, C1.z], SHRINE = [V1.xh0 - 3.5, C1.z], STUPA = [C.xn0 + 2.5, C19.z];
const MASON = [XF + 15.8, -ZW + 1.9], COLOURS = [XF + 22.7, -ZW + 9.9], PILLAR = [XF + 29.5, -ZW + 11.2];
const FORDAT = [riverX(FORD.z), FORD.z];
export const EMITTERS = [
  // the waterfall into its pool, all day and night (a long roar laid end to end), and the river over the ford's stones
  E('ajFall', FALL.pool, 60, [11, 17], [0, 24], { rainMax: 1 }), E('ajFall', FALL.pool, 70, [14, 22], [0, 24], { rainMax: 1 }),
  E('ajRiver', FORDAT, 18, [6, 12], [0, 24], { rainMax: 1, after: true }), E('ajRiver', [riverX(-30), -30], 16, [8, 16], [0, 24], { rainMax: 1, after: true }),
  // the monastery's bronze gong on the ledge: dawn, the meal before noon, the evening
  E('ajGong', LEDGE_MID, 90, [200, 300], [4.9, 5.4], { rainMax: 0.8 }), E('ajGong', LEDGE_MID, 80, [220, 320], [10.6, 11.1], { rainMax: 0.8 }), E('ajGong', LEDGE_MID, 80, [220, 320], [17.5, 18.0], { rainMax: 0.8 }),
  // the hand bell and the chant: at the Buddha of Cave 1's shrine, in the nave of Cave 19 at the stupa, morning and evening worship
  E('ajHandBell', SHRINE, 16, [40, 90], [5.2, 7.5], { rainMax: 1 }), E('ajHandBell', SHRINE, 16, [50, 100], [17.6, 19.5], { rainMax: 1 }),
  E('ajChant', STUPA, 24, [50, 100], [5.2, 7.5], { rainMax: 1, after: true }), E('ajChant', STUPA, 24, [60, 110], [17.6, 19.5], { rainMax: 1, after: true }),
  E('ajChant', SHRINE, 22, [90, 160], [9.5, 11.5], { rainMax: 1, after: true }), E('ajHandBell', STUPA, 14, [60, 120], [5.4, 7.2], { rainMax: 1 }),
  // the painters at their scaffold in Cave 1 (the brush), the mason at the north wing's niche, the colour-grinders and the lime in the yard, the chiseller at the pillar
  E('brush', [V1.xh0 + 0.5, C1.z - 3.4], 12, [20, 45], [7, 16], { rainMax: 1 }),
  E('chisel', MASON, 26, [3.5, 9], [6.5, 17.5], { rainMax: 0.5 }), E('chisel', PILLAR, 22, [6, 14], [6.5, 17.5], { rainMax: 0.5 }),
  E('grinder', COLOURS, 12, [14, 30], [6.5, 16.5], { dry: true }), E('clay', [XF + 24.5, -ZW + 6.5], 12, [18, 40], [6.5, 16.5], { dry: true }),
  // the washing at the stones of the two ghats on the west bank, morning and late afternoon
  ...GHATS.flatMap((gz) => { const p = [riverX(gz) - 5.4, gz]; return [E('ajWash', p, 16, [25, 60], [6, 10.5], { dry: true, after: true }), E('ajWash', p, 16, [40, 90], [15.5, 18], { dry: true, after: true })]; }),
  // the pilgrims' booths on the path to the stair (cloth, jars: the keepers' small noise), the water-shed's pour, the village well's bucket, a bell on a zebu
  E('jarLid', [-27, -45.5], 10, [25, 60], [6, 18], { dry: true }), E('clothRustle', [-32, -45.5], 10, [20, 50], [6, 18], { dry: true }), E('clothRustle', [-22, -45.5], 10, [20, 50], [6, 18], { dry: true }),
  E('pour', [riverX(2) + 14.4, 2.2], 9, [18, 40], [6, 18.5], { dry: true }),
  E('ajOxBell', [WELL[0] + 12, WELL[1] + 3], 18, [28, 70], [6, 18.5], { rainMax: 0.4 }), E('ajOxBell', [-44.5, -31], 18, [45, 100], [6, 18.5], { rainMax: 0.4 }),
  // the shelter at the stair's foot: a pilgrim's murmur of cloth, a water-jar's lid
  E('clothRustle', mid(SHELTER), 9, [30, 80], [5, 22], { dry: true }), E('jarLid', mid(SHELTER), 8, [50, 120], [5, 21], { dry: true }),
  // the night: the little owl in the cliff's niches and on the plateau, a jackal far off
  E('owl', [XF + 6, 0], 50, [50, 120], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [XF - 40, -40], 55, [60, 140], [21, 4], { rainMax: 0.4 }),
  E('dogFar', [XF - 70, 20], 50, [70, 160], [20, 5]), E('dogFar', [140, 60], 45, [80, 170], [21, 4.5]),
];
