// The Athena Promachos of Pheidias (docs/settlements/athens.md §4b, §4g), the bronze that stood between the Propylaia and the
// Erechtheion, about 9 m with her base and so the first thing of the Acropolis a ship at sea could see: Athena
// standing armed, in the peplos with its overfold, the aegis, the crested helmet; the spear upright in her right hand, her
// left hand on the shield that stands at her side with the Centauromachy on it (Pausanias 1.28.2; the figure after the
// copies). Built with the figure kit (buildings/parthenon/figures.js); the base of three courses carries the dedication.
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import '../../styles/greek/index.js';
import { relief } from '../../styles/greek/sculpture.js';
import { merge } from '../../styles/greek/columns.js';
import { peplosFigure, placeFigure, loft, limb, blob } from '../../buildings/parthenon/figures.js';

const UP = new Vector3(0, 1, 0);
const row = (y, cx, cz, rx, rz = rx) => ({ y, cx, cz, rx, rz });

function athensPromachos(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, h = el.h ?? 7.4, b = el.base ?? 1.7, yaw = el.yaw ?? -Math.PI / 2;
  // ── the base: three courses on a stepped foot, the die with the dedication cut along it, a crown moulding
  const mat = 'marble', st = [];
  st.push(box(-2.5, 0, -2.5, 2.5, 0.3, 2.5), box(-2.25, 0.3, -2.25, 2.25, 0.55, 2.25), box(-2.0, 0.55, -2.0, 2.0, 0.78, 2.0));
  st.push(box(-1.85, 0.78, -1.85, 1.85, b - 0.3, 1.85), box(-1.95, b - 0.3, -1.95, 1.95, b - 0.2, 1.95), box(-2.05, b - 0.2, -2.05, 2.05, b, 2.05));
  const dk = [];
  for (let i = 0; i < 18; i++) dk.push(box(-1.5 + i * 0.17, b - 0.62, 1.85, -1.5 + i * 0.17 + 0.08, b - 0.5, 1.865));      // the letters of the dedication
  // ── the goddess, in bronze
  const fig = peplosFigure({ weight: 'r', hair: 'long', helmet: true, n: 16, folds: 16,
    arms: { r: [[-0.16, 0.66, 0.03], [-0.17, 0.79, 0.09]], l: [[0.15, 0.62, 0.02], [0.195, 0.5, 0.085]] } });
  const body = placeFigure(fig, h, 0, b, 0);
  const bronze = [body.cloth, body.skin, body.hair, body.trim, body.metal].filter(Boolean);
  const H = h;
  // the aegis over the breast, scaled, with its fringe
  bronze.push(loft([row(0.805, 0, 0, 0.115, 0.07), row(0.78, 0, 0.004, 0.136, 0.07), row(0.735, 0, 0.012, 0.126, 0.084), row(0.69, 0, 0.018, 0.12, 0.09), row(0.665, 0, 0.02, 0.116, 0.092)], 64,
    (th, y) => 1.0 + 0.016 * (Math.cos(30 * th + 60 * y) + Math.cos(30 * th - 60 * y)) * 0.5, 2).applyMatrix4(new Matrix4().makeScale(H, H, H).setPosition(0, b, 0)));
  const sn = [];
  for (let k = 0; k < 24; k++) {
    const th = Math.PI * (0.05 + 1.9 * k / 24), xx = Math.cos(th) * 0.12, zz = Math.sin(th) * 0.09 + 0.02;
    if (Math.sin(th) < -0.1) continue;
    sn.push(limb([xx * H, b + 0.668 * H, zz * H], [(xx * 1.06 + Math.cos(k) * 0.008) * H, b + (0.635 - (k % 3) * 0.008) * H, zz * 1.05 * H], 0.0065 * H, 0.004 * H, 4));
  }
  sn.push(blob([0, b + 0.73 * H, 0.108 * H], 0.036 * H, [1, 1.05, 0.5], 8));
  // the spear, upright in her right hand, its butt on the ground behind
  const hand = [-0.17 * H, b + 0.79 * H, 0.09 * H];
  sn.push(rod([hand[0], b + 0.05, hand[2]], [hand[0] + 0.05, b + 1.28 * H, hand[2]], 0.07, 8), limb([hand[0] + 0.05, b + 1.28 * H, hand[2]], [hand[0] + 0.052, b + 1.28 * H + 0.55, hand[2]], 0.12, 0.01, 6));
  // the shield: standing on its rim at her left, her hand on it; the Centauromachy in relief
  const R = 1.2, n = new Vector3(0.3, 0.12, 0.95).normalize();
  const topDir = UP.clone().sub(n.clone().multiplyScalar(n.y)).normalize();
  const handL = new Vector3(0.2 * H, b + 0.495 * H - 0.05, 0.085 * H);
  const centre = handL.clone().sub(topDir.clone().multiplyScalar(R * 0.995));
  const place = new Matrix4().compose(centre, new Quaternion().setFromUnitVectors(UP, n), new Vector3(1, 1, 1));
  const sh = [lathe([[0.001, 0.1], [0.15, 0.095], [0.33, 0.07], [R * 0.45, 0.05], [R * 0.52, 0.03], [R * 0.9, 0.015], [R * 0.99, 0.0], [R * 0.99, -0.06], [R * 0.85, -0.03], [0.001, 0.0]], 48),
    lathe([[R * 0.9, 0.015], [R * 0.99, 0.0], [R, 0.0], [R, 0.05], [R * 0.985, 0.08], [R * 0.9, 0.05]], 48)];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, r = relief(k % 2 ? 'centaurR' : 'foe', k, { p: [0, 0, 0], u: [1, 0, 0], o: [0, 0, 1], s: 0.4, d: 0.06 });
    r.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2).premultiply(new Matrix4().makeTranslation(0, 0.03, -0.68)).premultiply(new Matrix4().makeRotationY(a)));
    sh.push(r);
  }
  sh.push(blob([0, 0.14, 0], 0.2, [1, 0.45, 1], 10));
  for (const g of sh) g.applyMatrix4(place);
  const all = [...bronze, ...sn, ...sh];
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z);
  const gStone = merge(st); gStone.applyMatrix4(m); bag.add(mat, gStone);
  if (dk.length) { const d = merge(dk); d.applyMatrix4(m); bag.add('bronze', d); }
  const gm = merge(all); gm.applyMatrix4(new Matrix4().makeRotationY(yaw).setPosition(x, y0, z)); bag.add('bronze', gm);
  col.rect([x - 2.5, z - 2.5, x + 2.5, z + 2.5], y0, y0 + b + h);
}
STYLES.greek.elements.athens_promachos = athensPromachos;
export default athensPromachos;
