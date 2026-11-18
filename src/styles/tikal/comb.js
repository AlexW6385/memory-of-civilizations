// The roof comb and the door of a Tikal shrine (docs/settlements/maya-tikal.md §13): the comb is a stepped wall of three stages, each with a
// base moulding and a cornice, its front opened by real recesses (piers, lintel and sill round a back wall of another colour), the lowest
// stage's niche holding the enthroned ruler; the crest a row of merlons. Doors have jambs and a lintel of four sapodilla planks.
// All closed solids merged into the plan's bag; nothing here is walked on or collides.

import { box } from '../../core/geom.js';
import { L, RED } from './kit.js';
import { lintelRelief } from './carve.js';
import { sculptKing } from './king.js';
import { jaguarLintel } from './lintel.js';

/** A box in a frame: u (depth), v (breadth), y (absolute). */
export const fbox = (bag, F, m, u0, u1, v0, v1, y0, y1) => { const r = F.R(u0, u1, v0, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); };

/**
 * The front wall of a stage of the comb with recesses: a back block from u0 + depth to u1 and, in front of it, the piers between the
 * niches, the sill below and the lintel above (the niche's back is `back`). niches: [{ c, w }] along v; y0..y1 the stage, n0..n1 the niche.
 */
function nichedFront(bag, F, o) {
  const { u0, u1, vh, y0, y1, n0, n1, niches, depth, mat, back } = o;
  fbox(bag, F, mat, u0 + depth, u1, -vh, vh, y0, y1);
  let v = -vh;
  const edges = [...niches].sort((a, b) => a.c - b.c);
  for (const n of edges) { if (n.c - n.w / 2 > v + 1e-3) fbox(bag, F, mat, u0, u0 + depth, v, n.c - n.w / 2, y0, y1); v = n.c + n.w / 2; }
  if (vh > v + 1e-3) fbox(bag, F, mat, u0, u0 + depth, v, vh, y0, y1);
  for (const n of edges) {
    fbox(bag, F, mat, u0, u0 + depth, n.c - n.w / 2, n.c + n.w / 2, y0, n0);
    fbox(bag, F, mat, u0, u0 + depth, n.c - n.w / 2, n.c + n.w / 2, n1, y1);
    fbox(bag, F, back, u0 + depth - 0.03, u0 + depth, n.c - n.w / 2, n.c + n.w / 2, n0, n1);
  }
}

/** The enthroned ruler in a niche: his bench, cushion, crossed legs, torso with its pectoral, arms, head and the headdress with its plumes. s = scale. */
function ruler(bag, F, ub, c, nBot, s) {
  const U = (a) => ub - a * s, V = (a) => c + a * s, Yv = (a) => nBot + a * s;
  const B = (m, u0, u1, v0, v1, y0, y1) => fbox(bag, F, m, U(u0), U(u1), V(v0), V(v1), Yv(y0), Yv(y1));
  B(L, 0.02, 0.62, -1.0, 1.0, 0, 0.8);                                   // the throne bench
  B(RED, 0.04, 0.6, -1.04, 1.04, 0.5, 0.58);                             // its painted band
  B('stucco_ochre', 0.05, 0.58, -0.92, 0.92, 0.8, 0.9);                  // the jaguar-skin cushion
  B(RED, 0.16, 0.56, -0.5, 0.5, 0.9, 1.12);                              // the crossed legs
  B('stucco_ochre', 0.16, 0.5, -0.5, -0.38, 0.9, 1.1); B('stucco_ochre', 0.16, 0.5, 0.38, 0.5, 0.9, 1.1);   // the knees' bare skin
  B(RED, 0.16, 0.44, -0.44, 0.44, 1.12, 2.1);                            // the torso in his cloak
  B('inlay_jade', 0.12, 0.17, -0.3, 0.3, 1.5, 2.0);                      // the pectoral
  for (const sg of [-1, 1]) B('stucco_ochre', 0.2, 0.42, sg > 0 ? 0.44 : -0.62, sg > 0 ? 0.62 : -0.44, 1.2, 1.95);   // the arms
  B('stucco_ochre', 0.18, 0.42, -0.24, 0.24, 2.1, 2.62);                 // the head
  B('maya_blue', 0.14, 0.2, -0.16, 0.16, 2.3, 2.42);                     // the ear and nose ornaments' band
  B(L, 0.12, 0.46, -0.52, 0.52, 2.62, 3.1);                              // the headdress' band
  B('maya_blue', 0.1, 0.4, -0.72, 0.72, 3.1, 3.5);                       // its fan
  B(RED, 0.12, 0.38, -0.46, 0.46, 3.5, 3.9);
  for (let i = -3; i <= 3; i++) B(i % 2 ? 'stucco_leaf' : 'maya_blue', 0.16, 0.3, i * 0.24 - 0.07, i * 0.24 + 0.07, 3.9, 4.3 - Math.abs(i) * 0.1);   // the plumes
  for (const sg of [-1, 1]) B('stucco_leaf', 0.2, 0.34, sg * 0.8 - 0.09, sg * 0.8 + 0.09, 2.7, 3.7);                                              // the long side plumes
}

/** The roof comb of a shrine: F = the shrine's frame, y = the roof's top, D, W the shrine's size, cmb the comb's height. */
export function roofComb(bag, F, y, D, W, cmb, rr, modelled = false) {
  const st = [[0.40, 1.0, 0.55], [0.46, 0.84, 0.28], [0.52, 0.66, 0.17]];
  let yy = y;
  st.forEach(([f0, vw, hf], i) => {
    const h = cmb * hf, u0 = D * f0, u1 = D * 0.98 - i * 0.7, vh = (W / 2 - 0.8) * vw, depth = Math.min(0.55, (u1 - u0) * 0.5);
    fbox(bag, F, L, u0 - 0.2, u1 + 0.12, -vh - 0.2, vh + 0.2, yy, yy + 0.3);                        // the base moulding
    const y0 = yy + 0.3, y1 = yy + h - 0.3, mat = i % 2 ? L : RED;
    if (i === 0) {
      const nw = Math.min(2.8, vh * 0.7), n0 = y0 + (y1 - y0) * 0.14, n1 = y0 + (y1 - y0) * 0.86, s = Math.min((n1 - n0) / 4.6, nw / 2.3);
      nichedFront(bag, F, { u0, u1, vh, y0, y1, n0, n1, niches: [{ c: 0, w: nw }], depth, mat, back: 'maya_blue' });
      if (modelled) { const U = (a) => u0 + depth - 0.03 - a * s, V = (a) => a * s, Yv = (a) => n0 + a * s, bx = (m, a0, a1, b0, b1, c0, c1) => fbox(bag, F, m, U(a0), U(a1), V(b0), V(b1), Yv(c0), Yv(c1)); bx(L, 0.02, 0.62, -1.0, 1.0, 0, 0.8); bx(RED, 0.04, 0.6, -1.04, 1.04, 0.5, 0.58); bx('stucco_ochre', 0.05, 0.58, -0.92, 0.92, 0.8, 0.9); sculptKing(bag, F, u0 + depth - 0.03, 0, n0, s); } else ruler(bag, F, u0 + depth - 0.03, 0, n0, s);
      for (const sg of [-1, 1]) {                                                                   // the glyph blocks on the piers, in rows
        const v0 = nw / 2 + 0.5, v1 = vh - 0.5, cols = Math.max(1, Math.floor((v1 - v0) / 1.0));
        if (v1 - v0 < 0.6) continue;
        for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) {
          const a = v0 + (v1 - v0) * c / cols, b = v0 + (v1 - v0) * (c + 1) / cols - 0.18, ya = y0 + 0.5 + r * (y1 - y0 - 1.0) / 4, yb = ya + (y1 - y0 - 1.0) / 4 - 0.22;
          if (yb - ya < 0.1) continue;
          fbox(bag, F, (r + c) % 2 ? 'maya_blue' : L, u0 - 0.06, u0, sg * a - (sg < 0 ? (b - a) : 0), sg * a + (sg > 0 ? (b - a) : 0), ya, yb);
        }
      }
    } else {
      const nw = Math.min(1.3, vh * 0.28), k = i === 1 ? 3 : 2, niches = [];
      for (let q = 0; q < k; q++) niches.push({ c: (q - (k - 1) / 2) * (vh * 1.9 / k), w: nw });
      nichedFront(bag, F, { u0, u1, vh, y0, y1, n0: y0 + (y1 - y0) * 0.2, n1: y0 + (y1 - y0) * 0.8, niches, depth: Math.min(0.4, depth), mat, back: i % 2 ? 'maya_blue' : 'stucco_ochre' });
      for (const n of niches) fbox(bag, F, RED, u0 + depth - 0.45, u0 + depth - 0.03, n.c - 0.3, n.c + 0.3, y0 + (y1 - y0) * 0.2, y0 + (y1 - y0) * 0.2 + 0.5);   // a mask's block in each
    }
    fbox(bag, F, L, u0 - 0.2, u1 + 0.12, -vh - 0.2, vh + 0.2, yy + h - 0.3, yy + h);               // the cornice
    yy += h;
  });
  // the crest: a row of stepped merlons along the top, a taller block in the middle
  const vh = (W / 2 - 0.8) * 0.66, u1 = D * 0.98 - 1.4, u0 = D * 0.52;
  const nm = Math.max(3, Math.floor(vh * 2 / 1.3));
  for (let i = 0; i < nm; i++) {
    const v = -vh + (i + 0.5) * (vh * 2) / nm;
    fbox(bag, F, i % 2 ? RED : L, u0 + 0.5, u1 - 0.3, v - 0.4, v + 0.4, yy, yy + 0.4);
    fbox(bag, F, i % 2 ? L : RED, u0 + 0.8, u1 - 0.6, v - 0.24, v + 0.24, yy + 0.4, yy + 0.85);
  }
  fbox(bag, F, L, u0 + 0.5, u1 - 0.3, -0.7, 0.7, yy + 0.4, yy + 0.6); fbox(bag, F, RED, u0 + 0.9, u1 - 0.7, -0.4, 0.4, yy + 0.6, yy + 1.5); fbox(bag, F, 'maya_blue', u0 + 1.1, u1 - 0.9, -0.2, 0.2, yy + 1.5, yy + 2.0);
  void rr;
}

/** A shrine door: jambs, a lintel of four sapodilla planks side by side (the central lintel of Temple I: four planks), the outer door's carved panel. */
export function shrineDoor(bag, F, y, u0, u1, dw, dh, front, jag = null) {
  const t = (u1 - u0 + 0.1) / 4;
  for (let p = 0; p < 4; p++) fbox(bag, F, 'timber', u0 - 0.05 + p * t, u0 - 0.05 + (p + 1) * t, -dw / 2 - 0.2, dw / 2 + 0.2, y + dh - 0.3 + (p % 2) * 0.02, y + dh);
  const Fu = { R: (a, b, c, d) => F.R(a + u0, b + u0, c, d) };
  if (jag && front) jaguarLintel(bag, F, jag, y + dh + 0.5, dw / 2 + 0.3); else lintelRelief(bag, Fu, y + dh + 0.6, y + dh + 1.95, dw / 2 + 0.3);                                                                   // the carved lintel above: the ruler on his throne
  if (!front) return;
  for (const sg of [-1, 1]) fbox(bag, F, L, -0.14, 0, sg > 0 ? dw / 2 : -dw / 2 - 0.3, sg > 0 ? dw / 2 + 0.3 : -dw / 2, y, y + dh);   // the stone jambs
  fbox(bag, F, L, -0.14, 0, -dw / 2 - 0.3, dw / 2 + 0.3, y + dh, y + dh + 0.14);                                                       // their cap
}

/** The front of a shrine between the door and the corners: panels framed in red, a blue field and a row of glyph blocks. v range of each side given. */
export function frontPanels(bag, F, y, len, dw, ceil) {
  const free = len / 2 - dw / 2 - 0.5;
  if (free < 1.2) return;
  for (const sg of [-1, 1]) {
    const a = dw / 2 + 0.35, b = len / 2 - 0.3, v0 = sg > 0 ? a : -b, v1 = sg > 0 ? b : -a, y0 = y + 0.6, y1 = y + ceil - 0.8;
    fbox(bag, F, RED, -0.07, 0, v0, v1, y0, y1);
    fbox(bag, F, 'maya_blue', -0.1, -0.07, v0 + 0.18, v1 - 0.18, y0 + 0.18, y1 - 0.18);
    const n = Math.max(1, Math.floor((v1 - v0 - 0.6) / 0.7));
    for (let k = 0; k < n; k++) { const q0 = v0 + 0.3 + k * (v1 - v0 - 0.6) / n; fbox(bag, F, k % 2 ? L : 'stucco_ochre', -0.14, -0.1, q0 + 0.06, q0 + (v1 - v0 - 0.6) / n - 0.06, y0 + 0.6, y1 - 0.6); }
  }
}
