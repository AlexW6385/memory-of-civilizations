// The hall's board doors and the terrace stairs' cheeks (docs/settlements/tang-wutai.md §18). The doors: two leaves of vertical planks
// that differ a little in thickness and grain, the battens across, rows of domed iron studs, bronze animal-mask plates with ring handles,
// hinge straps, the door's pivot heads in the lintel and the stone below, the jambs with a moulding. The cheeks: sloping stone sides
// of the stair with a coping that overhangs, a carved panel on the outer face and a round newel at the foot.

import { lathe } from '../../core/geom.js';
import { Acc, skin, flat, hash, band } from './sculpt-kit.js';

/** A chamfered box in a frame fr(n, s, y): n out of the wall, s along it; edges chamfered by b. */
function cbox(A, mat, fr, n0, s0, n1, s1, y0, y1, b = 0.012) {
  const r = (y, i) => [[n0 + i, s0 + i], [n1 - i, s0 + i], [n1 - i, s1 - i], [n0 + i, s1 - i]].map(([n, s]) => fr(n, s, y));
  A.add(mat, flat(skin([r(y0, b), r(y0 + b, 0), r(y1 - b, 0), r(y1, b)], true, true)));
}
/**
 * fg_door { at [x, z], axis 'z' | 'x', y, w, h, th, out }: as tang_door (the jambs, the head, the threshold, two leaves swung open into the hall), with
 * planked leaves, studs, mask plates and ring handles, hinge straps.
 */
export function fgDoor(el, { bag, col }) {
  const az = (el.axis ?? 'z') === 'z', w = el.w ?? 3.6, h = el.h ?? 3.9, t = el.th ?? 0.9, y = el.y, out = el.out ?? -1, c = el.at, A = new Acc();
  const fr = az ? (n, s, yy) => [c[0] + n, yy, c[1] + s] : (n, s, yy) => [c[0] + s, yy, c[1] + n];
  const n0 = -t / 2, n1 = t / 2, hw = w / 2;
  // the jambs with a moulding on the inner edge, the lintel, the threshold stone with its worn dip
  cbox(A, 'timber_red', fr, n0, -hw, n1, -hw + 0.1, y, y + h);
  cbox(A, 'timber_red', fr, n0, hw - 0.1, n1, hw, y, y + h);
  cbox(A, 'timber_red', fr, n0 - 0.02, -hw - 0.04, n1 + 0.02, hw + 0.04, y + h - 0.14, y + h + 0.02);
  for (const sg of [-1, 1]) cbox(A, 'wood_dark', fr, n0 - 0.01, sg > 0 ? hw - 0.12 : -hw + 0.1, n1 + 0.01, sg > 0 ? hw - 0.1 : -hw + 0.12, y + 0.02, y + h - 0.14, 0.004);
  cbox(A, 'limestone', fr, n0, -hw, n1, hw, y - 0.02, y + 0.17, 0.02);
  // the leaves, swung open into the hall, each hinged at its jamb
  const inner = out < 0 ? n1 : n0, dirIn = -out;
  for (const s of [-1, 1]) {
    const hz = s * (hw - 0.1), len = hw - 0.1 - 0.02, th = 0.1, a0 = inner + (dirIn > 0 ? 0.04 : -0.04 - len), a1 = a0 + len;
    const z0 = hz - (s > 0 ? th : 0), z1 = z0 + th, np = 9;
    const lf = (nn, ss, yy) => fr(nn, ss, yy);
    // the planks: each a little different in thickness and joint, the grooves between them
    for (let k = 0; k < np; k++) {
      const p0 = a0 + len * k / np, p1 = a0 + len * (k + 1) / np, hh = hash(c[0] + s * 7, c[1], k), dz0 = 0.004 * hh, dz1 = 0.004 * hash(c[0], c[1] + s * 3, k + 9);
      cbox(A, 'timber_red', lf, p0, z0 - dz0, p1, z1 + dz1, y + 0.03 + 0.006 * hh, y + h - 0.15 - 0.006 * hash(k, s, c[1]), 0.006);
    }
    for (const face of [-1, 1]) {
      // three battens across, chamfered
      for (const hy of [0.35, h / 2 - 0.05, h - 0.55]) cbox(A, 'timber_red', lf, a0, face > 0 ? z1 : z0 - 0.04, a1, face > 0 ? z1 + 0.04 : z0, y + hy, y + hy + 0.2, 0.012);
    }
  }
  // (the studs and handles are placed in the leaf's own frame below)
  for (const s of [-1, 1]) {
    const hz = s * (hw - 0.1), len = hw - 0.1 - 0.02, th = 0.1, a0 = inner + (dirIn > 0 ? 0.04 : -0.04 - len), a1 = a0 + len;
    const z0 = hz - (s > 0 ? th : 0), z1 = z0 + th;
    for (const face of [-1, 1]) {
      const fz = face > 0 ? z1 + 0.04 : z0 - 0.04, nrm = face;
      // a face looks along ±s; the stud's outward is the wall-parallel axis, so map: n ↔ the leaf's length, s ↔ across
      const f2 = (a, zz, yy) => fr(a, zz, yy);
      for (const hy of [0.45, h / 2 + 0.05, h - 0.45]) for (let k = 0; k < 5; k++) { const a = a0 + len * (k + 0.5) / 5; stud2(A, f2, a, fz, y + hy + 0.1, nrm); }
      const af = dirIn > 0 ? a1 - 0.2 : a0 + 0.2;
      knocker2(A, f2, af, fz, y + 1.3, nrm);
    }
    // the hinge straps at the jamb, with their nail heads
    for (const hy of [0.5, h - 0.7]) { cbox(A, 'iron', fr, a0, z0 - 0.012 - 0.04, a0 + Math.min(0.5, len), z1 + 0.012 + 0.04, y + hy, y + hy + 0.08, 0.006); }
    // the pivot heads: a round iron shoe in the lintel and the threshold
    { const [px, , pz] = fr(a0 + 0.04 * dirIn, hz, 0); A.add('iron', lathe([[0.001, 0], [0.06, 0], [0.06, 0.1], [0.001, 0.1]], 8, null, px, y + h - 0.25, pz)); }
    col.rect(el.axis === 'x' ? [c[0] + z0, c[1] + a0, c[0] + z1, c[1] + a1] : [c[0] + a0, c[1] + z0, c[0] + a1, c[1] + z1], y, y + h - 0.15);
  }
  A.emit(bag, () => {});
}
// a stud on a leaf's face: the face looks along ±s (across the leaf's thickness), `a` is the position along the leaf
function stud2(A, fr, a, zz, yy, face, rad = 0.03) {
  const g = lathe([[rad, 0], [rad * 0.9, rad * 0.45], [rad * 0.5, rad * 0.85], [0.001, rad]], 6);
  const [x0, y0, z0] = fr(a, zz, yy), [x1, , z1] = fr(a, zz + 1, yy), dx = (x1 - x0) * face, dz = (z1 - z0) * face;
  g.rotateX(Math.PI / 2).rotateY(Math.atan2(dx, dz)).translate(x0, y0, z0);
  A.add('iron', g);
}
function knocker2(A, fr, a, zz, yy, face) {
  const [x0, y0, z0] = fr(a, zz, yy), [x1, , z1] = fr(a, zz + 1, yy), yaw = Math.atan2((x1 - x0) * face, (z1 - z0) * face);
  A.add('bronze', lathe([[0.001, 0], [0.095, 0], [0.1, 0.012], [0.085, 0.022], [0.04, 0.03], [0.001, 0.05]], 8).rotateX(Math.PI / 2).rotateY(yaw).translate(x0, y0, z0));
  A.add('bronze', band(0, 0, 0, 0.075, 0.075, 0.011, 14, 5).rotateX(Math.PI / 2).translate(0, -0.1, 0.06).rotateY(yaw).translate(x0, y0, z0));
}

/** fg_cheek { x (the stair's upper end), run, y0, y1 (the stair's foot and top), z (the cheek's centre), w }: a sloping cheek wall with a coping, a carved panel, a round newel. */
export function fgCheek(el, { bag }) {
  const { x, run, y0, y1, z, w = 0.6 } = el, A = new Acc(), hw = w / 2, yb = y0 - 0.25;
  const top = (s) => y0 + (y1 - y0) * (s / run) + 0.6;
  const sec = (s) => {
    const yt = top(s), P = [[-hw, yb], [hw, yb], [hw, yt - 0.34], [hw + 0.07, yt - 0.3], [hw + 0.07, yt - 0.13], [hw, yt - 0.1], [hw - 0.05, yt], [-hw + 0.05, yt], [-hw, yt - 0.1], [-hw - 0.07, yt - 0.13], [-hw - 0.07, yt - 0.3], [-hw, yt - 0.34]];
    return P.map(([t, yy]) => [x - run + s, yy, z + t]);
  };
  A.add(el.mat || 'limestone', flat(skin([sec(0), sec(run)], true, true)));
  // a carved panel on the outer face, a long frame with an inner field in granite, following the slope
  for (const sg of [-1, 1]) {
    const zf = z + sg * (hw + 0.07), dz = sg * 0.02;
    for (const [m, inset, d] of [['granite_grey', 0.3, 0.025], ['limestone', 0.5, 0.045]]) {
      const s0 = inset, s1 = run - inset;
      const r = (s, dd) => [[0, -0.2], [0, 0.0]].map(([, o], k) => [x - run + s, top(s) - 0.52 + (k ? 0.22 : 0), zf + sg * dd]);
      void r; void dz;
      A.add(m, flat(skin([s0, s1].map((s) => [[x - run + s, top(s) - 0.62, z + sg * (hw + 0.07 - 0.0)], [x - run + s, top(s) - 0.62, z + sg * (hw + 0.07 + d)], [x - run + s, top(s) - 0.4, z + sg * (hw + 0.07 + d)], [x - run + s, top(s) - 0.4, z + sg * (hw + 0.07)]]).map((q) => q), true, true)));
    }
  }
  // the newel at the foot: a drum on a moulded plinth and a round head
  const [nx, nz] = [x - run - 0.05, z];
  A.add(el.mat || 'limestone', flat(lathe([[0.001, yb], [0.46, yb], [0.46, yb + 0.12], [0.4, yb + 0.16], [0.36, yb + 0.25], [0.36, yb + 0.9], [0.42, yb + 0.96], [0.42, yb + 1.02], [0.34, yb + 1.08], [0.3, yb + 1.14], [0.001, yb + 1.14]], 12, null, nx, 0, nz)));
  A.add(el.mat || 'limestone', lathe([[0.001, yb + 1.12], [0.22, yb + 1.18], [0.26, yb + 1.32], [0.17, yb + 1.46], [0.04, yb + 1.52], [0.001, yb + 1.53]], 10, null, nx, 0, nz));
  A.emit(bag, () => {});
}
