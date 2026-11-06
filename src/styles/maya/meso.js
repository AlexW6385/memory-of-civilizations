// Carved pieces shared by the Mesoamerican styles (maya, aztec, teotihuacano): a small kit for
// sculpture built in its own frame (x across, y up, z forward, out of the wall or toward the
// viewer) and set in place by a turn about y — the feathered-serpent heads of the balustrades,
// the serpent columns, the long-nosed masks of the rain god, the chacmool, the Teotihuacan heads.
// Every solid is a closed convex piece (frustums between two rectangles, limbs between two
// points, lathed discs), so nothing is open or paper-thin.

import { fromTriangles, orientOutward, lathe, place } from '../../core/geom.js';

/** A carving in its own frame: pieces by material, set in place by emit(bag, x, y, z, yaw). */
export class Kit {
  constructor() { this.m = new Map(); }
  geo(mat, g) { if (!this.m.has(mat)) this.m.set(mat, []); this.m.get(mat).push(g); return this; }
  /** Eight corners (bottom four, then top four, in matching order) as a closed solid. */
  hex(mat, P) {
    const t = [], q = (a, b, c, d) => t.push(...P[a], ...P[b], ...P[c], ...P[a], ...P[c], ...P[d]);
    q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
    return this.geo(mat, fromTriangles(orientOutward(t)));
  }
  /** A frustum along z: the rectangle [x0, x1, y0, y1] at z0 to the rectangle b at z1. */
  fz(mat, a, b, z0, z1) {
    return this.hex(mat, [[a[0], a[2], z0], [a[1], a[2], z0], [b[1], b[2], z1], [b[0], b[2], z1], [a[0], a[3], z0], [a[1], a[3], z0], [b[1], b[3], z1], [b[0], b[3], z1]]);
  }
  /** A box. */
  bx(mat, x0, x1, y0, y1, z0, z1) { return this.fz(mat, [x0, x1, y0, y1], [x0, x1, y0, y1], z0, z1); }
  /** A frustum along y: the rectangle [x0, x1, z0, z1] at y0 to the rectangle b at y1 (fangs, plumes). */
  fy(mat, a, b, y0, y1) {
    return this.hex(mat, [[a[0], y0, a[2]], [a[1], y0, a[2]], [a[1], y0, a[3]], [a[0], y0, a[3]], [b[0], y1, b[2]], [b[1], y1, b[2]], [b[1], y1, b[3]], [b[0], y1, b[3]]]);
  }
  /** A limb of rectangular section from point a to point b (half-width w across, half-depth h). */
  seg(mat, a, b, w, h, w1 = w, h1 = h) {
    const t = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...t) || 1; t[0] /= l; t[1] /= l; t[2] /= l;
    let up = Math.abs(t[1]) > 0.95 ? [0, 0, 1] : [0, 1, 0];
    const s = [t[1] * up[2] - t[2] * up[1], t[2] * up[0] - t[0] * up[2], t[0] * up[1] - t[1] * up[0]], sl = Math.hypot(...s); s[0] /= sl; s[1] /= sl; s[2] /= sl;
    const n = [s[1] * t[2] - s[2] * t[1], s[2] * t[0] - s[0] * t[2], s[0] * t[1] - s[1] * t[0]];
    const C = (p, a1, b1, ww, hh) => [p[0] + s[0] * a1 * ww + n[0] * b1 * hh, p[1] + s[1] * a1 * ww + n[1] * b1 * hh, p[2] + s[2] * a1 * ww + n[2] * b1 * hh];
    return this.hex(mat, [C(a, -1, -1, w, h), C(a, 1, -1, w, h), C(a, 1, 1, w, h), C(a, -1, 1, w, h), C(b, -1, -1, w1, h1), C(b, 1, -1, w1, h1), C(b, 1, 1, w1, h1), C(b, -1, 1, w1, h1)]);
  }
  /** A disc facing +z (an eye, an ear spool, a ring): radius r, thickness th, centred at (x, y) from z0 out. */
  disc(mat, x, y, z0, r, th, seg = 12, rin = 0) {
    const p = rin ? [[rin, 0], [r, 0], [r, th], [rin, th], [rin, 0]] : [[0.001, 0], [r, 0], [r, th], [0.001, th]];
    const g = lathe(p, seg); g.rotateX(Math.PI / 2); g.translate(x, y, z0);
    return this.geo(mat, g);
  }
  /** A disc built facing +z, turned by yaw about y and set at (x, y, z) (the face of a side, an ear spool). */
  discAt(mat, x, y, z, r, th, yaw, rin = 0, seg = 12) {
    const p = rin ? [[rin, 0], [r, 0], [r, th], [rin, th], [rin, 0]] : [[0.001, 0], [r, 0], [r, th], [0.001, th]];
    const g = lathe(p, seg); g.rotateX(Math.PI / 2);
    return this.geo(mat, place(g, x, y, z, yaw));
  }
  /** A flower or collar of petals facing +z: n petals of length r round a centre. */
  petals(mat, x, y, z0, r, th, n = 10) {
    const g = lathe([[0.001, 0], [r, 0], [r * 0.8, th], [0.001, th]], n * 4, (a) => 0.72 + 0.28 * Math.abs(Math.cos(a * n / 2))); g.rotateX(Math.PI / 2); g.translate(x, y, z0);
    return this.geo(mat, g);
  }
  /** Lay the carving into the bag at (x, y, z), its +z turned to face (dx, dz). */
  emit(bag, x, y, z, dx, dz, s = 1) {
    const yaw = Math.atan2(dx, dz);
    for (const [mat, list] of this.m) for (const g of list) bag.add(mat, place(g.clone(), x, y, z, yaw, s));
  }
}

const cache = new Map();
/** A cached carving: built once per key, cloned on emit. */
export function carved(key, build) { if (!cache.has(key)) { const k = new Kit(); build(k); cache.set(key, k); } return cache.get(key); }

/**
 * The feathered serpent's head at the foot of a balustrade (Chichén Itzá; the Mexica stairs): the
 * block where the balustrade ends, the upper jaw with its upturned snout and brow, the lower jaw
 * open on the ground, the red mouth and the tongue lolling over the lip, fangs and a row of teeth,
 * eyes under heavy brows, ear spools, a crest of feathers behind. About 2.4 m long at s = 1.
 * opts: { stone (material), mouth (material), goggles (Tlaloc's rings round the eyes), plumes }.
 */
export function serpentHeadKit({ stone = 'limestone_maya', mouth = 'stucco_red', goggles = false, plumes = true, eye = 'paint_minoan_black' } = {}) {
  return carved(`serpent:${stone}:${mouth}:${goggles}:${plumes}:${eye}`, (k) => {
    k.bx(stone, -0.78, 0.78, 0, 1.45, -0.7, 0.25);                                                      // the block at the balustrade's end
    k.fz(stone, [-0.74, 0.74, 0.78, 1.42], [-0.56, 0.56, 0.86, 1.22], 0.25, 1.62);                     // the upper jaw
    k.fz(stone, [-0.56, 0.56, 0.9, 1.22], [-0.48, 0.48, 1.0, 1.5], 1.55, 1.95);                       // the upturned snout
    k.fz(stone, [-0.42, 0.42, 1.38, 1.5], [-0.3, 0.3, 1.48, 1.62], 1.75, 2.02);                       // the curl of the nose
    k.fz(stone, [-0.7, 0.7, 0, 0.36], [-0.5, 0.5, 0, 0.28], 0.25, 1.72);                               // the lower jaw
    k.fz(mouth, [-0.6, 0.6, 0.3, 0.84], [-0.44, 0.44, 0.26, 0.9], 0.2, 1.5);                          // the mouth
    k.fz(mouth, [-0.22, 0.22, 0.34, 0.44], [-0.3, 0.3, 0.02, 0.1], 1.1, 2.25);                        // the tongue over the lip
    for (const sx of [-1, 1]) {
      k.fy('plaster_white', [sx * 0.42 - 0.08, sx * 0.42 + 0.08, 1.36, 1.5], [sx * 0.42 - 0.02, sx * 0.42 + 0.02, 1.43, 1.47], 0.88, 0.5);   // the fangs
      for (let i = 0; i < 4; i++) { const z = 0.55 + i * 0.22; k.fy('plaster_white', [sx * 0.52 - 0.04, sx * 0.52 + 0.04, z - 0.04, z + 0.04], [sx * 0.52 - 0.01, sx * 0.52 + 0.01, z - 0.01, z + 0.01], 0.86, 0.72); }
      const bx0 = Math.min(sx * 0.34, sx * 0.8), bx1 = Math.max(sx * 0.34, sx * 0.8), cx0 = Math.min(sx * 0.3, sx * 0.7), cx1 = Math.max(sx * 0.3, sx * 0.7);
      k.fz(stone, [bx0, bx1, 1.32, 1.56], [cx0, cx1, 1.3, 1.46], 0.2, 0.95);                            // the brow
      k.discAt(eye, sx * 0.66, 1.18, 0.62, 0.13, 0.08, sx * Math.PI / 2);                                // the eye, on the side
      if (goggles) k.discAt('maya_blue', sx * 0.64, 1.18, 0.62, 0.3, 0.1, sx * Math.PI / 2, 0.18);      // Tlaloc's goggle rings
      k.discAt(stone, sx * 0.76, 0.9, -0.3, 0.32, 0.12, sx * Math.PI / 2);                              // the ear spool
    }
    if (plumes) for (let i = 0; i < 5; i++) {                                                          // the crest of feathers
      const x = -0.6 + i * 0.3;
      k.seg(stone, [x, 1.35, -0.55], [x * 1.25, 2.05, -0.95], 0.12, 0.06, 0.08, 0.04);
    }
  });
}

/**
 * The rain god's long-nosed mask (Chaac), a panel w × h on a wall facing +z: the plate, the eyes
 * in their frames, the heavy brows, the hooked nose standing out and curling up, the mouth with
 * fangs, ear spools at the sides. The Puuc mosaic manner of the Temple of the Warriors' frieze.
 */
export function chaacKit(stone = 'limestone_maya', paint = 'stucco_red') {
  return carved(`chaac:${stone}:${paint}`, (k) => {
    k.bx(stone, -0.8, 0.8, 0, 1.5, 0, 0.12);                                                            // the plate
    k.fz(stone, [-0.76, 0.76, 0.04, 1.46], [-0.7, 0.7, 0.1, 1.4], 0.12, 0.2);                            // its bevelled face
    for (const sx of [-1, 1]) {
      k.bx(stone, sx * 0.5 - 0.2, sx * 0.5 + 0.2, 0.85, 1.25, 0.2, 0.34);                           // the eye's frame
      k.disc('paint_minoan_black', sx * 0.5, 1.05, 0.34, 0.1, 0.05, 10);                                 // the pupil
      k.bx(stone, sx * 0.48 - 0.3, sx * 0.48 + 0.3, 1.27, 1.45, 0.2, 0.44);                                 // the brow
      k.disc(stone, sx * 0.62, 0.42, 0.2, 0.15, 0.14, 12, 0.06);                                          // the ear spool
      for (let i = 0; i < 2; i++) k.fy('plaster_white', [sx * (0.14 + i * 0.12) - 0.04, sx * (0.14 + i * 0.12) + 0.04, 0.28, 0.36], [sx * (0.14 + i * 0.12) - 0.01, sx * (0.14 + i * 0.12) + 0.01, 0.31, 0.33], 0.46, 0.24);
    }
    k.bx(paint, -0.4, 0.4, 0.3, 0.5, 0.2, 0.36);                                                     // the mouth
    // the hooked nose: out from between the eyes, then up and back in three stones
    k.fz(stone, [-0.2, 0.2, 0.6, 1.25], [-0.17, 0.17, 0.56, 0.9], 0.2, 0.85);
    k.seg(stone, [0, 0.66, 0.78], [0, 1.2, 1.12], 0.15, 0.12, 0.12, 0.1);
    k.seg(stone, [0, 1.16, 1.1], [0, 1.46, 1.02], 0.12, 0.1, 0.09, 0.08);
  });
}

/**
 * A chacmool: the figure reclining on its back on a low base, knees drawn up, propped on its elbows,
 * the head turned to look out (+z), a dish held on the belly; about 1.5 m long, lying along x.
 */
export function chacmoolKit(stone = 'limestone_maya') {
  return carved(`chacmool:${stone}`, (k) => {
    k.bx(stone, -0.82, 0.86, 0, 0.18, -0.34, 0.34);                                                      // the base
    // the body: the hips low at x 0.1, the shoulders raised at x -0.45
    k.hex(stone, [[-0.52, 0.42, -0.22], [0.12, 0.2, -0.2], [0.12, 0.2, 0.2], [-0.52, 0.42, 0.22], [-0.42, 0.74, -0.24], [0.16, 0.44, -0.2], [0.16, 0.44, 0.2], [-0.42, 0.74, 0.24]]);
    k.bx(stone, -0.66, -0.36, 0.7, 1.0, -0.14, 0.16);                                                     // the head, turned to face out
    k.bx(stone, -0.7, -0.32, 0.96, 1.06, -0.16, 0.16);                                                    // the headdress band
    k.bx('paint_minoan_black', -0.58, -0.44, 0.84, 0.88, 0.16, 0.18);                                      // the eyes
    for (const sz of [-1, 1]) {
      k.seg(stone, [0.12, 0.3, sz * 0.12], [0.48, 0.74, sz * 0.13], 0.09, 0.08);                          // the thigh
      k.seg(stone, [0.48, 0.74, sz * 0.13], [0.72, 0.2, sz * 0.13], 0.075, 0.07);                         // the shin
      k.bx(stone, 0.64, 0.86, 0.18, 0.28, sz * 0.13 - 0.07, sz * 0.13 + 0.07);                             // the foot
      k.seg(stone, [-0.42, 0.66, sz * 0.24], [-0.44, 0.24, sz * 0.27], 0.06, 0.06);                       // the upper arm, to the elbow
      k.seg(stone, [-0.44, 0.24, sz * 0.27], [-0.06, 0.5, sz * 0.14], 0.055, 0.05);                       // the forearm, to the dish
    }
    k.geo(stone, lathe([[0.001, 0], [0.16, 0], [0.19, 0.06], [0.001, 0.06]], 14).translate(-0.1, 0.5, 0)); // the dish
  });
}
