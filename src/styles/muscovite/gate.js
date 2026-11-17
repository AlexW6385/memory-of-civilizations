// The fronts of the gate tower (the Spassky tower, docs/settlements/muscovy.md §5.5): on both mouths of the passage the
// icon of the Saviour in a white-stone arched frame above the gate with its inscription plaque, tall blind arches
// and windows in white frames higher up, white belts round the shaft.

import { box } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { Shape, Path } from '../../core/three.js';
import { slab } from '../norse/index.js';

const WS = 'limestone', G = 'gilt_bronze';
/** An arched opening's outline: w wide, h high to the crown (the arch springing at h - w/2); with `hole` an inner one inset by `f`. */
function archShape(w, h, f = 0) {
  const sh = new Shape(), r = w / 2, sp = h - r;
  sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w, sp); sh.absarc(r, sp, r, 0, Math.PI, false); sh.lineTo(0, 0);
  if (f) { const p = new Path(), ri = r - f; p.moveTo(f, f); p.lineTo(f, sp); p.absarc(r, sp, ri, Math.PI, 0, true); p.lineTo(w - f, f); p.lineTo(f, f); sh.holes.push(p); }
  return sh;
}
export function gateFront(bag, x, z, r, yy, H, gh, ax, g) {
  const Bx = (a0, a1, b0, b1, y0, y1) => ax ? box(x + a0, y0, z + b0, x + a1, y1, z + b1) : box(x + b0, y0, z + a0, x + b1, y1, z + a1);
  const Pf = (e, u, off) => ax ? [x + e * (r + off), z + u] : [x + u, z + e * (r + off)];
  const base = yy - 3;
  // belts round the shaft: a plinth cap, a belt under the upper stage, a deep cornice under the parapet
  for (const [y0, y1, d] of [[yy + 0.5, yy + 0.75, 0.16], [yy + 13, yy + 13.3, 0.2], [base + H - 1.2, base + H - 0.9, 0.22]]) {
    for (const e of [-1, 1]) { bag.add(WS, Bx(e > 0 ? r - 0.05 : -r - d, e > 0 ? r + d : -r + 0.05, -r - d, r + d, y0, y1)); }
    for (const e of [-1, 1]) bag.add(WS, Bx(-r - d, r + d, e > 0 ? r - 0.05 : -r - d, e > 0 ? r + d : -r + 0.05, y0, y1));
  }
  for (const e of [-1, 1]) {
    // the Saviour's icon over the gate: a white arched frame with a step, the icon panel, the gilt halo and cross; under it the inscription plaque
    const w = 1.5, h = 3.6, y0 = gh + 1.6;
    bag.add(WS, slab(archShape(w + 0.9, h + 0.45, 0.3), 0.22, Pf(e, -(w + 0.9) / 2, 0.1), Pf(e, (w + 0.9) / 2, 0.1), y0 - 0.2, 10));
    bag.add(WS, slab(archShape(w + 0.4, h + 0.2, 0.0), 0.16, Pf(e, -(w + 0.4) / 2, 0.04), Pf(e, (w + 0.4) / 2, 0.04), y0 - 0.1, 10));
    bag.add('bronze', slab(archShape(w, h, 0), 0.1, Pf(e, -w / 2, 0.1), Pf(e, w / 2, 0.1), y0, 10));
    bag.add(G, orientedBox(Pf(e, -0.45, 0.2), Pf(e, 0.45, 0.2), 0.05, y0 + h * 0.52, y0 + h * 0.84));
    bag.add(G, orientedBox(Pf(e, -0.05, 0.22), Pf(e, 0.05, 0.22), 0.05, y0 + 0.4, y0 + h * 0.76));
    bag.add(G, orientedBox(Pf(e, -0.28, 0.22), Pf(e, 0.28, 0.22), 0.05, y0 + h * 0.46, y0 + h * 0.5));
    bag.add(WS, orientedBox(Pf(e, -1.9, 0.08), Pf(e, 1.9, 0.08), 0.16, gh + 0.55, gh + 1.35));
    bag.add('iron', orientedBox(Pf(e, -1.7, 0.17), Pf(e, 1.7, 0.17), 0.04, gh + 0.7, gh + 1.2));
    // the upper stages: a row of tall blind arches (the brick showing dark in them) and, above the belt, windows, all in white frames
    for (const [yb, hh, n, aw, op] of [[yy + 5.2, 5.6, 3, 1.5, 'opening'], [yy + 14.3, 4.8, 3, 1.4, 'opening'], [yy + 21.2, 4.2, 2, 1.3, 'opening']]) {
      const sp = 2 * r / n;
      for (let q = 0; q < n; q++) {
        const c = -r + (q + 0.5) * sp; if (yb === yy + 5.2 && Math.abs(c) < 0.5) continue;
        bag.add(WS, slab(archShape(aw + 0.6, hh + 0.3, 0.22), 0.16, Pf(e, c - (aw + 0.6) / 2, 0.08), Pf(e, c + (aw + 0.6) / 2, 0.08), yb - 0.15, 10));
        bag.add(op, slab(archShape(aw, hh, 0), 0.05, Pf(e, c - aw / 2, 0.02), Pf(e, c + aw / 2, 0.02), yb, 8));
      }
    }
  }
}
