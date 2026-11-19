// Where London's sounds are (docs/settlements/london.md §10.2): the places of its emitters and the geometry the audio engine needs to put each sound
// where it comes from — the Thames, the streets' traffic, Parliament Square's organ and Punch and Judy, the knife-grinder's wheel, the drinking
// fountains, the steamer pier, the Abbey's bells and choir, the shops that work and the pubs, the rooms one can be inside. Pure data and functions of
// layout.js and open.js (no three.js, no builders), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js and
// src/engine/voices-london.js.
// Coordinates: metres, +x east, +z south, the settlement's own frame (as the camera has in it).
// [inferred throughout: no recording of 1870 exists. What the sources give is marked [stated] beside it; the rest is the dossier's reasoning.]

import { RADIUS, GROUND, BRIDGE, RIVER, SQUARE, PALACE, HALL, ABBEY, VICTORIA, bank, blocked, inRect, lots, streetsZ } from './layout.js';
import { openSet, mirrors } from './open.js';

/** Where the audio puts the listener when the engine gives none: the arrival on the bridge. */
export const HOME = [200, -170];

/** A deterministic 0…1 from numbers (for the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ── the trades' work, heard from the shops that are open ─────────────────────
/** What each trade sounds like at work: [voice, gap in seconds [min, max], hours [from, to]] (the shops stood open until the evening [inferred]). */
const WORK = {
  grocer: [['lonScale', [14, 36], [8, 20.5]]],
  butcher: [['lonCleaver', [10, 26], [6, 20.5]]],
  chemist: [['lonPestle', [24, 60], [8, 21]]],
  baker: [['lonTray', [16, 40], [5, 19]]],
  pawnbroker: [['lonTill', [20, 55], [8, 21]]],
  bootmaker: [['lonHammer', [10, 28], [7, 20]]],
  barber: [['lonStrop', [16, 45], [8, 21]]],
  tobacconist: [['lonTill', [26, 70], [8, 22]]],
  draper: [['lonShears', [22, 60], [8.5, 20]]],
  greengrocer: [['lonCrate', [14, 38], [6, 20.5]]],
};
/** The public house: the murmur from the opening to the half-hour past midnight (the 1872 Act: weekdays 5 am to 12.30 am [stated: Barclay Perkins, "Pub opening hours in 1874"]); a piano in the evening. */
const PUB = [['lonPubTalk', [7, 16], [10, 0.5]], ['lonPiano', [38, 80], [17.5, 0.5]]];
let SITES = null;
/** The shops and pubs that make sound: { use (the trade, or 'pub'), rect, at, id, work } — the open lots. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const all = lots();
  mirrors(all);
  for (const l of openSet(all)) {
    if (!l.shop && !l.pub) continue;
    const use = l.pub ? 'pub' : l.trade;
    SITES.push({ use, rect: l.rect, at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], id: `lot:${l.seed}`, work: l.pub ? PUB : WORK[use] || [] });
  }
  return SITES;
}

// ── fixed places ──────────────────────────────────────────────────────────────
/** No wells: the town drew its water from the mains and the Association's drinking fountains (below). */
export const WELLS = [];
/** The barrel organ and Punch and Judy's booth in Parliament Square (town.js square()): at [-26, wz + 3.4] and [8, wz + 4.2], wz = −180. */
export const ORGAN = [-26, -176.6], PUNCH = [8, -175.8];
/** The drinking fountains (town.js furniture(): Bridge Street's; the other, at the square's corner, falls in the square's own margin and is not placed). */
export const FOUNTAINS = [[70, BRIDGE.z + 6.6]];
/** The knife-grinder's barrow at the Lambeth end of Bridge Street. */
export const GRINDER = [286, BRIDGE.z + 5.9];
/** The floating steamboat pier on the Westminster side north of the bridge (town.js traffic()). */
export const PIER = [bank(-219)[0] + 6.5, -219];
/** The Abbey's bells in its west towers and the choir where the services are sung (the Abbey rect: nave along x, the west front at x = −200). */
export const BELLS = { abbey: [ABBEY[0] + 7, (ABBEY[1] + ABBEY[3]) / 2], choir: [ABBEY[0] + 90, (ABBEY[1] + ABBEY[3]) / 2] };

export const EMITTERS = [
  { voice: 'lonBarrel', at: ORGAN, r50: 20, gap: [50, 110], hours: [10, 20], dry: true, rainMax: 0.3 },
  { voice: 'lonPunch', at: PUNCH, r50: 14, gap: [70, 140], hours: [11, 18], dry: true, rainMax: 0.2 },
  { voice: 'lonGrind', at: GRINDER, r50: 9, gap: [24, 55], hours: [8, 17], dry: true },
  ...FOUNTAINS.map((at) => ({ voice: 'lonFountain', at, r50: 6, gap: [9, 22], hours: [6, 22], dry: true })),
  { voice: 'lonPierBell', at: PIER, r50: 30, gap: [70, 150], hours: [7, 21], rainMax: 0.7 },
  // the Abbey: a bell tolled before the morning and the afternoon services, the choir at evensong (3 pm) [inferred: the daily services of a collegiate church; the hours are the usual ones]
  { voice: 'lonAbbeyBell', at: BELLS.abbey, r50: 60, gap: [50, 80], hours: [9.5, 10], dry: true },
  { voice: 'lonAbbeyBell', at: BELLS.abbey, r50: 60, gap: [50, 80], hours: [14.4, 14.9], dry: true },
  { voice: 'lonEvensong', at: BELLS.choir, r50: 22, gap: [100, 170], hours: [15, 15.9], inside: 'abbey' },
];

// ── the passing: traffic, the river, the criers, the beat ─────────────────────
const BRIDGE_X = [RIVER.x0 - 22, RIVER.x1 + 20];       // the bridge and its approaches over the embankment roads
const free = (x, zc, main) => (main && x > BRIDGE_X[0] && x < BRIDGE_X[1]) || !blocked(x, zc, -3);
/** A track along the east–west street nearest to (x, z) within `reach` (Bridge Street, the busiest, favoured by `main`: 0…1), passing the nearest point and clipped where the street is built over; vehicles keep to the left. null if none. */
export function streetWay(x, z, rnd, reach = 70, lead = 30, main = 0) {
  let zc = null, best = reach + 1;
  for (const c of streetsZ()) { const d = Math.abs(c - z); if (d < best) { best = d; zc = c; } }
  if (Math.abs(BRIDGE.z - z) <= reach * 1.5 && rnd() < main) zc = BRIDGE.z;
  if (zc === null) return null;
  const isMain = Math.abs(zc - BRIDGE.z) < 1, lim = RADIUS - 62, near = clamp(x, -lim, lim), dir = rnd() < 0.5 ? 1 : -1;
  let a = near - dir * lead * (0.5 + 0.7 * rnd()), b = near + dir * lead * (0.8 + 0.8 * rnd());
  const clip = (from, to) => { const s = Math.sign(to - from) || 1; let p = from; while (s * (to - p) > 0 && free(p + s * 3, zc, isMain)) p += s * 3; return p; };
  if (!free(near, zc, isMain)) return null;
  a = clip(near, clamp(a, -lim, lim)); b = clip(near, clamp(b, -lim, lim));
  if (Math.abs(b - a) < 14) return null;
  const lane = -Math.sign(b - a) * (isMain ? 2.3 : 1.7) + (rnd() - 0.5) * 0.6;
  return { pts: [[a, zc + lane], [b, zc + lane]], zc };
}
/** A walker's track along the pavement of a street (the vehicles' with the pavement's offset). */
export function walkTrack(x, z, rnd, reach = 70, lead = 30) {
  const w = streetWay(x, z, rnd, reach, lead, 0.3);
  if (!w) return null;
  const off = (Math.abs(w.zc - BRIDGE.z) < 1 ? 5.6 : 3.4) * (rnd() < 0.5 ? 1 : -1);
  return { pts: w.pts.map(([px]) => [px, w.zc + off]) };
}
/** The Thames's water nearest to (x, z): the point of its reach (a few samples of the banks either way along it) and the distance. */
export function canalSpot(x, z) {
  let best = null;
  for (let dz = -48; dz <= 48; dz += 8) {
    const zz = z + dz, [a, b] = bank(zz), px = clamp(x, a + 2, b - 2), d = Math.hypot(px - x, zz - z);
    if (Math.hypot(px, zz) < RADIUS - 70 && (!best || d < best.d)) best = { p: [px, zz], d, i: 0 };
  }
  return best;
}
/** A boat's track down or up the river past (x, z): in the channel, clear of the bridge (it passes under it: the deck is above), null if the water is farther than `reach`. */
export function riverTrack(x, z, rnd, reach = 110, lead = 70) {
  const c = canalSpot(x, z);
  if (!c || c.d > reach) return null;
  const dir = rnd() < 0.5 ? 1 : -1, lim = RADIUS - 80, zn = clamp(c.p[1], -lim, lim), a = clamp(zn - dir * lead * (0.7 + 0.5 * rnd()), -lim, lim), b = clamp(zn + dir * lead * (0.9 + 0.8 * rnd()), -lim, lim);
  if (Math.abs(b - a) < 24) return null;
  const f = (zz, t) => { const [p, q] = bank(zz); return (p + q) / 2 + (dir > 0 ? 1 : -1) * (q - p) * 0.16 * (t ? 1 : 1); };    // (the steamers and lighters keep to their own side of the channel)
  const pts = []; const n = 4;
  for (let k = 0; k <= n; k++) { const zz = a + (b - a) * k / n; pts.push([f(zz, 1), zz]); }
  return { pts };
}
const dryEnough = (rain, m) => rain < m;
export const TRACKS = [
  { key: 'cab', voice: 'lonCab', speed: 3.6, r50: 15, gap: [7, 20], ok: (h, rain) => h >= 6 && h < 24.5 && dryEnough(rain, 0.95), get: (x, z, r) => streetWay(x, z, r, 80, 36, 0.6) },
  { key: 'bus', voice: 'lonBus', speed: 3.1, r50: 17, gap: [26, 60], ok: (h, rain) => h >= 7 && h < 23.5 && dryEnough(rain, 0.95), get: (x, z, r) => streetWay(x, z, r, 90, 40, 0.8) },
  { key: 'cart', voice: 'lonCart', speed: 1.5, r50: 15, gap: [40, 100], ok: (h, rain) => h >= 5.5 && h < 19 && dryEnough(rain, 0.8), get: (x, z, r) => streetWay(x, z, r, 90, 40, 0.3) },
  { key: 'steamer', voice: 'lonSteamer', speed: 4.6, r50: 30, gap: [60, 140], ok: (h, rain) => h >= 6.5 && h < 21.5 && dryEnough(rain, 0.9), get: (x, z, r) => riverTrack(x, z, r, 120, 80) },
  { key: 'lighter', voice: 'lonLighter', speed: 1.2, r50: 22, gap: [50, 120], ok: (h, rain) => h >= 5 && h < 20 && dryEnough(rain, 0.9), get: (x, z, r) => riverTrack(x, z, r, 100, 40) },
  { key: 'cry', voice: 'lonCry', speed: 1.0, r50: 11, gap: [18, 45], ok: (h, rain) => h >= 5.5 && h < 22 && dryEnough(rain, 0.5), get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
  { key: 'beat', voice: 'lonBeat', speed: 1.2, r50: 12, gap: [50, 120], ok: (h, rain) => (h >= 22.5 || h < 5) && dryEnough(rain, 0.7), get: (x, z, r) => walkTrack(x, z, r, 90, 36) },
];
// the built-in boat (a yuloh), crossing, sedan, vendor and watchman of voices.js are Suzhou's: none here
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
// no pond, no lotus, no bamboo; the Thames's own lapping is the engine's `lap`, asked of canalSpot above
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const treeSpot = () => null;
export const frogGround = () => 0;
/** 0…1: how much broad-leaved tree is round: the planes of Parliament Square and the Abbey's garth. */
export function leafNear(x, z) {
  const g = Math.max(1 - sm(0, 30, rectDist(SQUARE, x, z)), 0.6 * (1 - sm(0, 30, rectDist(ABBEY, x, z))));
  return Math.min(1, 0.08 + 0.8 * g);
}
/** 0…1: how much green round (crickets): none, the lawns are small and the town's streets are paved. */
export const greenNear = () => 0;
/** 0…1: how much of the town's hubbub reaches (x, z): Bridge Street and the square (1), the streets (0.7), less inside the palace, the Hall and the Abbey. */
export function townNear(x, z) {
  if (inRect(ABBEY, x, z)) return 0.2;
  if (inRect(HALL, x, z)) return 0.2;
  if (inRect(PALACE, x, z)) return 0.25;
  if (Math.abs(z - BRIDGE.z) < 30 || inRect(SQUARE, x, z, 10)) return 1;
  return Math.max(0.2, 0.7 * (1 - 0.7 * sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z))));
}

// ── the rooms ─────────────────────────────────────────────────────────────────
const UPPER_Y = GROUND + 3.4;             // over the ground storey (3.2 m shops 3.8, pubs 4.0)
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: a trade's shop (the ten trades), pub, temple (the
 * Abbey), hall (Westminster Hall), chamber (the palace's principal floor), house (any other that can be entered).
 */
export function roomAt(x, z, y = 0) {
  if (inRect(ABBEY, x, z)) return { use: 'temple', at: [(ABBEY[0] + ABBEY[2]) / 2, (ABBEY[1] + ABBEY[3]) / 2], upper: false, same: 'abbey' };
  if (inRect(HALL, x, z)) return { use: 'hall', at: [(HALL[0] + HALL[2]) / 2, (HALL[1] + HALL[3]) / 2], upper: false, same: 'hall' };
  if (inRect(PALACE, x, z) || inRect([PALACE[0] - 30, -60, PALACE[0] + 30, -38], x, z)) return y > GROUND + 3 ? { use: 'chamber', at: [70, -46], upper: false, same: 'palace' } : null;
  const upper = y > UPPER_Y;
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper, same: s.id };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper, same: 'lot:' + l.seed };
  return null;
}
/**
 * What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is from
 * inside (slate over timber: loud; the Abbey's stone vaults: far), `work` the small voices made in the room now and then [voice, gap s], `hush` how
 * much of the outdoors comes through.
 */
export const ROOMS = {
  grocer: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['lonScale', 40], ['jarLid', 50]] },
  butcher: { tone: [300, 0.3], roof: 1.0, hush: 0.9, work: [['lonCleaver', 24], ['drawer', 60]] },
  chemist: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['lonPestle', 45], ['jarLid', 40]] },
  baker: { tone: [380, 0.4], roof: 1.0, hush: 0.8, work: [['lonTray', 30], ['sack', 40]] },
  pawnbroker: { tone: [240, 0.2], roof: 1.0, hush: 0.6, work: [['lonTill', 40]] },
  bootmaker: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['lonHammer', 26], ['broom', 60]] },
  barber: { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['lonStrop', 40], ['clothRustle', 40]] },
  tobacconist: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['lonTill', 60], ['paper', 40]] },
  draper: { tone: [250, 0.2], roof: 1.0, hush: 0.7, work: [['lonShears', 40], ['clothRustle', 26]] },
  greengrocer: { tone: [360, 0.3], roof: 1.0, hush: 0.9, work: [['lonCrate', 28]] },
  pub: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['lonPubTalk', 7], ['bowlClack', 18]] },
  temple: { tone: [130, 0.3], roof: 0.25, hush: 0.4, work: [['paper', 90]] },
  hall: { tone: [150, 0.25], roof: 0.5, hush: 0.5, work: [['paper', 60]] },
  chamber: { tone: [180, 0.2], roof: 0.6, hush: 0.5, work: [['paper', 40]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70], ['teaClink', 80]] },
};
/** The upper floors: close under the roof (the rain loud), nearly silent. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40], ['broom', 80]] };
void VICTORIA;
