// The Ananda's sculpture in levels of detail by the visitor's distance (docs/settlements/bagan.md §14). The temple itself (src/styles/burmese/temple.js) holds the modelled form always: the four
// standing Buddhas, the kneeling donors, the guardians and chinthe at the porches. The plans here add what shows near (`near`, drawn in the viewer's tile batches per material):
//   the Buddhas' curls, toes, nails, lids, neck rings (within 30 m); the lions' teeth, claws, bells (within 20 m, 10 m at the precinct's gates);
//   the corridors' and porches' stone reliefs cut as scenes of the Buddha's life, covering the first form's plates (within 22 and 26 m); the glazed plaques of the plinth (within 22 m).
// The precinct's gate lions are an always-shown plan of modelled chinthe (the old boxes' places).
import '../../styles/burmese/index.js';
import { ANANDA, PRECINCT, RADIUS } from './layout.js';
import { SIDES } from '../../styles/burmese/kit.js';
import { reliefPanels } from '../../styles/burmese/orn.js';

const base = (id, elements, o = {}) => ({ id, style: 'burmese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [30, 0], facing: 'e' }, nocollide: true, ...o });
const [ax, az] = ANANDA.c, f = ANANDA.f;
const at = (s, u, v) => [ax + SIDES[s][0][0] * u + SIDES[s][1][0] * v, az + SIDES[s][0][1] * u + SIDES[s][1][1] * v];
const POSE = { n: 'dhamma', s: 'dhamma', e: 'hang', w: 'abhaya' };
const SEED = { n: 3, e: 5, s: 7, w: 11 };

const [px0, pz0, px1, pz1] = PRECINCT, GATES = [[px0 + 2.6, az, -Math.PI / 2, 'z'], [px1 - 2.6, az, Math.PI / 2, 'z'], [ax, pz0 + 2.6, Math.PI, 'x'], [ax, pz1 - 2.6, 0, 'x']];
const lionEls = (extra) => GATES.flatMap(([x, z, rot, k]) => [-1, 1].map((sd) => ({ t: 'bgn_orn', kind: 'lion', at: k === 'z' ? [x, z + sd * 5] : [x + sd * 5, z], rot, s: 1.15, extra, col: !extra })));
/** The chinthe of the precinct's gates, modelled (in the temples' plan, with the old boxes' places). */
export const gateLions = () => lionEls(false);

export function sculpture() {
  const P = [], c = [ax, az];
  for (const s of ['n', 'e', 's', 'w']) {
    P.push(base(`bagan-buddha-fine-${s}`, [{ t: 'bgn_orn', kind: 'buddha', c, f, side: s, pose: POSE[s], seed: SEED[s], extra: true }], { near: 30, center: at(s, 0, 11.5) }));
    P.push(base(`bagan-porch-fine-${s}`, [-6.6, 6.6].map((u) => ({ t: 'bgn_orn', kind: 'lion', c, f, side: s, u, v: 44.9, s: 0.85, extra: true })), { near: 20, center: at(s, 0, 44.9) }));
    for (const run of ['c-', 'c+', 'p-', 'p+']) {
      const ps = reliefPanels({}, c, f, s, run), cc = ps.map((p) => p.F.pt(p.u, p.v)), ctr = [cc.reduce((a, q) => a + q[0], 0) / cc.length, cc.reduce((a, q) => a + q[1], 0) / cc.length];
      P.push(base(`bagan-reliefs-${s}${run}`, [{ t: 'bgn_orn', kind: 'reliefs', c, f, side: s, run }], { near: run[0] === 'c' ? 22 : 26, center: ctr }));
    }
    // the plaques along the plinth's sides (each arm's two faces), in runs of about 13 m
    for (const sg of [-1, 1]) for (const [v0, v1] of [[8.6, 21.2], [21.2, 33.8], [33.8, 45.5]]) P.push(base(`bagan-plaques-${s}${sg}-${v0}`, [{ t: 'bgn_orn', kind: 'plaques', c, f, side: s, sg, v0, v1 }], { near: 22, center: at(s, sg * 8.2, (v0 + v1) / 2) }));
  }
  // the pairs of chinthe at the four gates of the precinct (modelled always; their extras within 10 m)
  const gates = GATES, lions = lionEls;
  gates.forEach(([x, z, rot, k], i) => P.push(base(`bagan-gate-lions-fine-${i}`, lions(true).filter((_, j) => (j >> 1) === i), { near: 10, center: [x, z] })));
  return P;
}
