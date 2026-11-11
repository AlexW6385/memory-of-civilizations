// Monuments of the Karnak axis (docs/settlements/thebes.md §2, §5): the ram-headed sphinxes of the avenue, the seated
// colossi at the gate, the obelisks, the cedar flagstaffs with their banners.
import { lathe, box, frustum, fromTriangles, addCloth, clothBox, place, rod } from '../../core/geom.js';
import { glyphs, TAU } from './kit.js';

/** An ellipsoid (unit sphere scaled): centre, radii. */
function ellip(cx, cy, cz, rx, ry, rz, seg = 14) {
  const prof = Array.from({ length: 9 }, (_, i) => { const t = Math.PI * i / 8; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; });
  const g = lathe(prof, seg); g.scale(rx, ry, rz); g.translate(cx, cy, cz); return g;
}
const bar = (a, b, r, n = 6) => rod(a, b, r, n);

/**
 * nk_ram: a criosphinx { at, y, yaw (0 faces +z) }: the lion's body crouched on a plinth, the ram's head with its curled
 * horns and the sun disc, the little standing king between the forepaws.
 */
export function ram(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, S = 'sandstone_dressed', parts = [];
  const add = (mat, g) => { place(g, x, y, z, yaw); bag.add(mat, g); };
  add(S, box(-0.85, 0, -2.0, 0.85, 0.5, 1.95));                                                    // the plinth
  add(S, ellip(0, 1.1, -0.35, 0.58, 0.58, 1.2));                                                   // the haunch and body
  add(S, ellip(0, 1.2, 0.5, 0.52, 0.62, 0.62));                                                    // the chest
  for (const s of [-1, 1]) { add(S, box(s * 0.36 - 0.14, 0.5, 0.15, s * 0.36 + 0.14, 1.0, 1.75)); add(S, ellip(s * 0.36, 0.64, 1.7, 0.17, 0.14, 0.2, 8)); }   // the forelegs lying forward, the paws
  for (const s of [-1, 1]) add(S, ellip(s * 0.5, 0.8, -1.05, 0.2, 0.3, 0.55, 8));                  // the hind legs
  add(S, bar([0, 0.75, -1.5], [0.55, 0.62, -1.85], 0.07));                                       // the tail along the flank
  // the head: the ram's long face, the curled horn at each side of it
  add(S, ellip(0, 1.88, 1.05, 0.28, 0.38, 0.34));
  add(S, ellip(0, 1.72, 1.4, 0.17, 0.2, 0.3));
  for (const s of [-1, 1]) {
    const pts = Array.from({ length: 8 }, (_, i) => { const t = i / 7 * Math.PI * 1.45; return [s * (0.36 + 0.2 * Math.sin(t)), 1.9 - 0.2 * (1 - Math.cos(t)) - 0.04 * i, 1.02 - 0.14 * Math.sin(t * 0.5) - 0.05 * (1 - Math.cos(t))]; });
    for (let i = 0; i < pts.length - 1; i++) add(S, bar(pts[i], pts[i + 1], 0.075 - 0.006 * i, 5));
  }
  add('gold', lathe([[0.001, 0], [0.26, 0.0], [0.26, 0.05], [0.001, 0.07]], 10, null, 0, 2.25, 1.05));        // the sun disc between the horns
  // the king between the forepaws: a small standing figure in the nemes, the arms at his sides
  add('granite_grey', box(-0.12, 0.5, 1.05, 0.12, 1.0, 1.28)); add('granite_grey', box(-0.14, 1.0, 1.08, 0.14, 1.32, 1.25)); add('granite_grey', ellip(0, 1.45, 1.17, 0.1, 0.13, 0.1, 8));
  col.rect([x - 1.0, z - 2.1, x + 1.0, z + 2.1].map((v, i) => v), y, y + 2.3);
  void parts;
}
/** colossus: a seated king { at, y, yaw, h (seated height) }: the block throne, legs, torso, arms on the knees, the nemes. */
export function colossus(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, H = el.h ?? 11, m = el.mat ?? 'granite_red', k = H;
  const add = (mat, g) => { place(g, x, y, z, yaw); bag.add(mat, g); };
  const B = (a, b, c, d, e, f, mat = m) => add(mat, box(a * k, b * k, c * k, d * k, e * k, f * k));
  B(-0.22, 0, -0.26, 0.22, 0.3, 0.27, 'sandstone_dressed');                          // the throne's block
  B(-0.2, 0.3, -0.24, 0.2, 0.38, 0.25, 'sandstone_dressed');
  for (const s of [-1, 1]) {
    B(s * 0.15 - 0.075, 0.3, 0.04, s * 0.15 + 0.075, 0.43, 0.38);                      // the thighs
    B(s * 0.15 - 0.065, 0.0, 0.34, s * 0.15 + 0.065, 0.32, 0.46);                      // the shins
    B(s * 0.15 - 0.075, 0.0, 0.44, s * 0.15 + 0.075, 0.07, 0.62);                      // the feet
    B(s * 0.205 - 0.04, 0.46, -0.04, s * 0.205 + 0.04, 0.72, 0.06);                   // the upper arms
    B(s * 0.15 - 0.045, 0.4, 0.04, s * 0.15 + 0.045, 0.47, 0.3);                       // the forearms on the knees
  }
  add(m, frustum([-0.16 * k, -0.09 * k, 0.16 * k, 0.1 * k], 0.38 * k, 0.76 * k, 0.02 * k, 0.02 * k, 0.02 * k, 0.02 * k, { noBottom: true }));   // the torso
  add('sandstone_dressed', box(-0.1 * k, 0.37 * k, -0.095 * k, 0.1 * k, 0.5 * k, 0.11 * k));                       // the kilt
  add(m, ellip(0, 0.83 * k, 0.01 * k, 0.065 * k, 0.085 * k, 0.07 * k, 12));                                          // the head
  add('limestone_carved', frustum([-0.1 * k, -0.08 * k, 0.1 * k, 0.09 * k], 0.76 * k, 0.95 * k, 0.02 * k, 0.02 * k, 0.03 * k, 0.03 * k, { noBottom: true }));   // the nemes
  for (const s of [-1, 1]) add('limestone_carved', box(s * 0.1 * k - 0.025 * k, 0.6 * k, 0.0, s * 0.1 * k + 0.025 * k, 0.8 * k, 0.1 * k));   // the lappets
  add('gold', lathe([[0.001, 0], [0.012 * k, 0.01 * k], [0.008 * k, 0.045 * k], [0.001, 0.05 * k]], 6, null, 0, 0.9 * k, 0.085 * k));   // the uraeus
  add(m, box(-0.012 * k, 0.74 * k, 0.065 * k, 0.012 * k, 0.8 * k, 0.085 * k));                                       // the beard
  const c = Math.cos(yaw), s2 = Math.sin(yaw), pts = [[-0.22, -0.27], [0.22, 0.62]].map(([u, v]) => [x + (c * u + s2 * v) * k, z + (-s2 * u + c * v) * k]);
  col.rect([Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])], y, y + H);
}
/** obelisk: { at, y, h, w (base width) } — a monolith of red granite tapering to a gilded pyramidion, its faces carved with columns of signs. */
export function obelisk(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h, w = el.w ?? h / 10.5, top = 0.62, ph = w * top * 1.25;
  const half = (v) => w / 2 * (1 - (1 - top) * v / (h - ph));
  bag.add('sandstone_dressed', box(x - w * 0.9, y, z - w * 0.9, x + w * 0.9, y + 0.9, z + w * 0.9));
  const y0 = y + 0.9, hs = h - ph - 0.9;
  bag.add('granite_red', frustum([x - w / 2, z - w / 2, x + w / 2, z + w / 2], y0, y0 + hs, w / 2 * (1 - top), w / 2 * (1 - top), w / 2 * (1 - top), w / 2 * (1 - top), { noBottom: true }));
  bag.add('gold', frustum([x - w * top / 2, z - w * top / 2, x + w * top / 2, z + w * top / 2], y0 + hs, y0 + hs + ph, w * top / 2 - 0.01, w * top / 2 - 0.01, w * top / 2 - 0.01, w * top / 2 - 0.01));
  const T = [];
  for (let f = 0; f < 4; f++) {
    const a = f * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
    const pl = (u, v, d) => { const r = half(v) + 0.01 + d; return [x + c * r - s * u, y0 + v, z + s * r + c * u]; };
    for (const du of [-0.28, 0, 0.28]) glyphs(T, pl, du * half(hs * 0.5) * 2, 1.2, hs - 1.0, w * 0.055, f * 31 + Math.round(du * 10) + 5, 0.03);
  }
  if (T.length) bag.add('lacquer_black', fromTriangles(T));
  col.rect([x - w * 0.9, z - w * 0.9, x + w * 0.9, z + w * 0.9], y, y + h);
}
/** nk_flagstaff: a cedar pole with a gilded tip and two banners streaming from it { at, y, h }. */
export function flagstaff(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 40, side = el.side ?? 1;
  bag.add('cedar', lathe([[0.42, 0], [0.4, h * 0.3], [0.3, h * 0.7], [0.16, h]], 10, null, x, y, z));
  bag.add('sandstone_dressed', lathe([[0.62, 0], [0.62, 0.32], [0.54, 0.4], [0.43, 0.42]], 14, null, x, y, z));
  bag.add('bronze', lathe([[0.41, 0.4], [0.45, 0.44], [0.45, 0.75], [0.41, 0.78]], 12, null, x, y, z));
  bag.add('gold', lathe([[0.17, 0], [0.22, 0.4], [0.05, 1.6]], 8, null, x, y + h, z));
  bag.add('cedar', box(x - 0.05, y + h - 2.2, z - 1.0, x + 0.05, y + h - 2.1, z + 1.0));                           // the arm the banners hang from
  const top = y + h - 2.15;
  [['cloth_red', -0.9, 7.5], ['cloth_white', 0.0, 6.5], ['cloth_blue', 0.9, 7.0]].forEach(([mat, dz, L]) => addCloth(bag, mat, clothBox(x + side * 0.1 - 0.02, top - L, z + dz - 0.32, x + side * 0.1 + 0.02, top, z + dz + 0.32, 0.25), top));
  col.circle(x, z, 0.45, y, y + h);
}
