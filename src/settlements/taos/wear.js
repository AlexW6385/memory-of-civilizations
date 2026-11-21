// Taos Pueblo c. 1500 — wear on what is used (docs/settlements/taos.md §10.5): the worn sill and the soot of the smoke over each room's doorway, the soot
// round the smoke hole on the roof, the earth trodden dark at the foot of each ladder and the wall rubbed dark by the hands and shoulders of those who climb it.
// Added from here to the style's `pueblo_block` (the style file stays as it was), in materials the plan already holds (no new draw); pure functions of the
// block's own numbers. Nothing is written anywhere: the Pueblos of c. 1500 had no script (§10.5).
import '../../styles/pueblo/index.js';
import './nightlight.js';
import { box, lathe } from '../../core/geom.js';
import { hashAt } from './nightlight.js';
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
      // the sill worn darker in its middle by the feet
      put('bark_dark', du - 0.22, du + 0.22, y0 + 0.05, y0 + 0.054, wall - g * 0.3, wall + g * 0.04);
      if (FIRE.has(q.kind ?? 'home')) {
        // the smoke of the hearth over the doorway where it leaks out under the lintel, a tongue of soot up the face, and the soot round the smoke hole on the roof
        const j = (hashAt(du, wall, 3) - 0.5) * 0.12, zz = [wall + g * 0.004, wall + g * 0.012];
        put('bark_dark', du - 0.24 + j, du + 0.24 + j, y0 + 1.99, y0 + 2.07, zz[0], zz[1]);
        put('bark_dark', du - 0.09 + j * 1.5, du + 0.09 + j * 1.5, y0 + 2.07, y0 + 2.3, wall + g * 0.006, wall + g * 0.014);
        const top = y0 + ST + 0.224, hr = 0.5;
        put('bark_dark', hx - hr - 0.14, hx + hr + 0.14, top, top + 0.004, hz - hr - 0.14, hz - hr - 0.02);
        put('bark_dark', hx - hr - 0.14, hx + hr + 0.14, top, top + 0.004, hz + hr + 0.02, hz + hr + 0.14);
      }
    };
    for (const q of el.rooms ?? []) room(q, 0);
    for (const q of el.upper ?? []) {
      room(q, (q.storey - 1) * ST);
      // the terrace before an upper door trodden darker (a patch on the roof, which is flat and level)
      const x0 = el.x0 + q.j * c, z0 = el.z0 + q.i * c, du = x0 + c / 2 + 0.3, y0 = (q.storey - 1) * ST, s = q.door === 's', g = s ? 1 : -1, wall = s ? z0 + c : z0;
      bag.add('bark_dark', box(du - 0.4, y0, Math.min(wall + g * 0.2, wall + g * 1.4), du + 0.4, y0 + 0.007, Math.max(wall + g * 0.2, wall + g * 1.4)));
    }
    // each ladder: the earth trodden dark at its foot and the wall behind it rubbed dark at the height of the hands
    const d = fd, v = -d;
    for (const l of el.ladders ?? []) {
      const zw = el.z0 + (l.ground ? l.i + (d > 0 ? 1 : 0) : l.i + (d > 0 ? 0 : 1)) * c, yb = l.ground ? 0 : el.heights[l.i][l.j] * ST, lx = el.x0 + l.j * c + 1.0, zf = zw - v * 0.8;
      const jp = (hashAt(lx, zf, 5) - 0.5) * 0.1;
      bag.add('bark_dark', lathe([[0.001, 0.006], [0.38, 0.006], [0.46, 0.0]], 10, (t, i) => 1 + 0.08 * Math.sin(t * 3 + i), lx + jp, yb, zf));
      for (const [y0, y1, sd] of [[1.25, 1.55, -1], [2.0, 2.3, 1]]) bag.add('bark_dark', box(lx + sd * 0.4 - 0.1, yb + y0, Math.min(zw - v * 0.02, zw - v * 0.006), lx + sd * 0.4 + 0.1, yb + y1, Math.max(zw - v * 0.02, zw - v * 0.006)));
    }
    // canales (docs §11.3): a hollowed-log spout through the parapet above the plaza face of a cell that stands over a lower one, a pale washed streak
    // under its lip and a flat plaster slab on the roof below where the water lands; at x 2.4…2.6 of the cell, clear of the ladders (1.0, 4.0)
    const Hh = el.heights, rd = (i, j) => (Hh[i]?.[j] ?? 0);
    for (let i = 0; i < Hh.length; i++) for (let j = 0; j < Hh[0].length; j++) {
      const n = rd(i, j), m = rd(i + fd, j);
      if (n < 2 || m >= n || el.simple) continue;
      const x0 = el.x0 + j * c, zf = el.z0 + (i + (fd > 0 ? 1 : 0)) * c, px = x0 + 2.4 + 0.2 * hashAt(x0, zf, 9);
      if (hashAt(x0, zf, 4) > 0.5 || (el.ladders ?? []).some((l) => l.j === j && Math.abs(l.i - i) <= 1 && l.b === el.tag)) continue;
      const top = n * ST, run = 0.6, drop = 0.05, lo = Math.min(zf - fd * 0.15, zf + fd * run), hi = Math.max(zf - fd * 0.15, zf + fd * run);
      bag.add('viga', box(px - 0.1, top + 0.06 - drop, lo, px + 0.1, top + 0.26 - drop, hi));
      bag.add('bark_dark', box(px - 0.06, top + 0.2 - drop, Math.min(zf + fd * 0.2, zf + fd * run + 0.004), px + 0.06, top + 0.262 - drop, Math.max(zf + fd * 0.2, zf + fd * run + 0.004)));   // the trough hollowed in its top
      const w = Math.min(zf + fd * 0.021, zf + fd * 0.026), w2 = Math.max(zf + fd * 0.021, zf + fd * 0.026);
      bag.add('kahgel', box(px - 0.11, top - 1.5 - 0.6 * hashAt(px, zf, 2), w, px + 0.11, top + 0.04, w2));
      const sy = m * ST, sl = Math.min(zf + fd * 0.9, zf + fd * 1.7), sh = Math.max(zf + fd * 0.9, zf + fd * 1.7);
      if (m >= 1) bag.add('mud_plaster', box(px - 0.3, sy, sl, px + 0.3, sy + 0.03, sh));
    }
    return r;
  };
}
registerWear();
