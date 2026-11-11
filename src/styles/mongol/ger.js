// The ger (docs/settlements/mongol-karakorum.md §6): a lattice frame of interlaced sticks (khana), roof poles (uni) to the
// crown ring (toono), covered in white felt held by hair ropes, the door to the south, felt patchwork over the door.
// On the ground, on a cart (Rubruck's great houses on wagons), and one opened and furnished.
import { fromTriangles } from '../../core/geom.js';
import { box, rod, lathe, wedge, ringPieces, angDist, wheel, rng, TAU, obox } from './util.js';

const FELT = 'cloth_white', LAT = 'lattice', WOOD = 'timber', DOOR = 'lacquer_red';

/**
 * ger: { c: [x, z], r (radius, 2.6–4.5), y (floor), door (angle of the door in plan; default south = π/2), open (walkable, furnished),
 *   cart (a wagon under it), seed, rich (patchwork bands) }.
 */
export function ger(el, { bag, col, lights }) {
  const [cx, cz0] = el.c, r = el.r ?? 3.2, y = el.y ?? 0, rand = rng(el.seed || 7), open = !!el.open, cart = !!el.cart;
  const da = el.door ?? Math.PI / 2, cz = cz0;
  const wh = open ? 1.8 : (r > 3.6 ? 1.6 : 1.4), rise = r * 0.3 + 0.5, ringR = 0.62, dw = open ? 1.15 : 0.95, dh = open ? 1.72 : wh - 0.1;
  const Y = cart ? y + 1.32 : y;
  const N = Math.max(20, Math.round(r * 7));
  const inDoor = (am, a0, a1) => angDist(am, da) < (dw / 2) / r + 0.5 * (TAU / N) * 0.9;
  // the walls: the felt outside, the lattice seen from inside; a gap at the door (always for the open ger; closed for the others by a felt flap)
  ringPieces(cx, cz, r - 0.07, r, Y, Y + wh, N, inDoor, (g) => bag.add(FELT, g));
  ringPieces(cx, cz, r - 0.12, r - 0.065, Y, Y + wh, N, inDoor, (g) => bag.add(LAT, g));
  // the door posts and lintel, the felt flap of patchwork above it, the leaf standing open
  const dx = Math.cos(da), dz = Math.sin(da), tx = -dz, tz = dx;
  const P = (u, v) => [cx + dx * (r - 0.03 + v) + tx * u, cz + dz * (r - 0.03 + v) + tz * u];
  const post = (u) => { const p = P(u, 0); bag.add(WOOD, obox([p[0] - dx * 0.1, p[1] - dz * 0.1], [p[0] + dx * 0.12, p[1] + dz * 0.12], 0.1, Y, Y + dh)); };
  post(-dw / 2 - 0.05); post(dw / 2 + 0.05);
  { const a = P(-dw / 2 - 0.1, -0.1), b = P(dw / 2 + 0.1, -0.1), a2 = P(-dw / 2 - 0.1, 0.12), b2 = P(dw / 2 + 0.1, 0.12); bag.add(DOOR, obox([(a[0] + a2[0]) / 2, (a[1] + a2[1]) / 2], [(b[0] + b2[0]) / 2, (b[1] + b2[1]) / 2], 0.22, Y + dh, Y + dh + 0.14)); }
  { const a = P(-dw / 2 - 0.14, 0.2), b = P(dw / 2 + 0.14, 0.2); bag.add('cloth_ochre', obox(a, b, 0.07, Y + dh + 0.18, Y + wh - 0.05)); const a1 = P(-dw / 2 - 0.14, 0.245), b1 = P(dw / 2 + 0.14, 0.245); bag.add('cloth_red', obox(a1, b1, 0.012, Y + dh + 0.24, Y + dh + 0.3)); }
  if (open) {
    const hinge = P(dw / 2 + 0.08, 0.14), tip = P(dw / 2 + 0.08 + tx * 0.01 + dx * 0.0, 0.14 + 0.0);
    const lf = [hinge[0] + dx * dw * 0.92, hinge[1] + dz * dw * 0.92];
    bag.add(DOOR, obox(hinge, lf, 0.05, Y, Y + dh - 0.02)); void tip;
    bag.add('gilt_bronze', obox([hinge[0] + dx * 0.4, hinge[1] + dz * 0.4], [hinge[0] + dx * dw * 0.9, hinge[1] + dz * dw * 0.9], 0.056, Y + dh * 0.5 - 0.04, Y + dh * 0.5 + 0.04));
  }
  // the roof: felt outside over the roof poles, the crown ring open to the sky
  const top = Y + wh + rise;
  bag.add(FELT, lathe([[r + 0.14, Y + wh - 0.1], [r * 0.7, Y + wh + rise * 0.4], [r * 0.35, Y + wh + rise * 0.78], [ringR + 0.1, top - 0.02]], 28, null, cx, 0, cz));
  bag.add('linen', lathe([[ringR + 0.02, top - 0.1], [r * 0.35, Y + wh + rise * 0.78 - 0.08], [r * 0.7, Y + wh + rise * 0.4 - 0.08], [r - 0.06, Y + wh - 0.04]], 28, null, cx, 0, cz));
  // the crown ring and its crossed arches
  bag.add(WOOD, lathe([[ringR + 0.12, top - 0.14], [ringR + 0.12, top + 0.06], [ringR - 0.04, top + 0.06], [ringR - 0.04, top - 0.14], [ringR + 0.12, top - 0.14]], 20, null, cx, 0, cz));
  for (const a of [0.4, 0.4 + Math.PI / 2]) bag.add(WOOD, rod([cx + Math.cos(a) * ringR, top - 0.04, cz + Math.sin(a) * ringR], [cx - Math.cos(a) * ringR, top - 0.04, cz - Math.sin(a) * ringR], 0.035, 5));
  // the roof poles seen from inside; the hair ropes round the felt and the band over the roof
  const nu = Math.max(16, Math.round(r * 6));
  for (let k = 0; k < nu; k++) { const a = k / nu * TAU; bag.add(WOOD, rod([cx + Math.cos(a) * (r - 0.13), Y + wh - 0.02, cz + Math.sin(a) * (r - 0.13)], [cx + Math.cos(a) * ringR, top - 0.12, cz + Math.sin(a) * ringR], 0.022, 4)); }
  for (const f of [0.3, 0.88]) {
    const rr = r + 0.03, yy = Y + wh * f; bag.add('rope_fibre', lathe([[rr, 0], [rr + 0.03, 0.03], [rr, 0.06], [rr - 0.01, 0.03]], 28, (th) => (angDist(th, da) < (dw / 2 + 0.1) / r ? 0 : 1), cx, yy, cz));
  }
  // the felt's patchwork band at the foot and the embroidered trim on the roof (rich gers)
  if (el.rich) {
    bag.add('cloth_blue', lathe([[r + 0.012, 0.0], [r + 0.012, 0.22]], 28, (th) => (angDist(th, da) < (dw / 2 + 0.15) / r ? 0 : 1), cx, Y + 0.02, cz));
    bag.add('cloth_red', lathe([[r + 0.012, 0.0], [r + 0.012, 0.1]], 28, (th) => (angDist(th, da) < (dw / 2 + 0.15) / r ? 0 : 1), cx, Y + wh - 0.28, cz));
  }
  // a skirt of felt weighted with stones at the foot, the felt left a little long
  bag.add('hide_grey', lathe([[r + 0.015, 0], [r + 0.07, 0.04], [r + 0.075, 0.12], [r + 0.02, 0.15]], 28, (th) => (angDist(th, da) < (dw / 2 + 0.12) / r ? 0 : 1), cx, Y, cz));
  if (!open) {
    // the door shut with its felt, a skin of kumiss hung beside it; the ger as one solid
    const a = P(-dw / 2, 0.02), b = P(dw / 2, 0.02);
    bag.add('cloth_ochre', obox(a, b, 0.05, Y, Y + dh));
    bag.add('cloth_red', obox(P(-dw / 2 + 0.1, 0.05), P(dw / 2 - 0.1, 0.05), 0.012, Y + dh * 0.45, Y + dh * 0.55));
    col.circle(cx, cz, r + 0.12, Y, top);
  }
  if (cart) wagon(bag, col, cx, cz, y, r, da);
  if (!open) return;
  // --- the furnished ger ---
  // a floor of felts: the ground covered in layers, the bright ones in the middle
  const F = Y + 0.025;
  bag.add('cloth_ochre', lathe([[0.001, 0], [r - 0.14, 0], [r - 0.14, 0.012], [0.001, 0.012]], 28, null, cx, Y + 0.008, cz));
  bag.add('cloth_red', lathe([[0.001, 0], [r * 0.55, 0], [r * 0.55, 0.012], [0.001, 0.012]], 28, null, cx, F - 0.004, cz));
  bag.add('cloth_blue', lathe([[r * 0.5, 0], [r * 0.5, 0.012], [r * 0.4, 0.012], [r * 0.4, 0]], 28, null, cx, F + 0.002, cz));
  const loc = (a, d) => [cx + Math.cos(a) * d, cz + Math.sin(a) * d];       // by angle and distance from the middle
  const north = da + Math.PI;
  // the hearth under the crown: stones in a ring, ash, a tripod and a cauldron, the fire
  const hearth = [cx, cz];
  bag.add('granite_grey', lathe([[0.55, 0], [0.55, 0.1], [0.4, 0.1], [0.4, 0]], 14, null, hearth[0], F, hearth[1]));
  bag.add('opening', lathe([[0.001, 0.11], [0.4, 0.11]], 12, null, hearth[0], F - 0.02, hearth[1]));
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.5; bag.add('iron', rod([hearth[0] + Math.cos(a) * 0.5, F, hearth[1] + Math.sin(a) * 0.5], [hearth[0] + Math.cos(a) * 0.05, F + 1.1, hearth[1] + Math.sin(a) * 0.05], 0.022, 5)); }
  bag.add('iron', lathe([[0.001, 0], [0.22, 0.02], [0.3, 0.16], [0.29, 0.3], [0.22, 0.3], [0.2, 0.27]], 14, null, hearth[0], F + 0.52, hearth[1]));
  bag.add('flame', lathe([[0.14, 0], [0.1, 0.1], [0.05, 0.28], [0.001, 0.4]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), hearth[0], F + 0.12, hearth[1]));
  col.circle(hearth[0], hearth[1], 0.58, F, F + 0.9);
  lights?.push({ at: [hearth[0], F + 0.7, hearth[1]], color: '#ff9a4a', intensity: 3, distance: 9 });
  // the two roof posts (bagana) holding the crown ring in the great ger
  for (const s of [-1, 1]) { const px = hearth[0] + tx * s * 1.0, pz = hearth[1] + tz * s * 1.0; bag.add(DOOR, rod([px, F, pz], [px, top - 0.1, pz], 0.075, 8)); bag.add('gold', lathe([[0.075, 0], [0.09, 0.02], [0.09, 0.2], [0.075, 0.22]], 8, null, px, F + 1.2, pz)); col.circle(px, pz, 0.1, F, top); }
  // the master's couch at the north: a low platform of boards under furs and felts, cushions, behind it the felt images and a painted chest
  { const c = loc(north, r - 1.2), w0 = 1.7, d0 = 0.9;
    bag.add(DOOR, obox([c[0] - tx * w0 / 2, c[1] - tz * w0 / 2], [c[0] + tx * w0 / 2, c[1] + tz * w0 / 2], d0, F - 0.01, F + 0.38));
    bag.add('hide_brown', obox([c[0] - tx * (w0 / 2 - 0.05), c[1] - tz * (w0 / 2 - 0.05)], [c[0] + tx * (w0 / 2 - 0.05), c[1] + tz * (w0 / 2 - 0.05)], d0 - 0.08, F + 0.38, F + 0.42));
    for (const s of [-0.5, 0.5]) bag.add('cloth_red', obox([c[0] + tx * (s - 0.2), c[1] + tz * (s - 0.2)], [c[0] + tx * (s + 0.2), c[1] + tz * (s + 0.2)], 0.4, F + 0.42, F + 0.56));
    col.rect(boundsOf(c, w0, d0, tx, tz), F, F + 0.45);
    // the felt idols of the household hung above the couch: a man and a woman of felt, the figures' faces of white, with a cloth of red
    const ic = loc(north, r - 0.3);
    for (const s of [-0.45, 0.45]) { const x = ic[0] + tx * s, z = ic[1] + tz * s; bag.add('cloth_white', rod([x, F + 1.5, z], [x, F + 1.05, z], 0.1, 6)); bag.add('cloth_black', lathe([[0.001, 0], [0.09, 0.0], [0.09, 0.1], [0.001, 0.11]], 8, null, x, F + 1.45, z)); bag.add('cloth_red', rod([x - dx * 0.0, F + 1.28, z], [x, F + 1.12, z], 0.12, 6)); }
  }
  // the men's side (west of the door-north axis) and the women's side: Rubruck: the master's couch north, the women's side east, the men's west
  const seat = (a, d, mat) => { const c = loc(a, d); bag.add(DOOR, box(c[0] - 0.55, F - 0.01, c[1] - 0.55, c[0] + 0.55, F + 0.33, c[1] + 0.55)); bag.add(mat, box(c[0] - 0.52, F + 0.33, c[1] - 0.52, c[0] + 0.52, F + 0.37, c[1] + 0.52)); col.rect([c[0] - 0.55, c[1] - 0.55, c[0] + 0.55, c[1] + 0.55], F, F + 0.4); };
  seat(north - 1.0, r - 1.1, 'cloth_blue'); seat(north + 1.0, r - 1.1, 'cloth_green');
  // painted chests along the walls, a saddle and bow on the men's side, the churn and the kumiss skin by the door on the right
  for (const [a, d, cm] of [[north - 0.45, r - 0.75, 'paint_ochre'], [north + 0.45, r - 0.75, 'paint_ochre'], [north - 1.5, r - 0.75, 'lacquer_red'], [north + 1.55, r - 0.75, 'lacquer_red']]) {
    const c = loc(a, d), ux = Math.cos(a), uz = Math.sin(a);
    bag.add(cm, obox([c[0] - uz * 0.4, c[1] + ux * 0.4], [c[0] + uz * 0.4, c[1] - ux * 0.4], 0.5, F - 0.01, F + 0.62));
    bag.add('gilt_bronze', obox([c[0] - uz * 0.42 - ux * 0.01, c[1] + ux * 0.42 - uz * 0.01], [c[0] + uz * 0.42, c[1] - ux * 0.42], 0.52, F + 0.5, F + 0.56));
    col.circle(c[0], c[1], 0.42, F, F + 0.62);
  }
  { const c = loc(north - 1.9, r - 0.7); bag.add('hide_brown', lathe([[0.001, 0], [0.2, 0.02], [0.26, 0.1], [0.12, 0.2], [0.001, 0.22]], 10, null, c[0], F + 0.45, c[1])); bag.add(WOOD, rod([c[0] - 0.2, F, c[1]], [c[0] + 0.2, F + 0.45, c[1]], 0.03, 4)); }
  // by the door on the right as one enters: the skin of kumiss and the churning stick, a rack for the cups
  { const c = loc(da - 0.55, r - 0.65); bag.add('hide_tan', lathe([[0.001, 0], [0.22, 0.04], [0.3, 0.22], [0.2, 0.42], [0.1, 0.5], [0.001, 0.5]], 10, null, c[0], F, c[1])); bag.add(WOOD, rod([c[0], F + 0.2, c[1]], [c[0], F + 1.15, c[1]], 0.025, 5)); bag.add(WOOD, lathe([[0.001, 0], [0.09, 0], [0.09, 0.04], [0.001, 0.04]], 8, null, c[0], F + 1.15, c[1])); col.circle(c[0], c[1], 0.34, F, F + 0.5); }
  // bows and quivers hung on the lattice of the men's side
  { const a = north - 2.1; for (const dv of [0, 0.35]) { const c = loc(a - dv, r - 0.16), ux = -Math.sin(a - dv), uz = Math.cos(a - dv); bag.add('hide_brown', rod([c[0] - ux * 0.5, F + 1.3, c[1] - uz * 0.5], [c[0] + ux * 0.5, F + 1.35, c[1] + uz * 0.5], 0.018, 4)); } }
}
const boundsOf = (c, w, d, tx, tz) => { const hx = Math.abs(tx) * w / 2 + Math.abs(tz) * d / 2, hz = Math.abs(tz) * w / 2 + Math.abs(tx) * d / 2; return [c[0] - hx, c[1] - hz, c[0] + hx, c[1] + hz]; };

/** The wagon under a great ger: the plank bed on the axle, two tall wheels, the pole forward (toward the door side). */
function wagon(bag, col, cx, cz, y, r, da) {
  const dx = Math.cos(da), dz = Math.sin(da), tx = -dz, tz = dx, W = r * 0.95 + 0.4;
  // a platform of planks under the ger, its edge rail; the axle beam through the hubs
  bag.add('wood_dark', obox([cx - dx * (r + 0.2), cz - dz * (r + 0.2)], [cx + dx * (r + 0.2), cz + dz * (r + 0.2)], 2 * r + 0.5, y + 1.14, y + 1.3));
  const axA = [cx + tx * (W + 1.3), cz + tz * (W + 1.3)], axB = [cx - tx * (W + 1.3), cz - tz * (W + 1.3)];
  bag.add('timber', rod([axA[0], y + 0.9, axA[1]], [axB[0], y + 0.9, axB[1]], 0.14, 8));
  // wheels in the plane along the cart's length: built about x then turned to the cart's axis
  for (const s of [-1, 1]) {
    const c = [cx + tx * s * (W + 1.0), cz + tz * s * (W + 1.0)];
    const spokes = 12, R = 0.9, w = 0.14;
    for (let k = 0; k < spokes; k++) { const a = k / spokes * TAU; bag.add('wood_dark', rod([c[0] + dx * Math.cos(a) * 0.1, y + 0.9 + Math.sin(a) * 0.1, c[1] + dz * Math.cos(a) * 0.1], [c[0] + dx * Math.cos(a) * (R - 0.06), y + 0.9 + Math.sin(a) * (R - 0.06), c[1] + dz * Math.cos(a) * (R - 0.06)], 0.03, 5)); }
    const rimPts = 24;
    for (let k = 0; k < rimPts; k++) { const a0 = k / rimPts * TAU, a1 = (k + 1) / rimPts * TAU; bag.add('wood_dark', rod([c[0] + dx * Math.cos(a0) * R, y + 0.9 + Math.sin(a0) * R, c[1] + dz * Math.cos(a0) * R], [c[0] + dx * Math.cos(a1) * R, y + 0.9 + Math.sin(a1) * R, c[1] + dz * Math.cos(a1) * R], 0.07, 4)); }
    bag.add('wood_dark', rod([c[0] - tx * s * 0.12, y + 0.9, c[1] - tz * s * 0.12], [c[0] + tx * s * 0.12, y + 0.9, c[1] + tz * s * 0.12], 0.13, 8));
    col.circle(c[0], c[1], 0.3, y, y + 1.8);
  }
  // the shafts out in front (toward the door), resting on the ground end
  for (const s of [-0.45, 0.45]) bag.add('timber', rod([cx + tx * s + dx * (r + 0.2), y + 1.2, cz + tz * s + dz * (r + 0.2)], [cx + tx * s + dx * (r + 3.2), y + 0.35, cz + tz * s + dz * (r + 3.2)], 0.06, 6));
}
export { wagon };
void fromTriangles; void wedge;
