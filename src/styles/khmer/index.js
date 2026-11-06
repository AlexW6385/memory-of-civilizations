// Khmer architecture of the Angkor period (Angkor Wat, first half of the 12th c.;
// docs/settlements/angkor.md §4–§5): towers (prasat) shaped like lotus buds, their plan a square
// with its corners stepped in (redented), rising in receding tiers, each a storey in miniature
// with its cornice and a crown of antefixes, the whole crowned by a bud wrapped in lotus petals;
// porticoes under tiered pediments framed by serpent bodies that rear up as heads at their ends;
// galleries with a solid wall on one side and square pillars on the other under corbelled stone
// vaults, a half-vault along their open side, windows filled with turned balusters, bas-reliefs
// along the walls, female deities (devata) standing in groups on the walls; cross-shaped entrance
// pavilions (gopura); terraces of laterite faced with sandstone, mouldings stepped in and out,
// steep stairs, lions on pedestals; causeways bordered by the bodies of serpents (naga) that rear
// up as fans of heads at their ends; libraries; basins.
// The village: houses of timber on stilts with steep roofs of palm thatch.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, orientOutward } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import '../qing/index.js';
import { rectRoof, beamTris, flipTris } from '../ming/index.js';

const S = 'sandstone_khmer', C = 'sandstone_carved';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---- shapes -------------------------------------------------------------------------------------

/** The redented square: half-width a, its four corners stepped in n times by d; counter-clockwise (x towards z) from the +x side. */
export function redentPoly(a, n, d) {
  const c = a - n * d, Q = [[a, c]];
  for (let k = 1; k <= n; k++) Q.push([a - k * d, c + (k - 1) * d], [a - k * d, c + k * d]);
  const P = [];
  for (let r = 0; r < 4; r++) for (const [x, z] of Q) { let X = x, Z = z; for (let i = 0; i < r; i++) [X, Z] = [-Z, X]; P.push([X, Z]); }
  return P;
}
/** The convex corners of redentPoly (n + 1 a quarter) and the middles of the sides: where antefixes stand. */
function redentSpots(a, n, d) {
  const c = a - n * d, out = [];
  for (let r = 0; r < 4; r++) {
    const rot = (x, z) => { let X = x, Z = z; for (let i = 0; i < r; i++) [X, Z] = [-Z, X]; return [X, Z]; };
    out.push({ p: rot(a, 0), dir: rot(1, 0), mid: true });
    for (let k = 0; k <= n; k++) { const x = a - k * d, z = c + k * d, l = Math.hypot(1, 1); out.push({ p: rot(x, z), dir: rot(1 / l, 1 / l), mid: false, k }); }
  }
  return out;
}
/** A stack of rings of polygon P (each [scale, y]) round (cx, cz) from y0, as triangles; capped if the last ring is not a point. */
function stack(out, P, rings, cx, y0, cz, skip = null) {
  const n = P.length, V = rings.map(([s, y]) => P.map(([x, z]) => [cx + x * s, y0 + y, cz + z * s]));
  for (let i = 0; i + 1 < V.length; i++) {
    const L = V[i], U = V[i + 1];
    for (let j = 0; j < n; j++) { if (skip && skip(i, j)) continue; const k = (j + 1) % n; out.push(...L[j], ...U[k], ...L[k], ...L[j], ...U[j], ...U[k]); }
  }
  const T = V[V.length - 1], top = [cx, T[0][1], cz];
  if (rings[rings.length - 1][0] > 0.002) for (let j = 0; j < n; j++) { const k = (j + 1) % n; out.push(...top, ...T[k], ...T[j]); }
  return out;
}
/** A convex outline [[u, v]] stood up at O (u along the horizontal unit U, v up) and given thickness t along the horizontal normal N. */
function prism(out, outline, O, U, N, t) {
  const P = (u, v, w) => [O[0] + U[0] * u + N[0] * w, O[1] + v, O[2] + U[1] * u + N[1] * w], T = [], m = outline.length;
  for (let i = 1; i + 1 < m; i++) {
    T.push(...P(...outline[0], 0), ...P(...outline[i], 0), ...P(...outline[i + 1], 0));
    T.push(...P(...outline[0], t), ...P(...outline[i], t), ...P(...outline[i + 1], t));
  }
  for (let i = 0; i < m; i++) { const a = outline[i], b = outline[(i + 1) % m]; T.push(...P(...a, 0), ...P(...b, 0), ...P(...b, t), ...P(...a, 0), ...P(...b, t), ...P(...a, t)); }
  for (const v of orientOutward(T)) out.push(v);
  return out;
}
/** The Khmer pediment's outline (and the corbelled vault's section): sides rising steeply, curving in to a point. */
const ARCH = (W, H, m = 12) => { const p = []; for (let i = 0; i <= m; i++) { const x = -1 + 2 * i / m; p.push([x * W / 2, H * Math.pow(1 - Math.abs(x), 0.6)]); } return p; };
/** A leaf, a flame, a serpent's raised head: the outline of the antefixes and the pediments' ends (width 1, height 1). */
const LEAF = [[-0.5, 0], [0.5, 0], [0.56, 0.22], [0.48, 0.5], [0.28, 0.76], [0, 1], [-0.28, 0.76], [-0.48, 0.5], [-0.56, 0.22]];
const scaled = (o, w, h) => o.map(([u, v]) => [u * w, v * h]);
const along = (O, N, d, U = [0, 0], u = 0) => [O[0] + N[0] * d + U[0] * u, O[1], O[2] + N[1] * d + U[1] * u];
const perp = (N) => [-N[1], N[0]];
/** A rod a→b of radius r with rounded, closed ends (rod() leaves its ends open). */
function limb(a, b, r, seg = 10) {
  const A = new Vector3(...a), B = new Vector3(...b), L = A.distanceTo(B), e = Math.min(r * 0.35, L * 0.3);
  const g = lathe([[0.001, -e], [r * 0.75, -e * 0.6], [r, 0], [r, L], [r * 0.75, L + e * 0.6], [0.001, L + e]], seg);
  const dir = B.clone().sub(A).normalize(), up = new Vector3(0, 1, 0), axis = up.clone().cross(dir), m = new Matrix4();
  if (axis.lengthSq() < 1e-9) { if (dir.y < 0) m.makeRotationX(Math.PI); } else m.makeRotationAxis(axis.normalize(), Math.acos(Math.min(1, Math.max(-1, up.dot(dir)))));
  m.setPosition(A);
  return g.applyMatrix4(m);
}

/** A pediment at O facing N: the tympanum (carved) inside a frame of serpent bodies (width f) whose ends rear up as heads. */
function pediment(bag, O, N, W, H, f) {
  const U = perp(N), fr = [], ty = [], inner = ARCH(W, H), outer = ARCH(W + 2 * f, H + f * 1.5);
  for (let i = 0; i + 1 < inner.length; i++) prism(fr, [inner[i], inner[i + 1], outer[i + 1], outer[i]], O, U, N, f * 0.9);
  prism(ty, ARCH(W - 0.06, H - 0.05), along(O, N, -0.12), U, N, 0.12 + f * 0.3);
  for (const s of [-1, 1]) prism(fr, scaled(LEAF, f * 2.2, f * 3), along(O, N, f * 0.1, U, s * (W / 2 + f * 1.9)), U, N, f * 0.7);
  bag.add(S, fromTriangles(fr)); bag.add(C, fromTriangles(ty));
}
/** An axis-aligned rectangle from local (u, d) ranges about c with the side normal N. */
function rUD(c, N, u0, u1, d0, d1) {
  const U = perp(N), pts = [[u0, d0], [u1, d1]].map(([u, d]) => [c[0] + U[0] * u + N[0] * d, c[1] + U[1] * u + N[1] * d]);
  return [Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])];
}
const boxR = (r, y0, y1) => box(r[0], y0, r[1], r[2], y1, r[3]);
/** A doorway on a face at distance d along N from c: dark, in a frame of colonnettes under a lintel. */
function doorway(bag, c, N, d, y, dw, dh) {
  bag.add(C, boxR(rUD(c, N, -dw - 0.45, dw + 0.45, d - 0.05, d + 0.12), y, y + dh + 0.5));
  bag.add('opening', boxR(rUD(c, N, -dw, dw, d - 0.05, d + 0.16), y, y + dh));
  bag.add(S, boxR(rUD(c, N, -dw - 0.6, dw + 0.6, d - 0.05, d + 0.2), y + dh + 0.5, y + dh + 0.85));
  for (const s of [-1, 1]) bag.add(C, lathe([[0.13, 0], [0.11, 0.2], [0.14, 0.3], [0.1, dh * 0.5], [0.14, dh * 0.55], [0.1, dh * 0.6], [0.11, dh + 0.3], [0.14, dh + 0.5]], 8, null, ...(() => { const p = along([c[0], 0, c[1]], N, d + 0.2, perp(N), s * (dw + 0.25)); return [p[0], y, p[2]]; })()));
}
/** An open doorway at the mouth of a passage (half-width dw, height dh) at d along N from c: carved jambs and head, the lintel, the colonnettes. */
function openDoorway(bag, c, N, d, y, dw, dh) {
  for (const sg of [-1, 1]) bag.add(C, boxR(rUD(c, N, sg < 0 ? -dw - 0.45 : dw, sg < 0 ? -dw : dw + 0.45, d - 0.05, d + 0.12), y, y + dh + 0.5));
  bag.add(C, boxR(rUD(c, N, -dw, dw, d - 0.05, d + 0.12), y + dh, y + dh + 0.5));
  bag.add(S, boxR(rUD(c, N, -dw - 0.6, dw + 0.6, d - 0.05, d + 0.2), y + dh + 0.5, y + dh + 0.85));
  for (const s of [-1, 1]) { const p = along([c[0], 0, c[1]], N, d + 0.2, perp(N), s * (dw + 0.25)); bag.add(C, lathe([[0.13, 0], [0.11, 0.2], [0.14, 0.3], [0.1, dh * 0.5], [0.14, dh * 0.55], [0.1, dh * 0.6], [0.11, dh + 0.3], [0.14, dh + 0.5]], 8, null, p[0], y, p[2])); }
}
/**
 * A portico on a side N of a building centred at c whose wall face is d0 out: a vestibule
 * (depth, width, height h) with a doorway, its cornice, a corbelled vault ending in a pediment, and
 * (tiers 2) a taller vault set back behind it with its own pediment.
 */
function portico(ctx, { c, N, y, d0, depth, width, h, tiers = 2, door = true, open = null }) {
  const { bag, col } = ctx, d1 = d0 + depth, Y = [c[0], y, c[1]];
  if (open) {
    // a vestibule one walks through: the plinth (its top the floor), side walls, the lintel over the
    // passage, the framed doorway at its mouth, and two steps up to it
    const { dw, dh } = open, W = width / 2;
    bag.add(C, boxR(rUD(c, N, -W - 0.3, W + 0.3, d0, d1 + 0.3), y, y + 0.7));
    for (const sg of [-1, 1]) { const r = rUD(c, N, sg < 0 ? -W : dw, sg < 0 ? -dw : W, d0, d1); bag.add(S, boxR(r, y + 0.7, y + h - 0.45)); col.rect(r, y, y + h); }
    bag.add(S, boxR(rUD(c, N, -dw, dw, d0, d1), y + 0.7 + dh, y + h - 0.45));
    col.floor(rUD(c, N, -W - 0.3, W + 0.3, d0, d1 + 0.3), y + 0.7);
    openDoorway(bag, c, N, d1, y + 0.7, dw, dh);
    const r = rUD(c, N, -dw - 0.2, dw + 0.2, d1 + 0.3, d1 + 1.1), dir = N[0] > 0.5 ? 'w' : N[0] < -0.5 ? 'e' : N[1] > 0.5 ? 'n' : 's';
    STYLES.qing.elements.stairs({ rect: r, y0: y, y1: y + 0.7, dir, mat: S }, ctx);
  } else {
    bag.add(C, boxR(rUD(c, N, -width / 2 - 0.3, width / 2 + 0.3, d0 - 0.3, d1 + 0.3), y, y + 0.7));
    bag.add(S, boxR(rUD(c, N, -width / 2, width / 2, d0 - 0.3, d1), y + 0.7, y + h - 0.45));
    col.rect(rUD(c, N, -width / 2 - 0.3, width / 2 + 0.3, d0 - 0.3, d1 + 0.3), y, y + h);
  }
  bag.add(C, boxR(rUD(c, N, -width / 2 - 0.25, width / 2 + 0.25, d0 - 0.3, d1 + 0.25), y + h - 0.45, y + h));
  if (door && !open) doorway(bag, c, N, d1, y + 0.7, Math.min(1.1, width * 0.16), Math.min(3.2, (h - 1.2) * 0.75));
  const U = perp(N), H1 = width * 0.42, f = Math.max(0.25, width * 0.05), v = [];
  prism(v, ARCH(width + 0.3, H1), [Y[0] + N[0] * (d0 - 0.3), y + h, Y[2] + N[1] * (d0 - 0.3)], U, N, depth + 0.3);
  pediment(bag, along([c[0], y + h, c[1]], N, d1 - 0.05), N, width + 0.3, H1, f);
  if (tiers > 1) {
    const d2 = d0 + depth * 0.45;
    prism(v, ARCH(width * 0.78, H1 * 1.65), [Y[0] + N[0] * (d0 - 0.3), y + h, Y[2] + N[1] * (d0 - 0.3)], U, N, d2 - d0 + 0.3);
    pediment(bag, along([c[0], y + h, c[1]], N, d2 - 0.05), N, width * 0.78, H1 * 1.65, f * 0.85);
  }
  bag.add(S, fromTriangles(v));
}

/** A devata: a standing goddess in low relief (height s), in her tall three-pointed crown and sampot, on the face at p facing N. */
const DEVATA = [
  [[-0.17, 0], [-0.02, 0], [-0.03, 0.07], [-0.15, 0.07]], [[0.02, 0], [0.17, 0], [0.15, 0.07], [0.03, 0.07]],          // the feet, turned out
  [[-0.1, 0.06], [0.1, 0.06], [0.15, 0.52], [-0.15, 0.52]],                                                           // the sampot
  [[-0.08, 0.36], [0.08, 0.36], [0.06, 0.5], [-0.06, 0.5]],                                                           // its front panel
  [[-0.11, 0.5], [0.11, 0.5], [0.14, 0.78], [-0.14, 0.78]],                                                           // the torso
  [[0.13, 0.55], [0.18, 0.56], [0.2, 0.76], [0.14, 0.78]], [[-0.18, 0.56], [-0.13, 0.55], [-0.14, 0.78], [-0.2, 0.76]], // the arms
  [[0.17, 0.64], [0.24, 0.72], [0.22, 0.82], [0.16, 0.74]],                                                           // a flower in her hand
  [[-0.045, 0.78], [0.045, 0.78], [0.065, 0.84], [0.06, 0.9], [-0.06, 0.9], [-0.065, 0.84]],                           // the head
  [[-0.08, 0.89], [0.08, 0.89], [0.02, 1.04], [-0.02, 1.04]], [[-0.1, 0.89], [-0.05, 0.89], [-0.12, 0.99]], [[0.05, 0.89], [0.1, 0.89], [0.12, 0.99]], // the crown's three points
];
function devata(bag, p, y, N, s) {
  const U = perp(N), t = [], back = [];
  for (const part of DEVATA) prism(t, scaled(part, s, s), [p[0] + N[0] * 0.02, y, p[1] + N[1] * 0.02], U, N, 0.07 * s / 1.1);
  // the shallow niche she stands in: a panel with a pointed top
  prism(back, [[-0.26 * s, -0.04], [0.26 * s, -0.04], [0.26 * s, 0.9 * s], [0, 1.16 * s], [-0.26 * s, 0.9 * s]], [p[0] - N[0] * 0.02, y, p[1] - N[1] * 0.02], U, N, 0.05);
  bag.add(C, fromTriangles(t)); bag.add(S, fromTriangles(back));
}

/** A blind window on a wall face at p facing N: a carved frame, a dark ground, turned balusters standing half out of it. */
function blindWindow(bag, p, N, y, ww, wh) {
  const c = [p[0], p[1]];
  bag.add(C, boxR(rUD(c, N, -ww / 2 - 0.25, -ww / 2 + 0.02, -0.05, 0.16), y - 0.1, y + wh + 0.1));
  bag.add(C, boxR(rUD(c, N, ww / 2 - 0.02, ww / 2 + 0.25, -0.05, 0.16), y - 0.1, y + wh + 0.1));
  bag.add(C, boxR(rUD(c, N, -ww / 2 - 0.3, ww / 2 + 0.3, -0.05, 0.2), y - 0.18, y + 0.02));
  bag.add(C, boxR(rUD(c, N, -ww / 2 - 0.3, ww / 2 + 0.3, -0.05, 0.2), y + wh - 0.02, y + wh + 0.18));
  bag.add('opening', boxR(rUD(c, N, -ww / 2 + 0.01, ww / 2 - 0.01, -0.05, 0.03), y + 0.01, y + wh - 0.01));
  const nb = Math.max(3, Math.round(ww / 0.21)), U = perp(N);
  for (let i = 0; i < nb; i++) { const u = -ww / 2 + (i + 0.5) * ww / nb; bag.add(C, lathe(baluster(wh - 0.04), 8, null, p[0] + U[0] * u + N[0] * 0.09, y + 0.02, p[1] + U[1] * u + N[1] * 0.09)); }
}

// ---- the towers ---------------------------------------------------------------------------------

/**
 * k_tower: a prasat { c, y, w (the sanctuary's width), h (the tower's full height above y), tiers,
 * porches, doors }: the sanctuary on its base mouldings, redented in plan, with a portico on each
 * side (or a doorway), devatas on its walls; then tiers that recede along the bud's curve, each a
 * storey in miniature — its wall, its cornice, and on the ledge above antefixes at every corner
 * and in the middle of each side (small towers at the corners, leaf-shaped serpent heads between);
 * the crown: a bud wrapped in lotus petals, pointed.
 */
function kTower(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y, w = el.w, H = el.h, hw = w / 2;
  const body = Math.min(H * 0.28, w * 1.1), n = 3, d = hw * 0.09, P = redentPoly(hw, n, d);
  const t = [], ca = [], cel = el.cella, Lq = 2 * n + 1;
  // the base mouldings and the walls of the sanctuary, its cornice; with a cella the long middle
  // faces of the walls are left to the walls built below, pierced by the four doors
  const skip = cel ? (i, j) => i === 6 && j % Lq === Lq - 1 : null;
  stack(t, P, [[1.12, 0], [1.12, 0.3], [1.08, 0.3], [1.06, 0.55], [1.03, 0.62], [1.03, 0.8], [1.0, 0.8], [1.0, body - 0.9], [1.05, body - 0.9]], cx, y, cz, skip);
  stack(ca, P, [[1.05, body - 0.9], [1.08, body - 0.6], [1.08, body - 0.35], [1.02, body - 0.15], [1.02, body]], cx, y, cz);
  if (cel) cella(ctx, { cx, cz, y, hw, c: hw - n * d, body, ...cel });
  else col.rect([cx - hw * 1.12, cz - hw * 1.12, cx + hw * 1.12, cz + hw * 1.12], y, y + body);
  const sides = [['e', [1, 0]], ['w', [-1, 0]], ['s', [0, 1]], ['n', [0, -1]]];
  for (const [f, N] of sides) {
    if (el.porches !== false) portico(ctx, { c: [cx, cz], N, y, d0: hw, depth: w * 0.24, width: w * 0.36, h: body * 0.7, tiers: w > 8 ? 2 : 1, open: cel ? { dw: cel.dw, dh: cel.dh } : null });
    else if ((el.doors ?? 'nesw').includes(f)) doorway(bag, [cx, cz], N, hw, y + 0.8, Math.min(1.1, w * 0.12), Math.min(3.2, body * 0.55));
    // devatas on the wall either side of the door
    const s = Math.min(1.9, body * 0.16), U = perp(N);
    if (hw - n * d > w * 0.18 + s * 0.4 + 0.3 && el.devatas !== false) for (const side of [-1, 1]) {
      const u = side * Math.min(hw - n * d - s * 0.35, w * 0.18 + s * 0.45 + 0.35);
      devata(bag, [cx + N[0] * hw + U[0] * u, cz + N[1] * hw + U[1] * u], y + 1.0, N, s);
    }
  }
  // the tiers along the bud's curve
  const tiers = el.tiers ?? 5, zone = H - body, bud = zone * 0.2, curve = (q) => Math.pow(1 - Math.pow(q, 1.5), 0.8);
  let hs = [], tot = 0;
  for (let k = 0; k < tiers; k++) { hs.push(Math.pow(0.88, k)); tot += hs[k]; }
  hs = hs.map((v) => v / tot * (zone - bud));
  let yy = body, sk = 0.98 * curve(0);
  const rings = [];
  for (let k = 0; k < tiers; k++) {
    const h = hs[k], sn = 0.98 * curve((yy + h - body) / zone);
    rings.push([sk, yy], [sk * 0.965, yy + h * 0.6], [sk * 1.035, yy + h * 0.6], [sk * 1.06, yy + h * 0.7], [sk * 1.06, yy + h * 0.8], [sk, yy + h]);
    // the antefixes on the ledge: at the corners small towers, between them leaf-shaped heads
    const aw = Math.min(hw * sk * 0.16, d * sk * 1.3), ah = Math.min(h * 0.6, aw * 2.1), th = aw * 0.4;
    for (const sp of redentSpots(hw, n, d)) {
      const ax = cx + sp.p[0] * sk - sp.dir[0] * th * 0.7, az = cz + sp.p[1] * sk - sp.dir[1] * th * 0.7, ay = y + yy + h - 0.04;
      if (sp.mid || sp.k === 0 || sp.k === n) {
        const wd = sp.mid ? aw * 1.5 : aw;
        prism(ca, scaled(LEAF, wd, sp.mid ? ah * 1.1 : ah), [ax - sp.dir[0] * th * 0.5, ay, az - sp.dir[1] * th * 0.5], perp(sp.dir), sp.dir, th);
      } else {
        const q = aw * 0.45, mp = redentPoly(q, 0, 0);
        stack(ca, mp, [[1, 0], [0.92, ah * 0.32], [1.1, ah * 0.36], [0.7, ah * 0.42], [0.62, ah * 0.6], [0.76, ah * 0.63], [0.32, ah * 0.85], [0.001, ah]], ax, ay, az);
      }
    }
    yy += h; sk = sn;
  }
  // the crown: the bud, wrapped at its foot by a ring of lotus petals
  rings.push([sk, yy], [sk * 0.99, yy + bud * 0.2], [sk * 0.9, yy + bud * 0.38], [sk * 0.7, yy + bud * 0.58], [sk * 0.4, yy + bud * 0.78], [sk * 0.14, yy + bud * 0.93], [0.001, bud + yy]);
  stack(t, P, rings, cx, y, cz);
  // two registers of petals: the lower at the bud's foot, the upper, smaller, a third of the way up
  for (const [f, sc, ph] of [[0, sk, 0.34], [0.36, sk * 0.9, 0.28]]) {
    const pw = d * sc * 1.3, th = pw * 0.28;
    for (const sp of redentSpots(hw, n, d)) prism(ca, scaled(LEAF, sp.mid ? pw * 2.2 : pw, bud * ph), [cx + sp.p[0] * sc - sp.dir[0] * th * 0.6, y + yy + bud * f - 0.05, cz + sp.p[1] * sc - sp.dir[1] * th * 0.6], perp(sp.dir), sp.dir, th);
  }
  bag.add(S, fromTriangles(t)); bag.add(C, fromTriangles(ca));
}

/**
 * The cella of a sanctuary open to the four quarters (the central sanctuary of Angkor Wat as built:
 * four porches opening to the cardinal directions): walls `hw − half` thick round a square room of
 * half-width `half`, each pierced on its axis by a passage (half-width dw, height dh) through to its
 * porch, with a moulded sill; the floor 0.7 up; the ceiling corbelled in, course over course, to a
 * flat stone; and the image on its pedestal in the middle (`image`: a k_vishnu element's own params).
 */
function cella(ctx, { cx, cz, y, hw, c, body, half, dw, dh, image }) {
  const { bag, col } = ctx, C0 = [cx, cz], fy = y + 0.7, top = y + body - 0.9;
  bag.add(S, box(cx - half, y, cz - half, cx + half, fy, cz + half)); col.floor([cx - half, cz - half, cx + half, cz + half], fy);
  for (const N of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (const sg of [-1, 1]) { const r = rUD(C0, N, sg < 0 ? -c : dw, sg < 0 ? -dw : c, half, hw); bag.add(S, boxR(r, y, top)); col.rect(r, y, top); }
    bag.add(S, boxR(rUD(C0, N, -dw, dw, half, hw), fy + dh, top));
    bag.add(S, boxR(rUD(C0, N, -dw, dw, half, hw - 0.02), y, fy)); col.floor(rUD(C0, N, -dw, dw, half, hw), fy);
    bag.add(C, boxR(rUD(C0, N, -dw, dw, hw - 0.02, hw + 0.26), fy - 0.02, fy + 0.1));                 // the sill
  }
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) col.rect([cx + Math.min(sx * c, sx * hw), cz + Math.min(sz * c, sz * hw), cx + Math.max(sx * c, sx * hw), cz + Math.max(sz * c, sz * hw)], y, top);
  // the corbelled ceiling: four courses each stepping in 0.45, then the capstone
  let e = half;
  for (let k = 0; k < 4; k++) {
    const w = half - (e - 0.45), y0 = top + 0.5 * k, y1 = y0 + 0.5; e -= 0.45;
    bag.add(S, box(cx - half, y0, cz - half, cx + half, y1, cz - e)); bag.add(S, box(cx - half, y0, cz + e, cx + half, y1, cz + half));
    bag.add(S, box(cx - half, y0, cz - e, cx - e, y1, cz + e)); bag.add(S, box(cx + e, y0, cz - e, cx + half, y1, cz + e));
    void w;
  }
  bag.add(C, box(cx - half, top + 2.0, cz - half, cx + half, top + 2.3, cz + half));
  if (image) kVishnu({ at: [cx, cz], y: fy, ...image }, ctx);
}

/**
 * k_vishnu: the standing image of Vishnu with eight arms { at, y, face (e|w|n|s), h (the figure's
 * height), mat } on a moulded pedestal whose spout runs out to the north: feet together, the sampot
 * with its hanging fold, the bare chest, the cylindrical mitre; the eight arms in two fans, the hands
 * holding the discus and the conch (the upper pair), the mace standing at the right and the earth
 * as a ball at the left (the lower pair), the others raised empty (their attributes long lost).
 */
function kVishnu(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h ?? 3.3, k = H / 3.3, f = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] }[el.face ?? 'w'], U = perp(f), M = el.mat ?? C;
  // local: u to the figure's left, v up, w forward (along f)
  const P = (u, v, w) => [x + (U[0] * -u + f[0] * w) * k, y + 0.9 + v * k, z + (U[1] * -u + f[1] * w) * k];
  // the pedestal: three moulded courses, the spout of the ablution channel to the north
  bag.add(C, box(x - 0.85, y, z - 0.85, x + 0.85, y + 0.18, z + 0.85));
  bag.add(S, box(x - 0.75, y + 0.18, z - 0.75, x + 0.75, y + 0.72, z + 0.75));
  bag.add(C, box(x - 0.82, y + 0.72, z - 0.82, x + 0.82, y + 0.9, z + 0.82));
  bag.add(C, box(x - 0.12, y + 0.62, z - 1.25, x + 0.12, y + 0.76, z - 0.82));
  col.rect([x - 0.85, z - 0.85, x + 0.85, z + 0.85], y, y + 0.9 + H);
  const L = (a, b, r) => bag.add(M, limb(P(...a), P(...b), r * k, 10));
  bag.add(M, box(...(() => { const a = P(-0.2, 0, -0.05), b = P(0.2, 0.08, 0.22); return [Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2])]; })()));   // the feet
  for (const s of [-1, 1]) { L([s * 0.1, 0.06, 0.03], [s * 0.11, 0.95, 0], 0.085); L([s * 0.11, 0.95, 0], [s * 0.13, 1.5, 0], 0.115); }   // shins, thighs
  // the sampot: wrapped from the waist to the knee, its fold hanging in front; the body; the head and mitre
  const turn = (g) => g.applyMatrix4(new Matrix4().makeRotationY(Math.atan2(f[0], f[1])));
  bag.add(M, turn(lathe([[0.27, 0], [0.29, 0.25], [0.27, 0.5], [0.24, 0.62], [0.001, 0.62]], 14).scale(k, k, 0.72 * k)).translate(...P(0, 1.0, 0)));
  bag.add(M, turn(box(-0.07, 0, 0.17, 0.07, 0.62, 0.23).scale(k, k, k)).translate(...P(0, 0.98, 0)));
  bag.add(M, turn(lathe([[0.22, 0], [0.24, 0.2], [0.29, 0.55], [0.31, 0.72], [0.22, 0.86], [0.001, 0.88]], 14).scale(k, k, 0.62 * k)).translate(...P(0, 1.6, 0)));
  bag.add(M, limb(P(0, 2.42, 0), P(0, 2.6, 0.01), 0.075 * k, 8));
  bag.add(M, turn(lathe([[0.001, -0.17], [0.11, -0.13], [0.15, -0.02], [0.15, 0.06], [0.11, 0.15], [0.001, 0.18]], 12).scale(k, k, 1.05 * k)).translate(...P(0, 2.76, 0.02)));
  bag.add(M, lathe([[0.15, 0], [0.16, 0.06], [0.14, 0.1], [0.14, 0.32], [0.11, 0.4], [0.06, 0.48], [0.001, 0.52]].map(([r, v]) => [r * k, v * k]), 12, null, ...P(0, 2.86, 0.01)));
  for (const s of [-1, 1]) L([s * 0.15, 2.8, 0.02], [s * 0.16, 2.66, 0.02], 0.025);          // the long earlobes
  // the eight arms, four from each shoulder fanning out; hands as balls holding their attributes
  const arms = [
    [[0.5, 2.2, -0.02], [0.62, 2.68, 0.1]], [[0.6, 2.05, 0.02], [0.82, 2.4, 0.12]],
    [[0.58, 1.92, 0.06], [0.8, 1.86, 0.25]], [[0.44, 1.88, 0.02], [0.46, 1.5, 0.3]],
  ];
  for (const s of [-1, 1]) arms.forEach(([e, hd], i) => {
    const sh = [s * 0.3, 2.42 - i * 0.06, -0.02 + i * 0.02], el2 = [s * e[0], e[1], e[2]], hn = [s * hd[0], hd[1], hd[2]];
    L(sh, el2, 0.064 - i * 0.004); L(el2, hn, 0.05 - i * 0.003);
    bag.add(M, ellipsoidK(P(hn[0], hn[1] + 0.05, hn[2] + 0.01), f, U, 0.045 * k, 0.075 * k, 0.04 * k));            // the hand
  });
  // the necklace and the belt of the sampot
  bag.add(M, turn(lathe([[0.001, 0], [0.3, 0], [0.34, 0.03], [0.3, 0.06], [0.001, 0.06]], 16).scale(k, k, 0.64 * k)).translate(...P(0, 2.29, 0.0)));
  bag.add(M, turn(lathe([[0.001, 0], [0.29, 0], [0.3, 0.04], [0.29, 0.08], [0.001, 0.08]], 16).scale(k, k, 0.73 * k)).translate(...P(0, 1.58, 0)));

  // the attributes: the discus upright in the upper right hand, the conch in the upper left, the mace at the right, the earth at the left
  const dRight = P(-0.62, 2.82, 0.1), conch = P(0.62, 2.8, 0.12);
  bag.add(M, turn(lathe([[0.001, -0.025], [0.15, -0.025], [0.16, 0], [0.15, 0.025], [0.001, 0.025]], 16).rotateX(Math.PI / 2).scale(k, k, k)).translate(...dRight));
  bag.add(M, turn(lathe([[0.001, 0], [0.06, 0.03], [0.08, 0.1], [0.05, 0.2], [0.001, 0.26]], 10).rotateZ(-0.5).scale(k, k, k)).translate(...conch));
  L([-0.5, 0.0, 0.3], [-0.47, 1.45, 0.3], 0.04);                                                 // the mace's shaft, standing on the pedestal
  bag.add(M, limb(P(-0.47, 1.42, 0.3), P(-0.47, 1.72, 0.3), 0.09 * k, 10));                       // its head
  bag.add(M, ellipsoidK(P(0.46, 1.6, 0.34), f, U, 0.13 * k, 0.13 * k, 0.13 * k));                // the earth
}

/** A turned baluster of height h, as if of wood: rings and swellings along it. */
function baluster(h) {
  const p = [[0.075, 0], [0.075, 0.06]], k = 5;
  for (let i = 0; i < k; i++) { const y0 = 0.06 + (h - 0.12) * i / k, s = (h - 0.12) / k; p.push([0.055, y0 + s * 0.12], [0.085, y0 + s * 0.3], [0.085, y0 + s * 0.42], [0.06, y0 + s * 0.6], [0.05, y0 + s * 0.88], [0.07, y0 + s]); }
  p.push([0.075, h - 0.06], [0.075, h]);
  return p;
}
/** The tiles of the bas-relief (2.4 m long, three registers): an army on the march — foot soldiers with spear and shield, an officer on horseback. */
const ROUND = (cu, cv, r, m = 8) => Array.from({ length: m }, (_, i) => [cu + Math.cos(i / m * Math.PI * 2) * r, cv + Math.sin(i / m * Math.PI * 2) * r]);
function soldier(u, v, s, dir) {
  const q = (pts) => pts.map(([a, b]) => [u + a * s * dir, v + b * s]), fix = (pts) => (dir < 0 ? pts.slice().reverse() : pts);
  return [
    fix(q([[-0.1, 0], [0.1, 0], [0.06, 0.22], [-0.06, 0.22]])), fix(q([[-0.07, 0.22], [0.07, 0.22], [0.09, 0.4], [-0.09, 0.4]])),
    fix(q(ROUND(0, 0.45, 0.045, 6))), fix(q([[-0.03, 0.48], [0.03, 0.48], [0, 0.56]])), fix(q(ROUND(0.11, 0.3, 0.07))),
    fix(q([[-0.13, 0.04], [-0.11, 0.03], [0.21, 0.61], [0.19, 0.62]])),
  ];
}
function rider(u, v, s, dir) {
  const q = (pts) => pts.map(([a, b]) => [u + a * s * dir, v + b * s]), fix = (pts) => (dir < 0 ? pts.slice().reverse() : pts), out = [];
  out.push(fix(q([[-0.26, 0.24], [-0.1, 0.18], [0.12, 0.18], [0.26, 0.26], [0.24, 0.36], [0.05, 0.38], [-0.2, 0.36]])));          // the horse's body
  out.push(fix(q([[0.18, 0.3], [0.28, 0.33], [0.38, 0.5], [0.33, 0.54], [0.22, 0.4]])), fix(q([[0.33, 0.46], [0.44, 0.42], [0.45, 0.47], [0.36, 0.55]])));
  for (const [a, b] of [[-0.22, -0.16], [-0.12, -0.18], [0.12, 0.08], [0.2, 0.24]]) out.push(fix(q([[a - 0.025, 0], [a + 0.025, 0], [b + 0.025, 0.22], [b - 0.025, 0.22]])));
  for (const p of soldier(0, 0.26, 0.7, 1)) out.push(fix(q(p.map(([a, b]) => [a, b]))));
  return out;
}
const RELIEF_TILE = (() => {
  const parts = [];
  for (let i = 0; i < 6; i++) parts.push(...soldier(0.2 + i * 0.4, 0.06, 0.95, 1));
  for (let i = 0; i < 6; i++) parts.push(...soldier(0.2 + i * 0.4, 0.7, 0.95, i % 3 === 2 ? -1 : 1));
  parts.push(...rider(0.55, 1.3, 1.0, 1));
  for (let i = 0; i < 3; i++) parts.push(...soldier(1.25 + i * 0.4, 1.34, 0.95, 1));
  return parts;
})();
/**
 * A gallery's wall along wa→wb: solid, or (el.windows) pierced between the pillars by windows filled
 * with turned balusters in carved frames; on its face to the gallery (f) the bas-relief (el.relief),
 * on its other face devatas in twos and threes (el.devatas).
 */
function wall(ctx, el, { wa, wb, len, ux, uz, y, h, np, f }) {
  const { bag } = ctx, P = (s, o = 0) => [wa[0] + ux * s + f[0] * o, wa[1] + uz * s + f[1] * o];
  const seg = (mat, s0, s1, y0, y1, o = 0, hw = 0.45) => { const t = [], a = P(s0, o), b = P(s1, o); beamTris(t, [a[0], y0, a[1]], [b[0], y0, b[1]], hw, y1 - y0); bag.add(mat, fromTriangles(t)); };
  const top = y + h + 0.4;
  if (!el.windows) seg(S, 0, len, y, top);
  else {
    const sill = 0.8, wh = Math.min(1.7, h - 1.4), ww = Math.min(1.5, len / np * 0.5), wins = Array.from({ length: np }, (_, k) => (k + 0.5) / np * len);
    seg(S, 0, len, y, y + sill); seg(S, 0, len, y + sill + wh, top);
    let prev = 0;
    for (const s of wins) {
      seg(S, prev, s - ww / 2, y + sill - 0.01, y + sill + wh + 0.01); prev = s + ww / 2;
      // the frame: jambs, sill and lintel standing proud of both faces
      seg(C, s - ww / 2 - 0.25, s - ww / 2 + 0.05, y + sill - 0.1, y + sill + wh + 0.1, 0, 0.5);
      seg(C, s + ww / 2 - 0.05, s + ww / 2 + 0.25, y + sill - 0.1, y + sill + wh + 0.1, 0, 0.5);
      seg(C, s - ww / 2 - 0.3, s + ww / 2 + 0.3, y + sill - 0.16, y + sill + 0.05, 0, 0.52);
      seg(C, s - ww / 2 - 0.3, s + ww / 2 + 0.3, y + sill + wh - 0.05, y + sill + wh + 0.16, 0, 0.52);
      const nb = 7, bh = wh - 0.1;
      for (let i = 0; i < nb; i++) { const p = P(s - ww / 2 + 0.05 + (i + 0.5) * (ww - 0.1) / nb); bag.add(C, lathe(baluster(bh), 8, null, p[0], y + sill + 0.05, p[1])); }
    }
    seg(S, prev, len, y + sill - 0.01, y + sill + wh + 0.01);
  }
  // the bas-relief: a polished band 2 m high along the gallery, the figures standing out of it
  if (el.relief) {
    seg(C, 0.3, len - 0.3, y + 0.75, y + 2.8, 0.46, 0.03);
    seg(C, 0.3, len - 0.3, y + 2.8, y + 3.0, 0.47, 0.04);
    seg(C, 0.3, len - 0.3, y + 0.6, y + 0.75, 0.47, 0.04);
    const n = Math.floor((len - 0.8) / 2.4), s0 = (len - n * 2.4) / 2, U = [ux, uz];
    for (let i = 0; i < n; i++) {
      const O = P(s0 + i * 2.4, 0.48), t = [];
      for (const part of RELIEF_TILE) prism(t, part, [O[0], y + 0.8, O[1]], U, f, 0.05);
      bag.add('sandstone_relief', fromTriangles(t));
    }
  }
  // devatas on the other face, in twos and threes between the pillars
  if (el.devatas) {
    const g = Math.max(1, Math.floor(np / 2)), Nn = [-f[0], -f[1]];
    for (let k = 0; k < g; k++) {
      const s = (k + 0.5) / g * len, cnt = 2 + (k % 2);
      for (let j = 0; j < cnt; j++) { const p = P(s + (j - (cnt - 1) / 2) * 0.62, -0.45); devata(bag, p, y + 0.5, Nn, 1.1); }
    }
  }
}

/**
 * The false ceiling of carved wood under a gallery's corbelled vault, between A and B on its centre
 * line (axis-aligned), `half` to each side of it, its underside at yc: boards painted red in a grid
 * of dark beams, a gilded lotus rosette in each coffer.
 */
const ROSETTE = (() => { const n = 8, f = (th) => 1 + 0.18 * Math.abs(Math.cos(th * n / 2)); return lathe([[0.001, 0.0], [0.2, 0.0], [0.17, -0.035], [0.1, -0.05], [0.05, -0.08], [0.001, -0.09]], 16, f); })();
function ceiling(bag, A, B, half, yc, cell = 0.9) {
  const X = Math.abs(B[0] - A[0]) > Math.abs(B[1] - A[1]), s0 = X ? Math.min(A[0], B[0]) : Math.min(A[1], B[1]), s1 = X ? Math.max(A[0], B[0]) : Math.max(A[1], B[1]), v = X ? A[1] : A[0];
  const R = (a0, a1, b0, b1, y0, y1) => (X ? box(a0, y0, b0, a1, y1, b1) : box(b0, y0, a0, b1, y1, a1));
  const L = s1 - s0, na = Math.max(1, Math.round(L / cell)), nb = Math.max(1, Math.round(2 * half / cell)), ca = L / na, cb = 2 * half / nb;
  bag.add('timber_red', R(s0, s1, v - half, v + half, yc, yc + 0.06));
  for (let j = 0; j <= nb; j++) { const b = v - half + j * cb; bag.add('wood_dark', R(s0, s1, b - 0.05, b + 0.05, yc - 0.1, yc + 0.001)); }
  for (let i = 0; i <= na; i++) { const a = s0 + i * ca; bag.add('wood_dark', R(a - 0.05, a + 0.05, v - half + 0.05, v + half - 0.05, yc - 0.095, yc + 0.001)); }
  for (let i = 0; i < na; i++) for (let j = 0; j < nb; j++) {
    const a = s0 + (i + 0.5) * ca, b = v - half + (j + 0.5) * cb, k = Math.min(ca, cb) / 0.9;
    bag.add('paint_ochre', ROSETTE.clone().scale(k, k, k).translate(X ? a : b, yc - 0.001, X ? b : a));
  }
}
/** A half-vault over a half-gallery: a quarter of a corbelled vault from the pillars' line (at P, its top yTop) down to the outer pillars `run` out along O, at yLow; `len` along U. */
function halfVault(bag, P, U, O, len, yTop, yLow, run) {
  const t = [], m = 8, prof = (i, th) => { const q = i / m, u = run * q; return [u, (yTop - yLow) * Math.sqrt(Math.max(0, 1 - q * q)) + th]; };
  for (let i = 0; i < m; i++) prism(t, [prof(i, 0), prof(i + 1, 0), prof(i + 1, 0.3), prof(i, 0.3)], [P[0], yLow, P[1]], O, U, len);
  bag.add(S, fromTriangles(t));
}

/**
 * k_gallery: a gallery round a rectangle { rect (its centre line), y, w (width), h (pillar height),
 * solid ('in' | 'out': the side with the wall), half (a half-gallery on the open side), gates
 * (gaps at the middles of the sides, with a gopura), corner (towers at the corners: height),
 * windows, relief, devatas (see wall) }.
 */
function kGallery(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, w = el.w, h = el.h, hw = w / 2;
  const sides = [[[x0, z0], [x1, z0], [0, -1]], [[x1, z1], [x0, z1], [0, 1]], [[x0, z1], [x0, z0], [-1, 0]], [[x1, z0], [x1, z1], [1, 0]]];
  for (const [a, b, n] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const out = el.solid === 'out' ? 1 : -1;               // the wall's side: outward (n) or inward
    const side = n[0] ? (n[0] > 0 ? 'e' : 'w') : (n[1] > 0 ? 's' : 'n');
    const gate = el.gates && (!el.gateSides || el.gateSides.includes(side)) ? el.gate ?? Math.min(18, L * 0.18) : 0;
    const pieces = gate ? [[0, L / 2 - gate / 2], [L / 2 + gate / 2, L]] : [[0, L]];
    for (const [s0, s1] of pieces) {
      const A = [a[0] + ux * s0, a[1] + uz * s0], B = [a[0] + ux * s1, a[1] + uz * s1], len = s1 - s0;
      // the floor, raised a step
      const fl = [];
      beamTris(fl, [A[0], y - 0.6, A[1]], [B[0], y - 0.6, B[1]], hw + 0.4, 0.6);
      bag.add(S, fromTriangles(fl));
      // the wall
      const wa = [A[0] + n[0] * hw * out, A[1] + n[1] * hw * out], wb = [B[0] + n[0] * hw * out, B[1] + n[1] * hw * out];
      const np = Math.max(1, Math.round(len / 3.2));
      wall(ctx, el, { wa, wb, len, ux, uz, y, h, np, f: [-n[0] * out, -n[1] * out] });
      col.segment(wa, wb, 0.9, y - 0.6, y + h + 0.4);
      // the pillars on the open side, and those of the half-gallery beyond them
      for (let k = 0; k <= np; k++) {
        const s = k / np, p = [A[0] + (B[0] - A[0]) * s, A[1] + (B[1] - A[1]) * s];
        for (const off of el.half ? [-hw, -hw - 2.6] : [-hw]) {
          const q = [p[0] + n[0] * off * out, p[1] + n[1] * off * out], ph = off < -hw ? h * 0.62 : h;
          bag.add(S, box(q[0] - 0.32, y, q[1] - 0.32, q[0] + 0.32, y + ph, q[1] + 0.32));
          bag.add('sandstone_carved', box(q[0] - 0.42, y + ph - 0.35, q[1] - 0.42, q[0] + 0.42, y + ph, q[1] + 0.42));
          col.rect([q[0] - 0.32, q[1] - 0.32, q[0] + 0.32, q[1] + 0.32], y, y + ph);
        }
      }
      // the architrave over the pillars, the vault, the half-vault
      const ar = [], pa = [A[0] - n[0] * hw * out, A[1] - n[1] * hw * out], pb = [B[0] - n[0] * hw * out, B[1] - n[1] * hw * out];
      beamTris(ar, [pa[0], y + h, pa[1]], [pb[0], y + h, pb[1]], 0.38, 0.55);
      bag.add('sandstone_carved', fromTriangles(ar));
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], along = Math.abs(ux) > 0.5;
      rectRoof({ c: mid, A: len / 2 + (s0 === 0 && !gate ? hw : 0.2), B: hw + 0.6, y: y + h + 0.5, rise: w * 0.55, kind: 'gable', sweep: 0, curl: false, p: 0.7, alongZ: !along, mat: S, soffit: S }, bag);
      // the carved wooden ceiling under the vault
      // (the sides along z stop short of the corners, which the sides along x cover)
      const ch = hw - 0.37, t0 = Math.abs(uz) > 0.5 && s0 === 0 ? ch : 0, t1 = Math.abs(uz) > 0.5 && s1 >= L - 1e-6 ? ch : 0;
      ceiling(bag, [A[0] + ux * t0, A[1] + uz * t0], [B[0] - ux * t1, B[1] - uz * t1], ch, y + h + 0.32);
      if (el.half) {
        // the half-gallery's quarter-vault, from over the pillars down to the outer pillars, along its whole length
        const O = [-n[0] * out, -n[1] * out], start = s0 === 0 && !gate ? 0 : 0;
        void start;
        halfVault(bag, [pa[0] + O[0] * 0.38, pa[1] + O[1] * 0.38], [ux, uz], O, len, y + h + 0.3, y + h * 0.62 + 0.05, 2.6 + 0.42 - 0.38);
      }
      col.floor([Math.min(A[0], B[0]) - Math.abs(n[0]) * hw, Math.min(A[1], B[1]) - Math.abs(n[1]) * hw, Math.max(A[0], B[0]) + Math.abs(n[0]) * hw, Math.max(A[1], B[1]) + Math.abs(n[1]) * hw], y);
    }
    if (gate) kTower({ c: [a[0] + ux * L / 2, a[1] + uz * L / 2], y: y - 0.6, w: Math.min(gate * 0.55, 9), h: el.gateH ?? h * 3.2, tiers: 3, porches: false }, ctx);
  }
  if (el.corner) for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) kTower({ c: [x, z], y: y - 0.6, w: w * 1.1, h: el.corner, tiers: 4, porches: false }, ctx);
}

/**
 * k_terrace: a terrace of laterite faced with sandstone { rect, y0, y1 } with stepped mouldings
 * at its foot and its top, a walkable top.
 */
function kTerrace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1 } = el, H = y1 - y0;
  const bands = [[0, 0.12, 0.5], [0.12, 0.2, 0.25], [0.2, 0.82, 0], [0.82, 0.9, 0.25], [0.9, 1, 0.45]];
  for (const [a, b, o] of bands) bag.add(a > 0.15 && b < 0.85 ? S : 'sandstone_carved', box(x0 - o, y0 + H * a, z0 - o, x1 + o, y0 + H * b, z1 + o));
  bag.add(S, box(x0 + 0.1, y1 - 0.02, z0 + 0.1, x1 - 0.1, y1, z1 - 0.1));
  col.floor([x0, z0, x1, z1], y1);
  col.rect([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y0 - 0.3, y1 - 0.31);
}

/** A flat plate whose outline [[u, v]] is star-shaped about (cu, cv), stood at O (u along U, v up), thick t along N. */
function starPlate(out, pts, cu, cv, O, U, N, t) {
  const P = (u, v, w) => [O[0] + U[0] * u + N[0] * w, O[1] + v, O[2] + U[1] * u + N[1] * w], m = pts.length, T = [];
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % m];
    T.push(...P(cu, cv, 0), ...P(...b, 0), ...P(...a, 0), ...P(cu, cv, t), ...P(...a, t), ...P(...b, t));
    T.push(...P(...a, 0), ...P(...b, 0), ...P(...b, t), ...P(...a, 0), ...P(...b, t), ...P(...a, t));
  }
  // each triangle turned to face away from the plate's middle plane or, on the rim, out from the centre
  const C = P(cu, cv, t / 2);
  for (let i = 0; i < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx], c = [(T[i] + T[i + 3] + T[i + 6]) / 3 - C[0], (T[i + 1] + T[i + 4] + T[i + 7]) / 3 - C[1], (T[i + 2] + T[i + 5] + T[i + 8]) / 3 - C[2]];
    if (n[0] * c[0] + n[1] * c[1] + n[2] * c[2] < 0) for (let k = 0; k < 3; k++) { const tmp = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = tmp; }
  }
  for (const v of T) out.push(v);
  return out;
}
/**
 * A naga's raised head end at p, the serpent's body coming in along −D (D: the unit, in plan, the
 * heads look along), its body's axis at height yb: the body curving up out of the balustrade onto
 * a moulded pedestal, rising as the neck, and opening into a fan of `heads` hooded heads (the middle
 * one highest), each on its own neck, with the snout, the brow ridge and the eyes; behind them the
 * hood spread as a halo whose rim breaks into flame points.
 */
function nagaHeads(bag, p, D, y, yb, heads = 9, R = 1.25) {
  const U = perp(D), at = (d, u, v) => [p[0] + D[0] * d + U[0] * u, v, p[1] + D[1] * d + U[1] * u];
  // the pedestal: a moulded block under the rising body
  const pr = (d0, d1, u0, u1) => { const a = at(d0, u0, 0), b = at(d1, u1, 0); return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; };
  bag.add(C, boxR(pr(-0.75, 0.55, -0.62, 0.62), y, y + 0.16));
  bag.add(S, boxR(pr(-0.68, 0.48, -0.55, 0.55), y + 0.16, yb - 0.32));
  bag.add(C, boxR(pr(-0.74, 0.54, -0.6, 0.6), yb - 0.32, yb - 0.2));
  // the body bending up: a quarter turn from the balustrade's line to the upright neck
  const bend = 0.6, d0 = -0.4, segs = 5, pts = [];
  for (let i = 0; i <= segs; i++) { const a = i / segs * Math.PI / 2; pts.push(at(d0 + Math.sin(a) * bend, 0, yb + (1 - Math.cos(a)) * bend)); }
  pts.push(at(d0 + bend, 0, yb + bend + 0.85));
  for (let i = 0; i + 1 < pts.length; i++) bag.add(S, limb(pts[i], pts[i + 1], 0.27 - i * 0.008, 12));
  const hub = [0, yb + bend + 0.8], t = [], H = [];
  // the halo of the hood behind the heads, its rim in flame points
  const halo = [], n = heads * 2 + 1;
  for (let i = 0; i <= n; i++) { const a = Math.PI * (0.04 + 0.92 * i / n), r = R + (i % 2 ? 0.42 : 0.24); halo.push([Math.cos(a) * r, hub[1] + Math.sin(a) * r]); }
  halo.push([-0.3, hub[1] - 0.25], [0.3, hub[1] - 0.25]);
  starPlate(t, halo.reverse(), 0, hub[1] + 0.2, at(-0.3, 0, 0), U, D, 0.16);
  // the heads on their necks, in a fan
  for (let k = 0; k < heads; k++) {
    const a = Math.PI * (0.14 + 0.72 * k / (heads - 1)), mid = Math.abs(k - (heads - 1) / 2) < 0.6, rr = mid ? R * 1.06 : R, s = mid ? 1.18 : 1;
    const hc = at(0.08, Math.cos(a) * rr, hub[1] + Math.sin(a) * rr);
    H.push(limb(at(0.0, Math.cos(a) * R * 0.45, hub[1] + Math.sin(a) * R * 0.45), hc, 0.11 * s, 8));
    H.push(ellipsoidK(hc, D, U, 0.23 * s, 0.14 * s, 0.13 * s));                                                   // the head
    H.push(ellipsoidK(along(hc, D, 0.17 * s), D, U, 0.11 * s, 0.075 * s, 0.1 * s));                             // the snout
    for (const sg of [-1, 1]) H.push(ellipsoidK([hc[0] + D[0] * 0.08 * s + U[0] * sg * 0.075 * s, hc[1] + 0.08 * s, hc[2] + D[1] * 0.08 * s + U[1] * sg * 0.075 * s], D, U, 0.05 * s, 0.035 * s, 0.04 * s));   // the eyes under the brow
  }
  bag.add(S, fromTriangles(t));
  for (const g of H) bag.add(C, g);
}
/** An ellipsoid at c with its long axis (radius a) along D in plan, b across (U), h up. */
function ellipsoidK(c, D, U, a, h, b) {
  const p = []; for (let i = 0; i <= 6; i++) { const t = i / 6 * Math.PI; p.push([Math.max(0.001, Math.sin(t)), -Math.cos(t)]); }
  const g = lathe(p, 10).scale(b, h, a);                                                     // b across x, a along z
  const m = new Matrix4().makeBasis(new Vector3(U[0], 0, U[1]), new Vector3(0, 1, 0), new Vector3(D[0], 0, D[1]));
  return g.applyMatrix4(m).translate(c[0], c[1], c[2]);
}

/**
 * naga_rail: a serpent balustrade { a, b, y, h, heads, ends }: the serpent's body, round and ringed
 * with the bands of its scales, carried on short columns, and at each end (unless ends: false, or
 * 'a' / 'b' for one) the serpent rearing up as a fan of hooded heads.
 */
function nagaRail(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, y = el.y, h = el.h ?? 1.0;
  const yb = y + h - 0.12, r = Math.min(0.27, h * 0.27);
  bag.add(S, rod([ax, yb, az], [bx, yb, bz], r, 12));
  for (let s = 0.6; s < L - 0.3; s += 0.9) { const x = ax + ux * s, z = az + uz * s; bag.add(C, rod([x - ux * 0.06, yb, z - uz * 0.06], [x + ux * 0.06, yb, z + uz * 0.06], r + 0.03, 12)); }
  // the short columns: a moulded foot, a round shaft, a capital cupped under the body
  const n = Math.max(1, Math.round(L / 2.2)), ch = yb - r + 0.04 - y;
  const colP = [[0.22, 0], [0.22, 0.1], [0.17, 0.16], [0.14, 0.24], [0.13, ch * 0.5], [0.14, ch - 0.26], [0.18, ch - 0.2], [0.2, ch - 0.12], [0.24, ch - 0.06], [0.24, ch], [0.001, ch]];
  for (let k = 0; k <= n; k++) {
    if (el.ends !== false && (k === 0 || k === n)) continue;
    const s = k / n, x = ax + (bx - ax) * s, z = az + (bz - az) * s;
    bag.add(S, lathe(colP, 10, null, x, y, z));
  }
  col.segment(el.a, el.b, 0.5, y, y + h + 0.2);
  for (const [p, sg, key] of [[el.a, -1, 'a'], [el.b, 1, 'b']]) {
    if (el.ends === false || (typeof el.ends === 'string' && el.ends !== key)) continue;
    const D = [ux * sg, uz * sg];
    nagaHeads(bag, [p[0] + D[0] * 0.4, p[1] + D[1] * 0.4], D, y, yb, el.heads ?? 9, Math.max(0.6, h * 0.8));
    col.rect([p[0] + D[0] * 0.4 - 0.8, p[1] + D[1] * 0.4 - 0.8, p[0] + D[0] * 0.4 + 0.8, p[1] + D[1] * 0.4 + 0.8], y, y + h + 2);
  }
}

/**
 * k_library: a "library" on its own platform { rect, y, h }: a long hall of sandstone under a
 * corbelled vault ending in pediments, with a portico on each of its four sides — deeper ones at the
 * ends, each under its own pediment — and steps down from the platform on all four sides.
 */
function kLibrary(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 5;
  const c = [(x0 + x1) / 2, (z0 + z1) / 2], alongX = x1 - x0 >= z1 - z0, A = (alongX ? x1 - x0 : z1 - z0) / 2, B = (alongX ? z1 - z0 : x1 - x0) / 2;
  const NL = alongX ? [1, 0] : [0, 1], NS = alongX ? [0, 1] : [1, 0], dE = 1.5, dS = 1.2, m = 0.5;
  // the platform, wide enough for the porticoes, and its steps
  const pr = rUD(c, NL, -(B + dS + m), B + dS + m, -(A + dE + m), A + dE + m);
  kTerrace({ rect: pr, y0: 0, y1: y }, ctx);
  for (const N of [NL, [-NL[0], -NL[1]], NS, [-NS[0], -NS[1]]]) {
    const far = N[0] === NL[0] && N[1] === NL[1] || N[0] === -NL[0] && N[1] === -NL[1] ? A + dE + m : B + dS + m, run = y / 0.6 * 0.35;
    const r = rUD(c, N, -1.4, 1.4, far, far + run), dir = N[0] > 0 ? 'w' : N[0] < 0 ? 'e' : N[1] > 0 ? 'n' : 's';
    STYLES.qing.elements.stairs({ rect: r, y0: 0, y1: y, dir, mat: S }, ctx);
  }
  // the hall: its base moulding, walls, cornice
  bag.add(C, box(x0 - 0.3, y, z0 - 0.3, x1 + 0.3, y + 0.6, z1 + 0.3));
  bag.add(S, box(x0, y + 0.6, z0, x1, y + h - 0.5, z1));
  bag.add(C, box(x0 - 0.3, y + h - 0.5, z0 - 0.3, x1 + 0.3, y + h, z1 + 0.3));
  col.rect([x0, z0, x1, z1], y, y + h);
  // the nave raised over the aisles: half-vaults on the aisles, a clerestory, the nave's vault and its pediments at the ends
  const bn = B * 0.62, hc = 1.3, W = 2 * bn + 0.4, Hv = bn * 1.1, v = [], U = perp(NL);
  bag.add(S, boxR(rUD(c, NL, -bn, bn, -A, A), y + h, y + h + hc));
  bag.add(C, boxR(rUD(c, NL, -bn - 0.2, bn + 0.2, -A - 0.2, A + 0.2), y + h + hc - 0.3, y + h + hc));
  for (const s of [-1, 1]) {
    const q = []; for (let i = 0; i <= 6; i++) { const t = i / 6; q.push([s * (bn + (B + 0.3 - bn) * t), (hc - 0.3) * Math.pow(1 - t, 0.7)]); }
    q.push([s * bn, 0]);
    prism(v, q, [c[0] - NL[0] * (A + 0.3), y + h, c[1] - NL[1] * (A + 0.3)], U, NL, 2 * A + 0.6);
  }
  prism(v, ARCH(W, Hv), [c[0] - NL[0] * (A + 0.3), y + h + hc, c[1] - NL[1] * (A + 0.3)], U, NL, 2 * A + 0.6);
  bag.add(S, fromTriangles(v));
  for (const N of [NL, [-NL[0], -NL[1]]]) pediment(bag, along([c[0], y + h + hc, c[1]], N, A + 0.25), N, W, Hv, 0.35);
  // blind windows with balusters on the long walls either side of the side porticoes
  for (const N of [NS, [-NS[0], -NS[1]]]) for (const s of [-1, 1]) { const Uu = perp(N), u = s * A * 0.62; blindWindow(bag, [c[0] + N[0] * B + Uu[0] * u, c[1] + N[1] * B + Uu[1] * u], N, y + 1.4, 1.2, 1.6); }
  // the porticoes
  for (const N of [NL, [-NL[0], -NL[1]]]) portico(ctx, { c, N, y, d0: A, depth: dE, width: B * 1.3, h: h * 0.82, tiers: 1 });
  for (const N of [NS, [-NS[0], -NS[1]]]) portico(ctx, { c, N, y, d0: B, depth: dS, width: Math.min(3.2, A * 0.6), h: h * 0.75, tiers: 1 });
}

/** k_lion: a guardian lion { at, y, face (e|w|n|s), s } sitting up on its haunches on a moulded pedestal, its mane a ruff round the head. */
function kLion(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, f = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] }[el.face ?? 'e'], U = perp(f);
  const P = (u, v, w) => [x + (f[0] * w + U[0] * u) * s, y + v * s, z + (f[1] * w + U[1] * u) * s];
  const R = (u0, u1, w0, w1) => { const a = P(u0, 0, w0), b = P(u1, 0, w1); return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; };
  bag.add(C, boxR(R(-0.42, 0.42, -0.62, 0.55), y, y + 0.15 * s));
  bag.add(S, boxR(R(-0.36, 0.36, -0.56, 0.49), y + 0.15 * s, y + 0.58 * s));
  bag.add(C, boxR(R(-0.4, 0.4, -0.6, 0.53), y + 0.58 * s, y + 0.7 * s));
  col.rect(R(-0.42, 0.42, -0.62, 0.55), y, y + 1.9 * s);
  const parts = [
    [P(-0.2, 0.92, -0.26), P(0.2, 0.92, -0.26), 0.22], [P(0, 0.92, -0.26), P(0, 1.42, 0.08), 0.23],      // haunches, body
    [P(-0.21, 0.76, -0.12), P(-0.21, 0.76, 0.14), 0.075], [P(0.21, 0.76, -0.12), P(0.21, 0.76, 0.14), 0.075], // hind feet
    [P(-0.13, 0.74, 0.22), P(-0.12, 1.28, 0.1), 0.075], [P(0.13, 0.74, 0.22), P(0.12, 1.28, 0.1), 0.075],     // forelegs
    [P(0, 1.62, 0.0), P(0, 1.62, 0.13), 0.28],                                                              // the mane
    [P(0, 1.63, 0.1), P(0, 1.63, 0.3), 0.17], [P(0, 1.56, 0.28), P(0, 1.55, 0.42), 0.1],                     // head, muzzle
    [P(-0.12, 1.8, 0.12), P(-0.14, 1.88, 0.12), 0.04], [P(0.12, 1.8, 0.12), P(0.14, 1.88, 0.12), 0.04],       // ears
    [P(0, 0.76, -0.48), P(0, 1.0, -0.5), 0.04], [P(0, 1.0, -0.5), P(0, 1.3, -0.38), 0.04],                   // the tail curled up the back
  ];
  for (const [a, b, r] of parts) bag.add(C, limb(a, b, r * s, 10));
  for (const u of [-0.13, 0.13]) bag.add(C, boxR(R(u - 0.08, u + 0.08, 0.16, 0.3), y + 0.7 * s, y + 0.78 * s));
}

/**
 * stilt_house: a village house { rect, front, seed }: posts of timber 2–2.5 m tall, a floor of
 * planks, walls of planks or woven palm leaf, a steep gabled roof of palm thatch, a ladder.
 */
function stiltHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, up = 2.0 + rand() * 0.6, wallH = 2.3;
  const along = x1 - x0 >= z1 - z0;
  for (let i = 0; i <= 3; i++) for (let j = 0; j <= 2; j++) {
    const x = x0 + (x1 - x0) * i / 3, z = z0 + (z1 - z0) * j / 2;
    bag.add('timber', lathe([[0.12, 0], [0.11, up + wallH]], 6, null, x, 0, z));
    col.circle(x, z, 0.14, 0, up);
  }
  bag.add('timber', box(x0 - 0.1, up - 0.15, z0 - 0.1, x1 + 0.1, up, z1 + 0.1));
  const wall = rand() < 0.5 ? 'reed_mat' : 'timber';
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) {
    const t = [];
    beamTris(t, [a[0], up, a[1]], [b[0], up, b[1]], 0.04, wallH);
    bag.add(wall, fromTriangles(t));
  }
  const dx = el.front === 'e' ? 1 : el.front === 'w' ? -1 : 0, dz = el.front === 's' ? 1 : el.front === 'n' ? -1 : 0;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
  const lx = cx + dx * (hx + 1.2), lz = cz + dz * (hz + 1.2);
  const lad = [];
  beamTris(lad, [lx, 0, lz], [cx + dx * hx, up, cz + dz * hz], 0.45, 0.08);
  bag.add('timber', fromTriangles(lad));
  col.rect([x0, z0, x1, z1], up - 0.2, up + wallH + 2);
  rectRoof({ c: [cx, cz], A: (along ? x1 - x0 : z1 - z0) / 2 + 0.8, B: (along ? z1 - z0 : x1 - x0) / 2 + 0.9, y: up + wallH, rise: (along ? z1 - z0 : x1 - x0) * 0.62, kind: 'gable', sweep: 0, curl: false, p: 1.05, alongZ: !along, mat: 'thatch_palm', soffit: 'thatch_palm' }, bag);
}

// ---- the cruciform cloister (Preah Poan), the steep stairs of the Bakan ---------------------------

/**
 * A straight gallery of the cloister along x (axis 'x') or z, its centre line from u0 to u1 at v
 * (the other coordinate): a plinth 0.4 high with its moulding, the floor at y + 0.4; on each side
 * (sides: [the −v side, the +v side]) square pillars ('pillars', every ~3 m, skipped inside the
 * `skip` spans where other galleries cross; walls open there only on the sides `skipOn`), a wall with turned balusters in its windows
 * ('windows'), or a blind wall with devatas ('wall'); the architrave, the corbelled vault.
 */
function cloisterGallery(ctx, { axis, u0, u1, v, y, w, h, sides, skip = [], skipOn = [0, 1], doors = [] }) {
  const { bag, col } = ctx, hw = w / 2, X = axis === 'x', fy = y + 0.4, L = u1 - u0;
  const R = (a0, a1, b0, b1) => (X ? [a0, b0, a1, b1] : [b0, a0, b1, a1]);
  const P = (u, o) => (X ? [u, v + o] : [v + o, u]);
  // the plinth: its moulded foot and lip, the floor
  bag.add(C, boxR(R(u0, u1, v - hw - 0.55, v + hw + 0.55), y, y + 0.12));
  bag.add(S, boxR(R(u0, u1, v - hw - 0.45, v + hw + 0.45), y + 0.12, y + 0.3));
  bag.add(C, boxR(R(u0, u1, v - hw - 0.6, v + hw + 0.6), y + 0.3, fy));
  col.rect(R(u0, u1, v - hw - 0.6, v + hw + 0.6), y, fy - 0.01); col.floor(R(u0, u1, v - hw - 0.6, v + hw + 0.6), fy);
  const inSkip = (u, m = 0) => skip.some(([a, b]) => u > a - m && u < b + m);
  sides.forEach((kind, i) => {
    const o = i ? hw : -hw, N = X ? [0, i ? 1 : -1] : [i ? 1 : -1, 0];
    if (kind === 'pillars') {
      const np = Math.max(1, Math.round(L / 3));
      for (let k = 0; k <= np; k++) {
        const u = u0 + L * k / np; if (inSkip(u, 0.5)) continue;
        const q = P(u, o);
        bag.add(S, box(q[0] - 0.3, fy, q[1] - 0.3, q[0] + 0.3, fy + h, q[1] + 0.3));
        bag.add(C, box(q[0] - 0.36, fy, q[1] - 0.36, q[0] + 0.36, fy + 0.45, q[1] + 0.36));                 // the base, with its praying ascetics
        bag.add(C, box(q[0] - 0.4, fy + h - 0.35, q[1] - 0.4, q[0] + 0.4, fy + h, q[1] + 0.4));             // the capital
        col.rect([q[0] - 0.36, q[1] - 0.36, q[0] + 0.36, q[1] + 0.36], fy, fy + h);
      }
      const ar = [], a = P(u0, o), b = P(u1, o);
      beamTris(ar, [a[0], fy + h, a[1]], [b[0], fy + h, b[1]], 0.38, 0.55);
      bag.add(C, fromTriangles(ar));
    } else {
      // a wall, broken where the doors and the crossing galleries open into it
      const gaps = [...(skipOn.includes(i) ? skip : []).filter(([a, b]) => b > u0 && a < u1), ...doors.map((d) => [d - 1.1, d + 1.1])].sort((p, q) => p[0] - q[0]);
      let s = u0;
      for (const [g0, g1] of [...gaps, [u1, u1]]) {
        if (g0 - s > 0.3) {
          const wa = P(s, o), wb = P(g0, o), len = g0 - s;
          wall(ctx, { windows: kind === 'windows', devatas: kind === 'wall' }, { wa, wb, len, ux: X ? 1 : 0, uz: X ? 0 : 1, y: fy, h, np: Math.max(1, Math.round(len / 3.2)), f: [-N[0], -N[1]] });
          col.segment(wa, wb, 0.9, fy, fy + h + 0.4);
        }
        if (doors.some((d) => Math.abs(d - (g0 + g1) / 2) < 0.01)) doorway(bag, P((g0 + g1) / 2, o), N, -0.45, fy, 0.9, 2.6);
        s = Math.max(s, g1);
      }
    }
  });
  // the carved wooden ceiling, broken where a crossing rises higher
  let cu = u0;
  for (const [a, b] of [...skip.filter(([a, b]) => b > u0 && a < u1).sort((p, q) => p[0] - q[0]), [u1, u1]]) { if (a - cu > 0.5) ceiling(bag, P(cu, 0), P(a, 0), hw - 0.37, fy + h + 0.32); cu = Math.max(cu, b); }
  rectRoof({ c: P((u0 + u1) / 2, 0), A: L / 2, B: hw + 0.6, y: fy + h + 0.5, rise: w * 0.55, kind: 'gable', sweep: 0, curl: false, p: 0.7, alongZ: !X, mat: S, soffit: S }, bag);
}

/**
 * k_cloister: the cruciform cloister between the third gallery's west entrance and the second
 * level { rect: [x0, z0, x1, z1] (x0 the third gallery's inner wall, x1 the second level's face),
 * y, w, h, west (where the axial gallery begins, behind the entrance tower), stair (the x of the
 * foot of the stair up to the second level) }: two
 * galleries crossing — the axial one from the entrance to the stair, the transverse one between the
 * side galleries — with a raised vault at their crossing; the north gallery walled on both sides
 * (the Hall of Echoes), the south one open on pillars to the court; in each of the four courts a
 * sunken basin, paved, its sides stepped down in three tiers to the water (the terrace around it
 * is built in pieces round the basins: `basins` gives them).
 */
function kCloister(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, w = el.w ?? 4, h = el.h ?? 3.4, hw = w / 2, xs = el.stair;
  const xm = el.cross ?? (x0 + x1) / 2, gn = z0 + hw + 0.6, gs = z1 - hw - 0.6, fy = y + 0.4;
  // the Hall of Echoes on the north, the south gallery, the axial and the transverse galleries
  cloisterGallery(ctx, { axis: 'x', u0: x0, u1: x1, v: gn, y, w, h, sides: ['windows', 'windows'], skip: [[xm - hw, xm + hw]], skipOn: [1] });
  cloisterGallery(ctx, { axis: 'x', u0: x0, u1: x1, v: gs, y, w, h, sides: ['pillars', 'windows'], skip: [[xm - hw, xm + hw]], skipOn: [0] });
  cloisterGallery(ctx, { axis: 'x', u0: el.west ?? x0, u1: xs, v: 0, y, w, h, sides: ['pillars', 'pillars'], skip: [[xm - hw, xm + hw]] });
  for (const [a, b] of [[gn + hw + 0.6, -hw - 0.6], [hw + 0.6, gs - hw - 0.6]]) cloisterGallery(ctx, { axis: 'z', u0: a, u1: b, v: xm, y, w, h, sides: ['pillars', 'pillars'] });
  // the crossing: a square bay under a taller vault, pediments on its four faces
  bag.add(C, boxR([xm - hw - 0.6, -hw - 0.6, xm + hw + 0.6, hw + 0.6], y, fy)); col.floor([xm - hw - 0.6, -hw - 0.6, xm + hw + 0.6, hw + 0.6], fy);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const q = [xm + sx * hw, sz * hw];
    bag.add(S, box(q[0] - 0.4, fy, q[1] - 0.4, q[0] + 0.4, fy + h + 0.6, q[1] + 0.4)); col.rect([q[0] - 0.4, q[1] - 0.4, q[0] + 0.4, q[1] + 0.4], fy, fy + h + 0.6);
    bag.add(C, box(q[0] - 0.48, fy + h + 0.25, q[1] - 0.48, q[0] + 0.48, fy + h + 0.6, q[1] + 0.48));
  }
  for (const alongZ of [false, true]) rectRoof({ c: [xm, 0], A: hw + 0.9, B: hw + 0.9, y: fy + h + 1.1, rise: w * 0.9, kind: 'gable', sweep: 0, curl: false, p: 0.7, alongZ, mat: S, soffit: S }, bag);
  for (const N of [[1, 0], [-1, 0], [0, 1], [0, -1]]) pediment(bag, along([xm, fy + h + 1.1, 0], N, hw + 0.85), N, w + 1.2, w * 0.9, 0.3);
  // the basins: three tiers stepping down 0.5 m and in 0.7 m, a paved floor, the water over the lowest tier
  for (const [bx0, bz0, bx1, bz1] of el.basins) {
    const ring = (d0, d1, top, mat) => {
      for (const r of [[bx0 + d0, bz0 + d0, bx1 - d0, bz0 + d1], [bx0 + d0, bz1 - d1, bx1 - d0, bz1 - d0], [bx0 + d0, bz0 + d1, bx0 + d1, bz1 - d1], [bx1 - d1, bz0 + d1, bx1 - d0, bz1 - d1]]) bag.add(mat, boxR(r, y - 1.7, top));
      col.floor([bx0 + d0, bz0 + d0, bx1 - d0, bz0 + d1], top); col.floor([bx0 + d0, bz1 - d1, bx1 - d0, bz1 - d0], top);
      col.floor([bx0 + d0, bz0 + d1, bx0 + d1, bz1 - d1], top); col.floor([bx1 - d1, bz0 + d1, bx1 - d0, bz1 - d1], top);
    };
    ring(0, 0.7, y - 0.5, 'laterite'); ring(0.7, 1.4, y - 1.0, S); ring(1.4, 2.1, y - 1.5, S);
    // the lip of each tier, a moulding along its edge
    for (const [d, top] of [[0.7, y - 0.5], [1.4, y - 1.0], [2.1, y - 1.5]]) for (const r of [[bx0 + d - 0.1, bz0 + d - 0.1, bx1 - d + 0.1, bz0 + d + 0.04], [bx0 + d - 0.1, bz1 - d - 0.04, bx1 - d + 0.1, bz1 - d + 0.1], [bx0 + d - 0.1, bz0 + d, bx0 + d + 0.04, bz1 - d], [bx1 - d - 0.04, bz0 + d, bx1 - d + 0.1, bz1 - d]]) bag.add(C, boxR(r, top - 0.14, top + 0.03));
    bag.add(S, boxR([bx0 + 2.1, bz0 + 2.1, bx1 - 2.1, bz1 - 2.1], y - 1.7, y - 1.65)); col.floor([bx0 + 2.1, bz0 + 2.1, bx1 - 2.1, bz1 - 2.1], y - 1.65);
    bag.add('water', boxR([bx0 + 1.4, bz0 + 1.4, bx1 - 1.4, bz1 - 1.4], y - 1.28, y - 1.26));
  }
}

/**
 * k_stair: a steep Khmer stair { rect, y0, y1, dir, cheek }: narrow treads and tall risers (the
 * Bakan's climb at about 65°), between stepped cheek walls (`cheek` wide) that rise with it in
 * flights of four steps, each cheek block capped with a moulding.
 */
function kStair(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1, dir } = el, ch = el.cheek ?? 0.7, n = Math.max(1, Math.round((y1 - y0) / (el.riser ?? 0.32)));
  const alongZ = dir === 'n' || dir === 's', len = alongZ ? z1 - z0 : x1 - x0;
  const span = (f0, f1) => (dir === 'n' ? [x0, z1 - len * f1, x1, z1 - len * f0] : dir === 's' ? [x0, z0 + len * f0, x1, z0 + len * f1] : dir === 'e' ? [x0 + len * f0, z0, x0 + len * f1, z1] : [x1 - len * f1, z0, x1 - len * f0, z1]);
  const full = (r) => (dir === 'n' ? [r[0], z0, r[2], r[3]] : dir === 's' ? [r[0], r[1], r[2], z1] : dir === 'e' ? [r[0], r[1], x1, r[3]] : [x0, r[1], r[2], r[3]]);
  for (let k = 0; k < n; k++) {
    const r = full(span(k / n, (k + 1) / n)), yy = y0 + (y1 - y0) * (k + 1) / n;
    bag.add(S, boxR(r, Math.max(y0 - 0.2, yy - 1.2), yy));
  }
  col.ramp([x0, z0, x1, z1], y0, y1, dir);
  // the cheek walls, in flights of four steps
  const g = 4, ng = Math.ceil(n / g);
  for (const side of [0, 1]) {
    for (let k = 0; k < ng; k++) {
      const f0 = k * g / n, f1 = Math.min(1, (k + 1) * g / n), yy = y0 + (y1 - y0) * f1 + 0.45, sp = span(f0, f1);
      const r = alongZ ? [side ? x1 : x0 - ch, sp[1], side ? x1 + ch : x0, sp[3]] : [sp[0], side ? z1 : z0 - ch, sp[2], side ? z1 + ch : z0];
      bag.add(S, boxR(r, y0 - 0.2, yy - 0.18));
      bag.add(C, boxR([r[0] - 0.05, r[1] - 0.05, r[2] + 0.05, r[3] + 0.05], yy - 0.18, yy));
      col.rect(r, y0, yy);
    }
  }
}

registerStyle('khmer', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    k_tower: kTower, k_gallery: kGallery, k_terrace: kTerrace, naga_rail: nagaRail, k_library: kLibrary, k_lion: kLion, stilt_house: stiltHouse, k_cloister: kCloister, k_stair: kStair, k_vishnu: kVishnu,
  },
  objects: {},
});
