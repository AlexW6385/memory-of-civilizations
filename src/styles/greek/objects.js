// Greek fittings and sculpture: door frames and bronze-clad doors, the shallow water basin
// before the cult statue, and the Athena Parthenos of Pheidias (docs/buildings/parthenon.md §8).

import { Matrix4 } from '../../core/three.js';
import { box, lathe, rod, disc, place } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { merge } from './columns.js';
import { human, limb, blob, relief } from './sculpture.js';

/** Door frame for an opening in a Greek wall: jambs and lintel in three fasciae, a crowning cornice. */
export function opening(el, o, f, { bag }) {
  if (o.frame === false) return;
  const mat = el.mat || 'marble';
  const nx = -f.uz, nz = f.ux;
  const sill = o.y0, top = o.y0 + o.h;
  const fw = o.frameW ?? Math.min(0.75, o.w * 0.14);
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const proj = 0.04 + k * 0.035, w = fw * (1 - k * 0.28);
      const off = side * (el.th / 2 + proj / 2);
      const c = (s) => [f.ax + f.ux * s + nx * off, f.az + f.uz * s + nz * off];
      bag.add(mat, orientedBox(c(o.s0 - w), c(o.s0), proj, sill, top + w));
      bag.add(mat, orientedBox(c(o.s1), c(o.s1 + w), proj, sill, top + w));
      bag.add(mat, orientedBox(c(o.s0 - w), c(o.s1 + w), proj, top, top + w));
    }
    // the hyperthyron: a cornice slab over the frame
    const off2 = side * (el.th / 2 + 0.16);
    const c2 = (s) => [f.ax + f.ux * s + nx * off2, f.az + f.uz * s + nz * off2];
    bag.add(mat, orientedBox(c2(o.s0 - fw - 0.25), c2(o.s1 + fw + 0.25), 0.32, top + fw, top + fw + 0.32));
  }
}

/** A pair of tall doors of wood sheathed in bronze, standing open inward against the reveals. */
export function doors(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const W = el.w, H = el.h, T = el.th ?? 0.2, depth = el.depth ?? 0.1, leaf = W / 2;
  const wood = [], bronze = [];
  for (const s of [-1, 1]) {
    wood.push(box(s * W / 2 - (s > 0 ? T : 0), 0, depth, s * W / 2 + (s < 0 ? T : 0), H, depth + leaf));
    // bronze panels in a grid on the inner face, with bosses
    for (let r = 0; r < 4; r++) {
      const y0 = 0.4 + r * (H - 0.8) / 4, y1 = y0 + (H - 0.8) / 4 - 0.25;
      const xf = s * W / 2 - (s > 0 ? T + 0.03 : -T);
      bronze.push(box(Math.min(xf, xf + 0.03), y0, depth + 0.15, Math.max(xf, xf + 0.03), y1, depth + leaf - 0.15));
    }
  }
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  for (const [list, mat] of [[wood, 'cedar'], [bronze, 'bronze']]) { const g = merge(list); g.applyMatrix4(m); bag.add(mat, g); }
  const c = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw));
  for (const s of [-1, 1]) {
    const lx0 = s * W / 2 - (s > 0 ? T : 0), lx1 = s * W / 2 + (s < 0 ? T : 0);
    const pts = [[lx0, depth], [lx1, depth + leaf]].map(([u, v]) => [x + c * u + sn * v, z - sn * u + c * v]);
    col.rect([Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])], y, y + H);
  }
}

/** Shallow basin of water with a marble curb, set into the floor. */
export function basin(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, c = el.curb ?? 0.25, h = el.h ?? 0.18;
  const mat = el.mat || 'marble_dark';
  bag.add(mat, box(x0, y, z0, x1, y + h, z0 + c));
  bag.add(mat, box(x0, y, z1 - c, x1, y + h, z1));
  bag.add(mat, box(x0, y, z0 + c, x0 + c, y + h, z1 - c));
  bag.add(mat, box(x1 - c, y, z0 + c, x1, y + h, z1 - c));
  bag.add(mat, box(x0 + c, y - 0.05, z0 + c, x1 - c, y + 0.02, z1 - c));
  bag.add('water', box(x0 + c, y + 0.02, z0 + c, x1 - c, y + h - 0.04, z1 - c));
  col.rect([x0, z0, x1, z1], y, y + h);
}

/**
 * Athena Parthenos (Pheidias, 438 BC), gold and ivory, about 11.5 m high, on its pedestal (8.043 × 4.096 m;
 * docs/buildings/parthenon.md §8, docs/settlements/athens.md §4c). She stands frontally, her weight on the right leg,
 * in the peplos falling in deep folds, with the overfold and belt; the aegis with the gorgoneion on her breast; the
 * Attic helmet with its three crests; on her right hand a Nike about 1.8 m tall, winged, holding out a wreath (the
 * hand supported by a column, as in the reduced copies); her left hand on the rim of the shield that rests on the
 * ground at her side, the serpent coiled within it; the spear against her left shoulder. Drapery, helmet, aegis,
 * shield and Nike in gold; face, arms and feet in ivory. The pedestal's front carries the birth of Pandora, figures
 * in a row in gilt relief. Local: facing +z, pedestal centred at the origin.
 */
export function athenaParthenos(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const PW = 8.043, PD = 4.096, PH = el.pedestal ?? 1.2;
  const gold = [], ivory = [], stone = [];
  // pedestal: plinth, die, crown moulding; the birth of Pandora in relief across the front
  stone.push(box(-PW / 2, 0, -PD / 2, PW / 2, 0.22, PD / 2));
  stone.push(box(-PW / 2 + 0.12, 0.22, -PD / 2 + 0.12, PW / 2 - 0.12, PH - 0.2, PD / 2 - 0.12));
  stone.push(box(-PW / 2 + 0.02, PH - 0.2, -PD / 2 + 0.02, PW / 2 - 0.02, PH, PD / 2 - 0.02));
  for (let i = 0; i < 20; i++) {
    const kind = i === 10 ? 'maiden' : ['walker', 'maiden', 'god', 'maiden'][i % 4];
    gold.push(relief(kind, i, { p: [-PW / 2 + 0.45 + i * (PW - 0.9) / 19, 0.26, PD / 2 - 0.12 + 0.002], u: [1, 0, 0], o: [0, 0, 1], s: 0.68, d: 0.03, flip: i > 10 }));
  }
  const F = PH, H = 10.6;
  // the goddess (the shield arm and the Nike arm set by hand)
  const fig = human({ pose: 'ease', drape: 'peplos', h: H, n: 14, skin: true,
    arms: { l: [[-0.15, 0.645, 0.05], [-0.16, 0.62, 0.21]], r: [[0.165, 0.62, 0.0], [0.215, 0.462, 0.02]] } });
  const at = (list, dx = 0, dy = F, dz = 0) => list.map((g) => g.translate(dx, dy, dz));
  gold.push(...at(fig.stone)); ivory.push(...at(fig.skin));
  // the aegis: a scaly cape over the breast and shoulders, the gorgoneion at its centre
  const aegis = lathe([[1.0, 0], [1.04, 0.45], [0.92, 0.9], [0.5, 1.12], [0.001, 1.15]], 40, (th) => 1 + 0.04 * Math.cos(th * 30));
  aegis.applyMatrix4(new Matrix4().makeScale(1.05, 1, 0.78).setPosition(0, F + 0.66 * H, 0.02));
  gold.push(aegis);
  ivory.push(place(disc(0.24, 0, 20), 0, 0, 0).applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2).setPosition(0, F + 0.745 * H, 0.82)));
  // the Attic helmet: the bowl, the raised cheek-pieces, the three crests (a sphinx between two winged horses)
  const hc = [0, F + 0.915 * H, 0.05 * H * 0.1];
  gold.push(lathe([[0.001, 0], [0.5, 0.0], [0.55, 0.32], [0.5, 0.62], [0.001, 0.78]], 24, null, hc[0], hc[1] - 0.1, hc[2] - 0.04));
  gold.push(box(-0.52, hc[1] - 0.08, 0.3, 0.52, hc[1] + 0.06, 0.55));
  for (const s of [-1, 1]) gold.push(box(s * 0.5 - 0.04, hc[1] - 0.45, -0.25, s * 0.5 + 0.04, hc[1] - 0.05, 0.3));
  for (const [cx, h] of [[0, 1.25], [-0.36, 0.9], [0.36, 0.9]]) { gold.push(box(cx - 0.07, hc[1] + 0.55, -0.6, cx + 0.07, hc[1] + 0.55 + h, 0.3)); gold.push(blob([cx, hc[1] + 0.55 + h * 0.75, 0.3], 0.16, [0.6, 1, 1.2], 8)); }
  // the Nike on her right palm (the hand forward), winged, the wreath held out; the column under the hand
  const hand = [-0.16 * H, F + 0.62 * H, 0.21 * H];
  const nk = human({ pose: 'ease', drape: 'peplos', h: 1.8, n: 8, arms: { r: [[0.15, 0.68, 0.06], [0.16, 0.78, 0.2]] } });
  gold.push(...at(nk.stone, hand[0], hand[1] + 0.05, hand[2] + 0.1), ...at(nk.metal, hand[0], hand[1] + 0.05, hand[2] + 0.1));
  for (const s of [-1, 1]) gold.push(limb([hand[0] + s * 0.12, hand[1] + 1.45, hand[2] + 0.02], [hand[0] + s * 0.75, hand[1] + 2.0, hand[2] - 0.35], 0.18, 0.06, 6), limb([hand[0] + s * 0.1, hand[1] + 1.3, hand[2] - 0.02], [hand[0] + s * 0.6, hand[1] + 1.4, hand[2] - 0.45], 0.14, 0.04, 6));
  gold.push(lathe([[0.16, 0], [0.13, 0.05], [0.16, 0.1], [0.13, 0.05]], 16, null, hand[0] + 0.3, hand[1] + 1.4, hand[2] + 0.45));
  stone.push(lathe([[0.32, 0], [0.32, 0.25], [0.26, 0.3], [0.24, hand[1] - F - 0.35], [0.34, hand[1] - F - 0.15], [0.36, hand[1] - F - 0.05], [0.001, hand[1] - F - 0.05]], 24, null, hand[0], F, hand[2]));
  // the shield (about 4.8 m), resting on its rim at her left, its outer face turned out; the serpent within (her left is at +x: she faces +z)
  const sh = lathe([[0.0, -0.06], [2.38, -0.16], [2.4, -0.1], [2.3, -0.02], [1.6, 0.06], [0.0, 0.12]], 48);
  sh.applyMatrix4(new Matrix4().makeRotationZ(-Math.PI / 2).premultiply(new Matrix4().makeRotationY(0.35)).setPosition(2.35, F + 2.42, 0.15));
  gold.push(sh);
  gold.push(blob([2.52, F + 2.42, 0.15 + 0.04], 0.28, [0.35, 1, 1], 10));                            // the boss, a gorgon's head
  const coil = [];
  for (let k = 0; k < 30; k++) {
    const a = k * 0.42, r = 0.5 + k * 0.025;
    coil.push(rod([1.95, F + 0.6 + r * Math.sin(a) * 0.8 + k * 0.03, 0.15 + r * Math.cos(a) * 0.9], [1.95, F + 0.6 + (r + 0.025) * Math.sin(a + 0.42) * 0.8 + (k + 1) * 0.03, 0.15 + (r + 0.025) * Math.cos(a + 0.42) * 0.9], 0.11, 8));
  }
  gold.push(...coil);
  // the spear, leaning against her left shoulder
  gold.push(rod([1.55, F, -0.4], [1.05, F + 11.0, -0.25], 0.06, 8));
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  for (const [list, mat] of [[gold, 'gold'], [ivory, 'ivory'], [stone, el.pedestalMat || 'marble_dark']]) {
    const g = merge(list);
    g.applyMatrix4(m);
    bag.add(mat, g);
  }
  const q = Math.round(yaw / (Math.PI / 2)) % 2 !== 0;
  const hw = (q ? PD : PW) / 2 + 0.1, hd = (q ? PW : PD) / 2 + 0.1;
  col.rect([x - hw, z - hd, x + hw, z + hd], y, y + PH + 10);
}
