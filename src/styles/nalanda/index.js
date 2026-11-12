// Nalanda mahavihara, c. 640 (docs/settlements/nalanda.md): red brick under lime plaster. The vocabulary:
// a monastery of cells on two storeys round a court (verandahs of brick piers, a gallery above, a stair, flat
// lime-concrete roofs with parapets and corner turrets, a gate with a porch; in the court the well, the lecture
// platform and the shrine with its Buddha); the great stepped temple with its stair, niches of stucco Buddhas,
// corner stupas and the shrine on top; the library's towers with their rows of slit windows and the shelves of
// palm-leaf manuscripts; votive stupas; brick-edged tanks with their ghats.
import { registerStyle, orientedBox, subtractRects } from '../../core/build.js';
import { box, lathe, frustum, fromTriangles } from '../../core/geom.js';
import makeDress from './dress.js';

const BR = 'brick', BRB = 'brick_baked', PL = 'lime_plaster', TB = 'timber';

const B = (bag, mat, x0, y0, z0, x1, y1, z1) => bag.add(mat, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

/** A wall a→b of thickness th, y0..y1, with holes [{ s0, s1, y0, y1 }] (distances along it): pieces round each hole; solid where none. */
function wallGaps(ctx, a, b, th, y0, y1, holes = [], mat = BR) {
  const { bag, col } = ctx, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (L < 0.02) return;
  const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], P = (s) => [a[0] + u[0] * s, a[1] + u[1] * s];
  const piece = (s0, s1, p0, p1) => {
    if (s1 - s0 < 0.01 || p1 - p0 < 0.01) return;
    bag.add(mat, orientedBox(P(s0), P(s1), th, p0, p1, 0));
    col.segment(P(s0), P(s1), th, p0, p1);
  };
  const cuts = [...new Set([0, L, ...holes.flatMap((h) => [Math.max(0, h.s0), Math.min(L, h.s1)])])].sort((p, q) => p - q);
  let run = 0;
  for (let i = 0; i < cuts.length - 1; i++) {
    const s0 = cuts[i], s1 = cuts[i + 1], m = (s0 + s1) / 2, hs = holes.filter((h) => h.s0 < m && h.s1 > m).sort((p, q) => p.y0 - q.y0);
    if (!hs.length) continue;
    piece(run, s0, y0, y1);
    let y = y0;
    for (const h of hs) { piece(s0, s1, y, h.y0); y = Math.max(y, h.y1); }
    piece(s0, s1, y, y1);
    run = s1;
  }
  piece(run, L, y0, y1);
}

/** A flight of steps (as the generic stair) with its sides closed to the walker: ascent toward `dir`, solid to `base`. */
export function flight(ctx, rect, dir, y0, y1, base, riser = 0.2, mat = BR) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = [Math.min(rect[0], rect[2]), Math.min(rect[1], rect[3]), Math.max(rect[0], rect[2]), Math.max(rect[1], rect[3])];
  const n = Math.max(1, Math.round((y1 - y0) / riser));
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, top = y0 + (y1 - y0) * f1;
    let r;
    if (dir === 'n') r = [x0, z0, x1, z1 - (z1 - z0) * f0]; else if (dir === 's') r = [x0, z0 + (z1 - z0) * f0, x1, z1];
    else if (dir === 'e') r = [x0 + (x1 - x0) * f0, z0, x1, z1]; else r = [x0, z0, x1 - (x1 - x0) * f0, z1];
    B(bag, mat, r[0], base, r[1], r[2], top, r[3]);
  }
  col.ramp([x0, z0, x1, z1], y0, y1, dir);
  // the sides: the walker is kept on the flight
  if (dir === 'w' || dir === 'e') { for (const z of [z0 - 0.1, z1 + 0.1]) col.segment([x0, z], [x1, z], 0.2, y0 + 0.2, y1 + 0.4); }
  else for (const x of [x0 - 0.1, x1 + 0.1]) col.segment([x, z0], [x, z1], 0.2, y0 + 0.2, y1 + 0.4);
}

// ── small things ────────────────────────────────────────────────────────────────
/** A votive stupa of brick: two plinths, a plastered dome, a square harmika, a spire of rings. s is the scale (1 ≈ 3 m high). */
function votiveStupa(ctx, x, z, y, s = 1, solid = true) {
  const { bag, col } = ctx;
  B(bag, BR, x - 1.0 * s, y, z - 1.0 * s, x + 1.0 * s, y + 0.4 * s, z + 1.0 * s);
  B(bag, BR, x - 0.82 * s, y + 0.4 * s, z - 0.82 * s, x + 0.82 * s, y + 0.75 * s, z + 0.82 * s);
  bag.add(PL, lathe([[0.74 * s, 0], [0.74 * s, 0.1 * s], [0.62 * s, 0.45 * s], [0.34 * s, 0.7 * s], [0.12 * s, 0.78 * s], [0.001, 0.78 * s]], 10, null, x, y + 0.75 * s, z));
  B(bag, BR, x - 0.2 * s, y + 1.5 * s, z - 0.2 * s, x + 0.2 * s, y + 1.75 * s, z + 0.2 * s);
  bag.add(BRB, lathe([[0.22 * s, 0], [0.22 * s, 0.1 * s], [0.14 * s, 0.14 * s], [0.18 * s, 0.26 * s], [0.1 * s, 0.3 * s], [0.12 * s, 0.42 * s], [0.04 * s, 0.5 * s], [0.001, 0.9 * s]], 8, null, x, y + 1.75 * s, z));
  if (solid) col.rect([x - 1.0 * s, z - 1.0 * s, x + 1.0 * s, z + 1.0 * s], y, y + 2.6 * s);
}

/** A seated Buddha with halo on a lotus seat at (x, z) facing `face` ('e' | 'w' | 's' | 'n'), scale s (1 ≈ 1.6 m high). */
function buddha(bag, x, y, z, s, face = 'e', mat = 'clay_gilt', haloMat = PL) {
  const g = lathe([[0.62 * s, 0], [0.66 * s, 0.08 * s], [0.5 * s, 0.14 * s], [0.46 * s, 0.3 * s], [0.34 * s, 0.7 * s], [0.26 * s, 0.9 * s], [0.12 * s, 0.98 * s], [0.1 * s, 1.0 * s], [0.18 * s, 1.1 * s], [0.14 * s, 1.26 * s], [0.04 * s, 1.34 * s], [0.001, 1.36 * s]], 10, null, x, y, z);
  bag.add(mat, g);
  const dx = face === 'e' ? 1 : face === 'w' ? -1 : 0, dz = face === 's' ? 1 : face === 'n' ? -1 : 0;
  // the halo, a disc standing behind the head
  const hx = x - dx * 0.3 * s, hz = z - dz * 0.3 * s;
  bag.add(haloMat, orientedBox([hx - dz * 0.5 * s, hz + dx * 0.5 * s], [hx + dz * 0.5 * s, hz - dx * 0.5 * s], 0.07 * s, y + 0.95 * s, y + 1.55 * s, 0));
}

// ── the monastery ───────────────────────────────────────────────────────────────
const CELL = { out: 1.0, clear: 3.0, inner: 0.5 };           // the cell block: outer wall, cell depth, the wall on the verandah
const BLOCK = CELL.out + CELL.clear + CELL.inner;            // 4.5 m
const VER = 3.1;                                              // the verandah, to the foot of the piers' line (block + VER = 7.6)
const H1 = 3.7, H2 = 7.1;                                    // the upper floor, the wall tops

/**
 * A monastery { rect, y, enter, seed } with its gate in the middle of the west side: cells on two storeys round a court
 * (enter: the cells are hollow and furnished, the upper gallery is reached by a stair at the north verandah's west end; otherwise
 * the ring is massed brick), the verandah of piers, the court's well, lecture platform and shrine.
 */
function monastery(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, enter = !!el.enter, zc = (z0 + z1) / 2, r = rng(el.seed ?? 5);
  const cx0 = x0 + BLOCK + VER, cz0 = z0 + BLOCK + VER, cx1 = x1 - BLOCK - VER, cz1 = z1 - BLOCK - VER;   // the court's edge
  const W2 = x0 + 7.6, N2 = z0 + 7.6, E2 = x1 - 7.6, S2 = z1 - 7.6;
  // the floor of the whole building and its court, flush with the ground
  bag.add('cotto_floor', frustum([x0, z0, x1, z1], -0.45, 0, 0, 0, 0, 0, { noBottom: true }));
  col.floor(el.rect, 0, el.room);
  const stair = { x0: W2, z0: z0 + BLOCK + 0.15, x1: W2 + 6.7, z1: z0 + BLOCK + 1.85 };
  const sides = [
    { A: [x0, z0], B: [x1, z0], n: [0, 1] }, { A: [x1, z0 + BLOCK], B: [x1, z1 - BLOCK], n: [-1, 0] },
    { A: [x1, z1], B: [x0, z1], n: [0, -1] }, { A: [x0, z1 - BLOCK], B: [x0, z0 + BLOCK], n: [1, 0] },
  ];
  sides.forEach((sd, si) => {
    const { A, B: Bp, n } = sd, L = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), u = [(Bp[0] - A[0]) / L, (Bp[1] - A[1]) / L];
    const P = (s, d) => [A[0] + u[0] * s + n[0] * d, A[1] + u[1] * s + n[1] * d];
    const nc = si % 2 === 0 ? 15 : 11, pitch = L / nc, gate = si === 3 ? (nc - 1) / 2 : -1;
    const cellX = (k) => (k + 0.5) * pitch;
    // the walls' tops all along: the cornice
    wallGaps({ bag, col: { segment() {} } }, P(0, 0.5), P(L, 0.5), 1.0, -0.1, 0.55, gate >= 0 ? [{ s0: cellX(gate) - 1.6, s1: cellX(gate) + 1.6, y0: -0.3, y1: 0.7 }] : [], BRB);
    // does a cell's doorway open on the stair's well? (north side)
    const inWell = (k) => si === 0 && enter && (A[0] + u[0] * (k + 1) * pitch > stair.x0 - 0.3) && (A[0] + u[0] * k * pitch < stair.x1 + 0.3);
    if (!enter) {
      // massed brick, the gate's passage kept through the west side
      if (gate < 0) { B(bag, BR, ...rectOf(P(0, 0), P(L, BLOCK), -0.1, H2)); col.rect(rectOf2(P(0, 0), P(L, BLOCK)), 0, H2); }
      else {
        const g0 = gate * pitch + 0.1, g1 = (gate + 1) * pitch - 0.1;
        for (const [s0, s1] of [[0, g0], [g1, L]]) { B(bag, BR, ...rectOf(P(s0, 0), P(s1, BLOCK), -0.1, H2)); col.rect(rectOf2(P(s0, 0), P(s1, BLOCK)), 0, H2); }
        B(bag, BR, ...rectOf(P(g0, 0), P(g1, BLOCK), 3.3, H2));
      }
    } else {
      // the outer wall with a slit window to each cell on each storey, the gate's opening
      const holes = [];
      for (let k = 0; k < nc; k++) {
        const c = cellX(k);
        if (k === gate) holes.push({ s0: c - 1.5, s1: c + 1.5, y0: -0.2, y1: 3.3 });
        else for (const y of [1.7, 5.4]) holes.push({ s0: c - 0.28, s1: c + 0.28, y0: y, y1: y + 0.85 });
      }
      wallGaps(ctx, P(0, CELL.out / 2), P(L, CELL.out / 2), CELL.out, -0.1, H2, holes);
      // the wall on the verandah, a doorway into each cell on each storey
      const hi = [];
      for (let k = 0; k < nc; k++) {
        const c = cellX(k), wd = k === gate ? 1.5 : 0.5;
        if (k === gate) { hi.push({ s0: c - 1.5, s1: c + 1.5, y0: -0.2, y1: 3.3 }); continue; }
        if (!inWell(k)) { hi.push({ s0: c - wd, s1: c + wd, y0: -0.2, y1: 2.3 }); hi.push({ s0: c - wd, s1: c + wd, y0: H1, y1: H1 + 2.3 }); }
      }
      wallGaps(ctx, P(0, CELL.out + CELL.clear + CELL.inner / 2), P(L, CELL.out + CELL.clear + CELL.inner / 2), CELL.inner, -0.1, H2, hi);
      // the partitions
      for (let k = 1; k < nc; k++) {
        const s = k * pitch, gt = k === gate || k === gate + 1;
        wallGaps(ctx, P(s, CELL.out), P(s, CELL.out + CELL.clear), gt ? 0.6 : 0.4, -0.1, H2);
      }
      // the lintels of the doorways, thresholds, and in each cell its furniture
      for (let k = 0; k < nc; k++) {
        const c = cellX(k);
        if (k === gate) continue;
        const dpos = CELL.out + CELL.clear + CELL.inner / 2;
        for (const y of [2.3, H1 + 2.3]) bag.add(TB, orientedBox(P(c - 0.7, dpos), P(c + 0.7, dpos), CELL.inner + 0.1, y, y + 0.16, 0));
        for (const [yb, ok] of [[0, true], [H1, true]]) {
          if (!ok) continue;
          // the bed of brick on the left of the door against the outer wall, its mat; a chest of books on it; a water pot by the far wall
          const s0 = c - pitch / 2 + 0.3;
          bag.add(BR, orientedBox(P(s0 + 0.45, CELL.out), P(s0 + 0.45, CELL.out + 1.9), 0.9, yb, yb + 0.42, 0));
          bag.add('reed_mat', orientedBox(P(s0 + 0.45, CELL.out + 0.1), P(s0 + 0.45, CELL.out + 1.8), 0.7, yb + 0.42, yb + 0.45, 0));
          if (r() < 0.6) bag.add(TB, orientedBox(P(s0 + 0.45, CELL.out + 1.5), P(s0 + 0.45, CELL.out + 1.8), 0.4, yb + 0.45, yb + 0.7, 0));
          const q = P(c + pitch / 2 - 0.55, CELL.out + 0.45);
          if (r() < 0.8) bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.19, 0.14], [0.2, 0.26], [0.13, 0.38], [0.09, 0.42], [0.11, 0.46], [0.001, 0.46]], 10, null, q[0], yb, q[1]));
          col.rect(rectOf2(P(s0, CELL.out), P(s0 + 0.9, CELL.out + 1.9)), yb, yb + 0.45);
          // a robe hung on the far partition, a lamp on a small stand by the bed's head, a bowl on the sill of the slit
          const sp = c + pitch / 2 - 0.25;
          bag.add(r() < 0.5 ? 'cloth_ochre' : 'cloth_maroon', orientedBox(P(sp, CELL.out + 1.2), P(sp, CELL.out + 1.85), 0.05, yb + 1.0, yb + 1.85, 0));
          bag.add(TB, orientedBox(P(s0 + 1.15, CELL.out + 0.3), P(s0 + 1.15, CELL.out + 0.3), 0.22, yb, yb + 0.4, 0.11));
          bag.add('terracotta', lathe([[0.001, 0], [0.06, 0], [0.1, 0.03], [0.001, 0.03]], 6, null, ...(() => { const q = P(s0 + 1.15, CELL.out + 0.3); return [q[0], yb + 0.4, q[1]]; })()));
          if (r() < 0.5) { const q = P(s0 + 0.45, CELL.out + 0.2); bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0], [0.13, 0.06], [0.001, 0.06]], 6, null, q[0], yb + 0.45, q[1])); }
        }
      }
    }
    // the plaster band on the outer face, and a cornice of two steps under the parapet
    bag.add(PL, orientedBox(P(0, -0.03), P(L, -0.03), 0.06, H1 + 0.1, H1 + 1.0, 0));
    bag.add(BR, orientedBox(P(-0.2, -0.12), P(L + 0.2, -0.12), 0.24, H2 - 0.5, H2 - 0.25, 0));
    bag.add(BR, orientedBox(P(-0.2, -0.22), P(L + 0.2, -0.22), 0.44, H2 - 0.25, H2, 0));
    // the parapet on the roof
    wallGaps({ bag, col: { segment() {} } }, P(-0.1, 0.18), P(L + 0.1, 0.18), 0.36, H2 + 0.3, H2 + 0.95);
  });
  // the roofs: the cells' flat roof, the ceiling of the upper gallery under it, the upper floor (walkable) with the stair's well
  const ring = subtractRects([x0, z0, x1, z1], [[W2, N2, E2, S2]]), ring4 = subtractRects([x0, z0, x1, z1], [[x0 + BLOCK, z0 + BLOCK, x1 - BLOCK, z1 - BLOCK]]);
  for (const q of ring4) B(bag, PL, q[0], H2, q[1], q[2], H2 + 0.3, q[3]);
  if (enter) {
    for (const q of ring) B(bag, PL, q[0], 6.55, q[1], q[2], 6.85, q[3]);
    const wellRect = [stair.x0, stair.z0 - 0.15, stair.x1, stair.z1 + 0.15];
    for (const q of subtractRects([x0, z0, x1, z1], [[W2, N2, E2, S2], wellRect])) { B(bag, PL, q[0], H1 - 0.3, q[1], q[2], H1, q[3]); col.floor(q, H1, el.room); }
    // the stair up the north verandah's west end, the stairwell's edge
    flight(ctx, [stair.x0, stair.z0, stair.x1, stair.z1], 'e', 0, H1, -0.4, H1 / 19, BR);
  } else {
    for (const q of ring) B(bag, PL, q[0], H1 - 0.3, q[1], q[2], H1, q[3]);
  }
  // the verandah's piers on a rectangle round the court, a beam on them above each storey, the parapet of the gallery
  const px0 = x0 + BLOCK + 2.5, pz0 = z0 + BLOCK + 2.5, px1 = x1 - BLOCK - 2.5, pz1 = z1 - BLOCK - 2.5;
  const corners = [[px0, pz0], [px1, pz0], [px1, pz1], [px0, pz1]];
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let k = 0; k < 11; k++) {
      const t = k / 11, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      B(bag, BR, x - 0.36, -0.1, z - 0.36, x + 0.36, H1 - 0.3, z + 0.36); col.rect([x - 0.36, z - 0.36, x + 0.36, z + 0.36], 0, H1);
      B(bag, BRB, x - 0.46, H1 - 0.7, z - 0.46, x + 0.46, H1 - 0.3, z + 0.46);
      if (enter) { B(bag, BR, x - 0.36, H1, z - 0.36, x + 0.36, 6.55, z + 0.36); col.rect([x - 0.36, z - 0.36, x + 0.36, z + 0.36], H1, 6.55); }
    }
    bag.add(TB, orientedBox(a, b, 0.3, H1 - 1.0, H1 - 0.7, 0.4));
    if (enter) {
      bag.add(TB, orientedBox(a, b, 0.3, 6.05, 6.4, 0.4));
      // the gallery's low parapet between the piers
      const k0 = i === 0 ? 0 : 0;
      void k0; void len;
      wallGaps(ctx, a, b, 0.3, H1, H1 + 0.95, [], BR);
    }
  }
  // the gate: a porch of two brick walls and a flat roof, a timber lintel; the tower over the gate
  const gz = zc;
  for (const s of [-1, 1]) wallGaps(ctx, [x0 - 2.4, gz + s * 2.15], [x0, gz + s * 2.15], 0.9, -0.1, 4.7);
  B(bag, PL, x0 - 2.6, 4.7, gz - 2.8, x0, 5.0, gz + 2.8);
  B(bag, BR, x0, H2 + 0.3, gz - 3.4, x0 + 4.6, H2 + 3.6, gz + 3.4);
  B(bag, BR, x0 - 0.2, H2 + 3.6, gz - 3.6, x0 + 4.8, H2 + 3.9, gz + 3.6);
  B(bag, BR, x0 + 0.4, H2 + 3.9, gz - 2.6, x0 + 4.0, H2 + 4.6, gz + 2.6);
  bag.add(BRB, lathe([[0.5, 0], [0.45, 0.2], [0.2, 0.5], [0.3, 0.8], [0.1, 1.1], [0.001, 1.5]], 8, null, x0 + 2.2, H2 + 4.6, gz));
  // the turrets at the four corners
  for (const [tx, tz] of [[x0 + 1.6, z0 + 1.6], [x1 - 1.6, z0 + 1.6], [x1 - 1.6, z1 - 1.6], [x0 + 1.6, z1 - 1.6]]) {
    B(bag, BR, tx - 1.4, H2 + 0.3, tz - 1.4, tx + 1.4, H2 + 3.2, tz + 1.4);
    B(bag, BRB, tx - 1.6, H2 + 3.2, tz - 1.6, tx + 1.6, H2 + 3.5, tz + 1.6);
    B(bag, PL, tx - 1.0, H2 + 3.5, tz - 1.0, tx + 1.0, H2 + 4.4, tz + 1.0);
    bag.add(BRB, lathe([[0.6, 0], [0.4, 0.3], [0.1, 0.9], [0.001, 1.6]], 8, null, tx, H2 + 4.4, tz));
  }
  // ── the court ──
  const mx = (cx0 + cx1) / 2, mz = (cz0 + cz1) / 2;
  // the well, octagonal, a stone curb
  const wx = mx - 8, wz = mz - 5.5;
  bag.add(BRB, lathe([[1.1, 0], [1.1, 0.7], [0.85, 0.75], [0.001, 0.75]], 8, null, wx, 0, wz));
  col.circle(wx, wz, 1.1, 0, 0.7);
  // the shrine across from the gate: a plastered brick chamber on a plinth, its door west, a stepped roof, the Buddha inside
  const sx0 = cx1 - 11.5, sx1 = cx1 - 4.7, sz0 = mz - 3.4, sz1 = mz + 3.4, sh = 4.6;
  B(bag, BRB, sx0 - 0.5, 0, sz0 - 0.5, sx1 + 0.5, 0.35, sz1 + 0.5);
  col.floor([sx0 - 0.5, sz0 - 0.5, sx1 + 0.5, sz1 + 0.5], 0.35);
  const sc = { bag, col };
  wallGaps(sc, [sx0, sz0], [sx1, sz0], 0.8, 0.35, sh, [], PL); wallGaps(sc, [sx1, sz0], [sx1, sz1], 0.8, 0.35, sh, [], PL); wallGaps(sc, [sx1, sz1], [sx0, sz1], 0.8, 0.35, sh, [], PL);
  wallGaps(sc, [sx0, sz1], [sx0, sz0], 0.8, 0.35, sh, [{ s0: 2.5, s1: 4.3, y0: 0.35, y1: 3.1 }], PL);
  B(bag, TB, sx0 - 0.5, 3.1, mz - 1.05, sx0 + 0.5, 3.3, mz + 1.05);
  bag.add(PL, frustum([sx0 - 0.4, sz0 - 0.4, sx1 + 0.4, sz1 + 0.4], sh, sh + 0.35, 0, 0, 0, 0));
  for (let i = 0; i < 3; i++) { const e = 0.5 + i * 0.9; B(bag, i % 2 ? PL : BR, sx0 + e, sh + 0.35 + i * 0.75, sz0 + e, sx1 - e, sh + 0.35 + (i + 1) * 0.75, sz1 - e); }
  bag.add(BRB, lathe([[0.5, 0], [0.4, 0.3], [0.2, 0.6], [0.001, 1.4]], 8, null, (sx0 + sx1) / 2, sh + 2.6, mz));
  buddha(bag, sx1 - 1.9, 0.35, mz, 1.5, 'w');
  B(bag, 'sandstone_dressed', sx1 - 2.6, 0.35, mz - 0.9, sx1 - 1.2, 0.75, mz + 0.9);
  // the lecture platform: a podium with steps toward the court's middle, the teacher's seat, rows of mats before it
  if (el.court === 'teach') {
    const lx0 = mx - 5.5, lx1 = mx + 1.5, lz0 = mz + 6.2, lz1 = mz + 10.6;
    B(bag, BRB, lx0, 0, lz0, lx1, 1.0, lz1); B(bag, PL, lx0 - 0.1, 1.0, lz0 - 0.1, lx1 + 0.1, 1.1, lz1 + 0.1);
    col.floor([lx0, lz0, lx1, lz1], 1.1);
    col.rect([lx0, lz0, lx1, lz1], 0, 1.1);
    flight(ctx, [mx - 2.2, lz0 - 2.0, mx - 0.2, lz0], 's', 0, 1.1, -0.2, 0.2, BR);
    // the teacher's seat of brick with a cushion against the back
    B(bag, BR, mx - 3.0, 1.1, lz1 - 1.3, mx - 0.6, 1.55, lz1 - 0.3);
    bag.add('cloth_ochre', orientedBox([mx - 2.8, lz1 - 0.8], [mx - 0.8, lz1 - 0.8], 0.7, 1.55, 1.62, 0));
    bag.add(PL, orientedBox([mx - 2.8, lz1 - 0.2], [mx - 0.8, lz1 - 0.2], 0.2, 1.55, 2.5, 0));
    for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) {
      const mx2 = mx - 7.4 + k * 1.9 + (row % 2) * 0.6, mz2 = mz + 2.1 + row * 1.35;
      if (Math.hypot(mx2 - wx, mz2 - wz) < 2.2) continue;
      bag.add('reed_mat', orientedBox([mx2 - 0.55, mz2], [mx2 + 0.55, mz2], 0.8, 0, 0.03, 0));
    }
  }
  if (el.court === 'stupa') {
    // a great votive stupa of the court on its plinth, small ones at its corners, mats of the devout before it
    votiveStupa(ctx, mx - 2, mz + 6.5, 0, 2.0);
    for (const [dx, dz] of [[-6.2, 3.2], [2.4, 3.2], [-6.2, 10.0], [2.4, 10.0]]) votiveStupa(ctx, mx + dx, mz + dz, 0, 0.8);
    for (let k = 0; k < 4; k++) bag.add('reed_mat', orientedBox([mx - 5 + k * 2.2, mz + 2.2], [mx - 4.2 + k * 2.2, mz + 2.2], 0.8, 0, 0.03, 0));
  } else if (el.court === 'pavilion') {
    // a pillared pavilion of timber under a hipped tile roof, the Buddha in the middle on a brick seat, benches round
    const px0 = mx - 8, pz0 = mz + 4.2, px1 = mx + 0.5, pz1 = mz + 12.2;
    B(bag, BRB, px0 - 0.4, 0, pz0 - 0.4, px1 + 0.4, 0.4, pz1 + 0.4); col.floor([px0 - 0.4, pz0 - 0.4, px1 + 0.4, pz1 + 0.4], 0.4);
    flight(ctx, [mx - 4.6, pz0 - 2.2, mx - 3.0, pz0 - 0.4], 's', 0, 0.4, -0.1, 0.2, BR);
    for (const x of [px0 + 0.3, px1 - 0.3]) for (const z of [pz0 + 0.3, pz1 - 0.3]) { B(bag, TB, x - 0.16, 0.5, z - 0.16, x + 0.16, 3.5, z + 0.16); col.rect([x - 0.17, z - 0.17, x + 0.17, z + 0.17], 0.4, 3.5); B(bag, BRB, x - 0.28, 0.4, z - 0.28, x + 0.28, 0.65, z + 0.28); }
    for (const z of [pz0 + 0.3, pz1 - 0.3]) bag.add('wood_dark', orientedBox([px0, z], [px1, z], 0.3, 3.5, 3.85, 0.1));
    for (const x of [px0 + 0.3, px1 - 0.3]) bag.add('wood_dark', orientedBox([x, pz0], [x, pz1], 0.3, 3.5, 3.85, 0.1));
    bag.add('roof_tile', frustum([px0 - 1.0, pz0 - 1.0, px1 + 1.0, pz1 + 1.0], 3.85, 5.6, 3.0, 3.0, 3.0, 3.0));
    bag.add(BRB, lathe([[0.4, 0], [0.3, 0.3], [0.001, 1.0]], 8, null, (px0 + px1) / 2, 5.6, (pz0 + pz1) / 2));
    const bx = (px0 + px1) / 2, bz = (pz0 + pz1) / 2;
    B(bag, BR, bx - 1.1, 0.4, bz - 1.1, bx + 1.1, 0.95, bz + 1.1); col.rect([bx - 1.1, bz - 1.1, bx + 1.1, bz + 1.1], 0.4, 0.95);
    buddha(bag, bx, 0.95, bz, 1.2, 'n');
    for (const z of [pz0 + 1.0, pz1 - 1.0]) { bag.add(BR, orientedBox([px0 + 1.4, z], [px1 - 1.4, z], 0.5, 0.4, 0.8, 0)); col.segment([px0 + 1.4, z], [px1 - 1.4, z], 0.5, 0.4, 0.8); }
  }
  // lamp pillars in the court, at the verandah's edge by the gate, and at the porch
  D.lamps({ at: [[cx0 + 1.5, mz - 9], [cx0 + 1.5, mz + 9], [cx1 - 1.5, mz - 10], [cx1 - 1.5, mz + 10], [x0 - 3.1, gz - 3.7], [x0 - 3.1, gz + 3.7]] }, ctx);
  // robes drying on poles between the piers of the verandah, a wooden gong hung at the north-east corner
  if (enter) {
    const rr = rng((el.seed ?? 5) * 17);
    for (let i = 0; i < 4; i++) {
      const a = corners[i], b = corners[(i + 1) % 4], u = [(b[0] - a[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]), (b[1] - a[1]) / Math.hypot(b[0] - a[0], b[1] - a[1])];
      for (let k = 1; k < 11; k++) {
        if (rr() > 0.3 || (i === 3 && Math.abs(k - 5.5) < 1.6)) continue;
        const p0 = [a[0] + (b[0] - a[0]) * k / 11, a[1] + (b[1] - a[1]) * k / 11], p1 = [a[0] + (b[0] - a[0]) * (k + 1) / 11, a[1] + (b[1] - a[1]) * (k + 1) / 11];
        bag.add(TB, orientedBox(p0, p1, 0.05, 1.98, 2.04, 0));
        for (let q = 0; q < 3; q++) { const t = 0.2 + q * 0.3, c = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]; bag.add(rr() < 0.55 ? 'cloth_ochre' : 'cloth_maroon', orientedBox([c[0] - u[0] * 0.24, c[1] - u[1] * 0.24], [c[0] + u[0] * 0.24, c[1] + u[1] * 0.24], 0.04, 0.95 + rr() * 0.15, 1.98, 0)); }
      }
    }
    const gx = px1 - 1.0, gzz = pz0 + 1.0;
    B(bag, TB, gx - 0.07, 0, gzz - 1.0, gx + 0.07, 2.4, gzz - 0.86); B(bag, TB, gx - 0.07, 0, gzz + 0.86, gx + 0.07, 2.4, gzz + 1.0); B(bag, TB, gx - 0.07, 2.3, gzz - 1.0, gx + 0.07, 2.4, gzz + 1.0);
    B(bag, 'wood_dark', gx - 0.05, 1.5, gzz - 0.5, gx + 0.05, 2.25, gzz + 0.5);
  }
  // the court's paving: a darker way from the gate to the shrine
  bag.add('cotto_floor', frustum([x0 + BLOCK + 2.9, mz - 1.4, sx0 - 0.5, mz + 1.4], 0, 0.02, 0, 0, 0, 0, { noBottom: true }));
}
const rectOf = (p, q, y0, y1) => [Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1])];
const rectOf2 = (p, q) => [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])];

// ── the great temple ────────────────────────────────────────────────────────────
/**
 * A stepped temple { c, y, half, tiers, tierH, shrine (the top shrine with its room), niches, seed }: square tiers, each a wall of brick under a
 * cornice with rows of niches holding stucco Buddhas; a stair up the east faces (a flight on each terrace, one after another); votive
 * stupas on the terraces' corners; on the top a platform with corner towers and the shrine, its doorway east.
 */
function temple(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 0, half = el.half, n = el.tiers, tH = el.tierH, ter = tH * 1.04, r = rng(el.seed ?? 3);
  const hs = [], sw = 3.5;                                   // half-widths of the tiers; the stair's half-width
  for (let k = 0; k < n; k++) hs.push(half - ter * k);
  for (let k = 0; k < n; k++) {
    const h = hs[k], y0 = y + k * tH, y1 = y0 + tH;
    bag.add(BR, frustum([cx - h, cz - h, cx + h, cz + h], y0 - (k === 0 ? 0.4 : 0), y1, 0.06, 0.06, 0.06, 0.06, { noBottom: k === 0 }));
    col.rect([cx - h, cz - h, cx + h, cz + h], y0, y1);
    col.floor([cx - h + 0.1, cz - h + 0.1, cx + h - 0.1, cz + h - 0.1], y1);
    // a plinth moulding at the foot and a cornice at the top, of baked brick, a plaster band between
    B(bag, BRB, cx - h - 0.2, y0, cz - h - 0.2, cx + h + 0.2, y0 + 0.5, cz + h + 0.2);
    B(bag, BRB, cx - h - 0.35, y1 - 0.45, cz - h - 0.35, cx + h + 0.35, y1 - 0.2, cz + h + 0.35);
    B(bag, BR, cx - h - 0.5, y1 - 0.2, cz - h - 0.5, cx + h + 0.5, y1, cz + h + 0.5);
    // the niches, in a row on each face at 3.4 m: a plastered frame, the dark recess, the Buddha seated in it
    if (el.niches !== false) {
      const m = Math.max(2, Math.floor((2 * h - 3) / 3.4));
      for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) for (let i = 0; i < m; i++) {
        const t = -h + 1.5 + (2 * h - 3) * (i + 0.5) / m, px = dz ? cx + t : cx + dx * h, pz = dz ? cz + dz * h : cz + t;
        if (dx === 1 && Math.abs(pz - cz) < sw + 0.7) continue;
        const ny = y0 + 1.25, o = [dx, dz], tx = dz ? 1 : 0, tz = dx ? 1 : 0;
        const pr = (d, w, a, b) => [px + o[0] * d - tx * w, ny + a, pz + o[1] * d - tz * w, px + o[0] * (d + 0.0) + tx * w, ny + b, pz + o[1] * d + tz * w];
        void pr;
        const fw = 0.62;
        bag.add(PL, orientedBox([px - tx * fw + o[0] * 0.03, pz - tz * fw + o[1] * 0.03], [px + tx * fw + o[0] * 0.03, pz + tz * fw + o[1] * 0.03], 0.22, ny - 0.1, ny + 1.65, 0));
        bag.add('opening', orientedBox([px - tx * 0.46 + o[0] * 0.15, pz - tz * 0.46 + o[1] * 0.15], [px + tx * 0.46 + o[0] * 0.15, pz + tz * 0.46 + o[1] * 0.15], 0.1, ny, ny + 1.45, 0));
        buddha(bag, px + o[0] * 0.17, ny, pz + o[1] * 0.17, 0.62, dx === 1 ? 'e' : dx === -1 ? 'w' : dz === 1 ? 's' : 'n', 'stucco_warm', 'stucco_warm');
      }
    }
    // the stair up this tier's east face, on the terrace below (or the ground)
    const x1 = cx + h, xs = k === 0 ? x1 + ter : cx + hs[k - 1];
    flight(ctx, [x1 + 0.12, cz - sw, xs, cz + sw], 'w', y0, y1, y0 - (k === 0 ? 0.5 : tH + 0.05), tH / Math.round(ter / 0.25));
    // the parapet walls beside the flight, stepping with it: a plain wall of brick
    for (const s of [-1, 1]) { const za = s > 0 ? cz + sw + 0.05 : cz - sw - 0.65, zb = za + 0.6; B(bag, BR, x1 + 0.12, y0 - (k === 0 ? 0.5 : 0), za, xs, y0 + 0.9, zb); col.rect([x1 + 0.12, za, xs, zb], y0 - 0.2, y0 + 0.9); }
    // votive stupas at the terrace's corners
    if (k < n - 1) { const hn = hs[k + 1], mid = (h + hn) / 2; for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) votiveStupa(ctx, cx + sx * mid, cz + sz * mid, y1, 0.55 + 0.1 * (n - k)); }
  }
  // the top platform: the shrine in the middle, a tower at each corner
  const ht = hs[n - 1], yt = y + n * tH;
  const corners = ht > 8 ? [[-1, -1], [1, -1], [1, 1], [-1, 1]] : [];
  for (const [sx, sz] of corners) {
    const tx = cx + sx * (ht - 2.5), tz = cz + sz * (ht - 2.5);
    B(bag, BR, tx - 1.5, yt, tz - 1.5, tx + 1.5, yt + 3.6, tz + 1.5); col.rect([tx - 1.5, tz - 1.5, tx + 1.5, tz + 1.5], yt, yt + 3.6);
    B(bag, BRB, tx - 1.7, yt + 3.6, tz - 1.7, tx + 1.7, yt + 3.9, tz + 1.7);
    B(bag, PL, tx - 1.1, yt + 3.9, tz - 1.1, tx + 1.1, yt + 5.0, tz + 1.1);
    B(bag, BR, tx - 0.7, yt + 5.0, tz - 0.7, tx + 0.7, yt + 5.5, tz + 0.7);
    bag.add(BRB, lathe([[0.6, 0], [0.5, 0.3], [0.2, 0.8], [0.001, 1.8]], 8, null, tx, yt + 5.5, tz));
  }
  const sr = Math.min(3.6, ht * 0.45), sh = el.shrineH ?? 5.2;
  B(bag, BRB, cx - sr - 0.5, yt, cz - sr - 0.5, cx + sr + 0.5, yt + 0.4, cz + sr + 0.5);
  const sc = { bag, col };
  if (el.shrine) {
    wallGaps(sc, [cx - sr, cz - sr], [cx + sr, cz - sr], 1.0, yt, yt + sh, [], PL); wallGaps(sc, [cx - sr, cz + sr], [cx - sr, cz - sr], 1.0, yt, yt + sh, [], PL);
    wallGaps(sc, [cx + sr, cz + sr], [cx - sr, cz + sr], 1.0, yt, yt + sh, [], PL);
    wallGaps(sc, [cx + sr, cz - sr], [cx + sr, cz + sr], 1.0, yt, yt + sh, [{ s0: sr - 0.9, s1: sr + 0.9, y0: yt, y1: yt + 3.0 }], PL);
    B(bag, TB, cx + sr - 0.55, yt + 3.0, cz - 1.0, cx + sr + 0.55, yt + 3.2, cz + 1.0);
    buddha(bag, cx - sr + 1.9, yt, cz, 1.9, 'e');
    col.circle(cx - sr + 1.9, cz, 0.7, yt, yt + 2.5);
  } else { B(bag, PL, cx - sr, yt, cz - sr, cx + sr, yt + sh, cz + sr); col.rect([cx - sr, cz - sr, cx + sr, cz + sr], yt, yt + sh); }
  // the shrine's roof: stepped, and a pinnacle
  B(bag, BR, cx - sr - 0.3, yt + sh, cz - sr - 0.3, cx + sr + 0.3, yt + sh + 0.4, cz + sr + 0.3);
  for (let i = 0; i < 4; i++) { const e = 0.3 + i * (sr * 0.6 / 3.4 + 0.45); B(bag, i % 2 ? PL : BR, cx - sr + e, yt + sh + 0.4 + i * 0.9, cz - sr + e, cx + sr - e, yt + sh + 0.4 + (i + 1) * 0.9, cz + sr - e); }
  bag.add(BRB, lathe([[0.7, 0], [0.55, 0.3], [0.5, 0.5], [0.3, 1.1], [0.35, 1.5], [0.2, 2.0], [0.001, 3.2]], 10, null, cx, yt + sh + 4.0, cz));
  void r;
}

// ── the library ─────────────────────────────────────────────────────────────────
/** A tower { c, half: [hx, hz], storeys, hall (a hollow ground hall with shelves; the door east) }: storeys of brick stepping in, slit windows in rows. */
function tower(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, [hx, hz] = el.half, SH = 3.8, n = el.storeys, hall = !!el.hall;
  const sc = { bag, col };
  let k0 = 0;
  if (hall) {
    wallGaps(sc, [cx - hx, cz - hz], [cx + hx, cz - hz], 0.9, -0.1, SH, [{ s0: 3, s1: 3.7, y0: 1.9, y1: 2.9 }, { s0: hx * 2 - 3.7, s1: hx * 2 - 3, y0: 1.9, y1: 2.9 }, { s0: hx - 0.3, s1: hx + 0.3, y0: 1.9, y1: 2.9 }]);
    wallGaps(sc, [cx + hx, cz + hz], [cx - hx, cz + hz], 0.9, -0.1, SH, [{ s0: 3, s1: 3.7, y0: 1.9, y1: 2.9 }, { s0: hx * 2 - 3.7, s1: hx * 2 - 3, y0: 1.9, y1: 2.9 }, { s0: hx - 0.3, s1: hx + 0.3, y0: 1.9, y1: 2.9 }]);
    wallGaps(sc, [cx - hx, cz + hz], [cx - hx, cz - hz], 0.9, -0.1, SH);
    wallGaps(sc, [cx + hx, cz - hz], [cx + hx, cz + hz], 0.9, -0.1, SH, [{ s0: hz - 1.2, s1: hz + 1.2, y0: -0.2, y1: 2.9 }]);
    bag.add(TB, orientedBox([cx + hx, cz - 1.5], [cx + hx, cz + 1.5], 1.0, 2.9, 3.1, 0));
    const SY = SH + 0.3, st = [cx + hx - 3.6, cz + 1.7, cx + hx - 1.8, cz + hz - 0.5];
    if (el.upper) {
      for (const q of subtractRects([cx - hx, cz - hz, cx + hx, cz + hz], [st])) { B(bag, PL, q[0], SH, q[1], q[2], SY, q[3]); col.floor(q, SY); }
      flight(ctx, st, 'n', 0, SY, -0.1, SY / 20, BR);
    } else B(bag, PL, cx - hx, SH, cz - hz, cx + hx, SH + 0.3, cz + hz);
    // shelves of palm-leaf manuscripts along the west wall and the two long walls: posts, shelves, bundles tied in cloth between boards
    const shelf = (a, b, nx, nz, yb = 0) => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
      bag.add(TB, orientedBox(a, b, 0.5, yb, yb + 0.08, 0));
      for (let i = 0; i <= Math.round(L / 2.4); i++) { const s = i * L / Math.round(L / 2.4), p = [a[0] + u[0] * s, a[1] + u[1] * s]; B(bag, TB, p[0] - 0.05, yb, p[1] - 0.05, p[0] + 0.05, yb + 2.3, p[1] + 0.05); }
      for (let row = 0; row < 5; row++) {
        const yy = yb + 0.1 + row * 0.5;
        bag.add(TB, orientedBox(a, b, 0.5, yy, yy + 0.04, 0));
        for (let i = 0; i < Math.floor(L / 0.6); i++) {
          const s = 0.3 + i * 0.6, p = [a[0] + u[0] * s, a[1] + u[1] * s];
          bag.add(i % 3 === 2 ? 'cloth_red' : 'cloth_ochre', orientedBox([p[0] - u[0] * 0.22, p[1] - u[1] * 0.22], [p[0] + u[0] * 0.22, p[1] + u[1] * 0.22], 0.34, yy + 0.04, yy + 0.3, 0));
        }
      }
      col.segment(a, b, 0.5, yb, yb + 2.3);
      void nx; void nz;
    };
    shelf([cx - hx + 0.7, cz - hz + 4], [cx - hx + 0.7, cz + hz - 4], 1, 0);
    shelf([cx - hx + 3, cz - hz + 0.7], [cx + hx - 5, cz - hz + 0.7], 0, 1);
    shelf([cx - hx + 3, cz + hz - 0.7], [cx + hx - 5, cz + hz - 0.7], 0, -1);
    // the copyists' desks: a low desk of timber and a mat, a lamp-stand beside it
    if (el.upper) {
      // the upper hall (reached by the stair at the east end): shelves round the walls, rows of mats with low reading stands
      shelf([cx - hx + 1.7, cz - hz + 4], [cx - hx + 1.7, cz + hz - 4], 1, 0, SY);
      shelf([cx - hx + 3, cz - hz + 1.7], [cx + hx - 5, cz - hz + 1.7], 0, 1, SY);
      shelf([cx - hx + 3, cz + hz - 1.7], [cx + hx - 5, cz + hz - 1.7], 0, -1, SY);
      for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) {
        const dx = cx - 4 + i * 3.4, dz = cz + sz * 2.4;
        B(bag, TB, dx - 0.4, SY + 0.28, dz - 0.3, dx + 0.4, SY + 0.34, dz + 0.3);
        for (const [a, b] of [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]]) B(bag, TB, dx + a - 0.03, SY, dz + b - 0.03, dx + a + 0.03, SY + 0.28, dz + b + 0.03);
        bag.add('reed_mat', orientedBox([dx - 0.7, dz + sz * 0.8], [dx + 0.7, dz + sz * 0.8], 0.7, SY, SY + 0.03, 0));
        bag.add('cloth_red', orientedBox([dx - 0.25, dz], [dx + 0.25, dz], 0.25, SY + 0.34, SY + 0.4, 0));
      }
    }
    for (let i = 0; i < (hx >= 9 ? 4 : 2); i++) for (const sz of [-1, 1]) {
      const dx = cx - 3 + i * 3.2, dz = cz + sz * 2.6;
      B(bag, TB, dx - 0.7, 0.3, dz - 0.35, dx + 0.7, 0.36, dz + 0.35);
      for (const [a, b] of [[-0.6, -0.28], [0.6, -0.28], [-0.6, 0.28], [0.6, 0.28]]) B(bag, TB, dx + a - 0.03, 0, dz + b - 0.03, dx + a + 0.03, 0.3, dz + b + 0.03);
      bag.add('reed_mat', orientedBox([dx - 0.7, dz + sz * 0.9], [dx + 0.7, dz + sz * 0.9], 0.7, 0, 0.03, 0));
      bag.add('cloth_ochre', orientedBox([dx - 0.3, dz], [dx + 0.3, dz], 0.3, 0.36, 0.42, 0));
      col.rect([dx - 0.7, dz - 0.35, dx + 0.7, dz + 0.35], 0, 0.4);
    }
    k0 = 1;
    // the stairs are not built: the upper storeys are shut
  }
  for (let s = k0; s < n; s++) {
    const inset = Math.floor(s / 2) * 0.6, ax = hx - (hall ? 0 : inset), az = hz - (hall ? 0 : inset), y0 = s * SH + (hall && s === 1 ? 0.3 : 0), y1 = (s + 1) * SH + (hall ? 0.3 : 0);
    if (hall && el.upper && s === 1) {
      const e0 = ax - 0.45, e1 = az - 0.45, wh = (len) => { const h = []; for (let q = 1.6; q < len - 1; q += 3.0) h.push({ s0: q - 0.3, s1: q + 0.3, y0: y0 + 1.2, y1: y0 + 2.6 }); return h; };
      wallGaps(sc, [cx - e0, cz - e1], [cx + e0, cz - e1], 0.9, y0, y1 - 0.4, wh(e0 * 2)); wallGaps(sc, [cx + e0, cz + e1], [cx - e0, cz + e1], 0.9, y0, y1 - 0.4, wh(e0 * 2));
      wallGaps(sc, [cx - e0, cz + e1], [cx - e0, cz - e1], 0.9, y0, y1 - 0.4, wh(e1 * 2)); wallGaps(sc, [cx + e0, cz - e1], [cx + e0, cz + e1], 0.9, y0, y1 - 0.4, wh(e1 * 2));
    } else bag.add(BR, frustum([cx - ax, cz - az, cx + ax, cz + az], y0, y1 - 0.4, 0, 0, 0, 0, { noBottom: s === 0 }));
    B(bag, BRB, cx - ax - 0.25, y1 - 0.4, cz - az - 0.25, cx + ax + 0.25, y1 - 0.2, cz + az + 0.25);
    B(bag, PL, cx - ax - 0.15, y1 - 0.2, cz - az - 0.15, cx + ax + 0.15, y1, cz + az + 0.15);
    if (s === 0 && !hall) col.rect([cx - ax, cz - az, cx + ax, cz + az], 0, n * SH);
    if (s === 0 && hall) col.rect([cx - ax, cz - az, cx + ax, cz + az], el.upper ? 7.5 : SH, n * SH + 1);
    // the slit windows
    for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const len = (dz ? ax : az) * 2, m = Math.max(2, Math.floor(len / 2.8));
      for (let i = 0; i < m; i++) {
        const t = -len / 2 + len * (i + 0.5) / m, px = dz ? cx + t : cx + dx * ax, pz = dz ? cz + dz * az : cz + t;
        if (hall && (s === 0 || (el.upper && s === 1))) continue;
        B(bag, 'opening', px - (dz ? 0.25 : 0) + dx * 0.04, y0 + 1.5, pz - (dx ? 0.25 : 0) + dz * 0.04, px + (dz ? 0.25 : 0) + dx * 0.1, y0 + 2.6, pz + (dx ? 0.25 : 0) + dz * 0.1);
      }
    }
  }
  const ny = n * SH + (hall ? 0.3 : 0), inset = Math.floor((n - 1) / 2) * 0.6, ax = hx - (hall ? 0 : inset), az = hz - (hall ? 0 : inset);
  B(bag, BR, cx - ax * 0.6, ny, cz - az * 0.6, cx + ax * 0.6, ny + 1.2, cz + az * 0.6);
  bag.add(BRB, lathe([[0.9, 0], [0.7, 0.4], [0.3, 1.2], [0.4, 1.8], [0.15, 2.6], [0.001, 3.8]], 8, null, cx, ny + 1.2, cz));
}

// ── tank ────────────────────────────────────────────────────────────────────────
/** A tank { rect, level, ghats: [{ side, at, w }] }: its water, a coping of brick round the edge, the ghats' steps down into it. */
function tank(el, ctx) {
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.level;
  const q = [];
  q.push(x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0);
  bag.add('water', fromArray(q));
  for (const g of el.ghats || []) {
    const w = g.w ?? 6;
    if (g.side === 'w') flight(ctx, [x0 - 3.2, g.at - w / 2, x0 + 0.3, g.at + w / 2], 'w', y - 0.4, 0, y - 2.2, 0.2, BR);
    else if (g.side === 'e') flight(ctx, [x1 - 0.3, g.at - w / 2, x1 + 3.2, g.at + w / 2], 'e', y - 0.4, 0, y - 2.2, 0.2, BR);
    else if (g.side === 'n') flight(ctx, [g.at - w / 2, z0 - 3.2, g.at + w / 2, z0 + 0.3], 'n', y - 0.4, 0, y - 2.2, 0.2, BR);
    else flight(ctx, [g.at - w / 2, z1 - 0.3, g.at + w / 2, z1 + 3.2], 's', y - 0.4, 0, y - 2.2, 0.2, BR);
  }
  // the coping: a low band of baked brick round the tank, cut at the ghats
  const m = 3.0, q0 = x0 - m, q1 = x1 + m, r0 = z0 - m, r1 = z1 + m;
  const seg = (a, b, side) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const holes = (el.ghats || []).filter((g) => g.side === side).map((g) => {
      const t0 = g.at - (g.w ?? 6) / 2 - 0.4, t1 = g.at + (g.w ?? 6) / 2 + 0.4, horiz = side === 'n' || side === 's';
      const p0 = horiz ? [t0, a[1]] : [a[0], t0], p1 = horiz ? [t1, a[1]] : [a[0], t1];
      const s0 = (p0[0] - a[0]) * u[0] + (p0[1] - a[1]) * u[1], s1 = (p1[0] - a[0]) * u[0] + (p1[1] - a[1]) * u[1];
      return { s0: Math.min(s0, s1), s1: Math.max(s0, s1), y0: -1, y1: 2 };
    });
    wallGaps({ bag, col: { segment() {} } }, a, b, 0.7, -0.05, 0.32, holes, BRB);
  };
  seg([q0, r1], [q0, r0], 'w'); seg([q1, r0], [q1, r1], 'e'); seg([q0, r0], [q1, r0], 'n'); seg([q1, r1], [q0, r1], 's');
}
const fromArray = (a) => fromTriangles(a);

/** A run of votive stupas { at: [[x, z, s], ...], y }. */
function votives(el, ctx) { for (const [x, z, s] of el.at) votiveStupa(ctx, x, z, el.y ?? 0, s ?? 1); }
/** A low brick wall a→b, height h, thickness th. */
function brickWall(el, ctx) { wallGaps(ctx, el.a, el.b, el.th ?? 0.7, -0.2, el.h ?? 2.6, el.holes || [], BR); if (el.cap !== false) ctx.bag.add(BRB, orientedBox(el.a, el.b, (el.th ?? 0.7) + 0.2, el.h ?? 2.6, (el.h ?? 2.6) + 0.15, 0.1)); }

const D = makeDress({ B, wallGaps, votiveStupa, buddha });
registerStyle('nalanda', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { monastery, temple, tower, tank, votives, brick_wall: brickWall, ...D },
  objects: {},
});
