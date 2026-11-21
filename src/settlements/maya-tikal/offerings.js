// Tikal c. 750: the offerings on the bench of each temple's innermost chamber (docs/settlements/maya-tikal.md §21). Built in a near plan of their own
// (town.js `offeringPlans`, shown only within 40 m of the shrine) so that they cost the arrival no draw; every material is one the style already uses.
// What lay there [inferred from Maya offering practice, Classic lowlands]: a jaguar pelt spread on the bench, a tripod plate holding shell and jade beads, a painted
// vase, the bowl of the bloodletting rite with strips of bark paper stained red and the stingray spines, a bundle of paper. All are functions of the element's place.
import '../../styles/tikal/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { frame, hashAt } from './walk.js';

const TF = 1.8, CH = 2.2, TP = 1.6, BENCH = 0.45;

/** The offerings of a shrine { c: [x, z] the middle of its front, face, y (its floor), chambers, len }. */
function offerings(el, { bag }) {
  const n = el.chambers ?? 3, len = el.len ?? 7, F = frame(el.face, ...el.c), y = el.y + BENCH, ua = TF + (n - 1) * (CH + TP), u = ua + CH - 0.35, h = len / 2 - 0.3;
  const at = (v, du = 0) => F.P(u + du, v), s = hashAt(el.c[0], el.c[1], 7);
  const flat = (mat, v, du, du2, hv, y0, y1) => { const r = F.R(u + du, u + du2, v - hv, v + hv); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); };
  // the jaguar pelt spread on the bench's middle, its spots
  flat('cloth_ochre', 0, -0.3, 0.3, 0.62, y, y + 0.03);
  for (let i = 0; i < 9; i++) { const v = -0.5 + (i % 5) * 0.25 + (hashAt(el.c[0], i, 3) - 0.5) * 0.08, du = -0.2 + Math.floor(i / 5) * 0.3 + (hashAt(i, el.c[1], 4) - 0.5) * 0.08; flat('cloth_black', v, du - 0.04, du + 0.04, 0.045, y + 0.03, y + 0.036); }
  // the tripod plate with its shell and jade
  { const p = at(h - 0.5), r = 0.26;
    bag.add('pottery_dark', lathe([[0.001, 0.08], [r - 0.03, 0.08], [r, 0.115], [r - 0.02, 0.125], [0.001, 0.1]], 12, null, p[0], y, p[1]));
    for (let k = 0; k < 3; k++) { const a = k * 2.094 + s * 6, q = [p[0] + Math.cos(a) * 0.15, p[1] + Math.sin(a) * 0.15]; bag.add('pottery_dark', rod([q[0], y, q[1]], [q[0], y + 0.09, q[1]], 0.022, 5)); }
    bag.add('shell_inlay', lathe([[0.001, 0.115], [0.09, 0.115], [0.1, 0.14], [0.05, 0.17], [0.001, 0.15]], 8, null, p[0] + 0.02, y, p[1]));
    for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.5, q = [p[0] + Math.cos(a) * 0.15, p[1] + Math.sin(a) * 0.15]; bag.add('inlay_jade', lathe([[0.001, 0.12], [0.04, 0.125], [0.035, 0.15], [0.001, 0.16]], 6, null, q[0], y, q[1])); } }
  // the painted vase, a red band at its belly
  { const p = at(-h + 0.5), r = 0.1;
    bag.add('pottery_dark', lathe([[0.001, 0], [r, 0], [r * 1.25, 0.1], [r * 1.1, 0.22], [r * 1.35, 0.28], [r * 1.2, 0.29], [r * 0.9, 0.26], [r * 0.9, 0.2], [0.001, 0.2]], 10, null, p[0], y, p[1]));
    bag.add('stucco_red', lathe([[r * 1.27, 0.08], [r * 1.3, 0.1], [r * 1.18, 0.17], [r * 1.14, 0.15]], 10, null, p[0], y, p[1])); }
  // the bloodletting bowl: strips of bark paper, stained, and the stingray spines
  { const p = at(-h * 0.5 - 0.2, 0.05);
    bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0], [0.18, 0.08], [0.19, 0.12], [0.16, 0.12], [0.001, 0.05]], 12, null, p[0], y, p[1]));
    for (let k = 0; k < 3; k++) { const q = F.R(u + 0.06 * k - 0.1, u + 0.06 * k - 0.06, -h * 0.5 - 0.2 - 0.1, -h * 0.5 - 0.2 + 0.1 + k * 0.02); bag.add(k % 2 ? 'cloth_red' : 'cloth_white', box(q[0], y + 0.045 + k * 0.012, q[1], q[2], y + 0.056 + k * 0.012, q[3])); }
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + s * 5, b = [p[0] + Math.cos(a) * 0.12, p[1] + Math.sin(a) * 0.12]; bag.add('limewash_white', rod([p[0] + Math.cos(a) * 0.04, y + 0.07, p[1] + Math.sin(a) * 0.04], [b[0], y + 0.26, b[1]], 0.008, 4)); } }
  // a bundle of bark paper
  { const v = h * 0.5 + 0.5; flat('cloth_white', v, -0.12, 0.12, 0.17, y, y + 0.05); flat('cloth_red', v, -0.12, 0.12, 0.06, y + 0.05, y + 0.062); }
}

let done = false;
export function registerOfferings() { if (done) return; done = true; STYLES.tikal.elements.mt_offerings = offerings; }
registerOfferings();
