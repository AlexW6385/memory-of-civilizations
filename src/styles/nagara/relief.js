// The procession of the basement (docs/settlements/khajuraho.md §17), carved as continuous relief: "dancers, devotees,
// acrobats, musicians, warriors, hunters, horses, elephants" on the recessed band of the plinth and the platform
// (mahavidya.ca). Each group is a modelled surface of rounded solids standing out of a dark ground by two to seven
// centimetres — an elephant with its mahout and rider, a horse and rider, a warrior with shield and sword, a drummer, a
// dancer, a flute-player, a lute-player, a porter with his yoke — in profile along the band, the groups close together
// so that the band reads as one carved strip; a ridge of rocks and tufts runs under their feet. Local frame: u along the
// band, v up (the group 1.0 tall), d out of the ground. Triangles behind the ground are dropped (Form).

import { Form } from './form.js';
import { figure } from './figures.js';

/** The width (in units of the band's height) each kind needs along the band. */
export const RELIEF_W = [1.75, 1.45, 0.55, 0.62, 0.68, 0.62, 0.58, 0.7];
export const RELIEF_KINDS = RELIEF_W.length;

/** One group (kind 0 elephant … 7 lute-player), centred on u = 0, facing +u when dir = 1 (the band's own direction), −1 reversed. */
export function reliefGroup(F0, kind, dir, rnd, lv = 2) {
  const hi = lv >= 2, sd = hi ? 8 : 6;
  const mp = (p) => [p[0] * dir, p[1], p[2], ...p.slice(3)];
  const F = {
    tube: (path, o = {}) => F0.tube(path.map(mp), { sides: sd, sub: 1, capRings: [Math.PI / 2], ...o, dref: o.dref && mp(o.dref) }),
    ell: (c, r, o = {}) => F0.ell(mp(c), r, { sides: sd, rings: hi ? 5 : 4, ...o, axis: o.axis && mp(o.axis) }),
  };
  const T = (pts, o) => F.tube(pts.map(([u, v, d, a, b]) => [u, v, d, a, b ?? a]), o);
  const man = (u, v0, sc, o = {}) => {                                  // a seated or riding man: torso, head with its turban, an arm
    F.ell([u, v0 + 0.13 * sc, 0.045], [0.052 * sc, 0.12 * sc, 0.04], { axis: [o.lean ?? 0, 1, 0] });
    F.ell([u + (o.lean ?? 0) * 0.1, v0 + 0.285 * sc, 0.05], [0.04 * sc, 0.048 * sc, 0.04]);
    F.ell([u + (o.lean ?? 0) * 0.1, v0 + 0.34 * sc, 0.048], [0.046 * sc, 0.03 * sc, 0.042]);
    if (o.arm) T([[u, v0 + 0.2 * sc, 0.05, 0.016 * sc], [u + o.arm[0] * 0.5, v0 + 0.2 * sc + o.arm[1] * 0.5, 0.07, 0.013 * sc], [u + o.arm[0], v0 + 0.2 * sc + o.arm[1], 0.075, 0.011 * sc]]);
  };
  const person = (arms) => {                                             // a standing man, simply: for the reduced level
    leg(0.04, 0.42, 0.03, 0.4, 0.04); leg(-0.04, 0.42, -0.03, 0.4, 0.04);
    F.ell([0, 0.34, 0.03], [0.09, 0.07, 0.04]); F.ell([0, 0.58, 0.03], [0.07, 0.17, 0.042]); F.ell([0.0, 0.84, 0.035], [0.043, 0.055, 0.04]); F.ell([0.0, 0.9, 0.035], [0.047, 0.032, 0.043]);
    arms();
  };
  const leg = (u, v, du, h, r) => T([[u, v, 0.03, r], [u + du * 0.5, v - h * 0.5, 0.034, r * 0.8], [u + du * 0.3, v - h * 0.55, 0.036, r * 0.62], [u + du, 0.03, 0.034, r * 0.9]]);
  switch (kind) {
    case 0: {                                                           // the elephant, in profile, its mahout at the neck and a rider behind
      F.ell([0, 0.52, 0.0], [0.56, 0.23, 0.075], { sides: sd + 2, rings: 6 });
      F.ell([0.6, 0.63, 0.0], [0.2, 0.2, 0.065], { axis: [0.3, 1, 0] });
      F.ell([0.5, 0.78, 0.0], [0.09, 0.07, 0.04]);                      // the forehead's bulge
      T([[0.74, 0.7, 0.03, 0.062], [0.84, 0.55, 0.04, 0.055], [0.85, 0.38, 0.045, 0.045], [0.78, 0.25, 0.05, 0.034], [0.72, 0.22, 0.05, 0.022]], { sub: 2, sides: hi ? 7 : 5 });
      F.ell([0.48, 0.66, 0.045], [0.085, 0.15, 0.028], { axis: [0.1, 1, 0] });   // the ear
      T([[0.78, 0.56, 0.03, 0.017], [0.92, 0.5, 0.04, 0.012], [0.97, 0.52, 0.04, 0.005]], { sides: 5 });  // the tusk
      for (const [u, du] of [[0.42, 0.02], [0.27, -0.04], [-0.3, 0.03], [-0.46, -0.03]]) leg(u, 0.4, du, 0.37, 0.075);
      for (const u of [0.42, 0.27, -0.3, -0.46]) F.ell([u + 0.0, 0.035, 0.036], [0.065, 0.032, 0.05], { axis: [0, 1, 0], sides: 6, rings: 3 });
      T([[-0.55, 0.6, 0.01, 0.022], [-0.62, 0.45, 0.02, 0.016], [-0.6, 0.28, 0.02, 0.01]], { sides: 5 });
      F.ell([0.02, 0.76, 0.0], [0.36, 0.06, 0.06]);                     // the saddle-cloth
      if (hi) for (const u of [-0.3, -0.15, 0, 0.15, 0.3]) F.ell([u, 0.7, 0.05], [0.017, 0.045, 0.012], { sides: 5, rings: 3 });  // its tassels
      man(0.45, 0.76, 0.85, { arm: [0.1, -0.06] });
      man(-0.1, 0.78, 1.0, { arm: [0.14, 0.1], lean: 0.1 });
      T([[-0.1 + 0.14, 0.9, 0.075, 0.006], [-0.1 + 0.2, 1.15, 0.075, 0.005]], { sides: 4 });   // his spear
      break;
    }
    case 1: {                                                           // a horse and its rider
      F.ell([0, 0.46, 0.0], [0.4, 0.16, 0.06], { sides: sd + 2 });
      F.ell([0.34, 0.5, 0.0], [0.12, 0.14, 0.055], { axis: [0.4, 1, 0] });
      T([[0.3, 0.52, 0.02, 0.085], [0.4, 0.68, 0.03, 0.07], [0.46, 0.8, 0.03, 0.055]], { sub: 2 });
      F.ell([0.55, 0.84, 0.02], [0.055, 0.14, 0.045], { axis: [1, -0.5, 0] });
      for (const [u, du, ph] of [[0.3, 0.06, 1], [0.24, -0.03, 0], [-0.3, 0.05, 1], [-0.36, -0.04, 0]]) T([[u, 0.4, 0.02, 0.045], [u + du * 0.5, 0.22 + ph * 0.05, 0.03, 0.03], [u + du, 0.04 + ph * 0.1, 0.03, 0.026], [u + du * 1.2, 0.03 + ph * 0.1, 0.035, 0.03]], { sides: 6 });
      T([[-0.38, 0.52, 0.01, 0.025], [-0.5, 0.42, 0.02, 0.02], [-0.52, 0.22, 0.02, 0.012]], { sides: 5 });
      man(0.02, 0.55, 0.95, { arm: [0.14, -0.04] });
      break;
    }
    case 2: {                                                           // a warrior with a round shield and a sword
      leg(0.04, 0.42, 0.03, 0.4, 0.04); leg(-0.04, 0.42, -0.03, 0.4, 0.04);
      F.ell([0, 0.34, 0.03], [0.1, 0.06, 0.04], { sides: sd });         // the dhoti
      F.ell([0, 0.58, 0.03], [0.075, 0.17, 0.045]);
      F.ell([0.0, 0.83, 0.035], [0.043, 0.055, 0.04]);
      F.ell([0.0, 0.89, 0.035], [0.05, 0.035, 0.045]);
      T([[0.07, 0.68, 0.04, 0.02], [0.13, 0.55, 0.08, 0.016], [0.16, 0.46, 0.09, 0.013]]);
      T([[0.16, 0.38, 0.09, 0.007], [0.2, 0.72, 0.09, 0.006]], { sides: 4 });
      F.ell([-0.15, 0.56, 0.05], [0.11, 0.2, 0.034], { sides: sd, rings: 5 });
      break;
    }
    case 3: if (hi) figure(F0, 5, 1, dir, rnd); else person(() => { T([[0.07, 0.7, 0.04, 0.018], [0.14, 0.82, 0.06, 0.014], [0.2, 0.96, 0.07, 0.01]]); T([[-0.07, 0.7, 0.04, 0.018], [-0.15, 0.62, 0.06, 0.014], [-0.2, 0.55, 0.07, 0.01]]); }); break;
    case 4: if (hi) figure(F0, 10, 1, dir, rnd); else person(() => { F.ell([0, 0.5, 0.08], [0.04, 0.1, 0.04], { axis: [1, 0, 0] }); T([[0.06, 0.68, 0.05, 0.016], [0.1, 0.56, 0.09, 0.013]]); }); break;
    case 5: {                                                           // a porter, a pole across his shoulder with a basket at each end
      leg(0.04, 0.42, 0.03, 0.4, 0.04); leg(-0.04, 0.42, -0.04, 0.4, 0.04);
      F.ell([0, 0.34, 0.03], [0.09, 0.07, 0.04], { sides: sd });
      F.ell([0, 0.58, 0.03], [0.07, 0.17, 0.042], { axis: [-0.1, 1, 0] });
      F.ell([-0.01, 0.83, 0.035], [0.042, 0.054, 0.04]);
      T([[-0.3, 0.85, 0.05, 0.008], [0.3, 0.8, 0.05, 0.008]], { sides: 4 });
      for (const [u, v] of [[-0.28, 0.66], [0.28, 0.61]]) { F.ell([u, v, 0.05], [0.1, 0.1, 0.045], { sides: sd, rings: 5 }); T([[u * 1.0, v + 0.1, 0.05, 0.004], [u, 0.84, 0.05, 0.004]], { sides: 4 }); }
      T([[0.05, 0.72, 0.045, 0.016], [0.1, 0.8, 0.06, 0.013]]);
      break;
    }
    case 6: if (hi) figure(F0, 4, 1, dir, rnd); else person(() => { T([[0.0, 0.8, 0.08, 0.006], [0.24, 0.76, 0.1, 0.005]], { sides: 4 }); T([[0.06, 0.7, 0.05, 0.016], [0.12, 0.78, 0.09, 0.012]]); }); break;
    default: if (hi) figure(F0, 9, 1, dir, rnd); else person(() => { T([[-0.12, 0.42, 0.09, 0.007], [0.16, 0.88, 0.09, 0.006]], { sides: 4 }); F.ell([-0.12, 0.45, 0.09], [0.05, 0.06, 0.04]); }); break;
  }
}
/** The ground the group stands on: a low ridge of earth and little rocks along the band's foot, from u0 to u1 (local units of the band). */
export function reliefGround(F, u0, u1, v, rnd) {
  const n = Math.max(2, Math.round((u1 - u0) / 0.25)), path = [];
  for (let k = 0; k <= n; k++) { const u = u0 + (u1 - u0) * k / n; path.push([u, v, 0.0, 0.03 + 0.012 * Math.sin(k * 1.7) + 0.01 * (rnd() - 0.5), 0.034 + 0.016 * Math.sin(k * 2.3 + 1)]); }
  F.tube(path, { sides: 6, sub: 1, capRings: [Math.PI / 2], dref: [0, 0, 1] });
}

export { Form };
