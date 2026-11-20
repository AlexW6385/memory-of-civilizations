// Where Southern Song Lin'an's sounds are (docs/settlements/song-hangzhou.md §31): the places of its emitters and the geometry the audio engine needs to
// put each sound where it is made (src/engine/voices.js `placed()`, voices-hangzhou.js): the canal with its boats and lock, the Qiantang's bore, the
// Imperial Way's hawkers and night market, the wazi's stage, the tea houses and wine houses, Kaihua Temple's bell and drum, the pagoda's wind bells.
// Pure data and functions of layout.js and ways.js (no three.js). Coordinates: metres, +x east, +z south, the settlement's own frame.
// The engine's bell schedule is off for this place (`bells: null`): the temple's hours are emitters below.

import '../../engine/voices-hangzhou.js';
import { RADIUS, WALL, ROAD, CANAL, CITY, PAGODA, T2, WAZI, IMPERIAL, CANAL_BRIDGES, WATER_GATE, inRect, lots, riverTeaHouses } from './layout.js';
import { streets, inLake, lakeDist } from './ways.js';

/** Where the audio puts the listener when the engine gives none (the arrival, at the foot of the pagoda's stair on the river road). */
export const HOME = [-110, 138];

/** A deterministic 0…1 from numbers (no Math.random in the choice of places). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid2 = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
const hot = (x, z) => Math.min(Math.hypot(x - HOME[0], z - HOME[1]), Math.hypot(x - IMPERIAL[0] - 8, z + 100));

// ── the temple and the pagoda ─────────────────────────────────────────────────────
/** Kaihua Temple on the upper terrace: the bell at its east end, the drum at its west, the hall between [inferred: positions; the terrace is T2]. */
export const TEMPLE = { bell: [T2.rect[2] - 6, 14], drum: [T2.rect[0] + 6, 14], hall: [-110, 10], rect: [-129, -4, -91, 24], pagoda: PAGODA.c };

// ── the trades (as the lots' seeds give them; inferred from the Way's richer mix) ──────
const IW_TRADES = ['silk', 'tea', 'wine', 'books', 'medicine', 'lacquer', 'fans', 'incense'];
const LANE_TRADES = ['food', 'wares', 'food', 'tea', 'incense', 'wares', 'medicine', 'pawn'];
const onWay = (l) => { const [x, z] = mid2(l); return x > IMPERIAL[0] - 20 && x < IMPERIAL[2] + 20 && z > IMPERIAL[1] && z < IMPERIAL[3]; };
const tradeOf = (l) => { if (!l.shop) return null; const T = onWay(l) ? IW_TRADES : LANE_TRADES; return T[Math.floor(hash(l.seed, 5) * T.length)]; };
let LOTS = null;
const all = () => LOTS || (LOTS = lots().filter((l) => Math.hypot(...mid2(l)) < RADIUS - 40));
const wide = (l) => l.rect[2] - l.rect[0] >= 8 && l.rect[3] - l.rect[1] >= 8;
/** Tea houses: the three on the river road and every wide shop whose trade is tea. */
export function teaHouses() { const r = new Set(riverTeaHouses()); return all().filter((l) => r.has(l) || (l.shop && wide(l) && tradeOf(l) === 'tea')); }
/** Wine houses: the wide Imperial Way shops whose trade is wine. */
export function wineHouses() { return all().filter((l) => l.shop && wide(l) && tradeOf(l) === 'wine' && onWay(l)); }
const lotAt = (x, z) => all().find((l) => inRect(l.rect, x, z)) || null;

/** [voice, gap [min, max], hours [from, to]] by trade: what is heard from a working shop. [inferred from the trade] */
const WORK = {
  medicine: [['mortar', [18, 40], [7, 18]]],
  books: [['chisel', [14, 30], [8, 17.5]]],           // block-cutters: Lin'an was a printing town [inferred]
  food: [['kitchen', [10, 22], [5, 23]]],
  silk: [['loom', [20, 50], [8, 18]]],
  lacquer: [['brushLacquer', [30, 70], [8, 17]]],
  fans: [['paper', [30, 70], [8, 18]]],
  wares: [['drawer', [30, 70], [8, 18]]],
  pawn: [['abacus', [20, 50], [8, 18]]],
};
let SITES = null;
/** The shops with sounds: every second working lot within 230 m of the hot spots: { use, rect, at, id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of all()) {
    const t = tradeOf(l), [x, z] = mid2(l);
    if (!t || !WORK[t] || l.seed % 2 || hot(x, z) > 230) continue;
    SITES.push({ use: t, rect: l.rect, at: [x, z], id: 'lot:' + l.seed, work: WORK[t] });
  }
  return SITES;
}
/** The wells in the lanes' edges within 200 m of the hot spots. */
export const WELLS = (() => { const w = []; for (const s of streets()) { const [x0, z0, x1, z1] = s; if (Math.min(x1 - x0, z1 - z0) < 5 || Math.min(x1 - x0, z1 - z0) > 12) continue; const horiz = x1 - x0 > z1 - z0, n = Math.floor((horiz ? x1 - x0 : z1 - z0) / 85); for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, p = horiz ? [x0 + (x1 - x0) * t, z0 + 1] : [x0 + 1, z0 + (z1 - z0) * t]; if (hot(p[0], p[1]) < 200) w.push(p); } } return w; })();
/** The place far off heard from here: the palace's drums on Phoenix Hill beyond the disc [inferred]. */
export const FAR = { tower: [0, -900], hanshan: [0, -900] };

// ── the canal, the river and the streets ──────────────────────────────────────────
const CANAL_RECT = [CANAL.x0 + 2, CANAL.z0, CANAL.x1 - 2, CANAL.z1 - 6];
/** The nearest point of the canal's water to (x, z), the distance and the index. */
export function canalSpot(x, z) { const p = nearIn(CANAL_RECT, x, z); return { p, d: Math.hypot(p[0] - x, p[1] - z), i: 0 }; }
/** A boat's track on the canal: along its middle, a pass by the nearest point, starting `lead` m before it; null if beyond `reach`. */
export function canalTrack(x, z, rnd, reach = 70, lead = 38) {
  const c = canalSpot(x, z);
  if (c.d > reach) return null;
  const lo = CANAL_RECT[1] + 6, hi = CANAL_RECT[3] - 6, near = Math.max(lo, Math.min(hi, z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 14) return null;
  const xx = (CANAL.x0 + CANAL.x1) / 2 + dir * 1.2 * rnd();
  return { pts: [[xx, a], [xx, b]] };
}
const STREET_LIST = () => streets().filter((r) => Math.min(r[2] - r[0], r[3] - r[1]) >= 5);
/** A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  const S = STREET_LIST();
  S.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d) && Math.hypot(p[0], p[1]) < RADIUS - 20) best = { p, d, i }; });
  if (!best) return null;
  const r = S[best.i], horiz = r[2] - r[0] > r[3] - r[1], midl = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, midl + off], [b, midl + off]] } : { pts: [[midl + off, a], [midl + off, b]] };
}
/** The nearest of the canal's arched bridges within `reach`: a walker's track over it along the street. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  const xm = (CANAL.x0 + CANAL.x1) / 2;
  let best = null;
  for (const bz of CANAL_BRIDGES) { const d = Math.hypot(xm - x, bz - z); if (d < reach && (!best || d < best.d)) best = { bz, d }; }
  if (!best) return null;
  const s = rnd() < 0.5 ? 1 : -1, h = 10;
  return { pts: [[xm - s * h, best.bz + (rnd() - 0.5) * 2], [xm + s * h, best.bz + (rnd() - 0.5) * 2]], d: best.d };
}
const wet = (px, pz, m = 0) => (pz > WALL.z1 + m && Math.abs(px) < RADIUS - 30) || (px > CANAL.x0 + m && px < CANAL.x1 - m && pz > CANAL.z0 && pz < CANAL.z1) || inLake(px, pz);
/** A point on water within `reach` of (x, z) (a ring of tries; for the fish), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  for (let k = 0; k < 14; k++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (wet(px, pz, 2)) return [px, pz]; }
  return null;
}
/** The water's edge near (x, z) (for the lap): the edge nearest on a ray in a random direction, or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = wet(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const px = x + c * d, pz = z + s * d, w = wet(px, pz); if (w !== prev) return [px, pz]; prev = w; }
  }
  return null;
}

// ── the planting ──────────────────────────────────────────────────────────────────
/** 0…1: how wooded is (x, z): the hill's woods round the temple, the lake's willows and peaches, the courts' old trees. */
export function treeness(x, z) {
  const hill = 1 - ss(0, 90, Math.hypot(x + 150, z + 20) - 60), lake = 1 - ss(0, 30, Math.abs(lakeDist(x, z)));
  return Math.max(0.1, 0.7 * hill, 0.6 * lake);
}
/** A tree to put a bird or a cicada in, near (x, z), on land: null if none. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !wet(px, pz) && !lotAt(px, pz) && treeness(px, pz) > 0.25 + 0.5 * rnd()) return [px, pz];
  }
  return null;
}
/** Bamboo on the hill's lower slope, a little. */
export function bambooNear(x, z) { return 0.25 * (1 - ss(0, 120, Math.hypot(x + 150, z))); }
/** 0…1: broad leaves in wind: the hill, the lake's willows. */
export function leafNear(x, z) { return Math.min(1, Math.max(0.15, treeness(x, z))); }
/** Lotus on the West Lake's shallows (the dossier plants lotus on the shore band). */
export function lotusNear(x, z) { return 0.6 * (1 - ss(0, 40, Math.abs(lakeDist(x, z)))); }
/** 0…1: green round (x, z) for the insects. */
export function greenNear(x, z) { return Math.max(treeness(x, z) * 0.85, 0.12); }
/** 0…1: how much of the town's hubbub reaches (x, z): all of it on the Way and the lanes, less on the river road, the hill and the lake. */
export function townNear(x, z) {
  if (inRect(TEMPLE.rect, x, z, 6)) return 0.15;
  const way = 1 - 0.7 * ss(20, 200, Math.abs(x - 28)) ;
  return Math.max(0.08, Math.min(1, way * (z < ROAD.z0 - 4 ? 1 : 0.6)) * (1 - 0.7 * ss(CITY.zn + 60, CITY.zn - 60, z)));
}
/** 0…1: wet ground (the frogs): the lake's shore, the canal's banks. */
export function frogGround(x, z) { return Math.max(0.8 * (1 - ss(0, 30, Math.abs(lakeDist(x, z)))), 0.4 * (1 - ss(0, 20, canalSpot(x, z).d))); }

// ── the rooms ─────────────────────────────────────────────────────────────────────
/** The room the listener is in: { use, at, upper, same } or null in the open: the temple's hall, a lot's front room (by trade: tea, wine, house, …). */
export function roomAt(x, z, y = 0) {
  if (inRect(TEMPLE.rect, x, z)) return { use: 'temple', at: TEMPLE.hall, upper: false, same: 'temple:main' };
  const l = lotAt(x, z);
  if (!l) return null;
  const tea = teaHouses().includes(l), wine = wineHouses().includes(l), t = tea ? 'tea' : wine ? 'wine' : tradeOf(l);
  return { use: t && ROOMS[t] ? t : 'house', at: mid2(l), upper: y > 2.4, same: 'lot:' + l.seed };
}
/** Each room's colour and small sounds (as Suzhou's ROOMS): `tone` [lowpass Hz, level], `roof` the rain's loudness, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  tea: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['teaClink', 12]] },
  wine: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['jarLid', 40]] },
  medicine: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 40]] },
  books: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 36]] },
  food: { tone: [500, 0.5], roof: 1.0, hush: 0.9, work: [['bowlClack', 14]] },
  silk: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 26]] },
  lacquer: { tone: [220, 0.15], roof: 1.0, hush: 0.6, work: [['brushLacquer', 30]] },
  fans: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 40]] },
  incense: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 50]] },
  wares: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 70]] },
  pawn: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['abacus', 40]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  temple: { tone: [130, 0.3], roof: 0.6, hush: 0.45, work: [['woodfish', 70]] },
};
/** The upper rooms: close under the tiles, the rain loud. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40], ['teaClink', 50]] };

// ── the emitters in the open ──────────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const wz = [(WAZI.rect[0] + WAZI.rect[2]) / 2, (WAZI.rect[1] + WAZI.rect[3]) / 2];
export const EMITTERS = [
  // 晨钟暮鼓 [inferred]: the bell at dawn, the drum and then the bell at dusk; windows shorter than the voice, so each sounds once
  E('hzTempleBell', TEMPLE.bell, 95, [10, 12], [4.7, 4.95], { after: true }),
  E('hzTempleDrum', TEMPLE.drum, 80, [10, 12], [17.9, 18.15], { after: true }), E('hzTempleBell', TEMPLE.bell, 95, [10, 12], [18.2, 18.45], { after: true }),
  E('hzWindBell', [PAGODA.c[0], PAGODA.c[1]], 38, [3, 8], [0, 24]),
  // the Qiantang bore, from the river, an afternoon hour [stated: the bore watched from the Liuhe Pagoda's bank; the hour inferred]
  E('hzBore', [-60, WALL.z1 + 140], 260, [40, 70], [13.6, 14.4], { dry: true, after: true }),
  // the canal's lock at the river end of the water gate, by day
  E('hzLock', [(CANAL.x0 + CANAL.x1) / 2, WALL.z0 - 6], 34, [60, 140], [7, 17.5], { dry: true, after: true }),
  // the river boatmen at the wall's foot
  E('hzBoatSong', [-30, WALL.z1 + 12], 40, [50, 120], [6, 18.5], { after: true }),
  // the wazi: the show in the afternoon and into the night (the stage's hours; the wazi traded day and night [stated: aisixiang 121268])
  E('hzStage', wz, 30, [30, 80], [12, 23.5], { after: true }),
  // the tea houses' storytellers and the wine houses' singers
  ...teaHouses().map((l) => E('hzStory', mid2(l), 14, [45, 100], [8, 23], { inside: 'lot:' + l.seed, after: true })),
  ...wineHouses().map((l) => E('hzSong', mid2(l), 15, [30, 75], [11, 24.2], { inside: 'lot:' + l.seed, after: true })),
  // a street singer's qin-like plucked string and a flute over the water at dusk
  E('xiao', [-60, WALL.z0 - 4], 30, [70, 160], [17, 21], { rainMax: 0.4, after: true }),
];

/** The passing sounds of this place (voices.js `placed`: `TRACKS`): the hawkers by day, the night market's calls into the night. */
export const TRACKS = [
  { key: 'hawk', voice: 'hzHawker', speed: 1.0, r50: 12, gap: [22, 50], ok: (hour, rain) => hour >= 6 && hour < 18.5 && rain < 0.6, get: (x, z, r) => streetTrack(x, z, r, 90, 34) },
  { key: 'night', voice: 'hzNightCall', speed: 1.0, r50: 13, gap: [18, 45], ok: (hour, rain) => (hour >= 18.5 || hour < 3) && rain < 0.6, get: (x, z, r) => streetTrack(x, z, r, 90, 32) },
];
void WATER_GATE;
