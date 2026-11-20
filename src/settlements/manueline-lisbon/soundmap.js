// Where Lisbon's sounds are (docs/settlements/manueline-lisbon.md §13.2): the places of the emitters and the geometry the audio engine
// needs to put each sound where it is made — the Ribeira das Naus's mallets, saws, adzes, pitch kettles, cranes and ropewalk, the gangs
// on the quay, the fishwives of the Terreiro, the fountains, the bells of the Jerónimos and the Sé, the scales of the Casa da Índia, the
// merchants' shops of the Rua Nova that work, the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js and src/engine/voices-lisbon.js.
// Metres, +x east, +z south, the settlement's own frame. [inferred throughout: no recording of 1520 exists.]

import { RADIUS, CHURCH, CLOISTER, MONASTERY, PLAZA, TOWER, PALACE, TERREIRO, YARD, QUAY, RUA_NOVA, SE, CASTLE, SQUARE, SLIPS, ZS, shore, lots, inRect, wet } from './layout.js';
import '../../engine/voices-lisbon.js';

/** Where the audio puts the listener when the engine gives none: the arrival (arrivals.js). */
export const HOME = [-206, 117];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

// ── the workshops ──────────────────────────────────────────────────────────────
/**
 * The work heard from each open house by its trade: [voice, gap in seconds [min, max], hours [from, to]]. The hours are [inferred] from the
 * trades: the baker's before dawn, the shops and workshops in the daylight, the tavern into the night.
 */
const WORK = {
  spice: [['mortar', [18, 40], [7, 18]]],
  porcelain: [['drawer', [30, 70], [7, 18]], ['jarLid', [40, 90], [7, 18]]],
  cloth: [['scissors', [20, 45], [7, 18]], ['clothRustle', [24, 50], [7, 18]]],
  jeweller: [['chisel', [12, 30], [7, 18]], ['coin', [30, 70], [7, 18]]],
  parrots: [['lsbParrot', [16, 40], [7, 18.5]]],
  chandler: [['sack', [24, 50], [7, 18]], ['lsbBlock', [30, 70], [7, 18]]],
  grocer: [['sack', [24, 50], [6.5, 18.5]], ['coin', [40, 90], [6.5, 18.5]]],
  apothecary: [['mortar', [14, 32], [7, 19]], ['jarLid', [40, 90], [7, 19]]],
  tavern: [['teaTalk', [8, 18], [8, 23.5]], ['teaClink', [14, 36], [8, 23.5]], ['pourWine', [24, 56], [8, 23.5]]],
  baker: [['sack', [24, 50], [3, 11]], ['kitchen', [16, 30], [3, 11]]],
  sailmaker: [['clothRustle', [18, 40], [7, 18]], ['lsbBlock', [40, 90], [7, 18]]],
  scribe: [['paper', [16, 36], [8, 17]]],
  cooper: [['lsbCooper', [14, 30], [7, 18]]],
  smith: [['hammer', [8, 20], [7, 18]]],
  home: [['bowlClack', [30, 70], [6, 21]], ['broom', [40, 90], [6.5, 18]]],
};
let SITES = null;
/** The open houses with sounds: { use, rect, at: [x, z] (the middle), id, work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) if (l.open && WORK[l.use]) SITES.push({ use: l.use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[l.use] });
  return SITES;
}
/** No wells with a bucket on a windlass beyond the plaza's one (life.js: at −236, 96). */
export const WELLS = [[-236, 96]];

// ── the water, the streets ─────────────────────────────────────────────────────
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const pondSpot = () => null;
/** The Tagus's edge near (x, z): the stone of the quay (or the beach's sand at Belém) where a ray from the listener first meets the water, for the lap; null if far. */
export function shoreSpot(x, z, rnd, reach = 22) {
  const px = x + (rnd() - 0.5) * 30, sz = shore(px);
  if (Math.abs(sz - z) > reach + 8) return null;
  return [px, sz + 0.4];
}
/** The streets of the walking tracks: [x0, z0, x1, z1] runs. */
const STREETS = [[RUA_NOVA[0], -6, RUA_NOVA[2], -6], [QUAY[0], 98, QUAY[2], 98], [PLAZA[0] + 8, 76, PLAZA[2] - 10, 76], [TERREIRO[0], 62, TERREIRO[2], 62], ...ZS.slice(0, 5).map((z) => [-290, z, 250, z])];
/** A walker's track along the street nearest (x, z) within `reach`, passing the nearest point: { pts } or null. */
export function walkTrack(x, z, rnd, reach = 80, lead = 30) {
  let best = null;
  STREETS.forEach((r, i) => {
    const horiz = r[3] === r[1], lo = horiz ? r[0] : r[1], hi = horiz ? r[2] : r[3], a = horiz ? x : z, d = Math.hypot(horiz ? Math.max(lo - a, 0, a - hi) : z - Math.max(lo, Math.min(hi, z)), horiz ? z - r[1] : x - r[0]);
    if (d < reach && (!best || d < best.d)) best = { d, i };
  });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[3] === r[1], lo = (horiz ? r[0] : r[1]) + 4, hi = (horiz ? r[2] : r[3]) - 4, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.9 + 0.8 * rnd())));
  if (Math.abs(b - a) < 12) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, r[1] + off], [b, r[1] + off]] } : { pts: [[r[0] + off, a], [r[0] + off, b]] };
}
/** The engine's own street tracks (a sedan chair, a hawker's rattle-drum, the clapper-watchman) are Chinese: none here. */
export const streetTrack = () => null;
const dry = (rain, m) => rain < m;
export const TRACKS = [
  { key: 'cart', voice: 'lsbCart', speed: 1.2, r50: 16, gap: [30, 75], ok: (h, rain) => h >= 6.5 && h < 18 && dry(rain, 0.7), get: (x, z, r) => walkTrack(x, z, r, 90, 40) },
  { key: 'cry', voice: 'lsbCry', speed: 1.1, r50: 12, gap: [22, 55], ok: (h, rain) => h >= 6 && h < 13.5 && dry(rain, 0.5), get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
];

// ── the planting ───────────────────────────────────────────────────────────────
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;
/** A tree to put a bird in near (x, z): the cloister's orange grove, the hills' pines and oaks, the shore's tamarisks. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (inRect(CLOISTER, px, pz, -8)) return [px, pz];
    if (Math.hypot(px, pz) > RADIUS - 85 && Math.hypot(px, pz) < RADIUS - 12 && wet(px, pz) > 2) return [px, pz];
  }
  return null;
}
/** 0…1: broad-leaved tree round: the cloister's orange court, the hills, the shore, the streets little. */
export function leafNear(x, z) {
  const court = inRect(CLOISTER, x, z, 10) ? 0.7 : 0;
  return Math.min(1, Math.max(0.12, court, 0.55 * sm(RADIUS - 100, RADIUS - 40, Math.hypot(x, z))));
}
/** 0…1: green round, for the crickets: the court, the rim, the shore's reeds. */
export function greenNear(x, z) {
  return Math.max(inRect(CLOISTER, x, z, 6) ? 0.7 : 0, 0.8 * sm(RADIUS - 110, RADIUS - 45, Math.hypot(x, z)), 0.06);
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it on the Terreiro, the quay and the Rua Nova, less in the lanes, on the river and at the rim, a little in the yard (its own noise covers it). */
export function townNear(x, z) {
  if (inRect(CHURCH, x, z)) return 0.35;
  const open = inRect(TERREIRO, x, z, 4) || inRect(PLAZA, x, z) || inRect(RUA_NOVA, x, z, 8) || inRect(QUAY, x, z, 5) ? 1 : 0.7;
  const river = wet(x, z) < 0 ? 0.35 : 1;
  return Math.max(0.1, open * river * (1 - 0.6 * sm(RADIUS - 120, RADIUS - 30, Math.hypot(x, z))));
}

// ── the rooms ──────────────────────────────────────────────────────────────────
let ROOM_LOTS = null;
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: the open houses' trades, 'church'
 * (the Jerónimos' church, the Sé, the Tower's chapel is 'house'), 'hall' (the palace's), 'house' (any other building).
 */
export function roomAt(x, z, y = 0) {
  const up = y > 5.2;
  if (inRect(CHURCH, x, z)) return { use: 'church', at: mid(CHURCH), upper: false, same: 'jeronimos' };
  if (inRect(CLOISTER, x, z)) return { use: 'cloister', at: mid(CLOISTER), upper: false, same: 'jeronimos' };
  if (inRect(SE, x, z)) return { use: 'church', at: mid(SE), upper: false, same: 'se' };
  if (inRect(PALACE, x, z)) return { use: 'hall', at: mid(PALACE), upper: false, same: 'palace' };
  if (inRect([TOWER.c[0] - 11, TOWER.c[1] - 5, TOWER.c[0] + 11, TOWER.c[1] + 9], x, z)) return { use: 'house', at: TOWER.c, upper: up, same: 'tower' };
  if (inRect(CASTLE, x, z)) return { use: 'hall', at: mid(CASTLE), upper: up, same: 'castle' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: up, same: s.id };
  if (!ROOM_LOTS) ROOM_LOTS = lots();
  for (const l of ROOM_LOTS) if (inRect(l.rect, x, z)) return { use: 'house', at: mid(l.rect), upper: up, same: 'lot:' + l.seed };
  return null;
}
/**
 * What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the tiles is
 * from inside, `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through.
 */
export const ROOMS = {
  spice: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 36], ['jarLid', 60]] },
  porcelain: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['clink', 40], ['drawer', 60]] },
  cloth: { tone: [300, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 22]] },
  jeweller: { tone: [260, 0.2], roof: 1.0, hush: 0.6, work: [['coin', 30]] },
  parrots: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['lsbParrot', 14]] },
  chandler: { tone: [300, 0.3], roof: 1.0, hush: 0.9, work: [['sack', 30], ['lsbBlock', 50]] },
  grocer: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['sack', 30], ['jarLid', 50]] },
  apothecary: { tone: [280, 0.25], roof: 1.0, hush: 0.7, work: [['mortar', 24], ['jarLid', 50]] },
  tavern: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 6], ['pourWine', 30]] },
  baker: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['sack', 26], ['kitchen', 18]] },
  sailmaker: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 26]] },
  scribe: { tone: [240, 0.15], roof: 1.0, hush: 0.6, work: [['paper', 20]] },
  cooper: { tone: [320, 0.35], roof: 1.0, hush: 1.0, work: [['lsbCooper', 30]] },
  smith: { tone: [400, 0.4], roof: 1.0, hush: 1.0, work: [['hammer', 12]] },
  home: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['broom', 70], ['bowlClack', 30]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  church: { tone: [140, 0.25], roof: 0.6, hush: 0.45, work: [['paper', 70]] },
  cloister: { tone: [200, 0.2], roof: 0.3, hush: 0.6, work: [['paper', 90]] },
  hall: { tone: [240, 0.2], roof: 0.8, hush: 0.6, work: [['coin', 50], ['paper', 40]] },
};
/** The bedrooms and workrooms upstairs: nearly silent, close under the tiles (the rain loud). */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 30], ['clothRustle', 40]] };

// ── the emitters in the open ───────────────────────────────────────────────────
const [SL0, SL1, SL2] = SLIPS;
const FOUNTAINS = [[(TERREIRO[0] + TERREIRO[2]) / 2 + 10, 60], [0, 63], [(SQUARE[0] + SQUARE[2]) / 2 - 8, (SQUARE[1] + SQUARE[3]) / 2]];
const BELL_J = [CHURCH[0] + 6, CHURCH[1] + 8];            // the monastery's bell, over the west end of the church
/** The offices the Jerónimos rang (matins 2, lauds 5, terce 9, none 15, vespers 17.5, compline 19.5; prime, sext and the evening are the Angelus' hours, the engine's `angelus` bells), as an hour window of half an hour and a gap that fits one toll in it. */
const OFFICES = [2, 5, 9, 15, 17.5, 19.5];
/**
 * Fixed emitters: [voice, at, r50 (m: the distance at which it is half as loud), [gap min, max] s, hours [from, to] (local, 0…24)], with
 * `dry` (not in rain), `rainMax`, `lv`. The houses' own work (WORK) is added by the engine from sites().
 */
export const EMITTERS = [
  // the yard: caulkers at the hulls on the slips, a sawyer at the timber, adzes, the pitch kettles, the cranes, the ropewalk
  ...[SL0, SL1, SL2].map((s) => ({ voice: 'lsbMallet', at: mid(s), r50: 20, gap: [6, 16], hours: [6.5, 18], dry: true })),
  { voice: 'lsbAdze', at: [mid(SL0)[0] + 6, mid(SL0)[1] + 3], r50: 15, gap: [9, 22], hours: [6.5, 18], dry: true },
  { voice: 'lsbAdze', at: [mid(SL2)[0] - 6, mid(SL2)[1] + 3], r50: 15, gap: [10, 24], hours: [6.5, 18], dry: true },
  { voice: 'lsbSaw', at: [222, 82], r50: 18, gap: [12, 28], hours: [6.5, 17.5], dry: true },
  { voice: 'lsbPitch', at: [YARD[0] + 20, YARD[1] + 50], r50: 12, gap: [6, 12], hours: [6, 18.5], rainMax: 0.9 },
  { voice: 'lsbPitch', at: [YARD[0] + 60, YARD[1] + 50], r50: 12, gap: [7, 14], hours: [6, 18.5], rainMax: 0.9 },
  { voice: 'lsbCrane', at: [146, 92], r50: 20, gap: [20, 46], hours: [6.5, 17.5], dry: true },
  { voice: 'lsbCrane', at: [260, 92], r50: 20, gap: [24, 52], hours: [6.5, 17.5], dry: true },
  { voice: 'lsbRope', at: [205, 48], r50: 22, gap: [7.5, 9], hours: [6.5, 18], dry: true, lv: 0.8 },
  // the quay: the gangs hauling, a block and tackle at the carracks' berths
  ...[20, 100, 220].map((x) => ({ voice: 'lsbHaul', at: [x + 1.5, QUAY[1] - 2.2], r50: 18, gap: [26, 60], hours: [6.5, 17.5], dry: true })),
  { voice: 'lsbBlock', at: [60, QUAY[1] - 2], r50: 12, gap: [20, 50], hours: [6.5, 17.5], dry: true },
  // the Terreiro's stalls: the fishwives' and the sellers' calls in the morning's market, the crowd's murmur through the day
  ...[[62, 40], [88, 54], [118, 40], [98, 68]].map(([x, z], i) => ({ voice: 'lsbCry', at: [x, z], r50: 15, gap: [9 + i, 24 + i * 2], hours: [6.5, 13], rainMax: 0.6 })),
  { voice: 'lsbMurmur', at: [95, 60], r50: 28, gap: [5, 11], hours: [7, 19], rainMax: 0.7 },
  // the plaza before the Jerónimos: pilgrims' murmur, the candle-sellers' and water-sellers' calls, the well's bucket (WELLS)
  { voice: 'lsbMurmur', at: [-206, 75], r50: 24, gap: [6, 13], hours: [7, 19], rainMax: 0.7 },
  { voice: 'lsbCry', at: [-190, 76], r50: 14, gap: [16, 40], hours: [7, 17], rainMax: 0.5 },
  { voice: 'lsbCry', at: [-222, 72], r50: 14, gap: [18, 44], hours: [7, 17], rainMax: 0.5 },
  // the Rua Nova: the merchants' street's murmur, three stretches of it
  ...[-20, 60, 140].map((x) => ({ voice: 'lsbMurmur', at: [x, -4], r50: 22, gap: [6, 14], hours: [7, 18.5], rainMax: 0.7 })),
  // the Casa da Índia's counting-room: the scales and the ledgers, heard at the gate
  { voice: 'lsbScales', at: [26, 88], r50: 6, gap: [18, 40], hours: [8, 16], dry: true },
  // the fountains of the Terreiro, the quay's square and the small square: the water's long rush, all hours
  ...FOUNTAINS.map(([x, z]) => ({ voice: 'lsbFountain', at: [x, z], r50: 16, gap: [10.5, 11.5], hours: [0, 24], lv: 1, rainMax: 2 })),
  // the bells: the monastery's offices; the Sé's curfew at nine
  ...OFFICES.map((h) => ({ voice: 'lsbToll', at: BELL_J, r50: 70, gap: [60, 70], hours: [h - 0.05, h + 0.45], rainMax: 2 })),
  { voice: 'lsbCurfew', at: [mid(SE)[0], mid(SE)[1]], r50: 80, gap: [60, 70], hours: [20.95, 21.5], rainMax: 2 },
];
void MONASTERY;
