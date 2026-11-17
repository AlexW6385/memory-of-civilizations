// The criosphinx of the avenue (docs/settlements/thebes.md §13): Amun's ram-headed lion crouched on a plinth cut with a row of signs along
// each side — the long ram's face with its arched nose, the horns curling out and down about the ear, the sun disc and the uraeus above,
// the broad collar on the chest, the haunch and the folded hind leg, the tail along the plinth, the paws with their toes — and between the
// forepaws, under the chin, the little standing king in the nemes. Local frame: the head toward +z, the plinth centred on the origin.
import { lathe, box, fromTriangles, place } from '../../core/geom.js';
import { glyphs, ellip, curve, keep, rng, joined } from './kit.js';

const S = 'sandstone_dressed';

/** nk_ram: a criosphinx { at, y, yaw (0 faces +z) } */
export function ram(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const L = new Map();                                                                             // the pieces by material, joined at the end: the 38 copies are then copies of a few shapes
  const A = (mat, g) => { place(g, x, y, z, yaw); if (!L.has(mat)) L.set(mat, []); L.get(mat).push(g); };
  // the plinth: a foot, the dado with its signs, a lip
  A(S, box(-0.95, 0, -2.1, 0.95, 0.16, 2.05));
  A(S, box(-0.85, 0.16, -2.0, 0.85, 0.5, 1.95));
  A(S, box(-0.9, 0.5, -2.05, 0.9, 0.56, 2.0));
  const sides = [];
  for (const s of [-1, 1]) {
    const T = [], pl = (u, v, d) => [s * (0.85 + d), u, v];
    glyphs(T, pl, 0.33, -1.8, 1.75, 0.1, s > 0 ? 41 : 43, 0.012);
    sides.push(...keep(T, [s, 0]));
  }
  A('egyptian_blue', fromTriangles(sides));
  const b = 0.56;                                                                                  // the plinth's top
  // the body: the lion crouching, the chest, the haunch with its folded hind leg, the forelegs lying forward with their paws and toes
  A(S, ellip(0, b + 0.5, -0.45, 0.46, 0.5, 1.12, 16));
  A(S, ellip(0, b + 0.6, 0.45, 0.42, 0.52, 0.5, 12));
  for (const s of [-1, 1]) {
    A(S, ellip(s * 0.38, b + 0.42, -1.05, 0.24, 0.4, 0.56, 10));                                   // the haunch
    A(S, ellip(s * 0.46, b + 0.15, -0.6, 0.14, 0.13, 0.42, 8));                                    // the hind leg folded under, its paw
    A(S, ellip(s * 0.33, b + 0.17, 0.95, 0.13, 0.17, 0.85, 10));                                   // the foreleg lying forward
    A(S, ellip(s * 0.33, b + 0.09, 1.72, 0.15, 0.09, 0.22, 8));                                    // the paw
    for (let k = -1; k <= 1; k++) A(S, ellip(s * 0.33 + k * 0.09, b + 0.06, 1.88, 0.04, 0.05, 0.07, 6));   // the toes
  }
  for (const g of curve([[0, b + 0.4, -1.5], [0.3, b + 0.28, -1.78], [0.66, b + 0.16, -1.5], [0.64, b + 0.1, -0.95]], 0.075, 0.045, 6)) A(S, g);   // the tail along the flank
  A(S, ellip(0.64, b + 0.09, -0.82, 0.06, 0.05, 0.08, 6));                                         // its tuft
  // the neck and the broad collar (the bands of ochre, blue and green, the fringe of gold)
  A(S, ellip(0, b + 1.1, 0.9, 0.25, 0.44, 0.27, 12, -0.12));
  const tier = (r0, y0, r1, y1, mat) => A(mat, lathe([[r1, b + y1], [r0, b + y0]], 18, null, 0, 0, 0.9));
  tier(0.2, 1.31, 0.29, 1.25, 'gold'); tier(0.29, 1.25, 0.37, 1.17, 'egyptian_blue'); tier(0.37, 1.17, 0.45, 1.08, 'gold'); tier(0.45, 1.08, 0.5, 0.98, 'egyptian_blue');
  // the head: the skull, the long arched face, the jaw, nostrils, the eyes, the ears (all grown a quarter about the neck's top)
  const A0 = A, HS = 1.5;
  const A1 = (mat, g) => { g.translate(0, -(b + 1.15), -0.9); g.scale(HS, HS, HS); g.translate(0, b + 1.15, 0.9); A0(mat, g); };
  A1(S, ellip(0, b + 1.5, 1.05, 0.18, 0.2, 0.24, 16));
  A1(S, ellip(0, b + 1.36, 1.38, 0.105, 0.14, 0.27, 14, 0.3));
  A1(S, ellip(0, b + 1.55, 1.27, 0.06, 0.085, 0.23, 8, 0.2));
  A1(S, ellip(0, b + 1.24, 1.32, 0.08, 0.065, 0.2, 8, 0.15));
  for (const s of [-1, 1]) {
    A1('granite_grey', ellip(s * 0.04, b + 1.29, 1.62, 0.017, 0.022, 0.017, 6));
    A1('gold', ellip(s * 0.15, b + 1.53, 1.24, 0.035, 0.042, 0.048, 7)); A1('granite_grey', ellip(s * 0.158, b + 1.53, 1.24, 0.026, 0.031, 0.037, 7));
    A1(S, ellip(s * 0.21, b + 1.49, 0.93, 0.045, 0.1, 0.06, 6));
    { const pts = []; for (let k = 0; k <= 8; k++) { const f = k / 8, ph = f * 5.1, r = 0.2 - 0.09 * f; pts.push([s * (0.16 + 0.05 * Math.sin(Math.PI * Math.min(1, f * 1.15)) + 0.02 * f), b + 1.52 + r * Math.cos(ph), 0.92 - r * Math.sin(ph)]); } for (const g of curve(pts, 0.062, 0.02, 6)) A1(S, g); }   // the horns, a spiral beside the ear
  }
  // the sun disc between the horns, the uraeus on the brow
  A1('gold', box(-0.07, b + 1.66, 0.94, 0.07, b + 1.73, 1.06));
  const disc = lathe([[0.001, 0], [0.13, 0], [0.13, 0.035], [0.001, 0.035]], 16); disc.rotateX(Math.PI / 2); disc.translate(0, b + 1.86, 1.0); A1('gold', disc);
  A1('gold', ellip(0, b + 1.67, 1.2, 0.035, 0.06, 0.035, 6));
  // the king between the forepaws, under the chin: the legs, the kilt, the torso, the head in the nemes, the arms down
  const kz = 1.22, K = 'sandstone_dressed', KS = 1.25;
  const A2 = A; const AK = (mat, g) => { g.translate(0, -b, -kz); g.scale(KS, KS, KS); g.translate(0, b, kz); A2(mat, g); };
  A(K, box(-0.14, b, kz - 0.2, 0.14, b + 0.04, kz + 0.2));
  for (const s of [-1, 1]) AK(K, lathe([[0.04, b + 0.04], [0.035, b + 0.3]], 8, null, s * 0.05, 0, kz));
  AK(K, lathe([[0.095, b + 0.3], [0.105, b + 0.5], [0.08, b + 0.52]], 10, null, 0, 0, kz));
  AK(K, lathe([[0.075, b + 0.52], [0.085, b + 0.7], [0.07, b + 0.8]], 10, null, 0, 0, kz));
  AK(K, ellip(0, b + 0.88, kz + 0.01, 0.06, 0.075, 0.065, 8));
  AK('gold', lathe([[0.066, b + 0.86], [0.075, b + 0.92], [0.01, b + 0.97]], 8, null, 0, 0, kz));
  for (const s of [-1, 1]) AK(K, box(s * 0.095 - 0.018, b + 0.5, kz - 0.025, s * 0.095 + 0.018, b + 0.78, kz + 0.025));
  col.rect([x - 1.0, z - 2.1, x + 1.0, z + 2.1], y, y + 2.6);
  for (const [mat, list] of L) bag.add(mat, joined(list));
  // beside it on the world's +x side, between this plinth and the next of its row: the planter of mud brick with its young tree
  planter({ at: [x + 3.45, z], y, seed: Math.round(x * 3 + z) }, { bag, col });
}

/**
 * A planter of mud brick (the avenue's "brick planters between each sphinx plinth, where trees were planted"): a low walled bed of earth with a
 * tamarisk-like tree in it, the leaves in separate tufts about a leaning trunk { at, y, seed }.
 */
function planter(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = rng(el.seed ?? 3), W = 1.5, D = 1.15, T = 0.28, Hh = 0.5;
  bag.add('mudbrick', box(x - W, y, z - D, x + W, y + Hh, z - D + T));
  bag.add('mudbrick', box(x - W, y, z + D - T, x + W, y + Hh, z + D));
  bag.add('mudbrick', box(x - W, y, z - D + T, x - W + T, y + Hh, z + D - T));
  bag.add('mudbrick', box(x + W - T, y, z - D + T, x + W, y + Hh, z + D - T));
  bag.add('mudbrick', box(x - W + T, y, z - D + T, x + W - T, y + Hh - 0.08, z + D - T));
  const lean = (r() - 0.5) * 0.5, h = 2.6 + r() * 0.8;
  bag.add('palm_trunk', lathe([[0.13, Hh - 0.08], [0.09, Hh + h * 0.5], [0.05, Hh + h]], 6, (th, i) => 1, x, y, z));
  for (let k = 0; k < 6; k++) {
    const a = r() * Math.PI * 2, d = 0.35 + r() * 0.5, up = Hh + h * (0.55 + r() * 0.5);
    bag.add('palm_leaf', ellip(x + Math.cos(a) * d + lean, y + up, z + Math.sin(a) * d, 0.6 + r() * 0.2, 0.5 + r() * 0.2, 0.6 + r() * 0.2, 8));
  }
  col.circle(x, z, 0.3, y, y + Hh + h);
}
