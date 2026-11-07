// The Kremlin's Cathedral Square about 1600 (docs/settlements/muscovy.md §1, "Ivan the Great",
// "The Archangel", "The Annunciation"): Ivan the Great's bell tower as Boris Godunov finished it in
// 1600 — three octagons with open bell arcades, the tier of keel-shaped kokoshniks, the drum with its
// inscription and the gilded dome — and Petrok Maly's belfry against its north side; the Archangel
// cathedral of Aloisio the New, red brick with white-stone orders, a belt between two storeys, and
// the scallop shells in its zakomaras; the Annunciation on its high white-stone basement with the
// galleries round three sides, the four corner chapels and nine gilded domes.

import { orientedBox } from '../../core/build.js';
import { box, lathe, quad, fromTriangles, orientOutward } from '../../core/geom.js';
import { Shape, Path } from '../../core/three.js';
import { slab, halfLathe, hexa } from '../norse/index.js';
import { kokoshnikShape, helmet, onion } from './index.js';

const BR = 'brick_kremlin', WS = 'limestone', G = 'gilt_bronze';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A prism of n flat faces round (cx, cz), vertex radius R0 at y0 and R1 at y1, its vertices at rot + 2πk/n. */
function ngon(cx, cz, R0, y0, y1, n = 8, R1 = R0, rot = 0) {
  const t = [], P = (R, y, k) => { const a = rot + k * Math.PI * 2 / n; return [cx + Math.cos(a) * R, y, cz + Math.sin(a) * R]; };
  for (let k = 0; k < n; k++) quad(t, P(R0, y0, k), P(R0, y0, k + 1), P(R1, y1, k + 1), P(R1, y1, k));
  for (let k = 1; k + 1 < n; k++) { t.push(...P(R0, y0, 0), ...P(R0, y0, k), ...P(R0, y0, k + 1)); t.push(...P(R1, y1, 0), ...P(R1, y1, k + 1), ...P(R1, y1, k)); }
  return fromTriangles(orientOutward(t));
}
/** A round-headed outline (u0…u1, from v0, springing at vs) as a Path or Shape. */
function archPath(P, u0, u1, v0, vs, cw = false) { const r = (u1 - u0) / 2; P.moveTo(u0, v0); P.lineTo(u1, v0); P.lineTo(u1, vs); P.absarc(u0 + r, vs, r, 0, Math.PI, cw); P.lineTo(u0, v0); return P; }
/** A wall L long and H high pierced by round-headed openings [{ u (centre), w, v0, vs }]. */
function arcadeShape(L, H, ops) { const s = new Shape(); s.moveTo(0, 0); s.lineTo(L, 0); s.lineTo(L, H); s.lineTo(0, H); s.lineTo(0, 0); for (const o of ops) s.holes.push(archPath(new Path(), o.u - o.w / 2, o.u + o.w / 2, o.v0, o.vs)); return s; }
/** An arch's frame: the band (b wide) round a round-headed opening, down to v0. */
function archFrame(u0, u1, v0, vs, b) { const s = new Shape(), r = (u1 - u0) / 2, m = u0 + r; s.moveTo(u0 - b, v0); s.lineTo(u0, v0); s.lineTo(u0, vs); s.absarc(m, vs, r, Math.PI, 0, true); s.lineTo(u1, v0); s.lineTo(u1 + b, v0); s.lineTo(u1 + b, vs); s.absarc(m, vs, r + b, 0, Math.PI, false); s.lineTo(u0 - b, v0); return s; }
/** A face of a building: from a along dir (unit) for L, outward normal n; P(u, d) the plan point u along and d out. */
function face(a, dir, L) { const n = [dir[1], -dir[0]]; return { a, dir, L, n, P: (u, d = 0) => [a[0] + dir[0] * u + n[0] * d, a[1] + dir[1] * u + n[1] * d] }; }
/** A shape on face F standing from d0 to d1 out of the face plane, from height y. */
function onFace(bag, mat, F, shape, y, d0, d1, seg = 8) { const th = d1 - d0, m = (d0 + d1) / 2; bag.add(mat, slab(shape, th, F.P(0, m), F.P(1, m), y, seg)); }
// slab()'s u runs along a→b with b one metre on: shapes drawn in metres along the face line
/** The four faces of a rect, running round it with the outside on their left-hand normal (n = (dz, −dx)). */
function rectFaces([x0, z0, x1, z1]) {
  return { n: face([x0, z0], [1, 0], x1 - x0), s: face([x1, z1], [-1, 0], x1 - x0), w: face([x0, z1], [0, -1], z1 - z0), e: face([x1, z0], [0, 1], z1 - z0) };
}
/** A keel-shaped gable (kokoshnik) w wide, moved u0 along its face. */
function kokAt(w, h1, h2, u0) { const pts = kokoshnikShape(w, h1, h2).getPoints(8), sh = new Shape(); sh.moveTo(pts[0].x + u0, pts[0].y); for (const p of pts.slice(1)) sh.lineTo(p.x + u0, p.y); return sh; }
/** A bell: its bronze body hung from a timber beam by its crown, mouth at y. */
function bell(bag, x, y, z, r) {
  bag.add('bronze', lathe([[r, 0], [r * 0.96, r * 0.12], [r * 0.78, r * 0.3], [r * 0.66, r * 0.8], [r * 0.62, r * 1.25], [r * 0.48, r * 1.42], [r * 0.2, r * 1.5], [0.001, r * 1.52]], 16, null, x, y, z));
  bag.add('bronze', lathe([[r * 1.02, 0], [r * 1.02, r * 0.07], [r * 0.9, r * 0.1], [0.001, r * 0.1]], 16, null, x, y - 0.001, z));
  bag.add('iron', box(x - 0.05, y + r * 1.52, z - 0.05, x + 0.05, y + r * 1.75, z + 0.05));
}
/** A row of small round arches hanging from a band (the arcature frieze), L long, the band h high: pendants between the arches. */
function arcature(L, h, n) {
  const s = new Shape(), p = L / n, r = p * 0.36; s.moveTo(0, h); s.lineTo(0, 0);
  for (let i = 0; i < n; i++) { const u = (i + 0.5) * p; s.lineTo(u - r - p * 0.06, 0); s.lineTo(u - r, h * 0.12); s.lineTo(u - r, h * 0.35); s.absarc(u, h * 0.35, r, Math.PI, 0, true); s.lineTo(u + r, h * 0.12); s.lineTo(u + r + p * 0.06, 0); }
  s.lineTo(L, 0); s.lineTo(L, h); s.lineTo(0, h); return s;
}
/** A white-stone window: the opening, round-headed, in its frame, a small pediment over it. */
function windowOn(bag, F, u, y, w, h, d = 0) {
  onFace(bag, 'opening', F, archPath(new Shape(), u - w / 2, u + w / 2, 0, h - w / 2), y, d - 0.04, d + 0.03, 8);
  onFace(bag, WS, F, archFrame(u - w / 2, u + w / 2, 0, h - w / 2, 0.16), y, d - 0.01, d + 0.1, 8);
  const ped = new Shape(); ped.moveTo(u - w / 2 - 0.3, 0); ped.lineTo(u + w / 2 + 0.3, 0); ped.lineTo(u, 0.45 + w * 0.1); ped.lineTo(u - w / 2 - 0.3, 0);
  onFace(bag, WS, F, ped, y + h + 0.12, d - 0.01, d + 0.16, 2);
  onFace(bag, WS, F, (() => { const s = new Shape(); s.moveTo(u - w / 2 - 0.25, 0); s.lineTo(u + w / 2 + 0.25, 0); s.lineTo(u + w / 2 + 0.3, 0.12); s.lineTo(u - w / 2 - 0.3, 0.12); s.lineTo(u - w / 2 - 0.25, 0); return s; })(), y - 0.12, d - 0.01, d + 0.14, 2);
}
/** An Orthodox cross (three bars, the lowest slanting) on an apple, from y, H high, gilt. */
function cross8(bag, x, y, z, H) {
  bag.add(G, lathe([[0.001, 0], [0.22, 0.08], [0.26, 0.26], [0.18, 0.44], [0.001, 0.48]], 12, null, x, y, z));
  const t = H * 0.02 + 0.04, y0 = y + 0.46;
  bag.add(G, box(x - t, y0, z - t, x + t, y0 + H, z + t));
  bag.add(G, box(x - t, y0 + H * 0.66, z - H * 0.24, x + t, y0 + H * 0.66 + 2 * t, z + H * 0.24));
  bag.add(G, box(x - t, y0 + H * 0.86, z - H * 0.12, x + t, y0 + H * 0.86 + 2 * t, z + H * 0.12));
  const g = box(-t, -t, -H * 0.16, t, t, H * 0.16); g.rotateX(0.35); g.translate(x, y0 + H * 0.3, z); bag.add(G, g);
}

// ── Ivan the Great ────────────────────────────────────────────────────────────────────────────────
/**
 * ivan_tower: { c, y } — the tower about 1600, 81 m to the cross: the first octagon (the church of St John
 * Climacus within, two storeys of windows), its cornice and gallery; the second and third octagons with an
 * open arch in every face and a bell in each, round a central pillar; Godunov's work of 1600 — two rows of
 * keel-shaped kokoshniks (the lower gilded), the drum in three registers parted by twisted white-stone bands
 * with eight slit windows under pediments, the gilt inscription on a blue band under the dome, the gilded
 * dome and its cross; and against its north face Petrok Maly's belfry (1532–43) with its bells.
 */
export function ivanTower(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, rot = Math.PI / 8, ap = Math.cos(Math.PI / 8), rand = rng(1600);
  const faceOf = (R, k) => { const a0 = rot + k * Math.PI / 4, a1 = a0 + Math.PI / 4, p = [x + Math.cos(a0) * R, z + Math.sin(a0) * R], q = [x + Math.cos(a1) * R, z + Math.sin(a1) * R]; const L = Math.hypot(q[0] - p[0], q[1] - p[1]); return face(p, [(q[0] - p[0]) / L, (q[1] - p[1]) / L], L); };
  const north = (k) => k === 6;                   // the face toward the belfry (the face centres stand at kπ/4; north is −z)
  // ── the first octagon: plinth, walls, corner strips, the belt and the cornice with its arcature; two storeys of windows
  const R1 = 9, Y1 = y + 26;
  bag.add(BR, ngon(x, z, R1, y - 0.5, Y1, 8, R1, rot)); col.circle(x, z, R1 * ap, y, Y1);
  bag.add(WS, ngon(x, z, R1 + 0.35, y - 0.5, y + 1.4, 8, R1 + 0.35, rot)); bag.add(WS, ngon(x, z, R1 + 0.35, y + 1.4, y + 1.75, 8, R1 + 0.05, rot));
  bag.add(WS, ngon(x, z, R1 + 0.22, y + 12.6, y + 13.3, 8, R1 + 0.22, rot));
  bag.add(WS, ngon(x, z, R1 + 0.3, Y1 - 1.5, Y1 - 0.6, 8, R1 + 0.3, rot)); bag.add(WS, ngon(x, z, R1 + 0.3, Y1 - 0.6, Y1, 8, R1 + 0.6, rot));
  for (let k = 0; k < 8; k++) {
    const F = faceOf(R1, k), a = rot + k * Math.PI / 4;
    bag.add(WS, ngon(x + Math.cos(a) * (R1 - 0.1), z + Math.sin(a) * (R1 - 0.1), 0.55, y + 1.75, Y1 - 1.5, 4, 0.55, a));
    onFace(bag, WS, face(F.P(0.6), F.dir, F.L - 1.2), arcature(F.L - 1.2, 0.9, 5), Y1 - 2.4, -0.01, 0.12, 6);
    if (north(k)) continue;
    windowOn(bag, F, F.L / 2, y + 4.6, 1.2, 3.6); windowOn(bag, F, F.L / 2, y + 16.2, 1.1, 3.4);
  }
  // ── a gallery round the head of each octagon: the parapet with its white cap
  const gallery = (R, Y) => { for (let k = 0; k < 8; k++) { const F = faceOf(R * ap - 0.3 > 0 ? R : R, k); bag.add(BR, orientedBox(F.P(0, -0.3), F.P(F.L, -0.3), 0.45, Y, Y + 1.0 + (k % 2) * 0.003, 0.1)); bag.add(WS, orientedBox(F.P(0, -0.3), F.P(F.L, -0.3), 0.58, Y + 1.0, Y + 1.14 + (k % 2) * 0.004, 0.14)); } };
  gallery(R1 + 0.3, Y1);
  // ── the two belfry octagons: eight walls each pierced by an arch, corner piers, the pillar in the middle, a bell in every arch
  const belfry = (R, Y0, H, th, br) => {
    const fw = 2 * R * Math.sin(Math.PI / 8), ow = fw * 0.58, vs = H * 0.62;
    for (let k = 0; k < 8; k++) {
      const F = faceOf(R, k), a = rot + k * Math.PI / 4, c = rot + (k + 0.5) * Math.PI / 4;
      onFace(bag, BR, F, arcadeShape(F.L, H, [{ u: F.L / 2, w: ow, v0: 1.0, vs }]), Y0, -th, 0, 12);
      onFace(bag, WS, F, archFrame(F.L / 2 - ow / 2, F.L / 2 + ow / 2, 1.0, vs, 0.22), Y0, -0.01, 0.14, 12);
      onFace(bag, WS, F, (() => { const s = new Shape(); s.moveTo(F.L / 2 - ow / 2 - 0.3, 0); s.lineTo(F.L / 2 + ow / 2 + 0.3, 0); s.lineTo(F.L / 2 + ow / 2 + 0.3, 0.14); s.lineTo(F.L / 2 - ow / 2 - 0.3, 0.14); s.lineTo(F.L / 2 - ow / 2 - 0.3, 0); return s; })(), Y0 + 0.86, -0.01, 0.2, 2);
      bag.add(BR, ngon(x + Math.cos(a) * (R - th * 0.5), z + Math.sin(a) * (R - th * 0.5), th * 0.75, Y0, Y0 + H, 4, th * 0.75, a));
      bag.add(WS, ngon(x + Math.cos(a) * (R - 0.08), z + Math.sin(a) * (R - 0.08), 0.42, Y0 + 0.2, Y0 + H - 0.9, 4, 0.42, a));
      onFace(bag, WS, face(F.P(0.4), F.dir, F.L - 0.8), arcature(F.L - 0.8, 0.6, 3), Y0 + H - 1.3, -0.01, 0.1, 6);
      // the bell: on a beam from the pillar out to the wall, hanging in the arch
      const Rb = R * ap - th - 0.15, rb = br * (0.8 + 0.4 * rand()), ca = Math.cos(c), sa = Math.sin(c), ys = Y0 + vs + 0.2;
      bag.add('timber', orientedBox([x + ca * 1.4, z + sa * 1.4], [x + ca * (R * ap - th + 0.1), z + sa * (R * ap - th + 0.1)], 0.3, ys, ys + 0.32));
      bell(bag, x + ca * (Rb - rb), ys - rb * 1.75, z + sa * (Rb - rb), rb);
    }
    bag.add(BR, ngon(x, z, 1.5, Y0, Y0 + H, 8, 1.5, rot));                                          // the pillar (the stair winds in it)
    bag.add(BR, ngon(x, z, R - 0.02, Y0 + H - 0.75, Y0 + H, 8, R - 0.02, rot));                       // the vault's floor above
    bag.add(WS, ngon(x, z, R + 0.3, Y0 + H - 0.35, Y0 + H + 0.25, 8, R + 0.55, rot));               // the cornice
  };
  const R2 = 7.2, Y2 = Y1 + 0.02, H2 = 13; belfry(R2, Y2, H2, 1.3, 0.85); gallery(R2 + 0.45, Y2 + H2 + 0.25);
  const R3 = 5.7, Y3 = Y2 + H2 + 0.25, H3 = 10.5; belfry(R3, Y3, H3, 1.0, 0.6);
  // ── Godunov's work (1600): the block over the third octagon, two rows of kokoshniks (the lower gilded), the drum, the inscription, the dome
  const Y4 = Y3 + H3 + 0.25, Rk = 4.9;
  bag.add(BR, ngon(x, z, Rk, Y4, Y4 + 1.2, 8, Rk, rot)); bag.add(WS, ngon(x, z, Rk + 0.15, Y4 + 1.0, Y4 + 1.3, 8, Rk + 0.15, rot));
  bag.add(BR, lathe([[4.05, 0], [4.05, 3.6], [0.001, 3.6]], 24, null, x, Y4 + 1.25, z));
  const kok = (a, R, yy, w, h1, h2, face, th) => { const c = Math.cos(a), s = Math.sin(a), at = (rr, u) => [x + c * rr - s * u, z + s * rr + c * u];
    bag.add(WS, slab(kokoshnikShape(w + 0.36, h1 + 0.1, h2 + 0.18), th * 0.6, at(R - th * 0.3, -(w + 0.36) / 2), at(R - th * 0.3, (w + 0.36) / 2), yy, 10));
    bag.add(face, slab(kokoshnikShape(w, h1, h2), th * 0.5, at(R + th * 0.2, -w / 2), at(R + th * 0.2, w / 2), yy + 0.08, 10)); };
  for (let k = 0; k < 8; k++) { kok(k * Math.PI / 4, Rk * ap - 0.1, Y4 + 1.3, 3.2, 0.55, 1.8, G, 0.5); kok((k + 0.5) * Math.PI / 4, 4.1, Y4 + 2.55, 2.7, 0.35, 1.6, BR, 0.4); }
  const Yd = Y4 + 4.85, Rd = 3.6, Hd = 11.4;
  bag.add(BR, lathe([[Rd, 0], [Rd, Hd], [0.001, Hd]], 32, null, x, Yd, z));
  const twist = (yy) => bag.add(WS, lathe([[Rd - 0.02, 0], [Rd + 0.16, 0.08], [Rd + 0.2, 0.18], [Rd + 0.16, 0.28], [Rd - 0.02, 0.36]], 96, (th, i) => (i === 0 || i === 4 ? 1 : 1 + 0.012 * Math.cos(th * 40 + i * 0.9)), x, yy, z));
  twist(Yd); twist(Yd + 3.6); twist(Yd + 7.0);
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a), Fw = face([x + c * Rd - s * -0.6, z + s * Rd + c * -0.6], [-s, c], 1.2);
    onFace(bag, 'opening', Fw, archPath(new Shape(), 0.42, 0.78, 0, 2.2), Yd + 4.1, -0.1, 0.03, 6);
    onFace(bag, WS, Fw, archFrame(0.42, 0.78, 0, 2.2, 0.12), Yd + 4.1, -0.06, 0.1, 6);
    const ped = new Shape(); ped.moveTo(0.1, 0); ped.lineTo(1.1, 0); ped.lineTo(0.6, 0.5); ped.lineTo(0.1, 0);
    onFace(bag, WS, Fw, ped, Yd + 6.5, -0.06, 0.16, 2);
  }
  // the inscription: gilt letters on a blue band under the dome
  bag.add('paint_blue', lathe([[Rd + 0.04, 0], [Rd + 0.04, 1.5], [0.001, 1.5]], 48, null, x, Yd + 8.6, z));
  for (let i = 0; i < 120; i++) {
    const a = i / 120 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), h = 0.7 + 0.35 * rand(), w = 0.05 + 0.05 * rand(), R = Rd + 0.07;
    bag.add(G, orientedBox([x + c * R - s * w, z + s * R + c * w], [x + c * R + s * w, z + s * R - c * w], 0.04, Yd + 8.75 + (1 - h) * 0.5, Yd + 8.75 + (1 - h) * 0.5 + h));
    if (rand() < 0.45) { const yy = Yd + 8.75 + 0.2 + rand() * 0.8; bag.add(G, orientedBox([x + c * R - s * 0.11, z + s * R + c * 0.11], [x + c * R + s * 0.11, z + s * R - c * 0.11], 0.04, yy, yy + 0.06)); }
  }
  bag.add(WS, lathe([[Rd - 0.05, 0], [Rd + 0.25, 0.15], [Rd + 0.25, 0.4], [Rd + 0.5, 0.6], [Rd + 0.5, 0.8], [0.001, 0.8]], 32, null, x, Yd + Hd - 1.3 + 0.2, z));
  const Ydm = Yd + Hd - 0.3;
  bag.add(G, lathe([[3.8, 0], [4.1, 1.3], [3.9, 3.1], [2.8, 5.1], [1.3, 6.7], [0.4, 7.7], [0.12, 8.1], [0.001, 8.15]], 48, (th, i) => (i === 0 || i >= 6 ? 1 : 1 + 0.03 * Math.max(0, Math.cos(th * 12)) ** 20), x, Ydm, z));
  cross8(bag, x, Ydm + 8.0, z, Math.max(3, y + 81 - (Ydm + 8.5)));

  // ── Petrok Maly's belfry against the north face: the block, its white strips and cornice, the bell storey with its arches and bells, the roof and the small gilded dome
  const B = [x - 6, z - R1 * ap - 15.5, x + 6, z - R1 * ap + 0.6], Yb = y + 19, Hb = 8.5;
  bag.add(BR, box(B[0], y - 0.5, B[1], B[2], Yb, B[3])); col.rect(B, y, Yb);
  bag.add(WS, box(B[0] - 0.3, y - 0.5, B[1] - 0.3, B[2] + 0.3, y + 1.3, B[3] - 0.01));
  const fb = rectFaces(B);
  for (const [key, n] of [['n', 2], ['w', 3], ['e', 3]]) {
    const F = fb[key], bw = F.L / n;
    for (let i = 0; i <= n; i++) { const u = Math.min(F.L - 0.35, Math.max(0.35, i * bw)); bag.add(WS, orientedBox(F.P(u - 0.35, 0.08), F.P(u + 0.35, 0.08), 0.16, y + 1.3, Yb - 1.6)); }
    for (let i = 0; i < n; i++) { if (key === 'n' || i !== 1) windowOn(bag, F, (i + 0.5) * bw, y + 5, 1.1, 3.2); windowOn(bag, F, (i + 0.5) * bw, y + 12.5, 1.0, 3.0); }
    onFace(bag, WS, F, arcature(F.L, 0.8, Math.round(F.L / 1.6)), Yb - 1.6, -0.01, 0.12, 6);
    onFace(bag, WS, F, (() => { const s = new Shape(); s.moveTo(-0.3, 0); s.lineTo(F.L + 0.3, 0); s.lineTo(F.L + 0.5, 0.8); s.lineTo(-0.5, 0.8); s.lineTo(-0.3, 0); return s; })(), Yb - 0.8, -0.3, 0.45, 2);
    // the bell storey: a wall with its arches, a bell hanging in each
    const ops = Array.from({ length: n }, (_, i) => ({ u: (i + 0.5) * bw, w: bw * 0.6, v0: 0.9, vs: Hb * 0.6 }));
    onFace(bag, BR, F, arcadeShape(F.L, Hb, ops), Yb, -0.9, 0, 12);
    for (const o of ops) {
      onFace(bag, WS, F, archFrame(o.u - o.w / 2, o.u + o.w / 2, o.v0, o.vs, 0.2), Yb, -0.01, 0.12, 12);
      const p = F.P(o.u, -1.6), rb = Math.min(0.9, o.w * 0.28);
      bag.add('timber', orientedBox(F.P(o.u, -0.95), F.P(o.u, -3.2), 0.28, Yb + o.vs + 0.2, Yb + o.vs + 0.5));
      bell(bag, p[0], Yb + o.vs + 0.2 - rb * 1.75, p[1], rb);
    }
  }
  bag.add(BR, box(B[0], Yb, B[3] - 0.9, B[2], Yb + Hb, B[3]));                                  // the south wall against the tower
  bag.add(BR, box(B[0] + 0.05, Yb + Hb - 0.7, B[1] + 0.05, B[2] - 0.05, Yb + Hb, B[3] - 0.05));   // the vault over the bells
  bag.add(WS, box(B[0] - 0.4, Yb + Hb - 0.3, B[1] - 0.4, B[2] + 0.4, Yb + Hb + 0.35, B[3] + 0.1));
  { const cxb = (B[0] + B[2]) / 2, czb = (B[1] + B[3]) / 2, hw = (B[2] - B[0]) / 2 + 0.3, hd = (B[3] - B[1]) / 2 + 0.3, t = [], yA = Yb + Hb + 0.35, yB = yA + 2.2;
    const P = (u, v, yy) => [cxb + u, yy, czb + v], a = [P(-hw, -hd, yA), P(hw, -hd, yA), P(hw, hd, yA), P(-hw, hd, yA)], b = [P(-2, -3.5, yB), P(2, -3.5, yB), P(2, 3.5, yB), P(-2, 3.5, yB)];
    for (let i = 0; i < 4; i++) quad(t, a[i], a[(i + 1) % 4], b[(i + 1) % 4], b[i]); quad(t, b[0], b[1], b[2], b[3]); quad(t, a[0], a[3], a[2], a[1]);
    bag.add('lead', fromTriangles(orientOutward(t)));
    helmet(bag, cxb, yB, czb, 1.7, 2.6, G, BR);
    bag.add(WS, lathe([[1.72, 0], [1.9, 0.12], [1.9, 0.36], [1.72, 0.48]], 16, null, cxb, yB + 2.0, czb)); }
}

// ── the Archangel ────────────────────────────────────────────────────────────────────────────────
/**
 * archangel: { rect, y, h } — Aloisio the New's cathedral (1505–08): red brick with white-stone details in two
 * storeys parted by a full entablature; pilasters with capitals in both storeys, a blind arcade in the lower, the
 * windows in the upper, the deep cornice; a zakomara over every bay filled with a great white-stone scallop
 * shell (the west one's with a round window); the lead roof behind; five domes on their drums; three apses on
 * the east; the west portal in its deep frame.
 */
export function archangel(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 18, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add(BR, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h);
  bag.add(WS, box(x0 - 0.3, y - 0.5, z0 - 0.3, x1 + 0.3, y + 0.9, z1 + 0.3));
  const Yb = y + 9.4, Yu = y + 10.5, Yc = y + h - 1.2;
  const fs = rectFaces(el.rect), bays = { n: 5, s: 5, w: 3, e: 3 };
  for (const key of ['n', 's', 'w', 'e']) {
    const F = fs[key], n = bays[key], bw = F.L / n, along = key === 'n' || key === 's';
    // the bands that run round the building: the entablature between the storeys and the deep cornice (the long sides' run past the corners)
    const run = (y0, y1, d) => bag.add(WS, orientedBox(F.P(along ? -d : 0, d / 2), F.P(along ? F.L + d : F.L, d / 2), d, y0, y1));
    run(y + 0.9, y + 1.15, 0.22); run(Yb, Yb + 0.35, 0.42); run(Yb + 0.35, Yu - 0.25, 0.3); run(Yu - 0.25, Yu, 0.46);
    run(Yc, Yc + 0.4, 0.4); run(Yc + 0.4, Yc + 0.85, 0.62); run(Yc + 0.85, y + h, 0.85);
    for (let i = 0; i <= n; i++) {
      const u = Math.min(F.L - 0.45, Math.max(0.45, i * bw));
      // the pilasters of both storeys, their capitals
      bag.add(WS, orientedBox(F.P(u - 0.45, 0.12), F.P(u + 0.45, 0.12), 0.24, y + 1.15, Yb - 0.5));
      bag.add(WS, orientedBox(F.P(u - 0.58, 0.18), F.P(u + 0.58, 0.18), 0.36, Yb - 0.5, Yb));
      bag.add(WS, orientedBox(F.P(u - 0.4, 0.11), F.P(u + 0.4, 0.11), 0.22, Yu, Yc - 0.5));
      bag.add(WS, orientedBox(F.P(u - 0.52, 0.17), F.P(u + 0.52, 0.17), 0.34, Yc - 0.5, Yc));
      bag.add(WS, orientedBox(F.P(u - 0.36, 0.3), F.P(u + 0.36, 0.3), 0.12, Yc - 0.4, Yc - 0.12));          // the capital's volutes and its flower
    }
    for (let i = 0; i < n; i++) {
      const um = (i + 0.5) * bw, portal = key === 'w' && i === 1, apse = key === 'e';
      // the lower storey: a blind arch in every bay (a window in it), the portal in the west's middle
      if (!apse) {
        const aw = bw - 1.6;
        onFace(bag, WS, F, archFrame(um - aw / 2, um + aw / 2, 0, Yb - y - 1.6 - aw / 2 - 1.15, 0.2), y + 1.15, -0.01, 0.12, 12);
        if (portal) {
          // the portal: stepped white-stone arches round the door, carved with leaves, the door leaves of oak
          for (let k = 0; k < 4; k++) { const w2 = 1.2 + k * 0.32; onFace(bag, WS, F, archFrame(um - w2, um + w2, 0, 4.2, 0.16), y + 1.15, -0.01, 0.16 + k * 0.12, 12); }
          onFace(bag, 'wood_dark', F, archPath(new Shape(), um - 1.2, um + 1.2, 0, 4.2), y + 1.15, -0.02, 0.05, 12);
          onFace(bag, 'iron', F, (() => { const s = new Shape(); s.moveTo(um - 0.03, 0); s.lineTo(um + 0.03, 0); s.lineTo(um + 0.03, 5.2); s.lineTo(um - 0.03, 5.2); s.lineTo(um - 0.03, 0); return s; })(), y + 1.15, 0.04, 0.07, 2);
        } else windowOn(bag, F, um, y + 3.6, 0.9, 2.4);
      }
      // the upper storey: the window
      if (!(apse && i !== 1)) windowOn(bag, F, um, Yu + 1.8, 1.0, 3.0);
      // the zakomara over the bay: the brick half-disc, the white-stone ring, the shell fanning from the foot
      const r = bw / 2 - 0.3, yz = y + h;
      const half = (rr) => { const s = new Shape(); s.moveTo(um - rr, 0); s.absarc(um, 0, rr, Math.PI, 0, true); s.lineTo(um - rr, 0); return s; };
      onFace(bag, BR, F, half(r + 0.25), yz, -0.6, -0.05, 20);
      { const s = new Shape(); s.moveTo(um - r - 0.25, 0); s.absarc(um, 0, r + 0.25, Math.PI, 0, true); s.lineTo(um + r, 0); s.absarc(um, 0, r, 0, Math.PI, false); s.lineTo(um - r - 0.25, 0); onFace(bag, WS, F, s, yz, -0.1, 0.12, 20); }
      const nr = 13;
      for (let k = 0; k < nr; k++) {
        const a0 = Math.PI * k / nr, a1 = Math.PI * (k + 1) / nr, s = new Shape(), rr = r - 0.04;
        s.moveTo(um + Math.cos(a0) * 0.25, Math.sin(a0) * 0.25);
        for (let q = 0; q <= 4; q++) { const a = a0 + (a1 - a0) * q / 4; s.lineTo(um + Math.cos(a) * rr * (1 - 0.06 * Math.sin((q / 4) * Math.PI)), Math.sin(a) * rr * (1 - 0.06 * Math.sin((q / 4) * Math.PI))); }
        s.lineTo(um + Math.cos(a1) * 0.25, Math.sin(a1) * 0.25); s.lineTo(um + Math.cos(a0) * 0.25, Math.sin(a0) * 0.25);
        onFace(bag, WS, F, s, yz, -0.1, k % 2 ? 0.05 : 0.17, 4);
      }
      onFace(bag, WS, F, half(0.42), yz, -0.1, 0.22, 10);
      if (key === 'w' && i === 1) { const d = new Shape(); d.absarc(um, r * 0.48, r * 0.24, 0, Math.PI * 2, false); onFace(bag, 'opening', F, d, yz, 0.1, 0.25, 16); const ring = new Shape(); ring.absarc(um, r * 0.48, r * 0.24 + 0.18, 0, Math.PI * 2, false); ring.holes.push((() => { const p = new Path(); p.absarc(um, r * 0.48, r * 0.24, 0, Math.PI * 2, true); return p; })()); onFace(bag, WS, F, ring, yz, 0.05, 0.3, 16); }
    }
  }
  // the roof behind the zakomaras; the drums on their square bases and the domes
  { const t = [], i = 0.7, y0 = y + h, y1 = y + h + 2.4, A = [[x0 + i, z0 + i], [x1 - i, z0 + i], [x1 - i, z1 - i], [x0 + i, z1 - i]], Bq = [[x0 + 4, z0 + 4], [x1 - 4, z0 + 4], [x1 - 4, z1 - 4], [x0 + 4, z1 - 4]];
    for (let k = 0; k < 4; k++) quad(t, [A[k][0], y0, A[k][1]], [A[(k + 1) % 4][0], y0, A[(k + 1) % 4][1]], [Bq[(k + 1) % 4][0], y1, Bq[(k + 1) % 4][1]], [Bq[k][0], y1, Bq[k][1]]);
    quad(t, ...Bq.map(([a, b]) => [a, y1, b])); quad(t, ...[...A].reverse().map(([a, b]) => [a, y0, b]));
    bag.add('lead', fromTriangles(orientOutward(t))); }
  const dx = (x1 - x0) * 0.24, dz = (z1 - z0) * 0.25;
  for (const [ddx, ddz, r, dh] of [[0, 0, 2.7, 5.2], [-dx, -dz, 1.8, 3.4], [dx, -dz, 1.8, 3.4], [-dx, dz, 1.8, 3.4], [dx, dz, 1.8, 3.4]]) {
    const px = cx + ddx, pz = cz + ddz, yb = y + h + 2.0;
    bag.add(BR, box(px - r - 0.4, yb, pz - r - 0.4, px + r + 0.4, yb + 1.0, pz + r + 0.4));
    bag.add(WS, box(px - r - 0.55, yb + 0.85, pz - r - 0.55, px + r + 0.55, yb + 1.1, pz + r + 0.55));
    helmet(bag, px, yb + 1.1, pz, r, dh, G, BR);
    bag.add(WS, lathe([[r + 0.01, 0], [r + 0.16, 0.1], [r + 0.16, 0.34], [r + 0.01, 0.44]], 24, null, px, yb + 1.1 + dh - 0.6, pz));
    for (let k = 0; k < 12; k++) { const a = (k + 0.5) / 12 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), R = r * Math.cos(Math.PI / 16) + 0.01; bag.add(WS, orientedBox([px + c * R - s * 0.07, pz + s * R + c * 0.07], [px + c * R + s * 0.07, pz + s * R - c * 0.07], 0.1, yb + 1.5, yb + 1.1 + dh - 0.6)); if (k % 2 === 0) bag.add('opening', orientedBox([px + c * R - s * r * 0.12, pz + s * R + c * r * 0.12], [px + c * R + s * r * 0.12, pz + s * R - c * r * 0.12], 0.06, yb + 1.1 + dh * 0.32, yb + 1.1 + dh * 0.7)); }
  }
  // the three apses on the east, their roofs, half-columns and cornices
  for (const [zz, r] of [[cz - (z1 - z0) / 3, 2.6], [cz, 3.4], [cz + (z1 - z0) / 3, 2.6]]) {
    const ha = Yu - y;
    bag.add(BR, halfLathe([[r, 0], [r, ha + 0.5]], 12, x1, y - 0.5, zz, -Math.PI / 2)); col.circle(x1, zz, r, y, y + ha);
    bag.add(WS, halfLathe([[r + 0.3, 0], [r + 0.3, 1.4]], 12, x1, y - 0.5, zz, -Math.PI / 2));
    bag.add(WS, halfLathe([[r + 0.05, 0], [r + 0.35, 0.3], [r + 0.5, 0.6]], 12, x1, y + ha - 0.6, zz, -Math.PI / 2));
    bag.add('lead', halfLathe([[r + 0.5, 0], [0.001, r * 0.55]], 12, x1, y + ha, zz, -Math.PI / 2));
    for (let k = 1; k < 6; k++) { const a = -Math.PI / 2 + Math.PI * k / 6; bag.add(WS, lathe([[0.16, 0], [0.13, 0.2], [0.13, ha - 1.8], [0.2, ha - 1.5], [0.2, ha - 1.3], [0.001, ha - 1.3]], 8, null, x1 + Math.cos(a) * (r + 0.05), y + 0.9, zz + Math.sin(a) * (r + 0.05))); }
    for (const a of [-0.55, 0, 0.55]) { const c = Math.cos(a), s = Math.sin(a), R = r + 0.02; bag.add('opening', orientedBox([x1 + c * R - s * 0.35, zz + s * R + c * 0.35], [x1 + c * R + s * 0.35, zz + s * R - c * 0.35], 0.05, y + 4.5, y + 7.2)); }
  }
}

// ── the Annunciation ─────────────────────────────────────────────────────────────────────────────
/**
 * annunciation: { rect, y } — the court cathedral (1484–89; domes and chapels 1562–64): the high basement of
 * roughly hewn white stone; on it the galleries round the north, west and south under their roofs, an arch in
 * every bay, the south porch reached by its perron; the four single-domed chapels over the galleries' corners;
 * the cathedral above in three bays a side parted by lesenes, belted with arcature with slit windows in it,
 * ending in keel-shaped zakomaras; the gilded roof; nine gilded domes in all — the central on its kokoshniks,
 * the two over the east corners, the two blank ones over the west, the chapels' four; three apses on the east.
 */
export function annunciation(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, Bh = 3.6, Yg = y + Bh, gw = 3.2, Hg = 3.8, Hb = 10.5;
  const body = [x0 + gw, z0 + gw, x1, z1 - gw], [bx0, bz0, bx1, bz1] = body, bcx = (bx0 + bx1) / 2, bcz = (bz0 + bz1) / 2;
  const WALL = 'limestone';
  // the basement, its small windows; the floor of the galleries on it
  bag.add('rubble', box(x0, y - 0.5, z0, x1, Yg, z1)); col.rect(el.rect, y, Yg - 0.02); col.floor(el.rect, Yg);
  bag.add(WS, box(x0 - 0.18, Yg - 0.32, z0 - 0.18, x1 + 0.18, Yg, z1 + 0.18));
  const fr = rectFaces(el.rect);
  for (const key of ['n', 's', 'w', 'e']) { const F = fr[key]; for (let u = 2.2; u < F.L - 1.5; u += 3.4) onFace(bag, 'opening', F, (() => { const s = new Shape(); s.moveTo(u - 0.35, 0); s.lineTo(u + 0.35, 0); s.lineTo(u + 0.35, 0.5); s.absarc(u, 0.5, 0.35, 0, Math.PI, false); s.lineTo(u - 0.35, 0); return s; })(), y + 1.3, -0.03, 0.03, 6); }
  // the cathedral's body over the basement
  bag.add(WALL, box(bx0, Yg - 0.02, bz0, bx1, Yg + Hb, bz1)); col.rect(body, Yg, Yg + Hb);
  // the galleries: an arcade along the basement's edge on the north, west and south (the door to the perron in the south's middle), their lean-to roofs
  const xm = (x0 + x1) / 2;
  for (const key of ['n', 'w', 's']) {
    const F0 = fr[key], L = F0.L - 2 * gw, F = face(F0.P(gw), F0.dir, L), n = 2 * Math.round((L / 2.6 - 1) / 2) + 1, bw = L / n;
    const ops = Array.from({ length: n }, (_, i) => ({ u: (i + 0.5) * bw, w: bw * 0.58, v0: key === 's' && i === Math.floor(n / 2) ? 0 : 0.95, vs: Hg - 0.6 - bw * 0.29 }));
    onFace(bag, WALL, F, arcadeShape(L, Hg, ops), Yg, -0.5, 0, 12);
    for (const o of ops) onFace(bag, WS, F, archFrame(o.u - o.w / 2, o.u + o.w / 2, o.v0, o.vs, 0.14), Yg, -0.01, 0.1, 12);
    onFace(bag, WS, F, arcature(L, 0.45, n * 2), Yg + Hg - 0.5, -0.01, 0.08, 6);
    let u0 = 0;
    for (const o of ops) if (o.v0 === 0) { col.segment(F.P(u0, -0.25), F.P(o.u - o.w / 2, -0.25), 0.5, Yg, Yg + Hg); u0 = o.u + o.w / 2; }
    col.segment(F.P(u0, -0.25), F.P(L, -0.25), 0.5, Yg, Yg + Hg);
    // the roof: from the arcade's top up to the cathedral's wall
    const a = F.P(0, 0.3), b = F.P(L, 0.3), c = F.P(L, -(gw - 0.01)), d = F.P(0, -(gw - 0.01)), y0 = Yg + Hg, y1 = Yg + Hg + 1.3;
    bag.add('lead', hexa([[a[0], y0 - 0.15, a[1]], [b[0], y0 - 0.15, b[1]], [c[0], y1 - 0.15, c[1]], [d[0], y1 - 0.15, d[1]], [a[0], y0, a[1]], [b[0], y0, b[1]], [c[0], y1, c[1]], [d[0], y1, d[1]]]));
  }
  // the perron: a flight of white-stone steps up to the south door, its parapets
  { const n = Math.round(Bh / 0.18), run = 0.3, L = n * run, r = [xm - 1.1, z1, xm + 1.1, z1 + L];
    for (let k = 0; k < n; k++) bag.add(WS, box(r[0], y - 0.3, z1 + L - (k + 1) * run, r[2], y + (k + 1) * Bh / n, z1 + L - k * run + (k === 0 ? 0 : 0.0)));
    col.ramp(r, y, Yg, 'n');
    for (const xx of [r[0] - 0.3, r[2]]) { bag.add(WS, hexa([[xx, y - 0.3, z1 + L], [xx + 0.3, y - 0.3, z1 + L], [xx + 0.3, y - 0.3, z1], [xx, y - 0.3, z1], [xx, y + 0.9, z1 + L], [xx + 0.3, y + 0.9, z1 + L], [xx + 0.3, Yg + 0.9, z1], [xx, Yg + 0.9, z1]])); col.rect([xx, z1, xx + 0.3, z1 + L], y, Yg + 0.9); } }
  // the four chapels over the galleries' corners: a cube with keel-arched gables, a drum and its gilded dome
  for (const [cx0, cz0] of [[x0, z0], [x0, z1 - gw], [x1 - gw, z0], [x1 - gw, z1 - gw]]) {
    const r = [cx0, cz0, cx0 + gw, cz0 + gw], H = Hg + 2.6, cxx = cx0 + gw / 2, czz = cz0 + gw / 2;
    bag.add(WALL, box(r[0], Yg - 0.02, r[1], r[2], Yg + H, r[3])); col.rect(r, Yg, Yg + H);
    const fc = rectFaces(r);
    for (const key of ['n', 's', 'w', 'e']) {
      const F = fc[key];
      onFace(bag, WS, F, kokoshnikShape(gw - 0.1, 0.1, 1.5), Yg + H, -0.55, -0.12, 10);
      onFace(bag, WALL, F, kokAt(gw - 0.5, 0.1, 1.2, 0.2), Yg + H, -0.12, 0.04, 10);
      onFace(bag, WS, F, archFrame(gw / 2 - 0.3, gw / 2 + 0.3, 0, 1.6, 0.12), Yg + 2.2, -0.01, 0.08, 8);
      onFace(bag, 'opening', F, archPath(new Shape(), gw / 2 - 0.3, gw / 2 + 0.3, 0, 1.6), Yg + 2.2, -0.03, 0.03, 8);
    }
    bag.add(G, box(r[0] + 0.15, Yg + H, r[1] + 0.15, r[2] - 0.15, Yg + H + 0.6, r[3] - 0.15));
    onion(bag, cxx, Yg + H + 0.5, czz, 0.85, 1.5, G, WALL, 12);
  }
  const fb = rectFaces(body), Yt = Yg + Hb;
  for (const key of ['n', 's', 'w', 'e']) {
    const F = fb[key], bw = F.L / 3;
    // the lesenes, the arcature belt with slit windows in it, the keel-shaped zakomaras
    for (let i = 0; i <= 3; i++) { const u = Math.min(F.L - 0.35, Math.max(0.35, i * bw)); bag.add(WS, orientedBox(F.P(u - 0.35, 0.1), F.P(u + 0.35, 0.1), 0.2, key === 'e' ? Yg : Yg + Hg + 1.25, Yt)); }
    for (let i = 0; i < 3; i++) {
      const um = (i + 0.5) * bw, nA = 4, sub = (bw - 0.7) / nA, F2 = face(F.P(i * bw + 0.35), F.dir, bw - 0.7);
      onFace(bag, WS, F2, arcature(bw - 0.7, 0.8, nA), Yg + Hg + 2.6, -0.01, 0.1, 6);
      for (let q = 0; q < nA; q++) if (q % 2 === 1 || nA === 1) onFace(bag, 'opening', F2, archPath(new Shape(), (q + 0.5) * sub - 0.13, (q + 0.5) * sub + 0.13, 0, 1.1), Yg + Hg + 1.6, -0.03, 0.03, 6);
      windowOn(bag, F, um, Yg + Hg + 4.2, 0.8, 2.2);
      onFace(bag, WS, F, kokAt(bw - 0.2, 0.25, bw * 0.48, i * bw + 0.1), Yt, -0.6, -0.12, 10);
      onFace(bag, WALL, F, kokAt(bw - 0.6, 0.2, bw * 0.4, i * bw + 0.3), Yt, -0.12, 0.05, 10);
    }
    bag.add(WS, orientedBox(F.P(0, 0.15), F.P(F.L, 0.15), 0.3, Yt - 0.3, Yt, 0.15 * (key === 'n' || key === 's' ? 1 : 0)));
  }
  // the gilded roof; the domes: the central on its square base with a ring of kokoshniks, the two over the east corners, the two blank ones over the west
  { const t = [], i = 0.5, y0 = Yt, y1 = Yt + 2.2, A = [[bx0 + i, bz0 + i], [bx1 - i, bz0 + i], [bx1 - i, bz1 - i], [bx0 + i, bz1 - i]], Bq = [[bx0 + 3, bz0 + 3], [bx1 - 3, bz0 + 3], [bx1 - 3, bz1 - 3], [bx0 + 3, bz1 - 3]];
    for (let k = 0; k < 4; k++) quad(t, [A[k][0], y0, A[k][1]], [A[(k + 1) % 4][0], y0, A[(k + 1) % 4][1]], [Bq[(k + 1) % 4][0], y1, Bq[(k + 1) % 4][1]], [Bq[k][0], y1, Bq[k][1]]);
    quad(t, ...Bq.map(([a, b]) => [a, y1, b])); quad(t, ...[...A].reverse().map(([a, b]) => [a, y0, b]));
    bag.add(G, fromTriangles(orientOutward(t))); }
  { const yb = Yt + 1.8, a = 2.3;
    bag.add(WALL, box(bcx - a, yb, bcz - a, bcx + a, yb + 1.6, bcz + a));
    for (const key of ['n', 's', 'w', 'e']) { const F = rectFaces([bcx - a, bcz - a, bcx + a, bcz + a])[key]; for (const u0 of [0.1, a + 0.05]) onFace(bag, G, F, kokAt(a - 0.15, 0.15, 1.1, u0), yb + 1.6, -0.3, 0.05, 10); }
    bag.add(WALL, box(bcx - a + 0.35, yb + 1.6, bcz - a + 0.35, bcx + a - 0.35, yb + 2.4, bcz + a - 0.35));
    onion(bag, bcx, yb + 2.4, bcz, 2.2, 4.2, G, WALL, 16); }
  for (const [px, pz, blank] of [[bx1 - 2.8, bz0 + 2.5, false], [bx1 - 2.8, bz1 - 2.5, false], [bx0 + 2.8, bz0 + 2.5, true], [bx0 + 2.8, bz1 - 2.5, true]]) {
    const yb = Yt + 0.6;
    bag.add(WALL, box(px - 1.25, yb, pz - 1.25, px + 1.25, yb + 1.9, pz + 1.25));
    bag.add(G, box(px - 1.35, yb + 1.9, pz - 1.35, px + 1.35, yb + 2.1, pz + 1.35));
    onion(bag, px, yb + 2.1, pz, 1.3, blank ? 1.6 : 2.4, G, WALL, 12);
  }
  // the three apses on the east, over the basement's apse
  for (const [zz, r] of [[bcz - 3.6, 1.7], [bcz, 2.5], [bcz + 3.6, 1.7]]) {
    bag.add('rubble', halfLathe([[r + 0.3, 0], [r + 0.3, Bh + 0.5]], 12, x1, y - 0.5, zz, -Math.PI / 2)); col.circle(x1, zz, r + 0.3, y, Yg);
    bag.add(WALL, halfLathe([[r, 0], [r, 7]], 12, x1, Yg - 0.02, zz, -Math.PI / 2));
    bag.add(WS, halfLathe([[r + 0.02, 0], [r + 0.25, 0.25], [r + 0.3, 0.45]], 12, x1, Yg + 6.6, zz, -Math.PI / 2));
    bag.add(G, halfLathe([[r + 0.3, 0], [0.001, r * 0.6]], 12, x1, Yg + 7.05, zz, -Math.PI / 2));
    for (const ang of [-0.6, 0, 0.6]) { const c = Math.cos(ang), sn = Math.sin(ang); bag.add('opening', orientedBox([x1 + c * (r + 0.02) - sn * 0.13, zz + sn * (r + 0.02) + c * 0.13], [x1 + c * (r + 0.02) + sn * 0.13, zz + sn * (r + 0.02) - c * 0.13], 0.05, Yg + 2.2, Yg + 4.4)); }
  }
}
