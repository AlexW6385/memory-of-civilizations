// The garden front of Versailles (Le Vau, then Hardouin-Mansart, 1678–89; docs/settlements/versailles.md §1a):
// three storeys of pale stone — the ground floor rusticated in courses, with arched windows and carved keystones;
// the piano nobile with tall arched windows between Ionic pilasters; the attic with square windows between short
// pilasters; the avant-corps advanced a little, with detached Ionic columns carrying statues before the attic;
// the entablature; the balustrade hiding the roof, set with trophies and vases. Each window is glazed in small
// panes in white-painted frames, set back in its reveal.
//
// gardenFront(ctx, face, rect, y, h): builds the front on one face ('w' | 'e' | 'n' | 's') of a range's block.

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall } from '../byzantine/index.js';

const S = 'sandstone_dressed', GL = 'glass_outer', FR = 'paint_white';

function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}

export function gardenFront(ctx, f, rect, y, h) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = rect;
  // the face's frame: origin, the direction along it, the outward normal
  const F = { w: { o: [x0, z0], u: [0, 1], n: [-1, 0], L: z1 - z0 }, e: { o: [x1, z0], u: [0, 1], n: [1, 0], L: z1 - z0 }, n: { o: [x0, z0], u: [1, 0], n: [0, -1], L: x1 - x0 }, s: { o: [x0, z1], u: [1, 0], n: [0, 1], L: x1 - x0 } }[f];
  const { o, u, n, L } = F;
  const W = (uu, d) => [o[0] + u[0] * uu + n[0] * d, o[1] + u[1] * uu + n[1] * d];
  /** An axis-aligned block in the face's frame: u0…u1 along, v0…v1 up (absolute y), d0…d1 out from the face. */
  const B = (mat, u0, u1, v0, v1, d0, d1) => { const a = W(u0, d0), b = W(u1, d1); bag.add(mat, box(Math.min(a[0], b[0]), v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), v1, Math.max(a[1], b[1]))); };
  const lat = (mat, prof, uu, d, v, seg = 10) => { const p = W(uu, d); bag.add(mat, lathe(prof, seg, null, p[0], v, p[1])); };
  const wallSlab = (d0, d1, u0, u1, y0, y1, arches, holes) => { const c = W(0, (d0 + d1) / 2); bag.add(S, planarWall({ o: c, u, th: d1 - d0, u0, u1, y0, y1, arches, holes })); };

  const nb = Math.max(3, Math.round(L / 4.4)), bw = L / nb, uc = (i) => (i + 0.5) * bw;
  const G = y + 0.36 * h, E = y + 0.78 * h, A = y + 0.86 * h, T = y + h;          // storeys: ground, entablature, attic, top
  const mid = Math.floor(nb / 2), avant = new Set();
  if (nb >= 15) { for (let i = mid - 2; i <= mid + 2; i++) avant.add(i); for (const i of [0, 1, 2, nb - 3, nb - 2, nb - 1]) avant.add(i); }
  const P = 0.55, TH = 0.6;                                                       // the avant-corps' projection, the wall's skin
  const gW = { r: 1.0, sill: y + 0.8, spring: G - 1.75 }, pW = { r: 1.1, sill: G + 0.55, spring: E - 1.7 }, aW = { w: 0.8, y0: A + 0.55, y1: T - 0.6 };
  const archesFor = (list) => list.map((i) => [{ uc: uc(i), r: gW.r, spring: gW.spring, sill: gW.sill }, { uc: uc(i), r: pW.r, spring: pW.spring, sill: pW.sill }]).flat();
  const holesFor = (list) => list.map((i) => ({ u0: uc(i) - aW.w, u1: uc(i) + aW.w, y0: aW.y0, y1: aW.y1 }));
  const all = Array.from({ length: nb }, (_, i) => i);
  // the skin of the wall with its openings, and over the avant-corps a second layer standing forward
  wallSlab(0, TH, 0, L, y - 0.3, T, archesFor(all), holesFor(all));
  const groups = []; for (const i of all) if (avant.has(i)) { if (groups.length && groups.at(-1)[1] === i - 1) groups.at(-1)[1] = i; else groups.push([i, i]); }
  for (const [a, b] of groups) wallSlab(TH - 0.01, TH + P, a * bw, (b + 1) * bw, y - 0.3, T, archesFor(Array.from({ length: b - a + 1 }, (_, k) => a + k)), holesFor(Array.from({ length: b - a + 1 }, (_, k) => a + k)));
  const dAt = (i) => TH + (avant.has(i) ? P : 0);
  { const a = W(0, 0), b = W(L, TH + P + 1.2); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, T); }

  for (const i of all) {
    const d = dAt(i), c = uc(i), u0 = i * bw, u1 = (i + 1) * bw;
    // the rustication of the ground floor: courses of 0.55 m parted by deep channels
    for (let v = y + 0.55; v < G - 0.3; v += 0.55) {
      const hw = v > gW.spring ? Math.sqrt(Math.max(0, gW.r * gW.r - (v - gW.spring) ** 2)) : gW.r;
      if (v < gW.sill || v > gW.spring + gW.r) B(S, u0, u1, v - 0.06, v + 0.06, d - 0.01, d + 0.05);
      else { B(S, u0, c - hw - 0.25, v - 0.06, v + 0.06, d - 0.01, d + 0.05); B(S, c + hw + 0.25, u1, v - 0.06, v + 0.06, d - 0.01, d + 0.05); }
    }
    // windows: glass in its reveal, the frames and glazing bars; the keystones carved as masks; a balcony rail to the long windows
    for (const [w, sill, spring, key] of [[gW.r, gW.sill, gW.spring, 'mask'], [pW.r, pW.sill, pW.spring, 'key']]) {
      const g = W(0, 0.14);
      bag.add(GL, planarWall({ o: g, u, th: 0.03, u0: c - w, u1: c + w, y0: sill, y1: spring + w, outline: { uc: c, r: w, spring } }));
      B(FR, c - 0.05, c + 0.05, sill, spring + w - 0.02, 0.16, 0.22);
      for (let v = sill + 0.62; v < spring + w - 0.1; v += 0.62) { const hw = v > spring ? Math.sqrt(Math.max(0, w * w - (v - spring) ** 2)) : w; B(FR, c - hw + 0.02, c + hw - 0.02, v - 0.03, v + 0.03, 0.16, 0.22); }
      for (const s of [-0.5, 0.5]) B(FR, c + s * w - 0.03, c + s * w + 0.03, sill, spring + Math.sqrt(w * w - (s * w) ** 2) - 0.02, 0.16, 0.22);
      // the architrave round the arch, the keystone
      const ar = []; const N = 14;
      for (let k = 0; k < N; k++) {
        const a0 = Math.PI * k / N, a1 = Math.PI * (k + 1) / N, R0 = w, R1 = w + 0.22;
        const Q = (r, t, dd) => { const p = W(c + r * Math.cos(t), dd); return [p[0], spring + r * Math.sin(t), p[1]]; };
        hexa(ar, [Q(R0, a0, d - 0.02), Q(R1, a0, d - 0.02), Q(R1, a1, d - 0.02), Q(R0, a1, d - 0.02)], [Q(R0, a0, d + 0.1), Q(R1, a0, d + 0.1), Q(R1, a1, d + 0.1), Q(R0, a1, d + 0.1)]);
      }
      bag.add(S, fromTriangles(ar));
      B(S, c - 0.24, c + 0.24, spring + w - 0.1, spring + w + 0.45, d - 0.02, d + 0.2);
      if (key === 'mask') lat(S, [[0.001, 0], [0.13, 0.04], [0.15, 0.2], [0.1, 0.32], [0.001, 0.36]], c, d + 0.2, spring + w - 0.05, 8);
      B(S, c - w - 0.3, c + w + 0.3, sill - 0.18, sill, d - 0.02, d + 0.16);
    }
    // the piano nobile's balcony rail of iron
    const rail = [];
    for (let k = 0; k <= 10; k++) { const uu = c - pW.r + k * 2 * pW.r / 10, p = W(uu, d + 0.08); rail.push(...box(p[0] - 0.012, pW.sill, p[1] - 0.012, p[0] + 0.012, pW.sill + 0.9, p[1] + 0.012).attributes.position.array); }
    { const a = W(c - pW.r, d + 0.05), b = W(c + pW.r, d + 0.11); rail.push(...box(Math.min(a[0], b[0]), pW.sill + 0.86, Math.min(a[1], b[1]), Math.max(a[0], b[0]), pW.sill + 0.92, Math.max(a[1], b[1])).attributes.position.array); }
    bag.add('iron', fromTriangles(rail));
    // the attic window: glass, frame, its moulded surround
    { const g = W(0, 0.14), a = W(c - aW.w, 0.13), b = W(c + aW.w, 0.16); bag.add(GL, box(Math.min(a[0], b[0]), aW.y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), aW.y1, Math.max(a[1], b[1]))); void g;
      B(FR, c - 0.04, c + 0.04, aW.y0, aW.y1, 0.16, 0.22); B(FR, c - aW.w, c + aW.w, (aW.y0 + aW.y1) / 2 - 0.03, (aW.y0 + aW.y1) / 2 + 0.03, 0.16, 0.22);
      B(S, c - aW.w - 0.18, c - aW.w, aW.y0 - 0.18, aW.y1 + 0.18, d - 0.02, d + 0.1); B(S, c + aW.w, c + aW.w + 0.18, aW.y0 - 0.18, aW.y1 + 0.18, d - 0.02, d + 0.1);
      B(S, c - aW.w, c + aW.w, aW.y1, aW.y1 + 0.18, d - 0.02, d + 0.1); B(S, c - aW.w - 0.25, c + aW.w + 0.25, aW.y0 - 0.25, aW.y0 - 0.05, d - 0.02, d + 0.18); }
  }
  // the band courses: the ground floor's cornice, the entablature, the attic's cornice; each breaking forward over the avant-corps
  for (const i of all) {
    const d = dAt(i), u0 = i * bw - (avant.has(i) && !avant.has(i - 1) ? 0.4 : 0), u1 = (i + 1) * bw + (avant.has(i) && !avant.has(i + 1) ? 0.4 : 0);
    B(S, u0, u1, G - 0.3, G, d - 0.02, d + 0.35); B(S, u0, u1, G, G + 0.22, d - 0.02, d + 0.15);
    B(S, u0, u1, E, E + 0.55, d - 0.02, d + 0.2); B(S, u0, u1, E + 0.55, E + 1.05, d - 0.02, d + 0.15); B(S, u0, u1, E + 1.05, A, d - 0.02, d + 0.75);
    B(S, u0, u1, T - 0.35, T, d - 0.02, d + 0.55);
  }
  // pilasters between the bays: Ionic on the piano nobile, plain in the attic
  for (let i = 0; i <= nb; i++) {
    const uu = i * bw, d = Math.max(dAt(Math.min(i, nb - 1)), dAt(Math.max(0, i - 1)));
    B(S, uu - 0.38, uu + 0.38, G + 0.22, G + 0.55, d - 0.02, d + 0.3);
    B(S, uu - 0.34, uu + 0.34, G + 0.55, E - 0.5, d - 0.02, d + 0.22);
    B(S, uu - 0.42, uu + 0.42, E - 0.5, E - 0.38, d - 0.02, d + 0.3);
    for (const s of [-1, 1]) { const p = W(uu + s * 0.3, d + 0.26), g = lathe([[0.12, 0], [0.12, 0.12], [0.001, 0.12]], 10); g.rotateX(Math.PI / 2); g.rotateY(Math.atan2(n[0], n[1])); g.translate(p[0], E - 0.25, p[1]); bag.add(S, g); }
    B(S, uu - 0.4, uu + 0.4, E - 0.12, E, d - 0.02, d + 0.32);
    B(S, uu - 0.3, uu + 0.3, A, T - 0.35, d - 0.02, d + 0.14);
  }
  // the avant-corps' detached columns on their pedestals, the entablature broken forward over them, a statue above each
  for (const [a, b] of groups) for (let i = a; i <= b + 1; i++) {
    if (b - a < 2) continue;
    const uu = i * bw, d = TH + P + 0.75;
    B(S, uu - 0.55, uu + 0.55, G + 0.22, G + 1.1, TH + P - 0.02, d + 0.55);
    lat(S, [[0.5, 0], [0.5, 0.12], [0.44, 0.22], [0.42, 0.3]], uu, d, G + 1.1, 16);
    lat(S, [[0.42, 0], [0.36, E - 0.5 - G - 1.4]], uu, d, G + 1.4, 16);
    { const p = W(uu, d); bag.add(S, box(p[0] - 0.5, E - 0.5, p[1] - 0.5, p[0] + 0.5, E - 0.38, p[1] + 0.5)); bag.add(S, box(p[0] - 0.46, E - 0.12, p[1] - 0.46, p[0] + 0.46, E, p[1] + 0.46)); }
    for (const s of [-1, 1]) { const p = W(uu + s * 0.38, d), g = lathe([[0.14, 0], [0.14, 0.7], [0.001, 0.7]], 10); g.translate(0, -0.35, 0); g.rotateX(Math.PI / 2); g.rotateY(Math.atan2(n[0], n[1])); g.translate(p[0], E - 0.25, p[1]); bag.add(S, g); }
    lat(S, [[0.3, 0], [0.42, 0.12], [0.42, 0.38]], uu, d, E - 0.38, 12);
    B(S, uu - 0.6, uu + 0.6, E, A, TH + P - 0.02, d + 0.65);
    // the statue: on its plinth before the attic, a figure in drapery
    B(S, uu - 0.45, uu + 0.45, A, A + 0.5, d - 0.4, d + 0.45);
    lat('marble_smooth', [[0.36, 0], [0.33, 0.25], [0.24, 0.9], [0.27, 1.3], [0.17, 1.45], [0.001, 1.46]], uu, d, A + 0.5, 10);
    lat('marble_smooth', [[0.001, 0], [0.11, 0.04], [0.12, 0.17], [0.07, 0.26], [0.001, 0.28]], uu, d, A + 1.95, 8);
    const arm = []; { const p0 = W(uu + 0.24, d), p1 = W(uu + 0.42, d - 0.18); hexa(arm, [[p0[0] - 0.06, A + 1.75, p0[1] - 0.06], [p0[0] + 0.06, A + 1.75, p0[1] - 0.06], [p0[0] + 0.06, A + 1.75, p0[1] + 0.06], [p0[0] - 0.06, A + 1.75, p0[1] + 0.06]], [[p1[0] - 0.05, A + 2.25, p1[1] - 0.05], [p1[0] + 0.05, A + 2.25, p1[1] - 0.05], [p1[0] + 0.05, A + 2.25, p1[1] + 0.05], [p1[0] - 0.05, A + 2.25, p1[1] + 0.05]]); }
    bag.add('marble_smooth', fromTriangles(arm));
  }
  // the balustrade on the cornice: plinth, vase-shaped balusters, dies at the pilasters, the coping; trophies and fire-vases on the dies
  const dB = (i) => dAt(i) - 0.15;
  for (const i of all) {
    const d = dB(i), u0 = i * bw, u1 = (i + 1) * bw;
    B(S, u0, u1, T, T + 0.3, d - 0.4, d);
    const nbal = Math.floor((bw - 0.7) / 0.3);
    for (let k = 0; k < nbal; k++) lat(S, [[0.1, 0], [0.07, 0.1], [0.13, 0.32], [0.06, 0.6], [0.09, 0.66], [0.09, 0.7]], u0 + 0.35 + (k + 0.5) * (bw - 0.7) / nbal, d - 0.2, T + 0.3, 8);
    B(S, u0, u1, T + 1.0, T + 1.18, d - 0.42, d + 0.02);
  }
  for (let i = 0; i <= nb; i++) {
    const uu = i * bw, d = Math.max(dB(Math.min(i, nb - 1)), dB(Math.max(0, i - 1)));
    B(S, uu - 0.35, uu + 0.35, T + 0.3, T + 1.25, d - 0.45, d + 0.05);
    const trophy = avant.has(i) || avant.has(i - 1);
    if (trophy) {
      // a trophy of arms: a cuirass on a stand, the helmet, a round shield, standards and spears crossed behind
      lat(S, [[0.28, 0], [0.22, 0.12], [0.3, 0.5], [0.26, 0.8], [0.12, 0.9], [0.001, 0.92]], uu, d - 0.2, T + 1.25, 10);
      lat(S, [[0.001, 0], [0.15, 0.05], [0.16, 0.2], [0.08, 0.36], [0.03, 0.5], [0.001, 0.52]], uu, d - 0.2, T + 2.15, 10);
      const g = lathe([[0.26, 0], [0.26, 0.06], [0.001, 0.08]], 14); g.rotateX(-Math.PI / 2); g.rotateY(Math.atan2(n[0], n[1])); const p = W(uu, d - 0.02); g.translate(p[0], T + 1.75, p[1]); bag.add(S, g);
      const sp = []; for (const s of [-1, 1]) { const a = W(uu - s * 0.4, d - 0.32), b = W(uu + s * 0.45, d - 0.32); hexa(sp, [[a[0] - 0.03, T + 1.3, a[1] - 0.03], [a[0] + 0.03, T + 1.3, a[1] - 0.03], [a[0] + 0.03, T + 1.3, a[1] + 0.03], [a[0] - 0.03, T + 1.3, a[1] + 0.03]], [[b[0] - 0.03, T + 2.8, b[1] - 0.03], [b[0] + 0.03, T + 2.8, b[1] - 0.03], [b[0] + 0.03, T + 2.8, b[1] + 0.03], [b[0] - 0.03, T + 2.8, b[1] + 0.03]]); }
      bag.add(S, fromTriangles(sp));
    } else {
      // a fire-vase (pot-à-feu): the urn on its foot, the flames carved at its mouth
      lat(S, [[0.2, 0], [0.12, 0.12], [0.1, 0.22], [0.3, 0.5], [0.28, 0.78], [0.18, 0.88], [0.22, 0.95], [0.001, 0.96]], uu, d - 0.2, T + 1.25, 12);
      lat(S, [[0.18, 0], [0.12, 0.25], [0.05, 0.45], [0.001, 0.62]], uu, d - 0.2, T + 2.2, 6);
    }
  }
}
