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

/** The head, by variant v (0–5): the face's features, the hair or the cap, the moustache and beard; hi only. */
const HEADS = [
  { hair: 'bun', must: 'long', beard: 0 }, { hair: 'bun', must: 'short', beard: 0 }, { hair: 'bun', must: 'none', beard: 0 },
  { hair: 'bun', must: 'long', beard: 1 }, { hair: 'plait', must: 'short', beard: 0 }, { hair: 'bun', must: 'none', beard: 2 },
];
function head(a, v, cap, dy = 0, hi = true) {
  const H = HEADS[v % HEADS.length], up = (role, g) => a(role, dy ? g.translate(0, dy, 0) : g);
  up('skin', tube([[0, 1.46, 0, 0.052], [0, 1.58, 0, 0.046]], 5));                // the neck
  up('skin', at(ball(hi ? 0.098 : 0.092, hi ? 9 : 7, hi ? 6 : 5).scale(1, 1.12, 1), 0, 1.6, 0));
  if (!hi) {
    up('hair', at(slathe([[0.099, 1.64], [0.103, 1.7], [0.086, 1.78], [0.038, 1.82], [0.001, 1.825]], 7), 0, 0, 0.012));
    if (cap) up('cap', box(-0.12, 1.74, -0.12, 0.12, 1.84, 0.12));
    return;
  }
  // the ears, the nose with its wings, the brows, the eyes with their lids, the lips
  const dd = (role, g) => up('d:' + role, g);                                                       // (fine detail: seen within a dozen metres)
  for (const s of [-1, 1]) dd('skin', at(ball(0.026, 6, 4).scale(0.5, 1.5, 1), s * 0.1, 1.605, 0.005));
  dd('skin', box(-0.011, 1.578, -0.126, 0.011, 1.62, -0.09));
  dd('skin', box(-0.02, 1.574, -0.112, 0.02, 1.592, -0.09));
  for (const s of [-1, 1]) {
    dd('hair', box(s * 0.036 - 0.026, 1.636, -0.097, s * 0.036 + 0.026, 1.65, -0.082));
    dd('hair', box(s * 0.034 - 0.014, 1.618, -0.0985, s * 0.034 + 0.014, 1.626, -0.088));          // the eye's slit
    dd('skin', box(s * 0.034 - 0.016, 1.626, -0.099, s * 0.034 + 0.016, 1.632, -0.09));            // the lid
  }
  dd('lip', box(-0.022, 1.552, -0.1, 0.022, 1.566, -0.088));
  // hair: a cap of hair drawn to the knot, the brow line, the knot twisted to the right (or a plait down the back)
  up('hair', at(slathe([[0.104, 1.64], [0.108, 1.7], [0.092, 1.775], [0.045, 1.82], [0.001, 1.83]], 7), 0, 0, 0.012));
  dd('hair', box(-0.092, 1.664, -0.104, 0.092, 1.686, -0.09));
  for (const s of [-1, 1]) dd('hair', box(s * 0.098 - 0.006, 1.6, -0.03, s * 0.098 + 0.006, 1.66, 0.04));   // the sideburns
  if (cap) up('cap', cap === 'ban' ? box(-0.12, 1.74, -0.12, 0.12, 1.84, 0.12) : box(-0.13, 1.76, -0.13, 0.13, 1.8, 0.13));
  else if (H.hair === 'plait') { up('hair', tube([[0, 1.74, 0.07, 0.03], [0, 1.62, 0.12, 0.028], [0, 1.45, 0.14, 0.024], [0, 1.3, 0.13, 0.016]], 6)); up('hair', at(ball(0.04, 6, 4), 0, 1.84, 0)); }
  else { up('hair', at(ball(0.058, 6, 4), 0.07, 1.845, 0.03)); up('hair', tube([[0.02, 1.8, 0.02, 0.03], [0.07, 1.835, 0.03, 0.034]], 5)); up('hair', box(-0.01, 1.66, 0.09, 0.01, 1.8, 0.108)); }
  // moustache and beard
  if (H.must !== 'none') for (const s of [-1, 1]) dd('hair', tube([[s * 0.005, 1.578, -0.1, 0.012, 0.007], [s * 0.04, 1.576, -0.093, 0.011, 0.006], [s * 0.062, H.must === 'long' ? 1.545 : 1.565, -0.082, 0.006, 0.004]], 5));
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
  if (K.armor) up('plate', slathe([[0.215 * k, 1.4], [0.225 * k, 1.3], [0.2 * k, 1.02], [0.24 * k, 0.97], [0.26 * k, 0.62]], 6).scale(1, 1, 0.74));
  const arm = (pts) => up('coat', T(pts));
  if (drive) for (const s of [-1, 1]) arm([[s * 0.2, 1.4, 0, 0.056], [s * 0.2, 1.22, -0.36, 0.042]]);
  else if (K.weapon === 'crossbow') { arm([[0.2, 1.4, 0, 0.056], [0.14, 1.2, -0.42, 0.042]]); arm([[-0.2, 1.4, 0, 0.056], [-0.06, 1.18, -0.3, 0.042]]); up('wood', box(-0.026, 1.16, -0.78, 0.026, 1.21, -0.06)); up('bronze', box(-0.33, 1.18, -0.79, 0.33, 1.2, -0.78)); }
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
    up('d:belt', box(-0.04, 1.0, -0.158, 0.04, 1.06, -0.145));                                    // the belt's hook plate
    up('d:trim', slathe([[0.082, 1.46], [0.088, 1.47], [0.088, 1.5], [0.08, 1.505]], 10));      // the collar's band
    up('d:trim', slathe([[0.215, hem], [0.218, hem + 0.01], [0.215, hem + 0.06]], 12).scale(1, 1, 0.72));   // the hem's edging
    if (!K.armor) up('d:trim', tube([[-0.06, 1.46, -0.1, 0.012], [0.05, 1.22, -0.138, 0.011], [0.08, 1.06, -0.145, 0.011]], 5));   // the lapel
    for (let k = 0; k < 2; k++) up('d:coat', box(-0.012 + (k ? 0.1 : -0.1), hem + 0.1, -0.2, 0.012 + (k ? 0.1 : -0.1), 0.98, -0.155));   // pleats of the skirt
  }
  // armour: rows of lames over chest, shoulders and skirt (lamellar), the lacings
  if (K.armor) {
    // the middle version: a smooth cuirass and skirt; the lames over them (stepped rows) are fine detail
    up('plate', SL([[0.212, 1.4], [0.222, 1.3], [0.214, 1.12], [0.2, 1.02]], 12).scale(1, 1, 0.74));
    up('plate', SL([[0.2, 1.0], [0.24, 0.97], [0.262, 0.66], [0.27, 0.6]], 12).scale(1, 1, 0.74));
    const prof = [];
    for (let i = 0; i < 5; i++) { const y = 1.38 - i * 0.075; prof.push([0.2 - i * 0.004, y], [0.228 - i * 0.004, y], [0.208 - i * 0.004, y - 0.01]); }
    up('d:plate', slathe([[0.218, 1.4], ...prof.slice(1), [0.2, 1.02]], 12).scale(1, 1, 0.74));
    const sk = [[0.2, 1.0], [0.24, 0.98]];
    for (let i = 0; i < 4; i++) sk.push([0.25 + i * 0.012, 0.9 - i * 0.12], [0.23 + i * 0.012, 0.9 - i * 0.12 - 0.02]);
    up('d:plate', slathe(sk, 12).scale(1, 1, 0.74));
    for (const s of [-1, 1]) {
      up('plate', box(s * 0.2 - 0.07, 1.4, -0.09, s * 0.2 + 0.07, 1.47, 0.09));
      if (hi) { up('d:plate', box(s * 0.22 - 0.06, 1.34, -0.085, s * 0.22 + 0.06, 1.4, 0.085)); up('d:plate', box(s * 0.235 - 0.05, 1.29, -0.08, s * 0.235 + 0.05, 1.345, 0.08)); }   // the shoulder lames
    }
    if (hi) {
      up('d:lace', slathe([[0.222, 1.32], [0.223, 1.34], [0.223, 1.1], [0.222, 1.09]], 12).scale(1, 1, 0.74));
      for (let k = -2; k <= 2; k++) up('d:lace', box(k * 0.07 - 0.006, 1.12, -0.17, k * 0.07 + 0.006, 1.36, -0.158));              // the lacing down the chest
      for (let k = 0; k < 4; k++) up('d:stud', box(-0.1 + k * 0.067 - 0.012, 1.3, -0.172, -0.1 + k * 0.067 + 0.012, 1.325, -0.166));
    }
  }
  // arms and hands: a hand is a fist with its thumb
  const hand = (x, y, z, s = 1) => { up('skin', at(ball(0.04, 5, 4), x, y, z)); if (hi) up('d:skin', tube([[x + 0.025 * s, y + 0.03, z - 0.01, 0.011], [x + 0.03 * s, y + 0.07, z - 0.03, 0.009]], 5)); };
  const cuff = (x, y, z) => { if (hi) up('d:trim', at(slathe([[0.05, -0.03], [0.054, 0], [0.05, 0.03]], 8), x, y, z)); };
  if (drive) {
    for (const s of [-1, 1]) { up('coat', T([[s * 0.2, 1.4, 0, 0.056], [s * 0.26, 1.18, -0.12, 0.05], [s * 0.2, 1.22, -0.36, 0.042]], 8)); hand(s * 0.2, 1.22, -0.38, s); cuff(s * 0.2, 1.22, -0.35); }
  } else if (K.weapon === 'crossbow') {
    up('coat', T([[0.2, 1.4, 0, 0.056], [0.27, 1.18, -0.14, 0.05], [0.14, 1.2, -0.42, 0.042]], 8));
    up('coat', T([[-0.2, 1.4, 0, 0.056], [-0.26, 1.15, -0.1, 0.05], [-0.06, 1.18, -0.3, 0.042]], 8));
    hand(0.14, 1.2, -0.44); hand(-0.06, 1.18, -0.32);
    up('wood', box(-0.03, 1.15, -0.8, 0.03, 1.22, -0.05));                                  // the stock
    up('bronze', box(-0.34, 1.17, -0.8, 0.34, 1.2, -0.77));                                  // the bow's limbs (bronze-bound)
    up('bronze', box(-0.012, 1.22, -0.3, 0.012, 1.27, -0.2));                                // the trigger
    if (hi) { up('d:bronze', box(-0.02, 1.2, -0.38, 0.02, 1.24, -0.22)); up('d:wood', box(-0.016, 1.22, -0.82, 0.016, 1.235, -0.7)); up('d:wood', box(-0.012, 1.222, -0.9, 0.012, 1.232, -0.8)); }   // the lock, the bolt groove, the bolt
  } else {
    // the right arm bent forward holding the weapon upright, the left hanging with the hand half closed
    up('coat', T([[0.2, 1.4, 0, 0.056], [0.27, 1.15, -0.1, 0.05], [0.2, 1.2, -0.31, 0.042]], 8));
    hand(0.2, 1.2, -0.33); cuff(0.2, 1.2, -0.3);
    up('coat', T([[-0.2, 1.4, 0, 0.056], [-0.25, 1.15, 0.0, 0.05], [-0.24, 0.93, -0.06, 0.042]], 8));
    hand(-0.24, 0.9, -0.07, -1); cuff(-0.24, 0.93, -0.06);
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
  const s = sc * (K.tall ?? 1) * (0.97 + r() * 0.08), M = new Matrix4().compose(_p.set(x, y, z), _q.setFromAxisAngle(_up, rot), _s.set(s * (0.94 + r() * 0.1), s, s));
  const hv = K.long ? [3, 5, 0, 3][Math.floor(r() * 4)] : Math.floor(r() * 6), drop = K.pose === 'kneel' ? 0.45 : 0;
  const Hh = assembly(`qin-head|${hv}|${K.cap ?? ''}|${drop}`, (a) => head(a, hv, K.cap, -drop, true));
  const coat = COATS[Math.floor(r() * COATS.length)], sh = 0.9 + r() * 0.2, legc = ['cloth_brown', 'cloth_ochre', 'cloth_green', 'cloth_brown'][Math.floor(r() * 4)];
  const trim = kind === 'general' || kind === 'officer' ? 'cloth_red' : 'cloth_brown';
  const put = (mat, g, rch, shade = 1) => { if (!g) return; const t = tint(mat, shade); bag.addInstance(t ? t.base : mat, g, M, { color: t?.color ?? null, real: mat, reach: rch }); };
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
  body(Hh, mid);
  void lathe; void HAIR_STYLES;
}
