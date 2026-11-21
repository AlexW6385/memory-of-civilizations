// The water buffalo for the Hakka tulou (docs/settlements/hakka-tulou.md §13), added to the critters' MODELS from here: standing, on the dog's rig (parts 1 neck,
// 2 head, 3 tail, 4–7 legs; the shader lies it down and stands it up as the visitor comes). A heavy barrel on short legs, slate-grey skin showing through thin
// dark hair, a pale chevron at the throat, pale stockings, a long face with a pale muzzle, and the great flat horns that sweep out and back in a crescent
// [stated: the swamp buffalo's grey hide and swept-back crescent horns, the farm animal of south China's paddy; Wikipedia "Water buffalo"; proportions inferred]. Back at 1.2 m.
// Nothing of critter-models.js is changed.
import { Model, MODELS } from './critter-models.js';

const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash3 = (p, s = 0) => { const k = Math.sin(p[0] * 127.1 + p[1] * 311.7 + p[2] * 74.7 + s * 19.19) * 43758.5453; return k - Math.floor(k); };

export function waterBuffalo() {
  const m = new Model(), slate = [0.3, 0.31, 0.33], dark = [0.17, 0.17, 0.19], pale = [0.62, 0.6, 0.56], horn = [0.2, 0.18, 0.15], hornTip = [0.62, 0.56, 0.44];
  const coat = ({ p, n }) => lerp(lerp(slate, dark, sm(0.2, 0.9, n[1]) * 0.35), pale, sm(-0.3, -0.8, n[1]) * 0.25 + hash3(p, 5) * 0.06);
  const S = [[0.82, 0.92, 0.15, 0.13], [0.66, 1.0, 0.25, 0.22], [0.44, 1.1, 0.38, 0.34], [0.2, 1.12, 0.44, 0.38], [-0.06, 1.08, 0.44, 0.37], [-0.3, 1.1, 0.4, 0.34], [-0.52, 1.08, 0.29, 0.26], [-0.64, 1.0, 0.14, 0.14], [-0.67, 0.97, 0.03, 0.03]];
  m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides: 10, col: coat });
  const NP = [0.66, 1.08, 0], HP = [0.98, 0.98, 0];
  // the neck runs forward and a little down, the head carried low and level with the back
  m.as(1, NP, null, () => m.tube([[0.58, 1.08, 0], [0.74, 1.06, 0], [0.9, 1.0, 0]], [[0.24, 0.2], [0.18, 0.16], [0.15, 0.13]], { sides: 8, ref: [1, 0, 0], col: ({ p, t }) => lerp(coat({ p, n: [0, 1, 0] }), pale, sm(0.5, 0.9, t) * 0.3) }));
  m.as(2, HP, NP, () => {
    m.ball([1.02, 0.97, 0], [0.15, 0.13, 0.1], coat, { nu: 7, nv: 8 });
    m.tube([[1.1, 0.92, 0], [1.22, 0.84, 0], [1.3, 0.8, 0]], [[0.09, 0.08], [0.08, 0.075], [0.075, 0.07]], { sides: 7, col: ({ t }) => lerp(slate, pale, t * 0.9) });
    m.ball([1.31, 0.79, 0], [0.02, 0.035, 0.045], [0.12, 0.1, 0.09], { nu: 4, nv: 6 });
    for (const s of [-1, 1]) {
      // the horn: out from the poll, back and up in a flat crescent, the tip paler
      m.tube([[0.98, 1.08, s * 0.08], [0.94, 1.12, s * 0.22], [0.86, 1.19, s * 0.36], [0.78, 1.27, s * 0.44], [0.72, 1.36, s * 0.42]], [0.034, 0.03, 0.024, 0.016, 0.004], { sides: 5, col: ({ t }) => lerp(horn, hornTip, sm(0.6, 1, t)) });
      m.tube([[0.96, 1.0, s * 0.1], [0.92, 1.02, s * 0.22], [0.9, 1.0, s * 0.3]], [[0.02, 0.055], [0.015, 0.05], [0.002, 0.01]], { sides: 4, col: coat });          // the ear, held out sideways
      m.ball([1.14, 0.92, s * 0.075], [0.025, 0.018, 0.012], [0.08, 0.06, 0.05], { nu: 4, nv: 4 });                                                           // the nostril
      m.ball([1.08, 1.0, s * 0.1], [0.016, 0.018, 0.016], [0.1, 0.07, 0.04], { nu: 4, nv: 5 });                                                               // the eye
    }
  });
  m.as(3, [-0.66, 1.0, 0], null, () => m.tube([[-0.66, 1.0, 0], [-0.7, 0.8, 0], [-0.72, 0.5, 0], [-0.72, 0.28, 0]], [0.034, 0.024, 0.02, 0.03], { sides: 4, col: ({ t }) => (t > 0.8 ? dark : slate) }));
  const legs = [[4, 1, -1, 0.52], [5, 1, 1, 0.52], [6, 0, -1, -0.46], [7, 0, 1, -0.46]];
  for (const [part, front, z, x] of legs) {
    const hip = [x, 0.8, z * 0.2];
    m.as(part, hip, null, () => {
      m.tube([hip, [x - (front ? 0 : 0.06), 0.48, z * 0.2], [x - (front ? 0 : 0.04), 0.22, z * 0.2], [x + 0.01, 0.05, z * 0.2]], [[0.17, 0.14], [0.1, 0.085], [0.075, 0.07], [0.075, 0.075]], { sides: 6, col: ({ t }) => lerp(coat({ p: [x, 0.5, z], n: [0, 0, 1] }), pale, sm(0.5, 0.75, t) * 0.7) });
      m.ball([x + 0.02, 0.028, z * 0.2], [0.075, 0.035, 0.055], [0.12, 0.1, 0.09], { nu: 4, nv: 5 });
    });
  }
  return m;
}
MODELS.buffalo_water = waterBuffalo;
