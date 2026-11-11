// The painted soldiers of the army (docs/settlements/qin-xianyang.md §4): one low-poly soldier built of a few merged parts
// (skin, coat, armour, leg bindings, hair, cap, shoes, weapon), each part put as an instance of its shape, so that thousands
// of them cost a handful of draws. Facing −z at the origin; 1.8 m (the instance is scaled a little by seed). Colours by
// seed: robes in green, red, blue, purple, white, ochre; faces pink; armour dark brown lacquer with red lacings.
import { box, lathe } from '../../core/geom.js';
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
const HAIR_STYLES = ['bun', 'bun', 'bun', 'cap'];

function build(kind, a) {
  const K = KINDS[kind], kneel = K.pose === 'kneel', drive = K.pose === 'drive', drop = kneel ? 0.45 : 0;
  const up = (role, g) => a(role, drop ? g.translate(0, -drop, 0) : g);
  // legs: wrapped shins and trousers (two tubes each), square-toed shoes
  if (kneel) {
    a('leg', tube([[-0.1, 0.62, 0.0, 0.085], [-0.1, 0.52, -0.38, 0.075], [-0.1, 0.1, -0.4, 0.06]], 6));
    a('leg', tube([[0.1, 0.55, 0.05, 0.085], [0.1, 0.07, -0.04, 0.075], [0.1, 0.1, 0.4, 0.06]], 6));
    a('shoe', box(-0.15, 0, -0.55, -0.05, 0.06, -0.38)); a('shoe', box(0.05, 0, 0.36, 0.15, 0.08, 0.56));
  } else {
    for (const s of [-1, 1]) {
      a('leg', tube([[s * 0.1, 1.0, 0, 0.088], [s * 0.1, 0.55, -0.01, 0.07], [s * 0.1, 0.12, -0.01, 0.058]], 6));
      a('shoe', box(s * 0.1 - 0.06, 0, -0.2, s * 0.1 + 0.06, 0.07, 0.07));
    }
  }
  // the coat: knee-length belted (calf-length for officers), open skirt hem
  const hem = K.long ? 0.28 : 0.55;
  up('coat', slathe([[0.2, hem], [0.21, hem + 0.12], [0.185, 1.0], [0.17, 1.12], [0.2, 1.3], [0.17, 1.43], [0.06, 1.5], [0.001, 1.51]], 10).scale(1, 1, 0.72));
  up('belt', slathe([[0.185, 1.0], [0.19, 1.0], [0.19, 1.06], [0.18, 1.06]], 10).scale(1, 1, 0.72));
  // armour: stepped plates over chest, shoulders and skirt (lamellar), lacings
  if (K.armor) {
    const prof = [];
    for (let i = 0; i < 5; i++) { const y = 1.38 - i * 0.075; prof.push([0.2 - i * 0.004, y], [0.225 - i * 0.004, y], [0.205 - i * 0.004, y - 0.01]); }
    up('plate', slathe([[0.215, 1.4], ...prof.slice(1), [0.2, 1.02]], 10).scale(1, 1, 0.74));
    const sk = [[0.2, 1.0], [0.235, 0.98]];
    for (let i = 0; i < 4; i++) sk.push([0.245 + i * 0.012, 0.9 - i * 0.12], [0.225 + i * 0.012, 0.9 - i * 0.12 - 0.02]);
    up('plate', slathe(sk, 10).scale(1, 1, 0.74));
    for (const s of [-1, 1]) up('plate', box(s * 0.2 - 0.07, 1.4, -0.09, s * 0.2 + 0.07, 1.47, 0.09));
    up('lace', slathe([[0.222, 1.32], [0.223, 1.34], [0.223, 1.1], [0.222, 1.09]], 10).scale(1, 1, 0.74));
  }
  // arms and hands
  const R = (...p) => p;
  if (drive) {
    for (const s of [-1, 1]) { up('coat', tube([[s * 0.2, 1.4, 0, 0.055], [s * 0.26, 1.18, -0.12, 0.048], [s * 0.2, 1.22, -0.36, 0.04]], 6)); up('skin', at(ball(0.04, 6, 4), s * 0.2, 1.22, -0.38)); }
  } else if (K.weapon === 'crossbow') {
    up('coat', tube([[0.2, 1.4, 0, 0.055], [0.27, 1.18, -0.14, 0.048], [0.14, 1.2, -0.42, 0.04]], 6));
    up('coat', tube([[-0.2, 1.4, 0, 0.055], [-0.26, 1.15, -0.1, 0.048], [-0.06, 1.18, -0.3, 0.04]], 6));
    up('skin', at(ball(0.04, 6, 4), 0.14, 1.2, -0.44)); up('skin', at(ball(0.04, 6, 4), -0.06, 1.18, -0.32));
    up('wood', box(-0.03, 1.15, -0.8, 0.03, 1.22, -0.05));                                  // the stock
    up('bronze', box(-0.34, 1.17, -0.8, 0.34, 1.2, -0.77));                                  // the bow's limbs (bronze-bound)
    up('bronze', box(-0.012, 1.22, -0.3, 0.012, 1.27, -0.2));                                // the trigger
  } else {
    // the right arm bent forward holding the weapon upright, the left hanging with the hand half closed
    up('coat', tube([[0.2, 1.4, 0, 0.055], [0.27, 1.15, -0.1, 0.048], [0.2, 1.2, -0.31, 0.04]], 6));
    up('skin', at(ball(0.04, 6, 4), 0.2, 1.2, -0.33));
    up('coat', tube([[-0.2, 1.4, 0, 0.055], [-0.25, 1.15, 0.0, 0.048], [-0.24, 0.93, -0.06, 0.04]], 6));
    up('skin', at(ball(0.04, 6, 4), -0.24, 0.9, -0.07));
    if (K.weapon === 'spear') {
      up('wood', tube([[0.2, 0.0, -0.33, 0.016], [0.2, 2.1, -0.33, 0.016]], 5));
      up('bronze', tube([[0.2, 2.1, -0.33, 0.03], [0.2, 2.5, -0.33, 0.012]], 4));
    } else if (K.weapon === 'halberd') {
      up('wood', tube([[0.2, 0.0, -0.33, 0.016], [0.2, 2.2, -0.33, 0.016]], 5));
      up('bronze', box(0.19, 2.05, -0.62, 0.21, 2.28, -0.31)); up('bronze', box(0.19, 2.2, -0.34, 0.21, 2.55, -0.32));
    }
    up('bronze', box(-0.3, 0.92, -0.04, -0.27, 0.98, 0.3));                                   // the sword's scabbard at the left hip
  }
  // head: pink face, ears, hair in a topknot twisted to the right (or a cap), beard on some
  up('skin', tube([[0, 1.46, 0, 0.05], [0, 1.58, 0, 0.045]], 6));
  up('skin', at(ball(0.098, 9, 6).scale(1, 1.12, 1), 0, 1.6, 0));
  up('skin', box(-0.108, 1.6, -0.02, -0.098, 1.66, 0.03)); up('skin', box(0.098, 1.6, -0.02, 0.108, 1.66, 0.03));
  up('hair', at(slathe([[0.104, 1.64], [0.108, 1.7], [0.09, 1.78], [0.04, 1.82], [0.001, 1.83]], 8), 0, 0, 0.012));
  up('hair', box(-0.09, 1.665, -0.103, 0.09, 1.69, -0.092));                                 // the brow line
  if (K.cap) up('cap', K.cap === 'ban' ? box(-0.12, 1.74, -0.12, 0.12, 1.84, 0.12) : box(-0.13, 1.76, -0.13, 0.13, 1.8, 0.13));
  else up('hair', at(ball(0.055, 6, 4), 0.07, 1.84, 0.03));
  if (K.long || kind === 'inf_spear') up('hair', box(-0.04, 1.52, -0.1, 0.04, 1.6, -0.095));      // a short beard
}
const key = (kind) => `qin-soldier|${kind}`;

/**
 * A put-function for one soldier at [x, z], height y, turned rot (a soldier faces −z at rot 0; to face +x use −π/2), by seed:
 * `reach` the distance (m) off which it is still drawn.
 */
export function soldier(bag, { at: [x, z], y = 0, rot = 0, kind = 'inf', seed = 1, reach = 80, clay = false, s: sc = 1 }) {
  const r = rng(seed), K = KINDS[kind], A = assembly(key(kind), (a) => build(kind, a));
  const s = sc * (K.tall ?? 1) * (0.97 + r() * 0.08), M = new Matrix4().compose(_p.set(x, y, z), _q.setFromAxisAngle(_up, rot), _s.set(s * (0.94 + r() * 0.1), s, s));
  const put = (mat, g, shade = 1) => { if (!g) return; const t = tint(mat, shade); bag.addInstance(t ? t.base : mat, g, M, { color: t?.color ?? null, real: mat, reach }); };
  if (clay) { for (const [role, g] of Object.entries(A)) put(role === 'wood' ? 'timber' : role === 'bronze' ? 'bronze' : 'terracotta', g); return; }
  const coat = COATS[Math.floor(r() * COATS.length)], sh = 0.9 + r() * 0.2;
  put('skin_light', A.skin, [1.12, 0.92, 0.88]);
  put(coat, A.coat, sh);
  if (A.belt) put('cloth_brown', A.belt);
  if (A.plate) put('lacquer_chestnut', A.plate);
  if (A.lace) put('cloth_red', A.lace);
  put(['cloth_brown', 'cloth_ochre', 'cloth_green', 'cloth_brown'][Math.floor(r() * 4)], A.leg, 0.9);
  put('hide_black', A.shoe);
  put('hair_dark', A.hair);
  if (A.cap) put('cloth_black', A.cap);
  if (A.wood) put('timber', A.wood);
  if (A.bronze) put('bronze', A.bronze);
  void lathe; void HAIR_STYLES;
}
