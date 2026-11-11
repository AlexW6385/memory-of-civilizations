// The Bian's earth banks beyond the stone ones (docs/settlements/song-kaifeng.md §11): a revetment of driven timber piles
// with a wale and woven wattle behind, mooring posts, and the timber wharves with their stepped landings.
import { box, fromTriangles } from '../../core/geom.js';
import { RIVER } from './layout.js';

function pushBox(A, x0, y0, z0, x1, y1, z1) { for (const q of box(x0, y0, z0, x1, y1, z1).attributes.position.array) A.push(q); }

/** bian_revetment: { x0, x1, bank: 'n' | 's' } — piles every 1.3 m along the water's edge, a wale across their tops, wattle between pile and bank. */
export function bianRevetment(el, { bag }) {
  const d = el.bank === 'n' ? 1 : -1, e = el.bank === 'n' ? RIVER.z0 : RIVER.z1, ze = e - d * 0.55, w = RIVER.water;
  const T = [], Wk = [], n = Math.max(1, Math.round((el.x1 - el.x0) / 1.3));
  for (let k = 0; k <= n; k++) {
    const x = el.x0 + (el.x1 - el.x0) * k / n, h = w + 0.55 + ((k * 7919) % 5) * 0.06;
    pushBox(T, x - 0.09, w - 1.0, ze - 0.09, x + 0.09, h, ze + 0.09);
  }
  pushBox(T, el.x0 - 0.1, w + 0.18, ze - 0.14 * d - 0.08, el.x1 + 0.1, w + 0.34, ze - 0.14 * d + 0.08);   // the wale, on the landward face
  // the wattle: woven hurdles between the piles and the bank, in bays
  for (let k = 0; k < n; k++) {
    const xa = el.x0 + (el.x1 - el.x0) * k / n + 0.1, xb = el.x0 + (el.x1 - el.x0) * (k + 1) / n - 0.1;
    pushBox(Wk, xa, w - 0.9, Math.min(ze - d * 0.2, ze - d * 0.1) - 0.03, xb, w + 0.46, Math.max(ze - d * 0.2, ze - d * 0.1) + 0.03);
  }
  bag.add('timber', fromTriangles(T)); bag.add('wicker', fromTriangles(Wk));
}

/** wharf: { x, bank } — a timber stage on piles reaching over the water, stepped down to a low landing, with mooring posts. */
export function wharf(el, { bag, col }) {
  const d = el.bank === 'n' ? 1 : -1, e = el.bank === 'n' ? RIVER.z0 : RIVER.z1, w = RIVER.water, X = el.x, hw = 2.6;
  const Z = (t) => e + d * t, rect = (t0, t1, x0 = X - hw, x1 = X + hw) => [x0, Math.min(Z(t0), Z(t1)), x1, Math.max(Z(t0), Z(t1))];
  const deck = [[-3.4, 2.2, -0.02], [2.2, 3.4, -0.5], [3.4, 4.6, -0.98], [4.6, 5.8, -1.28]];
  const T = [], P = [];
  deck.forEach(([t0, t1, y], i) => {
    const r = rect(t0, t1, X - hw + i * 0.15, X + hw - i * 0.15);
    pushBox(T, r[0], y - 0.2, r[1], r[2], y, r[3]);
    col.floor([r[0], r[1], r[2], r[3]], y);
    // planks' joints: boards across the deck
    for (let b = 0; b < 4; b++) { const tt = t0 + (t1 - t0) * b / 4; pushBox(P, r[0], y, Z(tt) - 0.01, r[2], y + 0.015, Z(tt) + 0.01); }
    // piles under it at the corners and the middle, driven to the bed
    for (const px of [r[0] + 0.15, (r[0] + r[2]) / 2, r[2] - 0.15]) for (const pz of [Z(t0 + (t1 - t0) * 0.15), Z(t1 - (t1 - t0) * 0.15)]) if (Z(t0) !== Z(t1)) pushBox(T, px - 0.1, RIVER.bed, pz - 0.1, px + 0.1, y - 0.2, pz + 0.1);
  });
  // rails: low posts at the deck's sides (the first stage only) and bollards at the landing
  for (const sx of [-1, 1]) for (const t of [-3, -1, 1]) { const px = X + sx * (hw - 0.1); pushBox(T, px - 0.06, 0, Z(t) - 0.06, px + 0.06, 0.9, Z(t) + 0.06); }
  for (const sx of [-1, 1]) { const px = X + sx * (hw - 0.1); pushBox(T, px - 0.04, 0.4, Z(-3) - 0.04, px + 0.04, 0.5, Z(1) + 0.04); }
  for (const sx of [-1, 1]) { const px = X + sx * (hw - 0.55); pushBox(T, px - 0.1, -1.28, Z(5.3) - 0.1, px + 0.1, -0.7, Z(5.3) + 0.1); }
  bag.add('timber', fromTriangles(T)); bag.add('planks_grey', fromTriangles(P));
}
