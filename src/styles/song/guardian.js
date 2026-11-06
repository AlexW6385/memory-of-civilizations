// The gate hall's guardians (jingang lishi; docs/settlements/song-kaifeng.md §10): painted clay
// figures over 5 m tall, one each side of the way through, bodies leaning a little forward toward
// the one passing between them, each holding a vajra weapon. Ours in the manner of the Liao and
// Song guardians: bare-chested, heavily muscled, a short skirt (dhoti) tied with a sash whose ends
// hang between the legs, a scarf (tianyi) looping in a hoop over the head and streaming down past the
// arms, the hair in a topknot, a wide stance on a rock; one raises a clenched fist, the other plants
// a vajra staff. Built at 1 m and scaled to h.

import { box, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { tube } from '../../objects/kit.js';

function ell(x, y, z, rx, ry, rz, seg = 10, rows = 6) {
  const prof = [];
  for (let i = 0; i <= rows; i++) { const a = -Math.PI / 2 + (i / rows) * Math.PI; prof.push([Math.max(0.001, Math.cos(a)), Math.sin(a)]); }
  const g = lathe(prof, seg); g.scale(rx, ry, rz); g.translate(x, y, z); return g;
}

/**
 * vajra(bag, { at, y, h, dir, side (+1: the fist raised, mouth open; -1: the staff), skin, skirt, scarf, gilt }).
 * The figure faces dir.
 */
export function vajra(bag, el) {
  const [x, z] = el.at, H = el.h ?? 4.6, s = el.side ?? 1, [dx, dz] = el.dir ?? [0, 1];
  const skin = el.skin ?? 'terracotta', skirt = el.skirt ?? 'clay_green', scarf = el.scarf ?? 'clay_robe', gilt = el.gilt ?? 'clay_gilt';
  const yaw = Math.atan2(dx, dz), M = new Matrix4().makeRotationY(yaw).premultiply(new Matrix4().makeTranslation(x, el.y ?? 0, z)).multiply(new Matrix4().makeScale(H * s, H, H));
  // (mirrored for the second figure: the scale's x sign; the triangles are turned back below)
  const parts = [];
  const add = (mat, g) => parts.push([mat, g]);
  // the rock
  add('granite_block', ell(0, 0.0, 0.0, 0.26, 0.05, 0.2, 9, 4));
  // the legs: a wide stance, the right knee bent forward, the left leg braced out
  const leg = (sx, fz) => tube([[sx * 0.075, 0.5, 0, 0.055], [sx * 0.12, 0.38, fz * 0.5, 0.05], [sx * 0.14, 0.27, fz + 0.01, 0.042], [sx * 0.15, 0.15, fz * 0.6, 0.034], [sx * 0.155, 0.055, fz * 0.4, 0.026]], 9);
  add(skin, leg(1, 0.06)); add(skin, leg(-1, -0.02));
  for (const [sx, fz] of [[1, 0.024], [-1, -0.008]]) add(skin, ell(sx * 0.158, 0.035, fz + 0.03, 0.03, 0.022, 0.06, 8, 4));   // the feet
  // the skirt: flaring from the waist to the knees, the hem in two layers; the sash knotted, its ends between the legs
  add(skirt, lathe([[0.2, 0.28], [0.2, 0.29], [0.17, 0.36], [0.13, 0.45], [0.105, 0.52]], 14, (th) => (Math.abs(Math.sin(th)) > 0.7 ? 0.82 : 1) * (1 + 0.04 * Math.sin(th * 7))));
  add(scarf, lathe([[0.215, 0.26], [0.215, 0.27], [0.18, 0.32], [0.15, 0.36]], 14, (th) => (Math.abs(Math.sin(th)) > 0.7 ? 0.82 : 1)));
  add(gilt, lathe([[0.108, 0.5], [0.115, 0.52], [0.112, 0.55], [0.1, 0.56]], 14, (th) => (Math.abs(Math.sin(th)) > 0.7 ? 0.78 : 1)));
  add(scarf, ell(0, 0.5, 0.085, 0.035, 0.025, 0.02, 8, 4));
  add(scarf, tube([[0.01, 0.49, 0.09, 0.016, 0.006], [0.02, 0.38, 0.13, 0.02, 0.006], [0.0, 0.25, 0.12, 0.024, 0.006], [0.02, 0.12, 0.1, 0.026, 0.006]], 6));
  add(scarf, tube([[-0.01, 0.49, 0.09, 0.016, 0.006], [-0.035, 0.37, 0.12, 0.02, 0.006], [-0.03, 0.24, 0.1, 0.022, 0.006], [-0.05, 0.14, 0.08, 0.024, 0.006]], 6));
  // the torso: the belly, the broad chest, the neck; the pectorals and the belly's swell
  add(skin, tube([[0, 0.5, 0.0, 0.1, 0.075], [0, 0.6, 0.012, 0.105, 0.08], [0, 0.69, 0.006, 0.13, 0.08], [0, 0.76, -0.005, 0.12, 0.07], [0, 0.8, -0.01, 0.05, 0.045]], 12));
  for (const sx of [1, -1]) add(skin, ell(sx * 0.055, 0.705, 0.06, 0.06, 0.042, 0.035, 9, 5));
  add(skin, ell(0, 0.585, 0.06, 0.07, 0.065, 0.045, 9, 5));
  // a jewelled collar
  add(gilt, lathe([[0.085, 0.76], [0.1, 0.745], [0.098, 0.735], [0.083, 0.75]], 14, (th) => (Math.sin(th) > 0 ? 0.62 : 1)).translate(0, 0, 0.01));
  // the arms: the right raised, the elbow out, the fist clenched by the shoulder; the left down at the
  // side, gripping the staff planted before the foot
  const sh = (sx) => [sx * 0.135, 0.755, -0.005];
  add(skin, ell(...sh(1), 0.06, 0.055, 0.055, 9, 5)); add(skin, ell(...sh(-1), 0.06, 0.055, 0.055, 9, 5));
  add(skin, tube([[...sh(1), 0.048], [0.25, 0.7, 0.04, 0.042], [0.29, 0.66, 0.07, 0.036], [0.26, 0.8, 0.11, 0.032], [0.235, 0.88, 0.11, 0.028]], 9));
  add(skin, ell(0.232, 0.905, 0.11, 0.035, 0.038, 0.034, 8, 5));                       // the fist
  add(skin, tube([[...sh(-1), 0.048], [-0.21, 0.66, 0.03, 0.042], [-0.235, 0.6, 0.06, 0.036], [-0.2, 0.5, 0.13, 0.032], [-0.19, 0.45, 0.16, 0.027]], 9));
  add(skin, ell(-0.19, 0.43, 0.165, 0.032, 0.036, 0.032, 8, 5));                        // the hand on the staff
  for (const [ax, ay, az] of [[0.25, 0.81, 0.11], [-0.2, 0.505, 0.13]]) add(gilt, lathe([[0.034, -0.012], [0.036, 0], [0.034, 0.012]], 10).translate(ax, ay, az));   // the bracelets
  // the vajra staff: a shaft from the ground through the hand, a vajra's prongs at the head
  add(gilt, lathe([[0.012, 0], [0.012, 0.56]], 8).translate(-0.19, 0.0, 0.17));
  add(gilt, lathe([[0.001, 0.56], [0.025, 0.58], [0.018, 0.6], [0.03, 0.63], [0.034, 0.67], [0.02, 0.71], [0.001, 0.73]], 8).translate(-0.19, 0, 0.17));
  // the head: thrust a little forward, the brows knotted, the eyes bulging, the hair in a topknot tied with a band
  add(skin, ell(0, 0.865, 0.02, 0.055, 0.066, 0.058));
  add(skin, ell(0, 0.84, 0.065, 0.028, 0.022, 0.02, 8, 4));                                // the jaw
  for (const sx of [1, -1]) { add(skin, ell(sx * 0.022, 0.885, 0.07, 0.014, 0.012, 0.01, 6, 3)); add(scarf, ell(sx * 0.022, 0.9, 0.068, 0.02, 0.007, 0.01, 6, 3)); }
  add('hair_dark', ell(0, 0.9, 0.0, 0.058, 0.04, 0.058));
  add('hair_dark', ell(0, 0.95, -0.005, 0.03, 0.035, 0.03, 8, 5));
  add(gilt, lathe([[0.03, 0.93], [0.032, 0.94], [0.029, 0.95]], 10).translate(0, 0, -0.005));
  // the scarf: a hoop rising over the shoulders behind the head, its ends falling outside the arms to the rock
  {
    const pts = [];
    for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12, r = 0.2; pts.push([Math.cos(a) * r, 0.76 + Math.sin(a) * r * 1.05, -0.08, 0.025, 0.006]); }
    add(scarf, tube(pts, 6));
    add(scarf, tube([[0.2, 0.76, -0.08, 0.025, 0.006], [0.3, 0.6, -0.02, 0.028, 0.006], [0.33, 0.4, 0.0, 0.03, 0.006], [0.3, 0.2, -0.03, 0.032, 0.006], [0.27, 0.05, -0.02, 0.034, 0.006]], 6));
    add(scarf, tube([[-0.2, 0.76, -0.08, 0.025, 0.006], [-0.3, 0.6, -0.04, 0.028, 0.006], [-0.31, 0.4, -0.02, 0.03, 0.006], [-0.29, 0.2, -0.05, 0.032, 0.006], [-0.26, 0.05, -0.03, 0.034, 0.006]], 6));
  }
  const flip = s < 0;
  for (const [mat, g0] of parts) {
    const g = (g0.index ? g0.toNonIndexed() : g0).applyMatrix4(M);
    if (flip) { const p = g.attributes.position.array, n = g.attributes.normal?.array; for (let i = 0; i < p.length; i += 9) for (let j = 0; j < 3; j++) { const a = p[i + 3 + j]; p[i + 3 + j] = p[i + 6 + j]; p[i + 6 + j] = a; if (n) { const b = n[i + 3 + j]; n[i + 3 + j] = n[i + 6 + j]; n[i + 6 + j] = b; } } }
    bag.add(mat, g);
  }
}
void box;
