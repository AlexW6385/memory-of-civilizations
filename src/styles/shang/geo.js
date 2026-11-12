// Shared builders of the Shang style (docs/settlements/shang-yinxu.md §4–§5): thatch roofs, rammed-earth platforms, steps,
// the bronze vessels of the ritual set, a frame for lots.
import { box, frustum, lathe, rod } from '../../core/geom.js';

/**
 * A lot's frame: u runs along the street, v from the street into the lot. `sub(u0, v0, dir)` is a frame of its own for a building turned
 * to face another way: local a along its width, b from its door into it; dir 'v' (door toward the street, the house in front of
 * (u0, v0)), 'back' (door toward the lot's back, the house on the street side of the door line), '+u' (door toward +u, the house at
 * smaller u), '-u' (door toward -u). `asc` is the world direction of local +b (the way up the steps from the door into the house).
 */
export function frame(rect, front, bag, col) {
  const [x0, z0, x1, z1] = rect, zs = front === 's' ? z1 : z0, sg = front === 's' ? -1 : 1, Z = (v) => zs + sg * v;
  const baseR = (u0, v0, u1, v1) => { const a = Z(v0), b = Z(v1); return [x0 + Math.min(u0, u1), Math.min(a, b), x0 + Math.max(u0, u1), Math.max(a, b)]; };
  const mk = (map, W, D) => {
    const R = (a0, b0, a1, b1) => { const p = map(a0, b0), q = map(a1, b1); return baseR(p[0], p[1], q[0], q[1]); };
    const o = map(0, 0), e = map(0, 1), du = e[0] - o[0], dv = (e[1] - o[1]) * sg;
    const F = {
      W, D, R, bag, col, sg, front,
      asc: Math.abs(du) > Math.abs(dv) ? (du > 0 ? 'e' : 'w') : (dv > 0 ? 's' : 'n'),
      X: (a) => x0 + map(a, 0)[0], Z: (b) => Z(map(0, b)[1]),
      /** The world point of local (a, b). */
      P: (a, b) => { const p = map(a, b); return [x0 + p[0], Z(p[1])]; },
      b(mat, a0, y0, b0, a1, y1, b1, solid = true) { const r = R(a0, b0, a1, b1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); },
      lathe(mat, prof, a, y, b, seg = 10) { const p = F.P(a, b); bag.add(mat, lathe(prof, seg, null, p[0], y, p[1])); },
      /** A roof (hip or gable) over [a0, b0, a1, b1] with eaves at y, rising `rise`, overhang o. */
      roof(a0, b0, a1, b1, y, rise, o = 0.6, hip = true, mat = 'thatch') { thatch(bag, R(a0, b0, a1, b1), y, rise, o, hip, mat); },
      post(a, b, y0, y1, r = 0.12) { const p = F.P(a, b); bag.add('timber', lathe([[r, 0], [r * 0.9, y1 - y0]], 7, null, p[0], y0, p[1])); col.circle(p[0], p[1], r + 0.04, y0, y1); },
      /** The frame of a building turned to face `dir` at (u0, v0) of this frame (see above); w the width, d the depth. */
      sub(u0, v0, dir = 'v', w = 0, d = 0) {
        const m2 = dir === 'v' ? (a, b) => map(u0 + a, v0 + b) : dir === 'back' ? (a, b) => map(u0 - a, v0 - b) : dir === '+u' ? (a, b) => map(u0 - b, v0 + a) : (a, b) => map(u0 + b, v0 + a);
        return mk(m2, w, d);
      },
    };
    return F;
  };
  return mk((a, b) => [a, b], x1 - x0, z1 - z0);
}

/** A thatched roof over the rectangle r = [x0, z0, x1, z1], eaves at y, ridge `rise` above; convex like thatch, two tiers. */
export function thatch(bag, r, y, rise, o = 0.6, hip = true, mat = 'thatch') {
  const x0 = r[0] - o, z0 = r[1] - o, x1 = r[2] + o, z1 = r[3] + o;
  const hx = (x1 - x0) / 2, hz = (z1 - z0) / 2;
  // a thick edge to the eave (the walker's roof-shell test needs an underside there)
  if (y > 1.5) bag.add(mat, frustum([x0, z0, x1, z1], y - 0.3, y + 0.02, 0, 0, 0, 0, { noTop: true }));
  if (hip) {
    const m = Math.min(hx, hz), f = 0.3 * m;
    bag.add(mat, frustum([x0, z0, x1, z1], y, y + rise * 0.55, f, f, f, f, { noTop: true }));
    bag.add(mat, frustum([x0 + f, z0 + f, x1 - f, z1 - f], y + rise * 0.55, y + rise, m - f, m - f, m - f, m - f, { noBottom: true, noTop: true }));
  } else if (hx >= hz) {                // ridge along x
    const f = 0.3 * hz;
    bag.add(mat, frustum([x0, z0, x1, z1], y, y + rise * 0.55, 0, 0, f, f, { noTop: true }));
    bag.add(mat, frustum([x0, z0 + f, x1, z1 - f], y + rise * 0.55, y + rise, 0, 0, hz - f, hz - f, { noBottom: true, noTop: true }));
  } else {                              // ridge along z
    const f = 0.3 * hx;
    bag.add(mat, frustum([x0, z0, x1, z1], y, y + rise * 0.55, f, f, 0, 0, { noTop: true }));
    bag.add(mat, frustum([x0 + f, z0, x1 - f, z1], y + rise * 0.55, y + rise, hx - f, hx - f, 0, 0, { noBottom: true, noTop: true }));
  }
}

/** A rammed-earth platform: battered sides, walkable top. */
export function platform(bag, col, r, h, bat = 0.35) {
  bag.add('earth_wall', frustum(r, 0, h, bat, bat, bat, bat, { noBottom: true }));
  col.rect(r, 0, h);
  col.floor([r[0] + bat, r[1] + bat, r[2] - bat, r[3] - bat], h);
}

/** Steps up to a platform: rect between the ground and the platform's edge, `dir` = the direction of ascent. */
export function steps(bag, col, rect, y0, y1, dir, mat = 'earth_wall') {
  const [x0, z0, x1, z1] = rect, rise = y1 - y0, n = Math.max(1, Math.round(rise / 0.17));
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, yTop = y0 + rise * f1, L = z1 - z0, W = x1 - x0;
    let r;
    if (dir === 'n') r = [x0, z0, x1, z1 - L * f0]; else if (dir === 's') r = [x0, z0 + L * f0, x1, z1];
    else if (dir === 'e') r = [x0 + W * f0, z0, x1, z1]; else r = [x0, z0, x1 - W * f0, z1];
    bag.add(mat, box(r[0], y0 - 0.01, r[1], r[2], yTop, r[3]));
  }
  col.ramp(rect, y0, y1, dir);
}

// ── the bronze vessels of the ritual set (all about 0.25–0.9 m) ──
const V = {
  // ding: a round tripod cauldron with two loop handles
  ding(bag, x, y, z, s = 1) {
    bag.add('bronze', lathe([[0.001, 0.32], [0.26, 0.34], [0.34, 0.5], [0.33, 0.66], [0.36, 0.68], [0.36, 0.72], [0.001, 0.72]].map(([r, h]) => [r * s, h * s]), 14, null, x, y, z));
    for (const a of [0.4, 2.5, 4.6]) bag.add('bronze', rod([x + Math.cos(a) * 0.22 * s, y, z + Math.sin(a) * 0.22 * s], [x + Math.cos(a) * 0.28 * s, y + 0.38 * s, z + Math.sin(a) * 0.28 * s], 0.05 * s, 6));
    for (const sd of [-1, 1]) bag.add('bronze', box(x + sd * 0.35 * s - 0.04 * s, y + 0.68 * s, z - 0.05 * s, x + sd * 0.35 * s + 0.04 * s, y + 0.86 * s, z + 0.05 * s));
  },
  // gui: a bowl with a ring foot and two handles
  gui(bag, x, y, z, s = 1) {
    bag.add('bronze', lathe([[0.17, 0], [0.19, 0.1], [0.33, 0.14], [0.37, 0.3], [0.33, 0.4], [0.001, 0.4]].map(([r, h]) => [r * s, h * s]), 14, null, x, y, z));
    for (const sd of [-1, 1]) bag.add('bronze', box(x + sd * 0.38 * s - 0.03 * s, y + 0.2 * s, z - 0.05 * s, x + sd * 0.38 * s + 0.03 * s, y + 0.42 * s, z + 0.05 * s));
  },
  // jue: a three-legged pouring cup with a spout and a tail
  jue(bag, x, y, z, s = 1) {
    bag.add('bronze', lathe([[0.001, 0.18], [0.07, 0.2], [0.1, 0.3], [0.13, 0.42], [0.001, 0.42]].map(([r, h]) => [r * s, h * s]), 10, null, x, y, z));
    for (const a of [0.3, 2.4, 4.5]) bag.add('bronze', rod([x + Math.cos(a) * 0.05 * s, y, z + Math.sin(a) * 0.05 * s], [x + Math.cos(a) * 0.08 * s, y + 0.22 * s, z + Math.sin(a) * 0.08 * s], 0.012 * s, 5));
    bag.add('bronze', box(x + 0.1 * s, y + 0.38 * s, z - 0.015 * s, x + 0.24 * s, y + 0.43 * s, z + 0.015 * s));
  },
  // gu: a tall slender beaker with a flared mouth
  gu(bag, x, y, z, s = 1) {
    bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.07, 0.1], [0.05, 0.3], [0.05, 0.4], [0.1, 0.55], [0.13, 0.62], [0.001, 0.6]].map(([r, h]) => [r * s, h * s]), 10, null, x, y, z));
  },
  // zun: a wide-mouthed jar-vessel on a ring foot
  zun(bag, x, y, z, s = 1) {
    bag.add('bronze', lathe([[0.001, 0], [0.16, 0], [0.15, 0.1], [0.2, 0.25], [0.2, 0.34], [0.26, 0.5], [0.3, 0.56], [0.001, 0.54]].map(([r, h]) => [r * s, h * s]), 12, null, x, y, z));
  },
};
export const vessel = (kind, bag, x, y, z, s = 1) => V[kind](bag, x, y, z, s);
export const KINDS = ['ding', 'gui', 'jue', 'gu', 'zun'];

/** A rotary wheel with a rim and spokes (chariot): axis along `ax` ('x' or 'z'), centre (x, y, z). */
export function wheel(bag, x, y, z, r, ax = 'x', spokes = 18) {
  const tilt = (g) => { if (ax === 'x') g.rotateZ(Math.PI / 2); else g.rotateX(Math.PI / 2); return g; };
  const ring = tilt(lathe([[r - 0.06, -0.05], [r, -0.05], [r, 0.05], [r - 0.06, 0.05]], 20));
  ring.translate(x, y, z); bag.add('timber', ring);
  const hub = tilt(lathe([[0.001, -0.14], [0.1, -0.14], [0.1, 0.14], [0.001, 0.14]], 8)); hub.translate(x, y, z); bag.add('timber', hub);
  for (let i = 0; i < spokes; i++) {
    const a = i / spokes * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const p = ax === 'x' ? [[x, y + c * 0.1, z + s * 0.1], [x, y + c * (r - 0.03), z + s * (r - 0.03)]] : [[x + c * 0.1, y + s * 0.1, z], [x + c * (r - 0.03), y + s * (r - 0.03), z]];
    bag.add('timber', rod(p[0], p[1], 0.018, 4));
  }
}
