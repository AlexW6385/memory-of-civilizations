// Where Sailendra Java's sounds are (docs/settlements/borobudur.md §20.3): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the dawn and dusk offices at the monument (conch, bell, chant), the monastery's hall (chant, gong, drum), the village halls' bronze ensembles, the rice mortars,
// looms and forge of the furnished houses, the sellers on the pilgrims' way, the clappers and buffalo bells of the paddies, the geckos in the thatch at night, the rooms one
// can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the
// voices of src/engine/voices-borobudur.js). Coordinates: metres, +x east, +z south, the settlement's frame. All of it [inferred]: ethnographic Java and the reliefs' instruments.
import '../../engine/voices-borobudur.js';
import { RADIUS, MONASTERY, HAMLETS, CELLS, cellRoom, houses, inRect, floorOf, fieldSpots, coreOf, nearWay, WAY } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the way). */
export const HOME = [110, 0];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const NIGHT = [19.5, 4.5];

/** The household work heard from the furnished houses by variant (0 hearth and bed, 1 loom, 2 shrine, 3 kitchen and store, 4 smith): [voice, gap [min, max] s, hours]. */
const USE = ['hearth', 'loom', 'shrine', 'kitchen', 'smith'];
const WORK = {
  hearth: [['kitchen', [14, 30], [5, 20]], ['borLesung', [90, 180], [5, 8.5]], ['borGecko', [40, 90], NIGHT]],
  loom: [['loom', [10, 26], [7, 17]], ['borGecko', [40, 90], NIGHT]],
  shrine: [['borBell', [70, 150], [5, 7]], ['borBell', [90, 170], [17, 19]], ['borGecko', [40, 90], NIGHT]],
  kitchen: [['kitchen', [14, 30], [5, 20]], ['pour', [50, 110], [6, 17]], ['borGecko', [40, 90], NIGHT]],
  smith: [['hammer', [8, 22], [7, 17]], ['borGecko', [50, 100], NIGHT]],
  monkhouse: [['clothRustle', [60, 120], [4, 21]]],
};
let SITES = null;
/** The furnished houses with sounds: { use, rect, at, id, work, y }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const h of houses()) if (h.interior) { const use = USE[h.variant] ?? 'hearth', r = [h.rect[0] + 0.5, h.rect[1] + 0.5, h.rect[2] - 0.5, h.rect[3] - 0.5]; SITES.push({ use, rect: r, at: mid(r), id: 'house:' + h.seed, work: WORK[use], y: floorOf(h.seed) }); }
  for (const c of CELLS) if (c[3]) { const r = cellRoom(c); SITES.push({ use: 'monkhouse', rect: r, at: mid(r), id: 'cell:' + c[0] + ',' + c[1], work: WORK.monkhouse, y: 1.3 }); }
  return SITES;
}

/** The wells: one in each hamlet's yard (layout.js wellAt), one on the way's forecourt, the monastery's. */
export const WELLS = [...HAMLETS.map(([hx, hz]) => [hx + 7.5, hz + 5.5]), [83, 10.5], [-173, -162]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────
const HALL = [-182, -150, -158, -132];
let GRID = null;
const siteAt = (x, z) => {
  if (!GRID) { GRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; (GRID.get(k) || GRID.set(k, []).get(k)).push(s); } }
  return (GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open (a raised house: the feet on its floor, not under it). */
export function roomAt(x, z, y = 0) {
  const s = siteAt(x, z);
  if (s && y > s.y - 0.5) return { use: s.use, at: s.at, upper: false, same: s.id };
  if (inRect(HALL, x, z) && y > 0.3) return { use: 'greathall', at: mid(HALL), upper: false, same: 'room:greathall' };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch), `hush` how much of the outdoors comes through, `work` its small sounds. */
const R0 = { tone: [420, 0.35], roof: 0.8, hush: 0.7, work: [['clothRustle', 50]] };
export const ROOMS = {
  house: R0,
  hearth: { ...R0, work: [['kitchen', 30]] },
  loom: { ...R0, work: [['loom', 14]] },
  shrine: { ...R0, tone: [360, 0.3], work: [['borBell', 90]] },
  kitchen: { ...R0, work: [['kitchen', 30], ['pour', 60]] },
  smith: { ...R0, tone: [520, 0.5], hush: 0.9, work: [['hammer', 12]] },
  monkhouse: { ...R0, tone: [340, 0.3], hush: 0.6 },
  greathall: { tone: [260, 0.25], roof: 0.7, hush: 0.5, work: [['borChant', 40]] },
};
export const UPPER = { tone: [300, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 60]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the groves of the hamlets and the way's trees, the paddies a little, the monument's top none. */
export function greenNear(x, z) {
  const r = Math.hypot(x, z);
  if (r < 62) return 0.15;
  const h = HAMLETS.reduce((m, [hx, hz, hr]) => Math.max(m, 1 - sm(0, hr + 40, Math.hypot(x - hx, z - hz))), 0);
  return Math.max(0.45, h, nearWay(x, z) ? 0.7 : 0);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** 0…1: how much bamboo and palm round (x, z): at the hamlets, thin by the way. */
export const bambooNear = (x, z) => HAMLETS.reduce((m, [hx, hz, hr]) => Math.max(m, 1 - sm(hr * 0.5, hr + 50, Math.hypot(x - hx, z - hz))), 0.1);
/** A tree to put a cicada or a bird in, near (x, z), or null: the groves of the hamlets and the monastery, the way's verges. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && Math.hypot(px, pz) > 70 && (bambooNear(px, pz) > 0.4 || inRect(MONASTERY, px, pz, 8) || (nearWay(px, pz) && Math.abs(pz) > 4))) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the crowd's murmur reaches (x, z): the way and its stalls, the gate, the monument's galleries, the hamlets' halls, little in the fields. */
export function townNear(x, z) {
  if (nearWay(x, z, 0) && x > 60) return x < WAY.gate + 45 ? 1 : 0.7;
  if (Math.hypot(x, z) < 62) return 0.5;
  if (HAMLETS.some(([hx, hz, hr]) => Math.hypot(x - hx, z - hz) < hr)) return 0.35;
  if (inRect(MONASTERY, x, z, 10)) return 0.3;
  return 0.1;
}
// what Java has none of in this ground (the engine's scheduler asks, and is answered with nothing)
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const lotusNear = () => 0;
/** The paddies are the frogs' ground: all the plain beyond the hamlets, loud after rain. */
export const frogGround = (x, z) => (Math.hypot(x, z) > 100 && !HAMLETS.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 20) ? 0.9 : 0.2);

/** The passing: a buffalo cart along the way, from the fields to the gate or back. */
export const TRACKS = [{
  key: 'cart', voice: 'borCart', speed: 1.1, r50: 16, gap: [60, 140], ok: (hour, rain) => hour >= 6 && hour < 17.5 && rain < 0.5,
  get: (lx, lz, r) => (lx > 60 && Math.abs(lz) < 40 ? (r() < 0.5 ? { pts: [[Math.min(300, lx + 60), 3.2], [Math.max(96, lx - 60), 3.2]] } : { pts: [[Math.max(96, lx - 60), -3.2], [Math.min(300, lx + 60), -3.2]] }) : null),
}];

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const [mx0, mz0, mx1, mz1] = MONASTERY, MC = mid(MONASTERY), HC = mid(HALL), F = fieldSpots();
const DAWN = [4.8, 6.6], DUSK = [17, 19];
export const EMITTERS = [
  // the offices at the monument: the conch at the east stair's foot, the bell and the chant at the summit, at dawn and at dusk
  E('borConch', [66, 0], 140, [90, 200], [5.2, 6.4], { rainMax: 0.8 }), E('borConch', [66, 0], 140, [90, 200], [17.3, 18.5], { rainMax: 0.8 }),
  E('borBell', [0, 0], 45, [50, 110], DAWN, { rainMax: 0.7 }), E('borBell', [0, 0], 45, [50, 110], DUSK, { rainMax: 0.7 }),
  E('borChant', [0, 0], 34, [60, 130], DAWN, { rainMax: 0.7, after: true }), E('borChant', [0, 0], 34, [60, 130], DUSK, { rainMax: 0.7, after: true }),
  // the monastery's great hall: the chant, the gong and the drum, at its offices; the gate's bell
  E('borChant', HC, 26, [40, 90], [4.5, 6.8], { after: true }), E('borChant', HC, 26, [40, 90], [17, 19.5], { after: true }), E('borChant', HC, 26, [90, 200], [10, 11.5], { after: true }),
  E('borGong', HC, 60, [50, 110], [4.8, 6.2]), E('borGong', HC, 60, [50, 110], [17.2, 18.8]),
  E('borDrum', HC, 40, [60, 130], [5.2, 6.4], { after: true }),
  E('borBell', [mx1 - 2, MC[1]], 24, [70, 150], [5.5, 7]),
  // the village halls (the first three hamlets): the bronze ensemble with its flute and drum in the evening, practice by day now and then
  ...[0, 1, 2].flatMap((i) => [E('borGamelan', [HAMLETS[i][0], HAMLETS[i][1]], 38, [70, 160], [16, 21.5], { rainMax: 0.7, after: true }), E('borFlute', [HAMLETS[i][0] + 2, HAMLETS[i][1]], 28, [90, 200], [16.5, 21], { rainMax: 0.5, after: true }),
    E('borDrum', [HAMLETS[i][0] - 2, HAMLETS[i][1]], 30, [110, 240], [17, 21], { rainMax: 0.5, after: true })]),
  // the other hamlets' stupa shrines: a hand bell at dawn and dusk
  ...[3, 4, 5].flatMap((i) => [E('borBell', [HAMLETS[i][0], HAMLETS[i][1]], 20, [80, 160], [5, 6.8]), E('borBell', [HAMLETS[i][0], HAMLETS[i][1]], 20, [80, 160], [17, 18.8])]),
  // the way: the sellers' cries at the stalls by day
  ...[84, 120, 150, 182, 214].map((x, k) => E('borSeller', [x, k % 2 ? 5 : -5], 16, [18, 46], [6, 17.5], { rainMax: 0.4 })),
  // the paddies: a clapper line at each hut, a trickle over the bunds, a buffalo's bell at each plough
  ...F.huts.flatMap((h) => [E('borClapper', h.at, 26, [14, 44], [6, 17.5], { dry: true }), E('borTrickle', [h.at[0] + 6, h.at[1] + 5], 12, [8, 18], [0, 24], { rainMax: 1 })]),
  ...F.plough.map((p) => E('borBuffaloBell', p.at, 20, [8, 22], [6, 11])), ...F.plough.map((p) => E('borBuffaloBell', p.at, 20, [8, 22], [15, 17.5])),
  // the groves: the koel at hamlet and monastery by day, the owl at night
  ...HAMLETS.map(([hx, hz], i) => E('borKoel', [hx - 10, hz - 8], 40, [50, 120], [6, 10.5], { rainMax: 0.3 })),
  E('owl', [-100, -250], 60, [40, 100], NIGHT, { rainMax: 0.4 }), E('owl', [200, 200], 60, [60, 140], NIGHT, { rainMax: 0.4 }),
];
void coreOf; void mx0; void mz0;
