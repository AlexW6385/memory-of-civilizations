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
    const solid = (x0, z0, x1, z1, h) => { const a = W(x0, z0), b = W(x1, z1); col.circle((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.hypot(x1 - x0, z1 - z0) / 2 * 0.9, y, y + h); };
    if (f.kind === 'kitchen') {
      // a brick stove with two iron pots and a chimney hood against the back wall, split wood beside it, a water vat,
      // a low table and two stools; smoke-blackened boards over the stove
      B('brick_grey', -0.95, 0, 1.0, 0.1, 0.78, 1.9); B('iron', -0.8, 0.78, 1.18, -0.45, 0.82, 1.52); B('iron', -0.35, 0.78, 1.18, 0.0, 0.82, 1.52);
      bag.add('iron', lathe([[0.17, 0], [0.2, 0.08], [0.2, 0.2], [0.17, 0.22], [0.001, 0.22]], 10, null, ...(() => { const p = W(-0.62, 1.35); return [p[0], y + 0.8, p[1]]; })()));
      bag.add('iron', lathe([[0.17, 0], [0.2, 0.08], [0.2, 0.2], [0.17, 0.22], [0.001, 0.22]], 10, null, ...(() => { const p = W(-0.17, 1.35); return [p[0], y + 0.8, p[1]]; })()));
      B('wood_dark', -1.0, 1.9, 0.95, 0.15, 2.3, 1.95);
      B('flame', -0.78, 0.2, 1.3, -0.62, 0.3, 1.4);
      solid(-0.95, 1.0, 0.1, 1.9, 0.9);
      obj('firewood', 0.55, 1.6, { len: 0.8, seed: f.i });
      obj('pot', 0.75, 0.5, { kind: 'vat', n: 1 });
      B('timber', -0.6, 0.42, -0.5, 0.2, 0.47, 0.1); for (const [x, z] of [[-0.55, -0.45], [0.15, -0.45], [-0.55, 0.05], [0.15, 0.05]]) B('timber', x - 0.03, 0, z - 0.03, x + 0.03, 0.42, z + 0.03);
      solid(-0.6, -0.5, 0.2, 0.1, 0.5);
      obj('stool', -0.35, -0.8); obj('stool', 0.7, -0.2);
      obj('basket', 0.8, 1.0, { n: 1, seed: f.i + 3 });
      B('cloth_red', -0.04, 1.3, 1.99, 0.3, 2.3, 2.0);          // a couplet on the partition
    } else if (f.kind === 'granary') {
      // the grain store of the second floor: bins of boards, sacks, baskets, a winnowing basket on the wall
      B('timber', -1.05, 0, 0.6, 0.0, 0.9, 1.95); B('timber', -1.07, 0.9, 0.58, 0.02, 0.95, 1.97); B('wicker', -1.0, 0.95, 0.65, -0.05, 0.99, 1.9);
      solid(-1.05, 0.6, 0.0, 1.95, 1.0);
      obj('sacks', 0.55, 1.5, { n: 5, seed: f.i });
      obj('basket', 0.7, 0.3, { n: 2, seed: f.i + 11 });
      bag.add('wicker', lathe([[0.4, 0], [0.38, 0.04], [0.001, 0.05]], 14).rotateX(Math.PI / 2).translate(...(() => { const p = W(0.5, 1.96); return [p[0], y + 1.5, p[1]]; })()));
    } else {
      // a bedroom: a plank bed with a frame for the net, a chest at its foot, a lamp
      B('timber', -1.1, 0.12, 0.0, 0.2, 0.5, 2.0); B('cloth_white', -1.05, 0.5, 0.1, 0.15, 0.58, 1.95); B('cloth_indigo', -1.02, 0.58, 0.9, 0.12, 0.64, 1.95);
      for (const [x, z] of [[-1.1, 0.02], [0.2, 0.02], [-1.1, 1.98], [0.2, 1.98]]) B('timber', x - 0.03, 0, z - 0.03, x + 0.03, 2.0, z + 0.03);
      B('timber', -1.1, 1.97, 0.0, 0.2, 2.0, 2.0);
      B('cloth_white', -1.1, 1.2, 0.0, -1.085, 2.0, 2.0);
      solid(-1.1, 0.0, 0.2, 2.0, 1.0);
      B('timber_red', 0.45, 0, 1.2, 1.05, 0.55, 1.9); solid(0.45, 1.2, 1.05, 1.9, 0.6);
      obj('stool', 0.7, 0.6);
      if (rand() < 0.5) obj('lantern', 0.8, -0.8, { kind: 'paper', h: 1.2 });
    }
  }
  void rod; void box;
}
