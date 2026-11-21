// Khajuraho about 1050 — wear and weathering (docs/settlements/khajuraho.md §22): what the feet of the pilgrims and the oil of the lamps leave on stone and platform.
// Wraps the nagara style's `bazaar_house` and `nagara_temple` from here (the style files stay as they were); pure functions of the element's own numbers, hashes of
// their own places (no counters, no Math.random). Only materials that already hold fine pieces near the arrival are used (the draws stay). Nothing is written anywhere:
// no inscription is drawn (§22: the Nagari of the time cannot be checked glyph by glyph here).
import '../../styles/nagara/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { frame, homeDoorU, isOpenFront } from './doors.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** The platform of a house or shop: the stone worn pale and smooth where the feet cross it to the door (the sandstone's dressed grain showing), a patch by the door where water is poured out dark; on every opened front, on one in three of the others. */
function houseWear(el, bag) {
  if (el.kind === 'hut') return;
  if (!el.open && hashAt(el.rect[0], el.rect[1], 41) > 0.33) return;
  const { L, P } = frame(el), fy = (el.y ?? 0) + 0.42 - 0.03, shop = isOpenFront(el);
  const u = shop ? L * (0.35 + 0.3 * hashAt(el.rect[0], el.rect[1], 43)) : homeDoorU(el);
  const w = 0.32 + 0.16 * hashAt(el.rect[0], el.rect[1], 45), d0 = 0.15 + 0.2 * hashAt(el.rect[1], el.rect[0], 47);
  const a = P(u - w, -1.1), b = P(u + w, -d0);
  bag.add('sandstone_dressed', box(Math.min(a[0], b[0]), fy, Math.min(a[1], b[1]), Math.max(a[0], b[0]), fy + 0.006, Math.max(a[1], b[1])));
  if (hashAt(el.rect[0], el.rect[1], 49) < 0.5) {                                       // the damp where the household throws its water out at the platform's end
    const ue = hashAt(el.rect[1], el.rect[0], 51) < 0.5 ? 0.25 : L - 0.25, c = P(ue - 0.2, -1.1), e = P(ue + 0.2, -0.6);
    bag.add('plaster_damp', box(Math.min(c[0], e[0]), fy + 0.001, Math.min(c[1], e[1]), Math.max(c[0], e[0]), fy + 0.007, Math.max(c[1], e[1])));
  }
}

/** The porch of a temple: the threshold before the sanctum's doorway worn dark and smooth by the hands and feet of the pilgrims and by the oil of the lamps, and the stains of spilled oil under each lamp stand (the porch's floor: life.js `porchOf`). */
function templeWear(el, bag) {
  const t = el, W = t.w, Lh = (t.len - W / 2) / 0.84, J = t.jagati, fl = J + t.h * 0.12 + 0.9, x0 = t.c[0] + W / 2 + Lh * 0.66, cz = t.c[1];
  const hw = W * 0.36;
  bag.add('granite_grey', box(x0 + 0.05, fl, cz - 0.75, x0 + 1.15, fl + 0.006, cz + 0.75));
  for (const sz of [-1, 1]) {
    const w = 0.34 + 0.1 * hashAt(x0, cz + sz, 5);
    bag.add('plaster_damp', box(x0 + 0.45 - w, fl + 0.001, cz + sz * 0.9 - w, x0 + 0.45 + w, fl + 0.007, cz + sz * 0.9 + w));
  }
  void hw;
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.nagara.elements, wrap = (name, fn, wear) => {
    E[name] = function worn(el, ctx) { const r = fn.call(this, el, ctx); if (!el.simple && ctx?.bag) wear(el, ctx.bag); return r; };
  };
  wrap('bazaar_house', E.bazaar_house, houseWear);
  wrap('nagara_temple', E.nagara_temple, templeWear);
}
registerWear();
