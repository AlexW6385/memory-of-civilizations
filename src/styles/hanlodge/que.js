// The Han que, the great gate tower (docs/settlements/han-changan.md §5b): the earthen shaft on a stepped plinth, red at its foot, bound by timber ribs
// and ties, the skirt roof (a pent of tile with round eave-ends) halfway up it, the open railed pavilion crowning it with the bronze phoenix on its
// ridge; the lower subsidiary tower (zi que) built against its side, under a hipped roof of its own. The shaft is the han_que's (src/styles/han/walls.js).
import { box, lathe } from '../../core/geom.js';
import { hipLite, eaveTiles } from '../han/kit.js';
import { pavilion } from '../han/walls.js';
import { phoenix } from './hall.js';

/** hanl_que: { at [x, z], sub [sx, sz] (the direction of the subsidiary tower, one axis ±1), h (the main shaft), face [fx, fz] (the way the phoenix looks) } */
export function que(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, h = el.h ?? 11, a = 2.8, [sx, sz] = el.sub ?? [1, 0], [fx, fz] = el.face ?? [1, 0];
  const sub = { a: 1.8, h: h * 0.45 }; sub.x = x + sx * (a + sub.a); sub.z = z + sz * (a + sub.a);
  // the plinth: two steps of dressed stone round both towers
  const pl = (cx, cz, aa, hy, y1) => { const r = [cx - aa - hy, cz - aa - hy, cx + aa + hy, cz + aa + hy]; bag.add('bluestone', box(r[0], -0.3, r[1], r[2], y1, r[3])); col.rect(r, -0.3, y1); };
  pl(x, z, a, 1.0, 0.2); pl(x, z, a, 0.55, 0.5); pl(sub.x, sub.z, sub.a, 1.0, 0.2); pl(sub.x, sub.z, sub.a, 0.55, 0.5);
  const shaft = (cx, cz, aa, hh, tie) => {
    bag.add('earth_wall', box(cx - aa, 0.5, cz - aa, cx + aa, hh, cz + aa)); col.rect([cx - aa, cz - aa, cx + aa, cz + aa], 0.5, hh);
    bag.add('palace_wall', box(cx - aa - 0.05, 0.5, cz - aa - 0.05, cx + aa + 0.05, 1.5, cz + aa + 0.05));            // the red foot
    // the ties (two belts of timber round the shaft) and the ribs up its faces, the corner ones as quoins
    for (const ty of tie) bag.add('timber_red', box(cx - aa - 0.1, ty, cz - aa - 0.1, cx + aa + 0.1, ty + 0.3, cz + aa + 0.1));
    for (const u of [-aa + 0.2, 0, aa - 0.2]) for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const px = cx + dx * (aa + 0.06) + (dx ? 0 : u), pz = cz + dz * (aa + 0.06) + (dz ? 0 : u);
      bag.add('timber_red', box(px - (dx ? 0.1 : 0.17), 1.5, pz - (dz ? 0.1 : 0.17), px + (dx ? 0.1 : 0.17), hh - 0.35, pz + (dz ? 0.1 : 0.17)));
    }
    bag.add('tile_grey', box(cx - aa - 0.35, hh - 0.35, cz - aa - 0.35, cx + aa + 0.35, hh, cz + aa + 0.35));         // the cornice
  };
  const skirt = (cx, cz, aa, y, rise) => {                                                                                // the pent roof round a shaft, over its foot of ribs
    hipLite({ c: [cx, cz], A: aa, B: aa, y, rise, lift: 0.3, pow: 1.15, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, alongZ: false }, ctx);
    eaveTiles(bag, cx, cz, aa, aa, y, 0.3, 0.4, 0.1);
  };
  const hs = h * 0.66;
  shaft(x, z, a, h, [2.9, hs - 1.4]);
  skirt(x, z, a + 1.7, hs, 1.4);
  shaft(sub.x, sub.z, sub.a, sub.h, [2.4]);
  skirt(sub.x, sub.z, sub.a + 1.3, sub.h - 0.4, 1.3);
  bag.add('tile_dark', box(sub.x - 0.22, sub.h - 0.4 + 1.3 + 0.5, sub.z - 0.22, sub.x + 0.22, sub.h - 0.4 + 1.3 + 1.3, sub.z + 0.22));
  // the crowning pavilion, open and railed, with the phoenix over its ridge
  pavilion({ c: [x, z], A: a + 0.2, B: a + 0.2, y: h, h: 3.2, walls: false }, ctx);
  const rise = Math.max(1.8, (a + 0.2) * 0.9), top = h + 3.2 + 0.1 + rise + 0.8;
  bag.add('tile_dark', box(x - 0.25, h + 3.3 + rise, z - 0.25, x + 0.25, top, z + 0.25));
  phoenix(bag, x, top, z, fx, fz, 0.85);
  void lathe;
}
