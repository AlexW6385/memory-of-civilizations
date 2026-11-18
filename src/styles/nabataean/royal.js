// The Royal Tombs in the east cliff (docs/settlements/petra.md §22): the Urn Tomb on its arcade of round-arched vaults, the
// Corinthian Tomb and the Palace Tomb with real orders — Attic bases, tapering shafts, acanthus capitals, an architrave in three
// fasciae under a frieze, dentils and a cornice on a cyma — and doorways cut deep into the rock, jambs and lintel with their ears
// under a pediment or an arch with its archivolt and keystone. Each tomb's carved front is ONE geometry in the rock's own stone
// (a Sculpt, sculpt.js); the doorways are real recesses (the rock behind the front is cut back to the doors' depth) with the
// dark of the chamber at their back. Frame of a tomb: u along its front, y up, v out of it.

import { Sculpt, tube, blob, blobDir, boxTris, prismTris, hash3 } from './sculpt.js';
import * as FG from './figures.js';
import { orientedBox } from '../../core/build.js';

const R = 'sandstone_rose';
function frame(x, z, dir) {
  const [nx, nz] = Array.isArray(dir) ? dir : { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] }[dir], ux = -nz, uz = nx;
  return { P: (u, v) => [x + ux * u + nx * v, z + uz * u + nz * v] };
}
/** A prism along u: the convex polygon pts [[v, y], …] extruded from u0 to u1 (a cornice, a fascia). */
const prismU = (S, pts, u0, u1) => { const t = prismTris(pts, u0, u1), o = []; for (let i = 0; i < t.length; i += 3) o.push(t[i + 2], t[i + 1], t[i]); S.solid(o); };
const bx = (S, u0, v0, u1, v1, y0, y1) => S.solid(boxTris(Math.min(u0, u1), y0, Math.min(v0, v1), Math.max(u0, u1), y1, Math.max(v0, v1)));
/** A prism in the façade plane: the convex polygon pts [[u, y], …] from v0 to v1. */
const prismUY = (S, pts, v0, v1) => S.solid(prismTris(pts, v0, v1));

/** The façade's layer, from yA to yB and v = back to fv, round the doorways (voids [u0, u1, y0, y1]): cells of boxes, the doorways left deep. */
function layer(S, W, yA, yB, back, fv, voids) {
  const us = new Set([-W / 2, W / 2]), ys = new Set([yA, yB]);
  for (const q of voids) { for (const u of [q[0], q[1]]) if (u > -W / 2 && u < W / 2) us.add(u); for (const y of [q[2], q[3]]) if (y > yA && y < yB) ys.add(y); }
  const U = [...us].sort((a, b) => a - b), Y = [...ys].sort((a, b) => a - b);
  for (let i = 0; i + 1 < U.length; i++) for (let j = 0; j + 1 < Y.length; j++) {
    const cu = (U[i] + U[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
    if (voids.some((q) => cu > q[0] && cu < q[1] && cy > q[2] && cy < q[3])) continue;
    bx(S, U[i], back, U[i + 1], fv, Y[j], Y[j + 1]);
  }
}
/** A capital: the bell, two rows of eight leaves, the volutes and the abacus (floral, after the Khazneh's). */
function capital(S, u, y, v, r, h) {
  tube(S, [[u, y, v, r * 0.96], [u, y + 0.35 * h, v, r * 1.04], [u, y + 0.75 * h, v, r * 1.25]], { seg: 12, sub: 2, cap: [0, 0] });
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + 0.2 * hash3(u, y, v), c = Math.cos(a), s = Math.sin(a);
    blobDir(S, [u + c * r * 1.0, y + 0.3 * h, v + s * r * 1.0], [c * 0.25, 1, s * 0.25], 0.3 * h, r * 0.3, r * 0.1, [-s, 0, c], 3, 6);
    const b = a + Math.PI / 8, cb = Math.cos(b), sb = Math.sin(b);
    blobDir(S, [u + cb * r * 1.12, y + 0.56 * h, v + sb * r * 1.12], [cb * 0.5, 1, sb * 0.5], 0.28 * h, r * 0.26, r * 0.08, [-sb, 0, cb], 3, 6);
  }
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; blob(S, [u + Math.cos(a) * r * 1.3, y + 0.74 * h, v + Math.sin(a) * r * 1.3], [r * 0.2, r * 0.2, r * 0.2], 3, 6); }
  S.solid(boxTris(u - r * 1.45, y + 0.82 * h, v - r * 1.45, u + r * 1.45, y + h, v + r * 1.45));
}
/** An engaged column (axis at v, half sunk in the front): Attic base on its plinth, the shaft tapering, the astragal, the capital. */
function column(S, u, ya, yb, v, r, floral = true) {
  const capH = Math.min(1.3, (yb - ya) * 0.11), ys = yb - capH;
  S.solid(boxTris(u - r * 1.5, ya - 0.05, v - r * 1.5, u + r * 1.5, ya + 0.22, v + r * 1.5));
  tube(S, [[u, ya + 0.22, v, r * 1.38], [u, ya + 0.22 + 0.1, v, r * 1.34], [u, ya + 0.22 + 0.2, v, r * 1.14], [u, ya + 0.22 + 0.3, v, r * 1.26], [u, ya + 0.22 + 0.44, v, r * 1.06], [u, ya + 0.22 + 0.6, v, r], [u, (ya + ys) / 2, v, r * 0.96], [u, ys - 0.2, v, r * 0.88], [u, ys - 0.1, v, r * 0.96], [u, ys, v, r * 0.9]], { seg: 14, sub: 2, cap: [0, 0] });
  if (floral) capital(S, u, ys, v, r * 0.9, capH);
  else { tube(S, [[u, ys, v, r * 0.9], [u, ys + capH * 0.5, v, r * 1.1], [u, ys + capH, v, r * 1.25]], { seg: 12, sub: 1, cap: [0, 0] }); S.solid(boxTris(u - r * 1.4, ys + capH * 0.85, v - r * 1.4, u + r * 1.4, ys + capH, v + r * 1.4)); }
}
/** A pilaster: base, shaft, the Nabataean capital with its two horns. */
function pilaster(S, u, w, ya, yb, fv, d = 0.28) {
  bx(S, u - w / 2 - 0.07, fv - 0.02, u + w / 2 + 0.07, fv + d + 0.07, ya - 0.05, ya + 0.35);
  bx(S, u - w / 2, fv - 0.02, u + w / 2, fv + d, ya + 0.35, yb - 0.6);
  bx(S, u - w / 2 + 0.03, fv - 0.02, u + w / 2 - 0.03, fv + d + 0.02, yb - 0.6, yb - 0.32);
  bx(S, u - w / 2 - 0.1, fv - 0.02, u + w / 2 + 0.1, fv + d + 0.1, yb - 0.32, yb);
  for (const s of [-1, 1]) bx(S, u + s * (w / 2 - 0.02), fv - 0.02, u + s * (w / 2 + 0.17), fv + d + 0.12, yb - 0.24, yb - 0.02);
}
/** An entablature across u0 … u1 at y: the architrave in three fasciae, the frieze, a course of dentils and the cornice on its cyma. Returns the top. */
function entablature(S, u0, u1, y, fv, frieze = 1.2, out = 0.5) {
  bx(S, u0 - 0.04, fv - 0.1, u1 + 0.04, fv + out * 0.35, y, y + 0.3);
  bx(S, u0 - 0.07, fv - 0.1, u1 + 0.07, fv + out * 0.5, y + 0.3, y + 0.6);
  bx(S, u0 - 0.1, fv - 0.1, u1 + 0.1, fv + out * 0.62, y + 0.6, y + 0.9);
  bx(S, u0, fv - 0.1, u1, fv + out * 0.4, y + 0.9, y + 0.9 + frieze);
  const yd = y + 0.9 + frieze, n = Math.max(2, Math.floor((u1 - u0) / 0.34));
  for (let i = 0; i < n; i++) { const a = u0 + (u1 - u0) * (i + 0.15) / n, b = u0 + (u1 - u0) * (i + 0.7) / n; bx(S, a, fv + out * 0.3, b + 0.004 * (i % 4), fv + out * 0.72, yd, yd + 0.2); }
  prismU(S, [[fv + out * 0.3, yd + 0.2], [fv + out * 0.78, yd + 0.2], [fv + out * 1.0, yd + 0.38], [fv + out * 1.0, yd + 0.52], [fv + out * 0.3, yd + 0.52]], u0 - 0.28, u1 + 0.28);
  prismU(S, [[fv + out * 0.3, yd + 0.52], [fv + out * 1.05, yd + 0.52], [fv + out * 1.12, yd + 0.7], [fv + out * 0.3, yd + 0.7]], u0 - 0.3, u1 + 0.3);
  return yd + 0.7;
}
/** A pediment from u0 to u1 on y, rising `rise`: its tympanum, the raking cornices (on dentils) and the acroteria. */
function pediment(S, u0, u1, y, rise, fv, out = 0.55) {
  const m = (u0 + u1) / 2;
  prismUY(S, [[u0, y], [u1, y], [m, y + rise]], fv - 0.2, fv + 0.2);
  for (const s of [-1, 1]) {
    const ua = s < 0 ? u0 - 0.3 : m, ub = s < 0 ? m : u1 + 0.3, ya = s < 0 ? y - 0.05 : y + rise + 0.05, yb = s < 0 ? y + rise + 0.05 : y - 0.05;
    const L = Math.hypot(ub - ua, yb - ya), du = (ub - ua) / L, dy = (yb - ya) / L, nx = -dy, ny = du, th = 0.42;
    const q = [[ua, ya], [ub, yb], [ub + nx * th * (nx < 0 ? -1 : 1) * 0, yb + th], [ua, ya + th]];
    prismUY(S, q, fv - 0.15, fv + out);
    const cnt = Math.floor(L / 0.34);
    for (let i = 0; i < cnt; i++) { const t0 = (i + 0.15) / cnt * L, t1 = (i + 0.7) / cnt * L, p = [ua + du * t0, ya + dy * t0], r = [ua + du * t1, ya + dy * t1]; prismUY(S, [p, r, [r[0], r[1] - 0.2], [p[0], p[1] - 0.2]], fv + 0.0, fv + out * 0.8); }
  }
  prismUY(S, [[m - 0.45, y + rise + 0.2], [m + 0.45, y + rise + 0.2], [m, y + rise + 0.95]], fv - 0.1, fv + 0.5);
  for (const s of [-1, 1]) prismUY(S, [[s * (u1 - u0) / 2 + m - s * 0.5, y], [s * (u1 - u0) / 2 + m + s * 0.4, y], [s * (u1 - u0) / 2 + m, y + 0.8]], fv - 0.1, fv + 0.5);
}
/** A doorway at u (width dw, height dh) from y: the jambs with their ears, the lintel, and a crown — 'pediment', 'arch' or 'flat'. Returns its void [u0, u1, y0, y1]. */
function doorway(S, u, dw, dh, y, fv, crown) {
  const f = 0.36;
  for (const s of [-1, 1]) bx(S, u + s * dw / 2, fv - 0.03, u + s * (dw / 2 + f), fv + 0.16, y - 0.05, y + dh + (crown === 'arch' ? 0 : f));
  if (crown === 'arch') {
    const cy = y + dh, r = dw / 2;
    tube(S, Array.from({ length: 13 }, (_, k) => { const a = Math.PI * k / 12; return [u + Math.cos(a) * (r + f * 0.55), cy + Math.sin(a) * (r + f * 0.55), fv + 0.12, f * 0.55, 0.16]; }), { seg: 7, sub: 1, cap: [1, 1], capN: 1, ref: [0, 0, 1] });
    bx(S, u - 0.28, fv - 0.03, u + 0.28, fv + 0.3, cy + r + 0.05, cy + r + f + 0.3);                                  // the keystone
    for (const s of [-1, 1]) bx(S, u + s * (r - 0.02), fv - 0.03, u + s * (r + f + 0.12), fv + 0.24, cy - 0.12, cy + 0.14);   // the imposts
    return [u - r, u + r, y, cy + r * 0.0 + 0.0];
  }
  bx(S, u - dw / 2 - f, fv - 0.03, u + dw / 2 + f, fv + 0.16, y + dh - 0.04, y + dh + f);
  for (const s of [-1, 1]) bx(S, u + s * (dw / 2 + f - 0.1), fv - 0.03, u + s * (dw / 2 + f + 0.14), fv + 0.2, y + dh - 0.5, y + dh + f + 0.08);   // the ears
  bx(S, u - dw / 2 - f - 0.2, fv - 0.03, u + dw / 2 + f + 0.2, fv + 0.3, y + dh + f, y + dh + f + 0.28);                 // the cornice
  if (crown === 'pediment') pediment(S, u - dw / 2 - f - 0.2, u + dw / 2 + f + 0.2, y + dh + f + 0.28, dw * 0.3, fv - 0.1, 0.35);
  return [u - dw / 2, u + dw / 2, y, y + dh];
}
/** The corners of a round-arched opening filled: a fan of prisms from each upper corner to the quarter circle (centre [u, cy], radius r), from v0 to v1. */
function spandrels(S, u, cy, r, v0, v1) {
  for (const s of [-1, 1]) { const arc = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 2 * k / 5; return [u + s * r * Math.cos(a), cy + r * Math.sin(a)]; }), c = [u + s * r, cy + r]; for (let k = 0; k + 1 < arc.length; k++) prismUY(S, [c, arc[k], arc[k + 1]], v0, v1); }
}
/** A conical tholos roof with its ribs, a collar and the urn finial. */
function roof(S, u, v, y, r, h) {
  tube(S, [[u, y, v, r], [u, y + h * 0.35, v, r * 0.72], [u, y + h * 0.75, v, r * 0.3], [u, y + h, v, 0.05]], { seg: 24, sub: 2, cap: [0, 0], fold: (t, th) => 1 + 0.045 * Math.cos(14 * th) });
}
function urn(S, u, y, v, k = 1) {
  tube(S, [[u, y, v, 0.5 * k], [u, y + 0.3 * k, v, 0.38 * k], [u, y + 0.9 * k, v, 0.9 * k], [u, y + 1.5 * k, v, 0.95 * k], [u, y + 2.0 * k, v, 0.7 * k], [u, y + 2.25 * k, v, 0.36 * k], [u, y + 2.4 * k, v, 0.5 * k], [u, y + 2.55 * k, v, 0.12 * k]], { seg: 14, sub: 2, cap: [1, 1], capN: 1, fold: (t, th) => 1 + (t > 0.3 && t < 0.75 ? 0.05 * Math.cos(12 * th) : 0) });
  for (const s of [-1, 1]) tube(S, [[u + s * 0.8 * k, y + 1.7 * k, v, 0.06 * k], [u + s * 1.05 * k, y + 1.45 * k, v, 0.06 * k], [u + s * 0.95 * k, y + 1.0 * k, v, 0.06 * k]], { seg: 5, sub: 2, capN: 1 });
}

export function royalTomb(el, { bag, col: C }) {
  const [x, z] = el.at, y0 = el.y ?? 0, { P } = frame(x, z, el.dir), W = el.w, H = el.h, back = el.back ?? 20, fl = el.flank ?? 6, top = (el.top ?? H + 15) - y0, fv = 0.4, kind = el.kind;
  const xf0 = ([u, y, v]) => { const [X, Z] = P(u, v); return [X, y0 + y, Z]; };
  const S = new Sculpt(xf0), T = new Sculpt(xf0);                      // the walls in the rock's rose, the dressed order in the paler stone (as the Khazneh's)
  const B = (u0, v0, u1, v1, ya, yb) => orientedBox(P(Math.min(u0, u1), (v0 + v1) / 2), P(Math.max(u0, u1), (v0 + v1) / 2), Math.abs(v1 - v0), y0 + ya, y0 + yb);
  const voids = [], rv = kind === 'urn' ? -2.3 : -1.3;                                          // the rock's front, cut back to the deepest doorway
  bag.add(R, B(-W / 2 - fl, -back, W / 2 + fl, rv, -2, top));
  for (const s of [-1, 1]) bag.add(R, B(s * W / 2, rv, s * (W / 2 + fl), 0, -2, top));
  C.segment(P(-W / 2 - fl, (fv - back) / 2), P(W / 2 + fl, (fv - back) / 2), back + fv, y0 - 2, y0 + top);
  bx(S, -W / 2 - 0.3, rv, W / 2 + 0.3, fv + 0.4, -0.5, 0.5);                                   // the plinth
  const dark = (q) => { const a = P(q[0], rv + 0.02), b = P(q[1], rv + 0.02); bag.add('opening', orientedBox(a, b, 0.02, y0 + q[2], y0 + q[3])); };
  if (kind === 'urn') {
    // the arcade of vaults the tomb stands on: five round-arched bays, deep, their archivolts and keystones, the piers between
    const sub = 4.6, n = 5, bw = (W - 1.2) / n, yb = sub + 0.4, ch = 9.4, y1 = yb + ch;
    for (let i = 0; i < n; i++) {
      const u = -W / 2 + 0.6 + bw * (i + 0.5), r = bw * 0.36, ysp = 2.9, cy = ysp;
      voids.push([u - r, u + r, 0.5, ysp + r]);
      // the spandrels: the arch's corners filled, a fan of prisms from each upper corner to the quarter circle
      spandrels(S, u, cy, r, rv, fv);
      tube(T, Array.from({ length: 13 }, (_, k) => { const a = Math.PI * k / 12; return [u + Math.cos(a) * (r + 0.14), cy + Math.sin(a) * (r + 0.14), fv + 0.06, 0.16, 0.12]; }), { seg: 6, sub: 1, capN: 1, ref: [0, 0, 1] });
      bx(T, u - 0.22, fv - 0.03, u + 0.22, fv + 0.26, cy + r + 0.1, cy + r + 0.5);
      dark([u - r, u + r, 0.5, ysp + r]);
    }
    layer(S, W, 0.5, sub, rv, fv, voids);
    bx(S, -W / 2 - 0.1, rv, W / 2 + 0.1, fv + 0.25, sub - 0.35, sub);                          // the terrace's edge
    bx(S, -W / 2 - 0.2, rv, W / 2 + 0.2, fv + 0.45, sub, sub + 0.4);
    const ye = yb + ch, dw = 3.0, dh = 6.2;
    layer(S, W, sub + 0.4, ye + 0.2, rv, fv, [[-dw / 2, dw / 2, yb, yb + dh]]);
    for (const s of [-1, 1]) { pilaster(T, s * (W / 2 - 0.5), 1.0, yb, ye, fv, 0.3); column(T, s * W * 0.19, yb, ye, fv + 0.25, 0.6, true); }
    doorway(T, 0, dw, dh, yb, fv, 'pediment'); dark([-dw / 2, dw / 2, yb, yb + dh]);
    const yt = entablature(T, -W / 2, W / 2, ye, fv, 1.4, 0.6);
    // the frieze's four busts between the triglyph-like blocks
    T.flat = 0.6; T.clip = true; T.shift = 0.15;
    for (let i = 0; i < 4; i++) { const u = -W / 2 + W * (i + 0.5) / 4, yy = ye + 0.9; T.xf = ([a, b, w]) => { const [X, Z] = P(u + a * 1.2, fv + 0.3 + w * 1.2); return [X, y0 + yy + b * 1.2, Z]; }; FG.bust(T, 0); }
    T.flat = 1; T.clip = false; T.shift = 0;
    T.xf = xf0;
    const ya = yt + 3.0;
    bx(S, -W / 2 + 0.4, rv, W / 2 - 0.4, fv, yt, ya + 0.1);
    for (let i = 0; i <= 6; i++) { const u = -W / 2 + 0.7 + i * (W - 1.4) / 6; bx(T, u - 0.32, fv - 0.03, u + 0.32, fv + 0.2, yt + 0.2, ya - 0.3); bx(T, u - 0.4, fv - 0.03, u + 0.4, fv + 0.24, ya - 0.3, ya - 0.2); }
    bx(T, -W / 2, rv, W / 2, fv + 0.35, ya - 0.25, ya);
    const rise = Math.min(H - ya - 2.2, W * 0.2);
    pediment(T, -W / 2 + 0.3, W / 2 - 0.3, ya, rise, fv, 0.5);
    urn(T, 0, ya + rise + 0.5, fv * 0.5, 0.9);
  } else if (kind === 'corinthian') {
    const yb = 0.5, y1 = H * 0.42, dw = 2.4, dh = Math.min(5.5, y1 * 0.5), yu = y1 + 4.4, yt = H - 7;
    const dr = [[0, dw, dh, 'pediment'], [-W * 0.32, 1.5, dh * 0.7, 'flat'], [W * 0.32, 1.5, dh * 0.7, 'flat']];
    for (const [u, w, h] of dr) voids.push([u - w / 2, u + w / 2, yb, yb + h]);
    layer(S, W, yb, y1 + 0.2, rv, fv, voids);
    for (let i = 0; i < 8; i++) column(T, -W / 2 + 0.8 + i * (W - 1.6) / 7, yb, y1, fv + 0.1, 0.5, true);
    for (const [u, w, h, c] of dr) { doorway(T, u, w, h, yb, fv + 0.1, c); dark([u - w / 2, u + w / 2, yb, yb + h]); }
    const ye = entablature(T, -W / 2, W / 2, y1, fv, 1.0, 0.55);
    pediment(T, -W * 0.22, W * 0.22, ye, 2.6, fv, 0.5);
    bx(S, -W / 2 + 0.4, rv, W / 2 - 0.4, fv, ye - 0.1, yu);
    for (const s of [-1, 1]) {
      const uo = s * (W / 2 - 0.9), ui = s * (W / 2 - 6.4);
      for (const u of [uo, ui]) column(T, u, yu, yt, fv + 0.1, 0.42, true);
      bx(S, Math.min(uo, ui) - 0.4, rv, Math.max(uo, ui) + 0.4, fv, yu, yt + 0.2);
      entablature(T, Math.min(uo, ui) - 0.5, Math.max(uo, ui) + 0.5, yt, fv, 0.6, 0.45);
      const ue = s * (W / 2 - 0.4), yp = yt + 2.1;
      prismUY(T, [[ue, yp], [ui, yp], [ui, yp + 1.8]], fv - 0.1, fv + 0.3);
    }
    const tr = 3.2;
    tube(S, [[0, yu, -0.2, 2.6], [0, yt, -0.2, 2.6]], { seg: 22, sub: 1, cap: [0, 0] });
    for (const a of [-80, -40, 0, 40, 80]) { const t = a * Math.PI / 180; column(T, Math.sin(t) * tr, yu, yt, -0.2 + Math.cos(t) * tr, 0.38, true); }
    tube(T, [[0, yt, -0.2, 3.7], [0, yt + 1.2, -0.2, 3.7]], { seg: 24, sub: 1, cap: [0, 0] });
    roof(T, 0, -0.2, yt + 1.2, 3.5, 3.3);
    urn(T, 0, yt + 4.5, -0.2, 0.55);
  } else {
    // the Palace Tomb: four doors in the lowest storey between engaged pilasters, the middle two twice as wide under pediments, the
    // outer two under round arches; a storey of eighteen engaged columns above, and a third of pilasters, its upper corner masonry
    const s1 = H * 0.36, s2 = H * 0.68, dh = Math.min(7, s1 * 0.5), yb = 0.5;
    const dr = [[-W * 0.34, 1.8, dh * 0.8, 'arch'], [-W * 0.115, 3.4, dh, 'pediment'], [W * 0.115, 3.4, dh, 'pediment'], [W * 0.34, 1.8, dh * 0.8, 'arch']];
    for (const [u, w, h] of dr) voids.push([u - w / 2, u + w / 2, yb, yb + h + (dr[0][3] === 'arch' && w < 2 ? w / 2 : 0)]);
    layer(S, W, yb, s1 - 1.4, rv, fv, voids);
    for (let i = 0; i <= 12; i++) { const u = -W / 2 + 0.6 + i * (W - 1.2) / 12; if (dr.some(([du, w]) => Math.abs(u - du) < w / 2 + 0.7)) continue; pilaster(T, u, 0.9, yb, s1 - 1.7, fv, 0.28); }
    for (const [u, w, h, c] of dr) { doorway(T, u, w, h, yb, fv + 0.28, c); const top2 = h + (c === 'arch' ? w / 2 : 0); if (c === 'arch') spandrels(S, u, yb + h, w / 2, rv, fv); dark([u - w / 2, u + w / 2, yb, yb + top2]); }
    for (const [i, [ya0, yb0]] of [[1, [s1 - 1.6, s2 - 1.6]], [2, [s2 - 1.6, H - 1.2]]]) {
      const ya = entablature(T, -W / 2, W / 2, ya0, fv, 0.3, 0.4);
      bx(S, -W / 2 + 0.3, rv, W / 2 - 0.3, fv, ya, yb0 + (i === 1 ? 0.2 : 0));
      for (let k = 0; k < 18; k++) { const u = -W / 2 + 1.2 + k * (W - 2.4) / 17; if (i === 1) column(T, u, ya, yb0, fv, 0.42, true); else pilaster(T, u, 0.7, ya, yb0 - 0.1, fv, 0.24); }
    }
    bag.add('sandstone_rose_ashlar', B(W / 2 - W * 0.28, -0.5, W / 2 + 0.02, fv + 0.27, s2 + 1, H - 1.25));
    bx(S, -W / 2 - 0.2, 0, W / 2 + 0.2, fv + 0.5, H - 1.2, H);
  }
  // the front's hollows: the rock's front face (rv) closes each doorway, its dark drawn above; the carving is one piece
  bag.add(R, S.geometry()); bag.add('sandstone_white', T.geometry());
}
