// Where Mamluk Cairo's sounds are (docs/settlements/mamluk-cairo.md §18.3): the places of the emitters and the geometry the audio engine needs
// (soundscape.js's `LIFE.map`, the interface of Suzhou's, Isfahan's and Agra's maps): the sultan's band at the Citadel, the lessons and the recitation in
// Sultan Hasan's iwans and tomb, the court's basin, the coppersmiths and the water sellers of the Qasaba, the hawkers of the covered streets, the camels
// of the Rumayla and the khan, the kuttabs over the sabils, the dovecotes, the bath, the merchant's qa'a, the rooms one can be inside, the night patrol.
// Pure data and functions of layout.js. Coordinates: metres, +x east, +z south. [inferred throughout; what is [stated] is in the dossier.]

import { RADIUS, ARRIVAL, SQUARE, CITADEL, SUQ, SUQ2, SUQ3, QAA, KHAN, HAMMAM, SHOP, SABILS, STALLS, STREETS, BAYN, HASAN, lots, inRect } from './layout.js';
import { pickHomes } from './homes.js';
import { shops, tradeOf } from './layout.js';
import '../../engine/voices-cairo.js';

export const HOME = ARRIVAL;
export const FAR = {};
export const WELLS = [[QAA[0] + 11.5, QAA[1] + 9.5]];                // the merchant's court (wellBucket); the court's own well-head
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** A deterministic 0..1 from numbers (no Math.random in the map's data). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the places ───────────────────────────────────────────────────────────────
export const QIBLA_IWAN = [-10, 56, 10, 72], COURT = HASAN.court, VESTIBULE = [-41.5, 6, -33.5, 14];
const TC = [(HASAN.tomb[0] + HASAN.tomb[2]) / 2, (HASAN.tomb[1] + HASAN.tomb[3]) / 2];
export const TOMB = [TC[0] - 10, TC[1] - 10, TC[0] + 10, TC[1] + 10];
const IWANS = [[-7, 15, 7, 24, 'iwan:n'], [-24, 34, -17, 46, 'iwan:w'], [17, 34, 24, 46, 'iwan:e']];
const QAA_HALL = [QAA[0] + 3.6, QAA[1] + 0.7, QAA[2] - 3.4, QAA[1] + 6.5];
const HAMMAM_ROOMS = [[HAMMAM[0] + 0.7, HAMMAM[1] + 0.7, HAMMAM[0] + 12, HAMMAM[3] - 6, 'maslakh'], [HAMMAM[0] + 12.5, HAMMAM[1] + 0.7, HAMMAM[2] - 0.7, HAMMAM[3] - 6, 'hot']];
const SUQS = [SUQ, SUQ2, SUQ3];

/** The trades' work heard from a shop: [voice, [min, max] gap s]. */
const TRADE_WORK = {
  spice: [['mortar', 22], ['drawer', 60]], cloth: [['clothRustle', 30]], brass: [['copperBeat', 16]], pottery: [['jarLid', 50], ['clay', 30]],
  grain: [['sack', 36], ['coin', 70]], sweets: [['ladle', 36], ['coin', 70]], lamps: [['cups', 40], ['drawer', 70]], butcher: [['chop', 14]],
};
let SITES = null;
/** A site's work as the engine takes it: [voice, [min, max] gap s, [from, to] hours]. */
const wk = (list, hours = [7, 18.5]) => list.map(([v, g]) => [v, [g * 0.6, g * 1.4], hours]);
export function sites() {
  if (SITES) return SITES;
  SITES = [
    { use: 'iwan', rect: QIBLA_IWAN, at: mid(QIBLA_IWAN), id: 'qibla', work: wk([['recite', 40], ['caiLesson', 70]], [5, 21]) },
    ...IWANS.map((r) => ({ use: 'iwan', rect: r.slice(0, 4), at: mid(r), id: r[4], work: wk([['caiLesson', 60]], [5, 21]) })),
    { use: 'vestibule', rect: VESTIBULE, at: mid(VESTIBULE), id: 'vestibule', work: wk([['caiSteps', 50]], [5, 21]) },
    { use: 'tomb', rect: TOMB, at: mid(TOMB), id: 'tomb', work: wk([['recite', 30]], [5, 21]) },
    { use: 'qaa', rect: QAA_HALL, at: mid(QAA_HALL), id: 'qaa', work: wk([['caiOud', 90], ['cups', 40]], [19, 22.5]) },
    ...HAMMAM_ROOMS.map((r) => ({ use: 'hammam', rect: r.slice(0, 4), at: mid(r), id: 'hammam:' + r[4], work: wk([['hamamDrip', 7], ['caiBathPour', 20]], [5, 21]) })),
    { use: 'shop:spice', rect: [SHOP[0] + 0.5, SHOP[1] + 0.5, SHOP[2] - 0.5, SHOP[3] - 0.5], at: mid(SHOP), id: 'shop:main', work: wk(TRADE_WORK.spice) },
  ];
  for (const l of shops().open) {
    const tr = tradeOf(l), r = l.rect;
    SITES.push({ use: 'shop:' + tr, rect: [r[0] + 0.5, r[1] + 0.5, r[2] - 0.5, r[3] - 0.5], at: mid(r), id: `shop:${Math.round(r[0])}:${Math.round(r[1])}`, work: wk(TRADE_WORK[tr] || TRADE_WORK.spice) });
  }
  return SITES;
}
const houseRects = () => pickHomes().homes.map((l) => l.rect);

// ── the waters: the court's basin is an emitter; no canals, ponds or bridges in Cairo (the Nile is beyond the radius) ──
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const shoreSpot = () => null;
export const pondSpot = () => null;
export const frogGround = () => 0;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const streetTrack = () => null;                          // Suzhou's sedan chair, vendor and watchman are not Cairo's: see TRACKS

// ── the streets: a walker's track along the nearest street within reach ──
function streetPath(x, z, rnd, reach, lead, only = null) {
  let best = null;
  STREETS.forEach((r, i) => {
    if (r === SQUARE || r === BAYN && false) return;
    if (only && !only.includes(r)) return;
    const px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z);
    if (d < reach && (!best || d < best.d)) best = { d, i };
  });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = Math.min((horiz ? r[2] : r[3]) - 2, RADIUS - 40), near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2.4;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
export const TRACKS = [
  { key: 'caiSaqqa', voice: 'caiSaqqa', speed: 0.95, r50: 11, gap: [60, 140], ok: day(6.5, 18.5), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 30) },
  { key: 'caiVend', voice: 'caiVend', speed: 1.0, r50: 11, gap: [26, 60], ok: day(6.5, 19), get: (x, z, rnd) => streetPath(x, z, rnd, 80, 32) },
  { key: 'caiDonkey', voice: 'caiDonkeyBoy', speed: 1.3, r50: 14, gap: [70, 160], ok: day(6, 18), get: (x, z, rnd) => streetPath(x, z, rnd, 90, 40) },
  { key: 'caiWatch', voice: 'patrolSteps', speed: 1.0, r50: 13, gap: [40, 80], ok: (h, r) => (h >= 20.5 || h < 4.2) && r < 0.5, get: (x, z, rnd) => streetPath(x, z, rnd, 90, 34) },
];

// ── the planting: date palms and sycamore figs in the courts and the Rumayla's edge ──
export const treeSpot = () => null;                              // the engine's seasonal birds are not Cairo's; the doves and sparrows are emitters
export function leafNear(x, z) { return Math.min(1, 0.1 + 0.5 * (inRect(SQUARE, x, z, 6) ? 1 : 0) + 0.2 * (1 - sm(0, 60, Math.hypot(x - QAA[0], z - QAA[1])))); }
export function greenNear(x, z) { return Math.max(0.06, 0.8 * leafNear(x, z)); }
/** 0..1: how much of the town's hubbub reaches (x, z): all in the covered streets and on the Qasaba, much on the Rumayla, little on the spur. */
export function townNear(x, z) {
  if (SUQS.some((r) => inRect(r, x, z, 4)) || inRect(BAYN, x, z, 8) || inRect([-166, -440, -154, 440], x, z, 4)) return 1;
  if (inRect(SQUARE, x, z, 4)) return 0.85;
  return Math.max(0.15, 0.7 * (1 - 0.6 * sm(200, 420, Math.hypot(x, z))) * (Math.hypot(x - CITADEL.c[0], z - CITADEL.c[1]) < CITADEL.r ? 0.4 : 1));
}

// ── the rooms (asked only when the listener is indoors) ──
/** The room the listener is in: { use, at, upper, same } or null. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const S of SUQS) if (inRect(S, x, z)) return { use: 'suq', at: [(S[0] + S[2]) / 2, z], upper: false, same: 'suq:' + S[0] };
  for (const r of houseRects()) if (inRect(r, x, z)) return { use: 'house', at: mid(r), upper: y > 3.4, same: 'h:' + Math.round(r[0]) + ':' + Math.round(r[1]) };
  return null;
}
const R0 = { tone: [260, 0.22], roof: 0.6, hush: 0.8 };
export const ROOMS = {
  iwan: { tone: [180, 0.3], roof: 0.3, hush: 0.45, work: [['caiSteps', 60]] },
  vestibule: { tone: [220, 0.3], roof: 0.3, hush: 0.6, work: [['caiSteps', 50]] },
  tomb: { tone: [150, 0.25], roof: 0.3, hush: 0.4, work: [['caiSteps', 80]] },
  qaa: { tone: [300, 0.3], roof: 0.7, hush: 0.7, work: [['cups', 60]] },
  hammam: { tone: [380, 0.4], roof: 0.5, hush: 0.9, work: [['hamamDrip', 6]] },
  suq: { tone: [330, 0.45], roof: 0.5, hush: 0.9, work: [['coin', 40], ['sack', 70]] },
  house: { ...R0, work: [['broom', 90]] },
  'shop:spice': { ...R0, tone: [280, 0.25], hush: 0.8, work: TRADE_WORK.spice },
  'shop:cloth': { ...R0, hush: 0.85, work: TRADE_WORK.cloth },
  'shop:brass': { ...R0, tone: [420, 0.4], hush: 1.0, work: TRADE_WORK.brass },
  'shop:pottery': { ...R0, work: TRADE_WORK.pottery },
  'shop:grain': { ...R0, work: TRADE_WORK.grain },
  'shop:sweets': { ...R0, work: TRADE_WORK.sweets },
  'shop:lamps': { ...R0, work: TRADE_WORK.lamps },
  'shop:butcher': { ...R0, hush: 0.9, work: TRADE_WORK.butcher },
};
export const UPPER = { tone: [230, 0.15], roof: 1.0, hush: 0.6, work: [['clothRustle', 50], ['broom', 90]] };

// ── the emitters in the open: { voice, at, r50, gap [min, max] s, hours [from, to], dry, rainMax, lv, after, inside, id } ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const CIT_GATE = [CITADEL.c[0] - 70, CITADEL.c[1] - 70];
export const COPPERS = [[-160, -190], [-160, -170], [-158, -135]];            // the coppersmiths' stretch of the Qasaba, south of the Bayn (Suq al-Nahhasin stood on the Qasaba)
export const DOVECOTES = [[-102, -75], [-130, -60], [-60, -92], [-210, -110], [-186, -150], [-20, 130], [-70, 60], [-125, 90]];
export const EMITTERS = [
  // the sultan's band at the Citadel: at dawn and at sunset [inferred: the Mamluk tablkhana played at set hours, as the naubat did elsewhere]
  E('caiTabl', CIT_GATE, 80, [60, 90], [5.7, 6.4], { dry: true, rainMax: 0.7, after: true, id: 'tabl:dawn' }),
  E('caiTabl', CIT_GATE, 80, [60, 90], [17.6, 18.4], { dry: true, rainMax: 0.7, after: true, id: 'tabl:dusk' }),
  // the madrasa's court: the basin's fall of water (a plain octagonal basin, dossier §4)
  E('ottFountain', [0, 40], 10, [8, 18], [4, 22], { id: 'hasan:basin' }),
  // the kuttabs over the sabils: the children's chorus through the morning and after the noon prayer
  ...SABILS.map((p, i) => E('caiKuttab', p, 22, [50 + i * 10, 110], [7.5, 12], { dry: true, after: true, id: 'kuttab' + i })),
  ...SABILS.map((p, i) => E('caiKuttab', p, 22, [80 + i * 10, 150], [13.5, 15.5], { dry: true, after: true, id: 'kuttab2' + i })),
  // the coppersmiths' beating on the Qasaba
  ...COPPERS.map((p, i) => E('copperBeat', p, 18, [18, 40], [7.5, 17], { dry: true, id: 'copper' + i })),
  // the sherbet stands and the water sellers' pitch on the Rumayla and in the khan's lane
  ...STALLS.map((s, i) => E('caiSaqqa', s.at, 14, [40, 90], [9, 18.5], { dry: true, id: 'sherbet' + i })),
  // the hawkers: the covered streets, the Qasaba, the east-west street, the Rumayla
  ...[[-37.5, -90], [-37.5, -50], [-88, -250], [-66, -250], [-160, -215], [-160, -100], [-60, -120], [60, -120], [100, 0], [120, 60]].map((p, i) => E('caiHawk', p, 14, [22, 55], [6.5, 19], { dry: true, id: 'hawk' + i })),
  // the camels on the Rumayla below the Citadel's road and in the khan's court; donkeys at the market street's north gate
  E('caiCamel', [SQUARE[2] - 14, SQUARE[3] - 20], 20, [60, 130], [5.5, 18.5], { dry: true, id: 'camel:sq' }),
  E('caiCamel', [SQUARE[0] + 12, -20], 18, [80, 160], [5.5, 18.5], { dry: true, id: 'camel:sq2' }),
  E('caiCamel', [KHAN[0] + 22, (KHAN[1] + KHAN[3]) / 2], 22, [50, 110], [5.5, 18.5], { dry: true, id: 'camel:khan' }),
  E('donkeyBray', [SQUARE[0] + 8, 61], 24, [80, 170], [6, 18], { dry: true, id: 'donkey:sq' }),
  E('donkeyBray', [SUQ[0] + 10, SUQ[1] - 4], 24, [100, 200], [6, 18], { dry: true, id: 'donkey:suq' }),
  // the pigeons of the roofs' dovecotes (Lane: pigeon-houses on the tops of the houses), by day
  ...DOVECOTES.map((p, i) => E('caiDove', p, 20, [14 + (i % 3) * 5, 36], [6, 18.5], { dry: true, id: 'dove' + i })),
  // the khan's court: bargaining, the cups of the sherbet seller
  E('cups', [KHAN[0] + 10, KHAN[1] + 12], 14, [26, 60], [8, 18], { dry: true, id: 'khan:cups' }),
  // the evening: an oud from a house on the Bayn, the cats on the roofs at night
  E('caiOud', mid(QAA_HALL), 20, [140, 260], [18.5, 22.5], { dry: true, inside: 'qaa', after: true, id: 'oud:house' }),
  ...[[-100, -60], [-190, -130], [-60, 100]].map((p, i) => E('catCry', p, 26, [80 + i * 20, 200], [22, 4], { dry: true, id: 'cat' + i })),
  // the dogs of the lanes bark in the small hours, further off than the engine's own far dogs
  ...[[-190, -90], [-90, -230], [60, 80]].map((p, i) => E('dogFar', p, 40, [60 + i * 15, 150], [23, 4.5], { dry: true, id: 'dog' + i })),
];
void lots;
