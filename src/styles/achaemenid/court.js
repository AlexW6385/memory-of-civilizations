// The courts of the terrace dressed for use (docs/settlements/persepolis.md §3, §13): the paving of dressed stone laid in
// large slabs with the stone-cut drains that ran under the terrace (Tilia 1978: the drainage channels cut in the bedrock
// and the paving), and the dado and painted band of the plastered mudbrick towers [inferred from the traces of colour].
import { box } from '../../core/geom.js';

const JOINT = 'basalt', SLAB = 'limestone_persian';

/**
 * terrace_paving: { rect, y (the terrace's top), drains: [[x0, z0, x1, z1], …] } — thin joint lines every 3.6 m both ways and
 * the open stone drains (a dark groove between two kerbs), laid just above the terrace so they read from standing height.
 */
export function terracePaving(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, step = el.step ?? 3.6;
  for (let x = x0 + step; x < x1 - 0.1; x += step) bag.add(JOINT, box(x - 0.025, y, z0, x + 0.025, y + 0.012, z1));
  for (let z = z0 + step; z < z1 - 0.1; z += step) bag.add(JOINT, box(x0, y, z - 0.025, x1, y + 0.012, z + 0.025));
  for (const [a0, b0, a1, b1] of el.drains ?? []) {
    const alongX = a1 - a0 >= b1 - b0, w = 0.16;
    if (alongX) {
      bag.add(JOINT, box(a0, y, (b0 + b1) / 2 - w / 2, a1, y + 0.014, (b0 + b1) / 2 + w / 2));
      for (const s of [-1, 1]) bag.add(SLAB, box(a0, y, (b0 + b1) / 2 + s * (w / 2 + 0.07) - 0.07, a1, y + 0.06, (b0 + b1) / 2 + s * (w / 2 + 0.07) + 0.07));
    } else {
      bag.add(JOINT, box((a0 + a1) / 2 - w / 2, y, b0, (a0 + a1) / 2 + w / 2, y + 0.014, b1));
      for (const s of [-1, 1]) bag.add(SLAB, box((a0 + a1) / 2 + s * (w / 2 + 0.07) - 0.07, y, b0, (a0 + a1) / 2 + s * (w / 2 + 0.07) + 0.07, y + 0.06, b1));
    }
  }
}

/**
 * tower_dress: { q: [x0, z0, x1, z1] (the tower's plan), y0 (the terrace), y1 (the cornice) } — a stone socle, a band of blue and
 * ochre squares under the cornice and a dark cornice course on the two faces toward the court (west and north) and the others plain.
 */
export function towerDress(el, { bag }) {
  const [x0, z0, x1, z1] = el.q, y0 = el.y0, y1 = el.y1, o = 0.06;
  const faces = [[x0, z0, x0, z1, -1, 0], [x0, z0, x1, z0, 0, -1], [x1, z0, x1, z1, 1, 0], [x0, z1, x1, z1, 0, 1]];
  for (const [ax, az, bx, bz, nx, nz] of faces) {
    const alongX = nz !== 0, L = alongX ? bx - ax : bz - az, a0 = alongX ? ax : az;
    const R = (u0, u1, h0, h1, d) => alongX
      ? box(a0 + u0, h0, (nz < 0 ? az - d : az), a0 + u1, h1, (nz < 0 ? az : az + d))
      : box((nx < 0 ? ax - d : ax), h0, a0 + u0, (nx < 0 ? ax : ax + d), h1, a0 + u1);
    bag.add(SLAB, R(0, L, y0, y0 + 1.4, o));                          // the stone socle
    bag.add(SLAB, R(0, L, y1 - 0.5, y1, o * 1.5));                    // the cornice course
    const n = Math.floor(L / 1.2);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * L / n - 0.3;
      bag.add(i % 2 ? 'cloth_ochre' : 'egyptian_blue', R(u, u + 0.6, y1 - 1.6, y1 - 0.9, o));
    }
  }
}
