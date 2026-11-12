// The furnished rooms of a round tulou and of the hamlet's houses (docs/settlements/hakka-tulou.md §4.1 "Rooms"): on the
// ground floor a kitchen and dining room, on the second floor the grain store, on the third and fourth the bedrooms
// [stated: travelchinaguide; NatGeo]; besides them the tool room, the loom, the sitting room with the household altar, and
// the pigsty at the foot of the ring [inferred: the ring's families kept their pigs and tools in their own slice].
// Each room is a frame at its middle, local z running toward the back wall, x across, the door on the −z side.
// `light` rooms get fewer pieces (one obstacle) so that every room of a ring can be furnished; `mirror` swaps the sides.
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { box, lathe, rod } from '../../core/geom.js';
import { P, lbox } from './geo.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * Fill one room. frame: { ox, oz, phi, y } (the room's middle on the floor, its turn, its floor height); kind; opts: light, mirror, seed.
 */
export function fillRoom(ctx, frame, kind, { light = false, mirror = false, seed = 1 } = {}) {
  const { bag, col } = ctx, L = STYLES.life.elements, { ox, oz, phi, y } = frame, rand = rng(seed * 31 + 5), mx = mirror ? -1 : 1;
  const cs = Math.cos(phi), sn = Math.sin(phi);
  const W = (x, z) => [ox + mx * x * cs + z * sn, oz - mx * x * sn + z * cs];
  const Bm = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, mirror ? lbox(ox, oz, phi, -x1, y + y0, z0, -x0, y + y1, z1) : lbox(ox, oz, phi, x0, y + y0, z0, x1, y + y1, z1));
  const R = (m, a, b, r, seg = 5) => { const p = W(a[0], a[2]), q = W(b[0], b[2]); bag.add(m, rod([p[0], y + a[1], p[1]], [q[0], y + b[1], q[1]], r, seg)); };
  const obj = (t, x, z, o = {}) => L[t]({ t, at: W(x, z), y, rot: phi, ...o }, ctx);
  const disc = (x, z, r, h) => { const a = W(x, z); col.circle(a[0], a[1], r, y, y + h); };
  const round = (m, prof, x, yy, z, seg = 10) => { const p = W(x, z); bag.add(m, lathe(prof, seg, null, p[0], y + yy, p[1])); };
  const lamp = (x, z) => { const p = W(x, z); bag.add('flame', lathe([[0.03, 0], [0.01, 0.07], [0.001, 0.1]], 6, null, p[0], y + 1.52, p[1])); };

  if (kind === 'kitchen') {
    // a brick stove with two iron pots against the back wall, split wood, a water vat, a low table and a stool; the aisle from the door stays clear
    Bm('brick_grey', -1.05, 0, 1.15, -0.3, 0.78, 1.95); Bm('iron', -0.98, 0.78, 1.28, -0.7, 0.82, 1.55); Bm('iron', -0.62, 0.78, 1.28, -0.34, 0.82, 1.55);
    for (const x of [-0.84, -0.48]) round('iron', [[0.15, 0], [0.17, 0.07], [0.17, 0.18], [0.15, 0.2], [0.001, 0.2]], x, 0.8, 1.42);
    Bm('wood_dark', -1.08, 1.9, 1.1, -0.25, 2.3, 1.99);                         // the smoke hood
    Bm('flame', -0.9, 0.2, 1.1, -0.75, 0.3, 1.16);
    disc(-0.68, 1.55, 0.45, 0.9);
    obj('firewood', 0.7, 1.75, { len: 0.7, seed: f0(seed) });
    obj('pot', 0.72, 0.95, { kind: 'vat', n: 1 }); disc(0.72, 0.95, 0.38, 0.7);
    if (!light) {
      disc(-0.68, 1.15, 0.3, 0.9);
      Bm('timber', 0.3, 0.42, -0.3, 1.0, 0.47, 0.35); for (const [x, z] of [[0.35, -0.25], [0.95, -0.25], [0.35, 0.3], [0.95, 0.3]]) Bm('timber', x - 0.03, 0, z - 0.03, x + 0.03, 0.42, z + 0.03);
      disc(0.65, 0.05, 0.45, 0.5);
      Bm('timber', -0.95, 0.2, -0.3, -0.6, 0.23, 0.05); Bm('timber', -0.92, 0, -0.27, -0.88, 0.2, -0.23); Bm('timber', -0.67, 0, 0.0, -0.63, 0.2, 0.04);
      Bm('cloth_red', -0.04, 1.3, 1.985, 0.3, 2.3, 1.995);                       // a couplet on the wall
      // a pole under the ceiling with strings of chilli and corn, a ladle and a wok hung on pegs
      R('bamboo_culm', [-0.6, 2.35, 0.5], [0.9, 2.35, 0.5], 0.02, 4);
      for (const [x, m] of [[-0.3, 'cloth_red'], [0.2, 'cloth_ochre'], [0.6, 'cloth_red']]) Bm(m, x - 0.05, 1.75, 0.46, x + 0.05, 2.33, 0.54);
      Bm('iron', 0.2, 1.3, 1.95, 0.7, 1.35, 1.99); Bm('iron', 0.38, 1.5, 1.95, 0.42, 1.8, 1.99);
    }
  } else if (kind === 'granary') {
    // the grain store of the second floor: a bin of boards, sacks, baskets, a winnowing basket on the wall
    Bm('timber', -1.05, 0, 0.6, -0.35, 0.9, 1.95); Bm('timber', -1.07, 0.9, 0.58, -0.33, 0.95, 1.97); Bm('wicker', -1.0, 0.95, 0.65, -0.4, 0.99, 1.9);
    disc(-0.7, 1.0, 0.4, 1.0); disc(-0.7, 1.6, 0.4, 1.0);
    obj('sacks', 0.75, 1.6, { n: 4, seed: f0(seed) }); disc(0.75, 1.6, 0.4, 0.7);
    if (!light) {
      obj('basket', 0.8, 0.5, { n: 2, seed: f0(seed) + 11 });
      const p = W(0.45, 1.96); bag.add('wicker', lathe([[0.4, 0], [0.38, 0.04], [0.001, 0.05]], 14).rotateX(Math.PI / 2).translate(p[0], y + 1.5, p[1]));
      // the rice scoop and the measure on a shelf, a wooden hand mill
      Bm('timber', 0.3, 1.2, 1.7, 1.0, 1.25, 1.99); round('wicker', [[0.001, 0], [0.1, 0.0], [0.11, 0.1], [0.09, 0.1], [0.001, 0.02]], 0.6, 1.25, 1.85);
    }
  } else if (kind === 'tools') {
    // the tool room: hoes and a plough against the back wall, the carrying pole and baskets, a straw hat and a palm-leaf rain cape on pegs
    for (const x of [-0.85, -0.55, -0.25]) { R('timber', [x, 0, 1.78], [x, 1.45, 1.95], 0.022, 5); Bm('iron', x - 0.09, 1.38, 1.88, x + 0.09, 1.46, 1.97); }
    R('timber', [0.45, 0.15, 0.95], [0.45, 1.0, 1.85], 0.035, 5); R('timber', [0.45, 0.12, 0.95], [0.45, 0.12, 1.8], 0.03, 5); Bm('iron', 0.38, 0.0, 0.9, 0.52, 0.14, 1.12);
    R('bamboo_culm', [-1.0, 1.75, 1.95], [1.0, 1.75, 1.95], 0.02, 4);
    Bm('thatch', 0.55, 1.0, 1.9, 0.95, 1.7, 1.97);
    Bm('thatch_palm', -0.2, 1.1, 1.93, 0.25, 1.72, 1.97);
    obj('basket', 0.85, 0.45, { n: 2, seed: f0(seed) + 3 });
    disc(-0.55, 1.75, 0.35, 1.0); disc(0.45, 1.4, 0.4, 0.8);
    if (!light) { obj('barrel', -0.8, 0.7, { seed: f0(seed) }); disc(-0.8, 0.7, 0.35, 0.8); Bm('timber', 0.25, 0.4, -0.3, 0.95, 0.45, 0.1); disc(0.6, -0.1, 0.45, 0.45); }
  } else if (kind === 'loom') {
    // a hand loom of timber: posts, the beams, the warp in indigo, a stool; the cloth rolls on the back beam
    for (const [x, z] of [[-0.6, 0.8], [0.6, 0.8], [-0.6, 1.7], [0.6, 1.7]]) Bm('timber', x - 0.04, 0, z - 0.04, x + 0.04, 1.3, z + 0.04);
    Bm('timber', -0.66, 1.25, 0.76, 0.66, 1.31, 0.84); Bm('timber', -0.66, 1.25, 1.66, 0.66, 1.31, 1.74);
    Bm('timber', -0.64, 0.55, 0.78, 0.64, 0.6, 1.72);
    Bm('cloth_indigo', -0.5, 0.82, 0.85, 0.5, 0.86, 1.7);
    round('cloth_white', [[0.001, 0], [0.07, 0], [0.07, 0.9], [0.001, 0.9]], 0, 0.9, 0.82, 8);
    disc(0, 1.25, 0.8, 1.3);
    if (!light) { Bm('timber', -0.2, 0.4, 0.2, 0.2, 0.45, 0.55); for (const [x, z] of [[-0.18, 0.22], [0.18, 0.22], [-0.18, 0.5], [0.18, 0.5]]) Bm('timber', x - 0.02, 0, z - 0.02, x + 0.02, 0.4, z + 0.02); Bm('wicker', 0.8, 0, 1.55, 1.05, 0.25, 1.9); }
  } else if (kind === 'tea') {
    // the sitting room: a square table and stools, tea things, the household altar on the back wall (a shelf, a tablet, red paper, a lamp)
    obj('tea_table', 0.25, 0.3, { seed: f0(seed) }); disc(0.25, 0.3, 0.7, 0.9);
    Bm('timber_red', -0.55, 1.0, 1.82, 0.55, 1.07, 2.0); Bm('timber_red', -0.55, 0.0, 1.82, 0.55, 0.95, 2.0);
    Bm('lacquer_black', -0.09, 1.07, 1.9, 0.09, 1.55, 1.94); Bm('gilt_bronze', -0.04, 1.2, 1.94, 0.04, 1.42, 1.96); Bm('cloth_red', -0.55, 1.6, 1.97, 0.55, 2.35, 1.99);
    lamp(-0.4, 1.9); lamp(0.4, 1.9);
    disc(0, 1.9, 0.6, 1.1);
    if (!light) { Bm('timber', -1.05, 0.0, 0.2, -0.85, 0.5, 0.8); }
  } else if (kind === 'pen') {
    // the pigsty at the foot of the ring: a low timber fence, straw on the floor, the sow; the trough and the swill barrel near the door
    Bm('thatch', -1.0, 0.0, 0.8, 1.0, 0.04, 1.95);
    Bm('timber', -1.05, 0, 0.75, 1.05, 0.7, 0.8); Bm('timber', -1.05, 0, 0.75, -1.0, 0.7, 1.99); Bm('timber', 1.0, 0, 0.75, 1.05, 0.7, 1.99);
    Bm('timber', -0.4, 0.1, 0.9, 0.4, 0.3, 1.1);
    obj('animal', 0, 1.45, { kind: 'pig', seed: f0(seed), y });
    for (const x of [-0.7, 0, 0.7]) disc(x, 1.4, 0.5, 0.9);
    if (!light) obj('barrel', 0.8, 0.25, { seed: f0(seed) });
  } else {
    // a bedroom: a plank bed with a frame for the net against the back wall, a chest, a lamp; the aisle clear
    Bm('timber', -1.05, 0.12, 0.35, 0.0, 0.5, 2.0); Bm('cloth_white', -1.0, 0.5, 0.4, -0.05, 0.58, 1.95); Bm('cloth_indigo', -0.98, 0.58, 1.0, -0.07, 0.64, 1.95);
    for (const [x, z] of [[-1.05, 0.37], [0.0, 0.37], [-1.05, 1.98], [0.0, 1.98]]) Bm('timber', x - 0.03, 0, z - 0.03, x + 0.03, 2.0, z + 0.03);
    Bm('timber', -1.05, 1.97, 0.35, 0.0, 2.0, 2.0);
    Bm('cloth_white', -1.05, 1.2, 0.35, -1.035, 2.0, 2.0);
    disc(-0.5, 1.2, 0.8, 1.0);
    Bm('timber_red', 0.45, 0, 1.3, 1.05, 0.55, 1.95); disc(0.75, 1.62, 0.4, 0.6);
    if (!light) { if (rand() < 0.6) obj('lantern', 0.8, 0.4, { kind: 'paper', h: 1.5 }); Bm('wood_dark', 0.5, 0.55, 1.4, 0.98, 0.95, 1.9); Bm('cloth_red', 0.6, 0.55, 1.5, 0.75, 0.58, 1.7); }
  }
}
const f0 = (s) => Math.abs(Math.floor(s)) % 997;

export function furnishRooms(el, ctx, { front, wallIn, fl, c, furn }) {
  const rc = (front + wallIn) / 2;
  for (const f of furn) {
    const phi = Math.PI / 2 - f.a, [ox, oz] = P(c, rc, f.a);
    fillRoom(ctx, { ox, oz, phi, y: fl[f.k] }, f.kind, { light: !!f.light, mirror: ((f.i * 7 + f.k * 3) % 5) < 2, seed: f.i * 13 + f.k * 7 + 5 });
  }
  void box; void rod;
}
