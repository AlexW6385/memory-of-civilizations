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
  const up = open && !!el.light && n >= 2 && (el.trade || 'home') !== 'curd';       // the stair leads up to a furnished first floor (the lit shop-houses)
  // the brick of this house: mostly the red, some darker-baked, an old one greyed [inferred]; the plan's own door place and kinds (layout.js lots())
  const wm = el.wall ?? ['brick', 'brick', 'brick', 'brick_baked', 'brick', 'brick_grey'][Math.floor(rand() * 6)];
  const damp = el.damp ?? rand();
  const OW = Math.min(4.6, W - 2.4), ox = (W - OW) / 2, T = 0.55;

  // the walls
  if (!open) { B(0, 0, 0, W, H, D, wm); RC(0, 0, 0, W, H, D); }
  else {
    const h0 = Y[1];
    B(0, 0, D - T, W, H, D, wm); RC(0, 0, D - T, W, h0, D);
    B(0, 0, 0, T, H, D, wm); RC(0, 0, 0, T, h0, D);
    B(W - T, 0, 0, W, H, D, wm); RC(W - T, 0, 0, W, h0, D);
    B(0, 0, 0, ox, H, T, wm); RC(0, 0, 0, ox, h0, T);
    B(ox + OW, 0, 0, W, H, T, wm); RC(ox + OW, 0, 0, W, h0, T);
    B(ox, 2.5, 0, ox + OW, H, T, wm);                                                // over the opening
    B(ox - 0.02, 2.2, -0.14, ox + OW + 0.02, 2.5, T + 0.02, 'timber');                      // its lintel beam
    for (const x of [ox - 0.12, ox + OW - 0.1]) { B(x, 0.03, -0.14, x + 0.22, 2.5, 0.2, 'timber'); RC(x, 0, -0.14, x + 0.22, 2.5, 0.2); }
    // the floor, the ceiling of joists and planks (the upper storeys solid above it)
    const f0 = toW(T, T), f1 = toW(W - T, D - T);
    B(T, 0, T, W - T, 0.1, D - T, 'plaster_ochre'); col.floor([Math.min(f0[0], f1[0]), Math.min(f0[1], f1[1]), Math.max(f0[0], f1[0]), Math.max(f0[1], f1[1])], 0.1);
    B(ox, 0, -0.5, ox + OW, 0.1, T, 'sandstone'); { const a = toW(ox, -0.5), b = toW(ox + OW, T); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0.1); }
    for (let x = T + 0.25; x < W - T; x += 0.55) RODL([x, 2.5, T + 0.02], [x, 2.5, D - T - 0.02], 0.09, 'timber', 5);
    if (!up) B(T, 2.58, T, W - T, 2.9, D - T, 'wood_ochre');
    else upper();
    for (const x of [W * 0.3, W * 0.7]) { B(x - 0.13, 0.1, D * 0.5 - 0.13, x + 0.13, 2.58, D * 0.5 + 0.13, 'timber'); B(x - 0.3, 2.3, D * 0.5 - 0.3, x + 0.3, 2.58, D * 0.5 + 0.3, 'wood_painted'); const c = toW(x, D * 0.5); col.circle(c[0], c[1], 0.17, 0, 2.6); }
    furnish(el.trade || 'home');
  }

  // the facade: a timber band at every floor, the plinth wash, the ground storey, the windows above
  for (let i = 1; i <= n; i++) B(-0.04, Y[i] - 0.1, -0.09, W + 0.04, Y[i] + 0.08, 0.03, 'timber');
  if (!open) {
    const wash = rand() < 0.5;
    if (wash) B(0, 0, -0.04, W, 0.95, 0, rand() < 0.5 ? 'plaster_ochre' : 'mud_plaster');
    const shop = el.shop ?? rand() < 0.3;
    if (shop) {
      const sw = 2.0 + rand() * 0.6, sxl = 0.7 + rand() * Math.max(0.1, W - sw - 1.6);
      B(sxl, 0.55, -0.06, sxl + sw, 2.2, 0.0, 'opening');
      B(sxl - 0.14, 0.45, -0.12, sxl, 2.35, 0.05, 'timber'); B(sxl + sw, 0.45, -0.12, sxl + sw + 0.14, 2.35, 0.05, 'timber'); B(sxl - 0.14, 2.2, -0.14, sxl + sw + 0.14, 2.38, 0.05, 'timber');
      B(sxl - 0.1, 0.58, -0.3, sxl + sw + 0.1, 0.68, 0.0, 'wood_ochre');                    // the counter
      B(sxl + sw * 0.55, 0.68, -0.5, sxl + sw * 0.55 + sw * 0.4, 2.15, -0.06, 'wood_painted'); // the shutter stood open, boards on end
      // the cloth awning over the stall, on two poles, and strings of chillies and garlic under it
      if (det > 0) {
        const am = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white'][Math.floor(rand() * 4)], ay0 = 2.35, ay1 = 2.0, ad = 1.25;
        B(sxl - 0.2, ay0 - 0.03, -ad, sxl + sw + 0.2, ay0 + 0.01, -0.02, am);
        for (const x of [sxl - 0.12, sxl + sw + 0.12]) { RODL([x, 0, -ad + 0.08], [x, ay0, -ad + 0.08], 0.03, 'timber', 4); RC(x - 0.03, 0, -ad + 0.05, x + 0.03, ay0, -ad + 0.11); }
        for (let k = 0; k < 4; k++) B(sxl + 0.2 + k * (sw - 0.4) / 3 - 0.02, ay0 - 0.75, -0.9, sxl + 0.2 + k * (sw - 0.4) / 3 + 0.02, ay0 - 0.03, -0.86, 'rope_fibre');
        for (let k = 0; k < 4; k++) B(sxl + 0.14 + k * (sw - 0.4) / 3, ay0 - 0.78, -0.94, sxl + 0.26 + k * (sw - 0.4) / 3, ay0 - 0.4, -0.82, k % 2 ? 'cloth_red' : 'cloth_ochre');
      }
      const g = rand();
      for (let k = 0; k < 4; k++) {
        const p = toW(sxl + 0.25 + k * 0.38, -0.15);
        if (g < 0.5) pot(bag, p[0], 0.68, p[1], k % 2 ? 'cup' : 'round', 0.75, k === 2);
        else bag.add(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo'][k], lathe([[0.001, 0.68], [0.1, 0.7], [0.11, 0.8], [0.05, 0.86], [0.001, 0.86]], 6, null, p[0], 0, p[1]));
      }
    } else {
      const dx0 = rand() < 0.5 ? W / 2 - 0.6 : 0.7 + rand() * Math.max(0.1, W - 2.4), dx = el.dx ?? dx0;
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
      // the projecting bay (sajhyah) of the better houses: the middle window stands out 0.6 m on brackets under its own small tiled roof [stated: Newar bay windows]
      if (i === 1 && n > 2 && ((el.seed || 1) * 2654435761 >>> 0) % 100 < 38) {
        lattice(lx0, sill, wS, 1.2, det); lattice(lx0 + wS + g + wC + g, sill, wS, 1.2, det);
        bay(lx0 + wS + g + wC / 2, sill, 1.7, 1.5);
      } else { lattice(lx0, sill, wS, 1.2, det); lattice(lx0 + wS + g, sill - 0.05, wC, 1.45, det); lattice(lx0 + wS + g + wC + g, sill, wS, 1.2, det); }
      B(lx0 - 0.12, sill - 0.12, -0.2, lx0 + tw + 0.12, sill - 0.02, 0.0, 'timber');            // the carved sill
      if (det > 1) B(lx0 - 0.12, sill + 1.5, -0.16, lx0 + tw + 0.12, sill + 1.64, 0.0, 'timber');  // the cornice
      if (det > 1 && rand() < 0.4) for (let k = 0; k < 3; k++) B(lx0 + 0.3 + k * 0.9, sill - 0.7, -0.14, lx0 + 0.42 + k * 0.9, sill - 0.14, -0.04, rand() < 0.5 ? 'cloth_red' : 'cloth_ochre');   // chillies and maize hung to dry
    } else {
      lattice(cx - 0.9, y0 + 0.55, 0.8, 1.15, det); lattice(cx + 0.1, y0 + 0.55, 0.8, 1.15, det);
    }
  }
  // a balcony along the third storey of the taller houses: a plank slab on struts, a railing of turned balusters, a cloth thrown over it [inferred]
  if (n > 3 && W >= 6.5 && ((el.seed || 1) * 69069 >>> 0) % 100 < 30) {
    const by = Y[2], x0b = 0.5, x1b = W - 0.5;
    B(x0b, by + 0.02, -0.65, x1b, by + 0.14, 0.0, 'wood_dark');
    for (let x = x0b + 0.3; x < x1b - 0.2; x += 1.4) RODL([x, by - 0.7, -0.02], [x, by + 0.02, -0.6], 0.045, 'wood_painted');
    B(x0b, by + 0.14, -0.67, x1b, by + 0.2, -0.6, 'wood_dark'); B(x0b, by + 1.0, -0.67, x1b, by + 1.07, -0.6, 'wood_dark');
    for (let x = x0b; x <= x1b; x += 0.32) B(x, by + 0.2, -0.655, x + 0.04, by + 1.0, -0.615, 'wood_dark');
    B(x0b, by + 0.14, -0.67, x0b + 0.05, by + 1.07, 0.0, 'wood_dark'); B(x1b - 0.05, by + 0.14, -0.67, x1b, by + 1.07, 0.0, 'wood_dark');
    if (((el.seed || 1) * 7) % 3 === 0) B(x0b + 1.0, by + 0.45, -0.7, x0b + 2.1, by + 1.05, -0.64, ['cloth_red', 'cloth_indigo', 'cloth_ochre'][(el.seed || 0) % 3]);
  }
  // ── weathering (the monsoon's damp, the plaster's loss) and the eye-level dressing of the front ──
  if (det > 0) {
    // the damp at the foot (green-grey, broken), a patch of lime wash or mud plaster come away from the brick, rain streaks under the sills
    if (damp < 0.7) for (let x = 0, k = 0; x < W - 0.3; k++) { const w = 0.6 + ((k * 7 + (el.seed || 0)) % 5) * 0.35; B(x, 0, -0.025, Math.min(W, x + w), 0.28 + ((k * 3) % 4) * 0.1, 0.0, 'plaster_damp'); x += w + 0.4 + ((k * 5) % 3) * 0.5; }
    if (rand() < 0.45) { const px = 0.3 + rand() * Math.max(0.2, W - 2.2), py = Y[1] + 0.3 + rand() * (Y[Math.min(n, 2)] - Y[1] - 1.6); B(px, py, -0.02, px + 0.9 + rand() * 0.9, py + 0.7 + rand() * 0.7, 0.0, rand() < 0.5 ? 'mud_plaster' : 'limewash_white'); }
    if (rand() < 0.5 && n > 2) for (let k = 0; k < 3; k++) { const px = 0.5 + rand() * (W - 1.0); B(px, Y[1] + 0.2, -0.018, px + 0.07, Y[1] + 1.4 + rand() * 0.8, 0.0, 'plaster_streak'); }
    // the front's dressing at the street
    const dx = el.dx ?? W * 0.5, onL = dx < W * 0.5;
    const pid = el.pid && !open && !el.shop;
    if (pid) {
      // the pidha: a raised seat of brick with a plank top along the front on either side of the door
      for (const [a, b] of [[0.1, dx - 0.2], [dx + 1.5, W - 0.1]]) if (b - a > 0.9) { B(a, 0, -0.78, b, 0.4, -0.02, 'brick'); B(a - 0.04, 0.4, -0.82, b + 0.04, 0.46, -0.0, 'wood_ochre'); RC(a - 0.04, 0, -0.82, b + 0.04, 0.46, 0); if (det > 1) B(a + 0.1, 0.46, -0.45, a + 0.65, 0.5, -0.1, 'cloth_red'); }
    }
    if (!open && rand() < 0.55) {
      // firewood stacked end-out beside the door (or a stack of straw), and water pots on a stand
      const fx = onL ? dx + 1.55 : dx - 0.7;
      if (fx > 0.1 && fx + 0.7 < W && !pid) { if (rand() < 0.65) { for (let i = 0; i < 4; i++) for (let j = 0; j < 4 - (i > 1 ? 1 : 0); j++) RODL([fx + 0.09 + i * 0.16, 0.1 + j * 0.15, -0.04], [fx + 0.09 + i * 0.16, 0.1 + j * 0.15, -0.5], 0.062, 'timber', 5); RC(fx, 0, -0.52, fx + 0.7, 0.65, 0); } else { const p = toW(fx + 0.35, -0.3); bag.add('thatch', lathe([[0.4, 0], [0.38, 0.5], [0.3, 0.9], [0.001, 1.15]], 7, null, p[0], 0, p[1])); col.circle(p[0], p[1], 0.4, 0, 1.0); } }
    }
    if (!open && rand() < 0.5) { const p = toW(onL ? dx - 0.3 : dx + 1.6, -0.25); pot(bag, p[0], 0, p[1], 'jar', 1); pot(bag, p[0] + 0.0, 0.5, p[1] + 0.0, 'round', 0.8); }
    if (!open && rand() < 0.3) { for (let k = 0; k < 3; k++) { const p = toW(0.5 + k * 0.45, -0.3); bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.3, 0.32], [0.26, 0.32], [0.001, 0.05]], 7, null, p[0], k % 2 ? 0.0 : 0.0, p[1])); } }
    // the grain, the chillies and the marigolds laid to dry on a mat before the house [inferred: a sunny morning's task in the lanes]
    if (!open && !pid && rand() < 0.4) {
      const mx = Math.max(0.2, Math.min(W - 1.9, dx + (onL ? 1.6 : -2.2))), p0 = toW(mx, -1.0), p1 = toW(mx + 1.7, -0.1);
      bag.add('reed_mat', bx(p0[0], 0.05, p0[1], p1[0], 0.065, p1[1]));
      const c = toW(mx + 0.85, -0.55), heap = ['cloth_red', 'cloth_ochre', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)];
      bag.add(heap, lathe([[0.62, 0.0], [0.5, 0.05], [0.3, 0.1], [0.001, 0.14]], 7, null, c[0], 0.065, c[1]));
      if (rand() < 0.6) { const c2 = toW(mx + 0.3, -0.5); bag.add(heap === 'cloth_red' ? 'cloth_ochre' : 'cloth_red', lathe([[0.2, 0.0], [0.1, 0.05], [0.001, 0.08]], 6, null, c2[0], 0.065, c2[1])); }
    }
    // the carved lintel's gilt ornaments, the oil-lamp niche by the door, marigold garlands strung on the door
    if (!open && !el.shop) {
      B(dx + 0.45, 2.52, -0.13, dx + 0.75, 2.8, -0.04, 'gilt_bronze');
      if (det > 1) { B(dx + 1.38, 1.2, -0.08, dx + 1.62, 1.55, 0.0, 'wood_dark'); B(dx + 1.42, 1.25, -0.1, dx + 1.58, 1.45, -0.04, 'opening'); const p = toW(dx + 1.5, -0.08); bag.add('flame', lathe([[0.02, 0], [0.001, 0.06]], 5, null, p[0], 1.28, p[1])); }
      if (det > 0 && rand() < 0.6) for (let k = 0; k < 5; k++) B(dx + 0.1 + k * 0.2, 1.5 - 0.1 * Math.sin(k * 0.8), -0.1, dx + 0.2 + k * 0.2, 1.62 - 0.1 * Math.sin(k * 0.8), -0.04, 'cloth_ochre');
    }
    // a wall niche with a Ganesh at the end of the front, a lamp and a marigold before it
    if (!open && W > 7 && ((el.seed || 1) * 40503 >>> 0) % 100 < 28) {
      const nx = W - 0.85;
      B(nx - 0.08, 1.25, -0.12, nx + 0.58, 2.05, 0.0, 'wood_dark'); B(nx, 1.33, -0.14, nx + 0.5, 1.97, -0.04, 'opening');
      { const p = toW(nx + 0.25, -0.07); bag.add('gilt_bronze', lathe([[0.001, 0], [0.09, 0], [0.07, 0.14], [0.04, 0.22], [0.001, 0.26]], 6, null, p[0], 1.36, p[1])); }
      B(nx - 0.1, 1.2, -0.22, nx + 0.6, 1.26, 0.0, 'sandstone'); B(nx + 0.15, 1.26, -0.2, nx + 0.35, 1.31, -0.08, 'cloth_ochre');
    }
    // washing on a line along an upper storey, a flower pot on a sill
    if (n > 2 && rand() < 0.4) {
      const ly = Y[2] - 0.45, lx0 = 0.5 + rand() * 0.6, lx1 = W - 0.5 - rand() * 0.6;
      RODL([lx0, ly, -0.42], [lx1, ly, -0.42], 0.012, 'rope_fibre', 4);
      for (let x = lx0 + 0.2, k = 0; x < lx1 - 0.5; x += 0.55 + rand() * 0.3, k++) B(x, ly - 0.7 - (k % 3) * 0.12, -0.44, x + 0.38 + (k % 2) * 0.12, ly, -0.40, ['cloth_white', 'cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 5)]);
    }
    if (det > 1 && n > 2 && rand() < 0.5) for (let k = 0; k < 2; k++) { const px = W / 2 - 0.6 + k * 1.2, p = toW(px, -0.14); pot(bag, p[0], Y[1] + 0.48, p[1], 'round', 0.7); bag.add('cloth_ochre', lathe([[0.001, 0], [0.1, 0.06], [0.1, 0.14], [0.001, 0.2]], 6, null, p[0], Y[1] + 0.48 + 0.3, p[1])); }
  }
  // the roof: low, hipped, its ridge along the front; the eaves deeper on the street side and held by struts
  const fo = 1.15, bo = 0.6, so = 0.08, r = [x0, z0, x1, z1];
  const ovl = [so, so, so, so]; ovl[{ s: 3, n: 1, e: 2, w: 0 }[f]] = fo; ovl[{ s: 1, n: 3, e: 0, w: 2 }[f]] = bo;
  const rise = Math.min(2.6, 0.22 * Math.max(D, 6) + 0.5), tile = rand() < 0.2 ? 'tile_dark' : 'roof_tile';
  hipRoof(bag, r, H, rise, ovl, tile, ns);
  if (det > 0) {
    // a gilt finial on the ridge of a rich house, or the flag-pole of the completed roof
    if (n > 3 && det > 1) { const p = toW(W / 2, D / 2); bag.add('gilt_bronze', lathe([[0.16, 0], [0.1, 0.12], [0.14, 0.28], [0.05, 0.5], [0.001, 0.8]], 6, null, p[0], H + rise - 0.05, p[1])); }
    else if (rand() < 0.2) { const p = toW(W / 2 + 0.6, D / 2); bag.add('timber', rod([p[0], H + rise - 0.3, p[1]], [p[0], H + rise + 1.6, p[1]], 0.03, 4)); bag.add('cloth_red', bx(p[0], H + rise + 1.0, p[1] - 0.01, p[0] + 0.5, H + rise + 1.55, p[1] + 0.01)); }
  }
  if (det > 0) for (let x = 0.7; x < W - 0.5; x += 1.5) {
    RODL([x, H - 1.25, 0], [x, H - 0.1, -fo + 0.12], 0.06, 'wood_painted');
    if (det > 1) B(x - 0.04, H - 0.85, -0.5, x + 0.04, H - 0.35, -0.42, 'gilt_bronze');
  }

  /** The first floor of a lit shop-house: a plank floor round the stair's well, the walls closed to a man's height, a window seat under the lit lattice, mats, chests, a shrine, a lamp. */
  function upper() {
    const y = Y[1], yc = Y[2], sx0 = W - T - 3.4, sx1 = W - T - 2.5, sz1 = 4.5, fl = (a, b, c, d, y0, y1, m) => { B(a, y0, b, c, y1, d, m); };
    const floorRect = (a, b, c, d) => { const p = toW(a, b), q = toW(c, d); col.floor([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y); };
    for (const [a, b, c, d] of [[T, T, sx0, D - T], [sx1, T, W - T, D - T], [sx0, sz1, sx1, D - T]]) { fl(a, b, c, d, y - 0.32, y, 'wood_ochre'); floorRect(a, b, c, d); }
    // the walls close the room to the first floor's ceiling (colliders; the facade's lattice windows are lit from within by pale panels)
    RC(0, y, 0, W, yc, T); RC(0, y, D - T, W, yc, D); RC(0, y, 0, T, yc, D); RC(W - T, y, 0, W, yc, D);
    B(T, yc - 0.3, T, W - T, yc, D - T, 'wood_ochre');
    for (let x = T + 0.4; x < W - T; x += 0.6) RODL([x, yc - 0.3, T + 0.02], [x, yc - 0.3, D - T - 0.02], 0.08, 'timber', 5);
    const wc = W / 2, ws = W >= 6.5 ? [-1.1, 0, 1.1] : [-0.5, 0.5];
    for (const o of ws) { const a = wc + o - 0.45; B(a, y + 0.55, T - 0.01, a + 0.9, y + 1.75, T + 0.03, 'paint_white'); for (let k = 1; k < 5; k++) B(a + 0.9 * k / 5 - 0.012, y + 0.55, T + 0.0, a + 0.9 * k / 5 + 0.012, y + 1.75, T + 0.05, 'wood_dark'); for (const yy of [y + 1.15]) B(a, yy - 0.012, T + 0.0, a + 0.9, yy + 0.012, T + 0.05, 'wood_dark'); B(a - 0.06, y + 0.5, T - 0.0, a + 0.96, y + 0.55, T + 0.08, 'wood_dark'); }
    // the window seat along the facade, a cushion on it
    B(T + 0.2, y, T, W - T - 0.2, y + 0.42, T + 0.5, 'wood_ochre'); RC(T + 0.2, y, T, W - T - 0.2, y + 0.42, T + 0.5);
    for (let x = T + 0.5; x < W - T - 1.2; x += 1.5) B(x, y + 0.42, T + 0.04, x + 0.9, y + 0.5, T + 0.46, ['cloth_red', 'cloth_ochre', 'cloth_indigo'][Math.floor(x * 3) % 3]);
    // the mat with its cushions and a low table, the family's shrine in the left wall, chests and jars at the back, a lamp
    B(W * 0.25, y, D * 0.45, W * 0.25 + 2.2, y + 0.03, D * 0.45 + 1.5, 'reed_mat');
    for (const [dx, dz, m] of [[0.2, 0.2, 'cloth_red'], [1.2, 0.3, 'cloth_ochre'], [0.6, 1.1, 'cloth_indigo']]) B(W * 0.25 + dx, y + 0.03, D * 0.45 + dz, W * 0.25 + dx + 0.5, y + 0.14, D * 0.45 + dz + 0.4, m);
    B(W * 0.25 + 0.5, y + 0.03, D * 0.45 + 0.55, W * 0.25 + 1.4, y + 0.3, D * 0.45 + 0.95, 'wood_dark');
    { const z = Math.min(D * 0.55, D - T - 1.2); B(T - 0.01, y + 1.0, z - 0.45, T + 0.12, y + 1.9, z + 0.45, 'wood_painted'); B(T + 0.1, y + 1.08, z - 0.35, T + 0.13, y + 1.82, z + 0.35, 'opening'); const p = toW(T + 0.3, z); bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0], [0.08, 0.2], [0.05, 0.3], [0.001, 0.36]], 6, null, p[0], y + 1.1, p[1])); bag.add('flame', lathe([[0.03, 0], [0.001, 0.09]], 5, null, p[0], y + 1.02, p[1])); B(T, y + 0.95, z - 0.5, T + 0.4, y + 1.0, z + 0.5, 'wood_dark'); }
    for (let k = 0; k < 3; k++) { const x = T + 0.3 + k * 1.1; if (x + 1.0 > sx0) break; B(x, y, D - T - 0.9, x + 1.0, y + 0.55, D - T - 0.1, 'wood_dark'); B(x - 0.02, y + 0.55, D - T - 0.94, x + 1.02, y + 0.6, D - T - 0.06, 'wood_ochre'); RC(x, y, D - T - 0.9, x + 1.0, y + 0.6, D - T - 0.1); }
    for (let k = 0; k < 4; k++) { const p = toW(W - T - 0.5 - (k % 2) * 0.55, D - T - 0.5 - Math.floor(k / 2) * 0.6); pot(bag, p[0], y, p[1], 'jar', 1.4 - 0.15 * k); col.circle(p[0], p[1], 0.3, y, y + 0.8); }
    RODL([T + 0.3, yc - 0.55, D * 0.5], [sx0 - 0.2, yc - 0.55, D * 0.5], 0.02, 'timber', 4);
    for (let x = T + 0.6, k = 0; x < sx0 - 0.6; x += 0.55, k++) B(x, yc - 1.55 + (k % 2) * 0.1, D * 0.5 - 0.02, x + 0.38, yc - 0.55, D * 0.5 + 0.02, ['cloth_white', 'cloth_red', 'cloth_indigo'][k % 3]);
    if (lights && el.light) { const p = toW(W / 2, D / 2); lights.push({ at: [p[0], y + 1.9, p[1]], color: '#ffe3b0', intensity: 1.5, distance: 8 }); }
  }

  /** The bay window: a floor of planks on two struts, a lattice front and two lattice sides, a cornice and a little hipped roof. */
  function bay(cx, y, w, h) {
    const x0b = cx - w / 2, x1b = cx + w / 2, o = 0.62;
    B(x0b - 0.05, y - 0.2, -o - 0.05, x1b + 0.05, y - 0.08, 0.0, 'wood_dark');
    for (const x of [x0b + 0.2, x1b - 0.2]) RODL([x, y - 1.0, -0.02], [x, y - 0.2, -o + 0.06], 0.05, 'wood_painted');
    B(x0b, y - 0.08, -o - 0.02, x1b, y + h, -o + 0.04, 'opening');
    B(x0b - 0.08, y - 0.08, -o - 0.1, x1b + 0.08, y, -o + 0.04, 'wood_dark'); B(x0b - 0.08, y + h, -o - 0.1, x1b + 0.08, y + h + 0.1, -o + 0.04, 'wood_dark');
    for (const x of [x0b - 0.08, x1b]) B(x, y - 0.08, -o - 0.1, x + 0.08, y + h, -o + 0.04, 'wood_dark');
    const m = det > 0 ? Math.round(w / 0.17) : 4;
    for (let k = 1; k < m; k++) { const x = x0b + w * k / m; B(x - 0.015, y, -o - 0.06, x + 0.015, y + h, -o - 0.02, 'wood_dark'); }
    if (det > 1) for (let k = 1; k < 4; k++) B(x0b, y + h * k / 4 - 0.015, -o - 0.07, x1b, y + h * k / 4 + 0.015, -o - 0.03, 'wood_dark');
    for (const x of [x0b, x1b - 0.03]) { B(x, y, -o, x + 0.03, y + h, -0.0, 'wood_dark'); B(x, y + h * 0.2, -o + 0.05, x + 0.03, y + h * 0.8, -0.02, 'opening'); }
    const a = toW(x0b - 0.12, -o - 0.12), b = toW(x1b + 0.12, 0.0);
    hipRoof(bag, [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y + h + 0.1, 0.28, [0.04, 0.04, 0.04, 0.04], 'roof_tile', ns);
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

  /** The ground storey's furnishing by trade: 'home' (jars, grain, a bench, a shrine), 'curd' (the clay pots of juju dhau), 'cloth', 'brass', 'carver', 'grain', 'pots'. The stair and a side shrine in all. */
  function furnish(kind) {
    const bk = D - T;
    // the steep wooden stair to the rooms above, in the back corner: 9 boards, a hole closed by a trap
    if (up) {
      // 14 treads of 0.2 m rise and 0.25 m run up to the first floor; walkable
      for (let k = 0; k < 14; k++) B(W - T - 3.4, 0.1, 1.0 + k * 0.25, W - T - 2.5, 0.3 + k * 0.2, 1.25 + k * 0.25, 'wood_ochre');
      { const a = toW(W - T - 3.4, 1.0), b = toW(W - T - 2.5, 4.5); col.ramp([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], 0.1, 2.9, { s: 'n', n: 's', e: 'w', w: 'e' }[f]); }
      B(W - T - 2.56, 0.1, 1.0, W - T - 2.5, 1.2, 4.5, 'wood_dark');                       // the rail on the wall side
    } else {
      for (let k = 0; k < 9; k++) B(W - T - 3.4 - 0.0, 0.1 + k * 0.28, 1.0 + k * 0.1, W - T - 2.5, 0.38 + k * 0.28, 1.45 + k * 0.1, 'wood_ochre');
      RC(W - T - 3.4, 0.1, 1.0, W - T - 2.5, 2.5, 2.4);
    }
    // the side shrine: a framed niche in the left wall with a gilt image and a lit lamp
    { const z = Math.min(D * 0.55, bk - 1.2); B(T - 0.01, 1.0, z - 0.45, T + 0.12, 1.9, z + 0.45, 'wood_painted'); B(T + 0.1, 1.08, z - 0.35, T + 0.13, 1.82, z + 0.35, 'opening');
      const p = toW(T + 0.3, z); bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0], [0.08, 0.2], [0.05, 0.3], [0.001, 0.36]], 6, null, p[0], 1.1, p[1])); bag.add('flame', lathe([[0.03, 0], [0.001, 0.09]], 5, null, p[0], 1.02, p[1])); B(T, 0.95, z - 0.5, T + 0.4, 1.0, z + 0.5, 'wood_dark'); }
    const shelf = (y, a, b, d = 0.45) => { B(a, y, bk - d, b, y + 0.05, bk - 0.02, 'wood_ochre'); };
    const rowPots = (y, a, b, kindp, dz, dark) => { for (let x = a; x < b; x += kindp === 'cup' ? 0.26 : 0.4) { const p = toW(x, bk - dz); pot(bag, p[0], y + 0.05, p[1], kindp, kindp === 'cup' ? 1 : 1.0, dark && ((x * 7) % 3 < 1)); } };
    if (kind === 'curd') {
      // the counter across the shop with its cups, tiers of curd pots on the back wall, the great jars of milk and curd on the floor
      B(T + 1.0, 0.1, 1.5, W - T - 1.0, 0.95, 2.1, 'wood_ochre'); B(T + 0.9, 0.95, 1.4, W - T - 0.9, 1.0, 2.2, 'wood_dark'); RC(T + 1.0, 0.1, 1.5, W - T - 1.0, 1.0, 2.1);
      for (let x = T + 1.2; x < W - T - 1.2; x += 0.3) { const p = toW(x, 1.8); pot(bag, p[0], 1.0, p[1], 'cup', 1); if ((x * 10) % 3 < 1.5) pot(bag, p[0], 1.13, p[1], 'cup', 1); }
      for (const y of [0.6, 1.2, 1.8]) { shelf(y, T + 0.2, W - T - 2.7); rowPots(y, T + 0.5, W - T - 2.8, 'cup', 0.25, false); rowPots(y, T + 0.5, W - T - 2.8, 'cup', 0.5, false); }
      for (let k = 0; k < 4; k++) { const p = toW(T + 0.7 + k * 0.8, bk - 0.55); pot(bag, p[0], 0.1, p[1], 'jar', 1.6, k % 2 === 0); col.circle(p[0], p[1], 0.4, 0.1, 1.0); }
    } else if (kind === 'cloth') {
      // bolts of cloth in cubbies on the back wall, lengths hung from a pole, a counter with a folded stack, the weaver's frame loom at the side
      B(T + 0.1, 0.1, bk - 0.5, W - T - 2.7, 2.2, bk - 0.04, 'wood_ochre'); RC(T + 0.1, 0.1, bk - 0.5, W - T - 2.7, 2.2, bk);
      const cols = ['cloth_red', 'cloth_black', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_green'];
      for (let r = 0; r < 4; r++) for (let x = T + 0.2, k = 0; x < W - T - 2.9; x += 0.42, k++) B(x, 0.25 + r * 0.5, bk - 0.46, x + 0.38, 0.65 + r * 0.5, bk - 0.1, cols[(r * 3 + k) % cols.length]);
      RODL([T + 0.5, 2.3, 2.6], [W - T - 2.9, 2.3, 2.6], 0.03, 'timber', 5);
      for (let x = T + 0.8, k = 0; x < W - T - 3.2; x += 0.5, k++) B(x, 1.3 - (k % 2) * 0.15, 2.57, x + 0.34, 2.3, 2.63, cols[(k * 2) % cols.length]);
      B(T + 1.0, 0.1, 1.5, W - T - 3.4, 0.9, 2.0, 'wood_ochre'); RC(T + 1.0, 0.1, 1.5, W - T - 3.4, 0.9, 2.0);
      for (let k = 0; k < 4; k++) B(T + 1.2 + k * 0.5, 0.9, 1.6, T + 1.6 + k * 0.5, 0.97 + (k % 2) * 0.06, 1.9, cols[k]);
      B(W - T - 1.5, 0.1, 3.4, W - T - 1.4, 1.6, 4.9, 'timber'); B(W - T - 0.5, 0.1, 3.4, W - T - 0.4, 1.6, 4.9, 'timber'); B(W - T - 1.5, 1.6, 3.4, W - T - 0.4, 1.66, 4.9, 'timber');
      B(W - T - 1.45, 0.6, 3.5, W - T - 0.45, 1.5, 3.55, 'cloth_red'); B(W - T - 1.0, 0.45, 3.5, W - T - 0.9, 0.7, 4.0, 'wood_dark');
    } else if (kind === 'brass') {
      // tiers of beaten vessels, great cauldrons and water jugs on the floor, the anvil block and hammer by the door
      for (const y of [0.6, 1.2, 1.8]) { shelf(y, T + 0.2, W - T - 2.7); for (let x = T + 0.5, k = 0; x < W - T - 2.8; x += 0.38, k++) { const p = toW(x, bk - 0.25); bag.add(k % 3 === 0 ? 'gilt_bronze' : 'bronze', lathe(k % 2 ? [[0.001, 0], [0.1, 0], [0.16, 0.12], [0.1, 0.24], [0.06, 0.3], [0.09, 0.34], [0.001, 0.33]] : [[0.001, 0], [0.12, 0], [0.17, 0.05], [0.16, 0.1], [0.001, 0.1]], 8, null, p[0], y + 0.05, p[1])); } }
      for (let k = 0; k < 3; k++) { const p = toW(T + 0.9 + k * 1.1, bk - 0.7); bag.add('bronze', lathe([[0.001, 0], [0.3, 0.02], [0.45, 0.3], [0.36, 0.55], [0.4, 0.62], [0.001, 0.58]], 10, null, p[0], 0.1, p[1])); col.circle(p[0], p[1], 0.42, 0.1, 0.7); }
      B(T + 0.6, 0.1, 2.4, T + 1.0, 0.5, 2.8, 'iron'); RC(T + 0.6, 0.1, 2.4, T + 1.0, 0.5, 2.8); { const a = toW(T + 0.8, 2.6); bag.add('iron', rod([a[0], 0.5, a[1]], [a[0] + 0.1, 0.52, a[1] + 0.3], 0.025, 5)); }
      B(T + 1.3, 0.1, 1.5, W - T - 3.4, 0.9, 2.0, 'wood_ochre'); RC(T + 1.3, 0.1, 1.5, W - T - 3.4, 0.9, 2.0);
      for (let k = 0; k < 4; k++) { const p = toW(T + 1.6 + k * 0.45, 1.75); bag.add('bronze', lathe([[0.001, 0.9], [0.14, 0.9], [0.17, 1.02], [0.12, 1.06], [0.001, 1.05]], 8, null, p[0], 0, p[1])); }
    } else if (kind === 'carver') {
      // the carver's bench with chisels and a half-carved strut, finished struts and panels leaning on the wall, window frames stood up, shavings on the floor
      B(T + 0.6, 0.78, 1.8, W - T - 3.5, 0.86, 2.7, 'wood_ochre'); for (const x of [T + 0.7, W - T - 3.6]) for (const z of [1.9, 2.6]) B(x, 0.1, z - 0.05, x + 0.1, 0.78, z + 0.05, 'wood_dark'); RC(T + 0.6, 0.1, 1.8, W - T - 3.5, 0.9, 2.7);
      B(T + 1.0, 0.86, 2.0, T + 2.2, 0.98, 2.4, 'wood_painted'); for (let k = 0; k < 5; k++) { const a = toW(T + 2.6 + k * 0.1, 2.0 + k * 0.1); bag.add('iron', rod([a[0], 0.86, a[1]], [a[0] + 0.12, 0.88, a[1] + 0.02], 0.012, 4)); }
      for (let k = 0; k < 7; k++) { const x = T + 0.5 + k * 0.45; RODL([x, 0.1, bk - 0.25], [x + 0.25, 2.3, bk - 0.1], 0.08, k % 2 ? 'wood_painted' : 'wood_dark'); B(x + 0.05 + 0.1 * (k % 3), 1.1, bk - 0.3, x + 0.2, 1.5, bk - 0.2, 'gilt_bronze'); }
      for (let k = 0; k < 3; k++) { const x = W - T - 3.3 + k * 0.0; B(x - 0.6 + k * 0.0, 0.1, bk - 0.9 - k * 0.1, x - 0.5, 1.9, bk - 0.3 - k * 0.1, 'wood_painted'); }
      for (let k = 0; k < 9; k++) { const p = toW(T + 0.8 + (k * 0.37) % 3, 2.9 + (k * 0.61) % 1.4); B(p[0] - 0.12, 0.1, p[1] - 0.04, p[0] + 0.12, 0.13, p[1] + 0.04, 'thatch'); }
    } else if (kind === 'pots') {
      // the potter's shop: ranks of pots on the floor and on tiers, the largest jars at the back
      for (const y of [0.6, 1.2]) { shelf(y, T + 0.2, W - T - 2.7, 0.55); rowPots(y, T + 0.5, W - T - 2.8, y > 0.9 ? 'bowl' : 'round', 0.3, true); }
      for (let r = 0; r < 3; r++) for (let x = T + 0.6; x < W - T - 3.0; x += 0.55) { const p = toW(x + (r % 2) * 0.27, 2.2 + r * 0.55); pot(bag, p[0], 0.1, p[1], r === 0 ? 'jar' : r === 1 ? 'round' : 'cup', r === 0 ? 1.2 : 1.3, (x * 5) % 3 < 1); }
      for (let k = 0; k < 3; k++) { const p = toW(T + 0.7 + k * 0.9, bk - 0.55); pot(bag, p[0], 0.1, p[1], 'jar', 1.8, k === 1); col.circle(p[0], p[1], 0.5, 0.1, 1.0); }
    } else {
      // 'home' and 'grain': jars along the back, the grain bin with its heap, sacks, a bench and a mat
      for (let k = 0; k < 5; k++) { const p = toW(T + 0.6 + k * 0.85, bk - 0.45); pot(bag, p[0], 0.1, p[1], 'jar', 1.5 + (k % 2) * 0.2, k === 3); col.circle(p[0], p[1], 0.38, 0.1, 1.0); }
      B(W - T - 1.7, 0.1, bk - 1.5, W - T - 0.1, 0.95, bk - 0.1, 'wood_ochre'); RC(W - T - 1.7, 0.1, bk - 1.5, W - T - 0.1, 0.95, bk - 0.1);
      { const p = toW(W - T - 0.9, bk - 0.8); bag.add('cloth_ochre', lathe([[0.001, 0.95], [0.6, 0.95], [0.5, 1.05], [0.001, 1.2]], 8, null, p[0], 0, p[1])); }
      B(T + 0.02, 0.1, 1.0, T + 0.62, 0.5, 3.4, 'wood_ochre'); RC(T + 0.02, 0.1, 1.0, T + 0.62, 0.5, 3.4);
      B(T + 0.05, 0.5, 1.2, T + 0.58, 0.58, 2.2, 'cloth_red');
      B(W * 0.38, 0.1, D * 0.62, W * 0.38 + 1.7, 0.12, D * 0.62 + 1.1, 'reed_mat');
      for (let k = 0; k < 3; k++) B(T + 0.1, 0.1 + k * 0.28, bk - 0.9, T + 0.8, 0.38 + k * 0.28, bk - 0.1, k % 2 ? 'sacking' : 'cloth_white');
      RC(T + 0.1, 0.1, bk - 0.9, T + 0.8, 1.0, bk - 0.1);
      if (kind === 'grain') { for (let k = 0; k < 5; k++) { if (T + 1.4 + k * 0.6 > W - T - 3.8) continue; const p = toW(T + 1.4 + k * 0.6, 1.8 + (k % 2) * 0.3); bag.add(k % 2 ? 'sacking' : 'cloth_ochre', lathe([[0.001, 0.1], [0.24, 0.1], [0.28, 0.4], [0.18, 0.62], [0.001, 0.66]], 8, null, p[0], 0, p[1])); col.circle(p[0], p[1], 0.28, 0.1, 0.7); } { const a = toW(W * 0.5, 2.9); bag.add('bronze', rod([a[0], 0.1, a[1]], [a[0], 1.4, a[1]], 0.02, 5)); bag.add('bronze', rod([a[0] - 0.4, 1.35, a[1]], [a[0] + 0.4, 1.35, a[1]], 0.015, 4)); for (const s of [-0.4, 0.4]) bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.04]], 8, null, a[0] + s, 0.95, a[1])); } }
    }
    if (lights && el.light) { const p = toW(W / 2, D / 2); lights.push({ at: [p[0], 2.2, p[1]], color: '#ffd9a0', intensity: 2.2, distance: 10 }); }
  }
}
