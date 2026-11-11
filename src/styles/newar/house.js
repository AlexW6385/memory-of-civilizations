// The Newar brick house (docs/settlements/bhaktapur.md §4): three or four storeys of red brick in a continuous
// front, the ground storey a door or a shop, a timber band at every floor, the upper storeys with their
// carved windows (the middle of three larger), the top storey's small lattice windows, a hipped roof of red tile on deep eaves carried
// on carved struts. Built in the house's own frame (lx along the facade, lz into the house from it) and put on its lot.
// `open`: the ground storey open as a shop-front room, furnished (a rest of the dossier's §4.1).

import { box, lathe, rod } from '../../core/geom.js';
import { pot } from './pottery.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const bx = (x0, y0, z0, x1, y1, z1) => box(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1));
const HS = [2.9, 2.4, 2.25, 2.1];

/** The storeys' heights of a house of n storeys. */
export const houseHeight = (n) => HS.slice(0, n).reduce((a, b) => a + b, 0);

export function houseParts(el, ctx, { hipRoof }) {
  const { bag, col, lights } = ctx;
  const [x0, z0, x1, z1] = el.rect, f = el.front, rand = rng(el.seed || 1), det = el.detail ?? 2, n = el.n ?? 3;
  const ns = f === 'n' || f === 's', W = ns ? x1 - x0 : z1 - z0, D = ns ? z1 - z0 : x1 - x0;
  const toW = (lx, lz) => (f === 's' ? [x0 + lx, z1 - lz] : f === 'n' ? [x1 - lx, z0 + lz] : f === 'e' ? [x1 - lz, z1 - lx] : [x0 + lz, z0 + lx]);
  const B = (a, y0, b, c, y1, d, mat) => { const p = toW(a, b), q = toW(c, d); bag.add(mat, bx(p[0], y0, p[1], q[0], y1, q[1])); };
  const RC = (a, y0, b, c, y1, d) => { const p = toW(a, b), q = toW(c, d); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y0, y1); };
  const RODL = (p, q, r, mat, seg = 5) => { const a = toW(p[0], p[2]), b = toW(q[0], q[2]); bag.add(mat, rod([a[0], p[1], a[1]], [b[0], q[1], b[1]], r, seg)); };
  const Y = [0]; for (let i = 0; i < n; i++) Y.push(Y[i] + HS[i]);
  const H = Y[n], open = !!el.open;
  const OW = Math.min(4.6, W - 2.4), ox = (W - OW) / 2, T = 0.55;

  // the walls
  if (!open) { B(0, 0, 0, W, H, D, 'brick'); RC(0, 0, 0, W, H, D); }
  else {
    const h0 = Y[1];
    B(0, 0, D - T, W, H, D, 'brick'); RC(0, 0, D - T, W, h0, D);
    B(0, 0, 0, T, H, D, 'brick'); RC(0, 0, 0, T, h0, D);
    B(W - T, 0, 0, W, H, D, 'brick'); RC(W - T, 0, 0, W, h0, D);
    B(0, 0, 0, ox, H, T, 'brick'); RC(0, 0, 0, ox, h0, T);
    B(ox + OW, 0, 0, W, H, T, 'brick'); RC(ox + OW, 0, 0, W, h0, T);
    B(ox, 2.5, 0, ox + OW, H, T, 'brick');                                                // over the opening
    B(ox - 0.02, 2.2, -0.14, ox + OW + 0.02, 2.5, T + 0.02, 'timber');                      // its lintel beam
    for (const x of [ox - 0.12, ox + OW - 0.1]) { B(x, 0, -0.14, x + 0.22, 2.5, 0.2, 'timber'); RC(x, 0, -0.14, x + 0.22, 2.5, 0.2); }
    // the floor, the ceiling of joists and planks (the upper storeys solid above it)
    const f0 = toW(T, T), f1 = toW(W - T, D - T);
    B(T, 0, T, W - T, 0.1, D - T, 'plaster_ochre'); col.floor([Math.min(f0[0], f1[0]), Math.min(f0[1], f1[1]), Math.max(f0[0], f1[0]), Math.max(f0[1], f1[1])], 0.1);
    B(ox, 0, -0.5, ox + OW, 0.1, T, 'sandstone'); { const a = toW(ox, -0.5), b = toW(ox + OW, T); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0.1); }
    for (let x = T + 0.25; x < W - T; x += 0.55) RODL([x, 2.5, T], [x, 2.5, D - T], 0.09, 'timber', 5);
    B(T, 2.58, T, W - T, 2.9, D - T, 'wood_ochre');
    for (const x of [W * 0.3, W * 0.7]) { B(x - 0.13, 0.1, D * 0.5 - 0.13, x + 0.13, 2.58, D * 0.5 + 0.13, 'timber'); B(x - 0.3, 2.3, D * 0.5 - 0.3, x + 0.3, 2.58, D * 0.5 + 0.3, 'wood_painted'); const c = toW(x, D * 0.5); col.circle(c[0], c[1], 0.17, 0, 2.6); }
    furnish();
  }

  // the facade: a timber band at every floor, the plinth wash, the ground storey, the windows above
  for (let i = 1; i <= n; i++) B(-0.04, Y[i] - 0.1, -0.09, W + 0.04, Y[i] + 0.08, 0.0, 'timber');
  if (!open) {
    const wash = rand() < 0.5;
    if (wash) B(0, 0, -0.04, W, 0.95, 0, 'plaster_ochre');
    const shop = el.shop ?? rand() < 0.3;
    if (shop) {
      const sw = 2.0 + rand() * 0.6, sxl = 0.7 + rand() * Math.max(0.1, W - sw - 1.6);
      B(sxl, 0.55, -0.06, sxl + sw, 2.2, 0.0, 'opening');
      B(sxl - 0.14, 0.45, -0.12, sxl, 2.35, 0.05, 'timber'); B(sxl + sw, 0.45, -0.12, sxl + sw + 0.14, 2.35, 0.05, 'timber'); B(sxl - 0.14, 2.2, -0.14, sxl + sw + 0.14, 2.38, 0.05, 'timber');
      B(sxl - 0.1, 0.58, -0.3, sxl + sw + 0.1, 0.68, 0.0, 'wood_ochre');                    // the counter
      B(sxl + sw * 0.55, 0.68, -0.5, sxl + sw * 0.55 + sw * 0.4, 2.15, -0.06, 'wood_painted'); // the shutter stood open, boards on end
      const g = rand();
      for (let k = 0; k < 4; k++) {
        const p = toW(sxl + 0.25 + k * 0.38, -0.15);
        if (g < 0.5) pot(bag, p[0], 0.68, p[1], k % 2 ? 'cup' : 'round', 0.75, k === 2);
        else bag.add(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo'][k], lathe([[0.001, 0.68], [0.1, 0.7], [0.11, 0.8], [0.05, 0.86], [0.001, 0.86]], 6, null, p[0], 0, p[1]));
      }
    } else {
      const dx = rand() < 0.5 ? W / 2 - 0.6 : 0.7 + rand() * Math.max(0.1, W - 2.4);
      B(dx, 0, -0.06, dx + 1.2, 2.0, 0.0, 'opening');
      B(dx - 0.12, 0, -0.12, dx, 2.15, 0.05, 'timber'); B(dx + 1.2, 0, -0.12, dx + 1.32, 2.15, 0.05, 'timber'); B(dx - 0.14, 2.0, -0.14, dx + 1.34, 2.2, 0.05, 'timber');
      B(dx - 0.1, 2.2, -0.12, dx + 1.3, 2.5, -0.02, 'wood_painted');                        // the carved lintel board over the door
      B(dx - 0.25, 0, -0.5, dx + 1.45, 0.24, 0, 'sandstone');                               // the step
      if (det > 0 && rand() < 0.5) { const p = toW(dx + 1.7, -0.25); pot(bag, p[0], 0, p[1], 'jar', 1); }
    }
  }
  // the carved windows of the upper storeys
  for (let i = 1; i < n; i++) {
    const y0 = Y[i], attic = i === n - 1 && n > 2, cx = W / 2 + (rand() - 0.5) * (W > 8 ? 0.8 : 0);
    if (attic) {
      const k = Math.max(2, Math.floor((W - 1) / 1.7)), step = (W - 1) / k;
      for (let j = 0; j < k; j++) lattice(0.5 + step * (j + 0.5) - 0.3, y0 + 0.6, 0.6, 0.75, det);
      continue;
    }
    if (W >= 6.5) {
      const wS = 0.85, wC = 1.05, g = 0.16, tw = wS * 2 + wC + g * 2, lx0 = cx - tw / 2, sill = y0 + 0.5;
      lattice(lx0, sill, wS, 1.2, det); lattice(lx0 + wS + g, sill - 0.05, wC, 1.45, det); lattice(lx0 + wS + g + wC + g, sill, wS, 1.2, det);
      B(lx0 - 0.12, sill - 0.12, -0.2, lx0 + tw + 0.12, sill - 0.02, 0.0, 'timber');            // the carved sill
      if (det > 1) B(lx0 - 0.12, sill + 1.5, -0.16, lx0 + tw + 0.12, sill + 1.64, 0.0, 'timber');  // the cornice
      if (det > 1 && rand() < 0.4) for (let k = 0; k < 3; k++) B(lx0 + 0.3 + k * 0.9, sill - 0.7, -0.14, lx0 + 0.42 + k * 0.9, sill - 0.14, -0.04, rand() < 0.5 ? 'cloth_red' : 'cloth_ochre');   // chillies and maize hung to dry
    } else {
      lattice(cx - 0.9, y0 + 0.55, 0.8, 1.15, det); lattice(cx + 0.1, y0 + 0.55, 0.8, 1.15, det);
    }
  }
  // the roof: low, hipped, its ridge along the front; the eaves deeper on the street side and held by struts
  const fo = 1.15, bo = 0.6, so = 0.08, r = [x0, z0, x1, z1];
  const ovl = [so, so, so, so]; ovl[{ s: 3, n: 1, e: 2, w: 0 }[f]] = fo; ovl[{ s: 1, n: 3, e: 0, w: 2 }[f]] = bo;
  hipRoof(bag, r, H, Math.min(2.6, 0.22 * Math.max(D, 6) + 0.5), ovl, 'roof_tile', ns);
  if (det > 0) for (let x = 0.7; x < W - 0.5; x += 1.5) {
    RODL([x, H - 1.25, 0], [x, H - 0.1, -fo + 0.12], 0.06, 'wood_painted');
    if (det > 1) B(x - 0.04, H - 0.85, -0.5, x + 0.04, H - 0.35, -0.42, 'gilt_bronze');
  }

  /** A lattice window at (lx, y) of width w and height h: the dark recess, a carved frame, the screen of bars. */
  function lattice(lx, y, w, h, d) {
    B(lx, y, -0.05, lx + w, y + h, 0.0, 'opening');
    const t = 0.09;
    B(lx - t, y - t, -0.11, lx + w + t, y, 0.02, 'wood_dark'); B(lx - t, y + h, -0.11, lx + w + t, y + h + t, 0.02, 'wood_dark');
    B(lx - t, y, -0.11, lx, y + h, 0.02, 'wood_dark'); B(lx + w, y, -0.11, lx + w + t, y + h, 0.02, 'wood_dark');
    if (d === 0) return;
    const m = d > 1 ? Math.max(3, Math.round(w / 0.16)) : 3;
    for (let k = 1; k < m; k++) { const x = lx + w * k / m; B(x - 0.015, y, -0.08, x + 0.015, y + h, -0.04, 'wood_dark'); }
    if (d > 1) for (let k = 1; k < 4; k++) B(lx, y + h * k / 4 - 0.015, -0.085, lx + w, y + h * k / 4 + 0.015, -0.045, 'wood_dark');
  }

  /** The ground storey's furnishing: what a house of the town kept below — jars, grain, a bench, the stair to the rooms above, a small shrine, a lamp. */
  function furnish() {
    const bk = D - T;
    // the storage jars along the back wall, a few of the dark clay
    for (let k = 0; k < 5; k++) { const p = toW(T + 0.6 + k * 0.85, bk - 0.45); pot(bag, p[0], 0.1, p[1], 'jar', 1.5 + (k % 2) * 0.2, k === 3); col.circle(p[0], p[1], 0.38, 0.1, 1.0); }
    // the grain bin of boards with its heap
    B(W - T - 1.7, 0.1, bk - 1.5, W - T - 0.1, 0.95, bk - 0.1, 'wood_ochre'); RC(W - T - 1.7, 0.1, bk - 1.5, W - T - 0.1, 0.95, bk - 0.1);
    { const p = toW(W - T - 0.9, bk - 0.8); bag.add('cloth_ochre', lathe([[0.001, 0.95], [0.6, 0.95], [0.5, 1.05], [0.001, 1.2]], 8, null, p[0], 0, p[1])); }
    // the low bench along the side wall with a red cushion, a mat on the floor, a stack of sacks
    B(T + 0.02, 0.1, 1.0, T + 0.62, 0.5, 3.4, 'wood_ochre'); RC(T + 0.02, 0.1, 1.0, T + 0.62, 0.5, 3.4);
    B(T + 0.05, 0.5, 1.2, T + 0.58, 0.58, 2.2, 'cloth_red');
    B(W * 0.38, 0.1, D * 0.62, W * 0.38 + 1.7, 0.12, D * 0.62 + 1.1, 'reed_mat');
    for (let k = 0; k < 3; k++) B(T + 0.1, 0.1 + k * 0.28, bk - 0.9, T + 0.8, 0.38 + k * 0.28, bk - 0.1, k % 2 ? 'sacking' : 'cloth_white');
    RC(T + 0.1, 0.1, bk - 0.9, T + 0.8, 1.0, bk - 0.1);
    // the steep wooden stair to the rooms above, at the back corner by the grain: 9 boards, a hole closed by a trap
    for (let k = 0; k < 9; k++) B(W - T - 3.4 - 0.0, 0.1 + k * 0.28, 1.0 + k * 0.1, W - T - 2.5, 0.38 + k * 0.28, 1.45 + k * 0.1, 'wood_ochre');
    RC(W - T - 3.4, 0.1, 1.0, W - T - 2.5, 2.5, 2.4);
    // the shrine in the back wall: a framed niche, a gilt image, an oil lamp lit
    B(W * 0.5 - 0.45, 1.0, bk - 0.2, W * 0.5 + 0.45, 1.9, bk, 'wood_painted'); B(W * 0.5 - 0.35, 1.08, bk - 0.12, W * 0.5 + 0.35, 1.82, bk - 0.1, 'opening');
    { const p = toW(W * 0.5, bk - 0.3); bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0], [0.08, 0.2], [0.05, 0.3], [0.001, 0.36]], 6, null, p[0], 1.1, p[1])); bag.add('flame', lathe([[0.03, 0], [0.001, 0.09]], 5, null, p[0], 1.02, p[1])); }
    B(W * 0.5 - 0.5, 0.95, bk - 0.35, W * 0.5 + 0.5, 1.0, bk - 0.2, 'wood_dark');
    for (let k = 0; k < 4; k++) { const p = toW(T + 0.6 + k * 0.4, 2.2); bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.14, 0.12], [0.11, 0.18], [0.001, 0.18]], 7, null, p[0], 0.5, p[1])); }
    B(T + 0.05, 0.5, 3.6, T + 0.4, 0.55, 5.2, 'wood_ochre');
    if (lights) { const p = toW(W / 2, D / 2); lights.push({ at: [p[0], 2.2, p[1]], color: '#ffd9a0', intensity: 2.2, distance: 10 }); }
  }
}
