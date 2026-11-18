// The bronze doors of Hagia Sophia, seen close (docs/settlements/constantinople.md §4.9, §4.11): two leaves of cedar sheathed in bronze, standing open
// inward against the reveals as the church's earlier `doors` did, but with the face of each leaf worked: a grid of panels, each in a raised moulded
// frame with a gilt boss in a recessed field, gilt straps across the joints between the rows (the incised ornament "imitating metal straps": pallasweb),
// and on the upper panels of the great doors the cruciform monogram of Justinian or Theodora in bevelled relief. [stated: bronze-covered doors with gilt
// strap ornament; inferred: the grid, the bosses, the monograms]
import { Matrix4 } from '../../core/three.js';
import { box, fromTriangles } from '../../core/geom.js';
import { merge } from '../../styles/greek/columns.js';
import { hexa } from '../../styles/chinese/index.js';
import { bevelBar, bevelDisc, monogram, jit } from './carve.js';

const frame = (o, u, n) => (uu, y, d) => [o[0] + u[0] * uu + n[0] * d, y, o[1] + u[1] * uu + n[1] * d];

/** { at, y, yaw, w, h, th, depth }: the same placing as the plain `doors`; local x across the opening, local z into the building. */
export function hsDoors(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const W = el.w, H = el.h, T = el.th ?? 0.2, depth = el.depth ?? 0.1, leaf = W / 2, big = W > 3;
  const wood = [], bronze = [], gilt = [];
  for (const s of [-1, 1]) {
    wood.push(box(s * W / 2 - (s > 0 ? T : 0), 0, depth, s * W / 2 + (s < 0 ? T : 0), H, depth + leaf));
    const x0 = s > 0 ? W / 2 - T : -W / 2 + T, F = frame([x0, 0], [0, 1], [-s, 0]);          // the leaf's inner face, its normal toward the middle of the opening
    const u0 = depth + 0.12, u1 = depth + leaf - 0.12, nc = leaf > 1.6 ? 2 : 1, nr = Math.max(3, Math.round(H / (big ? 1.15 : 1.25))), pH = (H - 0.5) / nr, pW = (u1 - u0) / nc;
    hexa(bronze, [F(u0 - 0.04, 0.1, 0), F(u1 + 0.04, 0.1, 0), F(u1 + 0.04, 0.1, 0.012), F(u0 - 0.04, 0.1, 0.012)], [F(u0 - 0.04, H - 0.1, 0), F(u1 + 0.04, H - 0.1, 0), F(u1 + 0.04, H - 0.1, 0.012), F(u0 - 0.04, H - 0.1, 0.012)]);   // the sheet
    for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) {
      const pu0 = u0 + c * pW + 0.07, pu1 = u0 + (c + 1) * pW - 0.07, pv0 = 0.25 + r * pH + 0.06, pv1 = 0.25 + (r + 1) * pH - 0.06, um = (pu0 + pu1) / 2, vm = (pv0 + pv1) / 2;
      const j = jit(x + s * 3 + c, z + r, 2, 0.006), d0 = 0.012, d1 = 0.045 + j, fw = 0.06;
      bevelBar(bronze, F, pu0, pv0, pu1, pv0, fw, d0, d1); bevelBar(bronze, F, pu0, pv1, pu1, pv1, fw, d0, d1);
      bevelBar(bronze, F, pu0, pv0, pu0, pv1, fw, d0, d1); bevelBar(bronze, F, pu1, pv0, pu1, pv1, fw, d0, d1);
      const upper = r >= nr - 2;
      if (big && upper) monogram(gilt, F, um, vm, Math.min(pu1 - pu0, pv1 - pv0) * 0.36, 0.014, 0.04, (c + r + (s > 0 ? 1 : 0)) % 2 ? 'T' : 'J', true);
      else bevelDisc(gilt, F, um, vm, Math.min(pu1 - pu0, pv1 - pv0) * 0.2, 0.012, 0.05 + j, big ? 8 : 6);
    }
    for (let r = 1; r < nr; r++) bevelBar(gilt, F, u0 - 0.02, 0.25 + r * pH, u1 + 0.02, 0.25 + r * pH, 0.045, 0.012, 0.03);       // the straps across the joints
    bevelBar(gilt, F, u0 - 0.02, 0.25, u1 + 0.02, 0.25, 0.06, 0.012, 0.03); bevelBar(gilt, F, u0 - 0.02, H - 0.25, u1 + 0.02, H - 0.25, 0.06, 0.012, 0.03);
  }
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  const g = fromTriangles(bronze).applyMatrix4(m); bag.add('bronze', g);
  const g2 = fromTriangles(gilt).applyMatrix4(m); bag.add('gilt_bronze', g2);
  { const g3 = merge(wood); g3.applyMatrix4(m); bag.add('cedar', g3); }
  const c = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw));
  for (const s of [-1, 1]) {
    const lx0 = s * W / 2 - (s > 0 ? T : 0), lx1 = s * W / 2 + (s < 0 ? T : 0);
    const pts = [[lx0, depth], [lx1, depth + leaf]].map(([u, v]) => [x + c * u + sn * v, z - sn * u + c * v]);
    col.rect([Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])], y, y + H);
  }
}
