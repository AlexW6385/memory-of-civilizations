// Mohenjo-daro, c. 2500 BC — what stands in the streets of the visitor's walk (docs/settlements/mohenjo-daro.md §16.1): the water-stand with its jars and clay ladle, the
// wayside shrine (a brick plinth with terracotta figurines and a lamp), the potter's mat, the trader's balance with its chert weights, a stack of fuel. Each is placed from
// the data of `SPOTS` (pure, below) against a wall, off the doors' lanes; every variation is a function of the piece's own place (no counters, no Math.random).
// Registered into the style `indus` from here (the style's files stay as they were).
import '../../styles/indus/index.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

const hash = (x, z, s = 0) => { let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
const JAR = (s) => [[0.07 * s, 0], [0.2 * s, 0.12 * s], [0.24 * s, 0.3 * s], [0.19 * s, 0.5 * s], [0.1 * s, 0.6 * s], [0.12 * s, 0.66 * s], [0.001, 0.66 * s]];

/** The things of the walk: [kind, x, z, y, face] — `face` the way the piece looks, 'n' | 's' | 'e' | 'w' (away from the wall it stands against). */
export const SPOTS = [
  // the platform: the lane of the eastern quarter's mouth on the street at z −79, the street before the College
  ['stand', -86, -81.4, 7, 's'], ['potmat', -102, -81.2, 7, 's'], ['shrine', -95.2, -81.4, 7, 's'], ['weights', -75, -81.3, 7, 's'],
  ['fuel', -138, -64.4, 7, 'n'], ['stand', -128, -59.6, 7, 's'],
  // the plain: the street to the market place along both walls
  ['fuel', -16, -43.2, 0, 's'], ['shrine', 14, -43.2, 0, 's'], ['stand', 40, -43.2, 0, 's'],
  ['potmat', 22, -36.9, 0, 'n'], ['weights', 46, -36.9, 0, 'n'], ['stand', -18, -36.9, 0, 'n'],
];

const fig = (bag, x, y, z, s) => bag.add('terracotta', lathe([[0.001, 0], [0.05 * s, 0], [0.045 * s, 0.1 * s], [0.04 * s, 0.2 * s], [0.055 * s, 0.24 * s], [0.03 * s, 0.27 * s], [0.03 * s, 0.31 * s], [0.001, 0.32 * s]], 6, null, x, y, z));
const lamp = (bag, x, y, z) => { bag.add('terracotta', lathe([[0.001, 0], [0.05, 0], [0.07, 0.025], [0.055, 0.04], [0.001, 0.03]], 8, null, x, y, z)); bag.add('bitumen', box(x - 0.012, y + 0.03, z - 0.075, x + 0.012, y + 0.036, z - 0.045)); };

function lanework(el, ctx) {
  const { bag, col } = ctx, [kind, x, z, y = 0, face = 'n'] = el.spot ?? el.at, h = (s) => hash(x, z, s);
  // a frame: u along the wall, v out from it, in the world's axes by `face`
  const D = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[face], U = [-D[1], D[0]];
  const P = (u, v) => [x + U[0] * u + D[0] * v, z + U[1] * u + D[1] * v];
  const B = (mat, u0, y0, v0, u1, y1, v1, solid = false) => { const a = P(u0, v0), b = P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; bag.add(mat, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); };
  const jar = (mat, u, v, s, y0 = 0) => { const p = P(u, v); bag.add(mat, lathe(JAR(s), 8, null, p[0], y + y0, p[1])); };
  if (kind === 'stand') {
    // a brick table for the water-jars with a clay ladle on a peg, a drip-pot below, a mat laid at its foot [inferred: the stands of later South Asian streets]
    B('brick', -0.9, 0, 0.05, 0.9, 0.62, 0.65, true); B('brick', -0.95, 0.62, 0.0, 0.95, 0.68, 0.7);
    jar(h(1) < 0.5 ? 'terracotta' : 'pottery_dark', -0.45, 0.35, 1.5 + 0.3 * h(2), 0.68); jar('terracotta', 0.25, 0.33, 1.6 + 0.25 * h(3), 0.68);
    B('timber', 0.62, 0.68, 0.2, 0.66, 0.9, 0.24); B('terracotta', 0.58, 0.9, 0.12, 0.72, 0.95, 0.3);
    jar('pottery_dark', 0.0, 0.95, 0.9, 0);
    B('reed_mat', -0.9, 0, 0.8, 0.9, 0.025, 1.5);
  } else if (kind === 'shrine') {
    // a plinth of brick with a niche behind: terracotta figurines of the seated mother-goddess kind and bulls, a lamp blackened with soot, a cord of flowers [inferred: the figurines are stated finds, the way side is ours]
    B('brick', -0.45, 0, 0.05, 0.45, 0.5, 0.75, true); B('brick', -0.5, 0.5, 0.0, 0.5, 0.56, 0.8);
    B('mudbrick', -0.4, 0.56, 0.05, 0.4, 1.35, 0.3); B('bitumen', -0.2, 0.9, 0.3, 0.2, 1.2, 0.32);
    for (let k = -1; k <= 1; k++) { const p = P(k * 0.22, 0.45); fig(bag, p[0], y + 0.56, p[1], 0.9 + 0.3 * hash(x + k, z, 4)); }
    { const p = P(0.34, 0.6); lamp(bag, p[0], y + 0.56, p[1]); }
    B('terracotta', -0.3, 0.57, 0.62, 0.3, 0.6, 0.7);
  } else if (kind === 'potmat') {
    // the potter's mat: rows of pots by size, a stack of bowls, a seller's low stool of mud brick (the keeper sits among the pots)
    B('reed_mat', -1.3, 0, 0.35, 1.3, 0.025, 1.9);
    for (let k = 0; k < 7; k++) { const row = k < 4 ? 0 : 1; jar(k % 3 === 0 ? 'pottery_dark' : 'terracotta', -1.0 + (k % 4) * 0.62 + row * 0.3, 0.7 + row * 0.55, 0.85 + 0.4 * hash(x + k, z, 5), 0.025); }
    for (let k = 0; k < 4; k++) B('terracotta', 0.75 - k * 0.0, 0.025 + k * 0.045, 1.55, 1.05, 0.07 + k * 0.045, 1.8);
    B('mudbrick', -0.2, 0, 1.55, 0.2, 0.3, 1.9);
  } else if (kind === 'weights') {
    // the trader's mat: a balance (beam on a post, two pans) and the chert cubes of its weights in a 5:2:1 ratio [stated: Wikipedia "Mohenjo-daro", weights; the balance [inferred]]
    B('reed_mat', -1.0, 0, 0.35, 1.0, 0.025, 1.6);
    B('timber', -0.04, 0.025, 0.7, 0.04, 0.85, 0.76); B('timber', -0.45, 0.82, 0.69, 0.45, 0.85, 0.77);
    for (const s of [-1, 1]) { B('timber', s * 0.43 - 0.006, 0.45, 0.72, s * 0.43 + 0.006, 0.82, 0.74); B('wood_dark', s * 0.43 - 0.13, 0.43, 0.65, s * 0.43 + 0.13, 0.45, 0.81); }
    for (let k = 0; k < 6; k++) { const s = [0.07, 0.05, 0.05, 0.035, 0.035, 0.03][k]; B('pottery_dark', -0.8 + k * 0.17, 0.025, 1.1, -0.8 + k * 0.17 + s, 0.025 + s, 1.1 + s); }
    for (let k = 0; k < 3; k++) B('reed_mat', 0.35 + k * 0.2, 0.025, 1.0, 0.5 + k * 0.2, 0.2, 1.3);
    B('mudbrick', -0.2, 0, 1.3, 0.2, 0.3, 1.65);
  } else if (kind === 'fuel') {
    // fuel for the hearths: a stack of tamarisk logs and dung cakes in a heap against the wall, a basket [stated: dung cakes are fuel in later South Asia; inferred here]
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - r; k++) B('wood_dark', -1.0 + r * 0.17 + k * 0.33, r * 0.14, 0.05 + 0.02 * hash(x + k, z + r, 6), -0.72 + r * 0.17 + k * 0.33, r * 0.14 + 0.12, 0.7);
    for (let k = 0; k < 6; k++) B('mudbrick', 0.9 + (k % 3) * 0.2, (k > 2 ? 0.1 : 0), 0.1, 1.07 + (k % 3) * 0.2, (k > 2 ? 0.2 : 0.1), 0.34);
    jar('reed_mat', -0.2, 1.0, 1.3, 0);
  }
}

let done = false;
export function registerWalkdress() { if (done) return; done = true; STYLES.indus.elements.md_lanework = lanework; }
registerWalkdress();
