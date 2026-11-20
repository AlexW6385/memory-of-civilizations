// Where New York's sounds are (docs/settlements/new-york.md §14): the places the audio engine needs to put each sound where it is made —
// the Sixth Avenue El overhead, the horns and engines of the avenues, the news-vendors' cries, radios in the shops, the subway's rumble
// under the pavement, a milk-wagon's horse, the typewriters upstairs and the shops one can enter. Pure data and functions of layout.js (no
// three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js and voices-ny.js.
// Coordinates: metres, +x east, +z south, the city's frame (the grid of the layout is turned by GRID; toCity/toGrid convert).
// [inferred throughout: no recording of 1931 Midtown is kept. What the sources give is marked [stated] beside it.]
import { AVENUES, STREETS, EL_STATIONS, ESB, GCT, RADIUS, DINER_AT, WALKUP_AT, toCity, toGrid, inRect, roomLots, lots } from './layout.js';

/** Where the audio puts the listener when the engine gives none: the arrival. */
export const HOME = [-14.15, 37.89];
export const schedule = 'nyPlaced';
export const clock = { hour: 12 };
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const midOf = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
/** The business hours of the shops [inferred: 8 to 19, the Depression's long days]; the city is awake in the small hours at its theatres and station. */
export const SHOP_HOURS = [8, 19];

// ── the shops one can enter and what each makes heard ──
const WORK = {
  drug: [['drawer', [30, 70]], ['nyRadio', [90, 160]]], deli: [['kitchen', [20, 45]], ['nyRadio', [90, 160]]], barber: [['scissors', [8, 18]], ['nyRadio', [60, 120]]],
  cigar: [['drawer', [30, 70]], ['nyRadio', [70, 130]]], hat: [['clothRustle', [30, 60]]], bakery: [['kitchen', [20, 40]]], shoe: [['hammer', [18, 40]]],
  tailor: [['scissors', [14, 30]], ['nyRadio', [80, 150]]], haber: [['clothRustle', [30, 60]]], lunch: [['kitchen', [10, 24]], ['bowlClack', [12, 28]], ['nyRadio', [60, 110]]],
  fabric: [['clothRustle', [24, 50]], ['scissors', [30, 60]]], hardware: [['hammer', [20, 44]], ['drawer', [40, 80]]], grocer: [['sack', [26, 55]], ['coin', [40, 90]]],
  butcher: [['hammer', [12, 28]]], automat: [['coin', [4, 10]], ['bowlClack', [10, 22]], ['nyAutomat', [12, 28]]],
};
let SITES = null;
/** The buildings with sounds: { use, rect (the grid's frame), at (the city's), id, work: [[voice, [gap min, max], [from, to]]] }. */
export function sites() {
  if (SITES) return SITES;
  SITES = roomLots().map((l) => ({ use: l.room.kind === 'lunch' || l.room.kind === 'automat' ? 'diner' : 'shop', rect: l.rect, at: toCity(...midOf(l.rect)), id: 'shop:' + l.seed, work: (WORK[l.room.kind] || []).map(([v, g]) => [v, g, SHOP_HOURS]) }));
  const d = DINER_AT, w = WALKUP_AT;
  SITES.push({ use: 'diner', rect: [d[0] - 6, d[1] - 6, d[0] + 6, d[1] + 6], at: toCity(...d), id: 'diner', work: [['kitchen', [8, 20], [6, 23]], ['bowlClack', [10, 22], [6, 23]], ['nyRadio', [50, 100], [6, 23]]] });
  SITES.push({ use: 'walkup', rect: [w[0] - 5, w[1] - 6, w[0] + 5, w[1] + 6], at: toCity(...w), id: 'walkup', work: [['nyRadio', [70, 140], [7, 23]]] });
  SITES.push({ use: 'lobby', rect: ESB, at: toCity(...midOf(ESB)), id: 'esb', work: [['nyLift', [20, 50], [6, 22]]] });
  SITES.push({ use: 'concourse', rect: GCT, at: toCity(...midOf(GCT)), id: 'gct', work: [['nyTrainCall', [30, 70], [0, 24]]] });
  return SITES;
}
export const WELLS = [];
export const TEMPLE = null;
export const FAR = { tower: [0, -1900], bell: [0, -1900] };

// ── the open emitters ──
const gx = (n) => AVENUES[n][0];
const stationAt = (z) => toCity(gx(0) - 10, z + 30);
/** Fixed emitters: { voice, at, r50, gap [min, max] s, hours, lv }. The El's stations ring their gong at each train; the subway rumbles under Grand Central and the avenues. */
export const EMITTERS = [
  ...EL_STATIONS.map((z) => ({ voice: 'nyElBell', at: stationAt(z), r50: 60, gap: [40, 90], hours: [5, 25], lv: 0.8 })),
  ...[[gx(3), -225], [gx(0), 40], [gx(2), -40]].map(([x, z]) => ({ voice: 'nySubway', at: toCity(x, z), r50: 45, gap: [35, 80], hours: [0, 24], lv: 0.9 })),
  { voice: 'nyHorn', at: toCity(gx(1), 40), r50: 90, gap: [14, 40], hours: [6, 24], lv: 1 },
  { voice: 'nyHorn', at: toCity(gx(2), -60), r50: 90, gap: [18, 50], hours: [6, 24], lv: 0.9 },
  { voice: 'nyHorn', at: toCity(gx(3), -150), r50: 90, gap: [18, 50], hours: [6, 24], lv: 0.9 },
  { voice: 'nyNewsboy', at: toCity(gx(1) + 10, 38), r50: 60, gap: [16, 40], hours: [6.5, 22], lv: 1 },
  { voice: 'nyNewsboy', at: toCity(gx(3) - 10, -222), r50: 60, gap: [20, 50], hours: [6.5, 22], lv: 1 },
  { voice: 'nyElBell', at: toCity(gx(0) - 10, 150), r50: 60, gap: [60, 120], hours: [5, 25], lv: 0.5 },
];

// ── the streets ──
export function streetTrack() { return null; }
/** A path along the nearest avenue or street to (x, z) (the city's frame): { pts: [[x, z], [x, z]] } or null. */
function roadAlong(x, z, rnd, reach, lead, lane) {
  const [qx, qz] = toGrid(x, z);
  let best = null;
  for (const [ax, w] of AVENUES) { const d = Math.abs(qx - ax); if (d < reach && (!best || d < best.d)) best = { d, ax: true, c: ax, w }; }
  for (const [sz, w] of STREETS) { const d = Math.abs(qz - sz); if (d < reach && (!best || d < best.d)) best = { d, ax: false, c: sz, w }; }
  if (!best) return null;
  const dir = rnd() < 0.5 ? 1 : -1, o = (rnd() - 0.5) * best.w * 0.5, t0 = best.ax ? qz : qx;
  const a = Math.max(-RADIUS + 20, Math.min(RADIUS - 20, t0 - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(-RADIUS + 20, Math.min(RADIUS - 20, t0 + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 12) return null;
  const P = (t) => (best.ax ? toCity(best.c + o + lane, t) : toCity(t, best.c + o + lane));
  return { pts: [P(a), P(b)] };
}
/** The El runs on Sixth Avenue's line (the avenue's centre, overhead); cars and cabs on the avenues and streets. */
export const TRACKS = [
  { key: 'el', voice: 'nyElTrain', speed: 11, r50: 110, gap: [80, 170], ok: (h) => h >= 5 || h < 1.5, get: (x, z, rnd) => { const [qx, qz] = toGrid(x, z); if (Math.abs(qx - gx(0)) > 170) return null; const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(-RADIUS + 20, qz - dir * 120), b = Math.min(RADIUS - 20, qz + dir * 160); return Math.abs(b - a) < 30 ? null : { pts: [toCity(gx(0), a), toCity(gx(0), b)] }; } },
  { key: 'cars', voice: 'nyTraffic', speed: 7, r50: 55, gap: [9, 24], ok: () => true, get: (x, z, rnd) => roadAlong(x, z, rnd, 40, 70, 0) },
  { key: 'wagon', voice: 'nyHoof', speed: 2.2, r50: 30, gap: [70, 160], ok: (h, r) => h >= 4.5 && h < 11 && r < 0.6, get: (x, z, rnd) => roadAlong(x, z, rnd, 40, 50, 3) },
];
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const shoreSpot = () => null;
export const pondSpot = () => null;
/** A place for a bird near (x, z): a plane tree of Bryant Park or a cornice: pigeons and sparrows live on the ledges. */
export function treeSpot(x, z, rnd, reach = 40) {
  const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach;
  return [x + Math.cos(a) * d, z + Math.sin(a) * d];
}
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const leafNear = () => 0.12;
export const greenNear = () => 0.1;
/** How much of the city's hubbub reaches (x, z): the avenues loudest by day, a murmur at night, never silent (the theatres let out about midnight). */
export function townNear(x, z) {
  const h = clock.hour, day = h >= 7 && h < 21 ? 1 : h >= 21 || h < 1 ? 0.6 : 0.25;
  const [qx, qz] = toGrid(x, z), onAve = AVENUES.some(([ax, w]) => Math.abs(qx - ax) < w), onSt = STREETS.some(([sz, w]) => Math.abs(qz - sz) < w);
  return day * (onAve ? 1 : onSt ? 0.8 : 0.55);
}
export const frogGround = () => 0;

// ── the rooms ──
/** The room the listener is in, or null: { use, at, upper, same } — a shop, the diner, the walk-up, the Empire State's lobby, the Grand Central concourse. */
export function roomAt(x, z, y = 0) {
  const g = toGrid(x, z);
  for (const s of sites()) if (inRect(s.rect, g[0], g[1]) && (y < 6 || s.use === 'walkup')) {
    if (s.use === 'lobby') return y < 14 ? { use: 'lobby', at: s.at, upper: false, same: s.id } : null;
    if (s.use === 'concourse') return y < 25 ? { use: 'concourse', at: s.at, upper: false, same: s.id } : null;
    return { use: s.use, at: s.at, upper: false, same: s.id };
  }
  return null;
}
export const ROOMS = {
  shop: { tone: [1400, 0.4], roof: 0.5, hush: 0.7, work: [['drawer', 50]] },
  diner: { tone: [1800, 0.5], roof: 0.5, hush: 0.8, work: [['kitchen', 14], ['bowlClack', 16]] },
  walkup: { tone: [1100, 0.3], roof: 0.5, hush: 0.6, work: [['nyRadio', 90]] },
  lobby: { tone: [900, 0.35], roof: 0.2, hush: 0.4, work: [['nyLift', 28]] },
  concourse: { tone: [700, 0.4], roof: 0.1, hush: 0.2, work: [['nyTrainCall', 40]] },
  office: { tone: [1000, 0.3], roof: 0.4, hush: 0.6, work: [['nyTypewriter', 12]] },
};
export const UPPER = { tone: [700, 0.3], roof: 0.5, hush: 0.4, work: [['nyTypewriter', 12]] };
void lots; void sm;
