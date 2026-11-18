// The enthroned statue of Confucius and the Four Correlates of the Dacheng Hall as sculpture (docs/settlements/lu-qufu.md §13): lofted volumes
// instead of the lathe mannequin — the torso with its collar and belt, the skirt of the robe falling in folds over the knees to the footstool, the
// wide sleeves with their hanging cuffs, hands holding the tablet (gui) before the chest, a head with brow, nose, lips, cheeks, ears, moustache and
// the long beard, and the twelve-tasselled flat crown (mianliu) with its strings of beads before and behind. The Correlates wear the cap and
// hold their tablets in the same pose in robes of other colours, their faces varied by a hash of their place. Built at the origin on the
// platform's top, facing +z, in metres at scale 1 (the Master about 2.75 m to the crown). level 'R' the whole figure; 'F' the layer drawn near over
// it (the beads on the strings, the fingers, the eyes' lids and the brows' hair, embroidered hems).
import { Parts } from '../qing/carving.js';
import { tube, curve, ell, cone, spline, h01 } from '../../settlements/qing-beijing/sculpt.js';

const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** An ellipsoid with its first axis along x, tipped about x by `a` (so that its third axis leans forward when a < 0). */
const tip = (c, r, a = 0, n = 9, m = 5) => ell(c, r, [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]], n, m);
const fold = (th, k, a, ph = 0) => 1 + a * Math.sin(k * th + ph);

export function sage(P, o = {}) {
  const robe = o.robe ?? 'clay_gilt', trim = o.trim ?? 'clay_gilt', fine = o.level === 'F', R = o.level !== 'F', k = o.seed ?? 0;
  const H = (i) => h01(k * 1.7 + i * 0.913, k * 0.31 + i * 0.37);
  const add = (m, g) => P.add(m, g);
  if (R) {
    // the throne's cushion and the footstool
    add('lacquer_red', ell([0, 0.3, 0.02], [0.8, 0.3, 0.72], AX, 12, 6));
    add('lacquer_red', ell([0, 0.07, 1.16], [0.5, 0.075, 0.26], AX, 10, 5));
    // the lap and thighs
    add(robe, ell([0, 0.66, 0.12], [0.6, 0.2, 0.45], AX, 12, 6));
    for (const s of [-1, 1]) {
      add(robe, curve([[s * 0.3, 0.7, 0.0], [s * 0.34, 0.76, 0.5], [s * 0.36, 0.76, 1.0]], 0.25, 0.2, { n: 10, per: 3, swell: 0.1 }));
      add(robe, ell([s * 0.36, 0.78, 1.0], [0.19, 0.17, 0.17], AX, 8, 5));                           // the knee
    }
    // the skirt of the robe: a sheet falling from the knees over the shins to the footstool, in folds that spread as it falls
    const sk = spline([[0, 0.8, 0.96], [0, 0.5, 1.12], [0, 0.18, 1.2]], 4);
    add(robe, tube(sk, (t, th) => [Math.cos(th) * (0.78 + 0.22 * t) * fold(th, 9, 0.1 + 0.07 * t, H(1) * 6), Math.sin(th) * (0.11 + 0.03 * t) * fold(th, 5, 0.3, 1)], 24, { up: [0, 0, 1], capA: true, capB: true, capLen: 0.2 }));
    for (const s of [-1, 1]) {
      add('skin_light', ell([s * 0.33, 0.1, 1.28], [0.12, 0.06, 0.2], AX, 8, 4));                // the toes of the shoes under the hem
      add('lacquer_black', ell([s * 0.33, 0.1, 1.33], [0.13, 0.07, 0.18], AX, 8, 4));
    }
    // the torso: waist to shoulders, deeper at the chest, with the folds of the cloth
    const torso = spline([[0, 0.62, 0.04], [0, 1.1, 0.04], [0, 1.55, 0.0], [0, 1.95, -0.02]], 4);
    add(robe, tube(torso, (t, th) => [Math.cos(th) * (0.46 + 0.18 * Math.sin(t * 2.2) + 0.04 * t) * fold(th, 6, 0.025, 0.4), Math.sin(th) * (0.3 + 0.07 * Math.sin(t * 2.6) - 0.05 * t)], 16, { up: [0, 0, 1], capA: false, capB: true, capLen: 0.3 }));
    // the crossed collar (right over left): a gilt band from the throat down to the belt, and the belt itself
    add(trim, curve([[-0.16, 1.98, 0.2], [-0.1, 1.7, 0.31], [0.06, 1.3, 0.345], [0.24, 0.85, 0.34]], 0.04, 0.04, { n: 6, per: 3, flat: 0.7, up: [0, 0, 1] }));
    add(trim, curve([[0.16, 1.98, 0.2], [0.08, 1.75, 0.3], [-0.02, 1.5, 0.33], [-0.1, 1.2, 0.35]], 0.035, 0.035, { n: 6, per: 3, flat: 0.7, up: [0, 0, 1] }));
    const belt = []; for (let q = 0; q <= 16; q++) { const a = -Math.PI * 0.95 + q / 16 * Math.PI * 1.9; belt.push([Math.sin(a) * 0.5, 0.82, Math.cos(a) * 0.34]); }
    add(trim, tube(belt, () => 0.04, 6, { capA: true, capB: true, capLen: 0.3 }));
    // the shoulders, the neck
    for (const s of [-1, 1]) add(robe, ell([s * 0.6, 1.88, -0.02], [0.2, 0.15, 0.22], AX, 9, 5));
    add('skin_light', curve([[0, 1.95, 0.02], [0, 2.1, 0.03]], 0.11, 0.1, { n: 8, per: 1 }));
    // the sleeves: shoulder, elbow out to the side, forearm in to the hands before the chest; the wide cuff hangs down from the elbow
    for (const s of [-1, 1]) {
      const pts = spline([[s * 0.62, 1.82, 0.0], [s * 0.86, 1.4, 0.14], [s * 0.6, 1.3, 0.5], [s * 0.2, 1.27, 0.72]], 4);
      add(robe, tube(pts, (t, th) => { const r = 0.12 + 0.09 * Math.sin(t * 3.0) + 0.06 * t; return [Math.cos(th) * r * fold(th, 5, 0.09, s + H(3) * 3), Math.sin(th) * r * 0.9]; }, 12, { up: [0, 1, 0], capA: false, capB: true, capLen: 0.4 }));
      const cuff = spline([[s * 0.72, 1.28, 0.3], [s * 0.82, 0.95, 0.42], [s * 0.78, 0.68, 0.5], [s * 0.7, 0.52, 0.52]], 4);
      add(robe, tube(cuff, (t, th) => [Math.cos(th) * (0.15 - 0.04 * t) * fold(th, 6, 0.16, t * 3), Math.sin(th) * 0.1 * (1 + 0.5 * t)], 12, { up: [0, 0, 1], capA: true, capB: true, capLen: 0.3 }));
      add('skin_light', ell([s * 0.15, 1.27, 0.76], [0.06, 0.05, 0.09], AX, 8, 4));                // the hands
    }
    // the tablet (gui) held upright before the chest
    add('marble_smooth', ell([0, 1.3, 0.8], [0.09, 0.5, 0.022], AX.map((v, i) => (i === 0 ? [1, 0, 0] : i === 1 ? [0, 1, 0] : v)), 8, 6));
    add('marble_smooth', cone([0, 1.78, 0.8], [0, 1.9, 0.8], 0.05, 6));
    // the head: skull, brow, eyes, nose, cheeks, mouth, ears, moustache, beard
    const hy = 2.36;
    add('skin_light', ell([0, hy, 0.02], [0.2, 0.26, 0.22], AX, 12, 7));
    add('skin_light', ell([0, hy - 0.1, 0.1], [0.17, 0.17, 0.14], AX, 10, 6));                         // the jaw
    add('skin_light', tip([0, hy + 0.06, 0.2], [0.17, 0.035, 0.055], 0.0));                             // the brow's ridge
    add('skin_light', ell([0, hy - 0.17, 0.2], [0.07, 0.05, 0.06], AX, 8, 4));                          // the chin
    for (const s of [-1, 1]) {
      add('skin_light', ell([s * 0.085, hy + 0.01, 0.2], [0.045, 0.02, 0.025], AX, 8, 4));              // the closed lids
      add('skin_light', ell([s * 0.115, hy - 0.08, 0.17], [0.075, 0.07, 0.055], AX, 8, 4));             // the cheek
      add('skin_light', ell([s * 0.2, hy - 0.03, 0.0], [0.03, 0.08, 0.05], AX, 7, 4));                  // the ear
      add('skin_light', ell([s * 0.035, hy - 0.1, 0.26], [0.028, 0.024, 0.03], AX, 6, 3));              // the nostril's wing
      add('lacquer_black', curve([[s * 0.04, hy - 0.115, 0.255], [s * 0.1, hy - 0.15, 0.245], [s * 0.19, hy - 0.2, 0.2], [s * 0.2, hy - 0.3, 0.17]], 0.03, 0.015, { n: 5, per: 3 }));   // the moustache's tails
    }
    add('skin_light', curve([[0, hy + 0.02, 0.215], [0, hy - 0.07, 0.255]], 0.03, 0.036, { n: 6, per: 1 }));       // the nose's bridge
    add('skin_light', ell([0, hy - 0.1, 0.275], [0.04, 0.035, 0.035], AX, 7, 4));                       // the tip
    add('clay_robe', curve([[-0.045, hy - 0.17, 0.235], [0, hy - 0.16, 0.255], [0.045, hy - 0.17, 0.235]], 0.017, 0.017, { n: 5, per: 2 }));   // the lips
    add('lacquer_black', curve([[-0.1, hy + 0.08, 0.205], [0, hy + 0.1, 0.225], [0.1, hy + 0.08, 0.205]], 0.016, 0.016, { n: 5, per: 2, flat: 0.6 }));   // the brows
    const bd = spline([[0, hy - 0.2, 0.2], [0, hy - 0.42, 0.3], [0, hy - 0.78, 0.36]], 4);
    add('lacquer_black', tube(bd, (t, th) => [Math.cos(th) * (0.12 - 0.08 * t) * fold(th, 4, 0.18, 1), Math.sin(th) * 0.05], 10, { up: [0, 0, 1], capA: true, capB: true, capLen: 0.5 }));      // the beard
    for (const s of [-1, 1]) add('lacquer_black', curve([[s * 0.15, hy - 0.12, 0.14], [s * 0.14, hy - 0.24, 0.2], [s * 0.1, hy - 0.34, 0.27]], 0.035, 0.012, { n: 5, per: 3, flat: 0.6, up: [0, 0, 1] }));   // the whiskers
    // the head-dress
    if (o.crown !== 'cap') {
      add('lacquer_black', ell([0, hy + 0.2, 0.02], [0.22, 0.1, 0.22], AX, 10, 5));                      // the cap under the board
      add('lacquer_black', tip([0, hy + 0.3, 0.06], [0.32, 0.022, 0.5], -0.08, 10, 4));                  // the board (mian), a little lower at the front
      add(trim, tip([0, hy + 0.288, 0.06], [0.325, 0.014, 0.505], -0.08, 10, 4));                         // its gilt under-face
      for (let q = 0; q < 12; q++) {                                                                       // the twelve strings before and behind
        const x = -0.28 + q * 0.0509, zf = 0.49, zb = -0.4;
        for (const [z, len] of [[zf + 0.045, 0.27], [zb, 0.22]]) {
          add(trim, cone([x, hy + 0.27 - 0.052, z], [x, hy + 0.27 - len, z], 0.007, 3));
          add('marble_smooth', ell([x, hy + 0.27 - len, z], [0.017, 0.017, 0.017], AX, 6, 3));
        }
      }
    } else {
      add('lacquer_black', ell([0, hy + 0.2, 0.0], [0.23, 0.14, 0.24], AX, 10, 6));
      add('lacquer_black', curve([[0, hy + 0.3, -0.1], [0, hy + 0.36, -0.3], [0, hy + 0.28, -0.46]], 0.1, 0.05, { n: 6, per: 3, flat: 0.3, up: [1, 0, 0] }));      // the wings of the cap
      add(trim, ell([0, hy + 0.2, 0.2], [0.1, 0.03, 0.05], AX, 8, 4));                                  // the front plaque
    }
  }
  if (fine) {
    const hy = 2.36;
    // the beads on the strings, the fingers on the tablet, the lids' lashes, the hem's embroidered band
    if (o.crown !== 'cap') for (let q = 0; q < 12; q++) {
      const x = -0.28 + q * 0.0509;
      for (let b = 1; b <= 4; b++) add('marble_smooth', ell([x, hy + 0.27 - 0.052 - b * 0.05, 0.555], [0.014, 0.014, 0.014], AX, 6, 3));
    }
    for (const s of [-1, 1]) {
      for (let q = 0; q < 4; q++) add('skin_light', curve([[s * (0.12 - q * 0.0), 1.3 + q * 0.04, 0.8], [s * 0.04, 1.31 + q * 0.04, 0.83]], 0.014, 0.011, { n: 5, per: 1 }));
      add('lacquer_black', curve([[s * 0.06, hy + 0.025, 0.215], [s * 0.085, hy + 0.03, 0.225], [s * 0.11, hy + 0.02, 0.215]], 0.008, 0.005, { n: 4, per: 2 }));
    }
    for (let q = 0; q < 16; q++) { const x = -0.82 + q * 0.109; add(trim, ell([x, 0.28, 1.265], [0.04, 0.045, 0.018], AX, 6, 3)); }
  }
  void tube;
}

/** The statue of Confucius (level 'R' or 'F') in a Parts at the origin. */
export function confucius(level = 'R') { const P = new Parts(); sage(P, { robe: 'clay_gilt', trim: 'clay_gilt', crown: 'mian', seed: 7, level }); return P; }
/** A Correlate: robe and seed given. */
export function correlate(robe, seed, level = 'R') { const P = new Parts(); sage(P, { robe, trim: 'clay_gilt', crown: 'cap', seed, level }); return P; }
