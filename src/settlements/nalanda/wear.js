// Nalanda about 640 — wear and weathering (docs/settlements/nalanda.md §22): what the monsoon and the feet of the place leave on brick and plaster. Wraps the nalanda
// style's `monastery` and `house_bihar` from here (the style files stay as they were); pure functions of the element's own numbers, hashes of their own places (no
// counters, no Math.random). Nothing is written anywhere: no inscription is drawn (§22: the Siddham of the time cannot be checked glyph by glyph here).
import '../../styles/nalanda/index.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { houseDoor } from '../../styles/nalanda/houses.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// the cell block's numbers (src/styles/nalanda/index.js: CELL, BLOCK)
const OUT = 1.0, CLEAR = 3.0, INNER = 0.5, BLOCK = OUT + CLEAR + INNER;

/** The weathering of a monastery: the darkened, damp feet of the outer walls where the monsoon's splash and the rising damp keep them wet (on some cells' piers, in the lee of the way), the threshold of the gate worn pale by the feet of the whole sangha, the doorsills of the cells (a hollow in the middle of each, worn by the monks who live there). */
function monasteryWear(el, bag) {
  const [x0, z0, x1, z1] = el.rect;
  const sides = [
    { A: [x0, z0], B: [x1, z0], n: [0, 1] }, { A: [x1, z0 + BLOCK], B: [x1, z1 - BLOCK], n: [-1, 0] },
    { A: [x1, z1], B: [x0, z1], n: [0, -1] }, { A: [x0, z1 - BLOCK], B: [x0, z0 + BLOCK], n: [1, 0] },
  ];
  const put = (mat, p, q, ya, yb) => bag.add(mat, box(Math.min(p[0], q[0]), ya, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yb, Math.max(p[1], q[1])));
  sides.forEach((sd, si) => {
    const { A, B, n } = sd, L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
    const P = (s, d) => [A[0] + u[0] * s + n[0] * d, A[1] + u[1] * s + n[1] * d];
    const nc = si % 2 === 0 ? 15 : 11, pitch = L / nc, gate = si === 3 ? (nc - 1) / 2 : -1;
    for (let k = 0; k < nc; k++) {
      const c = (k + 0.5) * pitch, q = P(c, 0);
      if (k === gate) {
        if (el.enter) put('lime_plaster', P(c - 0.9, 0.8), P(c + 0.9, 2.6), 0, 0.006);       // the gate's threshold: worn grey, the width of the passage
        continue;
      }
      const h = hashAt(q[0], q[1], 17 + si);
      if (h < 0.42) {                                                                           // the outer wall's foot: green and dark with the monsoon
        const w = 0.35 + 0.5 * hashAt(q[0], q[1], 3), ht = 0.22 + 0.5 * hashAt(q[0], q[1], 5);
        put('brick_baked', P(c - w, -0.016), P(c + w, -0.002), 0, ht);
        if (h < 0.15) put('brick_baked', P(c - w * 0.6, -0.034), P(c + w * 0.6, -0.018), ht, ht + 0.35 + 0.4 * hashAt(q[0], q[1], 9));      // a streak above it
      }
      if (el.enter && hashAt(q[0], q[1], 29) < 0.6) {                                          // the cell's doorsill, worn in its middle (the verandah side of the cell block)
        const d0 = OUT + CLEAR + INNER - 0.02;
        const a = 0.3 + 0.15 * hashAt(q[0], q[1], 31), b = 0.3 + 0.2 * hashAt(q[0], q[1], 33);      // (no two alike: a shape repeated twelve times would be an instanced draw of its own)
        put('lime_plaster', P(c - a, d0 - 0.4), P(c + a, d0 + b), 0, 0.005);
      }
    }
  });
}

/** The step of a house: a worn hollow in the middle of the door's step (the lime plaster polished pale by bare feet) — on the opened houses and on one in three of the others. */
function houseWear(el, bag) {
  const F = houseDoor(el), y = (el.y ?? 0) + 0.45 - 0.02;                                          // the step's top (houses.js: fy - 0.02)
  if (!el.open && hashAt(el.rect[0], el.rect[1], 41) > 0.33) return;
  const w = 0.3 + 0.15 * hashAt(el.rect[0], el.rect[1], 43), a = F.P(F.du - w, -0.42), b = F.P(F.du + w, -0.06 - 0.1 * hashAt(el.rect[1], el.rect[0], 45));
  bag.add('lime_plaster', box(Math.min(a[0], b[0]), y, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + 0.006, Math.max(a[1], b[1])));
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.nalanda.elements, wrap = (name, fn, wear) => {
    E[name] = function worn(el, ctx) { const r = fn.call(this, el, ctx); if (!el.simple && ctx?.bag) wear(el, ctx.bag); return r; };
  };
  wrap('monastery', E.monastery, monasteryWear);
  wrap('house_bihar', E.house_bihar, houseWear);
}
registerWear();
