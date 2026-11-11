// The Timurid kit (docs/settlements/timurid-samarkand.md §4): banna'i panels (glazed bricks set in geometric
// patterns on buff brick), the ribbed dome on its tall drum, the tiled minaret, and the small wall and room
// helpers the monuments share. Pure geometry; coordinates in metres, +x east, +z south.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { orientedBox, STYLES } from '../../core/build.js';

/** The pishtaq builder, reached at build time (the style registers it; this file cannot import it back). */
export const pishtaqOf = (el, ctx) => STYLES.timurid.elements.tim_pishtaq(el, ctx);

export const B = 'brick_buff', LAP = 'tile_lapis', TUR = 'tile_turquoise', CRE = 'tile_cream', WHI = 'tile_white';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const boxR = (r, y0, y1) => box(r[0], y0, r[1], r[2], y1, r[3]);
export const unit = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / L, (b[1] - a[1]) / L, L]; };
/** The unit normal of a→b pointing away from `from`. */
export function away(a, b, from) {
  const [ux, uz] = unit(a, b); let nx = -uz, nz = ux;
  if (from && (from[0] - (a[0] + b[0]) / 2) * nx + (from[1] - (a[1] + b[1]) / 2) * nz > 0) { nx = -nx; nz = -nz; }
  return [nx, nz];
}

/** A solid box with its collider. */
export function solid(bag, col, mat, r, y0, y1) { bag.add(mat, boxR(r, y0, y1)); if (col) col.rect(r, y0, y1); }

/**
 * A wall along x (or z) between two ends, with doorways: gaps [[centre, width, height]] left open under a lintel.
 * axis 'x': wall runs along x at z; 'z': along z at x.
 */
export function wallRun(bag, col, mat, axis, c0, c1, at, th, y0, y1, gaps = []) {
  const R = (s0, s1, v0, v1) => (axis === 'x' ? [s0, at - th / 2, s1, at + th / 2] : [at - th / 2, s0, at + th / 2, s1]).concat([v0, v1]);
  const put = (s0, s1, v0, v1, solidCol) => { if (s1 - s0 < 0.02 || v1 - v0 < 0.02) return; const r = R(s0, s1, v0, v1); bag.add(mat, boxR(r.slice(0, 4), v0, v1)); if (solidCol) col.rect(r.slice(0, 4), v0, v1); };
  let s = c0;
  for (const [g, w, h] of [...gaps].sort((p, q) => p[0] - q[0])) {
    put(s, g - w / 2, y0, y1, true);
    put(g - w / 2, g + w / 2, y0 + h, y1, false);
    if (col && y1 - (y0 + h) > 0.02) { const r = R(g - w / 2, g + w / 2, 0, 0).slice(0, 4); col.rect(r, y0 + h, y1); }
    s = g + w / 2;
  }
  put(s, c1, y0, y1, true);
}

// ---- banna'i -------------------------------------------------------------------------------------------------

/**
 * A banna'i panel on a wall's face: the wall runs a→b, its face stands `d` out from that line toward `n`
 * (unit, plan); the panel covers s0…s1 along the wall and v0…v1 up it. kind: 'diamond' (a lattice of lozenges
 * with a small one between), 'kufic' (square Kufic: upright strokes joined by bars, on a field), 'checker'
 * (the plain bricks laid in a chequer) or 'zigzag'. `holes`: arches [{ at, w, h, sill }] the pattern keeps out
 * of (cells touching one are left out). Each ink is one material; the field sits under the ink.
 */
export function bannai(bag, o) {
  const { a, b, n, d, s0, s1, v0, v1 } = o, cell = o.cell ?? 0.7, kind = o.kind ?? 'diamond';
  const [ux, uz] = unit(a, b), up = o.y ?? 0, holes = o.holes ?? [];
  const P = (s, v, off) => [a[0] + ux * s + n[0] * (d + off), up + v, a[1] + uz * s + n[1] * (d + off)];
  const flip = (-uz * n[0] + ux * n[1]) < 0;
  const out = new Map();
  const tri = (m, p, q, r) => { if (!out.has(m)) out.set(m, []); out.get(m).push(...(flip ? [...p, ...r, ...q] : [...p, ...q, ...r])); };
  const quad = (m, S0, S1, V0, V1, off) => { const A = P(S0, V0, off), Bq = P(S1, V0, off), C = P(S1, V1, off), D = P(S0, V1, off); tri(m, A, Bq, C); tri(m, A, C, D); };
  const diam = (m, cs, cv, r, off) => { const L = P(cs - r, cv, off), R = P(cs + r, cv, off), T = P(cs, cv + r, off), Bm = P(cs, cv - r, off); tri(m, L, Bm, R); tri(m, L, R, T); };
  const inHole = (cs, cv, r) => holes.some((h) => {
    const w = h.w / 2 + r + 0.05, top = (h.sill ?? 0) + h.h + r + 0.05;
    return Math.abs(cs - h.at) < w && cv > (h.sill ?? 0) - r - 0.05 && (cv < top - Math.max(0, Math.abs(cs - h.at) - w * 0.35) * 1.6);
  });
  const ns = Math.max(1, Math.floor((s1 - s0) / cell)), nv = Math.max(1, Math.floor((v1 - v0) / cell)), cs = (s1 - s0) / ns, cv = (v1 - v0) / nv;
  const base = o.base ?? LAP, ink = o.ink ?? TUR, alt = o.alt ?? WHI, ink2 = o.ink2 ?? CRE;
  if (!holes.length) quad(base, s0, s1, v0, v1, 0.02);
  const rnd = rng(o.seed ?? 3);
  for (let i = 0; i < ns; i++) for (let j = 0; j < nv; j++) {
    const x0 = s0 + i * cs, x1 = x0 + cs, y0 = v0 + j * cv, y1 = y0 + cv, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
    if (holes.length && inHole(xm, ym, Math.max(cs, cv) * 0.6)) continue;
    if (holes.length) quad(base, x0, x1, y0, y1, 0.02);
    if (kind === 'diamond') {
      diam(ink, xm, ym, Math.min(cs, cv) * 0.46, 0.04);
      diam(alt, xm, ym, Math.min(cs, cv) * 0.2, 0.06);
      if (i + 1 < ns && j + 1 < nv && !holes.length) diam(ink2, x1, y1, Math.min(cs, cv) * 0.18, 0.04);
    } else if (kind === 'checker') {
      if ((i + j) % 2 === 0) quad(ink, x0, x1, y0, y1, 0.04); else quad(alt, x0 + cs * 0.15, x1 - cs * 0.15, y0 + cv * 0.15, y1 - cv * 0.15, 0.04);
    } else if (kind === 'zigzag') {
      const up2 = (i + j) % 2 === 0;
      tri(ink, P(x0, up2 ? y0 : y1, 0.04), P(x1, up2 ? y1 : y0, 0.04), P(xm, ym + (up2 ? cv * 0.3 : -cv * 0.3), 0.04));
    } else {
      // square Kufic: a stroke up each column, a bar across now and then, a dot
      const r = rnd();
      quad(ink, x0 + cs * 0.38, x0 + cs * 0.62, y0 + cv * 0.08, y1 - cv * 0.08, 0.04);
      if (r < 0.4) quad(alt, x0 + cs * 0.1, x1 - cs * 0.1, ym - cv * 0.09, ym + cv * 0.09, 0.06);
      else if (r < 0.7) quad(ink2, x0 + cs * 0.1, xm, y0 + cv * 0.18, y0 + cv * 0.34, 0.06);
      else quad(alt, xm + cs * 0.12, x1 - cs * 0.08, y1 - cv * 0.34, y1 - cv * 0.16, 0.06);
    }
  }
  for (const [m, t] of out) bag.add(m, fromTriangles(t));
}

// ---- domes, drums, minarets -----------------------------------------------------------------------------------

/**
 * The ribbed dome on its tall drum: { c: [x, z], y, r (the dome's greatest radius), h (its rise), drum: { r, h },
 * ribs, mat, band (the drum's tile band) }. The dome swells a little over its neck and is drawn to a point; its
 * flutes are cut by the lathe's radial modulation. Returns the y of the dome's top.
 */
export function ribbedDome(bag, col, el) {
  const [x, z] = el.c, y0 = el.y ?? 0, r = el.r, h = el.h, dr = el.drum?.r ?? r * 0.86, dh = el.drum?.h ?? r * 0.9, n = el.ribs ?? 24, mat = el.mat ?? TUR;
  // the drum: buff brick with a lapis band at the foot, a banna'i-like band of white blocks under the cornice, a turquoise cornice
  bag.add(B, lathe([[dr * 1.04, 0], [dr, 0.4], [dr, dh * 0.25]], 40, null, x, y0, z));
  bag.add(LAP, lathe([[dr * 1.005, dh * 0.25], [dr * 1.005, dh * 0.46]], 48, null, x, y0, z));
  bag.add(B, lathe([[dr, dh * 0.46], [dr, dh * 0.52]], 40, null, x, y0, z));
  bag.add(TUR, lathe([[dr * 1.01, dh * 0.52], [dr * 1.01, dh * 0.86]], 48, null, x, y0, z));
  const nb = Math.max(12, Math.round(2 * Math.PI * dr / 0.55));
  const wt = [];
  for (let k = 0; k < nb; k++) {
    const a = k / nb * Math.PI * 2, q = dr * 1.012, tx = -Math.sin(a), tz = Math.cos(a), tall = k % 3 !== 1, hh = dh * (tall ? 0.28 : 0.13);
    const cx = x + Math.cos(a) * q, cz = z + Math.sin(a) * q, ya = y0 + dh * 0.54, w = 0.09;
    const A = [cx - tx * w, ya, cz - tz * w], Bp = [cx + tx * w, ya, cz + tz * w], C = [cx + tx * w, ya + hh, cz + tz * w], D = [cx - tx * w, ya + hh, cz - tz * w];
    wt.push(...A, ...C, ...Bp, ...A, ...D, ...C);          // faces the outside (the cross product of the sweep a→c→b points out)
  }
  bag.add(WHI, fromTriangles(wt));
  bag.add(B, lathe([[dr, dh * 0.86], [dr * 1.06, dh * 0.9], [dr * 1.06, dh * 0.96], [dr * 1.01, dh]], 40, null, x, y0, z));
  // the dome: a neck, the swell, the point; ribs from the lathe's modulation
  const prof = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22, ang = t * Math.PI / 2;
    prof.push([Math.max(0.001, r * (0.9 + 0.1 * Math.min(1, t * 6)) * (1 + 0.1 * Math.sin(Math.min(1, t * 2.2) * Math.PI)) * Math.cos(ang) ** 0.85), h * Math.sin(ang) ** 1.15]);
  }
  prof[0][0] = dr;
  bag.add(mat, lathe(prof, n * 5, (th, i) => 1 + (i === 0 ? 0 : Math.min(1, i / 3)) * 0.032 * Math.cos(n * th), x, y0 + dh, z));
  // a lapis ring at the dome's foot and the gilt finial
  bag.add(LAP, lathe([[dr * 1.03, 0], [dr * 1.03, 0.45], [dr * 0.98, 0.5]], 40, null, x, y0 + dh - 0.02, z));
  bag.add('gilt_bronze', lathe([[r * 0.06, 0], [r * 0.07, r * 0.06], [r * 0.03, r * 0.13], [r * 0.055, r * 0.22], [0.001, r * 0.36]], 8, null, x, y0 + dh + h - r * 0.03, z));
  if (col) col.circle(x, z, dr * 1.05, y0, y0 + dh + h);
  return y0 + dh + h;
}

/**
 * The tiled minaret { c, y, h, r }: a stepped octagonal foot, a slightly tapering shaft of buff brick with
 * banna'i rings (lapis, turquoise, white) and a spiral of glazed diamonds, a gallery of muqarnas cells under
 * the lantern, the lantern and its turquoise cap.
 */
export function tiledMinaret(bag, col, el) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h, r = el.r ?? 2.1, top = h * 0.84;
  const foot = h * 0.14;
  bag.add(B, lathe([[r * 1.55, 0], [r * 1.55, foot * 0.55], [r * 1.3, foot * 0.62], [r * 1.3, foot]], 8, null, x, y, z));
  bag.add(LAP, lathe([[r * 1.58, foot * 0.5], [r * 1.58, foot * 0.58]], 8, null, x, y, z));
  const R0 = r * 1.12, R1 = r * 0.86;
  const rad = (t) => R0 + (R1 - R0) * t;
  bag.add(B, lathe([[rad(0), foot], [rad(1), top]], 28, null, x, y, z));
  // banna'i: horizontal bands, and a double spiral of diamonds winding up the shaft
  const bands = [[0.12, LAP], [0.2, TUR], [0.5, LAP], [0.58, TUR], [0.82, LAP], [0.9, TUR]];
  for (const [f, m] of bands) { const yy = foot + (top - foot) * f, t = f; bag.add(m, lathe([[rad(t) * 1.012, 0], [rad(t) * 1.012, h * 0.035]], 28, null, x, y + yy, z)); }
  const tt = [];
  const turns = Math.round((top - foot) / 7), N = Math.round((top - foot) / 0.62);
  for (let s = 0; s < 2; s++) for (let i = 0; i < N; i++) {
    const t = i / N, a = s * Math.PI + t * turns * Math.PI * 2, yy = y + foot + (top - foot) * t, q = rad(t) * 1.012, cx = x + Math.cos(a) * q, cz = z + Math.sin(a) * q, tx = -Math.sin(a), tz = Math.cos(a), w = 0.3;
    const L = [cx - tx * w, yy, cz - tz * w], Rr = [cx + tx * w, yy, cz + tz * w], T = [cx, yy + w, cz], Bt = [cx, yy - w, cz];
    tt.push(...L, ...T, ...Rr, ...L, ...Bt, ...T);
    tt.push(...Bt, ...Rr, ...T, ...Bt, ...L, ...Rr);
  }
  bag.add(TUR, fromTriangles(tt));
  // the gallery: stepped muqarnas corbels, a railing of brick, the lantern and its cap
  const gy = top;
  bag.add(B, lathe([[R1, 0], [R1 * 1.12, 0.35], [R1 * 1.25, 0.7], [R1 * 1.4, 1.05], [R1 * 1.42, 1.3], [R1 * 1.42, 1.9]], 28, null, x, y + gy - 0.2, z));
  bag.add(TUR, lathe([[R1 * 1.1, 0.35], [R1 * 1.12, 0.48]], 28, null, x, y + gy - 0.2, z));
  bag.add(LAP, lathe([[R1 * 1.44, 1.2], [R1 * 1.44, 1.5]], 28, null, x, y + gy - 0.2, z));
  const ly = y + gy + 1.7, lh = h - gy - 1.7 - R1 * 0.9;
  bag.add(B, lathe([[R1 * 0.8, 0], [R1 * 0.78, Math.max(0.5, lh)]], 20, null, x, ly, z));
  bag.add(TUR, lathe([[R1 * 0.95, Math.max(0.5, lh)], [R1 * 0.95, Math.max(0.5, lh) + 0.3], [R1 * 0.5, Math.max(0.5, lh) + R1 * 0.6], [0.001, Math.max(0.5, lh) + R1 * 1.2]], 20, null, x, ly, z));
  bag.add('gilt_bronze', lathe([[0.04, 0], [0.04, 0.9], [0.1, 1.0], [0.001, 1.25]], 6, null, x, ly + Math.max(0.5, lh) + R1 * 1.2 - 0.05, z));
  if (col) col.circle(x, z, r * 1.58, y, y + h);
}

/** A flat stone slab roof or floor with a collider (walkable top by `floor`). */
export function deck(bag, col, mat, r, y0, y1, walk = false) {
  bag.add(mat, boxR(r, y0, y1));
  if (col) { col.rect(r, y0, y1); if (walk) col.floor(r, y1); }
}

/** An oriented bar a→b of thickness th from y0 to y1 with its collider. */
export function bar(bag, col, mat, a, b, th, y0, y1, collide = true) {
  bag.add(mat, orientedBox(a, b, th, y0, y1));
  if (collide && col) col.segment(a, b, th, y0, y1);
}
