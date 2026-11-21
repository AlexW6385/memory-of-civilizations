// Persepolis about 480 BC — wear on what is entered (docs/settlements/persepolis.md §23.5): the hollow worn in the door-step of a house that is walked into,
// by the feet that cross it; (soot over the lamp niches and behind the hearths was tried and left out: it cost two draws at the arrival). Wraps the style's `persian_house` from here
// (the style file stays as it was); pure functions of the element's own numbers. Nothing is written anywhere (§23.5: Old Persian cuneiform is not set).
import '../../styles/achaemenid/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseMake, houseDoor, frameOf } from '../../styles/achaemenid/houses-data.js';
import { hashAt } from './nightlight.js';

/** Wear on the treads of a stair (`stair`'s own numbers: rect, y0, y1, dir, riser): on each tread a hollow of darker, polished stone where the feet fall, in the
 *  limestone's darker sister `marble_dark` (a material the plan holds); no two treads alike (the hash of the tread's place), no collision, 8 mm over the tread. */
function stairWear(el, { bag }) {
  if (!bag) return;
  const [x0, z0, x1, z1] = [Math.min(el.rect[0], el.rect[2]), Math.min(el.rect[1], el.rect[3]), Math.max(el.rect[0], el.rect[2]), Math.max(el.rect[1], el.rect[3])];
  const rise = el.y1 - el.y0, n = Math.max(1, Math.round(Math.abs(rise) / (el.riser || 0.17))), along = el.dir === 'n' || el.dir === 's';
  const len = along ? z1 - z0 : x1 - x0, wid = along ? x1 - x0 : z1 - z0, run = len / n, cw = (along ? x0 + x1 : z0 + z1) / 2;
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, yTop = el.y0 + rise * f1;
    let a0, a1;                                                  // the tread's run along the way up
    if (el.dir === 'n') { a0 = z1 - len * f1; a1 = z1 - len * f0; } else if (el.dir === 's') { a0 = z0 + len * f0; a1 = z0 + len * f1; }
    else if (el.dir === 'e') { a0 = x0 + len * f0; a1 = x0 + len * f1; } else { a0 = x1 - len * f1; a1 = x1 - len * f0; }
    const cx = along ? (x0 + x1) / 2 : (a0 + a1) / 2, cz = along ? (a0 + a1) / 2 : (z0 + z1) / 2, q = hashAt(cx, cz, 91), q2 = hashAt(cx, cz, 92);
    const half = wid * (0.2 + 0.07 * q), shift = wid * 0.06 * (q2 - 0.5), m = run * (0.14 + 0.06 * q2), b0 = a0 + m * 0.6, b1 = a1 - m;
    if (b1 - b0 < 0.04) continue;
    const c = cw + shift, y = yTop;
    bag.add('marble_dark', along ? box(c - half, y, b0, c + half, y + 0.008, b1) : box(b0, y, c - half, b1, y + 0.008, c + half));
  }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  STYLES.achaemenid.elements.stair_wear = stairWear;
  const base = STYLES.achaemenid.elements.persian_house;
  STYLES.achaemenid.elements.persian_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (el.simple || !ctx?.bag) return r;
    const m = houseMake(el), { P, R, D } = frameOf(m.rect, m.front), d = houseDoor(el), { bag } = ctx, y0 = el.y ?? 0, t = 0.55;
    const put = (mat, a0, a1, b0, b1, ya, yb) => { const q = R(a0, a1, b0, b1); bag.add(mat, box(q[0], y0 + ya, q[1], q[2], y0 + yb, q[3])); };
    if (m.enter) {
      // the doorstep (its top 0.14 above the ground, 0.6 m out): worn darker in the middle where the feet come and go, a second hollow nearer the wall
      const q = hashAt(m.rect[0], m.rect[1], 73), q2 = hashAt(m.rect[0], m.rect[1], 74);   // (no two patches alike: a shape repeated twelve times would be an instanced draw of its own)
      put('plaster_damp', d.a - 0.5 - 0.1 * q, d.a + 0.5 + 0.1 * q2, -0.5 + 0.05 * q2, -0.1 - 0.04 * q, 0.14, 0.1425);
      put('plaster_damp', d.a - 0.3 - 0.06 * q2, d.a + 0.3 + 0.06 * q, -0.38, -0.16 - 0.03 * q2, 0.1425, 0.145);
    }
    // the soot of the oil lamp in its niche beside the door (where nightlight.js lights one): a dark streak up the wall above it, in `iron` (held by the plan; a new material cost two draws)
    if (m.kind !== 'shop' && hashAt(m.rect[0], m.rect[1], 53) < (m.tier === 0 ? 0.35 : 0.7)) {
      const q = hashAt(m.rect[0], m.rect[1], 75), [nx] = [d.a - d.w / 2 - 0.425];
      put('iron', nx - 0.1 - 0.04 * q, nx + 0.1 + 0.03 * q, -0.012, -0.004, 1.62, 1.72 + 0.28 * q);
    }
    return r;
  };
}
registerWear();
