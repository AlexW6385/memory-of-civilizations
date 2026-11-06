// The great scenes on the jambs of the Hundred-Column Hall's doorways (docs/settlements/persepolis.md
// §11): on the north doorways the audience — the king enthroned under the baldachin, the official
// bowing before him with his hand at his mouth, two incense burners between them, the crown prince
// behind the throne, the winged figure above, guards in registers below; on the south doorways the
// king enthroned on the throne-dais that the peoples of the empire carry in three tiers. In colour
// where traces were found: the winged figure's blue hair and beard, red robe and darker sleeve, the
// rows of its wings red, blue, red over green, red, green with blue eyespots on the long feathers
// (a fragment from this hall); the king's blue beard; the throne's bright blue legs and red ochre
// above them (this hall's south-west doorway); gold leaf on the edge of the king's cloak (the
// Tripylon). The background stays bare stone.
//
// Each figure is drawn facing +u (toward the doorway's outer end) in metres, feet at v = 0.

import { raise, relief, strip, rosette } from './reliefs.js';

const C = 'marble_dark', BLUE = 'paint_blue', RED = 'paint_minoan_red', DARKRED = 'paint_robe', GREEN = 'clay_green', OCHRE = 'stucco_red', GOLD = 'gilt_bronze';

// the king seated, his staff before him; the throne's parts; the crown prince stands behind
const KING = [[-0.08, 0.29], [0.06, 0.29], [0.07, 0.2], [0.38, 0.2], [0.37, 0.26], [0.21, 0.3], [0.2, 0.74], [0.14, 0.84], [-0.1, 0.86], [0.0, 0.98], [0.07, 1.04],
  [0.07, 1.12], [-0.04, 1.12], [-0.1, 1.17], [-0.06, 1.29], [-0.07, 1.4], [-0.04, 1.46], [-0.07, 1.53], [-0.05, 1.58], [-0.02, 1.62], [-0.06, 1.65], [-0.09, 1.71],
  [-0.11, 1.74], [-0.1, 1.99], [-0.42, 1.99], [-0.43, 1.74], [-0.47, 1.66], [-0.52, 1.55], [-0.48, 1.44], [-0.53, 1.32], [-0.6, 1.0], [-0.64, 0.72], [-0.6, 0.68], [-0.1, 0.66]];
const KING_LINES = [[-0.42, 1.78, -0.11, 1.78], [-0.1, 0.86, -0.55, 0.9], [-0.04, 1.12, -0.46, 1.2], [0.0, 0.32, 0.16, 0.72], [0.08, 0.32, 0.18, 0.7]];
const BEARD = [[-0.075, 1.31], [-0.085, 1.4], [-0.065, 1.46], [-0.09, 1.5], [-0.22, 1.49], [-0.25, 1.33]];
const HAIR = [[-0.42, 1.72], [-0.45, 1.65], [-0.49, 1.56], [-0.46, 1.46], [-0.36, 1.5], [-0.33, 1.7]];
const T_BACK = [[-0.79, 0.6], [-0.69, 0.6], [-0.67, 1.48], [-0.62, 1.55], [-0.7, 1.63], [-0.8, 1.55], [-0.77, 1.48]];
const T_SEAT = [[-0.82, 0.6], [-0.01, 0.6], [-0.01, 0.69], [-0.82, 0.69]];
const T_LEG = (x) => [[x - 0.03, 0.6], [x + 0.05, 0.6], [x + 0.04, 0.2], [x + 0.07, 0.11], [x + 0.09, 0], [x - 0.07, 0], [x - 0.05, 0.11], [x - 0.02, 0.2]];
const T_BAR = [[-0.71, 0.27], [-0.11, 0.27], [-0.11, 0.33], [-0.71, 0.33]];
const STOOL = [[0.03, 0], [0.44, 0], [0.44, 0.04], [0.42, 0.19], [0.05, 0.19], [0.03, 0.04]];
const LOTUS = [[0.09, 1.28], [0.15, 1.36], [0.12, 1.37], [0.1, 1.33], [0.08, 1.38], [0.06, 1.36]];
// an incense burner on its tall stand, its lid stepped and conical
const CENSER = [[-0.12, 0], [0.12, 0], [0.05, 0.08], [0.04, 0.7], [0.1, 0.76], [0.11, 0.9], [0.05, 1.05], [0.06, 1.12], [0.0, 1.25], [-0.06, 1.12], [-0.05, 1.05], [-0.11, 0.9], [-0.1, 0.76], [-0.04, 0.7], [-0.05, 0.08]];
// a throne-bearer seen from the front, his arms raised to the tier above; three kinds of headdress
const BEARER = [[-0.14, 0], [-0.03, 0], [-0.02, 0.45], [0.02, 0.45], [0.03, 0], [0.14, 0], [0.12, 0.25], [0.13, 0.55], [0.15, 0.72], [0.19, 0.8], [0.2, 1.1], [0.15, 1.1], [0.14, 0.84],
  [0.1, 0.8], [0.06, 0.82], [0.07, 0.92], [0.05, 0.98], [0.0, 1.0], [-0.05, 0.98], [-0.07, 0.92], [-0.06, 0.82], [-0.1, 0.8], [-0.14, 0.84], [-0.15, 1.1], [-0.2, 1.1], [-0.19, 0.8], [-0.15, 0.72], [-0.13, 0.55], [-0.12, 0.25]];
const HATS = [
  [[-0.065, 0.93], [0.065, 0.93], [0.07, 0.99], [0.0, 1.035], [-0.07, 0.99]],
  [[-0.055, 0.95], [0.055, 0.95], [0.062, 1.06], [-0.062, 1.06]],
  [[-0.075, 0.86], [0.075, 0.86], [0.075, 0.97], [0.0, 1.045], [-0.075, 0.97]],
];
// the throne-dais's leg, with its lion's foot
const DAIS_LEG = (H) => [[-0.13, 0], [0.13, 0], [0.11, 0.1], [0.075, 0.17], [0.075, H - 0.12], [0.11, H], [-0.11, H], [-0.075, H - 0.12], [-0.075, 0.17], [-0.11, 0.1]];
// the winged figure: his upper body rising from the ring, facing +u, one hand raised, the other holding a ring
const GOD = [[-0.1, 0.48], [0.09, 0.48], [0.11, 0.56], [0.2, 0.62], [0.22, 0.67], [0.17, 0.66], [0.1, 0.63], [0.1, 0.68], [0.12, 0.72], [0.1, 0.76], [0.11, 0.8], [0.09, 0.82], [0.09, 0.95], [-0.06, 0.95], [-0.07, 0.82], [-0.1, 0.76], [-0.08, 0.68], [-0.12, 0.62]];
const GOD_BEARD = [[0.075, 0.69], [0.105, 0.72], [0.085, 0.765], [0.0, 0.77], [-0.02, 0.7]];
const GOD_HAIR = [[-0.05, 0.82], [0.0, 0.81], [-0.02, 0.72], [-0.075, 0.72], [-0.085, 0.76], [-0.065, 0.8]];
const GOD_ROBE = [[-0.085, 0.5], [0.075, 0.5], [0.085, 0.6], [0.06, 0.66], [-0.01, 0.68], [-0.1, 0.63]];
const GOD_SLEEVE = [[0.07, 0.585], [0.16, 0.615], [0.17, 0.645], [0.09, 0.625]];

/**
 * Lay one of the scenes on a jamb's inner face: place(u, v, w) maps the face (u across the wall's
 * depth, v up from the floor, w out of the face) to the world; uOut / uIn: the face's outer and inner
 * ends; H: the height up to the lintel; kind: 'audience' | 'throne' | 'king'.
 */
export function jambScene(bag, kind, place, uOut, uIn, H) {
  const o = Math.sign(uOut - uIn), D = Math.abs(uOut - uIn), U = (s) => uOut - o * s;
  const R = (mat, P, key, s, v, d, size = 1, dir = o, lines = null) => raise(bag, mat, P, 'tj-' + key, place, U(s), v, size, dir, d, lines);
  const S = (mat, s0, v0, s1, v1, wd, d) => strip(bag, mat, place, U(s0), v0, U(s1), v1, wd, d);
  // the baldachin over the king: its band of rosettes, its fringe; the posts; the winged figure above
  const canopy = (v0, sk) => {
    const a = 0.55, b = D - 0.12, L = b - a, n = Math.round(L / 0.13), P = [[0, 0.45], [L, 0.45], [L, 0.1]];
    for (let i = n; i > 0; i--) P.push([i * L / n - L / (2 * n), 0.0], [(i - 1) * L / n, 0.1]);
    R(C, P.map(([x, y]) => [-x, y]), 'canopy' + Math.round(L * 100), a, v0, 0.06, 1, o);
    for (let i = 0; i < Math.floor(L / 0.24); i++) rosette(bag, C, place, U(a + 0.12 + i * 0.24), v0 + 0.28, 0.08, 0.1);
    S(C, a, v0 + 0.15, b, v0 + 0.15, 0.03, 0.08);
    for (const s of [a + 0.05, b - 0.05]) S(C, s, sk, s, v0 + 0.02, 0.05, 0.05);
    god(a + L / 2 + 0.05, v0 + 0.47, 0.8);
  };
  const god = (s, v, k) => {
    const Rg = (mat, P, key, d) => R(mat, P.map(([x, y]) => [x * k, y * k]), key + k, s, v, d, 1, o);
    // the ring, in short arcs
    for (let i = 0; i < 14; i++) { const a0 = i * Math.PI / 7, a1 = (i + 1) * Math.PI / 7, r = 0.145 * k; S(C, s - o * 0 + Math.cos(a0) * r * -o, v + 0.38 * k + Math.sin(a0) * r, s + Math.cos(a1) * r * -o, v + 0.38 * k + Math.sin(a1) * r, 0.05 * k, 0.07); }
    // the wings: three short rows over three long, each side
    const rows = [[0.62, 0.66, 0.62, RED], [0.58, 0.62, 0.68, BLUE], [0.54, 0.58, 0.74, RED], [0.49, 0.54, 0.9, GREEN], [0.44, 0.49, 0.96, RED], [0.39, 0.44, 1.0, GREEN]];
    for (const side of [-1, 1]) rows.forEach(([v0, v1, len, mat], i) => {
      const P = side > 0 ? [[0.16, v0], [len, v0 + (i > 2 ? 0.04 : 0.01)], [len - 0.03, v1 + (i > 2 ? 0.05 : 0.01)], [0.15, v1]] : [[-0.16, v0], [-0.15, v1], [-(len - 0.03), v1 + (i > 2 ? 0.05 : 0.01)], [-len, v0 + (i > 2 ? 0.04 : 0.01)]];
      Rg(mat, P, `wing${side}${i}`, 0.05);
      if (i > 2) for (let j = 0; j < 6; j++) { const x = side * (0.3 + j * 0.11) * k; S(BLUE, s - x - 0.02 * k, v + (v0 + 0.012) * k, s - x + 0.02 * k, v + (v0 + 0.012) * k, 0.022 * k, 0.065); }
    });
    // the tail spread below the ring, in three tiers, and the two streamers curling out
    [[0.22, 0.28, 0.1, 0.16, GREEN], [0.14, 0.22, 0.16, 0.22, RED], [0.05, 0.14, 0.22, 0.28, GREEN]].forEach(([v0, v1, w1, w0, mat], i) => Rg(mat, [[-w0, v0], [w0, v0], [w1, v1], [-w1, v1]], 'tail' + i, 0.05));
    for (const side of [-1, 1]) { S(C, s - o * side * 0.08 * k, v + 0.3 * k, s - o * side * 0.38 * k, v + 0.2 * k, 0.025 * k, 0.06); S(C, s - o * side * 0.38 * k, v + 0.2 * k, s - o * side * 0.44 * k, v + 0.27 * k, 0.025 * k, 0.06); }
    // the figure, his robe, sleeve, beard and hair painted; the crown
    Rg(C, GOD, 'god', 0.07);
    Rg(RED, GOD_ROBE, 'godrobe', 0.08); Rg(DARKRED, GOD_SLEEVE, 'godsleeve', 0.085);
    Rg(BLUE, GOD_BEARD, 'godbeard', 0.08); Rg(BLUE, GOD_HAIR, 'godhair', 0.08);
    S(C, s + 0.06 * k, v + 0.86 * k, s - 0.09 * k, v + 0.86 * k, 0.012 * k, 0.08);
  };
  // the king on his throne, his feet on the stool, his staff and lotus; colour where it was found
  const king = (s, v0, k) => {
    const Rk = (mat, P, key, d) => R(mat, P.map(([x, y]) => [x * k, y * k]), key + k, s, v0, d);
    Rk(BLUE, T_LEG(-0.08), 'tlegf', 0.06); Rk(BLUE, T_LEG(-0.73), 'tlegb', 0.06); Rk(BLUE, T_BAR, 'tbar', 0.055);
    Rk(OCHRE, T_SEAT, 'tseat', 0.065); Rk(OCHRE, T_BACK, 'tback', 0.065); Rk(C, STOOL, 'stool', 0.06);
    R(C, KING.map(([x, y]) => [x * k, y * k]), 'king' + k, s, v0, 0.095, 1, o, KING_LINES.map((q) => q.map((c) => c * k)));
    Rk(BLUE, BEARD, 'kbeard', 0.107); Rk(BLUE, HAIR, 'khair', 0.107);
    const sc = (x) => s - x * k;
    S(GOLD, sc(0.175), v0 + 0.33 * k, sc(0.165), v0 + 0.71 * k, 0.018 * k, 0.108);                 // the cloak's edge, gilded
    S(GOLD, sc(-0.05), v0 + 1.13 * k, sc(-0.42), v0 + 1.19 * k, 0.018 * k, 0.108);
    S(C, sc(0.1), v0 + 0.21 * k, sc(0.1), v0 + 1.74 * k, 0.034 * k, 0.11);                              // the staff
    S(C, sc(0.03), v0 + 1.08 * k, sc(0.1), v0 + 1.3 * k, 0.012 * k, 0.11);
    Rk(C, LOTUS, 'lotus', 0.112);
    // the crown prince behind the throne, his hand raised to it
    relief(bag, C, 'persian', place, U(s + 0.62 * k), v0, 1.68 * k, o, 0.05);
  };
  if (kind === 'treasury') {
    // the audience of the Treasury's porticoes, in one register: guards, the official bowing with his hand at his
    // mouth, two incense burners, the king enthroned, the crown prince behind him, attendants and guards
    const v = 0.12;
    S(C, 0.06, v - 0.05, D - 0.06, v - 0.05, 0.05, 0.04);
    for (const s of [0.3, 0.72]) { relief(bag, C, 'persian', place, U(s), v, 1.85, -o, 0.06); S(C, s + 0.14 * 1.85, v, s + 0.14 * 1.85, v + 2.05, 0.03, 0.075); }
    const so = 1.45, ko = 1.9;
    relief(bag, C, 'mede', place, U(so), v, ko, -o, 0.07);
    S(C, so + 0.04 * ko, v + 0.75 * ko, so + 0.115 * ko, v + 0.88 * ko, 0.05, 0.085);
    for (const s of [2.1, 2.45]) R(C, CENSER, 'censer', s, v, 0.07);
    king(3.35, v, 1.32);
    relief(bag, C, 'bearer', place, U(5.0), v, 1.75, o, 0.06);
    for (const s of [5.45, 5.88]) { relief(bag, C, 'persian', place, U(s), v, 1.85, o, 0.06); S(C, s - 0.14 * 1.85, v, s - 0.14 * 1.85, v + 2.05, 0.03, 0.075); }
    S(C, 0.06, Math.min(H - 0.1, v + 2.75), D - 0.06, Math.min(H - 0.1, v + 2.75), 0.06, 0.04);
  } else if (kind === 'king') {
    // the king walking out of his palace, his staff before him, the parasol held over him by the attendant
    // behind, a second carrying the fly whisk and the towel (the Tachara's and the Hadish's main doorways)
    const v = 0.15, kk = Math.min(2.2, H * 0.42), sk = 0.25 * kk + 0.12, sa = sk + 0.3 * kk + 0.2, ka = kk * 0.78;
    S(C, 0.08, v - 0.04, D - 0.08, v - 0.04, 0.05, 0.05);
    relief(bag, C, 'persian', place, U(sk), v, kk, o, 0.09);
    S(GOLD, sk - 0.07 * kk, v + 0.935 * kk, sk + 0.1 * kk, v + 0.935 * kk, 0.03 * kk, 0.1);                       // the crown, gilded, crenellated
    for (let i = 0; i < 4; i++) { const u = sk - 0.055 * kk + i * 0.045 * kk; S(GOLD, u, v + 0.95 * kk, u, v + 1.01 * kk, 0.022 * kk, 0.1); }
    S(GOLD, sk + 0.09 * kk, v + 0.04 * kk, sk + 0.105 * kk, v + 0.34 * kk, 0.012 * kk, 0.1);                       // the robe's gilded edge
    S(C, sk - 0.17 * kk, v, sk - 0.17 * kk, v + 0.98 * kk, 0.03 * kk, 0.11);                                         // the staff
    S(C, sk - 0.15 * kk, v + 0.6 * kk, sk - 0.06 * kk, v + 0.56 * kk, 0.02 * kk, 0.11);
    R(C, LOTUS.map(([x, y]) => [x * kk * 0.6, (y - 1.1) * kk * 0.6 + 0.62 * kk]), 'klotus' + kk, sk + 0.0, v, 0.11);
    if (sa + 0.15 * ka < D - 0.05) {
      relief(bag, C, 'bearer', place, U(sa), v, ka, o, 0.06);
      // the parasol: its pole rising from his hands to the canopy over the king's head, the fringe hanging
      const top = v + kk * 1.12, pr = Math.min(0.5, sk - 0.1);
      S(C, sa - 0.08 * ka, v + 0.55 * ka, sk + 0.02, top + 0.02, 0.035, 0.08);
      const DOME = [[-pr, 0], [pr, 0], [pr * 0.92, 0.08], [pr * 0.55, 0.2], [0, 0.26], [-pr * 0.55, 0.2], [-pr * 0.92, 0.08]];
      R(C, DOME, 'parasol' + Math.round(pr * 100), sk, top, 0.08, 1, o);
      for (let i = 0; i < 7; i++) { const u = sk - pr * 0.9 + i * (1.8 * pr) / 6; S(C, u, top - 0.12, u, top + 0.01, 0.03, 0.085); }
    }
    const sw = sa + 0.3 * ka + 0.15;
    if (sw + 0.15 * ka < D - 0.05) {
      relief(bag, C, 'mede', place, U(sw), v, ka * 0.98, o, 0.06);
      // the fly whisk raised behind the king; the towel over his other arm
      S(C, sw - 0.1 * ka, v + 0.62 * ka, sw - 0.32 * ka, v + 1.08 * ka, 0.025, 0.08);
      R(C, [[0, 0], [0.06, 0.02], [0.12, 0.16], [0.02, 0.22], [-0.05, 0.12]].map(([x, y]) => [x * ka, y * ka]), 'whisk' + ka, sw - 0.32 * ka, v + 1.08 * ka, 0.085, 1, o);
      R(C, [[-0.05, 0], [0.05, 0], [0.04, 0.22], [-0.04, 0.22]].map(([x, y]) => [x * ka, y * ka]), 'towel' + ka, sw + 0.1 * ka, v + 0.38 * ka, 0.075, 1, o);
    }
  } else if (kind === 'audience') {
    // the guards in five registers, Persians and Medes by turns, spears upright
    const reg = 0.66, n = Math.max(2, Math.floor((D - 0.3) / 0.62));
    for (let r = 0; r < 5; r++) {
      const v = 0.15 + r * (reg + 0.06);
      S(C, 0.08, v - 0.04, D - 0.08, v - 0.04, 0.05, 0.05);
      for (let i = 0; i < n; i++) { const s = 0.35 + i * (D - 0.6) / (n - 1); relief(bag, C, (r + i) % 2 ? 'mede' : 'persian', place, U(s), v, reg * 0.95, o, 0.05); S(C, s - 0.08, v, s - 0.08, v + reg, 0.022, 0.07); }
    }
    const g = 0.15 + 5 * (reg + 0.06);
    S(C, 0.08, g - 0.04, D - 0.08, g - 0.04, 0.06, 0.06);
    king(D - 1.15, g + 0.02, 1.15);
    for (const s of [1.55, 1.95]) R(C, CENSER, 'censer', s, g + 0.02, 0.07);
    // the official bowing, his hand at his mouth
    const so = 0.75, ko = 1.75;
    relief(bag, C, 'mede', place, U(so), g + 0.02, ko, -o, 0.07);
    S(C, so + 0.04 * ko, g + 0.02 + 0.75 * ko, so + 0.115 * ko, g + 0.02 + 0.88 * ko, 0.05, 0.085);
    canopy(Math.min(H - 1.35, g + 2.75), g + 0.02);
  } else {
    // the throne-dais carried in three tiers by the peoples of the empire, between its lion-footed legs
    const v0 = 0.15, th = 1.1, bandH = 0.12, a = 0.95, b = D - 0.45;
    for (const s of [a, b]) R(BLUE, DAIS_LEG(3 * (th + bandH)), 'daisleg', s, v0, 0.06);
    for (let t = 0; t < 3; t++) {
      const v = v0 + t * (th + bandH), n = Math.max(2, Math.floor((b - a - 0.3) / 0.46));
      for (let i = 0; i < n; i++) {
        const s = a + 0.3 + i * (b - a - 0.6) / (n - 1);
        R(C, BEARER, 'bearer', s, v, 0.06);
        R(C, HATS[(t + i) % 3], 'hat' + ((t + i) % 3), s, v, 0.07);
        S(C, s - 0.13, v + 0.5, s + 0.13, v + 0.5, 0.025, 0.07);
      }
      S(t === 2 ? OCHRE : C, a - 0.12, v + th + bandH / 2, b + 0.12, v + th + bandH / 2, bandH, 0.075);
    }
    const g = v0 + 3 * (th + bandH);
    king(D - 1.25, g, 1.05);
    canopy(Math.min(H - 1.35, g + 2.55), g);
  }
}
