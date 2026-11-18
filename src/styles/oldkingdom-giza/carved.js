// Low relief as a modelled surface (docs/settlements/giza.md §18): the offering bearers and the cattle of the causeway's walls, the
// columns of hieroglyphs between them, and the owner at his table of offerings on a mastaba's false door. Each figure is built from
// rounded forms (the limbs, the torso, the head with its wig, nose and eye, the kilt, the loaves, the jar, the beast's body, its
// legs, horns and tail) whose parts stand at slightly different depths so that the arm lies over the body, the hand over the
// kilt; the back half of every form is cut off at the wall (Sculpt clip), so that what is left rises 2–6 cm from the wall's face,
// its edges rounded, as the raised relief of the Old Kingdom does. One Sculpt per colour: one geometry per colour for the whole
// run of the wall. Figure frame: x along the walk (right), y up (1 = the figure's height), w out of the wall.

import { Sculpt, blob, blobDir, tube, torus, hash3 } from '../nabataean/sculpt.js';

const PI = Math.PI;
export const newInk = () => ({ skin: new Sculpt(), white: new Sculpt(), black: new Sculpt(), ochre: new Sculpt(), blue: new Sculpt(), clay: new Sculpt(), green: new Sculpt() });
export const INK = { skin: 'paint_robe', white: 'plaster_white', black: 'lacquer_black', ochre: 'paint_ochre', blue: 'egyptian_blue', clay: 'basalt', green: 'egyptian_blue' };
const setXf = (I, xf, clip = true) => { for (const s of Object.values(I)) { s.xf = xf; s.clip = clip; s.flat = 1; s.shift = 0; } };
const T = (S, pts, o) => tube(S, pts, { seg: 6, sub: 1, capN: 1, ref: [1, 0, 0], ...o });

/** An offering bearer striding along +x, carrying `item` (0 a tray of loaves, 1 a jar, 2 a lotus, 3 a trussed fowl). lod 0 or 1. */
export function bearer(I, item, lod = 0) {
  const { skin, white, black, ochre, clay } = I, sg = lod ? 5 : 7;
  // the legs: the stride, the calf's swell, the ankle and the foot
  T(skin, [[0.03, 0.5, 0.006, 0.04, 0.026], [0.05, 0.38, 0.006, 0.036, 0.024], [0.07, 0.28, 0.006, 0.026, 0.02], [0.085, 0.2, 0.006, 0.03, 0.022], [0.115, 0.045, 0.006, 0.016, 0.014]], { seg: sg });
  T(skin, [[-0.02, 0.5, 0.012, 0.04, 0.026], [-0.04, 0.38, 0.012, 0.036, 0.024], [-0.055, 0.28, 0.012, 0.026, 0.02], [-0.07, 0.2, 0.012, 0.03, 0.022], [-0.105, 0.045, 0.012, 0.016, 0.014]], { seg: sg });
  blobDir(skin, [0.14, 0.022, 0.006], [1, -0.1, 0], 0.038, 0.014, 0.014, [0, 1, 0], 2, sg);
  blobDir(skin, [-0.078, 0.022, 0.012], [1, -0.1, 0], 0.038, 0.014, 0.014, [0, 1, 0], 2, sg);
  // the torso, the shoulders turned to the viewer (the canon: the chest in front view, the hips in profile), the belly
  T(skin, [[0.0, 0.56, 0.016, 0.036, 0.024], [0.004, 0.68, 0.018, 0.044, 0.026], [0.012, 0.8, 0.02, 0.06, 0.028], [0.02, 0.84, 0.02, 0.05, 0.024]], { seg: sg + 1 });
  blob(skin, [0.026, 0.775, 0.032], [0.026, 0.02, 0.012], 2, sg);                                     // the breast
  // the kilt, its wedge in front, the belt
  T(white, [[0.0, 0.6, 0.024, 0.052, 0.032], [0.016, 0.5, 0.026, 0.056, 0.032], [0.035, 0.42, 0.028, 0.052, 0.03]], { seg: sg + 1 });
  blobDir(white, [0.06, 0.52, 0.034], [0.2, -1, 0], 0.1, 0.03, 0.012, [1, 0, 0], 2, sg);
  T(ochre, [[-0.05, 0.6, 0.044, 0.007, 0.006], [0.07, 0.6, 0.044, 0.007, 0.006]], { seg: 4, sub: 1 });
  // the head with its wig, the face in profile, the eye drawn in front view
  blob(skin, [0.026, 0.925, 0.018], [0.038, 0.044, 0.02], 3, sg + 1);
  blob(black, [0.014, 0.945, 0.03], [0.046, 0.05, 0.016], 3, sg + 1);
  T(black, [[-0.025, 0.93, 0.032, 0.018, 0.014], [-0.03, 0.85, 0.036, 0.016, 0.014]], { seg: 5, sub: 1 });
  blobDir(skin, [0.066, 0.918, 0.034], [1, -0.4, 0], 0.016, 0.01, 0.01, [0, 1, 0], 2, 5);            // the nose
  if (!lod) { blob(white, [0.048, 0.932, 0.041], [0.012, 0.007, 0.004], 2, 6); blob(black, [0.05, 0.932, 0.044], [0.005, 0.005, 0.003], 1, 5); blobDir(skin, [0.056, 0.898, 0.035], [1, 0, 0], 0.012, 0.004, 0.006, [0, 1, 0], 1, 5); }
  T(skin, [[0.022, 0.865, 0.022, 0.02, 0.018], [0.026, 0.84, 0.022, 0.024, 0.02]], { seg: 5, sub: 1 });  // the neck
  // the near arm bent forward holding the offering; the far arm hanging, swinging back
  T(skin, [[0.03, 0.79, 0.03, 0.024, 0.02], [0.07, 0.69, 0.038, 0.02, 0.018], [0.15, 0.735, 0.04, 0.015, 0.015]], { seg: sg });
  T(skin, [[0.0, 0.79, 0.008, 0.024, 0.02], [-0.035, 0.67, 0.012, 0.019, 0.017], [-0.045, 0.56, 0.014, 0.014, 0.014]], { seg: sg });
  blob(skin, [0.16, 0.735, 0.042], [0.018, 0.012, 0.012], 2, 5);
  blob(skin, [-0.047, 0.545, 0.016], [0.012, 0.015, 0.01], 2, 5);
  // the offering
  if (item === 0) {                                                                                   // a tray with three tall loaves
    T(ochre, [[0.14, 0.76, 0.044, 0.07, 0.01], [0.23, 0.76, 0.044, 0.07, 0.01]], { seg: 6, sub: 1, ref: [0, 1, 0] });
    for (let k = 0; k < 3; k++) blobDir(white, [0.15 + k * 0.035, 0.81, 0.05], [0, 1, 0], 0.036, 0.016, 0.014, [1, 0, 0], 2, 6);
  } else if (item === 1) {                                                                            // a beer jar on its foot, stoppered
    blobDir(clay, [0.2, 0.8, 0.044], [0, 1, 0], 0.07, 0.04, 0.026, [1, 0, 0], 3, sg + 1); blob(ochre, [0.2, 0.875, 0.05], [0.022, 0.012, 0.014], 2, 5);
  } else if (item === 2) {                                                                            // a lotus flower and bud on a long stem
    T(I.green, [[0.17, 0.74, 0.044, 0.006, 0.006], [0.22, 0.86, 0.046, 0.006, 0.006], [0.25, 0.97, 0.048, 0.006, 0.006]], { seg: 4 });
    blobDir(white, [0.25, 1.0, 0.05], [0, 1, 0], 0.04, 0.02, 0.012, [1, 0, 0], 2, 6); blobDir(I.blue, [0.215, 0.9, 0.05], [0.4, 1, 0], 0.03, 0.012, 0.01, [1, 0, 0], 2, 5);
  } else {                                                                                            // a trussed fowl held by the legs
    blobDir(ochre, [0.22, 0.745, 0.046], [1, 0.1, 0], 0.075, 0.032, 0.02, [0, 1, 0], 3, sg + 1); blob(ochre, [0.3, 0.76, 0.046], [0.02, 0.02, 0.012], 2, 5);
  }
}

/** A striding ox in profile facing +x: the hump, the dewlap, the head with horns and ears, the four legs, the tail; spots on some (1 = tall as the figure). */
export function ox(I, n, lod = 0) {
  const { ochre, skin, white, black } = I, sg = lod ? 6 : 8;
  blobDir(ochre, [0.0, 0.47, 0.02], [1, 0, 0], 0.38, 0.19, 0.04, [0, 1, 0], 4, sg + 2);              // the barrel
  blobDir(ochre, [0.2, 0.56, 0.03], [1, 0.3, 0], 0.17, 0.12, 0.034, [0, 1, 0], 3, sg);                // the shoulder's rise
  T(ochre, [[0.28, 0.56, 0.028, 0.13, 0.034], [0.4, 0.63, 0.03, 0.1, 0.032], [0.5, 0.66, 0.03, 0.08, 0.03]], { seg: sg, ref: [0, 1, 0] });   // the neck
  blobDir(skin, [0.56, 0.6, 0.032], [1, -0.6, 0], 0.125, 0.065, 0.032, [0, 1, 0], 3, sg);             // the head
  blob(black, [0.66, 0.555, 0.04], [0.024, 0.024, 0.014], 2, 5);                                      // the muzzle
  T(white, [[0.5, 0.7, 0.03, 0.01, 0.01], [0.47, 0.8, 0.032, 0.011, 0.01], [0.55, 0.85, 0.032, 0.009, 0.009]], { seg: 4 });   // the horn
  blobDir(skin, [0.5, 0.675, 0.04], [-0.3, 1, 0], 0.03, 0.016, 0.008, [1, 0, 0], 2, 5);              // the ear
  if (!lod) blob(black, [0.575, 0.64, 0.043], [0.007, 0.007, 0.004], 1, 5);
  for (const [x, ph, dz] of [[0.26, 0.03, 0.026], [0.1, -0.04, 0.03], [-0.26, 0.03, 0.026], [-0.1, -0.04, 0.03]]) T(skin, [[x, 0.36, dz, 0.05, 0.032], [x + ph * 0.4, 0.22, dz, 0.032, 0.026], [x + ph * 0.9, 0.1, dz, 0.02, 0.02], [x + ph, 0.02, dz, 0.024, 0.02]], { seg: sg - 1 });   // the legs
  T(skin, [[-0.36, 0.55, 0.02, 0.014, 0.014], [-0.41, 0.4, 0.02, 0.012, 0.012], [-0.4, 0.2, 0.02, 0.012, 0.012]], { seg: 4 });   // the tail
  blob(black, [-0.4, 0.17, 0.022], [0.016, 0.04, 0.012], 2, 5);
  if (n % 2) blobDir(white, [-0.04, 0.5, 0.05], [1, 0.1, 0], 0.11, 0.07, 0.006, [0, 1, 0], 2, 7);   // a white patch
}

// ── the hieroglyphs: signs built in metres, raised ~1.5 cm, 0.10–0.17 m high, centred at (0, 0) of their own frame ─────────────────────
const SIGNS = [
  (I) => { torus(I.ochre, [0, 0, 0.01], [1, 0, 0], [0, 1, 0], 0.055, 0.009, { seg: 10, sec: 5 }); blob(I.ochre, [0, 0, 0.012], [0.016, 0.016, 0.008], 1, 6); },               // the sun
  (I) => { for (let k = 0; k < 3; k++) T(I.blue, [[-0.06, 0.05 - k * 0.045, 0.01, 0.008, 0.008], [-0.03, 0.065 - k * 0.045, 0.01, 0.008, 0.008], [0.0, 0.04 - k * 0.045, 0.01, 0.008, 0.008], [0.03, 0.065 - k * 0.045, 0.01, 0.008, 0.008], [0.06, 0.05 - k * 0.045, 0.01, 0.008, 0.008]], { seg: 4, sub: 2, ref: [0, 0, 1] }); },   // water
  (I) => { blobDir(I.skin, [0, -0.01, 0.012], [0.1, 1, 0], 0.062, 0.04, 0.012, [1, 0, 0], 3, 7); blob(I.skin, [0.005, 0.07, 0.014], [0.026, 0.026, 0.01], 2, 6); T(I.black, [[0.03, 0.075, 0.02, 0.006], [0.048, 0.062, 0.02, 0.005]], { seg: 4, sub: 1 }); T(I.black, [[-0.015, -0.07, 0.01, 0.005], [-0.015, -0.1, 0.01, 0.005]], { seg: 4, sub: 1 }); },   // a bird
  (I) => { blobDir(I.green, [0, 0.0, 0.01], [0.1, 1, 0], 0.085, 0.022, 0.008, [1, 0, 0], 3, 6); T(I.green, [[0, -0.09, 0.009, 0.005], [0.01, -0.12, 0.009, 0.005]], { seg: 4, sub: 1 }); },   // a reed
  (I) => { blobDir(I.white, [0, 0, 0.01], [1, 0, 0], 0.07, 0.03, 0.008, [0, 1, 0], 3, 8); blob(I.black, [0.005, 0, 0.016], [0.016, 0.016, 0.005], 1, 6); T(I.black, [[-0.07, 0.05, 0.012, 0.006], [0, 0.065, 0.012, 0.006], [0.07, 0.05, 0.012, 0.006]], { seg: 4, sub: 2 }); },   // an eye
  (I) => { blobDir(I.ochre, [0, -0.02, 0.01], [1, 0, 0], 0.06, 0.04, 0.012, [0, 1, 0], 3, 8); },                                                                        // a loaf
  (I) => { torus(I.ochre, [0, 0.06, 0.01], [1, 0, 0], [0, 1, 0], 0.03, 0.007, { seg: 8, sec: 4 }); T(I.ochre, [[0, 0.03, 0.01, 0.008], [0, -0.1, 0.01, 0.008]], { seg: 4, sub: 1 }); T(I.ochre, [[-0.05, 0.0, 0.01, 0.007], [0.05, 0.0, 0.01, 0.007]], { seg: 4, sub: 1 }); },   // the ankh
  (I) => { T(I.black, [[-0.06, -0.05, 0.01, 0.007], [-0.02, 0.02, 0.01, 0.007], [0.02, -0.04, 0.01, 0.007], [0.06, 0.04, 0.01, 0.007], [0.07, 0.07, 0.011, 0.008]], { seg: 4, sub: 2, ref: [0, 0, 1] }); },   // a snake
  (I) => { blobDir(I.skin, [0, 0, 0.01], [1, 0, 0], 0.055, 0.03, 0.008, [0, 1, 0], 3, 8); T(I.black, [[-0.04, 0, 0.016, 0.005], [0.04, 0, 0.016, 0.005]], { seg: 4, sub: 1 }); },       // the mouth
  (I) => { blobDir(I.clay, [0, -0.02, 0.01], [0, 1, 0], 0.045, 0.06, 0.012, [1, 0, 0], 3, 8); T(I.ochre, [[-0.06, 0.04, 0.011, 0.006], [0.06, 0.04, 0.011, 0.006]], { seg: 4, sub: 1 }); },   // a bowl
];
/** The glyph k of the set, at (x, y) of the current frame, scaled by sc. */
export function glyph(I, k, sc = 1) { SIGNS[((k % SIGNS.length) + SIGNS.length) % SIGNS.length](I, sc); }
export const glyphCount = SIGNS.length;

/**
 * The reliefs along the inner walls of a causeway reach { a, b, w, ya, yb, gap }, from `from` to `to` metres along it. ref: [[x, z], …]
 * the places visitors come from; the figures within 15 m of one are carved in full (lod 0), within 40 m reduced (lod 1), beyond 40 m the
 * caller leaves the old flat plates. Returns the metre along the reach at which the carving stops (the first figure beyond 40 m).
 */
export function causewayCarved(bag, el, from, to, ref) {
  const [ax, az] = el.a, [bx, bz] = el.b, hw = (el.w ?? 4.6) / 2, ya = el.ya ?? 0, yb = el.yb ?? 0;
  if (Math.abs(yb - ya) > 0.05) return 0;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, n = Math.ceil(L / 6), step = L / n;
  const dist = (s, side) => Math.min(...ref.map(([x, z]) => Math.hypot(ax + ux * s + nx * side * hw - x, az + uz * s + nz * side * hw - z)));
  const I = newInk(); let stop = to;
  for (const side of [-1, 1]) {
    const gapS = el.gap && el.gap.side === side ? [el.gap.from * step - 0.7, el.gap.to * step + 0.7] : null;
    const free = (s0, s1) => s0 > 1.0 && s1 < L - 0.5 && s1 < to && s0 > from && !(gapS && s1 > gapS[0] && s0 < gapS[1]);
    // figure frame → the wall: x along (dir: against the travel, the figures walk toward the temple), w out of the wall, scale sc
    const place = (s, y, sc, dir) => setXf(I, ([x, yy, w]) => { const uu = s + dir * x * sc, lat = side * (hw - w * sc); return [ax + ux * uu + nx * lat, ya + y + yy * sc, az + uz * uu + nz * lat]; });
    // the registers' ground lines and the band under the roof: continuous rounded cords on the wall
    const s0 = Math.max(from, 0.9);
    let s1 = Math.min(L - 0.4, to);
    for (let s = s0 + 0.9; s < s1 - 0.5; s += 1.25) if (free(s - 0.5, s + 0.5) && dist(s, side) > 40) { s1 = Math.min(s1, s - 0.5); stop = Math.min(stop, s1); break; }
    for (const [y0, rr] of [[0.66, 0.045], [2.56, 0.045], [4.25, 0.1]]) {
      let u = s0;
      for (const g of gapS ? [gapS, [L, L]] : [[L, L]]) {
        const e = Math.min(s1, g[0]);
        if (e - u > 0.4) { setXf({ b: I.blue }, ([x, yy, w]) => [ax + ux * x + nx * side * (hw - w), ya + y0 + yy, az + uz * x + nz * side * (hw - w)]); tube(I.blue, [[u, 0, 0.0, rr * 0.6, rr * 0.6], [(u + e) / 2, 0, 0.0, rr * 0.6, rr * 0.6], [e, 0, 0.0, rr * 0.6, rr * 0.6]], { seg: 6, sub: Math.max(1, Math.round((e - u) / 3)), ref: [0, 1, 0], cap: [1, 1], capN: 1 }); }
        u = Math.max(u, g[1]);
      }
    }
    let k = 0;
    for (let s = s0 + 0.9; s < s1 - 0.5; s += 1.25, k++) {
      if (!free(s - 0.5, s + 0.5)) continue;
      const lod = dist(s, side) < 15 ? 0 : 1, item = (k + Math.round(s)) % 4;
      place(s, 0.7, 1.5, -1); bearer(I, item, lod);
      // before the figure, a column of signs (a name and a title), the full carving only
      if (!lod && k % 3 === 0) {
        const cols = 4 + (k % 3 === 0 ? 1 : 0);
        for (let q = 0; q < cols; q++) { setXf(I, ([x, yy, w]) => [ax + ux * (s - 0.55 + x) + nx * side * (hw - w), ya + 1.95 - q * 0.17 + yy, az + uz * (s - 0.55 + x) + nz * side * (hw - w)]); glyph(I, Math.floor(hash3(s, side, q, 11) * 40) + q * 3); }
      }
    }
    k = 0;
    for (let s = s0 + 1.1; s < s1 - 0.9; s += 2.0, k++) {
      if (!free(s - 0.9, s + 0.9)) continue;
      place(s, 2.62, 1.7, -1); ox(I, k + side, 1);          // (the upper register is looked up at: the reduced carving)
    }
  }
  for (const [c, S] of Object.entries(I)) if (S.triangles) bag.add(INK[c], S.geometry());
  return stop;
}

/** The owner at his table of offerings on a mastaba's false door (the panel 0.72 m wide, 0.57 m high), modelled: x along the wall (north = -x) ... */
export function ownerPanel(bag, { X, zc, y0, lod }) {
  const I = newInk();
  // frame: x along z (toward the viewer's right as one faces the wall: north is left), y up, w east (out of the wall)
  setXf(I, ([x, yy, w]) => [X + 0.05 + w, y0 + 1.6 + yy, zc - (x - 0.25)]);
  const sg = lod ? 5 : 7, { skin, white, black, ochre, blue, green } = I;
  // the owner, seated on a lion-legged stool, facing the table: head, wig, torso, kilt, the arm reaching for the loaves
  blob(skin, [-0.02, 0.5, 0.01], [0.034, 0.042, 0.017], 3, sg + 1); blob(black, [-0.034, 0.515, 0.018], [0.04, 0.046, 0.013], 3, sg + 1);
  T(skin, [[-0.02, 0.45, 0.012, 0.015, 0.014], [-0.015, 0.4, 0.014, 0.02, 0.016]], { seg: 5, sub: 1 });
  T(skin, [[-0.015, 0.4, 0.014, 0.046, 0.022], [-0.01, 0.3, 0.014, 0.04, 0.02], [-0.01, 0.23, 0.014, 0.036, 0.02]], { seg: sg });
  T(white, [[-0.01, 0.25, 0.02, 0.046, 0.026], [0.03, 0.19, 0.022, 0.05, 0.026], [0.09, 0.185, 0.022, 0.05, 0.024]], { seg: sg });
  T(skin, [[0.0, 0.37, 0.02, 0.014, 0.013], [0.05, 0.33, 0.022, 0.012, 0.012], [0.12, 0.3, 0.024, 0.01, 0.01]], { seg: 5 });
  T(skin, [[0.12, 0.17, 0.02, 0.016, 0.014], [0.12, 0.05, 0.02, 0.014, 0.012], [0.135, 0.0, 0.02, 0.012, 0.012]], { seg: 5 });
  T(I.clay, [[-0.06, 0.15, 0.015, 0.05, 0.012], [0.12, 0.15, 0.015, 0.05, 0.012]], { seg: 5, sub: 1, ref: [0, 1, 0] });
  T(I.clay, [[-0.05, 0.14, 0.015, 0.012, 0.01], [-0.05, 0.0, 0.015, 0.012, 0.01]], { seg: 5, sub: 1 }); T(I.clay, [[0.11, 0.14, 0.015, 0.012, 0.01], [0.11, 0.0, 0.015, 0.012, 0.01]], { seg: 5, sub: 1 });
  // the table: a stand and, upon it, the half loaves standing up on end, the pile of offerings
  T(ochre, [[0.2, 0.02, 0.016, 0.012, 0.01], [0.2, 0.2, 0.016, 0.012, 0.01]], { seg: 5, sub: 1 }); blobDir(ochre, [0.2, 0.215, 0.018], [1, 0, 0], 0.07, 0.015, 0.012, [0, 1, 0], 2, 7);
  for (let k = 0; k < 5; k++) blobDir(white, [0.15 + k * 0.025, 0.27 + 0.01 * Math.sin(k / 4 * PI), 0.024], [0, 1, 0], 0.035, 0.012, 0.01, [1, 0, 0], 2, 6);
  // the columns of the list, two ranks of signs, under a blue band
  T(blue, [[-0.09, 0.52, 0.008, 0.018, 0.008], [0.59, 0.52, 0.008, 0.018, 0.008]], { seg: 5, sub: 1, ref: [0, 1, 0] });
  if (!lod) for (let c = 0; c < 4; c++) for (let q = 0; q < 3; q++) { setXf(I, ([x, yy, w]) => [X + 0.05 + w, y0 + 1.6 + 0.4 - q * 0.088 + yy * 0.55, zc - (0.06 + c * 0.075 + x * 0.55)]); glyph(I, c * 3 + q + 1); }
  for (const [c, S] of Object.entries(I)) if (S.triangles) bag.add(INK[c], S.geometry());
  void green;
}
