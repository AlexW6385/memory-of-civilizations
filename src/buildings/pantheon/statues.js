// The Pantheon's statues and the rosettes of its coffers (docs/buildings/pantheon.md §8a, §8b).
//
// god { at [x, z], y (the pedestal's foot), face (the direction the figure looks, [x, z]), h (the figure), base (the pedestal),
// god (a key of GODS), mat (the stone) }: a pedestal (plinth, die, cornice) and on it a draped figure of the god with the
// attributes by which he or she was known (spear and shield, trident, lyre, caduceus, scythe, bow ...), the helmet, the rays,
// the crescent, the winged hat, the veil. The figure is built 1.8 units high and scaled to h.
// coffer_rosettes { c, y, R, rings, n, step }: in the back of each of the 140 coffers a gilt rosette of twelve petals round
// a boss, facing the floor (conjectural, as the dossier's §8 has it; the dome's coffers "may have been originally covered
// in bronze sheets" — worldhistory.org).

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Matrix4, Vector3 } from '../../core/three.js';

const TAU = Math.PI * 2;

/** What each god holds and wears: R and L are the hands' work; head: helmet | rays | crescent | wings | veil | laurel | none. */
const GODS = {
  jupiter: { R: 'thunderbolt', L: 'sceptre', beard: 1, head: 'laurel', mat: 'marble' },
  mars: { R: 'spear', L: 'shield', head: 'helmet', cuirass: 1 },
  venus: { R: 'hair', L: 'drape', head: 'none', earrings: 1 },
  sol: { R: 'lyre', L: 'drape', head: 'rays' },
  luna: { R: 'bow', L: 'drape', head: 'crescent' },
  mercury: { R: 'caduceus', L: 'purse', head: 'wings' },
  saturn: { R: 'scythe', L: 'drape', head: 'veil', beard: 1 },
  minerva: { R: 'spear', L: 'shield', head: 'helmet', cuirass: 1, aegis: 1 },
  neptune: { R: 'trident', L: 'drape', beard: 1, head: 'laurel' },
  caesar: { R: 'scroll', L: 'drape', head: 'laurel', toga: 1 },
  augustus: { R: 'sceptre', L: 'scroll', head: 'laurel', cuirass: 1 },
  agrippa: { R: 'spear', L: 'drape', head: 'laurel', cuirass: 1 },
  hercules: { R: 'club', L: 'drape', beard: 1, head: 'laurel' },
  ceres: { R: 'ears', L: 'drape', head: 'veil' },
  juno: { R: 'sceptre', L: 'drape', head: 'veil' },
  vesta: { R: 'torch', L: 'drape', head: 'veil' },
};

/** The parts of one figure in its own frame: feet at y = 0, looking +z; [material | null (the stone), geometry]. */
function figure(key) {
  const G = GODS[key], P = [], add = (m, g) => P.push([m, g]);
  // the body: a draped column with the folds of the chiton running down it, broader across the shoulders than deep
  const body = lathe([[0.001, 0], [0.27, 0], [0.285, 0.06], [0.25, 0.5], [0.205, 0.95], [0.2, 1.1], [0.17, 1.22], [0.2, 1.38], [0.19, 1.5], [0.11, 1.57], [0.06, 1.6], [0.001, 1.6]], 24, (th, i) => (i > 0 && i < 6 ? 1 + 0.05 * Math.sin(th * 9) : 1));
  body.scale(1.12, 1, G.toga ? 0.95 : 0.78);
  add(null, body);
  // the head with its brow and hair, the beard
  add(null, lathe([[0.001, 1.56], [0.05, 1.58], [0.075, 1.64], [0.082, 1.7], [0.065, 1.77], [0.001, 1.8]], 14));
  const hair = lathe([[0.083, 1.69], [0.09, 1.74], [0.07, 1.8], [0.001, 1.81]], 14); hair.translate(0, 0, -0.012); add(null, hair);
  if (G.beard) { const b = lathe([[0.001, 1.52], [0.06, 1.58], [0.07, 1.66], [0.001, 1.68]], 10); b.translate(0, 0, 0.035); add(null, b); }
  // the cloak down the back (palla or paludamentum), over the left shoulder
  add(null, box(-0.3, 0.35, -0.23, 0.3, 1.48, -0.17));
  if (G.toga) add(null, box(-0.34, 0.5, 0.17, -0.1, 1.45, 0.24));                        // the toga's balteus across the chest
  const arm = (a, b, c, m = null) => { add(m, rod(a, b, 0.045, 8)); add(m, rod(b, c, 0.04, 8)); };
  // the right hand (+x) and what it holds
  const rs = [0.25, 1.44, 0.02];
  switch (G.R) {
    case 'spear': arm(rs, [0.38, 1.15, 0.12], [0.42, 1.05, 0.3]); add('bronze', rod([0.42, 0.0, 0.3], [0.42, 2.3, 0.3], 0.017, 6)); add('bronze', lathe([[0.001, 2.3], [0.045, 2.34], [0.001, 2.62]], 8).translate(0.42, 0, 0.3)); break;
    case 'trident': arm(rs, [0.38, 1.15, 0.12], [0.42, 1.05, 0.3]); add('bronze', rod([0.42, 0.0, 0.3], [0.42, 2.4, 0.3], 0.016, 6)); add('bronze', box(0.3, 2.3, 0.285, 0.54, 2.34, 0.315)); for (const x of [0.3, 0.42, 0.54]) add('bronze', lathe([[0.001, 2.34], [0.02, 2.36], [0.001, 2.62]], 6).translate(x, 0, 0.3)); break;
    case 'thunderbolt': arm(rs, [0.4, 1.25, 0.2], [0.42, 1.2, 0.42]); for (const s of [-1, 1]) { add('gilt_bronze', rod([0.42, 1.2, 0.42], [0.42 + s * 0.05, 1.2 + s * 0.12, 0.42 + s * 0.2], 0.02, 6)); add('gilt_bronze', rod([0.42, 1.2, 0.42], [0.42 - s * 0.05, 1.2 - s * 0.12, 0.42 - s * 0.2], 0.02, 6)); } add('gilt_bronze', lathe([[0.04, 1.14], [0.04, 1.26], [0.001, 1.26]], 8).translate(0.42, 0, 0.42)); break;
    case 'lyre': arm(rs, [0.4, 1.2, 0.18], [0.36, 1.2, 0.34]); for (const s of [-1, 1]) add('gilt_bronze', rod([0.36 + s * 0.12, 0.88, 0.34], [0.36 + s * 0.15, 1.42, 0.34], 0.014, 6)); add('gilt_bronze', box(0.2, 1.4, 0.325, 0.52, 1.44, 0.355)); add('gilt_bronze', lathe([[0.001, 0.0], [0.14, 0.03], [0.001, 0.07]], 12).scale(1, 1, 0.5).rotateX(Math.PI / 2).translate(0.36, 0.9, 0.34)); for (let k = -2; k <= 2; k++) add('bronze', rod([0.36 + k * 0.045, 0.93, 0.34], [0.36 + k * 0.05, 1.41, 0.34], 0.004, 4)); break;
    case 'bow': arm(rs, [0.42, 1.3, 0.12], [0.5, 1.4, 0.3]); for (let k = 0; k < 6; k++) { const a0 = -1 + k * 0.4, a1 = a0 + 0.4, P0 = [0.5 - 0.35 * Math.cos(a0) + 0.35, 1.4 + 0.62 * Math.sin(a0) - 0.0, 0.3 - 0.1 * Math.cos(a0)], P1 = [0.5 - 0.35 * Math.cos(a1) + 0.35, 1.4 + 0.62 * Math.sin(a1), 0.3 - 0.1 * Math.cos(a1)]; add('bronze', rod(P0, P1, 0.018, 6)); } add('bronze', rod([0.5, 0.78, 0.2], [0.5, 2.02, 0.2], 0.004, 4)); break;
    case 'caduceus': arm(rs, [0.38, 1.15, 0.12], [0.42, 1.05, 0.3]); add('bronze', rod([0.42, 0.0, 0.3], [0.42, 1.9, 0.3], 0.015, 6)); for (const s of [-1, 1]) { add('bronze', box(0.42 + s * 0.06 - 0.06 * (s > 0 ? 0 : 1) + (s > 0 ? 0 : 0), 1.84, 0.29, 0.42 + s * 0.06 + (s > 0 ? 0.12 : -0.0) - 0.06 * (s > 0 ? 0 : 1), 1.9, 0.31)); } add('bronze', lathe([[0.04, 1.5], [0.03, 1.62], [0.04, 1.74], [0.001, 1.76]], 8).translate(0.42, 0, 0.3)); break;
    case 'scythe': arm(rs, [0.38, 1.15, 0.12], [0.42, 1.05, 0.3]); add('bronze', rod([0.42, 0.0, 0.3], [0.42, 2.05, 0.3], 0.016, 6)); for (let k = 0; k < 4; k++) add('bronze', rod([0.42 + 0.1 * Math.sin(k * 0.5), 2.05 + k * 0.07, 0.3], [0.42 + 0.1 * Math.sin((k + 1) * 0.5) + 0.0, 2.05 + (k + 1) * 0.07, 0.3], 0.02, 5)); add('bronze', box(0.42, 2.05, 0.295, 0.8, 2.1, 0.305)); break;
    case 'club': arm(rs, [0.4, 1.15, 0.12], [0.44, 1.0, 0.3]); add('bronze', lathe([[0.001, 0], [0.03, 0.02], [0.05, 0.6], [0.09, 1.0], [0.1, 1.18], [0.001, 1.2]], 10).translate(0.44, 0.1, 0.3)); break;
    case 'sceptre': arm(rs, [0.4, 1.2, 0.1], [0.42, 1.1, 0.26]); add('gilt_bronze', rod([0.42, 0.0, 0.26], [0.42, 2.0, 0.26], 0.014, 6)); add('gilt_bronze', lathe([[0.001, 2.0], [0.035, 2.03], [0.03, 2.1], [0.001, 2.14]], 8).translate(0.42, 0, 0.26)); break;
    case 'torch': arm(rs, [0.4, 1.3, 0.12], [0.44, 1.4, 0.3]); add('bronze', rod([0.44, 1.2, 0.3], [0.44, 1.9, 0.3], 0.02, 6)); add('bronze', lathe([[0.001, 1.9], [0.05, 1.96], [0.04, 2.0], [0.001, 2.0]], 8).translate(0.44, 0, 0.3)); add('gilt_bronze', lathe([[0.001, 2.0], [0.03, 2.02], [0.001, 2.16]], 6).translate(0.44, 0, 0.3)); break;
    case 'ears': arm(rs, [0.38, 1.15, 0.12], [0.42, 1.05, 0.28]); for (let k = -2; k <= 2; k++) add('gilt_bronze', rod([0.42, 1.05, 0.28], [0.42 + k * 0.045, 1.4, 0.28 + Math.abs(k) * 0.01], 0.006, 4)); break;
    case 'scroll': arm(rs, [0.4, 1.2, 0.12], [0.36, 1.15, 0.3]); add(null, lathe([[0.04, -0.17], [0.04, 0.17], [0.001, 0.17]], 8).rotateZ(Math.PI / 2).translate(0.36, 1.15, 0.3)); break;
    case 'hair': arm(rs, [0.3, 1.65, 0.1], [0.12, 1.72, 0.1]); break;
    default: arm(rs, [0.34, 1.2, 0.04], [0.3, 0.95, 0.12]);
  }
  // the left hand (−x)
  const ls = [-0.25, 1.44, 0.02];
  switch (G.L) {
    case 'shield': arm(ls, [-0.4, 1.2, 0.1], [-0.45, 1.0, 0.2]); add('bronze', lathe([[0.001, 0], [0.38, 0], [0.38, 0.035], [0.001, 0.07]], 20).rotateX(Math.PI / 2).translate(-0.5, 0.95, 0.22)); add('gilt_bronze', lathe([[0.001, 0.07], [0.08, 0.075], [0.07, 0.11], [0.001, 0.13]], 10).rotateX(Math.PI / 2).translate(-0.5, 0.95, 0.22)); break;
    case 'sceptre': arm(ls, [-0.4, 1.2, 0.1], [-0.42, 1.1, 0.26]); add('gilt_bronze', rod([-0.42, 0.0, 0.26], [-0.42, 2.0, 0.26], 0.014, 6)); add('gilt_bronze', lathe([[0.001, 2.0], [0.035, 2.03], [0.03, 2.1], [0.001, 2.14]], 8).translate(-0.42, 0, 0.26)); break;
    case 'scroll': arm(ls, [-0.38, 1.2, 0.14], [-0.34, 1.15, 0.3]); add(null, lathe([[0.04, -0.17], [0.04, 0.17], [0.001, 0.17]], 8).rotateZ(Math.PI / 2).translate(-0.34, 1.15, 0.3)); break;
    case 'purse': arm(ls, [-0.38, 1.1, 0.1], [-0.34, 0.95, 0.2]); add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.07, 0.1], [0.03, 0.14], [0.001, 0.14]], 8).translate(-0.34, 0.82, 0.2)); break;
    default: arm(ls, [-0.36, 1.1, 0.12], [-0.3, 0.9, 0.2]);                                // the hand gathering the drape
  }
  if (G.cuirass) { add('gilt_bronze', lathe([[0.2, 1.1], [0.215, 1.22], [0.24, 1.38], [0.22, 1.47], [0.2, 1.48]], 20).scale(1.12, 1, 0.8)); add('gilt_bronze', lathe([[0.215, 0.98], [0.2, 1.0], [0.2, 1.1], [0.215, 1.1]], 20).scale(1.12, 1, 0.8)); }
  if (G.aegis) add('gilt_bronze', lathe([[0.22, 1.4], [0.18, 1.3], [0.16, 1.28], [0.22, 1.4]], 14).scale(1.12, 1, 0.8));
  if (G.earrings) for (const s of [-1, 1]) add('silver', lathe([[0.001, 0], [0.018, 0.02], [0.001, 0.04]], 6).translate(s * 0.085, 1.62, 0.03));
  // what is on the head
  switch (G.head) {
    case 'helmet': add('bronze', lathe([[0.1, 1.72], [0.1, 1.78], [0.075, 1.87], [0.001, 1.89]], 14)); add('gilt_bronze', box(-0.012, 1.87, -0.13, 0.012, 1.99, 0.09)); break;
    case 'rays': for (let k = 0; k < 9; k++) { const a = -Math.PI * 0.45 + k * Math.PI * 0.9 / 8; add('gilt_bronze', rod([Math.sin(a) * 0.1, 1.76 + Math.cos(a) * 0.1, 0.0], [Math.sin(a) * 0.28, 1.76 + Math.cos(a) * 0.28, -0.02], 0.012, 4)); } break;
    case 'crescent': for (let k = 0; k < 5; k++) { const a0 = -1.0 + k * 0.5, a1 = a0 + 0.5; add('gilt_bronze', rod([Math.sin(a0) * 0.13, 1.8 + Math.cos(a0) * 0.1, 0.02], [Math.sin(a1) * 0.13, 1.8 + Math.cos(a1) * 0.1, 0.02], 0.014, 5)); } break;
    case 'wings': add('bronze', lathe([[0.001, 1.77], [0.13, 1.77], [0.11, 1.8], [0.001, 1.83]], 12)); for (const s of [-1, 1]) add('gilt_bronze', box(s * 0.1 - 0.02, 1.76, -0.03, s * 0.1 + 0.02, 1.9, 0.03)); break;
    case 'veil': { const v = lathe([[0.1, 1.55], [0.1, 1.72], [0.09, 1.79], [0.001, 1.82]], 14); v.translate(0, 0, -0.01); add(null, v); add(null, box(-0.14, 0.9, -0.24, 0.14, 1.6, -0.2)); break; }
    case 'laurel': add('gilt_bronze', lathe([[0.088, 1.76], [0.097, 1.76], [0.097, 1.785], [0.088, 1.785]], 14)); break;
    default: break;
  }
  return P;
}

/** The pedestal under a figure: plinth, die in a coloured stone, cornice. */
function pedestal(bag, col, x, y, z, h, w, dieMat) {
  const d = w * 0.9;
  bag.add('marble', box(x - w / 2 - 0.1, y, z - d / 2 - 0.1, x + w / 2 + 0.1, y + 0.22, z + d / 2 + 0.1));
  bag.add(dieMat, box(x - w / 2, y + 0.22, z - d / 2, x + w / 2, y + h - 0.2, z + d / 2));
  bag.add('marble', box(x - w / 2 - 0.08, y + h - 0.2, z - d / 2 - 0.08, x + w / 2 + 0.08, y + h, z + d / 2 + 0.08));
  col.rect([x - w / 2 - 0.1, z - d / 2 - 0.1, x + w / 2 + 0.1, z + d / 2 + 0.1], y, y + h + 1.5);
}

export function god(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 3.6, base = el.base ?? 1.1, f = el.face ?? [0, 1];
  const rot = Math.atan2(f[0], f[1]), s = h / 1.8, mat = el.mat ?? GODS[el.god].mat ?? 'marble';
  pedestal(bag, col, x, y, z, base, el.w ?? 1.5, el.die ?? 'pavonazzetto');
  for (const [m, g] of figure(el.god)) { g.scale(s, s, s); g.rotateY(rot); g.translate(x, y + base, z); bag.add(m ?? mat, g); }
}

/** coffer_rosettes: see the header; the maths of the coffers is that of the dome's own builder (src/styles/roman/index.js). */
export function cofferRosettes(el, { bag }) {
  const [cx, cz] = el.c, y = el.y, R = el.R, n = el.n ?? 28, steps = 4, step = el.step ?? 0.11, dAz = TAU / n;
  const rBack = R + step * steps, out = [];
  const petal = (rho) => {
    const t = [], tri = (a, b, c) => { const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); void nx; void nz; if (ny >= 0) t.push(...a, ...b, ...c); else t.push(...a, ...c, ...b); };
    const P = (r, a, yy) => [Math.cos(a) * r, yy, Math.sin(a) * r];
    for (let i = 0; i < 12; i++) {
      const a = TAU * i / 12, dl = TAU / 12 * 0.42;
      tri(P(0.2 * rho, a, 0.02), P(0.55 * rho, a - dl, 0.03), P(0.55 * rho, a + dl, 0.03));
      tri(P(0.55 * rho, a - dl, 0.03), P(rho, a, 0.012), P(0.55 * rho, a + dl, 0.03));
    }
    const g = fromTriangles(t), ring = lathe([[rho * 0.2, 0], [rho * 0.2, 0.02], [0.001, 0.02]], 14), boss = lathe([[0.001, 0.02], [rho * 0.2, 0.02], [rho * 0.17, 0.055], [0.001, 0.075]], 12);
    return [g, ring, boss];
  };
  for (const [b0, b1] of el.rings) {
    const e0 = b0 * Math.PI / 180, e1 = b1 * Math.PI / 180, rib = (e1 - e0) * 0.16, ribAz = dAz * 0.16;
    const insetE = ((e1 - e0) - 2 * rib) / (2 * steps + 2.6), insetAz = (dAz - 2 * ribAz) / (2 * steps + 2.6);
    const E0 = e0 + rib * 1.4 + steps * insetE * 1.35, E1 = e1 - rib * 0.6 - steps * insetE * 0.65, em = (E0 + E1) / 2;
    const wM = (dAz - 2 * ribAz - 2 * steps * insetAz) * Math.cos(em) * rBack, hM = (E1 - E0) * rBack, rho = 0.42 * Math.min(wM, hM);
    const proto = petal(rho);
    for (let k = 0; k < n; k++) {
      const az = (k + 0.5) * dAz, u = new Vector3(Math.cos(az) * Math.cos(em), Math.sin(em), Math.sin(az) * Math.cos(em));
      const bY = u.clone().negate(), a = new Vector3(-Math.sin(az), 0, Math.cos(az)), c = new Vector3().crossVectors(a, bY);
      const m = new Matrix4().makeBasis(a, bY, c).setPosition(cx + u.x * (rBack - 0.004), y + u.y * (rBack - 0.004), cz + u.z * (rBack - 0.004));
      for (const g of proto) out.push(g.clone().applyMatrix4(m));
    }
  }
  for (const g of out) bag.add('gilt_bronze', g);
}
