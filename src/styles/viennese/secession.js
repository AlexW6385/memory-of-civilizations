// The Secession building, Friedrichstraße 12 (docs/settlements/vienna.md §1, §4), as it stood for the Beethoven exhibition of
// April 1902: Olbrich's white cube with its four pylons, the motto and the three gorgons over the door, Moser's owls, the
// laurel dome; inside, the vestibule, the main hall under its skylights with Klinger's Beethoven in the middle, the left
// aisle with Klimt's frieze on three walls, the right aisle. Built in the building's frame (a east from the axis, b south from
// the front, v up), set in the world once. The front faces north (−z).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { prism, fbox, ngon } from '../dutch/facade.js';
import { rng } from './mietshaus.js';

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
  for (let k = 0; k < 6; k++) clere.push({ c: 5.6 + k * 3.35, w: 1.5, v0: FL + 5.4, v1: FL + 7.3 });
  for (const s of [-1, 1]) wall(WALL, 'b', s * (W / 2 - T / 2), 0, D, T, -0.2, WH, clere.map((c) => ({ ...c, c: c.c + 0 })));
  wall(WALL, 'a', D - T / 2, -W / 2, W / 2, T, -0.2, WH);
  // the side windows' glass and frames (drawn on the outer face)
  for (const s of [-1, 1]) for (const c of clere) { bx('opening', s * (W / 2 - 0.03) - 0.02, c.c - c.w / 2, s * (W / 2 - 0.03) + 0.02, c.c + c.w / 2, c.v0, c.v1); bx('iron', s * (W / 2 - 0.3), c.c - 0.02, s * (W / 2 - 0.0) + (s > 0 ? 0.0 : 0), c.c + 0.02, c.v0, c.v1); }
  // ── the pylons, the header, the cornice ────────────────────────────────────────────────────
  const pyl = (a0, b0, a1, b1, h) => { solid(WALL, a0, b0, a1, b1, -0.2, h); bx('stucco_pale', a0 - 0.12, b0 - 0.12, a1 + 0.12, b1 + 0.12, h, h + 0.3); bx('gilt_bronze', a0 + 0.3, b0 + 0.3, a1 - 0.3, b1 - 0.3, h + 0.3, h + 0.34); };
  for (const s of [-1, 1]) { pyl(s < 0 ? -17 : 11, 0, s < 0 ? -11 : 17, 6, 13.2); pyl(s < 0 ? -6.6 : 4.2, 0, s < 0 ? -4.2 : 6.6, 3.2, 10.0); }
  // golden spheres on the pylons' tops
  for (const [a, b, h] of [[-14, 3, 13.55], [14, 3, 13.55], [-5.4, 1.6, 10.35], [5.4, 1.6, 10.35]]) lat('gilt_bronze', [[0.001, 0], [0.35, 0.1], [0.5, 0.5], [0.35, 0.9], [0.001, 1.0]], a, b, h, 12);
  // between the pylons: the wall's top course and cornice
  bx('stucco_pale', -17.1, 2.7, 17.1, 3.7, WH, WH + 0.35);
  // the header over the porch: motto band and the three gorgons
  solid(WALL, -4.2, 0, 4.2, 1.2, FL + 4.9, FL + 8.6);
  const FH = { w: 8.4, D: 1.2, at: (u, d) => [X(-4.2 + u), Z(-d)] };          // the header's face (looking north): u east, d outward
  const A = (m, ...q) => bag.add(m, fbox(FH, y, ...q)), Pz = (m, pts, d0, d1) => bag.add(m, prism(FH, y, pts, d0, d1));
  A('stucco_pale', -0.1, 8.5, FL + 4.9, FL + 5.1, 0, 0.12);
  // the motto: DER ZEIT IHRE KUNST / DER KUNST IHRE FREIHEIT, in two lines of gilded capitals (as bars of letter width)
  for (const [line, text] of [[0, 'DERZEITIHREKUNST'], [1, 'DERKUNSTIHREFREIHEIT']]) {
    const n = text.length, w0 = 0.3, x0u = 4.2 - n * 0.2, v0 = FL + 7.3 - line * 0.55;
    for (let k = 0; k < n; k++) { const u = x0u + k * 0.4; A(G, u, u + w0, v0, v0 + 0.36, -0.02, 0.07); if ('AEFHKRTZ'.includes(text[k])) A(G, u + 0.07, u + 0.11, v0 + 0.05, v0 + 0.31, -0.03, 0.08); }
  }
  // the three gorgons: gilt heads (disc, hair of snakes as radiating bars, the face)
  for (const [k, u] of [4.2 - 1.9, 4.2, 4.2 + 1.9].entries()) {
    const v = FL + 6.05;
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
  for (const s of [-1, 1]) { const Fr = { w: 4.4, D: 0, at: (u, d) => [X(s * 6.6 + s * u), Z(-d)] }; void Fr; }
  // the walls between pylons: a frame of gilt lines and a laurel tree on each
  for (const s of [-1, 1]) {
    const Fr = { w: 4.4, D: 0, at: (u, d) => [X((s < 0 ? -11 : 6.6) + u), Z(-d - 0.0)] }; void Fr;
  }
  // Moser's owls on stone bases at the foot of the inner pylons
  for (const s of [-1, 1]) {
    const a = s * 7.5, b = 0.5;
    bx('sandstone_white', a - 0.5, b - 0.5, a + 0.5, b + 0.5, -0.2, 1.1); ob(a - 0.5, b - 0.5, a + 0.5, b + 0.5, -0.2, 2.4);
    lat('sandstone_white', [[0.001, 1.1], [0.36, 1.12], [0.4, 1.7], [0.3, 2.2], [0.22, 2.35], [0.001, 2.38]], a, b, 0, 12);
    for (const q of [-1, 1]) { bx('sandstone_white', a + q * 0.24 - 0.07, b - 0.12, a + q * 0.24 + 0.07, b + 0.12, 2.3, 2.55); bag.add('gold', lathe([[0.001, 0], [0.09, 0.01], [0.09, 0.03], [0.001, 0.04]], 8, null, X(a + q * 0.14), y + 2.1, Z(b - 0.3))); }
  }
  // tripod bowls on the wall tops between the pylons
  for (const a of [-8.8, 8.8]) {
    for (let k = 0; k < 3; k++) { const th = k * 2.094 + 0.3; bag.add('gilt_bronze', rod([X(a + Math.cos(th) * 0.55), y + WH + 0.35, Z(3.2 + Math.sin(th) * 0.55)], [X(a), y + WH + 1.5, Z(3.2)], 0.05, 5)); }
    lat('gilt_bronze', [[0.001, 1.45], [0.45, 1.55], [0.6, 1.95], [0.5, 2.0], [0.001, 1.7]], a, 3.2, WH + 0, 14); lat('flame', [[0.001, 1.9], [0.25, 2.0], [0.1, 2.5], [0.001, 2.7]], a, 3.2, WH + 0, 8);
  }
  // the lettering band's cornice over the door and the portal's jambs
  bx('stucco_pale', -2.0, 2.7, -1.7, 3.7, -0.2, FL + 4.5); bx('stucco_pale', 1.7, 2.7, 2.0, 3.7, -0.2, FL + 4.5); bx('stucco_pale', -2.0, 2.7, 2.0, 3.7, FL + 4.3, FL + 4.6);
  // the doors: a pair of leaves in dark wood, glazed above
  bx('wood_dark', -1.7, 3.0, 0, 3.4, FL, FL + 3.6); bx('wood_dark', 0, 3.0, 1.7, 3.4, FL, FL + 3.6); bx('opening', -1.6, 3.38, 1.6, 3.42, FL + 2.2, FL + 4.2);
  // ── the dome: a square drum over the middle of the hall, the ball of gilded laurel leaves ────────────
  const DB = 17.2, DT = WH + 0.3;
  solid(WALL, -2.7, DB - 2.7, 2.7, DB + 2.7, WH, DT + 5.0, false); bx('stucco_pale', -3.0, DB - 3.0, 3.0, DB + 3.0, DT + 5.0, DT + 5.3);
  for (const s of [-1, 1]) for (const t of [-1, 1]) bx('stucco_pale', s * 2.7 - 0.2 + (s > 0 ? -0.0 : 0), DB + t * 2.7 - 0.2, s * 2.7 + 0.2, DB + t * 2.7 + 0.2, WH, DT + 5.0);
  const cyBall = DT + 5.3 + 3.6, Rb = 4.25;
  bag.add('glaze_yellow', lathe([[0.001, -Rb * 0.8], [Rb * 0.6, -Rb * 0.78], [Rb * 0.92, -Rb * 0.3], [Rb * 0.98, 0.1], [Rb * 0.88, Rb * 0.55], [Rb * 0.55, Rb * 0.88], [0.001, Rb * 0.98]], 16, null, X(0), y + cyBall, Z(DB)));
  {
    const tris = [], rr = rng(1898);
    const rings = 11;
    for (let i = 1; i <= rings; i++) {
      const ph = -0.5 + (i / (rings + 1)) * 2.9 * 0.5 + 0.0, lat0 = -0.25 + i / (rings + 1) * (Math.PI / 2 + 0.25), cphi = Math.cos(lat0), n = Math.max(6, Math.round(26 * cphi));
      void ph;
      for (let k = 0; k < n; k++) {
        const th = (k + (i % 2) * 0.5) / n * Math.PI * 2 + rr() * 0.05;
        const nx = Math.cos(th) * cphi, ny = Math.sin(lat0), nz = Math.sin(th) * cphi, R = Rb;
        const ex = [-Math.sin(th), 0, Math.cos(th)], ey = [-Math.cos(th) * Math.sin(lat0), cphi, -Math.sin(th) * Math.sin(lat0)];
        const L = 1.2, Wd = 0.66, p = [nx * R, ny * R, nz * R];
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
  // the statue of Beethoven by Klinger in the middle of the hall (a, b) = (0, 17.2)
  {
    const a = 0, b = 17.2;
    bx('marble_dark', -2.2, b - 2.2, 2.2, b + 2.2, FL - 0.02, FL + 0.28); bx('marble_dark', -1.8, b - 1.8, 1.8, b + 1.8, FL + 0.28, FL + 0.58); ob(-2.2, b - 2.2, 2.2, b + 2.2, FL, FL + 0.6);
    bx('marble_pink', -1.5, b - 1.3, 1.5, b + 1.3, FL + 0.58, FL + 1.1); bx('marble_pink', -1.35, b - 0.6, -0.95, b + 1.0, FL + 1.1, FL + 2.0); bx('marble_pink', 0.95, b - 0.6, 1.35, b + 1.0, FL + 1.1, FL + 2.0);
    bx('bronze', -1.0, b + 0.65, 1.0, b + 1.0, FL + 1.1, FL + 3.9); bx('gilt_bronze', -1.15, b + 0.55, 1.15, b + 1.05, FL + 3.9, FL + 4.1);
    bx('marble_pink', -0.95, b - 0.5, 0.95, b + 0.7, FL + 1.1, FL + 1.55);                        // the seat
    lat('bronze', [[0.001, 1.55], [0.7, 1.55], [0.75, 1.9], [0.55, 2.35], [0.001, 2.4]], a, b - 0.1, FL, 12);        // the drapery over the knees
    lat('ivory', [[0.001, 2.2], [0.42, 2.25], [0.46, 2.9], [0.36, 3.2], [0.001, 3.3]], a, b + 0.15, FL, 12);        // the torso
    lat('ivory', [[0.001, 3.25], [0.17, 3.3], [0.2, 3.5], [0.14, 3.72], [0.001, 3.78]], a, b + 0.1, FL, 10);       // the head
    bx('ivory', -0.55, b - 0.65, -0.35, b + 0.0, FL + 1.55, FL + 1.75); bx('ivory', 0.35, b - 0.65, 0.55, b + 0.0, FL + 1.55, FL + 1.75);
    for (const s of [-1, 1]) bag.add('ivory', rod([X(s * 0.42), y + FL + 2.9, Z(b + 0.05)], [X(s * 0.45), y + FL + 2.2, Z(b - 0.6)], 0.1, 6));
    lat('bronze', [[0.001, 0.58], [0.3, 0.6], [0.28, 1.15], [0.12, 1.3], [0.001, 1.38]], 1.7, b - 1.0, FL, 8);     // the eagle at his side (small)
    ob(-2.2, b - 2.2, 2.2, b + 2.2, FL, FL + 4.1);
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
    for (const [Fr, len] of [[FE, FE.w], [FW, FW.w], [FS, FS.w]]) for (let u = 0.6; u < len - 0.4; u += 0.9) bag.add(G, fbox(Fr, y, u - 0.14, u + 0.14, V0 + HF + 0.35, V0 + HF + 0.63, 0.0, 0.03));
    // a rail at knee height before the frieze (so nobody leans on the paint)
    for (const [a, b0, b1] of [[aW + 1.3, bN + 0.4, bS - 0.3]]) { bx('wood_dark', a - 0.03, b0, a + 0.03, b1, FL + 0.55, FL + 0.6); for (let b = b0; b <= b1; b += 3) bx('wood_dark', a - 0.03, b - 0.03, a + 0.03, b + 0.03, FL, FL + 0.6); }
  }
  light(0, 6.1, FL + 3.2, '#ffe2b0', 6, 11); light(-13.8, 14, FL + 4.5, '#fff0d8', 8, 12); light(13.8, 17, FL + 4.5, '#fff0d8', 7, 12); light(0, 12.4, FL + 7.4, '#f4f2ee', 14, 18); light(0, 22, FL + 7.4, '#f4f2ee', 14, 18);
  col.floor([X(-16), Z(4), X(16), Z(25)], F0);
}
