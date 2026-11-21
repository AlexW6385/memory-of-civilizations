// The magpie goose for Ubirr (docs/settlements/kakadu.md §15.4), added to the critters' MODELS from here: the engine's goose model (critter-models.js, walking and
// pecking on the hen's rig) with the magpie goose's plumage — white breast, belly and back, black head, neck, wings and tail, a bony dome on the crown, a pale hooked
// bill, orange-yellow legs [stated: Wikipedia "Magpie goose"; docs §4, §13]. Nothing of critter-models.js is changed.
import { Model, MODELS } from './critter-models.js';

const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function magpieGoose() {
  const m = new Model(), W = [0.95, 0.94, 0.9], BK = [0.06, 0.06, 0.07], BILL = [0.78, 0.62, 0.46], LEG = [0.92, 0.55, 0.14];
  const S = [[0.24, 0.32, 0.07, 0.065], [0.14, 0.33, 0.115, 0.1], [0.0, 0.30, 0.13, 0.115], [-0.14, 0.29, 0.11, 0.095], [-0.27, 0.32, 0.05, 0.05], [-0.31, 0.34, 0.012, 0.012]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 8, col: ({ p }) => lerp(W, BK, sm(-0.16, -0.28, p[0])) });
  for (const z of [-1, 1]) m.ball([-0.05, 0.37, z * 0.1], [0.2, 0.06, 0.04], BK, { nu: 5, nv: 6 });          // the black wings folded over the white back
  m.as(3, [-0.27, 0.34, 0], null, () => m.poly([[-0.26, 0.33, -0.04], [-0.26, 0.33, 0.04], [-0.37, 0.36, 0.05], [-0.4, 0.37, 0], [-0.37, 0.36, -0.05]], [BK, BK, BK, BK, BK]));
  const NP = [0.22, 0.36, 0], HP = [0.3, 0.68, 0];
  m.as(1, NP, null, () => m.tube([[0.2, 0.36, 0], [0.25, 0.46, 0], [0.28, 0.58, 0], [0.3, 0.68, 0]], [0.06, 0.04, 0.032, 0.03], { sides: 6, ref: [1, 0, 0], col: ({ t }) => lerp(W, BK, sm(0.0, 0.25, t)) }));
  m.as(2, HP, NP, () => {
    m.ball([0.32, 0.7, 0], [0.05, 0.04, 0.035], BK);
    m.ball([0.3, 0.74, 0], [0.025, 0.035, 0.02], BK, { nu: 4, nv: 5 });                                        // the bony dome
    m.tube([[0.36, 0.695, 0], [0.42, 0.68, 0]], [[0.022, 0.026], [0.012, 0.016]], { sides: 5, col: BILL });
    m.ball([0.425, 0.672, 0], [0.012, 0.012, 0.01], BILL, { nu: 3, nv: 4 });                                   // the hooked tip
    for (const s of [-1, 1]) m.as(11, [0.33, 0.715, s * 0.032], HP, () => m.ball([0.33, 0.715, s * 0.032], [0.008, 0.008, 0.008], [0.35, 0.25, 0.12], { nu: 4, nv: 5 }), NP);
  });
  for (const [part, z] of [[4, -1], [5, 1]]) {
    const hip = [0.0, 0.2, z * 0.07];
    m.as(part, hip, null, () => {
      m.tube([hip, [0.0, 0.1, z * 0.07], [0.01, 0.02, z * 0.07]], [0.03, 0.016, 0.012], { sides: 5, col: ({ t }) => (t < 0.25 ? W : LEG) });
      m.poly([[0.0, 0.02, z * 0.07 - 0.03], [0.0, 0.02, z * 0.07 + 0.03], [0.14, 0.005, z * 0.07 + 0.05], [0.16, 0.005, z * 0.07], [0.14, 0.005, z * 0.07 - 0.05]], LEG);
    });
  }
  return m;
}
MODELS.goose_magpie = magpieGoose;
