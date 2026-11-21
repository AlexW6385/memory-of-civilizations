// Cahokia about 1175 — wear on what is used (docs/settlements/cahokia.md §10.5): the earth trodden dark before every door by the feet of the household, a
// worn pale threshold where the clay sill is crossed, the trodden court before a hall's door and the ground before the charnel house's. Added from here
// to the style's elements (the style files stay as they were), in materials the plans already hold (no new draw); pure functions of each element's own
// numbers. Nothing is written anywhere: the Mississippians of 1175 had no script (§10.5).
import '../../styles/mississippian/index.js';
import { lathe } from '../../core/geom.js';
import { frontRule } from '../../styles/mississippian/front.js';
import { hashAt } from './nightlight.js';
import { STYLES } from '../../core/build.js';

/** A trodden patch: a flat low disc of rx × rz on the ground at (x, z), its rim sinking into the earth so that it has no edge. */
const patch = (bag, mat, x, y, z, rx, rz, a = 0) => bag.add(mat, lathe([[0.001, 0.006], [1, 0.006], [1.15, -0.01]], 12, (t, i) => 1 + 0.12 * Math.sin(t * 3 + i + a), 0, 0, 0).scale(rx, 1, rz).translate(x, y, z));
let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.mississippian.elements;
  const house = E.miss_house, hall = E.chief_hall, charnel = E.charnel_house;
  E.miss_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (!ctx?.bag || el.simple || (el.lod ?? 0) >= 2) return r;
    const { bag } = ctx, [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, g = el.g ?? (() => el.y ?? 0), open = el.open;
    const fr = frontRule(el.seed || 1, el.lod ?? 0, x1 - x0), f = open || el.door !== 'n' ? z1 : z0, sg = f === z0 ? -1 : 1, mx = open ? cx : cx + fr.off, j = hashAt(mx, f, 3) - 0.5;
    const pz = f + sg * 1.0, py = g(mx, pz);
    patch(bag, 'bark_dark', mx + j * 0.3, py, pz, open ? 1.0 : 0.8, 0.7 + 0.2 * (j + 0.5), j * 3);       // the earth trodden dark before the door
    patch(bag, 'silt', mx, g(mx, f + sg * 0.55) + 0.003, f + sg * 0.55, open ? 0.7 : 0.5, 0.28, 1);         // the clay of the threshold worn pale
    return r;
  };
  E.chief_hall = function worn(el, ctx) {
    const r = hall.call(this, el, ctx);
    if (!ctx?.bag) return r;
    const [x0, , x1, z1] = el.rect, cx = (x0 + x1) / 2, y = el.y ?? 0, j = hashAt(cx, z1, 4) - 0.5;
    patch(ctx.bag, 'bark_dark', cx + j * 0.4, y + 0.002, z1 + 2.2, 2.0, 1.4, j * 3);                         // the court trodden before the door
    return r;
  };
  E.charnel_house = function worn(el, ctx) {
    const r = charnel.call(this, el, ctx);
    if (!ctx?.bag) return r;
    const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 9;
    patch(ctx.bag, 'bark_dark', cx, y + 0.002, cz - s / 2 - 1.2, 1.3, 1.0);                                  // before the door: the ground trodden by the bearers
    return r;
  };
}
registerWear();
