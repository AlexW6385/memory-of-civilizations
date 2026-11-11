// Street furniture and the engineering of the Wien (docs/settlements/vienna.md §5): the electric tram, the advertising column,
// the Fiaker, tram rails, the walled channel of the Wien with its bridges, the lime-and-plane avenues' benches.
import { box, lathe, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';

/** tram: { at: [x, z], rot (0: along x, heading east), y, seed } — a four-axle electric car of 1902, 9.5 m. */
export function tram(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), L = 9.6, Wd = 2.2;
  const P = (p, q) => [cx + p * c + q * s, cz - p * s + q * c];
  const bx = (m, p0, q0, p1, q1, v0, v1) => { const a = P(p0, q0), b = P(p1, q1); bag.add(m, box(Math.min(a[0], b[0]), y + v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + v1, Math.max(a[1], b[1]))); };
  const lower = el.seed % 2 ? 'cloth_red' : 'paint_cab_yellow';
  bx('wood_dark', -L / 2, -Wd / 2 + 0.1, L / 2, Wd / 2 - 0.1, 0.55, 0.85);                      // the underframe
  bx(lower, -L / 2, -Wd / 2, L / 2, Wd / 2, 0.85, 1.75);                                            // the lower panels
  bx('paint_white', -L / 2, -Wd / 2 - 0.01, L / 2, Wd / 2 + 0.01, 1.75, 1.95);                    // the band
  bx('opening', -L / 2 + 0.3, -Wd / 2 - 0.02, L / 2 - 0.3, Wd / 2 + 0.02, 1.95, 2.75);
  for (let k = 0; k <= 8; k++) { const p = -L / 2 + 0.3 + k * (L - 0.6) / 8; bx('wood_dark', p - 0.04, -Wd / 2 - 0.03, p + 0.04, Wd / 2 + 0.03, 1.95, 2.75); }
  bx('paint_white', -L / 2 + 0.1, -Wd / 2 + 0.05, L / 2 - 0.1, Wd / 2 - 0.05, 2.75, 3.0); bx('lead', -L / 2 + 0.3, -0.5, L / 2 - 0.3, 0.5, 3.0, 3.12);
  for (const sg of [-1, 1]) for (const w of [-2.6, 2.6]) for (const t of [-1, 1]) { const p = P(sg * 0 + w + sg * 0.5, t * 0.72); bag.add('iron', lathe([[0.001, -0.18], [0.36, -0.18], [0.36, 0.18], [0.001, 0.18]], 10, null, 0, 0, 0).rotateX(Math.PI / 2).translate(p[0], y + 0.4, p[1])); }
  { const a = P(-0.5, 0), b = P(-3.2, 0); bag.add('iron', rod([a[0], y + 3.1, a[1]], [b[0], y + 5.4, b[1]], 0.03, 5)); }
  { const p = P(-L / 2, 0), q = P(L / 2, 0); bag.add('lamp_white', box(p[0] - 0.12, y + 1.4, p[1] - 0.12, p[0] + 0.12, y + 1.6, p[1] + 0.12)); void q; }
  const a = P(-L / 2, -Wd / 2), b = P(L / 2, Wd / 2); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 3.1);
}

/** litfass: { at, y, seed } — an advertising column, posters round it under a domed cap. */
export function litfass(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 0.72;
  bag.add('iron', lathe([[0.001, 0], [r + 0.15, 0], [r + 0.15, 0.25], [r, 0.3], [r, 0.4], [0.001, 0.4]], 14, null, x, y, z));
  const bands = [['cloth_red', 'paint_white'], ['paint_ochre', 'cloth_blue'], ['cloth_green', 'paint_white'], ['paint_white', 'cloth_red']];
  for (let k = 0; k < 4; k++) bag.add(bands[(k + (el.seed ?? 0)) % 4][0], lathe([[r, 0.4 + k * 0.5], [r + 0.01, 0.42 + k * 0.5], [r + 0.01, 0.88 + k * 0.5], [r, 0.9 + k * 0.5]], 14, null, x, y, z));
  bag.add('paint_white', lathe([[r, 2.4], [r + 0.012, 2.46], [r + 0.012, 2.7], [r, 2.72]], 14, null, x, y, z));
  bag.add('iron', lathe([[r + 0.1, 2.72], [r + 0.1, 2.8], [r * 0.5, 3.1], [0.001, 3.3]], 14, null, x, y, z));
  bag.add('gilt_bronze', lathe([[0.05, 3.3], [0.001, 3.6]], 6, null, x, y, z));
  col.circle(x, z, r + 0.15, y, y + 3.3);
}

/** fiaker: { at: [x, z], rot, y, seed } — the two-horse carriage of Vienna (the horses are separate animals), its hood folded. */
export function fiaker(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const P = (p, q) => [cx + p * c + q * s, cz - p * s + q * c];   // p along the carriage (forward +), q across
  const bx = (m, p0, q0, p1, q1, v0, v1) => { const a = P(p0, q0), b = P(p1, q1); bag.add(m, box(Math.min(a[0], b[0]), y + v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + v1, Math.max(a[1], b[1]))); };
  bx('lacquer_black', -1.5, -0.55, 1.0, 0.55, 0.65, 1.0); bx('lacquer_black', -1.5, -0.55, -1.4, 0.55, 1.0, 1.55); bx('lacquer_black', -1.5, -0.55, 1.0, -0.5, 1.0, 1.35); bx('lacquer_black', -1.5, 0.5, 1.0, 0.55, 1.0, 1.35);
  bx('leather_bench', -1.3, -0.45, -0.1, 0.45, 1.0, 1.3); bx('leather_bench', 0.1, -0.45, 0.8, 0.45, 1.0, 1.1);
  bx('lacquer_black', 0.6, -0.5, 1.5, 0.5, 1.5, 1.6); bx('lacquer_black', 1.1, -0.35, 1.5, 0.35, 1.0, 1.6);     // the box seat
  bx('leather_bench', 1.1, -0.35, 1.5, 0.35, 1.6, 1.75);
  for (const [p, q, r] of [[-1.0, 0.65, 0.5], [-1.0, -0.65, 0.5], [1.0, 0.6, 0.38], [1.0, -0.6, 0.38]]) { const a = P(p, q); bag.add('iron', lathe([[0.001, -0.03], [r, -0.03], [r, 0.03], [0.001, 0.03]], 14, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(-rot + Math.PI / 2).translate(a[0], y + r, a[1])); }
  bx('wood_dark', 1.0, -0.04, 3.6, 0.04, 0.8, 0.85);                                                            // the pole
  bx('iron', -1.5, -0.5, -0.9, 0.5, 1.55, 1.6);
  const a = P(-1.5, -0.55), b = P(1.5, 0.55); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 1.8);
}

/**
 * wien_channel: the walled river { x0, x1, z0, z1 (the water's banks), top, bed, ledge: { z0, z1, y } } — granite walls with a
 * coping, a railing on the north bank, the rubble bed; on the south the Stadtbahn's ledge (two tracks on ballast) below the
 * street, closed by a retaining wall and a parapet at the street.
 */
export function wienChannel(el, { bag, col }) {
  const { x0, x1, z0, z1, top = 0, bed = -3.6, ledge, gaps = [] } = el, LY = ledge.y;
  const runs = (a0, a1) => { let out = [[a0, a1]]; for (const [g0, g1] of gaps) out = out.flatMap(([p, q]) => (g1 <= p || g0 >= q ? [[p, q]] : [[p, Math.max(p, g0)], [Math.min(q, g1), q]])).filter(([p, q]) => q - p > 0.5); return out; };
  const seg = (f) => { for (let x = x0; x < x1; x += 40) f(x, Math.min(x1, x + 40)); };
  // the north wall (to the street's level) and the south wall (to the ledge)
  seg((a, b) => { bag.add('granite_block', box(a, bed - 0.3, z0 - 1.2, b, top - 0.02, z0)); col.rect([a, z0 - 1.2, b, z0], bed, top); });
  seg((a, b) => { bag.add('granite_block', box(a, bed - 0.3, z1, b, LY - 0.02, z1 + 1.2)); col.rect([a, z1, b, z1 + 1.2], bed, LY); });
  bag.add('sandstone_white', box(x0, top - 0.02, z0 - 1.4, x1, top + 0.18, z0 + 0.1)); bag.add('sandstone_white', box(x0, LY - 0.02, z1 - 0.1, x1, LY + 0.14, z1 + 1.4));
  seg((a, b) => bag.add('pebbles', box(a, bed - 0.3, z0, b, bed, z1)));
  // the north bank's railing, posts every 6 m (open at the bridges)
  for (const [p, q] of runs(x0 + 3, x1 - 3)) {
    for (let x = p; x <= q; x += 6) bag.add('iron', box(x - 0.05, top + 0.18, z0 - 1.3, x + 0.05, top + 1.1, z0 - 1.2));
    bag.add('iron', box(p, top + 1.05, z0 - 1.3, q, top + 1.1, z0 - 1.2)); bag.add('iron', box(p, top + 0.55, z0 - 1.28, q, top + 0.58, z0 - 1.22));
    col.rect([p, z0 - 1.4, q, z0 - 1.1], top, top + 1.2);
  }
  // the ledge: ballast and two tracks; its retaining wall at the street with a parapet (open at the bridges)
  bag.add('pebbles', box(x0, LY - 0.3, ledge.z0, x1, LY, ledge.z1));
  for (const zr of [ledge.z0 + 2.6, ledge.z0 + 5.4]) for (const d of [-0.72, 0.72]) bag.add('iron', box(x0, LY, zr + d - 0.04, x1, LY + 0.14, zr + d + 0.04));
  seg((a, b) => bag.add('granite_block', box(a, LY - 0.3, ledge.z1, b, top - 0.02, ledge.z1 + 0.6)));
  bag.add('sandstone_white', box(x0, top - 0.02, ledge.z1 - 0.1, x1, top + 0.18, ledge.z1 + 0.7));
  for (const [p, q] of runs(x0 + 3, x1 - 3)) { for (let x = p; x <= q; x += 6) bag.add('iron', box(x - 0.05, top + 0.18, ledge.z1 - 0.1, x + 0.05, top + 1.0, ledge.z1)); bag.add('iron', box(p, top + 0.95, ledge.z1 - 0.1, q, top + 1.0, ledge.z1)); col.rect([p, ledge.z1 - 0.2, q, ledge.z1 + 0.6], LY, top + 1.1); }
  // the ends: the walls closed with cheeks
  for (const x of [x0, x1]) bag.add('granite_block', box(x - 0.6, bed - 0.3, z0 - 1.2, x + 0.6, top - 0.02, ledge.z1 + 0.6));
}

/** wien_bridge: { x, z0, z1 (the channel's banks), zEnd (the ledge's far side), w, y } — a stone road bridge over the Wien and the Stadtbahn. */
export function wienBridge(el, { bag, col }) {
  const { x, z0, z1, zEnd, w = 14, top = 0 } = el, a = z0 - 1.4, b = zEnd + 0.7;
  bag.add('granite_block', box(x - w / 2, top - 1.3, a, x + w / 2, top, b));
  bag.add('brick_baked', box(x - w / 2 + 0.2, top - 1.8, a + 0.3, x + w / 2 - 0.2, top - 1.3, b - 0.3));
  // abutments under the deck between the water and the ledge (piers at the walls)
  for (const sg of [-1, 1]) {
    bag.add('sandstone_white', box(x + sg * (w / 2 - 0.3) - 0.3, top, a, x + sg * (w / 2 - 0.3) + 0.3, top + 1.0, b)); col.rect([x + sg * (w / 2 - 0.3) - 0.3, a, x + sg * (w / 2 - 0.3) + 0.3, b], top, top + 1.0);
    for (let q = 0; q < 4; q++) { const zz = a + 0.6 + q * (b - a - 1.2) / 3; bag.add('iron', lathe([[0.12, 0], [0.05, 0.2], [0.04, 1.4]], 8, null, x + sg * (w / 2 - 0.3), top + 1.0, zz)); bag.add('lamp_glass', lathe([[0.001, 0], [0.2, 0.1], [0.001, 0.5]], 8, null, x + sg * (w / 2 - 0.3), top + 2.4, zz)); }
  }
  col.floor([x - w / 2, a, x + w / 2, b], top);
  void z1;
}

/** tram_rails: { z, x0, x1, tracks } — pairs of rails set in the paving along x. */
export function tramRails(el, { bag }) {
  const y = el.y ?? 0;
  for (const zr of el.tracks) for (const d of [-0.72, 0.72]) bag.add('iron', box(el.x0, y, zr + d - 0.035, el.x1, y + 0.05, zr + d + 0.035));
}
