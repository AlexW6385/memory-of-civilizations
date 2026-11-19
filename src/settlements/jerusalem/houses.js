// The courtyard houses of Jerusalem about 700, with their fronts varied by rule (docs/settlements/jerusalem.md §5b): the shared
// house of the islamic style (src/styles/islamic/house.js) is built whole, then its front on the lane is dressed by the class
// the lot's place gives it — dressed ashlar with a pilastered door and cornice, lime plaster with a dado and a painted frieze,
// rubble with dressed quoins, or left plain — its stone bench set clear of the door; and in the open houses of a trade the
// trade's work set up in the main room (a loom, a potter's wheel, dye vats, an olive crusher, a coppersmith's forge).
// Registered as the style `islamic-houses` (the islamic style with this house in place of `levant_house`).

import '../../styles/islamic/index.js';
import '../../styles/islamic/town.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { levantHouse, openLayout } from '../../styles/islamic/house.js';
import { CARDO, SEPULCHRE, HARAM } from './layout.js';
import { levantHouseUp } from './house-up.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const CUT = 'limestone_carved';
/** The trades of the open houses, in the order the rule hands them out. */
export const TRADES = ['weaver', 'potter', 'dyer', 'oil', 'copper'];

/**
 * The class of a lot's front, by its place: round the Haram and the Holy Sepulchre the better houses (ashlar, plaster), along the
 * Cardo plaster and ashlar with some rubble, in the outer quarters rubble and plaster; the rest plain. h in [0, 1) from the seed.
 */
export function frontClass(lot) {
  const [x0, z0, x1, z1] = lot.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, h = ((lot.seed * 2654435761) >>> 0) / 4294967296;
  const dHaram = Math.hypot(Math.max(HARAM.rect[0] - cx, 0, cx - HARAM.rect[2]), Math.max(HARAM.rect[1] - cz, 0, cz - HARAM.rect[3]));
  const dSep = Math.hypot(Math.max(SEPULCHRE[0] - cx, 0, cx - SEPULCHRE[2]), Math.max(SEPULCHRE[1] - cz, 0, cz - SEPULCHRE[3]));
  if (dHaram < 70 || dSep < 60) return h < 0.5 ? 'ashlar' : h < 0.8 ? 'plaster' : 'plain';
  if (Math.abs(cx - CARDO.x) < 60) return h < 0.4 ? 'plaster' : h < 0.65 ? 'ashlar' : h < 0.85 ? 'rubble' : 'plain';
  return h < 0.5 ? 'rubble' : h < 0.75 ? 'plaster' : 'plain';
}

/** The front of the house on the lane (south): where its pieces stand, as levantHouse lays them out (its dice replayed). */
function frontPlan(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, open = !!el.open, T = 0.65;
  const F = Math.max(el.y ?? 0, el.y1 ?? el.y ?? 0) + 0.05, yb = (el.y ?? 0) - 0.6;
  const dW = clamp(W * 0.27, 3.4, 4.2), hasE = open || rand() < 0.6;
  if (!open) rand();
  const xc0 = x0 + dW, xc1 = hasE ? x1 - 3.4 : x1 - T;
  const dc = open ? (xc0 + xc1) / 2 : (xc0 + xc1) / 2 + (rand() - 0.5) * Math.max(0, xc1 - xc0 - 3);
  return { x0, z0, x1, z1, F, yb, xc0, xc1, dc, hW: F + 3.9, hS: F + 3.0, hE: hasE ? F + 3.6 : F + 3.0, hasE };
}

/** The courses of the front: the three pieces (store range, court wall, kitchen range) less the door's clear strip. */
function pieces(f, gap = 0.93) {
  return [[f.x0 + 0.02, f.xc0 - 0.02, f.hW], [f.xc0 + 0.02, f.dc - gap, f.hS], [f.dc + gap, f.xc1 - 0.02, f.hS], [f.xc1 + 0.02, f.x1 - 0.045, f.hE]].filter(([a, b]) => b - a > 1.0);
}

function dressFront(el, { bag }, cls) {
  const f = frontPlan(el), { z1, F, yb, dc } = f, rand = rng((el.seed || 1) + 31), P = pieces(f), skin = { ashlar: 'limestone_yellow', plaster: 'lime_plaster', rubble: 'rubble' }[cls], D = 0.045;
  const edges = P.flatMap(([a, b]) => [a, b]);
  const on = (mat, a, b, y0, y1, d0, d1) => { if (d0 >= D) { d0 = mat === 'plaster_damp' ? D - 0.026 : D - 0.012; if (edges.some((e) => Math.abs(e - a) < 0.002)) a += mat === 'plaster_damp' ? 0.06 : 0.03; if (edges.some((e) => Math.abs(e - b) < 0.002)) b -= mat === 'plaster_damp' ? 0.06 : 0.03; } if (b - a > 0.01 && y1 - y0 > 0.01) bag.add(mat, box(a, y0, z1 + d0, b, y1, z1 + d1)); };
  for (const [a, b, top] of P) on(skin, a, b, yb + 0.05, top, -0.03, D);
  // the damp at the foot, as on the plain houses, over the new face
  for (const [a, b] of P) for (let s = a; s < b - 0.05; s += 1.4) { const e = Math.min(s + 1.4, b); on('plaster_damp', s, e, yb + 0.55, F + (cls === 'ashlar' ? 0.62 : 0.45) + 0.05 * Math.sin(s * 2.3), D, D + 0.016); }
  if (cls === 'ashlar') {
    for (const [a, b, top] of P) {
      on(CUT, a - 0.02, b + 0.02, top - 0.14, top, 0, 0.11);                                    // the cornice under the parapet
      on(CUT, a, b, F - 0.05, F + 0.38, D, 0.1);                                                   // the plinth course
    }
    // the door: a pilaster either side on a base, a block capital, the surround
    for (const s of [-1, 1]) {
      const a = s > 0 ? dc + 0.93 : dc - 1.15, b = a + 0.22;
      on(CUT, a - 0.03, b + 0.03, F - 0.05, F + 0.2, D, 0.12); on('limestone', a, b, F + 0.2, F + 2.55, D, 0.1); on(CUT, a - 0.06, b + 0.06, F + 2.55, F + 2.8, D, 0.14);
    }
    // panels in the court wall either side of the door: a moulded frame, the field recessed
    for (const [a, b] of [[f.xc0 + 0.55, dc - 1.5], [dc + 1.5, f.xc1 - 0.55]]) if (b - a > 1.2) {
      const y0 = F + 0.75, y1 = F + 2.3;
      on(CUT, a, b, y0, y0 + 0.09, D, 0.085); on(CUT, a, b, y1 - 0.09, y1, D, 0.085); on(CUT, a, a + 0.09, y0, y1, D, 0.085); on(CUT, b - 0.09, b, y0, y1, D, 0.085);
    }
    window(bag, f, (f.x0 + f.xc0) / 2, F + 1.9, 0.55, 0.8, CUT);
  } else if (cls === 'plaster') {
    // a dado of grey plaster, its top moulded; a painted frieze of squares in red and ochre; the door's frame painted
    for (const [a, b] of P) { on('plaster_grey', a, b, yb + 0.05, F + 0.85, D, D + 0.016); on(CUT, a, b, F + 0.85, F + 0.93, D, D + 0.04); }
    for (const [a, b] of P) for (let s = a + 0.1, k = 0; s < b - 0.3; s += 0.32, k++) if (Math.abs(s + 0.1 - (f.x0 + f.xc0) / 2) > 0.7) on(k % 2 ? 'cloth_ochre' : 'cloth_red', s, s + 0.2, F + 2.38, F + 2.58, D, D + 0.016);
    for (const s of [-1, 1]) on('cloth_red', s > 0 ? dc + 0.93 : dc - 1.13, s > 0 ? dc + 1.13 : dc - 0.93, F, F + 2.75, D, D + 0.016);
    window(bag, f, (f.x0 + f.xc0) / 2, F + 1.9, 0.5, 0.75, CUT);
  } else {
    // rubble with dressed quoins at the ends and either side of the door, a timber lintel carried out over the door
    for (const [a, b, top] of P) for (const [qa, qb, edge] of [[a, a + 0.6, a <= f.x0 + 0.03 || Math.abs(a - (dc + 0.93)) < 0.01], [b - 0.6, b, b >= f.x1 - 0.06 || Math.abs(b - (dc - 0.93)) < 0.01]]) {
      if (!edge) continue;
      for (let y = F - 0.1, k = 0; y < top - 0.3; y += 0.34, k++) { const long = (k + (qa > a ? 1 : 0)) % 2; on('limestone', long ? qa : qa + 0.18, long ? qb : qb, y, y + 0.32, D, 0.1); }
    }
    on('cedar', dc - 1.3, dc + 1.3, F + 2.98, F + 3.1 > f.hS ? f.hS : F + 3.1, 0, 0.14);
  }
  // the stone bench by the door, clear of it (where the lane is wide enough), and the bracket lamp stays as built
  void rand;
}

/** A small window high in the front: the dark opening, a frame, a grille of cedar bars. */
function window(bag, f, u, y0, w, h, frame) {
  const z = f.z1 + 0.045;
  bag.add('opening', box(u - w / 2, y0, z, u + w / 2, y0 + h, z + 0.012));
  bag.add(frame, box(u - w / 2 - 0.12, y0 - 0.12, z, u + w / 2 + 0.12, y0, z + 0.07)); bag.add(frame, box(u - w / 2 - 0.14, y0 + h, z, u + w / 2 + 0.14, y0 + h + 0.2, z + 0.06));
  for (const s of [-1, 1]) bag.add(frame, box(u + s * (w / 2 + 0.01) - (s < 0 ? 0.1 : 0), y0, z, u + s * (w / 2 + 0.01) + (s > 0 ? 0.1 : 0), y0 + h, z + 0.05));
  for (let k = 1; k < 5; k++) bag.add('cedar', box(u - w / 2 + (w * k) / 5 - 0.02, y0, z + 0.012, u - w / 2 + (w * k) / 5 + 0.02, y0 + h, z + 0.05));
  bag.add('cedar', box(u - w / 2, y0 + h * 0.5 - 0.02, z + 0.012, u + w / 2, y0 + h * 0.5 + 0.02, z + 0.05));
}

/** The stone bench against the front, to one side of the door and clear of its pilaster. */
function bench(el, { bag, col }) {
  const f = frontPlan(el), rand = rng((el.seed || 1) + 77);
  if ((el.gs ?? 0) <= 3.4 || rand() > 0.7) return;
  const side = f.dc - 2.4 - 1.0 > f.x0 + 0.5 ? -1 : 1, bx = f.dc + side * 2.4;
  if (bx - 1.0 < f.x0 + 0.4 || bx + 1.0 > f.x1 - 0.4) return;
  const ys = el.ys ?? f.F, by = Math.max(ys, f.F - 0.25), z1 = f.z1;
  bag.add(CUT, box(bx - 1.0, by - 0.1, z1 + 0.1, bx + 1.0, by + 0.45, z1 + 0.5)); bag.add('limestone', box(bx - 1.04, by + 0.45, z1 + 0.1, bx + 1.04, by + 0.5, z1 + 0.54));
  col.rect([bx - 1.04, z1 + 0.1, bx + 1.04, z1 + 0.54], by - 0.1, by + 0.5);
}

// ── the trades' work, in the main room of an open house ─────────────────────────────────────────
/** A post of timber from (x, z), y0 to y1, half-width r. */
const post = (bag, x, z, y0, y1, r = 0.045) => bag.add('timber', box(x - r, y0, z - r, x + r, y1, z + r));
function trade(el, { bag, col, lights }) {
  const { F, room: [rx0, rz0, rx1, rz1] } = openLayout(el), mid = (rx0 + rx1) / 2, kind = el.trade;
  const x = rx0 + 1.4, z = rz0 + 0.95, zc = (rz0 + 0.95 + rz1 - 0.15) / 2, Y = F + 0.02;       // the work: west half, between the mattresses
  if (kind === 'weaver') {
    // an upright loom: two posts, a beam above and below, the warp between them, the cloth woven at its foot, the weights hanging
    const w = 1.5, xa = x + 0.2, xb = xa + w;
    post(bag, xa, zc, Y, Y + 1.75); post(bag, xb, zc, Y, Y + 1.75);
    bag.add('timber', box(xa - 0.05, Y + 1.7, zc - 0.05, xb + 0.05, Y + 1.8, zc + 0.05)); bag.add('timber', box(xa - 0.05, Y + 0.35, zc - 0.04, xb + 0.05, Y + 0.42, zc + 0.04));
    for (const s of [-1, 1]) bag.add('timber', box(xa - 0.05, Y, zc + s * 0.32 - 0.03, xb + 0.05, Y + 0.05, zc + s * 0.32 + 0.03));
    for (let k = 0; k < 24; k++) bag.add('linen', box(xa + 0.07 + k * (w - 0.14) / 23 - 0.006, Y + 0.42, zc - 0.006, xa + 0.07 + k * (w - 0.14) / 23 + 0.006, Y + 1.7, zc + 0.006));
    bag.add('cloth_indigo', box(xa + 0.06, Y + 0.42, zc - 0.012, xb - 0.06, Y + 0.95, zc + 0.012)); bag.add('cloth_red', box(xa + 0.06, Y + 0.95, zc - 0.012, xb - 0.06, Y + 1.03, zc + 0.012));
    bag.add('timber', box(xa + 0.06, Y + 1.03, zc - 0.02, xb - 0.06, Y + 1.07, zc + 0.02));       // the shed rod
    col.rect([xa - 0.07, zc - 0.35, xb + 0.07, zc + 0.35], Y, Y + 1.8);
    bag.add('linen', lathe([[0.2, 0], [0.27, 0.12], [0.3, 0.3], [0.001, 0.3]], 10, null, xb + 0.7, Y, zc));
  } else if (kind === 'potter') {
    // a slow wheel on a post, a pot being thrown, boards of drying jars, a heap of clay, a stack of fired pots
    const wx = x + 0.6, wz = zc;
    bag.add('timber', lathe([[0.001, 0], [0.38, 0], [0.38, 0.06], [0.001, 0.06]], 16, null, wx, Y, wz)); post(bag, wx, wz, Y + 0.06, Y + 0.34, 0.035);
    bag.add('timber', lathe([[0.001, 0], [0.2, 0], [0.2, 0.05], [0.001, 0.05]], 14, null, wx, Y + 0.34, wz));
    bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.13, 0.12], [0.1, 0.2], [0.08, 0.24], [0.001, 0.24]], 12, null, wx, Y + 0.39, wz));
    bag.add('terracotta', lathe([[0.001, 0], [0.5, 0], [0.4, 0.14], [0.2, 0.26], [0.001, 0.3]], 12, null, wx + 1.25, Y, wz + 0.1));
    col.circle(wx, wz, 0.4, Y, Y + 0.6); col.circle(wx + 1.25, wz + 0.1, 0.5, Y, Y + 0.3);
    const bz = rz0 + 0.45;
    for (let k = 0; k < 2; k++) {
      const by = Y + 0.5 + k * 0.5;
      bag.add('timber', box(x + 2.0, by, bz - 0.2, x + 3.4, by + 0.04, bz + 0.2)); for (const bx of [x + 2.05, x + 3.35]) post(bag, bx, bz, Y, by, 0.03);
      for (let j = 0; j < 5; j++) bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.02], [0.11, 0.1], [0.08, 0.2], [0.09, 0.23], [0.001, 0.23]], 10, null, x + 2.2 + j * 0.27, by + 0.04, bz));
    }
    col.rect([x + 1.95, bz - 0.22, x + 3.45, bz + 0.22], Y, Y + 1.1);
  } else if (kind === 'dyer') {
    // three vats of dye in a row (indigo, madder, weld), a rack of dyed hanks drying on a pole, the dyed cloth over a line
    const cols = [['cloth_indigo', 0], ['cloth_red', 1], ['cloth_ochre', 2]];
    for (const [m, k] of cols) {
      const vx = x + 0.5 + k * 1.0;
      bag.add('pottery_dark', lathe([[0.2, 0], [0.34, 0.12], [0.4, 0.34], [0.38, 0.62], [0.4, 0.64], [0.3, 0.64], [0.3, 0.6], [0.001, 0.58]], 14, null, vx, Y, zc));
      bag.add(m, lathe([[0.31, 0], [0.001, 0]], 14, null, vx, Y + 0.58, zc)); bag.add(m, box(vx - 0.28, Y + 0.585, zc - 0.28, vx + 0.28, Y + 0.592, zc + 0.28).rotateY(0.4));
      col.circle(vx, zc, 0.42, Y, Y + 0.66);
    }
    const rz = rz0 + 0.5, xa = x + 3.35;
    for (const s of [-1, 1]) post(bag, xa + s * 0.7, rz, Y, Y + 1.6, 0.035);
    bag.add('timber', box(xa - 0.75, Y + 1.55, rz - 0.03, xa + 0.75, Y + 1.62, rz + 0.03));
    for (let k = 0; k < 6; k++) bag.add(cols[k % 3][0], box(xa - 0.6 + k * 0.24, Y + 0.85, rz - 0.04, xa - 0.46 + k * 0.24, Y + 1.55, rz + 0.04));
    col.rect([xa - 0.78, rz - 0.06, xa + 0.78, rz + 0.06], Y, Y + 1.65);
  } else if (kind === 'oil') {
    // an olive crusher: a round basin of stone with a vertical millstone turned by a beam on a central post; baskets of olives; jars of oil
    const cx = x + 1.0, cz = zc;
    bag.add('limestone', lathe([[0.001, 0], [0.85, 0], [0.85, 0.3], [0.7, 0.3], [0.7, 0.12], [0.001, 0.12]], 22, null, cx, Y, cz));
    post(bag, cx, cz, Y + 0.12, Y + 1.0, 0.07);
    bag.add('timber', box(cx - 0.05, Y + 0.55, cz - 0.05, cx + 0.5, Y + 0.62, cz + 0.05));
    bag.add('limestone', lathe([[0.001, -0.11], [0.44, -0.11], [0.44, 0.11], [0.001, 0.11]], 18, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(cx + 0.36, Y + 0.12 + 0.44, cz));
    bag.add('timber', box(cx + 0.36 - 0.06, Y + 0.56, cz - 0.09, cx + 0.36 + 0.06, Y + 0.64, cz + 0.09));
    bag.add('cloth_green', lathe([[0.001, 0], [0.6, 0], [0.5, 0.025], [0.001, 0.03]], 14, null, cx, Y + 0.12, cz));
    col.circle(cx, cz, 0.9, Y, Y + 0.34);
    for (let k = 0; k < 3; k++) bag.add('reed_mat', lathe([[0.2, 0], [0.27, 0.12], [0.3, 0.3], [0.001, 0.3]], 10, null, x + 2.4 + k * 0.5, Y, rz0 + 0.5));
  } else {
    // a coppersmith's: a stump with an iron anvil, a little forge with a glowing hearth and a bellows, the wares hung from a rail
    const ax = x + 0.5;
    bag.add('timber', lathe([[0.2, 0], [0.22, 0.2], [0.2, 0.4], [0.001, 0.4]], 10, null, ax, Y, zc));
    bag.add('iron', box(ax - 0.12, Y + 0.4, zc - 0.07, ax + 0.12, Y + 0.48, zc + 0.07));
    const fx = x + 1.9, fz = zc;
    bag.add('basalt', box(fx - 0.45, Y, fz - 0.4, fx + 0.45, Y + 0.5, fz + 0.4)); bag.add('flame', lathe([[0.001, 0], [0.12, 0.01], [0.001, 0.06]], 8, null, fx, Y + 0.5, fz));
    bag.add('hide_tan', box(fx - 0.75, Y + 0.28, fz - 0.14, fx - 0.45, Y + 0.38, fz + 0.14));
    col.circle(ax, zc, 0.24, Y, Y + 0.5); col.rect([fx - 0.78, fz - 0.42, fx + 0.48, fz + 0.42], Y, Y + 0.52);
    const rz = rz0 + 0.4;
    bag.add('timber', box(x + 2.7, Y + 1.55, rz - 0.03, x + 4.0, Y + 1.6, rz + 0.03)); for (const px of [x + 2.7, x + 4.0]) post(bag, px, rz, Y, Y + 1.6, 0.03);
    for (let k = 0; k < 5; k++) bag.add('bronze', lathe([[0.001, 0], [0.08, 0.03], [0.1, 0.22], [0.05, 0.3], [0.04, 0.31], [0.001, 0.31]], 10, null, x + 2.85 + k * 0.25, Y + 1.26, rz));
    lights?.push({ at: [fx, Y + 0.7, fz], color: '#ff8a3c', intensity: 2.2, distance: 5 });
  }
  void mid;
}

function house(el, ctx) {
  const cls = el.front && el.front !== 'plain' ? el.front : null;
  if (el.up) levantHouseUp({ ...el, gs: 0 }, ctx); else levantHouse({ ...el, gs: 0 }, ctx);              // (the lane's width is held back: the bench is set here, clear of the door)
  if (cls) dressFront(el, ctx, cls);
  if (!el.open) bench(el, ctx);
  if (el.open && el.trade) trade(el, ctx);
}

registerStyle('islamic-houses', { ...STYLES.islamic, elements: { ...STYLES.islamic.elements, levant_house: house } });
