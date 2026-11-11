// Mexica Tenochtitlan (1519) — the layout (docs/settlements/tenochtitlan.md §2): the Sacred Precinct
// in its serpent wall with the Templo Mayor on its east side, the palace of Moctezuma to the
// south-east, the causeway to the west, canals crossing the island, calpulli houses between them,
// chinampas at the edge and the lake beyond. Pure data. +x east, +z south.

export const RADIUS = 400;
export const PRECINCT = [-150, -150, 150, 150];
export const TM = { c: [95, 0], w: 80, d: 100, h: 45, top: { w: 34, d: 46 } };
export const PALACE = [160, 100, 211, 191];   // between the two canals (it straddled them)
/** The Huey Tzompantli: about 38 × 13 m, north–south, west of the Templo Mayor's south stair. */
export const TZOMPANTLI = [40, 22, 53, 60];
/** The market (tianguis) on the west canal, south of the causeway's avenue, where canoes unload. */
export const MARKET = [-212, 22, -168, 92];
export const LEVEL = { water: -0.7, canalBed: -2.4, lakeBed: -2.6 };
export const ISLAND = 335;                              // the island's edge (chinampas from 300)
export const CAUSEWAY = { z0: -9, z1: 9 };
/** The opening cut through the causeway, spanned by a bridge of timbers that could be taken up (Cortés). */
export const GAP = [-356, -350];
export const CANALS = [[-RADIUS, 196, RADIUS, 204], [-RADIUS, -204, RADIUS, -196], [216, -RADIUS, 224, RADIUS], [-224, -RADIUS, -216, RADIUS]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inCanal = (x, z) => Math.hypot(x, z) < ISLAND && CANALS.some((c) => inRect(c, x, z));
export const inLake = (x, z) => Math.hypot(x, z) > ISLAND && !(x < 0 && z > CAUSEWAY.z0 && z < CAUSEWAY.z1 && !(x > GAP[0] && x < GAP[1]));
/** The lake's water drawn by the town (town.js): the lake, the channels between the chinampas (from r 300) and the canals' mouths beyond the precinct's water (r > ISLAND − 6), wherever the ground h is below the water. */
export const inLakeWater = (x, z, h) => h < LEVEL.water && (inLake(x, z) || Math.hypot(x, z) > 300 && !(inCanal(x, z) && Math.hypot(x, z) < ISLAND - 6));
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/** Calpulli houses round patios, 10–16 m, on blocks between streets 5 m wide, clear of the precinct, the palace, the canals and the causeway. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1519), S = 19;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    const w = 10 + rand() * 5, d = 10 + rand() * 5, r = [x + 2, z + 2, x + 2 + w, z + 2 + d], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > 300) continue;
    if (inRect(PRECINCT, cx, cz, w / 2 + 10) || inRect(PALACE, cx, cz, w / 2 + 6) || inRect(MARKET, cx, cz, w / 2 + 3) || CANALS.some((c) => inRect(c, cx, cz, w / 2 + 4))) continue;
    if (Math.abs(cz) < 12 + d / 2 && cx < -150) continue;
    if (Math.abs(cx) < 8 + w / 2 || Math.abs(cz) < 8 + d / 2) continue;           // the avenues to the gates
    if (rand() < 0.06) continue;
    HOUSES.push({ rect: r, seed: Math.floor(rand() * 1e6) });
  }
  return HOUSES;
}
let GRID = null;
export function inHouse(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of houses()) for (let i = Math.floor((h.rect[0] - 3) / 19); i <= Math.floor((h.rect[2] + 3) / 19); i++) for (let j = Math.floor((h.rect[1] - 3) / 19); j <= Math.floor((h.rect[3] + 3) / 19); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 19) + ',' + Math.floor(z / 19));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
let CH = null;
/** The farmers' houses on the chinampas: { c, door, seed }, each on the middle of its plot (plots 14 m across in x, cells of 30 m in z), clear of the causeway and the canals. */
export function chinampaHouses() {
  if (CH) return CH;
  CH = [];
  const rand = rng(2519);
  for (let i = -24; i < 24; i++) for (let j = -12; j < 12; j++) {
    const x = i * 14 + 7, z = j * 30 + 15 + (rand() - 0.5) * 12, r = Math.hypot(x, z);
    if (r < 308 || r > 324 || rand() < 0.45) continue;
    if (x < 0 && Math.abs(z) < 24) continue;
    if (CANALS.some((c) => inRect(c, x, z, 10))) continue;
    CH.push({ c: [x, z], door: rand() < 0.5 ? 'e' : 'w', seed: Math.floor(rand() * 1e6) });
  }
  return CH;
}
/** Is (x, z) on a chinampa house's site (the house, its granary and plants), with margin m? */
export const inChinampaHouse = (x, z, m = 0) => Math.hypot(x, z) > 300 && chinampaHouses().some((h) => Math.abs(x - h.c[0]) < 5.2 + m && Math.abs(z - h.c[1]) < 4.2 + m);

// ---- the ways on foot (movers.js): lanes between the compounds, the avenues, the bridges' landings -------------
const LANE_W = 3.2, REACH = 296;
/** Subtract the intervals `cuts` from [a, b]; pieces of at least `min` metres. */
function cut1(a, b, cuts, min = 6) {
  let segs = [[a, b]];
  for (const [c0, c1] of cuts) segs = segs.flatMap(([s0, s1]) => (c1 <= s0 || c0 >= s1 ? [[s0, s1]] : [[s0, Math.min(s1, c0)], [Math.max(s0, c1), s1]])).filter(([s0, s1]) => s1 - s0 >= min);
  return segs;
}
/**
 * The lanes between the compounds' blocks (houses(): a 4 m strip at every 19 m, x and z = 19 k − 1, between the
 * houses' rects), as rectangles [x0, z0, x1, z1]: cut at the canals (the bridges are the avenues'), the precinct, the
 * palace and the market, clear of the avenues, within r 296.
 */
export function lanes() {
  const out = [];
  for (const vertical of [true, false]) for (let k = -21; k <= 21; k++) {
    const t = -400 + 19 * (k + 21) + 19;                                         // the strip between the cells k and k + 1
    if (Math.abs(t) < 12 || Math.abs(t) > REACH - 6) continue;
    if (vertical && (Math.abs(t) > 212 && Math.abs(t) < 228)) continue;           // on the x canals
    if (!vertical && (Math.abs(t) > 192 && Math.abs(t) < 208)) continue;          // on the z canals
    const ext = Math.sqrt(REACH * REACH - t * t), cuts = [];
    const canalCuts = vertical ? [[-206, -194], [194, 206]] : [[-226, -214], [214, 226]];
    cuts.push(...canalCuts);
    const pr = PRECINCT.map((v, i) => v + (i < 2 ? -8 : 8)), pa = PALACE.map((v, i) => v + (i < 2 ? -2 : 2)), mk = MARKET;
    const ia = vertical ? 1 : 0, ib = ia + 2;                                       // the rect's interval along the lane
    for (const r of [pr, pa, mk]) { const across = vertical ? [r[0], r[2]] : [r[1], r[3]]; if (t > across[0] && t < across[1]) cuts.push([r[ia], r[ib]]); }
    cuts.sort((a, b) => a[0] - b[0]);
    for (const [s0, s1] of cut1(-ext, ext, cuts)) out.push(vertical ? [t - LANE_W / 2, s0, t + LANE_W / 2, s1] : [s0, t - LANE_W / 2, s1, t + LANE_W / 2]);
  }
  return out;
}
/** The houses' grid really leaves these strips free (a test): is (x, z) on a lane's line within its width? */
export const onLaneStrip = (x, z) => [x, z].some((v) => { const m = (((v + 1) % 19) + 19) % 19; return m < 1.6 || m > 17.4; });
