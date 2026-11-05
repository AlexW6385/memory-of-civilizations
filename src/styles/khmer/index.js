// Khmer architecture of the Angkor period (Angkor Wat, first half of the 12th c.;
// docs/settlements/angkor.md §4–§5): towers (prasat) shaped like lotus buds, their plan a square
// with its sides stepped out (redented), rising in receding tiers crowned by a bud; galleries with
// a solid wall on one side and square pillars on the other under corbelled stone vaults, a
// half-vault along their open side; cross-shaped entrance pavilions (gopura); terraces of laterite
// faced with sandstone, mouldings stepped in and out, steep stairs; causeways bordered by the
// bodies of serpents (naga) that rear up as seven-headed fans at their ends; libraries; basins.
// The village: houses of timber on stilts with steep roofs of palm thatch.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import '../qing/index.js';
import { rectRoof, beamTris, flipTris } from '../ming/index.js';

const S = 'sandstone_khmer';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The redented square: the radius factor at angle th for a square (corners on the diagonals) with its sides stepped out `steps` times. */
function redent(steps, depth = 0.12) {
  return (th) => {
    const c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th)), sq = 1 / Math.max(c, s);
    // distance along the side from its middle (0) to the corner (1)
    const t = Math.min(c, s) / Math.max(c, s);
    const step = Math.floor((1 - t) * (steps + 1) * 0.999) / (steps + 1);
    return sq * (1 - depth + depth * step * 1.6);
  };
}

/**
 * k_tower: a prasat { c, y, w (the sanctuary's width), h (the tower's full height above y), porches }:
 * the sanctuary (a cube with a portico on each side), then tiers that recede and shrink, each with a
 * row of antefixes at its corners, then the lotus-bud crown.
 */
function kTower(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, w = el.w, H = el.h, hw = w / 2;
  const body = Math.min(H * 0.28, w * 1.1);
  // the base mouldings and the sanctuary
  bag.add(S, box(cx - hw - 0.6, y, cz - hw - 0.6, cx + hw + 0.6, y + 0.8, cz + hw + 0.6));
  bag.add(S, box(cx - hw, y + 0.8, cz - hw, cx + hw, y + body, cz + hw));
  bag.add('sandstone_carved', box(cx - hw - 0.25, y + body - 0.6, cz - hw - 0.25, cx + hw + 0.25, y + body, cz + hw + 0.25));
  col.rect([cx - hw - 0.6, cz - hw - 0.6, cx + hw + 0.6, cz + hw + 0.6], y, y + body);
  // a doorway on each face (el.doors: the faces, default all): dark, in a frame of colonnettes under a lintel
  for (const f of el.doors ?? 'nesw') {
    const [dx, dz] = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] }[f], dw = Math.min(1.1, w * 0.12), dh = Math.min(3.2, body * 0.55);
    const R = (u, d0, d1) => (dx ? [cx + dx * (hw + d0), cz - u, cx + dx * (hw + d1), cz + u] : [cx - u, cz + dz * (hw + d0), cx + u, cz + dz * (hw + d1)]);
    const fix = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];
    let r = fix(R(dw + 0.45, 0, 0.12)); bag.add('sandstone_carved', box(r[0], y + 0.8, r[1], r[2], y + 0.8 + dh + 0.5, r[3]));
    r = fix(R(dw, 0, 0.16)); bag.add('opening', box(r[0], y + 0.8, r[1], r[2], y + 0.8 + dh, r[3]));
    r = fix(R(dw + 0.6, 0, 0.2)); bag.add(S, box(r[0], y + 0.8 + dh + 0.5, r[1], r[2], y + 0.8 + dh + 0.85, r[3]));
  }
  // porticoes: on each side a projecting porch with its own little gabled vault and pediment
  if (el.porches !== false) for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const pw = w * 0.38, pd = w * 0.28, ph = body * 0.75;
    const px = cx + dx * (hw + pd / 2), pz = cz + dz * (hw + pd / 2);
    const r = dx ? [px - pd / 2, pz - pw / 2, px + pd / 2, pz + pw / 2] : [px - pw / 2, pz - pd / 2, px + pw / 2, pz + pd / 2];
    bag.add(S, box(r[0], y + 0.8, r[1], r[2], y + ph * 0.25, r[3]));
    for (const s of [-1, 1]) {                                       // the porch's two pillars
      const qx = dx ? px + dx * pd * 0.35 : px + s * pw * 0.35, qz = dz ? pz + dz * pd * 0.35 : pz + s * pw * 0.35;
      bag.add(S, box(qx - 0.25, y + 0.8, qz - 0.25, qx + 0.25, y + ph, qz + 0.25));
    }
    rectRoof({ c: [px, pz], A: (dx ? pd : pw) / 2 + 0.3, B: (dx ? pw : pd) / 2 + 0.2, y: y + ph, rise: pw * 0.45, kind: 'gable', sweep: 0, curl: false, p: 0.75, alongZ: !!dz, mat: S, soffit: S }, bag);
  }
  // the tiers: a lathe on a redented square, each tier a band, a cornice and a set-back
  const tiers = el.tiers ?? 5, prof = [];
  let r = hw * 1.04, yy = body;
  const th = (H - body) * 0.72 / tiers;
  for (let k = 0; k < tiers; k++) {
    prof.push([r, yy], [r * 0.97, yy + th * 0.62], [r * 1.02, yy + th * 0.7], [r * 1.02, yy + th * 0.82], [r * 0.84, yy + th]);
    // antefixes at the tier's corners and middles: small flame-shaped finials
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4 + Math.PI / 4, rr = r * 1.0 * (a % 2 ? 1 : 1 / Math.SQRT2 * 1.38);
      const ax = cx + Math.cos(ang) * rr * (a % 2 ? 0.72 : 1), az = cz + Math.sin(ang) * rr * (a % 2 ? 0.72 : 1);
      bag.add('sandstone_carved', lathe([[0.32 * w / 8, 0], [0.26 * w / 8, th * 0.35], [0.001, th * 0.7]], 4, null, ax, y + yy + th * 0.82, az));
    }
    r *= 0.8; yy += th;
  }
  // the lotus bud
  const bud = H - yy;
  prof.push([r, yy], [r * 1.05, yy + bud * 0.18], [r * 0.95, yy + bud * 0.42], [r * 0.6, yy + bud * 0.72], [r * 0.2, yy + bud * 0.92], [0.001, H]);
  bag.add(S, lathe(prof, 32, redent(3), cx, y, cz));
}

/**
 * k_gallery: a gallery round a rectangle { rect (its centre line), y, w (width), h (pillar height),
 * solid ('in' | 'out': the side with the wall), half (a half-gallery on the open side), gates
 * (gaps at the middles of the sides, with a gopura), corner (towers at the corners: height) }.
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
      const wt = [];
      beamTris(wt, [wa[0], y, wa[1]], [wb[0], y, wb[1]], 0.45, h + 0.4);
      bag.add(S, fromTriangles(wt));
      col.segment(wa, wb, 0.9, y - 0.6, y + h + 0.4);
      // the pillars on the open side, and those of the half-gallery beyond them
      const np = Math.max(1, Math.round(len / 3.2));
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
      if (el.half) {
        const hm = [mid[0] - n[0] * (hw + 1.4) * out, mid[1] - n[1] * (hw + 1.4) * out], hy = y + h * 0.62;
        const t = [], e0 = [A[0] - n[0] * (hw + 3.2) * out, hy + 0.3, A[1] - n[1] * (hw + 3.2) * out], e1 = [B[0] - n[0] * (hw + 3.2) * out, hy + 0.3, B[1] - n[1] * (hw + 3.2) * out];
        const r0 = [pa[0], y + h + 0.3, pa[1]], r1 = [pb[0], y + h + 0.3, pb[1]];
        t.push(...e0, ...e1, ...r1, ...e0, ...r1, ...r0);
        bag.add(S, fromTriangles(t.concat(flipTris(t))));
        void hm;
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

/**
 * naga_rail: a serpent balustrade { a, b, y, h }: its body (a thick round beam) on short posts,
 * at each end the serpent rearing as a fan of seven heads.
 */
function nagaRail(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, y = el.y, h = el.h ?? 1.0;
  // the serpent's body: round, ringed with its scales' bands, carried on short posts with moulded caps
  const yb = y + h - 0.12;
  bag.add(S, rod([ax, yb, az], [bx, yb, bz], 0.27, 12));
  for (let s = 0.6; s < L - 0.3; s += 0.9) { const x = ax + ux * s, z = az + uz * s; bag.add(S, rod([x - ux * 0.06, yb, z - uz * 0.06], [x + ux * 0.06, yb, z + uz * 0.06], 0.3, 12)); }
  const n = Math.max(1, Math.round(L / 2.2));
  for (let k = 0; k <= n; k++) {
    const s = k / n, x = ax + (bx - ax) * s, z = az + (bz - az) * s;
    bag.add(S, box(x - 0.17, y, z - 0.17, x + 0.17, yb - 0.38, z + 0.17));
    bag.add(S, box(x - 0.24, yb - 0.38, z - 0.24, x + 0.24, yb - 0.22, z + 0.24));
    bag.add(S, box(x - 0.24, y, z - 0.24, x + 0.24, y + 0.14, z + 0.24));
  }
  col.segment(el.a, el.b, 0.5, y, y + h + 0.2);
  for (const [p, sg] of [[el.a, -1], [el.b, 1]]) {
    if (el.ends === false) continue;
    // the fan of heads: a disc segment standing up, its rim scalloped into seven heads
    const fan = [], cxp = p[0] + ux * sg * 0.4, czp = p[1] + uz * sg * 0.4, R = 1.6, nx = -uz, nz = ux;
    for (let k = 0; k < 7; k++) {
      const a0 = Math.PI * (0.12 + 0.76 * k / 7), a1 = Math.PI * (0.12 + 0.76 * (k + 1) / 7), am = (a0 + a1) / 2;
      const P = (a, r) => [cxp + nx * Math.cos(a) * r, y + h + Math.sin(a) * r, czp + nz * Math.cos(a) * r];
      fan.push(...P(a0, 0.2), ...P(a0, R), ...P(am, R * 1.12), ...P(a0, 0.2), ...P(am, R * 1.12), ...P(a1, R), ...P(a0, 0.2), ...P(a1, R), ...P(a1, 0.2));
    }
    // give the fan a thickness by drawing it twice, offset along the rail
    const fan2 = fan.map((v, i) => (i % 3 === 0 ? v + ux * sg * 0.25 : i % 3 === 2 ? v + uz * sg * 0.25 : v));
    bag.add(S, fromTriangles(fan.concat(flipTris(fan), fan2, flipTris(fan2))));
    bag.add(S, box(cxp - 0.5, y, czp - 0.5, cxp + 0.5, y + h + 0.2, czp + 0.5));
  }
}

/** k_library: a small building on its own platform { rect, y, h }: walls of sandstone, a corbelled vault, porches at its ends. */
function kLibrary(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 5;
  kTerrace({ rect: [x0 - 1.5, z0 - 1.5, x1 + 1.5, z1 + 1.5], y0: 0, y1: y }, ctx);
  bag.add(S, box(x0, y, z0, x1, y + h, z1));
  bag.add('sandstone_carved', box(x0 - 0.3, y + h - 0.5, z0 - 0.3, x1 + 0.3, y + h, z1 + 0.3));
  col.rect([x0, z0, x1, z1], y, y + h);
  const along = x1 - x0 >= z1 - z0;
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (along ? x1 - x0 : z1 - z0) / 2 + 0.5, B: (along ? z1 - z0 : x1 - x0) / 2 + 0.4, y: y + h, rise: (along ? z1 - z0 : x1 - x0) * 0.6, kind: 'gable', sweep: 0, curl: false, p: 0.7, alongZ: !along, mat: S, soffit: S }, bag);
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

registerStyle('khmer', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    k_tower: kTower, k_gallery: kGallery, k_terrace: kTerrace, naga_rail: nagaRail, k_library: kLibrary, stilt_house: stiltHouse,
  },
  objects: {},
});
