// Shared pieces for the Palace of Westminster's interiors (docs/settlements/london.md §1.5): frames on the inside of a
// room's walls, walls pierced by doors and windows, moulded arches, rib vaults over rectangular bays, statues, shields,
// framed paintings, benches. Coordinates: the frames' v is the absolute height (base 0).

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { prism, fbox } from '../dutch/facade.js';
import { pointed, hexa } from './hall.js';
import { figure } from '../../objects/figures.js';

export const ST = 'limestone', SY = 'limestone_yellow', CV = 'limestone_carved', OAK = 'timber', LD = 'lead', G = 'gilt_bronze';

/** A frame on the inside of wall f of the room r: u along the wall from the left as one faces it from inside, d into the room. */
export function inner(r, f) {
  const [x0, z0, x1, z1] = r;
  if (f === 'n') return { w: x1 - x0, at: (u, d) => [x0 + u, z0 + d] };
  if (f === 's') return { w: x1 - x0, at: (u, d) => [x1 - u, z1 - d] };
  if (f === 'w') return { w: z1 - z0, at: (u, d) => [x0 + d, z1 - u] };
  return { w: z1 - z0, at: (u, d) => [x1 - d, z0 + u] };
}
/** A frame from its left end o, along the unit t, inward n (the octagon's faces). */
export const frame = (o, t, n, w) => ({ w, at: (u, d) => [o[0] + u * t[0] + d * n[0], o[1] + u * t[1] + d * n[1]] });

/** A convex polygon on frame F (v absolute), repeated points dropped. */
export function poly(bag, F, m, pts, d0, d1) {
  const q = [];
  for (const p of pts) if (!q.length || Math.hypot(p[0] - q[q.length - 1][0], p[1] - q[q.length - 1][1]) > 1e-4) q.push(p);
  if (q.length > 2 && Math.hypot(q[0][0] - q[q.length - 1][0], q[0][1] - q[q.length - 1][1]) < 1e-4) q.pop();
  if (q.length > 2) bag.add(m, prism(F, 0, q, d0, d1));
}
export const fb = (bag, F, m, u0, u1, v0, v1, d0, d1) => { if (u1 - u0 > 1e-3 && v1 - v0 > 1e-3 && d1 - d0 > 1e-4) bag.add(m, fbox(F, 0, u0, u1, v0, v1, d0, d1)); };

/**
 * A wall on frame F, d from -T to 0, v from v0 to v1, pierced by holes [{ u0, u1, v0 (sill), v1 (springing), rise }]
 * (a pointed head when rise > 0); solid to the walker where it stands.
 */
export function wall(bag, col, m, F, v0, v1, T, holes = []) {
  let u = 0;
  const seg = (a, b, va, vb) => { if (b - a < 0.01 || vb - va < 0.01) return; bag.add(m, fbox(F, 0, a, b, va, vb, -T, 0)); col.segment(F.at(a, -T / 2), F.at(b, -T / 2), T, va, vb); };
  for (const h of [...holes].sort((p, q) => p.u0 - q.u0)) {
    seg(u, h.u0, v0, v1);
    const r = (h.u1 - h.u0) / 2, uc = h.u0 + r, rise = h.rise ?? 0, top = h.v1 + rise;
    seg(h.u0, h.u1, top, v1);
    if ((h.v0 ?? v0) > v0) seg(h.u0, h.u1, v0, h.v0);
    if (rise > 0) for (let i = 0; i < 10; i++) { const a = -r + 2 * r * i / 10, b = -r + 2 * r * (i + 1) / 10; poly(bag, F, m, [[uc + a, h.v1 + pointed(a, r, rise)], [uc + b, h.v1 + pointed(b, r, rise)], [uc + b, top + 0.005], [uc + a, top + 0.005]], -T, 0); }
    u = h.u1;
  }
  seg(u, F.w, v0, v1);
}

/** The moulded orders round an arched opening on F: bands round the head, the jambs with their shafts. */
export function archTrim(bag, F, m, uc, r, v0, vs, H, { orders = 2, w = 0.2, d = 0.24, shaft = CV, label = true } = {}) {
  for (let o = 0; o < orders; o++) {
    const R0 = r + o * w, R1 = R0 + w, H0 = H + o * w * 0.8, H1 = H0 + w * 0.8, dd = d - o * 0.06;
    for (let i = 0; i < 12; i++) { const a = -1 + 2 * i / 12, b = -1 + 2 * (i + 1) / 12; poly(bag, F, m, [[uc + a * R0, vs + pointed(a * R0, R0, H0)], [uc + b * R0, vs + pointed(b * R0, R0, H0)], [uc + b * R1, vs + pointed(b * R1, R1, H1)], [uc + a * R1, vs + pointed(a * R1, R1, H1)]], 0, dd); }
    for (const s of [-1, 1]) fb(bag, F, m, Math.min(uc + s * R0, uc + s * R1), Math.max(uc + s * R0, uc + s * R1), v0, vs, 0, dd);
  }
  if (shaft) for (const s of [-1, 1]) { const [x, z] = F.at(uc + s * (r + w * 0.5), d + 0.04); bag.add(shaft, lathe([[0.1, 0], [0.08, 0.2], [0.07, 0.3], [0.07, vs - v0 - 0.3], [0.11, vs - v0 - 0.12], [0.11, vs - v0]], 8, null, x, v0, z)); }
  if (label) { const R = r + orders * w, Hh = H + orders * w * 0.8; for (let i = 0; i < 14; i++) { const a = -1 + 2 * i / 14, b = -1 + 2 * (i + 1) / 14; poly(bag, F, m, [[uc + a * R, vs + pointed(a * R, R, Hh)], [uc + b * R, vs + pointed(b * R, R, Hh)], [uc + b * R, vs + pointed(b * R, R, Hh) + 0.14], [uc + a * R, vs + pointed(a * R, R, Hh) + 0.14]], 0, d + 0.06); }
    for (const s of [-1, 1]) fb(bag, F, m, uc + s * R - 0.12, uc + s * R + 0.12, vs - 0.4, vs + 0.05, 0, d + 0.08); }
}

/** Perpendicular blind panelling on F between u0 and u1, v0 and v1: mullions, a cusped head to each panel, rails. */
export function panels(bag, F, m, u0, u1, v0, v1, { n = 0, pw = 0.6, d = 0.1, rail = true } = {}) {
  const k = n || Math.max(1, Math.round((u1 - u0) / pw)), w = (u1 - u0) / k;
  for (let j = 0; j <= k; j++) { const u = u0 + j * w; fb(bag, F, m, u - 0.05, u + 0.05, v0, v1, 0, d); }
  if (rail) { fb(bag, F, m, u0 - 0.05, u1 + 0.05, v0 - 0.08, v0, 0, d + 0.02); fb(bag, F, m, u0 - 0.05, u1 + 0.05, v1, v1 + 0.08, 0, d + 0.02); }
  const hh = Math.min(w * 0.7, (v1 - v0) * 0.35);
  for (let j = 0; j < k; j++) { const a = u0 + j * w + 0.05, b = a + w - 0.1, c = (a + b) / 2;
    for (const s of [0, 1]) poly(bag, F, m, s ? [[c, v1], [b, v1], [b, v1 - hh]] : [[a, v1], [c, v1], [a, v1 - hh]], 0, d * 0.6); }
}

/**
 * A gilt frame with a history painting in it: a sky over a ground, and a group of figures in coloured dress composed
 * across it (the paintings themselves are not copied; this stands for their subject and tonality).
 */
export function painting(bag, F, u0, u1, v0, v1, { arch = 0, seed = 0 } = {}) {
  const vh = v0 + (v1 - v0) * 0.38, r = (u1 - u0) / 2, uc = u0 + r;
  fb(bag, F, 'paint_ochre', u0, u1, v0, vh, 0, 0.03); fb(bag, F, 'paint_blue', u0, u1, vh, v1, 0, 0.03);
  if (arch) for (let i = 0; i < 10; i++) { const a = -r + 2 * r * i / 10, b = a + 2 * r / 10; poly(bag, F, 'paint_blue', [[uc + a, v1], [uc + b, v1], [uc + b, v1 + pointed(b, r, arch)], [uc + a, v1 + pointed(a, r, arch)]], 0, 0.03); }
  let k = (Math.round(u0 * 13.7 + v0 * 3.1 + seed * 7) >>> 0) || 1; const rnd = () => ((k = (k * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cloths = ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_brown', 'cloth_black', 'cloth_green', 'cloth_ochre'];
  const n = 3 + Math.floor(rnd() * 3), fh = (v1 - v0) * 0.5;
  for (let j = 0; j < n; j++) {
    const fu = u0 + (u1 - u0) * (j + 0.5 + (rnd() - 0.5) * 0.4) / n, s = fh * (0.8 + rnd() * 0.3), base = v0 + (v1 - v0) * (0.08 + rnd() * 0.12), wd = s * 0.16;
    poly(bag, F, cloths[Math.floor(rnd() * cloths.length)], [[fu - wd * 1.3, base], [fu + wd * 1.3, base], [fu + wd, base + s * 0.8], [fu - wd, base + s * 0.8]], 0.03, 0.045);
    poly(bag, F, 'skin_light', [[fu - wd * 0.45, base + s * 0.8], [fu + wd * 0.45, base + s * 0.8], [fu + wd * 0.4, base + s], [fu - wd * 0.4, base + s]], 0.03, 0.045);
  }
  const t = 0.14;
  fb(bag, F, G, u0 - t, u1 + t, v0 - t, v0, 0, 0.08); fb(bag, F, G, u0 - t, u0, v0, v1, 0, 0.08); fb(bag, F, G, u1, u1 + t, v0, v1, 0, 0.08);
  if (!arch) fb(bag, F, G, u0 - t, u1 + t, v1, v1 + t, 0, 0.08);
  else for (let i = 0; i < 10; i++) { const a = -1 + 2 * i / 10, b = a + 0.2; poly(bag, F, G, [[uc + a * r, v1 + pointed(a * r, r, arch)], [uc + b * r, v1 + pointed(b * r, r, arch)], [uc + b * (r + t), v1 + pointed(b * (r + t), r + t, arch + t)], [uc + a * (r + t), v1 + pointed(a * (r + t), r + t, arch + t)]], 0, 0.08); }
}

/** A heraldic shield on F: the field, a bordure, a charge (a cross, a chevron or a lion's block), a crown or helm over it. */
export function shield(bag, F, u, v, s, d, k = 0, field = 'cloth_red') {
  const outline = [[u - s, v + s * 1.1], [u + s, v + s * 1.1], [u + s, v + s * 0.1], [u + s * 0.6, v - s * 0.75], [u, v - s * 1.1], [u - s * 0.6, v - s * 0.75], [u - s, v + s * 0.1]];
  poly(bag, F, G, outline, d, d + 0.05);
  poly(bag, F, field, outline.map(([a, b]) => [u + (a - u) * 0.84, v + (b - v) * 0.86 - s * 0.02]), d + 0.05, d + 0.07);
  if (k % 3 === 0) { fb(bag, F, G, u - s * 0.12, u + s * 0.12, v - s * 0.8, v + s * 0.85, d + 0.07, d + 0.09); fb(bag, F, G, u - s * 0.7, u + s * 0.7, v + s * 0.2, v + s * 0.44, d + 0.07, d + 0.09); }
  else if (k % 3 === 1) for (const sg of [-1, 1]) poly(bag, F, G, [[u, v + s * 0.4], [u + sg * s * 0.75, v - s * 0.3], [u + sg * s * 0.75, v - s * 0.05], [u, v + s * 0.68]].sort((p, q) => sg * (p[0] - q[0])), d + 0.07, d + 0.09);
  else for (let j = 0; j < 3; j++) fb(bag, F, G, u - s * 0.5, u + s * 0.5, v + s * (0.55 - j * 0.45) - 0.05, v + s * (0.55 - j * 0.45) + 0.08, d + 0.07, d + 0.09);
  poly(bag, F, G, [[u - s * 0.5, v + s * 1.15], [u + s * 0.5, v + s * 1.15], [u + s * 0.55, v + s * 1.5], [u, v + s * 1.3], [u - s * 0.55, v + s * 1.5]], d, d + 0.06);
}

/** A rib vault over a rectangular bay: the cells (two barrels crossing, their groins on the diagonals), ribs, bosses. */
export function bayVault(bag, rect, ys, H, { along = 'x', cell = ST, rib = ST, boss = G, ribW = 0.26, ribD = 0.22, tierceron = true, transverse = [true, true], N = 8 } = {}) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
  // normalised two-centred profile: g(0) = 1, g(±1) = 0
  const kk = 1.25, g = (t) => pointed(Math.min(1, Math.abs(t)), 1, kk) / kk;
  const hgt = (x, z) => ys + H * Math.max(g((x - cx) / hx), g((z - cz) / hz));
  const P = (a, b) => { const x = cx + a * hx, z = cz + b * hz; return [x, hgt(x, z), z]; };
  // the cells: a shell 0.3 thick, the grid's squares split along the groins' diagonal
  const tris = [], top = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const a0 = -1 + 2 * i / N, a1 = -1 + 2 * (i + 1) / N, b0 = -1 + 2 * j / N, b1 = -1 + 2 * (j + 1) / N;
    const p00 = P(a0, b0), p10 = P(a1, b0), p11 = P(a1, b1), p01 = P(a0, b1);
    const split = (a0 + a1) * (b0 + b1) > 0;     // along the diagonal through the centre
    const T = split ? [[p00, p10, p11], [p00, p11, p01]] : [[p00, p10, p01], [p10, p11, p01]];
    for (const [a, b, c] of T) { tris.push(...a, ...c, ...b); top.push(...a.map((v, k) => v + (k === 1 ? 0.3 : 0)), ...b.map((v, k) => v + (k === 1 ? 0.3 : 0)), ...c.map((v, k) => v + (k === 1 ? 0.3 : 0))); }
  }
  // the downward faces (looked at from the floor) and the upper ones
  bag.add(cell, fromTriangles(fixDown(tris, true))); bag.add(cell, fromTriangles(fixDown(top, false)));
  // the ribs: diagonals, ridges, transverse and wall ribs, tiercerons
  const line = (a0, b0, a1, b1, n = 10, w = ribW) => { for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n; ribSeg(bag, rib, P(a0 + (a1 - a0) * t0, b0 + (b1 - b0) * t0), P(a0 + (a1 - a0) * t1, b0 + (b1 - b0) * t1), w, ribD); } };
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) line(a, b, 0, 0);
  const lx = along === 'x';
  // the ridge along the hall and across the bay
  line(lx ? -1 : 0, lx ? 0 : -1, lx ? 1 : 0, lx ? 0 : 1, 8, ribW * 0.8); line(lx ? 0 : -1, lx ? -1 : 0, lx ? 0 : 1, lx ? 1 : 0, 6, ribW * 0.8);
  // transverse ribs at the bay's ends (across the hall), wall ribs over the side walls
  for (const s of [-1, 1]) { if (transverse[(s + 1) / 2]) line(lx ? s : -1, lx ? -1 : s, lx ? s : 1, lx ? 1 : s, 12, ribW * 1.2); line(lx ? -1 : s, lx ? s : -1, lx ? 1 : s, lx ? s : 1, 12, ribW * 0.7); }
  const bosses = new Map([['0,0', [0, 0]]]);
  // tiercerons: from each corner to the ridges half way out (a star), a boss where each meets its ridge
  if (tierceron) for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) for (const [ea, eb] of [[a * 0.5, 0], [0, b * 0.5]]) { line(a, b, ea, eb, 6, ribW * 0.75); bosses.set(`${ea},${eb}`, [ea, eb]); }
  for (const [a, b] of bosses.values()) { const [x, y, z] = P(a, b); bag.add(boss, lathe([[0.001, 0], [0.2, -0.02], [0.24, -0.14], [0.18, -0.26], [0.001, -0.32]], 8, null, x, y - ribD + 0.04, z)); }
}
/** Turn each triangle of a list to face down (true) or up. */
function fixDown(t, down) {
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
    const ny = uz * vx - ux * vz;
    if ((ny > 0) === down) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
  }
  return t;
}
/** A rib under a vault from p to q (points on its surface): w wide, standing d below it, sunk a little into it. */
export function ribSeg(bag, m, p, q, w, d) {
  let lx = -(q[2] - p[2]), lz = q[0] - p[0];
  const L = Math.hypot(lx, lz);
  if (L < 1e-6) { lx = w / 2; lz = 0; } else { lx *= w / 2 / L; lz *= w / 2 / L; }
  const C = (o, s, dy) => [o[0] + s * lx, o[1] + dy, o[2] + s * lz];
  bag.add(m, hexa([C(p, -1, -d), C(q, -1, -d), C(q, 1, -d), C(p, 1, -d)], [C(p, -1, 0.06), C(q, -1, 0.06), C(q, 1, 0.06), C(p, 1, 0.06)]));
}

/** A clustered shaft (three rolls) standing at [x, z] from y0 to y1 with a moulded base and capital. */
export function shaft(bag, m, x, z, y0, y1, r = 0.14, dir = [0, 0]) {
  const L = y1 - y0;
  bag.add(m, lathe([[r * 1.9, 0], [r * 1.9, 0.25], [r * 1.5, 0.35], [r * 1.2, 0.45], [r * 1.2, L - 0.45], [r * 1.8, L - 0.3], [r * 2.1, L - 0.12], [r * 2.1, L]], 8, null, x, y0, z));
  for (const s of [-1, 1]) { const ox = -dir[1] * s * r * 1.5, oz = dir[0] * s * r * 1.5; bag.add(m, lathe([[r * 0.7, 0], [r * 0.7, L - 0.5]], 6, null, x + ox, y0 + 0.4, z + oz)); }
}

/** A statue in marble or bronze: a still figure in robes on its own feet (its pedestal is the caller's). */
export function statue(ctx, x, z, y, rot, seed, { m = 'marble_smooth', h = 2.0, over = 'cape', hair = 'short', beard = false } = {}) {
  figure({ t: 'figure', at: [x, z], y, rot, seed, h, dress: 'robe', cloth: m, cloth2: m, skin: m, hairMat: m, hair, beard, over, feet: 'bare', pose: seed % 3 === 0 ? 'talk' : 'stand' }, ctx);
}

/**
 * Raked benches on one side of a chamber: rows along z (along = 'z') or x from z0 to z1 (breaks: [[a, b]…] for the
 * gangways), the first row's front at xf (an x, or a z when the rows run along x), each row `dep` deeper and `rise`
 * higher outward (s = −1 or +1); seats and backs upholstered in `cloth`, the frames of oak.
 */
export function benches(bag, col, { xf, s, z0, z1, rows = 4, dep = 0.95, rise = 0.38, y, cloth, breaks = [], along = 'z' }) {
  const spans = [];
  let a = z0;
  for (const [p, q] of [...breaks].sort((m, n) => m[0] - n[0])) { spans.push([a, p]); a = q; }
  spans.push([a, z1]);
  const Q = (q) => xf + s * q;
  const B = (m, qa, qb, ya, yb, wa, wb) => { const c0 = Math.min(Q(qa), Q(qb)), c1 = Math.max(Q(qa), Q(qb)); bag.add(m, along === 'z' ? box(c0, ya, wa, c1, yb, wb) : box(wa, ya, c0, wb, yb, c1)); };
  const C = (qa, qb, ya, yb, wa, wb) => { const c0 = Math.min(Q(qa), Q(qb)), c1 = Math.max(Q(qa), Q(qb)); col.rect(along === 'z' ? [c0, wa, c1, wb] : [wa, c0, wb, c1], ya, yb); };
  for (let k = 0; k < rows; k++) {
    const yb = y + k * rise, q0 = k * dep;
    if (k > 0) B(OAK, q0, q0 + dep, y, yb, z0, z1);
    for (const [za, zb] of spans) {
      // the seat on its panelled front, the cushion, the back and its rail, the ends
      B(OAK, q0 + 0.05, q0 + 0.62, yb, yb + 0.36, za + 0.05, zb - 0.05);
      B(cloth, q0 + 0.03, q0 + 0.64, yb + 0.36, yb + 0.46, za + 0.06, zb - 0.06);
      B(cloth, q0 + 0.64, q0 + 0.78, yb + 0.4, yb + 0.98, za + 0.06, zb - 0.06);
      B(OAK, q0 + 0.78, q0 + 0.84, yb + 0.3, yb + 1.04, za + 0.05, zb - 0.05);
      for (const ze of [za + 0.05, zb - 0.05]) B(OAK, q0 + 0.02, q0 + 0.86, yb, yb + 0.62, ze - 0.04, ze + 0.04);
      C(q0, q0 + dep, y, yb + 1.0, za, zb);
    }
  }
}
