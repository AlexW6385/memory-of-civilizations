// The modelled standing Buddha of the Ananda's four niches, and the kneeling donors (docs/settlements/bagan.md §14), in the figure's own frame (metres; x to the viewer's right,
// y up, z toward the viewer; the soles at y = 0 on the lotus). About 6.5 m to the top of the ushnisha. Gilded teak: the robe 'gold', the flesh 'gilt_bronze', the hair and the
// eyes' slits 'lacquer_black', the lips 'lacquer_red'. `fine` adds what shows within a few metres (curls, toes, nails, lids, nostrils, the neck's rings).
import { Kit, tube, blob, blobDir, sheet, rodT, loft, hash3, add, sub, mul, norm, cross, TAU } from './sculpt.js';

const RB = [  // the robe: y, half-width, half-depth, centre z
  [0, 0.80, 0.50, 0], [0.3, 0.74, 0.47, 0], [1.0, 0.70, 0.45, 0], [2.0, 0.69, 0.44, 0], [2.9, 0.74, 0.46, 0.01], [3.5, 0.70, 0.43, 0.02],
  [4.1, 0.82, 0.45, 0.03], [4.55, 0.98, 0.48, 0.03], [4.85, 1.12, 0.44, 0.0], [5.0, 0.95, 0.36, -0.02], [5.1, 0.55, 0.28, -0.03], [5.2, 0.21, 0.2, -0.03],
];

/** The standing robe: folds that hang from the chest and run to the hem, which flares out at the sides in a wavy edge. */
function robe(S, fine, seed) {
  const ys = []; const N = fine ? 26 : 18;
  for (let i = 0; i < N; i++) ys.push(0.02 + (5.2 - 0.02) * Math.pow(i / (N - 1), 0.85));
  loft(S, RB, ys, fine ? 120 : 72, {
    p: 2.4,
    mod: (y, th) => {
      const front = 0.55 + 0.45 * Math.max(0, Math.sin(th)), a = (0.075 + 0.07 * (1 - Math.min(1, y / 4.5))) * front;
      const ph = 0.55 * Math.sin(y * 1.1 + seed) + 0.25 * Math.sin(y * 2.3);
      let f = 1 + a * Math.cos(12 * th + ph) + a * 0.45 * Math.cos(19 * th - ph * 1.7);
      if (y < 0.9) { const k = 1 - y / 0.9; f *= 1 + 0.4 * k * k * (0.3 + 0.7 * Math.pow(Math.abs(Math.cos(th)), 1.3)) + 0.035 * k * Math.cos(9 * th + seed); }
      return f;
    },
  });
}

/** A hand: a palm, four fingers and a thumb; `dir` the way the fingers point, `nrm` the palm's face. curl 0 (straight) … 1 (bent in). */
function hand(K, c, dir, nrm, { curl = 0, thumb = 0.4, fine = false, size = 1.25 } = {}) {
  const B = K.S('gilt_bronze'), d = norm(dir); let n = sub(nrm, mul(d, nrm[0] * d[0] + nrm[1] * d[1] + nrm[2] * d[2])); n = norm(n);
  const side = norm(cross(d, n)), L = 0.17 * size;
  blobDir(B, add(c, mul(d, L * 0.9)), d, L, 0.15 * size, 0.045 * size, n, 5, 8);
  const lens = [0.3, 0.35, 0.33, 0.25];
  for (let i = 0; i < 4; i++) {
    const o = (i - 1.5) * 0.074 * size, base = add(add(c, mul(d, L * 1.7)), mul(side, o)), l = lens[i] * size, cu = curl * (0.4 + 0.2 * (i % 2));
    const mid = add(add(base, mul(d, l * 0.52)), mul(n, -cu * l * 0.35)), tip = add(add(base, mul(d, l * (1 - cu * 0.4))), mul(n, -cu * l * 0.8));
    tube(B, [[...base, 0.04 * size], [...mid, 0.036 * size], [...tip, 0.027 * size]], { seg: fine ? 7 : 5, sub: 1, capN: 1, ref: n });
    if (fine) K.x(() => { blobDir(K.S('gold'), add(tip, mul(d, 0.004)), d, 0.03 * size, 0.022 * size, 0.012 * size, n, 3, 6); });  // the nail
  }
  const tb = add(add(c, mul(d, L * 0.6)), mul(side, -0.13 * size));
  tube(B, [[...tb, 0.05 * size], [...add(add(tb, mul(d, 0.13 * size)), add(mul(side, -0.06 * size), mul(n, -thumb * 0.1 * size))), 0.04 * size], [...add(add(tb, mul(d, 0.26 * size)), add(mul(side, 0.0), mul(n, -thumb * 0.2 * size))), 0.032 * size]], { seg: 6, sub: 1, capN: 1, ref: n });
}

/** The face and head laid on the skull's own surface. */
function head(K, fine, seed) {
  const B = K.S('gilt_bronze'), R = K.S('lacquer_red'), BK = K.S('lacquer_black'), G = K.S('gold');
  const hc = [0, 5.68, 0.04], hr = [0.37, 0.47, 0.40];
  const surf = (u, v) => hc[2] + hr[2] * Math.sqrt(Math.max(0.03, 1 - (u / hr[0]) ** 2 - (v / hr[1]) ** 2));
  const on = (u, v, up = 0) => [u, hc[1] + v, surf(u, v) + up];
  blob(B, hc, hr, fine ? 12 : 9, fine ? 22 : 16);
  blob(B, on(0, -0.36, -0.14), [0.17, 0.12, 0.12], 4, 8);                                                    // the chin
  for (const s of [-1, 1]) {
    blob(B, on(s * 0.2, -0.13, -0.02), [0.13, 0.11, 0.08], 4, 8);                                           // the cheeks
    tube(B, [[...on(s * 0.04, 0.19, 0.012), 0.018, 0.016], [...on(s * 0.17, 0.215, 0.014), 0.02, 0.017], [...on(s * 0.31, 0.14, 0.0), 0.017, 0.015]], { seg: 6, sub: 2, capN: 1, ref: [0, 0, 1] });   // the brow
    blob(B, on(s * 0.16, 0.085, 0.004), [0.09, 0.03, 0.03], 3, 8);                                           // the upper lid, lowered
    blob(BK, on(s * 0.16, 0.058, 0.008), [0.07, 0.009, 0.01], 3, 8);                                         // the slit under it
    if (fine) K.x(() => { blob(B, on(s * 0.16, 0.04, 0.003), [0.07, 0.012, 0.016], 3, 6); });  // the lower lid
    blob(B, on(s * 0.062, -0.1, 0.03), [0.036, 0.034, 0.036], 4, 6);                                         // the nostril's wing
    blob(B, on(s * 0.145, -0.245, 0.0), [0.02, 0.02, 0.016], 3, 5);                                          // the dimple of the smile
    // the long ear: a thin plate from the brow to the jaw, the lobe hanging
    tube(B, [[s * 0.365, 5.84, 0.0, 0.06, 0.022], [s * 0.405, 5.58, 0.0, 0.075, 0.026], [s * 0.4, 5.3, 0.02, 0.05, 0.03]], { seg: 8, sub: 2, capN: 1, ref: [0, 0, 1] });
    if (fine) K.x(() => { tube(B, [[s * 0.4, 5.62, 0.04, 0.012, 0.012], [s * 0.37, 5.55, 0.045, 0.01, 0.01]], { seg: 5, sub: 1, capN: 1 }); });  // the ear's rim
  }
  blob(B, on(0, -0.02, 0.025), [0.05, 0.14, 0.065], 5, 8);                                                  // the nose's ridge
  blob(B, on(0, -0.1, 0.07), [0.058, 0.05, 0.055], 4, 8);                                                   // its tip
  tube(R, [[...on(-0.13, -0.225, 0.014), 0.012, 0.011], [...on(-0.06, -0.246, 0.032), 0.02, 0.014], [...on(0, -0.235, 0.036), 0.021, 0.014], [...on(0.06, -0.246, 0.032), 0.02, 0.014], [...on(0.13, -0.225, 0.014), 0.012, 0.011]], { seg: 7, sub: 2, capN: 1, ref: [0, 0, 1] });   // the upper lip: the corners lifted in the smile
  tube(R, [[...on(-0.1, -0.265, 0.01), 0.012, 0.01], [...on(-0.04, -0.285, 0.03), 0.024, 0.015], [...on(0.04, -0.285, 0.03), 0.024, 0.015], [...on(0.1, -0.265, 0.01), 0.012, 0.01]], { seg: 7, sub: 2, capN: 1, ref: [0, 0, 1] });   // the lower lip
  blob(G, on(0, 0.17, 0.016), [0.022, 0.022, 0.016], 3, 6);                                                 // the urna
  if (fine) K.x(() => { for (const s of [-1, 1]) blob(BK, on(s * 0.03, -0.112, 0.105), [0.012, 0.01, 0.01], 3, 5); });  // the nostrils
  // the hair: a cap over the skull, its edge low at the back and high on the brow; ripples for the rows of curls
  const rows = [], NR = fine ? 8 : 6, NC = fine ? 32 : 22;
  for (let i = 0; i <= NR; i++) {
    const row = [];
    for (let j = 0; j < NC; j++) {
      const th = j / NC * TAU, sn = Math.sin(th), phiMax = (50 + 58 * (1 - (sn + 1) / 2)) * Math.PI / 180, ph = phiMax * i / NR;
      const k = 1.04 + (fine ? 0 : 0.018 * Math.cos(th * 14) * Math.cos(ph * 9));
      row.push([hc[0] + hr[0] * k * Math.sin(ph) * Math.cos(th), hc[1] + hr[1] * k * Math.cos(ph) + 0.005, hc[2] - 0.01 + hr[2] * k * Math.sin(ph) * sn]);
    }
    rows.push(row);
  }
  BK.grid(rows);
  blob(BK, [0, 6.2, -0.02], [0.23, 0.25, 0.235], fine ? 8 : 6, fine ? 18 : 12);                          // the ushnisha
  tube(G, [[0, 6.42, -0.02, 0.07, 0.07], [0, 6.56, -0.02, 0.05, 0.05], [0, 6.78, -0.02, 0.012, 0.012]], { seg: 8, sub: 2, capN: 1 });   // the flame on it
  if (fine) K.x(() => {
    // the curls: little snail-shells in rows over the cap and the ushnisha
    for (let r = 1; r <= 7; r++) {
      const ph = r * 0.17, ringN = Math.max(7, Math.round(30 * Math.sin(ph)));
      for (let k = 0; k < ringN; k++) {
        const th = (k + (r % 2) * 0.5) / ringN * TAU, sn = Math.sin(th), phiMax = (50 + 58 * (1 - (sn + 1) / 2)) * Math.PI / 180 - 0.1;
        if (ph > phiMax) continue;
        const j = (hash3(k, r, seed) - 0.5) * 0.02, c = [hc[0] + (hr[0] * 1.07) * Math.sin(ph) * Math.cos(th), hc[1] + hr[1] * 1.07 * Math.cos(ph), hc[2] + hr[2] * 1.07 * Math.sin(ph) * sn + j];
        blob(BK, c, [0.034, 0.03, 0.034], 3, 5);
      }
    }
    for (let r = 0; r < 3; r++) for (let k = 0; k < 8 - r * 2; k++) { const th = (k + r * 0.5) / (8 - r * 2) * TAU, ph = 0.35 + r * 0.45; blob(BK, [0.245 * Math.sin(ph) * Math.cos(th), 6.2 + 0.265 * Math.cos(ph), -0.02 + 0.25 * Math.sin(ph) * Math.sin(th)], [0.032, 0.03, 0.032], 3, 5); }
  });
}

/** The lotus pedestal: hanging petals under, turned-up petals over, the top a flat disc (radius 1.25 across, 0.95 deep) at y = 0. */
function lotus(K, fine, seed) {
  const S = K.S('gilt_bronze'), n = fine ? 56 : 36;
  loft(S, [[-0.36, 1.0, 0.76, 0, 0], [-0.31, 1.18, 0.88, 0, 0], [-0.22, 1.22, 0.93, 0, 0], [-0.15, 1.08, 0.84, 0, 0]], [-0.36, -0.33, -0.28, -0.22, -0.17, -0.15], n, { p: 2, mod: (y, th) => 1 + 0.05 * Math.cos(th * 14 + seed) * (y < -0.2 ? 1 : 0.4) });
  loft(S, [[-0.17, 1.0, 0.78, 0, 0], [-0.12, 1.2, 0.92, 0, 0], [-0.05, 1.27, 0.96, 0, 0], [0.0, 1.19, 0.9, 0, 0]], [-0.17, -0.14, -0.1, -0.05, -0.01], n, { p: 2, mod: (y, th) => 1 + 0.07 * Math.pow(Math.abs(Math.cos(th * 7 + seed * 0.3)), 0.55) * (y > -0.12 ? 1 : 0.5) });
}

/** The halo: a flame-edged plate behind the head, on a stem from the back. */
function halo(K, seed) {
  const G = K.S('gold'), c = [0, 5.78, -0.55], R = (th) => 1.0 + 0.13 * Math.pow(Math.abs(Math.cos(th * 9 + seed * 0.1)), 1.6);
  sheet(G, (u, v) => { const th = v * TAU, r = (0.12 + u * 0.88) * R(th); return [c[0] + r * Math.cos(th), c[1] + r * Math.sin(th) * 1.05, c[2] + 0.04 * (1 - u) + 0.03 * Math.sin(u * 9)]; }, 6, 72, [0, 0, 1]);
  tube(K.S('gilt_bronze'), [[0, 4.6, -0.3, 0.07, 0.07], [0, 5.3, -0.45, 0.06, 0.06], [0, 5.7, -0.55, 0.05, 0.05]], { seg: 6, sub: 2, capN: 1 });
}

/** pose: 'dhamma' (the first sermon, both hands before the chest), 'hang' (both arms down, palms out), 'abhaya' (the right hand raised, the left in varada holding the pill). */
export function standingBuddha(K, pose, fine, seed = 1) {
  const G = K.S('gold'), B = K.S('gilt_bronze');
  lotus(K, fine, seed);
  // the feet at the hem, the toes
  for (const s of [-1, 1]) {
    blobDir(B, [s * 0.3, 0.1, 0.5], [0, 0, 1], 0.4, 0.15, 0.09, [0, 1, 0], 5, 9);
    if (fine) K.x(() => { for (let t = 0; t < 5; t++) blob(B, [s * 0.3 + (t - 2) * 0.062 * (s > 0 ? 1 : -1) * -1, 0.075, 0.9 - Math.abs(t - 1.5) * 0.012], [0.03, 0.03, 0.04], 3, 5); });
  }
  robe(G, fine, seed);
  // the border of the sanghati across the chest from the left shoulder, and the pendant fold falling from it
  tube(G, [[0.78, 4.86, 0.2, 0.05, 0.035], [0.4, 4.5, 0.47, 0.05, 0.035], [0.0, 4.1, 0.52, 0.05, 0.035], [-0.35, 3.6, 0.5, 0.05, 0.035], [-0.5, 3.0, 0.5, 0.05, 0.035]], { seg: 6, sub: 2, capN: 1, ref: [0, 0, 1] });
  // the neck with its rings
  tube(B, [[0, 5.0, 0.0, 0.21, 0.2], [0, 5.2, 0.01, 0.19, 0.185], [0, 5.38, 0.02, 0.18, 0.18]], { seg: 10, sub: 2, capN: 1, ref: [1, 0, 0] });
  if (fine) K.x(() => { for (const y of [5.13, 5.25, 5.35]) tube(B, Array.from({ length: 13 }, (_, k) => { const a = k / 12 * TAU; return [0.205 * Math.cos(a), y, 0.01 + 0.2 * Math.sin(a), 0.014, 0.012]; }), { seg: 5, sub: 1, capN: 1, ref: [0, 1, 0] }); });
  head(K, fine, seed);
  halo(K, seed);
  // the arms: the robe's sleeve to the wrist and a cuff, then the hand
  const arm = (s, el, wr) => {
    tube(G, [[s * 1.0, 4.7, 0.02, 0.23, 0.22], [(s * 1.0 + el[0]) / 2 + s * 0.08, (4.7 + el[1]) / 2, (el[2]) / 2, 0.215, 0.205], [...el, 0.2, 0.19], [...wr, 0.11, 0.1]], { seg: fine ? 12 : 8, sub: 2, capN: 2, ref: [0, 0, 1], fold: (t, th) => 1 + 0.07 * Math.cos(th * 3 + t * 4) });
  };
  const pill = (c) => blob(G, c, [0.07, 0.07, 0.07], 4, 8);
  if (pose === 'dhamma') {
    arm(-1, [-1.2, 3.8, 0.28], [-0.5, 4.3, 0.74]); arm(1, [1.2, 3.8, 0.28], [0.52, 4.22, 0.7]);
    hand(K, [-0.45, 4.38, 0.76], [-0.1, 0.9, 0.2], [0, 0.2, 1], { curl: 0.1, thumb: 0.9, fine });           // the right, palm out, thumb and finger meeting
    hand(K, [0.42, 4.2, 0.78], [-0.15, 0.85, 0.1], [0, -0.1, -1], { curl: 0.25, thumb: 0.3, fine });       // the left, palm in
  } else if (pose === 'hang') {
    arm(-1, [-1.25, 3.7, 0.2], [-1.35, 2.75, 0.5]); arm(1, [1.25, 3.7, 0.2], [1.35, 2.75, 0.5]);
    hand(K, [-1.35, 2.72, 0.52], [0, -1, 0.2], [0, 0.2, 1], { curl: 0.05, thumb: 0.5, fine });             // both palms out, fingers down: varada
    hand(K, [1.35, 2.72, 0.52], [0, -1, 0.2], [0, 0.2, 1], { curl: 0.05, thumb: 0.5, fine });
    pill([1.35, 2.2, 0.66]);
  } else {
    arm(-1, [-1.2, 3.85, 0.26], [-1.0, 4.75, 0.5]); arm(1, [1.25, 3.7, 0.2], [1.32, 2.75, 0.5]);
    hand(K, [-1.0, 4.9, 0.52], [0.05, 1, 0.1], [0, 0, 1], { curl: 0, thumb: 0.2, fine });                    // abhaya: the right hand raised, palm out
    hand(K, [1.32, 2.72, 0.52], [0, -1, 0.2], [0, 0.2, 1], { curl: 0.1, thumb: 0.5, fine });                // varada, the left, with the pill
    pill([1.33, 2.28, 0.7]);
  }
}

/** A kneeling donor, hands joined before the breast (about 1.05 m): the king in his crown, or the monk with the shaven head. */
export function kneeler(K, kind, fine) {
  const robeM = kind === 'king' ? 'gold' : 'lacquer_red', G = K.S(robeM), B = K.S('gilt_bronze');
  // the shins and heels folded under, the thighs and the lap, the robe pooled at the knees
  blob(G, [0, 0.14, -0.12], [0.3, 0.14, 0.36], 5, 10);
  for (const s of [-1, 1]) tube(G, [[s * 0.16, 0.2, 0.05, 0.12, 0.1], [s * 0.18, 0.2, 0.28, 0.1, 0.09], [s * 0.18, 0.1, 0.38, 0.09, 0.07]], { seg: 8, sub: 2, capN: 1, ref: [0, 1, 0] });
  // the body leaning a little to the Buddha, the arms to the joined hands
  tube(G, [[0, 0.22, -0.08, 0.27, 0.19], [0, 0.5, -0.03, 0.22, 0.16], [0, 0.72, 0.0, 0.25, 0.14]], { seg: 10, sub: 2, capN: 2, ref: [1, 0, 0], fold: (t, th) => 1 + 0.045 * Math.cos(th * 8 + t * 3) });
  for (const s of [-1, 1]) tube(G, [[s * 0.25, 0.7, 0.0, 0.07, 0.065], [s * 0.3, 0.52, 0.1, 0.065, 0.06], [s * 0.1, 0.56, 0.3, 0.055, 0.05]], { seg: 7, sub: 2, capN: 1 });
  blob(B, [0, 0.62, 0.33], [0.075, 0.1, 0.045], 4, 8);                                                       // the hands joined
  tube(B, [[0, 0.8, -0.02, 0.07, 0.07], [0, 0.88, -0.01, 0.065, 0.065]], { seg: 7, sub: 1, capN: 1 });
  const hc = [0, 1.0, 0.02];
  blob(B, hc, [0.105, 0.13, 0.115], fine ? 8 : 6, fine ? 14 : 10);
  for (const s of [-1, 1]) { blob(B, [s * 0.108, 1.0, 0.02], [0.016, 0.05, 0.03], 3, 6); blob(K.S('lacquer_black'), [s * 0.038, 1.04, 0.125], [0.028, 0.008, 0.01], 3, 5); }
  blob(B, [0, 0.99, 0.13], [0.018, 0.035, 0.02], 3, 6);
  blob(K.S('lacquer_red'), [0, 0.94, 0.122], [0.035, 0.009, 0.012], 3, 6);
  if (kind === 'king') {
    // the crown: a pointed tiered cap with a band
    tube(K.S('gold'), [[0, 1.1, 0.02, 0.115, 0.12], [0, 1.2, 0.02, 0.1, 0.1], [0, 1.3, 0.02, 0.07, 0.07], [0, 1.4, 0.02, 0.03, 0.03], [0, 1.48, 0.02, 0.004, 0.004]], { seg: 10, sub: 2, capN: 1, ref: [1, 0, 0] });
    blob(K.S('lacquer_red'), [0, 1.1, 0.02], [0.125, 0.03, 0.13], 3, 12);
  } else blob(B, [0, 1.12, 0.02], [0.1, 0.045, 0.108], 3, 10);                                                  // the shaven skull
}
