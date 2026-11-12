// The courts of the terrace dressed for use (docs/settlements/persepolis.md §3, §13): the paving of dressed stone laid in
// large slabs with the stone-cut drains that ran under the terrace (Tilia 1978: the drainage channels cut in the bedrock
// and the paving), and the dado and painted band of the plastered mudbrick towers [inferred from the traces of colour].
import { box } from '../../core/geom.js';
import { rosette } from './reliefs.js';

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
  const [x0, z0, x1, z1] = el.q, y0 = el.y0, y1 = el.y1, o = 0.06, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const faces = [[x0, z0, x0, z1, -1, 0], [x0, z0, x1, z0, 0, -1], [x1, z0, x1, z1, 1, 0], [x0, z1, x1, z1, 0, 1]];
  for (const [ax, az, bx, bz, nx, nz] of faces) {
    const alongX = nz !== 0, L = alongX ? bx - ax : bz - az, a0 = alongX ? ax : az;
    // the faces turned away from the hall's middle are the outer ones, seen from the courts: they carry the glazed frieze and the niches
    const outer = !el.c || ((ax + bx) / 2 - el.c[0]) * nx + ((az + bz) / 2 - el.c[1]) * nz > 0;
    const R = (u0, u1, h0, h1, d) => alongX
      ? box(a0 + u0, h0, (nz < 0 ? az - d : az), a0 + u1, h1, (nz < 0 ? az : az + d))
      : box((nx < 0 ? ax - d : ax), h0, a0 + u0, (nx < 0 ? ax : ax + d), h1, a0 + u1);
    const place = (u, v, w) => (alongX ? [a0 + u, v, nz < 0 ? az - w : az + w] : [nx < 0 ? ax - w : ax + w, v, a0 + u]);
    bag.add(SLAB, R(0, L, y0, y0 + 1.4, o));                          // the stone socle
    bag.add(SLAB, R(0, L, y1 - 0.5, y1, o * 1.5));                    // the cornice course
    if (!outer) {
      const n = Math.floor(L / 1.2);
      for (let i = 0; i < n; i++) { const u = (i + 0.5) * L / n - 0.3; bag.add(i % 2 ? 'cloth_ochre' : 'egyptian_blue', R(u, u + 0.6, y1 - 1.6, y1 - 0.9, o)); }
      continue;
    }
    // the glazed frieze under the cornice: a lapis field between white borders, a row of yellow rosettes, a lower row of small ones [inferred: Susa's glazed brick]
    const fy = y1 - 3.4;
    bag.add('glaze_lapis', R(0.3, L - 0.3, fy, y1 - 0.5, o * 0.8));
    bag.add('glaze_white', R(0.3, L - 0.3, fy, fy + 0.16, o * 1.6)); bag.add('glaze_white', R(0.3, L - 0.3, y1 - 0.66, y1 - 0.5, o * 1.6));
    bag.add('glaze_yellow', R(0.3, L - 0.3, fy + 1.45, fy + 1.55, o * 1.6));
    const n = Math.floor((L - 0.6) / 1.5);
    for (let i = 0; i < n; i++) {
      const u = 0.3 + (i + 0.5) * (L - 0.6) / n;
      rosette(bag, 'glaze_yellow', place, u, fy + 2.1, 0.42, o * 1.2);
      rosette(bag, 'glaze_white', place, u, fy + 0.75, 0.22, o * 1.2);
    }
    // two tiers of tall niches with dark stone frames and a deep shadow, between the socle and the frieze (the Tachara's niches, repeated) [inferred]
    const m = Math.floor(L / 4.2), tiers = [[y0 + 2.4, y0 + 5.4], [y0 + 7.6, y0 + 10.6], [y0 + 12.8, y0 + 15.8]];
    for (let i = 0; i < m; i++) {
      const u = (i + 0.5) * L / m;
      for (const [h0, h1] of tiers) {
        bag.add('opening', R(u - 0.6, u + 0.6, h0, h1, o * 0.5));
        bag.add('marble_dark', R(u - 0.85, u - 0.6, h0 - 0.2, h1 + 0.35, o * 2.2)); bag.add('marble_dark', R(u + 0.6, u + 0.85, h0 - 0.2, h1 + 0.35, o * 2.2));
        bag.add('marble_dark', R(u - 0.85, u + 0.85, h1, h1 + 0.35, o * 2.8)); bag.add('marble_dark', R(u - 0.7, u + 0.7, h0 - 0.2, h0, o * 2.8));
      }
    }
  }
}

/**
 * porch_dress: { face ('w' | 'n' | 'e' | 's'), r: the wall's rect, y (the hall's floor), h (the column height), skip: [[u0, u1], …] (the doors' spans) } — the plastered
 * wall seen from under a portico: a stone dado, two tiers of dark-framed niches and a glazed frieze under the ceiling [inferred, after the Tachara's niches].
 */
export function porchDress(el, { bag }) {
  const [x0, z0, x1, z1] = el.r, y = el.y, h = el.h, o = 0.05, f = el.face, alongX = f === 'n' || f === 's';
  const L0 = alongX ? x0 : z0, L1 = alongX ? x1 : z1, w = f === 'w' ? x0 : f === 'e' ? x1 : f === 'n' ? z0 : z1, sg = f === 'w' || f === 'n' ? -1 : 1;
  const R = (u0, u1, h0, h1, d) => { const a = sg < 0 ? w - d : w, b = sg < 0 ? w : w + d; return alongX ? box(u0, y + h0, a, u1, y + h1, b) : box(a, y + h0, u0, b, y + h1, u1); };
  const free = (u0, u1) => !(el.skip ?? []).some(([a, b]) => u1 > a && u0 < b);
  const place = (u, v, d) => (alongX ? [u, y + v, w + sg * d] : [w + sg * d, y + v, u]);
  const spans = [], cuts = [L0 + 0.3, ...(el.skip ?? []).flatMap(([a, b]) => [a, b]), L1 - 0.3].sort((p, q) => p - q);
  for (let i = 0; i + 1 < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > 1) spans.push([cuts[i], cuts[i + 1]]);
  for (const [a, b] of spans) {
    bag.add('limestone_persian', R(a, b, 0, 1.1, o));
    bag.add('limestone_persian', R(a, b, 1.1, 1.25, o * 1.6));
    const fy = h - 3.0;
    bag.add('glaze_lapis', R(a, b, fy, h - 0.2, o * 0.8)); bag.add('glaze_white', R(a, b, fy, fy + 0.15, o * 1.6)); bag.add('glaze_white', R(a, b, h - 0.35, h - 0.2, o * 1.6));
    const n = Math.floor((b - a) / 1.5);
    for (let i = 0; i < n; i++) rosette(bag, 'glaze_yellow', place, a + (i + 0.5) * (b - a) / n, fy + 1.55, 0.4, o * 1.2);
    const m = Math.floor((b - a) / 4.4);
    for (let i = 0; i < m; i++) {
      const u = a + (i + 0.5) * (b - a) / m;
      for (const [h0, h1] of [[1.9, 4.9], [6.4, 9.4]]) {
        bag.add('opening', R(u - 0.6, u + 0.6, h0, h1, o * 0.5));
        bag.add('marble_dark', R(u - 0.85, u - 0.6, h0 - 0.2, h1 + 0.35, o * 2.2)); bag.add('marble_dark', R(u + 0.6, u + 0.85, h0 - 0.2, h1 + 0.35, o * 2.2));
        bag.add('marble_dark', R(u - 0.85, u + 0.85, h1, h1 + 0.35, o * 2.8)); bag.add('marble_dark', R(u - 0.7, u + 0.7, h0 - 0.2, h0, o * 2.8));
      }
      // rain streaks from the frieze's lower edge between the niches
      for (const k of [-1, 1]) { const us = u + k * 2.2, len = 2.6 + ((i * 5 + (k > 0 ? 2 : 0)) % 4) * 0.9; bag.add('plaster_damp', R(us - 0.12, us + 0.12, fy - len, fy, o * 0.4)); }
    }
    bag.add('plaster_damp', R(a, b, 1.25, 1.75, o * 0.4));      // the damp at the dado's top
  }
  void free;
}
