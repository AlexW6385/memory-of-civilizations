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
  // carving: zig-zag bands (raised triangles) near the foot and under the fork; the face and body of the ancestor between
  const fx = Math.sin(face), fz = Math.cos(face), px = fz, pz = -fx;
  const at = (u, v, h) => [x + fx * (r + h) + px * u, y + v, z + fz * (r + h) + pz * u];
  const T = [];
  for (const [v0, v1] of [[0.45, 0.62], [1.45, 1.6]]) for (let i = -2; i < 2; i++) {
    const a = at(i * 0.07, v0, 0), b = at(i * 0.07 + 0.07, v0, 0), c = at(i * 0.07 + 0.035, v1, 0);
    T.push(...a, ...c, ...b);
  }
  bag.add(LOG, fromTriangles(T));
  if (k % 3 !== 2) {
    const head = at(0, 1.3, 0.02);
    bag.add(LOG, lathe([[0.001, 0], [0.085, 0.03], [0.1, 0.12], [0.07, 0.22], [0.001, 0.25]], 8, null, head[0], head[1] - 0.12, head[2]));
    for (const s of [-1, 1]) { const e = at(s * 0.045, 1.33, 0.1); bag.add('opening', box(e[0] - 0.012, e[1] - 0.01, e[2] - 0.012, e[0] + 0.012, e[1] + 0.012, e[2] + 0.012)); }
    if (k % 3 === 0) for (const s of [-1, 1]) { const b = at(s * 0.09, 1.0, 0.03); bag.add(LOG, lathe([[0.001, 0], [0.06, 0.02], [0.045, 0.09], [0.001, 0.11]], 8, null, b[0], b[1], b[2]).rotateX(0)); }
    else for (const s of [-1, 1]) bag.add(LOG, rod(at(s * 0.12, 1.15, 0.02), at(s * 0.1, 0.85, 0.07), 0.025, 5));
  }
  col.circle(x, z, r + 0.08, y, y + 2.2);
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
