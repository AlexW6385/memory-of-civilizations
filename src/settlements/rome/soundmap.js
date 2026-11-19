// Where Rome's sounds are (docs/settlements/rome.md §4.19): the places of the Campus Martius' emitters and the
// geometry the audio engine needs to put each sound where it comes from: the Tiber's quay, the fountains, the
// baths, the bakery and the fuller's, the inns, the forum and its temple, the streets, the gardens, the rooms one can be
// inside. Pure data and functions of layout.js and life.js (no three.js), read by src/engine/soundscape.js (the
// profile's `LIFE.map`, which has the same interface as Suzhou's map) and played by src/engine/voices.js and
// src/engine/voices-rome.js. Coordinates: metres, +x east, +z south, the settlement's own frame.
// [inferred throughout: no recording of Rome exists; what is [stated] is marked in the dossier §4.19.]

import { RADIUS, PANTHEON, BATHS, SAEPTA, FORUM, TEMPLE, PISTRINUM, LATRINE, INN, FULLER, VIA_LATA, TIBER, inRect, riverX, inRiver, riverEdge, fountains, gardens, rows, lots, inn2 } from './layout.js';
import { DOMUS } from './life.js';
import './../../engine/voices-rome.js';

/** Where the audio puts the listener when the engine gives none (the way in, in the forecourt). */
export const HOME = [0, -120];
export const WELLS = [];                                         // no wells: the Aqua Virgo and the cisterns feed fountains and basins
export const FAR = {};
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

// ── the houses with sounds ───────────────────────────────────────────────────────────────────────────────────────
const [DX0, DZ0, DX1, DZ1] = DOMUS;
/** The thermopolium of the atrium house (its west shop) and the other places whose work is heard from them: { use, rect, at, id, work: [[voice, [gap min, max] s, [from, to] h]] }. */
let SITES = null;
export function sites() {
  if (SITES) return SITES;
  const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
  const caupona = (r, id) => ({ use: 'caupona', rect: r, at: [r[0] + 6, r[3] - 5], id, work: [['teaTalk', [8, 18], [10, 23]], ['teaClink', [6, 14], [10, 23]], ['kitchen', [14, 30], [9, 21]]] });
  const thermo = [DX0 + 0.6, DZ1 - 5.6, (DX0 + DX1) / 2 - 1.6, DZ1 - 0.6];
  SITES = [
    { use: 'thermopolium', rect: thermo, at: mid(thermo), id: 'thermopolium', work: [['teaTalk', [10, 22], [7, 22]], ['kitchen', [12, 26], [7, 21]], ['teaClink', [8, 20], [7, 22]]] },
    caupona(INN, 'caupona:1'),
    { use: 'fullonica', rect: FULLER, at: mid(FULLER), id: 'fullonica', work: [['fullerTread', [10, 22], [6.5, 17]]] },
    { use: 'pistrinum', rect: PISTRINUM, at: [PISTRINUM[0] + 10, PISTRINUM[1] + 5], id: 'pistrinum', work: [['millstone', [8, 18], [4, 19]]] },
    { use: 'latrine', rect: LATRINE, at: mid(LATRINE), id: 'latrine', work: [['murmur', [20, 40], [6, 20]]] },
  ];
  if (inn2()) SITES.push(caupona(inn2().rect, 'caupona:2'));
  return SITES;
}

// ── the quay and the river ───────────────────────────────────────────────────────────────────────────────────────
let EDGE = null;
const edge = () => EDGE || (EDGE = riverEdge(1));
/** The nearest point of the water's edge (the quay wall's foot) to (x, z), the distance and the index. */
export function canalSpot(x, z) {
  let best = null;
  edge().forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - z); if (!best || d < best.d) best = { p: [p[0], p[1]], d, i }; });
  return best || { p: [TIBER.x, z], d: 1e3, i: 0 };
}
/** A barge's track on the stream: the straight line through the reach nearest to (x, z), a pass by the nearest point, null if the Tiber is farther than `reach`. */
export function canalTrack(x, z, rnd, reach = 70, lead = 38) {
  const c = canalSpot(x, z);
  if (c.d > reach) return null;
  const dir = rnd() < 0.5 ? 1 : -1, zc = c.p[1], a = zc - dir * lead * (0.6 + 0.6 * rnd()), b = zc + dir * lead * (0.8 + 0.8 * rnd());
  const off = -5 - 3 * rnd();
  if (Math.abs(b - a) < 14) return null;
  return { pts: [[riverX(a) + 21.6 + off, a], [riverX(b) + 21.6 + off, b]] };
}
export const bridgeTrack = () => null;                          // no bridge within the drawn city
export const shoreSpot = () => null;
/** A point on the Tiber's water within `reach` of (x, z), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  for (let k = 0; k < 10; k++) {
    const zz = z + (rnd() - 0.5) * 2 * reach, xx = riverX(zz) + (rnd() - 0.5) * (TIBER.w - 8);
    if (inRiver(xx, zz) && Math.hypot(xx - x, zz - z) < reach) return [xx, zz];
  }
  return null;
}

// ── the streets ──────────────────────────────────────────────────────────────────────────────────────────────────
const STREETS = [[VIA_LATA.x - 3, -300, VIA_LATA.x + 3, 300], [-180, -178, 172, -172], [-180, 162, 172, 168]];
/**
 * A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point. The engine asks for four
 * kinds by its arguments (reach, lead): (90, 40) the litters, which went by day, borne by slaves; the others (the hawkers
 * (80, 30) and the night watch (90, 34) of Suzhou) are not made from here, since Rome's cries are placed (EMITTERS) and the
 * vigiles march from their station: null.
 */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  if (!(reach === 90 && lead === 40)) return null;
  let best = null;
  STREETS.forEach((r, i) => { const px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z); if (d < reach && (!best || d < best.d)) best = { d, i }; });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 2, hi = (horiz ? r[2] : r[3]) - 2, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 3;
  return horiz ? { pts: [[a, mid + off], [b, mid + off]] } : { pts: [[mid + off, a], [mid + off, b]] };
}

// ── where the planting makes its sound ───────────────────────────────────────────────────────────────────────────
/** A tree to put a bird or a cicada in, near (x, z): the walled gardens' planting, or the pines and willows of the city's edge and the river. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (gardens().some((g) => inRect(g.rect, px, pz, -2))) return [px, pz];
    if (Math.hypot(px, pz) > RADIUS - 80 && Math.hypot(px, pz) < RADIUS - 10 && !inRiver(px, pz)) return [px, pz];
    if (Math.abs(px - riverX(pz)) > TIBER.w / 2 + 2 && Math.abs(px - riverX(pz)) < TIBER.w / 2 + 8 && Math.hypot(px, pz) < RADIUS - 20) return [px, pz];
  }
  return null;
}
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** 0..1: how much broad or needled tree is round: the walled gardens, the willows by the river, the pines at the edge. */
export function leafNear(x, z) {
  let g = 0;
  for (const q of gardens()) g = Math.max(g, 1 - sm(0, 26, rectDist(q.rect, x, z)));
  const river = 0.4 * (1 - sm(4, 34, Math.abs(Math.abs(x - riverX(z)) - TIBER.w / 2)));
  const edge2 = 0.6 * sm(RADIUS - 90, RADIUS - 40, Math.hypot(x, z));
  return Math.min(1, Math.max(0.15, 0.85 * g, river, edge2));
}
/** 0..1: green round (x, z) for the insects: the gardens at their fullest, the edge, the river bank, the paved city little. */
export function greenNear(x, z) {
  let g = 0;
  for (const q of gardens()) g = Math.max(g, 1 - sm(0, 20, rectDist(q.rect, x, z)));
  return Math.max(g, 0.8 * sm(RADIUS - 100, RADIUS - 45, Math.hypot(x, z)), 0.3 * (1 - sm(4, 30, Math.abs(Math.abs(x - riverX(z)) - TIBER.w / 2))), 0.08);
}
/** 0..1: how much of the town's hubbub reaches (x, z): all of it in the inhabited belt, less toward the edge and at the river. */
export function townNear(x, z) {
  if (inRect(PANTHEON, x, z) && z > -150) return 0.55;
  const inner = 1 - 0.7 * sm(RADIUS - 130, RADIUS - 40, Math.hypot(x, z)), river = 1 - 0.5 * (1 - sm(0, 30, Math.abs(x - riverX(z)) - TIBER.w / 2));
  return Math.max(0.1, inner * river);
}
/** 0..1: wet ground for the frogs: the river's banks, the edge. */
export function frogGround(x, z) {
  return Math.max(1 - sm(0, 40, Math.max(0, Math.abs(x - riverX(z)) - TIBER.w / 2)), 0.5 * sm(RADIUS - 70, RADIUS - 40, Math.hypot(x, z)));
}

// ── the rooms ────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: the Pantheon's rotunda and the
 * temple of the forum ('temple'), the baths' halls ('baths'), the atrium house ('atrium'), its thermopolium, an inn ('caupona'),
 * the fuller's, the bakery, the latrine, a shop of the rows ('shop'), any other house ('house').
 */
export function roomAt(x, z, y = 0) {
  const upper = y > 2.4;
  if (Math.hypot(x, z) < 21.2) return { use: 'temple', at: [0, 0], upper: false, same: 'pantheon' };
  if (inRect(TEMPLE, x, z)) return { use: 'temple', at: [(TEMPLE[0] + TEMPLE[2]) / 2, (TEMPLE[1] + TEMPLE[3]) / 2], upper: false, same: 'matidia' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper, same: s.id };
  if (inRect([DX0, DZ0, DX1, DZ1], x, z)) return { use: 'atrium', at: [(DX0 + DX1) / 2, (DZ0 + DZ1) / 2], upper, same: 'domus' };
  if (inRect(BATHS, x, z, -3) && z < BATHS[1] + 90) return { use: 'baths', at: [(BATHS[0] + BATHS[2]) / 2, BATHS[1] + 25], upper: false, same: 'baths' };
  for (const r of rows()) if (inRect(r.rect, x, z)) return { use: upper ? 'house' : 'shop', at: [(r.rect[0] + r.rect[2]) / 2, (r.rect[1] + r.rect[3]) / 2], upper, same: 'row:' + r.seed };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper, same: 'lot:' + l.seed };
  return null;
}
/**
 * What each kind of room sounds like inside: `tone` the room's hush (a lowpass in Hz and a level), `roof` how loud the rain on the tiles is
 * from inside, `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through.
 */
export const ROOMS = {
  temple: { tone: [150, 0.2], roof: 0.25, hush: 0.45, work: [['footfall', 38], ['murmur', 55]] },     // the rotunda's air; its oculus lets the rain fall in rather than patter over it
  baths: { tone: [260, 0.35], roof: 0.5, hush: 0.5, work: [['pour', 16], ['murmur', 24]] },
  atrium: { tone: [330, 0.3], roof: 0.9, hush: 0.7, work: [['pour', 40], ['broom', 70]] },            // the impluvium's drip is the rain's
  thermopolium: { tone: [520, 0.5], roof: 1.0, hush: 0.9, work: [['teaClink', 8], ['pour', 30]] },
  caupona: { tone: [480, 0.5], roof: 0.9, hush: 0.9, work: [['teaClink', 8], ['pour', 26]] },
  fullonica: { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['pour', 18]] },
  pistrinum: { tone: [380, 0.4], roof: 1.0, hush: 1.0, work: [['millstone', 30]] },
  latrine: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['pour', 30]] },
  shop: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['pour', 60], ['broom', 80]] },
  house: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The upper floors: close under the tiles, the rain loud. */
export const UPPER = { tone: [220, 0.15], roof: 1.3, hush: 0.6, work: [['broom', 60]] };

// ── the emitters in the open ─────────────────────────────────────────────────────────────────────────────────────
const LAND = [4, 14, 24].map((i) => edge()[i]).filter(Boolean);
const CRANE = [9, 20].map((i) => edge()[i]).filter(Boolean);
const [BX0, BZ0, BX1] = BATHS, bcx = (BX0 + BX1) / 2, scx = (SAEPTA[0] + SAEPTA[2]) / 2;
/**
 * Fixed emitters: { voice, at, r50, gap [min, max] s, hours [from, to] (wrapping midnight when from > to) }, with `dry` (not in rain). [placed] all positions.
 * Hours are local, the Roman day taken at the equinox from six; the baths opened at the eighth hour, about one in the afternoon [inferred: Hadrian's rule
 * kept bathing to the afternoon].
 */
export const EMITTERS = [
  // the fountains: the lacus of the Via Lata and the round basin of the forum (layout.js fountains())
  ...fountains().map((f) => ({ voice: 'fountain', at: f.at, r50: 6, gap: [3, 8], hours: [0, 24] })),
  // the baths: Seneca's noises over the palaestrae from the eighth hour, and the bronze that says they are open
  { voice: 'bathNoise', at: [bcx - 48, BZ0 + 50], r50: 15, gap: [7, 16], hours: [13, 18], dry: true },
  { voice: 'bathNoise', at: [bcx + 48, BZ0 + 50], r50: 15, gap: [9, 20], hours: [13, 18], dry: true },
  { voice: 'bathGong', at: [bcx, BZ0 - 1], r50: 40, gap: [20, 30], hours: [13, 13.45] },
  // the market: the Saepta's court, the Via Lata and the forum, sellers' cries and the hubbub of buyers
  { voice: 'teaTalk', at: [scx, -150], r50: 16, gap: [10, 22], hours: [7, 17], dry: true },
  { voice: 'teaTalk', at: [scx, -30], r50: 16, gap: [10, 22], hours: [7, 17], dry: true },
  { voice: 'teaTalk', at: [scx, 50], r50: 16, gap: [12, 26], hours: [7, 17], dry: true },
  { voice: 'teaTalk', at: [(FORUM[0] + FORUM[2]) / 2 + 20, (FORUM[1] + FORUM[3]) / 2], r50: 15, gap: [12, 26], hours: [7, 16], dry: true },
  ...[-220, -120, -40, 40, 120].map((z, i) => ({ voice: 'hawkerRome', at: [VIA_LATA.x + (i % 2 ? 4 : -4), z], r50: 13, gap: [26, 60], hours: [6.5, 17.5], dry: true })),
  ...[[scx, -110], [scx, 10], [(FORUM[0] + FORUM[2]) / 2 + 30, FORUM[1] + 14], [-20, -170]].map(([x, z]) => ({ voice: 'hawkerRome', at: [x, z], r50: 13, gap: [30, 70], hours: [6.5, 17.5], dry: true })),
  // the temple of the forum: the tibia at the morning's sacrifice (§4.19)
  { voice: 'tibia', at: [TEMPLE[2] + 5, (TEMPLE[1] + TEMPLE[3]) / 2], r50: 22, gap: [55, 110], hours: [6, 10.5], dry: true },
  // the Tiber's quay: the laundresses at the landings, the treadwheel cranes at their loads
  ...LAND.map((p) => ({ voice: 'clothBeat', at: [p[0] - 2.5, p[1]], r50: 9, gap: [14, 34], hours: [7, 16], dry: true })),
  ...CRANE.map((p) => ({ voice: 'craneCreak', at: [p[0] + 5.5, p[1]], r50: 11, gap: [30, 70], hours: [7, 16.5], dry: true })),
  // by night: carts on the basalt of the Via Lata and the street before the forecourt (wheeled traffic came into the city only after dark)
  { voice: 'cartPass', at: [VIA_LATA.x, -100], r50: 20, gap: [40, 90], hours: [19, 4.5], dry: true },
  { voice: 'cartPass', at: [VIA_LATA.x, 70], r50: 20, gap: [50, 110], hours: [19, 4.5], dry: true },
  { voice: 'cartPass', at: [-10, -175], r50: 20, gap: [60, 130], hours: [19.5, 4], dry: true },
  // the vigiles: the first cohort's station on the east side of the Via Lata opposite the Saepta, their rounds from it by night
  { voice: 'vigilesPatrol', at: [VIA_LATA.x + 16, -100], r50: 26, gap: [60, 130], hours: [19, 5], dry: true },
  { voice: 'vigilesPatrol', at: [-60, -175], r50: 22, gap: [110, 220], hours: [20, 4.5], dry: true },
];
