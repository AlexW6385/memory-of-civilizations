// The furnished rooms of a round tulou (docs/settlements/hakka-tulou.md §4.1 "Rooms"): on the ground
// floor a kitchen and dining room, on the second floor the grain store, on the third and fourth the
// bedrooms [stated: travelchinaguide; NatGeo]. Each room is a frame at its middle, local z running
// outward to the wall, x across, the door on the gallery side (−z).
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { box, lathe, rod } from '../../core/geom.js';
import { P, lbox } from './geo.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function furnishRooms(el, ctx, { front, wallIn, fl, c, furn }) {
  const { bag, col } = ctx, L = STYLES.life.elements, rc = (front + wallIn) / 2;
  for (const f of furn) {
    const y = fl[f.k], phi = Math.PI / 2 - f.a, [ox, oz] = P(c, rc, f.a), rand = rng(f.i * 31 + f.k * 7 + 5);
    const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, lbox(ox, oz, phi, x0, y + y0, z0, x1, y + y1, z1));
    const W = (x, z) => { const cs = Math.cos(phi), sn = Math.sin(phi); return [ox + x * cs + z * sn, oz - x * sn + z * cs]; };
    const obj = (t, x, z, o = {}) => L[t]({ t, at: W(x, z), y, rot: phi, ...o }, ctx);
    const disc = (x, z, r, h) => { const a = W(x, z); col.circle(a[0], a[1], r, y, y + h); };
    if (f.kind === 'kitchen') {
      // a brick stove with two iron pots against the back wall, split wood, a water vat, a low table and a stool; the aisle from the door stays clear
      B('brick_grey', -1.05, 0, 1.15, -0.3, 0.78, 1.95); B('iron', -0.98, 0.78, 1.28, -0.7, 0.82, 1.55); B('iron', -0.62, 0.78, 1.28, -0.34, 0.82, 1.55);
      for (const x of [-0.84, -0.48]) { const p = W(x, 1.42); bag.add('iron', lathe([[0.15, 0], [0.17, 0.07], [0.17, 0.18], [0.15, 0.2], [0.001, 0.2]], 10, null, p[0], y + 0.8, p[1])); }
      B('wood_dark', -1.08, 1.9, 1.1, -0.25, 2.3, 1.99);
      B('flame', -0.9, 0.2, 1.1, -0.75, 0.3, 1.16);
      disc(-0.68, 1.55, 0.45, 0.9); disc(-0.68, 1.15, 0.3, 0.9);
      obj('firewood', 0.7, 1.75, { len: 0.7, seed: f.i });
      obj('pot', 0.72, 0.95, { kind: 'vat', n: 1 }); disc(0.72, 0.95, 0.38, 0.7);
      B('timber', 0.3, 0.42, -0.3, 1.0, 0.47, 0.35); for (const [x, z] of [[0.35, -0.25], [0.95, -0.25], [0.35, 0.3], [0.95, 0.3]]) B('timber', x - 0.03, 0, z - 0.03, x + 0.03, 0.42, z + 0.03);
      disc(0.65, 0.05, 0.45, 0.5);
      B('timber', -0.95, 0.2, -0.3, -0.6, 0.23, 0.05); B('timber', -0.92, 0, -0.27, -0.88, 0.2, -0.23); B('timber', -0.67, 0, 0.0, -0.63, 0.2, 0.04);
      B('cloth_red', -0.04, 1.3, 1.985, 0.3, 2.3, 1.995);          // a couplet on the wall
    } else if (f.kind === 'granary') {
      // the grain store of the second floor: a bin of boards, sacks, baskets, a winnowing basket on the wall
      B('timber', -1.05, 0, 0.6, -0.35, 0.9, 1.95); B('timber', -1.07, 0.9, 0.58, -0.33, 0.95, 1.97); B('wicker', -1.0, 0.95, 0.65, -0.4, 0.99, 1.9);
      disc(-0.7, 1.0, 0.4, 1.0); disc(-0.7, 1.6, 0.4, 1.0);
      obj('sacks', 0.75, 1.6, { n: 4, seed: f.i }); disc(0.75, 1.6, 0.4, 0.7);
      obj('basket', 0.8, 0.5, { n: 2, seed: f.i + 11 });
      bag.add('wicker', lathe([[0.4, 0], [0.38, 0.04], [0.001, 0.05]], 14).rotateX(Math.PI / 2).translate(...(() => { const p = W(0.45, 1.96); return [p[0], y + 1.5, p[1]]; })()));
    } else {
      // a bedroom: a plank bed with a frame for the net against the back wall, a chest, a lamp; the aisle clear
      B('timber', -1.05, 0.12, 0.35, 0.0, 0.5, 2.0); B('cloth_white', -1.0, 0.5, 0.4, -0.05, 0.58, 1.95); B('cloth_indigo', -0.98, 0.58, 1.0, -0.07, 0.64, 1.95);
      for (const [x, z] of [[-1.05, 0.37], [0.0, 0.37], [-1.05, 1.98], [0.0, 1.98]]) B('timber', x - 0.03, 0, z - 0.03, x + 0.03, 2.0, z + 0.03);
      B('timber', -1.05, 1.97, 0.35, 0.0, 2.0, 2.0);
      B('cloth_white', -1.05, 1.2, 0.35, -1.035, 2.0, 2.0);
      disc(-0.5, 0.9, 0.45, 1.0); disc(-0.5, 1.5, 0.45, 1.0);
      B('timber_red', 0.45, 0, 1.3, 1.05, 0.55, 1.95); disc(0.75, 1.62, 0.4, 0.6);
      if (rand() < 0.6) obj('lantern', 0.8, 0.4, { kind: 'paper', h: 1.5 });
    }
  }
  void rod; void box;
}
