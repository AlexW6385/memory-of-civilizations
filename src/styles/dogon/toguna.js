// The toguna, the men's house (docs/settlements/dogon.md §4.1): open on every side, eight posts of wood on stone footings, carved with
// ancestors, masks and zig-zags, forked at the top to carry the beams, and the roof, eight layers of millet stalks laid crosswise,
// stones set on the top as weights. Under it a floor of beaten earth, a low bench of mud along the back, mats, stools, a rope in the
// making. The real one is too low to stand in; ours is raised to 1.95 m clear so that a visitor can walk in (written in the dossier).

import { box, lathe, rod, place, fromTriangles } from '../../core/geom.js';
import { rng, DARK, LOG, STONE, STONE2, THATCH, STALK, WALL, MUD, SMOOTH, RED, basket } from './props.js';

export const CLEAR = 1.95;

/** A carved post at (x, y, z): the shaft, bands of zig-zag, a face and, on some, a pair of breasts or the arms of an ancestor; forked at the top. `face` is the direction (yaw) the figure looks toward. */
function post(bag, col, x, y, z, rand, face, k) {
  const r = 0.2 + rand() * 0.04;
  bag.add(STONE, lathe([[0.42, -0.3], [0.4, 0.1], [0.3, 0.2], [0.001, 0.2]], 8, (t) => 1 + 0.08 * Math.sin(t * 5 + x), x, y, z));
  bag.add(DARK, lathe([[r * 1.1, 0.18], [r, 0.4], [r * 0.96, 1.2], [r * 1.02, 1.75], [r * 0.9, 1.84]], 10, (t, i) => 1 + 0.025 * Math.sin(t * 3 + i * 2 + k), x, y, z));
  // the fork: two short branches opening upward, the beam lying in them
  for (const s of [-1, 1]) bag.add(DARK, rod([x, y + 1.8, z], [x + s * 0.17 * Math.cos(face), y + 2.02, z + s * 0.17 * Math.sin(face)], 0.065, 6));
  // carving (docs/settlements/dogon.md §13): ancestor figures in relief on the post's faces, built in the post's own frame (x across, z outward)
  const faces = k % 2 === 0 ? [face, face + Math.PI] : [face];
  faces.forEach((fc, n) => carve(bag, x, y, z, r, fc, k + n));
  col.circle(x, z, r + 0.08, y, y + 2.2);
}


/** The relief on one face of a post: a zig-zag band at the foot, the ancestor above it — legs bent, hands to the belly or the arms raised, a face with nose, eyes and mouth, a flat cap — and a ring cut under the fork; some carry the breasts. */
function carve(bag, x, y, z, r, yaw, k) {
  const g = (mat, geo) => bag.add(mat, place(geo, x, y, z, yaw));
  const zr = r * 0.93, d = 0.05, female = k % 3 === 0, raised = k % 2 === 0;
  const T = [];
  for (let i = -2; i < 2; i++) { const a = i * 0.065, b = a + 0.065; T.push(a, 0.24, zr, (a + b) / 2, 0.42, zr, b, 0.24, zr); }
  g(LOG, fromTriangles(T));
  for (const v of [0.46, 1.74]) g(LOG, lathe([[r + 0.012, 0], [r + 0.02, 0.014], [r + 0.012, 0.03]], 10, null, 0, v, 0));
  for (const s of [-1, 1]) {                                                       // legs: thigh out, shin back in
    g(LOG, rod([s * 0.06, 0.98, zr + 0.01], [s * 0.11, 0.78, zr + 0.04], 0.034, 5));
    g(LOG, rod([s * 0.11, 0.78, zr + 0.04], [s * 0.08, 0.56, zr + 0.015], 0.03, 5));
  }
  g(LOG, box(-0.13, 0.96, zr, 0.13, 1.34, zr + d));                               // trunk
  g(LOG, box(-0.04, 1.34, zr, 0.04, 1.4, zr + d));                                // neck
  for (const s of [-1, 1]) {
    if (raised) { g(LOG, rod([s * 0.13, 1.3, zr + 0.02], [s * 0.19, 1.52, zr + 0.02], 0.03, 5)); g(LOG, rod([s * 0.19, 1.52, zr + 0.02], [s * 0.17, 1.74, zr + 0.02], 0.028, 5)); }
    else { g(LOG, rod([s * 0.14, 1.3, zr + 0.02], [s * 0.15, 1.1, zr + 0.03], 0.03, 5)); g(LOG, rod([s * 0.15, 1.1, zr + 0.03], [s * 0.03, 1.04, zr + 0.05], 0.027, 5)); }
  }
  if (female) for (const s of [-1, 1]) g(LOG, lathe([[0.001, 0], [0.05, 0.01], [0.04, 0.07], [0.001, 0.09]], 7, null, s * 0.07, 1.2, zr + d).rotateX(Math.PI / 2 * 0));
  g(LOG, lathe([[0.001, 0], [0.065, 0.03], [0.085, 0.13], [0.06, 0.23], [0.001, 0.26]], 8, null, 0, 1.4, zr + 0.03));       // the head
  g(LOG, box(-0.012, 1.48, zr + 0.1, 0.012, 1.58, zr + 0.16));                    // the nose
  for (const s of [-1, 1]) g('opening', box(s * 0.04 - 0.012, 1.55, zr + 0.105, s * 0.04 + 0.012, 1.57, zr + 0.12));
  g('opening', box(-0.03, 1.44, zr + 0.105, 0.03, 1.455, zr + 0.115));
  g(LOG, lathe([[0.1, 0], [0.09, 0.03], [0.001, 0.045]], 8, null, 0, 1.64, zr + 0.03));                                       // a flat cap
}

/** toguna: { c: [x, z], w, d, y, yaw?, seed }: the plan about its centre, the floor at y + 0.12. */
export function toguna(el, { bag, col }) {
  const rand = rng(el.seed || 31), [cx, cz] = el.c, W = el.w ?? 7.2, D = el.d ?? 5.4, y = el.y ?? 0;
  const F = y + 0.12;
  // the floor: a platform of beaten earth edged with stones
  bag.add(MUD, box(cx - W / 2 - 0.5, y - 0.3, cz - D / 2 - 0.5, cx + W / 2 + 0.5, F, cz + D / 2 + 0.5));
  col.floor([cx - W / 2 - 0.5, cz - D / 2 - 0.5, cx + W / 2 + 0.5, cz + D / 2 + 0.5], F);
  for (let i = 0; i < 26; i++) {
    const t = i / 26, side = Math.floor(t * 4), u = (t * 4) % 1, hw = W / 2 + 0.5, hd = D / 2 + 0.5;
    const px = side === 0 ? -hw + u * 2 * hw : side === 2 ? hw - u * 2 * hw : side === 1 ? hw : -hw, pz = side === 1 ? -hd + u * 2 * hd : side === 3 ? hd - u * 2 * hd : side === 0 ? -hd : hd;
    bag.add(STONE2, lathe([[0.2 + rand() * 0.08, 0], [0.17, 0.12], [0.001, 0.15]], 6, (t2) => 1 + 0.2 * Math.sin(t2 * 3 + i), cx + px, F - 0.06, cz + pz));
  }
  // the eight posts, two rows of four
  const U = [-0.375, -0.125, 0.125, 0.375].map((f) => f * W), V = [-D * 0.34, D * 0.34];
  let k = 0;
  for (const v of V) for (const u of U) { post(bag, col, cx + u, F, cz + v, rand, v < 0 ? 0 : Math.PI, k); k++; }
  // the beams: two long ones in the forks along x, cross-beams over them, then the roof's layers
  const yb = F + CLEAR - 0.1;
  for (const v of V) bag.add(DARK, rod([cx - W / 2 - 0.5, yb + 0.03, cz + v], [cx + W / 2 + 0.5, yb + 0.03, cz + v], 0.1, 7));
  for (let i = 0; i < 9; i++) { const u = cx - W / 2 - 0.2 + i * (W + 0.4) / 8; bag.add(LOG, rod([u, yb + 0.17, cz - D / 2 - 0.3], [u + (rand() - 0.5) * 0.05, yb + 0.17, cz + D / 2 + 0.3], 0.065, 6)); }
  // the layers: bundles of millet stalks, each layer crosswise to the one below
  const RW = W + 1.0, RD = D + 1.0, BH = 0.13;
  let yy = yb + 0.25;
  for (let L = 0; L < 8; L++) {
    const alongX = L % 2 === 0, n = Math.round((alongX ? RD : RW) / 0.21), span = alongX ? RW : RD, mat = L % 3 === 1 ? STALK : THATCH;
    const inset = L * 0.05 + (L > 5 ? 0.1 * (L - 5) : 0);
    for (let i = 0; i < n; i++) {
      const o = -(alongX ? RD : RW) / 2 + (i + 0.5) * (alongX ? RD : RW) / n, ext = span / 2 - inset + (rand() - 0.5) * 0.18, bh = BH * (0.9 + rand() * 0.25);
      if (alongX) bag.add(mat, box(cx - ext, yy, cz + o - 0.105, cx + ext, yy + bh, cz + o + 0.105));
      else bag.add(mat, box(cx + o - 0.105, yy, cz - ext, cx + o + 0.105, yy + bh, cz + ext));
    }
    yy += BH;
  }
  // stones and a broken bundle on top, held down
  for (let i = 0; i < 9; i++) bag.add(STONE2, lathe([[0.2 + rand() * 0.1, 0], [0.18, 0.1], [0.001, 0.14]], 6, (t) => 1 + 0.15 * Math.sin(t * 3 + i), cx + (rand() - 0.5) * (RW - 1), yy - 0.02, cz + (rand() - 0.5) * (RD - 1)));
  col.rect([cx - RW / 2, cz - RD / 2, cx + RW / 2, cz + RD / 2], F + CLEAR, yy);
  // under the roof: the bench of mud along the back, mats and stools, baskets, a hoe hung from a beam
  const bz = cz - D / 2 + 0.05;
  bag.add(WALL, box(cx - W / 2 + 0.6, y, bz - 0.3, cx + W / 2 - 0.6, F + 0.35, bz + 0.3));
  bag.add(SMOOTH, box(cx - W / 2 + 0.55, F + 0.35, bz - 0.34, cx + W / 2 - 0.55, F + 0.4, bz + 0.34));
  col.rect([cx - W / 2 + 0.55, bz - 0.34, cx + W / 2 - 0.55, bz + 0.34], F, F + 0.4);
  bag.add(STALK, box(cx - 2.2, F + 0.4, bz - 0.28, cx - 0.4, F + 0.42, bz + 0.28));
  bag.add('cloth_indigo', box(cx + 0.7, F + 0.42, bz - 0.2, cx + 1.5, F + 0.46, bz + 0.2));
  bag.add(STALK, box(cx - 1.8, F, cz + 0.2, cx + 0.2, F + 0.015, cz + 1.4));
  for (const [sx, sz] of [[cx + 1.8, cz + 0.6], [cx + 2.5, cz + 1.0], [cx - 2.4, cz + 1.6]]) {
    bag.add(DARK, lathe([[0.17, 0], [0.12, 0.02], [0.1, 0.12], [0.16, 0.2], [0.17, 0.26], [0.001, 0.26]], 8, null, sx, F, sz));      // a carved stool
    col.circle(sx, sz, 0.2, F, F + 0.26);
  }
  basket(bag, cx + 2.9, F, cz - 1.2, 0.26, 'cloth_ochre'); basket(bag, cx - 2.9, F, cz - 0.2, 0.22);
  bag.add(LOG, rod([cx - 0.8, yb - 0.02, cz + V[1]], [cx - 0.8, yb - 0.5, cz + V[1] - 0.05], 0.012, 4));
  bag.add('iron', box(cx - 0.84, yb - 0.62, cz + V[1] - 0.12, cx - 0.76, yb - 0.46, cz + V[1] - 0.04));
  bag.add(RED, box(cx - W / 2 + 0.6, F + 0.4, bz + 0.3, cx + W / 2 - 0.6, F + 0.43, bz + 0.34));
  // the men's strip loom: two posts and a beam with the heddles, the warp running away west along the ground to its stone weight, a narrow
  // strip of indigo and white already woven; the weaver sits on a low stool at its east end (town.js)
  const lx = cx + 1.2, lz = cz - 1.35;
  for (const s of [-1, 1]) bag.add(DARK, rod([lx, F, lz + s * 0.35], [lx + 0.05, F + 1.35, lz + s * 0.35], 0.03, 5));
  bag.add(DARK, rod([lx + 0.05, F + 1.3, lz - 0.4], [lx + 0.05, F + 1.3, lz + 0.4], 0.025, 5));
  bag.add(LOG, rod([lx - 0.15, F + 1.0, lz - 0.38], [lx - 0.15, F + 1.0, lz + 0.38], 0.018, 4));
  for (let k = -3; k <= 3; k++) bag.add(THATCH, rod([lx - 0.15, F + 1.0, lz + k * 0.045], [lx - 2.6, F + 0.05, lz + k * 0.045], 0.004, 3));
  bag.add('cloth_indigo', box(lx - 0.5, F + 0.55, lz - 0.1, lx - 0.15, F + 0.57, lz + 0.1));
  bag.add('cloth_white', box(lx - 0.5, F + 0.57, lz - 0.1, lx - 0.4, F + 0.575, lz + 0.1));
  bag.add(STONE2, lathe([[0.2, 0], [0.16, 0.1], [0.001, 0.14]], 6, null, lx - 2.65, F, lz));
  col.circle(lx, lz - 0.35, 0.05, F, F + 1.4); col.circle(lx, lz + 0.35, 0.05, F, F + 1.4);
  bag.add(DARK, lathe([[0.17, 0], [0.12, 0.02], [0.1, 0.12], [0.16, 0.2], [0.17, 0.26], [0.001, 0.26]], 8, null, lx + 0.55, F, lz));
  col.circle(lx + 0.55, lz, 0.2, F, F + 0.26);
}
