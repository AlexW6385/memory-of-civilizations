// The sunk reliefs of a pylon's front (docs/settlements/thebes.md §14): in each field clear of the flagstaff niches the king smiting the captives he holds by
// the hair before Amun, a continuous modelled surface cut into the face with its colours; over it, registers of the king offering to the seated gods.
// `res` is the cells' fineness: 1 makes a cell a fortieth of the king's height.
import { relief } from './relief.js';
import { smiteScene, offerScene } from './scenes.js';
import { Parts } from './sculpt.js';

/** Shapes drawn in scene units, set on the panel: the scene's origin at (ox, v0), mirrored when the king walks toward -x. */
const setShapes = (shapes, ox, v0, dir) => shapes.map((s) => ({
  ...s,
  sd: (uu, vv) => s.sd(dir > 0 ? uu - ox : ox - uu, vv - v0),
  bb: dir > 0 ? [s.bb[0] + ox, s.bb[1] + v0, s.bb[2] + ox, s.bb[3] + v0] : [ox - s.bb[2], s.bb[1] + v0, ox - s.bb[0], s.bb[3] + v0],
}));

/** nk_pylon_relief: { x0, x1 (the tower's free span), z (its front's base), h, b (the batter), y0, dirIn (+1: the king walks toward +x), niches: [x…], res } */
export function pylonRelief(el, { bag }) {
  const { x0, x1, h, b } = el, z = el.z, y0 = el.y0 ?? 0, dirIn = el.dirIn ?? 1, res = el.res ?? 1, P = new Parts();
  const pos = (u, v) => [u, y0 + v, z - b * v / h], len = Math.hypot(b / h, 1), nrm = () => [0, (b / h) / len, 1 / len];
  const blocks = []; let u = x0;
  for (const n of (el.niches ?? [])) { if (n - 1.4 - u > 4) blocks.push([u, n - 1.4]); u = n + 1.4; }
  if (x1 - u > 4) blocks.push([u, x1]);
  const lay = (sc, ox, v0, cell, sink) => {
    const u0 = Math.min(ox, ox + dirIn * sc.w) - 0.2, u1 = Math.max(ox, ox + dirIn * sc.w) + 0.2;
    const m = relief({ u0, u1, v0: v0 - 0.3, v1: v0 + sc.h + 0.2, cell, pos, nrm, shapes: setShapes(sc.shapes, ox, v0, dirIn), field: 'sandstone_relief', frame: 'sandstone', off: 0.1, sink, planar: true });
    for (const [mat, g] of m) P.add(mat, g);
  };
  for (const [a, c] of blocks) {
    const w = c - a - 0.8, S = Math.min(h * 0.3, w / 1.8), v0 = h * 0.07, sc = smiteScene(S);
    lay(sc, dirIn > 0 ? a + 0.4 : c - 0.4, v0, Math.max(0.06, S / (40 * res)), 0.012 * S + 0.02);
    // over it, registers of the king offering to a seated god, up to the torus
    const r0 = v0 + sc.h + 0.9, r1 = h - 1.6, rows = Math.max(0, Math.floor((r1 - r0) / Math.min(8.4, w * 0.9)));
    if (rows < 1) continue;
    const rh = (r1 - r0) / rows, S2 = Math.min(rh / 1.15, 7.4), per = Math.max(1, Math.floor(w / (S2 * 1.15))), pw = w / per;
    for (let j = 0; j < rows; j++) for (let i = 0; i < per; i++) {
      const o = offerScene(S2, dirIn < 0), cx = a + 0.4 + (i + 0.5) * pw - o.w / 2;
      lay(o, dirIn > 0 ? cx : cx + o.w, r0 + j * rh, Math.max(0.05, S2 / (30 * res)), 0.012 * S2 + 0.018);
    }
  }
  P.emit(bag);
}
