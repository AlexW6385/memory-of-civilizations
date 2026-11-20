// Where Baroque Rome's sounds are (docs/settlements/baroque-rome.md §6): the places of its emitters and the geometry the audio engine needs to put
// each sound where it is made — the fountains of the piazza and of the Borgo's houses, the ship-mills of the Tiber and its washerwomen, the market at
// the Borgo's mouth, the pilgrims at the steps, the Swiss at their posts, the work of the open botteghe, the rooms one can be inside (the basilica, the
// Sistine Chapel, the shops and the climbed houses). Pure data and functions of the layout and the walk (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js and ./voices.js. Metres, +x east, +z south. [inferred throughout: no recording of
// Rome in 1670 exists; what is [stated] is marked in the dossier §6.]
import { RADIUS, OVAL, CROSSING, FRONT_X, SISTINA_C, GARDEN, CASTEL, TIBER, tiberX, inTiber, inRect, inLot, inRow, openHomes, rows, frontPt } from './layout.js';
import { openShops } from './openwalk.js';
import { ARRIVALS } from '../../planet/arrivals.js';
import './voices.js';

/** Where the audio puts the listener when the engine gives none: the arrival. */
export const HOME = [ARRIVALS['baroque-rome'][0], ARRIVALS['baroque-rome'][2]];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the workshops ───────────────────────────────────────────────────────────────
/**
 * The work heard from each trade of the open botteghe: [voice, gap in seconds [min, max], hours [from, to]]. When and what is [inferred] from the trade:
 * the bakers began before dawn, the shops kept the daylight hours, the osteria went on into the evening; the medal-sellers' beads are the Holy Years' trade.
 */
export const WORK = {
  grocer: [['sack', [24, 50], [6, 19]], ['coin', [30, 70], [7, 19]]],
  baker: [['sack', [20, 45], [3, 12]], ['kitchen', [14, 28], [3, 12]]],
  cloth: [['scissors', [18, 40], [7, 19]]],
  wine: [['pourWine', [22, 52], [8, 22]]],
  apothecary: [['mortar', [14, 30], [7, 19]]],
  osteria: [['teaTalk', [8, 18], [8, 23]], ['teaClink', [20, 50], [8, 23]]],
  cobbler: [['chisel', [10, 24], [7, 19]]],
  devotional: [['brmBeads', [14, 34], [7, 19]]],
  inn: [['teaTalk', [8, 18], [8, 23]], ['teaClink', [20, 50], [8, 23]], ['kitchen', [16, 32], [9, 21]]],
  home: [['bowlClack', [30, 70], [7, 21]]],
};
let SITES = null;
/** The houses with sounds: { use, rect, at, id, work }. The open botteghe of the Borgo (nearest the walk) and the homes nearest the arrival. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const s of openShops()) {
    const use = s.up === 'inn' ? 'inn' : s.trade;
    if (!WORK[use]) continue;
    SITES.push({ use, rect: s.rect, at: s.at, id: `shop:${s.kind}:${Math.round(s.at[0])},${Math.round(s.at[1])}`, work: WORK[use] });
  }
  for (const [l, use] of openHomes(HOME)) {
    const [x0, z0, x1, z1] = l.rect;
    SITES.push({ use, rect: l.rect, at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'lot:' + l.seed, work: WORK[use] });
  }
  return SITES;
}
/** No wells: the water came to the Borgo from the Acqua Paola's fountains and the river (the water-sellers' trade). */
export const WELLS = [];

// ── the water ───────────────────────────────────────────────────────────────────
/** The ship-mills moored in the stream (plan.js tiberworks), and the washerwomen's places on the west bank (street.js). */
export const MILLS = [-52, 78, 205].map((z) => [tiberX(z) - 9, z]);
export const WASH = [-170, -150, 110, 135].map((z) => [tiberX(z) - TIBER.w / 2 - 6, z]);
/** The two fountains of the piazza (Maderno's of 1614 and its twin, plan.js) and the wall fountains of the Borgo's houses (a trough under a mascherone). */
export const FOUNTAINS = [[OVAL.c[0], OVAL.c[1] - 42], [OVAL.c[0], OVAL.c[1] + 42]];
export const canalSpot = () => null;
export const canalTrack = () => null;
/** No passing tracks of the Chinese kinds (a sedan chair with a chant, a rattle-drum pedlar, a clapper watchman): Rome's own are TRACKS below. */
export const streetTrack = () => null;
/** The bridge's walkers: a track over the Ponte Sant'Angelo's span (the bridge's origin is where the Passetto's end meets the river). */
export function bridgeTrack(x, z, rnd, reach = 60) {
  const bz = CASTEL.c[1], bx = tiberX(bz), d = Math.hypot(bx - x, bz - z);
  if (d > reach) return null;
  const h = TIBER.w / 2 + 9, s = rnd() < 0.5 ? 1 : -1;
  return { pts: [[bx - s * h, bz + (rnd() - 0.5) * 4], [bx + s * h, bz + (rnd() - 0.5) * 4]], d };
}
export const pondSpot = () => null;
/** The river's edge near (x, z): where a ray from it first crosses the water's margin (the lap on the bank's stones), or null. */
export function shoreSpot(x, z, rnd, reach = 24) {
  if (Math.abs(x - tiberX(z)) > TIBER.w / 2 + reach) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = inTiber(x, z);
    for (let d = 2; d <= reach; d++) { const px = x + c * d, pz = z + s * d, w = inTiber(px, pz); if (w !== prev) return [px, pz]; prev = w; }
  }
  return null;
}
/** A tree to put a bird or a cicada in, near (x, z): the Vatican gardens' cypresses and stone pines and the rising ground west, in open ground. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    const garden = inRect([GARDEN[0] - 12, GARDEN[1] - 12, GARDEN[2] + 12, GARDEN[3] + 12], px, pz), hill = px < -270;
    if (Math.hypot(px, pz) < RADIUS - 8 && (garden || hill) && !inLot(px, pz, 1) && !inRow(px, pz, 1)) return [px, pz];
  }
  return null;
}
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** 0…1: broad-leaved and evergreen trees round: the gardens, the hill, the river's banks a little. */
export function leafNear(x, z) {
  const g = 1 - sm(10, 70, Math.hypot(Math.max(GARDEN[0] - x, 0, x - GARDEN[2]), Math.max(GARDEN[1] - z, 0, z - GARDEN[3])));
  return Math.min(1, Math.max(0.6 * g, 0.4 * sm(-250, -330, x), 0.1));
}
/** 0…1: how much green round (x, z), for the cicadas and the insects (a Roman summer's): the gardens, the hill, the Tiber's banks a little, the paved centre a little. */
export function greenNear(x, z) {
  const g = 1 - sm(10, 90, Math.hypot(Math.max(GARDEN[0] - x, 0, x - GARDEN[2]), Math.max(GARDEN[1] - z, 0, z - GARDEN[3])));
  const bank = 0.4 * (1 - sm(TIBER.w / 2, TIBER.w / 2 + 30, Math.abs(x - tiberX(z))));
  return Math.max(0.85 * g, bank, 0.1, 0.6 * sm(-250, -330, x));
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the piazza and the Borgo's streets, less toward the rim and the gardens and on the river. */
export function townNear(x, z) {
  const rim = 1 - 0.65 * sm(RADIUS - 170, RADIUS - 30, Math.hypot(x, z)), hill = 1 - 0.6 * sm(-230, -320, x);
  return Math.max(0.1, rim * hill);
}
/** 0…1: wet ground for the frogs: the Tiber's reedy banks, in the warm nights. */
export function frogGround(x, z) { return 0.6 * (1 - sm(TIBER.w / 2 - 4, TIBER.w / 2 + 14, Math.abs(x - tiberX(z)))); }

// ── the rooms ─────────────────────────────────────────────────────────────────
const BASILICA = [CROSSING[0] - 56, -46, FRONT_X - 3, 46];
const SISTINA = [SISTINA_C[0] - 22.65, SISTINA_C[1] - 8.9, SISTINA_C[0] + 22.65, SISTINA_C[1] + 8.9];
const ROOM_LOTS = [];
/** The room the listener is in: { use, at, upper, same } or null in the open. Uses: the open botteghe's trades, inn, home, church, sistina, and house for a shut one. */
export function roomAt(x, z, y = 0) {
  const upper = y > 2.4;
  if (inRect(BASILICA, x, z)) return { use: 'church', at: [x, z], upper: false, same: 'church' };
  if (inRect(SISTINA, x, z)) return { use: 'sistina', at: SISTINA_C, upper: false, same: 'sistina' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper, same: s.id };
  return null;
}
void ROOM_LOTS;

/** What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` the rain on the tiles from inside, `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through. */
export const ROOMS = {
  inn: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 6], ['pourWine', 30]] },
  home: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['broom', 70], ['bowlClack', 30]] },
  grocer: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['sack', 30], ['coin', 50]] },
  baker: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['sack', 26], ['drawer', 60]] },
  cloth: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 22]] },
  wine: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['jarLid', 36], ['pourWine', 50]] },
  apothecary: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 30], ['jarLid', 50]] },
  osteria: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 6], ['pourWine', 30]] },
  cobbler: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 40]] },
  devotional: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['brmBeads', 24], ['drawer', 50]] },
  church: { tone: [140, 0.25], roof: 0.5, hush: 0.4, work: [['footfall', 28], ['murmur', 24]] },
  sistina: { tone: [150, 0.25], roof: 0.6, hush: 0.4, work: [['footfall', 40], ['paper', 50]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The bedrooms and workrooms upstairs: nearly silent, close under the tiles (the rain loud). */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 30], ['clothRustle', 40]] };

// ── the emitters in the open ────────────────────────────────────────────────────
/**
 * Fixed emitters: [voice, at, r50 (m: the distance at which it is half as loud), [gap min, max] s, hours [from, to] (local, 0…24)], with `dry` (not in rain), `rainMax`, `lv`.
 * The houses' own work (WORK) is added by the engine from sites(). [inferred throughout, from the dossier: the fountains, the mills (stated, docs §5b), the market
 * at the Borgo's mouth, the pilgrims at the steps and the Swiss at the colonnade's mouths.]
 */
export const EMITTERS = [
  // the piazza's two fountains: the rush of water, all hours, heard across the oval (their gap is shorter than the voice, so that it never stops)
  ...FOUNTAINS.map(([x, z]) => ({ voice: 'brmFountain', at: [x, z], r50: 22, gap: [12, 13], hours: [0, 24], lv: 1 })),
  // the ship-mills in the stream: the wheels turn day and night
  ...MILLS.map(([x, z]) => ({ voice: 'brmMill', at: [x, z], r50: 26, gap: [11, 12], hours: [0, 24], lv: 1 })),
  // the market at the Borgo's mouth (street.js stalls): cries by day
  ...[[108, -19], [114, 16], [122, -22], [104, 19], [128, 19.5]].map(([x, z], i) => ({ voice: 'marketCry', at: [x, z], r50: 14, gap: [10 + i, 26 + i * 2], hours: [6.5, 13], rainMax: 0.6 })),
  // pilgrims at the foot of the steps and about the obelisk: a litany murmured, kneeling
  { voice: 'murmur', at: [FRONT_X + 60, -8], r50: 12, gap: [14, 34], hours: [7, 19], rainMax: 0.7 },
  { voice: 'murmur', at: [OVAL.c[0] - 14, 12], r50: 12, gap: [16, 38], hours: [7, 19], rainMax: 0.7 },
  { voice: 'footfall', at: [FRONT_X + 8, 0], r50: 14, gap: [18, 40], hours: [6, 19], rainMax: 0.8 },
  // the Swiss at the colonnade's mouths: the change of guard
  ...[-1, 1].map((s) => ({ voice: 'brmHalberd', at: [OVAL.c[0] + 63, s * 37], r50: 14, gap: [90, 150], hours: [8, 20], dry: true })),
  // the water-seller at the Borgo's mouth, the washerwomen on the Tiber's bank
  { voice: 'pour', at: [118, -3], r50: 8, gap: [24, 50], hours: [7, 18], dry: true },
  ...WASH.map(([x, z], i) => ({ voice: i % 2 ? 'clothRustle' : 'pour', at: [x, z], r50: 12, gap: [14 + i * 2, 34], hours: [7, 17], dry: true })),
];
// the wall fountains of the Borgo's houses
for (const r of rows()) for (const u of r.units) if (u.fountain) EMITTERS.push({ voice: 'fountain', at: frontPt(r, u.u0 + u.w / 2, -0.6).at, r50: 7, gap: [5, 8], hours: [0, 24], lv: 1 });

// ── what passes ─────────────────────────────────────────────────────────────────
/** The Borgo Nuovo and the Borgo Vecchio and the oval, as ways a coach, a procession or a pedlar goes: [from, to] lines in x/z. */
const WAYS = [[[134, -19], [226, -19]], [[134, 17], [226, 17]], [[100, -20], [-20, -20]], [[100, 22], [-20, 22]], [[FRONT_X + 30, 0], [OVAL.c[0] + 60, 0]]];
function wayTrack(x, z, rnd, reach = 80, lead = 34) {
  const cand = [];
  for (const [a, b] of WAYS) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (L * L))), px = a[0] + dx * t, pz = a[1] + dz * t, d = Math.hypot(px - x, pz - z);
    if (d < reach) cand.push({ d, a, b, L, t });
  }
  if (!cand.length) return null;
  const c = cand.reduce((p, q) => (q.d < p.d ? q : p)), dir = rnd() < 0.5 ? 1 : -1, ux = (c.b[0] - c.a[0]) / c.L, uz = (c.b[1] - c.a[1]) / c.L;
  const s0 = Math.max(0, Math.min(c.L, c.t * c.L - dir * lead * (0.5 + 0.7 * rnd()))), s1 = Math.max(0, Math.min(c.L, c.t * c.L + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(s1 - s0) < 12) return null;
  return { pts: [[c.a[0] + ux * s0, c.a[1] + uz * s0], [c.a[0] + ux * s1, c.a[1] + uz * s1]], d: c.d };
}
/** Rome's own passing sounds, which the scheduler adds to the shared ones (voices.js placed(): `M.TRACKS`): [key, voice, speed m/s, r50, gap [min, max], ok(hour, rain), track(x, z, rnd)]. */
export const TRACKS = [
  { key: 'br:coach', voice: 'brmCoach', speed: 1.6, r50: 16, gap: [50, 110], ok: (h, rain) => h >= 8 && h < 20 && rain < 0.6, get: (x, z, r) => wayTrack(x, z, r, 90, 40) },
  { key: 'br:cry', voice: 'brmCry', speed: 0.95, r50: 12, gap: [34, 80], ok: (h, rain) => h >= 6.5 && h < 19 && rain < 0.4, get: (x, z, r) => wayTrack(x, z, r, 80, 30) },
  { key: 'br:litany', voice: 'brmLitany', speed: 0.9, r50: 18, gap: [160, 320], ok: (h, rain) => h >= 7 && h < 19 && rain < 0.3, get: (x, z, r) => wayTrack(x, z, r, 100, 45) },
  { key: 'br:patrol', voice: 'brmPatrol', speed: 1.0, r50: 12, gap: [70, 140], ok: (h, rain) => (h >= 20 || h < 4.5) && rain < 0.5, get: (x, z, r) => wayTrack(x, z, r, 90, 34) },
];
