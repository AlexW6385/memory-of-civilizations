// The Süleymaniye's külliye about 1560 (docs/settlements/ottoman-istanbul.md §4.4–§4.8): the four
// medreses with their porticoed courts, cells with hearths and chimneys and the domed dershane; the
// darüşşifa (hospital) of two courts; the imaret (soup kitchen) with its lantern-domed kitchens and
// bread ovens; the dar'ül-hadis, a bent row of cells in banded stone and brick; the hamam; the
// vaulted shops (arasta) along the avenues.
//
// Most of them are built on one module grid (cells, portico bays and court squares of m metres):
// the units (rooms and cells, solid blocks under domes), the portico bays (a dome over each, pointed
// arches on columns toward the court) and the open court are told apart on the grid, so that doors
// and windows go where a unit meets the portico or the outside, and arches where a bay meets the court.

import { box, lathe, fromTriangles, rod, disc, place } from '../../core/geom.js';
import { dome, arcadeWall, bayDome, dblT, pointedArc } from './index.js';

const S = 'limestone', L = 'lead', M = 'marble_smooth';

/** A frame: local metres (a, b) → world (x, z); flip mirrors a (a then grows toward −x). */
function frame(bag, ox, oz, flip = false) {
  const X = (a) => (flip ? ox - a : ox + a), Z = (b) => oz + b;
  const R = (a0, b0, a1, b1) => [Math.min(X(a0), X(a1)), Math.min(Z(b0), Z(b1)), Math.max(X(a0), X(a1)), Math.max(Z(b0), Z(b1))];
  const B = (mat, a0, y0, b0, a1, y1, b1) => { const r = R(a0, b0, a1, b1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  return { X, Z, R, B, P: (a, b) => [X(a), Z(b)], flip };
}
// the faces of a rect in local metres: the axis across the face (0: a, 1: b), the coordinate, the outward sign
const FACES = { w: [0, 0, -1], e: [0, 2, 1], n: [1, 1, -1], s: [1, 3, 1] };
const STEP = { w: [-1, 0], e: [1, 0], n: [0, -1], s: [0, 1] };
/** A box on a face: u along it, d outward from it (negative into the wall). */
function onFace(F, face, at, u0, u1, d0, d1, y0, y1, mat) {
  const [ax, , sg] = FACES[face], p0 = at + sg * d0, p1 = at + sg * d1;
  return ax === 0 ? F.B(mat, Math.min(p0, p1), y0, u0, Math.max(p0, p1), y1, u1) : F.B(mat, u0, y0, Math.min(p0, p1), u1, y1, Math.max(p0, p1));
}
/** A window with a marble frame and an iron grille: w wide, from ya to yb, centred at u. */
function grilledWindow(F, face, at, u, w, ya, yb, inner = null) {
  const h = w / 2;
  onFace(F, face, at, u - h, u + h, -0.06, 0.02, ya, yb, 'opening');
  onFace(F, face, at, u - h - 0.14, u - h, 0, 0.1, ya - 0.15, yb + 0.2, M); onFace(F, face, at, u + h, u + h + 0.14, 0, 0.1, ya - 0.15, yb + 0.2, M);
  onFace(F, face, at, u - h - 0.2, u + h + 0.2, 0, 0.14, ya - 0.15, ya, M); onFace(F, face, at, u - h - 0.14, u + h + 0.14, 0, 0.12, yb, yb + 0.2, M);
  const nb = Math.max(2, Math.round(w / 0.24));
  for (let g = 1; g < nb; g++) { const v = u - h + g * w / nb; onFace(F, face, at, v - 0.018, v + 0.018, 0.02, 0.06, ya, yb, 'iron'); }
  onFace(F, face, at, u - h, u + h, 0.02, 0.06, (ya + yb) / 2 - 0.018, (ya + yb) / 2 + 0.018, 'iron');
  if (inner != null) onFace(F, face, at - FACES[face][2] * inner, u - h, u + h, -0.02, 0.02, ya, yb, 'daylight');
}
/** A small pointed window (the upper light): its rectangle and the stepped head. */
function pointedLight(F, face, at, u, w, ya, yb) {
  onFace(F, face, at, u - w / 2, u + w / 2, -0.06, 0.02, ya, yb, 'opening');
  for (let s = 0; s < 3; s++) { const k = w / 2 * (1 - (s + 1) * 0.26); onFace(F, face, at, u - k, u + k, -0.06, 0.02, yb + s * w * 0.17, yb + (s + 1) * w * 0.17, 'opening'); }
  onFace(F, face, at, u - w / 2 - 0.12, u + w / 2 + 0.12, 0, 0.1, ya - 0.12, ya, M);
}
/** A door: the dark leaf-way, its marble jambs and lintel, a relieving arch of voussoirs over it. */
function doorway(F, face, at, u, w, y, h, dark = true) {
  if (dark) onFace(F, face, at, u - w / 2, u + w / 2, -0.06, 0.02, y, y + h, 'opening');
  onFace(F, face, at, u - w / 2 - 0.18, u - w / 2, 0, 0.1, y, y + h, M); onFace(F, face, at, u + w / 2, u + w / 2 + 0.18, 0, 0.1, y, y + h, M);
  onFace(F, face, at, u - w / 2 - 0.18, u + w / 2 + 0.18, 0, 0.14, y + h, y + h + 0.3, M);
  for (let s = 0; s < 3; s++) { const k = (w / 2 + 0.1) * (1 - s * 0.3); onFace(F, face, at, u - k, u + k, 0, 0.06, y + h + 0.3 + s * 0.22, y + h + 0.52 + s * 0.22, s % 2 ? 'granite_red' : M); }
}
/** A dome over a square of side w on a low octagonal drum, from y. lantern: a small open lantern in place of the finial (a kitchen's smoke vent); oculi: rings of glass bulbs (a bath's). */
function cupola(bag, x, y, z, w, { lantern = false, oculi = false, k = 0.4, drum = 0.5 } = {}) {
  const r = k * w;
  bag.add(S, lathe([[r * 1.14, 0], [r * 1.14, drum], [r * 0.96, drum]], 8).rotateY(Math.PI / 8).translate(x, y, z));
  if (!lantern) { dome(bag, x, y + drum, z, r); }
  else {
    const y0 = y + drum;
    bag.add(S, lathe([[r * 1.04, 0], [r * 1.04, r * 0.22], [r * 0.98, r * 0.28]], 24, null, x, y0, z));
    bag.add(L, lathe([[r, 0], [r * 0.94, r * 0.3], [r * 0.78, r * 0.6], [r * 0.5, r * 0.85], [r * 0.3, r * 0.93]], 24, null, x, y0 + r * 0.26, z));
    // the lantern: posts round an opening, a lead cap
    const yl = y0 + r * 0.26 + r * 0.93, rl = r * 0.3;
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; bag.add(S, box(x + Math.cos(a) * rl - 0.09, yl, z + Math.sin(a) * rl - 0.09, x + Math.cos(a) * rl + 0.09, yl + 0.7, z + Math.sin(a) * rl + 0.09)); }
    bag.add('opening', lathe([[rl - 0.02, 0], [rl - 0.02, 0.7]], 12, null, x, yl, z));
    bag.add(L, lathe([[rl + 0.2, 0], [rl * 0.5, 0.35], [0.001, 0.6]], 12, null, x, yl + 0.7, z));
  }
  if (oculi) {
    const y0 = y + drum + r * 0.26;
    for (const [rr, yy, n] of [[0.86, 0.45, 14], [0.6, 0.76, 9], [0.3, 0.92, 5]]) for (let i = 0; i < n; i++) { const a = (i + 0.5 * (n % 2)) / n * Math.PI * 2; bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.1], [0.001, 0.13]], 6, null, x + Math.cos(a) * r * rr, y0 + r * yy - 0.04, z + Math.sin(a) * r * rr)); }
  }
}
/** A column of a portico: marble base, shaft, a capital of stepped cells (muqarnas), the abacus. */
function porticoColumn(bag, col, x, z, y, hs, mat = M) {
  bag.add(M, box(x - 0.4, y, z - 0.4, x + 0.4, y + 0.2, z + 0.4));
  bag.add(M, lathe([[0.34, 0], [0.34, 0.1], [0.28, 0.18], [0.26, 0.24]], 12, null, x, y + 0.2, z));
  bag.add(mat, lathe([[0.25, 0], [0.22, hs - 1.1]], 12, null, x, y + 0.44, z));
  const cells = (t) => 1 + 0.07 * Math.cos(t * 12);
  bag.add(M, lathe([[0.26, 0], [0.26, 0.08], [0.24, 0.1], [0.32, 0.26], [0.32, 0.3], [0.38, 0.46], [0.38, 0.5]], 12, cells, x, y + hs - 0.66, z));
  bag.add(M, box(x - 0.43, y + hs - 0.16, z - 0.43, x + 0.43, y + hs, z + 0.43));
  col.circle(x, z, 0.3, y, y + hs);
}

/**
 * Units, portico bays and court on a module grid (see the file's head). g: { F, m, y, H (the units'
 * walls), hs (the columns' height), top (the portico's walls), units: [{ r: [i0, j0, i1, j1], chimney,
 * door, dome ('each' | 'one' | 'none'), lantern, H }], bays: [[i, j]], courts: [[i0, j0, i1, j1]],
 * solid: [{ r, kind }] (built by the caller), noWin: faces of the whole without lower windows,
 * banded (stone and brick in courses), eaves ('kirpi': brick sawtooth) }.
 */
function grid(ctx, g) {
  const { bag, col } = ctx, { F, m, y } = g, top = g.top, hs = g.hs, cells = new Map(), key = (i, j) => i + ',' + j;
  g.units.forEach((u, k) => { for (let i = u.r[0]; i < u.r[2]; i++) for (let j = u.r[1]; j < u.r[3]; j++) cells.set(key(i, j), 'U' + k); });
  for (const [i, j] of g.bays) cells.set(key(i, j), 'P');
  for (const c of g.courts) for (let i = c[0]; i < c[2]; i++) for (let j = c[1]; j < c[3]; j++) if (!cells.has(key(i, j))) cells.set(key(i, j), 'C');
  for (const s of g.solid || []) for (let i = s.r[0]; i < s.r[2]; i++) for (let j = s.r[1]; j < s.r[3]; j++) cells.set(key(i, j), s.kind);
  const T = (i, j) => cells.get(key(i, j)) ?? null;
  const open = (t) => t === 'C' || t === 'P';
  // the floor of the courts and porticoes
  for (const c of g.courts) { const r = F.R(c[0] * m, c[1] * m, c[2] * m, c[3] * m); bag.add('marble_floor', box(r[0], y - 0.3, r[1], r[2], y + 0.08, r[3])); col.floor(r, y + 0.08); }
  for (const [i, j] of g.bays) { if (g.courts.some((c) => i >= c[0] && i < c[2] && j >= c[1] && j < c[3])) continue; const r = F.R(i * m, j * m, (i + 1) * m, (j + 1) * m); bag.add('marble_floor', box(r[0], y - 0.3, r[1], r[2], y + 0.08, r[3])); col.floor(r, y + 0.08); }
  // the units
  g.units.forEach((u, k) => {
    const [i0, j0, i1, j1] = u.r, H = y + (u.H ?? g.H), a0 = i0 * m, b0 = j0 * m, a1 = i1 * m, b1 = j1 * m;
    if (g.banded) { for (let yy = y - 0.5, s = 0; yy < H - 1e-6; s++) { const t = Math.min(H, yy + (s % 2 ? 0.2 : 0.36)); F.B(s % 2 ? 'brick' : S, a0, yy, b0, a1, t, b1); yy = t; } }
    else F.B(S, a0, y - 0.5, b0, a1, H, b1);
    col.rect(F.R(a0, b0, a1, b1), y, H);
    // the faces: windows outside, a door and windows toward the portico or court; the cornice outside
    let doorDone = !(u.door ?? true), outFace = null;
    const cu = [(i0 + i1) / 2, (j0 + j1) / 2];
    const modules = [];
    for (const f of 'nsew') {
      const [ax, ci, sg] = FACES[f], at = u.r[ci] * m, [di, dj] = STEP[f];
      const run = ax === 0 ? [j0, j1] : [i0, i1];
      for (let q = run[0]; q < run[1]; q++) {
        const ci2 = ax === 0 ? (sg < 0 ? i0 - 1 : i1) : q, cj2 = ax === 0 ? q : (sg < 0 ? j0 - 1 : j1), t = T(ci2, cj2);
        modules.push({ f, at, q, t, d: Math.hypot((ax === 0 ? i0 : q) + 0.5 - cu[0] + di * 0.5, (ax === 0 ? q : j0) + 0.5 - cu[1] + dj * 0.5) });
      }
    }
    // the door where the unit meets the court nearest its middle
    const toCourt = modules.filter((md) => open(md.t)).sort((p, q2) => p.d - q2.d);
    for (const md of modules) {
      const { f, at, q, t } = md, u0 = q * m, uc = u0 + m / 2;
      if (t === null) {
        outFace ??= md;
        const noLow = g.noWin && g.noWin.includes(f);
        if (!noLow && H - y > 5) for (const s2 of [-1, 1]) grilledWindow(F, f, at, uc + s2 * m * 0.23, m * 0.18, y + 1.0, y + 2.3);
        if (H - y > 5.4) pointedLight(F, f, at, uc, m * 0.12, y + 3.3, y + 4.2);
        onFace(F, f, at, u0, u0 + m, 0, 0.16, H - 0.34, H, S);
        if (g.eaves === 'kirpi') {
          onFace(F, f, at, u0, u0 + m, 0.16, 0.22, H - 0.34, H - 0.27, 'brick');
          for (let v = u0 + 0.14; v < u0 + m - 0.1; v += 0.28) { const [ax2] = FACES[f]; const pa = ax2 === 0 ? [at + FACES[f][2] * 0.22, v] : [v, at + FACES[f][2] * 0.22]; bag.add('brick', place(box(-0.1, 0, -0.1, 0.1, 0.07, 0.1), F.X(pa[0]), H - 0.27, F.Z(pa[1]), Math.PI / 4)); }
        }
      } else if (open(t)) {
        if (!doorDone && md === toCourt[0]) { doorDone = true; doorway(F, f, at, uc - m * 0.16, Math.min(1.05, m * 0.25), y + 0.08, 2.1); grilledWindow(F, f, at, uc + m * 0.22, m * 0.15, y + 1.0, y + 2.1); }
        else grilledWindow(F, f, at, uc, m * 0.17, y + 1.0, y + 2.2);
      }
    }
    // the domes, and the chimney of the hearth at the outer wall between them
    const dm = u.dome ?? 'each';
    if (dm === 'one') cupola(bag, F.X((a0 + a1) / 2), H, F.Z((b0 + b1) / 2), Math.min(a1 - a0, b1 - b0), { lantern: u.lantern, k: 0.42 });
    else if (dm === 'each') for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) cupola(bag, F.X((i + 0.5) * m), H, F.Z((j + 0.5) * m), m, { lantern: u.lantern });
    if (u.chimney && outFace) {
      const { f, at, q } = outFace, [ax, , sg] = FACES[f], v = q * m + m - 0.42, dd = at - sg * 0.5;
      const [pa, pb] = ax === 0 ? [dd, v] : [v, dd], x = F.X(pa), z = F.Z(pb);
      bag.add(S, box(x - 0.33, H - 0.1, z - 0.33, x + 0.33, H + 2.0, z + 0.33));
      bag.add(S, box(x - 0.4, H + 1.6, z - 0.4, x + 0.4, H + 1.75, z + 0.4));
      for (const [ox, oz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) bag.add('opening', box(x + ox * 0.33 - (ox ? 0.02 * ox : 0.14), H + 1.78, z + oz * 0.33 - (oz ? 0.02 * oz : 0.14), x + ox * 0.33 + (ox ? 0.02 * ox : 0.14), H + 1.98, z + oz * 0.33 + (oz ? 0.02 * oz : 0.14)));
      bag.add(L, lathe([[0.56, 0], [0.001, 0.5]], 4).rotateY(Math.PI / 4).translate(x, H + 2.0, z));
    }
  });
  // the portico: a dome over each bay, arches toward the court on columns and across between the bays
  const solidAt = (pi, pj) => [[pi - 1, pj - 1], [pi, pj - 1], [pi - 1, pj], [pi, pj]].some(([i, j]) => !open(T(i, j)));
  const colDone = new Set();
  const arch = (pa, pb, th) => {
    const A = F.P(pa[0] * m, pa[1] * m), Bp = F.P(pb[0] * m, pb[1] * m), oa = solidAt(...pa) ? 0 : 0.42, ob = solidAt(...pb) ? 0 : 0.42;
    arcadeWall(bag, A, Bp, [[oa, m - ob]], y + hs, y + hs, y + top, th, S);
    for (const p of [pa, pb]) if (!solidAt(...p) && !colDone.has(key(...p))) { colDone.add(key(...p)); const [x, z] = F.P(p[0] * m, p[1] * m); porticoColumn(bag, col, x, z, y, hs); }
  };
  for (const [i, j] of g.bays) {
    bayDome(bag, F.X((i + 0.5) * m), y + top, F.Z((j + 0.5) * m), m / 2, m / 2);
    for (const f of 'nsew') {
      const [di, dj] = STEP[f], t = T(i + di, j + dj);
      const edge = f === 'n' ? [[i, j], [i + 1, j]] : f === 's' ? [[i, j + 1], [i + 1, j + 1]] : f === 'w' ? [[i, j], [i, j + 1]] : [[i + 1, j], [i + 1, j + 1]];
      if (t === 'C') arch(edge[0], edge[1], 0.6);
      else if (t === 'P' && (di > 0 || dj > 0) && !(g.cut && g.cut(i, j, f))) arch(edge[0], edge[1], 0.5);
    }
  }
  return { T, cells };
}

/** A portal on a face: piers standing out d, the niche with a hood of muqarnas, the inscription panel, the door. */
function portal(F, col, face, at, u, y, w, h, d = 0.9, door = 2.2, dark = true) {
  const [ax, , sg] = FACES[face], hw = w / 2;
  for (const s2 of [-1, 1]) { const r = onFace(F, face, at, s2 < 0 ? u - hw : u + door / 2 + 0.25, s2 < 0 ? u - door / 2 - 0.25 : u + hw, 0, d, y - 0.5, y + h, S); col.rect(r, y, y + h); }
  onFace(F, face, at, u - door / 2 - 0.25, u + door / 2 + 0.25, 0, d, y + h - 1.0, y + h, S);
  onFace(F, face, at, u - hw - 0.15, u + hw + 0.15, 0, d + 0.2, y + h, y + h + 0.35, S);
  // the hood: tiers of cells stepping out from the back of the niche to the face
  for (let k = 0; k < 4; k++) {
    const yy = y + h - 1.0 - (4 - k) * 0.42, out = d * (k + 1) / 5, n = 5 - Math.floor(k / 2) * 2, ww = door + 0.5;
    for (let i = 0; i < n; i++) { const u0 = u - ww / 2 + i * ww / n + 0.03, u1 = u - ww / 2 + (i + 1) * ww / n - 0.03; onFace(F, face, at, u0, u1, 0, out, yy, yy + 0.42, M); }
  }
  // the door, the panel of script over it
  const yd = y + 3.2;
  if (dark) onFace(F, face, at, u - door / 2, u + door / 2, -0.04, 0.02, y + 0.08, yd, 'opening');
  onFace(F, face, at, u - door / 2 - 0.12, u + door / 2 + 0.12, 0, 0.16, yd, yd + 0.3, M);
  const yp = yd + 0.4, yq = y + h - 1.0 - 4 * 0.42 - 0.08;
  if (yq - yp > 0.4) { onFace(F, face, at, u - door / 2, u + door / 2, 0, 0.04, yp, yq, 'glaze_white'); onFace(F, face, at, u - door / 2 + 0.12, u + door / 2 - 0.12, 0.04, 0.06, yp + 0.1, yq - 0.1, 'tile_lapis'); }
  return ax;
}

/** A gate's way through the rooms: [a0, a1] × [b0, b1] local, vaulted over at 3.9 m, jambs narrowing it to the door, the portal outside on face e at a1. */
function gateway(ctx, F, a0, a1, b0, b1, y, H, ph) {
  const { col } = ctx, door = 2.2, bc = (b0 + b1) / 2;
  F.B(S, a0, y + 3.9, b0, a1, y + H, b1);
  F.B('marble_floor', a0, y - 0.3, b0, a1, y + 0.08, b1); ctx.col.floor(F.R(a0, b0, a1, b1), y + 0.08);
  for (const [p, q] of [[b0, bc - door / 2], [bc + door / 2, b1]]) { const r = F.B(S, a0 + 0.3, y - 0.5, p, a1, y + 3.9, q); col.rect(r, y, y + 3.9); }
  F.B(M, a1 - 0.5, y + 3.2, bc - door / 2, a1, y + 3.9, bc + door / 2);
  portal(F, col, 'e', a1, bc, y, 6.4, ph, 0.9, door, false);
}
/**
 * kulliye_medrese: { rect (square, 11 modules), y, m, out ('w' | 'e': the side away from the mosque, where
 * the dershane stands out), shopFace (no lower windows on the mosque side, the shops before it) } — one of the
 * four medreses of the Süleymaniye (§4.4): a near-square court, porticoes of domed bays on three sides,
 * 24 domed cells with hearths behind them, the domed dershane standing out on the far side and cutting the
 * portico, entered from the portico on both sides; on the mosque side the three-domed eyvan of three arches
 * and the gate behind it.
 */
function medrese(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, m = el.m ?? 4.2, [x0, z0, x1] = el.rect, flip = el.out === 'e';
  const F = frame(bag, flip ? x1 : x0, z0, flip), H = 6.6, top = 5.9, hs = 3.3;
  const units = [], bays = [];
  const U = (i0, j0, i1, j1, o = {}) => units.push({ r: [i0, j0, i1, j1], chimney: true, door: true, ...o });
  for (const [i, j] of [[0, 0], [0, 10], [10, 0], [10, 10]]) U(i, j, i + 1, j + 1, { chimney: false, door: false });
  for (let i = 1; i < 10; i++) { U(i, 0, i + 1, 1); U(i, 10, i + 1, 11); bays.push([i, 1], [i, 9]); }
  for (const j of [1, 2, 3, 7, 8, 9]) U(0, j, 1, j + 1);
  for (const j of [2, 3, 7, 8]) bays.push([1, j]);
  U(9, 2, 11, 4, { chimney: false, dome: 'one' }); U(9, 7, 11, 9, { chimney: false, dome: 'one' });
  U(10, 1, 11, 2, { chimney: false }); U(10, 9, 11, 10, { chimney: false }); U(10, 4, 11, 5, { chimney: false }); U(10, 6, 11, 7, { chimney: false });
  bays.push([9, 4], [9, 5], [9, 6]);
  grid(ctx, { F, m, y, H, hs, top, units, bays, courts: [[2, 2, 9, 9]], solid: [{ r: [0, 4, 2, 7], kind: 'D' }, { r: [10, 5, 11, 6], kind: 'G' }], noWin: el.shopFace ? 'e' : '' });
  // the gate: a vaulted passage under the rooms, the inner jambs, the portal outside
  gateway(ctx, F, 10 * m, 11 * m, 5 * m, 6 * m, y, H, H + 1.4);
  // the pool in the court
  const pc = [5.5 * m, 5.5 * m];
  for (const [p0, q0, p1, q1] of [[-1.7, -1.7, 1.7, -1.4], [-1.7, 1.4, 1.7, 1.7], [-1.7, -1.4, -1.4, 1.4], [1.4, -1.4, 1.7, 1.4]]) F.B(M, pc[0] + p0, y + 0.08, pc[1] + q0, pc[0] + p1, y + 0.62, pc[1] + q1);
  F.B('water', pc[0] - 1.4, y + 0.08, pc[1] - 1.4, pc[0] + 1.4, y + 0.48, pc[1] + 1.4);
  col.rect(F.R(pc[0] - 1.7, pc[1] - 1.7, pc[0] + 1.7, pc[1] + 1.7), y, y + 0.62);
  dershane(ctx, F, { a0: 2 * m - 12.6, a1: 2 * m, b0: 4 * m, b1: 7 * m, y, doors: [[1.5 * m, 'n'], [1.5 * m, 's']], outA: 0 });
}

/** The dershane: a square hall of walls 1.5 m thick, the octagonal drum with eight windows, the lead dome; inside the plastered dome, a carpet, the teacher's raised seat and the students' reading stands. */
function dershane(ctx, F, d) {
  const { bag, col } = ctx, { a0, a1, b0, b1, y } = d, T = 1.5, Hw = y + 7.6, ca = (a0 + a1) / 2, cb = (b0 + b1) / 2, ri = (a1 - a0) / 2 - T;
  const dw = 1.1, gaps = { n: [], s: [], w: [], e: [] };
  for (const [u, f] of d.doors) gaps[f].push(u);
  const wallRun = (f, p0, p1, q0, q1, along) => {
    // along: 'a' (n/s walls) or 'b' (w/e walls); door gaps at the given u
    const cuts = gaps[f].map((u) => [u - dw / 2, u + dw / 2]).sort((p, q) => p[0] - q[0]);
    let s = along === 'a' ? p0 : q0; const e = along === 'a' ? p1 : q1;
    const seg = (u0, u1, ya, yb) => { const r = along === 'a' ? F.B(S, u0, ya, q0, u1, yb, q1) : F.B(S, p0, ya, u0, p1, yb, u1); if (ya < y + 0.1) col.rect(r, y, yb); };
    for (const [c0, c1] of cuts) { seg(s, c0, y - 0.5, Hw); seg(c0, c1, y + 2.5, Hw); s = c1; }
    seg(s, e, y - 0.5, Hw);
  };
  wallRun('n', a0, a1, b0, b0 + T, 'a'); wallRun('s', a0, a1, b1 - T, b1, 'a');
  wallRun('w', a0, a0 + T, b0 + T, b1 - T, 'b'); wallRun('e', a1 - T, a1, b0 + T, b1 - T, 'b');
  for (const [u, f] of d.doors) { const at = f === 'n' ? b0 : b1; doorway(F, f, at, u, dw, y + 0.08, 2.3); }
  // windows: three on the far face, one on each side face where it stands out, two toward the court
  const win = (f, at, u, inner) => { grilledWindow(F, f, at, u, 1.0, y + 1.0, y + 2.5, inner); pointedLight(F, f, at, u, 0.7, y + 4.2, y + 5.5); };
  const fw = 'w';
  for (const u of [cb - 3.4, cb, cb + 3.4]) win(fw, a0, u, T);
  for (const f of ['n', 's']) win(f, f === 'n' ? b0 : b1, (a0 + d.outA) / 2, T);
  for (const u of [cb - 2.6, cb + 2.6]) win('e', a1, u, T);
  // cornice; the transition to the octagon (the corners of the square inside), the drum, the dome
  for (const [f, at, u0, u1] of [['n', b0, a0, a1], ['s', b1, a0, a1], ['w', a0, b0, b1], ['e', a1, b0, b1]]) onFace(F, f, at, u0 - 0.16, u1 + 0.16, 0, 0.16, Hw - 0.4, Hw, S);
  F.B(S, a0, Hw - 0.3, b0, a1, Hw, b0 + T); F.B(S, a0, Hw - 0.3, b1 - T, a1, Hw, b1);
  const x = F.X(ca), z = F.Z(cb), rc = ri / Math.cos(Math.PI / 8), ro = (ri + 0.9) / Math.cos(Math.PI / 8), hd = 1.8;
  // the corners of the square inside, bridged to the octagon (stone, plastered below)
  const fan = [];
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2, C = [x + Math.cos(a) * ri * Math.SQRT2, z + Math.sin(a) * ri * Math.SQRT2], P0 = [x + Math.cos(a - Math.PI / 8) * rc, z + Math.sin(a - Math.PI / 8) * rc], P1 = [x + Math.cos(a + Math.PI / 8) * rc, z + Math.sin(a + Math.PI / 8) * rc];
    prism(bag, S, [C, P0, P1], Hw - 0.34, Hw);
    fan.push(C[0], Hw - 0.36, C[1], P0[0], Hw - 0.36, P0[1], P1[0], Hw - 0.36, P1[1]);
  }
  bag.add('stucco', dblT(fan));
  bag.add(S, lathe([[rc, 0], [ro, 0], [ro, hd], [rc, hd], [rc, 0]], 8).rotateY(Math.PI / 8).translate(x, Hw, z));
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, ap = (ri + 0.9);
    bag.add('opening', place(box(ap - 0.03, Hw + 0.45, -0.32, ap + 0.03, Hw + 1.45, 0.32), x, 0, z, -a));
    bag.add('daylight', place(box(ri - 0.03, Hw + 0.45, -0.32, ri + 0.01, Hw + 1.45, 0.32), x, 0, z, -a));
  }
  const yd = Hw + hd;
  bag.add('stucco', lathe([[ri - 0.02, 0], [rc + 0.02, 0]], 32, null, x, yd - 0.01, z)); bag.add('stucco', lathe([[rc + 0.02, 0], [ri - 0.02, 0]], 32, null, x, yd - 0.01, z));
  const shell = []; for (let k = 0; k <= 8; k++) { const t = Math.PI / 2 * k / 8; shell.push([Math.max(0.001, ri * Math.cos(t)), ri * 0.9 * Math.sin(t)]); }
  bag.add('stucco', lathe(shell.reverse(), 32, null, x, yd, z));
  dome(bag, x, yd, z, (ri + 0.85) / 1.04);
  // inside: the floor, the carpet, the raised seat by the far wall, the reading stands
  const rin = F.R(a0 + T, b0 + T, a1 - T, b1 - T);
  bag.add('marble_floor', box(rin[0], y - 0.3, rin[1], rin[2], y + 0.08, rin[3])); col.floor(rin, y + 0.08);
  bag.add('cloth_red', box(rin[0] + 0.5, y + 0.08, rin[1] + 0.5, rin[2] - 0.5, y + 0.1, rin[3] - 0.5));
  const ka = a0 + T + 0.2;
  F.B('wood_dark', ka, y + 0.1, cb - 0.8, ka + 1.4, y + 0.8, cb + 0.8);
  F.B('wood_dark', ka, y + 0.8, cb - 0.8, ka + 0.12, y + 1.7, cb + 0.8);
  for (const s2 of [-1, 1]) F.B('wood_dark', ka, y + 0.8, cb + s2 * 0.8 - (s2 > 0 ? 0.08 : 0), ka + 1.4, y + 1.2, cb + s2 * 0.8 + (s2 < 0 ? 0.08 : 0));
  col.rect(F.R(ka, cb - 0.8, ka + 1.4, cb + 0.8), y, y + 1.7);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const pa = ka + 3.2 + i * 1.6, pb = cb + (j - 0.5) * 1.9, px = F.X(pa), pz = F.Z(pb);
    for (const s2 of [-1, 1]) bag.add('wood_dark', place(box(-0.2, 0, -0.015, 0.2, 0.42, 0.015).rotateX(s2 * 0.5), px, y + 0.1, pz, 0));
  }
  const ly = y + 4.0;
  bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.08], [0.2, 0.2], [0.2, 0.3], [0.12, 0.38], [0.11, 0.45], [0.2, 0.62], [0.001, 0.62]], 10, null, x, ly, z));
  bag.add('iron', rod([x, ly + 0.62, z], [x, yd + ri * 0.9 - 0.05, z], 0.012, 4));
}

/**
 * darussifa: { rect (12 × 10 modules), y, m, gate ('e') } — the hospital (§4.5): two porticoed courts side by
 * side, the front one (by the gate) with larger domed rooms on its two sides, the rear one with domed
 * cells on three sides round a pool; every unit domed.
 */
function darussifa(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, m = el.m ?? 4.4, [x0, z0] = el.rect;
  const F = frame(bag, x0, z0, false), H = 6.8, top = 6.0, hs = 3.4;
  const units = [], bays = [];
  const U = (i0, j0, i1, j1, o = {}) => units.push({ r: [i0, j0, i1, j1], chimney: false, door: true, ...o });
  // the rear court (i 0–5): cells north, south and west
  for (let i = 0; i < 6; i++) { U(i, 0, i + 1, 1, { chimney: true, door: i > 0 }); U(i, 9, i + 1, 10, { chimney: true, door: i > 0 }); }
  for (let j = 1; j < 9; j++) U(0, j, 1, j + 1, { chimney: true });
  for (let i = 1; i < 6; i++) bays.push([i, 1], [i, 8]);
  for (let j = 2; j < 8; j++) bays.push([1, j], [5, j]);
  // the front court (i 6–11): the larger rooms, two modules square, north and south; the gate east
  for (const i of [6, 8, 10]) { U(i, 0, i + 2, 2, { dome: 'one' }); U(i, 8, i + 2, 10, { dome: 'one' }); }
  for (let i = 6; i < 11; i++) bays.push([i, 2], [i, 7]);
  for (let j = 3; j < 7; j++) bays.push([6, j], [10, j]);
  U(11, 2, 12, 4); U(11, 6, 12, 8);
  grid(ctx, { F, m, y, H, hs, top, units, bays, courts: [[1, 1, 6, 9], [6, 2, 11, 8]], solid: [{ r: [11, 4, 12, 6], kind: 'G' }], cut: (i, j, f) => (i === 5 && f === 'e') || (i === 6 && f === 'w') });
  // the wall between the courts with its door, along the line i = 6 behind the bays
  const aw = 6 * m;
  for (const [b0, b1] of [[1 * m, 4.5 * m], [5.5 * m, 9 * m]]) { const r = F.B(S, aw - 0.35, y - 0.5, b0, aw + 0.35, y + top, b1); col.rect(r, y, y + top); }
  F.B(S, aw - 0.35, y + 3.0, 4.5 * m, aw + 0.35, y + top, 5.5 * m);
  gateway(ctx, F, 11 * m, 12 * m, 4 * m, 6 * m, y, H, H + 1.6);
  // the pool of the rear court, octagonal
  const [px, pz] = F.P(3.5 * m, 5 * m);
  bag.add(M, place(lathe([[2.4 / Math.cos(Math.PI / 8), 0], [2.4 / Math.cos(Math.PI / 8), 0.6], [2.1 / Math.cos(Math.PI / 8), 0.6], [2.1 / Math.cos(Math.PI / 8), 0.1]], 8), px, y + 0.08, pz, Math.PI / 8));
  bag.add('water', place(lathe([[2.12 / Math.cos(Math.PI / 8), 0], [0.001, 0]], 8), px, y + 0.48, pz, Math.PI / 8));
  bag.add(M, lathe([[0.3, 0], [0.22, 0.6], [0.4, 0.75], [0.001, 0.95]], 12, null, px, y + 0.08, pz));
  col.circle(px, pz, 2.5, y, y + 0.6);
}

/**
 * imaret: { rect (10 × 10 modules), y, m } — the soup kitchen (§4.6): a square of domed units of different
 * sizes round a porticoed court; the kitchens along the far side under domes with smoke lanterns, the two
 * bread ovens at its corner with their chimneys; the storerooms and refectories to either side, the gate.
 */
function imaret(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, m = el.m ?? 4.4, [x0, z0, x1] = el.rect;
  const F = frame(bag, x1, z0, true), H = 7.2, top = 6.0, hs = 3.4;
  const units = [], bays = [];
  const U = (i0, j0, i1, j1, o = {}) => units.push({ r: [i0, j0, i1, j1], chimney: false, door: true, dome: 'one', ...o });
  // a from the east side (the far side, toward the slope); the kitchens north, with lanterns
  for (const i of [0, 2, 4, 6]) U(i, 0, i + 2, 2, { lantern: true, H: 7.8 });
  U(8, 0, 10, 2, { lantern: true, H: 7.8, door: false });
  // the bakery at the east corner: (0, 2)-(2, 4), ovens and chimneys built below
  U(0, 2, 2, 4, { H: 7.8 });
  U(0, 4, 2, 6); U(0, 6, 2, 8); U(0, 8, 2, 10, { door: false });
  for (const i of [2, 4, 6]) U(i, 8, i + 2, 10);
  U(8, 8, 10, 10, { door: false });
  // the gate side (west): porter's rooms either side of the gate
  for (const j of [2, 3, 6, 7]) U(9, j, 10, j + 1, { dome: 'each' });
  for (let i = 2; i < 9; i++) bays.push([i, 2], [i, 7]);
  for (let j = 3; j < 7; j++) bays.push([2, j], [8, j]);
  grid(ctx, { F, m, y, H, hs, top, units, bays, courts: [[2, 2, 9, 8]], solid: [{ r: [9, 4, 10, 6], kind: 'G' }] });
  // the gate passage at (9, 4) and its portal
  gateway(ctx, F, 9 * m, 10 * m, 4 * m, 6 * m, y, H, H + 1.4);
  for (const j of [4, 5]) cupola(bag, F.X(9.5 * m), y + H, F.Z((j + 0.5) * m), m);
  // the bakery's two ovens show as their chimneys at its outer corners
  for (const ob of [2 * m + 0.7, 4 * m - 0.7]) {
    const [ox, oz] = F.P(0.7, ob);
    bag.add(S, box(ox - 0.35, y + 7.8 - 0.1, oz - 0.35, ox + 0.35, y + 7.8 + 2.6, oz + 0.35));
    bag.add(L, lathe([[0.58, 0], [0.001, 0.5]], 4).rotateY(Math.PI / 4).translate(ox, y + 7.8 + 2.6, oz));
    for (const s3 of [-1, 1]) bag.add('opening', box(ox + s3 * 0.35 - 0.02, y + 7.8 + 2.15, oz - 0.15, ox + s3 * 0.35 + 0.02, y + 7.8 + 2.45, oz + 0.15));
  }
  // in the court, a cauldron hearth of the kitchen's (the court's well) and the woodpile
  const [wx, wz] = F.P(5.5 * m, 5 * m);
  bag.add(M, lathe([[0.9, 0], [0.9, 0.75], [0.7, 0.75], [0.7, 0.2]], 16, null, wx, y + 0.08, wz));
  bag.add('opening', disc(0.7, y + 0.3, 16, wx, wz));
  bag.add('timber', box(wx - 0.08, y + 0.08, wz - 0.9, wx + 0.08, y + 2.4, wz - 0.75)); bag.add('timber', box(wx - 0.08, y + 0.08, wz + 0.75, wx + 0.08, y + 2.4, wz + 0.9));
  bag.add('timber', box(wx - 0.1, y + 2.3, wz - 0.95, wx + 0.1, y + 2.45, wz + 0.95));
  col.circle(wx, wz, 0.95, y, y + 0.8);
}

/**
 * darulhadis: { at ([x, z]: the west end of the court's north wall), y, m } — the school of the Prophet's
 * traditions (§4.7): a single row of cells, porticoed in front, along a bent line (18 bays, 22 cells, four of
 * them past the portico's end, turning), a narrow court before them behind a wall with gates, the small
 * domed dershane at the end toward the mosque; walls of one course of stone to two of brick, under brick
 * sawtooth eaves.
 */
function darulhadis(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, m = el.m ?? 4.0, [x0, z0] = el.at;
  const F = frame(bag, x0, z0, false), H = 5.8, top = 5.4, hs = 3.0;
  const units = [], bays = [];
  units.push({ r: [0, 2, 2, 4], dome: 'one', door: true, H: 7.0 });
  for (let i = 2; i < 20; i++) { units.push({ r: [i, 3, i + 1, 4], chimney: true, door: true }); bays.push([i, 2]); }
  for (let j = 0; j < 4; j++) units.push({ r: [20, j, 21, j + 1], chimney: true, door: true });
  grid(ctx, { F, m, y, H, hs, top, units, bays, courts: [[0, 0, 20, 3]], banded: true, eaves: 'kirpi' });
  // the court's north wall with its two gates, coped; the court's west end closed by the dershane's side
  const cw = (a0, a1) => { const r = F.B(S, a0, y - 0.5, -0.6, a1, y + 3.4, 0); col.rect(r, y, y + 3.4); F.B(S, a0 - 0.1, y + 3.4, -0.7, a1 + 0.1, y + 3.6, 0.1); };
  const gates = [6 * m, 14 * m];
  let s = 0;
  for (const g of gates) { cw(s, g - 1.2); F.B(S, g - 1.2, y + 2.8, -0.6, g + 1.2, y + 3.4, 0); doorway(F, 'n', -0.6, g, 2.4, y + 0.08, 2.7, false); s = g + 1.2; }
  cw(s, 20 * m);
  const r0 = F.B(S, -0.6, y - 0.5, -0.6, 0, y + 3.4, 2 * m); col.rect(r0, y, y + 3.4);
}

/**
 * hamam: { rect ([x0, z0, x1, z1], long along x), y, door ('w') } — the double bath's single half as built here
 * (§4.8): from the door, the square domed dressing hall (soyunmalık) with its lantern, the front's corners
 * chamfered; the oblong warm room (ılıklık) under its dome; the hot room (sıcaklık) of four eyvans under
 * pointed vaults and four corner cells (halvet) round the central dome, every dome studded with glass
 * bulbs; behind, the water tank and the furnace (külhan) with its chimney and the woodstore.
 */
function hamam(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, cz = (z0 + z1) / 2, wz = z1 - z0;
  const F = frame(bag, x0, cz, false);
  const ws = wz, Hs = 9.5, ch = 2.2;
  // the dressing hall: a square, its two front corners cut back
  const poly = [[ch, -ws / 2], [ws, -ws / 2], [ws, ws / 2], [ch, ws / 2], [0, ws / 2 - ch], [0, -ws / 2 + ch]];
  prism(bag, S, poly.map(([a, b]) => F.P(a, b)), y - 0.5, y + Hs);
  for (let k = 0; k < poly.length; k++) { const [a0, b0] = F.P(...poly[k]), [a1, b1] = F.P(...poly[(k + 1) % poly.length]); for (let t = 0; t <= 1; t += 0.1) col.circle(a0 + (a1 - a0) * t, b0 + (b1 - b0) * t, 0.6, y, y + Hs); }
  // windows: two rows on the side faces and the chamfers; the door in the front under its portal
  for (const f of ['n', 's']) for (const u of [ws * 0.4, ws * 0.72]) { grilledWindow(F, f, f === 'n' ? -ws / 2 : ws / 2, u, 1.0, y + 1.2, y + 2.8); pointedLight(F, f, f === 'n' ? -ws / 2 : ws / 2, u, 0.7, y + 5.0, y + 6.4); }
  for (const u of [-ws / 4 + 0.5, ws / 4 - 0.5]) pointedLight(F, 'w', 0, u, 0.7, y + 5.0, y + 6.4);
  portal(F, col, 'w', 0, 0, y, 5.8, 8.2, 0.8, 1.8);
  onFace(F, 'n', -ws / 2, ch, ws, 0, 0.2, y + Hs - 0.4, y + Hs, S); onFace(F, 's', ws / 2, ch, ws, 0, 0.2, y + Hs - 0.4, y + Hs, S);
  cupola(bag, F.X(ws / 2 + 0.3), y + Hs, F.Z(0), ws - 1.0, { lantern: true, k: 0.44, drum: 1.2 });
  // the warm room: an oblong across the axis, its dome, small vaulted bays either side
  const aw0 = ws, aw1 = ws + 6.4, Hw = 7.0;
  F.B(S, aw0, y - 0.5, -ws / 2 + 1.0, aw1, y + Hw, ws / 2 - 1.0); col.rect(F.R(aw0, -ws / 2 + 1, aw1, ws / 2 - 1), y, y + Hw);
  cupola(bag, F.X((aw0 + aw1) / 2), y + Hw, F.Z(0), 6.0, { oculi: true, k: 0.42, drum: 0.6 });
  for (const s2 of [-1, 1]) cupola(bag, F.X((aw0 + aw1) / 2), y + Hw, F.Z(s2 * (ws / 2 - 1.0 - 2.3)), 4.0, { oculi: true, k: 0.4, drum: 0.3 });
  // the hot room: a square of side ws - 1, the central dome on a drum, the eyvans' vaults, the halvets' domes
  // (a 3 × 3 plan: the central square, an eyvan on each side, a halvet in each corner)
  const ah0 = aw1, sh = ws - 1.0, ah1 = ah0 + sh, Hh = 7.6, c = (ah0 + ah1) / 2, hc = sh * 0.233, he = sh / 2;
  F.B(S, ah0, y - 0.5, -sh / 2, ah1, y + Hh, sh / 2); col.rect(F.R(ah0, -sh / 2, ah1, sh / 2), y, y + Hh);
  cupola(bag, F.X(c), y + Hh, F.Z(0), 2 * hc, { oculi: true, k: 0.46, drum: 1.4 });
  const hm = (hc + he) / 2;
  for (const [da, db] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cupola(bag, F.X(c + da * hm), y + Hh, F.Z(db * hm), (he - hc) * 0.9, { oculi: true, k: 0.4, drum: 0.3 });
  // the eyvans' pointed vaults, their lead roofs seen from outside: two along a, two along b
  for (const s2 of [-1, 1]) {
    vaultRoof(bag, F, [c - hc, s2 > 0 ? hc : -he], [c + hc, s2 > 0 ? he : -hc], 'b', y + Hh);
    vaultRoof(bag, F, [s2 > 0 ? c + hc : c - he, -hc], [s2 > 0 ? c + he : c - hc, hc], 'a', y + Hh);
  }
  // behind: the water tank over the furnace, the chimney, the woodstore
  const ak0 = ah1, ak1 = ak0 + 5.0, Hk = 6.0;
  F.B(S, ak0, y - 0.5, -sh / 2 + 0.8, ak1, y + Hk, sh / 2 - 0.8); col.rect(F.R(ak0, -sh / 2 + 0.8, ak1, sh / 2 - 0.8), y, y + Hk);
  F.B(L, ak0, y + Hk, -sh / 2 + 0.8, ak1 + 0.1, y + Hk + 0.06, sh / 2 - 0.8);
  const [kx, kz] = F.P(ak1 - 1.2, -sh / 2 + 2.0);
  bag.add('brick', box(kx - 0.6, y + Hk, kz - 0.6, kx + 0.6, y + Hh + 4.2, kz + 0.6));
  bag.add('brick', box(kx - 0.72, y + Hh + 3.9, kz - 0.72, kx + 0.72, y + Hh + 4.1, kz + 0.72));
  bag.add('opening', box(kx - 0.45, y + Hh + 4.19, kz - 0.45, kx + 0.45, y + Hh + 4.21, kz + 0.45));
  onFace(F, 'e', ak1, -1.0, 1.0, -0.06, 0.02, y + 0.08, y + 1.6, 'opening');
  F.B(S, ak1 - 0.01, y + 1.6, -1.2, ak1 + 0.22, y + 1.85, 1.2);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 4 - k; j++) { const [lx, lz] = F.P(ak1 + 0.5 + j * 0.24 + k * 0.12, 2.0); bag.add('timber', rod([lx, y + 0.12 + k * 0.21, lz], [lx, y + 0.12 + k * 0.21, lz + 2.2], 0.11, 6)); }
}
/** A pointed vault's lead roof over the rect [a0, b0]–[a1, b1] (local), its ridge along `along`. */
function vaultRoof(bag, F, p, q2, along, y) {
  const [a0, b0] = p, [a1, b1] = q2, arc = along === 'b' ? pointedArc(a0, a1, 0, 6) : pointedArc(b0, b1, 0, 6), t = [];
  const s0 = along === 'b' ? a0 : b0, s1 = along === 'b' ? a1 : b1, k = 0.55 / ((s1 - s0) * 0.6);
  const P = (u, v, w) => { const pa = along === 'b' ? [u, w] : [w, u]; return [F.X(pa[0]), y + v, F.Z(pa[1])]; };
  const w0 = along === 'b' ? b0 : a0, w1 = along === 'b' ? b1 : a1;
  for (let i = 0; i + 1 < arc.length; i++) { const [u0, v0] = arc[i], [u1, v1] = arc[i + 1]; t.push(...P(u0, v0 * k, w0), ...P(u1, v1 * k, w0), ...P(u1, v1 * k, w1), ...P(u0, v0 * k, w0), ...P(u1, v1 * k, w1), ...P(u0, v0 * k, w1)); }
  // the gable ends
  for (const w of [w0, w1]) for (let i = 0; i + 1 < arc.length; i++) { const [u0, v0] = arc[i], [u1, v1] = arc[i + 1]; t.push(...P((s0 + s1) / 2, 0, w), ...P(u0, v0 * k, w), ...P(u1, v1 * k, w)); }
  bag.add(L, dblT(t));
}
/** A prism over a convex polygon (world [x, z] points), from y0 to y1. */
function prism(bag, mat, pts, y0, y1) {
  const t = [], n = pts.length, c = pts.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
  for (let k = 0; k < n; k++) {
    const [ax, az] = pts[k], [bx, bz] = pts[(k + 1) % n];
    t.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az);
    t.push(c[0], y1, c[1], ax, y1, az, bx, y1, bz); t.push(c[0], y0, c[1], bx, y0, bz, ax, y0, az);
  }
  bag.add(mat, dblT(t));
}

/**
 * arasta: { x (the line of the shops' backs), z0, z1, face ('e' | 'w': where they open), y, w (a shop's width),
 * d (its depth), gaps ([[z0, z1]…]), goods ('copper' | 'cloth') } — a row of vaulted shops (§4.9): each under a
 * pointed barrel vault opening by a pointed arch on the street, the raised stone floor where the shopkeeper
 * sits, the wooden shutters (kepenk), the upper leaf propped up as an awning and the lower let down as a
 * counter, the goods inside; a flat lead roof over the row.
 */
function arasta(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, w = el.w ?? 3.3, d = el.d ?? 4.4, sg = el.face === 'w' ? -1 : 1, xb = el.x, xf = xb + sg * d;
  const ys = y + 2.7, yt = y + 4.6, X = (v) => xb + sg * v;
  const runs = [];
  let s = el.z0;
  for (const [g0, g1] of (el.gaps || []).slice().sort((p, q) => p[0] - q[0])) { runs.push([s, g0]); s = g1; }
  runs.push([s, el.z1]);
  let n = 0;
  for (const [r0, r1] of runs) {
    const k = Math.floor((r1 - r0 - 0.5) / w); if (k < 1) continue;
    const z0 = r0 + (r1 - r0 - k * w) / 2, spans = [];
    for (let i = 0; i < k; i++) spans.push([z0 - r0 + i * w + 0.28, z0 - r0 + (i + 1) * w - 0.28]);
    // the front: piers and arches; the partitions; the roof
    arcadeWall(bag, [xf - sg * 0.3, r0], [xf - sg * 0.3, r1], spans, y - 0.3, ys, yt, 0.6, S);
    for (const [p0, p1] of [[r0, z0 + 0.28], [z0 + k * w - 0.28, r1]]) col.rect([Math.min(xb, xf), p0, Math.max(xb, xf), p1], y, yt);
    for (let i = 0; i <= k; i++) { const zz = z0 + i * w, a = i === 0 ? r0 : zz - 0.28, b = i === k ? r1 : zz + 0.28; bag.add(S, box(Math.min(xb, xf - sg * 0.6), y - 0.3, a, Math.max(xb, xf - sg * 0.6), yt, b)); col.rect([Math.min(xb, xf), a, Math.max(xb, xf), b], y, yt); }
    bag.add(S, box(Math.min(xb, xf), yt - 0.01, r0, Math.max(xb, xf), yt + 0.3, r1));
    bag.add(S, box(Math.min(xb, xf + sg * 0.2), yt + 0.3, r0 - 0.1, Math.max(xb, xf + sg * 0.2), yt + 0.5, r1 + 0.1));
    bag.add(L, box(Math.min(xb, xf), yt + 0.5, r0, Math.max(xb, xf), yt + 0.56, r1));
    for (let i = 0; i < k; i++, n++) {
      const za = z0 + i * w + 0.28, zb = z0 + (i + 1) * w - 0.28, zc = (za + zb) / 2, hw = (zb - za) / 2;
      // the vault: the arch's curve carried back to the wall behind
      const arc = pointedArc(za, zb, ys, 6), t = [];
      for (let q = 0; q + 1 < arc.length; q++) { const [u0, v0] = arc[q], [u1, v1] = arc[q + 1]; t.push(X(0.02), v0, u0, X(d - 0.6), v0, u0, X(d - 0.6), v1, u1, X(0.02), v0, u0, X(d - 0.6), v1, u1, X(0.02), v1, u1); }
      bag.add('stucco', dblT(t));
      // the raised floor, its plank top
      bag.add(S, box(Math.min(X(0.02), X(d - 0.45)), y - 0.3, za, Math.max(X(0.02), X(d - 0.45)), y + 0.55, zb));
      bag.add('timber', box(Math.min(X(0.02), X(d - 0.5)), y + 0.55, za + 0.02, Math.max(X(0.02), X(d - 0.5)), y + 0.6, zb - 0.02));
      col.rect([Math.min(X(0), X(d - 0.45)), za, Math.max(X(0), X(d - 0.45)), zb], y, y + 0.6);
      // the shutter frame: a beam across the arch at the springing, the fixed lattice above it
      bag.add('wood_dark', box(Math.min(X(d - 0.62), X(d - 0.42)), ys - 0.2, za, Math.max(X(d - 0.62), X(d - 0.42)), ys, zb));
      for (let v = za + 0.25; v < zb - 0.1; v += 0.25) { const top2 = ys + Math.sqrt(Math.max(0, 1 - ((v - zc) / hw) ** 2)) * hw * 1.2 - 0.1; if (top2 > ys + 0.05) bag.add('wood_dark', box(Math.min(X(d - 0.56), X(d - 0.5)), ys, v - 0.02, Math.max(X(d - 0.56), X(d - 0.5)), Math.min(top2, ys + 1.5), v + 0.02)); }
      // the upper leaf propped out as an awning; the lower let down as a counter on its brackets
      const lw = zb - za - 0.1;
      const up = box(0, -0.03, -lw / 2, 1.1, 0.03, lw / 2).rotateZ(-0.45);
      if (sg < 0) up.rotateY(Math.PI);
      bag.add('wood_dark', up.translate(X(d), ys - 0.22, zc));
      bag.add('wood_dark', box(Math.min(X(d - 0.3), X(d + 0.5)), y + 0.75, za + 0.05, Math.max(X(d - 0.3), X(d + 0.5)), y + 0.81, zb - 0.05));
      for (const s2 of [-1, 1]) bag.add('wood_dark', rod([X(d), y + 0.35, zc + s2 * (hw - 0.3)], [X(d + 0.45), y + 0.74, zc + s2 * (hw - 0.3)], 0.03, 4));
      // the goods
      if (el.goods === 'copper') {
        for (let g = 0; g < 4; g++) {
          const gz = za + 0.35 + g * (zb - za - 0.7) / 3, gx = X(1.0 + (g % 2) * 0.9), sc = 0.8 + ((n + g) % 3) * 0.25;
          bag.add('bronze', lathe([[0.001, 0], [0.18 * sc, 0.02], [0.26 * sc, 0.16 * sc], [0.22 * sc, 0.34 * sc], [0.12 * sc, 0.42 * sc], [0.14 * sc, 0.5 * sc]], 12, null, gx, y + 0.6, gz));
        }
        for (let g = 0; g < 3; g++) { const gz = za + 0.5 + g * (zb - za - 1.0) / 2; bag.add('bronze', lathe([[0.001, 0], [0.32, 0.01], [0.34, 0.08], [0.3, 0.09], [0.001, 0.03]], 14).rotateZ(sg > 0 ? -Math.PI / 2 : Math.PI / 2).translate(X(0.06), y + 1.9, gz)); }
        bag.add('bronze', lathe([[0.001, 0], [0.55, 0.02], [0.6, 0.28], [0.55, 0.3], [0.001, 0.06]], 16, null, X(d + 0.9), y, zc));
      } else {
        bag.add('timber', box(Math.min(X(0.02), X(0.5)), y + 1.5, za + 0.02, Math.max(X(0.02), X(0.5)), y + 1.54, zb - 0.02));
        const cl = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'];
        for (let g = 0; g < 4; g++) { const gz = za + 0.2 + g * (zb - za - 0.4) / 4; bag.add(cl[(n + g) % 4], box(Math.min(X(0.06), X(0.44)), y + 1.54, gz, Math.max(X(0.06), X(0.44)), y + 1.54 + 0.16 * (1 + (g + n) % 3), gz + (zb - za - 0.4) / 4 - 0.03)); }
        for (let g = 0; g < 3; g++) { const gz = za + 0.4 + g * (zb - za - 0.8) / 2; bag.add(cl[(n + g + 1) % 4], box(Math.min(X(1.2), X(2.0)), y + 0.6, gz - 0.25, Math.max(X(1.2), X(2.0)), y + 0.6 + 0.12 * (1 + (g + n) % 2), gz + 0.25)); }
      }
    }
  }
}

export const KULLIYE = { kulliye_medrese: medrese, darussifa, imaret, darulhadis, hamam, arasta };
