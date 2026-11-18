// Carved stone of Tikal at the size where it is looked at (docs/settlements/maya-tikal.md §14): the stela with the ruler in relief
// (headdress, face, ear flares, ceremonial bar, belt, apron, sandals, glyph columns, a red frame) and its round altar with a ring of
// glyph blocks; the lintel's relief; the stucco mask with brows, eyes, nose, ear spools, teeth and scrolls. Closed boxes and lathes in
// the plan's bag; the stela's and altar's colliders as before.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { frame, L, RED } from './kit.js';

export const CV = 'limestone_carved', BL = 'maya_blue', JD = 'inlay_jade', OC = 'stucco_ochre', LF = 'stucco_leaf';
const SJ = JD, SO = OC;

/**
 * A bag that gathers one element's pieces by material and adds each material's pieces as ONE solid on flush(): carved detail made of
 * many small boxes would otherwise be a fine-detail mesh of its own for every material (one more draw each); joined, the element's
 * relief is one piece per material (src/core/geom.js DETAIL_SIZE).
 */
export function gather(bag) {
  const by = new Map();
  return {
    add(m, g) {
      const P = g.attributes.position.array, I = g.index ? g.index.array : null, n = I ? I.length : P.length / 3, a = by.get(m) ?? [];
      for (let i = 0; i < n; i++) { const k = (I ? I[i] : i) * 3; a.push(P[k], P[k + 1], P[k + 2]); }
      by.set(m, a);
    },
    flush() { for (const [m, a] of by) bag.add(m, fromTriangles(a)); by.clear(); },
  };
}

/** k_stela { at, face, h, w, seed }: a slab on a plinth, the ruler carved on the face toward the plaza, a round altar before it. */
export function stela(el, { bag: out, col }) {
  const bag = gather(out);
  const [x, z] = el.at, F = frame(el.face ?? 's', x, z), h = el.h ?? 3.2, w = el.w ?? 1.3, k = h / 3.4, y0 = 0.3;
  const B = (m, u0, u1, v0, v1, ya, yb) => { const r = F.R(u0, u1, v0, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); };
  const S = (m, d, v0, v1, ya, yb, dd = 0.05) => B(m, -0.2 - d - dd, -0.2 - d + 0.005, v0, v1, y0 + ya * k, y0 + yb * k);   // a piece of relief proud by d (its thickness dd)
  B(L, -0.6, 0.6, -w / 2 - 0.35, w / 2 + 0.35, 0, 0.18); B(L, -0.5, 0.5, -w / 2 - 0.2, w / 2 + 0.2, 0.18, y0);      // the two-stage plinth
  const sl = F.R(-0.2, 0.2, -w / 2, w / 2); bag.add(L, box(sl[0], y0, sl[1], sl[2], y0 + h, sl[3])); col.rect(sl, 0, h);
  B(L, -0.26, -0.2, -w / 2 - 0.03, w / 2 + 0.03, y0 + h - 0.12, y0 + h);                                                   // the cap
  // the red frame round the carved field, the field itself a little lower
  const fv = w / 2 - 0.07, fy0 = 0.18 * k, fy1 = h - 0.2;
  for (const sg of [-1, 1]) B(RED, -0.25, -0.2, sg > 0 ? fv - 0.07 : -fv, sg > 0 ? fv : -fv + 0.07, y0 + fy0, y0 + fy1);
  B(RED, -0.25, -0.2, -fv, fv, y0 + fy0, y0 + fy0 + 0.07); B(RED, -0.25, -0.2, -fv, fv, y0 + fy1 - 0.07, y0 + fy1);
  // the ruler, standing, frontal, with the ceremonial bar
  for (const sg of [-1, 1]) { S(CV, 0.02, sg * 0.1 - 0.09, sg * 0.1 + 0.09, 0.22, 0.34, 0.1); S(SO, 0.04, sg * 0.1 - 0.1, sg * 0.1 + 0.1, 0.2, 0.26, 0.12); }   // the sandals, the feet
  for (const sg of [-1, 1]) S(CV, 0.04, sg * 0.1 - 0.075, sg * 0.1 + 0.075, 0.34, 1.0, 0.08);                                        // the legs
  S(RED, 0.08, -0.3, 0.3, 0.7, 1.35, 0.06);                                                                                           // the apron
  S(SJ, 0.11, -0.04, 0.04, 0.78, 1.28, 0.03); S(L, 0.11, -0.3, 0.3, 0.66, 0.72, 0.03);
  S(L, 0.1, -0.36, 0.36, 1.35, 1.5, 0.07);                                                                                             // the belt
  S(SJ, 0.15, -0.08, 0.08, 1.37, 1.48, 0.03);                                                                                         // its jade mask
  S(CV, 0.05, -0.28, 0.28, 1.5, 2.05, 0.09);                                                                                          // the torso
  for (const sg of [-1, 1]) { S(CV, 0.09, sg * 0.3 + (sg > 0 ? 0 : -0.14), sg * 0.3 + (sg > 0 ? 0.14 : 0), 1.52, 2.05, 0.08); S(SO, 0.13, sg * 0.3 + (sg > 0 ? 0 : -0.13), sg * 0.3 + (sg > 0 ? 0.13 : 0), 1.42, 1.52, 0.04); }   // the arms and hands
  S(SJ, 0.17, -0.5, 0.5, 1.78, 1.88, 0.04);                                                                                           // the bar across the arms
  for (const sg of [-1, 1]) { S(BL, 0.17, sg * 0.5 - (sg > 0 ? 0 : 0.12), sg * 0.5 + (sg > 0 ? 0.12 : 0), 1.68, 1.98, 0.05); S(RED, 0.2, sg * 0.53 - 0.04, sg * 0.53 + 0.04, 1.74, 1.86, 0.03); }   // its serpent heads
  S(L, 0.1, -0.23, 0.23, 2.05, 2.14, 0.06); S(SJ, 0.14, -0.16, 0.16, 1.95, 2.05, 0.04);                                              // the collar
  S(CV, 0.08, -0.19, 0.19, 2.14, 2.5, 0.11);                                                                                          // the head
  for (const sg of [-1, 1]) { S(BL, 0.14, sg * 0.24 - 0.07, sg * 0.24 + 0.07, 2.22, 2.44, 0.05); S(SJ, 0.17, sg * 0.24 - 0.04, sg * 0.24 + 0.04, 2.27, 2.39, 0.03); }   // the ear flares
  S(L, 0.17, -0.12, 0.12, 2.26, 2.3, 0.03); S(L, 0.2, -0.04, 0.04, 2.2, 2.34, 0.03);                                                // the eyes' line, the nose
  // the headdress: a band, the great mask, the fan of plumes
  S(RED, 0.15, -0.3, 0.3, 2.5, 2.64, 0.07); S(L, 0.19, -0.26, 0.26, 2.54, 2.6, 0.03);
  S(CV, 0.14, -0.38, 0.38, 2.64, 2.96, 0.08); S(BL, 0.2, -0.3, -0.12, 2.7, 2.9, 0.04); S(BL, 0.2, 0.12, 0.3, 2.7, 2.9, 0.04); S(SJ, 0.21, -0.07, 0.07, 2.72, 2.88, 0.03);
  const nf = 7;
  for (let i = 0; i < nf; i++) { const c = (i - (nf - 1) / 2) * 0.17, top = 3.3 - Math.abs(i - (nf - 1) / 2) * 0.1; S(i % 2 ? LF : BL, 0.12, c - 0.06, c + 0.06, 2.96, top, 0.05); S(RED, 0.15, c - 0.025, c + 0.025, 3.0, top - 0.08, 0.03); }
  // the glyph columns down the two sides and the date block at the foot
  const gh = (fy1 - fy0 - 0.2) / 8;
  for (const sg of [-1, 1]) for (let i = 0; i < 8; i++) {
    const ya = fy0 + 0.1 + i * gh, v = sg * (fv - 0.12);
    B(i % 3 === 1 ? BL : CV, -0.24, -0.2, v - 0.075, v + 0.075, y0 + ya + 0.03, y0 + ya + gh - 0.04);
    B(L, -0.26, -0.24, v - 0.045, v + 0.045, y0 + ya + 0.08, y0 + ya + gh - 0.1);
  }
  // the altar before the stela: a low drum with a rim, a hollow top, a ring of glyph blocks
  const a = F.P(-1.7, 0), R = 0.82;
  bag.add(L, lathe([[0.001, 0], [R + 0.05, 0], [R + 0.05, 0.1], [R - 0.04, 0.1], [R - 0.04, 0.38], [R + 0.04, 0.38], [R + 0.04, 0.5], [R - 0.08, 0.5], [R - 0.1, 0.47], [0.001, 0.47]], 20, null, a[0], 0, a[1]));
  for (let i = 0; i < 12; i++) { const t = i * Math.PI / 6 + 0.26, g = box(-0.09, 0.14, -0.015, 0.09, 0.34, 0.015); g.rotateY(-t + Math.PI / 2); bag.add(i % 4 === 1 ? BL : CV, g.translate(a[0] + Math.cos(t) * (R - 0.02), 0, a[1] + Math.sin(t) * (R - 0.02))); }
  col.circle(a[0], a[1], R + 0.05, 0, 0.5);
  bag.flush();
}

/** A lintel's relief on its face (the face looks toward u < 0): the seated ruler on his jaguar-skin throne bench, under a sky band of glyph cartouches. */
export function lintelRelief(out, F, y0, y1, hw) {
  const bag = gather(out);
  const B = (m, u0, u1, v0, v1, ya, yb) => { const r = F.R(u0, u1, v0, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); };
  const h = y1 - y0, p = -0.02;
  B(RED, p - 0.03, p, -hw, hw, y0, y1);                                                                    // the painted field
  B(L, p - 0.05, p - 0.03, -hw, hw, y0, y0 + h * 0.08); B(L, p - 0.05, p - 0.03, -hw, hw, y1 - h * 0.08, y1);   // the borders
  const cn = Math.max(3, Math.floor(hw * 2 / 0.32));
  for (let i = 0; i < cn; i++) { const a = -hw + 0.1 + (hw * 2 - 0.2) * i / cn; B(i % 2 ? BL : CV, p - 0.08, p - 0.03, a, a + (hw * 2 - 0.2) / cn - 0.05, y1 - h * 0.34, y1 - h * 0.12); }   // the glyph cartouches
  const m = 0;
  B(OC, p - 0.09, p - 0.03, m - hw * 0.5, m + hw * 0.5, y0 + h * 0.1, y0 + h * 0.34);                    // the throne bench, jaguar-skin
  for (let i = 0; i < 5; i++) { const a = m - hw * 0.45 + i * hw * 0.2; B(RED, p - 0.1, p - 0.09, a, a + 0.05, y0 + h * 0.14, y0 + h * 0.26); }   // its spots
  B(CV, p - 0.1, p - 0.03, m - hw * 0.14, m + hw * 0.14, y0 + h * 0.34, y0 + h * 0.62);                  // the torso
  B(JD, p - 0.12, p - 0.1, m - hw * 0.1, m + hw * 0.1, y0 + h * 0.5, y0 + h * 0.58);
  B(CV, p - 0.1, p - 0.03, m - hw * 0.09, m + hw * 0.09, y0 + h * 0.62, y0 + h * 0.74);                  // the head
  B(RED, p - 0.12, p - 0.03, m - hw * 0.2, m + hw * 0.2, y0 + h * 0.74, y0 + h * 0.8); B(BL, p - 0.12, p - 0.1, m - hw * 0.16, m + hw * 0.16, y0 + h * 0.74, y0 + h * 0.8);   // the headdress' band
  for (let i = -2; i <= 2; i++) B(i % 2 ? LF : BL, p - 0.11, p - 0.03, m + i * hw * 0.07 - 0.03, m + i * hw * 0.07 + 0.03, y0 + h * 0.8, y0 + h * (0.86 - Math.abs(i) * 0.03));
  for (const sg of [-1, 1]) {                                                                                // the attendants: a kneeling figure with an offering, a glyph pair
    const c = sg * hw * 0.68;
    B(CV, p - 0.09, p - 0.03, c - hw * 0.07, c + hw * 0.07, y0 + h * 0.1, y0 + h * 0.45); B(CV, p - 0.09, p - 0.03, c - hw * 0.06, c + hw * 0.06, y0 + h * 0.45, y0 + h * 0.58);
    B(OC, p - 0.09, p - 0.03, c - hw * 0.09, c + hw * 0.09, y0 + h * 0.58, y0 + h * 0.62);
    B(L, p - 0.09, p - 0.03, sg * hw * 0.82 - 0.05, sg * hw * 0.82 + 0.05, y0 + h * 0.3, y0 + h * 0.5);
  }
  bag.flush();
}

/** k_mask { c, face, y, s }: the stucco mask of the Sun God / an earth god: a framed panel, a brow with scrolls, big eyes under the brow, a curled nose, fanged mouth, cheeks, ear spools, a headband with a trefoil. */
export function mask(el, { bag: out }) {
  const bag = gather(out);
  const F = frame(el.face, ...el.c), y = el.y ?? 0, s = el.s ?? 1;
  const B = (m, u0, u1, v0, v1, ya, yb) => { const r = F.R(u0 * s, u1 * s, v0 * s, v1 * s); bag.add(m, box(r[0], y + ya * s, r[1], r[2], y + yb * s, r[3])); };
  B(RED, -0.45, 0.2, -1.3, 1.3, 0, 2.5);                                                               // the panel
  B(L, -0.5, 0.2, -1.4, -1.25, 0, 2.6); B(L, -0.5, 0.2, 1.25, 1.4, 0, 2.6); B(L, -0.5, 0.2, -1.4, 1.4, 2.5, 2.65);   // its frame
  B(L, -0.5, 0.2, -1.4, 1.4, -0.0, 0.12);
  for (const sg of [-1, 1]) {
    const m = (a, b) => sg > 0 ? [a, b] : [-b, -a];
    B(CV, -0.62, -0.45, ...m(0.18, 1.12), 1.55, 2.0);                                                  // the brow ridge
    B(L, -0.68, -0.62, ...m(0.22, 1.05), 1.95, 2.0);
    B(L, -0.62, -0.5, ...m(0.9, 1.1), 1.95, 2.3); B(BL, -0.7, -0.62, ...m(0.95, 1.05), 2.0, 2.25);     // the brow's scroll rising at the outer end
    B('maya_blue', -0.64, -0.5, ...m(0.28, 0.92), 1.25, 1.55);                                         // the eye socket
    B(L, -0.7, -0.62, ...m(0.4, 0.8), 1.3, 1.5); B(RED, -0.74, -0.7, ...m(0.54, 0.66), 1.34, 1.46);  // the eyeball and its pupil (the Sun God's squint: a square eye)
    B(CV, -0.62, -0.5, ...m(0.2, 1.0), 0.85, 1.25);                                                    // the cheek
    B(L, -0.66, -0.62, ...m(0.3, 0.95), 0.95, 1.1);
    B(BL, -0.62, -0.42, ...m(1.08, 1.34), 0.55, 1.2); B(L, -0.68, -0.62, ...m(1.14, 1.28), 0.75, 1.0); B(BL, -0.7, -0.68, ...m(1.18, 1.24), 0.82, 0.94);   // the ear spool, the flare
    B(L, -0.66, -0.5, ...m(0.1, 0.9), 0.55, 0.75);                                                     // the upper lip
    B(L, -0.64, -0.5, ...m(0.15, 0.7), 0.2, 0.36);                                                     // the lower lip
    B('limestone_carved', -0.64, -0.55, ...m(0.62, 0.7), 0.36, 0.56);                                  // the corner fang
    B(RED, -0.5, -0.45, ...m(0.9, 1.15), 0.3, 1.0);
  }
  B(L, -0.95, -0.5, -0.3, 0.3, 0.75, 1.55); B(CV, -0.98, -0.95, -0.2, 0.2, 0.8, 1.45);               // the long curled nose
  B(L, -0.82, -0.6, -0.32, 0.32, 0.62, 0.78);                                                          // its tip, flared
  B(CV, -0.7, -0.58, -0.4, 0.4, 0.36, 0.6);                                                            // the mouth's opening
  B(RED, -0.68, -0.64, -0.3, 0.3, 0.38, 0.55);
  for (const v of [-0.3, -0.1, 0.1, 0.3]) B('limestone_carved', -0.7, -0.62, v - 0.07, v + 0.07, 0.5, 0.64);           // the teeth, above
  for (const v of [-0.2, 0.2]) B('limestone_carved', -0.7, -0.62, v - 0.06, v + 0.06, 0.36, 0.48);                        // and below
  B(BL, -0.6, -0.44, -1.1, 1.1, 2.05, 2.35); B(L, -0.64, -0.6, -1.05, 1.05, 2.12, 2.2);               // the headband
  B(BL, -0.68, -0.6, -0.2, 0.2, 2.05, 2.4); B(RED, -0.72, -0.68, -0.1, 0.1, 2.12, 2.32);                // the trefoil jewel
  for (const v of [-0.55, 0.55]) B(CV, -0.62, -0.56, v - 0.18, v + 0.18, 2.15, 2.42);
  B(L, -0.62, -0.5, -0.5, 0.5, 1.2, 1.3);                                                              // the bridge between the eyes
  bag.flush();
}
