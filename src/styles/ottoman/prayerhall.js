// The Süleymaniye's prayer hall (docs/settlements/ottoman-istanbul.md §4.10): the central dome on four
// great piers and four pointed arches, the pendentives between them, the drum of thirty-two windows;
// on the qibla axis the two semidomes, pierced at their foot by windows, carried on the piers, the
// outer walls and side arches; across the other axis the tympanum walls filled with windows over
// triple arcades on two monolithic red granite columns each side; the side aisles under rows of
// small domes. On the qibla wall the white marble mihrab with its gilded muqarnas hood, the Iznik
// tiles round it and the two great roundels of script, the windows of coloured glass in plaster
// tracery; the marble minbar to the right of the mihrab, the sultan's loge on porphyry columns to
// its left, the muezzins' platform at the far end, the walnut kürsü; the great ring of lamps hung
// low on long chains, lamps in every bay; the carpets.

import { box, lathe, fromTriangles, rod, place } from '../../core/geom.js';
import { arcadeWall, dblT } from './index.js';

const S = 'limestone', L = 'lead', M = 'marble_smooth', ST = 'stucco';
const q4 = (o, a, b, c, d) => o.push(...a, ...b, ...c, ...a, ...c, ...d);
/** The intrados of the pointed arch over [−h, h] springing at ys (centres 0.38 of the span in from each side), at offset u. */
export const archY = (u, h, ys) => ys + Math.sqrt(Math.max(0, (1.24 * h) ** 2 - (Math.abs(u) + 0.24 * h) ** 2));
/** The half-width of that arch's opening at height yy. */
const archU = (yy, h, ys) => Math.max(0, Math.sqrt(Math.max(0, (1.24 * h) ** 2 - (yy - ys) ** 2)) - 0.24 * h);

/**
 * A curved fill (pendentive) round the centre (cx, cz): for each direction th of ths, from the
 * boundary point bottom(th) = [rho, y] up to the rim at radius R and height top, leaning in as a
 * sphere does above its springing. dir(th) gives the plan direction [dx, dz].
 */
function fill(bag, mat, cx, cz, ths, bottom, R, top, dir, N = 8) {
  const t = [];
  const P = (th, B, k) => { const s = k / N, rho = B[0] - (B[0] - R) * (1 - Math.cos(s * Math.PI / 2)), yy = B[1] + (top - B[1]) * s, d = dir(th); return [cx + d[0] * rho, yy, cz + d[1] * rho]; };
  for (let i = 0; i + 1 < ths.length; i++) {
    const a = ths[i], b = ths[i + 1], A = bottom(a), B = bottom(b);
    if (!A || !B || (A[0] - R < 0.01 && B[0] - R < 0.01)) continue;
    for (let k = 0; k < N; k++) q4(t, P(a, A, k), P(b, B, k), P(b, B, k + 1), P(a, A, k + 1));
  }
  bag.add(mat, dblT(t));
}

/** A big monolith of the triple arcades: plinth, torus, red granite shaft, a capital of four tiers of muqarnas cells, the abacus. */
function monolith(bag, col, x, z, y, hs) {
  bag.add(M, box(x - 0.95, y, z - 0.95, x + 0.95, y + 0.45, z + 0.95));
  bag.add(M, lathe([[0.86, 0], [0.86, 0.18], [0.74, 0.34], [0.68, 0.5]], 20, null, x, y + 0.45, z));
  bag.add('granite_red', lathe([[0.66, 0], [0.6, hs - 2.5]], 20, null, x, y + 0.95, z));
  bag.add(M, lathe([[0.68, 0], [0.68, 0.14], [0.62, 0.2]], 20, null, x, y + hs - 1.55, z));
  for (let k = 0; k < 4; k++) {
    const r0 = 0.6 + k * 0.13, yy = y + hs - 1.4 + k * 0.33, n = 10 + k * 4;
    bag.add(M, lathe([[r0 - 0.07, 0], [r0 - 0.07, 0.33]], 20, null, x, yy, z));
    for (let i = 0; i < n; i++) { const a = (i + (k % 2) * 0.5) / n * Math.PI * 2, w = r0 * Math.PI / n * 0.86; bag.add(k === 3 ? 'gilt_bronze' : M, place(box(-0.11, 0.02, -w, 0.06, 0.33, w), x + Math.cos(a) * r0, yy, z + Math.sin(a) * r0, -a)); }
  }
  bag.add(M, box(x - 1.05, y + hs - 0.08, z - 1.05, x + 1.05, y + hs + 0.2, z + 1.05));
  col.circle(x, z, 0.7, y, y + hs);
}
/** A slender column (the loge's and the platform's): base, shaft of mat, a stepped capital banded in gilt. */
function colonnette(bag, col, x, z, y, h, mat) {
  bag.add(M, box(x - 0.3, y, z - 0.3, x + 0.3, y + 0.18, z + 0.3));
  bag.add(mat, lathe([[0.2, 0], [0.18, h - 0.68]], 12, null, x, y + 0.18, z));
  bag.add('gilt_bronze', lathe([[0.2, 0], [0.2, 0.06]], 12, null, x, y + h - 0.56, z));
  bag.add(M, lathe([[0.2, 0], [0.2, 0.1], [0.27, 0.22], [0.27, 0.27], [0.33, 0.4], [0.33, 0.44]], 12, (t) => 1 + 0.06 * Math.cos(t * 12), x, y + h - 0.5, z));
  bag.add(M, box(x - 0.36, y + h - 0.06, z - 0.36, x + 0.36, y + h, z + 0.36));
  col.circle(x, z, 0.2, y, y + h);
}
/** A vertical disc of n segments on a face normal to z (facing −z when s = −1). */
function discZ(bag, mat, x, y, z, r, n = 32) {
  const t = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2; t.push(x, y, z, x + Math.cos(a) * r, y + Math.sin(a) * r, z, x + Math.cos(b) * r, y + Math.sin(b) * r, z); }
  bag.add(mat, dblT(t));
}
/** A ring of lamps of glass on an iron hoop, at (x, y, z), radius r, n lamps; hung on chains to the points of top(px, pz). */
function lampRing(bag, x, y, z, r, n, chains, top) {
  bag.add('iron', lathe([[r + 0.03, 0], [r + 0.03, 0.06], [r - 0.03, 0.06], [r - 0.03, 0]], Math.max(16, n * 2), null, x, y, z));
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    bag.add('lamp_glass', lathe([[0.001, 0], [0.09, 0.03], [0.11, 0.14], [0.07, 0.24], [0.08, 0.3], [0.001, 0.3]], 6, null, px, y - 0.3, pz));
    bag.add('iron', rod([px, y - 0.02, pz], [px, y + 0.06, pz], 0.008, 3));
  }
  for (let k = 0; k < chains; k++) { const a = (k + 0.5) / chains * Math.PI * 2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; bag.add('iron', rod([px, y + 0.06, pz], [px, top(px, pz), pz], 0.012, 3)); }
}

/**
 * The prayer hall inside and its roofs. p: { cx, cz, y, R (the dome's radius), Hi (the inner half
 * width), T (the outer walls), yp (the drum's foot), yr (the dome's springing), ys (the great
 * arches' springing), wallH }.
 */
export function prayerHall(bag, col, p) {
  const { cx, cz, y, R, Hi, T, yp, yr, ys } = p, P = 5.2, qz = cz + Hi, PI = Math.PI;
  // ——— the four great piers: plinth, shaft, mouldings at mid height and at the springing ———
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const xa = cx + sx * R, xb = cx + sx * (R + P), za = cz + sz * R, zb = cz + sz * (R + P);
    const r = [Math.min(xa, xb), Math.min(za, zb), Math.max(xa, xb), Math.max(za, zb)];
    bag.add(S, box(r[0], y - 0.5, r[1], r[2], ys, r[3])); col.rect(r, y, ys);
    bag.add(M, box(r[0] - 0.12, y, r[1] - 0.12, r[2] + 0.12, y + 0.9, r[3] + 0.12));
    for (const [y0, h, o] of [[y + 9.0, 0.35, 0.1], [ys - 0.7, 0.7, 0.18]]) bag.add(S, box(r[0] - o, y0, r[1] - o, r[2] + o, y0 + h, r[3] + o));
  }
  // ——— the great arches: those across (east, west) carry the corners; those on the qibla axis open on the semidomes ———
  for (const sx of [-1, 1]) arcadeWall(bag, [cx + sx * (R + 1.25), cz - R - 2.5], [cx + sx * (R + 1.25), cz + R + 2.5], [[2.5, 2.5 + 2 * R]], ys, ys, yp, 2.5, S);
  for (const sz of [-1, 1]) arcadeWall(bag, [cx - R, cz + sz * (R + 1.25)], [cx + R, cz + sz * (R + 1.25)], [[0, 2 * R]], ys, ys, yp, 2.5, S);
  // ——— the pendentives from the arches to the drum's foot ———
  const ths = Array.from({ length: 97 }, (_, i) => i / 96 * PI * 2);
  fill(bag, ST, cx, cz, ths, (th) => {
    const c = Math.cos(th), s = Math.sin(th), rho = R / Math.max(Math.abs(c), Math.abs(s));
    return [rho, archY(Math.abs(c) >= Math.abs(s) ? rho * s : rho * c, R, ys)];
  }, R, yp, (th) => [Math.cos(th), Math.sin(th)], 10);
  // roundels of script on the pendentives (gilt on blue), at the diagonals
  for (let k = 0; k < 4; k++) {
    // on the diagonal the pendentive runs from the corner (R√2 out, at ys) to the ring: the point at s = 0.55 and its slope there
    const a = PI / 4 + k * PI / 2, sp = 0.55, rb = R * Math.SQRT2, rr = rb - (rb - R) * (1 - Math.cos(sp * PI / 2)), yy = ys + (yp - ys) * sp, px = cx + Math.cos(a) * rr, pz = cz + Math.sin(a) * rr;
    const t = [], tb = [];
    const n = [Math.cos(a), Math.sin(a)], tg = [-Math.sin(a), Math.cos(a)], tilt = (rb - R) * (PI / 2) * Math.sin(sp * PI / 2) / (yp - ys);
    // a disc leaning back with the pendentive (its normal toward the centre and down)
    const Q = (u, v, d) => [px + tg[0] * u - n[0] * (d + v * tilt), yy + v, pz + tg[1] * u - n[1] * (d + v * tilt)];
    for (let i = 0; i < 24; i++) { const a0 = i / 24 * PI * 2, a1 = (i + 1) / 24 * PI * 2; t.push(...Q(0, 0, 0.12), ...Q(Math.cos(a0) * 1.5, Math.sin(a0) * 1.5, 0.12), ...Q(Math.cos(a1) * 1.5, Math.sin(a1) * 1.5, 0.12)); tb.push(...Q(Math.cos(a0) * 1.5, Math.sin(a0) * 1.5, 0.12), ...Q(Math.cos(a1) * 1.5, Math.sin(a1) * 1.5, 0.12), ...Q(Math.cos(a1) * 1.65, Math.sin(a1) * 1.65, 0.1), ...Q(Math.cos(a0) * 1.5, Math.sin(a0) * 1.5, 0.12), ...Q(Math.cos(a1) * 1.65, Math.sin(a1) * 1.65, 0.1), ...Q(Math.cos(a0) * 1.65, Math.sin(a0) * 1.65, 0.1)); }
    bag.add('glaze_blue', dblT(t)); bag.add('gilt_bronze', dblT(tb));
    for (let i = 0; i < 9; i++) { const u = -1.0 + i * 0.25, h = (i % 3 === 1 ? 0.9 : 0.55) * Math.sqrt(1 - (u / 1.5) ** 2); bag.add('gilt_bronze', rod(Q(u, -h * 0.8, 0.14), Q(u, h * 0.8, 0.14), 0.035, 3)); }
    bag.add('gilt_bronze', rod(Q(-1.05, -0.45, 0.14), Q(1.05, -0.45, 0.14), 0.035, 3));
  }
  // ——— the drum: thirty-two windows between piers; the dome painted inside, in lead outside ———
  const RO = R + 1.5, nW = 32;
  for (let j = 0; j < nW; j++) {
    const a = (j + 0.5) / nW * PI * 2, b = (j + 1) / nW * PI * 2;
    bag.add(S, place(box(R, yp, -0.75, RO, yr, 0.75), cx, 0, cz, -b));
    bag.add(S, place(box(R, yp, -0.72, RO, yp + 0.5, 0.72), cx, 0, cz, -a));
    bag.add(S, place(box(R, yp + 2.9, -0.72, RO, yr, 0.72), cx, 0, cz, -a));
    for (let s = 0; s < 3; s++) bag.add(S, place(box(R, yp + 2.6 + s * 0.1, -0.65 + s * 0.2, RO, yp + 2.7 + s * 0.1, 0.65 - s * 0.2), cx, 0, cz, -a));
    bag.add('daylight', place(box(R + 0.72, yp + 0.5, -0.66, R + 0.78, yp + 2.9, 0.66), cx, 0, cz, -a));
    bag.add('opening', place(box(RO - 0.04, yp + 0.5, -0.66, RO + 0.02, yp + 2.9, 0.66), cx, 0, cz, -a));
  }
  bag.add(S, lathe([[RO + 0.3, 0], [RO + 0.3, 0.45], [RO, 0.6]], 48, null, cx, yr - 0.3, cz));
  const inner = [[0.001, R * 0.9], [R * 0.38, R * 0.86], [R * 0.66, R * 0.72], [R * 0.86, R * 0.5], [R * 0.97, R * 0.25], [R, 0], [R, -0.02]];
  bag.add(ST, lathe(inner, 48, null, cx, yr, cz));
  // the paint: a band of script at the dome's foot, rings, the medallion at the crown with its rays
  bag.add('glaze_blue', lathe([[R - 0.05, 1.1], [R - 0.05, 0.1]], 48, null, cx, yr, cz));
  for (let k = 0; k < 160; k++) { const a = k / 160 * PI * 2, hh = (k * 7) % 5 === 0 ? 0.35 : (k % 3 ? 0.85 : 0.55); bag.add('glaze_white', rod([cx + Math.cos(a) * (R - 0.07), yr + 0.18, cz + Math.sin(a) * (R - 0.07)], [cx + Math.cos(a) * (R - 0.07), yr + 0.18 + hh, cz + Math.sin(a) * (R - 0.07)], 0.03, 3)); }
  bag.add('gilt_bronze', lathe([[R * 0.86 - 0.06, R * 0.5 + 0.12], [R * 0.86 - 0.06, R * 0.5 - 0.12]], 48, null, cx, yr, cz));
  const shellY = (rho) => { for (let i = 0; i + 1 < inner.length; i++) { const [r0, y0] = inner[i], [r1, y1] = inner[i + 1]; if (rho >= r0 && rho <= r1) return y0 + (y1 - y0) * (rho - r0) / (r1 - r0); } return 0; };
  const med = [[0.001, shellY(0.01) - 0.04], [R * 0.12, shellY(R * 0.12) - 0.04], [R * 0.24, shellY(R * 0.24) - 0.04]];
  bag.add('glaze_blue', lathe(med, 32, null, cx, yr, cz));
  bag.add('gilt_bronze', lathe([[R * 0.24, shellY(R * 0.24) - 0.05], [R * 0.27, shellY(R * 0.27) - 0.05]], 32, null, cx, yr, cz));
  for (let k = 0; k < 16; k++) { const a = k / 16 * PI * 2, r0 = R * 0.28, r1 = R * (k % 2 ? 0.52 : 0.62); bag.add('gilt_bronze', rod([cx + Math.cos(a) * r0, yr + shellY(r0) - 0.06, cz + Math.sin(a) * r0], [cx + Math.cos(a) * r1, yr + shellY(r1) - 0.06, cz + Math.sin(a) * r1], 0.06, 3)); }
  for (let k = 0; k < 24; k++) { const a = k / 24 * PI * 2, r0 = R * 0.05, r1 = R * 0.2; bag.add('glaze_white', rod([cx + Math.cos(a) * r0, yr + shellY(r0) - 0.06, cz + Math.sin(a) * r0], [cx + Math.cos(a) * r1, yr + shellY(r1) - 0.06, cz + Math.sin(a) * r1], 0.04, 3)); }
  bag.add(L, lathe([[RO, 0], [RO * 0.94, R * 0.3], [RO * 0.78, R * 0.6], [RO * 0.5, R * 0.86], [0.001, R * 0.97]], 48, null, cx, yr + 0.15, cz));
  for (const [rr, yy] of [[0.5, 0], [0.75, 0.9], [0.55, 2.0]]) bag.add('gilt_bronze', lathe([[0.1, 0], [rr, 0.35], [0.1, 0.75]], 10, null, cx, yr + 0.15 + R * 0.97 + yy, cz));
  bag.add('gilt_bronze', rod([cx, yr + R * 0.97, cz], [cx, yr + R * 0.97 + 4.2, cz], 0.08, 6));

  // ——— the semidomes on the qibla axis (north and south) ———
  const NT = 16, NP = 24, cl = 0.24 * R, rr = 1.24 * R, ta = Math.acos(-cl / rr);
  const prof = Array.from({ length: NT + 1 }, (_, k) => { const t = PI - (PI - ta) * k / NT; return [Math.max(0, -(cl + rr * Math.cos(t))), rr * Math.sin(t)]; });
  prof[NT][0] = 0;
  const semiH = (rho) => { for (let k = 0; k < NT; k++) { const [r0, h0] = prof[k], [r1, h1] = prof[k + 1]; if (rho <= r0 && rho >= r1) return h0 + (h1 - h0) * (r0 - rho) / Math.max(1e-6, r0 - r1); } return 0; };
  const win = new Set([4, 7, 10, 13, 16, 19]), RD = R + 1.2, HD = 5.0, wb = Hi - R - 0.9;
  for (const sz of [-1, 1]) {
    const czs = cz + sz * (R + 0.9), Pt = (phi, rho, yy) => [cx + Math.cos(phi) * rho, yy, czs + sz * Math.sin(phi) * rho];
    const shell = [], rev = [], dl = [], op = [], drum = [];
    for (let j = 0; j < NP; j++) {
      const f0 = j / NP * PI, f1 = (j + 1) / NP * PI;
      for (let k = 0; k < NT; k++) {
        const [r0, h0] = prof[k], [r1, h1] = prof[k + 1], w = win.has(j) && (k === 1 || k === 2);
        if (!w) { q4(shell, Pt(f0, r0, ys + h0), Pt(f1, r0, ys + h0), Pt(f1, r1, ys + h1), Pt(f0, r1, ys + h1)); continue; }
        // the window's reveals out to the drum, its light, the opening in the drum outside
        for (const f of [f0, f1]) q4(rev, Pt(f, r0, ys + h0), Pt(f, RD, ys + h0), Pt(f, RD, ys + h1), Pt(f, r1, ys + h1));
        if (k === 1) q4(rev, Pt(f0, r0, ys + h0), Pt(f1, r0, ys + h0), Pt(f1, RD, ys + h0), Pt(f0, RD, ys + h0));
        if (k === 2) q4(rev, Pt(f0, r1, ys + h1), Pt(f1, r1, ys + h1), Pt(f1, RD, ys + h1), Pt(f0, RD, ys + h1));
      }
      // the drum round the semidome's foot, its windows over rows 1–2
      const h1 = prof[1][1], h3 = prof[3][1];
      for (const [a, b] of win.has(j) ? [[0, h1], [h3, HD]] : [[0, HD]]) q4(drum, Pt(f0, RD, ys + a), Pt(f1, RD, ys + a), Pt(f1, RD, ys + b), Pt(f0, RD, ys + b));
      if (win.has(j)) { q4(dl, Pt(f0, RD - 0.05, ys + h1), Pt(f1, RD - 0.05, ys + h1), Pt(f1, RD - 0.05, ys + h3), Pt(f0, RD - 0.05, ys + h3)); q4(op, Pt(f0, RD + 0.03, ys + h1), Pt(f1, RD + 0.03, ys + h1), Pt(f1, RD + 0.03, ys + h3), Pt(f0, RD + 0.03, ys + h3)); }
      q4(drum, Pt(f0, RD - 0.05, ys + HD), Pt(f1, RD - 0.05, ys + HD), Pt(f1, RD + 0.15, ys + HD), Pt(f0, RD + 0.15, ys + HD));
    }
    bag.add(ST, dblT(shell)); bag.add(ST, dblT(rev)); bag.add('daylight', dblT(dl)); bag.add('opening', dblT(op)); bag.add(S, dblT(drum));
    // the lead outside: from the drum's top to its crown, closed on the side of the great arch
    const lead = [], cap = [], NL = 10, top = (yp + 0.6) - (ys + HD);
    const lp = Array.from({ length: NL + 1 }, (_, k) => { const s = k / NL; return [(RD + 0.1) * Math.cos(s * PI / 2), ys + HD + top * Math.sin(s * PI / 2)]; });
    lp[NL][0] = 0.001;
    for (let j = 0; j < NP; j++) { const f0 = j / NP * PI, f1 = (j + 1) / NP * PI; for (let k = 0; k < NL; k++) q4(lead, Pt(f0, lp[k][0], lp[k][1]), Pt(f1, lp[k][0], lp[k][1]), Pt(f1, lp[k + 1][0], lp[k + 1][1]), Pt(f0, lp[k + 1][0], lp[k + 1][1])); }
    for (const f of [0, PI]) for (let k = 0; k < NL; k++) { const a = lp[k], b = lp[k + 1], ia = semiH(Math.min(R, a[0])), ib = semiH(Math.min(R, b[0])); q4(cap, Pt(f, a[0], a[1]), Pt(f, b[0], b[1]), Pt(f, Math.min(R, b[0]), ys + ib), Pt(f, Math.min(R, a[0]), ys + ia)); }
    bag.add(L, dblT(lead)); bag.add(L, dblT(cap));
    // the side arches from the piers to the outer wall, opening on the corner bays
    for (const sx of [-1, 1]) arcadeWall(bag, [cx + sx * (R + 0.75), cz + sz * (R + P)], [cx + sx * (R + 0.75), qzOf(cz, sz, Hi)], [[0, Hi - R - P]], ys - 7.5, ys - 7.5, ys + 0.6, 1.5, S, true);
    // the corner fills between the rim and the bay's rectangle
    const corner = Math.atan2(wb, R), phs = [...Array.from({ length: 49 }, (_, i) => i / 48 * PI), corner, PI - corner].sort((a, b) => a - b);
    fill(bag, ST, cx, czs, phs, (ph) => {
      const c = Math.cos(ph), s = Math.sin(ph), rs = Math.abs(c) > 1e-6 ? R / Math.abs(c) : 1e9, rb = s > 1e-6 ? wb / s : 1e9, rho = Math.min(rs, rb);
      if (rho < R) return [R, ys];
      return [rho, ys - 0.5 * (rho - R)];
    }, R, ys, (ph) => [Math.cos(ph), sz * Math.sin(ph)], 6);
    // the roof over the bay round the semidome: a slab, the rectangle less the drum's circle
    const slab = [], RC = RD + 0.15, XR = R + 1.85, Pz = (ph, rho, yy) => Pt(ph, rho, yy);
    const zw = Hi - R - 0.9, z0w = -0.9;
    const rect = (ph) => { const c = Math.cos(ph), s = Math.sin(ph); const cand = []; if (Math.abs(c) > 1e-6) cand.push(XR / Math.abs(c)); if (s > 1e-6) cand.push(zw / s); if (s < -1e-6) cand.push(z0w / s); return Math.min(...cand); };
    const a0 = Math.atan2(z0w, XR), cs = [a0, Math.atan2(zw, XR), PI - Math.atan2(zw, XR), PI - a0];
    const ps = [...Array.from({ length: 73 }, (_, i) => a0 + (PI - 2 * a0) * i / 72), ...cs].sort((a, b) => a - b);
    for (let i = 0; i + 1 < ps.length; i++) {
      const a = ps[i], b = ps[i + 1], ra = rect(a), rb = rect(b), ia = Math.min(RC, ra), ib = Math.min(RC, rb);
      for (const yy of [ys, ys + 1.2]) q4(slab, Pz(a, ia, yy), Pz(b, ib, yy), Pz(b, rb, yy), Pz(a, ra, yy));
    }
    // the slab's outer edges (the wall's top is level with it) and the strip behind the rim
    bag.add(S, dblT(slab));
    const ring = [];
    for (let j = 0; j < NP; j++) { const f0 = j / NP * PI, f1 = (j + 1) / NP * PI; q4(ring, Pt(f0, R, ys), Pt(f1, R, ys), Pt(f1, RC, ys), Pt(f0, RC, ys)); }
    bag.add(S, dblT(ring));
  }
  // ——— the tympana across: triple arcades on two monoliths, the walls filled with windows above the aisles' roofs ———
  const hc = ys - y - 11.5, uc = 2 * R / 3;
  for (const sx of [-1, 1]) {
    const xm = cx + sx * (R + 1.1), A = [xm, cz - R], B = [xm, cz + R];
    arcadeWall(bag, A, B, [[0, uc - 0.75], [uc + 0.75, 2 * uc - 0.75], [2 * uc + 0.75, 2 * R]], y + hc, y + hc, yp - 0.1, 1.5, S, true);
    for (const u of [uc, 2 * uc]) monolith(bag, col, xm, cz - R + u, y, hc);
    // the windows: two rows and a top light within the arch, above the aisles' roof
    const fi = sx > 0 ? cx + R + 0.35 : cx - R - 0.35, fo = sx > 0 ? cx + R + 1.85 : cx - R - 1.85, d = sx;
    const rows = [[ys + 2.4, ys + 6.2, 5], [ys + 8.0, ys + 11.4, 3], [ys + 12.6, ys + 14.4, 1]];
    for (const [ya, yb, n] of rows) {
      const half = archU(yb + 0.4, R, ys) - 0.6, wdt = Math.min(1.7, (2 * half) / n - 0.9);
      for (let i = 0; i < n; i++) {
        const zc = cz + (n === 1 ? 0 : -half + wdt / 2 + i * (2 * half - wdt) / (n - 1));
        for (const [x0, x1, m] of [[fi - d * 0.03, fi - d * 0.01, 'daylight'], [fo + d * 0.01, fo + d * 0.03, 'opening']]) {
          bag.add(m, box(Math.min(x0, x1), ya, zc - wdt / 2, Math.max(x0, x1), yb, zc + wdt / 2));
          for (let s = 0; s < 3; s++) bag.add(m, box(Math.min(x0, x1), yb + s * 0.16, zc - wdt / 2 + (s + 1) * wdt * 0.15, Math.max(x0, x1), yb + (s + 1) * 0.16, zc + wdt / 2 - (s + 1) * wdt * 0.15));
        }
        bag.add(M, box(Math.min(fi, fi - d * 0.12), ya - 0.2, zc - wdt / 2 - 0.15, Math.max(fi, fi - d * 0.12), ya, zc + wdt / 2 + 0.15));
      }
    }
    // a cornice over the arcade where the gallery would run, in the stone
    bag.add(S, box(Math.min(fi, fi - d * 0.35), y + hc + 3.6, cz - R, Math.max(fi, fi - d * 0.35), y + hc + 4.0, cz + R));
  }
  // ——— the aisles: transverse arches and five domed bays each side; the flat roof round the domes ———
  const XA = R + 1.85, bz = 2 * Hi / 5, rD = Math.min(bz, Hi - XA) / 2 * 0.9;
  for (const sx of [-1, 1]) {
    const xa = cx + sx * XA, xw = cx + sx * Hi, xc = (xa + xw) / 2;
    for (let k = 1; k < 5; k++) {
      const zz = cz - Hi + k * bz, nearPier = Math.abs(Math.abs(zz - cz) - (R + P / 2)) < P / 2 + 0.6, x0 = nearPier ? cx + sx * (R + P) : xa;
      const sp2 = Math.abs(xw - x0), ya = ys - 0.6083 * sp2 - 0.35; arcadeWall(bag, [x0, zz], [xw, zz], [[0, sp2]], ya, ya, ys + 0.6, 1.0, S);
    }
    const t = [], tt = [], band = [];
    for (let k = 0; k < 5; k++) {
      const zc = cz - Hi + (k + 0.5) * bz, hx = Math.abs(xw - xa) / 2, hz = bz / 2;
      // the ceiling and the roof over the bay, each a square less the dome's circle
      const N = 32;
      for (let i = 0; i < N; i++) {
        const a = i / N * PI * 2, b = (i + 1) / N * PI * 2, sq = (th) => { const c = Math.cos(th), s = Math.sin(th); const m = Math.min(hx / Math.max(1e-6, Math.abs(c)), hz / Math.max(1e-6, Math.abs(s))); return [xc + c * m, zc + s * m]; };
        const A0 = sq(a), B0 = sq(b);
        for (const [yy, out] of [[ys, t], [ys + 1.2, tt]]) q4(out, [xc + Math.cos(a) * rD, yy, zc + Math.sin(a) * rD], [xc + Math.cos(b) * rD, yy, zc + Math.sin(b) * rD], [B0[0], yy, B0[1]], [A0[0], yy, A0[1]]);
        q4(band, [xc + Math.cos(a) * rD, ys, zc + Math.sin(a) * rD], [xc + Math.cos(b) * rD, ys, zc + Math.sin(b) * rD], [xc + Math.cos(b) * rD, ys + 1.2, zc + Math.sin(b) * rD], [xc + Math.cos(a) * rD, ys + 1.2, zc + Math.sin(a) * rD]);
      }
      // corners of the square the fan misses (the sq() of the 32 directions cuts them): small triangles
      for (const [ex, ez] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const th = Math.atan2(ez * hz, ex * hx), i0 = Math.floor(((th + 2 * PI) % (2 * PI)) / (2 * PI) * N), a = i0 / N * PI * 2, b = (i0 + 1) / N * PI * 2;
        const sq = (t2) => { const c = Math.cos(t2), s = Math.sin(t2); const m = Math.min(hx / Math.max(1e-6, Math.abs(c)), hz / Math.max(1e-6, Math.abs(s))); return [xc + c * m, zc + s * m]; };
        const A0 = sq(a), B0 = sq(b);
        for (const [yy, out] of [[ys, t], [ys + 1.2, tt]]) out.push(A0[0], yy, A0[1], B0[0], yy, B0[1], xc + ex * hx, yy, zc + ez * hz);
      }
      const shell = []; for (let i = 0; i <= 8; i++) { const a = PI / 2 * i / 8; shell.push([Math.max(0.001, rD * Math.cos(a)), rD * 0.82 * Math.sin(a)]); }
      bag.add(ST, lathe(shell.reverse(), 24, null, xc, ys, zc));
      bag.add('glaze_blue', lathe([[0.001, rD * 0.82 - 0.03], [rD * 0.22, rD * 0.79 - 0.03]], 16, null, xc, ys, zc));
      // outside, on the roof: the drum ring and the lead dome
      bag.add(S, lathe([[rD + 0.25, 0], [rD + 0.25, 0.9], [rD + 0.05, 1.1]], 24, null, xc, ys + 1.2, zc));
      bag.add(L, lathe([[rD + 0.1, 0], [rD * 0.94, rD * 0.3], [rD * 0.78, rD * 0.6], [rD * 0.5, rD * 0.85], [0.001, rD * 0.95]], 24, null, xc, ys + 2.2, zc));
      bag.add('gilt_bronze', lathe([[0.1, 0], [0.05, 0.6], [0.001, 0.75]], 6, null, xc, ys + 2.2 + rD * 0.95, zc));
      if (!(sx > 0 && k === 4)) lampRing(bag, xc, y + 4.6, zc, 2.1, 12, 4, (px, pz) => ys + rD * 0.82 * Math.sqrt(Math.max(0, 1 - (Math.hypot(px - xc, pz - zc) / rD) ** 2)) - 0.05);
    }
    bag.add(S, dblT(t)); bag.add(S, dblT(tt)); bag.add(S, dblT(band));
  }

  // ——— the qibla wall: the mihrab, the tiles and roundels round it, the coloured windows ———
  const mihrab = () => {
    const fz = qz - 0.35;
    // the frame standing out of the wall: jambs, the panel above the niche, the borders and the inscription, the cresting
    for (const [x0, x1, y0, y1] of [[cx - 3.0, cx - 1.2, y, y + 9.0], [cx + 1.2, cx + 3.0, y, y + 9.0], [cx - 1.2, cx + 1.2, y + 5.6, y + 9.0]]) bag.add(M, box(x0, y0, fz, x1, y1, qz));
    for (const [x0, x1, y0, y1] of [[cx - 3.0, cx - 2.84, y + 0.3, y + 9.0], [cx + 2.84, cx + 3.0, y + 0.3, y + 9.0], [cx - 3.0, cx + 3.0, y + 8.84, y + 9.0], [cx - 1.36, cx - 1.2, y + 0.3, y + 5.6], [cx + 1.2, cx + 1.36, y + 0.3, y + 5.6]]) bag.add('marble_dark', box(x0, y0, fz - 0.03, x1, y1, fz));
    bag.add('glaze_blue', box(cx - 2.5, y + 7.3, fz - 0.03, cx + 2.5, y + 8.4, fz));
    for (let i = 0; i < 30; i++) { const u = cx - 2.4 + i * 4.8 / 29, h = i % 4 === 1 ? 0.85 : i % 3 ? 0.55 : 0.3; bag.add('gilt_bronze', box(u - 0.025, y + 7.42, fz - 0.05, u + 0.025, y + 7.42 + h, fz - 0.03)); }
    // the opening's pointed head: spandrels from the arch up to the panel, its soffit, a gilt moulding round it
    const hd = [], K = 12;
    for (let k = 0; k < K; k++) {
      const u0 = -1.2 + 2.4 * k / K, u1 = -1.2 + 2.4 * (k + 1) / K, y0 = archY(u0, 1.2, y + 3.9), y1 = archY(u1, 1.2, y + 3.9);
      for (const zz of [fz, qz]) q4(hd, [cx + u0, y0, zz], [cx + u1, y1, zz], [cx + u1, y + 5.6, zz], [cx + u0, y + 5.6, zz]);
      q4(hd, [cx + u0, y0, fz], [cx + u1, y1, fz], [cx + u1, y1, qz], [cx + u0, y0, qz]);
      bag.add('gilt_bronze', rod([cx + u0, y0 + 0.03, fz - 0.02], [cx + u1, y1 + 0.03, fz - 0.02], 0.04, 3));
    }
    bag.add(M, dblT(hd));
    for (const s of [-1, 1]) bag.add('gilt_bronze', rod([cx + s * 1.2, y + 0.3, fz - 0.02], [cx + s * 1.2, y + 3.93, fz - 0.02], 0.04, 3));
    for (let i = 0; i < 9; i++) { const u = cx - 2.8 + i * 0.7; bag.add(M, lathe([[0.22, 0], [0.26, 0.18], [0.12, 0.45], [0.001, 0.62]], 6, null, u, y + 9.0, qz - 0.18)); }
    // the niche: half an octagon, its walls carved in panels, its hood of muqarnas cells gilded in turn
    const rn = 1.2, oct = (k, r) => [cx + Math.cos(k * PI / 4) * r * (k === 0 || k === 4 ? 1 : 1), qz + Math.sin(k * PI / 4) * r];
    for (let k = 0; k < 4; k++) {
      const a = oct(k, rn), b = oct(k + 1, rn), t = [];
      q4(t, [a[0], y, a[1]], [b[0], y, b[1]], [b[0], y + 3.9, b[1]], [a[0], y + 3.9, a[1]]);
      bag.add(M, dblT(t));
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = [cx - m[0], qz - m[1]], ln = Math.hypot(...n), nn = [n[0] / ln * 0.02, n[1] / ln * 0.02];
      const pnl = []; const lerp = (s, yy) => [a[0] + (b[0] - a[0]) * s + nn[0], yy, a[1] + (b[1] - a[1]) * s + nn[1]];
      q4(pnl, lerp(0.15, y + 0.6), lerp(0.85, y + 0.6), lerp(0.85, y + 3.4), lerp(0.15, y + 3.4));
      bag.add('marble_dark', dblT(pnl));
    }
    bag.add(M, box(cx - 1.25, y - 0.3, qz, cx + 1.25, y + 0.12, qz + 1.25));
    const tiers = 4, hy = (k) => y + 3.9 + k * 0.42;
    for (let k = 0; k < tiers; k++) {
      const r0 = rn * (1 - k * 0.24), r1 = rn * (1 - (k + 1) * 0.24), n = 4 + k * 2, cell = [], cg = [], led = [];
      for (let i = 0; i < n; i++) {
        const a0 = i / n * PI, a1 = (i + 1) / n * PI, am = (a0 + a1) / 2;
        const p0 = [cx + Math.cos(a0) * r0, qz + Math.sin(a0) * r0], p1 = [cx + Math.cos(a1) * r0, qz + Math.sin(a1) * r0], pm = [cx + Math.cos(am) * (r0 + 0.12), qz + Math.sin(am) * (r0 + 0.12)];
        // a concave cell: two faces folded back to its middle line
        const out = (i + k) % 2 ? cg : cell;
        q4(out, [p0[0], hy(k), p0[1]], [pm[0], hy(k), pm[1]], [pm[0], hy(k + 1), pm[1]], [p0[0], hy(k + 1), p0[1]]);
        q4(out, [pm[0], hy(k), pm[1]], [p1[0], hy(k), p1[1]], [p1[0], hy(k + 1), p1[1]], [pm[0], hy(k + 1), pm[1]]);
        out.push(p0[0], hy(k + 1), p0[1], pm[0], hy(k + 1), pm[1], p1[0], hy(k + 1), p1[1]);
        // the soffit from this tier in to the next
        const r1a = [cx + Math.cos(a0) * r1, qz + Math.sin(a0) * r1], r1b = [cx + Math.cos(a1) * r1, qz + Math.sin(a1) * r1];
        q4(led, [p0[0], hy(k + 1), p0[1]], [p1[0], hy(k + 1), p1[1]], [r1b[0], hy(k + 1), r1b[1]], [r1a[0], hy(k + 1), r1a[1]]);
      }
      bag.add(M, dblT(cell)); bag.add('gilt_bronze', dblT(cg)); bag.add(M, dblT(led));
    }
    // the back of the hood up to the panel, filled between the niche's half octagon and the cut
    const cap = []; const rt = rn * (1 - tiers * 0.24);
    for (let i = 0; i < 8; i++) { const a0 = i / 8 * PI, a1 = (i + 1) / 8 * PI; cap.push(cx, hy(tiers), qz, cx + Math.cos(a0) * rt, hy(tiers), qz + Math.sin(a0) * rt, cx + Math.cos(a1) * rt, hy(tiers), qz + Math.sin(a1) * rt); }
    bag.add('gilt_bronze', dblT(cap));
    bag.add(S, box(cx - 1.25, hy(tiers), qz, cx + 1.25, y + 5.6, qz + 1.25));
    // the corners behind the octagon below the hood, capped
    const cc = []; for (let k = 0; k < 4; k++) { const a = oct(k, rn), b = oct(k + 1, rn); const ca = [k < 2 ? cx + 1.2 : cx - 1.2, qz + 1.2]; cc.push(a[0], y + 3.9, a[1], b[0], y + 3.9, b[1], ca[0], y + 3.9, ca[1]); }
    bag.add(M, dblT(cc));
    // the two great candlesticks of the mihrab
    for (const s of [-1, 1]) {
      const x = cx + s * 2.1, z = qz - 1.2;
      bag.add('bronze', lathe([[0.001, 0], [0.42, 0], [0.4, 0.12], [0.18, 0.4], [0.2, 0.7], [0.08, 0.9], [0.1, 1.6], [0.16, 1.7], [0.07, 1.8], [0.08, 2.3], [0.22, 2.36], [0.22, 2.42], [0.001, 2.42]], 12, null, x, y + 0.05, z));
      bag.add('glaze_white', lathe([[0.1, 0], [0.1, 0.7], [0.001, 0.72]], 10, null, x, y + 2.47, z));
      col.circle(x, z, 0.4, y, y + 2.4);
    }
  };
  mihrab();
  // the Iznik tiles flanking the mihrab: panels framed in lapis, a band of script over them; the roundels above
  for (const s of [-1, 1]) {
    const x0 = cx + s * 3.0, x1 = cx + s * 9.6, lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    bag.add('tile_iznik', box(lo, y + 0.9, qz - 0.03, hi, y + 6.6, qz));
    for (const [a, b, c, d] of [[lo, hi, y + 0.75, y + 0.9], [lo, hi, y + 6.6, y + 6.75], [s > 0 ? hi - 0.15 : lo, s > 0 ? hi : lo + 0.15, y + 0.75, y + 6.75]]) bag.add('tile_lapis', box(a, c, qz - 0.045, b, d, qz));
    bag.add('glaze_blue', box(lo, y + 6.75, qz - 0.04, hi, y + 7.55, qz));
    for (let i = 0; i < 40; i++) { const u = lo + 0.15 + i * (hi - lo - 0.3) / 39, h = i % 5 === 2 ? 0.62 : i % 3 ? 0.42 : 0.22; bag.add('glaze_white', box(u - 0.025, y + 6.85, qz - 0.055, u + 0.025, y + 6.85 + h, qz - 0.04)); }
    bag.add(M, box(lo, y, qz - 0.05, hi, y + 0.75, qz));
    const rx = cx + s * 6.3, ry = y + 9.6;
    discZ(bag, 'glaze_blue', rx, ry, qz - 0.04, 1.45);
    discZ(bag, 'gilt_bronze', rx, ry, qz - 0.02, 1.6);
    for (let i = 0; i < 11; i++) { const u = -1.1 + i * 0.22, h = Math.sqrt(1 - (u / 1.45) ** 2) * (i % 3 === 1 ? 1.1 : 0.7); bag.add('glaze_white', box(rx + u - 0.03, ry - h * 0.6, qz - 0.06, rx + u + 0.03, ry + h * 0.7, qz - 0.04)); }
    bag.add('glaze_white', box(rx - 1.0, ry - 0.42, qz - 0.06, rx + 1.0, ry - 0.36, qz - 0.04));
  }
  // the windows of coloured glass in plaster tracery: two rows over the mihrab
  const glass = (xc, ya, yb, w) => {
    const z0 = qz - 0.02, steps = 4;
    bag.add('stained_glass', box(xc - w / 2, ya, z0, xc + w / 2, yb, qz - 0.01));
    for (let s = 0; s < steps; s++) bag.add('stained_glass', box(xc - w / 2 + (s + 1) * w * 0.11, yb + s * 0.22, z0, xc + w / 2 - (s + 1) * w * 0.11, yb + (s + 1) * 0.22, qz - 0.01));
    bag.add('opening', box(xc - w / 2, ya, qz + T + 0.01, xc + w / 2, yb + steps * 0.22, qz + T + 0.03));
    // the tracery: a lattice of plaster bars in lozenges, the frame
    const n = Math.round((yb - ya) / 0.3) + 4, mid = (ya + yb) / 2;
    for (let i = -n; i <= n; i++) for (const sg of [1, -1]) {
      const pts = [];
      for (let k = 0; k <= 40; k++) { const u = -w / 2 + w * k / 40, yy = mid + sg * u * 1.2 + i * 0.3; if (yy > ya + 0.04 && yy < yb - 0.04) pts.push([u, yy]); }
      if (pts.length > 1) bag.add(ST, rod([xc + pts[0][0], pts[0][1], z0 - 0.02], [xc + pts[pts.length - 1][0], pts[pts.length - 1][1], z0 - 0.02], 0.022, 3));
    }
    bag.add(ST, box(xc - w / 2, yb - 0.03, z0 - 0.04, xc + w / 2, yb + 0.03, qz));
    for (const [a, b, c, d] of [[xc - w / 2 - 0.12, xc - w / 2, ya - 0.12, yb], [xc + w / 2, xc + w / 2 + 0.12, ya - 0.12, yb], [xc - w / 2 - 0.12, xc + w / 2 + 0.12, ya - 0.12, ya]]) bag.add(ST, box(a, c, z0 - 0.05, b, d, qz));
  };
  for (const u of [-10.6, -6.6, -2.6, 2.6, 6.6, 10.6]) glass(cx + u, y + 12.2, y + 15.2, 1.5);
  for (const u of [-8.8, -4.4, 0, 4.4, 8.8]) glass(cx + u, y + 16.4, y + 19.0, 1.4);
  // the lower windows of the qibla wall beyond the tiles, with their grilles
  for (const u of [-23.5, -19.5, -15.5, -11.8, 11.8, 15.5, 19.5, 23.5]) {
    const x = cx + u;
    bag.add('daylight', box(x - 0.8, y + 1.0, qz - 0.02, x + 0.8, y + 3.6, qz + 0.02));
    bag.add('opening', box(x - 0.8, y + 1.0, qz + T - 0.02, x + 0.8, y + 3.6, qz + T + 0.06));
    for (let g = 1; g < 6; g++) bag.add('iron', box(x - 0.8 + g * 0.267 - 0.02, y + 1.0, qz - 0.07, x - 0.8 + g * 0.267 + 0.02, y + 3.6, qz - 0.03));
    bag.add(M, box(x - 1.0, y + 3.6, qz - 0.12, x + 1.0, y + 3.85, qz)); bag.add(M, box(x - 1.0, y + 0.8, qz - 0.14, x + 1.0, y + 1.0, qz));
  }

  for (const u of [-23.5, -19.5, -15.5, 15.5, 19.5, 23.5]) { const x = cx + u; bag.add('daylight', box(x - 0.8, y + 12.2, qz - 0.02, x + 0.8, y + 14.8, qz + 0.02)); bag.add('opening', box(x - 0.8, y + 12.2, qz + T - 0.02, x + 0.8, y + 14.8, qz + T + 0.06)); bag.add(M, box(x - 1.0, y + 12.0, qz - 0.12, x + 1.0, y + 12.2, qz)); }
  // ——— the minbar, to the right of the mihrab: gate, stair between pierced side plates, the kiosk and its cone ———
  {
    const qm = qz - 0.06, x0 = cx - 5.3, x1 = cx - 3.9, zb = qz - 8.6, zg = zb + 1.0, zk = qz - 1.7, yk = y + 4.2, n = 14;
    const plate = (xa, xb, pts) => { const t = []; for (let i = 1; i + 1 < pts.length; i++) for (const xx of [xa, xb]) t.push(xx, pts[0][1], pts[0][0], xx, pts[i][1], pts[i][0], xx, pts[i + 1][1], pts[i + 1][0]); for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; q4(t, [xa, a[1], a[0]], [xa, b[1], b[0]], [xb, b[1], b[0]], [xb, a[1], a[0]]); } bag.add(M, dblT(t)); };
    const stairY = (z) => y + (yk - y) * Math.max(0, Math.min(1, (z - zg) / (zk - zg)));
    for (const [xa, xb, o] of [[x0, x0 + 0.14, -1], [x1 - 0.14, x1, 1]]) {
      plate(xa, xb, [[zg, y], [qm, y], [qm, yk + 1.05], [zk, yk + 1.05], [zg, y + 1.05]]);
      // the lattice on the triangle under the stair: lozenges of bars
      const xx = o < 0 ? xa - 0.012 : xb + 0.012;
      const inside = (z, yy) => z > zg + 0.35 && z < zk - 0.1 && yy > y + 0.5 && yy < stairY(z) - 0.35;
      for (let c = -12; c < 30; c++) for (const sg of [1, -1]) {
        let a = null, b = null;
        for (let k = 0; k <= 80; k++) { const z = zg + (zk - zg) * k / 80, yy = y + 0.5 + sg * (z - zg) * 0.9 + c * 0.32 * (sg > 0 ? -1 : 1) + (sg < 0 ? 0 : 0); if (inside(z, yy)) { if (!a) a = [z, yy]; b = [z, yy]; } }
        if (a && b && Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.1) bag.add('marble_dark', rod([xx, a[1], a[0]], [xx, b[1], b[0]], 0.025, 3));
      }
      // the frame of the triangle and the handrail's moulding
      bag.add(M, rod([xx, y + 0.45, zg + 0.3], [xx, y + 0.45, zk - 0.05], 0.05, 4)); bag.add(M, rod([xx, y + 0.45, zg + 0.3], [xx, stairY(zk) - 0.3, zk - 0.05], 0.05, 4));
      bag.add(M, rod([xx, y + 1.05, zg], [xx, yk + 1.05, zk], 0.06, 4));
    }
    for (let i = 0; i < n; i++) { const za = zg + (zk - zg) * i / n, zz = zg + (zk - zg) * (i + 1) / n; bag.add(M, box(x0 + 0.14, y, za, x1 - 0.14, y + (yk - y) * (i + 1) / n, zz)); }
    bag.add('cloth_green', box(x0 + 0.3, y + 0.02, zg - 0.6, x1 - 0.3, y + 0.03, zg));
    bag.add(M, box(x0 + 0.14, y, zk, x1 - 0.14, yk, qm));
    bag.add('opening', box(x0 - 0.01, y + 0.3, zk + 0.25, x0 + 0.005, y + 2.6, qz - 0.3));
    // the gate: posts, a lintel with an inscription, the crown of palmettes
    for (const [xa, xb] of [[x0 - 0.1, x0 + 0.18], [x1 - 0.18, x1 + 0.1]]) bag.add(M, box(xa, y, zb, xb, y + 3.6, zg));
    bag.add(M, box(x0 - 0.1, y + 2.7, zb, x1 + 0.1, y + 3.6, zg));
    bag.add('glaze_blue', box(x0 + 0.1, y + 2.85, zb - 0.02, x1 - 0.1, y + 3.4, zb));
    for (let i = 0; i < 8; i++) bag.add('gilt_bronze', box(x0 + 0.2 + i * 0.14, y + 2.92, zb - 0.035, x0 + 0.23 + i * 0.14, y + 2.92 + (i % 3 ? 0.36 : 0.2), zb - 0.02));
    for (let i = 0; i < 5; i++) bag.add(M, lathe([[0.1, 0], [0.13, 0.12], [0.05, 0.3], [0.001, 0.42]], 6, null, x0 + 0.05 + i * 0.325, y + 3.6, (zb + zg) / 2));
    // the kiosk on four colonnettes, arches between them, the tall octagonal cone and the gilt finial
    const k0 = [x0 + 0.1, zk + 0.05, x1 - 0.1, qz - 0.25];
    for (const [xx, zz] of [[k0[0], k0[1]], [k0[2], k0[1]], [k0[0], k0[3]], [k0[2], k0[3]]]) bag.add(M, lathe([[0.08, 0], [0.07, 2.0], [0.12, 2.1], [0.12, 2.2]], 8, null, xx, yk, zz));
    for (const [A, B] of [[[k0[0], k0[1]], [k0[2], k0[1]]], [[k0[0], k0[3]], [k0[2], k0[3]]], [[k0[0], k0[1]], [k0[0], k0[3]]], [[k0[2], k0[1]], [k0[2], k0[3]]]]) arcadeWall(bag, A, B, [[0.12, Math.hypot(B[0] - A[0], B[1] - A[1]) - 0.12]], yk + 1.6, yk + 1.6, yk + 2.7, 0.12, M);
    const kc = [(k0[0] + k0[2]) / 2, (k0[1] + k0[3]) / 2];
    bag.add(M, box(k0[0] - 0.12, yk + 2.7, k0[1] - 0.12, k0[2] + 0.12, yk + 2.9, k0[3] + 0.12));
    bag.add(M, place(lathe([[1.0, 0], [0.82, 0.6], [0.001, 3.0]], 8), kc[0], yk + 2.9, kc[1], PI / 8));
    for (const [rr2, yy] of [[0.12, 0], [0.18, 0.25], [0.12, 0.55]]) bag.add('gilt_bronze', lathe([[0.03, 0], [rr2, 0.1], [0.03, 0.2]], 8, null, kc[0], yk + 5.9 + yy, kc[1]));
    bag.add('gilt_bronze', rod([kc[0], yk + 5.85, kc[1]], [kc[0], yk + 6.9, kc[1]], 0.025, 4));
    col.rect([x0 - 0.1, zb, x1 + 0.1, qm], y, y + 4);
  }
  // ——— the sultan's loge, left of the mihrab: a marble platform on porphyry columns, its pierced parapet, the door to it ———
  {
    const lx0 = cx + R + P + 0.15, lx1 = cx + Hi, lz0 = cz + R + P + 1.2, lz1 = qz, yl = y + 3.4;
    bag.add(M, box(lx0, yl - 0.45, lz0, lx1, yl, lz1));
    bag.add(M, box(lx0 - 0.08, yl - 0.6, lz0 - 0.08, lx1, yl - 0.45, lz1));
    bag.add('cloth_red', box(lx0 + 0.3, yl, lz0 + 0.3, lx1 - 0.2, yl + 0.02, lz1 - 0.2));
    for (const [xx, zz] of [[lx0 + 0.35, lz0 + 0.35], [lx0 + 0.35, (lz0 + lz1) / 2], [(lx0 + lx1) / 2, lz0 + 0.35], [lx1 - 0.6, lz0 + 0.35], [lx0 + 0.35, lz1 - 0.6]]) colonnette(bag, col, xx, zz, y, 2.8, 'porphyry');
    // the parapet: marble panels between posts, each with a carved lozenge, a gilt rail
    const par = (A, B) => {
      const Lp = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(1, Math.round(Lp / 0.9)), ux = (B[0] - A[0]) / Lp, uz = (B[1] - A[1]) / Lp;
      for (let i = 0; i < n; i++) {
        const a = [A[0] + ux * Lp * i / n, A[1] + uz * Lp * i / n], b = [A[0] + ux * Lp * (i + 1) / n, A[1] + uz * Lp * (i + 1) / n];
        bag.add(M, box(Math.min(a[0], b[0]) - 0.04, yl, Math.min(a[1], b[1]) - 0.04, Math.max(a[0], b[0]) + 0.04, yl + 0.95, Math.max(a[1], b[1]) + 0.04));
        const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        for (const o of [-0.06, 0.06]) bag.add('marble_dark', place(box(-0.2, -0.2, -0.012, 0.2, 0.2, 0.012), m[0] - uz * o, yl + 0.5, m[1] + ux * o, Math.atan2(uz, ux)).rotateY(0));
        bag.add(M, box(a[0] - 0.08, yl, a[1] - 0.08, a[0] + 0.08, yl + 1.12, a[1] + 0.08));
      }
      bag.add('gilt_bronze', box(Math.min(A[0], B[0]) - 0.07, yl + 0.95, Math.min(A[1], B[1]) - 0.07, Math.max(A[0], B[0]) + 0.07, yl + 1.02, Math.max(A[1], B[1]) + 0.07));
    };
    par([lx0 + 0.06, lz0 + 0.06], [lx1, lz0 + 0.06]); par([lx0 + 0.06, lz0 + 0.06], [lx0 + 0.06, lz1]);
    // the door from the outside onto the loge, its leaves carved in rosettes
    const dz = (lz0 + lz1) / 2;
    bag.add('opening', box(lx1 - 0.03, yl, dz - 0.8, lx1 + 0.02, yl + 2.6, dz + 0.8));
    bag.add(M, box(lx1 - 0.15, yl, dz - 1.05, lx1, yl + 2.85, dz - 0.8)); bag.add(M, box(lx1 - 0.15, yl, dz + 0.8, lx1, yl + 2.85, dz + 1.05)); bag.add(M, box(lx1 - 0.15, yl + 2.6, dz - 0.8, lx1, yl + 2.85, dz + 0.8));
    for (const s of [-1, 1]) { bag.add('wood_dark', box(lx1 - 0.9, yl, dz + s * 0.8 - (s > 0 ? 0.06 : 0), lx1 - 0.03, yl + 2.55, dz + s * 0.8 + (s < 0 ? 0.06 : 0))); for (let r = 0; r < 3; r++) bag.add('gilt_bronze', lathe([[0.12, 0], [0.001, 0.02]], 8, null, lx1 - 0.47, yl + 0.6 + r * 0.7, dz + s * 0.8 - s * 0.035).rotateX(0)); }
  }
  // ——— the muezzins' platform at the far end, on marble columns, by the north-west pier ———
  {
    const mx0 = cx - R - 4.6, mx1 = cx - R - 0.4, mz0 = cz - R + 0.1, mz1 = cz - R + 3.3, ym = y + 2.5;
    bag.add(M, box(mx0, ym - 0.4, mz0, mx1, ym, mz1));
    bag.add('cloth_red', box(mx0 + 0.2, ym, mz0 + 0.15, mx1 - 0.2, ym + 0.02, mz1 - 0.2));
    for (const xx of [mx0 + 0.3, mx1 - 0.3]) colonnette(bag, col, xx, mz1 - 0.3, y, ym - y - 0.4, M);
    for (const [a, b, c, d] of [[mx0, mx1, mz1 - 0.1, mz1], [mx0, mx0 + 0.1, mz0, mz1], [mx1 - 0.1, mx1, mz0, mz1]]) bag.add(M, box(a, ym, c, b, ym + 0.9, d));
    for (let i = 0; i < 6; i++) bag.add('marble_dark', place(box(-0.18, -0.18, -0.012, 0.18, 0.18, 0.012), mx0 + 0.4 + i * (mx1 - mx0 - 0.8) / 5, ym + 0.45, mz1 + 0.01, PI / 4).rotateY(0));
    bag.add('gilt_bronze', box(mx0 - 0.03, ym + 0.9, mz1 - 0.13, mx1 + 0.03, ym + 0.96, mz1 + 0.03));
    // its stair against the pier
    for (let i = 0; i < 8; i++) bag.add(M, box(mx1 + (7 - i) * 0.3, y, mz0 + 0.1, mx1 + (8 - i) * 0.3, y + (ym - y) * (i + 1) / 9, mz0 + 1.0));
    col.rect([mx1, mz0 + 0.1, mx1 + 2.4, mz0 + 1.0], y, y + 1.2);
  }
  // ——— the kürsü of walnut by the pier nearest the loge: a high seat with its steps, inlaid ———
  {
    const kx = cx + R - 1.7, kz = cz + R - 1.9;
    bag.add('wood_dark', box(kx - 0.75, y, kz - 0.75, kx + 0.75, y + 1.5, kz + 0.75));
    bag.add('wood_dark', box(kx - 0.75, y + 1.5, kz + 0.45, kx + 0.75, y + 2.7, kz + 0.75));
    for (const s of [-1, 1]) bag.add('wood_dark', box(kx + s * 0.75 - (s > 0 ? 0.1 : 0), y + 1.5, kz - 0.75, kx + s * 0.75 + (s < 0 ? 0.1 : 0), y + 2.1, kz + 0.45));
    for (let i = 0; i < 4; i++) bag.add('wood_dark', box(kx - 0.5, y, kz - 0.75 - (4 - i) * 0.3, kx + 0.5, y + (i + 1) * 0.3, kz - 0.75 - (3 - i) * 0.3));
    for (const s of [-1, 1]) for (let r = 0; r < 3; r++) bag.add('ivory', box(kx + s * 0.755 - 0.005, y + 0.3 + r * 0.4, kz - 0.4, kx + s * 0.755 + 0.005, y + 0.5 + r * 0.4, kz + 0.4));
    bag.add('cloth_green', box(kx - 0.6, y + 1.5, kz - 0.6, kx + 0.6, y + 1.62, kz + 0.42));
    col.rect([kx - 0.75, kz - 2.0, kx + 0.75, kz + 0.75], y, y + 2.7);
  }
  // ——— the lamps: the great ring low over the centre, a ring in each semidome bay; gilt balls among them ———
  const ly = y + 4.2;
  bag.add('iron', lathe([[R * 0.72 + 0.04, 0], [R * 0.72 + 0.04, 0.1], [R * 0.72 - 0.04, 0.1], [R * 0.72 - 0.04, 0]], 64, null, cx, ly, cz));
  for (let k = 0; k < 64; k++) { const a = k / 64 * PI * 2, px = cx + Math.cos(a) * R * 0.72, pz = cz + Math.sin(a) * R * 0.72; bag.add('lamp_glass', lathe([[0.001, 0], [0.09, 0.03], [0.11, 0.14], [0.07, 0.24], [0.08, 0.3], [0.001, 0.3]], 6, null, px, ly - 0.3, pz)); }
  lampRing(bag, cx, ly + 0.3, cz, R * 0.42, 32, 0, () => 0);
  for (let k = 0; k < 8; k++) { const a = k / 8 * PI * 2; bag.add('iron', rod([cx + Math.cos(a) * R * 0.42, ly + 0.36, cz + Math.sin(a) * R * 0.42], [cx + Math.cos(a) * R * 0.72, ly + 0.1, cz + Math.sin(a) * R * 0.72], 0.015, 3)); }
  for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * PI * 2; bag.add('iron', rod([cx + Math.cos(a) * R * 0.72, ly + 0.1, cz + Math.sin(a) * R * 0.72], [cx + Math.cos(a) * (R - 0.03), yp - 0.05, cz + Math.sin(a) * (R - 0.03)], 0.016, 3)); }
  for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * PI * 2 + PI / 64, rr2 = R * (k % 2 ? 0.42 : 0.72), yb = k % 2 ? ly + 0.3 : ly; bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.04], [0.16, 0.16], [0.12, 0.28], [0.001, 0.32]], 8, null, cx + Math.cos(a) * rr2, yb - 0.95, cz + Math.sin(a) * rr2)); bag.add('iron', rod([cx + Math.cos(a) * rr2, yb - 0.64, cz + Math.sin(a) * rr2], [cx + Math.cos(a) * rr2, yb + 0.02, cz + Math.sin(a) * rr2], 0.008, 3)); }
  for (const sz of [-1, 1]) { const czs = cz + sz * (R + 0.9), zc = czs + sz * 6.5; lampRing(bag, cx, y + 4.6, zc, 3.0, 20, 6, (px, pz) => ys + semiH(Math.hypot(px - cx, pz - czs)) - 0.1); }

  // ——— the carpets: the field, the rows of prayer places toward the qibla ———
  const cr = [cx - Hi + 0.6, cz - Hi + 0.6, cx + Hi - 0.6, qz - 0.6];
  bag.add('cloth_red', box(cr[0], y + 0.05, cr[1], cr[2], y + 0.07, cr[3]));
  for (let z = cr[1] + 0.9; z < cr[3] - 1.2; z += 1.25) {
    bag.add('cloth_ochre', box(cr[0] + 0.3, y + 0.07, z, cr[2] - 0.3, y + 0.078, z + 0.1));
    for (let x = cr[0] + 0.7; x < cr[2] - 0.5; x += 1.05) bag.add('cloth_indigo', box(x - 0.3, y + 0.07, z + 0.75, x + 0.3, y + 0.076, z + 0.98));
  }
}
const qzOf = (cz, sz, Hi) => cz + sz * Hi;
