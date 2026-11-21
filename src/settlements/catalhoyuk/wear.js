// Çatalhöyük — wear on what is used (docs/settlements/catalhoyuk.md §14.5): the roof worn by the feet between the ladder's head and the hatch, the rim of the hatch
// rubbed pale where one steps over it, soot in tongues round the hatch on the roof, the earth trodden dark at the ladder's foot and the wall rubbed dark by the hands
// and shoulders that climb it, the plaster floor greyed under the hatch and black round the hearth. Added to the style's elements from this folder (the style files stay as they
// were), in materials the plan already holds (no new draw), pure functions of each house's own numbers. Nothing is written anywhere: there is no script (§14).
import '../../styles/catal/index.js';
import './nightlight.js';
import { box, lathe } from '../../core/geom.js';
import { cellGeom } from '../../styles/catal/cell.js';
import { hashAt } from './nightlight.js';
import { STYLES } from '../../core/build.js';

const SOOT = 'pottery_dark', DARK = 'bark_dark', TROD = 'earth_wall', DUST = 'silt', GREY = 'plaster_grey';
const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};
/** Soot round a hatch on its roof (y = the roof's walking top): four tongues drawn out along the way the smoke leaned, a little different for each hatch's place. */
function sootRoof(bag, x, y, z, hw, hd) {
  const a = hashAt(x, z, 21) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), h = y + 0.003;
  for (let k = 0; k < 4; k++) {
    const t = a + (k - 1.5) * 0.7, L = 0.5 + 0.4 * hashAt(x, z, 30 + k), px = x + Math.cos(t) * (hw + 0.28 + L / 2), pz = z + Math.sin(t) * (hd + 0.28 + L / 2), w = 0.1 + 0.07 * hashAt(x, z, 40 + k);
    const ex = Math.abs(Math.cos(t)) > Math.abs(Math.sin(t)), sx = ex ? L : w, sz = ex ? w : L;
    bag.add(SOOT, box(px - sx / 2, h, pz - sz / 2, px + sx / 2, h + 0.003, pz + sz / 2));
  }
  void c; void s;
}
/** A worn way on a roof from (x0, z0) to (x1, z1) (axis-aligned legs), 0.6 m wide, 3 mm thick above the roof's walking top y. */
function wornWay(bag, y, x0, z0, x1, z1, w = 0.6) {
  bag.add(TROD, box(Math.min(x0, x1) - w / 2, y, Math.min(z0, z1) - w / 2, Math.max(x0, x1) + w / 2, y + 0.004, Math.max(z0, z1) + w / 2));
}
/** The earth trodden dark at a ground ladder's foot and the wall rubbed dark at the height of the hands and the shoulders (the wall's face at z = zw, looking south). */
function ladderWear(bag, x, zw, yTop) {
  const j = (hashAt(x, zw, 5) - 0.5) * 0.1;
  bag.add(DARK, lathe([[0.001, 0.007], [0.42, 0.007], [0.5, 0.0]], 10, (t, i) => 1 + 0.08 * Math.sin(t * 3 + i), x + j, 0, zw + 1.0));
  for (const [y0, y1, sd] of [[1.2, 1.5, -1], [1.9, 2.2, 1]]) if (y1 < yTop - 0.1) bag.add('banco_rough', box(x + sd * 0.42 - 0.07, y0 - 0.1, zw + 0.019, x + sd * 0.42 + 0.07, y1 + 0.1, zw + 0.027));
}
let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.catal.elements, quarter = E.catal_quarter, house = E.catal_house;
  E.catal_quarter = function worn(el, ctx) {
    if (!ctx?.bag) return quarter.call(this, el, ctx);
    const real = ctx.bag;
    const bag = new Proxy(real, {
      get(t, k) {
        if (k === 'add') return (mat, g, ...r) => {
          if (mat === 'opening' && g?.attributes?.position) {          // a closed house's hatch: its roof's soot, the way the ladder's head to it worn
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1];
            if (Math.abs(dx - 0.9) < 0.02 && Math.abs(dz - 0.9) < 0.02 && Math.abs(dy - 0.32) < 0.02) { const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2, y = b[4] + 0.07; sootRoof(real, mx, y, mz, 0.62, 0.62); }
          }
          return t.add(mat, g, ...r);
        };
        const v = t[k];
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
    const r = quarter.call(this, el, { ...ctx, bag });
    const X = (j) => el.x0 + el.cols.slice(0, j).reduce((a, b) => a + b, 0), Z = (i) => el.z0 + el.rows.slice(0, i).reduce((a, b) => a + b, 0);
    for (const e of el.enter || []) {
      const x0 = X(e.j), z0 = Z(e.i), g = cellGeom([x0, z0, x0 + el.cols[e.j], z0 + el.rows[e.i]], e.mirror), [h0, h1, h2, h3] = g.hole, top = el.tops[e.i][e.j], y = top + 0.09, rx = g.lx(1.95), hx = (h0 + h2) / 2, hz = (h1 + h3) / 2;
      sootRoof(real, hx, y + 0.18, hz, (h2 - h0) / 2 + 0.2, (h3 - h1) / 2 + 0.2);
      // the way the people come in over the roof: worn from the roof's middle to the north rim of the hatch, where they step in; the rim's top rubbed pale there
      wornWay(real, y, rx, h1 - 1.6, rx, h1 - 0.35, 0.7);
      real.add(DUST, box(rx - 0.3, top + 0.27, h1 - 0.19, rx + 0.3, top + 0.274, h1 - 0.01));
      // inside: the floor greyed under the hatch where the ladder's foot stands
      real.add(GREY, box(g.lx(1.3) - 0.0, 0.052, h1 + 0.9, g.lx(2.5), 0.054, h3 + 0.1));
    }
    return r;
  };
  E.catal_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (!ctx?.bag) return r;
    const { bag } = ctx, [x0, z0, x1, z1] = el.rect, ST = el.top ?? 2.5, T = 0.45, y = ST + 0.09, ix0 = x0 + T, iz0 = z0 + T, lxo = (x0 + x1) / 2;
    const hx = ix0 + 1.6, hz = iz0 + 4.4;
    ladderWear(bag, lxo, z1, ST);
    // the roof worn from the ladder's head (the south edge) along the roof to the hatch's rim, in two legs, the hatch's south rim rubbed pale, its soot
    wornWay(bag, y, lxo, z1 - 0.9, lxo, hz + 1.2, 0.8);
    wornWay(bag, y, hx, hz + 1.2, lxo, hz + 1.2, 0.8);
    bag.add(DUST, box(hx - 0.4, ST + 0.27, hz + 0.5 + 0.3, hx + 0.4, ST + 0.274, hz + 0.5 + 0.5));
    sootRoof(bag, hx, y + 0.18, hz, 0.8 + 0.2, 0.5 + 0.2);
    // inside: the plaster floor greyed under the hatch, blackened round the hearth, the west platform's edge rubbed where people sit
    bag.add(GREY, box(ix0 + 1.2, 0.052, iz0 + 4.0, ix0 + 2.7, 0.054, iz0 + 5.0));
    bag.add(SOOT, lathe([[0.42, 0.052], [0.95, 0.052]], 12, null, ix0 + 1.1, 0, iz0 + 4.4));
    return r;
  };
}
registerWear();
