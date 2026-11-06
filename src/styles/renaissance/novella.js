// Santa Maria Novella about 1480 (docs/settlements/florence.md §4): the Dominicans' church with the
// marble front completed in 1470 to Alberti's design for Giovanni Rucellai. The front is ruled by a
// square: the lower storey fills half of it, the upper storey a quarter, and the volutes the
// sixteenths beside it. Below, the fourteenth-century work kept — the avelli (tomb recesses) under
// pointed arches and the two Gothic side doors, white marble and green Prato serpentine — with
// Alberti's classical central portal, the columns that frame it and the ends, the entablature with
// the Rucellai sails in its frieze and the attic band of inlaid squares. Above, the upper storey of
// four striped pilasters round the old rose window, the inscription of Giovanni Rucellai and the
// year 1470 under the pediment with its sun; the left volute inlaid with its roundels, the right one
// still bare (it was faced with marble only in 1920). Behind, the nave and aisles under their roofs.

import { box, lathe, frustum, fromTriangles } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, voussoirs } from './face.js';
import { rectsMinus } from './medici.js';

const M = 'marble', MS = 'marble_smooth', G = 'verde_antico', PF = 'limestone_yellow', R = 'roof_tile', O = 'opening', GL = 'stained_glass', STU = 'stucco';
const ring = (u, y, r, n = 32, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i / n * Math.PI * 2; return [u + Math.cos(a) * r, y + Math.sin(a) * r]; });

/** Stripes of white and green across a pilaster or pier from y0 to y1 (u0..u1, standing d0..d1). */
function striped(Lc, u0, u1, y0, y1, d0, d1, band = 0.55) {
  const n = Math.max(2, Math.round((y1 - y0) / band)), h = (y1 - y0) / n;
  for (let i = 0; i < n; i++) Lc.box(i % 2 ? G : MS, u0, y0 + i * h, d0, u1, y0 + (i + 1) * h, d1);
}
/** A half column engaged in the wall at u (shaft of green serpentine, base and Corinthian capital of white marble). */
function halfColumn(Lc, u, y0, h, r, d) {
  Lc.add(MS, lathe([[r * 1.4, 0], [r * 1.4, 0.18], [r * 1.2, 0.26], [r * 1.25, 0.36], [r * 1.02, 0.46], [0.001, 0.46]], 16, null, u, y0, d));
  Lc.add(G, lathe([[r, 0], [r * 0.9, h - 1.25], [0.001, h - 1.25]], 16, null, u, y0 + 0.46, d));
  Lc.add(MS, lathe([[r * 0.92, 0], [r * 1.0, 0.08], [r * 1.15, 0.35], [r * 1.45, 0.65], [r * 1.6, 0.8], [r * 1.62, 0.79]], 16, (th, j) => (j >= 2 && j <= 4 ? 1 + 0.13 * Math.cos(th * 8) : 1), u, y0 + h - 0.79, d));
}
/** A pointed arch in stripes of white and green voussoirs from (uc, ys), inner radius w (equilateral). */
function pointedRing(Lc, uc, ys, w, t, d0, d1, n = 12) {
  const r = w / 2;
  for (const s of [-1, 1]) {
    // each side an arc of radius w about the opposite springing
    const ox = uc - s * r;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI / 3, a1 = ((i + 1) / n) * Math.PI / 3;
      const p = (rr, a) => [ox + s * Math.cos(a) * rr, ys + Math.sin(a) * rr];
      const q = [p(w, a0), p(w + t, a0), p(w + t, a1), p(w, a1)];
      Lc.add(i % 2 ? G : MS, ext(s > 0 ? q : [...q].reverse(), [], d0, d1));
    }
  }
}

/**
 * novella: { rect (the church: the front on the south side), y, side (of the square front, = its width) }.
 */
export function novella(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, y = el.y ?? 0, S = x1 - x0, H2 = S / 2, q = S / 4;
  // the church behind the front: the aisles and the taller nave, their roofs, windows along the flanks
  const yA = H2 - 1.0, yN = S * 0.78, uN0 = x0 + q, uN1 = x1 - q, fz = z1 - 1.2;
  bag.add(PF, box(x0, y - 0.5, z0, x1, y + yA, fz)); col.rect([x0, z0, x1, fz], y, y + yA);
  bag.add(PF, box(uN0, y + yA, z0, uN1, y + yN, fz));
  bag.add(R, frustum([uN0 - 0.4, z0 - 0.4, uN1 + 0.4, fz], y + yN, y + yN + q * 0.2, q + 0.4, q + 0.4, 0, 0));
  // the aisles' lean-to roofs, rising to the nave's walls
  for (const s of [-1, 1]) { const r = s < 0 ? [x0 - 0.4, z0 - 0.4, uN0, fz] : [uN1, z0 - 0.4, x1 + 0.4, fz], w = r[2] - r[0]; bag.add(R, frustum(r, y + yA, y + yA + q * 0.35, s < 0 ? w : 0, s < 0 ? 0 : w, 0, 0)); }
  // tall windows along the aisles (a marble sill under each), round windows in the nave's walls above
  for (const [xx, s] of [[x0, -1], [x1, 1]]) for (let zz = z0 + 6; zz < fz - 5; zz += 8) {
    bag.add(O, box(s < 0 ? xx - 0.03 : xx, y + 5.5, zz - 0.7, s < 0 ? xx : xx + 0.03, y + 12.5, zz + 0.7));
    bag.add(M, box(s < 0 ? xx - 0.2 : xx, y + 5.3, zz - 0.95, s < 0 ? xx : xx + 0.2, y + 5.5, zz + 0.95));
  }
  for (const [xx, s] of [[uN0, -1], [uN1, 1]]) for (let zz = z0 + 6; zz < fz - 5; zz += 8) bag.add(O, lathe([[1.1, 0], [1.1, 0.06], [0.001, 0.06]], 16, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(xx + (s < 0 ? 0 : 0.06), y + yA + 5.5, zz));
  front(bag, col, [x0, fz, x1, z1], y, S, el.bareVolute !== false);
}

/** The marble front on the south face of r (u from west to east, d toward the piazza). */
function front(bag, col, r, y, S, bare) {
  const { M: FM, L } = faceFrame(r, 's', y), Lc = new Local(), H2 = S / 2, q = S / 4, e = S / 8;
  const dep = r[3] - r[1];
  // the core of the front (the wall behind the marble), full width below, the upper storey and the volutes above
  bag.add(PF, box(r[0], y - 0.5, r[1], r[2], y + H2, r[3] - 0.02)); col.rect(r, y, y + H2);
  bag.add(PF, box(r[0] + q, y + H2, r[1], r[2] - q, y + H2 + q * 0.98 + 1.55, r[3] - 0.02));
  // ---- the lower storey -------------------------------------------------------------------------
  const yP = 0.6, yE = H2 * 0.74, yF = yE + 1.45, yAt = H2;        // the plinth, the entablature, the attic band
  Lc.box(M, -0.1, -0.4, -0.02, L + 0.1, yP, 0.3);
  // the white field
  Lc.box(M, 0, yP, -0.02, L, yE, 0.0);
  // the corner piers, striped; the four columns; the pilasters behind the columns at the portal
  const cr = 0.42, uc = [1.45 + cr + 0.15, L / 2 - 2.9 - cr - 0.25, L / 2 + 2.9 + cr + 0.25, L - 1.45 - cr - 0.15];
  for (const [a, b] of [[0, 1.45], [L - 1.45, L]]) striped(Lc, a, b, yP, yE, 0, 0.3);
  for (const u of uc) { halfColumn(Lc, u, yP, yE - yP, cr, 0.12); col.circle(...toW(FM, u, 0.3), cr + 0.2, y, y + yE); }
  // the central portal (Alberti's): the door in a frame of fluted pilasters under its entablature, the round arch above in white and green
  const pc = L / 2, pw = 3.4, ph = pw * 1.5;
  Lc.add(O, ext([[pc - pw / 2, 0.02], [pc + pw / 2, 0.02], [pc + pw / 2, ph], [pc - pw / 2, ph]], [], -0.01, 0.01));
  for (const s of [-1, 1]) {
    Lc.box(MS, pc + s * pw / 2, 0.02, 0.0, pc + s * (pw / 2 + 0.55), ph, 0.18);
    for (let k = 0; k < 3; k++) { const uu = pc + s * (pw / 2 + 0.12 + k * 0.15); Lc.box(G, uu - 0.03, 0.4, 0.18, uu + 0.03, ph - 0.3, 0.2); }
  }
  Lc.box(MS, pc - pw / 2 - 0.7, ph, -0.02, pc + pw / 2 + 0.7, ph + 0.35, 0.3);
  Lc.box(G, pc - pw / 2 - 0.55, ph + 0.35, 0.0, pc + pw / 2 + 0.55, ph + 0.75, 0.22);
  Lc.box(MS, pc - pw / 2 - 0.8, ph + 0.75, -0.02, pc + pw / 2 + 0.8, ph + 1.0, 0.36);
  const ya = ph + 1.0, ra = pw / 2 + 0.55;
  Lc.add(MS, ext(archOutline(pc, ya, 2 * ra, ya, 'round', 14).slice(2), [], 0.0, 0.03));     // the lunette
  voussoirs(Lc, MS, pc, ya, ra, ra + 0.7, 0.0, 0.22, 17, 0.0);
  for (let i = 0; i < 17; i += 2) { const a = Math.PI * (i + 0.5) / 17, rr = ra + 0.35, g = box(-0.12, -0.33, 0.22, 0.12, 0.33, 0.24); g.rotateZ(a + Math.PI / 2); g.translate(pc + Math.cos(a) * rr, ya + Math.sin(a) * rr, 0); Lc.add(G, g); }
  // on each side: an avello, the Gothic side door, an avello — under pointed arches in white and green
  for (const side of [-1, 1]) {
    const a = side < 0 ? uc[0] + cr + 0.35 : uc[2] + cr + 0.35, b = side < 0 ? uc[1] - cr - 0.35 : uc[3] - cr - 0.35, span = b - a, aw = 2.5, dw = 2.9, gap = (span - 2 * aw - dw) / 2;
    const items = [[a + aw / 2, aw, 'avello'], [a + aw + gap + dw / 2, dw, 'door'], [b - aw / 2, aw, 'avello']];
    for (const [u, w, kind] of items) {
      const ys = kind === 'door' ? 3.6 : 2.6, top = ys + w * Math.sin(Math.PI / 3);
      Lc.add(O, ext(archOutline(u, kind === 'door' ? 0.02 : 0.75, w, ys, 'pointed', 8), [], -0.01, 0.012));
      pointedRing(Lc, u, ys, w, 0.32, 0.0, 0.14);
      for (const s of [-1, 1]) striped(Lc, u + s * w / 2 - (s > 0 ? 0 : 0.3), u + s * w / 2 + (s > 0 ? 0.3 : 0), kind === 'door' ? 0.02 : 0.6, ys, 0.0, 0.14, 0.4);
      // the gable over the arch with its green border
      const gh = 0.4, gw = w / 2 + 0.55;
      Lc.add(G, ext([[u - gw, top + 0.1], [u + gw, top + 0.1], [u, top + 0.1 + gh + gw * 0.55]], [[[u - gw + 0.3, top + 0.25], [u, top + gh + gw * 0.55 - 0.15], [u + gw - 0.3, top + 0.25]]], 0.0, 0.03));
      if (kind === 'avello') {
        // the tomb: the chest of white marble with a green panel, its lid, standing in the recess
        Lc.box(MS, u - w / 2 + 0.1, 0.75, 0.02, u + w / 2 - 0.1, 1.85, 0.42);
        Lc.box(G, u - w / 2 + 0.4, 1.0, 0.42, u + w / 2 - 0.4, 1.6, 0.44);
        Lc.box(MS, u - w / 2 + 0.05, 1.85, 0.0, u + w / 2 - 0.05, 2.0, 0.47);
        Lc.box(M, u - w / 2 - 0.1, yP, -0.02, u + w / 2 + 0.1, 0.75, 0.25);
      } else { Lc.box('wood_dark', u - w / 2, 0.6, 0.012, u + w / 2, ys, 0.06); Lc.box('iron', u - 0.04, 0.6, 0.06, u + 0.04, ys, 0.08); }
    }
    // above them the blind arcade of narrow round arches, drawn in green on the white
    const n = Math.round(span / 1.25), p = span / n;
    for (let k = 0; k < n; k++) {
      const u0 = a + k * p + 0.12, u1 = u0 + p - 0.24, um = (u0 + u1) / 2, ys = yE - 1.2;
      const outer = archOutline(um, 9.4, u1 - u0, ys, 'round', 8), inner = archOutline(um, 9.52, u1 - u0 - 0.2, ys, 'round', 8);
      Lc.add(G, ext(outer, [inner.reverse()], 0.0, 0.025));
      Lc.add(G, ext(ring(um, 8.95, 0.28, 14), [ring(um, 8.95, 0.18, 14).reverse()], 0.0, 0.025));
    }
    Lc.box(G, a, 8.3, 0.0, b, 8.45, 0.025);
  }
  // the entablature: the architrave, the frieze with the Rucellai sails, the cornice
  Lc.box(MS, -0.15, yE, -0.02, L + 0.15, yE + 0.42, 0.32);
  Lc.box(M, -0.15, yE + 0.42, -0.02, L + 0.15, yE + 1.05, 0.26);
  for (let u = 0.7; u < L - 0.5; u += 1.15) {
    // the sail, bellied in the wind on its mast, with its shrouds
    Lc.box(G, u - 0.02, yE + 0.5, 0.26, u + 0.02, yE + 0.98, 0.28);
    const sail = []; for (let i = 7; i >= 1; i--) { const t = i / 8; sail.push([u + 0.04 + Math.sin(t * Math.PI) * 0.22, yE + 0.58 + t * 0.34]); }
    Lc.add(G, ext([[u + 0.04, yE + 0.92], [u + 0.04, yE + 0.58], ...sail], [], 0.26, 0.285));
    Lc.box(G, u - 0.18, yE + 0.53, 0.26, u - 0.04, yE + 0.55, 0.28);
  }
  Lc.box(MS, -0.3, yE + 1.05, -0.02, L + 0.3, yF, 0.5);
  for (let u = 0.1; u < L - 0.15; u += 0.3) Lc.box(MS, u, yE + 1.08, 0.5, u + 0.15, yE + 1.22, 0.58);
  // the attic band: squares of green with white squares inside, a third of its height
  Lc.box(M, 0, yF, -0.02, L, yAt, 0.12);
  const sq = (yAt - yF) / 3, np = Math.round(L / (sq * 2.4)), pp = L / np;
  for (let k = 0; k < np; k++) { const uu = (k + 0.5) * pp, yy = (yF + yAt) / 2; Lc.add(G, ext([[uu - sq / 2, yy - sq / 2], [uu + sq / 2, yy - sq / 2], [uu + sq / 2, yy + sq / 2], [uu - sq / 2, yy + sq / 2]], [[[uu - sq * 0.3, yy - sq * 0.3], [uu - sq * 0.3, yy + sq * 0.3], [uu + sq * 0.3, yy + sq * 0.3], [uu + sq * 0.3, yy - sq * 0.3]]], 0.12, 0.14)); Lc.add(MS, ext([[uu, yy - sq * 0.22], [uu + sq * 0.22, yy], [uu, yy + sq * 0.22], [uu - sq * 0.22, yy]], [], 0.12, 0.145)); }
  Lc.box(MS, -0.1, yAt - 0.15, -0.02, L + 0.1, yAt, 0.22);
  // ---- the upper storey ---------------------------------------------------------------------------
  const u0 = q, u1 = L - q, yU = yAt + q * 0.98, yI = yU + 1.1, yPe = S * 0.84;   // its top, the inscription's frieze, the pediment
  Lc.box(M, u0, yAt, -0.02, u1, yU, 0.0);
  const pil = 0.95, pus = [u0 + pil / 2, u0 + (u1 - u0) * 0.27, u1 - (u1 - u0) * 0.27, u1 - pil / 2];
  for (const u of pus) striped(Lc, u - pil / 2, u + pil / 2, yAt, yU, 0, 0.22, 0.5);
  // the panels between the pilasters: green frames, a square with a roundel
  for (const [a, b] of [[pus[0] + pil / 2, pus[1] - pil / 2], [pus[2] + pil / 2, pus[3] - pil / 2]]) {
    const um = (a + b) / 2, w = b - a - 0.5;
    for (const yy of [yAt + 1.2, yAt + 4.6]) { Lc.add(G, ext([[um - w / 2, yy], [um + w / 2, yy], [um + w / 2, yy + w], [um - w / 2, yy + w]], [[[um - w / 2 + 0.18, yy + 0.18], [um - w / 2 + 0.18, yy + w - 0.18], [um + w / 2 - 0.18, yy + w - 0.18], [um + w / 2 - 0.18, yy + 0.18]]], 0.0, 0.025)); Lc.add(G, ext(ring(um, yy + w / 2, w * 0.28, 20), [ring(um, yy + w / 2, w * 0.2, 20).reverse()], 0.0, 0.025)); }
  }
  // the rose window, in its ring of white and green
  const ry = yAt + (yU - yAt) * 0.52, rr = (pus[2] - pus[1] - pil) * 0.36;
  Lc.add(GL, ext(ring(pc, ry, rr, 36), [], 0.0, 0.03));
  Lc.add(MS, ext(ring(pc, ry, rr + 0.45, 36), [ring(pc, ry, rr, 36).reverse()], 0.0, 0.16));
  Lc.add(G, ext(ring(pc, ry, rr + 0.85, 36), [ring(pc, ry, rr + 0.45, 36).reverse()], 0.0, 0.08));
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, g = box(-0.035, 0, 0.03, 0.035, rr, 0.07); g.rotateZ(a); g.translate(pc, ry, 0); Lc.add(MS, g); }
  Lc.add(MS, ext(ring(pc, ry, rr * 0.22, 16), [], 0.03, 0.09));
  // the upper entablature: the inscription on the frieze (IOHANES ORICELLARIVS PAV F AN SAL MCCCCLXX, the letters drawn as strokes), the cornice
  Lc.box(MS, u0 - 0.1, yU, -0.02, u1 + 0.1, yU + 0.3, 0.3);
  Lc.box(MS, u0 - 0.1, yU + 0.3, -0.02, u1 + 0.1, yI, 0.2);
  { const txt = 'IOHANES ORICELLARIVS PAV F AN SAL MCCCCLXX', cw = (u1 - u0 - 1.2) / txt.length, hgt = 0.42, yb = yU + 0.42;
    for (let i = 0; i < txt.length; i++) { const ch = txt[i]; if (ch === ' ') continue; const ux = u0 + 0.6 + i * cw; for (const [a, b, c, d, diag] of glyph(ch)) {
        if (!diag) { Lc.box(G, ux + a * cw * 0.7, yb + b * hgt, 0.2, ux + c * cw * 0.7 + 0.025, yb + d * hgt + 0.025, 0.215); continue; }
        const pa = [ux + a * cw * 0.7 + 0.0125, yb + b * hgt + 0.0125], pb = [ux + c * cw * 0.7 + 0.0125, yb + d * hgt + 0.0125], len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
        const g = box(0, -0.0125, 0.2, len, 0.0125, 0.215); g.rotateZ(Math.atan2(pb[1] - pa[1], pb[0] - pa[0])); g.translate(pa[0], pa[1], 0); Lc.add(G, g);
      } } }
  Lc.box(MS, u0 - 0.35, yI, -0.02, u1 + 0.35, yI + 0.45, 0.48);
  // the pediment: its raking cornices, the sun in its tympanum (the arms of the quarter: the child in a flaming sun)
  const ph2 = yPe - yI - 0.45, pts = [[u0 - 0.35, yI + 0.45], [u1 + 0.35, yI + 0.45], [pc, yPe]];
  Lc.add(M, ext(pts, [], -0.02, 0.1));
  const slope = Math.atan2(ph2, (u1 - u0) / 2 + 0.35), rl = Math.hypot(ph2, (u1 - u0) / 2 + 0.35);
  for (const s of [-1, 1]) { const g = s < 0 ? box(0, 0, 0.0, rl + 0.25, 0.38, 0.42) : box(-(rl + 0.25), 0, 0.0, 0, 0.38, 0.42); g.rotateZ(s < 0 ? slope : -slope); g.translate(s < 0 ? u0 - 0.5 : u1 + 0.5, yI + 0.45, 0); Lc.add(MS, g); }
  const sy = yI + 0.45 + ph2 * 0.38, sr = rr * 0.5;
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, len = k % 2 ? sr * 0.55 : sr * 0.8; Lc.add('gilt_bronze', ext([[pc + Math.cos(a - 0.08) * sr, sy + Math.sin(a - 0.08) * sr], [pc + Math.cos(a) * (sr + len), sy + Math.sin(a) * (sr + len)], [pc + Math.cos(a + 0.08) * sr, sy + Math.sin(a + 0.08) * sr]], [], 0.1, 0.13)); }
  Lc.add('gilt_bronze', ext(ring(pc, sy, sr, 24), [], 0.1, 0.16));
  Lc.add(MS, ext(ring(pc, sy, sr * 0.55, 16), [], 0.16, 0.2));
  // ---- the volutes: inverted scrolls filling the sixteenths beside the upper storey -------------------
  for (const side of [-1, 1]) {
    const mat = side > 0 && bare ? STU : M, inner = side < 0 ? u0 : u1, outer = side < 0 ? 0.25 : L - 0.25, hv = yU - 1.2 - yAt, big = 1.3, small = 0.75;
    // the outline: the S curve from the outer foot up to the upper storey's side, closed along the attic
    const curve = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; curve.push([outer + (inner - outer) * t, yAt + hv * 0.5 * (1 - Math.cos(t * Math.PI))]); }
    Lc.add(mat, ext([...curve, [inner, yAt]], [], -0.02, 0.18));
    // the curls: a large disc at the outer foot, a small one at the top, standing proud
    const bx = outer + (side < 0 ? big : -big), sx = inner - (side < 0 ? small : -small);
    Lc.add(mat, ext(ring(bx, yAt + big, big, 24), [], -0.02, 0.24));
    Lc.add(mat, ext(ring(sx, yU - 1.2 - small * 0.6, small, 20), [], -0.02, 0.22));
    if (mat !== M) continue;
    // the inlay: a green border inside the curve, green rings round white eyes in the curls, a roundel in the middle as large as the sun
    for (let i = 0; i + 1 < curve.length; i++) {
      const [a1, b1] = curve[i], [a2, b2] = curve[i + 1]; let nx = b2 - b1, ny = -(a2 - a1); if (ny > 0) { nx = -nx; ny = -ny; } const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
      Lc.add(G, ext([[a1 + nx * 0.12, b1 + ny * 0.12], [a2 + nx * 0.12, b2 + ny * 0.12], [a2 + nx * 0.36, b2 + ny * 0.36], [a1 + nx * 0.36, b1 + ny * 0.36]], [], 0.18, 0.2));
    }
    Lc.add(G, ext(ring(bx, yAt + big, big * 0.8, 24), [ring(bx, yAt + big, big * 0.6, 24).reverse()], 0.24, 0.26));
    Lc.add(MS, ext(ring(bx, yAt + big, big * 0.25, 16), [], 0.24, 0.27));
    const mx = outer + (inner - outer) * 0.62;
    Lc.add(G, ext(ring(mx, yAt + 1.6, sr, 20), [ring(mx, yAt + 1.6, sr * 0.78, 20).reverse()], 0.18, 0.2));
  }
  Lc.emit(bag, FM);
  col.floor([r[0] + 1, r[3], r[2] - 1, r[3] + 0.3], y + 0.6);
}
const toW = (M, u, d) => { const e = M.elements; return [e[12] + e[0] * u + e[8] * d, e[14] + e[2] * u + e[10] * d]; };

/** Roman capitals as strokes on a 1 × 1 cell: [u0, y0, u1, y1] rectangles (the stroke's width added by the caller). */
function glyph(c) {
  const V = (u, a = 0, b = 1) => [u, a, u, b], Hh = (y, a = 0, b = 1) => [a, y, b, y], D = (a, b, c, d) => [a, b, c, d, true];
  return ({
    I: [V(0.5)], O: [V(0), V(1), Hh(0), Hh(1)], H: [V(0), V(1), Hh(0.5)], A: [D(0, 0, 0.5, 1), D(0.5, 1, 1, 0), Hh(0.4, 0.2, 0.8)], N: [V(0), V(1), D(0, 1, 1, 0)],
    E: [V(0), Hh(0), Hh(0.5, 0, 0.7), Hh(1)], S: [Hh(0), Hh(0.5), Hh(1), V(0, 0.5, 1), V(1, 0, 0.5)], R: [V(0), Hh(1), Hh(0.5), V(1, 0.5, 1), D(0.4, 0.5, 1, 0)],
    C: [V(0), Hh(0), Hh(1)], L: [V(0), Hh(0)], V: [D(0, 1, 0.5, 0), D(0.5, 0, 1, 1)], P: [V(0), Hh(1), Hh(0.5), V(1, 0.5, 1)], F: [V(0), Hh(1), Hh(0.5, 0, 0.7)],
    M: [V(0), V(1), D(0, 1, 0.5, 0.35), D(0.5, 0.35, 1, 1)], X: [D(0, 0, 1, 1), D(0, 1, 1, 0)],
  })[c] ?? [V(0.5)];
}
