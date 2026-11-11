// Papyrus-bundle columns of the Great Hypostyle Hall (docs/settlements/thebes.md §4): the twelve of the nave
// with open (bell) capitals, 21 m to the top of the abacus, shaft 3.57 m across; the 122 of the aisles with
// closed-bud capitals, 14 m, 2.74 m across. A bundle shaft of eight stems that narrows to the foot over a ring
// of green sepals, painted in registers (the king before the gods in red-brown on a pale ground, columns of
// signs in blue), bound under the capital by five lashings; the capital painted in green and blue ribs.
import { lathe, box, fromTriangles } from '../../core/geom.js';
import { figure } from '../egyptian/objects.js';
import { glyphs, patch, rng, TAU } from './kit.js';

/**
 * nk_column: { at, y, h, d (shaft diameter), cap: 'open' | 'bud', faces (angles of the carved faces), scenes (registers), seed }
 */
export function nkColumn(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h, R = el.d / 2, open = (el.cap ?? 'open') === 'open', rand = rng(el.seed ?? 7);
  const baseH = 0.4, abH = open ? 0.5 : 0.36, capH = open ? H * 0.155 : H * 0.135, tie = open ? 1.1 : 0.8;
  const yS0 = baseH, yS1 = H - abH - capH - tie, yT1 = H - abH - capH;           // shaft from the base to the lashings, the lashings to the capital
  // the stone drum under the column
  bag.add('sandstone_dressed', lathe([[R * 1.28, 0], [R * 1.28, baseH * 0.7], [R * 1.1, baseH], [R * 0.8, baseH]], 28, null, x, y, z));
  // the shaft: eight stems (the bundle's ribs), narrowing toward the foot, its swell above, a slight taper to the top
  const rAt = (v) => { const t = Math.max(0, Math.min(1, (v - yS0) / (yT1 - yS0))); return R * (0.72 + 0.28 * Math.min(1, t / 0.2)) * (1 - 0.07 * t) * 1; };
  const prof = []; const N = 18;
  for (let i = 0; i <= N; i++) { const v = yS0 + (yT1 - yS0) * (i / N) ** 1.0; prof.push([rAt(v), v]); }
  bag.add('sandstone_column', lathe(prof, 32, (th, i, r, v) => 1 + 0.035 * Math.cos(8 * th) * Math.min(1, (v - yS0) / 1.5), x, y, z));
  // the sepals at the foot: green leaves clasping the shaft
  const sh = open ? 2.4 : 1.8;
  bag.add('fresco_green', lathe([[rAt(yS0) * 1.0, yS0], [rAt(yS0) * 1.14, yS0 + sh * 0.35], [rAt(yS0 + sh) * 1.06, yS0 + sh * 0.8], [rAt(yS0 + sh) * 1.01, yS0 + sh]], 32, (th) => 1 + 0.06 * Math.pow(Math.abs(Math.cos(4 * th)), 3) - 0.04, x, y, z));
  // the registers: bands of blue between them, on four faces (two on the aisle columns) the scenes
  const T = { ground: [], fig: [], glyph: [], band: [], ochre: [] };
  const v0 = yS0 + sh + 0.35, v1 = yS1 - 0.3, nReg = el.scenes ?? Math.max(1, Math.floor((v1 - v0) / (open ? 2.6 : 2.3))), reg = (v1 - v0) / nReg;
  const faces = el.faces ?? (open ? [0, Math.PI / 2, Math.PI, Math.PI * 1.5] : [0, Math.PI]);
  const place = (u, v, d) => { const a = u / R, r = rAt(v) * (1 + 0.035 * 0) + 0.012 + d; return [x + Math.cos(a) * r, y + v, z + Math.sin(a) * r]; };
  for (let k = 0; k <= nReg; k++) patch(T.band, x, z, y, rAt, 0, TAU, v0 + k * reg - 0.05, v0 + k * reg + 0.03, 0.02, 28, 1);
  for (let k = 0; k < nReg; k++) {
    const vb = v0 + k * reg + 0.12, hh = reg - 0.36;
    faces.forEach((fa, fi) => {
      const arc = Math.min(R * 1.5, 3.0), uc = fa * R;
      patch(T.ground, x, z, y, rAt, fa - arc / 2 / R, fa + arc / 2 / R, vb - 0.04, vb + hh + 0.06, 0.006, 6, 1);
      const flip = (fi + k) % 2 ? 1 : -1;
      figure({ add: (m, g) => T.fig.push(g) }, 'paint_robe', 'offer', place, uc - flip * arc * 0.2, vb, hh * 0.9, flip, 0.035);
      figure({ add: (m, g) => T.fig.push(g) }, 'paint_robe', rand() < 0.5 ? 'god' : 'seated', place, uc + flip * arc * 0.24, vb, hh * 0.92, -flip, 0.035);
      const gw = hh * 0.085;
      glyphs(T.glyph, place, uc - flip * arc * 0.02, vb + hh * 0.55, vb + hh * 0.98, gw, Math.floor(rand() * 1e6), 0.03);
    });
  }
  const put = (mat, list) => { if (list.length) for (const g of list) bag.add(mat, g); };
  if (T.ground.length) bag.add('plaster_white', fromTriangles(T.ground));
  put('paint_robe', T.fig);
  if (T.glyph.length) bag.add('egyptian_blue', fromTriangles(T.glyph));
  if (T.band.length) bag.add('egyptian_blue', fromTriangles(T.band));
  // the five lashings under the capital, alternately blue and red
  const rT = rAt(yT1);
  for (let k = 0; k < 5; k++) {
    const v = yS1 + 0.12 + k * (tie - 0.2) / 5, hb = (tie - 0.2) / 5 * 0.78;
    bag.add(k % 2 ? 'limewash_red' : 'egyptian_blue', lathe([[rT * 1.0, v], [rT * 1.07, v + 0.04], [rT * 1.07, v + hb - 0.04], [rT * 1.0, v + hb]], 28, null, x, y, z));
  }
  // the capital
  const cb = yT1;
  if (open) {
    // an open umbel: a bell flaring to twice the shaft, its petals ribbed (green over blue), a fringe of lotus buds under the rim
    const P = [[1.0, 0], [1.0, 0.06], [1.08, 0.22], [1.3, 0.48], [1.66, 0.76], [1.98, 0.95], [2.0, 1.0], [0.9, 1.0]].map(([r, t]) => [rT * r, cb + t * capH]);
    bag.add('egyptian_blue', lathe(P, 40, null, x, y, z));
    bag.add('fresco_green', lathe(P.map(([r, v]) => [r * 1.012, v]), 40, (th, i) => (i === 0 || i === P.length - 1 ? 0.97 : Math.cos(10 * th) > 0.35 ? 1 : 0.95), x, y, z));
    bag.add('paint_ochre', lathe([[rT * 1.99, cb + capH * 0.93], [rT * 2.03, cb + capH * 0.95], [rT * 2.03, cb + capH * 1.0], [rT * 1.98, cb + capH * 1.0]], 40, null, x, y, z));
  } else {
    // a closed bud: swells and draws in again under the abacus, ribbed; the tips of the sepals about its foot
    const P = [[1.0, 0], [1.12, 0.15], [1.3, 0.4], [1.34, 0.62], [1.18, 0.84], [0.92, 0.98], [0.86, 1.0], [0.5, 1.0]].map(([r, t]) => [rT * r, cb + t * capH]);
    bag.add('egyptian_blue', lathe(P, 36, null, x, y, z));
    bag.add('fresco_green', lathe(P.map(([r, v]) => [r * 1.012, v]), 36, (th, i) => (i === 0 || i >= P.length - 2 ? 0.97 : Math.cos(8 * th) > 0.2 ? 1 : 0.95), x, y, z));
  }
  // the abacus
  const aw = rT * (open ? 1.05 : 1.0);
  bag.add('sandstone_dressed', box(x - aw, y + H - abH, z - aw, x + aw, y + H, z + aw));
  col.circle(x, z, R * 1.08, y, y + H);
}
