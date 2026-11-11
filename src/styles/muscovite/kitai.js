// The wall of Kitai-gorod (docs/settlements/muscovy.md §5.4): the brick wall Peter Fryazin built round the great trading
// posad in 1535–38, about 6.5 m high and 3.5 m thick, with swallowtail merlons, square towers with wooden tent roofs and the
// gate towers with their vaulted passages. An open polyline of straight lengths, not a closed ring.

import { orientedBox } from '../../core/build.js';
import { box } from '../../core/geom.js';
import { Shape } from '../../core/three.js';
import { slab, pyr } from '../norse/index.js';

const BR = 'brick_kremlin', WS = 'limestone';
let SW = null;
function swallow() {
  if (SW) return SW;
  const s = new Shape(); s.moveTo(0, 0); s.lineTo(1.4, 0); s.lineTo(1.4, 1.55); s.lineTo(0.7, 1.05); s.lineTo(0, 1.55); s.lineTo(0, 0);
  return (SW = s);
}
/**
 * kitai_wall: { pts: [[x, z], …], h, th, y (fn of x, z), every (metres between towers), gates: [[segment, t], …] } — the wall with a tower at each
 * vertex and along the lengths, and at each gate a tower with its passage.
 */
export function kitaiWall(el, { bag, col }) {
  const pts = el.pts, h = el.h ?? 6.5, th = el.th ?? 3.5, yf = el.y ?? (() => 0), every = el.every ?? 60, gates = el.gates ?? [];
  const tower = (x, z, gate, ux, uz) => {
    const r = gate ? 5.2 : 3.9, yy = yf(x, z), H = h + (gate ? 10 : 5.5);
    if (gate) {
      // the body round a passage (along the line's normal), vaulted over
      const g = 2.3, gh = yy + 4.4, ax = Math.abs(uz) > Math.abs(ux);       // wall runs along z: the passage along x
      const Bx = (a0, a1, b0, b1, y0, y1) => (ax ? box(x + a0, y0, z + b0, x + a1, y1, z + b1) : box(x + b0, y0, z + a0, x + b1, y1, z + a1));
      const Rx = (a0, a1, b0, b1) => (ax ? [x + a0, z + b0, x + a1, z + b1] : [x + b0, z + a0, x + b1, z + a1]);
      bag.add(BR, Bx(-r, r, -r, -g, yy - 3, yy - 3 + H)); bag.add(BR, Bx(-r, r, g, r, yy - 3, yy - 3 + H)); bag.add(BR, Bx(-r, r, -g, g, gh, yy - 3 + H));
      col.rect(Rx(-r, r, -r, -g), yy - 3, yy - 3 + H); col.rect(Rx(-r, r, g, r), yy - 3, yy - 3 + H); col.rect(Rx(-r, r, -g, g), gh, yy - 3 + H);
      for (const e of [-1, 1]) { bag.add(WS, Bx(e * r - 0.12, e * r + 0.12, -g - 0.4, -g, yy - 3, gh + 0.4)); bag.add(WS, Bx(e * r - 0.12, e * r + 0.12, g, g + 0.4, yy - 3, gh + 0.4)); bag.add(WS, Bx(e * r - 0.12, e * r + 0.12, -g, g, gh, gh + 0.4)); }
    } else { bag.add(BR, box(x - r, yy - 3, z - r, x + r, yy - 3 + H, z + r)); col.rect([x - r, z - r, x + r, z + r], yy - 3, yy - 3 + H); }
    bag.add(WS, box(x - r - 0.3, yy - 3 + H - 0.5, z - r - 0.3, x + r + 0.3, yy - 3 + H, z + r + 0.3));                       // the white cornice
    for (const sg of [-1, 1]) { bag.add('opening', box(x + sg * r * 0.4 - 0.12, yy + H * 0.45, z - r - 0.02, x + sg * r * 0.4 + 0.12, yy + H * 0.45 + 1.1, z - r + 0.02)); bag.add('opening', box(x + sg * r * 0.4 - 0.12, yy + H * 0.45, z + r - 0.02, x + sg * r * 0.4 + 0.12, yy + H * 0.45 + 1.1, z + r + 0.02)); }
    bag.add('planks_grey', pyr(x, z, r + 1.0, yy - 3 + H, 0.2, yy - 3 + H + (gate ? 12 : 8)));                                // the wooden tent
    bag.add('iron', box(x - 0.04, yy - 3 + H + (gate ? 11.5 : 7.5), z - 0.04, x + 0.04, yy - 3 + H + (gate ? 13.4 : 9.4), z + 0.04));
  };
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    // the outside: the side away from the Kremlin (+x/−z of the line in this layout)
    let o = [uz, -ux]; if (o[0] * 1 + o[1] * -1 < 0) o = [-o[0], -o[1]];
    const gate = gates.filter(([gi]) => gi === i).map(([, t]) => t).sort(), segs = [];
    let t0 = 0;
    for (const t of gate) { segs.push([t0, t - 4.4 / L]); t0 = t + 4.4 / L; }
    segs.push([t0, 1]);
    for (const [s0, s1] of segs) {
      const n = Math.max(1, Math.round((s1 - s0) * L / 6));
      for (let k = 0; k < n; k++) {
        const ta = s0 + (s1 - s0) * k / n, tb = s0 + (s1 - s0) * (k + 1) / n, pa = [a[0] + ux * L * ta, a[1] + uz * L * ta], pb = [a[0] + ux * L * tb, a[1] + uz * L * tb], yy = Math.min(yf(...pa), yf(...pb));
        bag.add(BR, orientedBox(pa, pb, th, yy - 3, yy + h, 0.05)); col.segment(pa, pb, th, yy - 3, yy + h);
        bag.add(WS, orientedBox(pa, pb, th + 0.3, yy + h - 0.35, yy + h, 0.05));                                              // the white coping course
        const sl = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]), m = Math.max(1, Math.floor(sl / 2.4)), st = sl / m;
        for (let q = 0; q < m; q++) {
          const u0 = q * st + (st - 1.4) / 2, p0 = [pa[0] + ux * u0 + o[0] * (th / 2 - 0.3), pa[1] + uz * u0 + o[1] * (th / 2 - 0.3)], p1 = [p0[0] + ux * 1.4, p0[1] + uz * 1.4];
          bag.add(BR, slab(swallow(), 0.55, p0, p1, yy + h, 1));
        }
        bag.add(BR, orientedBox([pa[0] - o[0] * (th / 2 - 0.15), pa[1] - o[1] * (th / 2 - 0.15)], [pb[0] - o[0] * (th / 2 - 0.15), pb[1] - o[1] * (th / 2 - 0.15)], 0.3, yy + h, yy + h + 0.9, 0.05));   // the low parapet on the town's side
      }
    }
    if (i === 0) tower(a[0], a[1], false, ux, uz);
    tower(b[0], b[1], false, ux, uz);
    const nt = Math.round(L / every);
    for (let k = 1; k < nt; k++) { const t = k / nt; if (gate.some((g) => Math.abs(g - t) * L < 12)) continue; tower(a[0] + ux * L * t, a[1] + uz * L * t, false, ux, uz); }
    for (const t of gate) tower(a[0] + ux * L * t, a[1] + uz * L * t, true, ux, uz);
  }
}
