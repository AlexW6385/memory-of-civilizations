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

// ── the village: lots in terraces west and east of the sanctuary
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(400);
  const zones = [[-168, -26, -80, 96, 16, 15], [112, 36, 166, 98, 15, 15]];
  for (const [xa, za, xb, zb, dx, dz] of zones) for (let z = za; z < zb; z += dz) for (let x = xa; x < xb; x += dx) {
    if (rand() < 0.22) continue;
    const w = 9.5 + rand() * 2.5, d = 9 + rand() * 2, x0 = x + rand() * 1.5, z0 = z + rand() * 1.5, cx = x0 + w / 2, cz = z0 + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 34 || pathAt(cx, cz, WAY2)[0] < 9 || inRect(FC, cx, cz, 5) || inRect(SPRING, cx, cz, 14) || inRect([-168, -40, -90, -10], cx, cz) && cz < -26) continue;
    LOTS.push({ rect: [x0, z0, x0 + w, z0 + d], seed: Math.floor(rand() * 1e6), y: Math.round(slopeY(cz) * 4) / 4 + 0.2 });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

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
const PAD_BOX = () => PADS.concat(lots().map((l) => [[l.rect[0] - 1, l.rect[1] - 1, l.rect[2] + 1, l.rect[3] + 1], l.y]));

let CACHE = null;
export function height(x, z) {
  const r = Math.hypot(x, z);
  let h = slopeY(z);
  // the ravine's walls to the east (the Phaedriades' flank) and the cliffs of the north
  h += 46 * smooth(143, 175, x) * smooth(58, 6, Math.abs(z - 4));
  h += 0.9 * Math.sin(x * 0.21 + 1.3) * Math.sin(z * 0.17 + 0.4) * smooth(20, 80, Math.abs(x - 20) + Math.abs(z - 20) * 0.5);
  const north = smooth(-118, -150, z);
  h += 22 * north * (0.5 + 0.5 * Math.sin(x * 0.11));
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
  return h * (1 - smooth(RADIUS - 18, RADIUS, r));
}
export const onWay = (x, z, m = 0) => pathAt(x, z, WAY)[0] < 3 + m || pathAt(x, z, WAY2)[0] < 2.6 + m;
/** Where nothing grows: built ground. */
export function built(x, z, m = 0) {
  return inRect(TT, x, z, m) || inRect(FC, x, z, m) || inRect(STADIUM, x, z, m + 2) || theatreD(x, z) > T_FRONT - m && theatreD(x, z) < T_BACK + m && theatreOut(x, z) < m + 1 || inRect(SPRING, x, z, m + 8) || inLot(x, z, m + 1) || onWay(x, z, m + 1.5) || PADS.some(([q]) => inRect(q, x, z, m)) || (z > WALL_S - 1 && x > -70 && x < WALL_E && z < WALL_S + 1.4);
}
