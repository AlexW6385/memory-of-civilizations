// Kilwa about 1330 — wear on what is entered (docs/settlements/kilwa.md §22.5): the hollow worn in the threshold of an opened house's street door by the feet that
// cross it, the polish of the baraza benches where men sit, the feet-worn plaster inside the Great Mosque's doorways. Wraps the style's elements from here
// (the style files stay as they were); pure functions of each element's own numbers. Nothing is written anywhere: Archnet records no inscription in the Great
// Mosque (§20), and a legible Arabic text cannot be drawn correctly here (§22.5).
import '../../styles/swahili/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseFacts } from '../../styles/swahili/house.js';
import { hashAt } from './nightlight.js';
import { height } from './layout.js';

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
    // the doors' leaves, folded back against the inner face of the wall (§23.2): two plank leaves with cross-battens, the hinge side to the jamb
    // (they stand clear of the 1.6 m of the opening and clear of the archivolts' stepped bands)
    const DOORS = [], wall = (a, c, alongX, zz, sg) => { const L = c - a, n = Math.floor(L / (b * 2)); for (let i = 0; i < n; i += 2) DOORS.push({ u: a + (i + 0.5) * L / n, alongX, zz, sg }); };
    wall(x0, x1, true, z0, -1); wall(x0, x1, true, z1, 1); wall(z0, z1, false, x0, -1); wall(z0, z1, false, x1, 1);
    const slab = (alongX, zz, sg, u0, u1, y0, y1, d0, d1) => { const p0 = zz - sg * (0.8 - d0), p1 = zz - sg * (0.8 - d1); bag.add('wood_dark', alongX ? box(u0, y + y0, Math.min(p0, p1), u1, y + y1, Math.max(p0, p1)) : box(Math.min(p0, p1), y + y0, u0, Math.max(p0, p1), y + y1, u1)); };
    for (const d of DOORS) for (const s of [-1, 1]) {
      const a = d.u + s * 1.03, c = d.u + s * 1.65, lo = Math.min(a, c), hi = Math.max(a, c);
      if (!d.alongX && (lo < z0 + 1.2 || hi > z1 - 1.2)) continue;
      slab(d.alongX, d.zz, d.sg, lo, hi, 0.06, 2.3, 0.15, 0.2);
      for (const v of [0.45, 1.15, 1.85]) slab(d.alongX, d.zz, d.sg, lo + 0.02, hi - 0.02, v, v + 0.12, 0.2, 0.235);
    }
    // moss and salt bloom on the outer walls (§23.3): the shaded foot of the walls goes green-black in patches above the damp band, under the spouts, and
    // the salt blooms pale on the harbour side's render; every patch a ragged stack of three, placed by the wall's own numbers
    for (const [a, c, alongX, zz, sg] of [[x0, x1, true, z0, -1], [x0, x1, true, z1, 1], [z0, z1, false, x0, -1], [z0, z1, false, x1, 1]]) {
      const L = c - a, n = Math.floor(L / (b * 2)), cuts = [];
      for (let i = 0; i < n; i += 2) { const u = a + (i + 0.5) * L / n; cuts.push(u); }
      const shaded = sg < 0 || !alongX;
      for (let k = 0; k < Math.floor(L / 2.2); k++) {
        const u = a + 1 + k * 2.2 + hashAt(zz, k, 61) * 1.2;
        if (u > c - 1 || cuts.some((q) => Math.abs(u - q) < 1.5)) continue;
        const moss = hashAt(u, zz, 62) < (shaded ? 0.55 : 0.2), bloom = hashAt(u, zz, 63) < (sg < 0 && alongX ? 0.6 : 0.25);
        const put = (m, u0, u1, v0, v1, dd, d0 = 0.002) => { const p0 = zz + sg * d0, p1 = zz + sg * dd; bag.add(m, alongX ? box(u0, y + v0, Math.min(p0, p1), u1, y + v1, Math.max(p0, p1)) : box(Math.min(p0, p1), y + v0, u0, Math.max(p0, p1), y + v1, u1)); };
        if (moss) for (let j = 0; j < 3; j++) { const w = (0.5 + 0.5 * hashAt(u, j, 64)) * (1 - 0.25 * j), uo = hashAt(u, j, 65) * 0.2; put('plaster_damp', u + uo, u + uo + w, 0.85 + 0.17 * j, 1.02 + 0.17 * j, 0.016); }
        if (bloom) for (let j = 0; j < 2; j++) { const w = 0.35 + 0.45 * hashAt(u, j, 66); put('plaster_streak', u + j * 0.15, u + j * 0.15 + w, 0.1 + 0.28 * j, 0.32 + 0.3 * j, 0.03, 0.014); }
      }
    }
    // the sill outside each doorway: a hollow worn into the dressed step by the feet that come and go
    for (const d of DOORS) {
      const x = d.alongX ? d.u : d.zz + d.sg * 0.6, z = d.alongX ? d.zz + d.sg * 0.6 : d.u, g = Math.max(height(x, z), y) + 0.015, p0 = d.zz + d.sg * 0.05, p1 = d.zz + d.sg * 0.95;
      bag.add('plaster_damp', d.alongX ? box(d.u - 0.5, g, Math.min(p0, p1), d.u + 0.5, g + 0.012, Math.max(p0, p1)) : box(Math.min(p0, p1), g, d.u - 0.5, Math.max(p0, p1), g + 0.012, d.u + 0.5));
    }
    return r;
  };
}
registerWear();
