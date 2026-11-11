// The streets of Hadrian's Rome (docs/settlements/rome.md §4.5–§4.9): rows of tabernae under brick flats, each shop
// walked into with its counter, dolia and amphorae; public fountains (lacus); a public latrine; a mill-bakery
// (pistrinum) with its millstones, oven and bread counter; a podium temple with its portico; colonnades round a
// square; honorific statues. Registered into the `roman` style (the Pantheon and the other Roman builders are left
// as they are). Elements are built in a local frame of the building (u along the front, d deep into the building).

import { STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { hexa } from '../chinese/index.js';
import '../../objects/index.js';
import './index.js';
import './town.js';
import * as D_ from './dress.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const lz = (p, n, x, y, z) => lathe(p, n, null, x, y, z);
const AMPH = [[0.001, 0], [0.03, 0.02], [0.1, 0.15], [0.18, 0.42], [0.17, 0.62], [0.08, 0.75], [0.05, 0.9], [0.06, 0.95], [0.001, 0.95]];
const JUG = [[0.04, 0], [0.07, 0.05], [0.075, 0.12], [0.04, 0.2], [0.03, 0.24], [0.04, 0.26], [0.001, 0.26]];
const DOLIUM = (r) => [[r * 0.8, 0], [r, 0.1], [r * 1.05, 0.5], [r * 0.9, 0.85], [r * 0.7, 0.95], [r * 0.75, 1.0], [0.001, 0.99]];

/**
 * The frame of a building in rect [x0, z0, x1, z1] with its front on one side: u along the front, d deep into the
 * building, W × D. R(u0, u1, d0, d1) the world rect of a block, P(u, d) a world point.
 */
export function frame(rect, front) {
  const [x0, z0, x1, z1] = rect, along = front === 'n' || front === 's', W = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const R = (u0, u1, d0, d1) => front === 's' ? [x0 + u0, z1 - d1, x0 + u1, z1 - d0] : front === 'n' ? [x0 + u0, z0 + d0, x0 + u1, z0 + d1]
    : front === 'e' ? [x1 - d1, z0 + u0, x1 - d0, z0 + u1] : [x0 + d0, z0 + u0, x0 + d1, z0 + u1];
  const P = (u, d) => front === 's' ? [x0 + u, z1 - d] : front === 'n' ? [x0 + u, z0 + d] : front === 'e' ? [x1 - d, z0 + u] : [x0 + d, z0 + u];
  return { W, D, R, P, along };
}
/** The tools of a building: B(mat, u0, u1, d0, d1, ya, yb, solid) adds a block (and collides when solid), V(mat, geometry at P). */
export function tools(el, ctx, front = el.front ?? 's') {
  const { bag, col } = ctx, y = el.y ?? 0, F = frame(el.rect, front);
  const B = (mat, u0, u1, d0, d1, ya, yb, solid = false) => { const r = F.R(u0, u1, d0, d1); bag.add(mat, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); if (solid) col.rect(r, y + ya, y + yb); };
  const V = (mat, prof, u, d, ya = 0, n = 12) => { const p = F.P(u, d); bag.add(mat, lz(prof, n, p[0], y + ya, p[1])); };
  const C = (u, d, r, ya, yb) => { const p = F.P(u, d); col.circle(p[0], p[1], r, y + ya, y + yb); };
  const L = (u, d, ya, color, intensity, distance) => { const p = F.P(u, d); ctx.lights?.push({ at: [p[0], y + ya, p[1]], color, intensity, distance }); };
  return { ...F, B, V, C, L, y, bag, col };
}
/** A wall along the front (u0…u1) or the side with doorways [a, b, h] cut (along u), from d0 to d1 (thick), up to height H. */
function frontWall(T, mat, d0, d1, u0, u1, H, doors = [], ya = -0.4) {
  let u = u0;
  for (const [a, b, h = 2.6] of [...doors].sort((p, q) => p[0] - q[0])) {
    if (a > u) T.B(mat, u, a, d0, d1, ya, H, true);
    T.B(mat, a, b, d0, d1, h, H, true);
    T.B('travertine', a, b, d0, d1, -0.04, 0.03);                                    // the worn threshold
    u = b;
  }
  if (u1 > u) T.B(mat, u, u1, d0, d1, ya, H, true);
}
function sideWall(T, mat, u, t, d0, d1, H, doors = [], ya = -0.4) {
  let d = d0;
  for (const [a, b, h = 2.6] of [...doors].sort((p, q) => p[0] - q[0])) {
    if (a > d) T.B(mat, u, u + t, d, a, ya, H, true);
    T.B(mat, u, u + t, a, b, h, H, true);
    d = b;
  }
  if (d1 > d) T.B(mat, u, u + t, d, d1, ya, H, true);
}
/** A hipped roof of tiles over the rect of a building, the ridge along its longer side. */
export function hip(ctx, rect, y, rise, ov = 0.5) {
  const [x0, z0, x1, z1] = rect, w = x1 - x0, d = z1 - z0;
  if (w >= d) ctx.bag.add('roof_tile', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + ov], y, y + rise, d * 0.5, d * 0.5, d / 2 + ov - 0.05, d / 2 + ov - 0.05));
  else ctx.bag.add('roof_tile', frustum([x0 - ov, z0 - ov, x1 + ov, z1 + ov], y, y + rise, w / 2 + ov - 0.05, w / 2 + ov - 0.05, w * 0.5, w * 0.5));
}

// ── tabernae ───────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * taberna_row: { rect, front ('n' | 's' | 'e' | 'w'), n (shops), seed, y, simple } — a row of tabernae in the ground floor
 * of a block of brick flats (dossier §4.5): the shops 3.3 m high under a travertine lintel, each between brick piers,
 * with the counter, the dolia, the shelves of amphorae or the tools of its trade, a masonry floor and the timbers of the
 * mezzanine overhead; some shut with their boards; three storeys of flats above with windows, a corbelled cornice and
 * a hipped roof of tiles. Far (`simple`): the mass, the dark doorways, the roof only.
 */
function tabernaRow(el, ctx) {
  const T = tools(el, ctx), { W, D, B, V, C } = T, far = !!el.simple, rand = rng(el.seed || 1);
  const nb = el.n ?? Math.max(2, Math.round(W / 4.4)), bw = W / nb, H0 = 3.7, sh = 3.1, ns = el.storeys ?? 3, H = H0 + ns * sh, ty = el.y ?? 0;
  // the mass of the flats over the shops
  B('brick', 0, W, 0, D, H0, H, true);
  B('brick', 0, W, 0, D, -0.5, 0.0);
  hip(ctx, T.R(0, W, 0, D), ty + H, Math.min(W, D) * 0.2);
  // the back wall and the ends of the ground floor
  B('brick', 0, W, D - 0.45, D, -0.4, H0, true);
  B('brick', 0, 0.4, 0, D, -0.4, H0, true); B('brick', W - 0.4, W, 0, D, -0.4, H0, true);
  T.col.floor(T.R(0, W, 0, D), ty + 0.02);
  for (let i = 0; i <= nb; i++) {
    const u = i * bw, p0 = Math.max(0, u - 0.3), p1 = Math.min(W, u + 0.3);
    if (i > 0 && i < nb) B('brick', u - 0.18, u + 0.18, 0.4, D - 0.45, -0.4, H0, true);       // the party walls
    B('brick', p0, p1, -0.05, 0.5, -0.4, H0, true);                                           // the piers on the front
  }
  B('travertine', 0, W, -0.08, 0.55, 3.3, 3.62);                                              // the lintel along the front
  // floor of the shops (flags) and, under the mezzanine, the joists
  B('flagstone', 0.4, W - 0.4, 0.0, D - 0.45, -0.3, 0.0);
  for (let i = 0; i < nb; i++) {
    const u0 = i * bw + 0.5, u1 = (i + 1) * bw - 0.5, uc = (u0 + u1) / 2, w = u1 - u0;
    B('opening', u0, u1, -0.05, 0.03, 0.0, 3.3);                                              // the doorway: dark from afar
    if (far) continue;
    B('travertine', u0 - 0.1, u1 + 0.1, -0.05, 0.3, -0.1, 0.1);                               // the threshold with its groove for the boards
    for (let k = 0; k < 4; k++) B('timber', u0 - 0.2, u1 + 0.2, 0.7 + k * 1.3, 0.9 + k * 1.3, 3.4, 3.7);   // joists of the mezzanine floor
    for (let j = 0; j < 2; j++) B(j ? 'travertine' : 'paint_ochre', uc - 0.45, uc + 0.45, -0.05, 0.02, 3.7 + 0.1, 3.7 + 0.65);   // the mezzanine window
    // by the shop's trade
    const kind = [0, 1, 2, 3, 4, 5, 6, 7, 8, 1, 0, 2, 6][Math.floor(rand() * 13)], sg = rand() < 0.5 ? -1 : 1, ux = sg > 0 ? u1 - 0.1 : u0 + 0.1;
    const cu0 = sg > 0 ? uc - 0.1 : u0 + 0.1, cu1 = sg > 0 ? u1 - 0.1 : uc + 0.1;                // the counter fills half the door, leaving the other half open
    const bz = D - 0.45;
    if (kind === 0 || kind === 1) {
      // wine and oil / the hot-food counter: a masonry counter in the door, dolia sunk in its top, amphorae along the back wall
      B('brick', cu0, cu1, 0.1, 0.8, 0.0, 0.95, true);
      B('marble_smooth', cu0 - 0.02, cu1 + 0.02, 0.08, 0.82, 0.95, 1.0);
      const nd = kind === 1 ? 2 : 1;
      for (let d = 0; d < nd; d++) {
        const uu = cu0 + (cu1 - cu0) * (d + 0.5) / nd;
        V('terracotta', [[0.2, 0], [0.22, 0.02], [0.22, 0.035], [0.17, 0.035], [0.17, 0.0]], uu, 0.45, 0.98, 14);
        V('lacquer_black', [[0.001, 0], [0.17, 0], [0.001, 0.001]], uu, 0.45, 0.985, 14);
      }
      if (kind === 1) { B('brick', u0 + 0.2, u0 + 1.2, bz - 0.9, bz - 0.05, 0.0, 0.8, true); B('lacquer_black', u0 + 0.3, u0 + 1.1, bz - 0.8, bz - 0.15, 0.8, 0.82); B('lacquer_black', u0 + 0.2, u0 + 1.4, bz - 0.01, bz, 1.3, 3.0); }
      for (let k = 0; k < 6; k++) V('terracotta', AMPH.map(([a, b]) => [a, b]), u0 + 0.4 + (k % 3) * 0.42 + (kind === 1 ? 1.1 : 0), bz - 0.3 - Math.floor(k / 3) * 0.5, 0, 12);
      B('timber', u0 + 0.1, u1 - 0.1, bz - 0.35, bz - 0.05, 1.5, 1.56);                          // a shelf for jugs
      for (let k = 0; k < 5; k++) V(k % 2 ? 'pottery_dark' : 'terracotta', JUG, u0 + 0.35 + k * 0.28, bz - 0.2, 1.56, 8);
    } else if (kind === 2) {
      // pots and cloth: shelves of jugs and bowls against the walls, a table of folded bolts
      for (const sy of [0.5, 1.2, 1.9]) B('timber', u0 + 0.1, u1 - 0.1, bz - 0.4, bz - 0.04, sy, sy + 0.05, true);
      for (let r = 0; r < 3; r++) for (let k = 0; k < Math.floor(w / 0.3); k++) V((k + r) % 3 ? 'terracotta' : 'pottery_dark', JUG, u0 + 0.25 + k * 0.3, bz - 0.2, [0.55, 1.25, 1.95][r], 8);
      B('timber', uc - 0.5, uc + 0.5, 1.6, 2.4, 0.0, 0.8, true);
      for (let k = 0; k < 4; k++) B(['cloth_red', 'cloth_indigo', 'linen', 'cloth_ochre'][k], uc - 0.45, uc + 0.45, 1.65 + k * 0.1, 1.75 + k * 0.1, 0.8 + k * 0.1, 0.9 + k * 0.1);
    } else if (kind === 3) {
      // a smith: the forge of brick in the corner, the anvil on its block, the tongs and the coals
      B('brick', ux - 1.1 * sg, ux, bz - 1.0, bz - 0.05, 0.0, 0.9, true);
      B('lacquer_black', ux - 1.0 * sg, ux - 0.1 * sg, bz - 0.9, bz - 0.15, 0.9, 0.93);
      B('lacquer_black', Math.min(ux, ux - 1.2 * sg), Math.max(ux, ux - 1.2 * sg), bz - 0.01, bz, 1.2, 3.1);
      T.L(ux - 0.55 * sg, bz - 0.5, 1.1, '#ff7a2a', 1.0, 3.5);
      B('wood_dark', uc - 0.15, uc + 0.15, 1.5, 1.8, 0.0, 0.5, true);
      B('bronze', uc - 0.25, uc + 0.25, 1.4, 1.9, 0.5, 0.62);
      B('bronze', uc + 0.2, uc + 0.4, 1.58, 1.72, 0.55, 0.65);
      B('wood_dark', u0 + 0.2, u0 + 0.9, 0.5, 1.0, 0.0, 0.7, true);                              // the workbench
    } else if (kind === 5) {
      // a butcher: the block, a beam inside with carcasses on hooks, a marble counter in the door
      B('brick', cu0, cu1, 0.1, 0.7, 0.0, 0.95, true); B('marble_smooth', cu0 - 0.02, cu1 + 0.02, 0.08, 0.72, 0.95, 1.0);
      B('timber', u0 + 0.2, u1 - 0.2, 1.3, 1.38, 3.0, 3.1);
      for (let k = 0; k < 4; k++) { const u = u0 + 0.5 + k * (w - 1.0) / 3; B('iron', u - 0.01, u + 0.01, 1.32, 1.36, 2.4, 3.0); B('hide_tan', u - 0.14, u + 0.14, 1.25, 1.45, 1.5 + (k % 2) * 0.2, 2.4); B('wall_red', u - 0.05, u + 0.05, 1.22, 1.25, 1.7 + (k % 2) * 0.2, 2.2); }
      V('timber', [[0.001, 0], [0.3, 0.0], [0.3, 0.7], [0.001, 0.7]], uc, 2.4, 0.0, 10);
      B('wood_dark', u0 + 0.1, u1 - 0.1, bz - 0.4, bz - 0.04, 0.8, 0.85, true);
    } else if (kind === 6) {
      // a baker's shop: shelves of loaves on the back wall, the counter with its loaves, a sack of flour
      for (const sy of [0.6, 1.3, 2.0]) B('timber', u0 + 0.1, u1 - 0.1, bz - 0.4, bz - 0.04, sy, sy + 0.05, true);
      for (let r = 0; r < 3; r++) for (let k = 0; k < Math.floor(w / 0.34); k++) V('hide_tan', [[0.001, 0], [0.13, 0.0], [0.15, 0.04], [0.1, 0.09], [0.001, 0.1]], u0 + 0.25 + k * 0.34, bz - 0.22, [0.65, 1.35, 2.05][r], 8);
      B('brick', cu0, cu1, 0.1, 0.8, 0.0, 0.95, true); B('marble_smooth', cu0 - 0.02, cu1 + 0.02, 0.08, 0.82, 0.95, 1.0);
      for (let k = 0; k < 4; k++) V('terracotta', [[0.001, 0], [0.13, 0.0], [0.15, 0.04], [0.1, 0.09], [0.001, 0.1]], cu0 + 0.2 + k * 0.25, 0.45, 1.0, 8);
      for (let k = 0; k < 2; k++) V('sacking', [[0.2, 0], [0.26, 0.15], [0.24, 0.5], [0.12, 0.58], [0.001, 0.56]], u1 - 0.35 - k * 0.45, D - 1.3, 0.0, 8);
    } else if (kind === 7) {
      // fish and greens: a stone tank with water, baskets on the floor, a drain in the flags
      B('travertine', u0 + 0.2, u0 + 1.4, bz - 1.0, bz - 0.05, 0.0, 0.8, true); B('water', u0 + 0.3, u0 + 1.3, bz - 0.9, bz - 0.15, 0.7, 0.72);
      for (let k = 0; k < 4; k++) V('wicker', [[0.2, 0], [0.26, 0.2], [0.001, 0.2]], u1 - 0.5 - (k % 2) * 0.5, bz - 0.4 - Math.floor(k / 2) * 0.5, 0.0, 10);
      B('basalt', uc - 0.1, uc + 0.1, 0.5, D - 1.5, 0.0, 0.02);
    } else if (kind === 8) {
      // a barber's or scribe's booth: a bench along the wall, a stool, a shelf with scrolls, a bronze mirror
      B('timber', u0 + 0.1, u1 - 0.1, bz - 0.5, bz - 0.05, 0.42, 0.47, true);
      for (const x of [u0 + 0.2, u1 - 0.2]) B('timber', x - 0.04, x + 0.04, bz - 0.45, bz - 0.1, 0.0, 0.42);
      V('timber', [[0.001, 0], [0.18, 0.0], [0.18, 0.44], [0.001, 0.44]], uc, 1.6, 0.0, 8);
      B('timber', u0 + 0.2, u1 - 0.2, bz - 0.3, bz - 0.04, 1.6, 1.65, true);
      for (let k = 0; k < 5; k++) B('linen', u0 + 0.3 + k * 0.25, u0 + 0.5 + k * 0.25, bz - 0.25, bz - 0.12, 1.65, 1.75);
      V('bronze', [[0.001, 0], [0.12, 0.0], [0.12, 0.01], [0.001, 0.01]], uc, bz - 0.02, 1.4, 12);
    } else {
      // shut: the boards of the shop set in their groove across the door, a small door in them
      B('shutter_brown', u0, uc - 0.4, 0.08, 0.16, 0.12, 3.3, true);
      B('shutter_brown', uc + 0.4, u1, 0.08, 0.16, 0.12, 3.3, true);
      B('shutter_brown', uc - 0.4, uc + 0.4, 0.08, 0.16, 2.0, 3.3, true);
      B('wood_dark', uc - 0.4, uc + 0.4, 0.04, 0.1, 0.12, 2.0);
      B('bronze', uc + 0.25, uc + 0.3, 0.02, 0.06, 0.9, 1.0);
    }
    // the dressing at the door: awning, goods by trade, sign, lamp, notices, weathering
    const dr = { ...T, bag: T.bag };
    if (kind !== 4 && rand() < 0.5) D_.awning(dr, u0 - 0.15, u1 + 0.15, 3.35, 2.6, 1.7, ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_green', 'linen'][Math.floor(rand() * 6)]);
    if (kind === 0 || kind === 1) { D_.amphoraRack(dr, sg > 0 ? u0 + 0.05 : u1 - 1.2, 3 + Math.floor(rand() * 4), rand); if (rand() < 0.5) D_.litter(dr, sg > 0 ? u1 - 0.9 : u0 + 0.1, rand, 0); }
    else if (kind === 2) D_.potStall(dr, sg > 0 ? u0 + 0.1 : uc + 0.1, Math.min(1.6, w / 2 - 0.2), rand);
    else if (kind === 3) { D_.litter(dr, sg > 0 ? u0 + 0.1 : u1 - 1.2, rand, 0); }
    else if (kind === 5) D_.carcasses(dr, u0 + 0.3, u1 - 0.3, rand);
    else if (kind === 6) D_.slab(dr, sg > 0 ? u0 + 1.0 : u1 - 1.0, 1.4, 'bread', rand);
    else if (kind === 7) D_.slab(dr, sg > 0 ? u0 + 1.0 : u1 - 1.0, 1.6, rand() < 0.6 ? 'fish' : 'greens', rand);
    else if (kind === 8) D_.stoneBench(dr, u0 + 0.2, 1.3);
    else if (kind === 4) D_.litter(dr, u0 + 0.2, rand, 1 + Math.floor(rand() * 2));
    if (kind !== 4 && (kind === 1 || kind === 6 || kind === 7) && rand() < 0.5) D_.hangingGoods(dr, u0 + 0.3, u1 - 0.3, rand, kind === 1);
    if (rand() < 0.4) D_.signBoard(dr, u1 + 0.28, 2.55, rand);
    if (rand() < 0.35) D_.lampBracket(dr, u0 - 0.2, 2.2);
    if (rand() < 0.4) D_.notice(dr, u1 + 0.0, 1.1 + rand() * 0.3, 0.4, 1.0, rand);
    D_.damp(dr, u0 - 0.5, u0, 0.9, rand);
    D_.streak(dr, uc + (rand() - 0.5) * w * 0.5, 3.3, 0.8 + rand(), 0.2);
    void C; void ux;
  }
  // the flats: windows on the front and the two long sides, sills, shutters, string courses, a corbelled cornice
  const fw = Math.max(1, Math.round((W - 0.8) / 3.0)), ww = (W - 0.8) / fw;
  for (let k = 0; k < ns; k++) {
    const yk = H0 + k * sh;
    if (!far) B('brick', -0.1, W + 0.1, -0.08, 0.04, yk - 0.14, yk + 0.02);
    for (let i = 0; i < fw; i++) {
      const uc = 0.4 + (i + 0.5) * ww, wy = yk + 0.9;
      B('opening', uc - 0.5, uc + 0.5, -0.05, 0.02, wy, wy + 1.35);
      if (far) continue;
      B('travertine', uc - 0.62, uc + 0.62, -0.05, 0.14, wy - 0.1, wy);
      const r = rand();
      if (rand() < 0.14) D_.flowerBox(T, uc, wy - 0.1, rand); else if (rand() < 0.09) D_.washing(T, uc, wy - 0.1, rand);
      if (r < 0.15) B('shutter_brown', uc - 0.5, uc + 0.5, 0.03, 0.08, wy, wy + 1.35);
      else if (r < 0.5) { B('shutter_brown', uc - 1.0, uc - 0.53, -0.05, 0.05, wy, wy + 1.35); B('shutter_brown', uc + 0.53, uc + 1.0, -0.05, 0.05, wy, wy + 1.35); }
    }
  }
  if (!far) {
    B('brick', -0.25, W + 0.25, -0.05, 0.26, H - 0.34, H - 0.12);
    B('travertine', -0.4, W + 0.4, -0.05, 0.4, H - 0.12, H);
    if (rand() < 0.25) D_.maenianum(T, 1.0 + rand() * 0.6, Math.min(W - 1.0, 5.0 + rand() * 6), H0 + sh + 0.1, rand);
    D_.weather(T, 0.2, W - 0.2, H0 + 0.1, H - 0.8, rand, 1.0);
    if (rand() < 0.6) {                                                                                  // a balcony on corbels with a timber rail along the first floor
      const yb = H0;
      for (let u = 0.8; u < W - 0.6; u += 1.6) B('travertine', u - 0.14, u + 0.14, -0.05, 0.9, yb - 0.5, yb - 0.1);
      B('brick', 0.4, W - 0.4, -0.05, 1.0, yb - 0.1, yb + 0.08);
      for (let u = 0.6; u < W - 0.5; u += 1.2) B('timber', u - 0.04, u + 0.04, 0.9, 0.98, yb + 0.08, yb + 0.95);
      B('timber', 0.45, W - 0.45, 0.88, 1.0, yb + 0.95, yb + 1.03);
    }
  }
}

// ── fountains and statues ──────────────────────────────────────────────────────────────────────────────────────
const quarter = (g, a, x, y, z) => { g.rotateY(a); g.translate(x, y, z); return g; };
/**
 * fountain: { at [x, z], y, rot (the way it faces, radians), kind ('lacus' | 'round') } — a street fountain of the Pompeian
 * type: a trough of stone slabs, its water in it, a square pier at the back with a bronze spout and a carved head, the
 * stone at the lip worn, a step before it; or a round basin on a baluster with a jet.
 */
function fountain(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0;
  const put = (mat, g) => bag.add(mat, quarter(g, a, x, y, z));
  if (el.kind === 'round') {
    put('marble', lz([[1.7, 0], [1.7, 0.7], [1.55, 0.72], [1.55, 0.3], [0.001, 0.3]], 28));
    put('water', lz([[0.001, 0], [1.54, 0], [1.54, 0.01], [0.001, 0.01]], 28).translate(0, 0.55, 0));
    put('marble', lz([[0.4, 0], [0.3, 0.2], [0.18, 0.5], [0.3, 1.0], [0.18, 1.4], [0.5, 1.5], [0.7, 1.7], [0.001, 1.65]], 20).translate(0, 0.3, 0));
    put('water', lz([[0.001, 0], [0.04, 0.0], [0.05, 0.7], [0.001, 0.7]], 6).translate(0, 1.7, 0));
    col.circle(x, z, 1.7, y, y + 0.7); return;
  }
  put('travertine', box(-1.3, 0, -0.55, 1.3, 0.12, 0.55));                                    // the step is the base
  put('travertine', box(-1.2, 0.12, -0.5, 1.2, 0.92, -0.38)); put('travertine', box(-1.2, 0.12, 0.38, 1.2, 0.92, 0.5));
  put('travertine', box(-1.2, 0.12, -0.5, -1.08, 0.92, 0.5)); put('travertine', box(1.08, 0.12, -0.5, 1.2, 0.92, 0.5));
  put('water', box(-1.08, 0.12, -0.38, 1.08, 0.78, 0.38));
  put('travertine', box(-0.3, 0.92, -0.5, 0.3, 1.9, -0.1));                                  // the pier at the back
  put('travertine', box(-0.38, 1.9, -0.55, 0.38, 2.0, -0.05));
  put('marble', box(-0.18, 1.4, -0.1, 0.18, 1.78, -0.07));                                    // the carved head (a mask), flat
  put('bronze', lz([[0.001, 0], [0.04, 0.0], [0.05, 0.03], [0.04, 0.3], [0.001, 0.3]], 8).rotateX(Math.PI / 2).translate(0, 1.2, 0.1));
  put('water', box(-0.02, 0.78, 0.0, 0.02, 1.2, 0.04));
  col.rect([x - 1.3, z - 0.55, x + 1.3, z + 0.55], y, y + 0.95); col.rect([x - 0.4, z - 0.55, x + 0.4, z - 0.1], y, y + 2.0);
}
/** statue: { at, y, rot, h (the figure), base (the plinth's height), mat } — a togate figure on a moulded plinth. */
function statue(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.9, b = el.base ?? 1.2, s = h / 1.7, mat = el.mat ?? 'marble';
  bag.add('marble', box(x - 0.6, y, z - 0.6, x + 0.6, y + 0.25, z + 0.6)); bag.add('travertine', box(x - 0.5, y + 0.25, z - 0.5, x + 0.5, y + b - 0.15, z + 0.5));
  bag.add('marble', box(x - 0.58, y + b - 0.15, z - 0.58, x + 0.58, y + b, z + 0.58));
  const g = lz([[0.001, 0], [0.3, 0.02], [0.32, 0.3], [0.3, 0.9], [0.24, 1.2], [0.18, 1.34], [0.07, 1.4], [0.09, 1.5], [0.09, 1.62], [0.06, 1.7], [0.001, 1.7]], 14).scale(s, s, s * 0.8);
  g.rotateY(el.rot ?? 0); g.translate(x, y + b, z); bag.add(mat, g);
  const arm = box(-0.32, 1.0, -0.1, -0.2, 1.5, 0.1); arm.scale(s, s, s); arm.rotateY(el.rot ?? 0); arm.translate(x, y + b, z); bag.add(mat, arm);
  col.rect([x - 0.6, z - 0.6, x + 0.6, z + 0.6], y, y + b);
}

// ── the public latrine ──────────────────────────────────────────────────────────────────────────────────────────
/**
 * latrine: { rect, front, y } — a public latrine in the manner of Ostia's (dossier §4.7): a room with two entrances either
 * side of a pier carrying the wash basin, a bench of marble slabs with a keyhole every 0.6 m along three sides, the
 * channel of running water before it, the walls painted below a band of white, a shrine of Fortuna over a bench.
 */
function latrine(el, ctx) {
  const T = tools(el, ctx), { W, D, B, V } = T, t = 0.5, H = 4.6;
  const px = W / 2, e0 = px - 2.1, e1 = px + 2.1;
  T.B('cotto_floor', t, W - t, t, D - t, -0.3, 0.0); T.col.floor(T.R(t, W - t, t, D - t), T.y + 0.0);
  frontWall(T, 'stucco_rome', 0, t, 0, W, H, [[e0 - 1.0, e0 + 0.0, 2.9], [e1, e1 + 1.0, 2.9]]);   // two entrances flanking the pier
  sideWall(T, 'stucco_rome', 0, t, t, D, H); sideWall(T, 'stucco_rome', W - t, t, t, D, H);
  B('stucco_rome', 0, W, D - t, D, -0.4, H, true);
  // the pier between the entrances carries the basin
  B('marble', px - 0.5, px + 0.5, t, t + 0.5, 0.0, 1.0, true);
  V('marble', [[0.4, 0], [0.4, 0.15], [0.33, 0.17], [0.33, 0.35], [0.001, 0.35]], px, t + 0.9, 0.72, 16);
  V('water', [[0.001, 0], [0.32, 0], [0.32, 0.01], [0.001, 0.01]], px, t + 0.9, 1.0, 16);
  // the bench: slabs of marble on piers with a keyhole every 0.6 m, along the back and both sides; the channel before it
  const bd = 0.55, by = 0.5, rows = [];
  const keyholes = (u0, u1, d0, d1) => { const n = Math.floor((Math.max(u1 - u0, d1 - d0)) / 0.6), ua = (u1 - u0) >= (d1 - d0); for (let i = 0; i < n; i++) { const u = ua ? u0 + (i + 0.5) * (u1 - u0) / n : (u0 + u1) / 2, d = ua ? (d0 + d1) / 2 : d0 + (i + 0.5) * (d1 - d0) / n; V('lacquer_black', [[0.001, 0], [0.17, 0], [0.17, 0.003], [0.001, 0.003]], u, d, by + 0.01, 10); V('lacquer_black', [[0.001, 0], [0.05, 0], [0.05, 0.003], [0.001, 0.003]], u, ua ? d - 0.3 : d, by + 0.01, 6); } };
  void rows;
  for (const r of [[t + bd + 0.45, W - t - bd - 0.45, D - t - bd, D - t], [t, t + bd, t + 1.4, D - t - bd], [W - t - bd, W - t, t + 1.4, D - t - bd]]) {
    B('travertine', r[0], r[1], r[2], r[3], 0.0, by - 0.1, true);                               // the support
    B('marble_smooth', r[0] - 0.02, r[1] + 0.02, r[2] - 0.02, r[3] + 0.02, by - 0.1, by);     // the slab
    keyholes(r[0], r[1], r[2], r[3]);
  }
  // the channel before the bench: a groove with the water in it, between two low kerbs (the floor is the slab's base)
  const cw = 0.3, cu0 = t + bd + 0.05, cu1 = W - t - bd - 0.05;
  B('travertine', cu0, cu1, D - t - bd - 0.08 - cw, D - t - bd - 0.02, 0.0, 0.06);
  B('travertine', cu0, cu1, D - t - bd - 0.08 - cw - 0.1, D - t - bd - 0.08 - cw, 0.0, 0.06);
  B('water', cu0, cu1, D - t - bd - 0.02 - cw, D - t - bd - 0.08, 0.0, 0.03);
  B('travertine', t + bd + 0.05, t + bd + 0.05 + cw + 0.1, t + 1.4, D - t - bd - 0.5, 0.0, 0.06);
  B('water', t + bd + 0.1, t + bd + 0.1 + cw, t + 1.4, D - t - bd - 0.5, 0.0, 0.03);
  B('travertine', W - t - bd - 0.05 - cw - 0.1, W - t - bd - 0.05, t + 1.4, D - t - bd - 0.5, 0.0, 0.06);
  B('water', W - t - bd - 0.1 - cw, W - t - bd - 0.1, t + 1.4, D - t - bd - 0.5, 0.0, 0.03);
  // the painted walls: a dark dado, white above, a red band under the roof; the shrine of Fortuna on the back wall
  for (const [u0, u1, d0, d1] of [[t, W - t, D - t - 0.01, D - t], [t, t + 0.01, t, D - t], [W - t - 0.01, W - t, t, D - t]]) {
    B('lacquer_black', u0, u1, d0, d1, 0.0, 0.9); B('plaster_white', u0, u1, d0, d1, 0.9, 3.7); B('wall_red', u0, u1, d0, d1, 3.7, 4.0);
  }
  B('stucco', px - 0.7, px + 0.7, D - t - 0.25, D - t, 1.8, 3.0);
  B('wall_red', px - 0.5, px + 0.5, D - t - 0.26, D - t - 0.25, 1.95, 2.8);
  B('egyptian_blue', px - 0.25, px + 0.25, D - t - 0.27, D - t - 0.26, 2.05, 2.7);
  B('stucco', px - 0.8, px + 0.8, D - t - 0.3, D - t, 3.0, 3.12);
  // the roof of tiles on timber, the light from the doors and the high windows
  B('timber', 0, W, 0, D, H - 0.2, H);
  hip(ctx, T.R(0, W, 0, D), T.y + H, 1.6, 0.4);
  for (const u of [W * 0.25, W * 0.75]) B('opening', u - 0.4, u + 0.4, D - t - 0.01, D - t + 0.02, 3.0, 3.8);
  T.L(px, D / 2, 3.0, '#fff0d4', 0.9, 8);
}

// ── the mill-bakery ─────────────────────────────────────────────────────────────────────────────────────────────
/**
 * pistrinum: { rect, front, y } — a bakery with its mills (dossier §4.8): the bread shop on the street with its counter and
 * loaves; the mill hall with three mills (each a cone-shaped meta, the hourglass catillus on it turned by the wooden
 * bars the mules pulled, the basalt floor trodden round), a trough with a water basin, sacks of grain and flour; the
 * oven with its domed cupola and arched mouth and its chimney, the stack of wood, the kneading bench with the loaves.
 */
function pistrinum(el, ctx) {
  const T = tools(el, ctx), { W, D, B, V, C } = T, t = 0.5, H = 5.0, split = 6.4;
  T.B('flagstone', t, split, t, D - t, -0.3, 0.0); T.B('basalt', split, W - t, t, D - t, -0.3, 0.0);
  T.col.floor(T.R(t, W - t, t, D - t), T.y);
  frontWall(T, 'stucco_rome', 0, t, 0, W, H, [[0.9, 5.4, 3.3], [split + 0.6, split + 3.0, 3.0]]);     // the shop opens wide; the door to the mill hall
  sideWall(T, 'stucco_rome', 0, t, t, D, H); sideWall(T, 'stucco_rome', W - t, t, t, D, H);
  B('stucco_rome', 0, W, D - t, D, -0.4, H, true);
  B('stucco_rome', split - 0.2, split + 0.2, t, D - t, -0.4, H, true);                           // the wall between the shop and the mill hall
  // the bread shop: the counter across the front, loaves on it, the shelves of the baker behind, a sign
  B('brick', 1.0, 5.3, 1.3, 1.9, 0.0, 0.95, true); B('marble_smooth', 0.98, 5.32, 1.28, 1.92, 0.95, 1.0);
  for (let k = 0; k < 9; k++) V(k % 3 ? 'hide_tan' : 'terracotta', [[0.001, 0], [0.12, 0.0], [0.14, 0.03], [0.1, 0.07], [0.001, 0.08]], 1.4 + k * 0.4, 1.6, 1.0, 10);
  for (const sy of [0.6, 1.3, 2.0]) B('timber', 0.7, 5.6, D - t - 0.45, D - t - 0.04, sy, sy + 0.05, true);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 11; k++) V('hide_tan', [[0.001, 0], [0.13, 0.0], [0.15, 0.04], [0.1, 0.09], [0.001, 0.1]], 0.95 + k * 0.4, D - t - 0.22, [0.65, 1.35, 2.05][r], 8);
  B('wall_red', 1.8, 4.4, 0.0, 0.02, 3.4, 3.8);                                                  // the painted sign over the door
  // the mill hall: three mills on a line, the paved floor round each trodden by the mules
  for (let k = 0; k < 3; k++) {
    const u = split + 2.6 + k * 2.6, d = 3.2;
    V('basalt', [[1.45, 0], [1.45, 0.04], [0.001, 0.04]], u, d, 0.0, 24);
    V('basalt', [[0.62, 0.04], [0.5, 0.4], [0.3, 1.0], [0.001, 1.0]], u, d, 0.0, 16);            // the meta, the fixed cone
    V('basalt', [[0.55, 0.9], [0.4, 1.3], [0.28, 1.55], [0.4, 1.85], [0.6, 2.2], [0.64, 2.25], [0.001, 2.25]], u, d, 0.0, 16);   // the catillus, the hourglass above it
    V('wood_dark', [[0.001, 0], [0.12, 0], [0.12, 0.5], [0.001, 0.5]], u, d, 1.55, 8);
    const p = T.P(u, d), q = T.P(u + 1.5, d), r = T.P(u - 1.5, d);                               // the two bars through the waist (turned for the mule)
    T.bag.add('timber', box(Math.min(q[0], r[0]) - 0.07, T.y + 1.45, Math.min(q[1], r[1]) - 0.07, Math.max(q[0], r[0]) + 0.07, T.y + 1.58, Math.max(q[1], r[1]) + 0.07));
    C(u, d, 0.62, 0, 1.0); void p;
  }
  // the water basin and the trough, sacks of grain and flour along the side wall
  B('travertine', split + 0.5, split + 1.7, D - t - 1.0, D - t, 0.0, 0.7, true); B('water', split + 0.65, split + 1.55, D - t - 0.9, D - t - 0.1, 0.5, 0.52);
  for (let k = 0; k < 6; k++) V('sacking', [[0.18, 0], [0.24, 0.15], [0.22, 0.55], [0.12, 0.62], [0.001, 0.6]], W - t - 0.45 - (k % 3) * 0.45, t + 0.4 + Math.floor(k / 3) * 0.5, 0.0, 8);
  // the oven in the back corner: a brick base, the dome of its cupola, the arched mouth, the chimney through the roof
  const ou = W - t - 2.2, od = D - t - 2.0;
  B('brick', ou - 1.9, ou + 1.9, od - 1.8, od + 1.8, 0.0, 1.1, true);
  V('brick', [[1.7, 0], [1.6, 0.6], [1.2, 1.2], [0.6, 1.6], [0.001, 1.75]], ou, od, 1.1, 20);
  B('opening', ou - 0.5, ou + 0.5, od - 1.85, od - 1.55, 0.5, 1.2);
  B('lacquer_black', ou - 0.7, ou + 0.7, od - 1.82, od - 1.8, 0.35, 1.3);
  B('brick', ou - 0.4, ou + 0.4, od - 0.4, od + 0.4, 2.7, H + 0.8, true);
  T.L(ou, od - 1.6, 0.9, '#ff7a2a', 1.6, 5);
  for (let k = 0; k < 3; k++) B('timber', W - t - 1.6 + (k % 2) * 0.1, W - t - 0.2, t + 2.2 + k * 0.45, t + 2.55 + k * 0.45, 0.0, 1.0 + (k % 2) * 0.3, true);   // the stack of firewood
  // the kneading bench with dough and loaves, the peel against the wall
  B('wood_dark', split + 0.4, split + 3.6, t + 0.2, t + 1.1, 0.0, 0.85, true);
  for (let k = 0; k < 5; k++) V('hide_tan', [[0.001, 0], [0.14, 0.0], [0.16, 0.04], [0.11, 0.1], [0.001, 0.11]], split + 0.8 + k * 0.55, t + 0.65, 0.85, 8);
  B('timber', split + 4.2, split + 4.3, t + 0.02, t + 0.06, 0.4, 2.6);
  T.B('timber', t, W - t, t, D - t, H - 0.25, H - 0.05);
  hip(ctx, T.R(0, W, 0, D), T.y + H - 0.05, 1.9, 0.5);
  T.L(3.0, 2.5, 2.8, '#ffe8c0', 1.0, 7); T.L(W - 4.0, D / 2, 3.0, '#ffe0b0', 1.0, 8);
}

// ── a podium temple, colonnades ──────────────────────────────────────────────────────────────────────────────────
/**
 * temple: { rect (the podium), front ('e' | 'w' | 'n' | 's'), y, h (column height), nf (columns across the front) } — a
 * Corinthian temple on a high podium (dossier §4.6): a stair the width of the portico, the pronaos two bays deep with a
 * column at each corner of the side rows, the cella of marble-faced concrete with its bronze door, the entablature all round,
 * the pediment and the tiled roof (the ridge along the temple).
 */
function temple(el, ctx) {
  const T = tools(el, ctx), { W, D, B } = T, { bag: bg, col } = ctx, y = el.y ?? 0, PH = el.podium ?? 2.6, h = el.h ?? 12, cd = h / 9.4, nf = el.nf ?? 6;
  const e = 1.6, uc0 = e + 1.2, uc1 = W - e - 1.2, s = (uc1 - uc0) / (nf - 1), dc = 2.6, nd = 3;                       // columns: front row at d = dc; side rows every s to d = dc + nd s
  // the podium: base, die, cornice
  B('travertine', 0, W, 0, D, -0.5, PH - 0.5, true); B('marble', -0.2, W + 0.2, -0.2, D + 0.2, 0.0, 0.35); B('marble', -0.12, W + 0.12, -0.12, D + 0.12, PH - 0.5, PH);
  T.col.floor(T.R(0, W, 0, D), y + PH);
  // the stair across the front
  const sw = uc1 - uc0 - s * 0.4, nst = Math.round(PH / 0.2);
  for (let k = 0; k < nst; k++) B('marble', W / 2 - sw / 2 - 0.2, W / 2 + sw / 2 + 0.2, -0.3 - (nst - 1 - k) * 0.4 + 0.0, 0.2, 0.0, PH * (k + 1) / nst, true);
  // the floor of the pronaos and the cella walls
  B('marble_floor', 0.2, W - 0.2, 0.2, D - 0.2, PH, PH + 0.02);
  const cd0 = dc + nd * s - 0.4, cu0 = uc0 + s * 0.4 - 0.5, cu1 = uc1 - s * 0.4 + 0.5;
  const doorW = 3.4, doorH = 6.5, ty = PH;
  for (const [a, b] of [[cu0, W / 2 - doorW / 2], [W / 2 + doorW / 2, cu1]]) { B('marble', a, b, cd0 - 0.5, cd0 + 0.5, ty, ty + h + 2.4, true); }
  B('marble', W / 2 - doorW / 2, W / 2 + doorW / 2, cd0 - 0.5, cd0 + 0.5, ty + doorH, ty + h + 2.4, true);
  B('opening', W / 2 - doorW / 2 + 0.2, W / 2 + doorW / 2 - 0.2, cd0 - 0.04, cd0 + 0.04, ty, ty + doorH - 0.2);
  B('bronze', W / 2 - doorW / 2 + 0.1, W / 2 + doorW / 2 - 0.1, cd0 - 0.12, cd0 - 0.02, ty, ty + doorH - 0.1);
  sideWall(T, 'marble', cu0 - 0.5, 1.0, cd0 + 0.5, D - 1.0, ty + h + 2.4); sideWall(T, 'marble', cu1 - 0.5, 1.0, cd0 + 0.5, D - 1.0, ty + h + 2.4);
  B('marble', cu0 - 0.5, cu1 + 0.5, D - 1.5, D - 0.5, ty, ty + h + 2.4, true);
  B('marble_floor', cu0 + 0.5, cu1 - 0.5, cd0 + 0.5, D - 1.5, ty, ty + 0.03);
  B('timber', cu0 + 0.5, cu1 - 0.5, cd0 + 0.5, D - 1.5, ty + h + 2.4, ty + h + 2.6);
  // the apse of the cella with the cult statue
  { const p = T.P(W / 2, D - 5); ctx.lights?.push({ at: [p[0], y + ty + 5, p[1]], color: '#ffe8c0', intensity: 1.2, distance: 14 }); }
  B('marble', W / 2 - 1.6, W / 2 + 1.6, D - 3.0, D - 1.6, ty, ty + 1.2, true);
  B('gilt_bronze', W / 2 - 0.6, W / 2 + 0.6, D - 2.6, D - 2.0, ty + 1.2, ty + 4.4);
  // the columns: front row, and the side rows to the cella; the corners and the pairs behind the front
  const cols = [];
  for (let i = 0; i < nf; i++) cols.push([uc0 + i * s, dc]);
  for (let k = 1; k <= nd; k++) cols.push([uc0, dc + k * s], [uc1, dc + k * s]);
  for (const [u, d] of cols) { const p = T.P(u, d); STYLES.roman.column({ at: p, y: y + ty, h, d: cd, mat: 'marble', shaftMat: 'granite_grey' }, ctx); }
  // the entablature: along the front, along both sides to the rear wall, across the rear
  const Ey = y + ty + h, eh = h * 0.2, P2 = (u, d) => T.P(u, d);
  const ent = (a, b) => STYLES.roman.elements.roman_entablature({ a: P2(...a), b: P2(...b), y: Ey, w: 1.5, h: eh, mat: 'marble' }, ctx);
  ent([uc0 - 0.6, dc], [uc1 + 0.6, dc]); ent([uc0, dc], [uc0, D - 1.5]); ent([uc1, dc], [uc1, D - 1.5]); ent([cu0 - 0.5, D - 1.0], [cu1 + 0.5, D - 1.0]);
  for (const [a, b] of [[[cu0, cd0], [uc0, cd0]]]) void a, void b;
  // the pediment and the roof, the ridge along the temple's depth
  const r = T.R(uc0 - 1.0, uc1 + 1.0, dc - 1.0, D - 0.3);
  const ridge = T.along ? 'z' : 'x';
  STYLES.greek.elements.pediment_roof({ rect: r, y: Ey + eh, rise: (uc1 - uc0 + 2) * 0.13, tympanumInset: 0.85, rakingGeison: 0.7, mat: 'marble', tileMat: 'gilt_bronze', ridge }, ctx);
  void bg; void col; void y;
}
/**
 * colonnade: { a [x, z], b [x, z], y, h, step, depth (the portico's depth, toward the side `side` of a→b), side (±1), gaps [[t0, t1]] (distances along a→b left open) }
 * — a row of Corinthian columns of travertine with their entablature, a back wall behind them with a pilaster behind each
 * column, a lean-to roof of tiles falling to the back.
 */
function colonnade(el, ctx) {
  const { bag: bg, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 7.6, step = el.step ?? 3.9, dep = el.depth ?? 5, side = el.side ?? 1;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz * side, nz = ux * side, n = Math.max(1, Math.round(L / step)), gaps = el.gaps ?? [];
  const inGap = (t) => gaps.some(([g0, g1]) => t > g0 - 0.1 && t < g1 + 0.1);
  for (let i = 0; i <= n; i++) { const t = L * i / n; if (inGap(t)) continue; STYLES.roman.column({ at: [ax + ux * t, az + uz * t], y, h, d: 0.8, mat: 'travertine' }, ctx); }
  const far = !!el.simple;
  if (!far) {
    let t0 = 0;
    const segs = [];
    for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > t0) segs.push([t0, g0]); t0 = g1; }
    if (L > t0) segs.push([t0, L]);
    for (const [s0, s1] of segs) STYLES.roman.elements.roman_entablature({ a: [ax + ux * s0, az + uz * s0], b: [ax + ux * s1, az + uz * s1], y: y + h, w: 1.0, h: 1.3, mat: 'travertine' }, ctx);
  } else bg.add('travertine', orientedBox(el.a, el.b, 1.2, y + h, y + h + 1.2));
  // the back wall with its pilasters and a plinth, the lean-to roof falling to it
  const wa = [ax + nx * dep, az + nz * dep], wb = [bx + nx * dep, bz + nz * dep];
  bg.add('stucco_rome', orientedBox(wa, wb, 0.8, y - 0.3, y + h + 2.4)); col.segment(wa, wb, 0.8, y, y + h + 2.4);
  for (const g of gaps) { void g; }
  if (!far) for (let i = 0; i <= n; i++) { const t = L * i / n, c = [ax + ux * t + nx * (dep - 0.6), az + uz * t + nz * (dep - 0.6)]; bg.add('travertine', orientedBox([c[0] - ux * 0.3, c[1] - uz * 0.3], [c[0] + ux * 0.3, c[1] + uz * 0.3], 0.4, y, y + h)); }
  const P = (t, d, yy) => [ax + ux * t + nx * d, yy, az + uz * t + nz * d], tri = [];
  hexa(tri, [P(-0.3, -0.7, y + h + 1.3), P(L + 0.3, -0.7, y + h + 1.3), P(L + 0.3, dep + 0.3, y + h + 2.5), P(-0.3, dep + 0.3, y + h + 2.5)], [P(-0.3, -0.7, y + h + 1.7), P(L + 0.3, -0.7, y + h + 1.7), P(L + 0.3, dep + 0.3, y + h + 2.9), P(-0.3, dep + 0.3, y + h + 2.9)]);
  bg.add('roof_tile', fromTriangles(tri));
  // the paving of the portico
  const q = [P(0, 0, y), P(L, 0, y), P(L, dep, y)], r = [Math.min(q[0][0], q[2][0]), Math.min(q[0][2], q[2][2]), Math.max(q[1][0], q[2][0]), Math.max(q[1][2], q[2][2])];
  bg.add('flagstone', box(r[0], y - 0.3, r[1], r[2], y + 0.04, r[3]));
  col.floor(r, y + 0.04);
}
/** forum_floor: { rect, y } — the paved square: travertine flags with a darker border and a drain line along the middle. */
function forumFloor(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  bag.add('travertine', box(x0, y - 0.4, z0, x1, y, z1)); col.floor(el.rect, y);
  bag.add('flagstone', box(x0 + 1.5, y, z0 + 1.5, x1 - 1.5, y + 0.02, z1 - 1.5));
  const zm = (z0 + z1) / 2; bag.add('basalt', box(x0 + 1.5, y + 0.02, zm - 0.15, x1 - 1.5, y + 0.03, zm + 0.15));
}

Object.assign(STYLES.roman.elements, { taberna_row: tabernaRow, fountain, statue, latrine, pistrinum, temple, colonnade, forum_floor: forumFloor });
