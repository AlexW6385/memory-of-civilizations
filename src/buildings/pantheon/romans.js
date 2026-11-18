// Roman marble and bronze figures, modelled (docs/settlements/rome.md §4.15): the gods of the rotunda, Augustus and
// Agrippa in the portico, the togate and cuirassed honorific statues of the forum, the equestrian bronze. They are
// made with the Parthenon's figure kit (skeleton, rounded limbs with their muscle, head with brow, nose, lips and hair,
// cloth that follows the body: src/buildings/parthenon/bodies.js, horses.js) and add what Rome's carvers added: the
// toga with its sinus and umbo, the muscled cuirass with its pteruges and the paludamentum, the lion-skin, the veil,
// the attributes by which each god was known. Height 1 (feet at y = 0, facing +z; her right is -x); scaled by the caller.
// A figure is { stone, metal, gilt }: lists of geometries (the marble or bronze body; the bronze attributes; the gilt ones).
// Everything is deterministic: the little differences between figures come from the key and from the position.

import { Matrix4 } from '../../core/three.js';
import { bodyOf, skeleton, vec as A } from '../parthenon/bodies.js';
import { horseOf } from '../parthenon/horses.js';
import { tube, blob, limb } from '../parthenon/figures.js';
import { lathe } from '../../core/geom.js';
import { merge } from '../../styles/greek/columns.js';

const TAU = Math.PI * 2;
const around = (th, c, w) => { const d = Math.atan2(Math.sin(th - c), Math.cos(th - c)) / w; return Math.exp(-d * d); };
const bell = (t, c, w) => Math.exp(-(((t - c) / w) ** 2));

/** What each figure is: pose, dress and the hands' work (R is the figure's own right, at -x). */
export const GODS = {
  jupiter: { pose: 'seat', drape: 'mantle', beard: 1, hair: 'curls', R: 'thunderbolt', L: 'sceptre', head: 'wreath', seat: { w: 0.19, back: 0.2, backrest: 1 } },
  mars: { pose: 'ease', drape: 'nude', cuirass: 1, helmet: 1, R: 'spear', L: 'shield', pal: 1 },
  venus: { pose: 'ease', drape: 'mantle', bareLegs: 1, female: 1, hair: 'bun', R: 'breast', L: 'hip', earrings: 1, head: 'diadem' },
  sol: { pose: 'ease', drape: 'nude', hair: 'curls', R: 'raised', L: 'globe', head: 'rays', cloakL: 1 },
  luna: { pose: 'ease', drape: 'peplos', female: 1, hair: 'long', R: 'torch', L: 'hip', head: 'crescent' },
  mercury: { pose: 'ease', drape: 'nude', hair: 'curls', R: 'caduceus', L: 'purse', head: 'petasos', cloakL: 1 },
  saturn: { pose: 'ease', drape: 'peplos', beard: 1, hair: 'curls', R: 'scythe', L: 'hip', head: 'veil' },
  minerva: { pose: 'ease', drape: 'peplos', female: 1, helmet: 1, R: 'spear', L: 'shield', aegis: 1 },
  neptune: { pose: 'ease', drape: 'mantle', bareLegs: 1, beard: 1, hair: 'curls', R: 'trident', L: 'hip', head: 'wreath' },
  caesar: { pose: 'ease', drape: 'peplos', toga: 1, hair: 'curls', R: 'scroll', L: 'toga', head: 'wreath' },
  hercules: { pose: 'ease', drape: 'nude', beard: 1, hair: 'curls', R: 'club', L: 'lionskin', head: 'wreath' },
  ceres: { pose: 'ease', drape: 'peplos', female: 1, hair: 'long', R: 'ears', L: 'hip', head: 'veil' },
  juno: { pose: 'ease', drape: 'peplos', female: 1, hair: 'bun', R: 'sceptre', L: 'hip', head: 'diadem', veilBack: 1 },
  vesta: { pose: 'ease', drape: 'peplos', female: 1, hair: 'long', R: 'patera', L: 'hip', head: 'veil' },
  augustus: { pose: 'ease', drape: 'nude', cuirass: 1, hair: 'curls', R: 'adlocutio', L: 'spear', pal: 1, mirror: 1 },
  agrippa: { pose: 'ease', drape: 'nude', cuirass: 1, hair: 'curls', R: 'hip', L: 'spear', pal: 1, head: 'rostral' },
  // the forum's honorific statues
  togatus: { pose: 'ease', drape: 'peplos', toga: 1, hair: 'curls', R: 'scroll', L: 'toga' },
  loricatus: { pose: 'ease', drape: 'nude', cuirass: 1, hair: 'curls', R: 'adlocutio', L: 'hip', pal: 1 },
  matrona: { pose: 'ease', drape: 'peplos', female: 1, hair: 'bun', R: 'breast', L: 'hip', head: 'veil' },
  genius: { pose: 'ease', drape: 'peplos', toga: 1, hair: 'curls', R: 'patera', L: 'cornu', head: 'veil' },
  lar: { pose: 'stride', drape: 'peplos', hair: 'curls', R: 'rhyton', L: 'patera', lar: 1 },
  rider: { pose: 'ease', drape: 'nude', cuirass: 1, hair: 'curls', R: 'adlocutio', L: 'hip', pal: 1 },
};
const ARMS = {
  spear: { R: [-0.2, 0.6, 0.1] }, trident: { R: [-0.2, 0.6, 0.1] }, scythe: { R: [-0.2, 0.6, 0.1] }, club: { R: [-0.2, 0.52, 0.1] }, sceptre: { R: [-0.2, 0.62, 0.1] },
  caduceus: { R: [-0.2, 0.6, 0.1] }, thunderbolt: { R: [-0.15, 0.4, 0.2] }, scroll: { R: [-0.16, 0.56, 0.17] }, breast: { R: [-0.04, 0.72, 0.1] },
  raised: { R: [-0.27, 0.93, 0.1] }, torch: { R: [-0.22, 0.86, 0.1] }, ears: { R: [-0.15, 0.55, 0.15] }, patera: { R: [-0.13, 0.55, 0.19] },
  adlocutio: { R: [-0.27, 0.86, 0.17] }, hip: { R: [-0.165, 0.5, 0.05] }, rhyton: { R: [-0.1, 0.9, 0.0] },
};
const ARMS_L = {
  spear: [0.2, 0.62, 0.1], sceptre: [0.2, 0.62, 0.1], shield: [0.17, 0.54, 0.07], hip: [0.165, 0.5, 0.05], purse: [0.16, 0.46, 0.08], globe: [0.2, 0.62, 0.16],
  toga: [0.13, 0.6, 0.1], lionskin: [0.17, 0.5, 0.08], cornu: [0.2, 0.6, 0.14], patera: [0.2, 0.58, 0.14],
};

/** The hand's point: the wrist moved a little along the forearm. */
const handAt = (J, s) => A.add(J['wr' + s], A.mul(A.norm(A.sub(J['wr' + s], J['el' + s])), 0.04));
const rod = (a, b, r0, r1 = r0, n = 6) => limb(a, b, r0, r1, n);

/** The muscled cuirass over the trunk, the pteruges at the hips and the shoulders; into `st` (marble) and `me` (gilt edges). */
function cuirass(J, st, me, seg) {
  const sp = [A.add(J.pelvis, [0, -0.025, 0]), A.lerp(J.pelvis, J.chest, 0.55), J.chest, A.lerp(J.chest, J.neck, 0.7)];
  const mod = (th, t) => {
    let m = 1;
    m += 0.05 * (around(th, Math.PI / 2 - 0.55, 0.4) + around(th, Math.PI / 2 + 0.55, 0.4)) * bell(t, 0.72, 0.15);       // the pectorals
    m -= 0.03 * around(th, Math.PI / 2, 0.12) * bell(t, 0.5, 0.45);                                                      // the linea alba
    m += 0.03 * (around(th, Math.PI / 2 - 0.3, 0.2) + around(th, Math.PI / 2 + 0.3, 0.2)) * (bell(t, 0.27, 0.07) + bell(t, 0.4, 0.07) + bell(t, 0.53, 0.07));
    m += 0.04 * bell(t, 0.0, 0.06) + 0.02 * bell(t, 0.97, 0.03);                                                         // the lower edge, the neck edge
    return m;
  };
  st.push(tube(sp, [[0.1, 0.075], [0.083, 0.064], [0.106, 0.079], [0.1, 0.066]], { seg: seg + 4, sub: 1, side: A.norm(A.sub(J.shL, J.shR)), mod, capA: false, capB: false }));
  // the pteruges: two rows of leather straps hanging from the hips, a shorter row at the shoulders
  const n = seg > 6 ? 16 : 10, c = A.add(J.pelvis, [0, -0.03, 0.004]);
  for (let row = 0; row < 2; row++) for (let k = 0; k < n; k++) {
    const th = (k + 0.5 * row) / n * TAU, x = Math.cos(th) * (0.118 + row * 0.01), z = Math.sin(th) * (0.092 + row * 0.008);
    if (Math.abs(th - Math.PI / 2) < 0.0 && false) continue;
    st.push(blob([c[0] + x, c[1] - 0.045 - row * 0.012, c[2] + z], 0.016, [0.9, 2.6 - 0.3 * row, 0.5], 5));
  }
  for (const s of ['R', 'L']) for (let k = 0; k < 3; k++) st.push(blob(A.add(J['sh' + s], [(s === 'R' ? -1 : 1) * (0.012 + k * 0.012), -0.03 - k * 0.002, 0.0]), 0.012, [0.8, 2.0, 0.5], 4));
  me.push(blob(A.add(J.chest, [0, 0.015, 0.072]), 0.02, [1, 1, 0.45], 7));                                               // the gorgoneion on the breast
  me.push(tube([A.add(J.pelvis, [-0.1, 0.0, 0.07]), A.add(J.pelvis, [0, 0.0, 0.098]), A.add(J.pelvis, [0.1, 0.0, 0.07])], [0.006, 0.006, 0.006], { seg: 4, sub: 1 }));   // the belt
}
/** The paludamentum: a cloak pinned at the right shoulder, falling down the back and over the left forearm. */
function paludamentum(J, st, seg) {
  const sh = J.shL, el = J.elL, wr = J.wrL;
  st.push(tube([A.add(sh, [0.0, 0.03, -0.02]), A.add(sh, [0.03, -0.12, -0.075]), A.add(J.pelvis, [0.06, -0.12, -0.085]), A.add(J.pelvis, [0.04, -0.36, -0.1]), [J.pelvis[0] + 0.03, 0.12, -0.105]],
    [[0.065, 0.016], [0.09, 0.022], [0.105, 0.026], [0.115, 0.028], [0.12, 0.03]], { seg: seg + 3, sub: 1, side: [0.8, 0, 0.6], mod: (th, t) => 1 + 0.09 * Math.cos(5 * th + 6 * t) + 0.04 * Math.cos(11 * th + 3 * t), capA: false }));
  st.push(tube([A.add(sh, [0.0, 0.025, 0.01]), A.add(el, [0.03, 0.01, 0.03]), A.add(wr, [0.01, -0.02, 0.03]), A.add(wr, [0.0, -0.17, 0.05])], [[0.04, 0.02], [0.045, 0.025], [0.05, 0.026], [0.06, 0.02]], { seg: seg + 2, sub: 1, side: [0.7, 0, 0.7], mod: (th, t) => 1 + 0.12 * Math.cos(5 * th + 7 * t) }));
  st.push(blob(A.add(J.shR, [0.0, 0.0, 0.0]), 0.022, [1, 0.8, 1], 6));                                                    // the brooch
}
/** The toga over the tunic: the sinus across the chest from the left shoulder to the right hip, the umbo, the swag of the hem. */
function toga(J, st, seg) {
  const fold = (th, t) => 1 + 0.12 * Math.cos(6 * th + 8 * t) + 0.05 * Math.cos(13 * th + 3 * t);
  st.push(tube([A.add(J.shL, [0.0, 0.03, 0.0]), A.add(J.chest, [0.03, 0.0, 0.07]), A.add(J.pelvis, [-0.02, 0.05, 0.095]), A.add(J.pelvis, [-0.09, -0.03, 0.085])], [[0.04, 0.02], [0.05, 0.02], [0.056, 0.022], [0.05, 0.02]], { seg: seg + 2, sub: 1, side: [0.6, 0.5, 0.2], mod: fold }));
  st.push(blob(A.add(J.pelvis, [0.01, 0.02, 0.097]), 0.04, [1.5, 0.9, 0.6], 6));                                          // the umbo
  st.push(tube([A.add(J.pelvis, [0.1, -0.05, 0.05]), A.add(J.pelvis, [0.02, -0.18, 0.108]), A.add(J.pelvis, [-0.07, -0.24, 0.104]), A.add(J.pelvis, [-0.125, -0.3, 0.07])], [[0.042, 0.03], [0.05, 0.033], [0.046, 0.032], [0.035, 0.03]], { seg: seg + 2, sub: 1, side: [0.7, 0.4, 0], mod: fold }));   // the swag
  st.push(tube([A.add(J.shL, [0.0, 0.02, 0.0]), J.elL, A.add(J.wrL, [0.0, 0.0, 0.0])], [[0.052, 0.045], [0.052, 0.046], [0.045, 0.04]], { seg: seg + 2, sub: 1, mod: fold }));   // the left arm in its folds
  st.push(tube([A.add(J.shL, [0.01, 0.03, -0.02]), A.add(J.shL, [0.06, -0.12, -0.075]), A.add(J.pelvis, [0.08, -0.25, -0.09])], [[0.06, 0.02], [0.08, 0.026], [0.09, 0.03]], { seg: seg + 2, sub: 1, side: [0.8, 0, 0.6], mod: fold, capB: true }));   // the end down the back
}

/** One figure: { stone, metal, gilt } at height 1. key: a GODS key; lod 0 (full), 1 (reduced), 2 (least); at: the position, for the small differences. */
export function romanFigure(key, lod = 0, at = [0, 0]) {
  const G = GODS[key], o = {
    pose: G.pose, drape: G.drape, female: !!G.female, hair: G.hair, beard: !!G.beard, helmet: !!G.helmet, lod, bareLegs: !!G.bareLegs, seat: G.seat,
    mirror: !!G.mirror, look: G.pose === 'seat' ? 0 : (key.length % 2 ? 7 : -7),
    arms: { ...(ARMS[G.R] ?? {}), L: ARMS_L[G.L] ?? ARMS_L.hip }, lean: G.pose === 'ease' ? (key.length % 2 ? 2 : -2) : 0,
  };
  if (G.R === 'hip' || G.R === 'breast') o.arms.R = ARMS[G.R].R;
  if (G.pose === 'seat') { o.arms = { R: [-0.22, 0.48, 0.2], L: [0.2, 0.56, 0.16] }; }
  const body = bodyOf(o), J = skeleton(o), st = [...body.stone], me = [...body.metal], gi = [], seg = lod ? 7 : 9;
  const hR = handAt(J, 'R'), hL = handAt(J, 'L'), hd = J.head;
  const gy = G.pose === 'seat' ? 0.3 : 0;
  void gy;
  if (G.cuirass) cuirass(J, st, gi, seg);
  if (G.pal) paludamentum(J, st, seg);
  if (G.toga) toga(J, st, seg);
  if (G.aegis) {                                                                                       // the aegis: a scaled cape over the shoulders with the gorgoneion
    st.push(tube([A.add(J.shR, [0, 0.03, 0.0]), A.add(J.chest, [0, 0.02, 0.08]), A.add(J.shL, [0, 0.03, 0.0])], [[0.04, 0.02], [0.05, 0.026], [0.04, 0.02]], { seg: 8, sub: 1, side: [0.5, 0.8, 0], mod: (th, t) => 1 + 0.1 * Math.cos(9 * th + 14 * t) }));
    gi.push(blob(A.add(J.chest, [0, 0.0, 0.092]), 0.024, [1, 1, 0.4], 7));
  }
  if (G.cloakL) {                                                                                      // the chlamys over the left arm
    st.push(tube([A.add(J.shL, [0.0, 0.02, 0.0]), A.add(J.elL, [0.03, 0.0, -0.02]), A.add(J.wrL, [0.03, -0.1, -0.02]), A.add(J.wrL, [0.02, -0.3, -0.03])], [[0.045, 0.02], [0.05, 0.026], [0.06, 0.022], [0.06, 0.02]], { seg: 7, sub: 1, side: [0.8, 0, 0.6], mod: (th, t) => 1 + 0.12 * Math.cos(5 * th + 7 * t) }));
  }
  if (G.veilBack) st.push(tube([A.add(hd, [0, 0.055, -0.01]), A.add(hd, [0, 0.0, -0.065]), A.add(hd, [0, -0.1, -0.075]), A.add(hd, [0, -0.3, -0.07])], [[0.05, 0.012], [0.06, 0.016], [0.07, 0.018], [0.09, 0.02]], { seg: 6, sub: 1, side: [1, 0, 0], capA: false }));
  // what is on the head
  switch (G.head) {
    case 'wreath': case 'rostral': {
      const n = lod ? 10 : 16;
      for (let k = 0; k < n; k++) { const th = k / n * TAU; if (Math.abs(Math.atan2(Math.sin(th - Math.PI / 2), Math.cos(th - Math.PI / 2))) < 0.3 && G.head === 'wreath') { /* the brow */ } gi.push(blob([hd[0] + Math.cos(th) * 0.058, hd[1] + 0.034, hd[2] + 0.004 + Math.sin(th) * 0.058], 0.012, [0.7, 0.35, 1.5], 4)); }
      if (G.head === 'rostral') for (let k = 0; k < 5; k++) { const th = (k + 0.5) / 5 * TAU; gi.push(limb([hd[0] + Math.cos(th) * 0.058, hd[1] + 0.05, hd[2] + Math.sin(th) * 0.058], [hd[0] + Math.cos(th) * 0.075, hd[1] + 0.068, hd[2] + Math.sin(th) * 0.075], 0.01, 0.005, 4)); }
      break;
    }
    case 'diadem': gi.push(tube([A.add(hd, [-0.054, 0.03, 0.01]), A.add(hd, [0, 0.062, 0.05]), A.add(hd, [0.054, 0.03, 0.01])], [[0.01, 0.008], [0.026, 0.008], [0.01, 0.008]], { seg: 5, sub: 1 })); break;
    case 'rays': for (let k = 0; k < 9; k++) { const a = -Math.PI * 0.46 + k * Math.PI * 0.92 / 8; gi.push(limb([hd[0] + Math.sin(a) * 0.062, hd[1] + 0.03 + Math.cos(a) * 0.062, hd[2]], [hd[0] + Math.sin(a) * 0.15, hd[1] + 0.03 + Math.cos(a) * 0.15, hd[2] - 0.004], 0.0065, 0.0016, 4)); } break;
    case 'crescent': { const pts = []; for (let k = 0; k <= 6; k++) { const a = -1.15 + k * 0.383; pts.push([hd[0] + Math.sin(a) * 0.07, hd[1] + 0.07 + Math.cos(a) * 0.05, hd[2] + 0.014]); } gi.push(tube(pts, [0.004, 0.009, 0.011, 0.012, 0.011, 0.009, 0.004], { seg: 5, sub: 1 })); break; }
    case 'petasos': gi.push(blob([hd[0], hd[1] + 0.042, hd[2]], 0.082, [1, 0.1, 1], 8), blob([hd[0], hd[1] + 0.06, hd[2]], 0.045, [1, 0.6, 1], 6));
      for (const s of [-1, 1]) gi.push(blob([hd[0] + s * 0.07, hd[1] + 0.07, hd[2] - 0.012], 0.03, [0.15, 1.1, 0.55], 5)); break;
    case 'veil': {
      st.push(tube([A.add(hd, [0, 0.062, -0.012]), A.add(hd, [0, 0.03, -0.062]), A.add(hd, [0, -0.07, -0.074]), A.add(hd, [0, -0.17, -0.062])], [[0.06, 0.016], [0.066, 0.02], [0.078, 0.022], [0.09, 0.022]], { seg: 7, sub: 1, side: [1, 0, 0], mod: (th, t) => 1 + 0.06 * Math.cos(6 * th + 5 * t), capA: false }));
      for (const s of [-1, 1]) st.push(tube([A.add(hd, [s * 0.05, 0.035, 0.012]), A.add(hd, [s * 0.062, -0.03, 0.0]), A.add(hd, [s * 0.07, -0.1, -0.02])], [[0.012, 0.012], [0.016, 0.014], [0.02, 0.014]], { seg: 5, sub: 1 }));
      break;
    }
    default: break;
  }
  if (G.earrings) for (const s of [-1, 1]) gi.push(blob(A.add(hd, [s * 0.052, -0.04, 0.0]), 0.007, [1, 1, 1], 5));
  // the hands' attributes
  const tilt = (h, d, a, b, r0, r1 = r0, n = 6) => rod(A.add(h, A.mul(A.norm(d), a)), A.add(h, A.mul(A.norm(d), b)), r0, r1, n);
  const fist = (h) => st.push(blob(h, 0.021, [1, 1, 1], 6));
  switch (G.R) {
    case 'spear': me.push(tilt(hR, [0.03, 1, 0], -0.6, 0.62, 0.0085, 0.007), limb(A.add(hR, [0.02, 0.62, 0]), A.add(hR, [0.025, 0.74, 0]), 0.013, 0.0015, 5)); break;
    case 'trident': { me.push(tilt(hR, [0.03, 1, 0], -0.55, 0.6, 0.0095, 0.007)); const top = A.add(hR, [0.02, 0.6, 0]); me.push(limb(A.add(top, [-0.055, 0, 0]), A.add(top, [0.055, 0, 0]), 0.006, 0.006, 5)); for (const f of [-1, 0, 1]) me.push(limb(A.add(top, [f * 0.055, 0, 0]), A.add(top, [f * 0.055, 0.13, 0]), 0.007, 0.0015, 4)); break; }
    case 'scythe': me.push(tilt(hR, [0.03, 1, 0], -0.5, 0.62, 0.009, 0.0075)); for (let k = 0; k < 5; k++) { const a = k * 0.32; me.push(limb(A.add(hR, [0.02 + 0.045 * Math.sin(a) + 0.0, 0.62 + 0.04 * Math.cos(a) * 0.4 + k * 0.025, 0]), A.add(hR, [0.02 + 0.045 * Math.sin(a + 0.32) + 0.0, 0.62 + 0.016 * Math.cos(a + 0.32) + (k + 1) * 0.025, 0]), 0.011 - k * 0.0015, 0.011 - (k + 1) * 0.0015, 4)); } break;
    case 'club': { me.push(limb(A.add(hR, [0.0, -0.44, 0.0]), A.add(hR, [0.0, 0.12, 0.0]), 0.012, 0.026, 6)); me.push(blob(A.add(hR, [0.0, 0.11, 0]), 0.03, [1, 1.3, 1], 6)); break; }
    case 'sceptre': gi.push(tilt(hR, [0.03, 1, 0], -0.55, 0.6, 0.007, 0.006)); gi.push(blob(A.add(hR, [0.02, 0.62, 0]), 0.016, [1, 1.3, 1], 5)); break;
    case 'caduceus': { me.push(tilt(hR, [0.03, 1, 0], -0.5, 0.45, 0.007, 0.006)); const top = A.add(hR, [0.014, 0.45, 0]); for (const s of [-1, 1]) me.push(limb(top, A.add(top, [s * 0.05, 0.035, 0]), 0.006, 0.002, 4)); me.push(blob(A.add(top, [0, 0.004, 0]), 0.011, [1, 1, 1], 5)); break; }
    case 'thunderbolt': { const h = hR; gi.push(blob(A.add(h, [0, 0.0, 0.03]), 0.017, [1, 1, 2.4], 6)); for (const s of [-1, 1]) for (let k = 0; k < 3; k++) gi.push(limb(A.add(h, [0, 0.0, 0.05]), A.add(h, [s * 0.03 * (k + 1) * 0.6, (k - 1) * 0.012, 0.11 + k * 0.012]), 0.007, 0.002, 4)); break; }
    case 'scroll': st.push(limb(A.add(hR, [-0.04, 0.0, 0.0]), A.add(hR, [0.05, 0.0, 0.02]), 0.014, 0.014, 6)); break;
    case 'torch': { me.push(tilt(hR, [0.0, 1, 0], -0.1, 0.2, 0.009, 0.0075)); gi.push(blob(A.add(hR, [0, 0.22, 0]), 0.02, [1, 1.5, 1], 5)); break; }
    case 'ears': for (let k = -3; k <= 3; k++) gi.push(limb(A.add(hR, [0.0, 0.0, 0.0]), A.add(hR, [k * 0.018, 0.12 + 0.01 * (3 - Math.abs(k)), 0.012 * (k % 2)]), 0.004, 0.0035, 4)); break;
    case 'patera': me.push(lathe([[0.001, 0], [0.034, 0.004], [0.038, 0.012], [0.03, 0.01], [0.001, 0.006]], 12).applyMatrix4(new Matrix4().setPosition(hR[0], hR[1] + 0.012, hR[2] + 0.01))); break;
    case 'rhyton': me.push(limb(hR, A.add(hR, [0.0, 0.06, 0.0]), 0.014, 0.028, 6)); me.push(blob(A.add(hR, [0, -0.01, 0]), 0.014, [1, 1, 1], 5)); break;
    default: break;
  }
  if (['spear', 'trident', 'scythe', 'club', 'sceptre', 'caduceus', 'scroll', 'torch', 'ears', 'patera', 'rhyton', 'adlocutio'].includes(G.R) || G.pose === 'seat') fist(hR);
  switch (G.L) {
    case 'spear': me.push(tilt(hL, [-0.02, 1, 0], -0.6, 0.6, 0.0085, 0.007), limb(A.add(hL, [-0.012, 0.6, 0]), A.add(hL, [-0.015, 0.72, 0]), 0.013, 0.0015, 5)); break;
    case 'sceptre': gi.push(tilt(hL, [-0.03, 1, 0], -0.5, 0.62, 0.007, 0.006), blob(A.add(hL, [-0.02, 0.63, 0]), 0.016, [1, 1.3, 1], 5)); break;
    case 'shield': {
      const r = 0.2, sh = lathe([[0.001, 0.045], [r * 0.18, 0.04], [r * 0.4, 0.02], [r * 0.9, 0.012], [r, 0.0], [r * 0.9, -0.012], [0.001, -0.012]], lod ? 10 : 18);
      sh.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2).setPosition(hL[0] + 0.045, hL[1] + 0.02, hL[2] + 0.06)); me.push(sh); break;
    }
    case 'globe': gi.push(blob(A.add(hL, [0, 0.03, 0.02]), 0.03, [1, 1, 1], 7)); break;
    case 'purse': me.push(blob(A.add(hL, [0, -0.04, 0.0]), 0.026, [1, 1.2, 0.9], 6)); break;
    case 'lionskin': st.push(tube([A.add(J.shL, [0, 0.03, 0.0]), A.add(J.elL, [0.02, 0.0, 0.02]), A.add(J.wrL, [0.01, -0.12, 0.02]), A.add(J.wrL, [0.0, -0.3, 0.03])], [[0.05, 0.026], [0.06, 0.034], [0.07, 0.03], [0.06, 0.026]], { seg: 7, sub: 1, side: [0.7, 0, 0.7], mod: (th, t) => 1 + 0.16 * Math.cos(5 * th + 6 * t) }), blob(A.add(J.shL, [0.04, -0.02, 0.02]), 0.04, [1.2, 1, 1], 6)); break;
    case 'cornu': me.push(tube([hL, A.add(hL, [0.0, 0.08, 0.05]), A.add(hL, [0.0, 0.17, 0.04])], [[0.012, 0.012], [0.03, 0.03], [0.04, 0.04]], { seg: 6, sub: 1 })); break;
    case 'patera': me.push(lathe([[0.001, 0], [0.03, 0.004], [0.034, 0.012], [0.026, 0.01], [0.001, 0.006]], 10).applyMatrix4(new Matrix4().setPosition(hL[0], hL[1] + 0.01, hL[2] + 0.01))); break;
    default: break;
  }
  const fine = (m) => m;
  void fine;
  void at;
  return { stone: st, metal: me, gilt: gi };
}

/** An equestrian bronze: a cuirassed rider with his arm out on a horse that stands with one foreleg raised. Height 1 = the horse at the withers. */
export function equestrian(lod = 0) {
  const h = horseOf({ pose: 'stand', lod, bridle: true }), r = bodyOf({ pose: 'seat', drape: 'nude', lod, hair: 'curls', arms: { R: [-0.2, 0.46, 0.25], L: [0.2, 0.5, 0.2] }, legBend: [0, -0.2, 0.2] });
  return { horse: h, rider: r };
}

/** Merge a figure's lists (placed by the matrix m) into three geometries { stone, metal, gilt }. */
export function placeRoman(fig, h, x, y, z, yaw = 0) {
  const m = new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(h, h, h)).setPosition(x, y, z), out = {};
  for (const key of ['stone', 'metal', 'gilt']) { if (!fig[key]?.length) continue; const g = merge(fig[key]); g.applyMatrix4(m); out[key] = g; }
  return out;
}
export { merge };
