// The colossus of the second pylon (docs/settlements/thebes.md §13): Ramesses II standing, the left foot forward, the arms crossed on the
// chest holding the crook and the flail, in the nemes with the double crown, the short pleated kilt, the false beard, the broad collar;
// his daughter Bentanta, a small queen's figure, standing at his legs; the back pillar behind with its columns of signs, the base with its
// row of signs. Painted sandstone (flesh red-brown, kilt white, nemes blue and gold, the white and the red crown).
// Authored in units of the statue's height (the whole scaled by `h`), facing +z, x to the viewer's right when seen from +z.
import { lathe, box, frustum, fromTriangles, place } from '../../core/geom.js';
import { glyphs, ellip, taper, curve, keep } from './kit.js';

const SK = 'granite_red', ST = 'sandstone_dressed', WH = 'plaster_white', BL = 'egyptian_blue', GD = 'gold', RD = 'limewash_red', GR = 'fresco_green', OC = 'paint_ochre', BK = 'lacquer_black';
// the torso's radius at a height (scaled 1.5 across, 0.95 deep): the collar's bands follow it
const TP = [[0.46, 0.050], [0.52, 0.057], [0.60, 0.064], [0.66, 0.068], [0.70, 0.064], [0.725, 0.048], [0.74, 0.030]];
const torsoR = (y) => { for (let i = 0; i < TP.length - 1; i++) if (y <= TP[i + 1][0]) { const t = (y - TP[i][0]) / (TP[i + 1][0] - TP[i][0]); return TP[i][1] + (TP[i + 1][1] - TP[i][1]) * Math.max(0, t); } return TP[TP.length - 1][1]; };

/** colossus: { at, y, yaw, h (total height) } */
export function colossus(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, H = el.h ?? 11;
  const A = (mat, g) => { g.scale(H, H, H); place(g, x, y, z, yaw); bag.add(mat, g); };
  const AT = (mat, T) => { if (T.length) A(mat, fromTriangles(T)); };
  const wide = (g, sx = 1.5, sz = 0.95) => { g.scale(sx, 1, sz); return g; };
  // the base, the back pillar
  A(ST, box(-0.19, 0, -0.20, 0.19, 0.03, 0.30));
  A(ST, box(-0.072, 0.03, -0.102, 0.072, 0.915, -0.048));
  A(ST, box(-0.082, 0.905, -0.108, 0.082, 0.92, -0.044));
  // the legs: the right straight, the left striding forward (turned about the hip), the feet on the base
  const legProfile = [[0.019, 0.04], [0.026, 0.09], [0.030, 0.15], [0.026, 0.21], [0.027, 0.26], [0.034, 0.33]];
  A(SK, lathe(legProfile, 12, null, -0.043, 0, 0));
  const left = lathe(legProfile, 12); left.translate(0, -0.33, 0); left.rotateX(-0.26); left.translate(0.043, 0.33, 0); A(SK, left);
  A(SK, ellip(-0.043, 0.046, 0.026, 0.024, 0.016, 0.052, 10));
  A(SK, ellip(0.043, 0.046, 0.100, 0.024, 0.016, 0.052, 10));
  for (const [fx, fz] of [[-0.043, 0.07], [0.043, 0.144]]) for (let k = -2; k <= 2; k++) A(SK, ellip(fx + k * 0.0092, 0.042, fz, 0.0052, 0.008, 0.008, 6));   // the toes
  // the kilt (shendyt): a skirt of white linen to above the knee, its pleated apron in front, the belt with its buckle
  A(WH, wide(lathe([[0.088, 0.30], [0.092, 0.31], [0.085, 0.40], [0.075, 0.46], [0.078, 0.47]], 16), 1.15, 0.85));
  A(WH, frustum([-0.05, 0.060, 0.05, 0.088], 0.30, 0.455, 0.012, 0.012, 0, 0.012, { noBottom: true }));
  for (let i = -3; i <= 3; i++) A(OC, box(i * 0.0135 - 0.0025, 0.302, 0.088, i * 0.0135 + 0.0025, 0.452, 0.0905));   // the pleats' edges
  A(OC, wide(lathe([[0.080, 0.455], [0.083, 0.456], [0.083, 0.472], [0.079, 0.473]], 16), 1.15, 0.85));
  A(GD, box(-0.016, 0.455, 0.0725, 0.016, 0.478, 0.0805));
  // the torso, the neck, the arms
  A(SK, wide(lathe(TP.map(([v, r]) => [r, v]), 16)));
  A(SK, lathe([[0.028, 0.72], [0.026, 0.745], [0.030, 0.77]], 12));
  for (const s of [-1, 1]) {
    A(SK, ellip(s * 0.115, 0.69, 0, 0.032, 0.032, 0.032, 10));
    A(SK, lathe([[0.027, 0.69], [0.027, 0.64], [0.022, 0.575]], 10, null, s * 0.118, 0, 0.004));
    A(SK, ellip(s * 0.118, 0.572, 0.012, 0.024, 0.024, 0.024, 8));
    A(GD, lathe([[0.0265, 0.62], [0.0285, 0.622], [0.0285, 0.636], [0.0265, 0.638]], 10, null, s * 0.118, 0, 0.004));   // the armlet
  }
  // the arms crossed: right over left, the fists at the chest, the crook and the flail rising from them to the shoulders
  const fR = [0.030, 0.668, 0.090], fL = [-0.030, 0.652, 0.078];
  A(SK, taper([-0.118, 0.572, 0.014], fR, 0.022, 0.018, 8)); A(SK, taper([0.118, 0.572, 0.012], fL, 0.022, 0.018, 8));
  A(SK, ellip(...fR, 0.022, 0.02, 0.026, 8)); A(SK, ellip(...fL, 0.022, 0.02, 0.026, 8));
  A(GD, taper(fR, [0.082, 0.80, 0.078], 0.0075, 0.0075, 6));                                                  // the crook
  for (const g of curve([[0.082, 0.80, 0.078], [0.092, 0.822, 0.088], [0.090, 0.838, 0.104], [0.076, 0.842, 0.116], [0.064, 0.832, 0.118]], 0.0075, 0.0075, 6)) A(GD, g);
  A(BL, taper([fR[0] + 0.01, fR[1] + 0.01, fR[2] + 0.002], [0.062, 0.76, 0.082], 0.0095, 0.0095, 6));          // (the crook's blue binding)
  A(GD, taper(fL, [-0.078, 0.80, 0.07], 0.0075, 0.0075, 6));                                                  // the flail's handle
  A(GD, taper([-0.078, 0.80, 0.07], [-0.084, 0.82, 0.092], 0.0075, 0.0075, 6));
  for (const dx of [-0.012, 0, 0.012]) { A(BL, taper([-0.084, 0.82, 0.092], [-0.084 + dx * 2, 0.795, 0.112], 0.0035, 0.0035, 5)); A(GD, ellip(-0.084 + dx * 2, 0.789, 0.113, 0.006, 0.007, 0.006, 6)); }   // the three thongs and their beads
  // the broad collar: tiers of ochre, blue and green, a fringe of gold beads, each following the torso
  const tier = (y0, y1, d, mat) => A(mat, wide(lathe([[torsoR(y0) + d, y0], [torsoR((y0 + y1) / 2) + d, (y0 + y1) / 2], [torsoR(y1) + d, y1]], 16)));
  tier(0.715, 0.742, 0.005, OC); tier(0.685, 0.715, 0.009, BL); tier(0.655, 0.685, 0.013, GR); tier(0.635, 0.655, 0.017, GD);
  // the head: the face (brow, eyes, nose, mouth, the false beard), the nemes with its lappets, the uraeus
  A(SK, ellip(0, 0.793, 0.030, 0.034, 0.049, 0.041, 12));
  A(SK, ellip(0, 0.789, 0.073, 0.0075, 0.016, 0.011, 6));
  for (const s of [-1, 1]) { A(BK, ellip(s * 0.0165, 0.806, 0.0695, 0.0085, 0.0038, 0.004, 6)); A(BK, box(s * 0.0165 - 0.0095, 0.8125, 0.0695, s * 0.0165 + 0.0095, 0.8155, 0.0715)); A(SK, ellip(s * 0.037, 0.792, 0.01, 0.005, 0.014, 0.01, 6)); }
  A(RD, box(-0.011, 0.768, 0.0685, 0.011, 0.7715, 0.0705));
  A(BL, frustum([-0.0075, 0.074, 0.0075, 0.090], 0.712, 0.762, 0, 0, 0, 0.004, { noBottom: false }));          // the false beard
  A(GD, box(-0.0085, 0.745, 0.0725, 0.0085, 0.748, 0.0915)); A(GD, box(-0.0085, 0.725, 0.0725, 0.0085, 0.728, 0.0915));
  const nemes = lathe([[0.058, 0.745], [0.054, 0.78], [0.050, 0.82], [0.042, 0.855], [0.028, 0.875], [0.001, 0.884]], 16); nemes.scale(1, 1, 1.14); nemes.translate(0, 0, -0.012);
  A(BL, nemes);
  for (let i = 0; i < 4; i++) { const v = 0.762 + i * 0.026, r = 0.0585 - i * 0.0025; const b = lathe([[r, v], [r + 0.002, v + 0.004], [r + 0.002, v + 0.01], [r, v + 0.014]], 16); b.scale(1, 1, 1.14); b.translate(0, 0, -0.012); A(GD, b); }   // the gold stripes
  for (const s of [-1, 1]) {
    A(BL, box(s * 0.046 - 0.0125, 0.625, 0.073, s * 0.046 + 0.0125, 0.745, 0.083));                           // the lappets lying on the collar
    for (let i = 0; i < 5; i++) A(GD, box(s * 0.046 - 0.0125, 0.64 + i * 0.022, 0.083, s * 0.046 + 0.0125, 0.646 + i * 0.022, 0.0855));
  }
  A(BL, box(-0.024, 0.64, -0.092, 0.024, 0.762, -0.062));                                                      // the nemes' tail down the back
  A(GD, taper([0, 0.857, 0.056], [0, 0.872, 0.066], 0.006, 0.004, 6)); A(GD, ellip(0, 0.861, 0.0585, 0.0055, 0.011, 0.0045, 6));   // the uraeus on the brow
  // the double crown: the red crown's low drum and its tall rear, the white crown rising from it, the curl at the front
  A(RD, lathe([[0.049, 0.874], [0.049, 0.90], [0.043, 0.925], [0.012, 0.93]], 14));
  A(RD, box(-0.031, 0.88, -0.062, 0.031, 0.958, -0.028));
  A(RD, box(-0.024, 0.958, -0.058, 0.024, 0.968, -0.032));
  A(WH, lathe([[0.034, 0.925], [0.040, 0.945], [0.040, 0.968], [0.032, 0.99], [0.019, 1.005], [0.0165, 1.018], [0.012, 1.024], [0.001, 1.026]], 14));
  for (const g of curve([[0, 0.928, 0.036], [0, 0.96, 0.050], [0, 0.99, 0.058], [0, 1.006, 0.074], [0, 0.998, 0.092], [0, 0.984, 0.088]], 0.0042, 0.0042, 5)) A(RD, g);
  // Bentanta at the king's right leg: the long sheath, the tripartite wig, the crown of uraei with its two plumes, a flower held to the breast
  const bx = -0.052, bz = 0.125;
  A(WH, lathe([[0.026, 0.03], [0.029, 0.12], [0.030, 0.19], [0.032, 0.225], [0.033, 0.245], [0.027, 0.262], [0.018, 0.268]], 12, null, bx, 0, bz));
  A(OC, lathe([[0.0345, 0.243], [0.0345, 0.252], [0.029, 0.264]], 12, null, bx, 0, bz));
  A(OC, lathe([[0.012, 0.27], [0.013, 0.282], [0.011, 0.29]], 8, null, bx, 0, bz));
  A(OC, ellip(bx, 0.298, bz + 0.003, 0.0135, 0.0165, 0.0145, 8));
  A(BK, lathe([[0.024, 0.255], [0.025, 0.285], [0.020, 0.315], [0.001, 0.323]], 10, null, bx, 0, bz - 0.002));
  A(GD, lathe([[0.0225, 0.318], [0.0225, 0.326], [0.019, 0.33]], 10, null, bx, 0, bz - 0.002));
  for (const s of [-1, 1]) { A(GD, box(bx + s * 0.008 - 0.003, 0.33, bz - 0.0045, bx + s * 0.008 + 0.003, 0.378, bz + 0.0015)); A(BL, box(bx + s * 0.008 - 0.0032, 0.35, bz - 0.0047, bx + s * 0.008 + 0.0032, 0.358, bz + 0.0017)); }
  A(GR, ellip(bx + 0.002, 0.243, bz + 0.03, 0.007, 0.007, 0.005, 6));
  // the signs: the row on the base's front, the columns down the back pillar
  const T = [], B = [];
  const frontPlace = (u, v, d) => [v, u, 0.30 + d];
  glyphs(T, frontPlace, 0.014, -0.17, 0.17, 0.0125, 31, 0.0016);
  const backPlace = (u, v, d) => [u, v, -0.102 - d];
  for (const [u, seed] of [[-0.045, 5], [-0.0, 9], [0.045, 17]]) glyphs(B, backPlace, u, 0.1, 0.86, 0.016, seed, 0.002);
  AT(BL, keep(T, [0, 1])); AT(BL, keep(B, [0, -1]));
  const c = Math.cos(yaw), s2 = Math.sin(yaw);
  const rect = (u0, v0, u1, v1, ya, yb) => {
    const P = [[u0, v0], [u1, v1]].map(([u, v]) => [x + (c * u + s2 * v) * H, z + (-s2 * u + c * v) * H]);
    col.rect([Math.min(P[0][0], P[1][0]), Math.min(P[0][1], P[1][1]), Math.max(P[0][0], P[1][0]), Math.max(P[0][1], P[1][1])], y + ya * H, y + yb * H);
  };
  rect(-0.19, -0.20, 0.19, 0.30, 0, 0.03);                                                   // the base
  rect(-0.125, -0.105, 0.125, 0.16, 0.03, 0.9);                                              // the king on it, back pillar to the knee and the crowns' base
}
