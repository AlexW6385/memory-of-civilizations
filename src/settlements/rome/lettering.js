// Latin capitals for Rome's inscriptions (docs/settlements/rome.md §4.21): the 23 letters of the Roman alphabet of the
// Empire (A B C D E F G H I K L M N O P Q R S T V X Y Z; J, U and W did not exist: V stands for U) and the interpunct,
// built from strokes the way the Pantheon's dedication is (src/buildings/pantheon/relief.js, whose glyph table is its own;
// this one is complete). Each glyph: its advance width and strokes in units of the letter's height:
//   ['l', x0, y0, x1, y1, thickness] a straight stroke, ['a', cx, cy, rx, ry, from°, to°, thickness] an arc (x = cx + rx cos a,
//   y = cy + ry sin a). The thick strokes are 0.13, the thin ones 0.07 (the contrast of Roman capitals), the thick vertical
//   stems carry small serifs. Every glyph is checked by eye on a rendered sheet (tools-free: tests/rome-lettering.test.mjs
//   writes it when ROME_SHEET=path is set) and by its ink's box and its width in the test.
import { fromTriangles, orientOutward } from '../../core/geom.js';

const T = 0.13, t = 0.07, D2R = Math.PI / 180;
export const GLYPHS = {
  A: { w: 0.8, s: [['l', 0.4, 1, 0.02, 0, t], ['l', 0.4, 1, 0.78, 0, T], ['l', 0.17, 0.28, 0.63, 0.28, t]] },
  B: { w: 0.7, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.975, 0.32, 0.975, t], ['a', 0.32, 0.745, 0.25, 0.235, 90, -90, T], ['l', 0.32, 0.51, 0.1, 0.51, t],
    ['l', 0.1, 0.515, 0.34, 0.515, t], ['a', 0.34, 0.265, 0.3, 0.25, 90, -90, T], ['l', 0.34, 0.015, 0.1, 0.015, t]] },
  C: { w: 0.76, s: [['a', 0.4, 0.5, 0.36, 0.47, 42, 318, T]] },
  D: { w: 0.8, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.975, 0.3, 0.975, t], ['a', 0.3, 0.5, 0.44, 0.475, 90, -90, T], ['l', 0.3, 0.025, 0.1, 0.025, t]] },
  E: { w: 0.56, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.035, 0.52, 0.035, t], ['l', 0.1, 0.5, 0.44, 0.5, t], ['l', 0.1, 0.965, 0.52, 0.965, t]] },
  F: { w: 0.56, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.965, 0.52, 0.965, t], ['l', 0.1, 0.52, 0.44, 0.52, t]] },
  G: { w: 0.82, s: [['a', 0.42, 0.5, 0.36, 0.47, 40, 335, T], ['l', 0.42, 0.45, 0.76, 0.45, t], ['l', 0.76, 0.45, 0.76, 0.14, T]] },
  H: { w: 0.8, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.7, 0, 0.7, 1, T], ['l', 0.1, 0.5, 0.7, 0.5, t]] },
  I: { w: 0.22, s: [['l', 0.11, 0, 0.11, 1, T]] },
  K: { w: 0.76, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.7, 1, 0.14, 0.44, t], ['l', 0.3, 0.6, 0.74, 0, T]] },
  L: { w: 0.6, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.035, 0.56, 0.035, t]] },
  M: { w: 0.95, s: [['l', 0.08, 0, 0.08, 1, t], ['l', 0.08, 1, 0.475, 0.02, T], ['l', 0.475, 0.02, 0.87, 1, t], ['l', 0.87, 0, 0.87, 1, T]] },
  N: { w: 0.84, s: [['l', 0.1, 0, 0.1, 1, t], ['l', 0.1, 1, 0.74, 0, T], ['l', 0.74, 0, 0.74, 1, t]] },
  O: { w: 0.92, s: [['a', 0.46, 0.5, 0.42, 0.47, 0, 360, T]] },
  P: { w: 0.66, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.975, 0.34, 0.975, t], ['a', 0.34, 0.735, 0.27, 0.235, 90, -90, T], ['l', 0.34, 0.5, 0.1, 0.5, t]] },
  Q: { w: 0.92, s: [['a', 0.46, 0.5, 0.42, 0.47, 0, 360, T], ['l', 0.52, 0.22, 0.84, -0.1, t]] },
  R: { w: 0.72, s: [['l', 0.1, 0, 0.1, 1, T], ['l', 0.1, 0.975, 0.34, 0.975, t], ['a', 0.34, 0.735, 0.27, 0.235, 90, -90, T], ['l', 0.34, 0.5, 0.1, 0.5, t], ['l', 0.36, 0.5, 0.68, 0, T]] },
  S: { w: 0.62, s: [['a', 0.31, 0.745, 0.245, 0.245, 25, 270, T], ['a', 0.31, 0.255, 0.245, 0.245, 90, -155, T]] },
  T: { w: 0.66, s: [['l', 0.33, 0, 0.33, 1, T], ['l', 0.0, 0.965, 0.66, 0.965, t]] },
  V: { w: 0.82, s: [['l', 0.02, 1, 0.4, 0, t], ['l', 0.8, 1, 0.4, 0, T]] },
  X: { w: 0.8, s: [['l', 0.04, 1, 0.76, 0, T], ['l', 0.76, 1, 0.04, 0, t]] },
  Y: { w: 0.8, s: [['l', 0.04, 1, 0.4, 0.48, t], ['l', 0.76, 1, 0.4, 0.48, T], ['l', 0.4, 0.48, 0.4, 0, T]] },
  Z: { w: 0.7, s: [['l', 0.06, 0.965, 0.64, 0.965, t], ['l', 0.64, 1, 0.06, 0, T], ['l', 0.06, 0.035, 0.66, 0.035, t]] },
  '·': { w: 0.26, s: [['l', 0.13, 0.44, 0.13, 0.56, 0.12]] },
  ' ': { w: 0.5, s: [] },
};
/** Whether every character of the text is a letter of this set (or a space, or the interpunct). */
export const canWrite = (text) => !!text && [...text].every((c) => GLYPHS[c]);

/** The advance of a text in units of the letter's height, `gap` between letters. */
export const widthOf = (text, gap = 0.3) => [...text].reduce((s, c) => s + GLYPHS[c].w + gap, -gap);

/**
 * The ink of a text as flat polygons [[u, v] × 4] (u to the reader's right from the text's middle, v up from its foot, in units of the
 * letter's height): one quadrilateral for each straight stroke, each piece of an arc, each serif.
 */
export function inkOf(text, gap = 0.3) {
  const out = [];
  let u = -widthOf(text, gap) / 2;
  const bar = (u0, v0, u1, v1, th, ext = 0) => {
    let dx = u1 - u0, dy = v1 - v0; const L = Math.hypot(dx, dy) || 1;
    dx /= L; dy /= L;
    const nx = -dy * th / 2, ny = dx * th / 2, a = [u0 - dx * ext, v0 - dy * ext], b = [u1 + dx * ext, v1 + dy * ext];
    out.push([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]);
  };
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (!g) throw new Error('no letter ' + ch);
    for (const s of g.s) {
      if (s[0] === 'l') {
        const [, x0, y0, x1, y1, th] = s;
        bar(u + x0, y0, u + x1, y1, th);
        if (x0 === x1 && th === T) for (const yy of [y0, y1]) if (yy === 0 || yy === 1) bar(u + x0 - 0.13, yy === 0 ? 0.017 : 0.983, u + x0 + 0.13, yy === 0 ? 0.017 : 0.983, 0.034);       // serifs only where a stem meets the foot or the top
      } else {
        const [, cx, cy, rx, ry, a0, a1, th] = s, n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 24));
        const w = (a) => t + (th - t) * Math.abs(Math.cos(a));        // a ring is thick at its sides, thin at the top and the foot
        for (let i = 0; i < n; i++) {
          const p = (a0 + (a1 - a0) * i / n) * D2R, q = (a0 + (a1 - a0) * (i + 1) / n) * D2R;
          bar(u + cx + rx * Math.cos(p), cy + ry * Math.sin(p), u + cx + rx * Math.cos(q), cy + ry * Math.sin(q), (w(p) + w(q)) / 2, 0.02);
        }
      }
    }
    u += g.w + gap;
  }
  return out;
}

/** A prism over a flat quadrilateral: its front face (at d = dep) and its four sides; the back is against the wall. */
function prism(out, P, quad, dep) {
  const tris = [], q = (a, b, c, d) => tris.push(...a, ...b, ...c, ...a, ...c, ...d);
  const f = quad.map(([u, v]) => P(u, v, dep)), b = quad.map(([u, v]) => P(u, v, 0));
  q(f[0], f[1], f[2], f[3]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], b[j], f[j], f[i]); }
  out.push(...orientOutward(tris));
}

/**
 * Raised letters on a vertical face looking toward +z (a wall on the north side of the street, seen by a visitor in the street
 * to the south): `at` [x, z] the middle of the foot of the text on the wall's face, `y` the foot, `h` the letter height, `dep` how
 * far the letters stand out. Returns a geometry (add it to a bag with the material of the paint or the metal).
 */
export function wallText(text, { at, y, h, dep = 0.02, gap = 0.3 }) {
  const tris = [], P = (u, v, d) => [at[0] + u * h, y + v * h, at[1] + d];
  for (const quad of inkOf(text, gap)) prism(tris, P, quad, dep);
  return fromTriangles(tris);
}
/**
 * Raised letters on a floor, to be read by a visitor walking north (−z) over them: `at` [x, z] the middle of the text's foot (its
 * lower edge, the nearer to the visitor), `y` the floor's surface, `h` the letter height, `dep` how far it stands.
 */
export function floorText(text, { at, y, h, dep = 0.012, gap = 0.3 }) {
  const tris = [], P = (u, v, d) => [at[0] + u * h, y + d, at[1] - v * h];
  for (const quad of inkOf(text, gap)) prism(tris, P, quad, dep);
  return fromTriangles(tris);
}
