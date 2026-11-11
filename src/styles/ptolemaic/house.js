// The houses of Alexandria (docs/settlements/alexandria.md §6): the Greek courtyard house with its peristyle, its rooms on all
// sides, flat roofs of beams and clay with a parapet (a few pitched in tile), plastered walls painted in the Masonry style
// (a coloured dado, white fields, a stone cornice), the street door framed in stone; the old Egyptian house of Rhakotis of
// mudbrick, narrow and tall, battered, with its stair outside, palm beams standing out of the wall and a room on the roof.
// Registered into the `ptolemaic` style (index.js).

import { STYLES } from '../../core/build.js';
import { box, lathe, frustum } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { pent } from '../greek/quarter.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WALLS = ['plaster_white', 'plaster_white', 'stucco_warm', 'limewash_yellow', 'plaster_ochre', 'plaster_grey'];
const DADO = ['wall_red', 'paint_ochre', 'egyptian_blue', 'wall_red', 'fresco_green'];

/**
 * ptol_house: { rect, seed, y, front ('s' | 'n': the street), quarter ('greek' | 'jewish'), simple (far: walls and roofs only) }.
 */
function house(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, F = frame(el.rect, el.front ?? 's'), { L, D } = F;
  const R = (u0, v0, u1, v1, y0, y1, m, solid = true) => { const r = F.R(u0, v0, u1, v1); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); return r; };
  const wall = WALLS[Math.floor(rand() * WALLS.length)], dado = DADO[Math.floor(rand() * DADO.length)];
  const two = rand() < 0.42, H1 = 3.5, H = two ? 6.9 : H1, w = 3.4 + rand() * 0.8, df = 3.8, db = 4.6;
  const cu0 = w, cu1 = L - w, cv0 = df, cv1 = D - db;
  const tiled = rand() < 0.3, simple = el.simple;
  // the ranges round the court: front (with the street door), back (the main room, taller), the two sides
  const ranges = [[0, 0, L, df, H1 + (two && rand() < 0.5 ? 3.4 : 0)], [0, D - db, L, D, H], [0, df, w, D - db, H1 + (two ? 3.4 : 0)], [L - w, df, L, D - db, H1 + (two ? 3.4 : 0)]];
  // the door: in the front range, offset
  const dw = 1.2, du = Math.max(1.0, Math.min(L - dw - 1.0, L * (0.25 + 0.5 * rand())));
  ranges.forEach(([u0, v0, u1, v1, h], i) => {
    // plinth of stone, the dado (a painted band), the plaster above, the cornice
    const front = i === 0;
    const segs = front ? [[u0, du], [du + dw, u1]] : [[u0, u1]];
    for (const [a, b] of segs) {
      R(a, v0, b, v1, -0.5, 0.45, 'limestone', true);
      R(a + 0.01, v0 + 0.01, b - 0.01, v1 - 0.01, 0.45, 1.3, dado, true);
      R(a, v0, b, v1, 1.3, h, wall, true);
      R(a - 0.12, v0 - 0.12, b + 0.12, v1 + 0.12, h - 0.25, h, 'limestone', false);
    }
    if (front) { R(du, v0, du + dw, v1, 2.35, h, wall, true); R(du - 0.1, v0, du + dw + 0.1, v1, -0.1, 0.0, 'limestone', false); }
    const r = F.R(u0, v0, u1, v1);
    if (tiled && !two && i !== 0) pent(ctx, r, i === 1 ? (F.out[1] > 0 ? 'zp' : 'zn') : i === 2 ? 'xp' : 'xn', y, h + 0.03, h + (i === 1 ? 1.5 : 1.0), 0.25);
    else { bag.add('mud_plaster', box(r[0], y + h, r[1], r[2], y + h + 0.09, r[3])); R(u0, v0, u1, v0 + 0.3, h, h + 0.55, wall, false); R(u0, v1 - 0.3, u1, v1, h, h + 0.55, wall, false); }
  });
  // the street door: a stone frame proud of the wall, the leaf of cedar shut in it
  { const v0 = -0.05;
    R(du - 0.2, v0 - 0.12, du, 0.1, 0, 2.6, 'limestone', false); R(du + dw, v0 - 0.12, du + dw + 0.2, 0.1, 0, 2.6, 'limestone', false);
    R(du - 0.25, v0 - 0.2, du + dw + 0.25, 0.1, 2.35, 2.7, 'limestone', false); R(du, 0.0, du + dw, 0.12, 0, 2.35, 'wood_dark', false);
    if (!simple) { R(du - 0.35, v0 - 0.3, du + dw + 0.35, 0.1, 2.7, 2.85, 'limestone', false); for (const k of [0.3, 0.9]) R(du + k - 0.05, -0.02, du + k + 0.05, 0.14, 1.1, 1.16, 'bronze', false); } }
  if (simple) return;
  // small high windows with shutters on the street and the sides; upper windows
  for (const u of [1.6, L - 2.8]) if (Math.abs(u - du) > 1.6) R(u, -0.04, u + 0.7, 0.1, 2.3, 2.9, 'wood_dark', false);
  if (two) for (let u = 2.0; u < L - 1.5; u += 3.2) if (u > du + dw + 0.3 || u < du - 1.0) { R(u, -0.04, u + 0.8, 0.12, 4.6, 5.8, 'wood_dark', false); R(u - 0.12, -0.08, u + 0.92, 0.1, 5.8, 5.95, 'limestone', false); }
  // painted panels on the court's walls (the Masonry style: blocks of colour with a border), the peristyle on the back and the sides
  const pw = ['wall_red', 'paint_ochre', 'egyptian_blue', 'plaster_white'];
  for (const [u0, v0, u1, v1] of [[cu0, cv1 - 0.02, cu1, cv1 + 0.0], [cu0, cv0 + 0.0, cu1, cv0 + 0.02]]) {
    for (let u = u0 + 0.4; u + 1.6 < u1; u += 2.0) { const m = pw[Math.floor(rand() * pw.length)]; R(u, v0 === cv1 - 0.02 ? v0 - 0.02 : v0, u + 1.6, v0 === cv1 - 0.02 ? v1 : v1 + 0.02, 1.4, 2.8, m, false); }
  }
  const cs = [];
  const nC = Math.max(2, Math.round((cu1 - cu0) / 2.6)), colH = 3.0, cy = H1 - 0.5;
  void cy;
  for (let k = 0; k <= nC; k++) cs.push([cu0 + 0.1 + k * (cu1 - cu0 - 0.2) / nC, cv1 - 0.5]);
  if (rand() < 0.75) { cs.push([cu0 + 0.5, cv0 + 0.5], [cu1 - 0.5, cv0 + 0.5]); }
  for (const [u, v] of cs) STYLES.greek.column({ at: F.P(u, v), y, h: colH, d: 0.42, mat: 'limestone', flutes: 0, simple: true }, ctx);
  // the beam on the back colonnade, a lean-to of timber and clay above it
  R(cu0, cv1 - 0.75, cu1, cv1 - 0.25, colH, colH + 0.3, 'timber', false);
  R(cu0, cv1 - 0.75, cu1, cv1, colH + 0.3, colH + 0.38, 'mud_plaster', false);
  // the court: paved with cobbles of the shore, a well-head (the cistern under it, filled from the Nile canal), a pot of herbs, a fig by the wall
  R(cu0, cv0, cu1, cv1 - 0.75, -0.4, 0.0, 'cotto_floor', false); col.floor(F.R(cu0, cv0, cu1, cv1), y);
  const [wx, wz] = F.P(cu0 + (cu1 - cu0) * (0.3 + rand() * 0.4), cv0 + (cv1 - cv0) * 0.45);
  bag.add('limestone', lathe([[0.5, 0], [0.5, 0.78], [0.4, 0.78], [0.4, 0.6], [0.001, 0.6]], 12, null, wx, y, wz)); col.circle(wx, wz, 0.5, y, y + 0.78);
  const [px, pz] = F.P(cu1 - 0.7, cv0 + 0.7);
  bag.add('terracotta', lathe([[0.001, 0], [0.18, 0.02], [0.3, 0.3], [0.32, 0.6], [0.2, 0.75], [0.22, 0.82], [0.001, 0.8]], 10, null, px, y, pz));
  void frustum;
}
/**
 * egyptian_house: { rect, seed, y } — a house of Rhakotis: mudbrick walls battering in, 2–3 storeys, an outside stair to the first
 * floor, small high windows with a wooden grille, palm-trunk beams ending in the wall, a flat roof with a little room (the
 * kiosk) and a drying-pole for the linen; a lime wash over the top storey.
 */
function egyptianHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, simple = el.simple;
  const n = 2 + (rand() < 0.35 ? 1 : 0), sh = 2.9, H = n * sh, W = x1 - x0, Dp = z1 - z0, b = 0.12 * n, side = rand() < 0.5 ? 1 : -1;
  bag.add('limestone', box(x0 - 0.1, y - 0.5, z0 - 0.1, x1 + 0.1, y + 0.5, z1 + 0.1)); col.rect([x0 - 0.1, z0 - 0.1, x1 + 0.1, z1 + 0.1], y - 0.5, y + H);
  bag.add('mudbrick', frustum([x0, z0, x1, z1], y + 0.5, y + H, b, b, b, b));
  const lw = rand() < 0.6 ? 'plaster_white' : 'mud_plaster';
  bag.add(lw, frustum([x0 + b * 0.9, z0 + b * 0.9, x1 - b * 0.9, z1 - b * 0.9], y + H - sh * 0.45, y + H + 0.02, b * 0.1, b * 0.1, b * 0.1, b * 0.1));
  bag.add('mudbrick', box(x0 + b, y + H, z0 + b, x1 - b, y + H + 0.1, z1 - b));
  // the flat roof: parapet, the kiosk (a room of reed and mud) and the pole with the linen drying
  bag.add('mudbrick', box(x0 + b, y + H + 0.1, z0 + b, x1 - b, y + H + 0.6, z0 + b + 0.25)); bag.add('mudbrick', box(x0 + b, y + H + 0.1, z1 - b - 0.25, x1 - b, y + H + 0.6, z1 - b));
  bag.add('mudbrick', box(x0 + b, y + H + 0.1, z0 + b, x0 + b + 0.25, y + H + 0.6, z1 - b)); bag.add('mudbrick', box(x1 - b - 0.25, y + H + 0.1, z0 + b, x1 - b, y + H + 0.6, z1 - b));
  if (rand() < 0.6) bag.add('mud_plaster', box(x0 + b + 0.6, y + H + 0.1, z0 + b + 0.6, x0 + b + 0.6 + Math.min(2.6, W * 0.4), y + H + 2.3, z0 + b + 0.6 + Math.min(2.6, Dp * 0.4)));
  // the door in the street side (south, z1), the stair along it up to the first floor
  const dx = x0 + W * (0.3 + 0.4 * rand());
  bag.add('wood_dark', box(dx - 0.5, y, z1 - b - 0.05, dx + 0.5, y + 1.9, z1 - b + 0.1)); bag.add('palm_trunk', box(dx - 0.65, y + 1.9, z1 - b - 0.1, dx + 0.65, y + 2.08, z1 - b + 0.12));
  const sx = side > 0 ? x1 - b : x0 + b - 1.0;
  void sx;
  if (!simple) {
    // the palm beams ending in the wall's face, in a row under each floor's slab; the windows
    for (let k = 1; k <= n; k++) for (let u = x0 + 0.9; u < x1 - 0.8; u += 1.1) bag.add('palm_trunk', lathe([[0.09, 0], [0.09, 0.28]], 6).rotateX(Math.PI / 2).translate(u, y + k * sh - 0.25, z1 - b * (k / n * 1.0) - 0.02));
    for (let k = 0; k < n; k++) for (let u = x0 + 1.3; u < x1 - 1.0; u += 2.6) bag.add('wood_dark', box(u, y + (k + 1) * sh - 1.0, z1 - b * ((k + 1) / n) - 0.07, u + 0.6, y + (k + 1) * sh - 0.35, z1 - b * ((k + 1) / n) + 0.05));
    bag.add('linen', box(x1 - b - 1.9, y + H + 1.4, z0 + b + 0.4, x1 - b - 0.5, y + H + 2.4, z0 + b + 0.45));
    bag.add('timber', box(x1 - b - 2.0, y + H + 0.6, z0 + b + 0.38, x1 - b - 1.95, y + H + 2.5, z0 + b + 0.45)); bag.add('timber', box(x1 - b - 0.52, y + H + 0.6, z0 + b + 0.38, x1 - b - 0.47, y + H + 2.5, z0 + b + 0.45));
  }
  // the outside stair: a ramp of mud steps along the east or west wall to the first floor
  const st = Math.min(5, Dp - 1);
  for (let i = 0; i < 9; i++) { const z = z1 - 0.2 - i * (st / 9), xa = side > 0 ? x1 + 0.0 : x0 - 1.0; bag.add('mudbrick', box(xa, y, z - st / 9, xa + 1.0, y + 0.3 + i * (sh / 9), z)); }
  col.rect([side > 0 ? x1 : x0 - 1.0, z1 - 0.2 - st, side > 0 ? x1 + 1.0 : x0, z1 - 0.2], y, y + sh);
}
export const HOUSES = { ptol_house: house, egyptian_house: egyptianHouse };
