// The feathered serpent in the round (docs/settlements/chichen-itza.md §18): the head at the foot of El Castillo's and the Warriors' stairs
// (open jaws, fangs, tongue, eyes under brows, ear spools, a ruff of feathers), the serpent column of a temple door (head on the floor, a shaft
// scaled with feathers, the rattle tail bent out under the lintel) and the carved ring of the ball court. Frame: x across, y up, z the way the jaws face.
import { Parts, blob, blobDir, tube, rodT, torus, hash3, ST, RD, BL, GR, BK, WH } from './sculpt.js';

/**
 * The head, its block at the balustrade's end behind it (z −0.7 … 0.25 as the old head's), about 2.4 m long.
 * part 'base': the jaws, fangs, tongue, brows, eyes, ear spools, a short ruff; 'fine': the rows of teeth, the blue goggle rings, the nostrils, the rest of the ruff (added within 15 m); 'all': both.
 */
export function serpentHead(P, { part = 'all', block = true, x = 0, y = 0, z = 0, s = 1 } = {}) {
  if (part === 'far') return headFar(P, { block, x, y, z, s });
  const base = part !== 'fine', fine = part !== 'base', lod = fine ? 0 : 1;   // (the block at the balustrade's end is the far form's: headFar)
  const S = P.sc(ST), R = P.sc(RD), W = P.sc(WH), K = P.sc(BK), B = P.sc(BL), G = P.sc(GR);
  const sg = lod === 0 ? 12 : 8, T = (pts, o = {}) => tube(S, pts.map((p) => [x + p[0] * s, y + p[1] * s, z + p[2] * s, p[3] * s, (p[4] ?? p[3]) * s]), { seg: sg, sub: 2, ref: [0, 1, 0], ...o });
  const at = (p) => [x + p[0] * s, y + p[1] * s, z + p[2] * s];
  if (base) {
  // the upper jaw: a heavy muzzle narrowing to the upturned snout, then the curl of the nose
    T([[0, 1.0, -0.05, 0.4, 0.72], [0, 1.0, 0.6, 0.31, 0.58], [0, 1.02, 1.3, 0.25, 0.44], [0, 1.15, 1.85, 0.2, 0.31], [0, 1.42, 2.1, 0.15, 0.22], [0, 1.68, 2.05, 0.1, 0.15]]);
    // the lower jaw, open on the ground, with its chin
    T([[0, 0.2, 0.0, 0.2, 0.62], [0, 0.18, 0.75, 0.15, 0.5], [0, 0.2, 1.5, 0.12, 0.38], [0, 0.22, 1.75, 0.09, 0.2]]);
    // the palate and the throat, red
    tube(R, [[x, y + 0.62 * s, z + 0.1 * s, 0.1 * s, 0.5 * s], [x, y + 0.62 * s, z + 0.9 * s, 0.07 * s, 0.38 * s], [x, y + 0.6 * s, z + 1.55 * s, 0.05 * s, 0.22 * s]], { seg: 8, sub: 1, ref: [0, 1, 0] });
    tube(R, [[x, y + 0.36 * s, z + 0.15 * s, 0.06 * s, 0.5 * s], [x, y + 0.34 * s, z + 1.0 * s, 0.05 * s, 0.4 * s]], { seg: 8, sub: 1, ref: [0, 1, 0] });
    // the tongue over the lower lip, curling down, forked
    tube(R, [[x, y + 0.42 * s, z + 0.5 * s, 0.035 * s, 0.14 * s], [x, y + 0.4 * s, z + 1.4 * s, 0.03 * s, 0.13 * s], [x, y + 0.36 * s, z + 2.0 * s, 0.028 * s, 0.12 * s], [x, y + 0.18 * s, z + 2.3 * s, 0.025 * s, 0.1 * s]], { seg: 8, sub: 2, ref: [0, 1, 0] });
    for (const sx of [-1, 1]) rodT(R, at([sx * 0.04, 0.2, 2.28]), at([sx * 0.15, 0.03, 2.4]), 0.03 * s, 0.012 * s);
  }
  // the teeth: the two great fangs and two teeth a side at the base; the rows along both jaws' edges in the fine
  for (const sx of [-1, 1]) {
    const edge = (zz) => sx * (0.62 - 0.17 * Math.max(0, zz - 0.2));
    if (base) {
      rodT(W, at([sx * 0.3, 0.76, 1.5]), at([sx * 0.3, 0.3, 1.52]), 0.06 * s, 0.01 * s);                // the fang
      for (const [zz, ln] of [[0.5, 0.16], [1.0, 0.2]]) rodT(W, at([edge(zz) * 0.85, 0.74, zz]), at([edge(zz) * 0.85, 0.74 - ln, zz]), 0.035 * s, 0.006 * s);
    }
    if (fine) for (const [zz, ln] of [[0.4, 0.14], [0.65, 0.17], [0.9, 0.2], [1.15, 0.19]]) {
      rodT(W, at([edge(zz) * 0.85, 0.74, zz + 0.1]), at([edge(zz) * 0.85, 0.74 - ln, zz + 0.1]), 0.03 * s, 0.006 * s);
      rodT(W, at([edge(zz) * 0.8, 0.4, zz + 0.1]), at([edge(zz) * 0.8, 0.4 + ln * 0.8, zz + 0.1]), 0.03 * s, 0.006 * s);
    }
    if (base) {
      // the brow, the eye (a black ball), the ear spool
      blob(S, at([sx * 0.5, 1.34, 0.45]), [0.3 * s, 0.1 * s, 0.34 * s], 5, 8);
      blob(K, at([sx * 0.6, 1.15, 0.7]), [0.09 * s, 0.09 * s, 0.09 * s], 4, 8);
      torus(S, at([sx * 0.82, 0.88, -0.28]), [0, 1, 0], [0, 0, 1], 0.26 * s, 0.07 * s, { seg: 14, sec: 6 });
    }
    if (fine) {
      torus(B, at([sx * 0.62, 1.15, 0.7]), [0, 1, 0], [0, 0, 1], 0.17 * s, 0.035 * s, { seg: 14, sec: 5 });   // the goggle ring of the rain god
      blob(K, at([sx * 0.13, 1.5, 1.98]), [0.05 * s, 0.04 * s, 0.07 * s], 3, 6);                              // the nostril
      blob(B, at([sx * 0.84, 0.88, -0.28]), [0.04 * s, 0.14 * s, 0.14 * s], 3, 8);                            // the spool's blue core
    }
  }
  // the ruff: a fan of feathers rising behind the head, green, blue between
  const n = 13;
  for (let i = 0; i < n; i++) {
    if (part === 'base' && i % 2) continue;
    if (part === 'fine' && i % 2 === 0) continue;
    const a = (i / (n - 1) - 0.5) * 2.5, h = hash3(x + i, y, z, 5), d = [Math.sin(a), Math.cos(a) * 0.9, -0.55 - 0.15 * h];
    blobDir(i % 4 === 1 || i % 4 === 3 ? B : G, at([Math.sin(a) * 0.75, 1.28 + Math.cos(a) * 0.1, -0.35]), d, (0.5 + 0.12 * h) * s, 0.15 * s, 0.045 * s, [0, 0, 1], 3, 6);
  }
  return P;
}

/**
 * A serpent column of a door: the head on the floor (jaws toward +z), the square shaft behind it scaled with feathers, the tail bent out
 * under the lintel with its rattles. H the wall's height (the lintel's underside), hw the shaft's half-width.
 */
export function serpentColumn(P, H, { part = 'all', hw = 0.5, cx = 0, cz = 0 } = {}) {
  const S = P.sc(ST), R = P.sc(RD), top = H - 0.7, lod = part === 'fine' ? 0 : 1, far = part === 'far';
  serpentHead(P, { part, block: far, x: cx, z: cz + hw - 0.12, s: 0.8 });
  if (part === 'fine') return P;
  if (far) {   // the landmark's: the shaft and its plinth, the tail's mass (all inside the modelled column's feathers and tail)
    S.box(cx - hw, 0.9, cz - hw, cx + hw, top, cz + hw);
    S.box(cx - hw - 0.07, 0.9, cz - hw - 0.07, cx + hw + 0.07, 1.04, cz + hw + 0.07);
    S.box(cx - 0.25, top - 0.05, cz - 0.1, cx + 0.25, top + 0.15, cz + 0.35);
    return P;
  }
  // the feathers: rows of scales on every face, each row's scales overlapping the row below; a red band between some rows
  const row = lod === 0 ? 0.17 : 0.26, nr = Math.floor((top - 1.12) / row);
  const FD = lod === 0 ? [3, 6] : [2, 5];
  for (let f = 0; f < 4; f++) {
    const a = f * Math.PI / 2, ux = Math.cos(a), uz = -Math.sin(a), nx = Math.sin(a), nz = Math.cos(a);
    for (let i = 0; i < nr; i++) {
      const y = 1.12 + i * row + row * 0.5, nc = 3, w = 2 * hw / nc, mat = i % 5 === 4 ? R : S;
      for (let j = 0; j < nc; j++) {
        const u = ((j + 0.5) / nc - 0.5) * 2 * hw + (i % 2 ? w * 0.25 : -w * 0.25) * (j === 0 && i % 2 === 0 ? 0 : j === nc - 1 && i % 2 ? 0 : 1);
        const c = [cx + ux * u + nx * hw, y, cz + uz * u + nz * hw];
        blobDir(mat, c, [ux, 0, uz], w * 0.58, 0.05, row * 0.72, [nx, 0, nz], FD[0], FD[1]);
      }
    }
  }
  // the tail: bent out at the top of the shaft, rattles on its end
  const y = top + 0.3;
  tube(S, [[cx, top - 0.2, cz - 0.1, hw * 0.8, hw * 0.8], [cx, y - 0.02, cz + 0.45, 0.26, 0.3], [cx, y + 0.0, cz + 1.05, 0.21, 0.24]], { seg: 10, sub: 2, ref: [0, 1, 0] });
  for (let i = 0; i < 5; i++) { const z = cz + 1.15 + i * 0.13, r = 0.2 - i * 0.018; blob(i % 2 ? R : S, [cx, y + 0.02, z], [r, r, 0.075], 3, 8); }
  tube(S, [[cx, top - 0.1, cz - 0.1, 0.3, 0.3], [cx, y + 0.05, cz - 0.55, 0.2, 0.26]], { seg: 8, sub: 1, ref: [0, 1, 0] });
  return P;
}

/**
 * The ring of the ball court, its hole facing +z, its back on z = 0: a stone ring in a rounded-square section (R outer 0.97, r inner 0.28, 0.34 deep) with two
 * feathered serpents twined round it, their heads meeting at the top, each coil a ridge of banded scales.
 */
export function ballRing(P, { part = 'all' } = {}) {
  const lod = part === 'base' ? 1 : 0;
  const S = P.sc(ST), B = P.sc(BL), G = P.sc(GR), R = P.sc(RD);
  const Ro = 0.97, Ri = 0.28, mid = (Ro + Ri) / 2, hw = (Ro - Ri) / 2, d = 0.345;
  // the ring: rows of a squared (superellipse) section round the circle, the last row the first again
  const n = lod === 0 ? 48 : 28, m = lod === 0 ? 16 : 10, rows = [], sq = (th) => 1 / Math.pow(Math.pow(Math.abs(Math.cos(th)), 8) + Math.pow(Math.abs(Math.sin(th)), 8), 1 / 8);
  for (let i = 0; i <= n; i++) {
    const a = (i % n) / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), row = [];
    for (let j = 0; j < m; j++) { const th = j / m * Math.PI * 2, f = sq(th), rr = mid + Math.cos(th) * hw * 1.08 * f, zz = d / 2 + Math.sin(th) * d / 2 * 1.08 * f; row.push([ca * rr, sa * rr, zz]); }
    rows.push(row);
  }
  S.grid(rows, { wrap: true });
  // two serpents round the face: a body wavering in and out of the ring's width, banded, its head at the top
  for (const ph of [0, 1]) {
    const side = ph ? 1 : -1, body = [];
    const m = lod === 0 ? 30 : 18;
    for (let i = 0; i <= m; i++) {
      const t = i / m, a = Math.PI / 2 + side * (0.3 + t * (Math.PI * 2 - 0.6)) * -1 * 0.5 * 2 / 2 * 1;
      const ang = Math.PI / 2 + side * (0.3 + t * (Math.PI - 0.5)), r = mid + 0.17 * Math.sin(t * 9 + ph * Math.PI);
      body.push([Math.cos(ang) * r, Math.sin(ang) * r, d + 0.03, 0.075 - 0.025 * t, 0.075 - 0.025 * t]);
      void a;
    }
    tube(ph ? B : G, body, { seg: 6, sub: 1, ref: [0, 0, 1] });
    // bands across the body
    if (lod === 0) for (let i = 2; i < m; i += 4) { const p = body[i]; blob(R, [p[0], p[1], p[2] + 0.01], [0.075, 0.075, 0.04], 3, 7); }
    // the head at the top, jaws toward the other
    const hp = body[0], ha = Math.PI / 2 + side * 0.3;
    blobDir(S, [Math.cos(ha) * mid, Math.sin(ha) * mid, d + 0.05], [side, 0.0, 0.2], 0.13, 0.085, 0.07, [0, 1, 0], 4, 8);
    void hp;
  }
  return P;
}

/** A convex solid from eight corners (bottom four, top four in matching order) into a sculpt. */
function hex(S, c) {
  const t = [], q = (a, b, d, e) => t.push(...c[a], ...c[b], ...c[d], ...c[a], ...c[d], ...c[e]);
  q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
  S.solid(t);
}
/** A loft of boxy sections inside a tube's spine (its sections' ellipses shrunk to inscribed rectangles): the cheap solid that stands in the landmark beyond 45 m and lies inside the modelled form. */
function inner(S, pts, k = 0.6) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], sec = (p) => [[p[0] - p[4] * k, p[1] - p[3] * k, p[2]], [p[0] + p[4] * k, p[1] - p[3] * k, p[2]], [p[0] + p[4] * k, p[1] + p[3] * k, p[2]], [p[0] - p[4] * k, p[1] + p[3] * k, p[2]]];
    const A = sec(a), B = sec(b);
    hex(S, [A[0], A[1], A[2], A[3], B[0], B[1], B[2], B[3]]);
  }
}
/** The head's far form (the landmark's, drawn in the style's own stone and red): the block, the two jaws as boxy lofts, the tongue; all inside the modelled head. */
function headFar(P, { block = true, x = 0, y = 0, z = 0, s = 1 } = {}) {
  const S = P.sc(ST), R = P.sc(RD), m = (pts) => pts.map((p) => [x + p[0] * s, y + p[1] * s, z + p[2] * s, p[3] * s, (p[4] ?? p[3]) * s]);
  if (block) S.box(x - 0.78 * s, y, z - 0.7 * s, x + 0.78 * s, y + 1.45 * s, z + 0.25 * s);
  inner(S, m([[0, 1.0, 0.25, 0.37, 0.66], [0, 1.0, 0.8, 0.3, 0.55], [0, 1.02, 1.3, 0.25, 0.44], [0, 1.15, 1.8, 0.2, 0.31]]));
  inner(S, m([[0, 0.2, 0.25, 0.19, 0.6], [0, 0.18, 0.8, 0.15, 0.5], [0, 0.2, 1.5, 0.11, 0.38]]));
  R.box(x - 0.1 * s, y + 0.375 * s, z + 0.6 * s, x + 0.1 * s, y + 0.395 * s, z + 1.9 * s);
  return P;
}
