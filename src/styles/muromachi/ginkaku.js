// The Kannon-den of Jishō-ji (docs/settlements/muromachi-kyoto.md §3): two storeys — the lower in the manner of a
// shoin house, the upper a Zen hall with cusped windows — a pent roof between them, a hip roof of cypress bark with a
// bronze phoenix on the ridge. Bare dark timber: the silver foil was planned and never laid. Built facing +z.
import { STYLES } from '../../core/build.js';
import { local, tatami, quad2, WD, PL, BARK, TM } from './kit.js';

/** A cusped window (katōmado) on the face z = zf, facing +z (s = 1) or −z: a black frame, the paper within. */
export function katomado(T, x, y, zf, w, h, s = 1) {
  const pts = (k) => { const hw = w / 2 * k, o = (1 - k) * h / 2; return [[-hw, o], [hw, o], [hw, o + h * k * 0.55], [hw * 0.55, o + h * k * 0.78], [0, o + h * k], [-hw * 0.55, o + h * k * 0.78], [-hw, o + h * k * 0.55]]; };
  const draw = (mat, k, dz) => { const p = pts(k), t = []; for (let i = 1; i < p.length - 1; i++) { const A = [x + p[0][0], y + p[0][1], zf + s * dz], Bq = [x + p[i][0], y + p[i][1], zf + s * dz], C = [x + p[i + 1][0], y + p[i + 1][1], zf + s * dz]; t.push(...A, ...Bq, ...C, ...A, ...C, ...Bq); } T(mat, t); };
  draw('lacquer_black', 1, 0.05); draw('shoji', 0.8, 0.07);
}

/** A statue of gilt wood on the dais at (x, y, z), s its scale: 'seated' a Buddha on a lotus with a halo (about 0.9 m), 'standing' the Kannon with the high crown and a halo (about 1.7 m). Built of lathes. */
function disc(T, mat, cx, cy, z, r0, r1, n = 22) {
  const t = [];
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, b = (k + 1) / n * Math.PI * 2, P = (r, q) => [cx + r * Math.cos(q), cy + r * Math.sin(q), z]; quad2(t, P(r0, a), P(r1, a), P(r1, b), P(r0, b)); }
  T(mat, t);
}
function buddha(L, B, T, x, y, z, s, kind) {
  const G = 'gilt_bronze';
  L('lotus_leaf', [[0.001, 0], [0.4 * s, 0.01], [0.46 * s, 0.07], [0.4 * s, 0.14], [0.001, 0.15]], 14, x, y, z);
  if (kind === 'seated') {
    L(G, [[0.001, 0.15 * s], [0.38 * s, 0.17 * s], [0.4 * s, 0.3 * s], [0.3 * s, 0.4 * s], [0.001, 0.42 * s]], 14, x, y, z);
    L(G, [[0.3 * s, 0.38 * s], [0.22 * s, 0.7 * s], [0.12 * s, 0.82 * s], [0.001, 0.84 * s]], 12, x, y, z);
    L('skin_light', [[0.001, 0.82 * s], [0.1 * s, 0.84 * s], [0.12 * s, 0.95 * s], [0.08 * s, 1.07 * s], [0.001, 1.1 * s]], 10, x, y, z);
    L('hair_dark', [[0.001, 1.08 * s], [0.08 * s, 1.07 * s], [0.07 * s, 1.14 * s], [0.001, 1.18 * s]], 8, x, y, z);
    disc(T, G, x, y + 0.95 * s, z - 0.12 * s, 0.001, 0.5 * s); disc(T, 'wood_painted', x, y + 0.95 * s, z - 0.12 * s + 0.02, 0.38 * s, 0.46 * s);
  } else {
    L(G, [[0.001, 0.15], [0.18 * s, 0.17], [0.2 * s, 0.9 * s], [0.13 * s, 1.25 * s], [0.1 * s, 1.35 * s], [0.001, 1.38 * s]], 12, x, y, z);
    L('skin_light', [[0.001, 1.3 * s], [0.07 * s, 1.34 * s], [0.08 * s, 1.44 * s], [0.06 * s, 1.52 * s], [0.001, 1.55 * s]], 10, x, y, z);
    L(G, [[0.001, 1.5 * s], [0.07 * s, 1.52 * s], [0.08 * s, 1.62 * s], [0.04 * s, 1.74 * s], [0.001, 1.78 * s]], 8, x, y, z);
    B('wood_painted', x - 0.05, y + 0.9 * s, z + 0.1 * s, x + 0.05, y + 1.0 * s, z + 0.32 * s);
    disc(T, G, x, y + 1.55 * s, z - 0.2 * s, 0.001, 0.62 * s); disc(T, 'wood_painted', x, y + 1.55 * s, z - 0.2 * s + 0.02, 0.5 * s, 0.58 * s);
  }
}


/** A cusped window with depth: stepped lacquered mouldings (architrave, jamb), the paper set back, a lattice of thin bars clipped to its outline, a sill block. Face z = zf, facing +z (s = 1) or −z. */
export function katomadoDeep(T, B, x, y, zf, w, h, s = 1) {
  const out = (k) => { const hw = w / 2 * k, o = (1 - k) * h / 2; return [[-hw, o], [hw, o], [hw, o + h * k * 0.55], [hw * 0.55, o + h * k * 0.78], [0, o + h * k], [-hw * 0.55, o + h * k * 0.78], [-hw, o + h * k * 0.55]]; };
  const V = (p, d) => [x + p[0], y + p[1], zf + s * d];
  const ring = (mat, ka, da, kb, db) => { const A = out(ka), C = out(kb), t = []; for (let i = 0; i < A.length; i++) { const j = (i + 1) % A.length; quad2(t, V(A[i], da), V(A[j], da), V(C[j], db), V(C[i], db)); } T(mat, t); };
  ring('lacquer_black', 1.22, 0.0, 1.22, 0.05);          // the architrave's outer wall
  ring('lacquer_black', 1.22, 0.05, 1.09, 0.05);         // its face
  ring('lacquer_black', 1.09, 0.05, 1.09, 0.11);         // the step
  ring('wood_dark', 1.09, 0.11, 1.0, 0.11);              // the inner moulding
  ring('lacquer_black', 1.0, 0.11, 1.0, 0.03);           // the reveal
  const P = out(1.0), pa = [];
  for (let i = 1; i < P.length - 1; i++) { const a = V(P[0], 0.03), b = V(P[i], 0.03), c = V(P[i + 1], 0.03); pa.push(...a, ...b, ...c, ...a, ...c, ...b); }
  T('shoji', pa);
  // the lattice: vertical and horizontal bars, clipped to the outline
  const hwAt = (yy) => { const q = [[0, w / 2], [h * 0.55, w / 2], [h * 0.78, w / 2 * 0.55], [h, 0]]; for (let i = 0; i < 3; i++) if (yy <= q[i + 1][0]) return q[i][1] + (q[i + 1][1] - q[i][1]) * (yy - q[i][0]) / (q[i + 1][0] - q[i][0]); return 0; };
  const hi = (yy) => Math.min(yy, h - 0.03);
  for (let k = -2; k <= 2; k++) { const u = k * 0.2, top = h * (Math.abs(u) <= w / 2 * 0.55 ? 0.78 + 0.22 * (1 - Math.abs(u) / (w / 2 * 0.55)) : 0.55 + 0.23 * (1 - (Math.abs(u) - w / 2 * 0.55) / (w / 2 * 0.45))); B('wood_dark', x + u - 0.012, y + 0.02, Math.min(zf + s * 0.03, zf + s * 0.06), x + u + 0.012, y + hi(top) - 0.02, Math.max(zf + s * 0.03, zf + s * 0.06)); }
  for (const f of [0.18, 0.36, 0.54, 0.7, 0.84]) { const hwv = hwAt(h * f) - 0.02; B('wood_dark', x - hwv, y + h * f - 0.012, Math.min(zf + s * 0.03, zf + s * 0.06), x + hwv, y + h * f + 0.012, Math.max(zf + s * 0.03, zf + s * 0.06)); }
  B('wood_dark', x - w / 2 - 0.3, y - 0.2, Math.min(zf, zf + s * 0.28), x + w / 2 + 0.3, y - 0.06, Math.max(zf, zf + s * 0.28));    // the sill
  B('lacquer_black', x - w / 2 - 0.26, y - 0.06, Math.min(zf, zf + s * 0.2), x + w / 2 + 0.26, y, Math.max(zf, zf + s * 0.2));
}

/** A pent roof of cypress-bark shingles in courses, concave in section, its eave swept up at the hip corners; the soffit below and the fascia; the height of the eave at s along side k is returned by eave(k, s). Outer rect X, inner rect x. */
function pentCourses(T, [X0, Z0, X1, Z1], [x0, z0, x1, z1], yOut, yIn, lift) {
  const sides = [[[X0, Z1], [X1, Z1], [x1, z1], [x0, z1]], [[X1, Z1], [X1, Z0], [x1, z0], [x1, z1]], [[X1, Z0], [X0, Z0], [x0, z0], [x1, z0]], [[X0, Z0], [X0, Z1], [x0, z1], [x0, z0]]];
  const NC = 16, N = 14, top = [], edge = [], und = [], fas = [], hip = [];
  const eave = (Ls, s) => { const m = Math.min(s, 1 - s) * Ls, q = Math.max(0, 1 - m / 3.4); return yOut + lift * q * q; };
  sides.forEach(([a, b, c, d]) => {
    const Ls = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const Y = (s, t) => { const m = Math.min(s, 1 - s) * Ls, q = Math.max(0, 1 - m / 3.4); return yOut + (yIn - yOut) * Math.pow(1 - t, 1.45) + lift * q * q * t * t; };
    const Pt = (s, t, dy = 0) => [d[0] + (c[0] - d[0]) * s + ((a[0] + (b[0] - a[0]) * s) - (d[0] + (c[0] - d[0]) * s)) * t, Y(s, t) + dy, d[1] + (c[1] - d[1]) * s + ((a[1] + (b[1] - a[1]) * s) - (d[1] + (c[1] - d[1]) * s)) * t];
    for (let k = 0; k < NC; k++) {
      const t0 = k / NC, t1 = (k + 1) / NC, th = 0.05;
      for (let j = 0; j < N; j++) {
        const s0 = j / N, s1 = (j + 1) / N;
        quad2(top, Pt(s0, t0), Pt(s1, t0), Pt(s1, t1, th), Pt(s0, t1, th));
        if (k < NC - 1) quad2(edge, Pt(s0, t1, th), Pt(s1, t1, th), Pt(s1, t1), Pt(s0, t1));
      }
    }
    for (let k = 0; k < 6; k++) for (let j = 0; j < N; j++) { const t0 = k / 6, t1 = (k + 1) / 6, s0 = j / N, s1 = (j + 1) / N; quad2(und, Pt(s0, t0, -0.22), Pt(s1, t0, -0.22), Pt(s1, t1, -0.22), Pt(s0, t1, -0.22)); }
    for (let j = 0; j < N; j++) { const s0 = j / N, s1 = (j + 1) / N; quad2(fas, Pt(s0, 1, -0.22), Pt(s1, 1, -0.22), Pt(s1, 1, 0.05), Pt(s0, 1, 0.05)); }
    // the hip ridge at this side's start corner: a raised cap along the line from the wall to the eave
    for (let k = 0; k < 10; k++) { const t0 = k / 10, t1 = (k + 1) / 10, p0 = Pt(0, t0, 0.09), p1 = Pt(0, t1, 0.09), wd = 0.1, dx = p1[0] - p0[0], dz = p1[2] - p0[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l * wd, nz = dx / l * wd; quad2(hip, [p0[0] - nx, p0[1], p0[2] - nz], [p0[0] + nx, p0[1], p0[2] + nz], [p1[0] + nx, p1[1], p1[2] + nz], [p1[0] - nx, p1[1], p1[2] - nz]); }
  });
  T(BARK, top); T(TM, edge.concat(und, fas, hip));
  return eave;
}
const leafShoji = (B, x0, x1, yb, yt, z0) => {                                  // a sliding shoji leaf on its own track (z0 .. z0 + 0.04): stiles, rails, a boarded foot, the paper and its lattice
  const z1 = z0 + 0.045;
  B('shoji', x0 + 0.03, yb + 0.55, z0 + 0.012, x1 - 0.03, yt - 0.03, z0 + 0.03);
  B(WD, x0, yb, z0, x1, yb + 0.55, z1); B('timber', x0 + 0.04, yb + 0.05, z1, x1 - 0.04, yb + 0.5, z1 + 0.012);
  B(WD, x0, yb, z0, x0 + 0.04, yt, z1); B(WD, x1 - 0.04, yb, z0, x1, yt, z1); B(WD, x0, yt - 0.04, z0, x1, yt, z1); B(WD, x0, yb + 0.55, z0, x1, yb + 0.59, z1);
  const nv = Math.round((x1 - x0) / 0.2), nh = Math.round((yt - yb - 0.6) / 0.3);
  for (let i = 1; i < nv; i++) B(WD, x0 + (x1 - x0) * i / nv - 0.01, yb + 0.59, z0 - 0.005, x0 + (x1 - x0) * i / nv + 0.01, yt - 0.04, z1);
  for (let k = 1; k < nh; k++) B(WD, x0 + 0.04, yb + 0.59 + (yt - yb - 0.63) * k / nh - 0.01, z0 - 0.005, x1 - 0.04, yb + 0.59 + (yt - yb - 0.63) * k / nh + 0.01, z1);
};
const leafBoard = (B, x0, x1, yb, yt, z0) => {                                  // a sliding board door (sugido): cedar boards between a lacquered frame, a mid rail, the pull
  const z1 = z0 + 0.045, n = Math.round((x1 - x0) / 0.15);
  B('wood_painted', x0 + 0.045, yb + 0.045, z0 + 0.015, x1 - 0.045, yt - 0.045, z0 + 0.03);
  for (let i = 1; i < n; i++) B('wood_dark', x0 + (x1 - x0) * i / n - 0.004, yb + 0.05, z0 - 0.004, x0 + (x1 - x0) * i / n + 0.004, yt - 0.05, z0 + 0.04);
  B('lacquer_black', x0, yb, z0, x1, yb + 0.07, z1); B('lacquer_black', x0, yt - 0.07, z0, x1, yt, z1); B('lacquer_black', x0, yb, z0, x0 + 0.06, yt, z1); B('lacquer_black', x1 - 0.06, yb, z0, x1, yt, z1);
  B('lacquer_black', x0, (yb + yt) / 2 - 0.035, z0, x1, (yb + yt) / 2 + 0.035, z1);
  B('gilt_bronze', x1 - 0.2, (yb + yt) / 2 - 0.12, z0 - 0.012, x1 - 0.14, (yb + yt) / 2 - 0.06, z0 + 0.012);
};

function kannonDen(el, ctx) {
  local(el, ctx, ({ bag, col, B, T, L }, y0) => {
    const W = 10.5, D = 8.4, hw = W / 2, hd = D / 2, F = 0.9, H1 = 3.4, H2 = 3.6, yT = y0 + F + H1, yU = yT + H2;
    // the footing: stones under every post, the floor on its joists, the platform closed by a skirt board
    for (let i = 0; i <= 5; i++) for (let j = 0; j <= 4; j++) {
      const x = -hw + i * 2.1, z = -hd + j * 2.1;
      B('granite_block', x - 0.24, y0, z - 0.24, x + 0.24, y0 + 0.38, z + 0.24);
      B(WD, x - 0.11, y0 + 0.38, z - 0.11, x + 0.11, y0 + F + H1, z + 0.11);
    }
    B(TM, -hw - 0.1, y0 + F - 0.3, -hd - 0.1, hw + 0.1, y0 + F, hd + 0.1);
    B(WD, -hw - 0.12, y0 + 0.45, -hd - 0.12, hw + 0.12, y0 + F - 0.3, -hd + 0.01);
    // the walls of the lower floor: plaster between the posts at the back and the sides, lattice shutters on the front
    const y1 = y0 + F;
    B(PL, -hw + 0.1, y1, -hd + 0.04, hw - 0.1, yT - 0.25, -hd + 0.14);
    for (const sx of [-1, 1]) B(PL, sx > 0 ? hw - 0.14 : -hw + 0.04, y1, -hd + 0.1, sx > 0 ? hw - 0.04 : -hw + 0.14, yT - 0.25, hd - 0.1);
    for (let i = 0; i < 5; i++) {
      const xa = -hw + i * 2.1 + 0.12, xb = xa + 1.86, yb = y1 + 0.16, yt = yT - 0.78, mid = (xa + xb) / 2;
      if (i === 2) { /* the doorway: the sliding doors drawn back to either side */ leafShoji(B, xa, xa + 0.62, yb, yt, hd - 0.1); leafShoji(B, xb - 0.62, xb, yb, yt, hd - 0.055); }
      else if (i === 1 || i === 3) { leafShoji(B, xa, mid + 0.05, yb, yt, hd - 0.1); leafShoji(B, mid - 0.05, xb, yb, yt, hd - 0.055); }
      else { leafBoard(B, xa, mid + 0.05, yb, yt, hd - 0.1); leafBoard(B, mid - 0.05, xb, yb, yt, hd - 0.055); }
      // the lintel with its groove, the sill; the transom (ranma) of slats and cross-bars over a dark ground
      B(WD, xa - 0.02, yT - 0.78, hd - 0.14, xb + 0.02, yT - 0.68, hd + 0.04);
      B('lacquer_black', xa, yT - 0.68, hd - 0.1, xb, yT - 0.27, hd - 0.08);
      for (let k = 0; k <= 13; k++) { const x = xa + 0.05 + k * (xb - xa - 0.1) / 13; B(WD, x - 0.014, yT - 0.68, hd - 0.1, x + 0.014, yT - 0.27, hd - 0.03); }
      for (const yy of [yT - 0.68, yT - 0.5, yT - 0.31]) B(WD, xa, yy, hd - 0.1, xb, yy + 0.04, hd - 0.02);
      B('lacquer_black', mid - 0.2, yT - 0.62, hd - 0.03, mid + 0.2, yT - 0.33, hd + 0.0); B('bronze', mid - 0.11, yT - 0.54, hd - 0.02, mid + 0.11, yT - 0.42, hd + 0.035);
      B(WD, xa - 0.02, y1 + 0.04, hd - 0.14, xb + 0.02, y1 + 0.16, hd + 0.04);       // the sill (shikii), its track
    }
    for (let i = 0; i <= 5; i++) B('lacquer_black', -hw + i * 2.1 - 0.13, y1, hd - 0.14, -hw + i * 2.1 + 0.13, yT, hd + 0.02);
    B(WD, -hw - 0.2, yT - 0.25, -hd - 0.2, hw + 0.2, yT, hd + 0.2);                  // the head beam, round
    B(WD, -hw - 0.1, y1 + 2.45, hd - 0.05, hw + 0.1, y1 + 2.52, hd + 0.08);          // the tie beam
    // the verandah along the front, its rail, the steps of three stones
    B(TM, -hw - 0.3, y1 - 0.12, hd, hw + 0.3, y1, hd + 1.5);
    for (let i = 0; i <= 6; i++) { const x = -hw - 0.2 + i * (W + 0.4) / 6; B(WD, x - 0.07, y0 + 0.4, hd + 1.35, x + 0.07, y1 - 0.12, hd + 1.48); }
    for (const [a, b] of [[-hw - 0.3, -1.4], [1.4, hw + 0.3]]) { B('lacquer_black', a, y1 + 0.78, hd + 1.4, b, y1 + 0.86, hd + 1.5); B('lacquer_black', a, y1 + 0.38, hd + 1.42, b, y1 + 0.42, hd + 1.48); for (let x = a + 0.1; x < b; x += 1.0) B('lacquer_black', x - 0.04, y1, hd + 1.4, x + 0.04, y1 + 0.8, hd + 1.48); col.rect([a, hd + 1.38, b, hd + 1.52], y1, y1 + 0.9); }
    for (let k = 0; k < 3; k++) B('granite_block', -1.3, y0 + k * 0.3, hd + 1.5 + (2 - k) * 0.4, 1.3, y0 + (k + 1) * 0.3, hd + 1.5 + (3 - k) * 0.4 + (k === 2 ? 0 : 0));
    col.ramp([-1.3, hd + 1.5, 1.3, hd + 2.7], y0, y1 - 0.12, 'n');
    col.floor([-hw - 0.3, hd, hw + 0.3, hd + 1.5], y1);
    for (const r of [[-hw - 0.3, hd + 1.4, -1.35, hd + 1.5], [1.35, hd + 1.4, hw + 0.3, hd + 1.5], [-hw - 0.3, hd, -hw - 0.2, hd + 1.5], [hw + 0.2, hd, hw + 0.3, hd + 1.5]]) { col.rect(r, y0, y1 - 0.1); B(WD, r[0], y0 + 0.3, r[1], r[2], y1 - 0.12, r[3]); }
    // the walls of the lower floor stand as walls: the doorway in the middle bay is the way in
    col.rect([-hw, -hd, hw, -hd + 0.15], y0, yT); col.rect([-hw, -hd, -hw + 0.15, hd], y0, yT); col.rect([hw - 0.15, -hd, hw, hd], y0, yT);
    col.rect([-hw, hd - 0.12, -0.93, hd], y0, yT); col.rect([0.93, hd - 0.12, hw, hd], y0, yT);
    col.floor([-hw + 0.15, -hd + 0.15, hw - 0.15, hd], y1);
    // the lower room (the Shinkū-den, in the manner of a shoin): mats laid over the room, the altar of the Buddha on its dais against the back
    // wall, the library corner in the north-east, the stair along the west wall
    tatami(B, -hw + 0.2, hw - 0.2, -hd + 0.2, hd - 0.4, y1 + 0.03, true);
    col.floor([-hw + 0.2, -hd + 0.2, hw - 0.2, hd - 0.4], y1 + 0.03);
    B('lacquer_black', -1.9, y1 + 0.03, -hd + 0.15, 1.9, y1 + 0.43, -hd + 1.55); B('wood_painted', -1.9, y1 + 0.43, -hd + 0.15, 1.9, y1 + 0.47, -hd + 1.55);
    B('lacquer_black', -0.9, y1 + 0.47, -hd + 0.2, 0.9, y1 + 2.0, -hd + 0.28);                                        // the shrine's back panel
    for (const sx of [-1, 1]) { B('lacquer_black', sx * 0.9 - 0.05, y1 + 0.47, -hd + 0.2, sx * 0.9 + 0.05, y1 + 2.3, -hd + 1.0); }
    B('lacquer_black', -1.0, y1 + 2.25, -hd + 0.2, 1.0, y1 + 2.35, -hd + 1.05); B('gilt_bronze', -0.95, y1 + 2.2, -hd + 0.98, 0.95, y1 + 2.24, -hd + 1.02);
    buddha(L, B, T, 0, y1 + 0.47, -hd + 0.6, 0.62, 'seated');
    for (const sx of [-1, 1]) { L('bronze', [[0.001, 0], [0.12, 0], [0.1, 0.1], [0.14, 0.3], [0.001, 0.32]], 10, sx * 1.4, y1 + 0.47, -hd + 0.9); B('lacquer_black', sx * 1.4 - 0.18, y1 + 0.03, -hd + 1.7, sx * 1.4 + 0.18, y1 + 0.6, -hd + 2.05); L('bronze', [[0.001, 0], [0.14, 0], [0.16, 0.08], [0.001, 0.1]], 10, sx * 1.4, y1 + 0.6, -hd + 1.87); }
    B('lacquer_black', -0.45, y1 + 0.03, -hd + 2.0, 0.45, y1 + 0.5, -hd + 2.5); L('bronze', [[0.001, 0], [0.12, 0], [0.14, 0.06], [0.001, 0.08]], 10, 0, y1 + 0.5, -hd + 2.25);   // the offering table and its incense burner
    // the library corner: a writing desk under the window and the books on a shelf, the corner the pond's light reaches
    B(WD, hw - 2.4, y1 + 0.03, -hd + 0.2, hw - 0.3, y1 + 0.35, -hd + 1.1); B('paint_white', hw - 2.1, y1 + 0.35, -hd + 0.35, hw - 1.5, y1 + 0.37, -hd + 0.95);
    B(WD, hw - 0.5, y1 + 0.03, -hd + 1.4, hw - 0.2, y1 + 1.6, -hd + 3.0); for (let k = 0; k < 4; k++) B(WD, hw - 0.5, y1 + 0.4 + k * 0.35, -hd + 1.4, hw - 0.2, y1 + 0.43 + k * 0.35, -hd + 3.0);
    for (let k = 0; k < 3; k++) for (let j = 0; j < 5; j++) B('paint_white', hw - 0.45, y1 + 0.43 + k * 0.35, -hd + 1.5 + j * 0.28, hw - 0.28, y1 + 0.43 + k * 0.35 + 0.2, -hd + 1.7 + j * 0.28);
    col.rect([hw - 0.5, -hd + 1.4, hw - 0.2, -hd + 3.0], y1, y1 + 1.6); col.rect([-1.9, -hd + 0.15, 1.9, -hd + 1.55], y1, y1 + 2.4);
    // the stair (the ladder-stair of such halls, laid gently here): from the east wall of the room up to the west, its mouth in the upper floor
    const sz0 = 0.5, sz1 = 1.7, sxa = hw - 0.3, sxb = -0.8, n = 14, rise = (yT - y1) / n, run = (sxa - sxb) / n;
    for (let k = 0; k < n; k++) B(TM, sxa - (k + 1) * run, y1 + 0.03, sz0, sxa - k * run, y1 + (k + 1) * rise, sz1);
    for (const z of [sz0 - 0.05, sz1 + 0.05]) { B('lacquer_black', sxb, y1 + 0.4, z - 0.03, sxa, y1 + 0.46, z + 0.03); for (let k = 0; k <= n; k += 2) B('lacquer_black', sxa - k * run - 0.03, y1 + k * rise + 0.46, z - 0.03, sxa - k * run + 0.03, y1 + k * rise + 1.0, z + 0.03); B('lacquer_black', sxb, y1 + 1.0 + (yT - y1) - 0.5, z - 0.03, sxa, y1 + 1.0 + 0.0, z + 0.03); }
    col.ramp([sxb, sz0, sxa, sz1], y1, yT, 'w');
    // the ceiling of boards, open over the stair
    { const hx0 = -0.7, hx1 = 2.5, hz0 = 0.4, hz1 = 1.8, cy = yT - 0.12;
      B(TM, -hw, cy, -hd, hw, yT, hz0); B(TM, -hw, cy, hz1, hw, yT, hd); B(TM, -hw, cy, hz0, hx0, yT, hz1); B(TM, hx1, cy, hz0, hw, yT, hz1);
      for (let x = -hw + 1.05; x < hw; x += 2.1) B(WD, x - 0.07, cy - 0.14, -hd, x + 0.07, cy, hd); }
    // the upper room is reached by the stair; its floor has the stair's mouth
    const ux = 3.15, uz = 2.1;
    for (const r of [[-ux, -uz, ux, 0.4], [-ux, 1.8, ux, uz], [-ux, 0.4, -0.7, 1.8], [2.5, 0.4, ux, 1.8]]) B(TM, r[0], yT - 0.15, r[1], r[2], yT, r[3]);
    for (const r of [[-ux + 0.1, -uz + 0.1, ux - 0.1, 0.4], [-ux + 0.1, 1.8, ux - 0.1, uz - 0.1], [-ux + 0.1, 0.4, -0.7, 1.8], [2.5, 0.4, ux - 0.1, 1.8]]) col.floor(r, yT);
    col.rect([-ux, -uz, ux, -uz + 0.18], yT, yU); col.rect([-ux, -uz, -ux + 0.18, uz], yT, yU); col.rect([ux - 0.18, -uz, ux, uz], yT, yU); col.rect([-ux, uz - 0.18, ux, uz], yT, yU);
    // the pent roof's mass outside the upper room, and the upper roof
    for (const r of [[-hw - 1.3, uz, hw + 1.3, hd + 1.3], [-hw - 1.3, -hd - 1.3, hw + 1.3, -uz], [-hw - 1.3, -uz, -ux, uz], [ux, -uz, hw + 1.3, uz]]) col.rect(r, yT + 0.05, yT + 1.4);
    col.rect([-ux - 1.3, -uz - 1.3, ux + 1.3, uz + 1.3], yU, yU + 4);
    // the pent roof between the floors, the upper floor of 3 × 2 bays on the lower ceiling
    const eaveY = pentCourses(T, [-hw - 1.3, -hd - 1.3, hw + 1.3, hd + 1.3], [-ux - 0.15, -uz - 0.15, ux + 0.15, uz + 0.15], yT + 0.05, yT + 1.35, 0.42);
    // the rafter ends along the eave (they rise with it toward the corners)
    { const X = hw + 1.3, Z = hd + 1.3, ez = (L, s) => eaveY(L, s) - 0.32;
      for (let x = -X + 0.6; x <= X - 0.5; x += 0.55) { const y = ez(2 * X, (x + X) / (2 * X)); B(WD, x - 0.05, y, Z - 0.34, x + 0.05, y + 0.2, Z + 0.04); B(WD, x - 0.05, y, -Z - 0.04, x + 0.05, y + 0.2, -Z + 0.34); }
      for (let z = -Z + 0.6; z <= Z - 0.5; z += 0.55) { const y = ez(2 * Z, (z + Z) / (2 * Z)); B(WD, X - 0.34, y, z - 0.05, X + 0.04, y + 0.2, z + 0.05); B(WD, -X - 0.04, y, z - 0.05, -X + 0.34, y + 0.2, z + 0.05); } }
    // the upper room's walls (thin, so that it can be entered), posts outside them
    B(WD, -ux, yT, uz - 0.16, ux, yU - 0.3, uz); B(WD, -ux, yT, -uz, ux, yU - 0.3, -uz + 0.16); B(WD, -ux, yT, -uz, -ux + 0.16, yU - 0.3, uz); B(WD, ux - 0.16, yT, -uz, ux, yU - 0.3, uz);
    for (let i = 0; i <= 3; i++) B('lacquer_black', -ux + i * 2.1 - 0.1, yT, uz - 0.02, -ux + i * 2.1 + 0.1, yU, uz + 0.06);
    for (const sx of [-1, 1]) for (let j = 0; j <= 2; j++) B('lacquer_black', sx * ux - 0.1 + (sx > 0 ? 0.06 : -0.06), yT, -uz + j * 2.1 - 0.1, sx * ux + 0.1 + (sx > 0 ? 0.06 : -0.06), yU, -uz + j * 2.1 + 0.1);
    B(PL, -ux + 0.1, yT + 1.1, uz, ux - 0.1, yU - 0.3, uz + 0.04);
    B(PL, -ux + 0.1, yT + 1.1, -uz - 0.04, ux - 0.1, yU - 0.3, -uz);
    B(WD, -ux - 0.12, yU - 0.3, -uz - 0.12, ux + 0.12, yU, uz + 0.12);
    // inside: the Kannon on its dais against the back wall, the offering table, lamps, a mat before it; the cusped windows seen from within
    B('lacquer_black', -1.0, yT, -uz + 0.2, 1.0, yT + 0.35, -uz + 1.5); B('wood_painted', -1.0, yT + 0.35, -uz + 0.2, 1.0, yT + 0.4, -uz + 1.5);
    buddha(L, B, T, 0, yT + 0.4, -uz + 0.85, 1.0, 'standing');
    B('lacquer_black', -0.5, yT, -uz + 1.9, 0.5, yT + 0.55, -uz + 2.35); L('bronze', [[0.001, 0], [0.12, 0], [0.14, 0.06], [0.001, 0.08]], 10, 0, yT + 0.55, -uz + 2.12);
    for (const sx of [-1, 1]) { B('lacquer_black', sx * 0.8 - 0.12, yT, -uz + 1.9, sx * 0.8 + 0.12, yT + 0.45, -uz + 2.14); L('lamp_paper', [[0.001, 0], [0.1, 0.04], [0.12, 0.14], [0.001, 0.2]], 8, sx * 0.8, yT + 0.45, -uz + 2.02); }
    for (const x of [-2.1, 0, 2.1]) katomado(T, x, yT + 1.35, uz - 0.16, 1.1, 1.7, -1);
    katomado(T, 0, yT + 1.35, -uz + 0.16, 1.1, 1.7, 1);
    // the cusped windows: three on the front, one at each side
    for (const x of [-2.1, 0, 2.1]) katomadoDeep(T, B, x, yT + 1.35, uz + 0.04, 1.1, 1.7);
    katomadoDeep(T, B, 0, yT + 1.35, -uz - 0.04, 1.1, 1.7, -1);
    // the upper storey's bracket sets (kara-yō / Zen style, the "Kara style" of the upper floor — docs §10b): on the head beam, a block, a
    // first arm with its cross arms, a second block and a second arm bearing the purlin that runs round the building; plaster between
    // them; the eave's rafters in two rows beyond. The roof stands on them, so it is raised the height of the sets.
    const yR = yU + 0.95, bk = 'lacquer_black', zf = uz + 0.12, xf = ux + 0.12;
    B(PL, -ux - 0.1, yU, uz - 0.02, ux + 0.1, yU + 1.3, uz + 0.08); B(PL, -ux - 0.1, yU, -uz - 0.08, ux + 0.1, yU + 1.3, -uz + 0.02);
    B(PL, -ux - 0.08, yU, -uz, -ux + 0.02, yU + 1.3, uz); B(PL, ux - 0.02, yU, -uz, ux + 0.08, yU + 1.3, uz);
    const set = (c, f, alongX) => {                                    // c along the face, f the face's distance from the centre (signed: which side)
      const sg = Math.sign(f), a = Math.abs(f);
      const box = (u0, y0_, v0, u1, y1_, v1) => alongX ? B(bk, c + u0, y0_, sg * (a + v0), c + u1, y1_, sg * (a + v1)) : B(bk, sg * (a + v0), y0_, c + u0, sg * (a + v1), y1_, c + u1);
      box(-0.14, yU, -0.02, 0.14, yU + 0.14, 0.2);                       // the cap block on the beam
      box(-0.07, yU + 0.14, -0.1, 0.07, yU + 0.27, 0.52); box(-0.42, yU + 0.14, -0.02, 0.42, yU + 0.27, 0.1);        // the first arm and its cross arm
      box(-0.11, yU + 0.27, 0.36, 0.11, yU + 0.41, 0.58); box(-0.09, yU + 0.27, -0.02, 0.09, yU + 0.41, 0.1);        // the second block, a block on the cross arm
      box(-0.06, yU + 0.41, 0.0, 0.06, yU + 0.52, 0.86); box(-0.46, yU + 0.41, -0.02, 0.46, yU + 0.52, 0.1);        // the second arm and its cross arm
    };
    for (let i = 0; i <= 3; i++) set(-ux + i * 2.1, zf, true), set(-ux + i * 2.1, -zf, true);
    for (let i = 0; i < 3; i++) set(-ux + 1.05 + i * 2.1, zf, true), set(-ux + 1.05 + i * 2.1, -zf, true);
    for (let j = 0; j <= 2; j++) set(-uz + j * 2.1, xf, false), set(-uz + j * 2.1, -xf, false);
    for (let j = 0; j < 2; j++) set(-uz + 1.05 + j * 2.1, xf, false), set(-uz + 1.05 + j * 2.1, -xf, false);
    const pu = 0.86;                                                  // the purlin (keta) on the second arms, all round; its end blocks at the corners
    B(bk, -ux - 0.5, yU + 0.5, zf + pu - 0.1, ux + 0.5, yU + 0.62, zf + pu + 0.08); B(bk, -ux - 0.5, yU + 0.5, -zf - pu - 0.08, ux + 0.5, yU + 0.62, -zf - pu + 0.1);
    B(bk, xf + pu - 0.1, yU + 0.5, -uz - 0.5, xf + pu + 0.08, yU + 0.62, uz + 0.5); B(bk, -xf - pu - 0.08, yU + 0.5, -uz - 0.5, -xf - pu + 0.1, yU + 0.62, uz + 0.5);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(bk, sx * xf - 0.17, yU, sz * zf - 0.17, sx * xf + 0.17, yU + 0.27, sz * zf + 0.17);
    // the rafters: a lower row from the purlin to the eave, spaced as the bays, the ends of the upper row between them
    for (let x = -ux - 0.9; x <= ux + 0.9; x += 0.26) for (const sz of [-1, 1]) { B(WD, x - 0.035, yR - 0.4, sz * (uz + 0.12 + pu - 0.05) - (sz < 0 ? 0.29 : 0), x + 0.035, yR - 0.31, sz * (uz + 0.12 + pu - 0.05) + (sz > 0 ? 0.29 : 0)); }
    for (let z = -uz - 0.9; z <= uz + 0.9; z += 0.26) for (const sx of [-1, 1]) { B(WD, sx * (ux + 0.12 + pu - 0.05) - (sx < 0 ? 0.29 : 0), yR - 0.4, z - 0.035, sx * (ux + 0.12 + pu - 0.05) + (sx > 0 ? 0.29 : 0), yR - 0.31, z + 0.035); }
    // the upper hip roof on the sets, the phoenix on the ridge
    const R = 3.2;
    STYLES.japanese.elements.irimoya({ c: [0, 0], A: ux + 1.25, B: uz + 1.25, y: yR, rise: R, lift: 0.75, gable: 1, mat: BARK, soffit: TM }, { bag, col });
    const phx = STYLES.japanese.objects?.phoenix;
    B('gilt_bronze', -0.3, yR + R - 0.05, -0.3, 0.3, yR + R + 0.25, 0.3);
    phx?.({ at: [0, 0], y: yR + R + 0.25, dir: [0, 1] }, { bag, col });
  });
}
export const ginkakuElements = { kannon_den: kannonDen };
