// Civic fabric of Fez (docs/settlements/fez.md §5): the river between its quays and its bridges, the wall and its gates, a funduq,
// a quarter mosque, the Dar al-Magana with its row of consoles, the covered bridge (sabat) over the street, a wall fountain.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { face, holedWall, archHead, dbl, rng, q4, dado, dadoFlat, stucco, canopy, door, basin, gable, screen } from './kit.js';
import { minaret } from './minaret.js';
import { archRunLite } from './madrasa.js';
import * as F from '../mughal/furnish.js';

// ——— the river: el.pts [[x, z]] the centre line, w, bed, water, top (quay level)
export function river(el, { bag, col }) {
  const P = el.pts, hw = el.w / 2, tr = [];
  const side = (i, s) => { const a = P[i], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1; return [a[0] - dz / L * s, a[1] + dx / L * s]; };
  for (let i = 0; i + 1 < P.length; i++) {
    const a = P[i], b = P[i + 1];
    for (const s of [-1, 1]) {
      const p0 = side(i, s * (hw + 0.4)), p1 = side(i + 1, s * (hw + 0.4));
      bag.add('limestone', orientedBox(p0, p1, 0.8, el.bed - 0.2, el.top, 0.05));
      // the quay's coping and a course of larger stones
      bag.add('sandstone', orientedBox(side(i, s * (hw + 0.4)), side(i + 1, s * (hw + 0.4)), 1.0, el.top - 0.12, el.top + 0.02, 0.05));
    }
    const A = side(i, -hw), B = side(i, hw), C = side(i + 1, hw), D = side(i + 1, -hw), y = el.water;
    q4(tr, [A[0], y, A[1]], [B[0], y, B[1]], [C[0], y, C[1]], [D[0], y, D[1]]);
    // the bed
    bag.add('silt', fromTriangles([A[0], el.bed, A[1], B[0], el.bed, B[1], C[0], el.bed, C[1], A[0], el.bed, A[1], C[0], el.bed, C[1], D[0], el.bed, D[1]].reduce((o, v) => o.concat(v), [])));
    void a; void b;
  }
  bag.add('water', fromTriangles(tr));
}
/** fez_bridge: { x, z, w (deck), span (the river's width), y } — a stone footbridge of one arch on the quays. */
export function bridge(el, { bag, col }) {
  const { x, z, w, span, y } = el, hw = w / 2, L = span + 3.2, z0 = z - L / 2, z1 = z + L / 2;
  bag.add('limestone', box(x - hw, y - 0.55, z0, x + hw, y, z1)); col.floor([x - hw, z0, x + hw, z1], y);
  for (const s of [-1, 1]) { const xx = s < 0 ? x - hw : x + hw - 0.3; bag.add('limestone', box(xx, y, z0, xx + 0.3, y + 0.75, z1)); col.rect([xx, z0, xx + 0.3, z1], y, y + 0.75); bag.add('sandstone', box(xx - 0.04, y + 0.75, z0, xx + 0.34, y + 0.82, z1)); }
  // the arch under the deck: voussoirs of dark and pale stone on both faces
  const r = span / 2 - 0.2, N = 12;
  for (const s of [-1, 1]) { const xx = x + s * (hw + 0.02); for (let k = 0; k < N; k++) { const t = Math.PI * (k + 0.5) / N, zc = z - Math.cos(t) * r, yc = y - 0.55 + 0.0 - 0.2 + Math.sin(t) * 0.9; bag.add(k % 2 ? 'marble_dark' : 'limestone', box(Math.min(xx, xx + s * 0.06), yc - 0.14, zc - 0.17, Math.max(xx, xx + s * 0.06), yc + 0.14, zc + 0.17)); } }
}
/** The city wall: el.pts [[x, z, y]] a closed or open run, th, h; merlons; towers every `tower` points; the gaps are left by the plan. */
export function wall(el, { bag, col }) {
  const P = el.pts, th = el.th ?? 2.0, h = el.h ?? 7.5, mat = el.mat ?? 'mud_plaster';
  for (let i = 0; i + 1 < P.length; i++) {
    const a = P[i], b = P[i + 1], y = Math.max(a[2], b[2]), y0 = Math.min(a[2], b[2]) - 2.5;
    bag.add(mat, orientedBox([a[0], a[1]], [b[0], b[1]], th, y0, y + h, 0.04));
    col.segment([a[0], a[1]], [b[0], b[1]], th, y0, y + h);
    // the wall-walk's parapet merlons on both sides, every 1.5 m
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.floor(L / 1.5);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n; const px = a[0] + (b[0] - a[0]) * t, pz = a[1] + (b[1] - a[1]) * t, yy = a[2] + (b[2] - a[2]) * t, top = Math.max(y, yy) + h;
      for (const s of [-1, 1]) { const qx = px - uz * s * (th / 2 - 0.2), qz = pz + ux * s * (th / 2 - 0.2); bag.add(mat, orientedBox([qx - ux * 0.4, qz - uz * 0.4], [qx + ux * 0.4, qz + uz * 0.4], 0.4, top, top + 0.9, 0)); }
    }
    if (el.towers && i % el.towers === 0) { const T = 3.2; bag.add(mat, box(a[0] - T, a[2] - 2.5, a[1] - T, a[0] + T, a[2] + h + 3.0, a[1] + T)); col.rect([a[0] - T, a[1] - T, a[0] + T, a[1] + T], a[2] - 2.5, a[2] + h + 3); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(mat, box(a[0] + dx * T - 0.45, a[2] + h + 3.0, a[1] + dz * T - 0.45, a[0] + dx * T + 0.45, a[2] + h + 3.9, a[1] + dz * T + 0.45)); }
  }
}
/** fez_gate: { at, axis ('x': the passage runs along x), y } — twin towers over a vaulted passage in the wall, a horseshoe arch, a green-tiled hood. */
export function gate(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y, ax = el.axis === 'x', len = 8.0, wd = 14, hw = 1.7, mat = 'mud_plaster';
  const r = ax ? [cx - len / 2, cz - wd / 2, cx + len / 2, cz + wd / 2] : [cx - wd / 2, cz - len / 2, cx + wd / 2, cz + len / 2], H = 10.5;
  const hole = [[(ax ? cz : cx) - hw, (ax ? cz : cx) + hw, y, y + 4.4]];
  holedWall(bag, col, mat, r, y - 2.5, y + H, hole, !ax);
  for (const [at, n] of ax ? [[r[0], -1], [r[2], 1]] : [[r[1], -1], [r[3], 1]]) {
    const f = face(ax ? 'x' : 'z', at, -n);
    archHead(bag, f, (ax ? cz : cx) - hw, (ax ? cz : cx) + hw, y + 2.9, y + 4.4, 0.8, 'horseshoe', { alfiz: true, side: 'near' });
    const R = f.R(0, 0.1, (ax ? cz : cx) - hw - 0.7, (ax ? cz : cx) + hw + 0.7); bag.add('stucco_cream', box(R[0], y + 4.5, R[1], R[2], y + 5.0, R[3]));
  }
  // the vault's floor of cobbles and the towers' merlons
  bag.add('brick_paving', box(r[0], y - 0.3, ax ? cz - hw : r[1], r[2], y, ax ? cz + hw : r[3])); col.floor(ax ? [r[0], cz - hw, r[2], cz + hw] : [cx - hw, r[1], cx + hw, r[3]], y);
  for (let k = 0; k < 6; k++) { const u = k / 5; bag.add(mat, ax ? box(r[0] + u * (len - 0.9), y + H, r[1], r[0] + u * (len - 0.9) + 0.9, y + H + 0.9, r[1] + 0.5) : box(r[0], y + H, r[1] + u * (len - 0.9), r[0] + 0.5, y + H + 0.9, r[1] + u * (len - 0.9) + 0.9)); }
}
/** The Dar al-Magana: the house on the Talaa Kebira's north side with a row of 13 carved cedar consoles (once carrying bronze bowls), twelve windows in stucco frames, two rows of corbels, a cedar eave with green tiles. face 's'. */
export function darMagana(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = 10.6, f = face('z', z1, 1);
  bag.add('stucco_ochre', box(x0, y - 1.0, z0, x1, y + H + 0.9, z1)); col.rect(el.rect, y - 1, y + H + 0.9);
  const n = 13, L = x1 - x0 - 1.0, step = L / (n - 1), u = (i) => x0 + 0.5 + i * step;
  // the consoles: carved cedar, in profile three stepped corbels, each carrying a bronze bowl
  for (let i = 0; i < n; i++) {
    const R = f.R(0, 0.45, u(i) - 0.15, u(i) + 0.15); bag.add('cedar', box(R[0], y + 3.55, R[1], R[2], y + 3.95, R[3]));
    const R2 = f.R(0, 0.3, u(i) - 0.13, u(i) + 0.13); bag.add('cedar', box(R2[0], y + 3.15, R2[1], R2[2], y + 3.55, R2[3]));
    const R3 = f.R(0, 0.15, u(i) - 0.11, u(i) + 0.11); bag.add('cedar', box(R3[0], y + 2.8, R3[1], R3[2], y + 3.15, R3[3]));
    const [bx, bz] = f.P(u(i), 0, 0.28).filter((v, k) => k !== 1); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.0], [0.19, 0.09], [0.21, 0.13], [0.001, 0.1]], 10, null, bx, y + 3.95, bz));
  }
  // twelve windows between them, in stucco frames, lattice-closed
  for (let i = 0; i < n - 1; i++) { const uc = (u(i) + u(i + 1)) / 2; const fr = f.R(0, 0.07, uc - 0.5, uc + 0.5); bag.add('stucco_cream', box(fr[0], y + 4.4, fr[1], fr[2], y + 6.9, fr[3])); const o = f.R(0.07, 0.1, uc - 0.38, uc + 0.38); bag.add('opening', box(o[0], y + 4.6, o[1], o[2], y + 6.6, o[3])); const g = f.R(0.1, 0.14, uc - 0.4, uc + 0.4); bag.add('lattice', box(g[0], y + 4.6, g[1], g[2], y + 6.6, g[3])); }
  for (const yy of [7.4, 8.6]) for (let x = x0 + 0.3; x < x1 - 0.3; x += 0.5) { const R = f.R(0, 0.35, x, x + 0.18); bag.add('cedar', box(R[0], y + yy, R[1], R[2], y + yy + 0.25, R[3])); }
  canopy(bag, f, x0 + 0.2, x1 - 0.2, y + H - 1.2, 0.9);
  stucco(bag, f, x0 + 0.2, x1 - 0.2, y + 0.8, y + 2.7, [], { cell: 0.38, cornice: false });
  const d = f.R(0, 0.12, (x0 + x1) / 2 - 0.8, (x0 + x1) / 2 + 0.8); bag.add('opening', box(d[0], y, d[1], d[2], y + 2.4, d[3]));
}
/** A covered bridge (sabat) over a lane: rect = the lane's width and the span between the two houses; clear = the height of the soffit. */
export function sabat(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, clear = el.clear ?? 4.4, top = y + clear + 3.2;
  bag.add('cedar', box(x0, y + clear - 0.45, z0, x1, y + clear, z1));
  const alongX = (x1 - x0) > (z1 - z0), n = Math.floor((alongX ? x1 - x0 : z1 - z0) / 0.6);
  for (let i = 0; i <= n; i++) { const u = (alongX ? x0 : z0) + (alongX ? x1 - x0 : z1 - z0) * i / n; bag.add('wood_dark', alongX ? box(u - 0.07, y + clear - 0.65, z0, u + 0.07, y + clear - 0.45, z1) : box(x0, y + clear - 0.65, u - 0.07, x1, y + clear - 0.45, u + 0.07)); }
  bag.add('stucco_ochre', box(x0, y + clear, z0, x1, top, z1)); col.rect(el.rect, y + clear - 0.65, top);
  bag.add('plaster_white', box(x0 - 0.05, top, z0 - 0.05, x1 + 0.05, top + 0.25, z1 + 0.05));
  for (const f of alongX ? [face('z', z0, -1), face('z', z1, 1)] : [face('x', x0, -1), face('x', x1, 1)]) { const m = alongX ? (x0 + x1) / 2 : (z0 + z1) / 2, R = f.R(0, 0.05, m - 0.4, m + 0.4); bag.add('opening', box(R[0], y + clear + 1.1, R[1], R[2], y + clear + 2.4, R[3])); const g = f.R(0.05, 0.1, m - 0.45, m + 0.45); bag.add('lattice', box(g[0], y + clear + 1.05, g[1], g[2], y + clear + 2.45, g[3])); }
}
/** A wall fountain: a niche in the wall's face with a zellij panel, a stucco arch, a carved cedar lintel under a small green-tiled hood, a basin below. face of the wall ('n' = the wall stands north of the lane). */
export function fountain(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, e = el.face, f = e === 's' ? face('z', z, 1) : e === 'n' ? face('z', z, -1) : e === 'e' ? face('x', x, 1) : face('x', x, -1);
  const u = f.ax === 'z' ? x : z, hw = 0.6;
  const fr = f.R(0, 0.07, u - hw - 0.2, u + hw + 0.2); bag.add('stucco_cream', box(fr[0], y + 0.3, fr[1], fr[2], y + 2.7, fr[3]));
  const g = f.R(0.07, 0.1, u - hw, u + hw); bag.add('tile_turquoise', box(g[0], y + 0.4, g[1], g[2], y + 2.2, g[3]));
  const o = f.R(0.1, 0.13, u - 0.3, u + 0.3); bag.add('tile_cream', box(o[0], y + 0.9, o[1], o[2], y + 1.7, o[3]));
  canopy(bag, f, u - hw - 0.3, u + hw + 0.3, y + 2.8, 0.6, { rise: 0.35 });
  const b = f.R(0.1, 0.65, u - hw, u + hw); bag.add('marble_smooth', box(b[0], y, b[1], b[2], y + 0.45, b[3])); col.rect(b, y, y + 0.45);
  const w = f.R(0.14, 0.6, u - hw + 0.08, u + hw - 0.08); bag.add('water', box(w[0], y + 0.3, w[1], w[2], y + 0.42, w[3]));
  const sp = f.P(u, y + 0.9, 0.12); bag.add('bronze', rod([sp[0], sp[1], sp[2]], [sp[0] + f.n * (f.ax === 'x' ? 0.18 : 0), sp[1] - 0.05, sp[2] + f.n * (f.ax === 'z' ? 0.18 : 0)], 0.025, 4));
}
/** A funduq (merchants' inn): a portal on the street, a passage into a court with a basin, galleries on three floors in cedar, stores and stables below. face 's'. */
export function funduq(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 31), t = 0.8, G = 2.6, RG = 3.2, H1 = 4.2, H2 = 3.3, HT = H1 + 2 * H2, cx = (x0 + x1) / 2;
  const court = [x0 + t + G + RG - G, z0 + t + G + RG - G, x1 - t - RG, z1 - t - RG - 3.4], ring = [court[0] - G, court[1] - G, court[2] + G, court[3] + G];
  const fS = face('z', z1, 1), pw = [cx - 1.7, cx + 1.7];
  // the building: a mass minus the court and gallery ring, and the passage
  const passage = [pw[0], ring[3], pw[1], z1];
  const { subtractRects } = SUB;
  for (const p of subtractRects(el.rect, [ring, passage])) { bag.add('stucco_ochre', box(p[0], y - 0.8, p[1], p[2], y + HT, p[3])); col.rect(p, y - 0.8, y + HT); }
  // the portal: horseshoe arch in an alfiz, jambs of dressed stone, a cedar canopy under green tiles; the passage's floor and ceiling
  archHead(bag, fS, pw[0], pw[1], y + 2.9, y + 4.5, ring[3] - z1 > 0 ? 0.8 : 0.8, 'horseshoe', { alfiz: true, alfizUp: 0.6, side: 'near' });
  bag.add('opening', box(pw[0], y, z1 - 0.01, pw[1], y + 0.02, z1 + 0.0));
  stucco(bag, fS, pw[0] - 1.2, pw[1] + 1.2, y + 5.1, y + 7.4, [], { cell: 0.36 });
  canopy(bag, fS, pw[0] - 1.6, pw[1] + 1.6, y + 7.9, 1.3);
  bag.add('flagstone', box(pw[0], y - 0.3, ring[3], pw[1], y, z1)); col.floor(passage, y);
  bag.add('cedar', box(pw[0], y + 3.6, ring[3], pw[1], y + 3.75, z1));
  // the court: flags, a basin, troughs for the animals
  bag.add('flagstone', box(ring[0], y - 0.3, ring[1], ring[2], y, ring[3])); col.floor(ring, y);
  basin(bag, col, (court[0] + court[2]) / 2, (court[1] + court[3]) / 2, y, 1.3);
  for (const s of [-1, 1]) { const x = (court[0] + court[2]) / 2 + s * 5.6, z = (court[1] + court[3]) / 2; bag.add('limestone', box(x - 0.4, y, z - 1.2, x + 0.4, y + 0.5, z + 1.2)); bag.add('water', box(x - 0.3, y + 0.46, z - 1.1, x + 0.3, y + 0.5, z + 1.1)); col.rect([x - 0.4, z - 1.2, x + 0.4, z + 1.2], y, y + 0.5); }
  // piers on the court's rim, the gallery floors and cedar balustrades on the two upper floors, the stores' arched doors on the walls behind
  const xs = [], zs = [], nx = Math.round((ring[2] - ring[0]) / 3.4), nz = Math.round((ring[3] - ring[1]) / 3.4);
  for (let i = 0; i <= nx; i++) xs.push(ring[0] + (ring[2] - ring[0]) * i / nx); for (let i = 0; i <= nz; i++) zs.push(ring[1] + (ring[3] - ring[1]) * i / nz);
  const pier = (px, pz) => { bag.add('stucco_cream', box(px - 0.3, y, pz - 0.3, px + 0.3, y + HT - H2 * 0.0 - 1.0, pz + 0.3)); col.rect([px - 0.3, pz - 0.3, px + 0.3, pz + 0.3], y, y + HT); bag.add('tile_turquoise', box(px - 0.32, y + 0.02, pz - 0.32, px + 0.32, y + 1.4, pz + 0.32)); };
  for (const x of xs) { pier(x, ring[1] + 0.3); } for (const z of zs.slice(1, -1)) { pier(ring[0] + 0.3, z); pier(ring[2] - 0.3, z); }
  const inner = [[court[0], court[1], court[2], court[3]]];
  for (let k = 1; k <= 2; k++) {
    const yk = y + H1 + H2 * (k - 1);
    // gallery floors over the ring, the court's edge left open
    for (const r of [[ring[0], ring[1], ring[2], court[1]], [ring[0], court[1], court[0], ring[3]], [court[2], court[1], ring[2], ring[3]]]) { bag.add('cedar', box(r[0], yk - 0.45, r[1], r[2], yk, r[3])); }
    for (const [a, b, fixed, alongX] of [[court[0], court[2], court[1], true], [court[1], court[3], court[0], false], [court[1], court[3], court[2], false]]) {
      const R = alongX ? [a, fixed - 0.04, b, fixed + 0.04] : [fixed - 0.04, a, fixed + 0.04, b];
      bag.add('lattice', box(R[0], yk, R[1], R[2], yk + 1.0, R[3])); bag.add('cedar', box(R[0] - 0.02, yk + 0.96, R[1] - 0.02, R[2] + 0.02, yk + 1.04, R[3] + 0.02));
    }
  }
  // the doors of the stores (dark, arched) on the court's walls, windows over them
  for (const [f, a, b] of [[face('z', ring[1], 1), ring[0] + 2, ring[2] - 2], [face('x', ring[0], 1), ring[1] + 2, ring[3] - 2], [face('x', ring[2], -1), ring[1] + 2, ring[3] - 2]]) {
    for (let u = a; u < b - 1; u += 3.4) { const R = f.R(0, 0.06, u - 0.9, u + 0.9); bag.add('opening', box(R[0], y, R[1], R[2], y + 2.7, R[3])); const fr = f.R(0, 0.1, u - 1.05, u - 0.9); bag.add('stucco_cream', box(fr[0], y, fr[1], fr[2], y + 2.8, fr[3])); const fr2 = f.R(0, 0.1, u + 0.9, u + 1.05); bag.add('stucco_cream', box(fr2[0], y, fr2[1], fr2[2], y + 2.8, fr2[3]));
      for (let k = 1; k <= 2; k++) { const yk = y + H1 + H2 * (k - 1); const W = f.R(0, 0.05, u - 0.4, u + 0.4); bag.add('opening', box(W[0], yk + 0.5, W[1], W[2], yk + 2.2, W[3])); const L = f.R(0.05, 0.09, u - 0.45, u + 0.45); bag.add('lattice', box(L[0], yk + 0.45, L[1], L[2], yk + 2.25, L[3])); } }
    dadoFlat(bag, f, a - 1, b + 1, y, 0.9, []);
  }
  // roof: a terrace, a parapet, the ring of tiles round the court's opening
  for (const p of SUB.subtractRects(el.rect, [court])) bag.add('plaster_white', box(p[0], y + HT, p[1], p[2], y + HT + 0.2, p[3]));
  for (const p of [[x0, z0, x1, z0 + 0.35], [x0, z1 - 0.35, x1, z1], [x0, z0, x0 + 0.35, z1], [x1 - 0.35, z0, x1, z1]]) bag.add('stucco_ochre', box(p[0], y + HT + 0.2, p[1], p[2], y + HT + 1.0, p[3]));
  { const c = court, o = [c[0] - 1.4, c[1] - 1.4, c[2] + 1.4, c[3] + 1.4], tr = [], yo = y + HT + 0.6, yi = y + HT + 0.1, ring2 = (A, yy) => [[A[0], yy, A[1]], [A[2], yy, A[1]], [A[2], yy, A[3]], [A[0], yy, A[3]]], oo = ring2(o, yo), ii = ring2(c, yi);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q4(tr, oo[i], oo[j], ii[j], ii[i]); } bag.add('tile_green', dbl(tr)); }
  F.oilLamp(bag, lights, cx - 2, y + 3.2, ring[3] - 0.6, 'bronze', 0); lights.push({ at: [cx, y + 3.0, ring[3] + 1.5], color: '#ffc27a', intensity: 4, distance: 9 });
  void rand; void inner; void gable; void door; void screen; void dado;
}
import * as SUB0 from '../../core/build.js';
const SUB = { subtractRects: SUB0.subtractRects };
/** A quarter mosque: a court with a basin and ablution seats, a prayer hall of two naves behind an arcade, the minaret at a corner. face 's'. */
export function mosque(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, t = 0.9, H = 7.0, cx = (x0 + x1) / 2, zc = z0 + 12.5;
  // walls
  const fS = face('z', z1, 1), dw = [x0 + 2.0, x0 + 5.0];
  holedWall(bag, col, 'stucco_ochre', [x0, z1 - t, x1, z1], y - 0.6, y + H, [[dw[0], dw[1], y, y + 3.4]], true);
  archHead(bag, fS, dw[0], dw[1], y + 2.3, y + 3.4, t, 'horseshoe', { alfiz: true, side: 'near' });
  canopy(bag, fS, dw[0] - 1.0, dw[1] + 1.0, y + 4.2, 0.9);
  for (const r of [[x0, z0, x1, z0 + t], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]]) { bag.add('stucco_ochre', box(r[0], y - 0.6, r[1], r[2], y + H, r[3])); col.rect(r, y - 0.6, y + H); }
  for (const p of [[x0, z0, x1, z0 + 0.3], [x0, z1 - 0.3, x1, z1], [x0, z0, x0 + 0.3, z1], [x1 - 0.3, z0, x1, z1]]) bag.add('limewash_white', box(p[0], y + H, p[1], p[2], y + H + 0.7, p[3]));
  // the court (south): flags, a basin; the hall (north): mats, a row of columns with arches, a cedar ceiling, the mihrab
  const ci = [x0 + t, zc + 0.8, x1 - t, z1 - t], hi = [x0 + t, z0 + t, x1 - t, zc];
  bag.add('flagstone', box(ci[0], y - 0.3, ci[1], ci[2], y, ci[3])); col.floor(ci, y);
  basin(bag, col, cx, (ci[1] + ci[3]) / 2, y, 1.1);
  bag.add('marble_floor', box(hi[0], y - 0.3, hi[1], hi[2], y, hi[3] + 0.8)); bag.add('reed_mat', box(hi[0] + 0.2, y, hi[1] + 0.2, hi[2] - 0.2, y + 0.02, hi[3] + 0.6)); col.floor([hi[0], hi[1], hi[2], hi[3] + 0.8], y + 0.02);
  // the front of the hall: a wall with three wide doorways, dado and stucco inside
  const fw = face('z', zc + 0.8, 1), hole = [[cx - 7.5, cx - 4.5, y, y + 3.6], [cx - 1.5, cx + 1.5, y, y + 3.6], [cx + 4.5, cx + 7.5, y, y + 3.6]];
  holedWall(bag, col, 'plaster_white', [x0 + t, zc, x1 - t, zc + 0.8], y, y + 5.8, hole, true);
  for (const h of hole) archHead(bag, face('z', zc + 0.8, 1), h[0], h[1], y + 2.5, y + 3.6, 0.8, 'horseshoe', { alfiz: true, side: 'near' });
  void fw;
  const fi = face('z', hi[1], 1); dadoFlat(bag, fi, hi[0], hi[2], y, 1.5, []); stucco(bag, fi, hi[0], hi[2], y + 1.9, y + 5.6, [[cx - 1.0, cx + 1.0, y, y + 3.4]], { cell: 0.42 });
  { const mh = [cx - 1.0, cx + 1.0]; bag.add('opening', box(mh[0], y + 0.02, hi[1] - 0.5, mh[1], y + 3.2, hi[1])); archHead(bag, fi, mh[0], mh[1], y + 2.2, y + 3.2, 0.5, 'horseshoe', { alfiz: true }); }
  const cols = [], mid = (hi[1] + zc) / 2; for (let i = 1; i < 6; i++) { const x = hi[0] + (hi[2] - hi[0]) * i / 6; bag.add(i % 2 ? 'marble_smooth' : 'marble_dark', lathe([[0.18, 0], [0.18, 0.12], [0.13, 0.17], [0.13, 3.3], [0.18, 3.35], [0.18, 3.6], [0.001, 3.6]], 10, null, x, y, mid)); col.circle(x, mid, 0.18, y, y + 3.6); cols.push({ u: x - hi[0], w: 0.18 }); }
  archRunLite(bag, [hi[0], mid], [hi[2], mid], cols, y, 3.6, 5.2);
  bag.add('ceiling_painted', box(hi[0], y + 5.4, hi[1], hi[2], y + 5.6, zc));
  for (const [za, zb] of [[hi[1], mid], [mid, zc]]) gable(bag, [hi[0] - 0.2, za, hi[2] + 0.2, zb], y + H + 0.7, 1.6, 0.3, 'x', { ends: false });
  F.mosqueLamp(bag, lights, cx, y + 3.6, mid - 1.5, y + 5.4, { k: 1, glow: 2.4, reach: 8 });
  minaret(bag, col, [x1 - 4.6, z0 - 0.3, x1 - 0.3, z0 + 4.0], y, 21);
}

/** fez_lane: { rect, axis ('x' | 'z'), ys: [ground height every `step` m from the lane's start], step, kind } — the lane's gutter down the middle and the courses of paving across it. Near level only. */
export function lane(el, { bag }) {
  if (el.simple) return;
  const [x0, z0, x1, z1] = el.rect, alongX = el.axis === 'x', ys = el.ys, st = el.step, w = alongX ? z1 - z0 : x1 - x0, c = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2, u0 = alongX ? x0 : z0, len = alongX ? x1 - x0 : z1 - z0;
  const yAt = (u) => { const t = Math.max(0, Math.min(ys.length - 1.001, (u - u0) / st)), i = Math.floor(t), f = t - i; return ys[i] * (1 - f) + ys[i + 1] * f; };
  const T = [];
  const P = (u, v, yy) => (alongX ? [u, yy, c + v] : [c + v, yy, u]);
  for (let u = u0; u < u0 + len - 0.01; u += st) {
    const a = u, b = Math.min(u + st, u0 + len), ya = yAt(a) + 0.045, yb = yAt(b) + 0.045;
    q4(T, P(a, -0.13, ya), P(b, -0.13, yb), P(b, 0.13, yb), P(a, 0.13, ya));
  }
  bag.add('bluestone', dbl(T));
  const sp = el.kind === 'street' ? 2.5 : 3.2;
  for (let u = u0 + sp / 2; u < u0 + len - 0.2; u += sp) {
    const hw = w / 2 - 0.1, yy = yAt(u);
    bag.add('limestone', alongX ? box(u - 0.07, yy - 0.02, c - hw, u + 0.07, yy + 0.03, c + hw) : box(c - hw, yy - 0.02, u - 0.07, c + hw, yy + 0.03, u + 0.07));
  }
}
/** fez_wash: { at: [x, z] (on the quay), side (-1 north bank, +1 south), top (the quay's height), water, cx (the river's centre z) } — a wash-place: a stone slab at the water, three steps down the wall, cloth spread on the quay. */
export function wash(el, { bag }) {
  if (el.simple) return;
  const [x, z] = el.at, s = el.side, hw = 2.8, zc = el.cz, y = el.top, wl = el.water;
  const zs = (a, b) => [Math.min(zc + s * a, zc + s * b), Math.max(zc + s * a, zc + s * b)];
  const [za, zb] = zs(hw - 1.5, hw + 0.02); bag.add('limestone', box(x - 1.1, wl + 0.2, za, x + 1.1, wl + 0.5, zb));
  for (let k = 0; k < 4; k++) { const [a, b] = zs(hw - 0.5 - k * 0.0, hw + 0.02); bag.add('limestone', box(x + 1.1 - 0.2, wl + 0.5 + k * ((y - wl - 0.5) / 4), a, x + 1.1 + 0.6 - k * 0.05, wl + 0.5 + (k + 1) * ((y - wl - 0.5) / 4), b)); }
  const cls = ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_red'];
  for (let k = 0; k < 4; k++) { const cx = x - 1.8 - k * 1.1, [a, b] = zs(hw + 1.2, hw + 2.0); bag.add(cls[(k + (Math.abs(Math.round(x)) % 5)) % 5], box(cx - 0.45, y + 0.025, a, cx + 0.45, y + 0.04, b)); }
}


/** fez_trellis: { at: [x, z], axis ('x' | 'z': the lane's direction), w (the lane's clear width), len, y (the lane's floor), seed } — a vine trained over a derb: cedar poles across at 3 m, the canes
 *  along them, a roof of leaves (green) with bunches of grapes hanging; the dappled shade of the quiet lanes. Over the lane only (no collision: the clearance is 2.8 m). */
export function trellis(el, { bag }) {
  const [x, z] = el.at, alongX = el.axis === 'x', w = el.w + 0.6, len = el.len ?? 3.4, y = el.y + 3.0, n = Math.max(3, Math.round(len / 1.1));
  const B = (u0, u1, y0, y1, v0, v1) => (alongX ? box(x + u0, y0, z + v0, x + u1, y1, z + v1) : box(x + v0, y0, z + u0, x + v1, y1, z + u1));
  for (let i = 0; i < n; i++) { const u = -len / 2 + len * (i + 0.5) / n; bag.add('cedar', B(u - 0.05, u + 0.05, y, y + 0.1, -w / 2, w / 2)); }
  for (const v of [-w * 0.3, 0, w * 0.3]) bag.add('wood_dark', B(-len / 2, len / 2, y + 0.1, y + 0.14, v - 0.02, v + 0.02));
  const r = rngT(el.seed ?? 1);
  for (let k = 0; k < 7; k++) {
    const u = -len / 2 + 0.2 + r() * (len - 0.4), v = (r() - 0.5) * w * 0.9, a = 0.5 + r() * 0.5, b = 0.5 + r() * 0.6;
    bag.add('palm_leaf', B(u - a / 2, u + a / 2, y + 0.14 + r() * 0.12, y + 0.3 + r() * 0.12, v - b / 2, v + b / 2));
  }
  bag.add('palm_leaf', B(-len / 2 + 0.1, len / 2 - 0.1, y + 0.14, y + 0.2, -w / 2 + 0.1, w / 2 - 0.1));
  for (let k = 0; k < 5; k++) { const u = -len / 2 + 0.3 + r() * (len - 0.6), v = (r() - 0.5) * w * 0.7, [bx, bz] = alongX ? [x + u, z + v] : [x + v, z + u]; bag.add(k % 2 ? 'glaze_yellow' : 'cloth_indigo', lathe([[0.001, 0], [0.06, 0.1], [0.07, 0.22], [0.001, 0.3]], 6, null, bx, y - 0.3, bz)); }
}
function rngT(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
