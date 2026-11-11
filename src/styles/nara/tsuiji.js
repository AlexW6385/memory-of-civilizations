// The earthen walls of Heijō-kyō (docs/settlements/nara.md §11): the tsuiji, a pounded-earth wall on a stone footing
// under a tiled coping, round the blocks of the capital and the precincts of its temples, with a roofed gate
// (munamon: two posts, a lintel beam and a small gabled roof of bark or tile, its ridge along the wall).
//
// nara_tsuiji { a, b (the wall's ends), y, h (2.4), th (0.7), gate: [x, z] (its centre on the line) | null, gw (3.4), roof ('roof_bark' | 'tile_grey') }

import { box } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { gableRoofC } from '../chinese/index.js';

export function naraTsuiji(el, ctx) {
  const { bag, col } = ctx;
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 2.4, th = el.th ?? 0.7, gw = el.gw ?? 3.4;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  const P = (s) => [ax + ux * s, az + uz * s];
  const piece = (s0, s1) => {
    if (s1 - s0 < 0.05) return;
    const p = P(s0), q = P(s1);
    bag.add('limestone', orientedBox(p, q, th + 0.3, y - 0.3, y + 0.45));
    bag.add('earth_wall', orientedBox(p, q, th, y + 0.45, y + h));
    bag.add('tile_grey', orientedBox(p, q, th + 0.6, y + h, y + h + 0.28));
    bag.add('tile_grey', orientedBox(p, q, th * 0.5, y + h + 0.28, y + h + 0.5));
    col.segment(p, q, th + 0.3, y - 0.3, y + h + 0.5);
  };
  if (!el.gate) { piece(0, L); return; }
  const sg = Math.max(gw, Math.min(L - gw, (el.gate[0] - ax) * ux + (el.gate[1] - az) * uz));
  piece(0, sg - gw / 2 - 0.3); piece(sg + gw / 2 + 0.3, L);
  // the gate: the wall's thickened ends as posts, a lintel, the roof
  const c = P(sg), H = 3.3;
  for (const s of [-1, 1]) {
    const p = P(sg + s * (gw / 2 + 0.15));
    bag.add('timber', orientedBox([p[0] - ux * 0.2, p[1] - uz * 0.2], [p[0] + ux * 0.2, p[1] + uz * 0.2], 0.5, y, y + H));
    col.segment([p[0] - ux * 0.2, p[1] - uz * 0.2], [p[0] + ux * 0.2, p[1] + uz * 0.2], 0.5, y, y + H);
  }
  bag.add('timber', orientedBox(P(sg - gw / 2 - 0.5), P(sg + gw / 2 + 0.5), 0.45, y + H - 0.4, y + H));
  bag.add('timber', orientedBox(P(sg - gw / 2 - 0.2), P(sg + gw / 2 + 0.2), 0.3, y + 0.12, y + 0.3));
  // the gate has a sill-less passage: the threshold board is cosmetic
  gableRoofC({ c, A: gw / 2 + 1.5, B: 1.5, y: y + H + 0.05, rise: 1.15, mat: el.roof ?? 'roof_bark', soffit: 'timber', ridgeMat: 'tile_grey', noHorns: true, alongZ: Math.abs(uz) > Math.abs(ux) }, ctx);
  void box;
}
export const tsuijiElements = { nara_tsuiji: naraTsuiji };
