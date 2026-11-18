// The upper floors of the walk-in houses nearest the arrival (docs/settlements/athens.md §17): the house is built as in
// houses.js, but over one range the second storey is a real floor with rooms, reached by a stair or a ladder.
//   front range (the pastas house, the workshop): a timber stair on the court wall rising to a gallery on the court, a door into
//     the rooms over the street cells; over the street door a small timber gallery; windows with their shutters standing open
//   back range (the small house): a ladder up through a hatch in the loft floor, a loggia over the yard
// Every piece lies in one geometry per material (the house's own bag); variation comes from a hash of the piece's position.

import { frustum, box, lathe, rod } from '../../core/geom.js';
import { kline, trapeza, loom, lampstand, rangeRoof } from '../../styles/greek/house-interior.js';
import { vase } from '../../styles/greek/vessels.js';
import { lots } from './layout.js';

const T = 0.5, TI = 0.4, H = 3.2;
export const UH = 2.7;                       // the upper storey's wall height
const FY = 0.02, RISE = H + FY;              // the upper floor stands 2 cm over the ground floor's ceiling line
const NR = 16, GO = 0.24, DR = RISE / NR, RUN = (NR - 1) * GO, PW = 1.3;   // the stair: 16 risers, 15 treads of 0.24 m, the gallery 1.3 m
const SW0 = 5.85, SW1 = 6.95;                // the stair's width (v from the street): half a metre off the court wall, so that the wall's foot is not at the climber's head
const ARRIVAL = [86.8, 70], COUNT = 10;

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A hash of a position (and a salt): the only source of variation of the pieces. */
function hashPos(x, z, k = 0) {
  let h = Math.imul(Math.floor(x * 53 + 7919), 73856093) ^ Math.imul(Math.floor(z * 59 + 104729), 19349663) ^ Math.imul(k + 1, 83492791);
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const rngAt = (x, z, k = 0) => rng(Math.floor(hashPos(x, z, k) * 4294967295) + 1);

// ── which houses ────────────────────────────────────────────────────────────────────────────────
let CHOSEN = null;
/** The walk-in houses (not Simon's) nearest the arrival, street to the north: the ones opened upstairs. */
export function storeySeeds() {
  if (CHOSEN) return CHOSEN;
  const c = lots().filter((l) => l.open && l.kind && l.kind !== 'simon' && l.front === 'n')
    .map((l) => ({ l, d: Math.hypot((l.rect[0] + l.rect[2]) / 2 - ARRIVAL[0], (l.rect[1] + l.rect[3]) / 2 - ARRIVAL[1]) })).sort((a, b) => a.d - b.d);
  CHOSEN = new Set(c.slice(0, COUNT).map(({ l }) => l.seed));
  return CHOSEN;
}
export const storeyOf = (l) => !!l.open && !!l.kind && l.kind !== 'simon' && storeySeeds().has(l.seed);
/** What the second storey of this house is used for. */
export const useOf = (kind, seed) => (kind === 'small' ? 'lodging' : kind === 'workshop' ? 'sculptor' : ((seed >> 4) & 1) === 0 ? 'inn' : 'merchant');

// ── the plan of the stair or the ladder (pure: the court's furniture and the walks follow it) ──────
/** Front range: the stair along the court wall, rising to a gallery in front of a door into the rooms over the street cells. */
function frontStair(C, L, midGaps) {
  const pass = C.front.find((c) => c.k === 'passage'), pc = (pass.u0 + pass.u1) / 2;
  const lanes = midGaps.map(([a, b]) => [a - 0.35, b + 0.35]), hit = (a, b) => lanes.some(([p, q]) => a < q && b > p);
  let best = null;
  for (let pa = 0.9; pa + PW <= L - 0.9 + 1e-6; pa += 0.1) for (const dir of [1, -1]) {
    // dir 1: the stair lies on the +u side of the gallery and climbs toward −u; dir −1 the reverse
    const s0 = dir > 0 ? pa + PW : pa - RUN, s1 = dir > 0 ? pa + PW + RUN : pa;
    if (s0 < 0.9 || s1 > L - 0.9) continue;
    const low = dir > 0 ? [s1 - 0.72 * RUN, s1] : [s0, s0 + 0.72 * RUN];            // the part under head height must stand clear of the doors on the court
    if (hit(...low)) continue;
    const d0 = pa + 0.15, d1 = pa + PW - 0.15, cell = C.front.find((c) => d0 >= c.u0 + 0.1 && d1 <= c.u1 - 0.1);
    if (!cell) continue;
    const score = Math.abs(pa + PW / 2 - pc) - (cell.k === 'passage' ? 2 : 0) + (dir > 0 ? 0 : 0.01);
    if (!best || score < best.score) best = { score, pa, dir, s0, s1, d0, d1, cell };
  }
  return best;
}
/** Back range (the small house): the ladder in the loft cell through a hatch, the loggia over the yard. */
function backLadder(C, L, D, vq0, figU) {
  const tc = C.back.find((c) => c.k === 'thalamos'), oc = C.back.find((c) => c.k === 'oikos'), zw = D - T, vF = zw - 1.0;
  const lu = tc.u1 - 1.0, ramp = [lu - 0.6, vF - 0.85, lu + 0.6, vF], hatch = [lu - 0.9, vF - 0.85 - 0.3, tc.u1, vF];
  const oc2 = (oc.u0 + oc.u1) / 2, g0 = Math.abs(oc2 - figU) < 3.2 ? (oc2 > figU ? oc2 - 0.3 : oc2 - 2.1) : oc2 - 1.2;   // the loggia's span, clear of the fig tree
  return { tc, oc, zw, vF, lu, ramp, hatch, gal: [Math.max(oc.u0 + 0.3, g0), Math.max(oc.u0 + 0.3, g0) + 2.4] };
}
/** The plan of a house's upper floor: { side, ... } or null. */
export function storeyPlan(kind, C, L, D, vq0, midGaps, figU = 0) {
  if (kind === 'small') return { side: 'back', ...backLadder(C, L, D, vq0, figU) };
  const st = frontStair(C, L, midGaps);
  return st ? { side: 'front', ...st } : null;
}

// ── the building ────────────────────────────────────────────────────────────────────────────────
/**
 * Build the second storey of the house; `S` the plan above, `G` { C, L, D, vp0, vq0, cv0, cv1, kind, seed, tone, midGaps, pot, chest }.
 * F the lot's frame (street on the north: u east, v south).
 */
export function buildStorey(ctx, F, y, S, G) {
  const { bag, col, lights } = ctx, { C, L, D, vp0, vq0, kind, seed, tone, pot, chest } = G;
  const front = S.side === 'front', Y = y + H + FY, top = y + H + UH, use = useOf(kind, seed);
  const B = (mat, u0, v0, u1, v1, ya, yb, solid = false, noTop = false) => {
    const r = F.R(u0, v0, u1, v1);
    bag.add(mat, noTop ? frustum(r, ya, yb, 0, 0, 0, 0, { noTop: true }) : box(r[0], ya, r[1], r[2], yb, r[3]));
    if (solid) col.rect(r, ya, yb);
    return r;
  };
  const rod3 = (mat, a, b, r, seg = 5) => { const p = F.P(a[0], a[1]), q = F.P(b[0], b[1]); bag.add(mat, rod([p[0], a[2], p[1]], [q[0], b[2], q[1]], r, seg)); };
  const cellsF = C.front, cellsB = C.back;
  // the lanes (u, v rectangles) that doors and the hatch keep clear of furniture
  const lanes = [], blocked = (r) => lanes.some((q) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
  const place = (cands, fn) => { for (const r of cands) if (!blocked(r)) { fn(r); return true; } return false; };

  // ---- the floor: a slab of boards over joists, the walker's floor in the same pieces; round the hatch where there is one
  const v0f = front ? 0.06 : vq0 + 0.06, v1f = front ? vp0 + TI - 0.06 : D - 0.06, joistV = [];
  for (let v = v0f + 0.7; v < v1f - 0.3; v += 0.75) joistV.push(v);
  const slab = (u0, v0, u1, v1) => { if (u1 - u0 < 0.02 || v1 - v0 < 0.02) return; B('timber', u0, v0, u1, v1, y + H - 0.16, Y); col.floor(F.R(u0, v0, u1, v1), Y); };
  if (front || !S.hatch) slab(0.06, v0f, L - 0.06, v1f);
  else {
    const [h0, k0, h1, k1] = S.hatch;
    slab(0.06, v0f, L - 0.06, k0); slab(0.06, k1, L - 0.06, v1f); slab(0.06, k0, h0, k1); slab(h1, k0, L - 0.06, k1);
    // the hatch's rail on its three open sides (the fourth is where one steps off the ladder)
    railSeg(h0, k0, h1, k0, Y); railSeg(h0, k0, h0, k1 - 0.5, Y); railSeg(h1 - 0.02, k0, h1 - 0.02, k1 - 0.5, Y);
    lanes.push([h0, k0, h1, k1]);
  }
  for (const v of joistV) {
    if (!front && S.hatch && v > S.hatch[1] - 0.05 && v < S.hatch[3] + 0.05) { B('wood_dark', 0.3, v - 0.07, S.hatch[0] - 0.02, v + 0.07, y + H - 0.3, y + H - 0.16); B('wood_dark', S.hatch[2] + 0.02, v - 0.07, L - 0.3, v + 0.07, y + H - 0.3, y + H - 0.16); }
    else B('wood_dark', 0.3, v - 0.07, L - 0.3, v + 0.07, y + H - 0.3, y + H - 0.16);
  }

  // ---- rails: posts and bars without top faces (nothing to stand on)
  function railSeg(u0, v0, u1, v1, fy) {
    const len = Math.hypot(u1 - u0, v1 - v0), m = Math.max(1, Math.round(len / 0.55));
    for (let k = 0; k <= m; k++) { const u = u0 + (u1 - u0) * k / m, v = v0 + (v1 - v0) * k / m; B('wood_dark', u - 0.025, v - 0.025, u + 0.025, v + 0.025, fy, fy + 0.95, false, true); }
    const x0 = Math.min(u0, u1) - 0.035, x1 = Math.max(u0, u1) + 0.035, z0 = Math.min(v0, v1) - 0.035, z1 = Math.max(v0, v1) + 0.035;
    B('timber', x0, z0, x1, z1, fy + 0.9, fy + 0.97, false, true); B('wood_dark', x0 + 0.01, z0 + 0.01, x1 - 0.01, z1 - 0.01, fy + 0.45, fy + 0.5, false, true);
  }
  const post = (u, v, y0, y1, w = 0.07, mat = 'wood_dark') => B(mat, u - w, v - w, u + w, v + w, y0, y1, true);

  // ---- the walls: pieces round the openings so the reveals are real
  const wall = (alongU, c0, c1, a, b, ops, mat = tone) => {
    const piece = (p, q, ya, yb) => { if (q - p < 0.02 || yb - ya < 0.02) return; alongU ? B(mat, p, c0, q, c1, ya, yb, true) : B(mat, c0, p, c1, q, ya, yb, true); };
    let u = a;
    for (const o of [...ops].sort((p, q) => p.a - q.a)) {
      piece(u, o.a, y + H, top - 0.02);
      if (o.sill > 0) piece(o.a, o.b, y + H, Y + o.sill);
      piece(o.a, o.b, Y + o.head, top - 0.02);
      u = o.b;
    }
    piece(u, b, y + H, top - 0.02);
  };
  // a window's frame on the outer face (vf, outward sign s): sill board, lintel board, jambs, one shutter leaf standing open each side
  const frame = (a, b, sill, head, vf, s) => {
    const rv = (d0, d1) => (s < 0 ? [vf - d1, vf - d0] : [vf + d0, vf + d1]);
    let [p, q] = rv(0, 0.09); B('timber', a - 0.05, p, b + 0.05, q, Y + sill - 0.05, Y + sill);
    [p, q] = rv(0, 0.06); B('timber', a - 0.05, p, b + 0.05, q, Y + head, Y + head + 0.08);
    [p, q] = rv(0, 0.05); B('timber', a - 0.06, p, a, q, Y + sill, Y + head); B('timber', b, p, b + 0.06, q, Y + sill, Y + head);
    [p, q] = rv(0, 0.035); const lw = Math.min(0.5, (b - a) / 2 - 0.02);
    B('wood_dark', a - 0.06 - lw, p, a - 0.06, q, Y + sill, Y + head); B('wood_dark', b + 0.06, p, b + 0.06 + lw, q, Y + sill, Y + head);
  };
  const win = (cu0, cu1, face, vOut, s, wide = 1.1) => {
    const w = Math.min(wide, cu1 - cu0 - 1.0), cm = (cu0 + cu1) / 2 + (hashPos(F.P(cu0, 0)[0], F.P(0, vOut)[1], 3) - 0.5) * 0.3;
    return w < 0.5 ? null : { a: cm - w / 2, b: cm + w / 2, sill: 0.85, head: 2.05, face, vOut, s };
  };

  // the rooms, the doors, the walls — front range
  const doorLane = (a, b, vWall, into) => lanes.push([a - 0.2, Math.min(vWall, vWall + into * 1.2) - (into < 0 ? 0 : 0), b + 0.2, Math.max(vWall, vWall + into * 1.2)]);
  if (front) {
    const pass = cellsF.find((c) => c.k === 'passage'), pc = (pass.u0 + pass.u1) / 2, cw0 = vp0, cw1 = vp0 + TI;
    const parts = cellsF.slice(0, -1).map((c) => c.u1 + TI / 2);
    // street wall: windows over the cells, the gallery door over the street door
    const sOps = [{ a: pc - 0.45, b: pc + 0.45, sill: 0, head: 2.1 }];
    const wins = [];
    for (const c of cellsF) if (c.k !== 'passage') { const w = win(c.u0, c.u1, 'street', 0, -1, c.k === 'andron' || c.k === 'craft' ? 1.2 : 1.0); if (w) { sOps.push(w); wins.push(w); } }
    wall(true, 0, 0.45, 0, L, sOps);
    for (const w of wins) frame(w.a, w.b, w.sill, w.head, 0, -1);
    // the walls of the sides, the court wall with the gallery's door and windows, the partitions with their doors
    B(tone, 0, 0.45, 0.45, cw1, y + H, top - 0.02, true); B(tone, L - 0.45, 0.45, L, cw1, y + H, top - 0.02, true);
    const cOps = [{ a: S.d0, b: S.d1, sill: 0, head: 2.1 }];
    for (const c of cellsF) if (c.k !== 'passage') {
      const w = win(c.u0, c.u1, 'court', cw1, 1, 1.0); if (!w) continue;
      for (const sh of [0, -1.3, 1.3]) { const a = w.a + sh, b = w.b + sh; if (a > c.u0 + 0.3 && b < c.u1 - 0.3 && (b < S.d0 - 0.4 || a > S.d1 + 0.4)) { cOps.push({ ...w, a, b }); break; } }
    }
    wall(true, cw0, cw1, 0.45, L - 0.45, cOps);
    for (const o of cOps) if (o.sill) frame(o.a, o.b, o.sill, o.head, cw1, 1);
    for (const x of parts) wall(false, x - 0.12, x + 0.12, 0.45, cw0, [{ a: 3.0, b: 4.0, sill: 0, head: 2.05 }]);
    for (const x of parts) lanes.push([x - 1.1, 2.9, x + 1.1, 4.1]);
    lanes.push([S.d0 - 0.2, cw0 - 1.2, S.d1 + 0.2, cw0], [pc - 0.6, 0.45, pc + 0.6, 1.5]);
    rangeRoof(ctx, F.R(0, 0, L, cw1), y, H + UH);

    // ---- the gallery on the court and the stair up to it
    const gv0 = cw1, gv1 = cw1 + 1.7, far = S.dir > 0 ? S.pa : S.pa + PW, near = S.dir > 0 ? S.pa + PW : S.pa;
    B('timber', S.pa, gv0, S.pa + PW, gv1, y + H - 0.16, Y); col.floor(F.R(S.d0, cw0, S.d1, gv1), Y); col.floor(F.R(S.pa, gv0 - 0.05, S.pa + PW, gv1), Y);
    B('wood_dark', S.pa - 0.04, gv1 - 0.12, S.pa + PW + 0.04, gv1 + 0.03, y + H - 0.34, y + H - 0.16);
    post(far + (S.dir > 0 ? 0.09 : -0.09), gv1 - 0.1, y, y + H - 0.16, 0.08); B('limestone', far + (S.dir > 0 ? 0.09 : -0.09) - 0.14, gv1 - 0.24, far + (S.dir > 0 ? 0.09 : -0.09) + 0.14, gv1 + 0.04, y - 0.05, y + 0.12);
    railSeg(S.pa, gv1 - 0.03, S.pa + PW, gv1 - 0.03, Y); railSeg(far, gv0 + 0.05, far, gv1 - 0.03, Y);
    // the stair: treads and risers, two stringers under them, posts, the rail along the open side
    const U = (d0, d1) => (S.dir > 0 ? [S.s1 - d1, S.s1 - d0] : [S.s0 + d0, S.s0 + d1]);
    for (let k = 1; k < NR; k++) {
      const top_k = y + k * DR, [a, b] = U((k - 1) * GO - 0.03, k * GO), [ra, rb] = U((k - 1) * GO, (k - 1) * GO + 0.03);
      B('timber', a, SW0, b, SW1, top_k - 0.05, top_k); B('wood_dark', ra, SW0 + 0.03, rb, SW1 - 0.03, top_k - DR, top_k - 0.05);
    }
    const hPitch = (d) => y + DR + d * DR / GO;
    for (const v of [SW0 + 0.07, SW1 - 0.07]) {
      const [pu0, pu1] = [U(0, 0)[0], U(RUN, RUN)[0]];
      rod3('wood_dark', [pu0, v, hPitch(0) - 0.34], [pu1, v, hPitch(RUN) - 0.3], 0.055, 5);
      for (const d of [1.0, 2.2, 3.2]) { const u = U(d, d)[0]; post(u, v, y, hPitch(d) - 0.32, 0.045); }
    }
    // the open side: balusters and a sloping handrail, newels at the foot and at the top
    const hv = SW1 + 0.02;
    for (let d = 0.3; d < RUN; d += 0.48) { const u = U(d, d)[0]; B('wood_dark', u - 0.02, hv - 0.02, u + 0.02, hv + 0.02, y + (hPitch(d) - y) - 0.0, hPitch(d) + 0.85, false, true); }
    rod3('timber', [U(0, 0)[0], hv, hPitch(0) + 0.95], [U(RUN, RUN)[0], hv, hPitch(RUN) + 0.95], 0.032, 5);
    post(U(0, 0)[0], hv, y, y + 1.15, 0.045); post(U(RUN, RUN)[0], hv, y, Y + 0.95, 0.045);
    col.ramp(F.R(Math.min(S.s0, S.s1), SW0, Math.max(S.s0, S.s1), SW1), y + 0.5 * DR, y + 15 * DR + 0.1, S.dir > 0 ? 'w' : 'e');
    // the gallery over the street door
    const g0 = pc - 0.85, g1 = pc + 0.85;
    B('timber', g0, -0.9, g1, 0.0, y + H - 0.14, Y); col.floor(F.R(pc - 0.45, -0.9, pc + 0.45, 0.45), Y); col.floor(F.R(g0, -0.9, g1, 0.0), Y);
    B('wood_dark', g0 - 0.03, -0.93, g1 + 0.03, -0.84, y + H - 0.32, y + H - 0.14);
    for (const u of [g0 + 0.12, pc, g1 - 0.12]) rod3('wood_dark', [u, 0.0, y + H - 0.95], [u, -0.82, y + H - 0.3], 0.04, 5);
    railSeg(g0 + 0.03, -0.88, g1 - 0.03, -0.88, Y); railSeg(g0 + 0.03, -0.88, g0 + 0.03, -0.1, Y); railSeg(g1 - 0.03, -0.88, g1 - 0.03, -0.1, Y);

    // ---- the rooms by use
    const lamp = (u, v) => lampstand(ctx, ...F.P(u, v), Y, 1.15), cellOf = (k) => cellsF.filter((c) => c.k === k);
    const bed = (r, head = true) => { const R = F.R(...r); kline(bag, col, R[0], R[1], R[2], R[3], Y, head, rngAt(R[0], R[1])); };
    const chestAt = (r) => { const R = F.R(...r); chest(bag, col, (R[0] + R[2]) / 2, (R[1] + R[3]) / 2, Y, true); };
    const stool = (u, v) => { const [x, z] = F.P(u, v); bag.add('wood_dark', box(x - 0.18, Y + 0.36, z - 0.18, x + 0.18, Y + 0.41, z + 0.18)); for (const [a, b] of [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]]) bag.add('wood_dark', box(x + a - 0.02, Y, z + b - 0.02, x + a + 0.02, Y + 0.36, z + b + 0.02)); col.rect([x - 0.2, z - 0.2, x + 0.2, z + 0.2], Y, Y + 0.41); };
    const table = (u, v) => { const [x, z] = F.P(u, v); trapeza(bag, x, z, Y, true, rngAt(x, z)); col.rect([x - 0.4, z - 0.23, x + 0.4, z + 0.23], Y, Y + 0.5); };
    const sack = (u, v, k = 0) => { const [x, z] = F.P(u, v), h = hashPos(x, z, k); bag.add('linen', lathe([[0.001, 0], [0.2, 0.02], [0.25, 0.2], [0.19, 0.4], [0.1, 0.46], [0.001, 0.44]], 8, null, x, Y, z).scale(1, 0.9 + h * 0.3, 1).translate(0, 0, 0)); col.circle(x, z, 0.25, Y, Y + 0.45); };
    const jar = (kind2, u, v, o = {}) => { const [x, z] = F.P(u, v); pot(bag, kind2, x, Y, z, o); if (kind2 === 'pithos') col.circle(x, z, 0.35 * (o.s ?? 1), Y, Y + 1.0 * (o.s ?? 1)); };
    const pallet = (r) => { const R = F.R(...r); bag.add('timber', box(R[0], Y, R[1], R[2], Y + 0.16, R[3])); bag.add('linen', box(R[0] + 0.03, Y + 0.16, R[1] + 0.03, R[2] - 0.03, Y + 0.23, R[3] - 0.03)); bag.add('cloth_ochre', box(R[0] + 0.03, Y + 0.23, R[1] + 0.03 + (R[3] - R[1]) * 0.4, R[2] - 0.03, Y + 0.26, R[3] - 0.03)); col.rect(R, Y, Y + 0.26); };
    const cloak = (u, v, sg) => { const [x, z] = F.P(u, v), R = F.R(u, v, u + 0.5, v + sg * 0.04); bag.add('wood_dark', box(R[0], Y + 1.75, R[1] - 0.01, R[2], Y + 1.79, R[3] + 0.01)); bag.add('cloth_ochre', box(R[0] + 0.04, Y + 1.0, R[1], R[2] - 0.04, Y + 1.76, R[3])); void x; void z; };
    const rack = (u0, u1, v0, sculptor) => {
      const R = F.R(u0, v0, u1, v0 + 0.4); col.rect(R, Y, Y + 1.9);
      for (const [a, b] of [[u0, v0], [u1 - 0.06, v0], [u0, v0 + 0.34], [u1 - 0.06, v0 + 0.34]]) B('wood_dark', a, b, a + 0.06, b + 0.06, Y, Y + 1.9);
      for (const h of [0.5, 1.1, 1.7]) {
        B('timber', u0, v0, u1, v0 + 0.4, Y + h - 0.04, Y + h);
        for (let u = u0 + 0.3; u < u1 - 0.2; u += 0.36) {
          const [x, z] = F.P(u, v0 + 0.2), hh = hashPos(x, z, 5);
          if (sculptor) bag.add('plaster_white', lathe([[0.001, 0], [0.1, 0.03], [0.12, 0.14 + hh * 0.05], [0.07, 0.25], [0.001, 0.27]], 8, null, x, Y + h, z));
          else pot(bag, ['oinochoe', 'hydria', 'lekythos', 'amphora', 'kylix'][Math.floor(hh * 5)], x, Y + h, z, { s: 0.75, dark: false });
        }
      }
    };
    const roles = cellsF.map((c) => ({ c, role: c.k === 'passage' ? 'hall' : kind === 'workshop' ? (c.k === 'craft' ? 'loft' : 'sleep') : use === 'inn' ? (c.k === 'andron' ? 'guest' : 'guest2') : c.k === 'andron' ? 'bedroom' : 'store' }));
    let lit = false;
    for (const { c, role } of roles) {
      const ua = c.u0, ub = c.u1, W = ub - ua, cm = (ua + ub) / 2;
      const lampHere = (u, v) => { if (!lit) { lit = true; lamp(u, v); } };
      if (role === 'hall') {
        place([[cm - 0.2, 3.7, cm + 0.2, 4.1]], () => stool(cm, 3.9));
        place([[ua + 0.1, 0.6, ua + 0.5, 1.0], [ub - 0.5, 0.6, ub - 0.1, 1.0]], (r) => jar('hydria', (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, { s: 1.1, dark: false }));
        cloak(ua + 0.1, cw0 - 0.02, -1);
      } else if (role === 'bedroom') {
        bed([ua + 0.2, 0.55, ua + 2.05, 1.4]); place([[ub - 1.45, 0.6, ub - 0.35, 1.2]], chestAt);
        place([[ub - 1.7, 2.1, ub - 0.9, 2.55]], () => { table(ub - 1.3, 2.35); stool(ub - 1.3, 2.95); });
        cloak(ua + 0.5, cw0 - 0.02, -1); lampHere(ua + 0.45, 4.4);
      } else if (role === 'store') {
        const lx = ub - 1.15; if (W > 4.5 && !blocked([lx - 0.9, 0.45, lx + 0.9, 1.0])) loom(bag, col, ...F.P(lx, 0.45).slice(0, 1), F.P(lx, 0.45)[1], Y);
        for (let k = 0; k < 2; k++) place([[ua + 0.2 + k * 0.85, 3.9, ua + 1.0 + k * 0.85, 4.8]], () => jar('pithos', ua + 0.6 + k * 0.85, 4.35, { s: 0.9 }));
        for (let k = 0; k < 4; k++) { const u = ua + 0.4 + k * 0.42; if (Math.abs(u - cm) > 0.5 || true) place([[u - 0.2, 0.55, u + 0.2, 0.95]], () => jar('amphora', u, 0.75, { s: 1.0, dark: false, tilt: -0.14 })); }
        for (const [u, v] of [[ub - 0.5, 4.2], [ub - 0.95, 4.45], [ub - 0.7, 3.6]]) place([[u - 0.27, v - 0.27, u + 0.27, v + 0.27]], () => sack(u, v));
        place([[ub - 1.5, 2.0, ub - 0.4, 2.6]], chestAt);
      } else if (role === 'guest') {
        bed([ua + 0.2, 0.55, ua + 2.05, 1.4]); bed([ub - 2.05, 0.55, ub - 0.2, 1.4], false); bed([ua + 0.2, 4.0, ua + 2.05, 4.85]);
        place([[cm - 0.6, 2.2, cm + 0.6, 2.9]], () => { table(cm, 2.5); }); place([[ub - 1.4, 3.9, ub - 0.3, 4.5]], chestAt);
        place([[ub - 0.7, 3.0, ub - 0.25, 3.45]], () => jar('hydria', ub - 0.45, 3.2, { s: 1.1, dark: false })); lampHere(cm + 1.0, 4.4);
      } else if (role === 'guest2') {
        bed([ua + 0.2, 0.55, ua + 2.05, 1.4]); bed([ua + 2.5, 0.55, ua + 4.35, 1.4]);
        place([[ub - 1.5, 3.9, ub - 0.4, 4.5]], chestAt); place([[ua + 0.2, 4.0, ua + 0.8, 4.7]], () => jar('amphora', ua + 0.5, 4.35, { s: 1.1, dark: false }));
        place([[cm - 0.5, 2.3, cm + 0.5, 3.0]], () => { table(cm, 2.6); }); lampHere(cm, 4.4);
      } else if (role === 'loft') {
        const sc = use === 'sculptor';
        rack(ua + 0.5, ua + 2.9, 0.55, sc); rack(ub - 2.9, ub - 0.5, 0.55, sc);
        if (sc) {                                                                         // the sculptor's loft: a worktable with models in wax and clay, the cast of a head on the shelf, a board
          place([[cm - 1.0, 2.1, cm + 1.0, 2.9]], () => { const R = F.R(cm - 0.9, 2.2, cm + 0.9, 2.8); bag.add('timber', box(R[0], Y + 0.8, R[1], R[2], Y + 0.86, R[3])); for (const [a, b] of [[R[0] + 0.05, R[1] + 0.05], [R[2] - 0.1, R[1] + 0.05], [R[0] + 0.05, R[3] - 0.1], [R[2] - 0.1, R[3] - 0.1]]) bag.add('wood_dark', box(a, Y, b, a + 0.05, Y + 0.8, b + 0.05)); col.rect(R, Y, Y + 0.86); for (let k = 0; k < 3; k++) { const x = R[0] + 0.3 + k * 0.5, z = (R[1] + R[3]) / 2; bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.08, 0.1], [0.05, 0.2], [0.001, 0.24]], 7, null, x, Y + 0.86, z)); } bag.add('bronze', box(R[2] - 0.5, Y + 0.86, R[1] + 0.2, R[2] - 0.3, Y + 0.88, R[1] + 0.26)); });
        } else {                                                                           // the potter's loft: clay in sacks, firewood for the kiln, a bench
          for (const [u, v] of [[cm - 0.5, 4.3], [cm + 0.2, 4.4], [cm - 0.1, 3.7]]) place([[u - 0.27, v - 0.27, u + 0.27, v + 0.27]], () => sack(u, v, 2));
          place([[ub - 2.2, 4.0, ub - 0.5, 4.8]], (r) => { for (let k = 0; k < 6; k++) { const R = F.R(r[0], r[1] + (k % 3) * 0.26, r[2], r[1] + (k % 3) * 0.26 + 0.22); bag.add('timber', box(R[0], Y + Math.floor(k / 3) * 0.2, R[1], R[2], Y + Math.floor(k / 3) * 0.2 + 0.17, R[3])); } col.rect(F.R(...r), Y, Y + 0.6); });
        }
        place([[ua + 0.2, 3.9, ua + 1.3, 4.5]], chestAt); lampHere(ua + 0.5, 4.5);
        cloak(ub - 1.0, cw0 - 0.02, -1);
      } else if (role === 'sleep') {                                                       // the apprentice's room: a pallet, a chest, his cloak
        pallet([ub - 0.95, 0.6, ub - 0.15, 2.5]); place([[ua + 0.1, 0.6, ua + 0.9, 1.2]], chestAt); cloak(ua + 0.4, cw0 - 0.02, -1);
        place([[ua + 0.15, 3.9, ua + 0.65, 4.4]], () => jar('hydria', ua + 0.4, 4.15, { s: 1.0, dark: false }));
      }
    }
    void doorLane;
    return;
  }

  // ---- the back range: the loft over the loft cell, the room over the oikos, the loggia over the yard
  const { tc, oc, zw, vF, lu, ramp, gal } = S, cw0 = vq0, cw1 = vq0 + TI, bw0 = D - 0.45;
  const parts = [tc.u0 < oc.u0 ? tc.u1 + TI / 2 : oc.u1 + TI / 2];
  // the court wall: a window over each cell, the loggia's door in the room over the oikos
  const gd0 = (gal[0] + gal[1]) / 2 - 0.5, gd1 = gd0 + 1.0;
  const cOps = [{ a: gd0, b: gd1, sill: 0, head: 2.1 }];
  const w = win(tc.u0, tc.u1, 'court', cw0, -1, 1.0); if (w) { cOps.push(w); }
  const w2 = win(oc.u0, oc.u1, 'court', cw0, -1, 1.1); if (w2) for (const sh of [-2.0, 2.0, -2.6, 2.6]) { const a = w2.a + sh, b = w2.b + sh; if (a > oc.u0 + 0.3 && b < oc.u1 - 0.3 && (b < gd0 - 0.5 || a > gd1 + 0.5)) { cOps.push({ ...w2, a, b }); break; } }
  wall(true, cw0, cw1, 0.45, L - 0.45, cOps);
  for (const o of cOps) if (o.sill) frame(o.a, o.b, o.sill, o.head, cw0, -1);
  wall(true, bw0, D, 0, L, []);
  B(tone, 0, cw1, 0.45, bw0, y + H, top - 0.02, true); B(tone, L - 0.45, cw1, L, bw0, y + H, top - 0.02, true);
  wall(false, parts[0] - 0.12, parts[0] + 0.12, cw1, bw0, [{ a: 10.95, b: 11.95, sill: 0, head: 2.05 }]);
  lanes.push([parts[0] - 1.1, 10.9, parts[0] + 1.1, 12.1], [gd0 - 0.2, cw1, gd1 + 0.2, cw1 + 1.2]);
  rangeRoof(ctx, F.R(0, vq0, L, D), y, H + UH);
  // the ladder: two poles and rungs, standing up through the hatch; the ramp under it (its low end half a metre under the foot)
  const fz = ramp[1], lx0 = lu - 0.3, lx1 = lu + 0.3, hi = Y + 0.95;
  rod3('timber', [lx0, fz, y], [lx0, vF - 0.02, hi], 0.03, 5); rod3('timber', [lx1, fz, y], [lx1, vF - 0.02, hi], 0.03, 5);
  for (let k = 1; k <= 11; k++) { const f = k / 12, vv = fz + (vF - 0.02 - fz) * f * (3.22 / (hi - y)) , hh = y + (hi - y) * f * (3.22 / (hi - y)) + 0.0; rod3('timber', [lx0, vv, hh], [lx1, vv, hh], 0.02, 4); }
  col.ramp(F.R(...ramp), y - 0.5, Y, 's');
  // the room over the oikos by use (grain and weaving), the loft over the loft cell (the lodger's pallet, a chest)
  const lamp = (u, v) => lampstand(ctx, ...F.P(u, v), Y, 1.15);
  const jar = (kind2, u, v, o = {}) => { const [x, z] = F.P(u, v); pot(bag, kind2, x, Y, z, o); if (kind2 === 'pithos') col.circle(x, z, 0.35 * (o.s ?? 1), Y, Y + 1.0 * (o.s ?? 1)); };
  const sack = (u, v, k = 0) => { const [x, z] = F.P(u, v), h = hashPos(x, z, k); bag.add('linen', lathe([[0.001, 0], [0.2, 0.02], [0.25, 0.2], [0.19, 0.4], [0.1, 0.46], [0.001, 0.44]], 8, null, x, Y, z).scale(1, 0.9 + h * 0.3, 1)); col.circle(x, z, 0.25, Y, Y + 0.45); };
  const chestAt = (r) => { const R = F.R(...r); chest(bag, col, (R[0] + R[2]) / 2, (R[1] + R[3]) / 2, Y, true); };
  const pallet = (r) => { const R = F.R(...r); bag.add('timber', box(R[0], Y, R[1], R[2], Y + 0.16, R[3])); bag.add('linen', box(R[0] + 0.03, Y + 0.16, R[1] + 0.03, R[2] - 0.03, Y + 0.23, R[3] - 0.03)); bag.add('cloth_ochre', box(R[0] + 0.03, Y + 0.23, R[1] + 0.03, R[2] - 0.03, Y + 0.26, R[1] + 0.03 + (R[3] - R[1]) * 0.4)); col.rect(R, Y, Y + 0.26); };
  // loft
  pallet([tc.u0 + 0.1, bw0 - 0.9, tc.u0 + 1.5, bw0 - 0.1]) ;
  place([[tc.u0 + 0.15, 11.0, tc.u0 + 1.25, 11.6], [tc.u1 - 1.25, 11.0, tc.u1 - 0.15, 11.6]], chestAt);
  place([[tc.u0 + 0.2, 11.7, tc.u0 + 0.7, 12.2], [tc.u1 - 0.7, 11.7, tc.u1 - 0.2, 12.2]], (r) => jar('lekythos', (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, { s: 1.3, dark: false }));
  // the room over the oikos
  const ox0 = oc.u0, ox1 = oc.u1;
  for (let k = 0; k < 3; k++) place([[ox0 + 0.2 + k * 0.95, bw0 - 0.9, ox0 + 1.0 + k * 0.95, bw0 - 0.1]], () => jar('pithos', ox0 + 0.65 + k * 0.95, bw0 - 0.5, { s: 0.9 }));
  for (let k = 0; k < 4; k++) place([[ox1 - 0.6 - k * 0.42, bw0 - 0.6, ox1 - 0.2 - k * 0.42, bw0 - 0.2]], () => jar('amphora', ox1 - 0.4 - k * 0.42, bw0 - 0.4, { s: 1.0, dark: false, tilt: -0.14 }));
  for (const [u, v] of [[ox1 - 0.6, bw0 - 1.4], [ox1 - 1.1, bw0 - 1.5], [ox1 - 0.8, bw0 - 2.0]]) place([[u - 0.27, v - 0.27, u + 0.27, v + 0.27]], () => sack(u, v, 4));
  for (const lxc of [ox0 + 1.3, ox1 - 1.3]) { if (!blocked([lxc - 0.9, cw1, lxc + 0.9, cw1 + 0.6]) && Math.abs(lxc - (gd0 + 0.5)) > 1.7) { const [lxx, lzz] = F.P(lxc, cw1); loom(bag, col, lxx, lzz, Y); break; } }
  lamp(ox0 + 0.5, bw0 - 1.0 - 0.0);
  // the loggia over the yard: boards on beams, two posts, a rail round three sides, a jar of water
  const lg0 = gal[0], lg1 = gal[1], lv0 = cw0 - 1.1;
  B('timber', lg0, lv0, lg1, cw0, y + H - 0.16, Y); col.floor(F.R(gd0, cw0, gd1, cw1 + 0.0), Y); col.floor(F.R(lg0, lv0, lg1, cw0 + 0.02), Y);
  B('wood_dark', lg0 - 0.04, lv0 - 0.03, lg1 + 0.04, lv0 + 0.12, y + H - 0.34, y + H - 0.16);
  for (const u of [lg0 + 0.12, lg1 - 0.12]) { post(u, lv0 + 0.09, y, y + H - 0.16, 0.08); B('limestone', u - 0.14, lv0 - 0.05, u + 0.14, lv0 + 0.23, y - 0.05, y + 0.12); }
  railSeg(lg0 + 0.03, lv0 + 0.03, lg1 - 0.03, lv0 + 0.03, Y); railSeg(lg0 + 0.03, lv0 + 0.03, lg0 + 0.03, cw0 - 0.05, Y); railSeg(lg1 - 0.03, lv0 + 0.03, lg1 - 0.03, cw0 - 0.05, Y);
  { const [x, z] = F.P(lg1 - 0.45, cw0 - 0.35); pot(bag, 'hydria', x, Y, z, { s: 1.1, dark: false }); col.circle(x, z, 0.2, Y, Y + 0.5); }
  void rngAt; void lights; void cellsB; void cw0;
}

/** The route of a visitor from the street to an upper room of this house (local u, v), as the walk-check follows it. */
export function storeyRoute(S, C, L, D, vp0, vq0, cv0, kind, seed) {
  if (S.side === 'back') {
    const pass = C.front.find((c) => c.k === 'passage'), pc = (pass.u0 + pass.u1) / 2, tc = S.tc, tcm = (tc.u0 + tc.u1) / 2;
    const lt = tc.u1 - 1.0, wx = lt - 1.1 > tc.u0 + 0.5 ? tc.u0 + 0.7 : tc.u0 + 0.5;
    return [[pc, -2.5], [pc, 2.0], [pc, cv0 + 0.9], [tcm, vq0 - 0.9], [tcm, vq0 + 1.2], [lt, S.vF - 1.4], [lt, S.vF + 0.5], [wx, S.vF + 0.5], [wx, 11.6]];
  }
  const pass = C.front.find((c) => c.k === 'passage'), pc = (pass.u0 + pass.u1) / 2;
  const fi = S.dir > 0 ? S.s1 - 0.4 : S.s0 + 0.4, ti = S.dir > 0 ? S.s0 + 0.3 : S.s1 - 0.3, cor = kind === 'workshop' ? 7.6 : 8.55, use = useOf(kind, seed);
  const mid = (S.pa + PW / 2), room = (S.cell.u0 + S.cell.u1) / 2;
  return [[pc, -2.5], [pc, 2.0], [pc, 5.0], [pc, cor], [fi, cor], [fi, 6.4], [ti, 6.4], [mid, 6.4], [mid, 4.6], [mid, 3.8], [room, 3.5]];
}
