// The built ground of Han Chang'an outside the houses (docs/settlements/han-changan.md §2, §4): the Kunming Lake with its dike, the
// pavilion on its shore and the tower-ship at anchor, the imperial pond in the palace's garden, the covered corridors (lang) of the
// court, the Imperial Academy's pieces.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { roofs, eaveTilesGable, TAU, hipLite } from './kit.js';
import { pavilion } from './walls.js';

const ellipse = (c, rx, rz, y, n = 56) => {
  const T = [];
  for (let k = 0; k < n; k++) { const a = k / n * TAU, b = (k + 1) / n * TAU; T.push(c[0], y, c[1], c[0] + Math.cos(b) * rx, y, c[1] + Math.sin(b) * rz, c[0] + Math.cos(a) * rx, y, c[1] + Math.sin(a) * rz); }
  return T;
};
/** han_lake: { c, rx, rz, y (water level), pier: [x, z] (a landing stage's end), seed } — the water, a low earth dike with stone footing along the near shore, the pavilion, the tower-ship. */
export function lake(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c;
  bag.add('water', fromTriangles(ellipse(el.c, el.rx * 0.99, el.rz * 0.99, el.y)));
  // the stone footing of the shore: a ring of coping blocks just above the water
  const n = 72, T = [];
  for (let k = 0; k < n; k++) {
    const a = k / n * TAU, b = (k + 1) / n * TAU, p = (t, s) => [cx + Math.cos(t) * el.rx * s, cz + Math.sin(t) * el.rz * s];
    const A0 = p(a, 1.0), B0 = p(b, 1.0), A1 = p(a, 1.045), B1 = p(b, 1.045);
    T.push(A0[0], el.y + 0.25, A0[1], B0[0], el.y + 0.25, B0[1], B1[0], el.y + 0.25, B1[1], A0[0], el.y + 0.25, A0[1], B1[0], el.y + 0.25, B1[1], A1[0], el.y + 0.25, A1[1]);
  }
  bag.add('bluestone', fromTriangles(T));
  // the landing stage: a timber pier running into the lake with a pavilion at its end
  const [px, pz] = el.pier, ex = cx + (px - cx) * 0.55, ez = cz + (pz - cz) * 0.55;
  const dx = ex - px, dz = ez - pz, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  for (let s = 0; s < L; s += 2) { const x = px + ux * s, z = pz + uz * s; bag.add('timber', box(x - 1.3, el.y + 0.55, z - 1.3, x + 1.3, el.y + 0.7, z + 1.3)); }
  col.floor([Math.min(px, ex) - 1.3, Math.min(pz, ez) - 1.3, Math.max(px, ex) + 1.3, Math.max(pz, ez) + 1.3], el.y + 0.7);
  for (let s = 0; s < L; s += 4) for (const o of [-1.3, 1.3]) bag.add('timber_red', box(px + ux * s + (uz !== 0 ? o : 0) - 0.1, el.y - 1.5, pz + uz * s + (ux !== 0 ? o : 0) - 0.1, px + ux * s + (uz !== 0 ? o : 0) + 0.1, el.y + 1.4, pz + uz * s + (ux !== 0 ? o : 0) + 0.1));
  pavilion({ c: [ex, ez], A: 3.4, B: 3.4, y: el.y + 0.7, h: 3.4, walls: false, tiers: 1 }, ctx);
  void roofs; void eaveTilesGable;
}
/** han_ship: { at: [x, z], y (water), len, yaw (0: bow toward +x) } — a tower-ship (louchuan) at anchor: a flat hull, a deck house of two tiers with a pavilion roof, a mast and pennants. */
export function ship(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, L = el.len ?? 16, B = 4.4, y = el.y, alongX = !el.yaw;
  const bx = (u, v, y0, y1, m) => (alongX ? bag.add(m, box(x + u[0], y0, z + v[0], x + u[1], y1, z + v[1])) : bag.add(m, box(x + v[0], y0, z + u[0], x + v[1], y1, z + u[1])));
  bx([-L / 2, L / 2], [-B / 2, B / 2], y - 0.6, y + 0.9, 'timber');
  bx([-L / 2 - 1.5, -L / 2], [-B / 4, B / 4], y + 0.1, y + 1.1, 'timber');
  bx([L / 2, L / 2 + 1.8], [-B / 4, B / 4], y + 0.1, y + 1.6, 'timber');
  bx([-L / 2, L / 2], [-B / 2 - 0.1, B / 2 + 0.1], y + 0.7, y + 0.85, 'lacquer_red');
  bx([-L / 2, L / 2], [-B / 2, B / 2], y + 0.9, y + 1.0, 'wood_dark');
  bx([-4, 3], [-1.8, 1.8], y + 1.0, y + 3.0, 'lime_plaster');
  bx([-4.4, 3.4], [-2.2, 2.2], y + 3.0, y + 3.2, 'timber_red');
  bx([-2.5, 1.5], [-1.4, 1.4], y + 3.2, y + 5.0, 'lime_plaster');
  const c = [x, z], hip = (a, b, yy, r) => hipLite({ c: [x + (alongX ? -0.5 : 0), z + (alongX ? 0 : -0.5)], A: alongX ? a : b, B: alongX ? b : a, y: yy, rise: r, lift: 0.3, pow: 1.2, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true }, ctx);
  void c; hip(4.8, 2.9, y + 3.1, 1.3); hip(3.1, 2.1, y + 5.0, 1.8);
  bag.add('timber', lathe([[0.1, 0], [0.07, 9]], 6, null, x + (alongX ? 6 : 0), y + 1.0, z + (alongX ? 0 : 6)));
  bag.add('cloth_red', box(x + (alongX ? 6.05 : 0) - 0.02, y + 7.4, z + (alongX ? 0 : 6.05) - 0.02, x + (alongX ? 6.05 : 0) + (alongX ? 0.02 : 1.8), y + 9.4, z + (alongX ? 0 : 6.05) + (alongX ? 1.8 : 0.02)));
}
/** han_pond: { rect, y } — the imperial garden's pond: its water and a stone coping round it, a bridge of timber across the narrow middle. */
export function pond(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y;
  const T = [];
  const q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
  q([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]);
  bag.add('water', fromTriangles(T));
  for (const r of [[x0 - 0.8, z0 - 0.8, x1 + 0.8, z0], [x0 - 0.8, z1, x1 + 0.8, z1 + 0.8], [x0 - 0.8, z0, x0, z1], [x1, z0, x1 + 0.8, z1]]) bag.add('bluestone', box(r[0], y - 1.2, r[1], r[2], y + 0.35, r[3]));
  // the zigzag bridge's deck across the middle of the pond (a walk), with red rails
  const bz = (z0 + z1) / 2;
  bag.add('timber', box(x0 - 0.8, y + 0.35, bz - 1.2, x1 + 0.8, y + 0.5, bz + 1.2)); col.floor([x0 - 0.8, bz - 1.2, x1 + 0.8, bz + 1.2], y + 0.5);
  for (const s of [-1, 1]) { bag.add('lacquer_red', box(x0, y + 0.5, bz + s * 1.2 - 0.05, x1, y + 0.6, bz + s * 1.2 + 0.05)); bag.add('lacquer_red', box(x0, y + 1.1, bz + s * 1.2 - 0.05, x1, y + 1.2, bz + s * 1.2 + 0.05)); for (let x = x0; x <= x1; x += 3) bag.add('lacquer_red', box(x - 0.07, y + 0.5, bz + s * 1.2 - 0.07, x + 0.07, y + 1.2, bz + s * 1.2 + 0.07)); }
}
/** han_corridor: { a, b (centre line, axis-aligned), w, h, wall (+1/−1: a plastered back wall on that side), y } — a covered corridor (lang): posts at 3.2 m, a gabled tile roof. */
export function corridor(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, w = el.w ?? 3.4, h = el.h ?? 3.6, y = el.y ?? 0, alongX = Math.abs(bx - ax) >= Math.abs(bz - az);
  const L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), n = Math.max(1, Math.round(L / 3.2)), cx = (ax + bx) / 2, cz = (az + bz) / 2;
  for (let i = 0; i <= n; i++) for (const s of [-1, 1]) {
    const u = -L / 2 + L * i / n, x = alongX ? Math.min(ax, bx) + L / 2 + u : cx + s * w / 2, z = alongX ? cz + s * w / 2 : Math.min(az, bz) + L / 2 + u;
    bag.add('timber_red', lathe([[0.22, 0], [0.2, h]], 8, null, x, y, z)); bag.add('bluestone', box(x - 0.32, y, z - 0.32, x + 0.32, y + 0.2, z + 0.32)); col.circle(x, z, 0.24, y, y + h);
  }
  const ex = alongX ? [Math.min(ax, bx), Math.max(ax, bx)] : [cx - w / 2 - 0.2, cx + w / 2 + 0.2], ez = alongX ? [cz - w / 2 - 0.2, cz + w / 2 + 0.2] : [Math.min(az, bz), Math.max(az, bz)];
  bag.add('timber_red', box(ex[0], y + h - 0.4, ez[0], ex[1], y + h, ez[1]));
  if (el.wall) {
    const s = el.wall, r = alongX ? [ex[0], cz + s * w / 2 - 0.2, ex[1], cz + s * w / 2 + 0.2] : [cx + s * w / 2 - 0.2, ez[0], cx + s * w / 2 + 0.2, ez[1]];
    bag.add('lime_plaster', box(r[0], y, r[1], r[2], y + h - 0.4, r[3])); col.rect(r, y, y + h - 0.4);
  }
  const ov = 0.9;
  roofs().gable_roof_c({ c: [cx, cz], A: L / 2, B: w / 2 + ov, y: y + h - 0.1, rise: 1.2, mat: 'tile_grey', soffit: 'timber_red', noHorns: true, alongZ: !alongX }, ctx);
}
