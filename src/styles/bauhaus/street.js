// The street furniture of Dessau about 1927 (docs/settlements/bauhaus-dessau.md §11): kerbs and gutter grates, manhole covers, advertising pillars
// (Litfasssäulen) pasted with posters, newspaper kiosks, the yellow Reichspost letter boxes, hydrants, benches, litter bins, bicycle racks, street-name
// plates, the cast-iron street pump with its trough, and the sports field's goals and markings. One element carries the lists computed from layout.js.
import { S, rng } from './kit.js';

const POSTER = ['car_red', 'cloth_ochre', 'paint_white', 'cloth_blue', 'paint_cab_yellow', 'cloth_green', 'car_cream'];

function pillar(sk, [x, z], r) {
  sk.lathe('iron_galv', [[0.55, 0], [0.55, 0.28], [0.5, 0.3], [0.001, 0.3]], x, 0, z, 14);
  sk.lathe('paint_ferry_green', [[0.5, 0.3], [0.5, 2.55], [0.001, 2.55]], x, 0, z, 14);
  sk.lathe('paint_ferry_green', [[0.54, 2.55], [0.54, 2.62], [0.3, 2.78], [0.001, 2.9]], x, 0, z, 14);
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2, nx = Math.round(Math.cos(a)), nz = Math.round(Math.sin(a));
    for (let t = 0; t < 2; t++) {
      const y0 = 0.5 + t * 1.0, w = 0.34, c = POSTER[Math.floor(r() * POSTER.length)];
      if (nx) sk.b(c, x + nx * 0.49, y0, z - w, x + nx * 0.52, y0 + 0.9, z + w); else sk.b(c, x - w, y0, z + nz * 0.49, x + w, y0 + 0.9, z + nz * 0.52);
      if (nx) sk.b('car_black', x + nx * 0.5, y0 + 0.62, z - w + 0.05, x + nx * 0.53, y0 + 0.75, z + w - 0.05); else sk.b('car_black', x - w + 0.05, y0 + 0.62, z + nz * 0.5, x + w - 0.05, y0 + 0.75, z + nz * 0.53);
    }
  }
  sk.k(x - 0.55, 0, z - 0.55, x + 0.55, 2.9, z + 0.55);
}
function kiosk(sk, [x, z], rot, r) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const bx = (m, u0, u1, y0, y1, v0, v1, solid = false) => { const a = P(u0, v0), b = P(u1, v1); (solid ? sk.s : sk.b).call(sk, m, Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1])); };
  bx('paint_ferry_green', -0.9, 0.9, 0, 0.9, -0.9, 0.9, true); bx('paint_ferry_green', -0.85, 0.85, 0.9, 2.5, -0.85, 0.85, true);
  bx('wood_dark', -1.0, 1.0, 2.5, 2.6, -1.0, 1.0); bx('tile_dark', -1.1, 1.1, 2.6, 2.75, -1.1, 1.1); bx('tile_dark', -0.6, 0.6, 2.75, 2.9, -0.6, 0.6);
  const f = sk.pane; void f;
  bx('glass_outer', -0.6, 0.6, 1.0, 2.1, 0.86, 0.9); bx('wood_painted', -0.9, 0.9, 0.95, 1.0, 0.86, 1.2);
  for (let k = 0; k < 5; k++) bx([POSTER[k % POSTER.length], 'paint_white', 'cloth_grey'][k % 3], -0.55 + k * 0.22, -0.4 + k * 0.22, 1.0, 1.45 + (k % 2) * 0.1, 1.0, 1.04);
  bx('car_black', -0.85, 0.85, 2.15, 2.5, 0.86, 0.9); for (let u = -0.6, k = 0; u < 0.6 && k < 8; k++) { bx('car_cream', u, u + 0.1, 2.22, 2.42, 0.9, 0.92); u += 0.16; }
  for (let k = 0; k < 3; k++) bx(POSTER[(k + 2) % POSTER.length], -0.2 + k * 0.5, 0.15 + k * 0.5, 1.2, 2.0, -0.9, -0.87);
  void r;
}
function postbox(sk, [x, z]) { sk.rod('iron', [x, 0, z], [x, 1.6, z], 0.035, 5); sk.s('paint_cab_yellow', x - 0.17, 1.15, z - 0.12, x + 0.17, 1.7, z + 0.12); sk.b('car_black', x - 0.1, 1.5, z - 0.125, x + 0.1, 1.54, z - 0.12); sk.b('car_black', x - 0.1, 1.5, z + 0.12, x + 0.1, 1.54, z + 0.125); sk.b('car_black', x - 0.17, 1.7, z - 0.12, x + 0.17, 1.74, z + 0.12); }
function hydrant(sk, [x, z]) { sk.lathe('car_red', [[0.1, 0], [0.12, 0.05], [0.1, 0.55], [0.14, 0.6], [0.1, 0.7], [0.001, 0.72]], x, 0, z, 8); sk.rod('car_red', [x - 0.15, 0.45, z], [x + 0.15, 0.45, z], 0.04, 5); }
function bench(sk, [x, z], rot) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const bx = (m, u0, u1, y0, y1, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); sk.b(m, Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1])); };
  for (const u of [-0.75, 0.75]) { bx('iron', u - 0.04, u + 0.04, 0, 0.45, -0.22, 0.22); bx('iron', u - 0.04, u + 0.04, 0.45, 0.9, 0.2, 0.26); }
  for (let k = 0; k < 3; k++) bx('timber', -0.9, 0.9, 0.44, 0.47, -0.22 + k * 0.15, -0.1 + k * 0.15);
  for (let k = 0; k < 3; k++) bx('timber', -0.9, 0.9, 0.55 + k * 0.12, 0.62 + k * 0.12, 0.19, 0.23);
  const a = P(-0.95, -0.25), b = P(0.95, 0.27); sk.k(Math.min(a[0], b[0]), 0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 0.9, Math.max(a[1], b[1]));
}
function bin(sk, [x, z]) { sk.lathe('iron_galv', [[0.2, 0], [0.24, 0.85], [0.001, 0.85]], x, 0, z, 8); sk.rod('iron', [x, 0.85, z], [x, 0.95, z], 0.03, 4); sk.k(x - 0.22, 0, z - 0.22, x + 0.22, 0.9, z + 0.22); }
function rack(sk, [x, z], rot) { const c = Math.cos(rot), s = Math.sin(rot); for (let k = 0; k < 6; k++) { const u = -1.2 + k * 0.48, a = [x + u * c, z - u * s]; sk.rod('steel_grey', [a[0], 0, a[1]], [a[0], 0.75, a[1]], 0.015, 4); } sk.rod('steel_grey', [x - 1.2 * c, 0.75, z + 1.2 * s], [x + 1.4 * c, 0.75, z - 1.4 * s], 0.015, 4); }
function sign(sk, [x, z], rot, r) {
  sk.rod('iron', [x, 0, z], [x, 2.6, z], 0.03, 5);
  const c = Math.cos(rot), s = Math.sin(rot);
  for (const d of [1, -1]) { const a = [x + d * 0.34 * c, z - d * 0.34 * s]; sk.b('paint_blue', Math.min(x, a[0]) - 0.02 * Math.abs(s), 2.4, Math.min(z, a[1]) - 0.02 * Math.abs(c), Math.max(x, a[0]) + 0.02 * Math.abs(s), 2.6, Math.max(z, a[1]) + 0.02 * Math.abs(c)); }
  void r;
}
function pump(sk, [x, z]) { sk.lathe('iron', [[0.16, 0], [0.18, 0.1], [0.1, 0.2], [0.09, 1.0], [0.14, 1.1], [0.001, 1.2]], x, 0, z, 8); sk.rod('iron', [x, 1.0, z], [x + 0.35, 0.85, z], 0.018, 4); sk.s('timber', x - 0.5, 0, z + 0.25, x + 0.5, 0.45, z + 0.7); sk.b('water', x - 0.46, 0.4, z + 0.29, x + 0.46, 0.42, z + 0.66); }
function goal(sk, [x, z], dir) { for (const dz of [-3.66, 3.66]) sk.rod('paint_white', [x, 0, z + dz], [x, 2.44, z + dz], 0.06, 5); sk.rod('paint_white', [x, 2.44, z - 3.66], [x, 2.44, z + 3.66], 0.06, 5); for (const dz of [-3.66, 3.66]) sk.rod('cloth_grey', [x, 2.44, z + dz], [x + dir * 1.6, 0, z + dz], 0.01, 3); }

/** dessau_street: { kerbs: [[x0, z0, x1, z1]...], drains: [[x, z]...], manholes: [[x, z]...], items: [{ k, at, rot, seed }], field: [x0, z0, x1, z1] }. */
export function dessauStreet(el, ctx) {
  const sk = new S(ctx), r = rng(el.seed || 7);
  for (const k of el.kerbs || []) { sk.b('concrete_light', k[0], 0, k[1], k[2], 0.14, k[3]); sk.b('plaster_damp', k[0], 0.14, k[1], k[2], 0.15, k[3]); }
  for (const [x, z, h] of el.drains || []) { if (h) { sk.b('iron', x - 0.35, 0, z - 0.1, x + 0.35, 0.02, z + 0.1); for (let u = -0.3; u <= 0.3; u += 0.1) sk.b('car_black', x + u, 0.0, z - 0.1, x + u + 0.03, 0.021, z + 0.1); } else { sk.b('iron', x - 0.1, 0, z - 0.35, x + 0.1, 0.02, z + 0.35); for (let u = -0.3; u <= 0.3; u += 0.1) sk.b('car_black', x - 0.1, 0.0, z + u, x + 0.1, 0.021, z + u + 0.03); } }
  for (const [x, z] of el.manholes || []) { sk.lathe('iron', [[0.38, 0], [0.38, 0.018], [0.001, 0.018]], x, 0, z, 12); sk.b('car_black', x - 0.3, 0.018, z - 0.015, x + 0.3, 0.02, z + 0.015); sk.b('car_black', x - 0.015, 0.018, z - 0.3, x + 0.015, 0.02, z + 0.3); }
  for (const it of el.items || []) {
    switch (it.k) {
      case 'pillar': pillar(sk, it.at, r); break; case 'kiosk': kiosk(sk, it.at, it.rot || 0, r); break; case 'postbox': postbox(sk, it.at); break;
      case 'hydrant': hydrant(sk, it.at); break; case 'bench': bench(sk, it.at, it.rot || 0); break; case 'bin': bin(sk, it.at); break;
      case 'rack': rack(sk, it.at, it.rot || 0); break; case 'sign': sign(sk, it.at, it.rot || 0, r); break; case 'pump': pump(sk, it.at); break;
      case 'goal': goal(sk, it.at, it.dir || 1); break; default: break;
    }
  }
  if (el.field) {                                     // the markings of the sports field: touchlines, halfway line, centre circle, penalty areas
    const [x0, z0, x1, z1] = el.field, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, t = 0.06, y = 0.012;
    sk.b('paint_white', x0 + 4, y - 0.01, z0 + 3, x1 - 4, y, z0 + 3 + t); sk.b('paint_white', x0 + 4, y - 0.01, z1 - 3 - t, x1 - 4, y, z1 - 3);
    sk.b('paint_white', x0 + 4, y - 0.01, z0 + 3, x0 + 4 + t, y, z1 - 3); sk.b('paint_white', x1 - 4 - t, y - 0.01, z0 + 3, x1 - 4, y, z1 - 3); sk.b('paint_white', cx - t / 2, y - 0.01, z0 + 3, cx + t / 2, y, z1 - 3);
    for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12, b = a + Math.PI / 12; sk.rod('paint_white', [cx + Math.cos(a) * 5, y, cz + Math.sin(a) * 5], [cx + Math.cos(b) * 5, y, cz + Math.sin(b) * 5], 0.03, 3); }
    for (const e of [x0 + 4, x1 - 4]) { const d = e < cx ? 1 : -1; sk.b('paint_white', Math.min(e, e + d * 8), y - 0.01, cz - 6, Math.max(e, e + d * 8), y, cz - 6 + t); sk.b('paint_white', Math.min(e, e + d * 8), y - 0.01, cz + 6 - t, Math.max(e, e + d * 8), y, cz + 6); sk.b('paint_white', e + d * 8 - (d > 0 ? t : 0), y - 0.01, cz - 6, e + d * 8 + (d > 0 ? 0 : t), y, cz + 6); }
  }
}
