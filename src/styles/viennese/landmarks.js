// The two great buildings that frame the Ring and the Karlsplatz (docs/settlements/vienna.md §1–2): the Court Opera of 1869 on
// the Ring (neo-Renaissance, an arcaded loggia, the high green stage house behind) and the Karlskirche (1716–37: the portico with
// its pediment, the two columns, the great dome). Both are massed from real parts but not entered.
import { box, lathe, frustum } from '../../core/geom.js';
import { faceFrame, prism, fbox, arch, ngon, outline } from '../dutch/facade.js';

/** opera: { rect, y } — front to the north (the Ring). */
export function opera(el, { bag, col }) {
  const y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, F = faceFrame(el.rect, 'n'), w = F.w, A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
  const H = 26, GH = 7.2, D = z1 - z0;
  bag.add('limestone', box(x0, y - 0.6, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.6, y + H);
  // the stage house behind, taller, and the roofs
  const bx = (m, a0, b0, a1, b1, v0, v1) => bag.add(m, box(a0, y + v0, b0, a1, y + v1, b1));
  bx('limestone', x0 + w * 0.22, z0 + D * 0.5, x1 - w * 0.22, z1, H - 0.5, 40); col.rect([x0 + w * 0.22, z0 + D * 0.5, x1 - w * 0.22, z1], y + H, y + 40);
  bag.add('glaze_green', frustum([x0 + w * 0.22, z0 + D * 0.5, x1 - w * 0.22, z1], y + 40, y + 46, 0, 0, D * 0.2, D * 0.2));
  bag.add('glaze_green', frustum([x0 - 0.3, z0 - 0.3, x1 + 0.3, z0 + D * 0.52], y + H, y + H + 4.5, 2, 2, 0, 6));
  // the base: rusticated, the arcade of five arches in the middle, the wings' windows
  A('granite_grey', -0.05, w + 0.05, 0, 1.2, 0, 0.12);
  for (let v = 1.2; v < GH - 0.6; v += 0.7) A('sandstone_white', 0, w, v, v + 0.5, 0, 0.06);
  const c = w / 2, aw = 4.0, n = 5;
  for (let i = 0; i < n; i++) {
    const u = c + (i - (n - 1) / 2) * 5.4;
    for (const q of arch(u, 0.0, aw, 5.8)) bag.add('opening', prism(F, y, q, -0.05, 0.1));
    for (const q of arch(u, 0.0, aw, 5.8, false, 0.35).slice(1)) bag.add('sandstone_white', prism(F, y, q, 0, 0.14));
    // the loggia above: a taller arch with a balustrade before it, pilasters between
    for (const q of arch(u, GH + 0.5, aw, 6.8)) bag.add('opening', prism(F, y, q, -0.05, 0.1));
    for (const q of arch(u, GH + 0.5, aw, 6.8, false, 0.3).slice(1)) bag.add('sandstone_white', prism(F, y, q, 0, 0.14));
    A('sandstone_white', u - aw / 2 - 0.3, u + aw / 2 + 0.3, GH + 0.2, GH + 1.5, 0, 0.4);
    for (let k = 0; k <= 8; k++) { const x = u - aw / 2 + k * aw / 8; A('sandstone_white', x - 0.05, x + 0.05, GH + 0.45, GH + 1.45, 0.3, 0.38); }
  }
  A('sandstone_white', c - 14.4, c + 14.4, GH - 0.2, GH + 0.2, 0, 0.5); A('sandstone_white', c - 14.4, c + 14.4, GH + 7.5, GH + 8.2, 0, 0.7);
  // the wings: tall windows on two floors, the string courses, the great cornice
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) {
    const u = c + s * (16.5 + i * 3.3 * 0.9); if (u < 1.5 || u > w - 1.5) continue;
    for (const [v0, hh] of [[1.8, 3.8], [GH + 1.0, 4.6], [GH + 7.2 + 1.3, 3.6]]) { A('opening', u - 0.7, u + 0.7, v0, v0 + hh, -0.02, 0.04); A('sandstone_white', u - 0.88, u + 0.88, v0 + hh, v0 + hh + 0.22, 0, 0.12); A('sandstone_white', u - 0.88, u + 0.88, v0 - 0.15, v0, 0, 0.12); A('paint_white', u - 0.04, u + 0.04, v0, v0 + hh, 0, 0.06); }
  }
  A('sandstone_white', -0.1, w + 0.1, H - 1.4, H - 0.7, 0, 0.35); A('sandstone_white', -0.3, w + 0.3, H - 0.7, H, 0, 1.0);
  // the statues on the loggia's piers and the central bronze group
  for (let k = 0; k < 6; k++) { const u = c + (k - 2.5) * 5.4; bag.add('bronze', lathe([[0.001, 0], [0.4, 0.05], [0.3, 0.8], [0.25, 1.9], [0.001, 2.1]], 7, null, F.at(u, 0.3)[0], y + GH + 8.2, F.at(u, 0.3)[1])); }
  // two small pavilions at the ends, domed in green
  for (const s of [0, 1]) { const u = s ? w - 5 : 5, p = F.at(u, 0.5); bag.add('glaze_green', lathe([[6, 0], [5.4, 1.6], [3.5, 3.4], [1.2, 4.6], [0.001, 5.6]], 12, null, p[0] + (s ? 0 : 0), y + H, p[1] + 5)); }
}

/** karlskirche: { at: [x, z] (the dome's centre), y } — the portico to the west. */
export function karlskirche(el, { bag, col }) {
  const y = el.y ?? 0, [cx, cz] = el.at;
  const X = (b) => cx - 36 + b, Z = (a) => cz + a, F = { w: 40, D: 40, at: (u, d) => [cx - 36 - d, cz - 20 + u] };
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), bx = (m, a0, b0, a1, b1, v0, v1) => bag.add(m, box(X(b0), y + v0, Z(a0), X(b1), y + v1, Z(a1)));
  const solid = (m, a0, b0, a1, b1, v0, v1) => { bx(m, a0, b0, a1, b1, v0, v1); col.rect([X(b0), Z(a0), X(b1), Z(a1)], y + v0, y + v1); };
  // the steps, the portico's floor
  bx('granite_grey', -12, -3, 12, 4, -0.5, 1.2); for (let k = 0; k < 6; k++) bx('granite_grey', -12 - 0, -3 + k * 0.5, 12, 4, 0, 0.2 * (6 - k));
  col.ramp([X(-3), Z(-12), X(0), Z(12)], y, y + 1.2, 'e');
  // the portico: six Corinthian columns, the entablature and the pediment with its relief
  for (let k = 0; k < 6; k++) { const a = -9 + k * 3.6, p = [X(-1.2), Z(a)]; bag.add('sandstone_white', lathe([[1.1, 0], [0.96, 0.25], [0.8, 0.5], [0.72, 13], [0.8, 13.2], [0.95, 13.8], [1.05, 14.3]], 14, null, p[0], y + 1.2, p[1])); col.circle(p[0], p[1], 0.9, y, y + 15); }
  bx('sandstone_white', -11, -2.6, 11, 0.4, 15.5, 17.5); void A;
  bag.add('sandstone_white', prism(F, y, [[9.0, 17.5], [31.0, 17.5], [20, 25.0]], -0.4, 2.8));
  bag.add('sandstone_relief', prism(F, y, [[11.5, 17.9], [28.5, 17.9], [20, 23.8]], 2.8, 3.0));
  // the portico's back wall and the nave behind it, the wings with the two flanking columns
  solid('limestone', -11, 4, 11, 10, -0.5, 18.5);
  solid('limestone', -14, 10, 14, 34, -0.5, 22); bag.add('glaze_green', frustum([X(10), Z(-14), X(34), Z(14)], y + 22, y + 27, 3, 3, 3, 3));
  for (const s of [-1, 1]) { solid('limestone', s < 0 ? -22 : 11, 0, s < 0 ? -11 : 22, 14, -0.5, 16); bag.add('glaze_green', frustum([X(0), Z(s < 0 ? -22 : 11), X(14), Z(s < 0 ? -11 : 22)], y + 16, y + 20, 1, 1, 1, 1)); }
  for (const s of [-1, 1]) { const p = [X(2), Z(s * 27)]; for (let k = 0; k < 6; k++) bag.add('sandstone_white', lathe([[1.8 - k * 0.0, k * 5.4], [1.8, k * 5.4 + 5.0], [1.95, k * 5.4 + 5.4]], 16, null, p[0], y + k * 5.4, p[1])); bag.add('sandstone_relief', lathe([[1.5, 3], [1.5, 30.5]], 12, null, p[0], y, p[1]));
    bag.add('sandstone_white', lathe([[2.4, 32.6], [2.0, 33.0], [1.9, 34.2]], 14, null, p[0], y, p[1])); bag.add('glaze_green', lathe([[2.4, 34.2], [2.4, 35.2], [1.6, 37.2], [0.7, 39.0], [0.001, 40.2]], 14, null, p[0], y, p[1])); col.circle(p[0], p[1], 2.0, y, y + 34); }
  // the drum and the dome: stone drum with windows, the green copper dome with its lantern
  const dc = [X(22), Z(0)];
  bag.add('sandstone_white', lathe([[10.5, 22], [10.5, 31], [10.9, 31.6]], 24, null, dc[0], y, dc[1]));
  for (let k = 0; k < 16; k++) { const th = k / 16 * Math.PI * 2; bag.add('opening', box(dc[0] + Math.cos(th) * 10.45 - 0.6, y + 24.8, dc[1] + Math.sin(th) * 10.45 - 0.6, dc[0] + Math.cos(th) * 10.7 + 0.6, y + 29.4, dc[1] + Math.sin(th) * 10.7 + 0.6)); }
  bag.add('glaze_green', lathe([[10.9, 31.6], [10.3, 35], [8.6, 42], [6.0, 51], [3.0, 58], [2.2, 62]], 24, null, dc[0], y, dc[1]));
  bag.add('sandstone_white', lathe([[2.3, 62], [2.2, 64], [2.0, 68]], 12, null, dc[0], y, dc[1])); bag.add('glaze_green', lathe([[2.4, 68], [1.4, 70], [0.001, 73]], 12, null, dc[0], y, dc[1]));
  col.circle(dc[0], dc[1], 10.9, y, y + 35);
  void ngon; void outline;
}
