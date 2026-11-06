// Southern Song Lin'an on the Qiantang (docs/settlements/song-hangzhou.md §10): the coloured
// curtained stands that the great houses put up along the river below the Liuhe Pagoda for the tide.

import { rod, fromTriangles } from '../../core/geom.js';
import { hexa } from './kaifeng.js';

/**
 * view_tent: a stand for watching the bore { at, y, w (along x), d (along z), h, cloth, trim, open ('s' |
 * 'n': the side toward the river) }: four poles and a ridge pole, a pitched cloth roof with a valance,
 * a curtain across the back and half curtains at the sides, open toward the water.
 */
function viewTent(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, w = (el.w ?? 4) / 2, d = (el.d ?? 3) / 2, h = el.h ?? 2.4, c = el.cloth ?? 'cloth_red', tr = el.trim ?? 'cloth_ochre';
  const sb = el.open === 'n' ? 1 : -1;                               // the back's side (z sign)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bag.add('timber', rod([x + sx * w, y, z + sz * d], [x + sx * w, y + h, z + sz * d], 0.05, 6)); col.circle(x + sx * w, z + sz * d, 0.08, y, y + h); }
  for (const sx of [-1, 1]) bag.add('timber', rod([x + sx * w, y + h, z], [x + sx * w, y + h + 0.9, z], 0.045, 6));
  bag.add('timber', rod([x - w - 0.15, y + h + 0.9, z], [x + w + 0.15, y + h + 0.9, z], 0.05, 6));
  // the roof: two slopes of cloth over the ridge, a little past the poles; the valance hanging round it
  const roof = [], val = [], cur = [], o = 0.25;
  for (const sz of [-1, 1]) {
    const a = [x - w - o, y + h + 0.9 + 0.03, z + sz * 0.02], b = [x + w + o, y + h + 0.9 + 0.03, z + sz * 0.02], e0 = [x + w + o, y + h - 0.12, z + sz * (d + o)], e1 = [x - w - o, y + h - 0.12, z + sz * (d + o)];
    hexa(roof, [[a[0], a[1] - 0.03, a[2]], [b[0], b[1] - 0.03, b[2]], [e0[0], e0[1] - 0.03, e0[2]], [e1[0], e1[1] - 0.03, e1[2]], a, b, e0, e1]);
    hexa(val, [[x - w - o, y + h - 0.42, z + sz * (d + o)], [x + w + o, y + h - 0.42, z + sz * (d + o)], [x + w + o, y + h - 0.42, z + sz * (d + o + 0.02)], [x - w - o, y + h - 0.42, z + sz * (d + o + 0.02)], [x - w - o, y + h - 0.1, z + sz * (d + o)], [x + w + o, y + h - 0.1, z + sz * (d + o)], [x + w + o, y + h - 0.1, z + sz * (d + o + 0.02)], [x - w - o, y + h - 0.1, z + sz * (d + o + 0.02)]]);
  }
  // the back curtain from the roof's edge to the ground, half curtains at the sides
  const zb = z + sb * (d + 0.06);
  hexa(cur, [[x - w, y, zb - 0.015], [x + w, y, zb - 0.015], [x + w, y, zb + 0.015], [x - w, y, zb + 0.015], [x - w, y + h - 0.15, zb - 0.015], [x + w, y + h - 0.15, zb - 0.015], [x + w, y + h - 0.15, zb + 0.015], [x - w, y + h - 0.15, zb + 0.015]]);
  for (const sx of [-1, 1]) { const xs = x + sx * (w + 0.06), z0 = z + sb * d, z1 = z; hexa(cur, [[xs - 0.015, y + 0.6, Math.min(z0, z1)], [xs + 0.015, y + 0.6, Math.min(z0, z1)], [xs + 0.015, y + 0.6, Math.max(z0, z1)], [xs - 0.015, y + 0.6, Math.max(z0, z1)], [xs - 0.015, y + h - 0.15, Math.min(z0, z1)], [xs + 0.015, y + h - 0.15, Math.min(z0, z1)], [xs + 0.015, y + h - 0.15, Math.max(z0, z1)], [xs - 0.015, y + h - 0.15, Math.max(z0, z1)]]); }
  bag.add(c, fromTriangles(roof)); bag.add(tr, fromTriangles(val)); bag.add(c, fromTriangles(cur));
}

export const HANGZHOU_ELEMENTS = { view_tent: viewTent };
