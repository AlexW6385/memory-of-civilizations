// The Secession building, Friedrichstraße 12 (docs/settlements/vienna.md §1, §4), as it stood for the Beethoven exhibition of
// April 1902: Olbrich's white cube with its four pylons, the motto and the three gorgons over the door, Moser's owls, the
// laurel dome; inside, the vestibule, the main hall under its skylights with Klinger's Beethoven in the middle, the left
// aisle with Klimt's frieze on three walls, the right aisle. Built in the building's frame (a east from the axis, b south from
// the front, v up), set in the world once. The front faces north (−z).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { prism, ngon } from '../dutch/facade.js';
import { fbox } from './fbox.js';
import { rng } from './mietshaus.js';

const MOTTO_FONT = {
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'], Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'], K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'], N: ['10001', '11001', '10101', '10101', '10101', '10011', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
};
const W = 34, D = 28, FL = 0.35, WH = 8.4, T = 0.5;

export function secession(el, ctx) {
  const { bag, col, lights } = ctx;
  const [x0, z0, x1] = el.rect, cx = (x0 + x1) / 2, y = el.y ?? 0, F0 = y + FL;
  const X = (a) => cx + a, Z = (b) => z0 + b;
  const bx = (m, a0, b0, a1, b1, v0, v1) => { if (a1 - a0 < 1e-4 || b1 - b0 < 1e-4 || v1 - v0 < 1e-4) return; bag.add(m, box(X(Math.min(a0, a1)), y + v0, Z(Math.min(b0, b1)), X(Math.max(a0, a1)), y + v1, Z(Math.max(b0, b1)))); };
  const ob = (a0, b0, a1, b1, v0, v1) => col.rect([X(a0), Z(b0), X(a1), Z(b1)], y + v0, y + v1);
  const solid = (m, a0, b0, a1, b1, v0, v1, collide = true) => { bx(m, a0, b0, a1, b1, v0, v1); if (collide) ob(a0, b0, a1, b1, v0, v1); };
  const lat = (m, prof, a, b, v, seg = 14) => bag.add(m, lathe(prof, seg, null, X(a), y + v, Z(b)));
  const light = (a, b, v, color = '#fff0d8', intensity = 9, distance = 16) => lights?.push({ at: [X(a), y + v, Z(b)], color, intensity, distance });
  /** A wall along a (at depth b) or along b (at a), th thick, v0…v1 with cuts [{ c, w, v0, v1 }] (the wall goes on over and under them). */
  const wall = (m, along, at, s0, s1, th, v0, v1, cuts = []) => {
    const put = (p0, p1, q0, q1) => { if (p1 - p0 < 1e-3 || q1 - q0 < 1e-3) return; if (along === 'a') solid(m, p0, at - th / 2, p1, at + th / 2, q0, q1); else solid(m, at - th / 2, p0, at + th / 2, p1, q0, q1); };
    let s = s0;
    for (const c of [...cuts].sort((p, q) => p.c - q.c)) { const c0 = c.c - c.w / 2, c1 = c.c + c.w / 2, cv0 = c.v0 ?? v0, cv1 = c.v1 ?? v1; put(s, c0, v0, v1); if (cv0 > v0 + 1e-3) put(c0, c1, v0, cv0); put(c0, c1, cv1, v1); s = c1; }
    put(s, s1, v0, v1);
  };
  const WALL = 'plaster_white', G = 'gold';
  const fr = (f) => ({ w: f.w, D: f.D, at: (u, d) => f.at(u, d) });

  // ── the ground and the shell ───────────────────────────────────────────────────────────────
  bx('granite_grey', -W / 2 - 0.3, -0.3, W / 2 + 0.3, D + 0.3, -1.0, 0.0);                                   // the plinth
  bx('marble_floor', -W / 2, 0, W / 2, D, -0.2, FL);
  col.floor([X(-W / 2), Z(0), X(W / 2), Z(D)], F0);
  // steps up to the porch (b 0…1.2: two risers)
  bx('granite_grey', -4.2, -0.05, 4.2, 0.6, -0.3, FL * 0.5); bx('granite_grey', -4.2, 0.6, 4.2, 1.2, -0.3, FL);
  col.ramp([X(-4.2), Z(-0.05), X(4.2), Z(1.2)], y, F0, 's');
  // the front wall (b 2.8…3.6) with the portal; the side walls with clerestory windows; the back wall
  wall(WALL, 'a', 3.2, -W / 2, W / 2, 0.8, -0.2, WH, [{ c: 0, w: 3.4, v0: -0.2, v1: FL + 4.3 }]);
  const clere = [];
  for (let k = 0; k < 6; k++) clere.push({ c: 7.6 + k * 3.1, w: 1.5, v0: FL + 5.4, v1: FL + 7.3 });
  for (const s of [-1, 1]) wall(WALL, 'b', s * (W / 2 - T / 2), 0, D, T, -0.2, WH, clere.map((c) => ({ ...c, c: c.c + 0 })));
  wall(WALL, 'a', D - T / 2, -W / 2, W / 2, T, -0.2, WH);
  // the side windows' glass and frames (drawn on the outer face)
  for (const s of [-1, 1]) for (const c of clere) { bx('opening', s * (W / 2 - 0.03) - 0.02, c.c - c.w / 2, s * (W / 2 - 0.03) + 0.02, c.c + c.w / 2, c.v0, c.v1); bx('iron', s * (W / 2 - 0.3), c.c - 0.02, s * (W / 2 - 0.0) + (s > 0 ? 0.0 : 0), c.c + 0.02, c.v0, c.v1); }
  // ── the pylons, the header, the cornice ────────────────────────────────────────────────────
  const pyl = (a0, b0, a1, b1, h, framed) => {
    solid(WALL, a0, b0, a1, b1, -0.2, h);
    // a base course with a shadow-line, the stepped cornice over a row of dentils, the gilt cap
    bx('stucco_pale', a0 - 0.1, b0 - 0.1, a1 + 0.1, b1 + 0.1, -0.2, 1.0); bx('stucco_pale', a0 - 0.05, b0 - 0.05, a1 + 0.05, b1 + 0.05, 1.0, 1.12);
    for (let a = a0 + 0.15; a < a1 - 0.2; a += 0.34) bx('stucco_pale', a, b0 - 0.1, a + 0.2, b0, h - 0.3, h - 0.1);
    bx('stucco_pale', a0 - 0.05, b0 - 0.05, a1 + 0.05, b1 + 0.05, h - 0.1, h); bx('stucco_pale', a0 - 0.12, b0 - 0.12, a1 + 0.12, b1 + 0.12, h, h + 0.14);
    bx('stucco_pale', a0 - 0.2, b0 - 0.2, a1 + 0.2, b1 + 0.2, h + 0.14, h + 0.28); bx('stucco_pale', a0 - 0.12, b0 - 0.12, a1 + 0.12, b1 + 0.12, h + 0.28, h + 0.4);
    bx('gilt_bronze', a0 + 0.3, b0 + 0.3, a1 - 0.3, b1 - 0.3, h + 0.4, h + 0.44);
    if (framed) {   // the raised frame round the laurel field on the front face, and on the side face toward the porch
      const fw = 0.1, u0 = a0 + 0.35, u1 = a1 - 0.35, v0 = 1.7, v1 = h - 1.2;
      bx('stucco_pale', u0, b0 - fw, u1, b0, v0, v0 + 0.14); bx('stucco_pale', u0, b0 - fw, u1, b0, v1 - 0.14, v1);
      bx('stucco_pale', u0, b0 - fw, u0 + 0.14, b0, v0, v1); bx('stucco_pale', u1 - 0.14, b0 - fw, u1, b0, v0, v1);
      bx('stucco_pale', u0 + 0.14, b0 - 0.03, u1 - 0.14, b0, v0 + 0.14, v0 + 0.2); bx('stucco_pale', u0 + 0.14, b0 - 0.03, u1 - 0.14, b0, v1 - 0.2, v1 - 0.14);
    }
  };
  for (const s of [-1, 1]) { pyl(s < 0 ? -17 : 11, 0, s < 0 ? -11 : 17, 6, 13.2, true); pyl(s < 0 ? -6.6 : 4.2, 0, s < 0 ? -4.2 : 6.6, 3.2, 10.0, false); }
  // golden spheres on the pylons' tops
  for (const [a, b, h] of [[-14, 3, 13.64], [14, 3, 13.64], [-5.4, 1.6, 10.44], [5.4, 1.6, 10.44]]) lat('gilt_bronze', [[0.001, 0], [0.35, 0.1], [0.5, 0.5], [0.35, 0.9], [0.001, 1.0]], a, b, h, 12);
  // between the pylons: the wall's top course and cornice
  bx('stucco_pale', -17.1, 2.7, 17.1, 3.7, WH, WH + 0.35);
  bx('stucco_pale', -17.2, 2.6, 17.2, 3.8, WH - 0.12, WH); bx('stucco_pale', -17.2, 2.6, 17.2, 3.8, WH, WH + 0.0);
  // the flanks: a cornice course and a string course, and a frame (jambs, sill, lintel, glazing bars) round every clerestory window
  for (const s of [-1, 1]) {
    const o = (a0, a1) => (s < 0 ? [-W / 2 - a1, -W / 2 - a0] : [W / 2 + a0, W / 2 + a1]);
    const side = (a0, a1, b0, b1, v0, v1, m = 'stucco_pale') => { const [p0, p1] = o(a0, a1); bx(m, p0, b0, p1, b1, v0, v1); };
    side(0, 0.12, 6, D, WH - 0.35, WH - 0.15); side(0, 0.2, 6, D, WH - 0.15, WH + 0.05); side(0, 0.1, 6, D, FL + 4.6, FL + 4.8); side(0, 0.06, 6, D, -0.2, 0.9);
    for (const c of clere) {
      const b0 = c.c - c.w / 2, b1 = c.c + c.w / 2;
      side(0, 0.1, b0 - 0.16, b0, c.v0 - 0.12, c.v1 + 0.2); side(0, 0.1, b1, b1 + 0.16, c.v0 - 0.12, c.v1 + 0.2);
      side(0, 0.18, b0 - 0.16, b1 + 0.16, c.v0 - 0.12, c.v0); side(0, 0.12, b0 - 0.16, b1 + 0.16, c.v1, c.v1 + 0.2);
      for (const f of [1 / 3, 2 / 3]) side(-0.04, 0.03, b0, b1, c.v0 + (c.v1 - c.v0) * f - 0.02, c.v0 + (c.v1 - c.v0) * f + 0.02, 'iron');
      side(-0.04, 0.03, c.c - 0.02, c.c + 0.02, c.v0, c.v1, 'iron');
    }
  }
  // the header over the porch: motto band and the three gorgons
  solid(WALL, -4.2, 0, 4.2, 1.2, FL + 4.9, FL + 8.6);
  const FH = { w: 8.4, D: 1.2, at: (u, d) => [X(4.2 - u), Z(-d)] };          // the header's face (looking north): u east, d outward
  const A = (m, ...q) => bag.add(m, fbox(FH, y, ...q)), Pz = (m, pts, d0, d1) => bag.add(m, prism(FH, y, pts, d0, d1));
  A('stucco_pale', -0.1, 8.5, FL + 4.9, FL + 5.1, 0, 0.12);
  // the motto, two lines of gilded capitals in a 5 x 7 raster, each row a run of bars (DER ZEIT IHRE KUNST / DER KUNST IHRE FREIHEIT)
  for (const [line, text] of [[0, 'DER ZEIT IHRE KUNST'], [1, 'DER KUNST IHRE FREIHEIT']]) {
    const pitch = 0.34, sx = 0.052, sy = 0.07, u00 = 4.2 - text.length * pitch / 2 + (pitch - 5 * sx) / 2, v0 = FL + 7.95 - line * 0.65;
    for (let k = 0; k < text.length; k++) {
      const g = MOTTO_FONT[text[k]]; if (!g) continue;
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
        if (g[r][c] !== '1') continue; let e = c; while (e + 1 < 5 && g[r][e + 1] === '1') e++;
        const u = u00 + k * pitch; A(G, u + c * sx, u + (e + 1) * sx, v0 + (6 - r) * sy, v0 + (7 - r) * sy, -0.02, 0.07); c = e;
      }
    }
  }
  // the three gorgons: gilt heads (disc, hair of snakes as radiating bars, the face)
  for (const [k, u] of [4.2 - 1.9, 4.2, 4.2 + 1.9].entries()) {
    const v = FL + 5.9;
    Pz(G, ngon(u, v, 0.55, 14), -0.02, 0.12);
    for (let s = 0; s < 10; s++) { const a = s / 10 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a); Pz('gilt_bronze', [[u + c * 0.5 - sn * 0.06, v + sn * 0.5 + c * 0.06], [u + c * 0.5 + sn * 0.06, v + sn * 0.5 - c * 0.06], [u + c * 0.85, v + sn * 0.85]], 0.0, 0.1); }
    Pz('ivory', ngon(u, v, 0.34, 12), 0.1, 0.16);
    for (const sg of [-1, 1]) Pz('lacquer_black', ngon(u + sg * 0.12, v + 0.08, 0.045, 6), 0.16, 0.18);
    Pz('lacquer_black', [[u - 0.1, v - 0.16], [u + 0.1, v - 0.16], [u, v - 0.06]], 0.16, 0.18);
    void k;
  }
  // laurel ornament in gilt on the outer pylons' faces and between the pylons: a stem and pairs of leaves
  const leafStem = (Fr, u, v0, v1, n) => {
    const AA = (m, ...q) => bag.add(m, fbox(Fr, y, ...q)), PP = (m, pts, d0, d1) => bag.add(m, prism(Fr, y, pts, d0, d1));
    AA(G, u - 0.03, u + 0.03, v0, v1, 0.0, 0.05);
    for (let k = 0; k < n; k++) { const v = v0 + 0.3 + (v1 - v0 - 0.5) * k / Math.max(1, n - 1); for (const sg of [-1, 1]) PP(G, [[u, v], [u + sg * 0.5, v + 0.18], [u + sg * 0.08, v + 0.4]], 0.0, 0.06); }
    PP(G, ngon(u, v1 + 0.12, 0.14, 6), 0.0, 0.06);
  };
  const FP = (s) => ({ w: 6, D: 6, at: (u, d) => [X(s < 0 ? -17 + u : 11 + u), Z(-d)] });
  for (const s of [-1, 1]) { const Fr = FP(s); for (const u of [1.5, 3, 4.5]) leafStem(Fr, u, FL + 3.4, FL + 10.8, 7); }
  // the recessed wall panels between the pylons (face at b 2.8): a frame of gilt lines, a gilt laurel tree rising from a low mound, the course of small gilt squares under the cornice
  for (const s of [-1, 1]) {
    const Fr = { w: 4.4, D: 2.8, at: (u, d) => [X((s < 0 ? -11 : 6.6) + u), Z(2.8 - d)] }, AA = (m, ...q) => bag.add(m, fbox(Fr, y, ...q)), PP = (m, pts, d0, d1) => bag.add(m, prism(Fr, y, pts, d0, d1));
    for (const [u0, u1, v0, v1] of [[0.25, 4.15, 1.0, 1.06], [0.25, 4.15, WH - 1.1, WH - 1.04], [0.25, 0.31, 1.0, WH - 1.04], [4.09, 4.15, 1.0, WH - 1.04]]) AA(G, u0, u1, v0, v1, 0.0, 0.05);
    leafStem(Fr, 2.2, 1.6, 6.9, 9);
    for (const q of [-1, 1]) { PP(G, [[2.2, 1.6], [2.2 + q * 0.9, 1.75], [2.2 + q * 0.2, 2.05]], 0.0, 0.06); PP(G, [[2.2 + q * 0.5, 4.2], [2.2 + q * 1.15, 4.6], [2.2 + q * 0.55, 4.9]], 0.0, 0.06); }
    PP(G, [[1.3, 1.0], [3.1, 1.0], [2.8, 1.55], [1.6, 1.55]], 0.0, 0.06);
    for (let u = 0.6; u < 4.0; u += 0.4) AA(G, u - 0.07, u + 0.07, WH - 0.62, WH - 0.48, 0.0, 0.04);
  }
  // Moser's owls on stone bases at the foot of the inner pylons
  for (const s of [-1, 1]) {
    const a = s * 7.5, b = 0.5;
    bx('sandstone_white', a - 0.5, b - 0.5, a + 0.5, b + 0.5, -0.2, 1.1); ob(a - 0.5, b - 0.5, a + 0.5, b + 0.5, -0.2, 2.4);
    const SW = 'sandstone_white';
    lat(SW, [[0.001, 1.1], [0.34, 1.12], [0.4, 1.4], [0.38, 1.75], [0.3, 2.0], [0.22, 2.08], [0.001, 2.1]], a, b, 0, 14);                   // the body
    lat(SW, [[0.001, 1.95], [0.3, 2.0], [0.36, 2.2], [0.3, 2.4], [0.18, 2.5], [0.001, 2.52]], a, b - 0.04, 0, 14);                          // the head, broad
    for (const q of [-1, 1]) {
      bx(SW, a + q * 0.2 - 0.06, b - 0.2, a + q * 0.2 + 0.06, b - 0.04, 2.45, 2.75);                                                      // ear tufts
      lat('gold', [[0.001, 0], [0.12, 0.01], [0.13, 0.04], [0.001, 0.05]], a + q * 0.15, b - 0.33, 2.27, 10); lat('lacquer_black', [[0.001, 0.04], [0.05, 0.045], [0.001, 0.07]], a + q * 0.15, b - 0.33, 2.27, 8);   // the great round eyes
      bag.add(SW, rod([X(a + q * 0.12), y + 1.75, Z(b - 0.37)], [X(a + q * 0.3), y + 1.2, Z(b - 0.33)], 0.035, 5));                      // the folded wing's edge
      bag.add(SW, rod([X(a + q * 0.04), y + 1.8, Z(b - 0.4)], [X(a + q * 0.16), y + 1.25, Z(b - 0.38)], 0.03, 5));
      for (const t of [-0.07, 0, 0.07]) bx(SW, a + q * 0.18 + t - 0.02, b - 0.4, a + q * 0.18 + t + 0.02, b - 0.3, 1.1, 1.2);        // the toes
    }
    bx('gilt_bronze', a - 0.04, b - 0.4, a + 0.04, b - 0.34, 2.12, 2.24);                                                               // the beak
    for (let k = 0; k < 5; k++) for (const q of [-0.16, 0, 0.16]) bx(SW, a + q + (k % 2 ? 0.08 : 0) - 0.05, b - 0.4, a + q + (k % 2 ? 0.08 : 0) + 0.05, b - 0.34, 1.45 + k * 0.1, 1.5 + k * 0.1);   // breast feathers
  }
  // tripod bowls on the wall tops between the pylons
  for (const a of [-8.8, 8.8]) {
    for (let k = 0; k < 3; k++) { const th = k * 2.094 + 0.3; bag.add('gilt_bronze', rod([X(a + Math.cos(th) * 0.55), y + WH + 0.35, Z(3.2 + Math.sin(th) * 0.55)], [X(a), y + WH + 1.5, Z(3.2)], 0.05, 5)); }
    lat('gilt_bronze', [[0.001, 1.45], [0.45, 1.55], [0.6, 1.95], [0.5, 2.0], [0.001, 1.7]], a, 3.2, WH + 0, 14); lat('flame', [[0.001, 1.9], [0.25, 2.0], [0.1, 2.5], [0.001, 2.7]], a, 3.2, WH + 0, 8);
  }
  // the lettering band's cornice over the door and the portal's jambs
  bx('stucco_pale', -2.0, 2.7, -1.7, 3.7, -0.2, FL + 4.5); bx('stucco_pale', 1.7, 2.7, 2.0, 3.7, -0.2, FL + 4.5); bx('stucco_pale', -2.0, 2.7, 2.0, 3.7, FL + 4.3, FL + 4.6);
  // the portal: a stepped architrave on the outer face, a leaf of two panelled doors in dark wood with gilt handles, the transom glazed in bars
  { const tp = FL + 4.3;
    bx('stucco_pale', -2.28, 2.58, -2.0, 2.7, -0.2, tp + 0.5); bx('stucco_pale', 2.0, 2.58, 2.28, 2.7, -0.2, tp + 0.5); bx('stucco_pale', -2.28, 2.58, 2.28, 2.7, tp, tp + 0.5);
    bx('stucco_pale', -2.1, 2.66, -1.7, 2.7, -0.2, tp + 0.0); bx('stucco_pale', 1.7, 2.66, 2.1, 2.7, -0.2, tp); bx('stucco_pale', -2.1, 2.66, 2.1, 2.7, tp - 0.12, tp);
    bx('gilt_bronze', -1.72, 2.74, 1.72, 2.78, tp - 0.06, tp - 0.02);
    for (const sg of [-1, 1]) {
      const a0 = sg < 0 ? -1.7 : 0.02, a1 = sg < 0 ? -0.02 : 1.7, w = 1.68;
      bx('wood_dark', a0, 3.0, a1, 3.4, FL, FL + 3.6);
      for (const [p0, p1] of [[0.12, 0.62], [0.78, 1.56]]) for (const [v0, v1] of [[0.2, 1.5], [1.7, 3.4]]) bx('wood_ochre', a0 + (sg < 0 ? p0 : w - p1), 2.94, a0 + (sg < 0 ? p1 : w - p0), 3.0, FL + v0, FL + v1);
      bx('gilt_bronze', sg < 0 ? -0.2 : 0.12, 2.9, sg < 0 ? -0.12 : 0.2, 3.0, FL + 1.5, FL + 2.0);
    }
    bx('wood_dark', -1.7, 2.98, 1.7, 3.4, FL + 3.6, FL + 3.72); bx('opening', -1.6, 3.38, 1.6, 3.42, FL + 3.72, FL + 4.2);
    for (let a = -1.2; a <= 1.2; a += 0.4) bx('iron', a - 0.02, 3.0, a + 0.02, 3.4, FL + 3.72, FL + 4.2); bx('iron', -1.6, 3.0, 1.6, 3.4, FL + 3.95, FL + 3.99); }
  // ── the dome: a square drum over the middle of the hall, the ball of gilded laurel leaves ────────────
  const DB = 17.2, DT = WH + 0.3;
  solid(WALL, -2.7, DB - 2.7, 2.7, DB + 2.7, WH, DT + 5.0, false); bx('stucco_pale', -3.0, DB - 3.0, 3.0, DB + 3.0, DT + 5.0, DT + 5.3);
  for (const s of [-1, 1]) for (const t of [-1, 1]) bx('stucco_pale', s * 2.7 - 0.2 + (s > 0 ? -0.0 : 0), DB + t * 2.7 - 0.2, s * 2.7 + 0.2, DB + t * 2.7 + 0.2, WH, DT + 5.0);
  // the drum's four faces: a raised frame, and in it a wreath of gilt laurel leaves round a gilt disc; a base course; a second step under the cornice
  bx('stucco_pale', -2.85, DB - 2.85, 2.85, DB + 2.85, WH, WH + 0.5); bx('stucco_pale', -3.15, DB - 3.15, 3.15, DB + 3.15, DT + 5.3, DT + 5.45);
  for (let q = 0; q < 4; q++) {
    const Fd = [{ w: 5.4, D: 1, at: (u, d) => [X(-2.7 + u), Z(DB - 2.7 - d)] }, { w: 5.4, D: 1, at: (u, d) => [X(2.7 - u), Z(DB + 2.7 + d)] },
      { w: 5.4, D: 1, at: (u, d) => [X(2.7 + d), Z(DB - 2.7 + u)] }, { w: 5.4, D: 1, at: (u, d) => [X(-2.7 - d), Z(DB + 2.7 - u)] }][q];
    const A3 = (m, ...r) => bag.add(m, fbox(Fd, y, ...r)), P3 = (m, pts, d0, d1) => bag.add(m, prism(Fd, y, pts, d0, d1));
    const v0 = WH + 0.95, v1 = DT + 4.5, vc = (v0 + v1) / 2;
    A3('stucco_pale', 0.4, 5.0, v0, v0 + 0.14, 0, 0.1); A3('stucco_pale', 0.4, 5.0, v1 - 0.14, v1, 0, 0.1); A3('stucco_pale', 0.4, 0.54, v0, v1, 0, 0.1); A3('stucco_pale', 4.86, 5.0, v0, v1, 0, 0.1);
    for (let k = 0; k < 16; k++) { const th = k / 16 * Math.PI * 2, c = Math.cos(th), sn = Math.sin(th), rr0 = 1.0;
      P3(G, [[2.7 + c * rr0 - sn * 0.17, vc + sn * rr0 + c * 0.17], [2.7 + c * rr0 + sn * 0.17, vc + sn * rr0 - c * 0.17], [2.7 + c * (rr0 + 0.62), vc + sn * (rr0 + 0.62)]], 0, 0.06); }
    P3(G, ngon(2.7, vc, 0.6, 16), 0, 0.05); P3('stucco_pale', ngon(2.7, vc, 0.45, 16), 0.05, 0.08);
    for (let k = 0; k < 8; k++) { const th = (k + 0.5) / 8 * Math.PI * 2; P3(G, ngon(2.7 + Math.cos(th) * 0.28, vc + Math.sin(th) * 0.28, 0.07, 5), 0.08, 0.11); }
  }
  const cyBall = DT + 5.3 + 3.6, Rb = 4.25;
  bag.add('glaze_yellow', lathe([[0.001, -Rb * 0.8], [Rb * 0.6, -Rb * 0.78], [Rb * 0.92, -Rb * 0.3], [Rb * 0.98, 0.1], [Rb * 0.88, Rb * 0.55], [Rb * 0.55, Rb * 0.88], [0.001, Rb * 0.98]], 16, null, X(0), y + cyBall, Z(DB)));
  {
    const tris = [], rr = rng(1898);
    const rings = 17;
    for (let i = 1; i <= rings; i++) {
      const ph = -0.5 + (i / (rings + 1)) * 2.9 * 0.5 + 0.0, lat0 = -0.25 + i / (rings + 1) * (Math.PI / 2 + 0.25), cphi = Math.cos(lat0), n = Math.max(6, Math.round(40 * cphi));
      void ph;
      for (let k = 0; k < n; k++) {
        const th = (k + (i % 2) * 0.5) / n * Math.PI * 2 + rr() * 0.05;
        const nx = Math.cos(th) * cphi, ny = Math.sin(lat0), nz = Math.sin(th) * cphi, R = Rb;
        const ex = [-Math.sin(th), 0, Math.cos(th)], ey = [-Math.cos(th) * Math.sin(lat0), cphi, -Math.sin(th) * Math.sin(lat0)];
        const L = 1.0, Wd = 0.56, p = [nx * R, ny * R, nz * R];
        const pt = (u, v, out = 0) => [X(0) + p[0] + ex[0] * u + ey[0] * v + nx * out, y + cyBall + p[1] + ex[1] * u + ey[1] * v + ny * out, Z(DB) + p[2] + ex[2] * u + ey[2] * v + nz * out];
        const top = pt(0, L / 2, 0.02), bot = pt(0, -L / 2, 0.02), l = pt(-Wd / 2, 0, 0.03), r = pt(Wd / 2, 0, 0.03), c = pt(0, 0, 0.11);
        for (const [a, b] of [[top, r], [r, bot], [bot, l], [l, top]]) {
          const t = [...c, ...a, ...b], ux = a[0] - c[0], uy = a[1] - c[1], uz = a[2] - c[2], vx = b[0] - c[0], vy = b[1] - c[1], vz = b[2] - c[2];
          const cx2 = uy * vz - uz * vy, cy2 = uz * vx - ux * vz, cz2 = ux * vy - uy * vx;
          if (cx2 * nx + cy2 * ny + cz2 * nz < 0) tris.push(...c, ...b, ...a); else tris.push(...t);
        }
      }
    }
    bag.add('gold', fromTriangles(tris));
  }
  // the ball's crown and the finial
  lat('gold', [[0.001, 0], [0.3, 0.1], [0.12, 0.5], [0.001, 1.2]], 0, DB, cyBall + Rb * 0.98, 8);
  // ── the roof: lead, with the skylights over the hall (the drum between them) ────────────────────────
  const hole = [[-8, 10.8, 8, 14.2], [-8, 20.2, 8, 24]];
  for (const r of subtractRects([-W / 2, 0, W / 2, D], hole)) bx('lead', r[0], r[1], r[2], r[3], WH, WH + 0.3);
  for (const h of hole) { bx('daylight', h[0], h[1], h[2], h[3], WH + 0.1, WH + 0.2); for (let k = 0; k <= 4; k++) { const a = h[0] + (h[2] - h[0]) * k / 4; bx('iron', a - 0.04, h[1], a + 0.04, h[3], WH + 0.35, WH + 0.5); } }
  // ── the interior ──────────────────────────────────────────────────────────────────────────────
  // vestibule: a −10.6…10.6, b 3.6…8.6; its three doors; ceiling at 4.6
  const doorV = FL + 3.3;
  wall(WALL, 'a', 8.85, -W / 2 + T, W / 2 - T, 0.5, FL, WH, [{ c: 0, w: 5.0, v0: FL, v1: FL + 3.8 }, { c: -13.3, w: 2.2, v0: FL, v1: doorV }, { c: 13.3, w: 2.2, v0: FL, v1: doorV }]);
  for (const s of [-1, 1]) wall(WALL, 'b', s * 10.85, 3.6, 8.6, 0.5, FL, WH, [{ c: 6.1, w: 2.2, v0: FL, v1: doorV }]);
  // the hall's side walls (partitions to the aisles) with the opening for the statue's view on the left; the aisles' south walls
  wall(WALL, 'b', -10.85, 8.6, 25, 0.5, FL, WH, [{ c: 17.2, w: 2.4, v0: FL + 0.9, v1: FL + 3.2 }]);
  wall(WALL, 'b', 10.85, 8.6, 25, 0.5, FL, WH, [{ c: 17.2, w: 2.4, v0: FL, v1: FL + 3.2 }]);
  for (const s of [-1, 1]) wall(WALL, 'a', 25.5, s < 0 ? -W / 2 + T : 11.1, s < 0 ? -11.1 : W / 2 - T, 0.5, FL, WH);
  wall(WALL, 'a', 25.4, -10.6, 10.6, 0.6, FL, WH);
  // ceilings: the vestibule's and the aisles', the hall's with its lights; the glazed bays
  bx('plaster_white', -W / 2, 3.6, W / 2, 8.6, FL + 4.6, WH);
  for (const s of [-1, 1]) bx('plaster_white', s < 0 ? -16.5 : 11.1, 8.6, s < 0 ? -11.1 : 16.5, 25.5, FL + 5.6, WH);
  bx('plaster_white', -10.6, 8.6, 10.6, 10.8, FL + 7.9, WH); bx('plaster_white', -10.6, 14.2, 10.6, 20.2, FL + 7.9, WH); bx('plaster_white', -10.6, 24, 10.6, 25.5, FL + 7.9, WH);
  for (const h of hole) for (const [a0, a1] of [[-10.6, h[0]], [h[2], 10.6]]) bx('plaster_white', a0, h[1], a1, h[3], FL + 7.9, WH);
  // floors: parquet in the hall and aisles
  for (const r of [[-16.5, 8.6, -11.1, 25.5], [11.1, 8.6, 16.5, 25.5], [-10.6, 8.6, 10.6, 25.5]]) bx('wood_ochre', r[0], r[1], r[2], r[3], FL - 0.02, FL + 0.02);
  for (const r of [[-16.5, 3.6, -11.1, 8.6], [11.1, 3.6, 16.5, 8.6]]) bx('wood_ochre', r[0], r[1], r[2], r[3], FL - 0.02, FL + 0.02);
  // Hoffmann's frieze of gilt squares round the hall at 7 m, a dado of dark wood to the height of a hand
  { const sq = (a, b, vertical) => bx(G, a - 0.16, b - 0.16, a + 0.16, b + 0.16, FL + 6.75, FL + 7.1);
    for (let a = -10.0; a <= 10.0; a += 1.0) { sq(a, 9.4); sq(a, 24.7); }
    for (let b = 10.4; b <= 24.0; b += 1.0) { sq(-10.2, b); sq(10.2, b); } }
  for (const [a0, b0, a1, b1] of [[-10.6, 9.15, 10.6, 9.25], [-10.6, 24.9, 10.6, 25.0], [-10.6 + 0.0, 9.15, -10.5, 25], [10.5, 9.15, 10.6, 25]]) void [a0, b0, a1, b1];
  // the statue of Beethoven by Klinger in the middle of the hall (a, b) = (0, 17.2): black marble plinth in two steps, the throne of coloured
  // marbles with a tall bronze back and angel heads on its cheeks, the figure bare to the waist (ivory) leaning forward, drapery of bronze over
  // the knees, fists clenched, the eagle at his side; he faces the entrance (north)
  {
    const b = 17.2, V = FL;
    bx('marble_dark', -2.4, b - 2.1, 2.4, b + 2.1, V - 0.02, V + 0.3); bx('marble_dark', -2.0, b - 1.7, 2.0, b + 1.7, V + 0.3, V + 0.7); bx('gilt_bronze', -2.02, b - 1.72, 2.02, b + 1.72, V + 0.7, V + 0.72);
    bx('marble_pink', -1.25, b - 1.05, 1.25, b + 1.05, V + 0.72, V + 1.2); bx('bronze', -1.3, b - 1.1, 1.3, b + 1.1, V + 1.2, V + 1.27);
    for (const t of [-0.8, -0.27, 0.27, 0.8]) bx('gilt_bronze', t - 0.05, b - 1.07, t + 0.05, b - 1.05, V + 0.8, V + 1.12);               // gilt inlay on the base's front
    bx('marble_pink', -1.0, b - 0.2, 1.0, b + 0.8, V + 1.27, V + 1.62); bx('gilt_bronze', -1.02, b - 0.22, 1.02, b - 0.18, V + 1.55, V + 1.62);        // the seat
    for (const sg of [-1, 1]) {
      bx('bronze', sg * 1.05 - 0.13, b - 0.2, sg * 1.05 + 0.13, b + 0.85, V + 1.27, V + 2.2); bx('gilt_bronze', sg * 1.05 - 0.17, b - 0.26, sg * 1.05 + 0.17, b + 0.9, V + 2.2, V + 2.27);  // the cheeks
      for (const [dz, v] of [[0.15, 1.65], [0.55, 1.95]]) bag.add('ivory', lathe([[0.001, -0.12], [0.1, -0.06], [0.13, 0.04], [0.08, 0.14], [0.001, 0.17]], 8, null, X(sg * 1.2), y + V + v, Z(b + dz)));   // angel heads
    }
    bx('bronze', -1.3, b + 0.8, 1.3, b + 1.1, V + 1.27, V + 2.7); bx('bronze', -1.0, b + 0.8, 1.0, b + 1.1, V + 2.7, V + 4.05); bx('gilt_bronze', -1.05, b + 0.76, 1.05, b + 1.14, V + 4.05, V + 4.15);
    for (const sg of [-1, 1]) { bx('marble_pink', sg * 0.8 - 0.22, b + 0.74, sg * 0.8 + 0.22, b + 0.8, V + 1.9, V + 3.7); bx('gold', sg * 0.8 - 0.26, b + 0.74, sg * 0.8 - 0.22, b + 0.8, V + 1.9, V + 3.7); bx('gold', sg * 0.8 + 0.22, b + 0.74, sg * 0.8 + 0.26, b + 0.8, V + 1.9, V + 3.7); }
    // the figure
    const R = (p, q, r) => bag.add('ivory', rod([X(p[0]), y + V + p[1], Z(b + p[2])], [X(q[0]), y + V + q[1], Z(b + q[2])], r, 8));
    bx('bronze', -0.72, b - 0.55, 0.72, b + 0.45, V + 1.62, V + 2.0); bx('bronze', -0.72, b - 0.72, 0.72, b - 0.5, V + 1.4, V + 1.95);
    for (const t of [-0.55, -0.28, 0, 0.28, 0.55]) bx('bronze', t - 0.035, b - 0.76, t + 0.035, b - 0.72, V + 1.42, V + 1.9);                              // the folds
    for (const sg of [-1, 1]) bx('bronze', sg * 0.4 - 0.2, b - 1.05, sg * 0.4 + 0.2, b - 0.7, V + 1.27, V + 1.4);                                          // the feet
    R([0, 1.75, 0.3], [0, 2.7, -0.05], 0.42); R([-0.5, 2.75, -0.05], [0.5, 2.75, -0.05], 0.2);                                                           // chest, shoulders
    for (const sg of [-1, 1]) { R([sg * 0.52, 2.7, -0.05], [sg * 0.58, 2.15, -0.3], 0.11); R([sg * 0.58, 2.15, -0.3], [sg * 0.42, 2.02, -0.6], 0.1); bx('ivory', sg * 0.42 - 0.1, b - 0.72, sg * 0.42 + 0.1, b - 0.5, V + 1.95, V + 2.12); }
    R([0, 2.78, -0.05], [0, 2.98, -0.3], 0.13);
    bag.add('ivory', lathe([[0.001, -0.17], [0.15, -0.1], [0.2, 0.05], [0.18, 0.22], [0.1, 0.34], [0.001, 0.37]], 10, null, X(0), y + V + 2.95, Z(b - 0.36)));   // the head, bowed
    bag.add('lacquer_black', lathe([[0.001, 0.2], [0.17, 0.2], [0.21, 0.3], [0.19, 0.36], [0.001, 0.4]], 8, null, X(0), y + V + 2.95, Z(b - 0.28)));            // the hair
    // the eagle, on the plinth's step at his side
    { const ea = 1.65, eb = b - 0.9, e0 = V + 0.7;
      bag.add('bronze', lathe([[0.001, 0], [0.26, 0.02], [0.3, 0.3], [0.2, 0.62], [0.001, 0.66]], 10, null, X(ea), y + e0, Z(eb)));
      bag.add('bronze', lathe([[0.001, 0.58], [0.12, 0.6], [0.13, 0.72], [0.08, 0.82], [0.001, 0.83]], 8, null, X(ea), y + e0, Z(eb - 0.12)));
      bx('gilt_bronze', ea - 0.03, eb - 0.4, ea + 0.03, eb - 0.2, e0 + 0.66, e0 + 0.72);
      for (const sg of [-1, 1]) bx('bronze', ea + sg * 0.3 - 0.04, eb - 0.1, ea + sg * 0.3 + 0.04, eb + 0.35, e0 + 0.12, e0 + 0.55);
      bx('bronze', ea - 0.1, eb + 0.2, ea + 0.1, eb + 0.55, e0 + 0.04, e0 + 0.14); }
    ob(-2.4, b - 2.1, 2.4, b + 2.1, FL, FL + 4.15);
  }
  // benches along the hall's side walls
  for (const s of [-1, 1]) for (const b of [12.2, 22.2]) { const a = s * 9.7; bx('leather_bench', a - 0.4, b - 1.0, a + 0.4, b + 1.0, FL + 0.42, FL + 0.5); bx('wood_dark', a - 0.35, b - 0.9, a - 0.3, b - 0.8, FL, FL + 0.42); bx('wood_dark', a + 0.3, b - 0.9, a + 0.35, b - 0.8, FL, FL + 0.42); bx('wood_dark', a - 0.35, b + 0.8, a - 0.3, b + 0.9, FL, FL + 0.42); bx('wood_dark', a + 0.3, b + 0.8, a + 0.35, b + 0.9, FL, FL + 0.42); ob(a - 0.4, b - 1.0, a + 0.4, b + 1.0, FL, FL + 0.5); }
  // the right aisle: pictures in gilt frames along its walls
  { const rr = rng(77); for (const b of [11.5, 15.5, 19.5, 23.0]) for (const [a, f] of [[16.45, -1], [11.15, 1]]) {
    const wd = 1.2 + rr() * 0.6, hh = 1.2 + rr() * 0.5, m = ['paint_blue', 'paint_ochre', 'cloth_green', 'cloth_red', 'paint_white'][Math.floor(rr() * 5)];
    if (a > 16 || b < 22) { bx(G, a - 0.04 * f - 0.0, b - wd / 2 - 0.07, a + 0.05 * f, b + wd / 2 + 0.07, FL + 1.7 - 0.07, FL + 1.7 + hh + 0.07); bx(m, a + 0.05 * f * 0 - (f < 0 ? 0.045 : -0.05) - 0.0, b - wd / 2, a - (f < 0 ? 0.0 : -0.0) + (f < 0 ? -0.05 : 0.06), b + wd / 2, FL + 1.7, FL + 1.7 + hh); } } }
  // ── the Klimt frieze in the left aisle: east wall (Longing for Happiness), south wall (Hostile Forces), west wall (Ode to Joy)
  {
    const aW = -16.5 + T, aE = -11.1, bN = 8.6, bS = 25.5 - T / 2, V0 = FL + 2.1, HF = 2.2, rF = rng(1902);
    const frame = (kind) => kind === 'e' ? { w: bS - bN, D: 5.4, at: (u, d) => [X(aE - d), Z(bN + u)] } : kind === 'w' ? { w: bS - bN, D: 5.4, at: (u, d) => [X(aW + d), Z(bS - u)] } : { w: aE - aW, D: 20, at: (u, d) => [X(aE - u), Z(bS - d)] };
    const FE = frame('e'), FW = frame('w'), FS = frame('s');
    const ground = (Fr, len, m) => { bag.add(m, fbox(Fr, y, 0, len, V0, V0 + HF, 0.0, 0.03)); bag.add('gilt_bronze', fbox(Fr, y, 0, len, V0 - 0.06, V0, 0.0, 0.05)); bag.add('gilt_bronze', fbox(Fr, y, 0, len, V0 + HF, V0 + HF + 0.06, 0.0, 0.05)); };
    ground(FE, FE.w, 'stucco_sky'); ground(FW, FW.w, 'stucco_pale'); ground(FS, FS.w, 'plaster_grey');
    const fig = (Fr, u, v, h, o = {}) => {
      const A2 = (m, ...q) => bag.add(m, fbox(Fr, y, ...q)), P2 = (m, pts, d0, d1) => bag.add(m, prism(Fr, y, pts, d0, d1));
      const w2 = h * 0.28, dress = o.dress ?? ['paint_ochre', 'gold', 'paint_blue', 'cloth_red', 'paint_white', 'cloth_green'][Math.floor(rF() * 6)];
      P2(dress, [[u - w2 * 0.35, v + h * 0.2], [u + w2 * 0.35, v + h * 0.2], [u + w2, v], [u - w2, v]], 0.03, 0.045);
      P2(dress, [[u - w2 * 0.3, v + h * 0.2], [u + w2 * 0.3, v + h * 0.2], [u + w2 * 0.22, v + h * 0.75], [u - w2 * 0.22, v + h * 0.75]], 0.03, 0.05);
      P2(o.hair ?? 'lacquer_black', ngon(u + (o.lean ?? 0), v + h * 0.88, h * 0.1, 8), 0.03, 0.045);
      P2('skin_light', ngon(u + (o.lean ?? 0) * 0.5, v + h * 0.86, h * 0.062, 8), 0.045, 0.06);
      P2('skin_light', [[u - w2 * 0.2, v + h * 0.7], [u - w2 * 1.3, v + h * 0.6], [u - w2 * 1.3, v + h * 0.57], [u - w2 * 0.2, v + h * 0.64]], 0.05, 0.055);
      P2('skin_light', [[u + w2 * 0.2, v + h * 0.7], [u + w2 * 1.3, v + h * 0.62], [u + w2 * 1.3, v + h * 0.59], [u + w2 * 0.2, v + h * 0.64]], 0.05, 0.055);
    };
    // Longing for Happiness: the weak and the suffering, the strong-armed knight in gilt armour, the floating women
    for (let k = 0; k < 7; k++) { const u = 1.2 + k * 1.9; if (k === 4) continue; fig(FE, u, V0 + 0.35 + rF() * 0.5, 1.2 + rF() * 0.4, { lean: (rF() - 0.5) * 0.2 }); }
    { const u = 12.5, Aq = (m, ...q) => bag.add(m, fbox(FE, y, ...q)); Aq('gold', u - 0.3, u + 0.3, V0 + 0.2, V0 + 1.7, 0.03, 0.06); bag.add('gold', prism(FE, y, ngon(u, V0 + 1.85, 0.2, 8), 0.03, 0.07)); Aq('iron', u + 0.4, u + 0.45, V0 + 0.2, V0 + 1.4, 0.04, 0.07); }
    // Hostile Forces: Typhon the giant ape, the three Gorgon sisters, Sickness, Madness, Death; the lust and wantonness and gluttony
    { const Aq = (m, ...q) => bag.add(m, fbox(FS, y, ...q)), Pq = (m, pts, d0, d1) => bag.add(m, prism(FS, y, pts, d0, d1)), c = FS.w / 2;
      Pq('hide_black', ngon(c, V0 + 1.0, 0.8, 9), 0.03, 0.06); Pq('hide_black', ngon(c - 0.3, V0 + 1.5, 0.45, 8), 0.06, 0.08); Pq('cloth_white', ngon(c - 0.3, V0 + 1.45, 0.16, 6), 0.08, 0.09);
      for (const q of [-1, 1]) Pq('hide_black', [[c + q * 0.6, V0 + 0.6], [c + q * 1.7, V0 + 1.4], [c + q * 1.8, V0 + 1.1], [c + q * 0.9, V0 + 0.3]], 0.03, 0.055);
      for (const [k, u] of [0.7, 1.15, 3.6].entries()) { Pq('gold', ngon(u, V0 + 1.1 + k * 0.1, 0.22, 7), 0.04, 0.06); Aq('gold', u - 0.12, u + 0.12, V0 + 0.2, V0 + 0.9, 0.04, 0.055); Aq('cloth_black', u - 0.2, u + 0.2, V0 + 1.05, V0 + 1.35, 0.06, 0.07); }
    }
    // Ode to Joy: the choir of angels in white and gold, and the kiss at the end
    for (let k = 0; k < 9; k++) fig(FW, 1.6 + k * 0.62, V0 + 0.55 + (k % 2) * 0.1, 1.15, { dress: k % 3 === 0 ? 'cloth_white' : k % 3 === 1 ? 'gold' : 'paint_white', hair: k % 2 ? 'cloth_black' : 'gilt_bronze' });
    { const Aq = (m, ...q) => bag.add(m, fbox(FW, y, ...q)), Pq = (m, pts, d0, d1) => bag.add(m, prism(FW, y, pts, d0, d1)), u = FW.w - 2.4;
      Aq('gold', 8.2, FW.w - 0.2, V0 + 0.05, V0 + HF - 0.05, 0.03, 0.04);                                         // the gold ground of the end
      Pq('gold', [[u - 0.6, V0 + 0.15], [u + 0.6, V0 + 0.15], [u + 0.45, V0 + 1.5], [u - 0.45, V0 + 1.5]], 0.04, 0.06);
      Pq('cloth_red', [[u - 0.55, V0 + 0.5], [u + 0.55, V0 + 0.5], [u + 0.5, V0 + 0.9], [u - 0.5, V0 + 0.9]], 0.06, 0.07); Pq('paint_blue', [[u - 0.4, V0 + 0.95], [u + 0.4, V0 + 0.95], [u + 0.35, V0 + 1.3], [u - 0.35, V0 + 1.3]], 0.06, 0.07);
      Pq('skin_light', ngon(u - 0.08, V0 + 1.68, 0.17, 8), 0.06, 0.075); Pq('lacquer_black', ngon(u - 0.14, V0 + 1.78, 0.2, 8), 0.04, 0.06);
      for (let k = 0; k < 8; k++) { const q = 8.5 + k * 0.38; Aq(k % 2 ? 'paint_ochre' : 'cloth_red', q, q + 0.22, V0 + 0.2, V0 + 0.55, 0.04, 0.055); } }
    // the squares and the spirals above the frieze (gold on the white wall)
    for (const [Fr, len] of [[FE, FE.w], [FW, FW.w], [FS, FS.w]]) for (let u = 0.6; u < len - 0.4; u += 0.9) if (Fr === FS || ((u - 1.6) % 2.7 + 2.7) % 2.7 > 0.55 && ((u - 1.6) % 2.7 + 2.7) % 2.7 < 2.15) bag.add(G, fbox(Fr, y, u - 0.14, u + 0.14, V0 + HF + 0.35, V0 + HF + 0.63, 0.0, 0.03));
    // Klimt's gilt spirals above the frieze on the two long walls: a ring of small bars round a centre, every 2.7 m
    for (const [Fr, len] of [[FE, FE.w], [FW, FW.w]]) for (let u = 1.6; u < len - 1; u += 2.7) {
      const c = V0 + HF + 0.82;
      for (let k = 0; k < 14; k++) { const th = k / 14 * Math.PI * 2, rr2 = 0.14 + 0.16 * (k / 14); bag.add(G, fbox(Fr, y, u + Math.cos(th) * rr2 - 0.04, u + Math.cos(th) * rr2 + 0.04, c + Math.sin(th) * rr2 - 0.04, c + Math.sin(th) * rr2 + 0.04, 0.0, 0.03)); }
      bag.add(G, fbox(Fr, y, u - 0.05, u + 0.05, c - 0.05, c + 0.05, 0.0, 0.03));
    }
    // the floating women of Longing for Happiness: tall narrow gowns slanting up, gold and white, hair streaming
    for (let k = 0; k < 4; k++) { const u = 2.3 + k * 4.2, v = V0 + 1.0 + (k % 2) * 0.2, sl = 0.5; const gm = k % 2 ? 'gold' : 'cloth_white';
      bag.add(gm, prism(FE, y, [[u - 0.22, v], [u + 0.22, v], [u + 0.14 + sl, v + 1.0], [u - 0.1 + sl, v + 1.0]], 0.03, 0.05));
      bag.add('skin_light', prism(FE, y, ngon(u + sl + 0.02, v + 1.12, 0.07, 8), 0.05, 0.065)); bag.add('lacquer_black', prism(FE, y, [[u + sl - 0.08, v + 1.05], [u + sl + 0.1, v + 1.1], [u + sl + 0.55, v + 0.8], [u + sl + 0.1, v + 0.95]], 0.04, 0.055)); }
    // a rail at knee height before the frieze (so nobody leans on the paint)
    for (const [a, b0, b1] of [[aW + 1.3, bN + 0.4, bS - 0.3]]) { bx('wood_dark', a - 0.03, b0, a + 0.03, b1, FL + 0.55, FL + 0.6); for (let b = b0; b <= b1; b += 3) bx('wood_dark', a - 0.03, b - 0.03, a + 0.03, b + 0.03, FL, FL + 0.6); }
  }
  light(0, 6.1, FL + 3.2, '#ffe2b0', 6, 11); light(-13.8, 14, FL + 4.5, '#fff0d8', 8, 12); light(13.8, 17, FL + 4.5, '#fff0d8', 7, 12); light(0, 12.4, FL + 7.4, '#f4f2ee', 14, 18); light(0, 22, FL + 7.4, '#f4f2ee', 14, 18);
  col.floor([X(-16), Z(4), X(16), Z(25)], F0);
}
