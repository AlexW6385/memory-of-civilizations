// The Great Buddha of Tōdai-ji modelled for the near levels (docs/settlements/nara.md §19): the same figure as daibutsu.js (the old,
// reduced form, kept for the distance) but as sculpture seen from a few metres — a head whose face is a surface with brow, lids, nose,
// lips and cheeks, the snail-curl hair in rows on the head and the protuberance, long ears with their rim; a trunk with the robe's
// folds running parallel to the V of its opening, the bare chest between; arms rounded at the shoulder, with the sleeves hanging
// from them; hands with their fingers; the lap with the folds hanging in arcs from the knees; the lotus throne whose petals are
// curved shells with a rib. lvl 'mid' is the whole figure; lvl 'fine' is the layer drawn over it within a few metres (the curls'
// spirals, the engraving of the petals, the ear's rim, the toes, the knuckles' creases). In the figure's frame: x to its left, y up
// from the base of the throne (the seat 2.6), z forward.
import { figure, setFigure } from './sculpt.js';
import { tube, curve, ell, spline, hand, shell, head, faceField, strand, pleat, smooth, radiusAt, frame, ring, h01, add, mul, norm, cross } from './model.js';

const M = 'bronze', T = 2.6, Y = T;

/** daibutsu_mid / daibutsu_fine { at, y (the base of the throne), dir, h (the figure, 15.8 m seat to crown) } */
export const buddhaLevel = (lvl) => (el, { bag }) => {
  const s = (el.h ?? 15.8) / 15.8;
  setFigure(bag, figure(`buddha|${lvl}`, (S) => build(S, lvl === 'fine')), el.at, el.y ?? 0, el.dir || [0, 1], s);
};

const HEAD = [[0.001, 9.5], [1.1, 9.6], [1.75, 10.2], [2.05, 11.0], [2.2, 11.8], [2.25, 12.6], [2.2, 13.3], [1.95, 13.8], [1.62, 14.25], [1.5, 14.6], [1.35, 15.1], [0.9, 15.55], [0.4, 15.78], [0.001, 15.85]];
const HZ = 0.35, KZ = 0.95, CHIN = 9.5;
// the face in the head's units (u across to the left, v up from the chin): chin, lips, nose, lids, brows, cheeks, urna
export const FEATS = (() => {
  const F = [[0, 0.35, 0.5, 0.3, 0.12], [0, 0.82, 0.42, 0.1, 0.17], [0, 1.13, 0.4, 0.09, 0.14], [0, 0.98, 0.1, 0.05, 0.0],
    [0, 1.45, 0.07, 0.16, -0.05],
    [0, 2.62, 0.16, 0.16, 0.08], [0, 2.3, 0.17, 0.18, 0.17], [0, 2.0, 0.19, 0.17, 0.27], [0, 1.76, 0.22, 0.14, 0.38],
    [0, 1.5, 0.2, 0.05, -0.05], [0, 3.0, 0.13, 0.13, 0.11], [0, 2.85, 0.5, 0.3, 0.04]];
  F.push(...strand([[-0.62, 1.1], [-0.3, 1.03], [0, 1.01], [0.3, 1.03], [0.62, 1.1]], 0.032, -0.13));
  for (const s of [-1, 1]) {
    F.push([s * 0.34, 1.7, 0.13, 0.12, 0.25], [s * 0.15, 1.56, 0.07, 0.05, -0.1], [s * 1.2, 1.5, 0.55, 0.45, 0.09], [s * 0.9, 2.1, 0.38, 0.11, 0.06]);
    F.push(...strand([[s * 0.5, 2.13], [s * 0.75, 2.22], [s * 1.02, 2.22], [s * 1.34, 2.1]], 0.07, 0.15));          // the heavy upper lid
    F.push(...strand([[s * 0.52, 2.05], [s * 0.8, 2.1], [s * 1.05, 2.1], [s * 1.34, 2.0]], 0.033, -0.16));         // the slit of the half-closed eye
    F.push(...strand([[s * 0.55, 1.95], [s * 0.9, 1.91], [s * 1.28, 1.97]], 0.05, 0.07));                          // the lower lid
    F.push(...strand([[s * 0.3, 2.62], [s * 0.7, 2.76], [s * 1.1, 2.78], [s * 1.5, 2.62]], 0.09, 0.11));            // the long arched brow
    F.push(...strand([[s * 0.42, 1.72], [s * 0.58, 1.36], [s * 0.7, 1.06]], 0.07, -0.05));                          // the fold from nose to mouth
  }
  return F;
})();
const FIELD = faceField(FEATS);
const faceAt = (u, y) => FIELD(u, y - CHIN);

function build(S, fine) {
  const put = (g) => S.add(M, g);
  if (!fine) {
    throne(put);
    body(S, put);
    headAndHair(S, put);
    arms(put);
  } else {
    fineLayer(S, put);
  }
}

// ── the throne ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const petalPath = (hgt, flare) => [[0, 0], [0.5, 0.2], [1.2, 0.55], [2.0, 0.9], [hgt - 0.4, flare - 0.1], [hgt, flare]].map(([v, o]) => [0, v, o]);
/** A petal of the lotus: a curved shell standing out from the drum, a rib down the middle, edges rolled back, the point drawn out. */
function petal(a, r0, y0, hgt, flare, wid) {
  const path = spline(petalPath(hgt, flare), 3), d = [Math.cos(a), 0, Math.sin(a)], t = [-Math.sin(a), 0, Math.cos(a)];
  const g = tube(path, (u, th) => {
    const c = Math.cos(th), s = Math.sin(th), w = wid * Math.pow(Math.sin(Math.PI * Math.min(0.999, 0.1 + 0.9 * u * 0.96)), 0.75) * (u > 0.9 ? 1 - (u - 0.9) * 3 : 1);
    const thick = 0.1 + 0.07 * (1 - u), rib = 0.07 * Math.exp(-(((c * w) / (wid * 0.18)) ** 2)) * (1 - u * 0.4);
    return [c * w, s * (s > 0 ? thick + rib : thick * 0.6) - 0.22 * c * c * w * 0.4];
  }, 9, { up: [0, 0, 1], capA: false, capB: true, capLen: 1.4 });
  const pos = g.attributes.position.array, nor = g.attributes.normal.array;
  for (let i = 0; i < pos.length; i += 3) {
    const lx = pos[i], ly = pos[i + 1], lz = pos[i + 2];
    pos[i] = d[0] * (r0 + lz) + t[0] * lx; pos[i + 1] = y0 + ly; pos[i + 2] = d[2] * (r0 + lz) + t[2] * lx;
    const nx = nor[i], nz = nor[i + 2]; nor[i] = d[0] * nz + t[0] * nx; nor[i + 2] = d[2] * nz + t[2] * nx;
  }
  return g;
}
function throne(put) {
  S0.lathe1(put, [[9.2, 0], [9.2, 0.45], [8.2, 0.6], [6.6, 0.9], [6.5, T], [0.001, T]], 48);
  // a ring of small lotus beads at the foot of the drum, and the rim under the petals
  for (let k = 0; k < 48; k++) { const a = (k + 0.5) / 48 * Math.PI * 2; put(ell([Math.cos(a) * 9.0, 0.38, Math.sin(a) * 9.0], [0.34, 0.26, 0.34], undefined, 6, 4)); }
  for (let row = 0; row < 2; row++) for (let k = 0; k < 24; k++) {
    const a = (k + row * 0.5) / 24 * Math.PI * 2, hgt = 3.0 - row * 0.5 + 0.08 * Math.sin(k * 2.7 + row), flare = 1.2 - row * 0.1;
    put(petal(a, 6.6 + row * 0.35, 0.5 + row * 0.35, hgt, flare, 0.97));
  }
}
const S0 = { lathe1: (put, prof, n) => put(latheGeom(prof, n)) };
import { lathe as latheGeom } from '../../core/geom.js';

// ── the trunk, the lap, the neck ──────────────────────────────────────────────────────────────────────────────────────────────────
function body(S, put) {
  // the lap: the crossed legs under the robe, the folds hanging in arcs from the knees
  const lapDisp = (a, y, r) => {
    const ca = Math.cos(a); if (ca < -0.1) return 0;
    const lx = r * Math.sin(a), wf = smooth(-0.1, 0.55, ca) * smooth(0.15, 0.7, y) * (1 - smooth(2.4, 2.9, y));
    const phi = (y * 1.05 + 0.95 * (1 - Math.min(1, (lx / 5.0) ** 2)) + 0.3 * Math.sin(lx * 0.9)) / 0.52;
    return 0.13 * pleat(phi) * wf;
  };
  put(shell([[5.9, 0], [6.25, 0.8], [5.7, 1.9], [3.6, 2.7], [0.6, 2.98]], { n: 64, rows: 30, kz: 0.6, c: [0, Y, 1.3], disp: lapDisp }));
  for (const sx of [-1, 1]) put(ell([sx * 4.5, Y + 1.5, 2.9], [1.8, 1.2, 2.4], undefined, 12, 7));          // the knees
  // the trunk
  const torso = [[3.35, 1.6], [3.2, 3.5], [3.3, 5.2], [3.7, 7.0], [3.85, 7.9], [3.0, 8.7], [1.6, 9.1], [0.001, 9.25]];
  const trunkDisp = (a, yy, r) => {
    const y = yy - Y, ca = Math.cos(a); if (ca < -0.3) return 0;
    const lx = r * Math.sin(a), wf = smooth(-0.3, 0.45, ca), ax = Math.abs(lx), edge = 0.647 * (y - 5.0), q = ax - edge;
    let d = 0;
    if (y > 5.0 && q < 0) {                                                                     // the bare chest in the V
      d += 0.24 * Math.exp(-0.5 * (((ax - 1.25) / 0.85) ** 2 + ((y - 6.6) / 0.6) ** 2)) - 0.06 * Math.exp(-0.5 * (lx / 0.2) ** 2) * smooth(5.4, 6.4, y);
      d += -0.05 * (1 - smooth(0, 0.6, -q));
    } else {
      const wy = smooth(4.4, 5.6, y), phi = wy * q / 0.5 + (1 - wy) * ((5.0 - y) * 1.1 + 0.16 * lx * lx) / 0.58;
      d += 0.11 * pleat(phi) * smooth(0, 0.45, Math.max(q, 0));
      d += 0.1 * Math.exp(-0.5 * ((q / 0.12) ** 2)) * smooth(5.0, 5.6, y);                        // the edge of the robe, a roll
    }
    return d * wf;
  };
  put(shell(torso.map(([r, y]) => [r, y + Y]), { n: 72, rows: 40, kz: 0.66, c: [0, 0, -0.3], disp: (a, y, r) => trunkDisp(a, y, r) }));
  for (const sx of [-1, 1]) put(ell([sx * 3.55, Y + 7.45, -0.3], [1.55, 1.4, 1.3], undefined, 12, 8));  // the shoulders
  // the neck with its three folds
  put(latheGeom([[1.5, 0], [1.56, 0.2], [1.44, 0.35], [1.5, 0.5], [1.4, 0.7], [1.45, 0.85], [1.35, 1.1], [0.001, 1.1]].map(([r, y]) => [r, y + Y + 8.6]), 28, null, 0, 0, 0.1));
  void S;
}

// ── the head ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function headAndHair(S, put) {
  const prof = HEAD.map(([r, y]) => [r, y + Y]);
  put(head(prof, { c: [0, 0, HZ], kz: KZ, field: (u, v) => FIELD(u, v), chinY: CHIN + Y, n: 128, rows: 84 }));
  // the curls, in rows over the head and the protuberance; the brow and the face stay bare
  for (let yy = 11.5; yy < 15.65; yy += 0.36) {
    const r = radiusAt(HEAD, yy) + 0.04, n = Math.max(6, Math.floor(2 * Math.PI * r / 0.38));
    for (let k = 0; k < n; k++) {
      const a = (k + (Math.round(yy / 0.36) % 2) * 0.5) / n * Math.PI * 2, fa = Math.cos(a);
      if (yy < 12.95 && fa > (yy < 12.3 ? -0.2 : 0.35)) continue;
      const c = [Math.sin(a) * r, yy + Y, HZ + fa * r * KZ], nn = norm([Math.sin(a), 0.15, fa * KZ]);
      const u = norm(cross(nn, [0, 1, 0.0001])), v = cross(nn, u), j = 0.9 + 0.2 * h01(c[0], c[1], c[2]);
      put(ell(c, [0.2 * j, 0.2 * j, 0.13], [u, v, nn], 6, 3));
    }
  }
  // the ears: long, thin, the lobe hanging to the jaw
  for (const sx of [-1, 1]) {
    const path = spline([[sx * 2.12, 12.55, 0.45], [sx * 2.38, 11.7, 0.25], [sx * 2.5, 10.75, 0.15], [sx * 2.44, 10.0, 0.22]].map(([x, y, z]) => [x, y + Y, z]), 3);
    put(tube(path, (t, th) => { const w = 0.5 * (0.7 + 0.6 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.1)) ** 0.6) * (t > 0.85 ? 1 - (t - 0.85) * 1.2 : 1); return [Math.cos(th) * w, Math.sin(th) * (0.17 + 0.07 * (1 - t))]; }, 10, { up: [sx, 0, 0], capA: true, capB: true, capLen: 0.8 }));
  }
  void S;
}

// ── the arms and hands ────────────────────────────────────────────────────────────────────────────────────────────────────────────
function arms(put) {
  const R = -1, L = 1;                                                           // the right arm is on −x
  // the right arm, raised: the upper arm, the elbow, the forearm rising, the sleeve with its hanging flap
  { const sh = [R * 3.6, Y + 7.5, -0.3], el = [R * 4.7, Y + 4.4, 1.3], wr = [R * 3.9, Y + 6.55, 3.5];
    put(curve([sh, add(sh, [R * 0.7, -1.5, 0.5]), el], 1.3, 1.05, { n: 12, per: 3, swell: 0.1 }));
    put(ell(el, [1.1, 1.1, 1.1], undefined, 10, 6));
    put(tube(spline([el, add(el, [R * -0.2, 1.1, 1.0]), wr], 4), (t, th) => { const r = 1.0 - 0.12 * t + 0.3 * smooth(0.8, 1, t), k = 1 + 0.07 * pleat(th / (Math.PI * 2) * 5 + t * 0.6); return [Math.cos(th) * r * k, Math.sin(th) * r * k * 0.92]; }, 12, { up: [0, 0, 1] }));
    put(tube(spline([add(el, [0, -0.5, 0]), [R * 4.7, Y + 3.5, 1.2], [R * 4.5, Y + 2.2, 1.7]], 3), (t, th) => { const w = 0.85 - 0.25 * t, k = 1 + 0.12 * pleat(th / Math.PI + t * 0.8); return [Math.cos(th) * w * k, Math.sin(th) * 0.28 * k]; }, 10, { up: [0, 0, 1] }));
    const F = frame([wr[0], wr[1] + 0.05, wr[2] + 0.1], [1, 0, 0], [0, 1, 0], [0, 0, 1], 1.7);
    for (const g of hand(F, { curl: [0.08, 0.05, 0.09, 0.18], spread: 0.1, thumb: [0.75, 0.15] })) put(g);
  }
  // the left arm, lower: the hand open on the knee, palm up
  { const sh = [L * 3.6, Y + 7.5, -0.3], el = [L * 4.8, Y + 4.2, 0.9], wr = [L * 4.4, Y + 3.0, 3.35];
    put(curve([sh, add(sh, [L * 0.8, -1.7, 0.2]), el], 1.3, 1.05, { n: 12, per: 3, swell: 0.1 }));
    put(ell(el, [1.1, 1.1, 1.1], undefined, 10, 6));
    put(tube(spline([el, [L * 4.8, Y + 3.5, 2.2], wr], 4), (t, th) => { const r = 1.0 - 0.3 * t + 0.25 * smooth(0.82, 1, t), k = 1 + 0.07 * pleat(th / (Math.PI * 2) * 5 + t * 0.6); return [Math.cos(th) * r * k, Math.sin(th) * r * k * 0.9]; }, 12, { up: [1, 0, 0] }));
    const F = frame([wr[0], wr[1] - 0.1, wr[2] + 0.1], [-1, 0, 0], [0, 0, 1], [0, 1, 0], 1.7);
    for (const g of hand(F, { curl: [0.22, 0.26, 0.3, 0.38], spread: 0.08, thumb: [0.7, 0.1] })) put(g);
  }
}

// ── the fine layer ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function fineLayer(S, put) {
  // the snail spirals on every curl
  for (let yy = 11.5; yy < 15.65; yy += 0.36) {
    const r = radiusAt(HEAD, yy) + 0.04, n = Math.max(6, Math.floor(2 * Math.PI * r / 0.38));
    for (let k = 0; k < n; k++) {
      const a = (k + (Math.round(yy / 0.36) % 2) * 0.5) / n * Math.PI * 2, fa = Math.cos(a);
      if (yy < 12.95 && fa > (yy < 12.3 ? -0.2 : 0.35)) continue;
      const c = [Math.sin(a) * r, yy + Y, HZ + fa * r * KZ], nn = norm([Math.sin(a), 0.15, fa * KZ]);
      put(ring(add(c, nn, 0.1), 0.095, 0.034, nn, 9, 4));
    }
  }
  // the rim of each ear and the opening of the ear
  for (const sx of [-1, 1]) {
    const path = spline([[sx * 2.2, 12.5, 0.62], [sx * 2.45, 11.8, 0.5], [sx * 2.58, 10.9, 0.4], [sx * 2.52, 10.2, 0.4]].map(([x, y, z]) => [x, y + Y, z]), 3);
    put(tube(path, () => 0.05, 6, { capA: true, capB: true }));
  }
  // the engraving of the upper petals: Shaka on a lotus in a pointed oval, two attendants, three small Buddhas above (docs §17)
  for (let k = 0; k < 24; k++) {
    const a = k / 24 * Math.PI * 2, d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], r0 = 6.6, y0 = 0.5;
    const P = (w, v) => { const o = 0.4 * v * v / 3 + 0.18 + 0.02; return [t[0] * w + d[0] * (r0 + o), y0 + v, t[1] * w + d[1] * (r0 + o)]; };
    const oval = []; for (let i = 0; i < 10; i++) { const q = i / 10 * Math.PI * 2; oval.push(P(0.5 * Math.sin(q), 1.8 + 0.55 * Math.cos(q) * (Math.cos(q) > 0 ? 1.15 : 1))); }
    put(tube([...oval, oval[0], oval[1]], () => 0.022, 5, { capA: false, capB: false }));
    const wb = (p, rr, kz = 1) => put(ell(p, [rr, rr, rr * kz * 0.6], [[t[0], 0, t[1]], [0, 1, 0], [d[0], 0, d[1]]], 7, 4));
    wb(P(0, 1.5), 0.17, 1); wb(P(0, 1.8), 0.14); wb(P(0, 2.03), 0.085);
    for (const sd of [-1, 1]) { wb(P(sd * 0.34, 1.68), 0.07); wb(P(sd * 0.34, 1.83), 0.045); }
    for (let i = -1; i <= 1; i++) { wb(P(i * 0.36, 2.55), 0.06); wb(P(i * 0.36, 2.45), 0.07); }
  }
  // the toes of the crossed feet under the robe's hem
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) put(ell([sx * (3.6 + i * 0.34), Y + 2.55 + 0.1 * Math.sin(i), 4.05 - 0.1 * Math.abs(i - 2)], [0.17, 0.2, 0.24], undefined, 6, 4));
  void S;
}
