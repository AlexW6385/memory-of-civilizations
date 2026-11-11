// The hawkers' stalls of the Rainbow Bridge's approaches (docs/settlements/song-kaifeng.md §10, the scroll): a trestle table with its
// skirt of cloth under a slanted awning of matting on four poles, the goods of the trade laid out on it.

import { lathe, rod, fromTriangles } from '../../core/geom.js';
import { hexa } from './kaifeng.js';

const ball = (r, x, y, z, n = 6) => lathe(Array.from({ length: 5 }, (_, i) => { const t = i / 4 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n, null, x, y - r, z);
const quad = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);

/** hawker_stall { at, y, rot, kind ('fruit' | 'cloth' | 'pots' | 'cakes'), w, awning (cloth material or reed_mat) }: its front toward local +z, turned by rot as the signboard is. */
function hawkerStall(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), sn = Math.sin(el.rot ?? 0), w = (el.w ?? 2.2) / 2, d = 0.4;
  const P = (lx, ly, lz) => [x + lx * c + lz * sn, y + ly, z - lx * sn + lz * c];
  const B = (x0, y0, z0, x1, y1, z1) => [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1), P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
  const wood = [], skirt = [], top = [], goods = {};
  const add = (m, g) => (goods[m] ??= []).push(g);
  // the table: a top, a front skirt of cloth, trestle legs
  hexa(wood, B(-w, 0.78, -d, w, 0.83, d));
  hexa(skirt, B(-w + 0.04, 0.3, d - 0.02, w - 0.04, 0.78, d + 0.015));
  for (const sx of [-1, 1]) { hexa(wood, B(sx * (w - 0.2) - 0.04, 0, -d + 0.05, sx * (w - 0.2) + 0.04, 0.78, -d + 0.1)); hexa(wood, B(sx * (w - 0.2) - 0.04, 0, d - 0.1, sx * (w - 0.2) + 0.04, 0.78, d - 0.05)); }
  hexa(wood, B(-w + 0.1, 0.25, -0.03, w - 0.1, 0.3, 0.03));
  // the poles and the awning: back poles 2.5, front poles 2.1; matting laid over, hanging at the front as a fringe
  for (const sx of [-1, 1]) {
    bag.add('timber', rod(P(sx * (w + 0.1), 0, -d - 0.2), P(sx * (w + 0.1), 2.55, -d - 0.2), 0.045, 6));
    bag.add('timber', rod(P(sx * (w + 0.1), 0, d + 0.45), P(sx * (w + 0.1), 2.1, d + 0.45), 0.04, 6));
    col.circle(...[P(sx * (w + 0.1), 0, d + 0.45)].map((p) => [p[0], p[2]])[0], 0.1, y, y + 2.1);
    bag.add('timber', rod(P(sx * (w + 0.1), 2.55, -d - 0.2), P(sx * (w + 0.1), 2.1, d + 0.45), 0.03, 4));
  }
  const A0 = P(-w - 0.3, 2.62, -d - 0.3), A1 = P(w + 0.3, 2.62, -d - 0.3), A2 = P(w + 0.3, 2.2, d + 0.65), A3 = P(-w - 0.3, 2.2, d + 0.65), up = [], dn = [];
  quad(up, A0, A3, A2, A1); quad(dn, A0, A1, A2, A3);
  const am = el.awning ?? 'reed_mat';
  bag.add(am, fromTriangles(up)); bag.add(am, fromTriangles(dn));
  for (let k = 0; k < 8; k++) { const u0 = -w - 0.3 + k * (2 * w + 0.6) / 8, u1 = u0 + (2 * w + 0.6) / 8 - 0.03, f = []; quad(f, P(u0, 2.2, d + 0.65), P(u1, 2.2, d + 0.65), P(u1, 1.98, d + 0.65), P(u0, 1.98, d + 0.65)); quad(f, P(u0, 2.2, d + 0.65), P(u0, 1.98, d + 0.65), P(u1, 1.98, d + 0.65), P(u1, 2.2, d + 0.65)); add(k % 2 ? 'cloth_white' : 'cloth_ochre', fromTriangles(f)); }
  // the goods
  const kind = el.kind ?? 'fruit', y0 = 0.83;
  if (kind === 'fruit') {
    for (let i = 0; i < 3; i++) {
      const u = (i - 1) * (w * 0.62), cm = ['cloth_red', 'cloth_ochre', 'cloth_green'][i];
      { const q = P(u, y0, 0.05); add('wicker', lathe([[0.3, 0], [0.34, 0.07], [0.001, 0.07]], 10, null, q[0], q[1], q[2])); }
      let n = 0; for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r * 1.4; k++) { const a = k / (4 - r * 1.4) * 6.283, rr = 0.2 - r * 0.07, p = P(u + Math.cos(a) * rr * (r === 2 ? 0.3 : 1), y0 + 0.1 + r * 0.1, 0.05 + Math.sin(a) * rr * (r === 2 ? 0.3 : 1)); add(cm, ball(0.065, p[0], p[1], p[2], 5)); n++; }
    }
  } else if (kind === 'cloth') {
    for (let i = 0; i < 4; i++) for (let r = 0; r < 2 + (i % 2); r++) { const cm = ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green'][(i + r) % 5], u = -w + 0.2 + i * (2 * w - 0.4) / 3, yy = y0 + 0.07 + r * 0.14; add(cm, rod(P(u, yy, -0.28), P(u, yy, 0.28), 0.07, 6)); }
    // a bolt hung over the front of the awning's rail
    for (const u of [-w * 0.5, w * 0.5]) { const t = []; quad(t, P(u - 0.15, 2.18, d + 0.5), P(u + 0.15, 2.18, d + 0.5), P(u + 0.15, 1.45, d + 0.5), P(u - 0.15, 1.45, d + 0.5)); quad(t, P(u - 0.15, 2.18, d + 0.5), P(u - 0.15, 1.45, d + 0.5), P(u + 0.15, 1.45, d + 0.5), P(u + 0.15, 2.18, d + 0.5)); add(u < 0 ? 'cloth_red' : 'cloth_indigo', fromTriangles(t)); }
  } else if (kind === 'pots') {
    for (let i = 0; i < 6; i++) for (let r = 0; r < (i % 2 ? 1 : 2); r++) { const q = P(-w + 0.25 + i * (2 * w - 0.5) / 5, y0 + r * 0.26, 0.0 + (i % 2) * 0.1); add(i % 3 ? 'granite_black' : 'bronze', lathe([[0.001, 0], [0.09, 0.01], [0.15, 0.1], [0.16, 0.18], [0.1, 0.25], [0.11, 0.27], [0.001, 0.26]], 8, null, q[0], q[1], q[2])); }
  } else {
    for (let i = 0; i < 3; i++) { const u = (i - 1) * (w * 0.6), q = P(u, y0, 0.05); add('wicker', lathe([[0.001, 0], [0.26, 0.0], [0.3, 0.15], [0.001, 0.15]], 9, null, q[0], q[1], q[2])); for (let r = 0; r < 4; r++) add('paint_ochre', lathe([[0.001, 0], [0.18, 0], [0.18, 0.045], [0.001, 0.045]], 9, null, q[0], q[1] + 0.13 + r * 0.05, q[2])); }
  }
  bag.add('wood_dark', fromTriangles(wood)); bag.add('cloth_white', fromTriangles(skirt));
  for (const [m, list] of Object.entries(goods)) for (const g of list) bag.add(m, g);
  { const cs = [[-w, -d], [w, -d], [w, d], [-w, d]].map(([u, v]) => P(u, 0, v)); col.rect([Math.min(...cs.map((p) => p[0])), Math.min(...cs.map((p) => p[2])), Math.max(...cs.map((p) => p[0])), Math.max(...cs.map((p) => p[2]))], y, y + 0.9); }
}

export const BRIDGEHEAD_ELEMENTS = { hawker_stall: hawkerStall };
