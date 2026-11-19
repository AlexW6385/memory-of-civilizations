// Where Ming–Qing Beijing's sounds are (docs/settlements/qing-beijing.md §40): the places of its emitters and the geometry the
// audio engine needs to put each sound where it comes from — the moat and the Golden Water River's bridges, the avenue, the ring
// street and the lanes, the shops of the avenue, the courtyard houses, the palace's halls, gates and duty rooms, the Temple of
// Heaven's court, the old trees. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's
// `LIFE.map`) and played by src/engine/voices.js and voices-qing.js. Coordinates: metres, +x east, +z south, the settlement's own
// frame (as the camera has in it). Same interface as Suzhou's soundmap.js (the engine reads one shape).

import { RADIUS, MOAT, RING, AVENUE, NOTCH, WALL, HALLS, TEMPLE, DANBI, STREET_X, RIVER, inRect, lanes, interiorShops, furnishedHouses, wells, treeNear, inForecourt } from './layout.js';

// the court's rooms and the pavilions' storerooms (palace-rooms.js; copied so that the sound map pulls in no geometry: tests/beijing-sound.test.mjs checks them against it)
export const COURT_ROOMS = [[-105, -93.5, 'duty'], [-92.5, -81, 'wait'], [-64.5, -54, 'wait'], [-53, -42, 'duty'], [42, 53, 'wait'], [54, 64.5, 'duty'], [81, 92.5, 'duty'], [93.5, 105, 'wait']]
  .map(([a, b, kind]) => ({ rect: [a, 105.6, b, 113.4], kind }));
export const PAVILION_ROOMS = [{ rect: [-108, 46, -88, 64] }, { rect: [88, 46, 108, 64] }];

/** Where the audio puts the listener when the engine gives none (the arrival, in the great court). */
export const HOME = [0, 70];

/** A deterministic 0…1 from numbers (for the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
const dist = (p, x, z) => Math.hypot(p[0] - x, p[1] - z);
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

// ── the shops of the avenue and the houses ────────────────────────────────────
/**
 * The trade of each shop and the work heard from it: [voice, gap in seconds [min, max], hours [from, to]]. What each trade's work was and
 * when it was done is [inferred] from the trade (the dossier §40).
 */
const WORK = {
  teahouse: [['teaTalk', [8, 18], [6, 22.5]], ['teaBlock', [40, 90], [12.5, 21.5]]],
  pharmacy: [['mortar', [18, 40], [7, 18]]],
  grain: [['abacus', [26, 60], [6.5, 18]]],
  cloth: [['scissors', [20, 50], [8, 18]]],
  pawn: [['abacus', [20, 50], [8, 18]]],
  wine: [['pourWine', [30, 70], [9, 22]]],
  lantern: [['splitBamboo', [20, 45], [8, 17.5]]],
  shoes: [['qingAwl', [14, 32], [8, 18]]],
};
const HOUSE_WORK = [['kitchen', [16, 34], [5.5, 20]]];

let SITES = null;
/** The buildings with sounds: { use, rect, at: [x, z] (the middle), id, work }: the avenue's enterable shops, the courtyard houses that are entered. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const s of interiorShops()) {
    const sgn = s.side === 'w' ? 1 : -1, xa = s.front - sgn * s.depth, rect = [Math.min(xa, s.front), s.z0, Math.max(xa, s.front), s.z1];
    SITES.push({ use: s.kind, rect, at: [(rect[0] + rect[2]) / 2, (s.z0 + s.z1) / 2], id: 'shop:' + s.kind + Math.round(s.z0), work: WORK[s.kind] || [] });
  }
  for (const h of furnishedHouses()) SITES.push({ use: 'house', rect: h.rect, at: [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2 + 3], id: 'lot:' + h.seed, work: HOUSE_WORK });
  return SITES;
}

/** The wells of the lanes (layout.js wells(): the ones built). */
export const WELLS = wells();

/** The Temple of Heaven's hall and its court (layout.js TEMPLE): where the bell and the drum are not (the temple has none of the city's). */
export const TEMPLE_SOUND = { hall: TEMPLE.c, court: TEMPLE.c };
export { TEMPLE_SOUND as TEMPLE };
/** The places far off that a bell or a drum is heard from: the Drum and Bell Towers stand some 2.4 km north of the palace's north gate [inferred, rounded]. */
export const FAR = { tower: [0, -2600], bell: [0, -2650] };

// ── geometry of the water and the streets ─────────────────────────────────────
const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner, nx = NOTCH.x;
/** The moat's water as rectangles (as town.js lays them): the south side is two reaches either side of the Meridian Gate's forecourt. */
export const WATER = [[a0, b0, a1, d0], [a0, d1, -nx, b1], [nx, d1, a1, b1], [a0, d0, c0, d1], [c1, d0, a1, d1]];
export const isWater = (x, z) => WATER.some((r) => x > r[0] && x < r[2] && z > r[1] && z < r[3]);

/** The streets the walkers keep to (as rectangles, their middle line the track): the avenue, the ring street, the lanes (hutong), the north–south streets. */
export const STREETS = (() => {
  const S = [AVENUE, [RING[0], RING[1], RING[2], b0], [RING[0], b1, -nx, RING[3]], [nx, b1, RING[2], RING[3]], [RING[0], b0, a0, b1], [a1, b0, RING[2], b1]];
  for (const l of lanes()) if (l[2] - l[0] > 20) S.push(l);
  for (const x of STREET_X) S.push([x - 3, -RADIUS + 60, x + 3, RADIUS - 60]);
  return S;
})();

/** The nearest point of the moat's water to (x, z), the distance and the rectangle's index. */
export function canalSpot(x, z) {
  let best = null;
  WATER.forEach((r, i) => { const p = nearIn(r, x, z), d = dist(p, x, z); if (!best || d < best.d) best = { p, d, i }; });
  return best;
}

/**
 * A boat's track on the moat: the straight centre line through the reach of water nearest to (x, z), from s0 to s1 along it (a pass by the
 * nearest point, starting `lead` metres before it), or null if no water is within `reach` — or, most times, none: the palace's boats lay
 * tied up at the banks and were rowed seldom [inferred].
 */
export function canalTrack(x, z, rnd, reach = 70, lead = 38) {
  const c = canalSpot(x, z);
  if (!c || c.d > reach || rnd() < 0.6) return null;
  const r = WATER[c.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
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

/** A string of camels' track along the avenue (north–south, on the carriageway's east half, the camels keeping to the right going south), passing near (x, z); null beyond `reach`. */
export function avenueTrack(x, z, rnd, reach = 120) {
  if (rectDist(AVENUE, x, z) > reach) return null;
  const lo = AVENUE[1] + 8, hi = AVENUE[3] - 8, near = Math.max(lo, Math.min(hi, z)), dir = rnd() < 0.5 ? 1 : -1, off = dir > 0 ? 2.3 : -2.3;
  const a = Math.max(lo, Math.min(hi, near - dir * (45 + 30 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * (55 + 40 * rnd())));
  return Math.abs(b - a) < 25 ? null : { pts: [[off, a], [off, b]] };
}

// the bridges: the five marble bridges of the Golden Water River in the great court (officials crossed them seldom), and the two over the moat at the side gates
const BRIDGES = [-24, -12, 0, 12, 24].map((bx) => ({ at: [bx, (RIVER[1] + RIVER[3]) / 2], across: 'z', span: 7.2, p: 0.3 })).concat([{ at: [(a0 + c0) / 2, 65], across: 'x', span: c0 - a0 + 0.6, p: 0.8 }, { at: [(a1 + c1) / 2, 65], across: 'x', span: a1 - c1 + 0.6, p: 0.8 }]);
/** The bridge nearest to (x, z) within `reach`: its track runs over the span; null if none (or not this time: few cross the court's marble bridges). */
export function bridgeTrack(x, z, rnd, reach = 60) {
  let best = null;
  for (const b of BRIDGES) { const d = Math.hypot(b.at[0] - x, b.at[1] - z); if (d < reach && (!best || d < best.d)) best = { b, d }; }
  if (!best || rnd() > best.b.p) return null;
  const { at, across, span } = best.b, h = span / 2 + 3, s = rnd() < 0.5 ? 1 : -1;
  return across === 'z' ? { pts: [[at[0] + (rnd() - 0.5), at[1] - s * h], [at[0] + (rnd() - 0.5), at[1] + s * h]], d: best.d } : { pts: [[at[0] - s * h, at[1] + (rnd() - 0.5)], [at[0] - s * h * -1, at[1] + (rnd() - 0.5)]], d: best.d };
}

/** A point on the moat's water within `reach` of (x, z) (a ring of tries), or null: the carp rising. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (!canalSpot(x, z) || canalSpot(x, z).d > reach + 8) return null;
  for (let k = 0; k < 14; k++) {
    const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (isWater(px, pz) && isWater(px + 1.2, pz) && isWater(px - 1.2, pz) && isWater(px, pz + 1.2) && isWater(px, pz - 1.2)) return [px, pz];
  }
  return null;
}
/** The moat's wall near (x, z): where a ray from it in a random direction first crosses the water's edge (the stone, for the lap), or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = isWater(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const px = x + c * d, pz = z + s * d, w = isWater(px, pz); if (w !== prev) return [px, pz]; prev = w; }
  }
  return null;
}

/** A tree to put a bird or a cicada in, near (x, z): the courtyard trees, the pagoda trees of the lanes, the willows of the moat's outer bank, the temple's belt of arborvitae. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (treeNear(px, pz, 2.5)) return [px, pz];
    const dm = rectDist(MOAT.outer, px, pz);
    if (!inRect(MOAT.outer, px, pz) && dm > 0.8 && dm < 6 && hash(Math.round(px / 6), Math.round(pz / 6)) < 0.45 && Math.hypot(px, pz) < RADIUS - 20) return [px, pz];
    if (inRect(TEMPLE.belt, px, pz) && !inRect([TEMPLE.c[0] - TEMPLE.wall, TEMPLE.c[1] - TEMPLE.wall, TEMPLE.c[0] + TEMPLE.wall, TEMPLE.c[1] + TEMPLE.wall], px, pz)) return [px, pz];
  }
  return null;
}

// ── where the planting makes its sound ────────────────────────────────────────
const TEMPLE_WALL = [TEMPLE.c[0] - TEMPLE.wall, TEMPLE.c[1] - TEMPLE.wall, TEMPLE.c[0] + TEMPLE.wall, TEMPLE.c[1] + TEMPLE.wall];
/** 0: no bamboo in Beijing's lanes or courts. */
export const bambooNear = () => 0;
/** 0: no lotus on the moat at this date [inferred]. */
export const lotusNear = () => 0;
/** 0…1: how much broad-leaved or evergreen tree is round (x, z): the arborvitae belt of the temple, the willows of the moat's bank, the yards' pagoda trees and jujubes; none in the palace's courts. */
export function leafNear(x, z) {
  if (inRect(WALL.rect, x, z)) return 0;
  const belt = inRect(TEMPLE.belt, x, z) ? 0.8 : 0.8 * (1 - sm(0, 26, rectDist(TEMPLE.belt, x, z)));
  const moat = 0.5 * (1 - sm(1, 16, rectDist(MOAT.outer, x, z)));
  return Math.max(belt, moat, 0.28);
}
/** 0…1: how much green round, for the cicadas, crickets and the like: the belt and the moat's bank at most, the lanes' yards a little, the palace's paved courts none. */
export function greenNear(x, z) {
  if (inRect(WALL.rect, x, z)) return 0.04;
  const belt = 1 - sm(0, 30, rectDist(TEMPLE.belt, x, z));
  const moat = 0.45 * (1 - sm(1, 18, rectDist(MOAT.outer, x, z)));
  const edge = sm(RADIUS - 130, RADIUS - 40, Math.hypot(x, z));
  return Math.max(belt, moat, edge * 0.6, 0.22);
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the avenue and the lanes, little in the palace's courts and the temple's, less toward the rim. */
export function townNear(x, z) {
  if (inRect(WALL.rect, x, z)) return 0.1;
  if (inForecourt(x, z, 2)) return 0.45;
  if (inRect(TEMPLE_WALL, x, z, 2)) return 0.15;
  if (inRect(DANBI.rect, x, z, 2)) return 0.3;
  return Math.max(0.1, 1 - 0.6 * sm(RADIUS - 130, RADIUS - 20, Math.hypot(x, z)));
}
/** 0…1: how much open water and wet ground (the frogs): the moat's banks. */
export function frogGround(x, z) { return 0.3 * (1 - sm(0, 22, rectDist(MOAT.outer, x, z))) * (inRect(MOAT.inner, x, z) ? 0 : 1); }

// ── the rooms ─────────────────────────────────────────────────────────────────
const GATE_HALLS = [[-30, 167.2, 30, 176.8, 12.2], [HALLS.taihemen.rect[0], HALLS.taihemen.rect[1], HALLS.taihemen.rect[2], HALLS.taihemen.rect[3], 3.0], [-17, -175, 17, -166, 1.4]];
/**
 * The room the listener is in, from its place: { use, at (the room's middle), upper, same (an id for the building) } or null in the open.
 * Uses: a shop's trade (teahouse, pharmacy, grain, cloth, pawn, wine, lantern, shoes), hall (the three great halls), gate (the gate halls on their
 * decks), duty and wait (the court's rooms), store (the pavilions' storerooms), temple (the Hall of Prayer), house (a courtyard house's rooms).
 */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (s.use !== 'house' && inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > 2.8 && s.use === 'teahouse', same: s.id };
  for (const [id, h] of Object.entries(HALLS)) if (id !== 'taihemen' && inRect(h.rect, x, z) && y > h.y - 0.6) return { use: 'hall', at: [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2], upper: false, same: 'hall:' + id };
  for (const [i, r] of GATE_HALLS.entries()) if (inRect(r, x, z) && y > r[4]) return { use: 'gate', at: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], upper: false, same: 'gate:' + i };
  for (const r of COURT_ROOMS) if (inRect(r.rect, x, z)) return { use: r.kind === 'duty' ? 'duty' : 'wait', at: [(r.rect[0] + r.rect[2]) / 2, (r.rect[1] + r.rect[3]) / 2], upper: false, same: 'cr:' + r.rect[0] };
  for (const r of PAVILION_ROOMS) if (inRect(r.rect, x, z)) return { use: 'store', at: [(r.rect[0] + r.rect[2]) / 2, (r.rect[1] + r.rect[3]) / 2], upper: false, same: 'pv:' + r.rect[0] };
  if (Math.hypot(x - TEMPLE.c[0], z - TEMPLE.c[1]) < 14.4 && y > 2.0) return { use: 'temple', at: TEMPLE.c, upper: false, same: 'temple' };
  for (const s of sites()) if (s.use === 'house' && inRect(s.rect, x, z)) return { use: 'house', at: s.at, upper: false, same: s.id };
  return null;
}

/** What each kind of room sounds like inside (the engine reads it): `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the tiles is from inside, `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through. */
export const ROOMS = {
  teahouse: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 6], ['teaBlock', 60]] },
  pharmacy: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 40]] },
  grain: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['sack', 30]] },
  cloth: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 26]] },
  pawn: { tone: [240, 0.2], roof: 0.9, hush: 0.6, work: [['coin', 34]] },
  wine: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['jarLid', 40]] },
  lantern: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 36]] },
  shoes: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['qingAwl', 22]] },
  hall: { tone: [150, 0.22], roof: 0.7, hush: 0.5, work: [] },                       // the great halls: high, empty, the air in them
  gate: { tone: [200, 0.2], roof: 0.8, hush: 0.6, work: [] },
  duty: { tone: [300, 0.25], roof: 1.0, hush: 0.7, work: [['paper', 40], ['teaClink', 70]] },
  wait: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['teaClink', 50]] },
  store: { tone: [240, 0.15], roof: 1.0, hush: 0.6, work: [['drawer', 70]] },
  temple: { tone: [130, 0.3], roof: 0.6, hush: 0.45, work: [] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The tea house's upper room: close under the tiles (the rain loud), the talk of the tables below. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.7, work: [['teaClink', 20], ['paper', 30]] };

// ── the emitters in the open (the engine's placed sounds) ─────────────────────
/**
 * Fixed emitters: [voice, at, r50 (m: the distance at which it is half as loud), [gap min, max] s, hours [from, to]], with `dry` (not in rain) and
 * `lv`. For the moving ones (a string of camels, a pedlar) `at` is where they may be met; the voice chooses its own track (voices-qing.js).
 */
export const EMITTERS = [
  // the strings of camels bringing coal from the western hills, bells from 4 am, back in the afternoon [China Daily, 2025]
  { voice: 'camelString', at: [0, 330], r50: 80, gap: [80, 200], hours: [4, 17.5], dry: true },
  // the pedlars of the lanes: at the avenue's mouth, in the lanes east and west of the palace, on the ring street
  { voice: 'bjPeddler', at: [0, 262], r50: 55, gap: [30, 75], hours: [6, 23.5], dry: true },
  { voice: 'bjPeddler', at: [-150, 125], r50: 50, gap: [40, 90], hours: [6, 23.5], dry: true },
  { voice: 'bjPeddler', at: [160, 150], r50: 50, gap: [40, 90], hours: [6, 23.5], dry: true },
  { voice: 'bjPeddler', at: [-40, 430], r50: 50, gap: [50, 110], hours: [6, 23.5], dry: true },
  // the barber's fork, in the lanes by day
  { voice: 'huantou', at: [-60, 232], r50: 22, gap: [70, 150], hours: [8, 17], dry: true },
  { voice: 'huantou', at: [110, 160], r50: 22, gap: [80, 160], hours: [8, 17], dry: true },
  // the pigeons with their whistles, over the roofs of the lanes, by day
  { voice: 'pigeonWhistle', at: [-70, 262], r50: 45, gap: [30, 70], hours: [6.5, 17.5], dry: true },
  { voice: 'pigeonWhistle', at: [90, 125], r50: 45, gap: [35, 80], hours: [6.5, 17.5], dry: true },
  { voice: 'pigeonWhistle', at: [-130, 340], r50: 45, gap: [40, 90], hours: [6.5, 17.5], dry: true },
  { voice: 'pigeonWhistle', at: [160, 330], r50: 45, gap: [40, 90], hours: [6.5, 17.5], dry: true },
  { voice: 'pigeonWhistle', at: [-200, 130], r50: 45, gap: [45, 100], hours: [6.5, 17.5], dry: true },
];
