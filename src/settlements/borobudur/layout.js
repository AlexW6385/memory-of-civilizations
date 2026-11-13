// Sailendra Java (c. 825) — the layout (docs/settlements/borobudur.md §2): Borobudur at the middle,
// square to the compass; a monastery compound to the north-west; hamlets of houses on posts in
// groves round about, fields between; the approach from the east. Pure data. +x east, +z south.

export const RADIUS = 380;
export const MONUMENT = { c: [0, 0], base: { a: 56.5, p: 5, h: 4, foot: 3 } };
export const SQUARES = [{ a: 49.5, y: 7.5 }, { a: 45.5, y: 10.5 }, { a: 41.5, y: 13.3 }, { a: 37.5, y: 15.9 }, { a: 33.5, y: 18.3 }];
export const CIRCLES = [{ r: 24, y: 19.8, n: 32 }, { r: 18, y: 21.3, n: 24 }, { r: 12.5, y: 22.8, n: 16 }];
export const MONASTERY = [-210, -170, -130, -105];
/** The monks' houses round the yard: [x, z, front, furnished]. */
export const CELLS = [[-204, -164, 's', 0], [-196, -164, 's', 1], [-160, -164, 's', 0], [-150, -164, 's', 1], [-142, -164, 's', 0], [-180, -114, 'n', 0], [-172, -114, 'n', 1], [-164, -114, 'n', 0], [-150, -116, 'n', 1], [-142, -116, 'n', 0], [-204, -150, 'e', 1], [-204, -140, 'e', 0], [-204, -132, 'e', 0], [-136, -154, 'w', 0], [-136, -122, 'w', 1]];
/** A monk's house's rectangle (its long side along the wall it stands by) and its furnished room. */
export const cellRect = ([x, z, f]) => (f === 'e' || f === 'w' ? [x - 2.4, z - 3, x + 2.4, z + 3] : [x - 3, z - 2.4, x + 3, z + 2.4]);
export const cellRoom = ([x, z, f]) => (f === 's' ? [x - 2.7, z - 2.1, x + 2.7, z + 1.1] : f === 'n' ? [x - 2.7, z - 1.1, x + 2.7, z + 2.1] : f === 'e' ? [x - 2.1, z - 2.7, x + 1.1, z + 2.7] : [x - 1.1, z - 2.7, x + 2.1, z + 2.7]);
export const HAMLETS = [[230, -60, 45], [150, 210, 40], [-120, 220, 45], [-260, 60, 40], [60, -250, 40], [270, 140, 30]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The pilgrims' lodgings by the way: [x, z, front, W, D]. */
export const WAYHOUSES = [[122, -13.5, 's', 7, 5.4], [147, 15, 'n', 7.4, 5.6], [176, -14.5, 's', 7, 5.4], [128, 14.5, 'n', 6.4, 5], [112, -15, 's', 6.2, 5],
  // five more lodgings and a tea-house along the first stretch of the way (within 120 m of the arrival), differing in width and depth
  [92, 14.8, 'n', 6.6, 5.2], [84, -14.5, 's', 6.4, 5], [168, 14.5, 'n', 7.8, 5.8], [190, -14.8, 's', 7.2, 5.6], [196, 15, 'n', 6.8, 5.2], [212, 15, 'n', 8.2, 5.6]];
let HOUSES = null;
const FRONT_OF = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/**
 * The hamlets' buildings (docs/settlements/borobudur.md §14), 4–9 m, scattered round each hamlet's open yard and
 * facing it: { rect, seed, kind: 'house' | 'lumbung' (a granary), front ('n' | 's' | 'e' | 'w': the side with the veranda
 * and the stair), hamlet, interior (furnished and walkable) }. The first three houses of every hamlet are furnished.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(825), furnished = new Map();
  HAMLETS.forEach(([hx, hz, hr], hi) => {
    let n = 0;
    for (let k = 0; k < 150 && n < 36; k++) {
      const a = rand() * Math.PI * 2, d = 10 + rand() * hr, x = hx + Math.cos(a) * d, z = hz + Math.sin(a) * d;
      const granary = rand() < 0.2, W = granary ? 2.6 + rand() * 0.6 : 5 + rand() * 3.2, D = granary ? W : 4.6 + rand() * 2;
      const front = Math.abs(hx - x) > Math.abs(hz - z) ? (hx > x ? 'e' : 'w') : (hz > z ? 's' : 'n');
      const ew = front === 'e' || front === 'w', hx2 = (ew ? D : W) / 2, hz2 = (ew ? W : D) / 2;
      const r = [x - hx2, z - hz2, x + hx2, z + hz2];
      if (Math.hypot(x, z) > RADIUS - 30 || Math.hypot(x - hx, z - hz) < 13 || HOUSES.some((h) => inRect(h.rect, x, z, hx2 + hz2 + 1.7))) continue;
      // the first three houses of each hamlet are furnished and walkable, each in its own way (variant 0 hearth and bed, 1 loom and rice store, 2 household shrine)
      const nf = furnished.get(hi) ?? 0, interior = !granary && nf < 3;
      if (interior) furnished.set(hi, nf + 1);
      HOUSES.push({ rect: r, seed: Math.floor(rand() * 1e6), kind: granary ? 'lumbung' : 'house', front, W, D, hamlet: hi, interior, variant: interior ? nf : -1 });
      n++;
    }
  });
  // the lodgings of the pilgrims' way (§17): furnished houses on posts set back from the way, fronts to it, hamlet -1
  for (const [i, [x, z, front, W, D]] of WAYHOUSES.entries()) {
    const ew = front === 'e' || front === 'w', hx2 = (ew ? D : W) / 2, hz2 = (ew ? W : D) / 2;
    HOUSES.push({ rect: [x - hx2, z - hz2, x + hx2, z + hz2], seed: 7000 + i * 131, kind: 'house', front, W, D, hamlet: -1, interior: true, variant: i % 3 });
  }
  return HOUSES;
}
/** The floor height of a house (the style draws it from the seed's first number). */
export const floorOf = (seed) => 1.25 + rng(seed || 1)() * 0.35;
export const frontVec = (f) => FRONT_OF[f];
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const nearHamlet = (x, z) => HAMLETS.some(([hx, hz, hr]) => Math.hypot(x - hx, z - hz) < hr + 22);

/** The heart of each hamlet (§16): a village hall (balai) in the first three, a shrine under its tree in the rest; the well beside it. All within 13 m of the yard's middle, which no house enters. */
export const coreOf = (hi) => (hi < 3 ? 'balai' : 'shrine');
export const wellAt = (hi) => [HAMLETS[hi][0] + 7.5, HAMLETS[hi][1] + 5.5];

/**
 * The pilgrims' way from the east (§16): shelters and offering stalls along both sides from the precinct's gate (x 98) out
 * to the fields, thick near the monument and thinning outward. { at: [x, z], side (+1 south, −1 north), kind: 'warung'
 * (food and drink), 'pasar' (offerings: flowers, lamps, incense), 'rest' (an open hall for the weary), 'jars' (water) }.
 */
export const WAY = { x0: 72, x1: 262, gate: 98 };
/** Where the visitor arrives (src/planet/arrivals.js): nothing stands within a few metres of the view down the way from here. */
export const ARRIVAL_X = 110;
/** True for a point on the way's floor close to the arrival and ahead of it, where no figure or object may stand. */
export const nearArrival = (x, z, m = 0) => Math.abs(z) < 4.2 + m && x > ARRIVAL_X - 10 - m && x < ARRIVAL_X + 4 + m;
const RESTS = [[134, -1], [158, 1], [205, -1]];
let STALLS = null;
export function wayStalls() {
  if (STALLS) return STALLS;
  STALLS = [];
  const rand = rng(1225);
  let x = WAY.x0 + 6, i = 0;
  while (x < WAY.x1) {
    for (const side of [-1, 1]) {
      if (rand() < 0.12 + (x - WAY.x0) / 420 || Math.abs(x - WAY.gate) < 7 || Math.abs(x - ARRIVAL_X) < 9 || RESTS.some(([rx]) => Math.abs(x - rx) < 8.5)) continue;
      const kind = x < WAY.gate + 26 ? 'pasar' : rand() < 0.5 ? 'warung' : rand() < 0.5 ? 'pasar' : 'warung';
      STALLS.push({ at: [x + (rand() - 0.5) * 1.6, side * (4.2 + rand() * 0.8)], side, kind, seed: Math.floor(rand() * 1e6), w: 3.6 + rand() * 1.4 });
    }
    x += 7.4 + rand() * 3 + (x - WAY.x0) / 40; i++;
  }
  // a hall for resting pilgrims on each side at the way's middle, a jar-stand by every other one
  for (const [rx, side] of RESTS) STALLS.push({ at: [rx, side * 8.6], side, kind: 'rest', seed: rx, w: 7.2 });
  return STALLS;
}
export const nearWay = (x, z, m = 0) => x > WAY.x0 - 6 - m && x < WAY.x1 + 6 + m && Math.abs(z) < 12 + m;

/** The paddy huts and scarecrows (§16): spots on the fields, clear of the hamlets, the monastery and the way. */
let FIELDS = null;
export function fieldSpots() {
  if (FIELDS) return FIELDS;
  FIELDS = { huts: [], scarecrows: [], plough: [] };
  const rand = rng(31337);
  const free = (x, z, m = 20) => {
    const r = Math.hypot(x, z);
    if (r < 118 || r > RADIUS - 40 || HAMLETS.some(([hx, hz, hr]) => Math.hypot(x - hx, z - hz) < hr + m + 14) || inRect(MONASTERY, x, z, m + 14) || nearWay(x, z, 6)) return false;
    return true;
  };
  for (let k = 0; k < 400 && FIELDS.huts.length < 14; k++) {
    const a = rand() * 6.283, r = 125 + rand() * (RADIUS - 190), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!free(x, z) || FIELDS.huts.some((q) => Math.hypot(q.at[0] - x, q.at[1] - z) < 55)) continue;
    FIELDS.huts.push({ at: [x, z], rot: Math.floor(rand() * 4) * Math.PI / 2, seed: Math.floor(rand() * 1e6) });
  }
  for (let k = 0; k < 600 && FIELDS.scarecrows.length < 36; k++) {
    const a = rand() * 6.283, r = 118 + rand() * (RADIUS - 170), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!free(x, z, 8) || FIELDS.scarecrows.some((q) => Math.hypot(q.at[0] - x, q.at[1] - z) < 16)) continue;
    FIELDS.scarecrows.push({ at: [x, z], rot: rand() * 6.283, seed: Math.floor(rand() * 1e6) });
  }
  for (let k = 0; k < 400 && FIELDS.plough.length < 9; k++) {
    const a = rand() * 6.283, r = 125 + rand() * (RADIUS - 200), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (!free(x, z, 10) || FIELDS.plough.some((q) => Math.hypot(q.at[0] - x, q.at[1] - z) < 40)) continue;
    FIELDS.plough.push({ at: [x, z], rot: rand() * 6.283, seed: Math.floor(rand() * 1e6) });
  }
  return FIELDS;
}
