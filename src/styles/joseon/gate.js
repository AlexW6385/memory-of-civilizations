// Gwanghwamun's stone base (docs/settlements/joseon-seoul.md §18): a high granite foundation with three arched
// ways (the king's in the middle, the civil and the military on either side), the vaults' ceilings carrying
// painted boards, each arch ringed with its voussoirs and a keystone, the base's outer ends battered, a
// coping at the top under the gate hall.

import { fromTriangles, frustum, box, orientOutward } from '../../core/geom.js';

/** A convex prism from a quad (x, y pairs) extruded in z between za and zb. */
function quadPrism(q, za, zb) {
  const t = [];
  t.push(q[0][0], q[0][1], za, q[1][0], q[1][1], za, q[2][0], q[2][1], za, q[0][0], q[0][1], za, q[2][0], q[2][1], za, q[3][0], q[3][1], za);
  t.push(q[0][0], q[0][1], zb, q[1][0], q[1][1], zb, q[2][0], q[2][1], zb, q[0][0], q[0][1], zb, q[2][0], q[2][1], zb, q[3][0], q[3][1], zb);
  for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4]; t.push(a[0], a[1], za, b[0], b[1], za, b[0], b[1], zb, a[0], a[1], za, b[0], b[1], zb, a[0], a[1], zb); }
  return orientOutward(t);
}

/**
 * gate_base: { rect: [x0, z0, x1, z1], y1 (the top, where the gate hall stands), ways: [[centre x, half-width, rise], …] left to right,
 * spring (where the arches spring), mat }. Colliders: the piers and the ends solid, the way open to the lintel course at 4.8 m.
 */
export function gateBase(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, top = el.y1 ?? 7, spring = el.spring ?? 3.6, g = el.mat ?? el.pal?.base ?? 'granite_korea';
  const ways = el.ways ?? [[-8, 2.8, 2.4], [0, 3, 2.6], [8, 2.8, 2.4]], lintel = 4.8, crown = Math.max(...ways.map((w) => spring + w[2])) + 0.0, yc = Math.ceil(crown * 10) / 10;
  const xl = ways[0][0] - ways[0][1], xr = ways[ways.length - 1][0] + ways[ways.length - 1][1], bt = el.batter ?? 0.6;
  // the ends (battered outward) and the piers between the ways, the courses above the crowns
  bag.add(g, frustum([x0, z0, xl, z1], 0, top, bt, 0, 0, 0, { noBottom: true }));
  bag.add(g, frustum([xr, z0, x1, z1], 0, top, 0, bt, 0, 0, { noBottom: true }));
  col.rect([x0, z0, xl, z1], 0, top); col.rect([xr, z0, x1, z1], 0, top);
  for (let i = 0; i + 1 < ways.length; i++) {
    const a = ways[i][0] + ways[i][1], b = ways[i + 1][0] - ways[i + 1][1];
    bag.add(g, box(a, 0, z0, b, yc, z1)); col.rect([a, z0, b, z1], 0, top);
  }
  bag.add(g, box(xl, yc, z0, xr, top - 0.22, z1));
  col.rect([xl, z0, xr, z1], lintel, top);
  col.floor([x0 + bt, z0, x1 - bt, z1], top);
  bag.add(g, box(x0 + bt - 0.1, top - 0.22, z0 - 0.14, x1 - bt + 0.1, top, z1 + 0.14));                 // the coping, overhanging the faces
  bag.add(g, box(x0 + bt - 0.1, top - 0.34, z0 - 0.06, x1 - bt + 0.1, top - 0.22, z1 + 0.06));        // the course under it
  const arch = (w, dx) => w[2] * Math.sqrt(Math.max(0, 1 - (dx / w[1]) ** 2));
  for (const w of ways) {
    const [c, hw] = w, N = 14, xs = Array.from({ length: N + 1 }, (_, k) => c - hw + 2 * hw * k / N), ya = xs.map((x) => spring + arch(w, x - c));
    const fill = [], soffit = [];
    for (let k = 0; k < N; k++) {
      const a = [xs[k], ya[k]], b = [xs[k + 1], ya[k + 1]];
      for (const [z, s] of [[z0, -1], [z1, 1]]) {
        if (s > 0) fill.push(a[0], a[1], z, b[0], b[1], z, b[0], yc, z, a[0], a[1], z, b[0], yc, z, a[0], yc, z);
        else fill.push(a[0], a[1], z, b[0], yc, z, b[0], b[1], z, a[0], a[1], z, a[0], yc, z, b[0], yc, z);
      }
      soffit.push(a[0], a[1], z0, b[0], b[1], z0, b[0], b[1], z1, a[0], a[1], z0, b[0], b[1], z1, a[0], a[1], z1);
    }
    // (the piers' sides under the spring are their own faces; the arch's soffit is drawn from both sides so that it reads from inside)
    bag.add(g, fromTriangles(fill)); bag.add(g, fromTriangles(soffit.concat(flipT(soffit))));
    // the ring of voussoirs on each face: wedges between the arch's curve and a larger one, a taller keystone
    const nv = 13, ring = (th) => [c + Math.cos(th) * hw, spring + Math.sin(th) * w[2]], out = (th, e) => [c + Math.cos(th) * (hw + e), spring + Math.sin(th) * (w[2] + e)];
    for (let k = 0; k < nv; k++) {
      const t0 = Math.PI * k / nv, t1 = Math.PI * (k + 1) / nv, key = k === (nv - 1) / 2, e = key ? 0.44 : 0.36, gap = 0.012;
      const q = [out(t0 + gap, 0), out(t1 - gap, 0), out(t1 - gap, e), out(t0 + gap, e)];
      void ring;
      for (const [z, s] of [[z0, -1], [z1, 1]]) bag.add(g, fromTriangles(quadPrism(q, z, z + s * 0.1)));
    }
    // the ceiling's painted board (the king's way carries the pair of phoenixes, the others the dragon-horse and the turtle) under the crown
    const yp = spring + w[2] - 0.2;
    bag.add('paint_dancheong', box(c - 0.8, yp, z0 + 0.4, c + 0.8, yp + 0.22, z1 - 0.4));
    for (const z of [z0 + 3.8, z1 - 3.8]) { bag.add('lacquer_red', box(c - 0.45, yp - 0.012, z - 0.65, c + 0.45, yp, z + 0.65)); bag.add('paint_ochre', box(c - 0.22, yp - 0.024, z - 0.35, c + 0.22, yp - 0.012, z + 0.35)); }
  }
}
function flipT(t) { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; }

export const GATE = { gate_base: gateBase };
