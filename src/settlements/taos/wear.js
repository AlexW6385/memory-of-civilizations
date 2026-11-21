// Taos Pueblo c. 1500 — wear on what is used (docs/settlements/taos.md §10.5): the worn sill and the soot of the smoke over each room's doorway, the soot
// round the smoke hole on the roof, the earth trodden dark at the foot of each ladder and the wall rubbed dark by the hands and shoulders of those who climb it.
// Added from here to the style's `pueblo_block` (the style file stays as it was), in materials the plan already holds (no new draw); pure functions of the
// block's own numbers. Nothing is written anywhere: the Pueblos of c. 1500 had no script (§10.5).
import '../../styles/pueblo/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

const ST = 2.7, FIRE = new Set(['home', 'sleep', 'weave']);
let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.pueblo.elements.pueblo_block;
  STYLES.pueblo.elements.pueblo_block = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (!ctx?.bag || el.simple) return r;
    const { bag } = ctx, c = el.cell, fd = el.front === 's' ? 1 : -1;
    const room = (q, y0) => {
      const x0 = el.x0 + q.j * c, z0 = el.z0 + q.i * c, du = x0 + c / 2 + 0.3, s = q.door === 's', g = s ? 1 : -1, wall = s ? z0 + c : z0, hx = x0 + c / 2 + 0.35, hz = z0 + c / 2 - 0.25;
      const put = (mat, xa, xb, ya, yb, za, zb) => bag.add(mat, box(Math.min(xa, xb), ya, Math.min(za, zb), Math.max(xa, xb), yb, Math.max(za, zb)));
      // the sill worn dark in its middle by the feet, and the earth before it trodden (a thin patch at the foot of the door)
      put('pottery_dark', du - 0.3, du + 0.3, y0 + 0.05, y0 + 0.054, wall - g * 0.35, wall + g * 0.05);
      put('banco_rough', du - 0.6, du + 0.6, y0 - 0.02, y0 + 0.006, wall + g * 0.07, wall + g * 0.95);
      if (FIRE.has(q.kind ?? 'home')) {
        // the smoke of the hearth over the doorway where it leaks out under the lintel, a tongue of soot up the face, and the soot round the smoke hole on the roof
        put('lacquer_black', du - 0.38, du + 0.38, y0 + 2.02, y0 + 2.42, wall + g * 0.004, wall + g * 0.016);
        put('lacquer_black', du - 0.2, du + 0.2, y0 + 2.42, y0 + 2.6, wall + g * 0.004, wall + g * 0.014);
        const top = y0 + ST + 0.224, hr = 0.5;
        put('lacquer_black', hx - hr - 0.14, hx + hr + 0.14, top, top + 0.004, hz - hr - 0.14, hz - hr - 0.02);
        put('lacquer_black', hx - hr - 0.14, hx + hr + 0.14, top, top + 0.004, hz + hr + 0.02, hz + hr + 0.14);
      }
    };
    for (const q of el.rooms ?? []) room(q, 0);
    for (const q of el.upper ?? []) {
      room(q, (q.storey - 1) * ST);
      // the terrace before an upper door trodden darker (a patch on the roof, which is flat and level)
      const x0 = el.x0 + q.j * c, z0 = el.z0 + q.i * c, du = x0 + c / 2 + 0.3, y0 = (q.storey - 1) * ST, s = q.door === 's', g = s ? 1 : -1, wall = s ? z0 + c : z0;
      bag.add('pottery_dark', box(du - 0.55, y0, Math.min(wall + g * 0.2, wall + g * 1.4), du + 0.55, y0 + 0.007, Math.max(wall + g * 0.2, wall + g * 1.4)));
    }
    // each ladder: the earth trodden dark at its foot and the wall behind it rubbed dark at the height of the hands
    const d = fd, v = -d;
    for (const l of el.ladders ?? []) {
      const zw = el.z0 + (l.ground ? l.i + (d > 0 ? 1 : 0) : l.i + (d > 0 ? 0 : 1)) * c, yb = l.ground ? 0 : el.heights[l.i][l.j] * ST, lx = el.x0 + l.j * c + 1.0, zf = zw - v * 0.8;
      bag.add('pottery_dark', box(lx - 0.5, yb - 0.02, Math.min(zf - 0.5, zf + 0.5), lx + 0.5, yb + 0.006, Math.max(zf - 0.5, zf + 0.5)));
      for (const [y0, y1] of [[1.1, 1.6], [2.0, 2.45]]) bag.add('pottery_dark', box(lx - 0.42, yb + y0, Math.min(zw - v * 0.02, zw - v * 0.006), lx + 0.42, yb + y1, Math.max(zw - v * 0.02, zw - v * 0.006)));
    }
    return r;
  };
}
registerWear();
