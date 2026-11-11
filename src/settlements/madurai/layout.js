// Madurai about 1650 — the layout (docs/settlements/madurai.md §2): the Meenakshi temple at the
// centre, its outer wall 254 × 237 m with a tall gopuram in the middle of each side; the
// Sundareswarar shrine's enclosure in the north-centre, Meenakshi's to its south-west, the Golden
// Lotus tank south of hers, the Thousand-Pillar Hall in the north-east; the city in concentric
// squares of streets round the temple (the Chitrai, Avani Moola and Masi streets) with houses in
// the blocks between. Pure data. +x east, +z south.

export const RADIUS = 400;
export const WALL = [-127, -118, 127, 118];
export const SUNDARA = [-20, -86, 78, 30];
export const MEENAKSHI = [-102, -66, -40, 4];
export const TANK = [-96, 32, -46, 69];
export const HALL = [86, -112, 121, -52];
export const STREETS = [{ off: 12, w: 14, name: 'chithirai' }, { off: 70, w: 10, name: 'avani moola' }, { off: 113, w: 4, name: 'back lane' }, { off: 150, w: 14, name: 'masi' }];   // outward from the wall
export const GATES = { e: [127, -8], s: [-20, 118], w: [-127, -24], n: [14, -118] };
/** Tirumala Nayaka's Pudhu Mandapam (1628–1635), 330 × 105 ft, across the street east of the east gopuram, the axial street through its middle. */
export const PUDHU = [156, -24, 256.6, 8];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** How far outside the temple wall's rectangle (0 inside). */
export const outside = (x, z) => Math.max(WALL[0] - x, x - WALL[2], WALL[1] - z, z - WALL[3], 0);
/** On one of the ring streets or the four axial streets out from the gates. */
export function onStreet(x, z, m = 0) {
  const o = outside(x, z);
  if (STREETS.some((s) => o > s.off - m && o < s.off + s.w + m)) return true;
  if (Math.abs(z - GATES.e[1]) < 6 + m && x > WALL[2]) return true;
  if (Math.abs(z - GATES.w[1]) < 6 + m && x < WALL[0]) return true;
  if (Math.abs(x - GATES.s[0]) < 6 + m && z > WALL[3]) return true;
  if (Math.abs(x - GATES.n[0]) < 6 + m && z < WALL[1]) return true;
  return false;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Half-width of an axial street and the depth of the house rows facing it. */
export const AXIAL_HALF = 6, AXIAL_ROW = 16;
/** The rows of houses between the ring streets: [near o, far o, which way the fronts look ('in' toward the wall, 'out' away), the street they face, the kind]. */
const ROWS = [
  [26.6, 47, 'in', 'chithirai', 'shopsA'], [49, 69.4, 'out', 'avani', 'houses'],
  [80.6, 96.6, 'in', 'avani', 'mixed'], [98.2, 112.4, 'out', 'lane', 'agra'],
  [117.6, 133.4, 'in', 'lane', 'agra'], [134.8, 149.4, 'out', 'masi', 'mixed'],
  [164.6, 180, 'in', 'masi', 'houses'],
];
/** The trades of the shops by street: [trade, weight]. */
const TRADES = {
  chithirai: [['flowers', 5], ['pooja', 3], ['brass', 2], ['cloth', 2], ['sweets', 1]],
  avani: [['cloth', 3], ['brass', 3], ['grain', 2], ['flowers', 1], ['pooja', 1]],
  masi: [['cloth', 3], ['grain', 3], ['brass', 2], ['sweets', 1], ['coconut', 2]],
  lane: [['grain', 2], ['coconut', 1]],
  axial: [['cloth', 3], ['flowers', 2], ['grain', 2], ['coconut', 2], ['brass', 2], ['pooja', 2], ['sweets', 1]],
};
const pickW = (rand, list) => { let t = list.reduce((a, [, w]) => a + w, 0) * rand(); for (const [k, w] of list) { if ((t -= w) < 0) return k; } return list[0][0]; };
const WASH = ['plaster_white', 'stucco_cream', 'limewash_white', 'limewash_yellow', 'stucco_saffron', 'stucco_sky', 'stucco_cream', 'limewash_white'];
let LOTS = null;
/**
 * House lots: rows with continuous fronts on both sides of every ring street, back to back between them,
 * and along the four axial streets from the gates; each { rect, facing ('n' front at z0, 's' at z1, 'w' at x0, 'e' at x1),
 * seed, kind ('house' | 'agra' | 'shop' | 'court' | 'yard' | 'hut'), trade, wash, street, row }.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1650), [wx0, wz0, wx1, wz1] = WALL;
  const axials = [['e', GATES.e[1]], ['w', GATES.w[1]], ['s', GATES.s[0]], ['n', GATES.n[0]]];
  const AX = AXIAL_HALF + AXIAL_ROW + 1.4;
  const bad = (r, m) => inRect(PUDHU, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 8) || Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) > RADIUS - 26
    || [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].some(([a, b]) => onStreet(a, b, m));
  const add = (rect, facing, row, street, kind0, ix) => {
    const r = rect;
    if (bad(r, 0.4)) return;
    const w = Math.abs(facing === 'n' || facing === 's' ? r[2] - r[0] : r[3] - r[1]);
    let kind = kind0, trade = null;
    const q = rand();
    if (kind0 === 'shopsA') kind = q < 0.78 ? 'shop' : 'house';
    else if (kind0 === 'mixed') kind = q < 0.34 ? 'shop' : 'house';
    else if (kind0 === 'houses') kind = q < 0.07 ? 'shop' : q < 0.17 ? 'yard' : 'house';
    else if (kind0 === 'axial') kind = q < 0.62 ? 'shop' : 'house';
    else if (kind0 === 'agra') kind = q < 0.05 ? 'yard' : 'agra';
    if (kind === 'house' && w > 7.8 && rand() < 0.25 && street !== 'lane') kind = 'house';
    if (kind === 'shop') trade = pickW(rand, TRADES[street === 'axial' ? 'axial' : street] ?? TRADES.axial);
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), facing, kind, trade, wash: WASH[Math.floor(rand() * WASH.length)], street, row, ix });
  };
  // ring rows
  for (const [ri, [a, b, front, street, kind]] of ROWS.entries()) {
    for (const side of ['n', 's', 'w', 'e']) {
      const nsSide = side === 'n' || side === 's';
      const s0 = nsSide ? wx0 - b : wz0 - a + 0.7, s1 = nsSide ? wx1 + b : wz1 + a - 0.7;
      const facing = { n: front === 'in' ? 's' : 'n', s: front === 'in' ? 'n' : 's', w: front === 'in' ? 'e' : 'w', e: front === 'in' ? 'w' : 'e' }[side];
      // the stretches between the axial streets' rows
      const g = { n: GATES.n[0], s: GATES.s[0], w: GATES.w[1], e: GATES.e[1] }[side];
      const cuts = [[s0, g - AX], [g + AX, s1]];
      let ix = 0;
      for (const [c0, c1] of cuts) {
        let s = c0 + (side === 'n' || side === 's' ? 0 : 0);
        while (s < c1 - 4) {
          let w = (kind === 'agra' ? 5 + rand() * 0.8 : 5.4 + rand() * 4);
          if (s + w > c1 - 0.2 || c1 - (s + w) < 4) w = c1 - s;
          // the depth varies a little at the back; the front line is fixed
          const D = (b - a) - rand() * 1.2;
          const lo = front === 'in' ? a : b - D, hi = front === 'in' ? a + D : b;
          const r = side === 'n' ? [s, wz0 - hi, s + w, wz0 - lo] : side === 's' ? [s, wz1 + lo, s + w, wz1 + hi] : side === 'w' ? [wx0 - hi, s, wx0 - lo, s + w] : [wx1 + lo, s, wx1 + hi, s + w];
          add(r, facing, ri, street, kind, ix++);
          s += w;
        }
      }
    }
  }
  // the axial streets' rows: between the ring streets, fronts to the street
  const gaps = [[26.6, 69.4], [80.6, 112.4], [117.6, 149.4], [164.6, 190]];
  for (const [side, g] of axials) for (const sg of [-1, 1]) for (const [oa, ob] of gaps) {
    let s = oa;
    while (s < ob - 3.5) {
      let w = 5.4 + rand() * 3.4; if (s + w > ob - 0.2 || ob - (s + w) < 3.5) w = ob - s;
      const lo = AXIAL_HALF + 0.6, hi = lo + AXIAL_ROW - rand() * 1.5;
      const p0 = g + (sg < 0 ? -hi : lo), p1 = g + (sg < 0 ? -lo : hi);
      let r, facing;
      if (side === 'e') { r = [wx1 + s, p0, wx1 + s + w, p1]; facing = sg < 0 ? 's' : 'n'; }
      else if (side === 'w') { r = [wx0 - s - w, p0, wx0 - s, p1]; facing = sg < 0 ? 's' : 'n'; }
      else if (side === 's') { r = [p0, wz1 + s, p1, wz1 + s + w]; facing = sg < 0 ? 'e' : 'w'; }
      else { r = [p0, wz0 - s - w, p1, wz0 - s]; facing = sg < 0 ? 'e' : 'w'; }
      add(r, facing, 20, 'axial', 'axial', 0);
      s += w;
    }
  }
  // the outskirts: huts and yards on a loose grid beyond the last row
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 17) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 17) {
    const w = 7 + rand() * 3, d = 8 + rand() * 3, r = [x + rand() * 4, z + rand() * 4, 0, 0]; r[2] = r[0] + w; r[3] = r[1] + d;
    if (outside((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) < 192 || Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) > RADIUS - 24) continue;
    if (rand() < 0.5 || LOTS.some((l) => l.rect[0] < r[2] + 2 && r[0] < l.rect[2] + 2 && l.rect[1] < r[3] + 2 && r[1] < l.rect[3] + 2)) continue;
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), facing: ['n', 's', 'e', 'w'][Math.floor(rand() * 4)], kind: 'hut', trade: null, wash: 'mud_plaster', street: 'out', row: 30, ix: 0 });
  }
  // a few merchants' courtyard houses facing the axial street from the south gate (the way in): two neighbouring lots made one
  for (const sg of [-1, 1]) for (const oa of [26.6, 80.6]) {
    const side = LOTS.filter((l) => l.street === 'axial' && (l.facing === 'e' ? sg < 0 : l.facing === 'w' ? sg > 0 : false) && Math.abs(l.rect[0] - GATES.s[0]) < 30 && l.rect[1] > wz1);
    const l = side.find((q) => Math.abs(q.rect[1] - (wz1 + oa)) < 1e-6), n = l && side.find((q) => Math.abs(q.rect[1] - l.rect[3]) < 1e-6);
    if (!l || !n) continue;
    l.rect = sg < 0 ? [Math.max(l.rect[0], n.rect[0]), l.rect[1], l.rect[2], n.rect[3]] : [l.rect[0], l.rect[1], Math.min(l.rect[2], n.rect[2]), n.rect[3]];
    l.kind = 'court'; l.trade = null;
    LOTS.splice(LOTS.indexOf(n), 1);
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => l.kind !== 'yard' && inRect(l.rect, x, z, m));
/** A lot's frame: its width along the street W, depth D, and map(u, v) (v from the street front inwards) to the world. */
export function lotMap(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.facing, NS = f === 'n' || f === 's';
  const map = f === 'n' ? (u, v) => [x0 + u, z0 + v] : f === 's' ? (u, v) => [x0 + u, z1 - v] : f === 'w' ? (u, v) => [x0 + v, z0 + u] : (u, v) => [x1 - v, z0 + u];
  return { W: NS ? x1 - x0 : z1 - z0, D: NS ? z1 - z0 : x1 - x0, map };
}
