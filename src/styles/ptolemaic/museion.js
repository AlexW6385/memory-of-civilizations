// The Museion and the Library (docs/settlements/alexandria.md §4): the reading halls with their walls of pigeonholed shelves
// and the scrolls in them, the Ionic row down the middle under a coffered ceiling, the long tables and benches with open
// scrolls, lamps and busts on pedestals; the exedra (the semicircular seat) on the garden; the prayer house of the Jews'
// quarter (§6) and a palace front. All [inferred] in form from Hellenistic stoas and the book-stores of Pergamon and Ephesos.
// Registered into the `ptolemaic` style (index.js).

import { STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, rod, frustum } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { kit } from '../greek/quarter.js';
import { lampstand, kline } from '../greek/house-interior.js';
import { vase } from '../greek/vessels.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A wall of pigeonholes along local v (alongV) or u at c, from a to b, floor to H: the boards, the scrolls with their tags. */
function shelves(ctx, K, alongU, c, a, b, face, H, rand, density = 0.7) {
  const { R } = K, wd = 0.5, rowH = 0.5, cw = 0.55;
  const rr = (p, q, y0, y1, m, solid = false) => (alongU
    ? R(p, face > 0 ? c : c - wd, q, face > 0 ? c + wd : c, y0, y1, m, solid)
    : R(face > 0 ? c : c - wd, p, face > 0 ? c + wd : c, q, y0, y1, m, solid));
  rr(a, b, 0.0, H, 'wood_dark', true);                                           // the case's body (the niches' dark back), solid for walking
  const rows = Math.floor((H - 0.3) / rowH), n = Math.floor((b - a) / cw);
  const inset = (p, q, y0, y1, m, k) => (alongU
    ? R(p, face > 0 ? c + 0.0 : c - wd + 0.0, q, face > 0 ? c + wd * k : c - wd * k + 0.0, y0, y1, m, false)
    : R(face > 0 ? c : c - wd * k, p, face > 0 ? c + wd * k : c, q, y0, y1, m, false));
  void inset;
  // the open front: boards (shelves) and dividers proud of the body
  const D = face > 0 ? [0.0, 0.5] : [-0.5, 0.0];
  const S = (p, q, y0, y1, m, d0, d1) => (alongU ? R(p, c + (face > 0 ? d0 : -d1), q, c + (face > 0 ? d1 : -d0), y0, y1, m, false) : R(c + (face > 0 ? d0 : -d1), p, c + (face > 0 ? d1 : -d0), q, y0, y1, m, false));
  void D;
  for (let r = 0; r <= rows; r++) S(a, b, 0.25 + r * rowH, 0.25 + r * rowH + 0.04, 'cedar', 0.0, wd + 0.04);
  for (let k = 0; k <= n; k++) S(a + k * cw, a + k * cw + 0.04, 0.25, 0.25 + rows * rowH, 'cedar', 0.0, wd + 0.04);
  for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) {
    if (rand() > density) continue;
    const u0 = a + k * cw + 0.1, y0 = 0.25 + r * rowH + 0.05;
    S(u0, u0 + 0.13, y0, y0 + 0.13, 'ivory', 0.08, 0.46);
    if (rand() < 0.4) S(u0 + 0.15, u0 + 0.28, y0, y0 + 0.13, 'plaster_ochre', 0.08, 0.46);
    S(u0 + 0.02, u0 + 0.1, y0 + 0.04, y0 + 0.1, 'cloth_red', 0.46, 0.5);          // the tag (sillybos) on the scroll's end
  }
}
function bust(ctx, x, z, y, rot = 0) {
  const { bag, col } = ctx;
  bag.add('marble', box(x - 0.25, y, z - 0.25, x + 0.25, y + 1.3, z + 0.25)); bag.add('marble_smooth', box(x - 0.3, y + 1.3, z - 0.3, x + 0.3, y + 1.38, z + 0.3));
  bag.add('marble_smooth', lathe([[0.001, 0], [0.2, 0.0], [0.19, 0.28], [0.08, 0.36], [0.07, 0.5]], 8, null, x, y + 1.38, z));
  bag.add('marble_smooth', lathe([[0.001, 0], [0.09, 0.02], [0.115, 0.14], [0.08, 0.26], [0.001, 0.29]], 8, null, x, y + 1.88, z));
  col.rect([x - 0.3, z - 0.3, x + 0.3, z + 0.3], y, y + 1.4); void rot;
}
/**
 * library_hall: { rect [33 × 24], front ('n' | 's' | 'e' | 'w'), y, seed } — the porch of four Ionic columns before the hall (beyond the
 * rect's front edge), the door, the hall with its walls of shelves, the Ionic row under a coffered ceiling, the long tables.
 */
function libraryHall(el, ctx) {
  const { bag, col, lights } = ctx, y = el.y ?? 0, rand = rng(el.seed ?? 3), K = kit(ctx, el.rect, el.front ?? 's', y), { F, R, wall } = K, { L, D } = F;
  const T = 0.8, H = 8.6, G = STYLES.greek.elements;
  // the floor of marble, the porch's platform with two steps
  R(0, -4.2, L, D, -0.4, 0, 'marble_floor', false); col.floor(F.R(0, -4.2, L, D), y);
  R(-0.4, -4.6, L + 0.4, -4.2, -0.4, -0.2, 'marble', false);
  // the walls: the back and both sides solid; the front with the door (3 m) and two high windows
  wall(true, D - T / 2, 0, L, H, [], 'sandstone_white', T);
  wall(false, T / 2, 0, D, H, [], 'sandstone_white', T); wall(false, L - T / 2, 0, D, H, [], 'sandstone_white', T);
  wall(true, T / 2, 0, L, H, [[L / 2 - 1.6, L / 2 + 1.6, 5.2]], 'sandstone_white', T);
  for (const u of [L / 2 - 9, L / 2 + 9]) { R(u - 0.9, -0.02, u + 0.9, T + 0.02, 5.4, 7.6, 'opening', false); R(u - 1.1, -0.1, u + 1.1, 0.1, 5.2, 5.4, 'marble', false); R(u - 1.1, -0.1, u + 1.1, 0.1, 7.6, 7.8, 'marble', false); }
  // the door's frame (the Egyptian note: the cavetto cornice over the lintel) and its leaves of cedar, shut
  R(L / 2 - 2.0, -0.45, L / 2 - 1.6, 0.0, 0, 5.4, 'marble', false); R(L / 2 + 1.6, -0.45, L / 2 + 2.0, 0.0, 0, 5.4, 'marble', false);
  R(L / 2 - 2.2, -0.5, L / 2 + 2.2, 0.0, 5.2, 5.8, 'marble', false);
  const cav = lathe([[0.0, 0], [0.3, 0.0], [0.5, 0.2], [0.55, 0.45]], 4); void cav;
  R(L / 2 - 2.3, -0.7, L / 2 + 2.3, 0.0, 5.8, 6.0, 'sandstone_dressed', false); R(L / 2 - 2.5, -0.9, L / 2 + 2.5, 0.0, 6.0, 6.3, 'sandstone_dressed', false);
  // the porch: four Ionic columns, the architrave, a pediment over the porch
  const colH = 6.4;
  [-5.1, -1.7, 1.7, 5.1].forEach((du) => STYLES.greek.column({ at: F.P(L / 2 + du, -3.2), y, h: colH, d: 0.75, mat: 'marble_column', order: 'ionic', yaw: F.alongX ? 0 : Math.PI / 2 }, ctx));
  R(L / 2 - 6.4, -3.7, L / 2 + 6.4, -2.7, colH, colH + 0.7, 'marble', false); R(L / 2 - 6.4, -3.7, L / 2 + 6.4, -2.7, colH + 0.7, colH + 1.2, 'marble_smooth', false);
  R(L / 2 - 6.6, -3.95, L / 2 + 6.6, -2.5, colH + 1.2, colH + 1.5, 'marble', false);
  R(L / 2 - 6.4, -3.7, L / 2 - 6.4 + 0.5, 0, colH, colH + 1.2, 'marble', false); R(L / 2 + 5.9, -3.7, L / 2 + 6.4, 0, colH, colH + 1.2, 'marble', false);
  R(L / 2 - 6.4, -2.7, L / 2 + 6.4, -0.1, colH + 1.2, colH + 1.5, 'timber', false);
  G.pediment_roof({ rect: F.R(L / 2 - 6.7, -4.1, L / 2 + 6.7, 0.1), y: y + colH + 1.5, rise: 1.5, tympanumInset: 0.3, rakingGeison: 0.3, mat: 'marble', ridge: F.alongX ? 'z' : 'x' }, ctx);
  // the roof of the hall: coffers under, tile over, the ridge along the front
  G.coffers({ rect: F.R(T, T, L - T, D - T), y: y + H - 0.4, depth: 0.35, cell: 1.6, beam: 0.2, mat: 'cedar' }, ctx);
  R(T - 0.05, T - 0.05, L - T + 0.05, D - T + 0.05, H - 0.1, H, 'timber', false);
  const wr = F.R(-0.2, -0.2, L + 0.2, D + 0.2);
  G.pediment_roof({ rect: wr, y: y + H + 0.0, rise: D * 0.14, tympanumInset: 0.35, rakingGeison: 0.3, mat: 'sandstone_white', tileMat: 'roof_tile', ridge: F.alongX ? 'x' : 'z' }, ctx);
  // the Ionic row down the middle
  const vi = D / 2, nC = 6, top = H - 0.4 - 0.45;
  for (let k = 0; k < nC; k++) STYLES.greek.column({ at: F.P(L * (k + 1) / (nC + 1), vi), y, h: top, d: 0.8, mat: 'marble_column', order: 'ionic', yaw: F.alongX ? 0 : Math.PI / 2 }, ctx);
  R(T, vi - 0.25, L - T, vi + 0.25, top, H - 0.4, 'cedar', false);
  // the shelves: on the back wall and the two sides, the door's wall bare but for two busts
  const ds = 0.5;
  shelves(ctx, K, true, D - T, 3.0, L - 3.0, -1, 4.8, rand);
  shelves(ctx, K, false, T, 3.5, D - T - 0.3, 1, 4.8, rand); shelves(ctx, K, false, L - T, 3.5, D - T - 0.3, -1, 4.8, rand);
  // the gallery rail above the lower shelves: a timber rail, and the rolling ladder
  for (const [a, b, c, along, face] of [[3.0, L - 3.0, D - T - ds, true, -1], [3.5, D - T - 0.3, T + ds, false, 1], [3.5, D - T - 0.3, L - T - ds, false, -1]]) {
    if (along) R(a, c - 0.04, b, c + 0.04, 5.15, 5.2, 'wood_dark', false); else R(c - 0.04, a, c + 0.04, b, 5.15, 5.2, 'wood_dark', false); void face;
  }
  R(L - T - ds - 0.35, 8, L - T - ds - 0.25, 8.12, 0.0, 4.4, 'timber', false); R(L - T - ds - 0.62, 8, L - T - ds - 0.52, 8.12, 0.0, 4.4, 'timber', false);
  for (let k = 0; k < 8; k++) R(L - T - ds - 0.62, 8, L - T - ds - 0.25, 8.12, 0.3 + k * 0.5, 0.35 + k * 0.5, 'timber', false);
  // the reading tables: three long tables across the hall, benches either side, open scrolls, a lampstand at the end of each
  for (let k = 0; k < 3; k++) {
    const u0 = 5 + k * 9, u1 = u0 + 5.5;
    for (const v of [vi - 4.2, vi + 4.2]) {
      R(u0, v - 0.5, u1, v + 0.5, 0.72, 0.8, 'wood_ochre', false);
      for (const u of [u0 + 0.2, u1 - 0.3]) R(u, v - 0.4, u + 0.1, v + 0.4, 0, 0.72, 'wood_dark', false);
      col.rect(F.R(u0, v - 0.5, u1, v + 0.5), y, y + 0.8);
      for (const dv of [-0.95, 0.95]) { R(u0, v + dv - 0.18, u1, v + dv + 0.18, 0.0, 0.44, 'timber', false); col.rect(F.R(u0, v + dv - 0.18, u1, v + dv + 0.18), y, y + 0.44); }
      for (let s = 0; s < 3; s++) { const uu = u0 + 0.6 + s * 1.7; R(uu, v - 0.25, uu + 0.6, v + 0.25, 0.8, 0.82, 'ivory', false); R(uu, v - 0.25, uu + 0.06, v + 0.25, 0.82, 0.88, 'linen', false); R(uu + 0.54, v - 0.25, uu + 0.6, v + 0.25, 0.82, 0.88, 'linen', false); }
    }
    const [lx, lz] = F.P(u1 + 0.5, vi);
    lampstand(ctx, lx, lz, y, 1.5);
  }
  // baskets and chests of scrolls at the foot of the back shelves, busts of the poets by the door
  for (let k = 0; k < 4; k++) { const [x, z] = F.P(5 + k * 6.2, D - T - ds - 0.6); bag.add('wicker', lathe([[0.3, 0], [0.34, 0.3], [0.3, 0.46], [0.001, 0.46]], 10, null, x, y, z)); col.circle(x, z, 0.34, y, y + 0.46); bag.add('ivory', box(x - 0.2, y + 0.44, z - 0.06, x + 0.2, y + 0.56, z + 0.06)); }
  for (const u of [2.8, L - 2.8]) { const [x, z] = F.P(u, 1.6); bust(ctx, x, z, y); }
  void lights; void kline; void vase;
}
/** exedra: { c [x, z], r, y, face (yaw: the direction the seat looks, radians, 0 = −z), span (radians, π) } — the semicircular seat of stone with a back wall and a half-dome roof of tile. */
function exedra(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, r = el.r ?? 4.5, y = el.y ?? 0, f = el.face ?? 0, span = el.span ?? Math.PI, n = 14;
  const P = (rad, a) => [cx + Math.sin(f + a) * rad, cz - Math.cos(f + a) * rad];
  for (let i = 0; i < n; i++) {
    const a0 = -span / 2 + span * i / n, a1 = -span / 2 + span * (i + 1) / n;
    bag.add('marble', orientedBox(P(r, a0), P(r, a1), 0.55, y, y + 0.46, 0.05)); col.segment(P(r, a0), P(r, a1), 0.55, y, y + 0.46);
    bag.add('marble_smooth', orientedBox(P(r + 0.45, a0), P(r + 0.45, a1), 0.35, y + 0.46, y + 3.4, 0.05)); col.segment(P(r + 0.45, a0), P(r + 0.45, a1), 0.35, y, y + 3.4);
    bag.add('marble', orientedBox(P(r + 0.45, a0), P(r + 0.45, a1), 0.6, y + 3.4, y + 3.7, 0.05));
    bag.add('roof_tile', orientedBox(P((r + 0.3) / 2, a0), P((r + 0.3) / 2, a1), r * 0.9, y + 3.7, y + 3.95, 0.05));
  }
  void frustum; void rod;
}
/**
 * proseuche: { rect [14 × 11], front, y, seed } — a Jewish prayer house: a hall under a flat roof of beams on four columns, benches
 * round the walls, the chest for the scrolls on the wall toward Jerusalem, a court with a basin before it. [inferred, §6]
 */
function proseuche(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, K = kit(ctx, el.rect, el.front ?? 's', y), { F, R, wall } = K, { L, D } = F, T = 0.6, H = 5.0, rand = rng(el.seed ?? 4);
  R(0, 0, L, D, -0.4, 0, 'limestone', false); col.floor(F.R(0, 0, L, D), y);
  const hall = 6.5;                                          // the hall's depth at the back (v from D − hall to D); the court in front
  wall(true, D - T / 2, 0, L, H, [], 'plaster_white', T); wall(false, T / 2, 0, D, H, [], 'plaster_white', T); wall(false, L - T / 2, 0, D, H, [], 'plaster_white', T);
  wall(true, D - hall, T, L - T, H, [[L / 2 - 1.1, L / 2 + 1.1, 3.0]], 'plaster_white', T);
  wall(true, T / 2, 0, L, 2.4, [[L / 2 - 1.2, L / 2 + 1.2, 2.2]], 'plaster_white', T);
  R(T, D - hall + T / 2, L - T, D - T, H - 0.2, H, 'timber', false);
  R(T - 0.1, D - hall, L - T + 0.1, D - T + 0.1, H, H + 0.25, 'mud_plaster', false);
  for (const u of [L / 2 - 2.6, L / 2 + 2.6]) for (const v of [D - hall + 2.2, D - 2.2]) STYLES.greek.column({ at: F.P(u, v), y, h: H - 0.5, d: 0.5, mat: 'limestone', flutes: 0, simple: true }, ctx);
  for (const [u0, v0, u1, v1] of [[T, D - hall + 0.5, T + 0.5, D - T], [L - T - 0.5, D - hall + 0.5, L - T, D - T], [T + 0.5, D - T - 0.5, L - T - 0.5, D - T]]) { R(u0, v0, u1, v1, 0, 0.45, 'limestone', true); }
  R(L / 2 - 0.7, D - T - 0.7, L / 2 + 0.7, D - T, 0, 1.5, 'cedar'); R(L / 2 - 0.8, D - T - 0.8, L / 2 + 0.8, D - T, 1.5, 1.6, 'wood_dark', false);   // the chest for the scrolls
  R(L / 2 - 0.3, D - T - 0.75, L / 2 + 0.3, D - T - 0.05, 1.6, 1.62, 'cloth_blue', false);
  { const [x, z] = F.P(L / 2, 2.2); bag.add('limestone', lathe([[0.7, 0], [0.7, 0.6], [0.56, 0.6], [0.56, 0.5], [0.001, 0.5]], 12, null, x, y, z)); bag.add('water', lathe([[0.55, 0], [0.001, 0.001]], 12, null, x, y + 0.48, z)); col.circle(x, z, 0.7, y, y + 0.6); }
  for (let k = 0; k < 3; k++) { const [x, z] = F.P(L / 2 - 2.6 + k * 2.6, D - hall - 1.0); lampstand(ctx, x, z, y, 1.4); void rand; }
}
/** palace_front: { rect, front, y, seed } — a long front of the royal quarter: a high plinth, a colonnade of painted Doric columns with the Egyptian palm capital on the pillars of the middle, a wall of dressed stone behind with its band of painted relief, a flat parapet. */
function palaceFront(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, K = kit(ctx, el.rect, el.front ?? 's', y), { F, R } = K, { L, D } = F, h = 7.0;
  R(0, 0, L, D, -0.4, 0.6, 'limestone', false); col.floor(F.R(0, 0, L, D), y + 0.6);
  R(-0.4, -0.4, L + 0.4, 0, -0.4, 0.3, 'limestone', false);
  R(0, D - 1.2, L, D, 0.6, h + 1.6, 'sandstone_white'); R(0, D - 1.3, L, D - 1.1, 3.6, 5.0, 'paint_ochre', false);
  R(0, D - 1.3, L, D - 1.1, h + 0.4, h + 0.9, 'egyptian_blue', false);
  const n = Math.round(L / 3.6);
  for (let k = 0; k <= n; k++) { const u = 0.8 + k * (L - 1.6) / n; STYLES.greek.column({ at: F.P(u, D - 3.3), y: y + 0.6, h, d: 0.8, mat: 'marble_column', flutes: 0, simple: false }, ctx); }
  R(0, D - 4.0, L, D - 2.6, h + 0.6, h + 1.3, 'marble', false); R(0, D - 4.0, L, D - 2.6, h + 1.3, h + 1.6, 'egyptian_blue', false);
  R(0, D - 2.6, L, D - 1.0, h + 0.6, h + 1.5, 'timber', false);
  R(-0.1, D - 4.2, L + 0.1, D - 0.9, h + 1.6, h + 1.9, 'marble', false);
  for (let u = 1; u < L - 1; u += 1.8) R(u, D - 4.1, u + 0.9, D - 4.0, h + 1.9, h + 2.4, 'egyptian_blue', false);
  void frustum;
}
export const MUSEION_EL = { library_hall: libraryHall, exedra, proseuche, palace_front: palaceFront };
