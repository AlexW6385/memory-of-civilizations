// The Cathedral of the Dormition inside, as about 1600 (docs/settlements/muscovy.md §1): the white-stone
// shell with its slit windows and receding portals, the twelve equal bays on four round piers and two
// square ones, the sail vaults; the walls and the piers painted in registers of saints and scenes; the
// iconostasis of a local row and three tiers (Deesis, Feasts, Prophets) on the line of the square piers,
// the royal doors; the Monomakh throne by the south door; the great chandelier and the candle stands.

import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward, quad } from '../../core/geom.js';
import { Shape, Path, Matrix4, Vector3 } from '../../core/three.js';
import { slab, hexa, pyr } from '../norse/index.js';

const WS = 'limestone', G = 'gilt_bronze', FL = 'flagstone', VAULT = 'ceiling_painted';
const ROBES = ['paint_robe', 'paint_blue', 'cloth_white', 'fresco_green', 'paint_robe', 'paint_ochre'];
const GROUNDS = ['paint_blue', 'fresco_green', 'paint_ochre'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A wall's outline L × H with round-headed door notches ({ u, w, h }) and round-headed window holes ({ u, v, w, h }). */
function wallShape(L, H, doors = [], wins = []) {
  const sh = new Shape();
  sh.moveTo(0, 0);
  for (const d of [...doors].sort((p, q) => p.u - q.u)) { sh.lineTo(d.u - d.w / 2, 0); sh.lineTo(d.u - d.w / 2, d.h); sh.absarc(d.u, d.h, d.w / 2, Math.PI, 0, true); sh.lineTo(d.u + d.w / 2, 0); }
  sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  for (const w of wins) { const p = new Path(); p.moveTo(w.u - w.w / 2, w.v); p.lineTo(w.u + w.w / 2, w.v); p.lineTo(w.u + w.w / 2, w.v + w.h); p.absarc(w.u, w.v + w.h, w.w / 2, 0, Math.PI, false); p.lineTo(w.u - w.w / 2, w.v); sh.holes.push(p); }
  return sh;
}
/** A disc of radius r and thickness th, its face toward n, its back at c. */
function disc(c, n, r, th = 0.006, seg = 12) {
  const g = lathe([[r, 0], [r, th], [0.001, th]], seg), N = new Vector3(...n).normalize();
  const t = Math.abs(N.y) < 0.9 ? new Vector3(0, 1, 0).cross(N).normalize() : new Vector3(1, 0, 0), b = t.clone().cross(N);
  g.applyMatrix4(new Matrix4().makeBasis(t, N, b).setPosition(c[0], c[1], c[2]));
  return g;
}
/** A thin curved patch on a cylinder round (cx, cz): radius r0 to r1, height y0 to y1, angle a0 to a1. */
function sector(cx, cz, r0, r1, y0, y1, a0, a1, seg = 3) {
  const t = [], P = (r, yy, a) => [cx + Math.cos(a) * r, yy, cz + Math.sin(a) * r];
  for (let k = 0; k < seg; k++) {
    const a = a0 + (a1 - a0) * k / seg, b = a0 + (a1 - a0) * (k + 1) / seg;
    quad(t, P(r1, y0, a), P(r1, y0, b), P(r1, y1, b), P(r1, y1, a));
    quad(t, P(r0, y0, b), P(r0, y0, a), P(r0, y1, a), P(r0, y1, b));
    quad(t, P(r0, y1, a), P(r1, y1, a), P(r1, y1, b), P(r0, y1, b));
    quad(t, P(r0, y0, b), P(r1, y0, b), P(r1, y0, a), P(r0, y0, a));
  }
  quad(t, P(r0, y0, a0), P(r1, y0, a0), P(r1, y1, a0), P(r0, y1, a0));
  quad(t, P(r1, y0, a1), P(r0, y0, a1), P(r0, y1, a1), P(r1, y1, a1));
  return fromTriangles(orientOutward(t));
}
/**
 * A painted saint, standing: in a local frame P(u, v, d) (u across, v up, d out from the surface) and its
 * outward normal n — the robe narrowing to the shoulders over the feet, the cloak's edge, the head before
 * its halo. h tall, centred on u = 0, from v = 0, at depth d.
 */
export function saint(bag, P, n, h, d, rand, halo = 'paint_ochre') {
  const w = h * 0.24, robe = ROBES[Math.floor(rand() * ROBES.length)], cloak = ROBES[Math.floor(rand() * ROBES.length)];
  const Q = (u, v, dd) => P(u, v, d + dd);
  bag.add(robe, hexa([Q(-w / 2, 0, 0), Q(w / 2, 0, 0), Q(w * 0.36, h * 0.74, 0), Q(-w * 0.36, h * 0.74, 0), Q(-w / 2, 0, 0.012), Q(w / 2, 0, 0.012), Q(w * 0.36, h * 0.74, 0.012), Q(-w * 0.36, h * 0.74, 0.012)]));
  if (cloak !== robe) bag.add(cloak, hexa([Q(-w * 0.52, h * 0.18, 0.004), Q(-w * 0.05, h * 0.12, 0.004), Q(-w * 0.02, h * 0.74, 0.004), Q(-w * 0.38, h * 0.74, 0.004), Q(-w * 0.52, h * 0.18, 0.018), Q(-w * 0.05, h * 0.12, 0.018), Q(-w * 0.02, h * 0.74, 0.018), Q(-w * 0.38, h * 0.74, 0.018)]));
  bag.add(halo, disc(Q(0, h * 0.86, 0.002), n, h * 0.1, 0.004));
  bag.add('skin_light', disc(Q(0, h * 0.85, 0.008), n, h * 0.058, 0.008));
}
/** A sail vault over a bay, painted on its underside: corners at yS, the crown rise above. */
function vault(bag, x0, z0, x1, z1, yS, rise, n = 8) {
  const t = [], Y = (u, v) => yS + rise * (1 - ((2 * u - 1) ** 2 + (2 * v - 1) ** 2) / 2);
  const P = (i, j) => [x0 + (x1 - x0) * i / n, Y(i / n, j / n), z0 + (z1 - z0) * j / n];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
    t.push(...a, ...b, ...c, ...a, ...c, ...d);          // facing down, into the church
  }
  bag.add(VAULT, fromTriangles(t));
  // its back, a skin of stone just above, so the vault is closed seen from anywhere
  const u = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1), up = (p) => [p[0], p[1] + 0.25, p[2]];
    u.push(...up(a), ...up(c), ...up(b), ...up(a), ...up(d), ...up(c));
  }
  bag.add(WS, fromTriangles(u));
}

/**
 * The cathedral with its inside: el as russian_church ({ rect, h, y, domes, dome, apses }) and
 * interior: true. Altar east (+x); doors south (main), north and west.
 */
export function cathedralInside(el, { bag, col, lights }, exterior) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 20, y = el.y ?? 0, wt = 1.3, F = y + 0.15, rand = rng(1479);
  const I = [x0 + wt, z0 + wt, x1 - wt, z1 - wt], cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
  const bx = (I[2] - I[0]) / 4, bz = (I[3] - I[1]) / 3, yS = F + 13.5, rise = 3.2;
  // the floor of stone flags; the walls, with their doors and the slit windows of the bays
  bag.add(FL, box(I[0], y - 0.5, I[1], I[2], F, I[3])); col.floor(I, F);
  for (const r of [[x0 - 0.3, z0 - 0.3, x1 + 0.3, z0 + wt], [x0 - 0.3, z1 - wt, x1 + 0.3, z1 + 0.3], [x0 - 0.3, z0 + wt, x0 + wt, z1 - wt], [x1 - wt, z0 + wt, x1 + 0.3, z1 - wt]]) bag.add(WS, box(r[0], y - 0.5, r[1], r[2], y + 0.25, r[3]));      // the plinth under the walls
  const dS = { w: 3.0, h: 3.8 }, dN = { w: 2.6, h: 3.4 }, dW = { w: 3.0, h: 3.8 }, wv = 10.2 - 0.25, ww = 0.75, wh = 2.2;
  const winsX = [0, 1, 2, 3].map((k) => ({ u: wt + (k + 0.5) * bx, v: wv, w: ww, h: wh })), winsZ = [0, 1, 2].map((k) => ({ u: wt + (k + 0.5) * bz, v: wv, w: ww, h: wh }));
  const H = h + 0.25;
  const wall = (a, b, L, doors, wins) => {
    bag.add(WS, slab(wallShape(L, H, doors, wins), wt, a, b, y + 0.25, 10));
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, cuts = [0, ...doors.flatMap((d) => [d.u - d.w / 2, d.u + d.w / 2]).sort((p, q) => p - q), L];
    for (let k = 0; k + 1 < cuts.length; k += 2) col.segment([a[0] + ux * cuts[k], a[1] + uz * cuts[k]], [a[0] + ux * cuts[k + 1], a[1] + uz * cuts[k + 1]], wt, y, y + h);
  };
  const dsu = 1.5 * (x1 - x0) / 4;            // the south door in the second bay, between the pilasters — the main way in from Cathedral Square
  wall([x0, z1 - wt / 2], [x1, z1 - wt / 2], x1 - x0, [{ u: dsu, ...dS }], winsX.filter((w) => Math.abs(w.u - dsu) > 1.5));
  wall([x0, z0 + wt / 2], [x1, z0 + wt / 2], x1 - x0, [{ u: dsu, ...dN }], winsX.filter((w) => Math.abs(w.u - dsu) > 1.5));
  wall([x0 + wt / 2, z0 + wt], [x0 + wt / 2, z1 - wt], z1 - z0 - 2 * wt, [{ u: cz - z0 - wt, ...dW }], winsZ.map((w) => ({ ...w, u: w.u - wt })).filter((w) => Math.abs(w.u - (cz - z0 - wt)) > 1.5));
  wall([x1 - wt / 2, z0 + wt], [x1 - wt / 2, z1 - wt], z1 - z0 - 2 * wt, [], []);
  // the window reveals' sills, splayed in: a white sill board inside each
  // ── outside: the pilasters dividing each front into its bays, the arcature belt on its colonnettes, the receding portals
  for (const [a, b, o, n] of [[[x0, z0], [x1, z0], [0, -1], 4], [[x0, z1], [x1, z1], [0, 1], 4], [[x0, z0], [x0, z1], [-1, 0], 3]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (let k = 0; k <= n; k++) { const u = k * L / n, p = [a[0] + ux * u + o[0] * 0.12, a[1] + uz * u + o[1] * 0.12]; bag.add(WS, box(p[0] - (ux ? 0.6 : 0.13), y + 0.25, p[1] - (uz ? 0.6 : 0.13), p[0] + (ux ? 0.6 : 0.13), y + h - 0.05, p[1] + (uz ? 0.6 : 0.13))); }
    // the belt: a band of little round arches on hanging colonnettes, between the pilasters
    const yb = y + h * 0.47;
    for (let k = 0; k < n; k++) {
      const u0 = k * L / n + 0.6, u1 = (k + 1) * L / n - 0.6, m = Math.max(3, Math.round((u1 - u0) / 0.95)), bw = (u1 - u0) / m, rr = bw / 2 - 0.06;
      const sh = new Shape(); sh.moveTo(0, 0);
      for (let i = 0; i < m; i++) { const uc = (i + 0.5) * bw; sh.lineTo(uc - rr, 0); sh.absarc(uc, 0, rr, Math.PI, 0, true); }
      sh.lineTo(u1 - u0, 0); sh.lineTo(u1 - u0, rr + 0.25); sh.lineTo(0, rr + 0.25); sh.lineTo(0, 0);
      const A = [a[0] + ux * u0 + o[0] * 0.08, a[1] + uz * u0 + o[1] * 0.08], B = [a[0] + ux * u1 + o[0] * 0.08, a[1] + uz * u1 + o[1] * 0.08];
      bag.add(WS, slab(sh, 0.16, A, B, yb, 8));
      for (let i = 0; i <= m; i++) { const u = u0 + i * bw, p = [a[0] + ux * u + o[0] * 0.1, a[1] + uz * u + o[1] * 0.1]; bag.add(WS, lathe([[0.06, 0], [0.09, 0.08], [0.055, 0.16], [0.055, 1.05], [0.1, 1.15], [0.1, 1.2], [0.001, 1.2]], 8, null, p[0], yb - 1.2, p[1])); }
    }
  }
  // the receding portals: three arched orders stepping in to each door; over the south door the painted
  // image of the Virgin of Vladimir with the archangels in its tympanum (as an icon in its frame)
  const portal = (cu, d, alongX, line, sg) => {
    for (let k = 0; k < 3; k++) {
      const w = d.w + 0.5 + k * 0.55, hh = d.h, L = w + 0.6, sh = new Shape(), r = w / 2;
      sh.moveTo(0, 0); sh.lineTo(0.3, 0); sh.lineTo(0.3, hh); sh.absarc(L / 2, hh, r, Math.PI, 0, true); sh.lineTo(L - 0.3, 0); sh.lineTo(L, 0); sh.lineTo(L, hh + r + 0.35); sh.lineTo(0, hh + r + 0.35); sh.lineTo(0, 0);
      const off = sg * (0.12 + (2 - k) * 0.22 + 0.11);
      const A = alongX ? [cu - L / 2, line + off] : [line + off, cu - L / 2], B = alongX ? [cu + L / 2, line + off] : [line + off, cu + L / 2];
      bag.add(WS, slab(sh, 0.22, A, B, y + 0.25, 12));
    }
  };
  portal(x0 + dsu, dS, true, z1, 1); portal(x0 + dsu, dN, true, z0, -1); portal(cz, dW, false, x0, -1);
  { const px = x0 + dsu, pz = z1 + 0.02, yy = y + 0.25 + dS.h + (dS.w + 1.6) / 2 + 0.5;
    bag.add(G, box(px - 1.0, yy, pz, px + 1.0, yy + 1.7, pz + 0.08));
    bag.add('mosaic_gold', box(px - 0.88, yy + 0.1, pz + 0.08, px + 0.88, yy + 1.6, pz + 0.1));
    const P = (u, v, d) => [px + u, yy + 0.18 + v, pz + 0.1 + d];
    saint(bag, P, [0, 0, 1], 1.25, 0.002, rand, 'gold');
    for (const e of [-0.6, 0.6]) saint(bag, (u, v, d) => P(u + e, v, d), [0, 0, 1], 1.0, 0.002, rand, 'gold'); }
  // ── the exterior's top as before: zakomary, the roof, the apses and the domes
  exterior();

  // ── inside: the piers, round in the nave, square in the iconostasis
  const xI = I[0] + 3 * bx, rp = 1.0;
  for (let k = 1; k <= 3; k++) for (let j = 1; j <= 2; j++) {
    const px = I[0] + k * bx, pz = I[1] + j * bz;
    if (k === 3) { bag.add(WS, box(px - 0.85, F, pz - 0.85, px + 0.85, yS + 0.3, pz + 0.85)); col.rect([px - 0.85, pz - 0.85, px + 0.85, pz + 0.85], F, yS); continue; }
    bag.add(WS, lathe([[rp + 0.22, 0], [rp + 0.22, 0.35], [rp + 0.1, 0.5], [rp + 0.1, 0.62], [0.001, 0.62]], 24, null, px, F, pz));
    bag.add('paint_ochre', lathe([[rp, 0], [rp, yS - F - 1.0], [0.001, yS - F - 1.0]], 24, null, px, F + 0.6, pz));
    bag.add(WS, lathe([[rp, 0], [rp + 0.25, 0.35], [rp + 0.35, 0.55], [rp + 0.35, 0.75], [0.001, 0.75]], 24, null, px, yS - 0.45, pz));
    col.circle(px, pz, rp + 0.22, F, yS);
    // the painted registers: red bands between rows of martyrs and warrior saints (three rows of eight)
    for (const v of [2.4, 6.2, 10.0]) bag.add('paint_robe', lathe([[rp + 0.006, 0], [rp + 0.006, 0.16], [0.001, 0.16]], 24, null, px, F + v - 0.25, pz));
    bag.add('paint_robe', lathe([[rp + 0.006, 0], [rp + 0.006, 0.16], [0.001, 0.16]], 24, null, px, yS - 0.85, pz));
    for (const [v, fh] of [[2.7, 3.0], [6.5, 3.0], [10.2, 2.4]]) for (let q = 0; q < 8; q++) {
      const a = (q + 0.5 * (v > 6 ? 1 : 0)) / 8 * Math.PI * 2, w = fh * 0.17 / rp, robe = ROBES[Math.floor(rand() * ROBES.length)], cl = ROBES[Math.floor(rand() * ROBES.length)];
      bag.add(robe, sector(px, pz, rp - 0.01, rp + 0.014, F + v, F + v + fh * 0.74, a - w / 2, a + w / 2));
      if (cl !== robe) bag.add(cl, sector(px, pz, rp + 0.0, rp + 0.022, F + v + fh * 0.18, F + v + fh * 0.74, a - w * 0.52, a - w * 0.05, 2));
      const n = [Math.cos(a), 0, Math.sin(a)], c = (dd, vv) => [px + Math.cos(a) * (rp + dd), F + v + vv, pz + Math.sin(a) * (rp + dd)];
      bag.add('paint_ochre', disc(c(-0.03, fh * 0.86), n, fh * 0.1, 0.006));
      bag.add('skin_light', disc(c(-0.005, fh * 0.85), n, fh * 0.058, 0.008));
      // a warrior's spear or a martyr's cross in the hand
      bag.add('paint_robe', sector(px, pz, rp + 0.014, rp + 0.02, F + v + fh * 0.05, F + v + fh * 0.95, a + w * 0.38, a + w * 0.43, 1));
    }
  }
  // ── the walls painted inside: a dado of painted hangings, then registers of scenes divided by red bands
  const panels = (a, b, sg, skip) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz * sg, nz = ux * sg;
    const P = (u, v, d) => [a[0] + ux * u + nx * d, v, a[1] + uz * u + nz * d], n = [nx, 0, nz];
    const rect = (mat, u0, u1, v0, v1, d0, d1) => bag.add(mat, hexa([P(u0, v0, d0), P(u1, v0, d0), P(u1, v0, d1), P(u0, v0, d1), P(u0, v1, d0), P(u1, v1, d0), P(u1, v1, d1), P(u0, v1, d1)]));
    const regs = [[F + 2.5, F + 5.9], [F + 6.3, F + 9.7], [F + 9.95, yS - 0.3]];
    // the runs of wall between the doors (and, in the top register, the windows)
    const runs = (v0, v1) => { let pts = [[0.15, L - 0.15]]; for (const [s0, s1, top] of skip) { if (top !== undefined && v1 <= top) continue; pts = pts.flatMap(([p, q]) => (s1 <= p || s0 >= q) ? [[p, q]] : [[p, s0], [s1, q]].filter(([r0, r1]) => r1 - r0 > 0.6)); } return pts; };
    for (const [u0, u1] of runs(F, F + 2.3)) { rect('linen', u0, u1, F + 0.35, F + 2.2, 0, 0.02); for (let u = u0 + 0.5; u < u1 - 0.2; u += 1.0) rect('paint_robe', u - 0.04, u + 0.04, F + 0.35, F + 2.2, 0.02, 0.026); }
    for (const [v0, v1] of regs) {
      rect('paint_robe', 0.15, L - 0.15, v0 - 0.3, v0 - 0.12, 0, 0.02);
      for (const [r0, r1] of runs(v0, v1)) {
        const np = Math.max(1, Math.round((r1 - r0) / 3.4)), pw = (r1 - r0) / np;
        for (let k = 0; k < np; k++) {
          const p0 = r0 + k * pw + 0.08, p1 = r0 + (k + 1) * pw - 0.08;
          rect(GROUNDS[(k + Math.round(v0)) % 3], p0, p1, v0, v1, 0, 0.02);
          const nf = Math.max(1, Math.floor((p1 - p0) / 0.75)), fh = Math.min(2.4, (v1 - v0) * 0.8);
          for (let f = 0; f < nf; f++) saint(bag, (u, v, d) => P(p0 + (f + 0.5) * (p1 - p0) / nf + u * (sg > 0 ? 1 : -1), v0 + 0.25 + v, d), n, fh * (0.9 + rand() * 0.1), 0.022, rand);
        }
      }
    }
  };
  const wins = (list, off) => list.map((w) => [w.u - off - w.w / 2 - 0.45, w.u - off + w.w / 2 + 0.45, F + 9.8]);
  panels([I[0], I[3]], [xI - 0.5, I[3]], -1, [[dsu - wt - dS.w / 2 - 0.3, dsu - wt + dS.w / 2 + 0.3], ...wins(winsX, wt)]);
  panels([I[0], I[1]], [xI - 0.5, I[1]], 1, [[dsu - wt - dN.w / 2 - 0.3, dsu - wt + dN.w / 2 + 0.3], ...wins(winsX, wt)]);
  panels([I[0], I[1]], [I[0], I[3]], -1, [[cz - I[1] - dW.w / 2 - 0.3, cz - I[1] + dW.w / 2 + 0.3], ...wins(winsZ, wt)]);
  // the sail vaults of the twelve bays
  for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) vault(bag, I[0] + k * bx, I[1] + j * bz, I[0] + (k + 1) * bx, I[1] + (j + 1) * bz, yS, rise);
  // the arches between the bays, springing from the piers: a band under each pier line
  for (let k = 1; k <= 3; k++) bag.add(WS, box(I[0] + k * bx - 0.45, yS - 0.4, I[1], I[0] + k * bx + 0.45, yS + 0.02, I[3]));
  for (let j = 1; j <= 2; j++) bag.add(WS, box(I[0], yS - 0.4, I[1] + j * bz - 0.45, I[2], yS + 0.02, I[1] + j * bz + 0.45));

  // ── the iconostasis on the line of the square piers: the local row with the royal doors, the Deesis, the Feasts, the Prophets
  const xf = xI - 0.9, th = 0.25;
  bag.add('wood_dark', box(xf, F, I[1], xf + th, F + 11.6, I[3])); col.rect([xf - 0.1, I[1], xf + th, I[3]], F, F + 11.6);
  const tiers = [[F + 0.55, 2.4, 1.3], [F + 3.45, 2.6, 1.35], [F + 6.5, 1.25, 1.0], [F + 8.2, 2.3, 1.15]];
  const icon = (zc, v0, ih, iw, big) => {
    bag.add(G, box(xf - 0.08, v0 - 0.06, zc - iw / 2 - 0.06, xf, v0 + ih + 0.06, zc + iw / 2 + 0.06));
    bag.add('mosaic_gold', box(xf - 0.1, v0, zc - iw / 2, xf - 0.08, v0 + ih, zc + iw / 2));
    saint(bag, (u, v, d) => [xf - 0.1 - d, v0 + ih * 0.06 + v, zc - u], [-1, 0, 0], ih * (big ? 0.92 : 0.86), 0.002, rand, 'gold');
  };
  tiers.forEach(([v0, ih, iw], ti) => {
    bag.add(G, box(xf - 0.16, v0 + ih + 0.08, I[1], xf, v0 + ih + 0.3, I[3]));               // the gilded beam over the tier
    const span = I[3] - I[1] - 0.4, n = Math.floor(span / (iw + 0.18)), step = span / n;
    for (let q = 0; q < n; q++) {
      const zc = I[1] + 0.2 + (q + 0.5) * step;
      if (ti === 0 && (Math.abs(zc - cz) < 1.2 || Math.abs(Math.abs(zc - cz) - bz) < 0.9)) continue;        // the royal doors, the deacons' doors
      icon(zc, v0, ih, iw, ti === 1 && Math.abs(zc - cz) < step / 2);
    }
  });
  bag.add(G, box(xf - 0.16, F, I[1], xf, F + 0.5, I[3]));                                         // the gilded plinth
  // the royal doors: two leaves under a round head, the Annunciation and the evangelists in their panels; the deacons' doors either side
  { const dw = 1.9, dh = 3.0, sh = new Shape(); sh.moveTo(0, 0); sh.lineTo(dw, 0); sh.lineTo(dw, dh); sh.absarc(dw / 2, dh, dw / 2, 0, Math.PI, false); sh.lineTo(0, 0);
    bag.add(G, slab(sh, 0.1, [xf - 0.12, cz - dw / 2], [xf - 0.12, cz + dw / 2], F + 0.5, 12));
    for (const e of [-1, 1]) for (const [v0, ih] of [[0.3, 1.0], [1.45, 1.1]]) bag.add('mosaic_gold', box(xf - 0.19, F + 0.5 + v0, cz + e * 0.08 + (e < 0 ? -0.82 : 0), xf - 0.17, F + 0.5 + v0 + ih, cz + e * 0.08 + (e < 0 ? 0 : 0.82)));
    for (const e of [-1, 1]) { const zc = cz + e * bz; bag.add('wood_painted', box(xf - 0.12, F + 0.5, zc - 0.55, xf - 0.04, F + 2.9, zc + 0.55)); saint(bag, (u, v, d) => [xf - 0.12 - d, F + 0.75 + v, zc - u], [-1, 0, 0], 2.0, 0.002, rand, 'gold'); } }
  // the Crucifixion over the iconostasis
  { const zc = cz, yb = F + 11.6; bag.add(G, box(xf + 0.05, yb, zc - 0.08, xf + 0.2, yb + 2.6, zc + 0.08)); bag.add(G, box(xf + 0.05, yb + 1.6, zc - 0.8, xf + 0.2, yb + 1.76, zc + 0.8)); }
  // ── the Monomakh throne (1551) by the south door: the canopy on four beasts, the carved box, the posts and the tented roof
  { const tx = x0 + dsu + 3.6, tz = I[3] - 1.9, a = 0.85, M = 'wood_dark';
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const lx = tx + sx * (a - 0.18), lz = tz + sz * (a - 0.18);
      bag.add(M, lathe([[0.001, 0], [0.2, 0.02], [0.24, 0.2], [0.18, 0.42], [0.001, 0.46]], 10, null, lx, F, lz));           // a crouching beast
      bag.add(M, lathe([[0.001, 0], [0.13, 0.03], [0.14, 0.2], [0.001, 0.26]], 10, null, lx + sx * 0.12, F + 0.32, lz + sz * 0.12));   // its head
    }
    bag.add(M, box(tx - a, F + 0.46, tz - a, tx + a, F + 1.7, tz + a));
    for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let q = -1; q <= 1; q++) {
      const u = q * a * 0.62, ox = tx + nx * (a + 0.01) + nz * u, oz = tz + nz * (a + 0.01) + nx * u, w = a * 0.27;
      bag.add(G, box(ox - (nx ? 0.012 : w), F + 0.62, oz - (nz ? 0.012 : w), ox + (nx ? 0.012 : w), F + 1.55, oz + (nz ? 0.012 : w)));
    }
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) bag.add(M, lathe([[0.09, 0], [0.07, 0.2], [0.07, 2.3], [0.1, 2.45], [0.001, 2.45]], 8, null, tx + sx * (a - 0.1), F + 1.7, tz + sz * (a - 0.1)));
    bag.add(M, box(tx - a - 0.08, F + 4.15, tz - a - 0.08, tx + a + 0.08, F + 4.6, tz + a + 0.08));
    bag.add(G, box(tx - a - 0.1, F + 4.35, tz - a - 0.1, tx + a + 0.1, F + 4.42, tz + a + 0.1));
    bag.add(M, pyr(tx, tz, a + 0.05, F + 4.6, 0.12, F + 6.6));
    bag.add(G, lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.18], [0.001, 0.32]], 10, null, tx, F + 6.55, tz));
    bag.add(G, box(tx - 0.03, F + 6.85, tz - 0.03, tx + 0.03, F + 7.4, tz + 0.03)); bag.add(G, box(tx - 0.03, F + 7.15, tz - 0.18, tx + 0.03, F + 7.21, tz + 0.18));
    col.rect([tx - a - 0.1, tz - a - 0.1, tx + a + 0.1, tz + a + 0.1], F, F + 4.6); }
  // ── the great chandelier in the middle bay of the nave, and the candle stands before the iconostasis
  { const lx = I[0] + 1.5 * bx, lz = cz, ly = F + 6.2;
    bag.add('bronze', box(lx - 0.02, ly + 1.0, lz - 0.02, lx + 0.02, yS + rise - 0.1, lz + 0.02));
    bag.add('bronze', lathe([[0.001, 0], [0.18, 0.1], [0.22, 0.5], [0.12, 0.9], [0.001, 1.0]], 12, null, lx, ly, lz));
    for (const [R, yy, n] of [[1.4, ly + 0.15, 16], [0.9, ly + 0.75, 10]]) {
      bag.add('bronze', lathe([[R - 0.03, 0], [R + 0.03, 0], [R + 0.03, 0.05], [R - 0.03, 0.05], [R - 0.03, 0]], 32, null, lx, yy, lz));
      for (let q = 0; q < n; q++) { const a = q / n * Math.PI * 2, X = lx + Math.cos(a) * R, Z = lz + Math.sin(a) * R; bag.add('bronze', beam3([lx, yy - 0.1 + (R > 1 ? 0 : 0.05), lz], [X, yy + 0.02, Z])); bag.add('linen', lathe([[0.016, 0], [0.016, 0.16], [0.003, 0.17]], 6, null, X, yy + 0.05, Z)); bag.add('flame', lathe([[0.001, 0], [0.01, 0.012], [0.007, 0.03], [0.001, 0.045]], 6, null, X, yy + 0.22, Z)); }
    }
    lights.push({ at: [lx, ly + 0.4, lz], color: '#ffb46b', intensity: 6, distance: 16 });
    for (const zc of [cz - 1.8, cz + 1.8]) {
      const sx = xf - 2.2;
      bag.add('bronze', lathe([[0.3, 0], [0.28, 0.06], [0.06, 0.2], [0.05, 1.05], [0.28, 1.1], [0.3, 1.16], [0.001, 1.16]], 12, null, sx, F, zc));
      for (let q = 0; q < 7; q++) { const a = q / 7 * Math.PI * 2, r = q ? 0.2 : 0; bag.add('linen', lathe([[0.012, 0], [0.012, 0.22], [0.003, 0.23]], 6, null, sx + Math.cos(a) * r, F + 1.16, zc + Math.sin(a) * r)); bag.add('flame', lathe([[0.001, 0], [0.008, 0.01], [0.006, 0.025], [0.001, 0.04]], 6, null, sx + Math.cos(a) * r, F + 1.4, zc + Math.sin(a) * r)); }
      col.circle(sx, zc, 0.3, F, F + 1.2);
      lights.push({ at: [sx, F + 1.6, zc], color: '#ffb46b', intensity: 2.5, distance: 8 });
    }
  }
}
/** A thin bronze rod between two points. */
function beam3(a, b, w = 0.02) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d), sx = -d[2] / L, sz = d[0] / L, sl = Math.hypot(sx, sz) || 1;
  const s = [sx / sl * w, 0, sz / sl * w], u = [0, w, 0], P = (o, p, q) => [o[0] + s[0] * p + u[0] * q, o[1] + s[1] * p + u[1] * q, o[2] + s[2] * p + u[2] * q];
  return hexa([P(a, -1, -1), P(a, 1, -1), P(a, 1, 1), P(a, -1, 1), P(b, -1, -1), P(b, 1, -1), P(b, 1, 1), P(b, -1, 1)]);
}
void orientedBox;
