// Where feet went on the Templo Mayor (docs/settlements/tenochtitlan.md §26): the paint and plaster of the two great stairs rubbed down to the
// pale undercoat along the line the priests climbed, thinner and ragged at its edges, and the summit's slab worn on the way from the stairhead to
// each shrine's door. Thin decals (a few millimetres) of materials the precinct's plan already holds, so no draw is added. [inferred: the wear
// of ritual processions on plastered stone; every tread's own width and sway are hashed from its index.]
import { box } from '../../core/geom.js';

const hash = (k, s) => { let h = (k * 374761393 + s * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
/**
 * tn_wear { c: [cx, cz], w1 (the top's half-width), d1 (its half-depth), h }: worn bands up the two stairs (south: Huitzilopochtli's, north: Tlaloc's) and on the summit.
 * The stairs' geometry is that of templo_mayor (index.js): run 0.9 h from sx1 - run to sx1 + 0.5, treads of 0.22 m, centred on cz ± 0.45 d1.
 */
export function tnWear(el, { bag }) {
  const [cx, cz] = el.c, H = el.h, run = H * 0.9, sx1 = cx - el.w1, sx0 = sx1 - run, len = sx1 + 0.5 - sx0, n = Math.max(1, Math.round(H / 0.22)), rs = H / n, e = 0.012;
  for (const s of [-1, 1]) {
    const zc = cz + s * el.d1 * 0.45, seed = s < 0 ? 7 : 13;
    for (let k = 0; k < n; k++) {
      const f = k / n, wear = 1 - f * 0.55;                                    // the lower treads were trodden most
      if (hash(k, seed) > wear * 0.8) continue;                             // some treads keep their paint
      const half = (0.7 + 0.9 * wear) * (0.75 + 0.5 * hash(k, seed + 1)), mid = zc + (hash(k, seed + 2) - 0.5) * 0.9 + Math.sin(k * 0.07 + seed) * 0.5;
      const x0 = sx0 + len * (k + 0.12) / n, x1 = sx0 + len * (k + 0.88) / n, y = rs * (k + 1);
      bag.add('plaster_grey', box(x0, y + e, mid - half, x1, y + e + 0.004, mid + half));
      if (hash(k, seed + 3) < 0.5) bag.add('plaster_damp', box(x0 + 0.02, y + e + 0.004, mid - half * 0.45, x1 - 0.02, y + e + 0.008, mid + half * 0.45));
    }
    // the summit: from the stairhead to the door of the shrine (x = cx - 0.55 w1; Tlaloc's door at z -10.8, Huitzilopochtli's at +10.8)
    const door = cx - el.w1 * 0.55, zd = s * 10.8, xa = sx1 + 1.0, xb = door - 0.5;
    if (xb > xa) {
      bag.add('plaster_grey', box(xa, H + e, zd - 1.5, xb, H + e + 0.004, zd + 1.5));
      bag.add('plaster_damp', box(xa + 0.8, H + e + 0.004, zd - 0.8, xb - 0.1, H + e + 0.008, zd + 0.8));
    }
  }
}
