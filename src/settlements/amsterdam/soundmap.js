// Where Amsterdam's sounds are (docs/settlements/amsterdam.md §10.3): the places of its emitters and the geometry the audio engine needs to put each sound where it
// comes from — the canals and the IJ, the Dam with its lute-player, the Weigh House, the fish market at the Damrak's head, the treadwheel cranes of the VOC's
// warehouses and the caulkers on the IJ quay, the Nieuwe Kerk's bell, the shops that stood open and the taverns, the sledges and boats that pass, the rattle-watch
// at night; the rooms one can be inside. Pure data and functions of layout.js, openwalk.js and dice.js (no three.js, no builders), read by
// src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js and src/engine/voices-amsterdam.js.
// Coordinates: metres, +x east, +z south, the settlement's own frame. The carillons (Town Hall, Westerkerk...) are the profile's `bells: 'carillon'`.
// [inferred throughout: no recording of 1670 exists; what the dossier states is marked there.]

import { C, RINGS, CANAL_W, QUAY, RADIUS, IJ_Z, HALL, WAAG, FISH, VOC, DAM, NIEUWE_KERK, BRIDGE_ANGLES, wet, inRect, lots, westerNave } from './layout.js';
import { ARRIVAL } from './openwalk.js';
import { shopSites, dice, isOpen } from './dice.js';

/** Where the audio puts the listener when the engine gives none: the arrival on the Dam. */
export const HOME = ARRIVAL;
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rc = (x, z) => Math.hypot(x - C[0], z - C[1]);

// ── the trades' work, heard from the shops that are open ─────────────────────
/** [voice, gap in seconds [min, max], hours [from, to]]: the shops stood open from early morning until dusk [inferred; the dossier §10.1]. */
const WORK = {
  baker: [['amTray', [16, 40], [5, 18]]],
  cheese: [['amCheese', [18, 45], [7, 18]], ['amScale', [30, 70], [7, 18]]],
  draper: [['amShears', [22, 60], [8, 18]]],
  grocer: [['amScale', [14, 36], [7, 18.5]], ['amCrate', [30, 70], [7, 18]]],
  delft: [['amPlates', [20, 55], [8, 18]]],
  tobacco: [['amPipe', [20, 50], [8, 21]]],
  inn: [['amTavern', [7, 16], [10, 24]], ['amLute', [50, 110], [17, 23.5]]],
  craftsman: [['amHammer', [10, 28], [6, 18]]],
};
let SITES = null;
/** The shops and taverns that make sound: { use (the trade), rect, at, id, work } — the shops of the walk and the open inns and craftsmen's houses. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const seen = new Set();
  for (const { lot: l, trade } of shopSites()) { seen.add(l); SITES.push({ use: trade, rect: l.rect, at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], id: `lot:${l.seed}`, work: WORK[trade] }); }
  for (const l of lots()) {
    if (seen.has(l) || !isOpen(l)) continue;
    const t = dice(l).trade;
    if (t !== 'inn' && t !== 'craftsman') continue;
    SITES.push({ use: t, rect: l.rect, at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], id: `lot:${l.seed}`, work: WORK[t] });
  }
  return SITES;
}

// ── fixed places ──────────────────────────────────────────────────────────────
/** No wells: the city drew its water from the canals and the water-carriers (the dossier). */
export const WELLS = [];
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The Weigh House's door (its south front toward the Dam), the lute-player (dam-dress/quay: [-17, -225]), the fish market's benches. */
export const WEIGH = [(WAAG[0] + WAAG[2]) / 2, WAAG[3] + 1.5], LUTE = [-17, -225], FISHMKT = mid(FISH);
/** The VOC's open warehouses (treadwheel cranes at their gables) and the IJ quay where the hulls are caulked. */
export const CRANES = VOC.filter((v) => v[4]).map((v) => [(v[0] + v[2]) / 2, v[3] + 1.5]);
export const CAULK = [[-30, IJ_Z + 3], [120, IJ_Z + 3]];
export const KERK = [(NIEUWE_KERK[0] + NIEUWE_KERK[2]) / 2, NIEUWE_KERK[3] + 3];

export const EMITTERS = [
  { voice: 'amWeigh', at: WEIGH, r50: 14, gap: [14, 34], hours: [7, 17.5], dry: true },
  { voice: 'amLute', at: LUTE, r50: 16, gap: [50, 110], hours: [10, 21], dry: true, rainMax: 0.2 },
  { voice: 'amFishMarket', at: FISHMKT, r50: 18, gap: [9, 22], hours: [6, 14.5], rainMax: 0.7 },
  ...CRANES.map((at) => ({ voice: 'amCrane', at, r50: 20, gap: [30, 70], hours: [6.5, 18], rainMax: 0.7 })),
  ...CAULK.map((at) => ({ voice: 'amCaulk', at, r50: 24, gap: [20, 50], hours: [6, 18], rainMax: 0.5 })),
  // the Nieuwe Kerk: a bell tolled before the sermons of the morning and the afternoon [inferred: the Reformed services, Sunday and weekdays]
  { voice: 'amKerkBell', at: KERK, r50: 60, gap: [50, 80], hours: [9.5, 10], dry: true },
  { voice: 'amKerkBell', at: KERK, r50: 60, gap: [50, 80], hours: [14, 14.5], dry: true },
];

// ── the passing: sledges and walkers on the quay streets, boats on the canals, the watch ──
const REACH_A = [0.06, Math.PI - 0.06];
/** A polyline along the arc of ring `R` offset by `off` (metres from the ring's middle line, positive outward), of `len` metres about the angle of (x, z). */
function arc(R, off, a0, len, dir) {
  const r = R + off, da = len / r * dir, pts = [];
  for (let k = 0; k <= 4; k++) { const a = clamp(a0 + da * (k / 4 - 0.5), REACH_A[0], REACH_A[1]), px = C[0] + Math.cos(a) * r, pz = C[1] + Math.sin(a) * r; pts.push([px, pz]); }
  return pts.filter(([, pz]) => pz >= C[1] + 26);                 // the rings end at the IJ's shore
}
/** The nearest ring to (x, z) within `reach` metres of its middle line (null if none, or if the listener is on the IJ's side of the rings). */
function nearestRing(x, z, reach) {
  if (z < C[1] + 24) return null;
  const r = rc(x, z); let best = null;
  for (const R of RINGS) { const d = Math.abs(r - R); if (d < reach && (!best || d < best.d)) best = { R, d }; }
  return best;
}
const inDisc = (pts, m = 60) => pts.every(([x, z]) => Math.hypot(x, z) < RADIUS - m);
/** A track along the quay street beside a canal (the sledges and the walkers keep to it), off = ± (half the canal and the quay and 2.5 m). */
export function quayWay(x, z, rnd, reach = 60, len = 40, off = 0) {
  const n = nearestRing(x, z, reach); if (!n) return null;
  const side = rnd() < 0.5 ? 1 : -1, a0 = Math.atan2(z - C[1], x - C[0]), pts = arc(n.R, side * (CANAL_W / 2 + QUAY + 2.5 + off), a0, len * (0.7 + 0.6 * rnd()), rnd() < 0.5 ? 1 : -1);
  return pts.length >= 3 && inDisc(pts) && !pts.some(([px, pz]) => inRect(DAM, px, pz, 3)) ? { pts } : null;
}
/** A boat's track along a canal's middle past (x, z). */
export function canalWay(x, z, rnd, reach = 80, len = 70) {
  const n = nearestRing(x, z, reach); if (!n) return null;
  const a0 = Math.atan2(z - C[1], x - C[0]), pts = arc(n.R, (rnd() - 0.5) * 5, a0, len * (0.8 + 0.6 * rnd()), rnd() < 0.5 ? 1 : -1);
  return pts.length >= 3 && inDisc(pts, 70) && !BRIDGE_ANGLES.some((b) => pts.some(([px, pz]) => Math.abs(Math.atan2(pz - C[1], px - C[0]) - b) * n.R < 2)) ? { pts } : null;
}
export const TRACKS = [
  { key: 'sledge', voice: 'amSledge', speed: 1.4, r50: 15, gap: [30, 80], ok: (h, rain) => h >= 5.5 && h < 19 && rain < 0.85, get: (x, z, r) => quayWay(x, z, r, 70, 50) },
  { key: 'cry', voice: 'amCry', speed: 1.0, r50: 11, gap: [18, 45], ok: (h, rain) => h >= 5.5 && h < 17.5 && rain < 0.5, get: (x, z, r) => quayWay(x, z, r, 80, 36, 0.8) },
  { key: 'praam', voice: 'amPraam', speed: 1.1, r50: 14, gap: [30, 75], ok: (h, rain) => h >= 5.5 && h < 20 && rain < 0.7, get: (x, z, r) => canalWay(x, z, r, 80, 60) },
  { key: 'rattle', voice: 'amRattle', speed: 1.1, r50: 12, gap: [50, 120], ok: (h, rain) => (h >= 22 || h < 5) && rain < 0.7, get: (x, z, r) => quayWay(x, z, r, 90, 40, 0.5) },
];
// the engine's own boat, crossing, sedan, vendor and watchman are other places' (a yuloh, a plank bridge, a chair): none here
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
/** The water nearest to (x, z): the point of a canal's middle line (or the IJ's shore) and the distance; the engine's `lap` is placed there. */
export function canalSpot(x, z) {
  let best = null;
  if (Math.hypot(x, z) > RADIUS - 70) return null;
  if (z >= C[1] + 24) {
    const r = rc(x, z), dx = (x - C[0]) / (r || 1), dz = (z - C[1]) / (r || 1);
    for (const R of RINGS) { const q = clamp(r, R - CANAL_W / 2 + 1, R + CANAL_W / 2 - 1), p = [C[0] + dx * q, C[1] + dz * q], d = Math.hypot(p[0] - x, p[1] - z); if (!best || d < best.d) best = { p, d, i: 0 }; }
  }
  const pi = [x, IJ_Z - 1], di = Math.abs(z - (IJ_Z - 1));
  if (!best || di < best.d) best = { p: pi, d: di, i: 0 };
  return best;
}
// no pond, no lotus, no bamboo
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const treeSpot = () => null;
export const frogGround = () => 0;
/** 0…1: how much broad-leaved tree is round: the elms along the canals' quays. */
export function leafNear(x, z) { return Math.min(1, 0.1 + 0.7 * (1 - sm(4, 40, wet(x, z)))); }
/** 0…1: how much green round (crickets): none, the town is paved and bricked. */
export const greenNear = () => 0;
/** 0…1: how much of the town's hubbub reaches (x, z): the Dam and the Damrak (1), the quay streets (0.7), less inside the Town Hall and the churches. */
export function townNear(x, z) {
  if (inRect(HALL, x, z) || inRect(NIEUWE_KERK, x, z)) return 0.2;
  if (inRect(DAM, x, z, 25)) return 1;
  return Math.max(0.2, 0.7 * (1 - 0.7 * sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z))));
}

// ── the rooms ─────────────────────────────────────────────────────────────────
const UPPER_Y = 1.0 + 3.6 + 0.2;             // over the ground storey (GROUND 1.0, the ground floor 3.6 high)
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  if (inRect(HALL, x, z)) return { use: 'hall', at: mid(HALL), upper: false, same: 'hall' };
  if (inRect(NIEUWE_KERK, x, z)) return { use: 'temple', at: mid(NIEUWE_KERK), upper: false, same: 'kerk' };
  if (inRect(westerNave(), x, z)) return { use: 'temple', at: mid(westerNave()), upper: false, same: 'wester' };
  if (inRect(WAAG, x, z)) return { use: 'weigh', at: mid(WAAG), upper: false, same: 'waag' };
  const upper = y > UPPER_Y;
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper, same: s.id };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: mid(l.rect), upper, same: 'lot:' + l.seed };
  return null;
}
/** What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the tiles is, `work` the small voices made in it now and then, `hush` how much of the outdoors comes through. */
export const ROOMS = {
  baker: { tone: [380, 0.4], roof: 1.0, hush: 0.8, work: [['amTray', 30], ['sack', 40]] },
  cheese: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['amCheese', 30], ['amScale', 50]] },
  draper: { tone: [250, 0.2], roof: 1.0, hush: 0.7, work: [['amShears', 40], ['clothRustle', 26]] },
  grocer: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['amScale', 40], ['jarLid', 50]] },
  delft: { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['amPlates', 36]] },
  tobacco: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['amPipe', 40], ['paper', 40]] },
  inn: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['amTavern', 7], ['bowlClack', 18]] },
  craftsman: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['amHammer', 26], ['broom', 60]] },
  weigh: { tone: [300, 0.3], roof: 0.8, hush: 0.7, work: [['amWeigh', 20]] },
  temple: { tone: [130, 0.3], roof: 0.25, hush: 0.4, work: [['paper', 90]] },
  hall: { tone: [150, 0.25], roof: 0.5, hush: 0.5, work: [['paper', 60]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70], ['teaClink', 80]] },
};
/** The upper floors: close under the tiles (the rain loud), nearly silent. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40], ['broom', 80]] };
