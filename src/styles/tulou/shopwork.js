// The open shop-houses of the Hakka hamlet (docs/settlements/hakka-tulou.md §9): the counter under the porch awning laid out by its trade — tea, rice
// wine, preserved greens, cut tobacco [inferred: what a Hakka hill hamlet sold; Yongding cut tobacco and Hakka glutinous-rice wine are the district's
// own, the greens and tea are the hill farm's] — with the keeper standing behind it, an abacus, a steelyard on its cord, a ledger. Local frame of
// the house: x across, z out to the street, the counter's top at y 1.05 over z hz + 0.45 … hz + 1.0, x −3.5 … −1.1, the awning's edge at y 2.2.
import { rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { Matrix4 } from '../../core/three.js';
import { lbox } from './geo.js';

const hash = (a, b) => { let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 7, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** f: { cx, cz, phi, hx, hz, sd, trade, W } — the house's frame. */
export function shopFit(ctx, f) {
  const { bag } = ctx, { cx, cz, phi, hx, hz, sd, trade, W } = f, TOP = 1.05, zc = hz + 0.72;
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(cx, cz, phi, x0, y0, z0, x1, y1, z1));
  const R = (m, a, b, r, seg = 5) => { const p = W(a[0], a[2]), q = W(b[0], b[2]); bag.add(m, rod([p[0], a[1], p[1]], [q[0], b[1], q[1]], r, seg)); };
  // vessels from short fat rods (a belly, a shoulder and a neck): the lathe's solids cost a draw of their own in the town's frame
  const stack = (m, x, y, z, parts, seg = 9) => { const p = W(x, z); let yy = y; for (const [h, r] of parts) { bag.add(m, rod([p[0], yy, p[1]], [p[0], yy + h, p[1]], r, seg)); yy += h; } };
  const jar = (m, x, y, z, h, r, seg = 9) => stack(m, x, y, z, [[h * 0.5, r], [h * 0.3, r * 0.8], [h * 0.25, r * 0.5]], seg);
  const bowl = (m, x, y, z, r) => stack(m, x, y, z, [[r * 0.5, r * 0.6], [r * 0.5, r]], 8);
  const cap = (m, x, y, z, r) => stack(m, x, y, z, [[0.04, r], [0.04, r * 0.5]], 8);
  const hang = (x, y0, y1, z, m, w, d) => { R('timber', [x, y1, z], [x, y0, z], 0.006, 3); B(m, x - w / 2, y1 - d, z - w / 2, x + w / 2, y1, z + w / 2); };

  if (trade === 'tea') {
    // pottery canisters with red cloth lids, a bamboo tray of withered leaf, paper packets on strings, a pot and cups on a tray
    for (let q = 0; q < 4; q++) { const x = -3.3 + q * 0.2, h = 0.26 + 0.04 * (q % 2); jar('pottery_dark', x, TOP, zc - 0.1, h, 0.085); B('cloth_red', x - 0.05, TOP + h * 1.05, zc - 0.15, x + 0.05, TOP + h * 1.05 + 0.03, zc - 0.05); }
    B('timber', -2.5, TOP, hz + 0.58, -1.95, TOP + 0.035, hz + 0.9); B('timber', -2.5, TOP, hz + 0.58, -2.47, TOP + 0.09, hz + 0.9); B('timber', -1.98, TOP, hz + 0.58, -1.95, TOP + 0.09, hz + 0.9);
    B('cloth_red', -2.45, TOP + 0.035, hz + 0.62, -2.02, TOP + 0.12, hz + 0.86);
    for (let q = 0; q < 4; q++) hang(-3.25 + q * 0.5, 1.75, 2.18, hz + 0.78 + 0.05 * (q % 2), q % 2 ? 'terracotta' : 'wood_dark', 0.12, 0.16);
    B('timber', -1.78, TOP, hz + 0.6, -1.3, TOP + 0.015, hz + 0.9); jar('terracotta', -1.6, TOP + 0.015, hz + 0.75, 0.1, 0.07, 9);
    for (const x of [-1.45, -1.38]) bowl('wood_dark', x, TOP + 0.015, hz + 0.68 + (x < -1.4 ? 0 : 0.1), 0.03);
  } else if (trade === 'wine') {
    // great jars with a red cloth bound over the mouth, bamboo-tube measures with long handles, cups, a funnel, a jar on the floor at the counter's end
    for (let q = 0; q < 3; q++) { const x = -3.2 + q * 0.5; jar('pottery_dark', x, TOP, zc - 0.05, 0.48, 0.2, 12); cap('cloth_red', x, TOP + 0.48 * 1.05 - 0.01, zc - 0.05, 0.19); }
    for (let q = 0; q < 3; q++) { const x = -3.28 + q * 0.5 + 0.2; R('timber', [x, TOP, hz + 0.58], [x + 0.06, TOP + 0.62, hz + 0.5], 0.014, 4); B('timber', x - 0.03, TOP, hz + 0.57, x + 0.03, TOP + 0.13, hz + 0.63); }
    for (let q = 0; q < 4; q++) bowl('wood_dark', -1.78 + q * 0.12, TOP, hz + 0.75, 0.035);
    jar('pottery_dark', -3.72, 0, hz + 0.9, 0.62, 0.24, 12); cap('cloth_red', -3.72, 0.62 * 1.05 - 0.01, hz + 0.9, 0.22);
    hang(-2.2, 1.85, 2.18, hz + 0.8, 'cloth_red', 0.1, 0.5);
  } else if (trade === 'pickles') {
    // preserved greens: dark bundles hung along a pole under the awning, open jars and baskets of dried vegetable on the counter
    R('timber', [-3.4, 2.1, hz + 0.8], [-1.2, 2.1, hz + 0.8], 0.018, 4);
    for (let q = 0; q < 8; q++) { const x = -3.28 + q * 0.27, h = 0.36 + 0.14 * hash(sd, q); B(q % 3 === 0 ? 'cloth_red' : 'wood_dark', x - 0.055, 2.1 - h, hz + 0.745, x + 0.055, 2.09, hz + 0.855); B('wood_dark', x - 0.04, 2.1 - h - 0.07, hz + 0.76, x + 0.04, 2.1 - h, hz + 0.84); }
    for (let q = 0; q < 3; q++) { const x = -3.2 + q * 0.5; jar(q % 2 ? 'terracotta' : 'pottery_dark', x, TOP, zc - 0.12, 0.3, 0.14, 10); B(q === 1 ? 'terracotta' : 'wood_dark', x - 0.1, TOP + 0.26, zc - 0.22, x + 0.1, TOP + 0.31, zc - 0.02); }
    for (const x of [-1.9, -1.55]) { bowl('terracotta', x, TOP, zc + 0.02, 0.15); B('terracotta', x - 0.1, TOP + 0.08, zc - 0.08, x + 0.1, TOP + 0.15, zc + 0.12); }
  } else {
    // cut tobacco: stacked bundles wrapped in indigo paper tied with ochre, a press of boards with an iron screw, leaves hung to dry from the awning, a bamboo water pipe
    for (let q = 0; q < 3; q++) for (let l = 0; l < 3 - (q % 2); l++) { const x = -3.3 + q * 0.3; B('cloth_red', x - 0.12, TOP + l * 0.09, hz + 0.62, x + 0.12, TOP + l * 0.09 + 0.085, hz + 0.88); B('terracotta', x - 0.015, TOP + l * 0.09, hz + 0.615, x + 0.015, TOP + l * 0.09 + 0.087, hz + 0.885); }
    B('timber', -2.25, TOP, hz + 0.58, -1.65, TOP + 0.04, hz + 0.9); B('timber', -2.2, TOP + 0.04, hz + 0.62, -1.7, TOP + 0.2, hz + 0.86); B('timber', -2.28, TOP + 0.2, hz + 0.6, -1.62, TOP + 0.24, hz + 0.88);
    R('iron', [-1.95, TOP + 0.24, hz + 0.74], [-1.95, TOP + 0.5, hz + 0.74], 0.017, 6); R('timber', [-2.12, TOP + 0.5, hz + 0.74], [-1.78, TOP + 0.5, hz + 0.74], 0.016, 5);
    for (let q = 0; q < 4; q++) hang(-3.2 + q * 0.55, 1.65, 2.18, hz + 0.8 + 0.04 * (q % 2), 'wood_dark', 0.16, 0.5);
    R('timber', [-1.45, TOP + 0.03, hz + 0.9], [-1.25, TOP + 0.3, hz + 0.58], 0.026, 6); jar('bronze', -1.45, TOP, hz + 0.92, 0.07, 0.03, 8);
  }
  // the keeper's tools: an abacus, a ledger and brush, a steelyard on its cord from the awning's beam
  B('wood_dark', -1.5, TOP, hz + 0.9, -1.2, TOP + 0.02, hz + 0.98); for (let q = 0; q < 4; q++) { const x = -1.46 + q * 0.08; R('bronze', [x, TOP + 0.02, hz + 0.9], [x, TOP + 0.02, hz + 0.98], 0.004, 3); }
  B('wood_dark', -1.9, TOP, hz + 0.95, -1.7, TOP + 0.015, hz + 1.0);
  R('timber', [-1.0, 2.2, hz + 1.0], [-1.0, 1.86, hz + 1.0], 0.006, 3); R('timber', [-1.0, 1.86, hz + 0.78], [-1.0, 1.86, hz + 1.2], 0.011, 5); stack('bronze', -1.0, 1.72, hz + 0.84, [[0.07, 0.03]], 8);
  // the keeper behind the counter (a woman at the tea and the greens, a man at the wine and the tobacco), facing the road
  const woman = trade === 'tea' || trade === 'pickles';
  if (!f.nokeeper) STYLES.life.elements.figure({ t: 'figure', at: W(-2.3, hz + 0.2), y: 0, rot: phi + Math.PI, seed: 5000 + sd, dress: 'trousers', cloth: woman ? 'cloth_red' : 'wood_dark', cloth2: 'wood_dark', over: 'none', skin: 'skin_medium', hat: woman ? 'none' : 'cap', hair: woman ? 'bun' : 'short', feet: 'shod', pose: 'stand', carry: 'none', beard: false }, ctx);
  void Matrix4; void hx;
}
