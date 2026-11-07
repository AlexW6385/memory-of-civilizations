// The dance stage set up before the Great Buddha Hall for the eye-opening (docs/settlements/nara.md §10):
// a square platform of timber lacquered red, the dance floor spread with green silk, a low railing
// round it with gilt finials at the corners, open in the middle of the north and south sides where
// flights of steps come up.

import { box, lathe } from '../../core/geom.js';

/** bugaku_stage { c: [x, z], half (3.2), y (0), h (0.8) } */
export function bugakuStage(el, { bag, col }) {
  const [cx, cz] = el.c, a = el.half ?? 3.2, y = el.y ?? 0, h = el.h ?? 0.8, R = 'lacquer_red', top = y + h;
  const x0 = cx - a, x1 = cx + a, z0 = cz - a, z1 = cz + a, gap = 1.0;
  // the body: posts at the corners and every 1.6 m, a skirt of boards between them, set in under the floor's edge
  bag.add('lacquer_black', box(x0 + 0.12, y, z0 + 0.12, x1 - 0.12, top - 0.1, z1 - 0.12));
  const n = Math.round(2 * a / 1.6);
  for (let i = 0; i <= n; i++) for (const [px, pz] of [[x0 + i * 2 * a / n, z0], [x0 + i * 2 * a / n, z1], [x0, z0 + i * 2 * a / n], [x1, z0 + i * 2 * a / n]]) {
    const ix = Math.min(x1 - 0.1, Math.max(x0 + 0.1, px)), iz = Math.min(z1 - 0.1, Math.max(z0 + 0.1, pz));
    bag.add(R, box(ix - 0.1, y, iz - 0.1, ix + 0.1, top - 0.1, iz + 0.1));
  }
  // the floor: a frame of red beams, the boards, the green silk spread over them
  bag.add(R, box(x0 - 0.04, top - 0.1, z0 - 0.04, x1 + 0.04, top - 0.02, z1 + 0.04));
  bag.add('cloth_green', box(x0 + 0.2, top - 0.02, z0 + 0.2, x1 - 0.2, top + 0.005, z1 - 0.2));
  col.rect([x0, z0, x1, z1], y, top - 0.05);
  col.floor([x0, z0, x1, z1], top);
  // the railing: posts every metre or so, a top rail and a lower one, gilt onion finials on the corner posts
  const rail = (p, q) => {
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uz = (q[1] - p[1]) / L, m = Math.max(1, Math.round(L / 1.05));
    for (let i = 0; i <= m; i++) { const px = p[0] + ux * L * i / m, pz = p[1] + uz * L * i / m; bag.add(R, box(px - 0.05, top, pz - 0.05, px + 0.05, top + 0.62, pz + 0.05)); }
    const lo = (u) => [Math.min(p[0], q[0]) - u, Math.min(p[1], q[1]) - u, Math.max(p[0], q[0]) + u, Math.max(p[1], q[1]) + u];
    const [a0, b0, a1, b1] = lo(0.035);
    bag.add(R, box(a0, top + 0.55, b0, a1, top + 0.6, b1));
    bag.add(R, box(a0, top + 0.18, b0, a1, top + 0.22, b1));
    col.segment(p, q, 0.1, top, top + 0.62);
  };
  const e = 0.12;
  rail([x0 + e, z0 + e], [x0 + e, z1 - e]); rail([x1 - e, z0 + e], [x1 - e, z1 - e]);
  for (const zz of [z0 + e, z1 - e]) { rail([x0 + e, zz], [cx - gap, zz]); rail([cx + gap, zz], [x1 - e, zz]); }
  for (const [px, pz] of [[x0 + e, z0 + e], [x1 - e, z0 + e], [x0 + e, z1 - e], [x1 - e, z1 - e], [cx - gap, z0 + e], [cx + gap, z0 + e], [cx - gap, z1 - e], [cx + gap, z1 - e]]) {
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.06, 0], [0.075, 0.05], [0.06, 0.1], [0.025, 0.14], [0.001, 0.2]], 10, null, px, top + 0.62, pz));
  }
}
