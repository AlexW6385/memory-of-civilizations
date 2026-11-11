// The Saepta Julia as a market (docs/settlements/rome.md §4.12): a long enclosure of marble-faced walls with gates,
// round it a deep portico on plain columns, in the court a paved floor with a row of statues, fountains of the Aqua
// Virgo and the stalls of the dealers (the shops of the silversmiths and the dealers in luxuries under the portico are
// `taberna_row` elements set against the walls by the settlement). An element `saepta` of the `roman` style:
// { rect, y, gates: { e: [z…], w: [z…], n: [x…], s: [x…] } } — the court is paved, columns stand 7 m in from the wall.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../../objects/index.js';
import './index.js';
import './town.js';
import { putAt } from './dress.js';

const lz = (p, n) => lathe(p, n);

function saepta(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, far = !!el.simple, t = 1.4, H = 11.5, d = el.depth ?? 7, G = el.gates ?? {};
  // the wall, with gates: marble below, plaster-over-brick above (a band of travertine between)
  const run = (axis, c, a, b, gs) => {
    const cuts = (gs ?? []).map((g) => [g - 4, g + 4]).sort((p, q) => p[0] - q[0]);
    let u = a;
    const piece = (u0, u1, ya, yb, m) => {
      if (u1 - u0 < 0.01) return;
      const r = axis === 'x' ? [u0, c - t / 2, u1, c + t / 2] : [c - t / 2, u0, c + t / 2, u1];
      bag.add(m, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); if (ya < 0.1) col.rect(r, y, y + yb);
    };
    for (const [c0, c1] of cuts) { piece(u, c0, -0.4, 5.5, 'marble'); piece(u, c0, 5.5, H, 'brick'); piece(c0, c1, 8.0, H, 'brick'); piece(c0, c1, 8.0, 8.4, 'travertine'); u = c1; }
    piece(u, b, -0.4, 5.5, 'marble'); piece(u, b, 5.5, H, 'brick');
    // the cornice
    const r = axis === 'x' ? [a - 0.2, c - t / 2 - 0.25, b + 0.2, c + t / 2 + 0.25] : [c - t / 2 - 0.25, a - 0.2, c + t / 2 + 0.25, b + 0.2];
    bag.add('travertine', box(r[0], y + H, r[1], r[2], y + H + 0.5, r[3]));
    if (!far) for (let p = a + 5; p < b - 2; p += 7) {
      if (cuts.some(([c0, c1]) => p > c0 - 1.5 && p < c1 + 1.5)) continue;
      const q = axis === 'x' ? [p - 0.4, c - t / 2 - 0.12, p + 0.4, c + t / 2 + 0.12] : [c - t / 2 - 0.12, p - 0.4, c + t / 2 + 0.12, p + 0.4];
      bag.add('travertine', box(q[0], y, q[1], q[2], y + H, q[3]));                      // pilasters
    }
  };
  run('x', z0 + t / 2, x0, x1, G.n); run('x', z1 - t / 2, x0, x1, G.s); run('z', x0 + t / 2, z0, z1, G.w); run('z', x1 - t / 2, z0, z1, G.e);
  // the portico: columns 7 m in from the wall, an entablature and a lean-to of tiles from the wall to the columns
  const xa = x0 + d, xb = x1 - d, za = z0 + d, zb = z1 - d;
  const colAt = (x, z) => {
    const r = 0.45, sh = lz([[r * 1.25, 0], [r * 1.25, 0.28], [r, 0.34], [r * 1.05, 3.4], [r * 0.88, 7.4], [r * 1.12, 7.5], [r * 1.12, 7.7]], 12);
    putAt(bag, 'travertine', sh, x, y, z); putAt(bag, 'travertine', box(-r * 1.55, 7.7, -r * 1.55, r * 1.55, 8.0, r * 1.55), x, y, z);
    col.circle(x, z, r * 1.25, y, y + 8);
  };
  if (!far) {
    for (let z = za; z <= zb + 0.01; z += (zb - za) / Math.round((zb - za) / 4.6)) { colAt(xa, z); colAt(xb, z); }
    for (let x = xa + 4.6; x < xb - 1; x += (xb - xa) / Math.round((xb - xa) / 4.6)) { colAt(x, za); colAt(x, zb); }
  } else for (const [a, b, c, e] of [[xa, za, xa, zb], [xb, za, xb, zb]]) bag.add('travertine', box(a - 0.5, y, b, a + 0.5, y + 8, e));
  for (const r of [[x0, z0, x1, za], [x0, zb, x1, z1], [x0, za, xa, zb], [xb, za, x1, zb]]) {
    bag.add('travertine', box(r[0], y + 8, r[1], r[2], y + 8.8, r[3]));
    bag.add('roof_tile', box(r[0] - (r[0] > x0 ? 0.4 : 0), y + 8.8, r[1] - (r[1] > z0 ? 0.4 : 0), r[2] + (r[2] < x1 ? 0.4 : 0), y + 9.4, r[3] + (r[3] < z1 ? 0.4 : 0)));
  }
  // the floors: flags under the portico, marble in the court with a strip of coloured stone down the middle
  bag.add('flagstone', box(x0, y - 0.3, z0, x1, y, z1)); col.floor(el.rect, y);
  bag.add('marble_floor', box(xa + 0.5, y - 0.3, za + 0.5, xb - 0.5, y + 0.03, zb - 0.5)); col.floor([xa + 0.5, za + 0.5, xb - 0.5, zb - 0.5], y + 0.03);
  const mx = (x0 + x1) / 2;
  bag.add('opus_sectile', box(mx - 2, y, za + 0.5, mx + 2, y + 0.045, zb - 0.5));
  if (far) return;
  // a row of statues down each side of the court, a round fountain every 80 m on the axis
  const Z = STYLES.roman.elements;
  for (let z = za + 14; z < zb - 8; z += 26) for (const s of [-1, 1]) Z.statue({ at: [mx + s * 9, z], y: 0.03, rot: s < 0 ? Math.PI / 2 : -Math.PI / 2, h: 2.1, base: 1.2, mat: ((z / 26 | 0) + (s > 0)) % 2 ? 'marble' : 'gilt_bronze' }, ctx);
  for (let z = za + 40; z < zb - 20; z += 80) Z.fountain({ at: [mx, z], kind: 'round' }, ctx);
  // benches of marble between the columns on the court side
  for (let z = za + 9; z < zb - 6; z += 18) for (const x of [xa + 1.2, xb - 1.2]) { bag.add('marble', box(x - 0.3, y, z - 0.9, x + 0.3, y + 0.45, z + 0.9)); col.rect([x - 0.3, z - 0.9, x + 0.3, z + 0.9], y, y + 0.45); }
}
STYLES.roman.elements.saepta = saepta;
