// Where Suzhou's sounds are (docs/settlements/ming-suzhou.md §22): the places of its emitters and
// the geometry the audio engine needs to put each sound where it comes from — the canals, the streets,
// the bridges, the pond's shore, the trade houses, the temple's halls, the bamboo and the lotus, the
// rooms one can be inside. Pure data and functions of layout.js and uphouses.js (no three.js), read
// by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js.
// Coordinates: metres, +x east, +z south, the settlement's own frame (as the camera has in it).

import { CANALS, STREETS, BRIDGES, GARDEN, POND, BUILDINGS, TEMPLE_COURT, RESIDENCE, RADIUS, lots, pondDistance, inRect } from './layout.js';
import { UP } from './uphouses.js';

/** Where the audio puts the listener when the engine gives none (the way in, on the south street). */
export const HOME = [0, 65];

/** A deterministic 0…1 from numbers (for the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the trade houses and the temple's halls ───────────────────────────────────
/**
 * What each sound-making house is: the use (uphouses.js's UP) and the trade's work heard from it.
 * `work`: the voices of the house, as [voice, gap in seconds [min, max], hours [from, to]]. Where the
 * work is and when it is done is [inferred] from the trade (the dossier §22 gives the reasoning).
 */
const WORK = {
  weaver: [['loom', [10, 24], [6.5, 18.5]]],
  iron: [['hammer', [12, 30], [7, 18]]],
  inn: [['teaTalk', [8, 18], [6, 22.5]], ['teaBlock', [40, 90], [13, 21.5]]],
  pawn: [['abacus', [20, 50], [8, 18]]],
  rice: [['abacus', [26, 60], [6.5, 18]]],
  cloth: [['scissors', [20, 50], [8, 18]]],
  medicine: [['mortar', [18, 40], [7, 18]]],
  books: [['chisel', [14, 30], [8, 17.5]]],
  wine: [['pourWine', [30, 70], [9, 22]]],
  food: [['kitchen', [10, 22], [6, 21]]],
  tenement: [['kitchen', [14, 30], [5.5, 20]]],
  pottery: [['wheel', [30, 60], [8, 17]]],
  fans: [['splitBamboo', [20, 45], [8, 17.5]]],
};

let SITES = null;
/** The houses with sounds: { use, rect, at: [x, z] (the middle), id }. */
export function sites() {
  if (SITES) return SITES;
  const all = lots();
  SITES = [];
  for (const u of UP) {
    const l = all.find((q) => Math.abs(q.rect[0] - u.x0) < 0.02 && q.front === 's' && q.rect[3] > 40 && q.rect[3] < 64);
    if (!l) continue;
    const [x0, z0, x1, z1] = l.rect;
    SITES.push({ use: u.use, rect: l.rect, at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'up:' + u.use, work: WORK[u.use] || [] });
  }
  return SITES;
}

// the temple (north.js): the bell in the east side hall and the drum in the west one (dong zhong xi gu: the bell
// east, the drum west, as in the halls of Chinese Buddhist monasteries), the chant and the wooden fish in the main hall
export const TEMPLE = {
  bell: [-12.5, -124], drum: [-67.5, -124], hall: [-40, -122.2], court: [-40, -135.7],
  rects: { hall: [-52, -127, -28, -117.5], east: [-17, -128, -8, -120], west: [-72, -128, -63, -120] },
};

/** The wells of the streets (town.js riverLife(): the ones built; tests/suzhou-sound.test.mjs checks them against it). */
export const WELLS = [[122.7, 66.5], [-95.5, -40.5], [-95.5, -111.4]];

/**
 * The places far off in the old city, that the drum, the bell and the temple at the Hanshan are heard from [stated for the towers
 * and for Hanshan, whose bell Zhang Ji heard from his boat: the old city's centre lay about a kilometre south-west of the Pingjiang
 * quarter, Hanshan Temple some four kilometres west of the city (directions rounded)].
 */
export const FAR = { tower: [-760, 880], hanshan: [-4300, 1300] };

// ── geometry of the waters and the streets ────────────────────────────────────
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
const dist = (p, x, z) => Math.hypot(p[0] - x, p[1] - z);

/** The nearest point of the canals' water (the quay wall's foot) to (x, z), the distance and the canal's index. */
export function canalSpot(x, z) {
  let best = null;
  CANALS.forEach((r, i) => { const p = nearIn(r, x, z), d = dist(p, x, z); if (!best || d < best.d) best = { p, d, i }; });
  return best;
}

/**
 * A boat's track on a canal: the straight centre line through the canal's reach nearest to (x, z), from s0 to s1 along it
 * (a pass by the nearest point, starting `lead` metres before it), or null if no canal is within `reach`.
 */
export function canalTrack(x, z, rnd, reach = 70, lead = 38) {
  const c = canalSpot(x, z);
  if (!c || c.d > reach) return null;
  const r = CANALS[c.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 6, hi = (horiz ? r[2] : r[3]) - 6, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.6 + 0.6 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 14) return null;
  return horiz ? { pts: [[a, mid], [b, mid]] } : { pts: [[mid, a], [mid, b]] };
}

/** A walker's track along the street (or lane) nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  STREETS.forEach((r, i) => { const p = nearIn(r, x, z), d = dist(p, x, z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = STREETS[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, mid + off], [b, mid + off]] } : { pts: [[mid + off, a], [mid + off, b]] };
}

/** The bridge nearest to (x, z) within `reach`: { at, across, span, d } or null. Its track runs over the span. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  let best = null;
  for (const b of BRIDGES) { const d = Math.hypot(b.at[0] - x, b.at[1] - z); if (d < reach && (!best || d < best.d)) best = { b, d }; }
  if (!best) return null;
  const { at, across, span } = best.b, h = span / 2 + 3, s = rnd() < 0.5 ? 1 : -1;
  return across === 'z' ? { pts: [[at[0] + (rnd() - 0.5), at[1] - s * h], [at[0] + (rnd() - 0.5), at[1] + s * h]], d: best.d } : { pts: [[at[0] - s * h, at[1] + (rnd() - 0.5)], [at[0] + s * h, at[1] + (rnd() - 0.5)]], d: best.d };
}

/** A point on the pond's water within `reach` of (x, z) (a ring of tries), or null; the garden only. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (!inRect(GARDEN, x, z, 30)) return null;
  for (let k = 0; k < 14; k++) {
    const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (pondDistance(px, pz) < -1.2) return [px, pz];
  }
  return null;
}

/** The pond's shore near (x, z): where a ray from it in a random direction first crosses the water's edge (the stone, for the lap), or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  if (!inRect(GARDEN, x, z, 30)) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = pondDistance(x + c, z + s) < 0;
    for (let d = 2; d <= reach; d++) {
      const px = x + c * d, pz = z + s * d, w = pondDistance(px, pz) < 0;
      if (w !== prev && inRect(GARDEN, px, pz)) return [px, pz];
      prev = w;
    }
  }
  return null;
}

/** A tree to put a bird or a cicada in, near (x, z): the garden's planting (inside the garden walls, on land), by hash; or the willows by the canals. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 10; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (inRect(GARDEN, px, pz, -1) && pondDistance(px, pz) > 1.5) return [px, pz];
    const cs = canalSpot(px, pz);
    if (cs && cs.d > 0.8 && cs.d < 2.6 && Math.hypot(px, pz) < RADIUS - 12) return [px, pz];
  }
  return null;
}

// ── where the planting makes its sound ────────────────────────────────────────
const HOLLOW = [-68, -34, -59, -20];                 // the bamboo hollow (ground.js)
const LOTUS = [[[0, -36], 24], [[-38, -40], 12], [[35, -45], 14], [[-48, -61], 8], [[-47, -18], 14]];   // plan.js's lotus clumps: centre, radius
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** 0…1: how much bamboo is round (x, z): the hollow, the groves by the garden's walls (within 6 m of them), the pavilion of Wutong and Bamboo. */
export function bambooNear(x, z) {
  let m = 0;
  m = Math.max(m, 1 - sm(0, 22, rectDist(HOLLOW, x, z)));
  if (inRect(GARDEN, x, z, 14)) {
    const wall = Math.min(Math.abs(x - GARDEN[0]), Math.abs(GARDEN[2] - x), Math.abs(z - GARDEN[1]), Math.abs(GARDEN[3] - z));
    const inside = inRect(GARDEN, x, z) ? 1 : 0.5;
    m = Math.max(m, 0.7 * inside * (1 - sm(4, 22, wall)));
  }
  m = Math.max(m, 0.8 * (1 - sm(3, 20, Math.hypot(x - 57, z + 44))));
  return m;
}
/** 0…1: how near the lotus beds (the leaves that rain beats on). */
export function lotusNear(x, z) {
  let m = 0;
  for (const [c, r] of LOTUS) m = Math.max(m, 1 - sm(r * 0.5, r + 16, Math.hypot(x - c[0], z - c[1])));
  return m;
}
/** 0…1: how much broad-leaved tree is round (the garden's maples, plums, camphors, the willows of the canals). */
export function leafNear(x, z) {
  const garden = inRect(GARDEN, x, z) ? 1 : 1 - sm(0, 24, rectDist(GARDEN, x, z));
  const cs = canalSpot(x, z);
  const willow = cs ? 0.55 * (1 - sm(1, 16, cs.d)) : 0;
  return Math.min(1, Math.max(0.75 * garden, willow));
}
/** 0…1: how much green round (x, z) for the cicadas and the insects: the garden at its fullest, the canal streets half, the paved lanes a little. */
export function greenNear(x, z) {
  const garden = inRect(GARDEN, x, z) ? 1 : 1 - sm(0, 30, rectDist(GARDEN, x, z));
  const edge = sm(150, 205, Math.hypot(x, z));              // the fields and yards at the rim
  const cs = canalSpot(x, z);
  const willow = cs ? 0.5 * (1 - sm(1, 18, cs.d)) : 0;
  return Math.max(garden, edge * 0.8, willow, 0.12);
}
/** 0…1: how much open water and wet ground (the frogs): the pond's shore, the rim's fields. */
export function frogGround(x, z) {
  const pond = inRect(GARDEN, x, z, 40) ? 1 - sm(0, 40, Math.max(0, pondDistance(x, z))) : 0;
  const fields = sm(160, 205, Math.hypot(x, z));
  return Math.max(pond, fields * 0.9);
}

// ── the rooms ─────────────────────────────────────────────────────────────────
/**
 * The room the listener is in, from its place: { use, at (the room's middle), upper (on an upper floor), same (an id for the
 * building) } or null in the open. Uses: a trade house's (rice, inn, merchant, cloth, medicine, books, lacquer, tenement, wine,
 * pawn, food, silk, pottery, iron, fans, weaver), hall (the garden's halls, the loquat court's hall), pavilion, temple (its halls),
 * residence (the owner's house), house (any other).
 */
export function roomAt(x, z, y = 0) {
  const upper = y > 2.4;
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper, same: s.id };
  for (const [k, r] of Object.entries(TEMPLE.rects)) if (inRect(r, x, z)) return { use: 'temple', at: TEMPLE.hall, upper: false, same: 'temple:' + k };
  for (const [id, b] of Object.entries(BUILDINGS)) {
    const r = b.rect || [b.c[0] - (b.r || b.w / 2), b.c[1] - (b.r || (b.d || b.w) / 2), b.c[0] + (b.r || b.w / 2), b.c[1] + (b.r || (b.d || b.w) / 2)];
    if (inRect(r, x, z)) return { use: /hall/.test(b.kind) ? 'hall' : 'pavilion', at: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], upper: y > b.y + 2.4, same: 'g:' + id };
  }
  if (inRect(RESIDENCE, x, z)) return { use: 'residence', at: [(RESIDENCE[0] + RESIDENCE[2]) / 2, (RESIDENCE[1] + RESIDENCE[3]) / 2], upper, same: 'residence' };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper, same: 'lot:' + l.seed };
  return null;
}

/**
 * What each kind of room sounds like inside (the engine reads it): `tone` the room's own hush (a lowpass in Hz and a level),
 * `roof` how loud the rain on the tiles is from inside (relative), `work` the voice made in the room now and then [voice, gap s],
 * `hush` how much of the outdoors comes through (1 = as the muffle gives it).
 */
export const ROOMS = {
  inn: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaTalk', 5], ['teaClink', 4], ['teaBlock', 40]] },
  rice: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['abacus', 22], ['sack', 30]] },
  merchant: { tone: [260, 0.2], roof: 0.9, hush: 0.7, work: [['paper', 40]] },
  cloth: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['scissors', 20], ['clothRustle', 26]] },
  medicine: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['mortar', 14], ['drawer', 40]] },
  books: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['chisel', 10], ['paper', 36]] },
  lacquer: { tone: [220, 0.15], roof: 1.0, hush: 0.6, work: [['brushLacquer', 30]] },
  tenement: { tone: [380, 0.4], roof: 1.0, hush: 0.9, work: [['kitchen', 8], ['broom', 50]] },
  wine: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['pourWine', 20], ['jarLid', 40]] },
  pawn: { tone: [240, 0.2], roof: 0.9, hush: 0.6, work: [['abacus', 16], ['coin', 34]] },
  food: { tone: [500, 0.5], roof: 1.0, hush: 0.9, work: [['kitchen', 6], ['bowlClack', 14]] },
  silk: { tone: [240, 0.15], roof: 1.0, hush: 0.7, work: [['clothRustle', 24]] },
  pottery: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['wheel', 26], ['clay', 14]] },
  iron: { tone: [400, 0.4], roof: 1.0, hush: 1.0, work: [['hammer', 12]] },
  fans: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['splitBamboo', 16], ['paper', 30]] },
  weaver: { tone: [340, 0.35], roof: 1.0, hush: 0.8, work: [['loom', 8]] },
  hall: { tone: [160, 0.22], roof: 0.7, hush: 0.55, work: [['paper', 70]] },         // the garden's halls: high, empty, the air in them
  pavilion: { tone: [700, 0.18], roof: 0.5, hush: 0.9, work: [] },                    // open on every side: the garden comes in
  temple: { tone: [130, 0.3], roof: 0.6, hush: 0.45, work: [['woodfish', 70]] },
  residence: { tone: [220, 0.2], roof: 0.9, hush: 0.7, work: [['paper', 55], ['broom', 90]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The study and the bedroom above the merchant's hall, the upper floors: nearly silent, close under the tiles (the rain loud). */
export const UPPER = { tone: [200, 0.12], roof: 1.7, hush: 0.6, work: [['brush', 18], ['paper', 30]] };

// ── the emitters in the open (the engine's placed sounds) ─────────────────────
/**
 * Fixed emitters outside the houses' work: [voice, at, r50 (m: the distance at which it is half as loud), [gap min, max] s,
 * hours [from, to] (local, 0…24; wrapping over midnight when from > to)], with `dry` (not in rain), `season` (a name of
 * SEASON_OF in voices.js) and `lv`. The houses' own work (WORK) is added by the engine from sites().
 */
export const EMITTERS = [
  // the carpenter's yard on the back lane south of the south canal [inferred position]
  { voice: 'plane', at: [-126, 89.5], r50: 9, gap: [16, 38], hours: [7, 17.5], dry: true },
  // the pedlars' crossroads at the bridge heads: a stall of the knife grinder at the middle bridge's south head
  { voice: 'grinder', at: [3, 66], r50: 11, gap: [40, 100], hours: [8, 17], dry: true },
  // Little Canglang, where the scholar sits with his qin (xiaocanglang, layout.js): a phrase now and then, toward evening above all
  { voice: 'qin', at: [-47, 5], r50: 22, gap: [26, 70], hours: [6.5, 22], rainMax: 0.7, lv: 1 },
  // across the water at dusk: a flute from the far shore (the east island's side) and one from a boat on the east canal
  { voice: 'xiao', at: [56, -62], r50: 28, gap: [45, 110], hours: [17, 20.5], rainMax: 0.5 },
  { voice: 'xiao', at: [99.5, -80], r50: 34, gap: [70, 160], hours: [17.5, 20.5], rainMax: 0.4 },
];

/** The qin's emitter and the others' hours as the schedule test reads them. */
export const BELLS = { tower: { pm: 18.75, am: 5.0 } };
