// Edo Himeji, wear: the thresholds of the castle's gates and of the keep's door (docs/settlements/edo-himeji.md §11).
// A sill of granite laid across a passage, and the feet of centuries in it: pale-dark polished dips where people step,
// as low round patches in a darker stone, never higher than the sill by more than a few millimetres (no hard-edged blocks).
// Visual only: no collision, no light. Everything a function of the sill's own place.
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './nightlight.js';

/** A worn disc at (x, y, z): a flat dome r wide whose rim sits 3 mm above y. */
const patch = (bag, x, y, z, r) => bag.add('granite_black', lathe([[0.001, 0.0095], [r * 0.55, 0.009], [r, 0.004], [r, 0.0]], 12, null, x, y, z));

/**
 * { at: [x, z], y, w (across the passage), d (along it), alongX (the passage runs along x: the way is walked in x) }: the sill of a passage.
 * 0.05 m high; the patches rise to 0.06 m.
 */
function sill(el, { bag }) {
  const [cx, cz] = el.at, y = el.y ?? 0, w = el.w, d = el.d ?? 0.7, ax = !!el.alongX, H = 0.05;
  const [hx, hz] = ax ? [d / 2, w / 2] : [w / 2, d / 2];
  bag.add('granite_grey', box(cx - hx, y, cz - hz, cx + hx, y + H, cz + hz));
  const n = Math.max(2, Math.round(w / 1.1)), step = w / n;
  for (let k = 0; k < n; k++) {
    const u = -w / 2 + step * (k + 0.5), j = (hashAt(cx + k, cz, 3) - 0.5) * 0.12;
    const r = 0.26 + 0.12 * hashAt(cx, cz + k, 5);
    patch(bag, cx + (ax ? j : u), y + H, cz + (ax ? u : j), Math.min(r, d * 0.42));
  }
  // the edges chipped: a pale stone each end, the stone's own grey a shade lighter
  for (const s of [-1, 1]) {
    const u = s * (w / 2 - 0.12);
    bag.add('granite_inca', ax ? box(cx - hx * 0.6, y + H, cz + u - 0.09, cx + hx * 0.6, y + H + 0.012, cz + u + 0.09) : box(cx + u - 0.09, y + H, cz - hz * 0.6, cx + u + 0.09, y + H + 0.012, cz + hz * 0.6));
  }
}
STYLES.edo.elements.sill = sill;
