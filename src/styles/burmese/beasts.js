// The guardians of the porches' entrances (docs/settlements/bagan.md §14): the chinthe, the lion seated on its plinth, and the stucco guardian seated with a sword planted between his feet.
// In the figure's own frame (metres; x to the viewer's right, y up, z toward the viewer; the ground at y = 0). `fine` adds teeth, claws, bells and the mane's second rows.
import { tube, blob, blobDir, hash3, TAU } from './sculpt.js';

/** The chinthe: haunches folded, the fore-legs straight, the chest broad, the mane in rows of curls round the head, the mouth open, the tail curled over the back; s scales it. */
export function chinthe(K, fine, seed = 0) {
  const W = K.S('stucco_ochre'), C = K.S('limewash_white'), R = K.S('lacquer_red'), Y = K.S('paint_ochre'), BK = K.S('lacquer_black'), GB = K.S('gilt_bronze'), PL = K.S('brick_baked');
  const j = (a) => 1 + 0.03 * (hash3(seed, a, 7) - 0.5);
  // the plinth: a brick base with a stucco cap
  PL.box(-0.9, 0, -1.0, 0.9 * j(1), 0.7, 1.0); K.S('stucco_ochre').box(-0.96, 0.7, -1.06, 0.96, 0.82, 1.06 * j(2));
  const y0 = 0.82;
  // the hind quarters: the haunches, the thighs folded, the hind feet before them
  for (const s of [-1, 1]) {
    blob(W, [s * 0.4, y0 + 0.5, -0.5], [0.3, 0.5, 0.5], 6, 10);
    blobDir(W, [s * 0.42, y0 + 0.08, -0.08], [0, 0, 1], 0.3, 0.14, 0.09, [0, 1, 0], 4, 8);
    if (fine) K.x(() => { for (let t = -1; t <= 1; t++) blob(W, [s * 0.42 + t * 0.07, y0 + 0.04, 0.2], [0.03, 0.03, 0.05], 3, 4); });
  }
  // the back rising to the shoulders, the chest
  tube(W, [[0, y0 + 0.75, -0.8, 0.5, 0.42], [0, y0 + 0.95, -0.4, 0.52, 0.46], [0, y0 + 1.1, 0.05, 0.55, 0.48]], { seg: 10, sub: 2, capN: 2, ref: [1, 0, 0] });
  blob(W, [0, y0 + 0.9, 0.2], [0.55, 0.58, 0.46], 6, 12);
  // the fore-legs, straight, with the paws
  for (const s of [-1, 1]) {
    tube(W, [[s * 0.28, y0 + 1.0, 0.18, 0.17, 0.16], [s * 0.27, y0 + 0.5, 0.3, 0.14, 0.13], [s * 0.27, y0 + 0.1, 0.36, 0.13, 0.12]], { seg: 9, sub: 2, capN: 1, ref: [1, 0, 0] });
    blobDir(W, [s * 0.27, y0 + 0.06, 0.52], [0, 0, 1], 0.2, 0.17, 0.08, [0, 1, 0], 4, 8);
    if (fine) K.x(() => { for (let t = -1; t <= 1; t++) blob(C, [s * 0.27 + t * 0.07, y0 + 0.04, 0.7], [0.025, 0.025, 0.04], 3, 4); });
  }
  // the mane: rings of curls round the head and down the chest
  const hc = [0, y0 + 1.5, 0.35], rings = [[0.42, 9], [0.64, 14]];
  rings.forEach(([r, n], i) => {
    for (let k = 0; k < n; k++) {
      const a = (k + (i % 2) * 0.5) / n * TAU, rr = r * (1 + 0.06 * (hash3(k, i, seed) - 0.5));
      blob(i ? W : C, [hc[0] + rr * Math.cos(a), hc[1] + rr * Math.sin(a) * 0.95 - i * 0.04, hc[2] - 0.05 - i * 0.08], [0.19 + 0.03 * i, 0.21 + 0.03 * i, 0.15], 2, 6);
    }
  });
  if (fine) K.x(() => { for (let k = 0; k < 17; k++) { const a = (k + 0.5) / 17 * TAU, rr = 0.9 * (1 + 0.06 * (hash3(k, 2, seed) - 0.5)); blob(C, [hc[0] + rr * Math.cos(a), hc[1] + rr * Math.sin(a) * 0.95 - 0.08, hc[2] - 0.26], [0.17, 0.19, 0.1], 3, 5); } });   // the outer row of the mane
  // the head: the skull, the brow, the bulging eyes, the snout, the open mouth with its jaw and teeth
  blob(W, [0, y0 + 1.55, 0.45], [0.4, 0.36, 0.4], 7, 12);
  tube(W, [[-0.28, y0 + 1.72, 0.65, 0.05, 0.04], [0, y0 + 1.76, 0.72, 0.06, 0.045], [0.28, y0 + 1.72, 0.65, 0.05, 0.04]], { seg: 7, sub: 2, capN: 1, ref: [0, 1, 0] });
  for (const s of [-1, 1]) {
    blob(W, [s * 0.17, y0 + 1.64, 0.68], [0.085, 0.085, 0.075], 4, 8); blob(Y, [s * 0.17, y0 + 1.64, 0.745], [0.05, 0.05, 0.03], 3, 6); blob(BK, [s * 0.17, y0 + 1.64, 0.768], [0.022, 0.022, 0.012], 3, 5);
    blob(W, [s * 0.3, y0 + 1.8, 0.4], [0.07, 0.12, 0.04], 4, 6);                                         // the ears
    blob(W, [s * 0.2, y0 + 1.44, 0.7], [0.1, 0.08, 0.1], 4, 6);                                           // the cheeks
  }
  blobDir(W, [0, y0 + 1.5, 0.86], [0, -0.15, 1], 0.2, 0.17, 0.12, [0, 1, 0], 5, 10);                     // the upper jaw and nose
  blob(BK, [0, y0 + 1.58, 1.04], [0.06, 0.04, 0.03], 3, 6);
  blobDir(R, [0, y0 + 1.37, 0.8], [0, 0, 1], 0.2, 0.15, 0.04, [0, 1, 0], 3, 8);                          // the mouth's red
  blobDir(W, [0, y0 + 1.27, 0.82], [0, 0.05, 1], 0.19, 0.13, 0.05, [0, 1, 0], 4, 8);                     // the lower jaw
  if (fine) K.x(() => { for (const s of [-1, 1]) { for (const t of [0.05, 0.12]) blobDir(W, [s * t * 2.2, y0 + 1.36, 0.95], [0, -1, 0.1], 0.045, 0.02, 0.02, [0, 0, 1], 3, 5); blobDir(W, [s * 0.1, y0 + 1.4, 0.88], [0, 1, 0.1], 0.04, 0.02, 0.02, [0, 0, 1], 3, 5); } });
  // the collar of bells on the chest, the crest on the head, the tail curled up behind
  tube(GB, Array.from({ length: 13 }, (_, k) => { const a = k / 12 * Math.PI; return [0.5 * Math.cos(a), y0 + 1.1 - 0.5 * Math.sin(a), 0.3 + 0.2 * Math.sin(a) * 0.4, 0.03, 0.03]; }).map((p) => [p[0], p[1] + 0.35, p[2] + 0.12, p[3], p[4]]), { seg: 5, sub: 1, capN: 1 });
  if (fine) K.x(() => { for (let k = 1; k < 12; k += 2) { const a = k / 12 * Math.PI; blob(GB, [0.5 * Math.cos(a), y0 + 1.45 - 0.5 * Math.sin(a) - 0.06, 0.42 + 0.08 * Math.sin(a)], [0.04, 0.05, 0.04], 3, 6); } });
  tube(W, [[0, y0 + 1.82, 0.38, 0.05, 0.12], [0, y0 + 2.0, 0.3, 0.04, 0.1], [0, y0 + 2.12, 0.18, 0.02, 0.06]], { seg: 6, sub: 2, capN: 1, ref: [1, 0, 0] });
  tube(W, [[0, y0 + 0.35, -0.95, 0.07, 0.07], [0, y0 + 0.5, -1.18, 0.08, 0.08], [0, y0 + 1.0, -1.22, 0.08, 0.08], [0, y0 + 1.5, -1.05, 0.07, 0.07], [0, y0 + 1.75, -0.85, 0.06, 0.06]], { seg: 6, sub: 3, capN: 1, ref: [1, 0, 0] });
  blob(C, [0, y0 + 1.82, -0.8], [0.12, 0.16, 0.12], 4, 7);
}

/** A seated stucco guardian: on a low plinth, thighs forward and shins down, the sword planted between the feet, both hands on its pommel; a high cap, a moustache, the sash across the chest. */
export function guardian(K, fine, seed = 0) {
  const W = K.S('limewash_white'), F = K.S('stucco_ochre'), BK = K.S('lacquer_black'), GB = K.S('gilt_bronze'), R = K.S('lacquer_red'), PL = K.S('brick_baked'), C = K.S('limewash_white');
  PL.box(-0.62, 0, -0.55, 0.62, 0.5, 0.62 + 0.02 * hash3(seed, 1, 1)); C.box(-0.68, 0.5, -0.6, 0.68, 0.58, 0.68);
  const y0 = 0.58;
  // the seat's block, the thighs forward, the shins down to the feet
  blob(W, [0, y0 + 0.12, -0.15], [0.34, 0.14, 0.3], 4, 10);
  for (const s of [-1, 1]) {
    tube(W, [[s * 0.2, y0 + 0.38, -0.2, 0.15, 0.14], [s * 0.24, y0 + 0.42, 0.14, 0.13, 0.12], [s * 0.26, y0 + 0.36, 0.38, 0.12, 0.11]], { seg: 8, sub: 2, capN: 2, ref: [0, 1, 0] });
    tube(F, [[s * 0.26, y0 + 0.34, 0.42, 0.09, 0.09], [s * 0.27, y0 + 0.12, 0.46, 0.07, 0.07], [s * 0.27, y0 + 0.03, 0.46, 0.065, 0.065]], { seg: 7, sub: 2, capN: 1 });
    blobDir(F, [s * 0.27, y0 + 0.03, 0.6], [0, 0, 1], 0.14, 0.1, 0.045, [0, 1, 0], 3, 8);
  }
  // the body: waist, the chest, the shoulders; the sash from the shoulder across to the hip
  tube(W, [[0, y0 + 0.4, -0.2, 0.28, 0.2], [0, y0 + 0.75, -0.2, 0.26, 0.19], [0, y0 + 1.1, -0.2, 0.34, 0.2]], { seg: 10, sub: 2, capN: 2, ref: [1, 0, 0], fold: (t, th) => 1 + 0.05 * Math.cos(th * 7 + t * 3) });
  tube(R, [[0.28, y0 + 1.2, -0.02, 0.05, 0.03], [0.05, y0 + 0.9, 0.0, 0.05, 0.03], [-0.2, y0 + 0.55, 0.0, 0.05, 0.03]], { seg: 6, sub: 2, capN: 1, ref: [0, 0, 1] });
  tube(GB, [[-0.28, y0 + 0.52, 0.0, 0.04, 0.03], [0, y0 + 0.5, 0.03, 0.04, 0.03], [0.28, y0 + 0.52, 0.0, 0.04, 0.03]], { seg: 6, sub: 2, capN: 1, ref: [0, 1, 0] });
  // the arms to the pommel of the sword: from each shoulder down and forward
  for (const s of [-1, 1]) {
    tube(W, [[s * 0.38, y0 + 1.1, -0.2, 0.1, 0.1], [s * 0.38, y0 + 0.8, -0.05, 0.085, 0.085], [s * 0.14, y0 + 0.62, 0.3, 0.075, 0.07]], { seg: 7, sub: 2, capN: 1 });
    blob(F, [s * 0.05, y0 + 0.62, 0.36], [0.07, 0.07, 0.07], 4, 6);
  }
  // the sword: the pommel, the grip, the guard, the long blade down between the feet to the plinth
  blob(GB, [0, y0 + 0.72, 0.36], [0.05, 0.05, 0.05], 4, 6);
  tube(BK, [[0, y0 + 0.7, 0.36, 0.025, 0.025], [0, y0 + 0.5, 0.36, 0.025, 0.025]], { seg: 6, sub: 1, capN: 1 });
  blob(GB, [0, y0 + 0.47, 0.36], [0.14, 0.025, 0.04], 3, 8);
  tube(K.S('gilt_bronze'), [[0, y0 + 0.45, 0.36, 0.03, 0.012], [0, y0 + 0.2, 0.36, 0.03, 0.012], [0, y0 + 0.01, 0.36, 0.028, 0.012]], { seg: 6, sub: 1, capN: 1, ref: [1, 0, 0] });
  // the neck and head: a broad face with a moustache, the eyes wide, a high stepped cap
  tube(F, [[0, y0 + 1.2, -0.2, 0.11, 0.1], [0, y0 + 1.3, -0.18, 0.1, 0.095]], { seg: 7, sub: 1, capN: 1 });
  const hc = [0, y0 + 1.52, -0.14];
  blob(F, hc, [0.17, 0.2, 0.17], fine ? 8 : 6, fine ? 14 : 10);
  blob(F, [0, y0 + 1.44, -0.0], [0.04, 0.06, 0.05], 3, 6);
  tube(BK, [[-0.13, y0 + 1.44, 0.0, 0.015, 0.012], [-0.05, y0 + 1.47, 0.03, 0.02, 0.014], [0, y0 + 1.46, 0.035, 0.02, 0.014], [0.05, y0 + 1.47, 0.03, 0.02, 0.014], [0.13, y0 + 1.44, 0.0, 0.015, 0.012]], { seg: 5, sub: 2, capN: 1, ref: [0, 0, 1] });
  for (const s of [-1, 1]) { blob(W, [s * 0.07, y0 + 1.56, 0.02], [0.035, 0.022, 0.02], 3, 6); blob(BK, [s * 0.07, y0 + 1.56, 0.036], [0.014, 0.014, 0.008], 3, 5); tube(BK, [[s * 0.03, y0 + 1.62, 0.025, 0.012, 0.01], [s * 0.1, y0 + 1.63, 0.015, 0.012, 0.01]], { seg: 5, sub: 1, capN: 1 }); blob(F, [s * 0.17, y0 + 1.5, -0.12], [0.02, 0.06, 0.04], 3, 6); }
  blob(R, [0, y0 + 1.38, 0.02], [0.04, 0.012, 0.012], 3, 6);
  tube(GB, [[0, y0 + 1.66, -0.14, 0.18, 0.18], [0, y0 + 1.84, -0.14, 0.15, 0.15], [0, y0 + 2.0, -0.14, 0.1, 0.1], [0, y0 + 2.12, -0.14, 0.03, 0.03]], { seg: 10, sub: 2, capN: 1, ref: [1, 0, 0] });
}
