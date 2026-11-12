// Shang Yinxu, Anyang, c. 1200 BC — the layout (docs/settlements/shang-yinxu.md §2): the Huan river bending round the
// palace-and-ancestral zone, its moat west and south with two causeways, the ancestral hall at the north end of the court
// on the axis x = 20 with flanking halls, the sacrificial pits, the gate; Fu Hao's tomb to the north-west, the oracle-bone
// archive to the east, the bronze foundry south of the moat; lineage compounds in cells round them, fields beyond. Pure data.
// Coordinates: metres, +x east, +z south, y up.

export const RADIUS = 330;
export const AXIS = 20;

// ── the river ──
export const RIVER = { pts: [[-345, -128], [-200, -148], [-60, -160], [60, -150], [140, -120], [185, -60], [198, 40], [190, 150], [200, 345]], half: 14, bed: -2.6, water: -0.9 };
function segDist(px, pz, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - a[0] - t * dx, pz - a[1] - t * dz);
}
export function riverDist(x, z) {
  let d = 1e9;
  for (let i = 0; i < RIVER.pts.length - 1; i++) d = Math.min(d, segDist(x, z, RIVER.pts[i], RIVER.pts[i + 1]));
  return d;
}
export const inRiver = (x, z, m = 0) => riverDist(x, z) < RIVER.half + m;
/** The river's z at x (the western reach, x −345…140). */
export function riverZ(x) {
  for (let i = 0; i < 4; i++) { const a = RIVER.pts[i], b = RIVER.pts[i + 1]; if (x >= a[0] && x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
  return -150;
}
/** The river's x at z (the eastern reach, z −60…345). */
export function riverX(z) {
  for (let i = 5; i < RIVER.pts.length - 1; i++) { const a = RIVER.pts[i], b = RIVER.pts[i + 1]; if (z >= a[1] && z <= b[1]) return a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]); }
  return 195;
}

// ── the moat: a dry ditch on the west and south edge of the palace zone ──
export const MOAT = { x: -112, z: 72, w: 12, depth: 4.5, gates: { west: [-45, -31], south: [13, 27] } };
const MOAT_N = -152, MOAT_E = 196;
/** Signed distance to the moat's middle line (0 on it), infinite where a causeway crosses it. */
export function moatDist(x, z) {
  let d = 1e9;
  if (z > MOAT_N && z < MOAT.z + MOAT.w / 2 && !(z > MOAT.gates.west[0] && z < MOAT.gates.west[1])) d = Math.min(d, Math.abs(x - MOAT.x));
  if (x > MOAT.x - MOAT.w / 2 && x < MOAT_E && !(x > MOAT.gates.south[0] && x < MOAT.gates.south[1])) d = Math.min(d, Math.abs(z - MOAT.z));
  return d;
}
export const inMoat = (x, z, m = 0) => moatDist(x, z) < MOAT.w / 2 + m;

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  const dr = riverDist(x, z);
  if (dr < RIVER.half + 3) h = RIVER.bed * smooth(RIVER.half + 3, RIVER.half - 5, dr);
  const dm = moatDist(x, z);
  if (dm < MOAT.w / 2 + 3) h = Math.min(h, -MOAT.depth * smooth(MOAT.w / 2 + 2.5, MOAT.w / 2 - 1.5, dm));
  return h * (1 - smooth(RADIUS - 30, RADIUS, r));
}

// ── the landmark: the ancestral hall of the kings, the flanking halls, the court, the gate ──
export const HALL = { plat: [-3, -100, 43, -76], h: 1.5, body: [2, -96, 38, -82], bays: 9, deep: 3, eave: 3.6, rise: 4.6 };
export const FLANKS = [
  { plat: [-24, -66, -6, -28], rot: 1, h: 1.0, name: 'jia' },
  { plat: [46, -66, 64, -28], rot: 1, h: 1.0, name: 'bing' },
];
export const GATE = { plat: [4, 46, 36, 56], h: 1.2, axis: AXIS };
export const COURT = [-8, -76, 48, 46];
export const PITS = { x0: 2, x1: 38, z0: -58, z1: -40 };
export const TOMB = { plat: [-72, -118, -58, -104], h: 0.6, hall: [-69, -115, -61, -107], pits: [-52, -120, -30, -100] };
export const ARCHIVE = { rect: [96, -92, 124, -70], shed: [96, -66, 124, -50], h: 0.5 };
const ZONE = [-118, -150, 180, 76];
export const FOUNDRY = [-142, 92, -32, 176];
/** The crucible furnaces of the foundry's furnace shed (smoke and the glow come from here). */
export const FURNACES = [-106, -100, -94, -88].map((x) => [x, 107]);

const RESERVED = [
  [-30, -104, 70, 56],                // the court, halls and gate
  [92, -100, 130, -46],               // the archive and its shed
  [-80, -126, -26, -96],              // Fu Hao's tomb and the chariot pits
  [FOUNDRY[0] - 6, FOUNDRY[1] - 6, FOUNDRY[2] + 6, FOUNDRY[3] + 6],
];
export const reserved = (x, z, m = 0) => RESERVED.some((r) => inRect(r, x, z, m));

// ── the lineage compounds: cells of 34 × 32 m round the zone, lanes 5 m wide between, the lots filling the cells to the lane's edge ──
export const CELL = [34, 32], ORG = [-323, -168], LANE = 5, ZONE_R = 292;
const lotOverlapsFixed = (rect) => RESERVED.some((q) => rect[0] < q[2] + 2 && rect[2] > q[0] - 2 && rect[1] < q[3] + 2 && rect[3] > q[1] - 2);
const bad = (x, z, m) => inRiver(x, z, m) || inMoat(x, z, m) || Math.hypot(x, z) > ZONE_R;
let LOTS = null;
/**
 * The lots: { rect, front ('n' | 's'), kind ('court' | 'pits' | 'row' | 'workshop'), trade, seed, open }.
 * `court`: a main house on a rammed foundation with pit houses; `pits`: pit houses round a hearth yard;
 * `row`: wattle houses; `workshop`: bone, jade, pottery or the diviners' craft.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1200), trades = ['bone', 'jade', 'pottery', 'bone', 'oracle', 'pottery', 'jade'];
  let ti = 0, furnished = 0;
  for (let j = 0; ; j++) {
    const zc = ORG[1] + j * CELL[1] + CELL[1] / 2;
    if (zc > ZONE_R) break;
    for (let i = 0; ; i++) {
      const xc = ORG[0] + i * CELL[0] + CELL[0] / 2;
      if (xc > ZONE_R) break;
      const w = 27.4 + Math.floor(rand() * 3) * 0.4, d = 25.4 + Math.floor(rand() * 3) * 0.4;
      const cx = xc + (rand() - 0.5) * 0.5, cz = zc + (rand() - 0.5) * 0.5;
      const rect = [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2];
      const seed = Math.floor(rand() * 1e6), r = rand(), front = rand() < 0.5 ? 'n' : 's';
      const near = Math.hypot(cx - AXIS, cz + 30);
      if (lotOverlapsFixed(rect) || [[rect[0], rect[1]], [rect[2], rect[1]], [rect[0], rect[3]], [rect[2], rect[3]]].some(([a, b]) => bad(a, b, 3))) continue;
      if (near > 235 && r < 0.12) continue;                                           // fields between the clusters
      let kind = near < 140 ? (r < 0.5 ? 'court' : r < 0.78 ? 'pits' : 'row') : (r < 0.25 ? 'court' : r < 0.55 ? 'pits' : 'row');
      let trade;
      if (r > 0.9 && near < 220) { kind = 'workshop'; trade = trades[ti++ % trades.length]; }
      const lot = { rect, front, kind, trade, seed, open: false, lod: near > 150 ? 1 : 0, near };
      if (kind === 'workshop' || kind === 'court' || (near < 235 && furnished++ % 2 === 0)) lot.open = true;
      LOTS.push(lot);
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The lanes (rectangles between the cells), cut where a river, the moat or a fixed place is. */
export function streets() {
  const out = [], seg = (a) => {
    const n = Math.max(1, Math.round(Math.max(a[2] - a[0], a[3] - a[1]) / 12));
    const horiz = a[2] - a[0] > a[3] - a[1];
    for (let k = 0; k < n; k++) {
      const r = horiz ? [a[0] + (a[2] - a[0]) * k / n, a[1], a[0] + (a[2] - a[0]) * (k + 1) / n, a[3]] : [a[0], a[1] + (a[3] - a[1]) * k / n, a[2], a[1] + (a[3] - a[1]) * (k + 1) / n];
      const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
      if (bad(cx, cz, 4) || reserved(cx, cz, 1) || inLot(cx, cz, 0.2) || !(inRect(ZONE, cx, cz) || lots().some((l) => inRect(l.rect, cx, cz, 9)))) continue;
      out.push(r);
    }
  };
  for (let j = 0; j <= 17; j++) { const z = ORG[1] + j * CELL[1]; seg([-ZONE_R, z - LANE / 2, ZONE_R, z + LANE / 2]); }
  for (let i = 0; i <= 18; i++) { const x = ORG[0] + i * CELL[0]; seg([x - LANE / 2, -ZONE_R, x + LANE / 2, ZONE_R]); }
  const M = [];
  for (const r of out) {
    const q = M.find((m) => (Math.abs(m[2] - r[0]) < 0.01 && m[1] === r[1] && m[3] === r[3]) || (Math.abs(m[3] - r[1]) < 0.01 && m[0] === r[0] && m[2] === r[2]));
    if (!q) M.push(r.slice()); else { q[0] = Math.min(q[0], r[0]); q[1] = Math.min(q[1], r[1]); q[2] = Math.max(q[2], r[2]); q[3] = Math.max(q[3], r[3]); }
  }
  return M;
}

/** The bridges over the Huan: a plank bridge on piles, at x −216 (the western reach) and z 0 (the eastern). */
export const BRIDGES = [
  { a: [-216, riverZ(-216) - 20], b: [-216, riverZ(-216) + 20] },
  { a: [riverX(0) - 20, 0], b: [riverX(0) + 20, 0] },
];
