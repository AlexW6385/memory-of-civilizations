// The two great buildings that frame the Ring and the Karlsplatz (docs/settlements/vienna.md §1–2): the Court Opera of 1869 on
// the Ring (neo-Renaissance, an arcaded loggia, the high green stage house behind) and the Karlskirche (1716–37: the portico with
// its pediment, the two columns, the great dome). Both are massed from real parts but not entered.
import { box, lathe, frustum, rod } from '../../core/geom.js';
import { operaMass, operaInside } from './opera-int.js';
import { faceFrame, prism, fbox, arch, ngon, outline } from '../dutch/facade.js';

/** opera: { rect, y } — front to the north (the Ring). */
export function opera(el, ctx) {
  const { bag, col } = ctx;
  const y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, F = faceFrame(el.rect, 'n'), w = F.w, A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
  const H = 26, GH = 7.2, D = z1 - z0;
  operaMass(ctx, y, el.rect); operaInside(ctx, y, el.rect);
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
    if (i < 1 || i > 3) for (const q of arch(u, 0.0, aw, 5.8)) bag.add('opening', prism(F, y, q, -0.05, 0.1));
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
export function karlskirche(el, ctx) {
  const { bag, col } = ctx;
  const y = el.y ?? 0, [cx, cz] = el.at;
  const X = (b) => cx - 36 + b, Z = (a) => cz + a, F = { w: 40, D: 40, at: (u, d) => [cx - 36 - d, cz - 20 + u] };
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), bx = (m, a0, b0, a1, b1, v0, v1) => bag.add(m, box(X(b0), y + v0, Z(a0), X(b1), y + v1, Z(a1)));
  const solid = (m, a0, b0, a1, b1, v0, v1) => { bx(m, a0, b0, a1, b1, v0, v1); col.rect([X(b0), Z(a0), X(b1), Z(a1)], y + v0, y + v1); };
  // the steps, the portico's floor
  bx('granite_grey', -12, -3, 12, 4, -0.5, 1.2); for (let k = 0; k < 6; k++) bx('granite_grey', -12 - 0, -3 + k * 0.5, 12, 4, 0, 0.2 * (6 - k));
  col.ramp([X(-3), Z(-12), X(0), Z(12)], y, y + 1.2, 'e'); col.floor([X(0), Z(-12), X(4), Z(12)], y + 1.2);
  // the portico: six Corinthian columns, the entablature and the pediment with its relief
  for (let k = 0; k < 6; k++) { const a = -9 + k * 3.6, p = [X(-1.2), Z(a)]; bag.add('sandstone_white', lathe([[1.1, 0], [0.96, 0.25], [0.8, 0.5], [0.72, 13], [0.8, 13.2], [0.95, 13.8], [1.05, 14.3]], 14, null, p[0], y + 1.2, p[1])); col.circle(p[0], p[1], 0.9, y, y + 15); }
  bx('sandstone_white', -11, -2.6, 11, 0.4, 15.5, 17.5); void A;
  bag.add('sandstone_white', prism(F, y, [[9.0, 17.5], [31.0, 17.5], [20, 25.0]], -0.4, 2.8));
  bag.add('sandstone_relief', prism(F, y, [[11.5, 17.9], [28.5, 17.9], [20, 23.8]], 2.8, 3.0));
  // the portico's back wall and the nave behind it, the wings with the two flanking columns
  // (the portico's back wall with the door through it, and the nave: a round hall of 9.6 m in the thick of the walls — see karlskircheInside)
  solid('limestone', -11, 4, -2.3, 10, -0.5, 18.5); solid('limestone', 2.3, 4, 11, 10, -0.5, 18.5); solid('limestone', -2.3, 4, 2.3, 10, 8.8, 18.5);
  karlskircheShell({ bag, col, y, X, Z, bx, solid });
  bag.add('glaze_green', frustum([X(10), Z(-14), X(34), Z(14)], y + 22, y + 27, 3, 3, 3, 3));
  for (const s of [-1, 1]) { solid('limestone', s < 0 ? -22 : 11, 0, s < 0 ? -11 : 22, 14, -0.5, 16); bag.add('glaze_green', frustum([X(0), Z(s < 0 ? -22 : 11), X(14), Z(s < 0 ? -11 : 22)], y + 16, y + 20, 1, 1, 1, 1)); }
  for (const s of [-1, 1]) { const p = [X(2), Z(s * 27)]; for (let k = 0; k < 6; k++) bag.add('sandstone_white', lathe([[1.8 - k * 0.0, k * 5.4], [1.8, k * 5.4 + 5.0], [1.95, k * 5.4 + 5.4]], 16, null, p[0], y, p[1])); bag.add('sandstone_relief', lathe([[1.5, 3], [1.5, 30.5]], 12, null, p[0], y, p[1]));
    bag.add('sandstone_white', lathe([[2.4, 32.6], [2.0, 33.0], [1.9, 34.2]], 14, null, p[0], y, p[1])); bag.add('glaze_green', lathe([[2.4, 34.2], [2.4, 35.2], [1.6, 37.2], [0.7, 39.0], [0.001, 40.2]], 14, null, p[0], y, p[1])); col.circle(p[0], p[1], 2.0, y, y + 34); }
  // the drum and the dome: stone drum with windows, the green copper dome with its lantern
  const dc = [X(22), Z(0)];
  bag.add('sandstone_white', lathe([[10.5, 22], [10.5, 31], [10.9, 31.6]], 24, null, dc[0], y, dc[1]));
  for (let k = 0; k < 16; k++) { const th = k / 16 * Math.PI * 2; bag.add('opening', box(dc[0] + Math.cos(th) * 10.45 - 0.6, y + 24.8, dc[1] + Math.sin(th) * 10.45 - 0.6, dc[0] + Math.cos(th) * 10.7 + 0.6, y + 29.4, dc[1] + Math.sin(th) * 10.7 + 0.6)); }
  bag.add('glaze_green', lathe([[10.9, 31.6], [10.3, 35], [8.6, 42], [6.0, 51], [3.0, 58], [2.2, 62]], 24, null, dc[0], y, dc[1]));
  bag.add('sandstone_white', lathe([[2.3, 62], [2.2, 64], [2.0, 68]], 12, null, dc[0], y, dc[1])); bag.add('glaze_green', lathe([[2.4, 68], [1.4, 70], [0.001, 73]], 12, null, dc[0], y, dc[1]));
  void ngon; void outline;
  karlskircheInside({ bag, col, lights: ctx.lights, y, X, Z, dc });
}

// ── the Karlskirche inside (docs/settlements/vienna.md §12): a round nave of 9.6 m radius under the inner dome, entered from the
// portico through the doorway in the thick west wall; the floor is the portico's (1.2 m up). ───────────────────────────────────────
const FLR = 1.2, RN = 9.6, CB = 22;
/** The mass round the hall: strips along the axis, outside the circle (and the door's tunnel through the west end). */
function karlskircheShell({ bag, col, y, X, Z, bx, solid }) {
  void bx;
  for (let b = 10; b < 34 - 1e-6; b += 0.8) {
    const b2 = Math.min(34, b + 0.8), near = Math.max(b, Math.min(CB, b2)), d = near - CB;
    let c = Math.abs(d) < RN ? Math.sqrt(RN * RN - d * d) : 0;
    if (b2 < 13.6) c = Math.max(c, 2.3);
    if (c <= 0) { if (b < 12.4 || b2 > 31.6) { if (b < 12.4) { solid('limestone', -14, b, -2.3, b2, -0.5, 22); solid('limestone', 2.3, b, 14, b2, -0.5, 22); solid('limestone', -2.3, b, 2.3, b2, 8.8, 22); } else solid('limestone', -14, b, 14, b2, -0.5, 22); } continue; }
    solid('limestone', -14, b, -c, b2, -0.5, 22); solid('limestone', c, b, 14, b2, -0.5, 22);
    if (b2 < 13.0) solid('limestone', -c, b, c, b2, 8.8, 22);
  }
  // the floor of the tunnel and the hall's marble over the granite (portico level)
  bag.add('marble_floor', box(X(4), y + FLR - 0.02, Z(-2.3), X(12.4), y + FLR, Z(2.3)));
  col.floor([X(4), Z(-2.3), X(12.4), Z(2.3)], y + FLR);
}
function karlskircheInside({ bag, col, lights, y, X, Z, dc }) {
  const FY = y + FLR, inn = (p) => p.slice().reverse(), P = (r, th) => [dc[0] + Math.cos(th) * r, dc[1] + Math.sin(th) * r];
  // (the axis: the portico to the west, th = π; the high altar to the east, th = 0; +b is +x here, a is z)
  const TH_DOOR = Math.PI, door = 2.3 / RN;
  const N = 36;
  // the wall's collision: a polygon of segments, open at the door
  for (let k = 0; k < N; k++) { const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2; if (Math.abs(((am - TH_DOOR + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < door + 0.09) continue; col.segment(P(RN + 0.2, a0), P(RN + 0.2, a1), 0.6, y, y + 24); }
  col.floor([dc[0] - RN, dc[1] - RN, dc[0] + RN, dc[1] + RN], FY);
  // the floor: marble in a ring pattern, the wall inside (lower marble, upper plaster), the entablature and the springing of the dome
  bag.add('marble_floor', box(dc[0] - RN, y + FLR - 0.12, dc[1] - RN, dc[0] + RN, y + FLR, dc[1] + RN));
  bag.add('marble_dark', lathe(inn([[RN - 0.01, FLR], [RN - 0.01, FLR + 0.9]]), 36, null, dc[0], y, dc[1]));
  bag.add('plaster_white', lathe(inn([[RN - 0.01, FLR + 0.9], [RN - 0.01, 21]]), 36, null, dc[0], y, dc[1]));
  bag.add('marble', lathe(inn([[RN - 0.01, FLR + 0.9], [RN - 0.05, FLR + 0.9], [RN - 0.05, FLR + 1.0], [RN - 0.01, FLR + 1.0]]), 36, null, dc[0], y, dc[1]));
  bag.add('sandstone_white', lathe(inn([[RN - 0.01, 14.2], [RN - 0.5, 14.2], [RN - 0.5, 14.6], [RN - 0.3, 14.7], [RN - 0.3, 15.5], [RN - 0.5, 15.7], [RN - 0.5, 16.0], [RN - 0.01, 16.0]]), 36, null, dc[0], y, dc[1]));
  bag.add('gilt_bronze', lathe(inn([[RN - 0.31, 14.9], [RN - 0.34, 14.9], [RN - 0.34, 15.1], [RN - 0.31, 15.1]]), 36, null, dc[0], y, dc[1]));
  bag.add('sandstone_white', lathe(inn([[RN - 0.01, 20.4], [RN - 0.6, 20.4], [RN - 0.6, 21.0], [RN - 0.2, 21.2]]), 36, null, dc[0], y, dc[1]));
  // the inner dome, painted (a fresco of the Assumption in its colours), ribbed in gilt; the oculus at the top; the drum's windows inside
  const dome = [[RN - 0.2, 21.2], [RN - 0.9, 23.6], [RN - 2.4, 26.2], [RN - 4.3, 28.3], [RN - 6.2, 29.7], [RN - 7.6, 30.4]];
  bag.add('ceiling_painted', lathe(inn(dome), 36, null, dc[0], y, dc[1]));
  bag.add('plaster_white', lathe(inn([[RN - 7.6, 30.4], [RN - 7.9, 30.5], [RN - 7.9, 30.9]]), 36, null, dc[0], y, dc[1]));
  for (let k = 0; k < 16; k++) { const th = k / 16 * Math.PI * 2; for (let i = 0; i + 1 < dome.length; i++) { const a = P(dome[i][0] - 0.06, th), b = P(dome[i + 1][0] - 0.06, th); bag.add('gilt_bronze', rod([a[0], y + dome[i][1], a[1]], [b[0], y + dome[i + 1][1], b[1]], 0.07, 4)); } }
  for (let k = 0; k < 16; k++) { const th = (k + 0.5) / 16 * Math.PI * 2, a = P(RN - 0.2 - 0.3, th), b = P(RN - 0.9 - 0.3, th); bag.add('daylight', rod([a[0], y + 21.7, a[1]], [b[0], y + 23.1, b[1]], 0.5, 4)); }
  // the columns round the wall: marble shafts with gilt capitals and bases, a statue in the niche between each pair
  for (let k = 0; k < 12; k++) {
    const th = Math.PI / 12 + k * Math.PI / 6, dd = Math.abs(((th - TH_DOOR + Math.PI * 3) % (Math.PI * 2)) - Math.PI), da = Math.min(th, Math.PI * 2 - th);
    if (dd < 0.32 || da < 0.32) continue;
    const p = P(RN - 0.75, th);
    bag.add('marble_column', lathe([[0.001, FLR], [0.62, FLR], [0.56, FLR + 0.35], [0.5, FLR + 0.6], [0.46, 13.6], [0.52, 13.9], [0.001, 14.0]], 12, null, p[0], y, p[1]));
    bag.add('gilt_bronze', lathe([[0.001, 13.2], [0.54, 13.2], [0.6, 13.7], [0.7, 14.1], [0.001, 14.2]], 12, null, p[0], y, p[1]));
    col.circle(p[0], p[1], 0.6, FY, FY + 14);
  }
  for (let k = 0; k < 12; k++) {
    const th = k * Math.PI / 6, dd = Math.abs(((th - TH_DOOR + Math.PI * 3) % (Math.PI * 2)) - Math.PI), da = Math.min(th, Math.PI * 2 - th);
    if (dd < 0.4 || da < 0.4) continue;
    const p = P(RN - 0.12, th), f = P(RN - 0.8, th);
    bag.add('marble_dark', lathe([[0.7, FLR + 2.0], [0.7, FLR + 6.2], [0.001, FLR + 6.5]], 8, (t) => 1, p[0], y, p[1]).scale(1, 1, 1));
    bag.add('ivory', lathe([[0.001, FLR + 1.9], [0.38, FLR + 1.9], [0.34, FLR + 2.3], [0.28, FLR + 3.9], [0.4, FLR + 4.1], [0.2, FLR + 4.6], [0.16, FLR + 5.1], [0.1, FLR + 5.3], [0.001, FLR + 5.4]], 10, null, f[0], y, f[1]));
  }
  // the pews in two blocks, the central aisle between, the high altar on its steps at the east end, the pulpit, the chandeliers
  const wood = (a0, b0, a1, b1, v0, v1, hard) => { bag.add('wood_dark', box(Math.min(X(b0), X(b1)), FY + v0, Math.min(Z(a0), Z(a1)), Math.max(X(b0), X(b1)), FY + v1, Math.max(Z(a0), Z(a1)))); if (hard) col.rect([X(Math.min(b0, b1)), Z(Math.min(a0, a1)), X(Math.max(b0, b1)), Z(Math.max(a0, a1))], FY, FY + v1); };
  for (let b = 14.4; b < 26.5; b += 1.5) {
    const d = b - CB, lim = Math.sqrt(Math.max(0, RN * RN - d * d)) - 1.8;
    if (lim < 2.6) continue;
    for (const s of [-1, 1]) { const a0 = s * 1.4, a1 = s * Math.min(lim, 6.8); wood(Math.min(a0, a1), b, Math.max(a0, a1), b + 0.5, 0.0, 0.46, true); wood(Math.min(a0, a1), b + 0.46, Math.max(a0, a1), b + 0.52, 0.46, 1.0, false); wood(Math.min(a0, a1), b - 0.35, Math.max(a0, a1), b - 0.3, 0.12, 0.2, false); }
  }
  // the altar: three steps, the table, the retable with its painting between marble columns, the gilt glory
  const AB = 29.4;
  for (let k = 0; k < 3; k++) { bag.add('marble', box(X(AB - 0.9 * (2 - k) - 1.0), FY, Z(-4.2 + k * 0.4), X(AB + 3), FY + 0.2 * (k + 1), Z(4.2 - k * 0.4))); }
  col.ramp([X(AB - 2.8), Z(-3.4), X(AB - 1.0), Z(3.4)], FY, FY + 0.6, 'e'); col.floor([X(AB - 1.0), Z(-3.4), X(AB + 3), Z(3.4)], FY + 0.6);
  bag.add('marble', box(X(AB + 0.6), FY + 0.6, Z(-1.7), X(AB + 1.9), FY + 1.7, Z(1.7))); col.rect([X(AB + 0.6), Z(-1.7), X(AB + 1.9), Z(1.7)], FY + 0.6, FY + 1.7);
  bag.add('cloth_white', box(X(AB + 0.5), FY + 1.7, Z(-1.8), X(AB + 2.0), FY + 1.75, Z(1.8))); bag.add('gold', box(X(AB + 1.1), FY + 1.75, Z(-0.3), X(AB + 1.3), FY + 2.4, Z(0.3)));
  bag.add('gilt_bronze', box(X(AB + 2.6), FY + 1.0, Z(-3.0), X(AB + 2.9), FY + 9.0, Z(3.0)));
  bag.add('ceiling_painted', box(X(AB + 2.58), FY + 2.2, Z(-2.0), X(AB + 2.6), FY + 7.4, Z(2.0)));
  for (const s of [-1, 1]) { bag.add('marble_column', lathe([[0.4, 0], [0.34, 0.3], [0.3, 7.4], [0.4, 7.7], [0.001, 7.8]], 10, null, X(AB + 2.4), FY + 0.6, Z(s * 2.6))); col.circle(X(AB + 2.4), Z(s * 2.6), 0.42, FY, FY + 8); }
  for (let k = 0; k < 15; k++) { const th = k / 14 * Math.PI, c = [X(AB + 2.58), FY + 10.6, 0]; void c; bag.add('gold', rod([X(AB + 2.5), FY + 10.3, Z(0)], [X(AB + 2.5), FY + 10.3 + Math.sin(th) * 2.2, Z(-Math.cos(th) * 2.2)], 0.05, 4)); }
  bag.add('gold', lathe([[0.001, 0], [0.5, 0], [0.5, 0.06], [0.001, 0.06]], 12, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(Math.PI / 2).translate(X(AB + 2.45), FY + 10.3, Z(0)));
  // the communion rail
  for (let a = -4.2; a <= 4.2; a += 0.32) bag.add('marble', rod([X(AB - 1.2), FY, Z(a)], [X(AB - 1.2), FY + 0.8, Z(a)], 0.04, 5));
  bag.add('marble', box(X(AB - 1.3), FY + 0.8, Z(-4.3), X(AB - 1.1), FY + 0.9, Z(4.3)));
  // the pulpit on its pier, and the chandeliers on their chains with candles
  { const p = P(RN - 1.8, 2.5); bag.add('marble_column', lathe([[0.001, FLR], [0.5, FLR], [0.35, FLR + 1.5], [0.8, FLR + 1.6], [0.8, FLR + 2.3], [0.001, FLR + 2.35]], 10, null, p[0], y, p[1])); bag.add('gold', lathe([[0.8, FLR + 2.3], [0.85, FLR + 2.4], [0.85, FLR + 3.3], [0.8, FLR + 3.4]], 10, null, p[0], y, p[1])); bag.add('wood_dark', lathe([[0.001, FLR + 4.8], [0.9, FLR + 4.8], [0.6, FLR + 5.4], [0.001, FLR + 5.8]], 10, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.85, FY, FY + 3.5); }
  for (const [d, th] of [[0, 0], [5.0, 0.0], [5.0, Math.PI]]) {
    const p = d ? P(d, th) : [dc[0], dc[1]];
    bag.add('iron', rod([p[0], y + 29.5, p[1]], [p[0], y + 18.0, p[1]], 0.02, 4));
    bag.add('gilt_bronze', lathe([[1.1, 0], [1.1, 0.07], [0.001, 0.2]], 14, null, p[0], y + 17.4, p[1]));
    for (let k = 0; k < 12; k++) { const th2 = k / 12 * Math.PI * 2, q = [p[0] + Math.cos(th2) * 1.0, p[1] + Math.sin(th2) * 1.0]; bag.add('ivory', rod([q[0], y + 17.8, q[1]], [q[0], y + 18.2, q[1]], 0.03, 4)); bag.add('flame', lathe([[0.001, 0], [0.04, 0.05], [0.001, 0.14]], 5, null, q[0], y + 18.2, q[1])); }
    lights?.push({ at: [p[0], y + 17.2, p[1]], color: '#ffd9a0', intensity: 9, distance: 18 });
  }
  lights?.push({ at: [X(AB + 1.0), FY + 4, Z(0)], color: '#ffcf80', intensity: 8, distance: 12 });
}
