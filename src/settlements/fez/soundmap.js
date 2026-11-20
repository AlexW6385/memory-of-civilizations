// Where Marinid Fez's sounds are (docs/settlements/fez.md §16): the places of the emitters and the geometry the audio engine needs (soundscape.js's
// `LIFE.map`, the interface of Suzhou's and Cairo's maps): the madrasa's basin and classrooms, the Qarawiyyin's circles and fountain, the coppersmiths of
// the Place Seffarine, the tannery's vats, the Oued Fes over its weirs, the wash-places of the quays, the dukkans by trade, the lanes' hawkers, mule
// strings and water sellers, pigeons and swifts, the rooms one can be inside, the night patrol. Pure data and functions of layout.js and houses.js.
// Coordinates: metres, +x east, +z south. [inferred throughout; what is [stated] is in the dossier.]

import { RADIUS, SITES, K, S, SOUKS, RIVER, BRIDGES, riverZ, inRect, soukRects, lanes, fountains } from './layout.js';
import { houseList, washPlaces } from './houses.js';
import { planOf } from '../../styles/marinid/house.js';
import { frame } from '../../styles/mamluk/kit.js';
import '../../engine/voices-fez.js';

export const HOME = [-132.5, -7.2];
export const FAR = {};
export const WELLS = [];                                         // Fez drew its water from fountains and the river, not from wells in the lanes
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** A deterministic 0..1 from numbers (no Math.random in the map's data). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the places ───────────────────────────────────────────────────────────────
const B = SITES.bou, Q = SITES.qar, T = SITES.tannery, SQ = SITES.seffarine, FQ = SITES.funduq;
const bx = (B[0] + B[2]) / 2, zN = B[1] + 8, cz0 = zN + 2.4, cz1 = B[3] - 9.6 - 0.7;
export const BOU_COURT = [B[0] + 8.8, cz0, B[2] - 8.8, cz1];
export const BOU_HALL = [B[0] + 6.4, cz1 + 0.7, B[2] - 6.4, B[3] - 1];
export const BOU_VESTIBULE = [bx - 1.7, B[1], bx + 1.7, zN];
const qn = (Q[2] - Q[0]) / 14;
export const QAR_HALL = [Q[0] + 1.2, Q[1] + 23.5, Q[2] - 1.2, Q[3] - 1.2];
export const QAR_SAHN = [Q[0] + qn * 4, Q[1] + 3.5, Q[0] + qn * 10, Q[1] + 23.5];
const QAR_NAVES = [[Q[0] + 1.2, Q[1] + 1.2, Q[0] + qn * 4, Q[1] + 23.5], [Q[0] + qn * 10, Q[1] + 1.2, Q[2] - 1.2, Q[1] + 23.5]];
const SOUK_RECTS = soukRects();

/** The trades' work heard from a dukkan: [voice, mean gap s]. */
export const TRADE_WORK = {
  bread: [['fezBake', 40], ['jarLid', 90]], pottery: [['clay', 30], ['jarLid', 55]], dates: [['sack', 45], ['coin', 70]], cloth: [['clothRustle', 30], ['scissors', 75]],
  slipper: [['fezSlipper', 22]], spice: [['mortar', 24], ['drawer', 60]], brass: [['copperBeat', 18]], books: [['paper', 30], ['drawer', 70]],
  perfume: [['jarLid', 45], ['coin', 80]], candle: [['pour', 55], ['coin', 80]], henna: [['mortar', 30], ['clay', 60]], embroidery: [['clothRustle', 40]],
  leather: [['fezLeather', 26]],
};
const wk = (list, hours = [7, 18.5]) => list.map(([v, g]) => [v, [g * 0.6, g * 1.4], hours]);
let SITES_LIST = null;
const HOUSES = () => houseList();
/** The rooms one can be inside and what is heard from them: { use, rect, at, id, work: [voice, [min, max] gap s, [from, to] hours] }. */
export function sites() {
  if (SITES_LIST) return SITES_LIST;
  const L = [
    { use: 'hall', rect: BOU_HALL, at: mid(BOU_HALL), id: 'bou:hall', work: wk([['recite', 55]], [5, 21]) },
    { use: 'hall', rect: BOU_VESTIBULE, at: mid(BOU_VESTIBULE), id: 'bou:vestibule', work: wk([['fezSteps', 50]], [5, 21]) },
    { use: 'hall', rect: QAR_HALL, at: mid(QAR_HALL), id: 'qar:hall', work: wk([['recite', 40], ['fezLesson', 70]], [4.5, 21.5]) },
    ...QAR_NAVES.map((r, i) => ({ use: 'hall', rect: r, at: mid(r), id: 'qar:naves' + i, work: wk([['fezLesson', 60]], [5, 21]) })),
  ];
  SOUK_RECTS.forEach((r, i) => L.push({ use: 'souk', rect: r, at: mid(r), id: 'souk:' + SOUKS[i].id, work: wk([['coin', 40], ['sack', 70]]) }));
  for (const h of HOUSES()) {
    if (!h.shops || Math.hypot(h.rect[0], h.rect[1]) > 300) continue;
    const P = planOf(h), fr = frame(h.rect, h.door);
    P.bays.forEach((b, k) => {
      const r = fr.rect(b.u0, b.u1, -1.45, 0), rr = [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];
      L.push({ use: 'shop:' + b.trade, rect: rr, at: mid(rr), id: `shop:${Math.round(rr[0])}:${Math.round(rr[1])}:${k}`, work: wk(TRADE_WORK[b.trade] || TRADE_WORK.spice) });
    });
  }
  return (SITES_LIST = L);
}
const houseRects = () => HOUSES().filter((h) => h.open).map((h) => ({ rect: h.rect, y: h.y }));

// ── the waters: the Oued Fes between its quays; no ponds, no boats ──
/** The nearest point of the river's quay wall, { p: [x, z], d, i }, or null. */
export function canalSpot(x, z) {
  if (Math.hypot(x, z) > RADIUS - 20) return null;
  const rz = riverZ(x), d = Math.abs(z - rz) - RIVER.w / 2;
  return { p: [x, rz + Math.sign(z - rz || 1) * RIVER.w / 2], d: Math.max(0, d), i: 0 };
}
export const canalTrack = () => null;
/** A walker's track across the nearest of the four bridges within `reach`. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  let best = null;
  for (const b of BRIDGES) { const at = [b.x, riverZ(b.x)], d = Math.hypot(at[0] - x, at[1] - z); if (d < reach && (!best || d < best.d)) best = { at, d }; }
  if (!best) return null;
  const h = RIVER.w / 2 + 3, s = rnd() < 0.5 ? 1 : -1;
  return { pts: [[best.at[0] + (rnd() - 0.5) * 0.8, best.at[1] - s * h], [best.at[0] + (rnd() - 0.5) * 0.8, best.at[1] + s * h]], d: best.d };
}
export const shoreSpot = () => null;
export const pondSpot = () => null;
export const frogGround = () => 0;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const streetTrack = () => null;                          // Suzhou's sedan chair, vendor and watchman are not Fez's: see TRACKS
export const treeSpot = () => null;                              // the engine's seasonal birds (cuckoo, oriole) are not Fez's
export function leafNear(x, z) { return Math.min(1, 0.08 + 0.3 * (1 - sm(0, 40, Math.abs(z - riverZ(x)) - RIVER.w))); }   // poplars and willows by the water; orange trees in the courts
export function greenNear(x, z) { return Math.max(0.05, 0.6 * leafNear(x, z)); }

// ── the lanes: a walker's track along the nearest street within reach ──
const STREET_RECTS = () => [...lanes().filter((l) => l.kind === 'street').map((l) => l.r), ...SOUK_RECTS];
function streetPath(x, z, rnd, reach, lead, onlySouk = false) {
  let best = null;
  const list = onlySouk ? SOUK_RECTS : STREET_RECTS();
  list.forEach((r, i) => {
    const px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z);
    if (d < reach && (!best || d < best.d)) best = { d, i };
  });
  if (!best) return null;
  const r = list[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = Math.min((horiz ? r[2] : r[3]) - 2, RADIUS - 40), near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.2;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
export const TRACKS = [
  { key: 'fezMule', voice: 'fezMule', speed: 1.2, r50: 12, gap: [45, 110], ok: day(6, 18.5), get: (x, z, rnd) => streetPath(x, z, rnd, 90, 40) },
  { key: 'fezGerrab', voice: 'fezGerrab', speed: 1.0, r50: 11, gap: [70, 150], ok: day(8, 18), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 30) },
  { key: 'fezVend', voice: 'fezVend', speed: 1.0, r50: 10, gap: [28, 65], ok: day(6.5, 19), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 32) },
  { key: 'fezWatch', voice: 'patrolSteps', speed: 1.0, r50: 13, gap: [50, 110], ok: (h, r) => (h >= 20.5 || h < 4.5) && r < 0.5, get: (x, z, rnd) => streetPath(x, z, rnd, 90, 34) },
];

/** 0..1: how much of the town's hubbub reaches (x, z): all in the souks and on the Talaa Kebira, much by the Qarawiyyin and the Seffarine, little in the derbs and the quarters of the edge. */
export function townNear(x, z) {
  if (SOUK_RECTS.some((r) => inRect(r, x, z, 3))) return 1;
  if (Math.abs(z - K.z) < 4 && x > -280 && x < 130) return 0.9;
  if (Math.abs(z - S.z) < 3.5 && x > -280 && x < 90) return 0.7;
  if (inRect(SQ, x, z, 6) || inRect(Q, x, z, 4)) return 0.85;
  return Math.max(0.15, 0.55 * (1 - 0.6 * sm(150, 330, Math.hypot(x, z))));
}

// ── the rooms (asked only when the listener is indoors) ──
/** The room the listener is in: { use, at, upper, same } or null. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const h of houseRects()) if (inRect(h.rect, x, z)) return { use: 'house', at: mid(h.rect), upper: y > h.y + 3.4, same: 'h:' + Math.round(h.rect[0]) + ':' + Math.round(h.rect[1]) };
  return null;
}
const R0 = { tone: [250, 0.22], roof: 0.5, hush: 0.8 };
export const ROOMS = {
  hall: { tone: [170, 0.3], roof: 0.3, hush: 0.45, work: [['fezSteps', 60]] },
  souk: { tone: [330, 0.45], roof: 0.5, hush: 0.9, work: [['coin', 40], ['sack', 70]] },
  house: { ...R0, work: [['broom', 90], ['clothRustle', 80]] },
};
for (const [t, w] of Object.entries(TRADE_WORK)) ROOMS['shop:' + t] = { ...R0, tone: t === 'brass' ? [420, 0.4] : [280, 0.25], hush: 0.85, work: w };
export const UPPER = { tone: [230, 0.15], roof: 1.0, hush: 0.6, work: [['clothRustle', 50], ['broom', 90]] };

// ── the emitters in the open: { voice, at, r50, gap [min, max] s, hours [from, to], dry, rainMax, lv, after, inside, id } ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const zl = [B[0] + 10, B[2] - 10];
export const COPPERS = [[SQ[0] + 5, SQ[1] + 6], [SQ[0] + 11, SQ[1] + 5], [SQ[0] + 18, SQ[1] + 7], [SQ[0] + 9, SQ[1] + 17], [SQ[0] + 20, SQ[1] + 18]];   // anvils before the shops (life.js seats the smiths)
export const VATS = [[T[0] + 14, T[1] + 22], [T[0] + 30, T[1] + 30], [T[0] + 44, T[1] + 24], [T[0] + 22, T[1] + 40]];
export const WASH = () => washPlaces().filter((w) => Math.hypot(w.x, riverZ(w.x)) < 260).map((w) => [w.x, riverZ(w.x) + w.side * (RIVER.w / 2 + 1.5)]);
const BREAD = () => HOUSES().filter((h) => h.shops?.includes('bread') && Math.hypot(h.rect[0], h.rect[1]) < 260).slice(0, 14).map((h) => mid(h.rect));
const CRAFT = () => HOUSES().filter((h) => h.up === 'craft').map((h) => mid(h.rect));
const RIADS = () => HOUSES().filter((h) => h.open && h.rich).slice(0, 5).map((h) => mid(h.rect));
const FOUNT = () => fountains().filter((f) => Math.hypot(f.at[0], f.at[1]) < 170).slice(0, 12).map((f) => f.at);
export const EMITTERS = [
  // the madrasa: the basin's fall of water, the lessons in the classrooms east and west of the court, the students' recitation in the prayer hall
  E('ottFountain', [bx, (cz0 + cz1) / 2], 10, [8, 18], [4, 22], { id: 'bou:basin' }),
  E('fezLesson', [zl[0], (cz0 + cz1) / 2], 10, [40, 90], [7, 17], { dry: true, after: true, id: 'bou:class-w' }),
  E('fezLesson', [zl[1], (cz0 + cz1) / 2], 10, [50, 100], [7, 17], { dry: true, after: true, id: 'bou:class-e' }),
  E('recite', mid(BOU_HALL), 12, [90, 170], [5, 21], { inside: 'bou:hall', after: true, id: 'bou:hall-recite' }),
  // the Qarawiyyin: the sahn's fountain, the circles of students at the pillars of the north gallery, the hall's recitation
  E('ottFountain', mid(QAR_SAHN), 12, [8, 18], [4, 22], { id: 'qar:fountain' }),
  ...[0, 1, 2].map((c) => E('fezLesson', [QAR_SAHN[0] + 5 + c * 9, Q[1] + 4.9], 14, [45 + c * 12, 100], [6, 17], { dry: true, after: true, id: 'qar:circle' + c })),
  E('recite', mid(QAR_HALL), 18, [80, 150], [4.5, 21.5], { inside: 'qar:hall', after: true, id: 'qar:recite' }),
  // the Place Seffarine: the coppersmiths beating at their anvils
  ...COPPERS.map((p, i) => E('copperBeat', p, 18, [16, 36], [7.5, 17.5], { dry: true, id: 'copper' + i })),
  // the tannery: bare feet in the vats, hides slapped on the stone
  ...VATS.map((p, i) => E('fezTannery', p, 20, [14, 30], [6.5, 18], { dry: true, id: 'tan' + i })),
  // the Oued Fes over a weir at each bridge, between its quays; the wash-places beside it
  ...BRIDGES.map((b, i) => E('fezWeir', [b.x, riverZ(b.x)], 13, [5, 11], [0, 24], { id: 'weir' + i, lv: 1 })),
  ...WASH().map((p, i) => E('fezWash', p, 9, [18, 42], [7, 16], { dry: true, id: 'wash' + i })),
  // the fountains set in the lanes' walls
  ...FOUNT().map((p, i) => E('ottFountain', p, 6, [10, 22], [4, 22], { id: 'wallfount' + i })),
  // the funduq's court: donkeys and muleteers, sacks set down
  E('donkeyBray', [(FQ[0] + FQ[2]) / 2, (FQ[1] + FQ[3]) / 2], 24, [90, 190], [6, 18], { dry: true, id: 'funduq:donkey' }),
  E('sack', [(FQ[0] + FQ[2]) / 2 - 4, (FQ[1] + FQ[3]) / 2 + 3], 10, [30, 70], [7, 17.5], { dry: true, id: 'funduq:sack' }),
  E('donkeyBray', [T[0] + 4, T[1] + 18], 24, [100, 200], [6, 18], { dry: true, id: 'tan:donkey' }),
  // the hawkers: the Talaa Kebira, the Talaa Seghira, the souks, the foot of the Qarawiyyin
  ...[[-120, K.z], [-60, K.z], [-5, K.z], [40, K.z], [70, K.z], [100, K.z], [-100, S.z], [-20, S.z], [60, S.z], [84, 2], [112, 2], [118, K.z]].map((p, i) => E('fezHawk', p, 14, [20, 52], [6.5, 19], { dry: true, id: 'hawk' + i })),
  // the bakers' ovens: loaves turned out in the early morning and again before the midday meal
  ...BREAD().map((p, i) => E('fezBake', p, 9, [40, 90], [5, 10], { dry: true, id: 'bake' + i })),
  ...BREAD().map((p, i) => E('fezBake', p, 9, [60, 120], [14, 17], { dry: true, id: 'bake2' + i })),
  // the weavers' looms in the craftsmen's houses
  ...CRAFT().map((p, i) => E('loom', p, 7, [20, 40], [7, 17], { dry: true, id: 'loom' + i })),
  // pigeons on the roofs, in the madrasa's court, at the Qarawiyyin and over the tannery (whose cotes gave the dung [stated: dossier §4.4])
  ...[[bx, (cz0 + cz1) / 2 + 3], mid(QAR_SAHN), [T[0] + 30, T[1] + 40], [-20, -40], [60, 10]].map((p, i) => E('fezPigeons', p, 20, [14 + (i % 3) * 5, 36], [6, 18.5], { dry: true, id: 'pigeon' + i })),
  // swifts screaming round the minarets at dusk
  E('fezSwift', [Q[0] + 60, Q[1] + 6], 40, [10, 24], [16.5, 19.5], { dry: true, id: 'swift:qar' }),
  E('fezSwift', [B[0] + 4, B[1] + 4], 40, [12, 28], [16.5, 19.5], { dry: true, id: 'swift:bou' }),
  // the evening: a rebab from a rich house's court
  ...RIADS().map((p, i) => E('fezRabab', p, 20, [160 + i * 30, 300], [19, 22.5], { dry: true, after: true, id: 'rebab' + i })),
  // the night: cats on the roofs, dogs far off
  ...[[-100, -60], [-190, -130], [-60, 60], [80, 30]].map((p, i) => E('catCry', p, 26, [80 + i * 20, 200], [22, 4], { dry: true, id: 'cat' + i })),
  ...[[-190, -90], [-90, -230], [60, 80]].map((p, i) => E('dogFar', p, 40, [60 + i * 15, 150], [23, 4.5], { dry: true, id: 'dog' + i })),
];
