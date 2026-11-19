// Venice by night (docs/settlements/venice.md §5f.2): the light of the iron lanterns, of the capitelli (the little shrines of the Madonna with their
// lamp, at the bridge heads) and of the lantern at the stern of a moored gondola, as geometry in the `halo` material (additive, night only, no light,
// no shadow, no collision). Brightness lives in the vertex normals (halo.js). Everything is a function of the piece's own place.
import { box, lathe } from '../../core/geom.js';
import { Halo, hashAt } from './halo.js';

const sc = (rot) => [Math.sin(rot), Math.cos(rot)];
/** A geometry placed in the world: turned by `rot` about y (local +z → (sin rot, cos rot)), then moved. */
const place = (g, x, y, z, rot) => { g.rotateY(rot); g.translate(x, y, z); return g; };

/**
 * ven_halo { items: [{ k: 'lantern' | 'stern', at: [x, z], y, rot, h }] }
 * lantern: the street lantern of the shared `life` style (a post at `at`, its arm 0.42 m out along rot, the lamp at h − 0.07 over y, the wall 0.06 behind):
 *   the glow round the lamp, the pool on the paving, the wash on the wall. stern: a post with a lantern at a moored boat's stern (y: the waterline), its glow,
 *   the pool on the deck and the streak on the water.
 */
export function venHalo(el, { bag }) {
  const H = new Halo();
  for (const it of el.items) {
    const [x, z] = it.at, y = it.y ?? 0, [sx, sz] = sc(it.rot ?? 0);
    if (it.k === 'lantern') {
      const lx = x + sx * 0.42, lz = z + sz * 0.42, ly = y + (it.h ?? 2.6) - 0.07, s = 0.9 + 0.2 * hashAt(x, z, 4);
      H.ball(lx, ly, lz, 0.95 * s); H.floor(lx, y + 0.04, lz, 2.5 * s);
      H.wall(x - sx * 0.1, ly, z - sz * 0.1, [sx, sz], 1.9 * s, 1.5 * s);
    } else if (it.k === 'stern') {
      bag.add('iron', place(box(-0.025, 0.2, -0.025, 0.025, 1.1, 0.025), x, y, z, 0));
      bag.add('iron', place(box(-0.015, 1.05, -0.02, 0.015, 1.08, 0.3), x, y, z, it.rot ?? 0));
      bag.add('lamp_glass', place(lathe([[0.001, 0.0], [0.07, 0.02], [0.07, 0.17], [0.001, 0.2]], 6), x + sx * 0.3, y + 0.86, z + sz * 0.3, 0));
      bag.add('iron', place(lathe([[0.08, 0.17], [0.001, 0.26]], 6), x + sx * 0.3, y + 0.86, z + sz * 0.3, 0));
      H.ball(x + sx * 0.3, y + 0.96, z + sz * 0.3, 0.75); H.floor(x, y + 0.3, z, 1.6);
      H.floor(x + sx * 0.4, y + 0.04, z + sz * 0.4, 0.7, 1.7, Math.atan2(sx, sz), 10, true);
    }
  }
  H.flush(bag);
}

/**
 * ven_capitello { at, y, rot (the way it faces) }: a wooden shrine of the Madonna on a stone post, at a bridge head or a street corner, with a lamp
 * hung from an iron arm before it [stated: lucasitaly "capitèlo" — votive lamps lit the streets]; the image a little panel of blue and gold. Its glow,
 * pool and the wash on the niche are halos.
 */
export function capitello(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, [sx, sz] = sc(rot), put = (m, g) => bag.add(m, place(g, x, y, z, rot));
  put('limestone', box(-0.3, 0, -0.25, 0.3, 0.22, 0.25)); put('limestone', box(-0.2, 0.22, -0.17, 0.2, 1.6, 0.17));
  put('wood_dark', box(-0.32, 1.55, -0.22, 0.32, 2.2, 0.22)); put('wood_dark', box(-0.42, 2.2, -0.3, 0.42, 2.26, 0.34));
  put('limestone', box(-0.26, 1.62, 0.2, 0.26, 2.12, 0.23));
  put('gilt_bronze', box(-0.17, 1.72, 0.23, 0.17, 2.06, 0.245)); put('gilt_bronze', box(-0.01, 2.26, -0.01, 0.01, 2.42, 0.01));
  put('iron', box(-0.015, 1.5, 0.2, 0.015, 1.53, 0.55)); put('iron', box(-0.004, 1.38, 0.52, 0.004, 1.5, 0.54));
  put('iron', lathe([[0.001, 0], [0.06, 0.01], [0.08, 0.05], [0.001, 0.05]], 8, null, 0, 1.33, 0.53));
  put('flame', lathe([[0.001, 0.05], [0.016, 0.07], [0.001, 0.13]], 6, null, 0, 1.33, 0.53));
  const H = new Halo(), lx = x + sx * 0.53, lz = z + sz * 0.53;
  H.ball(lx, y + 1.42, lz, 0.85); H.floor(lx, y + 0.04, lz, 2.3);
  H.wall(x + sx * 0.3, y + 1.9, z + sz * 0.3, [sx, sz], 0.9, 0.9);
  H.flush(bag);
  col?.rect([x - 0.34, z - 0.34, x + 0.34, z + 0.34], y, y + 2.3);
}
