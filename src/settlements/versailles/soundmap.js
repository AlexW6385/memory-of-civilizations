// Where Versailles's sounds are (docs/settlements/versailles.md §11.4): the places of its emitters and the geometry the audio engine needs to put each
// sound where it comes from — the Latona and Apollo fountains and the urns of the water parterre, the gardeners' yards, the stables and the Place's
// coaches, the Cent-Suisses' gate, the chapel and the Hall of Mirrors, the shops that work, the rooms one can be inside. Pure data and functions of
// layout.js, service.js, keepers.js and openwalk.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js and src/engine/voices-versailles.js.
// Coordinates: metres, +x east (the town), -x west (the gardens), +z south, the settlement's own frame (as the camera has in it).
// [inferred throughout: no recording of 1690 exists. What the sources give is marked [stated] beside it; the rest is the dossier's reasoning.]

import { RADIUS, RISE, YARD_Y, LATONA, APOLLO, CANAL, CHAPEL, PLACE, STABLES, PARTERRE, STATE_ROOMS, WINGS, inRect, lots } from './layout.js';
import { SERVICE } from './service.js';
import { wellElements } from './keepers.js';

/** Where the audio puts the listener when the engine gives none: the arrival on the parterre's walk. */
export const HOME = [-60, 0];

/** A deterministic 0…1 from numbers (for the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

// ── the trades' work, heard from the shops that are open ─────────────────────
/** The twelve trades of the town's shops in the order of layout.js (a test compares them): a lot's trade is its own `trade`. */
export const TRADE_IDS = ['baker', 'tavern', 'draper', 'apothecary', 'cobbler', 'barber', 'cutler', 'vintner', 'bookseller', 'butcher', 'hatter', 'chandler'];
/**
 * What each trade (and each service lodging) sounds like at work: [voice, gap in seconds [min, max], hours [from, to]]. Hours are [inferred] from
 * the trades (the court rose late and the town with it, but the trades began at first light; the King's Mass was at ten).
 */
export const WORK = {
  baker: [['verBake', [16, 38], [3.5, 12.5]]],
  tavern: [['teaTalk', [9, 20], [10, 22]], ['teaClink', [14, 34], [10, 22]], ['pourWine', [30, 70], [10, 22]]],
  draper: [['scissors', [26, 60], [8, 18]]],
  apothecary: [['jarLid', [24, 60], [8, 18]]],
  cobbler: [['verAwl', [12, 30], [7, 18]]],
  barber: [['scissors', [18, 45], [8, 19]]],
  cutler: [['verGrind', [18, 44], [8, 18]]],
  vintner: [['verCask', [18, 50], [8, 20]]],
  bookseller: [['paper', [24, 60], [9, 18]]],
  butcher: [['verCleave', [11, 28], [6, 17]]],
  hatter: [['brush', [26, 60], [8, 18]]],
  chandler: [['verTallow', [26, 60], [7, 18]]],
  // the gardens' lodgings (service.js)
  gardener: [['verRake', [14, 34], [6, 19]], ['verHoe', [20, 50], [6, 19]]],
  tools: [['sack', [45, 100], [6, 19]]],
  sculptor: [['verChisel', [10, 26], [7, 18]]],
  bearers: [],
  guard: [],
  fountain: [['verValve', [60, 140], [7, 19]]],
  orangery: [],
  joiner: [['verPlane', [14, 34], [7, 18]]],
};
let SITES = null;
/** The shops and lodgings that make sound: { use, rect, at, id, work, ground } — the service lodgings of the gardens and the avenue's open shops. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const b of SERVICE) SITES.push({ use: b.use, rect: b.rect, at: mid(b.rect), id: 'yard:' + b.use, work: WORK[b.use] || [], ground: YARD_Y });
  for (const l of lots()) if (l.open && l.trade && l.use !== 'home' && l.use !== 'hotel') SITES.push({ use: l.trade, rect: l.rect, at: mid(l.rect), id: `lot:${Math.round(l.rect[0] * 10)},${Math.round(l.rect[1] * 10)}`, work: WORK[l.trade] || [], ground: RISE });
  return SITES;
}

// ── fixed places ──────────────────────────────────────────────────────────────
/** The wells (a windlass): the two yards' and the avenue's two (keepers.js). */
export const WELLS = wellElements().map((e) => e.at);
/** The urns of the water parterre's river figures, one by each basin (the basins' centres, layout/classical_fr parterre: x −37, z ±27) [inferred position]. */
export const URNS = [[-46, -27], [-46, 27]];
/** The Cent-Suisses' gate: the grille of the Royal Court (plan.js: x = 150). */
export const GATE = [150, 0];
/** The chapel and the Hall of Mirrors. The Hall's floor is the first floor (layout.js FY). */
export const CHAPEL_AT = mid(CHAPEL);
export const MIRRORS = STATE_ROOMS[0];
export const MIRRORS_AT = mid(MIRRORS[1]);
/** The great stables' yards (the Grande and Petite Écurie, dossier §1f) and the farrier's forge. */
export const STABLE_AT = STABLES.map((s) => [s.x + 22, s.z + s.side * 8]);
export const FORGE = [STABLE_AT[1][0] + 18, STABLE_AT[1][1] + 6];
/** The kitchens of the ministers' wing (the south wing's service end) [inferred position]. */
export const KITCHEN = [mid(WINGS[1])[0] + 6, 150];

export const EMITTERS = [
  // the water (the fontainiers played the great fountains by day, when the King walked [inferred hours]; the urns run whenever the cisterns are full)
  { voice: 'verFountain', at: LATONA, r50: 20, gap: [0.5, 2], hours: [8.5, 19.5], after: true, rainMax: 1 },
  { voice: 'verFountain', at: APOLLO, r50: 28, gap: [0.5, 2], hours: [8.5, 19.5], after: true, rainMax: 1 },
  ...URNS.map((at) => ({ voice: 'verUrn', at, r50: 9, gap: [0.5, 2], hours: [0, 24], after: true, rainMax: 1 })),
  // the gardens' work in the open: gardeners at the broderie beds, a sculptor's mallet by the Latona walk
  { voice: 'verRake', at: [-40, -64], r50: 10, gap: [18, 44], hours: [6, 19], dry: true },
  { voice: 'verHoe', at: [-22, 64], r50: 10, gap: [24, 60], hours: [6, 19], dry: true },
  { voice: 'verChisel', at: [-98, 36], r50: 12, gap: [16, 40], hours: [7, 18], dry: true },
  // the wells: the town's and the yards'
  ...WELLS.map((at, i) => ({ voice: 'wellBucket', at, r50: 8, gap: [60 + i * 15, 150 + i * 20], hours: [6, 19], dry: true })),
  // the stables and the forge, the Place's horses
  ...STABLE_AT.map((at) => ({ voice: 'verStable', at, r50: 18, gap: [9, 24], hours: [5, 21.5], dry: false })),
  { voice: 'verFarrier', at: FORGE, r50: 14, gap: [18, 46], hours: [7, 17.5], dry: true },
  // the Cent-Suisses at the gate: a drum and a fife at the changing of the guard and between [inferred hours]
  { voice: 'verDrum', at: GATE, r50: 26, gap: [160, 380], hours: [8, 22], after: true, rainMax: 0.7 },
  // the King's Mass at ten, in the chapel [inferred: recalled, not sourced here (the web was not reachable): the King heard Mass daily at ten; dossier §11.4]; heard whole inside, through the walls from outside
  { voice: 'verMass', at: CHAPEL_AT, r50: 14, gap: [30, 70], hours: [10, 10.75], after: true, rainMax: 1, inside: 'chapel' },
  // the evenings of the apartment (soirées d'appartement, three evenings a week, seven to ten [inferred; dossier §11.4]): violins in the Hall of Mirrors
  { voice: 'verStrings', at: [MIRRORS_AT[0], MIRRORS_AT[1] - 16], r50: 18, gap: [18, 45], hours: [19, 22], after: true, rainMax: 1, inside: 'mirrors' },
  { voice: 'verStrings', at: [MIRRORS_AT[0], MIRRORS_AT[1] + 16], r50: 18, gap: [24, 55], hours: [19.3, 22], after: true, rainMax: 1, inside: 'mirrors' },
  { voice: 'kitchen', at: KITCHEN, r50: 10, gap: [10, 24], hours: [4.5, 21], rainMax: 1 },
];

// ── the passing: coaches on the avenues and in the Place, criers, the watch, the gondolas ──
/** The ways a walker or coach takes: the three avenues from the Place (the diagonals slope as layout.js AVENUES) and the Place's own lanes. */
const LINES = (() => {
  const L = [];
  for (const [o, s] of [[0, 0], [75, 0.35], [-75, -0.35]]) L.push([[PLACE[2] + 4, o], [RADIUS - 40, o + (RADIUS - 40 - PLACE[2]) * s]]);
  L.push([[PLACE[0] + 8, -58], [PLACE[2] - 4, -58]], [[PLACE[0] + 8, 58], [PLACE[2] - 4, 58]], [[155, -58], [155, 58]]);
  return L;
})();
function alongLine(ln, x, z, rnd, reach, lead) {
  const [a, b] = ln, dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), ux = dx / len, uz = dz / len;
  const s = Math.max(0, Math.min(len, (x - a[0]) * ux + (z - a[1]) * uz)), px = a[0] + ux * s, pz = a[1] + uz * s, d = Math.hypot(px - x, pz - z);
  if (d > reach) return null;
  const dir = rnd() < 0.5 ? 1 : -1, s0 = Math.max(0, Math.min(len, s - dir * lead * (0.5 + 0.7 * rnd()))), s1 = Math.max(0, Math.min(len, s + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(s1 - s0) < 10) return null;
  const off = (rnd() - 0.5) * 1.6;
  return { d, pts: [[a[0] + ux * s0 - uz * off, a[1] + uz * s0 + ux * off], [a[0] + ux * s1 - uz * off, a[1] + uz * s1 + ux * off]] };
}
/** A walker's or coach's track along the way nearest to (x, z) within `reach`, passing the nearest point, starting `lead` metres before it; null if none. */
export function walkTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  for (const ln of LINES) { const t = alongLine(ln, x, z, rnd, reach, lead); if (t && (!best || t.d < best.d)) best = t; }
  return best;
}
export const bridgeTrack = () => null;
/** The Grand Canal's water inside the settlement: the head's reach and the cross-arm (layout.js CANAL; the canal itself runs on beyond the edge). */
const WATER = [[CANAL.end, -CANAL.w / 2, CANAL.x0, CANAL.w / 2], [CANAL.cross - CANAL.crossW / 2, -260, CANAL.cross + CANAL.crossW / 2, 260]];
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
/** The nearest point of the canal's water to (x, z), the distance and the water's index. */
export function canalSpot(x, z) {
  let best = null;
  WATER.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (!best || d < best.d) best = { p, d, i }; });
  return best;
}
/** A gondola's track along the cross-arm's middle nearest to (x, z): a pass by the nearest point, starting `lead` metres before it; null if the cross-arm is beyond `reach`. */
export function gondolaTrack(x, z, rnd, reach = 110, lead = 55) {
  const r = WATER[1], cx = (r[0] + r[2]) / 2;
  if (Math.abs(cx - x) > reach) return null;
  const near = Math.max(r[1] + 12, Math.min(r[3] - 12, z)), dir = rnd() < 0.5 ? 1 : -1;
  const a = Math.max(r[1] + 8, Math.min(r[3] - 8, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(r[1] + 8, Math.min(r[3] - 8, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 20) return null;
  const off = (rnd() - 0.5) * 6;
  return { pts: [[cx + off, a], [cx + off, b]] };
}
// the built-in boat (a yuloh), vendors (Chinese trades), sedan chairs and watchman of voices.js are Suzhou's and ask for `canalTrack` and `streetTrack`: none here
// (Versailles has its own, TRACKS below)
export const canalTrack = () => null;
export const streetTrack = () => null;
/** The passing sounds of the place (soundscape's `track`): [key, voice, speed, r50, gap, ok(hour, rain), get]. */
export const TRACKS = [
  { key: 'ver-coach', voice: 'verCoach', speed: 4.2, r50: 18, gap: [14, 40], ok: (h, rain) => h >= 6 && h < 23.5 && rain < 0.85, get: (x, z, r) => walkTrack(x, z, r, 110, 70) },
  { key: 'ver-cry', voice: 'verCry', speed: 1.0, r50: 10, gap: [26, 62], ok: (h, rain) => h >= 6 && h < 18 && rain < 0.45, get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
  { key: 'ver-watch', voice: 'verWatch', speed: 1.05, r50: 12, gap: [45, 110], ok: (h, rain) => (h >= 20 || h < 4.5) && rain < 0.5, get: (x, z, r) => walkTrack(x, z, r, 90, 36) },
  { key: 'ver-gondola', voice: 'verGondola', speed: 1.1, r50: 22, gap: [70, 160], ok: (h, rain) => h >= 8 && h < 19.5 && rain < 0.4, get: (x, z, r) => gondolaTrack(x, z, r) },
];

// no pond, no lotus, no bamboo; the canal and the fountains are the water
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** The trees of the gardens: the hornbeam walls along the Tapis Vert and the groves of the bosquets (x < −130, 26 < |z| < 130), and the lime rows of the avenues [inferred]; no cicadas (reach < 38) in this region. */
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach < 38) return null;
  for (let k = 0; k < 8; k++) {
    const px = -300 + rnd() * 170, pz = (rnd() < 0.5 ? -1 : 1) * (26 + rnd() * 100);
    if (Math.hypot(px - x, pz - z) < reach + 10) return [px, pz];
  }
  for (let k = 0; k < 4; k++) {
    const px = PLACE[2] + 20 + rnd() * 150, pz = (rnd() < 0.5 ? -1 : 1) * (14 + rnd() * 6);
    if (Math.hypot(px - x, pz - z) < reach) return [px, pz];
  }
  return null;
}
const GARDENS = [-330, -135, -4, 135];
/** 0…1: how much broad-leaved tree is round: the bosquets' groves and the hornbeam walls, the orange trees of the parterre, little in the town. */
export function leafNear(x, z) {
  const g = x < -4 && Math.abs(z) < 135 ? 1 - sm(0, 40, rectDist([-330, -135, -130, 135], x, z)) * 0.5 : 0;
  const p = inRect(PARTERRE, x, z) ? 0.35 : 0;
  return Math.min(1, Math.max(0.55 * g, p, x > PLACE[2] ? 0.15 : 0));
}
/** 0…1: how much green round (the crickets): the lawns and the Tapis Vert, the parterre's beds. */
export function greenNear(x, z) {
  const d = rectDist(GARDENS, x, z);
  return x < 0 ? Math.max(0.12, 1 - sm(0, 40, d)) : 0.12 * (1 - sm(0, 60, x - PLACE[2]));
}
/** 0…1: how much of the town's hubbub reaches (x, z): the Place and the avenues, the shops' rows; less at the gate, none in the gardens. */
export function townNear(x, z) {
  if (x < -4) return 0.06 * (1 - sm(-140, -4, x));
  if (x < 100) return 0.2 + 0.25 * sm(40, 100, x);
  if (inRect(PLACE, x, z)) return 0.9;
  return Math.max(0.15, 1 - 0.7 * sm(RADIUS - 200, RADIUS - 40, Math.hypot(x, z)));
}
/** 0…1: wet ground for the frogs: none (the Latona basin's frogs are bronze). */
export const frogGround = () => 0;

// ── the rooms ─────────────────────────────────────────────────────────────────
const UPPER_ABOVE = 3.9;       // above the ground storey's ceiling (townhouse.js: 3.7 m) from the ground
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: a trade's shop (the twelve trades) or a
 * service lodging (the gardens'), chapel (the royal chapel: stone, high), hall (the Hall of Mirrors and the state rooms on the first floor),
 * house (any other lot that can be entered).
 */
export function roomAt(x, z, y = 0) {
  if (inRect([CHAPEL[0] + 1.6, CHAPEL[1] + 1.6, CHAPEL[2] - 1.6, CHAPEL[3] - 1.6], x, z)) return { use: 'chapel', at: CHAPEL_AT, upper: false, same: 'chapel' };
  for (const [id, rect, fy] of STATE_ROOMS) if (y > fy - 0.5 && y < fy + 9 && inRect(rect, x, z)) return { use: 'hall', at: mid(rect), upper: false, same: id === 'hall of mirrors' ? 'mirrors' : 'state:' + id };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > s.ground + UPPER_ABOVE, same: s.id };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: mid(l.rect), upper: y > RISE + UPPER_ABOVE, same: 'lot:' + l.seed };
  return null;
}

/**
 * What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is from
 * inside (slate over timber: loud; the chapel's and the Hall's vaults: far), `work` the small voices made in the room now and then [voice, gap s]
 * (the trade's own noise is the shop's emitter in WORK, heard whole inside it), `hush` how much of the outdoors comes through.
 */
export const ROOMS = {
  baker: { tone: [380, 0.4], roof: 1.0, hush: 0.8, work: [['sack', 30]] },
  tavern: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 8], ['bowlClack', 20]] },
  draper: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 26]] },
  apothecary: { tone: [250, 0.18], roof: 1.0, hush: 0.7, work: [['jarLid', 40]] },
  cobbler: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['broom', 60]] },
  barber: { tone: [270, 0.2], roof: 1.0, hush: 0.8, work: [['clothRustle', 40]] },
  cutler: { tone: [320, 0.3], roof: 1.0, hush: 0.9, work: [['drawer', 50]] },
  vintner: { tone: [300, 0.3], roof: 1.0, hush: 0.9, work: [['jarLid', 60]] },
  bookseller: { tone: [220, 0.12], roof: 1.0, hush: 0.6, work: [['paper', 20]] },
  butcher: { tone: [320, 0.3], roof: 1.0, hush: 0.9, work: [['drawer', 60]] },
  hatter: { tone: [250, 0.15], roof: 1.0, hush: 0.7, work: [['clothRustle', 40]] },
  chandler: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['paper', 50]] },
  gardener: { tone: [280, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 60]] },
  tools: { tone: [330, 0.25], roof: 1.0, hush: 1.0, work: [['sack', 40]] },
  sculptor: { tone: [300, 0.3], roof: 1.0, hush: 0.9, work: [['sack', 70]] },
  bearers: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['bowlClack', 40]] },
  guard: { tone: [280, 0.25], roof: 1.0, hush: 0.7, work: [['bowlClack', 30]] },
  fountain: { tone: [320, 0.3], roof: 1.0, hush: 0.9, work: [['drawer', 80]] },
  orangery: { tone: [240, 0.15], roof: 1.0, hush: 0.8, work: [['sack', 80]] },
  joiner: { tone: [300, 0.3], roof: 1.0, hush: 0.9, work: [['broom', 50]] },
  chapel: { tone: [130, 0.3], roof: 0.3, hush: 0.35, work: [['woodfish', 90]] },        // the chapel's stone vault under its roof
  hall: { tone: [170, 0.22], roof: 0.5, hush: 0.45, work: [['paper', 60]] },            // the Hall's vault and its mirrors: loud walls, far rain
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The upper floors: close under the roof (the rain loud), nearly silent. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 30], ['broom', 80]] };
