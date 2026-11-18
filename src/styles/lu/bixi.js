// The tortoise-borne stele (bixi) of the stele pavilions as sculpture (docs/settlements/lu-qufu.md §13): the dragon-headed tortoise with its domed shell
// laid with hexagonal scutes, four splayed flippers with claws, the head with brow, horns, eyes, open jaws, teeth and beard on a long neck, the short tail,
// on a stone slab; the stele on its back with the crown of two dragons facing each other over the tablet, in relief (the Beijing kit, read-only).
// Built at the origin facing +z, the slab's floor at y = 0, in metres at scale 1 (shell about 3 m long). 'R' the whole; 'F' the layer drawn near over it
// (the scutes' rims, the claws' nails, the shell's edge studs, the finer teeth).
import { box } from '../../core/geom.js';
import { Parts, sumeru } from '../qing/carving.js';
import { curve, ell, cone, ring, spline, h01 } from '../../settlements/qing-beijing/sculpt.js';
import { dragonRelief } from '../../settlements/qing-beijing/dragonrelief.js';

const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const M = 'granite_grey';
/** The orthonormal axes [x, normal, z] of a surface point whose normal is n (the plate lies across it). */
function axes(n) { const l = Math.hypot(...n), u = [n[0] / l, n[1] / l, n[2] / l]; let a = [u[2], 0, -u[0]]; const la = Math.hypot(...a) || 1; a = [a[0] / la, 0, a[2] / la]; const b = [u[1] * a[2] - u[2] * a[1], u[2] * a[0] - u[0] * a[2], u[0] * a[1] - u[1] * a[0]]; return [a, u, b]; }

export function bixi(P, level = 'R', seed = 0) {
  const R = level === 'R', y0 = 0.3, cy = y0 + 0.36, rx = 0.95, ry = 0.42, rz = 1.3, add = (m, g) => P.add(m, g);
  const top = (x, z) => cy + ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2 - (z / rz) ** 2));
  if (R) {
    sumeru(P, 'granite_block', -1.25, -1.7, 1.25, 1.7, y0);
    add(M, ell([0, cy, 0], [rx, ry, rz], AX, 18, 8));                                                              // the carapace
    add(M, ell([0, y0 + 0.1, 0], [rx * 1.04, 0.13, rz * 1.04], AX, 18, 4));                                        // the plastron's rim
    // the scutes: a middle row of five hexagons, a row of four each side, laid on the dome
    const sc = [[0, 0.95], [0, 0.48], [0, 0], [0, -0.48], [0, -0.95], ...[-1, 1].flatMap((s) => [[s * 0.52, 0.72], [s * 0.52, 0.24], [s * 0.52, -0.24], [s * 0.52, -0.72]])];
    for (const [x, z] of sc) {
      const y = top(x, z), e = 0.01, nx = x / rx ** 2, nz = z / rz ** 2, ny = (y - cy) / ry ** 2 || 1e-3, ax = axes([nx, ny, nz]);
      add(M, ell([x, y + 0.012, z], [0.23, 0.03 + e, 0.23], ax, 6, 3));
    }
    // the four flippers: a thigh out of the shell, the splayed paw with five claws
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const bx = sx * 0.85, bz = sz * 0.82, fx = sx * 1.18, fz = sz * (sz > 0 ? 1.12 : 0.98);
      add(M, curve([[bx, y0 + 0.4, bz], [sx * 1.05, y0 + 0.25, sz * 0.92], [fx, y0 + 0.1, fz]], 0.2, 0.15, { n: 8, per: 3, swell: 0.1 }));
      add(M, ell([fx, y0 + 0.06, fz + sz * 0.05], [0.2, 0.07, 0.22], AX, 8, 4));
      for (let k = -2; k <= 2; k++) add(M, cone([fx + k * 0.065, y0 + 0.07, fz + sz * 0.22], [fx + k * 0.075 + sx * 0.02, y0 + 0.03, fz + sz * 0.38], 0.032, 5));
    }
    // the neck and the dragon's head, raised and turned a little, facing +z
    const neck = spline([[0, y0 + 0.5, 1.1], [0, y0 + 0.62, 1.5], [0, y0 + 0.82, 1.82], [0, y0 + 0.98, 1.98]], 4);
    add(M, curve(neck, 0.27, 0.2, { n: 10, per: 1, swell: 0.1 }));
    for (let q = 0; q < 6; q++) add(M, ring([0, y0 + 0.58 + q * 0.065, 1.42 + q * 0.1], 0.23 - q * 0.005, 0.02, [0, 0.3, 1], 14, 4));    // the neck's scale-bands
    const hc = [0, y0 + 1.05, 2.12];
    add(M, ell(hc, [0.27, 0.22, 0.3], AX, 12, 7));                                                                 // the skull
    add(M, ell([0, hc[1] - 0.07, hc[2] + 0.32], [0.2, 0.1, 0.3], AX, 10, 6));                                       // the snout
    add(M, ell([0, hc[1] - 0.2, hc[2] + 0.28], [0.17, 0.05, 0.27], AX, 9, 5));                                      // the lower jaw
    add(M, ell([0, hc[1] - 0.04, hc[2] + 0.6], [0.1, 0.07, 0.1], AX, 8, 5));                                        // the nose
    for (const s of [-1, 1]) {
      add(M, ell([s * 0.15, hc[1] + 0.1, hc[2] + 0.12], [0.1, 0.045, 0.1], AX, 8, 4));                            // the brow
      add(M, ell([s * 0.16, hc[1] + 0.05, hc[2] + 0.14], [0.045, 0.045, 0.045], AX, 7, 4));                       // the eye
      add(M, cone([s * 0.1, hc[1] + 0.2, hc[2] - 0.02], [s * 0.2, hc[1] + 0.52, hc[2] - 0.3], 0.05, 6, [0, 0.05, -0.1]));   // the horn
      add(M, ell([s * 0.06, hc[1] - 0.03, hc[2] + 0.66], [0.02, 0.02, 0.02], AX, 5, 3));                         // the nostril
      add(M, curve([[s * 0.1, hc[1] - 0.27, hc[2] + 0.3], [s * 0.2, hc[1] - 0.45, hc[2] + 0.18], [s * 0.18, hc[1] - 0.62, hc[2] + 0.08]], 0.03, 0.008, { n: 4, per: 3 }));   // the whiskers
      for (let q = 0; q < 3; q++) { add(M, cone([s * 0.1, hc[1] - 0.17, hc[2] + 0.4 + q * 0.07], [s * 0.1, hc[1] - 0.27, hc[2] + 0.4 + q * 0.07], 0.016, 4)); }
    }
    add(M, curve([[0, hc[1] - 0.26, hc[2] + 0.1], [0, hc[1] - 0.5, hc[2] + 0.12], [0, hc[1] - 0.66, hc[2] + 0.04]], 0.04, 0.01, { n: 4, per: 3 }));   // the beard
    add(M, curve([[0, y0 + 0.35, -1.2], [0, y0 + 0.2, -1.55], [0.18, y0 + 0.12, -1.85]], 0.14, 0.03, { n: 7, per: 3 }));      // the tail
    // the stele on the shell's back: the slab, and over it the crown with two dragons in relief
    const st = y0 + 0.78 + 0.0;
    add('marble', box(-0.85, st - 0.08, -0.22, 0.85, st + 3.2, 0.22));
    add('marble', box(-0.82, st + 3.2, -0.2, 0.82, st + 3.9, 0.2));
    for (const [side, z, dirs] of [[1, 0.2, 1], [-1, -0.2, -1]]) {
      const mk = (sx) => { const p = spline([[sx * 0.09, 0.45], [sx * 0.3, 0.55], [sx * 0.58, 0.42], [sx * 0.62, 0.2], [sx * 0.42, 0.1], [sx * 0.72, 0.03]], 4); return p; };
      for (const sx of [-1, 1]) {
        const D = dragonRelief(mk(sx).map(([x, y]) => [x, y]), 0.075, 0.04, { flip: sx, lite: true, step: 0.08, pearlAt: null, seed });
        for (const g of D.out) { g.rotateY(dirs === 1 ? 0 : Math.PI); g.translate(0, st + 3.2, z + 0.0); add(M, g); }
      }
      void side;
    }
    add('granite_grey', box(-0.5, st + 3.2, 0.2, 0.5, st + 3.85, 0.215));                                    // the plaque panel over the crown's middle
  } else {
    for (let q = 0; q < 22; q++) { const a = q / 22 * Math.PI * 2; add(M, ell([Math.cos(a) * rx * 1.03, y0 + 0.2, Math.sin(a) * rz * 1.03], [0.035, 0.035, 0.035], AX, 6, 3)); }
  }
  void h01;
}
export function biXiParts(level, seed) { const P = new Parts(); bixi(P, level, seed); return P; }
