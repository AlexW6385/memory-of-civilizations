// The palazzi of the Grand Canal about 1500 (docs/settlements/venice.md §4b): a front of three parts
// on the water — the water gate and its landing stair below, the loggia of the portego in the middle
// of each of the two piani nobili between rows of paired windows — in white Istrian stone and
// plaster, the corners in stone, the string courses at each floor, the cornice, the low hipped roof of
// tile with its flared chimneys and sometimes an altana; the mooring poles in front. Three fashions:
// 'gothic' (ogee arches, quatrefoil roundels, as the Ca' Foscari and the Ca' d'Oro), 'veneto'
// (stilted round arches and marble roundels, the old Veneto-Byzantine fronts) and 'lombardo' (round
// arches in pairs under a cornice, the first Renaissance fronts, after Lombardo and Codussi).
//
// palazzo: { at: [x, z] (the front's middle), w: [wx, wz] (toward the water), width, depth, y (the
// ground), sea, seed, kind } — local frame: u along the front, v toward the water (the front at v = 0).

import { box, lathe, rod, frustum } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/**
 * Half of an arch's outline from the left springing to the crown, relative to the springing and the middle: [[u, h], …].
 * 'round' a semicircle; 'lancet' two arcs meeting in a point; 'ogee' a convex arc running into a concave one that ends in a point.
 */
export function archHalf(kind, a, n = 5) {
  const pts = [];
  if (kind === 'round') { for (let i = 0; i <= n + 1; i++) { const f = i / (n + 1) * Math.PI / 2; pts.push([-a * Math.cos(f), a * Math.sin(f)]); } return pts; }
  if (kind === 'lancet') {
    const R = 1.6 * a, c = 0.6 * a, f1 = Math.acos(c / R);
    for (let i = 0; i <= n + 1; i++) { const f = i / (n + 1) * f1; pts.push([c - R * Math.cos(f), R * Math.sin(f)]); }
    return pts;
  }
  const r1 = 0.55 * a, f1 = 50 * Math.PI / 180, pm = [-a + r1 * (1 - Math.cos(f1)), r1 * Math.sin(f1)];
  const r2 = 1.1 * -pm[0] / (1 - Math.cos(f1)), c2 = [pm[0] - r2 * Math.cos(f1), pm[1] + r2 * Math.sin(f1)], te = -Math.acos(Math.min(1, -c2[0] / r2));
  for (let i = 0; i <= 3; i++) { const f = i / 3 * f1; pts.push([-a + r1 * (1 - Math.cos(f)), r1 * Math.sin(f)]); }
  for (let i = 1; i <= 4; i++) { const t = -f1 + (te + f1) * i / 4; pts.push([c2[0] + r2 * Math.cos(t), c2[1] + r2 * Math.sin(t)]); }
  pts[pts.length - 1][0] = 0;
  return pts;
}

export function palazzo(el, { bag, col }) {
  const [fx, fz] = el.at, w = el.w, W = el.width ?? 22, D = el.depth ?? 21, y0 = el.y ?? 0, sea = el.sea ?? -2.5, kind = el.kind ?? 'gothic', rand = rng(el.seed ?? 1);
  const ang = Math.atan2(w[0], w[1]);
  const put = (m, g) => { g.rotateY(ang); g.translate(fx, 0, fz); bag.add(m, g); };
  const B = (m, u0, u1, ya, yb, v0, v1) => put(m, box(u0, y0 + ya, v0, u1, y0 + yb, v1));
  // the floors: the ground (the water gate and the storerooms), two piani nobili, the cornice
  const L = [0, 4.9, 10.1, 14.9], top = L[3];
  const wallMat = el.wall ?? ['stucco_venice', 'stucco_rose', 'stucco_ochre', 'stucco_cream', 'limewash_red', 'stucco_siena'][Math.floor(rand() * 6)];
  const ST = kind === 'lombardo' ? 'marble' : 'limestone', trimMat = kind === 'veneto' ? 'marble' : 'limestone';
  // the arch in the front's plane: fill (dark) and frame (stone); a is the half-width, ys the springing's height, v the plane
  const arch = (u, ys, a, k, { v0 = 0, v1 = 0.06, t = 0.16, fill = 'opening', frame = trimMat, fv = 0.1 } = {}) => {
    const h = archHalf(k, a), full = [...h, ...h.slice(0, -1).reverse().map(([x, y]) => [-x, y])];
    for (let i = 0; i + 1 < h.length; i++) {                                    // the dark fill in strips
      const hw = -h[i + 1][0];
      if (fill && hw > 0.01) B(fill, u - hw, u + hw, ys + h[i][1], ys + h[i + 1][1] + 0.01, v0, v1);
    }
    if (frame) for (let i = 0; i + 1 < full.length; i++) {                      // the frame: a box along each segment, set outward
      const [p, q] = [full[i], full[i + 1]], dx = q[0] - p[0], dy = q[1] - p[1], sl = Math.hypot(dx, dy), l = sl + 0.03, an = Math.atan2(dy, dx);
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      let nx = -dy / sl, ny = dx / sl;
      if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }                      // outward, away from the opening's middle
      const g = box(-l / 2, -t / 2, v0, l / 2, t / 2, v0 + fv);
      g.rotateZ(an); g.translate(u + mx + nx * t / 2, y0 + ys + my + ny * t / 2, 0); put(frame, g);
    }
    return h;
  };
  const column = (u, ya, yb, v, r = 0.13) => put('marble', lathe([[r * 1.4, 0], [r * 1.4, 0.12], [r, 0.18], [r, yb - ya - 0.3], [r * 1.25, yb - ya - 0.2], [r * 1.5, yb - ya - 0.1], [r * 1.5, yb - ya]], 8, null, u, y0 + ya, v));
  const roundel = (u, y, r, v, mat = 'marble_pink') => {
    const g = lathe([[r, 0], [r, 0.07], [0.001, 0.07]], 12); g.rotateX(Math.PI / 2); g.translate(u, y0 + y, v); put(mat, g);
    const g2 = lathe([[r * 1.18, 0], [r * 1.18, 0.05], [r * 0.98, 0.05], [r * 0.98, 0]], 12); g2.rotateX(Math.PI / 2); g2.translate(u, y0 + y, v - 0.01); put(trimMat, g2);
  };
  const Wc = kind === 'lombardo' ? 0 : Math.min(7.6, Math.floor((W - 8) * 0.5 / 0.4) * 0.4 + 2.0), wing = (W - Wc) / 2;
  const base = SEA_FOOT(sea);
  // ── the body ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  B('limestone', -W / 2 + 0.02, W / 2 - 0.02, base - y0, -0.4, -D + 0.02, -0.04);                                     // the footing, down into the water
  for (const sgn of [-1, 1]) {                                                                   // the wings, and the core behind the loggia
    const u0 = sgn < 0 ? -W / 2 : Wc / 2, u1 = sgn < 0 ? -Wc / 2 : W / 2;
    if (Wc > 0) { B(wallMat, u0, u1, -0.5, top - 0.02, -D, 0); }
  }
  if (Wc > 0) B(wallMat, -Wc / 2, Wc / 2, -0.5, top - 0.02, -D, -1.6);
  else B(wallMat, -W / 2, W / 2, -0.5, top - 0.02, -D, 0);
  const walls = (u0, u1) => { B('limestone', u0 - 0.03, u1 + 0.03, -0.4, 1.1, -D - 0.03, 0.1); };                      // the stone plinth to the first sill
  if (Wc > 0) { walls(-W / 2, -Wc / 2); walls(Wc / 2, W / 2); } else walls(-W / 2, W / 2);
  // corner quoins in white stone, string courses at each floor, the cornice
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) B(ST, s < 0 ? -W / 2 - 0.04 : W / 2 - 0.55, s < 0 ? -W / 2 + 0.55 : W / 2 + 0.04, L[k] + (k ? 0 : 1.1) + (k ? 0.1 : 0), L[k + 1] - 0.1, -D * 0.5, 0.1 + (k % 2) * 0.03);
  for (let k = 1; k < 3; k++) { B(ST, -W / 2 - 0.06, W / 2 + 0.06, L[k] - 0.16, L[k] + 0.1, -D, 0.22); }
  B(ST, -W / 2 - 0.2, W / 2 + 0.2, top - 0.7, top, -D - 0.2, 0.55);                              // the cornice (a deep one)
  B(ST, -W / 2 - 0.3, W / 2 + 0.3, top, top + 0.16, -D - 0.3, 0.7);
  if (kind === 'lombardo') for (let k = 1; k < 3; k++) for (let i = 0; i <= Math.round(W / 4.2); i++) { const u = -W / 2 + 0.7 + i * (W - 1.4) / Math.round(W / 4.2); B('marble', u - 0.28, u + 0.28, L[k - 1] + (k > 1 ? 0.3 : 1.1), L[k] - 0.2, -0.0, 0.14); }   // the pilasters
  // ── the water gate ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const gw = kind === 'lombardo' ? 1.5 : 1.8, gk = kind === 'veneto' ? 'round' : 'lancet';
  if (Wc > 0 && el.arcade) {
    // an arcade of three arches over two columns, the entrance hall behind it, as the casa-fondaco
    B('opening', -Wc / 2 + 0.2, Wc / 2 - 0.2, 0, 3.6, -1.62, -1.58);
    for (const u of [-Wc / 6 - 0.0, Wc / 6]) column(u, 0, 3.0, -0.3, 0.16);
    for (const [u, a] of [[-Wc / 3, Wc / 6 - 0.15], [0, Wc / 6 - 0.15], [Wc / 3, Wc / 6 - 0.15]]) arch(u, 3.0, a, gk, { v0: -0.4, v1: -0.34, fill: null, t: 0.2, fv: 0.34 });
    B(wallMat, -Wc / 2, Wc / 2, 3.2, L[1] - 0.25, -1.6, -0.4);
  } else {
    // one tall portal in the wall, its stone surround, the dark hall behind
    const pw = gw * 1.15;
    if (Wc > 0) { B('opening', -pw, pw, 0, 3.2, -1.62, -1.58); arch(0, 3.2, pw, gk, { v0: -1.6, v1: -1.56, t: 0.0, frame: null }); }
    else { B('opening', -pw, pw, 0, 3.0, -0.02, 0.03); arch(0, 3.0, pw, gk, { v0: -0.02, v1: 0.03, frame: trimMat, t: 0.22, fv: 0.2 }); }
    if (Wc > 0) {                                                                                 // the portal's recess is cut through the wall: the plinth and wall do not close it, so jambs and a lintel carry the face
      B(wallMat, -Wc / 2, -pw, 0, L[1], -1.6, -0.02); B(wallMat, pw, Wc / 2, 0, L[1], -1.6, -0.02);
      for (const s of [-1, 1]) B(trimMat, s < 0 ? -pw - 0.25 : pw, s < 0 ? -pw : pw + 0.25, 0, 3.2, -0.3, 0.12);
    }
  }
  // the landing stair down to the water: steps from the sill, 0.3 m a step, on a stepped mass of stone
  const n = Math.ceil((y0 - (sea + 0.45)) / 0.3), sw = (Wc > 0 ? gw * 1.15 : 1.7) + 0.3;
  for (let i = 0; i < n; i++) { const yt = y0 + 0.06 - (i + 1) * 0.3 + 0.0, v0 = 0.1 + i * 0.32; if (yt <= sea + 0.2) break; put('limestone', box(-sw, sea - 1.0, v0, sw, yt, v0 + 0.32)); }
  // the paired mooring poles in the family's colours, a little out in the canal
  const ca = ['paint_blue', 'cloth_red', 'paint_white', 'cloth_green', 'cloth_ochre'][Math.floor(rand() * 5)], cb = ['paint_white', 'cloth_white', 'cloth_ochre'][Math.floor(rand() * 3)];
  for (const s of [-1, 1]) {
    const pu = s * (sw + 1.2), pv = 3.6, h0 = sea - 3, hT = y0 + 0.9;
    const base0 = lathe([[0.17, 0], [0.17, hT - h0 - 3.0], [0.001, hT - h0 - 3.0]], 8, null, pu, h0, pv);
    put('wood_dark', base0);
    for (let k = 0; k < 5; k++) { const yb = hT - 3.0 + k * 0.6; put(k % 2 ? cb : ca, lathe([[0.175, 0], [0.175, 0.6], [0.001, 0.6]], 8, null, pu, yb, pv)); }
    put('wood_dark', lathe([[0.17, 0], [0.2, 0.05], [0.12, 0.2], [0.001, 0.28]], 8, null, pu, hT, pv));
    put('iron', box(pu - 0.2, sea + 0.8, pv - 0.04, pu + 0.2, sea + 0.86, pv + 0.04));
  }
  // ── the piani nobili ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const lights = (u, ys, a, k) => { arch(u, ys, a, k, { fv: 0.1, t: 0.17 }); B('opening', u - a, u + a, ys - 2.2, ys + 0.01, 0, 0.06); };
  for (let fl = 1; fl <= 2; fl++) {
    const y1 = L[fl], hF = L[fl + 1] - y1;
    // the loggia of the portego
    if (Wc > 0) {
      B('opening', -Wc / 2 + 0.2, Wc / 2 - 0.2, y1, L[fl + 1] - 0.3, -1.62, -1.58);
      B(ST, -Wc / 2 - 0.1, Wc / 2 + 0.1, y1 - 0.2, y1 + 0.1, -1.6, 0.9);                            // the balcony's slab
      const ys = y1 + 2.5, nA = 4, aw = (Wc - 0.7) / nA;
      for (let i = 0; i < nA; i++) {
        const u = -Wc / 2 + 0.35 + aw * (i + 0.5), a = aw / 2 - 0.09;
        arch(u, ys, a, kind === 'veneto' ? 'round' : kind === 'gothic' ? 'ogee' : 'lancet', { v0: -0.55, v1: -0.5, t: 0.18, fv: 0.42, fill: null });
      }
      for (let i = 0; i <= nA; i++) { const u = -Wc / 2 + 0.35 + aw * i; if (i > 0 && i < nA) column(u, y1 + 0.1, ys, -0.32, 0.12); else B(ST, i ? u : u - 0.35, i ? u + 0.35 : u, y1 + 0.1, ys + 0.6, -0.6, 0.0); }
      // the spandrels between the arches and under the cornice: the wall's face in strips round the arches
      const hs = archHalf(kind === 'veneto' ? 'round' : kind === 'gothic' ? 'ogee' : 'lancet', aw / 2 - 0.09), hH = hs[hs.length - 1][1];
      B(wallMat, -Wc / 2, Wc / 2, ys + hH + 0.14, L[fl + 1] - 0.3, -0.8, -0.4);
      for (let i = 1; i < nA; i++) { const u = -Wc / 2 + 0.35 + aw * i; B(wallMat, u - 0.28, u + 0.28, ys, ys + hH + 0.15, -0.75, -0.45); }
      // roundels in the spandrels (a quatrefoil's place)
      if (kind !== 'lombardo') for (let i = 1; i < nA; i++) { const u = -Wc / 2 + 0.35 + aw * i; roundel(u, ys + hH + 0.5 + (kind === 'gothic' ? 0.2 : 0), 0.28, -0.38, kind === 'veneto' ? 'verde_antico' : 'marble_pink'); }
      // the balustrade of the balcony: balusters and a rail
      B(ST, -Wc / 2 - 0.1, Wc / 2 + 0.1, y1 + 0.9, y1 + 1.02, 0.5, 0.9);
      for (let u = -Wc / 2; u <= Wc / 2 + 0.01; u += 0.3) put('marble', lathe([[0.07, 0], [0.09, 0.15], [0.06, 0.35], [0.075, 0.55], [0.07, 0.8]], 6, null, u, y0 + y1 + 0.1, 0.7));
    }
    // the windows of the wings, in pairs
    const nW = Math.max(1, Math.round(wing / 3.3));
    for (const sgn of [-1, 1]) for (let i = 0; i < nW; i++) {
      const c = sgn * (Wc / 2 + wing * (i + 0.5) / nW), a = kind === 'lombardo' ? 0.52 : 0.46, gap = 0.09, ys = y1 + 2.9 + (kind === 'lombardo' ? 0.2 : 0);
      if (Math.abs(c) < 0.01) continue;
      B(trimMat, c - a * 2 - gap - 0.18, c + a * 2 + gap + 0.18, y1 + 0.88, y1 + 1.0, 0.0, 0.34);        // the sill
      const k = kind === 'veneto' ? 'round' : kind === 'gothic' ? 'ogee' : 'round';
      for (const s2 of [-1, 1]) lights(c + s2 * (a + gap / 2), ys, a, k);
      B(trimMat, c - gap / 2 - 0.04, c + gap / 2 + 0.04, y1 + 1.0, ys, 0.0, 0.14);                   // the colonnette between the lights
      if (kind === 'gothic') roundel(c, ys + 0.9, 0.3, 0.08);
      else if (kind === 'lombardo') roundel(c, ys + 1.05, 0.34, 0.08, 'porphyry');
      else roundel(c, ys + 0.85, 0.28, 0.08, 'verde_antico');
      if (fl === 1) put('iron', box(c - a * 2 - gap, y0 + y1 + 0.88, 0.3, c + a * 2 + gap, y0 + y1 + 0.94, 0.34));
    }
  }
  // the ground floor's barred windows in the wings
  for (const sgn of [-1, 1]) for (let i = 0; i < Math.max(1, Math.round(wing / 5)); i++) {
    const c = sgn * (Wc / 2 + wing * (i + 0.5) / Math.max(1, Math.round(wing / 5))), a = 0.55;
    if (Wc === 0 && Math.abs(c) < 3) continue;
    B('limestone', c - a - 0.16, c + a + 0.16, 1.35, 1.5, 0, 0.26); B('opening', c - a, c + a, 1.5, 3.0, 0, 0.05);
    B('limestone', c - a - 0.16, c + a + 0.16, 3.0, 3.16, 0, 0.12); B('limestone', c - a - 0.16, c - a, 1.5, 3.0, 0, 0.12); B('limestone', c + a, c + a + 0.16, 1.5, 3.0, 0, 0.12);
    for (let k = 0; k < 5; k++) put('iron', rod([c - a + 0.18 + k * (2 * a - 0.36) / 4, y0 + 1.5, 0.12], [c - a + 0.18 + k * (2 * a - 0.36) / 4, y0 + 3.0, 0.12], 0.014, 4));
  }
  // ── the roof, chimneys, altana ──────────────────────────────────────────────────────────────────────────────────────────────────
  const eave = 0.7, rise = (D / 2 + eave) * 0.3, yRoof = top + 0.14;
  const rg = frustum([-W / 2 - eave, -D - eave, W / 2 + eave, 0.7], yRoof, yRoof + rise, D / 2 + eave, D / 2 + eave, D / 2 + eave, D / 2 + eave);
  rg.rotateY(0); put('roof_tile', rg);
  const ridge = (rand0) => [(rand0 - 0.5) * Math.max(1, W - D), -D / 2 + 0.2];
  const nch = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < nch; i++) {
    const u = -W / 2 + D / 2 + 1 + (W - D - 2) * (i + 0.5) / nch + (rand() - 0.5) * 1.2, v = -D * 0.5 + (rand() - 0.5) * 1.5, ysurf = yRoof + rise - 0.1;
    put('brick', box(u - 0.35, ysurf + y0, v - 0.35, u + 0.35, ysurf + y0 + 1.3, v + 0.35));
    put('terracotta', lathe([[0.2, 0], [0.26, 0.4], [0.45, 0.85], [0.47, 0.9], [0.4, 0.92], [0.3, 0.6], [0.001, 0.6]], 10, null, u, ysurf + y0 + 1.3, v));
  }
  if (el.altana ?? rand() < 0.5) {
    const au = (rand() - 0.5) * (W - D) * 0.6, av = -D * 0.5 + 2.5, ay = yRoof + rise * 0.7 + y0 + 1.1;
    put('timber', box(au - 2.2, ay, av - 1.5, au + 2.2, ay + 0.12, av + 1.5));
    for (const [a, b] of [[-2, -1.3], [2, -1.3], [-2, 1.3], [2, 1.3]]) put('timber', box(au + a - 0.07, ay - 1.6, av + b - 0.07, au + a + 0.07, ay, av + b + 0.07));
    for (const s2 of [-1, 1]) { put('wood_painted', box(au - 2.2, ay + 0.9, av + s2 * 1.5 - 0.03, au + 2.2, ay + 0.96, av + s2 * 1.5 + 0.03)); put('wood_painted', box(au + s2 * 2.2 - 0.03, ay + 0.9, av - 1.5, au + s2 * 2.2 + 0.03, ay + 0.96, av + 1.5)); }
    for (let k = 0; k <= 8; k++) for (const s2 of [-1, 1]) put('wood_painted', box(au - 2.2 + k * 0.55 - 0.025, ay + 0.12, av + s2 * 1.5 - 0.025, au - 2.2 + k * 0.55 + 0.025, ay + 0.9, av + s2 * 1.5 + 0.025));
    put('roof_tile', frustum([au - 1.1, av - 1.2, au + 1.1, av + 1.2], ay + 1.9, ay + 2.2, 0, 0, 0, 0));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('timber', box(au + a - 0.04, ay + 0.12, av + b * 1.1 - 0.04, au + a + 0.04, ay + 1.9, av + b * 1.1 + 0.04));
  }
  // ── collision ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const A = (u, v) => [fx + Math.cos(ang) * u + Math.sin(ang) * v, fz - Math.sin(ang) * u + Math.cos(ang) * v];
  col.segment(A(-W / 2, -D / 2), A(W / 2, -D / 2), D, y0 - 1, y0 + top + 2);
}
const SEA_FOOT = (sea) => sea - 1.6;
