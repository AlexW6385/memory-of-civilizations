// Shaolin — the dressing of the village fronts (docs/settlements/shaolin.md §6b): what a north-China farm household hangs out
// in the autumn and on its door — strings of corn cobs, red peppers and garlic under the eave, a rack of drying persimmons,
// the red couplets (duilian) and the door paper pasted either side of the leaves, a straw hat and a coil of rope on a nail.
// [inferred: the common picture of Henan farm houses; the dossier marks it so]. An element of the style 'life'. Local frame: x
// along the front, z out from the posts, y up from the street (the caller gives the eave's height).
import { box, lathe } from '../../core/geom.js';
import { Parts, limb, T } from '../../styles/qing/carving.js';
import { rng } from './layout.js';

/** sl_fronttrim: { at, y, rot, L (front width), eave (the height of the eave's lower edge), couplets, strings, seed } */
export function slFronttrim(el, { bag }) {
  const r = rng(el.seed ?? 1), P = new Parts(), L = el.L ?? 6, he = el.eave ?? 3.0;
  if (el.strings !== false) {
    // a pole under the eave, strings of corn (ochre), peppers (red), garlic (white) hung from it, a persimmon rack at one side
    const x0 = -L * 0.42, x1 = L * 0.42, n = Math.floor((x1 - x0) / 0.34);
    P.add('timber', limb([x0, he - 0.12, 0.28], [x1, he - 0.12, 0.28], 0.025, 0.025, 4));
    for (let i = 0; i < n; i++) {
      if (Math.abs(x0 + i * 0.34 + 0.17) < 0.55) continue;                       // clear of the door
      const x = x0 + 0.17 + i * 0.34, k = r(), len = 0.5 + r() * 0.55, mat = k < 0.55 ? 'cloth_ochre' : k < 0.85 ? 'cloth_red' : 'cloth_white';
      P.add('rope_fibre', limb([x, he - 0.12, 0.28], [x, he - 0.12 - len, 0.28], 0.008, 0.008, 3));
      const m = Math.max(2, Math.round(len / (k < 0.55 ? 0.17 : 0.12)));
      for (let j = 0; j < m; j++) P.add(mat, T(lathe([[0.001, -0.08], [0.045, -0.05], [0.05, 0.02], [0.03, 0.08], [0.001, 0.09]], 5), x + (j % 2 ? 0.035 : -0.035), he - 0.2 - j * (len / m), 0.28));
    }
  }
  if (el.couplets !== false) {
    // the couplets: two tall red strips either side of the doorway and a short one over it, the door-god paper on the leaves' edge
    const hw = 0.72 + (el.door ?? 0.5), top = Math.min(he - 0.3, 2.55);
    for (const s of [-1, 1]) {
      P.add('cloth_red', box(s * hw - 0.13, top - 1.55, 0.04, s * hw + 0.13, top, 0.055));
      P.add('cloth_black', box(s * hw - 0.03, top - 1.45, 0.056, s * hw + 0.03, top - 0.12, 0.058));
    }
    P.add('cloth_red', box(-0.45, top + 0.04, 0.04, 0.45, top + 0.3, 0.055));
    P.add('cloth_ochre', box(-0.12, top + 0.1, 0.056, 0.12, top + 0.24, 0.058));
  }
  if (r() < 0.5) {
    // a straw hat and a coil of rope on a nail by the door
    const s = r() < 0.5 ? 1 : -1, x = s * (L * 0.3);
    P.add('thatch', T(lathe([[0.001, 0.2], [0.28, 0.1], [0.3, 0.07], [0.001, 0.2]], 8), x, 1.3, 0.1));
    P.add('rope_fibre', T(lathe([[0.1, 0], [0.14, 0.02], [0.14, 0.1], [0.1, 0.12]], 7), x + 0.5 * s, 1.1, 0.08));
  }
  P.emit(bag, el.at[0], el.y ?? 0, el.at[1], el.rot ?? 0);
}
