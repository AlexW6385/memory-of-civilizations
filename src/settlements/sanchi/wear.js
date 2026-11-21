// Sanchi in the 1st century — wear and weathering (docs/settlements/sanchi.md §24): what the monsoon and the feet of the place leave on mud, plaster and stone. Wraps
// the village house of the indian style from here; pure functions of the element's own numbers, hashes of their own places (no counters, no Math.random). Nothing is
// written anywhere: no inscription is drawn here (the Brahmi of the donors' records cannot be checked sign by sign, and §17 keeps the railings' signs as signs).
import '../../styles/indian/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseDoor } from '../../styles/indian/village.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * The wear of a house: the platform's step polished pale and hollowed in front of the door by bare feet (on the opened houses and one in three of the others), and the
 * damp of the monsoon's splash and the rising damp, a dark band at the foot of the front wall in places, with a streak above it on a few.
 */
function houseWear(el, bag) {
  const F = houseDoor(el), y = (el.y ?? 0) + 0.42 - 0.03, [x0, z0] = el.rect;
  const put = (mat, a, b, ya, yb) => bag.add(mat, box(Math.min(a[0], b[0]), ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yb, Math.max(a[1], b[1])));
  if (F.kind !== 'hut' && F.fr !== 'court' && (el.open || hashAt(x0, z0, 41) < 0.33)) {
    const w = 0.3 + 0.15 * hashAt(x0, z0, 43), d = 0.5 + 0.2 * hashAt(z0, x0, 45);
    put('limewash_white', F.Pf(F.du - w, -0.05), F.Pf(F.du + w, -d), y, y + 0.006);
  }
  if (F.fr === 'court') return;
  const n = Math.max(2, Math.round(F.L / 2.1));
  for (let k = 0; k < n; k++) {
    const c = (k + 0.5) * F.L / n;
    if (Math.abs(c - F.du) < 1.0) continue;
    const q = F.Pf(c, 0), h = hashAt(q[0], q[1], 17);
    if (h < 0.45) {
      const w = 0.3 + 0.4 * hashAt(q[0], q[1], 3), ht = 0.2 + 0.4 * hashAt(q[0], q[1], 5), fy = (el.y ?? 0) + 0.42;
      put('earth_wall', F.Pf(c - w, -0.02), F.Pf(c + w, -0.004), fy, fy + ht);
      if (h < 0.15) put('earth_wall', F.Pf(c - w * 0.6, -0.035), F.Pf(c + w * 0.6, -0.019), fy + ht, fy + ht + 0.3 + 0.35 * hashAt(q[0], q[1], 9));
    }
  }
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  for (const name of ['indian', 'indian-sanchi', 'sanchi-site']) {
    const E = STYLES[name].elements, fn = E.village_house;
    if (!fn || fn.worn) continue;
    const worn = function (el, ctx) { const r = fn.call(this, el, ctx); if (!el.simple && ctx?.bag) houseWear(el, ctx.bag); return r; };
    worn.worn = true; E.village_house = worn;
  }
}
registerWear();
