// Where Angkor's sounds are (docs/settlements/angkor.md §33): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the temple's dawn and dusk offices (conch, chant), the musicians on the Terrace of Honour, the teaching in the court, the market's cries (6 to 12),
// the husker's pestle and the smith's bellows, the household's kitchen, the moat's lapping and its paddled boats, the buffalo and their bells, the elephants of
// the road, the geckos in the thatch and the frogs of the paddies at night. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-angkor.js). Metres, +x east, +z south. [inferred throughout.]
import { RADIUS, MOAT, MARKET, ROAD, CX, T, LIBRARIES, ENCLOSURE, CAUSEWAY, houses, shops, ponds, moatLanes, inRect } from './layout.js';
import { houseUp } from '../../styles/khmer/village.js';

export const HOME = [-178, 1.5];
/** A deterministic 0…1 from numbers. */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The work heard from each trade's open workshop: [voice, gap [min, max] s, hours [from, to]]. */
const TRADE_WORK = {
  smith: [['hammer', [12, 30], [6.5, 17]], ['akBellows', [30, 70], [6.5, 17]]],
  potter: [['wheel', [30, 60], [6.5, 17]]],
  sugar: [['kitchen', [20, 45], [5, 10]]],
  mill: [['akPestle', [20, 50], [4.5, 9.5]], ['akPestle', [40, 90], [16, 18.5]]],
};
const HOUSE_WORK = [['kitchen', [16, 34], [4.5, 20]], ['akPestle', [60, 140], [5, 8]], ['akGecko', [40, 110], [19.5, 4.5]]];

let SITES = null;
/** The houses and the open workshops with sounds: { use, rect, at, id, work, y (the floor) }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const h of houses()) SITES.push({ use: 'house', rect: h.rect, at: mid(h.rect), id: 'house:' + h.seed, work: HOUSE_WORK, y: houseUp(h) });
  for (const s of shops()) SITES.push({ use: 'workshop:' + s.trade, rect: s.rect, at: mid(s.rect), id: 'shop:' + s.seed, work: TRADE_WORK[s.trade] || [], y: 0.55, open: true });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const SANCT = [CX - 2.6, -2.6, CX + 2.6, 2.6];
const ROOM_RECTS = [
  ['sanctuary', 'sanctuary', SANCT, T.bakan.y + 0.7],
  ['library-n', 'hall', LIBRARIES[0], 1.9], ['library-s', 'hall', LIBRARIES[1], 1.9],
  ['echoes', 'hall', [-65, -19, -15, -15], T.base.y + 0.4],
];
/** The room the listener is in: a house above its floor (not under it), a library, the sanctuary, the Hall of Echoes; null in the open (the workshops have no walls). */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (!s.open && inRect(s.rect, x, z) && y > s.y - 0.4) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const [id, use, r, fy] of ROOM_RECTS) if (inRect(r, x, z) && y > fy - 0.4) return { use, at: mid(r), upper: false, same: id };
  return null;
}
const R0 = { tone: [300, 0.22], roof: 0.9, hush: 0.7, work: [['kitchen', 40]] };
export const ROOMS = {
  house: { ...R0, work: [['kitchen', 36], ['clothRustle', 80]] },
  hall: { tone: [160, 0.3], roof: 0.3, hush: 0.35, work: [['clothRustle', 90]] },
  sanctuary: { tone: [120, 0.3], roof: 0.3, hush: 0.3, work: [['clothRustle', 90]] },
  'workshop:smith': { tone: [420, 0.3], roof: 0.9, hush: 0.95, work: [['hammer', 30]] },
  'workshop:potter': { tone: [340, 0.3], roof: 0.9, hush: 0.95, work: [['wheel', 40]] },
  'workshop:sugar': { tone: [320, 0.3], roof: 0.9, hush: 0.95, work: [['kitchen', 40]] },
  'workshop:mill': { tone: [320, 0.3], roof: 0.9, hush: 0.95, work: [['akPestle', 50]] },
};
export const UPPER = { tone: [260, 0.14], roof: 0.6, hush: 0.7, work: [['clothRustle', 50]] };

// ── the planting, the town ──────────────────────────────────────────────────
const moatRects = () => { const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner; return [[a0, b0, a1, d0], [a0, d1, a1, b1], [a0, d0, c0, -4.75], [a0, 4.75, c0, d1], [c1, d0, a1, d1]]; };
const waterDist = (x, z) => Math.min(...moatRects().map((r) => rectDist(r, x, z)), ...ponds().map((p) => rectDist(p.rect, x, z)));
/** 0…1: how much green round (x, z) for the insects: the village's palms, the moat's reeds; the temple's stone courts little. */
export function greenNear(x, z) {
  if (inRect(T.base.rect, x, z, -4)) return 0.12;
  return Math.max(0.35, 0.9 * (1 - sm(0, 30, waterDist(x, z))), Math.hypot(x, z) > 215 ? 0.7 : 0);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird or an insect in, near (x, z): the palms stand by the houses and on the dykes; null in the temple's court. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 24; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > 215 && Math.hypot(px, pz) < RADIUS - 10) return [px, pz];
    if (inRect(ENCLOSURE, px, pz, -6) && !inRect(T.base.rect, px, pz, 8)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the market, much on the road, little in the temple, some among the houses. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 14)) return 1;
  if (inRect(T.base.rect, x, z)) return 0.08;
  if (inRect(ROAD, x, z, 14) && !inRect(MOAT.outer, x, z)) return 0.6;
  return Math.max(0.15, 0.5 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 20, Math.hypot(x, z))));
}

// ── the water ────────────────────────────────────────────────────────────────
/** The nearest of the moat's water within 24 m: { p: [x, z] (a point at the stone), d } or null; the lap of the water at the wall. */
export function canalSpot(x, z) {
  let best = null;
  for (const r of moatRects()) { const px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z); if (d < 24 && (!best || d < best.d)) best = { p: [px, pz], d }; }
  return best;
}
export function shoreSpot(x, z, rnd) {
  const c = canalSpot(x, z);
  return c && c.d < 24 ? [c.p[0] + (rnd() - 0.5) * 6, c.p[1] + (rnd() - 0.5) * 6] : null;
}
/** A point on the moat's water or a pond within `reach` m (a fish rises by day, a frog sings by night), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  const ps = ponds().filter((p) => rectDist(p.rect, x, z) < reach);
  if (ps.length && rnd() < 0.5) { const r = ps[Math.floor(rnd() * ps.length)].rect; return [r[0] + 1 + rnd() * (r[2] - r[0] - 2), r[1] + 1 + rnd() * (r[3] - r[1] - 2)]; }
  const c = canalSpot(x, z);
  return c && c.d < reach ? [c.p[0] + (rnd() - 0.5) * 4, c.p[1] + (rnd() - 0.5) * 4] : null;
}
/** 0…1: how marshy the ground is (the frogs at night): by the moat and the ponds, and over the flooded paddies beyond 300 m. */
export function frogGround(x, z) {
  const d = waterDist(x, z);
  return Math.max(1 - sm(0, 30, d), Math.hypot(x, z) > 300 ? 0.7 : 0) * (Math.hypot(x, z) < RADIUS ? 1 : 0);
}
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = (x, z) => 1 - sm(0, 18, waterDist(x, z));

// ── what passes: the boats of the moat ──────────────────────────────────────
/** A reach of the moat's lane within 70 m of the listener for a boat to pass along: { pts }. */
function moatTrack(x, z, rnd) {
  const near = moatLanes().filter((r) => rectDist(r, x, z) < 70);
  if (!near.length) return null;
  const r = near[Math.floor(rnd() * near.length)], alongX = r[2] - r[0] > r[3] - r[1], a = alongX ? [r[0], (r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2, r[1]], b = alongX ? [r[2], (r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2, r[3]];
  return { pts: rnd() < 0.5 ? [a, b] : [b, a] };
}
export const TRACKS = [
  { key: 'moatboat', voice: 'boat', speed: 1.2, r50: 14, gap: [35, 90], ok: (hour, rain) => hour >= 5.5 && hour < 18.5 && rain < 0.6, get: (x, z, r) => moatTrack(x, z, r) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const sanct = mid(SANCT), terrace = [CX - 106, 0], roadX = (ROAD[0] + MOAT.outer[0]) / 2;
/** Fixed emitters: { voice, at, r50, gap [min, max] s, hours [from, to], dry?, rainMax?, after? }. */
export const EMITTERS = [
  // the offices of the temple [inferred: a Hindu temple of the 12th century: the conch and the chant at the first light and at dusk]
  { voice: 'akChant', at: sanct, r50: 24, gap: [30, 70], hours: [5.5, 7.2], after: true },
  { voice: 'akChant', at: sanct, r50: 24, gap: [40, 90], hours: [17.5, 18.8], after: true },
  { voice: 'akConch', at: terrace, r50: 80, gap: [90, 200], hours: [5.4, 6.4] },
  { voice: 'akConch', at: terrace, r50: 80, gap: [120, 260], hours: [17.8, 18.7] },
  // the teaching in the court of the third gallery: the pupils' recitation by day
  { voice: 'akChant', at: [CX + 12, -84], r50: 22, gap: [50, 110], hours: [7.5, 11], after: true },
  { voice: 'akChant', at: [CX - 22, 84], r50: 22, gap: [60, 130], hours: [14, 16.5], after: true },
  // the musicians and the dancers on the Terrace of Honour [stated: harps, drums, cymbals on the 12th-century reliefs]
  { voice: 'akHarp', at: [CX - 110, -9], r50: 22, gap: [60, 140], hours: [9, 11.5], after: true },
  { voice: 'akHarp', at: [CX - 110, 9], r50: 22, gap: [70, 150], hours: [16, 17.6], after: true },
  { voice: 'akDrum', at: [CX - 109, 9.6], r50: 28, gap: [50, 120], hours: [9, 11.5], after: true },
  { voice: 'akCymbals', at: [CX - 109, -9.6], r50: 26, gap: [60, 140], hours: [9.2, 11.5], after: true },
  // the market of the mats, 6 to 12 [stated: Zhou Daguan, 1296]
  ...[[-228, 16], [-216, 22], [-224, 30], [-212, 34], [-232, 36]].map((at, i) => ({ voice: 'akHawk', at, r50: 14, gap: [22 + i * 4, 60 + i * 6], hours: [6, 12], rainMax: 0.5 })),
  // the moat road: an elephant now and then, the ox-cart's bell
  { voice: 'akElephant', at: [roadX, -46], r50: 60, gap: [120, 300], hours: [8, 17], rainMax: 0.5 },
  { voice: 'akElephant', at: [roadX, 70], r50: 60, gap: [150, 320], hours: [8, 17], rainMax: 0.5 },
  { voice: 'akCattleBell', at: [roadX, 118], r50: 20, gap: [30, 80], hours: [6, 17], dry: true },
  // buffalo in the paddies and at the stakes, with their bells
  ...[[-262, 64], [140, 310], [-300, -260], [250, -300], [330, 120]].map((at, i) => ({ voice: i % 2 ? 'akBuffalo' : 'akCattleBell', at, r50: 30, gap: [30 + i * 6, 90 + i * 9], hours: [5.5, 18.5] })),
  // the temple's banners' halyards? no: the wind in the palms is the engine's; at night the geckos in the thatch near the arrival's houses
  ...houses().filter((h) => h.rect[0] < -195 && Math.abs(mid(h.rect)[1]) < 90).slice(0, 8).map((h, i) => ({ voice: 'akGecko', at: mid(h.rect), r50: 10, gap: [50 + i * 6, 130 + i * 9], hours: [19.5, 4.5], rainMax: 0.5 })),
];
void CAUSEWAY;
