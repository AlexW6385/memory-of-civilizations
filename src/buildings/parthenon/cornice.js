// The Parthenon's roofline and its paint (docs/buildings/parthenon.md §4, docs/settlements/athens.md §4g): the sima, the
// gutter-wall along the eaves of both long sides, a cyma in steps carrying the lotus-and-palmette anthemion in red and
// blue and a lion-head spout over every column and every intercolumniation; the anthemion along the raking sima of the
// gables; the painted leaf moulding (the Doric hawksbeak, red and white leaves) round the head of the frieze; and the
// floral acroteria, a great one over the middle of each gable (an acanthus calyx, two scrolls, a fan palmette) and a smaller
// one on each corner. Registered as the greek style's elements `parthenon_cornice` and `parthenon_acroteria`.
import { Matrix4 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import '../../styles/greek/index.js';
import { limb, blob } from '../../styles/greek/sculpture.js';
import { merge } from '../../styles/greek/columns.js';

/** A convex plate (poly in the frame's a–b plane, counter-clockwise) raised `depth` along n from the frame: its triangles pushed to out.
 *  With `flat`, only the face (a few millimetres off the surface: paint, nothing to see from the side). */
function plate(out, poly, depth, F, flat = false) {
  const P = (p, d) => [F.o[0] + F.a[0] * p[0] + F.b[0] * p[1] + F.n[0] * d, F.o[1] + F.a[1] * p[0] + F.b[1] * p[1] + F.n[1] * d, F.o[2] + F.a[2] * p[0] + F.b[2] * p[1] + F.n[2] * d];
  const t = [];
  for (let i = 1; i < poly.length - 1; i++) t.push(...P(poly[0], depth), ...P(poly[i], depth), ...P(poly[i + 1], depth));
  if (flat) {
    for (let i = 0; i < t.length; i += 9) {
      const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
      if ((uy * vz - uz * vy) * F.n[0] + (uz * vx - ux * vz) * F.n[1] + (ux * vy - uy * vx) * F.n[2] < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
    }
  } else {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      t.push(...P(p, 0), ...P(q, 0), ...P(q, depth), ...P(p, 0), ...P(q, depth), ...P(p, depth));
    }
    orientOutward(t);
  }
  for (let i = 0; i < t.length; i++) out.push(t[i]);
}
const petal = (w, L) => [[-w, 0], [w, 0], [w * 0.8, L * 0.62], [0, L], [-w * 0.8, L * 0.62]];
const rotP = (p, a, dx = 0, dy = 0) => p.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a) + dx, x * Math.sin(a) + y * Math.cos(a) + dy]);

/**
 * The anthemion along a run: lotus and palmette in turn over a length `len` from the frame's origin, pitch `pitch`, height `hh`
 * (a palmette of five petals fanned from a base, a lotus of a tall middle petal between two that curl away), alternating red and blue.
 */
function anthemion(red, blue, F, len, pitch, hh, depth = 0.012) {
  const n = Math.floor(len / pitch);
  for (let k = 0; k < n; k++) {
    const cx = (k + 0.5) * pitch, even = k % 2 === 0, out = even ? red : blue;
    if (even) for (let i = -2; i <= 2; i++) plate(out, rotP(petal(pitch * 0.058, hh * 0.78), -i * 0.36, cx, hh * 0.1), depth, F, true);   // the palmette
    else {
      plate(blue, rotP(petal(pitch * 0.07, hh * 0.92), 0, cx, hh * 0.06), depth, F, true);                                          // the lotus: its tall petal
      for (const s of [-1, 1]) plate(blue, rotP(petal(pitch * 0.05, hh * 0.55), -s * 0.75, cx + s * pitch * 0.07, hh * 0.08), depth, F, true);
    }
    // the little bud between the units
    plate(red, rotP(petal(pitch * 0.03, hh * 0.42), 0, cx + pitch / 2, hh * 0.04), depth, F, true);
  }
}

/** A lion's head spout facing +z at the origin: a mane of lobes round a broad face, the jaws open for the water. */
function lionHead(S = 1) {
  const g = [];
  const mane = lathe([[0.001, 0], [0.1, 0.01], [0.22, 0.03], [0.255, 0.06], [0.2, 0.1], [0.001, 0.11]], 20, (th, i) => (i >= 2 && i <= 4 ? 1 + 0.12 * Math.max(0, Math.cos(th * 9)) : 1));
  mane.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
  g.push(mane);
  g.push(blob([0, 0.0, 0.14], 0.12, [1.0, 0.92, 1.15], 10));                                  // the face
  g.push(blob([0, -0.045, 0.235], 0.062, [1.15, 0.7, 1.2], 8));                               // the muzzle
  g.push(limb([0, 0.07, 0.17], [0, -0.005, 0.27], 0.03, 0.026, 5));                         // the nose
  for (const s of [-1, 1]) {
    g.push(blob([s * 0.058, 0.055, 0.215], 0.028, [1.1, 0.7, 0.8], 6));                       // the brow
    g.push(blob([s * 0.12, 0.12, 0.11], 0.038, [1, 1, 0.5], 6));                              // the ears
    g.push(blob([s * 0.05, -0.065, 0.225], 0.03, [1, 0.7, 1.0], 6));                          // the cheeks
  }
  const m = new Matrix4().makeScale(S, S, S);
  return merge(g).applyMatrix4(m);
}

/** One great floral acroterion at the origin facing +z, height h: the calyx of acanthus, the scrolls, the fan, in the x–y plane. */
function acroterionRich(h) {
  const marble = [], gilt = [];
  const k = h / 3.4, L = (a, b, r0, r1, n = 6) => limb(a.map((v) => v * k), b.map((v) => v * k), r0 * k, r1 * k, n);
  marble.push(box(-0.5 * k, 0, -0.2 * k, 0.5 * k, 0.22 * k, 0.2 * k), box(-0.38 * k, 0.22 * k, -0.15 * k, 0.38 * k, 0.34 * k, 0.15 * k));      // the plinth
  // the calyx: acanthus leaves curling out from a central stem, three tiers each side
  for (const s of [-1, 1]) for (let tier = 0; tier < 3; tier++) {
    const y0 = 0.34 + tier * 0.28, w = 0.3 + tier * 0.12;
    marble.push(L([s * 0.05, y0, 0], [s * w * 0.8, y0 + 0.14, 0.02], 0.1, 0.06), L([s * w * 0.8, y0 + 0.14, 0.02], [s * (w + 0.1), y0 + 0.36, 0.0], 0.06, 0.02));
    marble.push(blob([s * w * 0.55, y0 + 0.12, 0.05].map((v) => v * k), 0.07 * k, [1.4, 0.7, 0.6], 5));
  }
  marble.push(L([0, 0.34, 0], [0, 1.55, 0], 0.13, 0.08, 8));                                                                                  // the stem
  // the scrolls: from the calyx's sides out and round, a spiral of seven turns of a rod that thins
  for (const s of [-1, 1]) {
    let px = s * 0.12, py = 1.0;
    const N = 30;
    for (let i = 0; i < N; i++) {
      const t = i / N, a = Math.PI * (0.7 + 3.4 * t), r = 0.5 * (1 - t * 0.85);
      const qx = s * (0.12 + 0.42 + Math.cos(Math.PI - a) * r * 1.0 + 0.0), qy = 1.18 + Math.sin(a) * r * 0.9 + 0.1 * (1 - t);
      marble.push(L([px, py, 0], [qx, qy, 0], 0.045 * (1 - t * 0.6) + 0.012, 0.045 * (1 - (t + 1 / N) * 0.6) + 0.012, 5));
      px = qx; py = qy;
    }
    marble.push(blob([px * k, py * k, 0], 0.05 * k, [1, 1, 0.6], 5));
  }
  // the fan palmette on the top: eleven petals, flat plates standing in the plane, ribbed with a bead down each
  const fan = [];
  for (let i = -5; i <= 5; i++) {
    const a = i * 0.24, Lp = 1.05 - Math.abs(i) * 0.05, w = 0.075;
    const poly = rotP(petal(w, Lp), -a, 0, 0).map(([x, y]) => [x * k, (y + 1.5) * k]);
    plate(fan, poly, 0.07 * k, { o: [0, 0, -0.035 * k], a: [1, 0, 0], b: [0, 1, 0], n: [0, 0, 1] });
  }
  gilt.push(fromTriangles(fan));
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) {                                                                                        // small palmettes on the scroll ends
    const a = (i - 2) * 0.34, poly = rotP(petal(0.045, 0.34), -a, 0, 0).map(([x, y]) => [(x + s * 0.55) * k, (y + 1.28) * k]);
    const arr = [];
    plate(arr, poly, 0.05 * k, { o: [0, 0, -0.025 * k], a: [1, 0, 0], b: [0, 1, 0], n: [0, 0, 1] });
    gilt.push(fromTriangles(arr));
  }
  return { marble, gilt };
}

/**
 * parthenon_cornice: { x: [lion-head positions along the flanks], xe (half-length of the outer geison), ze (half-width),
 *   y (the top of the horizontal geison), rise, rg (the raking geison's depth), O: [x0, z0, x1, z1] (outer face of the frieze),
 *   yF (head of the frieze) }
 */
function parthenonCornice(el, { bag }) {
  const { xe, ze, y } = el, S = el.s ?? 1, [cx, cz] = el.c ?? [0, 0], red = [], blue = [], white = [], stone = [], lions = [];
  const T = new Matrix4().makeTranslation(cx, 0, cz), at = (g) => g.applyMatrix4(T);
  // the sima along both long eaves: the outer face up to 0.36, then the cyma's bulge, the cap
  for (const s of [-1, 1]) {
    const zo = s * ze, zi = zo + (s < 0 ? 0.0 : 0.0);
    const lo = s < 0 ? zo - 0.05 : zo - 0.14, hi = s < 0 ? zo + 0.14 : zo + 0.05;       // outward is −z on the north, +z on the south
    const step = (v0, v1, out) => (s < 0 ? box(-xe + 0.1, y + v0, zo - out, xe - 0.1, y + v1, zo + 0.14 * S) : box(-xe + 0.1, y + v0, zo - 0.14 * S, xe - 0.1, y + v1, zo + out));
    stone.push(step(0, 0.36 * S, 0.05 * S), step(0.36 * S, 0.5 * S, 0.085 * S), step(0.5 * S, 0.62 * S, 0.04 * S), step(0.62 * S, 0.66 * S, 0.065 * S));
    // the anthemion on the face, in the face's plane z = zo ∓ 0.05, running along x
    const face = { o: [-xe + 0.3, y + 0.06 * S, zo + s * 0.05 * S], a: [1, 0, 0], b: [0, 1, 0], n: [0, 0, s] };
    anthemion(red, blue, face, 2 * xe - 0.6, 0.36 * S, 0.28 * S);
    // the lion heads over the columns and the spaces between them
    for (const x of el.x) {
      const g = lionHead(0.95 * S).applyMatrix4(new Matrix4().makeRotationY(s < 0 ? Math.PI : 0).setPosition(x, y + 0.31 * S, zo + s * 0.05 * S));
      lions.push(g);
    }
  }
  // the raking sima of each gable: the anthemion along its face, on the slope
  const slope = Math.atan2(el.rise, ze), cs = Math.cos(slope), sn = Math.sin(slope);
  for (const d of [-1, 1]) for (const s of [-1, 1]) {
    const len = Math.hypot(ze, el.rise) - 0.5;
    const o = [d * (xe + 0.06), y + el.rg + 0.02 + 0.1 * cs * S, s * (ze - 0.3)];
    // along the slope toward the apex (z decreasing in |z|), up the slope normal
    const a = [0, sn, -s * cs], b = [0, cs, s * sn];
    // the face is the x = const plane; the frame's n is out along x; (a × b) must follow n for the winding, plate() orients by itself
    anthemion(red, blue, { o, a, b, n: [d, 0, 0] }, len - 0.5, 0.36 * S, 0.2 * S, 0.012);
  }
  // the painted leaf moulding at the head of the frieze: leaves red and white alternately, on the band over the triglyphs and metopes
  const [X0, Z0, X1, Z1] = el.O ?? [0, 0, 0, 0], yb = (el.yF ?? 0) - 0.115 * S, hh = 0.1 * S, pitch = 0.1 * S;
  const leaf = (list, F) => plate(list, [[-pitch * 0.4, 0], [pitch * 0.4, 0], [pitch * 0.36, hh * 0.62], [0, hh], [-pitch * 0.36, hh * 0.62]], 0.012, F, true);
  const run = (a0, a1, F0, dirv, nrm) => {
    const n = Math.floor((a1 - a0) / pitch);
    for (let k = 0; k < n; k++) leaf(k % 2 ? white : red, { o: [F0[0] + dirv[0] * (k + 0.5) * pitch, yb, F0[2] + dirv[2] * (k + 0.5) * pitch], a: dirv, b: [0, 1, 0], n: nrm });
  };
  if (el.O) {
    run(X0, X1, [X0, 0, Z0 - 0.07], [1, 0, 0], [0, 0, -1]); run(X0, X1, [X0, 0, Z1 + 0.07], [1, 0, 0], [0, 0, 1]);
    run(Z0, Z1, [X0 - 0.07, 0, Z0], [0, 0, 1], [-1, 0, 0]); run(Z0, Z1, [X1 + 0.07, 0, Z0], [0, 0, 1], [1, 0, 0]);
  }
  for (const [mat, list] of [['wall_red', red], ['egyptian_blue', blue], ['marble_smooth', white]]) if (list.length) bag.add(mat, at(fromTriangles(list)));
  bag.add(el.mat || 'marble', at(merge(stone)));
  if (lions.length) bag.add(el.softMat || 'marble_smooth', at(merge(lions)));
}

/** parthenon_acroteria: { xe, y (the apex of the raking sima), yc (the corner's), zc } — the great floral acroteria and the corner ones. */
function parthenonAcroteria(el, { bag }) {
  const [cx, cz] = el.c ?? [0, 0];
  const big = acroterionRich(el.h ?? 3.6), small = acroterionRich(el.hc ?? 1.9);
  const put = (a, x, y, z) => {
    const m = new Matrix4().makeRotationY(Math.PI / 2).setPosition(x + cx, y, z + cz);
    for (const g of a.marble) all.marble.push(g.clone().applyMatrix4(m));
    for (const g of a.gilt) all.gilt.push(g.clone().applyMatrix4(m));
  };
  const all = { marble: [], gilt: [] };
  for (const d of [-1, 1]) {
    put(big, d * (el.xe - 0.6 * (el.h ?? 3.6) / 3.6), el.y, 0);
    for (const s of [-1, 1]) put(small, d * (el.xe - 0.55 * (el.h ?? 3.6) / 3.6), el.yc, s * el.zc);
  }
  bag.add(el.softMat || 'marble_smooth', merge(all.marble));
  bag.add(el.leafMat || 'gilt_bronze', merge(all.gilt));
}

STYLES.greek.elements.parthenon_cornice = parthenonCornice;
STYLES.greek.elements.parthenon_acroteria = parthenonAcroteria;
export { parthenonCornice, parthenonAcroteria };
