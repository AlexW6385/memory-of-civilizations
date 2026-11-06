// The Roman city (Rome under Hadrian; docs/settlements/rome.md §4–§5): insulae of brick-faced
// concrete, four and five storeys over arcaded shops, tiled roofs; the great baths, a brick mass of
// vaulted halls with tall arched windows round a domed hall; porticoes of columns round long
// enclosures; the stadium's tiers of seats round its arena. Registered into the `roman` style.

import { Matrix4 } from '../../core/three.js';
import { STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe, rod } from '../../core/geom.js';
import { merge as mergeGeoms } from '../greek/columns.js';
import { planarWall, arcSolid } from '../byzantine/index.js';
import '../../objects/index.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Arched openings (dark) along one face of a block: { r: rect, face, y0, h, w, step }. */
function arches(bag, r, face, y0, h, w, step) {
  const along = face === 'n' || face === 's', L = along ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / step);
  for (let i = 0; i < n; i++) {
    const u = (along ? r[0] : r[1]) + (i + 0.5) * L / n, q = face === 'n' ? [u - w / 2, r[1] - 0.06, u + w / 2, r[1] + 0.04] : face === 's' ? [u - w / 2, r[3] - 0.04, u + w / 2, r[3] + 0.06] : face === 'w' ? [r[0] - 0.06, u - w / 2, r[0] + 0.04, u + w / 2] : [r[2] - 0.04, u - w / 2, r[2] + 0.06, u + w / 2];
    bag.add('opening', box(q[0], y0, q[1], q[2], y0 + h, q[3]));
  }
}
/**
 * insula: { rect, seed, y, simple, balcony (chance of a balcony on the long face) } — an apartment
 * block of brick-faced concrete in the manner of the Hadrianic insulae of Ostia (docs/settlements/
 * rome.md §5): four or five storeys, under Trajan's limit of 60 feet; tabernae on every street face,
 * each a wide doorway under a travertine lintel with its mezzanine window above, some shut with their
 * boards, some with a masonry counter in the door; one stair door between brick pilasters; a
 * balcony on travertine corbels with a timber rail along the first floor; windows with travertine
 * sills and wooden shutters; brick string courses at the floors, a corbelled cornice, a hipped roof
 * of tiles. `simple` (far away): the mass, the roof, the dark doorways and windows only.
 */
function insula(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, far = !!el.simple;
  const n = 4 + (rand() < 0.4 ? 1 : 0), g0 = 4.6, sh = 3.2, H = g0 + (n - 1) * sh;
  bag.add('brick', box(x0, y - 0.5, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.5, y + H); col.floor(el.rect, y + H);
  const faces = [
    { a: [x0, z0], u: [1, 0], o: [0, -1], L: x1 - x0 }, { a: [x0, z1], u: [1, 0], o: [0, 1], L: x1 - x0 },
    { a: [x0, z0], u: [0, 1], o: [-1, 0], L: z1 - z0 }, { a: [x1, z0], u: [0, 1], o: [1, 0], L: z1 - z0 },
  ];
  /** A box on a face: along u0…u1, heights y0…y1, from d0 to d1 out from the wall's plane. */
  const fb = (F, u0, u1, ya, yb, d0, d1, mat) => {
    const A = [F.a[0] + F.u[0] * u0 + F.o[0] * d0, F.a[1] + F.u[1] * u0 + F.o[1] * d0], B = [F.a[0] + F.u[0] * u1 + F.o[0] * d1, F.a[1] + F.u[1] * u1 + F.o[1] * d1];
    bag.add(mat, box(Math.min(A[0], B[0]), ya, Math.min(A[1], B[1]), Math.max(A[0], B[0]), yb, Math.max(A[1], B[1])));
  };
  const long = faces[0].L >= faces[2].L ? (rand() < 0.5 ? 0 : 1) : (rand() < 0.5 ? 2 : 3);
  const balcony = !far && rand() < (el.balcony ?? 0.5);
  faces.forEach((F, fi) => {
    // the tabernae, and the stair door in the middle of the long face
    const nb = Math.max(1, Math.floor((F.L - 1.2) / 4.0)), bw = (F.L - 1.2) / nb, stair = fi === long ? Math.floor(nb / 2) : -1;
    for (let i = 0; i < nb; i++) {
      const uc = 0.6 + (i + 0.5) * bw;
      if (i === stair) {
        fb(F, uc - 0.8, uc + 0.8, y, y + 2.9, -0.05, 0.02, 'opening');
        if (far) continue;
        for (const s of [-1, 1]) fb(F, uc + s * 0.85 - (s > 0 ? 0 : 0.4), uc + s * 0.85 + (s > 0 ? 0.4 : 0), y, y + 3.1, -0.05, 0.16, 'brick');
        fb(F, uc - 1.4, uc + 1.4, y + 3.1, y + 3.32, -0.05, 0.3, 'travertine');
        fb(F, uc - 0.9, uc + 0.9, y, y + 0.16, -0.05, 0.4, 'travertine');
        continue;
      }
      const w = Math.min(2.7, bw - 1.1);
      fb(F, uc - w / 2, uc + w / 2, y, y + 3.3, -0.05, 0.02, 'opening');
      if (far) continue;
      fb(F, uc - 0.5, uc + 0.5, y + 3.75, y + 4.3, -0.05, 0.02, 'opening');          // the mezzanine's window
      fb(F, uc - w / 2 - 0.25, uc + w / 2 + 0.25, y + 3.3, y + 3.62, -0.05, 0.09, 'travertine');
      fb(F, uc - w / 2 - 0.1, uc + w / 2 + 0.1, y - 0.1, y + 0.12, -0.05, 0.3, 'travertine');
      const r = rand();
      if (r < 0.3) fb(F, uc - w / 2, uc + w / 2, y + 0.12, y + 3.3, 0.03, 0.08, 'shutter_brown');   // shut with its boards
      else if (r < 0.65) fb(F, uc - w / 2, uc + w / 2 - 0.9, y + 0.12, y + 1.0, -0.05, 0.5, 'travertine');   // a counter in the door
    }
    // the upper storeys: windows with sills and shutters, a string course at each floor
    const nw = Math.max(1, Math.floor((F.L - 1.0) / 3.1)), ww = (F.L - 1.0) / nw;
    for (let k = 1; k < n; k++) {
      const yk = y + g0 + (k - 1) * sh, top = k === n - 1, wh = top ? 1.0 : 1.4;
      if (!far && !(balcony && fi === long && k === 1)) fb(F, 0, F.L, yk - 0.12, yk, -0.05, 0.07, 'brick');
      for (let i = 0; i < nw; i++) {
        const uc = 0.5 + (i + 0.5) * ww, wy = yk + 0.9;
        fb(F, uc - 0.5, uc + 0.5, wy, wy + wh, -0.05, 0.02, 'opening');
        if (far) continue;
        fb(F, uc - 0.62, uc + 0.62, wy - 0.1, wy, -0.05, 0.12, 'travertine');
        const r = rand();
        if (r < 0.12) fb(F, uc - 0.5, uc + 0.5, wy, wy + wh, 0.03, 0.07, 'shutter_brown');
        else if (r < 0.45) for (const s of [-1, 1]) fb(F, s < 0 ? uc - 1.0 : uc + 0.53, s < 0 ? uc - 0.53 : uc + 1.0, wy, wy + wh, -0.05, 0.04, 'shutter_brown');
      }
    }
    if (far) return;
    // the cornice of corbelled brick under the eaves
    fb(F, -0.25, F.L + 0.25, y + H - 0.32, y + H - 0.12, -0.05, 0.22, 'brick');
    fb(F, -0.4, F.L + 0.4, y + H - 0.12, y + H, -0.05, 0.36, 'travertine');
    // the balcony on its corbels, with a timber rail
    if (balcony && fi === long) {
      const yb = y + g0;
      for (let u = 0.6; u < F.L - 0.4; u += 1.6) fb(F, u - 0.14, u + 0.14, yb - 0.5, yb - 0.1, -0.05, 1.0, 'travertine');
      fb(F, 0.3, F.L - 0.3, yb - 0.1, yb + 0.1, -0.05, 1.1, 'brick');
      for (let u = 0.4; u < F.L - 0.3; u += 1.2) fb(F, u - 0.04, u + 0.04, yb + 0.1, yb + 0.95, 1.0, 1.08, 'timber');
      fb(F, 0.35, F.L - 0.35, yb + 0.95, yb + 1.03, 0.98, 1.1, 'timber');
      fb(F, 0.35, F.L - 0.35, yb + 0.45, yb + 0.5, 1.02, 1.06, 'timber');
    }
  });
  const rise = Math.min(x1 - x0, z1 - z0) * 0.22, ov = far ? 0.3 : 0.55;
  bag.add('roof_tile', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + ov], y + H, y + H + rise, (x1 - x0) * 0.2, (x1 - x0) * 0.2, (z1 - z0) / 2 + ov - 0.05, (z1 - z0) / 2 + ov - 0.05));
}
/** thermae: { rect, y, h } — the baths: a brick mass with tall arched windows and a domed hall in the middle. */
function thermae(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 22, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, r = Math.min(x1 - x0, z1 - z0) * 0.22;
  bag.add('brick', box(x0, y - 0.5, z0, x1, y + h * 0.6, z1)); col.rect(el.rect, y - 0.5, y + h * 0.6); col.floor(el.rect, y + h * 0.6);
  bag.add('brick', box(cx - (x1 - x0) * 0.32, y + h * 0.6, cz - (z1 - z0) * 0.12, cx + (x1 - x0) * 0.32, y + h, cz + (z1 - z0) * 0.12));
  for (const f of 'nsew') arches(bag, el.rect, f, y + 3, h * 0.6 - 6, 4, 9);
  bag.add('brick', lathe([[r, 0], [r, h * 0.25]], 24, null, cx, y + h * 0.6, cz));
  bag.add('dome_stucco', lathe([[r, 0], [r * 0.92, r * 0.4], [r * 0.7, r * 0.72], [r * 0.38, r * 0.93], [0.001, r]], 24, null, cx, y + h * 0.6 + h * 0.25, cz));
}
/** porticus: { rect, h, y } — a long enclosure lined inside with a colonnade, a tiled lean-to roof. */
function porticus(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 9, d = el.depth ?? 6;
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) {
    const r = [Math.min(a[0], b[0]) - 0.6, Math.min(a[1], b[1]) - 0.6, Math.max(a[0], b[0]) + 0.6, Math.max(a[1], b[1]) + 0.6];
    bag.add('brick', box(r[0], y - 0.5, r[1], r[2], y + h + 1.5, r[3])); col.rect(r, y, y + h + 1.5);
  }
  const ir = [x0 + d, z0 + d, x1 - d, z1 - d];
  for (const [a, b] of [[[ir[0], ir[1]], [ir[2], ir[1]]], [[ir[0], ir[3]], [ir[2], ir[3]]], [[ir[0], ir[1]], [ir[0], ir[3]]], [[ir[2], ir[1]], [ir[2], ir[3]]]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(L / 4));
    for (let i = 0; i <= n; i++) STYLES.roman.column({ at: [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n], y, h, d: 0.8, mat: 'travertine' }, ctx);
  }
  for (const r of [[x0, z0, x1, ir[1]], [x0, ir[3], x1, z1], [x0, ir[1], ir[0], ir[3]], [ir[2], ir[1], x1, ir[3]]]) {
    bag.add('travertine', box(r[0], y + h, r[1], r[2], y + h + 0.8, r[3]));
    bag.add('roof_tile', box(r[0] - 0.4, y + h + 0.8, r[1] - 0.4, r[2] + 0.4, y + h + 1.4, r[3] + 0.4));
  }
  bag.add('flagstone', box(ir[0], y - 0.3, ir[1], ir[2], y + 0.05, ir[3])); col.floor(ir, y + 0.05);
}
// ── the stadium (and circus) ──────────────────────────────────────────────────

/**
 * An engaged column of the façade arcades, in its own frame turned by `yaw` and set at (x, z):
 * Ionic (an Attic base, the angular capital with a volute at each corner, as on the Temple of
 * Saturn) or Corinthian (two rows of acanthus round the bell, corner volutes, the abacus).
 */
function orderColumn(bag, kind, x, z, yaw, y0, H, d, mat) {
  const r = d / 2, parts = [];
  const plH = r * 0.45, bH = r * 0.5, capH = kind === 'corinthian' ? r * 2.2 : r * 0.9, shaftH = H - plH - bH - capH, top = r * 0.86;
  parts.push(box(-r * 1.3, 0, -r * 1.3, r * 1.3, plH, r * 1.3));
  parts.push(lathe([[r * 1.27, 0], [r * 1.28, bH * 0.3], [r * 1.12, bH * 0.42], [r * 1.06, bH * 0.6], [r * 1.16, bH * 0.72], [r * 1.1, bH * 0.92], [r * 1.0, bH]], 20, null, 0, plH, 0));
  const prof = [[r * 1.03, 0], [r, 0.1]];
  for (let i = 1; i <= 5; i++) { const t = i / 5; prof.push([r + (top - r) * Math.pow(t, 1.5), 0.1 + (shaftH - 0.22) * t]); }
  prof.push([top * 1.08, shaftH - 0.08], [top * 1.08, shaftH]);
  parts.push(lathe(prof, 20, null, 0, plH + bH, 0));
  const c0 = plH + bH + shaftH;
  if (kind === 'corinthian') {
    const leaves = (th, i, rr, yy) => {
      const row = yy < capH * 0.4 ? 0 : 1, ph = row ? Math.PI / 8 : 0;
      const tip = Math.max(0, Math.sin(Math.PI * (row ? (yy - capH * 0.32) / (capH * 0.4) : yy / (capH * 0.4))));
      return 1 + 0.15 * Math.pow(Math.abs(Math.cos((th + ph) * 4)), 0.6) * tip;
    };
    parts.push(lathe([[top, 0], [top * 1.04, capH * 0.15], [top * 1.1, capH * 0.4], [top * 1.18, capH * 0.6], [top * 1.3, capH * 0.78], [top * 1.36, capH * 0.84], [0.001, capH * 0.84]], 40, leaves, 0, c0, 0));
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + k * Math.PI / 2;
      parts.push(lathe([[0.001, 0], [r * 0.15, r * 0.08], [r * 0.18, r * 0.24], [r * 0.12, r * 0.36], [0.001, r * 0.4]], 8, null, Math.cos(a) * r * 1.45, c0 + capH * 0.66, Math.sin(a) * r * 1.45));
    }
    parts.push(frustum([-r * 1.42, -r * 1.42, r * 1.42, r * 1.42], c0 + capH * 0.84, c0 + capH, -r * 0.08, -r * 0.08, -r * 0.08, -r * 0.08));
  } else {
    // the echinus with its egg moulding, the angular volutes, the thin abacus
    parts.push(lathe([[top * 1.02, 0], [top * 1.18, capH * 0.25], [top * 1.26, capH * 0.5], [top * 1.2, capH * 0.62], [0.001, capH * 0.62]], 24, (th) => 1 + 0.04 * Math.cos(th * 16), 0, c0, 0));
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + k * Math.PI / 2, cx = Math.cos(a) * r * 1.12, cz = Math.sin(a) * r * 1.12;
      parts.push(rod([cx * 0.86, c0 + capH * 0.5, cz * 0.86], [cx * 1.18, c0 + capH * 0.5, cz * 1.18], r * 0.3, 10));
    }
    parts.push(box(-r * 1.38, c0 + capH * 0.62, -r * 1.38, r * 1.38, c0 + capH, r * 1.38));
  }
  put(bag, mat, mergeGeoms(parts), x, y0, z, yaw);
}

/** A piece built at the origin, turned by yaw and set at (x, y, z): one instanced shape where the bag instances. */
function put(bag, mat, g, x, y, z, yaw) {
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  if (bag.addInstance) bag.addInstance(mat, g, M, { reach: 900 });
  else bag.add(mat, g.applyMatrix4(M));
}

/**
 * stadium: { rect (long along z), y, h, depth (of the cavea), rows, curve ('n' | 's': the rounded
 * end), gates (carceres: a row of starting gates across the straight end instead of its seats, the
 * bronze horses over them) } — the Stadium of Domitian (docs/settlements/rome.md §4) and the
 * Hippodrome (docs/settlements/constantinople.md §4): tiers of seats on a podium round the arena; an
 * ambulatory behind them; the outer façade in two storeys of arcades of travertine on piers, an
 * engaged Ionic column on each pier below and a Corinthian one above, each storey under its
 * entablature, a parapet in the upper arches, an attic with pilasters on top.
 */
function stadium(el, ctx) {
  const { bag, col } = ctx;
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 16, t = el.depth ?? 26, rows = el.rows ?? 12, gates = el.gates ?? 0;
  // built with the curve at the north (−z); mirrored in z for a curve at the south
  const S = el.curve === 's', Z = (z) => (S ? z0 + z1 - z : z), P = ([x, z]) => [x, Z(z)], V = ([x, z]) => [x, S ? -z : z];
  const B = (xa, ya, za, xb, yb, zb) => box(Math.min(xa, xb), ya, Math.min(Z(za), Z(zb)), Math.max(xa, xb), yb, Math.max(Z(za), Z(zb)));
  const Rr = (r) => [Math.min(r[0], r[2]), Math.min(Z(r[1]), Z(r[3])), Math.max(r[0], r[2]), Math.max(Z(r[1]), Z(r[3]))];
  const ax0 = x0 + t, ax1 = x1 - t, rr = (ax1 - ax0) / 2, cx = (x0 + x1) / 2, cz = z0 + t + rr;
  const FT = 1.2, FD = Math.min(5.4, t * 0.3), sd = t - FD;               // façade thickness, ambulatory depth, cavea depth
  const T1 = y + (h - 2) / 2, T2 = y + h - 2, pod = Math.min(2.2, h * 0.12);
  const rowTop = (i) => y + pod + (T2 - y - pod) * (i + 1) / rows;
  const curveA = S ? [0, 180] : [180, 360];                               // the rounded end, degrees from +x toward +z
  // ── the cavea: the side tiers, the straight end's (unless the gates stand there), the curve's
  for (let i = 0; i < rows; i++) {
    const oIn = sd * i / rows, oOut = sd * (i + 1) / rows, yy = rowTop(i), zEnd = gates ? z1 - FD : z1 - t + oIn;
    for (const r of [[ax0 - oOut, cz, ax0 - oIn, zEnd], [ax1 + oIn, cz, ax1 + oOut, zEnd]]) { bag.add('travertine', B(r[0], y - 0.5, r[1], r[2], yy, r[3])); col.floor(Rr(r), yy); }
    if (!gates) { const r = [ax0 - oOut, z1 - t + oIn, ax1 + oOut, z1 - t + oOut]; bag.add('travertine', B(r[0], y - 0.5, r[1], r[2], yy, r[3])); col.floor(Rr(r), yy); }
    bag.add('travertine', arcSolid(cx, Z(cz), rr + oIn, rr + oOut, curveA[0], curveA[1], y - 0.5, yy, 3));
  }
  bag.add('ground', B(ax0, y - 0.3, cz - rr, ax1, y + 0.02, z1 - t));
  // ── the façade's centre line in bays of about 6.4 m, the curve as a polygon (local frame)
  const m = FT / 2, Rf = (x1 - x0) / 2 - m, pts = [];
  const run = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 6.4)); for (let i = 0; i < n; i++) pts.push({ p: [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n], straight: true }); };
  run([x0 + m, cz], [x0 + m, z1 - m]); run([x0 + m, z1 - m], [x1 - m, z1 - m]); run([x1 - m, z1 - m], [x1 - m, cz]);
  { const n = Math.round(Math.PI * Rf / 6.4); for (let i = 0; i < n; i++) { const a = -(Math.PI * i / n); pts.push({ p: [cx + Math.cos(a) * Rf, cz + Math.sin(a) * Rf], straight: false }); } }
  const N = pts.length, C = [cx, (cz + z1) / 2];
  const bays = pts.map((q, i) => {
    const a = q.p, b = pts[(i + 1) % N].p, L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let o = [-u[1], u[0]];
    if (o[0] * (mid[0] - C[0]) + o[1] * (mid[1] - C[1]) < 0) o = [-o[0], -o[1]];
    return { a, b, L, u, o, mid, straight: q.straight };
  });
  // straight runs merged (for the entablatures, the attic and the slabs); the curve's bays one by one
  const segs = [];
  for (const bb of bays) {
    const last = segs[segs.length - 1];
    if (bb.straight && last?.straight && Math.abs(last.u[0] - bb.u[0]) < 1e-6 && Math.abs(last.u[1] - bb.u[1]) < 1e-6) last.b = bb.b;
    else segs.push({ a: bb.a, b: bb.b, u: bb.u, o: bb.o, straight: bb.straight });
  }
  const at = (p, d, s = 0, u = [0, 0]) => P([p[0] + d[0] * s + u[0], p[1] + d[1] * s + u[1]]);
  const along = (p, u, s) => [p[0] + u[0] * s, p[1] + u[1] * s];
  // the pier directions at each vertex (the mean of its two bays)
  const piers = bays.map((bb, i) => {
    const pv = bays[(i - 1 + N) % N], nrm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
    return { v: bb.a, du: nrm([bb.u[0] + pv.u[0], bb.u[1] + pv.u[1]]), dn: nrm([bb.o[0] + pv.o[0], bb.o[1] + pv.o[1]]), corner: Math.abs(bb.u[0] * pv.u[0] + bb.u[1] * pv.u[1]) < 0.5 };
  });
  const EH = 1.05, tiers = [[y - 0.5, T1, 'ionic', 0.9], [T1, T2, 'corinthian', 0.78]];
  tiers.forEach(([yb, yt, kind, d], k) => {
    const ch = yt - yb - EH;
    for (const bb of bays) {
      const r = Math.min(1.95, (bb.L - 2.6) / 2), spring = yt - EH - r - 0.65, o = P(bb.a), w = P(bb.b), u = V(bb.u);
      put(bag, 'travertine', planarWall({ o: [0, 0], u: [1, 0], th: FT, u0: 0, u1: +bb.L.toFixed(3), y0: yb, y1: yb + ch, arches: [{ uc: +(bb.L / 2).toFixed(3), r, spring, sill: k ? yb : undefined }] }), o[0], 0, o[1], Math.atan2(-u[1], u[0]));
      if (k === 0) {
        const s = bb.L / 2 - r;
        col.segment(o, [o[0] + u[0] * s, o[1] + u[1] * s], FT, yb, yt);
        col.segment([w[0] - u[0] * s, w[1] - u[1] * s], w, FT, yb, yt);
      } else bag.add('travertine', orientedBox(P(along(bb.mid, bb.u, -r)), P(along(bb.mid, bb.u, r)), 0.4, yb, yb + 1.0));   // the parapet in the upper arch
      // the keystone
      const kc = along(bb.mid, bb.o, FT / 2 + 0.04);
      bag.add('travertine', orientedBox(P(along(kc, bb.u, -0.28)), P(along(kc, bb.u, 0.28)), 0.2, spring + r - 0.15, spring + r + 0.5));
    }
    for (const pr of piers) {
      const pw = pr.corner ? FT + 0.3 : 1.25;
      bag.add('travertine', orientedBox(P(along(pr.v, pr.du, -pw / 2)), P(along(pr.v, pr.du, pw / 2)), FT + 0.3, yb, yb + ch));
      if (pr.corner) continue;
      const c = P(along(pr.v, pr.dn, FT / 2 + 0.15)), du = V(pr.du);
      orderColumn(bag, kind, c[0], c[1], -Math.atan2(du[1], du[0]), k ? yb : y, k ? ch : ch - (y - yb), d, 'travertine');
    }
    // the entablature: architrave, frieze, cornice
    for (const [e0, e1, pr] of [[0, 0.38, 0.18], [0.38, 0.7, 0.12], [0.7, EH, 0.45]]) {
      for (const sg of segs) bag.add('travertine', orientedBox(P(sg.a), P(sg.b), FT + 0.3 + pr * 2, yt - EH + e0, yt - EH + e1, sg.straight ? (FT + 0.3) / 2 + pr : 0.18));
    }
  });
  // the attic: a solid band with a pilaster over each pier, its cornice
  for (const sg of segs) {
    const ext = sg.straight ? (FT + 0.3) / 2 : 0.15;
    bag.add('travertine', orientedBox(P(sg.a), P(sg.b), FT, T2, T2 + 2.0, ext));
    bag.add('travertine', orientedBox(P(sg.a), P(sg.b), FT + 0.6, T2 + 2.0, T2 + 2.35, ext + 0.3));
  }
  for (const pr of piers) if (!pr.corner) {
    const c = along(pr.v, pr.dn, 0.15);
    bag.add('travertine', orientedBox(P(along(c, pr.du, -0.4)), P(along(c, pr.du, 0.4)), FT, T2, T2 + 2.0));
  }
  // ── the ambulatory: the gallery floor and the roof slab over it; a dark door into the cavea in every bay
  const back = FD - m, amb = (m + back) / 2, aw = back - m + 0.3;
  for (const sg of segs) {
    const a = at(sg.a, sg.o, -amb), b = at(sg.b, sg.o, -amb), ext = sg.straight ? 0 : 0.3;
    bag.add('travertine', orientedBox(a, b, aw, T1 - 0.6, T1, ext));
    bag.add('travertine', orientedBox(a, b, aw, T2 - 0.5, T2, ext));
  }
  for (const bb of bays) {
    const c = along(bb.mid, bb.o, -(back - 0.02));
    for (const [ya, yb] of [[y, y + 3.2], [T1, T1 + 2.8]]) bag.add('opening', orientedBox(P(along(c, bb.u, -1.0)), P(along(c, bb.u, 1.0)), 0.1, ya, yb));
    col.segment(P(along(bb.a, bb.o, -back)), P(along(bb.b, bb.o, -back)), 0.3, y, T2);
  }
  // ── the carceres: the stalls with their arched gates toward the arena, the four bronze horses above
  if (gates) {
    const za = z1 - t, zb = z1 - FD, Hc = T1 + 0.6, W = ax1 - ax0, gw = W / gates, sr = Math.min(1.7, gw * 0.34), sp = y + 3.4, top = sp + sr + 0.3, sd2 = 6;
    bag.add('brick', planarWall({ o: P([ax0, za]), u: [1, 0], th: 1.0, u0: 0, u1: W, y0: y - 0.5, y1: Hc, arches: Array.from({ length: gates }, (_, i) => ({ uc: gw * (i + 0.5), r: sr, spring: sp })) }));
    for (let i = 1; i < gates; i++) orderColumn(bag, 'ionic', ax0 + gw * i, Z(za - 0.65), 0, y, top - y, 0.6, 'marble');
    bag.add('marble', B(ax0 - 0.2, top, za - 1.0, ax1 + 0.2, top + 0.6, za - 0.5));
    for (let i = 0; i <= gates; i++) { const px = ax0 + gw * i; bag.add('brick', B(px - 0.35, y - 0.5, za + 0.5, px + 0.35, top, za + sd2)); col.rect(Rr([px - 0.35, za - 0.5, px + 0.35, za + sd2]), y, Hc); }
    bag.add('brick', B(ax0, top, za + 0.5, ax1, Hc, za + sd2));
    bag.add('brick', B(ax0, y - 0.5, za + sd2, ax1, Hc, zb)); col.rect(Rr([ax0, za + sd2, ax1, zb]), y, Hc);
    bag.add('marble', B(ax0, Hc, za - 0.5, ax1, Hc + 1.0, za + 0.1));
    const mx = (ax0 + ax1) / 2, pz = za + 3;
    bag.add('marble', B(mx - 3.4, Hc, pz - 1.6, mx + 3.4, Hc + 1.6, pz + 1.6));
    bag.add('marble', B(mx - 3.6, Hc + 1.6, pz - 1.8, mx + 3.6, Hc + 1.85, pz + 1.8));
    const horse = STYLES.life?.elements?.animal;
    if (horse) {
      // the horses of gilded copper (now at San Marco), as one bronze group: every piece in the one metal
      const gild = { add: (_m, g) => bag.add('gilt_bronze', g) }, none = { circle() {}, rect() {}, segment() {} };
      for (let i = 0; i < 4; i++) horse({ kind: 'horse', at: [mx - 2.4 + i * 1.6, Z(pz + (i === 1 || i === 2 ? -0.25 : 0.2))], y: Hc + 1.85, rot: (S ? Math.PI : 0) + (i - 1.5) * 0.12, s: 1.05, seed: 7 + i, mat: 'gilt_bronze' }, { bag: gild, col: none });
    }
  }
}
Object.assign(STYLES.roman.elements, { insula, thermae, porticus, stadium });
