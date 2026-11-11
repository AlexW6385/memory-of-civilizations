// The outrigger canoe of Pohnpei, as the Micronesian sailing-canoe type (docs/settlements/nan-madol.md §7): a hull dug out of one
// log, narrow and deep, both ends rising; two booms lashed across to the outrigger float (ama) on the lee side, which is
// the port side (−x at yaw 0) here; a platform of poles over the booms; paddles laid across. The bow is toward −z at yaw 0.
// `y` is the keel's height, `len` the length (7 m: the movers' reference), `afloat`: without paddles laid.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

export function canoe(el, { bag, col }) {
  const [x, z] = el.at, L = el.len ?? 7, yaw = el.yaw ?? 0, y0 = el.y ?? 0, B = 0.5 + L * 0.012, D = 0.62, side = el.side ?? 1;
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const NU = 20, NS = 8;
  const beam = (u) => B / 2 * Math.max(0.0004, 1 - Math.abs(2 * u / L) ** 2.4) ** 0.55;
  const sheer = (u) => D + 0.28 * Math.abs(2 * u / L) ** 4;
  const keel = (u) => 0.22 * Math.abs(2 * u / L) ** 4;
  const pt = (i, j, inner) => {
    const u = -L / 2 + L * i / NU, b = beam(u) * (inner ? 0.78 : 1), a = Math.PI * j / NS, top = sheer(u), bot = keel(u);
    const yy = inner ? top - (top - bot - 0.1) * Math.sin(a) ** 0.6 * Math.min(1, beam(u) / (B * 0.2)) : top - (top - bot) * Math.sin(a) ** 0.7;
    return [-Math.cos(a) * b, yy, u];
  };
  const t = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NS; j++) {
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j + 1, false), d = pt(i, j + 1, false);
    t.push(...a, ...c, ...b, ...a, ...d, ...c);
    const a2 = pt(i, j, true), b2 = pt(i + 1, j, true), c2 = pt(i + 1, j + 1, true), d2 = pt(i, j + 1, true);
    t.push(...a2, ...b2, ...c2, ...a2, ...c2, ...d2);
  }
  for (let i = 0; i < NU; i++) for (const j of [0, NS]) {
    const a = pt(i, j, false), b = pt(i + 1, j, false), c = pt(i + 1, j, true), d = pt(i, j, true);
    if (j === 0) t.push(...a, ...b, ...c, ...a, ...c, ...d); else t.push(...a, ...c, ...b, ...a, ...d, ...c);
  }
  add('wood_dark', fromTriangles(t));
  // the booms and the float: on the −x side (side = 1), the float a long narrow log pointed at both ends, a hand above the water
  const fx = -side * (B / 2 + 1.55), fy = D * 0.34;
  for (const u of [-L * 0.2, L * 0.2]) {
    add('timber', rod([side * 0.05, D - 0.02, u], [fx, fy + 0.08, u], 0.04, 6));
    add('timber', rod([-side * 0.05, D - 0.02, u], [-side * 0.05 + fx * 0.25, D - 0.05, u], 0.04, 6));
    add(ROPE, lathe([[0.065, 0], [0.065, 0.06]], 6, null, fx, fy + 0.05, u));
  }
  const Lf = L * 0.8;
  add('wood_dark', lathe([[0.001, 0], [0.1, 0.25], [0.1, Lf - 0.25], [0.001, Lf]], 7).rotateX(Math.PI / 2).translate(fx, fy, -Lf / 2));
  // a platform of poles over the booms
  for (let k = 0; k < 4; k++) add('palm_trunk', rod([-side * 0.2, D + 0.04, -L * 0.2 + k * L * 0.13], [fx * 0.55, D - 0.1, -L * 0.2 + k * L * 0.13], 0.03, 5));
  // thwarts
  for (const u of [-L * 0.28, 0, L * 0.28]) { const b = beam(u); add('timber', box(-b + 0.04, sheer(u) - 0.12, u - 0.05, b - 0.04, sheer(u) - 0.05, u + 0.05)); }
  if (!el.afloat) for (let k = 0; k < 3; k++) { const u = -0.7 + k * 0.7; add('timber', box(-0.9, D * 0.55, u - 0.05, 0.1, D * 0.55 + 0.03, u + 0.05)); add('timber', box(0.1, D * 0.55, u - 0.1, 0.55, D * 0.55 + 0.03, u + 0.1)); }
  col?.segment([x - Math.sin(yaw) * L / 2, z - Math.cos(yaw) * L / 2], [x + Math.sin(yaw) * L / 2, z + Math.cos(yaw) * L / 2], B, y0, y0 + D);
}
const ROPE = 'rope_fibre';
