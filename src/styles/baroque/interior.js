// St Peter's inside, about 1670 (docs/settlements/baroque-rome.md §4c): the portico behind Maderno's
// front and Filarete's bronze door; the nave of five bays under its coffered barrel vault, giant
// pilasters, the entablature, great arches to the side chapels with their altars; the crossing on
// four piers with Bernini's niches and their colossal saints and, above, the relic balconies with
// the old twisted columns; the pendentives, the drum with its sixteen windows and the band of the
// inscription TV ES PETRVS…, the dome in sixteen gilt ribs, the lantern's light; Bernini's
// baldacchino over the papal altar (1623–34) — four twisted bronze columns on marble plinths, the
// canopy with its valance, the angels and the four scrolls rising to the globe and the cross; the
// short transepts with their altars; and at the west end the Cathedra Petri (1657–66): the bronze
// throne borne by the four Doctors of the Church under the alabaster window of the Holy Spirit in
// its glory of gilt rays and clouds. Plan coordinates: the church's axis along x, the front east.
//
// Everything is merged per material (Local), so that no repeated shape becomes a mesh of its own.

import { Matrix4 } from '../../core/three.js';
import { box, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import { Local, ext, archOutline, headPts } from '../renaissance/face.js';
import { human, blob, limb as slimb } from '../greek/sculpture.js';
import { ball, limb, T } from '../qing/carving.js';
import { pilaster, revet, niche, virtue, pierFace, medallion, bronzePeter, tombUrban, tombPaul, frameFacing, naveFloor, crossingFloor, armFloor } from './marbles.js';

const TR = 'travertine', ST = 'stucco', MF = 'marble_floor', GO = 'mosaic_gold', GB = 'gilt_bronze', BR = 'bronze', M = 'marble', DL = 'daylight', PT = 'ceiling_painted', BL = 'paint_blue', CV = 'limestone_carved';

/** Both windings of a triangle list (seen from either side). */
const dbl = (t) => { const f = []; for (let i = 0; i < t.length; i += 9) f.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return fromTriangles(t.concat(f)); };
/** A frame on the plan line a → b at height y: u along it, d toward its left (U × Y), y up. */
function lineFrame(a, b, y) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  return { M: new Matrix4().set(ux, 0, -uz, a[0], 0, 1, 0, y, uz, 0, ux, a[1], 0, 0, 0, 1), L };
}
/** A world point of a line frame. */
const atF = (F, u, yy, d) => { const e = F.M.elements; return [e[12] + e[0] * u + e[8] * d, e[13] + yy, e[14] + e[2] * u + e[10] * d]; };

// the stroke alphabet of the front (facade.js) — the letters the drum's inscription needs
const FONT = {
  A: [[0, 0, 2, 6], [4, 0, 2, 6], [1, 2, 3, 2]], B: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 3.5, 4.5], [3.5, 4.5, 0, 3], [0, 3, 3.6, 1.6], [3.6, 1.6, 3, 0], [3, 0, 0, 0]],
  C: [[4, 6, 1, 6], [1, 6, 0, 4.5], [0, 4.5, 0, 1.5], [0, 1.5, 1, 0], [1, 0, 4, 0]], D: [[0, 0, 0, 6], [0, 6, 2.5, 6], [2.5, 6, 4, 4.5], [4, 4.5, 4, 1.5], [4, 1.5, 2.5, 0], [2.5, 0, 0, 0]],
  E: [[0, 0, 0, 6], [0, 6, 4, 6], [0, 3, 3, 3], [0, 0, 4, 0]], F: [[0, 0, 0, 6], [0, 6, 4, 6], [0, 3, 3, 3]], G: [[4, 6, 1, 6], [1, 6, 0, 4.5], [0, 4.5, 0, 1.5], [0, 1.5, 1, 0], [1, 0, 4, 0], [4, 0, 4, 2.5], [4, 2.5, 2.5, 2.5]],
  H: [[0, 0, 0, 6], [4, 0, 4, 6], [0, 3, 4, 3]], I: [[0.6, 0, 0.6, 6]], L: [[0, 6, 0, 0], [0, 0, 4, 0]],
  M: [[0, 0, 0.5, 6], [0.5, 6, 2, 1.5], [2, 1.5, 3.5, 6], [3.5, 6, 4, 0]], N: [[0, 0, 0, 6], [0, 6, 4, 0], [4, 0, 4, 6]],
  O: [[1, 0, 0, 1.5], [0, 1.5, 0, 4.5], [0, 4.5, 1, 6], [1, 6, 3, 6], [3, 6, 4, 4.5], [4, 4.5, 4, 1.5], [4, 1.5, 3, 0], [3, 0, 1, 0]],
  P: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 4, 5], [4, 5, 4, 4], [4, 4, 3, 3], [3, 3, 0, 3]], R: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 4, 5], [4, 5, 4, 4], [4, 4, 3, 3], [3, 3, 0, 3], [1.5, 3, 4, 0]],
  S: [[4, 6, 1, 6], [1, 6, 0, 5], [0, 5, 0, 4], [0, 4, 4, 2], [4, 2, 4, 1], [4, 1, 3, 0], [3, 0, 0, 0]], T: [[0, 6, 4, 6], [2, 6, 2, 0]], V: [[0, 6, 2, 0], [2, 0, 4, 6]],
};
const adv = (ch) => (ch === ' ' ? 2.6 : ch === 'I' ? 2.2 : ch === 'M' ? 5.2 : 4.9);

/** A twisted (Solomonic) column shaft from y0 to y1 of radius r at (x, z): a spiral lathe. */
function solomonic(Lc, mat, x, y0, z, r, h, turns = 3, n = 10) {
  const rows = 28, prof = [];
  for (let j = 0; j <= rows; j++) prof.push([r, h * j / rows]);
  const g = lathe([[0.001, 0], ...prof, [0.001, h]], n, (th, j) => 1 + 0.2 * Math.cos(th * 2 - j / rows * turns * Math.PI * 2 * 2), x, y0, z);
  Lc.add(mat, g);
}

/** The interior: { cx, cz, y, A (crossing to the arch faces), b (arms' half-width), ys (springing), R0 (drum), yDrum0 (pendentives' top), yDrum1, yDome (dome's foot), domeH, xFront (the inner front's face), xWest (the west end), zEnd (the transepts' ends) }. */
export function stPeterInterior(bag, col, o) {
  const { cx, cz, y, A, b, ys, R0, yDrum1, xFront, xWest, zEnd } = o, Lc = new Local(), yc = ys + b, Rs = Math.hypot(A, b);
  // ── the floors
  for (const r of [[cx + A, cz - 20.5, xFront, cz + 20.5], [cx - A, cz - A, cx + A, cz + A], [cx - b, cz - zEnd, cx + b, cz - A], [cx - b, cz + A, cx + b, cz + zEnd], [xWest, cz - b, cx - A, cz + b], [xFront, cz - 40, xFront + 8, cz + 40]]) {
    Lc.add(MF, box(r[0], y - 0.3, r[1], r[2], y + 0.05, r[3])); col.floor(r, y + 0.05);
  }
  // the pavement's figures in coloured marble (della Porta, Maderno, Bernini)
  naveFloor(Lc, { x0: cx + A, x1: xFront - 1.2, cz, y, nb: 5, hw: b }); crossingFloor(Lc, { cx, cz, y });
  for (const s of [-1, 1]) armFloor(Lc, { rect: [cx - b, Math.min(cz + s * A, cz + s * zEnd), cx + b, Math.max(cz + s * A, cz + s * zEnd)], y });
  armFloor(Lc, { rect: [xWest, cz - b, cx - A, cz + b], y });
  // ── the walls of the arms with their entablature, and the barrel vaults over them
  const entab = (F, u0, u1) => { Lc.add(TR, box(u0, 26.6, 0, u1, 28.6, 0.45).applyMatrix4(F.M)); Lc.add(TR, box(u0, 28.6, 0, u1, 30, 1.3).applyMatrix4(F.M)); for (let u = u0 + 0.6; u < u1 - 0.3; u += 1.4) Lc.add(TR, box(u - 0.2, 28.2, 0.4, u + 0.2, 28.6, 1.1).applyMatrix4(F.M)); };
  const wall = (a2, b2, top, holes = []) => {
    const F = lineFrame(a2, b2, y);
    Lc.add(ST, ext([[0, -0.5], [F.L, -0.5], [F.L, top], [0, top]], holes, -1.2, 0).applyMatrix4(F.M));
    // the obstacle: the wall but its doorways (the openings from the floor up), and over them
    const doors = holes.map((h) => [Math.min(...h.map((p) => p[0])), Math.max(...h.map((p) => p[0])), Math.min(...h.map((p) => p[1])), Math.max(...h.map((p) => p[1]))]).filter((d) => d[2] < 0.1).sort((p, q) => p[0] - q[0]);
    const seg = (u0, u1, y0, y1) => { const p0 = atF(F, u0, 0, -0.6), p1 = atF(F, u1, 0, -0.6); col.segment([p0[0], p0[2]], [p1[0], p1[2]], 1.2, y + y0, y + y1); };
    let u = 0; for (const [u0, u1, , h1] of doors) { if (u0 > u) seg(u, u0, 0, top); seg(u0, u1, h1 * 0.85, top); u = u1; }
    if (u < F.L) seg(u, F.L, 0, top);
    return F;
  };
  const vault = (x0, z0, x1, z1, along) => {                       // a barrel vault of radius b over the rectangle, its axis along x or z, coffered
    const N = 12, t = [], L0 = along === 'x' ? x0 : z0, L1 = along === 'x' ? x1 : z1, c0 = along === 'x' ? (z0 + z1) / 2 : (x0 + x1) / 2, nL = Math.max(1, Math.round((L1 - L0) / 4.4));
    const P = (l, th) => { const across = c0 + Math.cos(th) * b, up = y + ys + Math.sin(th) * b; return along === 'x' ? [l, up, across] : [across, up, l]; };
    for (let i = 0; i < nL; i++) for (let j = 0; j < N; j++) { const la = L0 + (L1 - L0) * i / nL, lb = L0 + (L1 - L0) * (i + 1) / nL, ta = Math.PI * j / N, tb = Math.PI * (j + 1) / N; t.push(...P(la, ta), ...P(lb, ta), ...P(lb, tb), ...P(la, ta), ...P(lb, tb), ...P(la, tb)); }
    Lc.add(ST, dbl(t));
    // the coffers: gilt ribs across and along, a rosette in each
    for (let i = 0; i <= nL; i++) for (let j = 0; j < N; j++) { const l = L0 + (L1 - L0) * i / nL; Lc.add(GB, rod(P(l, Math.PI * j / N).map((v, k) => v - (k === 1 ? 0.06 : 0)), P(l, Math.PI * (j + 1) / N).map((v, k) => v - (k === 1 ? 0.06 : 0)), 0.14, 3)); }
    for (let j = 1; j < N; j += 2) for (let i = 0; i < nL; i++) { const la = L0 + (L1 - L0) * i / nL, lb = L0 + (L1 - L0) * (i + 1) / nL; const th = Math.PI * j / N; Lc.add(GB, rod(P(la, th), P(lb, th), 0.12, 3)); const pm = P((la + lb) / 2, Math.PI * (j + 1) / N - Math.PI / N / 2 + 0.0); Lc.add(GB, T(ball(0.4, 0.4, 0.4, 5, 2), pm[0], pm[1] - Math.sin(Math.PI * (j + 0.5) / N) * 0.1, pm[2])); }
  };
  // the nave: five bays, great arches to the chapels between paired pilasters
  const nx0 = cx + A, nx1 = xFront - 1.2, nb = 5, bay = (nx1 - nx0) / nb, aw = 11.5, asp = 17.5;
  for (const s of [-1, 1]) {
    const zl = cz + s * b, a2 = s < 0 ? [nx0, zl] : [nx1, zl], b2 = s < 0 ? [nx1, zl] : [nx0, zl];
    const holes = []; for (let i = 0; i < nb; i++) { const uc = (s < 0 ? i + 0.5 : nb - i - 0.5) * bay; holes.push(archOutline(uc, 0, aw, asp, 'round', 12)); }
    const F = wall(a2, b2, 30, holes);
    entab(F, 0, F.L);
    for (let i = 0; i <= nb; i++) {
      const u = i * bay;
      for (const du of [-2.0, 2.0]) { if ((i === 0 && du < 0) || (i === nb && du > 0)) continue; pilaster(Lc, F, u + du, 0, 26.6); }
      // between the paired pilasters: two niches lined with coloured marble, framed panels between and above
      if (i > 0 && i < nb) { niche(Lc, F, u - 0.95, u + 0.95, 2.4, 10.6); niche(Lc, F, u - 0.95, u + 0.95, 13.4, 21.6); revet(Lc, F, u - 0.95, u + 0.95, 11.0, 13.0); revet(Lc, F, u - 0.95, u + 0.95, 22.0, 26.4); }
      // the bronze St Peter against the pier of St Longinus, at the nave's end
      if (s > 0 && i === nb) { bronzePeter(Lc, F, u - 1.9, 1.5); const p = atF(F, u - 1.9, 0, 1.5); col.rect([p[0] - 1.1, p[2] - 1.1, p[0] + 1.1, p[2] + 1.1], y, y + 1.75); }
    }
    for (let i = 0; i < nb; i++) {
      const uc = (i + 0.5) * bay, r = aw / 2;
      Lc.add(TR, ext(headPts(uc, asp, aw + 1.2, 'round', 12).concat(headPts(uc, asp, aw, 'round', 12).reverse()), [], 0, 0.3).applyMatrix4(F.M));
      // the chapel behind: its sides, its back with the altar and the altarpiece, its ceiling; a Virtue on each side of the arch
      const D = 5.5, cF = F;
      for (const sg of [-1, 1]) { const p0 = atF(cF, uc + sg * r, 0, -1.2), p1 = atF(cF, uc + sg * r, 0, -1.2 - D); Lc.add(ST, box(0, -0.5, -0.15, Math.hypot(p1[0] - p0[0], p1[2] - p0[2]), asp + r + 0.2, 0.15).applyMatrix4(lineFrame([p0[0], p0[2]], [p1[0], p1[2]], y).M)); }
      Lc.add(ST, box(uc - r, -0.5, -1.2 - D - 0.3, uc + r, asp + r + 0.2, -1.2 - D).applyMatrix4(F.M));
      Lc.add(ST, box(uc - r, asp + r, -1.2 - D, uc + r, asp + r + 0.3, -1.2).applyMatrix4(F.M));
      Lc.add(M, box(uc - 1.6, 0, -1.2 - D, uc + 1.6, 1.1, -1.2 - D + 1.1).applyMatrix4(F.M)); Lc.add(PT, box(uc - 1.8, 2.6, -1.2 - D, uc + 1.8, 8.0, -1.2 - D + 0.08).applyMatrix4(F.M));
      Lc.add(GB, box(uc - 2.1, 2.3, -1.2 - D, uc + 2.1, 8.3, -1.2 - D + 0.05).applyMatrix4(F.M));
      for (const a of [Math.PI * 0.7, Math.PI * 0.3]) virtue(Lc, F, uc, asp, r + 0.6, a, 4.4, 0.55);   // the reclining Virtues on the arch
      // the piers' faces within the arch (the chapel's sides): coloured marbles and the medallions of the popes
      for (const sg of [-1, 1]) { const e = F.M.elements, p0 = atF(F, uc + sg * (r - 0.15), 0, -1.2), p1 = atF(F, uc + sg * (r - 0.15), 0, -1.2 - D); pierFace(Lc, frameFacing([p0[0], p0[2]], [p1[0], p1[2]], [-sg * e[0], -sg * e[2]], y), D, asp + r - 0.65); }
      const pa = atF(F, uc, 0, -1.2 - D + 0.55); col.rect([pa[0] - 1.7, pa[2] - 1.7, pa[0] + 1.7, pa[2] + 1.7], y, y + 1.1);
      for (const sg of [-1, 1]) { const p0 = atF(F, uc + sg * r, 0, -1.2), p1 = atF(F, uc + sg * r, 0, -1.2 - D); col.segment([p0[0], p0[2]], [p1[0], p1[2]], 0.3, y, y + asp + r); }
      { const p0 = atF(F, uc - r, 0, -1.35 - D), p1 = atF(F, uc + r, 0, -1.35 - D); col.segment([p0[0], p0[2]], [p1[0], p1[2]], 0.3, y, y + asp + r); }
    }
  }
  vault(nx0, cz - b, nx1, cz + b, 'x');
  // the inner front: the wall with Filarete's bronze door (1445) open in the middle, the lunette up to the vault
  {
    const F = wall([xFront - 1.2, cz - b - 6], [xFront - 1.2, cz + b + 6], yc + 0.5, [[[b + 6 - 2.6, 0], [b + 6 + 2.6, 0], [b + 6 + 2.6, 10], [b + 6 - 2.6, 10]]]);
    for (const sg of [-1, 1]) { const u0 = b + 6 + sg * 2.6; Lc.add(BR, box(Math.min(u0, u0 + sg * 2.4), 0, 0, Math.max(u0, u0 + sg * 2.4), 10, 0.18).applyMatrix4(F.M)); for (let k = 0; k < 3; k++) Lc.add(GB, box(Math.min(u0, u0 + sg * 2.4) + 0.3, 1 + k * 3, 0.18, Math.max(u0, u0 + sg * 2.4) - 0.3, 3.4 + k * 3, 0.24).applyMatrix4(F.M)); }
    Lc.add(M, box(b + 6 - 3.4, 0, 0, b + 6 - 2.6, 11, 0.5).applyMatrix4(F.M)); Lc.add(M, box(b + 6 + 2.6, 0, 0, b + 6 + 3.4, 11, 0.5).applyMatrix4(F.M)); Lc.add(M, box(b + 6 - 3.4, 10, 0, b + 6 + 3.4, 11, 0.5).applyMatrix4(F.M));
    entab(F, 0, F.L);
    // the portico beyond: its back wall is this wall's other face; its ceiling, its ends
    const px0 = xFront, px1 = xFront + 8;
    Lc.add(ST, box(px0 - 1.2, -0.5, cz + 40, px1, 19, cz + 41.2)); Lc.add(ST, box(px0 - 1.2, -0.5, cz - 41.2, px1, 19, cz - 40)); col.rect([px0 - 1.2, cz + 40, px1, cz + 41.2], y, y + 19); col.rect([px0 - 1.2, cz - 41.2, px1, cz - 40], y, y + 19);
    for (const [z0, z1] of [[cz - 40, cz - b - 6], [cz + b + 6, cz + 40]]) { Lc.add(ST, box(px0 - 1.2, -0.5, z0, px0, 19, z1)); col.rect([px0 - 1.2, z0, px0, z1], y, y + 19); }
    Lc.add(ST, box(px0 - 1.2, 18.4, cz - 41.2, px1, 19.2, cz + 41.2));
    for (let z = cz - 39; z <= cz + 39.01; z += 3) Lc.add(GB, box(px0, 18.1, z - 0.12, px1, 18.4, z + 0.12));
    for (let x = px0 + 1; x < px1; x += 2.5) Lc.add(GB, box(x - 0.12, 18.1, cz - 40, x + 0.12, 18.4, cz + 40));
    Lc.add('lead', box(px0 - 1.2, 19.2, cz - 41.2, px1, 19.6, cz + 41.2));
  }
  // the transepts and the west arm: their walls, their ends, their vaults
  for (const s of [-1, 1]) {
    const z0 = cz + s * A, z1 = cz + s * zEnd;
    for (const sx of [-1, 1]) { const xw = cx + sx * b, zl = Math.min(z0, z1), zh = Math.max(z0, z1), F = wall(sx > 0 ? [xw, zl] : [xw, zh], sx > 0 ? [xw, zh] : [xw, zl], 30); entab(F, 0, F.L);
      // the fluted pilasters at its ends, between them a field of coloured marble with a niche and a medallion
      for (const u of [1.25, F.L - 1.25]) pilaster(Lc, F, u, 0, 26.6);
      revet(Lc, F, 2.6, F.L - 2.6, 0.9, 25.8); niche(Lc, F, F.L / 2 - 1.3, F.L / 2 + 1.3, 3.2, 14.5, 0.08); medallion(Lc, F, F.L / 2, 19.5, 0.08, 0.9);
    }
    const F = wall([cx + s * b, z1], [cx - s * b, z1], yc + 0.5); entab(F, 0, F.L);
    // its altar under a frame of columns and a pediment, the great altarpiece
    Lc.add(M, box(b - 2.5, 0, 0, b + 2.5, 1.2, 1.5).applyMatrix4(F.M)); Lc.add(PT, box(b - 4, 3.5, 0, b + 4, 16, 0.12).applyMatrix4(F.M)); Lc.add(GB, box(b - 4.4, 3.1, 0, b + 4.4, 16.4, 0.08).applyMatrix4(F.M));
    for (const sg of [-1, 1]) Lc.add(M, lathe([[0.75, 0], [0.62, 0.6], [0.55, 17], [0.85, 18]], 12, null, 0, 0, 0).translate(b + sg * 5.6, 0, 1.0).applyMatrix4(F.M));
    Lc.add(M, ext([[b - 7, 18], [b + 7, 18], [b, 21.5]], [], 0, 1.6).applyMatrix4(F.M));
    const pc = atF(F, b, 0, 0.75); col.rect([pc[0] - 2.6, pc[2] - 1.0, pc[0] + 2.6, pc[2] + 1.0].map((v) => v), y, y + 1.2);
    vault(cx - b, Math.min(z0, z1), cx + b, Math.max(z0, z1), 'z');
  }
  for (const s of [-1, 1]) {
    const zl = cz + s * b, F = wall(s < 0 ? [xWest, zl] : [cx - A, zl], s < 0 ? [cx - A, zl] : [xWest, zl], 30); entab(F, 0, F.L);
    for (const u of [1.25, F.L - 1.25]) pilaster(Lc, F, u, 0, 26.6);
    revet(Lc, F, 2.6, F.L - 2.6, 13.6, 25.8);
    // the tombs flanking the Cathedra: Urban VIII's on the right (the north), Paul III's on the left
    const fp = (s < 0 ? tombUrban : tombPaul)(Lc, F, F.L / 2), p0 = atF(F, fp[0], 0, fp[1]), p1 = atF(F, fp[2], 0, fp[3]);
    col.rect([Math.min(p0[0], p1[0]), Math.min(p0[2], p1[2]), Math.max(p0[0], p1[0]), Math.max(p0[2], p1[2])], y, y + 4.5);
  }
  vault(xWest, cz - b, cx - A, cz + b, 'x');
  // ── the west end: the Cathedra Petri
  {
    const F = wall([xWest, cz + b], [xWest, cz - b], yc + 0.5); entab(F, 0, F.L / 2 - 9.5); entab(F, F.L / 2 + 9.5, F.L);   // the glory breaks through the cornice
    const uc = b;
    // the altar, the frame of coloured marble behind, the pedestals of the Doctors
    Lc.add(M, box(uc - 3, 0, 0, uc + 3, 1.3, 1.6).applyMatrix4(F.M));
    for (const sg of [-1, 1]) { Lc.add('marble_pink', box(uc + sg * 6.5 - 1.6, 0, 0, uc + sg * 6.5 + 1.6, 4.6, 3.6).applyMatrix4(F.M)); Lc.add(M, box(uc + sg * 6.5 - 1.8, 4.6, 0, uc + sg * 6.5 + 1.8, 5.0, 3.8).applyMatrix4(F.M)); }
    // the four Doctors of the Church in bronze, the two in front mitred
    for (const [du, dd, mirror, mitre] of [[-6.6, 2.6, false, true], [6.6, 2.6, true, true], [-5.6, 0.9, false, false], [5.6, 0.9, true, false]]) {
      const f = human({ pose: 'ease', h: 5.4, drape: 'mantle', n: 5, mirror, arms: mirror ? { l: [[-0.15, 0.7, 0.05], [-0.25, 0.92, 0.12]] } : { r: [[0.15, 0.7, 0.05], [0.25, 0.92, 0.12]] } });
      for (const g of [...f.stone, ...f.skin]) { g.rotateY(mirror ? -0.3 : 0.3); g.translate(uc + du, 5.0, dd); Lc.add(BR, g.applyMatrix4(F.M)); }
      if (mitre) Lc.add(GB, lathe([[0.22, 0], [0.24, 0.3], [0.12, 0.62], [0.001, 0.7]], 8, null, 0, 0, 0).scale(1, 1, 0.5).translate(uc + du, 5.0 + 5.4 * 0.95, dd).applyMatrix4(F.M));
    }
    // the throne of St Peter: the seat on scrolled feet, the back with its relief, the cushion; held up at the Doctors' hands
    const ty = 10.9, tb = new Local();
    tb.add(GB, box(-1.9, 0, -1.2, 1.9, 2.0, 1.2)); tb.add(GB, box(-2.0, 2.0, -1.3, 2.0, 2.4, 1.3)); tb.add(GB, box(-1.9, 2.4, -1.3, 1.9, 7.0, -0.7));
    tb.add(GB, ext(headPts(0, 6.8, 3.8, 'round', 10), [], -1.3, -0.7)); tb.add(BR, box(-1.3, 3.0, -0.7, 1.3, 6.2, -0.6));
    for (const sx of [-1, 1]) { tb.add(GB, box(sx * 1.9 - (sx > 0 ? 0.3 : 0), 2.4, -1.3, sx * 1.9 + (sx < 0 ? 0.3 : 0), 3.6, 1.3)); for (const sz of [-1, 1]) tb.add(GB, T(ball(0.35, 0.55, 0.35, 6, 4), sx * 1.7, -0.2, sz * 1.0)); }
    for (const list of tb.m.values()) for (const g of list) { g.translate(uc, ty, 3.0); Lc.add(list === tb.m.get(BR) ? BR : GB, g.applyMatrix4(F.M)); }
    // the window of the Holy Spirit: the oval of alabaster with the dove, the glory of gilt rays, clouds and cherubs round it
    const wy = 32.5, wr = 3.6;
    { const ov = disc(1, 0, 32); ov.scale(wr * 0.82, 1, wr); ov.rotateX(-Math.PI / 2); ov.rotateY(-Math.PI / 2); const P0 = atF(F, uc, wy, 0.12); ov.translate(P0[0], P0[1], P0[2]); Lc.add('glass_topaz', ov); }
    // the gilt sunburst behind the rays, and its frame of gilt round the window
    { const sb = disc(1, 0, 40); sb.scale(wr * 2.3, 1, wr * 2.5); sb.rotateX(-Math.PI / 2); sb.rotateY(-Math.PI / 2); const P0 = atF(F, uc, wy, 0.04); sb.translate(P0[0], P0[1], P0[2]); Lc.add(GB, sb); }
    { const fr = lathe([[1.0, 0], [1.0, 0.25], [1.14, 0.25], [1.14, 0]], 32); fr.scale(wr * 0.82, 1, wr); fr.rotateX(-Math.PI / 2); fr.rotateY(-Math.PI / 2); const P0 = atF(F, uc, wy, 0.04); fr.translate(P0[0], P0[1], P0[2]); Lc.add(GB, fr); }
    { const dv = new Local(); dv.add(GB, T(ball(0.35, 0.3, 0.2, 7, 4), 0, 0, 0)); for (const sg of [-1, 1]) dv.add(GB, ext([[0, 0], [sg * 1.4, 0.5], [sg * 1.1, 0.1], [sg * 0.9, -0.15]].map(([p, q]) => [p, q]), [], -0.03, 0.03)); for (const g of dv.m.get(GB)) Lc.add(GB, g.translate(uc, wy, 0.3).applyMatrix4(F.M)); }
    for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, r0 = wr * 1.05, r1 = wr * (1.9 + 0.7 * ((k * 7) % 3) / 2 + (Math.sin(a) < -0.5 ? 0.9 : 0)); Lc.add(GB, rod(atF(F, uc + Math.cos(a) * r0 * 0.82, wy + Math.sin(a) * r0, 0.25), atF(F, uc + Math.cos(a) * r1, wy + Math.sin(a) * r1, 0.25), 0.2, 4)); }
    for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI * 2, r = wr * (1.25 + 0.15 * (k % 3)); const P0 = atF(F, uc + Math.cos(a) * r * 0.9, wy + Math.sin(a) * r, 0.5); Lc.add(ST, T(ball(1.1, 0.8, 0.7, 7, 4), P0[0], P0[1], P0[2])); }
    for (let k = 0; k < 10; k++) { const a = (k + 0.5) / 10 * Math.PI * 2, r = wr * 1.5; const P0 = atF(F, uc + Math.cos(a) * r, wy + Math.sin(a) * r, 0.9); Lc.add(GB, T(ball(0.3, 0.33, 0.3, 6, 4), P0[0], P0[1], P0[2])); }
    const pc = atF(F, uc, 0, 0.8); col.rect([pc[0] - 0.9, pc[2] - 3.2, pc[0] + 3.0, pc[2] + 3.2], y, y + 1.3);
    for (const sg of [-1, 1]) { const q = atF(F, uc + sg * 6.5, 0, 1.8); col.rect([q[0] - 1.9, q[2] - 1.7, q[0] + 1.9, q[2] + 1.7], y, y + 5.0); }
  }
  // ── the crossing: the four piers' faces with their niches, saints and relic balconies
  for (let q = 0; q < 4; q++) {
    const sxq = q === 0 || q === 3 ? 1 : -1, szq = q < 2 ? 1 : -1;
    const p0 = [cx + sxq * A, cz + szq * b], p1 = [cx + sxq * b, cz + szq * A];
    const same = sxq === szq, a2 = same ? p0 : p1, b2 = same ? p1 : p0, F = lineFrame(a2, b2, y), L = F.L;
    // the face up to the pendentive's foot: an arc from ys at its ends to ys + rise in its middle
    const arc = []; for (let k = 0; k <= 12; k++) { const u = L * k / 12, P0 = [a2[0] + (b2[0] - a2[0]) * k / 12, a2[1] + (b2[1] - a2[1]) * k / 12], r2 = (P0[0] - cx) ** 2 + (P0[1] - cz) ** 2; arc.push([u, ys + Math.sqrt(Math.max(0, Rs * Rs - r2))]); }
    Lc.add(ST, ext([[0, -0.5], [L, -0.5], ...arc.reverse()], [], -1.5, 0).applyMatrix4(F.M));
    col.segment(a2, b2, 1.5, y, y + ys);
    entab(F, 0, L);
    // the niche: its frame, its shell, the colossal saint on his pedestal
    const uc = L / 2, nw = 4.4;
    Lc.add(PT, ext(archOutline(uc, 2.2, nw, 11.5, 'round', 10), [], 0.0, 0.03).applyMatrix4(F.M));
    Lc.add(M, ext(headPts(uc, 11.5, nw + 1.2, 'round', 10).concat(headPts(uc, 11.5, nw, 'round', 10).reverse()), [], 0, 0.5).applyMatrix4(F.M));
    for (const sg of [-1, 1]) Lc.add(M, box(uc + sg * nw / 2 - (sg > 0 ? 0 : 0.6), 2.2, 0, uc + sg * nw / 2 + (sg > 0 ? 0.6 : 0), 11.5, 0.5).applyMatrix4(F.M));
    Lc.add(M, box(uc - nw / 2 - 0.8, 0, 0, uc + nw / 2 + 0.8, 2.2, 1.6).applyMatrix4(F.M));
    { const f = human({ pose: q % 2 ? 'ease' : 'stand', mirror: q > 1, h: 8.6, drape: 'mantle', n: 5, arms: q === 0 ? { r: [[0.16, 0.7, 0.08], [0.24, 0.98, 0.12]], l: [[-0.17, 0.72, 0.1], [-0.28, 0.98, 0.1]] } : undefined }); for (const g of [...f.stone, ...f.skin]) { g.translate(uc, 2.2, 0.9); Lc.add(M, g.applyMatrix4(F.M)); } }
    if (q === 0) Lc.add(M, rod(atF(F, uc + 1.6, 2.4, 1.1), atF(F, uc + 2.2, 12.5, 1.0), 0.07, 5));   // Longinus' lance
    if (q === 1) { const P0 = atF(F, uc - 1.3, 2.4, 1.2); Lc.add(M, box(-0.2, 0, -0.08, 0.2, 7.6, 0.08).translate(P0[0], P0[1], P0[2])); }   // Helena's cross
    col.rect((() => { const P0 = atF(F, uc, 0, 0.8); return [P0[0] - 2.2, P0[2] - 2.2, P0[0] + 2.2, P0[2] + 2.2]; })(), y, y + 2.2);
    // the relic balcony above: the balcony on brackets, two of the twisted columns from the old basilica, the pediment
    const by = 15.0;
    Lc.add(M, box(uc - 3.2, by - 0.4, 0, uc + 3.2, by, 1.6).applyMatrix4(F.M));
    for (let k = 0; k <= 12; k++) Lc.add(M, lathe([[0.09, 0], [0.14, 0.3], [0.08, 0.75], [0.11, 0.95]], 6, null, 0, 0, 0).translate(uc - 3 + k * 0.5, by, 1.4).applyMatrix4(F.M));
    Lc.add(M, box(uc - 3.2, by + 0.95, 1.25, uc + 3.2, by + 1.1, 1.6).applyMatrix4(F.M));
    Lc.add(DL, box(uc - 1.4, by, -0.02, uc + 1.4, by + 5.6, 0.02).applyMatrix4(F.M));
    for (const sg of [-1, 1]) { const tw = new Local(); solomonic(tw, M, 0, 0, 0, 0.32, 5.6, 2.5, 8); for (const g of tw.m.get(M)) Lc.add(M, g.translate(uc + sg * 2.1, by, 0.6).applyMatrix4(F.M)); }
    Lc.add(M, box(uc - 2.8, by + 5.6, 0, uc + 2.8, by + 6.2, 1.0).applyMatrix4(F.M));
    Lc.add(M, ext(headPts(uc, by + 6.2, 5.6, 'round', 8).map(([p, qq]) => [p, by + 6.2 + (qq - by - 6.2) * 0.5]), [], 0, 1.0).applyMatrix4(F.M));
  }
  // the pendentives: the sphere through the arches' crowns and the piers' corners, between the arches and the drum
  {
    const t = [], NT = 96, NR = 6, rho = (th) => { const c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th)); const dArch = A / Math.max(c, s); const dCh = ((A + b) / Math.SQRT2) / ((c + s) / Math.SQRT2); return Math.min(dArch, dCh); };
    const P = (th, r) => [cx + Math.cos(th) * r, y + ys + Math.sqrt(Math.max(0, Rs * Rs - r * r)), cz + Math.sin(th) * r];
    for (let i = 0; i < NT; i++) { const t0 = i / NT * Math.PI * 2, t1 = (i + 1) / NT * Math.PI * 2, e0 = rho(t0), e1 = rho(t1); for (let j = 0; j < NR; j++) { const a0 = R0 + (e0 - R0) * j / NR, a1 = R0 + (e0 - R0) * (j + 1) / NR, b0 = R0 + (e1 - R0) * j / NR, b1 = R0 + (e1 - R0) * (j + 1) / NR; t.push(...P(t0, a0), ...P(t1, b0), ...P(t1, b1), ...P(t0, a0), ...P(t1, b1), ...P(t0, a1)); } }
    Lc.add(GO, dbl(t));
    // the roundels of the Evangelists: a gilt ring and a blue field on each pendentive
    for (let q = 0; q < 4; q++) {
      const th = Math.PI / 4 + q * Math.PI / 2, r = (R0 + (A + b) / Math.SQRT2) / 2, c = P(th, r), n = [cx - c[0], (y + ys + 4) - c[1], cz - c[2]], L2 = Math.hypot(...n), up = n.map((v) => v / L2);
      const g = lathe([[2.6, 0], [2.6, 0.12], [2.2, 0.12], [2.2, 0]], 20), g2 = disc(2.2, 0.06, 20);
      for (const G of [g, g2]) { orientTo(G, up); G.translate(c[0] + up[0] * 0.08, c[1] + up[1] * 0.08, c[2] + up[2] * 0.08); }
      Lc.add(GB, g); Lc.add(BL, g2);
    }
  }
  // the drum inside: the band of the inscription, the sixteen windows between paired pilasters, the cornice
  {
    const yd0 = y + yc, yd1 = y + yDrum1, N = 64, t = [];
    for (let i = 0; i < N; i++) { const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2; const p = (a, yy) => [cx + Math.cos(a) * R0, yy, cz + Math.sin(a) * R0]; t.push(...p(a0, yd0), ...p(a1, yd0), ...p(a1, yd1), ...p(a0, yd0), ...p(a1, yd1), ...p(a0, yd1)); }
    Lc.add(ST, dbl(t));
    const ring = (r0, r1, y0, y1, mat) => Lc.add(mat, lathe([[r0, y0], [r1, y0], [r1, y1], [r0, y1]], 48, null, cx, 0, cz));
    ring(R0 - 0.9, R0, yd0, yd0 + 0.8, TR); ring(R0 - 0.25, R0, yd0 + 0.8, yd0 + 3.2, GO); ring(R0 - 1.1, R0, yd0 + 3.2, yd0 + 4.0, TR);
    // the letters in blue on the gold band, running round
    const text = 'TV ES PETRVS ET SVPER HANC PETRAM AEDIFICABO ECCLESIAM MEAM ET TIBI DABO CLAVES REGNI CAELORVM', hL = 1.6, k = hL / 6, sw = hL * 0.12, R = R0 - 0.27;
    let total = 0; for (const ch of text) total += adv(ch) * k;
    let u = (2 * Math.PI * R - total) / 2;
    const toCyl = (uu, yy) => { const a = Math.PI + uu / R; return [cx + Math.cos(a) * R, yy, cz + Math.sin(a) * R, a]; };
    for (const ch of text) {
      for (const [a, b0, c, d] of FONT[ch] ?? []) {
        const [x0, y0, z0] = toCyl(u + a * k, yd0 + 1.2 + b0 * k), [x1, y1, z1] = toCyl(u + c * k, yd0 + 1.2 + d * k);
        Lc.add(BL, rod([x0, y0, z0], [x1, y1, z1], sw / 2, 4));
      }
      u += adv(ch) * k;
    }
    for (let i = 0; i < 16; i++) {
      const a = (i + 0.5) / 16 * Math.PI * 2, c = [cx + Math.cos(a) * (R0 - 0.03), cz + Math.sin(a) * (R0 - 0.03)], tg = [-Math.sin(a), Math.cos(a)];
      const F = lineFrame([c[0] - tg[0] * 1.6, c[1] - tg[1] * 1.6], [c[0] + tg[0] * 1.6, c[1] + tg[1] * 1.6], 0);
      // (the frame's d points toward the axis: the window lies on the wall, its sill and head stand inward)
      Lc.add(DL, box(0.2, yd0 + 9, -0.02, 3.0, yd0 + 19, 0.0).applyMatrix4(F.M));
      Lc.add(TR, box(-0.1, yd0 + 8.5, 0, 3.3, yd0 + 9, 0.5).applyMatrix4(F.M));
      Lc.add(TR, ext(headPts(1.6, yd0 + 19, 3.4, 'round', 6).concat(headPts(1.6, yd0 + 19, 2.8, 'round', 6).reverse()), [], 0, 0.4).applyMatrix4(F.M));
      const b2 = (i + 1) / 16 * Math.PI * 2;
      for (const dd of [-0.07, 0.07]) { const p = [cx + Math.cos(b2 + dd) * (R0 - 0.02), cz + Math.sin(b2 + dd) * (R0 - 0.02)], tg2 = [-Math.sin(b2 + dd), Math.cos(b2 + dd)]; const G = lineFrame([p[0] - tg2[0] * 0.45, p[1] - tg2[1] * 0.45], [p[0] + tg2[0] * 0.45, p[1] + tg2[1] * 0.45], 0); Lc.add(TR, box(0, yd0 + 4.0, 0, 0.9, yd1 - 1.2, 0.5).applyMatrix4(G.M)); }
    }
    ring(R0 - 1.4, R0, yd1 - 1.2, yd1, TR);
  }
  // the dome: the shell in gold mosaic, sixteen gilt ribs, the rings, the oculus and the lantern's light
  {
    const y0 = y + o.yDome, H2 = o.domeH, ro = 3.0, NA = 48, NB = 12, t = [];
    const P = (a, j) => { const ph = Math.acos(ro / R0) * j / NB, r = R0 * Math.cos(ph), hh = H2 * Math.sin(ph); return [cx + Math.cos(a) * r, y0 + hh, cz + Math.sin(a) * r]; };
    const phiMax = Math.acos(ro / R0);
    const Q = (a, f) => { const ph = phiMax * f; return [cx + Math.cos(a) * R0 * Math.cos(ph), y0 + H2 * Math.sin(ph), cz + Math.sin(a) * R0 * Math.cos(ph)]; };
    void P;
    for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) { const a0 = i / NA * Math.PI * 2, a1 = (i + 1) / NA * Math.PI * 2, f0 = j / NB, f1 = (j + 1) / NB; t.push(...Q(a0, f0), ...Q(a1, f0), ...Q(a1, f1), ...Q(a0, f0), ...Q(a1, f1), ...Q(a0, f1)); }
    Lc.add(GO, dbl(t));
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; for (let j = 0; j < NB; j++) { const p0 = Q(a, j / NB), p1 = Q(a, (j + 1) / NB); const k0 = 0.97, sh = (p) => [cx + (p[0] - cx) * k0, p[1] - 0.15, cz + (p[2] - cz) * k0]; Lc.add(GB, rod(sh(p0), sh(p1), 0.35, 5)); } }
    for (const f of [0.28, 0.55, 0.8]) for (let i = 0; i < 48; i++) { const a0 = i / 48 * Math.PI * 2, a1 = (i + 1) / 48 * Math.PI * 2; const sh = (p) => [cx + (p[0] - cx) * 0.98, p[1] - 0.1, cz + (p[2] - cz) * 0.98]; Lc.add(ST, rod(sh(Q(a0, f)), sh(Q(a1, f)), 0.18, 4)); }
    const yo = y0 + H2 * Math.sin(phiMax);
    Lc.add(TR, lathe([[ro, 0], [ro + 0.6, 0], [ro + 0.6, 0.5], [ro, 0.5]], 24, null, cx, yo - 0.4, cz));
    Lc.add(DL, twoSided(lathe([[ro, 0], [ro, 2.0]], 24, null, cx, yo, cz)));
    Lc.add(ST, disc(ro, yo + 2.0, 24, cx, cz, false));
    Lc.add(GB, T(ball(0.6, 0.4, 0.5, 8, 4), cx, yo + 1.7, cz));
    // the cornice at the dome's foot
    Lc.add(TR, lathe([[R0 - 1.3, 0], [R0, 0], [R0, 0.6], [R0 - 1.3, 0.6]], 48, null, cx, y0 - 0.6, cz));
  }
  // ── the baldacchino over the papal altar
  {
    const bx = cx, bz = cz, h0 = 0.0, s = 5.2;
    Lc.add(M, box(bx - 4.5, y, bz - 4.5, bx + 4.5, y + 0.6, bz + 4.5)); Lc.add(M, box(bx - 3.6, y + 0.6, bz - 3.6, bx + 3.6, y + 1.0, bz + 3.6));
    Lc.add(M, box(bx - 1.9, y + 1.0, bz - 1.0, bx + 1.9, y + 2.2, bz + 1.0)); Lc.add('marble_pink', box(bx - 1.6, y + 1.1, bz - 1.02, bx + 1.6, y + 2.0, bz + 1.02));
    col.rect([bx - 4.5, bz - 4.5, bx + 4.5, bz + 4.5], y, y + 0.6); col.floor([bx - 3.6, bz - 3.6, bx + 3.6, bz + 3.6], y + 1.0); col.rect([bx - 1.9, bz - 1.0, bx + 1.9, bz + 1.0], y + 1.0, y + 2.2);
    const yP = y + h0, colH = 11.0;
    for (const [sxx, szz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const px = bx + sxx * s, pz = bz + szz * s;
      Lc.add(M, box(px - 1.15, yP, pz - 1.15, px + 1.15, yP + 3.0, pz + 1.15));
      Lc.add('marble_pink', box(px - 1.17, yP + 0.9, pz - 0.7, px + 1.17, yP + 2.3, pz + 0.7)); Lc.add('marble_pink', box(px - 0.7, yP + 0.9, pz - 1.17, px + 0.7, yP + 2.3, pz + 1.17));
      Lc.add(BR, lathe([[0.85, 0], [0.85, 0.3], [0.7, 0.5], [0.72, 0.65]], 12, null, px, yP + 3.0, pz));
      solomonic(Lc, BR, px, yP + 3.65, pz, 0.62, colH, 3, 12);
      for (let k = 0; k < 18; k++) { const yy = yP + 3.65 + colH * (0.4 + 0.6 * k / 18), a = k * 1.3 + (yy - yP) * 1.1; Lc.add(GB, T(ball(0.16, 0.22, 0.1, 5, 3), px + Math.cos(a) * 0.7, yy, pz + Math.sin(a) * 0.7)); }   // the laurel climbing the shaft, gilt
      Lc.add(GB, lathe([[0.62, 0], [0.7, 0.4], [0.95, 1.1], [1.1, 1.4]], 12, (th, j) => (j === 2 ? 1 + 0.12 * Math.cos(th * 8) : 1), px, yP + 3.65 + colH, pz));
      Lc.add(BR, box(px - 1.25, yP + 5.05 + colH, pz - 1.25, px + 1.25, yP + 6.3 + colH, pz + 1.25));
      col.circle(px, pz, 1.2, y, y + 3.0);
      // the angel standing on the corner
      const ang = human({ pose: 'ease', h: 3.2, drape: 'peplos', n: 5, mirror: sxx * szz > 0, arms: { r: [[0.15, 0.68, 0.06], [0.12, 0.86, 0.14]], l: [[-0.15, 0.68, 0.06], [-0.18, 0.9, 0.1]] } });
      for (const g of [...ang.stone, ...ang.skin]) { g.rotateY(Math.atan2(sxx, szz)); g.translate(px, yP + 6.3 + colH, pz); Lc.add(GB, g); }
    }
    // the entablature and the canopy with its valance of bronze cloth, the bees and tassels gilt
    const yE = yP + 5.05 + colH, yV = yE + 1.25;
    for (const [a2, b2] of [[[-s, -s], [s, -s]], [[s, -s], [s, s]], [[s, s], [-s, s]], [[-s, s], [-s, -s]]]) {
      const F = lineFrame([bx + a2[0], bz + a2[1]], [bx + b2[0], bz + b2[1]], 0), L = F.L;
      Lc.add(BR, box(0, yE, -0.4, L, yV, 0.4).applyMatrix4(F.M));
      for (let k = 0; k < 10; k++) { const u = (k + 0.5) * L / 10; Lc.add(BR, ext([[u - L / 20 + 0.05, 0], [u + L / 20 - 0.05, 0], [u + L / 20 - 0.05, -1.1], [u, -1.45], [u - L / 20 + 0.05, -1.1]], [], -0.5, -0.4).translate(0, yE, 0).applyMatrix4(F.M)); Lc.add(GB, T(ball(0.12, 0.2, 0.08, 5, 3), u, yE - 1.2, -0.56).applyMatrix4(F.M)); Lc.add(GB, T(ball(0.1, 0.13, 0.06, 5, 3), u, yE - 0.5, -0.56).applyMatrix4(F.M)); }
    }
    Lc.add(BR, box(bx - s + 0.4, yV - 0.2, bz - s + 0.4, bx + s - 0.4, yV, bz + s - 0.4));
    Lc.add(GB, disc(1.6, yV - 0.22, 16, bx, bz, false));                                        // the dove under the canopy
    // the four great scrolls rising from the corners to the crown, the globe and the cross
    const yTop = yV + 7.6;
    for (const [sxx, szz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const pts = []; for (let k = 0; k <= 10; k++) { const t2 = k / 10, r = (s - 0.4) * (1 - t2) ** 0.8 + 0.6 * t2, hh = (yTop - 1.2 - yV) * (Math.sin(t2 * Math.PI / 2) ** 1.3); pts.push([bx + sxx * r, yV + hh, bz + szz * r]); }
      for (let k = 0; k + 1 < pts.length; k++) Lc.add(BR, rod(pts[k], pts[k + 1], 0.32 - k * 0.018, 6));
      Lc.add(BR, T(ball(0.55, 0.55, 0.3, 8, 4), pts[1][0], pts[1][1] + 0.3, pts[1][2]));
      Lc.add(GB, T(ball(0.3, 0.3, 0.3, 6, 4), pts[0][0], pts[0][1] + 0.4, pts[0][2]));
    }
    Lc.add(BR, lathe([[0.9, 0], [0.7, 0.4], [0.5, 1.0], [0.6, 1.2]], 10, null, bx, yTop - 1.2, bz));
    Lc.add(GB, T(ball(0.75, 0.75, 0.75, 12, 6), bx, yTop + 0.75, bz));
    Lc.add(GB, box(bx - 0.1, yTop + 1.4, bz - 0.1, bx + 0.1, yTop + 3.6, bz + 0.1)); Lc.add(GB, box(bx - 0.6, yTop + 2.8, bz - 0.1, bx + 0.6, yTop + 3.0, bz + 0.1));
  }
  Lc.emit(bag);
}
/** A lathe seen from inside as well. */
function twoSided(g) { if (g.index) g = g.toNonIndexed(); const p = Array.from(g.attributes.position.array); return dbl(p); }
/** Turn a geometry built facing +y (a disc, a lathe) to face along the unit vector n. */
function orientTo(g, n) {
  const ax = [n[2], 0, -n[0]], la = Math.hypot(ax[0], ax[2]), ang = Math.acos(Math.max(-1, Math.min(1, n[1])));
  if (la > 1e-6) g.applyMatrix4(new Matrix4().makeRotationAxis({ x: ax[0] / la, y: 0, z: ax[2] / la, isVector3: true }, ang));
}
