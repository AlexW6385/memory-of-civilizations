// The Great Mosque of al-Mansur, in detail (docs/settlements/abbasid-baghdad.md §13), and the small mosques of the quarters.
// The walls are of sun-dried brick (the mosque of al-Mansur was pulled down and rebuilt in kiln-fired brick only in 807–809 [stated: Wikipedia, Great Mosque of
// al-Mansur]); their outer faces are a rhythm of nine bays, a pilaster between each, a blind pointed niche in every bay and a door in a few, a plaster
// cornice above [inferred from the blind arcading of Abbasid walls; Samarra, al-Ukhaidir]. The qibla wall has its mihrab and nine arched windows.
// All in the mosque's local frame (the street south, +z), the walls' lines as plan.js sets them.

import { box, lathe } from '../../core/geom.js';
import { archBand, archPoly, polyGeo, stuccoPanel, wallRun, local, orientedBox, archCurve, gardenTree } from './kit.js';
import { teak, rug } from './palace.js';
import { zir } from './dress.js';

const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const BRICKS = ['brick_baked', 'brick_buff'];

/** The bay count of a wall of the great mosque and the bays that hold doors (by face: north, east, south, west). */
export const MOSQUE_BAYS = 9;
export const MOSQUE_DOORS = { n: [4], e: [2, 7], s: [], w: [1, 5] };

/** The outer faces of the great mosque: corner piers, pilasters, niches, door surrounds, windows of the qibla wall, cornice. H the half side, T the wall, WH its height. */
export function mosqueExterior({ bag, col }, { H, T, WH, y, doorW = 3.0, doorH = 4.4 }) {
  const L = 2 * H, n = MOSQUE_BAYS, bw = L / n;
  const faces = [
    { O: [H, -H - T / 2], U: [-1, 0], N: [0, -1], doors: MOSQUE_DOORS.n },
    { O: [H + T / 2, -H], U: [0, 1], N: [1, 0], doors: MOSQUE_DOORS.e },
    { O: [-H, H + T / 2], U: [1, 0], N: [0, 1], doors: MOSQUE_DOORS.s, qibla: true },
    { O: [-H - T / 2, H], U: [0, -1], N: [-1, 0], doors: MOSQUE_DOORS.w },
  ];
  const at = (f, u, d) => [f.O[0] + f.U[0] * u + f.N[0] * d, f.O[1] + f.U[1] * u + f.N[1] * d];
  const bx = (f, u0, u1, d0, d1, v0, v1) => { const a = at(f, u0, d0), b = at(f, u1, d1); return [Math.min(a[0], b[0]), v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), v1, Math.max(a[1], b[1])]; };
  // the corners: the wall runs meet at a square pier standing a little proud, a course taller than the cornice
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x0 = sx < 0 ? -H - T / 2 - 0.45 : H - T / 2, x1 = sx < 0 ? -H + T / 2 : H + T / 2 + 0.45, z0 = sz < 0 ? -H - T / 2 - 0.45 : H - T / 2, z1 = sz < 0 ? -H + T / 2 : H + T / 2 + 0.45;
    bag.add('brick_buff', box(x0, y, z0, x1, y + WH + 0.35, z1)); col.rect([x0, z0, x1, z1], y, y + WH + 0.35);
  }
  for (const f of faces) {
    const fr = { O: f.O, U: f.U, N: f.N };
    for (let k = 1; k < n; k++) { const b = bx(f, k * bw - 0.35, k * bw + 0.35, 0, 0.42, y, y + WH - 0.4); bag.add('brick_buff', box(...b)); col.rect([b[0], b[2], b[3], b[5]], y, y + WH - 0.4); }
    for (let k = 0; k < n; k++) {
      const uc = (k + 0.5) * bw;
      if (f.doors.includes(k)) {
        // the doorway's surround: a ring of voussoirs round the opening, a stucco field over it
        archBand(bag, fr, uc - doorW / 2, y, doorW, doorH, 0.45, 0, 0.1, BRICKS);
        stuccoPanel(bag, fr, uc - 1.35, uc + 1.35, y + doorH + 0.75, y + doorH + 1.55, 0.035, 'stucco', 0.3);
        bag.add('plaster_white', box(...bx(f, uc - 1.45, uc + 1.45, 0, 0.06, y + doorH + 0.7, y + doorH + 0.75)));
        bag.add('plaster_white', box(...bx(f, uc - 1.45, uc + 1.45, 0, 0.06, y + doorH + 1.55, y + doorH + 1.6)));
      } else {
        // a blind niche: a pointed arch, dark in its field, ringed in brick; a plinth course below it
        const nw = 2.9, nh = 4.4, v0 = y + 1.1;
        bag.add('opening', polyGeo(fr, archPoly(uc - nw / 2, v0, nw, nh), 0, 0.05));
        archBand(bag, fr, uc - nw / 2, v0, nw, nh, 0.28, 0, 0.1, BRICKS);
        bag.add('brick_buff', box(...bx(f, uc - nw / 2 - 0.28, uc + nw / 2 + 0.28, 0, 0.08, y + 0.8, v0)));
        // a window above it in the qibla wall, a slit in the others' wall (dark; only the qibla wall's pierce through)
        if (f.qibla) { bag.add('opening', polyGeo(fr, archPoly(uc - 0.6, y + 6.1, 1.2, 2.0), 0, 0.05)); archBand(bag, fr, uc - 0.6, y + 6.1, 1.2, 2.0, 0.22, 0, 0.09, BRICKS); }
      }
    }
    // the cornice: a plaster course with a toothed band of baked brick under it
    bag.add('plaster_white', box(...bx(f, 0, L, 0, 0.22, y + WH - 0.35, y + WH)));
    for (let i = 0; i < Math.floor(L / 0.4); i++) bag.add('brick_baked', box(...bx(f, i * 0.4 + 0.08, i * 0.4 + 0.32, 0, 0.1, y + WH - 0.62, y + WH - 0.35)));
  }
}

/** The mihrab of the qibla wall (the wall's inner face at z = mz), the niche cut through the wall by plan: a ring of voussoirs, colonettes, stucco, an inscription band. */
export function mihrab({ bag, col }, { mz, y, T }) {
  const fr = { O: [-0.9, mz], U: [1, 0], N: [0, -1] }, w = 1.8, h = 3.6;
  archBand(bag, fr, 0, y, w, h, 0.42, 0, 0.12, ['brick_buff', 'plaster_white']);
  for (const sg of [-1, 1]) {
    const x = sg * 1.12;
    bag.add('marble', lathe([[0.15, 0], [0.11, 0.08], [0.09, 0.3], [0.09, 2.5], [0.12, 2.62], [0.16, 2.7], [0.001, 2.7]], 10, null, x, y, mz - 0.14)); col.circle(x, mz - 0.14, 0.16, y, y + 2.7);
  }
  // the niche's back: stucco in the bevelled style, a conch band over it
  stuccoPanel(bag, { O: [-0.9, mz + 0.73], U: [1, 0], N: [0, -1] }, 0.12, w - 0.12, y + 0.35, y + 2.7, 0.04, 'stucco', 0.3);
  stuccoPanel(bag, fr, -2.4 + 0.9, 2.4 + 0.9, y + 4.55, y + 5.25, 0.045, 'stucco', 0.34);        // the inscription band over the arch (an inscribed field)
  stuccoPanel(bag, fr, -3.3 + 0.9, -1.5 + 0.9 - 0.12 + 0.12, y + 0.3, y + 4.2, 0.045, 'stucco', 0.36);
  stuccoPanel(bag, fr, 1.5 + 0.9 + 0.12 - 0.12, 3.3 + 0.9, y + 0.3, y + 4.2, 0.045, 'stucco', 0.36);
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.06], [0.14, 0.24], [0.001, 0.34]], 10, null, 0, y + 2.9, mz - 0.35));
  bag.add('iron', box(-0.01, y + 3.24, mz - 0.36, 0.01, y + 3.58, mz - 0.34));
  void T;
}

/** The minbar: seven steps up to a seat under a canopy, solid side panels stepped with the stair, a back panel on the wall. Its foot at (x, z), climbing toward +z against the qibla wall. */
export function minbar({ bag, col }, { x, zWall, y }) {
  const rise = 0.2, run = 0.36, n = 7, W = 1.4, x0 = x - W / 2, x1 = x + W / 2, zTop = zWall - 0.05, zPl = zTop - 1.05, zFoot = zPl - n * run;
  for (let k = 0; k < n; k++) {
    const z0 = zFoot + k * run;
    bag.add('cedar', box(x0, y, z0, x1, y + rise * (k + 1), z0 + run));
    for (const sx of [x0 - 0.1, x1]) bag.add('wood_dark', box(sx, y, z0, sx + 0.1, y + rise * (k + 1) + 0.55, z0 + run));
  }
  const top = y + rise * n;
  bag.add('cedar', box(x0, y, zPl, x1, top, zTop));
  for (const sx of [x0 - 0.1, x1]) bag.add('wood_dark', box(sx, y, zPl, sx + 0.1, top + 0.75, zTop));
  bag.add('wood_dark', box(x0, top + 0.02, zTop - 0.1, x1, top + 1.5, zTop));                     // the back panel
  bag.add('cloth_maroon', box(x0 + 0.1, top, zPl + 0.1, x1 - 0.1, top + 0.08, zTop - 0.14));        // the seat's cushion
  for (const sx of [x0 - 0.05, x1 - 0.05]) bag.add('wood_dark', box(sx, top + 0.75, zPl, sx + 0.1, top + 1.9, zPl + 0.1));   // the canopy posts
  bag.add('wood_dark', box(x0 - 0.12, top + 1.9, zPl - 0.02, x1 + 0.12, top + 2.04, zTop)); bag.add('gilt_bronze', box(x0 - 0.12, top + 2.04, zPl - 0.02, x1 + 0.12, top + 2.1, zPl + 0.04));
  col.rect([x0 - 0.1, zFoot, x1 + 0.1, zTop], y, y + top - y + 2.04);
}

/** A rahla: the folding Qur'an stand, two crossed boards on a base, the book open on it, at (x, z) facing south. */
export function rahla({ bag, col }, x, z, y) {
  for (const sx of [-0.28, 0.28]) { bag.add('cedar', box(x + sx - 0.02, y, z - 0.18, x + sx + 0.02, y + 0.34, z + 0.18)); }
  bag.add('cedar', box(x - 0.3, y + 0.34, z - 0.2, x + 0.3, y + 0.37, z + 0.2));
  bag.add('cedar', box(x - 0.3, y + 0.37, z - 0.22, x + 0.3, y + 0.44, z - 0.18));              // the lip the book rests on
  bag.add('plaster_white', box(x - 0.24, y + 0.37, z - 0.16, x + 0.24, y + 0.4, z + 0.16)); bag.add('cloth_maroon', box(x - 0.26, y + 0.36, z - 0.18, x - 0.24, y + 0.41, z + 0.18));
  col.rect([x - 0.3, z - 0.2, x + 0.3, z + 0.2], y, y + 0.44);
}

/** A glass lamp hung on a chain from a beam at height yb: chain, bronze ring, the glass. */
export function hangLamp(bag, x, z, yb, drop = 0.9) {
  bag.add('iron', box(x - 0.008, yb - drop, z - 0.008, x + 0.008, yb, z + 0.008));
  bag.add('bronze', lathe([[0.2, 0], [0.12, 0.1], [0.03, 0.14]], 10, null, x, yb - drop - 0.04, z));
  bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.04], [0.12, 0.18], [0.001, 0.28]], 10, null, x, yb - drop - 0.3, z));
}

/**
 * quarter_masjid: { rect, face (the street side), seed } — the small mosque of a quarter, a house-sized plot: a doorway from the street into a paved court
 * with a basin, jars and one palm, the prayer hall at the back (the qibla side) of two aisles of teak columns under a flat roof of beams, palm ribs and
 * earth; a mihrab on the back wall and a small wooden minbar; reed mats and rugs, lamps. No minaret (docs §3). [inferred: the type of the small mosque of the
 * age; the quarters of Baghdad each had one]
 */
function masjid(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, face = el.face || 'n', y = el.y ?? 0;
  const turned = face === 's' || face === 'n', w = turned ? x1 - x0 : z1 - z0, d = turned ? z1 - z0 : x1 - x0, hw = w / 2, hd = d / 2, T = 0.6, H = 4.8, simple = !!el.simple;
  local(ctx, [cx, cz], YAW[face], (c) => {
    const { bag, col, lights } = c, mat = 'mudbrick';
    const hallD = Math.min(11.5, d * 0.55), zh = hd - (d - hallD);          // the hall spans z in [-hd, zh]; the court from zh to hd
    // the walls: the front with an arched door (1.9 × 3.3) and a window slit either side; the sides and the back plain, a plaster band over a mud-brick foot
    const wr = (a, b, ops) => { wallRun(c, { a, b, th: T, y0: y, y1: y + H, mat, ops }); bag.add('plaster_white', orientedBox(a, b, T + 0.06, y + 3.4, y + H)); };
    const doorAt = hw + (el.seed % 2 ? -1 : 1) * Math.min(w / 4, 2.4);
    wr([-hw, hd - T / 2], [hw, hd - T / 2], [{ at: doorAt, w: 1.9, h: 3.3 }]);
    wr([hw - T / 2, hd], [hw - T / 2, -hd], []); wr([-hw + T / 2, -hd], [-hw + T / 2, hd], []);
    wr([hw, -hd + T / 2], [-hw, -hd + T / 2], []);
    const dx = doorAt - hw;
    if (!simple) {
      const fr = { O: [dx - 0.95, hd], U: [1, 0], N: [0, 1] };
      archBand(bag, fr, 0, y, 1.9, 3.3, 0.35, 0, 0.08, BRICKS);
      stuccoPanel(bag, fr, -0.6, 2.5, y + 4.0, y + 4.6, 0.03, 'stucco', 0.28);
      // blind niches along the front between door and corners, a cornice
      for (const sg of [-1, 1]) { const uc = dx + sg * 3.0; if (Math.abs(uc) < hw - 1.1 && Math.abs(uc - dx) > 1.8) { bag.add('opening', polyGeo({ O: [0, hd], U: [1, 0], N: [0, 1] }, archPoly(uc - 0.7, y + 1.2, 1.4, 2.4), 0, 0.04)); archBand(bag, { O: [0, hd], U: [1, 0], N: [0, 1] }, uc - 0.7, y + 1.2, 1.4, 2.4, 0.2, 0, 0.08, BRICKS); } }
      bag.add('plaster_white', box(-hw, y + H - 0.3, hd, hw, y + H, hd + 0.16));
    }
    // the court: paved, a basin of stone with water (the ablution), jars on a bench, a palm
    bag.add('brick_paving', box(-hw + T, y - 0.2, zh, hw - T, y + 0.02, hd - T / 2));
    bag.add('ground', box(-hw + T, y - 0.2, -hd + T, hw - T, y + 0.02, zh));
    const bz = (zh + hd) / 2 + 0.3, bxm = -dx * 0.4;
    bag.add('limestone', lathe([[1.0, 0], [1.0, 0.62], [0.78, 0.62], [0.78, 0.4]], 8, null, bxm, y, bz)); bag.add('water', lathe([[0.001, 0], [0.78, 0]], 8, null, bxm, y + 0.5, bz)); col.circle(bxm, bz, 1.0, y, y + 0.62);
    if (!simple) {
      bag.add('brick_baked', box(hw - T - 0.5, y, zh + 1.0, hw - T, y + 0.45, hd - 1.6)); col.rect([hw - T - 0.5, zh + 1.0, hw - T, hd - 1.6], y, y + 0.45);
      for (let k = 0; k < 3; k++) zir(bag, col, hw - T - 0.25, zh + 1.6 + k * 0.9, y + 0.45, 0.6);
      gardenTree(bag, col, -hw + T + 1.4, zh + 2.0, y, 2.9, 1.2, false);
      bag.add('palm_trunk', lathe([[0.17, 0], [0.12, 3.6], [0.001, 3.62]], 8, null, -hw + T + 1.0, y, hd - 2.6)); col.circle(-hw + T + 1.0, hd - 2.6, 0.2, y, y + 3.6);
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; bag.add('palm_leaf', box(-hw + T + 1.0 + Math.cos(a) * 0.7 - 0.5, y + 3.55 + (k % 2) * 0.1, hd - 2.6 + Math.sin(a) * 0.7 - 0.07, -hw + T + 1.0 + Math.cos(a) * 0.7 + 0.5, y + 3.65 + (k % 2) * 0.1, hd - 2.6 + Math.sin(a) * 0.7 + 0.07)); }
    }
    // the hall: open to the court on its whole front, a beam wall on two teak columns; two aisles of columns inside; flat roof
    const CH = 3.5, nc = Math.max(2, Math.floor(w / 3.4)), rows = Math.max(2, Math.floor(hallD / 3.3));
    const xs = Array.from({ length: nc }, (_, i) => -hw + T + (w - 2 * T) * (i + 0.5) / nc), zr = Array.from({ length: rows }, (_, j) => -hd + T + 1.2 + (hallD - T - 1.8) * j / Math.max(1, rows - 1));
    for (const x of xs) for (const z of zr) teak(bag, col, x, z, y, CH, 0.2);
    for (const z of zr) bag.add('cedar', box(-hw + T, y + CH, z - 0.2, hw - T, y + CH + 0.36, z + 0.2));
    for (let i = 0; i <= nc * 2; i++) { const x = -hw + T + (w - 2 * T) * i / (nc * 2); bag.add('cedar', box(Math.min(hw - T - 0.12, Math.max(-hw + T, x - 0.12)), y + CH + 0.36, -hd + T, Math.min(hw - T, Math.max(-hw + T + 0.12, x + 0.12)), y + CH + 0.66, zh)); }
    bag.add('timber', box(-hw + T, y + CH + 0.66, -hd + T, hw - T, y + CH + 0.82, zh)); bag.add('mud_plaster', box(-hw + T, y + CH + 0.82, -hd + T, hw - T, y + CH + 1.1, zh));
    bag.add('mud_plaster', box(-hw, y + CH + 1.1, -hd, hw, y + CH + 1.2, zh));
    // the front of the hall, toward the court: a low brick riser and a lintel beam, open between the columns
    bag.add('reed_mat', box(-hw + T + 0.2, y + 0.02, -hd + T + 0.2, hw - T - 0.2, y + 0.045, zh - 0.5));
    if (!simple) {
      rug(bag, 0, -hd + T + 1.6, Math.min(5.2, w - 3), 2.0, y + 0.046, 'cloth_green', 'cloth_indigo', 'cloth_ochre');
      // the mihrab on the back wall: a niche's frame of a pointed arch and a colonette each side, stucco; a minbar of three steps beside it
      const mf = { O: [-0.7, -hd + T], U: [1, 0], N: [0, 1] };
      bag.add('opening', polyGeo(mf, archPoly(0, y, 1.4, 2.6), 0, 0.04)); archBand(bag, mf, 0, y, 1.4, 2.6, 0.32, 0, 0.1, ['brick_buff', 'plaster_white']);
      stuccoPanel(bag, { O: [-2.4, -hd + T], U: [1, 0], N: [0, 1] }, 0, 1.2, y + 0.3, y + 2.9, 0.04, 'stucco', 0.3); stuccoPanel(bag, { O: [-2.4, -hd + T], U: [1, 0], N: [0, 1] }, 3.6, 4.8, y + 0.3, y + 2.9, 0.04, 'stucco', 0.3);
      // the minbar: three steps up to a seat, with side boards
      const mx = 2.0, zb = -hd + T + 0.1;
      for (let k = 0; k < 3; k++) { bag.add('cedar', box(mx - 0.4, y, zb + (2 - k) * 0.34, mx + 0.4, y + 0.22 * (k + 1), zb + (3 - k) * 0.34)); }
      bag.add('cedar', box(mx - 0.4, y, zb, mx + 0.4, y + 0.66, zb + 0.34)); bag.add('wood_dark', box(mx - 0.46, y, zb, mx - 0.4, y + 1.1, zb + 1.02)); bag.add('wood_dark', box(mx + 0.4, y, zb, mx + 0.46, y + 1.1, zb + 1.02)); bag.add('wood_dark', box(mx - 0.4, y + 0.66, zb, mx + 0.4, y + 1.7, zb + 0.06));
      col.rect([mx - 0.46, zb, mx + 0.46, zb + 1.02], y, y + 1.7);
      // two hanging lamps and a rahla
      for (const lx of [-1.6, 1.6]) { const lz = -hd + T + 2.6; hangLamp(bag, lx, lz, y + CH, 0.7); }
      rahla({ bag, col }, -2.9, -hd + T + 1.6, y + 0.045);
    }
    lights.push({ at: [0, y + 2.6, -hd + T + 2.4], color: '#ffc27a', intensity: 4, distance: 9 });
    // the roof's parapet round the hall, a low rim
    for (const [a, b] of [[[-hw, -hd], [hw, -hd]], [[hw, -hd], [hw, zh]], [[-hw, zh], [-hw, -hd]]]) bag.add('mud_plaster', orientedBox(a, b, T * 0.7, y + CH + 1.2, y + CH + 1.6));
  });
}

export function masjidRoom(el) {
  const [x0, z0, x1, z1] = el.rect, face = el.face || 'n', turned = face === 's' || face === 'n', d = turned ? z1 - z0 : x1 - x0, hallD = Math.min(11.5, d * 0.55), T = 0.6;
  void archCurve;
  return { hallD, T };
}

export const mosqueElements = { quarter_masjid: masjid };
