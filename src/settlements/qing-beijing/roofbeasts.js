// The roof's glazed beasts of the Hall of Supreme Harmony (docs/settlements/qing-beijing.md §37): the great chiwen (zhengwen) at each end of the
// main ridge, a dragon-head ridge end swallowing the ridge with its tail curled over the top, a sword at its back; and on each hip the
// immortal riding the phoenix, then the ten beasts in their order (dragon, phoenix, lion, heavenly horse, sea horse, suanni, yayu, xiezhi,
// douniu, xingshi) and the hanging beast (chuishou) at the hip's top. Each is a modelled figure of lofted volumes. Built facing +z, standing on
// y = 0 (the chiwen in x along the ridge, its mouth toward -x).
import { Parts } from '../../styles/qing/carving.js';
import { curve, ell, cone, ring, add, norm, cross } from './sculpt.js';

const X = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const bl = (c, r, n = 7, m = 4) => ell(c, r, X, n, m);

/** The chiwen, h high, mouth toward -x, thickness along z; `put` adds geometries. fine: the layer for near view. */
export function chiwen(put, h, fine = false) {
  const S = (p) => [p[0] * h, p[1] * h, (p[2] ?? 0) * h], R = (r) => r * h;
  const C = (pts, r0, r1, o = {}) => put(curve(pts.map(S), R(r0), R(r1), { n: 7, per: 3, ...o }));
  const E = (c, r, n = 8, m = 5) => put(ell(S(c), r.map(R), X, n, m));
  if (!fine) {
    C([[0.3, 0.0, 0], [0.4, 0.3, 0], [0.38, 0.62, 0], [0.22, 0.9, 0], [0.0, 1.0, 0]], 0.27, 0.05, { flat: 0.75, up: [0, 0, 1], swell: 0.12 });     // the trunk
    C([[0.0, 1.0, 0], [-0.12, 1.02, 0], [-0.2, 0.93, 0], [-0.15, 0.84, 0]], 0.05, 0.02, { flat: 0.8, up: [0, 0, 1] });                               // the tail's curl
    E([0.34, 0.1, 0], [0.34, 0.1, 0.19]);                                                                                                       // the foot on the ridge
    E([-0.08, 0.42, 0], [0.21, 0.2, 0.2], 9, 6);                                                                                                   // the skull
    C([[-0.12, 0.5, 0], [-0.3, 0.55, 0], [-0.47, 0.6, 0]], 0.13, 0.07, { flat: 0.9, up: [0, 0, 1] });                                               // the upper jaw
    E([-0.47, 0.6, 0], [0.09, 0.07, 0.08]);                                                                                                       // the nose
    C([[-0.12, 0.32, 0], [-0.3, 0.27, 0], [-0.43, 0.23, 0]], 0.09, 0.05, { flat: 0.9, up: [0, 0, 1] });                                             // the lower jaw
    E([-0.3, 0.4, 0], [0.1, 0.035, 0.07]);                                                                                                         // the tongue
    for (const s of [-1, 1]) {
      E([-0.12, 0.56, s * 0.15], [0.05, 0.05, 0.045], 7, 4);                                                                                       // the eyes
      E([-0.1, 0.62, s * 0.13], [0.09, 0.025, 0.05], 7, 3);                                                                                        // the brows
      C([[-0.02, 0.62, s * 0.08], [0.06, 0.85, s * 0.12], [0.0, 1.0, s * 0.1]], 0.04, 0.012, { up: [0, 0, 1], n: 5 });                              // the horns
      C([[-0.46, 0.55, s * 0.08], [-0.52, 0.38, s * 0.2], [-0.4, 0.14, s * 0.24]], 0.018, 0.006, { n: 4, up: [0, 0, 1] });                         // the whiskers
      C([[-0.1, 0.36, s * 0.16], [-0.04, 0.2, s * 0.24], [0.05, 0.05, s * 0.22]], 0.045, 0.01, { n: 5, up: [0, 0, 1] });                           // the beard
      put(cone(S([-0.36, 0.585, s * 0.05]), S([-0.37, 0.5, s * 0.06]), R(0.025), 4));                                                              // the fangs
      put(cone(S([-0.36, 0.25, s * 0.04]), S([-0.37, 0.33, s * 0.05]), R(0.02), 4));
    }
    for (let i = 0; i < 8; i++) {                                                                                                                 // the fins along the back
      const t = i / 7, p = [0.46 - 0.2 * t * t + (t > 0.7 ? -0.16 * (t - 0.7) : 0), 0.12 + 0.82 * t], q = [p[0] + 0.1 - 0.05 * t, p[1] + 0.03];
      put(cone(S([p[0], p[1], 0]), S([q[0], q[1], 0]), R(0.05), 4));
    }
    put(curve([S([0.14, 0.92, 0]), S([0.2, 1.12, 0]), S([0.26, 1.28, 0])], R(0.03), R(0.025), { n: 6, per: 1 }));                                 // the sword's hilt
    put(ring(S([0.2, 1.12, 0]), R(0.05), R(0.012), [0.2, 1, 0], 10, 4));
    E([0.27, 1.3, 0], [0.04, 0.04, 0.04], 6, 4);
    C([[0.27, 1.28, 0], [0.33, 1.1, 0], [0.35, 0.95, 0]], 0.02, 0.008, { n: 4, up: [0, 0, 1] });                                                  // its tassel
    E([0.3, 0.45, 0.0], [0.1, 0.1, 0.14]);                                                                                                         // the small beast on the back
  } else {
    // the scales across the trunk, the teeth, the finer fins
    for (let i = 0; i < 12; i++) { const t = i / 11, p = [0.3 + 0.1 * Math.sin(t * 2.6) - 0.3 * t * t * t, 0.04 + 0.92 * t]; put(ring(S([p[0], p[1], 0]), R(0.25 * (1 - t * 0.8)), R(0.012), [0.0, 1, 0.0], 12, 3, -Math.PI / 2, Math.PI)); }
    for (let q = 0; q < 6; q++) { const x = -0.2 - q * 0.05; put(cone(S([x, 0.58 - q * 0.002, 0.05]), S([x, 0.5, 0.05]), R(0.012), 4)); put(cone(S([x, 0.26, 0.05]), S([x, 0.33, 0.05]), R(0.011), 4)); }
  }
}

/** A roof beast of `kind`, about 1 high, facing +z. */
export function beast(put, kind) {
  const B = (c, r, n, m) => put(bl(c, r, n, m)), L = (pts, r0, r1, o = {}) => put(curve(pts, r0, r1, { n: 5, per: 2, ...o }));
  const bird = kind === 'rider' || kind === 'phoenix';
  if (bird) {
    B([0, 0.3, 0], [0.16, 0.18, 0.3], 8, 5); B([0, 0.52, 0.28], [0.1, 0.12, 0.12], 7, 4);
    L([[0, 0.5, 0.22], [0, 0.66, 0.3], [0, 0.72, 0.34]], 0.07, 0.05);
    put(cone([0, 0.7, 0.38], [0, 0.66, 0.56], 0.035, 4));
    L([[0, 0.74, 0.3], [0, 0.88, 0.22], [0, 0.82, 0.12]], 0.03, 0.008);                                       // the crest
    for (const s of [-1, 1]) { B([s * 0.14, 0.34, -0.02], [0.04, 0.14, 0.26], 6, 3); L([[s * 0.06, 0.28, -0.25], [s * 0.18, 0.5, -0.5], [s * 0.28, 0.82, -0.62]], 0.05, 0.008, { flat: 0.4, up: [0, 1, 0] }); L([[s * 0.03, 0.14, 0.04], [s * 0.04, 0.0, 0.06]], 0.025, 0.02); }
    L([[0, 0.3, -0.28], [0, 0.55, -0.55], [0, 0.95, -0.62]], 0.08, 0.012, { flat: 0.4, up: [1, 0, 0] });
    if (kind === 'rider') { B([0, 0.62, 0.02], [0.08, 0.12, 0.07], 7, 4); B([0, 0.78, 0.02], [0.06, 0.06, 0.06], 7, 4); put(ring([0, 0.84, 0.02], 0.07, 0.015, [0, 1, 0], 8, 3)); }
    return;
  }
  const dragonish = kind === 'dragon' || kind === 'yayu' || kind === 'chuishou';
  B([0, 0.28, 0], dragonish ? [0.15, 0.17, 0.38] : [0.17, 0.2, 0.32], 8, 5);
  B([0, 0.52, 0.3], [0.12, 0.14, 0.16], 7, 4);                                                    // the chest, neck
  for (const s of [-1, 1]) { B([s * 0.15, 0.2, -0.18], [0.09, 0.16, 0.2], 6, 3); L([[s * 0.13, 0.4, 0.22], [s * 0.12, 0.2, 0.3], [s * 0.12, 0.02, 0.34]], 0.06, 0.04); B([s * 0.12, 0.03, 0.38], [0.06, 0.04, 0.08], 5, 3); }
  const hz = 0.42, hy = 0.66;
  if (kind === 'lion' || kind === 'suanni') {
    B([0, hy, hz], [0.15, 0.14, 0.14], 8, 5); B([0, hy - 0.04, hz + 0.14], [0.09, 0.07, 0.08], 6, 4);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; B([Math.cos(a) * 0.17, hy + Math.sin(a) * 0.16, hz - 0.06], [0.05, 0.05, 0.05], 5, 3); }
    L([[0, 0.28, -0.3], [0, 0.4, -0.5], [0, 0.6, -0.5]], 0.06, 0.02);
  } else if (kind === 'horse' || kind === 'seahorse') {
    L([[0, 0.52, 0.3], [0, 0.78, 0.4], [0, 0.82, 0.62]], 0.09, 0.055); B([0, 0.8, 0.66], [0.06, 0.06, 0.09], 6, 4);
    for (const s of [-1, 1]) put(cone([s * 0.04, 0.88, 0.42], [s * 0.05, 1.0, 0.4], 0.025, 4));
    for (let k = 0; k < 4; k++) B([0, 0.88 - k * 0.04, 0.34 - k * 0.04], [0.02, 0.07, 0.05], 5, 3);
    if (kind === 'horse') for (const s of [-1, 1]) L([[s * 0.17, 0.4, 0], [s * 0.3, 0.55, -0.1], [s * 0.38, 0.78, -0.2]], 0.05, 0.01, { flat: 0.4 });
    else L([[0, 0.28, -0.3], [0, 0.2, -0.55], [0, 0.45, -0.7]], 0.08, 0.015, { flat: 0.4, up: [1, 0, 0] });
  } else if (kind === 'xiezhi') {
    B([0, hy, hz], [0.12, 0.12, 0.15], 7, 4); B([0, hy - 0.04, hz + 0.16], [0.07, 0.06, 0.08], 6, 3); put(cone([0, hy + 0.1, hz + 0.02], [0, hy + 0.34, hz + 0.1], 0.03, 5));
  } else if (kind === 'douniu') {
    B([0, hy, hz], [0.13, 0.13, 0.15], 7, 4); B([0, hy - 0.05, hz + 0.15], [0.09, 0.07, 0.07], 6, 3);
    for (const s of [-1, 1]) L([[s * 0.1, hy + 0.08, hz], [s * 0.24, hy + 0.1, hz + 0.04], [s * 0.28, hy + 0.28, hz + 0.1]], 0.035, 0.008);
  } else if (kind === 'xingshi') {
    B([0, 0.62, 0.15], [0.12, 0.14, 0.1], 7, 4); B([0, 0.82, 0.18], [0.09, 0.09, 0.09], 7, 4);
    for (const s of [-1, 1]) L([[s * 0.1, 0.66, 0.05], [s * 0.3, 0.9, -0.1], [s * 0.36, 1.1, -0.2]], 0.05, 0.008, { flat: 0.4 });
  } else {                                                                                       // the dragon, the yayu, the hanging beast
    L([[0, 0.5, 0.3], [0, 0.66, 0.42], [0, 0.68, 0.52]], 0.09, 0.07);
    B([0, 0.68, 0.56], [0.11, 0.09, 0.14], 7, 4); B([0, 0.6, 0.62], [0.08, 0.035, 0.1], 6, 3);
    for (const s of [-1, 1]) { L([[s * 0.05, 0.76, 0.5], [s * 0.1, 0.96, 0.4], [s * 0.1, 1.04, 0.28]], 0.03, 0.006); B([s * 0.07, 0.74, 0.62], [0.03, 0.03, 0.03], 5, 3); L([[s * 0.04, 0.58, 0.68], [s * 0.1, 0.5, 0.66], [s * 0.12, 0.4, 0.58]], 0.01, 0.004, { n: 4 }); }
    if (kind === 'yayu') for (let k = 0; k < 5; k++) put(cone([0, 0.44 - 0.0 * k, 0.26 - k * 0.14], [0, 0.6, 0.2 - k * 0.14], 0.035, 4));
  }
  const tl = kind === 'yayu' ? [[0, 0.3, -0.3], [0, 0.5, -0.55], [0, 0.85, -0.5]] : [[0, 0.28, -0.3], [0, 0.3, -0.58], [0, 0.55, -0.7]];
  L(tl, 0.07, 0.012, { flat: 0.5, up: [1, 0, 0] });
  if (kind === 'chuishou') for (let k = 0; k < 5; k++) put(cone([0, 0.42 - 0.0 * k, 0.3 - k * 0.12], [0, 0.56, 0.24 - k * 0.12], 0.04, 4));
}
export const BEASTS = ['dragon', 'phoenix', 'lion', 'horse', 'seahorse', 'suanni', 'yayu', 'xiezhi', 'douniu', 'xingshi'];
/** One figure of the hip's row: i = 0 the immortal on the phoenix, 1…10 the beasts, 11 the hanging beast; P a Parts. */
export function figureKind(i) { return i === 0 ? 'rider' : i <= 10 ? BEASTS[i - 1] : 'chuishou'; }
export function buildFigure(P, mat, kind, fine = false) { if (!fine) beast((g) => P.add(mat, g), kind); }
export { Parts, add, norm, cross };
