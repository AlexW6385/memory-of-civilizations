// Kilwa about 1330 — wear on what is entered (docs/settlements/kilwa.md §22.5): the hollow worn in the threshold of an opened house's street door by the feet that
// cross it, the polish of the baraza benches where men sit, the feet-worn plaster inside the Great Mosque's doorways. Wraps the style's elements from here
// (the style files stay as they were); pure functions of each element's own numbers. Nothing is written anywhere: Archnet records no inscription in the Great
// Mosque (§20), and a legible Arabic text cannot be drawn correctly here (§22.5).
import '../../styles/swahili/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseFacts } from '../../styles/swahili/house.js';

const T = 0.42;
let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.swahili.elements, house = E.swahili_house, mosque = E.swahili_mosque;
  E.swahili_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (!el.open || el.simple) return r;
    const f = houseFacts(el), [x0, , x1] = el.rect, cf = (el.y ?? 0) + 0.05, o = f.out, { bag } = ctx;
    const put = (mat, u0, u1, z0, z1, y0, y1) => bag.add(mat, box(u0, y0, Math.min(z0, z1), u1, y1, Math.max(z0, z1)));
    // the threshold: a darker hollow worn across the door-stone, wider where the feet come and go
    put('plaster_damp', f.doorX - 0.4, f.doorX + 0.4, f.front - o * 0.04, f.front - o * (T - 0.04), cf, cf + 0.03);
    put('plaster_damp', f.doorX - 0.28, f.doorX + 0.28, f.front - o * 0.08, f.front - o * (T - 0.1), cf + 0.03, cf + 0.036);
    // the benches' tops polished pale where men sit (the benches of house.js: 1.5 m either side of the door if they fit)
    for (const s of [-1, 1]) { const a = s < 0 ? f.doorX - 0.75 - 1.5 : f.doorX + 0.75, b = a + 1.5; if (a > x0 + 0.1 && b < x1 - 0.1) put('plaster_streak', a + 0.35, b - 0.2, f.front + o * -0.3, f.front + o * -0.3 + o * -0.12, cf + 0.46, cf + 0.485); }
    return r;
  };
  E.swahili_mosque = function worn(el, ctx) {
    const r = mosque.call(this, el, ctx);
    const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, b = el.bay ?? 4.5, { bag } = ctx;
    // inside each doorway: the floor worn grey by the feet of those who come in with the sand of the street
    for (const [a, c, alongX, zz, sg] of [[x0, x1, true, z0, 1], [x0, x1, true, z1, -1], [z0, z1, false, x0, 1], [z0, z1, false, x1, -1]]) {
      const L = c - a, n = Math.floor(L / (b * 2));
      for (let i = 0; i < n; i += 2) {
        const u = a + (i + 0.5) * L / n, d0 = 0.45, d1 = 1.6, p0 = zz + sg * d0, p1 = zz + sg * d1;
        bag.add('plaster_damp', alongX ? box(u - 0.7, y, Math.min(p0, p1), u + 0.7, y + 0.016, Math.max(p0, p1)) : box(Math.min(p0, p1), y, u - 0.7, Math.max(p0, p1), y + 0.016, u + 0.7));
      }
    }
    return r;
  };
}
registerWear();
