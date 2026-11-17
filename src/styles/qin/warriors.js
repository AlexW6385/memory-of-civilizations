// The painted soldiers of the army (docs/settlements/qin-xianyang.md §4): one low-poly soldier built of a few merged parts
// (skin, coat, armour, leg bindings, hair, cap, shoes, weapon), each part put as an instance of its shape, so that thousands
// of them cost a handful of draws. Facing −z at the origin; 1.8 m (the instance is scaled a little by seed). Colours by
// seed: robes in green, red, blue, purple, white, ochre; faces pink; armour dark brown lacquer with red lacings.
import { box, frustum, lathe } from '../../core/geom.js';
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { assembly, tube, slathe, tint, rng } from '../../objects/kit.js';

const ball = (r, n = 8, m = 5) => slathe(Array.from({ length: m }, (_, i) => { const t = i / (m - 1) * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);
const at = (g, x, y, z) => { g.translate(x, y, z); return g; };
const _q = new Quaternion(), _up = new Vector3(0, 1, 0), _p = new Vector3(), _s = new Vector3();

/** soldier kinds: key → { armor, weapon ('none' | 'spear' | 'halberd' | 'crossbow'), pose ('stand' | 'kneel' | 'drive'), long (robe to the calf), cap } */
export const KINDS = {
  inf: { armor: false, weapon: 'none' },
  inf_spear: { armor: false, weapon: 'spear' },
  arm: { armor: true, weapon: 'none' },
  arm_spear: { armor: true, weapon: 'spear' },
  arm_halberd: { armor: true, weapon: 'halberd' },
  archer: { armor: true, weapon: 'crossbow' },
  archer_light: { armor: false, weapon: 'crossbow' },
  kneel: { armor: true, weapon: 'crossbow', pose: 'kneel' },
  officer: { armor: false, weapon: 'none', long: true, cap: 'ban', tall: 1.08 },
  general: { armor: true, weapon: 'none', long: true, cap: 'split', tall: 1.1 },
  driver: { armor: false, weapon: 'none', pose: 'drive', cap: 'ban' },
};
const COATS = ['cloth_green', 'cloth_red', 'cloth_indigo', 'cloth_maroon', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_red'];

/** A box centred at (cx, cy, cz), sizes w × h × d, turned rz about z and ry about y (small facial pieces). */
const bx = (cx, cy, cz, w, h, d, rz = 0, ry = 0) => { const g = box(-w / 2, -h / 2, -d / 2, w / 2, h / 2, d / 2); if (rz) g.rotateZ(rz); if (ry) g.rotateY(ry); return g.translate(cx, cy, cz); };

/**
 * The head, by variant v (0–5): three face moulds of the ten the sources count (the guo, mu and tian outlines, named
 * for the Chinese character each outline resembles: c chin, j jaw, k cheek, t temple, f brow, as half-widths in m), the
 * features (brow ridges, almond eyes with lids, the nose's bridge, tip and wings, the lips, cheekbones, ears with a rim), the hair
 * combed to its knot (a twisted coil to the right, or a plait), the moustache and beard; hi only.
 */
const FACES = [
  { c: 0.040, j: 0.086, k: 0.094, t: 0.093, f: 0.090 },   // guo: square
  { c: 0.034, j: 0.068, k: 0.088, t: 0.090, f: 0.090 },   // mu: narrow, with a tall brow
  { c: 0.052, j: 0.092, k: 0.096, t: 0.090, f: 0.080 },   // you/tian: broad jaw, rounder
];
const HEADS = [
  { hair: 'twist', must: 'long', beard: 0 }, { hair: 'twist', must: 'short', beard: 0 }, { hair: 'twist', must: 'none', beard: 0 },
  { hair: 'twist', must: 'long', beard: 1 }, { hair: 'plait', must: 'short', beard: 0 }, { hair: 'twist', must: 'none', beard: 2 },
];
const faceProf = (F) => [[0.001, 1.478], [F.c, 1.49], [F.j, 1.525], [F.k, 1.575], [(F.k + F.t) / 2, 1.62], [F.t, 1.665], [F.f, 1.705], [F.f * 0.82, 1.74], [0.05, 1.757], [0.001, 1.763]];
const surf = (P, y) => { for (let i = 0; i < P.length - 1; i++) if (y >= P[i][1] && y <= P[i + 1][1]) return P[i][0] + (P[i + 1][0] - P[i][0]) * (y - P[i][1]) / (P[i + 1][1] - P[i][1]); return 0.08; };
/** Caps: the officer's (a board cap with a back that rises, a band) and the general's split-peak (a flat cap with two boards upright). */
function cap(up, kind, dy) {
  if (kind === 'ban') {
    up('cap', frustum([-0.125, -0.125, 0.125, 0.125], 1.73, 1.8, 0.01, 0.01, 0.01, 0.01));
    up('cap', frustum([-0.12, 0.02, 0.12, 0.125], 1.8, 1.9, 0.0, 0.0, 0.03, 0.0));            // the rear board rising
    up('cap', box(-0.13, 1.7, -0.13, 0.13, 1.73, 0.13));                                       // the band
    for (const s of [-1, 1]) up('cap', tube([[s * 0.118, 1.72, -0.02, 0.008], [s * 0.1, 1.5, -0.06, 0.006], [s * 0.03, 1.43, -0.11, 0.006]], 4));   // the strings under the chin
  } else {
    up('cap', frustum([-0.13, -0.13, 0.13, 0.13], 1.73, 1.8, 0.012, 0.012, 0.012, 0.012));
    for (const s of [-1, 1]) up('cap', bx(0, 1.86, s * 0.075, 0.2, 0.12, 0.014, 0, 0).rotateX(s * 0.2));   // the two upright boards of the peak
    up('cap', box(-0.14, 1.7, -0.14, 0.14, 1.73, 0.14));
  }
  void dy;
}
function head(a, v, capKind, dy = 0, hi = true) {
  const F = FACES[v % FACES.length], H = HEADS[v % HEADS.length], up = (role, g) => a(role, dy ? g.translate(0, dy, 0) : g);
  const P = faceProf(F);
  up('skin', tube([[0, 1.46, 0, 0.052], [0, 1.58, 0, 0.046]], hi ? 6 : 5));                          // the neck
  if (!hi) {
    up('skin', at(ball(0.092, 7, 5).scale(1, 1.12, 1), 0, 1.6, 0));
    up('hair', at(slathe([[0.099, 1.64], [0.103, 1.7], [0.086, 1.78], [0.038, 1.82], [0.001, 1.825]], 7), 0, 0, 0.012));
    if (capKind) up('cap', box(-0.12, 1.74, -0.12, 0.12, 1.84, 0.12));
    return;
  }
  up('skin', slathe(P, 12));                                                      // the skull and the face's mould
  const dd = (role, g) => up('d:' + (role === 'lip' ? 'skin' : role), g), zf = (y) => -surf(P, y) * 0.98, X = (x) => x ;
  // cheekbones, the brow ridges (a bar bent over each eye), eyes with lids, the nose, the lips, the ears
  for (const s of [-1, 1]) {
    dd('skin', at(ball(0.026, 6, 4).scale(1.1, 0.8, 0.8), s * 0.062, 1.6, zf(1.6) + 0.012));
    dd('skin', bx((s * 0.04), 1.664, zf(1.664) - 0.002, 0.058, 0.013, 0.02, s * 0.12));                // the brow ridge
    dd('hair', bx((s * 0.04), 1.67, zf(1.67) - 0.0115, 0.056, 0.011, 0.004, s * 0.14));              // the brow
    dd('hair', bx((s * 0.04), 1.637, zf(1.637) - 0.004, 0.03, 0.007, 0.006, s * 0.2));                 // the eye's slit, the outer corner up
    dd('skin', bx((s * 0.04), 1.646, zf(1.646) - 0.004, 0.036, 0.009, 0.014, s * 0.16));               // the upper lid
    dd('skin', bx((s * 0.04), 1.627, zf(1.627) - 0.003, 0.03, 0.006, 0.012, s * 0.16));                // the lower lid
    dd('skin', at(ball(0.017, 6, 4), (s * 0.027), 1.579, zf(1.579) - 0.022));                         // the nose's wing
    dd('hair', bx(s * 0.011, 1.572, zf(1.572) - 0.03, 0.007, 0.005, 0.01));                             // the nostril
    dd('skin', at(ball(0.026, 6, 4).scale(0.45, 1.5, 0.9), s * 0.1 , 1.605, 0.005));            // the ear
    dd('skin', tube([[s * 0.105 , 1.63, 0.0, 0.006], [s * 0.112 , 1.605, 0.0, 0.006], [s * 0.104 , 1.578, 0.004, 0.006]], 4));   // its rim
    dd('lip', bx(s * 0.012, 1.557, zf(1.557) - 0.007, 0.022, 0.009, 0.014, -s * 0.12));                // the upper lip, two halves (the bow)
  }
  dd('skin', tube([[0, 1.652, zf(1.652) - 0.003, 0.012], [0, 1.615, zf(1.615) - 0.016, 0.0125], [0, 1.585, zf(1.585) - 0.027, 0.011]], 5));   // the nose's bridge
  dd('skin', at(ball(0.017, 6, 4), 0, 1.583, zf(1.583) - 0.03));                                       // the tip
  dd('skin', bx(0, 1.568, zf(1.568) - 0.012, 0.012, 0.016, 0.01));                                     // the philtrum
  dd('lip', bx(0, 1.54, zf(1.54) - 0.007, 0.046, 0.011, 0.014));                                       // the lower lip
  dd('skin', at(ball(0.03, 6, 4).scale(F.c * 1.6 + 0.2, 0.75, 0.7), 0, 1.508, zf(1.508) + 0.006));    // the chin
  // the hair: combed in strands to the knot (the grooves run up the cap), the brow line, the sideburns
  up('hair', at(slathe([[0.104, 1.64], [0.108, 1.7], [0.092, 1.775], [0.045, 1.82], [0.001, 1.83]], 14, (th) => 1 + 0.014 * Math.cos(th * 7)), 0, 0, 0.012));
  dd('hair', bx(0, 1.675, zf(1.675) - 0.002, 0.172 , 0.022, 0.012));
  for (const s of [-1, 1]) dd('hair', box(s * 0.098  - 0.006, 1.6, -0.03, s * 0.098  + 0.006, 1.66, 0.04));
  if (capKind) cap(up, capKind, dy);
  else if (H.hair === 'plait') {
    const c = [[0, 1.74, 0.07], [0, 1.62, 0.12], [0, 1.45, 0.14], [0, 1.3, 0.13]];
    up('hair', tube(c.map((p) => [...p, 0.03]), 6)); up('hair', at(ball(0.04, 6, 4), 0, 1.84, 0));
    for (let k = 0; k < 9; k++) { const t = k / 8, y = 1.72 - t * 0.44, z = 0.075 + t * 0.06; for (const s of [-1, 1]) dd('hair', at(ball(0.017, 5, 3).scale(1, 1.3, 1), s * 0.014 * (k % 2 ? 1 : -1) * (s > 0 ? 1 : -1), y, z)); }
    dd('lip', slathe([[0.03, 1.29], [0.034, 1.29], [0.034, 1.32], [0.03, 1.32]], 7).translate(0, 0, 0.13));                    // the cord that ties the plait
  } else {
    // the gathered hair rises from the crown to a knot on the right
    up('hair', tube([[0.0, 1.78, 0.03, 0.046], [0.04, 1.835, 0.032, 0.036], [0.06, 1.85, 0.034, 0.032]], 6));
    if (H.hair === 'twist') for (let j = 0; j < 3; j++) up('hair', slathe([[0.001, 0], [0.05, 0.004], [0.056, 0.02], [0.044, 0.036], [0.001, 0.04]], 10, (th) => 1 + 0.09 * Math.sin(th * 3 + j * 1.3)).scale(1, 0.8, 1).rotateZ(-0.4).translate(0.058 + j * 0.012, 1.835 + j * 0.026, 0.034));
    else if (H.hair === 'round') up('hair', at(slathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t) * 0.06), 0.06 - Math.cos(t) * 0.06]; }), 12, (th) => 1 + 0.07 * Math.cos(th * 6)), 0.05, 1.82, 0.02));
    else up('hair', tube([[0.0, 1.78, 0.02, 0.026], [0.04, 1.88, 0.02, 0.026], [0.09, 1.9, 0.03, 0.026], [0.12, 1.85, 0.04, 0.026], [0.1, 1.79, 0.05, 0.02]], 6));
    dd('lip', slathe([[0.036, -0.007], [0.041, -0.007], [0.041, 0.007], [0.036, 0.007]], 8).rotateZ(-0.7).translate(0.046, 1.828, 0.034));    // the cord binding the knot
    dd('hair', box(-0.01, 1.66, 0.09, 0.01, 1.8, 0.108));
  }
  // moustache and beard
  if (H.must !== 'none') for (const s of [-1, 1]) dd('hair', tube([[s * 0.005, 1.578, zf(1.578) - 0.012, 0.012, 0.007], [s * 0.04, 1.574, zf(1.574) - 0.004, 0.011, 0.006], [s * 0.062, H.must === 'long' ? 1.54 : 1.563, zf(1.563) + 0.012, 0.006, 0.004]], 5));
  if (H.beard) dd('hair', at(slathe([[0.0, 1.57], [0.09, 1.57], [0.08, 1.5], [0.03, 1.44], [0.001, 1.43]], 8).scale(1, 1, 0.8), 0, 0, -0.03));
  if (H.beard === 2) dd('hair', box(-0.02, 1.4, -0.1, 0.02, 1.54, -0.07));
}

/** The coarse soldier: a few hundred triangles, every part a little inside the fine one's (radii × 0.9). */
function buildLo(kind, a) {
  const K = KINDS[kind], kneel = K.pose === 'kneel', drive = K.pose === 'drive', drop = kneel ? 0.45 : 0, k = 0.9;
  const up = (role, g) => a(role, drop ? g.translate(0, -drop, 0) : g);
  const T = (pts, n = 4) => tube(pts.map((p) => [p[0], p[1], p[2], p[3] * k]), n);
  if (kneel) {
    a('leg', T([[-0.1, 0.62, 0.0, 0.088], [-0.1, 0.52, -0.38, 0.078], [-0.1, 0.1, -0.4, 0.062]])); a('leg', T([[0.1, 0.55, 0.05, 0.088], [0.1, 0.07, -0.04, 0.078], [0.1, 0.1, 0.4, 0.062]]));
  } else for (const s of [-1, 1]) { a('leg', T([[s * 0.1, 1.0, 0, 0.09], [s * 0.1, 0.12, -0.01, 0.06]])); a('shoe', box(s * 0.1 - 0.055, 0, -0.2, s * 0.1 + 0.055, 0.07, 0.06)); }
  const hem = K.long ? 0.28 : 0.55;
  up('coat', slathe([[0.2 * k, hem], [0.185 * k, 1.0], [0.2 * k, 1.3], [0.06 * k, 1.5], [0.001, 1.51]], 6).scale(1, 1, 0.72));
  if (K.armor) up('plate', slathe([[0.26 * k, 0.62], [0.24 * k, 0.97], [0.2 * k, 1.02], [0.225 * k, 1.3], [0.215 * k, 1.4]], 6).scale(1, 1, 0.74));
  const arm = (pts) => up('coat', T(pts));
  if (drive) for (const s of [-1, 1]) arm([[s * 0.2, 1.4, 0, 0.056], [s * 0.2, 1.22, -0.36, 0.042]]);
  else if (K.weapon === 'crossbow') { arm([[0.2, 1.4, 0, 0.056], [0.12, 1.2, -0.42, 0.042]]); arm([[-0.2, 1.4, 0, 0.056], [0.0, 1.17, -0.3, 0.042]]); up('wood', box(0.074, 1.16, -0.78, 0.126, 1.21, -0.06)); up('bronze', box(-0.23, 1.18, -0.79, 0.43, 1.2, -0.78)); }
  else {
    arm([[0.2, 1.4, 0, 0.056], [0.2, 1.2, -0.31, 0.042]]); arm([[-0.2, 1.4, 0, 0.056], [-0.24, 0.93, -0.06, 0.042]]);
    if (K.weapon === 'spear') { up('wood', T([[0.2, 0, -0.33, 0.014], [0.2, 2.1, -0.33, 0.014]])); up('bronze', T([[0.2, 2.1, -0.33, 0.026], [0.2, 2.5, -0.33, 0.01]])); }
    else if (K.weapon === 'halberd') { up('wood', T([[0.2, 0, -0.33, 0.014], [0.2, 2.2, -0.33, 0.014]])); up('bronze', box(0.192, 2.07, -0.6, 0.208, 2.26, -0.32)); }
  }
  head(a, 0, K.cap, -drop, false);
}

function build(kind, a, lod = 0) {
  if (lod) return buildLo(kind, a);
  const K = KINDS[kind], kneel = K.pose === 'kneel', drive = K.pose === 'drive', drop = kneel ? 0.45 : 0, hi = lod === 0;
  const sd = 0.67, rk = 1;                      // the sides' factor, the radius' (lo sits inside hi)
  const T = (pts, n) => tube(hi ? pts : pts.map((p) => [p[0], p[1], p[2], p[3] * rk, p[4] === undefined ? undefined : p[4] * rk]), Math.max(4, Math.round(n * sd)));
  const SL = (prof, n) => slathe(hi ? prof : prof.map(([r, y]) => [r * rk, y]), Math.max(6, Math.round(n * sd)));
  const up = (role, g) => a(role, drop ? g.translate(0, -drop, 0) : g);
  // legs: trousers gathered at the shin by bindings (puttees), square-toed shoes with a turned-up toe
  if (kneel) {
    a('leg', T([[-0.1, 0.62, 0.0, 0.088], [-0.1, 0.52, -0.38, 0.078], [-0.1, 0.1, -0.4, 0.062]], 8));
    a('leg', T([[0.1, 0.55, 0.05, 0.088], [0.1, 0.07, -0.04, 0.078], [0.1, 0.1, 0.4, 0.062]], 8));
    a('shoe', box(-0.15, 0, -0.55, -0.05, 0.06, -0.38)); a('shoe', box(0.05, 0, 0.36, 0.15, 0.08, 0.56));
  } else {
    for (const s of [-1, 1]) {
      a('leg', T([[s * 0.1, 1.0, 0, 0.09], [s * 0.1, 0.62, -0.01, 0.075], [s * 0.1, 0.4, -0.005, 0.072], [s * 0.1, 0.12, -0.01, 0.06]], 8));
      a('shoe', box(s * 0.1 - 0.065, 0, -0.22, s * 0.1 + 0.065, 0.075, 0.075));
      if (hi) {
        a('d:shoe', box(s * 0.1 - 0.05, 0.075, -0.22, s * 0.1 + 0.05, 0.1, -0.15));              // the toe cap, turned up
        for (let k = 0; k < 3; k++) a('d:wrap', slathe([[0.082, 0.18 + k * 0.1], [0.087, 0.2 + k * 0.1], [0.082, 0.22 + k * 0.1]], 8).translate(s * 0.1, 0, -0.01));   // the shin bindings
      }
    }
  }
  // the coat: knee-length belted (calf-length for officers), the right lapel across the chest, a collar
  const hem = K.long ? 0.28 : 0.55;
  up('coat', SL([[0.2, hem], [0.21, hem + 0.12], [0.185, 1.0], [0.17, 1.12], [0.2, 1.3], [0.17, 1.43], [0.06, 1.5], [0.001, 1.51]], 12).scale(1, 1, 0.72));
  up('belt', SL([[0.185, 1.0], [0.19, 1.0], [0.19, 1.06], [0.18, 1.06]], 12).scale(1, 1, 0.72));
  if (hi) {
    up('d:trim', box(-0.04, 1.0, -0.158, 0.04, 1.06, -0.145));                                    // the belt's hook plate
    up('d:trim', slathe([[0.082, 1.46], [0.088, 1.47], [0.088, 1.5], [0.08, 1.505]], 10));      // the collar's band
    up('d:trim', slathe([[0.215, hem], [0.218, hem + 0.01], [0.215, hem + 0.06]], 12).scale(1, 1, 0.72));   // the hem's edging
    if (!K.armor) up('d:trim', tube([[-0.06, 1.46, -0.1, 0.012], [0.05, 1.22, -0.138, 0.011], [0.08, 1.06, -0.145, 0.011]], 5));   // the lapel
    for (let k = 0; k < 2; k++) up('d:trim', box(-0.012 + (k ? 0.1 : -0.1), hem + 0.1, -0.2, 0.012 + (k ? 0.1 : -0.1), 0.98, -0.155));   // pleats of the skirt
  }
  // armour: rows of lames over chest, shoulders and skirt (lamellar), the lacings
  if (K.armor) {
    // the middle version: a smooth cuirass and skirt; the lames over them (stepped rows) are fine detail
    up('plate', SL([[0.2, 1.02], [0.214, 1.12], [0.222, 1.3], [0.212, 1.4]], 12).scale(1, 1, 0.74));
    up('plate', SL([[0.27, 0.6], [0.262, 0.66], [0.24, 0.97], [0.2, 1.0]], 12).scale(1, 1, 0.74));
    // lames: rows of small rectangular plates, the rows stepped down over each other and offset like bricks (a ring whose radius
    // alternates at each plate's edge reads as separate plates), the skirt's rows longer, a standing collar of plates at the neck
    const SEG = 18, pm = (ppr) => (th, i) => ((Math.round(th / (Math.PI * 2) * SEG) + Math.floor(i / ppr)) % 2 ? 0.955 : 1);
    const prof = [[0.218, 1.4]];
    for (let i = 0; i < 5; i++) { const y = 1.38 - i * 0.075; prof.push([0.2 - i * 0.004, y], [0.228 - i * 0.004, y], [0.208 - i * 0.004, y - 0.01]); }
    prof.push([0.2, 1.02]);
    up('d:plate', slathe(prof.reverse(), SEG, pm(3)).scale(1, 1, 0.74));
    const sk = [[0.2, 1.0], [0.24, 0.98]];
    for (let i = 0; i < 4; i++) sk.push([0.25 + i * 0.012, 0.9 - i * 0.12], [0.23 + i * 0.012, 0.9 - i * 0.12 - 0.02]);
    up('d:plate', slathe(sk.reverse(), SEG, pm(2)).scale(1, 1, 0.74));
    up('d:plate', slathe([[0.088, 1.43], [0.098, 1.45], [0.096, 1.5], [0.088, 1.5]], 16, pm(1)));   // the collar's plates
    for (const s of [-1, 1]) {
      up('plate', box(s * 0.2 - 0.07, 1.4, -0.09, s * 0.2 + 0.07, 1.47, 0.09));
      if (hi) { up('d:plate', box(s * 0.22 - 0.06, 1.34, -0.085, s * 0.22 + 0.06, 1.4, 0.085)); up('d:plate', box(s * 0.235 - 0.05, 1.29, -0.08, s * 0.235 + 0.05, 1.345, 0.08)); }   // the shoulder lames
    }
    if (hi) {
      for (let k = -2; k <= 2; k++) up('d:lace', box(k * 0.07 - 0.006, 1.12, -0.17, k * 0.07 + 0.006, 1.36, -0.158));              // the lacing down the chest
      for (let k = 0; k < 4; k++) up('d:bronze', box(-0.1 + k * 0.067 - 0.012, 1.3, -0.172, -0.1 + k * 0.067 + 0.012, 1.325, -0.166));
    }
  }
  // arms and hands: a hand is a fist with its thumb
  // a hand is a palm with four fingers and a thumb, of three kinds: 'v' closed round an upright shaft, 'h' round a stock lying along z,
  // 'hang' open and hanging, the fingers a little curled
  const hand = (x, y, z, s = 1, type = 'hang') => {
    up('skin', at(ball(0.04, 5, 4).scale(1, 0.95, type === 'hang' ? 0.7 : 1), x, y, z));
    if (!hi) return;
    if (type === 'v') {
      for (let k = 0; k < 4; k++) { const yy = y + 0.036 - k * 0.024; up('d:skin', tube([[x + 0.034, yy, z + 0.01, 0.0105], [x + 0.03, yy, z - 0.024, 0.0105], [x, yy, z - 0.04, 0.0105], [x - 0.03, yy, z - 0.026, 0.0095], [x - 0.036, yy, z + 0.002, 0.008]], 4)); }
      up('d:skin', tube([[x + 0.03 * s, y + 0.045, z + 0.03, 0.011], [x + 0.02 * s, y + 0.05, z - 0.02, 0.01], [x, y + 0.048, z - 0.042, 0.008]], 4));
    } else if (type === 'h') {
      for (let k = 0; k < 4; k++) { const zz = z + 0.034 - k * 0.022; up('d:skin', tube([[x - 0.034, y + 0.012, zz, 0.0105], [x - 0.038, y - 0.02, zz, 0.0105], [x, y - 0.042, zz, 0.0105], [x + 0.036, y - 0.02, zz, 0.0095], [x + 0.03, y + 0.008, zz, 0.008]], 4)); }
      up('d:skin', tube([[x + 0.036, y + 0.02, z + 0.05, 0.011], [x + 0.03, y + 0.036, z + 0.0, 0.01], [x + 0.02, y + 0.034, z - 0.05, 0.008]], 4));
    } else {
      for (let k = 0; k < 4; k++) { const xx = x + (k - 1.5) * 0.019, l = 1 - Math.abs(k - 1.5) * 0.09; up('d:skin', tube([[xx, y - 0.03, z, 0.0095], [xx, y - 0.03 - 0.045 * l, z - 0.004, 0.009], [xx, y - 0.03 - 0.085 * l, z - 0.02, 0.0075]], 4)); }
      up('d:skin', tube([[x + 0.03 * s, y + 0.01, z - 0.015, 0.012], [x + 0.044 * s, y - 0.03, z - 0.03, 0.01], [x + 0.04 * s, y - 0.055, z - 0.04, 0.008]], 4));
    }
  };
  const cuff = (x, y, z) => { if (hi) up('d:trim', at(slathe([[0.05, -0.03], [0.054, 0], [0.05, 0.03]], 8), x, y, z)); };
  if (drive) {
    for (const s of [-1, 1]) { up('coat', T([[s * 0.2, 1.4, 0, 0.056], [s * 0.26, 1.18, -0.12, 0.05], [s * 0.2, 1.22, -0.36, 0.042]], 8)); hand(s * 0.2, 1.22, -0.38, s, 'v'); cuff(s * 0.2, 1.22, -0.35); }
  } else if (K.weapon === 'crossbow') {
    up('coat', T([[0.2, 1.4, 0, 0.056], [0.27, 1.18, -0.14, 0.05], [0.12, 1.2, -0.42, 0.042]], 8));
    up('coat', T([[-0.2, 1.4, 0, 0.056], [-0.26, 1.15, -0.1, 0.05], [0.0, 1.17, -0.3, 0.042]], 8));
    hand(0.1, 1.2, -0.44, 1, 'h'); hand(0.1, 1.17, -0.3, 1, 'h');
    up('wood', box(0.07, 1.15, -0.8, 0.13, 1.22, -0.05));                                  // the stock
    up('bronze', box(-0.24, 1.17, -0.8, 0.44, 1.2, -0.77));                                  // the bow's limbs (bronze-bound)
    up('bronze', box(0.088, 1.22, -0.3, 0.112, 1.27, -0.2));                                // the trigger
    if (hi) { up('d:bronze', box(0.08, 1.2, -0.38, 0.12, 1.24, -0.22)); up('wood', box(0.084, 1.22, -0.82, 0.116, 1.235, -0.7)); up('wood', box(0.088, 1.222, -0.9, 0.112, 1.232, -0.8)); }   // the lock, the bolt groove, the bolt
  } else {
    // the right arm bent forward holding the weapon upright, the left hanging with the hand half closed
    up('coat', T([[0.2, 1.4, 0, 0.056], [0.27, 1.15, -0.1, 0.05], [0.2, 1.2, -0.31, 0.042]], 8));
    hand(0.2, 1.2, -0.33, 1, 'v'); cuff(0.2, 1.2, -0.3);
    up('coat', T([[-0.2, 1.4, 0, 0.056], [-0.25, 1.15, 0.0, 0.05], [-0.24, 0.93, -0.06, 0.042]], 8));
    hand(-0.24, 0.9, -0.07, -1, 'hang'); cuff(-0.24, 0.93, -0.06);
    if (K.weapon === 'spear') {
      up('wood', T([[0.2, 0.0, -0.33, 0.016], [0.2, 2.1, -0.33, 0.016]], 6));
      up('bronze', T([[0.2, 2.1, -0.33, 0.03], [0.2, 2.5, -0.33, 0.012]], 5));
    } else if (K.weapon === 'halberd') {
      up('wood', T([[0.2, 0.0, -0.33, 0.016], [0.2, 2.2, -0.33, 0.016]], 6));
      up('bronze', box(0.19, 2.05, -0.62, 0.21, 2.28, -0.31)); up('bronze', box(0.19, 2.2, -0.34, 0.21, 2.55, -0.32));
    }
    up('bronze', box(-0.3, 0.92, -0.04, -0.27, 0.98, 0.3));                                   // the sword's scabbard at the left hip
    if (hi) { up('d:bronze', box(-0.3, 0.98, 0.3, -0.27, 1.0, 0.36)); up('d:trim', box(-0.31, 0.9, -0.04, -0.26, 0.92, 0.1)); }
  }
  // the head
  if (!hi) { head(a, 0, K.cap, -drop, false); if (K.long) up('hair', box(-0.04, 1.52, -0.1, 0.04, 1.6, -0.095)); }   // (hi: the head by variant, see soldier())
}
const key = (kind, lod) => `qin-soldier|${kind}|${lod}`;
const MIDREACH = 30, FINEREACH = 12;

/**
 * A put-function for one soldier at [x, z], height y, turned rot (a soldier faces −z at rot 0; to face +x use −π/2), by seed:
 * `reach` the distance (m) off which it is still drawn. Two versions: the fine one (a face with its features, hands, lames,
 * lacings; HIREACH) and a coarse one of a few hundred triangles drawn to `reach`, built slightly inside the fine, so that near
 * the fine one hides it (the pit's 4 000 figures stay cheap: DESIGN §8).
 */
export function soldier(bag, { at: [x, z], y = 0, rot = 0, kind = 'inf', seed = 1, reach = 80, clay = false, s: sc = 1 }) {
  const r = rng(seed), K = KINDS[kind], Amid = assembly(key(kind, 0), (a) => build(kind, a, 0)), Alo = assembly(key(kind, 1), (a) => build(kind, a, 1));
  const s = sc * (K.tall ?? 1) * (0.97 + r() * 0.08), sx = s * (0.94 + r() * 0.1), M = new Matrix4().compose(_p.set(x, y, z), _q.setFromAxisAngle(_up, rot), _s.set(sx, s, s));
  const hv = K.long ? [3, 5, 0, 3][Math.floor(r() * 4)] : Math.floor(r() * 6), drop = K.pose === 'kneel' ? 0.45 : 0;
  const Hh = assembly(`qin-head|${hv}|${K.cap ?? ''}`, (a) => head(a, hv, K.cap, 0, true));   // (a kneeler's head shares it, put lower by its matrix)
  const Mh = drop ? new Matrix4().compose(_p.set(x, y - drop * s, z), _q.setFromAxisAngle(_up, rot), _s.set(sx, s, s)) : M;
  let cur = M;
  const coat = COATS[Math.floor(r() * COATS.length)], sh = 0.9 + r() * 0.2, legc = ['cloth_brown', 'cloth_ochre', 'cloth_green', 'cloth_brown'][Math.floor(r() * 4)];
  const trim = kind === 'general' || kind === 'officer' ? 'cloth_red' : 'cloth_brown';
  const put = (mat, g, rch, shade = 1) => { if (!g) return; const t = tint(mat, shade); bag.addInstance(t ? t.base : mat, g, cur, { color: t?.color ?? null, real: mat, reach: rch }); };
  const SK = [1.12, 0.92, 0.88], LIP = [1.0, 0.62, 0.6];
  /** One assembly's roles at the reach given (the roles with `d:` are the fine detail: FINEREACH at most). */
  const body = (A, rch) => {
    const fine = Math.min(rch, FINEREACH), has = (k) => A[k] ?? A['d:' + k];
    if (clay) { for (const [role, g] of Object.entries(A)) put(role.endsWith('wood') ? 'timber' : role.endsWith('bronze') ? 'bronze' : 'terracotta', g, role.startsWith('d:') ? fine : rch); return; }
    put('skin_light', A.skin, rch, SK); put(coat, A.coat, rch, sh);
    if (A.belt) put('cloth_brown', A.belt, rch);
    if (A.plate) put('lacquer_chestnut', A.plate, rch);
    put(legc, A.leg, rch, 0.9); put('hide_black', A.shoe, rch); put('hair_dark', A.hair, rch);
    if (A.cap) put('cloth_black', A.cap, rch);
    if (A.wood) put('timber', A.wood, rch);
    if (A.bronze) put('bronze', A.bronze, rch);
    put('skin_light', A['d:skin'], fine, SK); put('hair_dark', A['d:hair'], fine); put('skin_light', A['d:lip'], fine, LIP);
    put('hide_black', A['d:shoe'], fine); put('cloth_white', A['d:wrap'], fine, 0.85); put('cloth_brown', A['d:belt'], fine); put(trim, A['d:trim'], fine);
    put(coat, A['d:coat'], fine, sh * 0.92); put('lacquer_chestnut', A['d:plate'], fine); put('cloth_red', A['d:lace'], fine); put('bronze', A['d:stud'], fine); put('bronze', A['d:bronze'], fine); put('timber', A['d:wood'], fine);
    void has;
  };
  const mid = Math.min(reach, MIDREACH);
  body(Alo, reach);
  if (reach > MIDREACH) body(Amid, mid);                                        // (the coarse one stays under the middle one's; both within MIDREACH)
  cur = Mh; body(Hh, mid);
  void lathe;
}
