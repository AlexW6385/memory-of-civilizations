// Delphi about 400 BC (docs/settlements/delphi.md §2): the sanctuary of Apollo on the south-facing slope of Mount Parnassus,
// compressed to the disc. The hill rises to the north (-z); the Sacred Way zigzags up from the gate at the south-east corner to
// the temple terrace; the theatre and the stadium lie above; the Phaedriades close the north; the Castalian spring lies in the
// ravine to the east; the village of the Delphians on terraces west and east of the sanctuary. Pure data. +x east, +z south.

export const RADIUS = 190;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

// the hill's profile along z: [z, y]
const CTRL = [[150, -4], [112, 1], [100, 3], [76, 7.5], [52, 11], [36, 12.5], [30, 13.5], [26, 14.5], [-22, 20.5], [-50, 33], [-80, 43], [-110, 52], [-125, 58], [-150, 86], [-190, 120]];
export function slopeY(z) {
  if (z >= CTRL[0][0]) return CTRL[0][1];
  for (let i = 0; i + 1 < CTRL.length; i++) {
    const [z0, y0] = CTRL[i], [z1, y1] = CTRL[i + 1];
    if (z <= z0 && z >= z1) { const t = (z0 - z) / (z0 - z1), s = t * t * (3 - 2 * t); return y0 + (y1 - y0) * (0.5 * t + 0.5 * s); }
  }
  return CTRL[CTRL.length - 1][1];
}

// ── the levelled places: [x0, z0, x1, z1], y
export const TT_Y = 20;
export const TT = [-36, -22, 92, 26];                                 // the temple's terrace
export const FC = [90, 106, 152, 132];                                // the forecourt outside the gate
export const FC_Y = 1.4;
export const STADIUM = [-115, -125, -5, -99], STADIUM_Y = 52.4;
export const THEATRE = { c: [-34, -52], y: 34.5, r: 3.5, d0: 6, rows: 24, tread: 0.8, rise: 0.33, facets: [-30, 0, 30], end: 62 };
const RAD = Math.PI / 180;
export function theatreD(x, z, T = THEATRE) { const px = x - T.c[0], pz = z - T.c[1]; let D = -Infinity; for (const f of T.facets) D = Math.max(D, px * Math.sin(f * RAD) - pz * Math.cos(f * RAD)); return D; }
export function theatreOut(x, z, T = THEATRE) {
  const px = x - T.c[0], pz = z - T.c[1], al = Math.atan2(px, -pz), e = T.end * RAD;
  if (Math.abs(al) <= e) return 0;
  const s = Math.sign(al) || 1, dx = Math.sin(s * e), dz = -Math.cos(s * e), t = px * dx + pz * dz;
  return t <= 0 ? Math.hypot(px, pz) : Math.abs(px * dz - pz * dx);
}
const T_BACK = THEATRE.d0 + THEATRE.rows * THEATRE.tread + 2.6;
const T_FRONT = -9;
function theatreRow(D) { const T = THEATRE; return D < T.d0 ? T.y - 0.3 : T.y + (Math.min(D, T.d0 + T.rows * T.tread) - T.d0) / T.tread * T.rise - 0.6; }

// ── the Sacred Way: from the forecourt through the gate, up four legs along the contours, to the terrace; and on from the
// terrace's west end past the theatre to the stadium
export const WAY = [[98, 134], [96, 114], [96, 100], [44, 100], [44, 78], [96, 78], [96, 58], [-14, 58], [-14, 44], [86, 44], [86, 26], [66, 8], [54, -1]];
export const WAY2 = [[-34, -4], [-60, -10], [-92, -30], [-104, -60], [-100, -90], [-84, -104], [-84, -112]];
export const GATE = { x: 96, z: 106, w: 4.4 };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return [Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t), t]; }
const lens = (P) => { const L = []; let tot = 0; for (let i = 0; i + 1 < P.length; i++) { L.push(Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1])); tot += L[i]; } return { L, tot }; };
const L1 = lens(WAY), L2 = lens(WAY2);
/** [distance to the way, arclength s] */
export function pathAt(x, z, P, Ls = P === WAY ? L1 : L2) {
  let best = [Infinity, 0], acc = 0;
  for (let i = 0; i + 1 < P.length; i++) { const [d, t] = segDist(x, z, P[i], P[i + 1]); if (d < best[0]) best = [d, acc + t * Ls.L[i]]; acc += Ls.L[i]; }
  return best;
}
// the Way's height at each of its points: its legs follow the contours (the hill's own height at their z), the switchbacks between them climb,
// and the last flight, up through the terrace's wall at x = 86, is a stair
const WAY_Y = [1.4, 1.7, 3.2, 3.7, 7.3, 7.8, 10.7, 11.2, 12.4, 13.1, 20, 20, 20];
const WAY_S = L1.L.reduce((a, L) => (a.push(a[a.length - 1] + L), a), [0]);
export const wayY = (s) => { for (let i = 0; i + 1 < WAY_S.length; i++) if (s <= WAY_S[i + 1]) return WAY_Y[i] + (WAY_Y[i + 1] - WAY_Y[i]) * (s - WAY_S[i]) / (WAY_S[i + 1] - WAY_S[i]); return TT_Y; };
export const STAIR = [84.2, 26, 87.8, 44];                            // the flight up through the terrace's wall: its foot at z = 44, y 13.1
export const way2Y = (s) => TT_Y + (STADIUM_Y - TT_Y) * Math.min(1, s / L2.tot);
export const WAY_LEN = L1.tot;
/** Points of a way every `step` m with their heights: [[x, y, z], …] */
export function wayPoints(P, yf, step = 2.5) {
  const out = []; let acc = 0;
  for (let i = 0; i + 1 < P.length; i++) {
    const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
    for (let k = i ? 1 : 0; k <= n; k++) { const t = k / n; out.push([a[0] + (b[0] - a[0]) * t, yf(acc + L * t), a[1] + (b[1] - a[1]) * t]); }
    acc += L;
  }
  return out;
}

// ── the treasuries and the small buildings beside the Way: [x0, z0, x1, z1] of the building with its steps; all face south
// onto the leg below them (the front's at z1)
export const TREASURIES = [
  { id: 'sikyonian', rect: [76, 86, 85.5, 96.6], kind: 'doric', mat: 'limestone' },
  { id: 'cnidian', rect: [56, 86, 64.8, 96.6], kind: 'ionic', mat: 'marble' },
  { id: 'siphnian', rect: [60, 66, 66.5, 75.6], kind: 'siphnian', mat: 'marble' },
  { id: 'theban', rect: [80, 65, 90, 75.6], kind: 'doric', mat: 'limestone' },
  { id: 'corinthian', rect: [64, 46.5, 73, 55.6], kind: 'doric', mat: 'limestone' },
  { id: 'massaliot', rect: [46, 46.5, 54.4, 55.6], kind: 'ionic', mat: 'marble' },
  { id: 'athenian', rect: [60, 27.5, 68.7, 40], kind: 'athenian', mat: 'marble' },
];
export const STOA = [2, 27.2, 30.5, 33.2];                                // the Athenian Stoa, under the terrace's wall, its front on the Way
export const ALTAR = { c: [47, -1], w: 5.2, d: 3.4 };                  // the Chians' altar, before the temple
export const SPHINX = [31.5, 12.5];                                    // the Naxian column
export const SERPENT = [41.5, -7.5];
export const TEMPLE = { cx: 0, cz: -1, X: 29.1, Z: 10.85 };            // the stylobate's half-sizes
export const SPRING = [138, -9, 146, 9];                               // the fountain house, its front to the west
export const SPRING_Y = 19.2;
export const WALL_S = 106, WALL_E = 104;                              // the precinct's south and east walls

// ── the village: houses in terrace rows west and east of the sanctuary (docs/settlements/delphi.md §4.5). Each row is a lane along the
// contour with the houses on its uphill side, fronts to the south onto it; the lane's downhill edge is a parapet over the roofs of
// the row below, whose backs stand against it. Houses run wall to wall; here and there an alley between two of them with a stair up
// to the lane above.
export const ROW_PITCH = 17, ROW_Z0 = -6, HOUSE_D = 13;
const ZONES = [{ x: [-170, -80], k: [0, 6] }, { x: [110, 160], k: [3, 6] }];
let LOTS = null, LANES = null, ALLEYS = null;
const rowZ = (k) => ROW_Z0 + ROW_PITCH * k;
const rowY = (k) => Math.round(slopeY(rowZ(k) - 8.5) * 4) / 4 + 0.2;
const THEATRE_C = [-34, -52];
function village() {
  LOTS = []; LANES = []; ALLEYS = [];
  const rand = rng(400), runs = {};
  for (const Z of ZONES) for (let k = Z.k[0]; k <= Z.k[1]; k++) {
    const zl = rowZ(k), y = rowY(k), z0 = zl - 2 - HOUSE_D, z1 = zl - 2;
    let x = Z.x[0] + rand() * 3, n = 0, run = null, sinceAlley = 0;
    const ok = (r) => {
      const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
      if (Math.hypot(cx, cz) > RADIUS - 34 || Math.hypot(r[0], r[1]) > RADIUS - 28 || Math.hypot(r[0], r[3]) > RADIUS - 28 || Math.hypot(r[2], r[3]) > RADIUS - 28 || Math.hypot(r[2], r[1]) > RADIUS - 28) return false;
      for (const [px, pz] of [[cx, cz], [r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]]) if (pathAt(px, pz, WAY2)[0] < 8.5) return false;
      if (inRect(FC, cx, cz, 6) || inRect(SPRING, cx, cz, 16) || Math.hypot(cx - THEATRE_C[0], cz - THEATRE_C[1]) < 50) return false;
      if (r[2] > 104 - 4 && r[0] < 104 + 6 && r[3] > -60) return false;
      return true;
    };
    while (x < Z.x[1]) {
      const w = 8.8 + rand() * 3.0, r = [x, z0, x + w, z1];
      if (x + w > Z.x[1] + 4) break;
      if (!ok(r)) { run = null; x += w + 0.15; continue; }
      if (!run) { run = { x0: x, x1: x + w, k, z: zl, y }; (runs[k] ??= []).push(run); LANES.push(run); } else run.x1 = x + w;
      LOTS.push({ rect: r, front: 's', seed: Math.floor(rand() * 1e6), y, fall: 3.0, row: k, idx: n++ });
      x += w + 0.15; sinceAlley++;
      if (k > Z.k[0] && sinceAlley >= 3 && rand() < 0.6 && x + 2.4 < Z.x[1]) { ALLEYS.push({ x0: x - 0.15, x1: x + 2.25, k }); run.x1 = x + 2.25; x += 2.25; sinceAlley = 0; }
    }
  }
  // tiers: all the detail near the sanctuary's ways, less farther out
  const HOT = [[-36, 4], [-70, 30], [96, 70], [112, 100]];
  for (const l of LOTS) { const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, d = Math.min(...HOT.map(([x, z]) => Math.hypot(cx - x, cz - z))); l.tier = d < 70 ? 2 : d < 120 ? 1 : 0; }
  // the walk-in houses: about one in five of those within reach, never two side by side
  let last = -9;
  LOTS.forEach((l, i) => { const w = l.rect[2] - l.rect[0]; if (l.tier >= 1 && w > 9.6 && i - last > 1 && l.rect[2] > -168 && rand() < 0.34 && !ALLEYS.some((a) => a.k === l.row && Math.abs(a.x0 - l.rect[2]) < 0.4 && false)) { l.open = true; l.trade = ['bronze', 'perfume', 'cloth', 'wine', 'carpenter', 'pottery', 'weaver', 'cook'][Math.floor(rand() * 8)]; last = i; } });
  // the alleys' stairs: from the lane above down to the row's own level
  for (const a of ALLEYS) {
    const up = LANES.find((r) => r.k === a.k - 1 && a.x0 >= r.x0 - 0.01 && a.x1 <= r.x1 + 0.01), dn = LANES.find((r) => r.k === a.k && a.x0 >= r.x0 - 0.01 && a.x1 <= r.x1 + 0.01);
    a.up = up ?? null; a.dn = dn ?? null;
  }
}
export function lots() { if (!LOTS) village(); return LOTS; }
export function lanes() { if (!LOTS) village(); return LANES; }
export function alleys() { if (!LOTS) village(); return ALLEYS; }
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
export const inLane = (x, z, m = 0) => lanes().some((r) => inRect([r.x0, r.z - 1.8, r.x1, r.z + 1.7], x, z, m)) || alleys().some((a) => a.up && a.dn && inRect([a.x0, a.up.z + 1.2, a.x1, a.dn.z - 1.8], x, z, m));

// the pads of the buildings: [rect, y]
const PADS = [];
for (const t of TREASURIES) {
  const cx = (t.rect[0] + t.rect[2]) / 2, s = pathAt(cx, t.rect[3] + 3, WAY)[1];
  t.y = wayY(s) + 0.05;
  PADS.push([[t.rect[0] - 1.2, t.rect[1] - 1.2, t.rect[2] + 1.2, t.rect[3] + 1.4], t.y]);
}
STOA.y = wayY(pathAt(15, 46, WAY)[1]) + 0.2;
PADS.push([[STOA[0] - 1, STOA[1] - 1, STOA[2] + 1, STOA[3] + 1.2], STOA.y]);
export const PADS_ALL = PADS;
const PAD_BOX = () => PADS.concat(lots().map((l) => [[l.rect[0] - 1, l.rect[1] - 1, l.rect[2] + 1, l.rect[3] + 1], l.y]), lanes().map((r) => [[r.x0 - 0.5 - 1, r.z - 1.8 - 1, r.x1 + 0.5 + 1, r.z + 1.2 + 1], r.y]));

let CACHE = null;
export function height(x, z) {
  const r = Math.hypot(x, z);
  let h = slopeY(z);
  // the ravine's walls to the east (the Phaedriades' flank) and the cliffs of the north
  h += 46 * smooth(143, 175, x) * smooth(58, 6, Math.abs(z - 4));
  h += 0.9 * Math.sin(x * 0.21 + 1.3) * Math.sin(z * 0.17 + 0.4) * smooth(20, 80, Math.abs(x - 20) + Math.abs(z - 20) * 0.5);
  const north = smooth(-120, -142, z);
  h += 30 * north * (0.55 + 0.45 * Math.sin(x * 0.13 + 0.7) * Math.sin(z * 0.09 + 1.1));
  if (!CACHE) CACHE = PAD_BOX();
  // lots: each house on its own terrace
  for (const [q, y] of CACHE) { if (x > q[0] - 3 && x < q[2] + 3 && z > q[1] - 3 && z < q[3] + 3) { const d = Math.max(q[0] - x, x - q[2], q[1] - z, z - q[3]); h = h + (y - h) * smooth(2.6, 0, d); } }
  // the theatre cut in the hill
  {
    const D = theatreD(x, z), out = theatreOut(x, z), over = Math.max(out, D - T_BACK, T_FRONT - D);
    if (over < 5) { const hf = theatreRow(Math.max(T_FRONT, Math.min(D, T_BACK))); h = h + (hf - h) * smooth(5, 0, over); }
  }
  // the stadium's floor
  { const q = STADIUM, d = Math.max(q[0] - x, x - q[2], q[1] - z, z - q[3]); if (d < 4) h = h + (STADIUM_Y - h) * smooth(4, 0, d); }
  // the terraces and the forecourt, the spring's court
  for (const [q, y, a] of [[TT, TT_Y, 1.0], [FC, FC_Y, 3], [[SPRING[0] - 12, SPRING[1] - 3, SPRING[2] + 1.5, SPRING[3] + 3], SPRING_Y, 2]]) { const d = Math.max(q[0] - x, x - q[2], q[1] - z, z - q[3]); if (d < a) h = h + (y - h) * smooth(a, 0, d); }
  // the ways: graded across
  for (const [P, yf] of [[WAY, wayY], [WAY2, way2Y]]) {
    const [d, s] = pathAt(x, z, P);
    if (d < 7.5) h = h + (yf(s) - h) * smooth(7.5, 2.8, d);
  }
  // the precinct's walls hold the ground (south side falls away)
  // the rim meets the open country at no more than 1 m in 1 m (tests/planet.test.mjs: no step)
  const lim = Math.max(0, RADIUS - 1 - r) * 0.9;
  return Math.max(-lim, Math.min(lim, h * (1 - smooth(RADIUS - 18, RADIUS, r))));
}
export const onWay = (x, z, m = 0) => pathAt(x, z, WAY)[0] < 3 + m || pathAt(x, z, WAY2)[0] < 2.6 + m;
/** Where nothing grows: built ground. */
export function built(x, z, m = 0) {
  return inRect(TT, x, z, m) || inRect(FC, x, z, m) || inRect(STADIUM, x, z, m + 2) || theatreD(x, z) > T_FRONT - m && theatreD(x, z) < T_BACK + m && theatreOut(x, z) < m + 1 || inRect(SPRING, x, z, m + 8) || inLot(x, z, m + 1) || inLane(x, z, m + 1) || onWay(x, z, m + 1.5) || PADS.some(([q]) => inRect(q, x, z, m)) || (z > WALL_S - 1 && x > -70 && x < WALL_E && z < WALL_S + 1.4);
}

/** The votive sellers' stalls of the forecourt: [x0, z0, x1, z1] each, in rows; the gate's own five first. */
export const STALLS = [[100.2, 112, 103.6, 114.4], [100.2, 119, 103.6, 121.4], [88.5, 116, 92, 118.4], [88.5, 123, 92, 125.4], [106, 124, 109.4, 126.4],
  ...Array.from({ length: 6 }, (_, k) => [108.6 + k * 6.6, 108.6, 112.0 + k * 6.6, 111.0]), ...Array.from({ length: 5 }, (_, k) => [110 + k * 7, 125.6, 113.4 + k * 7, 128.0])];
